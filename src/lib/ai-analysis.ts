// ============================================================
// ai-analysis.ts — AI Analysis Configuration
// ============================================================

export interface AnalysisDimension {
  key: string;
  label: string;
  icon: string;
  // 预留：后续接入付费系统后可启用 free 字段控制内容可见性
  generate: (data?: unknown, lang?: string) => string;
  /** 多语言版本分析（需实现） */
  generateI18n?: (data?: unknown, lang?: string) => string;
  /** 支持的语言 */
  languages?: string[];
}

// ── Helpers ──

const T_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const T_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const WU_XING = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
const ZHI_WX = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
const GAN_YINYANG = { '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴' };
const ZHI_ZODIAC: Record<string,string> = { '子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪' };

// ── i18n Translation Tables ──

/** 五行英文 */
const WX_EN: Record<string,string> = { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' };
/** 五行日文 */
const WX_JA: Record<string,string> = { '木':'木','火':'火','土':'土','金':'金','水':'水' };
/** 五行韩文 */
const WX_KO: Record<string,string> = { '木':'목','火':'화','土':'토','金':'금','水':'수' };
/** 阴阳 */
const YY_EN: Record<string,string> = { '阳':'Yang','阴':'Yin' };
const YY_JA: Record<string,string> = { '阳':'陽','阴':'陰' };
const YY_KO: Record<string,string> = { '阳':'양','阴':'음' };
/** 生肖英文 */
const ZODIAC_EN: Record<string,string> = { '鼠':'Rat','牛':'Ox','虎':'Tiger','兔':'Rabbit','龙':'Dragon','蛇':'Snake','马':'Horse','羊':'Goat','猴':'Monkey','鸡':'Rooster','狗':'Dog','猪':'Pig' };
const ZODIAC_JA: Record<string,string> = { '鼠':'鼠','牛':'牛','虎':'虎','兔':'兎','龙':'竜','蛇':'蛇','马':'馬','羊':'羊','猴':'猿','鸡':'鶏','狗':'犬','猪':'豚' };
const ZODIAC_KO: Record<string,string> = { '鼠':'쥐','牛':'소','虎':'호랑이','兔':'토끼','龙':'용','蛇':'뱀','马':'말','羊':'양','猴':'원숭이','鸡':'닭','狗':'개','猪':'돼지' };

/** 五行特质多语言描述 */
const WX_TRAITS: Record<string,Record<string,string>> = {
  '木': {
    'zh-CN': '仁爱正直、积极向上',
    'zh-TW': '仁愛正直、積極向上',
    'en': 'benevolent, upright, and proactive',
    'ja': '仁愛正直、積極向上',
    'ko': '자애롭고 정직하며 적극적'
  },
  '火': {
    'zh-CN': '热情奔放、光明磊落',
    'zh-TW': '熱情奔放、光明磊落',
    'en': 'passionate, open-hearted, and radiant',
    'ja': '熱情奔放、光明磊落',
    'ko': '열정적이고 솔직하며 명랑'
  },
  '土': {
    'zh-CN': '敦厚诚实、稳重可靠',
    'zh-TW': '敦厚誠實、穩重可靠',
    'en': 'honest, steady, and dependable',
    'ja': '敦厚誠実、穩重可靠',
    'ko': '성실하고 안정적이며 믿음직'
  },
  '金': {
    'zh-CN': '刚毅果断、重情重义',
    'zh-TW': '剛毅果斷、重情重義',
    'en': 'resolute, decisive, and loyal',
    'ja': '剛毅果断、情義に厚い',
    'ko': '강직하고 결단력 있으며 의리가 있음'
  },
  '水': {
    'zh-CN': '聪明灵动、善于变通',
    'zh-TW': '聰明靈動、善於變通',
    'en': 'intelligent, adaptable, and versatile',
    'ja': '聡明機敏、臨機応変',
    'ko': '총명하고 융통성 있음'
  }
};

/** 健康重点多语言 */
const HEALTH_FOCUS: Record<string,Record<string,string>> = {
  '木': {
    'zh-CN': '肝胆健康',
    'zh-TW': '肝膽健康',
    'en': 'liver and gallbladder health',
    'ja': '肝臓・胆のうの健康',
    'ko': '간과 담낭 건강'
  },
  '火': {
    'zh-CN': '心血管调养',
    'zh-TW': '心血管調養',
    'en': 'cardiovascular care',
    'ja': '心臓・血管の養生',
    'ko': '심혈관 건강'
  },
  '土': {
    'zh-CN': '脾胃养护',
    'zh-TW': '脾胃養護',
    'en': 'digestive system care',
    'ja': '脾臓・胃の養生',
    'ko': '비위 건강'
  },
  '金': {
    'zh-CN': '肺与呼吸系统',
    'zh-TW': '肺與呼吸系統',
    'en': 'lungs and respiratory system',
    'ja': '肺・呼吸器系',
    'ko': '폐와 호흡기'
  },
  '水': {
    'zh-CN': '肾与泌尿系统',
    'zh-TW': '腎與泌尿系統',
    'en': 'kidneys and urinary system',
    'ja': '腎臓・泌尿器系',
    'ko': '신장과 비뇨기'
  }
};

/** 人生格局多语言 */
const PATTERN_LANG: Record<string,Record<string,string>> = {
  '土土': { 'zh-CN':'穩重如山', 'zh-TW':'穩重如山', 'en':'steady as a mountain', 'ja':'山のように安定', 'ko':'산처럼 안정적' },
  '水水': { 'zh-CN':'靈動如水', 'zh-TW':'靈動如水', 'en':'fluid like water', 'ja':'水のように流動的', 'ko':'물처럼 유연' },
  '火火': { 'zh-CN':'光明似火', 'zh-TW':'光明似火', 'en':'radiant like fire', 'ja':'火のように明るい', 'ko':'불처럼 빛남' },
  '金金': { 'zh-CN':'堅韌如金', 'zh-TW':'堅韌如金', 'en':'strong like metal', 'ja':'金のように強い', 'ko':'금처럼 강인' },
  '木木': { 'zh-CN':'向上如木', 'zh-TW':'向上如木', 'en':'growing like wood', 'ja':'木のように成長', 'ko':'나무처럼 성장' },
};

const DEFAULT_PATTERN_LANG: Record<string,string> = {
  'zh-CN':'豐富多彩', 'zh-TW':'豐富多彩', 'en':'colorful and diverse', 'ja':'多彩で多様', 'ko':'다채롭고 다양'
};

/** 性格分析核心描述多语言 */
function getPersonalityDetailed(dw: string, yy: string, lang: string): string {
  const l = lang as 'zh-CN'|'zh-TW'|'en'|'ja'|'ko';
  const isCN = l === 'zh-CN' || l === 'zh-TW';
  if (isCN) {
    const text: Record<string,string> = {
      '木': '如春日之木，生機勃勃，有強烈的上進心和成長慾。為人正直，有仁愛之心，樂善好施。有時過於理想主義，需要更加務實。',
      '火': '如夏日之火，熱情洋溢，光明磊落。性格開朗外向，善於表達，有領導魅力。但有時急躁衝動，需學會沉靜。',
      '土': '如大地之土，敦厚誠實，穩重可靠。做事踏實，重承諾守信。為人包容，但有時過於保守，需適當開拓。',
      '金': '如秋日之金，剛毅果斷，重情重義。有強烈的正義感和原則性，做事乾脆利落。但有時過於剛硬，需學會柔和。',
      '水': '如冬日之水，智慧靈動，善於變通。思維敏捷，洞察力強，適應能力好。但有時優柔寡斷，需堅定方向。',
    };
    return text[dw] || '';
  }
  if (lang === 'en') {
    const text: Record<string,string> = {
      '木': 'Like a tree in spring, full of vitality, with a strong drive for growth and self-improvement. You are upright, benevolent, and enjoy helping others. Sometimes overly idealistic, needing to be more pragmatic.',
      '火': 'Like summer fire, passionate and open-hearted. You are outgoing, expressive, and naturally charismatic. At times impulsive, needing to cultivate calmness.',
      '土': 'Like the earth, honest, steady, and dependable. You keep your word and embrace others with tolerance. Sometimes overly conservative, needing to venture out.',
      '金': 'Like autumn metal, resolute, decisive, and loyal. You have a strong sense of justice and principle. Sometimes too rigid, needing to learn gentleness.',
      '水': 'Like winter water, wise and adaptable. Your mind is sharp, your insight keen, and you adapt well. Sometimes indecisive, needing direction and resolve.',
    };
    return text[dw] || '';
  }
  if (lang === 'ja') {
    const text: Record<string,string> = {
      '木': '春の木のように生命力に溢れ、強い向上心と成長欲を持つ。正義感が強く、思いやりのある性格。時に理想主義に走りすぎるため、より現実的な視点が必要。',
      '火': '夏の火のように情熱的で光明磊落。性格は開放的で表現力豊か、リーダーシップがある。時に焦りやすいので、冷静さを学ぶことが大切。',
      '土': '大地のように誠実で安定感がある。約束を守り、包容力がある。時に保守的になりすぎるため、時には新しいことに挑戦を。',
      '金': '秋の金のように果断で情に厚い。強い正義感と原則を持ち、行動は潔い。時に硬くなりすぎるので、柔軟さを身につけるとよい。',
      '水': '冬の水のように知恵があり、臨機応変に対応できる。思考は鋭く、適応力に優れる。時に優柔不断になるため、決断力を養うことが大切。',
    };
    return text[dw] || '';
  }
  if (lang === 'ko') {
    const text: Record<string,string> = {
      '木': '봄의 나무처럼 생명력이 넘치며 강한 성장욕과 진취성을 가졌습니다. 정직하고 인자하며 타인을 돕기를 좋아합니다. 때로는 이상주의에 빠져 현실감각이 부족할 수 있습니다.',
      '火': '여름의 불처럼 열정적이고 명랑합니다. 외향적이며 표현력이 풍부하고 리더십이 있습니다. 때로는 성급하고 충동적이니 침착함을 기르는 것이 좋습니다.',
      '土': '대지처럼 성실하고 안정적이며 믿음직합니다. 약속을 잘 지키고 포용력이 있습니다. 때로는 보수적이니 새로운 도전이 필요합니다.',
      '金': '가을의 금속처럼 강직하고 결단력 있으며 의리가 있습니다. 강한 정의감과 원칙을 지니고 있으며 행동이 깔끔합니다. 때로는 너무 강경하니 부드러움을 배우는 것이 좋습니다.',
      '水': '겨울의 물처럼 지혜롭고 융통성이 있습니다. 사고가敏捷하고 통찰력이 뛰어나며 적응력이 좋습니다. 때로는 우유부단하니 확신을 가지고 방향을 정하는 것이 중요합니다.',
    };
    return text[dw] || '';
  }
  return '';
}

/** 社交模式多语言 */
function getSocialMode(yy: string, lang: string): string {
  if (lang === 'zh-CN' || lang === 'zh-TW') {
    return yy === '阳'
      ? '偏外向主動，在社交場合中容易成為焦點，喜歡表達自己的觀點和想法。適合擔任領導或組織者角色。'
      : '偏內斂沉穩，心思細膩，善於觀察和傾聽。在社交中更傾向於深度交流而非廣撒網。';
  }
  if (lang === 'en') {
    return yy === '阳'
      ? 'Extroverted and proactive, you naturally become the center of attention in social settings. You enjoy expressing your views and ideas, making you well-suited for leadership or organizer roles.'
      : 'Introverted and thoughtful, with a keen eye for detail. You prefer deep, meaningful conversations over broad social networking.';
  }
  if (lang === 'ja') {
    return yy === '阳'
      ? '外交的で積極的、社交の場で自然と注目を集める。自分の考えを表現するのが得意で、リーダーやオーガナイザーの役割に向いている。'
      : '内向的で落ち着いており、細やかな気配りができる。深い交流を好み、広く浅い付き合いは好まない。';
  }
  if (lang === 'ko') {
    return yy === '阳'
      ? '외향적이고 적극적이며 사교 자리에서 자연스럽게 주목을 받습니다. 자신의 의견을 표현하는 것을 좋아하며 리더나 조직자 역할에 적합합니다.'
      : '내성적이고 침착하며 세심한 관찰과 경청을 잘합니다. 넓고 얕은 관계보다 깊이 있는 교류를 선호합니다.';
  }
  return '';
}

/** 思维模式多语言 */
function getThinkingMode(dg: string, lang: string): string {
  const macroGans = ['甲','丙','庚','壬'];
  const isMacro = macroGans.includes(dg);
  if (lang === 'zh-CN' || lang === 'zh-TW') {
    return isMacro
      ? '思維方式偏宏觀，善於把握大局和方向，對戰略性問題有天生直覺。'
      : '思維方式偏微觀，注重細節和邏輯，喜歡深入分析和研究具體問題。';
  }
  if (lang === 'en') {
    return isMacro
      ? 'Your thinking tends toward the big picture. You have a natural instinct for strategic issues and grasping the overall direction.'
      : 'Your thinking is detail-oriented and logical. You enjoy deep analysis and researching specific problems thoroughly.';
  }
  if (lang === 'ja') {
    return isMacro
      ? '思考はマクロ志向で、大局を把握し方向性を見極めるのが得意。戦略的問題に対して天性の直感を持つ。'
      : '思考はミクロ志向で、細部と論理を重視。具体的な問題を深く分析し研究することを好む。';
  }
  if (lang === 'ko') {
    return isMacro
      ? '사고방식이 거시적이며 큰 그림과 방향을 잡는 데 능숙합니다. 전략적 문제에 천부적인 직감이 있습니다.'
      : '사고방식이 미시적이며 세부사항과 논리를 중시합니다. 구체적인 문제를 깊이 분석하고 연구하는 것을 좋아합니다.';
  }
  return '';
}

/** 注意事项多语言 */
function getWarning(wx: string, lang: string): string {
  if (lang === 'zh-CN' || lang === 'zh-TW') {
    const map: Record<string,string> = {
      '木':'避免固執己見，多聽他人建議。注意肝膽健康，保持情緒穩定。',
      '火':'避免衝動決策，三思而後行。注意心臟保健，避免過度勞累。',
      '土':'避免過於保守，勇於嘗試新事物。注意脾胃調養，保持適度運動。',
      '金':'避免過於剛硬，適當柔和處事。注意肺和呼吸系統保健。',
      '水':'避免優柔寡斷，堅定自己的選擇。注意腎和泌尿系統健康。',
    };
    return map[wx] || '';
  }
  if (lang === 'en') {
    const map: Record<string,string> = {
      '木':'Avoid stubbornness — listen to others\' advice. Pay attention to liver and gallbladder health, keep emotions stable.',
      '火':'Avoid impulsive decisions — think before you act. Take care of your heart and avoid overexertion.',
      '土':'Avoid being too conservative — dare to try new things. Care for your digestion and maintain moderate exercise.',
      '金':'Avoid excessive rigidity — learn to be flexible. Pay attention to lung and respiratory health.',
      '水':'Avoid indecisiveness — stand firm in your choices. Take care of kidney and urinary system health.',
    };
    return map[wx] || '';
  }
  if (lang === 'ja') {
    const map: Record<string,string> = {
      '木':'頑固にならず、他人のアドバイスに耳を傾けて。肝臓・胆のうの健康に注意し、感情を安定させて。',
      '火':'衝動的な決断を避け、よく考えて行動して。心臓のケアを忘れず、過労に注意。',
      '土':'保守的になりすぎず、新しいことに挑戦して。脾胃の養生を心がけ、適度な運動を。',
      '金':'硬くなりすぎず、柔軟に対応して。肺と呼吸器系の健康に注意。',
      '水':'優柔不断を避け、自分の選択を貫いて。腎臓・泌尿器系の健康管理を。',
    };
    return map[wx] || '';
  }
  if (lang === 'ko') {
    const map: Record<string,string> = {
      '木':'고집을 피우지 말고 다른 사람의 조언을 들으세요. 간과 담낭 건강에 주의하고 감정을 안정적으로 유지하세요.',
      '火':'충동적인 결정을 피하고 생각한 후에 행동하세요. 심장 건강에 주의하고 과로하지 마세요.',
      '土':'너무 보수적이지 말고 새로운 것에 도전하세요. 비위 건강을 돌보고 적당한 운동을 유지하세요.',
      '金':'너무 강경하지 말고 부드럽게 대처하세요. 폐와 호흡기 건강에 주의하세요.',
      '水':'우유부단함을 피하고 자신의 선택을 확신하세요. 신장과 비뇨기 건강을 관리하세요.',
    };
    return map[wx] || '';
  }
  return '';
}

/** 职业适配多语言 */
function getCareerText(dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    const map: Record<string,string> = {
      '木':'• 適合行業：教育、出版、文化創意、林業、園藝、醫療健康\n• 角色定位：策劃者、教導者、創作者\n• 職場優勢：有創新思維和成長意識，善於培養和發展團隊',
      '火':'• 適合行業：傳媒娛樂、互聯網、能源、餐飲、美容時尚\n• 角色定位：領導者、發言人、創意總監\n• 職場優勢：熱情感染力強，善於激勵團隊，有前瞻性視野',
      '土':'• 適合行業：房地產、建築、金融、農業、物流倉儲\n• 角色定位：管理者、協調者、執行者\n• 職場優勢：踏實可靠，善於統籌資源，有強大的執行力',
      '金':'• 適合行業：金融投資、法律、軍警、機械製造、珠寶\n• 角色定位：決策者、分析師、改革者\n• 職場優勢：決斷力強，善於處理複雜問題，有原則有底線',
      '水':'• 適合行業：諮詢、科研、貿易物流、旅遊、媒體傳播\n• 角色定位：顧問、研究員、策略師\n• 職場優勢：思維靈活，善於溝通和變通，適應力強',
    };
    return map[dw] || '';
  }
  if (lang === 'en') {
    const map: Record<string,string> = {
      '木':'• Suitable industries: Education, Publishing, Creative Arts, Forestry, Healthcare\n• Role: Planner, Teacher, Creator\n• Strengths: Innovative thinking, growth mindset, great at developing teams',
      '火':'• Suitable industries: Media, Entertainment, Internet, Energy, Fashion\n• Role: Leader, Spokesperson, Creative Director\n• Strengths: Passionate, inspiring, visionary',
      '土':'• Suitable industries: Real Estate, Construction, Finance, Agriculture, Logistics\n• Role: Manager, Coordinator, Executor\n• Strengths: Reliable, resourceful, strong execution',
      '金':'• Suitable industries: Finance, Law, Military, Manufacturing, Jewelry\n• Role: Decision-maker, Analyst, Reformer\n• Strengths: Decisive, excellent at complex problem-solving, principled',
      '水':'• Suitable industries: Consulting, Research, Trade, Tourism, Media\n• Role: Advisor, Researcher, Strategist\n• Strengths: Flexible thinking, great communicator, highly adaptable',
    };
    return map[dw] || '';
  }
  if (lang === 'ja') {
    const map: Record<string,string> = {
      '木':'• 適した業界：教育、出版、文化クリエイティブ、林業、医療健康\n• 役割：プランナー、教育者、クリエイター\n• 強み：革新的思考、成長志向、チーム育成に優れる',
      '火':'• 適した業界：メディア・エンタメ、インターネット、エネルギー、飲食、ファッション\n• 役割：リーダー、広報、クリエイティブディレクター\n• 強み：情熱的、人を鼓舞する、先見性がある',
      '土':'• 適した業界：不動産、建設、金融、農業、物流倉庫\n• 役割：マネージャー、コーディネーター、実行役\n• 強み：安定感、リソース管理能力、実行力が強い',
      '金':'• 適した業界：金融投資、法律、軍警、機械製造、宝飾\n• 役割：決策者、分析者、改革者\n• 強み：決断力、複雑な問題解決能力、原則を守る',
      '水':'• 適した業界：コンサルティング、研究、貿易物流、観光、メディア\n• 役割：アドバイザー、研究員、ストラテジスト\n• 強み：柔軟な思考、コミュニケーション能力、適応力',
    };
    return map[dw] || '';
  }
  if (lang === 'ko') {
    const map: Record<string,string> = {
      '木':'• 추천 업종：교육, 출판, 문화창작, 임업, 의료건강\n• 역할：기획자, 교육자, 창작자\n• 강점：혁신적 사고, 성장 마인드, 팀 육성 능력',
      '火':'• 추천 업종：미디어·엔터테인먼트, 인터넷, 에너지, 외식, 패션\n• 역할：리더, 대변인, 크리에이티브 디렉터\n• 강점：열정적, 팀 동기부여 능력, 선견지명',
      '土':'• 추천 업종：부동산, 건설, 금융, 농업, 물류\n• 역할：관리자, 조정자, 실행자\n• 강점：안정적, 자원 관리 능력, 강한 실행력',
      '金':'• 추천 업종：금융투자, 법률, 군경, 기계제조, 귀금속\n• 역할：의사결정자, 분석가, 개혁자\n• 강점：결단력, 복잡한 문제 해결 능력, 원칙 준수',
      '水':'• 추천 업종：컨설팅, 연구, 무역물류, 관광, 미디어\n• 역할：조언자, 연구원, 전략가\n• 강점：유연한 사고, 커뮤니케이션 능력, 적응력',
    };
    return map[dw] || '';
  }
  return '';
}

