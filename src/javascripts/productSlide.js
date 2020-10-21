const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')

export default class ProductSlide {
  constructor (elMsg) {
    this.elContainer = elMsg.querySelector('.mkz-c-o-js')

    if (!this.elContainer) return

    this.elItems = elMsg.querySelectorAll('.mkz-c-o-js-i')
    this.total = this.elItems.length
    this.elList = elMsg.querySelector('.mkz-c-o-js-list')
    this.elPrev = elMsg.querySelector('.mkz-c-o-js-prev')
    this.elNext = elMsg.querySelector('.mkz-c-o-js-next')

    this.disabledNaviClassName = 'mkz-c-o__navi_disable_yes'
    this.currentItemClassName = 'mkz-c-o__i_current_yes'

    this.index = 0
    this.oldIndex = 0

    this.bind()
    this.renderNavi()
  }
  bind () {
    Object.values(this.elItems).map((elItem, index) => {
      domEvent.add(elItem, 'click', this.goToIndex.bind(this, index))
    })
    domEvent.add(this.elPrev, 'click', this.onPrev.bind(this))
    domEvent.add(this.elNext, 'click', this.onNext.bind(this))
  }
  onPrev () {
    if (!this.canPrev()) return

    this.goToIndex(this.index - 1)
  }
  onNext () {
    if (!this.canNext()) return

    this.goToIndex(this.index + 1)
  }
  canNext () {
    return this.index + 1 < this.total
  }
  canPrev () {
    return this.index - 1 >= 0
  }
  goToIndex (index) {
    if (this.index === index) return

    this.oldIndex = this.index
    this.index = index

    this.renderNavi()

    helpers.removeClass(this.elItems[this.oldIndex], this.currentItemClassName)
    helpers.addClass(this.elItems[this.index], this.currentItemClassName)

    this.move()
  }
  renderNavi () {
    if (this.canPrev()) helpers.removeClass(this.elPrev, this.disabledNaviClassName)
    else helpers.addClass(this.elPrev, this.disabledNaviClassName)

    if (this.canNext()) helpers.removeClass(this.elNext, this.disabledNaviClassName)
    else helpers.addClass(this.elNext, this.disabledNaviClassName)
  }
  move () {
    const sumWidth = Object.values(this.elItems).reduce((sum, el, index) => {
      if (index >= this.index) return sum
      return sum + el.offsetWidth
    }, 0)

    this.elList.style.left = -sumWidth + 'px'
  }
}
