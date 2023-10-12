const crypto = require('crypto');

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
  queryParameters.sort(function (a, b) {
    const nameComparison = a.name.localeCompare(b.name)
    if (nameComparison === 0) {
      return a.value.localeCompare(b.value)
    } else {
      return nameComparison
    }
  })

  const queryParameterValues = queryParameters.map(({name, value}) =>
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  )
  return queryParameterValues.join('&')
}

module.exports = {
  createCanonicalRequest,
  createEncodedCanonicalRequest,
}