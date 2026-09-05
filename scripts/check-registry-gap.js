// 差集：registry 已录入但 book-ids 未启用（内容浪费的书）
const fs = require('fs');
const reg = fs.readFileSync('src/data/xueguan/content/content-registry.ts', 'utf8');
const mapStart = reg.indexOf('const bookContentMap');
const mapBody = reg.slice(mapStart, reg.indexOf('}', mapStart) + 1);
const regIds = [...mapBody.matchAll(/'([a-z0-9-]+)':/g)].map(m => m[1]);
const ids = fs.readFileSync('src/data/xueguan/book-ids.ts', 'utf8');
const bookIds = [...ids.matchAll(/id: "([a-z0-9-]+)"/g)].map(m => m[1]);
const diff = regIds.filter(x => !bookIds.includes(x));
console.log('registry 书:', regIds.length, '| book-ids:', bookIds.length);
console.log('已录入未启用(差集):', diff.length);
diff.forEach(d => console.log(' ', d));
