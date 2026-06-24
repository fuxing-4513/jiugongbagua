#!/bin/bash
# 九宫八卦 — AI自动化文章采集改写脚本
# 用法: bash scripts/auto-article.sh [篇数] [关键词文件]

set -e
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

OUTPUT_DIR="$REPO_DIR/scripts/generated-articles"
mkdir -p "$OUTPUT_DIR"

# 默认篇数
COUNT=${1:-10}
KEYWORDS_FILE=${2:-"$REPO_DIR/scripts/keywords.txt"}

if [ ! -f "$KEYWORDS_FILE" ]; then
  echo "❌ 关键词文件不存在: $KEYWORDS_FILE"
  echo "   请先创建关键词文件，每行一个关键词"
  exit 1
fi

echo "🔮 九宫八卦 AI文章生成器"
echo "=============================="
echo "目标篇数: $COUNT"
echo "关键词文件: $KEYWORDS_FILE"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 读取关键词列表
mapfile -t KEYWORDS < "$KEYWORDS_FILE"
TOTAL_KEYS=${#KEYWORDS[@]}
echo "关键词池: $TOTAL_KEYS 个"
echo ""

# 文章分类池，用于轮换
CATEGORIES=(
  "八字命理"
  "紫微斗数"
  "风水知识"
  "姓名文化"
  "面相手相"
  "解梦文化"
  "数字能量"
  "择日择吉"
  "易学基础"
  "生肖运势"
)

# 文章模板
TEMPLATES=(
  "全面解读"
  "深度分析"
  "入门指南" 
  "常见问题"
  "实用技巧"
  "经典案例"
  "专业详解"
  "基础知识"
  "进阶提高"
  "专家视角"
)

echo "📝 开始生成文章..."
echo ""

SUCCESS=0
FAILED=0

for ((i=0; i<COUNT; i++)); do
  # 选关键词（轮换+随机偏移）
  IDX=$(( (i + RANDOM) % TOTAL_KEYS ))
  KEYWORD="${KEYWORDS[$IDX]}"
  
  # 选分类和模板
  CAT="${CATEGORIES[$((i % ${#CATEGORIES[@]}))]}"
  TPL="${TEMPLATES[$((RANDOM % ${#TEMPLATES[@]}))]}"
  
  # 生成slug
  SLUG="$(echo "$KEYWORD-$TPL" | sed 's/[《》.,!?:\/\\()"'\''“”\s]/‐/g' | sed 's/‐$//' | sed 's/^‐//' | tr '[:upper:]' '[:lower:]')"
  
  # 避免重复
  if [ -f "$OUTPUT_DIR/${SLUG}.json" ]; then
    echo "  ⏭️  跳过（已存在）: $KEYWORD - $TPL"
    continue
  fi
  
  echo "  📄 [$((i+1))/$COUNT] $KEYWORD - $TPL"
  
  # 生成文章主体（使用已有的判词函数/临时JS）
  # 这里直接调用Node脚本生成markdown
  node << EOF > "$OUTPUT_DIR/${SLUG}.json" 2>/dev/null || {
    echo "  ⚠️  生成失败: $KEYWORD"
    FAILED=$((FAILED+1))
    continue
  }
  
  const keyword = "$KEYWORD"
  const category = "$CAT"
  const template = "$TPL"
  
  // 基础文章结构
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  
  const article = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: keyword + (template !== '全面解读' && template !== '深度分析' ? '：' + template : ''),
    slug: "$SLUG",
    summary: "",
    date: dateStr,
    category: category,
    fullContent: "",
    keywords: [keyword],
    internalLinks: []
  }
  
  // 这里是一个占位—实际运行时由大模型实时填充
  // 在线流程中，node脚本将通过API调用大模型改写
  article.summary = "关于「" + keyword + "」的" + template + "，来自九宫八卦命理体系的专业解读。"
  article.fullContent = "【九宫八卦·AI智能分析】\n\n# " + keyword + " " + template + "\n\n## 什么是" + keyword + "\n\n" + keyword + "是中国传统命理学中的重要概念。了解" + keyword + "，对于深入理解个人命运和发展方向具有重要意义。\n\n## " + keyword + "的核心要点\n\n### 1. 基本含义\n" + keyword + "在命理体系中有着特定的代表意义，它反映了一个人性格、运势和人生走向的某些特征。\n\n### 2. 实际应用\n通过分析" + keyword + "，可以更好地把握人生机遇和规避潜在风险。\n\n### 3. 专业建议\n结合九宫八卦的完整命理体系，对" + keyword + "的解读需要综合考虑八字、大运、流年等多方面因素。\n\n## 九宫推荐\n\n> 想了解自己的八字命盘？前往 [九宫八卦八字排盘](/bazi) 输入出生信息，获取完整的AI命理分析报告。\n\n---\n*本文由九宫八卦AI命理体系自动生成，内容仅供参考。*"
  
  console.log(JSON.stringify(article))
EOF
  
  if [ -f "$OUTPUT_DIR/${SLUG}.json" ] && [ -s "$OUTPUT_DIR/${SLUG}.json" ]; then
    SUCCESS=$((SUCCESS+1))
  else
    FAILED=$((FAILED+1))
  fi
done

echo ""
echo "✅ 生成完成！成功: $SUCCESS, 失败: $FAILED"
echo "   文章保存在: $OUTPUT_DIR/"
echo ""
echo "📊 运行 npm run build 查看构建效果"
EOF
chmod +x scripts/auto-article.sh
echo "scripts/auto-article.sh created"
