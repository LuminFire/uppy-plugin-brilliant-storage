# Uppy BrilliantStorage

<img src="https://uppy.io/images/logos/uppy-dog-head-arrow.svg" width="120" alt="Uppy logo: a superman puppy in a pink suit" align="right">

BrilliantStorage is an [Uppy](https://uppy.io) file uploader plugin, that allows BrilliantStorage to add a unique prefix onto the files being uploaded.

:warning: This is not an official Uppy plugin, so no support is offered for it. Please use at your own risk.


## Installation

```bash
$ npm install @luminfire/uppy-plugin-brilliant-storage --save
```

## Usage

```js
const Uppy = require('@uppy/core');
const BrilliantStorage = require('@luminfire/uppy-plugin-brilliant-storage');

const uppy = Uppy();
uppy.use(BrilliantStorage);
```

## Development

### Publish a New Release

1. Run `npm version major | minor | patch --no-git-tag-version`
1. Merge to `master`
1. Tag with semantic versioning
1. Ensure the [public repo](https://github.com/LuminFire/uppy-plugin-brilliant-storage/tags) has the up-to-date code
1. Run `npm publish`
