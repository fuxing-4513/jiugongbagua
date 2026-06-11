'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from '../../lib/i18n'
import ShareResult from '../../components/ShareResult'
import NamingClient from './NamingClient'
import dynamic from 'next/dynamic'

// 动态加载起名用字组件（数据量大，独立 chunk）
const NamingChars = dynamic(() => import('@/components/NamingChars'), { ssr: false })

// ── 异步加载康熙字典笔画库 ──
let kangxiStrokes: Record<string, number> | null = null
let kangxiLoading = false
const kangxiCallbacks: Array<(ok: boolean) => void> = []

function loadKangxi() {
  if (kangxiStrokes) { return }  // 已加载
  if (kangxiLoading) { return }  // 加载中
  kangxiLoading = true
  fetch('/data/kangxi.json')
    .then(r => r.json())
    .then(data => {
      kangxiStrokes = {}
      if (data && data.c) {
        for (const [ch, st] of data.c) {
          kangxiStrokes[ch] = st
        }
      }
      kangxiLoading = false
      kangxiCallbacks.forEach(cb => cb(true))
      kangxiCallbacks.length = 0
    })
    .catch(() => {
      kangxiLoading = false
      kangxiCallbacks.forEach(cb => cb(false))
      kangxiCallbacks.length = 0
    })
}

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

