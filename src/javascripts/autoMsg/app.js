const autoMsgStory = require('./story')
const autoMsgView = require('./view')
const {trackShow} = require('./track')

module.exports = {
  init (app) {
    this.app = app
    this.view = app.view
    this.libs = app.libs
    this.pendingItems = []
    this.rendered = false
    this.timer = null
    this.flashedItem = null

    this.libs.eEmit.subscribe('track.before', (data) => this.onUrlChange(data))
    this.libs.eEmit.subscribe('plugin.chat.channel.entered', () => this.onEnter())
    this.libs.eEmit.subscribe('plugin.chat.showed', () => this.onSelectFlash())
    this.libs.eEmit.subscribe('plugin.chat.auto_messages', (items) => this.onAdd(items))
  },
  onUrlChange (data) {
    if (data.type !== 'page_view') return
    this.stopTimer()
    this.pendingItems = []
    if (!this.rendered) return
    this.onCloseFlash()
    autoMsgView.destroy()
  },
  onAdd (items) {
    this.pendingItems = this.pendingItems.concat(items)
    if (!this.rendered) return
    this.renderPending()
  },
  onEnter () {
    this.rendered = true
    autoMsgView.render(this)
    this.renderPending()
  },
  onSelectFlash () {
    if (this.flashedItem) this.renderHistory(this.flashedItem)
  },
  onCloseFlash () {
    this.flashedItem = null
  },
  getDelay (displayAt) {
    return displayAt - Math.round(+new Date / 1000)
  },
  renderPending () {
    this.stopTimer()
    this.pendingItems.forEach((item) => {
      const delay = this.getDelay(item.display_at)
      if (delay <= 0) {
        this.render(item)
      } else {
        this.timer = setTimeout(() => {
          item.delayed = false
          this.render(item)
        }, delay * 1000)
      }
    })
    this.pendingItems = []
  },
  stopTimer () {
    clearTimeout(this.timer)
  },
  getMsg (item) {
    const agent = this.app.getAgent(item.sender_id)
    const sentAt = this.app.getDateTime()
    const timestamp = +(new Date(sentAt))
    const delayed = this.getDelay(item.display_at) > 0

    return {
      auto_message_uid: item.uid,
      agent_id: item.sender_id,
      attachments: [],
      muid: `${this.app.store.uid}:a:${timestamp}`,
      msg_type: 'message:auto',
      sender_type: item.sender_type,
      sender_avatar_url: agent ? agent.avatar_url : null,
      sender_name: agent ? agent.name : null,
      sent_at: sentAt,
      text: item.text,
      exclude: true,
      custom_fields: item
    }
  },
  render (item) {
    const msg = this.getMsg(item)
    trackShow(msg)
    this.view.notifyNewMsg(msg, true)

    if (this.view.collapsed) {
      this.renderFlash(msg)
    } else {
      this.renderHistory(msg)
    }
  },
  renderFlash (msg) {
    this.flashedItem = msg
    autoMsgView.addMsg(msg)
  },
  renderHistory (msg) {
    this.onCloseFlash()
    this.app.setCurrentAgent(msg.agent_id)
    this.app.addMsg(msg)
    autoMsgStory.addItems([msg])
  }
}
