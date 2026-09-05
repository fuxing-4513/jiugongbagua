#!/bin/bash
# 验证 20 条藏馆线上
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"
BASE="https://www.jiugongbagua.com"
echo "=== 本地 cangku 目录 ==="
ls out/cangku/ 2>/dev/null | grep -vE "__next|\.html|\.txt" | head -25
echo "条目目录数: $(ls out/cangku/ 2>/dev/null | grep -vE '__next|\.html|\.txt' | wc -l)"
echo "=== sitemap 藏馆 URL ==="
grep -o "cangku/[a-z0-9-]*" out/sitemap.xml 2>/dev/null | sort -u | wc -l
sleep 60
echo "=== 线上抽查 ==="
for p in "cangku/" "cangku/p3507-kan-yu/" "cangku/p3908-zhougong-dream/" "cangku/zhengtong-daozang-kunaicho/"; do
  code=$(curl -s -L -o /dev/null -w "%{http_code}" --max-time 20 "$BASE/$p?v=4400" -H "User-Agent: $UA")
  echo "$p → $code"
done
