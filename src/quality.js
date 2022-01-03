const { bold, red, green, magenta } = require('kleur');
const request = require('phin-retry');
const config = require('./config');
const { getHeaders, sleep } = require('./helper');
const store = require('./store');

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

function check(results) {
  let allPassed = true;
  let envs = new Set();
  if (config.checkQualityGateEnvironments) {
    if (typeof config.checkQualityGateEnvironments === 'string') {
      envs = new Set(config.checkQualityGateEnvironments.split(','));
    } else {
      envs = new Set(config.checkQualityGateEnvironments);
    }
  } else {
    envs = new Set(results.map(result => result.environment));
  }
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (envs.has(result.environment)) {
      console.log();
      if (result.status === 'OK')  {
        console.log(green(`Quality Gate Status in environment "${result.environment}" is "${result.status}"`));
      } else {
        console.log(red(`Quality Gate Status in environment "${result.environment}" is "${result.status}"`));
        printFailures(result);
        allPassed = false;
      }
    }
  }
  if (!allPassed) {
    throw 'Quality Gate Status Failed';
  }

}

function printFailures(result) {
  printNetworkFailure(result.consumers, 'consumers');
  printNetworkFailure(result.providers, 'providers');
}

function printNetworkFailure(projects, category) {
  const areProjectsFailed = projects.some((project) => {
    return project.status === 'FAILED' || project.status === 'ERROR';
  });
  if (areProjectsFailed) {
    console.log();
    console.log(magenta(`${category.toUpperCase()} FAILURES`));
    console.log();
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      if (project.status === 'FAILED' || project.status === 'ERROR') {
        console.table({ name: project.name, version: project.version, status: project.status, message: project.message });
        if (project.status === 'FAILED') {
          console.table(project.exceptions);
        }
        console.log();
      }
    }
  }
}

function print() {
  console.log();
  console.log(bold().underline().cyan(`Checking Quality Gate of "${config.projectId}"`));
  console.log();
}

function getEnvironments() {
  let envs = config.checkQualityGateEnvironments;
  if (typeof config.checkQualityGateEnvironments === 'string') {
    if (config.checkQualityGateEnvironments) {
      envs = config.checkQualityGateEnvironments.split(',');
    } else {
      envs = [];
    }
  }
  return envs;
}

function verifyCompatibility() {
  const interactions = store.getInteractions();
  interactions.forEach(_interaction => {
    _interaction.analysisId = "abcdefghijklmnopqrstuvwx";
    _interaction.response.statusCode = _interaction.response.status;
  });

  const flows = store.getFlows();
  flows.forEach(_flow => {
    _flow.analysisId = "abcdefghijklmnopqrstuvwx";
  });
  return request.post({
    url: `${config.url}/api/flow/v1/compatibility/project/verify`,
    headers: getHeaders(),
    body: {
      "projectId": config.projectId,
      "environments": getEnvironments(),
      "interactions": interactions,
      "flows": flows
    }
  });
}

function verifyQualityGateStatus(results) {
  return request.post({
    url: `${config.url}/api/flow/v1/quality-gate/status/verify`,
    headers: getHeaders(),
    body: {
      "projectId": config.projectId,
      "environments": getEnvironments(),
      "compatibility_results": results
    }
  });
}

async function checkQualityGate() {
  if (!config.checkQualityGate) {
    return;
  }
  print();
  if (config.checkQualityGateLocal) {
    const results = await verifyCompatibility();
    check(await verifyQualityGateStatus(results));
  } else {
    await waitForJobToFinish();
    check(await getQualityGateStatus());
  }
}

module.exports = { checkQualityGate };
