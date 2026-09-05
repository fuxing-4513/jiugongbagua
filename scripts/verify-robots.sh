#!/bin/bash
# SEO 交付最终验证：sitemap 扩充 + robots AI bot
UA="Mozilla/5.0"
echo "=== 本地 sitemap ==="
ls -la out/sitemap.xml 2>/dev/null | awk '{print "大小:", $5}'
echo "URL 总数: $(grep -o '<loc>' out/sitemap.xml | wc -l)"
echo "xueguan 书页: $(grep -oE 'xueguan/[a-z-]+/[a-z-]+' out/sitemap.xml | grep -v '__next' | wc -l)"
echo "glossary 词条: $(grep -o 'glossary/[a-z-]*' out/sitemap.xml | wc -l)"
echo "=== 线上验证 ==="
for i in 1 2 3 4 5 6 7 8; do
  size=$(curl -s --max-time 25 "https://www.jiugongbagua.com/sitemap.xml" -H "User-Agent: $UA" | wc -c)
  if [ "$size" -gt 1000000 ]; then echo "✅ 线上 sitemap ${size}B (扩充生效)"; break; fi
  echo "try$i 线上 sitemap ${size}B (Pages 构建中?)"
  sleep 25
done
for i in 1 2 3 4 5 6; do
  r=$(curl -s --max-time 20 "https://www.jiugongbagua.com/robots.txt" -H "User-Agent: $UA")
  n=$(echo "$r" | grep -c "GPTBot")
  if [ "$n" -ge 1 ]; then echo "✅ robots.txt AI bot 放行生效"; break; fi
  echo "robots try$i"; sleep 25
done
