// @ts-nocheck — Worker 独立运行环境（wrangler 编译——不经项目 tsconfig）
// 九宫古籍 AI 问答 Worker（Workers AI + 书级知识索引 RAG）
// 端点：POST /api/ask-book  { question: string }
// 响应：{ answer, sources: [{ bookId, title }], model }
// 注：Workers AI binding 直接可用（env.AI.run）——无需 @cloudflare/ai 包

interface BookIndex {
  id: string; title: string; author: string; dynasty: string
  summary: string; keywords: string[]; preface: string
  chapters: { id: string; title: string; preview: string }[]
}

export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const url = new URL(request.url)
    // CORS
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })
    if (request.method !== 'POST' || url.pathname !== '/api/ask-book') {
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: json() })
    }
    // 简单防滥用：body 大小限制
    const body = await request.json().catch(() => null) as { question?: string } | null
    const question = (body?.question || '').trim().slice(0, 200)
    if (!question) return new Response(JSON.stringify({ error: 'empty question' }), { status: 400, headers: json() })

    const BOOKS = (env as unknown as { BOOKS_KV: KVNamespace }).BOOKS_KV
    // 1. 枚举书索引（存 index key）
    const idxRaw = await BOOKS.get('__index__')
    const bookIds: string[] = idxRaw ? JSON.parse(idxRaw) : []
    if (bookIds.length === 0) {
      return new Response(JSON.stringify({ answer: '古籍知识索引暂未就绪——请稍后再试。', sources: [] }), { headers: json() })
    }
    // 2. 关键词检索（书名/作者/关键词/简介重合打分）
    const scored: { id: string; title: string; score: number; preface: string; chapters: { title: string; preview: string }[] }[] = []
    const q = question.toLowerCase()
    for (const id of bookIds) {
      const raw = await BOOKS.get(id)
      if (!raw) continue
      const b = JSON.parse(raw) as BookIndex
      let score = 0
      if (q.includes(b.title)) score += 10
      if (b.author && q.includes(b.author)) score += 5
      for (const kw of b.keywords) if (q.includes(kw)) score += 3
      const sum = (b.summary || '').toLowerCase()
      if (sum.length > 10) { for (const seg of q.split(/[，。？?\s]/).filter(s => s.length > 1)) if (sum.includes(seg)) score += 2 }
      if (score > 0) scored.push({ id, title: b.title, score, preface: b.preface || '', chapters: b.chapters })
    }
    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, 3)
    if (top.length === 0) {
      return new Response(JSON.stringify({ answer: '九宫文库目前没有检索到与该问题直接相关的古籍条目。您可以换一种问法，例如直接问某部书（如"滴天髓讲什么"），或到易学书馆浏览全部典籍。', sources: [] }), { headers: json() })
    }
    // 3. 拼 prompt（引原文——RAG 上下文）
    const ctx = top.map((b, i) => {
      const chs = b.chapters.slice(0, 6).map(c => `- ${c.title}：${(c.preview || '').slice(0, 120)}`).join('\n')
      return `【文献${i + 1}】《${b.title}》（${b.dynasty}·${b.author || '佚名'}）\n简介：${b.summary?.slice(0, 200)}\n导读：${(b.preface || '').slice(0, 300)}\n相关章节：\n${chs}`
    }).join('\n\n')

    const prompt = `你是一名严谨的中国传统术数古籍顾问。请基于下面提供的九宫文库古籍文献信息，用简体中文回答用户问题。要求：
1. 只依据提供的文献内容回答——文献未提及的不要编造
2. 引用时注明出处（如"据《滴天髓》九宫导读"）
3. 如问题涉及命理/占卜结论，说明这是传统文化观点，仅供参考
4. 回答控制在 300 字内，分点清晰

${ctx}

用户问题：${question}`

    // 4. Workers AI 生成（binding 直接 run——新版 API）
    try {
      const ai = (env as unknown as Record<string, unknown>).AI as { run: (model: string, opts: Record<string, unknown>) => Promise<Record<string, unknown>> }
      const model = (env as unknown as { AI_MODEL?: string }).AI_MODEL || '@cf/meta/llama-3.1-8b-instruct'
      const r = await ai.run(model, { messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
      const text = ((r as { response?: string }).response || '').trim()
      const sources = top.map(b => ({ bookId: b.id, title: b.title }))
      return new Response(JSON.stringify({ answer: text || '（模型未返回内容——请稍后重试）', sources }), { headers: json() })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return new Response(JSON.stringify({ error: 'AI 服务暂不可用', detail: msg.slice(0, 200), sources: top.map(b => ({ bookId: b.id, title: b.title })) }), { status: 500, headers: json() })
    }
  },
}

function cors() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
function json() { return { 'Content-Type': 'application/json' } }
