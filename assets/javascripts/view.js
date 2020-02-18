const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const msgDelivered = require('./msgDelivered')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')
const Template = require('./template').default

export default class View {
  constructor (app) {
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
  }
  destroy () {
    const el = document.querySelector('[mkz-c]')
    if (!el) return
    el.parentNode.removeChild(el)
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
        if (!this.disableTyping) {
          clearTimeout(this.timeoutTyping)
          this.disableTyping = true
          this.timeoutTyping = setTimeout((() => {
            this.disableTyping = false
            this.sendTyping()
          }), this.typingTimeout)
        }
      }
    })
  }
  bindMessages () {
    if (this.previewMode) return

    for (const el of this.elProductAttachmentActions) {
      domEvent.add(el, 'click', this.productAttachmentClick.bind(this))
    }
  }
  productAttachmentClick (e) {
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

      setTimeout(() => {
        this.elInput.focus()
      }, 100)
    }
    this.app.handlerCollapse(this.collapsed)
  }
  connected () {
    this.enableSending()
  }
  disconnected () {
    this.disableSending()
  }
  sendTyping () {
    const text = this.elInput.value
    this.app.pusherTyping(text)
  }
  sendMsg () {
    if (!this.allowSending) return
    const text = this.elInput.value.trim()
    if (!text) return
    this.app.pusherNewMsg(text)
      .receive('ok', () => {
        this.elInput.value = null
        this.setMsgHeight()
        this.enableSending()
      })
      .receive('error', () => this.enableSending.bind(this))
      .receive('timeout', () => this.enableSending.bind(this))
    this.disableSending()
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
    }
    this.renderMessages()
    this.renderUnread()
  }
  renderMessages () {
    const html = this.app.history.map((msg) => this.template.message(msg)).join('')
    this.elHistory.innerHTML = html

    this.elProductAttachmentActions = this.el.querySelectorAll('.mkz-c-o-js-action')
    this.bindMessages()
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