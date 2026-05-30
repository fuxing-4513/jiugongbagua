const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

// Find CHAR_POOL and where it transitions to HOUR_OPTS
const cpBegin = c.indexOf('const CHAR_POOL:');

// Find where HOUR_OPTS begins (after CHAR_POOL's last array)
const hoMarker = '// ── 时辰选项 ──';
const hoPos = c.indexOf(hoMarker, cpBegin);
console.log('HOUR_OPTS marker from CHAR_POOL:', hoPos);

// Show context
console.log('\nChars before HOUR_OPTS marker:');
console.log(c.substring(hoPos - 50, hoPos + 100));

// Find the last ] closing of CHAR_POOL before HOUR_OPTS
const beforeHo = c.substring(cpBegin, hoPos);
const lastCloseBracket = beforeHo.lastIndexOf(']');  
console.log('\nLast ] before HOUR_OPTS at offset from cpBegin:', lastCloseBracket);
const afterClose = c.substring(cpBegin + lastCloseBracket, hoPos + 50);
console.log('After last ]:', afterClose);

// So we need to:
// 1. After last ] of CHAR_POOL, insert a newline + closing brace + newline
// 2. Before HOUR_OPTS, insert 'const HOUR_OPTS: '
// 3. Split long lines properly
