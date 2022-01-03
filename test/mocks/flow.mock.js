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

addInteractionHandler('get completed job', () => {
  return {
    id: 'get completed job',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/jobs/aid',
    },
    response: {
      status: 200,
      body: {
        status: 'completed'
      }
    }
  }
});

addInteractionHandler('get running job', () => {
  return {
    id: 'get running job',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/jobs/aid',
    },
    response: {
      status: 200,
      body: {
        status: 'running'
      }
    }
  }
});

addInteractionHandler('get failed job', () => {
  return {
    id: 'get failed job',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/jobs/aid',
    },
    response: {
      onCall: {
        0: {
          status: 200,
          body: {
            status: 'running'
          }
        }, 
        1: {
          status: 200,
          body: {
            status: 'failed'
          }
        }
      }
    }
  }
});

addInteractionHandler('get quality gate status as OK', () => {
  return {
    id: 'get quality gate status as OK',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/quality-gate/status',
      queryParams: {
        "projectId": "pid",
        "version": "1.0.0"
      }
    },
    response: {
      status: 200,
      body: [
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]
    }
  }
});

addInteractionHandler('get quality gate status as ERROR', () => {
  return {
    id: 'get quality gate status as ERROR',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/quality-gate/status',
      queryParams: {
        "projectId": "pid",
        "version": "1.0.0"
      }
    },
    response: {
      status: 200,
      body: [
        {
          consumers: [],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "Project Not Found",
              "name": "unknown-project",
              "status": "ERROR",
              "version": ""
            }
          ],
          status: 'ERROR'
        }
      ]
    }
  }
});

addInteractionHandler('get quality gate status as ERROR with exceptions', () => {
  return {
    id: 'get quality gate status as ERROR with exceptions',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/quality-gate/status',
      queryParams: {
        "projectId": "pid",
        "version": "1.0.0"
      }
    },
    response: {
      status: 200,
      body: [
        {
          consumers: [
            {
              "exceptions": [
                {
                  "flow": "p-id-1-f-name-na",
                  "error": "Flow Not Found"
                }
              ],
              "message": "",
              "name": "known-project",
              "status": "FAILED",
              "version": "known-version"
            },
            {
              "exceptions": [
                {
                  "flow": "p-id-1-f-name-na",
                  "error": "Flow Not Found"
                }
              ],
              "message": "",
              "name": "known-project-2",
              "status": "FAILED",
              "version": "known-version"
            }
          ],
          environment: 'latest',
          providers: [
            {
              "exceptions": [],
              "message": "",
              "name": "known-project",
              "status": "PASSED",
              "version": "known-version"
            }
          ],
          status: 'ERROR'
        }
      ]
    }
  }
});

addInteractionHandler('get quality gate status as OK for test env', () => {
  return {
    id: 'get quality gate status as OK for test env',
    provider: 'pactum_flow-api',
    request: {
      method: 'GET',
      path: '/api/flow/v1/quality-gate/status',
      queryParams: {
        "projectId": "pid",
        "version": "1.0.0"
      }
    },
    response: {
      status: 200,
      body: [
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'ERROR'
        },
        {
          consumers: [],
          environment: 'test',
          providers: [],
          status: 'OK'
        }
      ]
    }
  }
});

addInteractionHandler('verify compatibility with interactions', () => {
  return {
    id: 'verify compatibility with interactions',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/compatibility/project/verify',
      body: {
        "projectId": "pid",
        "environments": [],
        "interactions": [
          {
            "analysisId": "abcdefghijklmnopqrstuvwx",
            "provider": "provider1",
            "flow": "flow1",
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
            }
          }
        ],
        "flows": []
      }
    },
    response: {
      status: 200,
      body: [
        {
          "consumer": "p-id-2",
          "consumerVersion": "2.0.1",
          "provider": "p-id-1",
          "providerVersion": "1.0.1",
          "status": "PASSED",
          "exceptions": []
        }
      ]
    }
  }
});

addInteractionHandler('verify quality gate status', () => {
  return {
    id: 'verify quality gate status',
    provider: 'pactum_flow-api',
    request: {
      method: 'POST',
      path: '/api/flow/v1/quality-gate/status/verify',
      body: {
        "projectId": "pid",
        "environments": [],
        "compatibility_results": [
          {
            "consumer": "p-id-2",
            "consumerVersion": "2.0.1",
            "provider": "p-id-1",
            "providerVersion": "1.0.1",
            "status": "PASSED",
            "exceptions": []
          }
        ]
      }
    },
    response: {
      status: 200,
      body: [
        {
          consumers: [],
          environment: 'latest',
          providers: [],
          status: 'OK'
        }
      ]
    }
  }
});