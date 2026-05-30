const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add mode/bazi states
c = c.replace(
  "const [cal, setCal] = useState<'solar'|'lunar'>('solar')",
  "const [mode, setMode] = useState<'date'|'bazi'>('date')\n  const [cal, setCal] = useState<'solar'|'lunar'>('solar')"
);
c = c.replace(
  "const [day, setDay] = useState(String(now.getDate()))",
  "const [day, setDay] = useState(String(now.getDate()))\n  const [bzTg, setBzTg] = useState(['甲','甲','甲','甲'])\n  const [bzDz, setBzDz] = useState(['子','寅','午','子'])"
);
c = c.replace(
  "const [hour, setHour] = useState('11')",
  "const [hour, setHour] = useState('11')\n  const [gender, setGender] = useState('男')"
);

// 2. Insert direct-bazi branch in doCalc (after setError)
c = c.replace(
  "setError(''); setResult(null)",
  "setError(''); setResult(null)\n" +
  "    if (mode === 'bazi') {\n" +
  "      try {\n" +
  "        const tg = bzTg, dz = bzDz, dg = tg[2]\n" +
  "        function mk(gz, gan, zhi) {\n" +
  "          const hdStems = (hA[zhi] || '').split('')\n" +
  "          const hdSS = hdStems.map(hs => ({ gan: hs, ss: ssM[dg]?.[hs] || '' }))\n" +
  "          return {gz, gan, zhi, ny: ny[gz]||'\\u2014', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'\\u2014', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||''}\n" +
  "        }\n" +
  "        const pills = [\n" +
  "          mk(tg[0]+dz[0], tg[0], dz[0]),\n" +
  "          mk(tg[1]+dz[1], tg[1], dz[1]),\n" +
  "          mk(tg[2]+dz[2], tg[2], dz[2]),\n" +
  "          mk(tg[3]+dz[3], tg[3], dz[3]),\n" +
  "        ]\n" +
  "        const wx = {\\u91d1:0,\\u6728:0,\\u6c34:0,\\u706b:0,\\u571f:0}\n" +
  "        for (const p of pills) {\n" +
  "          if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++\n" +
  "          for (const c of (hA[p.zhi] || '')) { if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++ }\n" +
  "        }\n" +
  "        const str = strength(wx, dg)\n" +
  "        const shenSha = calcShenSha(dg, dz[0], dz[1], dz[2])\n" +
  "        const lunar = { getYear: () => 2024, getMonth: () => 1, getDay: () => 1, getYearShengXiao: () => '\\u9f20', toFullString: () => '', getYearInChinese: () => '', getMonthInChinese: () => '', getDayInChinese: () => '' }\n" +
  "        const analysis = comprehensiveAnalysis(dg, dz[2], wx, pills, '', lunar, dz[1], shenSha, gender)\n" +
  "        setResult({\n" +
  "          dateStr: '\\u76f4\\u63a5\\u6392\\u76d8 \\u00b7 ' + tg[0]+dz[0]+'\\u5e74 '+tg[1]+dz[1]+'\\u6708 '+tg[2]+dz[2]+'\\u65e5 '+tg[3]+dz[3]+'\\u65f6 \\u00b7 '+gender+'\\u547d',\n" +
  "          bazi: tg[0]+dz[0]+'\\u5e74 '+tg[1]+dz[1]+'\\u6708 '+tg[2]+dz[2]+'\\u65e5 '+tg[3]+dz[3]+'\\u65f6',\n" +
  "          solarStr: '', lunarStr: '\\u76f4\\u63a5\\u8f93\\u5165\\u516b\\u5b57\\u6392\\u76d8',\n" +
  "          pills, wx, dg, str, zodiac: '\\u9f20', shenSha,\n" +
  "          mingGong: '\\u2014', shenGong: '\\u2014', taiYuan: '\\u2014', xunKong: '\\u2014',\n" +
  "          yearDiShi: '', monthDiShi: '', dayDiShi: '', timeDiShi: '',\n" +
  "          dayun: [], analysis,\n" +
  "        })\n" +
  "      } catch(e){ setError('\\u6392\\u76d8\\u51fa\\u9519\\uff0c\\u8bf7\\u68c0\\u67e5\\u5929\\u5e72\\u5730\\u652f') }\n" +
  "      return\n" +
  "    }"
);

// 3. Replace the form section - add mode toggle
const oldFormStart = "<div className=\"flex gap-3 mb-4\">";
const oldFormEnd = "<button onClick={doCalc} className=\"bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95\">开始算命</button>";

// Find the form section boundaries
const formIdxStart = c.indexOf(oldFormStart);
const formIdxEnd = c.indexOf(oldFormEnd) + oldFormEnd.length;
const formSection = c.substring(formIdxStart, formIdxEnd);

const newForm = 
`<div className="flex gap-2 mb-4 flex-wrap">
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

c = c.substring(0, formIdxStart) + newForm + c.substring(formIdxEnd);
fs.writeFileSync(p, c, 'utf8');
console.log('BaziClient.tsx updated successfully');
