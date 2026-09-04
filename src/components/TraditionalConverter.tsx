'use client'

// 全站繁简转换器：繁体模式下把简体内容（含结果页算法文案/词条/古籍正文）
// 运行时整体转换为繁体，实现"丝滑全局切换"。
// 简体模式下不工作（SSR 默认输出简体）。

import { useEffect, useRef } from 'react'
import { useLocale } from '@/lib/i18n'

export default function TraditionalConverter() {
  const { locale } = useLocale()
  const convRef = useRef<((s: string) => string) | null>(null)

  useEffect(() => {
    if (locale !== 'zh-TW') return

    let cancelled = false
    let observer: MutationObserver | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    // 惰性加载 opencc（~180KB，仅繁体模式）
    async function loadConverter() {
      if (convRef.current || cancelled) return
      try {
        const OpenCC = await import('opencc-js')
        convRef.current = OpenCC.Converter({ from: 'cn', to: 'tw' })
        convertAll()
      } catch {
        // 转换器加载失败则静默（保持简体，不破坏页面）
      }
    }

    // 把子树内所有中文文本节点转繁体（跳过 script/style/input/textarea）
    function convertDOM(root: Node) {
      const conv = convRef.current
      if (!conv) return
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const el = n.parentElement
          if (!el) return NodeFilter.FILTER_REJECT
          if (el.closest('script,style,textarea,input')) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      for (const n of nodes) {
        const v = n.nodeValue
        if (!v || !/[\u4e00-\u9fff]/.test(v)) continue
        const t = conv(v)
        if (t !== v) n.nodeValue = t
      }
    }

    function convertAll() {
      if (cancelled || !convRef.current) return
      convertDOM(document.body)
    }

    // 监听 React 后续渲染的新文本（结果页交互后）
    function startObserver() {
      if (observer) return
      observer = new MutationObserver(muts => {
        const relevant = muts.some(m => m.type === 'childList' || m.type === 'characterData')
        if (!relevant) return
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          if (!cancelled) convertAll()
        }, 120)
      })
      observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    }

    loadConverter()
    startObserver()

    return () => {
      cancelled = true
      if (observer) observer.disconnect()
      if (timer) clearTimeout(timer)
      convRef.current = null
    }
  }, [locale])

  return null
}
