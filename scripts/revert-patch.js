import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

// Note that the cwd is the build directory
const project = path.dirname(import.meta.dirname)
const stampFile = process.argv[2]

execFileSync('git', ['checkout', 'src/hunspell/affixmgr.cxx'], {
  cwd: path.join(project, 'src/hunspell'),
  stdio: 'inherit',
})

// For incremental builds
writeFileSync(stampFile, '')
