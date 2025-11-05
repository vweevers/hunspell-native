const { execFileSync } = require('child_process')
const { writeFileSync } = require('fs')
const path = require('path')

// Note that the cwd is the build directory
const project = path.dirname(__dirname)
const stampFile = process.argv[2]

execFileSync('git', ['checkout', 'src/hunspell/affixmgr.cxx'], {
  cwd: path.join(project, 'src/hunspell'),
  stdio: 'inherit',
})

// For incremental builds
writeFileSync(stampFile, '')
