const { Plugin } = require('@uppy/core')

class UppyBrilliantStorage extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.id = this.opts.id || 'BrilliantStorage'
    this.type = 'modifier'

    this.getUploadParameters = this.getUploadParameters.bind(this)
    this.prepareUpload = this.prepareUpload.bind(this)

  }

  // Brilliant Storage Settings.
  getUploadParameters (file) {
    console.log(this.opts)
    console.log(file)
    if (!this.opts.endpoint) {
      throw new Error('Expected a `endpoint` option containing the brilliant storage address.')
    }

    const filename = file.meta.name
    const type = file.meta.type
    const metadata = {}
    this.opts.metaFields.forEach((key) => {
      if (file.meta[key] != null) {
        metadata[key] = file.meta[key].toString()
      }
    })

    const query = qsStringify({ filename, type, metadata })
    return this.client.get(`s3/params?${query}`)
      .then(assertServerError)
  }

  // Prefix Handling.
  prepareUpload (fileIDs) {
    const promises = fileIDs.map((fileID) => {
      const file = this.uppy.getFile(fileID)
      this.uppy.emit('preprocess-progress', file, {
        mode: 'indeterminate',
        message: this.i18n('addingPrefix')
      })

      return 
      // return this.compress(file.data).then((compressedBlob) => {
      //   this.uppy.log(`[Image Compressor] Image ${file.id} size before/after compression: ${file.data.size} / ${compressedBlob.size}`)
      //   this.uppy.setFileState(fileID, { data: compressedBlob })
      // }).catch((err) => {
      //   this.uppy.log(`[Image Compressor] Failed to compress ${file.id}:`, 'warning')
      //   this.uppy.log(err, 'warning')
      // })
    })

  install () {
    this.uppy.addPreProcessor(this.getUploadParameters)
    this.uppy.addPreProcessor(this.prepareUpload)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.getUploadParameters)
    this.uppy.removePreProcessor(this.prepareUpload)
  }
}

module.exports = UppyBrilliantStorage
