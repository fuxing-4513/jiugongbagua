// ============================================================
// ai-analysis.ts — AI Analysis Configuration
// ============================================================

export interface AnalysisDimension {
  key: string;
  label: string;
  icon: string;
  // 预留：后续接入付费系统后可启用 free 字段控制内容可见性
  generate: (data?: unknown) => string;
}

// ── Helpers ──

const T_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const T_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const WU_XING = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
const ZHI_WX = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
const GAN_YINYANG = { '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴' };
const ZHI_ZODIAC: Record<string,string> = { '子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪' };

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

function fiveElementSummary(data: AnalysisData): string {
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
  const surplus = max[1] >= 3 ? `五行偏${max[0]}较重` : '五行较为均衡';
  const deficient = min[1] <= 0 ? `，${min[0]}气不足` : '';
  return surplus + deficient;
}

// ── Dimensions ──

export const analysisDimensions: AnalysisDimension[] = [
  // ═══ FREE (5) ═══
  {
    key:'overallReading', label:'整体解读', icon:'🔮',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const yz = yearGanZhi(d.year);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dayWx = (WU_XING as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}，您好。` : '';
      return `${greeting}您出生于${getYearName(d.year)}${getMonthName(d.year, d.month)}${getDayName(d.year, d.month, d.day)}。

📜 **命盘概述**
年柱：${yz.gan}${yz.zhi}（${yz.wzGan}${yz.wzZhi}），日主：${dz.gan}（${dayWx}）。

${fiveElementSummary(d)}。日主${dz.gan}属${dayWx}，${(GAN_YINYANG as Record<string,string>)[dz.gan]}性。年干${yz.gan}为${(WU_XING as Record<string,string>)[yz.gan]}，与日主形成${dayWx === yz.wzGan ? '比和' : dayWx === '木' && yz.wzGan === '水' || dayWx === '火' && yz.wzGan === '木' || dayWx === '土' && yz.wzGan === '火' || dayWx === '金' && yz.wzGan === '土' || dayWx === '水' && yz.wzGan === '金' ? '相生（吉）' : '相克'}的关系。

命中${dayWx}为根基，宜顺势而为。性格中带有${dayWx === '木' ? '仁爱正直、积极向上' : dayWx === '火' ? '热情奔放、光明磊落' : dayWx === '土' ? '敦厚诚实、稳重可靠' : dayWx === '金' ? '刚毅果断、重情重义' : '聪明灵动、善于变通'}的特质。一生需注意${dayWx === '木' ? '肝胆健康' : dayWx === '火' ? '心血管调养' : dayWx === '土' ? '脾胃养护' : dayWx === '金' ? '肺与呼吸系统' : '肾与泌尿系统'}。

综合来看，您的人生格局呈现${yz.wzGan === '土' && yz.wzZhi === '土' ? '稳重如山' : yz.wzGan === '水' && yz.wzZhi === '水' ? '灵动如水' : yz.wzGan === '火' && yz.wzZhi === '火' ? '光明似火' : yz.wzGan === '金' && yz.wzZhi === '金' ? '坚韧如金' : yz.wzGan === '木' && yz.wzZhi === '木' ? '向上如木' : '丰富多彩'}的趋势，宜关注自身的优势发挥与短处补益。`;
    },
  },
  {
    key:'personality', label:'性格分析', icon:'🧠',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}的` : '您的';
      return `${greeting}日主为${dz.gan}（${dw}·${yy}），以下是性格深度剖析：

🧬 **核心性格**
• ${dw === '木' ? '如春日之木，生机勃勃，有强烈的上进心和成长欲。为人正直，有仁爱之心，乐善好施。有时过于理想主义，需要更加务实。' : ''}${dw === '火' ? '如夏日之火，热情洋溢，光明磊落。性格开朗外向，善于表达，有领导魅力。但有时急躁冲动，需学会沉静。' : ''}${dw === '土' ? '如大地之土，敦厚诚实，稳重可靠。做事踏实，重承诺守信用。为人包容，但有时过于保守，需适当开拓。' : ''}${dw === '金' ? '如秋日之金，刚毅果断，重情重义。有强烈的正义感和原则性，做事干脆利落。但有时过于刚硬，需学会柔和。' : ''}${dw === '水' ? '如冬日之水，智慧灵动，善于变通。思维敏捷，洞察力强，适应能力好。但有时优柔寡断，需坚定方向。' : ''}

🎭 **人际交往**
${yy === '阳' ? '偏外向主动，在社交场合中容易成为焦点，喜欢表达自己的观点和想法。适合担任领导或组织者角色。' : '偏内敛沉稳，心思细腻，善于观察和倾听。在社交中更倾向于深度交流而非广撒网。'}

💡 **思维模式**
${dz.gan === '甲' || dz.gan === '丙' || dz.gan === '庚' || dz.gan === '壬' ? '思维方式偏宏观，善于把握大局和方向，对战略性问题有天生直觉。' : '思维方式偏微观，注重细节和逻辑，喜欢深入分析和研究具体问题。'}

⚠️ **需注意**
${dw === '木' ? '避免固执己见，多听他人建议。注意肝胆健康，保持情绪稳定。' : ''}${dw === '火' ? '避免冲动决策，三思而后行。注意心脏保健，避免过度劳累。' : ''}${dw === '土' ? '避免过于保守，勇于尝试新事物。注意脾胃调养，保持适度运动。' : ''}${dw === '金' ? '避免过于刚硬，适当柔和处事。注意肺和呼吸系统保健。' : ''}${dw === '水' ? '避免优柔寡断，坚定自己的选择。注意肾和泌尿系统健康。' : ''}`;
    },
  },
  {
    key:'career', label:'事业运势', icon:'💼',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}，` : '';
      return `${greeting}基于您日主${dz.gan}（${dw}）的能量属性，为您解析事业方向：

