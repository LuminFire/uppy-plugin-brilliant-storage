const { Plugin } = require('@uppy/core')

class UppyBrilliantStorage extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.id = this.opts.id || 'BrilliantStorage'
    this.type = 'modifier'
    this.getUploadParameters = this.getUploadParameters.bind(this)


    // we use those internally in `this.compress`, so they
    // should not be overriden
    delete this.opts.success
    delete this.opts.error

    this.prepareUpload = this.prepareUpload.bind(this)
    this.compress = this.compress.bind(this)
  }

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

  // TODO: replace with file prefix handling
  // prepareUpload (fileIDs) {
  //   const promises = fileIDs.map((fileID) => {
  //     const file = this.uppy.getFile(fileID)
  //     this.uppy.emit('preprocess-progress', file, {
  //       mode: 'indeterminate',
  //       message: this.i18n('compressingImages')
  //     })

  //     if (file.type.split('/')[0] !== 'image') {
  //       return
  //     }

  //     return this.compress(file.data).then((compressedBlob) => {
  //       this.uppy.log(`[Image Compressor] Image ${file.id} size before/after compression: ${file.data.size} / ${compressedBlob.size}`)
  //       this.uppy.setFileState(fileID, { data: compressedBlob })
  //     }).catch((err) => {
  //       this.uppy.log(`[Image Compressor] Failed to compress ${file.id}:`, 'warning')
  //       this.uppy.log(err, 'warning')
  //     })
  //   })

  //   const emitPreprocessCompleteForAll = () => {
  //     fileIDs.forEach((fileID) => {
  //       const file = this.uppy.getFile(fileID)
  //       this.uppy.emit('preprocess-complete', file)
  //     })
  //   }

  //   // Why emit `preprocess-complete` for all files at once, instead of
  //   // above when each is processed?
  //   // Because it leads to StatusBar showing a weird “upload 6 files” button,
  //   // while waiting for all the files to complete pre-processing.
  //   return Promise.all(promises)
  //     .then(emitPreprocessCompleteForAll)
  // }

  install () {
    this.uppy.addPreProcessor(this.getUploadParameters)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.getUploadParameters)
  }
}

module.exports = UppyBrilliantStorage
