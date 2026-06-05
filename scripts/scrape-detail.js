/**
 * 高并发详情页爬虫 - 从 kangxizidian.com.cn 抓取单字详情
 * 
 * 用法: node scripts/scrape-detail.js [--element=jin] [--concurrency=15] [--onlyJi]
 */

const fs = require('fs');
const path = require('path');

const BASE = 'https://www.kangxizidian.com.cn';
const ELEMENTS = ['jin', 'mu', 'shui', 'huo', 'tu'];
const EL_NAMES = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' };
const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'data');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function elListFile(el) { return path.join(DATA_DIR, `wuxing-${el}.json`); }
function elDetailFile(el) { return path.join(DATA_DIR, `wuxing-detail-${el}.json`); }
function elPublicFile(el) { return path.join(PUBLIC_DIR, `wuxing-detail-${el}.json`); }

// ── 并发请求 ──
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'zh-CN,zh;q=0.9' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries) return null;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  return null;
}

// ── 异步并发池 ──
async function asyncPool(concurrency, items, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// ── 解析详情页 ──
function parseDetail(html, zi) {
  if (!html) return null;
  const d = { zi };

  const get = (re, def = '') => { const m = html.match(re); return m ? m[1] : def; };

  d.pinyin = get(/拼音\s*([a-z]+[0-9]?)/i);
  d.zhuyin = get(/注音\s*([ㄅ-ㄯ]+)/);
  d.wubi = get(/五笔\s*([a-z]+)/i);
  d.cangjie = get(/仓颉\s*([a-z]+)/i);
  d.zhengma = get(/郑码\s*([a-z]+)/i);
  d.sijiao = get(/四角\s*(\d+)/);
  d.bihua = parseInt(get(/笔画\s*(\d+)画/)) || 0;
  d.kangxiBihua = parseInt(get(/康熙笔画\s*(\d+)画/)) || 0;
  d.bushou = get(/部首\s*([^\s<]+)/);
  d.bishun = get(/笔顺\s*(\d+)/);
  d.zixing = get(/字形分析\s*([^\s<]+)/);
  d.tongyi = get(/统一码\s*([^\s<]+)/);
  d.wuxingShuxing = get(/五行属性[：:]\s*(\S+)/);
  d.jixiong = get(/吉凶寓意[：:]\s*(\S+)/);
  d.changyong = html.includes('常用字');
  d.xiantong = html.includes('现通表');
  d.biaozhun = html.includes('标准字体');
  d.yuyi = get(/寓意解释[：:]\s*([^<\n]+)/).trim();
  d.qimingJieshi = get(/起名解释[：:]\s*([^<\n]+)/).trim();
  d.tuijiandu = get(/推荐度\s*(\d+%)/);
  d.wenhuaYinxiang = get(/文化印象\s*(\d+%)/);
  d.zixingNum = parseInt(get(/字性\s*(\d+)/)) || 0;
  d.zixingGender = get(/字性\s*\d+\s*\n\s*(\d+偏男[\s\S]*?\d+偏女)/).trim();
  
  // 基本解释
  const jbMatch = html.match(/基本解释[\s\S]*?<li>([\s\S]*?)<\/li>/);
  if (jbMatch) d.jibenJieshi = jbMatch[1].replace(/<[^>]+>/g, '').trim();

  return d;
}

// ── 主函数 ──
async function scrapeDetailEl(el, concurrency, onlyJi) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📖 详情抓取: 属${EL_NAMES[el]}`);
  console.log(`${'='.repeat(50)}`);

  const listFile = elListFile(el);
  if (!fs.existsSync(listFile)) { console.error('❌ 列表数据不存在'); return; }

  const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  let chars = list.chars;
  if (onlyJi) chars = chars.filter(c => c.isJi);

  // 加载已有详情
  const detailFile = elDetailFile(el);
  let details = {};
  if (fs.existsSync(detailFile)) {
    try { details = JSON.parse(fs.readFileSync(detailFile, 'utf8')); } catch {}
  }

  // 筛选未抓取的
  const todo = chars.filter(c => !details[c.zi]);
  if (todo.length === 0) {
    console.log(`  ✅ 已全部抓取 (${Object.keys(details).length} 条)`);
    savePublic(el, details);
    return;
  }

  console.log(`  总字数: ${chars.length}, 已抓: ${Object.keys(details).length}, 待抓: ${todo.length}`);
  console.log(`  并发: ${concurrency}, 预估耗时: ~${Math.ceil(todo.length / concurrency * 0.5 / 60)} 分钟`);

  let done = 0;
  let errors = 0;
  const startTime = Date.now();

  // 每100个保存一次
  const saveCheckpoint = () => {
    fs.writeFileSync(detailFile, JSON.stringify(details, null, 2), 'utf8');
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`  💾 [${done + Object.keys(details).length - todo.length}/${chars.length}] ${elapsed}min | 已保存`);
  };

  await asyncPool(concurrency, todo, async (c) => {
    const url = `${BASE}/hanzi/${encodeURIComponent(c.zi)}.html`;
    const html = await fetchWithRetry(url);
    
    if (html) {
      details[c.zi] = parseDetail(html, c.zi);
      if (!details[c.zi]) {
        details[c.zi] = { zi: c.zi, error: 'parse_failed' };
        errors++;
      }
    } else {
      details[c.zi] = { zi: c.zi, error: 'fetch_failed' };
      errors++;
    }

    done++;
    if (done % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      const rate = Math.round(done / ((Date.now() - startTime) / 1000));
      process.stdout.write(`\r  [${done}/${todo.length}] ${elapsed}min | ${rate}字/秒 | 错误:${errors}`);

      // 每10个并发批次后的小延迟，避免触发限流
      if (done % 200 === 0) {
        saveCheckpoint();
        await new Promise(r => setTimeout(r, 500));
      }
    }
  });

  // 最终保存
  fs.writeFileSync(detailFile, JSON.stringify(details, null, 2), 'utf8');

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n  ✅ 完成! 总耗时: ${totalTime}分钟 | 成功: ${done - errors} | 失败: ${errors}`);

  // 同步到 public
  savePublic(el, details);
}

// ── 保存到 public ──
function savePublic(el, details) {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  // 压缩格式：扁平化存储
  const chars = Object.values(details);
  const out = {
    el, name: EL_NAMES[el],
    generated: new Date().toISOString(),
    total: chars.length,
    chars,
  };
  fs.writeFileSync(elPublicFile(el), JSON.stringify(out), 'utf8');
  const size = fs.statSync(elPublicFile(el)).size;
  console.log(`  📦 public/data/wuxing-detail-${el}.json: ${(size / 1024).toFixed(0)}KB`);
}

// ── 入口 ──
async function main() {
  const args = process.argv.slice(2);
  const elArg = args.find(a => a.startsWith('--element='));
  const conArg = args.find(a => a.startsWith('--concurrency='));
  const onlyJi = args.includes('--onlyJi');

  const filterEl = elArg ? elArg.split('=')[1] : null;
  const concurrency = conArg ? parseInt(conArg.split('=')[1]) : 15;
  const els = filterEl ? [filterEl] : ELEMENTS;

  console.log(`🚀 详情爬虫 | 并发:${concurrency} | 元素:${filterEl || '全部'} | 仅吉字:${onlyJi}`);
  console.log(`${'='.repeat(50)}`);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  for (const el of els) {
    await scrapeDetailEl(el, concurrency, onlyJi);
  }

  console.log('\n✨ 全部完成!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
