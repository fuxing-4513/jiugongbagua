/**
 * 八字神煞系统 — 神煞表、每柱计算、详解字典、合并与标签
 */

// ── 神煞详解 ──
interface ShenShaInfo { type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }
export const SHENSHA_INFO: Record<string,ShenShaInfo> = {
  '天乙贵人':{type:'吉',meaning:'天上贵人之星，大吉之神。命带天乙贵人，一生逢凶化吉、遇难呈祥，人缘极佳，常得贵人提携扶助。'},
  '文昌贵人':{type:'吉',meaning:'文运昌隆之星，主聪明才智、学识过人。命带文昌，学业优秀，文才出众，利于考试升迁。'},
  '驿马':{type:'中性',meaning:'奔波劳碌之星。命带驿马，好动不喜静，宜外出发展或从事流动性强的工作。劳有所获，动中得财。'},
  '桃花':{type:'中性',meaning:'异性缘旺之星。命带桃花，人缘好、善社交、有魅力。但需防感情纠葛、烂桃花。'},
  '羊刃':{type:'凶',meaning:'刚烈锋利之刃。命带羊刃，性格刚猛果决、魄力非凡，但易冲动暴躁、锋芒毕露。',resolve:'宜多修身养性、谦逊待人，做事三思而后行。血光之年注意安全。'},
  '华盖':{type:'中性',meaning:'清高孤傲之星。命带华盖，性情高雅、有艺术天赋、与众不同的审美。常与佛道有缘，但易感孤独。'},
  '劫煞':{type:'凶',meaning:'劫夺伤害之煞。命带劫煞，一生多有小人是非、意外波折，需谨言慎行，防人之心不可无。',resolve:'遇事冷静、谨言慎行，避免与人争执。可佩戴吉祥物化解。'},
  '孤辰':{type:'凶',meaning:'孤星入命。命带孤辰，性情偏内向孤僻，喜爱独处思考。感情上可能晚成。',resolve:'宜多参与社交活动，主动建立人际关系。感情上宜主动。'},
  '寡宿':{type:'凶',meaning:'寡宿之星。命带寡宿，与六亲缘分较薄，内心孤独感较强。',resolve:'宜多与亲友联系，培养兴趣爱好，丰富精神生活。'},
  '天德贵人':{type:'吉',meaning:'上天福德之星，大吉。命带天德，天性仁慈善良、心胸宽广，一生逢凶化吉、福报深厚。'},
  '月德贵人':{type:'吉',meaning:'太阴德秀之星。命带月德，心地善良、待人宽厚、福德自来。女命更吉，相貌端好。'},
  '将星':{type:'吉',meaning:'大将之才之星。命带将星，有领导才能和组织能力，果断刚毅、独当一面。宜管理军警等岗位。'},
  '金舆':{type:'吉',meaning:'富贵之车舆。命带金舆，富贵之象，可得配偶家庭或社会关系相助，生活优渥。'},
  '天厨':{type:'吉',meaning:'天上御厨之星。命带天厨，一生口福好，善于品味生活。主饮食业、烹饪相关缘分。'},
  '福星贵人':{type:'吉',meaning:'福禄寿喜之星。命带福星，福气自来、生活安稳少波折。乐观豁达，逢事有贵人相助。'},
  '天赦':{type:'吉',meaning:'上天赦免之星。命带天赦，生来罪过减半，纵有灾祸易化解、重罪轻罚。大吉之神。'},
  '学堂':{type:'吉',meaning:'学业宫位之星。命带学堂，聪明好学、学业有成，利于文化教育和科研学术之路。'},
  '禄神':{type:'吉',meaning:'临官禄位之星。命带禄神，食禄丰厚、财运亨通、福禄双全。禄为养命之源，最喜旺相得地。'},
  '太极贵人':{type:'吉',meaning:'太极星，天地初分之神。命带太极贵人，一生多遇奇人异士点化，学识渊博且有独到见解，宜钻研玄学、哲学、命理等深奥学问。'},
  '德秀贵人':{type:'吉',meaning:'德以立身、秀以彰才。命带德秀贵人，品德高尚、才华出众、举止端雅，一生多得他人尊重和信任，名利双收。'},
  '灾煞':{type:'凶',meaning:'血火灾祸之煞。命带灾煞，一生易有突发性灾难、意外伤害，需格外注意安全。',resolve:'君子不立危墙之下，避免危险活动和环境。定期体检，注意健康。'},
  '岁煞':{type:'凶',meaning:'墓库杀伤之煞。命带岁煞，做事多阻碍，易有长辈或上级压力，身心易受牵制。',resolve:'宜平心静气，以柔克刚，避其锋芒。'},
  '亡神':{type:'凶',meaning:'亡失惊厄之煞。命带亡神，心思深沉、机谋多变，但也易有官非口舌。',resolve:'宜光明磊落，避免暗中交易或不当谋略。'},
  '进神':{type:'中性',meaning:'进德修业之格。命带进神，性格刚毅果断、做事积极进取，有始有终。男命多威严，女命多持家。'},
  '退神':{type:'中性',meaning:'退让缓和之格。命带退神，性格温和退让，不喜竞争，随遇而安。宜从事稳定工作，不宜强求。'},
  '天喜':{type:'吉',meaning:'婚庆喜乐之星。命带天喜，主喜事临门，婚姻美满、生育顺利、欢乐祥和。'},
  '天医':{type:'吉',meaning:'天赐良医之星。命带天医，与医道有缘，宜学医或从事健康行业。自身防病能力较强。'},
  '红艳':{type:'中性',meaning:'浪漫风流之星。命带红艳，情感丰富多情，有异性魅力。但易有感情纠葛、多角关系。',resolve:'感情上宜专一慎重，避免多角关系。'},
  '流霞':{type:'凶',meaning:'血光之灾的征兆。命带流霞，注意意外伤害、血光之灾，女命注意生产安全。',resolve:'不宜从事高危行业，注意交通安全，定期体检。'},
  '三奇贵人':{type:'吉',meaning:'天地人三奇。命带三奇贵人，才华超群、出类拔萃，有特殊福分和奇异的人生经历。'},
  '元辰':{type:'凶',meaning:'大耗煞星。命带元辰，一生多有不顺，破财劳神、凡事易半途而废。',resolve:'宜持重守成、不宜冒进。贵人扶持之年抓住机会。'},
  '勾神':{type:'凶',meaning:'勾连纠缠之煞。命带勾神，易有口舌是非、官司诉讼、纠缠不清之事。',resolve:'凡事留证据、签合同需谨慎，避免利益纠纷。'},
  '绞煞':{type:'凶',meaning:'绞杀伤害之煞。命带绞煞，易遭遇突然伤害或困境，需注意人身安全。',resolve:'凡事谨慎，避免与人结仇。注意交通安全，多做善事。'},
  '大耗':{type:'凶',meaning:'大破耗损之煞。命带大耗，重大破财之象，投资须谨慎。',resolve:'不宜投资、担保、合伙。保守理财为上。'},
  '小耗':{type:'凶',meaning:'小破耗损之煞。命带小耗，多有小破财，日常开支较大。',resolve:'日常消费有节制，妥善保管财物。'},
  '天罗':{type:'凶',meaning:'天罗之网，男命大忌。命带天罗，男子多困顿、事业难成。',resolve:'宜守法循规，稳扎稳打，切忌急功近利。'},
  '地网':{type:'凶',meaning:'地网之缠，女命大忌。命带地网，女子多束缚、姻缘晚成。',resolve:'宜增强自信，主动把握机遇，不被外界束缚。'},
  '四废':{type:'凶',meaning:'四肢无力之废。命带四废，做事有心无力、多劳少成、一生辛苦。',resolve:'宜先求稳再谋进，勿好高骛远。提升自身专业技能。'},
  '十恶大败':{type:'凶',meaning:'大败之极。命带十恶大败，事业易败、财物难聚，需大运补救。',resolve:'宜勤俭持家、保守经营，不宜冒险投机。'},
  '魁罡':{type:'中性',meaning:'魁首罡星。命带魁罡，聪明果决、胆识过人。男命多权柄、女命多本领。有克夫克妻之说。',resolve:'宜修身养性，以柔克刚。女命注意婚姻经营。'},
  '孤鸾杀':{type:'凶',meaning:'孤鸾之杀。命带孤鸾杀，主婚姻不顺，男女皆恐配偶不谐。',resolve:'感情上多包容、多沟通，晚婚为宜。'},
  '阴阳差错':{type:'凶',meaning:'阴阳错位。命带阴阳差错，婚事不顺，婚姻多磨。',resolve:'晚婚为宜，多沟通包容，可选择性格互补的配偶。'},
  '九丑':{type:'凶',meaning:'九丑恶煞。命带九丑，婚姻多灾、人缘不佳、常有口舌。',resolve:'注意言行举止，多结善缘。'},
}

