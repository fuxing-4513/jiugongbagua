// bazi-engine.ts — Shared Bazi calculation engine
// Extracted from BaziClient.tsx

export interface PillarInfo {
  gz: string; gan: string; zhi: string;
  ny: string; wxG: string; wxZ: string;
  hd: string; hdSS: { gan: string; ss: string }[];
  ssG: string; ssZ: string;
}

export interface ShenShaItem { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }
export interface PillarShenSha { pillarName: string; items: { name: string; type: '吉'|'凶'|'中性' }[] }

export interface BaziChartResult {
  pills: PillarInfo[];
  wx: Record<string,number>;
  dg: string;
  str: { level: string; detail: string };
  zodiac: string;
  shenSha: ShenShaItem[];
  pillarShenSha: PillarShenSha[];
  dayun: { gz: string; age: number; startYear: number }[];
  analysis: {
    general: string[];
    classical: string[];
    personality: string;
    love: string;
    career: string;
    wealth: string;
    other: string[];
  };
  curAge: number;
  birthYear: number;
  baziStr: string;
}

// === Constants ===

export const wxM: Record<string,string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
export const ny: Record<string,string> = {甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
export const ssM: Record<string,Record<string,string>> = {甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'}}
export const hG: Record<string,string> = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}
export const hA: Record<string,string> = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}

export const wxPersonality: Record<string,{positive:string;negative:string;style:string}> = {
  木:{positive:'仁慈宽厚、正直善良，有领导才能和担当精神。性情温和而不失原则，如参天大树般正直向上。',negative:'固执己见、缺乏变通，有时过于理想主义而不切实际。',style:'木主仁，其性直，其情和。外观清秀，骨格修长，有慈悲恻隐之心。'},
  火:{positive:'热情开朗、慷慨大方，积极进取且乐于助人。性情豪爽，待人真诚，如阳光般温暖人心。',negative:'性急冲动、缺乏耐心，容易三分钟热度，有时锋芒太露招人嫉妒。',style:'火主礼，其性急，其情恭。外观威仪，面色红润，待人彬彬有礼但内心刚烈。'},
  土:{positive:'稳重笃实、诚信可靠，胸怀宽广有容人之量。性情温和敦厚，做事踏实不浮夸。',negative:'保守固执、缺乏创新，有时做事拖沓不够果断。',style:'土主信，其性重，其情厚。外观敦厚，腰圆背阔，言必信行必果。'},
  金:{positive:'刚毅果断、意志坚强，好胜心强且富有魄力。性情刚直，做事雷厉风行不拖泥带水。',negative:'冲动急躁、易得罪人，有时过于刚烈不知变通。',style:'金主义，其性刚，其情烈。外观骨肉匀停，面色白净，为人慷慨讲义气。'},
  水:{positive:'聪慧包容、志向远大，机智灵活善于变通。性情深沉内敛，如渊似海有容人之量。',negative:'心性不定、容易动摇，有时过于圆滑让人捉摸不透。',style:'水主智，其性聪，其情善。外观丰腴，面色黑亮，头脑灵活足智多谋。'},
}

// === ShenSha Tables ===

