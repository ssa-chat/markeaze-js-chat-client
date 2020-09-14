const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const helpers = require('./libs/helpers')
const translations = require('./translations')
const format = require('dateformat')

export default class Template {
  constructor (view) {
    this.app = view.app
    this.view = view
    this.appearance = this.app.settings.appearance
    this.behavior = this.app.settings.behavior
  }
  safe (str) {
    return helpers.htmlToText(str)
  }
  t (key) {
    return translations[this.app.locale][key]
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
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10H13L9 14L5 10H8V6H10V10ZM12 2H2V18H16V6H12V2ZM0 0.992C0 0.444 0.447 0 0.999 0H13L18 5V18.993C18.0009 19.1243 17.976 19.2545 17.9266 19.3762C17.8772 19.4979 17.8043 19.6087 17.7121 19.7022C17.6199 19.7957 17.5101 19.8701 17.3892 19.9212C17.2682 19.9723 17.1383 19.9991 17.007 20H0.993C0.730378 19.9982 0.479017 19.8931 0.293218 19.7075C0.107418 19.5219 0.00209465 19.2706 0 19.008V0.992Z" fill="currentColor"/>
            </svg>
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
    const avatarUrl = msg.sender_avatar_url || this.view.defaultAvatarUrl
    const htmlAvatar = enable ? `<div class="mkz-c__i-avatar"><img src="${this.safe(avatarUrl)}" srcset="${helpers.srcset(avatarUrl)}" class="mkz-c__i-avatar-img" alt="" title="${this.safe(msg.sender_name)}" /></div>` : ''
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
            <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="#FC6881"/>
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
                <svg width="16" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 6.5C11.5 5.30653 11.0259 4.16193 10.182 3.31802C9.33807 2.47411 8.19347 2 7 2C5.80653 2 4.66193 2.47411 3.81802 3.31802C2.97411 4.16193 2.5 5.30653 2.5 6.5V12.5H11.5V6.5ZM13 13.0002L13.3 13.4C13.3418 13.4557 13.3672 13.522 13.3735 13.5913C13.3797 13.6607 13.3666 13.7304 13.3354 13.7927C13.3043 13.855 13.2564 13.9074 13.1971 13.944C13.1379 13.9806 13.0696 14 13 14H1C0.930358 14 0.862092 13.9806 0.802851 13.944C0.74361 13.9074 0.695735 13.855 0.66459 13.7927C0.633445 13.7304 0.620261 13.6607 0.626515 13.5913C0.63277 13.522 0.658215 13.4557 0.7 13.4L1 13.0002V6.5C1 4.9087 1.63214 3.38258 2.75736 2.25736C3.88258 1.13214 5.4087 0.5 7 0.5C8.5913 0.5 10.1174 1.13214 11.2426 2.25736C12.3679 3.38258 13 4.9087 13 6.5V13.0002ZM5.125 14.75H8.875C8.875 15.2473 8.67746 15.7242 8.32583 16.0758C7.97419 16.4275 7.49728 16.625 7 16.625C6.50272 16.625 6.02581 16.4275 5.67417 16.0758C5.32254 15.7242 5.125 15.2473 5.125 14.75Z" fill="currentColor" />
                </svg>
              </div>
              <div class="mkz-c__unmute mkz-c-js-unmute">
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9395 14H2.00005C1.93041 14 1.86214 13.9806 1.8029 13.944C1.74366 13.9074 1.69578 13.855 1.66464 13.7927C1.63349 13.7304 1.62031 13.6607 1.62656 13.5913C1.63282 13.522 1.65826 13.4557 1.70005 13.4L2.00005 13.0002V6.49999C2.00005 5.50249 2.24305 4.56199 2.6743 3.73474L0.0447998 1.10599L1.10605 0.0447388L15.9553 14.8947L14.894 15.9552L12.9395 14ZM3.80605 4.86649C3.60326 5.3872 3.49948 5.94119 3.50005 6.49999V12.5H11.4395L3.80605 4.86649ZM14 10.8395L12.5 9.33949V6.49999C12.5002 5.71074 12.2928 4.93533 11.8986 4.25158C11.5043 3.56782 10.9372 2.99977 10.2541 2.60443C9.57105 2.20908 8.79599 2.00035 8.00674 1.99918C7.2175 1.998 6.44182 2.20443 5.75755 2.59774L4.67005 1.50874C5.5736 0.905901 6.62385 0.559648 7.70876 0.506916C8.79368 0.454183 9.87255 0.69695 10.8303 1.20932C11.7881 1.72169 12.5888 2.48444 13.147 3.4162C13.7052 4.34797 14.0001 5.4138 14 6.49999V10.8395ZM6.12505 14.75H9.87505C9.87505 15.2473 9.67751 15.7242 9.32587 16.0758C8.97424 16.4274 8.49733 16.625 8.00005 16.625C7.50277 16.625 7.02586 16.4274 6.67422 16.0758C6.32259 15.7242 6.12505 15.2473 6.12505 14.75Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div class="mkz-c__head-action">
              <div class="mkz-c__close mkz-c-js-close">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3.81846L8.88906 8.56553e-07L10 1.09077L5 6L-5.24496e-07 1.09077L1.11094 1.76568e-07L5 3.81846Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          <div class="mkz-c__head-row">
            <div class="mkz-c__head-state">
              <div class="mkz-c__state-wrap">
                <img class="mkz-c__m-assign-avatar mkz-c-js-agent-avatar" alt="" />
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
          <div class="mkz-c__footer-btn">
            <div class="mkz-c__submit mkz-c-js-submit">
              <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.42925 0.290672L18.3527 9.59851C18.4246 9.63807 18.4845 9.6962 18.5263 9.76682C18.568 9.83744 18.59 9.91797 18.59 10C18.59 10.082 18.568 10.1626 18.5263 10.2332C18.4845 10.3038 18.4246 10.3619 18.3527 10.4015L1.42925 19.7093C1.35947 19.7477 1.28089 19.7673 1.20125 19.766C1.12161 19.7648 1.04367 19.7428 0.975112 19.7023C0.906549 19.6618 0.84973 19.6041 0.810256 19.5349C0.770781 19.4657 0.750014 19.3875 0.75 19.3078V0.692172C0.750014 0.612527 0.770781 0.534261 0.810256 0.465086C0.84973 0.395912 0.906549 0.338218 0.975112 0.297691C1.04367 0.257164 1.12161 0.235203 1.20125 0.233972C1.28089 0.232741 1.35947 0.252283 1.42925 0.290672ZM2.58333 10.9167V16.9823L15.2792 10L2.58333 3.01776V9.08334H7.16667V10.9167H2.58333Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </label>

      </div>
    </div>
  </div>

  <style type="text/css">${css}</style>

</div>
    `
  }
}