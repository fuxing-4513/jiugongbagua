const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const lines = c.split('\n');

// Let me see which lines need fixing and fix them one by one
// L542: function analyzeWuxing body
// L543: SHI_CHEN_GAN data
// L545: NAYIN data  
// L546: calcBazi function body
// L553: CHAR_POOL data
// L556: generateNames function body
// L557: export default function NamingClient (all JSX in one line)

// And HOUR_OPTS seems to be missing - it's only in a comment in checkCharWx line

// Let me see if HOUR_OPTS is defined or not
const hoIdx = c.indexOf('HOUR_OPTS =');
console.log('HOUR_OPTS = at:', hoIdx);
if (hoIdx >= 0) console.log('Context:', c.substring(Math.max(0,hoIdx-20), Math.min(c.length, hoIdx+100)));

// Check around where getHourDz references HOUR_OPTS
const ghdIdx = c.indexOf('function getHourDz');
console.log('\ngetHourDz at:', ghdIdx);
if (ghdIdx >= 0) console.log('Context:', c.substring(ghdIdx, ghdIdx + 200));

// Let me look at line 554 in detail
console.log('\nFull line 554:');
const l554 = lines[553];
// Find HOUR_OPTS reference in this line
const hoIn554 = l554.indexOf('HOUR_OPTS');
console.log('HOUR_OPTS at offset', hoIn554, 'in line 554');
console.log('Line 554:', l554);

// Now look at line 553 (CHAR_POOL)
console.log('\nLine 553 first 200:', lines[552].substring(0, 200));
console.log('Line 553 last 200:', lines[552].substring(lines[552].length - 200));
