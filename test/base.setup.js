const { reporter, request } = require('pactum');

request.setBaseUrl('http://localhost:9393');

const pfr = require('../src/index');

pfr.config.projectId = 'pid';
pfr.config.projectName = 'pname';
pfr.config.url = 'http://localhost:9393';
pfr.config.version = '1.0.0';
reporter.add(pfr.reporter);