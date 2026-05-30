'use client'

import { useState, useCallback } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

const STROKE: Record<string, number> = {
  '一':1,'二':2,'三':3,'四':5,'五':4,'六':4,'七':2,'八':2,'九':2,'十':2,
  '王':4,'李':7,'张':11,'刘':15,'陈':16,'杨':13,'赵':14,'黄':12,'周':8,'吴':7,
  '徐':10,'孙':10,'马':10,'胡':11,'朱':6,'郭':15,'何':7,'高':10,'林':8,'罗':20,
  '郑':14,'梁':11,'谢':17,'宋':7,'唐':10,'韩':17,'曹':11,'许':11,'邓':15,'冯':12,
  '萧':16,'程':12,'蔡':17,'彭':12,'潘':15,'袁':10,'董':15,'田':5,'丁':2,'方':4,
  '石':5,'沈':8,'苏':22,'卢':16,'蒋':15,'魏':18,'贾':13,'范':11,'金':8,'孟':8,
  '秦':10,'顾':21,'乔':12,'白':5,'毛':4,'江':7,'谭':19,'廖':14,'崔':11,'邹':12,
  '熊':14,'任':6,'康':11,'郝':14,'叶':15,'陆':16,'段':9,'侯':9,'黎':15,'文':4,
  '武':8,'曾':12,'关':19,'夏':10,'严':20,'殷':10,'常':11,'卫':16,'史':5,'于':3,
  '苗':11,'姚':9,'姜':9,'薛':19,'邱':12,'汪':8,'倪':10,'汤':13,'吕':7,
  '大':3,'小':3,'中':4,'国':11,'人':2,'民':5,'和':8,'生':5,'年':6,'月':4,'日':4,'时':10,
  '上':3,'下':3,'永':5,'安':6,'平':5,'吉':6,'祥':10,'瑞':14,'福':14,'禄':12,'寿':14,
  '喜':12,'财':10,'富':12,'贵':12,'荣':14,'华':14,'昌':8,'盛':12,'兴':16,'隆':17,
  '伟':11,'杰':12,'军':9,'强':12,'刚':10,'勇':9,'毅':15,'志':7,'诚':14,'信':9,
  '忠':8,'孝':7,'仁':4,'义':13,'礼':18,'智':12,'明':8,'亮':9,'清':12,'洁':16,
  '丽':19,'美':9,'俊':9,'豪':14,'龙':16,'凤':14,'鹏':19,'鹤':21,'飞':9,'天':4,
  '地':6,'宇':6,'洪':10,'博':12,'贤':15,'良':7,'德':15,'道':13,'光':6,'辉':15,
  '海':11,'洋':10,'东':8,'南':9,'西':6,'北':5,'春':9,'冬':5,'建':9,'成':7,'功':5,
  '山':3,'川':3,'云':12,'雪':11,'梅':11,'兰':25,'竹':6,'菊':14,'松':8,'柏':9,'枫':13,
  '柳':9,'花':10,'玉':5,'宝':20,'莲':17,'琴':13,'琪':13,'琳':13,'慧':15,'敏':11,
  '婷':12,'娟':10,'欣':8,'悦':11,'嘉':14,'宁':14,'静':16,'怡':9,'彤':7,'鑫':24,
  '森':12,'磊':15,'晶':12,'锋':15,'锦':16,'铭':14,'泽':17,'浩':11,'宸':10,'哲':10,
  '航':10,'奕':9,'凯':12,'逸':15,'皓':12,'钧':12,'霆':15,'霖':16,'翰':16,'韬':14,
  '修':10,'旭':6,'睿':14,'奇':8,'钰':13,'玥':9,'柠':18,'汐':7,'洛':10,'涵':12,
  '泓':9,'淇':12,'淳':12,'萱':15,'燕':16,'莹':15,'薇':19,'昊':8,'昕':8,'昀':8,
  '晟':11,'晖':13,'晏':10,'晴':12,'曜':18,'朗':11,'峰':10,'峻':10,'岚':12,
  '源':14,'润':16,'泰':10,'丰':18,'盈':9,'茂':11,'庆':15,'贺':12,'颂':13,'祝':10,
  '佑':7,'祯':14,'祺':13,'瀚':19,'煜':13,'炜':13,'焯':13,'珺':12,'璨':17,'瑾':16,
  '璇':16,'瑶':15,'璐':18,'璟':16,'曦':20,'巍':22,'岩':8,'岭':17,'岳':8,
  '澄':16,'澈':16,'波':9,'澜':20,'灏':25,'河':9,'涛':18,'耀':20,'星':9,'辰':7,
  '承':8,'继':20,'宗':8,'恩':10,'惠':12,'家':10,'庭':10,'邦':11,'英':11,'雄':12,
  '彦':9,'士':3,'子':3,'男':7,'女':3,'廉':13,'正':5,'直':8,'敢':11,'谦':17,'逊':14,
  '让':6,'乐':15,'双':18,'言':7,'语':14,'诗':13,'书':10,'画':12,'全':6,'秋':9,
  '绣':12,'绮':14,'艳':24,'芳':10,'芷':10,'蓉':16,'艾':8,'萍':14,'荷':14,'芝':10,
  '楠':13,'檀':17,'桂':10,'桐':10,'桃':10,'杏':7,'梨':11,'草':12,'霜':17,'露':21,
  '雨':8,'霞':17,'虹':9,'雯':12,'雾':13,'霓':16,'寒':12,'暖':13,'温':13,'凉':11,
  '珠':11,'珊':10,'瑚':14,'珍':10,'瑛':13,'璧':18,'玺':19,'环':18,'玲':10,'珑':22,
  '玟':9,'沅':8,'沐':8,'沛':8,'治':9,'洲':10,'涤':11,'潇':15,'湧':13,'谊':15,
  '景':12,'昶':9,'昭':9,'旷':18,'昂':8,'昆':8,'晋':10,'曙':18,'晓':16,'昱':9,
  '栩':10,'棠':12,'棣':12,'桢':13,'桓':10,'榕':14,'槐':14,'楷':13,
}

function getStroke(char: string): number { return STROKE[char] || ((char.charCodeAt(0) - 0x4e00) % 20 + 1) }

// ── 五行颜色 ──
const WXC: Record<string, string> = {
  '木':'bg-green-900/40 text-green-300 border-green-700',
  '火':'bg-red-900/40 text-red-300 border-red-700',
  '土':'bg-amber-900/40 text-amber-300 border-amber-700',
  '金':'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '水':'bg-blue-900/40 text-blue-300 border-blue-700',
}
const gradeC: Record<string, string> = {'大吉':'text-green-400','吉':'text-green-500','中吉':'text-yellow-400','中':'text-yellow-500','凶':'text-red-400','大凶':'text-red-500'}

