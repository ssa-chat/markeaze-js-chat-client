const FileSelector = require('./libs/fileSelector').default
const FileUploader = require('./libs/fileUploader').default

export default class FileAttach {
  constructor (view, options, complete, helpers, domEvent, icons) {
    this.app = view.app
    this.view = view
    this.options = options
    this.complete = complete
    this.stateUploaderClassName = 'mkz-c-attach_state_uploader'
    this.helpers = helpers
    this.domEvent = domEvent
    this.icons = icons

    this.fileSelector = new FileSelector({})
    this.loader = false
    this.count = 0
    this.total = 0

    this.render()
  }
  render () {
    if (!this.view.elCard) return
    this.elContainer = this.view.elCard.querySelector('.mkz-c-attach-js')
    this.helpers.appendHTML(this.elContainer, this.template())
    this.elBlock = this.elContainer.querySelector('.mkz-c-attach-js-block')
    this.elInput = this.elContainer.querySelector('.mkz-c-attach-js-input')
    this.elCounter = this.elContainer.querySelector('.mkz-c-attach-js-counter')

    this.bind()
  }
  remove () {
    this.unbind()
  }
  bind () {
    this.fileUploader = new FileUploader({
      appKey: this.app.store.appKey,
      region: this.app.store.region,
      ...this.options
    })
    this.fileSelector = new FileSelector({
      maxFileSizeLimitMb: this.options.uploadFileSizeLimitMb,
      elInputFile: this.elInput,
      elDropZone: null,
      classDropZomeHighlight: '',
      handleEachFileSelectSizeLimit: this.onFileSizeLimit.bind(this),
      handleFileSelect: this.onFileSelect.bind(this),
      handleComplete: this.onComplete.bind(this)
    })
    this.fileSelector.bind()

    this.domEvent.add(this.elContainer, 'click', this.onCancel.bind(this))
  }
  unbind () {
    this.fileUploader.cancel()
    this.fileSelector.unbind()
    this.showSelector()

    this.domEvent.remove(this.elContainer, 'click', this.onCancel.bind(this))
  }
  template () {
    const accept = this.options.accept.map((f) => `.${f}`).join(', ')
    return `
    <span class="mkz-c-attach mkz-c-attach-js-block">
      <span class="mkz-c-attach__selector">
        <input
          type="file"
          accept="${accept}"
          multiple
          class="mkz-c-attach__input mkz-c-attach-js-input"
        />
        ${this.icons.attachIcon}
      </span>
      <span class="mkz-c-attach__uploader">
        <span class="mkz-c-attach__loader">${this.icons.loaderIcon}</span>
        <span class="mkz-c-attach__counter mkz-c-attach-js-counter"></span>
      </span>
    </span>
    `
  }
  showUploader () {
    this.helpers.addClass(this.elBlock, this.stateUploaderClassName)
    this.elCounter.innerHTML = `${this.count}/${this.total}`
    this.loader = true
  }
  showSelector () {
    this.helpers.removeClass(this.elBlock, this.stateUploaderClassName)
    this.loader = false
  }
  onFileSizeLimit (file, maxSize) {
    const text = this.view.translate.t('size_limit', {
      name: file.name,
      size: maxSize
    })
    alert(text)
  }
  onFileSelect () {
    this.showUploader()
  }
  async onComplete (files) {
    this.total = files.length
    this.count = 1
    this.showUploader()
    const attachmentItems = await Promise.all(
      files.map(async (file) => {
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/png', 'image/bmp']
        const type = imageTypes.indexOf(file.type) > -1 ? 'image' : 'file'
        let props = {}
        if (type === 'image') {
          const img = new Image()
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = URL.createObjectURL(file)
          })
          props = {
            width: img.width,
            height: img.height
          }
        }
        const res = {
          url: await this.fileUploader.upload(file),
          name: file.name,
          type,
          size: file.size,
          ...props
        }
        this.count++
        this.showUploader()
        return res
      })
    ).catch(() => {})
    this.showSelector()
    if (attachmentItems?.length > 0) this.complete(attachmentItems)
  }
  onCancel (e) {
    if (!this.loader) return

    e.preventDefault()
    this.unbind()
    this.bind()
  }
}
