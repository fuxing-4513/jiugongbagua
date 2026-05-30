const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');

// Find the start of the first `if (mode === 'bazi')` block and the start of the second
// Then remove everything in between (the first block) and fix the second block
let firstStart = -1, firstEnd = -1, secondStart = -1;

// Also the original doCalc code started with `setError(''); setResult(null)` - there might be two

// Simple approach: find ALL lines containing 'if (mode ==='  and remove the ones from the first occurrence through the line 306
// Then fix the remaining block

let result = '';
let inRemovedRegion = false;
let seenFirstBaziIf = false;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const trimmed = l.trimStart();
  
  // Skip the first `if (mode === 'bazi')` block entirely
  if (trimmed === "if (mode === 'bazi') {" && !seenFirstBaziIf) {
    seenFirstBaziIf = true;
    inRemovedRegion = true;
    let depth = 1;
    result += l + '\n'; // keep the if line
    
    // Scan ahead for matching braces
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      const tj = lines[j].trimStart();
      if (tj.includes('{')) {
        // count opening braces
        for (const ch of tj) { if (ch === '{') depth++; }
      }
      if (tj.includes('}')) {
        for (const ch of tj) { if (ch === '}') depth--; }
      }
      result += lines[j] + '\n';
      j++;
      if (depth <= 0) break;
    }
    if (depth <= 0) {
      inRemovedRegion = false;
      i = j - 1; // move past
    }
    continue;
  }
  
  if (inRemovedRegion) continue;
  result += l + '\n';
}

// Now remove any remaining duplicate if (mode === 'bazi') blocks
// (there might be a second one)
const finalLines = result.split('\n');
let output = '';
let seenBaziIf = false;
let skipBlock = false;
let braceDepth = 0;

for (let i = 0; i < finalLines.length; i++) {
  const l = finalLines[i];
  const trimmed = l.trimStart();
  
  if (trimmed === "if (mode === 'bazi') {" && !seenBaziIf) {
    seenBaziIf = true;
    skipBlock = true;
    braceDepth = 1;
    // Keep opening
    output += l + '\n';
    continue;
  }
  
  if (trimmed === "if (mode === 'bazi') {" && seenBaziIf) {
    // Skip duplicate completely
    skipBlock = true;
    braceDepth = 1;
    continue;
  }
  
  if (skipBlock) {
    for (const ch of trimmed) { if (ch === '{') braceDepth++; if (ch === '}') braceDepth--; }
    if (braceDepth <= 0) {
      skipBlock = false;
      // Add closing brace if needed
      if (!l.includes('return') && !l.includes('catch')) {
        // don't add anything, the } is about to be emitted
      }
    }
    continue;
  }
  
  output += l + '\n';
}

fs.writeFileSync(f, output, 'utf8');
console.log('cleanup done');
