const Socket = require('phoenix/assets/js/phoenix').Socket
const msgStory = require('./msgStory')
const View = require('./view').default

module.exports = {
  store: null, // Store from the main app
  libs: null, // Libraries from the main app
  currentAgentId: null,
  currentAgent: null,
  agents: [],
  sessionsCount: 0,
  msgs: [],
  config: {
    endpoint: 'localhost:4000'
  },
  ready (nameVariable) {
    // Abort if object is undefined
    if (!window[nameVariable]) return false

    const self = this
    window[nameVariable](function() {
      self.store = this.store
      self.libs = this.libs
      self.createConnection.apply(self)
    })
  },
  createConnection () {
    this.socket = new Socket(`//${this.config.endpoint}/socket`)
    this.socket.connect()
    this.channel = this.socket.channel(`room:${this.store.appKey}:${this.store.uid}`)
    this.channel.join().receive('ok', this.handlerReady)
    this.channel.on('client:entered', this.handlerClientEntered)
    this.channel.on('message:new', this.handlerMsg)
    this.channel.on('message:resend', this.handlerMsgResend)
  },
  handlerReady () {
    this.msgs = msgStory.getData()

    this.view = new View(this.libs, this.channel)
    this.view.render()
    this.channel.push('message:new', {body: text})
  },
  handlerClientEntered (msg) {
    console.log('Got ClientEntered', msg)
    this.setAgents(msg.agents)
    this.sessionsCount = msg.sessionsCount
    this.currentAgentId = msg.current_agent_id
    this.currentAgent = this.getAgent(msg.current_agent_id)
  },
  handlerMsg (msg) {
    console.log('Got Msg', msg)
    this.parseMsg(msg)
  },
  handlerMsgResend () {
    console.log('Got Resend', msg)
    this.parseMsg(msg)
  },
  parseMsg (msg) {
    this.msgs = msgStory.addData(msg)
  },
  setAgents (agents) {
    this.agents = agents.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {})
  },
  getAgent (id) {
    return this.agents[id] || null
  }
}
