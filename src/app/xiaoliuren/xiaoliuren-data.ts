// ─────────────────────────────────────────────────────────────
// 小六壬 · 掌诀数据与推演引擎
// 六宫顺序即掐数顺序：大安(0)→留连(1)→速喜(2)→赤口(3)→小吉(4)→空亡(5)→回大安
// ─────────────────────────────────────────────────────────────

export type Fortune = '大吉' | '吉' | '凶' | '大凶'

export type CatKey = 'love' | 'career' | 'money' | 'lost' | 'travel' | 'health'

export interface Palace {
  name: string        // 掌诀名
  pos: string         // 手指宫位
  element: string     // 五行
  colorName: string   // 属性色名（青/蓝/红/白/绿/黄）
  hex: string         // 属性色色值
  fortune: Fortune
  fortuneDesc: string // 吉凶一句话
  quick: string       // 总断一句话
  read: string[]      // 主解读（现代白话，2 段）
  yis: string[]       // 宜
  jis: string[]       // 忌
  cats: Record<CatKey, string> // 分场景白话解读
}

export const PALACE_ORDER: string[] = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']

export const CATS: { key: CatKey; label: string; icon: string; words: string[] }[] = [
  { key: 'love', label: '感情', icon: '💞', words: ['感情', '恋爱', '对象', '男友', '女友', '分手', '复合', '婚姻', '结婚', '相亲', '暧昧', '表白', '喜欢', '吵架', '关系', '结婚'] },
  { key: 'career', label: '事业', icon: '💼', words: ['事业', '工作', '面试', 'offer', '求职', '跳槽', '升职', '离职', '创业', '项目', '考试', '考研', '考公', '学业', '合作'] },
  { key: 'money', label: '求财', icon: '💰', words: ['财运', '求财', '钱', '生意', '投资', '赚钱', '理财', '回款', '股票', '欠款', '债', '收入'] },
  { key: 'lost', label: '失物', icon: '🔍', words: ['丢', '失物', '找', '遗失', '不见', '物品', '证件', '手机', '钱包'] },
  { key: 'travel', label: '出行', icon: '🧳', words: ['出行', '旅游', '旅行', '出差', '搬家', '路途', '航班', '火车', '开车', '签证'] },
  { key: 'health', label: '健康', icon: '💪', words: ['健康', '身体', '病', '医院', '体检', '失眠', '状态', '疲劳'] },
]

// 吉凶的配色与文案（白天压深 / 夜晚提亮，双主题可读）
export const LUCK: Record<Fortune, { hex: string; label: string; chip: string; txt: string; fill: string }> = {
  大吉: {
    hex: '#0e9f6e',
    label: '大吉',
    chip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    txt: 'text-emerald-600 dark:text-emerald-400',
    fill: 'fill-emerald-600 dark:fill-emerald-400',
  },
  吉: {
    hex: '#0e9f6e',
    label: '吉',
    chip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    txt: 'text-emerald-600 dark:text-emerald-400',
    fill: 'fill-emerald-600 dark:fill-emerald-400',
  },
  凶: {
    hex: '#d23c2f',
    label: '凶',
    chip: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    txt: 'text-red-600 dark:text-red-400',
    fill: 'fill-red-500 dark:fill-red-400',
  },
  大凶: {
    hex: '#c02626',
    label: '大凶',
    chip: 'bg-red-600/10 border-red-600/40 text-red-700 dark:text-red-400',
    txt: 'text-red-700 dark:text-red-400',
    fill: 'fill-red-600 dark:fill-red-400',
  },
}

