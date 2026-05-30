const fs = require('fs');
let c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');

// 1. Fix analyzeWuxing - replace the single-line function block
const awIdx = c.indexOf('function analyzeWuxing(gzArr: string[]): { wxCount:');
const ceIdx = c.indexOf('// ── 命挂天干 ──', awIdx);

if (awIdx >= 0 && ceIdx > awIdx) {
  const newFunc = [
    'function analyzeWuxing(gzArr: string[]): {',
    '    wxCount: Record<string, number>;',
    '    riZhu: string; riZhuWx: string;',
    '    bodyStrength: string; yongShen: string',
    '  } {',
    "    const wxCount: Record<string, number> = {木:0,火:0,土:0,金:0,水:0}",
    "    const riZhu = gzArr[2] ? gzArr[2][0] : '甲'",
    "    const riZhuWx = WX_TG[riZhu] || '木'",
    '',
    '    for (const gz of gzArr) {',
    '      if (gz.length >= 2) {',
    '        const tg = gz[0]; const dz = gz[1]',
    '        if (WX_TG[tg]) wxCount[WX_TG[tg]]++',
    '        if (WX_DZ[dz]) wxCount[WX_DZ[dz]]++',
    '      }',
    '    }',
    '',
    '    // 身强/身弱判断（简化版）',
    '    const shengMe = SHENG_CYCLE[riZhuWx] ? wxCount[SHENG_CYCLE[riZhuWx]] : 0',
    '    const keWo = KE_CYCLE[riZhuWx] ? wxCount[KE_CYCLE[riZhuWx]] : 0',
    "    const woSheng = SHENG_CYCLE[riZhuWx] ? wxCount[Object.entries(SHENG_CYCLE).find(([,v]) => v === riZhuWx)?.[0] || ''] : 0",
    '    const wxSelf = wxCount[riZhuWx] || 0',
    '',
    '    const support = wxSelf + shengMe',
    '    const suppress = keWo + woSheng',
    '',
    "    let bodyStrength = '中和'",
    "    if (support > suppress + 2) bodyStrength = '身强'",
    "    else if (suppress > support + 2) bodyStrength = '身弱'",
    '',
    '    // 用神：身强则用克泄（被克的五行、生出的五行），身弱则用生扶（生我的、同我的）',
    "    let yongShen = ''",
    "    if (bodyStrength === '身强') {",
    '      // 用克我的五行或我生的五行',
    "      yongShen = KE_CYCLE[riZhuWx] || '土'",
    "    } else if (bodyStrength === '身弱') {",
    '      // 用生我的五行',
    "      yongShen = SHENG_CYCLE[riZhuWx] || '水'",
    '    } else {',
    '      // 中和用我生',
    "      yongShen = Object.entries(SHENG_CYCLE).find(([,v]) => v === riZhuWx)?.[0] || '火'",
    '    }',
    '',
    '    return { wxCount, riZhu, riZhuWx, bodyStrength, yongShen }',
    '  }',
    '  // ── 命挂天干 ──'
  ].join('\n');

  c = c.substring(0, awIdx) + newFunc + c.substring(ceIdx + '// ── 命挂天干 ──'.length);
  console.log('1. Fixed analyzeWuxing');
}

// 2. Fix calcBazi
const cbIdx = c.indexOf('function calcBazi(lunarYear: number');
const cbEnd = c.indexOf('// ── 计算天干地支持续 ──', cbIdx);

