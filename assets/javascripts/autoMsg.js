const autoMsgStory = require('./autoMsgStory')

module.exports = {
  cached: false,
  init (app) {
    this.app = app
    this.libs = app.libs
    this.cached = false
    this.items = autoMsgStory.getItems()
    this.rendered = false

    if (this.libs.eEmit) {
      this.libs.eEmit.subscribe('plugin.chat.auto_messages', this.saveItems.bind(this))
      this.libs.eEmit.subscribe('plugin.chat.channel.entered', () => {
        this.rendered = true
        this.renderNewItems()
      })
    }
  },
  getHistory () {
    this.cached = true
    return this.items.map((item) => item.payload)
  },
  saveItems (items) {
    if (items.length === 0) return

    this.cached = false
    const uid = this.app.store.uid
    this.items = autoMsgStory.addItems(items.map((item) => {
      const sentAt = this.app.getDateTime()
      const timestamp = +(new Date(sentAt))
      return {
        payload: {
          agent_id: item.sender_id,
          attachments: [],
          muid: `${uid}:a:${timestamp}`,
          msg_type: 'message:auto',
          sender_avatar_url: null,
          sender_name: null,
          sent_at: sentAt,
          text: item.text,
          exclude: true,
          custom_fields: item
        },
        state: 'new',
        sent_at: sentAt
      }
    }))

    if (this.rendered) this.renderNewItems()
  },
  renderNewItems () {
    const items = this.items.filter((item) => item.state === 'new')
    if (items.length === 0) return

    this.cached = false
    for (const item of items) {
      this.app.addMsg(item.payload)
      this.app.view.scrollBottom()
      this.app.setCurrentAgent(item.payload.agent_id)

      this.trackShow(item.payload.custom_fields.uid)

      item.state = 'sent'
    }
    if (this.app.view.collapsed) this.app.view.collapse()

    autoMsgStory.setItems(this.items)
  },
  getMsgAgentId (muid) {
    const item = this.items.find((item) => item.payload.muid === muid)
    return (item && item.payload.agent_id) || 0
  },
  removeItem (muid) {
    this.cached = false
    this.items = autoMsgStory.removeItem(muid)
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
