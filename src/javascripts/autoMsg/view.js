const helpers = require('./../libs/helpers')
const domEvent = require('./../libs/domEvent')

module.exports = {
  render (autoMsgApp) {
    this.autoMsgApp = autoMsgApp
    this.fadedClassName = 'mkz-c__f_fade_in'
    this.el = this.autoMsgApp.view.el.querySelector('.mkz-c-js-f')
    this.elClose = this.autoMsgApp.view.el.querySelector('.mkz-c-js-f-close')
    this.elHistory = this.autoMsgApp.view.el.querySelector('.mkz-c-js-f-history')

    this.bind()
  },
  destroy () {
    if (!this.el) return

    helpers.removeClass(this.el, this.fadedClassName)
    this.unbind()
  },
  bind () {
    domEvent.add(this.el, 'click', this.onSelectFlash.bind(this))
    domEvent.add(this.elClose, 'click', this.onCloseFlash.bind(this))

    this.autoMsgApp.view.libs.eEmit.subscribe('plugin.chat.showed', () => {
      this.destroy()
    })
  },
  unbind () {
    domEvent.remove(this.el, 'click', this.onSelectFlash.bind(this))
    domEvent.remove(this.elClose, 'click', this.onCloseFlash.bind(this))
  },
  onSelectFlash (e) {
    e.stopPropagation()
    e.preventDefault()
    this.autoMsgApp.view.showChat()
    this.autoMsgApp.onSelectFlash()
  },
  onCloseFlash (e) {
    e.stopPropagation()
    this.destroy()
    this.autoMsgApp.onCloseFlash()
  },
  addMsg (item) {
    this.item = item
    this.elHistory.innerHTML = ''
    const html = this.autoMsgApp.view.template.message(this.item)
    const msgEl = helpers.appendHTML(this.elHistory, html)
    this.autoMsgApp.view.bindMessage(msgEl)
    helpers.addClass(this.el, this.fadedClassName)
  }
}
