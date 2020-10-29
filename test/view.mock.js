jest.mock('./../src/javascripts/view', () => {
  const View = class View () {
    constructor () {}
    render () => jest.fn()
    showChat () => jest.fn()
    hideChat () => jest.fn()
    visibleChat () => jest.fn()
    showNotice () => jest.fn()
    assignAgent () => jest.fn()
    unassignAgent () => jest.fn()
    renderAgentState () => jest.fn()
    connected () => jest.fn()
    disconnected () => jest.fn()
    visibleChat () => jest.fn()
    scrollBottom () => jest.fn()
    enableSending () => jest.fn()
    scrollBottom () => jest.fn()
    renderUnread () => jest.fn()
    renderMessage () => jest.fn()
    showBeacon () => jest.fn()
  }
  return {
    default: View
  }
})
