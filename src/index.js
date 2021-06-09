const { Plugin } = require('@uppy/core')

class UppyBrilliantStorage extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.id = this.opts.id || 'BrilliantStorage'
    this.type = 'modifier'
    this.title = 'BrilliantStorage'

    const defaultOptions = {
      timeout: 30 * 1000,
      limit: 0,
      metaFields: [], // have to opt in
      handlePrefixes: this.handlePrefixes.bind(this),
    }

    this.opts = { ...defaultOptions, ...opts }
  }


  // Brilliant Storage Settings.
  handlePrefixes (fileIDs) {
    
    fileIDs.forEach((id) => {
      const file = this.uppy.getFile(id)

      console.log(file)
      $.ajax({
        method: 'POST',
        url: presignEndpointPath,
        data: {
          action: "presign_url",
          formId: formId,
          fileId: file.id,
          nonce: nonce,
          filename: file.name,
        }
      }).success(function(data) {
        // console.log(data);

        uppy.setFileMeta(file.id, {
          name: data.data.prefix,
          title: file.name,
          sizes: JSON.stringify(brilliantStorageData.fields.sizes),
          meta: JSON.stringify({
            exif: file.exifdata,
          }),
          tags: JSON.stringify(brilliantStorageData.fields.tags),
        });
      });
    })

    const query = qsStringify({ filename, type, metadata })
    return this.client.get(`s3/params?${query}`)
      .then(assertServerError)
  }

  
  install () {
    this.uppy.addPreProcessor(this.handlePrefixes)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.handlePrefixes)
  }
}

module.exports = UppyBrilliantStorage
