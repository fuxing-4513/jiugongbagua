/**
 * 九宫网站部署后自动修复脚本
 * 
 * 每次 gh-pages 部署后调用，确保：
 * 1. gh-pages 分支存在
 * 2. Pages 已启用
 * 3. cname = jiugongbagua.com
 * 4. HTTPS 已签发
 * 
 * 用法: node fix-pages-v2.js
 */
const https = require('https');
const { execSync } = require('child_process');

// 从 git remote origin URL 中提取 token
const token = execSync('git remote get-url origin 2>&1', {
  cwd: __dirname,
  encoding: 'utf8'
}).trim().match(/https:\/\/[^:]+:([^@]+)@github/)[1];

const REPO = 'fuxing-4513/jiugongbagua';
const DOMAIN = 'jiugongbagua.com';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: '/' + path,
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'node',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  console.log('🔍 Checking Pages for ' + REPO + '...\n');

  // 1. Check branch exists
  let r = await api('GET', 'repos/' + REPO + '/branches/gh-pages');
  if (r.status !== 200) {
    console.log('❌ gh-pages branch missing! Push it first.');
    process.exit(1);
  }
  console.log('✅ gh-pages branch exists');

  // 2. Check Pages status
  r = await api('GET', 'repos/' + REPO + '/pages');
  console.log('📄 Pages status:', r.status);

  let pagesEnabled = r.status === 200;
  let pagesInfo = {};

  if (pagesEnabled) {
    pagesInfo = JSON.parse(r.body);
    console.log('   cname:', pagesInfo.cname || '(none)');
    console.log('   status:', pagesInfo.status);
    console.log('   https:', pagesInfo.https_certificate?.state || 'N/A');
  }

  // 3. Create Pages if missing
  if (!pagesEnabled) {
    console.log('🔄 Creating Pages...');
    r = await api('POST', 'repos/' + REPO + '/pages', {
      source: { branch: 'gh-pages', path: '/' }
    });
    console.log('   →', r.status, r.body.substring(0, 100));
    pagesInfo = JSON.parse(r.body);
  }

  // 4. Set cname if missing or wrong
  if (!pagesInfo.cname || pagesInfo.cname !== DOMAIN) {
    console.log('🔄 Setting cname → ' + DOMAIN + '...');
    r = await api('PUT', 'repos/' + REPO + '/pages', { cname: DOMAIN });
    console.log('   →', r.status);
  } else {
    console.log('✅ cname = ' + DOMAIN);
  }

  // 5. Verify final state
  r = await api('GET', 'repos/' + REPO + '/pages');
  const final = JSON.parse(r.body);
  console.log('\n📋 Final Pages state:');
  console.log('   url:', final.html_url);
  console.log('   cname:', final.cname);
  console.log('   status:', final.status);
  console.log('   https_cert:', final.https_certificate?.state || 'N/A');
  console.log('   https_expires:', final.https_certificate?.expires_at || 'N/A');

  // 6. Test site
  console.log('\n🌐 Testing jiugongbagua.com...');
  const paths = ['/','/bazi/','/hehun/','/xingming/','/liuyao/','/huangli/','/lingqian/'];
  let testIdx = 0;
  function testNext() {
    if (testIdx >= paths.length) {
      console.log('\n✅ All paths tested');
      process.exit(0);
    }
    const p = paths[testIdx];
    https.get('https://' + DOMAIN + p, { timeout: 10000 }, res => {
      const ok = res.statusCode === 200;
      console.log('   ' + (ok ? '✅' : '❌') + ' ' + p + ' → ' + res.statusCode);
      res.resume();
      testIdx++;
      testNext();
    }).on('error', e => {
      console.log('   ❌ ' + p + ' → ' + e.message);
      testIdx++;
      testNext();
    });
  }
  testNext();
}

main().catch(e => { console.error(e); process.exit(1); });
