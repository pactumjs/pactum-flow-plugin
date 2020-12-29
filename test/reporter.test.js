const suite = require('uvu').suite;
const assert = require('assert');
const pactum = require('pactum');
const { reporter, mock } = pactum;

const { reset } = require('../src/store');

const test1 = suite('Reporter - No Flows & No Contracts');

test1.before(async () => {
  mock.addInteraction('get project');
  mock.addInteraction('create analysis');
  mock.addInteraction('run process');
  await mock.start();
});

test1.after(async () => {
  reset();
  mock.clearInteractions();
  await mock.stop();
});

test1('spec', async () => {
  await pactum.spec()
    .get('/api/get')
    .useInteraction({
      request: {
        method: 'GET',
        path: '/api/get'
      },
      response: {
        status: 200
      }
    })
    .expectStatus(200);
});

test1('end reporter', async () => {
  await reporter.end();
  assert.strictEqual(mock.getInteraction('get project').exercised, false);
  assert.strictEqual(mock.getInteraction('create analysis').exercised, false);
  assert.strictEqual(mock.getInteraction('run process').exercised, false);
});

test1.run();

const test2 = suite('Reporter - One Contract');

test2.before(async () => {
  mock.addInteraction('get project');
  mock.addInteraction('create analysis');
  mock.addInteraction('add interaction');
  mock.addInteraction('run process');
  await mock.start();
});

test2.after(async () => {
  reset();
  mock.clearInteractions();
  await mock.stop();
});

test2('spec with valid contract', async () => {
  await pactum.spec()
    .get('/api/get')
    .useInteraction({
      provider: 'provider1',
      flow: 'flow1',
      request: {
        method: 'GET',
        path: '/api/get'
      },
      response: {
        status: 200
      }
    })
    .expectStatus(200);
});

test2('end reporter', async () => {
  await reporter.end();
  assert.strictEqual(mock.getInteraction('get project').exercised, true);
  assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
  assert.strictEqual(mock.getInteraction('add interaction').exercised, true);
  assert.strictEqual(mock.getInteraction('run process').exercised, true);
});

test2.run();

const test3 = suite('Reporter - One Flow');

test3.before(async () => {
  mock.addInteraction('get project');
  mock.addInteraction('create analysis');
  mock.addInteraction('add flow');
  mock.addInteraction('run process');
  await mock.start();
});

test3.after(async () => {
  reset();
  mock.clearInteractions();
  await mock.stop();
});

test3('flow', async () => {
  await pactum.flow('flow get')
    .get('/api/get')
    .useInteraction({
      request: {
        method: 'GET',
        path: '/api/get'
      },
      response: {
        status: 200
      }
    })
    .expectStatus(200);
});

test3('end reporter', async () => {
  await reporter.end();
  assert.strictEqual(mock.getInteraction('get project').exercised, true);
  assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
  assert.strictEqual(mock.getInteraction('add flow').exercised, true);
  assert.strictEqual(mock.getInteraction('run process').exercised, true);
});

test3.run();

const test4 = suite('Reporter - One Flow with valid interaction');

test4.before(async () => {
  mock.addInteraction('get project');
  mock.addInteraction('create analysis');
  mock.addInteraction('add interaction with flow');
  mock.addInteraction('add flow with interaction');
  mock.addInteraction('run process');
  await mock.start();
});

test4.after(async () => {
  reset();
  mock.clearInteractions();
  await mock.stop();
});

test4('flow', async () => {
  await pactum.flow('flow get')
    .get('/api/get')
    .useInteraction({
      provider: 'provider1',
      flow: 'flow get',
      request: {
        method: 'GET',
        path: '/api/get'
      },
      response: {
        status: 200
      }
    })
    .expectStatus(200);
});

test4('end reporter', async () => {
  await reporter.end();
  assert.strictEqual(mock.getInteraction('get project').exercised, true);
  assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
  assert.strictEqual(mock.getInteraction('add interaction with flow').exercised, true);
  assert.strictEqual(mock.getInteraction('add flow with interaction').exercised, true);
  assert.strictEqual(mock.getInteraction('run process').exercised, true);
});

test4.run();