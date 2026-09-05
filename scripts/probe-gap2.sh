#!/bin/bash
# 探测缺口书在维基文库的文本可用性
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0"
books=(
  "太微賦|太微赋"
  "骨髓賦|骨髓赋"
  "繼善篇|继善篇"
  "金玉賦|金玉赋"
  "明通賦|明通赋"
  "蘭臺妙選|兰台妙选"
  "六壬畢法賦|六壬毕法赋"
  "董公選擇日時秘要|董公选日"
  "水龍經|水龙经"
  "地理辨正"
)
for b in "${books[@]}"; do
  name="${b%%|*}"
  enc=$(python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$name")
  raw=$(curl -s -L --max-time 15 "https://zh.wikisource.org/wiki/${enc}?action=raw" -H "User-Agent: $UA" 2>/dev/null)
  size=${#raw}
  if [ "$size" -lt 50 ]; then echo "$name → 无此页 ($size B)"
  elif echo "$raw" | grep -q "<pages"; then echo "$name → scan 版 ($size B)"
  elif echo "$raw" | grep -q "Disambig\|versions"; then echo "$name → 消歧义 ($size B)"
  else echo "$name → ✅ 文本 ($size B)"; fi
done
