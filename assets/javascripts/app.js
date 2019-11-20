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
  ready (nameVariable) {
    // Abort if object is undefined
    if (!window[nameVariable]) return false

    const self = this
    window[nameVariable](function() {
      self.store = this.store
      self.libs = this.libs
      self.createConnection.apply(self)
      self.libs.log.push('chat', 'init')
    })
  },
  createConnection () {
    this.socket = new Socket(`//${this.store.chatEndpoint}/socket`)
    this.socket.connect()
    this.channel = this.socket.channel(`room:${this.store.appKey}:${this.store.uid}`)

    this.view = new View(this.libs, this.channel)

    this.channel.join().receive('ok', this.handlerReady.bind(this))
    this.channel.on('client:entered', this.handlerClientEntered.bind(this))
    this.channel.on('message:new', this.handlerMsg.bind(this))
    this.channel.on('message:resend', this.handlerMsgResend.bind(this))
  },
  handlerReady () {
    this.history = msgStory.getData()
    this.view.render()
    this.libs.log.push('chat', 'joined')
  },
  handlerClientEntered (msg) {
    this.setAgents(msg.agents)
    this.sessionsCount = msg.sessionsCount
    this.currentAgentId = msg.current_agent_id
    this.currentAgent = this.getAgent(msg.current_agent_id)
    this.libs.log.push('chat', 'Got ClientEntered', msg)
  },
  handlerMsg (msg) {
    this.parseMsg(msg)
    this.libs.log.push('chat', 'Got Msg', msg)
  },
  handlerMsgResend () {
    this.parseMsg(msg)
    this.libs.log.push('chat', 'Got Resend', msg)
  },
  parseMsg (msg) {
    this.history = msgStory.addData(this.history, msg)
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
