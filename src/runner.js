const { publish } = require('./publisher');
const { setSessionToken } = require('./session');
const { validate } = require('./helper');
const { generateXMLReport } = require('./junit');
const { checkQualityGate, getQualityGateResults } = require('./quality');
const config = require('./config');

async function run() {
  let results;
  validate();
  await setSessionToken();
  await publish();
  if (config.checkQualityGate || config.jUnitReporter) {
    results = await getQualityGateResults();
  }
  generateXMLReport(results);
  checkQualityGate(results);
}

module.exports = {
  run
}