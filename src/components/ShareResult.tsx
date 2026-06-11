'use client'

import { useState, useCallback } from 'react'

interface Props {
  /** 要复制/分享的文本内容 */
  text: string
  /** 可选标题，加在文本前面 */
  title?: string
  /** 按钮样式 */
  className?: string
  /** 按钮显示文案 */
  label?: string
}

/**
 * 结果分享/复制组件 — 一键复制文本到剪贴板
 */
export default function ShareResult({ text, title, className = '', label = '📋 复制结果' }: Props) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleCopy = useCallback(async () => {
    try {
      const content = title ? `${title}\n\n${text}` : text
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setError('')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: 用旧方式
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        setError('复制失败，请手动复制')
        setTimeout(() => setError(''), 3000)
      }
    }
  }, [text, title])

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
        copied
          ? 'bg-green-900/30 border-green-600 text-green-400'
          : error
            ? 'bg-red-900/30 border-red-600 text-red-400'
            : 'bg-dark-700 border-dark-600 text-gray-400 hover:text-gold-400 hover:border-gold-500/50'
      } ${className}`}
    >
      {copied ? '✅ 已复制' : error || label}
    </button>
  )
}
