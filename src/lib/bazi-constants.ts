// 八字基础常量表 - 共享给各算命模块

// ─── 天干 ───
export const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
export type TianGan = typeof TIAN_GAN[number]

// ─── 地支 ───
export const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
export type DiZhi = typeof DI_ZHI[number]

// ─── 五行映射 ───
export const WX_MAP: Record<string,string> = {
  甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',
  子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'
}

// ─── 纳音 ───
export const NAYIN_MAP: Record<string,string> = {
  甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',
  庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',
  丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',
  壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',
  戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',
  甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',
  庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',
  丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',
  壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',
  戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'
}

// ─── 藏干 ───
export const CANG_GAN: Record<string,string> = {
  子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',
  午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'
}

// 藏干（数组格式，方便逐个元素访问）
export const CANG_GAN_ARRAY: Record<string, string[]> = {
  子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],
  辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],
  未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],
  戌:['戊','辛','丁'],亥:['壬','甲']
}
export const CANG_GAN_MAIN: Record<string,string> = {
  子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',
  午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'
}

// ─── 十神关系 ───
export const SHI_SHEN: Record<string,Record<string,string>> = {
  甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},
  乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},
  丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},
  丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},
  戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},
  己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},
  庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},
  辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},
  壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},
  癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'},
}

// ─── 时辰选项 ───
export const HOUR_OPTS = [
  {v:'0',l:'子初 23:00-00:59'},{v:'1',l:'丑初 01:00-01:59'},{v:'2',l:'丑正 02:00-02:59'},
  {v:'3',l:'寅初 03:00-03:59'},{v:'4',l:'寅正 04:00-04:59'},{v:'5',l:'卯初 05:00-05:59'},
  {v:'6',l:'卯正 06:00-06:59'},{v:'7',l:'辰初 07:00-07:59'},{v:'8',l:'辰正 08:00-08:59'},
  {v:'9',l:'巳初 09:00-09:59'},{v:'10',l:'巳正 10:00-10:59'},{v:'11',l:'午初 11:00-11:59'},
  {v:'12',l:'午正 12:00-12:59'},{v:'13',l:'未初 13:00-13:59'},{v:'14',l:'未正 14:00-14:59'},
  {v:'15',l:'申初 15:00-15:59'},{v:'16',l:'申正 16:00-16:59'},{v:'17',l:'酉初 17:00-17:59'},
  {v:'18',l:'酉正 18:00-18:59'},{v:'19',l:'戌初 19:00-19:59'},{v:'20',l:'戌正 20:00-20:59'},
  {v:'21',l:'亥初 21:00-21:59'},{v:'22',l:'亥正 22:00-22:59'},{v:'23',l:'子正 23:00-23:59'},
]

// ─── 五行相生 ───
export const SHENG: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
export const KE: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
export const XIE: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}

// ─── 五行性格 ───
export const WX_PERSONALITY: Record<string,{positive:string,negative:string,style:string}> = {
  木:{positive:'仁慈宽厚、正直善良，有领导才能和担当精神。性情温和而不失原则，如参天大树般正直向上。',negative:'固执己见、缺乏变通，有时过于理想主义而不切实际。',style:'木主仁，其性直，其情和。外观清秀，骨格修长，有慈悲恻隐之心。'},
  火:{positive:'热情开朗、慷慨大方，积极进取且乐于助人。性情豪爽，待人真诚，如阳光般温暖人心。',negative:'性急冲动、缺乏耐心，容易三分钟热度，有时锋芒太露招人嫉妒。',style:'火主礼，其性急，其情恭。外观威仪，面色红润，待人彬彬有礼但内心刚烈。'},
  土:{positive:'稳重笃实、诚信可靠，胸怀宽广有容人之量。性情温和敦厚，做事踏实不浮夸。',negative:'保守固执、缺乏创新，有时做事拖沓不够果断。',style:'土主信，其性重，其情厚。外观敦厚，腰圆背阔，言必信行必果。'},
  金:{positive:'刚毅果断、意志坚强，好胜心强且富有魄力。性情刚直，做事雷厉风行不拖泥带水。',negative:'冲动急躁、易得罪人，有时过于刚烈不知变通。',style:'金主义，其性刚，其情烈。外观骨肉匀停，面色白净，为人慷慨讲义气。'},
  水:{positive:'聪慧包容、志向远大，机智灵活善于变通。性情深沉内敛，如渊似海有容人之量。',negative:'心性不定、容易动摇，有时过于圆滑让人捉摸不透。',style:'水主智，其性聪，其情善。外观丰腴，面色黑亮，头脑灵活足智多谋。'},
}

