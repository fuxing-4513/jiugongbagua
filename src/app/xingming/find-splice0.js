const fs = require('fs');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// Find CHARS_WX in xe.txt
const charsIdx = xe.indexOf('const CHARS_WX:');
const afterChars = xe.substring(charsIdx);

// Find '煜':'火',
const yuStr = "'煜':'火'";
const yuIdx = afterChars.indexOf(yuStr);
console.log('yu (煜) offset from CHARS_WX:', yuIdx);

// Show what comes after
const afterYu = afterChars.substring(yuIdx + yuStr.length);
console.log('First 200 chars after 煜 fire:', afterYu.substring(0, 200));

// Find the continuation - what comes RIGHT AFTER the comma after 煜
// xe has ,\n or just , after it - let's find what follows
const commaAfterYu = afterYu.indexOf(',');
console.log('\nComma after 煜 at offset:', commaAfterYu);
const realAfter = afterYu.substring(commaAfterYu + 1);
console.log('After comma (100 chars):', realAfter.substring(0, 100));

// Now find '炜':'火', in the continuation
const weiStr = "'炜':'火'";
const weiIdx = realAfter.indexOf(weiStr);
console.log('\n炜 offset in continuation:', weiIdx);

// Find '彤':'火',
const tongStr = "'彤':'火'";
const tongIdx = realAfter.indexOf(tongStr);
console.log('彤 offset in continuation:', tongIdx);

// So from the 炜 entry onward is what we need
// But actually line 247 in broken file already starts with '炜':'火'
// The problem is the entire rest of the file is ONE LINE (no newlines after the splice)

// Better approach: extract everything from the 炜 entry through end of file from xe.txt
// with proper newlines
const fromWei = realAfter.substring(weiIdx);

// Need to also find where CHARS_WX ends and getCharWuxing starts
const getCharIdx = afterChars.indexOf('function getCharWuxing');
console.log('\ngetCharWuxing at offset:', getCharIdx);
console.log('CHARS_WX closing brace around:', afterChars.substring(getCharIdx - 30, getCharIdx + 30));

// Find the closing } of CHARS_WX
const charsEnd = afterChars.indexOf('}', getCharIdx - 50);
console.log('\nCHARS_WX closing } at:', charsEnd);
console.log('Section right before close:', afterChars.substring(charsEnd - 40, charsEnd + 40));
