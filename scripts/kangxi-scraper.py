#!/usr/bin/env python3
"""
九宫姓名板块全量重写 - 从 www.kangxizidian.net 爬取重构
严格按该网站数据，一字不差覆盖九宫所有字源数据

用法: python3 kangxi-scraper.py [phase]
  phase=index   - 第一阶段：爬索引页建立 char→ID 映射
  phase=detail  - 第二阶段：爬取每个字详情页
  phase=build   - 第三阶段：生成九宫数据文件
  phase=all     - 全部执行
"""

import json
import re
import time
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from html.parser import HTMLParser

BASE = "https://www.kangxizidian.net"
WORKDIR = os.path.dirname(os.path.abspath(__file__))
DATADIR = os.path.join(WORKDIR, "..", "data")
# 字符ID映射缓存
MAPPING_FILE = os.path.join(WORKDIR, "kangxi-char-id-map.json")
# 详情数据缓存
DETAIL_DIR = os.path.join(WORKDIR, "kangxi-detail-cache")
os.makedirs(DETAIL_DIR, exist_ok=True)
# 最终输出
OUTPUT_DIR = os.path.join(WORKDIR, "..", "data", "rebuild")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def fetch(url, retries=3):
    """带重试的HTTP GET"""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"  [FAIL] {url} - {e}")
                return None

def fetch_with_encoding(url, retries=3):
    """尝试不同编码获取页面"""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read()
                content_type = resp.headers.get("Content-Type", "")
                if "gbk" in content_type or "gb2312" in content_type:
                    return raw.decode("gbk", errors="replace")
                # Try utf-8 first
                try:
                    return raw.decode("utf-8")
                except:
                    # Fallback to gbk
                    try:
                        return raw.decode("gbk", errors="replace")
                    except:
                        return raw.decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"  [FAIL] {url} - {e}")
                return None

# ─── 阶段1：爬索引页建立 char→ID 映射 ───

def scrape_index_pages():
    """爬取现通表、最常用字、次常用字等索引页面，建立char→ID映射"""
    char_map = {}
    
    index_configs = [
        # (name, base_url, total_pages)
        ("最常用字", f"{BASE}/zidian/zuichangyongzi/", 9),
        ("次常用字", f"{BASE}/zidian/cichangyongzi/", 17),
        ("现通表", f"{BASE}/zidian/xiantongbiao/", 117),
    ]
    
    for name, base_url, total_pages in index_configs:
        print(f"\n📖 爬取{name} ({total_pages}页)...")
        for page in range(1, total_pages + 1):
            url = base_url if page == 1 else f"{base_url}index_{page}.html"
            html = fetch(url)
            if not html:
                continue
            # 提取字符→ID 映射
            # 形式: [char](http://www.kangxizidian.net/zidian/ID/)
            pattern = r'>([^<>\s]+?)</a></li>\s*<li><a[^>]*href="http://www\.kangxizidian\.net/zidian/(\d+)/'
            for match in re.finditer(r'<a[^>]*href="http://www\.kangxizidian\.net/zidian/(\d+)/"[^>]*>([^<]+?)</a>', html):
                char_id = match.group(1)
                # Extract the character - might be in the text or before in the pattern
                link_text = match.group(2).strip()
                # Remove the pinyin prefix (e.g., "bā八" -> "八", "ā á ǎ à a啊" -> "啊")
                # The format is typically: [pinyin list][char]
                # Find the Chinese character(s) at the end
                chars_found = re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]', link_text)
                for ch in chars_found:
                    if ch not in char_map:
                        char_map[ch] = char_id
        
            if page % 10 == 0:
                print(f"  {name} 第{page}/{total_pages}页完成, 当前已映射 {len(char_map)} 个字符")
            time.sleep(0.3)
    
    # 补充：从笔画索引页爬
    print("\n📖 从笔画索引页补充...")
    for strokes in range(1, 31):
        url = f"{BASE}/bihua/{strokes}/"
        html = fetch(url)
        if not html:
            continue
        for match in re.finditer(r'<a[^>]*href="http://www\.kangxizidian\.net/zidian/(\d+)/"[^>]*>([^<]+?)</a>', html):
            char_id = match.group(1)
            link_text = match.group(2).strip()
            chars_found = re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]', link_text)
            for ch in chars_found:
                if ch not in char_map:
                    char_map[ch] = char_id
        if strokes % 5 == 0:
            print(f"  笔画{strokes}画完成, 当前 {len(char_map)} 个字符")
        time.sleep(0.3)
    
    # 保存
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(char_map, f, ensure_ascii=False, indent=1)
    print(f"\n✅ 映射完成！共 {len(char_map)} 个字符")
    return char_map


