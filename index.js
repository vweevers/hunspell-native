import { createRequire } from 'module'

// https://nodejs.org/api/esm.html#no-addon-loading
const require = createRequire(import.meta.url)
const Hunspell = require('./build/Release/HunspellBinding.node')

export { Hunspell }
