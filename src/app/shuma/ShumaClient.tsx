'use client'

import { useState, useCallback } from 'react'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

interface Field { name: string; type: string; numbers: number[]; keywords: string[]; description: string; detail: string; color: string }

const FIELDS: Record<string, Field> = {
  fuwei: { name:'伏位', type:'平', numbers:[11,22,88,99,77,66,44,33], keywords:['稳定','保守','耐心','积蓄'], description:'主稳定、保守、积蓄。', detail:'伏位磁场代表稳定和积蓄。拥有伏位磁场的人性格稳重，做事有耐心。伏位是中性磁场，吉凶取决于前后搭配。', color:'#1abc9c' },
  tianyi: { name:'天医', type:'吉', numbers:[13,31,68,86,94,49,72,27], keywords:['财运','财富','婚姻','桃花','聪明'], description:'主财运、婚姻、健康，是最吉祥的数字组合。', detail:'天医磁场是八大磁场中最吉祥的磁场，代表财富、婚姻和智慧。拥有天医磁场的手机号码，能为使用者带来良好的财运和美满的婚姻。天医能量强的人思维敏捷，心地善良。', color:'#2ecc71' },
  shengqi: { name:'生气', type:'吉', numbers:[14,41,67,76,93,39,82,28], keywords:['贵人','人脉','开朗','随缘'], description:'主贵人运、人脉广、性格开朗乐观。', detail:'生气磁场代表贵人运和人际关系。拥有生气磁场的号码使用者，往往性格开朗、人缘好，容易得到他人的帮助和支持。生气磁场也被称为贵人星。', color:'#3498db' },
  yannian: { name:'延年', type:'吉', numbers:[19,91,78,87,34,43,26,62], keywords:['事业','领导力','才干','专业'], description:'主事业运、领导能力、专业才干。', detail:'延年磁场代表事业和领导能力。拥有延年磁场的人通常事业心强，有领导才能，在专业领域表现出色。延年是事业星，代表能力和担当。', color:'#9b59b6' },
  liusha: { name:'六煞', type:'凶', numbers:[16,61,74,47,38,83,92,29], keywords:['烂桃花','情绪','忧郁','服务'], description:'主烂桃花、情绪不稳定、忧郁。', detail:'六煞磁场代表烂桃花和情绪问题。拥有六煞磁场的人情感丰富，但也容易陷入感情纠纷和情绪波动。', color:'#e67e22' },
  jueming: { name:'绝命', type:'凶', numbers:[12,21,69,96,84,48,37,73], keywords:['破财','冲动','投资','大起大落'], description:'主破财、冲动、投资失利。', detail:'绝命磁场代表破财和大起大落的人生。拥有绝命磁场的人有冲劲、敢冒险，但也容易因冲动而导致财务损失。', color:'#c0392b' },
  huohai: { name:'祸害', type:'凶', numbers:[17,71,89,98,64,46,32,23], keywords:['口舌','是非','小人','病痛'], description:'主口舌是非、小人、身体病痛。', detail:'祸害磁场代表口舌是非和身体问题。拥有祸害磁场的号码，容易引发争吵、官非和小人困扰。', color:'#e74c3c' },
  wugui: { name:'五鬼', type:'凶', numbers:[18,81,79,97,36,63,42,24], keywords:['变动','才华','熬夜','血光'], description:'主变动、才华横溢但易招血光。', detail:'五鬼磁场代表变动和才华。拥有五鬼磁场的人聪明过人、有创造力，但也容易经历人生变故和波折。', color:'#8e44ad' },
}

const FIELD_ORDER = ['fuwei','tianyi','shengqi','yannian','liusha','jueming','huohai','wugui']
const FIELD_LIST = FIELD_ORDER.map(k => ({ key: k, ...FIELDS[k] }))

const numToField: Record<number, string> = {}
for (const [k, f] of Object.entries(FIELDS)) for (const n of f.numbers) numToField[n] = k

