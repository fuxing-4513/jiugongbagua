#!/usr/bin/env python3
# 九宫时空盘 SVG 资产生成器（设计规格 22 项——9 层精工）
# 输出: public/assets/hero-time-wheel.svg (1200x1200)
import math, os

W = H = 1200
CX = CY = 600
GOLD = '#B08A3C'
GOLD_L = '#C9A85B'
INK = '#080B0C'
PAPER = '#F5F2EA'

def polar(r, deg):
    a = math.radians(deg - 90)
    return (CX + r * math.cos(a), CY + r * math.sin(a))

svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
svg.append(f'  <rect width="{W}" height="{H}" fill="{INK}"/>')

# ── Layer 01: 最外天象轨道（超细 0.5px + 断续刻度 + 星点）──
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="560" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.25" stroke-dasharray="2 6"/>')
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="552" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.18" stroke-dasharray="1 10"/>')
# 外圈 72 刻度（断续——每 5° 一点——opacity 交替）
for i in range(72):
    deg = i * 5
    r0, r1 = (548, 556) if i % 6 == 0 else ((549, 554) if i % 2 == 0 else (550, 553))
    p0, p1 = polar(r0, deg), polar(r1, deg)
    op = 0.5 if i % 6 == 0 else (0.25 if i % 2 == 0 else 0.12)
    svg.append(f'  <line x1="{p0[0]:.1f}" y1="{p0[1]:.1f}" x2="{p1[0]:.1f}" y2="{p1[1]:.1f}" stroke="{GOLD}" stroke-width="0.5" opacity="{op}"/>')
# 星点（随机感——固定伪随机 24 点）
import random
random.seed(7)
for _ in range(26):
    ang = random.uniform(0, 360)
    rr = random.uniform(500, 570)
    p = polar(rr, ang)
    sz = random.choice([0.8, 1.1, 1.4, 1.8])
    svg.append(f'  <circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{sz}" fill="{GOLD_L}" opacity="{random.uniform(0.15, 0.5):.2f}"/>')

# ── Layer 02: 九宫外轨（多环——粗细/透明度/虚实各不相同）──
rings = [
    (505, 0.5, 0.20, 'solid'), (498, 1.0, 0.16, 'dash'), (490, 0.5, 0.24, 'solid'),
    (462, 0.5, 0.20, 'solid'), (455, 1.2, 0.22, 'solid'), (448, 0.5, 0.15, 'dash2'),
]
for r, w, op, style in rings:
    d = ''
    if style == 'dash': d = ' stroke-dasharray="60 14"'
    if style == 'dash2': d = ' stroke-dasharray="3 8"'
    svg.append(f'  <circle cx="{CX}" cy="{CY}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="{w}" opacity="{op}"{d}/>')

