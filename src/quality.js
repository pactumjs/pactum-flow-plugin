const { bold, red, green, magenta, gray, yellow } = require('kleur');
const config = require('./config');
const store = require('./store');
const { waitForJobToFinish, getQualityGateStatus, verifyCompatibility, verifyQualityGateStatus} = require('./clients/flow')

function check(results) {
  let allPassed = true;
  const envs = new Set(getEnvironments(results.map(result => result.environment)));
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

function getEnvironments(default_envs = []) {
  let envs = config.checkQualityGateEnvironments;
  if (typeof config.checkQualityGateEnvironments === 'string') {
    if (config.checkQualityGateEnvironments) {
      envs = config.checkQualityGateEnvironments.split(',');
    } else {
      envs = default_envs;
    }
  }
  return envs;
}

function checkQualityGate(results) {
  if (!config.checkQualityGate) {
    return;
  }
  print();
  check(results);
}

async function getQualityGateResults() {
  if (config.checkQualityGateLocal) {
    const results = await verifyCompatibility(store.getFlows(), store.getInteractions(), getEnvironments());
    return await verifyQualityGateStatus(results, getEnvironments());
  } else {
    await waitForJobToFinish();
    return await getQualityGateStatus();
  }
}

module.exports = { checkQualityGate, getQualityGateResults };