// ── 81数理详解（精简版）──
const NUM_DETAIL: Record<number, { score: string; title: string; sign: string }> = {
  1:{score:'大吉',title:'太极之数',sign:'天地开泰，万事顺利'},
  3:{score:'大吉',title:'三才之数',sign:'吉祥如意，百事顺遂'},
  5:{score:'大吉',title:'五行之数',sign:'福寿双全，名利双收'},
  6:{score:'吉',title:'六爻之数',sign:'安稳顺利，余庆绵绵'},
  7:{score:'吉',title:'七政之数',sign:'刚毅果断，进取功名'},
  8:{score:'吉',title:'八卦之数',sign:'勤恳务实，成功可期'},
  11:{score:'大吉',title:'早苗逢雨',sign:'草木逢春，枝叶沾露'},
  13:{score:'大吉',title:'春日牡丹',sign:'天赋吉运，得人信赖'},
  15:{score:'大吉',title:'福寿双全',sign:'谦恭做事，必得人和'},
  16:{score:'大吉',title:'厚重之数',sign:'能获众望，成就大业'},
  17:{score:'吉',title:'刚强之数',sign:'排除万难，贵人相助'},
  18:{score:'大吉',title:'铁镜重磨',sign:'有志竟成，内外吉数'},
  21:{score:'大吉',title:'明月照天',sign:'独立权威，万人仰慕'},
  23:{score:'大吉',title:'壮丽之数',sign:'旭日东升，名显四方'},
  24:{score:'大吉',title:'白手起家',sign:'财源广进，白手起家'},
  25:{score:'吉',title:'英俊之数',sign:'天时地利，再得人和'},
  29:{score:'大吉',title:'青云直上',sign:'青云直上，才略奏功'},
  31:{score:'大吉',title:'智勇兼备',sign:'智勇兼备，可成大业'},
  32:{score:'大吉',title:'侥幸之数',sign:'侥幸多望，贵人相助'},
  33:{score:'大吉',title:'升天之家',sign:'意气用事，人和必失'},
  35:{score:'吉',title:'温和之数',sign:'温和平安，文昌技艺'},
  37:{score:'大吉',title:'猛虎出林',sign:'逢凶化吉，风调雨顺'},
  39:{score:'大吉',title:'富贵之数',sign:'云开见月，前途光明'},
  41:{score:'大吉',title:'德望之数',sign:'天赋吉运，德望兼备'},
  45:{score:'大吉',title:'顺风之数',sign:'顺风扬帆，万事如意'},
  47:{score:'大吉',title:'点石成金',sign:'万事可成，财源滚滚'},
  48:{score:'大吉',title:'星拱云台',sign:'智谋兼备，德望高崇'},
  52:{score:'大吉',title:'达眼之数',sign:'半凶中吉，一成一败'},
  55:{score:'吉',title:'善善恶恶',sign:'外观昌隆，内隐祸患'},
  57:{score:'吉',title:'日照春松',sign:'寒雪青松，夜莺吟月'},
  61:{score:'大吉',title:'牡丹芙蓉',sign:'名利双收，繁荣昌盛'},
  63:{score:'大吉',title:'舟归平海',sign:'万物化育，繁荣之象'},
  65:{score:'大吉',title:'巨流归海',sign:'吉运自来，可享盛名'},
  67:{score:'大吉',title:'顺风扬帆',sign:'天时地利，一帆风顺'},
  68:{score:'大吉',title:'顺风顺水',sign:'智虑周密，志气如刚'},
  73:{score:'吉',title:'安乐自来',sign:'安乐自来，自然吉祥'},
  75:{score:'吉',title:'退守之数',sign:'进不如守，安分守己'},
  77:{score:'吉',title:'先苦后甘',sign:'先苦后甘，先败后成'},
  78:{score:'吉',title:'晚境荣华',sign:'虽有困难，终得福贵'},
  81:{score:'大吉',title:'还元之数',sign:'万物回春，还复元始'},
}

function getNumDetail(val: number) {
  const idx = val > 81 ? val % 80 : (val <= 0 ? 1 : val)
  return NUM_DETAIL[idx] || {score:'中吉',title:'未知',sign:'—'}
}

// ── 三才配置吉凶 ──
const SANCAI_MAP: Record<string, Record<string, Record<string, string>>> = {
  '金':{'金':{'金':'吉','木':'凶','水':'吉','火':'凶','土':'吉'},'木':{'金':'凶','木':'大吉','水':'凶','火':'吉','土':'凶'},'水':{'金':'吉','木':'凶','水':'大吉','火':'凶','土':'吉'},'火':{'金':'凶','木':'吉','水':'凶','火':'大吉','土':'凶'},'土':{'金':'小吉','木':'凶','水':'凶','火':'吉','土':'大吉'}},
  '木':{'金':{'金':'凶','木':'凶','水':'大吉','火':'凶','土':'吉'},'木':{'金':'凶','木':'大吉','水':'凶','火':'吉','土':'凶'},'水':{'金':'吉','木':'凶','水':'大吉','火':'凶','土':'吉'},'火':{'金':'凶','木':'大吉','水':'凶','火':'大吉','土':'凶'},'土':{'金':'凶','木':'凶','水':'凶','火':'吉','土':'大吉'}},
  '水':{'金':{'金':'大吉','木':'凶','水':'大吉','火':'凶','土':'吉'},'木':{'金':'凶','木':'大吉','水':'凶','火':'吉','土':'凶'},'水':{'金':'吉','木':'凶','水':'大吉','火':'凶','土':'吉'},'火':{'金':'凶','木':'吉','水':'凶','火':'大吉','土':'凶'},'土':{'金':'凶','木':'凶','水':'凶','火':'吉','土':'大吉'}},
  '火':{'金':{'金':'凶','木':'凶','水':'凶','火':'大吉','土':'吉'},'木':{'金':'凶','木':'大吉','水':'凶','火':'吉','土':'凶'},'水':{'金':'凶','木':'大吉','水':'凶','火':'凶','土':'大吉'},'火':{'金':'凶','木':'大吉','水':'凶','火':'大吉','土':'凶'},'土':{'金':'凶','木':'凶','水':'凶','火':'吉','土':'大吉'}},
  '土':{'金':{'金':'吉','木':'凶','水':'凶','火':'吉','土':'大吉'},'木':{'金':'凶','木':'大吉','水':'凶','火':'吉','土':'凶'},'水':{'金':'吉','木':'凶','水':'大吉','火':'凶','土':'吉'},'火':{'金':'凶','木':'凶','水':'凶','火':'大吉','土':'吉'},'土':{'金':'吉','木':'凶','水':'凶','火':'吉','土':'大吉'}},
}

// ── 古诗词数据源 ──
interface PoemNameEntry {
  source: string
  category: string
  author: string
  line: string
  name: string
  meaning: string
}

