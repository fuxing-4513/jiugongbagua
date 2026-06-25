import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const queueDir = path.join(__dirname, '../scripts/wenku-queue')
const detailsDir = path.join(__dirname, '../public/data')

const files = fs.readdirSync(queueDir).filter(f => f.startsWith('name-') && f.endsWith('.txt'))

function extractGuInfo(zi, content) {
  const lines = content.split('\n')
  let gujiParts = []
  let yanbianParts = []
  let wuxingParts = []
  let mingjuParts = []
  let collecting = ''

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    
    if (t.includes('字形演变') || t.includes('甲骨文') || t.includes('金文') || t.includes('小篆') || t.includes('楷书')) {
      collecting = 'yanbian'
      yanbianParts.push(t)
      continue
    }
    
    if (t.includes('五行属性') || t.includes('归为') || t.includes('属') || t.includes('五行') || t.includes('金行')) {
      collecting = 'wuxing'
      wuxingParts.push(t)
      continue
    }
    
    if (t.includes('适合') || t.includes('不宜') || t.includes('忌讳') || t.includes('搭配') || t.includes('日主') || t.includes('命局') || t.includes('忌神')) {
      collecting = 'mingju'
      mingjuParts.push(t)
      continue
    }
    
    // 古籍内容：以《开头或含云/曰/注
    if (t.startsWith('《') || t.includes('云"') || t.includes('云：') || t.includes('曰：') || t.includes('注曰') || t.includes('切，')) {
      collecting = 'guji'
      gujiParts.push(t)
      continue
    }
    
    // 续行采集
    if (collecting === 'guji') {
      if (t.startsWith('《') || t.includes('云"') || t.includes('云：') || t.includes('曰：') || t.includes('注曰') || t.includes('切，') || t.includes('切 ')) {
        gujiParts.push(t)
      }
    }
  }
  
  return {
    gujiYuanyuan: gujiParts.slice(0, 5).join(' ').slice(0, 600) || '',
    zixingYanbian: yanbianParts.slice(0, 3).join(' ').slice(0, 300) || '',
    wuxingYiju: wuxingParts.slice(0, 4).join(' ').slice(0, 400) || '',
    mingjuShiyi: mingjuParts.slice(0, 4).join(' ').slice(0, 400) || '',
  }
}

const els = ['jin', 'mu', 'shui', 'huo', 'tu']

for (const el of els) {
  const detailPath = path.join(detailsDir, `wuxing-detail-${el}.json`)
  if (!fs.existsSync(detailPath)) {
    console.log(`Skip ${el}: no detail file`)
    continue
  }
  
  const detail = JSON.parse(fs.readFileSync(detailPath, 'utf-8'))
  let updated = 0
  
  for (const c of detail.chars) {
    const articleFile = path.join(queueDir, `name-${c.zi}.txt`)
    if (!fs.existsSync(articleFile)) continue
    
    const content = fs.readFileSync(articleFile, 'utf-8')
    const info = extractGuInfo(c.zi, content)
    
    if (info.gujiYuanyuan) {
      c.gujiYuanyuan = info.gujiYuanyuan
      updated++
    }
    if (info.zixingYanbian) {
      c.zixingYanbian = info.zixingYanbian
    }
    if (info.wuxingYiju) {
      c.wuxingYiju = info.wuxingYiju
    }
    if (info.mingjuShiyi) {
      c.mingjuShiyi = info.mingjuShiyi
    }
  }
  
  fs.writeFileSync(detailPath, JSON.stringify(detail, null, 0), 'utf-8')
  console.log(`${el}: updated ${updated} chars`)
}

console.log('Done!')
