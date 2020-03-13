const css = require('raw-loader!sass-loader!./../stylesheets/application.sass')
const helpers = require('./libs/helpers')
const translations = require('./translations')

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
    return data.replace(/\"/ig, '&quot;')
  }
  offer (offer, index, offers) {
    const htmlPicture = offer.icon ? `
          <img src="${this.safe(offer.icon)}" alt="" class="mkz-c-o__preview-img" />
    ` : `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="480" height="448" viewBox="0 0 480 448" class="mkz-c-o__preview-img">
            <path fill="currentColor" d="M160 144c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zM416 240v112h-352v-48l80-80 40 40 128-128zM440 64h-400c-4.25 0-8 3.75-8 8v304c0 4.25 3.75 8 8 8h400c4.25 0 8-3.75 8-8v-304c0-4.25-3.75-8-8-8zM480 72v304c0 22-18 40-40 40h-400c-22 0-40-18-40-40v-304c0-22 18-40 40-40h400c22 0 40 18 40 40z"></path>
          </svg>
    `
    const counterHtml = offers.length < 2 ? '' : `
        <div class="mkz-c-o__counter">
          ${index+1}/${offers.length}
        </dvi>
    `
    const callbackLabel = this.t(this.behavior.attachment_cta.product.callback_label_text)
    const label = this.t(this.behavior.attachment_cta.product.label_text)
    return `
      <div class="mkz-c-o__i">
        <div class="mkz-c-o__content">
          <a href="${this.safe(offer.url)}" class="mkz-c-o__preview-link">
            ${htmlPicture}
          </a>
          <div class="mkz-c-o__name">
            <a href="${this.safe(offer.url)}" class="mkz-c-o__name-link">${this.safe(offer.name)}</a>
          </div>
          <div class="mkz-c-o__info">
            <div class="mkz-c-o__info-price">
              ${this.safe(offer.display_price)}
            </div>
            <div class="mkz-c-o__info-avaliable mkz-c-o__info-avaliable_color_${offer.available ? 'green' : 'red'}">
              ${this.t(offer.available ? 'in_stock' : 'out_of_stock')}
            </div>
          </div>
          <div class="mkz-c-o__action">
            <span
              data-data="${this.attribute(JSON.stringify(offer))}"
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
  offers (offers) {
    if (!offers) return ''
    return `
    <div class="mkz-c-o">
      ${offers.map(this.offer.bind(this)).join("\n")}
    </div>`
  }
  form (fields, uid) {
    const html =  fields.map((item) => {
      switch(item.display_type) {
        case 'email':
          return this.formText(item, 'email')
        case 'numeric':
          return this.formText(item, 'number')
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
    .map((html) => `<div class="mkz-f__row">${html}</div>`)
    .join('')
    return `
      <form class="mkz-f mkz-f-js" data-uid="${this.attribute(uid)}" novalidate autocomplete="off">${html}</form>`
  }
  formText (data, type) {
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <input
      type="${type}"
      name="${data.field}"
      class="mkz-f__input"
      value="${this.attribute(data.value)}"
      ${data.disabled ? 'disabled="true"' : ''}
      ${data.required && 'required'}
    />
    `
  }
  formDate (data) {
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <input
      type="date"
      name="${data.field}"
      class="mkz-f__input"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
      value="${this.attribute(data.value)}"
      ${data.disabled ? 'disabled="true"' : ''}
      ${data.required && 'required'}
    />
    `
  }
  formSelect (data) {
    const options = [['', '-']].concat(Object.entries(data.predefined_values)).map(([value, text]) => {
      const selected = data.value === value ? 'selected="selected"' : ''
      return `<option value="${this.attribute(value)}" ${selected}>${this.safe(text)}</option>`
    }).join('')
    return `
    <label class="mkz-f__label">${this.safe(data.display_name)}</label>
    <select
      name="${data.field}"
      class="mkz-f__select"
      ${data.disabled ? 'disabled="true"' : ''}
      ${data.required && 'required'}
    >${this.safe(options)}</select>
    `
  }
  formHint (data) {
    return `
    <div class="mkz-f__note">${this.safe(data.display_name)}</div>
    `
  }
  formButton (data) {
    return `
    <button type="submit" class="mkz-f__btn" ${data.disabled ? 'disabled="true"' : ''}>${this.safe(data.display_name)}</button>
    `
  }
  attachments (msg) {
    const attachmentGroups = (msg.attachments || []).reduce((result, item) => {
      if (!result[item.type]) result[item.type] = []
      result[item.type].push(item)
      return result
    }, {})
    return Object.entries(attachmentGroups).map(([key, group]) => {
      switch(key) {
        case 'product':
          return this.offers(group)
      }
    })
  }
  message (msg) {
    const htmlAvatar = msg.sender_avatar_url ? `<div class="mkz-c__i-avatar"><img src="${this.safe(msg.sender_avatar_url)}" srcset="${helpers.srcset(msg.sender_avatar_url)}" class="mkz-c__i-avatar-img" alt="" title="${this.safe(msg.sender_name)}" /></div>` : ''
    return `
          <div class="mkz-c__i mkz-c__i_type_${msg.sender_type === 'client' ? 'client' : 'agent'}" data-id="${msg.muid}">
            ${htmlAvatar}
            <div class="mkz-c__i-content">
              ${this.messageContent(msg)}
            </div>
          </div>`
  }
  messageContent (msg) {
    const bg = msg.sender_type === 'client' ? this.appearance.client_msg_bg : this.appearance.agent_msg_bg
    const color = msg.sender_type === 'client' ? this.appearance.client_msg_color : this.appearance.agent_msg_color
    const wrap = (html) => `
      <div class="mkz-c__i-msg" style="background-color: ${this.safe(bg)}; color: ${this.safe(color)}">
        <div class="mkz-c__i-msg-overflow">
          ${html}
        </div>
      </div>`
    switch(msg.msg_type) {
      case 'survey:show':
        const customFields = msg.custom_fields
        const submitted = customFields.submitted
        const hidden = customFields.hidden
        const elements = customFields.elements.map((e) => {
          e.value = customFields.values && customFields.values[e.field]
          return e
        })
        const followUp = helpers.textFormatting(customFields.follow_up_text)
        const htmlText = msg.text ? wrap(helpers.textFormatting(msg.text)) : ''
        const htmlForm = submitted ? wrap(followUp) : (hidden ? '' : wrap(this.form(elements, msg.muid)))
        return htmlText + htmlForm
      default:
        const text = helpers.textFormatting(msg.text)
        return `
          ${text ? wrap(text) : ''}
          ${this.attachments(msg)}`
    }
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
      <a class="mkz-c__copy" href="https://markeaze.com?utm_source=markeaze&utm_campaign=referral" target="_blank">
        <svg width="11" height="9" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.94727 2.8471C2.12716 2.49158 2.57173 2.38949 2.87918 2.63311C3.12176 2.82531 3.19515 3.17138 3.05276 3.45164L1.17079 7.15577C0.991709 7.50824 0.550808 7.60949 0.24532 7.3683C0.0037509 7.17757 -0.0698014 6.83352 0.0713545 6.55454L1.94727 2.8471Z" fill="#FC4566"/>
          <path d="M5.35667 1.9023C5.54038 1.55555 5.9926 1.45484 6.30746 1.69056C6.55814 1.87824 6.63496 2.21903 6.48885 2.49519L4.02121 7.15912C3.83664 7.50797 3.38122 7.60839 3.06569 7.36982C2.81616 7.18115 2.74036 6.8407 2.88648 6.5649L5.35667 1.9023Z" fill="#0EC52C"/>
          <path d="M8.81247 0.351483C8.99329 -0.00816918 9.44199 -0.111851 9.75226 0.134322C9.99632 0.327953 10.0705 0.67639 9.92784 0.959046L6.80213 7.15236C6.62323 7.50684 6.18144 7.61011 5.87387 7.36934C5.62976 7.17824 5.55453 6.83147 5.6961 6.54989L8.81247 0.351483Z" fill="#7261FF"/>
        </svg>
        ${this.t('copyright')}
      </a>`
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
    const chatPosition = ['l-t', 'l-b'].indexOf(this.appearance.bar_position) > -1 ? 'left' : 'right'
    return `
<div mkz>
  <div class="mkz-c mkz-c_collapse_yes mkz-c-js">

    <div class="mkz-c__handler mkz-c__handler_type_${this.safe(this.appearance.bar_type)} mkz-c__handler_position_${this.safe(this.appearance.bar_position)}" style="margin: ${this.safe(this.appearance.bar_padding_y)} ${this.safe(this.appearance.bar_padding_x)}">
      ${this.notice()}
      <div class="mkz-c__btn mkz-c-js-toggle" style="background-color: ${this.appearance.bar_bg}; color: ${this.safe(this.appearance.bar_color)};">
        <div class="mkz-c__btn-text">
          <span class="mkz-c__btn-text-online">${this.safe(this.appearance.bar_text_online)}</span>
          <span class="mkz-c__btn-text-offline">${this.safe(this.appearance.bar_text_offline)}</span>
        </div>
        <svg width="27" height="27" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__btn-picture">
          <path d="M20.6429 10.4641C20.6466 11.8783 20.3162 13.2733 19.6786 14.5355C18.9226 16.0481 17.7605 17.3204 16.3223 18.2098C14.8841 19.0992 13.2267 19.5706 11.5357 19.5713C10.1216 19.5749 8.72659 19.2445 7.46432 18.607L1.35718 20.6427L3.39289 14.5355C2.75532 13.2733 2.42492 11.8783 2.42861 10.4641C2.42926 8.77313 2.90069 7.11573 3.79009 5.67755C4.67949 4.23937 5.95174 3.07721 7.46432 2.32125C8.72659 1.68368 10.1216 1.35328 11.5357 1.35696H12.0715C14.3047 1.48017 16.414 2.42278 17.9955 4.00431C19.5771 5.58585 20.5197 7.69516 20.6429 9.92839V10.4641Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="mkz-c__btn-unread mkz-c-js-unread">0</div>
      </div>
    </div>

    <div class="mkz-c__chat mkz-c__chat_position_${chatPosition}" style="${this.view.width ? `max-width: ${this.view.width}px;` : '' }">
      <div class="mkz-c__cart-shadow" style="box-shadow: 0 0 10px ${this.safe(this.appearance.title_bg)};"></div>
      <div class="mkz-c__cart">
        <div class="mkz-c__head" style="color: ${this.safe(this.appearance.title_color)}; background-color: ${this.safe(this.appearance.title_bg)};">
          <div class="mkz-c__head-state">
            <div class="mkz-c__state-wrap">
              <img class="mkz-c__m-assign-avatar mkz-c-js-agent-avatar" alt="" />
              <div class="mkz-c__state"></div>
            </div>
          </div>
          <div class="mkz-c__head-m">
            <div class="mkz-c__m-assign-text mkz-c-js-agent-name"></div>
            <div class="mkz-c__m-assign-post mkz-c-js-agent-post"></div>
            <div class="mkz-c__m-unassign-text">${this.safe(this.appearance.bar_text_offline)}</div>
          </div>
          <div class="mkz-c__head-action">
            <div class="mkz-c__close mkz-c-js-close">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4287 4.57129L4.57153 11.4284" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.57153 4.57129L11.4287 11.4284" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="mkz-c__content mkz-c-js-scroll">
          <div class="mkz-c__list mkz-c-js-history"></div>
        </div>
        ${this.docs()}
        <label class="mkz-c__footer">
          <div class="mkz-c__footer-msg">
            <textarea class="mkz-c__input mkz-c-js-input" rows="1" placeholder="${this.t('placeholder')}"></textarea>
          </div>
          <div class="mkz-c__footer-btn">
            <div class="mkz-c__submit mkz-c-js-submit">
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9675 0.949039L12.9784 17.6706C12.9069 17.8682 12.7194 17.9999 12.5092 18H12.3495C12.1535 18 11.9749 17.8874 11.8903 17.7105L9.53462 12.719C9.18774 11.9831 9.322 11.1103 9.874 10.5128L12.8686 7.23833C13.0524 7.04551 13.0524 6.74232 12.8686 6.5495L12.4893 6.17015C12.2965 5.98633 11.9933 5.98633 11.8005 6.17015L8.52644 9.16505C7.92893 9.71711 7.05625 9.85139 6.32044 9.50447L1.32949 7.14848C1.13702 7.076 1.00706 6.89483 1.00009 6.68926V6.52953C0.982409 6.30492 1.11738 6.09631 1.32949 6.0204L18.0492 0.0306031C18.2289 -0.0354106 18.4306 0.00725579 18.5682 0.140416L18.8278 0.399974C18.9838 0.536262 19.0394 0.754748 18.9675 0.949039Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </label>
      </div>
      ${this.copy()}
    </div>
  </div>

  <style type="text/css">${css}</style>

</div>
    `
  }
}