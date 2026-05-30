const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
let newLines = [];
let skipBlock = false;
let skipCount = 0;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const trimmed = l.trimStart();
  
  // Detect the SECOND if (mode === 'bazi') block and skip it
  // We already detected the first one earlier in the code
  if (trimmed.startsWith('if (mode === ') && trimmed.includes("'bazi'") && skipCount === 0) {
    skipCount++;
    newLines.push(l);
    continue;
  }
  
  if (trimmed.startsWith('if (mode === ') && trimmed.includes("'bazi'") && skipCount === 1) {
    skipBlock = true;
    // skip this entire block
    continue;
  }
  
  if (skipBlock) {
    if (trimmed === '}' || trimmed.startsWith('return')) {
      // end of block - need to close the outer if too
      skipBlock = false;
    }
    continue;
  }
  
  newLines.push(l);
}

fs.writeFileSync(f, newLines.join('\n'), 'utf8');
console.log('duplicate block removed');
