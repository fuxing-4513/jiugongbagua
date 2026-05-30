const fs=require('fs');
const c=fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx','utf8');
const idx0=c.indexOf('bzYear');
const idx1=c.indexOf('bazi', idx0+1);
const lines=c.substring(idx0, idx1+300).split('\n');
for(let i=0;i<Math.min(lines.length,12);i++) console.log((i+1)+': '+lines[i]);
