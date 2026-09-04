#!/bin/bash
# 全站健康检查 v3（含新增 astro/numerology + 核心功能页）
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
OUT="$LOCALAPPDATA/Temp/jg-health.txt"
> "$OUT"
pass=0; fail=0
check() {
  local path="$1"; local kw="${2:-}"
  local code="" html=""
  for i in 1 2 3 4 5 6 7 8; do
    code=$(curl -s -L -o /dev/null -w "%{http_code}" --compressed --max-time 25 "$BASE$path?v=3510" -H "User-Agent: $UA")
    [ "$code" = "200" ] && break
    sleep 20
  done
  if [ "$code" = "200" ]; then
    html=$(curl -s --compressed --max-time 25 "$BASE$path?v=3510" -H "User-Agent: $UA")
    if [ -n "$kw" ]; then
      n=$(echo "$html" | grep -o "$kw" | wc -l)
      if [ "$n" -ge 1 ]; then echo "✅ $path ($kw×$n)" >> "$OUT"; pass=$((pass+1))
      else echo "❌ $path 200 但缺关键词 $kw" >> "$OUT"; fail=$((fail+1)); fi
    else echo "✅ $path" >> "$OUT"; pass=$((pass+1)); fi
  else
    echo "❌ $path → HTTP $code" >> "$OUT"; fail=$((fail+1))
  fi
}
# 核心新增
check "/" "看清真实处境"
check "/astro" "西洋占星"
check "/numerology" "生命灵数"
check "/jiemeng" "周公解梦"
check "/tools" "自我与数理"
# 关键功能页
check "/bazi" "八字"
check "/ziwei" "紫微"
check "/xingming" "姓名"
check "/login" ""
check "/mycharts" ""
check "/api/me" ""
check "/huangli" "黄历"
check "/xueguan" "古籍"
check "/qimen" "奇门"
check "/xiaoliuren" "小六壬"
check "/fengshui" "风水"
check "/hehun" "合婚"
check "/liuyao" "六爻"
check "/jiemeng" "解梦"
echo "---" >> "$OUT"
echo "通过 $pass / 失败 $fail" >> "$OUT"
cat "$OUT"
