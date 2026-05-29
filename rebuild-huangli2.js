const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, 'src', 'app', 'huangli', 'HuangliClient.tsx')
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')

// ─── 1. 节气表改为带描述的纵向列表 ───
// Find the solar terms section div and replace its inner content
// Strategy: find the whole section and replace it entirely

const oldSolarStart = '      {/* ═══════════ 二十四节气表 ═══════════ */}'
const oldSolarEnd = '      </div>\n\n      {/* ═══════════ 老黄历吉时查询 ═══════════ */}'
// Actually sections are swapped: 老黄历(538) → 节气(597)
// Let's just locate by the comment markers

const solarCommentIdx = c.indexOf('二十四节气表')
const sectionStart = c.lastIndexOf('      <div className="bg-white', solarCommentIdx)
const sectionEnd = c.indexOf('    </div>\n  )\n}', solarCommentIdx) > 0 
  ? c.indexOf('    </div>', solarCommentIdx) + 11  // length of </div>\n
  : c.indexOf('</>', solarCommentIdx)

console.log('Solar section:', sectionStart, '-', sectionEnd)

// Find the closing </div> of the solar section (the outer one)
const solarOuterEnd = c.indexOf('\n      </div>', sectionStart + 150)
console.log('Solar outer end at:', solarOuterEnd)

// Build the new solar terms section from scratch (no template strings in Node)
const newSolarPart = 
'      {/* ═══════════ 二十四节气表 ═══════════ */}\n' +
'      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">\n' +
'        <h2 className="text-base font-bold text-red-900 mb-1">二十四节气时间表</h2>\n' +
'        <p className="text-xs text-gray-400 mb-3">2026年 太阳到达黄经各节点 · 共24节气</p>\n' +
'        <div className="divide-y divide-gray-100">\n' +
'          {SOLAR_TERMS_2026.map((st, i) => {\n' +
'            const m = parseInt(st.date)\n' +
'            let se = \'\'\n' +
'            if (m >= 3 && m <= 5) se = \'春\'\n' +
'            else if (m >= 6 && m <= 8) se = \'夏\'\n' +
'            else if (m >= 9 && m <= 11) se = \'秋\'\n' +
'            else se = \'冬\'\n' +
'            const currentSeason = getSeasonForTerms(month)\n' +
'            return (\n' +
'              <div key={i} className={`flex items-start gap-3 py-3 px-2 rounded-lg ${se === currentSeason ? \'bg-red-50/50 -mx-0.5\' : \'\'} transition-colors`}>\n' +
'                <div className={`flex-shrink-0 w-14 h-12 rounded-lg flex flex-col items-center justify-center border ${se === \'春\' ? \'bg-green-50 border-green-200\' : se === \'夏\' ? \'bg-orange-50 border-orange-200\' : se === \'秋\' ? \'bg-amber-50 border-amber-200\' : \'bg-blue-50 border-blue-200\'}`}>\n' +
'                  <span className={`text-xs font-bold ${se === \'春\' ? \'text-green-700\' : se === \'夏\' ? \'text-orange-600\' : se === \'秋\' ? \'text-amber-700\' : \'text-blue-700\'}`}>{st.name}</span>\n' +
'                  <span className="text-[9px] text-gray-500">{st.date}</span>\n' +
'                </div>\n' +
'                <div className="flex-1 min-w-0">\n' +
'                  <div className="flex items-center gap-2 mb-0.5">\n' +
'                    <span className={`text-xs font-semibold ${se === \'春\' ? \'text-green-700\' : se === \'夏\' ? \'text-orange-600\' : se === \'秋\' ? \'text-amber-700\' : \'text-blue-700\'}`}>#{se}</span>\n' +
'                    <span className="text-[10px] text-gray-300">|</span>\n' +
'                    <span className="text-[10px] text-gray-400">{st.en}</span>\n' +
'                  </div>\n' +
'                  <p className="text-xs text-gray-600 leading-relaxed">{st.desc}</p>\n' +
'                </div>\n' +
'                <div className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full ${se === currentSeason ? \'bg-red-100 text-red-600 font-medium\' : \'\'}`}>\n' +
'                  {se === currentSeason ? \'● 当前\' : \'\'}\n' +
'                </div>\n' +
'              </div>\n' +
'            )\n' +
'          })}\n' +
'        </div>\n' +
'      </div>'

// Replace from solar start to next section start
const afterSolar = c.indexOf('      {/* ═══════════', solarCommentIdx + 10)
const actualSectionEnd = afterSolar > 0 ? afterSolar : c.length

const beforeSolar = c.substring(0, sectionStart)
const afterEverything = c.substring(actualSectionEnd)

c = beforeSolar + newSolarPart + '\n' + afterEverything
console.log('✅ Replaced solar terms section')

// ─── 2. 替换老黄历吉时表格为卡片网格 ───
const shiChenCommentIdx = c.indexOf('老黄历吉时查询')
const shiChenSectionStart = c.lastIndexOf('      <div className="bg-white', shiChenCommentIdx)
// Find the next section (节气 or end)
const shiChenSectionEnd = c.indexOf('      {/* ═══════════', shiChenCommentIdx + 5)

console.log('ShiChen section:', shiChenSectionStart, '-', shiChenSectionEnd)

const newShiChenPart = 
'      {/* ═══════════ 老黄历吉时查询 ═══════════ */}\n' +
'      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">\n' +
'        <h2 className="text-base font-bold text-red-900 mb-1">老黄历吉时查询</h2>\n' +
'        <p className="text-xs text-gray-400 mb-3">今日各时辰（子时→亥时）星神·冲煞·财神</p>\n' +
'        {(() => {\n' +
'          const shiChen = generateShiChen(data.ganZhiDay.charAt(0), data.ganZhiDay.charAt(1), data.dayOfYear)\n' +
'          return (\n' +
'            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">\n' +
'              {shiChen.map((sc, i) => (\n' +
'                <div key={i} className={`rounded-lg px-3 py-2 text-xs border ${sc.starGod.includes(\'吉\') ? \'bg-green-50/50 border-green-200/60\' : \'bg-red-50/30 border-red-200/50\'} hover:shadow-sm transition-shadow`}>\n' +
'                  <div className="flex items-center gap-1.5 mb-1">\n' +
'                    <span className="text-sm font-bold text-gray-800">{sc.name}</span>\n' +
'                    <span className="text-[10px] text-gray-400">{sc.timeRange}</span>\n' +
'                    <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sc.starGod.includes(\'吉\') ? \'bg-green-100 text-green-700\' : \'bg-red-100 text-red-600\'}`}>{sc.starGod.substring(0, 2)}</span>\n' +
'                  </div>\n' +
'                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-gray-500">\n' +
'                    <span>冲{sc.conflict}</span>\n' +
'                    <span>财神{sc.wealthGod}</span>\n' +
'                  </div>\n' +
'                  <div className="flex gap-2 mt-1 text-[10px]">\n' +
'                    <span className="text-green-700 line-clamp-1">{sc.suitable}</span>\n' +
'                    <span className="text-red-500 line-clamp-1">{sc.avoid}</span>\n' +
'                  </div>\n' +
'                </div>\n' +
'              ))}\n' +
'            </div>\n' +
'          )\n' +
'        })()}\n' +
'      </div>'

const beforeShiChen = c.substring(0, shiChenSectionStart)
const afterShiChen = c.substring(shiChenSectionEnd)

c = beforeShiChen + newShiChenPart + '\n' + afterShiChen
console.log('✅ Replaced shichen section')

fs.writeFileSync(file, c, 'utf8')
console.log('✅ Saved HuangliClient.tsx')
