#!/bin/bash
# 探测 v2：识别 Wikimedia Error 页（限速）——带间隔重试
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
probe() {
  local name="$1"
  local enc
  enc=$(python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$name")
  for try in 1 2 3; do
    local raw
    raw=$(curl -s -L --max-time 20 "https://zh.wikisource.org/wiki/${enc}?action=raw" -H "User-Agent: $UA" 2>/dev/null)
    if echo "$raw" | grep -q "Wikimedia Error\|DOCTYPE html"; then
      sleep 4
      continue
    fi
    local size=${#raw}
    if [ "$size" -lt 80 ]; then echo "$name → 不存在 ($size B)"
    elif echo "$raw" | grep -q "<pages"; then echo "$name → scan版"
    elif echo "$raw" | grep -q "Disambig\|versions\|^#重定向"; then echo "$name → 消歧义/重定向"
    else echo "$name → ✅ 文本 ($size B)"; fi
    return
  done
  echo "$name → 限速无法确认"
}
for b in "測字祕牒|测字秘牒" "黃帝內經靈樞|灵枢" "麻衣相法" "柳莊相法|柳庄相法" "水龍經|水龙经" "人子須知|人子须知" "六壬粹言" "易隱|易隐" "斷易天機|断易天机" "雪心賦|雪心赋" "董公選擇要訣|董公选日"; do
  probe "${b%%|*}"
  sleep 2
done
