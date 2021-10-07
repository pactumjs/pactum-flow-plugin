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

### Options

| option        | type    | description                   | others                            |
|---------------|---------|-------------------------------|-----------------------------------|
| `url`         | string  | pactum flow server url        | required (*if publish is `true`*) |
| `projectId`   | string  | unique project id             | required (*if publish is `true`*) |
| `projectName` | string  | unique project name           | required (*if publish is `true`*) |
| `version`     | string  | unique project version        | required (*if publish is `true`*) |
| `token`       | string  | auth token                    | required (*if publish is `true`*) |
| `batchSize`   | number  | pactum flow server url        | defaults to `10`                  |
| `publish`     | boolean | enable publishing contracts   | defaults to `true`                |
| `dir`         | boolean | save contracts in fs          | defaults to `false`               |
| `dir`         | string  | save contracts in custom path | defaults to `.pactum/contracts/`  |
