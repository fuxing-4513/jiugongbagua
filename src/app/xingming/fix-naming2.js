const fs = require('fs');

// ====================================================================
// Rebuild NamingClient.tsx properly
// Strategy: read line 1-246 from the broken file (correct first half),
// then extract and format the second half from xe.txt
// ====================================================================

const broken = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// --- Part 1: Lines 1-246 from broken file ---
const brokenLines = broken.split('\n');
const firstPart = brokenLines.slice(0, 246).join('\n');
console.log('Part 1:', firstPart.length, 'bytes, ends with:', firstPart.slice(-40));

// --- Part 2: Extract CHARS_WX continuation from xe.txt ---
// After '煜':'火' in CHARS_WX, xe.txt has:
//   '炜':'火',...'彤':'火','丹':'火',... (fire section rest)
//   '恒':'土',... (earth section)
//   '钢':'金',... (metal section)  
//   '沛':'水',...'慕':'水', (water section)
// Then closing }, then function getCharWuxing...

const charsIdx = xe.indexOf('const CHARS_WX:');
const afterChars = xe.substring(charsIdx);

// Find the unformatted block from '炜':'火' to closing of CHARS_WX
const weiStr = "'炜':'火'";
const weiIdx = afterChars.indexOf(weiStr);
const charsEnd = afterChars.indexOf('}', weiIdx) + 1; // include the closing }

const unformattedBlock = afterChars.substring(weiIdx, charsEnd);
console.log('\nUnformatted block length:', unformattedBlock.length);
console.log('First 200:', unformattedBlock.substring(0, 200));
console.log('Last 100:', unformattedBlock.slice(-100));

// Format the block: replace ,' with ,\n  ' (entry per line)
// The block has entries like: '炜':'火','炫':'火','烨':'火',...'慕':'水',
let formatted = unformattedBlock;
// Each entry is: 'ch':'wx',
// Replace ",'" with ",\n  '"
formatted = formatted.replace(/,/g, ',\n  ');
// Fix - the replace may also hit the closing brace. Let me be smarter:
// Actually, let me just split on commas and rejoin with newlines
const entries = unformattedBlock.split(',');
const formattedLines = entries.map((e, i) => {
  const trimmed = e.trim();
  if (!trimmed) return '';
  if (trimmed === '}') return '}';
  return '  ' + trimmed;
}).filter(l => l.length > 0);
formatted = formattedLines.join(',\n');
// Ensure the last line is just '}' and the second-to-last has trailing comma
console.log('\nFormatted block (first 200):');
console.log(formatted.substring(0, 200));

// --- Part 3: Everything after CHARS_WX from xe.txt ---  
const afterCharsClose = xe.substring(charsIdx + charsEnd + 1); // +1 for newline after }
console.log('\nAfter CHARS_WX close first 200:', afterCharsClose.substring(0, 200));

// --- Assemble final file ---
let final = firstPart + '\n' + formatted + '\n' + afterCharsClose;
console.log('\nFinal file length:', final.length, 'bytes');

// Write it
const outPath = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
fs.writeFileSync(outPath, final, 'utf8');
console.log('Written successfully');

// Verify
const check = fs.readFileSync(outPath, 'utf8');
const checkLines = check.split('\n');
console.log('Result lines:', checkLines.length);
console.log('Last line:', checkLines[checkLines.length - 2] || checkLines[checkLines.length - 1]);

// Check key markers
const markers = [
  'const STROKE:', 'const WXC:', 'const NUM_DETAIL:', 'const SANCAI_MAP:',
  'const POEM_NAMES:', 'const CHARS_WX:', 'const SHENG_CYCLE:', 'const KE_CYCLE:',
  'function getCharWuxing', 'function analyzeWuxing', 'const SHI_CHEN_GAN:',
  'const SHI_CHEN_DIZHI:', 'const NAYIN:', 'function calcBazi', 'const TIAN_GAN',
  'const DI_ZHI', 'const WX_TG:', 'const WX_DZ', 'function charWx',
  'function checkCharWx', 'const CHAR_POOL:', 'const HOUR_OPTS:',
  'function getHourDz', 'function generateNames', 'export default function NamingClient'
];
for (const m of markers) {
  const count = (check.match(new RegExp(m.replace(/:/g, '\\:'), 'g')) || []).length;
  if (count > 1) console.log('DUPLICATE:', m, count);
  else if (count === 0) console.log('MISSING:', m);
  else console.log('  ✓', m);
}

// Check no lines > 1000 chars
let longLines = 0;
checkLines.forEach((line, i) => {
  if (line.length > 500) {
    longLines++;
    if (longLines <= 3) console.log(`Long line L${i+1}: ${line.length} chars`);
  }
});
console.log('Total long lines (>500):', longLines);
