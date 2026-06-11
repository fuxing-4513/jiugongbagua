/**
 * 姓名打分 API v2
 * 精确匹配九宫八卦前端（jiugongbagua.com）五格数理算法
 *
 * 数据源：kangxi.json（46961字）+ 简化字表（前端代码中的字典c）
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// ========== 1. 加载数据 ==========

let kangxiMap = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, 'kangxi.json'), 'utf-8');
  const data = JSON.parse(raw);
  for (const [ch, st] of data.c) kangxiMap[ch] = st;
  console.log(`[xingming] kangxi.json: ${Object.keys(kangxiMap).length} 字`);
} catch (e) {
  console.error('[xingming] kangxi.json 加载失败:', e.message);
}

// ========== 2. 简化字/常用字笔画表 ==========
const SIMPLIFIED_MAP = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'simplified.json'), 'utf-8'
));

// ========== 3. 笔画查询（精确匹配前端 n(e) 函数）==========
function getStroke(char) {
  if (kangxiMap[char] !== undefined) return kangxiMap[char];
  if (SIMPLIFIED_MAP[char] !== undefined) return SIMPLIFIED_MAP[char];
  return (char.charCodeAt(0) - 19968) % 20 + 1;
}

function getCharWuxing(stroke) {
  // 笔画数 % 10：1-2木 3-4火 5-6土 7-8金 9-0水
  const r = stroke % 10;
  if (r <= 2) return '木';
  if (r <= 4) return '火';
  if (r <= 6) return '土';
  if (r <= 8) return '金';
  return '水';
}

// ========== 5. 三才配置吉凶表 ==========
const SANCAI_TABLE = {
  '金': { '金': { '金': '吉', '木': '凶', '水': '吉', '火': '凶', '土': '吉' },
          '木': { '金': '凶', '木': '大吉', '水': '凶', '火': '吉', '土': '凶' },
          '水': { '金': '吉', '木': '凶', '水': '大吉', '火': '凶', '土': '吉' },
          '火': { '金': '凶', '木': '吉', '水': '凶', '火': '大吉', '土': '凶' },
          '土': { '金': '小吉', '木': '凶', '水': '凶', '火': '吉', '土': '大吉' } },
  '木': { '金': { '金': '吉', '木': '凶', '水': '吉', '火': '凶', '土': '吉' },
          '木': { '金': '凶', '木': '大吉', '水': '凶', '火': '吉', '土': '凶' },
          '水': { '金': '吉', '木': '凶', '水': '大吉', '火': '凶', '土': '吉' },
          '火': { '金': '凶', '木': '吉', '水': '凶', '火': '大吉', '土': '凶' },
          '土': { '金': '小吉', '木': '凶', '水': '凶', '火': '吉', '土': '大吉' } },
  '水': { '金': { '金': '吉', '木': '凶', '水': '吉', '火': '凶', '土': '吉' },
          '木': { '金': '凶', '木': '大吉', '水': '凶', '火': '吉', '土': '凶' },
          '水': { '金': '吉', '木': '凶', '水': '大吉', '火': '凶', '土': '吉' },
          '火': { '金': '凶', '木': '吉', '水': '凶', '火': '大吉', '土': '凶' },
          '土': { '金': '小吉', '木': '凶', '水': '凶', '火': '吉', '土': '大吉' } },
  '火': { '金': { '金': '吉', '木': '凶', '水': '吉', '火': '凶', '土': '吉' },
          '木': { '金': '凶', '木': '大吉', '水': '凶', '火': '吉', '土': '凶' },
          '水': { '金': '吉', '木': '凶', '水': '大吉', '火': '凶', '土': '吉' },
          '火': { '金': '凶', '木': '吉', '水': '凶', '火': '大吉', '土': '凶' },
          '土': { '金': '小吉', '木': '凶', '水': '凶', '火': '吉', '土': '大吉' } },
  '土': { '金': { '金': '吉', '木': '凶', '水': '吉', '火': '凶', '土': '吉' },
          '木': { '金': '凶', '木': '大吉', '水': '凶', '火': '吉', '土': '凶' },
          '水': { '金': '吉', '木': '凶', '水': '大吉', '火': '凶', '土': '吉' },
          '火': { '金': '凶', '木': '吉', '水': '凶', '火': '大吉', '土': '凶' },
          '土': { '金': '小吉', '木': '凶', '水': '凶', '火': '吉', '土': '大吉' } }
};

// ========== 6. 核心分析 ==========
function analyzeName(surname, givenName) {
  const chars = [...(surname + givenName)];
  const surChars = [...surname];
  const givenChars = [...givenName];
  const sStrokes = surChars.map(c => getStroke(c));
  const gStrokes = givenChars.map(c => getStroke(c));

  // 天格
  const tianGe = sStrokes.reduce((a, b) => a + b, 0) + (surChars.length === 1 ? 1 : 0);
  // 人格
  const renGe = (sStrokes[sStrokes.length - 1] || 0) + (gStrokes[0] || 0);
  // 地格
  const diGe = gStrokes.reduce((a, b) => a + b, 0) + (givenChars.length <= 1 ? 1 : 0);
  // 总格
  const zongGe = chars.reduce((s, c) => s + getStroke(c), 0);
  // 外格
  const waiGe = zongGe - renGe + (surChars.length === 1 ? 1 : surChars.length);

  return {
    surname, givenName,
    fullName: surname + givenName,
    chars: chars.map(c => ({ char: c, stroke: getStroke(c), wuxing: getCharWuxing(getStroke(c)) })),
    wuge: [
      { key: '天格', val: tianGe, wuxing: getCharWuxing(tianGe) },
      { key: '人格', val: renGe, wuxing: getCharWuxing(renGe) },
      { key: '地格', val: diGe, wuxing: getCharWuxing(diGe) },
      { key: '外格', val: waiGe, wuxing: getCharWuxing(waiGe) },
      { key: '总格', val: zongGe, wuxing: getCharWuxing(zongGe) }
    ],
    sancai: `${getCharWuxing(tianGe)}→${getCharWuxing(renGe)}→${getCharWuxing(diGe)}`,
    sanCaiScore: SANCAI_TABLE[getCharWuxing(tianGe)]?.[getCharWuxing(renGe)]?.[getCharWuxing(diGe)] || '中'
  };
}

// ========== 7. API 服务器 ==========
const app = express();
app.use(cors());

app.get('/api/xingming', (req, res) => {
  const { lastname, firstname } = req.query;
  if (!lastname || !firstname) {
    return res.json({ success: false, error: '请提供姓氏(lastname)和名字(firstname)' });
  }
  res.json({ success: true, data: analyzeName(lastname, firstname) });
});

app.get('/api/xingming/health', (req, res) => {
  res.json({ status: 'ok', chars: Object.keys(kangxiMap).length });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`📛 姓名打分 API v2 运行在 http://localhost:${PORT}/api/xingming`);
  console.log(`   示例: curl 'http://localhost:${PORT}/api/xingming?lastname=李&firstname=嘉欣'`);
});

module.exports = { analyzeName, getStroke };
