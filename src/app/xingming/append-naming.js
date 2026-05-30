const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const existing = fs.readFileSync(p, 'utf8');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// Find where CHARS_WX ends in xe.txt (after the 水 section)
// The first CHAR_POOL in xe starts at position 2, so we need the CHARS_WX section
// Search for '丹':'火' which should be after the fire section in CHARS_WX
const charVals = ['丹','彤','怡','悠','忻','舒'];
for (const c of charVals) {
  const idx = xe.indexOf(`'${c}':'火'`);
  if (idx >= 0) {
    const context = xe.substring(Math.max(0, idx - 20), Math.min(xe.length, idx + 80));
    console.log(`${c}: ${idx} → ${context}`);
  }
}

// The existing file ends with '彤':'火', 
// In CHARS_WX, the fire section ends with entries like '彰':'火','娜':'火',
// Then the 土 section starts

// Let me find where CHARS_WX fully ends and what comes next
const charsEndFoo = xe.indexOf('const SHENG_CYCLE:');
console.log(`\nconst SHENG_CYCLE: at ${charsEndFoo}`);

// Find the section between end of fire section and SHENG_CYCLE
// Actually let me find what's after '彤':'火', in the complete code
const tongPos = xe.indexOf("'彤':'火'");
if (tongPos >= 0) {
  const after = xe.substring(tongPos + "'彤':'火'".length);
  console.log(`\nAfter '彤':'火' in xe (first 200 chars):`);
  console.log(after.substring(0, 200));
}