/** 贵人方位多语言 */
function getNobleDir(dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    const map: Record<string,string> = { '木':'東方和北方','火':'東方和南方','土':'南方和中央','金':'西方和中央','水':'西方和北方' };
    return `貴人多在${map[dw]}，合作或求職宜朝此方向。`;
  }
  if (lang === 'en') {
    const map: Record<string,string> = { '木':'East and North','火':'East and South','土':'South and Center','金':'West and Center','水':'West and North' };
    return `Your benefactors tend to come from the ${map[dw]} direction — orient your collaborations and job searches accordingly.`;
  }
  if (lang === 'ja') {
    const map: Record<string,string> = { '木':'東と北','火':'東と南','土':'南と中央','金':'西と中央','水':'西と北' };
    return `吉方は${map[dw]}。協力者や仕事の機会を求める際は、この方向を意識すると良い。`;
  }
  if (lang === 'ko') {
    const map: Record<string,string> = { '木':'동쪽과 북쪽','火':'동쪽과 남쪽','土':'남쪽과 중앙','金':'서쪽과 중앙','水':'서쪽과 북쪽' };
    return `귀인은 주로 ${map[dw]} 방향에 있습니다. 협업이나 구직 시 이 방향을 고려하세요.`;
  }
  return '';
}

/** 情感模式多语言 */
function getEmotionMode(dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    const map: Record<string,string> = {
      '木':'對感情認真專一，追求精神層面的契合。表達方式偏含蓄，但內心熾熱。',
      '火':'在感情中熱情主動，喜歡浪漫和儀式感。表達直接，愛恨分明。',
      '土':'感情觀踏實傳統，重視責任和穩定。表達方式樸素，但持久可靠。',
      '金':'對感情有明確標準，不輕易動心。一旦認定則全心全意，但有完美主義傾向。',
      '水':'感情豐富細膩，善解人意。容易產生共鳴，但有時情緒化，需要對方理解。',
    };
    return map[dw] || '';
  }
  if (lang === 'en') {
    const map: Record<string,string> = {
      '木':'Serious and devoted in relationships, seeking spiritual connection. Reserved in expression but passionate at heart.',
      '火':'Passionate and proactive in love, enjoying romance and ceremony. Direct in expression, with clear love and hate.',
      '土':'Traditional and down-to-earth view of relationships, valuing responsibility and stability. Simple in expression but enduring and reliable.',
      '金':'Clear standards in relationships, not easily moved. Once committed, gives wholeheartedly, but tends toward perfectionism.',
      '水':'Rich and delicate in emotions, empathetic. Easily resonates with others, but sometimes emotional, needing understanding from partners.',
    };
    return map[dw] || '';
  }
  if (lang === 'ja') {
    const map: Record<string,string> = {
      '木':'恋愛には真剣で一途、精神的なつながりを求める。表現は控えめだが、内面は熱い。',
      '火':'恋愛では情熱的で積極的、ロマンスや儀式を好む。ストレートな表現で、愛憎がはっきりしている。',
      '土':'恋愛観は堅実で伝統的、責任と安定を重視。表現は素朴だが、持続的で信頼できる。',
      '金':'恋愛に明確な基準を持ち、簡単に心を開かない。一度決めたら全力だが、完璧主義の傾向あり。',
      '水':'感情豊かで繊細、思いやりがある。共感しやすいが、時に感情的になるため、相手の理解が必要。',
    };
    return map[dw] || '';
  }
  if (lang === 'ko') {
    const map: Record<string,string> = {
      '木':'연애에 진지하고 한결같으며 정신적 교감을 추구합니다. 표현은 다소 내성적이지만 내면은 뜨겁습니다.',
      '火':'연애에서 열정적이고 적극적이며 로맨스와 의식을 좋아합니다. 직설적이며 사랑과 미움이 분명합니다.',
      '土':'연애관이 전통적이고 성실하며 책임감과 안정을 중시합니다. 표현은 소박하지만 지속적이고 신뢰할 수 있습니다.',
      '金':'연애에 명확한 기준이 있으며 쉽게 마음을 열지 않습니다. 한번 결정하면 전력을 다하지만 완벽주의 성향이 있습니다.',
      '水':'감정이 풍부하고 섬세하며 이해심이 많습니다. 공감을 잘하지만 때로는 감정적이 되어 상대방의 이해가 필요합니다.',
    };
    return map[dw] || '';
  }
  return '';
}

