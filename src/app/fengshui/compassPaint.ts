/**
 * compassPaint.ts —— 罗盘各层圆盘的 Canvas 2D 画师（纯 DOM 绘图，无 three 依赖）
 * 每层整圆盘满铺背景色（不透明），文字/纹样画在圆周带上。
 * 画布坐标系：x 右、y 下；方位角 0° = 画布正上方（北），顺时针增加。
 * 双主题：day = 象牙金属质感 / night = 深空金属 + 浅金文字。
 */

import { PALACES, MOUNTAINS_24 } from './luopan'

export type ThemeMode = 'day' | 'night'

export interface Palette {
  /** 盘面底色（自下而上逐层提亮/提浅） */
  plate: string // 底座刻度盘
  mount: string // 二十四山盘
  palace: string // 八卦宫盘
  tianchi: string // 天池盘
  /** 金银描边主色 */
  line: string
  /** 正文深色（24山/度数等主文字） */
  text: string
  /** 地支字色（强调） */
  zhi: string
  /** 天干字色 */
  gan: string
  /** 四维卦（乾坤艮巽）字色 */
  wei: string
  /** 八卦宫大字（卦名） */
  guaBig: string
  /** 八卦宫小字 */
  guaSub: string
  /** 向口高亮扇区填充（低透明金/暖色，扁平无光晕） */
  facingFill: string
  /** 向口指针 */
  needle: string
  /** 蚀刻细线（低透明，用于盘面刻纹） */
  engrave: string
  /** 顶部边缘小星点 */
  dot: string
}

export const PALETTES: Record<ThemeMode, Palette> = {
  day: {
    plate: '#f2ead3',
    mount: '#f6efdc',
    palace: '#faf4e5',
    tianchi: '#fdf9ee',
    line: '#a8892f',
    text: '#6f5416',
    zhi: '#7b4f12',
    gan: '#7d6b33',
    wei: '#7b5b1e',
    guaBig: '#75570f',
    guaSub: '#98824b',
    facingFill: 'rgba(196, 90, 60, 0.14)',
    needle: '#b3402f',
    engrave: 'rgba(130, 96, 24, 0.22)',
    dot: '#b08d2e',
  },
  night: {
    plate: '#101019',
    mount: '#14141f',
    palace: '#181824',
    tianchi: '#1d1d2b',
    line: '#c9a02c',
    text: '#e0c87e',
    zhi: '#f0d98a',
    gan: '#bcae79',
    wei: '#c4b5fd',
    guaBig: '#ecd27a',
    guaSub: '#a89a6a',
    facingFill: 'rgba(214, 150, 96, 0.18)',
    needle: '#e8735f',
    engrave: 'rgba(212, 175, 55, 0.28)',
    dot: '#e0c25a',
  },
}

const SERIF = '"Noto Serif SC","Songti SC","STSong",serif'

/** 圆盘半径（世界单位，1.0 = 该盘 mesh 半径） */
export const LAYER_RADII = {
  plate: 1.16,
  mount: 1.0,
  palace: 0.76,
  tianchi: 0.46,
}

function newCanvas(S: number): [CanvasRenderingContext2D, HTMLCanvasElement] {
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')
  if (!ctx) throw new Error('canvas 2d unavailable')
  return [ctx, cv]
}

