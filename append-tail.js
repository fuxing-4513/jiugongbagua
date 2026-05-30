const fs = require('fs')
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx'
const tail = `

// ═══════════════════════════════════════
//  NamingClient 五行起名主组件
// ═══════════════════════════════════════

interface NameResult {
  fullName: string
  firstName: string
  chars: { char: string; wx: string; stroke: number }[]
  scores: { key: string; val: number; score: string }[]
  avgScore: number
  sancai: string
  meaning: string
}

const HOUR_OPTS = [
  {v:'0',l:'子时 23:00-00:59'},{v:'1',l:'丑时 01:00-02:59'},{v:'2',l:'丑时 01:00-02:59'},{v:'3',l:'寅时 03:00-04:59'},{v:'4',l:'寅时 03:00-04:59'},{v:'5',l:'卯时 05:00-06:59'},
  {v:'6',l:'卯时 05:00-06:59'},{v:'7',l:'辰时 07:00-08:59'},{v:'8',l:'辰时 07:00-08:59'},{v:'9',l:'巳时 09:00-10:59'},{v:'10',l:'巳时 09:00-10:59'},{v:'11',l:'午时 11:00-12:59'},
  {v:'12',l:'午时 11:00-12:59'},{v:'13',l:'未时 13:00-14:59'},{v:'14',l:'未时 13:00-14:59'},{v:'15',l:'申时 15:00-16:59'},{v:'16',l:'申时 15:00-16:59'},{v:'17',l:'酉时 17:00-18:59'},
  {v:'18',l:'酉时 17:00-18:59'},{v:'19',l:'戌时 19:00-20:59'},{v:'20',l:'戌时 19:00-20:59'},{v:'21',l:'亥时 21:00-22:59'},{v:'22',l:'亥时 21:00-22:59'},{v:'23',l:'子时 23:00-00:59'},
]

function getHourDz(h: number): string { return SHI_CHEN_DIZHI[h] || '子' }

function generateNames(surname: string, wxCount: Record<string,number>, yongShen: string, gender: string): NameResult[] {
  const results: NameResult[] = []
  const pool = [...(CHAR_POOL[yongShen] || []), ...Object.values(CHAR_POOL).flat()]
  const uniquePool = [...new Set(pool)]
  for (let g = 0; g < 5; g++) {
    const firstChar = pickRandom(uniquePool)
    const secondChar = pickRandom(uniquePool.filter(c => c !== firstChar))
    const name = firstChar + secondChar
    const fullName = surname + name
    const nameChars = [...name].map(c => ({ char: c, wx: getCharWuxing(c), stroke: getStroke(c) }))
    const lnStrokes = getStroke(surname)
    const fnStrokes = nameChars.map(c => c.stroke)
    const fnSum = fnStrokes.reduce((a, b) => a + b, 0)
    const tiange = lnStrokes + 1
    const renge = lnStrokes + (fnStrokes[0] || 0)
    const dige = fnSum + (fnStrokes.length <= 1 ? 1 : 0)
    const zongge = lnStrokes + fnSum
    const waige = zongge - renge + 1
    const wuge = [{key:'天格',val:tiange},{key:'人格',val:renge},{key:'地格',val:dige},{key:'外格',val:waige},{key:'总格',val:zongge}].map(w => ({...w, ...getNumDetail(w.val)}))
    const avgScore = Math.round(wuge.reduce((s, w) => { const m: Record<string,number>={'大吉':100,'吉':80,'中吉':65,'中':50,'凶':30,'大凶':10,'小吉':70}; return s + (m[w.score] || 50) }, 0) / 5)
    const sancai = nameChars.map(c => c.wx).join('\u2192')
    const meanings: string[] = []
    for (const ch of nameChars) {
      const entry = POEM_NAMES.find(p => p.name.includes(ch.char) || (ch.char.length === 1 && p.name[0] === ch.char))
      if (entry) meanings.push(entry.line.slice(0, 20) + '...')
      else meanings.push(ch.char + '\u5b57\u4e94\u884c\u5c5e' + ch.wx + '\uff0c' + (ch.wx === yongShen ? '\u8865\u76ca\u7528\u795e' : ''))
    }
    results.push({fullName, firstName: name, chars: nameChars, scores: wuge, avgScore, sancai, meaning: meanings.join('\uff1b')})
  }
  return results.sort((a, b) => b.avgScore - a.avgScore)
}

export default function NamingClient() {
  const [tab, setTab] = useState<'wuxing'|'gushi'>('wuxing')
  const [surname, setSurname] = useState('')
  const [calType, setCalType] = useState<'solar'|'lunar'>('solar')
  const [sYear, setSYear] = useState('2026')
  const [sMonth, setSMonth] = useState('5')
  const [sDay, setSDay] = useState('29')
  const [sHour, setSHour] = useState('12')
  const [gender, setGender] = useState<'male'|'female'>('male')
  const [wxResults, setWxResults] = useState<NameResult[]>([])
  const [wxError, setWxError] = useState('')
  const [lunarInfo, setLunarInfo] = useState('')
  const [wxData, setWxData] = useState<{wxCount:Record<string,number>; riZhu:string; riZhuWx:string; bodyStrength:string; yongShen:string} | null>(null)
  const [poemBatch, setPoemBatch] = useState<PoemNameEntry[]>([])

  const handleWuxingSubmit = useCallback(() => {
    if (!surname.trim()) { setWxError('\u8bf7\u8f93\u5165\u59d3\u6c0f'); return }
    setWxError('')
    try {
      const y = parseInt(sYear), m = parseInt(sMonth), d = parseInt(sDay), h = parseInt(sHour)
      const hourDz = getHourDz(h)
      let lunar: any
      if (calType === 'solar') {
        const solar = Solar.fromYmd(y, m, d)
        lunar = solar.getLunar()
        setLunarInfo('\u519c\u5386\uff1a' + lunar.getYear() + '\u5e74 ' + lunar.getMonthInChinese() + '\u6708 ' + lunar.getDayInChinese())
      } else {
        lunar = Lunar.fromYmd(y, m, d)
        const solar = lunar.getSolar()
        setLunarInfo('\u516c\u5386\uff1a' + solar.getYear() + '\u5e74' + solar.getMonth() + '\u6708' + solar.getDay() + '\u65e5')
      }
      const ly = lunar.getYear(), lm = lunar.getMonth(), ld = lunar.getDay()
      const gzArr = calcBazi(ly, lm, ld, hourDz)
      const analysis = analyzeWuxing(gzArr)
      setWxData(analysis)
      const names = generateNames(surname.trim(), analysis.wxCount, analysis.yongShen, gender)
      setWxResults(names)
    } catch (e) {
      setWxError('\u516b\u5b57\u6392\u76d8\u51fa\u9519\uff0c\u8bf7\u68c0\u67e5\u65e5\u671f\u662f\u5426\u6b63\u786e')
    }
  }, [surname, calType, sYear, sMonth, sDay, sHour, gender])

  const handleRegenerate = useCallback(() => {
    if (!surname.trim() || !wxData) return
    const names = generateNames(surname.trim(), wxData.wxCount, wxData.yongShen, gender)
    setWxResults(names)
  }, [surname, wxData, gender])

  const handleGushi = useCallback(() => {
    const batch = pickRandomN(POEM_NAMES, 8)
    setPoemBatch(batch)
  }, [])

  if (poemBatch.length === 0 && tab === 'gushi') { handleGushi() }

  const currentYear = new Date().getFullYear()

  return (<div className="space-y-6">
    <div className="flex gap-1 bg-dark-700 rounded-lg p-1 max-w-xs">
      <button onClick={()=>setTab('wuxing')} className={'flex-1 px-4 py-2 text-sm rounded-md transition-colors '+(tab==='wuxing'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200')}>\u4e94\u884c\u8d77\u540d</button>
      <button onClick={()=>setTab('gushi')} className={'flex-1 px-4 py-2 text-sm rounded-md transition-colors '+(tab==='gushi'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200')}>\u53e4\u8bd7\u8bcd\u8d77\u540d</button>
    </div>
    {tab === 'wuxing' ? (
      <>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">\u8f93\u5165\u4fe1\u606f</h3>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">\u59d3\u6c0f</label>
            <input type="text" value={surname} onChange={e=>setSurname(e.target.value)} maxLength={2}
              className="w-32 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-gray-400">\u5386\u6cd5\uff1a</span>
            <button onClick={()=>setCalType('solar')} className={'px-3 py-1.5 text-xs rounded-lg '+(calType==='solar'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600')}>\u9633\u5386</button>
            <button onClick={()=>setCalType('lunar')} className={'px-3 py-1.5 text-xs rounded-lg '+(calType==='lunar'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600')}>\u9634\u5386</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <div><label className="block text-xs text-gray-400 mb-1">\u5e74</label>
              <select value={sYear} onChange={e=>setSYear(e.target.value)}
                className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                {Array.from({length:120},(_,i)=>currentYear-60+i).map(y=><option key={y}>{y}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-400 mb-1">\u6708</label>
              <select value={sMonth} onChange={e=>setSMonth(e.target.value)}
                className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                {Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-400 mb-1">\u65e5</label>
              <select value={sDay} onChange={e=>setSDay(e.target.value)}
                className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                {Array.from({length:31},(_,i)=><option key={i+1}>{i+1}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-400 mb-1">\u65f6\u8fb0</label>
              <select value={sHour} onChange={e=>setSHour(e.target.value)}
                className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                {HOUR_OPTS.filter((v,i,a)=>a.findIndex(t=>t.l.split(' ')[0]===v.l.split(' ')[0])===i).map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-400 mb-1">\u6027\u522b</label>
              <div className="flex gap-2 mt-1">
                <button onClick={()=>setGender('male')} className={'px-3 py-1.5 text-xs rounded-lg '+(gender==='male'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600')}>\u7537</button>
                <button onClick={()=>setGender('female')} className={'px-3 py-1.5 text-xs rounded-lg '+(gender==='female'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600')}>\u5973</button>
              </div></div>
          </div>
          <button onClick={handleWuxingSubmit} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">\u5f00\u59cb\u8d77\u540d</button>
          {lunarInfo && <p className="text-xs text-gray-500 mt-2">{lunarInfo}</p>}
          {wxError && <p className="text-xs text-red-400 mt-2">{wxError}</p>}
        </div>
        {wxData && (
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">\u516b\u5b57\u4e94\u884c\u5206\u6790</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(wxData.wxCount).map(([wx, cnt]) => (
                <span key={wx} className={'text-xs px-2 py-1 rounded border '+(WXC[wx]||'bg-dark-700 border-dark-600')}>{wx}\uff1a{cnt}\u4e2a</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-dark-700 rounded-lg p-3"><span className="text-gray-500">\u65e5\u4e3b\uff1a</span><span className="text-gray-200">{wxData.riZhu}（{wxData.riZhuWx}）</span></div>
              <div className="bg-dark-700 rounded-lg p-3"><span className="text-gray-500">\u8eab\u5f3a\u5f31\uff1a</span><span className={'font-semibold '+(wxData.bodyStrength==='\u8eab\u5f3a'?'text-red-400':wxData.bodyStrength==='\u8eab\u5f31'?'text-blue-400':'text-yellow-400')}>{wxData.bodyStrength}</span></div>
              <div className="bg-dark-700 rounded-lg p-3"><span className="text-gray-500">\u7528\u795e\uff1a</span><span className={'font-semibold '+(WXC[wxData.yongShen]?.split(' ')[1]||'text-gold-400')}>{wxData.yongShen}</span></div>
            </div>
          </div>
        )}
        {wxResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wxResults.map((r, i) => (
                <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/20 p-5 hover:border-gold-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold font-serif text-gold-400">{r.fullName}</span>
                    <span className={'text-lg font-bold '+(r.avgScore>=80?'text-green-400':r.avgScore>=60?'text-yellow-400':'text-red-400')}>{r.avgScore}\u5206</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {r.chars.map((c, j) => (
                      <span key={j} className={'text-[10px] px-2 py-1 rounded border '+(WXC[c.wx]||'bg-dark-700 border-dark-600')}>{c.char}（{c.wx}\u00b7{c.stroke}\u753b）</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {r.scores.map((w, j) => (
                      <div key={j} className="text-center bg-dark-700 rounded p-1">
                        <p className="text-[9px] text-gray-500">{w.key}</p>
                        <p className={'text-[10px] font-semibold '+(gradeC[w.score])}>{w.val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500">\u4e09\u624d\u914d\u7f6e\uff1a{r.sancai}</p>
                  {r.meaning && <p className="text-[10px] text-gray-600 mt-1">{r.meaning}</p>}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button onClick={handleRegenerate} className="bg-dark-700 hover:bg-dark-600 border border-gold-500/30 text-gray-300 px-6 py-2.5 rounded-lg transition-colors active:scale-95">\u518d\u8d77\u4e00\u904d</button>
            </div>
          </>
        )}
      </>
    ) : (
      <>
        <p className="text-xs text-gray-400 mb-4">\u4ece\u5510\u8bd7\u5b8b\u8bcd\u3001\u8bd7\u7ecf\u695a\u8f9e\u3001\u8bba\u8bed\u6613\u7ecf\u4e2d\u7cbe\u9009\u96c5\u81f4\u540d\u5b57</p>
        {poemBatch.length === 0 && handleGushi()}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {poemBatch.map((entry, i) => (
            <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 hover:border-gold-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold font-serif text-gold-400">{entry.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-dark-700 text-gray-400 border border-dark-600">{entry.source}</span>
              </div>
              <p className="text-xs text-gray-300 italic mb-2">\u300c{entry.line}\u300d</p>
              <p className="text-xs text-gray-500">\u2014\u2014 {entry.category} \u00b7 {entry.author}</p>
              <p className="text-[10px] text-gray-600 mt-2">{entry.meaning}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button onClick={handleGushi} className="bg-dark-700 hover:bg-dark-600 border border-gold-500/30 text-gray-300 px-6 py-2.5 rounded-lg transition-colors active:scale-95">\u6362\u4e00\u6279</button>
        </div>
      </>
    )}
  </div>)
}
`

fs.appendFileSync(p, tail)
const size = fs.statSync(p).size
console.log('final size:', size)
console.log('has export default:', fs.readFileSync(p,'utf8').includes('export default'))
