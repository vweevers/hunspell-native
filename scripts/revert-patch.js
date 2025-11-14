import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Note that the cwd is the build directory
const project = path.dirname(import.meta.dirname)
const hunspell = path.join(project, 'src/hunspell')
const stampFile = process.argv[2]

// Skip in prebuildify-cross and npm package as there is no repo
if (existsSync(path.join(hunspell, '.git'))) {
  execFileSync('git', ['checkout', 'src/hunspell/affixmgr.cxx'], {
    cwd: hunspell,
    stdio: 'inherit',
  })
}

// For incremental builds
// @ts-expect-error
writeFileSync(stampFile, '')
