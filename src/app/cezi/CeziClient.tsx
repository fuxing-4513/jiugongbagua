'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { DICT } from './ceziDict'
import { ZHUGE_384, type ZhugeQianData } from './zhuge384'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

export interface SancaiExplanation {
  总论: string; 性格: string; 意志: string; 事业: string; 家庭: string;
  婚姻: string; 子女: string; 社交: string; 精神: string;
  财运: string; 健康: string; 老运: string;
}

export interface CharData {
  c: string; s: number; w: string; m: string; i: string;
  k?: string; p?: string; y?: string; r?: string; e?: SancaiExplanation;
}

const DICT_SIZE = Object.keys(DICT).length

// 简繁对照映射（常用有差别的字）
const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '阿':'阿', '啊':'啊', '爱':'愛', '安':'安', '案':'案', '暗':'暗', '傲':'傲', '八':'八', '巴':'巴', '把':'把', '坝':'壩', '吧':'吧', '柏':'柏', '拜':'拜',
  '办':'辦', '邦':'邦', '包':'包', '宝':'寶', '报':'報', '抱':'抱', '暴':'暴', '北':'北', '贝':'貝', '备':'備', '被':'被', '本':'本', '笔':'筆', '闭':'閉',
  '避':'避', '变':'變', '标':'標', '表':'表', '别':'別', '彬':'彬', '冰':'冰', '并':'並', '卜':'卜', '部':'部', '才':'才', '材':'材', '财':'財', '彩':'彩',
  '菜':'菜', '餐':'餐', '蚕':'蠶', '曹':'曹', '草':'草', '侧':'側', '策':'策', '层':'層', '插':'插', '差':'差', '产':'產', '尝':'嘗', '常':'常', '场':'場',
  '抄':'抄', '朝':'朝', '吵':'吵', '车':'車', '辰':'辰', '陈':'陳', '晨':'晨', '称':'稱', '成':'成', '诚':'誠', '承':'承', '城':'城', '乘':'乘', '驰':'馳',
  '尺':'尺', '赤':'赤', '冲':'衝', '虫':'蟲', '抽':'抽', '丑':'醜', '出':'出', '初':'初', '楚':'楚', '川':'川', '穿':'穿', '传':'傳', '窗':'窗', '创':'創',
  '春':'春', '赐':'賜', '丛':'叢', '村':'村', '存':'存', '错':'錯', '达':'達', '答':'答', '打':'打', '大':'大', '傣':'傣', '带':'帶', '单':'單', '旦':'旦',
  '弹':'彈', '当':'當', '党':'黨', '导':'導', '到':'到', '道':'道', '稻':'稻', '得':'得', '德':'德', '地':'地', '等':'等', '底':'底', '帝':'帝', '典':'典',
  '电':'電', '店':'店', '调':'調', '掉':'掉', '钉':'釘', '定':'定', '东':'東', '动':'動', '冻':'凍', '都':'都', '斗':'鬥', '读':'讀', '端':'端', '对':'對',
  '多':'多', '儿':'兒', '尔':'爾', '发':'發', '返':'返', '范':'範', '方':'方', '房':'房', '访':'訪', '放':'放', '飞':'飛', '非':'非', '废':'廢', '费':'費',
  '分':'分', '奋':'奮', '丰':'豐', '风':'風', '锋':'鋒', '逢':'逢', '奉':'奉', '否':'否', '夫':'夫', '服':'服', '府':'府', '妇':'婦', '赋':'賦', '富':'富',
  '该':'該', '改':'改', '干':'干', '高':'高', '告':'告', '哥':'哥', '格':'格', '个':'個', '各':'各', '根':'根', '工':'工', '公':'公', '功':'功', '姑':'姑',
  '古':'古', '骨':'骨', '故':'故', '关':'關', '官':'官', '冠':'冠', '光':'光', '广':'廣', '归':'歸', '龟':'龜', '规':'規', '鬼':'鬼', '贵':'貴', '国':'國',
  '果':'果', '过':'過', '哈':'哈', '还':'還', '好':'好', '合':'合', '和':'和', '荷':'荷', '贺':'賀', '衡':'衡', '宏':'宏', '鸿':'鴻', '后':'後', '虎':'虎',
  '互':'互', '户':'戶', '护':'護', '华':'華', '化':'化', '划':'劃', '话':'話', '坏':'壞', '幻':'幻', '黄':'黃', '辉':'輝', '回':'回', '会':'會', '婚':'婚',
  '魂':'魂', '击':'擊', '机':'機', '鸡':'雞', '积':'積', '基':'基', '极':'極', '几':'幾', '己':'己', '计':'計', '技':'技', '加':'加', '夹':'夾', '家':'家',
  '驾':'駕', '尖':'尖', '坚':'堅', '间':'間', '见':'見', '建':'建', '践':'踐', '键':'鍵', '角':'角', '侥':'僥', '教':'教', '节':'節', '姐':'姐', '解':'解',
  '金':'金', '仅':'僅', '尽':'盡', '锦':'錦', '进':'進', '近':'近', '晋':'晉', '晶':'晶', '景':'景', '警':'警', '净':'淨', '竞':'競', '敬':'敬', '静':'靜',
  '镜':'鏡', '迥':'迥', '究':'究', '救':'救', '就':'就', '菊':'菊', '举':'舉', '巨':'巨', '具':'具', '决':'決', '觉':'覺', '军':'軍', '均':'均', '菌':'菌',
  '开':'開', '坎':'坎', '康':'康', '科':'科', '客':'客', '课':'課', '空':'空', '哭':'哭', '苦':'苦', '库':'庫', '块':'塊', '快':'快', '宽':'寬', '括':'括',
  '赖':'賴', '乐':'樂', '雷':'雷', '李':'李', '力':'力', '立':'立', '丽':'麗', '利':'利', '莉':'莉', '连':'連', '莲':'蓮', '恋':'戀', '梁':'梁', '两':'兩',
  '邻':'鄰', '林':'林', '临':'臨', '灵':'靈', '领':'領', '另':'另', '刘':'劉', '六':'六', '龙':'龍', '楼':'樓', '卢':'盧', '庐':'廬', '陆':'陸', '鹿':'鹿',
  '路':'路', '露':'露', '乱':'亂', '伦':'倫', '轮':'輪', '论':'論', '落':'落', '侣':'侶', '旅':'旅', '履':'履', '律':'律', '妈':'媽', '麻':'麻', '马':'馬',
  '吗':'嗎', '埋':'埋', '买':'買', '卖':'賣', '茅':'茅', '茂':'茂', '帽':'帽', '梅':'梅', '妹':'妹', '门':'門', '萌':'萌', '蒙':'蒙', '孟':'孟', '梦':'夢',
  '迷':'迷', '面':'面', '庙':'廟', '名':'名', '明':'明', '铭':'銘', '命':'命', '谋':'謀', '亩':'畝', '木':'木', '暮':'暮', '拿':'拿', '哪':'哪', '那':'那',
  '南':'南', '难':'難', '闹':'鬧', '呢':'呢', '内':'內', '年':'年', '念':'念', '娘':'娘', '鸟':'鳥', '宁':'寧', '农':'農', '暖':'暖', '诺':'諾', '女':'女',
  '排':'排', '旁':'旁', '品':'品', '平':'平', '凭':'憑', '萍':'萍', '仆':'僕', '蒲':'蒲', '普':'普', '妻':'妻', '期':'期', '齐':'齊', '其':'其', '奇':'奇',
  '骑':'騎', '旗':'旗', '岂':'豈', '启':'啟', '起':'起', '弃':'棄', '千':'千', '强':'強', '墙':'牆', '乔':'喬', '侨':'僑', '桥':'橋', '巧':'巧', '亲':'親',
  '秦':'秦', '青':'青', '晴':'晴', '请':'請', '庆':'慶', '秋':'秋', '区':'區', '曲':'曲', '权':'權', '全':'全', '拳':'拳', '让':'讓', '人':'人', '忍':'忍',
  '日':'日', '荣':'榮', '容':'容', '蓉':'蓉', '如':'如', '入':'入', '软':'軟', '蕊':'蕊', '锐':'銳', '若':'若', '赛':'賽', '散':'散', '丧':'喪', '森':'森',
  '杀':'殺', '山':'山', '善':'善', '伤':'傷', '商':'商', '赏':'賞', '尚':'尚', '少':'少', '蛇':'蛇', '设':'設', '谁':'誰', '身':'身', '声':'聲', '圣':'聖',
  '失':'失', '师':'師', '诗':'詩', '施':'施', '时':'時', '识':'識', '实':'實', '食':'食', '始':'始', '士':'士', '市':'市', '式':'式', '势':'勢', '视':'視',
  '是':'是', '适':'適', '收':'收', '手':'手', '兽':'獸', '书':'書', '术':'術', '树':'樹', '双':'雙', '顺':'順', '说':'說', '丝':'絲', '思':'思', '巳':'巳',
  '四':'四', '松':'松', '宋':'宋', '送':'送', '苏':'蘇', '速':'速', '虽':'雖', '岁':'歲', '穗':'穗', '孙':'孫', '所':'所', '塔':'塔', '台':'臺', '太':'太',
  '坛':'壇', '谈':'談', '唐':'唐', '堂':'堂', '腾':'騰', '提':'提', '体':'體', '天':'天', '跳':'跳', '铁':'鐵', '通':'通', '同':'同', '铜':'銅', '童':'童',
  '头':'頭', '投':'投', '突':'突', '图':'圖', '土':'土', '团':'團', '推':'推', '退':'退', '外':'外', '完':'完', '万':'萬', '往':'往', '忘':'忘', '旺':'旺',
  '望':'望', '威':'威', '伟':'偉', '伪':'偽', '为':'為', '味':'味', '文':'文', '闻':'聞', '稳':'穩', '问':'問', '握':'握', '无':'無', '吴':'吳', '五':'五',
  '务':'務', '误':'誤', '雾':'霧', '西':'西', '吸':'吸', '希':'希', '锡':'錫', '喜':'喜', '虾':'蝦', '侠':'俠', '先':'先', '鲜':'鮮', '闲':'閒', '贤':'賢',
  '显':'顯', '险':'險', '县':'縣', '限':'限', '乡':'鄉', '相':'相', '香':'香', '详':'詳', '响':'響', '向':'向', '项':'項', '小':'小', '晓':'曉', '孝':'孝',
  '校':'校', '笑':'笑', '效':'效', '些':'些', '协':'協', '邪':'邪', '写':'寫', '谢':'謝', '心':'心', '辛':'辛', '新':'新', '星':'星', '行':'行', '形':'形',
  '兴':'興', '幸':'幸', '性':'性', '姓':'姓', '凶':'兇', '兄':'兄', '雄':'雄', '休':'休', '虚':'虛', '徐':'徐', '许':'許', '选':'選', '学':'學', '雪':'雪',
  '鸭':'鴨', '雅':'雅', '亚':'亞', '延':'延', '严':'嚴', '言':'言', '颜':'顏', '央':'央', '杨':'楊', '养':'養', '摇':'搖', '遥':'遙', '药':'藥', '要':'要',
  '业':'業', '叶':'葉', '页':'頁', '衣':'衣', '遗':'遺', '已':'已', '蚁':'蟻', '亿':'億', '义':'義', '议':'議', '异':'異', '易':'易', '谊':'誼', '因':'因',
  '音':'音', '姻':'姻', '银':'銀', '引':'引', '隐':'隱', '应':'應', '英':'英', '迎':'迎', '影':'影', '佣':'傭', '优':'優', '幽':'幽', '游':'遊', '有':'有',
  '幼':'幼', '于':'於', '余':'餘', '鱼':'魚', '与':'與', '雨':'雨', '语':'語', '驭':'馭', '预':'預', '域':'域', '遇':'遇', '誉':'譽', '园':'園', '员':'員',
  '远':'遠', '怨':'怨', '月':'月', '越':'越', '云':'雲', '允':'允', '运':'運', '韵':'韻', '再':'再', '在':'在', '赞':'贊', '早':'早', '造':'造', '责':'責',
  '赠':'贈', '战':'戰', '张':'張', '章':'章', '长':'長', '掌':'掌', '账':'賬', '招':'招', '哲':'哲', '这':'這', '着':'著', '针':'針', '侦':'偵', '镇':'鎮',
  '征':'徵', '郑':'鄭', '政':'政', '支':'支', '枝':'枝', '只':'只', '志':'志', '制':'制', '质':'質', '智':'智', '中':'中', '忠':'忠', '钟':'鐘', '众':'眾',
  '州':'州', '周':'周', '朱':'朱', '诸':'諸', '竹':'竹', '助':'助', '专':'專', '转':'轉', '赚':'賺', '庄':'莊', '装':'裝', '壮':'壯', '追':'追', '姿':'姿',
  '资':'資', '子':'子', '梓':'梓', '字':'字', '宗':'宗', '总':'總', '走':'走', '足':'足', '族':'族', '左':'左', '坐':'坐',
}
function toTraditional(simplified: string): string {
  return SIMPLIFIED_TO_TRADITIONAL[simplified] || simplified
}

