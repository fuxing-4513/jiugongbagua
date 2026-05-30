const fs=require('fs');
let content=fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx','utf8');
// Between "      return" and "import { useState }" insert a closing brace line
content=content.replace('      return\nimport { useState }', '      return\n    }\nimport { useState }');
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx',content,'utf8');
console.log('added missing closing brace');
