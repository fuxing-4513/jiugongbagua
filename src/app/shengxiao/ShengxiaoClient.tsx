'use client'

import { useState } from 'react'
import { Solar } from 'lunar-typescript'

const ZODIACS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
const ZODIAC_WX: Record<string,string> = {'鼠':'水','牛':'土','虎':'木','兔':'木','龙':'土','蛇':'火','马':'火','羊':'土','猴':'金','鸡':'金','狗':'土','猪':'水'}
const ZODIAC_TRAITS: Record<string,string> = {
  '鼠':'聪明机敏，多才多艺。今年在事业上有较多机遇，财运平稳，感情方面桃花运不错。注意健康管理，劳逸结合。',
  '牛':'勤劳踏实，稳扎稳打。今年运势稳中有升，事业上宜把握固定收入，投资需谨慎。感情稳定，家庭和睦。',
  '虎':'勇猛果断，气势非凡。今年挑战与机遇并存，事业上有突破的契机，但需防小人。财运起伏较大，宜保守。',
  '兔':'温和善良，心思细腻。今年运势平稳向上，贵人运不错，事业上有新的合作机会。宜多关注人际关系。',
  '龙':'天生领袖，气度不凡。今年运势旺盛，事业上有大展宏图的机会，财运亨通。注意不要过于自负。',
  '蛇':'智慧深沉，善于谋划。今年运势起伏较大，宜静不宜动，事业上稳扎稳打为佳。财运平平，注意储蓄。',
  '马':'奔放热情，行动力强。今年运势上扬，事业上有远行之象，适合求变求新。财运不错，但开支也大。',
  '羊':'温柔善良，善解人意。今年运势平稳，事业上宜守不宜攻。财运尚可，感情方面有进展。注意肠胃健康。',
  '猴':'聪明灵活，应变力强。今年运势起伏变化，事业上有机遇也有挑战。财运不错，适合灵活投资。',
  '鸡':'勤勉守时，精明能干。今年运势平稳，事业上适合稳扎稳打，不宜冒进。财运稳定，家庭幸福。',
  '狗':'忠诚正直，责任心强。今年运势稳中有升，事业上得贵人相助。财运渐好，感情方面有喜事。',
  '猪':'宽厚诚实，福气深厚。今年运势亨通，事业上事事顺利，财运很好。感情美满，家庭和睦。',
}
const ZODIAC_YEARS: Record<string,number[]> = {
  '鼠':[2020,2008,1996,1984,1972,1960],'牛':[2021,2009,1997,1985,1973,1961],
  '虎':[2022,2010,1998,1986,1974,1962],'兔':[2023,2011,1999,1987,1975,1963],
  '龙':[2024,2012,2000,1988,1976,1964],'蛇':[2025,2013,2001,1989,1977,1965],
  '马':[2026,2014,2002,1990,1978,1966],'羊':[2027,2015,2003,1991,1979,1967],
  '猴':[2028,2016,2004,1992,1980,1968],'鸡':[2029,2017,2005,1993,1981,1969],
  '狗':[2030,2018,2006,1994,1982,1970],'猪':[2031,2019,2007,1995,1983,1971],
}

export default function ShengxiaoClient() {
  const [year, setYear] = useState('1990')
  const [result, setResult] = useState<any>(null)

  const calc = () => {
    const y = parseInt(year)
    if (!y) return
    const zodiacIdx = (y - 4) % 12
    const zodiac = ZODIACS[zodiacIdx >= 0 ? zodiacIdx : zodiacIdx + 12]
    const wx = ZODIAC_WX[zodiac]
    const traits = ZODIAC_TRAITS[zodiac]
    const luck = zodiac === '龙' || zodiac === '马' || zodiac === '猪' ? '上等' : zodiac === '鼠' || zodiac === '虎' || zodiac === '猴' ? '中上' : '中等'
    const luckyColors = wx === '金' ? '白色、金色' : wx === '木' ? '绿色、青色' : wx === '水' ? '黑色、蓝色' : wx === '火' ? '红色、紫色' : '黄色、棕色'
    const luckyNumbers = wx === '金' ? '4,9' : wx === '木' ? '3,8' : wx === '水' ? '1,6' : wx === '火' ? '2,7' : '5,10'
    // 三合
    const sanhe: Record<string,string> = {'鼠':'猴、龙','牛':'蛇、鸡','虎':'马、狗','兔':'猪、羊','龙':'鼠、猴','蛇':'牛、鸡','马':'虎、狗','羊':'兔、猪','猴':'鼠、龙','鸡':'牛、蛇','狗':'虎、马','猪':'兔、羊'}
    const xiangchong: Record<string,string> = {'鼠':'马','牛':'羊','虎':'猴','兔':'鸡','龙':'狗','蛇':'猪','马':'鼠','羊':'牛','猴':'虎','鸡':'兔','狗':'龙','猪':'蛇'}
    setResult({ zodiac, wx, traits, luck, luckyColors, luckyNumbers, sanhe: sanhe[zodiac], chong: xiangchong[zodiac] })
  }

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">生肖运势</h1>
    <p className="text-gray-400 mb-6">输入出生年份查看生肖属相与全年运势</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <div className="mb-4">
        <label className="text-xs text-gray-400 block mb-1">出生年份</label>
        <input type="number" value={year} onChange={e=>setYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" />
      </div>
      <button onClick={calc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看运势</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-4xl mb-1">{['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐏','🐵','🐔','🐶','🐷'][ZODIACS.indexOf(r.zodiac)]}</p>
        <p className="text-2xl font-bold text-gold-400">{r.zodiac}</p>
        <p className="text-xs text-gray-400">五行：{r.wx} · 运势：{r.luck}</p>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">全年运势</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{r.traits}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <p className="text-xs text-gray-400 mb-1">幸运色</p>
          <p className="text-sm text-gray-200">{r.luckyColors}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <p className="text-xs text-gray-400 mb-1">幸运数字</p>
          <p className="text-sm text-gray-200">{r.luckyNumbers}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <p className="text-xs text-gray-400 mb-1">三合贵人</p>
          <p className="text-sm text-gray-200">{r.sanhe}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <p className="text-xs text-gray-400 mb-1">相冲</p>
          <p className="text-sm text-gray-200">{r.chong}</p>
        </div>
      </div>
    </div>)}
  </div>)
}