/** 婚配建议多语言 */
function getMarriageAdvice(z: string, dw: string, zodiac: string, lang: string): string {
  const zCompatible: Record<string,string> = {
    '子':'牛、龙、猴','丑':'鼠、蛇、鸡','寅':'马、狗、猪','卯':'羊、狗、猪',
    '辰':'鼠、猴、鸡','巳':'牛、鸡','午':'虎、羊、狗','未':'兔、马、猪',
    '申':'鼠、龙','酉':'牛、龙、蛇','戌':'虎、兔、马','亥':'兔、羊'
  };
  const wxCompatible: Record<string,string> = {
    '木':'水（生我）、火（我生）','火':'木（生我）、土（我生）',
    '土':'火（生我）、金（我生）','金':'土（生我）、水（我生）','水':'金（生我）、木（我生）'
  };
  const compatible = zCompatible[z] || '';
  const wxMatch = wxCompatible[dw] || '';
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) return `生肖屬${zodiac}，與${compatible}最為投緣。\n五行中，${dw}與${wxMatch}屬性的人最為和諧。`;
  if (lang === 'en') return `Your Chinese zodiac is ${ZODIAC_EN[z] || zodiac}. You are most compatible with: ${compatible}.\nIn the Five Elements, your ${WX_EN[dw]} element harmonizes best with ${wxMatch}.`;
  if (lang === 'ja') return `あなたの十二支は${ZODIAC_JA[z] || zodiac}。相性の良いのは${compatible}。\n五行では、${WX_JA[dw]}は${wxMatch}の人と最も調和します。`;
  if (lang === 'ko') return `당신의 띠는 ${ZODIAC_KO[z] || zodiac}입니다. 궁합이 좋은 띠: ${compatible}。\n오행에서는 ${WX_KO[dw]}이(가) ${wxMatch} 속성의 사람과 가장 조화롭습니다.`;
  return '';
}

