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

function genAnalysis(guaName: string, wx: string, isXiantian: boolean): string {
  const p = isXiantian ? '先天' : '后天';
  const m: Record<string,string> = {
    '坎':`${p}卦为坎，属水，主智慧与险陷，水性润下。坎卦者心思缜密，善于在逆境中寻机，一生需注意肾水、耳部健康。`,
    '坤':`${p}卦为坤，属土，主柔顺与包容，土性稼穑。坤卦者敦厚诚信、包容万物，有大地般的承载精神，需注意脾胃消化系统。`,
    '震':`${p}卦为震，属木，主行动与进取，木性曲直。震卦者行动力强、敢作敢为，有开拓创新之勇，需注意肝胆及筋骨保养。`,
    '巽':`${p}卦为巽，属木，主渗透与谦逊，木性柔和。巽卦者善于适应环境、以柔克刚，有良好的沟通能力，需注意肝胆及呼吸系统。`,
    '乾':`${p}卦为乾，属金，主刚健与创造，金性从革。乾卦者刚健中正、有领导力与决断力，事业心强，需注意肺金及大肠健康。`,
    '兑':`${p}卦为兑，属金，主和悦与表达，金性清润。兑卦者擅长交流、人缘佳、乐观开朗，需注意口舌咽喉及肺金保养。`,
    '艮':`${p}卦为艮，属土，主静止与安守，土性厚重。艮卦者稳重踏实、知止有度，善于守住成果，需注意脾胃及关节骨骼。`,
    '离':`${p}卦为离，属火，主光明与文明，火性炎上。离卦者热情明亮、审美出众，充满魅力与感染力，需注意心火、眼目及血液循环。`,
  };
  return m[guaName] ?? `${p}卦为${guaName}，属${wx}，需结合具体卦象深入分析。`;
}

function parsePillar(pillar: string): { stem: string; branch: string } | null {
  if (pillar.length < 2) return null;
  return { stem: pillar[0], branch: pillar.slice(1) };
}

function getNum(c: string): number { return STEM_NUMBER_MAP[c] ?? 0; }

export function calculateHeluo(
  yg: string, mg: string, dg: string, hg: string, isMale: boolean = true,
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
    wuxingAnalysis: `${genAnalysis(xt.name, xt.wx, true)}\n${genAnalysis(ht.name, ht.wx, false)}`,
  };
}
