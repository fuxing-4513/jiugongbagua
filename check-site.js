const https = require('https');
const paths = ['/','/bazi/','/hehun/','/xingming/','/liuyao/','/huangli/','/lingqian/'];
let ok = 0, bad = 0;

function check(i) {
  if (i >= paths.length) {
    console.log(`\n${ok} OK, ${bad} BAD`);
    process.exit(bad > 0 ? 1 : 0);
  }
  const p = paths[i];
  const req = https.get('https://jiugongbagua.com' + p, { timeout: 15000 }, res => {
    if (res.statusCode === 200) {
      console.log(`✅ ${p} 200`);
      ok++;
    } else {
      console.log(`❌ ${p} ${res.statusCode}`);
      bad++;
    }
    res.resume();
    check(i + 1);
  });
  req.on('error', e => {
    console.log(`❌ ${p} ERROR: ${e.message}`);
    bad++;
    check(i + 1);
  });
}

console.log('Checking jiugongbagua.com...\n');
check(0);
