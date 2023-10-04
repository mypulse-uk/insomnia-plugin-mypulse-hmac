const createMockClock = () => ({
  getEpochSeconds: jest.fn().mockName('getEpochSeconds')
})

module.exports = {
  createMockClock
}