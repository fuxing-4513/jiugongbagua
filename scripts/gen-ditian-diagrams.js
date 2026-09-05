// 生成滴天髓 7 张数据示意图 SVG（文本结构图——金棕系）
const fs = require('fs')
const path = require('path')

const outDir = path.join('public/images/xueguan/ditian-sui')
fs.mkdirSync(outDir, { recursive: true })
const W = 480, H = 320
const head = (title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<text x="${W/2}" y="26" text-anchor="middle" font-size="17" fill="#5a4632" font-family="serif" font-weight="bold">${title}</text>`
const foot = '</svg>'

// 通用：文本单元格
function cell(x, y, w, h, txt, fill = '#faf7f0', stroke = '#b08d2e', tsize = 13, tfill = '#3d2f1d') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
<text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" font-size="${tsize}" fill="${tfill}" font-family="serif">${txt}</text>`
}

// 1. 十天干体性（表）
let s = [head('十天干体性与五行归属')]
const gans = [['甲','阳木','参天大树·栋梁之才'],['乙','阴木','花草藤蔓·柔韧生长'],['丙','阳火','太阳之火·光明热烈'],['丁','阴火','灯烛之火·温和细致'],['戊','阳土','城墙之土·厚重可靠'],['己','阴土','田园之土·滋养包容'],['庚','阳金','刀剑之金·刚毅果决'],['辛','阴金','珠玉之金·精致灵秀'],['壬','阳水','江河之水·奔流不息'],['癸','阴水','雨露之水·润物无声']]
gans.forEach((g, i) => {
  const y = 46 + i * 26
  s.push(`<rect x="30" y="${y}" width="420" height="23" rx="5" fill="${i%2===0?'#faf7f0':'#f5efe2'}" stroke="#d8c9a3" stroke-width="0.8"/>`)
  s.push(`<text x="70" y="${y+16}" text-anchor="middle" font-size="14" fill="#8c6d1f" font-family="serif">${g[0]}</text>`)
  s.push(`<text x="140" y="${y+16}" text-anchor="middle" font-size="12.5" fill="#5a4632" font-family="serif">${g[1]}</text>`)
  s.push(`<text x="270" y="${y+16}" text-anchor="middle" font-size="12" fill="#6b5b43" font-family="serif">${g[2]}</text>`)
})
s.push(foot); fs.writeFileSync(path.join(outDir, 'tiangan-shuxing.svg'), s.join('\n'))

// 2. 十二地支冲合（两栏：六合/六冲）
s = [head('十二地支 · 六合与六冲')]
const he = [['子丑合土','寅亥合木','卯戌合火','辰酉合金','巳申合水','午未合土']]
const chong = [['子午相冲','丑未相冲','寅申相冲','卯酉相冲','辰戌相冲','巳亥相冲']]
he[0].forEach((t, i) => { const y = 60 + i * 30; s.push(cell(40, y, 180, 26, t)); })
chong[0].forEach((t, i) => { const y = 60 + i * 30; s.push(cell(260, y, 180, 26, t, '#faf0f0', '#b85450')); })
s.push(`<text x="130" y="46" text-anchor="middle" font-size="13" fill="#3d7a3d">六合（合化）</text>`)
s.push(`<text x="350" y="46" text-anchor="middle" font-size="13" fill="#b85450">六冲（对冲）</text>`)
s.push(`<text x="${W/2}" y="270" text-anchor="middle" font-size="11.5" fill="#8a7a5e">地支三合：申子辰合水 · 亥卯未合木 · 寅午戌合火 · 巳酉丑合金</text>`)
s.push(foot); fs.writeFileSync(path.join(outDir, 'dizhi-chonghe.svg'), s.join('\n'))

// 3. 八格体用（表）
s = [head('八格与体用')]
const ge = [['正官格','以官为用·印绶护官'],['七杀格','杀须食制·或印化杀'],['正财格','财喜食生·身旺任财'],['偏财格','偏财豪迈·喜比劫助'],['正印格','印绶护身·喜官杀生'],['偏印格','枭神夺食·忌见食神'],['食神格','食神生财·身强为佳'],['伤官格','伤官配印·驾杀为贵']]
ge.forEach((g, i) => {
  const y = 52 + i * 27
  s.push(`<rect x="30" y="${y}" width="420" height="24" rx="5" fill="${i%2===0?'#faf7f0':'#f5efe2'}" stroke="#d8c9a3" stroke-width="0.8"/>`)
  s.push(`<text x="100" y="${y+16.5}" text-anchor="middle" font-size="14" fill="#8c6d1f" font-family="serif">${g[0]}</text>`)
  s.push(`<text x="290" y="${y+16.5}" text-anchor="middle" font-size="12" fill="#5a4632" font-family="serif">${g[1]}</text>`)
})
s.push(foot); fs.writeFileSync(path.join(outDir, 'bage-tiyong.svg'), s.join('\n'))

