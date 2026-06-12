'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

import { Solar, Lunar } from 'lunar-typescript'
import CalendarInput, { type CalendarType } from '@/components/CalendarInput'
import { saveChart } from '@/lib/collections'
import { calcTrueSolarHour } from '@/lib/solar-time'

// 非首屏大组件按需加载，减小 initial bundle
const TrueSolarTime = dynamic(() => import('@/components/TrueSolarTime'), { ssr: false })
const DayunChart = dynamic(() => import('@/components/DayunChart'), { ssr: false })

// hour options removed (unused)

interface ShenShaItem { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }

interface BaziResult {
  cal?: string; dateStr: string; bazi: string; solarStr: string; lunarStr: string
  pills: PillarInfo[]; wx: Record<string,number>; dg: string
  str: { level: string; detail: string }; zodiac: string; shenSha: ShenShaItem[]
  pillarShenSha: PillarShenSha[]
  mingGong: string; shenGong: string; taiYuan: string; xunKong: string
  yearDiShi: string; monthDiShi: string; dayDiShi: string; timeDiShi: string
  dayun: { gz: string; age: number; startYear: number; years: { year: number; gz: string; age: number }[] }[]
  analysis: BaziAnalysis; currentAge: number; birthYear: number
  useTrueSolar?: boolean; trueSolarInfo?: string
}

interface PillarInfo {
  gz: string; gan: string; zhi: string
  ny: string; wxG: string; wxZ: string; hd: string
  hdSS: { gan: string; ss: string }[]
  ssG: string; ssZ: string
}

const wxM: Record<string,string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const ny: Record<string,string> = {甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
const ssM: Record<string,Record<string,string>> = {甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'}}
const hG: Record<string,string> = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}
const hA: Record<string,string> = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}

// ═══════════ 五行性格特征 ═══════════
const wxPersonality: Record<string,{positive:string,negative:string,style:string}> = {
  木:{positive:'仁慈宽厚、正直善良，有领导才能和担当精神。性情温和而不失原则，如参天大树般正直向上。',negative:'固执己见、缺乏变通，有时过于理想主义而不切实际。',style:'木主仁，其性直，其情和。外观清秀，骨格修长，有慈悲恻隐之心。'},
  火:{positive:'热情开朗、慷慨大方，积极进取且乐于助人。性情豪爽，待人真诚，如阳光般温暖人心。',negative:'性急冲动、缺乏耐心，容易三分钟热度，有时锋芒太露招人嫉妒。',style:'火主礼，其性急，其情恭。外观威仪，面色红润，待人彬彬有礼但内心刚烈。'},
  土:{positive:'稳重笃实、诚信可靠，胸怀宽广有容人之量。性情温和敦厚，做事踏实不浮夸。',negative:'保守固执、缺乏创新，有时做事拖沓不够果断。',style:'土主信，其性重，其情厚。外观敦厚，腰圆背阔，言必信行必果。'},
  金:{positive:'刚毅果断、意志坚强，好胜心强且富有魄力。性情刚直，做事雷厉风行不拖泥带水。',negative:'冲动急躁、易得罪人，有时过于刚烈不知变通。',style:'金主义，其性刚，其情烈。外观骨肉匀停，面色白净，为人慷慨讲义气。'},
  水:{positive:'聪慧包容、志向远大，机智灵活善于变通。性情深沉内敛，如渊似海有容人之量。',negative:'心性不定、容易动摇，有时过于圆滑让人捉摸不透。',style:'水主智，其性聪，其情善。外观丰腴，面色黑亮，头脑灵活足智多谋。'},
}

// ═══════════ 神煞系统 — 完整版（30种神煞 × 每柱独立计算 + 吉凶详解） ═══════════

// ── 经典神煞（18种） ──
const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅', 寅:'申',午:'申',戌:'申', 巳:'亥',酉:'亥',丑:'亥', 亥:'巳',卯:'巳',未:'巳'}
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉', 寅:'卯',午:'卯',戌:'卯', 巳:'午',酉:'午',丑:'午', 亥:'子',卯:'子',未:'子'}
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰', 寅:'戌',午:'戌',戌:'戌', 巳:'丑',酉:'丑',丑:'丑', 亥:'未',卯:'未',未:'未'}
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳', 寅:'亥',午:'亥',戌:'亥', 巳:'寅',酉:'寅',丑:'寅', 亥:'申',卯:'申',未:'申'}
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
const JIUCHOU: Set<string> = new Set(['戊子','戊午','壬子','壬午','丁卯','丁酉','己卯','己酉','辛卯','辛酉'])

// ── 神煞详解字典（吉/凶/中性 + 涵义 + 化解） ──
interface ShenShaInfo { type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }
const SHENSHA_INFO: Record<string,ShenShaInfo> = {
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
  '太极贵人':{type:'吉',meaning:'太极星，天地初分之神。命带太极贵人，一生多遇奇人异士点化，学识渊博且有独到见解，宜钻研玄学、哲学、命理等深奥学问。'},
  '德秀贵人':{type:'吉',meaning:'德以立身、秀以彰才。命带德秀贵人，品德高尚、才华出众、举止端雅，一生多得他人尊重和信任，名利双收。'},
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

// ── 每柱独立神煞（30种神煞完整计算） ──
interface PillarShenSha { pillarName: string; items: { name: string; type: '吉'|'凶'|'中性' }[] }

function calcPillarShenSha(tg: string[], dz: string[], dayGan: string, dayZhi: string, dayGz: string): PillarShenSha[] {
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

    // ══ 太极贵人（以年干或日干定支） ══
    if (TAIJI[tg[0]] && TAIJI[tg[0]].includes(z)) push(items, '太极贵人', '吉')
    else if (TAIJI[dayGan] && TAIJI[dayGan].includes(z)) push(items, '太极贵人', '吉')

    // ══ 月支衍生 ══
    const mZhi = dz[1]
    // ══ 德秀贵人 ══
    const dx = DEXIU[mZhi]; if (dx && dx.includes(g)) push(items, '德秀贵人', '吉')

    if (TIANDE[mZhi] === g) push(items, '天德贵人', '吉')
    if (YUEDE[mZhi] === g) push(items, '月德贵人', '吉')
    if (TIANYI_MED[mZhi] === z) push(items, '天医', '吉')
    if (TIANSHENG[mZhi] === g && i < 2) push(items, '天赦', '吉')

    // ══ 四废（时柱） ══
    if (i === 3) { const sf = SIFEI_MONTH[mZhi]; if (sf && sf.includes(z)) push(items, '四废', '凶') }

    // ══ 日柱特定组合 ══
    if (i === 2) {
      if (KUI_GANG_RI.has(dayGz)) push(items, '魁罡', '中性')
      if (SHIE.has(dayGz)) push(items, '十恶大败', '凶')
      if (GULUAN.has(dayGz)) push(items, '孤鸾杀', '凶')
      if (YINYANG_CUO.has(dayGz)) push(items, '阴阳差错', '凶')
      if (JIUCHOU.has(dayGz)) push(items, '九丑', '凶')
      if (z === '辰') push(items, '天罗', '凶')
      if (z === '戌') push(items, '地网', '凶')
    }

    // ══ 三奇贵人 ══
    if (i === 0) { const allTg = tg.slice(0,3).join(''); if (allTg === '甲戊庚' || allTg === '乙丙丁' || allTg === '壬癸辛') push(items, '三奇贵人', '吉') }

    return { pillarName: pillarNames[i], items: items.length > 0 ? items : [{name:'—', type:'中性'}] }
  })
}

