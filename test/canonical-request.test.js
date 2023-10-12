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

  it('creates request with sorted query params for request with multiple query params', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'b', value: "b"},
        {name: 'a', value: "a"},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\na=a&b=b\n${hashedEmptyBody}`)
  })

  it('creates request for request with numerical value query param', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'a', value: 3},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\na=3\n${hashedEmptyBody}`)
  })

  it('creates request with encoded query params for request with query params containing characters needing encoding', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'key+', value: ':/ []'},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\nkey%2B=%3A%2F%20%5B%5D\n${hashedEmptyBody}`)
  })

  it('creates request for get request with query param missing value', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'a', value: ''},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\na=\n${hashedEmptyBody}`)
  })

  it('creates request with encoded list for request with query param value being a list', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'a', value: `["c", "b"]`},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\na=%5B%22c%22%2C%20%22b%22%5D\n${hashedEmptyBody}`)
  })

  it('creates request with sorted query param for request with query param', () => {
    const request = createRequest({
      method: 'GET',
      url: 'https://example.com/',
      parameters: [
        {name: 'a', value: 'c'},
        {name: 'a', value: 'b'},
      ]
    })

    const canonicalRequest = createCanonicalRequest(request)

    expect(canonicalRequest).toStrictEqual(`GET\n/\na=b&a=c\n${hashedEmptyBody}`)
  })
})