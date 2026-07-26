import json

with open('src/data/xueguan/books.ts', 'r') as f:
    content = f.read()

# New books as a JSON array (more reliable than Python heredoc)
new_books_json = '''
[
  {
    "id": "huangdi-neijing-yunqi",
    "title": "黄帝内经\u00b7素问（运气七篇）",
    "author": "托名黄帝",
    "dynasty": "战国\u00b7汉",
    "category": "yiyi-wuyun",
    "summary": "五运六气理论之祖，中医数理最高经典",
    "description": "《黄帝内经\u00b7素问》运气七篇，包括《天元纪大论》《五运行大论》《六微旨大论》《气交变大论》《五常政大论》《六元正纪大论》《至真要大论》，是中国古代五运六气理论最核心的经典文献。以天干地支、五行生克、六气司天在泉等概念构建气运推演体系，是医易同源最直接的体现。",
    "keywords": ["五运六气", "司天在泉", "气交变", "医易同源"],
    "volumes": "七篇",
    "isComplete": false,
    "estimatedChars": 50000,
    "order": 1,
    "related": ["zhouyi", "baopu-zi"]
  },
  {
    "id": "sanyin-sitian",
    "title": "三因司天方",
    "author": "陈无择",
    "dynasty": "宋",
    "category": "yiyi-wuyun",
    "summary": "宋代运气方剂学经典",
    "description": "《三因司天方》南宋陈无择著，将五运六气理论应用于方剂学。根据每年岁运、司天在泉制定治疗方剂，是运气学说临床化的里程碑。",
    "keywords": ["陈无择", "司天方", "运气方剂"],
    "volumes": "两卷",
    "isComplete": false,
    "estimatedChars": 25000,
    "order": 2,
    "related": ["huangdi-neijing-yunqi"]
  },
  {
    "id": "yunqi-yilan",
    "title": "运气易览",
    "author": "汪机",
    "dynasty": "明",
    "category": "yiyi-wuyun",
    "summary": "明代五运六气入门经典",
    "description": "《运气易览》明代汪机著，以通俗语言阐释五运六气基本原理和推算方法。包括干支化运、主气客气、司天在泉、运气相合等核心概念。",
    "keywords": ["汪机", "运气入门", "干支化运"],
    "volumes": "六卷",
    "isComplete": false,
    "estimatedChars": 40000,
    "order": 3,
    "related": ["huangdi-neijing-yunqi", "sanyin-sitian"]
  },
  {
    "id": "yuhan-jing",
    "title": "玉函经",
    "author": "杜光庭",
    "dynasty": "唐\u00b7五代",
    "category": "yiyi-jingdian",
    "summary": "唐代脉学命理经典",
    "description": "《玉函经》唐末五代道士杜光庭著，将脉学与命理结合。以寸关尺三部脉象为基础，结合五行生克与八卦方位，推断健康、寿命和命运走势。体现易医同源的深层次融合。",
    "keywords": ["杜光庭", "脉学命理", "医易", "寸关尺"],
    "volumes": "三卷",
    "isComplete": false,
    "estimatedChars": 20000,
    "order": 1,
    "related": ["huangdi-neijing-yunqi"]
  },
  {
    "id": "lingqi-jing",
    "title": "灵棋经",
    "author": "东方朔（传）",
    "dynasty": "汉",
    "category": "bushi-yijing",
    "summary": "以棋占卜的独特体系",
    "description": "《灵棋经》以十二枚棋子投掷成卦，得一百二十五卦。不同于周易六十四卦体系，唐宋时期极为流行，明代永乐大典收录。",
    "keywords": ["棋占", "东方朔", "百二十五卦"],
    "volumes": "两卷",
    "isComplete": false,
    "estimatedChars": 30000,
    "order": 6,
    "related": ["zhouyi"]
  },
  {
    "id": "gui-jing",
    "title": "龟经（龟卜法）",
    "author": "佚名",
    "dynasty": "历代",
    "category": "bushi-yijing",
    "summary": "古代龟卜之法",
    "description": "龟卜是中国最古老的占卜方式，甲骨文即殷商龟卜记录。《龟经》汇集历代龟卜要诀，包括选龟、钻灼、辨兆、断吉凶等完整流程。",
    "keywords": ["龟卜", "甲骨", "灼兆", "占卜源流"],
    "volumes": "一卷",
    "isComplete": false,
    "estimatedChars": 10000,
    "order": 7,
    "related": ["zhouyi"]
  },
  {
    "id": "kaiyuan-zhanjing",
    "title": "开元占经",
    "author": "瞿昙悉达",
    "dynasty": "唐",
    "category": "bushi-yijing",
    "summary": "唐代天文占星大百科全书",
    "description": "《开元占经》唐代瞿昙悉达奉敕编纂，120卷巨制。系统辑录唐代以前各家星占学说，包括天体运行、星宿分野、日月五星占、彗星占、云气占等。引用大量已失传的先秦至隋代天文占星文献。",
    "keywords": ["瞿昙悉达", "天文占星", "星宿分野", "唐代天文学"],
    "volumes": "一百二十卷",
    "isComplete": false,
    "estimatedChars": 500000,
    "order": 8,
    "related": ["yisi-zhan", "guanxiang-wanzhan"]
  },
  {
    "id": "yisi-zhan",
    "title": "乙巳占",
    "author": "李淳风",
    "dynasty": "唐",
    "category": "bushi-yijing",
    "summary": "唐代天文学家李淳风天文占星名著",
    "description": "《乙巳占》唐代李淳风著，综合星占、云气占、风角占。李淳风是唐代最杰出天文学家，制作浑天仪。对后世影响深远。",
    "keywords": ["李淳风", "天文占星", "星占", "浑天仪"],
    "volumes": "十卷",
    "isComplete": false,
    "estimatedChars": 60000,
    "order": 9,
    "related": ["kaiyuan-zhanjing", "guanxiang-wanzhan"]
  },
  {
    "id": "guanxiang-wanzhan",
    "title": "观象玩占",
    "author": "诸葛亮（传）",
    "dynasty": "明",
    "category": "bushi-yijing",
    "summary": "托名诸葛亮的综合占星书",
    "description": "《观象玩占》明代刊行、托名诸葛亮撰。以星宿分野、云气风角、日月五星之变为主要内容，论述天文现象与人间吉凶的对应关系。",
    "keywords": ["诸葛亮", "星宿分野", "占星", "云气"],
    "volumes": "八卷",
    "isComplete": false,
    "estimatedChars": 80000,
    "order": 10,
    "related": ["yisi-zhan", "kaiyuan-zhanjing"]
  },
  {
    "id": "wuxing-dayi",
    "title": "五行大义",
    "author": "萧吉",
    "dynasty": "隋",
    "category": "zashu-shuma",
    "summary": "隋代五行哲学集大成",
    "description": "《五行大义》隋代萧吉著，最系统最全面的五行哲学著作。涵盖干支、纳音、八卦、六甲、九宫、律历、洪范等所有传统数术理论基础。日本学者推崇为理解中国术数哲学必读经典。",
    "keywords": ["萧吉", "五行", "阴阳", "数理哲学"],
    "volumes": "五卷",
    "isComplete": false,
    "estimatedChars": 60000,
    "order": 3,
    "related": ["yuanhai-zipping", "hetu-luoshu"]
  },
  {
    "id": "yanqin-tongzuan",
    "title": "演禽通纂",
    "author": "佚名",
    "dynasty": "明",
    "category": "zashu-shengxiao",
    "summary": "以二十八宿禽星配生肖论命",
    "description": "《演禽通纂》演禽术集大成之作。以二十八宿配禽兽，结合出生年月日时推算命运。融合天文星宿、生肖民俗和五行数理。",
    "keywords": ["演禽", "二十八宿", "禽星", "生肖"],
    "volumes": "六卷",
    "isComplete": false,
    "estimatedChars": 40000,
    "order": 2,
    "related": ["xingxue-dacheng", "shengxiao-wenhua"]
  },
  {
    "id": "zhonglv-chuandao",
    "title": "钟吕传道集",
    "author": "施肩吾（辑）",
    "dynasty": "唐\u00b7五代",
    "category": "daojia-danding",
    "summary": "钟离权与吕洞宾师徒问答",
    "description": "《钟吕传道集》辑录钟离权传道于吕洞宾的对话，以问答形式系统阐述内丹修炼核心理论，包括真仙、大道、天地、日月、四时、五行、水火、龙虎、丹药、铅汞等十九论。",
    "keywords": ["钟离权", "吕洞宾", "内丹", "十九论"],
    "volumes": "一卷",
    "isComplete": false,
    "estimatedChars": 20000,
    "order": 8,
    "related": ["wuzhen-pian", "zhouyi-cantongqi"]
  },
  {
    "id": "wuzhen-pian",
    "title": "悟真篇",
    "author": "张伯端",
    "dynasty": "宋",
    "category": "daojia-danding",
    "summary": "紫阳真人内丹名著",
    "description": "《悟真篇》北宋张伯端（紫阳真人）著，与《周易参同契》并称丹经双璧。以诗词形式阐述金丹大道。道教南宗内丹派根本经典。",
    "keywords": ["张伯端", "紫阳", "金丹", "南宗"],
    "volumes": "三卷",
    "isComplete": false,
    "estimatedChars": 15000,
    "order": 9,
    "related": ["zhonglv-chuandao", "zhouyi-cantongqi"]
  },
  {
    "id": "xingming-guizhi",
    "title": "性命圭旨",
    "author": "尹真人（传）",
    "dynasty": "明",
    "category": "daojia-danding",
    "summary": "明代内丹修炼名著",
    "description": "《性命圭旨》明代托名尹真人著，以九节功法系统论述性命双修理。从筑基炼己到炼精化炁、炼炁化神、炼神还虚，完整呈现内丹修炼全过程。配有大量图示。",
    "keywords": ["性命双修", "内丹", "九节功法"],
    "volumes": "四卷",
    "isComplete": false,
    "estimatedChars": 50000,
    "order": 10,
    "related": ["wuzhen-pian", "zhonglv-chuandao"]
  },
  {
    "id": "golden-dawn",
    "title": "The Golden Dawn（金色曙光体系）",
    "author": "S.L. MacGregor Mathers",
    "dynasty": "1888年",
    "category": "western-occult",
    "summary": "19世纪最著名神秘学组织体系",
    "description": "金色曙光（Hermetic Order of the Golden Dawn）是19世纪末最具影响力的神秘学组织。融合卡巴拉、塔罗、炼金术、占星术和仪式魔法。是现代西方神秘学的核心参考体系。",
    "keywords": ["金色曙光", "仪式魔法", "卡巴拉", "塔罗"],
    "volumes": "多卷本",
    "isComplete": false,
    "estimatedChars": 150000,
    "order": 4,
    "related": ["three-books-occult", "rider-waite-tarot"]
  },
  {
    "id": "key-of-solomon",
    "title": "The Key of Solomon（所罗门之钥）",
    "author": "托名所罗门王",
    "dynasty": "14-15世纪",
    "category": "western-occult",
    "summary": "西方仪式魔法最重要经典",
    "description": "《所罗门之钥》西方仪式魔法传统中最著名的魔法书。详细描述魔法工具制作、魔法圆绘制、行星小时计算和精灵召唤程序。中世纪和文艺复兴时期魔法实践标准参考。",
    "keywords": ["所罗门", "魔法书", "仪式魔法", "grimoire"],
    "volumes": "两卷",
    "isComplete": false,
    "estimatedChars": 60000,
    "order": 5,
    "related": ["golden-dawn", "three-books-occult"]
  }
]
'''