/** 每柱神煞显示标签 */
function getPillarShenShaLabel(items: { name: string; type: '吉'|'凶'|'中性' }[]): string {
  const emoji: Record<string,string> = {
    '天乙贵人':'✨','文昌贵人':'📖','驿马':'🏇','桃花':'🌸','羊刃':'⚔️','华盖':'🎭','劫煞':'⚠️','孤辰':'🌙','寡宿':'☁️',
    '天德贵人':'☀️','月德贵人':'🌙','将星':'⭐','金舆':'🚗','天厨':'🍳','福星贵人':'🎁','天赦':'🙏','学堂':'📚',
    '天喜':'🎊','天医':'🏥','红艳':'💋','流霞':'🩸','三奇贵人':'🌟','元辰':'💸','勾神':'🔗','绞煞':'🪢',
    '大耗':'💧','小耗':'💦','天罗':'🕸️','地网':'🪤','四废':'🎈','十恶大败':'💀','魁罡':'🎯','孤鸾杀':'🕊️','阴阳差错':'⚡','九丑':'😈','太极贵人':'☯️','德秀贵人':'🌿',
  }
  return items.filter(x => x.name !== '—').map(x => (emoji[x.name] || '') + x.name).join(' ') || '—'
}

/** 合并全局神煞列表（含详解） */
function mergeShenSha(pillarShenSha: PillarShenSha[]): { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }[] {
  const seen = new Set<string>()
  const all: { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }[] = []
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

const shenShaTagColor = (type: string) => {
  if (type === '吉') return 'bg-gold-900/50 text-gold-300 border border-gold-700/50'
  if (type === '凶') return 'bg-red-900/40 text-red-300 border border-red-700/40'
  return 'bg-dark-700 text-gray-400 border border-dark-600'
}

// ═══════════ 《穷通宝鉴》调侯 ═══════════
const QT: Record<string,Record<number,string>> = {
  甲:{1:'正月余寒未退。庚金劈木为用，丙火调候为喜，非丙不暖，非庚不劈。',2:'二月甲临帝旺。庚金七杀雕琢为用，丁火泄秀为美，庚丁两透大贵之格。',3:'三月木老根深。先庚后丁，庚金劈木引火，丁火泄秀。',4:'巳月火旺木渴。癸水润木为用，丁火泄秀，庚金为佐。',5:'午月火旺焚木。癸丁并用，癸水调候为先，无癸则木自焚。',6:'未月燥土当令。癸水调候为先，庚金为辅。',7:'申月金旺克木。丁火泄秀制金为用，庚金当令可为佐。',8:'酉月金锐木伤。丁火丙火并用，庚金劈木引火。',9:'戌月土燥木枯。先壬水润土，再用甲木庚金。',10:'亥月水旺木湿。庚丁并用，丁火暖局为先。',11:'子月天寒地冻。丁火暖局，庚金劈木，寒木向阳方有生机。',12:'丑月冻土当令。丁火暖局为急，庚金劈木次之。'},
  乙:{1:'正月余寒未退。丙火暖局为主，癸水润木为辅。',2:'二月乙木逢春。丙火癸水并用，以丙火泄秀为先。',3:'辰月土旺木渴。癸水润土，丙火泄秀为美。',4:'巳月火炎木渴。癸水为先，辛金七杀为佐。',5:'午月火旺之极。癸水调候，丙火次之，火土燥烈当以润泽为本。',6:'未月燥土克水。癸丙并用，以癸水调候为先。',7:'申月金旺克木。癸水化金生木，丙火泄秀。',8:'酉月金锐锋锐。癸水泄金生木，辛金七杀可借力。',9:'戌月土燥木枯。癸辛并用，先癸后辛。',10:'亥月寒木向暖。丙火戊土为用，以丙暖木为先。',11:'子月冰寒水冷。丙火暖局为第一要务，无丙则生机断绝。',12:'丑月冻土寒木。丙火调候，癸水次之。'},
  丙:{1:'寅月木旺火相。壬水为先，庚金为佐，壬庚两透功名显达。',2:'卯月木旺生火。壬水庚金并用，壬水为先。',3:'辰月土旺晦火。壬甲并用，壬水为先，甲木助火。',4:'巳月火炎土燥。壬水为先，庚金发源，金水配合方佳。',5:'午月火旺至极。壬庚并用，以壬水调候为急。',6:'未月燥土晦火。壬庚并用，水为先，金为辅。',7:'申月金多火熄。壬水戊土，以壬水调候为先。',8:'酉月金旺火衰。壬水为先，借金生水以济炎火。',9:'戌月燥土晦火。甲壬并用，木疏土水润火。',10:'亥月水旺克火。甲木戊土为用，甲木化水生火。',11:'子月水冷火熄。壬戊并用，甲木为辅，冬日火弱宜扶。',12:'丑月寒土困火。壬甲并用，疏土助火。'},
  丁:{1:'寅月木旺火相。甲木引丁火，庚金劈甲为贵。',2:'卯月木旺火炽。庚金劈甲引丁，丁火得甲而明。',3:'辰月土旺晦火。甲木为用，庚金为佐，以甲疏土引火。',4:'巳月火炎土燥。甲庚并用，以甲木生火为要。',5:'午月火旺极。壬水调候，庚金发源，水火既济之象。',6:'未月燥土晦丁。甲壬庚，壬水为先，调候为急。',7:'申月金旺火褪。甲庚丙戊为用，以甲木生丁为先。',8:'酉月金旺火晦。甲庚丙戊并用，木火为要。',9:'戌月燥土困火。甲庚戊，以甲木疏土为先。',10:'亥月寒水克火。甲庚戊并用，木为火之母。',11:'子月寒气逼人。甲庚为用，寒木不生火，须暖局。',12:'丑月冻土寒冰。甲庚为用，丙火暖局。'},
  戊:{1:'寅月木当令克土。丙火甲木，以丙火化木生土为先。',2:'卯月木旺土死。丙甲癸并用，以丙火为先。',3:'辰月土当令。甲丙癸，以甲木疏土为先。',4:'巳月火旺土燥。甲丙癸，甲木为先，疏土透气。',5:'午月火旺土焦。壬甲丙，壬水调候为先。',6:'未月燥土厚重。癸甲丙，癸水调候为先。',7:'申月金旺泄土。丙甲癸，丙火为先，扶土为要。',8:'酉月金旺泄土。丙癸为用，火为土之母。',9:'戌月燥土当令。甲丙癸，甲木疏土为先。',10:'亥月水旺湿土。甲丙并用，燥土为先。',11:'子月寒水冻土。丙甲并用，火暖土为先。',12:'丑月冻土寒冰。丙甲并用，有火则土暖。'},
  己:{1:'寅月木旺克土。丙甲庚并用，以丙火为先。',2:'卯月木旺土死。甲癸丙，用甲疏土为先。',3:'辰月土旺湿厚。丙甲癸，丙火暖土为先。',4:'巳月火炎土燥。癸丙辛，癸水调候为先。',5:'午月火旺土焦。癸丙并用，癸水为先。',6:'未月燥土当令。癸丙并用，以癸水调候。',7:'申月金旺泄土。丙癸并用，以丙火扶土。',8:'酉月金旺泄土。丙癸并用，火为要。',9:'戌月燥土厚重。甲丙癸，甲木为先。',10:'亥月水旺湿土。丙甲戊，丙火为先。',11:'子月寒水冻土。丙戊甲，火土并用。',12:'丑月冻土寒冰。丙戊甲，有火则土暖。'},
  庚:{1:'寅月木旺金囚。丙甲丁，以丙火暖金为先。',2:'卯月木旺金衰。丁甲庚丙，火为先要。',3:'辰月土旺生金。甲丁壬，甲木疏土为先。',4:'巳月火旺金熔。壬丙丁戊，以壬水调候为先。',5:'午月火炎金熔。壬癸为用，水为先。',6:'未月燥土生金。丁甲为用，丁火炼金。',7:'申月金当令。丁甲为用，丁火炼金为利器。',8:'酉月金旺极。丁丙并用，火炼真金。',9:'戌月燥土埋金。甲壬并用，甲木疏土为先。',10:'亥月水冷金寒。丁丙并用，火暖金为先。',11:'子月冰寒金凝。丁甲丙并用，火为先。',12:'丑月冻土金埋。丙丁甲，火暖为先。'},
  辛:{1:'寅月木旺金囚。己壬庚，以己土生金为先。',2:'卯月木旺金衰。壬甲并用，壬水为先。',3:'辰月土旺金埋。壬甲并用，甲木疏土为先。',4:'巳月火旺金熔。壬甲癸，壬水调候为先。',5:'午月火炎金熔。壬己癸，以壬水为先。',6:'未月燥土生金。壬庚甲，壬水调候。',7:'申月金当令。壬甲并用，壬水淘洗为用。',8:'酉月金旺极。壬甲并用，水淘金为美。',9:'戌月燥土埋金。壬甲并用，壬水为先。',10:'亥月水冷金寒。壬丙为用，丙火暖局为先。',11:'子月冰寒水冷。丙戊壬甲，火为先。',12:'丑月冻土埋金。丙壬戊己，火暖为先。'},
  壬:{1:'寅月木旺泄水。庚丙戊，以庚金发源为先。',2:'卯月木旺水衰。戊辛庚，戊土制水为先。',3:'辰月水库当令。甲庚并用，甲木疏土为先。',4:'巳月火旺水渴。壬辛为用，辛金发源。',5:'午月火旺水衰。癸庚辛，以癸水助壬。',6:'未月燥土克水。辛甲为用，辛金发源。',7:'申月金旺生水。戊丁为用，戊土制水。',8:'酉月金旺生水。甲庚并用，甲木泄水。',9:'戌月燥土克水。甲丙并用，甲木疏土。',10:'亥月水当令旺。戊庚丁，戊土为先。',11:'子月水旺极。戊辛为用，戊土制水。',12:'丑月寒水凝冰。丙丁甲，火暖为先。'},
  癸:{1:'寅月木旺泄水。辛丙并用，辛金发源为先。',2:'卯月木旺水衰。庚辛并用，金生水为先。',3:'辰月水库当令。丙辛甲，丙火暖水为先。',4:'巳月火旺水枯。辛金为用，金生水。',5:'午月火炎水涸。庚壬癸，金水并用。',6:'未月燥土克水。庚辛并用，金生水为先。',7:'申月金旺生水。丁火为用，丁火暖水。',8:'酉月金旺生水。辛丙并用，辛金为先。',9:'戌月燥土克水。辛甲癸壬，辛金为先。',10:'亥月水当令。庚辛戊丁，庚辛为先。',11:'子月水冷冰寒。丙辛并用，火为先。',12:'丑月冻水成冰。丙丁为用，火暖为先。'},
}

// ═══════════ 神煞对性格的影响 ═══════════
interface ShenShaEffect { has: boolean; effect: string }
function ssEffect(shenSha: ShenShaItem[], key: string): ShenShaEffect {
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

// ═══════════ 八字分析引擎 ═══════════
interface BaziAnalysis {
  general: string[]
  classical: string[]
  personality: string
  love: string
  career: string
  wealth: string
  other: string[]
}

function comprehensiveAnalysis(dg: string, dz: string, wx: Record<string,number>, pillars: PillarInfo[], zodiac: string, lunar: { getMonth(): number }, monthZhi: string, shenSha: ShenShaItem[], gender: string): BaziAnalysis {
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

  // ═══ 1. 概述 ═══
  const general: string[] = []
  general.push(`日干${dg}，五行属${dw}，名曰「${ny[pillars[2].gz] || dw}」。${wxSorted[4][1]===0?'命局缺'+wxSorted[4][0]+'，宜在后天补益。':''}八字中${wxMax[0]}最旺（${wxMax[1]}个）、${wxSorted[4][0]}最弱（${wxSorted[4][1]}个）。`)
  if (bf > kx + 2) general.push(`日主偏旺，以${xieshen}（泄秀）、${jishen}（克制）为用神。喜行${xieshen}${jishen}运，忌${yongshen}${dw}运。`)
  else if (kx > bf + 2) general.push(`日主偏弱，以${yongshen}（生扶）、${dw}（帮扶）为用神。喜行${yongshen}${dw}运，忌${xieshen}${jishen}运。`)
  else general.push(`日主中和，宜根据大运流年灵活取用。喜${dw}${yongshen}运帮扶，各方面较为均衡。`)

  // ═══ 2. 古籍 ═══
  const classical: string[] = []
  const qtText = QT[dg]?.[lMonth]
  if (qtText) classical.push(`《穷通宝鉴》云：生于${lMonth}月，${qtText}`)
  classical.push(`《三命通会》曰：生于${mName}，日主${dg}属${dw}。四柱八字为${pillars.map(p => p.gz).join(' ')}，五行宜调和，大运顺逆须详推。`)

  // ═══ 3. 性格分析 ═══
  const wp = wxPersonality[dw]
  // 神煞对性格影响
  const ssEffs = [
    ssEffect(shenSha, '文昌'), ssEffect(shenSha, '华盖'), ssEffect(shenSha, '桃花'),
    ssEffect(shenSha, '羊刃'), ssEffect(shenSha, '孤辰'), ssEffect(shenSha, '天乙'),
  ].filter(e => e.has).map(e => `「${(shenSha.find((s: ShenShaItem) => e.effect.includes(s.name))||{name: ''}).name}」${e.effect}`).join('')

  // 十神对性格影响
  const ssN = pillars.map(p => p.ssG)
  const bjCount = ssN.filter((s:string) => s === '比肩' || s === '劫财').length
  const ssCount = ssN.filter((s:string) => s === '食神' || s === '伤官').length
  const cxCount = ssN.filter((s:string) => s === '正财' || s === '偏财').length
  const gsCount = ssN.filter((s:string) => s === '正官' || s === '七杀').length
  const yxCount = ssN.filter((s:string) => s === '正印' || s === '偏印').length
  const ssPersonality: string[] = []
  if (bjCount >= 2) ssPersonality.push('比劫旺，独立自主，竞争意识强，好面子重义气')
  if (ssCount >= 2) ssPersonality.push('食伤旺，才华横溢，富于创造，口才表达能力强')
  if (cxCount >= 2) ssPersonality.push('财星旺，务实精明，善于理财，注重实际利益')
  if (gsCount >= 2) ssPersonality.push('官杀旺，自律严谨，有领导才能和责任心')
  if (yxCount >= 2) ssPersonality.push('印星旺，温文尔雅，知书达理，好学不倦')

  let personality = `日主${dg}属${dw}。${wp.positive}${wp.style}`
  if (bf > kx + 2) personality += `身旺，${wp.negative}`
  else if (kx > bf + 2) personality += `身弱，性子偏软，容易犹豫，需增强自信。`
  else personality += `中和之命，性格刚柔并济，能屈能伸。`
  if (ssPersonality.length > 0) personality += ` 十神方面：${ssPersonality.join('；')}。`
  if (ssEffs) personality += ` ${ssEffs}`

  // ═══ 4. 感情分析 ═══
  const riZhiSS = pillars[2]?.ssZ
  const hasTH = shenSha.some(s => s.name.includes('桃花'))
  const hasGC = shenSha.some(s => s.name.includes('孤辰'))
  let love = ''
  if (gender === '男') {
    // 男命看财星
    if (cxCount >= 2) love += '财星旺，异性缘佳，易得贤妻。'
    else if (cxCount === 0) love += '财星不显，感情方面较为被动，宜主动争取。'
    else love += '财星有度，感情运势平稳。'
    if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶贤惠持家，婚姻美满。'
    else if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官杀入夫妻宫，配偶较有主见，需多沟通。'
    else love += '夫妻宫平和，婚姻需双方共同经营。'
  } else {
    // 女命看官杀
    if (gsCount >= 2) love += '官杀旺，异性缘佳，夫君有为。'
    else if (gsCount === 0) love += '官杀不显，姻缘较迟，宜耐心等待良缘。'
    else love += '官星有度，婚姻运势平稳。'
    if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官星入夫妻宫，夫贵妻荣，婚姻顺遂。'
    else if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶经济能力好，生活无忧。'
    else love += '夫妻宫平和，宜互敬互谅经营感情。'
  }
  if (hasTH) love += ' 桃花入命，情路多姿多彩，但需防范烂桃花。'
  if (hasGC) love += ' 孤辰入命，感情上偏晚成，宜先立业后成家。'

  // ═══ 5. 事业分析 ═══
  let career = ''
  const hasCY = ssN.includes('正财') || ssN.includes('偏财')
  const hasGY = ssN.includes('正官') || ssN.includes('七杀')
  const hasSY = ssN.includes('正印') || ssN.includes('偏印')
  const hasSS = ssN.includes('食神') || ssN.includes('伤官')
  const hasYM = shenSha.some(s => s.name.includes('驿马'))

  if (hasGY && hasSY) career += '官印相生，贵格。宜公务员、事业单位、教育科研，仕途顺遂。'
  else if (hasSS && hasCY) career += '食伤生财，富格。宜经商、创业、自由职业，以技艺才华赚钱。'
  else if (hasGY) career += '官杀旺，事业心强。宜管理岗位、军警、司法等纪律性强的工作。'
  else if (hasCY) career += '财星旺，宜经商投资、金融贸易。善于抓住商机。'
  else if (hasSY) career += '印星旺，宜文教科研、出版文化。有学术天赋和钻研精神。'
  else if (hasSS) career += '食伤旺，宜艺术设计、演艺、创作类工作。才华横溢。'
  else career += '八字平和，宜稳定职业，积累经验再图发展。'
  if (hasYM) career += ' 驿马入命，宜外出发展或从事经常出差、流动性强的工作。'

  // ═══ 6. 财运分析 ═══
  let wealth = ''
  const cyIsYong = hasCY && (jishen === '金' || jishen === '木' || jishen === '水' || jishen === '火' || jishen === '土')
  if (hasCY && cyIsYong) wealth += '财星为用，财运亨通。适合投资理财，正财偏财皆旺。中年后财源滚滚。'
  else if (hasCY) wealth += '财星为忌，虽有赚钱机会但也需谨慎理财，不宜过度投机。'
  else if (hasSS) wealth += '食伤生财之意，宜以才华技艺谋财，厚积薄发。'
  else if (hasSY) wealth += '印星护身，宜稳健理财。不宜高风险投资，以存蓄为主。'
  else wealth += '财运平稳，宜量入为出，积少成多。中年后可逐渐好转。'

  // ═══ 7. 其他 ═══
  const other: string[] = []
  const ssDz = pillars[2]?.ssZ
  if (ssDz === '正财' || ssDz === '偏财') other.push('【婚姻】财星入夫妻宫，配偶贤惠持家，夫妻同心。')
  else if (ssDz === '正官' || ssDz === '七杀') other.push('【婚姻】官星入夫妻宫，配偶有为有担当。')
  else other.push('【婚姻】夫妻宫平和，婚姻稳定，互敬互谅。')
  if (ssN[0] === '七杀' || ssN[0] === '正官') other.push('【祖荫】年柱见官杀，祖上或有功名，出身不差。')
  if (ssN[1] === '偏财' || ssN[1] === '正财') other.push('【父母】月柱见财星，父母有财运或经商背景。')
  if (ssN[3] === '食神' || ssN[3] === '伤官') other.push('【晚运】时柱见食伤，子女有才华，晚年享受清福。')

  return { general, classical, personality, love, career, wealth, other }
}

// ═══════════ 日主强度 ═══════════
function strength(wx: Record<string,number>, dg: string): { level: string; detail: string } {
  const dw = wxM[dg]; const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const bf = wx[dw] + (wx[sheng[dw]] || 0)
  return { level: bf >= 5 ? '身旺' : bf >= 3 ? '中和' : '身弱', detail: `日主${dg}属${dw}` }
}

// ═══════════ 命宫/身宫/胎元/旬空 手动计算 ═══════════
const _GAN = ['', '甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const _MONTH_ZHI = ['', '寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑']
const _ZHI = ['', '子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

function calcMingGong(yearGan: string, monthZhi: string, timeZhi: string): string {
  const mzi = _MONTH_ZHI.indexOf(monthZhi)
  const tzi = _MONTH_ZHI.indexOf(timeZhi)
  let offset = mzi + tzi
  offset = (offset >= 14 ? 26 : 14) - offset
  // 年干0-indexed（甲=0, 乙=1, …）
  const ygi = _GAN.indexOf(yearGan) - 1
  let ganIdx = (ygi + 1) * 2 + offset
  while (ganIdx > 10) ganIdx -= 10
  return _GAN[ganIdx] + _MONTH_ZHI[offset]
}

function calcShenGong(yearGan: string, monthZhi: string, timeZhi: string): string {
  const mzi = _MONTH_ZHI.indexOf(monthZhi)
  const tzi = _ZHI.indexOf(timeZhi)
  let offset = mzi + tzi
  if (offset > 12) offset -= 12
  const ygi = _GAN.indexOf(yearGan) - 1
  let ganIdx = (ygi + 1) * 2 + offset
  while (ganIdx > 10) ganIdx -= 10
  return _GAN[ganIdx] + _MONTH_ZHI[offset]
}

function calcTaiYuan(monthGan: string, monthZhi: string): string {
  const gi = _GAN.indexOf(monthGan)
  const zi = _MONTH_ZHI.indexOf(monthZhi)
  const tyg = _GAN[gi + 1 > 10 ? gi + 1 - 10 : gi + 1]
  const tyz = _MONTH_ZHI[zi + 3 > 12 ? zi + 3 - 12 : zi + 3]
  return tyg + tyz
}

function calcXunKong(dayGan: string, dayZhi: string): string {
  const gan0 = _GAN.indexOf(dayGan) - 1  // 0-based
  const zhi0 = _ZHI.indexOf(dayZhi) - 1  // 0-based
  const residue = (zhi0 - gan0 + 12) % 12
  const kMap: Record<number,number> = {0:0, 2:5, 4:4, 6:3, 8:2, 10:1}
  const k = kMap[residue] ?? 0
  const cycleIdx = gan0 + 10 * k
  const xunIdx = Math.floor(cycleIdx / 10)
  return ['戌亥','申酉','午未','辰巳','寅卯','子丑'][xunIdx]
}

export default function BaziClient() {

  const now = new Date()
  const [mode, setMode] = useState<'date'|'bazi'>('date')
  const [cal, setCal] = useState<'solar'|'lunar'>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('11')
  const [gender, setGender] = useState('男')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [bzTg, setBzTg] = useState(['甲','甲','甲','甲'])
  const [bzDz, setBzDz] = useState(['子','寅','午','子'])
  const [bzYear, setBzYear] = useState(String(new Date().getFullYear()))
  const [result, setResult] = useState<BaziResult | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // 真太阳时状态
  const [useTrueSolar, setUseTrueSolar] = useState(false)
  const [longitude, setLongitude] = useState(116.4)
  const [timezone, setTimezone] = useState(8)


  const switchCal = (newCal: 'solar'|'lunar') => {
    const y=parseInt(year),m=parseInt(month),d=parseInt(day)
    if (!isNaN(y)&&!isNaN(m)&&!isNaN(d)&&m>=1&&m<=12&&d>=1&&d<=31) {
      try {
        if (newCal==='solar' && cal==='lunar') {
          const lun=Lunar.fromYmd(y, isLeapMonth ? -m : m, d); const sol=lun.getSolar()
          setYear(String(sol.getYear())); setMonth(String(sol.getMonth())); setDay(String(sol.getDay())); setIsLeapMonth(false)
        } else if (newCal==='lunar' && cal==='solar') {
          const sol=Solar.fromYmd(y,m,d); const lun=sol.getLunar()
          setYear(String(lun.getYear())); setMonth(String(lun.getMonth())); setDay(String(lun.getDay()))
        }
      } catch {}
    }
    setCal(newCal); setIsLeapMonth(false)
  }

  const doCalc = () => {
    setError(''); setResult(null)
    if (mode === 'bazi') {
      try {
        const tg = bzTg as string[], dz = bzDz as string[], dg = tg[2]
        const birthYear = parseInt(bzYear)
        
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

        // 手动排大运：年干阴阳定顺逆 + 出生年份确定岁数
        const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tg[0])
        const isYang = tgIdx % 2 === 0
        const forward = (isYang && gender === '男') || (!isYang && gender === '女')
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
        
        let mTgIdx = stems.indexOf(tg[1])
        let mDzIdx = branches.indexOf(dz[1])
        const dayunArr: { gz: string; age: number; startYear: number; years: { year: number; gz: string; age: number }[] }[] = []
        
        for (let step = 0; step < 8; step++) {
          if (forward) { mTgIdx = (mTgIdx + 1) % 10; mDzIdx = (mDzIdx + 1) % 12 }
          else { mTgIdx = (mTgIdx + 9) % 10; mDzIdx = (mDzIdx + 11) % 12 }
          const dyGz = stems[mTgIdx] + branches[mDzIdx]
          const startAge = 3 + step * 10
          const startYear = birthYear + startAge
          const years = []
          for (let y = 0; y < 10; y++) {
            const yy = startYear + y
            const gi = (yy - 4) % 10 >= 0 ? (yy - 4) % 10 : (yy - 4) % 10 + 10
            const bi = (yy - 4) % 12 >= 0 ? (yy - 4) % 12 : (yy - 4) % 12 + 12
            years.push({ year: yy, gz: stems[gi] + branches[bi], age: startAge + y })
          }
          dayunArr.push({ gz: dyGz, age: startAge, startYear, years })
        }

        // 计算当前年龄（bazi mode）
        const now3 = new Date()
        const curAge2 = now3.getFullYear() - birthYear

        setResult({
          dateStr: '直接排盘 · ' + birthYear + '年 ' + tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时 · '+gender+'命',
          bazi: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时',
          solarStr: '', lunarStr: '直接输入八字排盘 · ' + birthYear + '年（大运估算，起运3岁）',
          pills, wx, dg, str, zodiac, shenSha,
          pillarShenSha,
          mingGong: calcMingGong(tg[0], dz[1], dz[3]), shenGong: calcShenGong(tg[0], dz[1], dz[3]), taiYuan: calcTaiYuan(tg[1], dz[1]), xunKong: calcXunKong(tg[2], dz[2]),
          yearDiShi: '', monthDiShi: '', dayDiShi: '', timeDiShi: '',
          dayun: dayunArr, analysis,
          currentAge: curAge2, birthYear,
        })
      } catch(e){ setError('排盘出错：' + ((e as {message?: string})?.message || '请检查天干地支和出生年份')) }
      return
    }
    
    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31||h<0||h>23){setError('日期无效：年份、月份、日期或时辰不正确');return}
    try {
      // 真太阳时 + 时区调整
      let adjustedHour = h
      const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      if (useTrueSolar) {
        adjustedHour = calcTrueSolarHour(dateStr, h, longitude)
      } else if (timezone !== 8) {
        // 非北京时区
        adjustedHour = h + (timezone - 8)
      }
      const finalHour = Math.round(adjustedHour) % 24

      let ec, solar, lunar
      if (cal === 'lunar') {
        const lm = isLeapMonth ? -m : m
        if (!Lunar.fromYmd) { setError('日期库未加载'); return }
        // 预检查输入的农历月日是否存在
        let maxDays = 30
        try {
          Lunar.fromYmd(y, lm, 30)
        } catch {
          maxDays = 29
        }
        if (d > maxDays) { setError('该农历月只有' + maxDays + '天，请输入1-' + maxDays + '日'); return }
        lunar = Lunar.fromYmd(y, lm, d)
        const ls = lunar.getSolar()
        solar = Solar.fromYmdHms(ls.getYear(), ls.getMonth(), ls.getDay(), finalHour, 0, 0)
        ec = solar.getLunar().getEightChar()
      } else {
        solar = Solar.fromYmdHms(y, m, d, finalHour, 0, 0)
        lunar = solar.getLunar()
        ec = lunar.getEightChar()
      }
      const dg = ec.getDayGan(), dz = ec.getDayZhi()
      const monthZhi = ec.getMonthZhi()

      function mk(gz: string, gan: string, zhi: string) {
        const hiddenStems = (hA[zhi] || '').split('')
        const hdSS = hiddenStems.map((hs: string) => ({ gan: hs, ss: ssM[dg]?.[hs] || '' }))
        return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||'' }
      }
      const pills = [
        mk(ec.getYear(), ec.getYearGan(), ec.getYearZhi()),
        mk(ec.getMonth(), ec.getMonthGan(), ec.getMonthZhi()),
        mk(ec.getDay(), dg, dz),
        mk(ec.getTime(), ec.getTimeGan(), ec.getTimeZhi()),
      ]
      const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
      for (const p of pills) {
        if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
        for (const c of (hA[p.zhi] || '')) { if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++ }
      }
      const str = strength(wx, dg)
      const zodiac = lunar.getYearShengXiao()
      const pillarShenSha = calcPillarShenSha([ec.getYearGan(),ec.getMonthGan(),dg,ec.getTimeGan()], [ec.getYearZhi(),ec.getMonthZhi(),dz,ec.getTimeZhi()], dg, dz, dg+dz)
      const shenSha = mergeShenSha(pillarShenSha)

      const dayun: { gz: string; age: number; startYear: number; years: { year: number; gz: string; age: number }[] }[] = []
      try { const yun=ec.getYun(gender==='男'?1:0); const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']; const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']; for(const x of yun.getDaYun()){const gz=x.getGanZhi();if(!gz)continue;const sy=x.getStartYear();const years=[];for(let i=0;i<10;i++){const yy=sy+i;years.push({year:yy,gz:stems[((yy-4)%10+10)%10]+branches[((yy-4)%12+12)%12],age:x.getStartAge()+i})};dayun.push({gz,age:x.getStartAge(),startYear:sy,years})} } catch{}

      const analysis = comprehensiveAnalysis(dg, dz, wx, pills, zodiac, lunar, monthZhi, shenSha, gender)

      // 计算当前年龄
      const now2 = new Date()
      let currentAge = now2.getFullYear() - solar.getYear()
      if (now2 < new Date(now2.getFullYear(), solar.getMonth() - 1, solar.getDay())) currentAge--

      setResult({
        cal, dateStr: `${cal==='solar'?`公历${solar.toFullString()}`:`农历${lunar.toFullString()}`} · ${gender}命`,
        bazi: `${pills[0].gz}年 ${pills[1].gz}月 ${pills[2].gz}日 ${pills[3].gz}时`,
        solarStr: `公历${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
        lunarStr: `农历${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
        pills, wx, dg, str, zodiac, shenSha,
        pillarShenSha,
        mingGong: ec.getMingGong(), shenGong: ec.getShenGong(), taiYuan: ec.getTaiYuan(),
        xunKong: ec.getDayXunKong(),
        yearDiShi: ec.getYearDiShi(), monthDiShi: ec.getMonthDiShi(),
        dayDiShi: ec.getDayDiShi(), timeDiShi: ec.getTimeDiShi(),
        dayun, analysis,
        currentAge, birthYear: solar.getYear(),
        useTrueSolar, trueSolarInfo: useTrueSolar ? `真太阳时 · 经度${longitude}°E` : '',
      })
    } catch(e){ setError('计算出错：' + ((e as {message?: string})?.message || '请检查日期是否有效')) }
  }

  const ssColor = (s: string) => {
    if (!s) return 'text-gray-500'
    if (s.includes('比肩')||s.includes('劫财')) return 'text-blue-300'
    if (s.includes('食神')||s.includes('伤官')) return 'text-green-300'
    if (s.includes('正财')||s.includes('偏财')) return 'text-yellow-300'
    if (s.includes('正官')||s.includes('七杀')) return 'text-red-300'
    if (s.includes('正印')||s.includes('偏印')) return 'text-purple-300'
    return 'text-gray-400'
  }

  return (<div className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">生辰八字算命</h1>
    <p className="text-gray-400 mb-8">真太阳时排盘 · 神煞详解 · 古籍论断 · 性格/感情/事业/财运全面分析</p>

    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setMode('date')} aria-label="按日期排盘" className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${mode==='date'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>✨ 公历/农历</button>
        <button onClick={()=>setMode('bazi')} aria-label="直接输入八字排盘" className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${mode==='bazi'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>🔮 直接排盘</button>
        <select value={gender} onChange={e=>setGender(e.target.value)} className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
          <option value="男">男</option><option value="女">女</option>
        </select>
      </div>

      {mode === 'date' && (
        <div className="space-y-4">
          <CalendarInput
            calendarType={cal as CalendarType}
            year={year}
            month={month}
            day={day}
            hour={hour}
            isLeapMonth={isLeapMonth}
            onCalendarTypeChange={(newCal) => {
              // switchCal also handles date conversion
              if (newCal !== cal) switchCal(newCal as 'solar' | 'lunar')
            }}
            onYearChange={setYear}
            onMonthChange={(v) => { setMonth(v); setIsLeapMonth(false) }}
            onDayChange={setDay}
            onHourChange={setHour}
            onLeapMonthChange={setIsLeapMonth}
            label='' compact
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">性别：</span>
            <div className="flex bg-dark-700 rounded-lg p-1 gap-1">
              <button onClick={() => setGender('男')} aria-label="选择男性"
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${gender === '男' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>♂ 男</button>
              <button onClick={() => setGender('女')} aria-label="选择女性"
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${gender === '女' ? 'bg-pink-500 text-white' : 'text-gray-400'}`}>♀ 女</button>
            </div>
          </div>
          <TrueSolarTime
            enabled={useTrueSolar}
            onToggle={setUseTrueSolar}
            longitude={longitude}
            onLongitudeChange={setLongitude}
            timezone={timezone}
            onTimezoneChange={setTimezone}
            compact
          />
        </div>
      )}

      {mode === 'bazi' && (<div className="mb-4">
        <p className="text-[11px] text-gray-500 mb-3">直接输入您已知的四柱八字（天干+地支分别选择）</p>
        {['年','月','日','时'].map((l,i)=>(
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 w-6 shrink-0">{l}</span>
            <select value={bzTg[i]} onChange={e=>{const a=[...bzTg];a[i]=e.target.value;setBzTg(a)}} className="w-20 px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].map(g=><option key={g}>{g}</option>)}
            </select>
            <select value={bzDz[i]} onChange={e=>{const a=[...bzDz];a[i]=e.target.value;setBzDz(a)}} className="w-20 px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].map(d=><option key={d}>{d}</option>)}
            </select>
            <span className="text-[10px] text-gray-600">{bzTg[i]}{bzDz[i]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(' ')}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-dark-600">
          <label className="block text-xs text-gray-500 mb-1">出生年份 <span className="text-gray-600">（确定大运流年起算）</span></label>
          <div className="flex flex-wrap gap-2">
            {(()=>{const t=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(bzTg[0]);const d=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(bzDz[0]);if(t<0||d<0)return null;const ys=[];for(let y=1900;y<=2100;y++){if(((y-4)%10+10)%10===t&&((y-4)%12+12)%12===d)ys.push(y)};return ys.map(y=><button key={y} onClick={()=>setBzYear(String(y))} className={`px-3 py-1.5 rounded text-xs border transition-colors ${bzYear===String(y)?'bg-gold-600 text-dark-900 font-semibold border-gold-500':'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500/50'}`}>{y}</button>)})()}
          </div>
          <p className="text-xs text-gray-600 mt-1.5">同一个八字每60年出现一次，请选择对应的出生年份</p>
        </div>
      </div>)}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} aria-label="开始排盘测算" className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">开始算命</button>
    </div>

    {result && (<div className="space-y-4">
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{result.dateStr}</p>
        <p className="text-base font-bold text-gold-400 font-serif">{result.bazi}</p>
        <p className="text-xs text-gray-500 mt-1">{result.solarStr} · {result.lunarStr}</p>
      </div>

      {/* 四柱命盘 */}
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四柱命盘</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700"><th className="p-2 border border-dark-600 text-gray-500 w-20"></th>
              {['年柱','月柱','日柱','时柱'].map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-gold-400 font-serif text-base">{x.gan}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干十神</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className={`p-2 border border-dark-600 text-center font-medium ${ssColor(x.ssG)}`}>{x.ssG}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-amber-400 font-serif text-base">{x.zhi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支十神</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-cyan-300">{x.ssZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">藏干</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.hd}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">藏干十神</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center">
                  {x.hdSS?.map((h: {gan: string; ss: string},j: number)=><span key={j} className={ssColor(h.ss)}>{h.gan}({h.ss}){' '}</span>)}
                </td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">五行</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center">{x.wxG}{x.wxZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">纳音</td>
                {result.pills.map((x: PillarInfo,i: number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.ny}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>
                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v: string,i: number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">神煞</td>
                {(result.pillarShenSha||[]).map((p: PillarShenSha,i: number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-[10px] leading-relaxed">
                  {getPillarShenShaLabel(p.items)}
                </td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 第一行：五行分布 + 命宫身宫胎元旬空 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">五行分布</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {
Object.entries(result.wx).map(([w,c]): React.ReactNode =>(
              <div key={w} className={`rounded-lg p-2 text-center border border-dark-600 ${w==='金'?'bg-yellow-900/40 text-yellow-300':w==='木'?'bg-green-900/40 text-green-300':w==='水'?'bg-blue-900/40 text-blue-300':w==='火'?'bg-red-900/40 text-red-300':'bg-amber-900/40 text-amber-300'}`}>
                <p className="text-sm font-bold mb-0.5">{w}</p><p className="text-xs text-gray-400">{c}个</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-300">日主{result.dg}属{wxM[result.dg]} · {result.str.level}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">命宫 · 身宫 · 胎元 · 旬空</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-700/60 rounded-lg p-3 border border-dark-600">
              <p className="text-[10px] text-gray-500 mb-1">命宫</p>
              <p className="text-sm font-semibold text-gold-300">{result.mingGong}</p>
            </div>
            <div className="bg-dark-700/60 rounded-lg p-3 border border-dark-600">
              <p className="text-[10px] text-gray-500 mb-1">身宫</p>
              <p className="text-sm font-semibold text-blue-300">{result.shenGong}</p>
            </div>
            <div className="bg-dark-700/60 rounded-lg p-3 border border-dark-600">
              <p className="text-[10px] text-gray-500 mb-1">胎元</p>
              <p className="text-sm font-semibold text-purple-300">{result.taiYuan}</p>
            </div>
            <div className="bg-dark-700/60 rounded-lg p-3 border border-dark-600">
              <p className="text-[10px] text-gray-500 mb-1">旬空</p>
              <p className="text-sm font-semibold text-amber-300">{result.xunKong}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：神煞详解（独占） */}
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">神煞详解 <span className="text-[10px] font-normal text-gray-500">（各柱分布见上表）</span></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {result.shenSha.map((s: ShenShaItem,i: number)=>(
            <div key={i} className={`text-xs p-3 rounded border ${shenShaTagColor(s.type)}`}>
              <span className="font-semibold mr-1.5">{s.name}</span>
              <span className={`text-[10px] ${s.type==='吉'?'text-gold-400/70':s.type==='凶'?'text-red-400/70':'text-gray-500'}`}>（{s.type}）</span>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{s.meaning}</p>
              {s.resolve && <p className="text-[10px] text-amber-400/60 mt-1.5 leading-relaxed">✦ 化解：{s.resolve}</p>}
            </div>
          ))}
        </div>
      </div>
{/* 命理批断 - 概述+古籍 */}
      <div className="bg-dark-800/80 rounded-xl border border-gold-500/30 p-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-3">📜 命理批断</h3>
        {result.analysis.general.map((s:string,i:number)=><p key={i} className="text-xs text-gray-300 mb-1.5 leading-relaxed">{s}</p>)}
        {result.analysis.classical.map((s:string,i:number)=><p key={i} className="text-xs text-amber-300 mb-1 font-medium leading-relaxed">{s}</p>)}
      </div>

      {/* 四大分析模块 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold mb-2 text-blue-400">🧠 性格分析</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{result.analysis.personality}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold mb-2 text-pink-400">💕 感情分析</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{result.analysis.love}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold mb-2 text-cyan-400">💼 事业分析</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{result.analysis.career}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold mb-2 text-green-400">💰 财运分析</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{result.analysis.wealth}</p>
        </div>
      </div>

      {/* 其他 */}
      {result.analysis.other.length > 0 && (
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">📋 其他看点</h3>
          {result.analysis.other.map((s:string,i:number)=><p key={i} className="text-xs text-gray-400 mb-1">{s}</p>)}
        </div>
      )}


      {/* 收藏按钮 */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            if (saved) return
            saveChart({
              type: 'bazi',
              name: `八字命盘 · ${result.bazi || ''}`,
              summary: `${result.dateStr || ''} · ${result.lunarStr || ''} · 日主${result.dg || ''}`,
              data: result as unknown as Record<string, unknown>,
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
          className={`text-sm px-4 py-2 rounded-lg border transition-all ${
            saved
              ? 'border-green-500 bg-green-500/20 text-green-400'
              : 'border-gold-500/50 text-gold-400 hover:bg-gold-500/10'
          }`}
        >
          {saved ? '✅ 已收藏' : '⭐ 收藏命盘'}
        </button>
      </div>

      {/* 大运可视化 */}
      <DayunChart dayun={result.dayun as unknown as { gz: string; age: number; startYear: number; years: { year: number; gz: string; age: number }[] }[]} currentAge={result.currentAge} birthYear={result.birthYear} />
    </div>)}
  </div>)
}