const store = require('./store');
const { publish } = require('./publisher');

function afterSpec(spec) {
  store.addSpec(spec);
}

function afterInteraction(interaction) {
  store.addInteraction(interaction);
}

function end() {
  return publish()
}

module.exports = {
  afterSpec,
  afterInteraction,
  end
}