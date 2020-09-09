const translations = require('./translations')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')

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
    if (this.elContainer) this.removeContainer()

    const src = this.elImages.item(this.index).href
    helpers.appendHTML(this.view.elCart, this.template(src, this.index, this.total))

    this.elContainer = this.view.elCart.querySelector('.mkz-c-i-js-container')
    this.elClose = this.view.elCart.querySelector('.mkz-c-i-js-close')
    this.elPrev = this.view.elCart.querySelector('.mkz-c-i-js-prev')
    this.elNext = this.view.elCart.querySelector('.mkz-c-i-js-next')

    this.bind()
  }
  bind () {
    domEvent.add(this.elClose, 'click', () => {
      this.removeContainer()
    })
    domEvent.add(this.elPrev, 'click', () => {
      if (this.index > 0) this.index--
      this.render()
    })
    domEvent.add(this.elNext, 'click', () => {
      if (this.index < this.total - 1) this.index++
      this.render()
    })
  }
  removeContainer () {
    this.elContainer.parentNode.removeChild(this.elContainer)
  }
  template (src, index, total) {
    return `
      <div class="mkz-c-preview mkz-c-i-js-container">
        <div class="mkz-c-preview__close mkz-c-i-js-close">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 14.1146L22.6 7.51465L24.4853 9.39998L17.8853 16L24.4853 22.6L22.6 24.4853L16 17.8853L9.39998 24.4853L7.51465 22.6L14.1146 16L7.51465 9.39998L9.39998 7.51465L16 14.1146Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="mkz-c-preview__content">
          <img src="${src}" alt="" class="mkz-c-preview__img" />
        </div>
        <div class="mkz-c-preview__action">
          <div class="mkz-c-preview__prev mkz-c-i-js-prev">
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.18154 5L6 8.88906L4.90923 10L5.96244e-08 5L4.90923 -8.95132e-07L6 1.11094L2.18154 5Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="mkz-c-preview__paginate">
            ${index + 1} ${this.t('paginate')} ${total}
          </div>
          <div class="mkz-c-preview__next mkz-c-i-js-next">
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.81846 5L9.05114e-07 1.11094L1.09077 -2.14589e-07L6 5L1.09077 10L5.65121e-07 8.88906L3.81846 5Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    `
  }
}