// ─── 五行UI配色 ───
export const WXC: Record<string,string> = {木:'text-green-400',火:'text-red-400',土:'text-amber-400',金:'text-yellow-400',水:'text-blue-400'}
export const WXBG: Record<string,string> = {木:'bg-green-900/30',火:'bg-red-900/30',土:'bg-amber-900/30',金:'bg-yellow-900/30',水:'bg-blue-900/30'}
export const WXBAR: Record<string,string> = {木:'from-green-500 to-green-700',火:'from-red-500 to-red-700',土:'from-amber-500 to-amber-700',金:'from-yellow-500 to-yellow-700',水:'from-blue-500 to-blue-700'}

// ─── 起月干（五虎遁） ───
export const YUE_GAN: Record<string,string[]> = {
  甲:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  乙:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  丙:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  丁:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  戊:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  己:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  庚:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  辛:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  壬:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  癸:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
}

// ─── 起时干（五鼠遁） ───
export const SHI_GAN: Record<string,string[]> = {
  甲:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  乙:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  丙:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  丁:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  戊:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  己:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  庚:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  辛:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  壬:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  癸:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
}
// 时辰→地支索引
export const SHI_CHEN: Record<number,string> = {0:'子',1:'丑',2:'丑',3:'寅',4:'寅',5:'卯',6:'卯',7:'辰',8:'辰',9:'巳',10:'巳',11:'午',12:'午',13:'未',14:'未',15:'申',16:'申',17:'酉',18:'酉',19:'戌',20:'戌',21:'亥',22:'亥',23:'子'}

// ─── 神煞 ───
export const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
export const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
export const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}
export const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'}
export const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
export const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰',寅:'戌',午:'戌',戌:'戌',巳:'丑',酉:'丑',丑:'丑',亥:'未',卯:'未',未:'未'}
export const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅',亥:'申',卯:'申',未:'申'}
export const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅',寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥'}
export const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
export const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}

