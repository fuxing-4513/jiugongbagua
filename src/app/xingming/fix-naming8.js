const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

// Find the export default component - it's at the very end
const edIdx = c.indexOf('export default function NamingClient()');
if (edIdx < 0) { console.log('Not found'); process.exit(1); }

// Everything from edIdx to end is the comp
const component = c.substring(edIdx);
console.log('Component length:', component.length);

// Format: split at semicolons, then return statements, etc.
// The component has: hooks + return JSX
// Hooks are: const [x, setX] = useState(...) patterns

// Add newlines after each hook  
let formatted = component;

// Split hooks
formatted = formatted.replace(/useState\(/g, '\n  const [...] = useState(');
formatted = formatted.replace(/useCallback\(/g, '\n  const [...] = useCallback(');

// Actually the hooks have their values inline, let me use a different approach
// Split at known hook patterns
formatted = formatted.replace(/\])   \/\//g, ']\n  //');
formatted = formatted.replace(/\];\s*const/g, '];\n  const');

// Split return from hooks
formatted = formatted.replace(/return \(<div/g, '\n  return (\n    <div');

// Format JSX - basic splits
formatted = formatted.replace(/<div className=/g, '\n        <div className=');

// Keep going line by line
const lines = formatted.split('\n');
let out = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Split long JSX lines at tag boundaries
  if (line.length > 200 && line.includes('<')) {
    // Insert newlines before major tags
    line = line.replace(/<button /g, '\n          <button ');
    line = line.replace(/<span /g, '\n            <span ');
    line = line.replace(/<input /g, '\n          <input ');
    line = line.replace(/<select /g, '\n          <select ');
    line = line.replace(/<h3 /g, '\n            <h3 ');
    line = line.replace(/<\/div>/g, '\n          </div>');
    line = line.replace(/<\/button>/g, '\n          </button>');
    line = line.replace(/<option /g, '\n              <option ');
    line = line.replace(/<p class/g, '\n            <p class');
    line = line.replace(/<p>/g, '\n            <p>');
    line = line.replace(/<label /g, '\n              <label ');
  }
  
  out.push(line);
}

formatted = out.join('\n');

// Clean up excessive blank lines
formatted = formatted.replace(/\n{3,}/g, '\n\n');

// Now write
const newContent = c.substring(0, edIdx) + formatted;
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', newContent, 'utf8');
console.log('Written. Length:', newContent.length);

// Verify
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
