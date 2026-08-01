'use client'

import { useState, useCallback, useMemo } from 'react'
import { useLocale, useT } from '@/lib/i18n'

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
    keywords:['财运','财富','婚姻','桃花','聪明'], color:'#a88820',
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
    keywords:['贵人','人脉','开朗','随缘'], color:'#a88820',
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
    keywords:['事业','领导力','才干','专业'], color:'#a88820',
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
    keywords:['稳定','保守','耐心','积蓄'], color:'#a88820',
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
    keywords:['口舌','是非','小人','病痛'], color:'#a88820',
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
    keywords:['破财','冲动','投资','大起大落'], color:'#a88820',
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
    keywords:['烂桃花','情绪','忧郁','服务'], color:'#a88820',
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
    keywords:['变动','才华','熬夜','血光'], color:'#a88820',
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

// ── Locale-specific star name / type / level translations ──
const STAR_NAMES_EN: Record<string, string> = {
  tianyi: 'Heavenly Doctor', shengqi: 'Life Force', yannian: 'Extended Years',
  fuwei: 'Hidden Position', huohai: 'Calamity', jueming: 'Fatal', liusha: 'Six Killings', wugui: 'Five Ghosts',
}
const STAR_NAMES_JA: Record<string, string> = {
  tianyi: '天医', shengqi: '生氣', yannian: '延年',
  fuwei: '伏位', huohai: '禍害', jueming: '絶命', liusha: '六殺', wugui: '五鬼',
}
const STAR_NAMES_KO: Record<string, string> = {
  tianyi: '천의', shengqi: '생기', yannian: '연년',
  fuwei: '복위', huohai: '화해', jueming: '절명', liusha: '육살', wugui: '오귀',
}

const TYPE_NAMES_EN: Record<string, string> = { '吉':'Auspicious', '凶':'Inauspicious', '平':'Neutral', '次吉':'Sec.Auspicious', '大吉':'Great Auspicious', '次凶':'Sec.Inauspicious', '大凶':'Great Inauspicious', '小吉':'Minor Auspicious' }
const TYPE_NAMES_JA: Record<string, string> = { '吉':'吉', '凶':'凶', '平':'平', '次吉':'次吉', '大吉':'大吉', '次凶':'次凶', '大凶':'大凶', '小吉':'小吉' }
const TYPE_NAMES_KO: Record<string, string> = { '吉':'길', '凶':'흉', '平':'평', '次吉':'차길', '大吉':'대길', '次凶':'차흉', '大凶':'대흉', '小吉':'소길' }

// ── Star data translations for EN/JA/KO (text fields only) ──
interface StarLocaleText {
  description: string; detail: string
  strengths: string; weaknesses: string
  personality: string; wealth: string; feelings: string; marriage: string; health: string; career: string
  pairMeanings: Record<string, string>
}

