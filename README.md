# hunspell-native

**Cross-platform Node.js binding for [Hunspell](https://hunspell.github.io/), the spellcheck library used by LibreOffice, Firefox, Chrome and Adobe.**

[![Standard](https://img.shields.io/badge/standard-informational?logo=javascript\&logoColor=fff)](https://standardjs.com)
[![Common Changelog](https://common-changelog.org/badge.svg)](https://common-changelog.org)

## Highlights :sparkles:

- Native performance
- Exposes most of Hunspell's functionality
	- Spell checking and suggestions
	- Personal dictionaries;
	- Stemming and word analysis.
- Extensive unit tests;
- Built with [Node-API](https://nodejs.org/api/n-api.html) which provides forward-compatibility.

## Quick Start

```js
import { Hunspell } from 'hunspell-native'
import { loadDictionary } from 'language-packages'

const dictionary = await loadDictionary('en-US')
const hunspell = new Hunspell(dictionary)

// Check if a word is spelled correctly
console.log(await hunspell.spell('color')) // true
console.log(await hunspell.spell('colour')) // false (in US English)

// Get suggestions
console.log(await hunspell.suggest('colour')) // ['color', 'co lour', ...]

// Alternative synchronous API
const isCorrect = hunspell.spellSync('color')
const suggestions = hunspell.suggestSync('color')
```

The companion `language-packages` package provides on-demand downloads of [`wooorm/dictionaries`](https://github.com/wooorm/dictionaries) which covers 42+ languages.

## Background

This is a fork of [`nodehun-native`](https://github.com/bjarkebech/nodehun-native) and thus [`nodehun`](https://github.com/Wulf/nodehun). There's also [`nspell`](https://www.npmjs.com/package/nspell) which is a pure JavaScript alternative. How do they compare?

- The `nspell` package suffers from memory leaks (gigabytes) on certain dictionaries. It's great for English but not suitable for multilingual use.
- The `nodehun` package uses an unmaintained fork of Hunspell that works with buffers instead of reading dictionaries from disk. It has a race condition on startup that can cause all words to be treated as incorrect (at least on German).
- The `nodehun-native` package went back to using file paths and updated to the latest and official version of Hunspell (1.7.2).
- This `hunspell-native` package adds ESM support, Windows support, CI/CD, and prebuilt binaries.

## Install

With [npm](https://npmjs.org) do:

```
npm install hunspell-native
```

The npm package ships with prebuilt binaries for Linux, Mac and Windows. Upon install, [`node-gyp-build`](https://github.com/prebuild/node-gyp-build) will check if a compatible binary exists and fallback to compiling from source if it doesn't. In that case you'll need a [valid `node-gyp` installation](https://github.com/nodejs/node-gyp#installation).

If you don't want to use the prebuilt binary for the platform you are installing on, specify the `--build-from-source` flag when you install:

```
npm install hunspell-native --build-from-source
```

Please open an issue if you need prebuilt binaries for ARM, M1, Alpine (musl), Windows 32-bit or Linux flavors with an old glibc; I'm willing to add these if there's someone to test it.

## API

**Beware:** Because reads and writes use locks, it's not advised to mix asynchronous and synchronous usage of the API. For example, if you were to remove a word synchronously while many different suggestion threads were working in the background, the remove call could take seconds to complete while it waits to take control of the read-write lock.

_The examples below assume use of a US English dictionary._

### `new Hunspell(dictionary)`

Create a new instance of Hunspell, passing in a `dictionary` object in the form of `{ aff: string, dic: string }` where `aff` and `dic` are paths to the affix file and dictionary file. Both files must be UTF-8. Hunspell only reads from the files and doesn't write to them; methods like `add()` are not persistent.

### `new Hunspell(aff: string, dic: string)`

Alternative function signature, provided for drop-in compatibility with `nodehun-native`.

### `hunspell.spell(word: string): Promise<boolean>`

Yields true if the provided `word` is spelled correctly.

### `hunspell.spellSync(word: string): boolean`

Synchronous version of `spell()`.

### `hunspell.suggest(word: string): Promise<string[] | null>`

Get suggestions to fix spelling. Yields an array of words that could match the provided `word`, ordered by most likely to be correct. Yields `null` if the input `word` is correct.

```js
await hunspell.suggest('calor') // ['carol', 'valor', ...]
await hunspell.suggest('color') // null
```

### `hunspell.suggestSync(word: string): string[] | null`

Synchronous version of `suggest()`.

### `hunspell.addDictionary(dictionaryFile: string): Promise<void>`

Add a dictionary file with additional words. Uses the affix file of the existing `hunspell` instance.

```js
await hunspell.spell('colour') // false (incorrect)
await hunspell.addDictionary('./path/to/en-CA.dic')
await hunspell.spell('colour') // true (correct)
```

### `hunspell.addDictionarySync(dictionaryFile: string): void`

Synchronous version of `addDictionary()`.

### `hunspell.add(word: string): Promise<void>`

Add a single word, which can also contain flags (as if it was a line in a dictionary file).

```js
await hunspell.spell('colour') // false (incorrect)
await hunspell.add('colour')
await hunspell.spell('colour') // true (correct)
```

Note: _colouring_ will still be considered incorrect. See the `addWithAffix()` example below.

### `hunspell.addSync(word: string): void`

Synchronous version of `add()`.

### `hunspell.addWithAffix(word: string, example: string): Promise<void>`

Like `add()` except it also applies the example word's affix definition to the new word. Quoting upstream Hunspell documentation:

> Uses a second root word as the model of the enabled affixation and compounding of the new word.

```js
await hunspell.spell('colouring') // false (incorrect)
await hunspell.addWithAffix('colour', 'color')
await hunspell.spell('colouring') // true (correct)
```

### `hunspell.addWithAffixSync(word: string, example: string): void`

Synchronous version of `addWithAffix()`.

### `hunspell.remove(word: string): Promise<void>`

Remove a word. This ignores flags and just strips words that match.

```js
await hunspell.suggest('color') // null (correct)
await hunspell.remove('color')
await hunspell.suggest('color') // ['colon', 'dolor', ...]
```

### `hunspell.removeSync(word: string): void`

Synchronous version of `remove()`.

### `hunspell.stem(word: string): Promise<string[]>`

Get the stems (root forms) of a word. This is useful for e.g. search indexing. The result will include the input `word` if that's also a valid stem (like _running_) and it may return multiple stems if the word has multiple meanings (_leaves_).

```js
await hunspell.stem('mice') // ['mouse']
await hunspell.stem('running') // ['running', 'run']
await hunspell.stem('quickly') // ['quick']
await hunspell.stem('leaves') // ['leave', 'leaf']
await hunspell.stem('abc123') // []
```

### `hunspell.stemSync(word: string): string[]`

Synchronous version of `stem()`.

### `hunspell.analyze(word: string): Promise<string[]>`

Yields a morphological analysis of a word. Consult upstream documentation for details on the notation.

```js
// E.g. [' st:telling ts:0', ' st:tell ts:0 al:told is:Vg']
await hunspell.analyze('telling') 
```

### `hunspell.analyzeSync(word: string): string[]`

Synchronous version of `analyze()`.

### `hunspell.generate(word: string, word2: string): Promise<string[]>`

Generates a variation of a word by matching the morphological structure of the second word.

```js
await hunspell.generate('telling', 'ran') // ['told']
await hunspell.generate('told', 'run') // ['tell']
```

### `hunspell.generateSync(word: string): string[]`

Synchronous version of `generate()`.

### `hunspell.getWordCharacters(): string | undefined`

Get the characters that are considered valid within words. Useful for tokenization. Returns `undefined` if the affix file lacks this information (`WORDCHARS`).

```js
hunspell.getWordCharacters() // 0123456789'.-’
```

## Development

### Getting Started

This repository uses git submodules. Clone it recursively:

```bash
git clone --recurse-submodules https://github.com/vweevers/hunspell-native.git
```

Alternatively, initialize submodules inside the working tree:

```bash
cd hunspell-native
git submodule update --init --recursive
```

### Building

Build the native addon with `npm run build`, or with `npm install` if you didn't already install dependencies.

Note: the build process applies a [patch](./patches/001-static-cast.patch) to the hunspell submodule to replace `dynamic_cast` with `static_cast`, removing the need for RTTI. If compiling succeeds, the patch is reverted, keeping the submodule clean.

## License

[MIT](LICENSE)