# ── Layer 03: 八卦（沿圆周——重绘卦线——金色 1px 低亮度）──
# 卦象：乾☰ 兑☱(上缺) 离☲(中虚) 震☳(下虚? 实—虚—实底) 巽☴ 坎☵ 艮☶ 坤☷
# 以三爻线组绘制（每爻 = 短线段，视卦象虚实）
# 先天卦序（上南下北——乾南1 巽西南2 坎西3 艮西北4 坤北5 震东北6 离东7 兑东南8）
trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']
# 用 yáng 1 / yīn 0 表示三爻（上→下）：乾111 兑110 离101 震100 巽011 坎010 艮001 坤000
gua = {'☰': (1,1,1), '☱': (1,1,0), '☲': (1,0,1), '☳': (1,0,0), '☴': (0,1,1), '☵': (0,1,0), '☶': (0,0,1), '☷': (0,0,0)}
bagua_names = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
# 先天位（正上=南 乾——按传统上南下北图：乾上）
pos8 = ['☰', '☴', '☵', '☶', '☷', '☳', '☲', '☱']  # 南→西南→西→西北→北→东北→东→东南
name8 = ['乾', '巽', '坎', '艮', '坤', '震', '离', '兑']
svg.append(f'  <g id="bagua">')
for i, g in enumerate(pos8):
    deg = i * 45
    # 卦符中心在 r=472 圆周——卦三爻竖排（沿径向——爻线垂直于径向）
    # 每个卦画在局部：以中心点沿径向——三爻横向（每条爻是垂直径向的短横）
    c = polar(472, deg)
    # 径向角
    ang = math.radians(deg - 90)
    # 三爻：沿径向方向排列（从外到内）
    bits = gua[g]
    line_len = 26
    gap = 11
    for k, b in enumerate(bits):
        # 每爻沿径向偏移（外→内）
        off = (k - 1) * gap  # -1, 0, +1 → 靠近中心为正? 用 (1-k)*gap 外深内
        dist = 14 - k * gap  # 外爻 k=0 离中心远
        px = CX + math.cos(ang) * dist
        py = CY + math.sin(ang) * dist
        # 爻线垂直径向
        tx = -math.sin(ang) * (line_len / 2)
        ty = math.cos(ang) * (line_len / 2)
        if b == 1:  # 阳爻——整线
            svg.append(f'    <line x1="{px-tx:.1f}" y1="{py-ty:.1f}" x2="{px+tx:.1f}" y2="{py+ty:.1f}" stroke="{GOLD}" stroke-width="1" opacity="0.6"/>')
        else:  # 阴爻——断中（两段）
            seg = line_len * 0.32
            svg.append(f'    <line x1="{px-tx:.1f}" y1="{py-ty:.1f}" x2="{px-tx+tx*1.32:.1f}" y2="{py-ty+ty*1.32:.1f}" stroke="{GOLD}" stroke-width="1" opacity="0.6"/>')
            svg.append(f'    <line x1="{px+tx*1.32:.1f}" y1="{py+ty*1.32:.1f}" x2="{px+tx:.1f}" y2="{py+ty:.1f}" stroke="{GOLD}" stroke-width="1" opacity="0.6"/>')
    # 卦名（径向内侧——小字）
    pn = polar(442, deg)
    svg.append(f'    <text x="{pn[0]:.1f}" y="{pn[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="17" fill="{GOLD}" opacity="0.55" font-family="Noto Serif SC,serif">{name8[i]}</text>')
svg.append(f'  </g>')

# ── Layer 04: 九宫洛书（隐藏于盘内——极淡数——不是表格）──
# 洛书：4 9 2 / 3 5 7 / 8 1 6（上南下北——内圈四正四维极淡数字）
luoshu = [  # (value, r, deg)——5 中不用（太极居）
    (9, 386, 0), (4, 386, 45 - 22.5 * 0), (3, 386, 90), (8, 386, 135),
    (1, 386, 180), (6, 386, 225), (7, 386, 270), (2, 386, 315),
]
# 洛书九宫实际排布（上南下北）：南9 东南4 东3 东北8 北1 西北6 西7 西南2
luo = [(9, 0), (4, 45), (3, 90), (8, 135), (1, 180), (6, 225), (7, 270), (2, 315)]
svg.append(f'  <g id="luoshu" opacity="0.3">')
for v, deg in luo:
    p = polar(368, deg)
    svg.append(f'    <text x="{p[0]:.1f}" y="{p[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="15" fill="{GOLD_L}" opacity="0.4" font-family="Noto Serif SC,serif">{v}</text>')
# 九宫细格线（极淡方形——隐藏在圆盘内 320-420 区——低可见）
box = 340
svg.append(f'    <rect x="{CX-box/2}" y="{CY-box/2}" width="{box}" height="{box}" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.08"/>')
svg.append(f'  </g>')

# ── Layer 05: 天干地支（微字 8-12px——远看纹理近看体系）──
# 地支 12（外环 r=505 与 490 之间? 放 r=500 微字）
zhi12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
svg.append(f'  <g id="dizhi" opacity="0.6">')
for i, z in enumerate(zhi12):
    p = polar(497, i * 30)
    svg.append(f'    <text x="{p[0]:.1f}" y="{p[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="13" fill="{GOLD}" opacity="0.6" font-family="Noto Serif SC,serif">{z}</text>')
svg.append(f'  </g>')
# 天干 10（内圈 r=486?——与地支错位 15°?——地支外 干支内）
gan10 = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
svg.append(f'  <g id="tiangan" opacity="0.5">')
for i, g in enumerate(gan10):
    p = polar(470, i * 36 + 18)
    svg.append(f'    <text x="{p[0]:.1f}" y="{p[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="{GOLD}" opacity="0.5" font-family="Noto Serif SC,serif">{g}</text>')
svg.append(f'  </g>')

