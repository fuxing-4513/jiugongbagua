// 生成第二批古籍示意图：撼龙经星峰/葬书形势/山海经九尾狐/五运六气环
const fs = require('fs')
const path = require('path')
const mk = (d) => { const p = path.join('public/images/xueguan', d); fs.mkdirSync(p, { recursive: true }); return p }

// ===== 撼龙经：九星峰形线描 =====
const peak = (title, desc, pathd, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="240" height="208">
<text x="150" y="24" text-anchor="middle" font-size="16" fill="#5a4632" font-family="serif" font-weight="bold">${title}</text>
<path d="${pathd}" fill="none" stroke="#8c6d1f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
${extra}
<text x="150" y="244" text-anchor="middle" font-size="12" fill="#6b5b43" font-family="serif">${desc}</text>
</svg>`
// 贪狼：尖笋状（一峰独秀）
fs.writeFileSync(path.join(mk('hanlong-jing'), 'tanlang-tu.svg'), peak('贪狼星峰', '贪狼顿起笋生峰 · 一峰独秀，形如竹笋', 'M80,220 L150,60 L220,220', '<ellipse cx="150" cy="60" rx="3" ry="8" fill="#8c6d1f"/><path d="M150,75 q-25,60 -60,130" fill="none" stroke="#c9b37e" stroke-width="1.5"/><path d="M150,75 q25,60 60,130" fill="none" stroke="#c9b37e" stroke-width="1.5"/>'))
// 九星行龙全图：九龙走势
fs.writeFileSync(path.join(mk('hanlong-jing'), 'jiuxing-xinglong-tu.svg'), peak('九星行龙全图', '贪巨禄文廉武破辅弼——九星各备其形，行龙起伏', 'M20,150 q30,-80 70,-40 q40,40 80,0 q30,-30 60,10 q30,40 70,-10', '<circle cx="90" cy="115" r="3" fill="#8c6d1f"/><circle cx="170" cy="105" r="3" fill="#8c6d1f"/><circle cx="250" cy="130" r="3" fill="#8c6d1f"/>'))
// 贪狼行龙：连峰
fs.writeFileSync(path.join(mk('hanlong-jing'), 'tanlang-singlong.svg'), peak('贪狼行龙', '行龙连峰耸起 · 如顿笋列阵，势雄力厚', 'M40,200 L60,90 L85,200 M95,200 L118,60 L145,200 M155,200 L180,85 L205,200', ''))
// 武曲行龙：圆峰连珠
fs.writeFileSync(path.join(mk('hanlong-jing'), 'wuqu-singlong.svg'), peak('武曲行龙', '星峰圆净如覆钟 · 行龙端正，金水相生', 'M30,190 Q60,90 100,190 M110,190 Q145,70 185,190 M195,190 Q230,90 265,190', '<ellipse cx="100" cy="150" rx="4" ry="3" fill="none" stroke="#8c6d1f"/><ellipse cx="185" cy="140" rx="4" ry="3" fill="none" stroke="#8c6d1f"/>'))
// 廉贞行龙：石棱参差
fs.writeFileSync(path.join(mk('hanlong-jing'), 'lianzhen-singlong.svg'), peak('廉贞行龙', '廉贞石棱森列 · 尖峰如锯齿，为权星之祖', 'M30,200 L55,80 L80,200 M90,200 L118,70 L145,200 M155,200 L180,90 L205,200 M215,200 L238,75 L262,200', ''))

// ===== 葬书：形势/四象/五害 =====
const zsDir = mk('zang-shu')
// 形势图：龙穴砂水格局（俯视）
fs.writeFileSync(path.join(zsDir, 'xingshi-tu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" width="336" height="240">
<text x="210" y="24" text-anchor="middle" font-size="16" fill="#5a4632" font-family="serif" font-weight="bold">葬书 · 形势格局图</text>
<text x="60" y="60" font-size="13" fill="#3a6ea5" font-family="serif">青龙（左砂）</text>
<text x="300" y="60" text-anchor="end" font-size="13" fill="#b85450" font-family="serif">白虎（右砂）</text>
<path d="M210,40 q-50,60 -30,120 q10,25 40,20" fill="none" stroke="#3a6ea5" stroke-width="6" stroke-linecap="round"/>
<path d="M210,40 q50,60 30,120 q-10,25 -40,20" fill="none" stroke="#b85450" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="210" cy="185" rx="52" ry="36" fill="#fdf6e3" stroke="#b08d2e" stroke-width="2.5"/>
<text x="210" y="190" text-anchor="middle" font-size="13" fill="#8c6d1f" font-family="serif">穴位</text>
<text x="210" y="95" text-anchor="middle" font-size="14" fill="#3d2f1d" font-family="serif">来龙（玄武垂头）</text>
<text x="210" y="252" text-anchor="middle" font-size="12.5" fill="#3d7a3d" font-family="serif">明堂 · 水抱（朱雀翔舞）</text>
<path d="M120,270 q90,10 180,0" fill="none" stroke="#3a6ea5" stroke-width="3"/>
<path d="M180,268 q30,30 60,0" fill="none" stroke="#3a6ea5" stroke-width="2"/>
<text x="60" y="285" font-size="11" fill="#8a7a5e" font-family="serif">左水右抱 · 龙虎环护 · 藏风聚气</text>
</svg>`)
// 四象图
fs.writeFileSync(path.join(zsDir, 'sixiang-tu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="320" height="208">
<text x="200" y="26" text-anchor="middle" font-size="16" fill="#5a4632" font-family="serif" font-weight="bold">四象（四势）吉格</text>
<text x="200" y="58" text-anchor="middle" font-size="13.5" fill="#3d2f1d" font-family="serif">玄武垂头（后有靠）</text>
<path d="M160,80 q40,-12 80,0" fill="none" stroke="#8c6d1f" stroke-width="2.5" stroke-linecap="round"/>
<text x="90" y="120" text-anchor="middle" font-size="13" fill="#3a6ea5" font-family="serif">青龙蜿蜒</text>
<text x="310" y="120" text-anchor="middle" font-size="13" fill="#b85450" font-family="serif">白虎驯俯</text>
<path d="M120,100 q-10,60 80,60 q90,0 80,-60" fill="none" stroke="#b08d2e" stroke-width="2.5" stroke-linecap="round"/>
<text x="200" y="200" text-anchor="middle" font-size="13" fill="#3d7a3d" font-family="serif">朱雀翔舞（前有案）</text>
<text x="200" y="235" text-anchor="middle" font-size="11" fill="#8a7a5e" font-family="serif">左青龙 · 右白虎 · 前朱雀 · 后玄武——四势全则穴吉</text>
</svg>`)
// 五害图
fs.writeFileSync(path.join(zsDir, 'wuhai-tu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="320" height="224">
<text x="200" y="26" text-anchor="middle" font-size="16" fill="#5a4632" font-family="serif" font-weight="bold">五害（五不葬）</text>
<text x="200" y="150" text-anchor="middle" font-size="20" fill="#b85450" font-weight="bold">✗</text>
<text x="200" y="60" text-anchor="middle" font-size="13" fill="#3d2f1d" font-family="serif">五害不葬：童山 · 断山 · 石山 · 过山 · 独山</text>
<text x="200" y="185" text-anchor="middle" font-size="12" fill="#5a4632" font-family="serif">童山无草木 · 断山脉气绝 · 石山不化生 · 过山势不停 · 独山无护从</text>
<text x="200" y="245" text-anchor="middle" font-size="11.5" fill="#8a7a5e" font-family="serif">五害之地，气散不聚——葬之则凶，皆当避之</text>
</svg>`)

// ===== 山海经：九尾狐（线描） =====
fs.writeFileSync(path.join(mk('shanhai-jing'), 'jiuweihu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 260" width="272" height="208">
<text x="170" y="26" text-anchor="middle" font-size="16" fill="#5a4632" font-family="serif" font-weight="bold">九尾狐 · 青丘之山</text>
<!-- 狐身 -->
<path d="M120,150 q20,-55 60,-45 q40,-8 55,20 q18,30 5,60 q-15,35 -55,35 q-50,0 -65,-30 q-12,-26 0,-40Z" fill="#f5c98a" stroke="#8c6d1f" stroke-width="2"/>
<!-- 头 -->
<circle cx="128" cy="98" r="20" fill="#f5c98a" stroke="#8c6d1f" stroke-width="2"/>
<circle cx="120" cy="93" r="3" fill="#3d2f1d"/><circle cx="136" cy="93" r="3" fill="#3d2f1d"/>
<path d="M124,104 q6,5 12,0" fill="none" stroke="#3d2f1d" stroke-width="1.5"/>
<path d="M112,85 l-14,-8 l10,6" fill="#e8b36a" stroke="#8c6d1f" stroke-width="1.5"/>
<path d="M146,84 l12,-10 l-8,7" fill="#e8b36a" stroke="#8c6d1f" stroke-width="1.5"/>
<!-- 九尾扇形 -->
<path d="M245,175 q30,-40 15,-80 M235,180 q45,-25 45,-65 M225,182 q55,-10 70,-45 M215,180 q60,5 85,-20 M205,175 q55,25 75,10" fill="none" stroke="#e8a35a" stroke-width="3.5" stroke-linecap="round"/>
<text x="170" y="240" text-anchor="middle" font-size="12" fill="#6b5b43" font-family="serif">青丘之山有兽焉，其状如狐而九尾，音如婴儿</text>
</svg>`)

// ===== 五运六气运转图 =====
fs.writeFileSync(path.join(mk('huangdi-neijing-yunqi'), 'wuyun-liuqi-tu.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 360" width="352" height="288">
<text x="220" y="30" text-anchor="middle" font-size="17" fill="#5a4632" font-family="serif" font-weight="bold">五运六气运转图</text>
<!-- 六气环 -->
<circle cx="220" cy="185" r="120" fill="none" stroke="#e5dcc8" stroke-width="1.5" stroke-dasharray="5 4"/>
<circle cx="220" cy="185" r="88" fill="none" stroke="#e5dcc8" stroke-width="1.5" stroke-dasharray="5 4"/>
<circle cx="220" cy="185" r="40" fill="none" stroke="#e5dcc8" stroke-width="1"/>
<text x="220" y="180" text-anchor="middle" font-size="12" fill="#8a7a5e" font-family="serif">中运</text>
<!-- 六气位置（司天在南=上 在泉在北=下 常规上南下北） -->
<g font-family="serif" font-size="13">
<text x="220" y="52" text-anchor="middle" fill="#3d2f1d">司天（三之气）</text>
<text x="220" y="330" text-anchor="middle" fill="#3d2f1d">在泉（终之气）</text>
<text x="92" y="150" text-anchor="middle" fill="#5a4632">四之气</text>
<text x="348" y="150" text-anchor="middle" fill="#5a4632">二之气</text>
<text x="92" y="230" text-anchor="middle" fill="#5a4632">初之气</text>
<text x="348" y="230" text-anchor="middle" fill="#5a4632">五之气</text>
</g>
<!-- 主气箭头示意 -->
<path d="M220,65 q-70,0 -95,60 M125,215 q-10,45 35,60 M125,155 q-30,-45 30,-75 M315,155 q30,-45 -30,-75 M315,215 q10,45 -35,60 M220,325 q70,0 95,-60" fill="none" stroke="#b08d2e" stroke-width="1.6" marker-end="none"/>
<text x="220" y="360" text-anchor="middle" font-size="12" fill="#6b5b43" font-family="serif">主气六步固定 · 客气随司天推移——三之气司天、终之气在泉</text>
</svg>`)

console.log('第二批图生成完成（撼龙经5/葬书3/九尾狐/五运六气环）')
