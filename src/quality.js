const { bold, red, green, magenta, gray, yellow } = require('kleur');
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
      console.log(`Quality Gate Status in environment "${result.environment}" is "${result.status}"`);
      if (result.status !== 'OK')  {
        allPassed = false;
      }
      printCompatibilityResults(result.consumers, 'Consumer');
      printCompatibilityResults(result.providers, 'Provider')
    }
  }
  if (!allPassed) {
    throw 'Quality Gate Status Failed';
  }
}

function printCompatibilityResults(results, result_type) {
  const space = '  ';
  console.log(gray(`${result_type} Results`));
  if (results.length === 0) {
    console.log(space + yellow('!') + ` No ${result_type} Results Found`);
  }
  for(let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'FAILED' || result.status === 'ERROR') {
      console.log(space + red('X') + ` ${result.name} ${result.version}`);
      const more_space = space + space;
      if (result.status === 'ERROR') {
        console.log(more_space + result.message);
      } else {
        const exceptions = result.exceptions;
        for(let j = 0; j < exceptions.length; j++) {
          const exception = exceptions[j];
          console.log(more_space + exception.flow);
          console.log(more_space + magenta('↪ ') + exception.error);
        }
      }
    } else {
      console.log(space + green('✓') + ` ${result.name} ${result.version}`);
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
