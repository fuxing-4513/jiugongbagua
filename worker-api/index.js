/**
 * 九宫用户体系 Worker（C-lite v1）
 * 同域部署：jiugongbagua.com/api/*（会话 cookie 同域生效）
 * 端点：
 *   POST /api/register  注册（邮箱+密码，PBKDF2 哈希）
 *   POST /api/login     登录 → Set-Cookie session（HttpOnly）
 *   POST /api/logout    退出
 *   GET  /api/me        当前用户
 *   GET  /api/charts    我的命盘列表
 *   POST /api/charts    保存命盘 { chartType, title, summary, payload }
 *   DELETE /api/charts/:id  删除
 *   GET  /api/share/:id 公开只读分享（大师/私域查看——不含身份信息）
 */
const PBKDF2_ITER = 100000
const SESSION_TTL = 30 * 24 * 3600 // 30 天
const COOKIE_NAME = 'jg_session'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  })
}

async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    key, 256,
  )
  return { saltHex: bytesToHex(salt), hashHex: bytesToHex(new Uint8Array(bits)) }
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)))
}
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function genId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 32]).join('')
}

function getSessionUser(request, env) {
  const cookie = (request.headers.get('Cookie') || '').split(';')
    .map(c => c.trim()).find(c => c.startsWith(`${COOKIE_NAME}=`))
  if (!cookie) return null
  const token = cookie.slice(COOKIE_NAME.length + 1)
  return { token }
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env, ctx)
    } catch (e) {
      return json({ error: 'internal: ' + (e && e.message ? e.message : String(e)) + ' @' + (e && e.stack ? e.stack.split('\n')[1] || '' : '') }, 500)
    }
  },
}

async function handle(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // 限速：同 IP 每分钟 30 次（auth/charts 全局限）
    const ip = request.headers.get('CF-Connecting-IP') || 'anon'
    const now = Date.now()
    const rateKey = `rl:${ip}`
    const rateRec = await env.LIMIT_KV?.get(rateKey, 'json').catch(() => null)
    const ts = (rateRec && Array.isArray(rateRec.ts) ? rateRec.ts : []).filter(t => now - t < 60000)
    if (ts.length >= 30) return json({ error: '请求过于频繁' }, 429)
    ts.push(now)
    await env.LIMIT_KV?.put(rateKey, JSON.stringify({ ts }), { expirationTtl: 120 }).catch(() => {})

    // ── 注册 ──
    if (method === 'POST' && path === '/api/register') {
      const body = await request.json().catch(() => ({}))
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const nickname = String(body.nickname || '').slice(0, 30)
      if (!EMAIL_RE.test(email)) return json({ error: '邮箱格式不正确' }, 400)
      if (password.length < 8 || password.length > 72) return json({ error: '密码需 8-72 位' }, 400)
      const { saltHex, hashHex } = await hashPassword(password)
      const res = await env.JG_DB.prepare(
        'INSERT INTO users (email, pass_hash, salt, nickname, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(email, hashHex, saltHex, nickname, now).run().catch(() => null)
      if (!res) return json({ error: '该邮箱已注册' }, 409)
      const user = await env.JG_DB.prepare('SELECT id, email, nickname FROM users WHERE email = ?').bind(email).first()
      return json({ ok: true, user })
    }

    // ── 登录 ──
    if (method === 'POST' && path === '/api/login') {
      const body = await request.json().catch(() => ({}))
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const user = await env.JG_DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
      if (!user) return json({ error: '邮箱或密码不正确' }, 401)
      const { hashHex } = await hashPassword(password, user.salt)
      if (hashHex !== user.pass_hash) return json({ error: '邮箱或密码不正确' }, 401)
      const token = genId() + genId() + genId()
      await env.JG_DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(token, user.id, now + SESSION_TTL * 1000).run()
      return new Response(JSON.stringify({ ok: true, user: { id: user.id, email: user.email, nickname: user.nickname } }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`,
        },
      })
    }

    // ── 会话用户解析 ──
    const sess = getSessionUser(request, env)
    async function currentUser() {
      if (!sess) return null
      const s = await env.JG_DB.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').bind(sess.token).first()
      if (!s || s.expires_at < now) return null
      return env.JG_DB.prepare('SELECT id, email, nickname FROM users WHERE id = ?').bind(s.user_id).first()
    }

    // ── 退出 ──
    if (method === 'POST' && path === '/api/logout') {
      if (sess) await env.JG_DB.prepare('DELETE FROM sessions WHERE token = ?').bind(sess.token).run()
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0` },
      })
    }

    // ── 当前用户 ──
    if (method === 'GET' && path === '/api/me') {
      const user = await currentUser()
      return json(user ? { ok: true, user } : { ok: false })
    }

    // ── 公开分享（私域大师查看——脱敏只读） ──
    const shareMatch = path.match(/^\/api\/share\/([a-z0-9]{6,12})$/)
    if (method === 'GET' && shareMatch) {
      const c = await env.JG_DB.prepare('SELECT id, chart_type, title, summary, created_at FROM charts WHERE id = ?')
        .bind(shareMatch[1]).first()
      if (!c) return json({ error: '记录不存在或已删除' }, 404)
      return json({ ok: true, chart: c })
    }

    // ── 以下需登录 ──
    const user = await currentUser()
    if (!user) return json({ error: '请先登录' }, 401)

    // ── 我的命盘列表 ──
    if (method === 'GET' && path === '/api/charts') {
      const list = await env.JG_DB.prepare(
        'SELECT id, chart_type, title, created_at FROM charts WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
      ).bind(user.id).all()
      return json({ ok: true, charts: list.results })
    }

    // ── 保存命盘 ──
    if (method === 'POST' && path === '/api/charts') {
      const body = await request.json().catch(() => ({}))
      const chartType = String(body.chartType || 'bazi').slice(0, 10)
      const title = String(body.title || '').slice(0, 40)
      const summary = String(body.summary || '').slice(0, 3000)
      const payload = String(body.payload || '').slice(0, 20000)
      if (!summary) return json({ error: '缺少命盘内容' }, 400)
      let id = genId()
      for (let i = 0; i < 3; i++) {
        const dup = await env.JG_DB.prepare('SELECT id FROM charts WHERE id = ?').bind(id).first()
        if (!dup) break
        id = genId()
      }
      await env.JG_DB.prepare(
        'INSERT INTO charts (id, user_id, chart_type, title, summary, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, user.id, chartType, title, summary, payload, now).run()
      return json({ ok: true, id })
    }

    // ── 删除 ──
    const delMatch = path.match(/^\/api\/charts\/([a-z0-9]{6,12})$/)
    if (method === 'DELETE' && delMatch) {
      await env.JG_DB.prepare('DELETE FROM charts WHERE id = ? AND user_id = ?').bind(delMatch[1], user.id).run()
      return json({ ok: true })
    }

    return json({ error: 'unknown endpoint' }, 404)
}
