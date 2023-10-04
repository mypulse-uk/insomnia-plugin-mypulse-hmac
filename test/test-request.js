const createRequest = (overrides) => {
  const {method, headers, environmentVariables, url, body, parameters} = {
    method: 'GET',
    url: 'https://example.com',
    headers: {},
    environmentVariables: {},
    body: {
      text: undefined
    },
    parameters: [],
    ...overrides
  }

  return {
    setHeader: jest.fn().mockName('set Header'),
    getHeader: (key) => headers[key],
    getEnvironmentVariable: (key) => environmentVariables[key],
    getMethod: () => method,
    getUrl: () => url,
    getBody: () => body,
    getParameters: () => parameters
  }
}

module.exports = {
  createRequest
}