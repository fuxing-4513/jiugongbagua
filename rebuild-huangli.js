const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, 'src', 'app', 'huangli', 'HuangliClient.tsx')
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')

// ─── 1. 替换节气卡片网格为紧凑列表（带描述） ───
// 从 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1' 所在的节气块整体替换
const oldSolarBlockStart = `      {/* ═══════════ 二十四节气表 ═══════════ */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">二十四节气时间表</h2>
        <p className="text-[10px] text-gray-400 mb-2">{year}年 二十四节气</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
          {SOLAR_TERMS_2026.map((st, i) => {
            const m = parseInt(st.date)
            let se = ''
            if (m >= 3 && m <= 5) se = '春'
            else if (m >= 6 && m <= 8) se = '夏'
            else if (m >= 9 && m <= 11) se = '秋'
            else se = '冬'
            const seasonColors: Record<string,string> = {'春':'text-green-600','夏':'text-orange-500','秋':'text-amber-600','冬':'text-blue-600'}
            const currentSeason = getSeasonForTerms(month)
            return (
              <div key={i} className={`rounded-lg px-1.5 py-1 border text-[9px] leading-tight ${
                se === currentSeason ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'
              } transition-colors`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`font-bold text-[10px] ${
                    st.name === '春分' || st.name === '秋分' ? 'text-purple-700' :
                    st.name === '夏至' || st.name === '冬至' ? 'text-red-700' :
                    seasonColors[se]
                  }`}>{st.name}</span>
                  <span className="text-[8px] text-gray-400">{st.date}</span>
                </div>
                  <div className="mt-0.5">
                  <span className={`text-[7px] font-medium ${seasonColors[se]}`}>#{se}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>`

const newSolarBlock = `      {/* ═══════════ 二十四节气表 ═══════════ */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">二十四节气时间表</h2>
        <p className="text-xs text-gray-400 mb-3">{year}年 太阳到达黄经各节点 · 共24节气</p>
        <div className="divide-y divide-gray-100">
          {SOLAR_TERMS_2026.map((st, i) => {
            const m = parseInt(st.date)
            let se = ''
            if (m >= 3 && m <= 5) se = '春'
            else if (m >= 6 && m <= 8) se = '夏'
            else if (m >= 9 && m <= 11) se = '秋'
            else se = '冬'
            const seasonColors: Record<string,string> = {'春':'bg-green-50 border-green-200 text-green-700','夏':'bg-orange-50 border-orange-200 text-orange-600','秋':'bg-amber-50 border-amber-200 text-amber-700','冬':'bg-blue-50 border-blue-200 text-blue-700'}
            const currentSeason = getSeasonForTerms(month)
            return (
              <div key={i} className={\`flex items-start gap-3 py-2.5 px-1 \${se === currentSeason ? 'bg-red-50/40 -mx-1 px-2 rounded-lg' : ''}\`}>
                <div className={\`flex-shrink-0 w-16 h-10 rounded-lg \${seasonColors[se].split(' ')[0]} border \${seasonColors[se].split(' ')[1]} flex flex-col items-center justify-center\`}>
                  <span className={\`text-xs font-bold \${seasonColors[se].split(' ')[2]}\`}>{st.name}</span>
                  <span className="text-[9px] text-gray-500">{st.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={\`text-[10px] font-medium \${seasonColors[se].split(' ')[2]}\`}>#{se}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-500">{st.en}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{st.desc}</p>
                </div>
                <div className={\`flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full \${se === currentSeason ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}\`}>
                  {se === currentSeason ? '当前' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>`

if (c.includes(oldSolarBlockStart)) {
  c = c.replace(oldSolarBlockStart, newSolarBlock)
  console.log('✅ Replaced solar terms with detailed list')
} else {
  console.log('⚠️ oldSolarBlock not found, trying shortened match')
  // Find by partial match
  const idx = c.indexOf('二十四节气时间表')
  if (idx >= 0) console.log('Found at:', idx, c.substring(idx, idx+200))
}

