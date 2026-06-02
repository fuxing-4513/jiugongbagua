// 九宫八卦 浩瀚星空 v5 — 强漫射光晕(提亮色值) + 北斗七星吸睛 + 板块底色根因修复
const fs = require('fs');
const path = require('path');

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
function rnd(a, b) { return a + rand() * (b - a); }
function clr(c1, c2, t) {
  return '#' + [0,1,2].map(i => Math.round(c1[i] + (c2[i] - c1[i]) * t).toString(16).padStart(2, '0')).join('');
}
const W = 1440, H = 900, CX = W/2, CY = H/2;

let out = [];

out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
<defs>
<filter id="starGlow" x="-300%" y="-300%" width="700%" height="700%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b1"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b2"/>
  <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="beidouGlow" x="-200%" y="-200%" width="500%" height="500%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
</filter>
<!-- 漫射光晕滤镜 -->
<filter id="df80" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="80"/>
</filter>
<filter id="df140" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="140"/>
</filter>
<filter id="df50" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="50"/>
</filter>
<filter id="df100" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="100"/>
</filter>

<!-- 彩色漫射光晕 v5 — 大幅提亮 stop-color + 翻倍 opacity -->
<radialGradient id="dBlue" cx="50%" cy="70%" r="65%">
  <stop offset="0%" stop-color="#1a3a6a" stop-opacity="0.25"/>
  <stop offset="25%" stop-color="#0f2550" stop-opacity="0.15"/>
  <stop offset="55%" stop-color="#081838" stop-opacity="0.06"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dBlue2" cx="50%" cy="85%" r="55%">
  <stop offset="0%" stop-color="#15305a" stop-opacity="0.20"/>
  <stop offset="40%" stop-color="#0c2042" stop-opacity="0.10"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dPurple" cx="50%" cy="48%" r="55%">
  <stop offset="0%" stop-color="#2a1552" stop-opacity="0.20"/>
  <stop offset="35%" stop-color="#181038" stop-opacity="0.12"/>
  <stop offset="70%" stop-color="#0c0820" stop-opacity="0.05"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dWarm" cx="50%" cy="35%" r="60%">
  <stop offset="0%" stop-color="#603018" stop-opacity="0.20"/>
  <stop offset="25%" stop-color="#402010" stop-opacity="0.12"/>
  <stop offset="55%" stop-color="#1c0e06" stop-opacity="0.05"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dTeal" cx="35%" cy="58%" r="50%">
  <stop offset="0%" stop-color="#0e3040" stop-opacity="0.16"/>
  <stop offset="40%" stop-color="#082028" stop-opacity="0.08"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dGold" cx="50%" cy="42%" r="40%">
  <stop offset="0%" stop-color="#4a2a0c" stop-opacity="0.14"/>
  <stop offset="50%" stop-color="#201208" stop-opacity="0.06"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dCyan" cx="45%" cy="25%" r="45%">
  <stop offset="0%" stop-color="#0c2a3a" stop-opacity="0.16"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="dRose" cx="60%" cy="55%" r="40%">
  <stop offset="0%" stop-color="#381020" stop-opacity="0.12"/>
  <stop offset="50%" stop-color="#1a0810" stop-opacity="0.05"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>

<!-- 星云 -->
<radialGradient id="nebula1" cx="30%" cy="30%" r="60%">
  <stop offset="0%" stop-color="#151540" stop-opacity="0.10"/>
  <stop offset="30%" stop-color="#0c0c28" stop-opacity="0.05"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="nebula2" cx="70%" cy="62%" r="50%">
  <stop offset="0%" stop-color="#121236" stop-opacity="0.08"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<radialGradient id="polarisGlow" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#fefce8" stop-opacity="0.04"/>
  <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
</radialGradient>
<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#010108"/>
  <stop offset="25%" stop-color="#020412"/>
  <stop offset="50%" stop-color="#03061a"/>
  <stop offset="75%" stop-color="#020515"/>
  <stop offset="100%" stop-color="#010108"/>
