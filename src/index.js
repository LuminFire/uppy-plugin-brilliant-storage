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
    var $form = jQuery('#brilliant_uploader'),
    nonce = $form.data('nonce'),
    presignEndpointPath = $form.data('admin-ajax'),
    uploaderWrap = document.querySelector('#brilliant_uploader'),
    formId = uploaderWrap.dataset.formid;
    
    const promises = fileIDs.map((fileID) => {
      const file = this.uppy.getFile(fileID)

      var presignFormData = new FormData();
          presignFormData.append("action", "bu_presign_url");
          presignFormData.append("formId", formId);
          presignFormData.append("fileId", file.id);
          presignFormData.append("nonce", nonce);
          presignFormData.append("filename", file.name);

      return fetch(presignEndpointPath, {
        method: 'POST',
        body: presignFormData,
      })
      .then(response => response.json())
      .then(data => {
        uppy.setFileMeta(file.id, {
          name: data.data.prefix,
          title: file.name,
          sizes: JSON.stringify(brilliantStorageData.fields.sizes),
          tags: JSON.stringify(brilliantStorageData.fields.tags),
        });
      })
      .catch((error) => {
        console.error('Couldn’t fetch upload data: ', error);
      });
    })
    return Promise.all(promises)
  }

  
  install () {
    this.uppy.addPreProcessor(this.handlePrefixes)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.handlePrefixes)
  }
}

module.exports = UppyBrilliantStorage
