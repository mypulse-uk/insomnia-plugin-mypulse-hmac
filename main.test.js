const {hmacRequestHook} = require('./main.js');

describe('MyPulse HMAC Request Hook', () => {
  it('adds mypulse header ', () => {
    request = {
      setHeader: jest.fn().mockName('set Header')
    }

    hmacRequestHook({request})

    expect(request.setHeader).toHaveBeenCalledWith('X-Mp-Plugin-Test', 'HelloWorld')
  })
})