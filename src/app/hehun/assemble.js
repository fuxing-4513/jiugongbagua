const fs = require('fs');
const target = 'C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua\\src\\app\\hehun\\HehunClient.tsx';
const parts = [];
let partIdx = 0;

// Read all part files
while (true) {
  const p = `C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua\\src\\app\\hehun\\part${partIdx}.txt`;
  try {
    const c = fs.readFileSync(p, 'utf8');
    parts.push(c);
    partIdx++;
  } catch { break; }
}

if (parts.length === 0) { console.error('No parts found'); process.exit(1); }

fs.writeFileSync(target, parts.join(''), 'utf8');
console.log('Assembled', parts.length, 'parts into', target, '- total', fs.statSync(target).size, 'bytes');

// Cleanup part files
for (let i = 0; i < partIdx; i++) {
  fs.unlinkSync(`C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua\\src\\app\\hehun\\part${i}.txt`);
}
console.log('Part files cleaned');
