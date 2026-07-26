import re

with open('src/data/xueguan/books.ts', 'r') as f:
    content = f.read()

# Find the utility functions section
pos = content.rfind('// ============================================================\n// 工具函数')

new_books = '''
  // ============================================================
  // 新增补遗（第一轮扩展）
  // ============================================================

  // ===== 命理 - 八字 =====
  {
    id: 'wuxing-jingji',
    title: '五行精纪',
    author: '廖中',
    dynasty: '宋',
    category: 'mingli-bazi',
    summary: '宋代命理文献汇编，保存了大量早期命理口诀与古法',
    description: '《五行精纪》南宋廖中编撰，是编纂体例最严谨的宋代命理文献总集。书中引用了《珞琭子》《李虚中》《玉照定真经》《天元秀气》等大量唐宋命理著作，其中不少原书已佚，赖此书得以保存片段。全书以干支五行、纳音、神煞为纲，是研究唐代至宋代命理学演变的桥梁文献。',
    keywords: ['宋代', '文献汇编', '纳音', '神煞', '古法'],
    volumes: '二十四卷',
    isComplete: false,
    estimatedChars: 100000,
    order: 9,
    related: ['li-xuzhong', 'ditian-sui']
  },
  {
    id: 'li-xuzhong',
    title: '李虚中命书',
    author: '李虚中',
    dynasty: '唐',
    category: 'mingli-bazi',
    summary: '唐代命理宗师代表作，三柱法之祖',
    description: '《李虚中命书》唐李虚中著。李虚中是唐代命理学宗师，韩愈曾为其作墓志铭，称其以年月日三柱推命「百不失一二」。此书以纳音法为核心，以年柱为主、月日相参，是子平四柱法之前的命理形态的重要见证。',
    keywords: ['李虚中', '三柱', '纳音', '唐代命理'],
    volumes: '三卷',
    isComplete: false,
    estimatedChars: 25000,
    order: 10,
    related: ['wuxing-jingji', 'yuzhao-dingzhen']
  },
  {
    id: 'yuzhao-dingzhen',
    title: '玉照定真经',
    author: '郭璞（传）',
    dynasty: '晋',
    category: 'mingli-bazi',
    summary: '托名郭璞的早期命理经典',
    description: '《玉照定真经》相传为东晋郭璞撰，张顒注。以八卦配合干支五行论命之休咎，保存了早期命理与易象结合的形态。其卦象配干支的方法，对后世纳音五行和神煞体系有重要影响。',
    keywords: ['郭璞', '卦象', '干支', '早期命理'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 15000,
    order: 11,
    related: ['li-xuzhong', 'wuxing-jingji']
  },
  {
    id: 'luoluzi-sanming',
    title: '珞琭子三命消息赋',
    author: '珞琭子（传）',
    dynasty: '唐',
    category: 'mingli-bazi',
    summary: '唐代命理核心赋文，历代注家众多',
    description: '《珞琭子三命消息赋》为唐代重要命理文献，以赋体论述三命五行消息进退之理。宋代王廷光、李仝、释昙莹皆有注解。文中「消息」二字，指五行生克制化、旺衰进退之机。',
    keywords: ['消息赋', '三命', '赋文', '五行进退'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 10000,
    order: 12,
    related: ['sanming-tonghui', 'yuanhai-zipping']
  },
  {
    id: 'xingxue-dacheng',
    title: '星学大成',
    author: '万民英',
    dynasty: '明',
    category: 'mingli-bazi',
    summary: '明代五星占星命理集大成之作',
    description: '《星学大成》明代万民英编著，是五星推命术（七政四余）的集大成之作。以二十八宿、七政四余为工具，结合子平法进行综合推命。全书三十卷，广征博引，保存了大量明代以前星命文献。',
    keywords: ['万民英', '五星', '七政四余', '二十八宿', '星命'],
    volumes: '三十卷',
    isComplete: false,
    estimatedChars: 150000,
    order: 13,
    related: ['sanming-tonghui', 'guolao-xingzong']
  },
  {
    id: 'guolao-xingzong',
    title: '果老星宗',
    author: '张果（传）',
    dynasty: '唐·明',
    category: 'mingli-bazi',
    summary: '七政四余星命学核心经典',
    description: '《果老星宗》托名唐代张果老所传，实为明代星命家编纂。以七政四余分布十二宫论命，与紫微斗数有相似之处但体系不同。是研究中国星命学最重要的典籍之一。',
    keywords: ['张果', '七政四余', '星宿', '十二宫'],
    volumes: '十卷',
    isComplete: false,
    estimatedChars: 80000,
    order: 14,
    related: ['xingxue-dacheng']
  },

  // ===== 卜筮 - 扩展 =====
  {
    id: 'taiyi-shenshu',
    title: '太乙神数',
    author: '佚名',
    dynasty: '明',
    category: 'bushi-liuren',
    summary: '三式之首，推演天运国运的数理体系',
    description: '太乙神数与奇门遁甲、大六壬并称「三式」，为古天文历算与术数融合的产物。以太乙星为核心，配合九宫、八门、十六神将，推演天运国运等重大事件的变化趋势。',
    keywords: ['太乙', '三式', '天运', '国运', '九宫'],
    volumes: '十二卷',
    isComplete: false,
    estimatedChars: 60000,
    order: 4,
    related: ['qimen-dunjia-miji', 'liuren-daquan']
  },
  {
    id: 'huangjin-ce',
    title: '黄金策',
    author: '刘伯温',
    dynasty: '明',
    category: 'bushi-liuyao',
    summary: '六爻占卜第一赋文',
    description: '《黄金策》明代刘伯温著，是六爻纳甲卜筮最重要的赋文之一。全文以骈文体写成，系统地阐述了六爻断卦的核心要诀：用神元神忌神仇神之辨、旺衰生克冲合之机。',
    keywords: ['刘伯温', '赋文', '用神', '六爻要诀'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 8000,
    order: 6,
    related: ['bushi-zhengzong', 'zengshan-buyi']
  },
  {
    id: 'haidi-yan',
    title: '海底眼',
    author: '佚名',
    dynasty: '明',
    category: 'bushi-liuyao',
    summary: '六爻断卦口诀集',
    description: '《海底眼》为六爻纳甲卜筮的重要口诀集，以精炼语言概括了六爻断卦的实战诀窍。对用神、旺衰、生克、六兽等概念的实战运用做了精辟概括。',
    keywords: ['口诀', '六爻', '断卦', '实战'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 6000,
    order: 7,
    related: ['huangjin-ce', 'bushi-zhengzong']
  },
  {
    id: 'tianxuan-fu',
    title: '天玄赋',
    author: '佚名',
    dynasty: '明',
    category: 'bushi-liuyao',
    summary: '六爻占卜赋文',
    description: '《天玄赋》系六爻纳甲卜筮赋文，从起卦到断卦对六爻体系各个层面均有精要论述，是研习六爻不可不读的经典赋文。',
    keywords: ['赋文', '六爻', '起卦', '断卦'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 5000,
    order: 8,
    related: ['huangjin-ce', 'bushi-zhengzong']
  },
  {
    id: 'bushi-quanshu',
    title: '卜筮全书',
    author: '姚际隆',
    dynasty: '明',
    category: 'bushi-liuyao',
    summary: '明代六爻百科全书式著作',
    description: '《卜筮全书》明代姚际隆编撰，汇集了明代以前六爻纳甲卜筮的各类文献和口诀。涵盖起卦法、装卦法、断卦法以及三百余种占验分类。',
    keywords: ['姚际隆', '六爻汇编', '占验分类', '明代'],
    volumes: '十四卷',
    isComplete: false,
    estimatedChars: 100000,
    order: 9,
    related: ['bushi-zhengzong', 'huozhu-lin']
  },

  // ===== 风水 - 扩展 =====
  {
    id: 'xuexin-fu',
    title: '雪心赋',
    author: '卜则巍',
    dynasty: '唐',
    category: 'fengshui-xingshi',
    summary: '唐代风水形势派骈文体经典',
    description: '《雪心赋》唐代卜则巍著，以骈文赋体撰写风水要论，文辞典雅、义理精深。以形势派理论为纲，兼论理气。历代风水家多引此文为据。',
    keywords: ['卜则巍', '雪心', '形势', '骈文'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 10000,
    order: 10,
    related: ['zang-shu', 'hanlong-jing']
  },
  {
    id: 'lingcheng-jingyi',
    title: '灵城精义',
    author: '佚名',
    dynasty: '明',
    category: 'fengshui-liqi',
    summary: '明代理气派风水经典',
    description: '《灵城精义》明代刊行的理气派风水经典，以「形气合一」为核心观点，对玄空大卦、三元九运等理气理论有精辟论述。',
    keywords: ['理气', '形气', '玄空', '三元九运'],
    volumes: '两卷',
    isComplete: false,
    estimatedChars: 20000,
    order: 11,
    related: ['qingnang-aoyu', 'tianyu-jing']
  },
  {
    id: 'famwei-lun',
    title: '发微论',
    author: '蔡元定',
    dynasty: '宋',
    category: 'fengshui-xingshi',
    summary: '朱熹弟子蔡元定风水理论之作',
    description: '《发微论》南宋蔡元定著，以易理阐释风水原理，将太极、阴阳、八卦等概念系统引入风水理论。',
    keywords: ['蔡元定', '易理', '太极', '朱熹'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 12000,
    order: 12,
    related: ['zang-shu', 'xuexin-fu']
  },
  {
    id: 'ruyan-quanshu',
    title: '入地眼全书',
    author: '佚名',
    dynasty: '清',
    category: 'fengshui-zonghe',
    summary: '清代风水入门口诀式著作',
    description: '《入地眼全书》以口诀形式传授风水寻龙点穴及理气之法，对三元九运等理气知识做了口诀化处理，是清代风水入门最流行的教材之一。',
    keywords: ['口诀', '入门', '龙穴', '三元九运'],
    volumes: '四卷',
    isComplete: false,
    estimatedChars: 30000,
    order: 13,
    related: ['dili-wujue', 'bazhai-mingjing']
  },
  {
    id: 'yangzhai-sanyao',
    title: '阳宅三要',
    author: '赵廷栋',
    dynasty: '清',
    category: 'fengshui-zonghe',
    summary: '清代最权威的阳宅风水著作',
    description: '《阳宅三要》清赵廷栋著，以「门、主、灶」三要素为核心分析阳宅吉凶。三要之中，门为进气之口，主为居者之位，灶为养命之源。',
    keywords: ['阳宅', '门主灶', '赵廷栋', '居家风水'],
    volumes: '六卷',
    isComplete: false,
    estimatedChars: 50000,
    order: 14,
    related: ['bazhai-mingjing', 'dili-wujue']
  },
  {
    id: 'yangzhai-shishu',
    title: '阳宅十书',
    author: '王君荣',
    dynasty: '明',
    category: 'fengshui-zonghe',
    summary: '明代阳宅风水集大成之作',
    description: '《阳宅十书》明王君荣著，全面论述阳宅风水十个核心方面：宅外形势、宅内布局、门路灶厕、年月吉凶等。图文并茂，实用性强。',
    keywords: ['阳宅', '王君荣', '宅内布局', '明代'],
    volumes: '十卷',
    isComplete: false,
    estimatedChars: 80000,
    order: 15,
    related: ['yangzhai-sanyao', 'bazhai-mingjing']
  },

  // ===== 相术 - 扩展 =====
  {
    id: 'yuebo-dongzhong',
    title: '月波洞中记',
    author: '佚名',
    dynasty: '唐·宋',
    category: 'xiangshu-mian',
    summary: '唐代相术秘传，以神为上的相法',
    description: '《月波洞中记》为唐宋间相术秘典，以「神气骨肉」四字为纲，尤重观神之法。主张相之最高境界在观神气之清浊厚薄。',
    keywords: ['神气', '相术', '秘传', '唐宋'],
    volumes: '一卷',
    isComplete: false,
    estimatedChars: 15000,
    order: 5,
    related: ['mayi-shenxiang', 'shuijing-shenxiang']
  },
  {
    id: 'renlun-datong',
    title: '人伦大统赋',
    author: '张行简',
    dynasty: '金',
    category: 'xiangshu-mian',
    summary: '金代相术赋文，面部论相的经典',
    description: '《人伦大统赋》金代张行简著，以赋体论述面相学各方面内容。从十三部位到各器官形色，从气色到骨法，条理清晰。',
    keywords: ['张行简', '赋文', '面相', '部位'],
    volumes: '两卷',
    isComplete: false,
    estimatedChars: 20000,
    order: 6,
    related: ['mayi-shenxiang', 'xiangli-hengzhen']
  },
  {
    id: 'yuquan-zhaoshen',
    title: '玉管照神局',
    author: '佚名',
    dynasty: '宋',
    category: 'xiangshu-mian',
    summary: '宋代相术名著',
    description: '《玉管照神局》宋代相术著作，以五行将人的面相分为五大类型，每一类型又有正局和偏局之分。',
    keywords: ['五行面相', '分类', '宋代', '正偏局'],
    volumes: '两卷',
    isComplete: false,
    estimatedChars: 18000,
    order: 7,
    related: ['mayi-shenxiang', 'renlun-datong']
  },
  {
    id: 'taiqing-shenjian',
    title: '太清神鉴',
    author: '王朴',
    dynasty: '五代·后周',
    category: 'xiangshu-mian',
    summary: '五代相术杰作，四库收录',
    description: '《太清神鉴》后周王朴著，被清代《四库全书》收录。以「清奇古怪」四字分类骨相，对气色、神韵的观察尤为精微。',
    keywords: ['王朴', '四库全书', '清奇古怪', '骨相'],
    volumes: '六卷',
    isComplete: false,
    estimatedChars: 30000,
    order: 8,
    related: ['mayi-shenxiang', 'yuebo-dongzhong']
  },

  // ===== 道家 - 扩展 =====
  {
    id: 'baopu-zi',
    title: '抱朴子',
    author: '葛洪',
    dynasty: '晋',
    category: 'daojia-danding',
    summary: '东晋葛洪仙学巨著',
    description: '《抱朴子》东晋葛洪著，分内篇二十卷与外篇五十卷。内篇专论神仙、炼丹、符箓、养生等道家仙学内容，是研究中国古代炼丹术最重要的文献。',
    keywords: ['葛洪', '炼丹', '神仙', '养生', '仙学'],
    volumes: '内篇二十卷·外篇五十卷',
    isComplete: false,
    estimatedChars: 120000,
    order: 6,
    related: ['daode-jing', 'zhouyi-cantongqi']
  },
  {
    id: 'lie-zi',
    title: '列子',
    author: '列御寇',
    dynasty: '战国',
    category: 'daojia-jingdian',
    summary: '道家经典，寓言瑰丽',
    description: '《列子》战国列御寇著，书中「愚公移山」「杞人忧天」等寓言已融入中国文化基因。是道家重要经典之一。',
    keywords: ['列御寇', '寓言', '道家'],
    volumes: '八卷',
    isComplete: false,
    estimatedChars: 40000,
    order: 7,
    related: ['daode-jing', 'zhuangzi']
  },
  {
    id: 'huangting-jing',
    title: '黄庭经',
    author: '魏华存（传）',
    dynasty: '晋',
    category: 'daojia-danding',
    summary: '道教内丹修炼第一经典',
    description: '《黄庭经》为道教上清派核心经典。以人体五脏六腑为「黄庭」，论述存思内视、炼养精气的修炼方法。是道教内丹术最重要的理论源头之一。',
    keywords: ['黄庭', '内丹', '上清派', '存思'],
    volumes: '两卷',
    isComplete: false,
    estimatedChars: 10000,
    order: 7,
    related: ['daode-jing', 'zhouyi-cantongqi']
  },
  {
    id: 'wen-zi',
    title: '文子',
    author: '文子（传）',
    dynasty: '战国·汉',
    category: 'daojia-jingdian',
    summary: '老子弟子文子所著',
    description: '《文子》相传为老子弟子文子所著，是道家由哲学向治国术转变的重要著作。1973年河北定县汉墓出土了《文子》竹简。',
    keywords: ['文子', '道家政治', '竹简'],
    volumes: '十二卷',
    isComplete: false,
    estimatedChars: 30000,
    order: 8,
    related: ['daode-jing', 'zhuangzi']
  },

  // ===== 西方 - 扩展 =====
  {
    id: 'corpus-hermeticum',
    title: 'Corpus Hermeticum（赫尔墨斯文集）',
    author: 'Hermes Trismegistus（传）',
    dynasty: '公元1-3世纪',
    category: 'western-occult',
    summary: '西方神秘学之源',
    description: '《赫尔墨斯文集》相传为三倍伟大的赫尔墨斯所著，成书于公元1-3世纪。以对话体阐述宇宙灵性本质。包括著名的「翡翠石板」，提出了「上界如此，下界亦如此」的宇宙对应法则。是西方炼金术、占星术和神秘学的共同源头。',
    keywords: ['赫尔墨斯', '翡翠石板', '神秘学', '炼金术'],
    volumes: '十八卷（存十四卷）',
    isComplete: false,
    estimatedChars: 50000,
    order: 2,
    related: ['tetrabiblos', 'rider-waite-tarot']
  },
  {
    id: 'three-books-occult',
    title: 'De Occulta Philosophia（神秘哲学三书）',
    author: 'Heinrich Cornelius Agrippa',
    dynasty: '1533年',
    category: 'western-occult',
    summary: '文艺复兴最重要神秘学百科全书',
    description: '阿格里帕的《神秘哲学三书》是文艺复兴时期最重要、影响最深远的西方神秘学百科全书。三书分别论述自然魔法、天界魔法和神圣魔法，系统整合了古希腊罗马神秘学、犹太卡巴拉、阿拉伯占星术等传统。',
    keywords: ['Agrippa', '神秘学', '卡巴拉', '自然魔法'],
    volumes: '三卷',
    isComplete: false,
    estimatedChars: 120000,
    order: 3,
    related: ['corpus-hermeticum', 'tetrabiblos']
  },
]

content = content[:pos] + new_books + '\n' + content[pos:]

with open('src/data/xueguan/books.ts', 'w') as f:
    f.write(content)

# Count new books
count = new_books.count("  {\n    id:")
print(f"Successfully added {count} new books to catalog")
PYEOF