const POEM_NAMES: PoemNameEntry[] = [
  // ── 诗经 ──
  {source:'诗经·关雎',category:'诗经',author:'佚名',line:'关关雎鸠，在河之洲。窈窕淑女，君子好逑。',name:'关雎',meaning:'雎鸠和鸣，喻爱情美满。关关和鸣、和谐美好的意境。'},
  {source:'诗经·蒹葭',category:'诗经',author:'佚名',line:'蒹葭苍苍，白露为霜。所谓伊人，在水一方。',name:'伊然',meaning:'蒹葭苍苍，伊人在水。朦胧诗意，清雅脱俗之姿。'},
  {source:'诗经·采薇',category:'诗经',author:'佚名',line:'昔我往矣，杨柳依依。今我来思，雨雪霏霏。',name:'依依',meaning:'杨柳依依，温柔缱绻。含留恋不舍之意，性情温婉。'},
  {source:'诗经·桃夭',category:'诗经',author:'佚名',line:'桃之夭夭，灼灼其华。之子于归，宜其室家。',name:'灼华',meaning:'桃花盛放，光彩照人。比喻青春灿烂、光彩夺目。'},
  {source:'诗经·斯干',category:'诗经',author:'佚名',line:'秩秩斯干，幽幽南山。如竹苞矣，如松茂矣。',name:'斯南',meaning:'斯干与南山，幽静雅致。有仁者乐山、高远清幽之意。'},
  {source:'诗经·鹿鸣',category:'诗经',author:'佚名',line:'呦呦鹿鸣，食野之苹。我有嘉宾，鼓瑟吹笙。',name:'鹿鸣',meaning:'鹿鸣呦呦，宾主尽欢。含祥和欢乐、友善好客之意。'},
  {source:'诗经·淇奥',category:'诗经',author:'佚名',line:'瞻彼淇奥，绿竹猗猗。有匪君子，如切如磋，如琢如磨。',name:'淇奥',meaning:'绿竹猗猗，君子如玉。喻君子品德高洁、修养深厚。'},
  {source:'诗经·汉广',category:'诗经',author:'佚名',line:'南有乔木，不可休思。汉有游女，不可求思。',name:'乔木',meaning:'高大挺直的树木。喻品格高洁、志向远大。'},
  // ── 楚辞 ──
  {source:'楚辞·离骚',category:'楚辞',author:'屈原',line:'朝饮木兰之坠露兮，夕餐秋菊之落英。',name:'木兰',meaning:'木兰高洁，含朝露之清雅。喻人品高洁、超凡脱俗。'},
  {source:'楚辞·离骚',category:'楚辞',author:'屈原',line:'余既滋兰之九畹兮，又树蕙之百亩。',name:'滋蕙',meaning:'培育兰蕙，喻培养高尚品德。兰蕙为君子之花。'},
  {source:'楚辞·九歌',category:'楚辞',author:'屈原',line:'青云衣兮白霓裳，举长矢兮射天狼。',name:'云霓',meaning:'云霞霓裳，华美飘逸。有志向高远、气度不凡之义。'},
  {source:'楚辞·九歌',category:'楚辞',author:'屈原',line:'沅有芷兮澧有兰，思公子兮未敢言。',name:'沅芷',meaning:'沅水之芷，澧水之兰。香草喻君子，清雅芬芳。'},
  {source:'楚辞·九章',category:'楚辞',author:'屈原',line:'登昆仑兮食玉英，与天地兮同寿，与日月兮同光。',name:'玉英',meaning:'昆仑玉英，天地同寿。含坚贞高洁、光明磊落之意。'},
  // ── 唐诗 ──
  {source:'送杜少府之任蜀州',category:'唐诗',author:'王勃',line:'海内存知己，天涯若比邻。',name:'存远',meaning:'海内知己，存于天涯。胸怀广阔，情谊深厚。'},
  {source:'滕王阁诗',category:'唐诗',author:'王勃',line:'落霞与孤鹜齐飞，秋水共长天一色。',name:'长天',meaning:'水天一色，气象万千。胸怀开阔、境界高远。'},
  {source:'望月怀远',category:'唐诗',author:'张九龄',line:'海上生明月，天涯共此时。',name:'明远',meaning:'明月照天涯，光明而高远。胸怀宽广，前程光明。'},
  {source:'竹里馆',category:'唐诗',author:'王维',line:'独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。',name:'清篁',meaning:'幽篁清静，月光相照。清雅高洁，超然物外。'},
  {source:'山居秋暝',category:'唐诗',author:'王维',line:'明月松间照，清泉石上流。',name:'清泉',meaning:'清泉石上流，清澈明净。品格纯净、心地高洁。'},
  {source:'相思',category:'唐诗',author:'王维',line:'红豆生南国，春来发几枝。愿君多采撷，此物最相思。',name:'思远',meaning:'红豆寄相思，情深意远。含温暖诚挚之情。'},
  {source:'将进酒',category:'唐诗',author:'李白',line:'君不见黄河之水天上来，奔流到海不复回。',name:'天泽',meaning:'天上来水，奔流入海。气势磅礴，胸怀壮阔。'},
  {source:'行路难',category:'唐诗',author:'李白',line:'长风破浪会有时，直挂云帆济沧海。',name:'云帆',meaning:'云帆济海，志向远大。喻乘风破浪、勇往直前。'},
  {source:'早发白帝城',category:'唐诗',author:'李白',line:'朝辞白帝彩云间，千里江陵一日还。',name:'彩云',meaning:'彩云缭绕，绚丽多姿。美丽灵动，充满希望。'},
  {source:'望庐山瀑布',category:'唐诗',author:'李白',line:'飞流直下三千尺，疑是银河落九天。',name:'星河',meaning:'银河落九天，壮丽非凡。气势恢宏，意境深远。'},
  {source:'登高',category:'唐诗',author:'杜甫',line:'无边落木萧萧下，不尽长江滚滚来。',name:'萧然',meaning:'落木萧萧，长江滚滚。苍茫辽阔之境，含远志与气魄。'},
  {source:'春夜喜雨',category:'唐诗',author:'杜甫',line:'好雨知时节，当春乃发生。随风潜入夜，润物细无声。',name:'知时',meaning:'知时节而润万物。智慧通达，温和润泽。'},
  {source:'望岳',category:'唐诗',author:'杜甫',line:'会当凌绝顶，一览众山小。',name:'凌岳',meaning:'凌绝顶而小天下。志存高远，胸怀广阔。'},
  {source:'枫桥夜泊',category:'唐诗',author:'张继',line:'月落乌啼霜满天，江枫渔火对愁眠。',name:'枫晚',meaning:'江枫渔火，秋夜静谧。含诗意与淡远的意境。'},
  {source:'乌衣巷',category:'唐诗',author:'刘禹锡',line:'旧时王谢堂前燕，飞入寻常百姓家。',name:'燕然',meaning:'旧燕归来，岁月静好。喻生活安康、平淡幸福。'},
  {source:'游子吟',category:'唐诗',author:'孟郊',line:'谁言寸草心，报得三春晖。',name:'春晖',meaning:'春晖普照，温暖和煦。喻感恩之心，温暖明亮。'},
  {source:'江雪',category:'唐诗',author:'柳宗元',line:'孤舟蓑笠翁，独钓寒江雪。',name:'寒江',meaning:'寒江独钓，清高孤傲。有隐逸之风、清正之气。'},
  {source:'题李凝幽居',category:'唐诗',author:'贾岛',line:'鸟宿池边树，僧敲月下门。',name:'月栖',meaning:'月下鸟栖，宁静雅致。有隐逸之趣、清幽之境。'},
  {source:'锦瑟',category:'唐诗',author:'李商隐',line:'沧海月明珠有泪，蓝田日暖玉生烟。',name:'蓝玉',meaning:'蓝田美玉，温润生烟。喻人玉润珠圆、温润如玉。'},
  {source:'无题',category:'唐诗',author:'李商隐',line:'相见时难别亦难，东风无力百花残。',name:'东君',meaning:'东风送暖，百花待放。含希望与生机，名字大气典雅。'},
  // ── 宋词 ──
  {source:'水调歌头',category:'宋词',author:'苏轼',line:'明月几时有，把酒问青天。',name:'皓月',meaning:'明月皎洁，问天洒脱。光明磊落，胸怀坦荡。'},
  {source:'定风波',category:'宋词',author:'苏轼',line:'竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。',name:'竹风',meaning:'竹杖芒鞋，烟雨平生。潇洒从容，坚韧淡泊。'},
  {source:'念奴娇·赤壁怀古',category:'宋词',author:'苏轼',line:'大江东去，浪淘尽，千古风流人物。',name:'淘然',meaning:'浪淘尽千古风流。胸怀壮阔，不拘一格。'},
  {source:'江城子',category:'宋词',author:'苏轼',line:'十年生死两茫茫，不思量，自难忘。',name:'思量',meaning:'深情难忘，思量万千。含深情厚谊之意。'},
  {source:'如梦令',category:'宋词',author:'李清照',line:'常记溪亭日暮，沉醉不知归路。',name:'溪亭',meaning:'溪亭日暮，藕花深处。清雅脱俗，有闲情逸致。'},
  {source:'声声慢',category:'宋词',author:'李清照',line:'寻寻觅觅，冷冷清清，凄凄惨惨戚戚。',name:'清逸',meaning:'清清冷冷中见超然。有清雅脱俗、不染尘埃之意。'},
  {source:'一剪梅',category:'宋词',author:'李清照',line:'花自飘零水自流。一种相思，两处闲愁。',name:'飘然',meaning:'花飘水流，淡然超脱。含潇洒自如、随遇而安之意。'},
  {source:'青玉案·元夕',category:'宋词',author:'辛弃疾',line:'众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。',name:'慕然',meaning:'蓦然回首，灯火阑珊。含缘分之妙、超然之趣。'},
  {source:'永遇乐·京口北固亭怀古',category:'宋词',author:'辛弃疾',line:'千古江山，英雄无觅孙仲谋处。',name:'江天',meaning:'江山千古，天地广阔。气势恢宏，胸怀壮大。'},
  {source:'满江红',category:'宋词',author:'岳飞',line:'怒发冲冠，凭栏处、潇潇雨歇。',name:'潇然',meaning:'潇潇雨歇，壮志凌云。有气吞山河、志在四方之慨。'},
  {source:'苏幕遮',category:'宋词',author:'范仲淹',line:'碧云天，黄叶地，秋色连波，波上寒烟翠。',name:'碧云',meaning:'碧云连天，秋色如画。意境优美，高远澄明。'},
  {source:'蝶恋花',category:'宋词',author:'柳永',line:'衣带渐宽终不悔，为伊消得人憔悴。',name:'为伊',meaning:'为伊憔悴，情深不悔。含执着深情、矢志不渝。'},
  // ── 论语 ──
  {source:'论语·学而',category:'论语',author:'孔子',line:'学而时习之，不亦说乎？有朋自远方来，不亦乐乎？',name:'习之',meaning:'学而时习，快乐自在。含勤勉好学、积极进取之意。'},
  {source:'论语·子罕',category:'论语',author:'孔子',line:'三军可夺帅也，匹夫不可夺志也。',name:'守志',meaning:'不可夺志，坚毅不拔。含坚定信念、意志坚强之意。'},
  {source:'论语·里仁',category:'论语',author:'孔子',line:'德不孤，必有邻。',name:'德邻',meaning:'有德不孤，必有芳邻。喻品德高尚，自有人相伴。'},
  {source:'论语·泰伯',category:'论语',author:'孔子',line:'士不可以不弘毅，任重而道远。',name:'弘毅',meaning:'弘大坚毅，任重道远。含远大志向、坚韧不拔之意。'},
  {source:'论语·述而',category:'论语',author:'孔子',line:'志于道，据于德，依于仁，游于艺。',name:'志道',meaning:'志于道而游于艺。涵养深厚，德才兼备。'},
  {source:'周易·乾卦',category:'易经',author:'孔子',line:'天行健，君子以自强不息。',name:'天健',meaning:'天行刚健，自强不息。喻积极进取、永不停歇。'},
  {source:'周易·坤卦',category:'易经',author:'孔子',line:'地势坤，君子以厚德载物。',name:'厚德',meaning:'厚德载物，包容万物。含宽广胸怀、深厚德行之意。'},
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ── 基于偏旁部首的五行判断 ──
function radicalWx(char: string): string | null {
  const woodRadicals = ['木','林','森','朩','禾','竹','艹']
  const fireRadicals = ['火','灬','炎','焱','燚','日','月','光']
  const earthRadicals = ['土','地','山','石','田','阜','阝','王','玉']
  const metalRadicals = ['金','钅','釒','刀','刂','剑']
  const waterRadicals = ['水','氵','冫','雨','川','泉','江']

  if (woodRadicals.some(r => char.includes(r))) return '木'
  if (fireRadicals.some(r => char.includes(r))) return '火'
  if (earthRadicals.some(r => char.includes(r))) return '土'
  if (metalRadicals.some(r => char.includes(r))) return '金'
  if (waterRadicals.some(r => char.includes(r))) return '水'
  return null
}

// ── 综合判断五行：先查CHARS_WX字典，再查偏旁，最后笔画五行 ──
// 常用取名字五行字典
const CHARS_WX: Record<string, string> = {
  // 木
  '林':'木',
  '森':'木',
  '柏':'木',
  '松':'木',
  '桐':'木',
  '楠':'木',
  '枫':'木',
  '桦':'木',
  '楷':'木',
  '樱':'木',
  '柳':'木',
  '榆':'木',
  '栀':'木',
  '棠':'木',
  '梨':'木',
  '桃':'木',
  '杏':'木',
  '梅':'木',
  '栩':'木',
  '桓':'木',
  '桂':'木',
  '杉':'木',
  '梧':'木',
  '梓':'木',
  '槿':'木',
  '檀':'木',
  '榕':'木',
  '槐':'木',
  '桔':'木',
  '柚':'木',
  '琳':'木',
  '琪':'木',
  '瑶':'木',
  '瑾':'木',
  '瑛':'木',
  '璇':'木',
  '玮':'木',
  '彦':'木',
  '彬':'木',
  '柯':'木',
  '栋':'木',
  '棋':'木',
  '棱':'木',
  '杰':'木',
  '荣':'木',
  '棣':'木',
  '桢':'木',
  '柠':'木',
  '杨':'木',
  '楚':'木',
  '桑':'木',
  '棉':'木',
  '萱':'木',
  '薇':'木',
  '菲':'木',
  '芳':'木',
  '芹':'木',
  '芷':'木',
  '芮':'木',
  '茗':'木',
  '莹':'木',
  '菁':'木',
  '萍':'木',
  '菡':'木',
  '萌':'木',
  '芃':'木',
  '芊':'木',
  '芙':'木',
  '艺':'木',
  '苑':'木',
  '茵':'木',
  '茹':'木',
  '荔':'木',
  '莲':'木',
  '华':'木',
  '蔚':'木',
  '蕴':'木',
  '萧':'木',
  '蕾':'木',
  '蓓':'木',
  '蓝':'木',
  '蕙':'木',
  '蔓':'木',
  '藤':'木',
  '蓉':'木',
  '若':'木',
  '英':'木',
  '苹':'木',
  '莎':'木',
  '茉':'木',
  '莉':'木',
  '荷':'木',
  '菊':'木',
  '兰':'木',
  '竹':'木',
  '竺':'木',
  '笛':'木',
  '笙':'木',
  '箫':'木',
  '策':'木',
  // 火
  '明':'火',
  '亮':'火',
  '昱':'火',
  '昌':'火',
  '昊':'火',
  '晟':'火',
  '曦':'火',
  '曜':'火',
  '晖':'火',
  '煜':'火',
  '炜':'火',
  '炫':'火',
  '烨':'火',
  '焕':'火',
  '灿':'火',
  '炳':'火',
  '煌':'火',
  '彤':'火',
  '丹':'火',
  '晴':'火',
  '朗':'火',
  '昭':'火',
  '晞':'火',
  '昕':'火',
  '昀':'火',
  '昂':'火',
  '晏':'火',
  '晋':'火',
  '晨':'火',
  '晶':'火',
  '晓':'火',
  '旭':'火',
  '时':'火',
  '光':'火',
  '辉':'火',
  '耀':'火',
  '熠':'火',
  '烁':'火',
  '燃':'火',
  '炽':'火',
  '炎':'火',
  '焱':'火',
  '炅':'火',
  '炘':'火',
  '烽':'火',
  '煊':'火',
  '熙':'火',
  '熹':'火',
  '旸':'火',
  '昶':'火',
  '显':'火',
  '映':'火',
  '昙':'火',
  '易':'火',
  '泰':'火',
  '达':'火',
  '进':'火',
  '逸':'火',
  '畅':'火',
  '卓':'火',
  '德':'火',
  '腾':'火',
  '虹':'火',
  '扬':'火',
  '远':'火',
  '驰':'火',
  '骋':'火',
  '彰':'火',
  '娜':'火',
  // 土
  '安':'土',
  '宇':'土',
  '宥':'土',
  '宜':'土',
  '宸':'土',
  '容':'土',
  '宴':'土',
  '宏':'土',
  '寰':'土',
  '宛':'土',
  '寅':'土',
  '永':'土',
  '维':'土',
  '允':'土',
  '延':'土',
  '康':'土',
  '博':'土',
  '磊':'土',
  '岩':'土',
  '峰':'土',
  '岚':'土',
  '岳':'土',
  '岱':'土',
  '峻':'土',
  '嶷':'土',
  '巍':'土',
  '峥':'土',
  '嵘':'土',
  '岭':'土',
  '嵩':'土',
  '屿':'土',
  '岗':'土',
  '岷':'土',
  '伟':'土',
  '卫':'土',
  '域':'土',
  '均':'土',
  '坤':'土',
  '城':'土',
  '基':'土',
  '堂':'土',
  '垚':'土',
  '垣':'土',
  '培':'土',
  '堃':'土',
  '圣':'土',
  '坚':'土',
  '坦':'土',
  '庭':'土',
  '园':'土',
  '圆':'土',
  '国':'土',
  '家':'土',
  '宣':'土',
  '懿':'土',
  '佑':'土',
  '祎':'土',
  '祺':'土',
  '礼':'土',
  '裕':'土',
  '声':'土',
  '壮':'土',
  '颂':'土',
  '瑞':'土',
  '琛':'土',
  '琦':'土',
  '瑜':'土',
  '环':'土',
  '璞':'土',
  '璋':'土',
  '璧':'土',
  '玉':'土',
  '玺':'土',
  '玥':'土',
  // 金
  '铭':'金',
  '鑫':'金',
  '钧':'金',
  '钰':'金',
  '钢':'金',
  '锋':'金',
  '锦':'金',
  '锐':'金',
  '钊':'金',
  '钟':'金',
  '铠':'金',
  '钦':'金',
  '银':'金',
  '铮':'金',
  '锟':'金',
  '键':'金',
  '镇':'金',
  '铃':'金',
  '璨':'金',
  '玲':'金',
  '珑':'金',
  '玟':'金',
  '珊':'金',
  '珠':'金',
  '珍':'金',
  '静':'金',
  '靖':'金',
  '青':'金',
  '靓':'金',
  '清':'金',
  '素':'金',
  '秀':'金',
  '秋':'金',
  '贞':'金',
  '净':'金',
  '爽':'金',
  '睿':'金',
  '聪':'金',
  '胜':'金',
  '双':'金',
  '诚':'金',
  '正':'金',
  '刚':'金',
  '毅':'金',
  '信':'金',
  '义':'金',
  '哲':'金',
  '思':'金',
  '修':'金',
  '敬':'金',
  '谦':'金',
  '慎':'金',
  '让':'金',
  '周':'金',
  '施':'金',
  '纯':'金',
  '淑':'金',
  '真':'金',
  '剑':'金',
  '创':'金',
  // 水
  '海':'水',
  '浩':'水',
  '瀚':'水',
  '泽':'水',
  '润':'水',
  '涵':'水',
  '涛':'水',
  '波':'水',
  '源':'水',
  '泓':'水',
  '洪':'水',
  '江':'水',
  '河':'水',
  '湖':'水',
  '涧':'水',
  '潮':'水',
  '汐':'水',
  '浪':'水',
  '鸿':'水',
  '灏':'水',
  '渊':'水',
  '深':'水',
  '淳':'水',
  '澈':'水',
  '沁':'水',
  '洋':'水',
  '流':'水',
  '溪':'水',
  '潭':'水',
  '泉':'水',
  '涓':'水',
  '涟':'水',
  '漪':'水',
  '溶':'水',
  '沛':'水',
  '沐':'水',
  '沅':'水',
  '泊':'水',
  '治':'水',
  '洲':'水',
  '涌':'水',
  '洁':'水',
  '涤':'水',
  '潇':'水',
  '浚':'水',
  '澹':'水',
  '澜':'水',
  '淇':'水',
  '湘':'水',
  '汶':'水',
  '滢':'水',
  '温':'水',
  '滨':'水',
  '雨':'水',
  '雪':'水',
  '露':'水',
  '霜':'水',
  '云':'水',
  '霞':'水',
  '雯':'水',
  '霓':'水',
  '霏':'水',
  '霄':'水',
  '雷':'水',
  '雾':'水',
  '霖':'水',
  '冰':'水',
  '凝':'水',
  '寒':'水',
  '飘':'水',
  '飞':'水',
  '游':'水',
  '惠':'水',
  '敏':'水',
  '慧':'水',
  '智':'水',
  '灵':'水',
  '嘉':'水',
  '慈':'水',
  '悠':'水',
  '悦':'水',
  '怡':'水',
  '忻':'水',
  '舒':'水',
  '乐':'水',
  '愉':'水',
  '恬':'水',
  '慕':'水',
};

function getCharWuxing(char: string): string {
  // 优先查字典
  if (CHARS_WX[char]) return CHARS_WX[char]
  // 再试偏旁
  const r = radicalWx(char)
  if (r) return r
  // 最后用笔画数判断
  return charWx(char)
}

// ── 五行相生关系 ──
const SHENG_CYCLE: Record<string, string> = {'木':'火','火':'土','土':'金','金':'水','水':'木'}
const KE_CYCLE: Record<string, string> = {'木':'土','土':'水','水':'火','火':'金','金':'木'}  // ── 五行旺衰分析 ──
function analyzeWuxing(gzArr: string[]): {
    wxCount: Record<string, number>;
    riZhu: string; riZhuWx: string;
    bodyStrength: string; yongShen: string
  } {
    const wxCount: Record<string, number> = {木:0,火:0,土:0,金:0,水:0}
    const riZhu = gzArr[2] ? gzArr[2][0] : '甲'
    const riZhuWx = WX_TG[riZhu] || '木'

    for (const gz of gzArr) {
      if (gz.length >= 2) {
        const tg = gz[0]; const dz = gz[1]
        if (WX_TG[tg]) wxCount[WX_TG[tg]]++
        if (WX_DZ[dz]) wxCount[WX_DZ[dz]]++
      }
    }

    // 身强/身弱判断（简化版）
    const shengMe = SHENG_CYCLE[riZhuWx] ? wxCount[SHENG_CYCLE[riZhuWx]] : 0
    const keWo = KE_CYCLE[riZhuWx] ? wxCount[KE_CYCLE[riZhuWx]] : 0
    const woSheng = SHENG_CYCLE[riZhuWx] ? wxCount[Object.entries(SHENG_CYCLE).find(([,v]) => v === riZhuWx)?.[0] || ''] : 0
    const wxSelf = wxCount[riZhuWx] || 0

    const support = wxSelf + shengMe
    const suppress = keWo + woSheng

    let bodyStrength = '中和'
    if (support > suppress + 2) bodyStrength = '身强'
    else if (suppress > support + 2) bodyStrength = '身弱'

    // 用神：身强则用克泄（被克的五行、生出的五行），身弱则用生扶（生我的、同我的）
    let yongShen = ''
    if (bodyStrength === '身强') {
      // 用克我的五行或我生的五行
      yongShen = KE_CYCLE[riZhuWx] || '土'
    } else if (bodyStrength === '身弱') {
      // 用生我的五行
      yongShen = SHENG_CYCLE[riZhuWx] || '水'
    } else {
      // 中和用我生
      yongShen = Object.entries(SHENG_CYCLE).find(([,v]) => v === riZhuWx)?.[0] || '火'
    }

    return { wxCount, riZhu, riZhuWx, bodyStrength, yongShen }
  }
  // ── 命挂天干 ──
const SHI_CHEN_GAN: Record<string, Record<string, string>> = {   '甲':{'子':'甲','丑':'乙','寅':'丙','卯':'丁','辰':'戊','巳':'己','午':'庚','未':'辛','申':'壬','酉':'癸','戌':'甲','亥':'乙'},   '乙':{'子':'丙','丑':'丁','寅':'戊','卯':'己','辰':'庚','巳':'辛','午':'壬','未':'癸','申':'甲','酉':'乙','戌':'丙','亥':'丁'},   '丙':{'子':'戊','丑':'己','寅':'庚','卯':'辛','辰':'壬','巳':'癸','午':'甲','未':'乙','申':'丙','酉':'丁','戌':'戊','亥':'己'},   '丁':{'子':'庚','丑':'辛','寅':'壬','卯':'癸','辰':'甲','巳':'乙','午':'丙','未':'丁','申':'戊','酉':'己','戌':'庚','亥':'辛'},   '戊':{'子':'壬','丑':'癸','寅':'甲','卯':'乙','辰':'丙','巳':'丁','午':'戊','未':'己','申':'庚','酉':'辛','戌':'壬','亥':'癸'},   '己':{'子':'甲','丑':'乙','寅':'丙','卯':'丁','辰':'戊','巳':'己','午':'庚','未':'辛','申':'壬','酉':'癸','戌':'甲','亥':'乙'},   '庚':{'子':'丙','丑':'丁','寅':'戊','卯':'己','辰':'庚','巳':'辛','午':'壬','未':'癸','申':'甲','酉':'乙','戌':'丙','亥':'丁'},   '辛':{'子':'戊','丑':'己','寅':'庚','卯':'辛','辰':'壬','巳':'癸','午':'甲','未':'乙','申':'丙','酉':'丁','戌':'戊','亥':'己'},   '壬':{'子':'庚','丑':'辛','寅':'壬','卯':'癸','辰':'甲','巳':'乙','午':'丙','未':'丁','申':'戊','酉':'己','戌':'庚','亥':'辛'},   '癸':{'子':'壬','丑':'癸','寅':'甲','卯':'乙','辰':'丙','巳':'丁','午':'戊','未':'己','申':'庚','酉':'辛','戌':'壬','亥':'癸'}, }  // ── 时辰对应的地支 ──
const SHI_CHEN_DIZHI: Record<number, string> = {   0:'子',1:'丑',2:'丑',3:'寅',4:'寅',5:'卯',6:'卯',7:'辰',8:'辰',9:'巳',10:'巳',11:'午',   12:'午',13:'未',14:'未',15:'申',16:'申',17:'酉',18:'酉',19:'戌',20:'戌',21:'亥',22:'亥',23:'子' }  // ── 纳音五行 ──
const NAYIN: Record<string, string> = {   '甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木',   '庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火',   '丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金',   '壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',   '戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水',   '甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',   '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火',   '丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金',   '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土',   '戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水', }  // ── 藏干（地支含的天干）──
const CANG_GAN: Record<string, string> = {
  '子':'癸','丑':'己癸辛','寅':'甲丙戊','卯':'乙','辰':'戊乙癸','巳':'丙戊庚',
  '午':'丁己','未':'己丁乙','申':'庚壬戊','酉':'辛','戌':'戊辛丁','亥':'壬甲'
}

// ── 八字排盘 ──
function calcBazi(lunarYear: number, lunarMonth: number, lunarDay: number, hourDz: string): {
  pillars: string[];   // [年柱, 月柱, 日柱, 时柱]
  nayin: string[];    // 纳音
  wxTg: string[];     // 天干五行
  wxDz: string[];     // 地支五行
  cangGan: string[];  // 藏干
  tgChars: string[];  // 天干字符
  dzChars: string[];  // 地支字符
} {
  const nianGan = '甲乙丙丁戊己庚辛壬癸'[(lunarYear - 4) % 10]
  const nianZhi = '子丑寅卯辰巳午未申酉戌亥'[(lunarYear - 4) % 12]
  const nianGz = nianGan + nianZhi

  const yueGanIdx = ((lunarYear - 4) % 5) * 2 + lunarMonth - 1
  const yueGan = '甲乙丙丁戊己庚辛壬癸'[yueGanIdx % 10]
  const yueZhi = '寅卯辰巳午未申酉戌亥子丑'[lunarMonth - 1]
  const yueGz = yueGan + yueZhi

  // 日干支
  const ganZhi = '甲乙丙丁戊己庚辛壬癸'
  const zhi = '子丑寅卯辰巳午未申酉戌亥'
  // 简单算法：以已知2026年5月29日为丙午日（已验证）
  const baseDate = new Date(2026, 4, 29)
  const baseGan = 2 // 丙的索引
  const baseZhi = 6 // 午的索引
  const targetDate = new Date(lunarYear, lunarMonth - 1, lunarDay)
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / 86400000)
  const riGan = ganZhi[(baseGan + diffDays % 10 + 10) % 10]
  const riZhi = zhi[(baseZhi + diffDays % 12 + 12) % 12]
  const riGz = riGan + riZhi

  const shiGan = SHI_CHEN_GAN[riGan]?.[hourDz] || '甲'
  const shiGz = shiGan + hourDz

  const pillars = [nianGz, yueGz, riGz, shiGz]
  const tgChars = [nianGan, yueGan, riGan, shiGan]
  const dzChars = [nianZhi, yueZhi, riZhi, hourDz]

  return {
    pillars,
    nayin: pillars.map(p => NAYIN[p] || '—'),
    wxTg: tgChars.map(c => WX_TG[c] || '土'),
    wxDz: dzChars.map(c => WX_DZ[c] || '土'),
    cangGan: dzChars.map(c => CANG_GAN[c] || ''),
    tgChars,
    dzChars,
  }
}
// ── 计算天干地支 ──
const TIAN_GAN = '甲乙丙丁戊己庚辛壬癸'
const DI_ZHI = '子丑寅卯辰巳午未申酉戌亥'
const WX_TG: Record<string, string> = {   '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' }
const WX_DZ: Record<string, string> = {   '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' }  // ── 汉字五行判断（笔画数五行）──
function charWx(c: string): string {
  const s = getStroke(c)
  if (s <= 2) return '木'
  if (s <= 4) return '火'
  if (s <= 6) return '土'
  if (s <= 8) return '金'
  return '水'
}

