#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站色彩收敛脚本（2026-08-01）
目标：把散落的 20+ 彩虹色收敛为 6 色体系：
  墨(ink) 金(gold) 青玉(jade) 朱红(zhuhong) 水蓝(shui) 土黄(tu)
原则：
  1. 装饰性颜色（标题/标签/边框/浅底）→ 统一到 jade/gold
  2. 五行五色（木火土金水）只在命盘语义处保留，且用浅色 chip 风格
  3. 吉→jade 凶→zhuhong 平→灰
运行：python3 scripts/color-normalize.py
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGETS = (ROOT / 'src' / 'app', ROOT / 'src' / 'components', ROOT / 'src' / 'lib')

HUES = r'(?:red|rose|pink|orange|amber|yellow|green|emerald|teal|lime|cyan|blue|sky|indigo|violet|purple|fuchsia)'

def fam(hue):
    if hue in ('red','rose','pink','orange'): return 'zhuhong'
    if hue in ('amber','yellow'): return 'gold'
    if hue in ('green','emerald','teal','lime'): return 'jade'
    return 'shui'  # cyan/blue/sky/indigo/violet/purple/fuchsia

def files():
    for d in TARGETS:
        for p in d.rglob('*'):
            if p.suffix in ('.tsx', '.ts') and p.is_file():
                yield p