// ─── 2. 吉时查询表：改为更紧凑的6列表格（合并"时宜/时忌"为"宜忌"一栏），宽度缩窄 ───
// Find the old shichen section and replace the table layout
const oldShiChenSection = `      {/* ═══════════ 老黄历吉时查询 ═══════════ */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">老黄历吉时查询</h2>
        <p className="text-[10px] text-gray-400 mb-2">今日各时辰吉凶·星神·冲煞·财神方位</p>
        {(() => {
          const shiChen = generateShiChen(data.ganZhiDay.charAt(0), data.ganZhiDay.charAt(1), data.dayOfYear)
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-red-50 text-gray-600">
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">时辰</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">时间</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">星神</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">冲煞</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">时宜</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">时忌</th>
                    <th className="px-1.5 py-1.5 text-left font-medium text-[10px]">财神</th>
                  </tr>
                </thead>
                <tbody>
                  {shiChen.map((sc, i) => (
                    <tr key={i} className={\`border-t border-gray-100 text-[10px] leading-tight \${sc.starGod.includes('吉')?'bg-green-50':'bg-red-50/30'}\`}>
                      <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap text-[11px]">{sc.name}</td>
                      <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap text-[11px]">{sc.timeRange}</td>
                      <td className={\`px-2 py-1.5 whitespace-nowrap text-[11px] \${sc.starGod.includes('吉')?'text-green-700':'text-red-600'}\`}>{sc.starGod}</td>
                      <td className="px-1.5 py-1 text-gray-400 text-[10px]">{sc.conflict}</td>
                      <td className="px-2 py-1.5 text-green-700 text-[11px]">{sc.suitable}</td>
                      <td className="px-2 py-1.5 text-red-500 text-[11px]">{sc.avoid}</td>
                      <td className="px-2 py-1.5 text-amber-600 font-medium whitespace-nowrap text-[11px]">{sc.wealthGod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
      </div>`

const newShiChenSection = `      {/* ═══════════ 老黄历吉时查询 ═══════════ */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">老黄历吉时查询</h2>
        <p className="text-xs text-gray-400 mb-3">今日各时辰（子时→亥时）星神·冲煞·财神</p>
        {(() => {
          const shiChen = generateShiChen(data.ganZhiDay.charAt(0), data.ganZhiDay.charAt(1), data.dayOfYear)
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {shiChen.map((sc, i) => (
                <div key={i} className={\`rounded-lg px-3 py-2 text-xs border \${sc.starGod.includes('吉') ? 'bg-green-50/40 border-green-100/60' : 'bg-red-50/30 border-red-100/50'} hover:shadow-sm transition-shadow\`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{sc.name}</span>
                    <span className="text-[10px] text-gray-400">{sc.timeRange}</span>
                    <span className={\`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full \${sc.starGod.includes('吉') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}\`}>{sc.starGod.replace(/（.*）/, '')}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
                    <span>冲{sc.conflict}</span>
                    <span>财神·{sc.wealthGod}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px]">
                    <span className="text-green-700">宜 {sc.suitable.substring(0, 8)}{sc.suitable.length > 8 ? '…' : ''}</span>
                    <span className="text-red-500">忌 {sc.avoid}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>`

if (c.includes(oldShiChenSection)) {
  c = c.replace(oldShiChenSection, newShiChenSection)
  console.log('✅ Replaced shichen table with grid cards')
} else {
  console.log('⚠️ oldShiChenSection not found')
  const idx = c.indexOf('老黄历吉时查询')
  if (idx >= 0) {
    console.log('Found at:', idx)
    // Show 200 chars around
    console.log(c.substring(idx - 50, idx + 300))
  }
}

fs.writeFileSync(file, c, 'utf8')
console.log('✅ Saved HuangliClient.tsx')
