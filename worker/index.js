/**
 * 九宫 AI 决策对话 Worker（安全加固版）
 * 端点：
 *   POST /api/chat     多轮对话（DeepSeek 流式 SSE）
 *   POST /api/evaluate 排盘结果情境评估
 *   GET  /api/balance  余额查询（需 Authorization: Bearer <ADMIN_TOKEN>）
 *   GET  /api/usage    当日用量统计（需 ADMIN_TOKEN）
 *
 * 安全设计：
 *   1. DEEPSEEK_API_KEY 仅存 Worker Secret，永不下发前端
 *   2. 来源白名单：仅允许本站域名（浏览器跨域请求带 Origin）
 *   3. 同 IP 每分钟限 10 次（KV）
 *   4. 全站每日熔断：当日累计调用达上限(DAILY_CALL_LIMIT)即拒绝——盗刷损失封顶
 *   5. 管理端点需 ADMIN_TOKEN
 */
const DS_URL = 'https://api.deepseek.com/chat/completions'
const DS_BALANCE_URL = 'https://api.deepseek.com/user/balance'
const DS_MODEL = 'deepseek-chat'

// ── 风控参数 ──
const ALLOWED_ORIGINS = ['https://jiugongbagua.com', 'https://www.jiugongbagua.com', 'http://localhost:3000', 'http://localhost:3001']
const DAILY_CALL_LIMIT = 300   // 全站每日调用上限（熔断值；正常免费 5 次/人·天，300 次约够 60 活跃用户，可按需调大）
const IP_MIN_LIMIT = 10        // 同 IP 每分钟上限
const ADMIN_TOKEN = 'ADMIN_TOKEN_PLACEHOLDER' // 会被 wrangler secret 覆盖

const SYSTEM_PROMPT = `你是「九宫」AI 命理决策顾问——一个把传统命理当作决策参考框架的助手，不是算命先生。

原则：
1. 语气克制、理性、有温度；用白话，不用黑话堆砌。
2. 结论采用「情境评估」框架：当前处境 → 需要注意的点 → 可执行的建议；不做宿命断言，不制造焦虑。
3. 只能引用用户提供的排盘数据与古籍依据；绝不编造新的干支、星曜或古籍原文；不确定就说不确定。
4. 涉及重大决策（医疗、法律、投资、婚恋）时提醒用户理性判断、多方参考。
5. 输出用简体中文，分段清晰，每段不超过 3 行。`

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const method = request.method

    // CORS 预检（收紧 Allow-Origin：动态回显合法来源）
    if (method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || ''
      const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.jiugongbagua.com'
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // ── 管理端点（需 ADMIN_TOKEN）──
    const authHeader = request.headers.get('Authorization') || ''
    const token = (env.ADMIN_TOKEN || ADMIN_TOKEN)
    if (url.pathname === '/api/balance' || url.pathname === '/api/usage') {
      if (authHeader !== `Bearer ${token}`) return Response.json({ error: 'unauthorized' }, { status: 401 })
      if (!env.DEEPSEEK_API_KEY) return Response.json({ error: 'DEEPSEEK_API_KEY 未配置' }, { status: 500 })
      if (url.pathname === '/api/balance') return fetchBalance(env)
      return fetchUsage(env)
    }

    // ── 业务端点：仅 POST ──
    if (method !== 'POST') return new Response('Not Found', { status: 404 })

    // 1) 来源白名单（非浏览器/伪造来源一律拒绝）
    const origin = request.headers.get('Origin') || ''
    const referer = request.headers.get('Referer') || ''
    const fromAllowed = ALLOWED_ORIGINS.some(o => origin === o || referer.startsWith(o))
    if (!fromAllowed) {
      return Response.json({ error: '来源不被允许' }, { status: 403, headers: corsHeader(origin) })
    }
    if (!env.DEEPSEEK_API_KEY) return Response.json({ error: '服务未配置完成' }, { status: 500, headers: corsHeader(origin) })

    // 2) KV 风控（无 KV 时放行——生产必须绑定）
    if (env.LIMIT_KV) {
      const now = Date.now()
      const ip = request.headers.get('CF-Connecting-IP') || 'anon'

      // 2a) 同 IP 每分钟限次
      const ipKey = `ip:${ip}`
      const ipRec = await env.LIMIT_KV.get(ipKey, 'json').catch(() => null)
      const tsList = (ipRec && Array.isArray(ipRec.ts) ? ipRec.ts : []).filter(t => now - t < 60000)
      if (tsList.length >= IP_MIN_LIMIT) {
        return Response.json({ error: '请求过于频繁，请稍后再试' }, { status: 429, headers: corsHeader(origin) })
      }

      // 2b) 全站每日熔断
      const dayKey = `day:${new Date().toISOString().slice(0, 10)}`
      const dayRec = await env.LIMIT_KV.get(dayKey, 'json').catch(() => null)
      const dayCount = (dayRec && typeof dayRec.n === 'number') ? dayRec.n : 0
      if (dayCount >= DAILY_CALL_LIMIT) {
        return Response.json({ error: '今日 AI 额度已用完，请明天再来' }, { status: 429, headers: corsHeader(origin) })
      }

      // 计数（尽力而为，失败不阻断）
      tsList.push(now)
      await env.LIMIT_KV.put(ipKey, JSON.stringify({ ts: tsList }), { expirationTtl: 120 }).catch(() => {})
      await env.LIMIT_KV.put(dayKey, JSON.stringify({ n: dayCount + 1 }), { expirationTtl: 90000 }).catch(() => {})
    }

    // 3) 路由
    let body
    try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400, headers: corsHeader(origin) }) }

    if (url.pathname === '/api/chat') return handleChat(body, env, corsHeader(origin))
    if (url.pathname === '/api/evaluate') return handleEvaluate(body, env, corsHeader(origin))
    return Response.json({ error: 'unknown endpoint' }, { status: 404, headers: corsHeader(origin) })
  },
}

function corsHeader(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.jiugongbagua.com',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

async function fetchBalance(env) {
  const resp = await fetch(DS_BALANCE_URL, {
    headers: { 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
  })
  const j = await resp.json().catch(() => ({}))
  return Response.json(j)
}

async function fetchUsage(env) {
  const dayKey = `day:${new Date().toISOString().slice(0, 10)}`
  const dayRec = await env.LIMIT_KV.get(dayKey, 'json').catch(() => null)
  const dayCount = (dayRec && typeof dayRec.n === 'number') ? dayRec.n : 0
  return Response.json({ today: dayCount, limit: DAILY_CALL_LIMIT })
}

async function handleChat(body, env, cors) {
  const messages = Array.isArray(body.messages) ? body.messages : []
  if (messages.length === 0) return Response.json({ error: '缺少消息' }, { status: 400, headers: cors })

  let context = ''
  if (body.chart) context += `\n\n【当前命盘摘要】\n${String(body.chart).slice(0, 1500)}`
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
  const upstream = await fetch(DS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
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
