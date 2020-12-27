const specs = [];
const interactions = [];

function addSpec(spec) {
  specs.push(spec);
}

function getFlows() {
  // update interactions with ids
  const flows = [];
  const flowSet = new Set();
  const specFlows = specs.filter(spec => spec.flow);
  specFlows.forEach(spec => {
    if (flowSet.has(spec.flow)) {
      // get pactum logger & print duplicate message
    } else {
      spec.name = spec.flow;
      flowSet.add(spec.flow);
      flows.push(spec);
    }
  });
  return flows;
}

function addInteraction(interaction) {
  interactions.push(interaction);
}

function getInteractions() {
  const contracts = [];
  const contractSet = new Set();
  const _interactions = interactions.filter(interaction => interaction.provider && interaction.flow);
  _interactions.forEach(interaction => {
    const key = `${interaction.provider}::${interaction.flow}`;
    if (contractSet.has(key)) {
      // get pactum logger & print duplicate message
    } else {
      contractSet.add(key);
      contracts.push(interaction);
    }
  });
  return contracts;
}

module.exports = {
  addSpec,
  getFlows,
  addInteraction,
  getInteractions
}