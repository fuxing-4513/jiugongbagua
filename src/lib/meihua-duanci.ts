// ─── 梅花易数断辞数据 ───
// 包含：五行生克关系分析、64卦详细断辞、生肖纳音五行、终身卦说明

// ─────────────────────────────────────────
// 1. MEIHUA_GUANXI - 上下卦五行生克关系
// 键格式："上{五行}下{五行}"，值是对该五行交互关系的断辞
// ─────────────────────────────────────────

/** 上下卦五行生克关系断辞 */
export const MEIHUA_GUANXI: Record<string, string> = {
  // ─── 相生（上生下） ───
  上金下水: '上乾兑金生坎水，金水相生，智慧通达，财源如流水，谋事易成。',
  上水下木: '上坎水生下震巽木，水木滋生，才思敏捷，生机勃勃，诸事亨通。',
  上水下火: '上坎水下离火，水火既济之象，阴阳调和，虽有小波折终成大事。',

  上水下土: '上坎水下坤艮土，水土混杂，根基虽稳但阻力暗藏，宜稳扎稳打。',
  上火下木: '上离火生下震巽木，木火通明，文采斐然，声名显扬，前程似锦。',
  上火下土: '上离火生下坤艮土，火土相生，光明温暖，事业稳固，根基扎实长久。',
  上土下金: '上坤艮土生下乾兑金，土金相生，厚积薄发，诚信得财，名利双收。',
  上木下火: '上震巽木生下离火，木火通明，文明昌盛，才华展现，大吉大利。',
  上木下土: '上震巽木生下坤艮土，木土相生，根基渐固，事业稳步提升，后劲足。',
  上金下土: '上乾兑金生下坤艮土，金土相生，诚信守成，财富积累，稳中有升。',
  上金下火: '上乾兑金生下离火，火金相克却亦相成，烈火炼金，先苦后甜终成大器。',
  上木下水: '上震巽木生坎水，水木滋生，根基有源，谋事顺遂，细水长流。',
  上土下水: '上坤艮土生坎水，土水相生却亦有阻，润物无声，需耐心等待。',

  // ─── 相克 ───
  上金下木: '上乾兑金克下震巽木，金伐木，刚克柔，外部压力大，宜韬光养晦以避锋芒。',
  上火下金: '上离火克下乾兑金，火克金，以柔克刚，需以智慧和热情化解困境。',
  上火下水: '上离火克下坎水，火炎水蒸，冲突激烈，注意控制情绪避免冲动。',
  上木下金: '上震巽木克下乾兑金，木克金，以弱胜强，出奇制胜，但不可硬碰硬。',
  上土下木: '上坤艮土克下震巽木，土埋木根，压力重重，需坚守本心忍耐待机。',

  // ─── 比和（同五行） ───
  上金下金: '金金比和，刚健相济，阳刚之气充沛，合作共赢，但防过于刚硬。',
  上木下木: '木木比和，同气相求，双木成林，生机盎然，团队协作大吉。',
  上火下火: '火火比和，光明闪耀，热情洋溢，人气兴旺，但宜防过于激烈。',
  上土下土: '土土比和，厚德载物，稳重如山，根基牢固，宜守业不宜开拓。',
  上水下水: '水水比和，智慧深邃，内外圆融，以柔克刚，宜顺势而为。',
}

/** 五行关系英文翻译表 */
export const MEIHUA_GUANXI_EN: Record<string, string> = {
  'Metal-Water': 'Upper Metal generates Water — wisdom flows like a river, wealth pours in, endeavors succeed easily.',
  'Water-Wood': 'Upper Water nourishes lower Wood — quick wit, vibrant growth, all matters proceed smoothly.',
  'Water-Fire': 'Upper Water meets lower Fire — Water and Fire balanced, yin and yang harmonized. Minor setbacks lead to great success.',
  'Water-Earth': 'Upper Water mingles with lower Earth — foundation is firm but hidden resistance lurks; steady progress is advised.',
  'Fire-Wood': 'Upper Fire nourishes lower Wood — blazing intellect, literary brilliance, fame rising, a bright future ahead.',
  'Fire-Earth': 'Upper Fire engenders lower Earth — Fire-Earth synergy, bright and warm, a stable career with deep roots.',
  'Earth-Metal': 'Upper Earth engenders lower Metal — accumulated strength pays off, honesty brings wealth, fame and fortune both arrive.',
  'Wood-Fire': 'Upper Wood feeds lower Fire — culture flourishes, talent shines, great fortune and blessings.',
  'Wood-Earth': 'Upper Wood nourishes lower Earth — foundation gradually solidifies, career steadily rises with lasting momentum.',
  'Metal-Earth': 'Upper Metal engenders lower Earth — honesty preserves success, wealth accumulates, steady growth.',
  'Metal-Fire': 'Upper Metal meets lower Fire — Fire overcomes Metal yet tempers it. Refined by flame, sweetness follows bitterness.',
  'Wood-Water': 'Upper Wood generates lower Water — Water-Wood mutual nourishment, rooted source, endeavors proceed smoothly, a long steady stream.',
  'Earth-Water': 'Upper Earth engenders lower Water — Earth-Water synergy is obstructed yet nourishing; patient waiting required.',
  'Metal-Wood': 'Upper Metal克制 lower Wood — Metal chops Wood, hardness overcomes gentleness. External pressure looms — hide your light.',
  'Fire-Metal': 'Upper Fire overcomes lower Metal — Fire melts Metal, gentleness defeats strength. Use wisdom and passion to resolve difficulties.',
  'Fire-Water': 'Upper Fire overcomes lower Water — blaze evaporates water, intense conflict. Control emotions, avoid impulsiveness.',
  'Wood-Metal': 'Upper Wood overcomes lower Metal — the weak defeat the strong through ingenuity. Do not confront head-on.',
  'Earth-Wood': 'Upper Earth smothers lower Wood — heavy pressure. Stay true to your heart, endure with patience.',
  'Metal-Metal': 'Metal-Metal harmony — twin strengths reinforce each other. Masculine energy abounds, cooperation wins, but watch for excessive rigidity.',
  'Wood-Wood': 'Wood-Wood harmony — same energy attracts. Two trees make a forest, vitality surges, teamwork is auspicious.',
  'Fire-Fire': 'Fire-Fire harmony — brilliant radiance, overflowing passion, popularity soars, but guard against overheating.',
  'Earth-Earth': 'Earth-Earth harmony — virtue carries all, steady as a mountain, foundation unshakable. Retain rather than expand.',
  'Water-Water': 'Water-Water harmony — deep wisdom, inner and outer unity. Gentleness overcomes strength, follow the current.',
}

/** 五行关系日文翻译表 */
export const MEIHUA_GUANXI_JA: Record<string, string> = {
  'Metal-Water': '上が金、下が水。金生水。知恵が冴え、財源が流れるように続く。万事成就しやすい。',
  'Water-Wood': '上が水、下が木。水生木。才気煥発、生気に満ち、万事が順調に進む。',
  'Water-Fire': '上が水、下が火。水火既済の象。陰陽調和。小さな波乱はあるが大成する。',
  'Water-Earth': '上が水、下が土。水土混交。基礎は固いが抵抗が潜む。堅実な歩みが吉。',
  'Fire-Wood': '上が火、下が木。木火通明。文才が秀で、名声が高まり、前途洋々。',
  'Fire-Earth': '上が火、下が土。火土相生。光明暖かく、事業安定。根基はしっかりと長く続く。',
  'Earth-Metal': '上が土、下が金。土金相生。蓄積が実を結び、誠実に財を得て、名利とも成就。',
  'Wood-Fire': '上が木、下が火。木火通明。文明が栄え、才能が開花。大吉大利。',
  'Wood-Earth': '上が木、下が土。木土相生。基盤が固まり、事業は着実に上昇。後勁十分。',
  'Metal-Earth': '上が金、下が土。金土相生。誠実に守成し、富を蓄積。安定的に上昇。',
  'Metal-Fire': '上が金、下が火。火金相克でありながら互いに鍛え合う。烈火の鍛錬、先苦後甘。',
  'Wood-Water': '上が木、下が水。水木相生。根拠がしっかりあり、万事順調。細く長く続く。',
  'Earth-Water': '上が土、下が水。土水相生だが障りもある。潤物無声、忍耐が必要。',
  'Metal-Wood': '上が金、下が木。金克木、剛が柔を克す。外部からの圧力大。光を隠してやり過ごせ。',
  'Fire-Metal': '上が火、下が金。火克金、柔が剛を制す。知恵と情熱で困難を解決せよ。',
  'Fire-Water': '上が火、下が水。火炎水蒸、激しい衝突。感情を抑え、衝動を避けよ。',
  'Wood-Metal': '上が木、下が金。木克金、弱が強に勝つ。奇策で勝負すれど、正面衝突は避けよ。',
  'Earth-Wood': '上が土、下が木。土埋木根、圧力重重。本心を守り、忍耐して機を待て。',
  'Metal-Metal': '金金比和。剛健相済。陽剛の気に満ち、協力は吉。ただし剛直すぎに注意。',
  'Wood-Wood': '木木比和。同気相求。双木成林、生気盎々。チームワーク大吉。',
  'Fire-Fire': '火火比和。光明閃耀。熱気溢れ、人気旺ん。ただし激烈すぎに注意。',
  'Earth-Earth': '土土比和。厚徳載物。穩重如山。根基牢固。守成に適し、開拓には不向き。',
  'Water-Water': '水水比和。智慧深遠。内外円融。柔よく剛を制す。流れに従うのが吉。',
}

/** 五行关系韓文翻译表 */
export const MEIHUA_GUANXI_KO: Record<string, string> = {
  'Metal-Water': '위 금, 아래 수. 금생수. 지혜가 통달하고 재원이 흐르듯 이어집니다. 일이 잘 이루어집니다.',
  'Water-Wood': '위 수, 아래 목. 수생목. 재치가 넘치고 생기가 넘치며 모든 일이 순조롭습니다.',
  'Water-Fire': '위 수, 아래 화. 수화기제의 상. 음양이 조화되고 작은 파동이 있어도 큰일을 이룹니다.',
  'Water-Earth': '위 수, 아래 토. 수토 혼잡. 기초는稳하나 저항이 숨어 있습니다. 착실히 나아가야 합니다.',
  'Fire-Wood': '위 화, 아래 목. 목화통명. 문재가 뛰어나고 명성이 높아지며 앞길이 창창합니다.',
  'Fire-Earth': '위 화, 아래 토. 화토상생. 밝고 따뜻하며 사업이 안정적이고 기초가 튼튼합니다.',
  'Earth-Metal': '위 토, 아래 금. 토금상생. 축적이 결실을 맺고 정직으로 재물을 얻어 명예와 이익을 모두 얻습니다.',
  'Wood-Fire': '위 목, 아래 화. 목화통명. 문명이 번창하고 재능이 발휘됩니다. 대길대리.',
  'Wood-Earth': '위 목, 아래 토. 목토상생. 기반이 점차稳固해지고 사업이稳히 상승합니다.',
  'Metal-Earth': '위 금, 아래 토. 금토상생. 신의로 성과를 지키고 부를 축적하며稳히 상승합니다.',
  'Metal-Fire': '위 금, 아래 화. 화금상극이나 서로를 단련합니다. 열화의 단련, 고생 끝에 낙이 옵니다.',
  'Wood-Water': '위 목, 아래 수. 수목상생. 근원이 있고 일이 순조로우며 길게 이어집니다.',
  'Earth-Water': '위 토, 아래 수. 토수상생이나 장애도 있습니다. 소리 없이 적시니 인내가 필요합니다.',
  'Metal-Wood': '위 금, 아래 목. 금극목. 강이 약을 이깁니다. 외부 압력이 크니 빛을 숨기고 피하세요.',
  'Fire-Metal': '위 화, 아래 금. 화극금. 약이 강을 이깁니다. 지혜와 열정으로 난관을 해결하세요.',
  'Fire-Water': '위 화, 아래 수. 화염수증. 충돌이 격렬합니다. 감정을 조절하고 충동을 피하세요.',
  'Wood-Metal': '위 목, 아래 금. 목극금. 약이 강을 이깁니다. 기책으로 이기되 정면충돌은 피하세요.',
  'Earth-Wood': '위 토, 아래 목. 토매목근. 압력이重重합니다. 본심을 지키고 인내하며 기회를 기다리세요.',
  'Metal-Metal': '금금비화. 강건상제. 양강의 기운이 충만합니다. 협력은 길나 너무 강직함을 조심하세요.',
  'Wood-Wood': '목목비화. 동기상구. 두 나무가 숲을 이루어 생기가 넘칩니다. 팀워크 대길.',
  'Fire-Fire': '화화비화. 광명섬요. 열기가 넘치고 인기가 왕성합니다. 너무 격렬하지 않게 조심하세요.',
  'Earth-Earth': '토토비화. 후덕재물.稳중如山. 기초가 튼튼합니다. 수성에 좋고 개척에는 부적합.',
  'Water-Water': '수수비화. 지혜심원. 내외원융. 부드러움이 강함을 이깁니다. 흐름을 따르는 것이 좋습니다.',
}

/** 获取指定上下卦五行的关系断辞 */
export function getGuaRelation(upperWx: string, lowerWx: string, lang?: string): string {
  const key = `上${upperWx}下${lowerWx}`
  const i18nKey = `${upperWx}-${lowerWx}`
  if (lang === 'en') {
    return MEIHUA_GUANXI_EN[i18nKey] || `Upper trigram ${upperWx}, lower trigram ${lowerWx}. Mixed elements — judge auspice by the complete hexagram.`
  }
  if (lang === 'ja') {
    return MEIHUA_GUANXI_JA[i18nKey] || `上卦${upperWx}、下卦${lowerWx}。五行が混ざり合い、吉凶は卦全体で判断すべきです。`
  }
  if (lang === 'ko') {
    return MEIHUA_GUANXI_KO[i18nKey] || `상괘 ${upperWx}, 하괘 ${lowerWx}. 오행이 섞여 있어 길흉은 괘상을 종합적으로 판단해야 합니다.`
  }
  return MEIHUA_GUANXI[key] || `上卦${upperWx}、下卦${lowerWx}，五行相杂，吉凶需综合卦象而论。`
}

// ─────────────────────────────────────────
// 2. MEIHUA_DUANCI - 六十四卦详细断辞
// 键格式："{上卦}{下卦}"，如 "乾坤"、"坎离"
// ─────────────────────────────────────────

export interface GuaDuanCi {
  overall: string   // 整体卦象分析 (80-150字)
  career: string    // 事业运势 (50-100字)
  love: string      // 感情运势 (50-100字)
  health: string    // 健康运势 (50-100字)
  wealth: string    // 财运启示 (50-100字)
}