const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'}
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰',寅:'戌',午:'戌',戌:'戌',巳:'丑',酉:'丑',丑:'丑',亥:'未',卯:'未',未:'未'}
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅',亥:'申',卯:'申',未:'申'}
const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅',寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥'}
const GUASU: Record<string,string> = {亥:'戌',子:'戌',丑:'戌',寅:'丑',卯:'丑',辰:'丑',巳:'辰',午:'辰',未:'辰',申:'未',酉:'未',戌:'未'}
const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}
const JIANGXING: Record<string,string> = {寅:'子',午:'子',戌:'子',申:'午',子:'午',辰:'午',巳:'酉',酉:'酉',丑:'酉',亥:'卯',卯:'卯',未:'卯'}
const JINYU: Record<string,string> = {甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'}
const TIANCHU: Record<string,string> = {甲:'巳',乙:'午',丙:'巳',丁:'午',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const FUXING: Record<string,string> = {甲:'子',乙:'丑',丙:'子',丁:'丑',戊:'丑',己:'未',庚:'丑',辛:'未',壬:'丑',癸:'未'}
const TIANSHENG: Record<string,string> = {巳:'乙',酉:'乙',丑:'乙',申:'丁',子:'丁',辰:'丁',亥:'己',卯:'己',未:'己',寅:'辛',午:'辛',戌:'辛'}
const XUETANG: Record<string,string> = {甲:'未',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const TIANXI: Record<string,string> = {子:'酉',丑:'申',寅:'未',卯:'午',辰:'巳',巳:'辰',午:'卯',未:'寅',申:'丑',酉:'子',戌:'亥',亥:'戌'}
const TIANYI_MED: Record<string,string> = {寅:'丑',卯:'子',辰:'亥',巳:'戌',午:'酉',未:'申',申:'未',酉:'午',戌:'巳',亥:'辰',子:'卯',丑:'寅'}
const HONGYAN: Record<string,string> = {甲:'午',乙:'午',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'}
const LIUXIA: Record<string,string> = {甲:'酉',乙:'戌',丙:'未',丁:'申',戊:'巳',己:'午',庚:'辰',辛:'卯',壬:'亥',癸:'寅'}
const YUANCHEN: Record<string,string> = {子:'巳',丑:'午',寅:'未',卯:'申',辰:'酉',巳:'戌',午:'亥',未:'子',申:'丑',酉:'寅',戌:'卯',亥:'辰'}
const GOUJIAO: Record<string,string> = {子:'卯戌',丑:'辰亥',寅:'巳子',卯:'午丑',辰:'未寅',巳:'申卯',午:'酉辰',未:'戌巳',申:'亥午',酉:'子未',戌:'丑申',亥:'寅酉'}
const DAHAO: Record<string,string> = {子:'巳',丑:'午',寅:'未',卯:'申',辰:'酉',巳:'戌',午:'亥',未:'子',申:'丑',酉:'寅',戌:'卯',亥:'辰'}
const XIAOHAO: Record<string,string> = {子:'辰',丑:'巳',寅:'午',卯:'未',辰:'申',巳:'酉',午:'戌',未:'亥',申:'子',酉:'丑',戌:'寅',亥:'卯'}
const SIFEI_MONTH: Record<string,string> = {寅:'申酉',卯:'申酉',辰:'申酉',巳:'亥子',午:'亥子',未:'亥子',申:'寅卯',酉:'寅卯',戌:'寅卯',亥:'巳午',子:'巳午',丑:'巳午'}
const SHIE = new Set(['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥'])
const KUI_GANG_RI = new Set(['庚辰','庚戌','壬辰','戊戌'])
const GULUAN = new Set(['乙巳','丁巳','辛亥','戊申','甲寅'])
const YINYANG_CUO = new Set(['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'])
const JIUCHOU = new Set(['戊子','戊午','壬子','壬午','丁卯','丁酉','己卯','己酉','辛卯','辛酉'])

const SHENSHA_INFO: Record<string,{ type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }> = {
  '天乙贵人':{type:'吉',meaning:'天上贵人之星，大吉之神。命带天乙贵人，一生逢凶化吉、遇难呈祥，人缘极佳，常得贵人提携扶助。'},
  '文昌贵人':{type:'吉',meaning:'文运昌隆之星，主聪明才智、学识过人。命带文昌，学业优秀，文才出众，利于考试升迁。'},
  '驿马':{type:'中性',meaning:'奔波劳碌之星。命带驿马，好动不喜静，宜外出发展或从事流动性强的工作。劳有所获，动中得财。'},
  '桃花':{type:'中性',meaning:'异性缘旺之星。命带桃花，人缘好、善社交、有魅力。但需防感情纠葛、烂桃花。'},
  '羊刃':{type:'凶',meaning:'刚烈锋利之刃。命带羊刃，性格刚猛果决、魄力非凡，但易冲动暴躁、锋芒毕露。',resolve:'宜多修身养性、谦逊待人，做事三思而后行。'},
  '华盖':{type:'中性',meaning:'清高孤傲之星。命带华盖，性情高雅、有艺术天赋、与众不同的审美。常与佛道有缘，但易感孤独。'},
  '劫煞':{type:'凶',meaning:'劫夺伤害之煞。命带劫煞，一生多有小人是非、意外波折，需谨言慎行。',resolve:'遇事冷静、谨言慎行，避免与人争执。'},
  '孤辰':{type:'凶',meaning:'孤星入命。命带孤辰，性情偏内向孤僻，喜爱独处思考。感情上可能晚成。',resolve:'宜多参与社交活动，主动建立人际关系。'},
  '寡宿':{type:'凶',meaning:'寡宿之星。命带寡宿，与六亲缘分较薄，内心孤独感较强。',resolve:'宜多与亲友联系，培养兴趣爱好，丰富精神生活。'},
  '天德贵人':{type:'吉',meaning:'上天福德之星，大吉。命带天德，天性仁慈善良、心胸宽广，一生逢凶化吉、福报深厚。'},
  '月德贵人':{type:'吉',meaning:'太阴德秀之星。命带月德，心地善良、待人宽厚、福德自来。女命更吉，相貌端好。'},
  '将星':{type:'吉',meaning:'大将之才之星。命带将星，有领导才能和组织能力，果断刚毅、独当一面。'},
  '金舆':{type:'吉',meaning:'富贵之车舆。命带金舆，富贵之象，可得配偶家庭或社会关系相助，生活优渥。'},
  '天厨':{type:'吉',meaning:'天上御厨之星。命带天厨，一生口福好，善于品味生活。主饮食业、烹饪相关缘分。'},
  '福星贵人':{type:'吉',meaning:'福禄寿喜之星。命带福星，福气自来、生活安稳少波折。乐观豁达，逢事有贵人相助。'},
  '天赦':{type:'吉',meaning:'上天赦免之星。命带天赦，生来罪过减半，纵有灾祸易化解。大吉之神。'},
  '学堂':{type:'吉',meaning:'学业宫位之星。命带学堂，聪明好学、学业有成，利于文化教育和科研学术之路。'},
  '天喜':{type:'吉',meaning:'婚庆喜乐之星。命带天喜，主喜事临门，婚姻美满、生育顺利、欢乐祥和。'},
  '天医':{type:'吉',meaning:'天赐良医之星。命带天医，与医道有缘，宜学医或从事健康行业。'},
  '红艳':{type:'中性',meaning:'浪漫风流之星。命带红艳，情感丰富多情，有异性魅力。但易有感情纠葛。',resolve:'感情上宜专一慎重，避免多角关系。'},
  '流霞':{type:'凶',meaning:'血光之灾的征兆。命带流霞，注意意外伤害、血光之灾。',resolve:'不宜从事高危行业，注意交通安全。'},
  '三奇贵人':{type:'吉',meaning:'天地人三奇。命带三奇贵人，才华超群、出类拔萃，有特殊福分和奇异的人生经历。'},
  '元辰':{type:'凶',meaning:'大耗煞星。命带元辰，一生多有不顺，破财劳神、凡事易半途而废。',resolve:'宜持重守成、不宜冒进。'},
  '勾神':{type:'凶',meaning:'勾连纠缠之煞。命带勾神，易有口舌是非、官司诉讼。',resolve:'凡事留证据、签合同需谨慎。'},
  '绞煞':{type:'凶',meaning:'绞杀伤害之煞。命带绞煞，易遭遇突然伤害或困境。',resolve:'凡事谨慎，避免与人结仇。'},
  '大耗':{type:'凶',meaning:'大破耗损之煞。命带大耗，重大破财之象，投资须谨慎。',resolve:'不宜投资、担保、合伙。'},
  '小耗':{type:'凶',meaning:'小破耗损之煞。命带小耗，多有小破财，日常开支较大。',resolve:'日常消费有节制，妥善保管财物。'},
  '天罗':{type:'凶',meaning:'天罗之网，男命大忌。命带天罗，男子多困顿、事业难成。',resolve:'宜守法循规，稳扎稳打。'},
  '地网':{type:'凶',meaning:'地网之缠，女命大忌。命带地网，女子多束缚、姻缘晚成。',resolve:'宜增强自信，主动把握机遇。'},
  '四废':{type:'凶',meaning:'四肢无力之废。命带四废，做事有心无力、多劳少成。',resolve:'宜先求稳再谋进，勿好高骛远。'},
  '十恶大败':{type:'凶',meaning:'大败之极。命带十恶大败，事业易败、财物难聚。',resolve:'宜勤俭持家、保守经营。'},
  '魁罡':{type:'中性',meaning:'魁首罡星。命带魁罡，聪明果决、胆识过人。男命多权柄、女命多本领。',resolve:'宜修身养性，以柔克刚。'},
  '孤鸾杀':{type:'凶',meaning:'孤鸾之杀。命带孤鸾杀，主婚姻不顺。',resolve:'感情上多包容、多沟通，晚婚为宜。'},
  '阴阳差错':{type:'凶',meaning:'阴阳错位。命带阴阳差错，婚事不顺，婚姻多磨。',resolve:'晚婚为宜，多沟通包容。'},
  '九丑':{type:'凶',meaning:'九丑恶煞。命带九丑，婚姻多灾、人缘不佳。',resolve:'注意言行举止，多结善缘。'},
}

const QT: Record<string,Record<number,string>> = {
  甲:{1:'正月余寒未退。庚金劈木为用，丙火调候为喜，非丙不暖，非庚不劈。',2:'二月甲临帝旺。庚金七杀雕琢为用，丁火泄秀为美，庚丁两透大贵之格。',3:'三月木老根深。先庚后丁，庚金劈木引火，丁火泄秀。',4:'巳月火旺木渴。癸水润木为用，丁火泄秀，庚金为佐。',5:'午月火旺焚木。癸丁并用，癸水调候为先，无癸则木自焚。',6:'未月燥土当令。癸水调候为先，庚金为辅。',7:'申月金旺克木。丁火泄秀制金为用，庚金当令可为佐。',8:'酉月金锐木伤。丁火丙火并用，庚金劈木引火。',9:'戌月土燥木枯。先壬水润土，再用甲木庚金。',10:'亥月水旺木湿。庚丁并用，丁火暖局为先。',11:'子月天寒地冻。丁火暖局，庚金劈木，寒木向阳方有生机。',12:'丑月冻土当令。丁火暖局为急，庚金劈木次之。'},
  乙:{1:'正月余寒未退。丙火暖局为主，癸水润木为辅。',2:'二月乙木逢春。丙火癸水并用，以丙火泄秀为先。',3:'辰月土旺木渴。癸水润土，丙火泄秀为美。',4:'巳月火炎木渴。癸水为先，辛金七杀为佐。',5:'午月火旺之极。癸水调候，丙火次之。',6:'未月燥土克水。癸丙并用，以癸水调候为先。',7:'申月金旺克木。癸水化金生木，丙火泄秀。',8:'酉月金锐锋锐。癸水泄金生木，辛金七杀可借力。',9:'戌月土燥木枯。癸辛并用，先癸后辛。',10:'亥月寒木向暖。丙火戊土为用，以丙暖木为先。',11:'子月冰寒水冷。丙火暖局为第一要务。',12:'丑月冻土寒木。丙火调候，癸水次之。'},
  丙:{1:'寅月木旺火相。壬水为先，庚金为佐。',2:'卯月木旺生火。壬水庚金并用。',3:'辰月土旺晦火。壬甲并用，壬水为先。',4:'巳月火炎土燥。壬水为先，庚金发源。',5:'午月火旺至极。壬庚并用，以壬水调候为急。',6:'未月燥土晦火。壬庚并用，水为先。',7:'申月金多火熄。壬水戊土，以壬水调候为先。',8:'酉月金旺火衰。壬水为先。',9:'戌月燥土晦火。甲壬并用。',10:'亥月水旺克火。甲木戊土为用。',11:'子月水冷火熄。壬戊并用，甲木为辅。',12:'丑月寒土困火。壬甲并用。'},
  丁:{1:'寅月木旺火相。甲木引丁火，庚金劈甲为贵。',2:'卯月木旺火炽。庚金劈甲引丁。',3:'辰月土旺晦火。甲木为用，庚金为佐。',4:'巳月火炎土燥。甲庚并用。',5:'午月火旺极。壬水调候，庚金发源。',6:'未月燥土晦丁。甲壬庚，壬水为先。',7:'申月金旺火褪。甲庚丙戊为用。',8:'酉月金旺火晦。甲庚丙戊并用。',9:'戌月燥土困火。甲庚戊，以甲木疏土为先。',10:'亥月寒水克火。甲庚戊并用。',11:'子月寒气逼人。甲庚为用。',12:'丑月冻土寒冰。甲庚为用，丙火暖局。'},
  戊:{1:'寅月木当令克土。丙火甲木，以丙火化木生土为先。',2:'卯月木旺土死。丙甲癸并用。',3:'辰月土当令。甲丙癸，以甲木疏土为先。',4:'巳月火旺土燥。甲丙癸，甲木为先。',5:'午月火旺土焦。壬甲丙，壬水调候为先。',6:'未月燥土厚重。癸甲丙，癸水调候为先。',7:'申月金旺泄土。丙甲癸，丙火为先。',8:'酉月金旺泄土。丙癸为用。',9:'戌月燥土当令。甲丙癸，甲木疏土为先。',10:'亥月水旺湿土。丙甲并用。',11:'子月寒水冻土。丙甲并用。',12:'丑月冻土寒冰。丙甲并用。'},
  己:{1:'寅月木旺克土。丙甲庚并用。',2:'卯月木旺土死。甲癸丙。',3:'辰月土旺湿厚。丙甲癸，丙火暖土为先。',4:'巳月火炎土燥。癸丙辛，癸水调候为先。',5:'午月火旺土焦。癸丙并用。',6:'未月燥土当令。癸丙并用。',7:'申月金旺泄土。丙癸并用。',8:'酉月金旺泄土。丙癸并用。',9:'戌月燥土厚重。甲丙癸，甲木为先。',10:'亥月水旺湿土。丙甲戊，丙火为先。',11:'子月寒水冻土。丙戊甲。',12:'丑月冻土寒冰。丙戊甲。'},
  庚:{1:'寅月木旺金囚。丙甲丁，以丙火暖金为先。',2:'卯月木旺金衰。丁甲庚丙。',3:'辰月土旺生金。甲丁壬，甲木疏土为先。',4:'巳月火旺金熔。壬丙丁戊，以壬水调候为先。',5:'午月火炎金熔。壬癸为用。',6:'未月燥土生金。丁甲为用。',7:'申月金当令。丁甲为用，丁火炼金为利器。',8:'酉月金旺极。丁丙并用。',9:'戌月燥土埋金。甲壬并用。',10:'亥月水冷金寒。丁丙并用。',11:'子月冰寒金凝。丁甲丙并用。',12:'丑月冻土金埋。丙丁甲。'},
  辛:{1:'寅月木旺金囚。己壬庚，以己土生金为先。',2:'卯月木旺金衰。壬甲并用。',3:'辰月土旺金埋。壬甲并用。',4:'巳月火旺金熔。壬甲癸，壬水调候为先。',5:'午月火炎金熔。壬己癸。',6:'未月燥土生金。壬庚甲，壬水调候。',7:'申月金当令。壬甲并用。',8:'酉月金旺极。壬甲并用。',9:'戌月燥土埋金。壬甲并用。',10:'亥月水冷金寒。壬丙为用。',11:'子月冰寒水冷。丙戊壬甲。',12:'丑月冻土埋金。丙壬戊己。'},
  壬:{1:'寅月木旺泄水。庚丙戊，以庚金发源为先。',2:'卯月木旺水衰。戊辛庚。',3:'辰月水库当令。甲庚并用。',4:'巳月火旺水渴。壬辛为用，辛金发源。',5:'午月火旺水衰。癸庚辛。',6:'未月燥土克水。辛甲为用。',7:'申月金旺生水。戊丁为用。',8:'酉月金旺生水。甲庚并用。',9:'戌月燥土克水。甲丙并用。',10:'亥月水当令旺。戊庚丁，戊土为先。',11:'子月水旺极。戊辛为用。',12:'丑月寒水凝冰。丙丁甲。'},
  癸:{1:'寅月木旺泄水。辛丙并用，辛金发源为先。',2:'卯月木旺水衰。庚辛并用。',3:'辰月水库当令。丙辛甲，丙火暖水为先。',4:'巳月火旺水枯。辛金为用。',5:'午月火炎水涸。庚壬癸。',6:'未月燥土克水。庚辛并用。',7:'申月金旺生水。丁火为用。',8:'酉月金旺生水。辛丙并用。',9:'戌月燥土克水。辛甲癸壬。',10:'亥月水当令。庚辛戊丁。',11:'子月水冷冰寒。丙辛并用。',12:'丑月冻水成冰。丙丁为用。'},
}

// === ShenSha Calculation ===

export function calcPillarShenSha(tg: string[], dz: string[], dayGan: string, dayZhi: string, dayGz: string): PillarShenSha[] {
  const pillarNames = ['年柱','月柱','日柱','时柱']
  const push = (items: { name: string; type: '吉'|'凶'|'中性' }[], name: string, type: '吉'|'凶'|'中性') => { if (!items.some(x => x.name === name)) items.push({name, type}) }
  return [0,1,2,3].map(i => {
    const g = tg[i], z = dz[i]
    const items: { name: string; type: '吉'|'凶'|'中性' }[] = []
    const ty = TIANYI[dayGan] || []; if (ty.includes(z)) push(items, '天乙贵人', '吉')
    if (WENCHANG[dayGan] === z) push(items, '文昌贵人', '吉')
    if (YANGREN[dayGan] === z) push(items, '羊刃', '凶')
    if (JINYU[dayGan] === z) push(items, '金舆', '吉')
    if (FUXING[dayGan] === z) push(items, '福星贵人', '吉')
    if (TIANCHU[g] === z) push(items, '天厨', '吉')
    if (XUETANG[dayGan] === z) push(items, '学堂', '吉')
    if (HONGYAN[dayGan] === z) push(items, '红艳', '中性')
    if (LIUXIA[dayGan] === z) push(items, '流霞', '凶')
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
    const mZhi = dz[1]
    if (TIANDE[mZhi] === g) push(items, '天德贵人', '吉')
    if (YUEDE[mZhi] === g) push(items, '月德贵人', '吉')
    if (TIANYI_MED[mZhi] === z) push(items, '天医', '吉')
    if (TIANSHENG[mZhi] === g && i < 2) push(items, '天赦', '吉')
    if (i === 3) { const sf = SIFEI_MONTH[mZhi]; if (sf && sf.includes(z)) push(items, '四废', '凶') }
    if (i === 2) {
      if (KUI_GANG_RI.has(dayGz)) push(items, '魁罡', '中性')
      if (SHIE.has(dayGz)) push(items, '十恶大败', '凶')
      if (GULUAN.has(dayGz)) push(items, '孤鸾杀', '凶')
      if (YINYANG_CUO.has(dayGz)) push(items, '阴阳差错', '凶')
      if (JIUCHOU.has(dayGz)) push(items, '九丑', '凶')
      if (z === '辰') push(items, '天罗', '凶')
      if (z === '戌') push(items, '地网', '凶')
    }
    if (i === 0) { const allTg = tg.slice(0,3).join(''); if (allTg === '甲戊庚' || allTg === '乙丙丁' || allTg === '壬癸辛') push(items, '三奇贵人', '吉') }
    return { pillarName: pillarNames[i], items: items.length > 0 ? items : [{name:'无', type:'中性'}] }
  })
}

export function mergeShenSha(pillarShenSha: PillarShenSha[]): ShenShaItem[] {
  const seen = new Set<string>()
  const all: ShenShaItem[] = []
  for (const p of pillarShenSha) {
    for (const item of p.items) {
      if (item.name !== '无' && !seen.has(item.name)) {
        seen.add(item.name)
        const info = SHENSHA_INFO[item.name]
        all.push({ name: item.name, type: item.type, meaning: info ? info.meaning : '', resolve: info ? info.resolve : undefined })
      }
    }
  }
  const order = ['吉','中性','凶']
  all.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
  return all.length > 0 ? all : [{ name:'无特殊神煞', type:'中性', meaning:'' }]
}

export function getPillarShenShaLabel(items: { name: string; type: '吉'|'凶'|'中性' }[]): string {
  const emoji: Record<string,string> = {
    '天乙贵人':'✨','文昌贵人':'📖','驿马':'🏇','桃花':'🌸','羊刃':'⚔️','华盖':'🎭','劫煞':'⚠️','孤辰':'🌙','寡宿':'☁️',
    '天德贵人':'☀️','月德贵人':'🌙','将星':'⭐','金舆':'🚗','天厨':'🍳','福星贵人':'🎁','天赦':'🙏','学堂':'📚',
    '天喜':'🎊','天医':'🏥','红艳':'💋','流霞':'🩸','三奇贵人':'🌟','元辰':'💸','勾神':'🔗','绞煞':'🪢',
    '大耗':'💧','小耗':'💦','天罗':'🕸️','地网':'🪤','四废':'🎈','十恶大败':'💀','魁罡':'🎯','孤鸾杀':'🕊️','阴阳差错':'⚡','九丑':'😈',
  }
  return items.filter(x => x.name !== '无').map(x => (emoji[x.name] || '') + x.name).join(' ') || '—'
}

// === Strength & Analysis ===

export function strength(wx: Record<string,number>, dg: string): { level: string; detail: string } {
  const dw = wxM[dg]; const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const bf = wx[dw] + (wx[sheng[dw]] || 0)
  return { level: bf >= 5 ? '身旺' : bf >= 3 ? '中和' : '身弱', detail: `日主${dg}属${dw}` }
}

export function comprehensiveAnalysis(dg: string, dz: string, wx: Record<string,number>, pills: PillarInfo[], zodiac: string, lunar: { getMonth(): number }, monthZhi: string, shenSha: ShenShaItem[], gender: string) {
  const dw = wxM[dg]
  const shengWx: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const keWx: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const xieWx: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const yongshen = shengWx[dw]; const jishen = keWx[dw]; const xieshen = xieWx[dw]
  const bf = wx[dw] + (wx[yongshen] || 0); const kx = (wx[jishen] || 0) + (wx[xieshen] || 0)
  const wxSorted = Object.entries(wx).sort((a,b) => b[1]-a[1])
  const wxMax = wxSorted[0]
  const lMonth = lunar.getMonth()
  const monthNames = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  const mName = monthNames[lMonth] || '当月'
  const ssN = pills.map(p => p.ssG)

  const general: string[] = []
  general.push(`日干${dg}，五行属${dw}，名曰「${ny[pills[2].gz] || dw}」。${wxSorted[4][1]===0?'命局缺'+wxSorted[4][0]+'，宜在后天补益。':''}八字中${wxMax[0]}最旺（${wxMax[1]}个）、${wxSorted[4][0]}最弱（${wxSorted[4][1]}个）。`)
  if (bf > kx + 2) general.push(`日主偏旺，以${xieshen}（泄秀）、${jishen}（克制）为用神。`)
  else if (kx > bf + 2) general.push(`日主偏弱，以${yongshen}（生扶）、${dw}（帮扶）为用神。`)
  else general.push(`日主中和，宜根据大运流年灵活取用。`)

  const classical: string[] = []
  const qtText = QT[dg]?.[lMonth]
  if (qtText) classical.push(`《穷通宝鉴》云：生于${lMonth}月，${qtText}`)
  classical.push(`《三命通会》曰：生于${mName}，日主${dg}属${dw}。`)

  const wp = wxPersonality[dw]
  const bjCount = ssN.filter((s:string) => s === '比肩' || s === '劫财').length
  const sslCount = ssN.filter((s:string) => s === '食神' || s === '伤官').length
  const cxCount = ssN.filter((s:string) => s === '正财' || s === '偏财').length
  const gsCount = ssN.filter((s:string) => s === '正官' || s === '七杀').length
  const yxCount = ssN.filter((s:string) => s === '正印' || s === '偏印').length
  const ssPersonality: string[] = []
  if (bjCount >= 2) ssPersonality.push('比劫旺，独立自主，竞争意识强')
  if (sslCount >= 2) ssPersonality.push('食伤旺，才华横溢，富于创造')
  if (cxCount >= 2) ssPersonality.push('财星旺，务实精明，善于理财')
  if (gsCount >= 2) ssPersonality.push('官杀旺，自律严谨，有领导才能')
  if (yxCount >= 2) ssPersonality.push('印星旺，温文尔雅，知书达理')
  let personality = `日主${dg}属${dw}。${wp.positive}${wp.style}`
  if (bf > kx + 2) personality += `身旺，${wp.negative}`
  else if (kx > bf + 2) personality += `身弱，性子偏软，容易犹豫。`
  else personality += `中和之命，性格刚柔并济。`
  if (ssPersonality.length > 0) personality += ` 十神方面：${ssPersonality.join('；')}。`

  const riZhiSS = pills[2]?.ssZ
  const hasTH = shenSha.some(s => s.name.includes('桃花'))
  const hasGC = shenSha.some(s => s.name.includes('孤辰'))
  let love = ''
  if (gender === '男') {
    if (cxCount >= 2) love += '财星旺，异性缘佳，易得贤妻。'
    else if (cxCount === 0) love += '财星不显，感情方面较为被动。'
    else love += '财星有度，感情运势平稳。'
    if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶贤惠。'
    else if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官杀入夫妻宫，配偶较有主见。'
    else love += '夫妻宫平和，婚姻需共同经营。'
  } else {
    if (gsCount >= 2) love += '官杀旺，异性缘佳，夫君有为。'
    else if (gsCount === 0) love += '官杀不显，姻缘较迟。'
    else love += '官星有度，婚姻运势平稳。'
    if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官星入夫妻宫，夫贵妻荣。'
    else if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶经济好。'
    else love += '夫妻宫平和。'
  }
  if (hasTH) love += ' 桃花入命，情路多姿多彩。'
  if (hasGC) love += ' 孤辰入命，感情偏晚成。'

  const hasCY = cxCount > 0; const hasGY = gsCount > 0
  const hasSY = yxCount > 0; const hasSS = sslCount > 0
  let career = ''
  if (hasGY && hasSY) career += '官印相生，贵格。宜公务员、事业单位、教育科研。'
  else if (hasSS && hasCY) career += '食伤生财，富格。宜经商、创业、自由职业。'
  else if (hasGY) career += '官杀旺，宜管理、军警、司法等工作。'
  else if (hasCY) career += '财星旺，宜经商投资、金融贸易。'
  else if (hasSY) career += '印星旺，宜文教科研、出版文化。'
  else if (hasSS) career += '食伤旺，宜艺术设计、演艺创作。'
  else career += '八字平和，宜稳定职业。'

  let wealth = ''
  if (cxCount >= 2) wealth += '财星旺，财运亨通，正财偏财皆旺。'
  else if (cxCount === 1) wealth += '财星有度，财运平稳增长。'
  else if (hasSS) wealth += '食伤生财之意，宜以才华技艺谋财。'
  else if (hasSY) wealth += '印星护身，宜稳健理财。'
  else wealth += '财运平稳，宜量入为出。'

  const other: string[] = []
  if (ssN[0] === '七杀' || ssN[0] === '正官') other.push('【祖荫】年柱见官杀，祖上或有功名。')
  if (ssN[1] === '偏财' || ssN[1] === '正财') other.push('【父母】月柱见财星，父母有财运或经商背景。')
  if (ssN[3] === '食神' || ssN[3] === '伤官') other.push('【晚运】时柱见食伤，子女有才华，晚年享福。')

  return { general, classical, personality, love, career, wealth, other }
}

// === Main Compute Function ===

export function computeBaziChart(params: { tg: string[]; dz: string[]; birthYear: number; gender: string }): BaziChartResult {
  const { tg, dz, birthYear, gender } = params;
  const dg = tg[2];

  function mk(gz: string, gan: string, zhi: string): PillarInfo {
    const hdStems = (hA[zhi] || '').split('')
    const hdSS = hdStems.map(hs => ({ gan: hs, ss: ssM[dg]?.[hs] || '' }))
    return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||''}
  }

  const pills = [mk(tg[0]+dz[0], tg[0], dz[0]), mk(tg[1]+dz[1], tg[1], dz[1]), mk(tg[2]+dz[2], tg[2], dz[2]), mk(tg[3]+dz[3], tg[3], dz[3])]

  const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
  for (const p of pills) {
    if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
    for (const c of (hA[p.zhi] || '')) { if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++ }
  }

  const str = strength(wx, dg)
  const pillarShenSha = calcPillarShenSha(tg, dz, dg, dz[2], tg[2]+dz[2]);
  const shenSha = mergeShenSha(pillarShenSha)
  const zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][((birthYear - 4) % 12 + 12) % 12]
  const lunar = { getYear: () => birthYear, getMonth: () => 1, getDay: () => 1, getYearShengXiao: () => zodiac, toFullString: () => '', getYearInChinese: () => '', getMonthInChinese: () => '', getDayInChinese: () => '' }
  const analysis = comprehensiveAnalysis(dg, dz[2], wx, pills, zodiac, lunar, dz[1], shenSha, gender)

  const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tg[0])
  const isYang = tgIdx % 2 === 0
  const forward = (isYang && gender === '男') || (!isYang && gender === '女')
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  let mTgIdx = stems.indexOf(tg[1]), mDzIdx = branches.indexOf(dz[1])
  const dayunArr: { gz: string; age: number; startYear: number }[] = []
  for (let step = 0; step < 8; step++) {
    if (forward) { mTgIdx = (mTgIdx + 1) % 10; mDzIdx = (mDzIdx + 1) % 12 }
    else { mTgIdx = (mTgIdx + 9) % 10; mDzIdx = (mDzIdx + 11) % 12 }
    dayunArr.push({ gz: stems[mTgIdx] + branches[mDzIdx], age: 3 + step * 10, startYear: birthYear + 3 + step * 10 })
  }

  return { pills, wx, dg, str, zodiac, shenSha, pillarShenSha, dayun: dayunArr, analysis,
    curAge: new Date().getFullYear() - birthYear, birthYear,
    baziStr: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时' }
}
