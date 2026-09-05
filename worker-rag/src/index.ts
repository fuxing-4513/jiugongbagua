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
    const body = await request.json().catch(() => null) as { question?: string; bookId?: string | null } | null
    const question = (body?.question || '').trim().slice(0, 200)
    if (!question) return new Response(JSON.stringify({ error: 'empty question' }), { status: 400, headers: json() })

    const BOOKS = (env as unknown as { BOOKS_KV: KVNamespace }).BOOKS_KV
    // 0. 指定书（书页问答传 bookId——"这本书"类问法的上下文锚）
    let focusBook: { id: string; title: string; author: string; dynasty: string; summary: string; keywords: string[]; preface: string; chapters: { title: string; preview: string }[] } | null = null
    if (body?.bookId) {
      const raw = await BOOKS.get(body.bookId)
      if (raw) { try { focusBook = JSON.parse(raw) } catch { focusBook = null } }
    }
    // 1. 枚举书索引（存 index key）
    const idxRaw = await BOOKS.get('__index__')
    const bookIds: string[] = idxRaw ? JSON.parse(idxRaw) : []
    if (bookIds.length === 0) {
      return new Response(JSON.stringify({ answer: '古籍知识索引暂未就绪——请稍后再试。', sources: [] }), { headers: json() })
    }
    // 2. 关键词检索（书名/作者/关键词/简介重合打分）
    const scored: { id: string; title: string; score: number; preface: string; chapters: { title: string; preview: string }[] }[] = []
    const q = question.toLowerCase()
    // 书名别名表（常见简称/异名——增强匹配）
    const ALIAS: Record<string, string[]> = {
      '地理五诀': ['地理五诀', '五诀'], '太上感应篇': ['感应篇'], '滴天髓': ['滴天髓', '滴天'], '渊海子平': ['渊海子平', '子平'],
      '三命通会': ['三命通会'], '周易': ['周易', '易经'], '葬书': ['葬书', '葬经'], '撼龙经': ['撼龙经'], '梅花易数': ['梅花易数', '梅花'],
    }
    for (const id of bookIds) {
      const raw = await BOOKS.get(id)
      if (!raw) continue
      const b = JSON.parse(raw) as BookIndex
      let score = 0
      const qq = question.replace(/这本书|那本书|请问|是什么|讲了什么|核心思想|主要内容|怎么样|如何/g, '')
      if (qq.includes(b.title)) score += 10
      if (b.author && q.includes(b.author)) score += 5
      // 别名匹配
      const al = Object.entries(ALIAS).find(([k]) => q.includes(k))
      if (al && al[1].some(a => b.title.includes(a[0]) || b.title === al[0])) score += 8
      for (const kw of (b.keywords || [])) if (q.includes(kw)) score += 3
      const sum = (b.summary || '').toLowerCase()
      if (sum.length > 10) { for (const seg of qq.split(/[，。？?\s]/).filter((s: string) => s.length > 1)) if (sum.includes(seg)) score += 2 }
      if (score > 0) scored.push({ id, title: b.title, score, preface: b.preface || '', chapters: b.chapters })
    }
    scored.sort((a, b) => b.score - a.score)
    const scoredList = scored.slice(0, 3)
    // 指定书优先进入上下文（书页问答锚——即使关键词未命中）
    const top = focusBook
      ? [{ id: focusBook.id, title: focusBook.title, score: 100, preface: focusBook.preface || '', chapters: focusBook.chapters || [] }, ...scoredList.filter(s => s.id !== focusBook!.id)]
      : scoredList
    if (top.length === 0) {
      return new Response(JSON.stringify({ answer: '九宫文库目前没有检索到与该问题直接相关的古籍条目。您可以换一种问法，例如直接问某部书（如"滴天髓讲什么"），或到易学书馆浏览全部典籍。', sources: [] }), { headers: json() })
    }
    // 3. 拼 prompt（引原文——RAG 上下文加厚：每书最多 12 章）
    const ctx = top.map((b, i) => {
      const chs = (b.chapters || []).slice(0, 12).map(c => `- ${c.title}：${(c.preview || '').slice(0, 150)}`).join('\n')
      return `【文献${i + 1}】《${b.title}》（${(b as { dynasty?: string }).dynasty || ''}·${(b as { author?: string }).author || '佚名'}）\n简介：${(b as { summary?: string }).summary?.slice(0, 250) || ''}\n导读：${(b.preface || '').slice(0, 400)}\n相关章节：\n${chs}`
    }).join('\n\n')

    const prompt = `你是一名严谨的中国传统术数古籍顾问。请基于下面提供的九宫文库古籍文献信息，用简体中文回答用户问题。要求：
1. 只依据提供的文献内容回答——文献未提及的不要编造
2. 引用时注明出处（如"据《滴天髓》九宫导读"）
3. 如问题涉及命理/占卜结论，说明这是传统文化观点，仅供参考
4. 回答控制在 300 字内，分点清晰

${ctx}

用户问题：${question}`

    // 4. Workers AI 生成（模型 fallback 链——额度/可用性容错）
    try {
      const ai = (env as unknown as Record<string, unknown>).AI as { run: (model: string, opts: Record<string, unknown>) => Promise<Record<string, unknown>> }
      const MODELS = ['@cf/mistralai/mistral-small-3.1-24b-instruct', '@cf/meta/llama-3.1-8b-instruct-fp8', '@cf/meta/llama-3.2-3b-instruct']
      const configured = (env as unknown as { AI_MODEL?: string }).AI_MODEL
      const chain = configured ? [configured, ...MODELS.filter(m => m !== configured)] : MODELS
      let text = ''
      let lastErr = ''
      for (const model of chain) {
        try {
          const r = await ai.run(model, { messages: [{ role: 'user', content: prompt }], max_tokens: 700 })
          const t = ((r as { response?: string }).response || '').trim()
          if (t) { text = t; break }
        } catch (e) { lastErr = e instanceof Error ? e.message : String(e) }
      }
      const sources = top.map(b => ({ bookId: (b as { id?: string }).id || '', title: b.title }))
      if (text) return new Response(JSON.stringify({ answer: text, sources }), { headers: json() })
      throw new Error(lastErr || 'empty')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      // AI 额度尽/不可用——降级返回结构化检索结果（书简介+章节目录——实质内容不落空）
      const fallback = top.map((b, i) => {
        const chs = (b.chapters || []).slice(0, 8).map(c => `· ${c.title}（${(c.preview || '').slice(0, 40)}…）`).join('\n')
        return `${i + 1}.《${b.title}》${(b as { dynasty?: string }).dynasty ? `（${(b as { dynasty?: string }).dynasty}）` : ''}\n${(b as { summary?: string }).summary?.slice(0, 150) || ''}\n${chs}`
      }).join('\n\n')
      return new Response(JSON.stringify({
        answer: `已为您检索到相关资料（AI 生成服务暂时限额，先展示馆藏要点——稍后或明日即可恢复完整解答）：\n\n${fallback}\n\n💡 您也可以直接展开本页"原文阅读"查看全文，或在"九宫文库"阅读导读。`,
        sources: top.map(b => ({ bookId: (b as { id?: string }).id || '', title: b.title })),
        degraded: true,
      }), { headers: json() })
    }
  },
}

function cors() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
function json() { return { 'Content-Type': 'application/json' } }
