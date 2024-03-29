const Core = require('@uppy/core')
const FileInput = require('@uppy/file-input')
const ImageCompressor = require('../lib/index.js')

const core = new Core({
  debug: true
})
core.use(FileInput, {
  target: 'body'
})
core.use(BrilliantStorage)

window.uppy = core

export default uppy
