const fs=require('fs');
const lines=fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx','utf8').split('\n');
let found=false;
for(let i=0;i<lines.length;i++){
  if(lines[i].includes("mode === 'bazi'")){found=true}
  if(found){console.log((i+1)+': '+lines[i])}
  if(found && lines[i].includes('} else {') && i>440){break}
  if(found && lines[i]==='    }' && i>440){break}
}