# ─── 阶段2：爬取详情页数据 ───

def parse_character_page(html, char_id):
    """解析单个字符详情页，返回结构化数据"""
    data = {}
    
    # 拼音: <p class="pinyin">yuè</p> 或出现在 h1 附近
    pinyin_match = re.search(r'拼音[：:]\s*</span>\s*<span[^>]*>([^<]+)</span>', html)
    if not pinyin_match:
        pinyin_match = re.search(r'<p[^>]*class=["\']pinyin["\'][^>]*>([^<]+)</p>', html)
    if not pinyin_match:
        # Try to find in the header
        pinyin_match = re.search(r'href="/duyin/zi-\d+\.html"[^>]*>([^<]+)</a>', html)
    data["pinyin"] = pinyin_match.group(1).strip() if pinyin_match else ""
    
    # 注音: 出现在拼音旁边
    zhuyin_match = re.search(r'注音([^<]+)</', html)
    data["zhuyin"] = zhuyin_match.group(1).strip() if zhuyin_match else ""
    
    # 部首
    bushou_match = re.search(r'[部首][：:]\s*</span>\s*<span[^>]*>\s*<a[^>]*>([^<]+)</a>', html)
    if not bushou_match:
        bushou_match = re.search(r'部首[：:]\s*</span>\s*<a[^>]*>([^<]+)</a>', html)
    if not bushou_match:
        bushou_match = re.search(r'[部首]\s*</span>\s*<a[^>]*>([^<]+)</a>', html)
    if not bushou_match:
        bushou_match = re.search(r'[部首][：:]\s*([^<\n]+)', html)
    data["bushou"] = bushou_match.group(1).strip() if bushou_match else ""
    
    # 总笔画
    bihua_match = re.search(r'总笔画\[?(\d+)[画]?\]?', html)
    if not bihua_match:
        bihua_match = re.search(r'[总][画][：:]\s*</span>\s*<a[^>]*>(\d+)[画]', html)
    if not bihua_match:
        bihua_match = re.search(r'笔[画划][：:]\s*(\d+)', html)
    data["bihua"] = int(bihua_match.group(1)) if bihua_match else 0
    
    # 康熙笔画
    kangxi_bihua_match = re.search(r'康熙[筆笔画][画]?[：:]?\s*(\d+)', html)
    if not kangxi_bihua_match:
        kangxi_bihua_match = re.search(r'康熙筆画[：:]?\s*(\d+)', html)
    data["kangxi_bihua"] = int(kangxi_bihua_match.group(1)) if kangxi_bihua_match else data["bihua"]
    
    # 结构
    jiegou_match = re.search(r'结构[：:]\s*([^<\n]+)', html)
    if not jiegou_match:
        jiegou_match = re.search(r'结构[：:]\s*</span>\s*<a[^>]*>([^<]+)</a>', html)
    data["zixing"] = jiegou_match.group(1).strip() if jiegou_match else ""
    
    # 五笔
    wubi_match = re.search(r'五笔[：:]\s*</span>\s*<span[^>]*>([^<]+)</span>', html)
    if not wubi_match:
        wubi_match = re.search(r'五笔[：:]\s*([A-Za-z]+)', html)
    data["wubi"] = wubi_match.group(1).strip() if wubi_match else ""
    
    # 五行
    wuxing_match = re.search(r'五行[：:]\s*</span>\s*<a[^>]*>([^<]+)</a>', html)
    if not wuxing_match:
        wuxing_match = re.search(r'五行[：:]\s*<a[^>]*>([^<]+)</a>', html)
    if not wuxing_match:
        wuxing_match = re.search(r'五行[：:]\s*([^<\n]+)', html)
    data["wuxing"] = wuxing_match.group(1).strip() if wuxing_match else ""
    
    # 笔顺
    bishun_match = re.search(r'笔顺[：:]\s*</span>\s*<span[^>]*>([^<]+)</span>', html)
    if not bishun_match:
        bishun_match = re.search(r'笔顺[：:]\s*([^<\n]+)', html)
    if not bishun_match:
        bishun_match = re.search(r'笔顺[：:]\s*([A-Za-z\-\/\\,，\s]+)', html)
    data["bishun"] = bishun_match.group(1).strip() if bishun_match else ""
    
    # 基本解释区域
    basic_explain_match = re.search(r'## 基本解释\s*\n(.*?)(?=\n##|\Z)', html, re.DOTALL)
    if not basic_explain_match:
        basic_explain_match = re.search(r'### 基本字义\s*\n(.*?)(?=\n###|\Z)', html, re.DOTALL)
    if basic_explain_match:
        data["jiben_jieshi"] = basic_explain_match.group(1).strip()
    
    # 异体字
    yiti_match = re.search(r'### 异体字\s*\n(.*?)(?=\n###|\Z)', html, re.DOTALL)
    if yiti_match:
        data["yiti_zi"] = yiti_match.group(1).strip()
    
    # 汉英互译
    hanying_match = re.search(r'### 汉英互译\s*\n(.*?)(?=\n###|\Z)', html, re.DOTALL)
    if hanying_match:
        data["hanying"] = hanying_match.group(1).strip()
    
    # 造字法
    zaozifa_match = re.search(r'### 造字法\s*\n(.*?)(?=\n###|\Z)', html, re.DOTALL)
    if zaozifa_match:
        data["zaozifa"] = zaozifa_match.group(1).strip()
    
    # English
    english_match = re.search(r'### English\s*\n(.*?)(?=\n※|\Z)', html, re.DOTALL)
    if english_match:
        data["english"] = english_match.group(1).strip()
    
    # 详细解释区域
    detail_match = re.search(r'## 详细解释\s*\n(.*?)(?=\n##|\Z)', html, re.DOTALL)
    if detail_match:
        detail_text = detail_match.group(1).strip()
        # Extract 基本词义
        jibenciyi_match = re.search(r'### 基本词义\s*\n(.*?)(?=\n###|\Z)', detail_text, re.DOTALL)
        if jibenciyi_match:
            data["jiben_ciyi"] = jibenciyi_match.group(1).strip()
        # The rest of 详细解释 without sub-headers
        rest_detail = re.sub(r'### 基本词义\s*\n.*?(?=\n###|\Z)', '', detail_text, flags=re.DOTALL)
        rest_detail = re.sub(r'###\s+', '### ', rest_detail)
        data["xiangxi_jieshi"] = rest_detail.strip()
    
    # 康熙字典
    kangxi_match = re.search(r'## 康熙字典\s*\n(.*?)(?=\n##|\Z)', html, re.DOTALL)
    if kangxi_match:
        data["kangxi_zidian"] = kangxi_match.group(1).strip()
    
    # 说文解字
    shuowen_match = re.search(r'## 说文解字\s*\n(.*?)(?=\n##|\Z)', html, re.DOTALL)
    if shuowen_match:
        data["shuowen"] = shuowen_match.group(1).strip()
    
    # 说文解字注
    shuowen_zhu_match = re.search(r'### 说文解字注\s*\n(.*?)(?=\n##|\Z)', html, re.DOTALL)
    if shuowen_zhu_match:
        data["shuowen_zhu"] = shuowen_zhu_match.group(1).strip()
    
    # 统一码
    tongyima_match = re.search(r'统一码\s*([A-Za-z0-9]+)', html)
    data["tongyima"] = tongyima_match.group(1).strip() if tongyima_match else ""
    
    # 名称(笔顺名称)
    mingcheng_match = re.search(r'名称\s*([^<\n]+)', html)
    if mingcheng_match:
        data["mingcheng"] = mingcheng_match.group(1).strip()
    
    return data


