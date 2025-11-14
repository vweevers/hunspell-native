import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

// Note that the cwd is the build directory
const project = path.dirname(import.meta.dirname)
const submodule = path.join(project, 'src/hunspell')
const patchFile = path.join(project, 'patches', '001-static-cast.patch')
const stampFile = process.argv[2]

try {
  // Revert in case it was already applied.
  // Needs --work-tree to avoid attempting to find one higher up
  execFileSync('git', ['--work-tree=.', 'apply', '--reverse', patchFile], {
    cwd: submodule,
    stdio: 'ignore',
  })
} catch {}

execFileSync('git', ['--work-tree=.', 'apply', patchFile], {
  cwd: submodule,
  stdio: 'inherit'
})

// For incremental builds
// @ts-expect-error
writeFileSync(stampFile, '')
