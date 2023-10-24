const createMockClock = () => ({
  getEpochMilliseconds: jest.fn().mockName('getEpochMilliseconds')
})

module.exports = {
  createMockClock
}