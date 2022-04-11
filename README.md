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
  pf.config.username = '<username>';
  pf.config.password = '<password>';
  reporter.add(pf.reporter);
});

// global after block
after(async () => {
  await reporter.end();
});

```

### Options

| option                         | type    | description                                   | others                            |
|--------------------------------|---------|-----------------------------------------------|-----------------------------------|
| `url`                          | string  | pactum flow server url                        | required (*if publish is `true`*) |
| `projectId`                    | string  | unique project id                             | required (*if publish is `true`*) |
| `projectName`                  | string  | unique project name                           | required (*if publish is `true`*) |
| `version`                      | string  | unique project version                        | required (*if publish is `true`*) |
| `token`                        | string  | auth token                                    | required (*if publish is `true`*) |
| `username`                     | string  | scanner username                              | required (*if token is `empty`*)  |
| `password`                     | string  | scanner password                              | required (*if token is `empty`*)  |
| `batchSize`                    | number  | pactum flow server url                        | defaults to `10`                  |
| `publish`                      | boolean | enable publishing contracts                   | defaults to `true`                |
| `dir`                          | boolean | save contracts in fs                          | defaults to `false`               |
| `dir`                          | string  | save contracts in custom path                 | defaults to `.pactum/contracts/`  |
| `checkQualityGate`             | boolean | check quality gate                            | defaults to `false`               |
| `checkQualityGateLocal`        | boolean | check quality gate locally without publishing | defaults to `false`               |
| `checkQualityGateTimeout`      | number  | check quality gate timeout                    | defaults to `10000`ms             |
| `checkQualityGateEnvironments` | string  | check quality gate against the given envs     | defaults to all envs              |
| `checkQualityGateDefaultDelay` | number  | default delay to wait for processing analysis | defaults to `2000`ms              |
| `jUnitReporter`                | boolean | enable jUnit reporter                         | defaults to false                 |
| `jUnitReporterPath`            | string  | junit reporter path                           | defaults to `contract-tests`      |

