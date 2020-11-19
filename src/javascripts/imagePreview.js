const translations = require('./translations')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')
const { downlodIcon, closeIcon, rightIcon, leftIcon } = require('./libs/icons')

export default class ImagePreview {
  constructor (view, index, elImages) {
    this.app = view.app
    this.view = view
    this.index = index
    this.elImages = elImages
    this.total = Object.values(elImages).length

    this.render()
  }
  t (key) {
    return translations[this.app.locale][key]
  }
  render () {
    if (this.elContainer) this.remove()

    const src = this.elImages.item(this.index).href
    helpers.appendHTML(this.view.elCard, this.template(src, this.index, this.total))

    this.elContainer = this.view.elCard.querySelector('.mkz-c-i-js-container')
    this.elClose = this.view.elCard.querySelector('.mkz-c-i-js-close')
    this.elPrev = this.view.elCard.querySelector('.mkz-c-i-js-prev')
    this.elNext = this.view.elCard.querySelector('.mkz-c-i-js-next')

    this.bind()
  }
  remove () {
    this.unbind()

    this.elContainer.parentNode.removeChild(this.elContainer)
    delete this.elContainer
  }
  bind () {
    domEvent.add(this.elClose, 'click', this.remove.bind(this))
    if (this.elPrev) domEvent.add(this.elPrev, 'click', this.onPrev.bind(this))
    if (this.elNext) domEvent.add(this.elNext, 'click', this.onNext.bind(this))

    domEvent.add(window, 'keydown', this.onKeyDown.bind(this))
  }
  unbind () {
    domEvent.remove(window, 'keydown', this.onKeyDown.bind(this))
  }
  onKeyDown (e) {
    if (e.key === 'Escape') this.remove()
    if (e.key === 'ArrowLeft') this.onPrev()
    if (e.key === 'ArrowRight') this.onNext()
  }
  onPrev () {
    if (!this.elContainer || this.index <= 0) return
    this.index--
    this.render()
  }
  onNext () {
    if (!this.elContainer || this.index + 1 >= this.total) return
    this.index++
    this.render()
  }
  template (src, index, total) {
    const prevHtml = total === 1 ? '' : `
          <div class="mkz-c-preview__prev mkz-c-i-js-prev">
            ${leftIcon}
          </div>
    `
    const nextHtml = total === 1 ? '' : `
          <div class="mkz-c-preview__next mkz-c-i-js-next">
            ${rightIcon}
          </div>
    `
    return `
      <div class="mkz-c-preview mkz-c-i-js-container">
        <a class="mkz-c-preview__btn mkz-c-preview__btn_type_download" href="${src}" target="_blank">
          ${downlodIcon}
        </a>
        <div class="mkz-c-preview__btn mkz-c-preview__btn_type_close mkz-c-i-js-close">
          ${closeIcon}
        </div>
        <div class="mkz-c-preview__content">
          <img src="${src}" alt="" class="mkz-c-preview__img" />
        </div>
        <div class="mkz-c-preview__action">
          ${prevHtml}
          <div class="mkz-c-preview__paginate">
            ${index + 1} ${this.t('paginate')} ${total}
          </div>
          ${nextHtml}
        </div>
      </div>
    `
  }
}