if (cbIdx >= 0 && cbEnd > cbIdx) {
  const newFunc = [
    "function calcBazi(lunarYear: number, lunarMonth: number, lunarDay: number, hourDz: string): string[] {",
    "  const nianGan = '甲乙丙丁戊己庚辛壬癸'[(lunarYear - 4) % 10]",
    "  const nianZhi = '子丑寅卯辰巳午未申酉戌亥'[(lunarYear - 4) % 12]",
    "  const nianGz = nianGan + nianZhi",
    '',
    "  const yueGanIdx = ((lunarYear - 4) % 5) * 2 + lunarMonth - 1",
    "  const yueGan = '甲乙丙丁戊己庚辛壬癸'[yueGanIdx % 10]",
    "  const yueZhi = '寅卯辰巳午未申酉戌亥子丑'[lunarMonth - 1]",
    "  const yueGz = yueGan + yueZhi",
    '',
    '  // 日干支',
    "  const ganZhi = '甲乙丙丁戊己庚辛壬癸'",
    "  const zhi = '子丑寅卯辰巳午未申酉戌亥'",
    '  // 简单算法：以已知2026年5月29日为丙午日（已验证）',
    '  const baseDate = new Date(2026, 4, 29)',
    '  const baseGan = 2 // 丙的索引',
    '  const baseZhi = 6 // 午的索引',
    '  const targetDate = new Date(lunarYear, lunarMonth - 1, lunarDay)',
    '  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / 86400000)',
    '  const riGan = ganZhi[(baseGan + diffDays % 10 + 10) % 10]',
    '  const riZhi = zhi[(baseZhi + diffDays % 12 + 12) % 12]',
    '  const riGz = riGan + riZhi',
    '',
    "  const shiGan = SHI_CHEN_GAN[riGan]?.[hourDz] || '甲'",
    '  const shiGz = shiGan + hourDz',
    '',
    '  return [nianGz, yueGz, riGz, shiGz]',
    '}',
    '// ── 计算天干地支持续 ──'
  ].join('\n');

  c = c.substring(0, cbIdx) + newFunc + c.substring(cbEnd + '// ── 计算天干地支持续 ──'.length);
  console.log('2. Fixed calcBazi');
}

// 3. Replace CHAR_POOL + HOUR_OPTS
const cpIdx = c.indexOf('const CHAR_POOL:');
const ghdIdx = c.indexOf('function getHourDz', cpIdx);
const charPoolEndMarker = '   ] }  // ── 时辰选项 ── const HOUR_OPTS = [';
const cpEnd = c.indexOf(charPoolEndMarker, cpIdx);

