const Socket = require('phoenix/assets/js/phoenix').Socket
const msgStory = require('./msgStory')
const View = require('./view').default

module.exports = {
  store: null, // Store from the main app
  libs: null, // Libraries from the main app
  currentAgent: null,
  agents: [],
  sessionsCount: 0,
  history: [],
  settings: {
    whitelabel: false,
    copyright: 'Powered by Markeaze',
    offline: 'Leave message',
    placeholder: 'Type your message here...',
    noticeIcon: '/assets/images/tooltip.png',
    noticeText: 'Looking for<br />halloween gifts?',
    margin: '20px',
    iconColor: '#000',
    iconBg: '#F28E24',
    iconText: 'We’re here. Let’s chat!',
    iconPosition: 'r-b', // l-t / r-t / l-b / r-b
    iconType: 'bubble' // bar / bubble
  },
  ready (nameVariable) {
    // Abort if tracker app is undefined
    if (!window[nameVariable]) return false

    const self = this
    window[nameVariable](function() {
      self.store = this.store
      self.libs = this.libs
      self.libs.sanitise = self.sanitise
      self.createConnection.apply(self)
      self.libs.log.push('chat', 'init')
    })
  },
  createConnection () {
    this.socket = new Socket(`//${this.store.chatEndpoint}/socket`)
    this.socket.connect()
    this.channel = this.socket.channel(`room:${this.store.appKey}:${this.store.uid}`)

    this.view = new View(this)

    this.channel.join().receive('ok', this.handlerReady.bind(this))
    this.channel.on('client:entered', this.handlerClientEntered.bind(this))
    this.channel.on('message:new', this.handlerMsg.bind(this))
    this.channel.on('message:resend', this.handlerMsgResend.bind(this))
    this.channel.on('agent:assign', this.handlerAgentAssign.bind(this))
  },
  handlerReady () {
    this.history = msgStory.getData()
    this.view.render()
    this.view.scrollBottom()
    this.libs.log.push('chat', 'joined')
  },
  handlerClientEntered (msg) {
    this.setAgents(msg.agents)
    this.sessionsCount = msg.sessionsCount
    this.setCurrentAgent(msg.current_agent_id)
    this.libs.log.push('chat', 'ClientEntered', msg)
  },
  handlerMsg (msg) {
    this.parseMsg(msg)
    this.libs.log.push('chat', 'Msg', msg)
    this.view.scrollBottom()
  },
  handlerMsgResend () {
    this.parseMsg(msg)
    this.view.scrollBottom()
    this.setCurrentAgent(msg.current_agent_id)
    this.libs.log.push('chat', 'Resend', msg)
  },
  handlerAgentAssign () {
    this.setCurrentAgent(msg.agent_id)
  },
  parseMsg (msg) {
    if (msg.agent_id) {
      const agent = this.getAgent(msg.agent_id)
      msg.avatar_url = agent ? agent.avatar_url : null
      // Status changes only for agent messages
      this.changeMsgState(msg.uid)
    }
    this.history = msgStory.addData(this.history, msg)
  },
  changeMsgState (uid) {
    if (!uid) return

    this.channel.push('message:status:change', {
      uid: uid,
      new_status: 'read'
    })
  },
  setCurrentAgent (currentAgentId) {
    if (!currentAgentId && !this.currentAgent) return

    this.currentAgent = this.getAgent(currentAgentId)
    if (this.currentAgent) this.view.assignAgent()
    else this.view.unassignAgent()
  },
  setAgents (agents) {
    this.agents = agents.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {})
  },
  getAgent (id) {
    return this.agents[id] || null
  },
  sanitise (str) {
    if (!str) return
    const map = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
      '&': '&'
    }
    const reg = /[&<>"'/]/ig
    return str.replace(reg, (match) => (map[match]))
  }
}
