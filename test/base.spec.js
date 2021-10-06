const { reporter, request, mock } = require('pactum');

function addReporter() {
  const pfr = require('../src/index');
  pfr.config.projectId = 'pid';
  pfr.config.projectName = 'pname';
  pfr.config.url = 'http://localhost:9393';
  pfr.config.version = '1.0.0';
  pfr.config.token = 'xyz';
  reporter.add(pfr.reporter);
}

function loadMocks() {
  require('./mocks/flow.mock');
}

before(async () => {
  request.setBaseUrl('http://localhost:9393');
  addReporter();
  loadMocks();
  await mock.start();
});

after(async () => {
  await mock.stop();
});