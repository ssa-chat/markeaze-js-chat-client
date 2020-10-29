document.domain = 'localhost'

require('phoenix/assets/js/phoenix').Socket

window.mkz = jest.fn()

jest.mock('phoenix/assets/js/phoenix', () => {
  const Socket = class Socket {
    constructor (url) {
      this.url
    }
    channel () {
      return {
        on: () => jest.fn(),
        join: () => jest.fn(),
        topic: () => jest.fn(),
        push: () =>jest.fn()
      }
    }
    connect () { return jest.fn() }
    disconnect () { return jest.fn() }
    onOpen () { return jest.fn() }
    onClose () { return jest.fn() }
  }
  return {Socket}
})

jest.mock('./../src/javascripts/css', () => '')