// 4. 五行通关相生（环）
s = [head('五行相生 · 通关之序')]
const wx = [['木','#3d7a3d',240,60],['火','#b85450',360,150],['土','#b08d2e',300,260],['金','#6b7f99',140,260],['水','#3a6ea5',70,150]]
const cx=200, cy=160, R=88
wx.forEach(([n,c]) => { s.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e5dcc8" stroke-width="1" stroke-dasharray="4 3"/>`) })
wx.forEach(([n, c, x, y]) => { s.push(`<circle cx="${x}" cy="${y}" r="34" fill="${c}1a" stroke="${c}" stroke-width="2"/>`); s.push(`<text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" fill="${c}" font-family="serif" font-weight="bold">${n}</text>`) })
const arrows = [[0,1],[1,2],[2,3],[3,4],[4,0]]
arrows.forEach(([a,b]) => { s.push(`<text x="${(wx[a][2]+wx[b][2])/2}" y="${(wx[a][3]+wx[b][3])/2-8}" text-anchor="middle" font-size="11" fill="#8a7a5e">相生→</text>`) })
s.push(`<text x="${cx}" y="300" text-anchor="middle" font-size="11.5" fill="#8a7a5e">木生火 · 火生土 · 土生金 · 金生水 · 水生木</text>`)
s.push(foot); fs.writeFileSync(path.join(outDir, 'tongguan-wuxing.svg'), s.join('\n'))

// 5. 六亲关系（十神定位表）
s = [head('十神六亲关系（以日干为我）')]
const liu = [['比肩·劫财','兄弟·姐妹','同我者'],['食神·伤官','子女·晚辈','我生者'],['正财·偏财','妻财·父亲','我克者'],['正官·七杀','官杀·子女(女命)','克我者'],['正印·偏印','母亲·长辈','生我者']]
liu.forEach((g, i) => {
  const y = 52 + i * 34
  s.push(cell(30, y, 160, 30, g[0], i===2?'#fdf6e3':'#faf7f0'))
  s.push(cell(200, y, 140, 30, g[1], '#f5efe2'))
  s.push(cell(350, y, 100, 30, g[2], '#faf0f0'))
})
s.push(`<text x="${W/2}" y="236" text-anchor="middle" font-size="11.5" fill="#8a7a5e">生我者父母 · 我生者子孙 · 克我者官杀 · 我克者妻财 · 同我者兄弟</text>`)
s.push(foot); fs.writeFileSync(path.join(outDir, 'liuqin-guanxi.svg'), s.join('\n'))

// 6. 天道寒暖示意（寒/暖两轴）
s = [head('天道 · 寒暖燥湿示意')]
s.push(cell(60, 70, 160, 90, '寒（冬）\n水旺火衰\n喜火调候', '#eef3fb', '#3a6ea5', 13))
s.push(cell(260, 70, 160, 90, '暖（夏）\n火旺水衰\n喜水调候', '#fdf0e8', '#b85450', 13))
s.push(`<line x1="60" y1="200" x2="420" y2="200" stroke="#b08d2e" stroke-width="2"/><text x="60" y="222" font-size="11.5" fill="#8a7a5e">寒</text><text x="400" y="222" text-anchor="end" font-size="11.5" fill="#8a7a5e">暖</text>`)
s.push(`<text x="${W/2}" y="260" text-anchor="middle" font-size="12" fill="#5a4632" font-family="serif">调候为急：夏生需水润局 · 冬生需火暖局</text>`)
s.push(`<text x="${W/2}" y="290" text-anchor="middle" font-size="11" fill="#8a7a5e">寒暖失衡则性情偏枯 · 得调候则气象中和</text>`)
s.push(foot); fs.writeFileSync(path.join(outDir, 'tiandao-hannuan.svg'), s.join('\n'))

// 7. 任氏注本对照
s = [head('滴天髓 · 任氏增注本对照（版本脉络）')]
s.push(cell(90, 60, 300, 36, '《滴天髓》原文（相传京图撰 · 明刘基注）', '#faf7f0', '#b08d2e', 13))
s.push(cell(90, 110, 300, 36, '任铁樵《滴天髓阐微》——增注实例阐发', '#f5efe2', '#b08d2e', 13))
s.push(cell(90, 160, 300, 36, '通行本：原文 + 刘注 + 任氏阐微合刊', '#fdf6e3', '#987818', 13))
wx.forEach(() => {})
s.push(`<text x="${W/2}" y="245" text-anchor="middle" font-size="12" fill="#5a4632" font-family="serif">原书以理明道 · 任注以例证道——研读宜原文与增注对参</text>`)
s.push(foot); fs.writeFileSync(path.join(outDir, 'renzhu-shanben.svg'), s.join('\n'))

console.log('滴天髓 7 图生成完成 →', outDir)
