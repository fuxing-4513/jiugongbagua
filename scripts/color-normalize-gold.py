#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站单色收敛脚本（2026-08-01 v2）
需求：九宫全站只保留一种颜色 —— 古金（gold 色系），其余彩色一律改为金色或中性墨灰。
运行：python3 scripts/color-normalize-gold.py
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGETS = (ROOT / 'src' / 'app', ROOT / 'src' / 'components', ROOT / 'src' / 'lib')

FAMS = r'(?:jade|shui|tu|zhuhong)'

def files():
    for d in TARGETS:
        for p in d.rglob('*'):
            if p.suffix in ('.tsx', '.ts') and p.is_file() and p.name != 'ThemeContext.tsx':
                yield p

def process(text):
    # ── 1. 文字色 → 金 ──
    # text-{fam}-{300..700} → text-gold-600（300/400 也压到 600 保证浅底可读）
    re_t = re.compile(r'text-(' + FAMS + r')-(\d{3})(/\d+)?')
    def t_repl(m):
        f, shade, op = m.group(1), int(m.group(2)), m.group(3) or ''
        if f == 'zhuhong':
            target = 'gold-700' if shade >= 600 else 'gold-600'
        else:
            target = 'gold-700' if shade >= 700 else 'gold-600'
        return f'text-{target}{op}'
    text = re_t.sub(t_repl, text)
    # text-zhuhong / text-zhuhong-dark（无数字后缀）
    text = re.sub(r'text-zhuhong-dark(/\d+)?', r'text-gold-700\1', text)
    text = re.sub(r'text-zhuhong(/\d+)?', r'text-gold-600\1', text)

    # ── 2. 背景色 → 金（保留透明度） ──
    re_b = re.compile(r'bg-(' + FAMS + r')(?:-(\d{3}))?(/\d+)?')
    def b_repl(m):
        f, shade, op = m.group(1), m.group(2), m.group(3) or ''
        target = 'gold-700' if shade and int(shade) >= 700 else 'gold-500'
        return f'bg-{target}{op}'
    text = re_b.sub(b_repl, text)

    # ── 3. 边框色 → 金 ──
    re_bd = re.compile(r'border-(' + FAMS + r')(?:-(\d{3}))?(/\d+)?')
    def bd_repl(m):
        f, shade, op = m.group(1), m.group(2), m.group(3)
        if f == 'zhuhong':
            target = 'gold-700' if shade and int(shade) >= 600 else 'gold-500'
        else:
            target = 'gold-700' if shade and int(shade) >= 700 else 'gold-500'
        return f'border-{target}{op or "/25"}'
    text = re_bd.sub(bd_repl, text)

    # ── 4. 渐变端点 → 金 ──
    re_g = re.compile(r'(from|to|via)-(' + FAMS + r')(?:-(\d{3}))?(/\d+)?')
    def g_repl(m):
        kind, f, shade, op = m.group(1), m.group(2), m.group(3), m.group(4) or ''
        target = 'gold-700' if shade and int(shade) >= 700 else ('gold-600' if shade and int(shade) == 600 else 'gold-500')
        if f == 'zhuhong':
            target = 'gold-700' if shade and int(shade) >= 600 else 'gold-500'
        return f'{kind}-{target}{op}'
    text = re_g.sub(g_repl, text)

    # ── 5. accent → 金 ──
    text = re.sub(r'accent-(' + FAMS + r')(?:-\d{3})?', r'accent-gold-500', text)

    # ── 6. 清理 bg-zhuhong 实底 + text-white 组合（节日 chip） ──
    text = text.replace('bg-gold-500 text-white', 'bg-gold-500 text-dark-900')
    text = text.replace('bg-gold-600 text-white', 'bg-gold-600 text-dark-900')

    return text

