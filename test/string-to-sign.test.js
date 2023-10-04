const {createRequest} = require("./test-request");
const {createEncodedCanonicalRequest} = require("../src/canonical-request");
const {createStringToSign} = require("../src/string-to-sign");

describe('String To Sign', () => {
  it('creates string to sign', () => {
    const nowEpochSeconds = 123
    const accessKeyId = "ABC_123"
    const request = createRequest({
      headers: {'X-Mp-Access-Key': accessKeyId}
    })
    const encodedCanonicalRequest = createEncodedCanonicalRequest(request)

    const stringToSign = createStringToSign(nowEpochSeconds, accessKeyId, request)

    expect(stringToSign).toStrictEqual(`HMAC-SHA256\n${nowEpochSeconds}\n${accessKeyId}\n${encodedCanonicalRequest}`)
  })
})