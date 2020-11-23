jest.mock('./../src/javascripts/libs/faviconBlink', () => {
  return {
    startBlink: jest.fn(),
    stopBlink: jest.fn()
  }
})
