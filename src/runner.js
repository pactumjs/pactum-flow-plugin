const { publish } = require('./publisher');
const { setSessionToken } = require('./session');
const { validate } = require('./helper');
const { checkQualityGate } = require('./quality');

async function run() {
  validate();
  await setSessionToken();
  await publish();
  await checkQualityGate();
}

module.exports = {
  run
}