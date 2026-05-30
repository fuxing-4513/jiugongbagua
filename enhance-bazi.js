const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');

// ═══ 1. 新增 state: bzYear（出生年份）和 dayun字段的state改动 ═══
// 在 state 声明末尾加入 bzYear
// 找到最后一个 state 声明（const [bzDz, setBzDz]）后面插入 bzYear
c = c.replace(
  "const [bzDz, setBzDz] = useState(['子','寅','午','子'])",
  "const [bzDz, setBzDz] = useState(['子','寅','午','子'])\n  const [bzYear, setBzYear] = useState(String(new Date().getFullYear()))"
);

// ═══ 2. 修改直接排盘 UI：在完整八字下方加出生年份输入 ═══
c = c.replace(
  '<div className="flex items-center gap-2 mt-2">\n          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(\' \')}</span>\n        </div>',
  '<div className="flex items-center gap-2 mt-2">\n          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(\' \')}</span>\n        </div>\n        <div className="mt-3 pt-3 border-t border-dark-600">\n          <label className="block text-xs text-gray-500 mb-1">出生年份（用于推算大运流年）</label>\n          <input type="number" value={bzYear} onChange={e=>setBzYear(e.target.value)} className="w-full sm:w-32 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" placeholder="如 1990" />\n        </div>'
);

// ═══ 3. 重写 doCalc 的 bazi 分支 ═══
// 找到整个 if (mode === 'bazi') 块并替换
const baziBranchStart = "if (mode === 'bazi') {";
const baziBranchEnd = "      return\n    }";

// 找到这个块的精确范围
let startIdx = c.indexOf(baziBranchStart);
if (startIdx === -1) {
  console.log('ERROR: Could not find bazi branch start');
  process.exit(1);
}

// 找到块结束位置（匹配花括号）
let depth = 0;
let braceStart = c.indexOf('{', startIdx);
let i = braceStart;
while (i < c.length && depth >= 0) {
  if (c[i] === '{') depth++;
  if (c[i] === '}') depth--;
  if (depth === 0) break;
  i++;
}
// 还要找到 return 后面的闭合
// 从 startIdx 找 "return\n    }" 
const retEnd = c.indexOf('\n    }', c.indexOf('return', startIdx));

const newBaziBranch = `if (mode === 'bazi') {
      try {
        const tg = bzTg as string[], dz = bzDz as string[], dg = tg[2]
        const birthYear = parseInt(bzYear)
        if (isNaN(birthYear) || birthYear < 1900 || birthYear > 2100) {
          setError('请输入有效出生年份（1900-2100）')
          return
        }
        
        function mk(gz: string, gan: string, zhi: string): any {
          const hdStems = (hA[zhi] || '').split('')
          const hdSS = hdStems.map(hs => ({ gan: hs, ss: ssM[dg]?.[hs] || '' }))
          return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||''}
        }
        const pills = [mk(tg[0]+dz[0], tg[0], dz[0]), mk(tg[1]+dz[1], tg[1], dz[1]), mk(tg[2]+dz[2], tg[2], dz[2]), mk(tg[3]+dz[3], tg[3], dz[3])]
        const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
        for (const p of pills) {
          if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
          for (const c of (hA[p.zhi] || '')) { if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++ }
        }
        const str = strength(wx, dg)
        const shenSha = calcShenSha(dg, dz[0], dz[1], dz[2])
        const zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][((birthYear - 4) % 12 + 12) % 12]
        const lunar = { getYear: () => birthYear, getMonth: () => 1, getDay: () => 1, getYearShengXiao: () => zodiac, toFullString: () => '', getYearInChinese: () => '', getMonthInChinese: () => '', getDayInChinese: () => '' }
        const analysis = comprehensiveAnalysis(dg, dz[2], wx, pills, zodiac, lunar as any, dz[1], shenSha, gender)

        // ═══ 手动排大运 ═══
        // 规则：年干阳男顺阴男逆，年干阳女逆阴女顺
        // 年柱索引：tg[0], dz[0]
        const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tg[0])
        const dzIdx = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(dz[0])
        const isYang = tgIdx % 2 === 0  // 天干奇偶：甲丙戊庚壬为阳
        const isMale = gender === '男'
        const forward = (isYang && isMale) || (!isYang && !isMale)  // 顺排
        
        // 起运岁数（默认 3 岁作为估算，直接排盘用户可调）
        const startAge = 3
        
        // 排 8 步大运
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
        const dayunArr: any[] = []
        let curTgIdx = tgIdx // 年干
        let curDzIdx = dzIdx // 年支
        // 大运从月干支开始：找月干
        const monthGz = tg[1]+dz[1]; // 用户给的月柱
        let mTgIdx = stems.indexOf(tg[1])
        let mDzIdx = branches.indexOf(dz[1])
        
        for (let step = 0; step < 8; step++) {
          if (forward) {
            mTgIdx = (mTgIdx + 1) % 10
            mDzIdx = (mDzIdx + 1) % 12
          } else {
            mTgIdx = (mTgIdx + 9) % 10
            mDzIdx = (mDzIdx + 11) % 12
          }
          const dyGz = stems[mTgIdx] + branches[mDzIdx]
          const startYear = birthYear + startAge + step * 10
          const age = startAge + step * 10
          const years = []
          for (let y = 0; y < 10; y++) {
            const yy = startYear + y
            years.push({
              year: yy,
              gz: stems[(yy - 4) % 10 >= 0 ? (yy - 4) % 10 : (yy - 4) % 10 + 10] + branches[(yy - 4) % 12 >= 0 ? (yy - 4) % 12 : (yy - 4) % 12 + 12],
              age: age + y
            })
          }
          dayunArr.push({ gz: dyGz, age, startYear, years })
        }

        setResult({
          dateStr: '直接排盘 · ' + birthYear + '年 ' + tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时 · '+gender+'命',
          bazi: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时',
          solarStr: '', lunarStr: '直接输入八字排盘 · ' + birthYear + '年（估算大运）',
          pills, wx, dg, str, zodiac, shenSha,
          mingGong: '—', shenGong: '—', taiYuan: '—', xunKong: '—',
          yearDiShi: '', monthDiShi: '', dayDiShi: '', timeDiShi: '',
          dayun: dayunArr, analysis,
        })
      } catch(e){ setError('排盘出错，请检查天干地支和出生年份') }
      return
    }`;

// 替换整个 if (mode === 'bazi') 块
const oldBlock = c.substring(startIdx, i + 1);
// 更精确地定位到 return 后的闭合
c = c.substring(0, startIdx) + newBaziBranch + c.substring(c.indexOf('\n    }\n    \n    const y', startIdx));

fs.writeFileSync(f, c, 'utf8');
console.log('Done - bazi mode enhanced with birth year and dayun');
