#!/usr/bin/env python3
"""
九宫姓名全量重构 v2 - 从 www.kangxizidian.net 爬取
分阶段执行：
  phase=idmap   → 建字符→ID映射（最常用字/次常用字/现通表/笔画索引）
  phase=detail  → 爬每个字符详情页
  phase=build   → 生成九宫数据文件
"""
import json, re, time, os, sys, urllib.request, urllib.error

BASE = "https://www.kangxizidian.net"
WORKDIR = os.path.dirname(os.path.abspath(__file__))
DATADIR = os.path.join(WORKDIR, "..", "data")
MAPPING_FILE = os.path.join(WORKDIR, "kangxi-char-id-map.json")
CACHE_DIR = os.path.join(WORKDIR, "kangxi-detail-cache")
OUTPUT_DIR = os.path.join(WORKDIR, "..", "data", "rebuild")
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch(url):
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except Exception as e:
            if attempt < 1:
                time.sleep(1)
            else:
                return None

# ════════════════════════════════════════
# 阶段1: 建映射
# ════════════════════════════════════════

def build_id_map():
    char_map = {}
    
    # 从现通表(7000字)索引页提取
    index_configs = [
        ("zuichangyongzi", 9, "最常用字"),
        ("cichangyongzi", 17, "次常用字"),
        ("xiantongbiao", 117, "现通表"),
    ]
    
    for name, total, label in index_configs:
        for page in range(1, total + 1):
            url = f"{BASE}/zidian/{name}/" if page == 1 else f"{BASE}/zidian/{name}/index_{page}.html"
            html = fetch(url)
            if not html:
                continue
            # <a href="http://www.kangxizidian.net/zidian/ID/" title="CHAR">
            for m in re.finditer(r'/zidian/(\d+)/"\s+title="([^"]+)"', html):
                cid, chars_in_title = m.group(1), m.group(2)
                # The character is in the title attribute and also in the link text
                for ch in re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]', chars_in_title):
                    if ch not in char_map:
                        char_map[ch] = cid
            if page % 20 == 0:
                print(f"  {label} {page}/{total} → {len(char_map)} chars")
    
    # 从30个笔画页补充
    print("\n📖 笔画索引页...")
    for bi in range(1, 31):
        html = fetch(f"{BASE}/bihua/{bi}/")
        if html:
            for m in re.finditer(r'/zidian/(\d+)/"\s+title="([^"]+)"', html):
                cid, ch = m.group(1), m.group(2)
                for c in re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]', ch):
                    if c not in char_map:
                        char_map[c] = cid
    
    # Save
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(char_map, f, ensure_ascii=False, indent=1)
    print(f"\n✅ 映射完成: {len(char_map)} 个字符")
    return char_map

# ════════════════════════════════════════
# 阶段2: 爬详情
# ════════════════════════════════════════

