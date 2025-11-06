const { fail, strictEqual, throws, deepEqual, notEqual } = require('node:assert')
const { describe, it, beforeEach } = require('node:test')
const path = require('node:path')
const { Hunspell } = require('../')

const enUS = {
  affix: path.join(__dirname, './dictionaries/en_us.aff'),
  dictionary: path.join(__dirname, './dictionaries/en_us.dic')
}
const enGB = {
  affix: path.join(__dirname, './dictionaries/en_gb.aff'),
  dictionary: path.join(__dirname, './dictionaries/en_gb.dic')
}
const fr = {
  dictionary: path.join(__dirname, './dictionaries/fr.dic')
}
const nl = {
  affix: path.join(__dirname, './dictionaries/nl.aff'),
  dictionary: path.join(__dirname, './dictionaries/nl.dic')
}

describe('Hunspell(..)', () => {
  it('should export a function', () => {
    strictEqual(typeof Hunspell, 'function')
  })

  it('should throw when \'new\' operator isn\'t used', () => {
    throws(() => Hunspell())
  })

  it('should throw when no arguments are given', () => {
    throws(() => new Hunspell())
  })

  it('should throw when 1 arguments are given', () => {
    throws(() => new Hunspell(1))
  })

  it('should throw when 3 arguments are given', () => {
    throws(() => new Hunspell(1, 2, 3))
  })

  it('should throw when the first argument is invalid', () => {
    throws(() => new Hunspell(1, 2))
  })

  it('should throw when the second argument is invalid', () => {
    throws(() => new Hunspell(enUS.affix, 2))
  })

  it('should successfully construct an object when two strings are given', () => {
    const hunspell = new Hunspell(enUS.affix, enUS.dictionary)
    strictEqual(hunspell instanceof Hunspell, true)
  })

  it('should successfully construct an object when a dictionary is given', () => {
    const hunspell = new Hunspell({ aff: enUS.affix, dic: enUS.dictionary })
    strictEqual(hunspell instanceof Hunspell, true)
  })
})