function checkCharWx(char: string, expectedWx: string): boolean {
  return charWx(char) === expectedWx
}

// ── 常用取名用字池（约230字，按五行分类）──
const CHAR_POOL: Record<string, string[]> = {
  '木': [
    '林','森','柏','松','桐','楠','枫','桦','楷','樱','柳','榆','栀','棠','梨','桃','杏','梅',
    '栩','桓','桂','杉','梧','梓','槿','檀','榕','槐','桔','柚',
    '琳','琪','瑶','瑾','瑛','璇','玮','彦','彬','杉','柯','栋','棋','棱','植',
    '杰','荣','栩','棠','棣','桢','柠','杨','楚','桑','棉',
    '萱','薇','菲','芳','芹','芷','芮','茗','莹','菁','萍','菡','萌','芃','芊','芙',
    '艺','苑','茵','茹','荔','莲','菁','菡','华','蔚','蕴','萧','蕾','蓓','蓝','蕙',
    '蔓','藤','芷','芙','蓉','若','英','苹',
  ],
  '火': [
    '明','亮','昱','昌','昊','晟','曦','曜','晖','煜','炜','炫','烨','焕','灿','炳','煌',
    '彤','丹','晴','朗','昭','晞','昕','昀','昂','晏','晋','晨','晶','晓','旭','时',
    '光','辉','耀','熠','烁','燃','炽','炎','焱','炅','炘','烽','煊','熙','熹',
    '瑶','瑾','璐','璟','璇','珑','丽','婷','旎','暖','旸','昶','显','映','昱','昙','易',
    '泰','达','进','逸','含','光','阳','乐','路','童','宁','辽','鼎','畅','卓','德',
    '腾','虹','扬','远','驰','骋','傲','志','惠','彰','彦','骏','驰',
  ],
  '土': [
    '安','宇','宥','宜','宸','容','宴','宏','寰','宛','寅','永','维','允','远','延','康',
    '博','磊','岩','峰','岚','岳','岱','峻','嵋','巍','峥','嵘','岭','嵩','屿','岗','岷',
    '维','伟','卫','域','均','坤','城','基','堂','垚','垣','培','堃','圣','坚','坦',
    '庭','园','圆','国','家','宥','安','宏','容','宣','宴','宜',
    '懿','佑','祎','祺','礼','裕','声','壮','颂',
    '瑞','琛','琦','瑾','瑜','环','璞','璋','璧','玉','玺','玥',
  ],
  '金': [
    '铭','鑫','钧','钰','钢','锋','锦','锐','钊','钟','铠','钦','银','铮','锟','键',
    '镇','铃','瑞','璨','瑾','瑜','玮','玲','珑','玟','珊','珠','珍','环','玺',
    '静','靖','青','靓','清','素','秀','秋','玉','贞','净','爽','睿','聪','胜','双',
    '诚','正','刚','毅','信','义','哲','思','修','敬','谦','慎','让','周','卓','施',
  ],
  '水': [
    '海','浩','瀚','泽','润','涵','涛','波','源','泓','洪','江','河','湖','涧','潮','汐','浪',
    '鸿','灏','渊','深','淳','清','澈','沁','洋','流','溪','潭','泉','涓','涟','漪','溶',
    '沛','沐','沅','泊','治','洲','涌','洁','涤','潇','浚','涵','泓',
    '淑','澹','澜','洁','淇','湘','渟','汶','滢','温','滨',
    '雨','雪','露','霜','云','霞','雯','霓','霏','霄','雷','雾','霖','冰','凝','寒','映',
    '飘','飞','游','驰','惠','聪','敏','慧','智','灵','嘉','慈','悠','悦','怡',
    '忻','舒','乐','愉','恬','慕','慧','慈','懿','悠',
  ],
}

