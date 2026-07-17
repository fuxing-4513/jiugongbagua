#!/usr/bin/env python3
"""
九宫姓名全量重构 - 并发爬取版
从 www.kangxizidian.net 爬取字符数据
使用线程池加速，逐字保存到缓存
"""
import json, re, time, os, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Semaphore

BASE = "https://www.kangxizidian.net"
WORKDIR = os.path.dirname(os.path.abspath(__file__))
DATADIR = os.path.join(WORKDIR, "..", "data")
MAPPING_FILE = os.path.join(WORKDIR, "kangxi-char-id-map.json")
CACHE_DIR = os.path.join(WORKDIR, "kangxi-detail-cache")
OUTPUT_DIR = os.path.join(WORKDIR, "..", "data", "rebuild")
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
SEM = Semaphore(5)  # Max 5 concurrent requests

def fetch(url):
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except Exception:
            if attempt < 1:
                time.sleep(0.5)
            else:
                return None

def scrape_one(char, cid):
    """爬取单个字符"""
    fname = f"{ord(char):05d}-{char}.json"
    fpath = os.path.join(CACHE_DIR, fname)
    if os.path.exists(fpath):
        try:
            with open(fpath, encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    
    with SEM:
        html = fetch(f"{BASE}/zidian/{cid}/")
    
    if not html:
        return None
    
    data = {"zi": char, "kangxi_id": cid}
    
    # 通用字段提取
    pat = r'attr_name\">(?:<a[^>]*>)?([^<]+?)(?:</a>)?</span>\s*<span class=\"mr\">(?:<a[^>]*>)?([^<]+?)(?:</a>)?</span>'
    for m in re.finditer(pat, html):
        name = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        val = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        if name and val:
            mapping = {
                '拼音': 'pinyin', '注音': 'zhuyin', '五笔': 'wubi',
                '五行': 'wuxing', '统一码': 'tongyima', '笔顺': 'bishun',
                '名称': 'mingcheng', '部首': 'bushou'
            }
            if name in mapping:
                data[mapping[name]] = val
    
    # 总笔画
    m = re.search(r'总笔画</span><span class="mr"><a[^>]*>(\d+)画?', html)
    data['bihua'] = int(m.group(1)) if m else 0
    
    # 康熙笔画 (姓名学使用)
    m = re.search(r'康熙[筆笔][画畫][：:]\s*(\d+)', html)
    data['kangxi_bihua'] = int(m.group(1)) if m else data['bihua']
    
    # 结构
    m = re.search(r'结构</span><a[^>]*class="mr"[^>]*>([^<]+)</a>', html)
    if not m:
        m = re.search(r'结构</span><span class="mr">([^<]+)</span>', html)
    data['zixing'] = m.group(1).strip() if m else ''
    
    # 基本解释
    bs = re.search(r'基本解释.*?<div class="mtb">(.*?)(?=<h2>|$)', html, re.DOTALL)
    if bs:
        data['jiben_jieshi'] = re.sub(r'<[^>]+>', '', bs.group(1)[:2000]).strip()
    
    # 保存
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data

def run(char_map):
    total = len(char_map)
    
    # Count existing cache
    cached = set()
    for f in os.listdir(CACHE_DIR):
        if f.endswith(".json") and '-' in f:
            ch = f.split('-', 1)[1].replace('.json', '')
            cached.add(ch)
    
    todo = [(c, char_map[c]) for c in char_map if c not in cached]
    print(f"已有缓存: {len(cached)}, 待爬取: {len(todo)}/{total}")
    
    completed = len(cached)
    errors = 0
    t0 = time.time()
    
    with ThreadPoolExecutor(max_workers=10) as ex:
        futs = {ex.submit(scrape_one, c, cid): c for c, cid in todo}
        for fut in as_completed(futs):
            char = futs[fut]
            try:
                if fut.result() is not None:
                    completed += 1
                else:
                    errors += 1
                    print(f"  [ERR] {char} ({char_map[char]})")
            except Exception as e:
                errors += 1
            
            if (completed + errors - len(cached)) % 500 == 0:
                elapsed = time.time() - t0
                rate = (completed + errors - len(cached)) / elapsed if elapsed > 0 else 0
                eta = (len(todo) - (completed + errors - len(cached))) / rate if rate > 0 else 0
                print(f"  进度: {completed+errors-len(cached)}/{len(todo)} | 成功 {completed-len(cached)} | 失败 {errors} | {rate:.1f}/s | ETA {eta:.0f}s")
    
    print(f"\n✅ 完成! 成功 {completed}/{total}, 失败 {errors}")
    print(f"   耗时: {time.time()-t0:.0f}s")

if __name__ == "__main__":
    if not os.path.exists(MAPPING_FILE):
        print("❌ 无映射文件，请先运行 kangxi-v2.py idmap")
        sys.exit(1)
    
    with open(MAPPING_FILE, encoding="utf-8") as f:
        char_map = json.load(f)
    
    run(char_map)
    print("✅ 完成!")
