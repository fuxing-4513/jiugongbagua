const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

const edIdx = c.indexOf('export default function NamingClient()');
if (edIdx < 0) { console.log('Not found'); process.exit(1); }

const component = c.substring(edIdx);
console.log('Component length:', component.length);

let f = component;

// Split hooks
f = f.replace(/useState\(/g, '\n  useState(');
f = f.replace(/useCallback\(/g, '\n  useCallback(');

// Split return
f = f.replace(/return \(<div/g, '\n  return (\n    <div');

// Split at classNames='...' and other long attributes
// Don't split inside JS strings. Use a safe approach: split at JSX tag boundaries
f = f.replace(/><div className=/g, '>\n        <div className=');
f = f.replace(/><button/g, '>\n        <button');
f = f.replace(/><input/g, '>\n        <input');
f = f.replace(/><span/g, '>\n        <span');
f = f.replace(/><select/g, '>\n        <select');
f = f.replace(/><h3 /g, '>\n          <h3 ');
f = f.replace(/><p /g, '>\n          <p ');
f = f.replace(/><\/>/g, '>\n          </>');
f = f.replace(/<> <div/g, '<>\n        <div');
f = f.replace(/\(<div/g, '(\n        <div');
f = f.replace(/<\/div>/g, '\n        </div>');
f = f.replace(/<\/button>/g, '\n        </button>');

// Clean up
f = f.replace(/\n{3,}/g, '\n\n');

const newContent = c.substring(0, edIdx) + f;
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', newContent, 'utf8');
console.log('Written. Length:', newContent.length);

const r = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const rl = r.split('\n');
console.log('Lines:', rl.length);
let lc = 0, ml = 0, mlIdx = 0;
rl.forEach((l, i) => {
  const len = l.length;
  if (len > 200) { lc++; if (len > ml) { ml = len; mlIdx = i+1; if (lc <= 5) console.log('Long L' + (i+1) + ': ' + len + ' chars'); } }
});
console.log('Total lines > 200:', lc);
console.log('Longest: L' + mlIdx + ' (' + ml + ' chars)');
