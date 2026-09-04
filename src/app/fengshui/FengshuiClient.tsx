'use client'

/**
 * 风水罗盘板块 —— 3D 立体罗盘（方案 B）
 * 功能：坐山/度数输入 → 八卦宫位 + 简版九宫飞星（五入中顺飞）+ 白话分析（财位/文昌/桃花）。
 * 昼夜双主题：day 深金 / night 亮金紫，dark: 前缀类 + 全局 CSS 变量自动翻转。
 */

import { useMemo, useState } from 'react'
import Compass3D from './Compass3D'
import {
  ZHI_12,
  PALACES,
  MOUNTAINS_24,
  STARS,
  NINE_GRID,
  analyzeFacing,
  normDeg,
  zhiAt,
  facingOfSitting,
  type Tone,
} from './luopan'

const PRESETS = [
  { z: '子', l: '坐北朝南' },
  { z: '午', l: '坐南朝北' },
  { z: '卯', l: '坐东朝西' },
  { z: '酉', l: '坐西朝东' },
]

/** 吉凶文字样式（昼夜显式配对） */
function toneCls(t: Tone): string {
  if (t === '吉') return 'text-gold-700 dark:text-gold-300'
  if (t === '凶') return 'text-zhuhong dark:text-rose-400'
  return 'text-gray-400'
}
function toneChipCls(t: Tone): string {
  if (t === '吉') return 'border-gold-500/40 bg-gold-500/10 text-gold-700 dark:border-gold-300/40 dark:bg-gold-300/10 dark:text-gold-300'
  if (t === '凶') return 'border-zhuhong/40 bg-zhuhong/10 text-zhuhong dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-400'
  return 'border-dark-500 bg-dark-700 text-gray-400 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-400'
}