describe('Hunspell#spell(word)', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', async () => {
    strictEqual(typeof hunspell.spell, 'function')
  })

  it('should return a promise', async () => {
    let success = false

    await hunspell.spell()
      .then(() => { })
      .catch(() => { })
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when 0 arguments are given', async () => {
    try {
      await hunspell.spell()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.spell(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.spell(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should return true when the word is spelled correctly', async () => {
    strictEqual(await hunspell.spell('color'), true)
  })

  it('should return false when the word is not spelled correctly', async () => {
    strictEqual(await hunspell.spell('colour'), false)
  })

  it('should not throw when spellchecking emojis ☀', async () => {
    await hunspell.spell('😀')
    await hunspell.spell('☀')
  })
})

describe('Hunspell#spellSync(word)', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  const hunspellNL = new Hunspell(nl.affix, nl.dictionary)

  it('should be a function', async () => {
    strictEqual(typeof hunspell.spellSync, 'function')
  })

  it('should throw when 0 arguments are given', () => {
    try {
      hunspell.spellSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.spellSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.spellSync(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should return \'false\' when a word is not correctly spelled', () => {
    strictEqual(hunspell.spellSync('colour'), false)
  })

  it('should return \'true\' when a word is correctly spelled (1)', () => {
    strictEqual(hunspell.spellSync('color'), true)
  })

  it('should return \'true\' when a word is correctly spelled (2)', () => {
    strictEqual(hunspell.spellSync('c'), true)
  })

  it('should return \'true\' without word', () => {
    strictEqual(hunspell.spellSync(' '), true)
  })

  it('should return \'true\' for non-words', () => {
    strictEqual(hunspell.spellSync('.'), true)
  })

  it('should check for sentence-case when upper-case (ok)', () => {
    strictEqual(hunspell.spellSync('ABDUL'), true)
  })

  it('should check for sentence-case when upper-case (not ok)', () => {
    strictEqual(hunspell.spellSync('COLOUR'), false)
  })

  it('should check for lower-case (ok)', () => {
    strictEqual(hunspell.spellSync('Color'), true)
  })

  it('should check for lower-case (not ok)', () => {
    strictEqual(hunspell.spellSync('Colour'), false)
  })

  it('should check for lower-case (not ok)', () => {
    strictEqual(hunspell.spellSync('Colour'), false)
  })

  it('should not check upper-case for sentence-case when KEEPCASE', () => {
    strictEqual(hunspellNL.spellSync('DVD'), false)
  })

  it('should not check other casing for lower-case when KEEPCASE', () => {
    strictEqual(hunspellNL.spellSync('dVd'), false)
  })

  it('should support ONLYINCOMPOUND (ok)', () => {
    strictEqual(hunspellNL.spellSync('eierlevendbarend'), true)
  })

  it('should support ONLYINCOMPOUND (not ok)', () => {
    strictEqual(hunspellNL.spellSync('eier'), false)
  })

  it('should support compounds (1)', () => {
    strictEqual(hunspell.spellSync('21st'), true)
  })

  it('should support compounds (2)', () => {
    strictEqual(hunspell.spellSync('20st'), false)
  })

  it('should support compounds (3)', () => {
    strictEqual(hunspell.spellSync('20th'), true)
  })

  it('should support compounds (4)', () => {
    strictEqual(hunspell.spellSync('23st'), false)
  })

  it('should support compounds (5)', () => {
    strictEqual(hunspell.spellSync('23th'), false)
  })

  it('should support compounds (6)', () => {
    strictEqual(hunspell.spellSync('23rd'), true)
  })

  it('should support compounds (7)', () => {
    strictEqual(hunspell.spellSync('12th'), true)
  })

  it('should support compounds (8)', () => {
    strictEqual(hunspell.spellSync('22nd'), true)
  })

  it('should not throw when spellchecking emojis ☀', () => {
    hunspell.spellSync('😀')
    hunspell.spellSync('☀')
  })
})

describe('Hunspell#suggestSync(word)', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.suggestSync, 'function')
  })

  it('should throw when 0 arguments are given', () => {
    try {
      hunspell.suggestSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.suggestSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.suggestSync(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should return null when correct (1)', () => {
    deepEqual(hunspell.suggestSync('color'), null)
  })

  it('should return null when correct (2)', () => {
    deepEqual(
      hunspell.suggestSync('c'),
      null
    )
  })

  it('should suggest alternatives', () => {
    deepEqual(
      hunspell.suggestSync('colour').slice(0, 5),
      ['color', 'co lour', 'co-lour', 'col our', 'col-our']
    )
  })

  it('should suggest alternatives', () => {
    deepEqual(
      hunspell.suggestSync('propper').slice(0, 5),
      ['proper', 'popper', 'prosper', 'cropper', 'propped']
    )
  })

  it('should return null for empty values', () => {
    deepEqual(
      hunspell.suggestSync(' '),
      null
    )
  })

  it('should return null for non-words', () => {
    deepEqual(
      hunspell.suggestSync('.'),
      null
    )
  })

  it('should suggest alternatives for sentence-case', () => {
    deepEqual(
      hunspell.suggestSync('Colour').slice(0, 5),
      ['Co lour', 'Co-lour', 'Col our', 'Col-our', 'Color']
    )
  })

  it('should suggest alternatives for upper-case', () => {
    deepEqual(
      hunspell.suggestSync('COLOUR').slice(0, 5),
      ['COLOR', 'CO LOUR', 'CO-LOUR', 'COL OUR', 'COL-OUR']
    )
  })

  it('should suggest alternatives for funky-case', () => {
    deepEqual(
      hunspell.suggestSync('coLOUR').slice(0, 5),
      ['col Our', 'co Lour', 'color', 'co-lour', 'col-our']
    )
  })

  it('should suggest uppercase versions', () => {
    deepEqual(
      hunspell.suggestSync('html'),
      ['HTML']
    )
  })

  it('should suggest removals', () => {
    deepEqual(
      hunspell.suggestSync('collor').slice(0, 5),
      ['color', 'collar', 'coll or', 'coll-or', 'collator']
    )
  })

  it('should suggest additions', () => {
    notEqual(
      hunspell.suggestSync('coor').indexOf('color'),
      -1
    )
  })

  it('should suggest switches', () => {
    const suggestions = hunspell.suggestSync('cloor')

    strictEqual(suggestions.includes('color'), true)
  })

  it('should suggest insertions', () => {
    const suggestions = hunspell.suggestSync('coor')

    strictEqual(suggestions.includes('color'), true)
  })

  it('should not suggest alternatives marked with \'NOSUGGEST\'', () => {
    const suggestions = hunspell.suggestSync('bulshit')

    strictEqual(suggestions.includes('bullshit') || suggestions.includes('Bullshit'), false)
  })

  it('should suggest based on replacements', () => {
    const suggestions = hunspell.suggestSync('consize')

    strictEqual(suggestions.includes('concise'), true)
  })

  it('should not throw when suggesting for emojis ☀', () => {
    hunspell.suggestSync('😀')
    hunspell.suggestSync('☀')
  })

  it('should not overflow on too long values', () => {
    const word = 'npmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpm'
    deepEqual(hunspell.suggestSync(word), [])
  })
})

describe('Hunspell#suggest(word)', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', async () => {
    strictEqual(typeof hunspell.suggest, 'function')
  })

  it('should return a promise', async () => {
    let success = false

    await hunspell.suggest()
      .then(() => { })
      .catch(() => { })
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when 0 arguments are given', async () => {
    try {
      await hunspell.suggest()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.suggest(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.suggest(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should return null when the word is spelled correctly', async () => {
    strictEqual(await hunspell.suggest('color'), null)
  })

  it('should return an array when the word is not spelled correctly', async () => {
    const value = await hunspell.suggest('colour')
    strictEqual(typeof value, 'object')
    strictEqual(typeof value.length, 'number')
  })

  it('should return appropriate suggestions when a word is spelled incorrectly', async () => {
    const value = await hunspell.suggest('colour')
    deepEqual(value.splice(0, 3), ['color', 'co lour', 'co-lour'])
  })

  // it(`should not throw when suggesting for emojis ☀`, async () => {
  //     await hunspell.suggest('😀')
  //     await hunspell.suggest('☀')
  // })
})

describe('Hunspell#add(word)', () => {
  let hunspell

  beforeEach(() => {
    // clear changes before each test
    hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  })

  it('should be a function', async () => {
    strictEqual(typeof hunspell.add, 'function')
  })

  it('should return a promise', async () => {
    let success = false

    await hunspell.add()
      .then(() => { })
      .catch(() => { })
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when 0 arguments are given', async () => {
    try {
      await hunspell.add()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.add(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.add(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should now mark as correct', async () => {
    const word = 'npm'
    strictEqual(await hunspell.spell(word), false)
    await hunspell.add('npm')
    strictEqual(await hunspell.spell(word), true)
  })

  it('should no longer receive suggestions', async () => {
    const word = 'npm'

    notEqual(await hunspell.suggest(word), null)
    await hunspell.add(word)
    strictEqual(await hunspell.suggest(word), null)
  })
})

describe('Hunspell#addSync(value)', () => {
  let hunspell

  beforeEach(() => {
    // clear changes before each test
    hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  })

  it('should be a function', () => {
    strictEqual(typeof hunspell.addSync, 'function')
  })

  it('should throw when 0 arguments are given', () => {
    try {
      hunspell.addSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.addSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.addSync(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should now mark as correct', () => {
    const word = 'npm'

    strictEqual(hunspell.spellSync(word), false)
    hunspell.addSync(word)
    strictEqual(hunspell.spellSync(word), true)
  })

  it('should no longer receive suggestions', () => {
    const word = 'npm'

    notEqual(hunspell.suggestSync(word), null)
    hunspell.addSync(word)
    strictEqual(hunspell.suggestSync(word), null)
  })
})

describe('Hunspell#remove(word)', () => {
  let hunspell

  beforeEach(() => {
    // clear changes before each test
    hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  })

  it('should be a function', async () => {
    strictEqual(typeof hunspell.remove, 'function')
  })

  it('should return a promise', async () => {
    let success = false

    await hunspell.remove()
      .then(() => { })
      .catch(() => { })
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when 0 arguments are given', async () => {
    try {
      await hunspell.remove()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.remove(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.remove(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should now mark as correct', async () => {
    const word = 'npm'

    await hunspell.add(word)
    strictEqual(await hunspell.spell(word), true)
    await hunspell.remove('npm')
    strictEqual(await hunspell.spell(word), false)
  })

  it('should no longer receive suggestions', async () => {
    const word = 'npm'

    await hunspell.add(word)
    strictEqual(await hunspell.suggest(word), null)
    await hunspell.remove(word)
    notEqual(await hunspell.suggest(word), null)
  })
})

describe('Hunspell#removeSync(value)', () => {
  let hunspell

  beforeEach(() => {
    // clear changes before each test
    hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  })

  it('should be a function', () => {
    strictEqual(typeof hunspell.removeSync, 'function')
  })

  it('should throw when 0 arguments are given', () => {
    try {
      hunspell.removeSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.removeSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.removeSync(123456)
      fail()
    } catch {
      // success
    }
  })

  it('should now mark as correct', () => {
    const word = 'npm'

    hunspell.addSync(word)
    strictEqual(hunspell.spellSync(word), true)
    hunspell.removeSync(word)
    strictEqual(hunspell.spellSync(word), false)
  })

  it('should no longer receive suggestions', () => {
    const word = 'npm'

    hunspell.addSync(word)
    strictEqual(hunspell.suggestSync(word), null)
    hunspell.removeSync(word)
    notEqual(hunspell.suggestSync(word), null)
  })
})

// t.test('Hunspell#addSync(value, model)', function (st) {
//   /* `azc` is a Dutch word only properly spelled
//    * in its lower-case form. */
//   st.strictEqual(
//     nl.addSync('npm', 'azc'),
//     nl,
//     'should return the context object'
//   );
//
//   st.strictEqual(nl.spellSync('npm'), true, 'should match affixes (1)');
//   st.strictEqual(nl.spellSync('NPM'), false, 'should match affixes (2)');
//   st.strictEqual(nl.spellSync('Npm'), false, 'should match affixes (3)');
//
//   nl.removeSync('npm');
//
//   st.end();
// });

describe('Hunspell#analyze(word: string): Promise<string[]>;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.analyze, 'function')
  })

  it('should return a promise', async () => {
    let success = false
    await hunspell.analyze()
      .then(() => {})
      .catch(() => {})
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when no arguments are given', async () => {
    try {
      await hunspell.analyze()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.analyze(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.analyze(1)
      fail()
    } catch {
      // success
    }
  })

  it('should return morphological analysis', async () => {
    const morphologicalAnalysis = await hunspell.analyze('telling')
    deepEqual(
      morphologicalAnalysis,
      [' st:telling ts:0', ' st:tell ts:0 al:told is:Vg']
    )
  })

  it('should return an empty array when it isn\'t available', async () => {
    deepEqual(
      await hunspell.analyze('npmnpmnpmnpmnpmnpmnpmnpm'),
      []
    )
  })
})

describe('Hunspell#analyzeSync(word: string): string[];', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.analyzeSync, 'function')
  })

  it('should throw when no arguments are given', () => {
    try {
      hunspell.analyzeSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.analyzeSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.analyzeSync(1)
      fail()
    } catch {
      // success
    }
  })

  it('should return morphological analysis', async () => {
    const morphologicalAnalysis = hunspell.analyzeSync('telling')
    deepEqual(
      morphologicalAnalysis,
      [' st:telling ts:0', ' st:tell ts:0 al:told is:Vg']
    )
  })

  it('should return an empty array when it isn\'t available', async () => {
    deepEqual(
      hunspell.analyzeSync('npmnpmnpmnpmnpmnpmnpmnpm'),
      []
    )
  })
})

describe('Hunspell#stem(word: string): Promise<string[]>;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.stem, 'function')
  })

  it('should return a promise', async () => {
    let success = false
    await hunspell.stem()
      .then(() => {})
      .catch(() => {})
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when no arguments are given', async () => {
    try {
      await hunspell.stem()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.stem(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.stem(1)
      fail()
    } catch {
      // success
    }
  })

  it('should return roots', async () => {
    const roots = await hunspell.stem('telling')
    deepEqual(
      roots,
      ['telling', 'tell']
    )
  })

  it('should return an empty array when not available', async () => {
    deepEqual(
      await hunspell.stem('npmnpmnpmnpmnpmnpmnpmnpm'),
      []
    )
  })
})

describe('Hunspell#stemSync(word: string): string[];', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.stemSync, 'function')
  })

  it('should throw when no arguments are given', () => {
    try {
      hunspell.stemSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.stemSync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.stemSync(1)
      fail()
    } catch {
      // success
    }
  })

  it('should return roots', async () => {
    const roots = hunspell.stemSync('telling')
    deepEqual(
      roots,
      ['telling', 'tell']
    )
  })

  it('should return an empty array when not available', async () => {
    deepEqual(
      hunspell.stemSync('npmnpmnpmnpmnpmnpmnpmnpm'),
      []
    )
  })
})

