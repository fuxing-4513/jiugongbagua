const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');

// 地支行——给 zhi 的 td 加 text-base
c = c.replace(
  'font-bold text-amber-400 font-serif">{x.zhi}</td>',
  'font-bold text-amber-400 font-serif text-base">{x.zhi}</td>'
);

// 如有两处都改
c = c.replace(
  'font-medium text-amber-400 font-serif">{x.zhi}</td>',
  'font-medium text-amber-400 font-serif text-base">{x.zhi}</td>'
);

// 也检查五行着色版地支
c = c.replace(
  'text-amber-400 font-serif">{x.zhi}',
  'text-amber-400 font-serif text-base">{x.zhi}'
);

// 藏干行也看看——一般用的是小字，如果藏干沿用也和地支有关
// 找所有包含 .zhi 的 td 并确认字号

fs.writeFileSync(f, c, 'utf8');
console.log('font size fixed');