const TYPE_STYLE: Record<string, string> = { '吉':'bg-green-900/50 text-green-300 border-green-700', '凶':'bg-red-900/50 text-red-300 border-red-700', '平':'bg-cyan-900/50 text-cyan-300 border-cyan-700' }

export default function ShumaClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<any>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  const doAnalyze = useCallback(() => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) return
    const segments: any[] = []
    const fieldCounts: Record<string, number> = {}
    for (const k of Object.keys(FIELDS)) fieldCounts[k] = 0
    for (let i = 0; i < digits.length - 1; i++) {
      const pair = parseInt(digits.substring(i, i + 2))
      const fk = numToField[pair]
      const f = fk ? FIELDS[fk] : null
      segments.push({ pair, position: i + 1, fieldKey: fk || 'unknown', fieldName: f?.name || '未知', fieldType: f?.type || '—' })
      if (fk) fieldCounts[fk]++
    }
    let aus=0, inaus=0, neut=0
    for (const [k, c] of Object.entries(fieldCounts)) {
      if (k === 'fuwei') neut += c
      else if (['tianyi','shengqi','yannian'].includes(k)) aus += c
      else inaus += c
    }
    const total = aus + inaus + neut
    let score = 50
    if (total > 0) { score = Math.round(Math.max(0, Math.min(100, 50 + (aus/total)*50 - (inaus/total)*40))) }
    const overall = score >= 75 ? '上等号码' : score >= 60 ? '中上号码' : score >= 40 ? '中等号码' : score >= 25 ? '中下号码' : '需要注意'
    const tail4 = digits.slice(-4)
    const tailPairs = [parseInt(tail4.slice(0,2)), parseInt(tail4.slice(1,3)), parseInt(tail4.slice(2,4))]
    const tailFields = tailPairs.map(p => numToField[p]).filter(Boolean)
    const tailNames = tailFields.map(k => FIELDS[k]?.name).filter(Boolean)

    const warnings: string[] = []
    const highlights: string[] = []
    if (fieldCounts.huohai >= 2) warnings.push('祸害磁场多次出现，注意口舌是非。')
    if (fieldCounts.jueming >= 2) warnings.push('绝命磁场较多，投资需谨慎。')
    if (fieldCounts.liusha >= 2) warnings.push('六煞磁场较多，注意情绪管理。')
    if (fieldCounts.wugui >= 2) warnings.push('五鬼磁场频繁，注意安全。')
    if (fieldCounts.tianyi >= 2) highlights.push('天医磁场较强，财运亨通。')
    if (fieldCounts.shengqi >= 2) highlights.push('生气磁场旺盛，贵人运好。')
    if (fieldCounts.yannian >= 2) highlights.push('延年磁场充足，事业运强。')

    setResult({ phone: digits, segments, fieldCounts, aus, inaus, neut, score, overall, tail4, tailFields: tailNames, warnings, highlights })
  }, [phone])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">号码测吉凶</h1>
      <p className="text-gray-400 mb-6">基于八星磁场理论，输入手机号快速分析数字能量组合。</p>

      {/* 输入 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
        <div className="flex gap-2 mb-3">
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
            placeholder="输入11位手机号码"
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 font-mono text-lg tracking-widest" maxLength={11} />
          <button onClick={doAnalyze}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95 whitespace-nowrap">
            开始分析
          </button>
        </div>
      </div>

      {/* 八星磁场号码表 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-3 text-center">八星磁场号码对照表</h3>
        <p className="text-[10px] text-gray-500 mb-3 text-center">点击数字可查看该磁场详解</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {FIELD_LIST.map(f => (
            <div key={f.key} className="text-center">
              <p className="text-[10px] font-semibold mb-1" style={{color: f.color}}>{f.name}</p>
              <div className="flex flex-wrap justify-center gap-0.5">
                {f.numbers.map(n => (
                  <button key={n} onClick={() => setSelectedField(selectedField === f.key ? null : f.key)}
                    className="text-[10px] w-7 h-5 flex items-center justify-center rounded bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors">
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 选中磁场的详细信息 */}
      {selectedField && FIELDS[selectedField] && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border p-5 mb-6" style={{borderColor: FIELDS[selectedField].color + '40'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold font-serif" style={{color: FIELDS[selectedField].color}}>{FIELDS[selectedField].name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_STYLE[FIELDS[selectedField].type] || ''}`}>{FIELDS[selectedField].type}</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">号码：{FIELDS[selectedField].numbers.join('、')}</p>
          <p className="text-xs text-gray-400 mb-1">关键词：{FIELDS[selectedField].keywords.join(' · ')}</p>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{FIELDS[selectedField].detail}</p>
          <button onClick={() => setSelectedField(null)} className="text-[10px] text-gray-500 mt-2 hover:text-gray-300">关闭</button>
        </div>
      )}

      {/* 分析结果 */}
      {result && result.segments && (
        <div className="space-y-4">
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">综合评分</p>
            <p className={`text-4xl font-bold ${result.score >= 60 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}</p>
            <p className={`text-sm mt-1 font-semibold ${result.score >= 60 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.overall}</p>
          </div>

          {/* 号码分段分析 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">号码磁场分段分析</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-dark-600">
                  <th className="py-1 pr-2 text-left">位置</th><th className="py-1 px-2 text-left">数字</th><th className="py-1 px-2 text-left">磁场</th><th className="py-1 pl-2 text-left">吉凶</th>
                </tr></thead>
                <tbody>
                  {result.segments.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-dark-700/50">
                      <td className="py-1 pr-2 text-gray-500">{s.position}-{s.position+1}位</td>
                      <td className="py-1 px-2 font-mono text-gray-200">{String(s.pair).padStart(2,'0')}</td>
                      <td className="py-1 px-2" style={s.fieldType !== '—' ? {color: FIELDS[s.fieldKey]?.color} : {}}>{s.fieldName}</td>
                      <td className="py-1 pl-2">{s.fieldType !== '—' && <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_STYLE[s.fieldType] || 'bg-dark-700 text-gray-400'}`}>{s.fieldType}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 八星统计 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FIELD_LIST.map(f => {
              const cnt = result.fieldCounts[f.key] || 0
              return (
                <button key={f.key} onClick={() => setSelectedField(selectedField === f.key ? null : f.key)}
                  className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center hover:border-gold-500/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold" style={{color: f.color}}>{f.name}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded ${TYPE_STYLE[f.type] || ''}`}>{f.type}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{cnt}<span className="text-xs text-gray-500">次</span></p>
                  <p className="text-[9px] text-gray-600">{f.keywords.slice(0,2).join('/')}</p>
                </button>
              )
            })}
          </div>

          {/* 尾号分析 */}
          {result.tail4 && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
              <h3 className="text-sm font-semibold text-gray-200 mb-1">尾号分析</h3>
              <p className="text-xs text-gray-300">后四位 <span className="font-mono text-gold-400">{result.tail4}</span>：{result.tailFields.length > 0 ? (result.tailFields.join(' + ')+' 磁场') : '无特殊磁场组合'}</p>
            </div>
          )}

          {/* 吉凶提示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.highlights.length > 0 && (
              <div className="bg-green-900/10 rounded-xl border border-green-700/30 p-4">
                <h3 className="text-xs font-semibold text-green-400 mb-1">✨ 亮点</h3>
                {result.highlights.map((h: string, i: number) => <p key={i} className="text-xs text-green-300/80 mt-1">• {h}</p>)}
              </div>
            )}
            {result.warnings.length > 0 && (
              <div className="bg-red-900/10 rounded-xl border border-red-700/30 p-4">
                <h3 className="text-xs font-semibold text-red-400 mb-1">⚠️ 提示</h3>
                {result.warnings.map((w: string, i: number) => <p key={i} className="text-xs text-red-300/80 mt-1">• {w}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