def hand_fixes(text, path):
    name = path.name

    # 十神/六亲 → 全金
    if name == 'BaziClient.tsx':
        text = text.replace("'text-shui-600'", "'text-gold-600'")
        text = text.replace("'text-jade-600'", "'text-gold-600'")
        text = text.replace("'text-tu-600'", "'text-gold-600'")
        text = text.replace("'text-zhuhong'", "'text-gold-600'")
    if name == 'LiuyaoClient.tsx':
        text = text.replace("'父母': 'text-gold-600', '兄弟': 'text-shui-600', '子孙': 'text-jade-600',", "'父母': 'text-gold-600', '兄弟': 'text-gold-600', '子孙': 'text-gold-600',")
        text = text.replace("'妻财': 'text-tu-600', '官鬼': 'text-zhuhong',", "'妻财': 'text-gold-600', '官鬼': 'text-gold-600',")

    # 五行 canonical map → 全金
    if name == 'bazi-constants.ts':
        text = text.replace("export const WXC: Record<string,string> = {木:'text-jade-600',火:'text-zhuhong',土:'text-tu-600',金:'text-gold-600',水:'text-shui-600'}",
                            "export const WXC: Record<string,string> = {木:'text-gold-600',火:'text-gold-600',土:'text-gold-600',金:'text-gold-600',水:'text-gold-600'}")
        text = text.replace("export const WXBG: Record<string,string> = {木:'bg-jade-500/10',火:'bg-zhuhong/10',土:'bg-tu-500/10',金:'bg-gold-500/10',水:'bg-shui-500/10'}",
                            "export const WXBG: Record<string,string> = {木:'bg-gold-500/10',火:'bg-gold-500/10',土:'bg-gold-500/10',金:'bg-gold-500/10',水:'bg-gold-500/10'}")
        text = text.replace("export const WXBAR: Record<string,string> = {木:'from-jade-500 to-jade-700',火:'from-zhuhong to-zhuhong-dark',土:'from-tu-500 to-tu-700',金:'from-gold-500 to-gold-700',水:'from-shui-500 to-shui-700'}",
                            "export const WXBAR: Record<string,string> = {木:'from-gold-500 to-gold-600',火:'from-gold-500 to-gold-600',土:'from-gold-500 to-gold-600',金:'from-gold-500 to-gold-600',水:'from-gold-500 to-gold-600'}")

    if name == 'bazi-shensha.ts':
        text = text.replace("if (type === '吉') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'", "if (type === '吉') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'")
        text = text.replace("if (type === '凶') return 'bg-zhuhong/10 text-zhuhong border border-zhuhong/25'", "if (type === '凶') return 'bg-gold-500/10 text-gold-600 border border-gold-500/25'")

    if name == 'HehunClient.tsx':
        text = text.replace("const WXC: Record<string, string> = {木:'text-jade-500',火:'text-zhuhong',土:'text-tu-600',金:'text-gray-300',水:'text-shui-600'}",
                            "const WXC: Record<string, string> = {木:'text-gold-600',火:'text-gold-600',土:'text-gold-600',金:'text-gray-300',水:'text-gold-600'}")
        text = text.replace("const WXBG: Record<string, string> = {木:'bg-jade-500/10 border-jade-500/30',火:'bg-zhuhong/10 border-zhuhong/30',土:'bg-tu-500/10 border-tu-500/30',金:'bg-gray-800/40 border-gray-500/30',水:'bg-shui-500/10 border-shui-500/30'}",
                            "const WXBG: Record<string, string> = {木:'bg-gold-500/10 border-gold-500/30',火:'bg-gold-500/10 border-gold-500/30',土:'bg-gold-500/10 border-gold-500/30',金:'bg-gray-800/40 border-gray-500/30',水:'bg-gold-500/10 border-gold-500/30'}")
        text = text.replace("const WXBAR: Record<string, string> = {木:'from-jade-500 to-jade-600',火:'from-zhuhong to-zhuhong-dark',土:'from-tu-500 to-tu-600',金:'from-gold-500 to-gold-600',水:'from-shui-500 to-shui-600'}",
                            "const WXBAR: Record<string, string> = {木:'from-gold-500 to-gold-600',火:'from-gold-500 to-gold-600',土:'from-gold-500 to-gold-600',金:'from-gold-500 to-gold-600',水:'from-gold-500 to-gold-600'}")
        # 男女卡 蓝/红 → 金（保留性别符号区分）
        text = text.replace("(i===0?'border-shui-500/20':'border-zhuhong/20')", "(i===0?'border-gold-500/20':'border-gold-500/40')")
        text = text.replace("(i===0?'text-shui-600':'text-zhuhong')", "(i===0?'text-gold-600':'text-gold-600')")

    if name == 'AppClient.tsx':
        text = text.replace("const WU_XING_COLORS: Record<string,string> = {'金':'text-gold-500','木':'text-jade-500','水':'text-shui-500','火':'text-zhuhong','土':'text-tu-500'};",
                            "const WU_XING_COLORS: Record<string,string> = {'金':'text-gold-500','木':'text-gold-500','水':'text-gold-500','火':'text-gold-500','土':'text-gold-500'};")
        text = text.replace("k==='金'?'bg-gold-500/50':k==='木'?'bg-jade-500/50':k==='水'?'bg-shui-500/50':k==='火'?'bg-zhuhong/50':'bg-tu-500/50'",
                            "k==='金'?'bg-gold-500/50':k==='木'?'bg-gold-500/50':k==='水'?'bg-gold-500/50':k==='火'?'bg-gold-500/50':'bg-gold-500/50'")

    if name == 'NamingClient.tsx':
        text = text.replace("{'木':'bg-jade-500/30','火':'bg-zhuhong/30','土':'bg-tu-500/30','金':'bg-gold-500/30','水':'bg-shui-500/30'}",
                            "{'木':'bg-gold-500/30','火':'bg-gold-500/30','土':'bg-gold-500/30','金':'bg-gold-500/30','水':'bg-gold-500/30'}")
        text = text.replace("{'木':'from-jade-500 to-jade-600','火':'from-zhuhong to-zhuhong-dark','土':'from-tu-500 to-tu-600','金':'from-gold-500 to-gold-600','水':'from-shui-500 to-shui-600'}",
                            "{'木':'from-gold-500 to-gold-600','火':'from-gold-500 to-gold-600','土':'from-gold-500 to-gold-600','金':'from-gold-500 to-gold-600','水':'from-gold-500 to-gold-600'}")
        text = text.replace("'木':'bg-jade-500/10 text-jade-600 border-jade-500/25',", "'木':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'火':'bg-zhuhong/10 text-zhuhong border-zhuhong/25',", "'火':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'土':'bg-tu-500/10 text-tu-600 border-tu-500/25',", "'土':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'水':'bg-shui-500/10 text-shui-600 border-shui-500/25',", "'水':'bg-gold-500/10 text-gold-600 border-gold-500/25',")

    if name == 'XingmingClient.tsx':
        text = text.replace("'木':'bg-jade-500/10 text-jade-600 border-jade-500/25',", "'木':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'火':'bg-zhuhong/10 text-zhuhong border-zhuhong/25',", "'火':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'土':'bg-tu-500/10 text-tu-600 border-tu-500/25',", "'土':'bg-gold-500/10 text-gold-600 border-gold-500/25',")
        text = text.replace("'水':'bg-shui-500/10 text-shui-600 border-shui-500/25',", "'水':'bg-gold-500/10 text-gold-600 border-gold-500/25',")

    # 灵签/数字 吉凶等级 → 全金（中平留灰）
    if name == 'types.ts':
        text = text.replace("'上上':'text-gold-600 bg-gold-500/15 border-gold-500/30',", "'上上':'text-gold-600 bg-gold-500/15 border-gold-500/30',")
        text = text.replace("'上吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',", "'上吉':'text-gold-600 bg-gold-500/15 border-gold-500/30',")
        text = text.replace("'大吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',", "'大吉':'text-gold-600 bg-gold-500/15 border-gold-500/30',")
        text = text.replace("'中吉':'text-jade-500 bg-jade-500/10 border-jade-500/25',", "'中吉':'text-gold-600 bg-gold-500/10 border-gold-500/25',")
        text = text.replace("'中下':'text-tu-600 bg-tu-500/10 border-tu-500/25',", "'中下':'text-gold-600 bg-gold-500/10 border-gold-500/25',")
        text = text.replace("'下下':'text-zhuhong bg-zhuhong/10 border-zhuhong/25',", "'下下':'text-gold-600 bg-gold-500/10 border-gold-500/25',")
        text = text.replace("'下平':'text-zhuhong/80 bg-zhuhong/5 border-zhuhong/20',", "'下平':'text-gold-600/80 bg-gold-500/5 border-gold-500/20',")

    if name == 'ShumaClient.tsx':
        text = text.replace("'吉':'bg-jade-500/15 text-jade-600 border-jade-500/30'", "'吉':'bg-gold-500/15 text-gold-600 border-gold-500/30'")
        text = text.replace("'凶':'bg-zhuhong/10 text-zhuhong border-zhuhong/25'", "'凶':'bg-gold-500/10 text-gold-600 border-gold-500/25'")
        text = text.replace("'次吉':'bg-jade-500/10 text-jade-500 border-jade-500/25'", "'次吉':'bg-gold-500/10 text-gold-600 border-gold-500/25'")
        text = text.replace("'次凶':'bg-zhuhong/5 text-zhuhong/80 border-zhuhong/20'", "'次凶':'bg-gold-500/5 text-gold-600/80 border-gold-500/20'")
        text = text.replace("'大凶':'bg-zhuhong/15 text-zhuhong-dark border-zhuhong-dark/30'", "'大凶':'bg-gold-500/15 text-gold-700 border-gold-700/30'")
        text = text.replace("'小吉':'bg-jade-500/5 text-jade-500 border-jade-500/20'", "'小吉':'bg-gold-500/5 text-gold-600 border-gold-500/20'")

    # 紫微亮度/四化 → 金梯度（平留灰）
    if name == 'ziwei-data.ts' or name == 'ZiweiClient.tsx':
        text = text.replace("'庙': { label: '廟', color: 'text-gold-600',", "'庙': { label: '廟', color: 'text-gold-600',")
        text = text.replace("'旺': { label: '旺', color: 'text-jade-500',", "'旺': { label: '旺', color: 'text-gold-600',")
        text = text.replace("'得': { label: '得', color: 'text-shui-500',", "'得': { label: '得', color: 'text-gold-500',")
        text = text.replace("'利': { label: '利', color: 'text-tu-500',", "'利': { label: '利', color: 'text-gold-500',")
        text = text.replace("'不': { label: '不', color: 'text-zhuhong/80',", "'不': { label: '不', color: 'text-gold-500/80',")
        text = text.replace("'陷': { label: '陷', color: 'text-zhuhong',", "'陷': { label: '陷', color: 'text-gold-600',")
        text = text.replace("'禄': { label: '化祿', color: 'text-jade-500' },", "'禄': { label: '化祿', color: 'text-gold-500' },")
        text = text.replace("'权': { label: '化權', color: 'text-gold-600' },", "'权': { label: '化權', color: 'text-gold-600' },")
        text = text.replace("'科': { label: '化科', color: 'text-shui-500' },", "'科': { label: '化科', color: 'text-gold-500' },")
        text = text.replace("'忌': { label: '化忌', color: 'text-zhuhong' },", "'忌': { label: '化忌', color: 'text-gold-600' },")

    # 塔罗正逆/是非 → 金
    if name == 'tarot-data.ts':
        text = text.replace("return { label: '强烈是', color: 'text-jade-600' }", "return { label: '强烈是', color: 'text-gold-600' }")
        text = text.replace("return { label: '倾向是', color: 'text-jade-500' }", "return { label: '倾向是', color: 'text-gold-500' }")
        text = text.replace("return { label: '倾向否', color: 'text-zhuhong/80' }", "return { label: '倾向否', color: 'text-gold-500/80' }")
        text = text.replace("return { label: '强烈否', color: 'text-zhuhong' }", "return { label: '强烈否', color: 'text-gold-600' }")

    # DayunChart 纳音/NamingChars EL_BG → 金
    if name == 'DayunChart.tsx':
        text = text.replace("'金': 'border-gold-500/60 bg-gold-500/10',", "'金': 'border-gold-500/60 bg-gold-500/10',")
        text = text.replace("'木': 'border-jade-500/60 bg-jade-500/10',", "'木': 'border-gold-500/60 bg-gold-500/10',")
        text = text.replace("'水': 'border-shui-500/60 bg-shui-500/10',", "'水': 'border-gold-500/60 bg-gold-500/10',")
        text = text.replace("'火': 'border-zhuhong/60 bg-zhuhong/10',", "'火': 'border-gold-500/60 bg-gold-500/10',")
        text = text.replace("'土': 'border-tu-500/60 bg-tu-500/10',", "'土': 'border-gold-500/60 bg-gold-500/10',")
    if name == 'NamingChars.tsx':
        text = text.replace("jin: 'bg-gold-500/20', mu: 'bg-jade-500/20',", "jin: 'bg-gold-500/20', mu: 'bg-gold-500/20',")
        text = text.replace("shui: 'bg-shui-500/20', huo: 'bg-zhuhong/20', tu: 'bg-tu-500/20',", "shui: 'bg-gold-500/20', huo: 'bg-gold-500/20', tu: 'bg-gold-500/20',")

    return text

def main():
    changed = 0
    for p in files():
        orig = p.read_text(encoding='utf-8')
        out = hand_fixes(orig, p)
        out = process(out)
        if out != orig:
            p.write_text(out, encoding='utf-8')
            changed += 1
            print(f'  ✏️  {p.relative_to(ROOT)}')
    print(f'\n共修改 {changed} 个文件')

if __name__ == '__main__':
    main()
