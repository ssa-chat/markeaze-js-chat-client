const { markdown } = require('markdown')

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
  beforeHTML (container, html) {
    const tmpEl = document.createElement('div')
    tmpEl.innerHTML = html
    const el = this.getFirstChild(tmpEl)
    container.parentNode.insertBefore(el, container)
    return el
  },
  getFirstChild (el) {
    let firstChild = el.firstChild
    while(firstChild != null && firstChild.nodeType == 3) firstChild = firstChild.nextSibling
    return firstChild
  },
  htmlToText (str) {
    const temp = document.createElement('div')
    temp.textContent = str || ''
    return temp.innerHTML
  },
  srcset (src) {
    const getSrcSet = (src, size) => {
      const delimeter = '/'
      const t = src.split(delimeter)
      const lastKey = t.length - 1
      t[lastKey] = `x${size}_${t[lastKey]}`
      return `${t.join(delimeter)} ${size}x`
    }
    return `${getSrcSet(src, 2)}, ${getSrcSet(src, 3)}`
  },
  br (str) {
    return (str || '').split("\n").join('<br />')
  },
  htmlFormatting (str) {
    if (!str) return ''

    return this.linkify(this.br(markdown.toHTML(str)))
  },
  textFormatting (str) {
    return this.htmlFormatting(this.htmlToText(str))
  },
  getUrlParameter (name) {
    regex = new RegExp('[?&]' + name + '=([^&#]*)')
    results = regex.exec(location.search)
    if (results !== null) return decodeURIComponent(results[1].replace(/\+/g, ' '))
  },
  linkify (str) {
    if (!str) return str

    // URLs starting with http://, https://, or ftp://
    const re1 = /([^"'])(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])([^"']?)/gim
    str = str.replace(re1, '$1<a href="$2" target="_blank">$2</a>$4')

    // URLs starting with www. (without // before it, or it'd re-link the ones done above)
    const re2 = /([^"']|^|[^\/])(www\.[\S]+(\b|$))([^"']?)/gim
    str = str.replace(re2, '$1<a href="http://$2" target="_blank">$2</a>$4')

    // Change email addresses to mailto:: links
    const re3 = /([^"'])(([a-zA-Z_-]+\.)*[a-zA-Z_-]+@([a-zA-Z_-]+\.)*[a-zA-Z_-]+\.[a-zA-Z]{2,6})([^"']?)/gim
    str = str.replace(re3, '$1<a href="mailto:$2">$2</a>$5')

    return str
  }
}
