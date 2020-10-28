const helpers = require('./../libs/helpers')
const domEvent = require('./../libs/domEvent')

module.exports = {
  init (view, autoMsg) {
    this.view = view
    this.autoMsg = autoMsg
    this.fadedClassName = 'mkz-c__f_fade_in'

    this.view.libs.eEmit.subscribe('plugin.chat.showed', () => {
      this.destroy()
    })
  },
  bind () {
    domEvent.add(this.el, 'click', this.onOpen.bind(this))
    domEvent.add(this.elClose, 'click', this.onClose.bind(this))
  },
  onOpen (e) {
    e.stopPropagation()
    e.preventDefault()
    this.view.showChat()
  },
  onClose (e) {
    e.stopPropagation()
    this.destroy()
    this.autoMsg.removeItem(this.item.payload.muid)
    this.autoMsg.renderItems()
  },
  unbind () {
    domEvent.remove(this.el, 'click', this.onOpen.bind(this))
    domEvent.remove(this.elClose, 'click', this.onClose.bind(this))
  },
  render (item) {
    this.item = item

    this.el = this.view.el.querySelector('.mkz-c-js-f')
    this.elClose = this.view.el.querySelector('.mkz-c-js-f-close')
    this.elHistory = this.view.el.querySelector('.mkz-c-js-f-history')

    this.elHistory.innerHTML = ''
    const html = this.view.template.message(this.item.payload)
    const msgEl = helpers.appendHTML(this.elHistory, html)
    this.view.bindMessage(msgEl)
    helpers.addClass(this.el, this.fadedClassName)
    this.bind()

    this.view.notifyNewMsg(item.payload, true)
  },
  destroy () {
    if (!this.el) return

    helpers.removeClass(this.el, this.fadedClassName)
    this.unbind()
  }
}
