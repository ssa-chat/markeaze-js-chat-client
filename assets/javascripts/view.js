const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const msgDelivered = require('./msgDelivered')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')
const { startBlink, stopBlink } = require('./libs/faviconBlink')
const Template = require('./template').default
const msgStory = require('./msgStory')
const translations = require('./translations')

export default class View {
  constructor (app) {
    this.history = null
    this.collapsed = helpers.getUrlParameter('mkz_expand_chat') !== 'true'
    this.oldCollapsed = true
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
    this.containerBeaconClassName = 'mkz-c_beacon_show'
    this.containerChatClassName = 'mkz-c_chat_show'
    this.htmlClassName = 'mkz-c-fixed'
    this.mobileClassName = 'mkz-c-mobile'
    this.defaultAvatar = 'https://themes.markeaze.com/default/livechat/default_avatar.png'

    this.validationOptions = {
      invalidClassName: 'mkz-f__invalid',
      invalidParentClassName: 'mkz-f__invalid-wrap'
    }
  }
  destroy () {
    if (!this.el || !this.el.parentNode) return
    this.el.parentNode.removeChild(this.el)
  }
  bind () {
    domEvent.add(this.elInput, 'keyup', this.setMsgHeight.bind(this))

    domEvent.add(this.elToggle, 'click', this.showChat.bind(this))
    domEvent.add(this.elClose, 'click', this.hideChat.bind(this))

    if (this.previewMode) return

    domEvent.add(window, 'focus', this.onFocus.bind(this))
    domEvent.add(window, 'blur', this.onBlur.bind(this))
    domEvent.add(window, 'resize', this.setZoom.bind(this))

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
  setZoom () {
    // Disable form iframe mode
    if (window.self !== window.top) return

    const innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    const outerWidth = window.outerWidth || document.documentElement.outerWidth || document.body.outerWidth
    const devicePixelRatio = window.devicePixelRatio || 1
    const zoom = (outerWidth / innerWidth) || devicePixelRatio

    if (zoom < 1) return

    this.elContainer.style.zoom = 1 / zoom
  }
  submitSurveyForm (e) {
    e.preventDefault()
    const el = e.target
    const valid = (new this.libs.Validation(el, this.validationOptions)).valid()
    const muid = el.dataset.uid

    if (!valid) return

    let form = new this.libs.FormToObject(el)

    // Converting format of variables
    const msg = msgStory.findMsg(muid)
    if (msg && msg.custom_fields) {
      const elements = msg.custom_fields.elements
      form = Object.entries(form)
        .reduce((data, [key, value]) => {
          data[key] = value

          const element = elements.find((element) => element.field === key)
          if (element) {
            switch(element.display_type) {
              case 'boolean':
                if (value === 'true') data[key] = true
                if (value === 'false') data[key] = false
                break
              case 'numeric':
                if (value !== '') data[key] = parseFloat(value)
                break
              case 'integer':
                if (value !== '') data[key] = parseInt(value)
                break
            }
          }

          return data
        }, {})
    }

    // Move custom fields to properties by name prefix
    const prefix = 'properties.'
    form = Object.entries(form)
      .reduce((data, [key, value]) => {
        if (key.indexOf(prefix) === 0) {
          data.properties = data.properties || {}
          data.properties[key.replace(prefix, '')] = value
        } else {
          data[key] = value
        }
        return data
      }, {})

    this.app.pusherNewSurveyMsg(muid, form)
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
  onFocus () {
    this.windowFocus = true
    stopBlink()
  }
  onBlur () {
    this.windowFocus = false
  }
  showChat () {
    this.collapsed = false
    this.renderChatToggle()
  }
  hideChat () {
    this.collapsed = true
    this.renderChatToggle()
  }
  renderChatToggle () {
    const updatedState = this.collapsed === this.oldCollapsed
    this.oldCollapsed = this.collapsed

    if (this.collapsed) {
      helpers.removeClass(document.documentElement, this.htmlClassName)
      helpers.removeClass(this.elContainer, this.containerChatClassName)

      this.showBeacon()
    } else {
      helpers.addClass(document.documentElement, this.htmlClassName)
      helpers.addClass(this.elContainer, this.containerChatClassName)

      this.hideBeacon()
    }

    if (this.previewMode || !updatedState) return

    this.app.handlerCollapse(this.collapsed)

    if (!this.collapsed) {
      setTimeout(() => {
        this.elInput.focus()
      }, 100)
    }
  }
  showBeacon (hasMessage) {
    if (this.app.settings.beaconState === 'disabled') return this.hideBeacon()

    if (this.app.settings.beaconState === 'hidden' && !hasMessage) return this.hideBeacon()

    helpers.addClass(this.elContainer, this.containerBeaconClassName)
  }
  hideBeacon () {
    helpers.removeClass(this.elContainer, this.containerBeaconClassName)
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
  visibleChat () {
    helpers.addClass(this.elContainer, 'mkz-c_display_yes')
  }
  assignAgent () {
    this.elAgentName.innerText = this.app.currentAgent.name || ''
    if (this.app.settings.appearance.agent_post) this.elAgentPost.innerText = this.app.currentAgent.job_title || ''
    if (this.app.settings.appearance.agent_avatar) {
      const avatarUrl = this.app.currentAgent.avatar_url || this.defaultAvatar
      this.elAgentAvatar.src = avatarUrl
      this.elAgentAvatar.setAttribute('srcset', helpers.srcset(avatarUrl))
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
      this.showBeacon()
      this.toggleNotice()
      this.renderMessages()

      if (!this.previewMode) {
        this.setZoom()
      }

      if (this.app.isMobile) helpers.addClass(document.documentElement, this.mobileClassName)
      else helpers.removeClass(document.documentElement, this.mobileClassName)
    }

    this.renderChatToggle()
    this.renderUnread()
  }
  renderMessages () {
    const history = this.history || msgStory.getHistory()
    for (const msg of history) this.renderMessage(msg)
  }
  renderMessage (msg, nextMsg, isNew) {
    if (isNew && msg.sender_type === 'agent') {
      if (!this.windowFocus) startBlink( translations[this.app.locale]['new_message'] )
    }
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