# ────────────────────────────────────────────
# PASS 9 (先跑): 语义化手工修正（用调色板 token，之后泛化不碰它们）
# ────────────────────────────────────────────
def hand_fixes(text, path):
    name = path.name

    # ---- bazi：十神色（比劫/食伤/财/官杀/印 → 五行五色） ----
    if name == 'BaziClient.tsx':
        text = text.replace("if (s.includes('比肩')||s.includes('劫财')) return 'text-blue-300'",
                            "if (s.includes('比肩')||s.includes('劫财')) return 'text-shui-600'")
        text = text.replace("if (s.includes('食神')||s.includes('伤官')) return 'text-green-300'",
                            "if (s.includes('食神')||s.includes('伤官')) return 'text-jade-600'")
        text = text.replace("if (s.includes('正财')||s.includes('偏财')) return 'text-yellow-300'",
                            "if (s.includes('正财')||s.includes('偏财')) return 'text-gold-600'")
        text = text.replace("if (s.includes('正官')||s.includes('七杀')) return 'text-red-300'",
                            "if (s.includes('正官')||s.includes('七杀')) return 'text-zhuhong'")
        text = text.replace("if (s.includes('正印')||s.includes('偏印')) return 'text-purple-300'",
                            "if (s.includes('正印')||s.includes('偏印')) return 'text-tu-600'")

    # ---- liuyao：六亲色 → 五行五色 ----
    if name == 'LiuyaoClient.tsx':
        text = text.replace("'父母': 'text-purple-300', '兄弟': 'text-blue-300', '子孙': 'text-green-300',",
                            "'父母': 'text-gold-600', '兄弟': 'text-shui-600', '子孙': 'text-jade-600',")
        text = text.replace("'妻财': 'text-yellow-300', '官鬼': 'text-red-300',",
                            "'妻财': 'text-tu-600', '官鬼': 'text-zhuhong',")

    # ---- meihua：分类标签 → jade ----
    if name == 'MeihuaClient.tsx':
        text = re.sub(r'text-(' + HUES + r')-[0-9]+ font-medium', 'text-jade-500 font-medium', text)

    # ---- hehun：男=水蓝 女=朱红；WXBAR 渐变 ----
    if name == 'HehunClient.tsx':
        text = text.replace("'text-blue-400'", "'text-shui-600'")
        text = text.replace("'text-pink-400'", "'text-zhuhong'")
        text = text.replace("border-blue-500/20", "border-shui-500/20")
        text = text.replace("border-pink-500/20", "border-zhuhong/20")
        text = text.replace("border-pink-500/10", "border-zhuhong/10")
        text = text.replace('text-pink-400', 'text-zhuhong')  # 女性结果卡标题
        text = text.replace("const WXBAR: Record<string, string> = {木:'from-green-400 to-green-600',火:'from-red-400 to-red-600',土:'from-amber-400 to-amber-600',金:'from-yellow-400 to-yellow-600',水:'from-blue-400 to-blue-600'}",
                            "const WXBAR: Record<string, string> = {木:'from-jade-500 to-jade-600',火:'from-zhuhong to-zhuhong-dark',土:'from-tu-500 to-tu-600',金:'from-gold-500 to-gold-600',水:'from-shui-500 to-shui-600'}")

    # ---- NamingChars：信息框统一为青玉 ----
    if name == 'NamingChars.tsx':
        text = text.replace('bg-indigo-900/20 rounded-lg border border-indigo-700/30', 'bg-jade-500/5 rounded-lg border border-jade-500/20')
        text = text.replace('bg-purple-900/20 rounded-lg border border-purple-700/30', 'bg-jade-500/5 rounded-lg border border-jade-500/20')
        text = text.replace('bg-teal-900/20 rounded-lg border border-teal-700/30', 'bg-jade-500/5 rounded-lg border border-jade-500/20')
        text = text.replace('text-indigo-400', 'text-jade-600')
        text = text.replace('text-purple-400', 'text-jade-600')
        text = text.replace('text-teal-400', 'text-jade-600')
        text = text.replace('border-teal-800/30', 'border-jade-500/20')
        text = text.replace('border-purple-500/50 bg-purple-500/10 text-purple-400', 'border-jade-500/40 bg-jade-500/10 text-jade-600')

    # ---- ziwei：亮度等级 + 四化 ----
    if name == 'ZiweiClient.tsx':
        text = text.replace("'庙': { label: '廟', color: 'text-green-400',", "'庙': { label: '廟', color: 'text-gold-600',")
        text = text.replace("'得': { label: '得', color: 'text-blue-300',", "'得': { label: '得', color: 'text-shui-500',")
        text = text.replace("'利': { label: '利', color: 'text-cyan-300',", "'利': { label: '利', color: 'text-tu-500',")
        text = text.replace("'平': { label: '平', color: 'text-yellow-400',", "'平': { label: '平', color: 'text-gray-500',")
        text = text.replace("'不': { label: '不', color: 'text-orange-400',", "'不': { label: '不', color: 'text-zhuhong/80',")
        text = text.replace("'陷': { label: '陷', color: 'text-red-400',", "'陷': { label: '陷', color: 'text-zhuhong',")
        text = text.replace("'权': { label: '化權', color: 'text-purple-400' },", "'权': { label: '化權', color: 'text-gold-600' },")
        text = text.replace("'科': { label: '化科', color: 'text-blue-400' },", "'科': { label: '化科', color: 'text-shui-500' },")

    # ---- huangli：节日chip 朱红实底；zonghe：一致性 tag 浅色chip ----
    if name == 'HuangliClient.tsx':
        text = text.replace('bg-zhuhong600 text-white', 'bg-zhuhong text-white')
    if name == 'zonghe-content.tsx':
        text = text.replace("cv.consistency === '同向印证' || cv.consistency === 'Aligned' ? 'bg-jade-500800 text-jade-500' :",
                            "cv.consistency === '同向印证' || cv.consistency === 'Aligned' ? 'bg-jade-500/10 text-jade-600' :")
        text = text.replace("cv.consistency === '互补印证' || cv.consistency === 'Complementary' ? 'bg-gold-500800 text-gold-500' : 'bg-zhuhong800 text-zhuhong'",
                            "cv.consistency === '互补印证' || cv.consistency === 'Complementary' ? 'bg-gold-500/10 text-gold-600' : 'bg-zhuhong/10 text-zhuhong'")
        text = text.replace('text-cyan-400', 'text-jade-500')

    # ---- bazi-constants：五行五色规范（全站唯一 canonical map） ----
    if name == 'bazi-constants.ts':
        text = text.replace("export const WXC: Record<string,string> = {木:'text-green-400',火:'text-red-400',土:'text-amber-400',金:'text-yellow-400',水:'text-blue-400'}",
                            "export const WXC: Record<string,string> = {木:'text-jade-600',火:'text-zhuhong',土:'text-tu-600',金:'text-gold-600',水:'text-shui-600'}")
        text = text.replace("export const WXBG: Record<string,string> = {木:'bg-green-900/30',火:'bg-red-900/30',土:'bg-amber-900/30',金:'bg-yellow-900/30',水:'bg-blue-900/30'}",
                            "export const WXBG: Record<string,string> = {木:'bg-jade-500/10',火:'bg-zhuhong/10',土:'bg-tu-500/10',金:'bg-gold-500/10',水:'bg-shui-500/10'}")
        text = text.replace("export const WXBAR: Record<string,string> = {木:'from-green-500 to-green-700',火:'from-red-500 to-red-700',土:'from-amber-500 to-amber-700',金:'from-yellow-500 to-yellow-700',水:'from-blue-500 to-blue-700'}",
                            "export const WXBAR: Record<string,string> = {木:'from-jade-500 to-jade-700',火:'from-zhuhong to-zhuhong-dark',土:'from-tu-500 to-tu-700',金:'from-gold-500 to-gold-700',水:'from-shui-500 to-shui-700'}")

    # ---- bazi-shensha：神煞标签 吉/凶 chip ----
    if name == 'bazi-shensha.ts':
        text = text.replace("if (type === '吉') return 'bg-gold-900/50 text-gold-300 border border-gold-700/50'",
                            "if (type === '吉') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'")
        text = text.replace("if (type === '凶') return 'bg-red-900/40 text-red-300 border border-red-700/40'",
                            "if (type === '凶') return 'bg-zhuhong/10 text-zhuhong border border-zhuhong/25'")

    # ---- ziwei-data：亮度等级（与 ZiweiClient 一致） ----
    if name == 'ziwei-data.ts':
        text = text.replace("'庙': { label: '廟', color: 'text-green-400', level: 5 },", "'庙': { label: '廟', color: 'text-gold-600', level: 5 },")
        text = text.replace("'旺': { label: '旺', color: 'text-green-300', level: 4 },", "'旺': { label: '旺', color: 'text-jade-500', level: 4 },")
        text = text.replace("'得': { label: '得', color: 'text-blue-300',  level: 3 },", "'得': { label: '得', color: 'text-shui-500',  level: 3 },")
        text = text.replace("'利': { label: '利', color: 'text-cyan-300',  level: 2 },", "'利': { label: '利', color: 'text-tu-500',  level: 2 },")
        text = text.replace("'平': { label: '平', color: 'text-yellow-400', level: 1 },", "'平': { label: '平', color: 'text-gray-500', level: 1 },")
        text = text.replace("'不': { label: '不', color: 'text-orange-400', level: -1 },", "'不': { label: '不', color: 'text-zhuhong/80', level: -1 },")
        text = text.replace("'陷': { label: '陷', color: 'text-red-400',   level: -2 },", "'陷': { label: '陷', color: 'text-zhuhong',   level: -2 },")

    # ---- tarot-data：正反/是非梯度 ----
    if name == 'tarot-data.ts':
        text = text.replace("return { label: '强烈是', color: 'text-emerald-400' }", "return { label: '强烈是', color: 'text-jade-600' }")
        text = text.replace("return { label: '倾向是', color: 'text-emerald-300' }", "return { label: '倾向是', color: 'text-jade-500' }")
        text = text.replace("return { label: '不明确', color: 'text-yellow-400' }", "return { label: '不明确', color: 'text-gray-500' }")
        text = text.replace("return { label: '倾向否', color: 'text-rose-300' }", "return { label: '倾向否', color: 'text-zhuhong/80' }")
        text = text.replace("return { label: '强烈否', color: 'text-rose-400' }", "return { label: '强烈否', color: 'text-zhuhong' }")

    # ---- DayunChart：纳音五行 土→tu ----
    if name == 'DayunChart.tsx':
        text = text.replace("'土': 'border-gold-500/60 bg-gold-500/50/10',", "'土': 'border-tu-500/60 bg-tu-500/10',")

    # ---- NamingChars：五行背景 土→tu；清理 P4 误伤 ----
    if name == 'NamingChars.tsx':
        text = text.replace("tu: 'bg-gold-500/50/20',", "tu: 'bg-tu-500/20',")

    # ---- AppClient：紫微五行 土→tu ----
    if name == 'AppClient.tsx':
        text = text.replace("'土':'text-gold-500'}", "'土':'text-tu-500'}")
        text = text.replace("k==='火'?'bg-zhuhong/50':'bg-gold-500/50'}", "k==='火'?'bg-zhuhong/50':'bg-tu-500/50'}")

    # ---- NamingClient：WXC 土 border、wxBg、wxColor 渐变 ----
    if name == 'NamingClient.tsx':
        text = text.replace("'土':'bg-tu-500/10 text-tu-600 border-gold-500/25',", "'土':'bg-tu-500/10 text-tu-600 border-tu-500/25',")
        text = text.replace("const wxBg: Record<string,string> = {'木':'bg-jade-500700','火':'bg-zhuhong700','土':'bg-gold-500700','金':'bg-gold-500700','水':'bg-shui-500700'}",
                            "const wxBg: Record<string,string> = {'木':'bg-jade-500/30','火':'bg-zhuhong/30','土':'bg-tu-500/30','金':'bg-gold-500/30','水':'bg-shui-500/30'}")
        text = text.replace("const wxColor: Record<string,string> = {'木':'from-green-400 to-green-600','火':'from-red-400 to-red-600','土':'from-amber-400 to-amber-600','金':'from-yellow-400 to-yellow-600','水':'from-blue-400 to-blue-600'}",
                            "const wxColor: Record<string,string> = {'木':'from-jade-500 to-jade-600','火':'from-zhuhong to-zhuhong-dark','土':'from-tu-500 to-tu-600','金':'from-gold-500 to-gold-600','水':'from-shui-500 to-shui-600'}")

    # ---- XingmingClient：WXC 土 border ----
    if name == 'XingmingClient.tsx':
        text = text.replace("'土':'bg-tu-500/10 text-tu-600 border-gold-500/25',", "'土':'bg-tu-500/10 text-tu-600 border-tu-500/25',")

    # ---- lingqian：签文等级（金/青/灰/棕/红 梯度） ----
    if name == 'types.ts':
        text = text.replace("'上上':'text-emerald-400 bg-emerald-900/30 border-emerald-700',",
                            "'上上':'text-gold-600 bg-gold-500/15 border-gold-500/30',")
        text = text.replace("'上吉':'text-green-400 bg-green-900/30 border-green-700',",
                            "'上吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',")
        text = text.replace("'大吉':'text-green-400 bg-green-900/30 border-green-700',",
                            "'大吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',")
        text = text.replace("'中吉':'text-lime-400 bg-lime-900/30 border-lime-700',",
                            "'中吉':'text-jade-500 bg-jade-500/10 border-jade-500/25',")
        text = text.replace("'中平':'text-yellow-400 bg-yellow-900/30 border-yellow-700',",
                            "'中平':'text-gray-500 bg-dark-700 border-dark-600',")
        text = text.replace("'中下':'text-orange-400 bg-orange-900/30 border-orange-700',",
                            "'中下':'text-tu-600 bg-tu-500/10 border-tu-500/25',")
        text = text.replace("'下下':'text-red-400 bg-red-900/30 border-red-700',",
                            "'下下':'text-zhuhong bg-zhuhong/10 border-zhuhong/25',")
        text = text.replace("'下平':'text-rose-400 bg-rose-900/30 border-rose-700',",
                            "'下平':'text-zhuhong/80 bg-zhuhong/5 border-zhuhong/20',")

    # ---- shuma：八星磁场吉凶（金/青/灰/红 梯度） ----
    if name == 'ShumaClient.tsx':
        text = text.replace("'吉':'bg-green-900/50 text-green-300 border-green-700'", "'吉':'bg-jade-500/15 text-jade-600 border-jade-500/30'")
        text = text.replace("'凶':'bg-red-900/50 text-red-300 border-red-700'", "'凶':'bg-zhuhong/10 text-zhuhong border-zhuhong/25'")
        text = text.replace("'平':'bg-cyan-900/50 text-cyan-300 border-cyan-700'", "'平':'bg-dark-700 text-gray-500 border-dark-600'")
        text = text.replace("'次吉':'bg-green-900/30 text-green-400 border-green-700'", "'次吉':'bg-jade-500/10 text-jade-500 border-jade-500/25'")
        text = text.replace("'大吉':'bg-yellow-900/40 text-yellow-300 border-yellow-700'", "'大吉':'bg-gold-500/15 text-gold-600 border-gold-500/30'")
        text = text.replace("'次凶':'bg-orange-900/40 text-orange-300 border-orange-700'", "'次凶':'bg-zhuhong/5 text-zhuhong/80 border-zhuhong/20'")
        text = text.replace("'大凶':'bg-red-900/60 text-red-300 border-red-700'", "'大凶':'bg-zhuhong/15 text-zhuhong-dark border-zhuhong-dark/30'")
        text = text.replace("'小吉':'bg-teal-900/40 text-teal-300 border-teal-700'", "'小吉':'bg-jade-500/5 text-jade-500 border-jade-500/20'")

    return text

