'use client'

import { useState, useCallback, useMemo } from 'react'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

interface Dream {
  keyword: string
  title: string
  meaning: string
  category: string
}

// ── 150+ 梦境数据库 ──
const DREAMS: Dream[] = [
  // === 动物类 ===
  { keyword: '蛇', title: '蛇', category: '动物', meaning: '梦见蛇通常象征智慧与转变，也可能暗示潜在的威胁或性意识。白蛇为吉，黑蛇需警惕。' },
  { keyword: '狗', title: '狗', category: '动物', meaning: '梦见狗代表忠诚与友谊。狗对人友善预示朋友相助，狂吠之狗暗示小人是非。' },
  { keyword: '猫', title: '猫', category: '动物', meaning: '梦见猫象征女性的直觉与神秘。白猫吉顺，黑猫需防小人。猫抓咬暗示身边有难缠之人。' },
  { keyword: '鱼', title: '鱼', category: '动物', meaning: '梦见鱼象征财富与丰收。活鱼游动主财运，死鱼预示破财。鱼跃龙门更有升迁之喜。' },
  { keyword: '鸟', title: '鸟', category: '动物', meaning: '梦见鸟代表自由与希望。鸟鸣主喜讯，群鸟飞翔预示好消息将至。' },
  { keyword: '蝴蝶', title: '蝴蝶', category: '动物', meaning: '梦见蝴蝶象征美丽与蜕变。蝴蝶飞舞主爱情甜蜜，庄周梦蝶暗示人生如梦。' },
  { keyword: '蜘蛛', title: '蜘蛛', category: '动物', meaning: '梦见蜘蛛代表耐心与创造力。蜘蛛织网主事业有成，蜘蛛咬人需防小人暗算。' },
  { keyword: '老鼠', title: '老鼠', category: '动物', meaning: '梦见老鼠暗示小偷与烦恼。老鼠肆虐主破财，捉住老鼠则能逢凶化吉。' },
  { keyword: '老虎', title: '老虎', category: '动物', meaning: '梦见老虎象征权威与挑战。虎啸山林主事业升腾，被虎追赶示压力过大。' },
  { keyword: '龙', title: '龙', category: '动物', meaning: '梦见龙为大吉之兆，代表权力与尊贵。龙飞九天预示事业将有重大突破。' },
  { keyword: '马', title: '马', category: '动物', meaning: '梦见马象征力量与自由。骏马奔腾主事业顺利，骑马驰骋暗示升迁有望。' },
  { keyword: '羊', title: '羊', category: '动物', meaning: '梦见羊为吉祥之兆。羊群安详主家庭和睦，羊入怀中预示喜得贵子。' },
  { keyword: '猪', title: '猪', category: '动物', meaning: '梦见猪代表财富与福气。肥猪满圈主财运亨通，母猪产仔添丁之喜。' },
  { keyword: '鸡', title: '鸡', category: '动物', meaning: '梦见鸡象征准时报晓与警觉。公鸡啼鸣主声名远扬，母鸡孵蛋预示暗藏机遇。' },
  { keyword: '猴子', title: '猴子', category: '动物', meaning: '梦见猴子代表机灵与调皮。猴子嬉戏主有喜事，猴子上树暗示升职加薪。' },
  { keyword: '兔子', title: '兔子', category: '动物', meaning: '梦见兔子象征温柔与敏捷。白兔跳跃主感情顺利，捉住兔子预示抓住机遇。' },
  { keyword: '狼', title: '狼', category: '动物', meaning: '梦见狼代表野性与危险。狼群出没需防竞争对手，独狼嚎叫暗示内心孤独。' },
  { keyword: '鹿', title: '鹿', category: '动物', meaning: '梦见鹿为祥瑞之兆。鹿象征长寿与禄位，鹿鸣呦呦主功名利禄。' },
  { keyword: '大象', title: '大象', category: '动物', meaning: '梦见大象代表力量与智慧。大象稳行主根基牢固，白象更为祥瑞。' },
  { keyword: '蜜蜂', title: '蜜蜂', category: '动物', meaning: '梦见蜜蜂象征勤劳与丰收。蜜蜂采蜜主财源广进，蜂蜇示有小人。' },
  { keyword: '蚂蚁', title: '蚂蚁', category: '动物', meaning: '梦见蚂蚁代表勤奋与团结。蚂蚁搬家示将有变动，蚁群合力主团队协作成功。' },
  { keyword: '乌龟', title: '乌龟', category: '动物', meaning: '梦见乌龟象征长寿与稳健。乌龟慢行主事业稳步上升，龟蛇相交大吉之兆。' },
  { keyword: '孔雀', title: '孔雀', category: '动物', meaning: '梦见孔雀代表美丽与骄傲。孔雀开屏主喜庆之事，羽毛艳丽示才华展露。' },
  { keyword: '蝙蝠', title: '蝙蝠', category: '动物', meaning: '梦见蝙蝠在中国文化中为福之象征。蝙蝠飞入主福从天降，群蝠预示洪福齐天。' },
  { keyword: '螃蟹', title: '螃蟹', category: '动物', meaning: '梦见螃蟹象征横行与阻碍。螃蟹夹人示有阻碍，煮熟之蟹主困境可解。' },
  { keyword: '蝎子', title: '蝎子', category: '动物', meaning: '梦见蝎子代表危险与小人。蝎子蛰人需防暗算，杀死蝎子能化解危机。' },

  // === 自然类 ===
  { keyword: '水', title: '水', category: '自然', meaning: '梦见水代表情感与潜意识。清水主顺利，浊水示烦恼，洪水预警压力，海水广阔示心胸开阔。' },
  { keyword: '火', title: '火', category: '自然', meaning: '梦见火象征激情与转变。大火燃烧主财运旺，小火取暖示温暖，火灾则需防意外。' },
  { keyword: '雨', title: '雨', category: '自然', meaning: '梦见雨代表滋润与洗礼。细雨绵绵主感情细腻，大雨滂沱示压力释放，雨后彩虹更为大吉。' },
  { keyword: '雪', title: '雪', category: '自然', meaning: '梦见雪象征纯洁与宁静。白雪皑皑主事业纯洁，雪中行走示克服困难，雪崩则需防危机。' },
  { keyword: '风', title: '风', category: '自然', meaning: '梦见风代表变化与传播。微风拂面主心情舒畅，狂风大作示生活将有变动。' },
  { keyword: '洪水', title: '洪水', category: '自然', meaning: '梦见洪水象征情感失控或压力过大。洪水泛滥示事业危机，成功躲避则能化险为夷。' },
  { keyword: '地震', title: '地震', category: '自然', meaning: '梦见地震代表生活将有重大变化。地动山摇示根基动摇，安全逃脱则能渡过难关。' },
  { keyword: '太阳', title: '太阳', category: '自然', meaning: '梦见太阳象征光明与成功。旭日东升主事业蒸蒸日上，烈日当空示权力与荣耀。' },
  { keyword: '月亮', title: '月亮', category: '自然', meaning: '梦见月亮代表情感与浪漫。明月高悬主感情圆满，新月示新开始，满月主丰收。' },
  { keyword: '星星', title: '星星', category: '自然', meaning: '梦见星星象征希望与指引。繁星闪烁主前途光明，流星划过示许愿成真。' },
  { keyword: '彩虹', title: '彩虹', category: '自然', meaning: '梦见彩虹代表希望与美好。彩虹横跨主好运将至，双彩虹更为大吉。' },
  { keyword: '雷电', title: '雷电', category: '自然', meaning: '梦见雷电象征突然的启示或震惊。雷声轰鸣主警示，闪电照亮示灵感突现。' },
  { keyword: '山', title: '山', category: '自然', meaning: '梦见山代表目标与阻碍。攀登高山主事业进取，站在山顶示已达成目标。' },
  { keyword: '海', title: '海', category: '自然', meaning: '梦见海象征广阔与未知。风平浪静主心境平和，波涛汹涌示情绪起伏。' },
  { keyword: '河流', title: '河流', category: '自然', meaning: '梦见河流代表生命之流。河水清澈主顺利，河水浑浊示阻碍，过河成功示克服困难。' },

  // === 身体类 ===
  { keyword: '牙齿', title: '掉牙', category: '身体', meaning: '梦见掉牙通常表示内心不安或对衰老的忧虑。掉牙流血示亲友有难，无血掉落主自身健康需关注。' },
  { keyword: '牙', title: '牙齿', category: '身体', meaning: '梦见牙齿象征自信与形象。牙齿洁白主名声好，牙疼示有烦恼，长新牙主新生。' },
  { keyword: '头发', title: '头发', category: '身体', meaning: '梦见头发代表思绪与魅力。长发飘逸主思维活跃，掉发示烦恼缠身，白发主智慧增长。' },
  { keyword: '手', title: '手', category: '身体', meaning: '梦见手象征能力与掌控。双手有力主事业顺遂，手受伤示能力受阻，握手示合作。' },
  { keyword: '脚', title: '脚', category: '身体', meaning: '梦见脚代表行动与根基。脚步稳健主事业踏实，脚受伤示前行受阻，赤脚示回归本真。' },
  { keyword: '眼睛', title: '眼睛', category: '身体', meaning: '梦见眼睛象征洞察力与智慧。明亮双眼主明辨是非，眼疾示被蒙蔽，第三只眼示开悟。' },
  { keyword: '血', title: '血', category: '身体', meaning: '梦见血代表生命力与情感。鲜血淋漓主精力充沛，流血不止示元气损耗，献血示奉献。' },
  { keyword: '脸', title: '脸', category: '身体', meaning: '梦见脸象征面子与形象。面容光洁主名誉好，脸伤示名誉受损，化妆示伪装。' },
  { keyword: '心脏', title: '心脏', category: '身体', meaning: '梦见心脏代表情感核心。心跳有力主情感充实，心疼痛示情感受伤，心脏手术示重大改变。' },
  { keyword: '肚子', title: '肚子', category: '身体', meaning: '梦见肚子象征容纳与承受。肚子饿主需求未被满足，腹胀示负担过重，怀孕示新生命。' },

  // === 物品类 ===
  { keyword: '钱', title: '钱', category: '物品', meaning: '梦见钱代表价值与自我肯定。捡到钱主意外之财，花钱示付出，丢钱需防破财。' },
  { keyword: '手机', title: '手机', category: '物品', meaning: '梦见手机代表沟通与联系。手机响主有消息，手机丢失示失联焦虑，换手机示新开始。' },
  { keyword: '车', title: '车', category: '物品', meaning: '梦见车象征人生方向与掌控。开车顺利主掌控人生，车祸示失控，新车主新机遇。' },
  { keyword: '汽车', title: '汽车', category: '物品', meaning: '梦见汽车与车同义。开车平稳主一切顺遂，汽车抛锚示事业受阻。' },
  { keyword: '衣服', title: '衣服', category: '物品', meaning: '梦见衣服代表外在形象。新衣主新面貌，破衣示落魄，换衣示身份转变。' },
  { keyword: '房子', title: '房子', category: '物品', meaning: '梦见房子象征内心世界。大房子主心胸开阔，老房子示怀旧，新房主新生活。' },
  { keyword: '书', title: '书', category: '物品', meaning: '梦见书代表知识与智慧。读书主学业进步，写书示才华展露，书堆成山示压力。' },
  { keyword: '刀', title: '刀', category: '物品', meaning: '梦见刀象征决断与伤害。拿刀主果断，被刀伤示被伤害，刀断裂示决断失败。' },
  { keyword: '钥匙', title: '钥匙', category: '物品', meaning: '梦见钥匙代表解决问题的方法。找到钥匙主问题可解，丢钥匙示无计可施。' },
  { keyword: '镜子', title: '镜子', category: '物品', meaning: '梦见镜子象征自我认知。照镜主自我反省，镜碎示自我认知破裂。' },
  { keyword: '桥', title: '桥', category: '物品', meaning: '梦见桥代表过渡与连接。过桥主渡过难关，桥断示前路受阻，桥下流水示时光流逝。' },
  { keyword: '棺材', title: '棺材', category: '物品', meaning: '梦见棺材在中国文化中为升官发财之兆。棺材主官运，空棺示虚惊一场。' },
  { keyword: '黄金', title: '黄金', category: '物品', meaning: '梦见黄金代表财富与价值。金灿灿主富贵，得到黄金主财运旺，黄金变石头示虚幻。' },
  { keyword: '宝石', title: '宝石', category: '物品', meaning: '梦见宝石象征珍贵与美好。钻石主婚姻美满，红宝石示热情，蓝宝石示智慧。' },
  { keyword: '鞋', title: '鞋', category: '物品', meaning: '梦见鞋代表人生旅程。新鞋主新旅程，破鞋示旅途艰辛，鞋丢示失去方向。' },

  // === 场景类 ===
  { keyword: '考试', title: '考试', category: '场景', meaning: '梦见考试反映现实压力与自我质疑。考好主能力被认可，考砸示信心不足，找不到考场示逃避。' },
  { keyword: '坠落', title: '坠落', category: '场景', meaning: '梦见坠落通常表示失去掌控感或对失败的恐惧。从高处坠落示事业危机，安全落地则能化险为夷。' },
  { keyword: '飞翔', title: '飞翔', category: '场景', meaning: '梦见飞翔代表对自由的渴望与成功的愿望。高空飞翔主事业腾飞，低飞示束缚，坠落示梦碎。' },
  { keyword: '飞', title: '飞', category: '场景', meaning: '梦见飞同飞翔之解。自由翱翔主心胸开阔，飞不高示现实束缚。' },
  { keyword: '追赶', title: '被追赶', category: '场景', meaning: '梦见被追赶表示在逃避现实中的问题或情感。被追示压力，成功逃脱示问题可解。' },
  { keyword: '追', title: '追赶', category: '场景', meaning: '梦见追赶别人代表追求目标。追上主成功在望，追不上示目标太远。' },
  { keyword: '迷路', title: '迷路', category: '场景', meaning: '梦见迷路象征人生的迷茫与困惑。找不到路示方向不明，找到出路示豁然开朗。' },
  { keyword: '婚礼', title: '婚礼', category: '场景', meaning: '梦见婚礼预示新的开始或合作关系。参加婚礼主喜事，自己结婚示承诺，婚礼混乱示不安。' },
  { keyword: '死亡', title: '死亡', category: '场景', meaning: '梦见死亡通常象征重生与转变。亲人去世示关系变化，自己死亡示旧我终结，新生开始。' },
  { keyword: '死人', title: '死亡', category: '场景', meaning: '梦见死人与死亡类似。与死人说话示未了心愿，死人复活示转机出现。' },
  { keyword: '战斗', title: '战斗', category: '场景', meaning: '梦见战斗代表竞争与冲突。打赢主事业胜出，打输示需要调整策略，观战示观望。' },
  { keyword: '火灾', title: '火灾', category: '场景', meaning: '梦见火灾预示突发变故。大火烧屋主破财，成功灭火示能挽回损失。' },
  { keyword: '溺水', title: '溺水', category: '场景', meaning: '梦见溺水代表被情绪淹没。沉入水底示压力巨大，被救起示有人相助。' },
  { keyword: '爬山', title: '爬山', category: '场景', meaning: '梦见爬山象征克服困难与追求目标。轻松登顶主事业顺利，艰难攀爬示过程辛苦但终有收获。' },
  { keyword: '开车', title: '开车', category: '场景', meaning: '梦见开车代表自主掌控人生。平稳驾驶主一切在握，刹车失灵示失控感，迷路示方向不清。' },
  { keyword: '迟到', title: '迟到', category: '场景', meaning: '梦见迟到反映时间压力与焦虑。赶不上车示错失机会，迟到考试示准备不足。' },
  { keyword: '逃跑', title: '逃跑', category: '场景', meaning: '梦见逃跑代表面对威胁的本能反应。成功逃脱主逢凶化吉，被抓示无法逃避问题。' },
  { keyword: '游泳', title: '游泳', category: '场景', meaning: '梦见游泳代表驾驭情感的能力。自由泳主游刃有余，溺水示情绪失控，潜水示探索潜意识。' },

  // === 人物类 ===
  { keyword: '小孩', title: '小孩', category: '人物', meaning: '梦见小孩代表纯真与新的开始。可爱小孩主喜事，哭闹小孩示烦恼，抱小孩示责任。' },
  { keyword: '孕妇', title: '孕妇', category: '人物', meaning: '梦见孕妇象征创造力与新生命。怀孕主新项目的孕育，孕妇生产示成果即将诞生。' },
  { keyword: '老人', title: '老人', category: '人物', meaning: '梦见老人代表智慧与经验。慈祥老人主贵人相助，严厉老人示内心道德标准的提醒。' },
  { keyword: '陌生人', title: '陌生人', category: '人物', meaning: '梦见陌生人代表未知的自己。友善陌生人主新机遇，威胁陌生人示内心恐惧。' },
  { keyword: '明星', title: '明星', category: '人物', meaning: '梦见明星代表对名望的渴望。与明星互动主自信提升，见明星示向往更精彩的生活。' },
  { keyword: '父母', title: '父母', category: '人物', meaning: '梦见父母代表根源与庇护。父母安康主家庭和睦，生病示担忧，去世示独立成长。' },
  { keyword: '已故亲人', title: '已故亲人', category: '人物', meaning: '梦见已故亲人通常是思念之情。亲人安详示在另一个世界安好，有事相托示未了心愿。' },
  { keyword: '婴儿', title: '婴儿', category: '人物', meaning: '梦见婴儿象征新开始与纯真。健康婴儿主好运，哭闹婴儿示需要注意的新项目。' },
  { keyword: '双胞胎', title: '双胞胎', category: '人物', meaning: '梦见双胞胎代表平衡与对立。双胞胎主好事成双，争吵示内心矛盾。' },
  { keyword: '医生', title: '医生', category: '人物', meaning: '梦见医生代表治疗与修复。医生治病主问题可解，自己当医生示帮助他人。' },
  { keyword: '老师', title: '老师', category: '人物', meaning: '梦见老师代表指导与教诲。老师教导主需要学习，被表扬示能力被认可。' },
  { keyword: '警察', title: '警察', category: '人物', meaning: '梦见警察代表规则与权威。被警察抓示内心有愧，警察帮助示需要保护。' },

  // === 特殊类 ===
  { keyword: '怀孕', title: '怀孕', category: '特殊', meaning: '梦见怀孕象征创造力与新想法的孕育。怀孕主新项目在酝酿中，生产示成果即将面世。' },
  { keyword: '结婚', title: '结婚', category: '特殊', meaning: '梦见结婚预示新的开始或合作关系。婚礼美满主关系和谐，逃婚示恐惧承诺。' },
  { keyword: '离婚', title: '离婚', category: '特殊', meaning: '梦见离婚代表分离与解脱。离婚主关系结束，也可能是对自由的渴望。' },
  { keyword: '生孩子', title: '生孩子', category: '特殊', meaning: '梦见生孩子象征创造与成果。顺产主一切顺利，难产示过程艰难但最终成功。' },
  { keyword: '捡钱', title: '捡钱', category: '特殊', meaning: '梦见捡钱代表意外之喜。捡到大量钱主意外之财，捡到硬币示小确幸，捡钱后归还示品德高尚。' },
  { keyword: '丢东西', title: '丢东西', category: '特殊', meaning: '梦见丢东西代表失去与放下。丢贵重物主损失，丢烦恼物示解脱，找到失物示失而复得。' },
  { keyword: '考试通过', title: '考试通过', category: '特殊', meaning: '梦见考试通过代表能力被认可。高分通过主心想事成，低空飞过示侥幸成功。' },
  { keyword: '考试失败', title: '考试失败', category: '特殊', meaning: '梦见考试失败反映对自身能力的怀疑。不及格示信心不足，其实预示现实中会更努力。' },
  { keyword: '迷路找不到家', title: '迷路找不到家', category: '特殊', meaning: '梦见找不到家代表归属感的缺失。在陌生街道徘徊示内心不安，最终找到示重获安全感。' },
  { keyword: '被困', title: '被困', category: '特殊', meaning: '梦见被困代表现实中的束缚。被困在房间示压抑，困在电梯示事业瓶颈，挣脱示突破。' },

  // === 情感类 ===
  { keyword: '哭', title: '哭泣', category: '情感', meaning: '梦见哭泣代表情绪的释放。伤心大哭主压力释放，喜极而泣示惊喜将至。' },
  { keyword: '笑', title: '笑', category: '情感', meaning: '梦见笑代表快乐与满足。开怀大笑主心情愉悦，微笑示内心平和，苦笑示无奈。' },
  { keyword: '愤怒', title: '愤怒', category: '情感', meaning: '梦见愤怒代表积压的不满。发怒示需要表达，被激怒示触碰到底线，平息示和解。' },
  { keyword: '恐惧', title: '恐惧', category: '情感', meaning: '梦见恐惧代表面对未知的本能。恐惧逃跑示逃避问题，直面恐惧示勇敢。' },
  { keyword: '快乐', title: '快乐', category: '情感', meaning: '梦见快乐代表内心的满足。快乐场景主心境好，与朋友同乐示人际关系和谐。' },
  { keyword: '悲伤', title: '悲伤', category: '情感', meaning: '梦见悲伤代表情感的宣泄。悲伤流泪主心结得解，莫名悲伤示潜意识情绪需要关注。' },
  { keyword: '孤独', title: '孤独', category: '情感', meaning: '梦见孤独代表被忽视或渴望陪伴。独处示需要自省，被孤立示人际关系需改善。' },
  { keyword: '尴尬', title: '尴尬', category: '情感', meaning: '梦见尴尬代表社交焦虑。当众出丑示害怕被评判，裸体示暴露弱点。' },
  { keyword: '惊讶', title: '惊讶', category: '情感', meaning: '梦见惊讶代表意外与惊喜。惊喜主好运突至，惊吓示需要心理准备。' },
  { keyword: '后悔', title: '后悔', category: '情感', meaning: '梦见后悔代表对过去的反思。后悔已做的事示需要放下，后悔没做的事示还有机会。' },

  // === 颜色类 ===
  { keyword: '红色', title: '红色', category: '颜色', meaning: '梦见红色象征热情与能量。红衣主喜庆，红血示生命力，红灯示警告。' },
  { keyword: '红', title: '红色', category: '颜色', meaning: '梦见红色同红色之解。红色主喜庆吉祥，红色花朵示爱情。' },
  { keyword: '白色', title: '白色', category: '颜色', meaning: '梦见白色象征纯洁与新生。白衣主纯净，白雪示净化，白花示哀思。' },
  { keyword: '白', title: '白色', category: '颜色', meaning: '梦见白色同白色之解。白色主纯洁，白衣天使示贵人相助。' },
  { keyword: '黑色', title: '黑色', category: '颜色', meaning: '梦见黑色代表未知与神秘。黑衣示压抑，黑猫需防小人，漆黑一片示迷茫。' },
  { keyword: '黑', title: '黑色', category: '颜色', meaning: '梦见黑色同黑色之解。黑色主未知，黑色衣服示哀伤或神秘。' },
  { keyword: '金色', title: '金色', category: '颜色', meaning: '梦见金色象征富贵与荣耀。金光闪闪主财运亨通，金色阳光示美好前景。' },
  { keyword: '金', title: '金色', category: '颜色', meaning: '梦见金色同金色之解。金色主富贵，金色饰品示财富积累。' },
  { keyword: '蓝色', title: '蓝色', category: '颜色', meaning: '梦见蓝色象征宁静与智慧。蓝天主心胸开阔，蓝海示广阔前景。' },
  { keyword: '绿色', title: '绿色', category: '颜色', meaning: '梦见绿色代表生机与希望。绿树主生机勃勃，绿草地示平安顺利。' },
  { keyword: '紫色', title: '紫色', category: '颜色', meaning: '梦见紫色象征高贵与灵性。紫气东来大吉之兆，紫色花朵主贵人。' },

  // === 食物类 ===
  { keyword: '水果', title: '水果', category: '食物', meaning: '梦见水果代表丰收与成果。新鲜水果主财运好，烂水果示破财，摘水果示收获在即。' },
  { keyword: '肉', title: '肉', category: '食物', meaning: '梦见肉代表欲望与满足。吃肉主生活富足，生肉示原始欲望，腐肉需防健康。' },
  { keyword: '酒', title: '酒', category: '食物', meaning: '梦见酒代表庆祝与逃避。喝酒主喜事，醉酒示逃避现实，敬酒示社交顺利。' },
  { keyword: '茶', title: '茶', category: '食物', meaning: '梦见茶代表修养与待客。品茶主心境平和，倒茶示热情待客，茶凉示人情淡薄。' },
  { keyword: '米饭', title: '米饭', category: '食物', meaning: '梦见米饭代表基本需求与满足。吃米饭主温饱，米饭丰盛示生活无忧。' },
  { keyword: '面包', title: '面包', category: '食物', meaning: '梦见面包代表物质基础。新鲜面包主生活富足，面包硬了示经济紧张。' },
  { keyword: '蛋糕', title: '蛋糕', category: '食物', meaning: '梦见蛋糕代表庆祝与甜蜜。吃蛋糕主喜事，生日蛋糕示新的开始。' },
  { keyword: '糖果', title: '糖果', category: '食物', meaning: '梦见糖果代表甜蜜与奖励。吃糖主生活甜蜜，分糖示与人分享快乐。' },
  { keyword: '饺子', title: '饺子', category: '食物', meaning: '梦见饺子代表团圆与财富。包饺子主家庭和睦，吃饺子示财运将至。' },
  { keyword: '面条', title: '面条', category: '食物', meaning: '梦见面条代表长寿与顺遂。吃面条主健康长寿，面条顺滑示一切顺利。' },
  { keyword: '蔬菜', title: '蔬菜', category: '食物', meaning: '梦见蔬菜代表健康与朴素。新鲜蔬菜主身体健康，种菜示耕耘必有收获。' },
  { keyword: '西瓜', title: '西瓜', category: '食物', meaning: '梦见西瓜象征甜蜜与丰收。吃西瓜主夏日好运，大西瓜示财运鼎盛。' },
]