</linearGradient>
</defs>`);

// 天空底
out.push(`<rect width="${W}" height="${H}" fill="url(#skyGrad)"/>`);

// ===== 8层彩色漫射光晕 v5（提亮色值+翻倍opacity）=====
out.push(`<ellipse cx="${CX}" cy="${H*0.75}" rx="${W*0.55}" ry="${H*0.3}" fill="url(#dBlue)" filter="url(#df80)"/>`);
out.push(`<ellipse cx="${CX}" cy="${CY}" rx="${W*0.5}" ry="${H*0.45}" fill="url(#dPurple)" filter="url(#df140)"/>`);
out.push(`<ellipse cx="${CX}" cy="${H*0.32}" rx="${W*0.5}" ry="${H*0.32}" fill="url(#dWarm)" filter="url(#df80)"/>`);
out.push(`<ellipse cx="${W*0.3}" cy="${H*0.52}" rx="${W*0.4}" ry="${H*0.35}" fill="url(#dCyan)" filter="url(#df50)"/>`);
out.push(`<ellipse cx="${W*0.55}" cy="${H*0.42}" rx="${W*0.32}" ry="${H*0.28}" fill="url(#dGold)" filter="url(#df50)"/>`);
out.push(`<ellipse cx="${W*0.62}" cy="${H*0.62}" rx="${W*0.38}" ry="${H*0.3}" fill="url(#dTeal)" filter="url(#df50)"/>`);
out.push(`<ellipse cx="${W*0.55}" cy="${H*0.55}" rx="${W*0.3}" ry="${H*0.25}" fill="url(#dRose)" filter="url(#df100)"/>`);
out.push(`<ellipse cx="${CX}" cy="${H*0.82}" rx="${W*0.5}" ry="${H*0.22}" fill="url(#dBlue2)" filter="url(#df140)"/>`);

// 星云
out.push(`<ellipse cx="${W*0.32}" cy="${H*0.28}" rx="${W*0.48}" ry="${H*0.38}" fill="url(#nebula1)" filter="url(#df100)"/>`);
out.push(`<ellipse cx="${W*0.68}" cy="${H*0.62}" rx="${W*0.42}" ry="${H*0.33}" fill="url(#nebula2)" filter="url(#df100)"/>`);

// ===== 星星层 =====
function horizonBright(y) { return Math.max(0.10, 1 - y / H * 0.78); }

// L0: 极微星 3000颗
let l0 = '';
for (let i = 0; i < 3000; i++) {
  const x = rnd(0, W), y = rnd(0, H);
  l0 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(0.10,0.32).toFixed(3)}" fill="${clr([0x70,0x80,0xb0],[0x98,0xa8,0xd0],rand())}" opacity="${(rnd(0.03,0.14)*horizonBright(y)).toFixed(3)}"/>\n`;
}
out.push(`<g>${l0}</g>`);

// L1: 暗星 1200颗
let l1 = '';
for (let i = 0; i < 1200; i++) {
  const x = rnd(0, W), y = rnd(0, H);
  l1 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(0.3,0.7).toFixed(2)}" fill="${clr([0x88,0x95,0xc0],[0xb0,0xbc,0xd8],rand())}" opacity="${(rnd(0.08,0.28)*horizonBright(y)).toFixed(2)}"/>\n`;
}
out.push(`<g>${l1}</g>`);

// L2: 中亮星 600颗
let l2 = '';
for (let i = 0; i < 600; i++) {
  const x = rnd(0, W), y = rnd(0, H);
  const warm = rand() > 0.68;
  const c = warm ? clr([0xee,0xdd,0xbb],[0xff,0xf4,0xe0],rand()) : clr([0xb8,0xc8,0xe8],[0xe0,0xe8,0xf8],rand());
  l2 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(0.6,1.2).toFixed(2)}" fill="${c}" opacity="${(rnd(0.15,0.42)*horizonBright(y)).toFixed(2)}"/>\n`;
}
out.push(`<g>${l2}</g>`);

// L3: 亮星 180颗
let l3 = '';
for (let i = 0; i < 180; i++) {
  const x = rnd(0, W), y = rnd(0, H);
  const warm = rand() > 0.45;
  const c = warm ? clr([0xff,0xf0,0xd0],[0xff,0xfa,0xf0],rand()) : clr([0xe0,0xe8,0xff],[0xf8,0xfa,0xff],rand());
  l3 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(1.0,2.2).toFixed(2)}" fill="${c}" opacity="${(rnd(0.30,0.65)*horizonBright(y)).toFixed(2)}"/>\n`;
}
out.push(`<g filter="url(#starGlow)">${l3}</g>`);

// L4: 极亮星 30颗（带十字星芒）
let l4 = '';
for (let i = 0; i < 30; i++) {
  const x = rnd(0, W), y = rnd(0, H);
  const r = rnd(1.5, 3.2);
  const c = clr([0xff,0xf8,0xe8],[0xff,0xff,0xff],rand());
  const op = rnd(0.45, 0.85) * horizonBright(y);
  l4 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}" opacity="${op.toFixed(2)}"/>\n`;
  const cr = r * 4;
  l4 += `<line x1="${x.toFixed(1)}" y1="${(y-cr).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y+cr).toFixed(1)}" stroke="${c}" stroke-width="0.3" opacity="${(op*0.28).toFixed(2)}"/>\n`;
  l4 += `<line x1="${(x-cr).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x+cr).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="0.3" opacity="${(op*0.28).toFixed(2)}"/>\n`;
}
out.push(`<g filter="url(#starGlow)">${l4}</g>`);

