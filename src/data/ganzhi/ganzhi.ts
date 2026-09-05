// 干支百科数据——十天干 + 十二地支（术数桥梁实体：八字/奇门/六壬/择日通用）
export interface GanzhiEntry {
  id: string          // 干支字
  kind: 'tian' | 'di' // 天干/地支
  wuxing: string      // 五行
  yinyang: '阳' | '阴'
  meaning: string     // 本义/象
  direction: string   // 方位
  season: string      // 季节
  month?: string      // 对应月份（地支）
  hour?: string       // 对应时辰（地支）
  zodiac?: string     // 生肖（地支）
  canggan?: string    // 藏干（地支）
  body?: string       // 对应脏腑/身体
  classImage: string[] // 类象（万物类象精选）
  wangxiu: string     // 旺相休囚（简）
  relation: string[]  // 关联术数领域
}

export const TIAN_GAN: GanzhiEntry[] = [
  { id: '甲', kind: 'tian', wuxing: '木', yinyang: '阳', meaning: '草木破土萌生之象——栋梁之木', direction: '东', season: '春', classImage: ['参天大树', '栋梁', '首领', '仁德', '青龙'], wangxiu: '春旺', relation: ['八字十神', '奇门三奇', '纳甲'] },
  { id: '乙', kind: 'tian', wuxing: '木', yinyang: '阴', meaning: '草木屈曲生长——花草藤蔓之木', direction: '东', season: '春', classImage: ['花草', '藤萝', '秀气', '柔韧', '文雅'], wangxiu: '春旺', relation: ['八字十神', '奇门三奇', '纳甲'] },
  { id: '丙', kind: 'tian', wuxing: '火', yinyang: '阳', meaning: '太阳之火——光明炽烈', direction: '南', season: '夏', classImage: ['太阳', '烈火', '光明', '热情', '朱雀'], wangxiu: '夏旺', relation: ['八字调候', '奇门三奇', '纳甲'] },
  { id: '丁', kind: 'tian', wuxing: '火', yinyang: '阴', meaning: '灯烛之火——星火内明', direction: '南', season: '夏', classImage: ['灯烛', '星火', '文明', '细腻', '希望'], wangxiu: '夏旺', relation: ['八字调候', '奇门三奇', '纳甲'] },
  { id: '戊', kind: 'tian', wuxing: '土', yinyang: '阳', meaning: '高山厚土——城墙之土', direction: '中', season: '四季', classImage: ['高山', '城墙', '堤岸', '厚重', '诚信'], wangxiu: '四季旺', relation: ['八字', '奇门', '风水'] },
  { id: '己', kind: 'tian', wuxing: '土', yinyang: '阴', meaning: '田园之土——滋养万物', direction: '中', season: '四季', classImage: ['田园', '沃土', '包容', '滋养', '谦和'], wangxiu: '四季旺', relation: ['八字', '奇门', '风水'] },
  { id: '庚', kind: 'tian', wuxing: '金', yinyang: '阳', meaning: '刀剑之金——肃杀刚健', direction: '西', season: '秋', classImage: ['刀剑', '钢铁', '变革', '果断', '白虎'], wangxiu: '秋旺', relation: ['八字十神', '奇门', '纳甲'] },
  { id: '辛', kind: 'tian', wuxing: '金', yinyang: '阴', meaning: '珠玉之金——精致贵重', direction: '西', season: '秋', classImage: ['珠玉', '首饰', '精致', '锐利内敛', '义气'], wangxiu: '秋旺', relation: ['八字十神', '奇门', '纳甲'] },
  { id: '壬', kind: 'tian', wuxing: '水', yinyang: '阳', meaning: '江海之水——浩荡奔流', direction: '北', season: '冬', classImage: ['江海', '大河', '智慧', '流动', '玄武'], wangxiu: '冬旺', relation: ['八字', '奇门', '六壬'] },
  { id: '癸', kind: 'tian', wuxing: '水', yinyang: '阴', meaning: '雨露之水——润物无声', direction: '北', season: '冬', classImage: ['雨露', '泉水', '智谋', '柔和', '含蓄'], wangxiu: '冬旺', relation: ['八字', '奇门', '六壬'] },
]

