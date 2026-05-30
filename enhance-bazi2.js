const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');

// ══════════════════════════════════════════
// Step 1: Add bzYear state (after bzDz)
// ══════════════════════════════════════════
const bzDzLine = 'const [bzDz, setBzDz] = useState([\'子\',\'寅\',\'午\',\'子\'])';
if (!c.includes('const [bzYear')) {
  c = c.replace(bzDzLine, bzDzLine + '\n  const [bzYear, setBzYear] = useState(String(new Date().getFullYear()))');
  console.log('Step 1: bzYear state added');
} else {
  console.log('Step 1: bzYear already present');
}

// ══════════════════════════════════════════
// Step 2: Modify UI - add birth year input in bazi mode
// ══════════════════════════════════════════
const uiOld = '<div className="flex items-center gap-2 mt-2">\n          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(\' \')}</span>\n        </div>';
const uiNew = '<div className="flex items-center gap-2 mt-2">\n          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(\' \')}</span>\n        </div>\n        <div className="mt-3 pt-3 border-t border-dark-600">\n          <label className="block text-xs text-gray-500 mb-1">出生年份 <span className="text-gray-600">（用于推算大运流年）</span></label>\n          <input type="number" value={bzYear} onChange={e=>setBzYear(e.target.value)} className="w-full sm:w-36 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" placeholder="如 1990" min="1900" max="2100" />\n        </div>';

c = c.replace(uiOld, uiNew);
console.log('Step 2: UI updated');

// ══════════════════════════════════════════
// Step 3: Replace the entire if (mode === 'bazi') block
// ══════════════════════════════════════════
// Find exact positions
const blockStartMarker = 'if (mode === \'bazi\') {';
const blockEndMarker = 'const y = parseInt(year)';

let fileStart = c.indexOf(blockStartMarker);
let fileEnd = c.indexOf(blockEndMarker);

if (fileStart === -1 || fileEnd === -1) {
  console.log('ERROR: Could not find markers', fileStart, fileEnd);
  process.exit(1);
}

console.log('Found markers at:', fileStart, 'to', fileEnd);

const newBlock = `if (mode === 'bazi') {
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

        // 手动排大运：年干阴阳定顺逆 + 出生年份确定岁数
        const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tg[0])
        const isYang = tgIdx % 2 === 0
        const forward = (isYang && gender === '男') || (!isYang && gender === '女')
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
        
        let mTgIdx = stems.indexOf(tg[1])
        let mDzIdx = branches.indexOf(dz[1])
        const dayunArr: any[] = []
        
        for (let step = 0; step < 8; step++) {
          if (forward) { mTgIdx = (mTgIdx + 1) % 10; mDzIdx = (mDzIdx + 1) % 12 }
          else { mTgIdx = (mTgIdx + 9) % 10; mDzIdx = (mDzIdx + 11) % 12 }
          const dyGz = stems[mTgIdx] + branches[mDzIdx]
          const startAge = 3 + step * 10
          const startYear = birthYear + startAge
          const years = []
          for (let y = 0; y < 10; y++) {
            const yy = startYear + y
            const gi = (yy - 4) % 10 >= 0 ? (yy - 4) % 10 : (yy - 4) % 10 + 10
            const bi = (yy - 4) % 12 >= 0 ? (yy - 4) % 12 : (yy - 4) % 12 + 12
            years.push({ year: yy, gz: stems[gi] + branches[bi], age: startAge + y })
          }
          dayunArr.push({ gz: dyGz, age: startAge, startYear, years })
        }

        setResult({
          dateStr: '直接排盘 · ' + birthYear + '年 ' + tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时 · '+gender+'命',
          bazi: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时',
          solarStr: '', lunarStr: '直接输入八字排盘 · ' + birthYear + '年（大运估算，起运3岁）',
          pills, wx, dg, str, zodiac, shenSha,
          mingGong: '—', shenGong: '—', taiYuan: '—', xunKong: '—',
          yearDiShi: '', monthDiShi: '', dayDiShi: '', timeDiShi: '',
          dayun: dayunArr, analysis,
        })
      } catch(e){ setError('排盘出错，请检查天干地支和出生年份') }
      return
    }
    `;

// Replace from blockStartMarker to just before blockEndMarker
c = c.substring(0, fileStart) + newBlock + '\n    ' + c.substring(fileEnd);

fs.writeFileSync(f, c, 'utf8');
console.log('Done');
