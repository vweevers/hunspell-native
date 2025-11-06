// Wrap the addon in a CommonJS module (this file) that can be imported from
// both CommonJS and ESM. See https://nodejs.org/api/esm.html#no-addon-loading.
exports.Hunspell = require('./build/Release/HunspellBinding.node')
