const request = require('phin-retry');
const config = require('./config');
const { getHeaders, sleep } = require('./helper');

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
      console.log(`== Quality Gate Status in environment "${result.environment}" is "${result.status}" ==`);
      console.log();
      if (result.status !== 'OK') {
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
    console.log(`*** ${category.toUpperCase()} FAILURES ***`);
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

async function checkQualityGate() {
  if (!config.checkQualityGate) {
    return;
  }
  print();
  await waitForJobToFinish();
  check(await getQualityGateStatus());
}

function print() {
  console.log();
  console.log("***************************************************************************");
  console.log(`*  Checking Quality Gate of "${config.projectId}" with version "${config.version}"`);
  console.log("***************************************************************************");
  console.log();
}

module.exports = { checkQualityGate };