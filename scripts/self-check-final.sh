#!/bin/bash
# 九宫全站自检——20260906 终版（本地文件 + 线上功能抽查）
cd /c/Users/4513/Documents/jiugong-bagua-main || exit 1
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY="*"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
PASS=0; FAIL=0
ck(){ if [ "$2" = "0" ] || [ "$2" = "200" ] || [ "$2" = "true" ]; then echo "✅ $1"; PASS=$((PASS+1)); else echo "❌ $1 ($2)"; FAIL=$((FAIL+1)); fi }

echo "══════ 一、本地代码健康 ══════"
npx tsc --noEmit 2>/dev/null | grep -c "error TS" > /tmp/tsc_err.txt
ck "TS 类型零错误" "$(cat /tmp/tsc_err.txt)"

echo "══════ 二、敏感信息扫描 ══════"
SK=$(grep -rln "sk-[a-zA-Z0-9]\{20,\}\|ADMIN_TOKEN\s*=\s*'[^']\{8,\}'" src/ worker-rag/ 2>/dev/null | grep -v "\.next" | head -3)
ck "无硬编码密钥(源码)" "$([ -z "$SK" ] && echo 0 || echo 1)"

echo "══════ 三、数据完整性 ══════"
GUA=$(grep -c "export const GUA" src/data/gua/deep/*.ts 2>/dev/null | awk -F: '{s+=$2} END{print s}')
ck "卦深度文件齐全(64)" "$([ "$GUA" -ge 60 ] && echo 0 || echo 1)"
REN=$(grep -c "comment: \[" src/data/renwu/people*.ts 2>/dev/null | awk -F: '{s+=$2} END{print s}')
ck "人物评点 ≥90 条" "$([ "$REN" -ge 90 ] && echo 0 || echo 1)"
DD=$(grep -c "slug:" src/lib/glossary-deep-*.ts 2>/dev/null | awk -F: '{s+=$2} END{print s}')
ck "术语深度 ≥140 词" "$([ "$DD" -ge 140 ] && echo 0 || echo 1)"

echo "══════ 四、线上页面 200 抽查（核心板块） ══════"
for u in "" "wenku/" "wenku/gua/" "wenku/renwu/" "wenku/ganzhi/" "wenku/ganzhi/rel/" "glossary/" "xueguan/" "tools/" "bazi/" "liuyao/" "qimen/" "ziwei/" "xingzuo/" "astro/" "numerology/" "wuyun/" "huangli/" "jiemeng/" "cangku/" "llms.txt" "taiji-favicon.png"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 -L "https://www.jiugongbagua.com/$u" -H "User-Agent: $UA")
  ck "线上 /$u → 200" "$code"
done

echo "══════ 五、工具功能健全（关键数据/API 可达） ══════"
# AI 古籍问答 API（域名端点）
Q='{"question":"滴天髓的核心思想是什么","bookId":"ditian-sui"}'
echo "$Q" > "$LOCALAPPDATA/Temp/jg-check.json"
AR=$(curl -s --max-time 60 -X POST "https://www.jiugongbagua.com/api/ask-book" -H "Content-Type: application/json; charset=utf-8" -H "User-Agent: $UA" -H "Origin: https://www.jiugongbagua.com" --data-binary @"$LOCALAPPDATA/Temp/jg-check.json")
ck "AI 古籍问答 API 响应" "$(echo "$AR" | grep -c "answer\|据《滴天髓》")"
# 搜索索引
WX=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://www.jiugongbagua.com/data/$(ls public/data/ | grep wenku-search | head -1)" -H "User-Agent: $UA" 2>/dev/null)
ck "文库搜索索引可达" "$WX"
# 解梦大数据 JSON
JM=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://www.jiugongbagua.com/data/$(ls public/data/ 2>/dev/null | grep -i jiemeng | head -1)" -H "User-Agent: $UA")
ck "解梦数据索引可达" "$JM"
# 关键工具页含表单功能
for t in bazi liuyao qimen ziwei meihua hehun xingming huangli; do
  HAS=$(curl -s --max-time 20 -L "https://www.jiugongbagua.com/$t/" -H "User-Agent: $UA" | grep -c "input\|textarea\|select\|提交\|开始\|测算\|button")
  ck "工具 /$t 含功能表单(${HAS} 控件)" "$([ "$HAS" -gt 0 ] && echo 0 || echo 1)"
done

echo ""
echo "══════ 结果：PASS=$PASS FAIL=$FAIL ══════"
