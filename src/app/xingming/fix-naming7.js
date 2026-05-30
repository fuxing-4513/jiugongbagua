const fs = require('fs');
let c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

const edIdx = c.indexOf('export default function NamingClient()');
const compEnd = c.lastIndexOf('}) }');

if (edIdx >= 0 && compEnd > edIdx) {
  const code = c.substring(edIdx, compEnd + '}) }'.length);
  const returnIdx = code.indexOf('return (<div');
  const hooks = code.substring(0, returnIdx);
  let jsx = code.substring(returnIdx);

  // Format JSX: insert newlines at strategic points
  // Split at return statement
  jsx = jsx.replace('return (<div', 'return (\n      <div');

  // Split at JSX expression boundaries
  // Each JSX block separator: >{...}< 
  jsx = jsx.replace(/>\s*{/g, '>\n          {');
  jsx = jsx.replace(/}\s*</g, '}\n          <');

  // Split at tag opener
  jsx = jsx.replace(/<div /g, '\n        <div ');
  jsx = jsx.replace(/<button /g, '\n        <button ');
  jsx = jsx.replace(/<input /g, '\n        <input ');
  jsx = jsx.replace(/<select /g, '\n        <select ');
  jsx = jsx.replace(/<h3 /g, '\n          <h3 ');
  jsx = jsx.replace(/<span /g, '\n            <span ');
  jsx = jsx.replace(/<p /g, '\n          <p ');
  jsx = jsx.replace(/<option /g, '\n              <option ');

  // Split at tag close
  jsx = jsx.replace(/<\/div>/g, '\n        </div>');
  jsx = jsx.replace(/<\/button>/g, '\n        </button>');

  // Split at <> </> (fragment)
  jsx = jsx.replace('<>', '\n          <>');
  jsx = jsx.replace('</>', '\n          </>');

  // Clean up triple newlines
  jsx = jsx.replace(/\n{3,}/g, '\n\n');
  jsx = jsx.replace(/^\n+/, '');
  jsx = jsx.replace(/\n    \n/g, '\n\n');

  // Assemble
  const newCode = hooks + '\n      ' + jsx;
  c = c.substring(0, edIdx) + newCode + c.substring(compEnd + '}) }'.length);

  fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', c, 'utf8');
  console.log('Written');
}

const r = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const rl = r.split('\n');
console.log('Lines:', rl.length);
let lc = 0, ml = 0, mlIdx = 0;
rl.forEach((l, i) => {
  const len = l.length;
  if (len > 200) { lc++; if (len > ml) { ml = len; mlIdx = i+1; } }
});
console.log('Lines > 200 chars:', lc);
console.log('Longest: L' + mlIdx + ' (' + ml + ' chars)');
