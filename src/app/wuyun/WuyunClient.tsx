'use client'

// 五运六气排盘：输入年份 → 中运/司天/在泉/主客气 + 健康白话
import { useState } from 'react'
import { computeWuyun } from '@/lib/wuyun-engine'
import Breadcrumb from '@/components/Breadcrumb'

const ELEM_COLOR: Record<string, string> = {
  '木': 'text-emerald-600 dark:text-emerald-300',
  '火': 'text-red-500 dark:text-red-300',
  '土': 'text-amber-600 dark:text-amber-300',
  '金': 'text-gray-500 dark:text-gray-300',
  '水': 'text-blue-600 dark:text-blue-300',
}

export default function WuyunClient() {
  const now = new Date().getFullYear()
  const [year, setYear] = useState(now)
  const [result, setResult] = useState<ReturnType<typeof computeWuyun> | null>(null)

  const run = () => {
    const y = Math.max(1900, Math.min(2100, Number(year) || now))
    setYear(y)
    setResult(computeWuyun(y))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '五运六气' }]} />
      <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 md:p-6 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">☯️ 五运六气</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          依《黄帝内经·素问》运气七篇：天干化五运定中运，地支化六气定司天在泉——推全年气候大势与养生要点。传统时间医学框架，供生活参考。
        </p>
        <div className="flex gap-3 items-end flex-wrap">
          <label className="text-xs text-gray-500 dark:text-gray-400">年份
            <input type="number" value={year} min={1900} max={2100} onChange={e => setYear(+e.target.value)}
              className="mt-1 w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <button onClick={run} className="py-2 px-5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 shadow-lg shadow-emerald-500/20">
            ☯️ 推演运气
          </button>
          {result && <p className="text-xs text-gray-400">当前显示 {result.year} 年（{result.ganzhi}年）</p>}
        </div>
      </div>

      {result && (
        <>
          {/* 三柱核心 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">🔄 中运（大运）· {result.tianGan}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                <span className={ELEM_COLOR[result.zhongYun.element]}>{result.zhongYun.element}</span>运{result.zhongYun.yinyang === '阳' ? '太过' : '不及'}
              </p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{result.zhongYun.desc}</p>
            </div>
            <div className="rounded-2xl border border-sky-200/60 dark:border-sky-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">☁️ 司天 · {result.diZhi}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{result.siTian.qi}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">主管上半年气候</p>
            </div>
            <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">🌊 在泉 · {result.diZhi}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{result.zaiQuan.qi}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">主管下半年气候</p>
            </div>
          </div>

          {/* 全年气候 */}
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">🌏 {result.year} 年气候大势</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.year} 年为{result.ganzhi}年（天干{result.tianGan}、地支{result.diZhi}）。
              中运为<strong className={ELEM_COLOR[result.zhongYun.element]}>{result.zhongYun.element}运{result.zhongYun.yinyang === '阳' ? '太过' : '不及'}</strong>，
              司天<strong>{result.siTian.qi}</strong>管上半年、在泉<strong>{result.zaiQuan.qi}</strong>管下半年。
              {result.yunDesc}
            </p>
          </div>

          {/* 六步气 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85 p-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📆 主气六步（固定）</h3>
              <div className="space-y-2">
                {result.zhuQi.map(q => (
                  <div key={q.step} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                    <span className="text-gray-400 w-6">{q.step}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{q.qi}</span>
                    <span className="text-gray-400">{q.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85 p-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🔄 客气六步（{result.year} 年）</h3>
              <div className="space-y-2">
                {result.keQi.map(q => {
                  const isSiTian = q.qi === result.siTian.qi
                  const isZaiQuan = q.qi === result.zaiQuan.qi
                  return (
                    <div key={q.step} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                      <span className="text-gray-400 w-6">{q.step}</span>
                      <span className={`font-medium flex-1 ${isSiTian ? 'text-sky-600 dark:text-sky-300' : isZaiQuan ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{q.qi}</span>
                      {isSiTian && <span className="text-[9px] bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded">司天</span>}
                      {isZaiQuan && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">在泉</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">客气随司天而变：三之气为司天（上半年主政），六之气为在泉（下半年主政）。</p>
            </div>
          </div>

          {/* 健康提示 */}
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">💚 {result.year} 年养生要点</h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.healthTips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">·</span>{t}</li>)}
            </ul>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">五运六气是古人对气候规律的宏观归纳，个体体质与当地气候差异更大——本文仅供健康生活参考，不替代医嘱。</p>
          </div>
        </>
      )}
      {/* ═══ 四季养生深度区（五运六气总核心——内经四气调神大论） ═══ */}
      <div className="mt-8">
        {/* 总纲 */}
        <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-gradient-to-b from-[#fdf9ee]/80 to-white/60 dark:from-[#1c1a13] dark:to-[#13161c] p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">🏛️ 五运六气养生 · 总核心</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            五运六气的养生观，浓缩为《黄帝内经·四气调神大论》一句总纲：<b className="text-gray-800 dark:text-gray-100">"夫四时阴阳者，万物之根本也。所以圣人春夏养阳，秋冬养阴，以从其根。"</b>
            天地之气随四季升降浮沉——春生、夏长、秋收、冬藏——人体气血也随之起伏。养生不是机械照搬，而是<b>顺着天时调自己的节奏</b>：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            {[
              ['🌱 春·养生发', '夜卧早起，广步于庭——让阳气像草木一样舒展开来，忌压抑情绪、久坐不动'],
              ['☀️ 夏·养长养', '夜卧早起，无厌于日——让气血充分宣泄，忌贪凉饮冷、空调房久待、大怒大汗'],
              ['🍂 秋·养收敛', '早卧早起，与鸡俱兴——让心神从外放转回内收，忌悲忧伤肺、辛辣过度'],
              ['❄️ 冬·养闭藏', '早卧晚起，必待日光——让阳气藏于内而不外泄，忌熬夜、剧烈大汗、房劳过度'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-3.5">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">{t}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            在此之上，五运六气再给一层"年运坐标"：某年中运太过/不及、司天在泉寒热——提醒该年哪一脏气偏旺、哪一气易伤。
            但它只描述<b>大气候的宏观倾向</b>，到了每个人身上，还要叠加自己的<b>五行旺衰与体质偏性</b>——这正是下方各季养生要"参考而非照搬"的原因。
          </p>
        </div>

        {/* 四季详析 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            {
              s: '春', icon: '🌱', name: '春季 · 养生发', months: '立春—立夏（寅卯辰月）',
              key: '肝木当令——宜疏不宜郁',
              items: ['起居：夜卧早起，晨起披发缓行、广步于庭，助阳气升发；忌赖床压住生发之气', '饮食：省酸增甘（少酸收、多甘缓）——韭菜、香椿、芽菜、葱蒜辛香升散之物助肝气条达；忌过食酸涩收敛', '情志：春忌怒也忌郁——怒则肝气横逆，郁则肝气不舒；多踏青赏花，让情绪"发芽"', '运动：宜舒展拉伸类——八段锦、散步、慢跑；忌剧烈大汗（汗为心液，春初阳气尚弱）', '经络：常敲胆经（大腿外侧）、按太冲穴（足背）疏肝理气；肝血不足者春易目涩、易怒', '易病提醒：春多风——防风邪袭表（感冒）、防肝木乘脾（腹胀腹泻）；旧疾肝病者春最需调护'],
            },
            {
              s: '夏', icon: '☀️', name: '夏季 · 养长养', months: '立夏—立秋（巳午未月）',
              key: '心火当令——宜泄不宜闭',
              items: ['起居：夜卧早起，无厌于日——适当出汗让阳气外达；忌空调房久待、汗出当风', '饮食：省苦增辛（少苦寒、佐辛散）——绿豆、冬瓜、西瓜清热利湿适量；忌贪凉饮冷伤脾阳（"夏吃姜"之理）', '情志：心主神明——夏忌大喜大悲，午间小憩养心神；心火旺者易口舌生疮、烦躁失眠', '运动：宜晨昏凉爽时运动，出微汗即可；忌大汗淋漓后猛灌冷饮（易猝发心疾）', '经络：按内关穴（宁心）、揉劳宫穴；长夏（未月）湿气重——配足三里健脾化湿', '易病提醒：暑湿困脾（食欲差、身体沉重）、心火与空调病、冬病夏治（三伏灸）正当时'],
            },
            {
              s: '秋', icon: '🍂', name: '秋季 · 养收敛', months: '立秋—立冬（申酉戌月）',
              key: '肺金当令——宜收不宜散',
              items: ['起居：早卧早起，与鸡俱兴——阳气内收，作息随之提前；忌熬夜耗肺阴', '饮食：省辛增酸（少辛辣发散、多酸甘润）——梨、百合、银耳、芝麻润肺防燥；忌辛辣烧烤（秋燥伤津）', '情志：秋主悲——肺志为忧，悲则气消；多登高望远、听舒缓音乐，收神敛气', '运动：宜缓——太极拳、静坐调息（"秋不运动大汗"——汗多伤津耗气）', '经络：按迎香穴（通鼻窍）、拍打肺经（手臂内侧）；秋燥咳嗽者注意润肺', '易病提醒：秋燥（干咳、皮肤痒、便秘）、过敏性鼻炎高发；"秋冻"宜适度——头颈腹背莫受凉'],
            },
            {
              s: '冬', icon: '❄️', name: '冬季 · 养闭藏', months: '立冬—立春（亥子丑月）',
              key: '肾水当令——宜藏不宜泄',
              items: ['起居：早卧晚起，必待日光——早睡养阴、晚起护阳；忌熬夜（冬夜最耗肾精）、忌晨起过猛', '饮食：省咸增苦（少咸伤肾、微苦坚阴）——羊肉、核桃、黑豆、山药温补；进补最佳季但须辨体质（虚不受补者先调脾胃）', '情志：冬主恐——肾志为恐，恐则气下；静神少虑，多晒太阳（补阳气抗抑郁）', '运动：宜室内温和运动（太极、八段锦）——微汗即止；忌大汗淋漓（"冬不汗泄"——汗出阳气外泄违闭藏）', '经络：揉涌泉穴（足底——补肾）、搓腰眼（肾俞——温肾阳）；手脚冰凉者冬前开始艾灸关元', '易病提醒：心脑血管病冬季高发（晨起血压高峰）、感冒风寒；冬至一阳生——重节气养藏'],
            },
          ].map(q => (
            <div key={q.s} className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{q.icon} {q.name}</h3>
              <p className="text-[10px] text-gray-400 mb-1">{q.months}</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">{q.key}</p>
              <ul className="space-y-2">
                {q.items.map((it, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2"><span className="text-emerald-500 shrink-0">·</span>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* 免责注（用户要求——醒目） */}
        <div className="rounded-2xl border border-amber-200/70 dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-500/5 p-5 text-center">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">⚖️ 以上养生要点<b>只作参考</b>——具体养生请根据<b>自身五行旺衰与体质</b>，在医师或专业人士指导下合理进行，不替代正规医疗建议。</p>
        </div>
      </div>
    </div>
  )
}
