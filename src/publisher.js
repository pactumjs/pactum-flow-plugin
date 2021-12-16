const phin = require('phin');
const config = require('./config');
const store = require('./store');

let session_token = '';

function validate() {
  if (!config.publish) return;
  if (!config.projectId) throw '`projectId` is required';
  if (!config.projectName) throw '`projectName` is required';
  if (!config.version) throw '`version` is required';
  if (!config.url) throw '`url` is required';
  if (config.username) {
    if (!config.password) throw '`password` is required';
  } else {
    if (!config.token) throw '`token` is required';
  }
}

async function setSessionToken() {
  if (config.username) {
    const res = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/captain/v1/session`,
      core: {
        auth: `${config.username}:${config.password}`
      },
      parse: 'json'
    });
    if (res.statusCode !== 200) {
      console.log(res.body);
      throw 'Failed to authenticate with flows server';
    }
    session_token = res.body.token;
  }
}

function getHeaders() {
  if (session_token) {
    return { 'x-session-token': session_token };
  } else {
    return { 'x-auth-token': config.token };
  }
}

async function createProject() {
  const getResponse = await phin({
    method: 'GET',
    url: `${config.url}/api/flow/v1/projects/${config.projectId}`,
    headers: getHeaders()
  });
  if (getResponse.statusCode !== 200) {
    const postResponse = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/v1/projects`,
      data: {
        id: config.projectId,
        name: config.projectName
      },
      headers: getHeaders()
    });
    if (postResponse.statusCode !== 200) {
      console.log(Buffer.from(postResponse.body).toString());
      throw 'Project Creation Failed';
    }
  }
}

async function createAnalysis() {
  const response = await phin({
    method: 'POST',
    url: `${config.url}/api/flow/v1/analyses`,
    data: {
      projectId: config.projectId,
      branch: 'main',
      version: config.version
    },
    headers: getHeaders()
  });
  if (response.statusCode !== 200) {
    console.log(Buffer.from(response.body).toString());
    throw 'Analysis Creation Failed';
  }
  return JSON.parse(response.body)._id;
}

async function uploadInteractions(id, interactions) {
  if (interactions.length > 0) {
    interactions.forEach(interaction => {
      interaction.analysisId = id;
      // field names cannot contain $ or .  => MongoDB
      interaction.request.matchingRules = interaction.request.matchingRules;
      interaction.response.matchingRules = interaction.response.matchingRules;
      interaction.response.statusCode = interaction.response.status;
    });
    const responses = await upload(interactions, `${config.url}/api/flow/v1/interactions`);
    const invalidResponse = responses.find(response => response.statusCode !== 200);
    if (invalidResponse) {
      console.log(Buffer.from(invalidResponse.body).toString());
      throw 'Uploading Interactions Failed';
    }
    let interactionResponses = [];
    responses.forEach(response => {
      interactionResponses = interactionResponses.concat(JSON.parse(response.body));
    });
    return interactionResponses;
  }
  return [];
}

async function uploadFlows(id, flows, interactions) {
  if (flows.length > 0) {
    flows.forEach(flow => {
      flow.analysisId = id
      if (flow.interactions.length > 0) {
        const ids = [];
        for (let i = 0; i < flow.interactions.length; i++) {
          const flowInteraction = flow.interactions[i];
          const match = interactions.find(interaction => interaction.provider === flowInteraction.provider && interaction.flow === flowInteraction.flow);
          if (match && match._id) {
            ids.push(match._id);
          }
        }
        flow.interactions = ids;
      }
    });
    const responses = await upload(flows, `${config.url}/api/flow/v1/flows`);
    const invalidResponse = responses.find(response => response.statusCode !== 200);
    if (invalidResponse) {
      console.log(Buffer.from(invalidResponse.body).toString());
      throw 'Uploading Flows Failed';
    }
  }
}

async function process(id) {
  const response = await phin({
    method: 'POST',
    url: `${config.url}/api/flow/v1/process/analysis`,
    data: { id },
    headers: getHeaders()
  });
  if (response.statusCode !== 202) {
    console.log(Buffer.from(response.body).toString());
    throw 'Process Failed';
  }
}

async function publish() {
  if (config.publish) {
    validate();
    await setSessionToken();
    const flows = store.getFlows();
    const interactions = store.getInteractions();
    if (flows.length > 0 || interactions.length > 0) {
      await createProject();
      const id = await createAnalysis();
      const _interactions = await uploadInteractions(id, interactions);
      await uploadFlows(id, flows, _interactions);
      await process(id);
    } else {
      console.log('No Flows/Interactions to publish');
    }
  }
}

async function upload(items, url) {
  const size = config.batchSize;
  let responses = [];
  for (let i = 0; i < items.length; i += size) {
    const itemsSubset = items.slice(i, i + size);
    responses = responses.concat(await phin({
      method: 'POST',
      url,
      data: itemsSubset,
      headers: getHeaders()
    }));
  }
  return responses;
}

module.exports = {
  publish
}