const specs = [];
const interactions = [];

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
    specs.push({ name: flow, request, response, interactions: _interactions });
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
    interactions.push({ provider, flow, strict, request, response });
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