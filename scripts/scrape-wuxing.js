/**
 * 从 kangxizidian.com.cn 爬取全部五行字源数据
 * 
 * Phase 1: 抓取所有列表页 → data/wuxing-{element}.json (基础数据)
 * Phase 2: 抓取单字详情页 → data/wuxing-detail-{element}.json (详细信息)
 * 
 * 用法: node scripts/scrape-wuxing.js [list|detail|all] [--element=jin]
 */

const fs = require('fs');
const path = require('path');

const BASE = 'https://www.kangxizidian.com.cn';
const ELEMENTS = ['jin', 'mu', 'shui', 'huo', 'tu'];
const ELEMENT_NAMES = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' };
const DATA_DIR = path.join(__dirname, '..', 'data');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function elFile(el) { return path.join(DATA_DIR, `wuxing-${el}.json`); }
function detailFile(el) { return path.join(DATA_DIR, `wuxing-detail-${el}.json`); }
const MERGED_FILE = path.join(DATA_DIR, 'wuxing-list.json');

async function fetchHTML(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'zh-CN,zh;q=0.9' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      console.error(`  [retry ${i + 1}/3] ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}

// ── 解析列表页 ──
function parseListPage(html, element, stroke) {
  const chars = [];
  const linkRegex = /<a\s+href="\/hanzi\/([^"]+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const content = match[2].replace(/<[^>]+>/g, '').trim();
    let name = href.replace('.html', '');
    try { name = decodeURIComponent(name); } catch {}
    if (!name || name.length > 4) continue;
    if (seen.has(name)) continue;
    seen.add(name);

    const pyMatch = content.match(/^([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)/i);
    const pinyin = pyMatch ? pyMatch[1] : '';
    const isJi = content.includes('吉');

    chars.push({ zi: name, pinyin, bihua: stroke, wuxing: element, isJi });
  }
  return chars;
}

// ── Phase 1: 抓取元素列表 ──
async function scrapeListEl(el) {
  console.log(`\n📖 五行属${ELEMENT_NAMES[el]}...`);
  const allChars = [];

  const mainUrl = `${BASE}/wuxing/${el}.html`;
  const mainHtml = await fetchHTML(mainUrl);
  if (!mainHtml) { console.error(`❌ 获取失败: ${el}`); return []; }

  const rx = new RegExp(`/wuxing/${el}_(\\d+)\\.html`, 'gi');
  const strokesSet = new Set();
  let sm;
  while ((sm = rx.exec(mainHtml)) !== null) strokesSet.add(parseInt(sm[1]));
  const strokes = [...strokesSet].sort((a, b) => a - b);
  console.log(`  笔画分组: ${strokes.join(', ')}`);

  for (const stroke of strokes) {
    const url = `${BASE}/wuxing/${el}_${stroke}.html`;
    process.stdout.write(`  ${stroke}画... `);
    const html = await fetchHTML(url);
    if (!html) { console.log('❌'); continue; }
    const chars = parseListPage(html, el, stroke);
    console.log(`${chars.length}字`);
    allChars.push(...chars);
    await new Promise(r => setTimeout(r, 300));
  }

  const output = {
    generated: new Date().toISOString(),
    source: 'kangxizidian.com.cn',
    element: el,
    elementName: ELEMENT_NAMES[el],
    total: allChars.length,
    chars: allChars,
  };
  fs.writeFileSync(elFile(el), JSON.stringify(output, null, 2), 'utf8');
  console.log(`  ✅ 属${ELEMENT_NAMES[el]}: ${allChars.length} 字`);
  return allChars;
}

// ── 合并所有元素数据 ──
function mergeAll() {
  const merged = { generated: new Date().toISOString(), source: 'kangxizidian.com.cn', total: 0, byElement: {}, chars: [] };
  for (const el of ELEMENTS) {
    const f = elFile(el);
    if (fs.existsSync(f)) {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      merged.chars.push(...(d.chars || []));
      merged.byElement[el] = (d.chars || []).length;
    }
  }
  merged.total = merged.chars.length;
  fs.writeFileSync(MERGED_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

// ── Phase 2: 抓取详情 ──
async function scrapeDetailEl(el) {
  console.log(`\n📖 详情: 属${ELEMENT_NAMES[el]}`);
  const f = elFile(el);
  if (!fs.existsSync(f)) { console.error('❌ 请先运行 Phase 1'); return; }

  const listData = JSON.parse(fs.readFileSync(f, 'utf8'));
  const df = detailFile(el);
  let details = fs.existsSync(df) ? JSON.parse(fs.readFileSync(df, 'utf8')) : {};

  // 优先吉字
  const chars = listData.chars;
  const priority = chars.filter(c => c.isJi);
  const rest = chars.filter(c => !c.isJi);
  const sorted = [...priority, ...rest];

  let newCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    if (details[c.zi]) continue;

    const url = `${BASE}/hanzi/${encodeURIComponent(c.zi)}.html`;
    process.stdout.write(`\r  [${i + 1}/${sorted.length}] ${c.zi} `);
    const html = await fetchHTML(url);
    
    if (html) {
      // 提取关键字段
      details[c.zi] = {
        zi: c.zi,
        pinyin: (html.match(/拼音\s*([a-z]+)/i) || [])[1] || '',
        wubi: (html.match(/五笔\s*([a-z]+)/i) || [])[1] || '',
        bihua: parseInt((html.match(/笔画\s*(\d+)画/) || [])[1]) || c.bihua,
        kangxiBihua: parseInt((html.match(/康熙笔画\s*(\d+)画/) || [])[1]) || 0,
        bushou: (html.match(/部首\s*([^\s<]+)/) || [])[1] || '',
        bishun: (html.match(/笔顺\s*(\d+)/) || [])[1] || '',
        zixing: (html.match(/字形分析\s*([^\s<]+)/) || [])[1] || '',
        wuxingShuxing: (html.match(/五行属性[：:]\s*(\S+)/) || [])[1] || '',
        jixiong: (html.match(/吉凶寓意[：:]\s*(\S+)/) || [])[1] || '',
        changyong: html.includes('常用字'),
        yuyi: (html.match(/寓意解释[：:]\s*([^<\n]+)/) || [])[1]?.trim() || '',
        qimingJieshi: (html.match(/起名解释[：:]\s*([^<\n]+)/) || [])[1]?.trim() || '',
        tuijiandu: (html.match(/推荐度\s*(\d+%)/) || [])[1] || '',
        wenhuaYinxiang: (html.match(/文化印象\s*(\d+%)/) || [])[1] || '',
        zixingNum: parseInt((html.match(/字性\s*(\d+)/) || [])[1]) || 0,
      };
      newCount++;
    } else {
      details[c.zi] = { zi: c.zi, error: 'fetch_failed' };
      newCount++;
    }

    if (newCount % 50 === 0) {
      fs.writeFileSync(df, JSON.stringify(details, null, 2), 'utf8');
      console.log(`\n  💾 已保存 (${Object.keys(details).length})`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(df, JSON.stringify(details, null, 2), 'utf8');
  console.log(`\n  ✅ 属${ELEMENT_NAMES[el]}详情: ${Object.keys(details).length} 条`);
}

// ── 报告 ──
function report() {
  const merged = mergeAll();
  console.log('\n═══ 数据报告 ═══');
  console.log(`总计: ${merged.total} 字`);
  for (const el of ELEMENTS) {
    const n = merged.byElement[el] || 0;
    if (n > 0) {
      const chars = merged.chars.filter(c => c.wuxing === el);
      console.log(`  属${ELEMENT_NAMES[el]}: ${n} 字 (吉: ${chars.filter(c => c.isJi).length})`);
    }
  }
}

// ── 主入口 ──
async function main() {
  const args = process.argv.slice(2);
  const phase = args.find(a => !a.startsWith('--')) || 'all';
  const elArg = args.find(a => a.startsWith('--element='));
  const filterEl = elArg ? elArg.split('=')[1] : null;

  console.log(`🎯 康熙字典五行字源爬虫 | ${phase} | ${filterEl || '全部'}`);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const els = filterEl ? [filterEl] : ELEMENTS;

  if (phase === 'list' || phase === 'all') {
    for (const el of els) await scrapeListEl(el);
    mergeAll();
  }

  if (phase === 'detail' || phase === 'all') {
    for (const el of els) await scrapeDetailEl(el);
  }

  report();
  console.log('\n✨ 完成!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