/** 六十四卦断辞全集 */
export const MEIHUA_DUANCI: Record<string, GuaDuanCi> = {
  // ════════════════════════════════════════
  // 乾宫八卦
  // ════════════════════════════════════════

  // 乾为天
  乾乾: {
    overall: '乾为天，纯阳之卦，元亨利贞。乾上乾下，天行刚健，自强不息。六爻纯阳，光明正大之象。君子以自强不息，占得此卦者，运势极旺，万事通达，百无禁忌。但阳极则阴生，宜戒骄戒躁。',
    career: '事业如日中天，运势极盛，宜积极进取，勇于开拓。领导力强，能得众人拥护。但切记满招损，保持谦逊方能长久。',
    love: '感情顺遂，双方关系偏向阳刚，如烈火干柴。但需注意阳刚过盛，缺乏柔情，宜加些体贴温柔。单身者易遇条件优秀之对象。',
    health: '身体康健，精力充沛。惟需注意心脏、血压等火旺或阳亢之症。不宜过度劳累，劳逸结合为宜。',
    wealth: '财运亨通，正财偏财俱佳。投资可大胆出手，但不可贪得无厌，见好就收为上策。',
  },

  // ─── 乾宫一世卦 ───

  // 天风姤
  巽乾: {
    overall: '天风姤，乾上巽下，天行风从，相遇之象。风行天下，万物遇合。姤者遇也，不期而遇，意外相逢。本卦一阴五阳，一阴初生于下，有女壮之象，宜防范小人暗算。',
    career: '事业上会有意外机遇，贵人相助，出现新的合作或发展契机。但需明辨是非，防范小人，不可轻信于人。',
    love: '感情上易有不期而遇的缘分，桃花运旺。但需注意情缘来去匆匆，不宜急于定终身。已有伴侣者防第三者介入。',
    health: '偶有小恙，呼吸道或皮肤敏感。注意天气变化，适时增减衣物。保持良好作息。',
    wealth: '财运波动较大，意外之财与破财机会并存。宜谨慎理财，不可贪图小利而失大局。',
  },

  // 天山遁
  艮乾: {
    overall: '天山遁，乾上艮下，天下有山，遁藏之象。遁者退避也，山高天远，君子退隐以远小人。占得此卦，时运不佳，宜退守待时，不可妄进。但退中有进，守中求变，是智者所为。',
    career: '事业上宜退不宜进，暂避锋芒。当前环境不利，勉强向前反受其害。建议低调行事，积蓄力量等待时机。',
    love: '感情上双方可能有些疏离感，需要空间和时间。不宜强求，给彼此一些自由。暂时保持距离反而有益。',
    health: '身体状况一般，注意下肢和关节问题。宜静养，不宜剧烈运动。保持心态平和。',
    wealth: '财运低迷，不宜投资。守成为上，减少不必要的开支。现金为王，等待更好的时机。',
  },

  // 天地否
  乾坤: {
    overall: '天地否，乾上坤下，天地不交，闭塞不通之象。上乾下坤，天气上升地气下沉，阴阳隔绝，万物不生。占得此卦，宜守不宜攻，韬光养晦以待时变。否极泰来，守得云开见月明。',
    career: '事业上阻力较大，上下沟通不畅，不宜轻举妄动。此时宜静不宜动，积蓄力量，等待转机。',
    love: '感情上容易岀现隔阂，双方沟通不畅，需要耐心化解。给对方一些空间，暂缓推进。',
    health: '健康状况一般，注意呼吸系统和消化系统的问题。保持规律作息。',
    wealth: '财运不佳，不宜投资冒险。守成為上，避免破财。',
  },

  // 风地观
  坤巽: {
    overall: '风地观，巽上坤下，风行地上，观察之象。观者示也，风行大地，无所不至。君子以观民设教，审时度势。占得此卦，宜冷静观察，不宜贸然行动。韬光养晦，察言观色以待天时。',
    career: '事业上宜静观其变，不宜冒进。此时适合调研、学习、规划，为将来做准备。高处着眼，把握大局。',
    love: '感情上需要更多了解对方，不要急于表露心意。多观察、多沟通，真正了解后才能做出正确判断。',
    health: '身体无大碍，注意眼目和精神疲劳。适当放松，避免用眼过度。保持心情舒畅。',
    wealth: '财运平稳，不宜大的投资动作。小有进账，宜储蓄不宜挥霍。以观察为主，等待良机。',
  },

  // 山地剥
  坤艮: {
    overall: '山地剥，艮上坤下，山崩地裂，剥落之象。剥者落也，山附于地，久而剥落。此卦有阴消阳、小人道长、君子道消之势。占得此卦，宜谨慎保守，不可冒进。但剥极而复，终有翻身之时。',
    career: '事业上面临压力，有小人之忧，地位或有所动摇。宜低调务实，不可与人争锋。守住基本盘，等待时来运转。',
    love: '感情上可能有失落感，关系岌岌可危。需要更多的包容和理解。不要轻易说分手，冷静面对问题。',
    health: '健康需注意，特别是骨骼、牙齿和皮肤问题。不宜过度劳累，注意保养身体。',
    wealth: '财运衰败，有破财之兆。不宜投资理财，避免与人发生金钱纠纷。宜节俭度日。',
  },

  // 火地晋
  坤离: {
    overall: '火地晋，离上坤下，明出地上，晋升之象。晋者进也，旭日东升，光明照耀大地。君子以自昭明德，光明磊落。占得此卦，运势上升，前程似锦，宜积极进取，大展宏图。',
    career: '事业运势极佳，有晋升之喜，名声远扬。努力工作会得到认可和回报，前途光明。宜乘势而上。',
    love: '感情发展顺利，关系日渐明朗。双方感情稳步升温，是表白或求婚的好时机。单身者桃花运旺。',
    health: '身体状况良好，精神饱满。适合户外活动和体育锻炼，增强体质。注意防晒和避免中暑。',
    wealth: '财运亨通，正财偏财俱佳。投资理财可获不错回报，但不能过于贪婪。见好就收。',
  },

  // 天地泰
  坤乾: {
    overall: '天地泰，坤上乾下，地天交泰，万物通泰之象。上坤下乾，地气上升天气下沉，阴阳交合，万物生长。占得此卦，诸事顺遂，百无禁忌。泰者通也，君子道长，小人道消。最为吉祥之卦之一。',
    career: '事业通达顺畅，上下同心，左右逢源。合作顺利，项目推进如意。宜积极拓展，大展身手，乘势而动。',
    love: '感情美满，两情相悦，心意相通。双方关系和谐融洽，宜进一步发展。单身者极易遇到良缘。',
    health: '身体康泰，气血调和，精力充沛。身心健康，百病不侵。宜继续保持良好生活习惯。',
    wealth: '财运旺盛，得财有道。正财稳中有升，偏财亦有惊喜。适合投资理财，但不可贪得无厌。',
  },

  // ════════════════════════════════════════
  // 兑宫八卦
  // ════════════════════════════════════════

  // 天泽履
  兑乾: {
    overall: '天泽履，乾上兑下，天在上泽在下，如履薄冰之象。履者行也，礼也。天泽定位，尊卑有别。占得此卦，行事当循规蹈矩，如履虎尾，战战兢兢，终获吉祥。不可冒失僭越。',
    career: '事业上需小心谨慎，如履薄冰。宜按部就班，遵守规则，不可大贪功冒进。稳扎稳打方能成功。',
    love: '感情上需要更多的耐心和诚意，关系如履薄冰。对方可能有顾虑，需要用时间和行动来证明自己。',
    health: '身体状态尚可，但需注意饮食规律和肠胃问题。保持良好作息，避免熬夜。',
    wealth: '财运一般，不可投机取巧。遵纪守法，踏实挣钱方能长久。小有进账，不可贪多。',
  },

  // 兑为泽
  兑兑: {
    overall: '兑为泽，兑上兑下，双泽相连，喜悦之象。兑者悦也，两泽相滋，互相润泽。君子以朋友讲习，交流愉悅。占得此卦，主喜悦欢庆，口舌福至，凡事顺心如意。',
    career: '事业运势佳，人际关系融洽，合作愉快。适合从事与沟通、交流相关的工作。谈生意、签约皆顺利。',
    love: '感情甜蜜，两情相悦。双方相处愉快，如沐春风。适合约会、表白、求婚。感情生活丰富多彩。',
    health: '健康状况良好，心情愉快有助于疾病恢复。注意咽喉和声带问题，多喝温水润喉。',
    wealth: '财运不错，有进账之喜。但兑为口舌，有因口舌或娱乐破财之可能。宜理性消费。',
  },

  // 泽火革
  离兑: {
    overall: '泽火革，兑上离下，泽中有火，变革之象。革者改也，水火相息，变革更新。君子以治历明时，顺天应人。占得此卦，大变革之兆，旧去新来，破旧立新之时。虽有阵痛，终获新生。',
    career: '事业上迎来重大变革，可能是换工作、行业转型或公司改革。变革带来机遇，勇敢面对。会有一段适应期。',
    love: '感情面临转折，需要重新审视关系。旧的关系模式已经不适应当前，需要改变。有可能分手或复合。',
    health: '健康状况有变化，可能有手术或治疗。注意炎症和发热问题。变革时期压力大，注意调节情绪。',
    wealth: '财运波动大，变革期开支增加。旧有的收入来源可能出现变化。宜开源节流，为转型做准备。',
  },

  // 雷泽归妹
  震兑: {
    overall: '雷泽归妹，震上兑下，雷动泽上，婚嫁之象。归妹者女嫁也，天地之大义。但雷上泽下，阳气在上阴气在下，有阳动阴从之意。占得此卦，关于婚嫁之事主吉，其他事情则需谨慎。',
    career: '事业上可凭关系或人脉获得发展，但不宜过于依赖他人。女性的事业运更佳。注意合作中的主次关系。',
    love: '感情上有婚嫁之喜，适合结婚或订婚。已有伴侣者关系更进一步。但需注意感情中的不平等问题。',
    health: '身体尚可。注意情绪波动和内分泌调节。女性需关注妇科健康。适当运动保持活力。',
    wealth: '财运一般，结婚或社交方面的开支较大。宜理性消费，做好财务规划。',
  },

  // 水泽节
  兑坎: {
    overall: '水泽节，坎上兑下，泽上有水，节制之象。节者止也，泽水满而溢，贵在调节。君子以制度数，立规矩。占得此卦，凡事需有节制，不可过度。懂得节制方能长久。',
    career: '事业上需有节制，不可盲目扩张或过度投资。宜制定长远规划，稳扎稳打。在制度规范的范围内做事。',
    love: '感情需要把握分寸，给对方适当的空间。过于黏人或过于疏远都不利于感情发展。适度的距离产生美。',
    health: '健康方面需要注意饮食节制，不可暴饮暴食。也需节制不良嗜好，规律生活方能长久健康。',
    wealth: '财运平稳，需控制开支。节流是此卦的要义。不宜高风险投资，稳健理财为主。',
  },

  // 地泽临
  兑坤: {
    overall: '地泽临，坤上兑下，地高于泽，临近之象。临者大也，以上临下，以尊临卑。君子以教思无穷，教化万民。占得此卦，事态渐近，好事将近。宜把握时机，顺势而为。',
    career: '事业运势上升，临近成功。机会就在眼前，宜积极把握。上下级关系融洽，有贵人提携。适合展现自我。',
    love: '感情关系更进一步，临近修成正果。适合见家长或谈婚论嫁。主动出击会有好结果。',
    health: '身体状态佳，精神饱满。适合做一些身体检查和保健，为将来打好基础。',
    wealth: '财运渐旺，有收获之喜。正财收入提升，偏财亦有小得。宜储蓄积累。',
  },

  // 山泽损
  兑艮: {
    overall: '山泽损，艮上兑下，山下有泽，损下益上之象。损者减也，损下益上，损刚益柔。君子以惩忿窒欲，克制自己。占得此卦，有所损失在所难免，但损中有益，小损而大得。舍得才能获得。',
    career: '事业上可能有小的损失或付出，但长远来看是有益的。宜以退为进，先舍后得。不可斤斤计较。',
    love: '感情中需要有些牺牲和妥协，一方可能需要为另一方付出更多。但真诚的付出终有回报。',
    health: '身体略有损耗，注意劳逸结合。不要过劳，适当休息和补充营养。小病及时治疗。',
    wealth: '财运有损，支出大于收入。但这是必要的投资或开支。眼光放长远，现在的付出将来会有回报。',
  },

  // ════════════════════════════════════════
  // 离宫八卦
  // ════════════════════════════════════════

  // 天火同人
  离乾: {
    overall: '天火同人，乾上离下，天火相映，大同之象。同人者亲也，与人同者，物必归焉。君子以类族辨物，团结众人。占得此卦，众志成城，同心协力，团结一致可成大事。',
    career: '事业上宜与人合作，团队协作能发挥最大效能。人际关系佳，能得到他人支持和帮助。适合团体项目。',
    love: '感情上双方志同道合，三观一致，相处和谐。单身者可能在社交场合遇到志趣相投之人。',
    health: '身体康健，精神愉悦。心情舒畅有利于身心健康。适合参加团体运动和社交活动。',
    wealth: '财运亨通，合作生财。与人合伙或团队项目能带来不错的收益。宜分享财富，不能独食。',
  },

  // 离为火
  离离: {
    overall: '离为火，离上离下，重明照耀，光明之象。离者丽也，日月丽乎天，重明以丽乎正。君子以继明照于四方。占得此卦，光明磊落，文明昌盛，主文学、艺术、名声方面的成就。',
    career: '事业上声誉鹊起，才华得到认可。适合从事文化、艺术、教育、传媒等行业。名声远扬，前程光明。',
    love: '感情热烈，浪漫激情。双方如火光般炽热。但需注意火太大易灼伤，保持适度的冷静和理性。',
    health: '注意眼部、心脏和血液循环问题。情绪容易波动，宜保持心态平和。适合做瑜伽或冥想。',
    wealth: '财运不错，但来得快去得也快。偏财运势较好，但不可过于投机。以才华和智慧赚钱。',
  },

  // 火雷噬嗑
  离震: {
    overall: '火雷噬嗑，离上震下，雷电交加，咬合之象。噬嗑者合也，颐中有物，以齿咬碎。君子以明罚敕法，公正裁決。占得此卦，遇到阻碍需果断排除，以强力克服困难。',
    career: '事业上遇到障碍需用强力和魄力去克服。有官司诉讼或纠纷的可能，需据理力争。宜果断决策。',
    love: '感情中出现隔阂，需要主动沟通化解矛盾。有些问题就像骨鲠在喉，说开了反而好。不宜冷处理。',
    health: '注意口腔、牙部和消化系统问题。饮食需小心，避免吞咽困难。炎症需及时治疗。',
    wealth: '财运受阻，可能需要通过法律途径解决财务问题。宜破财消灾，不宜因小失大。',
  },

  // 风火家人
  离巽: {
    overall: '风火家人，巽上离下，风自火出，家道之象。家人者正也，正家而天下定矣。君子以言有物而行有恒，修身齐家。占得此卦，家庭和睦，万事兴旺，宜以家庭为核心展开事务。',
    career: '事业上宜以家庭为根基，家庭支持将带来好运。适合家族企业或居家办公。注意平衡工作与家庭。',
    love: '感情关系融洽，家庭美满。适合谈婚论嫁或添丁进口。家庭是感情的港湾，宜多花时间陪伴家人。',
    health: '身体状况不错，家庭和睦有利于身心健康。注意家务劳动中不要扭伤。',
    wealth: '财运稳定，家庭理财有方。适合投资与家庭相关的项目，如房产。家庭开源节流很好。',
  },

  // 火水未济
  离坎: {
    overall: '未济卦，离上坎下，火在水上，未完成之象。未济者未成也，小狐汔济，濡其尾。君子以慎辨物居方，谨慎行事。占得此卦，事未成，诸事尚需努力，不可急于求成。但未济非凶，尚有希望。',
    career: '事业还在发展阶段，尚未完成。宜继续努力不可松懈。项目接近尾声但仍有挑战，需要坚持到底。',
    love: '感情尚未稳定，还在磨合期。好事多磨，需要更多的耐心和诚意。不要轻言放弃。',
    health: '身体状态一般，小病不断，但无大碍。注意预防，及时调理。保持乐观心态有助于康复。',
    wealth: '财运尚未稳定，投资未到收获期。不宜追加投资，保持耐心等待时机成熟。',
  },

  // 山水蒙
  离艮: {
    overall: '山水蒙，艮上离下，山下出泉，启蒙之象。蒙者昧也，泉水初出，懵懂未明。君子以果行育德，启发智慧。占得此卦，宜学习进取，尊师重道。有疑惑是正常的，寻求智者指引为上。',
    career: '事业上处于初级阶段或遇到新领域，需要学习和请教。不宜冒进，宜虚心学习，打好基础。',
    love: '感情上处于懵懂状态，双方都在摸索中。需要更多了解对方，不宜过早下结论。多沟通多接触。',
    health: '注意儿童或青少年的健康问题。成人的话注意新陈代谢和内分泌，保持规律生活。',
    wealth: '财运尚未打开，需要学习和积累。不宜盲目投资，先学理财知识再做决策。',
  },

  // 火地晋（已在坤宫）
  // 火天大有
  乾离: {
    overall: '火天大有，乾上离下，火天同德，丰盛之象。大有者宽裕也，顺天休命，物阜民丰。君子以遏恶扬善，顺天休命。占得此卦，运势极旺，收获丰盈，诸事如意。最为吉祥之卦之一。',
    career: '事业上收获丰盛，得心应手。成果斐然，名利双收。宜乘胜追击，扩大战果。是拓展事业的好时机。',
    love: '感情丰收美满，双方相处融洽，共享幸福。单身者桃花旺盛，极易遇到优质对象。',
    health: '身体健康，精力旺盛。适合加强锻炼，提升身体素质。心情愉快，百病不侵。',
    wealth: '财运亨通，大有所获。正财偏财双丰收，投资回报丰厚。宜慷慨施舍，回馈社会。',
  },

  // ════════════════════════════════════════
  // 震宫八卦
  // ════════════════════════════════════════

  // 天雷无妄
  震乾: {
    overall: '天雷无妄，乾上震下，天下雷行，无妄之象。无妄者天德也，天命不佑，行矣哉。君子以茂对时育万物，顺其自然。占得此卦，宜顺其自然，不可妄为。妄动则招灾，守正则吉。',
    career: '事业上不宜妄动，保持现状为佳。做事要脚踏实地，不宜投机取巧。遵守规则，老实做事才能长久。',
    love: '感情要真诚相待，不可虚情假意。勉强追求或使用技巧都不如真心实意。顺其自然发展。',
    health: '注意蓄意之外的伤病。做事小心，避免意外事故。不要进行危险活动。保持良好的作息。',
    wealth: '财运平平，不宜冒险投机。正道求财，不可贪图不义之财。脚踏实地挣钱最稳。',
  },

  // 泽雷随
  兑震: {
    overall: '泽雷随，兑上震下，雷在泽下，随顺之象。随者从也，随时之义大矣哉。君子以向晦入宴息，与时俱进。占得此卦，宜追随大势，顺势而为。不可固执己见，随机应变方为上策。',
    career: '事业上宜顺潮流而动，不可逆势而为。跟随良师益友或市场趋势，能获得好的发展。灵活变通是关键。',
    love: '感情上随缘而行，不必强求。跟随心意走，缘分到了自然会在一起。已有伴侣者关系顺遂。',
    health: '身体状况随季节变化而有波动，注意适应环境变化。顺应自然的作息对健康有益。',
    wealth: '财运随市场而变，宜顺势投资。跟随趋势比固执己见更有利。见好就收，不可恋战。',
  },

  // 火雷噬嗑（已在离宫）

  // 震为雷
  震震: {
    overall: '震为雷，震上震下，雷霆万钧，震动之象。震者动也，震惊百里，不丧匕鬯。君子以恐惧修省，修身反省。占得此卦，主变动、突发、惊恐之事。虽有震动，但若能沉着应对，终获吉祥。',
    career: '事业上面临较大的变动或突发事件，可能是新机会或新挑战。保持冷静，沉着应对。变动之中有机遇。',
    love: '感情上可能有突发事件，关系出现波动。保持冷静沟通，不要被情绪左右。暴风雨后就是晴天。',
    health: '注意突发性健康问题，特别是心脑血管。避免惊吓和过度紧张。定期体检防患于未然。',
    wealth: '财运波动大，可能有意外支出。不宜高风险投机。危机中也有商机，沉着应对能找到机会。',
  },

  // 风雷益
  震巽: {
    overall: '风雷益，巽上震下，风雷激荡，增益之象。益者增也，损上益下，民说无疆。君子以见善则迁，有过则改。占得此卦，利有所往，利涉大川。凡事皆有增益，主动行动会获得更多。',
    career: '事业上收益增加，发展顺利。适合扩大规模，增加投入。上下级关系融洽，团队合作愉快。',
    love: '感情日益深厚，双方关系不断增进。适合同居或结婚。爱情中双方互有增益。',
    health: '身体状况越来越好，通过锻炼和调理有明显改善。适合开始新的健身计划。',
    wealth: '财运增益明显，收入增加，投资回报好。适合追加投资或开展新业务。财富如风雷般增长。',
  },

  // 水雷屯
  震坎: {
    overall: '水雷屯，坎上震下，雷雨交加，艰难之象。屯者难也，刚柔始交而难生。君子以经纶治国，在困难中寻求突破。占得此卦，万事开头难，虽遇困难但要坚守，終能渡过难关。',
    career: '事业刚刚起步或面临艰难局面，万事开头难。但只要坚持不懈，努力耕耘，终有收获。宜忍耐坚韧。',
    love: '感情发展缓慢，如同幼苗初生需要呵护。需要投入更多的时间和精力。给彼此多一些耐心。',
    health: '初感不适或旧疾复发，需要及时就医调理。不要讳疾忌医。注意休养，不可劳累。',
    wealth: '财运刚开始恢复，尚不稳定。宜勤俭节约，不可铺张浪费。积少成多，先求温饱再求富裕。',
  },

  // 山雷颐
  震艮: {
    overall: '山雷颐，艮上震下，山下雷动，颐养之象。颐者养也，观颐自求口实。君子以慎言语，节饮食。占得此卦，宜注重养生和自我提升。修身养性，自食其力。',
    career: '事业上宜养精蓄锐，充电学习。不宜过度劳累或急于求成。通过学习和积累提升自己。',
    love: '感情上需要用心经营和呵护。双方都需要付出关爱和陪伴。感情需要滋养才能茁壮成长。',
    health: '健康是第一要务，注意调养身体。合理饮食，适当运动，修身养性。有病及时调理。',
    wealth: '财运平稳，宜储蓄积累。不宜投机取巧，自力更生最为可靠。合理的财务规划很重要。',
  },

  // 地雷复
  震坤: {
    overall: '地雷复，坤上震下，一阳复始，復甦之象。复者反也，反复其道，七日来复。君子以至日闭关，养精蓄锐。占得此卦，冬去春来，否极泰来。运势从低潮开始回升，是转机之兆。',
    career: '事业上走出低谷，开始复苏。旧的问题正在化解，新的机遇正在出现。宜重新出发，收拾旧河山。',
    love: '感情上破镜重圆的机会很大。曾经分手或冷战的关系有望复合。放下过去的芥蒂，重新开始。',
    health: '大病初愈或身体正在恢复期。需要慢慢调养，不可操之过急。春天般的生机正在回归。',
    wealth: '财运开始回升，虽然还不旺，但势头向好。之前的损失有机会弥补回来。宜稳步前进。',
  },

  // ════════════════════════════════════════
  // 巽宫八卦
  // ════════════════════════════════════════

  // 天风姤（已在乾宫）

  // 泽风大过
  巽兑: {
    overall: '泽风大过，兑上巽下，泽灭木根，大过之象。大过者颠也，栋桡本末弱也。君子以独立不惧，遯世无闷。占得此卦，形势反常，大事过当。需有非常之勇气应对非常之局面。',
    career: '事业上面临非常规的局面，压力巨大。宜打破常规思路，以非常手段应对。独立支撑，不惧艰难。',
    love: '感情关系失衡，双方投入不对等。一方付出过多，一方享受过甚。需要重新调整关系，达到平衡。',
    health: '健康问题可能比较严重，不可忽视。需要彻底检查和治疗。身体是本钱，及时就医。',
    wealth: '财运大起大落，有过度投资或借贷之危。财力吃紧，需要节制。不宜再增加杠杆。',
  },

  // 火风鼎
  巽离: {
    overall: '火风鼎，离上巽下，木生火旺，鼎立之象。鼎者器也，以木巽火，亨饪也。君子以正位凝命，革故鼎新。占得此卦，有革旧立新、建立新格局之兆。大吉大利，万象更新。',
    career: '事业上迎来新局面，旧有模式需要革新。适合开拓新业务、推出新产品或创立新品牌。鼎立之势已成，宜大展宏图。',
    love: '感情进入新阶段，关系更加稳固。双方共同建立新的生活和未来。适合结婚、买房或共同创业。',
    health: '身体康健，如鼎之稳固。注意消化系统和营养吸收，饮食均衡为佳。旧疾有望根治。',
    wealth: '财运旺盛，建立新的财源。投资新项目或开创新业务收益可观。鼎革之后财富自聚。',
  },

  // 雷风恒
  巽震: {
    overall: '雷风恒，震上巽下，雷风相与，恒久之象。恒者久也，天地之道，恒久不已。君子以立不易方，持之以恒。占得此卦，宜坚守正道，持之以恒。恒则吉，变则凶。凡事不可三心二意。',
    career: '事业上宜持之以恒，坚守本业。不宜频繁跳槽或更换方向。长久坚持必有回报。婚姻上亦主长久。',
    love: '感情稳定长久，是细水长流之象。适合谈婚论嫁，婚姻可长久美满。忠诚和坚持是感情的关键。',
    health: '身体状况稳定，慢性病需要长期调理。坚持锻炼和规律作息对健康大有裨益。',
    wealth: '财运平稳持久，正财收入稳定。适合长期投资和价值投资，短线投机不宜。',
  },

  // 水风井
  巽坎: {
    overall: '水风井，坎上巽下，风行水上，井养之象。井者通也，改邑不改井，无丧无得。君子以劳民劝相，各安其位。占得此卦，虽无大吉亦无大凶，守成为上。井之有水，取之不尽，用之不竭。',
    career: '事业上处于稳定期，宜守成不宜开拓。现有资源足够，但需精耕细作。按部就班做好本职工作。',
    love: '感情如井水般平静，虽不热烈但长久稳定。双方各安其位，相敬如宾。平淡中见真情。',
    health: '健康状态平稳，注意饮用水洁净和肾脏调理。井水长流，身体也需持续保养。',
    wealth: '财运如井水，源源不断但不会暴富。固定收入稳定，宜节俭度日，細水长流才能积累。',
  },

  // 山风蛊
  巽艮: {
    overall: '山风蛊，艮上巽下，山下有风，蛊坏之象。蛊者事也，干父之蛊，有子考无咎。君子以振民育德，整饬修治。占得此卦，弊端显现，需整顿改革。虽然麻烦不断，但正是解决旧患的好时机。',
    career: '事业上问题丛生，积累的弊端需要彻底清理。适合整顿改革，重整旗鼓。虽然辛苦，但结果值得。',
    love: '感情上存在积怨，需要彻底沟通和修复。过去的矛盾不能回避，需要面对并解决。坦诚沟通是良药。',
    health: '身体处于亚健康状态，需要排毒和调理。旧疾或职业病需要认真对待。',
    wealth: '财运不佳，有破财之兆。可能是之前的财务问题暴露。需要整理账目、清理债务。',
  },

  // 地风升
  巽坤: {
    overall: '地风升，坤上巽下，地中生木，上升之象。升者进也，积小以高大，允升大吉。君子以顺德，积小以高大。占得此卦，运势上升，事业步步高升。宜积极进取，大有作为。',
    career: '事业蒸蒸日上，如树木生长。适合升职、跳槽到更好的平台。脚踏实地，一步一个脚印向前发展。',
    love: '感情稳步上升，关系日益亲密。适合拜见家长、订婚或结婚。双方共同成长，一起进步。',
    health: '身体日渐强健，通过调理保养有显著改善。适合培养健身习惯，坚持锻炼。',
    wealth: '财运节节攀升，收入持续增长。职业发展带来财富提升。宜扩大投资，但不可冒进。',
  },

  // ════════════════════════════════════════
  // 坎宫八卦
  // ════════════════════════════════════════

  // 天水讼
  坎乾: {
    overall: '天水讼，乾上坎下，天水违行，争讼之象。讼者争也，天与水违行，君子以作事谋始。占得此卦，主争执、诉讼、纠纷。凡事以和为贵，能化解则化解，不可争强好胜。',
    career: '事业上容易卷入纠纷和争议，特别是合约和法律问题。宜息事宁人，最好不要打官司。先谋而后动。',
    love: '感情上容易发生争执和矛盾。双方各执己见，互不相让。各退一步海阔天空，以和为贵。',
    health: '注意头部和泌尿系统问题。情绪波动大，易怒伤肝。保持心态平和很重要。',
    wealth: '财运因纠纷受损。不宜与人合伙或借钱给人。在财务合约上需格外谨慎。',
  },

  // 泽水困
  坎兑: {
    overall: '泽水困，兑上坎下，泽中无水，穷困之象。困者穷也，困而不失其所亨。君子以致命遂志，在困境中坚守志向。占得此卦，遭遇困境，诸事不顺。但困卦并非凶终，坚守正道终能脱困。',
    career: '事业上陷入困境，资源匮乏，处处碰壁。宜坚守岗位，不可轻易辞职。保持信心，困境终会过去。',
    love: '感情陷入困顿，双方都感到疲惫和无奈。需要互相扶持，共渡难关。不放弃就有希望。',
    health: '健康堪忧，体弱多病。需加强营养和调理。在困境中更要关注身体。',
    wealth: '财运困顿，经济拮据。勒紧腰带过日子。不宜投资或借贷，节流是唯一的办法。',
  },

  // 水地师
  坤坎: {
    overall: '水地师，坎上坤下，地中有水，师众之象。师者众也，师出以律，丈人吉。君子以容民畜众，蓄养民力。占得此卦，有聚众行事之象，战争、竞选、竞争等集体行动相关。纪律和规矩至关重要。',
    career: '事业上需团队作战，个人的力量有限。适合组织和管理工作。严格的纪律和流程是成功的关键。',
    love: '感情上可能有多角关系或竞争出现。注意第三方干扰。已有伴侣者需警惕感情纠葛。',
    health: '注意传染性疾病或群体环境中的健康问题。保持个人卫生，增强抵抗力。',
    wealth: '财运来自众人，团队收益可期。但需公平分配，不可独吞。靠实力竞争获得财富。',
  },

  // 坎为水
  坎坎: {
    overall: '坎为水，坎上坎下，重险之象。坎者陷也，习坎，重险也，维心亨。君子以常德行，习教事。占得此卦，险难重重，前有狼后有虎。但坎卦有维心亨之说，内心坚定可渡过重重险阻。',
    career: '事业上困难重重，步步惊心。宜谨慎行事，步步为营。不可冒进，安全第一。坚守核心业务。',
    love: '感情上面临重重考验，关系如履薄冰。但只要真心相爱，总能渡过难关。患难见真情。',
    health: '健康问题较多，需全面检查和调理。保持内心的平静和乐观很重要。',
    wealth: '财运艰险，不宜冒险投资。守住现有财产就是胜利。现金为王，减少负债。',
  },

  // 水火未济
  坎离: {
    overall: '水火未济，离上坎下，火在水上，未完成之象。未济者未成也，小狐汔济，濡其尾。君子以慎辨物居方，谨慎行事。占得此卦，事未成，尚需努力，急躁则坏事。此卦为六十四卦最后一卦，寓意循环往复。',
    career: '事业尚未成功，仍需努力。项目收尾阶段最容易出问题，需谨慎小心。坚持到底就是胜利。',
    love: '感情尚未确定，还有变数。两人关系在未完成状态，需要进一步明确。注意沟通清晰。',
    health: '身体状况不够理想，小病不断。注意调理，不要小病拖出大病。',
    wealth: '财运未稳，投资未到收获期。不宜急于求成，耐心等待。',
  },

  // 雷水解
  坎震: {
    overall: '雷水解，震上坎下，雷雨作，解厄之象。解者缓也，雷雨作，百果草木皆甲坼。君子以赦过宥罪，解除困境。占得此卦，困境即将解除，如雷雨过后天地清明。厄运将散，好运将至。',
    career: '事业上的困境即将化解，问题得到解决。宜趁机推进，扫清障碍。团队配合好，效率倍增。',
    love: '感情矛盾即将化解，误会消除。双方重归于好，关系比之前更加亲密。适合重修旧好。',
    health: '疾病将愈，身体状况开始好转。坚持下去按时服药调理，很快就会康复。',
    wealth: '财运上的困境即将解除。之前的财务压力会逐渐缓解。债务有望偿还。',
  },

  // 风水涣
  坎巽: {
    overall: '风水涣，巽上坎下，风行水上，涣散之象。涣者散也，风行水上，涣奔其机。君子以享于上帝，立庙聚众。占得此卦，有涣散分离之兆。人心离散，局面失控。但涣中有聚，及时收束尚可挽回。',
    career: '事业上人心涣散，团队缺乏凝聚力。宜及时整饬，凝聚士气。项目可能面临解散风险，需加强管理。',
    love: '感情有疏远分离之兆，双方渐行渐远。需要及时挽留和沟通，找回曾经的亲密感。',
    health: '注意元气涣散，身体虚弱。需固本培元，不宜过度消耗。多休息少熬夜。',
    wealth: '财产有流失之危，开支散漫。宜收紧财务，控制不必要的支出。不宜分散投资。',
  },

  // 水山蹇
  坎艮: {
    overall: '水山蹇，艮上坎下，山上有水，阻难之象。蹇者难也，利西南，不利东北。君子以反身修德，修身正己。占得此卦，前路艰险，举步维艰。宜知难而退，暂缓行动。修身养性以待时机。',
    career: '事业上举步维艰，前进困难。宜知难而退，不可硬闯。后退一步不是懦弱，而是为了更好的前进。',
    love: '感情上阻碍重重，进展艰难。可能需要暂时搁置，给彼此一些时间冷静思考。',
    health: '身体状况欠佳，病情反复。不宜过度奔波，以休养为主。上山下水都费力。',
    wealth: '财运受阻，求财艰难。不宜投资开拓，守住现有财富为上。',
  },

  // 山水蒙
  艮坎: {
    overall: '山水蒙，坎上艮下，山下出泉，启蒙之象。蒙者昧也，山下出泉，童蒙求我。君子以果行育德，启发智慧。占得此卦，宜虚心学习，尊师重道。有疑惑需要智者指点迷津。',
    career: '事业上处于学习阶段，需要积累知识和经验。适合拜师学艺或参加培训。不宜独立决策。',
    love: '感情上开始萌芽但尚不明朗。双方都在互相试探了解。不宜急于表白，多相处多了解。',
    health: '注意幼儿或青少年的健康问题。成年人的话注意头脑和神经系统，适当用脑。',
    wealth: '财运未开，需要先投资学习和提升。不要急于赚钱，先打好基础。',
  },

  // ════════════════════════════════════════
  // 艮宫八卦
  // ════════════════════════════════════════

  // 天山遁（已在乾宫）

  // 泽山咸
  艮兑: {
    overall: '泽山咸，兑上艮下，山上有泽，感应之象。咸者感也，柔上而刚下，二气感应。君子以虚受人，虚怀若谷。占得此卦，主感应、吸引、男女之情。感應之道在于无心之感，真诚互动。',
    career: '事业上能与合作伙伴产生共鸣，合作愉快。谈判易成功，项目推进顺畅。宜利用人际感应促进业务。',
    love: '感情最为吉利，两情相悦，互相吸引。是最佳表白和求婚时机。心有灵犀一点通。',
    health: '身体状况感应季节变化，注意适应。整体健康良好，心情愉悦则百病不侵。',
    wealth: '财运因人际关系而提升。通过合作和人脉可获得财富。缘来财聚。',
  },

  // 火山旅
  艮离: {
    overall: '火山旅，离上艮下，山上有火，行旅之象。旅者客也，旅焚其次，丧其童仆。君子以慎用刑而不留狱，明察秋毫。占得此卦，有远行、漂泊、外出之象。在外需小心谨慎，不可大意。',
    career: '事业上有出差、外派或变动之可能。适合在异地发展或开拓外地市场。在外打拼需要注意安全。',
    love: '感情上可能是异地恋或旅行中遇到缘分。但旅途之恋难以长久，需慎重。双方需要更多安全感。',
    health: '旅途劳顿，注意疲劳和饮食卫生。出门在外要注意安全和健康。',
    wealth: '财运在外，外出求财比本地更有机会。但旅途花费也大，需做好预算。',
  },

  // 雷山小过
  艮震: {
    overall: '雷山小过，震上艮下，雷在小山上，小过之象。小过者过也，飞鸟遗之音，宜下不宜上。君子以行过乎恭，丧过乎哀，用过乎俭。占得此卦，有小过失或小波折。大事不可为，小事可为。低调行事。',
    career: '事业上宜从小处着手，不宜好高骛远。做小事可成，做大事则力不从心。注意细节避免过失。',
    love: '感情上有小摩擦和小误会，但无伤大雅。注意小事上不要太计较，包容为上。',
    health: '身体有小恙，如感冒、小外伤等。无大碍，但需及时处理。小鸟飞过留下声音，不必过于紧张。',
    wealth: '财运有小得，但可能会因为小的过失而破财。谨慎理财，注意小额开支。',
  },

  // 风山渐
  艮巽: {
    overall: '风山渐，巽上艮下，山上有木，渐进之象。渐者进也，女归吉，进得位。君子以居贤德善俗，循序渐进。占得此卦，宜循序渐进，不可急躁。如女子出嫁般自然而然，按部就班则吉。',
    career: '事业上宜循序渐进，一步一个脚印。不宜急于求成，稳步发展最为可靠。适合按计划推进。',
    love: '感情顺其自然发展，水到渠成。适合慢慢培养感情，日久生情之象。婚事宜按礼仪循序渐进。',
    health: '身体逐步改善，康复是一个渐进过程。需要耐心坚持，不可急于求成。',
    wealth: '财运缓慢增长，积少成多。适合定投和长期理财。发财不在速，在于稳。',
  },

  // 水山蹇（已在坎宫）

  // 艮为山
  艮艮: {
    overall: '艮为山，艮上艮下，双山矗立，静止之象。艮者止也，时止则止，时行则行。君子以思不出其位，安守本分。占得此卦，宜停止行动，静观其变。动不如静，行不如止。',
    career: '事业上宜暂停行动，不宜推进新项目。休整时期，反思总结为主。安守现有岗位。',
    love: '感情上需要冷静，不宜急于发展。暂时保持距离，给双方一些思考的时间。',
    health: '健康方面需要静养，不宜剧烈运动。休息是最好的治疗。注意背部和关节问题。',
    wealth: '财运静止不动，没有进账也没有大的支出。宜储蓄，不宜投资。',
  },

  // 地山谦
  艮坤: {
    overall: '地山谦，坤上艮下，山藏于地，谦逊之象。谦者退也，谦谦君子，卑以自牧。君子以裒多益寡，称物平施。占得此卦，最为吉祥之卦之一。谦虚使人进步，谦逊者终得大利。满招损，谦受益。',
    career: '事业上谦虚低调能带来好运气。不居功不自傲，反而能得到更多的认可和提拔。团队合作愉快。',
    love: '感情上相互谦让，关系和谐。双方懂得为对方考虑，不争不抢。谦逊的态度让感情更甜蜜。',
    health: '身体状态良好，心态平和是健康的保证。谦虚使人心情舒畅，百病不侵。',
    wealth: '财运亨通，谦虚反而能聚财。不炫耀财富，财富自然积累。适合低调理财。',
  },

  // ════════════════════════════════════════
  // 坤宫八卦
  // ════════════════════════════════════════

  // 天地泰（已在乾宫）

  // 地泽临（已在兑宫）

  // 火地晋（已在离宫）

  // 雷地豫
  坤震: {
    overall: '雷地豫，震上坤下，雷出地奋，愉悦之象。豫者悦也，顺以动，天地如之。君子以作乐崇德，乐天知命。占得此卦，主欢乐、愉悦、安逸。宜享受生活，但不可过于放纵。乐极则生悲。',
    career: '事业上顺利愉悦，工作氛围轻松愉快。宜利用良好的人际关系推进工作。但不可放松过头。',
    love: '感情愉悦甜蜜，双方相处愉快。适合约会出游，享受二人世界。但不可纵情过度。',
    health: '身体健康，心情愉悦。但注意不要暴饮暴食或过度享乐损害健康。适度娱乐。',
    wealth: '财运不错，有意外之喜。但花钱也痛快，容易大手大脚。宜控制消费欲。',
  },

  // 风地观（已在乾宫）

  // 水地比
  坎坤: {
    overall: '水地比，坎上坤下，地上有水，亲比之象。比者辅也，地上有水，亲比之象。君子以建万国亲诸侯，广结善缘。占得此卦，人际关系和谐，亲附团结之象。宜交友结盟，得道多助。',
    career: '事业上人际关系极佳，合作伙伴得力。宜积极建立人脉网络，团队协作顺畅。上下级关系融洽。',
    love: '感情甜蜜，如胶似漆。双方亲密无间，心心相印。适合一起规划未来。',
    health: '身体状态良好，气血调和。良好的社交关系也有助于心理健康。',
    wealth: '财运来自人际合作，合伙获利丰厚。人脉即是财脉，广结善缘致富。',
  },

  // 山地剥（已在乾宫）

  // 坤为地
  坤坤: {
    overall: '坤为地，坤上坤下，厚德载物，柔顺之象。坤者顺也，厚德载物，君子以厚德载物。占得此卦，宜以柔克刚，以静制动。包容万物，顺势而为。阴柔之德，可化育万物。',
    career: '事业上不宜独立开创，适合配合和辅助他人。做好本职工作，辅佐上级。厚积薄发，迟早会有表现的机会。',
    love: '感情包容柔和，双方关系温韾。柔情似水，细水长流。适合以柔克刚，包容对方。',
    health: '身体状态稳定，注意土气过旺伤及脾胃。适合温和的运动如散步、瑜伽。',
    wealth: '财运稳定，靠积累和省俭获得财富。厚德载物，德厚则财聚。不宜投机。',
  },

  // ─── 补充：前文注释中未列出的卦 ───

  // 泽天夬
  乾兑: {
    overall: '泽天夬，兑上乾下，泽在天上，决断之象。夬者决也，刚决柔也。君子以施禄及下，居德则忌。占得此卦，当断则断，不受其乱。决断是非，当机立断。犹豫不决则反受其害。',
    career: '事业上到了需要做出决断的时刻。当断不断反受其乱。勇往直前，果断决策。适合清除障碍。',
    love: '感情上需要做出抉择，不可拖泥带水。告别不合适的感情，迎接新的开始。宜果断决定。',
    health: '注意外科手术或急性问题需要果断处理。不宜拖延病情。',
    wealth: '财运上需要决断，割肉止损或果断投资。犹豫不决会错失良机。',
  },

  // 雷天大壮
  乾震: {
    overall: '雷天大壮，震上乾下，雷在天上，大壮之象。大壮者刚以动也，非礼弗履，刚健不怠。君子以非礼弗履，刚健中正。占得此卦，气势强盛，正当壮年。宜积极进取，但不可恃强凌弱。',
    career: '事业气势如虹，力量强大。宜大胆开拓，乘势而上。但切记不可驕横跋扈，保持谦逊。',
    love: '感情中阳刚之气过盛，需注意男女之间的平衡。男方不宜过于强势。温馨提醒，刚柔并济才好。',
    health: '身体强壮，精力充沛。适合高强度运动。但注意不要过度消耗体能。',
    wealth: '财运强盛，收获颇丰。但不可贪得无厌，见好就收。强盛之时宜积累。',
  },

  // 风天小畜
  乾巽: {
    overall: '风天小畜，巽上乾下，风行天上，小畜之象。小畜者柔得位也，风行天上，懿文德也。君子以懿文德，蓄养文德。占得此卦，小有积蓄，但尚未大成。宜蓄养力量，等待时机。',
    career: '事业上有小成，但距离大功尚远。宜继续积累，不宜满足现状。蓄势待发，厚积薄发。',
    love: '感情在积累阶段，虽有进展但未成熟。需要继续培养感情。小投资换大回报。',
    health: '身体状态在恢复和积累中。有小进步，但需继续坚持。积小胜为大胜。',
    wealth: '小有积蓄，财运尚可但非大富。精打细算，积少成多。',
  },

  // 水天需
  乾坎: {
    overall: '水天需，坎上乾下，云上于天，需待之象。需者须也，险在前也，刚健不陷。君子以饮食宴乐，耐心等待。占得此卦，尚需等待，不宜急进。时机未到，强求无益。',
    career: '事业上需要耐心等待时机，不宜贸然行动。现在不是出手的时机，继续准备。守时待命。',
    love: '感情上急不得，缘分未到。给对方一些时间和空间。耐心等待，该来的总会来。',
    health: '身体需要休养和调理，不宜急于恢复。病去如抽丝，耐心调养。',
    wealth: '财运未到，需要等待。不宜急于投资，现金为王。时机成熟自然水到渠成。',
  },

  // 山天大畜
  乾艮: {
    overall: '山天大畜，艮上乾下，天在山中，大畜之象。大畜者蓄也，刚健笃实，辉光日新。君子以多识前言往行，以畜其德。占得此卦，蓄積雄厚，如天在山中。宜积蓄德能，韬光养晦，大器晚成。',
    career: '事业上积蓄雄厚，虽尚未展露但根基扎实。适合积累知识、资源和人脉。厚積薄发，迟早一鸣惊人。',
    love: '感情上有深厚的基础，虽不张扬但很稳定。日久生情，感情深厚。订婚或结婚均有好结果。',
    health: '身体状况尚可，但需注意长期积累的问题。养生重在积累，贵在坚持。',
    wealth: '财运雄厚，积蓄颇丰。不宜露富，韬光养晦。财富在积累中增长。',
  },

  // 火泽睽
  兑离: {
    overall: '火泽睽，离上兑下，上火下泽，乖离之象。睽者乖也，二女同居，其志不同行。君子以同而异，求同存异。占得此卦，对立分歧之象。双方意见不合，各怀心思。宜求同存异，化解矛盾。',
    career: '事业上意见分歧，合作出现裂痕。宜求同存异，寻找共同利益点。不可固执己见导致分裂。',
    love: '感情上两人志趣不合，分歧较大。需要更多的理解和包容。性格不同需要磨合。',
    health: '注意身体左右不对称的问题，或有炎症。情绪影响健康，保持平和心态。',
    wealth: '财运因分歧而受损。合伙生意可能因意见不合而散伙。谨慎处理合作关系。',
  },

  // 风泽中孚
  兑巽: {
    overall: '风泽中孚，巽上兑下，风在泽上，诚信之象。中孚者信也，信及豚鱼，诚信之至。君子以议狱缓死，诚信感化。占得此卦，诚信为本，以诚待人。诚信可以感化一切，化险为夷。',
    career: '事业上诚信是最好的策略。以诚待人，信誉至上。谈判签约非常顺利。适合搞信誉建设。',
    love: '感情真诚以待，诚信是感情的基石。双方互相信任，感情牢固。适合长期承诺。',
    health: '身心健康，诚信待人内心坦荡。心胸开阔有助于健康。注意呼吸系统。',
    wealth: '财运因信誉而来。诚信经营，财源广进。不义之财不可取。',
  },

  // 地火明夷
  离坤: {
    overall: '地火明夷，坤上离下，火入地中，受伤之象。明夷者伤也，以蒙大难，利艰贞。君子以莅众用晦而明，韬光养晦。占得此卦，光明受损，遭受挫折。宜隐忍蛰伏，不可强出头。',
    career: '事业上遭遇挫折，才华被压制。宜低调行事，隐忍待机。暂时收敛锋芒，不可与强权对抗。',
    love: '感情上受到伤害或压制，内心痛苦。需要时间疗伤。不宜急于开始新感情。',
    health: '健康状况不佳，尤其是眼睛或心血管问题。需要休养调理。',
    wealth: '财运受损，投资失利。宜减少开支，保住本金。不要扩大投资。',
  },

  // 泽雷随（已在震宫，此补完整）

  // 火雷噬嗑（已在离宫）

  // 风雷益（已在震宫）

  // 泽雷随（已在震宫）

  // 火雷噬嗑（已在离宫）

  // ─── 补充：此前遗漏的卦 ───

  // 火雷噬嗑（已在离宫）

  // 火雷噬嗑
  震离: {
    overall: '火雷噬嗑，离上震下，雷电交加，咬合之象。噬嗑者合也，颐中有物，以齿咬碎。君子以明罚敕法，公正裁决。占得此卦，遇到阻碍需果断排除，以强力克服困难。',
    career: '事业上遇到障碍需用强力和魄力去克服。有官司诉讼或纠纷的可能，需据理力争。宜果断决策。',
    love: '感情中出现隔阂，需要主动沟通化解矛盾。有些问题就像骨鲠在喉，说开了反而好。不宜冷处理。',
    health: '注意口腔、牙部和消化系统问题。饮食需小心，避免吞咽困难。炎症需及时治疗。',
    wealth: '财运受阻，可能需要通过法律途径解决财务问题。宜破财消灾，不宜因小失大。',
  },

  // 巽为风
  巽巽: {
    overall: '巽为风，巽上巽下，两风相随，柔顺之象。巽者入也，随风巽，君子以申命行事。君子以申命行事，顺从天道。占得此卦，宜柔順行事，不可刚强。随风而行，顺势而为。',
    career: '事业上宜顺从上级指示，不宜标新立异。适合辅助性的工作，不宜争当领头羊。低调务实。',
    love: '感情中宜多顺从对方意见，不可过于强势。百炼钢不如绕指柔，温柔体贴才是上策。',
    health: '注意呼吸系统、风邪感冒。春季需防风。身体敏感，适应能力好但也有脆弱的一面。',
    wealth: '财运随风而来，有小财入账但不大。宜随大流投资，不宜特立独行。',
  },

  // 泽地萃
  坤兑: {
    overall: '泽地萃，兑上坤下，泽在地上，聚集之象。萃者聚也，聚以正也，观其所聚。君子以除戎器，戒不虞。占得此卦，群英荟萃，人才聚集。宜集会结社，团结力量。但聚众需有正道。',
    career: '事业上人才聚集，团队力量强大。适合招聘、组建团队或举办大型活动。人脉汇聚带来机遇。',
    love: '感情上周围追求者众多，桃花旺盛。选择的时候要谨慎，不要被表象迷惑。',
    health: '注意人群聚集时的传染风险。人多的地方注意卫生。',
    wealth: '财运集中，人聚财聚。通过社交和团体活动可获得财富。合伙收益良好。',
  },

  // 水地比（已在坤宫）
}