export default function FengshuiClient() {
  const [facingStr, setFacingStr] = useState('180')
  const facingDeg = normDeg(Number.parseFloat(facingStr) || 0)
  const res = useMemo(() => analyzeFacing(facingDeg), [facingDeg])

  const pickSitting = (zhiCh: string) => {
    const z = ZHI_12.find((x) => x.ch === zhiCh)
    if (z) setFacingStr(String(facingOfSitting(z.deg)))
  }
  const sittingCh = zhiAt(facingOfSitting(facingDeg)).ch

  const p8 = PALACES.find((p) => p.num === 8)!
  const p4 = PALACES.find((p) => p.num === 4)!
  const p9 = PALACES.find((p) => p.num === 9)!

  const tips = [
    {
      icon: '🧧',
      title: `财位 · ${p8.dirFull}${p8.name}宫（八白）`,
      body: `本局五入中宫顺飞，当令财星「${p8.star}」落在${p8.dirFull}。${STARS[7].note}常用工位、收银台往${p8.dir}靠，比满屋摆招财物更实在。`,
    },
    {
      icon: '📖',
      title: `文昌 · ${p4.dirFull}${p4.name}宫（四绿）`,
      body: `本局「${p4.star}」落在${p4.dirFull}。${STARS[3].note}家里有读书考试的人，书桌朝${p4.dir}或把台灯移到这个角落，思路更顺。`,
    },
    {
      icon: '🌸',
      title: `人缘喜 · ${p9.dirFull}${p9.name}宫（九紫）`,
      body: `本局「${p9.star}」落在${p9.dirFull}。${STARS[8].note}想旺人缘与喜事，在${p9.dir}面放一盏常亮的暖光小灯就行，不必大红大紫堆满。`,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* 页头 */}
      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold-500/50 bg-gold-500/10 px-2.5 py-0.5 text-[11px] text-gold-700 dark:border-gold-300/40 dark:bg-gold-300/10 dark:text-gold-300">
            ✦ 真 3D 立体罗盘
          </span>
          <span className="rounded-full border border-dark-500 bg-dark-700 px-2.5 py-0.5 text-[11px] text-gray-400">
            拖拽盘面 · 任意角度
          </span>
        </div>
        <h1 className="mb-1 font-serif text-3xl font-bold text-gold-700 dark:text-gold-300">风水罗盘</h1>
        <p className="text-sm text-gray-400">立体二十四山罗盘 · 八卦宫位 · 九宫飞星（简版）白话解读</p>
      </header>

      {/* 主区：3D 罗盘 + 坐向输入 */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 3D 罗盘 */}
        <section className="rounded-2xl border border-dark-600 bg-dark-800/80 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-sm font-bold text-gold-700 dark:text-gold-300">立体罗盘</h2>
            <p className="text-[11px] text-gray-400">按住拖动旋转 · 滚轮缩放 · 红针指向向口</p>
          </div>
          <Compass3D facingDeg={facingDeg} />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
            盘分四层：外圈刻度 → 廿四山 → 八卦宫 → 天池指针；顶部红针所指即当前「向口」。
          </p>
        </section>

        {/* 坐向输入 + 宫位摘要 */}
        <section className="rounded-2xl border border-dark-600 bg-dark-800/80 p-4 sm:p-5">
          <h2 className="mb-1 font-serif text-sm font-bold text-gold-700 dark:text-gold-300">输入坐向</h2>
          <p className="mb-4 text-[11px] leading-relaxed text-gray-400">
            “坐”是背后靠山方向，“向”是正门面对的方向，两者永远相差 180°（0° = 正北）。
          </p>

          <label className="mb-1 block text-xs text-gray-400">坐山（十二地支）</label>
          <select
            value={sittingCh}
            onChange={(e) => pickSitting(e.target.value)}
            className="mb-3 w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-gray-200 focus:border-gold-500 focus:outline-none"
          >
            {ZHI_12.map((z) => (
              <option key={z.ch} value={z.ch}>
                {z.ch} · {z.deg}°（{z.wx}）
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs text-gray-400">或直接输入向口度数（0–360）</label>
          <input
            type="number"
            min={0}
            max={360}
            value={facingStr}
            onChange={(e) => setFacingStr(e.target.value)}
            onBlur={() => {
              if (facingStr.trim() === '' || Number.isNaN(Number(facingStr))) setFacingStr('180')
            }}
            placeholder="如 180 = 正南"
            className="mb-3 w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-gray-200 focus:border-gold-500 focus:outline-none"
          />

          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.z}
                onClick={() => pickSitting(p.z)}
                className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                  sittingCh === p.z
                    ? 'border-gold-500/70 bg-gold-500/10 text-gold-700 dark:border-gold-300/60 dark:bg-gold-300/10 dark:text-gold-300'
                    : 'border-dark-600 bg-dark-700 text-gray-400 hover:border-gold-500/50'
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>

          {/* 坐向摘要 */}
          <div className="mb-3 rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 dark:border-gold-300/30 dark:bg-gold-300/10">
            <p className="font-serif text-lg font-bold text-gold-700 dark:text-gold-300">
              坐{res.sittingZhi.ch} 朝{res.facingZhi.ch}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              向口 {res.facingDeg}° · {res.facingPalace.dirFull}（{res.facingPalace.name}宫）
            </p>
            <p className="text-[11px] text-gray-400">
              廿四山：坐{res.sittingMountain.ch}山 → 向{res.facingMountain.ch}山
            </p>
          </div>

          {/* 坐宫 / 向宫 */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { tag: '坐山宫', p: res.sittingPalace, cls: 'border-jade-500/50 dark:border-jade-400/60' },
              { tag: '向口宫', p: res.facingPalace, cls: 'border-gold-500/60 dark:border-gold-300/60' },
            ].map(({ tag, p, cls }) => (
              <div key={tag} className={`rounded-xl border bg-dark-700/70 p-3 ${cls}`}>
                <p className="text-[10px] text-gray-400">{tag} · {p.dirFull}</p>
                <p className="font-serif text-xl font-bold text-gold-700 dark:text-gold-300">
                  {p.sym} {p.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {p.wx} · 洛书{p.num} · {p.fam} · 为{p.attr}
                </p>
                <p className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] ${toneChipCls(p.tone)}`}>
                  {p.star}（{p.tone}）
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 九宫飞星 */}
      <section className="mt-5 rounded-2xl border border-dark-600 bg-dark-800/80 p-4 sm:p-6">
        <h2 className="font-serif text-sm font-bold text-gold-700 dark:text-gold-300">简版九宫飞星 · 五入中顺飞</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
          起盘：五黄入中宫，按洛书轨迹顺飞（中 → 乾 → 兑 → 艮 → 离 → 坎 → 坤 → 震 → 巽），星随宫定。
          下图即本局的星位布列 —— 金框是你的向口宫，玉框是坐山宫。
        </p>
        <div className="mx-auto mt-4 grid w-full max-w-[400px] grid-cols-3 gap-1.5">
          {NINE_GRID.flat().map((cell) => {
            const isFace = cell.palace !== null && cell.palace.deg === res.facingPalace.deg
            const isSit = cell.palace !== null && cell.palace.deg === res.sittingPalace.deg
            const border = isFace
              ? 'border-2 border-gold-500 bg-gold-500/10 dark:border-gold-300 dark:bg-gold-300/10'
              : isSit
                ? 'border-2 border-jade-500 bg-jade-500/10 dark:border-jade-400 dark:bg-jade-400/10'
                : 'border border-dark-600 bg-dark-700/60 dark:border-dark-600'
            return (
              <div key={cell.key} className={`relative flex aspect-square flex-col items-center justify-center rounded-xl p-1 text-center ${border}`}>
                {cell.palace ? (
                  <>
                    <p className="text-[10px] text-gray-400">
                      {isFace ? '◈' : isSit ? '◇' : ''} {cell.palace.sym} {cell.palace.name}·{cell.palace.dir}
                    </p>
                    <p className={`font-serif text-xl font-bold sm:text-2xl ${toneCls(cell.tone)}`}>{cell.num}</p>
                    <p className={`text-[10px] ${toneCls(cell.tone)}`}>{cell.starShort}·{cell.palace.star.replace(cell.palace.starShort, '')}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-gray-400">中宫</p>
                    <p className={`font-serif text-xl font-bold sm:text-2xl ${toneCls(cell.tone)}`}>5</p>
                    <p className="text-[10px] text-gray-400">五黄廉贞（枢纽）</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-gray-400">图例：◈ 金框 = 向口宫 · ◇ 玉框 = 坐山宫</p>
      </section>

      {/* 白话分析 */}
      <section className="mt-5 rounded-2xl border border-dark-600 bg-dark-800/80 p-4 sm:p-6">
        <h2 className="font-serif text-sm font-bold text-gold-700 dark:text-gold-300">白话分析</h2>
        <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-gray-400">
          <p>
            <span className="font-semibold text-gold-700 dark:text-gold-300">向口：</span>
            {res.facingBlurb}
          </p>
          <p>
            <span className="font-semibold text-jade-500 dark:text-jade-400">坐山：</span>
            {res.sittingBlurb}
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {tips.map((t) => (
            <div key={t.title} className="rounded-xl border border-dark-600 bg-dark-700/60 p-3.5">
              <p className="mb-1.5 text-xs font-bold text-gold-700 dark:text-gold-300">
                {t.icon} {t.title}
              </p>
              <p className="text-[11px] leading-relaxed text-gray-400">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
          ※ 本页为入门参考：简版按“五入中顺飞”固定布列，未叠加元运旺衰与流年飞星；
          真要布局宅运，还要结合房子的坐向旺衰、周边峦头与当年星盘综合看，勿据此做投资等重大决定。
        </p>
      </section>

      {/* 罗盘基础对照 */}
      <details className="mt-5 rounded-2xl border border-dark-600 bg-dark-800/80 p-4 open:pb-5">
        <summary className="cursor-pointer text-sm font-semibold text-gold-700 dark:text-gold-300">
          罗盘入门：八卦宫与度数对照（点开查看）
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PALACES.map((p) => {
            const lo = normDeg(p.deg - 22.5)
            const hi = normDeg(p.deg + 22.5)
            return (
              <div key={p.name} className="flex items-center justify-between rounded-lg border border-dark-600 bg-dark-700/50 px-3 py-1.5 text-xs">
                <span className="text-gray-400">
                  {p.sym} <b className="text-gold-700 dark:text-gold-300">{p.name}</b> · {p.dirFull}
                </span>
                <span className="text-gray-400">
                  {lo}°–{hi}° · 五行{p.wx} · {p.num}{p.starShort}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          罗盘一圈 360° 分 24 格，每格 15° 即“二十四山”：四正子午卯酉、四维乾坤艮巽，其余为天干地支相间（
          {MOUNTAINS_24.map((m) => m.ch).join(' ')}）。红线针所指的山，就是盘面上对应的向口。
        </p>
      </details>

      {/* 八卦详表（保留旧页信息） */}
      <section className="mt-5 rounded-2xl border border-dark-600 bg-dark-800/80 p-4 sm:p-5">
        <h2 className="mb-3 font-serif text-sm font-bold text-gold-700 dark:text-gold-300">八卦详表</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PALACES.map((g) => (
            <div key={g.name} className="rounded-xl border border-dark-600 bg-dark-700/60 p-2.5 text-center">
              <p className="text-lg leading-none">{g.sym}</p>
              <p className="mt-1 text-sm font-bold text-gold-700 dark:text-gold-300">{g.name} · {g.dir}</p>
              <p className="text-[10px] text-gray-400">
                {g.wx} · 洛书{g.num} · {g.starShort} · {g.fam}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          洛书数与九星：坎一白、坤二黑、震三碧、巽四绿、中五黄、乾六白、兑七赤、艮八白、离九紫 ——
          这是罗盘与飞星都绕不开的底图，数字顺序即顺飞轨迹。
        </p>
      </section>
    </div>
  )
}
