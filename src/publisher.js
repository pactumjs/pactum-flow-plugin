const phin = require('phin');
const config = require('./config');
const store = require('./store');

function validate() {
  if (!config.projectId) throw '`ProjectId` is required';
  if (!config.projectName) throw '`ProjectName` is required';
  if (!config.version) throw '`Version` is required';
  if (!config.url) throw '`Url` is required';
}

async function createProject() {
  const getResponse = await phin({
    method: 'GET',
    url: `${config.url}/api/flow/v1/projects/${config.projectId}`
  });
  if (getResponse.statusCode !== 200) {
    const postResponse = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/v1/projects`,
      data: {
        id: config.projectId,
        name: config.projectName
      }
    });
    if (postResponse.statusCode !== 200) {
      // log error
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
    }
  });
  if (response.statusCode !== 200) {
    // log error
    throw 'Analysis Creation Failed';
  }
  return JSON.parse(response.body)._id;
}

async function uploadInteractions(id) {
  const interactions = store.getInteractions();
  if (interactions.length > 0) {
    interactions.forEach(interaction => interaction.analysisId = id);
    const response = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/v1/interactions`,
      data: interactions
    });
    if (response.statusCode !== 200) {
      // log error
      throw 'Uploading Interactions Failed';
    }
  }
}

async function uploadFlows(id) {
  const flows = store.getFlows();
  if (flows.length > 0) {
    flows.forEach(flow => flow.analysisId = id);
    const response = await phin({
      method: 'POST',
      url: `${config.url}/api/flow/v1/flows`,
      data: flows
    });
    if (response.statusCode !== 200) {
      // log error
      throw 'Uploading Flows Failed';
    }
  }
}

async function process(id) {
  const response = await phin({
    method: 'POST',
    url: `${config.url}/api/flow/v1/process/analysis`,
    data: { id }
  });
  if (response.statusCode !== 202) {
    // log error
    throw 'Process Failed';
  }
}

async function publish() {
  validate();
  await createProject();
  const id = await createAnalysis();
  await uploadInteractions(id);
  await uploadFlows(id);
  await process(id);
  console.log('Finished Publishing')
}

module.exports = {
  publish
}