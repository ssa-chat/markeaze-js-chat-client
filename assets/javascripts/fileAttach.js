const FileSelector = require('./libs/fileSelector').default
const FileUploader = require('./libs/fileUploader').default
const { attachIcon, loaderIcon } = require('./libs/icons')
const helpers = require('./libs/helpers')
const domEvent = require('./libs/domEvent')

export default class FileAttach {
  constructor (view, complete) {
    this.app = view.app
    this.view = view
    this.options = this.app.config.s3
    this.complete = complete
    this.stateUploaderClassName = 'mkz-c-attach_state_uploader'

    this.fileSelector = new FileSelector({})
    this.loader = false
    this.count = 0
    this.total = 0

    this.render()
  }
  render () {
    this.elContainer = this.view.elCart.querySelector('.mkz-c-attach-js')
    helpers.appendHTML(this.elContainer, this.template())
    this.elBlock = this.elContainer.querySelector('.mkz-c-attach-js-block')
    this.elInput = this.elContainer.querySelector('.mkz-c-attach-js-input')
    this.elCounter = this.elContainer.querySelector('.mkz-c-attach-js-counter')

    if (this.view.previewMode) return

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

    domEvent.add(this.elContainer, 'click', this.onCancel.bind(this))
  }
  unbind () {
    this.fileUploader.cancel()
    this.fileSelector.unbind()
    this.showSelector()

    domEvent.remove(this.elContainer, 'click', this.onCancel.bind(this))
  }
  template () {
    const accept = this.options.accept.map((f) => `.${f}`).join(', ')
    return this.view.previewMode ? attachIcon : `
    <span class="mkz-c-attach mkz-c-attach-js-block">
      <span class="mkz-c-attach__selector">
        <input
          type="file"
          accept="${accept}"
          multiple
          class="mkz-c-attach__input mkz-c-attach-js-input"
        />
        ${attachIcon}
      </span>
      <span class="mkz-c-attach__uploader">
        <span class="mkz-c-attach__loader">${loaderIcon}</span>
        <span class="mkz-c-attach__counter mkz-c-attach-js-counter"></span>
      </span>
    </span>
    `
  }
  showUploader () {
    helpers.addClass(this.elBlock, this.stateUploaderClassName)
    this.elCounter.innerHTML = `${this.count}/${this.total}`
    this.loader = true
  }
  showSelector () {
    helpers.removeClass(this.elBlock, this.stateUploaderClassName)
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
    if (attachmentItems && attachmentItems.length > 0) this.complete(attachmentItems)
  }
  onCancel (e) {
    if (!this.loader) return

    e.preventDefault()
    this.unbind()
    this.bind()
  }
}
