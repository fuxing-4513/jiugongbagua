const fs = require('fs');

// Read the broken file and xe.txt
const broken = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// Strategy: 
// 1. Lines 1-246 of broken are correct (imports, STROKE, WXC, NUM_DETAIL, SANCAI_MAP, POEM_NAMES, helpers, first part of CHARS_WX)
// 2. Line 247 has the rest (second half of CHARS_WX through end of file) all on one line
// 3. xe.txt has all the same data but structured differently (has CHAR_POOL at start, etc.)

// Solution: extract the correct first 246 lines, then append the properly-formatted remainder from xe.txt

// Get first 246 lines from broken
const brokenLines = broken.split('\n');
const firstPart = brokenLines.slice(0, 246).join('\n');

// Now read xe.txt - it has CHAR_POOL at the start, then getStroke, WXC, etc.
// BUT we only need the content from where CHARS_WX continues (after '彤':'火',)
// In xe.txt, find the continuation point
// Actually xe.txt has the same structure but CHAR_POOL comes first, then getStroke, WXC...
// Let me find what specifically we need

// In the broken file, after line 246 (which should end with CHARS_WX's fire section)
// The line 246 last chars should be something like the fire section entries
// Let's check what line 246 looks like
console.log('Line 246 of broken:', brokenLines[245].slice(-80));
console.log('');
console.log('First 150 chars of line 247:', brokenLines[246].slice(0, 150));
console.log('');
console.log('Last 100 chars of line 247:', brokenLines[246].slice(-100));

// Now find in xe.txt what comes after that continuation point
// The continuation should start with something like '晴':'火','晓':'火','煜':'火',...
// Let's find getCharWuxing in xe.txt
const getCharIdx = xe.indexOf('function getCharWuxing');
console.log('\ngetCharWuxing in xe:', getCharIdx);

// xe.txt has the first CHAR_POOL then getStroke then other stuff then CHARS_WX
// We want everything from after '彤':'火', in CHARS_WX of xe
// But actually, in xe.txt, the CHARS_WX section might be complete and properly formatted
// Let me find CHARS_WX in xe.txt
const charsIdx = xe.indexOf('const CHARS_WX:');
console.log('CHARS_WX in xe at:', charsIdx);
const after = xe.substring(charsIdx);
// Find '彤':'火', in this context
const tong = after.indexOf("'彤':'火'");
console.log('彤 in CHARS_WX at offset:', tong);
console.log('After 彤 (200 chars):', after.substring(tong, tong + 200));
console.log('');
// Find what's literally at position tong+彤stringlen
const afterTong = after.substring(tong + "'彤':'火'".length);
console.log('Chars after 彤:', afterTong.substring(0, 50));