// ────────────────────────────────────────────────────
// 2b. MEIHUA_DUANCI_EN / MEIHUA_DUANCI_JA / MEIHUA_DUANCI_KO
// 六十四卦断辞多语言翻译表
// ────────────────────────────────────────────────────

/** 六十四卦断辞 - 英文翻译 */
export const MEIHUA_DUANCI_EN: Record<string, GuaDuanCi> = {
  乾乾: {
    overall: 'Heaven above Heaven — pure yang, primal power. The movement of heaven is strong and unceasing. All six lines are yang, signifying brightness and righteousness. This is a time of peak fortune — all endeavors prosper. But as yang reaches its zenith, yin is born; guard against pride and impatience.',
    career: 'Career is at its zenith. Charge forward boldly with leadership. But remember: pride invites loss. Stay humble to endure.',
    love: 'Relationships are passionate and straightforward, like dry wood meeting fire. But yang energy may dominate — add tenderness. Singles may meet exceptional partners.',
    health: 'Excellent health and abundant energy. Watch for heart and blood pressure issues (yang hyperactivity). Balance work and rest.',
    wealth: 'Prosperous in both primary and windfall wealth. Invest boldly but avoid greed. Quit while you are ahead.',
  },
  巽乾: {
    overall: 'Wind under Heaven — encounter of the unexpected. Wind travels across the sky, all things meet by chance. One yin line arises beneath five yang — beware of hidden schemers.',
    career: 'Unexpected opportunities arise with benefactors. New cooperation or development prospects appear. Discern wisely and guard against villains.',
    love: 'Romantic encounters happen unexpectedly — blooming peach blossom luck. But these come and go swiftly. Existing couples guard against third parties.',
    health: 'Minor ailments — respiratory or skin sensitivity. Watch weather changes, dress appropriately, maintain good routines.',
    wealth: 'Fluctuating fortune — windfall and loss coexist. Prudent financial management is key. Do not sacrifice grand plans for petty gain.',
  },
  艮乾: {
    overall: 'Mountain under Heaven — retreat and concealment. The wise withdraw in difficult times. Though the times are unfavorable, there is advancement in retreat. Patience and adaptability are the marks of wisdom.',
    career: 'Retreat rather than advance. Current environment is unfavorable — forcing forward will bring harm. Stay low, gather strength, await the right moment.',
    love: 'A sense of distance may grow between partners. Space and time are needed. Do not force — keeping distance may benefit the relationship.',
    health: 'General condition — watch for leg and joint issues. Rest is better than strenuous exercise. Maintain a peaceful mind.',
    wealth: 'Poor financial luck — avoid investing. Preservation is paramount. Reduce expenses, keep cash reserves, wait for a better opportunity.',
  },
  乾坤: {
    overall: 'Earth under Heaven — obstruction and blockage. Heaven\'s energy rises while Earth\'s descends — yin and yang are separated, nothing thrives. Hold firm and do not advance. Extreme blockage brings reversal — the moon will shine through the clouds.',
    career: 'Resistance is heavy — communication breaks down. Do not act rashly. Gather strength and wait for the turning point.',
    love: 'Misunderstandings arise between partners — communication breaks down. Patience is needed. Give each other space, pause advancement.',
    health: 'Fair condition — watch respiratory and digestive systems. Maintain regular routines.',
    wealth: 'Poor financial luck — avoid risky investments. Preservation is the priority. Prevent financial loss.',
  },
  坤巽: {
    overall: 'Wind over Earth — observing and contemplating. The wind travels across the land, seeing all. Observe calmly, do not act rashly. Study, plan, read the signs before moving.',
    career: 'Observe and wait rather than advance. This is a time for research, learning, and planning. See the big picture from above.',
    love: 'Get to know each other better before declaring intentions. Observe more, communicate more, and make the right judgment.',
    health: 'No major issues — watch for eye strain and mental fatigue. Relax appropriately, maintain a cheerful mood.',
    wealth: 'Stable fortune — no major investment moves. Small income — save rather than spend. Observe and wait for opportunities.',
  },
  坤艮: {
    overall: 'Mountain over Earth — collapse and stripping away. Yin overtakes yang, the villain\'s path rises and the noble\'s path fades. Be cautious and conservative. But after extreme stripping, renewal comes.',
    career: 'Pressure mounts — schemers threaten your position. Stay low and pragmatic, do not confront. Defend your base, await the turnaround.',
    love: 'Feelings of loss may arise — the relationship teeters. More tolerance and understanding are needed. Do not break up lightly; face problems calmly.',
    health: 'Watch for skeletal, dental, and skin problems. Avoid overwork, take good care of yourself.',
    wealth: 'Declining fortune — signs of financial loss. Avoid investments and money disputes. Practice frugality.',
  },
  坤离: {
    overall: 'Fire over Earth — the sun rises above the ground, ascending. One who is cultivated shines brightly. Fortune rises, the future is bright. Charge forward with ambition.',
    career: 'Excellent career fortune — promotion and fame are at hand. Hard work is recognized and rewarded. The future is bright — ride the momentum.',
    love: 'Relationships progress smoothly — feelings warm day by day. An excellent time for confession or proposal. Singles enjoy vibrant peach blossom luck.',
    health: 'Good health, high spirits. Suitable for outdoor activities and exercise. Guard against sunburn and heatstroke.',
    wealth: 'Prosperous in both primary and windfall wealth. Investments yield good returns — but do not be greedy. Quit while ahead.',
  },
  坤乾: {
    overall: 'Heaven over Earth — communication between high and low, all things flow freely. Earth qi rises, heaven qi descends — yin and yang unite, all things flourish. An extremely auspicious hexagram — everything goes smoothly.',
    career: 'Smooth and unimpeded — superiors and subordinates are of one mind. Cooperation goes well, projects advance. Expand actively and seize momentum.',
    love: 'Loving and harmonious — hearts and minds connect. Existing relationships flourish. Singles easily encounter good fortune.',
    health: 'Excellent health — qi and blood are balanced, energy abounds. Keep up good living habits.',
    wealth: 'Strong fortune — wealth comes through proper channels. Primary income rises steadily, windfall joy arrives. Invest wisely but avoid greed.',
  },
  兑乾: {
    overall: 'Heaven over Lake — treading carefully as if on thin ice. Follow rules and regulations strictly, like walking on a tiger\'s tail. Caution and reverence bring good fortune. Do not overstep.',
    career: 'Proceed with caution — tread lightly. Follow the rules strictly, do not seek excessive credit. Steady progress is the path to success.',
    love: 'More patience and sincerity are needed — the relationship is fragile. The other may have reservations — prove yourself with time and action.',
    health: 'Fair condition — watch digestion and stomach issues. Maintain good routines, avoid staying up late.',
    wealth: 'Ordinary fortune — avoid speculating. Earn money honestly through hard work. Small income — do not be greedy.',
  },
  兑兑: {
    overall: 'Lake over Lake — twin lakes nourishing each other; joy and delight. The noble one delights in friends and learning. This hexagram signals celebration, good fortune, and smooth sailing.',
    career: 'Good career fortune — harmonious interpersonal relations, joyful cooperation. Suitable for communication-related work. Negotiations and signings go smoothly.',
    love: 'Sweet love — mutual joy. Time together is delightful like a spring breeze. Good for dates, confessions, proposals.',
    health: 'Good health — cheerfulness aids recovery. Watch throat and vocal cords — drink warm water.',
    wealth: 'Decent fortune — income arrives. But the mouth brings both joy and expense — spend rationally.',
  },
  离兑: {
    overall: 'Lake with Fire beneath — transformation and revolution. Fire and water contend — the old departs and the new arrives. Though painful at first, rebirth follows.',
    career: 'Major career changes — job change, industry shift, or company reform. Change brings opportunity. Face it bravely — an adaptation period awaits.',
    love: 'Relationships face a turning point — re-evaluate. Old patterns no longer fit — change is needed. Could mean breakup or reconciliation.',
    health: 'Health changes — possible surgery or treatment. Watch for inflammation and fever. Great change brings stress — manage emotions.',
    wealth: 'Fluctuating fortune — expenses rise during change. Old income sources may shift. Broaden income and cut costs to prepare for transition.',
  },
  震兑: {
    overall: 'Thunder over Lake — the maiden marries. Thunder moves above, the lake responds below. Matters of marriage are auspicious; otherwise, proceed with caution.',
    career: 'Development may come through relationships or connections, but don\'t rely too heavily on others. Women\'s career luck is better. Note power dynamics.',
    love: 'Marriage joy — good for weddings or engagements. Existing relationships deepen. But watch for inequality in the relationship.',
    health: 'Fair — watch for emotional fluctuation and endocrine issues. Women should pay attention to gynecological health.',
    wealth: 'Average — wedding or social expenses run high. Spend rationally with good financial planning.',
  },
  兑坎: {
    overall: 'Water over Lake — the lake is full, moderation is key. Know when to stop. Establish rules and abide by them. Everything requires moderation — excess harms.',
    career: 'Exercise restraint — do not expand blindly or overinvest. Set long-term plans and work steadily within established frameworks.',
    love: 'Relationships need proper boundaries — give each other space. Being too clingy or too distant both harm. Moderate distance creates beauty.',
    health: 'Watch diet and avoid overindulgence. Curb bad habits for long-term health.',
    wealth: 'Stable — control spending. Frugality is key. Avoid high-risk investments — wealth management is the priority.',
  },
  兑坤: {
    overall: 'Earth over Lake — approach and nearing. Good things draw near. Grasp the opportunity and go with the flow. The noble one teaches endlessly.',
    career: 'Fortune is rising — success is near. Opportunity is at hand — seize it actively. Harmonious relations with superiors bring benefactors.',
    love: 'Relationships take the next step — approaching fruition. Good time for meeting parents or discussing marriage. Take initiative.',
    health: 'Excellent — full of energy. Suitable for health checkups and wellness routines.',
    wealth: 'Growing fortune — gains arrive. Primary income rises, small windfalls appear. Save and accumulate.',
  },
  兑艮: {
    overall: 'Mountain over Lake — decrease below, benefit above. Loss is inevitable but contains gain — small loss for great gain. One must give up to receive.',
    career: 'Small losses or sacrifices occur, but benefit in the long run. Retreat to advance, give first to gain later. Do not be petty.',
    love: 'Some sacrifice and compromise needed — one party may give more. Sincere giving is eventually rewarded.',
    health: 'Slight depletion — balance work and rest. Do not overwork; rest and nourish. Treat minor ailments promptly.',
    wealth: 'Loss — expenses exceed income. But this is necessary investment or spending. Take the long view — current sacrifice will pay off.',
  },
  离乾: {
    overall: 'Heaven with Fire — universal fellowship. United as one, all things come together. The noble one unites people and discerns things. Solidarity achieves great things.',
    career: 'Cooperation is key — teamwork yields maximum results. Excellent interpersonal relations with support from others. Suitable for group projects.',
    love: 'Like-minded partners — aligned values and harmonious interaction. Singles may meet kindred spirits in social settings.',
    health: 'Good health and happy spirits — relaxation benefits body and mind. Suitable for group sports and social activities.',
    wealth: 'Prosperous — cooperation brings wealth. Partnerships or team projects yield good returns. Share wealth, do not hoard.',
  },
  离离: {
    overall: 'Fire upon Fire — double brilliance shining brightly. Splendor and civilization flourish. The noble one\'s light illuminates the four directions. This hexagram signals achievement in literature, art, and reputation.',
    career: 'Reputation soars — talent is recognized. Suitable for culture, art, education, and media. Fame spreads, the future is bright.',
    love: 'Intense romance — passion like flame. But fire too hot can burn — maintain composure and rationality.',
    health: 'Watch eyes, heart, and circulation. Emotions fluctuate easily — maintain inner peace. Yoga or meditation helps.',
    wealth: 'Decent fortune — quick in, quick out. Windfall luck is good but avoid excessive speculation. Earn through talent and wisdom.',
  },
  离震: {
    overall: 'Thunder and Fire — biting through obstacles. Something sticks in the jaw — bite down and break it. The noble one enforces justice. Remove obstacles with determination.',
    career: 'Obstacles must be overcome with force and resolve. Lawsuits or disputes may arise — argue on principle. Decisive action is needed.',
    love: 'Barriers in the relationship — communicate proactively to resolve. Some issues are like a fishbone stuck in the throat — speaking about them clears the air.',
    health: 'Watch mouth, teeth, and digestion. Eat carefully, avoid choking hazards. Treat inflammation promptly.',
    wealth: 'Blocked fortune — legal action may be needed for financial issues. Spending to resolve trouble is acceptable — don\'t lose big for being petty.',
  },
  离巽: {
    overall: 'Wind and Fire — the family. Wind rises from fire — the way of the household. The noble one speaks with substance and acts with constancy. Harmonious family brings prosperity in all endeavors.',
    career: 'Family is the foundation of career success — family support brings good fortune. Suitable for family businesses or home offices. Balance work and family.',
    love: 'Harmonious relations — family bliss. Good for marriage or having children. Family is the harbor of love — spend time with loved ones.',
    health: 'Good condition — family harmony benefits health. Watch for strains during housework.',
    wealth: 'Stable fortune — wise family financial management. Suitable for family-related investments like real estate.',
  },
  离坎: {
    overall: 'Water over Fire — incompletion. The little fox almost crosses the stream but wets its tail. Things are not yet finished — continue striving. Unfinished is not unlucky — hope remains.',
    career: 'Still in development — not yet complete. Keep working, do not slacken. The project nears completion but challenges remain — persevere.',
    love: 'Not yet stable — still in the磨合 phase. Good things take time — more patience and sincerity needed. Do not give up easily.',
    health: 'Fair — minor ailments come and go but nothing serious. Preventive care and timely recuperation. Optimism aids recovery.',
    wealth: 'Not yet stable — investments not yet at harvest time. Do not add more capital. Be patient and wait for the right time.',
  },
  离艮: {
    overall: 'Mountain over Fire — a spring emerging from the mountain; enlightenment. The child seeks the teacher. One should learn and advance, respect the teacher and value the Way. Doubt is normal — seek guidance from the wise.',
    career: 'At the early stage or facing a new field — learn and consult. Do not advance rashly — study humbly and build a foundation.',
    love: 'Still in a hazy stage — both are exploring. Get to know each other more before drawing conclusions. Communicate and spend more time together.',
    health: 'Watch children\'s or adolescents\' health. For adults, watch metabolism and endocrine. Keep regular routines.',
    wealth: 'Fortune not yet open — learn and accumulate. Do not invest blindly — study financial knowledge first.',
  },
  乾离: {
    overall: 'Fire over Heaven — abundance and great possession. Heaven and fire share virtue — abundant harvest. The noble one discourages evil and promotes good. Extremely auspicious — bountiful rewards, everything goes well.',
    career: 'Harvest is abundant — smooth sailing, fame and fortune both arrive. Seize the victory and expand your gains. An excellent time to grow your business.',
    love: 'Relationships are bountiful and happy — mutual joy and shared happiness. Singles are awash in peach blossom luck, easily finding quality partners.',
    health: 'Healthy and energetic — good for strengthening exercise. Happy mood keeps all illness at bay.',
    wealth: 'Great fortune — both primary and windfall wealth arrive. Investment returns are generous. Give charitably to give back to society.',
  },
  震乾: {
    overall: 'Thunder under Heaven — no falsehood. Heaven\'s mandate does not favor false action. Go with the flow, do not act recklessly. Reckless action invites disaster — staying righteous brings good fortune.',
    career: 'Do not act rashly — keep the status quo. Be down-to-earth, avoid shortcuts. Follow rules, work honestly for lasting results.',
    love: 'Be sincere — false feelings will not do. Forcing or using tricks is worse than being genuine. Let love develop naturally.',
    health: 'Watch for accidents and injuries. Be careful to avoid mishaps. Avoid dangerous activities. Maintain good routines.',
    wealth: 'Flat fortune — avoid speculative ventures. Earn through righteous means — do not covet ill-gotten gains.',
  },
  兑震: {
    overall: 'Thunder under Lake — following and adapting. Follow the times, do not be stubborn. Adaptability is the highest wisdom. Follow the trend and superior guides.',
    career: 'Go with the flow — do not swim against the current. Following mentors, friends, or market trends brings good development. Flexibility is key.',
    love: 'Follow fate — do not force. Follow your heart — when the time comes, you will come together. Existing relationships go smoothly.',
    health: 'Condition fluctuates with seasons — adapt to environmental changes. Following nature\'s rhythms benefits health.',
    wealth: 'Fortune changes with the market — invest following trends. Following trends beats stubbornness. Quit while ahead, do not linger.',
  },
  震震: {
    overall: 'Thunder upon Thunder — thunderous power, quaking and shaking. A hundred miles tremble but the sacrificial vessels remain. The noble one examines himself with fear and reverence. Tremendous change, sudden shocks, and surprises. Mental composure brings eventual fortune.',
    career: 'Major changes or sudden events — new opportunities or challenges. Stay calm, respond with composure. Opportunity lies within upheaval.',
    love: 'Sudden events may cause relationship turbulence. Communicate calmly, do not be ruled by emotion. Calm follows the storm.',
    health: 'Watch for sudden health issues, especially cardiovascular. Avoid fright and excessive stress. Regular checkups prevent trouble.',
    wealth: 'Highly volatile — unexpected expenses may arise. Avoid high-risk speculation. Crisis also holds opportunity — respond calmly.',
  },
  震巽: {
    overall: 'Wind over Thunder — increase and benefit. Wind and thunder stir each other — loss above, gain below. The noble one follows good and corrects faults. All matters gain by active effort.',
    career: 'Increasing returns, smooth development. Suitable for expansion and increased investment. Harmonious with superiors and subordinates, joyful teamwork.',
    love: 'Love deepens daily — relationship continually improves. Good for cohabitation or marriage. Both parties benefit mutually.',
    health: 'Improving health — noticeable gains through exercise and care. Good time to start a new fitness regimen.',
    wealth: 'Clear gains — increased income, good investment returns. Suitable for additional investment or new ventures.',
  },
  震坎: {
    overall: 'Water over Thunder — difficulty at the beginning. Thunder and rain mingle — a hard birth. All beginnings are difficult. Persevere through hardship and you will eventually prevail.',
    career: 'Early stage or facing difficulties — starting is always hard. But persistence and hard work will eventually be rewarded. Endure with patience.',
    love: 'Slow progress — like a seedling needing care. Invest more time and attention. Be patient with each other.',
    health: 'Initial discomfort or recurring condition — seek medical attention promptly. Do not hide from illness. Rest and avoid exhaustion.',
    wealth: 'Fortune just starting to recover — not yet stable. Be thrifty and frugal. Accumulate gradually.',
  },
  震艮: {
    overall: 'Mountain over Thunder — nourishment and self-cultivation. At the foot of the mountain, thunder stirs. Nourish yourself — watch your words and moderate your diet. Focus on health and self-improvement.',
    career: 'Rest and recharge — study and learn. Do not overwork or rush for results. Improve yourself through learning and accumulation.',
    love: 'Relationships need dedicated care and attention. Both partners need to express love and companionship. Love needs nourishment to flourish.',
    health: 'Health is the first priority — focus on recuperation. Eat well, exercise appropriately, cultivate your spirit.',
    wealth: 'Stable — save and accumulate. Avoid shortcuts — self-reliance is most reliable. Sound financial planning matters.',
  },
  震坤: {
    overall: 'Earth over Thunder — return and revival. One yang returns after seven days. Winter passes, spring arrives. Fortune rebounds from a low ebb — a turning point approaches.',
    career: 'Emerging from the valley — recovery begins. Old problems dissolve, new opportunities appear. Time to start anew.',
    love: 'Good chance of reconciliation. Broken relationships or cold wars may heal. Let go of past grievances and restart.',
    health: 'Recovering from illness — slowly recuperate. Do not rush the process. The vitality of spring is returning.',
    wealth: 'Recovering — though not yet strong, the trend is positive. Previous losses may be recouped. Steady progress is best.',
  },
  巽兑: {
    overall: 'Lake over Wind — great excess. The lake submerges the tree — extreme conditions. The ridgepole sags, the foundation is weak. Extraordinary courage is needed for extraordinary times.',
    career: 'Extraordinary circumstances — immense pressure. Break conventional thinking, apply unconventional measures. Stand independently and fear not.',
    love: 'Imbalanced relationship — unequal investment. One gives too much, the other too little. Needs rebalancing.',
    health: 'Possibly serious — do not ignore. Thorough examination and treatment are needed. Health is capital — see a doctor promptly.',
    wealth: 'Extreme volatility — risk of over-investment or excessive debt. Finances are tight — exercise restraint. Do not add leverage.',
  },
  巽离: {
    overall: 'Fire over Wind — the cauldron. Wood feeds fire, cooking and transformation. The noble one establishes a new mandate. Abolish the old and establish the new. Auspicious — renewal and fresh horizons.',
    career: 'A new chapter begins — old models need reform. Good for new business, new products, or new brands. The cauldron is set — expand boldly.',
    love: 'Love enters a new phase — more stable and committed. Building a new life and future together. Good for marriage, buying a home, or starting a business together.',
    health: 'Strong as a cauldron. Watch digestion and nutrition. Old ailments may be cured.',
    wealth: 'Strong fortune — new revenue sources emerge. New investments or ventures yield good returns. After renewal, wealth naturally gathers.',
  },
  巽震: {
    overall: 'Thunder over Wind — constancy and endurance. Thunder and wind reinforce each other. The noble one stands firm in virtue and perseveres. Endurance brings good fortune — change brings danger.',
    career: 'Persevere in your current path. Do not change jobs or directions frequently. Long-term persistence yields rewards.',
    love: 'Stable and enduring love — a gentle, long-lasting stream. Good for marriage — loyalty and persistence are key.',
    health: 'Stable condition — chronic conditions need long-term care. Consistent exercise and routines benefit health greatly.',
    wealth: 'Steady and enduring — stable primary income. Suitable for long-term and value investing. Short-term speculation is not.',
  },
  巽坎: {
    overall: 'Water over Wind — the well. The well never changes — neither gained nor lost. The noble one encourages the people. Neither very auspicious nor very unlucky — maintenance is the priority. The well contains water, inexhaustible.',
    career: 'Stable period — maintain rather than expand. Existing resources suffice but need careful cultivation. Do your duty steadily.',
    love: 'Calm as well water — not passionate but enduring. Each has their place — mutual respect. True affection in tranquility.',
    health: 'Stable condition — watch for clean drinking water and kidney care. The well flows long — consistent body maintenance needed.',
    wealth: 'Like well water — steady but not explosive. Fixed income is stable. Thrift and accumulation build wealth over time.',
  },
  巽艮: {
    overall: 'Mountain over Wind — corruption and decay. Wind at the foot of the mountain stirs decay. Flaws emerge — time for reform. Though troublesome, this is the right time to fix old problems.',
    career: 'Problems multiply — accumulated flaws need thorough cleaning. Good for reform and reorganization. Hard work, but results worthwhile.',
    love: 'Resentment has built up — needs thorough communication and repair. Past conflicts cannot be avoided — face and resolve them. Honest communication is the cure.',
    health: 'Sub-health state — detox and recuperation needed. Old ailments or occupational diseases need serious attention.',
    wealth: 'Poor fortune — signs of loss. Previous financial problems surface. Needs accounting and debt cleanup.',
  },
  巽坤: {
    overall: 'Earth over Wind — ascending. A tree grows from the earth, rising step by step. Accumulate small gains to reach great heights. Fortune rises, career climbs step by step.',
    career: 'Rising steadily like a growing tree. Good for promotion or switching to a better platform. Step by step, one step at a time.',
    love: 'Steady progress — intimacy grows daily. Good for meeting parents, engagement, or marriage. Growing together, improving together.',
    health: 'Growing stronger — marked improvement through care. Good time to develop fitness habits and exercise consistently.',
    wealth: 'Climbing step by step — income grows steadily. Career development brings wealth increase. Expand investment but don\'t rush.',
  },
  坎乾: {
    overall: 'Heaven over Water — conflict and litigation. Heaven and water go in opposite directions. The noble one plans carefully before acting. Disputes, lawsuits, and arguments — peace is best.',
    career: 'Easily drawn into disputes and controversy, especially contracts and legal matters. Settle out of court if possible. Act only after careful planning.',
    love: 'Arguments and disagreements are likely. Both hold their ground. A step back brings peace — harmony is precious.',
    health: 'Watch head and urinary system. Emotional swings — anger harms the liver. Maintain a peaceful mind.',
    wealth: 'Fortune suffers from disputes. Avoid partnerships or lending. Be especially cautious with financial contracts.',
  },
  坎兑: {
    overall: 'Lake over Water — exhaustion and poverty. The lake is dry — resources are depleted. Even in distress, the noble one does not lose his purpose. Hold fast — difficulty will pass.',
    career: 'Caught in difficulty — resources scarce, blocked at every turn. Stay at your post, do not resign lightly. Maintain confidence — hardship will end.',
    love: 'Relationships are strained — both parties feel tired and helpless. Support each other through the difficulty. Hope remains as long as you don\'t give up.',
    health: 'Concerning — weak and often ill. Strengthen nutrition and recuperation. Pay more attention to health during hardship.',
    wealth: 'Strained — financially tight. Tighten the belt. Avoid investments or loans — frugality is the only way.',
  },
  坤坎: {
    overall: 'Water over Earth — the army. Water collects on the ground — multitudes gather. The noble one accommodates the people. Discipline and rules are essential for collective action. Related to warfare, elections, competition.',
    career: 'Teamwork is essential — individual strength is limited. Suitable for organization and management. Strict discipline and procedures are keys to success.',
    love: 'Possible multi-party dynamics or competition. Watch for third-party interference. Existing couples guard against emotional entanglements.',
    health: 'Watch for infectious diseases or health issues in group settings. Maintain personal hygiene and strengthen immunity.',
    wealth: 'Fortune comes from the crowd — team dividends are possible. Distribute fairly, do not hoard. Compete on merit.',
  },
  坎坎: {
    overall: 'Water over Water — double danger. Successive pits — danger on all sides. But the heart remains steadfast. Though perils are everywhere, inner resolve can carry you through.',
    career: 'Difficulties pile up — every step is treacherous. Act cautiously and steadily. Do not advance rashly, safety first. Stick to core business.',
    love: 'Severe tests in love — the relationship walks on thin ice. True love can overcome any obstacle. Adversity reveals true feelings.',
    health: 'Many health issues — comprehensive checkup and care needed. Keeping inner peace and optimism is vital.',
    wealth: 'Perilous fortune — avoid risky investments. Protecting existing assets is victory. Cash is king, reduce debt.',
  },
  坎离: {
    overall: 'Fire over Water — incompletion. The little fox almost crosses but wets its tail. Things are not yet done — keep trying. Rushing ruins it. As the last hexagram of the 64, it symbolizes the cycle of all things.',
    career: 'Not yet successful — keep working. The final phase is most prone to problems — be careful. Perseverance is victory.',
    love: 'Not yet decided — variables remain. The relationship is in an unfinished state — needs further clarity. Communicate clearly.',
    health: 'Not ideal — minor ailments recur. Do not let small problems turn into big ones. Seek timely care.',
    wealth: 'Unstable — investments not yet at harvest. Do not rush — wait patiently.',
  },
  坎震: {
    overall: 'Thunder over Water — deliverance from difficulty. Thunder and rain arrive, releasing tension. The noble one pardons mistakes and removes obstacles. Difficulty is about to lift — the storm clears, good fortune approaches.',
    career: 'Difficulties will soon be resolved — problems are being solved. Seize the moment to clear obstacles. Teamwork is efficient.',
    love: 'Conflict about to resolve — misunderstandings cleared. A reunion deeper than before. Good for reconciliation.',
    health: 'Illness will improve — condition is turning around. Persist with medication and care — recovery is near.',
    wealth: 'Financial difficulties about to lift. Previous pressure will gradually ease. Debts may be repaid.',
  },
  坎巽: {
    overall: 'Wind over Water — dispersion. Wind blows across water, scattering things. Hearts drift apart, control slips away. But gathering is possible — pull together in time.',
    career: 'Morale is low — team lacks cohesion. Rally and organize immediately. The project may face dissolution — strengthen management.',
    love: 'Signs of distancing — drifting apart. Reach out and communicate in time. Find back the intimacy you once shared.',
    health: 'Qi is scattered — body is weak. Strengthen the root, avoid overconsumption. Rest more, stay up less.',
    wealth: 'Risk of asset loss — spending is loose. Tighten finance, control unnecessary expenses. Avoid spreading investments thin.',
  },
  坎艮: {
    overall: 'Mountain over Water — difficulty and obstruction. Water on the mountain — peril ahead. The noble one turns inward to cultivate virtue. Know when to retreat. Step back temporarily to advance better later.',
    career: 'Every step is difficult — advance is hard. Know when to retreat — do not force your way. A step back is not cowardice but strategy.',
    love: 'Heavy obstacles — progress is difficult. May need to pause and give each other time to reflect calmly.',
    health: 'Not good — condition fluctuates. Avoid overtaxing yourself. Rest is the priority.',
    wealth: 'Blocked — seeking wealth is difficult. Avoid investment and expansion. Protect existing wealth.',
  },
  艮坎: {
    overall: 'Water over Mountain — enlightenment. A spring emerges from the mountain — the child seeks the teacher. Learn humbly, respect the wise. Doubt needs a wise guide.',
    career: 'At the learning stage — accumulate knowledge and experience. Good for apprenticeship or training. Do not make independent decisions yet.',
    love: 'Love begins to sprout but is not yet clear. Both are probing and exploring. Do not rush to confess — spend time understanding each other.',
    health: 'Watch children\'s or adolescents\' health. For adults, watch brain and nervous system.',
    wealth: 'Fortune not yet open — invest in learning and improvement first. Do not rush to earn — lay the foundation.',
  },
  艮兑: {
    overall: 'Lake over Mountain — mutual influence and attraction. The gentle above, the firm below — two qi respond to each other. The noble one receives others with an open mind. Attraction, connection, and romance. Sincere interaction is the key.',
    career: 'Resonance with partners — joyful cooperation. Negotiations are easy, projects progress smoothly. Use interpersonal chemistry to advance business.',
    love: 'Most auspicious for love — mutual attraction and delight. The best time for confession and proposal. Hearts connected, minds aligned.',
    health: 'Body responds to seasonal changes — adapt accordingly. Good overall health — a happy mind keeps illness away.',
    wealth: 'Fortune rises through relationships. Wealth gained through cooperation and networks. Where fate gathers, wealth follows.',
  },
  艮离: {
    overall: 'Fire over Mountain — the traveler. Fire on the mountain illuminates the journey. The noble one is cautious and observant. Travel, wandering, or moving abroad. Take care when away from home.',
    career: 'Possible business trips, assignments, or changes. Good for developing opportunities in distant places. Safety first when working away.',
    love: 'Long-distance love or travel romance. But travel romances are hard to sustain — be cautious. Both need security.',
    health: 'Travel fatigue — watch for exhaustion and food hygiene. Stay safe and healthy on the road.',
    wealth: 'Fortune lies away — more opportunity away from home than locally. But travel costs are also high — budget accordingly.',
  },
  艮震: {
    overall: 'Thunder over Mountain — small excess. A bird flying overhead leaves its call — better to go down than up. Small mistakes or minor ripples. Big things are not possible; small things are. Stay low-key.',
    career: 'Focus on small matters — don\'t aim too high. Small tasks succeed; big ones exceed your capacity. Watch details to avoid errors.',
    love: 'Minor frictions and misunderstandings — nothing serious. Don\'t be too particular about small matters. Be tolerant.',
    health: 'Minor ailments — colds, small injuries. Nothing major, but handle promptly. The bird passes — no need for alarm.',
    wealth: 'Small gains — but small errors may cause losses. Manage finances carefully, watch small expenses.',
  },
  艮巽: {
    overall: 'Wind over Mountain — gradual progress. Wood grows on the mountain — advance step by step. The noble one gradually accumulates virtue. Do not rush — progress naturally, step by step like a woman\'s marriage.',
    career: 'Advance step by step — one step at a time. Do not rush — steady development is most reliable. Follow the plan.',
    love: 'Let love develop naturally. Slowly build affection — love that grows over time. Follow proper etiquette in marriage matters.',
    health: 'Gradual improvement — recovery is a gradual process. Patience and persistence are needed.',
    wealth: 'Slow growth — small amounts accumulate. Suitable for fixed investments and long-term wealth management. Wealth comes in steadiness, not speed.',
  },
  艮艮: {
    overall: 'Mountain upon Mountain — stillness and cessation. When it is time to stop, stop. When it is time to act, act. The noble one does not go beyond his station. Stop moving, observe quietly. Stillness is better than action.',
    career: 'Pause all actions — do not advance new projects. This is a period of rest and reflection. Stay in your current position.',
    love: 'Calm down — do not rush development. Keep distance temporarily. Give both parties time to think.',
    health: 'Rest is needed — avoid strenuous exercise. Rest is the best medicine. Watch back and joint problems.',
    wealth: 'Fortune is still — no income or major expenses. Save, do not invest.',
  },
  艮坤: {
    overall: 'Earth over Mountain — humility. The mountain hides within the earth — a humble noble one. The noble one diminishes the abundant and augments the scarce. One of the most auspicious hexagrams. Humility brings great benefit.',
    career: 'Humility and low profile bring good luck. Not taking credit brings more recognition. Teamwork is harmonious.',
    love: 'Mutual deference and harmony. Both consider the other\'s feelings. A humble attitude makes love sweeter.',
    health: 'Good condition — peace of mind ensures health. Humility brings cheerfulness.',
    wealth: 'Prosperous fortune — humility gathers wealth. Not flaunting wealth allows it to accumulate naturally.',
  },
  坤震: {
    overall: 'Thunder over Earth — delight and pleasure. Thunder bursts from the earth — joyful movement. The noble one makes music and honors virtue. Enjoy life but avoid overindulgence. Extreme joy begets sorrow.',
    career: 'Smooth and joyful — pleasant work atmosphere. Use good interpersonal relations to advance work. But don\'t relax too much.',
    love: 'Sweet and delightful — both enjoy each other\'s company. Good for dates and outings. But don\'t indulge excessively.',
    health: 'Good health and high spirits. But watch for overindulgence in food and drink. Moderate entertainment.',
    wealth: 'Decent fortune — pleasant surprises. But easy come, easy go — control spending urges.',
  },
  坎坤: {
    overall: 'Water over Earth — harmony and unity. Water on the ground — mutual affinity. The noble one fosters relationships widely. Harmonious interpersonal relations — gather allies, win support.',
    career: 'Excellent interpersonal relations — strong partners. Build your network actively. Teamwork flows smoothly. Relations with superiors are harmonious.',
    love: 'Sweet love — inseparable. Intimate and connected hearts. Good for planning a future together.',
    health: 'Good condition — qi and blood are harmonious. Strong social connections also benefit mental health.',
    wealth: 'Fortune comes from interpersonal cooperation — partnerships yield good profits. Connections are the key to wealth.',
  },
  坤坤: {
    overall: 'Earth over Earth — great virtue carries all. The movement of earth is yielding and receptive. Nurture all things with包容. Overcome hardness with gentleness. Stillness overcomes action.',
    career: 'Not suitable for independent ventures — support and assist others. Do your duty well, support your superiors. Accumulate quietly — your time will come.',
    love: 'Gentle and包容 — warm and harmonious. Softness overcomes hardness —大爱如水. Nurture the relationship with care.',
    health: 'Stable condition — watch for excess earth harming digestion. Gentle exercise like walking or yoga is suitable.',
    wealth: 'Stable — wealth through accumulation and frugality. Great virtue carries wealth. Avoid speculation.',
  },
  乾兑: {
    overall: 'Lake over Heaven — decisive action. The noble one resolutely decides. When a decision must be made, make it without hesitation. Hesitation brings harm.',
    career: 'The time for decision has come. Hesitation brings harm. Move forward boldly, decide decisively. Good for clearing obstacles.',
    love: 'A choice must be made — do not drag your feet. Say goodbye to unsuitable relationships, welcome new beginnings. Decide firmly.',
    health: 'Watch for acute issues needing surgery or decisive treatment. Do not delay.',
    wealth: 'A decision is needed — cut losses or invest decisively. Hesitation wastes the opportunity.',
  },
  乾震: {
    overall: 'Thunder over Heaven — great strength. Power is on the move. The noble one does not tread on improper ground. At the peak of strength, charge forward. But do not bully the weak.',
    career: 'Career momentum is overwhelming — charge forward boldly. But do not become arrogant — stay humble.',
    love: 'Yang energy is excessive — watch balance between partners. Men should not be too dominant. Gentleness and firmness together.',
    health: 'Strong and energetic — suitable for high-intensity exercise. But avoid overexertion.',
    wealth: 'Strong fortune — bountiful harvest. But do not be greedy. During strength, accumulate.',
  },
  乾巽: {
    overall: 'Wind over Heaven — small accumulation. The gentle one has gained position. Wind travels across heaven. Small savings, not yet great achievement. Continue accumulating, wait for the time.',
    career: 'Small success, but far from great achievement. Keep accumulating, do not rest on your laurels. Build momentum gradually.',
    love: 'In the accumulation stage — progress but not maturity. Continue nurturing the relationship. Small investment brings big returns.',
    health: 'Recovering and accumulating — small progress but keep going. Accumulate small victories into big ones.',
    wealth: 'Modest savings — decent but not wealthy. Budget carefully, accumulate gradually.',
  },
  乾坎: {
    overall: 'Water over Heaven — waiting and patience. Clouds rise to the sky. The noble one feasts and enjoys. The time is not yet ripe — force will not help. Wait for the right moment.',
    career: 'Patience is needed — do not act rashly. Now is not the time to strike. Continue preparing, wait for orders.',
    love: 'Can\'t rush love — fate has not arrived. Give each other time and space. Patiently wait — what is meant to come will come.',
    health: 'Rest and recuperation needed — do not rush recovery. Illness recedes slowly — tend to it patiently.',
    wealth: 'Fortune has not arrived — wait. Do not rush to invest. Cash is king. When the time is right, it will come naturally.',
  },
  乾艮: {
    overall: 'Mountain over Heaven — great accumulation. Heaven within the mountain — vast reserves. The noble one stores up virtue. Amassed resources — though not yet revealed, the foundation is solid. Great talent matures late.',
    career: 'Solid reserves — though not yet displayed, the foundation is firm. Suitable for accumulating knowledge, resources, and connections. A late bloomer.',
    love: 'Deep foundation — not flashy but very stable. Love that grows over time. Deep and lasting feelings.',
    health: 'Fair — watch for problems from long-term accumulation. Health preservation is about consistent effort.',
    wealth: 'Substantial reserves — considerable savings. Do not flaunt — hide your light. Wealth grows through accumulation.',
  },
  兑离: {
    overall: 'Fire over Lake — opposition and divergence. Fire above, lake below — their natures differ. Two women in the same house, their wills do not align. Seek common ground while respecting differences.',
    career: 'Divergent opinions — cooperation shows cracks. Seek common ground and mutual benefit. Do not be stubborn to the point of division.',
    love: 'Different interests and values — significant divergence. More understanding and tolerance needed. Different personalities require磨合.',
    health: 'Watch for body asymmetry or inflammation. Emotions affect health — maintain inner peace.',
    wealth: 'Fortune suffers from divergence. Partnerships may dissolve due to disagreements. Handle合作关系 carefully.',
  },
  兑巽: {
    overall: 'Wind over Lake — inner sincerity and trust. Sincerity reaches even pigs and fish. The noble one influences through integrity. Sincerity can transform everything — turn danger into safety.',
    career: 'Sincerity is the best strategy. Treat people with honesty — reputation is paramount. Negotiations and signings go very smoothly.',
    love: 'Treat each other with sincerity — trust is the foundation. Mutual trust makes感情 solid. Suitable for long-term commitment.',
    health: 'Healthy body and mind — sincerity brings inner peace. Open heart benefits health. Watch respiratory system.',
    wealth: 'Fortune comes through reputation. Honest business brings wealth. Ill-gotten gains should not be taken.',
  },
  离坤: {
    overall: 'Earth over Fire — injury and concealment. Fire enters the earth — light is wounded. Suffering great difficulty. The noble one conceals his light. Brilliance diminished, setbacks encountered. Endure quietly, do not force your way forward.',
    career: 'Setbacks — talent is suppressed. Stay low, wait patiently. Temporarily sheathe your sword, do not confront authority.',
    love: 'Hurt or suppressed in relationships — inner pain. Time is needed to heal. Do not rush into new relationships.',
    health: 'Poor health — especially eye or cardiovascular problems. Rest and recuperation are needed.',
    wealth: 'Damaged fortune — investment losses. Reduce expenses, protect principal. Do not expand investment.',
  },
  震离: {
    overall: 'Fire over Thunder — biting through. Thunder and lightning together — bite down and break through. Something in the mouth must be chewed and swallowed. Remove obstacles with force and determination. Justice must be served.',
    career: 'Obstacles require force and determination to overcome. Lawsuits or disputes possible — argue on principle. Decisive action needed.',
    love: 'Barriers in the relationship — communicate actively. Some problems are like fishbones — speaking them out clears the air.',
    health: 'Watch mouth, teeth, digestive system. Eat carefully, avoid choking hazards. Treat inflammation promptly.',
    wealth: 'Blocked fortune — legal action may be needed. Spend to resolve trouble — don\'t lose big for small gain.',
  },
  巽巽: {
    overall: 'Wind over Wind — gentle penetration. Wind follows wind — the noble one spreads his message. Act with gentleness, do not be rigid. Follow the wind, go with the flow.',
    career: 'Follow superiors\' instructions — do not be eccentric. Suitable for supportive roles, not for leadership. Stay low and pragmatic.',
    love: 'Defer more to your partner\'s opinions — do not be too assertive. Gentle tenderness beats aggressive force.',
    health: 'Watch respiratory system, wind-cold, colds. Guard against wind in spring. Sensitive constitution — adaptable yet vulnerable.',
    wealth: 'Fortune comes with the wind — small gains but not large. Follow the crowd\'s investments. Eccentricity does not pay.',
  },
  坤兑: {
    overall: 'Lake over Earth — gathering and assembly. The noble one gathers talents. A gathering of heroes — fine minds come together. Join forces, unite strength. But the gathering needs proper guidance.',
    career: 'Talents gather — team strength is formidable. Good for recruiting, team building, or hosting large events. Networks bring opportunities.',
    love: 'Many suitors — flourishing peach blossom luck. Choose carefully, do not be fooled by appearances.',
    health: 'Watch for infection risk in crowds. Maintain hygiene in crowded places.',
    wealth: 'Wealth concentrates — people gather, wealth gathers. Through social and group activities, gain wealth. Partnership yields good returns.',
  },
}