# ── Layer 06: 九星（极小字——r=430 附近）──
jiuxing = ['蓬', '芮', '冲', '辅', '禽', '心', '柱', '任', '英']
svg.append(f'  <g id="jiuxing" opacity="0.4">')
for i, x in enumerate(jiuxing):
    p = polar(428, i * 40 + 20)
    svg.append(f'    <text x="{p[0]:.1f}" y="{p[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="9.5" fill="{GOLD_L}" opacity="0.42" font-family="Noto Serif SC,serif">{x}</text>')
svg.append(f'  </g>')
# 八门（休生伤杜景死惊开——r=404 极小）
bamen = ['休', '生', '伤', '杜', '景', '死', '惊', '开']
svg.append(f'  <g id="bamen" opacity="0.5">')
for i, m in enumerate(bamen):
    p = polar(404, i * 45 + 22.5)
    svg.append(f'    <text x="{p[0]:.1f}" y="{p[1]:.1f}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="{GOLD}" opacity="0.5" font-family="Noto Serif SC,serif">{m}</text>')
svg.append(f'  </g>')

# 内轨圈（396/392/388 细分环）
for r, w, op, dash in [(396, 0.5, 0.18, None), (392, 0.8, 0.22, None)]:
    d = f' stroke-dasharray="{dash}"' if dash else ''
    svg.append(f'  <circle cx="{CX}" cy="{CY}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="{w}" opacity="{op}"{d}/>')

# ── Layer 07: 中央太极（克制——阴阳鱼 path + 微弱光晕 + 中心暖白）──
svg.append(f'  <defs>')
svg.append(f'    <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">')
svg.append(f'      <stop offset="0%" stop-color="{GOLD_L}" stop-opacity="0.32"/>')
svg.append(f'      <stop offset="55%" stop-color="{GOLD}" stop-opacity="0.10"/>')
svg.append(f'      <stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/>')
svg.append(f'    </radialGradient>')
svg.append(f'    <radialGradient id="coreWhite" cx="0.5" cy="0.5" r="0.5">')
svg.append(f'      <stop offset="0%" stop-color="{PAPER}" stop-opacity="0.85"/>')
svg.append(f'      <stop offset="100%" stop-color="{PAPER}" stop-opacity="0"/>')
svg.append(f'    </radialGradient>')
svg.append(f'  </defs>')
# 光晕
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="210" fill="url(#coreGlow)"/>')
# 太极外环
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="130" fill="none" stroke="{GOLD}" stroke-width="1" opacity="0.5"/>')
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="124" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.25" stroke-dasharray="1 5"/>')
# 太极主体（两 S 鱼——path 手绘: 用两半圆弧 + 鱼眼）
R = 120
svg.append(f'  <g id="taiji">')
# 阳鱼（白——上半部 S 曲线: 上外弧(右半圆) → 下内弧 → 鱼眼
svg.append(f'    <path d="M {CX} {CY-R} A {R} {R} 0 0 1 {CX} {CY+R} A {R/2} {R/2} 0 0 0 {CX} {CY} A {R/2} {R/2} 0 0 0 {CX} {CY-R} Z" fill="{PAPER}"/>')
# 阴鱼（黑——纸底上深——下半）: 上内弧 → 右下外弧
svg.append(f'    <path d="M {CX} {CY-R} A {R/2} {R/2} 0 0 1 {CX} {CY} A {R/2} {R/2} 0 0 1 {CX} {CY+R} A {R} {R} 0 0 1 {CX} {CY-R} Z" fill="#1a1c1d"/>')
# 鱼眼（阳鱼眼在黑? 阴中有阳——左眼白右眼黑——逆时针? 用简单: 白鱼黑眼 / 黑鱼白眼）
svg.append(f'    <circle cx="{CX}" cy="{CY-R/2:.0f}" r="17" fill="{INK}"/>')
svg.append(f'    <circle cx="{CX}" cy="{CY+R/2:.0f}" r="17" fill="{PAPER}"/>')
svg.append(f'  </g>')
# 中心暖白点
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="60" fill="url(#coreWhite)"/>')

# 底部微光地平线提示（淡化处理——倒影由 CSS 做）
svg.append(f'  <circle cx="{CX}" cy="{CY}" r="560" fill="none" stroke="none"/>')
svg.append(f'</svg>')

os.makedirs('public/assets', exist_ok=True)
with open('public/assets/hero-time-wheel.svg', 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg))
print('hero-time-wheel.svg 生成:', os.path.getsize('public/assets/hero-time-wheel.svg'), 'bytes')
