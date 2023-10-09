const {createCanonicalRequest} = require("../src/canonical-request");
const {createRequest} = require('./test-request')

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

  it('creates request for get request with numerical value query param', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/foo',
      parameters: [
        {name: 'a', value: 3},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/foo\na=3\n${hashedEmptyBody}`)
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