def scrape_detail(char, cid):
    """爬取单个字符详情"""
    cache_file = os.path.join(CACHE_DIR, f"{ord(char):05d}-{char}.json")
    if os.path.exists(cache_file):
        with open(cache_file, encoding="utf-8") as f:
            return json.load(f)
    
    html = fetch(f"{BASE}/zidian/{cid}/")
    if not html:
        return None
    
    data = {"zi": char, "kangxi_id": cid}
    
    # 通用模式: 处理所有<span class="mr">中的字段（值可能在<a>标签里）
    pat = r'attr_name\">(?:<a[^>]*>)?([^<]+?)(?:</a>)?</span>\s*<span class=\"mr\">(?:<a[^>]*>)?([^<]+?)(?:</a>)?</span>'
    for m in re.finditer(pat, html):
        name = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        val = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        if name and val:
            if name == '拼音':
                data['pinyin'] = val
            elif name == '注音':
                data['zhuyin'] = val
            elif name == '五笔':
                data['wubi'] = val
            elif name == '五行':
                data['wuxing'] = val
            elif name == '统一码':
                data['tongyima'] = val
            elif name == '笔顺':
                data['bishun'] = val
            elif name == '名称':
                data['mingcheng'] = val
            elif name == '部首':
                data['bushou'] = val
    
    # 确保部首有值（备用提取）
    if not data.get('bushou'):
        m = re.search(r'部首</span><span class="mr"><a[^>]*>([^<]+)<', html)
        data['bushou'] = m.group(1).strip() if m else ''
    
    # 总笔画 (从 <a href=".../bihua/N/">N画</a> 提取)
    m = re.search(r'总笔画</span><span class="mr"><a[^>]*>(\d+)画?', html)
    data['bihua'] = int(m.group(1)) if m else 0
    
    # 康熙笔画 (从 "康熙筆画：NN画" 提取 - 姓名学使用的笔画)
    m = re.search(r'康熙[筆笔][画畫][：:][\s]*(\d+)', html)
    data['kangxi_bihua'] = int(m.group(1)) if m else 0
    
    # 结构
    m = re.search(r'结构</span><a[^>]*class="mr"[^>]*>([^<]+)</a>', html)
    if not m:
        m = re.search(r'结构</span><span class="mr">([^<]+)</span>', html)
    data['zixing'] = m.group(1).strip() if m else ''
    
    # ── 基本解释 ──
    basic_section = re.search(r'基本解释.*?</h2>(.*?)(?=<h2>|<div class="gclear)', html, re.DOTALL)
    if basic_section:
        section = basic_section.group(1)
        # 基本字义
        ziyi = re.search(r'基本字义(.*?)(?=<h3>|$)', section, re.DOTALL)
        data["jiben_jieshi"] = ziyi.group(1).strip() if ziyi else ""
        # 异体字
        yiti = re.search(r'异体字.*?</h3>(.*?)(?=<h3>|$)', section, re.DOTALL)
        if yiti:
            # Remove HTML tags
            data["yiti_zi"] = re.sub(r'<[^>]+>', '', yiti.group(1)).strip()
        # 汉英
        hy = re.search(r'汉英互译.*?</h3>(.*?)(?=<h3>|$)', section, re.DOTALL)
        data["hanying"] = hy.group(1).strip() if hy else ""
        # 造字法
        zzf = re.search(r'造字法.*?</h3>(.*?)(?=<h3>|$)', section, re.DOTALL)
        data["zaozifa"] = zzf.group(1).strip() if zzf else ""
        # English
        eng = re.search(r'English.*?</h3>(.*?)(?=<h3>|$|※)', section, re.DOTALL)
        data["english"] = eng.group(1).strip() if eng else ""
    
    # ── 详细解释 ──
    detail_section = re.search(r'<h2>详细解释</h2>(.*?)(?=<h2>|<br\s*/>\s*<br\s*/>\s*相关词语)', html, re.DOTALL)
    if detail_section:
        section = detail_section.group(1)
        data["xiangxi_jieshi"] = re.sub(r'<[^>]+>', '', section[:3000]).strip()
    
    # ── 康熙字典 ──
    kx = re.search(r'<h2>康熙字典</h2>(.*?)(?=<h2>|$)', html, re.DOTALL)
    if kx:
        data["kangxi_zidian"] = re.sub(r'<[^>]+>', '', kx.group(1)[:3000]).strip()
    
    # ── 说文解字 ──
    sw = re.search(r'<h2>说文解字</h2>(.*?)(?=<h2>|$)', html, re.DOTALL)
    if sw:
        data["shuowen"] = re.sub(r'<[^>]+>', '', sw.group(1)[:2000]).strip()
    
    # 说文解字注
    swz = re.search(r'说文解字注.*?</h3>(.*?)(?=<h3>|$)', html, re.DOTALL)
    if swz:
        data["shuowen_zhu"] = re.sub(r'<[^>]+>', '', swz.group(1)[:2000]).strip()
    
    # 保存缓存
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data

def scrape_all_details(char_map):
    """爬取所有字符详情"""
    results = {}
    # 加载已有缓存
    for f in os.listdir(CACHE_DIR):
        if f.endswith(".json"):
            with open(os.path.join(CACHE_DIR, f), encoding="utf-8") as fh:
                try:
                    d = json.load(fh)
                    results[d.get("zi", "")] = d
                except:
                    pass
    
    chars_to_do = [c for c in char_map if c not in results]
    total = len(chars_to_do)
    print(f"\n📖 已有缓存 {len(results)}，还需爬取 {total} 个")
    
    for i, char in enumerate(chars_to_do):
        cid = char_map[char]
        data = scrape_detail(char, cid)
        if data:
            results[char] = data
        
        if (i + 1) % 100 == 0:
            print(f"  进度: {i+1}/{total} (总计 {len(results)})")
            save_intermediate(results)
    
    print(f"\n✅ 详情完成! 共 {len(results)} 字")
    return results