const STAR_EN: Record<string, StarLocaleText> = {
  tianyi: {
    description:'Heavenly Doctor · Wealth, Marriage, Health — the most auspicious number combination.',
    detail:'The Heavenly Doctor field is the most auspicious among the eight magnetic fields, representing wealth, marriage, and wisdom. People with strong Heavenly Doctor energy are quick-witted, kind-hearted, and tend to enjoy stable finances and a happy marriage.',
    strengths:'Kind-hearted, intelligent, prosperous finances, happy marriage',
    weaknesses:'Easily trusts others, overly kind and easily deceived, lacks caution',
    personality:'People with strong Heavenly Doctor magnetism are kind-hearted, sincere, and intelligent. They have a gentle personality, are sociable, compassionate, and tolerant. They act on principle, keep their word, and easily gain trust and help.',
    wealth:'Heavenly Doctor represents positive wealth, indicating prosperous finances. Strong earning ability and stable income. Good at managing money with investment insight. Not suited for投机 (speculation) — should seek wealth through proper means.',
    feelings:'Heavenly Doctor represents genuine romance and fulfilling relationships. Devoted and sincere in love, values family. Likely to meet a suitable partner with a happy marriage, but should avoid being overly idealistic.',
    marriage:'Marriage tends to be happy and fulfilling, with a kind and upright spouse. Harmonious family life with mutual support. Women with strong Heavenly Doctor energy often have a husband-boosting destiny.',
    health:'Heavenly Doctor governs health — generally good physical condition. Should watch digestive system issues. When the field is too strong, pay attention to diet regularity.',
    career:'Suitable for medical, education, finance, accounting, and other legitimate professions. Responsible and diligent at work, easily appreciated by superiors. Entrepreneurship also tends to succeed — steady progress is best.',
    pairMeanings: {
      '13':'Strongest Heavenly Doctor pair — great wealth and genuine romance. Those with 13/31 enjoy abundant finances, strong earning ability, and a happy marriage — a top-tier combination.',
      '31':'Second-strongest Heavenly Doctor pair. 31 shares the same source as 13 — good fortune, kind-heartedness. Great异性缘 (opposite-sex appeal), happy marriage, sharp mind.',
      '68':'Heavenly Doctor pair — gradually rising wealth. 68 symbolizes smooth fortune. Ideal for business people.',
      '86':'Heavenly Doctor pair — 86 and 68 are both wealth numbers. Able to retain wealth after obtaining it — strong wealth accumulation.',
      '94':'Heavenly Doctor pair — 94 symbolizes lasting fortune. Suitable for those seeking stable wealth.',
      '49':'Heavenly Doctor pair — 49 shares the same source as 94. Steady and lasting wealth, suitable for those with fixed income.',
      '72':'Heavenly Doctor pair — 72 symbolizes wife and children, family happiness. Moderate wealth but happy family.',
      '27':'Heavenly Doctor pair — 27 shares the same source as 72. Peaceful finances, harmonious family, good health.',
    }
  },
  shengqi: {
    description:'Life Force · Benefactor luck, wide social network, optimistic personality.',
    detail:'The Life Force field represents benefactor luck and interpersonal relationships. Those with Life Force numbers tend to be outgoing, well-liked, and receive help from others easily. Also known as the Benefactor Star.',
    strengths:'Well-liked, many friends, optimistic and cheerful, benefactor support',
    weaknesses:'Easily dependent on others, lacks initiative, poor at saying no',
    personality:'People with strong Life Force magnetism are optimistic and cheerful. Skilled at socializing, have many friends, and thrive in interpersonal settings. Tolerant, doesn\'t sweat small matters, easily earns goodwill and help.',
    wealth:'Life Force governs benefactor wealth — income relies on relationships and help from others. Suitable for cooperation,中介 (agency), public relations. Wealth fluctuates but trends upward.',
    feelings:'Life Force represents a go-with-the-flow attitude toward romance. Broad-minded and not obsessive. Decent异性缘 (opposite-sex appeal) but may come across as unfocused.',
    marriage:'Marriage is harmonious but needs a stable foundation. Broad social circles may affect family life — need to balance family and social relationships.',
    health:'Life Force governs liver energy — watch for liver and gallbladder issues. Maintain peace of mind and avoid excessive socializing that drains energy.',
    career:'Suitable for public relations, sales, agency, diplomacy — any job needing interpersonal skills. Strong benefactor luck — easily promoted and helped. Not suitable for isolated, solitary work.',
    pairMeanings: {
      '14':'Strongest Life Force pair — great benefactor luck. Those with 14/41 have excellent luck with benefactors, always getting help at crucial moments.',
      '41':'Second-strongest Life Force pair — 41 shares the same source as 14. Good interpersonal skills, easily meets influential people.',
      '67':'Life Force pair — 67 symbolizes salary and benefactor luck. Suitable for travel and external affairs work.',
      '76':'Life Force pair — 76 shares the same source as 67. Good social luck, can gain opportunities through friends.',
      '93':'Life Force pair — 93 symbolizes lasting relationships. Suitable for jobs requiring long-term client maintenance.',
      '39':'Life Force pair — 39 shares the same source as 93. Sustained benefactor luck, strong network-building ability.',
      '82':'Life Force pair — 82 symbolizes wealth through connections. Suitable for sales and agency work.',
      '28':'Life Force pair — 28 shares the same source as 82. Harmonious relationships, easily receives support from elders.',
    }
  },
  yannian: {
    description:'Extended Years · Career luck, leadership ability, professional expertise.',
    detail:'The Extended Years field represents career and leadership. People with strong Extended Years energy are career-driven, have leadership skills, and excel professionally. Extended Years is the career star, representing capability and responsibility.',
    strengths:'Strong work ethic, leadership ability, outstanding professional skills, strong执行力 (execution)',
    weaknesses:'Workaholic tendencies, easily overworked, stubborn',
    personality:'People with strong Extended Years magnetism have a strong work ethic, leadership ability, and decisiveness. They are opinionated and don\'t change decisions easily. Responsible and willing to take charge — suited for management. But can be overly stubborn at times.',
    wealth:'Extended Years governs career wealth — income comes from personal ability and professional achievement. Earnings are proportional to capability. Best to develop through technology and expertise.',
    feelings:'Extended Years takes a rational approach to romance. Not good at expressing emotions, but once committed, very devoted. Career comes first — may neglect partner\'s feelings.',
    marriage:'Tends to be self-centered in marriage — need to learn to balance career and family. Spouse needs to understand and support career development.',
    health:'Extended Years governs heart and brain — prone to cardiovascular stress. Long-term high-intensity work requires rest and preventing burnout.',
    career:'Extended Years is the strongest career field. Suitable for managers, entrepreneurs, and technical professionals. Strong leadership — can handle responsibilities independently but needs to delegate in teamwork.',
    pairMeanings: {
      '19':'Strongest Extended Years pair — great career and leadership. 19/91 people have卓越 (outstanding) leadership skills, suited for top positions.',
      '91':'Second-strongest Extended Years pair — 91 shares the same source as 19. Extremely career-driven with outstanding professional skills, but should watch against being autocratic.',
      '78':'Extended Years pair — 78 symbolizes inspiration. Finishes what they start with strong execution. Suitable for独立负责 (independent) project management.',
      '87':'Extended Years pair — 87 shares the same source as 78. Strong management and leadership, decisive and bold.',
      '34':'Extended Years pair — 34 symbolizes wealth generation, dual prosperity in career and finances. Earns through professional skills.',
      '43':'Extended Years pair — 43 shares the same source as 34. Strong work ability but needs to pay attention to interpersonal relationships.',
      '26':'Extended Years pair — 26 symbolizes smooth career development. Suitable for technical and management roles.',
      '62':'Extended Years pair — 62 shares the same source as 26. Strong execution — works in a planned and organized manner.',
    }
  },
  fuwei: {
    description:'Hidden Position · Stability, conservatism, accumulation. Fortune depends on surrounding numbers.',
    detail:'The Hidden Position field represents stability and accumulation. People with this field are steady, patient, and suited for long-term work. It is a neutral field — its fortune depends on the numbers before and after.',
    strengths:'Patient and persistent, waits for opportunities, surprises others',
    weaknesses:'Resists change, passive and conservative, afraid to take risks, prone to debt, inner conflict',
    personality:'Calm and steady, down-to-earth, one step at a time. Extremely strong willpower, patient and enduring, good at waiting for the right moment, can complete difficult tasks. Sometimes overly cautious, passive, afraid to act or take risks, missing golden opportunities.',
    wealth:'Wealth accumulates over time — hard-earned money, conservative wealth-seeking. Likes stable profits or consistent income sources. Strong endurance during economic downturns, waits for investment opportunities. Conservatism and hesitation can lead to missed opportunities due to fear and inertia.',
    feelings:'Conservative thinking, restless mind, overthinking, no sense of security. Inner conflict — not easily emotionally moved, hesitates with life partners, won\'t express feelings proactively. Once committed long-term, very devoted.',
    marriage:'Many enter marriage involuntarily — life becomes平淡 (plain) quickly, lacking passion. Women won\'t dress性感 (sexy) to attract their husband and don\'t want major life changes. Stability is marriage\'s biggest feature.',
    health:'Prone to heart or brain diseases — latent, hidden chronic conditions that persist and don\'t improve easily, becoming recurring problems.',
    career:'Likes waiting for opportunities, procrastinates. Wants to advance but feels helpless. Wants to start a business but overthinks. Has many questions and lacks security. Only moves forward when safety is assured.',
    pairMeanings: {
      '11':'Strongest Hidden Position pair — persistence and waiting. 11 people have超强 (super) patience suitable for long-term accumulation.',
      '22':'Hidden Position pair — 22 symbolizes ease. Patient but indecisive — needs to be more decisive.',
      '88':'Hidden Position pair — 88 symbolizes fortune. Looks great but is actually Hidden Position —表面风光 (outwardly splendid) but slow progress.',
      '99':'Hidden Position pair — 99 symbolizes longevity. Long-term persistence, suitable for things needing long-term investment.',
      '77':'Hidden Position pair — 77 symbolizes family. Family stable but career progresses slowly.',
      '66':'Hidden Position pair — 66 symbolizes smoothness. Looks smooth but needs patience.',
      '44':'Hidden Position pair — 44 symbolizes everything. Organized but slow progress.',
      '33':'Hidden Position pair — 33 symbolizes life. Has vitality but needs time to grow.',
    }
  },
  huohai: {
    description:'Calamity · Arguments, gossip, backstabbers, health issues.',
    detail:'The Calamity field represents arguments, gossip, and physical problems. It easily triggers quarrels, legal troubles, and troublesome people. Physically, it may cause throat and lung issues.',
    strengths:'Eloquent, good speaker, quick-witted',
    weaknesses:'Prone to arguments and gossip, easily offends people, many backstabbers, poor health',
    personality:'People with strong Calamity magnetism are eloquent and quick-witted. But they speak directly and offend others without realizing it, often陷入 (falling into) arguments and gossip.',
    wealth:'Calamity governs argument-related wealth — earning money easily leads to conflicts. Suitable for口才 (eloquence-based) professions like sales, law, teaching. But needs to watch cooperative relationships.',
    feelings:'In relationships, easily argues and speaks harshly. Needs to learn emotional and verbal control to avoid hurting relationships through quarrels.',
    marriage:'Needs more communication in marriage, avoid arguing over small things. Should learn gentle expression and reduce verbal harm.',
    health:'Calamity governs the respiratory system — prone to pharyngitis, bronchitis. Also prone to minor accidental injuries. Needs to watch health.',
    career:'Suitable for sales, law, hosting, teaching — professions relying on eloquence. But needs to watch words and actions to avoid gossip.',
    pairMeanings: {
      '17':'Strongest Calamity pair — major gossip and arguments. 17/71 people have many verbal disputes and easily attract trouble.',
      '71':'Calamity pair — 71 shares the same source as 17. Speaks directly and easily offends — needs to watch言行 (words and actions).',
      '89':'Calamity pair — 89 symbolizes lasting fortune. Earns through eloquence but easily attracts gossip.',
      '98':'Calamity pair — 98 shares the same source as 89. Career development容易有口舌之争 (prone to verbal disputes).',
      '64':'Calamity pair — 64 symbolizes loss. Wealth容易因口舌而流失 (easily lost through gossip).',
      '46':'Calamity pair — 46 shares the same source as 64. Prone to affecting relationships through inappropriate speech.',
      '32':'Calamity pair — 32 symbolizes life. Good eloquence but needs to watch speaking style.',
      '23':'Calamity pair — 23 shares the same source as 32. Prone to backstabbers — needs to act carefully.',
    }
  },
  jueming: {
    description:'Fatal · Financial loss, impulsiveness, investment failure. Bold but prone to dramatic ups and downs.',
    detail:'The Fatal field represents financial loss and dramatic ups and downs. People with this field are driven and冒险 (adventurous), but easily suffer financial losses due to impulsiveness. Fatal needs搭配 (pairing with) auspicious stars to neutralize its凶性 (negative nature).',
    strengths:'Driven,冒险 (adventurous), strong action orientation, seizes opportunities',
    weaknesses:'Impulsive and irritable, high risk of financial loss, investment failure, dramatic ups and downs',
    personality:'People with strong Fatal magnetism are bold and driven, with a strong sense of action. But they are impulsive and don\'t consider consequences. Fiery personality,容易与人发生冲突 (prone to conflict). Suitable for entrepreneurship but with high risk.',
    wealth:'Fatal governs偏财 (windfall wealth) — prone to dramatic financial ups and downs. Investment opportunities come with high risk. Money comes and goes quickly — hard to save.',
    feelings:'Fatal people have intense emotions and clear likes and dislikes. Invest deeply in relationships but easily break up impulsively. Need to learn emotional control.',
    marriage:'Prone to波折 (twists and turns) in marriage — need to learn tolerance and calmness. Fatal people often marry late or have difficult marriages.',
    health:'Fatal governs cardiovascular system — prone to hypertension, heart disease. Also需要注意意外伤害 (needs to watch for accidental injuries).',
    career:'Suitable for entrepreneurship, investment,冒险 (adventurous) industries. Not suitable for stable fixed jobs. Fatal people need auspicious stars to neutralize凶性.',
    pairMeanings: {
      '12':'Strongest Fatal pair — dramatic ups and downs. 12/21 people are bold but face high risk.',
      '21':'Fatal pair — 21 shares the same source as 12. Strong investment luck but also high risk — needs caution.',
      '69':'Fatal pair — 69 symbolizes smooth longevity. Looks smooth but hides危机 (crisis).',
      '96':'Fatal pair — 96 shares the same source as 69. Prone to unexpected financial loss.',
      '84':'Fatal pair — 84 symbolizes vows. Investments容易失利 (easily fail) — watch for cooperation traps.',
      '48':'Fatal pair — 48 shares the same source as 84. Financial起伏 (fluctuations) are large — not suitable for conservative investment.',
      '37':'Fatal pair — 37 symbolizes wife. Relationships容易有波折 (prone to twists).',
      '73':'Fatal pair — 73 shares the same source as 37. Strong career drive but also high risk.',
    }
  },
  liusha: {
    description:'Six Killings · Bad romance, emotional instability, melancholy.',
    detail:'The Six Killings field represents bad romance and emotional issues. People with this field are emotionally rich but prone to relationship troubles and mood swings. Six Killings is suitable for the service industry.',
    strengths:'Emotionally rich, artistic talent, strong service awareness',
    weaknesses:'Many bad romances, emotionally unstable, melancholy and anxious, lacks security',
    personality:'People with strong Six Killings magnetism are emotionally rich, sensitive, and have artistic talent. But they are emotionally unstable, prone to melancholy and anxiety, and lack security. Sensitive and easily affected by external factors.',
    wealth:'Six Killings governs service industry wealth — suitable for earning through serving others. Beauty,餐饮 (food service), consulting. Moderate wealth but needs to guard against losing money through emotional problems.',
    feelings:'Six Killings is the bad romance star — relationships are complicated. Prone to multiple relationships or love triangles. Needs to approach romance rationally.',
    marriage:'婚姻中容易因为情绪化和烂桃花而产生问题 (marriage problems due to emotional instability and bad romance). Needs to learn emotional management and marital loyalty.',
    health:'Six Killings governs the nervous system — prone to insomnia, anxiety, depression. Needs to watch mental health.',
    career:'Suitable for beauty,餐饮 (food service), consulting, design — service industries. Also suitable for art and creative work. Not suitable for high-pressure work environments.',
    pairMeanings: {
      '16':'Strongest Six Killings pair — bad romance. 16/61 people have complex感情 (relationships), prone to romantic entanglements.',
      '61':'Six Killings pair — 61 shares the same source as 16. Emotions容易波动 (easily fluctuate) — needs to watch mental health.',
      '74':'Six Killings pair — 74 symbolizes wife loss. Relationships不顺 (unpleasant), prone to losing money due to emotions.',
      '47':'Six Killings pair — 47 shares the same source as 74. Severely emotional — needs to learn to调节心态 (adjust mindset).',
      '38':'Six Killings pair — 38 symbolizes expression. Emotionally rich but unstable.',
      '83':'Six Killings pair — 83 shares the same source as 38. Suitable for service industry but needs emotional management.',
      '92':'Six Killings pair — 92 symbolizes long-term. Long-term emotional困扰 (troubles) need to be faced.',
      '29':'Six Killings pair — 29 shares the same source as 92. Prone to romantic entanglements.',
    }
  },
  wugui: {
    description:'Five Ghosts · Change, talent, but prone to blood-related incidents. Smart and creative but life has many twists.',
    detail:'The Five Ghosts field represents change and talent. People with this field are exceptionally intelligent and creative, but also prone to life upheavals. Five Ghosts is the change star, representing unstable energy.',
    strengths:'Smart and talented, infinite creativity, active mind',
    weaknesses:'Frequent changes, blood-related disasters, staying up late harms health, life twists',
    personality:'People with strong Five Ghosts magnetism are very smart, with active minds and limitless creativity. Strong learning ability and adaptability. But their lives change frequently, prone to unexpected twists. Need a stable environment to发挥才华 (showcase talent).',
    wealth:'Five Ghosts governs偏财 (windfall wealth) — earning through creativity and ideas. Suitable for策划 (planning), design, R&D — creative industries. But finances are unstable, with dramatic ups and downs.',
    feelings:'Five Ghosts people have changeable emotions — prone to liking the new and tiring of the old. Need to stabilize feelings and stay loyal to partners.',
    marriage:'Marriage involves many changes — prone to problems due to personality incompatibility or external factors. Requires joint effort from both sides.',
    health:'Five Ghosts governs blood-related issues — needs to watch for accidental injuries, car accidents. Also prone to cardiovascular risks. Frequently staying up late worsens health.',
    career:'Suitable for策划 (planning), design, IT, R&D, creative industries needing inspiration. Not suitable for overly routine work.',
    pairMeanings: {
      '18':'Strongest Five Ghosts pair — major changes. 18/81 people experience big life changes, brilliant but with many twists.',
      '81':'Five Ghosts pair — 81 shares the same source as 18. Strong creative ability but needs to watch safety and health.',
      '79':'Five Ghosts pair — 79 symbolizes wife longevity. Relationships容易有变动 (prone to changes).',
      '97':'Five Ghosts pair — 97 shares the same source as 79. Many life changes — needs to learn adaptation.',
      '36':'Five Ghosts pair — 36 symbolizes life fortune. Earns through creativity and talent.',
      '63':'Five Ghosts pair — 63 shares the same source as 36. Big career changes — suitable for flexible work.',
      '42':'Five Ghosts pair — 42 symbolizes matters. Prone to overthinking, insufficient action.',
      '24':'Five Ghosts pair — 24 shares the same source as 42. Active mind but ideas are hard to implement.',
    }
  },
}