// ── 笔画字典 ──
const STROKES: Record<string, number> = {
  '一':1,
  '二':2,
  '三':3,
  '四':5,
  '五':4,
  '六':4,
  '七':2,
  '八':2,
  '九':2,
  '十':2,
  '王':4,
  '李':7,
  '张':11,
  '刘':15,
  '陈':16,
  '杨':13,
  '赵':14,
  '黄':12,
  '周':8,
  '吴':7,
  '徐':10,
  '孙':10,
  '马':10,
  '胡':11,
  '朱':6,
  '郭':15,
  '何':7,
  '高':10,
  '林':8,
  '罗':20,
  '郑':14,
  '梁':11,
  '谢':17,
  '宋':7,
  '唐':10,
  '韩':17,
  '曹':11,
  '许':11,
  '邓':15,
  '冯':12,
  '萧':16,
  '程':12,
  '蔡':17,
  '彭':12,
  '潘':15,
  '袁':10,
  '董':15,
  '田':5,
  '丁':2,
  '方':4,
  '石':5,
  '沈':8,
  '苏':22,
  '卢':16,
  '蒋':15,
  '魏':18,
  '贾':13,
  '范':11,
  '金':8,
  '孟':8,
  '秦':10,
  '顾':21,
  '乔':12,
  '白':5,
  '毛':4,
  '江':7,
  '谭':19,
  '廖':14,
  '崔':11,
  '邹':12,
  '熊':14,
  '任':6,
  '康':11,
  '郝':14,
  '叶':15,
  '陆':16,
  '段':9,
  '侯':9,
  '黎':15,
  '文':4,
  '武':8,
  '曾':12,
  '关':19,
  '夏':10,
  '严':20,
  '殷':10,
  '常':11,
  '卫':16,
  '史':5,
  '于':3,
  '苗':11,
  '姚':9,
  '姜':9,
  '薛':19,
  '邱':12,
  '汪':8,
  '倪':10,
  '汤':13,
  '大':3,
  '小':3,
  '中':4,
  '国':11,
  '人':2,
  '民':5,
  '和':8,
  '生':5,
  '年':6,
  '月':4,
  '日':4,
  '时':10,
  '上':3,
  '下':3,
  '永':5,
  '安':6,
  '平':5,
  '吉':6,
  '祥':10,
  '瑞':14,
  '福':14,
  '禄':12,
  '寿':14,
  '喜':12,
  '财':10,
  '富':12,
  '贵':12,
  '荣':14,
  '华':14,
  '昌':8,
  '盛':12,
  '兴':16,
  '隆':17,
  '伟':11,
  '杰':12,
  '军':9,
  '强':12,
  '刚':10,
  '勇':9,
  '毅':15,
  '志':7,
  '诚':14,
  '信':9,
  '忠':8,
  '孝':7,
  '仁':4,
  '义':13,
  '礼':18,
  '智':12,
  '明':8,
  '亮':9,
  '清':12,
  '洁':16,
  '丽':19,
  '美':9,
  '俊':9,
  '豪':14,
  '龙':16,
  '凤':14,
  '鹏':19,
  '鹤':21,
  '飞':9,
  '天':4,
  '地':6,
  '宇':6,
  '洪':10,
  '博':12,
  '贤':15,
  '良':7,
  '德':15,
  '道':13,
  '光':6,
  '辉':15,
  '海':11,
  '洋':10,
  '东':8,
  '南':9,
  '西':6,
  '北':5,
  '春':9,
  '冬':5,
  '建':9,
  '成':7,
  '功':5,
  '山':3,
  '川':3,
  '云':12,
  '雪':11,
  '梅':11,
  '兰':25,
  '竹':6,
  '菊':14,
  '松':8,
  '柏':9,
  '枫':13,
  '柳':9,
  '花':10,
  '玉':5,
  '宝':20,
  '莲':17,
  '琴':13,
  '琪':13,
  '琳':13,
  '慧':15,
  '敏':11,
  '婷':12,
  '娟':10,
  '欣':8,
  '悦':11,
  '嘉':14,
  '宁':14,
  '静':16,
  '怡':9,
  '彤':7,
  '鑫':24,
  '森':12,
  '磊':15,
  '晶':12,
  '锋':15,
  '锦':16,
  '铭':14,
  '泽':17,
  '浩':11,
  '宸':10,
  '哲':10,
  '航':10,
  '奕':9,
  '凯':12,
  '逸':15,
  '皓':12,
  '钧':12,
  '霆':15,
  '霖':16,
  '翰':16,
  '韬':14,
  '修':10,
  '旭':6,
  '睿':14,
  '奇':8,
  '钰':13,
  '玥':9,
  '柠':18,
  '汐':7,
  '洛':10,
  '涵':12,
  '泓':9,
  '淇':12,
  '淳':12,
  '萱':15,
  '燕':16,
  '莹':15,
  '薇':19,
  '昊':8,
  '昕':8,
  '昀':8,
  '晟':11,
  '晖':13,
  '晏':10,
  '晴':12,
  '曜':18,
  '朗':11,
  '峰':10,
  '峻':10,
  '岚':12,
  '源':14,
  '润':16,
  '泰':10,
  '丰':18,
  '盈':9,
  '茂':11,
  '庆':15,
  '贺':12,
  '颂':13,
  '祝':10,
  '佑':7,
  '祯':14,
  '祺':13,
  '瀚':19,
  '煜':13,
  '炜':13,
  '焯':13,
  '珺':12,
  '璨':17,
  '瑾':16,
  '璇':16,
  '瑶':15,
  '璐':18,
  '璟':16,
  '曦':20,
  '巍':22,
  '岩':8,
  '岭':17,
  '岳':8,
  '澄':16,
  '澈':16,
  '波':9,
  '澜':20,
  '灏':25,
  '河':9,
  '涛':18,
  '耀':20,
  '星':9,
  '辰':7,
  '承':8,
  '继':20,
  '宗':8,
  '恩':10,
  '惠':12,
  '家':10,
  '庭':10,
  '邦':11,
  '英':11,
  '雄':12,
  '彦':9,
  '士':3,
  '子':3,
  '男':7,
  '女':3,
  '廉':13,
  '正':5,
  '直':8,
  '敢':11,
  '谦':17,
  '逊':14,
  '让':6,
  '乐':15,
  '双':18,
  '言':7,
  '语':14,
  '诗':13,
  '书':10,
  '画':12,
  '全':6,
  '秋':9,
  '绣':12,
  '绮':14,
  '艳':24,
  '芳':10,
  '芷':10,
  '蓉':16,
  '艾':8,
  '萍':14,
  '荷':14,
  '芝':10,
  '楠':13,
  '檀':17,
  '桂':10,
  '桐':10,
  '桃':10,
  '杏':7,
  '梨':11,
  '草':12,
  '霜':17,
  '露':21,
  '雨':8,
  '霞':17,
  '虹':9,
  '雯':12,
  '雾':13,
  '霓':16,
  '寒':12,
  '暖':13,
  '温':13,
  '凉':11,
  '珠':11,
  '珊':10,
  '瑚':14,
  '珍':10,
  '瑛':13,
  '璧':18,
  '玺':19,
  '环':18,
  '玲':10,
  '珑':22,
  '玟':9,
}

function getStroke(char: string): number {
  if (kangxiStrokes && kangxiStrokes[char] !== undefined) return kangxiStrokes[char]
  return STROKES[char] || ((char.charCodeAt(0) - 0x4e00) % 20 + 1)
}

// ── 五行映射 ──
const WX: Record<string, string> = {
'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
'一':'木','二':'木','三':'火','四':'火','五':'土','六':'土','七':'金','八':'金','九':'水','十':'水',
}
function charWx(c: string): string {
  const s = getStroke(c)
  if (s <= 2) return '木'; if (s <= 4) return '火'; if (s <= 6) return '土'; if (s <= 8) return '金'; return '水'
}

