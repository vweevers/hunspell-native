/**
 * Hunspell dictionary.
 */
export interface Dictionary {
  /**
   * Path to the affix file.
   */
  aff: string

  /**
   * Path to the dictionary file.
   */
  dic: string
}

/**
 * Node.js binding for Hunspell, the spellcheck library used by LibreOffice,
 * Firefox, Chrome and Adobe.
 */
export class Hunspell {
  /**
   * Create a new instance of Hunspell.
   *
   * @param dictionary Hunspell dictionary.
   */
  constructor (dictionary: Dictionary)

  /**
   * Create a new instance of Hunspell. This is an alternative function
   * signature, provided for drop-in compatibility with `nodehun-native`.
   *
   * @param affix Path to the affix file.
   * @param dictionary Path to the dictionary file.
   */
  constructor (affix: string, dictionary: string)

  /**
   * Yields true if the provided `word` is spelled correctly.
   *
   * @param word The word to check.
   */
  spell (word: string): Promise<boolean>

  /**
   * Returns true if the provided `word` is spelled correctly. Synchronous
   * version of {@link spell()}.
   *
   * @param word The word to check.
   */
  spellSync (word: string): boolean

  /**
   * Get suggestions to fix spelling. Yields an array of words that could match
   * the provided `word`, ordered by most likely to be correct. Yields `null` if
   * the input `word` is correct.
   *
   * @param word The word to get suggestions for.
   */
  suggest (word: string): Promise<string[] | null>

  /**
   * Get suggestions to fix spelling. Returns an array of words that could match
   * the provided `word`, ordered by most likely to be correct. Returns `null` if
   * the input `word` is correct. Synchronous version of {@link suggest()}.
   *
   * @param word The word to get suggestions for.
   */
  suggestSync (word: string): string[] | null

  /**
   * Yields a morphological analysis of a word. Consult upstream documentation
   * for details on the notation.
   *
   * @param word The word to analyze.
   */
  analyze (word: string): Promise<string[]>

  /**
   * Returns a morphological analysis of a word. Consult upstream documentation
   * for details on the notation. Synchronous version of {@link analyze()}.
   *
   * @param word The word to analyze.
   */
  analyzeSync (word: string): string[]

  /**
   * Get the stems (root forms) of a word.
   *
   * @param word The word to stem.
   */
  stem (word: string): Promise<string[]>

  /**
   * Returns the stems (root forms) of a word. Synchronous version of
   * {@link stem()}.
   *
   * @param word The word to stem.
   */
  stemSync (word: string): string[]

  /**
   * Generates a variation of a word by matching the morphological structure of
   * the second word.
   *
   * @param word The word to generate variations of.
   * @param example The example word whose morphological structure to match.
   */
  generate (word: string, example: string): Promise<string[]>

  /**
   * Synchronously generates a variation of a word by matching the morphological
   * structure of the second word. Synchronous version of {@link generate()}.
   *
   * @param word The word to generate variations of.
   * @param example The example word whose morphological structure to match.
   */
  generateSync (word: string, example: string): string[]

  /**
   * Add a dictionary file with additional words.
   *
   * @param dictionaryFile Path of the dictionary file to add.
   */
  addDictionary (dictionaryFile: string): Promise<void>

  /**
   * Add a dictionary file with additional words. Synchronous version of
   * {@link addDictionary()}.
   *
   * @param dictionaryFile Path of the dictionary file to add.
   */
  addDictionarySync (dictionaryFile: string): void

  /**
   * Add a single word, which can also contain flags (as if it was a line in a
   * dictionary file).
   *
   * @param word The word to add.
   */
  add (word: string): Promise<void>

  /**
   * Add a single word. Synchronous version of {@link add()}.
   *
   * @param word The word to add.
   */
  addSync (word: string): void

  /**
   * Like {@link add()} except it also applies the example word's affix
   * definition to the new word.
   *
   * @param word The word to add.
   * @param example The example word whose affix definition to apply.
   */
  addWithAffix (word: string, example: string): Promise<void>

  /**
   * Like {@link addSync()} except it also applies the example word's affix
   * definition to the new word. Synchronous version of {@link addWithAffix()}.
   *
   * @param word The word to add.
   * @param example The example word whose affix definition to apply.
   */
  addWithAffixSync (word: string, example: string): void

  /**
   * Remove a word. This ignores flags and just strips words that match.
   *
   * @param word The word to remove.
   */
  remove (word: string): Promise<void>

  /**
   * Remove a word. This ignores flags and just strips words that match.
   * Synchronous version of {@link remove()}.
   *
   * @param word The word to remove.
   */
  removeSync (word: string): void

  /**
   * Get the characters that are considered valid within words. Useful for
   * tokenization.
   *
   * @returns String of valid word characters, or `undefined` if the affix file
   * lacks this information.
   */
  getWordCharacters (): string | undefined
}
