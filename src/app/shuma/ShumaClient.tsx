'use client'

import { useState, useCallback } from 'react'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

// ── 八星磁场数据 ──
interface Field {
  name: string; type: string; numbers: number[]
  keywords: string[]; description: string; detail: string
  color: string
}

const FIELDS: Record<string, Field> = {
  tianyi: { name:'天医', type:'吉', numbers:[13,31,68,86,94,49,72,27], keywords:['财运','财富','婚姻','正桃花','聪明'], description:'主财运、婚姻、健康，是最吉祥的数字组合。天医磁场强的人通常财运亨通，婚姻美满。', detail:'天医磁场是八大磁场中最吉祥的磁场，代表财富、婚姻和智慧。拥有天医磁场的手机号码，能为使用者带来良好的财运和美满的婚姻。天医能量强的人思维敏捷，心地善良。', color:'#2ecc71' },
  shengqi: { name:'生气', type:'吉', numbers:[14,41,67,76,93,39,82,28], keywords:['贵人','人脉','开朗','随缘'], description:'主贵人运、人脉广、性格开朗乐观。有生气磁场的人容易遇到贵人相助。', detail:'生气磁场代表贵人运和人际关系。拥有生气磁场的号码使用者，往往性格开朗、人缘好，容易得到他人的帮助和支持。生气磁场也被称为"贵人星"。', color:'#3498db' },
  yannian: { name:'延年', type:'吉', numbers:[19,91,78,87,34,43,26,62], keywords:['事业','领导力','才干','专业'], description:'主事业运、领导能力、专业才干。延年磁场强的人事业有成，能力强。', detail:'延年磁场代表事业和领导能力。拥有延年磁场的人通常事业心强，有领导才能，在专业领域表现出色。延年是"事业星"，代表能力和担当。', color:'#9b59b6' },
  fuwei: { name:'伏位', type:'平', numbers:[11,22,88,99,77,66,44,33], keywords:['稳定','保守','耐心','积蓄'], description:'主稳定、保守、积蓄。伏位磁场让人性格沉稳，做事有耐心。', detail:'伏位磁场代表稳定和积蓄。拥有伏位磁场的人性格稳重，做事有耐心。伏位是中性磁场，吉凶取决于前后搭配。', color:'#1abc9c' },
  huohai: { name:'祸害', type:'凶', numbers:[17,71,89,98,64,46,32,23], keywords:['口舌','是非','小人','病痛'], description:'主口舌是非、小人、身体病痛。祸害磁场容易招来争吵和麻烦。', detail:'祸害磁场代表口舌是非和身体问题。拥有祸害磁场的号码，容易引发争吵、官非和小人困扰。', color:'#e74c3c' },
  jueming: { name:'绝命', type:'凶', numbers:[12,21,69,96,84,48,37,73], keywords:['破财','冲动','投资','大起大落'], description:'主破财、冲动、投资失利。绝命磁场让人敢拼敢闯但也容易大起大落。', detail:'绝命磁场代表破财和大起大落的人生。拥有绝命磁场的人有冲劲、敢冒险，但也容易因冲动而导致财务损失。', color:'#c0392b' },
  liusha: { name:'六煞', type:'凶', numbers:[16,61,74,47,38,83,92,29], keywords:['烂桃花','情绪','忧郁','服务业'], description:'主烂桃花、情绪不稳定、忧郁。六煞磁场的人情感丰富但容易情绪化。', detail:'六煞磁场代表烂桃花和情绪问题。拥有六煞磁场的人情感丰富，但也容易陷入感情纠纷和情绪波动。', color:'#e67e22' },
  wugui: { name:'五鬼', type:'凶', numbers:[18,81,79,97,36,63,42,24], keywords:['变动','才华','熬夜','血光'], description:'主变动、才华横溢但易招血光。五鬼磁场的人聪明有创意但人生多波折。', detail:'五鬼磁场代表变动和才华。拥有五鬼磁场的人聪明过人、有创造力，但也容易经历人生变故和波折。', color:'#8e44ad' },
}

// 构建反向查找
const numToField: Record<number, string> = {}
for (const [k, f] of Object.entries(FIELDS)) {
  for (const n of f.numbers) numToField[n] = k
}

const FIELD_LIST = Object.entries(FIELDS).map(([k, v]) => ({ key: k, ...v }))

interface SegmentResult {
  pair: number; position: number
  fieldKey: string; fieldName: string; fieldType: string
}

