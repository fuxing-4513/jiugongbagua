#!/bin/bash
# 验证 robots.txt + sitemap 线上
UA="Mozilla/5.0"
echo "=== robots.txt ==="
for i in 1 2 3 4 5 6; do
  r=$(curl -s --max-time 20 "https://www.jiugongbagua.com/robots.txt?v=3901" -H "User-Agent: $UA")
  n=$(echo "$r" | grep -c "GPTBot\|PerplexityBot\|Sitemap")
  if [ "$n" -ge 2 ]; then echo "✅ robots.txt 线上生效 (AI bot 声明 $n 处)"; echo "$r" | head -8; break; fi
  sleep 25
done
echo "=== sitemap 抽查 xueguan 书页收录 ==="
s=$(curl -s --max-time 30 "https://www.jiugongbagua.com/sitemap.xml" -H "User-Agent: $UA")
echo "sitemap 大小: ${#s} | xueguan 链接数: $(echo "$s" | grep -o 'xueguan' | wc -l)"