def scrape_character_detail(char, char_id):
    """爬取单个字符的详情页"""
    url = f"{BASE}/zidian/{char_id}/"
    # Use web_fetch - but since we're in a python script, use urllib
    html = fetch(url)
    if not html:
        return None
    
    data = parse_character_page(html, char_id)
    data["zi"] = char
    data["kangxi_id"] = char_id
    
    return data


def scrape_all_details(char_map):
    """爬取所有字符详情"""
    # 先从已有缓存加载
    results = {}
    cache_files = [f for f in os.listdir(DETAIL_DIR) if f.endswith(".json")]
    for cf in cache_files:
        with open(os.path.join(DETAIL_DIR, cf), "r", encoding="utf-8") as f:
            ch = cf.replace(".json", "")
            if ch:
                try:
                    data = json.load(f)
                    results[ch] = data
                except:
                    pass
    
    print(f"\n📖 已有缓存 {len(results)} 个字符，还需爬取 {len(char_map) - len(results)} 个")
    
    chars_list = list(char_map.items())
    total = len(chars_list)
    
    for idx, (char, char_id) in enumerate(chars_list):
        if char in results:
            continue
        
        data = scrape_character_detail(char, char_id)
        if data:
            results[char] = data
            # Save individual cache
            safe_name = char.encode("unicode_escape").decode()
            with open(os.path.join(DETAIL_DIR, f"{safe_name}.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        
        if (idx + 1) % 50 == 0:
            print(f"  进度: {idx+1}/{total} ({len(results)} 已缓存)")
            # Save intermediate full results
            save_intermediate(results)
        
        # Rate limiting - 300ms between requests
        time.sleep(0.3)
    
    print(f"\n✅ 详情页爬取完成！共 {len(results)} 个字符")
    return results


def save_intermediate(results):
    """保存中间结果"""
    outfile = os.path.join(OUTPUT_DIR, "kangxi-all-data.json")
    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)
    print(f"  [SAVE] 已保存 {len(results)} 条数据到 {outfile}")


# ─── 阶段3：生成九宫数据文件 ───

def rebuild_data_files(all_data):
    """用爬取的数据重新生成 wuxing-detail-*.json 文件"""
    
    # 读取现有数据文件作为模板（保留原有分类结构）
    detail_files = {}
    for el in ["jin", "mu", "shui", "huo", "tu"]:
        fname = os.path.join(DATADIR, f"wuxing-detail-{el}.json")
        with open(fname, "r", encoding="utf-8") as f:
            detail_files[el] = json.load(f)
    
    # 新的数据分类
    wuxing_map = {"金": [], "木": [], "水": [], "火": [], "土": []}
    wuxing_counts = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
    
    # 从现有数据获取基本的字符结构，但用爬取的数据覆盖字段
    for el in ["jin", "mu", "shui", "huo", "tu"]:
        wx_name = {"jin": "金", "mu": "木", "shui": "水", "huo": "火", "tu": "土"}[el]
        old_data = detail_files[el]
        
        new_chars = {}
        for char, old_info in old_data.items():
            if char in ("el", "name", "total", "generated", "source", "byElement", "chars"):
                continue
            
            if isinstance(old_info, dict):
                info = old_info.copy()
            else:
                info = {}
            
            # 如果爬取到了该字的数据，覆盖字段
            if char in all_data:
                new_info = all_data[char]
                info["pinyin"] = new_info.get("pinyin", info.get("pinyin", ""))
                info["zhuyin"] = new_info.get("zhuyin", info.get("zhuyin", ""))
                info["bushou"] = new_info.get("bushou", info.get("bushou", ""))
                info["bihua"] = new_info.get("bihua", info.get("bihua", 0))
                info["kangxiBihua"] = new_info.get("kangxi_bihua", info.get("kangxiBihua", 0))
                info["wubi"] = new_info.get("wubi", info.get("wubi", ""))
                info["bishun"] = new_info.get("bishun", info.get("bishun", ""))
                info["zixing"] = new_info.get("zixing", info.get("zixing", ""))
                info["wuxingShuxing"] = new_info.get("wuxing", info.get("wuxingShuxing", ""))
                info["tongyima"] = new_info.get("tongyima", info.get("tongyima", ""))
                info["mingcheng"] = new_info.get("mingcheng", info.get("mingcheng", ""))
                info["jibenJieshi"] = new_info.get("jiben_jieshi", info.get("jibenJieshi", ""))
                info["yitiZi"] = new_info.get("yiti_zi", info.get("yitiZi", ""))
                info["hanying"] = new_info.get("hanying", info.get("hanying", ""))
                info["zaozifa"] = new_info.get("zaozifa", info.get("zaozifa", ""))
                info["english"] = new_info.get("english", info.get("english", ""))
                info["xiangxiJieshi"] = new_info.get("xiangxi_jieshi", info.get("xiangxiJieshi", ""))
                info["jibenCiyi"] = new_info.get("jiben_ciyi", info.get("jibenCiyi", ""))
                info["kangxiZidian"] = new_info.get("kangxi_zidian", info.get("kangxiZidian", ""))
                info["shuowen"] = new_info.get("shuowen", info.get("shuowen", ""))
                info["shuowenZhu"] = new_info.get("shuowen_zhu", info.get("shuowenZhu", ""))
                
                # 更新五行分类
                new_wx = new_info.get("wuxing", "")
                if new_wx in wuxing_map:
                    # 如果五行变了，不要加到新分类里（后面统一处理）
                    pass
            
            # 用正确的五行分类
            new_wx = info.get("wuxingShuxing", "").strip()
            if new_wx in wuxing_map:
                wuxing_map[new_wx][char] = info
                wuxing_counts[new_wx] += 1
            
            new_chars[char] = info
        
        # 保存更新后的文件
        outfile = os.path.join(OUTPUT_DIR, f"wuxing-detail-{el}.json")
        # Keep the original structure but with updated data
        with open(outfile, "w", encoding="utf-8") as f:
            json.dump(new_chars, f, ensure_ascii=False, indent=1)
        print(f"  {el} ({wx_name}): {len(new_chars)} 字 → {outfile}")
    
    # Also regenerate the wuxing-list.json
    print("\n📦 五行统计:", wuxing_counts)
    
    # 生成 NamingClient.tsx 的 STROKE 更新
    generate_stroke_update(all_data)


def generate_stroke_update(all_data):
    """生成 NamingClient.tsx 的 STROKE 字典更新"""
    stroke_lines = []
    for char, data in sorted(all_data.items(), key=lambda x: ord(x[0])):
        bihua = data.get("kangxi_bihua") or data.get("bihua", 0)
        if bihua:
            stroke_lines.append(f"  '{char}':{bihuai}")
    
    outfile = os.path.join(OUTPUT_DIR, "STROKE_replacement.txt")
    with open(outfile, "w", encoding="utf-8") as f:
        f.write("const STROKE: Record<string, number> = {\n")
        f.write(",\n".join(stroke_lines))
        f.write("\n}\n")
    print(f"\n✅ STROKE 更新已保存到 {outfile} ({len(stroke_lines)} 字)")


# ─── 主流程 ───

if __name__ == "__main__":
    phase = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    if phase in ("index", "all"):
        print("=" * 60)
        print("阶段1: 爬取索引页建立 char→ID 映射")
        print("=" * 60)
        char_map = scrape_index_pages()
    else:
        if os.path.exists(MAPPING_FILE):
            with open(MAPPING_FILE, "r", encoding="utf-8") as f:
                char_map = json.load(f)
            print(f"已加载映射: {len(char_map)} 个字符")
        else:
            print("❌ 映射文件不存在，请先运行 index 阶段")
            sys.exit(1)
    
    if phase in ("detail", "all"):
        print("\n" + "=" * 60)
        print("阶段2: 爬取详情页数据")
        print("=" * 60)
        all_data = scrape_all_details(char_map)
        save_intermediate(all_data)
    else:
        all_data_file = os.path.join(OUTPUT_DIR, "kangxi-all-data.json")
        if os.path.exists(all_data_file):
            with open(all_data_file, "r", encoding="utf-8") as f:
                all_data = json.load(f)
            print(f"已加载详情数据: {len(all_data)} 个字符")
        else:
            all_data = {}
            print("⚠️ 无详情数据")
    
    if phase in ("build", "all"):
        print("\n" + "=" * 60)
        print("阶段3: 生成九宫数据文件")
        print("=" * 60)
        rebuild_data_files(all_data)
    
    print("\n✅ 完成！")
