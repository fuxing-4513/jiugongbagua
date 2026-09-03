/**
 * TaijiOrbit —— 太极光轨徽记（小尺寸装饰件）
 * 双轨道反向旋转 + 拖尾彗星点 + 中心 ☯ 呼吸辉光。
 * 消费 --jg-* 语义变量，双主题自适应。
 */
export default function TaijiOrbit({
  size = 96,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const C = 80
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label="太极光轨"
    >
      {/* 呼吸辉光底 */}
      <circle cx={C} cy={C} r={56} fill="var(--jg-accent-soft)" opacity={0.5} className="jg-pulse-soft" />

      {/* 外虚线环（反向） */}
      <circle
        cx={C}
        cy={C}
        r={74}
        fill="none"
        stroke="var(--jg-accent)"
        strokeWidth={1.2}
        strokeDasharray="2 9"
        opacity={0.6}
        className="jg-spin-rev"
      />

      {/* 轨道 + 彗星（正转） */}
      <g className="jg-orbit">
        <circle
          cx={C}
          cy={C}
          r={62}
          fill="none"
          stroke="var(--jg-gold)"
          strokeWidth={1.1}
          strokeDasharray="30 96"
          opacity={0.7}
        />
        <circle cx={C + 62} cy={C} r={3.2} fill="var(--jg-accent)" opacity={0.95} />
        <circle cx={C + 62} cy={C} r={7} fill="var(--jg-accent)" opacity={0.15} />
      </g>

      {/* 中心太极 */}
      <circle cx={C} cy={C} r={34} fill="none" stroke="var(--jg-border-grad)" strokeWidth={1.6} opacity={0.9} />
      <text
        x={C}
        y={C + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
        style={{ fill: 'var(--jg-gold)' }}
      >
        ☯
      </text>
    </svg>
  )
}
