module.exports = {
  name: 'mkz_c_delivered',
  addItem (muid) {
    let list = this.getList()
    list.push(muid)
    this.setData(list)
    return list
  },
  getList () {
    const json = localStorage.getItem(this.name)
    let list = []
    try {
      list = JSON.parse(json) || []
    } catch (e) {}
    return list
  },
  setList (list) {
    localStorage.setItem(this.name, JSON.stringify(list))
    return list
  },
  resetList () {
    this.setList([])
  }
}
