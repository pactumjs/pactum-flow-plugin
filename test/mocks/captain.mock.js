const { addInteractionHandler } = require('pactum').handler;
const { like } = require('pactum-matchers');

addInteractionHandler('create a session', () => {
  return {
    request: {
      method: 'POST',
      path: '/api/flow/captain/v1/session',
      headers: {
        authorization: like('Basic')
      }
    },
    response: {
      status: 200,
      body: {
        token: 'abc'
      }
    }
  }
});