const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const helpers = require('./libs/helpers')
const translations = require('./translations')
const format = require('dateformat')
const themes = require('./themes').default
const {
  sendIcon, downIcon, muteIcon, unmuteIcon, fileIcon, attachIcon
} = require('./libs/icons')

export default class Template {
  constructor (view) {
    this.app = view.app
    this.view = view
    this.appearance = this.app.settings.appearance
    this.behavior = this.app.settings.behavior

    const theme = this.appearance.theme
    if (theme && themes[theme]) {
      this.theme = this.appearance.theme
      this.appearance = { ...this.appearance, ...themes[theme] }
    }
  }
  safe (str) {
    return helpers.htmlToText(str)
  }
  t (key, properties) {
    return this.view.translate.t(key, properties)
  }
  attribute (data) {
    if (!data) return ''
    return String(data).replace(/\"/ig, '&quot;')
  }
  offers (items) {
    if (!items) return ''
    return `
    <div class="mkz-c-o">
      ${items.map(this.offer.bind(this)).join("\n")}
    </div>`
  }
  offer (item, index, items) {
    const htmlPicture = item.icon ? `
          <img src="${this.safe(item.icon)}" alt="" class="mkz-c-o__preview-img" />
    ` : `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="480" height="448" viewBox="0 0 480 448" class="mkz-c-o__preview-img">
            <path fill="currentColor" d="M160 144c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zM416 240v112h-352v-48l80-80 40 40 128-128zM440 64h-400c-4.25 0-8 3.75-8 8v304c0 4.25 3.75 8 8 8h400c4.25 0 8-3.75 8-8v-304c0-4.25-3.75-8-8-8zM480 72v304c0 22-18 40-40 40h-400c-22 0-40-18-40-40v-304c0-22 18-40 40-40h400c22 0 40 18 40 40z"></path>
          </svg>
    `
    const counterHtml = items.length < 2 ? '' : `
        <div class="mkz-c-o__counter">
          ${index+1}/${items.length}
        </dvi>
    `
    const callbackLabel = this.t(this.behavior.attachment_cta.product.callback_label_text)
    const label = this.t(this.behavior.attachment_cta.product.label_text)
    return `
      <div class="mkz-c-o__i">
        <div class="mkz-c-o__content">
          <a href="${this.safe(item.url)}" class="mkz-c-o__preview-link">
            ${htmlPicture}
          </a>
          <div class="mkz-c-o__name">
            <a href="${this.safe(item.url)}" class="mkz-c-o__name-link">${this.safe(item.name)}</a>
          </div>
          <div class="mkz-c-o__info">
            <div class="mkz-c-o__info-price">
              ${this.safe(item.display_price)}
            </div>
          </div>
          <div class="mkz-c-o__action">
            <span
              data-data="${this.attribute(JSON.stringify(item))}"
              data-callback_label="${this.attribute(callbackLabel)}"
              class="mkz-c-o__btn mkz-c-o-js-action"
            >
              ${label}
            </span>
          </div>
        </div>
        ${counterHtml}
      </div>
    `
  }
  files (items) {
    return `
      <div class="mkz-c-f">
        ${items.map(this.file.bind(this)).join("\n")}
      </div>
    `
  }
  file (item, index, items) {
    if (!item.url) return ''
    return `
      <div class="mkz-c-f__i">
        <a href="${item.url}" target="_blank" class="mkz-c-f__link">
          <span class="mkz-c-f__preview">
            ${fileIcon}
          </span>
          <span class="mkz-c-f__content">
            <span class="mkz-c-f__text">
              <span class="mkz-c-f__name">${item.name || item.url}</span>
              <span class="mkz-c-f__size">${item.size ? helpers.formatFileSize(item.size) : ''}</span>
            </span>
          </span>
        </a>
      </div>`
  }
  images (files) {
    return `
      <div class="mkz-c-i">
        ${files.map(this.image.bind(this)).join("\n")}
      </div>
    `
  }
  image (item, index, items) {
    if (!item.url) return ''
    const count = items.length
    return `
      <div class="mkz-c-i__i mkz-c-i__i_type_${count === 1 ? 2 : index % 3}">
        <a
          href="${item.url}"
          target="_blank"
          class="mkz-c-i__link mkz-c-i-js"
          style="background-image: url('${this.attribute(item.url)}')"
        ></a>
      </div>`
  }
  form (fields, uid) {
    const html =  fields.map((item) => {
      switch(item.display_type) {
        case 'email':
          return this.formText(item, 'email')
        case 'numeric':
          return this.formText(item, 'text', 'numeric')
        case 'integer':
          return this.formText(item, 'text', 'integer')
        case 'boolean':
          return this.formBoolean(item)
        case 'select':
          return this.formSelect(item)
        case 'date':
          return this.formDate(item)
        case 'hint':
          return this.formHint(item)
        case 'button':
          return this.formButton(item)
        default:
          return this.formText(item, 'text')
      }
    })
    .filter((html) => html)
    .map((html) => `<div class="mkz-f__row">${html}</div>`)
    .join('')
    return `
      <form class="mkz-f mkz-f-js" data-uid="${this.attribute(uid)}" novalidate autocomplete="off">${html}</form>`
  }
  formText (data, type, attr = '') {
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <div class="mkz-f__control ${data.disabled ? 'mkz-f__control_type_success' : ''}">
      <input
        type="${type}"
        name="${data.field}"
        class="mkz-f__input"
        value="${this.attribute(data.value)}"
        ${data.disabled ? 'disabled="true"' : ''}
        ${data.required ? 'required' : ''}
        ${attr}
      />
    </div>
    `
  }
  formDate (data) {
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <div class="mkz-f__control ${data.disabled ? 'mkz-f__control_type_success' : ''}">
      <input
        type="date"
        name="${data.field}"
        class="mkz-f__input"
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        value="${this.attribute(data.value)}"
        ${data.disabled ? 'disabled="true"' : ''}
        ${data.required ? 'required' : ''}
      />
    </div>
    `
  }
  formBoolean (data) {
    const values = {
      '': '-',
      'true': this.t('true'),
      'false': this.t('false')
    }
    const options = helpers.entries(values).map(([value, text]) => {
      const selected = data.value === String(value) ? 'selected="selected"' : ''
      return `<option value="${this.attribute(value)}" ${selected}>${this.safe(text)}</option>`
    }).join('')
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <div class="mkz-f__control ${data.disabled ? 'mkz-f__control_type_success' : ''}">
      <select
        name="${data.field}"
        class="mkz-f__select"
        ${data.disabled ? 'disabled="true"' : ''}
        ${data.required ? 'required' : ''}
      >${options}</select>
    </div>
    `
  }
  formSelect (data) {
    const options = [['', '-']].concat(helpers.entries(data.predefined_values)).map(([value, text]) => {
      const selected = data.value === value ? 'selected="selected"' : ''
      return `<option value="${this.attribute(value)}" ${selected}>${this.safe(text)}</option>`
    }).join('')
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <div class="mkz-f__control ${data.disabled ? 'mkz-f__control_type_success' : ''}">
      <select
        name="${data.field}"
        class="mkz-f__select"
        ${data.disabled ? 'disabled="true"' : ''}
        ${data.required ? 'required' : ''}
      >${options}</select>
    </div>
    `
  }
  formHint (data) {
    if (data.disabled) return
    return `
    <div class="mkz-f__note">${this.safe(data.display_name)}</div>
    `
  }
  formButton (data) {
    if (data.disabled) return
    return `
    <button type="submit" class="mkz-f__btn">${this.safe(data.display_name)}</button>
    `
  }
  attachments (msg) {
    const attachmentGroups = (msg.attachments || []).reduce((result, item) => {
      if (!result[item.type]) result[item.type] = []
      result[item.type].push(item)
      return result
    }, {})
    return helpers.entries(attachmentGroups).map(([key, group]) => {
      switch(key) {
        case 'product':
          return this.offers(group)
        case 'file':
          return this.files(group)
        case 'image':
          return this.images(group)
      }
    })
  }
  isClientMsg (msg) {
    return msg.sender_type === 'client'
  }
  getDate (msg) {
    const isToday = (date) => {
      const today = new Date()
      return date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()
    }

    const string = msg.sent_at.replace(/\.[0-9]+Z$/g, '')
    const date = new Date(string)
    const dateWithTz = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    return format(dateWithTz, this.t(isToday(dateWithTz) ? 'time' : 'dateTime'))
  }
  message (msg) {
    const isClientMsg = this.isClientMsg(msg)
    const enable = this.app.settings.appearance.agent_avatar
    const avatarUrl = msg.sender_avatar_url
    const htmlDefaultAvatar = `
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__i-avatar-default mkz-c__avatar-default">
        <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="currentColor"/>
        <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" fill="white"/>
      </svg>
    `
    const htmlAgentAvatar = avatarUrl ? `<img src="${this.safe(avatarUrl)}" srcset="${helpers.srcset(avatarUrl)}" class="mkz-c__i-avatar-img" alt="" title="${this.safe(msg.sender_name)}" />` : htmlDefaultAvatar
    const htmlAvatar = enable ? `<div class="mkz-c__i-avatar">${htmlAgentAvatar}</div>` : ''
    const info = []
    info.push(this.getDate(msg))
    if (!isClientMsg && msg.sender_name) info.push(this.safe(msg.sender_name))
    return `
          <div class="mkz-c__i mkz-c__i_type_${isClientMsg ? 'client' : 'agent'}" data-id="${msg.muid}">
            ${htmlAvatar}
            <div class="mkz-c__i-content">
              <div class="mkz-c__i-blocks">
                ${this.messageContent(msg)}
              </div>
              <div class="mkz-c__i-info">
                ${info.join(', ')}
              </div>
            </div>
          </div>`
  }
  messageBlockWrap (html) {
    return `
      <div class="mkz-c__i-msg-block">
        ${html}
      </div>
    `
  }
  messageContent (msg) {
    const isClientMsg = this.isClientMsg(msg)
    const bg = isClientMsg ? this.appearance.client_msg_bg : this.appearance.agent_msg_bg
    const color = isClientMsg ? this.appearance.client_msg_color : this.appearance.agent_msg_color

    const msgWrap = (html) => `
        <div class="mkz-c__i-msg" style="background-color: ${this.safe(bg)}; color: ${this.safe(color)}">
          <div class="mkz-c__i-msg-overflow">
            ${html}
          </div>
        </div>
    `

    const htmlBlocks = []

    switch(msg.msg_type) {
      case 'survey:show':
        const customFields = msg.custom_fields
        const submitted = customFields.submitted
        const elements = customFields.elements.map((e) => {
          if (e.type === 'select' && !e.value) e.value = customFields.values && customFields.values[e.field]
          if (submitted) e.disabled = true
          return e
        })
        if (msg.text) {
          htmlBlocks.push(msgWrap(helpers.htmlFormatting(msg.text)))
        }
        htmlBlocks.push(this.form(elements, msg.muid))
        if (submitted && customFields.follow_up_text) {
          htmlBlocks.push(msgWrap(helpers.htmlFormatting(customFields.follow_up_text)))
        }
        break
      default:
        const text = helpers.htmlFormatting(msg.text)
        if (text) htmlBlocks.push(msgWrap(text))
        this.attachments(msg).forEach((attachment) => {
          htmlBlocks.push(attachment)
        })
    }

    return htmlBlocks.map(this.messageBlockWrap).join('')
  }
  doc (name) {
    return `
            <div class="mkz-c-docs__i">
              <div class="mkz-c-docs__btn">
                ${this.safe(name)}
              </div>
            </div>`
  }
  docs () {
    // Todo: Add real documents
    const docs = []
    return false ? `
      <div class="mkz-c__docs">
        <div class="mkz-c-docs">
          <div class="mkz-c-docs__list">${docs.map(this.doc.bind(this)).join("\n")}</div>
        </dvi>
      </div>
      ` : ''
  }
  copy () {
    return !this.appearance.markeaze_link ? '' : `
      <div class="mkz-c__copy-wrap">
        <a class="mkz-c__copy" href="https://markeaze.com/?utm_source=markeaze&utm_medium=ref&utm_campaign=chatbox" target="_blank">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__copy-logo">
            <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="currentColor"/>
            <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" fill="white"/>
          </svg>
          <span class="mkz-c__copy-text">${this.t('copyright')}</span>
        </a>
      </div>`
  }
  notice () {
    return this.appearance.notice_text && this.appearance.notice_text.trim() ? `
      <div class="mkz-c__tooltip mkz-c__tooltip_picture_yes" style="color: ${this.safe(this.appearance.notice_color)}; background-color: ${this.safe(this.appearance.notice_bg)}">
        <img src="${this.safe(this.appearance.notice_icon_url)}" class="mkz-c__tooltip-picture" alt="" />
        <div class="mkz-c__tooltip-text">
          ${this.safe(this.appearance.notice_text)}
        </div>
      </div>` : ''
  }
  content () {
    const chatPosition = ['l-t', 'l-b', 'l'].indexOf(this.appearance.bar_position) > -1 ? 'left' : 'right'
    const themeCss = this.theme ? `
[mkz] .mkz-c__head {
  border-color: ${this.safe(this.appearance.title_border)};
}

[mkz] .mkz-c__content {
  background-color: ${this.safe(this.appearance.list_bg)};
}
[mkz] .mkz-f__btn, [mkz] .mkz-c-o__btn {
  background-color: ${this.safe(this.appearance.btn_bg)};
  color: ${this.safe(this.appearance.btn_color)};
}
[mkz] .mkz-f__btn:hover, [mkz] .mkz-c-o__btn:hover {
  background-color: ${this.safe(this.appearance.btn_hover_bg)};
  color: ${this.safe(this.appearance.btn_hover_color)};
}
[mkz] .mkz-c__avatar-default {
  color: ${this.safe(this.appearance.bar_bg)};
}

[mkz] .mkz-c__footer {
  color: ${this.safe(this.appearance.form_color)};
  background-color: ${this.safe(this.appearance.form_bg)};
  border-color: ${this.safe(this.appearance.form_border)};
}
[mkz] .mkz-c__footer-btn {
  color: ${this.safe(this.appearance.form_action_color)};
}
[mkz] .mkz-c__footer-btn_type_submit {
  color: ${this.safe(this.appearance.form_submit_color)};
}
    ` : ''
    return `
<div mkz>
  <div class="mkz-c mkz-c-js">

    <div class="mkz-c__handler mkz-c__handler_type_${this.safe(this.appearance.bar_type)} mkz-c__handler_position_${this.safe(this.appearance.bar_position)} ${this.appearance.bar_bouncing ? 'mkz-c__handler_bouncing_yes' : ''}" style="margin: ${this.safe(this.appearance.bar_padding_y)}px ${this.safe(this.appearance.bar_padding_x)}px">
      ${this.notice()}
      <div class="mkz-c__btn mkz-c-js-toggle" style="background-color: ${this.appearance.bar_bg}; color: ${this.safe(this.appearance.bar_color)};">
        <div class="mkz-c__btn-text">
          <span class="mkz-c__btn-text-online">${this.safe(this.appearance.bar_text_online)}</span>
          <span class="mkz-c__btn-text-offline">${this.safe(this.appearance.bar_text_offline)}</span>
        </div>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__btn-picture">
          <rect x="20" y="20" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -12.4091 29.9928)" fill="#FFFFFF" width="20" height="20" fill="currentColor" class="mkz-c__btn-1" />
          <rect x="20" y="20" fill="#FFFFFF" width="20" height="20" fill="currentColor" class="mkz-c__btn-2" />
          <rect x="20" y="20" fill="#FFFFFF" width="20" height="20" fill="currentColor" class="mkz-c__btn-3" />
        </svg>
        <div class="mkz-c__btn-unread mkz-c-js-unread">0</div>
      </div>
    </div>

    <div class="mkz-c__chat mkz-c__chat_position_${chatPosition}" style="${this.view.width ? `max-width: ${this.view.width}px;` : '' }">
      <div class="mkz-c__cart-shadow"></div>
      <div class="mkz-c__cart mkz-c-js-cart">

        <div class="mkz-c__head" style="color: ${this.safe(this.appearance.title_color)}; background-color: ${this.safe(this.appearance.title_bg)};">

          <div class="mkz-c__head-row mkz-c__head-row_type_agent">
            <div class="mkz-c__head-title mkz-c__overflow">
              ${this.safe(this.appearance.title_text)}
            </div>
            <div class="mkz-c__head-action">
              <div class="mkz-c__mute mkz-c-js-mute">
                ${muteIcon}
              </div>
              <div class="mkz-c__unmute mkz-c-js-unmute">
                ${unmuteIcon}
              </div>
            </div>
            <div class="mkz-c__head-action">
              <div class="mkz-c__close mkz-c-js-close">
                ${downIcon}
              </div>
            </div>
          </div>

          <div class="mkz-c__head-row">
            <div class="mkz-c__head-state">
              <div class="mkz-c__state-wrap">
                <img class="mkz-c__m-assign-avatar mkz-c-js-agent-avatar" alt="" />
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__m-assign-avatar-default mkz-c__avatar-default mkz-c-js-agent-avatar-default">
                  <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="currentColor"/>
                  <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" fill="white"/>
                </svg>
                <div class="mkz-c__state"></div>
              </div>
            </div>
            <div class="mkz-c__head-m">
              <div class="mkz-c__m-assign-text mkz-c__overflow mkz-c-js-agent-name"></div>
              <div class="mkz-c__m-assign-post mkz-c__overflow mkz-c-js-agent-post"></div>
            </div>
          </div>

        </div>

        <div class="mkz-c__content">
          <div class="mkz-c__scroll mkz-c-js-scroll">
            <div class="mkz-c__list mkz-c-js-history"></div>
            ${this.copy()}
          </div>
        </div>

        ${this.docs()}

        <label class="mkz-c__footer">
          <div class="mkz-c__footer-msg">
            <textarea class="mkz-c__input mkz-c-js-input" rows="1" placeholder="${this.safe(this.appearance.placeholder || this.t('placeholder'))}"></textarea>
          </div>
          <div class="mkz-c__footer-actions">
            <label class="mkz-c__footer-btn mkz-c-attach-js">
              ${this.view.previewMode ? attachIcon : ''}
            </label>
            <div class="mkz-c__footer-btn mkz-c__footer-btn_type_submit mkz-c-js-submit">
              ${sendIcon}
            </div>
          </div>
        </label>

      </div>
    </div>
  </div>

  <style type="text/css">${css}${themeCss}</style>

</div>
    `
  }
}