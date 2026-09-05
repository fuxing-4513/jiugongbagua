#!/bin/bash
# 九宫全站代码自检（今日改动范围）
cd /c/Users/4513/Documents/jiugong-bagua-main
echo "=== 1. TypeScript 检查 ==="
npx tsc --noEmit 2>&1 | grep -v "npm notice" | grep "error TS" | grep -v ".next" | head -5
[ $? -ne 0 ] && echo "TS 无错" || echo "TS 完成（见上）"

echo "=== 2. 敏感信息扫描 ==="
grep -rn "sk-[a-zA-Z0-9]\{20,\}\|DEEPSEEK_API_KEY.*=.*[a-zA-Z0-9]\|ADMIN_TOKEN.*=.*[a-zA-Z0-9]\{10,\}" src/ worker-*/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "'\*\*\*'\|占位" | head -3
echo "扫描完成"

echo "=== 3. 古籍注册一致性（registry vs book-ids） ==="
node -e "
const fs=require('fs');
const reg=fs.readFileSync('src/data/xueguan/content/content-registry.ts','utf8');
const bids=JSON.parse(fs.readFileSync('src/data/xueguan/book-ids.ts','utf8').match(/export const allBookIds.*?\[([\s\S]*?)\]/)[1].replace(/'/g,'\"'));
const regIds=[...reg.matchAll(/'([a-z0-9-]+)':\w+Content/g)].map(m=>m[1]);
const missing=bids.filter(id=>!regIds.includes(id));
const extra=regIds.filter(id=>!bids.includes(id));
console.log('book-ids:', bids.length, '| registry:', regIds.length);
if(missing.length) console.log('⚠️ book-ids 有但 registry 缺:', missing.join(','));
if(extra.length) console.log('⚠️ registry 多出:', extra.slice(0,10).join(','));
if(!missing.length&&!extra.length) console.log('✅ 注册一致');
"

echo "=== 4. 悬空关联检查（books related 有效性） ==="
node -e "
const fs=require('fs');
const s=fs.readFileSync('src/data/xueguan/books.ts','utf8');
const allIds=[...s.matchAll(/id: '([a-z0-9-]+)'/g)].map(m=>m[1]);
const rels=[...s.matchAll(/related: \['([^']+)'\]|related: \['([^']*)'\](?:,|\n)/g)].map(m=>m[1]||m[2]);
let dangling=[];
for(const r of rels){ if(r&&!allIds.includes(r)) dangling.push(r); }
console.log(dangling.length? '⚠️ 悬空 related: '+[...new Set(dangling)].slice(0,10).join(','):'✅ related 无悬空');
"

echo "=== 5. git 状态 ==="
git status --short | head -5
git log --oneline -3
echo "SELF_CHECK_DONE"
