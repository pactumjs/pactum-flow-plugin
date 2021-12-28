const store = require('./store');
const { run } = require('./runner');

function afterSpec(spec) {
  store.addSpec(spec);
}

function afterInteraction(interaction) {
  store.addInteraction(interaction);
}

async function end() {
  await run();
}

module.exports = {
  afterSpec,
  afterInteraction,
  end
}