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
      getUploadParameters: this.getUploadParameters.bind(this),
    }

    this.opts = { ...defaultOptions, ...opts }

    this.handleUpload = this.handleUpload.bind(this)
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

  handleUpload (fileIDs) {
    /**
     * keep track of `getUploadParameters()` responses
     * so we can cancel the calls individually using just a file ID
     *
     * @type {object.<string, Promise>}
     */
    const paramsPromises = Object.create(null)

    function onremove (file) {
      const { id } = file
      if (hasProperty(paramsPromises, id)) {
        paramsPromises[id].abort()
      }
    }
    this.uppy.on('file-removed', onremove)

    fileIDs.forEach((id) => {
      const file = this.uppy.getFile(id)
      this.uppy.emit('upload-started', file)
    })

    const getUploadParameters = this.requests.wrapPromiseFunction((file) => {
      return this.opts.getUploadParameters(file)
    })

    const numberOfFiles = fileIDs.length

    return settle(fileIDs.map((id, index) => {
      paramsPromises[id] = getUploadParameters(this.uppy.getFile(id))
      return paramsPromises[id].then((params) => {
        delete paramsPromises[id]

        const file = this.uppy.getFile(id)
        this.validateParameters(file, params)

        const {
          method = 'post',
          url,
          fields,
          headers,
        } = params
        const xhrOpts = {
          method,
          formData: method.toLowerCase() === 'post',
          endpoint: url,
          metaFields: fields ? Object.keys(fields) : [],
        }

        if (headers) {
          xhrOpts.headers = headers
        }

        this.uppy.setFileState(file.id, {
          meta: { ...file.meta, ...fields },
          xhrUpload: xhrOpts,
        })

        return this._uploader.uploadFile(file.id, index, numberOfFiles)
      }).catch((error) => {
        delete paramsPromises[id]

        const file = this.uppy.getFile(id)
        this.uppy.emit('upload-error', file, error)
      })
    })).then((settled) => {
      // cleanup.
      this.uppy.off('file-removed', onremove)
      return settled
    })
  }

  
  install () {
    this.uppy.addPreProcessor(this.getUploadParameters)
    // this.uppy.addUploader(this.handleUpload)
    // // Get the response data from a successful XMLHttpRequest instance.
    // // `content` is the S3 response as a string.
    // // `xhr` is the XMLHttpRequest instance.
    // function defaultGetResponseData (content, xhr) {
    //   const opts = this

    //   // If no response, we've hopefully done a PUT request to the file
    //   // in the bucket on its full URL.
    //   if (!isXml(content, xhr)) {
    //     if (opts.method.toUpperCase() === 'POST') {
    //       if (!warnedSuccessActionStatus) {
    //         uppy.log('[AwsS3] No response data found, make sure to set the success_action_status AWS SDK option to 201. See https://uppy.io/docs/aws-s3/#POST-Uploads', 'warning')
    //         warnedSuccessActionStatus = true
    //       }
    //       // The responseURL won't contain the object key. Give up.
    //       return { location: null }
    //     }

    //     // responseURL is not available in older browsers.
    //     if (!xhr.responseURL) {
    //       return { location: null }
    //     }

    //     // Trim the query string because it's going to be a bunch of presign
    //     // parameters for a PUT request—doing a GET request with those will
    //     // always result in an error
    //     return { location: xhr.responseURL.replace(/\?.*$/, '') }
    //   }

    //   return {
    //     // Some S3 alternatives do not reply with an absolute URL.
    //     // Eg DigitalOcean Spaces uses /$bucketName/xyz
    //     location: resolveUrl(xhr.responseURL, getXmlValue(content, 'Location')),
    //     bucket: getXmlValue(content, 'Bucket'),
    //     key: getXmlValue(content, 'Key'),
    //     etag: getXmlValue(content, 'ETag'),
    //   }
    // }

    // // Get the error data from a failed XMLHttpRequest instance.
    // // `content` is the S3 response as a string.
    // // `xhr` is the XMLHttpRequest instance.
    // function defaultGetResponseError (content, xhr) {
    //   // If no response, we don't have a specific error message, use the default.
    //   if (!isXml(content, xhr)) {
    //     return
    //   }
    //   const error = getXmlValue(content, 'Message')
    //   return new Error(error)
    // }

    // const xhrOptions = {
    //   fieldName: 'file',
    //   responseUrlFieldName: 'location',
    //   timeout: this.opts.timeout,
    //   // Share the rate limiting queue with XHRUpload.
    //   __queue: this.requests,
    //   responseType: 'text',
    //   getResponseData: this.opts.getResponseData || defaultGetResponseData,
    //   getResponseError: defaultGetResponseError,
    // }

    // // Only for MiniXHRUpload, remove once we can depend on XHRUpload directly again
    // xhrOptions.i18n = this.i18n

    // // Revert to `this.uppy.use(XHRUpload)` once the big comment block at the top of
    // // this file is solved
    // this._uploader = new MiniXHRUpload(this.uppy, xhrOptions)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.getUploadParameters)
    // this.uppy.removeUploader(this.handleUpload)
  }
}

module.exports = UppyBrilliantStorage