/** 婚姻建议多语言 */
function getMarriageSuggestion(yy: string, dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    if (yy === '阳' && dw === '金') return '宜晚婚（30岁后），等待心智成熟';
    if (yy === '阴' && dw === '水') return '宜早定（28岁左右），感情稳定后发展更好';
    return '顺其自然，无需刻意，缘分自来';
  }
  if (lang === 'en') {
    if (yy === '阳' && dw === '金') return 'Late marriage recommended (after 30) — wait for emotional maturity.';
    if (yy === '阴' && dw === '水') return 'Early commitment recommended (around 28) — build stability first.';
    return 'Let love come naturally — don\'t force it. Fate will find its way.';
  }
  if (lang === 'ja') {
    if (yy === '阳' && dw === '金') return '晩婚推奨（30歳以降）— 心の成熟を待つこと。';
    if (yy === '阴' && dw === '水') return '早めの安定（28歳前後）が吉。感情の安定がさらなる発展を招く。';
    return '自然に任せて—無理に探さずとも良縁は訪れる。';
  }
  if (lang === 'ko') {
    if (yy === '阳' && dw === '金') return '만혼 권장 (30세 이후) — 정신적 성숙을 기다리세요.';
    if (yy === '阴' && dw === '水') return '일찍 정하는 것이 좋음 (28세 전후) — 안정된 연애가 더 나은 발전을 이끕니다.';
    return '자연스럽게 두세요 — 억지로 찾지 않아도 인연은 찾아옵니다.';
  }
  return '';
}

/** 健康分析多语言 */
function getHealthFocusText(dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    const map: Record<string,string> = {
      '木':'🟡 肝膽系統、筋骨、視力\n• 養生建議：少飲酒、規律作息、多吃綠色蔬菜\n• 運動推薦：瑜伽、太極、散步\n• 季節注意：春季肝氣旺盛，注意情緒管理',
      '火':'🟡 心血管系統、小腸、面部\n• 養生建議：保持心態平和、避免暴怒、飲食清淡\n• 運動推薦：游泳、慢跑、冥想\n• 季節注意：夏季心火旺盛，多補充水分',
      '土':'🟡 脾胃系統、肌肉、口腔\n• 養生建議：定時定量進食、細嚼慢嚥、少吃生冷\n• 運動推薦：散步、登山、太極拳\n• 季節注意：長夏濕氣重，注意健脾祛濕',
      '金':'🟡 呼吸系統、大腸、皮膚\n• 養生建議：注意保暖、遠離煙塵、多呼吸新鮮空氣\n• 運動推薦：深呼吸練習、跑步、騎行\n• 季節注意：秋季乾燥，注意潤肺保濕',
      '水':'🟡 腎與泌尿系統、骨骼、聽力\n• 養生建議：足部保暖、節制房事、多喝溫水\n• 運動推薦：慢走、打坐、靜功\n• 季節注意：冬季宜養藏，減少劇烈運動',
    };
    return map[dw] || '';
  }
  if (lang === 'en') {
    const map: Record<string,string> = {
      '木':'🟡 Liver, Gallbladder, Muscles, Eyesight\n• Care: Limit alcohol, keep regular hours, eat green vegetables\n• Exercise: Yoga, Tai Chi, Walking\n• Seasonal: Spring — liver energy peaks, manage emotions',
      '火':'🟡 Cardiovascular, Small Intestine, Face\n• Care: Stay calm, avoid anger, light diet\n• Exercise: Swimming, Jogging, Meditation\n• Seasonal: Summer — heart fire strong, hydrate well',
      '土':'🟡 Digestive System, Muscles, Mouth\n• Care: Regular meals, chew slowly, avoid raw/cold food\n• Exercise: Walking, Hiking, Tai Chi\n• Seasonal: Late summer — damp, focus on digestion',
      '金':'🟡 Respiratory, Large Intestine, Skin\n• Care: Keep warm, avoid smoke/dust, fresh air\n• Exercise: Deep breathing, Running, Cycling\n• Seasonal: Autumn — dry, moisturize lungs',
      '水':'🟡 Kidneys, Urinary System, Bones, Hearing\n• Care: Keep feet warm, moderate lifestyle, warm water\n• Exercise: Slow walking, Meditation, Qigong\n• Seasonal: Winter — preserve energy, avoid intense exercise',
    };
    return map[dw] || '';
  }
  if (lang === 'ja') {
    const map: Record<string,string> = {
      '木':'🟡 肝臓・胆のう、筋骨、視力\n• 養生：節酒、規則正しい生活、緑黄色野菜\n• 運動：ヨガ、太極拳、散歩\n• 季節：春は肝気が盛ん—感情のコントロールを',
      '火':'🟡 心臓・血管、小腸、顔面\n• 養生：心を穏やかに、怒りを避け、薄味の食事\n• 運動：水泳、ジョギング、瞑想\n• 季節：夏は心火が強い—十分な水分補給を',
      '土':'🟡 脾臓・胃、筋肉、口\n• 養生：規則正しい食事、よく噛む、生冷食を避ける\n• 運動：散歩、登山、太極拳\n• 季節：長夏は湿気—健脾祛湿を心がけて',
      '金':'🟡 呼吸器、大腸、皮膚\n• 養生：保温、煙塵を避け、新鮮な空気を\n• 運動：深呼吸、ランニング、サイクリング\n• 季節：秋は乾燥—肺を潤すケアを',
      '水':'🟡 腎臓・泌尿器、骨格、聴力\n• 養生：足元の保温、節度ある生活、ぬるま湯\n• 運動：ゆっくり歩き、座禅、静功\n• 季節：冬は蔵の時—激しい運動を控えて',
    };
    return map[dw] || '';
  }
  if (lang === 'ko') {
    const map: Record<string,string> = {
      '木':'🟡 간·담낭, 근골, 시력\n• 관리: 금주, 규칙적 생활, 녹색 채소 섭취\n• 운동: 요가, 태극권, 산책\n• 계절: 봄 간기 왕성—감정 관리 중요',
      '火':'🟡 심혈관, 소장, 안면\n• 관리: 마음의 평화 유지, 분노 피하기, 담백한 식사\n• 운동: 수영, 조깅, 명상\n• 계절: 여름 심화 왕성—수분 보충 충분히',
      '土':'🟡 비위, 근육, 구강\n• 관리: 규칙적 식사, 천천히 씹기, 날것·찬 음식 피하기\n• 운동: 산책, 등산, 태극권\n• 계절: 장하 습기—비위 건강에 주의',
      '金':'🟡 호흡기, 대장, 피부\n• 관리: 보온, 먼지·연기 피하기, 신선한 공기 마시기\n• 운동: 심호흡, 달리기, 자전거\n• 계절: 가을 건조—폐 보습에 신경 쓰기',
      '水':'🟡 신장·비뇨기, 골격, 청력\n• 관리: 발 보온, 절제된 생활, 미지근한 물 마시기\n• 운동: 느린 걷기, 명상, 정좌\n• 계절: 겨울 저장—격렬한 운동 자제',
    };
    return map[dw] || '';
  }
  return '';
}