# ────────────────────────────────────────────
# 泛化收敛（五行 chip → 浅色 chip / 彩虹色 → 调色板）
# ────────────────────────────────────────────
def pal_text(f, shade, opacity):
    if f == 'zhuhong':
        t = 'zhuhong' if int(shade) <= 500 else 'zhuhong-dark'
    else:
        t = f + ('-500' if int(shade) <= 500 else ('-600' if int(shade) <= 700 else '-700'))
    return f'text-{t}{opacity or ""}'

def pal_bg(f, shade, opacity):
    if f == 'zhuhong':
        return f'bg-zhuhong{opacity or ""}'
    return f'bg-{f}-500{opacity or ""}'

def pal_border(f, shade, opacity):
    if f == 'zhuhong':
        return f'border-zhuhong{opacity or "/25"}'
    return f'border-{f}-500{opacity or "/25"}'

def process(text):
    # ThemeContext.tsx 是 CSS-in-JS（.bg-amber-50{...} 选择器），不走泛化
    import re as _re
    if 'ThemeContext' in str(pathlib.Path(__file__)):
        pass
    # P1 五行 chips（暗底 → 浅色 chip）
    for old, new in [
        ('bg-yellow-900/40 text-yellow-300', 'bg-gold-500/10 text-gold-600'),
        ('bg-green-900/40 text-green-300', 'bg-jade-500/10 text-jade-600'),
        ('bg-blue-900/40 text-blue-300', 'bg-shui-500/10 text-shui-600'),
        ('bg-red-900/40 text-red-300', 'bg-zhuhong/10 text-zhuhong'),
        ('bg-amber-900/40 text-amber-300', 'bg-tu-500/10 text-tu-600'),
        ('bg-orange-900/40 text-orange-300 border border-orange-800', 'bg-gold-500/10 text-gold-600 border border-gold-500/25'),
    ]:
        text = text.replace(old, new)

    # P2 性别选中按钮 → 金（与全站选中态一致）
    text = text.replace('bg-blue-500 text-white', 'bg-gold-600 text-dark-900')
    text = text.replace('bg-pink-500 text-white', 'bg-gold-600 text-dark-900')

    # P3 加粗彩色文字（标题/强调）→ jade-500
    re3a = re.compile(r'(font-(?:semibold|bold)[^"\']*?)(text-)(' + HUES + r')-[0-9]+')
    re3b = re.compile(r'(text-)(' + HUES + r')-[0-9]+([^"\']*?font-(?:semibold|bold))')
    text = re3a.sub(lambda m: m.group(1) + m.group(2) + 'jade-500', text)
    text = re3b.sub(lambda m: m.group(1) + 'jade-500' + m.group(3), text)

    # P4 浅底 bg-{hue}-50(/op) → 调色板浅底（注意 (?!\d) 防止误吃 -500 的前两位）
    re4 = re.compile(r'bg-(' + HUES + r')-50(?!\d)(/\d+)?')
    text = re4.sub(lambda m: pal_bg(fam(m.group(1)), 50, '/5'), text)

    # P5 剩余暗底 bg-{hue}-900/xx、bg-{hue}-950/xx → 浅色 chip 底
    re5a = re.compile(r'bg-(' + HUES + r')-900/(20|30|40|50|60|70|80|90)')
    re5b = re.compile(r'border-(' + HUES + r')-700(/\d+)?')
    re5c = re.compile(r'border-(' + HUES + r')-800(/\d+)?')
    re5d = re.compile(r'bg-(' + HUES + r')-950(/\d+)?')
    text = re5a.sub(lambda m: pal_bg(fam(m.group(1)), 900, '/10'), text)
    text = re5b.sub(lambda m: pal_border(fam(m.group(1)), 700, m.group(2)), text)
    text = re5c.sub(lambda m: pal_border(fam(m.group(1)), 800, m.group(2)), text)
    text = re5d.sub(lambda m: pal_bg(fam(m.group(1)), 950, '/10'), text)

    # P6 文字色
    re6lo = re.compile(r'text-(' + HUES + r')-(100|200|300|400|500)(/\d+)?')
    re6hi = re.compile(r'text-(' + HUES + r')-(600|700)(/\d+)?')
    re6x  = re.compile(r'text-(' + HUES + r')-(800|900)(/\d+)?')
    text = re6lo.sub(lambda m: pal_text(fam(m.group(1)), int(m.group(2)), m.group(3)), text)
    text = re6hi.sub(lambda m: pal_text(fam(m.group(1)), int(m.group(2)), m.group(3)), text)
    text = re6x.sub(lambda m: pal_text(fam(m.group(1)), int(m.group(2)), m.group(3)), text)

    # P7 背景色（非 900）
    re7_100 = re.compile(r'bg-(' + HUES + r')-(100|200)(/\d+)?')
    re7_34  = re.compile(r'bg-(' + HUES + r')-(300|400)(/\d+)?')
    re7_500 = re.compile(r'bg-(' + HUES + r')-500(/\d+)?')
    re7_678 = re.compile(r'bg-(' + HUES + r')-(600|700|800)(/\d+)?')
    re7_900 = re.compile(r'bg-(' + HUES + r')-900(?![/\w])')
    text = re7_100.sub(lambda m: pal_bg(fam(m.group(1)), 200, m.group(3) or '/10'), text)
    text = re7_34.sub(lambda m: pal_bg(fam(m.group(1)), 400, m.group(3) or '/15'), text)
    text = re7_500.sub(lambda m: pal_bg(fam(m.group(1)), 500, m.group(2)), text)
    text = re7_678.sub(lambda m: pal_bg(fam(m.group(1)), 700, m.group(3)), text)
    text = re7_900.sub(lambda m: pal_bg(fam(m.group(1)), 900, '/10'), text)

    # P7b 清理误伤类名（旧 bug 产物）
    re7b1 = re.compile(r'bg-(jade|gold|shui|tu)-500/50/(\d+)')
    re7b2 = re.compile(r'bg-(jade|gold|shui|tu)-500/10/\d+')
    re7b3 = re.compile(r'bg-(jade|gold|shui|tu)-500(?:600|700|800)')
    re7b4 = re.compile(r'bg-zhuhong/50/(\d+)')
    re7b5 = re.compile(r'bg-zhuhong/10/\d+')
    re7b6 = re.compile(r'bg-zhuhong(?:600|700|800)')
    text = re7b1.sub(lambda m: f'bg-{m.group(1)}-500/{m.group(2)}', text)
    text = re7b2.sub(lambda m: 'bg-' + m.group(1) + '-500/10', text)
    text = re7b3.sub(lambda m: 'bg-' + m.group(1) + '-500/10', text)
    text = re7b4.sub(lambda m: f'bg-zhuhong/{m.group(1)}', text)
    text = re7b5.sub(lambda m: 'bg-zhuhong/10', text)
    text = re7b6.sub(lambda m: 'bg-zhuhong/10', text)

    # P7c 渐变端点 from/to/via（50→/5 浅端，100-500→500，600→600，700→700）
    def grad_repl(m, kind):
        f = fam(m.group(1))
        shade = int(m.group(2))
        if shade == 50:
            t = (f + '-500/5') if f != 'zhuhong' else 'zhuhong/5'
        elif shade <= 500:
            t = (f + '-500') if f != 'zhuhong' else 'zhuhong'
        elif shade == 600:
            t = (f + '-600') if f != 'zhuhong' else 'zhuhong-dark'
        else:
            t = (f + '-700') if f != 'zhuhong' else 'zhuhong-dark'
        return kind + '-' + t
    for kind in ('from', 'to', 'via'):
        re_g = re.compile(kind + r'-(' + HUES + r')-(50|100|200|300|400|500|600|700)(?!\d)')
        text = re_g.sub(lambda m, k=kind: grad_repl(m, k), text)

    # P8 边框色
    re8 = re.compile(r'border-(' + HUES + r')-([0-9]+)(/\d+)?')
    text = re8.sub(lambda m: pal_border(fam(m.group(1)), int(m.group(2)), m.group(3)), text)

    # P9 accent（表单控件）
    re9 = re.compile(r'accent-(' + HUES + r')-500')
    text = re9.sub(lambda m: 'accent-' + (fam(m.group(1)) if fam(m.group(1)) != 'zhuhong' else 'zhuhong') + '-500', text)

    return text

def main():
    changed = 0
    for p in files():
        if p.name == 'ThemeContext.tsx':   # CSS-in-JS（.bg-amber-50{...} 选择器），不走泛化
            continue
        orig = p.read_text(encoding='utf-8')
        out = hand_fixes(orig, p)   # 先语义修正（调色板 token 免疫泛化）
        out = process(out)          # 再泛化收敛
        if out != orig:
            p.write_text(out, encoding='utf-8')
            changed += 1
            print(f'  ✏️  {p.relative_to(ROOT)}')
    print(f'\n共修改 {changed} 个文件')

if __name__ == '__main__':
    main()
