import { createRequire } from 'module'

// https://nodejs.org/api/esm.html#no-addon-loading
const __require = createRequire(import.meta.url)
const Hunspell = __require('node-gyp-build')(import.meta.dirname)

export { Hunspell }
