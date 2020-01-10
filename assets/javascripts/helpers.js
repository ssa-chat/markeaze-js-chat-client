module.exports = {
  removeClass (el, className) {
    if (el.classList) el.classList.remove(className)
    else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
    }
  },
  addClass (el, className) {
    if (el.classList) el.classList.add(className)
    else el.className += ' ' + className
  },
  appendHTML (container, html) {
    const tmpEl = document.createElement('div')
    tmpEl.innerHTML = html
    const el = this.getFirstChild(tmpEl)
    container.appendChild(el)
    return el
  },
  getFirstChild (el) {
    let firstChild = el.firstChild
    while(firstChild != null && firstChild.nodeType == 3) firstChild = firstChild.nextSibling
    return firstChild
  }
}