📊 **职业适配**
${dw === '木' ? '• 适合行业：教育、出版、文化创意、林业、园艺、医疗健康\n• 角色定位：策划者、教导者、创作者\n• 职场优势：有创新思维和成长意识，善于培养和发展团队' : ''}${dw === '火' ? '• 适合行业：传媒娱乐、互联网、能源、餐饮、美容时尚\n• 角色定位：领导者、发言人、创意总监\n• 职场优势：热情感染力强，善于激励团队，有前瞻性视野' : ''}${dw === '土' ? '• 适合行业：房地产、建筑、金融、农业、物流仓储\n• 角色定位：管理者、协调者、执行者\n• 职场优势：踏实可靠，善于统筹资源，有强大的执行力' : ''}${dw === '金' ? '• 适合行业：金融投资、法律、军警、机械制造、珠宝\n• 角色定位：决策者、分析师、改革者\n• 职场优势：决断力强，善于处理复杂问题，有原则有底线' : ''}${dw === '水' ? '• 适合行业：咨询、科研、贸易物流、旅游、媒体传播\n• 角色定位：顾问、研究员、策略师\n• 职场优势：思维灵活，善于沟通和变通，适应力强' : ''}

🚀 **发展建议**
• 30岁前：打好基础，多积累行业经验和人脉资源
• 30-45岁：事业上升期，宜主动争取机会，展示能力
• 45岁后：进入成熟期，宜转向管理与传承角色

💎 **贵人方位**
生于${getYearName(d.year)}，五行属${(ZHI_WX as Record<string,string>)[yearGanZhi(d.year).zhi]}，贵人多在${dw === '木' ? '东方和北方' : dw === '火' ? '东方和南方' : dw === '土' ? '南方和中央' : dw === '金' ? '西方和中央' : '西方和北方'}，合作或求职宜朝此方向。`;
    },
  },
  {
    key:'relationship', label:'情感关系', icon:'💕',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const dzZhi = (ZHI_WX as Record<string,string>)[dz.zhi];
      const z = dz.zhi;
      const zodiac = ZHI_ZODIAC[z];
      const greeting = d.name ? `${d.name}，` : '';
      return `${greeting}基于日主${dz.gan}（${dw}）及日支${z}（${dzZhi}），解析您的情感特质：

💝 **情感模式**
${dw === '木' ? '对感情认真专一，追求精神层面的契合。表达方式偏含蓄，但内心炽热。' : ''}${dw === '火' ? '在感情中热情主动，喜欢浪漫和仪式感。表达直接，爱恨分明。' : ''}${dw === '土' ? '感情观踏实传统，重视责任和稳定。表达方式朴素，但持久可靠。' : ''}${dw === '金' ? '对感情有明确标准，不轻易动心。一旦认定则全心全意，但有完美主义倾向。' : ''}${dw === '水' ? '感情丰富细腻，善解人意。容易产生共鸣，但有时情绪化，需要对方理解。' : ''}

