const autoMsg = require('./autoMsg')

module.exports = {
  name: 'mkz_c_msg_history',
  cached: false,
  history: [],
  getHistory () {
    if (this.cached && autoMsg.cached) this.history

    const json = localStorage.getItem(this.name)
    let history = []
    try {
      history = JSON.parse(json) || []
    } catch (e) {}
    return this.sortHistory(history.concat(autoMsg.getHistory()))
  },
  saveHistory (history) {
    localStorage.setItem(this.name, JSON.stringify(history.filter((msg) => !msg.exclude)))
    return history
  },
  addMsg (msg) {
    const history = this.getHistory()

    const index = this.findMsgIndex(msg.muid)
    const newMsg = {
      muid: msg.muid,
      type: msg.type,
      text: msg.text,
      custom_fields: msg.custom_fields,
      agent_id: msg.agent_id,
      sender_type: msg.sender_type,
      sent_at: msg.sent_at,
      sender_avatar_url: msg.sender_avatar_url,
      sender_name: msg.sender_name,
      attachments: msg.attachments,
      exclude: msg.exclude
    }
    if (index === -1) history.push(newMsg)
    else history[index] = newMsg

    this.saveHistory(history)
  },
  getPrevMsg (muid) {
    const index = this.findMsgIndex(muid)
    if (index < 1) return

    const history = this.getHistory()
    return history[index - 1]
  },
  findMsgIndex (muid) {
    const history = this.getHistory()
    return history.findIndex((msg) => msg.muid === muid)
  },
  findMsg (muid) {
    const history = this.getHistory()
    return history.find((msg) => msg.muid === muid)
  },
  sortHistory (history) {
    for (let i = 1, l = history.length; i < l; i++) {
      const current = history[i]
      let j = i
      while (j > 0 && new Date(history[j - 1].sent_at) > new Date(current.sent_at)) {
        history[j] = history[j - 1]
        j--
      }
      history[j] = current
    }
    return history
  }
}
