const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');

// Check ALL lines for export default
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default')) {
    console.log('L' + (i+1) + ': ' + lines[i].substring(0, 100));
  }
  // Also check for the component name
  if (lines[i].includes('const NamingClient') || lines[i].includes('function NamingClient')) {
    console.log('L' + (i+1) + ': ' + lines[i].substring(0, 100));
  }
}

// Check what comes before L418
console.log('\nL415-L420 full content:');
for (let i = 414; i < 422 && i < lines.length; i++) {
  console.log('L' + (i+1) + ': ' + JSON.stringify(lines[i]));
}

// Check L200-L220 for HOUR_OPTS or generateNames
console.log('\nL200-L210:');
for (let i = 199; i < 211 && i < lines.length; i++) {
  console.log('L' + (i+1) + ': ' + lines[i].substring(0, 100));
}
