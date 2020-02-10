require('./notifier')
const Socket = require('phoenix/assets/js/phoenix').Socket
const msgStory = require('./msgStory')
const msgDelivered = require('./msgDelivered')
const View = require('./view').default
const Sound = require('./sound').default

module.exports = {

  // Plugin methods

  version: '[AIV]{version}[/AIV]',
  store: {}, // Store from the main app
  libs: {}, // Libraries from the main app
  previewMode: false,
  create (locale, settings) {
    this.settings = settings
    this.locale = locale
    this.log('chat', 'created')
    this.createConnection()

    this.sound = new Sound(this.settings.appearance.client_sound_path)
  },
  destroy () {
    if (this.view) this.view.destroy()
    if (this.socket) this.socket.disconnect()
  },
  preview (locale, settings, options = {}) {
    this.previewMode = true

    this.settings = settings
    this.history = options.history || []
    this.locale = locale
    this.view = new View(this)
    this.view.width = options.width || null
    this.view.render()

    if (options.collapsed) this.view.showNotice()
    else this.view.collapse()

    if (options.currentAgent) {
      this.currentAgent = options.currentAgent
      this.view.assignAgent()
      this.updateAgentState()
    }
  },

  // / Plugin methods

  currentAgent: null,
  agents: [],
  agentIsOnline: false,
  sessionsCount: 0,
  history: [],
  settings: {},
  locale: null,
  log () {
    if (this.libs.log) this.libs.log.push('chat', ...arguments)
  },
  createConnection () {
    this.socket = new Socket(`//${this.store.chatEndpoint}/socket`)

    this.view = new View(this)

    this.socket.onOpen(this.handlerConnected.bind(this))
    this.socket.onClose(this.handlerDisconnected.bind(this))
    this.socket.connect()

    this.servicChannel = this.socket.channel(`chat-client:${this.store.appKey}`)
    this.servicChannel.join()
      .receive('error', () => console.error(`Cannot join channel ${this.servicChannel.topic}`))
    this.servicChannel.on('agent:entered', this.handlerAgentStatus.bind(this, true))
    this.servicChannel.on('agent:exited', this.handlerAgentStatus.bind(this, false))

    this.clientChannel = this.socket.channel(`room:${this.store.appKey}:${this.store.uid}`)
    this.clientChannel.join()
      .receive('ok', this.handlerJoined.bind(this))
      .receive('error', (e, d) => console.error(`Cannot join channel ${this.clientChannel.topic}`))
    this.clientChannel.on('client:entered', this.handlerClientEntered.bind(this))
    this.clientChannel.on('message:new', this.handlerMsg.bind(this))
    this.clientChannel.on('message:resend', this.handlerMsgResend.bind(this))
    this.clientChannel.on('agent:assign', this.handlerAgentAssign.bind(this))
  },
  handlerConnected () {
    this.view.connected()
  },
  handlerDisconnected () {
    this.view.disconnected()
  },
  handlerJoined () {
    this.history = msgStory.getData()
    this.view.render()
    this.view.scrollBottom()
    this.log('chat', 'joined')
  },
  handlerAgentStatus (isOnline, {agent_id}) {
    const agent = this.getAgent(agent_id)
    if (!agent) return
    agent.isOnline = isOnline
    this.updateAgentState()
  },
  handlerClientEntered (msg) {
    this.setAgents(msg.agents)
    this.sessionsCount = msg.sessionsCount
    this.setCurrentAgent(msg.current_agent_id)
    this.updateAgentState()
    this.log('chat', 'ClientEntered', msg)
  },
  handlerMsg (msg) {
    this.parseMsg(msg)
    this.log('chat', 'Msg', msg)
    this.view.scrollBottom()
  },
  handlerMsgResend (msg) {
    this.parseMsg(msg)
    this.view.scrollBottom()
    this.setCurrentAgent(msg.current_agent_id)
    this.log('chat', 'Resend', msg)
  },
  handlerAgentAssign (msg) {
    this.setCurrentAgent(msg.target_agent_id)
  },
  handlerCollapse (collapsed) {
    if (collapsed === true) return

    const muids = msgDelivered.getList()
    for (const muid of muids) this.pusherMsgState(muid, 'read')
    msgDelivered.resetList()
    this.view.renderUnread()
  },
  pusherTyping (text) {
    if (!text) return

    return this.clientChannel.push('client:activity', {
      type: 'typing',
      text: text
    })
  },
  pusherNewMsg (text) {
    if (!text) return

    const timestamp = +(new Date)
    const uid = this.store.uid
    return this.clientChannel.push('message:new', {
      muid: `${uid}:c:${timestamp}`,
      text: text,
      status: 'sent',
      sent_at: this.getDateTime()
    })
  },
  pusherMsgState (muid, state) {
    if (!muid) return

    this.clientChannel.push('message:status:change', {
      muid: muid,
      new_status: state,
      sent_at: this.getDateTime()
    })
  },
  getDateTime () {
    return (new Date).toISOString().replace('Z', '000Z')
  },
  parseMsg (msg) {
    if (msg.agent_id) {
      const agent = this.getAgent(msg.agent_id)
      msg.sender_avatar_url = agent ? agent.sender_avatar_url : null
      // Status changes only for agent messages
      if (this.view.collapsed === false) this.pusherMsgState(msg.muid, 'read')
      else {
        this.pusherMsgState(msg.muid, 'delivered')
        msgDelivered.addItem(msg.muid)
        this.view.renderUnread()
      }
      if (!this.view.windowFocus || this.view.collapsed) this.sound.play()
    }
    this.history = msgStory.addData(this.history, msg)
    this.view.render()
  },
  setCurrentAgent (currentAgentId) {
    if (!currentAgentId && !this.currentAgent) return

    this.currentAgent = this.getAgent(currentAgentId)
    if (this.currentAgent) this.view.assignAgent()
    else this.view.unassignAgent()
  },
  setAgents (agents) {
    this.agents = agents.reduce((obj, agent) => {
      obj[agent.id] = agent
      return obj
    }, {})
  },
  getAgent (id) {
    return this.agents[id] || null
  },
  updateAgentState () {
    if (this.currentAgent) {
      this.agentIsOnline = this.currentAgent.isOnline
    } else {
      this.agentIsOnline = Object.values(this.agents).find((agent) => agent.isOnline) && true
    }
    this.view.renderAgentState()
  }

}
