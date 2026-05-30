const fs = require('fs');

// Read JSON data files for yearly fortune
const y2026 = JSON.parse(fs.readFileSync('scripts/_data_y2026.json', 'utf8'));
const y2027 = JSON.parse(fs.readFileSync('scripts/_data_y2027.json', 'utf8'));
const m2026 = JSON.parse(fs.readFileSync('scripts/_data_m2026.json', 'utf8'));
const m2027 = JSON.parse(fs.readFileSync('scripts/_data_m2027.json', 'utf8'));

// Read first 9 constellation entries from existing file
const old = fs.readFileSync('src/app/xingzuo/XingzuoClient.tsx', 'utf8');

// Extract from '白羊座': { to the last '},' before we start seeing code
const startIdx = old.indexOf("'白羊座': {");
if (startIdx < 0) { console.error('Cannot find 白羊座'); process.exit(1); }

// Find the end of constellation data - look for the last '  },' followed by closing
// The data is followed by either a new key or closing }
const lines = old.substring(startIdx).split('\n');
let dataLines = [];
let depth = 0;
let isData = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Count braces
  for (const ch of line) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
  }
  
  // When we hit a top-level closing brace (back from 1 to 0) and the next look is a code line, stop
  // Actually, the first 9 signs end with '  },'
  dataLines.push(line);
  
  // Find 射手座 closing
  if (line.includes("conclusion:") && braceCount === 0) {
    // This is the last brace of 射手座, then the object continues
    // We want up to and including the closing of 射手座
    isData = false;
    break;
  }
}

// Better approach: find lines between 白羊座 and 射手座's conclusion
const fullLines = old.split('\n');
const first9End = old.lastIndexOf("'射手座'");
if (first9End < 0) {
  console.error('Cannot find 射手座');
  // Fallback: find the double closing braces pattern
  console.log('Trying fallback...');
  process.exit(1);
}

// Find the end of 射手座 entries
const afterSag = old.indexOf("};", first9End);
const dataEnd = old.indexOf("};", afterSag + 2); // Second };
const first9Section = old.substring(startIdx, dataEnd + 2);
console.log('First 9 data section length:', first9Section.length);
console.log('Ends with:', JSON.stringify(first9Section.slice(-30)));

