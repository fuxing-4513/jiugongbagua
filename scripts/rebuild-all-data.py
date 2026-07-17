#!/usr/bin/env python3
"""
Complete data rebuild: 
 - Read kangxi detail cache (all fields)
 - Merge with old backup (qimingJieshi, isJi)
 - Generate correct-format wuxing-list.json (per element) 
 - Generate correct-format wuxing-detail-*.json (per element)
 - Update kangxi.json
"""

import json, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(BASE, "scripts", "kangxi-detail-cache")
BACKUP = os.path.join(BASE, "data", "backup")
PUBLIC = os.path.join(BASE, "public", "data")
OUT = os.path.join(BASE, "out", "data")

WX_MAP = {"金": "jin", "木": "mu", "水": "shui", "火": "huo", "土": "tu"}
EL_NAMES = {"jin": "金", "mu": "木", "shui": "水", "huo": "火", "tu": "土"}

def clean_html(s):
    if not isinstance(s, str):
        return s
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# 1. Load all kangxi cache entries
all_cache = {}
for fname in os.listdir(CACHE):
    if not fname.endswith(".json"):
        continue
    path = os.path.join(CACHE, fname)
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        ch = d.get("zi", "")
        if ch and len(ch) == 1:
            # Merge: if duplicate, keep first (lower ID = better)
            if ch not in all_cache:
                all_cache[ch] = d
    except Exception as e:
        print(f"  WARN: {fname}: {e}")

print(f"Loaded {len(all_cache)} characters from kangxi cache")

