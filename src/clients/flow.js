const request = require('phin-retry');
const { getHeaders, sleep } = require('../helper');
const config = require('../config');

async function waitForJobToFinish() {
  console.log("Waiting for analysis to process")
  await sleep(config.checkQualityGateDefaultDelay);
  const res = await request.get({
    url: `${config.url}/api/flow/v1/jobs/${config._analysis_id}`,
    headers: getHeaders(),
    parse: 'json',
    retry: config.checkQualityGateTimeout / 1000,
    delay: 1000,
    retryStrategy: ({ response, error }) => {
      if (error) return true;
      if (response.body.status === 'running') return true;
    }
  });
  if (res.status === 'failed') {
    console.log(`Job with id - "${config._analysis_id}" failed to complete`);
    throw "Job Failed";
  }
  if (res.status === 'running') {
    console.log(`Job with id - "${config._analysis_id}" is still running`);
    throw "Job is still running";
  }
}

function getQualityGateStatus() {
  return request.get({
    url: `${config.url}/api/flow/v1/quality-gate/status`,
    qs: {
      projectId: config.projectId,
      version: config.version
    },
    headers: getHeaders(),
    parse: 'json'
  });
}

function verifyQualityGateStatus(results, environments) {
  return request.post({
    url: `${config.url}/api/flow/v1/quality-gate/status/verify`,
    headers: getHeaders(),
    body: {
      "projectId": config.projectId,
      "environments": environments,
      "compatibility_results": results
    }
  });
}

function verifyCompatibility(flows, interactions, environments) {
  interactions.forEach(_interaction => {
    _interaction.analysisId = "abcdefghijklmnopqrstuvwx";
    _interaction.response.statusCode = _interaction.response.status;
  });
  flows.forEach(_flow => {
    _flow.analysisId = "abcdefghijklmnopqrstuvwx";
  });
  return request.post({
    url: `${config.url}/api/flow/v1/compatibility/project/verify`,
    headers: getHeaders(),
    body: {
      "projectId": config.projectId,
      "environments": environments,
      "interactions": interactions,
      "flows": flows
    }
  });
}

module.exports = {
  waitForJobToFinish,
  getQualityGateStatus,
  verifyQualityGateStatus,
  verifyCompatibility
}