const STAR_JA: Record<string, StarLocaleText> = {
  tianyi: {
    description:'天医星・金運、結婚、健康を司る、最も吉祥な数字の組み合わせ。',
    detail:'天医磁場は八星磁場の中で最も吉祥な磁場で、富、結婚、知恵を表します。天医エネルギーが強い人は思考が鋭く、心優しく、正財運と良縁を得やすいです。',
    strengths:'心優しい、聡明、金運が良い、結婚運が良い',
    weaknesses:'他人を信じすぎる、優しすぎて騙されやすい、警戒心に欠ける',
    personality:'天医磁場が強い人は、心優しく、誠実で聡明です。性格は温和で社交的、思いやりと包容力があります。信念を持ち、信用を重んじ、他人の信頼と助けを得やすいです。',
    wealth:'天医は正財星で金運が良く、安定した収入を得やすいです。資産運用や投資のセンスがありますが、投機は向かず、正道での財運を求めるべきです。',
    feelings:'天医磁場は正桃花と円満な感情を表します。恋愛に誠実で家族を大切にし、良い相手に出会いやすく、結婚運に恵まれます。しかし理想主義になりすぎないよう注意が必要です。',
    marriage:'結婚生活は幸福で、配偶者は善良で正派な人が多いです。家庭は円満で助け合えます。天医磁場が強い女性は夫運を高める傾向があります。',
    health:'天医は健康を司り、体調は良好です。ただし脾胃（消化器系）の問題に注意。天医磁場が強すぎる場合は食事の規則性にも気を付けましょう。',
    career:'医療、教育、金融、会計などの正統な職業に適しています。仕事は真面目で責任感があり、上司に評価されやすいです。起業も成功しやすく、着実な前進が良いでしょう。',
    pairMeanings: {
      '13':'天医最強の組み合わせ。大金運・正桃花。13/31の人は金運が旺盛で、結婚運も良い最上級の組み合わせ。',
      '31':'天医次強の組み合わせ。31は13と同源。金運が良く心優しい。異性運が良く、結婚生活は幸福で、頭が良い。',
      '68':'天医の組み合わせ。金運が徐々に上昇。68は順調な発展を意味し、商売人に最適。',
      '86':'天医の組み合わせ。86は68と同じく金運の数字。財を成した後も守ることができ、蓄財力が強い。',
      '94':'天医の組み合わせ。94は長く続く富を意味し、安定した金運を求める人に最適。',
      '49':'天医の組み合わせ。49は94と同源。金運は安定的に続き、定収入のある人に最適。',
      '72':'天医の組み合わせ。72は妻と子、家族の円満を意味。金運は中程度だが家庭は幸福。',
      '27':'天医の組み合わせ。27は72と同源。金運は穏やかで、家庭は円満、健康も良好。',
    }
  },
  shengqi: {
    description:'生氣星・人脈運、明るく楽観的な性格。',
    detail:'生氣磁場は人脈運と人間関係を表します。この磁場を持つ人は性格が明るく人気者で、他人の助けを得やすいです。別名「貴人星」とも呼ばれます。',
    strengths:'人気者、友人が多い、楽観的、貴人の助け',
    weaknesses:'他人に依存しやすい、主体性に欠ける、断るのが苦手',
    personality:'生氣磁場が強い人は性格が明るく楽観的。社交的で多くの友人を持ち、人間関係が得意です。寛容で小さなことにこだわらず、好感と助けを得やすいです。',
    wealth:'生氣は貴人の財を司り、人間関係や他人の助けを通じて稼ぎます。協業、仲介、広報などの職業に最適。金運は変動がありますが、総じて良好です。',
    feelings:'生氣磁場は「縁に任せる」恋愛観を表します。感情に執着せず、広い心を持ちます。異性運は悪くないが、浮気心があると思われがち。',
    marriage:'結婚は調和的ですが、安定した基盤が必要。社交範囲が広いため家庭に影響が出ることがあり、家庭と社交のバランスが重要です。',
    health:'生氣は肝の気を司るため、肝胆系の問題に注意。心の平穏を保ち、過度な社交での消耗を避けましょう。',
    career:'広報、営業、仲介、外交など対人スキルが必要な仕事に最適。貴人運が強く、昇進や助けを得やすい。孤独な事務作業には向きません。',
    pairMeanings: {
      '14':'生氣最強の組み合わせ。大貴人運。14/41の人は貴人運が非常に良く、重要な場面で必ず助けを得られる。',
      '41':'生氣次強の組み合わせ。41は14と同源。人気者で社交力が強く、地位のある人と知り合いやすい。',
      '67':'生氣の組み合わせ。67は財運と貴人を意味。出張や外務の仕事に最適。',
      '76':'生氣の組み合わせ。76は67と同源。人間関係運が良く、友人を通じてチャンスを得られる。',
      '93':'生氣の組み合わせ。93は長く続く人気を意味。長期にわたる顧客関係の維持が必要な仕事に最適。',
      '39':'生氣の組み合わせ。39は93と同源。貴人運が持続し、人脈構築力が強い。',
      '82':'生氣の組み合わせ。82は人脈による財運を意味。営業や仲介に最適。',
      '28':'生氣の組み合わせ。28は82と同源。人間関係が調和的で、年長者からの支援を得やすい。',
    }
  },
  yannian: {
    description:'延年星・仕事運、リーダーシップ、専門能力。',
    detail:'延年磁場は仕事とリーダーシップを表します。この磁場が強い人は仕事への意欲が高く、リーダーシップがあり、専門分野で優れた成果を上げます。',
    strengths:'仕事熱心、リーダーシップ、専門能力が突出、実行力が強い',
    weaknesses:'ワーカホリック傾向、過労しやすい、頑固',
    personality:'延年磁場が強い人は仕事への意欲が非常に高く、リーダーシップと決断力があります。自分の考えを持ち、簡単に決断を変えません。責任感が強く、管理職に適していますが、時には頑固すぎることもあります。',
    wealth:'延年は仕事による財を司り、個人の能力や専門的な成果から収入を得ます。収入は能力に比例します。技術や専門性による発展が最適です。',
    feelings:'延年磁場は感情に対して理性的です。感情表現は苦手ですが、一度決まれば非常に一途です。仕事優先で、パートナーの気持ちを疎かにしがちです。',
    marriage:'結婚生活では自己中心的になりやすいため、仕事と家庭のバランスを学ぶ必要があります。配偶者は仕事の発展への理解と支援が必要です。',
    health:'延年は心脳を司り、心血管系に負担がかかりやすいです。長時間の高強度な仕事は休息を取り、過労を防ぎましょう。',
    career:'延年は最強の仕事磁場。管理者、起業家、専門技術者に最適。リーダーシップが強く、独り立ちできますが、チームワークでは適切な権限委譲が必要です。',
    pairMeanings: {
      '19':'延年最強の組み合わせ。大事業・大リーダーシップ。19/91の人は卓越したリーダーシップを持ち、トップに最適。',
      '91':'延年次強の組み合わせ。91は19と同源。仕事意欲が非常に強く、専門能力が突出。ただし独断専行に注意。',
      '78':'延年の組み合わせ。78は啓発を意味。物事をやり遂げる実行力があり、プロジェクトの独立責任に最適。',
      '87':'延年の組み合わせ。87は78と同源。管理・リーダーシップ能力が強く、決断力と度胸がある。',
      '34':'延年の組み合わせ。34は財を生むを意味し、仕事と金運が両方とも良い。専門スキルで収入を得る。',
      '43':'延年の組み合わせ。43は34と同源。仕事能力は高いが、人間関係の処理に注意が必要。',
      '26':'延年の組み合わせ。26は仕事の順調な発展を意味。技術的・管理的な仕事に最適。',
      '62':'延年の組み合わせ。62は26と同源。実行力が強く、計画性と整理整頓が得意。',
    }
  },
  fuwei: {
    description:'伏位星・安定、保守、蓄積。吉凶は前後の組み合わせ次第。',
    detail:'伏位磁場は安定と蓄積を表します。性格は穩やかで忍耐強く、長期にわたる仕事に適しています。中性の磁場で、吉凶は前後の数字次第です。',
    strengths:'忍耐力がある、チャンスを待てる、一発逆転',
    weaknesses:'変化を嫌う、受動的で保守的、冒険を恐れる、対外債務、内心の葛藤',
    personality:'落ち着いていて着実。一歩一歩確実に進む。意志力が非常に強く、忍耐力があり、難しい任務も達成できる。時には慎重すぎて受動的になり、行動を恐れ、チャンスを逃すこともある。',
    wealth:'富は時間をかけて蓄積。労多くして稼ぎ、保守的に財を求め、安定した利益や継続的な収入源を好む。経済不況時には忍耐強く、投資の機会を待つ。保守的で優柔不断なため、絶好の機会を逃すこともある。',
    feelings:'思考は保守的で心は落ち着かず、考えすぎて安心感がない。内心は矛盾しており、情に動かされにくく、人生の伴侶に対しては優柔不断で、自ら表現しない。一度決めれば、感情は非常に一途。',
    marriage:'多くの人は非自発的に結婚し、結婚後は平坦で刺激がない。女性はセクシーな服を着て夫を誘惑せず、大きな変化を望まない。安定こそが結婚の最大の特徴。',
    health:'心臓や脳の疾患を引き起こしやすく、潜在的な慢性疾患が持続し、改善しにくく、持病となる。',
    career:'チャンスを待ち、先延ばしにする。前進したいが仕方なく、起業したいが考えすぎる。多くの問題を考え、安心感がない。安全が確保された条件でのみ前進できる。',
    pairMeanings: {
      '11':'伏位最強の組み合わせ。忍耐と待機。11の人は超強力な忍耐力を持ち、長期的な蓄積に最適。',
      '22':'伏位の組み合わせ。22は易易を意味。忍耐強いが優柔不断で、決断力が必要。',
      '88':'伏位の組み合わせ。88は発発を意味。一見大吉だが実は伏位、表面は華やかだが進展は遅い。',
      '99':'伏位の組み合わせ。99は久久を意味。長く続ける忍耐が必要なことに最適。',
      '77':'伏位の組み合わせ。77は妻妻を意味。家庭は安定しているが、仕事の進展は遅い。',
      '66':'伏位の組み合わせ。66は順順を意味。表面上は順調だが、実際には忍耐が必要。',
      '44':'伏位の組み合わせ。44は事事を意味。整理整頓が得意だが、進展は遅い。',
      '33':'伏位の組み合わせ。33は生生を意味。生命力があるが、成長に時間が必要。',
    }
  },
  huohai: {
    description:'禍害星・口論、トラブル、小人、病気。',
    detail:'禍害磁場は口論や体調不良を表します。言い争いや訴訟、人に悩まされることが多い。体調面では喉や肺の問題が出やすいです。',
    strengths:'弁が立つ、話し上手、反応が速い',
    weaknesses:'口論やトラブルが多い、人を怒らせやすい、小人が多い、体調不良',
    personality:'禍害磁場が強い人は弁が立ち、話し上手。反応が速く思考も鋭い。しかし直接的な物言いで知らずに人を怒らせ、常に口論に巻き込まれやすい。',
    wealth:'禍害はトラブルの財を司り、金を稼ぐことで争いが生じやすい。弁舌を活かした営業、弁護士、講師などの職業に適していますが、協力関係に注意が必要です。',
    feelings:'恋愛では喧嘩が絶えず、口が悪い。感情と話し方をコントロールし、言葉の争いで愛情を傷つけないようにする必要があります。',
    marriage:'結婚生活では多くのコミュニケーションが必要で、小さなことで喧嘩しないように。柔らかい表現を学び、言葉による傷を減らすことが大切です。',
    health:'禍害は呼吸器系を司り、咽喉炎、気管炎になりやすい。また小さなケガもしやすいので健康管理に注意。',
    career:'営業、弁護士、司会、講師など弁舌を活かす職業に最適。ただし言葉と行動に注意し、トラブルを避けること。',
    pairMeanings: {
      '17':'禍害最強の組み合わせ。大トラブル。17/71の人は口論が多く、小人を招きやすい。',
      '71':'禍害の組み合わせ。71は17と同源。言葉が直接的に人を怒らせるので言行に注意。',
      '89':'禍害の組み合わせ。89は長く続くを意味。弁舌で稼ぐがトラブルを呼びやすい。',
      '98':'禍害の組み合わせ。98は89と同源。仕事の発展において口論が生じやすい。',
      '64':'禍害の組み合わせ。64は流失を意味。金運が口論によって失われやすい。',
      '46':'禍害の組み合わせ。46は64と同源。不適切な発言で人間関係に影響が出やすい。',
      '32':'禍害の組み合わせ。32はあなたを生むを意味。弁才は良いが話し方に注意。',
      '23':'禍害の組み合わせ。23は32と同源。小人に悩まされやすいので慎重に行動。',
    }
  },
  jueming: {
    description:'絶命星・破財、衝動、投資失敗。大胆だが浮き沈みが激しい。',
    detail:'絶命磁場は破財と大浮き沈みを表します。この磁場の人は行動力があり冒険心も強いが、衝動的な判断で損失を被りやすい。絶命磁場は吉星と組み合わせることで凶性を和らげられます。',
    strengths:'行動力がある、冒険心がある、実行力が強い、チャンスを掴める',
    weaknesses:'衝動的で怒りやすい、破財リスクが高い、投資失敗、浮き沈みが激しい',
    personality:'絶命磁場が強い人は大胆で行動力があり、冒険心があります。しかし衝動的で結果を考えずに行動しがち。性格は剛毅で人と衝突しやすい。起業には向くがリスクも高い。',
    wealth:'絶命は偏財を司り、金運に浮き沈みがあります。投資にチャンスはあるがリスクも大きい。お金の出入りが激しく、貯めにくい。',
    feelings:'絶命磁場の人は感情が強く、好き嫌いがはっきりしています。恋愛に深くのめり込みますが、衝動的に別れやすい。感情のコントロールが必要です。',
    marriage:'結婚生活には波乱が多く、寛容さと冷静さが必要。絶命磁場の人は晩婚か結婚運に恵まれない傾向があります。',
    health:'絶命は心血管系を司り、高血圧や心臓病になりやすい。またケガにも注意が必要です。',
    career:'起業、投資、冒険的な業界に最適。安定した固定職には向かない。吉星と組み合わせて凶性を中和する必要があります。',
    pairMeanings: {
      '12':'絶命最強の組み合わせ。大浮き沈み。12/21の人は大胆だがリスクも大きい。',
      '21':'絶命の組み合わせ。21は12と同源。投資運は強いがリスクも大きく注意が必要。',
      '69':'絶命の組み合わせ。69は順調に続くを意味。一見順調だが危機が潜んでいる。',
      '96':'絶命の組み合わせ。96は69と同源。予期せぬ破財が起きやすい。',
      '84':'絶命の組み合わせ。84は誓いを意味。投資は失敗しやすく、協力の罠に注意。',
      '48':'絶命の組み合わせ。48は84と同源。金運の変動が大きく、保守的な投資には向かない。',
      '37':'絶命の組み合わせ。37は妻を生むを意味。恋愛面で波乱が起きやすい。',
      '73':'絶命の組み合わせ。73は37と同源。仕事の推進力は強いがリスクも大きい。',
    }
  },
  liusha: {
    description:'六煞星・悪い恋愛、情緒不安定、憂鬱。',
    detail:'六煞磁場は悪い恋愛や感情問題を表します。感情豊かですが、恋愛トラブルや感情の浮き沈みに陥りやすい。サービス業に適しています。',
    strengths:'感情豊か、芸術的才能、サービス精神が強い',
    weaknesses:'悪い恋愛が多い、情緒不安定、憂鬱・不安、安心感がない',
    personality:'六煞磁場が強い人は感情豊かで繊細、芸術的才能があります。しかし情緒不安定で不安や憂鬱になりやすく、安心感に欠けます。敏感で外部の影響を受けやすい。',
    wealth:'六煞はサービス業の財を司り、人にサービスして稼ぐことに適しています。美容、飲食、コンサルティングなど。金運は中程度だが、感情問題による散財に注意が必要。',
    feelings:'六煞は悪い恋愛の星で、恋愛関係が複雑になりがち。複数の恋愛経験や三角関係に巻き込まれやすい。感情に対して理性的な対応が必要です。',
    marriage:'感情の起伏や悪い恋愛によって結婚生活に問題が生じやすい。感情管理を学び、結婚に誠実であることが大切。',
    health:'六煞は神経系を司り、不眠、不安、うつなどの精神的な問題が起きやすい。メンタルヘルスに注意。',
    career:'美容、飲食、コンサルティング、デザインなどのサービス業に最適。アート系やクリエイティブな仕事も向く。プレッシャーの大きい職場環境は避けるべき。',
    pairMeanings: {
      '16':'六煞最強の組み合わせ。悪い恋愛。16/61の人は恋愛が複雑で感情のもつれが起きやすい。',
      '61':'六煞の組み合わせ。61は16と同源。感情が変動しやすく、メンタルヘルスに注意。',
      '74':'六煞の組み合わせ。74は妻の死を意味。恋愛がうまくいかず、感情で破財しやすい。',
      '47':'六煞の組み合わせ。47は74と同源。感情的に激しく、心の調整が必要。',
      '38':'六煞の組み合わせ。38は発散を意味。感情豊かだが不安定。',
      '83':'六煞の組み合わせ。83は38と同源。サービス業に適するが感情管理が重要。',
      '92':'六煞の組み合わせ。92は長く続くを意味。長期にわたる感情の問題に直面する必要がある。',
      '29':'六煞の組み合わせ。29は92と同源。恋愛のもつれに陥りやすい。',
    }
  },
  wugui: {
    description:'五鬼星・変動、才能、血の気の多い出来事。賢く創造的だが人生に波乱が多い。',
    detail:'五鬼磁場は変動と才能を表します。非常に知的で創造力がありますが、人生の変動や波乱にも見舞われやすい。五鬼は変動の星で、不安定なエネルギーを表します。',
    strengths:'賢く有能、無限の創造力、思考が活発',
    weaknesses:'変動が多い、血の気の多い災い、夜更かしで健康を害する、人生の波乱',
    personality:'五鬼磁場が強い人は非常に賢く、思考が活発で創造力が無限。学習能力と適応力が非常に高い。しかし人生の変動が大きく、予期せぬ波乱が起きやすい。才能を発揮するには安定した環境が必要。',
    wealth:'五鬼は偏財を司り、創造力やアイデアで稼ぐ。企画、デザイン、研究開発などのクリエイティブ業界に最適。しかし金運は安定せず、浮き沈みが激しい。',
    feelings:'五鬼磁場の人は感情が移ろいやすく、新しいものを好み古いものに飽きやすい。感情を安定させ、パートナーに誠実であることを学ぶ必要があります。',
    marriage:'結婚生活では変動が多く、性格の不一致や外部要因で問題が生じやすい。双方の努力と協力が必要です。',
    health:'五鬼は流血の災いを司り、事故や車禍に注意。また心血管系のリスクも抱えやすい。夜更かしは健康問題を悪化させます。',
    career:'企画、デザイン、IT、研究開発、クリエイティブなどインスピレーションが必要な業界に最適。あまりにも規則正しい仕事には向きません。',
    pairMeanings: {
      '18':'五鬼最強の組み合わせ。大変動。18/81の人は人生の変化が大きく、才能豊かだが波乱も多い。',
      '81':'五鬼の組み合わせ。81は18と同源。創造力が強いが安全と健康に注意。',
      '79':'五鬼の組み合わせ。79は妻が長く続くを意味。恋愛面で変動が起きやすい。',
      '97':'五鬼の組み合わせ。97は79と同源。人生の変動が多く、適応力を身につける必要がある。',
      '36':'五鬼の組み合わせ。36は生禄を意味。創造力と才能で稼ぐ。',
      '63':'五鬼の組み合わせ。63は36と同源。仕事の変動が大きく、柔軟な働き方が必要。',
      '42':'五鬼の組み合わせ。42は事柄を意味。考えすぎて行動力が不足しがち。',
      '24':'五鬼の組み合わせ。24は42と同源。思考は活発だがアイデアを実現するのが難しい。',
    }
  },
}

