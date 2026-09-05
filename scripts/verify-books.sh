#!/bin/bash
# 验证：五运六气工具 + 三本新古籍线上
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
sleep 150
echo "=== 五运六气工具页 ==="
h=$(curl -s -L --compressed --max-time 25 "$BASE/wuyun/?v=4010" -H "User-Agent: $UA")
echo "wuyun: $(echo "$h" | grep -o '五运六气' | wc -l) 处 | $(echo "$h" | grep -o '司天' | wc -l) 处司天"
echo "=== 新古籍书页 ==="
for b in "daojia-jingdian/zuowang-lun" "bushi-qimen/yanbo-diaosou-ge" "bushi-yijing/tai-xuan-jing"; do
  code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/xueguan/$b/?v=4010" -H "User-Agent: $UA")
  echo "$b → $code"
done
echo "=== 本地 sitemap 书页数 ==="
echo "xueguan 书页: $(grep -oE 'xueguan/[a-z-]+/[a-z-]+' out/sitemap.xml | grep -v '__next' | wc -l)"
echo "URL 总数: $(grep -o '<loc>' out/sitemap.xml | wc -l)"
