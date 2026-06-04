const fs = require('fs');

function extractKeys(filepath) {
  const src = fs.readFileSync(filepath, 'utf-8');
  const keys = [];
  const lines = src.split('\n');
  let currentSection = 'root';
  for (const line of lines) {
    const sectionMatch = line.match(/^  (\w+):\s*\{/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      keys.push(currentSection);
      continue;
    }
    const keyMatch = line.match(/^    (\w+):\s*['\"(]/);
    if (keyMatch) {
      keys.push(currentSection + '.' + keyMatch[1]);
    }
  }
  return keys;
}

const zh = extractKeys('src/lib/locales/zh-CN.ts');
const tw = extractKeys('src/lib/locales/zh-TW.ts');
const en = extractKeys('src/lib/locales/en.ts');

console.log('zh-CN keys: ' + zh.length);
console.log('zh-TW keys: ' + tw.length);
console.log('en keys: ' + en.length);

const zhSet = new Set(zh);
const twSet = new Set(tw);
const enSet = new Set(en);

const missingInTW = zh.filter(k => !twSet.has(k));
const missingInEN = zh.filter(k => !enSet.has(k));
const extraInTW = tw.filter(k => !zhSet.has(k));
const extraInEN = en.filter(k => !zhSet.has(k));

if (missingInTW.length) console.log('Missing in zh-TW: ' + missingInTW.join(', '));
if (missingInEN.length) console.log('Missing in en: ' + missingInEN.join(', '));
if (extraInTW.length) console.log('Extra in zh-TW: ' + extraInTW.join(', '));
if (extraInEN.length) console.log('Extra in en: ' + extraInEN.join(', '));

if (!missingInTW.length && !missingInEN.length && !extraInTW.length && !extraInEN.length) {
  console.log('All 3 locales are in sync!');
}
