export default class Sound {
  constructor (url, fileName) {
    this.audio = new Audio() || document.createElement('video')
    if (!this.audio) return

    this.onload = false
    this.onplay = false

    this.audio.autoplay = false
    this.audio.load()

    let path = url + '/' + fileName

    if (this.audio.canPlayType('audio/ogg')) {
      this.audio.src = path + '.ogg'
    } else {
      if (this.audio.canPlayType('audio/mp3')) {
        this.audio.src = path + '.mp3'
      }
    }

    this.audio.onloadeddata = () => {
      this.onload = true
      if (this.onplay) this.playAction()
    }
  }

  play () {
    if (!this.audio) return
    if (this.onload) this.playAction()
    else this.onplay = true
  }

  playAction () {
    this.audio.currentTime = 0
    try {
      this.audio.play()
    }
    catch (e) {}
  }
}