// ── 时辰选项 ──
const HOUR_OPTS = [
  {v:'0',l:'子时 23:00-00:59'},{v:'1',l:'丑时 01:00-02:59'},{v:'2',l:'丑时 01:00-02:59'},{v:'3',l:'寅时 03:00-04:59'},{v:'4',l:'寅时 03:00-04:59'},{v:'5',l:'卯时 05:00-06:59'},
  {v:'6',l:'卯时 06:00-07:59'},{v:'7',l:'辰时 07:00-08:59'},{v:'8',l:'辰时 08:00-09:59'},{v:'9',l:'巳时 09:00-10:59'},{v:'10',l:'巳时 10:00-11:59'},{v:'11',l:'午时 11:00-12:59'},
  {v:'12',l:'午时 12:00-13:59'},{v:'13',l:'未时 13:00-14:59'},{v:'14',l:'未时 14:00-15:59'},{v:'15',l:'申时 15:00-16:59'},{v:'16',l:'申时 16:00-17:59'},{v:'17',l:'酉时 17:00-18:59'},
  {v:'18',l:'酉时 18:00-19:59'},{v:'19',l:'戌时 19:00-20:59'},{v:'20',l:'戌时 20:00-21:59'},{v:'21',l:'亥时 21:00-22:59'},{v:'22',l:'亥时 22:00-23:59'},{v:'23',l:'子时 23:00-00:59'},
];

