const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');

// Replace form section
const oldForm = `<div className="flex gap-3 mb-4">
        <button onClick={()=>switchCal('solar')} className={\`px-4 py-1.5 rounded-lg text-xs transition-colors \${cal==='solar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>公历</button>
        <button onClick={()=>switchCal('lunar')} className={\`px-4 py-1.5 rounded-lg text-xs transition-colors \${cal==='lunar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>农历</button>
        <select value={gender} onChange={e=>setGender(e.target.value)} className="px-4 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
          <option value="男">男</option><option value="女">女</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {[{l:'年',v:year,s:setYear},{l:'月',v:month,s:setMonth},{l:'日',v:day,s:setDay}].map((f,i)=>(
          <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label>
          <input type="number" value={f.v} onChange={e=>f.s(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" /></div>
        ))}
        <div><label className="block text-xs text-gray-500 mb-1">时</label>
          <select value={hour} onChange={e=>setHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm"><option value="">选择时辰</option>{hourOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">开始算命</button>`;

const newForm = `<div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setMode('date')} className={\`px-3 py-1.5 rounded-lg text-xs transition-colors \${mode==='date'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>✨ 公历/农历</button>
        <button onClick={()=>setMode('bazi')} className={\`px-3 py-1.5 rounded-lg text-xs transition-colors \${mode==='bazi'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>🔮 直接排盘</button>
        <select value={gender} onChange={e=>setGender(e.target.value)} className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
          <option value="男">男</option><option value="女">女</option>
        </select>
      </div>

      {mode === 'date' && (<>
        <div className="flex gap-3 mb-4">
          <button onClick={()=>switchCal('solar')} className={\`px-4 py-1.5 rounded-lg text-xs transition-colors \${cal==='solar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>公历</button>
          <button onClick={()=>switchCal('lunar')} className={\`px-4 py-1.5 rounded-lg text-xs transition-colors \${cal==='lunar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}\`}>农历</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[{l:'年',v:year,s:setYear},{l:'月',v:month,s:setMonth},{l:'日',v:day,s:setDay}].map((f,i)=>(
            <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label>
            <input type="number" value={f.v} onChange={e=>f.s(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" /></div>
          ))}
          <div><label className="block text-xs text-gray-500 mb-1">时</label>
            <select value={hour} onChange={e=>setHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm"><option value="">选择时辰</option>{hourOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
          </div>
        </div>
      </>)}

      {mode === 'bazi' && (<div className="mb-4">
        <p className="text-[11px] text-gray-500 mb-3">直接输入您已知的四柱八字（天干+地支分别选择）</p>
        {['年','月','日','时'].map((l,i)=>(
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 w-6 shrink-0">{l}</span>
            <select value={bzTg[i]} onChange={e=>{const a=[...bzTg];a[i]=e.target.value;setBzTg(a)}} className="w-20 px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].map(g=><option key={g}>{g}</option>)}
            </select>
            <select value={bzDz[i]} onChange={e=>{const a=[...bzDz];a[i]=e.target.value;setBzDz(a)}} className="w-20 px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].map(d=><option key={d}>{d}</option>)}
            </select>
            <span className="text-[10px] text-gray-600">{bzTg[i]}{bzDz[i]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(' ')}</span>
        </div>
      </div>)}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">开始算命</button>`;

// Normalize line endings to match
const oldNormalized = oldForm.replace(/\r\n/g, '\n');
const newNormalized = newForm.replace(/\r\n/g, '\n');

if (c.includes(oldForm)) {
  c = c.replace(oldForm, newForm);
} else if (c.includes(oldNormalized)) {
  c = c.replace(oldNormalized, newNormalized);
} else {
  console.log('Could not find exact form text. Trying partial match...');
  // Find by partial signature
  const idx = c.indexOf('flex gap-3 mb-4');
  if (idx > 0) {
    // Find the button text
    const searchStart = c.lastIndexOf('<div', idx);
    console.log('Found at', searchStart, 'partial');
  }
}

// Now add doCalc branch for bazi mode
// Find `setError(''); setResult(null)` and insert code after it
const doCalcStart = "setError(''); setResult(null)";
const baziBranch = `setError(''); setResult(null)
    if (mode === 'bazi') {
      try {
        const tg = bzTg as string[], dz = bzDz as string[], dg = tg[2]
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
        const lunar = { getYear: () => 2024, getMonth: () => 1, getDay: () => 1, getYearShengXiao: () => '鼠', toFullString: () => '', getYearInChinese: () => '', getMonthInChinese: () => '', getDayInChinese: () => '' }
        const analysis = comprehensiveAnalysis(dg, dz[2], wx, pills, '', lunar as any, dz[1], shenSha, gender)
        setResult({
          dateStr: '直接排盘 · ' + tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时 · '+gender+'命',
          bazi: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时',
          solarStr: '', lunarStr: '直接输入八字排盘',
          pills, wx, dg, str, zodiac: '鼠', shenSha,
          mingGong: '—', shenGong: '—', taiYuan: '—', xunKong: '—',
          yearDiShi: '', monthDiShi: '', dayDiShi: '', timeDiShi: '',
          dayun: [], analysis,
        })
      } catch(e){ setError('排盘出错，请检查天干地支') }
      return
    }`;

// Replace only if exact match works
if (c.includes(doCalcStart)) {
  // First occurrence replaces - we need to keep the new DO statement and skip the old
  const firstIdx = c.indexOf(doCalcStart);
  const afterFirst = c.indexOf(doCalcStart, firstIdx + 1);
  
  if (afterFirst > 0) {
    // There are two - replace the SECOND with nothing
    c = c.substring(0, afterFirst) + c.substring(afterFirst + doCalcStart.length);
  }
  
  // Now replace the first with the branch version
  c = c.replace(doCalcStart, baziBranch);
} else {
  console.log('Could not find setError anchor');
}

fs.writeFileSync(f, c, 'utf8');
console.log('Done. File updated.');
