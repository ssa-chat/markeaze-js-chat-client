export default class Sound {
  constructor (path) {
    this.audio = new Audio() || document.createElement('video')
    if (!this.audio || !path) return

    this.onload = false
    this.onplay = false

    this.audio.autoplay = false
    this.audio.load()

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
    this.audio.play().catch((e) => {})
  }
}