// ── 81数理详解 ──
const NUM_DETAIL: Record<number, { score: string; title: string; sign: string; meaning: string; type: string }> = {
1:{score:'大吉',title:'太极之数',sign:'天地开泰，万事顺利',meaning:'反凶化吉象。位尊望重，建立基业。雅量厚重，足智多谋，善于协调，所谋如意，家门繁荣，福禄寿俱全。为大事大业可成，富贵发达的好暗示。属温和之首领运数。',type:'首领运、吉祥运'},
2:{score:'凶',title:'两仪之数',sign:'混沌未开，进退保守',meaning:'混沌未定之象，为最大凶恶的暗示。意志不坚，无独立之气力，进退失自由，内外生波澜，困苦不安。摇动、病患、遭难，甚至残废。若伴有其他好数者可免致短命夭折。',type:'凶数运'},
3:{score:'大吉',title:'三才之数',sign:'吉祥如意，百事顺遂',meaning:'阴阳抱合，万物确定形成之象。有吉祥、成功发达之兆。智达明敏，艺高才广，有实力、有谋略，能成大业。若过刚情则怕柔能克刚。',type:'吉祥运、艺能运'},
4:{score:'凶',title:'四象之数',sign:'多招灾难，浮沉不定',meaning:'万物枯衰，破败死亡之象。属破坏的凶变数、不足不全的灭亡之兆。进退不自由，独立乏能力，大多辛苦困难。病难灾厄相继，或者与其他凶运配合而致发狂病死、夭折。',type:'凶数运、孤独运'},
5:{score:'大吉',title:'五行之数',sign:'福寿双全，名利双收',meaning:'福寿双全的完璧之数。阴阳和合、完璧之象。最大吉数。诗曰：福寿拱照，立身兴家，名扬四海，安享福禄。万事平安，多福多寿。',type:'吉祥运、首领运'},
6:{score:'吉',title:'六爻之数',sign:'安稳顺利，余庆绵绵',meaning:'万宝集门，天降幸运，立志奋发，得成大功。诗曰：安稳余庆，福田广种，德泽绵绵，永享太平。',type:'吉祥运'},
7:{score:'吉',title:'七政之数',sign:'刚毅果断，进取功名',meaning:'独断专行，勇往直前，进取成功之象。排除万难，刚毅果断，实至名归，能成大业。但过刚则损，需以柔济之。',type:'吉祥运、刚情运'},
8:{score:'吉',title:'八卦之数',sign:'勤恳务实，成功可期',meaning:'意志如铁石，富于进取的气概。排除万难，贯彻目的名利两得，忍耐克己，逐成大功。但其他运配合不善者，可能有遭难的厄运。',type:'吉祥运'},
9:{score:'凶',title:'大成之数',sign:'困苦艰难，劳而无功',meaning:'浮沉不定之象，缺乏实行的能力。缺乏气力，受苦难的灾害，有患难、损失、病苦等灾厄。诗曰：大成之数，蕴涵凶险，或成或败，难以把握。',type:'凶数运'},
10:{score:'凶',title:'终结之数',sign:'黑暗无光，万事徒劳',meaning:'为百事终结之数。一片黑暗，万时难转。空虚寂寞，多遭不幸。诗曰：终结之数，雪暗飘零，偶或有成，回顾茫然。',type:'凶数运'},
11:{score:'大吉',title:'早苗逢雨',sign:'草木逢春，枝叶沾露',meaning:'挽回家运的春来成安之象。阴阳复新，享天赋之幸福。万事顺利，稳健着实。次得富贵繁荣，再兴家业的暗示。能得众望，可成大事。',type:'吉祥运、首领运'},
12:{score:'凶',title:'掘井无泉',sign:'薄弱无力，孤独无援',meaning:'无理之数，发展薄弱。虽生不足，难酬志向。诗曰：薄弱无力，孤独无援，外甜内苦，谋事难成。',type:'凶数运、孤独运'},
13:{score:'大吉',title:'春日牡丹',sign:'天赋吉运，得人信赖',meaning:'充满智谋。享天赐之福，功名荣达，有实力、有大志，能成大业。一生享福禄。诗曰：吉运自来，能得众望，信用卓著，多才巧智。',type:'吉祥运、艺能运'},
14:{score:'凶',title:'破兆之数',sign:'多招灾难，浮沉不定',meaning:'浮沉不定之象，家庭缘薄，孤独、丧妻、丧子、离异等。诗曰：多破兆，丧妻儿，分居四方，不如守静。',type:'凶数运、孤独运'},
15:{score:'大吉',title:'福寿双全',sign:'谦恭做事，必得人和',meaning:'福寿双全之象。兴家立业，增荣盛名。拥有富贵、长寿、康宁之德。诗曰：福寿拱照，立身兴家，名扬四海，安享福禄。',type:'吉祥运、首领运'},
16:{score:'大吉',title:'厚重之数',sign:'能获众望，成就大业',meaning:'反凶化吉象。位尊望重，建立基业。雅量厚重，足智多谋，善于协调，所谋如意，家门繁荣，福禄寿俱全。为大事大业可成，富贵发达的好暗示。属温和之首领运数。',type:'首领运、吉祥运'},
17:{score:'吉',title:'刚强之数',sign:'排除万难，贵人相助',meaning:'突破万难的刚柔兼备数。权威刚强，意志坚定，有突破万难之气。若能包含雅量，定能获大成功。',type:'吉祥运、刚情运'},
18:{score:'大吉',title:'铁镜重磨',sign:'有志竟成，内外吉数',meaning:'铁石心发达运具备，有权力智谋。颖性非凡，志望一立必破万难达到目的，成就功业，博得名利。惟自信心过强而又乏包容之心，恐招事非诱发非难。宜养柔德，且慎勿骄。',type:'次吉祥运、艺能运、刚情运'},
19:{score:'凶',title:'多难之数',sign:'虽有智谋，功败垂成',meaning:'风云蔽月之象，有才智多谋略。虽有成就大业，一身经验，但处境常不安定，时有患难，病弱等。诗曰：风云蔽月，病弱患难。',type:'凶数运'},
20:{score:'凶',title:'屋下藏金',sign:'进退两难，万事难成',meaning:'非业破运的空虚数。陷于苦难、迷妄、病弱等。或者非业非运，而有不遇之叹。诗曰：屋下藏金，非业破运，灾祸不绝，枉费心力。',type:'凶数运'},
21:{score:'大吉',title:'明月照天',sign:'独立权威，万人仰慕',meaning:'明月中天之象。权威显达，大业成就。独立权威，受人尊敬。但若过刚则招灾。宜养柔德。',type:'首领运、吉祥运'},
22:{score:'凶',title:'秋草逢霜',sign:'怀才不遇，愁苦困难',meaning:'秋草逢霜之象，薄弱无力。陷于不遇，愁苦困难。诗曰：秋草逢霜，怀才不遇，忧愁苦闷，事不如意。',type:'凶数运'},
23:{score:'大吉',title:'壮丽之数',sign:'旭日东升，名显四方',meaning:'伟大昌隆之运，威势冲天之象。赫赫首领之数。微贱出身，逐渐长大，终至首领。有如凯旋之将，猛虎添翼。',type:'首领运、吉祥运'},
24:{score:'大吉',title:'白手起家',sign:'财源广进，白手起家',meaning:'金钱丰盈之数。白手起家，财源广进。能创大业，终成大富。诗曰：白手起家，财源广进，智谋出众，成功可期。',type:'吉祥运、财富运'},
25:{score:'吉',title:'英俊之数',sign:'天时地利，再得人和',meaning:'资性英敏，有奇特的才能。唯性情不平和，偏于一方。诗曰：英俊之数，资性英敏，但有不平，偏于一方。',type:'吉祥运、艺能运'},
26:{score:'凶',title:'变怪之数',sign:'波浪起伏，千变万化',meaning:'英雄运格，一生波涛重叠，变故颇多。富有义气侠情，但难免常有无妄之灾。诗曰：变怪之数，英雄运格，风波重叠，成就难度。',type:'凶数运'},
27:{score:'吉',title:'增长之数',sign:'一成一败，一盛一衰',meaning:'欲望无止境，自信心过强。宜养柔德，不可刚愎自用。诗曰：增长之数，一成一败，盛衰交加，前途不定。',type:'次吉祥运'},
28:{score:'凶',title:'阔水浮萍',sign:'鱼临旱地，难逃厄运',meaning:'遭难之数，豪杰气概。四海漂泊，终世浮躁。诗曰：阔水浮萍，豪杰气概，四海漂泊，终世浮躁。',type:'凶数运、孤独运'},
29:{score:'大吉',title:'青云直上',sign:'青云直上，才略奏功',meaning:'泉涌般富有才谋，有财力、有智谋。有领导和活动能力。但若过刚则招灾。',type:'首领运、吉祥运'},
30:{score:'吉',title:'非运之数',sign:'吉凶参半，得失相伴',meaning:'浮沉不定之数。吉凶难分，其运就开矿探险一般。诗曰：非运之数，吉凶难分，浮沉不定，守静为宜。',type:'次吉祥运'},
31:{score:'大吉',title:'智勇兼备',sign:'智勇兼备，可成大业',meaning:'智慧仁勇俱全，能成大业。领导者之数，威德兼备。诗曰：智勇兼备，仁德俱全，功名成就，大业可成。',type:'首领运、吉祥运'},
32:{score:'大吉',title:'侥幸之数',sign:'侥幸多望，贵人相助',meaning:'侥幸多望之象。得天赐之福，享名誉，地位。诗曰：侥幸多望，贵人相助，得遇良机，万事如意。',type:'吉祥运'},
33:{score:'大吉',title:'升天之家',sign:'意气用事，人和必失',meaning:'鸾凤相会之象，形成确定之意。多智谋、刚毅果断。有实力，有大志。但过刚则损。',type:'首领运、吉祥运'},
34:{score:'凶',title:'破家之数',sign:'灾难不绝，成功难望',meaning:'破家之身，短命数。内外不和，信用缺乏。诗曰：破家之数，灾难不绝，成功难望，万事难成。',type:'凶数运'},
35:{score:'吉',title:'温和之数',sign:'温和平安，文昌技艺',meaning:'温良恭俭让之数。表面温和，内里刚毅。文昌技艺，人人爱重。宜养柔德。',type:'吉祥运、艺能运'},
36:{score:'凶',title:'波澜之数',sign:'波澜重叠，常陷穷困',meaning:'波澜重叠，浮沉万状。常陷穷困，病弱之数。诗曰：波澜重叠，常陷穷困，病弱孤独，万事难成。',type:'凶数运'},
37:{score:'大吉',title:'猛虎出林',sign:'逢凶化吉，风调雨顺',meaning:'权威显达，热诚忠信。有雅量，能得众人信赖，可获大成功。',type:'首领运、吉祥运'},
38:{score:'吉',title:'磨铁成针',sign:'名虽可得，利则难获',meaning:'有志气但缺实行之数。虽有心事，但缺乏实行的能力。诗曰：磨铁成针，名虽可得，利则难获，需下一番苦功。',type:'次吉祥运'},
39:{score:'大吉',title:'富贵之数',sign:'云开见月，前途光明',meaning:'德泽四海的富贵之数。财源广进，富贵至极。诗曰：富贵之数，财源广进，德泽四海，前途光明。',type:'首领运、吉祥运'},
40:{score:'凶',title:'退安之数',sign:'一盛一衰，浮沉不定',meaning:'谨慎保安的豪胆迈进数。虽知足常乐，但优柔寡断。诗曰：退安之数，一盛一衰，浮沉不定，守静为宜。',type:'凶数运'},
41:{score:'大吉',title:'德望之数',sign:'天赋吉运，德望兼备',meaning:'顺风扬帆之象。经纬深，智谋大，可成大业。博得名利，富贵繁荣。',type:'首领运、吉祥运'},
42:{score:'凶',title:'寒蝉在柳',sign:'博学多才，十艺不成',meaning:'博识多能，有技艺，精于某事。但十艺不成，难成功业。诗曰：寒蝉在柳，博学多才，十艺不成，劳而无功。',type:'凶数运'},
43:{score:'凶',title:'散财之数',sign:'雨夜之花，外祥内苦',meaning:'须防邪途灾害。有技能，但散财之象。诗曰：雨夜之花，外祥内苦，须防邪途，谨慎为宜。',type:'凶数运'},
44:{score:'凶',title:'烦闷之数',sign:'虽用心计，事难遂愿',meaning:'愁眉难展之象。事难遂愿，一生平平。诗曰：烦闷之数，事难遂愿，愁眉难展，进步艰难。',type:'凶数运'},
45:{score:'大吉',title:'顺风之数',sign:'顺风扬帆，万事如意',meaning:'新生泰和的万事如意数。富贵繁荣，一帆风顺。诗曰：顺风之数，万事如意，一帆风顺，富贵繁荣。',type:'吉祥运'},
46:{score:'凶',title:'浪里淘金',sign:'坎坷不平，困难重重',meaning:'浪里淘金之象。一生穷困，希望难成。诗曰：浪里淘金，坎坷不平，困难重重，成功有望。',type:'凶数运'},
47:{score:'大吉',title:'点石成金',sign:'万事可成，财源滚滚',meaning:'开花结果之象。万事如意，可成大业。诗曰：点石成金，万事可成，财源滚滚，功成名就。',type:'吉祥运、首领运'},
48:{score:'大吉',title:'星拱云台',sign:'智谋兼备，德望高崇',meaning:'德智兼备之数。有才能，有德行。最宜从事教育、文化、艺术等行业。',type:'吉祥运、艺能运'},
49:{score:'凶',title:'转变之数',sign:'遇吉则吉，遇凶则凶',meaning:'吉凶难分之象。须防厄运，好运来时转吉。诗曰：转变之数，遇吉则吉，遇凶则凶，须防厄运。',type:'凶数运'},
50:{score:'凶',title:'船行浅滩',sign:'吉凶互见，一成一败',meaning:'一成一败之象。吉凶参半，须防厄运。诗曰：船行浅滩，吉凶互见，一成一败，成败难分。',type:'凶数运'},
51:{score:'吉',title:'盛衰交加',sign:'盛衰交加，波澜重叠',meaning:'一盛一衰之象。浮沉不定，成败难分。诗曰：盛衰交加，波澜重叠，一盛一衰，成败难分。',type:'次吉祥运'},
55:{score:'吉',title:'善善恶恶',sign:'外观昌隆，内隐祸患',meaning:'外观幸福，内多困苦之象。表面风光，内心忧虑。诗曰：善善恶恶，外观昌隆，内隐祸患，谨慎为宜。',type:'次吉祥运'},
61:{score:'大吉',title:'牡丹芙蓉',sign:'名利双收，繁荣昌盛',meaning:'名利双收之象。丰盛运格，富贵繁荣。诗曰：牡丹芙蓉，名利双收，繁荣昌盛，福禄齐全。',type:'吉祥运、首领运'},
63:{score:'大吉',title:'舟归平海',sign:'万物化育，繁荣之象',meaning:'天赐之福，一生安稳。诗曰：舟归平海，万物化育，繁荣之象，福从天来。',type:'吉祥运'},
65:{score:'大吉',title:'巨流归海',sign:'吉运自来，可享盛名',meaning:'福禄长久之象。安享福寿，万事如意。诗曰：巨流归海，吉运自来，可享盛名，福禄绵长。',type:'吉祥运'},
67:{score:'大吉',title:'顺风扬帆',sign:'天时地利，一帆风顺',meaning:'受上司之惠泽栽培，能成功发展。诗曰：顺风扬帆，天时地利，一帆风顺，万事如意。',type:'吉祥运'},
68:{score:'大吉',title:'顺风顺水',sign:'智虑周密，志气如刚',meaning:'兴家立业之象。智谋周密，志向坚定。诗曰：顺风顺水，智虑周密，志气如刚，创业成功。',type:'吉祥运'},
71:{score:'吉',title:'吉凶参半',sign:'吉凶参半，顺逆难料',meaning:'吉凶参半之象。顺逆难料，成败无常。诗曰：吉凶参半，顺逆难料，成败无常，守静为宜。',type:'次吉祥运'},
73:{score:'吉',title:'安乐自来',sign:'安乐自来，自然吉祥',meaning:'安乐之象。自然吉祥，一生安稳。诗曰：安乐自来，自然吉祥，一生安稳，福从天来。',type:'次吉祥运'},
75:{score:'吉',title:'退守之数',sign:'进不如守，安分守己',meaning:'退守之象。进不如守，安分守己。诗曰：退守之数，进不如守，安分守己，自然平安。',type:'次吉祥运'},
77:{score:'吉',title:'先苦后甘',sign:'先苦后甘，先败后成',meaning:'先苦后甘之象。先败后成，终得福贵。诗曰：先苦后甘，先败后成，虽历艰辛，终得福贵。',type:'次吉祥运'},
78:{score:'吉',title:'晚境荣华',sign:'虽有困难，终得福贵',meaning:'晚境荣华之象。虽有困难，终得福贵。诗曰：晚境荣华，虽有困难，终得福贵，安享晚年。',type:'次吉祥运'},
81:{score:'大吉',title:'还元之数',sign:'万物回春，还复元始',meaning:'最极之数，还本归元。吉祥之数，富贵繁荣。诗曰：还元之数，万物回春，富贵繁荣，福禄绵长。',type:'吉祥运、首领运'},
}

