const { addInteractionHandler } = require('pactum').handler;
const { like } = require('pactum-matchers');

addInteractionHandler('get project', () => {
  return {
    id: 'get project',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/projects/{id}',
      pathParams: {
        id: 'pid'
      }
    },
    response: {
      status: 200
    }
  }
});

addInteractionHandler('create analysis', () => {
  return {
    id: 'create analysis',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/analyses',
      body: {
        "projectId": "pid",
        "branch": "main",
        "version": "1.0.0"
      }
    },
    response: {
      status: 200,
      body: {
        _id: 'aid'
      }
    }
  }
});

addInteractionHandler('add interaction', () => {
  return {
    id: 'add interaction',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/interactions',
      body: [
        {
          "flow": "flow1",
          "provider": "provider1",
          "strict": true,
          "request": {
            "matchingRules": {},
            "method": "GET",
            "path": "/api/get",
            "queryParams": {}
          },
          "response": {
            "matchingRules": {},
            "status": 200,
            "statusCode": 200
          },
          "analysisId": "aid"
        }
      ]
    },
    response: {
      status: 200,
      body: [
        {
          _id: 'iid',
          provider: 'provider1',
          flow: 'flow1'
        }
      ]
    }
  }
});

addInteractionHandler('add flow', () => {
  return {
    id: 'add flow',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/flows',
      body: [
        {
          "name": "flow get",
          "request": {
            "url": "http://localhost:9393/api/get",
            "method": "GET",
            "path": "/api/get"
          },
          "response": {
            "statusCode": 200,
            "headers": {
              "date": like("Tue, 29 Dec 2020 12:18:07 GMT"),
              "connection": "close",
              "content-length": "0"
            },
            "body": "",
            "responseTime": like(6)
          },
          "analysisId": "aid",
          "interactions": []
        }
      ]
    },
    response: {
      status: 200,
      body: {
        _id: 'aid'
      }
    }
  }
});

addInteractionHandler('add interaction with flow', () => {
  return {
    id: 'add interaction with flow',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/interactions',
      body: [
        {
          "flow": "flow get",
          "provider": "provider1",
          "strict": true,
          "request": {
            "matchingRules": {},
            "method": "GET",
            "path": "/api/get",
            "queryParams": {}
          },
          "response": {
            "matchingRules": {},
            "status": 200,
            "statusCode": 200
          },
          "analysisId": "aid"
        }
      ]
    },
    response: {
      status: 200,
      body: [
        {
          _id: 'iid',
          provider: 'provider1',
          flow: 'flow get'
        }
      ]
    }
  }
});

addInteractionHandler('add flow with interaction', () => {
  return {
    id: 'add flow with interaction',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/flows',
      body: [
        {
          "name": "flow get",
          "request": {
            "url": "http://localhost:9393/api/get",
            "method": "GET",
            "path": "/api/get"
          },
          "response": {
            "statusCode": 200,
            "headers": {
              "date": like("Tue, 29 Dec 2020 12:18:07 GMT"),
              "connection": "close",
              "content-length": "0"
            },
            "body": "",
            "responseTime": like(6)
          },
          "analysisId": "aid",
          "interactions": [ "iid" ]
        }
      ]
    },
    response: {
      status: 200,
      body: {
        _id: 'aid'
      }
    }
  }
});

addInteractionHandler('run process', () => {
  return {
    id: 'run process',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/process/analysis',
      body: {
        "id": "aid"
      }
    },
    response: {
      status: 202
    }
  }
});