🔗 **配对建议**
生肖属${zodiac}，与${z === '子' ? '牛、龙、猴' : z === '丑' ? '鼠、蛇、鸡' : z === '寅' ? '马、狗、猪' : z === '卯' ? '羊、狗、猪' : z === '辰' ? '鼠、猴、鸡' : z === '巳' ? '牛、鸡' : z === '午' ? '虎、羊、狗' : z === '未' ? '兔、马、猪' : z === '申' ? '鼠、龙' : z === '酉' ? '牛、龙、蛇' : z === '戌' ? '虎、兔、马' : '兔、羊'}最为投缘。

五行中，${dw}与${dw === '木' ? '水（生我）、火（我生）' : dw === '火' ? '木（生我）、土（我生）' : dw === '土' ? '火（生我）、金（我生）' : dw === '金' ? '土（生我）、水（我生）' : '金（生我）、木（我生）'}属性的人最为和谐。

💍 **婚姻建议**
${yy === '阳' && dw === '金' ? '宜晚婚（30岁后），等待心智成熟' : yy === '阴' && dw === '水' ? '宜早定（28岁左右），感情稳定后发展更好' : '顺其自然，无需刻意，缘分自来'}。`;
    },
  },
  {
    key:'health', label:'健康分析', icon:'💪',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const greeting = d.name ? `${d.name}，` : '';
      return `${greeting}日主${dz.gan}属${dw}，以下是健康养生分析：

🏥 **重点关注系统**
${dw === '木' ? '🟡 肝胆系统、筋骨、视力\n• 养生建议：少饮酒、规律作息、多吃绿色蔬菜\n• 运动推荐：瑜伽、太极、散步\n• 季节注意：春季肝气旺盛，注意情绪管理' : ''}${dw === '火' ? '🟡 心血管系统、小肠、面部\n• 养生建议：保持心态平和、避免暴怒、饮食清淡\n• 运动推荐：游泳、慢跑、冥想\n• 季节注意：夏季心火旺盛，多补充水分' : ''}${dw === '土' ? '🟡 脾胃系统、肌肉、口腔\n• 养生建议：定时定量进食、细嚼慢咽、少吃生冷\n• 运动推荐：散步、登山、太极拳\n• 季节注意：长夏湿气重，注意健脾祛湿' : ''}${dw === '金' ? '🟡 呼吸系统、大肠、皮肤\n• 养生建议：注意保暖、远离烟尘、多呼吸新鲜空气\n• 运动推荐：深呼吸练习、跑步、骑行\n• 季节注意：秋季干燥，注意润肺保湿' : ''}${dw === '水' ? '🟡 肾与泌尿系统、骨骼、听力\n• 养生建议：足部保暖、节制房事、多喝温水\n• 运动推荐：慢走、打坐、静功\n• 季节注意：冬季宜养藏，减少剧烈运动' : ''}

🥗 **饮食调养**
• 宜多食：${dw === '木' ? '绿色蔬果、酸味食物、豆制品' : dw === '火' ? '红色食物、苦味食材、水果' : dw === '土' ? '黄色食物、甘味食材、谷物' : dw === '金' ? '白色食物、辛辣食材、果蔬' : '黑色食物、咸味食材、海产'}
• 宜少食：${dw === '木' ? '过于辛辣刺激、油炸食品' : dw === '火' ? '过于咸腻、高热量加工食品' : dw === '土' ? '过于甜腻、生冷食品' : dw === '金' ? '过于苦寒、烧烤煎炸食品' : '过于甘甜、冰镇冷饮'}

⏰ **作息建议**
${dw === '木' || dw === '火' ? '宜早起（6-7点），阳气生发时活动最佳。' : '宜适当晚起（7-8点），养精蓄锐。'}晚上11点前入睡，${dw === '水' ? '尤其要注意，肾经当令时需休息。' : '保证充足睡眠。'}`;
    },
  },

  // 全量开放（待接入支付系统后设为 free:false）
  {
    key:'wealthFortune', label:'财富格局', icon:'💰',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const greeting = d.name ? `${d.name}，` : '';
      return `${greeting}基于紫微财帛宫与八字财星分析：