export const DI_ZHI: GanzhiEntry[] = [
  { id: '子', kind: 'di', wuxing: '水', yinyang: '阳', meaning: '孳生之始——子夜', direction: '北', season: '冬', month: '十一月', hour: '23:00-1:00', zodiac: '鼠', canggan: '癸', body: '肾/膀胱/耳', classImage: ['江河', '智慧', '暗昧', '文书', '盗贼(类象)'], wangxiu: '冬旺', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '丑', kind: 'di', wuxing: '土', yinyang: '阴', meaning: '纽芽——寒气未尽', direction: '东北', season: '冬末', month: '十二月', hour: '1:00-3:00', zodiac: '牛', canggan: '己癸辛', body: '脾/腹', classImage: ['田园', '牛', '仓库', '寒土', '贵人(丑未)'], wangxiu: '冬末', relation: ['八字地支', '奇门', '六壬', '生肖'] },
  { id: '寅', kind: 'di', wuxing: '木', yinyang: '阳', meaning: '万物始生——引动', direction: '东北', season: '春', month: '正月', hour: '3:00-5:00', zodiac: '虎', canggan: '甲丙戊', body: '胆/筋', classImage: ['山林', '虎', '功曹', '文书', '官员'], wangxiu: '春旺', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '卯', kind: 'di', wuxing: '木', yinyang: '阴', meaning: '万物茂盛——门户', direction: '东', season: '春', month: '二月', hour: '5:00-7:00', zodiac: '兔', canggan: '乙', body: '肝/目', classImage: ['花木', '兔', '门户', '车船', '震宫'], wangxiu: '春旺', relation: ['八字地支', '奇门', '六壬', '生肖'] },
  { id: '辰', kind: 'di', wuxing: '土', yinyang: '阳', meaning: '万物舒展——水库', direction: '东南', season: '春末', month: '三月', hour: '7:00-9:00', zodiac: '龙', canggan: '戊乙癸', body: '胃/肩', classImage: ['水库', '龙', '湿土', '天罡', '牢狱(类象)'], wangxiu: '春末', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '巳', kind: 'di', wuxing: '火', yinyang: '阴', meaning: '阳气已盛——火炉', direction: '东南', season: '夏', month: '四月', hour: '9:00-11:00', zodiac: '蛇', canggan: '丙庚戊', body: '心/小肠', classImage: ['炉火', '蛇', '太乙', '文书', '驿马(类象)'], wangxiu: '夏旺', relation: ['八字地支', '奇门', '六壬', '生肖'] },
  { id: '午', kind: 'di', wuxing: '火', yinyang: '阳', meaning: '万物极盛——正午', direction: '南', season: '夏', month: '五月', hour: '11:00-13:00', zodiac: '马', canggan: '丁己', body: '心/小肠/目', classImage: ['正阳', '马', '烽火', '离宫', '文书'], wangxiu: '夏旺', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '未', kind: 'di', wuxing: '土', yinyang: '阴', meaning: '万物皆成——木库', direction: '西南', season: '夏末', month: '六月', hour: '13:00-15:00', zodiac: '羊', canggan: '己丁乙', body: '脾/胃', classImage: ['田园', '羊', '小吉', '酒食', '宴会'], wangxiu: '夏末', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '申', kind: 'di', wuxing: '金', yinyang: '阳', meaning: '万物体成——金猴', direction: '西南', season: '秋', month: '七月', hour: '15:00-17:00', zodiac: '猴', canggan: '庚壬戊', body: '大肠/肺', classImage: ['金器', '猴', '传送', '道路', '行移'], wangxiu: '秋旺', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '酉', kind: 'di', wuxing: '金', yinyang: '阴', meaning: '万物成熟——门户', direction: '西', season: '秋', month: '八月', hour: '17:00-19:00', zodiac: '鸡', canggan: '辛', body: '肺/鼻', classImage: ['珠玉', '鸡', '从魁', '酒色', '兑宫'], wangxiu: '秋旺', relation: ['八字地支', '奇门', '六壬', '生肖'] },
  { id: '戌', kind: 'di', wuxing: '土', yinyang: '阳', meaning: '万物尽灭——火库', direction: '西北', season: '秋末', month: '九月', hour: '19:00-21:00', zodiac: '狗', canggan: '戊辛丁', body: '胃/腿', classImage: ['火库', '狗', '河魁', '刑狱', '欺诈(类象)'], wangxiu: '秋末', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
  { id: '亥', kind: 'di', wuxing: '水', yinyang: '阴', meaning: '万物收藏——天门', direction: '西北', season: '冬', month: '十月', hour: '21:00-23:00', zodiac: '猪', canggan: '壬甲', body: '肾/头', classImage: ['天河', '猪', '登明', '水池', '宫观'], wangxiu: '冬旺', relation: ['八字地支', '奇门', '六壬十二将', '生肖'] },
]