# 2. Load old backup (for qimingJieshi, isJi)
old_details = {}  # char -> details dict
for el in ["jin", "mu", "shui", "huo", "tu"]:
    path = os.path.join(BACKUP, f"wuxing-detail-{el}.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        for ch, entry in data.items():
            if ch and isinstance(entry, dict) and len(ch) == 1:
                old_details[ch] = entry

# Also load old list for isJi
old_list = {}
path = os.path.join(BACKUP, "wuxing-list.json")
if os.path.exists(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict) and "chars" in data:
        for c in data["chars"]:
            if c.get("zi"):
                old_list[c["zi"]] = c

print(f"Loaded {len(old_details)} old detail entries, {len(old_list)} old list entries")

# 3. Build unified entry per character
by_wx = {el: [] for el in ["jin", "mu", "shui", "huo", "tu"]}
counts = {el: 0 for el in ["jin", "mu", "shui", "huo", "tu"]}

for ch in sorted(all_cache.keys(), key=lambda c: ord(c)):
    cache = all_cache[ch]
    wx_char = cache.get("wuxing", "").strip()
    el = WX_MAP.get(wx_char, "")
    if not el:
        continue

    old = old_details.get(ch, {})
    old_l = old_list.get(ch, {})

    kb = cache.get("kangxi_bihua")
    if kb is None or kb == 0:
        kb = cache.get("bihua", 1)
    if isinstance(kb, str) and kb.isdigit():
        kb = int(kb)
    
    # Kangxi cache field mapping
    entry = {
        # Char identity
        "zi": ch,
        "pinyin": cache.get("pinyin", ""),
        "zhuyin": cache.get("zhuyin", ""),
        "wubi": cache.get("wubi", ""),
        "cangjie": cache.get("cangjie", ""),
        "zhengma": cache.get("zhengma", ""),
        "sijiao": cache.get("sijiao", ""),
        "bihua": kb if isinstance(kb, int) else 1,
        "kangxiBihua": kb if isinstance(kb, int) else 1,
        "bushou": cache.get("bushou", ""),
        "bishun": cache.get("bishun", ""),
        "zixing": cache.get("zixing", ""),
        "tongyi": cache.get("tongyima", ""),
        
        # Wuxing
        "wuxingShuxing": wx_char,
        
        # Old fields (preserved from backup)
        "jixiong": old.get("jixiong", ""),
        "changyong": old.get("changyong", False),
        "xiantong": old.get("xiantong", False),
        "biaozhun": old.get("biaozhun", False),
        "yuyi": old.get("yuyi", ""),
        "qimingJieshi": old.get("qimingJieshi", ""),
        "tuijiandu": old.get("tuijiandu", ""),
        "wenhuaYinxiang": old.get("wenhuaYinxiang", ""),
        "zixingNum": old.get("zixingNum", 0),
        "zixingGender": old.get("zixingGender", ""),
        
        # Kangxi explanations
        "mingcheng": clean_html(cache.get("mingcheng", "")),
        "jibenJieshi": clean_html(cache.get("jiben_jieshi", "")),
        "yitiZi": clean_html(cache.get("yiti_zi", "")),
        "hanying": clean_html(cache.get("hanying", "")),
        "zaozifa": clean_html(cache.get("zaozifa", "")),
        "english": clean_html(cache.get("english", "")),
        "xiangxiJieshi": clean_html(cache.get("xiangxi_jieshi", "")),
        "kangxiZidian": clean_html(cache.get("kangxi_zidian", "")),
        "shuowen": clean_html(cache.get("shuowen", "")),
        "shuowenZhu": clean_html(cache.get("shuowen_zhu", "")),
        
        # Additional fields from xiangxi_jieshi
        "jibenCiyi": "",
        "cixingBianhua": "",
        "xiangguanZici": "",
        
        # isJi
        "isJi": old_l.get("isJi", old.get("isJi", False)),
    }
    
    # Try to extract 基本词义, 词形变化 from xiangxiJieshi
    xj = entry.get("xiangxiJieshi", "")
    if xj:
        # 基本词义 is usually first section after the header
        if "基本词义" in xj:
            parts = xj.split("基本词义", 1)
            if len(parts) > 1:
                bc = parts[1].split("词形变化")[0].strip()
                entry["jibenCiyi"] = bc[:200] if bc else ""
        if "词形变化" in xj:
            parts = xj.split("词形变化", 1)
            if len(parts) > 1:
                cb = parts[1].split("相关字词")[0].strip()
                entry["cixingBianhua"] = cb[:200] if cb else ""
        if "相关字词" in xj:
            parts = xj.split("相关字词", 1)
            if len(parts) > 1:
                xg = parts[1].strip()
                entry["xiangguanZici"] = xg[:200] if xg else ""
    
    # For list entry, use `wuxing` field (not wuxingShuxing)
    list_entry = {
        "zi": ch,
        "pinyin": entry["pinyin"],
        "bihua": entry["bihua"],
        "wuxing": wx_char,
        "isJi": entry["isJi"],
    }
    
    by_wx[el].append(entry)
    counts[el] += 1

print(f"\nChars per element:")
for el, cnt in counts.items():
    print(f"  {EL_NAMES[el]}: {cnt}")

# 4. Write wuxing-list-*.json (per element)
LIST_FILES = {
    "jin": "c5dc0cc7-wuxing-list-c3526e2d.json",
    "mu": "c5dc0cc7-wuxing-list-c3526e2d.json",
    "shui": "c5dc0cc7-wuxing-list-c3526e2d.json",
    "huo": "c5dc0cc7-wuxing-list-c3526e2d.json",
    "tu": "c5dc0cc7-wuxing-list-c3526e2d.json",
}
# Actually it's ONE file for all elements - but the component loads it per element
# The wxListPath function: /data/{PREFIX}-wuxing-{el}-{HASH}.json
# So it IS per element... wait no, the code shows: wxListPath(el) returns `/data/c5dc0cc7-wuxing-${el}-c3526e2d.json`
# But the file is named `c5dc0cc7-wuxing-list-c3526e2d.json`
# So the component loads the same file for every element! The el param seems to be ignored.

# Actually, looking at the code: wxListPath(el) -> returns `/data/${PREFIX}-wuxing-${el}-${HASH}.json`
# But the actual file is `wuxing-list-...`. So the PREFIX and HASH form: `c5dc0cc7-wuxing-list-c3526e2d.json`
# There's no element suffix for the list file. It's just one shared file.
# But the component fetches it with `wxListPath(activeEl)` - if the path doesn't include the element,
# the same file is loaded regardless of tab.

# Let me check what the anti-scrape module generates
# From earlier reading: wxListPath generates: `/data/${PREFIX}-wuxing-${el}-${HASH}.json`
# But the file is: `c5dc0cc7-wuxing-list-c3526e2d.json` (no el)
# So either the code was wrong and loaded 404, or the file was named differently before.

# ACTUALLY WAIT - looking at the data directory, we have:
# c5dc0cc7-wuxing-list-c3526e2d.json (one file)
# But wxListPath(el) would generate:
# c5dc0cc7-wuxing-jin-c3526e2d.json
# c5dc0cc7-wuxing-mu-c3526e2d.json
# etc.

# Those files DON'T EXIST. The only list file is `wuxing-list-...`
# So this means the component has been loading a 404 all this time!
# Unless... let me check if there's a redirect or fallback.

# Actually, maybe I should just generate files in the expected format.
# wxListPath(el) with el="jin" -> c5dc0cc7-wuxing-jin-c3526e2d.json

# Let me generate the correct list files per element too
LIST_FILES_BY_EL = {
    "jin": "c5dc0cc7-wuxing-jin-c3526e2d.json",
    "mu": "c5dc0cc7-wuxing-mu-c3526e2d.json",
    "shui": "c5dc0cc7-wuxing-shui-c3526e2d.json",
    "huo": "c5dc0cc7-wuxing-huo-c3526e2d.json",
    "tu": "c5dc0cc7-wuxing-tu-c3526e2d.json",
}

for el in ["jin", "mu", "shui", "huo", "tu"]:
    chars = by_wx[el]
    list_chars = []
    for entry in chars:
        list_chars.append({
            "zi": entry["zi"],
            "pinyin": entry["pinyin"],
            "bihua": entry["bihua"],
            "wuxing": entry["wuxingShuxing"],
            "isJi": entry["isJi"],
        })
    
    data = {
        "element": el,
        "elementName": EL_NAMES[el],
        "total": len(list_chars),
        "chars": list_chars,
    }
    
    fname = f"c5dc0cc7-wuxing-{el}-c3526e2d.json"
    
    # Write to public/data/
    fpath = os.path.join(PUBLIC, fname)
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"  Wrote {fpath} ({len(list_chars)} chars)")
    
    # Write to out/data/
    opath = os.path.join(OUT, fname)
    os.makedirs(OUT, exist_ok=True)
    with open(opath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

# 5. Write wuxing-detail-*.json (per element)
for el in ["jin", "mu", "shui", "huo", "tu"]:
    chars = by_wx[el]
    data = {
        "el": el,
        "name": EL_NAMES[el],
        "total": len(chars),
        "chars": chars,
    }
    
    fname = f"c5dc0cc7-wuxing-detail-{el}-c3526e2d.json"
    
    # Write to public/data/
    fpath = os.path.join(PUBLIC, fname)
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    
    # Write to out/data/
    opath = os.path.join(OUT, fname)
    with open(opath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

# 6. Update kangxi.json
KX_FILE = os.path.join(OUT, "c5dc0cc7-kangxi-c3526e2d.json")
if os.path.exists(KX_FILE):
    with open(KX_FILE, encoding="utf-8") as f:
        kx = json.load(f)
    print(f"\nExisting kangxi.json: {len(kx)} entries")
    
    # Update entries with kangxi cache data
    for entry in kx:
        ch = entry.get("z", "")
        if ch in all_cache:
            cache = all_cache[ch]
            wx_char = cache.get("wuxing", "").strip()
            kb = cache.get("kangxi_bihua")
            if kb is None or kb == 0:
                kb = cache.get("bihua", 1)
            entry["w"] = wx_char
            entry["b"] = kb if isinstance(kb, int) else 1
    
    with open(KX_FILE, "w", encoding="utf-8") as f:
        json.dump(kx, f, ensure_ascii=False, indent=1)
    print(f"Updated kangxi.json")

print(f"\n✅ All data files regenerated successfully!")