interface AnalysisResult {
  phone: string; valid: boolean
  segments: SegmentResult[]
  fieldCounts: Record<string, number>
  auspiciousCount: number; inauspiciousCount: number; neutralCount: number
  overallScore: number; overall: string
  warnings: string[]; highlights: string[]
  tailAnalysis?: { pairs: number[]; fields: string[]; text: string }
  error?: string
}

function analyze(phone: string): AnalysisResult {
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 11 || !/^\d{11}$/.test(digits))
    return { phone: digits, valid: false, error: '请输入11位手机号码', segments: [], fieldCounts: {}, auspiciousCount: 0, inauspiciousCount: 0, neutralCount: 0, overallScore: 0, overall: '', warnings: [], highlights: [] }

  const r: AnalysisResult = {
    phone: digits, valid: true,
    segments: [], fieldCounts: {},
    auspiciousCount: 0, inauspiciousCount: 0, neutralCount: 0,
    overallScore: 0, overall: '',
    warnings: [], highlights: [],
  }

  for (const k of Object.keys(FIELDS)) r.fieldCounts[k] = 0

  for (let i = 0; i < digits.length - 1; i++) {
    const pair = parseInt(digits.substring(i, i + 2))
    const fk = numToField[pair]
    const field = fk ? FIELDS[fk] : null
    r.segments.push({
      pair, position: i + 1,
      fieldKey: fk || 'unknown',
      fieldName: field?.name || '未知',
      fieldType: field?.type || '—',
    })
    if (fk) {
      r.fieldCounts[fk]++
      if (fk === 'fuwei') r.neutralCount++
      else if (['tianyi','shengqi','yannian'].includes(fk)) r.auspiciousCount++
      else r.inauspiciousCount++
    }
  }

  const total = r.auspiciousCount + r.inauspiciousCount + r.neutralCount
  if (total > 0) {
    const ausPct = (r.auspiciousCount / total) * 100
    const inausPct = (r.inauspiciousCount / total) * 100
    let score = 50 + ausPct * 0.5 - inausPct * 0.4
    score = Math.max(0, Math.min(100, Math.round(score)))
    r.overallScore = score

    if (score >= 75) r.overall = '上等号码'
    else if (score >= 60) r.overall = '中上号码'
    else if (score >= 40) r.overall = '中等号码'
    else if (score >= 25) r.overall = '中下号码'
    else r.overall = '需要注意'

    if (r.fieldCounts.huohai >= 2) r.warnings.push('祸害磁场出现频繁，需注意口舌是非和呼吸系统健康。')
    if (r.fieldCounts.jueming >= 2) r.warnings.push('绝命磁场较多，投资需谨慎，避免冲动消费。')
    if (r.fieldCounts.liusha >= 2) r.warnings.push('六煞磁场较多，注意情绪管理和感情问题。')
    if (r.fieldCounts.wugui >= 2) r.warnings.push('五鬼磁场频繁，人生变动较大，注意安全。')
    if (r.fieldCounts.tianyi >= 2) r.highlights.push('天医磁场较强，财运亨通，有助婚姻美满。')
    if (r.fieldCounts.shengqi >= 2) r.highlights.push('生气磁场旺盛，贵人运好，人脉广阔。')
    if (r.fieldCounts.yannian >= 2) r.highlights.push('延年磁场充足，事业运强，有领导才能。')

    // 尾号分析
    const tail4 = digits.slice(-4)
    const tailPairs = [parseInt(tail4.slice(0,2)), parseInt(tail4.slice(1,3)), parseInt(tail4.slice(2,4))]
    const tailFields = tailPairs.map(p => numToField[p]).filter(Boolean)
    const tailNames = tailFields.map(k => FIELDS[k]?.name).filter(Boolean)
    if (tailNames.length > 0) {
      r.tailAnalysis = { pairs: tailPairs, fields: tailNames, text: `尾号 ${tail4} 包含 ${tailNames.join('、')} 磁场能量` }
      if (tailFields.some(k => ['tianyi','shengqi','yannian'].includes(k)))
        r.highlights.push('尾号含吉星磁场，收尾能量较好。')
      else
        r.warnings.push('尾号缺乏吉星，建议尾号带有天医或延年磁场。')
    }
  }
  return r
}

