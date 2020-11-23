const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const helpers = require('./libs/helpers')
const translations = require('./translations')
const format = require('dateformat')
const themes = require('./themes').default
const {
  sendIcon, closeIcon, muteIcon, unmuteIcon, fileIcon, attachIcon,
  rightIcon, leftIcon, botIcon, typingIcon, linkIcon
} = require('./libs/icons')
const { senderTypeClient, senderTypeAgent, senderTypeSsa } = require('./constants')

export default class Template {
  constructor (view) {
    this.app = view.app
    this.view = view
    this.appearance = this.app.settings.appearance
    this.behavior = this.app.settings.behavior

    const theme = this.appearance.theme
    if (theme && themes[theme]) {
      this.theme = this.appearance.theme
      this.appearance = {
        ...themes[theme],
        ...this.appearance
      }
    } else {
      const themeBg = this.appearance.theme_bg
      const themeColor = this.appearance.theme_color
      if (themeBg && themeColor) {
        this.appearance = {
          ...this.appearance,
          bar_bg: themeBg,
          bar_color: themeColor,
          title_bg: themeBg,
          title_color: themeColor,
          title_border: themeBg,
          client_msg_bg: themeBg,
          client_msg_color: themeColor,
          btn_bg: themeBg,
          btn_color: themeColor,
          form_submit_color: themeBg
        }
      }
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
  messageProducts (msg) {
    const products = (msg.attachments || []).filter((i) => i.type === 'product')
    if (products.length === 0) return ''
    return `
    <div class="mkz-c-o mkz-c-o_slider_${products.length > 1 ? 'yes mkz-c-o-js' : 'no'}">
      <div class="mkz-c-o__relative">
        <div class="mkz-c-o__navi mkz-c-o__navi_type_prev mkz-c-o__navi_disable_yes mkz-c-o-js-prev">${leftIcon}</div>
        <div class="mkz-c-o__navi mkz-c-o__navi_type_next mkz-c-o__navi_disable_yes mkz-c-o-js-next">${rightIcon}</div>
        <div class="mkz-c-o__list mkz-c-o-js-list">
          ${products.map(this.product.bind(this)).join('')}
        </div>
      </div>
    </div>`
  }
  product (item, index, items) {
    const htmlPicture = item.icon ? `
          <img src="${this.safe(item.icon)}" alt="" class="mkz-c-o__preview-img" />
    ` : `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="480" height="448" viewBox="0 0 480 448" class="mkz-c-o__preview-img">
            <path fill="currentColor" d="M160 144c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zM416 240v112h-352v-48l80-80 40 40 128-128zM440 64h-400c-4.25 0-8 3.75-8 8v304c0 4.25 3.75 8 8 8h400c4.25 0 8-3.75 8-8v-304c0-4.25-3.75-8-8-8zM480 72v304c0 22-18 40-40 40h-400c-22 0-40-18-40-40v-304c0-22 18-40 40-40h400c22 0 40 18 40 40z"></path>
          </svg>
    `
    const callbackLabel = this.t(this.behavior.attachment_cta.product.callback_label_text)
    const label = this.t(this.behavior.attachment_cta.product.label_text)
    return `
      <div class="mkz-c-o__i ${index === 0 ? 'mkz-c-o__i_current_yes' : ''} mkz-c-o-js-i">
        <div class="mkz-c-o__content">
          <a href="${this.safe(item.url)}" class="mkz-c-o__preview-link">
            <div class="mkz-c-o__counter">
              ${index+1}/${items.length}
            </div>
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
  orders (orders) {
    return `
      <div class="mkz-c-orders">
        ${orders.map(this.order.bind(this)).join("\n")}
      </div>
    `
  }
  order (item, index, items) {
    const htmlFulfillmentStatus = item.fulfillment_status ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_fulfillment_status')}</span>
          <span class="mkz-c-orders__field-value">${this.safe(item.fulfillment_status)}</span>
        </div>` : ''
    const htmlFinancialStatus = item.payment_method ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_payment_method')}</span>
          <span class="mkz-c-orders__field-value">${this.safe(item.payment_method)}</span>
        </div>`: ''
    const htmlPaymentMethod = item.financial_status ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_financial_status')}</span>
          <span class="mkz-c-orders__field-value">${this.safe(item.financial_status)}</span>
        </div>`: ''
    const htmlDisplayTotal = item.display_total ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_total')}</span>
          <span class="mkz-c-orders__field-value">${this.safe(item.display_total)}</span>
        </div>` : ''
    const htmlShippingCarrier = item.shipping_carrier ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_shipping_carrier')}</span>
          <span class="mkz-c-orders__field-value">${this.safe(item.shipping_carrier)}</span>
        </div>` : ''
    const htmlTrackingLink = item.tracking_link ? `<a href="${this.safe(item.tracking_link)}" target="_blank">${this.safe(item.tracking_number)}<span class="mkz-c-orders__link-icon">${linkIcon}</span></a>` : this.safe(item.tracking_number)
    const htmlTrackingNumber = item.tracking_number ? `
        <div class="mkz-c-orders__field">
          <span class="mkz-c-orders__field-label">${this.t('order_tracking_number')}</span>
          <span class="mkz-c-orders__field-value">${htmlTrackingLink}</span>
        </div>` : ''
    const defaultofferPictureUrl = 'https://themes.markeaze.com/default/web-client/picture.svg'
    const htmlOffers = item.items.map((offer) => {
      return `<a class="mkz-c-orders__offer" href="${this.safe(offer.url)}" target="_blank" style="background-image: url(${this.safe(offer.main_image_url || defaultofferPictureUrl)})"></a>`
    })
    return `
      <div class="mkz-c-orders__i mkz-c__i-msg">
        <div class="mkz-c-orders__section">
          <div class="mkz-c-orders__number">
            ${this.safe(this.t('order_number', { value: item.uid }))}
          </div>
        </div>
        <div class="mkz-c-orders__section">
          ${htmlFulfillmentStatus}
          ${htmlPaymentMethod}
          ${htmlFinancialStatus}
          ${htmlDisplayTotal}
          <div class="mkz-c-orders__offers">
            ${htmlOffers.join('')}
          </div>
        </div>
        <div class="mkz-c-orders__section">
          ${htmlShippingCarrier}
          ${htmlTrackingNumber}
        </div>
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
    const attachmentGroups = helpers.entries((msg.attachments || []).reduce((result, item) => {
      if (!result[item.type]) result[item.type] = []
      result[item.type].push(item)
      return result
    }, {}))
    return attachmentGroups.map(([key, group]) => {
      switch(key) {
        case 'file':
          return this.files(group)
        case 'image':
          return this.images(group)
        case 'order':
          return this.orders(group)
      }
    }).filter((i) => i)
  }
  isClientMsg (msg) {
    return msg.sender_type === senderTypeClient
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
  messageInfo (msg) {
    const isClientMsg = this.isClientMsg(msg)
    const info = []
    info.push(this.getDate(msg))
    if (!isClientMsg && msg.sender_name) info.push(this.safe(msg.sender_name))
    return `<div class="mkz-c__i-info">
      ${info.join(', ')}
    </div>`
  }
  message (msg) {
    const isClientMsg = this.isClientMsg(msg)
    let htmlAgentAvatar = ''
    let htmlTyping = ''
    if (msg.sender_type === senderTypeSsa) {
      htmlAgentAvatar = botIcon
      htmlTyping = `<div class="mkz-c__i-typing">
        <div class="mkz-c__i-msg">${typingIcon}</div>
      </div>`
    } else {
      const avatarUrl = msg.sender_avatar_url
      const htmlDefaultAvatar = `
        <svg viewBox="0 0 16 16" class="mkz-c__i-avatar-default mkz-c__avatar-default">
          <rect x="0" y="0" width="16" height="16" fill="currentColor"/>
          <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" class="mkz-c__avatar-default-inner" />
        </svg>
      `
      htmlAgentAvatar = avatarUrl ? `<img src="${this.safe(avatarUrl)}" srcset="${helpers.srcset(avatarUrl)}" class="mkz-c__i-avatar-img" alt="" title="${this.safe(msg.sender_name)}" />` : htmlDefaultAvatar
    }
    return `
          <div class="mkz-c__i mkz-c__i_type_${isClientMsg ? senderTypeClient : senderTypeAgent} ${msg.animate ? 'mkz-c__i_animate_yes' : ''}" data-id="${msg.muid}">
            <div class="mkz-c__i-row">
              <div class="mkz-c__i-avatar">${htmlAgentAvatar}</div>
              <div class="mkz-c__i-content">
                <div class="mkz-c__i-blocks">
                  ${this.messageContent(msg)}
                </div>
                ${htmlTyping}
              </div>
            </div>
            ${this.messageProducts(msg)}
            ${this.messageInfo(msg)}
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
          if (e.type === 'select' && !e.value) e.value = customFields.values?.[e.field]
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
    return this.appearance.notice_text?.trim() ? `
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
  <div class="mkz-c mkz-c_avatar_show mkz-c-js">

    <div class="mkz-c__handler mkz-c__handler_type_${this.safe(this.appearance.bar_type)} mkz-c__handler_position_${this.safe(this.appearance.bar_position)} ${this.appearance.bar_bouncing ? 'mkz-c__handler_bouncing_yes' : ''}" style="margin: ${this.safe(this.appearance.bar_padding_y)}px ${this.safe(this.appearance.bar_padding_x)}px">
      <div class="mkz-c__f mkz-c-js-f">
        <div class="mkz-c__f-list-close mkz-c-js-f-close">
          ${closeIcon}
        </div>
        <div class="mkz-c__f-list mkz-c-js-f-history"></div>
      </div>
      ${this.notice()}
      <div class="mkz-c__btn mkz-c-js-toggle" style="background-color: ${this.appearance.bar_bg};">
        <div class="mkz-c__btn-text">
          <span class="mkz-c__btn-text-online">${this.safe(this.appearance.bar_text_online)}</span>
          <span class="mkz-c__btn-text-offline">${this.safe(this.appearance.bar_text_offline)}</span>
        </div>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__btn-picture">
          <rect x="20" y="20" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -12.4091 29.9928)" fill="${this.safe(this.appearance.bar_color)}" width="20" height="20" fill="currentColor" class="mkz-c__btn-1" />
          <rect x="20" y="20" fill="${this.safe(this.appearance.bar_color)}" width="20" height="20" fill="currentColor" class="mkz-c__btn-2" />
          <rect x="20" y="20" fill="${this.safe(this.appearance.bar_color)}" width="20" height="20" fill="currentColor" class="mkz-c__btn-3" />
        </svg>
        <div class="mkz-c__btn-unread mkz-c-js-unread">0</div>
      </div>
    </div>

    <div class="mkz-c__chat mkz-c__chat_position_${chatPosition}" style="${this.view.width ? `max-width: ${this.view.width}px;` : '' }">
      <div class="mkz-c__cart-shadow"></div>
      <div class="mkz-c__cart mkz-c-js-card">

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
                ${closeIcon}
              </div>
            </div>
          </div>

          <div class="mkz-c__head-row">
            <div class="mkz-c__head-state">
              <div class="mkz-c__state-wrap">
                <img class="mkz-c__m-assign-avatar mkz-c-js-agent-avatar" alt="" />
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__m-assign-avatar-default mkz-c__avatar-default mkz-c-js-agent-avatar-default">
                  <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="currentColor"/>
                  <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" class="mkz-c__avatar-default-inner" />
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

  <style type="text/css">
    ${css}
[mkz] .mkz-c__head {
  border-color: ${this.safe(this.appearance.title_border)};
}

[mkz] .mkz-c__content {
  background-color: ${this.safe(this.appearance.list_bg)};
}
[mkz] .mkz-f__btn, [mkz] .mkz-c-o__btn, [mkz] .mkz-f__btn:hover, [mkz] .mkz-c-o__btn:hover {
  background-color: ${this.safe(this.appearance.btn_bg)};
  color: ${this.safe(this.appearance.btn_color)};
}
[mkz] .mkz-c__avatar-default {
  color: ${this.safe(this.appearance.bar_bg)};
}
[mkz] .mkz-c__avatar-default-inner {
  fill: ${this.safe(this.appearance.bar_color)};
}

[mkz] .mkz-c__footer {
  color: ${this.safe(this.appearance.form_color)};
  background-color: ${this.safe(this.appearance.form_bg)};
  border-color: ${this.safe(this.appearance.form_border)};
}
[mkz] .mkz-c__footer-btn {
  color: ${this.safe(this.appearance.form_action_color)};
}
  </style>

</div>
    `
  }
}