const WUXING_COLORS: Record<string, string> = {
  '金':'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '木':'bg-green-900/40 text-green-300 border-green-700',
  '水':'bg-blue-900/40 text-blue-300 border-blue-700',
  '火':'bg-red-900/40 text-red-300 border-red-700',
  '土':'bg-amber-900/40 text-amber-300 border-amber-700',
}

const LEVEL_COLORS: Record<string, string> = {
  '上上':'bg-green-900/50 text-green-300 border-green-700',
  '上吉':'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  '中吉':'bg-blue-900/50 text-blue-300 border-blue-700',
  '中平':'bg-amber-900/50 text-amber-300 border-amber-700',
  '中下':'bg-orange-900/50 text-orange-300 border-orange-700',
  '下下':'bg-red-900/50 text-red-300 border-red-700',
}

const HOT_CHARS = ['福','禄','寿','喜','财','吉','安','和','龙','凤','梦','缘','心','运','成','家','爱','德','善','诚','信','智','仁','义','美','乐','天','地','人','金','木','水','火','土','山','海','春','秋','明','马','龙','鹏','鹤','昌','盛','强','伟','毅']

/* ===== 诸葛测字核心算法 ===== */
// 诸葛神数：以三字的笔画数之和 ÷ 384 余数定签
function zhugeTest(char1: string, char2: string, char3: string): { data: ZhugeQianData; strokes: number[]; guaciId: number } | null {
  const getStroke = (ch: string): number => {
    const entry = DICT[ch]
    if (entry) return entry.s
    // Fallback: estimate from character code
    const code = ch.charCodeAt(0)
    if (code >= 0x4E00 && code <= 0x9FFF) return Math.floor((code - 0x4E00) / 30) + 3
    return 5
  }

  const s1 = getStroke(char1)
  const s2 = getStroke(char2)
  const s3 = getStroke(char3)
  const total = s1 + s2 + s3
  // 384 签，余数 1-384（余0 = 384）
  const idx = total % 384 === 0 ? 384 : total % 384
  const qian = ZHUGE_384.find(q => q.id === idx)
  if (!qian) return null
  return { data: qian, strokes: [s1, s2, s3], guaciId: idx }
}

