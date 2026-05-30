const fs = require('fs')
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx'
const c = fs.readFileSync(p, 'utf8')
const idx = c.lastIndexOf("'use client'")
const cleaned = c.slice(idx)
fs.writeFileSync(p, cleaned)
console.log('cleaned size:', cleaned.length)