// Now build constellations as embedded string
const constellationStr = `const CONSTELLATION_DATA = {
${first9Section}
  '摩羯座': {
    origin: '古希腊神话中，摩羯座源自牧神潘的故事。在一次众神聚会时，怪物提丰突然袭击。众神纷纷变身逃跑，潘跳入尼罗河，慌张之下上半身变成山羊、下半身变成鱼尾。宙斯觉得这个形象很有趣，便将其升入星空成为摩羯座。故摩羯座也被称为"海山羊"。',
    myth: '在巴比伦神话中，摩羯座代表着智慧之神埃亚，他半鱼半山羊的形象象征着水陆两栖的智慧和适应力。摩羯座也标志着冬至的来临，象征着黎明前的黑暗和希望的曙光。',
    character: '摩羯座的人坚韧不拔、务实稳重，是真正的攀登者和筑梦者。他们是十二星座中最有野心和毅力的一个，为了目标可以付出超乎常人的努力。做事有规划、有条理，讲究效率和方法。责任感极强，是值得信赖的伙伴。但有时过于严肃保守、缺乏幽默感，也容易太过现实而忽视生活的乐趣。',
    love: '摩羯座的爱情像老酒，越陈越香。他们并不会一见钟情，而是在相处中慢慢培养感情。他们用责任和行动来表达爱意，给伴侣最实在的安全感。虽然不懂浪漫，但他们的爱是刻在骨子里的承诺。与金牛座、处女座最为契合。',
    career: '摩羯座是天生的管理者和建设者，适合需要长期规划的职业，如CEO、项目经理、公务员、建筑师、律师、银行家、科研人员等。他们一步一个脚印、稳扎稳打，往往是大器晚成的典型。财富积累能力极强，善于长期投资和资产配置，是十二星座中最有财商的一群。',
    health: '摩羯座掌管骨骼、关节和牙齿，容易出现关节炎、骨质疏松、牙齿问题等。他们因长期承受巨大压力而容易导致身心健康问题。建议加强骨骼健康相关的锻炼，如力量训练和负重运动。注意补充钙质和维生素D，保持规律的运动习惯。',
    symbol: '摩羯座的符号♑象征着海山羊（上半身山羊、下半身鱼尾），代表坚韧、野心和适应力。在占星学中，摩羯座是黄道十二宫的第十宫（官禄宫），代表着事业、社会地位和责任。其守护星是土星（Saturn），代表纪律、责任和时间。摩羯座代表着冬至，是全年日照最短的时刻，象征着最暗时刻过后光明即将重现。',
    conclusion: '摩羯座教会我们坚持与成就的价值。你是山巅的登顶者，用每一步的坚定书写成功的定义。你的责任感与坚韧是这个世界最可靠的基石。记住：真正的成功不是站在顶峰俯视众生，而是在攀登途中从未放弃。愿你继续前行，用沉稳的脚步丈量人生的高度。',
  },
  '水瓶座': {
    origin: '古希腊神话中，水瓶座源自特洛伊王子伽尼墨得的故事。伽尼墨得是特洛伊最美丽的少年，宙斯被其美貌所吸引，化身为一只巨鹰将其掳到奥林匹斯山。伽尼墨得成为众神的斟酒者，用水瓶为众神斟倒琼浆玉液。后来宙斯将水瓶的形象升入星空，成为水瓶座。',
    myth: '在巴比伦占星术中，水瓶座对应着雨水和洪水之神，代表着真理的倒灌和对旧秩序的冲刷。水瓶座也象征着知识之泉的永续流淌。',
    character: '水瓶座的人创新独立、思想超前，是时代的先锋和人道主义的践行者。他们有着非凡的原创思维和对未来的敏锐直觉。崇尚自由、平等和博爱，关心社会公益和全人类的福祉。理性而冷静，善于客观分析问题。但有时过于理性缺乏人情味，也可能因过于追求独特而显得古怪疏离。',
    love: '水瓶座的爱情理性而独特，是一场灵魂的共振。他们需要的不是传统的恋人，而是志同道合的灵魂伴侣。他们尊重对方的独立空间，不会有太多束缚，但也容易因为过于理性而缺乏浓烈的情感表达。与双子座、天秤座最为契合。',
    career: '水瓶座适合需要创新和科技思维的职业，如科学家、发明家、程序员、社会活动家、设计师、占星师、新媒体运营等。他们天生适合互联网时代和前沿科技领域。财富追求不是首要目标，但对从事喜欢的工作充满热情。在团队中水瓶座是独特的存在，常常带来意想不到的解决方案。',
    health: '水瓶座掌管小腿、脚踝和循环系统，容易出现静脉曲张、脚踝扭伤、小腿抽筋等问题。他们还容易因思虑过多导致神经紧张和睡眠障碍。建议适度活动，练习瑜伽或游泳。冥想和放松训练有助于平静过度活跃的大脑。多与朋友交流对水瓶座的心理健康很有帮助。',
    symbol: '水瓶座的符号♒象征着水波纹或知识之泉的流动，代表创新、博爱和突破传统。在占星学中，水瓶座是黄道十二宫的第十一宫（福德宫），代表着社交、理想和团体奉献。其守护星是天王星和土星，代表创新、变革和独立。水瓶座代表着大寒至雨水时节，象征着冬末春初的变革力量。',
    conclusion: '水瓶座教会我们创新与人道的精神。你是来自未来的使者，用超前的眼光审视着这个时代。你的与众不同与博爱情怀是推动世界进步的力量。记住：真正的创新不是标新立异，而是敢于用不同的方式爱这个世界。愿你继续以智慧为翼，以博爱为心，为这个世界带来不一样的风景。',
  },
  '双鱼座': {
    origin: '古希腊神话中，双鱼座源自阿佛洛狄忒和厄洛斯的故事。在一次逃离提丰攻击时，爱神阿佛洛狄忒和儿子厄洛斯变成两条鱼跳入幼发拉底河。为了不失去彼此，两条鱼的尾巴被丝带系在一起。后来这两条鱼被升入星空，成为双鱼座。这解释了双鱼座的符号——两条被丝带连接的鱼。',
    myth: '在叙利亚神话中，双鱼座代表着爱与丰饶的女神阿塔迦蒂丝落入水中变成鱼的神话。双鱼座也象征着精神世界的丰富和超越物质界限的灵魂感知。',
    character: '双鱼座的人感性浪漫、心地善良，是梦幻世界的编织者和宇宙的灵媒。他们有着极强的同理心和艺术感受力，能感知到别人无法察觉的微妙情感。想象力和创造力极其丰富，思维天马行空。温柔善良、乐于助人，但有时过于敏感和理想化，容易逃避现实和自我欺骗。',
    love: '双鱼座的爱情是一首没有尽头的诗歌。他们会用最浪漫的方式去爱，愿意为爱牺牲和奉献。他们是十二星座中最懂得浪漫的恋人，总是能创造童话般的爱情故事。但容易因感情用事而看不清现实，需要学会保持理性边界。与巨蟹座、天蝎座最为契合。',
    career: '双鱼座适合需要创意和灵性的职业，如艺术家、音乐家、作家、舞者、摄影师、心理咨询师、慈善工作者、药剂师等。他们在艺术和疗愈领域有着天生的才华，能感受他人内心的痛苦并给予温暖。财富观念比较随性，不太善于理财，需要可靠的人帮助规划。',
    health: '双鱼座掌管脚部、松果体和淋巴系统，容易出现足部问题、水肿、免疫系统紊乱等。他们容易受情绪波动影响身体，且容易产生上瘾倾向。建议通过艺术创作和冥想疏导情绪，保持规律的作息和运动。双鱼座需要特别关注脚部健康，每天泡脚和按摩有助于全身健康。',
    symbol: '双鱼座的符号♓象征着两条被丝带连接的鱼向相反方向游动，代表灵性与物质的平衡、梦境与现实的交织。在占星学中，双鱼座是黄道十二宫的第十二宫（玄秘宫），代表着潜意识、灵性和轮回。其守护星是海王星和木星，代表梦想、灵感和精神追求。双鱼座代表着雨水至春分的节气，是万物复苏、生机萌发的时令。',
    conclusion: '双鱼座教会我们慈悲与想象的珍贵。你是宇宙之梦的编织者，用柔软的内心感受着世间的一切。你的善良与灵性是这个世界最纯净的光。记住：真正的强大不是坚硬，而是在看透世界的残酷之后依然选择温柔相待。愿你永远保持对美的感知，用你的爱让这个世界更加柔软。',
  },
};

const yearlyFortune = { '2026': ${JSON.stringify(y2026)}, '2027': ${JSON.stringify(y2027)} };
const monthlyMatters = { '2026': ${JSON.stringify(m2026)}, '2027': ${JSON.stringify(m2027)} };\n`;

