'use client'

// 书页 AI 古籍问答组件——调 /api/ask-book（Workers AI RAG）
// 由构建期 data-ai-ask 控制显隐（worker 部署后全局启用）
import { useState } from 'react'

const EXAMPLES = ['这本书讲了什么？', '它的核心思想是什么？', '和同类古籍比有什么特点？']

export default function BookAsk({ bookTitle }: { bookTitle: string }) {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<{ bookId: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function ask(question: string) {
    const text = question.trim()
    if (!text || loading) return
    setLoading(true); setErr(''); setAnswer('')
    try {
      const r = await fetch('/api/ask-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'AI 服务暂不可用')
      setAnswer(data.answer || '（未返回内容）')
      setSources(data.sources || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : '请求失败——AI 服务配置中，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">AI 古籍问答</h3>
        <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">基于《{bookTitle}》馆藏内容</span>
      </div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(q)}
          placeholder={`问《${bookTitle}》的问题…如"这本书的核心思想是什么"`}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1c22] text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-400"
        />
        <button onClick={() => ask(q)} disabled={loading}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0">
          {loading ? '思考中…' : '提问'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {EXAMPLES.map(e => (
          <button key={e} onClick={() => { setQ(e); ask(e) }} disabled={loading}
            className="text-[11px] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            {e}
          </button>
        ))}
      </div>
      {loading && <p className="text-xs text-gray-400 mt-3">正在检索古籍原文并生成回答…</p>}
      {err && <p className="text-xs text-rose-500 mt-3">{err}</p>}
      {answer && !err && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">{answer}</div>
          {sources.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-2">依据：{sources.map(s => `《${s.title}》`).join('、')}</p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">AI 回答仅供传统文化参考——引文以古籍原文为准</p>
        </div>
      )}
    </div>
  )
}