function getNumDetail(val: number) {
  const idx = val > 81 ? val % 80 : (val <= 0 ? 1 : val)
  return NUM_DETAIL[idx] || {score:'吉',title:'未知',sign:'—',meaning:'—',type:'—'}
}

// ── 五行颜色 ──
const WXC: Record<string, string> = {'木':'bg-green-900/40 text-green-300 border-green-700','火':'bg-red-900/40 text-red-300 border-red-700','土':'bg-amber-900/40 text-amber-300 border-amber-700','金':'bg-yellow-900/40 text-yellow-300 border-yellow-700','水':'bg-blue-900/40 text-blue-300 border-blue-700'}
const gradeC: Record<string, string> = {'大吉':'text-green-400','吉':'text-green-500','中吉':'text-yellow-400','中':'text-yellow-500','凶':'text-red-400','大凶':'text-red-500'}

export default function XingmingClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>
  const [tab, setTab] = useState<'score'|'naming'|'wuxing'>('score')

  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [result, setResult] = useState<any>(null)

  // 加载康熙字典笔画库（仅首次触发）
  useEffect(() => { loadKangxi() }, [])

  const analyze = () => {
    const ln = lastName.trim()
    const fn = firstName.trim()
    if (!ln && !fn) return
    const fullName = ln + fn
    const allChars = [...fullName]

    // 单字笔画 + 五行
    const chars = allChars.map(c => ({
      char: c,
      stroke: getStroke(c),
      wuxing: charWx(c),
      lucky: getStroke(c) % 2 === 1 ? '吉' : '凶',
    }))

    // 笔画数
    const lnStrokes = [...ln].map(getStroke)
    const fnStrokes = [...fn].map(getStroke)
    const lnSum = lnStrokes.reduce((a, b) => a + b, 0)
    const fnSum = fnStrokes.reduce((a, b) => a + b, 0)

    // 五格
    const tiange = lnSum + (ln.length === 1 ? 1 : 0)
    const renge = (lnStrokes[lnStrokes.length - 1] || 0) + (fnStrokes[0] || 0)
    const dige = fnSum + (fn.length <= 1 ? 1 : 0)
    const zongge = lnSum + fnSum
    const waige = zongge - renge + (ln.length === 1 ? 1 : ln.length)

    const wuge = [
      { key: '天格', val: tiange, label: '12岁前的先天运势以及先天遗传，影响不大，若不理想不必计较' },
      { key: '人格', val: renge, label: '24-48岁人生颠峰期运势以及个性、才华及事业运，影响一生运势' },
      { key: '地格', val: dige, label: '36岁前的青年运势以及家庭夫妻、子女田宅，影响基础运' },
      { key: '外格', val: waige, label: '36-48岁的中年运势以及社交、朋友、工作环境等，影响后天的机遇' },
      { key: '总格', val: zongge, label: '48岁后的中晚年运势以及财富、收入，影响人生最终的成就' },
    ].map(w => {
      const r = w.val % 10; let wx = '水'
      if (r <= 2) wx = '木'; else if (r <= 4) wx = '火'; else if (r <= 6) wx = '土'; else if (r <= 8) wx = '金'
      return { ...w, ...getNumDetail(w.val), wuxing: wx }
    })

    const sancai = `${wuge[0].wuxing}→${wuge[1].wuxing}→${wuge[2].wuxing}`

    // 三才配置吉凶
    const sx: Record<string, Record<string, Record<string, string>>> = {
      金:{金:{金:'吉',木:'凶',水:'吉',火:'凶',土:'吉'},木:{金:'凶',木:'大吉',水:'凶',火:'吉',土:'凶'},水:{金:'吉',木:'凶',水:'大吉',火:'凶',土:'吉'},火:{金:'凶',木:'吉',水:'凶',火:'大吉',土:'凶'},土:{金:'小吉',木:'凶',水:'凶',火:'吉',土:'大吉'}}
    }
    const scScore = sx[wuge[0].wuxing]?.[wuge[1].wuxing]?.[wuge[2].wuxing] || '中'

    // 综合评分
    const scoreMap: Record<string, number> = {'大吉':100,'吉':80,'中吉':65,'中':50,'凶':30,'大凶':10,'小吉':70}
    const avgScore = Math.round(wuge.reduce((s, w) => s + (scoreMap[w.score] || 50), 0) / 5)

    setResult({ fullName, chars, wuge, sancai, scScore, avgScore, ln, fn })
  }

  const r = result

  return (<div className="max-w-3xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">姓名</h1>
    <p className="text-gray-400 mb-6">姓名打分 & 起名服务</p>
    
    {/* Tab 切换 */}
    <div className="flex gap-1 bg-dark-700 rounded-lg p-1 mb-6 max-w-md mx-auto">
      <button onClick={()=>setTab('score')}
        className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors ${tab==='score'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200'}`}>姓名打分</button>
      <button onClick={()=>setTab('naming')}
        className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors ${tab==='naming'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200'}`}>起名服务</button>
      <button onClick={()=>setTab('wuxing')}
        className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors ${tab==='wuxing'?'bg-gold-600 text-dark-900 font-semibold':'text-gray-400 hover:text-gray-200'}`}>起名用字</button>
    </div>
    
    {tab === 'naming' ? <NamingClient /> : tab === 'wuxing' ? <NamingChars /> : (
    <>
    <p className="text-gray-400 mb-6">基于康熙字典笔画·五格数理·三才五行配置给姓名打分</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><label className="block text-xs text-gray-400 mb-1">姓氏</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">名字</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" /></div>
      </div>
      <button onClick={analyze}
        className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">开始测算</button>
    </div>

    {r && (<div className="space-y-5">
      {/* 基本资料 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">姓名基本资料</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-300">
          <div><span className="text-gray-500">姓名：</span>{r.fullName}</div>
          <div><span className="text-gray-500">姓氏：</span>{r.ln}</div>
          <div><span className="text-gray-500">名字：</span>{r.fn}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {r.chars.map((c: any, i: number) => (
            <div key={i} className="bg-dark-700 rounded-lg p-3 text-center border border-dark-600">
              <p className="text-xl font-bold text-gold-400 font-serif">{c.char}</p>
              <p className="text-[10px] text-gray-500 mt-1">笔画：{c.stroke} · 五行：{c.wuxing} · {c.lucky}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 五格数理 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">姓名五格数理及五行</h3>
        <p className="text-xs text-gray-500 mb-3">其中天、人、地为三才：{r.sancai}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {r.wuge.map((w: any, i: number) => (
            <div key={i} className={`rounded-lg p-3 text-center border ${WXC[w.wuxing] || 'bg-dark-700 border-dark-600'}`}>
              <p className="text-[10px] text-gray-500 mb-0.5">{w.key}</p>
              <p className="text-sm font-bold text-gray-100">{w.val}</p>
              <p className="text-[10px] text-gray-500">五行：{w.wuxing}</p>
              <p className={`text-[10px] font-semibold ${gradeC[w.score]}`}>{w.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 五格详解 */}
      {r.wuge.map((w: any, i: number) => (
        <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gold-300">{w.key}{w.val}所示之{w.key === '天格' ? '先天运' : w.key === '人格' ? '主运' : w.key === '地格' ? '前运' : w.key === '外格' ? '副运' : '后运'}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${w.score === '大吉' ? 'border-green-700 text-green-300 bg-green-900/30' : w.score === '凶' || w.score === '大凶' ? 'border-red-700 text-red-300 bg-red-900/30' : 'border-yellow-700 text-yellow-300 bg-yellow-900/30'}`}>{w.score}</span>
          </div>
          <p className="text-[10px] text-gray-500 mb-2">{w.label}</p>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-gold-400 font-semibold mb-1">『数理』：[{w.title}] {w.sign}。[{w.score === '大吉' || w.score === '吉' ? '大吉' : '凶'}]</p>
            <p className="text-xs text-gold-400 font-semibold mb-1">『签语』：{w.sign}。</p>
            <p className="text-xs text-gray-300 leading-relaxed mb-1">『含义』：{w.meaning}</p>
            {w.type && <p className="text-[10px] text-gray-500">{w.key}{w.val}之数理暗示：{w.type}</p>}
          </div>
        </div>
      ))}

      {/* 三才配置 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">三才配置</h3>
        <p className="text-xs text-gray-500 mb-2">（三才配置吉凶为姓名测试之核心，请重点关注！）</p>
        <p className="text-xs text-gray-300 mb-3">您姓名的天地人三才配置为：{r.sancai}。{r.scScore === '吉' || r.scScore === '大吉' ? '三才配置良好，运势顺畅，根基稳固，家庭和睦，身体健康。' : r.scScore === '小吉' ? '三才配置尚可，虽有波折但总体平稳。' : '三才配置不佳，基础运薄弱，需多加注意健康和人际关系。'}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-[10px] text-gray-500">基础运</p>
            <p className="text-xs text-gray-300">{r.scScore === '大吉' || r.scScore === '吉' ? '稳固，安泰，能得他人信赖。（吉）' : '不遇苦而自苦，有急变衰落的悲运。（凶）'}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-[10px] text-gray-500">成功运</p>
            <p className="text-xs text-gray-300">{r.scScore === '大吉' || r.scScore === '吉' ? '境遇安定，稳固，身心健康，德性高尚者能有大的成功。（吉）' : '虽有长辈或上司之惠泽栽培，但基础不稳，易遭意外之灾。（凶）'}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-[10px] text-gray-500">社交运</p>
            <p className="text-xs text-gray-300">诸事多加细虑，言行谨慎，三思而后行，可化凶为吉。</p>
          </div>
        </div>
      </div>

      {/* 总评 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-5 text-center">
        <p className="text-xs text-gray-500 mb-1">总评及打分</p>
        <p className={`text-4xl font-bold ${r.avgScore >= 80 ? 'text-green-400' : r.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{r.avgScore}</p>
        <p className={`text-sm mt-1 font-semibold ${r.avgScore >= 80 ? 'text-green-400' : r.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
          {r.avgScore >= 90 ? '你的名字非常优秀，相信它会助你一生顺利的！' : r.avgScore >= 80 ? '你的名字起得很好，相信它会助你一生顺利的，祝你好运。' : r.avgScore >= 70 ? '名字不错，略有不足可以通过努力弥补。' : r.avgScore >= 60 ? '名字一般，可以考虑改进。' : '名字评分较低，建议考虑改名。'}
        </p>
      </div>

      {/* 数理暗示汇总 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-xs font-semibold text-gray-200 mb-2">数理暗示汇总</h3>
        <div className="flex flex-wrap gap-1">
          {r.wuge.map((w: any, i: number) => (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${w.score === '大吉' || w.score === '吉' ? 'border-green-700/40 text-green-300 bg-green-900/20' : 'border-red-700/40 text-red-300 bg-red-900/20'}`}>
              {w.key}{w.val}：{w.score}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 mt-2">说明：若五格数理暗示的凶数运较多，表示易破财、事业不顺、影响健康和家庭；女命狐独运、首领运及刚性运较多，则代表婚姻不顺。</p>
              <div className="flex justify-end mt-3">
                <ShareResult
                  text={`${r.fullName} - ${r.avgScore}分\n\n天格${r.tianGe.val}(${r.tianGe.wuxing}) ${r.shuLi.tianGe.ji}\n人格${r.renGe.val}(${r.renGe.wuxing}) ${r.shuLi.renGe.ji}\n地格${r.diGe.val}(${r.diGe.wuxing}) ${r.shuLi.diGe.ji}\n外格${r.waiGe.val}(${r.waiGe.wuxing}) ${r.shuLi.waiGe.ji}\n总格${r.zongGe.val}(${r.zongGe.wuxing}) ${r.shuLi.zongGe.ji}\n\n三才配置: ${r.sanCaiConfig.tianWx}-${r.sanCaiConfig.renWx}-${r.sanCaiConfig.diWx} (${r.sanCaiConfig.luck})`}
                  title="【姓名打分结果】"
                  label="📋 复制结果"
                />
              </div>
      </div>
    </div>)}
    </>)}
  </div>)
}
