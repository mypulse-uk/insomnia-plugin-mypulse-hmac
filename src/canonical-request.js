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
}