const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const msgDelivered = require('./msgDelivered')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')
const Template = require('./template').default
const msgStory = require('./msgStory')

export default class View {
  constructor (app) {
    this.history = null
    this.collapsed = true
    this.windowFocus = true
    this.app = app
    this.previewMode = app.previewMode
    this.libs = app.libs
    this.allowSending = false
    this.typingTimeout = 1000
    this.noticeShowTimeout = 1000
    this.noticeHideTimeout = 10000
    this.width = null
    this.template = new Template(this)

    this.validationOptions = {
      invalidClassName: 'mkz-f__invalid',
      invalidParentClassName: 'mkz-f__invalid-wrap'
    }
  }
  destroy () {
    if (!this.el) return
    this.el.parentNode.removeChild(this.el)
  }
  bind () {
    domEvent.add(this.elInput, 'keyup', this.setMsgHeight.bind(this))

    domEvent.add(this.elToggle, 'click', this.collapse.bind(this))
    domEvent.add(this.elClose, 'click', this.collapse.bind(this))

    if (this.previewMode) return

    domEvent.add(window, 'focus', this.focus.bind(this))
    domEvent.add(window, 'blur', this.blur.bind(this))

    domEvent.add(this.elSubmit, 'click', this.sendMsg.bind(this))

    domEvent.add(this.elInput, 'keydown', (e) => {
      if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault()
        this.sendMsg()
      } else {
        this.startTyping()
      }
    })
  }
  bindMessage (elMessage) {
    if (this.previewMode) return

    const elProductActions = elMessage.querySelectorAll('.mkz-c-o-js-action')
    for (const elProductAction of elProductActions) {
      domEvent.add(elProductAction, 'click', this.clickProductAttachment.bind(this))
    }

    const elForms = elMessage.querySelectorAll('.mkz-f-js')
    for (const elForm of elForms) {
      domEvent.add(elForm, 'submit', this.submitSurveyForm.bind(this))
    }
  }
  submitSurveyForm (e) {
    e.preventDefault()
    const el = e.target
    const valid = (new this.libs.Validation(el, this.validationOptions)).valid()
    const formData = new this.libs.FormToObject(el)
    const muid = el.dataset.uid

    if (!valid) return

    this.app.pusherNewSurveyMsg(muid, formData)
    el.querySelector('button').disabled = true
  }
  clickProductAttachment (e) {
    const el = e.target
    const offer = JSON.parse(el.dataset.data)
    const callbackLabel = el.dataset.callback_label
    const settings = this.app.settings.behavior.attachment_cta.product

    const callback = () => {
      if (callbackLabel) el.innerHTML = callbackLabel
      if (settings.callback) eval(settings.callback)(offer)
    }

    if (el.handlerDone) return
    el.handlerDone = true
    el.setAttribute('disabled', true)

    eval(settings.handler)(offer, callback)
  }
  focus () {
    this.windowFocus = true
  }
  blur () {
    this.windowFocus = false
  }
  collapse () {
    const containerClassName = 'mkz-c_collapse_yes'
    const htmlClassName = 'mkz-c-fixed'
    this.collapsed = !this.collapsed
    if (this.collapsed) {
      helpers.removeClass(document.documentElement, htmlClassName)
      helpers.addClass(this.elContainer, containerClassName)
    } else {
      helpers.addClass(document.documentElement, htmlClassName)
      helpers.removeClass(this.elContainer, containerClassName)

      if (!this.previewMode) setTimeout(() => {
        this.elInput.focus()
      }, 100)
    }

    if (this.previewMode) return

    this.app.handlerCollapse(this.collapsed)
  }
  connected () {
    this.enableSending()
  }
  disconnected () {
    this.disableSending()
  }
  startTyping () {
    if (this.timeoutTyping) return
    this.timeoutTyping = setTimeout((() => {
      this.sendTyping()
      this.stopTyping()
    }), this.typingTimeout)
  }
  stopTyping () {
    clearTimeout(this.timeoutTyping)
    this.timeoutTyping = null
  }
  sendTyping () {
    const text = this.elInput.value
    this.app.pusherTyping(text)
  }
  sendMsg () {
    if (!this.allowSending) return
    const text = this.elInput.value.trim()
    if (!text) return
    this.stopTyping()
    this.disableSending()
    this.app.pusherNewMsg(text)
      .receive('ok', () => {
        this.elInput.value = null
        this.setMsgHeight()
        this.enableSending()
      })
      .receive('error', () => this.enableSending.bind(this))
      .receive('timeout', () => this.enableSending.bind(this))
  }
  setMsgHeight () {
    this.elInput.style.height = 'auto'
    const newH = this.elInput.scrollHeight
    this.elInput.style.height = newH + 'px'
  }
  disableSending () {
    this.allowSending = false
    if (this.elSubmit) helpers.addClass(this.elSubmit, 'mkz-c__submit_disabled_yes')
  }
  enableSending () {
    this.allowSending = true
    if (this.elSubmit) helpers.removeClass(this.elSubmit, 'mkz-c__submit_disabled_yes')
  }
  assignAgent () {
    this.elAgentName.innerText = this.app.currentAgent.name || ''
    if (this.app.settings.appearance.agent_post) this.elAgentPost.innerText = this.app.currentAgent.job_title || ''
    if (this.app.settings.appearance.agent_avatar && this.app.currentAgent.avatar_url) {
      this.elAgentAvatar.src = this.app.currentAgent.avatar_url
      this.elAgentAvatar.setAttribute('srcset', helpers.srcset(this.app.currentAgent.avatar_url))
      this.elAgentAvatar.style.display = 'block'
    } else this.elAgentAvatar.style.display = 'none'
    helpers.addClass(this.elContainer, 'mkz-c_agent_assign')
  }
  unassignAgent () {
    helpers.removeClass(this.elContainer, 'mkz-c_agent_assign')
  }
  onlineAgents () {
    helpers.addClass(this.elContainer, 'mkz-c_agent_online')
  }
  offlineAgents () {
    helpers.removeClass(this.elContainer, 'mkz-c_agent_online')
  }
  toggleNotice () {
    if (this.previewMode) return

    const storeName = 'mkz_c_tooltip_hidden'
    if (sessionStorage.getItem(storeName)) return
    sessionStorage.setItem(storeName, true)
    setTimeout(() => {
      this.showNotice()
    }, this.noticeShowTimeout)
    setTimeout(() => {
      this.hideNotice()
    }, this.noticeShowTimeout + this.noticeHideTimeout)
  }
  showNotice () {
    helpers.addClass(this.elContainer, 'mkz-c_tooltip_yes')
  }
  hideNotice () {
    helpers.removeClass(this.elContainer, 'mkz-c_tooltip_yes')
  }
  render () {
    // Can be called multiple times on one page
    if (!this.el) {
      this.el = helpers.appendHTML(document.body, this.template.content())
      this.elContainer = this.el.querySelector('.mkz-c-js')
      this.elInput = this.el.querySelector('.mkz-c-js-input')
      this.elSubmit = this.el.querySelector('.mkz-c-js-submit')
      this.elUnread = this.el.querySelector('.mkz-c-js-unread')
      this.elClose = this.el.querySelector('.mkz-c-js-close')
      this.elToggle = this.el.querySelector('.mkz-c-js-toggle')
      this.elHistory = this.el.querySelector('.mkz-c-js-history')
      this.elScroll = this.el.querySelector('.mkz-c-js-scroll')
      this.elAgentName = this.el.querySelector('.mkz-c-js-agent-name')
      this.elAgentPost = this.el.querySelector('.mkz-c-js-agent-post')
      this.elAgentAvatar = this.el.querySelector('.mkz-c-js-agent-avatar')
      this.bind()
      this.toggleNotice()
      this.renderMessages()
    }
    this.renderUnread()
  }
  renderMessages () {
    const history = this.history || msgStory.getHistory()
    for (const msg of history) this.renderMessage(msg)
  }
  renderMessage (msg, nextMsg) {
    const html = this.template.message(msg)
    let msgEl = this.findMsg(msg.muid)
    if (msgEl) {
      msgEl.innerHTML = html
    } else {
      const nextMsgEl = nextMsg && this.findMsg(nextMsg.muid)
      if (nextMsgEl) msgEl = helpers.beforeHTML(nextMsgEl, html)
      else msgEl = helpers.appendHTML(this.elHistory, html)
    }
    this.bindMessage(msgEl)
  }
  findMsg (muid) {
    return this.elHistory.querySelector(`[data-id="${muid}"]`)
  }
  renderUnread () {
    if (!this.elUnread) return
    const unreadCount = msgDelivered.getList().length
    this.elUnread.innerHTML = unreadCount
    this.elUnread.style.display = unreadCount === 0 ? 'none' : 'block'
  }
  renderAgentState () {
    if (this.app.agentIsOnline) this.onlineAgents()
    else this.offlineAgents()
  }
  scrollBottom () {
    setTimeout(() => {
      this.elScroll.scrollTop = this.elScroll.scrollHeight
    }, 0)
  }
}