/** 六十四卦断辞 - 日文翻译 */
export const MEIHUA_DUANCI_JA: Record<string, GuaDuanCi> = {
  乾乾: {
    overall: '天が天の上。純陽の卦、元亨利貞。天の運行は剛健にして止まない。全ての爻が陽、光明正大の象。運勢は絶頂、万事順調。ただし陽極まれば陰生ず。慢心を戒めよ。',
    career: '事業は絶頂期。積極的に前進、リーダーシップを発揮せよ。ただし満を招くので謙虚であれ。',
    love: '感情は順調で情熱的。ただし陽剛過多、優しさも忘れずに。独身者は条件の良い相手に出会いやすい。',
    health: '健康良好、精力充実。心臓・血圧に注意。過労を避け、労逸を調和せよ。',
    wealth: '財運繁栄、正財偏財とも良。大胆な投資も可。ただし貪らず、利を見たら逃げよ。',
  },
  巽乾: {
    overall: '天に風。邂逅の象。風天にあり、万物の偶然の出会い。一陰五陽、小人に注意せよ。',
    career: '意外な機会と貴人の出現。新たな協力や発展の契機。善悪を見極め、小人を警戒せよ。',
    love: '思いがけない縁。桃花運旺盛。ただし来るのも早く去るのも早い。既存のカップルは第三者の介入を警戒。',
    health: '軽い不調。呼吸器・皮膚の過敏。気候の変化に注意。',
    wealth: '財運に波あり。臨時収入と出費が同居。慎重な財務管理を。小利に目がくらんで大局を失うな。',
  },
  艮乾: {
    overall: '天に山。遁蔵の象。君子は時に退いて小人を遠ざける。運勢不良、退いて時を待て。しかし退の中に進あり。',
    career: '退いて進むな。環境不利、無理な前進は害を招く。低姿勢で力を蓄え機会を待て。',
    love: '距離感が生じるかも。空間と時間が必要。無理強いせず、距離が関係を良くすることもある。',
    health: 'やや不調。下肢・関節に注意。静養が吉。激しい運動は避けよ。',
    wealth: '財運低迷。投資は避け、守りが第一。支出を減らし現金を確保せよ。',
  },
  乾坤: {
    overall: '地が天の下。天地不交、閉塞の象。上昇する天気と下降する地気、陰陽隔絶。守るに如かず。窮すれば通ず。',
    career: '抵抗大、上下の意思疎通不良。軽挙妄動は避けよ。力を蓄え転機を待て。',
    love: '誤解と行き違い。忍耐が必要。お互いに空間を与え、急ぐな。',
    health: 'まずまず。呼吸器・消化器に注意。規則正しい生活を。',
    wealth: '財運不良。投機的投資は避けよ。守りが第一。',
  },
  坤巽: {
    overall: '地に風。観察の象。風は大地を巡り、遍く観る。冷静に観察し、軽率な行動は避けよ。調査・学習・計画の時。',
    career: '静観が吉。調査・学習・計画の時期。大局を見据えよ。',
    love: '相手をよく知ってから心を開け。よく観察し、よく話し合い、正しい判断を。',
    health: '大きな問題なし。目の疲れと精神的疲労に注意。',
    wealth: '財運平稳。大きな投資行動は避けよ。小収入あり、貯蓄が吉。',
  },
  坤艮: {
    overall: '山が地の上。剥落の象。陰が陽を消し、小人の道盛ん、君子の道衰える。慎重に守れ。ただし極まれば復す。',
    career: '圧力あり、地位が揺らぐかも。低姿勢で事実に徹し、争うな。基本を守り好転を待て。',
    love: '喪失感あり、関係が危うい。より多くの包容と理解を。安易に別れを言うな。',
    health: '骨・歯・皮膚に注意。過労を避け養生せよ。',
    wealth: '衰運、破財の兆し。投資を避け、金銭トラブルを避けよ。倹約に努めよ。',
  },
  坤离: {
    overall: '地に火。日の出、昇進の象。君子は自ら明らかな徳を輝かす。運気上昇、前途洋々。積極的に進め。',
    career: '絶好の事業運。昇進の喜び、名声の向上。努力が認められ報われる。',
    love: '順調な発展。関係は日々熱を増す。告白やプロポーズに好機。独身者は桃花運旺盛。',
    health: '良好な健康、精神的充実。戸外活動や運動に適す。日焼けや熱中症に注意。',
    wealth: '財運繁栄。投資から良いリターン。ただし貪らず、利を見たら逃げよ。',
  },
  坤乾: {
    overall: '天が地の上。天地交泰、万物通達の象。最も吉祥な卦の一つ。万事順調。',
    career: '事業順調、上下心を一つに。協力もプロジェクトも順調。積極的に拡大せよ。',
    love: '感情円満。両心相通じる。既存の関係はさらに発展。独身者は良縁に巡り合う。',
    health: '健康絶好、気血調和。良好な生活習慣を継続せよ。',
    wealth: '旺盛な財運。正道で財を得る。安定した収入増、臨時収入も。投資に適すが貪るな。',
  },
  兑乾: {
    overall: '天に沢。履の象、薄氷を踏む如し。規則を守り、恭敬であれ。虎の尾を踏んでも嚙まれず。',
    career: '慎重に行動せよ。規則を守り、功を焦るな。着実な歩みが成功への道。',
    love: '忍耐と誠意が必要。相手にためらいがあるかも。時間と行動で自分を証明せよ。',
    health: '状態は可。胃腸に注意。規則正しい生活で夜更かしを避けよ。',
    wealth: '財運は普通。投機に手を出すな。地道に稼げ。余計な欲を出すな。',
  },
  兑兑: {
    overall: '沢の上に沢。双沢相滋、喜悦の象。君子は朋友と講習する。喜びの兆し、万事順調。',
    career: '事業運良。人間関係円満、協力愉快。交渉・契約も順調。',
    love: '甘い恋愛、両心相悦ぶ。デート・告白・プロポーズに適す。',
    health: '健康良。喉や声帯に注意。',
    wealth: '財運可。収入あり。ただし楽しみによる出費に注意。',
  },
  离兑: {
    overall: '沢に火。変革の象。水火相息、旧去り新来たる。痛みはあるが新生あり。',
    career: '大きな変革。転職・業界転換・会社改革。変革は機会を運ぶ。適応期間は必要。',
    love: '関係の転機。古いパターンはもう合わない。変化が必要。別れか復縁か。',
    health: '健康に変化。手術や治療の可能性。炎症や発熱に注意。',
    wealth: '財運変動。変革期は出費増。旧収入源に変化。収入源を広げ経費を削れ。',
  },
  震兑: {
    overall: '沢に雷。帰妹の象。雷上沢下。婚姻は吉、他は慎重に。',
    career: '人脈や関係で発展の可能性。しかし依存しすぎるな。女性の事業運がより良い。',
    love: '結婚の喜び。婚約・結婚に吉。既存の関係はさらに深まる。ただし関係の不平等に注意。',
    health: '可。感情の波と内分泌に注意。女性は婦人科の健康を。',
    wealth: '普通。結婚や社交で出費増。慎重な財務計画を。',
  },
  兑坎: {
    overall: '沢に水。節制の象。沢満ちて溢れる。節度を持て。規則を立てよ。過ぎたるは及ばざるが如し。',
    career: '節度が必要。盲目的拡大や過剰投資は避けよ。長期的計画を立て着実に進め。',
    love: '適度な距離感が必要。べったりも疎遠もよくない。距離が美を生む。',
    health: '飲食の節制を。悪癖も節制せよ。規則的生活が健康の基。',
    wealth: '平稳。出費を抑えよ。節約が要諦。高リスク投資は避けよ。',
  },
  兑坤: {
    overall: '地が沢の上。臨の象。事態は進展し、好事近し。チャンスを掴み、流れに乗れ。',
    career: '運気上昇、成功間近。目の前のチャンスを掴め。上司との関係良好、貴人あり。',
    love: '関係は次の段階へ。結婚や同居に好機。積極的に動け。',
    health: '絶好、精神的充実。健康診断や保健に適す。',
    wealth: '財運次第に旺ん。収穫あり。収入増。蓄積が吉。',
  },
  兑艮: {
    overall: '山が沢の上。損の象。下を損して上を益す。損失は免れないが、小損大得。捨ててこそ得あり。',
    career: '小さな損失や犠牲。長期的には有益。引いて進め、まず与えてから得よ。',
    love: '犠牲と妥協が必要。一方がより多く与えることに。真心はいつか報われる。',
    health: 'やや消耗。過労を避け、休息と栄養補給を。小さな病気は早めに治療。',
    wealth: '損失、支出が収入を上回る。ただし必要な投資。長い目で見よ。',
  },
  离乾: {
    overall: '天に火。大同の象。衆志成城、団結は大事を成す。君子は類を以て族を辨ず。',
    career: '協力が鍵。チームワークが最大の効果を発揮する。人間関係良く、支援を得られる。',
    love: '志を同じくする相手。価値観が合い、調和。独身者は社交の場で同志に出会う。',
    health: '健康良好、精神的愉快。団体スポーツや社交活動に適す。',
    wealth: '財運亨通、協力が財を生む。チームで得た利益を分かち合え。',
  },
  离离: {
    overall: '火の上に火。重明照耀、光明の象。文学・芸術・名声の成就。',
    career: '名声高まり、才能が認められる。文化・芸術・教育・メディアに適す。',
    love: '激しくロマンチック。情熱が燃え上がる。ただし火が強すぎると焼く。冷静さも必要。',
    health: '目・心臓・血液循環に注意。感情の波に注意。ヨガや瞑想が良い。',
    wealth: '財運可。入りも早いが出も早い。投機に過ぎるな。才知で稼げ。',
  },
  离震: {
    overall: '雷と火。噬嗑の象。口に物あり、歯で噛み砕く。障害を断固排除。公正な裁決。',
    career: '障害を力と決断で乗り越えよ。訴訟や紛争の可能性。断固たる決断を。',
    love: '関係に障壁、積極的コミュニケーションが解決の鍵。言えば治ることも。',
    health: '口・歯・消化器に注意。炎症は早めに治療。',
    wealth: '財運阻害。法的措置が必要かも。損して災いを消す考えも。',
  },
  离巽: {
    overall: '風と火。家人の象。風火相生、家族の道。君子は言に物あり行いに恒あり。家庭和やかなら万事興る。',
    career: '家庭が事業の基盤。家族の支持が幸運を呼ぶ。家族経営や在宅勤務に適す。',
    love: '家庭円満。結婚や子作りに好機。家庭は愛の港。',
    health: '状態良し。家庭の和やかさが健康に良い。',
    wealth: '財運安定。家庭の財務管理が巧み。不動産など家族関連の投資に適す。',
  },
  离坎: {
    overall: '水が火の上。未済の象。未完成、小さな狐が渡ろうとしたが尾を濡らす。まだ努力が必要。未済は凶に非ず、希望あり。',
    career: 'まだ発展途上。弛まず努力せよ。終盤に近づいているが課題あり。',
    love: '未だ安定せず、模索段階。良いことは時間がかかる。忍耐と誠意を。',
    health: '可。小さな病気が続くが大事なし。予防と養生を。楽観が回復を助ける。',
    wealth: '不安定。投資は収穫期に非ず。追加投資をせず、じっと待て。',
  },
  离艮: {
    overall: '山に火。蒙の象。山下出泉、童蒙が我に問う。学習向上、師を敬い道を尊ぶ。疑問は智者に問え。',
    career: '初期段階か新分野。学び相談せよ。無謀な前進は避け、謙虚に基礎を固めよ。',
    love: 'もやもや段階。お互い探り合い。結論を急がず、もっと交流を。',
    health: '子供や若者の健康に注意。大人は新陳代謝と内分泌。',
    wealth: '財運未開。まず投資は学習と向上に。急いで稼ごうとせず、基礎を築け。',
  },
  乾离: {
    overall: '天に火。大有の象。豊作繁栄、最も吉祥な卦の一つ。収穫豊か、万事如意。',
    career: '収穫豊富、思いのまま。名声と利益を共に得る。勝ちに乗じて拡大せよ。',
    love: '恋愛豊かに実る。独身者は桃花運きわめて旺盛。',
    health: '健康、精力旺盛。運動強化に適す。',
    wealth: '財運亨通。大いに得る。正財偏財とも豊作。寛大に還元せよ。',
  },
  震乾: {
    overall: '天に雷。無妄の象。天命不佑、妄りに動くな。順其自然、守正すれば吉。',
    career: '妄動するな、現状維持が吉。地道に働き、小手先の技に走るな。',
    love: '誠実であれ。偽りの心は通じない。自然の発展に任せよ。',
    health: '不意の事故や怪我に注意。危険な活動は避けよ。',
    wealth: '財運平淡。投機は避け、正道で稼げ。不義の財を貪るな。',
  },
  兑震: {
    overall: '沢に雷。随の象。時に従い、固執するな。臨機応変が上策。',
    career: '流れに従え。逆らうな。良師益友や市場トレンドに従えば良い発展あり。',
    love: '縁に任せよ。無理強いするな。心のままに。既存の関係は順調。',
    health: '季節に応じて体調変動。環境変化に適応せよ。自然のリズムに従うが吉。',
    wealth: '財運は市場と共に変動。流れに乗る投資が吉。利を見たら逃げよ。',
  },
  震震: {
    overall: '雷の上に雷。震動の象。百裏驚かすも匕鬯を喪わず。冷静な対応が幸運を招く。',
    career: '大きな変動や突発的事態。新たな機会か挑戦。冷静に対応せよ。変動に機会あり。',
    love: '突然の出来事で関係に波紋。冷静に話し合え。嵐の後は晴れ。',
    health: '突発的健康問題、特に心脳血管に注意。定期検診で予防。',
    wealth: '大きく変動。予期せぬ出費の可能性。ハイリスク投機は避けよ。',
  },
  震巽: {
    overall: '風に雷。益の象。風雷激蕩、損上益下。君子は善を見て遷り、過ちあらば改む。万事増益。',
    career: '収益増加、順調な発展。規模拡大・投資増に適す。',
    love: '愛情日々深まり、関係は増進。同棲や結婚に適す。',
    health: '越來健康。運動とケアで改善。新しい運動計画を始めよう。',
    wealth: '増益顕著。収入増、投資好調。追加投資や新事業に適す。',
  },
  震坎: {
    overall: '水に雷。屯の象。雷雨交々、艱難の象。万事が始まりは難し。忍耐と努力で乗り越えよ。',
    career: '初期段階か困難に直面。始まりは難しい。忍耐強く努力せよ。',
    love: 'ゆっくりした進展。苗を育てるように手間暇をかけよ。お互いに忍耐を。',
    health: '不調の初期症状か持病の再発。早めの受診を。過労を避け養生せよ。',
    wealth: '回復し始めたばかりで不安定。倹約せよ。少しずつ蓄積せよ。',
  },
  震艮: {
    overall: '山に雷。頤の象。山下雷動、養いの象。言葉を慎み、飲食を節す。養生と自己研鑚に注力せよ。',
    career: '充電・学習の時期。過労を避け、学びを通じて自己を高めよ。',
    love: '愛情こまやかなケアが必要。お互いに関わりを怠るな。',
    health: '健康第一。養生に注力。適度な運動と規則的生活。',
    wealth: '平稳。蓄積が吉。小手先の技より自力が確実。',
  },
  震坤: {
    overall: '地に雷。復の象。一陽復始、七日来復。冬去り春来たる。低調から上昇に転じる好機。',
    career: '低迷から回復。古い問題は解消され、新たな機会が出現。再出発せよ。',
    love: 'よりを戻す好機大。別れた関係の復活の可能性。過去のわだかまりを捨てて再出発。',
    health: '快方に向かう。じっくり養生せよ。春のような生気が戻りつつある。',
    wealth: '回復基調。まだ強くないが好転の兆し。過ぎた損失は取り戻せるかも。',
  },
  巽兑: {
    overall: '沢に風。大過の象。沢滅木根、大過極まる。非常の勇気で非常の局面に臨め。',
    career: '非常局面、圧力大。常識を破り非常手段で臨め。独立して恐れず。',
    love: '関係が不均衡。一方の与え過ぎ。調整が必要。',
    health: '深刻な可能性。無視するな。徹底的な検査と治療を。',
    wealth: '大起大落。過剰投資や借金の危険。財政逼迫、節制せよ。',
  },
  巽离: {
    overall: '火に風。鼎の象。木火を以て烹饪す。旧を革めて新を立てる。大吉大利、万象更新。',
    career: '新局面。旧来のモデルを革新せよ。新事業・新製品・新ブランドに適す。',
    love: '新段階へ。より安定し確かな関係に。結婚・住宅購入・共同起業に吉。',
    health: '鼎の如く強固。消化器と栄養吸収に注意。',
    wealth: '旺盛な財運。新たな財源。新投資や新事業の収益良し。',
  },
  巽震: {
    overall: '風に雷。恒の象。雷風相与、恒久の道。君子は立場を変えず、持続せよ。恒は吉、変は凶。',
    career: '持続せよ。現在の道を守れ。転職や方向転換は避けよ。長く続ければ報われる。',
    love: '安定した長続きの恋。細く長く。結婚に吉。誠実と持続が鍵。',
    health: '安定状態。慢性疾患は長期ケア。規則的運動が健康に大いに益す。',
    wealth: '安定持続。正財收入穩定。長期投資・価値投資に適す。短期投機は不向き。',
  },
  巽坎: {
    overall: '水に風。井の象。改邑不改井、喪うことなく得ることなし。君子は民を労す。守成が第一。',
    career: '安定期。守成が良く開拓は不要。現有資源で十分。地道に本務を果たせ。',
    love: '静かな井戸の水の如く。激しくはないが長く続く。お互いの立場を尊重。',
    health: '安定。飲料水の清潔と腎臓のケアに注意。',
    wealth: '井戸の水の如く、絶え間なく続くが爆発的富はない。蓄積が重要。',
  },
  巽艮: {
    overall: '山に風。蠱の象。山下に風あり、腐敗の象。積弊の一掃に好機。',
    career: '問題山積。溜まった弊害の徹底的整理が必要。改革再編に適す。',
    love: '積もった不満、徹底的コミュニケーションで修復を。過去の対立から逃げるな。',
    health: '半健康状態。解毒と養生が必要。持病や職業病に真剣に向き合え。',
    wealth: '財運不良、破財の兆し。過去の財務問題が表面化。帳簿整理と債務処理を。',
  },
  巽坤: {
    overall: '地に風。升の象。地中に木生じ、上昇の象。積小高大、順徳。運気上昇、事業順調。',
    career: '順調な上昇。昇進やより良いプラットフォームへの転職に適す。一歩一歩前進。',
    love: '着実に上昇。関係は日々親密に。両親への紹介や婚約・結婚に吉。',
    health: '日増しに強壮。ケアを通じて顕著な改善。運動習慣を身につけよ。',
    wealth: '次第に上昇。収入持続的成長。投資拡大は可、ただし冒険は避けよ。',
  },
  坎乾: {
    overall: '天に水。訟の象。天水違行、争訟の象。和を以て貴しと為す。争いを避けよ。',
    career: '紛争や論争に巻き込まれやすい。示談で解決せよ。先に謀りて後に動け。',
    love: '口論や対立が生じやすい。各々譲歩せよ。一歩下がるが平和への道。',
    health: '頭部と泌尿器に注意。感情の波に注意。',
    wealth: '紛争で財運損なう。共同経営や金銭の貸借を避けよ。',
  },
  坎兑: {
    overall: '沢に水。困の象。沢中に水無く、窮困の象。困してもその楽しみを失わず。堅守すれば脱出できる。',
    career: '困難に陥る。資源不足。職を守れ。自信を持て。',
    love: '行き詰まり。お互い疲れている。支え合って乗り越えよ。',
    health: '懸念。虚弱。栄養補給と養生を。',
    wealth: '困窮。財政逼迫。節約が唯一の方法。',
  },
  坤坎: {
    overall: '地に水。師の象。地中に水あり、兵衆の象。規律と秩序が成功の鍵。',
    career: 'チームワーク必須。個人の力には限界あり。組織管理に適す。',
    love: '三角関係や競争の可能性。第三者の介入に注意。',
    health: '集団感染や集団環境での健康問題に注意。',
    wealth: '財は衆より来たる。チーム収益を公平に分配せよ。',
  },
  坎坎: {
    overall: '水の上に水。重険の象。前後に狼虎。しかし心を強く持てば乗り越えられる。',
    career: '困難重重。慎重に歩め。安全第一。',
    love: '試練重重。誠実な愛は乗り越えられる。',
    health: '健康問題多し。総合検査とケアを。',
    wealth: '危険な財運。投機は避けよ。現金が王。',
  },
  坎离: {
    overall: '火が水の上。未済の象。未完成、小さな狐が渡ろうとして尾を濡らす。循環の象、六十四卦最後の卦。',
    career: '未だ成功せず。努力継続。最終段階が最も問題を生じやすい。',
    love: '未確定。変数あり。明確なコミュニケーションを。',
    health: '理想的ならず。小さな病気が続く。早めのケアを。',
    wealth: '不安定。投資は収穫期に非ず。忍耐。焦るな。',
  },
  坎震: {
    overall: '雷に水。解の象。雷雨作、百果草木皆甲坼。困難解消、好運来たる。',
    career: '困難まもなく解決。問題解決の好機。',
    love: '対立解消へ。誤解は晴れる。以前よりも親密に。',
    health: '快方へ。状態好転。投薬とケアを続けよ。',
    wealth: '財務困難解消へ。プレッシャーは徐々に和らぐ。',
  },
  坎巽: {
    overall: '風に水。涣の象。風水上を行く、散逸の象。人心離散。しかし集中すれば挽回可能。',
    career: '人心散逸、チームに結束欠く。早急に立て直せ。',
    love: '疎遠の兆し。及時にコミュニケーションを。',
    health: '元気散逸、体が弱る。過剰消耗を避けよ。',
    wealth: '財産流出の危険。支出を抑えよ。',
  },
  坎艮: {
    overall: '山に水。蹇の象。山に水あり、阻難の象。知難而退。修身して時を待て。',
    career: '進退困難。無理に進むな。一歩退くは怯懦にあらず、戦略なり。',
    love: '障害重重。進展困難。一時中断も考えよ。',
    health: '不良。病状が繰り返す。無理をせず養生せよ。',
    wealth: '財運阻害。投資開拓を避けよ。既存の富を守れ。',
  },
  艮坎: {
    overall: '水に山。蒙の象。山下出泉、童蒙が我に問う。虚心に学び師を敬え。',
    career: '学習段階。知識と経験を積め。独断は避けよ。',
    love: '恋の芽生え、まだ曖昧。焦らず多く知り合え。',
    health: '子供の健康に注意。大人は神経系に注意。',
    wealth: '財運未開。まず学びに投資せよ。',
  },
  艮兑: {
    overall: '沢に山。咸の象。山に沢あり、感応の象。虚心に人を受け入れよ。引力・情愛・交流。誠実な交流が鍵。',
    career: 'パートナーと共鳴。協力愉快。交渉も順調。',
    love: '最も吉。両心相引かれる。告白やプロポーズに最適。',
    health: '季節変化に適応を。全体的に良好。',
    wealth: '人間関係で財運アップ。協力とネットワークで富を得よ。',
  },
  艮离: {
    overall: '山に火。旅の象。山に火あり、行旅の象。君子は慎んで明察す。遠方での活動に注意。',
    career: '出張・転勤・異動の可能性。遠方での発展に適す。',
    love: '遠距離恋愛や旅先での出会い。ただし長続きは難しい。',
    health: '旅の疲れ。疲労と飲食の衛生に注意。',
    wealth: '財運は外にあり。遠方でのほうがチャンス大。しかし旅費も大。',
  },
  艮震: {
    overall: '山に雷。小過の象。飛鳥の遺音、下るべくして上るべからず。小事は可、大事は不可。',
    career: '小事に注力せよ。高望みするな。細部に注意して過失を避けよ。',
    love: '小さな摩擦や誤解。大したことなし。寛容であれ。',
    health: '軽い病気や小さな怪我。大事なし。しかし早めの処置を。',
    wealth: '小得あり。しかし小さな過ちで失うかも。慎重な財務管理を。',
  },
  艮巽: {
    overall: '風に山。漸の象。山に木あり、漸進の象。一歩一歩、焦るな。自然に進め。',
    career: '一歩一歩前進。焦るな。着実な発展が最も確実。',
    love: '自然に発展させよ。じわじわと愛情を育てよ。',
    health: '徐々に改善。回復は漸進的プロセス。忍耐と持続が必要。',
    wealth: '緩やかな成長。積少成多。定投と長期資産管理に適す。',
  },
  艮艮: {
    overall: '山の上に山。止の象。時に止まり、時に行く。君子はその位を出でず。静が動に勝る。',
    career: '活動停止。新規案件を進めるな。休息と反省の時。',
    love: '冷靜に。急いで進めるな。距離を置いて考えよ。',
    health: '静養が必要。激しい運動は避けよ。',
    wealth: '財運静止。収入も大きな出費もなし。貯蓄が吉。',
  },
  艮坤: {
    overall: '地に山。謙の象。山を地に隠す、謙虚の象。最も吉祥な卦の一つ。謙遜が大利を招く。',
    career: '謙虚・低姿勢が幸運を呼ぶ。功を誇らずとも認められる。',
    love: 'お互い譲り合い、関係調和。謙虚な態度が愛情をより甘くする。',
    health: '良好。心の平安が健康の保証。',
    wealth: '財運亨通。謙虚が富を集める。富を誇示せず、自然に蓄積せよ。',
  },
  坤震: {
    overall: '地に雷。豫の象。雷出地奮、愉悦の象。楽しめ、ただし過ぎたるは及ばざるが如し。',
    career: '順調で愉快。職場の雰囲気良好。人間関係を活かして前進せよ。',
    love: '甘く楽しい関係。デートに最適。ただし過度に溺れるな。',
    health: '健康良好。ただし暴飲暴食に注意。',
    wealth: '財運可。嬉しい驚きあり。ただし使いすぎに注意。',
  },
  坎坤: {
    overall: '地に水。比の象。地上に水あり、親比の象。広く善縁を結べ。',
    career: '人間関係絶好。強力なパートナー。ネットワークを積極的に構築せよ。',
    love: '甘い恋愛。離れられない関係。',
    health: '良好。気血調和。',
    wealth: '協力で財を得る。人脈は財脈。',
  },
  坤坤: {
    overall: '地の上に地。坤の象。厚徳載物。柔よく剛を制す。静が動に勝る。',
    career: '独立開拓より補佐役に徹せよ。本務を全うし、上司を支えよ。',
    love: '穏やかで包容力ある関係。柔らかさが強さに勝る。',
    health: '安定。脾胃に注意。穏やかな運動が適す。',
    wealth: '安定。蓄積と節約による富。厚徳は富を集める。',
  },
  乾兑: {
    overall: '天に沢。夬の象。決断の時。決すべくは決し、ためらうな。',
    career: '決断の時。優柔不断は禍を招く。勇往邁進。',
    love: '選択を迫られる。未練を断ち新たな出発を。',
    health: '急性の問題に注意。迅速な処置を。',
    wealth: '決断が必要。損切りか果敢な投資か。ためらいは好機を逃す。',
  },
  乾震: {
    overall: '天に雷。大壮の象。剛健にして動く。非礼を履まず。勢い盛ん、積極的に進め。ただし傲慢になるな。',
    career: '勢いが凄まじい。果敢に開拓せよ。ただし傲慢を戒めよ。',
    love: '陽剛過多。男女のバランスに注意。剛柔併せ持つべし。',
    health: '強壮、精力充実。激しい運動に適す。ただし過剰消費に注意。',
    wealth: '旺盛な財運。収穫豊か。ただし貪るな。',
  },
  乾巽: {
    overall: '天に風。小畜の象。小成あり、未だ大成せず。引き続き蓄積せよ。',
    career: '小成功。まだ大功には遠い。現状に満足せず引き続き蓄積せよ。',
    love: '蓄積段階。進展あり未熟。育て続けよ。',
    health: '回復蓄積中。小さな進歩継続せよ。',
    wealth: '小蓄積。余裕ありだが大金には非ず。',
  },
  乾坎: {
    overall: '天に水。需の象。雲天にあり、需待の象。時至らず。強求無益、待て。',
    career: '忍耐して時を待て。今は手を出す時ではない。引き続き準備せよ。',
    love: '焦るな。縁はまだ来ていない。時間と空間を与えよ。',
    health: '休養と養生。早く治そうと焦るな。',
    wealth: '時未だ到らず。待て。焦って投資するな。',
  },
  乾艮: {
    overall: '山に天。大畜の象。天山中にあり、大いに蓄える。君子は徳を畜う。大器晩成。',
    career: '蓄積豊富。表に出ていないが基礎は固い。知識・資源・人脈の蓄積に適す。',
    love: '深い基盤。派手ではないが非常に安定。',
    health: '可。長期蓄積の問題に注意。養生は積み重ねが大事。',
    wealth: '蓄積豊か。富を誇示するな。',
  },
  兑离: {
    overall: '火に沢。睽の象。火上の沢、乖離の象。相違点を認めつつ共通点を探れ。',
    career: '意見対立、協力に亀裂。共通の利益を探れ。頑固な分裂を避けよ。',
    love: '趣味や価値観の相違。理解と包容が必要。',
    health: '体の左右非対称や炎症に注意。',
    wealth: '意見対立で財運損なう。協力関係の解消も。',
  },
  兑巽: {
    overall: '風に沢。中孚の象。信が豚魚に及ぶ。至誠が全てを動かす。',
    career: '誠実が最善の戦略。信用を大切に。',
    love: '真心で以て相手に接せよ。信頼が愛情の基盤。',
    health: '身心健康。誠実は心の平安をもたらす。',
    wealth: '信用が財を呼ぶ。誠実経営で財源広がる。',
  },
  离坤: {
    overall: '地に火。明夷の象。火地中に入り、傷つの象。光明損なわれ挫折。韜光養晦、時を待て。',
    career: '挫折。才能が抑圧される。低姿勢で耐えよ。',
    love: '傷つけられる。心の痛み。癒しの時間が必要。',
    health: '健康不良。特に目や心臓血管に注意。',
    wealth: '財運損失、投資失敗。経費削減、元本を守れ。',
  },
  震离: {
    overall: '火に雷。噬嗑の象。頤中に物あり、歯で噛み砕く。障害を断固排除。',
    career: '障害を力と決断で乗り越えよ。訴訟の可能性。断固たる決断を。',
    love: '関係に障壁。積極的に話し合え。',
    health: '口・歯・消化器に注意。',
    wealth: '財運阻害。法的措置が必要かも。',
  },
  巽巽: {
    overall: '風の上に風。巽の象。両風相随、柔順の象。命令に従い行動せよ。柔らかに、固くなるな。',
    career: '上司の指示に従え。異端を唱えるな。補佐役に徹せよ。',
    love: '相手の意見に従うべし。強すぎるな。',
    health: '呼吸器・風邪に注意。敏感な体質。',
    wealth: '風に乗る財運。小銭は入るが大金は無し。',
  },
  坤兑: {
    overall: '沢に地。萃の象。沢在地上、聚集の象。英傑集う。団結せよ。',
    career: '人材集結、チーム力強大。採用・チーム構築に適す。',
    love: '多くの追いかけ、桃花運旺盛。慎重に選べ。',
    health: '集団感染リスクに注意。',
    wealth: '集中する財。人集まれば財集まる。',
  },
}