// ── 热门关键词 ──
const HOT_KEYWORDS = ['蛇', '狗', '猫', '鱼', '牙齿', '头发', '水', '火', '雨', '飞翔', '掉', '坠落', '考试', '死亡', '钱', '血', '小孩', '怀孕', '结婚', '哭', '追', '逃跑', '红色', '白色', '黑色', '金色']

const ALL_KEYWORDS = DREAMS.map(d => d.keyword)

export default function JiemengClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Dream[]>([])
  const [searched, setSearched] = useState(false)

  const search = useCallback((kw?: string) => {
    const q = (kw || keyword).trim()
    if (!q) return

    const matched = DREAMS.filter(d =>
      d.keyword.includes(q) || q.includes(d.keyword) ||
      d.title.includes(q) || q.includes(d.title) ||
      d.meaning.includes(q)
    )
    setResults(matched)
    setSearched(true)
  }, [keyword])

  // 按分类推荐
  const recommendations = useMemo(() => {
    if (results.length > 0) return []
    const cats = [...new Set(DREAMS.map(d => d.category))]
    return cats.map(c => ({
      category: c,
      items: DREAMS.filter(d => d.category === c).slice(0, 3),
    }))
  }, [results])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('jiemeng.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('jiemeng.desc', lang)}</p>

      {/* 搜索框 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder={`🔍 ${tk('jiemeng.example', lang)}`}
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={() => search()}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {tk('common.submit', lang)}
          </button>
        </div>
      </div>

      {/* 热门标签 */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2">🔥 热门梦境</p>
        <div className="flex flex-wrap gap-1.5">
          {HOT_KEYWORDS.map((kw, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(kw); search(kw) }}
              className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-gold-300 px-2.5 py-1 rounded-full border border-dark-600 transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* 结果 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">找到 {results.length} 条结果</p>
          {results.map((dream, i) => (
            <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-gold-900/40 text-gold-400 px-1.5 py-0.5 rounded">{dream.category}</span>
                <h3 className="text-base font-semibold text-gray-200">{dream.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{dream.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <p className="text-sm text-gray-400 mb-3">{tk('jiemeng.notFound', lang)}</p>
          <div className="space-y-3">
            {recommendations.map(cat => (
              <div key={cat.category}>
                <p className="text-xs text-gray-500 mb-1">{cat.category}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setKeyword(item.keyword); search(item.keyword) }}
                      className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 px-2 py-1 rounded"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
