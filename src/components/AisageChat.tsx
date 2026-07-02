'use client'

import { useEffect, useRef } from 'react'

/** AI 对话服务地址 */
// AI 服务地址：生产部署时替换下面的 Worker URL
const WORKER_URL = 'https://aisage-api.4513.workers.dev/chat'

/** 快捷话题 */
const QUICK_TOPICS = [
  { emoji: '📜', label: '八字分析', prompt: '给我介绍一下四柱八字是怎么看命的，每柱代表什么' },
  { emoji: '⭐', label: '紫微斗数', prompt: '紫微斗数怎么看一个人的财运？主要看哪个宫位？' },
  { emoji: '☯', label: '六爻占卜', prompt: '六爻占卜是怎么起卦的？爻辞怎么看吉凶？' },
  { emoji: '🌀', label: '奇门遁甲', prompt: '奇门遁甲中的八门各自代表什么？怎么判断吉凶？' },
  { emoji: '🌸', label: '梅花易数', prompt: '梅花易数的时间起卦法是怎么算的？' },
  { emoji: '📝', label: '姓名学', prompt: '姓名五格剖象法中，人格和地格哪个更重要？' },
  { emoji: '🧭', label: '风水布局', prompt: '居家风水入门——客厅和卧室有哪些基本禁忌？' },
]

// 用全局变量保存对话状态（绕过 React 闭包问题）
let chatState: {
  messages: { role: string; content: string }[]
  loading: boolean
  inputValue: string
  error: string
} = {
  messages: [{ role: 'assistant', content: `你好！我是九宫先生，精通八字、紫微斗数、奇门遁甲、六爻、梅花易数、姓名学、风水堪舆等多个玄学领域。

你可以问我任何问题，比如：
• "我最近事业不顺，帮我看看怎么回事？"
• "我适合改名吗？需要注意什么？"
• "这个投资项目能成吗？"
• "帮我分析一下我家风水布局"
• "周公解梦——梦见掉牙齿"
• "算个小六壬，现在是卯时"

无需选择领域，直接提问即可。😊` }],
  loading: false,
  inputValue: '',
  error: '',
}

