'use client'

import { useState, useCallback } from 'react'


// ── 八星磁场数据（含详解、七星对应、号主分析） ──
interface FieldFull {
  name: string; type: string; numbers: number[]; keywords: string[]
  description: string; detail: string; color: string; star7: string; star7Wx: string; star7Level: string
  // 号主分析
  strengths: string; weaknesses: string; personality: string; wealth: string; feelings: string; marriage: string; health: string; career: string
  // 组合解析模板
  pairMeanings: Record<string, string>
}

const FIELDS: Record<string, FieldFull> = {
  tianyi: {
    name:'天医', type:'吉', numbers:[13,31,68,86,94,49,72,27],
    keywords:['财运','财富','婚姻','桃花','聪明'], color:'#2ecc71',
    description:'天医星·主财运、婚姻、健康，是最吉祥的数字组合。',
    detail:'天医磁场是八大磁场中最吉祥的磁场，代表财富、婚姻和智慧。天医能量强的人思维敏捷，心地善良，容易获得正财运和美满姻缘。',
    star7:'天医巨门星', star7Wx:'土', star7Level:'次吉',
    strengths:'心地善良、聪明智慧、财运亨通、婚姻美满',
    weaknesses:'容易轻信他人、过于善良易被骗、缺乏防备心',
    personality:'天医磁场强的人，心地善良、为人真诚、聪明智慧。性格温和，善于交际，有同情心和包容力。做事有原则，讲信用，容易获得他人信任和帮助。',
    wealth:'天医为正财星，主财运亨通。赚钱能力较强，容易获得稳定的财富收入。善于理财，有投资眼光。但不适合投机取巧，应以正道求财。',
    feelings:'天医磁场代表正桃花和美满感情。对感情专一真诚，重视家庭。容易遇到合适的对象，婚姻较为美满。但要注意不要过于理想化。',
    marriage:'婚姻较为幸福美满，配偶多为善良正派之人。婚后家庭和睦，能够相互扶持。天医磁场强的女性多为旺夫之命。',
    health:'天医主健康，身体状况较好。需要注意脾胃消化系统的问题。天医磁场过强时也需要注意饮食规律。',
    career:'适合从事医疗、教育、金融、财务等正行职业。工作认真负责，容易获得上司赏识。创业也较易成功，适合稳中求进。',
    pairMeanings: {
      '13':'天医最强组合，主大财运、正桃花。13/31组合的人财运旺盛，赚钱能力强，婚姻美满，是一等一的好组合。',
      '31':'天医次强组合，31与13同源，主财运好、心地善良。异性缘佳，婚姻幸福，头脑聪明。',
      '68':'天医组合，主财运逐渐上升。68寓意顺发，财运一路顺畅。适合做生意的人使用。',
      '86':'天医组合，86与68同为财运数字。发财后能够守财，财富积累能力较强。',
      '94':'天医组合，94寓意久发，财运长久。适合求稳定财运的人。',
      '49':'天医组合，49与94同源。财运持续稳定，适合有固定收入的人。',
      '72':'天医组合，72寓意妻儿，主家庭美满。财运中等但家庭幸福。',
      '27':'天医组合，27与72同源。财运平和，家庭和睦，身体健康。',
    }
  },
  shengqi: {
    name:'生气', type:'吉', numbers:[14,41,67,76,93,39,82,28],
    keywords:['贵人','人脉','开朗','随缘'], color:'#3498db',
    description:'生气星·主贵人运、人脉广、性格开朗乐观。',
    detail:'生气磁场代表贵人运和人际关系。拥有生气磁场的号码使用者，往往性格开朗、人缘好，容易得到他人帮助。生气磁场也被称为贵人星。',
    star7:'生气贪狼星', star7Wx:'木', star7Level:'次吉',
    strengths:'人缘好、朋友多、乐观开朗、贵人相助',
    weaknesses:'容易依赖他人、缺乏主见、不善拒绝',
    personality:'生气磁场强的人性格开朗、积极乐观。善于社交，朋友众多，在人际交往中如鱼得水。有包容心，不计较小事，容易获得他人好感和帮助。',
    wealth:'生气主贵人财，赚钱多靠人际关系和他人帮助。适合与人合作、中介、公关等职业。财运起伏较大，但总体向好。',
    feelings:'生气磁场代表随缘的感情观。对待感情比较豁达，不执着不强求。异性缘不错，但容易显得不够专一。',
    marriage:'婚姻较为和谐，但需要稳定的感情基础。容易因为社交圈广而影响家庭。需要平衡好家庭和社交的关系。',
    health:'生气主肝气，要注意肝胆方面的问题。保持心态平和，避免过度社交消耗精力。',
    career:'适合公关、销售、中介、外交等需要人际交往的工作。贵人运好，容易获得提拔和帮助。不适合独立闭门造车的工作。',
    pairMeanings: {
      '14':'生气最强组合，主大贵人运。14/41的人贵人运极佳，总能在关键时刻得到帮助。',
      '41':'生气次强组合，41与14同源。人缘好，社交能力强，容易结识有地位的人。',
      '67':'生气组合，67寓意禄马，主财运和贵人。适合出差、外务工作。',
      '76':'生气组合，76与67同源。人际运势良好，能够通过朋友获得机会。',
      '93':'生气组合，93寓意久生，长久的好人缘。适合需要长期维护客户关系的工作。',
      '39':'生气组合，39与93同源。贵人运势持续，人脉积累能力强。',
      '82':'生气组合，82寓意发尔，财运通过人脉而来。适合做销售、中介。',
      '28':'生气组合，28与82同源。人际关系和谐，容易得到长辈提携。',
    }
  },
  yannian: {
    name:'延年', type:'吉', numbers:[19,91,78,87,34,43,26,62],
    keywords:['事业','领导力','才干','专业'], color:'#9b59b6',
    description:'延年星·主事业运、领导能力、专业才干。',
    detail:'延年磁场代表事业和领导能力。延年磁场强的人事业心强，有领导才能，专业领域表现出色。延年是事业星，代表能力和担当。',
    star7:'延年武曲星', star7Wx:'金', star7Level:'大吉',
    strengths:'事业心强、有领导力、专业能力突出、执行力强',
    weaknesses:'工作狂倾向、容易操劳、固执己见',
    personality:'延年磁场强的人事业心很强，有领导才能和决策力。做事有主见，不轻易改变决定。有责任心，敢于担当，适合做管理者。但有时过于固执。',
    wealth:'延年主事业财，财富来自个人能力和专业成就。以自己的才干赚钱，收入与能力成正比。适合靠技术和专业发展。',
    feelings:'延年磁场对感情较为理性。不善于表达感情，但一旦认定就会很专一。事业优先，容易忽略伴侣感受。',
    marriage:'婚姻中容易以自我为中心，需要学会平衡事业和家庭。配偶需要理解和支持其事业发展。',
    health:'延年主心脑，容易有心脑血管方面的压力。长期高强度工作需要注意劳逸结合，预防过劳。',
    career:'延年是最强的事业磁场。适合做管理者、创业者、专业技术人才。领导能力强，能独当一面。但在团队合作中需要适当放权。',
    pairMeanings: {
      '19':'延年最强组合，主大事业、大领导力。19/91的人有卓越的领导才能，适合做一把手。',
      '91':'延年次强组合，91与19同源。事业心极强，专业能力突出，但要注意不要独断专行。',
      '78':'延年组合，78寓意启发。做事情有始有终，执行力强。适合独立负责项目。',
      '87':'延年组合，87与78同源。管理和领导能力强，做事果断有魄力。',
      '34':'延年组合，34寓意生财，事业财运双旺。靠专业技能赚钱。',
      '43':'延年组合，43与34同源。工作能力强，但需要注意人际关系的处理。',
      '26':'延年组合，26寓意易禄，事业发展顺利。适合作技术性、管理性工作。',
      '62':'延年组合，62与26同源。执行力强，做事有计划有条理。',
    }
  },
  fuwei: {
    name:'伏位', type:'平', numbers:[11,22,88,99,77,66,44,33],
    keywords:['稳定','保守','耐心','积蓄'], color:'#1abc9c',
    description:'伏位星·主稳定、保守、积蓄。吉凶取决于前后搭配。',
    detail:'伏位磁场代表稳定和积蓄。伏位磁场的人性格稳重，做事有耐心，适合长期坚持的工作。伏位是中性磁场，吉凶取决于前后搭配。',
    star7:'伏位左辅星', star7Wx:'土', star7Level:'小吉',
    strengths:'有耐心毅力、等待机会、一鸣惊人',
    weaknesses:'不易变动、被动保守、不敢冒险、易有外债、内心矛盾',
    personality:'处事沉着冷静，脚踏实地，一步一个脚印。意志力超强，有耐心有耐力，善于等待时机，能完成较难的任务。有时过分谨慎，被动保守，不敢行动，怕冒险，导致错失良机。',
    wealth:'财富需要时间积累，辛苦赚钱，保守求财，喜欢稳定的获利或持续的收入来源。经济不好时忍耐力强，等待赚钱或者投资的机会。保守、犹豫、迟迟不做决定，也容易导致等待时间太久，加上惰性及恐惧而错失绝佳的财运。',
    feelings:'思想保守、心神不宁，胡思乱想，没有安全感。内心矛盾，情感不容易动情，对于能依靠终身的伴侣则犹豫不决，不会主动表达。决定长久相处，感情很专一。',
    marriage:'很多人都是非自愿性结婚，婚后很容易平淡无奇，婚姻生活没激情。女性不会穿性感的衣服来吸引起老公的兴致，也不希望生活产生太大的变化。稳定才是婚姻最大的特征。',
    health:'容易引发心脏或脑部方面的疾病，并且属于潜藏性的，隐藏着慢性疾病，并且一直持续，不容易好转，成为老毛病。',
    career:'喜欢等待时机，拖延，卧虎藏龙，想前进且无奈，想创业总在思考，想很多问题，没有安全感。在安全感充足的条件下才敢前进。',
    pairMeanings: {
      '11':'伏位最强组合，主坚持和等待。11的人有超强的耐心和毅力，适合长期积累。',
      '22':'伏位组合，22寓意易易。做事有耐心，但容易犹豫不决，需要果断。',
      '88':'伏位组合，88寓意发发。看似大吉但实为伏位，表面风光但实际进展缓慢。',
      '99':'伏位组合，99寓意久久。长久坚持，适合做需要长期投入的事情。',
      '77':'伏位组合，77寓意妻妻。家庭稳定，但事业进展较慢。',
      '66':'伏位组合，66寓意顺顺。表面顺利但实际需耐心等待。',
      '44':'伏位组合，44寓意事事。做事有条理，但进展较慢。',
      '33':'伏位组合，33寓意生生。有生命力但需要时间成长。',
    }
  },
  huohai: {
    name:'祸害', type:'凶', numbers:[17,71,89,98,64,46,32,23],
    keywords:['口舌','是非','小人','病痛'], color:'#e74c3c',
    description:'祸害星·主口舌是非、小人、身体病痛。',
    detail:'祸害磁场代表口舌是非和身体问题。祸害磁场容易引发争吵、官非和小人困扰。身体方面容易出现咽喉、肺部等问题。',
    star7:'祸害破军星', star7Wx:'金', star7Level:'次凶',
    strengths:'能言善辩、口才好、反应快',
    weaknesses:'口舌是非多、易得罪人、小人多、身体欠佳',
    personality:'祸害磁场强的人能言善辩，口才出众。反应快，思维敏捷。但说话直接，容易得罪人而不自知。经常陷入口舌是非中。',
    wealth:'祸害主是非财，赚钱容易与人发生争执。适合靠口才赚钱的职业，如销售、律师、讲师等。但需要注意合作关系。',
    feelings:'祸害磁场的人感情中容易争吵，说话不饶人。需要学会控制情绪和言语，避免因口舌之争伤害感情。',
    marriage:'婚姻中需要多沟通，避免因小事争吵。祸害磁场的人要学会柔和表达，减少言语伤害。',
    health:'祸害主呼吸系统，容易出现咽喉炎、气管炎等问题。也容易有意外小伤。需要注意身体健康。',
    career:'适合销售、律师、主持、讲师等靠口才吃饭的职业。但要注意谨言慎行，避免是非。',
    pairMeanings: {
      '17':'祸害最强组合，主大是非。17/71的人口舌之争较多，容易招惹小人。',
      '71':'祸害组合，71与17同源。说话直接易得罪人，需注意言行。',
      '89':'祸害组合，89寓意发久。靠口才赚钱但易惹是非。',
      '98':'祸害组合，98与89同源。事业发展中容易有口舌之争。',
      '64':'祸害组合，64寓意流逝。财运容易因口舌而流失。',
      '46':'祸害组合，46与64同源。容易因说话不当影响人际关系。',
      '32':'祸害组合，32寓意生尔。口才不错但要注意说话方式。',
      '23':'祸害组合，23与32同源。容易有小人作祟，需谨慎处事。',
    }
  },
  jueming: {
    name:'绝命', type:'凶', numbers:[12,21,69,96,84,48,37,73],
    keywords:['破财','冲动','投资','大起大落'], color:'#c0392b',
    description:'绝命星·主破财、冲动、投资失利。敢拼敢闯但也容易大起大落。',
    detail:'绝命磁场代表破财和大起大落。绝命磁场的人有冲劲、敢冒险，但也容易因冲动而导致财务损失。绝命磁场需要搭配吉星才能化解。',
    star7:'绝命廉贞星', star7Wx:'火', star7Level:'大凶',
    strengths:'有冲劲、敢冒险、行动力强、能抓住机会',
    weaknesses:'冲动易怒、破财风险高、投资失利、大起大落',
    personality:'绝命磁场强的人敢拼敢闯，行动力强，有冒险精神。但容易冲动，做事不考虑后果。性格刚烈，容易与人发生冲突。适合创业，但风险较高。',
    wealth:'绝命主偏财，容易有大起大落的财运。投资方面有机会但也有很大风险。赚钱快花钱也快，不容易存住钱。',
    feelings:'绝命磁场的人感情强烈，爱憎分明。对感情投入很深，但也容易因冲动而分手。需要在感情中学会控制情绪。',
    marriage:'婚姻中容易有波折，需要学会包容和冷静。绝命磁场的人往往晚婚或者婚姻不顺。',
    health:'绝命主心脑血管，容易出现高血压、心脏病等问题。也需要注意意外伤害。',
    career:'适合创业、投资、冒险性行业。不适合安稳的固定工作。绝命运势的人需要搭配吉星才能化解凶性。',
    pairMeanings: {
      '12':'绝命最强组合，主大起大落。12/21的人敢拼敢闯但风险很大。',
      '21':'绝命组合，21与12同源。投资运强但风险也大，需谨慎。',
      '69':'绝命组合，69寓意顺久。看似顺利但暗藏危机。',
      '96':'绝命组合，96与69同源。容易有意外破财。',
      '84':'绝命组合，84寓意发誓。投资容易失利，需防合作陷阱。',
      '48':'绝命组合，48与84同源。财运起伏大，不适合保守投资。',
      '37':'绝命组合，37寓意生妻。感情方面容易有波折。',
      '73':'绝命组合，73与37同源。事业冲劲足但风险也大。',
    }
  },
  liusha: {
    name:'六煞', type:'凶', numbers:[16,61,74,47,38,83,92,29],
    keywords:['烂桃花','情绪','忧郁','服务'], color:'#e67e22',
    description:'六煞星·主烂桃花、情绪不稳定、忧郁。',
    detail:'六煞磁场代表烂桃花和情绪问题。六煞磁场的人情感丰富，但也容易陷入感情纠纷和情绪波动。六煞适合服务业。',
    star7:'六煞文曲星', star7Wx:'水', star7Level:'次凶',
    strengths:'情感丰富、艺术天赋、服务意识强',
    weaknesses:'烂桃花多、情绪不稳、忧郁焦虑、缺乏安全感',
    personality:'六煞磁场强的人情感丰富，心思细腻，有艺术天赋。但情绪不稳定，容易忧郁焦虑，缺乏安全感。比较敏感，容易受外界影响。',
    wealth:'六煞主服务业财，适合通过服务他人赚钱。美容、餐饮、咨询等行业。财运中等，但需要防范因感情问题破财。',
    feelings:'六煞是烂桃花星，感情比较复杂。容易有多段感情经历，或者卷入三角关系。需要理性对待感情。',
    marriage:'婚姻中容易因为情绪化和烂桃花而产生问题。需要学会管理情绪，对婚姻忠诚。',
    health:'六煞主神经系统，容易出现失眠、焦虑、抑郁等精神问题。需要注意心理健康。',
    career:'适合美容、餐饮、咨询、设计等服务业。也适合艺术类、创意类工作。不适合压力过大的工作环境。',
    pairMeanings: {
      '16':'六煞最强组合，主烂桃花。16/61的人感情复杂，容易有感情纠葛。',
      '61':'六煞组合，61与16同源。情绪容易波动，需要注意心理健康。',
      '74':'六煞组合，74寓意妻死。感情不顺，容易因情破财。',
      '47':'六煞组合，47与74同源。情绪化严重，需要学会调节心态。',
      '38':'六煞组合，38寓意散发。情感丰富但不稳定。',
      '83':'六煞组合，83与38同源。适合服务业，但要注意情绪管理。',
      '92':'六煞组合，92寓意久尔。长期的感情困扰需要正视。',
      '29':'六煞组合，29与92同源。容易陷入感情纠葛。',
    }
  },
  wugui: {
    name:'五鬼', type:'凶', numbers:[18,81,79,97,36,63,42,24],
    keywords:['变动','才华','熬夜','血光'], color:'#8e44ad',
    description:'五鬼星·主变动、才华横溢但易招血光。聪明有创意但人生多波折。',
    detail:'五鬼磁场代表变动和才华。五鬼磁场的人聪明过人、有创造力，但也容易经历人生变故和波折。五鬼是变动星，代表不稳定的能量。',
    star7:'五鬼廉贞星', star7Wx:'火', star7Level:'大凶',
    strengths:'聪明有才华、创意无限、思维活跃',
    weaknesses:'变动频繁、血光之灾、熬夜伤身、人生波折',
    personality:'五鬼磁场强的人非常聪明，思维活跃，创意无限。有很强的学习能力和适应能力。但人生变动较大，容易有意外波折。需要稳定的环境来发挥才华。',
    wealth:'五鬼主偏财，赚钱靠创意和点子。适合策划、设计、研发等创意行业。但财运不稳定，大起大落。',
    feelings:'五鬼磁场的人感情多变，容易喜新厌旧。需要学会稳定感情，对伴侣保持忠诚。',
    marriage:'婚姻中变动较大，容易因性格不合或外界因素导致婚姻问题。需要双方共同努力经营。',
    health:'五鬼主血光，需要注意意外伤害、车祸等。也容易有心血管方面的隐患。经常熬夜会加重健康问题。',
    career:'适合策划、设计、IT、研发、创意等需要灵感的行业。不适合过于循规蹈矩的工作。',
    pairMeanings: {
      '18':'五鬼最强组合，主大变动。18/81的人人生变化大，才华横溢但波折多。',
      '81':'五鬼组合，81与18同源。创意能力强，但需要注意安全和健康。',
      '79':'五鬼组合，79寓意妻久。感情方面容易有变动。',
      '97':'五鬼组合，97与79同源。人生变动较多，需要学会适应。',
      '36':'五鬼组合，36寓意生禄。靠创意和才华赚钱。',
      '63':'五鬼组合，63与36同源。事业变动大，适合灵活的工作。',
      '42':'五鬼组合，42寓意事尔。容易想太多，行动力不足。',
      '24':'五鬼组合，24与42同源。思维活跃但有想法难落地。',
    }
  },
}

