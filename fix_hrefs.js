const fs = require('fs');
let c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/page.tsx', 'utf8');
const reps = [
  ['\u{1F9ED}', '/fengshui'],
  ['\u2696\uFE0F', '/chenggu'],
  ['\u{1F409}', '/shengxiao'],
  ['\u2648', '/xingzuo'],
  ['\u{1F300}', '/qimen'],
  ['\u{1F338}', '/meihua'],
  ['\u{1F3EE}', '/lingqian'],
];
for (const [e, r] of reps) {
  const old = "emoji: '" + e + "', href: '#'";
  const nw = "emoji: '" + e + "', href: '" + r + "'";
  c = c.replace(old, nw);
}
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/page.tsx', c, 'utf8');
console.log('Remaining # links:', (c.match(/href: '#'/g) || []).length);
