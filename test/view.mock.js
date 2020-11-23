jest.mock('./../src/javascripts/view', () => {
  const View = class View {
    constructor () {}
    render () { return jest.fn() }
    showChat () { return jest.fn() }
    hideChat () { return jest.fn() }
    visibleChat () { return jest.fn() }
    showNotice () { return jest.fn() }
    assignAgent () { return jest.fn() }
    unassignAgent () { return jest.fn() }
    renderAgentState (){ return jest.fn() }
    connected () { return jest.fn() }
    disconnected () { return jest.fn() }
    visibleChat () { return jest.fn() }
    scrollBottom () { return jest.fn() }
    enableSending () { return jest.fn() }
    scrollBottom () { return jest.fn() }
    renderUnread () { return jest.fn() }
    renderMessage () { return jest.fn() }
    showBeacon () { return jest.fn() }
  }
  return View
})
