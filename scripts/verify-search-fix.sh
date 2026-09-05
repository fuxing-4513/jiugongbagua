#!/bin/bash
# 验证：搜索索引 + 藏馆页 + 搜索页
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
sleep 170
echo "=== 搜索索引 JSON（搜索修复关键） ==="
for i in 1 2 3 4 5; do
  sz=$(curl -s --max-time 20 "$BASE/data/c5dc0cc7-xueguan-search-c3526e2d.json?v=4201" -H "User-Agent: $UA" | wc -c)
  if [ "$sz" -gt 10000 ]; then echo "✅ 索引可达 ${sz}B"; break; fi
  echo "try$i ${sz}B"; sleep 20
done
echo "=== 藏馆页 ==="
code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/cangku/?v=4201" -H "User-Agent: $UA"); echo "/cangku → $code"
code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/cangku/p3507-kan-yu/?v=4201" -H "User-Agent: $UA"); echo "P.3507 条目页 → $code"
echo "=== 搜索页 ==="
code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/xueguan/search/?v=4201" -H "User-Agent: $UA"); echo "/xueguan/search → $code"