const STAR_KO: Record<string, StarLocaleText> = {
  tianyi: {
    description:'천의성(天醫星) · 재운, 혼인, 건강을 주관하는 가장 길한 숫자 조합.',
    detail:'천의 자기장은 팔성 자기장 중 가장 길한 자기장으로, 부, 혼인, 지혜를 나타냅니다. 천의 에너지가 강한 사람은 사고가 민첩하고 마음씨가 착하며, 정재운과 좋은 인연을 얻기 쉽습니다.',
    strengths:'마음이 착함, 총명함, 재운이 좋음, 혼인운이 좋음',
    weaknesses:'타인을 쉽게 믿음, 너무 착해서 속기 쉬움, 경계심 부족',
    personality:'천의 자기장이 강한 사람은 마음이 착하고 진실하며 총명합니다. 성격이 온화하고 사교적이며, 동정심과 포용력이 있습니다. 원칙을 지키고 신용을 중시하며, 타인의 신뢰와 도움을 얻기 쉽습니다.',
    wealth:'천의는 정재성을 주관하여 재운이 좋습니다. 돈을 잘 벌고 안정적인 재정 수입을 얻기 쉽습니다. 재정 관리와 투자 안목이 있으나, 투기에는 적합하지 않으며 정도(正道)로 재물을 구해야 합니다.',
    feelings:'천의 자기장은 정桃花(진정한 인연)와 원만한 감정을 나타냅니다. 연애에 충실하고 가족을 중시하며, 좋은 상대를 만나기 쉽고 혼인운이 좋습니다. 그러나 지나치게 이상화하지 않도록 주의해야 합니다.',
    marriage:'결혼 생활은 비교적 행복하며, 배우자는 대부분 착하고 올바른 사람입니다. 가정이 화목하고 서로 도울 수 있습니다. 천의 자기장이 강한 여성은 남편운을 높이는 경향이 있습니다.',
    health:'천의는 건강을 주관하여 신체 상태가 좋습니다. 비위(소화계) 문제에 주의해야 합니다. 천의 자기장이 너무 강할 때는 식사 규칙성에도 신경 써야 합니다.',
    career:'의료, 교육, 금융, 회계 등의 정통 직업에 적합합니다. 일을 성실히 하고 책임감이 강하여 상사의 인정을 받기 쉽습니다. 창업도 성공하기 쉬우며, 안정적으로 나아가는 것이 좋습니다.',
    pairMeanings: {
      '13':'천의 최강 조합, 큰 재운과 정인연. 13/31의 사람은 재운이 왕성하고 돈 버는 능력이 뛰어나며 혼인운도 좋은 최고의 조합.',
      '31':'천의 차강 조합. 31은 13과 동원. 재운이 좋고 마음이 착함. 이성운이 좋고 결혼 생활이 행복하며 두뇌가 명석함.',
      '68':'천의 조합, 재운이 점차 상승. 68은 순조로운 발전을 의미하여 사업가에게 적합.',
      '86':'천의 조합, 86은 68과 함께 재운 숫자. 돈을 번 후에도 지킬 수 있어 재산 축적 능력이 강함.',
      '94':'천의 조합, 94는 오래 가는 재물을 의미. 안정적인 재운을 원하는 사람에게 적합.',
      '49':'천의 조합, 49는 94와 동원. 재운이 지속적으로 안정적이며 고정 수입이 있는 사람에게 적합.',
      '72':'천의 조합, 72는 처자를 의미하여 가정의 화목을 주관. 재운은 중간 정도지만 가정은 행복.',
      '27':'천의 조합, 27은 72와 동원. 재운이 평화롭고 가정이 화목하며 건강도 좋음.',
    }
  },
  shengqi: {
    description:'생기성(生氣星) · 귀인운, 인맥, 명랑하고 낙천적인 성격.',
    detail:'생기 자기장은 귀인운과 대인관계를 나타냅니다. 이 자기장을 가진 번호 사용자는 성격이 명랑하고 인망이 좋으며 타인의 도움을 받기 쉽습니다. 귀인성(貴人星)이라고도 불립니다.',
    strengths:'인망이 좋음, 친구가 많음, 낙천적, 귀인의 도움',
    weaknesses:'타인에게 의존하기 쉬움, 주관 부족, 거절을 잘 못함',
    personality:'생기 자기장이 강한 사람은 성격이 명랑하고 적극적이며 낙천적입니다. 사교성이 뛰어나고 친구가 많으며 대인관계에서 물 만난 고기처럼 활동합니다. 포용력이 있고 작은 일에 연연하지 않으며 타인의 호감과 도움을 얻기 쉽습니다.',
    wealth:'생기는 귀인에 의한 재물을 주관하며, 대인관계와 타인의 도움을 통해 돈을 법니다. 협업, 중개, 홍보 등의 직업에 적합합니다. 재운의 변동이 있지만 전반적으로 좋은 방향입니다.',
    feelings:'생기 자기장은 인연에 맡기는 연애관을 나타냅니다. 감정에 대해 너그럽고 집착하지 않으며, 이성운은 나쁘지 않지만 한눈을 판다는 인상을 주기 쉽습니다.',
    marriage:'결혼은 비교적 조화롭지만 안정적인 감정 기반이 필요합니다. 사교 범위가 넓어 가정에 영향을 줄 수 있으므로 가정과 사교의 균형이 필요합니다.',
    health:'생기는 간기를 주관하므로 간담계 문제에 주의합니다. 마음의 평화를 유지하고 과도한 사교로 기력을 소모하지 않도록 합니다.',
    career:'홍보, 영업, 중개, 외교 등 대인관계가 필요한 업무에 적합합니다. 귀인운이 좋아 승진과 도움을 받기 쉽습니다. 독립적인 폐쇄적 작업에는 적합하지 않습니다.',
    pairMeanings: {
      '14':'생기 최강 조합, 대귀인운. 14/41의 사람은 귀인운이 매우 좋아 중요한 순간에 항상 도움을 받음.',
      '41':'생기 차강 조합. 41은 14와 동원. 인망이 좋고 사교력이 강해 지위 있는 사람을 사귀기 쉬움.',
      '67':'생기 조합, 67은 재운과 귀인을 의미. 출장이나 외부 업무에 적합.',
      '76':'생기 조합, 76은 67과 동원. 대인운이 좋아 친구를 통해 기회를 얻을 수 있음.',
      '93':'생기 조합, 93은 오래가는 인연을 의미. 장기적으로 고객 관계를 유지해야 하는 업무에 적합.',
      '39':'생기 조합, 39는 93과 동원. 귀인운이 지속되고 인맥 축적 능력이 강함.',
      '82':'생기 조합, 82는 인맥을 통한 재운을 의미. 영업, 중개에 적합.',
      '28':'생기 조합, 28은 82와 동원. 대인관계가 조화롭고 연장자의 도움을 받기 쉬움.',
    }
  },
  yannian: {
    description:'연년성(延年星) · 사업운, 리더십, 전문 능력.',
    detail:'연년 자기장은 사업과 리더십을 나타냅니다. 이 자기장이 강한 사람은 사업 의욕이 강하고 리더십이 있으며 전문 분야에서 뛰어납니다. 연년은 능력과 책임을 나타내는 사업성입니다.',
    strengths:'사업 의욕 강함, 리더십, 전문 능력 탁월, 실행력 강함',
    weaknesses:'워커홀릭 경향, 과로하기 쉬움, 고집 셈',
    personality:'연년 자기장이 강한 사람은 사업 의욕이 매우 강하고 리더십과 결단력이 있습니다. 주관이 뚜렷하고 쉽게 결정을 바꾸지 않습니다. 책임감이 있고 관리자 역할에 적합하지만 때로는 너무 고집스럽습니다.',
    wealth:'연년은 사업 재물을 주관하며, 개인의 능력과 전문적 성과에서 재산이 생깁니다. 자신의 재능으로 돈을 벌며 수입은 능력에 비례합니다. 기술과 전문 분야 발전이 적합합니다.',
    feelings:'연년 자기장은 감정에 대해 비교적 이성적입니다. 감정 표현에 서툴지만 한번 결정하면 매우 일편단심입니다. 사업을 우선시하여 파트너의 감정을 소홀히 하기 쉽습니다.',
    marriage:'결혼 생활에서 자기중심적이 되기 쉬우므로 사업과 가정의 균형을 배워야 합니다. 배우자는 사업 발전에 대한 이해와 지지가 필요합니다.',
    health:'연년은 심뇌를 주관하여 심혈관계에 부담이 갈 수 있습니다. 장시간 고강도 업무는 휴식을 취하고 과로를 예방해야 합니다.',
    career:'연년은 가장 강력한 사업 자기장입니다. 관리자, 창업가, 전문 기술 인력에게 적합합니다. 리더십이 강해 독립적으로 일할 수 있지만 팀워크에서는 적절한 권한 위임이 필요합니다.',
    pairMeanings: {
      '19':'연년 최강 조합, 큰 사업과 큰 리더십. 19/91의 사람은 탁월한 리더십을 가져 최고 자리에 적합.',
      '91':'연년 차강 조합. 91은 19와 동원. 사업 의욕이 매우 강하고 전문 능력이 탁월하나 독선적이지 않도록 주의.',
      '78':'연년 조합, 78은 계발을 의미. 일을 처음부터 끝까지 해내는 실행력이 있어 프로젝트 독립 책임에 적합.',
      '87':'연년 조합, 87은 78과 동원. 관리 및 리더십 능력이 강하고 결단력과 추진력이 있음.',
      '34':'연년 조합, 34는 재물 창출을 의미하여 사업과 재운이 모두 좋음. 전문 기술로 돈을 법.',
      '43':'연년 조합, 43은 34와 동원. 업무 능력이 뛰어나지만 대인관계 처리에 주의 필요.',
      '26':'연년 조합, 26은 순조로운 사업 발전을 의미. 기술적, 관리적 업무에 적합.',
      '62':'연년 조합, 62는 26과 동원. 실행력이 강하고 계획적이며 체계적으로 일함.',
    }
  },
  fuwei: {
    description:'복위성(伏位星) · 안정, 보수, 축적. 길흉은 앞뒤 조합에 따라 달라짐.',
    detail:'복위 자기장은 안정과 축적을 나타냅니다. 성격이 차분하고 인내심이 있으며 장기적인 업무에 적합합니다. 중립적인 자기장으로 길흉은 앞뒤 숫자 조합에 따라 결정됩니다.',
    strengths:'인내심과 끈기, 기회를 기다림, 일약성장',
    weaknesses:'변화를 싫어함, 소극적이고 보수적, 모험을 두려워함, 대외채무, 내적 갈등',
    personality:'침착하고 냉정하며 착실하게 한 걸음씩 나아갑니다. 의지력이 매우 강하고 인내심이 있으며 기회를 기다리는 데 능숙하고 어려운 일도 완수할 수 있습니다. 때로는 지나치게 신중하고 소극적이며 모험을 두려워해 절호의 기회를 놓칩니다.',
    wealth:'재산은 시간을 두고 축적되며, 힘들게 벌고 보수적으로 재물을 구하며 안정적인 수익이나 지속적인 수입원을 좋아합니다. 경제 불황 시 인내심이 강하고 투자 기회를 기다립니다. 보수적이고 우유부단하여 결정을 늦추고, 게으름과 두려움으로 절호의 재운을 놓치기도 합니다.',
    feelings:'사고가 보수적이고 마음이 불안정하며 생각이 많고 불안감이 있습니다. 내면에 갈등이 있고 쉽게 감정을 느끼지 않으며 평생 의지할 반려자에 대해 우유부단하고 적극적으로 표현하지 않습니다. 오래 함께하기로 결정하면 감정이 매우 한결같습니다.',
    marriage:'많은 사람들이 비자발적으로 결혼하며, 결혼 후에는 쉽게 평범해지고 권태기가 옵니다. 여성은 남편의 흥미를 끌기 위해 섹시한 옷을 입지 않으며 생활에 큰 변화를 원하지 않습니다. 안정이 결혼의 가장 큰 특징입니다.',
    health:'심장이나 뇌 질환을 유발하기 쉬우며, 잠재적인 만성 질환이 지속되어 쉽게 낫지 않고 고질병이 됩니다.',
    career:'기회를 기다리고 미루기를 좋아하며, 잠재력은 있지만 전진을 망설이고 창업을 고민하지만 생각만 많습니다. 안전이 보장된 조건에서만 나아갈 수 있습니다.',
    pairMeanings: {
      '11':'복위 최강 조합, 인내와 대기. 11의 사람은 초강력 인내심을 가지고 있어 장기 축적에 적합.',
      '22':'복위 조합, 22는 쉬움을 의미. 인내심이 있지만 우유부단하여 결단력 필요.',
      '88':'복위 조합, 88은 재물을 의미. 겉보기에는 대길이지만 실제는 복위로 표면은 화려하나 실제 진행은 느림.',
      '99':'복위 조합, 99는 오래감을 의미. 장기적인 투자가 필요한 일에 적합.',
      '77':'복위 조합, 77은 가정을 의미. 가정은 안정적이나 사업 진전이 느림.',
      '66':'복위 조합, 66은 순조로움을 의미. 표면적으로는 순조롭지만 실제로는 인내가 필요.',
      '44':'복위 조합, 44는 모든 일을 의미. 체계적으로 일하지만 진전이 느림.',
      '33':'복위 조합, 33은 생명을 의미. 생명력이 있지만 성장에 시간이 필요.',
    }
  },
  huohai: {
    description:'화해성(禍害星) · 구설수, 시비, 소인배, 질병.',
    detail:'화해 자기장은 구설수와 신체 문제를 나타냅니다. 이 자기장은 다툼, 법적 분쟁, 소인배의 괴롭힘을 유발하기 쉽습니다. 신체적으로는 인후와 폐에 문제가 생기기 쉽습니다.',
    strengths:'말 잘함, 언변 좋음, 반응 빠름',
    weaknesses:'구설수와 시비가 많음, 사람을 쉽게 화나게 함, 소인배 많음, 건강不良',
    personality:'화해 자기장이 강한 사람은 언변이 뛰어납니다. 반응이 빠르고 사고도 민첩합니다. 하지만 말이 직설적이어서 자신도 모르게 사람을 화나게 하고 항상 구설수에 휘말립니다.',
    wealth:'화해는 시비의 재물을 주관하며, 돈을 버는 과정에서 남과 다투기 쉽습니다. 언변이 필요한 직업(영업, 변호사, 강사 등)에 적합하지만 협력 관계에 주의해야 합니다.',
    feelings:'연애에서 다툼이 잦고 말이 험합니다. 감정과 말을 조절하고 말다툼으로 감정을 상하게 하지 않도록 해야 합니다.',
    marriage:'결혼 생활에서 많은 소통이 필요하며 사소한 일로 다투지 않도록 해야 합니다. 부드러운 표현을 배우고 언어적 상처를 줄이는 것이 중요합니다.',
    health:'화해는 호흡기계를 주관하여 인후염, 기관지염이 생기기 쉽습니다. 또한 작은 사고 부상이 잦으니 건강 관리에 주의해야 합니다.',
    career:'영업, 변호사, 사회자, 강사 등 언변이 필요한 직업에 적합합니다. 그러나 말과 행동을 조심하고 시비를 피해야 합니다.',
    pairMeanings: {
      '17':'화해 최강 조합, 큰 시비. 17/71의 사람은 말다툼이 많고 소인배를 부르기 쉬움.',
      '71':'화해 조합, 71은 17과 동원. 말이 직설적이어서 사람을 화나게 하므로 언행에 주의.',
      '89':'화해 조합, 89는 오래 감을 의미. 언변으로 돈을 벌지만 시비를 부르기 쉬움.',
      '98':'화해 조합, 98은 89와 동원. 사업 발전 중에 구설수가 생기기 쉬움.',
      '64':'화해 조합, 64는 손실을 의미. 재운이 구설수로 인해流失되기 쉬움.',
      '46':'화해 조합, 46은 64와 동원. 부적절한 말로 인해 대인관계에 영향이 생기기 쉬움.',
      '32':'화해 조합, 32는 당신을 낳음을 의미. 말재주는 좋지만 말투에 주의.',
      '23':'화해 조합, 23은 32와 동원. 소인배에게 시달리기 쉬우니 신중하게 처신.',
    }
  },
  jueming: {
    description:'절명성(絶命星) · 파재, 충동, 투자 실패. 대담하지만 큰 기복이 있음.',
    detail:'절명 자기장은 파재와 큰 기복을 나타냅니다. 이 자기장의 사람은 추진력이 있고 모험을 즐기지만 충동적인 선택으로 재정적 손실을 보기 쉽습니다. 절명은 길성과 함께해야 흉성이 완화됩니다.',
    strengths:'추진력 있음, 모험심 있음, 실행력 강함, 기회 포착 능력',
    weaknesses:'충동적이고 화를 잘 냄, 파재 위험 높음, 투자 실패, 큰 기복',
    personality:'절명 자기장이 강한 사람은 대담하고 추진력이 있으며 모험 정신이 있습니다. 그러나 충동적으로 행동하고 결과를 고려하지 않습니다. 성격이 강직하여 남과 충돌하기 쉽습니다. 창업에 적합하지만 위험도 높습니다.',
    wealth:'절명은 편재를 주관하여 재운에 큰 기복이 있습니다. 투자에 기회가 있지만 위험도 큽니다. 돈을 빨리 벌고 쓰기도 빨라 저축하기 어렵습니다.',
    feelings:'절명 자기장의 사람은 감정이 강하고 애증이 분명합니다. 사랑에 깊이 빠지지만 충동적으로 헤어지기도 쉽습니다. 감정 조절이 필요합니다.',
    marriage:'결혼 생활에 파란이 많아 포용력과 냉정함을 배워야 합니다. 절명의 사람은 대개 늦게 결혼하거나 혼인운이 좋지 않습니다.',
    health:'절명은 심혈관계를 주관하여 고혈압, 심장병 등이 생기기 쉽습니다. 또한 사고 부상에도 주의해야 합니다.',
    career:'창업, 투자, 모험적인 산업에 적합합니다. 안정적인 고정 직업에는 적합하지 않습니다. 길성과 결합하여 흉성을 완화해야 합니다.',
    pairMeanings: {
      '12':'절명 최강 조합, 큰 기복. 12/21의 사람은 대담하지만 위험도 큼.',
      '21':'절명 조합, 21은 12와 동원. 투자운은 강하지만 위험도 크니 주의 필요.',
      '69':'절명 조합, 69는 순조로움을 의미. 겉보기에는 순조롭지만 위기가 숨어있음.',
      '96':'절명 조합, 96은 69와 동원. 예상치 못한 파재가 발생하기 쉬움.',
      '84':'절명 조합, 84는 맹세를 의미. 투자가 쉽게 실패하므로 공동 작업의 함정을 조심.',
      '48':'절명 조합, 48은 84와 동원. 재운의 변동이 커서 보수적 투자에 부적합.',
      '37':'절명 조합, 37은 아내를 낳음을 의미. 감정 문제에서 파란이 생기기 쉬움.',
      '73':'절명 조합, 73은 37과 동원. 사업 추진력이 좋지만 위험도 큼.',
    }
  },
  liusha: {
    description:'육살성(六殺星) · 나쁜 인연, 감정 불안정, 우울.',
    detail:'육살 자기장은 좋지 않은 인연과 감정 문제를 나타냅니다. 감정이 풍부하지만 연애 트러블과 감정 기복에 빠지기 쉽습니다. 서비스업에 적합합니다.',
    strengths:'감정 풍부, 예술적 재능, 서비스 정신 강함',
    weaknesses:'나쁜 인연 많음, 감정 불안정, 우울하고 불안, 안정감 부족',
    personality:'육살 자기장이 강한 사람은 감정이 풍부하고 마음이 섬세하며 예술적 재능이 있습니다. 그러나 감정이 불안정하고 우울과 불안에 빠지기 쉬우며 안정감이 부족합니다. 민감하고 외부 영향에 쉽게 흔들립니다.',
    wealth:'육살은 서비스업의 재물을 주관하며, 사람에게 서비스하여 돈을 버는 데 적합합니다. 미용, 요식업, 컨설팅 등. 재운은 중간 정도이지만 감정 문제로 인한 재정 손실에 주의해야 합니다.',
    feelings:'육살은 나쁜 인연의 별로, 연애 관계가 복잡해지기 쉽습니다. 여러 번의 연애 경험이나 삼각 관계에 휘말리기 쉽습니다. 감정을 이성적으로 대해야 합니다.',
    marriage:'감정 기복과 좋지 않은 인연으로 결혼 생활에 문제가 생기기 쉽습니다. 감정 관리를 배우고 결혼에 충실해야 합니다.',
    health:'육살은 신경계를 주관하여 불면증, 불안, 우울 등의 정신적 문제가 생기기 쉽습니다. 정신 건강 관리에 주의해야 합니다.',
    career:'미용, 요식업, 컨설팅, 디자인 등 서비스업에 적합합니다. 예술 계열이나 창의적인 일에도 적합합니다. 스트레스가 큰 환경에는 적합하지 않습니다.',
    pairMeanings: {
      '16':'육살 최강 조합, 나쁜 인연. 16/61의 사람은 연애가 복잡하고 감정적 얽힘이 생기기 쉬움.',
      '61':'육살 조합, 61은 16과 동원. 감정이 변동하기 쉬우니 정신 건강에 주의.',
      '74':'육살 조합, 74는 아내의 죽음을 의미. 연애가 순조롭지 않고 감정 문제로 재정 손실이 생기기 쉬움.',
      '47':'육살 조합, 47은 74와 동원. 감정 기복이 심하고 마음의 조절이 필요.',
      '38':'육살 조합, 38은 발산을 의미. 감정이 풍부하지만 불안정함.',
      '83':'육살 조합, 83은 38과 동원. 서비스업에 적합하지만 감정 관리가 중요.',
      '92':'육살 조합, 92는 오래 감을 의미. 장기적인 감정 문제에 직면할 필요가 있음.',
      '29':'육살 조합, 29는 92와 동원. 연애의 얽힘에 빠지기 쉬움.',
    }
  },
  wugui: {
    description:'오귀성(五鬼星) · 변동, 재능, 혈광. 총명하고 창의적이지만 인생에 파란이 많음.',
    detail:'오귀 자기장은 변동과 재능을 나타냅니다. 매우 지적이고 창의력이 뛰어나지만 인생의 변화와 파란을 겪기 쉽습니다. 오귀는 변동의 별로 불안정한 에너지를 나타냅니다.',
    strengths:'총명하고 재능 있음, 무한한 창의력, 사고가 활발함',
    weaknesses:'변동 많음, 혈광(혈액 관련) 재앙, 야식으로 건강 해침, 인생의 파란',
    personality:'오귀 자기장이 강한 사람은 매우 총명하고 사고가 활발하며 창의력이 무한합니다. 학습 능력과 적응 능력이 매우 뛰어납니다. 하지만 인생의 변동이 크고 예상치 못한 파란이 생기기 쉽습니다. 재능을 발휘하려면 안정적인 환경이 필요합니다.',
    wealth:'오귀는 편재를 주관하며 창의력과 아이디어로 돈을 법니다. 기획, 디자인, 연구개발 등 창의적인 산업에 적합합니다. 하지만 재운이 불안정하고 기복이 심합니다.',
    feelings:'오귀 자기장의 사람은 감정이 변덕스럽고 쉽게 싫증을 냅니다. 감정을 안정시키고 파트너에게 충실해야 합니다.',
    marriage:'결혼 생활에 변동이 많고 성격 차이나 외부 요인으로 문제가 생기기 쉽습니다. 부부가 함께 노력해야 합니다.',
    health:'오귀는 혈광의 재앙을 주관하며 사고, 교통사고 등에 주의해야 합니다. 또한 심혈관계 질환의 위험이 있습니다. 자주 밤을 새면 건강 문제가 악화됩니다.',
    career:'기획, 디자인, IT, 연구개발, 창의적 작업 등 영감이 필요한 업종에 적합합니다. 지나치게 규칙적인 작업에는 적합하지 않습니다.',
    pairMeanings: {
      '18':'오귀 최강 조합, 큰 변동. 18/81의 사람은 인생 변화가 크고 재능이 뛰어나지만 파란도 많음.',
      '81':'오귀 조합, 81은 18과 동원. 창의력이 뛰어나지만 안전과 건강에 주의.',
      '79':'오귀 조합, 79는 아내가 오래 감을 의미. 감정 문제에서 변동이 생기기 쉬움.',
      '97':'오귀 조합, 97은 79와 동원. 인생의 변동이 많아 적응력을 길러야 함.',
      '36':'오귀 조합, 36은 생록을 의미. 창의력과 재능으로 돈을 법.',
      '63':'오귀 조합, 63은 36과 동원. 사업 변동이 커서 유연한 업무가 적합.',
      '42':'오귀 조합, 42는 모든 일을 의미. 생각이 많고 실행력이 부족하기 쉬움.',
      '24':'오귀 조합, 24는 42와 동원. 사고는 활발하지만 아이디어를 실현하기 어려움.',
    }
  },
}