export const PALACES: Palace[] = [
  {
    name: '大安',
    pos: '无名指根部',
    element: '木',
    colorName: '青',
    hex: '#0d9c72',
    fortune: '大吉',
    fortuneDesc: '身心安定，诸事顺遂',
    quick: '根基稳、路能通，按部就班就会有好消息。',
    read: [
      '大安是一颗「定心丸」。它落在无名指根部，五行属木，主生长与安稳。占到它，意味着眼前这件事的整体气场是稳的——环境没有在跟你作对，困难大多是暂时的，真正会坏事的是「急」。它不代表马上天上掉馅饼，而是「根基在、路能走通」，适合把手头的事做扎实、按计划往前推。',
      '凡是需要耐心积累的事，学习、存钱、备孕、谈长期合作，眼下都是好时机。你可能会比平时更松弛，这是好信号。唯一要提醒的是：别因为觉得「稳了」就大意拖延——木性最怕久旱，一直浇水，树才会一直长。',
    ],
    yis: ['按原计划推进，不折腾', '面谈、签约、表白都适合', '学习充电、储蓄积累', '主动修复一段旧关系'],
    jis: ['同时开好几个头，三心二意', '因安逸而拖延误事', '小事上头，与人起争执'],
    cats: {
      love: '关系处在平稳期，适合推进而不是猜疑；单身者容易从熟人、老同学圈子里遇到不错的人。',
      career: '按部就班就是最好的节奏，把手头的项目收尾，比急着开新摊子更有利。',
      money: '正财稳、急财少，适合储蓄和长期投入；短线的、加杠杆的收益别碰。',
      lost: '东西多半没丢远，就在常待的地方——家里、工位附近，细翻抽屉和收纳角落。',
      travel: '出行顺利少波折，短途长途都可行，提前规划好的行程基本按点走。',
      health: '底子平稳，规律作息就够；属木主肝，少熬夜、少生闷气。',
    },
  },
  {
    name: '留连',
    pos: '中指根部',
    element: '水',
    colorName: '蓝',
    hex: '#3f6fb0',
    fortune: '凶',
    fortuneDesc: '事多胶着，宜缓不宜催',
    quick: '事情卡在半路没有黄，只是泡在水里，快不起来。',
    read: [
      '留连属水，水性缠绵，说的是「黏住、拖延、反复」。它最常出现在那些说不清卡在哪的事情上：对方不表态、流程不推进、心里放不下。记住一点——留连不是事情黄了，而是事情被泡住了，速度起不来。',
      '这段时间最忌硬催、硬闯、逼对方当场给答案，越用力越反弹，只会把水搅浑。正确姿势是：先接受慢，把你能控制的部分做足，再给自己设一个等待期限，期限到了主动问一次。感情里尤其如此，留连常提示对方或你自己还没想明白，需要的不是追问，是时间。水主流动，换个环境、换种沟通方式，往往能让事松动。',
    ],
    yis: ['暂停催促，给彼此缓冲', '先做筹备：调研、方案、铺垫', '以柔克刚，换方式再沟通', '理清关系里的旧账与心结'],
    jis: ['夺命连环问', '情绪上头直接摊牌', '反复犹豫，又反复后悔'],
    cats: {
      love: '有一方还没准备好或正在摇摆，给空间比逼问有效；异地、断联类问题暂时难有定论。',
      career: '项目容易卡在审批和配合环节，催不来的事，先把文书和准备做足。',
      money: '钱财流动偏慢，回款、报销、结算易拖；记账防漏，别垫大额。',
      lost: '东西可能被人收起来了，或夹在文件书报堆里；也可能「在别人手上」，过几天才有消息。',
      travel: '易有延误、改期、等人，预留缓冲时间，证件票据提前备好。',
      health: '留意肠胃与湿气；心里憋闷时容易睡不好，找人说说话，别闷着。',
    },
  },
  {
    name: '速喜',
    pos: '食指根部',
    element: '火',
    colorName: '红',
    hex: '#d8452f',
    fortune: '大吉',
    fortuneDesc: '喜讯将至，宜趁热打铁',
    quick: '好消息正在路上，主动出手，火头正旺时效率最高。',
    read: [
      '速喜属火，火主亮堂、迅速，落在食指根部，是「好消息在路上」的信号。它通常对应：有人主动来找你、邮件电话有回音、悬着的事忽然有了转机。速喜鼓励你趁热打铁——火头正旺的时候出手，事半功倍。',
      '面试、提案、表白、赶进度、发作品，凡是需要亮相和冲刺的事，放在这几天做都容易被看见、被认可。但火来得快去得也快，速喜的时效性很强：别把好消息当成一劳永逸，该跟进立刻跟进，热度一过就要重新加热。它最怕冷场，机会来了，当场接住。',
    ],
    yis: ['主动出击，当面沟通', '表白、约见想见的人', '汇报、展示、公开发声', '好消息一到，第一时间跟进'],
    jis: ['热度过了才行动', '一激动就满口承诺', '事情没定就先四处宣扬'],
    cats: {
      love: '有升温信号，单身者近期易遇到聊得来的人；有伴的适合安排一次惊喜约会。',
      career: '你的表现容易被看见，汇报、提案、投简历都宜早不宜晚，反馈会比想象快。',
      money: '有进账消息，奖金、副业、小额偏财可能落地；钱先落袋，别急着加注。',
      lost: '多在「有火气」的地方——厨房、电器旁，或刚去过的人多场合；问身边人，一问就有线索。',
      travel: '出行利、消息好，路上可能遇熟人旧友；宜早班，不宜太晚出发。',
      health: '当心上火、炎症、口腔小问题，多喝水少熬夜；情绪一兴奋别暴饮暴食。',
    },
  },
  {
    name: '赤口',
    pos: '无名指尖',
    element: '金',
    colorName: '白',
    hex: '#8f98a6',
    fortune: '凶',
    fortuneDesc: '口舌易起，宜谨言慎行',
    quick: '是非的预警牌：管住嘴、留好凭证，大多数冲突可以绕过去。',
    read: [
      '赤口属金，金主肃杀、锋利，落在无名指尖，是六宫里最容易惹是非的一宫。它提示接下来的沟通成本偏高：话赶话、被误解、背后有议论，或者合同、条款、钱的事情上扯皮。赤口当头，第一原则是「少说为妙」——不是当哑巴，而是重要的话想三遍再说，别在气头上发消息、表态、站队。',
      '第二原则是「留证据」：涉及钱和承诺的，该有文字有文字、该签字签字，口头约定最容易翻脸。赤口不等于结果一定坏，它更像一块警告牌——只要管住嘴、按规矩办事，大多数冲突都能绕过去。白纸黑字，是赤口最好的解药。',
    ],
    yis: ['重要沟通留文字凭证', '冷静几小时再回应挑衅', '逐条核对合同、账单、条款', '客客气气，保持适当距离'],
    jis: ['气头上吵架、发动态', '替人担保、口头承诺', '在群里站队议论他人'],
    cats: {
      love: '容易因小事起口角，话赶话最伤感情，有分歧先停火隔天再谈；单身者留意言语轻浮的对象。',
      career: '职场有人际摩擦或考核压力，谨言慎行、按流程走，别把情绪写在脸上。',
      money: '防破财于纠纷：借贷、合伙、购物都要白纸黑字；维权耗时长，金额小的别恋战。',
      lost: '与「口舌」有关——可能在起了争执的人那里，或丢在办事窗口柜台，主动询问相关人。',
      travel: '注意交通规则与口角，避免与陌生人起冲突；开车切忌斗气。',
      health: '留意呼吸道、牙痛、皮肤小伤口；金主肺，少烟酒，小伤也别大意。',
    },
  },
  {
    name: '小吉',
    pos: '中指尖',
    element: '木',
    colorName: '绿',
    hex: '#1ea35c',
    fortune: '大吉',
    fortuneDesc: '贵人易遇，宜主动借力',
    quick: '人情味最旺的一宫，开口求助，顺风车就在前面。',
    read: [
      '小吉是六宫里人情味最重的一宫，属木而落中指尖，主通达、顺利，尤其指向「人」的助力：想见的人见得到，需要帮忙时开口就有回应，甚至会有想不到的人主动拉你一把。',
      '小吉格局下做事讲究「借力」：别一个人闷头扛，把需求说出来，同事、朋友、家人往往就是你的贵人。它也适合一切与「走动」有关的事——拜访、聚会、牵线搭桥，效果都很好。但要分清：小吉给的是顺风车，不是天上掉馅饼——方向对了有人载你一程，方向错了照样绕路。拿到小吉，先想清楚自己去哪，再大方求助。',
    ],
    yis: ['开口求助，托人介绍', '约见前辈贵人，维系人脉', '出门走动、谈合作', '受了帮助及时道谢回礼'],
    jis: ['不好意思开口，错过机会', '把别人的帮助当理所当然', '为小利伤了多年情分'],
    cats: {
      love: '感情融洽，见家长、谈婚论嫁时机不错；单身者经朋友介绍、聚会认识的缘分质量高。',
      career: '上司、前辈或合作方会给你方便，有推荐、内推的机会千万别错过。',
      money: '财路与人脉挂钩，合作分成、介绍生意比单打独斗来钱快；记得分利与感恩。',
      lost: '多半被人妥善收着，问熟人、同事、常去的店铺，很快就有线索。',
      travel: '出行吉，旅途愉快还可能交到新朋友；适合走亲访友、登门拜访。',
      health: '整体康健，小毛病恢复快；木气舒展，多散步拉伸，心情好身体就好。',
    },
  },
  {
    name: '空亡',
    pos: '食指尖',
    element: '土',
    colorName: '黄',
    hex: '#b98a1d',
    fortune: '大凶',
    fortuneDesc: '谋事易空，宜守不宜攻',
    quick: '名字已说明一切：现在不是冲锋的时候，收缩防守才是聪明。',
    read: [
      '空亡属土，落在食指尖，是六宫里唯一「看不到结果」的位置——努力可能没有回响，约定可能被放鸽子，投入可能打水漂。它当头时最忌一个「赌」字：赌对方回心转意、赌项目翻盘、赌再投一笔就能回本。',
      '空亡不是诅咒，而是一句明确的提醒：现在不是进攻的时机。已经陷进去的，设好止损线坚决执行；还没开始的，缓一缓，换个时间或换个方向。它也提示「虚」——小心画饼、空头支票、说得漂亮的人和事，越动听越要警惕。守得住，等这阵风过去，局面自有转机。',
    ],
    yis: ['重大决定先放一放', '设止损线，及时抽身', '低调做事，保存实力', '把精力放回身体和基本功'],
    jis: ['借钱投资、加杠杆', '相信画饼与口头承诺', '为面子死撑无底洞'],
    cats: {
      love: '易遇忽冷忽热、承诺不兑现，付出可能没回应；该断的别拖，空窗期正好想清楚自己要什么。',
      career: '项目易落空或延期，方案被否也别灰心；此时不宜冲动裸辞，先把现岗稳住。',
      money: '财运偏虚，防被骗、被拖欠；任何「稳赚」的说辞都先假设是坑，守好本金。',
      lost: '较难找回，可能彻底遗失或归还无望；贵重物品尽早挂失，别抱侥幸。',
      travel: '出行易生变故：误点、取消、计划泡汤；重要行程多备预案，别把时间卡太死。',
      health: '注意消化与脾胃，忌暴饮暴食；情绪低落时当心过劳，睡眠和吃饭是底线。',
    },
  },
]