const FIELD_ORDER = ['fuwei','tianyi','shengqi','yannian','liusha','jueming','huohai','wugui']
const FIELD_LIST = FIELD_ORDER.map(k => ({ key: k, ...FIELDS[k] }))

const numToField: Record<number, string> = {}
for (const [k, f] of Object.entries(FIELDS)) for (const n of f.numbers) numToField[n] = k

const TYPE_STYLE: Record<string, string> = { '吉':'bg-green-900/50 text-green-300 border-green-700', '凶':'bg-red-900/50 text-red-300 border-red-700', '平':'bg-cyan-900/50 text-cyan-300 border-cyan-700', '次吉':'bg-green-900/30 text-green-400 border-green-700', '大吉':'bg-yellow-900/40 text-yellow-300 border-yellow-700', '次凶':'bg-orange-900/40 text-orange-300 border-orange-700', '大凶':'bg-red-900/60 text-red-300 border-red-700', '小吉':'bg-teal-900/40 text-teal-300 border-teal-700' }

// 七星对应
const STAR7 = [
  { name:'天枢·贪狼', field:'生气', star:'贪狼星', wx:'木', level:'次吉' },
  { name:'天璇·巨门', field:'天医', star:'巨门星', wx:'土', level:'次吉' },
  { name:'天玑·禄存', field:'祸害', star:'禄存星', wx:'土', level:'凶' },
  { name:'天权·文曲', field:'六煞', star:'文曲星', wx:'水', level:'次凶' },
  { name:'玉衡·廉贞', field:'五鬼', star:'廉贞星', wx:'火', level:'大凶' },
  { name:'开阳·武曲', field:'延年', star:'武曲星', wx:'金', level:'大吉' },
  { name:'摇光·破军', field:'绝命', star:'破军星', wx:'金', level:'凶' },
]