const TYPE_COLORS: Record<string, string> = {
  '吉': 'bg-green-900/40 text-green-300 border-green-700',
  '平': 'bg-cyan-900/40 text-cyan-300 border-cyan-700',
  '凶': 'bg-red-900/40 text-red-300 border-red-700',
}

export default function ShumaClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const doAnalyze = useCallback(() => {
    const r = analyze(phone)
    setResult(r)
  }, [phone])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('shuma.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('shuma.desc', lang)}</p>

      {/* 输入 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <label className="block text-xs text-gray-400 mb-2">{tk('common.phone', lang)}</label>
        <div className="flex gap-2">
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="13800138000"
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 font-mono text-lg tracking-widest"
            maxLength={11} />
          <button onClick={doAnalyze}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95 whitespace-nowrap">
            {tk('common.submit', lang)}
          </button>
        </div>
      </div>

      {result && !result.valid && (
        <div className="bg-dark-800/80 rounded-xl border border-red-700/50 p-5">
          <p className="text-red-400">{result.error}</p>
        </div>
      )}

      {result?.valid && (
        <div className="space-y-5">
          {/* 综合评分 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">综合评分</p>
            <p className={`text-5xl font-bold ${result.overallScore >= 60 ? 'text-green-400' : result.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.overallScore}
            </p>
            <p className={`text-sm mt-2 font-semibold ${result.overallScore >= 60 ? 'text-green-400' : result.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.overall}
            </p>
          </div>

          {/* 号码分段分析 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">号码磁场分段</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-dark-600">
                    <th className="py-1 pr-2 text-left">位置</th>
                    <th className="py-1 px-2 text-left">数字</th>
                    <th className="py-1 px-2 text-left">磁场</th>
                    <th className="py-1 pl-2 text-left">吉凶</th>
                  </tr>
                </thead>
                <tbody>
                  {result.segments.map((s, i) => (
                    <tr key={i} className="border-b border-dark-700/50">
                      <td className="py-1.5 pr-2 text-gray-500">{s.position}-{s.position + 1}位</td>
                      <td className="py-1.5 px-2 font-mono text-gray-200">{String(s.pair).padStart(2, '0')}</td>
                      <td className="py-1.5 px-2 text-gray-200" style={s.fieldType !== '—' ? {color: FIELDS[s.fieldKey]?.color} : {}}>{s.fieldName}</td>
                      <td className="py-1.5 pl-2">
                        {s.fieldType !== '—' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[s.fieldType] || 'bg-dark-700 text-gray-400'}`}>
                            {s.fieldType}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 八星统计 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">八星磁场统计</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FIELD_LIST.map(f => {
                const count = result.fieldCounts[f.key] || 0
                return (
                  <div key={f.key} className="bg-dark-700 rounded-lg p-3 border border-dark-600">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{color: f.color}}>{f.name}</span>
                      <span className={`text-[10px] px-1 py-0.5 rounded ${TYPE_COLORS[f.type] || 'bg-dark-600'}`}>{f.type}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-100">{count}<span className="text-xs text-gray-500">次</span></p>
                    <p className="text-[10px] text-gray-500 mt-1">{f.keywords.join(' · ')}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 尾号分析 */}
          {result.tailAnalysis && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
              <h3 className="text-base font-semibold text-gray-200 mb-2">尾号分析</h3>
              <p className="text-sm text-gray-300">{result.tailAnalysis.text}</p>
            </div>
          )}

          {/* 亮点 */}
          {result.highlights.length > 0 && (
            <div className="bg-green-900/10 rounded-xl border border-green-700/30 p-5">
              <h3 className="text-sm font-semibold text-green-400 mb-2">✨ 亮点</h3>
              <ul className="space-y-1">
                {result.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-green-300/80 flex gap-2">
                    <span className="text-green-500">•</span>{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 警告 */}
          {result.warnings.length > 0 && (
            <div className="bg-red-900/10 rounded-xl border border-red-700/30 p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ 注意事项</h3>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-300/80 flex gap-2">
                    <span className="text-red-500">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 磁场详情 */}
          <details className="bg-dark-800/60 rounded-xl border border-dark-600 p-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">八星磁场详解</summary>
            <div className="mt-3 space-y-3">
              {FIELD_LIST.map(f => (
                <div key={f.key} className="bg-dark-700 rounded-lg p-3">
                  <p className="text-sm font-semibold mb-1" style={{color: f.color}}>{f.name}（{f.type}）</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.detail}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
