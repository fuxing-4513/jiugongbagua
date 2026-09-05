#!/bin/bash
# 探测维基文库候选古籍文本可用性（<pages>=scan 扫描版不可采；纯文本可采）
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0"
books=(
  "靈棋經|灵棋经"
  "周易參同契|周易参同契"
  "悟真篇"
  "坐忘論|坐忘论"
  "麻衣相法"
  "煙波釣叟歌|烟波钓叟歌"
  "葬書|葬书"
  "雪心賦|雪心赋"
  "太玄經|太玄经"
  "大六壬指南"
)
for b in "${books[@]}"; do
  name="${b%%|*}"
  enc=$(python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$name")
  raw=$(curl -s -L --max-time 20 "https://zh.wikisource.org/wiki/${enc}?action=raw" -H "User-Agent: $UA" 2>/dev/null)
  size=${#raw}
  if [ "$size" -lt 50 ]; then
    echo "$name → 无此页/重定向 ($size B)"
  elif echo "$raw" | grep -q "<pages"; then
    echo "$name → ❌ scan 版 ($size B)"
  elif echo "$raw" | grep -q "Disambig\|versions\|Template:"; then
    echo "$name → ⚠️ 消歧义/模板页 ($size B)"
  else
    echo "$name → ✅ 纯文本 ($size B)"
  fi
done
