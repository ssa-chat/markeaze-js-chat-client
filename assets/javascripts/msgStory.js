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
      uid: msg.uid,
      body: msg.body,
      agent_id: msg.agent_id,
      sent_at: msg.sent_at
    })
    this.setData(history)
    return history
  },
  setData (history, msg) {
    localStorage.setItem(this.name, JSON.stringify(history))
    return history
  }
}
