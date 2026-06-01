// ============================================================
// ai-analysis.ts — AI Analysis Configuration
// ============================================================

export interface AnalysisDimension {
  key: string;
  label: string;
  icon: string;
  free: boolean;
  generate: (data?: unknown) => string;
}

export const analysisDimensions: AnalysisDimension[] = [
  // FREE (5)
  {
    key:'overallReading',label:'整体解读',icon:'🔮',free:true,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `基于${(data as Record<string,unknown>).name}的信息，` : '';
      return `${h}正在进行整体命盘解读分析中，请稍候...\n\n结合紫微斗数与八字命理的交叉视角，将对您的人生格局、性格特质、运势走向进行全面解析。AI将深入分析命盘中各宫位星曜互动关系，结合五行生克制化原理，为您呈现一幅完整的命运画卷。`;
    },
  },
  {
    key:'personality',label:'性格分析',icon:'🧠',free:true,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `针对${(data as Record<string,unknown>).name}的命盘，` : '';
      return `${h}正在进行性格特质深度分析中，请稍候...\n\n通过对命宫主星、三方四正以及八字十神的综合分析，AI将从多维度揭示您的先天性格特征、思维模式、情绪倾向以及行为模式。了解自己的性格优势与潜在挑战，是实现自我成长的第一步。`;
    },
  },
  {
    key:'career',label:'事业运势',icon:'💼',free:true,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `根据${(data as Record<string,unknown>).name}的官禄宫与财帛宫配置，` : '';
      return `${h}正在进行事业运势分析中，请稍候...\n\nAI将从官禄宫星曜分布、事业宫三方四正、八字正官七杀格局等角度，分析您的职业发展方向、职场贵人运、创业时机以及行业适配度。事业如逆水行舟，知命方能顺势而为。`;
    },
  },
  {
    key:'relationship',label:'情感关系',icon:'💕',free:true,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `针对${(data as Record<string,unknown>).name}的夫妻宫与福德宫，` : '';
      return `${h}正在进行情感关系深度解读中，请稍候...\n\n通过分析夫妻宫星曜组合、桃花星曜影响、八字配偶星等维度，AI将为您揭示情感模式、婚姻缘分、家庭关系以及人际交往中的潜在趋势。知命惜缘，方得长久。`;
    },
  },
  {
    key:'health',label:'健康分析',icon:'💪',free:true,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `根据${(data as Record<string,unknown>).name}的疾厄宫及八字五行平衡状况，` : '';
      return `${h}正在进行身体健康与养生指导分析中，请稍候...\n\n结合疾厄宫星曜配置、五行过旺或不及之处、大运流年对身体的影响，AI将给出针对性的养生建议、需注意的健康隐患以及适合的调理方向。防患于未然，健康是福。`;
    },
  },

  // VIP ONLY (4)
  {
    key:'wealthFortune',label:'财富格局',icon:'💰',free:false,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `针对${(data as Record<string,unknown>).name}的财帛宫、田宅宫及八字财星配置，` : '';
      return `${h}正在进行财富格局深度分析中，请稍候...【VIP专属】\n\n此项分析涵盖正财偏财格局、财库开启时机、投资理财方向建议、不动产运势以及财富积累的关键年份。结合紫微斗数财星分布与八字财官格局，为您描绘详细的财富蓝图。`;
    },
  },
  {
    key:'tenYearLuck',label:'十年大运',icon:'📈',free:false,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `根据${(data as Record<string,unknown>).name}的命盘大限流转，` : '';
      return `${h}正在进行十年大运流转分析中，请稍候...【VIP专属】\n\n通过分析紫微斗数各十年大限的宫位变化与星曜入度，结合八字大运干支与五行的生克关系，AI将为您揭示未来十年中事业、财运、感情、健康等各方面的走势与关键转折点。`;
    },
  },
  {
    key:'yearlyGuide',label:'流年指引',icon:'🗓️',free:false,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `针对${(data as Record<string,unknown>).name}的当年流年运势，` : '';
      return `${h}正在进行流年运势详细分析中，请稍候...【VIP专属】\n\n结合流年天干地支与命盘十二宫的互动关系、太岁冲合、流年星曜入宫等情况，AI将为您逐月分析当年的吉凶事项、重大机遇、注意事项以及趋吉避凶的具体建议。`;
    },
  },
  {
    key:'fengshuiAdvice',label:'风水建议',icon:'🏠',free:false,
    generate:(data?: unknown) => {
      const h = data && typeof data === 'object' && (data as Record<string,unknown>).name
        ? `根据${(data as Record<string,unknown>).name}的命盘五行喜忌，` : '';
      return `${h}正在进行个性化风水布局建议分析中，请稍候...【VIP专属】\n\n基于您的命盘五行喜忌、当前大运流年的气场变化，AI将提供居家风水布局建议、办公环境调整方案、吉方位指引以及五行补益的具体措施。天人合一，环境即命运。`;
    },
  },
];

export function getAnalysisDimension(key: string): AnalysisDimension | undefined {
  return analysisDimensions.find(d => d.key === key);
}

export function getFreeDimensions(): AnalysisDimension[] {
  return analysisDimensions.filter(d => d.free);
}

export function getVipDimensions(): AnalysisDimension[] {
  return analysisDimensions.filter(d => !d.free);
}
