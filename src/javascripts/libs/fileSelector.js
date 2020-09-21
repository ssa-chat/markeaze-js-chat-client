export default class FileSelector {

  constructor (options) {
    const defaultOptions = {
      maxFileSizeLimitMb: 0,
      elInputFile: null,
      elDropZone: null,
      classDropZomeHighlight: 'highlight',
      handleFileSelect (files)  {},
      handleEachFileSelect (file)  {},
      handleEachFileSelectSizeLimit (file, limit) {},
      handleComplete (selectedFiles) {}
    }
    this.options = { ...defaultOptions, ...options }
    this.selectedFiles = []
  }

  bind () {
    if (this.options.elInputFile) {
      this.options.elInputFile.addEventListener('change', this.handleInputFileChange.bind(this), false)
    }

    if (this.options.elDropZone) {
      this.options.elDropZone.addEventListener('dragenter', this.handleDragHighlight.bind(this), false)
      this.options.elDropZone.addEventListener('dragover', this.handleDragHighlight.bind(this), false)

      this.options.elDropZone.addEventListener('dragleave', this.handleDragUnhighlight.bind(this), false)
      this.options.elDropZone.addEventListener('drop', this.handleDragUnhighlight.bind(this), false)
      document.addEventListener('mouseout', this.handleDragUnhighlightAll.bind(this), false)

      this.options.elDropZone.addEventListener('dragover', this.handleDragOver.bind(this), false)
      this.options.elDropZone.addEventListener('drop', this.handleDrop.bind(this), false)
    }
  }

  unbind () {
    if (this.options.elInputFile) {
      this.options.elInputFile.removeEventListener('change', this.handleInputFileChange.bind(this))
    }

    if (this.options.elDropZone) {
      this.options.elDropZone.removeEventListener('dragenter', this.handleDragHighlight.bind(this))
      this.options.elDropZone.removeEventListener('dragover', this.handleDragHighlight.bind(this))

      this.options.elDropZone.removeEventListener('dragleave', this.handleDragUnhighlight.bind(this))
      this.options.elDropZone.removeEventListener('drop', this.handleDragUnhighlight.bind(this))
      document.removeEventListener('mouseout', this.handleDragUnhighlightAll.bind(this))

      this.options.elDropZone.removeEventListener('dragover', this.handleDragOver.bind(this))
      this.options.elDropZone.removeEventListener('drop', this.handleDrop.bind(this))
    }
  }

  async handleInputFileChange (event) {
    const files = event.target.files

    if (!files[0]) return

    await this.options.handleFileSelect(files)
    await Promise.all(Object.values(files).map(this.handleFile.bind(this)))
    this.options.elInputFile.value = null
    this.options.handleComplete(this.selectedFiles)
    this.selectedFiles = []
  }

  handleDragHighlight () {
    this.options.elDropZone.classList.add(this.options.classDropZomeHighlight)
  }

  handleDragUnhighlight (event) {
    if (event.target !== this.options.elDropZone) return
    this.options.elDropZone.classList.remove(this.options.classDropZomeHighlight)
  }

  handleDragUnhighlightAll (event) {
    this.options.elDropZone.classList.remove(this.options.classDropZomeHighlight)
  }

  async handleDrop (event) {
    event.stopPropagation()
    event.preventDefault()

    const files = event.dataTransfer.files
    await this.options.handleFileSelect(files)
    await Promise.all(Object.values(files).map(this.handleFile.bind(this)))

    this.handleDragUnhighlightAll()
    this.options.handleComplete(this.selectedFiles)
    this.selectedFiles = []
  }

  handleDragOver (event) {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  async handleFile (file) {
    if (!this.options.maxFileSizeLimitMb || file.size / 1048576 < this.options.maxFileSizeLimitMb) {
      this.selectedFiles.push(file)
      await this.options.handleEachFileSelect(file)
    } else {
      await this.options.handleEachFileSelectSizeLimit(file, this.options.maxFileSizeLimitMb)
    }
  }

}
