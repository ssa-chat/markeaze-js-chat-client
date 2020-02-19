const autoMsgStory = require('./autoMsgStory')

module.exports = {
  init (app) {
    this.app = app
    this.libs = app.libs
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
  saveItems (items) {
    if (items.length === 0) return

    const uid = this.app.store.uid
    this.items = autoMsgStory.addItems(items.map((item) => {
      const sentAt = this.app.getDateTime()
      const timestamp = +(new Date(sentAt))
      return {
        payload: {
          agent_id: item.sender_id,
          attachments: [],
          muid: `${uid}:a:${timestamp}`,
          sender_avatar_url: null,
          sender_name: null,
          sent_at: sentAt,
          text: item.text,
          exclude_history: true,
          auto_message: item
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

    for (const item of items) {
      this.app.addMsg(item.payload)
      this.app.view.scrollBottom()
      this.app.setCurrentAgent(item.payload.agent_id)

      this.trackShow(item.payload.auto_message)

      item.state = 'sent'
    }
    if (this.app.view.collapsed) this.app.view.collapse()

    autoMsgStory.setItems(this.items)
  },
  mergeHistory (history) {
    const msgs = this.items.map((item) => item.payload)
    const arr = history.concat(msgs)

    for (let i = 1, l = arr.length; i < l; i++) {
      const current = arr[i]
      let j = i
      while (j > 0 && new Date(arr[j - 1].sent_at) > new Date(current.sent_at)) {
        arr[j] = arr[j - 1]
        j--
      }
      arr[j] = current
    }
    return arr
  },
  getMsgAgentId (msg) {
    const item = this.items.find((item) => item.payload.muid === msg.muid)
    return (item && item.payload.agent_id) || 0
  },
  removeItem (muid) {
    this.items = autoMsgStory.removeItem(muid)
  },
  trackShow (amsg) {
    mkz('trackAutoMessageShow', {
      auto_message_uid: amsg.uid
    })
  },
  trackReply (amsg) {
    if (!amsg.reply_once) return

    mkz('trackAutoMessageReply', {
      auto_message_uid: amsg.uid,
      reply_text: amsg.text
    })
  }
}
