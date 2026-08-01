'use client'

import { useEffect, useCallback } from 'react'

interface ExpertDialogProps {
  toolName: string
  toolEmoji: string
  close: () => void
}

/**
 * 专家解析弹窗
 * 首页工具卡片上的浮动"专家解析"按钮，点击弹出此对话框。
 * 预留社交工具接口，后续可接入1对1沟通。
 */
export default function ExpertDialog({ toolName, toolEmoji, close }: ExpertDialogProps) {

  // ESC关闭
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }, [close])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="relative w-full max-w-sm mx-4 rounded-xl border border-dark-500/60 bg-dark-800 shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-dark-600/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{toolEmoji}</span>
            <div>
              <h3 className="text-base font-semibold text-white">{toolName}</h3>
              <p className="text-[10px] text-gray-500">九宫 · 专家解析</p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            九宫专家团队提供一对一深度分析服务。
            您可以直接联系命理专家，获取针对您个人情况的精准解读。
          </p>

          {/* 社交工具预留位 */}
          <div className="rounded-lg border border-dashed border-dark-500/60 p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">💬 社交工具 · 即将上线</p>
            <p className="text-[10px] text-gray-600">
              后续将开通微信/Telegram/邮件等渠道
              <br />
              让您和专家一对一沟通
            </p>
          </div>

          {/* 专家介绍 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-gold-500 shrink-0 mt-0.5">✦</span>
              <span>资深命理师团队，多年实战经验</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-gold-500 shrink-0 mt-0.5">✦</span>
              <span>针对您的问题提供定制化解析</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-gold-500 shrink-0 mt-0.5">✦</span>
              <span>九宫独家技法，不一样的命理视角</span>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-5 pb-4">
          <button
            onClick={() => {
              // 预留：社交工具接入后跳转到沟通页面
              close()
            }}
            className="w-full py-2.5 rounded-lg bg-gold-500/20 text-gold-500 text-sm font-medium hover:bg-gold-500/30 transition-all border border-gold-500/30"
          >
            联系专家
          </button>
          <p className="text-center text-[9px] text-gray-600 mt-2">
            点击后即将开通一对一沟通渠道
          </p>
        </div>
      </div>
    </div>
  )
}