/** 六十四卦断辞 - 韓文翻译 */
export const MEIHUA_DUANCI_KO: Record<string, GuaDuanCi> = {
  乾乾: {
    overall: '하늘이 하늘 위에. 순양의 괘, 원형이정. 천행강건, 자강불식. 모든 효가 양 — 광명정대. 운세 극왕, 만사통달. 그러나 양극은 음생 — 교만을 경계하라.',
    career: '사업이 절정. 적극 진취, 리더십 발휘. 그러나 교만은 패망을 부름 — 겸손하라.',
    love: '감정 순조, 관계는 열정적. 그러나 양기가 과다 — 부드러움도 더하라. 독신자는 우수한 상대 만나기 쉬움.',
    health: '건강良好, 정력 충만. 심장·혈압에 주의. 과로 금물.',
    wealth: '재운 형통, 정재·편재 모두 좋음. 대담한 투자 가능. 그러나 탐욕 금물, 때를 봐서 그만둬라.',
  },
  巽乾: {
    overall: '하늘에 바람. 우연한 만남의 상. 바람 하늘에, 만물 상봉. 일음오양 — 소인을 경계하라.',
    career: '뜻밖의 기회와 귀인 출현. 새로운 협력이나 발전 계기. 선악을 분별하고 소인을 경계하라.',
    love: '뜻밖의 인연, 도화운 왕성. 그러나 오고 감이 빠름. 기존 커플은 제3자 개입 경계.',
    health: '가벼운 병. 호흡기·피부 과민. 기후 변화 주의.',
    wealth: '재운에 파도. 뜻밖의 수입과 지출 공존. 신중한 재무 관리. 작은 이익에 눈멀지 마라.',
  },
  艮乾: {
    overall: '하늘에 산. 은둔의 상. 때가 불리 — 퇴각하여 기다려라. 그러나 퇴중유진.',
    career: '물러서라, 나가지 마라. 환경 불리 — 무리한 전진은 해를 부름. 낮은 자세로 힘을 모아 기회를 기다려라.',
    love: '거리감 발생 가능. 공간과 시간 필요. 강요 말고 거리가 관계에 도움될 수도.',
    health: '다소 불편. 하체·관절 주의. 안정이 좋음.',
    wealth: '재운 저조. 투자 피하고 지키는 것이 우선. 지출 줄이고 현금 확보.',
  },
  乾坤: {
    overall: '땅이 하늘 아래. 천지불교, 폐색의 상. 올라가는 하늘기와 내려가는 땅기 — 음양 격절. 지키는 것이 최선. 극하면 통한다.',
    career: '저항 큼, 상하 소통 불량. 경거망동 금물. 힘을 모아 전기를 기다려라.',
    love: '오해와 어긋남. 인내 필요. 서로 공간을 주고 서두르지 마라.',
    health: '그저 그럼. 호흡기·소화기 주의. 규칙적 생활.',
    wealth: '재운 불량. 투기적 투자 피해라. 지키는 것이 최우선.',
  },
  坤巽: {
    overall: '땅에 바람. 관찰의 상. 바람 대지를 두루 살핌. 냉정 관찰, 경솔한 행동 피하라. 조사·학습·계획의 시기.',
    career: '관망이 좋음. 조사·학습·계획의 시기. 큰 그림을 보라.',
    love: '상대를 잘 알고 마음을 열어라. 많이 관찰하고, 많이 대화하고, 올바른 판단을.',
    health: '큰 문제 없음. 눈의 피로와 정신적 피로 주의.',
    wealth: '재운 평온. 큰 투자 행동 없을 것. 작은 수입, 저축이 좋음.',
  },
  坤艮: {
    overall: '산이 땅 위에. 박락의 상. 음이 양을 소멸 — 소인의 길 번창, 군자의 길 쇠퇴. 신중히 지켜라. 그러나 극하면 복귀한다.',
    career: '압력, 지위 흔들릴 수. 낮은 자세로 사실에 충실, 다투지 마라.',
    love: '상실감, 관계 위태. 더 많은 포용과 이해를. 쉽게 이별을 말하지 마라.',
    health: '뼈·치아·피부 주의. 과로 피하고 양생.',
    wealth: '쇠운, 파재의 조짐. 투자 피하고 금전 분쟁 피하라. 검약.',
  },
  坤离: {
    overall: '땅에 불. 해돋이, 승진의 상. 군자 스스로 밝은 덕을 빛냄. 운기 상승, 전망 창창. 적극 추진.',
    career: '절호의 사업운. 승진의 기쁨, 명성 향상. 노력이 인정받고 보답받음.',
    love: '순조로운 발전. 관계 날로 뜨거워짐. 고백이나 청혼에 호기. 독신자는 도화운 왕성.',
    health: '건강良好, 정신 충만. 야외 활동·운동에 좋음. 일광화상·열사병 주의.',
    wealth: '재운 번영. 투자 좋은 리턴. 그러나 탐하지 말고 때를 봐서 그만둬라.',
  },
  坤乾: {
    overall: '하늘이 땅 위에. 천지교태, 만물 통달의 상. 가장 길한 괘 중 하나. 만사 순조.',
    career: '사업 순조, 상하 일심. 협력도 프로젝트도 순조. 적극적으로 확장.',
    love: '감정 원만. 두 마음이 서로 통함. 독신자는 좋은 인연 만나기 쉬움.',
    health: '건강 절호. 기혈 조화. 좋은 생활 습관 유지.',
    wealth: '왕성한 재운. 정도로 재물 얻음. 안정적 수입 증가, 뜻밖의 수입도. 투자 좋으나 탐하지 마라.',
  },
  兑乾: {
    overall: '하늘에 못. 밟는 상, 살얼음 밟듯. 규칙 지키고 공경하라. 호랑이 꼬리 밟아도 물리지 않음.',
    career: '신중히 행동. 규칙 지키고 공을 탐하지 마라. 착실한 걸음이 성공 길.',
    love: '인내와 성의 필요. 상대 망설임 있을 수. 시간과 행동으로 증명.',
    health: '상태 괜찮. 위장 주의. 규칙적 생활.',
    wealth: '재운 보통. 투기 손대지 마라. 착실히 벌어라.',
  },
  兑兑: {
    overall: '못 위에 못. 두 못이 서로 적심, 기쁨의 상. 군자 붕우와 강습. 기쁨의 징조, 만사 순조.',
    career: '사업운 좋음. 인간 관계 원만, 협력 유쾌. 교섭·계약도 순조.',
    love: '달콤한 사랑. 데이트·고백·프로포즈에 좋음.',
    health: '건강 좋음. 목·성대 주의.',
    wealth: '재운 괜찮. 수입 있음. 그러나 유흥비 지출 주의.',
  },
  离兑: {
    overall: '못에 불. 변혁의 상. 수화 상식, 구거신래. 아픔 있으나 재생 있음.',
    career: '큰 변혁. 이직·업종 전환·회사 개혁. 변혁은 기회를 나름. 적응 기간 필요.',
    love: '관계의 전기. 옛 패턴 더 이상 맞지 않음. 변화 필요. 이별 혹은 재결합.',
    health: '건강 변화. 수술이나 치료 가능성. 염증·발열 주의.',
    wealth: '재운 변동. 변혁기에는 지출 증가. 기존 수입원 변화. 수입원 넓히고 경비 줄여라.',
  },
  震兑: {
    overall: '못에 천둥. 귀매의 상. 천둥 위 못 아래. 혼인은 길, 다른 것은 신중히.',
    career: '인맥이나 관계로 발전 가능. 그러나 지나친 의존 금물. 여성 사업운 더 좋음.',
    love: '결혼의 기쁨. 약혼·결혼에 길. 기존 관계 더 깊어짐. 그러나 관계의 불평등 주의.',
    health: '괜찮. 감정 기복·내분비 주의. 여성은 부인과 건강.',
    wealth: '보통. 결혼이나 사교로 지출 증가. 신중한 재정 계획.',
  },
  兑坎: {
    overall: '못에 물. 절제의 상. 못 가득 차서 넘침. 절도 가져라. 규칙 세워라. 지나침은 모자람만 못함.',
    career: '절도 필요. 맹목적 확장·과잉 투자 피하라. 장기 계획 세워 착실히.',
    love: '적당한 거리감 필요. 너무 달라붙거나 너무 멀어져도 안 됨. 거리가 아름다움.',
    health: '음식 절제. 나쁜 버릇도 절제. 규칙적 생활.',
    wealth: '평온. 지출 억제. 절약이 요체. 고위험 투자 피하라.',
  },
  兑坤: {
    overall: '땅이 못 위에. 임의 상. 사태 진전, 좋은 일 가까움. 기회 잡고 흐름 타라.',
    career: '운기 상승, 성공 임박. 눈앞 기회 잡아라. 상사와 관계 좋음.',
    love: '관계 다음 단계로. 결혼·동거에 호기. 적극적으로 움직여라.',
    health: '절호, 정신 충만. 건강 진단·보건에 좋음.',
    wealth: '재운 점차 왕성. 수확 있음. 수입 증가. 저축이 좋음.',
  },
  兑艮: {
    overall: '산이 못 위에. 손의 상. 아래 손해, 위 이익. 손실 불가피하나 소손대득. 버려야 얻음.',
    career: '작은 손실이나 희생. 장기적 유익. 물러서서 나아가라, 먼저 주고 얻어라.',
    love: '희생과 타협 필요. 한쪽이 더 많이 주어야. 진심은 언젠가 보답받음.',
    health: '약간 소모. 과로 피하고 휴식·영양 보충. 작은 병은 조기 치료.',
    wealth: '손실, 지출이 수입 초과. 그러나 필요한 투자. 길게 보라.',
  },
  离乾: {
    overall: '하늘에 불. 대동의 상. 중지성성, 단결이 큰일 이룸.',
    career: '협력이 열쇠. 팀워크가 최대 효과. 인간 관계 좋음.',
    love: '뜻을 같이하는 상대. 가치관이 맞음. 독신자는 사교 모임에서 동지 만남.',
    health: '건강 좋음. 단체 운동·사교 활동에 좋음.',
    wealth: '재운 형통, 협력이 재물 낳음. 팀 이익은 나누어라.',
  },
  离离: {
    overall: '불 위에 불. 중명조요, 광명의 상. 문학·예술·명성의 성취.',
    career: '명성 높아짐. 문화·예술·교육·미디어에 적합.',
    love: '격렬하고 로맨틱. 정열 타오름. 그러나 불 너무 세면 탐. 냉정도 필요.',
    health: '눈·심장·혈액 순환 주의. 감정 기복 주의. 요가·명상 좋음.',
    wealth: '재운 괜찮. 들어오는 것도 빠르고 나가는 것도 빠름. 투기에 지나치지 마라.',
  },
  离震: {
    overall: '천둥과 불. 서합의 상. 입에 물건 있어 이로 씹어 부숨. 장애를 단결 배제. 공정 판결.',
    career: '장애를 힘과 결단으로 극복. 소송·분쟁 가능. 단결 필요.',
    love: '관계 장벽, 적극적 소통이 해결 열쇠.',
    health: '입·치아·소화기 주의. 염증 조기 치료.',
    wealth: '재운 저해. 법적 조치 필요할 수도.',
  },
  离巽: {
    overall: '바람과 불. 가인의 상. 풍화상생, 가정의 도. 가정 화목하면 만사 흥함.',
    career: '가정이 사업의 기반. 가족 지지 행운을 부름. 가족 경영·재택 근무에 좋음.',
    love: '가정 원만. 결혼·출산에 좋음.',
    health: '상태 좋음. 가정의 화목이 건강에 좋음.',
    wealth: '재운 안정. 가정 재무 관리 능숙. 부동산 등 가족 관련 투자에 좋음.',
  },
  离坎: {
    overall: '물이 불 위에. 미제의 상. 미완성, 작은 여우 건너려다 꼬리 적심. 아직 노력 필요.',
    career: '아직 발전 도상. 늦추지 말고 노력. 막바지지만 과제 있음.',
    love: '아직 불안정, 모색 단계. 좋은 일은 시간이 걸림.',
    health: '그럼. 작은 병 계속되지만 큰 일 없음. 예방과 양생.',
    wealth: '불안정. 투자는 수확기 아님. 추가 투자 말고 기다려라.',
  },
  离艮: {
    overall: '산에 불. 몽의 상. 산하출천, 동몽이 내게 묻다. 학습 향상, 스승 공경. 의문은 지혜자에게 묻다.',
    career: '초기 단계나 새 분야. 배우고 상담하라. 무모한 전진 말고 겸허히 기초를 다져라.',
    love: '아직 모호. 서로 탐색 중. 결론 서두르지 말고 더 알아가라.',
    health: '아이·청소년 건강 주의. 성인은 신진대사·내분비.',
    wealth: '재운 미계. 먼저 학습에 투자. 서둘러 벌려 하지 말고 기초를 쌓아라.',
  },
  乾离: {
    overall: '하늘에 불. 대유의 상. 풍작 번영, 가장 길한 괘 중 하나. 수확 풍부.',
    career: '수확 풍부, 생각대로. 명예와 이익 동시 획득. 승기 타고 확장.',
    love: '사랑 풍성. 독신자 도화운 극히 왕성.',
    health: '건강, 정력 충만. 운동 강화에 좋음.',
    wealth: '재운 형통. 크게 얻음. 정재·편재 모두 풍작.',
  },
  震乾: {
    overall: '하늘에 천둥. 무망의 상. 천명이 돕지 않음, 함부로 움직이지 마라. 순기자연, 수정이 길.',
    career: '함부로 움직이지 마라, 현상 유지가 길. 착실히 일하고 편법 쓰지 마라.',
    love: '진실하라. 거짓된 마음 통하지 않음. 자연 발전에 맡겨라.',
    health: '뜻밖의 사고·부상 주의. 위험 활동 피하라.',
    wealth: '재운 평담. 투기 피하고 정도로 벌어라. 불의의 재물 탐하지 마라.',
  },
  兑震: {
    overall: '못에 천둥. 수의 상. 때를 따르고 고집하지 마라. 임기응변이 상책.',
    career: '흐름 따라라. 거스르지 마라. 양사익우나 시장 트렌드 따르면 발전.',
    love: '인연에 맡겨라. 강요 말고 마음 가는 대로.',
    health: '계절 따라 체조 변동. 환경 변화 적응. 자연 리듬 따르는 것이 좋음.',
    wealth: '재운 시장과 함께 변동. 흐름 타는 투자가 좋음.',
  },
  震震: {
    overall: '천둥 위에 천둥. 진동의 상. 백리 놀라게 하나 술잔 떨어뜨리지 않음. 냉정한 대응이 행운.',
    career: '큰 변동이나 돌발 사태. 새 기회나 도전. 냉정 대응. 변동에 기회.',
    love: '갑작스러운 일로 관계 파문. 냉정 대화. 폭풍 후 맑음.',
    health: '돌발 건강 문제, 특히 심뇌혈관 주의. 정기 검진으로 예방.',
    wealth: '크게 변동. 예상치 못한 지출 가능. 고위험 투기 피하라.',
  },
  震巽: {
    overall: '바람에 천둥. 익의 상. 풍뢰격탕, 손상익하. 군자 선을 보면 옮기고 허물을 고침. 만사 증익.',
    career: '수익 증가, 순조 발전. 규모 확장·투자 증가에 좋음.',
    love: '날로 깊어지는 사랑. 동거·결혼에 적합.',
    health: '점점 건강. 운동과 케어로 개선.',
    wealth: '증익 뚜렷. 수입 증가, 투자 호조.',
  },
  震坎: {
    overall: '물에 천둥. 둔의 상. 뢰우 교차, 간난의 상. 만사 시작이 어렵다. 인내와 노력으로 극복.',
    career: '초기 단계나 어려움 직면. 시작은 어렵다. 인내하고 노력.',
    love: '느린 진전. 모종 가꾸듯 정성 들여라.',
    health: '불편 초기나 지병 재발. 조기 진료. 과로 피하고 양생.',
    wealth: '회복 시작, 아직 불안정. 검약. 조금씩 축적.',
  },
  震艮: {
    overall: '산에 천둥. 이의 상. 산 아래 천둥, 기름의 상. 말 삼가고 음식 절제. 양생과 자기 수양.',
    career: '충전·학습 시기. 과로 피하고 배움 통해 자신을 높여라.',
    love: '세심한 케어 필요. 서로 관심 게을리 하지 마라.',
    health: '건강 제일. 양생에 주력.',
    wealth: '평온. 저축이 좋음. 편법보다 자력이 확실.',
  },
  震坤: {
    overall: '땅에 천둥. 복의 상. 일양복시, 칠일래복. 겨울 가고 봄 옴. 저조에서 상승 전환.',
    career: '저점에서 회복. 옛 문제 해소, 새 기회 출현. 재출발.',
    love: '재결합 기회 큼. 헤어진 관계 부활 가능. 과거 응어리 버리고 다시 시작.',
    health: '회복 중. 천천히 양생. 봄 생기 돌아옴.',
    wealth: '회복 기조. 아직 강하지 않으나 호전 조짐.',
  },
  巽兑: {
    overall: '못에 바람. 대과의 상. 못이 나무 뿌리 잠김. 비상 용기 필요. 비상 국면.',
    career: '비상 국면, 압력 큼. 상식 깨고 비상 수단. 독립하여 두려워 말라.',
    love: '관계 불균형. 한쪽 과다 투여. 조정 필요.',
    health: '심각 가능. 무시 말라. 철저 검사와 치료.',
    wealth: '대기대락. 과잉 투자나 빚 위험. 재정 압박, 절제.',
  },
  巽离: {
    overall: '불에 바람. 정이 상. 목화로 취사. 구革 신립. 대길대리, 만상갱신.',
    career: '새 국면. 구 모델 혁신. 신사업·신제품·신브랜드에 좋음.',
    love: '새 단계로. 더 안정적 관계. 결혼·주택 구입·공동 창업에 좋음.',
    health: '정처럼 강건. 소화기·영양 흡수 주의.',
    wealth: '왕성한 재운. 새로운 재원. 신규 투자나 사업 수익 좋음.',
  },
  巽震: {
    overall: '바람에 천둥. 항의 상. 뢰풍상여, 항구의 도. 항은 길, 변은 흉.',
    career: '지속하라. 현재 길을 지켜라. 이직이나 방향 전환 피하라.',
    love: '안정적 오래가는 사랑. 결혼에 좋음. 성실과 지속이 열쇠.',
    health: '안정 상태. 만성 질환은 장기 케어. 규칙적 운동.',
    wealth: '안정 지속. 정재 수입 안정. 장기 투자·가치 투자 적합.',
  },
  巽坎: {
    overall: '물에 바람. 정의 상. 읍을 바꿔도 우물은 바꾸지 않음. 잃지도 얻지도 않음. 수성이 제일.',
    career: '안정기. 수성이 좋고 개척 불필요. 현재 자원으로 충분.',
    love: '잔잔한 우물물처럼. 격렬하진 않으나 오래감.',
    health: '안정. 식수 청결·신장 케어 주의.',
    wealth: '우물물처럼 끊이지 않으나 폭발적 부는 없음. 저축 중요.',
  },
  巽艮: {
    overall: '산에 바람. 고의 상. 산 아래 바람, 부패의 상. 적폐 청산에 호기.',
    career: '문제 산적. 쌓인 폐해 철저 정리 필요. 개혁·재편에 좋음.',
    love: '쌓인 불만, 철저 소통으로 수리. 과거 대립 도망치지 마라.',
    health: '반건강 상태. 해독과 양생 필요.',
    wealth: '재운 불량, 파재 조짐. 과거 재정 문제 표면화.',
  },
  巽坤: {
    overall: '땅에 바람. 승의 상. 지중 목생, 상승의 상. 적소고대. 운기 상승, 사업 순조.',
    career: '순조 상승. 승진·이직에 좋음. 한 걸음 한 걸음.',
    love: '착실 상승. 날로 친밀. 부모 소개·약혼·결혼에 좋음.',
    health: '날로 강건. 케어 통해 현저한 개선.',
    wealth: '차차 상승. 수입 지속 성장. 투자 확장 가능하나 모험은 피하라.',
  },
  坎乾: {
    overall: '하늘에 물. 송의 상. 천수위행, 쟁송. 화가 귀중. 다툼 피하라.',
    career: '분쟁·논쟁 휘말리기 쉬움. 합의로 해결. 먼저 꾀하고 나중에 움직여라.',
    love: '말다툼·대립 생기기 쉬움. 각자 양보.',
    health: '두부·비뇨기 주의. 감정 기복.',
    wealth: '분쟁으로 재운 손상. 공동 경영·금전 대차 피하라.',
  },
  坎兑: {
    overall: '못에 물. 곤의 상. 못에 물 없음, 빈곤의 상. 곤하여도 즐거움 잃지 않음.',
    career: '곤란에 빠짐. 자원 부족. 직장 지켜라. 자신감 가져라.',
    love: '교착. 서로 지쳐 있음. 서로 지지하며 극복.',
    health: '우려. 허약. 영양 보충과 양생.',
    wealth: '빈곤. 재정 압박. 검약이 유일한 방법.',
  },
  坤坎: {
    overall: '땅에 물. 사의 상. 지중 유수, 병중의 상. 규율과 질서가 성공 열쇠.',
    career: '팀워크 필수. 개인 능력 한계. 조직 관리에 적합.',
    love: '삼각 관계나 경쟁 가능. 제3자 개입 주의.',
    health: '집단 감염·집단 환경 건강 문제 주의.',
    wealth: '재는 무리에서 옴. 팀 수익 공평 분배.',
  },
  坎坎: {
    overall: '물 위에 물. 중험의 상. 전후 맹호. 그러나 마음을 강하게 가지면 극복.',
    career: '곤란 중중. 신중히 걸어라. 안전 제일.',
    love: '시련 중중. 진실한 사랑은 극복.',
    health: '건강 문제 많음. 종합 검사와 케어.',
    wealth: '위험한 재운. 투기 피하라. 현금이 왕.',
  },
  坎离: {
    overall: '불이 물 위에. 미제의 상. 미완성. 육십사괘 마지막 괘, 순환 의미.',
    career: '아직 성공 못함. 노력 계속. 마지막 단계가 가장 문제 생기기 쉬움.',
    love: '미확정. 변수 있음. 명확한 소통.',
    health: '이상적이지 않음. 작은 병 계속. 조기 케어.',
    wealth: '불안정. 투자 수확기 아님. 인내.',
  },
  坎震: {
    overall: '천둥에 물. 이해 상. 뢰우 작용, 과목 초목 갑탁. 곤란 해소, 행운 옴.',
    career: '곤란 곧 해결. 문제 해결 호기.',
    love: '대립 해소. 오해 풀림. 전보다 더 친밀.',
    health: '회복 중. 상태 호전.',
    wealth: '재정 곤란 해소. 압박 서서히 완화.',
  },
  坎巽: {
    overall: '바람에 물. 환의 상. 풍수상행, 산일의 상. 인심 이산. 그러나 집중하면 만회 가능.',
    career: '인심 이산, 팀 결속 부족. 조속히 수습.',
    love: '소원의 조짐. 때맞춰 소통.',
    health: '원기 산일, 몸 약해짐. 과소모 피하라.',
    wealth: '재산 유출 위험. 지출 억제.',
  },
  坎艮: {
    overall: '산에 물. 건의 상. 산에 물, 저난의 상. 지난이퇴. 수신해 시를 기다려라.',
    career: '진퇴 곤란. 무리하게 나가지 마라. 한 걸음 물러나는 것이 전략.',
    love: '장애 중중. 진전 곤란. 일시 중단도 고려.',
    health: '불량. 병 증상 반복. 무리 말고 양생.',
    wealth: '재운 저해. 투자 개척 피하라.',
  },
  艮坎: {
    overall: '물에 산. 몽의 상. 산하출천, 동몽이 내게 묻다. 겸허히 배우고 스승 공경.',
    career: '학습 단계. 지식과 경험 쌓아라. 독단 피하라.',
    love: '사랑 싹트나 아직 애매. 서두르지 말고 더 알아가라.',
    health: '아이 건강 주의. 성인은 신경계.',
    wealth: '재운 미계. 먼저 학습에 투자.',
  },
  艮兑: {
    overall: '못에 산. 함의 상. 산에 못, 감응의 상. 겸허히 사람 받아들여라. 인력·애정·교류. 진실한 교류가 열쇠.',
    career: '파트너와 공명. 협력 즐거움. 교섭도 순조.',
    love: '가장 길. 서로 끌림. 고백·프로포즈에 최적.',
    health: '계절 변화 적응. 전반적으로 좋음.',
    wealth: '인간 관계로 재운 업. 협력과 네트워크로 부를 얻어라.',
  },
  艮离: {
    overall: '산에 불. 여의 상. 산에 불, 행려의 상. 먼 곳 활동 주의.',
    career: '출장·전근·이동 가능. 먼 곳 발전에 좋음.',
    love: '원격 연애나 여행지 인연. 그러나 오래가기 어려움.',
    health: '여행 피로. 피로·식음 위생 주의.',
    wealth: '재운 밖에 있음. 먼 곳에서 더 기회. 그러나 여행비도 큼.',
  },
  艮震: {
    overall: '산에 천둥. 소과의 상. 비조 유음, 내려갈지언정 올라가지 마라. 작은 일은 가, 큰 일은 불가.',
    career: '작은 일에 주력. 높은 곳 바라지 마라. 세부 주의.',
    love: '작은 마찰·오해. 큰 일 아님. 관용.',
    health: '가벼운 병·작은 부상. 큰 일 없음. 그러나 조기 처치.',
    wealth: '소득 있음. 그러나 작은 실수로 잃을 수. 신중 재무 관리.',
  },
  艮巽: {
    overall: '바람에 산. 점의 상. 산에 나무, 점진의 상. 한 걸음 한 걸음, 서두르지 마라.',
    career: '한 걸음 한 걸음 전진. 서두르지 마라. 착실한 발전이 가장 확실.',
    love: '자연 발전시켜라. 서서히 애정 키워라.',
    health: '점차 개선. 회복은 점진적 과정.',
    wealth: '완만한 성장. 적소성다. 정기 투자·장기 자산 관리.',
  },
  艮艮: {
    overall: '산 위에 산. 지의 상. 때에 그치고 때에 행함. 정이 동에胜.',
    career: '활동 중지. 신규 진행 말아라. 휴식과 반성의 때.',
    love: '냉정히. 서둘러 진행 마라. 거리 두고 생각.',
    health: '정양 필요. 격렬 운동 피하라.',
    wealth: '재운 정지. 수입도 큰 지출도 없음. 저축이 좋음.',
  },
  艮坤: {
    overall: '땅에 산. 겸의 상. 산을 땅에 숨김, 겸허의 상. 가장 길한 괘 중 하나. 겸손이 큰 이익.',
    career: '겸손·낮은 자세가 행운. 공을 자랑 않아도 인정받음.',
    love: '서로 양보, 관계 조화. 겸손한 태도가 사랑 더 달콤.',
    health: '良好. 마음의 평안이 건강 보장.',
    wealth: '재운 형통. 겸손이 부를 모은다.',
  },
  坤震: {
    overall: '땅에 천둥. 예의 상. 뢰출지분, 유쾌의 상. 즐겨라, 그러나 지나치면 안 됨.',
    career: '순조 유쾌. 직장 분위기 좋음. 인간 관계 활용.',
    love: '달콤 즐거운 관계. 데이트에 최적. 그러나 지나치게 빠지지 마라.',
    health: '건강 좋음. 폭음폭식 주의.',
    wealth: '재운 괜찮. 기쁜 놀라움. 그러나 지나친 소비 주의.',
  },
  坎坤: {
    overall: '땅에 물. 비의 상. 지상 유수, 친비의 상. 널리 선연을 맺어라.',
    career: '인간 관계 절호. 강력 파트너. 네트워크 구축.',
    love: '달콤한 사랑. 떨어질 수 없는 관계.',
    health: '良好. 기혈 조화.',
    wealth: '협력으로 재물 얻음. 인맥이 재맥.',
  },
  坤坤: {
    overall: '땅 위에 땅. 곤의 상. 후덕재물. 부드러움이 강함 이김. 정이 동에 이김.',
    career: '독립 개척보다 보조역. 본무 충실, 상사 지원.',
    love: '온화 포용적 관계. 부드러움이 강함.',
    health: '안정. 비위 주의. 온화한 운동.',
    wealth: '안정. 저축과 검약에 의한 부.',
  },
  乾兑: {
    overall: '하늘에 못. 쾌의 상. 결단의 때. 결단해야 할 때 망설이지 마라.',
    career: '결단의 때. 우유부단은 화 부름. 용맹 전진.',
    love: '선택 강요됨. 미련 끊고 새 출발.',
    health: '급성 문제 주의. 신속 처치.',
    wealth: '결단 필요. 손절매 혹은 과감한 투자. 망설임은 기회 놓침.',
  },
  乾震: {
    overall: '하늘에 천둥. 대장의 상. 강건 이동. 비례 안 밟음. 기세 창대, 적극 진취. 오만 금물.',
    career: '기세 대단. 과감 개척. 오만 경계.',
    love: '양강 과다. 남녀 균형 주의.',
    health: '강건, 정력 충만. 격렬 운동 적합. 과소비 주의.',
    wealth: '왕성 재운. 수확 풍부. 탐하지 마라.',
  },
  乾巽: {
    overall: '하늘에 바람. 소축의 상. 소성 있으나 아직 대성 아님. 계속 축적.',
    career: '소성공. 아직 대공에 멂. 현상 만족 말고 계속 축적.',
    love: '축적 단계. 진전 있으나 미숙.',
    health: '회복 축적 중. 작은 진보 계속.',
    wealth: '소축적. 여유 있으나 큰돈 아님.',
  },
  乾坎: {
    overall: '하늘에 물. 수의 상. 운천에 있음, 수대의 상. 때 아직 안 옴. 강구 무익, 기다려라.',
    career: '인내하고 기다려라. 지금은 손댈 때 아님. 계속 준비.',
    love: '서두르지 마라. 인연 아직 안 옴.',
    health: '휴식과 양생. 빨리 낫겠다고 조급해 하지 마라.',
    wealth: '때 아직 안 옴. 기다려라. 서둘러 투자하지 마라.',
  },
  乾艮: {
    overall: '산에 하늘. 대축의 상. 하늘 산중에 있음, 크게 저장. 대기만성.',
    career: '축적 풍부. 밖에 드러나지 않았으나 기초 튼튼.',
    love: '깊은 기반. 화려하지 않으나 매우 안정.',
    health: '그럼. 장기 축적 문제 주의.',
    wealth: '축적 풍부. 부를 과시하지 마라.',
  },
  兑离: {
    overall: '불에 못. 제의 상. 불 위 못, 괴리의 상. 차이 인정하고 공통점 찾아라.',
    career: '의견 대립, 협력 균열. 공동 이익 찾아라.',
    love: '취미·가치관 차이. 이해와 포용 필요.',
    health: '좌우 비대칭·염증 주의.',
    wealth: '의견 대립으로 재운 손상. 협력 관계 해소될 수도.',
  },
  兑巽: {
    overall: '바람에 못. 중부의 상. 신이 돈어에 미침. 지성이 모든 것을 움직임.',
    career: '성실이 최선의 전략. 신용 소중히.',
    love: '진심으로 상대 접촉. 신뢰가 사랑의 기반.',
    health: '심신 건강. 성실은 마음의 평안.',
    wealth: '신용이 재물 부름. 성실 경영으로 재원 넓힘.',
  },
  离坤: {
    overall: '땅에 불. 명이의 상. 불 땅 속에 들어감, 상처의 상. 광명 손상, 좌절. 은인하여 때를 기다려라.',
    career: '좌절. 재능 억압. 낮은 자세로 견뎌라.',
    love: '상처받음. 마음의 아픔. 치유 시간 필요.',
    health: '건강 불량. 특히 눈·심혈관 주의.',
    wealth: '재운 손실, 투자 실패. 경비 줄이고 원금 지켜라.',
  },
  震离: {
    overall: '불에 천둥. 서합의 상. 이중에 물건, 이로 씹어 부숨. 장애 단결 배제.',
    career: '장애를 힘과 결단으로 극복. 소송 가능. 단결 필요.',
    love: '관계 장벽. 적극 대화.',
    health: '입·치아·소화기 주의.',
    wealth: '재운 저해. 법적 조치 필요할 수도.',
  },
  巽巽: {
    overall: '바람 위에 바람. 손의 상. 양풍상수, 유순의 상. 명령 따라 행동. 부드럽게, 고집 피우지 마라.',
    career: '상사 지시 따라라. 이단을 주장하지 마라. 보조역.',
    love: '상대 의견 따라라. 너무 강하게 나가지 마라.',
    health: '호흡기·감기 주의. 민감한 체질.',
    wealth: '바람 타는 재운. 잔돈 들어오나 큰돈 없음.',
  },
  坤兑: {
    overall: '땅에 못. 췌의 상. 못 땅 위에, 집취의 상. 영웅 모임. 단결.',
    career: '인재 결집, 팀 강력. 채용·팀 구축에 좋음.',
    love: '많은 구애자, 도화운 왕성. 신중히 선택.',
    health: '집단 감염 위험 주의.',
    wealth: '집중하는 재. 사람 모이면 재물 모임.',
  },
}

