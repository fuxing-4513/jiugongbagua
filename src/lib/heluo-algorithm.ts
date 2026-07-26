// ============================================================
// heluo-algorithm.ts — 河洛理数 (Heluo Numerology) Algorithm
// ============================================================

export interface HeluoResult {
  yearNum: number;
  monthNum: number;
  dayNum: number;
  hourNum: number;
  totalNum: number;
  xiantianGua: string;
  houtianGua: string;
  xiantianWx: string;
  houtianWx: string;
  wuxingAnalysis: string;
}

const STEM_NUMBER_MAP: Record<string, number> = {
  '甲':9,'己':9,'子':9,'午':9,
  '乙':8,'庚':8,'丑':8,'未':8,
  '丙':7,'辛':7,'寅':7,'申':7,
  '丁':6,'壬':6,'卯':6,'酉':6,
  '戊':5,'癸':5,'辰':5,'戌':5,
  '巳':4,'亥':4,
};

interface GuaInfo { name: string; wx: string; }

const MALE_XIANTIAN: Record<number, GuaInfo> = {
  1:{name:'坎',wx:'水'},2:{name:'坤',wx:'土'},3:{name:'震',wx:'木'},4:{name:'巽',wx:'木'},
  5:{name:'坤',wx:'土'},6:{name:'乾',wx:'金'},7:{name:'兑',wx:'金'},8:{name:'艮',wx:'土'},
  0:{name:'离',wx:'火'},
};

const FEMALE_XIANTIAN: Record<number, GuaInfo> = {
  1:{name:'坎',wx:'水'},2:{name:'坤',wx:'土'},3:{name:'震',wx:'木'},4:{name:'巽',wx:'木'},
  5:{name:'艮',wx:'土'},6:{name:'乾',wx:'金'},7:{name:'兑',wx:'金'},8:{name:'艮',wx:'土'},
  0:{name:'离',wx:'火'},
};

function getHoutianGua(remainder: number, isMale: boolean): GuaInfo {
  const map = isMale ? FEMALE_XIANTIAN : MALE_XIANTIAN;
  return map[remainder] ?? { name:'离', wx:'火' };
}

