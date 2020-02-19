module.exports = {
  name: 'mkz_c_auto_msg_history',
  addItems (newItems) {
    let items = this.getItems()
    for (const newItem of newItems) {
      const index = items.findIndex((item) => item.payload.auto_message.uid === newItem.payload.auto_message.uid)
      if (index === -1) items.push(newItem)
      else {
        items[index].payload.auto_message = newItem.payload.auto_message
      }
    }
    this.setItems(items)
    return items
  },
  getItems () {
    const json = sessionStorage.getItem(this.name)
    let items = []
    try {
      items = JSON.parse(json) || []
    } catch (e) {}
    return items
  },
  setItems (items) {
    sessionStorage.setItem(this.name, JSON.stringify(items))
    return items
  },
  removeItem (muid) {
    let items = this.getItems()
    const index = items.findIndex((item) => item.payload.muid === muid)
    if (index !== -1) {
      items.splice(index, 1)
      this.setItems(items)
    }
    return items
  }
}
