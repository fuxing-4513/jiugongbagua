#!/bin/bash
# 九宫收尾线上验证（新版功能页 × 关键词）
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
OUT="$LOCALAPPDATA/Temp/jg-final-check.txt"
> "$OUT"
pass=0; fail=0
check() {
  local path="$1"; local kw="${2:-}"
  local code="" html=""
  for i in $(seq 1 8); do
    code=$(curl -s -L -o /dev/null -w "%{http_code}" --compressed --max-time 25 "$BASE$path?v=3701" -H "User-Agent: $UA")
    [ "$code" = "200" ] && break
    sleep 20
  done
  if [ "$code" = "200" ]; then
    if [ -n "$kw" ]; then
      html=""
    for k in 1 2 3 4 5; do html=$(curl -s -L --compressed --max-time 30 "$BASE$path/?v=3701" -H "User-Agent: $UA"); [ ${#html} -gt 5000 ] && break; sleep 15; done
      n=$(echo "$html" | grep -o "$kw" | wc -l)
      if [ "$n" -ge 1 ]; then echo "✅ $path ($kw×$n)" >> "$OUT"; pass=$((pass+1))
      else echo "❌ $path 200 但缺关键词: $kw" >> "$OUT"; fail=$((fail+1)); fi
    else echo "✅ $path" >> "$OUT"; pass=$((pass+1)); fi
  else echo "❌ $path → HTTP $code" >> "$OUT"; fail=$((fail+1)); fi
}
check "/" "看清真实处境"
check "/astro" "西洋占星"
check "/numerology" "生命灵数"
check "/xiaoliuren" "小六壬"
check "/qimen" "奇门"
check "/fengshui" "风水"
check "/jiemeng" "解梦"
check "/xingming" "姓名"
check "/tools" "自我与数理"
check "/login" ""
check "/mycharts" ""
check "/api/me" ""
check "/bazi" ""
check "/ziwei" ""
check "/xueguan" ""
check "/huangli" ""
check "/liuyao" ""
check "/hehun" ""
check "/lingqian" ""
check "/meihua" ""
check "/shengxiao" ""
check "/shuma" ""
check "/chenggu" ""
check "/zonghe-zhengming" ""
check "/wenku" ""
check "/experts" ""
check "/taluo" ""
check "/xingzuo" ""
echo "---" >> "$OUT"
echo "通过 $pass / 失败 $fail" >> "$OUT"
cat "$OUT"
