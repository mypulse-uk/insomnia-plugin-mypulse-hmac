// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins
const crypto = require('crypto');

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
    const signature = sign(timestamp, secretAccessKey, request)
    request.setHeader(timestampHeader, timestamp)
    request.setHeader(authorizationHeader, signature)
  }
}

const sign = (timestamp, secretAccessKey, request) => {
  const stringToSign = createStringToSign(timestamp, request)
  const decodedSecretAccessKey = Buffer.from(secretAccessKey, 'base64')
  const hmac = crypto.createHmac('sha256', decodedSecretAccessKey)
  hmac.update(stringToSign)
  return hmac.digest('base64')
}

const createStringToSign = (timestamp, request) => {
  const encodedCanonicalRequest = createEncodedCanonicalRequest(request)
  const accessKeyId = request.getHeader(accessKeyIdHeader)
  return `HMAC-SHA256\n${timestamp}\n${accessKeyId}\n${encodedCanonicalRequest}`
}

const createEncodedCanonicalRequest = (request) => {
  const canonicalRequest = createCanonicalRequest(request)
  return crypto.createHash('sha256')
    .update(canonicalRequest)
    .digest('hex')
}

const createCanonicalRequest = (request) => {
  const method = request.getMethod()
  const path = new URL(request.getUrl()).pathname
  const queryParameters = createCanonicalParameters(request.getParameters())
  const hashedBody = crypto.createHash('sha256')
    .update(request.getBody().text ?? "")
    .digest('hex')

  return `${method}\n${path}\n${queryParameters}\n${hashedBody}`
}

const createCanonicalParameters = (queryParameters) => {
  const flattenedQueryParameters = queryParameters.flatMap(({name, value}) => {
    const array = toParameterArray(value)
    return array.map(x => ({name, value: x}))
  })

  flattenedQueryParameters.sort(function (a, b) {
    const nameComparison = a.name.localeCompare(b.name)
    if (nameComparison === 0) {
      return a.value.localeCompare(b.value)
    } else {
      return nameComparison
    }
  })

  const queryParameterValues = flattenedQueryParameters.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
  return queryParameterValues.join('&')
}

const toParameterArray = (string) => {
  try {
    return JSON.parse(string)
  } catch (_) {
    return [string]
  }
}

module.exports = {
  createCanonicalRequest,
  createEncodedCanonicalRequest,
  createStringToSign,
  createHmacRequestHook,
  requestHooks: [createHmacRequestHook()]
}