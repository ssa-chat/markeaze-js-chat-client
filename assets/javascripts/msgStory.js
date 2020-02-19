module.exports = {
  name: 'mkz_c_history',
  getData () {
    const json = localStorage.getItem(this.name)
    let history = []
    try {
      history = JSON.parse(json) || []
    } catch (e) {}
    return history
  },
  addData (msg) {
    if (msg.exclude_history) return
    const history = this.getData()
    history.push({
      muid: msg.muid,
      text: msg.text,
      agent_id: msg.agent_id,
      sent_at: msg.sent_at,
      sender_avatar_url: msg.sender_avatar_url,
      sender_name: msg.sender_name,
      attachments: msg.attachments
    })
    this.setData(history)
  },
  setData (history) {
    localStorage.setItem(this.name, JSON.stringify(history))
    return history
  }
}
