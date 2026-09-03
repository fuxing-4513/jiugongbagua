'use client'

import { useRef, useState, useEffect } from 'react'
import { AI_WORKER_URL, consumeQuota, remainingFree, DAILY_FREE } from '@/lib/ai-config'

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  '我最近的运势重点是什么？',
  '现在适合换工作/跳槽吗？',
  '我和伴侣的相处需要注意什么？',
  '今年适合投资创业吗？',
]

export default function AIAskPanel({
  chartContext,      // 命盘摘要文本（选填）
  refs,              // 古籍依据（选填）
  anchorsDefault,    // 时间轴锚定默认值
  evaluateMode,      // 评估模式（点按钮直接出一份情境评估）
  onOpenExpert,      // 大师 CTA 回调（选填）
  initialInput,      // 初始问题（URL q 参数透传）
  compact,
}: {
  chartContext?: string
  refs?: string
  anchorsDefault?: string[]
  evaluateMode?: boolean
  onOpenExpert?: () => void
  initialInput?: string
  compact?: boolean
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState(initialInput || '')
  const [anchors, setAnchors] = useState<string[]>(anchorsDefault || [])
  const [anchorText, setAnchorText] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(remainingFree())
  const [anchorOpen, setAnchorOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  async function ask(question: string) {
    if (busy) return
    let q = question
    if (left <= 0) {
      setMessages(prev => [...prev, { role: 'assistant', content: '今天的免费解读次数已用完——明早再来，或点击下方预约大师获取深度解读。' }])
      return
    }
    if (!q.trim()) return
    consumeQuota()
    setLeft(remainingFree())
    setMessages(prev => [...prev, { role: 'user', content: q.trim() }, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)

    try {
      const payload: Record<string, unknown> = {
        messages: [{ role: 'user', content: q.trim() }],
      }
      if (chartContext) payload.chart = chartContext
      if (anchors.length) payload.anchors = anchors
      if (evaluateMode) payload.evaluate = true

      const resp = await fetch(`${AI_WORKER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || `请求失败(${resp.status})`)
      }
      // 流式读取
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        // DeepSeek SSE: data: {...}（含 choices[0].delta.content）
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data:')) continue
          const data = t.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const j = JSON.parse(data)
            const piece = j.choices?.[0]?.delta?.content || ''
            if (piece) {
              acc += piece
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: acc }
                return next
              })
            }
          } catch {}
        }
      }
      if (!acc) {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: '（未收到回复，请稍后重试）' }
          return next
        })
      }
    } catch (e) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: `服务暂时不可用：${(e as Error).message}` }
        return next
      })
    }
    setBusy(false)
  }

  function addAnchor() {
    const v = anchorText.trim()
    if (!v) return
    setAnchors(prev => [...prev, v])
    setAnchorText('')
  }

  return (
    <div className="rounded-xl border border-violet-500/25 bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-violet-500/15">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-200">AI 决策顾问</span>
          <span className="text-[10px] text-gray-500">古籍依据 · 白话解读 · 免费{DAILY_FREE}次/天</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">
          {left > 0 ? `今日余 ${left} 次` : '今日已用完'}
        </span>
      </div>

      {/* 时间轴锚定（可选展开） */}
      <div className="px-4 pt-2">
        <button onClick={() => setAnchorOpen(!anchorOpen)}
          className="text-[11px] text-violet-300/80 hover:text-violet-200">
          {anchorOpen ? '▾ 收起' : '▸ 校准我的命盘（选填：补充人生节点，解读更贴合你）'}
        </button>
        {anchorOpen && (
          <div className="mt-2 space-y-2">
            {anchors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anchors.map((a, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-200">
                    {a}
                    <button className="ml-1 text-violet-400 hover:text-violet-200" onClick={() => setAnchors(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={anchorText}
                onChange={e => setAnchorText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addAnchor() }}
                placeholder="如：2019 年创业，2023 年结婚"
                className="flex-1 text-xs bg-dark-800/80 border border-violet-500/20 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-400/50"
              />
              <button onClick={addAnchor} className="text-xs px-3 py-2 rounded-lg bg-violet-500/15 text-violet-200 hover:bg-violet-500/25">添加</button>
            </div>
          </div>
        )}
      </div>

      {/* 消息区 */}
      <div className="px-4 py-3 space-y-3 max-h-[340px] overflow-y-auto">
        {messages.length === 0 && !evaluateMode && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              可以问我关于格局、运势、感情、事业的问题——例如：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => ask(s)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border border-violet-500/20 text-violet-300 hover:bg-violet-500/10 transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 pt-1">命理是古人的决策框架而非科学定律，解读仅供参考，重大决定请理性判断。</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-violet-500/20 text-violet-100 rounded-br-sm'
                : 'bg-dark-800/90 border border-dark-600 text-gray-300 rounded-bl-sm'
            }`}>
              {m.content}
              {busy && i === messages.length - 1 && m.content === '' && (
                <span className="inline-flex gap-1 ml-1">
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:0.3s]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="px-4 pb-3 pt-1">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') ask(input) }}
            disabled={busy}
            placeholder={busy ? '顾问思考中…' : '输入你的问题…'}
            className="flex-1 text-sm bg-dark-800/80 border border-violet-500/25 rounded-xl px-4 py-2.5 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-400/60 disabled:opacity-50"
          />
          <button
            onClick={() => ask(input)}
            disabled={busy || !input.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-40 transition-all">
            发送
          </button>
        </div>
        {/* 大师 CTA（私域承接） */}
        {onOpenExpert && (
          <button onClick={onOpenExpert}
            className="mt-2 w-full text-[11px] py-2 rounded-lg border border-gold-500/30 bg-gold-500/5 text-gold-400 hover:bg-gold-500/10 transition-colors">
            🎓 想要更深入的精细化解读？预约大师结合你的人生节点详谈 →
          </button>
        )}
      </div>
    </div>
  )
}
