const domEvent = require('./libs/domEvent')
const helpers = require('./libs/helpers')

module.exports = {
  name: 'mkz_c_mute',
  mute: null,
  bind (view) {
    this.view = view
    const elMute = view.el.querySelector('.mkz-c-js-mute')
    const elUnmute = view.el.querySelector('.mkz-c-js-unmute')
    domEvent.add(elMute, 'click', () => {
      this.setState(true)
    })
    domEvent.add(elUnmute, 'click', () => {
      this.setState(false)
    })
    this.getState()
    this.render()
  },
  getState () {
    if (this.mute === null) {
      this.mute = localStorage.getItem(this.name) === 'true'
    }
    return this.mute
  },
  setState (mute) {
    this.mute = Boolean(mute)
    localStorage.setItem(this.name, Boolean(this.mute))
    this.render()
  },
  render () {
    const containerMuteClassName = 'mkz-c_mute_yes'
    if (this.mute) helpers.addClass(this.view.elContainer, containerMuteClassName)
    else helpers.removeClass(this.view.elContainer, containerMuteClassName)
  }
}
