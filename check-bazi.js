const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
const c = fs.readFileSync(f, 'utf8');

// Replace setError+setResult
const anchor = "setError(''); setResult(null)";
const anchor2 = "setError(''); setResult(null)\n    if (mode === 'bazi')";
if (c.includes(anchor2)) {
  console.log('Bazi branch already present');
} else {
  const idx = c.indexOf(anchor);
  console.log('setError anchor at:', idx);
  if (idx >= 0) {
    // Check if there are duplicates
    const idx2 = c.indexOf(anchor, idx + 1);
    if (idx2 > 0) {
      console.log('Duplicate found at:', idx2);
    }
  }
}

// Check form
const formIdx = c.indexOf('flex gap-3 mb-4');
console.log('Form at:', formIdx);
if (formIdx > 0) {
  console.log('Context:', JSON.stringify(c.substring(formIdx - 50, formIdx + 150)));
}