// 星团
const clusters = [
  { cx: 380, cy: 200, n: 35, r: 70 },
  { cx: 1080, cy: 320, n: 25, r: 55 },
  { cx: 750, cy: 840, n: 18, r: 40 },
];
for (const cc of clusters) {
  let cl = '';
  for (let i = 0; i < cc.n; i++) {
    const a = rnd(0, Math.PI*2), d = rnd(0, cc.r);
    const x = cc.cx + Math.cos(a) * d, y = cc.cy + Math.sin(a) * d;
    cl += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(0.3,1.0).toFixed(2)}" fill="${clr([0xc0,0xd0,0xf0],[0xf0,0xf4,0xff],rand())}" opacity="${(rnd(0.12,0.40)*(1-d/cc.r)).toFixed(2)}"/>\n`;
  }
  out.push(cl);
}

// ===== 北斗七星 v5 — 更大更亮，吸睛纵贯 =====
const dipper = [
  { name:'天枢', x:590, y:30,  r:6.0, halo:20 },  // 顶部
  { name:'天璇', x:670, y:170, r:6.0, halo:20 },
  { name:'天玑', x:730, y:360, r:5.5, halo:18 },
  { name:'天权', x:840, y:520, r:5.5, halo:18 },
  { name:'玉衡', x:730, y:600, r:6.5, halo:22 },  // 中心最大
  { name:'开阳', x:790, y:740, r:5.0, halo:16 },
  { name:'摇光', x:850, y:880, r:4.5, halo:14 },  // 底部
];
const polaris = { x: 520, y: -30 };

// 北极星光晕
out.push(`<circle cx="${polaris.x}" cy="${polaris.y+50}" r="120" fill="url(#polarisGlow)"/>`);

// 连线
out.push(`<g stroke="#fcd34d" stroke-width="0.6" opacity="0.08" fill="none" stroke-dasharray="3 16">
<line x1="${dipper[0].x}" y1="${dipper[0].y}" x2="${dipper[1].x}" y2="${dipper[1].y}"/>
<line x1="${dipper[1].x}" y1="${dipper[1].y}" x2="${dipper[2].x}" y2="${dipper[2].y}"/>
<line x1="${dipper[2].x}" y1="${dipper[2].y}" x2="${dipper[3].x}" y2="${dipper[3].y}"/>
<line x1="${dipper[3].x}" y1="${dipper[3].y}" x2="${dipper[4].x}" y2="${dipper[4].y}"/>
<line x1="${dipper[4].x}" y1="${dipper[4].y}" x2="${dipper[5].x}" y2="${dipper[5].y}"/>
<line x1="${dipper[5].x}" y1="${dipper[5].y}" x2="${dipper[6].x}" y2="${dipper[6].y}"/>
<line x1="${dipper[0].x}" y1="${dipper[0].y}" x2="${polaris.x}" y2="${polaris.y+50}" opacity="0.04" stroke-dasharray="1 22"/>
</g>`);

// 七星本体 — v5 吸睛版
out.push(`<g filter="url(#beidouGlow)">`);
for (const s of dipper) {
  out.push(`<circle cx="${s.x}" cy="${s.y}" r="${s.halo}" fill="#fcd34d" opacity="0.06"/>`);
  out.push(`<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#fff8e8" opacity="0.28"/>`);
}
// 北极星
out.push(`<circle cx="${polaris.x}" cy="${polaris.y+50}" r="8" fill="#fefce8" opacity="0.05"/>`);
out.push(`<circle cx="${polaris.x}" cy="${polaris.y+50}" r="3" fill="#ffffff" opacity="0.40"/>`);
out.push(`<circle cx="${polaris.x}" cy="${polaris.y+50}" r="1.2" fill="#ffffff" opacity="0.65"/>`);
out.push(`<line x1="${polaris.x}" y1="${polaris.y+38}" x2="${polaris.x}" y2="${polaris.y+62}" stroke="#fefce8" stroke-width="0.5" opacity="0.12"/>`);
out.push(`<line x1="${polaris.x-10}" y1="${polaris.y+50}" x2="${polaris.x+10}" y2="${polaris.y+50}" stroke="#fefce8" stroke-width="0.5" opacity="0.12"/>`);
out.push(`</g>`);

// 右下角极淡八卦
out.push(`<g transform="translate(${W-130},${H-130}) scale(0.55)" opacity="0.012">
<circle cx="50" cy="50" r="50" stroke="#fbbf24" stroke-width="2" fill="none"/>
<path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100 A50,50 0 0,1 50,0" fill="#fbbf24"/>
<circle cx="50" cy="25" r="8" fill="#010108"/>
<circle cx="50" cy="75" r="8" fill="#fbbf24"/>
</g>`);

out.push('</svg>');

const svg = out.join('\n');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
fs.writeFileSync(path.join(root, 'out', 'beidou-bg.svg'), svg, 'utf-8');
fs.writeFileSync(path.join(root, 'public', 'beidou-bg.svg'), svg, 'utf-8');

const kb = (Buffer.byteLength(svg)/1024).toFixed(1);
const total = 3000+1200+600+180+30;
console.log(`v5: ${kb} KB | ${total} stars | 8x bright diffuse halos (2-3x Luminance + 2x opacity) | Big Dipper: r=4.5~6.5, opacity=0.28, y=30→880`);
