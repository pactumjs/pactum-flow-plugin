const { bold } = require('kleur');
const phin = require('phin');
const request = require('phin-retry');
const config = require('./config');
const store = require('./store');
const { getHeaders } = require('./helper');

async function createProject() {
  console.log("Creating Project");
  try {
    await request.get({
      url: `${config.url}/api/flow/v1/projects/${config.projectId}`,
      headers: getHeaders()
    });
  } catch (error) {
    await request.post({
      url: `${config.url}/api/flow/v1/projects`,
      body: {
        id: config.projectId,
        name: config.projectName
      },
      headers: getHeaders()
    });
  }
}

async function createAnalysis() {
  console.log("Creating Analysis");
  const res = await request.post({
    url: `${config.url}/api/flow/v1/analyses`,
    body: {
      projectId: config.projectId,
      branch: 'main',
      version: config.version
    },
    headers: getHeaders()
  });
  return res._id;
}

async function uploadInteractions(id, interactions) {
  console.log("Uploading Interactions");
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
  console.log("Uploading Flows");
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
  console.log("Processing Analysis");
  await request.post({
    url: `${config.url}/api/flow/v1/process/analysis`,
    body: { id },
    headers: getHeaders()
  });
}

function print() {
  console.log();
  console.log(bold().underline().cyan(`Publishing "${config.projectId}" with version "${config.version}"`));
  console.log();
}

async function publish() {
  if (!config.publish) {
    return;
  }
  print();
  const flows = store.getFlows();
  const interactions = store.getInteractions();
  if (flows.length > 0 || interactions.length > 0) {
    await createProject();
    const id = await createAnalysis();
    config._analysis_id = id;
    const _interactions = await uploadInteractions(id, interactions);
    await uploadFlows(id, flows, _interactions);
    await process(id);
  } else {
    console.log('No Flows/Interactions to publish');
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