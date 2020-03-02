module.exports = {
  name: 'mkz_c_msg_history',
  getHistory () {
    const json = localStorage.getItem(this.name)
    let history = []
    try {
      history = JSON.parse(json) || []
    } catch (e) {}
    return history
  },
  setHistory (history) {
    localStorage.setItem(this.name, JSON.stringify(history))
    return history
  },
  addMsg (msg) {
    if (msg.exclude_history) return
    const history = this.getHistory()
    const index = this.findMsgIndex(msg.muid, history)
    const newMsg = {
      muid: msg.muid,
      type: msg.type,
      text: msg.text,
      custom_fields: msg.custom_fields,
      agent_id: msg.agent_id,
      sent_at: msg.sent_at,
      sender_avatar_url: msg.sender_avatar_url,
      sender_name: msg.sender_name,
      attachments: msg.attachments
    }
    if (index === -1) history.push(newMsg)
    else history[index] = newMsg
    this.setHistory(history)
  },
  findMsgIndex (muid, history) {
    return history.findIndex((msg) => msg.muid === muid)
  },
  findMsg (muid, history) {
    return history.find((msg) => msg.muid === muid)
  }
}
