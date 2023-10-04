const {createHmacRequestHook, createStringToSign} = require("../src/main");
const {createEncodedCanonicalRequest} = require("../src/canonical-request")
const {createRequest} = require('./test-request')
const {createMockClock} = require('./mock-clock')

const initialiseHmacRequestHook = () => {
  const clock = createMockClock()
  return {
    clock: clock,
    hmacRequestHook: createHmacRequestHook(clock)
  }
}

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