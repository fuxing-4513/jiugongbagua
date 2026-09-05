#!/bin/bash
# 验证：新古籍 + 卦象图 + sitemap
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
sleep 170
echo "=== 新书页 ==="
for b in "mingli-bazi/ziping-fujue" "bushi-yijing/tai-xuan-jing" "fengshui-liqi/dili-bianzheng"; do
  code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/xueguan/$b/?v=4100" -H "User-Agent: $UA")
  echo "$b → $code"
done
echo "=== 周易书页卦象图 ==="
h=$(curl -s -L --compressed --max-time 25 "$BASE/xueguan/bushi-yijing/zhouyi/?v=4100" -H "User-Agent: $UA")
echo "卦象图引用: $(echo "$h" | grep -o 'h0[0-9].svg\|h1[0-9].svg\|h2[0-9].svg\|h3[0-9].svg\|h4[0-9].svg\|h5[0-9].svg\|h6[0-9].svg' | head -3 | tr '\n' ' ')"
echo "=== sitemap 古籍页数 ==="
echo "xueguan 书页: $(grep -oE 'xueguan/[a-z-]+/[a-z-]+' out/sitemap.xml 2>/dev/null | grep -v '__next' | wc -l)"
echo "URL 总数: $(grep -o '<loc>' out/sitemap.xml 2>/dev/null | wc -l)"
