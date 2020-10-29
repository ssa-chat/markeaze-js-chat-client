module.exports = {
  name: 'mkz_c_auto_msg_history',
  cached: null,
  getHistory () {
    if (!this.cached) this.cached = this.getItems()
    return this.cached
  },
  getItems () {
    const json = sessionStorage.getItem(this.name)
    let items = []
    try {
      items = JSON.parse(json) || []
    } catch (e) {}
    return items
  },
  addItems (items) {
    const i = this.getItems()
    const t = i.concat(items)
    return this.setItems(t)
  },
  setItems (items) {
    sessionStorage.setItem(this.name, JSON.stringify(items))
    this.cached = null
    return items
  },
  removeItem (muid) {
    const items = this.getItems()
    const index = items.findIndex((item) => item.muid === muid)
    if (index !== -1) {
      items.splice(index, 1)
      this.addItems(items)
    }
    this.setItems(items)
    this.cached = null
    return items
  },
  removeAllItems () {
    sessionStorage.removeItem(this.name)
    this.cached = null
    return []
  }
}
