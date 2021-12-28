const config = require('./config');

function getHeaders() {
  if (config._session_token) {
    return { 'x-session-token': config._session_token };
  } else {
    return { 'x-auth-token': config.token };
  }
}

function validate() {
  if (config.publish) {
    if (!config.projectId) throw '`projectId` is required';
    if (!config.projectName) throw '`projectName` is required';
    if (!config.version) throw '`version` is required';
    if (!config.url) throw '`url` is required';
    if (config.username) {
      if (!config.password) throw '`password` is required';
    } else {
      if (!config.token) throw '`token` is required';
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  validate,
  getHeaders,
  sleep
}