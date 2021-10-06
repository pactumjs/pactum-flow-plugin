const fs = require('fs');
const path = require('path');
const config = require('./config');

const specs = [];
const interactions = [];

function writeFile(data, type) {
  const ms = new Date().getTime();
  const suffix = (Math.random() + 1).toString(36).substring(7);
  const dir = typeof config.dir === 'string' ? config.dir : `./.pactum/contracts/${type}/${ms}-${suffix}.json`;
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