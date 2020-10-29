import 'regenerator-runtime'

jest.mock('./src/javascripts/app', () => jest.fn())

import app from './src/javascripts/app'

describe('initPlugin', () => {

  afterEach(() => {
    window.mkz.mockClear()
  })

  it('should call', () => {
    require('./mkz-chat-client')
    expect(window.mkz.mock.calls.length).toBe(1)
    expect(window.mkz.mock.calls[0]).toMatchObject(['initPlugin', 'chat', app])
  })

})
