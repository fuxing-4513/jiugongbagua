#!/usr/bin/env python3
# Hero 山水背景资产生成器（规格 14/15——5 层山 + 雾 + 水面 + 金色光源）
# 输出: public/assets/hero-mountain.svg (1600x900)
import math, random

W, H = 1600, 900
svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">')
svg.append('  <defs>')
# 天空渐变（规格 15：天空顶 #050708 → 中 #0B1011 → 山际 #111717）
svg.append('    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">')
svg.append('      <stop offset="0%" stop-color="#050708"/>')
svg.append('      <stop offset="52%" stop-color="#0B1011"/>')
svg.append('      <stop offset="100%" stop-color="#111717"/>')
svg.append('    </linearGradient>')
# 水面（底部 #070C0D）
svg.append('    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">')
svg.append('      <stop offset="0%" stop-color="#0d1416"/>')
svg.append('      <stop offset="100%" stop-color="#070C0D"/>')
svg.append('    </linearGradient>')
# 金色天光（右上——radial 大柔光）
svg.append('    <radialGradient id="skyglow" cx="0.72" cy="0.06" r="0.6">')
svg.append('      <stop offset="0%" stop-color="rgba(176,138,60,0.25)"/>')
svg.append('      <stop offset="45%" stop-color="rgba(176,138,60,0.07)"/>')
svg.append('      <stop offset="100%" stop-color="rgba(176,138,60,0)"/>')
svg.append('    </radialGradient>')
# 雾
svg.append('    <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">')
svg.append('      <stop offset="0%" stop-color="rgba(245,242,234,0)"/>')
svg.append('      <stop offset="50%" stop-color="rgba(245,242,234,0.06)"/>')
svg.append('      <stop offset="100%" stop-color="rgba(245,242,234,0)"/>')
svg.append('    </linearGradient>')
svg.append('  </defs>')

# 天空
svg.append(f'  <rect width="{W}" height="{H}" fill="url(#sky)"/>')
# 星光（极淡——上部）
random.seed(11)
for _ in range(70):
    x = random.uniform(0, W)
    y = random.uniform(0, H * 0.42)
    r = random.uniform(0.4, 1.1)
    op = random.uniform(0.05, 0.2)
    svg.append(f'  <circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="#C9A85B" opacity="{op:.2f}"/>')
# 金色天光
svg.append(f'  <rect width="{W}" height="{H}" fill="url(#skyglow)"/>')

# 山脊生成（5 层——景深 opacity .22/.4/.7/.95/1——山体色随层变亮）
# 山体色：远山 #0d1213 → 近 #151a1a → 主山 #1a2020 高光 #34352F
def ridge(y_base, amp, seed, color, op, n=14, blur=0):
    random.seed(seed)
    pts = []
    for i in range(n + 1):
        x = i * W / n
        y = y_base - random.uniform(0, amp)
        # 平滑
        if i == 0 or i == n:
            y = y_base
        pts.append((x, y))
    # 简化锯齿：直线段山脊（加中间点让山形起伏）
    d = f'M 0 {H} '
    px, py = 0, y_base
    for i in range(1, len(pts)):
        x, y = pts[i]
        mx = (px + x) / 2
        my = (py + y) / 2 - random.uniform(amp * 0.15, amp * 0.4)
        d += f'Q {mx} {my} {x} {y} '
        px, py = x, y
    d += f'L {W} {H} Z'
    f_b = f' filter="url(#blur{blur})"' if blur else ''
    svg.append(f'  <path d="{d}" fill="{color}" opacity="{op}"{f_b}/>')

# 远山（低 opacity 高起）
svg.append(f'  <filter id="blur1"><feGaussianBlur stdDeviation="6"/></filter>')
svg.append(f'  <filter id="blur2"><feGaussianBlur stdDeviation="3"/></filter>')
ridge(H * 0.30, H * 0.10, 3, '#0e1517', 0.22, blur=1)
ridge(H * 0.42, H * 0.13, 5, '#111819', 0.38, blur=1)
ridge(H * 0.55, H * 0.16, 9, '#141b1c', 0.6, blur=2)
# 主山（右侧高——支持时空盘后景——近左下）
ridge(H * 0.68, H * 0.18, 17, '#171e1e', 0.85)
# 前景山（最暗近——底部边缘）
ridge(H * 0.82, H * 0.10, 23, '#0c1011', 1)

# 雾带（山腰）
svg.append(f'  <rect x="0" y="{H*0.45:.0f}" width="{W}" height="{H*0.16}" fill="url(#fog)" opacity="0.7"/>')
svg.append(f'  <rect x="0" y="{H*0.62:.0f}" width="{W}" height="{H*0.12}" fill="url(#fog)" opacity="0.5"/>')

# 水面（底部 18%）
WH = H * 0.82
svg.append(f'  <rect x="0" y="{WH:.0f}" width="{W}" height="{H-WH:.0f}" fill="url(#water)"/>')
# 水面金反光（细线横纹——模拟波纹）
svg.append(f'  <g opacity="0.5">')
random.seed(31)
for i in range(26):
    y = WH + 8 + i * (H - WH) / 26
    x0 = random.uniform(W * 0.25, W * 0.55)
    x1 = x0 + random.uniform(60, 240)
    op = random.uniform(0.05, 0.16)
    svg.append(f'    <line x1="{x0:.0f}" y1="{y:.0f}" x2="{x1:.0f}" y2="{y:.0f}" stroke="#B08A3C" stroke-width="0.7" opacity="{op:.2f}"/>')
svg.append(f'  </g>')
svg.append(f'</svg>')

import os
os.makedirs('public/assets', exist_ok=True)
with open('public/assets/hero-mountain.svg', 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg))
print('hero-mountain.svg 生成:', os.path.getsize('public/assets/hero-mountain.svg'), 'bytes')
