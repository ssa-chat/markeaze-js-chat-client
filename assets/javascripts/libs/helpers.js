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
  linkify (str) {
    getAttrs = (url) => {
      const host = window.location.host.replace(/^www\./i, '').replace(/:[0-9]+/i, '')
      return url.indexOf(host) > -1 ? '' : ' target="_blank"'
    }

    // URLs starting with http://, https://, or ftp://
    const re1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
    str = str.replace(re1, (a, url) => {
      return `<a href="${url}"${getAttrs(url)}>${url}</a>`
    })

    // URLs starting with www. (without // before it, or it'd re-link the ones done above)
    const re2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim
    str = str.replace(re2, (a, prefix, url) => {
      return `${prefix}<a href="http://${url}"${getAttrs(url)}>${url}</a>`
    })

    // Change email addresses to mailto:: links
    const re3 = /(([a-zA-Z_-]+\.)*[a-zA-Z_-]+@([a-zA-Z_-]+\.)*[a-zA-Z_-]+\.[a-zA-Z]{2,6})/gim
    str = str.replace(re3, '<a href="mailto:$1">$1</a>')

    return str
  },
  br (str) {
    return (str || '').split("\n").join('<br />')
  },
  htmlFormatting (str) {
    return this.linkify(this.br(str))
  },
  textFormatting (str) {
    return this.htmlFormatting(this.htmlToText(str))
  }
}