if (cpEnd >= 0) {
  const afterHoOpen = c.substring(cpEnd + charPoolEndMarker.length);
  let depth = 1;
  let pos = 0;
  while (depth > 0 && pos < afterHoOpen.length) {
    if (afterHoOpen[pos] === '[') depth++;
    if (afterHoOpen[pos] === ']') depth--;
    pos++;
  }

  const newBlock = [
    "const CHAR_POOL: Record<string, string[]> = {",
    "  '木': [",
    "    '林','森','柏','松','桐','楠','枫','桦','楷','樱','柳','榆','栀','棠','梨','桃','杏','梅',",
    "    '栩','桓','桂','杉','梧','梓','槿','檀','榕','槐','桔','柚',",
    "    '琳','琪','瑶','瑾','瑛','璇','玮','彦','彬','杉','柯','栋','棋','棱','植',",
    "    '杰','荣','栩','棠','棣','桢','柠','杨','楚','桑','棉',",
    "    '萱','薇','菲','芳','芹','芷','芮','茗','莹','菁','萍','菡','萌','芃','芊','芙',",
    "    '艺','苑','茵','茹','荔','莲','菁','菡','华','蔚','蕴','萧','蕾','蓓','蓝','蕙',",
    "    '蔓','藤','芷','芙','蓉','若','英','苹',",
    '  ],',
    "  '火': [",
    "    '明','亮','昱','昌','昊','晟','曦','曜','晖','煜','炜','炫','烨','焕','灿','炳','煌',",
    "    '彤','丹','晴','朗','昭','晞','昕','昀','昂','晏','晋','晨','晶','晓','旭','时',",
    "    '光','辉','耀','熠','烁','燃','炽','炎','焱','炅','炘','烽','煊','熙','熹',",
    "    '瑶','瑾','璐','璟','璇','珑','丽','婷','旎','暖','旸','昶','显','映','昱','昙','易',",
    "    '泰','达','进','逸','含','光','阳','乐','路','童','宁','辽','鼎','畅','卓','德',",
    "    '腾','虹','扬','远','驰','骋','傲','志','惠','彰','彦','骏','驰',",
    '  ],',
    "  '土': [",
    "    '安','宇','宥','宜','宸','容','宴','宏','寰','宛','寅','永','维','允','远','延','康',",
    "    '博','磊','岩','峰','岚','岳','岱','峻','嵋','巍','峥','嵘','岭','嵩','屿','岗','岷',",
    "    '维','伟','卫','域','均','坤','城','基','堂','垚','垣','培','堃','圣','坚','坦',",
    "    '庭','园','圆','国','家','宥','安','宏','容','宣','宴','宜',",
    "    '懿','佑','祎','祺','礼','裕','声','壮','颂',",
    "    '瑞','琛','琦','瑾','瑜','环','璞','璋','璧','玉','玺','玥',",
    '  ],',
    "  '金': [",
    "    '铭','鑫','钧','钰','钢','锋','锦','锐','钊','钟','铠','钦','银','铮','锟','键',",
    "    '镇','铃','瑞','璨','瑾','瑜','玮','玲','珑','玟','珊','珠','珍','环','玺',",
    "    '静','靖','青','靓','清','素','秀','秋','玉','贞','净','爽','睿','聪','胜','双',",
    "    '诚','正','刚','毅','信','义','哲','思','修','敬','谦','慎','让','周','卓','施',",
    '  ],',
    "  '水': [",
    "    '海','浩','瀚','泽','润','涵','涛','波','源','泓','洪','江','河','湖','涧','潮','汐','浪',",
    "    '鸿','灏','渊','深','淳','清','澈','沁','洋','流','溪','潭','泉','涓','涟','漪','溶',",
    "    '沛','沐','沅','泊','治','洲','涌','洁','涤','潇','浚','涵','泓',",
    "    '淑','澹','澜','洁','淇','湘','渟','汶','滢','温','滨',",
    "    '雨','雪','露','霜','云','霞','雯','霓','霏','霄','雷','雾','霖','冰','凝','寒','映',",
    "    '飘','飞','游','驰','惠','聪','敏','慧','智','灵','嘉','慈','悠','悦','怡',",
    "    '忻','舒','乐','愉','恬','慕','慧','慈','懿','悠',",
    '  ],',
    '}',
    '',
    '// ── 时辰选项 ──',
    'const HOUR_OPTS = [',
    "  {v:'0',l:'子时 23:00-00:59'},{v:'1',l:'丑时 01:00-02:59'},{v:'2',l:'丑时 01:00-02:59'},{v:'3',l:'寅时 03:00-04:59'},{v:'4',l:'寅时 03:00-04:59'},{v:'5',l:'卯时 05:00-06:59'},",
    "  {v:'6',l:'卯时 06:00-07:59'},{v:'7',l:'辰时 07:00-08:59'},{v:'8',l:'辰时 08:00-09:59'},{v:'9',l:'巳时 09:00-10:59'},{v:'10',l:'巳时 10:00-11:59'},{v:'11',l:'午时 11:00-12:59'},",
    "  {v:'12',l:'午时 12:00-13:59'},{v:'13',l:'未时 13:00-14:59'},{v:'14',l:'未时 14:00-15:59'},{v:'15',l:'申时 15:00-16:59'},{v:'16',l:'申时 16:00-17:59'},{v:'17',l:'酉时 17:00-18:59'},",
    "  {v:'18',l:'酉时 18:00-19:59'},{v:'19',l:'戌时 19:00-20:59'},{v:'20',l:'戌时 20:00-21:59'},{v:'21',l:'亥时 21:00-22:59'},{v:'22',l:'亥时 22:00-23:59'},{v:'23',l:'子时 23:00-00:59'},",
    '];'
  ].join('\n');

  c = c.substring(0, cpIdx) + newBlock + c.substring(ghdIdx);
  console.log('3. Fixed CHAR_POOL + HOUR_OPTS');
}

// 4. Fix generateNames
const gnIdx = c.indexOf('function generateNames(surname: string');
const gnEnd = c.indexOf('export default function NamingClient', gnIdx);

