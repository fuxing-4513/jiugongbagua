import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const EL_NAMES = {
  jin: '金行', mu: '木行', shui: '水行', huo: '火行', tu: '土行'
}

for (const [el, name] of Object.entries(EL_NAMES)) {
  const srcPath = path.join(__dirname, '../public/data', `wuxing-detail-${el}.json`)
  if (!fs.existsSync(srcPath)) {
    console.log(`Skip ${el}: file not found`)
    continue
  }

  const obj = JSON.parse(fs.readFileSync(srcPath, 'utf-8'))
  const keys = Object.keys(obj)
  const chars = keys
    .filter(k => obj[k] && obj[k].zi)
    .map(k => obj[k])

  const newFormat = {
    el,
    name,
    total: chars.length,
    chars
  }

  fs.writeFileSync(srcPath, JSON.stringify(newFormat, null, 0), 'utf-8')
  console.log(`${el}: ${keys.length} keys → ${chars.length} chars, size ~${(Buffer.byteLength(JSON.stringify(newFormat, null, 0)) / 1024 / 1024).toFixed(1)}MB`)
}

console.log('All 5 detail files converted!')
