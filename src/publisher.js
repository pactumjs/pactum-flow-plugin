const phin = require('phin');
const config = require('./config');
const store = require('./store');

function validate() {
  if (!config.projectId) throw '`ProjectId` is required';
  if (!config.projectName) throw '`ProjectName` is required';
  if (!config.version) throw '`Version` is required';
  if (!config.url) throw '`Url` is required';
  if (!config.token) throw '`Token` is required';
}

async function createProject() {
  const getResponse = await phin({
    method: 'GET',
    url: `${config.url}/api/flow/v1/projects/${config.projectId}`,
    headers: {
      'x-auth-token': config.token
    }
  });
  if (getResponse.statusCode !== 200) {
    const postResponse = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/v1/projects`,
      data: {
        id: config.projectId,
        name: config.projectName
      },
      headers: {
        'x-auth-token': config.token
      }
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
    headers: {
      'x-auth-token': config.token
    }
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
    return responses.map(response => JSON.parse(response.body));
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
    headers: {
      'x-auth-token': config.token
    }
  });
  if (response.statusCode !== 202) {
    console.log(Buffer.from(response.body).toString());
    throw 'Process Failed';
  }
}

async function publish() {
  validate();
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

async function upload(items, url) {
  const promises = [];
  const size = config.batchSize
  for (let i = 0; i < items.length; i += size) {
    const itemsSubset = items.slice(i, i + size);
    promises.push(phin({
      method: 'POST',
      url,
      data: itemsSubset,
      headers: {
        'x-auth-token': config.token
      }
    }));
  }
  return await Promise.all(promises);
}

module.exports = {
  publish
}