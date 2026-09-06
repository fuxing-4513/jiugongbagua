'use client'

// 干支深度分析渲染（GanzhiDeep 全字段——十天干深度版）
import type { GanzhiDeep } from '@/data/ganzhi/deep/schema'

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-5 mb-5">
      <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2"><span>{icon}</span>{title}</h2>
      {children}
    </section>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700/50">{t}</span>)}
    </div>
  )
}

export default function GanzhiDeepView({ d }: { d: GanzhiDeep }) {
  return (
    <div className="mt-2 space-y-5">
      {/* 歌诀 */}
      {d.guge.length > 0 && (
        <Section icon="📜" title="经诀">
          {d.guge.map((g, i) => (
            <div key={i} className="mb-3 last:mb-0 rounded-xl bg-[#fdf9ee] dark:bg-[#1c1a13] border border-gold-200/60 dark:border-gold-500/20 p-4">
              <p className="text-[11px] text-gold-600 dark:text-gold-400 font-medium mb-1">{g.title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-serif">{g.text}</p>
            </div>
          ))}
        </Section>
      )}

      {/* 基础定位（表格式） */}
      {d.jichu.length > 0 && (
        <Section icon="🧭" title="基础定位">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {d.jichu.map((j, i) => (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-3">
                <div className="text-[10px] text-gray-400">{j.label}</div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">{j.value}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 性格两面 */}
      {d.xingge.ji.length > 0 && (
        <Section icon="🎭" title="性格两面">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-500/25 p-3.5">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 mb-2">✅ 得用之时</p>
              <ul className="space-y-1.5">{d.xingge.ji.map((x, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-1.5"><span className="text-emerald-500 shrink-0">·</span>{x}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-rose-200/60 dark:border-rose-500/25 p-3.5">
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-300 mb-2">❌ 无制之时</p>
              <ul className="space-y-1.5">{d.xingge.xiong.map((x, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-1.5"><span className="text-rose-500 shrink-0">·</span>{x}</li>)}</ul>
            </div>
          </div>
        </Section>
      )}

      {/* 核心喜忌 */}
      {d.xiji.length > 0 && (
        <Section icon="⚖️" title="核心喜忌（穷通宝鉴纲领）">
          <ul className="space-y-2">{d.xiji.map((x, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-gold-500 shrink-0">◆</span>{x}</li>)}</ul>
          {d.koujue && (
            <p className="mt-3 text-xs px-3 py-2 rounded-lg bg-gold-500/5 border border-gold-200/60 dark:border-gold-500/20 text-gold-700 dark:text-gold-300 font-medium">🔑 {d.koujue}</p>
          )}
        </Section>
      )}

      {/* 对比 */}
      {d.duibi && (
        <Section icon="🆚" title={d.duibi.title}>
          <p className="text-xs text-gray-400 mb-3">{d.duibi.desc}</p>
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                <th className="text-left px-3 py-2 font-medium">{d.duibi.items[0]?.label || '对比项'}</th>
                <th className="text-left px-3 py-2 font-medium">{d.duibi.items[0]?.a || ''}</th>
                <th className="text-left px-3 py-2 font-medium">{d.duibi.items[0]?.b || ''}</th>
              </tr></thead>
              <tbody>
                {d.duibi.items.slice(1).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2 text-gray-400">{r.label}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{r.a}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* 合冲刑害 */}
      {d.hechong.length > 0 && (
        <Section icon="🔗" title="合 · 冲 · 刑 · 害">
          {d.hechong.map((h, i) => (
            <div key={i} className="mb-2.5 last:mb-0 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">{h.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{h.text}</p>
            </div>
          ))}
        </Section>
      )}

      {/* 四时喜忌 */}
      {d.sishi.length > 0 && (
        <Section icon="🍂" title="四时喜忌">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {d.sishi.map((s, i) => (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-3.5">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">{s.season}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 万物类象 */}
      <Section icon="🌐" title="万物类象">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3 bg-[#fdf9ee] dark:bg-[#1c1a13] border border-gold-200/60 dark:border-gold-500/20 rounded-xl p-3.5">
          <span className="text-gold-600 dark:text-gold-400 font-medium">核心本义：</span>{d.wanxiang.benyi}
        </p>
        <div className="space-y-3.5">
          {[
            ['🔭 天时天象', d.wanxiang.tianshi], ['🗺️ 地理方位场所', d.wanxiang.dili],
            ['👤 人物类象', d.wanxiang.renwu], ['🩺 身体与疾病', d.wanxiang.shenti],
            ['🛠️ 器物静物', d.wanxiang.qiwu], ['🐾 动物', d.wanxiang.dongwu],
            ['🌿 植物', d.wanxiang.zhiwu], ['📜 事务抽象', d.wanxiang.shiwu],
          ].map(([label, arr]) => (
            <div key={label as string}>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
              <Tags items={arr as string[]} />
            </div>
          ))}
        </div>
      </Section>

      {/* 取象心法 */}
      {d.xinfa.length > 0 && (
        <Section icon="✨" title="关键取象心法（实战）">
          <ul className="space-y-2">{d.xinfa.map((x, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-gold-500 shrink-0">✦</span>{x}</li>)}</ul>
        </Section>
      )}
    </div>
  )
}