def save_intermediate(data):
    out = os.path.join(OUTPUT_DIR, "kangxi-all-data.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"  [SAVE] {len(data)} 条")

# ════════════════════════════════════════
# 阶段3: 生成九宫数据
# ════════════════════════════════════════

def rebuild(all_data):
    """用爬取数据重新生成所有数据文件"""
    print("\n📦 生成五行数据文件...")
    
    # 读取现有文件保留结构
    wx_names = {"jin": "金", "mu": "木", "shui": "水", "huo": "火", "tu": "土"}
    
    for el, wx_name in wx_names.items():
        src_file = os.path.join(DATADIR, f"wuxing-detail-{el}.json")
        if os.path.exists(src_file):
            with open(src_file, encoding="utf-8") as f:
                old_data = json.load(f)
        else:
            old_data = {}
        
        # 用爬取的数据更新现有关键字段
        for char, info in old_data.items():
            if char in ("el", "name", "total") or not isinstance(info, dict):
                continue
            if char in all_data:
                nd = all_data[char]
                info["pinyin"] = nd.get("pinyin", info.get("pinyin", ""))
                info["zhuyin"] = nd.get("zhuyin", info.get("zhuyin", ""))
                info["bushou"] = nd.get("bushou", info.get("bushou", ""))
                info["bihua"] = nd.get("bihua", info.get("bihua", 0))
                info["kangxiBihua"] = nd.get("kangxi_bihua", nd.get("bihua", info.get("kangxiBihua", 0)))
                info["wubi"] = nd.get("wubi", info.get("wubi", ""))
                info["bishun"] = nd.get("bishun", info.get("bishun", ""))
                info["zixing"] = nd.get("zixing", info.get("zixing", ""))
                info["wuxingShuxing"] = nd.get("wuxing", info.get("wuxingShuxing", ""))
                info["jibenJieshi"] = nd.get("jiben_jieshi", info.get("jibenJieshi", ""))
                info["yitiZi"] = nd.get("yiti_zi", info.get("yitiZi", ""))
                info["hanying"] = nd.get("hanying", info.get("hanying", ""))
                info["zaozifa"] = nd.get("zaozifa", info.get("zaozifa", ""))
                info["english"] = nd.get("english", info.get("english", ""))
                info["xiangxiJieshi"] = nd.get("xiangxi_jieshi", info.get("xiangxiJieshi", ""))
                info["kangxiZidian"] = nd.get("kangxi_zidian", info.get("kangxiZidian", ""))
                info["shuowen"] = nd.get("shuowen", info.get("shuowen", ""))
                info["shuowenZhu"] = nd.get("shuowen_zhu", info.get("shuowenZhu", ""))
                info["mingcheng"] = nd.get("mingcheng", info.get("mingcheng", ""))
                info["tongyima"] = nd.get("tongyima", info.get("tongyima", ""))
        
        outfile = os.path.join(OUTPUT_DIR, f"wuxing-detail-{el}.json")
        with open(outfile, "w", encoding="utf-8") as f:
            json.dump(old_data, f, ensure_ascii=False, indent=1)
        print(f"  ✅ {el}({wx_name}): 已更新")
    
    # 生成 STROKE 更新 (使用康熙笔画，这是姓名学使用的笔画)
    print("\n📦 生成 STROKE 更新 (康熙笔画)...")
    strokes = {}
    for char, data in sorted(all_data.items(), key=lambda x: ord(x[0])):
        stroke = data.get("kangxi_bihua", 0) or data.get("bihua", 0)
        if stroke and stroke > 0:
            strokes[char] = stroke
    
    with open(os.path.join(OUTPUT_DIR, "STROKE.json"), "w", encoding="utf-8") as f:
        json.dump(strokes, f, ensure_ascii=False, indent=1)
    
    # 生成TS格式
    lines = []
    for ch, s in sorted(strokes.items(), key=lambda x: ord(x[0])):
        lines.append(f"  '{ch}':{s}")
    
    ts_content = "const STROKE: Record<string, number> = {\n" + ",\n".join(lines) + "\n}\n"
    with open(os.path.join(OUTPUT_DIR, "STROKE.ts"), "w", encoding="utf-8") as f:
        f.write(ts_content)
    
    print(f"  ✅ STROKE: {len(strokes)} 字")


# ════════════════════════════════════════
# MAIN
# ════════════════════════════════════════

if __name__ == "__main__":
    phase = sys.argv[1] if len(sys.argv) > 1 else "idmap"
    
    if phase == "idmap":
        print("=" * 50)
        print("阶段1: 建字符→ID映射")
        print("=" * 50)
        build_id_map()
    
    elif phase == "detail":
        if os.path.exists(MAPPING_FILE):
            with open(MAPPING_FILE, encoding="utf-8") as f:
                char_map = json.load(f)
            print(f"已加载映射: {len(char_map)} 字符")
        else:
            # Try building first
            print("⚠️ 无映射文件，先建映射...")
            char_map = build_id_map()
        
        scrape_all_details(char_map)
    
    elif phase == "build":
        data_file = os.path.join(OUTPUT_DIR, "kangxi-all-data.json")
        if os.path.exists(data_file):
            with open(data_file, encoding="utf-8") as f:
                all_data = json.load(f)
            rebuild(all_data)
        else:
            print("❌ 无数据文件")
    
    elif phase == "all":
        print("=" * 50)
        print("阶段1: 建映射")
        print("=" * 50)
        cm = build_id_map()
        print("\n" + "=" * 50)
        print("阶段2: 爬详情")
        print("=" * 50)
        ad = scrape_all_details(cm)
        print("\n" + "=" * 50)
        print("阶段3: 生成文件")
        print("=" * 50)
        rebuild(ad)
    
    print("\n✅ 完成！")
