#!/bin/bash
# LOC 中国善本馆藏检索（易/卜/术数关键词）
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
kw="$1"
curl -s --max-time 30 "https://www.loc.gov/collections/chinese-rare-books/?q=${kw}&fo=json" -H "User-Agent: $UA" -o "$LOCALAPPDATA/Temp/loc-$kw.json"
python - "$kw" << 'PYEOF'
import json, sys, os
kw = sys.argv[1]
p = os.path.join(os.environ['LOCALAPPDATA'], 'Temp', f'loc-{kw}.json')
try:
    d = json.load(open(p, encoding='utf-8'))
    res = d.get('results', [])
    print(f'== {kw}: {len(res)} 结果 ==')
    for r in res[:10]:
        title = (r.get('title') or '')[:60]
        date = (r.get('date') or '')[:20]
        mid = (r.get('id') or '').replace('https://www.loc.gov/item/', '').replace('/', '')
        parts = [x for x in (r.get('partof_title') or [])]
        print(f'- [{date}] {title} | id:{mid} | {parts[0][:30] if parts else ""}')
except Exception as e:
    print('解析失败:', e)
PYEOF