/** 饮食调养多语言 */
function getDietAdvice(dw: string, lang: string): { good: string; avoid: string } {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  const goodMap: Record<string, Record<string, string>> = {
    '木':{'zh-CN':'綠色蔬果、酸味食物、豆製品','en':'Green vegetables, sour foods, soy products','ja':'緑黄色野菜、酸味のある食品、豆製品','ko':'녹색 채소·과일, 신 음식, 두부·콩제품'},
    '火':{'zh-CN':'紅色食物、苦味食材、水果','en':'Red foods, bitter foods, fruits','ja':'赤い食品、苦味食材、果物','ko':'붉은 색 음식, 쓴맛 재료, 과일'},
    '土':{'zh-CN':'黃色食物、甘味食材、穀物','en':'Yellow foods, sweet foods, grains','ja':'黄色い食品、甘味食材、穀物','ko':'노란색 음식, 단맛 재료, 곡물'},
    '金':{'zh-CN':'白色食物、辛辣食材、果蔬','en':'White foods, pungent foods, fruits & vegetables','ja':'白い食品、辛味食材、果物野菜','ko':'흰색 음식, 매운 재료, 과일·채소'},
    '水':{'zh-CN':'黑色食物、鹹味食材、海產','en':'Black foods, salty foods, seafood','ja':'黒い食品、塩味食材、海産物','ko':'검은색 음식, 짠맛 재료, 해산물'},
  };
  const avoidMap: Record<string, Record<string, string>> = {
    '木':{'zh-CN':'過於辛辣刺激、油炸食品','en':'Excessively spicy, deep-fried foods','ja':'刺激の強い辛いもの、揚げ物','ko':'지나치게 맵고 자극적인 음식, 튀김'},
    '火':{'zh-CN':'過於鹹膩、高熱量加工食品','en':'Overly salty, high-calorie processed foods','ja':'塩辛いもの、高カロリー加工食品','ko':'짜고 느끼한 음식, 고칼로리 가공식품'},
    '土':{'zh-CN':'過於甜膩、生冷食品','en':'Overly sweet, raw or cold foods','ja':'甘すぎるもの、生冷食品','ko':'달고 느끼한 음식, 날것·찬 음식'},
    '金':{'zh-CN':'過於苦寒、燒烤煎炸食品','en':'Overly bitter/cold foods, grilled & fried','ja':'苦くて冷たいもの、焼き物・揚げ物','ko':'쓰고 찬 음식, 구이·튀김'},
    '水':{'zh-CN':'過於甘甜、冰鎮冷飲','en':'Overly sweet foods, ice-cold drinks','ja':'甘すぎるもの、冷たい飲み物','ko':'달고 단 음식, 얼음 냉음료'},
  };
  const g = goodMap[dw] || { 'zh-CN':'均衡飲食','en':'Balanced diet','ja':'バランスの良い食事','ko':'균형 잡힌 식사' };
  const a = avoidMap[dw] || { 'zh-CN':'注意飲食均衡','en':'Watch your diet','ja':'食事のバランスに注意','ko':'식습관에 주의' };
  return { good: g[lang] || g['en'] || g['zh-CN'] || '', avoid: a[lang] || a['en'] || a['zh-CN'] || '' };
}

/** 作息建议多语言 */
function getRestAdvice(dw: string, lang: string): string {
  const isCN = lang === 'zh-CN' || lang === 'zh-TW';
  if (isCN) {
    const active = '宜早起（6-7點），陽氣生發時活動最佳。';
    const calm = '宜適當晚起（7-8點），養精蓄銳。';
    return (dw === '木' || dw === '火') ? active + '晚上11點前入睡，保證充足睡眠。' : calm + '晚上11點前入睡，保證充足睡眠。';
  }
  if (lang === 'en') {
    return (dw === '木' || dw === '火')
      ? 'Rise early (6-7 AM) to harness the morning energy. Sleep before 11 PM for sufficient rest.'
      : 'Rise a bit later (7-8 AM) to conserve energy. Sleep before 11 PM for adequate rest.';
  }
  if (lang === 'ja') {
    return (dw === '木' || dw === '火')
      ? '早起き（6-7時）が吉。朝の陽気を活用しよう。夜11時までに就寝。'
      : 'やや遅めの起床（7-8時）が良い。エネルギーを蓄えて。夜11時までに就寝。';
  }
  if (lang === 'ko') {
    return (dw === '木' || dw === '火')
      ? '일찍 일어나세요 (6-7시) — 아침 양기를 활용합니다. 밤 11시 전에 취침하세요.'
      : '약간 늦게 일어나세요 (7-8시) — 에너지를 보존합니다. 밤 11시 전에 취침하세요.';
  }
  return '';
}

function yearGanZhi(year: number): { gan: string; zhi: string; wzGan: string; wzZhi: string } {
  const base = year - 4;
  const g = T_GAN[base % 10];
  const z = T_ZHI[base % 12];
  return { gan: g, zhi: z, wzGan: (WU_XING as Record<string,string>)[g], wzZhi: (ZHI_WX as Record<string,string>)[z] };
}

function monthGanZhi(yearGan: string, month: number): { gan: string; zhi: string } {
  const base = T_GAN.indexOf(yearGan);
  const mGan = T_GAN[(base * 2 + month) % 10];
  const mZhi = T_ZHI[(month + 1) % 12]; // 寅 = month 1
  return { gan: mGan, zhi: mZhi };
}

function dayGanZhiDoomsday(year: number, month: number, day: number): { gan: string; zhi: string } {
  const y = year % 100;
  const anchor = (y + Math.floor(y / 4) + 2) % 7;
  const doomsdays = [0, 31, 28, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12, 11]; // 0=jan, 13=dec
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const janDoom = isLeap ? 4 : 3;
  const febDoom = isLeap ? 29 : 28;
  if (month === 1) { const diff = day - janDoom; return ganZhiFromOffset(anchor + diff); }
  if (month === 2) { const diff = day - febDoom; return ganZhiFromOffset(anchor + diff); }
  const diff = day - doomsdays[month];
  return ganZhiFromOffset(anchor + diff);
}

function ganZhiFromOffset(offset: number): { gan: string; zhi: string } {
  let o = offset;
  while (o < 0) o += 60;
  o = o % 60;
  return { gan: T_GAN[o % 10], zhi: T_ZHI[o % 12] };
}

function getYearName(year: number): string {
  const yz = yearGanZhi(year);
  return `${yz.gan}${yz.zhi}年`;
}

function getMonthName(year: number, month: number): string {
  const yz = yearGanZhi(year);
  const mz = monthGanZhi(yz.gan, month);
  return `${mz.gan}${mz.zhi}月`;
}

function getDayName(year: number, month: number, day: number): string {
  const dz = dayGanZhiDoomsday(year, month, day);
  return `${dz.gan}${dz.zhi}日`;
}

interface AnalysisData {
  name: string;
  module: string;
  year: number;
  month: number;
  day: number;
}

function extractData(d?: unknown): AnalysisData {
  if (d && typeof d === 'object') {
    const r = d as Record<string,unknown>;
    return {
      name: (r.name as string) || '',
      module: (r.module as string) || 'bazi',
      year: (r.year as number) || 1990,
      month: (r.month as number) || 1,
      day: (r.day as number) || 1,
    };
  }
  return { name: '', module: 'bazi', year: 1990, month: 1, day: 1 };
}

function fiveElementSummary(data: AnalysisData): { cn: string; en: string; ja: string; ko: string } {
  const yz = yearGanZhi(data.year);
  const dz = dayGanZhiDoomsday(data.year, data.month, data.day);
  const elements: Record<string,number> = { '木':0, '火':0, '土':0, '金':0, '水':0 };
  const inc = (e: string) => { elements[e] = (elements[e] || 0) + 1; };
  inc(yz.wzGan);
  inc(yz.wzZhi);
  inc((WU_XING as Record<string,string>)[dz.gan]);
  inc((ZHI_WX as Record<string,string>)[dz.zhi]);
  const entries = Object.entries(elements).sort((a,b) => b[1] - a[1]);
  const max = entries[0];
  const min = entries[entries.length - 1];
  const surplusCN = max[1] >= 3 ? `五行偏${max[0]}较重` : '五行较为均衡';
  const surplusEN = max[1] >= 3 ? `Excess ${WX_EN[max[0]]} element` : 'Relatively balanced Five Elements';
  const surplusJA = max[1] >= 3 ? `${WX_JA[max[0]]}が偏って強い` : '五行は比較的バランスが良い';
  const surplusKO = max[1] >= 3 ? `${WX_KO[max[0]]}이(가) 치우쳐 강함` : '오행이 비교적 균형 잡힘';
  const deficientCN = min[1] <= 0 ? `，${min[0]}气不足` : '';
  const deficientEN = min[1] <= 0 ? `, lacking ${WX_EN[min[0]]} element` : '';
  const deficientJA = min[1] <= 0 ? `、${WX_JA[min[0]]}が不足` : '';
  const deficientKO = min[1] <= 0 ? `, ${WX_KO[min[0]]} 부족` : '';
  return {
    cn: surplusCN + deficientCN,
    en: surplusEN + deficientEN,
    ja: surplusJA + deficientJA,
    ko: surplusKO + deficientKO,
  };
}

// ── Dimensions ──

