// 生命灵数（Pythagorean 毕达哥拉斯体系）
import pinyin from 'tiny-pinyin'

// 字母→数字（Pythagorean）
const PY_MAP: Record<string, number> = {}
'A=1,B=2,C=3,D=4,E=5,F=6,G=7,H=8,I=9,J=1,K=2,L=3,M=4,N=5,O=6,P=7,Q=8,R=9,S=1,T=2,U=3,V=4,W=5,X=6,Y=7,Z=8'
  .split(',').forEach(p => { const [k, v] = p.split('='); PY_MAP[k] = +v })
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

export interface NumerologyResult {
  lifePath: number          // 生命路径数
  expression: number        // 表达数（姓名字母全和）
  soulUrge: number          // 灵魂冲动数（元音）
  personality: number       // 人格数（辅音）
  namePinyin: string
}

// 数字归约（保留主数 11/22/33）
function reduce(n: number, keepMaster = true): number {
  while (n > 9 && !(keepMaster && (n === 11 || n === 22 || n === 33))) {
    n = String(n).split('').reduce((s, d) => s + +d, 0)
  }
  return n
}

function lettersToNumbers(s: string): number[] {
  return s.toUpperCase().replace(/[^A-Z]/g, '').split('').map(c => PY_MAP[c] || 0)
}

export function computeNumerology(nameCN: string, dateStr: string): NumerologyResult {
  // 中文 → 拼音
  let py = ''
  try { py = pinyin.convertToPinyin(nameCN.replace(/\s/g, ''), '', true) || nameCN } catch { py = nameCN }
  const letters = lettersToNumbers(py)
  const vowels = letters.filter((_, i) => VOWELS.has(py.toUpperCase()[i] || ''))
  const consonants = letters.filter((_, i) => !VOWELS.has(py.toUpperCase()[i] || ''))

  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0)
  // 日期数字（YYYY-MM-DD）
  const dSum = dateStr.replace(/-/g, '').split('').reduce((s, c) => s + +c, 0)

  return {
    lifePath: reduce(dSum),
    expression: reduce(sum(letters)),
    soulUrge: reduce(sum(vowels) || 0),
    personality: reduce(sum(consonants) || 0),
    namePinyin: py,
  }
}

export const NUM_READ: Record<number, { name: string; tag: string; read: string; love: string; career: string }> = {
  1: { name: '开创者', tag: '独立 · 领导 · 先锋', read: '天生带着"第一"的冲动：独立、果断、敢于开路。最怕被指挥，适合自己做决定、自己承担。你的课题是学会合作——世界不是只有你的节奏。', love: '喜欢有主见、能与你并肩的人；关系中需要被尊重而非被支配。', career: '创业、管理、开拓型岗位——任何能让你当"头"的位置都发光。' },
  2: { name: '调和者', tag: '细腻 · 合作 · 直觉', read: '天生敏锐的观察者，擅长读懂气氛与人心的微妙。你不喜欢冲突，是天然的桥梁与和事佬。你的课题是别把"配合"变成"委屈自己"。', love: '渴望深度联结与回应，细节里的体贴最打动你。', career: '协调、外交、心理、艺术类——需要耐心与感知力的工作。' },
  3: { name: '表达者', tag: '创意 · 社交 · 感染力', read: '天生带舞台感：表达欲强、点子多、能点亮气氛。灵感来得快，也容易三分钟热度。你的课题是把才华落成作品，而不只是热闹。', love: '喜欢有趣、会聊的人；关系需要新鲜感与共同玩乐。', career: '创作、传媒、设计、演讲——一切"输出表达"的领域。' },
  4: { name: '建造者', tag: '踏实 · 秩序 · 可靠', read: '天生懂得"地基"的重要：守时、守信、有条理，是团队里最让人放心的人。你相信积累的力量，但也要小心把自己困在惯性里。', love: '细水长流的陪伴胜过轰轰烈烈；承诺对你意义重大。', career: '工程、财务、管理、技术——需要体系与耐心的领域。' },
  5: { name: '自由者', tag: '变化 · 冒险 · 多面', read: '天生闲不住：爱自由、爱体验、适应力极强。常规会闷坏你，变化让你活着。你的课题是给自由装上方向盘——不是所有冲动都值得追。', love: '需要空间的关系；太黏会想逃，懂留白的人才留得住你。', career: '销售、旅行、媒体、多栖发展——拒绝朝九晚五的重复。' },
  6: { name: '守护者', tag: '责任 · 爱 · 完美', read: '天生把"照顾"当本能：顾家、重情义、追求和谐美好。你容易把别人的担子背到自己身上。你的课题是分清"负责"与"揽责"。', love: '付出型恋人，渴望被珍惜；最怕付出被当成理所当然。', career: '教育、医疗、服务、设计——让世界更美好的工作。' },
  7: { name: '探索者', tag: '深思 · 洞察 · 灵性', read: '天生向内：爱思考、重逻辑、追求事物的本质。独处是你的充电方式，热闹会消耗你。你的课题是把洞察用出来，而不只是想明白。', love: '精神共鸣高于一切；能聊得来比什么都重要。', career: '研究、技术、分析、哲学心理——需要深度的领域。' },
  8: { name: '掌控者', tag: '魄力 · 成就 · 资源', read: '天生对"成事"敏感：目标感强、抗压强、能调动资源。你对事业与财富有天然的嗅觉。你的课题是驾驭欲望——权力是工具不是目的。', love: '欣赏强者；关系里需要共同的成长目标。', career: '商业、金融、管理、投资——能放大资源的位置。' },
  9: { name: '理想者', tag: '大爱 · 格局 · 完成', read: '天生站在更高处看事情：包容、慈悲、有大局观，常有"改变点什么"的冲动。你的课题是落地——理想需要行动的脚。', love: '追求灵魂级联结，无法忍受肤浅的关系。', career: '公益、教育、艺术、国际事务——利他的事业。' },
  11: { name: '启迪者', tag: '直觉 · 灵感 · 导师', read: '灵数中的"大师数"：直觉极强、感受力深，常能感知到别人看不见的层面。情绪起伏也大，需要学会保护自己的能量。', love: '需要灵魂伴侣式的理解；关系即修行。', career: '导师、顾问、疗愈、创意导演——启发他人的位置。' },
  22: { name: '建造大师', tag: '愿景 · 落地 · 宏大', read: '最强大的灵数之一：既有 11 的灵感，又有把宏图变成现实的能力。你能做"别人只敢想"的事。课题是别被自己的标准压垮。', love: '寻找能理解你使命的伴侣，支持你造梦的人。', career: '企业家、大型项目掌舵者——把不可能变成可能。' },
  33: { name: '大爱者', tag: '疗愈 · 奉献 · 灯塔', read: '最稀有的灵数：以爱与疗愈为使命，能量能照亮很多人。务必先照顾好自己——灯塔也需要燃料。', love: '付出型极致版本，容易吸引需要被拯救的人。', career: '疗愈、公益领袖、精神导师——以善为业的道路。' },
}
