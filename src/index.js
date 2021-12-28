const config = require('./config');
const reporter = require('./reporter');
const runner = require('./runner');

function run() {
  return runner.run();
}

module.exports = {
  config,
  reporter,
  run
}