describe('Hunspell#generate(word: string, example: string): Promise<string[]>;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.generate, 'function')
  })

  it('should return a promise', async () => {
    let success = false
    await hunspell.generate()
      .then(() => {})
      .catch(() => {})
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when no arguments are given', async () => {
    try {
      await hunspell.generate()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 3 arguments are given', async () => {
    try {
      await hunspell.generate(1, 2, 3)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.generate(1)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the second argument isn\'t a string', async () => {
    try {
      await hunspell.generate('abc', 1)
      fail()
    } catch {
      // success
    }
  })

  it('should return variations based on example', async () => {
    deepEqual(
      await hunspell.generate('telling', 'ran'),
      ['told']
    )
  })

  it('should return variations based on example (2)', async () => {
    deepEqual(
      await hunspell.generate('told', 'run'),
      ['tell']
    )
  })

  it('should return an empty array when not computable', async () => {
    deepEqual(
      await hunspell.generate('told', 'npmnpmnpmnpm'),
      []
    )
  })

  it('should return an empty array when not computable (2)', async () => {
    deepEqual(
      await hunspell.generate('npmnpmnpmnpm', 'npmnpmnpmnpm'),
      []
    )
  })

  it('should return an empty array when not computable (3)', async () => {
    deepEqual(
      await hunspell.generate('npmnpmnpmnpm', 'run'),
      []
    )
  })
})

describe('Hunspell#generateSync(word: string): string[];', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.generateSync, 'function')
  })

  it('should throw when no arguments are given', () => {
    try {
      hunspell.generateSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 3 arguments are given', async () => {
    try {
      hunspell.generateSync(1, 2, 3)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      hunspell.generateSync(1)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the second argument isn\'t a string', async () => {
    try {
      hunspell.generateSync('abc', 1)
      fail()
    } catch {
      // success
    }
  })

  it('should return variations based on example', async () => {
    deepEqual(
      hunspell.generateSync('telling', 'ran'),
      ['told']
    )
  })

  it('should return variations based on example (2)', async () => {
    deepEqual(
      hunspell.generateSync('told', 'run'),
      ['tell']
    )
  })

  it('should return an empty array when not computable', async () => {
    deepEqual(
      hunspell.generateSync('told', 'npmnpmnpmnpm'),
      []
    )
  })

  it('should return an empty array when not computable (2)', async () => {
    deepEqual(
      hunspell.generateSync('npmnpmnpmnpm', 'npmnpmnpmnpm'),
      []
    )
  })

  it('should return an empty array when not computable (3)', async () => {
    deepEqual(
      hunspell.generateSync('npmnpmnpmnpm', 'run'),
      []
    )
  })
})

describe('Hunspell#addDictionary(dictionary: string): Promise<void>;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.addDictionary, 'function')
  })

  it('should return a promise', async () => {
    let success = false
    await hunspell.addDictionary()
      .then(() => {})
      .catch(() => {})
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when no arguments are given', async () => {
    try {
      await hunspell.addDictionary()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', async () => {
    try {
      await hunspell.addDictionary(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.addDictionary(1)
      fail()
    } catch {
      // success
    }
  })

  it('should mark correct after dictionary is added', async () => {
    await hunspell.addDictionary(fr.dictionary)
    strictEqual(await hunspell.spell('bonjour'), true)
  })
})

