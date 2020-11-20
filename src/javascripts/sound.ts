export default class Sound {
  protected audio: any
  protected onload: boolean = false
  protected onplay: boolean = false

  constructor (path: string) {
    this.audio = new Audio() || document.createElement('video')
    if (!this.audio || !path) return

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

  public play (): void {
    if (!this.audio) return
    if (this.onload) this.playAction()
    else this.onplay = true
  }

  protected playAction (): void {
    this.audio.currentTime = 0
    const playPromise = this.audio.play()
    if (playPromise) playPromise.catch((e) => {})
  }
}