// ── 经典神煞（18种） ──
const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅', 寅:'申',午:'申',戌:'申', 巳:'亥',酉:'亥',丑:'亥', 亥:'巳',卯:'巳',未:'巳'}
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉', 寅:'卯',午:'卯',戌:'卯', 巳:'午',酉:'午',丑:'午', 亥:'子',卯:'子',未:'子'}
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰', 寅:'戌',午:'戌',戌:'戌', 巳:'丑',酉:'丑',丑:'丑', 亥:'未',卯:'未',未:'未'}
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳', 寅:'亥',午:'亥',戌:'亥', 巳:'寅',酉:'寅',丑:'寅', 亥:'申',卯:'申',未:'申'}
const ZAISHA: Record<string,string> = {申:'午',子:'午',辰:'午', 寅:'子',午:'子',戌:'子', 巳:'卯',酉:'卯',丑:'卯', 亥:'酉',卯:'酉',未:'酉'}
const SUISHA: Record<string,string> = {申:'未',子:'未',辰:'未', 寅:'丑',午:'丑',戌:'丑', 巳:'辰',酉:'辰',丑:'辰', 亥:'戌',卯:'戌',未:'戌'}
const WANGSHEN: Record<string,string> = {申:'亥',子:'亥',辰:'亥', 寅:'巳',午:'巳',戌:'巳', 巳:'申',酉:'申',丑:'申', 亥:'寅',卯:'寅',未:'寅'}
const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅', 寅:'巳',卯:'巳',辰:'巳', 巳:'申',午:'申',未:'申', 申:'亥',酉:'亥',戌:'亥'}
const GUASU: Record<string,string> = {亥:'戌',子:'戌',丑:'戌', 寅:'丑',卯:'丑',辰:'丑', 巳:'辰',午:'辰',未:'辰', 申:'未',酉:'未',戌:'未'}
const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}
const JIANGXING: Record<string,string> = {寅:'子',午:'子',戌:'子', 申:'午',子:'午',辰:'午', 巳:'酉',酉:'酉',丑:'酉', 亥:'卯',卯:'卯',未:'卯'}
const JINYU: Record<string,string> = {甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'}
const TIANCHU: Record<string,string> = {甲:'巳',乙:'午',丙:'巳',丁:'午',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const FUXING: Record<string,string> = {甲:'子寅',乙:'丑卯',丙:'子寅',丁:'亥',戊:'丑',己:'未',庚:'辰',辛:'午',壬:'巳',癸:'丑卯'}
const TIANSHENG: Record<string,string> = {巳:'乙',酉:'乙',丑:'乙', 申:'丁',子:'丁',辰:'丁', 亥:'己',卯:'己',未:'己', 寅:'辛',午:'辛',戌:'辛'}
const XUETANG: Record<string,string> = {甲:'未',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const XUETANG_YEAR: Record<string,string> = {甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'}

// ── 新增神煞（12种） ──
const TAIJI: Record<string,string> = {甲:'子午',乙:'子午',丙:'卯酉',丁:'卯酉',戊:'辰戌丑未',己:'辰戌丑未',庚:'寅亥',辛:'寅亥',壬:'巳申',癸:'巳申'}
const DEXIU: Record<string,string[]> = {寅:['丙','丁','戊','癸'],午:['丙','丁','戊','癸'],戌:['丙','丁','戊','癸'],申:['壬','癸','戊','己','庚','辛'],子:['壬','癸','戊','己','庚','辛'],辰:['壬','癸','戊','己','庚','辛'],巳:['庚','辛','甲','乙'],酉:['庚','辛','甲','乙'],丑:['庚','辛','甲','乙'],亥:['甲','乙','丙','丁'],卯:['甲','乙','丙','丁'],未:['甲','乙','丙','丁']}
const TIANXI: Record<string,string> = {子:'酉',丑:'申',寅:'未',卯:'午',辰:'巳',巳:'辰',午:'卯',未:'寅',申:'丑',酉:'子',戌:'亥',亥:'戌'}
const TIANYI_MED: Record<string,string> = {寅:'丑',卯:'子',辰:'亥',巳:'戌',午:'酉',未:'申',申:'未',酉:'午',戌:'巳',亥:'辰',子:'卯',丑:'寅'}
const LU: Record<string,string> = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'}
const HONGYAN: Record<string,string> = {甲:'午',乙:'午',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'}
const LIUXIA: Record<string,string> = {甲:'酉',乙:'戌',丙:'未',丁:'申',戊:'巳',己:'午',庚:'辰',辛:'卯',壬:'亥',癸:'寅'}
const YUANCHEN: Record<string,string> = {子:'巳',丑:'午',寅:'未',卯:'申',辰:'酉',巳:'戌',午:'亥',未:'子',申:'丑',酉:'寅',戌:'卯',亥:'辰'}
const GOUJIAO: Record<string,string> = {子:'卯戌',丑:'辰亥',寅:'巳子',卯:'午丑',辰:'未寅',巳:'申卯',午:'酉辰',未:'戌巳',申:'亥午',酉:'子未',戌:'丑申',亥:'寅酉'}
const DAHAO: Record<string,string> = {子:'巳',丑:'午',寅:'未',卯:'申',辰:'酉',巳:'戌',午:'亥',未:'子',申:'丑',酉:'寅',戌:'卯',亥:'辰'}
const XIAOHAO: Record<string,string> = {子:'辰',丑:'巳',寅:'午',卯:'未',辰:'申',巳:'酉',午:'戌',未:'亥',申:'子',酉:'丑',戌:'寅',亥:'卯'}
const SIFEI_MONTH: Record<string,string> = {寅:'申酉',卯:'申酉',辰:'申酉', 巳:'亥子',午:'亥子',未:'亥子', 申:'寅卯',酉:'寅卯',戌:'寅卯', 亥:'巳午',子:'巳午',丑:'巳午'}
const SHIE: Set<string> = new Set(['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥'])
const KUI_GANG_RI: Set<string> = new Set(['庚辰','庚戌','壬辰','戊戌'])
const GULUAN: Set<string> = new Set(['乙巳','丁巳','辛亥','戊申','甲寅'])
const YINYANG_CUO: Set<string> = new Set(['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'])
const JINSHEN: Set<string> = new Set(['甲子','甲午','己卯','己酉'])
const TUISHEN: Set<string> = new Set(['丁卯','丁酉','壬午','壬子'])
const JIUCHOU: Set<string> = new Set(['戊子','戊午','壬子','壬午','丁卯','丁酉','己卯','己酉','辛卯','辛酉'])

// ── 类型 ──
export interface ShenShaItem { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }
export interface PillarShenSha { pillarName: string; items: { name: string; type: '吉'|'凶'|'中性' }[] }
export type ShenShaTagColor = (type: string) => string

// ── 每柱独立神煞（30种神煞完整计算） ──
export function calcPillarShenSha(tg: string[], dz: string[], dayGan: string, dayZhi: string, dayGz: string): PillarShenSha[] {
  const pillarNames = ['年柱','月柱','日柱','时柱']
  const push = (items: { name: string; type: '吉'|'凶'|'中性' }[], name: string, type: '吉'|'凶'|'中性') => { if (!items.some(x => x.name === name)) items.push({name, type}) }

  return [0,1,2,3].map(i => {
    const g = tg[i], z = dz[i]
    const items: { name: string; type: '吉'|'凶'|'中性' }[] = []

    // ══ 天干/日干衍生 ══
    const ty = TIANYI[dayGan] || []; if (ty.includes(z)) push(items, '天乙贵人', '吉')
    if (WENCHANG[dayGan] === z) push(items, '文昌贵人', '吉')
    if (YANGREN[dayGan] === z) push(items, '羊刃', '凶')
    if (JINYU[dayGan] === z) push(items, '金舆', '吉')
    if (FUXING[dayGan] && FUXING[dayGan].includes(z)) push(items, '福星贵人', '吉')
    if (FUXING[tg[0]] && FUXING[tg[0]].includes(z) && !items.some(x => x.name === '福星贵人')) push(items, '福星贵人', '吉')
    if (TIANCHU[g] === z) push(items, '天厨', '吉')
    if (XUETANG[dayGan] === z) push(items, '学堂', '吉')
    if (XUETANG_YEAR[tg[0]] === z && !items.some(x => x.name === '学堂')) push(items, '学堂', '吉')
    if (HONGYAN[dayGan] === z) push(items, '红艳', '中性')
    if (LIUXIA[dayGan] === z) push(items, '流霞', '凶')
    // ══ 禄神（日干之禄，查每柱地支是否含日主之临官位） ══
    if (LU[dayGan] === z) push(items, '禄神', '吉')
    // 兼查年干/月干/时干之禄（如甲禄到寅等，不重复显示）
    if (LU[g] === z && g !== dayGan && !items.some(x => x.name === '禄神')) push(items, '禄神', '吉')

    // ══ 年支衍生 ══
    const yZhi = dz[0]
    if (YIMA[yZhi] === z) push(items, '驿马', '中性')
    if (TAOHUA[yZhi] === z) push(items, '桃花', '中性')
    if (HUAGAI[yZhi] === z) push(items, '华盖', '中性')
    if (JIESHA[yZhi] === z) push(items, '劫煞', '凶')
    if (GUCHEN[yZhi] === z) push(items, '孤辰', '凶')
    if (GUASU[yZhi] === z) push(items, '寡宿', '凶')
    if (JIANGXING[yZhi] === z) push(items, '将星', '吉')
    if (TIANXI[yZhi] === z) push(items, '天喜', '吉')
    if (YUANCHEN[yZhi] === z) push(items, '元辰', '凶')
    if (DAHAO[yZhi] === z) push(items, '大耗', '凶')
    if (XIAOHAO[yZhi] === z) push(items, '小耗', '凶')
    const gj = GOUJIAO[yZhi]; if (gj) { if (z === gj[0] || z === gj[1]) push(items, '勾神', '凶'); if (z === gj[1] || z === gj[2]) push(items, '绞煞', '凶') }
    if (ZAISHA[yZhi] === z) push(items, '灾煞', '凶')
    if (SUISHA[yZhi] === z) push(items, '岁煞', '凶')
    if (WANGSHEN[yZhi] === z) push(items, '亡神', '凶')

    // ══ 太极贵人（以年干或日干定支） ══
    if (TAIJI[tg[0]] && TAIJI[tg[0]].includes(z)) push(items, '太极贵人', '吉')
    else if (TAIJI[dayGan] && TAIJI[dayGan].includes(z)) push(items, '太极贵人', '吉')

    // ══ 月支衍生 ══
    const mZhi = dz[1]
    const dx = DEXIU[mZhi]; if (dx && dx.includes(g)) push(items, '德秀贵人', '吉')

    if (TIANDE[mZhi] === g) push(items, '天德贵人', '吉')
    if (YUEDE[mZhi] === g) push(items, '月德贵人', '吉')
    if (TIANYI_MED[mZhi] === z) push(items, '天医', '吉')
    if (TIANSHENG[mZhi] === g && i < 2) push(items, '天赦', '吉')

    // ══ 四废（时柱） ══
    if (i === 3) { const sf = SIFEI_MONTH[mZhi]; if (sf && sf.includes(z)) push(items, '四废', '凶') }

    // ══ 天罗地网（每柱均查，辰巳为天罗，戌亥为地网） ══
    if (z === '辰' || z === '巳') push(items, '天罗', '凶')
    if (z === '戌' || z === '亥') push(items, '地网', '凶')

    // ══ 日柱特定组合 ══
    if (i === 2) {
      if (KUI_GANG_RI.has(dayGz)) push(items, '魁罡', '中性')
      if (SHIE.has(dayGz)) push(items, '十恶大败', '凶')
      if (GULUAN.has(dayGz)) push(items, '孤鸾杀', '凶')
      if (YINYANG_CUO.has(dayGz)) push(items, '阴阳差错', '凶')
      if (JIUCHOU.has(dayGz)) push(items, '九丑', '凶')
      if (JINSHEN.has(dayGz)) push(items, '进神', '中性')
      if (TUISHEN.has(dayGz)) push(items, '退神', '中性')
    }

    // ══ 三奇贵人 ══
    if (i === 0) { const allTg = tg.slice(0,3).join(''); if (allTg === '甲戊庚' || allTg === '乙丙丁' || allTg === '壬癸辛') push(items, '三奇贵人', '吉') }

    return { pillarName: pillarNames[i], items: items.length > 0 ? items : [{name:'—', type:'中性'}] }
  })
}

/** 每柱神煞显示标签 */
export function getPillarShenShaLabel(items: { name: string; type: '吉'|'凶'|'中性' }[]): string {
  const emoji: Record<string,string> = {
    '天乙贵人':'✨','文昌贵人':'📖','驿马':'🏇','桃花':'🌸','羊刃':'⚔️','华盖':'🎭','劫煞':'⚠️','孤辰':'🌙','寡宿':'☁️',
    '天德贵人':'☀️','月德贵人':'🌙','将星':'⭐','金舆':'🚗','天厨':'🍳','禄神':'💰','福星贵人':'🎁','天赦':'🙏','学堂':'📚',
    '天喜':'🎊','天医':'🏥','红艳':'💋','流霞':'🩸','三奇贵人':'🌟','元辰':'💸','勾神':'🔗','绞煞':'🪢',
    '大耗':'💧','小耗':'💦','天罗':'🕸️','地网':'🪤','四废':'🎈','十恶大败':'💀','魁罡':'🎯','孤鸾杀':'🕊️','阴阳差错':'⚡','九丑':'😈','太极贵人':'☯️','德秀贵人':'🌿','灾煞':'🔥','岁煞':'🏚️','亡神':'👻','进神':'📈','退神':'📉',
  }
  return items.filter(x => x.name !== '—').map(x => (emoji[x.name] || '') + x.name).join(' ') || '—'
}

/** 合并全局神煞列表（含详解） */
export function mergeShenSha(pillarShenSha: PillarShenSha[]): ShenShaItem[] {
  const seen = new Set<string>()
  const all: ShenShaItem[] = []
  for (const p of pillarShenSha) {
    for (const item of p.items) {
      if (item.name !== '—' && !seen.has(item.name)) {
        seen.add(item.name)
        const info = SHENSHA_INFO[item.name]
        all.push({ name: item.name, type: item.type, meaning: info ? info.meaning : '', resolve: info ? info.resolve : undefined })
      }
    }
  }
  const order = ['吉','中性','凶']
  all.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
  return all.length > 0 ? all : [{ name:'无特殊神煞', type:'中性', meaning:'此八字未见显著神煞入局。' }]
}

/** 神煞标签颜色 */
export const shenShaTagColor = (type: string) => {
  if (type === '吉') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'
  if (type === '凶') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'
  return 'bg-dark-700 text-gray-400 border border-dark-600'
}

/** 神煞对性格的影响 — 单个效果 */
export interface ShenShaEffect { has: boolean; effect: string }

export function ssEffect(shenSha: ShenShaItem[], key: string): ShenShaEffect {
  const has = shenSha.some(s => s.name.includes(key))
  const map: Record<string,string> = {
    天乙贵人:'命带天乙贵人，一生逢凶化吉遇难呈祥，人缘极佳，易得贵人提携。',
    文昌贵人:'命带文昌贵人，天生聪颖，学业出众，富有才华和创造力。',
    驿马:'命带驿马星，主奔波劳碌，宜外出发展。好动不喜静，适合流动性强的工作。',
    桃花:'命带桃花星，异性缘佳，人缘好，善于社交。但也需注意感情纠葛。',
    羊刃:'命带羊刃，性格刚烈果敢，有魄力胆识。但易冲动暴躁，需注意克制。',
    华盖:'命带华盖星，性情孤高，喜好清静，有艺术天赋和宗教缘。',
    劫煞:'命带劫煞，一生多有小人是非，需谨言慎行，防人之心不可无。',
    孤辰:'命带孤辰，性格偏内向孤僻，不喜热闹，喜欢独处思考。',
    天德贵人:'命带天德贵人，天性善良仁慈，德高望重，得天庇佑。',
    月德贵人:'命带月德贵人，心地善良，待人宽厚，福泽自来。',
  }
  return { has, effect: map[key] || '' }
}