/** 圆环辅助：f 为相对盘半径的比例（中心 0，边缘 1） */
function ring(
  ctx: CanvasRenderingContext2D,
  C: number,
  f: number,
  color: string,
  lw: number,
) {
  ctx.beginPath()
  ctx.arc(C, C, Math.max(0.5, f * C), 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.stroke()
}

function polar(C: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}

/** ── 盘 1：底座刻度盘（最下层，露出外圈环带） ── */
export function paintPlate(S: number, pal: Palette): HTMLCanvasElement {
  const [ctx, cv] = newCanvas(S)
  const C = S / 2
  // 整幅铺底：避免圆盘最外圈采样到透明像素出现发丝黑边
  ctx.fillStyle = pal.plate
  ctx.fillRect(0, 0, S, S)

  // 外缘双线描边
  ring(ctx, C, 0.992, pal.line, Math.max(2, S * 0.004))
  ring(ctx, C, 0.952, pal.engrave, Math.max(1, S * 0.002))
  // 内侧装饰线（露出部分）
  ring(ctx, C, 0.886, pal.engrave, Math.max(1, S * 0.002))
  ring(ctx, C, 0.872, pal.line, Math.max(1.4, S * 0.0022))

  // 360° 刻度：每 1° 细线，每 15° 中线，每 45° 长线
  for (let i = 0; i < 360; i++) {
    const major45 = i % 45 === 0
    const mid15 = i % 15 === 0
    const r1 = 0.905
    const r2 = major45 ? 0.945 : mid15 ? 0.93 : 0.918
    const [x1, y1] = polar(C, C * r1, i)
    const [x2, y2] = polar(C, C * r2, i)
    ctx.strokeStyle = major45 ? pal.line : mid15 ? pal.engrave : pal.engrave
    ctx.globalAlpha = major45 ? 0.95 : mid15 ? 0.75 : 0.45
    ctx.lineWidth = major45 ? Math.max(1.6, S * 0.0022) : 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // 45° 主刻度外的小菱形标记
  for (let k = 0; k < 8; k++) {
    const deg = k * 45
    const [x, y] = polar(C, C * 0.968, deg)
    const s = Math.max(2.4, S * 0.0036)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(((deg + 90) * Math.PI) / 180)
    ctx.fillStyle = pal.line
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.lineTo(s, 0)
    ctx.lineTo(0, s)
    ctx.lineTo(-s, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  return cv
}

/** ── 盘 2：二十四山文字盘（地支/天干/四维三色） ── */
export function paintMount24(S: number, pal: Palette): HTMLCanvasElement {
  const [ctx, cv] = newCanvas(S)
  const C = S / 2
  ctx.fillStyle = pal.mount
  ctx.fillRect(0, 0, S, S)

  // 内外刻圈
  ring(ctx, C, 0.988, pal.line, Math.max(1.6, S * 0.0028))
  ring(ctx, C, 0.962, pal.engrave, Math.max(1, S * 0.0016))
  ring(ctx, C, 0.774, pal.engrave, Math.max(1, S * 0.0018))
  ring(ctx, C, 0.75, pal.line, Math.max(1.2, S * 0.002))
  // 盘面细蚀刻（两层淡圆环增加金属感，不加阴影）
  ring(ctx, C, 0.92, pal.engrave, 0.8)
  ring(ctx, C, 0.86, pal.engrave, 0.6)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < 24; i++) {
    const m = MOUNTAINS_24[i]
    const deg = m.deg

    // 每山分隔短线（紧贴外圈内侧）
    const [tx1, ty1] = polar(C, C * 0.774, deg)
    const [tx2, ty2] = polar(C, C * 0.8, deg)
    ctx.strokeStyle = pal.engrave
    ctx.globalAlpha = m.kind === 'wei' ? 0.9 : 0.5
    ctx.lineWidth = m.kind === 'wei' ? 1.6 : 1
    ctx.beginPath()
    ctx.moveTo(tx1, ty1)
    ctx.lineTo(tx2, ty2)
    ctx.stroke()
    ctx.globalAlpha = 1

    // 二十四山字（沿圆周直立摆放，正北在上）
    const [x, y] = polar(C, C * 0.868, deg)
    const isZhi = m.kind === 'zhi'
    const isWei = m.kind === 'wei'
    ctx.fillStyle = isZhi ? pal.zhi : isWei ? pal.wei : pal.gan
    ctx.font = `700 ${Math.round(S * 0.037)}px ${SERIF}`
    ctx.fillText(m.ch, x, y)
  }
  return cv
}

/** ── 盘 3：八卦宫盘（8 宫扇区 + 卦名/卦符/星名，可高亮向口宫） ── */
export function paintPalace(S: number, pal: Palette, facingIdx: number): HTMLCanvasElement {
  const [ctx, cv] = newCanvas(S)
  const C = S / 2
  ctx.fillStyle = pal.palace
  ctx.fillRect(0, 0, S, S)

  // 向口宫高亮扇区（扁平低透明色块，铁律：无模糊光晕）
  if (facingIdx >= 0) {
    const a0 = (facingIdx * 45 - 22.5) * (Math.PI / 180)
    ctx.beginPath()
    ctx.moveTo(C, C)
    ctx.arc(C, C, C * 0.965, a0, a0 + Math.PI / 2)
    ctx.closePath()
    ctx.fillStyle = pal.facingFill
    ctx.fill()
  }

  // 宫分隔线 + 外圈
  for (let k = 0; k < 8; k++) {
    const a = k * 45
    const [x1, y1] = polar(C, C * 0.615, a)
    const [x2, y2] = polar(C, C * 0.965, a)
    ctx.strokeStyle = pal.engrave
    ctx.globalAlpha = k === facingIdx ? 0.95 : 0.6
    ctx.lineWidth = k === facingIdx ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  ring(ctx, C, 0.968, pal.line, Math.max(1.6, S * 0.0026))
  ring(ctx, C, 0.945, pal.engrave, 1)
  ring(ctx, C, 0.64, pal.engrave, 1)
  ring(ctx, C, 0.613, pal.line, Math.max(1.2, S * 0.0018))

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let k = 0; k < 8; k++) {
    const p = PALACES[k]
    const deg = k * 45
    const isFace = k === facingIdx

    // 卦名大字（外向）
    const [x1, y1] = polar(C, C * 0.885, deg)
    ctx.fillStyle = isFace ? pal.needle : pal.guaBig
    ctx.font = `700 ${Math.round(S * 0.055)}px ${SERIF}`
    ctx.fillText(p.name, x1, y1)

    // 卦符 · 方位 · 五行（中带）
    const [x2, y2] = polar(C, C * 0.785, deg)
    ctx.fillStyle = pal.guaSub
    ctx.font = `${Math.round(S * 0.02)}px ${SERIF}`
    ctx.fillText(`${p.sym} ${p.dir}·${p.wx}`, x2, y2)

    // 星名行（内带）
    const [x3, y3] = polar(C, C * 0.69, deg)
    ctx.fillStyle = isFace ? pal.needle : pal.guaSub
    ctx.font = `${Math.round(S * 0.0175)}px ${SERIF}`
    ctx.fillText(`${p.num}${p.starShort}·${p.star.replace(p.starShort, '')}`, x3, y3)
  }
  return cv
}

/** ── 盘 4：天池盘（指针指向向口方位） ── */
export function paintTianchi(S: number, pal: Palette, facingDeg: number): HTMLCanvasElement {
  const [ctx, cv] = newCanvas(S)
  const C = S / 2
  ctx.fillStyle = pal.tianchi
  ctx.fillRect(0, 0, S, S)

  ring(ctx, C, 0.9, pal.line, Math.max(1.4, S * 0.002))
  ring(ctx, C, 0.845, pal.engrave, 1)
  // 极细放射蚀刻纹（纯线条，低透明）
  for (let k = 0; k < 24; k++) {
    const a = k * 15
    const [x1, y1] = polar(C, C * 0.16, a)
    const [x2, y2] = polar(C, C * 0.72, a)
    ctx.strokeStyle = pal.engrave
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const a = facingDeg * (Math.PI / 180)
  const head = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len] as const
  }
  const hx = Math.sin(a)
  const hy = -Math.cos(a)

  // 尾针（浅，指向坐山）
  ctx.strokeStyle = pal.text
  ctx.globalAlpha = 0.5
  ctx.lineWidth = Math.max(1.6, S * 0.003)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(C - hx * C * 0.2, C - hy * C * 0.2)
  ctx.lineTo(C, C)
  ctx.stroke()

  // 主针（红，指向向口）
  ctx.strokeStyle = pal.needle
  ctx.globalAlpha = 1
  ctx.lineWidth = Math.max(3, S * 0.0055)
  ctx.beginPath()
  ctx.moveTo(C, C)
  ctx.lineTo(C + hx * C * 0.66, C + hy * C * 0.66)
  ctx.stroke()

  // 针头小菱形
  const [tx, ty] = head(hx, hy)
  const px = C + hx * C * 0.66
  const py = C + hy * C * 0.66
  const s = Math.max(3.4, S * 0.007)
  ctx.fillStyle = pal.needle
  ctx.beginPath()
  ctx.moveTo(px + tx * s * 1.8, py + ty * s * 1.8)
  ctx.lineTo(px - ty * s, py + tx * s)
  ctx.lineTo(px - tx * s * 1.8, py - ty * s * 1.8)
  ctx.lineTo(px + ty * s, py - tx * s)
  ctx.closePath()
  ctx.fill()

  // 中轴枢点
  ctx.strokeStyle = pal.line
  ctx.lineWidth = Math.max(1.2, S * 0.0018)
  ctx.beginPath()
  ctx.arc(C, C, Math.max(2, S * 0.006), 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineCap = 'butt'
  return cv
}

/** 画全部盘并返回画布（画布尺寸按层位：外圈大、内圈小，保证文字清晰） */
export type LayerKey = 'plate' | 'mount' | 'palace' | 'tianchi'
export interface PaintedLayers {
  plate: HTMLCanvasElement
  mount: HTMLCanvasElement
  palace: HTMLCanvasElement
  tianchi: HTMLCanvasElement
}
export function paintAll(
  pal: Palette,
  facingIdx: number,
  facingDeg: number,
): PaintedLayers {
  return {
    plate: paintPlate(1024, pal),
    mount: paintMount24(1536, pal),
    palace: paintPalace(1024, pal, facingIdx),
    tianchi: paintTianchi(1024, pal, facingDeg),
  }
}