export default function ShumaClient() {

  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<{
    digits: string; segments: { pair: number; position: number; fieldKey: string; fieldName: string; fieldType: string }[]
    fieldCounts: Record<string, number>; aus: number; inaus: number; neut: number; score: number; overall: string
    tail4: string; tailFields: string[]; dominantField: string; dominantData: FieldFull | null
    pairAnalyses: { pair: number; text: string }[]; star7Results: (typeof STAR7[number] & { count: number })[]
  } | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  const doAnalyze = useCallback(() => {
    // 字母转数字：A=1, B=2, ... Z=26
    const normalized = phone.toUpperCase().replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 64))
    const digits = normalized.replace(/[^0-9]/g, '')
    if (digits.length < 3) return
    const segments: { pair: number; position: number; fieldKey: string; fieldName: string; fieldType: string }[] = []
    const fieldCounts: Record<string, number> = {}
    for (const k of Object.keys(FIELDS)) fieldCounts[k] = 0
    for (let i = 0; i < digits.length - 1; i++) {
      const pair = parseInt(digits.substring(i, i + 2))
      const fk = numToField[pair]
      const f = fk ? FIELDS[fk] : null
      segments.push({ pair, position: i + 1, fieldKey: fk || '', fieldName: f?.name || '', fieldType: f?.type || '' })
      if (fk) fieldCounts[fk]++
    }
    let aus = 0, inaus = 0, neut = 0
    for (const [k, c] of Object.entries(fieldCounts)) {
      if (k === 'fuwei') neut += c
      else if (['tianyi','shengqi','yannian'].includes(k)) aus += c
      else inaus += c
    }
    const total = aus + inaus + neut
    let score = 50
    if (total > 0) score = Math.round(Math.max(0, Math.min(100, 50 + (aus/total)*50 - (inaus/total)*40)))
    const overall = score >= 75 ? '上等号码' : score >= 60 ? '中上号码' : score >= 40 ? '中等号码' : score >= 25 ? '中下号码' : '需要注意'

    // 号主分析：取出现次数最多的磁场
    let dominantField = ''
    let maxCount = 0
    for (const [k, c] of Object.entries(fieldCounts)) {
      if (c > maxCount) { maxCount = c; dominantField = k }
    }
    const dominantData = dominantField ? FIELDS[dominantField] : null

    // 组合解析：每对数字的详细含义
    const pairAnalyses: { pair: number; text: string }[] = []
    for (let i = 0; i < digits.length - 1; i++) {
      const pair = parseInt(digits.substring(i, i + 2))
      const fk = numToField[pair]
      if (fk && FIELDS[fk].pairMeanings?.[String(pair)]) {
        pairAnalyses.push({ pair, text: FIELDS[fk].pairMeanings[String(pair)] })
      }
    }

    const tail4 = digits.slice(-4)
    const tailPairs = [parseInt(tail4.slice(0,2)), parseInt(tail4.slice(1,3)), parseInt(tail4.slice(2,4))]
    const tailFields = tailPairs.map(p => numToField[p]).filter(Boolean)
    const tailNames = tailFields.map(k => FIELDS[k]?.name).filter(Boolean)

    // 七星星座
    const star7Results = STAR7.map(s => {
      const fk = Object.entries(FIELDS).find(([,v]) => v.name === s.field)?.[0]
      return { ...s, count: fk ? fieldCounts[fk] : 0 }
    })

    setResult({
      digits, segments, fieldCounts, aus, inaus, neut, score, overall,
      tail4, tailFields: tailNames,
      dominantField, dominantData,
      pairAnalyses,
      star7Results,
    })
  }, [phone])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">号码测吉凶</h1>
      <p className="text-gray-400 mb-6">基于八星磁场理论，输入手机号快速分析数字能量组合与命主磁场特征。</p>

      {/* 输入 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
        <div className="flex gap-2">
          <input type="text" value={phone} onChange={e => setPhone(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,18))}
            placeholder="输入号码（手机/车牌/QQ/身份证等，字母自动转数字）"
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 font-mono text-lg tracking-widest" maxLength={18} />
          <button onClick={doAnalyze}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95 whitespace-nowrap">开始分析</button>
        </div>
      </div>

      {/* 八星对照表 + 七星排列 */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 text-center">八星磁场号码对照表</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {FIELD_LIST.map(f => (
              <div key={f.key} className="text-center">
                <p className="text-[11px] font-semibold mb-1" style={{color: f.color}}>{f.name}</p>
                <div className="flex flex-wrap justify-center gap-[1px]">
                  {f.numbers.map(n => (
                    <button key={n} onClick={() => setSelectedField(selectedField === f.key ? null : f.key)}
                      className="text-[11px] w-[28px] h-6 flex items-center justify-center rounded-sm bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors">{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 七星排列 */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 text-center">北斗七星 · 对应天上七星排列</h3>
          <div className="grid grid-cols-7 gap-1">
            {STAR7.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-[11px] font-serif mb-1 ${i===4||i===6?'text-red-400':i===5?'text-yellow-300':'text-blue-300'}`}>{s.name.split('·')[0]}</div>
                <div className={`text-[10px] px-1 py-0.5 rounded ${TYPE_STYLE[s.level] || 'bg-dark-700'}`}>{s.field}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">{s.wx}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中磁场详解 */}
      {selectedField && FIELDS[selectedField] && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border p-5 mb-6" style={{borderColor: FIELDS[selectedField].color + '40'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold font-serif" style={{color: FIELDS[selectedField].color}}>{FIELDS[selectedField].name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_STYLE[FIELDS[selectedField].type] || ''}`}>{FIELDS[selectedField].type}</span>
            <span className="text-[11px] text-gray-500">七星：{FIELDS[selectedField].star7}</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">号码：{FIELDS[selectedField].numbers.join('、')}</p>
          <p className="text-xs text-gray-400 mb-1">关键词：{FIELDS[selectedField].keywords.join(' · ')}</p>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{FIELDS[selectedField].detail}</p>
          <button onClick={() => setSelectedField(null)} className="text-[10px] text-gray-500 mt-2 hover:text-gray-300">关闭</button>
        </div>
      )}

      {/* 分析结果 */}
      {result && result.segments && (
        <div className="space-y-4">
          {/* 综合评分 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">综合评分</p>
            <p className={`text-4xl font-bold ${result.score >= 60 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}</p>
            <p className={`text-sm mt-1 font-semibold ${result.score >= 60 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.overall}</p>
          </div>

          {/* 号码分段 & 组合解析 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">组合解析</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-dark-600">
                  <th className="py-1 pr-2 text-left">位置</th><th className="py-1 px-2 text-left">数字</th><th className="py-1 px-2 text-left">磁场</th><th className="py-1 pl-2 text-left">吉凶</th>
                </tr></thead>
                <tbody>
                  {result.segments.map((s, i: number) => (
                    <tr key={i} className="border-b border-dark-700/50">
                      <td className="py-1 pr-2 text-gray-500">{s.position}-{s.position+1}位</td>
                      <td className="py-1 px-2 font-mono text-gray-200">{String(s.pair).padStart(2,'0')}</td>
                      <td className="py-1 px-2" style={s.fieldType ? {color: FIELDS[s.fieldKey]?.color} : {}}>{s.fieldName}</td>
                      <td className="py-1 pl-2">{s.fieldType && <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_STYLE[s.fieldType] || 'bg-dark-700 text-gray-400'}`}>{s.fieldType}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 详细组合解析 */}
            <div className="space-y-1.5">
              {result.pairAnalyses.map((pa, i: number) => (
                <p key={i} className="text-[11px] text-gray-300 leading-relaxed"><span className="text-gold-400 font-mono">【{pa.pair}】</span>{pa.text}</p>
              ))}
            </div>
          </div>

          {/* 号主磁场分析 */}
          {result.dominantData && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-5">
              <h3 className="text-sm font-semibold text-gold-300 mb-2">号主 · 磁场最强的星（主要性格特征）</h3>
              <p className="text-xs text-gray-400 mb-2">主{result.dominantData.name} · {result.dominantData.star7}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-[10px] text-green-400 mb-1">✔ 优点</p>
                  <p className="text-[11px] text-gray-300">{result.dominantData.strengths}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-[10px] text-red-400 mb-1">✘ 缺点</p>
                  <p className="text-[11px] text-gray-300">{result.dominantData.weaknesses}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                <p className="text-[10px] text-gray-400">性格：<span className="text-gray-300">{result.dominantData.personality}</span></p>
                <p className="text-[10px] text-gray-400">财运：<span className="text-gray-300">{result.dominantData.wealth}</span></p>
                <p className="text-[10px] text-gray-400">感情：<span className="text-gray-300">{result.dominantData.feelings}</span></p>
                <p className="text-[10px] text-gray-400">婚姻：<span className="text-gray-300">{result.dominantData.marriage}</span></p>
                <p className="text-[10px] text-gray-400">健康：<span className="text-gray-300">{result.dominantData.health}</span></p>
                <p className="text-[10px] text-gray-400">事业：<span className="text-gray-300">{result.dominantData.career}</span></p>
              </div>
            </div>
          )}

          {/* 对应七星排列 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">对应天上七星排列（北斗七星）</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {result.star7Results.map((s, i: number) => (
                <div key={i} className={`text-center p-1.5 rounded-lg border ${s.count > 0 ? 'border-gold-500/50 bg-gold-900/10' : 'border-dark-600 bg-dark-700'}`}>
                  <div className="text-[10px] text-gray-500">{s.name.split('·')[0]}</div>
                  <div className={`text-[11px] font-semibold ${s.count > 0 ? 'text-gold-300' : 'text-gray-600'} font-serif`}>{s.field}</div>
                  <div className={`text-[10px] mt-0.5 px-1 rounded ${TYPE_STYLE[s.level] || 'bg-dark-600'}`}>{s.level}</div>
                  <div className="text-[10px] text-gray-500">{s.wx}</div>
                  {s.count > 0 && <div className="text-[9px] text-gold-400 font-bold mt-0.5">{s.count}次</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 号码八星统计 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FIELD_LIST.map(f => {
              const cnt = result.fieldCounts[f.key] || 0
              return (
                <button key={f.key} onClick={() => setSelectedField(selectedField === f.key ? null : f.key)}
                  className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center hover:border-gold-500/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold" style={{color: f.color}}>{f.name}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded ${TYPE_STYLE[f.type] || ''}`}>{f.type}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{cnt}<span className="text-xs text-gray-500">次</span></p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