// ── Locale-aware star data accessor ──
const TYPE_LOCALE_MAP: Record<string, Record<string, string>> = {
  en: STAR_NAMES_EN, ja: STAR_NAMES_JA, ko: STAR_NAMES_KO,
}
const TYPE_NAME_MAP: Record<string, Record<string, string>> = {
  en: TYPE_NAMES_EN, ja: TYPE_NAMES_JA, ko: TYPE_NAMES_KO,
}
const STAR_TEXT_MAP: Record<string, Record<string, StarLocaleText>> = {
  en: STAR_EN, ja: STAR_JA, ko: STAR_KO,
}

function tName(starKey: string, locale: string): string {
  return TYPE_LOCALE_MAP[locale]?.[starKey] || FIELDS[starKey]?.name || ''
}

function tType(typeVal: string, locale: string): string {
  return TYPE_NAME_MAP[locale]?.[typeVal] || typeVal
}

function tLevel(levelVal: string, locale: string): string {
  return TYPE_NAME_MAP[locale]?.[levelVal] || levelVal
}

function getStarTextField(starKey: string, field: keyof StarLocaleText, locale: string): string {
  const localeData = STAR_TEXT_MAP[locale]?.[starKey]
  if (localeData && (localeData as any)[field]) return (localeData as any)[field]
  // Fallback: check if FIELDS has the field (for zh-CN / zh-TW)
  const base = FIELDS[starKey] as any
  return base?.[field] || ''
}

