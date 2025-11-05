const { execFileSync } = require('child_process')
const { writeFileSync } = require('fs')
const path = require('path')

// Note that the cwd is the build directory
const project = path.dirname(__dirname)
const submodule = path.join(project, 'src/hunspell')
const patchFile = path.join(project, 'patches', '001-static-cast.patch')
const stampFile = process.argv[2]

try {
  // Revert in case it was already applied
  execFileSync('git', ['apply', '--reverse', patchFile], {
    cwd: submodule,
    stdio: 'ignore',
  })
} catch {}

execFileSync('git', ['apply', patchFile], {
  cwd: submodule,
  stdio: 'inherit'
})

// For incremental builds
writeFileSync(stampFile, '')
