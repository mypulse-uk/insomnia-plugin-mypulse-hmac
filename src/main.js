const crypto = require('crypto');
const {createStringToSign} = require('./string-to-sign')

const accessKeyIdHeader = 'X-Mp-Access-Key'
const timestampHeader = 'X-Mp-Timestamp'
const authorizationHeader = 'Authorization'

const defaultClock = {
  getEpochSeconds: () => Math.round(Date.now() / 1000)
}

const createHmacRequestHook = (clock = defaultClock) => {
  return (context) => {
    const request = context.request
    const secretAccessKeys = request.getEnvironmentVariable('mpSecretAccessKeys') ?? {}
    const accessKeyId = request.getHeader(accessKeyIdHeader)
    const secretAccessKey = secretAccessKeys[accessKeyId]

    if (!accessKeyId) {
      console.log(`MP - HMAC: No ${accessKeyIdHeader} header set`)
      return
    }

    if (!secretAccessKey) {
      throw new Error(`MP - HMAC: No secretKeyId found for ${accessKeyId}`)
    }

    const timestamp = clock.getEpochSeconds()
    const signature = sign(timestamp, accessKeyId, secretAccessKey, request)
    request.setHeader(timestampHeader, timestamp)
    request.setHeader(authorizationHeader, signature)
  }
}

const sign = (timestamp, accessKeyId, secretAccessKey, request) => {
  const stringToSign = createStringToSign(timestamp, accessKeyId, request)
  const decodedSecretAccessKey = Buffer.from(secretAccessKey, 'base64')
  const hmac = crypto.createHmac('sha256', decodedSecretAccessKey)
  hmac.update(stringToSign)
  return hmac.digest('base64')
}

module.exports = {
  createHmacRequestHook,
  requestHooks: [createHmacRequestHook()]
}