// 五行→配色 图例（盘面下方小注用）
export const ELEMENT_LEGEND: { element: string; colorName: string; hex: string }[] = [
  { element: '木', colorName: '青', hex: '#0d9c72' },
  { element: '水', colorName: '蓝', hex: '#3f6fb0' },
  { element: '火', colorName: '红', hex: '#d8452f' },
  { element: '金', colorName: '白', hex: '#8f98a6' },
  { element: '木', colorName: '绿', hex: '#1ea35c' },
  { element: '土', colorName: '黄', hex: '#b98a1d' },
]

// ── 推演引擎 ────────────────────────────────────────────────
export type PhaseName = '月' | '日' | '时'

export interface WalkEv {
  node: number   // 0-5，指向 PALACES 下标
  phase: PhaseName
  count: number  // 本阶段第几数
}

export interface Walk {
  n1: number
  n2: number
  n3: number
  finalNode: number
  total: number
  evs: WalkEv[]           // 逐数事件（完整）
  landIdx: number[]       // 三个阶段落宫下标 [月落, 日落, 时落]
  recaps: string[]        // 三行过程小结
}

export function buildWalk(a: number, b: number, c: number): Walk {
  const n1 = Math.max(1, Math.floor(a) || 1)
  const n2 = Math.max(1, Math.floor(b) || 1)
  const n3 = Math.max(1, Math.floor(c) || 1)

  const startOf: number[] = [0, (n1 - 1) % 6, (n1 + n2 - 2) % 6]
  const counts: number[] = [n1, n2, n3]
  const names: PhaseName[] = ['月', '日', '时']

  const evs: WalkEv[] = []
  const landIdx: number[] = []
  for (let p = 0; p < 3; p++) {
    const s = startOf[p]
    let last = s
    for (let k = 1; k <= counts[p]; k++) {
      const node = (s + k - 1) % 6
      last = node
      evs.push({ node, phase: names[p], count: k })
    }
    landIdx.push(last)
  }

  const recaps = [
    `${n1} 数：${PALACES[0].name} → ${PALACES[landIdx[0]].name}`,
    `${n2} 数：${PALACES[landIdx[0]].name} → ${PALACES[landIdx[1]].name}`,
    `${n3} 数：${PALACES[landIdx[1]].name} → ${PALACES[landIdx[2]].name}`,
  ]

  return { n1, n2, n3, finalNode: landIdx[2], total: evs.length, evs, landIdx, recaps }
}

// 根据所问文本猜测关注领域（用于结果卡高亮对应分类）
export function guessCategory(question: string): CatKey | null {
  const q = question.trim().toLowerCase()
  if (!q) return null
  for (const cat of CATS) {
    if (cat.words.some(w => q.includes(w))) return cat.key
  }
  return null
}
