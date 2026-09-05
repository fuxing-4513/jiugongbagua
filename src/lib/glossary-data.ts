// ============================================================
// glossary-data.ts — Comprehensive Glossary for 紫微斗数、八字、易经、黄历
// ============================================================

export interface GlossaryTerm {
  slug: string;
  name: string;
  pinyin: string;
  english: string;
  category: GlossaryCategory;
  shortDesc: string;
  detail: string;
  related?: string[];
}

export type GlossaryCategory = 'ziwei' | 'bazi' | 'yijing' | 'huangli' | 'qimen' | 'liuren' | 'fengshui' | 'xiangshu' | 'liuyao' | 'daoxue' | 'xingming' | 'zexuan' | 'zhongyi' | 'meng' | 'zhanxing'

export const categoryMeta: Record<GlossaryCategory, {
  emoji: string;
  name: string;
  desc: string;
  color: string;
}> = {
  ziwei: {
    emoji: '🌟',
    name: '紫微斗数',
    desc: '紫微斗数是中国传统命理学的重要流派，以出生年月日时排出十二宫星曜盘，通过星曜的庙旺利陷及各宫互动来推断人一生的吉凶祸福。',
    color: '#7B2D8B',
  },
  bazi: {
    emoji: '☯️',
    name: '八字命理',
    desc: '八字又称四柱命理，以出生年月日时的天干地支组成四柱八字，通过五行生克制化、十神关系来推算命运走势。',
    color: '#1A5276',
  },
  yijing: {
    emoji: '📜',
    name: '易经八卦',
    desc: '易经是中国最古老的哲学经典，以阴阳爻组成八卦，八卦重叠为六十四卦，揭示宇宙万物变化的规律。',
    color: '#B8860B',
  },
  huangli: {
    emoji: '📅',
    name: '黄历节气',
    desc: '黄历融合了农历、二十四节气、干支纪年等传统时间体系，指导农事生产并影响日常择日、祭祀等民俗活动。',
    color: '#2E7D32',
  },
  qimen: {
    emoji: '🧭', name: '奇门遁甲',
    desc: '奇门遁甲以洛书九宫为框架，融合八门、九星、八神与三奇六仪，用于方位决策与时辰择吉。',
    color: '#B8860B',
  },
  liuren: {
    emoji: '🕯️', name: '六壬',
    desc: '六壬以月将加时起天地盘十二神将断吉凶——古传三式之一。',
    color: '#2E8B57',
  },
  fengshui: {
    emoji: '🏔️', name: '风水堪舆',
    desc: '风水（堪舆）以龙穴砂水与理气挨星为核心，研究环境与人的关系。',
    color: '#556B2F',
  },
  xiangshu: {
    emoji: '👤', name: '相术',
    desc: '相术包括面相、手相、骨相——以形态气色观人禀性的传统术。',
    color: '#8B4513',
  },
  liuyao: {
    emoji: '🪙', name: '六爻纳甲',
    desc: '六爻（纳甲筮法）以钱代蓍起卦，配干支六亲六神断吉凶。',
    color: '#D2691E',
  },
  daoxue: {
    emoji: '☯️', name: '道学丹道',
    desc: '道家哲学与内丹修炼术语——精气神、性命、周天火候等。',
    color: '#708090',
  },
  xingming: {
    emoji: '📛', name: '姓名学',
    desc: '以汉字笔画五行与三才配置论姓名吉凶的现代民俗应用。',
    color: '#B8860B',
  },
  zexuan: {
    emoji: '📅', name: '择日',
    desc: '择吉术——建除十二神、二十八宿、神煞与日用吉凶。',
    color: '#CD853F',
  },
  zhongyi: {
    emoji: '🌿', name: '中医运气',
    desc: '中医基础与五运六气术语——藏象、经络、阴阳五行的医学应用。',
    color: '#3CB371',
  },
  meng: {
    emoji: '🌙', name: '梦占',
    desc: '中国古代梦占文化——梦书传统与解梦方法。',
    color: '#6A5ACD',
  },
  zhanxing: {
    emoji: '🔮', name: '星占',
    desc: '传统星占（七政四余/二十八宿）与西方占星术语。',
    color: '#9370DB',
  },
};

