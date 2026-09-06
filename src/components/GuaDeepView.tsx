// 卦深度渲染组件（HexagramDeep 全字段——穷通宝鉴级详解视觉）
import type { HexagramDeep } from '@/data/gua/deep/schema'

function Sec({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-5 mb-5">
      <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2"><span>{icon}</span>{title}</h2>
      {children}
    </section>
  )
}

export default function GuaDeepView({ d }: { d: HexagramDeep }) {
  return (
    <div className="mt-2 space-y-5">
      {/* 卦德 */}
      <div className="rounded-xl bg-[#fdf9ee] dark:bg-[#1c1a13] border border-gold-200/60 dark:border-gold-500/20 p-4 mb-5">
        <p className="text-[11px] text-gold-600 dark:text-gold-400 font-medium mb-1">卦德</p>
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-serif">{d.jian}</p>
      </div>

      {/* 卦辞精解 */}
      <Sec icon="📜" title="卦辞精解">
        <ul className="space-y-2.5">{d.jingjie.map((j, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-gold-500 shrink-0">◆</span>{j}</li>)}</ul>
      </Sec>

      {/* 彖象精义 */}
      <Sec icon="🏛️" title="彖传精义">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.tuan}</p>
      </Sec>
      <Sec icon="🌄" title="大象传精义">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.xiang}</p>
      </Sec>

      {/* 爻位精析 */}
      <Sec icon="⚖️" title="爻位精析">
        <div className="space-y-2.5">
          {d.yaojing.map((y, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gold-500/10 text-gold-700 dark:text-gold-300">{y.yao}</span>
                <span className="text-xs text-gray-500 italic font-serif">{y.ci}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{y.jie}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* 错宗之卦 */}
      {d.cuozong && (
        <Sec icon="🔄" title="错 · 综 · 变">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-[10px] text-gray-400 mb-1">错卦（旁通·六爻全变）</p><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{d.cuozong.cuo}</p></div>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-[10px] text-gray-400 mb-1">综卦（覆卦·上下颠倒）</p><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{d.cuozong.zong}</p></div>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-[10px] text-gray-400 mb-1">之卦（爻动所变）</p><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{d.cuozong.bian}</p></div>
          </div>
        </Sec>
      )}

      {/* 六爻纳甲 */}
      <Sec icon="🔮" title="六爻/纳甲应用">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.liuyao}</p>
      </Sec>

      {/* 术数方位 */}
      <Sec icon="🧭" title="术数方位对应">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.shuwei}</p>
      </Sec>

      {/* 现代启示 */}
      <Sec icon="🌏" title="现代启示">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.xiandai}</p>
      </Sec>

      {/* 九宫按 */}
      <Sec icon="🧭" title="九宫按">
        <ul className="space-y-2">{d.jiugong.map((j, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-gold-500 shrink-0">✦</span>{j}</li>)}</ul>
      </Sec>
    </div>
  )
}
