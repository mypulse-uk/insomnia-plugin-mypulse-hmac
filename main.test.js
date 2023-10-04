const {createHmacRequestHook, createCanonicalRequest, createEncodedCanonicalRequest, createStringToSign} = require("./main");

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

const createMockClock = () => ({
  getEpochSeconds: jest.fn().mockName('getEpochSeconds')
})

const initialiseHmacRequestHook = () => {
  const clock = createMockClock()
  return {
    clock: clock,
    hmacRequestHook: createHmacRequestHook(clock)
  }
}
describe("MyPulse HMAC Plugin", () => {
  describe('MyPulse HMAC Request Hook', () => {
    it('does not add hmac headers when access-key header not set', () => {
      const {hmacRequestHook} = initialiseHmacRequestHook()
      const request = createRequest({
        headers: {'X-Mp-Access-Key': undefined}
      })

      hmacRequestHook({request})

      expect(request.setHeader).not.toHaveBeenCalled()
    })

    it('thows access-key set but no secret key defined in environment', () => {
      const {hmacRequestHook} = initialiseHmacRequestHook()
      const accessKeyId = "ABC_1234"
      const request = createRequest({
        headers: {'X-Mp-Access-Key': accessKeyId},
        environmentVariables: {mpSecretAccessKeys: {}}
      })

      expect(() => hmacRequestHook({request})).toThrow()
    })

    it('adds hmac headers when access-key header set and secret key provided ', () => {
      const {hmacRequestHook, clock} = initialiseHmacRequestHook()
      const nowEpochSeconds = 946684800
      clock.getEpochSeconds.mockReturnValue(nowEpochSeconds)
      const accessKeyId = "accessKeyId"
      const secretAccessKey = Buffer.from('secretAccessKey', 'utf8').toString('base64')
      const request = createRequest({
        method: "GET",
        url: 'https://example.com/',
        headers: {'X-Mp-Access-Key': accessKeyId},
        environmentVariables: {mpSecretAccessKeys: {'accessKeyId': secretAccessKey}}
      })

      hmacRequestHook({request})

      expect(request.setHeader).toHaveBeenCalledWith('X-Mp-Timestamp', nowEpochSeconds)
      expect(request.setHeader).toHaveBeenCalledWith('Authorization', "8AO+smKGPNjLh+rCA3UhGfqV/FFSrUGQmrdOzJybjn8=")
      expect(clock.getEpochSeconds).toHaveBeenCalledTimes(1)
    })
  })

  describe('Canonical Request', () => {
    const hashedEmptyBody = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    it('creates request for get request with no query params and empty body', () => {
      const request = createRequest({
        method: 'GET',
        url: 'https://example.com/foo'
      })

      const canonicalRequest = createCanonicalRequest(request)

      expect(canonicalRequest).toStrictEqual(`GET\n/foo\n\n${hashedEmptyBody}`)
    })

    it('creates request with slash as path for get request with no path', () => {
      const request = createRequest({
        method: 'GET',
        url: 'https://example.com',
        body: {
          text: undefined
        }
      })

      const canonicalRequest = createCanonicalRequest(request)

      expect(canonicalRequest).toStrictEqual(`GET\n/\n\n${hashedEmptyBody}`)
    })

    it('creates request for post request with no query params and test body', () => {
      const request = createRequest({
        method: 'POST',
        url: 'https://example.com/',
        body: {
          text: "test"
        }
      })
      const encodedBody = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'

      const canonicalRequest = createCanonicalRequest(request)

      expect(canonicalRequest).toStrictEqual(`POST\n/\n\n${encodedBody}`)
    })

    it('creates request for get request with query params', () => {
      const request = createRequest({
        method: 'GET',
        url: 'https://example.com/foo',
        parameters: [
          {name: 'b', value: "b"},
          {name: 'a', value: "a"},
        ]
      })

      const canonicalRequest = createCanonicalRequest(request)

      expect(canonicalRequest).toStrictEqual(`GET\n/foo\na=a&b=b\n${hashedEmptyBody}`)
    })

    it('creates request for get request with query params containing characters needing encoding', () => {
      const request = createRequest({
        method: 'GET',
        url: 'https://example.com/foo',
        parameters: [
          {name: 'a', value: "a"},
          {name: 'multi', value: `["c", "b"]`},
        ]
      })

      const canonicalRequest = createCanonicalRequest(request)

      expect(canonicalRequest).toStrictEqual(`GET\n/foo\na=a&multi=b&multi=c\n${hashedEmptyBody}`)
    })
  })

  describe('String To Sign', () => {
    it('creates string to sign', () => {
      const nowEpochSeconds = 123
      const accessKeyId = "ABC_123"
      const request = createRequest({
        headers: {'X-Mp-Access-Key': accessKeyId}
      })
      const encodedCanonicalRequest = createEncodedCanonicalRequest(request)

      const stringToSign = createStringToSign(nowEpochSeconds, request)

      expect(stringToSign).toStrictEqual(`HMAC-SHA256\n${nowEpochSeconds}\n${accessKeyId}\n${encodedCanonicalRequest}`)
    })
  })
})