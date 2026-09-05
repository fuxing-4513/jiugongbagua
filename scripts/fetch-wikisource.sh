#!/bin/bash
# 拉取维基文库纯文本并清洗 wikitext → 输出可用原文
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0"
out="$LOCALAPPDATA/Temp"
for pair in "坐忘論|zuowang-lun" "煙波釣叟歌|yanbo-diaosou-ge"; do
  name="${pair%%|*}"; fn="${pair##*|}"
  enc=$(python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$name")
  curl -s -L --max-time 25 "https://zh.wikisource.org/wiki/${enc}?action=raw" -H "User-Agent: $UA" -o "$out/$fn.raw"
  # 清洗：去 {{模板}} [[链接|文字]]→文字 <tag> 分类等
  python - "$out/$fn.raw" "$out/$fn.txt" <<'PYEOF'
import re, sys
raw = open(sys.argv[1], encoding='utf-8').read()
# 去模板 {{...}}（含嵌套近似）
while '{{' in raw:
    m = re.search(r'\{\{[^{}]*\}\}', raw)
    if not m: break
    raw = raw[:m.start()] + raw[m.end():]
# 去文件/分类行
raw = re.sub(r'\[\[File:[^\]]*\]\]', '', raw)
raw = re.sub(r'\[\[Category:[^\]]*\]\]', '', raw)
raw = re.sub(r'^\[\[[^\]|]*\|?', '', raw, flags=re.M)  # [[目标|文字]] 简化
raw = re.sub(r'\]\]', '', raw)
raw = re.sub(r'\[\[([^\]|]*)\]\]', r'\1', raw)
raw = re.sub(r"'''?", '', raw)  # 粗体
raw = re.sub(r'<[^>]+>', '', raw)  # 标签
raw = re.sub(r'\n{3,}', '\n\n', raw)
open(sys.argv[2], 'w', encoding='utf-8').write(raw.strip())
print(f"cleaned {len(raw)} chars -> {sys.argv[2]}")
PYEOF
done
