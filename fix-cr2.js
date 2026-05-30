const fs=require('fs');
let content=fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx','utf8');
content=content.replace("}'use client'","}\n'use client'");
// Also check: the replace might also have removed a \n before the closing brace
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx',content,'utf8');
console.log('fixed');
