# pactum-flow-plugin

plugin to publish flows, interactions &amp; run contract tests locally

## Usage

```js

const pf = require('pactum-flow-plugin');
const { reporter } = require('pactum');

// global before block
before(() => {
  pf.config.url = '<pactum-flow-server-url>';
  pf.config.projectId = '<unique-project-id>';
  pf.config.projectName = '<unique-project-name>';
  pf.config.version = '<unique-project-version>';
  pf.config.token = '<auth-token>';
  // no.of flows/interactions to upload at a single instance
  pf.config.batchSize = 10;  // optional (defaults to 10)
  reporter.add(pf.reporter);
});

// global after block
after(async () => {
  await reporter.end();
});

```