const AutoMsgStor = require('./stor')
const AutoMsgView = require('./view')

module.exports = {
  init (app) {
    this.app = app
    this.view = app.view
    this.libs = app.libs
    this.cached = false
    this.items = AutoMsgStor.getItems()
    this.rendered = false
    this.timers = {}

    this.libs.eEmit.subscribe('plugin.chat.auto_messages', this.saveWithTimer.bind(this))
    this.libs.eEmit.subscribe('plugin.chat.channel.entered', () => {
      this.rendered = true
      this.renderItems()
    })
    this.libs.eEmit.subscribe('plugin.chat.showed', () => {
      this.renderItems()
    })
  },
  getHistory () {
    this.cached = true
    return this.items
      .filter((item) => item.added)
      .map((item) => item.payload)
  },
  getTime () {
    return Math.round(+new Date / 1000)
  },
  startTimer (item, callback) {
    const delay = item.display_at - this.getTime()
    if (!delay || delay < 0) return false
    this.timers[item.uid] = setTimeout(callback, delay * 1000)
    return true
  },
  stopTimer (item) {
    if (!this.timers[item.uid]) return

    clearTimeout(this.timers[item.uid])
    delete this.timers[item.uid]
  },
  saveWithTimer (items) {
    if (items.length === 0) return

    const itemsWithoutTimer = items.filter((item) => {
      return !this.startTimer(item, () => this.save([item]))
    })
    if (itemsWithoutTimer.length > 0) this.save(itemsWithoutTimer)
  },
  save (items) {
    const uid = this.app.store.uid
    this.items = AutoMsgStor.addItems(items.map((item) => {
      this.stopTimer(item)
      const sentAt = this.app.getDateTime()
      const timestamp = +(new Date(sentAt))
      const agent = this.app.getAgent(item.sender_id)
      return {
        payload: {
          auto_message_uid: item.uid,
          agent_id: item.sender_id,
          attachments: [],
          muid: `${uid}:a:${timestamp}`,
          msg_type: 'message:auto',
          sender_type: item.sender_type,
          sender_avatar_url: agent ? agent.avatar_url : null,
          sender_name: agent ? agent.name : null,
          sent_at: sentAt,
          text: item.text,
          exclude: true,
          custom_fields: item
        },
        added: false,
        tracked: false,
        flashed: false,
        sent_at: sentAt
      }
    }))

    this.cached = false

    if (this.rendered) this.renderItems()
  },
  renderItems () {
    AutoMsgView.init(this.view, this)

    const collapsed = this.view.collapsed
    const newItems = this.items.filter((item) => !item.added)
    if (newItems.length === 0) return

    for (const item of newItems) {
      if (!item.tracked) {
        this.trackShow(item.payload.custom_fields.uid)
        item.tracked = true
      }

      if (collapsed && !item.flashed) {
        item.flashed = true
        AutoMsgView.render(item)
        break
      } else {
        this.renderItem(item)
      }
    }

    AutoMsgStor.setItems(this.items)
  },
  renderItem (item) {
    item.added = true

    if (item.payload.agent_id) this.app.setCurrentAgent(item.payload.agent_id)
    this.app.addMsg(item.payload)

    this.cached = false
  },
  removeItem (muid) {
    this.items = AutoMsgStor.removeItem(muid)

    this.cached = false
  },
  trackShow (uid) {
    mkz('trackAutoMessageShow', {
      auto_message_uid: uid
    })
  },
  trackReply (muid) {
    const item = this.items.find((item) => item.payload.muid === muid)
    if (!item) return

    const customFields = item.payload.custom_fields
    mkz('trackAutoMessageReply', {
      auto_message_uid: customFields.uid,
      reply_text: customFields.text,
      reply_once: customFields.reply_once
    })
  }
}