export const analysisDimensions: AnalysisDimension[] = [
  // ═══ FREE (5) ═══
  {
    key:'overallReading', label:'整体解读', icon:'🔮',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const yz = yearGanZhi(d.year);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dayWx = (WU_XING as Record<string,string>)[dz.gan];
      const wxTraits = WX_TRAITS[dayWx]?.[lang || 'zh-CN'] || WX_TRAITS[dayWx]?.['zh-CN'] || '';
      const healthFocus = HEALTH_FOCUS[dayWx]?.[lang || 'zh-CN'] || HEALTH_FOCUS[dayWx]?.['zh-CN'] || '';
      const patternKey = yz.wzGan + yz.wzZhi;
      const pattern = PATTERN_LANG[patternKey]?.[lang || 'zh-CN'] || DEFAULT_PATTERN_LANG[lang || 'zh-CN'] || DEFAULT_PATTERN_LANG['zh-CN'];
      const fe = fiveElementSummary(d);
      const wxSummary = (lang === 'en') ? fe.en : (lang === 'ja') ? fe.ja : (lang === 'ko') ? fe.ko : fe.cn;

      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;
      if (isCN) {
        const greeting = d.name ? `${d.name}，您好。` : '';
        return `${greeting}您出生于${getYearName(d.year)}${getMonthName(d.year, d.month)}${getDayName(d.year, d.month, d.day)}。

📜 **命盘概述**
年柱：${yz.gan}${yz.zhi}（${yz.wzGan}${yz.wzZhi}），日主：${dz.gan}（${dayWx}）。

${wxSummary}。日主${dz.gan}属${dayWx}，${(GAN_YINYANG as Record<string,string>)[dz.gan]}性。年干${yz.gan}为${(WU_XING as Record<string,string>)[yz.gan]}，与日主形成${dayWx === yz.wzGan ? '比和' : dayWx === '木' && yz.wzGan === '水' || dayWx === '火' && yz.wzGan === '木' || dayWx === '土' && yz.wzGan === '火' || dayWx === '金' && yz.wzGan === '土' || dayWx === '水' && yz.wzGan === '金' ? '相生（吉）' : '相克'}的关系。

命中${dayWx}为根基，宜顺势而为。性格中带有${wxTraits}的特质。一生需注意${healthFocus}。

综合来看，您的人生格局呈现${pattern}的趋势，宜关注自身的优势发挥与短处补益。`;
      }
      if (lang === 'en') {
        const greeting = d.name ? `Hello ${d.name}.` : '';
        const relation = dayWx === yz.wzGan ? 'mutual reinforcement' : 
          dayWx === '木' && yz.wzGan === '水' || dayWx === '火' && yz.wzGan === '木' || dayWx === '土' && yz.wzGan === '火' || dayWx === '金' && yz.wzGan === '土' || dayWx === '水' && yz.wzGan === '金' ? 'nourishing (auspicious)' : 'restraining';
        return `${greeting}You were born in the year of ${getYearName(d.year)}${getMonthName(d.year, d.month)}${getDayName(d.year, d.month, d.day)}.

📜 **Chart Overview**
Year Pillar: ${yz.gan}${yz.zhi} (${WX_EN[yz.wzGan] || yz.wzGan} ${WX_EN[yz.wzZhi] || yz.wzZhi}), Day Master: ${dz.gan} (${WX_EN[dayWx] || dayWx}).

${wxSummary}. Your Day Master ${dz.gan} belongs to ${WX_EN[dayWx] || dayWx}, ${YY_EN[(GAN_YINYANG as Record<string,string>)[dz.gan]] || ''} in nature. The Year Stem ${yz.gan} (${WX_EN[(WU_XING as Record<string,string>)[yz.gan]] || ''}) forms a ${relation} relationship with your Day Master.

With ${WX_EN[dayWx] || dayWx} as your foundation, go with its flow. Your personality exhibits ${wxTraits}. Pay attention to ${healthFocus}.

Overall, your life pattern shows a ${pattern} tendency. Focus on leveraging your strengths while supplementing your weaknesses.`;
      }
      if (lang === 'ja') {
        const greeting = d.name ? `${d.name}様、こんにちは。` : '';
        const relation = dayWx === yz.wzGan ? '比和（相互補完）' : 
          dayWx === '木' && yz.wzGan === '水' || dayWx === '火' && yz.wzGan === '木' || dayWx === '土' && yz.wzGan === '火' || dayWx === '金' && yz.wzGan === '土' || dayWx === '水' && yz.wzGan === '金' ? '相生（吉）' : '相克';
        return `${greeting}あなたは${getYearName(d.year)}${getMonthName(d.year, d.month)}${getDayName(d.year, d.month, d.day)}に生まれました。

📜 **命盤概要**
年柱：${yz.gan}${yz.zhi}（${WX_JA[yz.wzGan] || yz.wzGan}${WX_JA[yz.wzZhi] || yz.wzZhi}）、日主：${dz.gan}（${WX_JA[dayWx] || dayWx}）。

${wxSummary}。日主${dz.gan}は${WX_JA[dayWx] || dayWx}、${YY_JA[(GAN_YINYANG as Record<string,string>)[dz.gan]] || ''}性。年干${yz.gan}（${WX_JA[(WU_XING as Record<string,string>)[yz.gan]] || ''}）と日主は${relation}の関係。

${WX_JA[dayWx] || dayWx}を根基とし、その流れに沿うのが吉。性格には${wxTraits}の特質があります。一生を通じて${healthFocus}に注意が必要です。

総合的に、あなたの人生格局は${pattern}の傾向を示しています。自身の長所を活かし、短所を補うことを心がけましょう。`;
      }
      if (lang === 'ko') {
        const greeting = d.name ? `${d.name}님, 안녕하세요.` : '';
        const relation = dayWx === yz.wzGan ? '비화(상호 보완)' : 
          dayWx === '木' && yz.wzGan === '水' || dayWx === '火' && yz.wzGan === '木' || dayWx === '土' && yz.wzGan === '火' || dayWx === '金' && yz.wzGan === '土' || dayWx === '水' && yz.wzGan === '金' ? '상생(길)' : '상극';
        return `${greeting}귀하는 ${getYearName(d.year)}${getMonthName(d.year, d.month)}${getDayName(d.year, d.month, d.day)}에 태어났습니다.

📜 **명반 개요**
년주：${yz.gan}${yz.zhi}（${WX_KO[yz.wzGan] || yz.wzGan}${WX_KO[yz.wzZhi] || yz.wzZhi}）、일주：${dz.gan}（${WX_KO[dayWx] || dayWx}）。

${wxSummary}。일주 ${dz.gan}은 ${WX_KO[dayWx] || dayWx}에 속하며 ${YY_KO[(GAN_YINYANG as Record<string,string>)[dz.gan]] || ''}성입니다. 연간 ${yz.gan}（${WX_KO[(WU_XING as Record<string,string>)[yz.gan]] || ''}）과 일주는 ${relation} 관계를 이룹니다.

${WX_KO[dayWx] || dayWx}을 근간으로 삼아 그 흐름을 따르는 것이 좋습니다. 성격에는 ${wxTraits} 특성이 있습니다. 평생 ${healthFocus}에 주의가 필요합니다.

종합적으로, 인생 패턴은 ${pattern} 경향을 보입니다. 자신의 장점을 활용하고 단점을 보완하는 데 주력하세요.`;
      }
      return '';
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'personality', label:'性格分析', icon:'🧠',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}的` : '您的';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      if (isCN) {
        return `${greeting}日主为${dz.gan}（${dw}·${yy}），以下是性格深度剖析：

🧬 **核心性格**
• ${getPersonalityDetailed(dw, yy, 'zh-CN')}

🎭 **人际交往**
${getSocialMode(yy, 'zh-CN')}

💡 **思维模式**
${getThinkingMode(dz.gan, 'zh-CN')}

⚠️ **需注意**
${getWarning(dw, 'zh-CN')}`;
      }
      if (lang === 'en') {
        return `${greeting}Day Master is ${dz.gan} (${WX_EN[dw] || dw} · ${YY_EN[yy] || yy}). Here is an in-depth personality analysis:

🧬 **Core Personality**
• ${getPersonalityDetailed(dw, yy, 'en')}

🎭 **Social Style**
${getSocialMode(yy, 'en')}

💡 **Thinking Pattern**
${getThinkingMode(dz.gan, 'en')}

⚠️ **Points to Note**
${getWarning(dw, 'en')}`;
      }
      if (lang === 'ja') {
        return `${greeting}日主は${dz.gan}（${WX_JA[dw] || dw}·${YY_JA[yy] || yy}）。性格の深層分析：

🧬 **核心性格**
• ${getPersonalityDetailed(dw, yy, 'ja')}

🎭 **対人関係**
${getSocialMode(yy, 'ja')}

💡 **思考パターン**
${getThinkingMode(dz.gan, 'ja')}

⚠️ **注意点**
${getWarning(dw, 'ja')}`;
      }
      if (lang === 'ko') {
        return `${greeting}일주는 ${dz.gan}（${WX_KO[dw] || dw}·${YY_KO[yy] || yy}）。성격 심층 분석：

🧬 **핵심 성격**
• ${getPersonalityDetailed(dw, yy, 'ko')}

🎭 **대인 관계**
${getSocialMode(yy, 'ko')}

💡 **사고 패턴**
${getThinkingMode(dz.gan, 'ko')}

⚠️ **주의사항**
${getWarning(dw, 'ko')}`;
      }
      return '';
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'career', label:'事业运势', icon:'💼',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const greeting = d.name ? `${d.name}，` : '';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      const langCode = isCN ? 'zh-CN' : (lang || 'en');
      const careerText = getCareerText(dw, langCode);
      const nobleDir = getNobleDir(dw, langCode);

      if (isCN) {
        const base = `${greeting}基于您日主${dz.gan}（${dw}）的能量属性，为您解析事业方向：

📊 **职业适配**
${careerText}

🚀 **发展建议**
• 30岁前：打好基础，多积累行业经验和人脉资源
• 30-45岁：事业上升期，宜主动争取机会，展示能力
• 45岁后：进入成熟期，宜转向管理与传承角色

💎 **贵人方位**
生于${getYearName(d.year)}，五行属${(ZHI_WX as Record<string,string>)[yearGanZhi(d.year).zhi]}，${nobleDir}`;
        return base;
      }
      if (lang === 'en') {
        return `${greeting}Based on the energy of your Day Master ${dz.gan} (${WX_EN[dw] || dw}):

📊 **Career Fit**
${careerText}

🚀 **Development Advice**
• Before 30: Build a solid foundation and professional network.
• 30-45: Growth phase — actively seek opportunities.
• After 45: Maturity phase — transition to management/mentorship.

💎 **Benefactor Direction**
Born in ${getYearName(d.year)}, element ${WX_EN[(ZHI_WX as Record<string,string>)[yearGanZhi(d.year).zhi]] || ''}. ${nobleDir}`;
      }
      if (lang === 'ja') {
        return `${greeting}日主${dz.gan}（${WX_JA[dw] || dw}）のエネルギー属性に基づく事業分析：

📊 **適職**
${careerText}

🚀 **成長アドバイス**
• 30歳まで：基礎を固め、経験と人脈を蓄える時期。
• 30-45歳：上昇期—積極的に機会を掴み、能力を示すこと。
• 45歳以降：成熟期—管理職や後進育成へシフト。

💎 **吉方位**
${getYearName(d.year)}生まれ、五行は${WX_JA[(ZHI_WX as Record<string,string>)[yearGanZhi(d.year).zhi]] || ''}。${nobleDir}`;
      }
      if (lang === 'ko') {
        return `${greeting}일주 ${dz.gan}（${WX_KO[dw] || dw}）의 에너지 속성에 기반한 직업 분석：

📊 **직업 적합도**
${careerText}

🚀 **발전 조언**
• 30세 이전：기초를 다지고 경험과 인맥을 쌓을 시기.
• 30-45세：성장기—적극적으로 기회를 잡고 능력을 발휘하세요.
• 45세 이후：성숙기—관리 및 후배 양성 역할로 전환.

💎 **귀인 방향**
${getYearName(d.year)} 출생, 오행 ${WX_KO[(ZHI_WX as Record<string,string>)[yearGanZhi(d.year).zhi]] || ''}。${nobleDir}`;
      }
      return '';
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'relationship', label:'情感关系', icon:'💕',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const dzZhi = (ZHI_WX as Record<string,string>)[dz.zhi];
      const z = dz.zhi;
      const zodiac = ZHI_ZODIAC[z];
      const greeting = d.name ? `${d.name}，` : '';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      const emotionMode = getEmotionMode(dw, lang || 'zh-CN');
      const marriageAdvice = getMarriageAdvice(z, dw, zodiac, lang || 'zh-CN');
      const marriageSuggestion = getMarriageSuggestion(yy, dw, lang || 'zh-CN');

      if (isCN) {
        return `${greeting}基于日主${dz.gan}（${dw}）及日支${z}（${dzZhi}），解析您的情感特质：

💝 **情感模式**
${emotionMode}

🔗 **配对建议**
${marriageAdvice}

💍 **婚姻建议**
${marriageSuggestion}。`;
      }
      return `${greeting}Based on Day Master ${dz.gan} (${WX_EN[dw] || dw}) and Earthly Branch ${z} (${WX_EN[dzZhi] || dzZhi}):

💝 **Emotional Patterns**
${emotionMode}

🔗 **Compatibility Guide**
${marriageAdvice}

💍 **Marriage Advice**
${marriageSuggestion}.`;
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'health', label:'健康分析', icon:'💪',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}，` : '';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      const healthText = getHealthFocusText(dw, lang || 'zh-CN');
      const diet = getDietAdvice(dw, lang || 'zh-CN');
      const rest = getRestAdvice(dw, lang || 'zh-CN');

      if (isCN) {
        return `${greeting}日主${dz.gan}属${dw}，以下是健康养生分析：

🏥 **重点关注系统**
${healthText}

🥗 **饮食调养**
• 宜多食：${diet.good}
• 宜少食：${diet.avoid}

⏰ **作息建议**
${rest}`;
      }
      if (lang === 'en') {
        return `${greeting}Your Day Master ${dz.gan} belongs to ${WX_EN[dw] || dw}. Health analysis:

🏥 **Key Areas**
${healthText}

🥗 **Diet**
• Eat more: ${diet.good}
• Eat less: ${diet.avoid}

⏰ **Daily Rhythm**
${rest}`;
      }
      if (lang === 'ja') {
        return `${greeting}日主${dz.gan}は${WX_JA[dw] || dw}。健康養生分析：

🏥 **重点管理系統**
${healthText}

🥗 **食事養生**
• 積極的に摂る：${diet.good}
• 控えめに：${diet.avoid}

⏰ **生活リズム**
${rest}`;
      }
      if (lang === 'ko') {
        return `${greeting}일주 ${dz.gan}은 ${WX_KO[dw] || dw}。건강 분석：

🏥 **중점 관리 부위**
${healthText}

🥗 **식이 요법**
• 많이 먹을 것：${diet.good}
• 적게 먹을 것：${diet.avoid}

⏰ **생활 리듬**
${rest}`;
      }
      return '';
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },

  // 全量开放（待接入支付系统后设为 free:false）
  {
    key:'wealthFortune', label:'财富格局', icon:'💰',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const greeting = d.name ? `${d.name}，` : '';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      // Wealth descriptions per element
      const wealthCn: Record<string,string> = {
        '木':'正财属土，偏财亦属土。命中财星状况需结合整体八字，但木命之人以土为财，财源与地产、建筑、农业相关。宜稳健积累，不宜投机。',
        '火':'正财属金，偏财亦属金。火命人以金为财，财源与金融、贵金属、精密制造相关。宜发挥自身光芒吸引财富。',
        '土':'正财属水，偏财亦属水。土命人以水为财，财源与贸易、物流、信息相关。宜以诚信和稳定赢得财富。',
        '金':'正财属木，偏财亦属木。金命人以木为财，财源与文化、教育、环保相关。宜以专业技能创造价值。',
        '水':'正财属火，偏财亦属火。水命人以火为财，财源与能源、娱乐、互联网相关。宜以智慧和灵活性获取财富。',
      };
      const wealthEn: Record<string,string> = {
        '木':'Primary wealth belongs to Earth. Wood-type people attract wealth through real estate, construction, agriculture. Steady accumulation — avoid speculation.',
        '火':'Primary wealth belongs to Metal. Fire-type people attract wealth through finance, precious metals, precision manufacturing. Let your radiance draw wealth.',
        '土':'Primary wealth belongs to Water. Earth-type people attract wealth through trade, logistics, information. Gain wealth through integrity and stability.',
        '金':'Primary wealth belongs to Wood. Metal-type people attract wealth through culture, education, environmental sectors. Create value through expertise.',
        '水':'Primary wealth belongs to Fire. Water-type people attract wealth through energy, entertainment, internet. Use wisdom and adaptability.',
      };
      const wealthJa: Record<string,string> = {
        '木':'正財は土。木命の人は不動産、建設、農業で財を成す。安定した蓄積が吉—投機は避ける。',
        '火':'正財は金。火命の人は金融、貴金属、精密製造で財を成す。自身の輝きで富を引き寄せる。',
        '土':'正財は水。土命の人は貿易、物流、情報で財を成す。誠実さと安定で富を得る。',
        '金':'正財は木。金命の人は文化、教育、環境分野で財を成す。専門性で価値を創造。',
        '水':'正財は火。水命の人はエネルギー、エンタメ、インターネットで財を成す。知恵と柔軟性を活用。',
      };
      const wealthKo: Record<string,string> = {
        '木':'정재는 토(土)에 속합니다. 목명의 사람은 부동산, 건설, 농업으로 재물을 이룹니다. 안정적 축적이 좋고 투기는 피하세요.',
        '火':'정재는 금(金)에 속합니다. 화명의 사람은 금융, 귀금속, 정밀제조로 재물을 이룹니다. 자신의 빛으로 부를 끌어들이세요.',
        '土':'정재는 수(水)에 속합니다. 토명의 사람은 무역, 물류, 정보로 재물을 이룹니다. 성실함과 안정으로 재물을 얻습니다.',
        '金':'정재는 목(木)에 속합니다. 금명의 사람은 문화, 교육, 환경 분야에서 재물을 이룹니다. 전문성으로 가치를 창조하세요.',
        '水':'정재는 화(火)에 속합니다. 수명의 사람은 에너지, 엔터테인먼트, 인터넷으로 재물을 이룹니다. 지혜와 융통성을 활용하세요.',
      };

      if (isCN) {
        return `${greeting}基于紫微财帛宫与八字财星分析：

💰 **财富基因**
日主${dz.gan}（${dw}），年柱${yz.gan}${yz.zhi}。

${wealthCn[dw] || ''}

📅 **财运转折**
• 青年期（20-35）：${yz.wzGan === dw ? '财运平稳起步，宜学习理财知识' : '有早期财运机会，需把握'}
• 中年期（36-50）：事业发展带动财运上升，宜积极投资自己
• 成熟期（50+）：宜转向资产保值和稳健理财

⚠️ **风险警示**
${dw === '火' || dw === '木' ? '不宜高杠杆投资，宜稳健理财为主。' : '宜分散投资，避免单一项目投入过多。'}

📌 **深度解析**：完整八字财库开合时机 · 流年财星飞布图 · 最佳投资年份与领域 · 偏财运详解`;
      }
      const wMap: Record<string, Record<string,string>> = { 'en':wealthEn, 'ja':wealthJa, 'ko':wealthKo };
      const wealthText = (wMap[lang || 'en'] || wealthEn)[dw] || '';
      const wLang = lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : 'en';
      return `${greeting}Wealth analysis based on Ba Zi:

💰 **Wealth Profile**
Day Master ${dz.gan} (${wLang==='ja'?WX_JA[dw]:wLang==='ko'?WX_KO[dw]:WX_EN[dw] || dw}), Year Pillar ${yz.gan}${yz.zhi}.

${wealthText}

📅 **Fortune Turning Points**
• Youth (20-35): ${yz.wzGan === dw ? 'Steady start — learn financial management' : 'Early wealth opportunities — seize them'}
• Mid-life (36-50): Career growth drives wealth — invest in yourself
• Maturity (50+): Shift to asset preservation and conservative investing

⚠️ **Risk Warning**
${dw === '火' || dw === '木' ? 'Avoid high leverage — prioritize steady investing.' : 'Diversify investments — avoid over-concentration in one area.'}

📌 **Deep Analysis**: Complete wealth warehouse timing · Annual wealth star chart · Best investment years · Detailed windfall analysis`;
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'tenYearLuck', label:'十年大运', icon:'📈',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const greeting = d.name ? `${d.name}，` : '';
      const currentAge = new Date().getFullYear() - d.year;
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      if (isCN) {
        return `${greeting}基于八字大运推算，为您分析大运走势：

🔄 **大运周期**
• 命主${yy}年${yy === '阳' ? '男顺排' : '女逆排'}，年柱${yz.gan}${yz.zhi}。
• 当前年龄约${currentAge}岁。

🗓️ **各阶段运势概要**
• 0-10岁 童年运：${yz.wzGan === '木' ? '生命力旺盛，但需注意磕碰' : yz.wzGan === '火' ? '活泼好动，注意安全' : yz.wzGan === '土' ? '平稳成长，身体健康' : yz.wzGan === '金' ? '体质偏敏感，需多关注' : '灵动聪慧，较早展现智力'}
• 10-20岁 少年运：${dw === '木' || dw === '火' ? '学业上升期，有贵人提携' : '稳步发展，打好人生基础'}
• 20-30岁 青年运：进入${yy === '阳' ? '顺行' : '逆行'}大运，${dw === '木' || dw === '火' ? '事业起步期，机遇与挑战并存' : dw === '土' ? '积累期，踏实发展最为重要' : '变动期，宜多尝试找准方向'}
• 30-40岁 壮年运：${dw === '金' || dw === '水' ? '财官两旺的重要十年，事业财运双丰收' : '家庭与事业平衡发展的关键期'}
• 40-50岁 中年运：${dw === '火' || dw === '金' ? '事业巅峰期，宜巩固成果' : '转型期，宜开拓新领域'}

📌 **深度解析**：完整十年大运排盘 · 每一年十二宫星曜流转 · 换运吉凶节点 · 各运贵人/小人方位`;
      }
      return `${greeting}Decade Luck analysis based on Ba Zi:

🔄 **Luck Cycle**
• Your birth year ${yz.gan}${yz.zhi}. ${yy === '阳' ? 'Yang year' : 'Yin year'}.
• Current age: approximately ${currentAge} years old.

🗓️ **Life Stage Overview**
• 0-10 Childhood: ${yz.wzGan === '木' ? 'Vibrant vitality — watch for tumbles' : yz.wzGan === '火' ? 'Active and curious — keep safe' : yz.wzGan === '土' ? 'Steady growth — healthy' : yz.wzGan === '金' ? 'Sensitive constitution — extra care' : 'Intelligent, early bloomer'}
• 10-20 Youth: ${dw === '木' || dw === '火' ? 'Academic rising — benefactors appear' : 'Steady development — build foundations'}
• 20-30 Young Adult: ${yy === '阳' ? 'Forward' : 'Reverse'} luck cycle starting. ${dw === '木' || dw === '火' ? 'Career beginnings — opportunities & challenges' : dw === '土' ? 'Accumulation phase — steady progress' : 'Transition phase — explore your direction'}
• 30-40 Prime: ${dw === '金' || dw === '水' ? 'A critical decade — career and wealth peak' : 'Balance family and career'}
• 40-50 Mid-life: ${dw === '火' || dw === '金' ? 'Career peak — consolidate gains' : 'Transformation — explore new horizons'}

📌 **Deep Analysis**: Complete decade chart · Annual star movements · Luck transition points · Benefactor/antagonist directions per decade`;
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
  {
    key:'yearlyGuide', label:'流年指引', icon:'🗓️',
    generate:(data?: unknown, lang?: string) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const curYear = new Date().getFullYear();
      const cyz = yearGanZhi(curYear);
      const greeting = d.name ? `${d.name}，` : '';
      const isCN = lang === 'zh-CN' || lang === 'zh-TW' || !lang;

      const isSelf = cyz.wzGan === dw;
      const isNourishing = cyz.wzGan === '木' && dw === '火' || cyz.wzGan === '火' && dw === '土' || cyz.wzGan === '土' && dw === '金' || cyz.wzGan === '金' && dw === '水' || cyz.wzGan === '水' && dw === '木';

      if (isCN) {
        return `${greeting}${curYear}年流年运势指引：

📅 **流年干支**
${curYear}年：${cyz.gan}${cyz.zhi}（${cyz.wzGan}${cyz.wzZhi}），与您的年柱${yz.gan}${yz.zhi}${cyz.gan === yz.gan ? '天干相同' : cyz.zhi === yz.zhi ? '地支相同' : '无直接冲合'}。

🔮 **年度主题**
${isSelf ? '今年流年五行与日主五行相同，自我意识增强，是提升自我的好年份。宜专注个人成长和能力提升。' : isNourishing ? '今年流年五行生您的日主，贵人运势旺盛，事业财运有望突破。宜积极行动，把握机遇。' : '今年流年五行与日主有生克关系，需注意平衡。宜稳中求进，避免大的冒险。'}

📊 **各领域运势**
• 事业：${isSelf ? '★★★★☆' : '★★★☆☆'} ${isSelf ? '稳步推进，适合内部提升' : '宜积累资源，等待时机'}
• 财运：${isSelf ? '★★★☆☆' : '★★☆☆☆'} 宜保守理财，避免大额投资
• 感情：★★★☆☆ 注意沟通，多陪伴家人
• 健康：${dw === '木' ? '注意肝胆' : dw === '火' ? '注意心脏' : dw === '土' ? '注意脾胃' : dw === '金' ? '注意呼吸' : '注意肾'}保养

📌 **深度解析**：逐月流年详解 · 每月吉凶事项清单 · 太岁/岁破/三煞方位 · 趋吉避凶具体行动指南`;
      }
      return `${greeting}${curYear} Annual Forecast:

📅 **Year Pillar**
${curYear}: ${cyz.gan}${cyz.zhi} (${WX_EN[cyz.wzGan] || cyz.wzGan}${WX_EN[cyz.wzZhi] || cyz.wzZhi}). Relation to your year pillar ${yz.gan}${yz.zhi}: ${cyz.gan === yz.gan ? 'Same Heavenly Stem' : cyz.zhi === yz.zhi ? 'Same Earthly Branch' : 'No direct conflict/union'}.

🔮 **Theme of the Year**
${isSelf ? 'This year\'s element matches your Day Master — a great year for self-improvement. Focus on personal growth.' : isNourishing ? 'The year\'s element nourishes your Day Master — benefactors appear, career and wealth breakthroughs possible. Take action!' : 'The year\'s element interacts with your Day Master — maintain balance. Steady progress, avoid big risks.'}

📊 **Area Forecasts**
• Career: ${isSelf ? '★★★★☆' : '★★★☆☆'} ${isSelf ? 'Steady advancement — suitable for internal promotion' : 'Build resources, wait for opportunities'}
• Wealth: ${isSelf ? '★★★☆☆' : '★★☆☆☆'} Conservative investing, avoid large commitments
• Relationships: ★★★☆☆ Communicate well, spend time with family
• Health: Focus on ${WX_EN[dw] || dw} area care

📌 **Deep Analysis**: Monthly breakdown · Auspicious/inauspicious days · Tai Sui directions · Action guide for good fortune`;
    },
    languages: ['zh-CN','zh-TW','en','ja','ko'],
  },
];

export function getAnalysisDimension(key: string): AnalysisDimension | undefined {
  return analysisDimensions.find(d => d.key === key);
}

export function getFreeDimensions(): AnalysisDimension[] {
  return analysisDimensions;
}

export function getVipDimensions(): AnalysisDimension[] {
  return [];
}