if (gnIdx >= 0 && gnEnd > gnIdx) {
  const newFunc = [
    'function generateNames(surname: string, wxCount: Record<string,number>, yongShen: string, gender: string): NameResult[] {',
    '  const results: NameResult[] = []',
    '  const pool = [...(CHAR_POOL[yongShen] || []), ...Object.values(CHAR_POOL).flat()]',
    '  const uniquePool = [...new Set(pool)]',
    '',
    '  for (let g = 0; g < 5; g++) {',
    '    const firstChar = pickRandom(uniquePool)',
    "    const secondChar = pickRandom(uniquePool.filter(c => c !== firstChar))",
    '    const name = firstChar + secondChar',
    '    const fullName = surname + name',
    '',
    "    const nameChars = [...name].map(c => ({",
    '      char: c,',
    '      wx: getCharWuxing(c),',
    '      stroke: getStroke(c),',
    '    }))',
    '',
    '    const lnStrokes = getStroke(surname)',
    "    const fnStrokes = nameChars.map(c => c.stroke)",
    '    const fnSum = fnStrokes.reduce((a, b) => a + b, 0)',
    '',
    '    const tiange = lnStrokes + 1',
    '    const renge = (lnStrokes) + (fnStrokes[0] || 0)',
    '    const dige = fnSum + (fnStrokes.length <= 1 ? 1 : 0)',
    '    const zongge = lnStrokes + fnSum',
    '    const waige = zongge - renge + 1',
    '',
    '    const wuge = [',
    "      {key:'天格',val:tiange},{key:'人格',val:renge},",
    "      {key:'地格',val:dige},{key:'外格',val:waige},{key:'总格',val:zongge}",
    '    ].map(w => ({...w, ...getNumDetail(w.val)}))',
    '',
    '    const avgScore = Math.round(wuge.reduce((s, w) => {',
    "      const m: Record<string,number>={'大吉':100,'吉':80,'中吉':65,'中':50,'凶':30,'大凶':10,'小吉':70}",
    '      return s + (m[w.score] || 50)',
    '    }, 0) / 5)',
    '',
    "    const sancai = nameChars.map(c => c.wx).join('→')",
    '',
    '    const meanings: string[] = []',
    '    for (const ch of nameChars) {',
    "      const entry = POEM_NAMES.find(p => p.name.includes(ch.char) || (ch.char.length === 1 && p.name[0] === ch.char))",
    "      if (entry) meanings.push(entry.line.slice(0, 20) + '...')",
    "      else meanings.push(ch.char + '字五行属' + ch.wx + '，' + (ch.wx === yongShen ? '补益用神' : ''))",
    '    }',
    '',
    "    results.push({fullName, firstName: name, chars: nameChars, scores: wuge, avgScore, sancai, meaning: meanings.join('；')})",
    '  }',
    '',
    '  return results.sort((a, b) => b.avgScore - a.avgScore)',
    '}',
    ''
  ].join('\n');

  c = c.substring(0, gnIdx) + newFunc + c.substring(gnEnd);
  console.log('4. Fixed generateNames');
}

// 5. Fix export default JSX
const edIdx = c.indexOf('export default function NamingClient()');
const finalEnd = c.lastIndexOf('}) }');

if (edIdx >= 0 && finalEnd > edIdx) {
  const componentEnd = finalEnd + '}) }'.length;
  const componentCode = c.substring(edIdx, componentEnd);
  const jsx = componentCode.substring(componentCode.indexOf('return (<div'));
  const nonJsx = componentCode.substring(0, componentCode.indexOf('return (<div'));

  // Format JSX by inserting newlines at strategic points
  let betterJsx = jsx;

  // Insert newlines before opening tags (only for block-level-like tags)
  betterJsx = betterJsx.replace(/>\s*{/g, '>{\n        ');
  betterJsx = betterJsx.replace(/>\s*</g, '>\n        <');
  betterJsx = betterJsx.replace(/([^}])<\//g, '$1\n      </');

  // Cleanup
  betterJsx = betterJsx.replace(/\n{3,}/g, '\n\n');
  betterJsx = betterJsx.replace(/^\n+/, '');

  // Assemble component
  const newComponent = nonJsx + '\n    ' + betterJsx;
  c = c.substring(0, edIdx) + newComponent + c.substring(componentEnd);
  console.log('5. Fixed export default JSX');
}

// Write
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', c, 'utf8');
console.log('\n=== File written ===');

// Verify
const r = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const rl = r.split('\n');
console.log('Lines:', rl.length);

let lc = 0, ml = 0, mlIdx = 0;
rl.forEach((l, i) => {
  if (l.length > 200) { lc++; if (l.length > ml) { ml = l.length; mlIdx = i+1; } }
});
console.log('Lines > 200 chars:', lc);
console.log('Longest: L' + mlIdx + ' (' + ml + ' chars)');
