const request = require('phin-retry');
const config = require('./config');

async function setSessionToken() {
  if (config.username && config.password) {
    try {
      const res = await request.post({
        url: `${config.url}/api/flow/captain/v1/session`,
        core: {
          auth: `${config.username}:${config.password}`
        },
        parse: 'json'
      });
      config._session_token = res.token;
    } catch (error) {
      console.log(error);
      throw 'Failed to authenticate with flows server';
    }
  }
}

module.exports = {
  setSessionToken
}