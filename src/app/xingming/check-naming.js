const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const content = fs.readFileSync(p, 'utf8');
console.log('File length:', content.length, 'bytes');

const dan = '\u4e39'; // 丹
const huoren = "'" + dan + "':'\\u706b'"; // '丹':'火'

const danCount = (content.split("'丹':'火'").length - 1);
console.log("Count of '丹':'火':", danCount);

// Check for export default
const hasExport = content.includes('export default function NamingClient');
console.log('Has export default:', hasExport);

// Check const definitions
const defs = [
  'const STROKE:', 'const WXC:', 'const NUM_DETAIL:', 'const SANCAI_MAP:',
  'const POEM_NAMES:', 'const CHARS_WX:', 'const SHENG_CYCLE:', 'const SHI_CHEN_GAN:',
  'const SHI_CHEN_DIZHI:', 'const NAYIN:', 'const TIAN_GAN', 'const DI_ZHI',
  'const WX_TG:', 'const WX_DZ:', 'const CHAR_POOL:', 'const HOUR_OPTS:'
];
for (const d of defs) {
  const re = new RegExp(d.replace(':', '\\:'), 'g');
  const count = (content.match(re) || []).length;
  if (count > 1) console.log('WARN duplicate:', d, count);
  else if (count === 0) console.log('MISSING:', d);
  else console.log('OK:', d);
}

// Check around the junction
const junction = content.indexOf('}  //', 15000);
console.log('\nAround junction:', content.substring(15500, 15800));