export const allTerms: GlossaryTerm[] = [
  // ===== 紫微斗数 (24) =====
  {slug:'ziwei-xing',name:'紫微星',pinyin:'Zǐ Wēi Xīng',english:'Emperor Star',category:'ziwei',shortDesc:'斗数十四主星之首，为北斗帝星，化气为尊，统领全局。',detail:'紫微星是紫微斗数中最尊贵的主星，属阴土，为北斗帝王之星，化气为尊。紫微坐命者通常具有领导气质与高贵风范，自尊心强，有掌控全局的能力。紫微喜逢左辅右弼，能增加助力与权威；畏煞星冲破，恐孤傲寡助。',related:['tianfu-xing','tianxiang-xing']},
  {slug:'tianji-xing',name:'天机星',pinyin:'Tiān Jī Xīng',english:'Strategist Star',category:'ziwei',shortDesc:'南斗益算之星，化气为善，主智慧谋略。',detail:'天机星为南斗第一星，属阴木，化气为善，代表智慧、谋略与应变能力。天机坐命者思维敏捷，善于分析和策划，但有时因思虑过多而举棋不定。天机喜欢与文昌文曲同度，能增强其学术与策划的天赋。',related:['taiyang-xing','jumen-xing']},
  {slug:'taiyang-xing',name:'太阳星',pinyin:'Tài Yáng Xīng',english:'Sun Star',category:'ziwei',shortDesc:'中天太阳星，化气为贵，主光明博爱。',detail:'太阳星属阳火，为日之精，化气为贵，主光明磊落、博爱奉献之性。太阳坐命者性情开朗大度，乐于助人，但有时过于直率。太阳在庙旺宫位（寅卯辰巳午）光芒万丈；落陷则有心无力，须防虚名。',related:['taiyin-xing','tianliang-xing']},
  {slug:'wuqu-xing',name:'武曲星',pinyin:'Wǔ Qǔ Xīng',english:'Finance Star',category:'ziwei',shortDesc:'北斗武曲星，化气为财，主刚毅决断。',detail:'武曲星属阴金，为北斗第六星，化气为财，性格刚毅果决、务实重利。武曲坐命者执行力强，适合金融、军警等需要决断力的领域。武曲喜遇天相天府则财源稳定；忌逢破军则起伏过大。',related:['qisha-xing','tanlang-xing']},
  {slug:'tiantong-xing',name:'天同星',pinyin:'Tiān Tóng Xīng',english:'Harmony Star',category:'ziwei',shortDesc:'南斗益寿之星，化气为福，主温和享乐。',detail:'天同星属阳水，为南斗第四星，化气为福，性情温和、善解人意且重视生活情趣。天同坐命者通常人缘好、不喜争斗，但有时过于安逸缺乏进取心。天同喜会文昌文曲，增添才艺气质，利于艺术创作。',related:['tianfu-xing','tianliang-xing']},
  {slug:'lianzhen-xing',name:'廉贞星',pinyin:'Lián Zhēn Xīng',english:'Integrity Star',category:'ziwei',shortDesc:'北斗廉贞星，化气为囚，主刚烈操守。',detail:'廉贞星属阴火，为北斗第五星，化气为囚，性格刚烈正直、重情义与操守。廉贞坐命者嫉恶如仇，做事认真执着，但性情容易走极端。廉贞在庙旺宫位主清廉公正，落陷则易自困牢笼、行事偏执。',related:['wuqu-xing','tanlang-xing']},
  {slug:'tianfu-xing',name:'天府星',pinyin:'Tiān Fǔ Xīng',english:'Treasury Star',category:'ziwei',shortDesc:'南斗天府星，化气为库，主包容安定。',detail:'天府星属阳土，为南斗主星之一，化气为库，性格稳重包容、善于积累与守成。天府坐命者通常心胸开阔、待人大方且有理财天赋。天府喜得左右夹辅，库藏丰厚；不喜空劫冲破，财来财去。',related:['ziwei-xing','tianxiang-xing']},
  {slug:'taiyin-xing',name:'太阴星',pinyin:'Tài Yīn Xīng',english:'Moon Star',category:'ziwei',shortDesc:'中天太阴星，化气为富，主阴柔内敛。',detail:'太阴星属阴水，为月之精，化气为富，代表阴柔之美、内敛含蓄与房产财富。太阴坐命者情感细腻、善解人意，适合从事需要美感与共情的工作。太阴喜在酉戌亥子庙旺，清辉照人；在卯辰巳午落陷则光彩不显。',related:['taiyang-xing','tianji-xing']},
  {slug:'tanlang-xing',name:'贪狼星',pinyin:'Tān Láng Xīng',english:'Desire Star',category:'ziwei',shortDesc:'北斗贪狼星，化气为桃花，主才艺欲望。',detail:'贪狼星属阳木兼带阴水，为北斗第一星，化气为桃花，性格外向活泼、多才多艺且欲望强烈。贪狼坐命者擅长社交应酬，艺术感知力强，但须提防沉迷酒色物欲。贪狼喜遇火星铃星则爆发力强，在辰戌入庙最佳。',related:['lianzhen-xing','posun-xing']},
  {slug:'jumen-xing',name:'巨门星',pinyin:'Jù Mén Xīng',english:'Great Gate Star',category:'ziwei',shortDesc:'北斗巨门星，化气为暗，主口才是非。',detail:'巨门星属阴水，为北斗第二星，化气为暗，代表口才、辩论能力但也主口舌是非。巨门坐命者言辞犀利、善于分析批判，适合法律、咨询等需要口才的职业。巨门最喜化禄化权化解其暗昧之性，忌独坐无吉辅。',related:['tianji-xing','tianliang-xing']},
  {slug:'tianxiang-xing',name:'天相星',pinyin:'Tiān Xiàng Xīng',english:'Minister Star',category:'ziwei',shortDesc:'南斗天相星，化气为印，主辅佐服务。',detail:'天相星属阳水，为南斗第五星，化气为印，性格温良谦和、善于协调辅佐。天相坐命者做事谨慎有条理，是天生的行政与服务人才。天相喜与紫微、天府同度或会照，能得其扶持而发挥辅佐之长。',related:['tianfu-xing','ziwei-xing']},
  {slug:'tianliang-xing',name:'天梁星',pinyin:'Tiān Liáng Xīng',english:'Blessing Star',category:'ziwei',shortDesc:'南斗天梁星，化气为荫，主长寿庇佑。',detail:'天梁星属阳土，为南斗第二星，化气为荫，代表长寿、庇护与成熟稳重之性。天梁坐命者有长者风范，喜助人为乐，有逢凶化吉之福。天梁在午宫庙旺光芒最显，在巳宫亦佳；不喜逢空劫则荫力不足。',related:['tiantong-xing','taiyang-xing']},
  {slug:'qisha-xing',name:'七杀星',pinyin:'Qī Shā Xīng',english:'Seven Killings Star',category:'ziwei',shortDesc:'南斗七杀星，化气为将，主刚猛勇武。',detail:'七杀星属阴金，为南斗第六星，化气为将星，性格刚猛果断、敢作敢为且勇于开拓。七杀坐命者有将帅之风，适合军警、竞技、创业等需要魄力的领域。七杀喜遇紫微则威权有制，忌独坐无制则刚折易败。',related:['posun-xing','tanlang-xing']},
  {slug:'posun-xing',name:'破军星',pinyin:'Pò Jūn Xīng',english:'Army Breaker Star',category:'ziwei',shortDesc:'北斗破军星，化气为耗，主破旧立新。',detail:'破军星属阴水，为北斗第七星，化气为耗，代表破坏与重建、革命与创新。破军坐命者个性鲜明、不喜束缚，有破釜沉舟的勇气。破军喜遇禄存则能先破后立，有所成就；忌逢空劫则破而不立。',related:['qisha-xing','tanlang-xing']},
  {slug:'ming-palace',name:'命宫',pinyin:'Mìng Gōng',english:'Life Palace',category:'ziwei',shortDesc:'命盘中心宫位，代表一生命运之根基。',detail:'命宫是紫微斗数十二宫的核心，根据出生月时逆数安宫，代表一个人的先天禀赋、性格特质与整体命运走向。命宫若得吉星庙旺坐守，一生福泽深厚；如有煞星冲破，则须以三方四正之吉星化解。',related:['jie-palace','fuqi-palace']},
  {slug:'fumu-palace',name:'父母宫',pinyin:'Fù Mǔ Gōng',english:'Parents Palace',category:'ziwei',shortDesc:'主父母缘份、长辈关系与师承造化。',detail:'父母宫代表与父母及长辈的缘分深浅、家庭教养环境以及师长提携的机遇。父母宫吉星汇聚者，多受父母宠爱与良好教育；若有恶煞刑忌冲照，则父母缘薄或有代沟。',related:['ming-palace','fude-palace']},
  {slug:'fude-palace',name:'福德宫',pinyin:'Fú Dé Gōng',english:'Fortune Palace',category:'ziwei',shortDesc:'主精神世界、福报享受与内在安宁。',detail:'福德宫反映一个人的精神生活、品味追求、福报深浅以及晚年安乐程度。福德宫吉则心态乐观、享受人生；凶则精神焦虑、难以安享福报。天同、天府入福德宫尤为吉祥。',related:['ming-palace','tianzhai-palace']},
  {slug:'tianzhai-palace',name:'田宅宫',pinyin:'Tián Zhái Gōng',english:'Property Palace',category:'ziwei',shortDesc:'主房产财运、居家环境与家运兴衰。',detail:'田宅宫掌管不动产运、居家风水、家庭关系以及置产置业的能力。田宅宫得禄存、太阴等富星坐守，多有不俗的房产运；若逢空劫破碎则搬迁频繁、置业艰难。',related:['caibo-palace','fude-palace']},
  {slug:'guanlu-palace',name:'官禄宫',pinyin:'Guān Lù Gōng',english:'Career Palace',category:'ziwei',shortDesc:'主事业成就、官运仕途与职场发展。',detail:'官禄宫又称事业宫，代表学业与事业的发展轨迹、社会地位以及工作成就。紫微、天府、武曲入官禄宫则事业有成；天机、巨门则适合脑力或口才类职业。',related:['ming-palace','caibo-palace']},
  {slug:'qianyi-palace',name:'迁移宫',pinyin:'Qiān Yí Gōng',english:'Travel Palace',category:'ziwei',shortDesc:'主外出运势、远行发展与环境变化。',detail:'迁移宫主一个人在外地发展、旅行迁移及环境变化的吉凶。迁移宫吉则外出有利、四海为家；凶则出门多波折。太阳、天机入迁移宫利于奔波发展型的工作。',related:['ming-palace','guanlu-palace']},
  {slug:'jie-palace',name:'疾厄宫',pinyin:'Jí È Gōng',english:'Health Palace',category:'ziwei',shortDesc:'主身体状况、疾病隐患与健康运势。',detail:'疾厄宫反映一个人的先天体质、易患疾病及意外伤害的倾向。吉星守疾厄则身体健康少病；恶煞聚集则须注意相应脏腑的健康管理。廉贞、七杀入疾厄宫须防血光之灾。',related:['ming-palace','fude-palace']},
  {slug:'caibo-palace',name:'财帛宫',pinyin:'Cái Bó Gōng',english:'Wealth Palace',category:'ziwei',shortDesc:'主财运收入、理财能力与财富格局。',detail:'财帛宫代表赚钱能力、收入来源以及金钱管理的态度与智慧。武曲、太阴、天府入财帛宫财源广进；贪狼入财帛宫则财来财去，须守成克制。',related:['guanlu-palace','tianzhai-palace']},
  {slug:'zinv-palace',name:'子女宫',pinyin:'Zǐ Nǚ Gōng',english:'Children Palace',category:'ziwei',shortDesc:'主子嗣缘分、晚辈关系与生育能力。',detail:'子女宫不仅管子女数量与缘分，也代表学生、下属以及创造力与才艺发挥。子女宫吉则子女孝顺有成；凶则子息艰难或与晚辈关系紧张。天同、天梁入子女宫主子女温顺。',related:['fumu-palace','fuqi-palace']},
  {slug:'fuqi-palace',name:'夫妻宫',pinyin:'Fū Qī Gōng',english:'Spouse Palace',category:'ziwei',shortDesc:'主婚姻缘分、配偶品性与感情走势。',detail:'夫妻宫代表婚姻对象的品性、外貌以及夫妻关系的和谐程度。吉星聚夫妻宫则婚姻美满；煞星冲破则感情多波折。太阳入夫妻宫主配偶光明磊落，太阴则主配偶温柔体贴。',related:['ming-palace','zinv-palace']},

  // ===== 八字 (32) — 10天干 =====
  {slug:'jia-stem',name:'甲',pinyin:'Jiǎ',english:'Yang Wood (Jia)',category:'bazi',shortDesc:'十天干之首，阳木，如参天大树，为栋梁之材。',detail:'甲木为十天干第一位，属阳木，五行为木，方位为东。甲木之性如参天大树，刚直不阿、积极向上，有领袖气质与开拓精神。甲木喜庚金雕琢成器，喜癸水滋润根基。春季甲木得令最旺。',related:['yi-stem','yin-branch']},
  {slug:'yi-stem',name:'乙',pinyin:'Yǐ',english:'Yin Wood (Yi)',category:'bazi',shortDesc:'阴木，如花草藤蔓，柔韧而有生机。',detail:'乙木为十天干第二位，属阴木，如花草藤蔓之柔，善于攀附与适应环境。乙木之人性情柔和细腻、善于变通，有艺术审美天赋。乙木喜丙火照暖花开，喜癸水滋养灌溉。',related:['jia-stem','mao-branch']},
  {slug:'bing-stem',name:'丙',pinyin:'Bǐng',english:'Yang Fire (Bing)',category:'bazi',shortDesc:'阳火，如烈日当空，光明热烈奔放。',detail:'丙火为十天干第三位，属阳火，如太阳之火炽烈光明，赋予人热情开朗、积极进取的性格。丙火之人光明磊落、乐于奉献，但有时过于急燥。丙火喜壬水既济调候，忌癸水云雾遮蔽。',related:['ding-stem','wu-branch']},
  {slug:'ding-stem',name:'丁',pinyin:'Dīng',english:'Yin Fire (Ding)',category:'bazi',shortDesc:'阴火，如灯烛星光，内敛持久有韧性。',detail:'丁火为十天干第四位，属阴火，如灯烛之星火，虽光芒不烈但持久不灭。丁火之人城府较深、心思缜密，善于以柔克刚。丁火喜甲木为薪不断燃续，忌癸水扑灭火光。',related:['bing-stem','si-branch']},
  {slug:'wu-stem',name:'戊',pinyin:'Wù',english:'Yang Earth (Wu)',category:'bazi',shortDesc:'阳土，如城墙厚土，沉稳厚重可承载。',detail:'戊土为十天干第五位，属阳土，如城墙堤坝之厚重，性格沉稳务实、诚信可靠。戊土之人有包容心与担当精神，但有时过于固执保守。戊土喜甲木疏土以防板结，喜癸水润泽。',related:['ji-stem','chen-branch']},
  {slug:'ji-stem',name:'己',pinyin:'Jǐ',english:'Yin Earth (Ji)',category:'bazi',shortDesc:'阴土，如田园湿土，柔和滋养万物生。',detail:'己土为十天干第六位，属阴土，如田园之土柔和湿润，善育万物。己土之人性情温顺、乐于助人，有培育他人的耐心。己土喜丙火暖土以增生机，喜甲木疏土以防淤滞。',related:['wu-stem','wei-branch']},
  {slug:'geng-stem',name:'庚',pinyin:'Gēng',english:'Yang Metal (Geng)',category:'bazi',shortDesc:'阳金，如刀剑利刃，刚强锐利有决断。',detail:'庚金为十天干第七位，属阳金，如刀斧钢铁之坚硬，性格刚毅果断、执行力强。庚金之人重义气、讲原则，但有时过于冷硬不近人情。庚金喜丁火锻炼成器，喜壬水淘洗焕发。',related:['xin-stem','shen-branch']},
  {slug:'xin-stem',name:'辛',pinyin:'Xīn',english:'Yin Metal (Xin)',category:'bazi',shortDesc:'阴金，如金银珠玉，精致华美敏感细腻。',detail:'辛金为十天干第八位，属阴金，如金银珠宝之精美，代表细腻、高贵与完美主义。辛金之人追求精致生活，有审美品味与艺术才华，但有时过于敏感挑剔。辛金喜壬水淘洗发光，忌厚土埋金。',related:['geng-stem','you-branch']},
  {slug:'ren-stem',name:'壬',pinyin:'Rén',english:'Yang Water (Ren)',category:'bazi',shortDesc:'阳水，如江河湖海，奔放豪迈善变通。',detail:'壬水为十天干第九位，属阳水，如江河奔流之势，性格豪迈大气、聪明善变、适应力极强。壬水之人思维活跃、见多识广，但有时过于随性不羁。壬水喜戊土筑堤引导以成江河，喜庚金发源。',related:['gui-stem','hai-branch']},
  {slug:'gui-stem',name:'癸',pinyin:'Guǐ',english:'Yin Water (Gui)',category:'bazi',shortDesc:'阴水，如雨露甘泉，细腻柔韧润物无声。',detail:'癸水为十天干第十位，属阴水，如雨露泉水之温柔细腻，善润万物而不争。癸水之人直觉敏锐、心思细腻，有很强的共情能力与灵性。癸水喜乙木引化滋润万物，忌戊土堵塞源泉。',related:['ren-stem','zi-branch']},

  // ===== 八字 — 12地支 =====
  {slug:'zi-branch',name:'子',pinyin:'Zǐ',english:'Rat (Zi)',category:'bazi',shortDesc:'地支之首，属阳水，藏癸水，生肖鼠。',detail:'子为十二地支之首，五行属水，方位正北，月份为冬月（十一月）。子中独藏癸水，水气最为纯粹。子水之人聪明机敏、善于思考，但有时多疑不定。子与午相冲，与丑相合。',related:['gui-stem','wu-branch']},
  {slug:'chou-branch',name:'丑',pinyin:'Chǒu',english:'Ox (Chou)',category:'bazi',shortDesc:'地支第二位，属阴土，藏己癸辛，生肖牛。',detail:'丑为十二地支第二位，五行属湿土，方位东北偏北，月份为腊月。丑中藏己土、癸水、辛金，为金库之地。丑土之人踏实勤恳、节俭持家，但有时固执己见。丑与未相冲，与子相合。',related:['ji-stem','wei-branch']},
  {slug:'yin-branch',name:'寅',pinyin:'Yín',english:'Tiger (Yin)',category:'bazi',shortDesc:'地支第三位，属阳木，藏甲丙戊，生肖虎。',detail:'寅为十二地支第三位，五行属阳木，方位东北偏东，月份为正月。寅中藏甲木、丙火、戊土，为火之长生。寅木之人朝气蓬勃、勇于开拓，有领导能力。寅与申相冲，与亥相合。',related:['jia-stem','shen-branch']},
  {slug:'mao-branch',name:'卯',pinyin:'Mǎo',english:'Rabbit (Mao)',category:'bazi',shortDesc:'地支第四位，属阴木，藏乙木，生肖兔。',detail:'卯为十二地支第四位，五行属阴木，方位正东，月份为二月。卯中独藏乙木，木气最为纯粹，为花草柔木之乡。卯木之人为人温和、心思细腻，有艺术审美气质。卯与酉相冲，与戌相合。',related:['yi-stem','you-branch']},
  {slug:'chen-branch',name:'辰',pinyin:'Chén',english:'Dragon (Chen)',category:'bazi',shortDesc:'地支第五位，属阳土，藏乙戊癸，生肖龙。',detail:'辰为十二地支第五位，五行属湿土，方位东南偏东，月份为三月。辰中藏乙木、戊土、癸水，为水库之地。辰土之人胸怀大志、气度不凡，但有时好高骛远。辰与戌相冲，与酉相合。',related:['wu-stem','xu-branch']},
  {slug:'si-branch',name:'巳',pinyin:'Sì',english:'Snake (Si)',category:'bazi',shortDesc:'地支第六位，属阴火，藏丙戊庚，生肖蛇。',detail:'巳为十二地支第六位，五行属阴火，方位东南偏南，月份为四月。巳中藏丙火、戊土、庚金，为金之长生。巳火之人热情灵活、善于交际，但有时心机深沉。巳与亥相冲，与申相合。',related:['ding-stem','hai-branch']},
  {slug:'wu-branch',name:'午',pinyin:'Wǔ',english:'Horse (Wu)',category:'bazi',shortDesc:'地支第七位，属阳火，藏丁己，生肖马。',detail:'午为十二地支第七位，五行属阳火，方位正南，月份为五月。午中藏丁火、己土，火气最为旺盛。午火之人热情奔放、行动力强，但有时冲动急躁。午与子相冲，与未相合。',related:['bing-stem','zi-branch']},
  {slug:'wei-branch',name:'未',pinyin:'Wèi',english:'Goat (Wei)',category:'bazi',shortDesc:'地支第八位，属阴土，藏己丁乙，生肖羊。',detail:'未为十二地支第八位，五行属燥土，方位西南偏南，月份为六月。未中藏己土、丁火、乙木，为木库之地。未土之人温和善良、富有同情心，但有时优柔寡断。未与丑相冲，与午相合。',related:['ji-stem','chou-branch']},
  {slug:'shen-branch',name:'申',pinyin:'Shēn',english:'Monkey (Shen)',category:'bazi',shortDesc:'地支第九位，属阳金，藏庚壬戊，生肖猴。',detail:'申为十二地支第九位，五行属阳金，方位西南偏西，月份为七月。申中藏庚金、壬水、戊土，为水之长生。申金之人机灵聪慧、善于应变，但有时心性不定。申与寅相冲，与巳相合。',related:['geng-stem','yin-branch']},
  {slug:'you-branch',name:'酉',pinyin:'Yǒu',english:'Rooster (You)',category:'bazi',shortDesc:'地支第十位，属阴金，藏辛金，生肖鸡。',detail:'酉为十二地支第十位，五行属阴金，方位正西，月份为八月。酉中独藏辛金，金气最为纯粹，为珠玉玲珑之乡。酉金之人精致优雅、口才出众，但有时过于挑剔。酉与卯相冲，与辰相合。',related:['xin-stem','mao-branch']},
  {slug:'xu-branch',name:'戌',pinyin:'Xū',english:'Dog (Xu)',category:'bazi',shortDesc:'地支第十一位，属阳土，藏戊辛丁，生肖狗。',detail:'戌为十二地支第十一位，五行属燥土，方位西北偏西，月份为九月。戌中藏戊土、辛金、丁火，为火库之地。戌土之人忠诚正直、重信守诺，但有时过于刚硬。戌与辰相冲，与卯相合。',related:['wu-stem','chen-branch']},
  {slug:'hai-branch',name:'亥',pinyin:'Hài',english:'Pig (Hai)',category:'bazi',shortDesc:'地支第十二位，属阴水，藏壬甲，生肖猪。',detail:'亥为十二地支第十二位，五行属阴水，方位西北偏北，月份为十月。亥中藏壬水、甲木，为木之长生。亥水之人聪明灵秀、心地善良，但有时懒散被动。亥与巳相冲，与寅相合。',related:['ren-stem','si-branch']},

  // ===== 八字 — 十神 =====
  {slug:'zhengyin',name:'正印',pinyin:'Zhèng Yìn',english:'Direct Resource',category:'bazi',shortDesc:'生我阴阳异性者为正印，主学业慈爱。',detail:'正印为生日干且阴阳异性之五行，代表学识、母亲、长辈庇佑以及内在修养。正印旺而有情则学业有成、心地仁慈；正印过旺则依赖性过强、缺乏主见。正印喜官杀生印，形成官印相生的良好格局。',related:['pianyin','zhengguan']},
  {slug:'pianyin',name:'偏印',pinyin:'Piān Yìn',english:'Indirect Resource',category:'bazi',shortDesc:'生我阴阳同性者为偏印，主偏门技艺。',detail:'偏印又称枭神，为生日干且阴阳同性之五行，代表偏门技艺、玄学宗教以及非传统教育。偏印旺者有独特的领悟力与创造力，适合研究型工作。但偏印过多则性格孤僻、不合群。',related:['zhengyin','shangguan']},
  {slug:'shangguan',name:'伤官',pinyin:'Shāng Guān',english:'Hurting Officer',category:'bazi',shortDesc:'我生阴阳异性者为伤官，主才华傲气。',detail:'伤官为日干所生且阴阳异性之五行，代表才华、创造力、表达力以及反叛精神。伤官旺者聪明绝顶、艺术天赋出众，但容易恃才傲物、不服管束。伤官喜配印制化，形成伤官配印的贵格。',related:['shishen','zhengyin']},
  {slug:'shishen',name:'食神',pinyin:'Shí Shén',english:'Eating God',category:'bazi',shortDesc:'我生阴阳同性者为食神，主福气安逸。',detail:'食神为日干所生且阴阳同性之五行，代表口福、安逸及创造才华。食神旺者性情温和宽厚、乐于享受生活，有艺术天赋与美食缘。食神喜生财，形成食神生财的富格。',related:['shangguan','zhengcai']},
  {slug:'zhengcai',name:'正财',pinyin:'Zhèng Cái',english:'Direct Wealth',category:'bazi',shortDesc:'我克阴阳异性者为正财，主稳定收入。',detail:'正财为日干所克且阴阳异性之五行，代表稳定的薪资收入、正当财富以及勤俭持家的品格。正财旺者踏实守信、重视物质保障，善于理财积累。正财喜食神相生，忌比劫争财。',related:['piancai','shishen']},
  {slug:'piancai',name:'偏财',pinyin:'Piān Cái',english:'Indirect Wealth',category:'bazi',shortDesc:'我克阴阳同性者为偏财，主意外横财。',detail:'偏财为日干所克且阴阳同性之五行，代表意外之财、投资获利以及慷慨大方的性格。偏财旺者善于抓住商机、有经商头脑，但花钱也大手大脚。偏财喜食伤相生，格局清纯则成富裕之人。',related:['zhengcai','shangguan']},
  {slug:'zhengguan',name:'正官',pinyin:'Zhèng Guān',english:'Direct Officer',category:'bazi',shortDesc:'克我阴阳异性者为正官，主官运名望。',detail:'正官为克日干且阴阳异性之五行，代表官职、法律、规范以及社会地位。正官旺而有情则为人正直、遵纪守法、仕途顺利。正官喜印星护官，形成官印相生；忌伤官克官则官位不稳。',related:['qisha','zhengyin']},
  {slug:'qisha',name:'七杀',pinyin:'Qī Shā',english:'Seven Killings',category:'bazi',shortDesc:'克我阴阳同性者为七杀，主威权魄力。',detail:'七杀又称偏官，为克日干且阴阳同性之五行，代表权威、魄力、竞争以及压力挑战。七杀旺者有将帅之才、执行力强，但压力大易冲动。七杀喜食神制杀或印星化杀，形成杀邀食制或杀印相生的贵格。',related:['zhengguan','shishen']},
  {slug:'bijian',name:'比肩',pinyin:'Bǐ Jiān',english:'Companion',category:'bazi',shortDesc:'同我者为比肩，主兄弟朋友助力。',detail:'比肩为与日干五行相同、阴阳相同者，代表兄弟姐妹、同辈朋友以及自我意识。比肩旺者独立自主、自尊心强，但容易自我中心。比肩过多则有争财夺利之象，喜官杀制比护财。',related:['jiecai','zhengcai']},
  {slug:'jiecai',name:'劫财',pinyin:'Jié Cái',english:'Rob Wealth',category:'bazi',shortDesc:'同我阴阳异性者为劫财，主竞争耗财。',detail:'劫财为与日干五行相同、阴阳相异者，代表竞争、破耗以及社交网络。劫财旺者行动力强、社交广泛，但容易冲动消费或受人拖累。劫财喜官杀制约，忌与正财同现则财来财去。',related:['bijian','piancai']},

  // ===== 易经 (10) =====
  {slug:'qian-trigram',name:'乾',pinyin:'Qián',english:'Heaven Trigram (☰)',category:'yijing',shortDesc:'八卦之首，三爻纯阳，象天，代表刚健创造。',detail:'乾卦为八卦之首，由三个阳爻（☰）组成，象征天、父、君、刚健与创造力。《说卦传》言「乾为天、为圜、为君、为父」，代表元亨利贞四德。乾卦之德在于自强不息，启示人当效法天道，刚健进取而不懈怠。',related:['kun-trigram','yang-yao']},
  {slug:'kun-trigram',name:'坤',pinyin:'Kūn',english:'Earth Trigram (☷)',category:'yijing',shortDesc:'八卦之二，三爻纯阴，象地，代表柔顺包容。',detail:'坤卦由三个阴爻（☷）组成，象征地、母、臣民、柔顺与包容。《说卦传》言「坤为地、为母、为布、为釜」，代表厚德载物之德。坤卦之德在于厚德载物，启示人以柔顺之道承载万物、宽厚待人。',related:['qian-trigram','yin-yao']},
  {slug:'zhen-trigram',name:'震',pinyin:'Zhèn',english:'Thunder Trigram (☳)',category:'yijing',shortDesc:'一阳在下，象雷，代表震动奋发。',detail:'震卦由一阳爻在下两阴爻在上（☳）组成，象征雷、长男、行动与震动。《说卦传》言「震为雷、为龙、为玄黄」，代表万物萌动之力。震卦之德在于临危不惧，启迪人在动荡中保持镇定、化惊悸为动力。',related:['xun-trigram','kan-trigram']},
  {slug:'xun-trigram',name:'巽',pinyin:'Xùn',english:'Wind Trigram (☴)',category:'yijing',shortDesc:'一阴在下，象风，代表渗透谦逊。',detail:'巽卦由一阴爻在下两阳爻在上（☴）组成，象征风、长女、入、谦逊与传播。《说卦传》言「巽为风、为木、为长女」，代表无孔不入的渗透力。巽卦之德在于谦逊顺受，启迪人当以柔顺之姿应对外界变化。',related:['zhen-trigram','qian-trigram']},
  {slug:'kan-trigram',name:'坎',pinyin:'Kǎn',english:'Water Trigram (☵)',category:'yijing',shortDesc:'一阳陷二阴，象水，代表险陷智慧。',detail:'坎卦由一阳爻陷于两阴爻之中（☵）组成，象征水、中男、险陷与智慧。坎卦上下皆阴中间一阳，代表外虚内实、以柔包刚。坎卦教导人在险境中保持诚信与刚中之德，化险为夷。',related:['li-trigram','zhen-trigram']},
  {slug:'li-trigram',name:'离',pinyin:'Lí',english:'Fire Trigram (☲)',category:'yijing',shortDesc:'一阴陷二阳，象火，代表光明依附。',detail:'离卦由一阴爻陷于两阳爻之中（☲）组成，象征火、中女、明亮、依附与文明。离卦外刚内柔，如火焰必须有依附才能燃烧。离卦之德在于光明正大、文采斐然，启示人当以文明之光照亮内心与外界。',related:['kan-trigram','kun-trigram']},
  {slug:'gen-trigram',name:'艮',pinyin:'Gèn',english:'Mountain Trigram (☶)',category:'yijing',shortDesc:'一阳在上，象山，代表静止安止。',detail:'艮卦由一阳爻在上两阴爻在下（☶）组成，象征山、少男、止、静止与安守。《说卦传》言「艮为山、为径路、为小石」，代表知止不殆的智慧。艮卦教导人当止则止、当行则行，不可贪求过度。',related:['dui-trigram','kun-trigram']},
  {slug:'dui-trigram',name:'兑',pinyin:'Duì',english:'Lake Trigram (☱)',category:'yijing',shortDesc:'一阴在上，象泽，代表喜悦和悦。',detail:'兑卦由一阴爻在上两阳爻在下（☱）组成，象征泽、少女、喜悦、口舌与交流。兑卦外柔内刚，代表以和悦之姿与人沟通交流。兑卦之德在于和悦待人、以言通心，启迪人当以真诚喜悦之心面对世间。',related:['gen-trigram','qian-trigram']},
  {slug:'yin-yao',name:'阴爻',pinyin:'Yīn Yáo',english:'Yin Line (⚋)',category:'yijing',shortDesc:'卦象基本单位，断开的横线，象征柔顺退藏。',detail:'阴爻为易经卦象的基本组成元素，符号为中间断开的横线（⚋），代表阴柔、退藏、被动与接受性。六十四卦的每一爻位皆有阴阳之分，阴爻居偶数位为得位。阴爻过多则柔暗不明，须阳爻配合才能刚柔相济。',related:['yang-yao','kun-trigram']},
  {slug:'yang-yao',name:'阳爻',pinyin:'Yáng Yáo',english:'Yang Line (⚊)',category:'yijing',shortDesc:'卦象基本单位，连续的横线，象征刚健进取。',detail:'阳爻为易经卦象的基本组成元素，符号为一条连续的横线（⚊），代表阳刚、进取、主动与创造性。阳爻居奇数位为得位。阳爻过旺则刚极易折，须阴爻调和才能刚柔并济。',related:['yin-yao','qian-trigram']},

  // ===== 黄历 (24) =====
  {slug:'lichun',name:'立春',pinyin:'Lì Chūn',english:'Start of Spring',category:'huangli',shortDesc:'二十四节气之首，太阳位于黄经315°，春季开始。',detail:'立春为二十四节气之首，通常在公历2月3-5日之间，太阳到达黄经315度。立春标志着春季的开始，万物复苏，东风解冻。民间有咬春、迎春、打春牛等习俗，寓意新的一年农事活动拉开序幕。',related:['yushui','dongzhi']},
  {slug:'yushui',name:'雨水',pinyin:'Yǔ Shuǐ',english:'Rain Water',category:'huangli',shortDesc:'太阳位于黄经330°，降雨开始增多，滋润万物。',detail:'雨水节气在公历2月18-20日之间，太阳到达黄经330度。此时气温回升、冰雪融化、降水增多，故称雨水。雨水节气后草木萌动，农谚有「雨水有雨庄稼好，大春小春一片宝」之说。',related:['lichun','jingzhe']},
  {slug:'jingzhe',name:'惊蛰',pinyin:'Jīng Zhé',english:'Awakening of Insects',category:'huangli',shortDesc:'太阳位于黄经345°，春雷乍动，惊醒冬眠虫兽。',detail:'惊蛰在公历3月5-7日之间，太阳到达黄经345度。春雷始鸣，惊醒蛰伏于地下冬眠的昆虫，故名惊蛰。此时桃花始开，黄鹂鸣叫，农耕进入春耕大忙时节。民间有惊蛰吃梨的习俗，寓意远离疾病。',related:['yushui','chunfen']},
  {slug:'chunfen',name:'春分',pinyin:'Chūn Fēn',english:'Vernal Equinox',category:'huangli',shortDesc:'太阳位于黄经0°，昼夜平分，春意正浓。',detail:'春分在公历3月20-22日之间，太阳到达黄经0度（春分点）。这一天太阳直射赤道，全球昼夜等长各12小时。春分之后北半球昼长夜短，气温继续回升。民间有春分竖蛋、祭日等传统活动。',related:['jingzhe','qingming']},
  {slug:'qingming',name:'清明',pinyin:'Qīng Míng',english:'Clear and Bright',category:'huangli',shortDesc:'太阳位于黄经15°，天清气明，祭祖踏青之时。',detail:'清明在公历4月4-6日之间，太阳到达黄经15度。此时天气清新明朗，万物生长，故称清明。清明既是节气也是传统节日，有扫墓祭祖与踏青郊游两大主题。农谚云「清明前后，种瓜点豆」，是春耕的重要节点。',related:['chunfen','guyu']},
  {slug:'guyu',name:'谷雨',pinyin:'Gǔ Yǔ',english:'Grain Rain',category:'huangli',shortDesc:'太阳位于黄经30°，雨生百谷，春播最后时机。',detail:'谷雨在公历4月19-21日之间，太阳到达黄经30度。谷雨意为雨水滋润五谷生长，是春季最后一个节气。此时降水明显增加，田中的秧苗初插、作物新种，最需要雨水的滋润。民间有谷雨采茶、食香椿的习俗。',related:['qingming','lixia']},
  {slug:'lixia',name:'立夏',pinyin:'Lì Xià',english:'Start of Summer',category:'huangli',shortDesc:'太阳位于黄经45°，夏季开始，万物繁茂生长。',detail:'立夏在公历5月5-7日之间，太阳到达黄经45度。立夏为夏季之始，标志着万物进入旺盛生长期。此时蝼蛄鸣叫、蚯蚓出土。江南地区有立夏尝三新、称体重等民俗，寓意健康度夏。',related:['guyu','xiaoman']},
  {slug:'xiaoman',name:'小满',pinyin:'Xiǎo Mǎn',english:'Grain Buds',category:'huangli',shortDesc:'太阳位于黄经60°，麦类初满未熟，小得盈满。',detail:'小满在公历5月20-22日之间，太阳到达黄经60度。小满意为夏熟作物的籽粒开始灌浆饱满但尚未成熟。南方有「小满小满，江河渐满」之说，此时降雨增多、水势上涨。',related:['lixia','mangzhong']},
  {slug:'mangzhong',name:'芒种',pinyin:'Máng Zhòng',english:'Grain in Ear',category:'huangli',shortDesc:'太阳位于黄经75°，芒种忙种，有芒作物抢收抢种。',detail:'芒种在公历6月5-7日之间，太阳到达黄经75度。芒种意为有芒的麦子快收、有芒的稻子可种，是农事最繁忙的时节。此时气温显著升高、雨量充沛，江南进入梅雨季节。',related:['xiaoman','xiazhi']},
  {slug:'xiazhi',name:'夏至',pinyin:'Xià Zhì',english:'Summer Solstice',category:'huangli',shortDesc:'太阳位于黄经90°，白昼最长，阳极阴生之始。',detail:'夏至在公历6月21-22日之间，太阳到达黄经90度（夏至点）。这天太阳几乎直射北回归线，北半球白昼时间达到全年最长。夏至是阳极阴生之始，古人认为此时阴气始萌。民间有夏至吃面的习俗，寓意顺利度过酷暑。',related:['mangzhong','xiaoshu']},
  {slug:'xiaoshu',name:'小暑',pinyin:'Xiǎo Shǔ',english:'Minor Heat',category:'huangli',shortDesc:'太阳位于黄经105°，暑热初至，尚未极热。',detail:'小暑在公历7月6-8日之间，太阳到达黄经105度。暑为炎热之意，小暑表示天气开始炎热但尚未达到极点。此时江淮流域梅雨将尽，盛夏开始，民间有「小暑大暑，上蒸下煮」的说法。',related:['xiazhi','dashu']},
  {slug:'dashu',name:'大暑',pinyin:'Dà Shǔ',english:'Major Heat',category:'huangli',shortDesc:'太阳位于黄经120°，一年中最热之时，湿热交蒸。',detail:'大暑在公历7月22-24日之间，太阳到达黄经120度。大暑是一年中最热的时期，高温酷热、雷暴频繁。此时万物生长也达到鼎盛。民间有大暑饮伏茶、晒伏姜等消暑传统。',related:['xiaoshu','liqiu']},
  {slug:'liqiu',name:'立秋',pinyin:'Lì Qiū',english:'Start of Autumn',category:'huangli',shortDesc:'太阳位于黄经135°，秋季开始，暑去凉来之始。',detail:'立秋在公历8月7-9日之间，太阳到达黄经135度。立秋为秋季之始，但暑热尚未完全消退，有「秋老虎」之说。此时梧桐叶开始飘落，禾谷逐渐成熟。民间有立秋贴秋膘、啃秋等习俗。',related:['dashu','chushu']},
  {slug:'chushu',name:'处暑',pinyin:'Chǔ Shǔ',english:'End of Heat',category:'huangli',shortDesc:'太阳位于黄经150°，暑气消退，秋意渐浓。',detail:'处暑在公历8月22-24日之间，太阳到达黄经150度。处暑意为暑气至此而止，炎热离开。此时气温逐渐下降，秋高气爽。农谚有「处暑满田黄，家家修廪仓」之说。',related:['liqiu','bailu']},
  {slug:'bailu',name:'白露',pinyin:'Bái Lù',english:'White Dew',category:'huangli',shortDesc:'太阳位于黄经165°，露珠凝白，秋意愈深。',detail:'白露在公历9月7-9日之间，太阳到达黄经165度。此时天气转凉，夜间水汽凝结成白色露珠，故名白露。鸿雁南飞、玄鸟归巢，是秋天最具诗意的节气之一。民间有白露饮白露茶的习俗。',related:['chushu','qiufen']},
  {slug:'qiufen',name:'秋分',pinyin:'Qiū Fēn',english:'Autumnal Equinox',category:'huangli',shortDesc:'太阳位于黄经180°，昼夜平分，秋收大忙时节。',detail:'秋分在公历9月22-24日之间，太阳到达黄经180度（秋分点）。这天太阳直射赤道，全球昼夜等长。秋分之后北半球昼短夜长，气温快速下降。秋分是重要的农事节点，也是古代祭月的传统日子。',related:['bailu','hanlu']},
  {slug:'hanlu',name:'寒露',pinyin:'Hán Lù',english:'Cold Dew',category:'huangli',shortDesc:'太阳位于黄经195°，露水渐寒，晚秋景象。',detail:'寒露在公历10月7-9日之间，太阳到达黄经195度。寒露意为露水寒冷将凝为霜，气温比白露时更低。此时鸿雁来宾、菊有黄华，是登高赏菊的最佳时节。农事上秋收接近尾声，冬小麦开始播种。',related:['qiufen','shuangjiang']},
  {slug:'shuangjiang',name:'霜降',pinyin:'Shuāng Jiàng',english:'Frost Descent',category:'huangli',shortDesc:'太阳位于黄经210°，露结为霜，秋去冬来的信号。',detail:'霜降在公历10月23-24日之间，太阳到达黄经210度。霜降为秋季最后一个节气，天气渐冷、开始有霜。此时草木黄落、蜇虫咸俯，万物进入收藏状态。民间有霜降吃柿子、赏枫叶的习俗。',related:['hanlu','lidong']},
  {slug:'lidong',name:'立冬',pinyin:'Lì Dōng',english:'Start of Winter',category:'huangli',shortDesc:'太阳位于黄经225°，冬季开始，万物收藏归仓。',detail:'立冬在公历11月7-8日之间，太阳到达黄经225度。立冬为冬季之始，意为冬季自此开始，万物进入休养收藏状态。此时水始冰、地始冻。民间有立冬吃饺子、补冬的习俗以御严寒。',related:['shuangjiang','xiaoxue']},
  {slug:'xiaoxue',name:'小雪',pinyin:'Xiǎo Xuě',english:'Minor Snow',category:'huangli',shortDesc:'太阳位于黄经240°，初雪飘落，气温持续下降。',detail:'小雪在公历11月22-23日之间，太阳到达黄经240度。小雪意为降雪开始但雪量尚小，北方地区进入封冻季节。此时虹藏不见、天气上升地气下降，是腌制腊肉、储备冬菜的好时机。',related:['lidong','daxue']},
  {slug:'daxue',name:'大雪',pinyin:'Dà Xuě',english:'Major Snow',category:'huangli',shortDesc:'太阳位于黄经255°，雪量增大，千里冰封之始。',detail:'大雪在公历12月6-8日之间，太阳到达黄经255度。大雪意为降雪量增大，地面逐渐积雪。此时鹖鴠不鸣、虎始交，天地进入严寒模式。民间有大雪腌肉、进补养生的传统。',related:['xiaoxue','dongzhi']},
  {slug:'dongzhi',name:'冬至',pinyin:'Dōng Zhì',english:'Winter Solstice',category:'huangli',shortDesc:'太阳位于黄经270°，白昼最短，阴至极阳始生。',detail:'冬至在公历12月21-23日之间，太阳到达黄经270度（冬至点）。这天北半球白昼最短、黑夜最长，阴极之至、阳气始生。冬至是阴阳转换的关键节点，民间有冬至大如年之说，北方吃饺子、南方吃汤圆的习俗流传至今。',related:['daxue','xiaohan']},
  {slug:'xiaohan',name:'小寒',pinyin:'Xiǎo Hán',english:'Minor Cold',category:'huangli',shortDesc:'太阳位于黄经285°，寒冬渐深，滴水成冰。',detail:'小寒在公历1月5-7日之间，太阳到达黄经285度。小寒表示寒冷程度尚未达到极致，但实际上常常比大寒更冷。此时雁北乡、鹊始巢，天地萧瑟中已有春意萌动。民间有腊八粥暖身的习俗。',related:['dongzhi','dahan']},
  {slug:'dahan',name:'大寒',pinyin:'Dà Hán',english:'Major Cold',category:'huangli',shortDesc:'太阳位于黄经300°，寒至极点，随后春归大地。',detail:'大寒在公历1月20-21日之间，太阳到达黄经300度。大寒为二十四节气的最后一个节气，寒冷达到顶峰但春天已不远。此时鸡始乳、征鸟厉疾。民间有大寒迎年的习俗，除旧布新准备迎接新春。',related:['xiaohan','lichun']},
];

import { EXT_TERMS_1 } from '@/lib/glossary-ext-1'
import { EXT_TERMS_2 } from '@/lib/glossary-ext-2'
import { EXT_TERMS_3 } from '@/lib/glossary-ext-3'
import { EXT_TERMS_4 } from '@/lib/glossary-ext-4'
import { EXT_TERMS_5 } from '@/lib/glossary-ext-5'
import { EXT_TERMS_6 } from '@/lib/glossary-ext-6'
import { EXT_TERMS_7 } from '@/lib/glossary-ext-7'

export function getAllTerms(): GlossaryTerm[] { return [...allTerms, ...EXT_TERMS_1, ...EXT_TERMS_2, ...EXT_TERMS_3, ...EXT_TERMS_4, ...EXT_TERMS_5, ...EXT_TERMS_6, ...EXT_TERMS_7]; }
export function getTermBySlug(slug: string): GlossaryTerm | undefined { return allTerms.find(t => t.slug === slug); }
export function getTermsByCategory(cat: GlossaryCategory): GlossaryTerm[] { return allTerms.filter(t => t.category === cat); }
export function getAllSlugs(): string[] { return allTerms.map(t => t.slug); }
