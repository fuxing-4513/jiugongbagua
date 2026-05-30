const fs = require('fs');
const content = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

// Find if HOUR_OPTS is defined differently
const hourIndicators = ['HOUR_OPTS', 'hourOpts', '子时', '丑时', '寅时', 'const hour'];
for (const h of hourIndicators) {
  const idx = content.indexOf(h);
  if (idx >= 0) console.log(h + ' at: ' + idx);
  else console.log(h + ': NOT FOUND');
}
// Also check for getHourDz
const ghd = content.indexOf('function getHourDz');
console.log('function getHourDz at:', ghd);

// Check around 24500
console.log('\nAround 24500:');
console.log(content.substring(24200, 24800));
