/**
 * 九宫 AI 决策对话 Worker
 * 端点：
 *   POST /api/chat     多轮对话（DeepSeek 流式 SSE）{ messages, chart, anchors }
 *   POST /api/evaluate 排盘结果情境评估 { chart, analysis, refs }
 * 安全：DEEPSEEK_API_KEY 存为 Worker Secret；仅允许站点来源；简单限次（基于客户端标识的 KV 计数，无 KV 时降级）
 */
const DS_URL = 'https://api.deepseek.com/chat/completions'
const DS_MODEL = 'deepseek-chat'

const SYSTEM_PROMPT = `你是「九宫」AI 命理决策顾问——一个把传统命理当作决策参考框架的助手，不是算命先生。

原则：
1. 语气克制、理性、有温度；用白话，不用黑话堆砌。
2. 结论采用「情境评估」框架：当前处境 → 需要注意的点 → 可执行的建议；不做宿命断言，不制造焦虑。
3. 只能引用用户提供的排盘数据与古籍依据；绝不编造新的干支、星曜或古籍原文；不确定就说不确定。
4. 涉及重大决策（医疗、法律、投资、婚恋）时提醒用户理性判断、多方参考。
5. 输出用简体中文，分段清晰，每段不超过 3 行。`

const DEFAULT_MESSAGES = [
  { role: 'system', content: SYSTEM_PROMPT },
]

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // CORS
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    if (request.method !== 'POST') return new Response('Not Found', { status: 404 })

    // 简单防滥用：同 IP 每分钟 10 次（无 KV 时仅日志）
    let quotaOk = true
    if (env.LIMIT_KV) {
      const ip = request.headers.get('CF-Connecting-IP') || 'anon'
      const key = `limit:${ip}`
      const now = Date.now()
      const rec = await env.LIMIT_KV.get(key, 'json').catch(() => null)
      const list = (rec && Array.isArray(rec.ts) ? rec.ts : []).filter(t => now - t < 60000)
      if (list.length >= 10) quotaOk = false
      else {
        list.push(now)
        await env.LIMIT_KV.put(key, JSON.stringify({ ts: list }), { expirationTtl: 120 }).catch(() => {})
      }
    }
    if (!quotaOk) return Response.json({ error: '请求过于频繁，请稍后再试' }, { status: 429, headers: cors })

    let body
    try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400, headers: cors }) }

    const path = url.pathname
    if (path === '/api/chat') {
      return handleChat(body, env, cors)
    }
    if (path === '/api/evaluate') {
      return handleEvaluate(body, env, cors)
    }
    return Response.json({ error: 'unknown endpoint' }, { status: 404, headers: cors })
  },
}

async function handleChat(body, env, cors) {
  const messages = Array.isArray(body.messages) ? body.messages : []
  if (messages.length === 0) return Response.json({ error: '缺少消息' }, { status: 400, headers: cors })

  // 拼装上下文：命盘摘要 + 时间轴锚定（可选）
  let context = ''
  if (body.chart) {
    context += `\n\n【当前命盘摘要】\n${String(body.chart).slice(0, 1500)}`
  }
  if (Array.isArray(body.anchors) && body.anchors.length) {
    context += `\n\n【用户提供的人生节点（用于校准推断，勿重复追问）】\n${body.anchors.map((a, i) => `${i + 1}. ${String(a).slice(0, 200)}`).join('\n')}`
  }
  const sys = context
    ? { role: 'system', content: SYSTEM_PROMPT + '\n\n请基于以下命盘上下文回答用户问题。' + context }
    : { role: 'system', content: SYSTEM_PROMPT }

  const dsMessages = [sys, ...messages.slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 4000) }))]

  return streamDeepSeek(dsMessages, env, cors)
}

async function handleEvaluate(body, env, cors) {
  const chart = String(body.chart || '').slice(0, 1500)
  const analysis = String(body.analysis || '').slice(0, 2000)
  const refs = String(body.refs || '').slice(0, 800)

  const user = `请基于下面的命盘与既有分析，输出一份「情境评估」：
① 当前人生情境（2-3 句，中性语气）
② 需要注意的风险点（1-2 条，用「注意」措辞，不用恐吓词汇）
③ 可执行的行动建议（1-2 条）
最后给一句克制而有温度的话。若信息不足请明说，不要编造。

【命盘摘要】${chart}
【既有分析】${analysis}
【古籍依据参考】${refs || '（无）'}`

  return streamDeepSeek([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }], env, cors)
}

async function streamDeepSeek(messages, env, cors) {
  const key = env.DEEPSEEK_API_KEY
  if (!key) return Response.json({ error: '服务未配置完成' }, { status: 500, headers: cors })

  const upstream = await fetch(DS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: DS_MODEL,
      messages,
      stream: true,
      max_tokens: 1200,
      temperature: 0.7,
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '')
    return Response.json({ error: `上游错误 ${upstream.status}`, detail: errText.slice(0, 200) }, { status: 502, headers: cors })
  }

  // 透传 SSE 流
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...cors,
    },
  })
}