// Component code
const componentCode = `
const SIGNS = [
  { name: '白羊座', en: 'Aries', date: '3.21-4.19', emoji: '♈', el: '火', ruler: '火星' },
  { name: '金牛座', en: 'Taurus', date: '4.20-5.20', emoji: '♉', el: '土', ruler: '金星' },
  { name: '双子座', en: 'Gemini', date: '5.21-6.21', emoji: '♊', el: '风', ruler: '水星' },
  { name: '巨蟹座', en: 'Cancer', date: '6.22-7.22', emoji: '♋', el: '水', ruler: '月亮' },
  { name: '狮子座', en: 'Leo', date: '7.23-8.22', emoji: '♌', el: '火', ruler: '太阳' },
  { name: '处女座', en: 'Virgo', date: '8.23-9.22', emoji: '♍', el: '土', ruler: '水星' },
  { name: '天秤座', en: 'Libra', date: '9.23-10.23', emoji: '♎', el: '风', ruler: '金星' },
  { name: '天蝎座', en: 'Scorpio', date: '10.24-11.22', emoji: '♏', el: '水', ruler: '冥王星、火星' },
  { name: '射手座', en: 'Sagittarius', date: '11.23-12.21', emoji: '♐', el: '火', ruler: '木星' },
  { name: '摩羯座', en: 'Capricorn', date: '12.22-1.19', emoji: '♑', el: '土', ruler: '土星' },
  { name: '水瓶座', en: 'Aquarius', date: '1.20-2.18', emoji: '♒', el: '风', ruler: '天王星、土星' },
  { name: '双鱼座', en: 'Pisces', date: '2.19-3.20', emoji: '♓', el: '水', ruler: '海王星、木星' },
]

const getSign = (n: string) => SIGNS.findIndex(s => s.name === n)

const SECTIONS_BAIKE = ['origin','myth','character','love','career','health','symbol','conclusion']
const SECTION_CN: Record<string,string> = {
  origin:'📜 起源与神话', myth:'🔮 神话传说', character:'💪 性格特征',
  love:'💕 爱情与人际关系', career:'💼 事业与财富', health:'🏃 健康与生活',
  symbol:'⭐ 象征意义', conclusion:'📖 结语'
}

export default function XingzuoClient() {
  const [tab, setTab] = useState('baike')
  const [selSign, setSelSign] = useState('白羊座')
  const [selYear, setSelYear] = useState('2026')
  const [selYf, setSelYf] = useState('白羊座')

  const data = CONSTELLATION_DATA[selSign]
  const yf = yearlyFortune[selYear]?.[selYf]
  const mm = monthlyMatters[selYear]?.[selYf]

  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-6">
        {['baike','yearly'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all \${
              tab===t ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-gold-400'
            }\`}>
            {t==='baike' ? '📚 星座百科' : '📅 年度运势'}
          </button>
        ))}
      </div>

      {tab==='baike' && <>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {SIGNS.map(s => (
            <button key={s.name} onClick={() => setSelSign(s.name)}
              className={\`p-3 rounded-xl text-center border transition-all \${
                selSign===s.name ? 'bg-gold-600/20 border-gold-500 text-gold-300' : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-gold-500/30'
              }\`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xs font-medium">{s.name}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.date}</div>
            </button>
          ))}
        </div>

        {data && <div className="space-y-4 animate-fadeIn">
          <div className="border-b border-dark-600 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gold-400 font-serif">{selSign} <span className="text-sm text-gray-500 font-sans">{SIGNS[getSign(selSign)]?.emoji} {SIGNS[getSign(selSign)]?.en} | {SIGNS[getSign(selSign)]?.el}象 | {SIGNS[getSign(selSign)]?.ruler}守护</span></h2>
          </div>
          {SECTIONS_BAIKE.map(sk => (
            <div key={sk} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
              <h3 className="text-sm font-medium text-gold-500 mb-2">{SECTION_CN[sk]}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{data[sk]}</p>
            </div>
          ))}
        </div>}
      </>}

      {tab==='yearly' && <>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {['2026','2027'].map(y => (
              <button key={y} onClick={() => setSelYear(y)}
                className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all \${
                  selYear===y ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-gold-400'
                }\`}>{y}年</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIGNS.map(s => (
              <button key={s.name} onClick={() => setSelYf(s.name)}
                className={\`px-2.5 py-1.5 rounded text-xs border transition-all \${
                  selYf===s.name ? 'bg-gold-600/20 border-gold-500 text-gold-300' : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-gold-500/30'
                }\`}>{s.emoji} {s.name}</button>
            ))}
          </div>
        </div>

        {yf && <div className="space-y-4 animate-fadeIn">
          <div className="border-b border-dark-600 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gold-400 font-serif">{selYf} {selYear}年运势</h2>
          </div>

          <div className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-2">🌟 整体运势概览</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{yf.general}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{k:'career',icon:'💼',label:'事业运势'},{k:'wealth',icon:'💰',label:'财运走势'},{k:'love',icon:'💕',label:'感情与人际'},{k:'health',icon:'🏃',label:'健康提醒'}].map(s => (
              <div key={s.k} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
                <h3 className="text-sm font-medium text-gold-500 mb-2">{s.icon} {s.label}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{yf[s.k]}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-3">📋 每月重点提示</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(mm||[]).map((m:string,i:number) => (
                <div key={i} className="p-2 bg-dark-800/50 rounded-lg text-xs text-gray-400">
                  <span className="text-gold-600 font-medium">{i+1}月</span> {m}
                </div>
              ))}
            </div>
          </div>
        </div>}
      </>}
    </div>
  )
}
`;

const full = `'use client'

import { useState } from 'react'

${constellationStr}
${componentCode}
`;

fs.writeFileSync('src/app/xingzuo/XingzuoClient.tsx', full, 'utf8');
console.log('Written! Size:', Buffer.byteLength(full, 'utf8'));
console.log('Has 白羊座:', full.includes("'白羊座'"));
console.log('Has 双鱼座:', full.includes("'双鱼座'"));
console.log('Has export default:', full.includes('export default'));
console.log('Size per line:', Math.round(Buffer.byteLength(full, 'utf8') / full.split('\n').length));