export default function CeziClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  // Tab state: 'single' | 'zhuge'
  const [tab, setTab] = useState<'single'|'zhuge'>('single')

  // Single char state
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CharData | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Zhuge state
  const [zgChars, setZgChars] = useState(['', '', ''])
  const [zgResult, setZgResult] = useState<{ data: ZhugeQianData; strokes: number[]; guaciId: number } | null>(null)

  const analyze = () => {
    const c = input.trim()
    setResult(null)
    setNotFound(false)
    if (c.length !== 1) return
    if (DICT[c]) setResult(DICT[c])
    else setNotFound(true)
  }

  const handleZgInput = (idx: number, val: string) => {
    const ch = val.slice(-1)
    const newChars = [...zgChars]
    newChars[idx] = ch
    setZgChars(newChars)
    setZgResult(null)
  }

  const analyzeZhuge = () => {
    if (zgChars.some(c => c.length !== 1)) return
    const r = zhugeTest(zgChars[0], zgChars[1], zgChars[2])
    setZgResult(r)
  }

  const quickHotChar = (c: string) => {
    setInput(c)
    setResult(null)
    setNotFound(false)
    setTimeout(() => {
      if (DICT[c]) { setResult(DICT[c]); setNotFound(false) }
      else setNotFound(true)
    }, 50)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('cezi.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('cezi.desc', lang)}</p>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-dark-800/80 rounded-xl p-1 border border-dark-600 max-w-md mx-auto">
        <button onClick={() => { setTab('single'); setZgResult(null) }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === 'single' 
            ? 'bg-gold-600 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
          单字测字
        </button>
        <button onClick={() => { setTab('zhuge'); setResult(null) }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === 'zhuge'
            ? 'bg-gold-600 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
          诸葛测字
        </button>
      </div>

      {/* ===== Single Char Tab ===== */}
      {tab === 'single' && (
        <>
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
            <label className="block text-xs text-gray-400 mb-2">{tk('cezi.input', lang)}</label>
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => {
                setInput(e.target.value.slice(0,1))
                setResult(null); setNotFound(false)
              }} onKeyDown={e => e.key==='Enter' && analyze()}
                placeholder="如：福、财、运、爱"
                maxLength={1}
                className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xl text-center placeholder-gray-500 focus:outline-none focus:border-gold-500 font-serif"
              />
              <button onClick={analyze} disabled={input.length !== 1}
                className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 active:scale-95">
                {tk('common.submit', lang)}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">收录 {DICT_SIZE} 个汉字，含生僻字康熙字源</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {HOT_CHARS.map(c => (
                <button key={c} onClick={() => quickHotChar(c)}
                  className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-gold-300 px-2 py-1 rounded border border-dark-600 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          {notFound && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-amber-700/40 p-6 text-center">
              <p className="text-amber-400">暂未收录 &ldquo;{input}&rdquo; 字的解读，请尝试其他汉字。</p>
              <p className="text-xs text-gray-500 mt-2">已收录 {DICT_SIZE} 个汉字，覆盖日常常用字的90%以上。</p>
            </div>
          )}

          {result && <SingleCharResult data={result} />}
        </>
      )}

      {/* ===== Zhuge Tab ===== */}
      {tab === 'zhuge' && (
        <>
          {/* Description */}
          <div className="bg-gradient-to-r from-gold-900/20 to-dark-800 rounded-xl border border-gold-600/30 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gold-300 mb-2">🔮 诸葛神数测字</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              输入三个汉字，系统以三字笔画总和查诸葛神数384签，为你解读吉凶运势。
              此法源自三国时期诸葛亮（诸葛武侯）所创，融合易经八卦与数理玄机。
            </p>
          </div>

          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
            <label className="block text-xs text-gray-400 mb-4 text-center">请输入三个汉字（每字一格）</label>
            <div className="flex justify-center gap-4 mb-4">
              {[0,1,2].map(i => (
                <input key={i} type="text" value={zgChars[i]} onChange={e => handleZgInput(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') analyzeZhuge() }}
                  maxLength={1} placeholder={`字${i+1}`}
                  className="w-20 h-20 bg-dark-700 border-2 border-dark-600 rounded-xl text-3xl font-bold text-center text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500 font-serif transition-colors"
                />
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={analyzeZhuge} disabled={zgChars.some(c => c.length !== 1)}
                className="bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-900 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg">
                诸葛起卦
              </button>
            </div>
            {zgChars.filter(c => c.length === 1).length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  已输入：{zgChars.filter(c => c).join('、')}
                  {zgChars.filter(c => c).length === 3 && (
                    <span className="text-gold-400 ml-2">✓ 三字已全</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {zgResult && <ZhugeResult data={zgResult.data} strokes={zgResult.strokes} id={zgResult.guaciId} chars={zgChars} />}
        </>
      )}
    </div>
  )
}

/* ===== 单字结果组件 ===== */
function SingleCharResult({ data: result }: { data: CharData }) {
  // 繁体转换
  const trad = toTraditional(result.c)
  return (
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6">
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 bg-gradient-to-br from-gold-900/30 to-dark-700 rounded-2xl border-2 border-gold-600/50 flex items-center justify-center">
          <span className="text-6xl font-bold text-gold-400 font-serif">{result.c}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-dark-700 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">笔画</p>
          <p className="text-lg font-bold text-gray-200">{result.s}画</p>
        </div>
        <div className={`rounded-lg p-3 text-center border ${WUXING_COLORS[result.w] || 'bg-dark-700 border-dark-600'}`}>
          <p className="text-xs text-gray-500 mb-1">五行</p>
          <p className="text-lg font-bold">{result.w}</p>
        </div>
        <div className="bg-dark-700 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">寓意</p>
          <p className="text-sm font-medium text-gray-200">{result.m}</p>
        </div>
      </div>

      {/* 康熙字典字段 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {result.y && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">拼音</p>
            <p className="text-xs text-gray-200 font-mono">{result.y}</p>
          </div>
        )}
        {result.r && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">部首</p>
            <p className="text-xs text-gray-200">{result.r}</p>
          </div>
        )}
        {trad !== result.c && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">繁体</p>
            <p className="text-xs text-gray-200">{trad}</p>
          </div>
        )}
        {result.s && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">笔画</p>
            <p className="text-xs text-gray-200">{result.s}画</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-gold-900/20 to-dark-700 rounded-xl p-5 border border-gold-600/30">
        <h3 className="text-sm font-semibold text-gold-300 mb-3">测字解读</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{result.i}</p>
      </div>

      {result.k && (
        <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 mt-4">
          <h3 className="text-xs font-semibold text-gold-400 mb-2">📖 康熙字源</h3>
          <p className="text-xs text-gray-400 italic">{result.k}</p>
        </div>
      )}

      {result.e && (
        <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 mt-4">
          <h3 className="text-xs font-semibold text-gold-400 mb-3">🔱 三才五格 · 数理解析</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {Object.entries(result.e).map(([key, val]) => (
              <div key={key} className="text-xs">
                <span className="text-gray-500">{key}：</span>
                <span className="text-gray-300">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== 诸葛测字结果组件 ===== */
function ZhugeResult({ data, strokes, id, chars }: { data: ZhugeQianData; strokes: number[]; id: number; chars: string[] }) {
  const total = strokes.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* 签号与总笔画 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">所测三字</p>
          <p className="text-xl font-serif text-gold-400">{chars.join(' · ')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">笔画</p>
          <p className="text-sm font-mono text-gray-300">{strokes[0]}+{strokes[1]}+{strokes[2]}={total}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">诸葛神数</p>
          <p className="text-2xl font-bold text-amber-400">第{id}签</p>
        </div>
      </div>

      {/* 签文 */}
      <div className={`rounded-xl border p-5 ${LEVEL_COLORS[data.level] || 'bg-dark-700 border-dark-600'}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[data.level] || 'bg-dark-600 text-gray-400'}`}>
            {data.level}
          </span>
          <h3 className="text-base font-semibold text-gray-100">{data.title}</h3>
        </div>
        <div className="bg-dark-900/40 rounded-lg p-4 mb-3 font-serif">
          <p className="text-sm text-gold-300 italic leading-relaxed">{data.poem}</p>
        </div>
      </div>

      {/* 解签 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h4 className="text-xs font-semibold text-gold-400 mb-2">🔍 签文解读</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{data.explanation}</p>
      </div>

      <div className="bg-gradient-to-r from-amber-900/20 to-dark-800 rounded-xl border border-amber-700/30 p-5">
        <h4 className="text-xs font-semibold text-amber-400 mb-2">💡 提示</h4>
        <p className="text-sm text-amber-300/80">{data.hint}</p>
      </div>

      {/* 笔画解析 */}
      <details className="bg-dark-700/50 rounded-xl border border-dark-600 p-4 group">
        <summary className="text-xs font-semibold text-gray-400 cursor-pointer list-none flex items-center gap-2 group-open:text-gold-400">
          <span className="text-xs">📐</span> 笔画数理解析
          <span className="text-[10px] text-gray-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-2 text-xs text-gray-400">
          <p>第一字 <span className="text-gray-200 font-mono">{chars[0]}</span>：{strokes[0]}画</p>
          <p>第二字 <span className="text-gray-200 font-mono">{chars[1]}</span>：{strokes[1]}画</p>
          <p>第三字 <span className="text-gray-200 font-mono">{chars[2]}</span>：{strokes[2]}画</p>
          <div className="pt-2 border-t border-dark-600">
            <p>三字笔画总和：<span className="text-gold-400 text-sm font-bold">{total}</span></p>
            <p>余数 {total} ÷ 384 = {total % 384 || 384} → 第{id}签</p>
          </div>
        </div>
      </details>
    </div>
  )
}
