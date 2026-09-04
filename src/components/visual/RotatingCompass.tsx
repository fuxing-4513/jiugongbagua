/**
 * RotatingCompass —— Hero 罗盘（多层旋转 SVG）
 * 图层（自外向内）：
 *   1. 外圈虚线光环（反向慢转 84s）
 *   2. 刻度圈（静止）：60 刻度，每 30° 主刻度加长
 *   3. 十二地支文字圈（静止，子正上）
 *   4. 八卦卦象圈 ☰☱☲☳☴☵☶☷（正转慢速 42s）
 *   5. 卦名圈 乾坤…（随卦象圈同转）
 *   6. 虚线轨道（反向 56s）+ 轨道星点
 *   7. 中心：渐变环 + ☯
 * 颜色全部消费 --jg-* 语义变量 → 白天星云紫系 / 夜晚金青紫赛博系自动切换。
 */
const TRIGRAMS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']
const BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 极坐标 → SVG 坐标：θ 为钟面角（0=正上，顺时针） */
function polar(cx: number, cy: number, r: number, thetaDeg: number) {
  const a = (thetaDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

export default function RotatingCompass({
  size = 420,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const C = 200
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0
    const p0 = polar(C, C, major ? 168 : 173, i * 6)
    const p1 = polar(C, C, 180, i * 6)
    return { ...p0, x1: p1.x, y1: p1.y, major }
  })

  return (
    <svg
      width={size}
      height={size}
      style={{ maxWidth: '100%', height: 'auto' }}
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="九宫八卦罗盘"
    >
      {/* 外圈虚线光环（反向慢转） */}
      <g className="jg-spin-slower" style={{ opacity: 0.8 }}>
        <circle
          cx={C}
          cy={C}
          r={192}
          fill="none"
          stroke="var(--jg-accent)"
          strokeWidth={1.2}
          strokeDasharray="1.5 7"
          opacity={0.7}
        />
        <circle
          cx={C}
          cy={C}
          r={192}
          fill="none"
          stroke="var(--jg-accent)"
          strokeWidth={6}
          strokeDasharray="2 600"
          opacity={0.16}
          strokeLinecap="round"
        />
      </g>

      {/* 刻度圈（静止） */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x}
          y1={t.y}
          x2={t.x1}
          y2={t.y1}
          stroke={t.major ? 'var(--jg-gold)' : 'var(--jg-text-2)'}
          strokeWidth={t.major ? 1.6 : 1}
          opacity={t.major ? 0.95 : 0.5}
        />
      ))}

      {/* 十二地支（静止，子正上、午正下、卯左、酉右） */}
      {BRANCHES.map((b, i) => {
        const p = polar(C, C, 186, i * 30)
        return (
          <text
            key={b}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            style={{ fill: 'var(--jg-text-2)', opacity: 0.95, fontFamily: 'var(--font-serif)' }}
          >
            {b}
          </text>
        )
      })}

      {/* 内圈：卦象 + 卦名 + 轨道（正转 42s） */}
      <g className="jg-spin-slow">
        {TRIGRAMS.map((g, i) => {
          const p = polar(C, C, 158, i * 45 - 90 + 22.5)
          return (
            <text
              key={g}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={24}
              style={{ fill: 'var(--jg-gold)', opacity: 0.92 }}
            >
              {g}
            </text>
          )
        })}
        {BAGUA_NAMES.map((n, i) => {
          const p = polar(C, C, 128, i * 45 - 90 + 22.5)
          return (
            <text
              key={n}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              style={{
                fill: 'var(--jg-text-2)',
                opacity: 0.9,
                fontFamily: 'var(--font-serif)',
              }}
            >
              {n}
            </text>
          )
        })}
        {/* 轨道星点（随内圈转） */}
        {[0, 90, 180, 270].map((a, i) => {
          const p = polar(C, C, 96, a + 8)
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i % 2 === 0 ? 2.6 : 2}
              fill={i % 2 === 0 ? 'var(--jg-gold)' : 'var(--jg-accent)'}
              opacity={0.95}
            />
          )
        })}
      </g>

      {/* 虚线轨道（反向 56s） */}
      <g className="jg-spin-rev" style={{ opacity: 0.75 }}>
        <circle
          cx={C}
          cy={C}
          r={96}
          fill="none"
          stroke="var(--jg-accent)"
          strokeWidth={1.3}
          strokeDasharray="40 26"
          opacity={0.55}
        />
      </g>

      {/* 中心：渐变环 + ☯ */}
      <circle
        cx={C}
        cy={C}
        r={50}
        fill="none"
        stroke="var(--jg-border-grad)"
        strokeWidth={2.4}
        opacity={0.85}
      />
      <circle cx={C} cy={C} r={40} fill="var(--jg-accent-soft)" opacity={0.55} />
      <text
        x={C}
        y={C + 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={40}
        style={{ fill: 'var(--jg-gold)' }}
      >
        ☯
      </text>
    </svg>
  )
}