new_books = json.loads(new_books_json)

def ts_val(v):
    if isinstance(v, str):
        return f"'{v.replace(chr(39), chr(92) + chr(39))}'"
    elif isinstance(v, bool):
        return str(v).lower()
    elif isinstance(v, list):
        items = ", ".join(ts_val(x) for x in v)
        return f"[{items}]"
    else:
        return str(v)

def book_to_ts(book):
    lines = ["  {"]
    for f in ['id', 'title', 'author', 'dynasty', 'category', 'summary', 'description',
              'keywords', 'volumes', 'isComplete', 'estimatedChars', 'order', 'related']:
        if f in book and book[f] is not None:
            lines.append(f"    {f}: {ts_val(book[f])},")
    lines.append("  },")
    return '\n'.join(lines)

ts_entries = '\n'.join(book_to_ts(b) for b in new_books)

# Insert before the last closing `]` of the array
# Find the last `\n]\n` that's before `export function`
func_pos = content.rfind('export function')
last_close = content.rfind('\n]\n', 0, func_pos)

if last_close > 0:
    header = '\n\n  // ============================================================\n  // 新增补遗（第二轮 \u00b7 易医运气+杂占+道家+西方 \u00b7 16部）\n  // ============================================================\n\n'
    content = content[:last_close] + ',' + header + ts_entries + '\n' + content[last_close+1:]
    print(f"Inserted {len(new_books)} new books successfully")
else:
    print("ERROR: could not find array close")

with open('src/data/xueguan/books.ts', 'w') as f:
    f.write(content)
print("Done")
