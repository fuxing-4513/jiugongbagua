const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Deploying to gh-pages...')

const repo = 'https://github.com/fuxing-4513/jiugongbagua.git'
const outDir = path.join(__dirname, 'out')
const tmpDir = path.join(__dirname, '.gh-pages-tmp')

// Clean tmp
if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true })

// Clone gh-pages branch
execSync(`git clone --depth=1 -b gh-pages ${repo} "${tmpDir}"`, { stdio: 'pipe' })
console.log('✅ Cloned gh-pages branch')

// Copy out/ content
const copyRecursive = (src, dst) => {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const e of entries) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) copyRecursive(s, d)
    else fs.copyFileSync(s, d)
  }
}
copyRecursive(outDir, tmpDir)

// Ensure .nojekyll
fs.writeFileSync(path.join(tmpDir, '.nojekyll'), '')

// Set git identity
execSync(`cd "${tmpDir}" && git config user.email "fuxing-4513@users.noreply.github.com" && git config user.name "fuxing-4513"`, { stdio: 'pipe' })

// Commit & push
const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
execSync(`cd "${tmpDir}" && git add -A && git commit -m "deploy: ${now}"`, { stdio: 'pipe' })
execSync(`cd "${tmpDir}" && git push origin gh-pages`, { stdio: 'pipe' })
console.log('✅ Pushed to gh-pages')

// Clean tmp
fs.rmSync(tmpDir, { recursive: true })
console.log('✨ Done!')
