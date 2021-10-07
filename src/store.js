const fs = require('fs');
const path = require('path');
const config = require('./config');

const specs = [];
const interactions = [];

function getRootDir() {
  return typeof config.dir === 'string' ? config.dir : `./.pactum/contracts/`;
}

function writeFile(data, type) {
  const rootDir = getRootDir();
  let dir;
  if (type === 'flows') {
    dir = rootDir + `/flows/${data.name}.json`;
  } else {
    dir = rootDir + `/interactions/${data.provider}-${data.flow}.json`;
  }
  const folder = path.dirname(dir);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(path.dirname(dir), { recursive: true });
  }
  fs.writeFileSync(dir, JSON.stringify(data, null, 2));
}

function addSpec(spec) {
  const { flow, request, response } = spec;
  if (flow) {
    const _interactions = [];
    for (let i = 0; i < spec.interactions.length; i++) {
      const { provider, flow, strict, request, response } = spec.interactions[i];
      if (provider && flow && strict) {
        _interactions.push({ provider, flow, strict, request, response });
      }
    }
    const _flow = { name: flow, request, response, interactions: _interactions };
    if (config.dir) {
      writeFile(_flow, 'flows');
    } else {
      specs.push(_flow);
    }
  }
}

function getFlows() {
  // update interactions with ids
  const flows = [];
  const flowSet = new Set();
  const dir = getRootDir() + '/flows/';
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for(let i = 0; i < files.length; i++) {
      specs.push(require(process.cwd() + `/${dir}/${files[i]}`));
    }
  }
  specs.forEach(spec => {
    if (flowSet.has(spec.name)) {
      console.log(`Duplicate Flow - ${spec.name}`);
    } else {
      flowSet.add(spec.name);
      flows.push(spec);
    }
  });
  return flows;
}

function addInteraction(interaction) {
  const { provider, flow, strict, request, response } = interaction;
  if (provider && flow && strict) {
    const _interaction = { provider, flow, strict, request, response };
    if (config.dir) {
      writeFile(_interaction, 'interactions');
    } else { 
      interactions.push(_interaction);
    }
  }
}

function getInteractions() {
  const contracts = [];
  const contractSet = new Set();
  const dir = getRootDir() + '/interactions/';
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for(let i = 0; i < files.length; i++) {
      interactions.push(require(process.cwd() + `/${dir}/${files[i]}`));
    }
  }
  interactions.forEach(interaction => {
    const key = `${interaction.provider}::${interaction.flow}`;
    if (!contractSet.has(key)) {
      contractSet.add(key);
      contracts.push(interaction);
    }
  });
  return contracts;
}

function reset() {
  specs.length = 0;
  interactions.length = 0;
}

module.exports = {
  addSpec,
  getFlows,
  addInteraction,
  getInteractions,
  reset
}