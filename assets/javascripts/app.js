const Socket = require('phoenix/assets/js/phoenix').Socket

module.exports = {
  store: null, // Store from the main app
  libs: null, // Libraries from the main app
  ready (nameVariable) {
    // abort if object is undefined
    if (!window[nameVariable]) return false

    const self = this
    window[nameVariable](function() {
      self.store = this.store
      self.libs = this.libs
      self.createConnection.apply(self)
    })
  },
  createConnection () {
    this.socket = new Socket(`//${this.store.endpoint}/event`)
    this.socket.connect()
    this.channel = this.socket.channel(`rooms:${this.store.appKey}:${this.store.uid}`)
    this.channel.join().receive('ok', this.render)
    this.channel.on('user:entered', this.handlerUserEntered)
    this.channel.on('user:exited', this.handlerUserExited)
    this.channel.on('new:msg', this.handlerNewMsg)
    this.channel.on('phx_reply', this.handlerReply)
  },
  handlerUserEntered (msg) {
    console.log('Got UserEntered', msg)
  },
  handlerUserExited (msg) {
    console.log('Got UserExited', msg)
  },
  handlerNewMsg (msg) {
    console.log('Got NewMsg', msg)
  },
  handlerReply (msg) {
    console.log('Got reply', msg)
  },
  render () {
    this.libs.helpers.appendHTML(document.body, `<p>Client chat</p>`)
  }
}