// ─── 地支六合 ───
export const DZ_LIUHE: Record<string,string> = {子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅'}
export const LIU_HE = DZ_LIUHE
export const DZ_SANHE: Record<string,string[]> = {申:['子','辰'],子:['申','辰'],辰:['申','子'],寅:['午','戌'],午:['寅','戌'],戌:['寅','午'],巳:['酉','丑'],酉:['巳','丑'],丑:['巳','酉'],亥:['卯','未'],卯:['亥','未'],未:['亥','卯']}
export const SAN_HE = DZ_SANHE
export const DZ_CHONG: Record<string,string> = {子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'}
export const LIU_CHONG = DZ_CHONG
export const DZ_XING: Record<string,string> = {子:'卯',丑:'戌',寅:'巳',卯:'子',辰:'辰',巳:'寅',午:'午',未:'丑',申:'寅',酉:'酉',戌:'丑',亥:'亥'}
export const DZ_HAI: Record<string,string> = {子:'未',丑:'午',寅:'巳',卯:'辰',辰:'卯',巳:'寅',午:'丑',未:'子',申:'亥',酉:'戌',戌:'酉',亥:'申'}
// 害（LIU_CHUAN / LIU_HAI 是六害的别名）
export const LIU_CHUAN = DZ_HAI
export const LIU_HAI = DZ_HAI
export const DZ_PO: Record<string,string> = {子:'酉',丑:'辰',寅:'亥',卯:'午',辰:'丑',巳:'申',午:'卯',未:'戌',申:'巳',酉:'子',戌:'未',亥:'寅'}

// ─── 生肖六合三合冲害破 ───
export const SHENGXIAO: Record<string,{liuhe:string,sanhe:string[],chong:string,hai:string,po:string}> = {
  鼠:{liuhe:'牛',sanhe:['猴','龙'],chong:'马',hai:'羊',po:'鸡'},
  牛:{liuhe:'鼠',sanhe:['蛇','鸡'],chong:'羊',hai:'马',po:'龙'},
  虎:{liuhe:'猪',sanhe:['马','狗'],chong:'猴',hai:'蛇',po:'猪'},
  兔:{liuhe:'狗',sanhe:['猪','羊'],chong:'鸡',hai:'龙',po:'鼠'},
  龙:{liuhe:'鸡',sanhe:['鼠','猴'],chong:'狗',hai:'兔',po:'牛'},
  蛇:{liuhe:'猴',sanhe:['牛','鸡'],chong:'猪',hai:'虎',po:'猴'},
  马:{liuhe:'羊',sanhe:['虎','狗'],chong:'鼠',hai:'牛',po:'兔'},
  羊:{liuhe:'马',sanhe:['兔','猪'],chong:'牛',hai:'鼠',po:'狗'},
  猴:{liuhe:'蛇',sanhe:['鼠','龙'],chong:'虎',hai:'猪',po:'蛇'},
  鸡:{liuhe:'龙',sanhe:['蛇','牛'],chong:'兔',hai:'狗',po:'鼠'},
  狗:{liuhe:'兔',sanhe:['虎','马'],chong:'龙',hai:'鸡',po:'羊'},
  猪:{liuhe:'虎',sanhe:['兔','羊'],chong:'蛇',hai:'猴',po:'虎'},
}

// ─── 生肖序号→文字 ───
export const ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']

// ─── 年份→生肖 ───
export function getAnimal(year: number): string {
  return ANIMALS[(year - 4) % 12]
}

// ─── 计算年柱天干 ───
export function calcYearGan(year: number): string {
  return TIAN_GAN[(year - 4) % 10]
}

// ─── 计算年柱地支 ───
export function calcYearZhi(year: number): string {
  return DI_ZHI[(year - 4) % 12]
}

// ─── 月柱天干（五虎遁） ───
export function calcMonthGan(yearGan: string, monthZhiIdx: number): string {
  const table = YUE_GAN[yearGan]
  return table ? table[monthZhiIdx] : ''
}

// ─── 月柱地支（正月寅） ───
export function calcMonthZhi(month: number): string {
  return DI_ZHI[(month + 1) % 12]  // 寅=2 → 月1→寅(2), 月2→卯(3)...
}

// ─── 日柱天干地支（简易推算，1900-2100年） ───
export function calcDayGanZhi(year: number, month: number, day: number): [string, string] {
  // 基数：1900年1月1日为甲子日
  const yc = year - 1900
  let totalDays = yc * 365 + Math.floor((yc - 1) / 4) + Math.floor((year - 1901) / 400) - Math.floor((year - 1901) / 100)
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31]
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) daysInMonth[1] = 29
  for (let i = 0; i < month - 1; i++) totalDays += daysInMonth[i]
  totalDays += day
  const ganIdx = (totalDays - 1) % 10
  const zhiIdx = (totalDays - 1) % 12
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

// ─── 时柱天干（五鼠遁） ───
export function calcHourGan(dayGan: string, hour: number): string {
  const zhiIdx = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(SHI_CHEN[hour] || '子')
  const table = SHI_GAN[dayGan]
  return table ? table[zhiIdx] : ''
}

// ─── 完整八字计算（从公历日期） ───
export function calcBaziFromSolar(year: number, month: number, day: number, hour: number): {tg:string[],dz:string[],gz:string[],nayin:string[],wxTg:string[],wxDz:string[],cang:string[],riZhu:string,riZhuWx:string} {
  const yearGan = calcYearGan(year)
  const yearZhi = calcYearZhi(year)
  const monthZhiIdx = (month + 1) % 12
  const monthGan = calcMonthGan(yearGan, monthZhiIdx)
  const monthZhi = DI_ZHI[monthZhiIdx]
  const [dayGan, dayZhi] = calcDayGanZhi(year, month, day)
  const hourZhi = SHI_CHEN[hour] || '子'
  const hourGan = calcHourGan(dayGan, hour)
  const tgs = [yearGan, monthGan, dayGan, hourGan]
  const dzs = [yearZhi, monthZhi, dayZhi, hourZhi]
  const gzs = tgs.map((g,i)=>g+dzs[i])
  const nys = gzs.map(g=>NAYIN_MAP[g]||'')
  const wt = tgs.map(g=>WX_MAP[g]||'')
  const wd = dzs.map(d=>WX_MAP[d]||'')
  const cg = dzs.map(d=>CANG_GAN[d]||'')
  return {tg:tgs,dz:dzs,gz:gzs,nayin:nys,wxTg:wt,wxDz:wd,cang:cg,riZhu:dayGan+dayZhi,riZhuWx:WX_MAP[dayGan]||''}
}

// ─── 直接从四柱八字计算（不依赖日期） ───
export function calcBaziFromGanzhi(tg: string[], dz: string[]): {tg:string[],dz:string[],gz:string[],nayin:string[],wxTg:string[],wxDz:string[],cang:string[],riZhu:string,riZhuWx:string} {
  const gzs = tg.map((g,i)=>g+dz[i])
  const nys = gzs.map(g=>NAYIN_MAP[g]||'')
  const wt = tg.map(g=>WX_MAP[g]||'')
  const wd = dz.map(d=>WX_MAP[d]||'')
  const cg = dz.map(d=>CANG_GAN[d]||'')
  return {tg,dz,gz:gzs,nayin:nys,wxTg:wt,wxDz:wd,cang:cg,riZhu:tg[2]+dz[2],riZhuWx:WX_MAP[tg[2]]||''}
}