function genAnalysis(guaName: string, wx: string, isXiantian: boolean, lang: string = 'zh-CN'): string {
  const p = isXiantian
    ? (lang === 'en' ? 'Xiantian' : lang === 'ja' ? '先天' : lang === 'ko' ? '선천' : '先天')
    : (lang === 'en' ? 'Houtian' : lang === 'ja' ? '后天' : lang === 'ko' ? '후천' : '后天');

  const m: Record<string, Record<string, string>> = {
    '坎': {
      'zh-CN': `${p}卦为坎，属水，主智慧与险陷，水性润下。坎卦者心思缜密，善于在逆境中寻机，一生需注意肾水、耳部健康。`,
      'en': `The ${p} Trigram is Kan (Water), representing wisdom and danger. Water flows downward. Kan people are thoughtful and adept at finding opportunities in adversity. Pay attention to kidney and ear health.`,
      'ja': `${p}卦は坎（水）。水は潤下し、知恵と危険を象徴します。坎の人は思慮深く逆境に強く、腎臓と耳の健康に注意が必要です。`,
      'ko': `${p}괘는 감(水)입니다. 물은 아래로 흐르며 지혜와 위험을 상징합니다. 감의 사람은 사려 깊고 역경에 강하며 신장과 귀 건강에 주의가 필요합니다.`,
    },
    '坤': {
      'zh-CN': `${p}卦为坤，属土，主柔顺与包容，土性稼穑。坤卦者敦厚诚信、包容万物，有大地般的承载精神，需注意脾胃消化系统。`,
      'en': `The ${p} Trigram is Kun (Earth), representing gentleness and包容. Earth nurtures. Kun people are honest,包容, and nurturing like the earth. Pay attention to spleen and stomach health.`,
      'ja': `${p}卦は坤（土）。土は稼穡し、柔順と包容を象徴します。坤の人は誠実で包容力があり、大地のような精神を持ちます。脾胃の消化器系に注意が必要です。`,
      'ko': `${p}괘는 곤(土)입니다. 흙은 포용하고 기르며 순함과 포용을 상징합니다. 곤의 사람은 성실하고 포용력이 있으며 비장과 위 건강에 주의가 필요합니다.`,
    },
    '震': {
      'zh-CN': `${p}卦为震，属木，主行动与进取，木性曲直。震卦者行动力强、敢作敢为，有开拓创新之勇，需注意肝胆及筋骨保养。`,
      'en': `The ${p} Trigram is Zhen (Wood), representing action and progress. Wood grows freely. Zhen people are decisive, bold, and pioneering. Pay attention to liver, gallbladder, and muscle health.`,
      'ja': `${p}卦は震（木）。木は曲直し、行動と進取を象徴します。震の人は行動力が強く、開拓精神に富みます。肝臓・胆のう・筋骨に注意が必要です。`,
      'ko': `${p}괘는 진(木)입니다. 나무는 구부러지고 펴지며 행동과 진취를 상징합니다. 진의 사람은 행동력이 강하고 개척 정신이 있습니다. 간담과 근골 건강에 주의가 필요합니다.`,
    },
    '巽': {
      'zh-CN': `${p}卦为巽，属木，主渗透与谦逊，木性柔和。巽卦者善于适应环境、以柔克刚，有良好的沟通能力，需注意肝胆及呼吸系统。`,
      'en': `The ${p} Trigram is Xun (Wood), representing penetration and humility. Wood is gentle. Xun people are adaptable and communicate well. Pay attention to liver, gallbladder, and respiratory health.`,
      'ja': `${p}卦は巽（木）。木は柔和で、浸透と謙遜を象徴します。巽の人は適応力が高く、コミュニケーション能力に優れます。肝臓・胆のう・呼吸器系に注意が必要です。`,
      'ko': `${p}괘는 손(木)입니다. 나무는 부드럽고 침투와 겸손을 상징합니다. 손의 사람은 적응력이 뛰어나고 의사소통 능력이 좋습니다. 간담과 호흡기 건강에 주의가 필요합니다.`,
    },
    '乾': {
      'zh-CN': `${p}卦为乾，属金，主刚健与创造，金性从革。乾卦者刚健中正、有领导力与决断力，事业心强，需注意肺金及大肠健康。`,
      'en': `The ${p} Trigram is Qian (Metal), representing strength and creation. Metal is transformative. Qian people are just, decisive leaders with strong work ethic. Pay attention to lung and large intestine health.`,
      'ja': `${p}卦は乾（金）。金は従革し、剛健と創造を象徴します。乾の人は剛健中正でリーダーシップに優れ、肺・大腸の健康に注意が必要です。`,
      'ko': `${p}괘는 건(金)입니다. 쇠는 변화를 따르며 강건과 창조를 상징합니다. 건의 사람은 강건하고 리더십이 있습니다. 폐와 대장 건강에 주의가 필요합니다.`,
    },
    '兑': {
      'zh-CN': `${p}卦为兑，属金，主和悦与表达，金性清润。兑卦者擅长交流、人缘佳、乐观开朗，需注意口舌咽喉及肺金保养。`,
      'en': `The ${p} Trigram is Dui (Metal), representing joy and expression. Metal is clear and resonant. Dui people are sociable, optimistic, and expressive. Pay attention to throat and lung health.`,
      'ja': `${p}卦は兌（金）。金は清潤し、和悦と表現を象徴します。兌の人は社交的で楽観的、口や喉・肺の健康に注意が必要です。`,
      'ko': `${p}괘는 태(金)입니다. 쇠는 맑고 윤택하며 화열과 표현을 상징합니다. 태의 사람은 사교적이고 낙관적입니다. 구강, 목, 폐 건강에 주의가 필요합니다.`,
    },
    '艮': {
      'zh-CN': `${p}卦为艮，属土，主静止与安守，土性厚重。艮卦者稳重踏实、知止有度，善于守住成果，需注意脾胃及关节骨骼。`,
      'en': `The ${p} Trigram is Gen (Earth), representing stillness and preservation. Earth is solid. Gen people are steady, grounded, and good at preserving achievements. Pay attention to spleen, stomach, and joint health.`,
      'ja': `${p}卦は艮（土）。土は厚重で、静止と安守を象徴します。艮の人は安定感があり、成果を守ることに長けます。脾胃と関節・骨格に注意が必要です。`,
      'ko': `${p}괘는 간(土)입니다. 흙은 무겁고 두터우며 정지와 안수를 상징합니다. 간의 사람은 안정적이고 성과를 잘 보존합니다. 비위와 관절 건강에 주의가 필요합니다.`,
    },
    '离': {
      'zh-CN': `${p}卦为离，属火，主光明与文明，火性炎上。离卦者热情明亮、审美出众，充满魅力与感染力，需注意心火、眼目及血液循环。`,
      'en': `The ${p} Trigram is Li (Fire), representing brilliance and culture. Fire blazes upward. Li people are passionate, creative, and charismatic. Pay attention to heart, eyes, and blood circulation.`,
      'ja': `${p}卦は離（火）。火は炎上し、光明と文明を象徴します。離の人は情熱的で美的感覚に優れ、心臓・目・血液循環に注意が必要です。`,
      'ko': `${p}괘는 이(火)입니다. 불은 위로 타오르며 광명과 문명을 상징합니다. 이의 사람은 열정적이고 미적 감각이 뛰어납니다. 심장, 눈, 혈액순환에 주의가 필요합니다.`,
    },
  };
  const entry = m[guaName];
  if (entry && entry[lang]) return entry[lang];
  return entry?.['zh-CN'] ?? `${p}卦为${guaName}，属${wx}，需结合具体卦象深入分析。`;
}

function parsePillar(pillar: string): { stem: string; branch: string } | null {
  if (pillar.length < 2) return null;
  return { stem: pillar[0], branch: pillar.slice(1) };
}

function getNum(c: string): number { return STEM_NUMBER_MAP[c] ?? 0; }

export function calculateHeluo(
  yg: string, mg: string, dg: string, hg: string, isMale: boolean = true, lang: string = 'zh-CN',
): HeluoResult {
  const calc = (p: string): number => {
    const parsed = parsePillar(p);
    if (!parsed) return 0;
    return getNum(parsed.stem) + getNum(parsed.branch);
  };
  const yearNum = calc(yg), monthNum = calc(mg), dayNum = calc(dg), hourNum = calc(hg);
  const totalNum = yearNum + monthNum + dayNum + hourNum;
  const rem = totalNum % 8;
  const xtMap = isMale ? MALE_XIANTIAN : FEMALE_XIANTIAN;
  const xt = xtMap[rem];
  const ht = getHoutianGua(rem, isMale);
  return {
    yearNum, monthNum, dayNum, hourNum, totalNum,
    xiantianGua: xt.name, houtianGua: ht.name,
    xiantianWx: xt.wx, houtianWx: ht.wx,
    wuxingAnalysis: `${genAnalysis(xt.name, xt.wx, true, lang)}\n${genAnalysis(ht.name, ht.wx, false, lang)}`,
  };
}
