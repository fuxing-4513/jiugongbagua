const http = require('https');
const qs = 'year=1990&month=10&day=14&hour=6&sex=男&action=test';
const req = http.request({
  hostname: 'www.buyiju.com', path: '/bazi/', method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(qs) }
}, (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    const text = buf.toString('utf8');
    // Find the result section
    const start = text.indexOf('公历');
    const end = text.indexOf('八', start + 2000);
    console.log(text.slice(start || 0, (end > 0 ? end : start + 3000)));
  });
});
req.write(qs);
req.end();
