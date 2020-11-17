class FaviconBlink {
  constructor () {
    this.sprites = []
    this.step = 0
    this.interval = 0
    this.delay = 600
    this.fetchLinks()
    this.generateSprites(2, 16, 16, 'red')
  }

  fetchLinks () {
    const links = document.head.querySelectorAll('link[type="image/png"], link[type="image/x-icon"]')
    this.links = Object.values(links).map((link) => {
      return {
        el: link,
        originalUrl: link.href,
        originalType: link.type
      }
    })
  }

  generateSprites (num, w, h, color) {
    for (let i = 0; i < num; i++) {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const radius = w / (3 * (i + 1))
      const centerX = w / 2
      const centerY = h / 2
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = color
      ctx.fill()
      this.sprites.push(canvas.toDataURL())
    }
  }

  start () {
    if (this.interval) return
    const updateLinks = () => {
      this.links.map((link) => {
        if (!link.el) return
        link.el.href = this.sprites[(this.step % this.sprites.length)]
        link.el.type = 'image/png'
      })
      this.step++
    }
    updateLinks()
    this.interval = setInterval(() => {
      updateLinks()
    }, this.delay)
  }

  stop () {
    clearInterval(this.interval)
    this.interval = null
    this.links.map((link) => {
      if (!link.el) return
      link.el.href = link.originalUrl
      link.el.type = link.originalType
    })
  }

}

class TitleBlink {

  constructor () {
    this.delay = 1200
    this.showed = false
    this.interval = null
    this.defaultTitle = null
    this.title = null
  }

  start (title) {
    if (!title) return
    this.title = title
    if (this.interval) return
    this.toggle()
    this.interval = setInterval(this.toggle.bind(this), this.delay)
  }

  stop () {
    if (this.interval === null) return
    clearInterval(this.interval)
    this.interval = null
    this.hide()
  }

  toggle () {
    this.showed ? this.hide() : this.show()
  }

  show () {
    if (document.title !== this.defaultTitle) this.defaultTitle = document.title
    document.title = this.title
    this.showed = true
  }

  hide () {
    if (document.title !== this.title) this.defaultTitle = document.title
    document.title = this.defaultTitle
    this.showed = false
  }

}

const titleBlink = new TitleBlink()
const faviconBlink = new FaviconBlink()

export const startBlink = (title) => {
  titleBlink.start(title)
  faviconBlink.start()
}

export const stopBlink = () => {
  titleBlink.stop()
  faviconBlink.stop()
}
