// 九宫八卦 星空背景生成器
// 用法: node scripts/generate-stars.js
// 生成逼真的星空 SVG，输出到 out/beidou-bg.svg 和 public/beidou-bg.svg

const fs = require('fs');
const path = require('path');

// ── Mulberry32 seeded PRNG ──
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

// ── Helpers ──
function randBetween(a, b) { return a + rand() * (b - a); }
function randInt(a, b) { return Math.floor(randBetween(a, b + 1)); }
function hexColor(r, g, b) { return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join(''); }
function lerpColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return hexColor(r, g, b);
}
const W = 1440, H = 900;

// ── Parts array ──
let parts = [];

// ── SVG wrapper ──
function svgTag() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">`;
}

// ── Defs: filters, gradients ──
parts.push(`<defs>
<filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b1"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b2"/>
  <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="beidouGlow" x="-150%" y="-150%" width="400%" height="400%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b1"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b2"/>
  <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="nebulaBlur" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="40"/>
</filter>
<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#01010a"/>
  <stop offset="30%" stop-color="#020418"/>
  <stop offset="60%" stop-color="#03081a"/>
  <stop offset="100%" stop-color="#01010a"/>
</linearGradient>
<radialGradient id="nebulaA" cx="40%" cy="35%" r="55%">
  <stop offset="0%" stop-color="#1a1a4e" stop-opacity="0.04"/>
  <stop offset="40%" stop-color="#0e0e3a" stop-opacity="0.015"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="nebulaB" cx="65%" cy="55%" r="50%">
  <stop offset="0%" stop-color="#162040" stop-opacity="0.05"/>
  <stop offset="35%" stop-color="#0c1030" stop-opacity="0.02"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="nebulaC" cx="25%" cy="70%" r="45%">
  <stop offset="0%" stop-color="#120d2e" stop-opacity="0.035"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="milkyWay" x1="30%" y1="0%" x2="70%" y2="100%">
  <stop offset="0%" stop-color="#1e2d5a" stop-opacity="0.03"/>
  <stop offset="25%" stop-color="#263a6e" stop-opacity="0.05"/>
  <stop offset="50%" stop-color="#1a2e55" stop-opacity="0.04"/>
  <stop offset="75%" stop-color="#0f1a35" stop-opacity="0.02"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="polarisGlow" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#fefce8" stop-opacity="0.03"/>
  <stop offset="50%" stop-color="#fef3c7" stop-opacity="0.01"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
</defs>`);

// ── Sky background ──
parts.push(`<rect width="${W}" height="${H}" fill="url(#skyGrad)"/>`);

// ── Nebulae ──
parts.push(`<ellipse cx="${W*0.4}" cy="${H*0.35}" rx="${W*0.55}" ry="${H*0.45}" fill="url(#nebulaA)"/>`);
parts.push(`<ellipse cx="${W*0.65}" cy="${H*0.55}" rx="${W*0.50}" ry="${H*0.40}" fill="url(#nebulaB)"/>`);
parts.push(`<ellipse cx="${W*0.25}" cy="${H*0.70}" rx="${W*0.40}" ry="${H*0.35}" fill="url(#nebulaC)"/>`);
// Milky way band (tilted)
parts.push(`<ellipse cx="${W*0.5}" cy="${H*0.5}" rx="${W*0.6}" ry="${H*0.2}" fill="url(#milkyWay)" transform="rotate(-30,${W*0.5},${H*0.5})"/>`);

// ── Star layers ──
// Layer 1: micro stars (~600)
let microStars = '';
for (let i = 0; i < 600; i++) {
  const x = randBetween(0, W);
  const y = randBetween(0, H);
  const r = randBetween(0.2, 0.5);
  const c1 = [0x88, 0x99, 0xcc]; // #8899cc
  const c2 = [0xaa, 0xbb, 0xdd]; // #aabbdd
  const color = lerpColor(c1, c2, rand());
  const op = randBetween(0.08, 0.25);
  microStars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>\n`;
}
parts.push(microStars);

// Layer 2: dim stars (~200)
let dimStars = '';
for (let i = 0; i < 200; i++) {
  const x = randBetween(0, W);
  const y = randBetween(0, H);
  const r = randBetween(0.5, 1.0);
  const c1 = [0x88, 0x99, 0xcc]; // #8899cc
  const c2 = [0xc8, 0xd0, 0xe0]; // #c8d0e0
  const color = lerpColor(c1, c2, rand());
  const op = randBetween(0.12, 0.35);
  dimStars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>\n`;
}
parts.push(dimStars);

// Layer 3: bright stars (~60)
let brightStars = '';
for (let i = 0; i < 60; i++) {
  const x = randBetween(0, W);
  const y = randBetween(0, H);
  const r = randBetween(1.0, 2.0);
  const c1 = [0xc8, 0xd0, 0xe0]; // #c8d0e0
  const c2 = [0xee, 0xdd, 0xcc]; // #eeddcc
  const color = lerpColor(c1, c2, rand());
  const op = randBetween(0.25, 0.55);
  brightStars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>\n`;
}
parts.push(brightStars);

// Layer 4: very bright stars (~12)
let vBrightStars = '';
for (let i = 0; i < 12; i++) {
  const x = randBetween(0, W);
  const y = randBetween(0, H);
  const r = randBetween(1.5, 2.5);
  const c1 = [0xee, 0xdd, 0xcc]; // #eeddcc
  const c2 = [0xff, 0xf8, 0xe8]; // #fff8e8
  const color = lerpColor(c1, c2, rand());
  const op = randBetween(0.4, 0.75);
  vBrightStars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>\n`;
}
parts.push(vBrightStars);