// ============================================================
// AisageChat — 玄学全科 AI 对话（纯原生 DOM 操作版）
// ============================================================
export default function AisageChat() {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    // 只初始化一次
    if (container.dataset.initialized === 'true') return
    container.dataset.initialized = 'true'

    // ── 消息列表区域 ──
    const messagesDiv = container.querySelector('.aisage-messages') as HTMLElement
    const inputEl = container.querySelector('.aisage-input') as HTMLInputElement
    const sendBtn = container.querySelector('.aisage-send-btn') as HTMLElement
    const topicsDiv = container.querySelector('.aisage-topics') as HTMLElement

    if (!messagesDiv || !inputEl || !sendBtn) return

    // ── 渲染消息 ──
    function renderMessages() {
      messagesDiv.innerHTML = ''
      chatState.messages.forEach((msg, i) => {
        const div = document.createElement('div')
        div.className = `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`
        div.innerHTML = `
          <div class="max-w-[85%] rounded-xl px-3.5 py-2.5 ${
            msg.role === 'user'
              ? 'bg-gold-500/15 border border-dark-600/30 text-dark-900'
              : ' border border-dark-600/50 text-gray-200'
          }">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-xs">${msg.role === 'user' ? '👤 你' : '🧿 九宫先生'}</span>
              ${msg.role === 'assistant' && i === 0 ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-gold-500/15 text-dark-700 border border-dark-600/30">全科</span>' : ''}
            </div>
            <div class="space-y-1">{{CONTENT}}</div>
          </div>
        `
        // 填充内容
        const contentDiv = div.querySelector('.space-y-1') as HTMLElement
        if (contentDiv) {
          contentDiv.innerHTML = msg.content.split('\n').map(line => {
            if (!line.trim()) return '<br/>'
            if (line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+[.、]/.test(line.trim())) {
              return `<p class="text-gray-200 text-sm leading-relaxed ml-3">${escapeHtml(line.trim())}</p>`
            }
            return `<p class="text-gray-200 text-sm leading-relaxed">${escapeHtml(line)}</p>`
          }).join('')
        }

        messagesDiv.appendChild(div)
      })

      // 加载动画
      if (chatState.loading) {
        const loadingDiv = document.createElement('div')
        loadingDiv.className = 'flex justify-start'
        loadingDiv.id = 'aisage-loading'
        loadingDiv.innerHTML = `
          <div class=" border border-dark-600/50 rounded-xl px-3.5 py-2.5">
            <div class="flex items-center gap-2 text-gray-400 text-xs">
              <span class="inline-block w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
              <span class="inline-block w-2 h-2 rounded-full bg-gold-500 animate-pulse" style="animation-delay:0.2s"></span>
              <span class="inline-block w-2 h-2 rounded-full bg-gold-600 animate-pulse" style="animation-delay:0.4s"></span>
              <span class="ml-1">正在思考...</span>
            </div>
          </div>
        `
        messagesDiv.appendChild(loadingDiv)
      }

      // 错误提示
      if (chatState.error) {
        const errDiv = document.createElement('div')
        errDiv.className = 'flex justify-center'
        errDiv.innerHTML = `<div class="bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2 text-center"><p class="text-red-400 text-xs">⚠️ ${escapeHtml(chatState.error)}</p></div>`
        messagesDiv.appendChild(errDiv)
      }

      // 滚动到底部
      messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

    function escapeHtml(text: string): string {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    }

    // ── 发送消息 ──
    async function sendMessage(text: string) {
      const trimmed = text.trim()
      if (!trimmed || chatState.loading) return

      chatState.messages.push({ role: 'user', content: trimmed })
      chatState.inputValue = ''
      inputEl.value = ''
      chatState.loading = true
      chatState.error = ''
      renderMessages()
      setUIState(true)

      try {
        const SYSTEM_PROMPT = '你是一位精通中国传统玄学全科的资深大师，名为"九宫先生"。你的知识涵盖四柱八字、紫微斗数、奇门遁甲、六爻、梅花易数、姓名学、风水学等领域。回复原则：专业准确、领域自判、通俗易懂、实用建议。关键术语用【】标注并解释。'
        const res = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatState.messages.map(m => ({ role: m.role, content: m.content }))],
            temperature: 0.7,
            max_tokens: 2048
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`请求失败: ${res.status} ${err}`)
        }

        const data = await res.json()
        chatState.messages.push({ role: 'assistant', content: data.choices?.[0]?.message?.content })
        chatState.loading = false
        chatState.error = ''
        renderMessages()
      } catch (err: unknown) {
        chatState.loading = false
        chatState.error = err instanceof Error ? err.message : 'AI 服务调用失败'
        renderMessages()
      } finally {
        setUIState(false)
        inputEl.focus()
      }
    }

    function setUIState(disabled: boolean) {
      inputEl.disabled = disabled
      sendBtn.classList.toggle('disabled\\:opacity-40', disabled)
      sendBtn.classList.toggle('disabled\\:cursor-not-allowed', disabled)
      const btn = sendBtn as HTMLButtonElement
      btn.disabled = disabled || !inputEl.value.trim()
      // 快捷按钮也禁用
      topicsDiv?.querySelectorAll('button').forEach(b => {
        (b as HTMLButtonElement).disabled = disabled
      })
    }

    // ── 事件绑定 ──
    sendBtn.addEventListener('click', () => {
      sendMessage(inputEl.value)
    })

    inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        sendMessage(inputEl.value)
      }
    })

    inputEl.addEventListener('input', () => {
      const btn = sendBtn as HTMLButtonElement
      btn.disabled = !inputEl.value.trim() || chatState.loading
    })

    // 快捷话题
    QUICK_TOPICS.forEach(topic => {
      const btn = document.createElement('button')
      btn.className = 'flex items-center gap-1 px-2.5 py-1.5 rounded-full  border border-dark-600/50 hover:border-dark-500/60 hover:bg-gold-500/10 transition-all text-xs text-gray-400 hover:text-dark-800 whitespace-nowrap'
      btn.innerHTML = `<span>${topic.emoji}</span><span>${topic.label}</span>`
      btn.addEventListener('click', () => {
        // 展开 details
        if (detailsRef.current) detailsRef.current.open = true
        sendMessage(topic.prompt)
      })
      topicsDiv?.appendChild(btn)
    })

    // 初始渲染
    renderMessages()
    inputEl.focus()
  }, [])

  return (
    <div className="w-full" ref={containerRef}>
      <details
        ref={detailsRef}
        className="group rounded-xl border border-dark-600/50 transition-all duration-200 overflow-hidden"
      >
        <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none transition-all select-none"
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(180,180,180,0.3)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl" style={{ animation: 'aiSpin 4s linear infinite' }}>☯</span>
            <div className="text-left">
              <p className="text-base font-semibold" style={{ color: '#111111' }}>
                点击这里在线 · 玄学 AI 问一问
              </p>
              <p className="text-xs" style={{ color: '#a08030' }}>
                八字 · 紫微 · 奇门 · 六爻 · 姓名 · 风水 · 解梦 · 择日
              </p>
            </div>
          </div>
        </summary>

        <div className="border-t border-dark-500/20">
          <div className="aisage-messages h-80 overflow-y-auto px-4 py-3 space-y-3"></div>

          <div className="px-3 py-2.5 border-t border-dark-500/30">
            <div className="aisage-topics mb-2.5 overflow-x-auto scrollbar-none flex gap-1.5 min-w-max"></div>

            <div className="flex gap-2">
              <input
                type="text"
                className="aisage-input flex-1  border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                placeholder="问一个玄学问题..."
                autoComplete="off"
              />
              <button
                className="aisage-send-btn px-3 py-2 rounded-lg bg-gold-500/25 text-black text-sm font-medium border border-dark-600/40 hover:bg-gold-500/35 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="text-[9px] text-gray-600 text-center mt-1.5">
              AI 回复仅供参考 · 命运在自己手中 🪷
            </p>
          </div>
        </div>
      </details>
    </div>
  )
}