💰 **财富基因**
日主${dz.gan}（${dw}），年柱${yz.gan}${yz.zhi}。

${dw === '木' ? '正财属土，偏财亦属土。命中财星状况需结合整体八字，但木命之人以土为财，财源与地产、建筑、农业相关。宜稳健积累，不宜投机。' : ''}${dw === '火' ? '正财属金，偏财亦属金。火命人以金为财，财源与金融、贵金属、精密制造相关。宜发挥自身光芒吸引财富。' : ''}${dw === '土' ? '正财属水，偏财亦属水。土命人以水为财，财源与贸易、物流、信息相关。宜以诚信和稳定赢得财富。' : ''}${dw === '金' ? '正财属木，偏财亦属木。金命人以木为财，财源与文化、教育、环保相关。宜以专业技能创造价值。' : ''}${dw === '水' ? '正财属火，偏财亦属火。水命人以火为财，财源与能源、娱乐、互联网相关。宜以智慧和灵活性获取财富。' : ''}

📅 **财运转折**
• 青年期（20-35）：${yz.wzGan === dw ? '财运平稳起步，宜学习理财知识' : '有早期财运机会，需把握'}
• 中年期（36-50）：事业发展带动财运上升，宜积极投资自己
• 成熟期（50+）：宜转向资产保值和稳健理财

⚠️ **风险警示**
${dw === '火' || dw === '木' ? '不宜高杠杆投资，宜稳健理财为主。' : '宜分散投资，避免单一项目投入过多。'}

📌 **深度解析**：完整八字财库开合时机 · 流年财星飞布图 · 最佳投资年份与领域 · 偏财运详解`;
    },
  },
  {
    key:'tenYearLuck', label:'十年大运', icon:'📈',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yy = (GAN_YINYANG as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const greeting = d.name ? `${d.name}，` : '';
      const currentAge = new Date().getFullYear() - d.year;
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
    },
  },
  {
    key:'yearlyGuide', label:'流年指引', icon:'🗓️',
    generate:(data?: unknown) => {
      const d = extractData(data);
      const dz = dayGanZhiDoomsday(d.year, d.month, d.day);
      const dw = (WU_XING as Record<string,string>)[dz.gan];
      const yz = yearGanZhi(d.year);
      const curYear = new Date().getFullYear();
      const cyz = yearGanZhi(curYear);
      const greeting = d.name ? `${d.name}，` : '';
      return `${greeting}${curYear}年流年运势指引：

📅 **流年干支**
${curYear}年：${cyz.gan}${cyz.zhi}（${cyz.wzGan}${cyz.wzZhi}），与您的年柱${yz.gan}${yz.zhi}${cyz.gan === yz.gan ? '天干相同' : cyz.zhi === yz.zhi ? '地支相同' : '无直接冲合'}。

🔮 **年度主题**
${cyz.wzGan === dw ? '今年流年五行与日主五行相同，自我意识增强，是提升自我的好年份。宜专注个人成长和能力提升。' : cyz.wzGan === '木' && dw === '火' || cyz.wzGan === '火' && dw === '土' || cyz.wzGan === '土' && dw === '金' || cyz.wzGan === '金' && dw === '水' || cyz.wzGan === '水' && dw === '木' ? '今年流年五行生您的日主，贵人运势旺盛，事业财运有望突破。宜积极行动，把握机遇。' : '今年流年五行与日主有生克关系，需注意平衡。宜稳中求进，避免大的冒险。'}

📊 **各领域运势**
• 事业：${cyz.wzGan === dw ? '★★★★☆' : '★★★☆☆'} ${cyz.wzGan === dw ? '稳步推进，适合内部提升' : '宜积累资源，等待时机'}
• 财运：${cyz.wzGan === dw ? '★★★☆☆' : '★★☆☆☆'} 宜保守理财，避免大额投资
• 感情：★★★☆☆ 注意沟通，多陪伴家人
• 健康：${dw === '木' ? '注意肝胆' : dw === '火' ? '注意心脏' : dw === '土' ? '注意脾胃' : dw === '金' ? '注意呼吸' : '注意肾'}保养

📌 **深度解析**：逐月流年详解 · 每月吉凶事项清单 · 太岁/岁破/三煞方位 · 趋吉避凶具体行动指南`;
    },
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
