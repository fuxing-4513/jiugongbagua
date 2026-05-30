const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

// Find CHARS_WX block
const charsIdx = c.indexOf('const CHARS_WX:');
const charsEnd = c.indexOf('}', charsIdx);
const before = c.substring(0, charsIdx);
const after = c.substring(charsEnd + 1); // includes the }

const charsContent = c.substring(charsIdx, charsEnd + 1);
console.log('CHARS_WX length:', charsContent.length);

// Split into lines
const lines = charsContent.split('\n');

// Track seen keys, remove duplicates (keep first occurrence)
const seen = new Set();
const seenValues = new Set();
const newLines = [];

for (const line of lines) {
  // Check if this line has a CHARS_WX entry
  const match = line.match(/^\s+'([^']+)':'(木|火|土|金|水)'/);
  if (match) {
    const key = match[1];
    const val = match[2];
    const lookup = key + ':' + val;
    if (seen.has(key)) {
      // Duplicate - skip it (keep the first one)
      console.log('Removing duplicate:', key, val);
      newLines.push('// ' + line.trim() + ' (dedup)');
    } else {
      seen.add(key);
      newLines.push(line);
    }
  } else if (line.trim() === '},') {
    newLines.push(line);
  } else if (line.trim() === '}') {
    newLines.push(line);
  } else {
    newLines.push(line);
  }
}

const newChars = newLines.join('\n');
const result = before + newChars + after;

console.log('\nOriginal size:', c.length, 'New size:', result.length);
console.log('Duplicate count before:', seen.size, 'After fix');

fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', result, 'utf8');
console.log('Written.');