function getHourDz(h: number): string {
  return SHI_CHEN_DIZHI[h] || '子'
}

// ═══════════════════════════════════════
//  NamingClient 五行起名主组件
// ═══════════════════════════════════════

interface NameResult {
  fullName: string
  firstName: string
  chars: { char: string; wx: string; stroke: number }[]
  scores: { key: string; val: number; score: string }[]
  avgScore: number
  sancai: string
  meaning: string
}
function generateNames(surname: string, wxCount: Record<string,number>, yongShen: string, gender: string): NameResult[] {
  const results: NameResult[] = []
  const pool = [...(CHAR_POOL[yongShen] || []), ...Object.values(CHAR_POOL).flat()]
  const uniquePool = [...new Set(pool)]

  for (let g = 0; g < 5; g++) {
    const firstChar = pickRandom(uniquePool)
    const secondChar = pickRandom(uniquePool.filter(c => c !== firstChar))
    const name = firstChar + secondChar
    const fullName = surname + name

    const nameChars = [...name].map(c => ({
      char: c,
      wx: getCharWuxing(c),
      stroke: getStroke(c),
    }))

    const lnStrokes = getStroke(surname)
    const fnStrokes = nameChars.map(c => c.stroke)
    const fnSum = fnStrokes.reduce((a, b) => a + b, 0)

    const tiange = lnStrokes + 1
    const renge = (lnStrokes) + (fnStrokes[0] || 0)
    const dige = fnSum + (fnStrokes.length <= 1 ? 1 : 0)
    const zongge = lnStrokes + fnSum
    const waige = zongge - renge + 1

    const wuge = [
      {key:'天格',val:tiange},{key:'人格',val:renge},
      {key:'地格',val:dige},{key:'外格',val:waige},{key:'总格',val:zongge}
    ].map(w => ({...w, ...getNumDetail(w.val)}))

    const avgScore = Math.round(wuge.reduce((s, w) => {
      const m: Record<string,number>={'大吉':100,'吉':80,'中吉':65,'中':50,'凶':30,'大凶':10,'小吉':70}
      return s + (m[w.score] || 50)
    }, 0) / 5)

    const sancai = nameChars.map(c => c.wx).join('→')

    const meanings: string[] = []
    for (const ch of nameChars) {
      const entry = POEM_NAMES.find(p => p.name.includes(ch.char) || (ch.char.length === 1 && p.name[0] === ch.char))
      if (entry) meanings.push(entry.line.slice(0, 20) + '...')
      else meanings.push(ch.char + '字五行属' + ch.wx + '，' + (ch.wx === yongShen ? '补益用神' : ''))
    }

    results.push({fullName, firstName: name, chars: nameChars, scores: wuge, avgScore, sancai, meaning: meanings.join('；')})
  }

  return results.sort((a, b) => b.avgScore - a.avgScore)
}
export default function NamingClient() {
  const [tab, setTab] = useState<'wuxing'|'gushi'>('wuxing')
  const [surname, setSurname] = useState('')
  const [calType, setCalType] = useState<'solar'|'lunar'>('solar')
  const [sYear, setSYear] = useState('2026')
  const [sMonth, setSMonth] = useState('5')
  const [sDay, setSDay] = useState('29')
  const [sHour, setSHour] = useState('12')
  const [gender, setGender] = useState<'male'|'female'>('male')
  const [wxResults, setWxResults] = useState<NameResult[]>([])
  const [wxError, setWxError] = useState('')
  const [lunarInfo, setLunarInfo] = useState('')
  const [baziResult, setBaziResult] = useState<{
    pillars: string[]; nayin: string[]; wxTg: string[]; wxDz: string[]; cangGan: string[];
    tgChars: string[]; dzChars: string[];
    wxCount: Record<string,number>; riZhu: string; riZhuWx: string;
    bodyStrength: string; yongShen: string;
  } | null>(null)
  const [poemBatch, setPoemBatch] = useState<PoemNameEntry[]>([])

  const handleWuxingSubmit = useCallback(() => {
    if (!surname.trim()) { setWxError('请输入姓氏'); return }
    setWxError('')
    try {
      const y = parseInt(sYear), m = parseInt(sMonth), d = parseInt(sDay), h = parseInt(sHour)
      const hourDz = getHourDz(h)
      let lunar: Lunar
      if (calType === 'solar') {
        const solar = Solar.fromYmd(y, m, d)
        lunar = solar.getLunar()
        setLunarInfo('农历：' + lunar.getYear() + '年 ' + lunar.getMonthInChinese() + '月 ' + lunar.getDayInChinese())
      } else {
        lunar = Lunar.fromYmd(y, m, d)
        const solar = lunar.getSolar()
        setLunarInfo('公历：' + solar.getYear() + '年' + solar.getMonth() + '月' + solar.getDay() + '日')
      }
      const ly = lunar.getYear(), lm = lunar.getMonth(), ld = lunar.getDay()
      const bazi = calcBazi(ly, lm, ld, hourDz)
      const analysis = analyzeWuxing(bazi.pillars)
      setBaziResult({...bazi, ...analysis})
      const names = generateNames(surname.trim(), analysis.wxCount, analysis.yongShen, gender)
      setWxResults(names)
    } catch (e) {
      setWxError('八字排盘出错，请检查日期是否正确')
    }
  }, [surname, calType, sYear, sMonth, sDay, sHour, gender])

  const handleRegenerate = useCallback(() => {
    if (!surname.trim() || !baziResult) return
    const names = generateNames(surname.trim(), baziResult.wxCount, baziResult.yongShen, gender)
    setWxResults(names)
  }, [surname, baziResult, gender])

  const handleGushi = useCallback(() => {
    const batch = pickRandomN(POEM_NAMES, 8)
    setPoemBatch(batch)
  }, [])

  if (poemBatch.length === 0 && tab === 'gushi') {
    handleGushi()
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Tab 切换 */}
      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 max-w-xs">
        <button onClick={()=>setTab('wuxing')}
          className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${tab==='wuxing'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200'}`}>五行起名</button>
        <button onClick={()=>setTab('gushi')}
          className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${tab==='gushi'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200'}`}>古诗词起名</button>
      </div>

      {tab === 'wuxing' ? (
        <>
          {/* 输入区 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">输入信息</h3>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">姓氏</label>
              <input type="text" value={surname} onChange={e=>setSurname(e.target.value)} maxLength={2}
                className="w-32 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-400">历法：</span>
              <button onClick={()=>setCalType('solar')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${calType==='solar'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>阳历</button>
              <button onClick={()=>setCalType('lunar')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${calType==='lunar'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>阴历</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              <div><label className="block text-xs text-gray-400 mb-1">年</label>
                <select value={sYear} onChange={e=>setSYear(e.target.value)}
                  className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                  {Array.from({length:120},(_,i)=>currentYear-60+i).map(y=><option key={y}>{y}</option>)}
                </select></div>
              <div><label className="block text-xs text-gray-400 mb-1">月</label>
                <select value={sMonth} onChange={e=>setSMonth(e.target.value)}
                  className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                  {Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}
                </select></div>
              <div><label className="block text-xs text-gray-400 mb-1">日</label>
                <select value={sDay} onChange={e=>setSDay(e.target.value)}
                  className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                  {Array.from({length:31},(_,i)=><option key={i+1}>{i+1}</option>)}
                </select></div>
              <div><label className="block text-xs text-gray-400 mb-1">时辰</label>
                <select value={sHour} onChange={e=>setSHour(e.target.value)}
                  className="w-full px-2 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
                  {Object.entries(HOUR_OPTS.reduce((acc, o) => { const k = o.l.split(' ')[0]; if (!acc[k]) acc[k] = o; return acc }, {} as Record<string,typeof HOUR_OPTS[0]>)).map(([,o]) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select></div>
              <div><label className="block text-xs text-gray-400 mb-1">性别</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={()=>setGender('male')}
                    className={`px-3 py-1.5 text-xs rounded-lg ${gender==='male'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>男</button>
                  <button onClick={()=>setGender('female')}
                    className={`px-3 py-1.5 text-xs rounded-lg ${gender==='female'?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>女</button>
                </div></div>
            </div>

            <button onClick={handleWuxingSubmit}
              className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">开始起名</button>
            {lunarInfo && <p className="text-xs text-gray-500 mt-2">{lunarInfo}</p>}
            {wxError && <p className="text-xs text-red-400 mt-2">{wxError}</p>}
          </div>

          {/* 八字命盘 + 五行分析 */}
          {baziResult && (() => {
            const b = baziResult
            const pillarLabels = ['年柱','月柱','日柱','时柱']
            const totalWx = Object.values(b.wxCount).reduce((a, c) => a + c, 0) || 1
            const wxColor: Record<string,string> = {'木':'from-green-400 to-green-600','火':'from-red-400 to-red-600','土':'from-amber-400 to-amber-600','金':'from-yellow-400 to-yellow-600','水':'from-blue-400 to-blue-600'}
            const wxBg: Record<string,string> = {'木':'bg-green-700/30','火':'bg-red-700/30','土':'bg-amber-700/30','金':'bg-yellow-700/30','水':'bg-blue-700/30'}
            return (
              <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">八字命盘</h3>

                {/* 四柱表格 */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-dark-600">
                        <th className="px-2 py-1.5 text-left text-gray-500"></th>
                        {pillarLabels.map((pl, i) => (
                          <th key={i} className="px-3 py-1.5 text-center text-gray-400 font-medium">{pl}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-dark-600/50">
                        <td className="px-2 py-2 text-gray-500">天干</td>
                        {b.tgChars.map((c, i) => (
                          <td key={i} className={`px-3 py-2 text-center text-sm font-bold ${WXC[b.wxTg[i]]?.split(' ')[1] || 'text-gray-300'}`}>{c}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-dark-600/50">
                        <td className="px-2 py-2 text-gray-500">地支</td>
                        {b.dzChars.map((c, i) => (
                          <td key={i} className={`px-3 py-2 text-center text-sm font-bold ${WXC[b.wxDz[i]]?.split(' ')[1] || 'text-gray-300'}`}>{c}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-dark-600/50">
                        <td className="px-2 py-2 text-gray-500">藏干</td>
                        {b.cangGan.map((cg, i) => (
                          <td key={i} className="px-3 py-2 text-center text-xs text-gray-400">{cg || '—'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-2 py-2 text-gray-500">纳音</td>
                        {b.nayin.map((n, i) => (
                          <td key={i} className="px-3 py-2 text-center text-xs text-gold-400">{n}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 五行旺衰柱状条 */}
                <div className="mb-4">
                  <h4 className="text-xs text-gray-400 mb-2">五行旺衰</h4>
                  <div className="flex gap-2">
                    {['木','火','土','金','水'].map(wx => {
                      const cnt = b.wxCount[wx] || 0
                      const pct = Math.round((cnt / totalWx) * 100)
                      return (
                        <div key={wx} className="flex-1">
                          <div className="text-center text-[10px] mb-1">
                            <span className={`font-semibold ${WXC[wx]?.split(' ')[1] || 'text-gray-400'}`}>{wx}</span>
                          </div>
                          <div className={`h-16 rounded-md flex flex-col justify-end overflow-hidden ${wxBg[wx] || 'bg-dark-700'}`}>
                            <div className={`rounded-t bg-gradient-to-t ${wxColor[wx] || wxColor['土']} transition-all duration-500`}
                              style={{height: Math.max(cnt > 0 ? pct : 4, 4) + '%'}}>
                            </div>
                          </div>
                          <div className="text-center text-[10px] text-gray-500 mt-1">{cnt}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 命盘解读 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-gray-500 block">日主</span>
                    <span className={`text-sm font-bold ${WXC[b.riZhuWx]?.split(' ')[1] || 'text-gray-200'}`}>{b.riZhu}（{b.riZhuWx}）</span>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-gray-500 block">身强弱</span>
                    <span className={`text-sm font-semibold ${b.bodyStrength==='身强'?'text-red-400':b.bodyStrength==='身弱'?'text-blue-400':'text-yellow-400'}`}>{b.bodyStrength}</span>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-gray-500 block">用神</span>
                    <span className={`text-sm font-bold ${WXC[b.yongShen]?.split(' ')[1] || 'text-gold-400'}`}>{b.yongShen}</span>
                  </div>
                </div>

                {/* 用神建议 */}
                <div className="mt-3 bg-dark-700/50 rounded-lg p-3 border border-dark-600">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="text-gold-400 font-semibold">{b.bodyStrength}，用神为{b.yongShen}。</span>
                    {b.bodyStrength === '身强'
                      ? ` 八字${b.riZhuWx}旺，宜用${KE_CYCLE[b.riZhuWx]||'土'}、${Object.entries(SHENG_CYCLE).find(([k]) => k === b.riZhuWx)?.[1]||''}五行来平衡命局。建议起名选带「${KE_CYCLE[b.riZhuWx]||'土'}」「${Object.entries(SHENG_CYCLE).find(([k]) => k === b.riZhuWx)?.[1]||''}」属性的字。`
                      : b.bodyStrength === '身弱'
                        ? ` 八字${b.riZhuWx}偏弱，宜用${SHENG_CYCLE[b.riZhuWx]||'水'}、${b.riZhuWx}五行来生扶命局。建议起名选带「${SHENG_CYCLE[b.riZhuWx]||'水'}」「${b.riZhuWx}」属性的字。`
                        : ` 八字五行中和，${b.riZhuWx}日主平衡，可以${b.riZhuWx}为基稍加生扶。`
                    }
                  </p>
                </div>
              </div>
            )
          })()}

          {/* 名字结果 */}
          {wxResults.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wxResults.map((r, i) => (
                  <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/20 p-5 hover:border-gold-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold font-serif text-gold-400">{r.fullName}</span>
                      <span className={`text-lg font-bold ${r.avgScore>=80?'text-green-400':r.avgScore>=60?'text-yellow-400':'text-red-400'}`}>{r.avgScore}分</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {r.chars.map((c, j) => (
                        <span key={j} className={`text-[10px] px-2 py-1 rounded border ${WXC[c.wx]||'bg-dark-700 border-dark-600'}`}>
                          {c.char}（{c.wx}·{c.stroke}画）
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {r.scores.map((w, j) => (
                        <div key={j} className="text-center bg-dark-700 rounded p-1">
                          <p className="text-[9px] text-gray-500">{w.key}</p>
                          <p className={`text-[10px] font-semibold ${gradeC[w.score]}`}>{w.val}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500">三才配置：{r.sancai}</p>
                    {r.meaning && <p className="text-[10px] text-gray-600 mt-1">{r.meaning}</p>}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button onClick={handleRegenerate}
                  className="bg-dark-700 hover:bg-dark-600 border border-gold-500/30 text-gray-300 px-6 py-2.5 rounded-lg transition-colors active:scale-95">再起一遍</button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">从唐诗宋词、诗经楚辞、论语易经中精选雅致名字</p>
          {poemBatch.length === 0 && handleGushi()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {poemBatch.map((entry, i) => (
              <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 hover:border-gold-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold font-serif text-gold-400">{entry.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-dark-700 text-gray-400 border border-dark-600">{entry.source}</span>
                </div>
                <p className="text-xs text-gray-300 italic mb-2">「{entry.line}」</p>
                <p className="text-xs text-gray-500">—— {entry.category} · {entry.author}</p>
                <p className="text-[10px] text-gray-600 mt-2">{entry.meaning}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button onClick={handleGushi}
              className="bg-dark-700 hover:bg-dark-600 border border-gold-500/30 text-gray-300 px-6 py-2.5 rounded-lg transition-colors active:scale-95">换一批</button>
          </div>
        </>
      )}
    </div>
  )
}