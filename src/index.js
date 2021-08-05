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


  handlePrefixes (fileIDs) {
    var field = document.querySelector(window.brilliantUploaderField.uploaderElementSelector),
        nonce = field.dataset.nonce,
        presignEndpointPath = field.dataset.presignEndpointPath,
        formId = field.dataset.formid;

    const promises = fileIDs.map((fileID) => {
      const file = this.uppy.getFile(fileID)

      var presignFormData = new FormData();
          presignFormData.append("action", "bu_presign_url");
          presignFormData.append("service", window.brilliantUploaderField.service);
          presignFormData.append("context", window.brilliantUploaderField.context);
          presignFormData.append("formId", formId);
          presignFormData.append("fileId", file.id);
          presignFormData.append("nonce", nonce);
          presignFormData.append("filename", file.name);
          presignFormData.append("contentType", file.type.replace('/', '-')); // Replace slash with hyphen to work around WP sanitization.

      return fetch(presignEndpointPath, {
        method: 'POST',
        body: presignFormData,
      })
      .then(response => response.json())
      .then(data => {
        var fields = Object.keys(window.brilliantStorageData.fields).map(function (key) {
          var value = window.brilliantStorageData.fields[key];
          if ('object' === typeof window.brilliantStorageData.fields[key]) {
              value = JSON.stringify(value);
          }

          return value;
        });
        fields.name = data.data.prefix;

        uppy.setFileMeta(file.id, fields);
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
