#!/bin/bash
# 最终全站验证（今日全部交付）
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
sleep 175
echo "=== 文库知识体系 ==="
for p in "wenku" "wenku/gua" "wenku/gua/gua01" "wenku/ganzhi" "wenku/ganzhi/%E7%94%B2" "wenku/renwu" "wenku/renwu/shaoyong"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -L "$BASE/$p/" -H "User-Agent: $UA")
  echo "$p → $code"
done
echo "=== 书页实体链 ==="
curl -s --max-time 25 -L "$BASE/xueguan/mingli-bazi/ditian-sui/" -H "User-Agent: $UA" | grep -o "相关人物\|相关工具\|AI 古籍问答" | sort -u
echo "=== 术语页相关典籍 ==="
curl -s --max-time 25 -L "$BASE/glossary/shi-shen/" -H "User-Agent: $UA" | grep -o "相关典籍" | head -1
echo "=== sitemap 新页 ==="
curl -s --max-time 30 "$BASE/sitemap.xml" -H "User-Agent: $UA" | grep -c "wenku/renwu\|wenku/ganzhi"
