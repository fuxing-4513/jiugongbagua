const fs=require('fs');
let content=fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx','utf8');
const arr=content.split('\n');
// Find the second 'use client' and remove it
let found=0;
for(let i=0;i<arr.length;i++){
  if(arr[i].includes("'use client'")){
    found++;
    if(found===2){
      arr.splice(i-1,3); // remove the blank line before, the use client, and the blank line after
      break;
    }
  }
}
content=arr.join('\n');
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx',content,'utf8');
console.log('removed duplicate use client');