describe('Hunspell#addDictionarySync(dictionary: string): void;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.addDictionarySync, 'function')
  })

  it('should throw when no arguments are given', () => {
    try {
      hunspell.addDictionarySync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 2 arguments are given', () => {
    try {
      hunspell.addDictionarySync(1, 2)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.addDictionarySync(1)
      fail()
    } catch {
      // success
    }
  })

  it('should mark correct after dictionary is added', async () => {
    hunspell.addDictionarySync(fr.dictionary)
    strictEqual(hunspell.spellSync('bonjour'), true)
  })
})

describe('Hunspell#addWithAffix(word: string, example: string): Promise<void>;', () => {
  let hunspell

  beforeEach(() => {
    // clear changes before every test
    hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  })

  it('should be a function', () => {
    strictEqual(typeof hunspell.addWithAffix, 'function')
  })

  it('should return a promise', async () => {
    let success = false
    await hunspell.addWithAffix()
      .then(() => {})
      .catch(() => {})
      .finally(() => { success = true })

    strictEqual(success, true)
  })

  it('should throw when no arguments are given', async () => {
    try {
      await hunspell.addWithAffix()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 3 arguments are given', async () => {
    try {
      await hunspell.addWithAffix(1, 2, 3)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', async () => {
    try {
      await hunspell.addWithAffix(1)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the second argument isn\'t a string', async () => {
    try {
      await hunspell.addWithAffix('abc', 1)
      fail()
    } catch {
      // success
    }
  })

  it('should mark correct', async () => {
    await hunspell.addWithAffix('colour', 'color')
    strictEqual(await hunspell.spell('colouring'), true)
  })
})

describe('Hunspell#addWithAffixSync(word: string, example: string): void;', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)

  it('should be a function', () => {
    strictEqual(typeof hunspell.addWithAffixSync, 'function')
  })

  it('should throw when no arguments are given', () => {
    try {
      hunspell.addWithAffixSync()
      fail()
    } catch {
      // success
    }
  })

  it('should throw when 3 arguments are given', () => {
    try {
      hunspell.addWithAffixSync(1, 2, 3)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the first argument isn\'t a string', () => {
    try {
      hunspell.addWithAffixSync(1)
      fail()
    } catch {
      // success
    }
  })

  it('should throw when the second argument isn\'t a string', () => {
    try {
      hunspell.addWithAffixSync('abc', 2)
      fail()
    } catch {
      // success
    }
  })

  it('should mark correct', async () => {
    hunspell.addWithAffixSync('colour', 'color')
    strictEqual(hunspell.spellSync('colouring'), true)
  })
})

describe('Hunspell#getWordCharacters()', () => {
  const hunspell = new Hunspell(enUS.affix, enUS.dictionary)
  const hunspellGB = new Hunspell(enGB.affix, enGB.dictionary)

  it('should return the defined word-characters', () => {
    strictEqual(hunspell.getWordCharacters(), '0123456789\'.-’')
  })

  it('should return \'undefined\' when not defined', () => {
    strictEqual(hunspellGB.getWordCharacters(), undefined)
  })
})