/** 六十四卦断辞获取函数 - 多语言支持 */
export function getGuaDuanCi(guaKey: string, lang?: string): GuaDuanCi | undefined {
  if (lang === 'en') return MEIHUA_DUANCI_EN[guaKey]
  if (lang === 'ja') return MEIHUA_DUANCI_JA[guaKey]
  if (lang === 'ko') return MEIHUA_DUANCI_KO[guaKey]
  return MEIHUA_DUANCI[guaKey]
}

// ─────────────────────────────────────────
// 3. YEAR_NAYIN_WUXING - 生肖纳音五行表
// 用于终身卦计算：根据出生年份生肖查纳音五行
// ─────────────────────────────────────────

/** 生肖→纳音五行（终身卦用） */
export const YEAR_NAYIN_WUXING: Record<string, string> = {
  '鼠':'海中金',
  '牛':'海中金',
  '虎':'炉中火',
  '兔':'炉中火',
  '龙':'大林木',
  '蛇':'大林木',
  '马':'路旁土',
  '羊':'路旁土',
  '猴':'剑锋金',
  '鸡':'剑锋金',
  '狗':'山头火',
  '猪':'山头火',
}

/** 根据年份获取纳音五行 */
export function getNayinWuxing(year: number): string {
  const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
  const animal = animals[(year - 4) % 12]
  return YEAR_NAYIN_WUXING[animal] || ''
}

// ─────────────────────────────────────────
// 4. LIFETIME_GUA_EXPLANATION - 终身卦说明
// ─────────────────────────────────────────

/** 终身卦详细说明 */
export const LIFETIME_GUA_EXPLANATION = `终身卦是梅花易数中专门用于推算人一生运势的特殊起卦方法。其核心原理是以出生年份的地支纳音五行取上卦，以出生月的数字取下卦，以出生日与时辰之和取动爻。具体方法为：年柱纳音五行定上卦（海中金→乾兑、炉中火→离、大林木→震巽、路旁土→坤艮、剑锋金→乾兑、山头火→离等），月数取下卦（正月为1对应乾，逐月递增至八月对应坤，余数循环），日数加时辰数之和取动爻。终身卦一经起出终身不变，反映先天命局和后天气运的总体趋势，是了解个人命运轨迹的重要工具。传统上认为终身卦可看出一个人的事业成就、婚姻状况、财运起伏、健康走势等各方面的大趋势，但具体细节还需结合流年大运综合判断。`