// ── Big Dipper (extremely subtle, 若隐若现) ──
const dipper = [
  { name: '天枢', x: 500, y: 350, r: 3.5, halo: 8 },
  { name: '天璇', x: 620, y: 400, r: 3.2, halo: 7 },
  { name: '天玑', x: 720, y: 440, r: 3.0, halo: 7 },
  { name: '天权', x: 800, y: 530, r: 2.8, halo: 6 },
  { name: '玉衡', x: 680, y: 600, r: 4.0, halo: 9 },
  { name: '开阳', x: 720, y: 700, r: 3.0, halo: 7 },
  { name: '摇光', x: 840, y: 780, r: 2.8, halo: 6 },
];
const polaris = { x: 520, y: 120 };

// Polaris faint glow
parts.push(`<circle cx="${polaris.x}" cy="${polaris.y}" r="120" fill="url(#polarisGlow)"/>`);

// Connection lines (extremely faint)
let dipperLines = '<g stroke="#fcd34d" stroke-width="0.5" opacity="0.08" fill="none" stroke-dasharray="3 12">\n';
dipperLines += `<line x1="${dipper[0].x}" y1="${dipper[0].y}" x2="${dipper[1].x}" y2="${dipper[1].y}"/>\n`;
dipperLines += `<line x1="${dipper[1].x}" y1="${dipper[1].y}" x2="${dipper[2].x}" y2="${dipper[2].y}"/>\n`;
dipperLines += `<line x1="${dipper[2].x}" y1="${dipper[2].y}" x2="${dipper[3].x}" y2="${dipper[3].y}"/>\n`;
dipperLines += `<line x1="${dipper[3].x}" y1="${dipper[3].y}" x2="${dipper[4].x}" y2="${dipper[4].y}"/>\n`;
dipperLines += `<line x1="${dipper[4].x}" y1="${dipper[4].y}" x2="${dipper[5].x}" y2="${dipper[5].y}"/>\n`;
dipperLines += `<line x1="${dipper[5].x}" y1="${dipper[5].y}" x2="${dipper[6].x}" y2="${dipper[6].y}"/>\n`;
dipperLines += `<line x1="${dipper[0].x}" y1="${dipper[0].y}" x2="${polaris.x}" y2="${polaris.y}" opacity="0.04" stroke-dasharray="2 15"/>\n`;
dipperLines += '</g>\n';
parts.push(dipperLines);

// Big Dipper stars
let dipperStars = '<g filter="url(#beidouGlow)">\n';
for (const star of dipper) {
  // Outer halo (very faint)
  dipperStars += `<circle cx="${star.x}" cy="${star.y}" r="${star.halo}" fill="#fcd34d" opacity="${randBetween(0.05,0.09).toFixed(2)}"/>\n`;
  // Core star (subtle)
  dipperStars += `<circle cx="${star.x}" cy="${star.y}" r="${star.r}" fill="#fff8e8" opacity="${randBetween(0.22,0.38).toFixed(2)}"/>\n`;
}
// Polaris
dipperStars += `<circle cx="${polaris.x}" cy="${polaris.y}" r="2.5" fill="#ffffff" opacity="0.40"/>\n`;
dipperStars += `<circle cx="${polaris.x}" cy="${polaris.y}" r="1.2" fill="#ffffff" opacity="0.65"/>\n`;
// Polaris cross (faint)
dipperStars += `<line x1="${polaris.x}" y1="${polaris.y-10}" x2="${polaris.x}" y2="${polaris.y+10}" stroke="#fefce8" stroke-width="0.5" opacity="0.15"/>\n`;
dipperStars += `<line x1="${polaris.x-10}" y1="${polaris.y}" x2="${polaris.x+10}" y2="${polaris.y}" stroke="#fefce8" stroke-width="0.5" opacity="0.15"/>\n`;
dipperStars += '</g>\n';
parts.push(dipperStars);

// ── Bagua in corner (extremely faint) ──
const baguaX = W - 140, baguaY = H - 140;
parts.push(`<g transform="translate(${baguaX},${baguaY}) scale(0.6)" opacity="0.02">
  <circle cx="50" cy="50" r="50" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100 A50,50 0 0,1 50,0" fill="#fbbf24"/>
  <circle cx="50" cy="25" r="8" fill="#01010a"/>
  <circle cx="50" cy="75" r="8" fill="#fbbf24"/>
</g>`);

// ── Close SVG ──
parts.push('</svg>');

const svg = parts.join('\n');

// ── Write output ──
const rootDir = path.resolve(__dirname, '..');
const outPath = path.join(rootDir, 'out', 'beidou-bg.svg');
const pubPath = path.join(rootDir, 'public', 'beidou-bg.svg');

fs.writeFileSync(outPath, svg, 'utf-8');
fs.writeFileSync(pubPath, svg, 'utf-8');

const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`✅ 星空背景已生成 (${kb} KB)`);
console.log(`   out/beidou-bg.svg`);
console.log(`   public/beidou-bg.svg`);
console.log(`   ${600+200+60+12}=872 颗星星 + 4层星云 + 北斗七星(若隐若现)`);