function getStarPairMeaning(starKey: string, pairStr: string, locale: string): string {
  const localeData = STAR_TEXT_MAP[locale]?.[starKey]
  if (localeData?.pairMeanings?.[pairStr]) return localeData.pairMeanings[pairStr]
  return FIELDS[starKey]?.pairMeanings?.[pairStr] || ''
}

const FIELD_ORDER = ['fuwei','tianyi','shengqi','yannian','liusha','jueming','huohai','wugui']

const numToField: Record<number, string> = {}
for (const [k, f] of Object.entries(FIELDS)) for (const n of f.numbers) numToField[n] = k

const TYPE_STYLE: Record<string, string> = { '吉':'bg-gold-500/15 text-gold-600 border-gold-500/30', '凶':'bg-gold-500/10 text-gold-600 border-gold-500/25', '平':'bg-dark-700 text-gray-500 border-dark-600', '次吉':'bg-gold-500/10 text-gold-600 border-gold-500/25', '大吉':'bg-gold-500/15 text-gold-600 border-gold-500/30', '次凶':'bg-gold-500/5 text-gold-600/80 border-gold-500/20', '大凶':'bg-gold-500/15 text-gold-700 border-gold-700/30', '小吉':'bg-gold-500/5 text-gold-600 border-gold-500/20' }

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
  const { locale } = useLocale()
  const getT = useT()

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
      segments.push({ pair, position: i + 1, fieldKey: fk || '', fieldName: f ? tName(fk, locale) : '', fieldType: f?.type || '' })
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
    let overall = getT('shumaPage.overallScore')
    if (locale === 'en') {
      overall = score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : score >= 25 ? 'Below Average' : 'Needs Attention'
    } else if (locale === 'ja') {
      overall = score >= 75 ? '上等' : score >= 60 ? '中上' : score >= 40 ? '中等' : score >= 25 ? '中下' : '要注意'
    } else if (locale === 'ko') {
      overall = score >= 75 ? '상등' : score >= 60 ? '중상' : score >= 40 ? '중등' : score >= 25 ? '중하' : '주의 필요'
    } else {
      overall = score >= 75 ? '上等号码' : score >= 60 ? '中上号码' : score >= 40 ? '中等号码' : score >= 25 ? '中下号码' : '需要注意'
    }

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
      if (fk) {
        const txt = getStarPairMeaning(fk, String(pair), locale)
        if (txt) pairAnalyses.push({ pair, text: txt })
      }
    }

    const tail4 = digits.slice(-4)
    const tailPairs = [parseInt(tail4.slice(0,2)), parseInt(tail4.slice(1,3)), parseInt(tail4.slice(2,4))]
    const tailFields = tailPairs.map(p => numToField[p]).filter(Boolean)
    const tailNames = tailFields.map(k => tName(k, locale)).filter(Boolean)

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
  }, [phone, locale, getT])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{getT('shumaPage.title')}</h1>
      <p className="text-gray-400 mb-6">{getT('shumaPage.desc')}</p>

      {/* 输入 */}
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-6">
        <div className="flex gap-2">
          <input type="text" value={phone} onChange={e => setPhone(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,18))}
            placeholder={getT('shumaPage.inputPlaceholder')}
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 font-mono text-lg tracking-widest" maxLength={18} />
          <button onClick={doAnalyze}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95 whitespace-nowrap">{getT('shumaPage.analyzeBtn')}</button>
        </div>
      </div>

      {/* 八星对照表 + 七星排列 */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 text-center">{getT('shumaPage.chartTitle')}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {FIELD_ORDER.map(fk => {
              const f = FIELDS[fk]
              return (
              <div key={fk} className="text-center">
                <p className="text-[11px] font-semibold mb-1" style={{color: f.color}}>{tName(fk, locale)}</p>
                <div className="flex flex-wrap justify-center gap-[1px]">
                  {f.numbers.map(n => (
                    <button key={n} onClick={() => setSelectedField(selectedField === fk ? null : fk)}
                      className="text-[11px] w-[28px] h-6 flex items-center justify-center rounded-sm bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors">{n}</button>
                  ))}
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* 七星排列 */}
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 text-center">{getT('shumaPage.star7Title')}</h3>
          <div className="grid grid-cols-7 gap-1">
            {STAR7.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-[11px] font-serif mb-1 ${i===4||i===6?'text-gold-600':i===5?'text-gold-500':'text-gold-600'}`}>{s.name.split('·')[0]}</div>
                <div className={`text-[10px] px-1 py-0.5 rounded ${TYPE_STYLE[s.level] || 'bg-dark-700'}`}>{tName(
                  Object.entries(FIELDS).find(([,v]) => v.name === s.field)?.[0] || '',
                  locale
                )}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">{s.wx}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中磁场详解 */}
      {selectedField && FIELDS[selectedField] && (
        <div className="bg-dark-800/80 rounded-xl border p-5 mb-6" style={{borderColor: FIELDS[selectedField].color + '40'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold font-serif" style={{color: FIELDS[selectedField].color}}>{tName(selectedField, locale)}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_STYLE[FIELDS[selectedField].type] || ''}`}>{tType(FIELDS[selectedField].type, locale)}</span>
            <span className="text-[11px] text-gray-500">{getStarTextField(selectedField, 'description', locale) ? '' : ''}{FIELDS[selectedField].star7}</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">{getT('shumaPage.digit')}：{FIELDS[selectedField].numbers.join('、')}</p>
          <p className="text-xs text-gray-400 mb-1">{getStarTextField(selectedField, 'description', locale)}</p>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{getStarTextField(selectedField, 'detail', locale)}</p>
          <button onClick={() => setSelectedField(null)} className="text-[10px] text-gray-500 mt-2 hover:text-gray-300">{getT('shumaPage.close')}</button>
        </div>
      )}

      {/* 分析结果 */}
      {result && result.segments && (
        <div className="space-y-4">
          {/* 综合评分 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">{getT('shumaPage.overallScore')}</p>
            <p className={`text-4xl font-bold ${result.score >= 60 ? 'text-gold-600' : result.score >= 40 ? 'text-gold-500' : 'text-gold-600'}`}>{result.score}</p>
            <p className={`text-sm mt-1 font-semibold ${result.score >= 60 ? 'text-gold-600' : result.score >= 40 ? 'text-gold-500' : 'text-gold-600'}`}>{result.overall}</p>
          </div>

          {/* 号码分段 & 组合解析 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">{getT('shumaPage.pairAnalysis')}</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-dark-600">
                  <th className="py-1 pr-2 text-left">{getT('shumaPage.position')}</th><th className="py-1 px-2 text-left">{getT('shumaPage.digit')}</th><th className="py-1 px-2 text-left">{getT('shumaPage.field')}</th><th className="py-1 pl-2 text-left">{getT('shumaPage.luck')}</th>
                </tr></thead>
                <tbody>
                  {result.segments.map((s, i: number) => (
                    <tr key={i} className="border-b border-dark-700/50">
                      <td className="py-1 pr-2 text-gray-500">{getT('shumaPage.positionFmt').replace('{pos}', String(s.position)).replace('{pos2}', String(s.position+1))}</td>
                      <td className="py-1 px-2 font-mono text-gray-200">{String(s.pair).padStart(2,'0')}</td>
                      <td className="py-1 px-2" style={s.fieldKey ? {color: FIELDS[s.fieldKey]?.color} : {}}>{tName(s.fieldKey, locale)}</td>
                      <td className="py-1 pl-2">{s.fieldType && <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_STYLE[s.fieldType] || 'bg-dark-700 text-gray-400'}`}>{tType(s.fieldType, locale)}</span>}</td>
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
            <div className="bg-dark-800/80 rounded-xl border border-gold-500/30 p-5">
              <h3 className="text-sm font-semibold text-gold-300 mb-2">{getT('shumaPage.mainField')}</h3>
              <p className="text-xs text-gray-400 mb-2">{tName(result.dominantField, locale)} · {getStarTextField(result.dominantField, 'description', locale)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-[10px] text-gold-600 mb-1">{getT('shumaPage.strengths')}</p>
                  <p className="text-[11px] text-gray-300">{getStarTextField(result.dominantField, 'strengths', locale)}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-[10px] text-gold-600 mb-1">{getT('shumaPage.weaknesses')}</p>
                  <p className="text-[11px] text-gray-300">{getStarTextField(result.dominantField, 'weaknesses', locale)}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                <p className="text-[10px] text-gray-400">{getT('shumaPage.personality')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'personality', locale)}</span></p>
                <p className="text-[10px] text-gray-400">{getT('shumaPage.wealth')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'wealth', locale)}</span></p>
                <p className="text-[10px] text-gray-400">{getT('shumaPage.feelings')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'feelings', locale)}</span></p>
                <p className="text-[10px] text-gray-400">{getT('shumaPage.marriage')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'marriage', locale)}</span></p>
                <p className="text-[10px] text-gray-400">{getT('shumaPage.health')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'health', locale)}</span></p>
                <p className="text-[10px] text-gray-400">{getT('shumaPage.career')}：<span className="text-gray-300">{getStarTextField(result.dominantField, 'career', locale)}</span></p>
              </div>
            </div>
          )}

          {/* 对应七星排列 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">{getT('shumaPage.star7Corr')}</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {result.star7Results.map((s, i: number) => (
                <div key={i} className={`text-center p-1.5 rounded-lg border ${s.count > 0 ? 'border-gold-500/50 bg-gold-900/10' : 'border-dark-600 bg-dark-700'}`}>
                  <div className="text-[10px] text-gray-500">{s.name.split('·')[0]}</div>
                  <div className={`text-[11px] font-semibold ${s.count > 0 ? 'text-gold-300' : 'text-gray-600'} font-serif`}>{tName(
                    Object.entries(FIELDS).find(([,v]) => v.name === s.field)?.[0] || '', locale
                  )}</div>
                  <div className={`text-[10px] mt-0.5 px-1 rounded ${TYPE_STYLE[s.level] || 'bg-dark-600'}`}>{tLevel(s.level, locale)}</div>
                  <div className="text-[10px] text-gray-500">{s.wx}</div>
                  {s.count > 0 && <div className="text-[9px] text-gold-400 font-bold mt-0.5">{s.count}{locale === 'en' ? 'x' : '次'}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 号码八星统计 */}
          <h3 className="text-sm font-semibold text-gray-200 mb-3">{getT('shumaPage.fieldStats')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FIELD_ORDER.map(fk => {
              const f = FIELDS[fk]
              const cnt = result.fieldCounts[fk] || 0
              return (
                <button key={fk} onClick={() => setSelectedField(selectedField === fk ? null : fk)}
                  className="bg-dark-800/80 rounded-lg border border-dark-600 p-3 text-center hover:border-gold-500/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold" style={{color: f.color}}>{tName(fk, locale)}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded ${TYPE_STYLE[f.type] || ''}`}>{tType(f.type, locale)}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{cnt}<span className="text-xs text-gray-500">{locale === 'en' ? '' : '次'}</span></p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
