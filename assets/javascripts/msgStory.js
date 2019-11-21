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
  addData (history, msg) {
    history.push({
      muid: msg.muid,
      body: msg.body,
      agent_id: msg.agent_id,
      sent_at: msg.sent_at,
      avatar_url: msg.avatar_url
    })
    this.setData(history)
    return history
  },
  setData (history, msg) {
    localStorage.setItem(this.name, JSON.stringify(history))
    return history
  }
}
