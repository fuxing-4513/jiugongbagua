'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import ExpertDialog from './ExpertDialog'

/** 工具路径 → 名称 + emoji 映射 */
const TOOL_INFO: Record<string, {name: string, emoji: string}> = {
  '/bazi':            {name:'八字排盘', emoji:'📜'},
  '/ziwei':           {name:'紫微斗数', emoji:'⭐'},
  '/app':             {name:'AI排盘', emoji:'🔮'},
  '/liuyao':          {name:'六爻占卜', emoji:'☯'},
  '/qimen':           {name:'奇门遁甲', emoji:'🌀'},
  '/meihua':          {name:'梅花易数', emoji:'🌸'},
  '/hehun':           {name:'八字合婚', emoji:'💑'},
  '/chenggu':         {name:'称骨算命', emoji:'⚖️'},
  '/xingming':        {name:'姓名测试', emoji:'📝'},
  '/shuma':           {name:'数字测吉凶', emoji:'🔢'},
  '/huangli':         {name:'黄历择日', emoji:'📅'},
  '/jiemeng':         {name:'周公解梦', emoji:'💤'},
  '/lingqian':        {name:'灵签占卜', emoji:'🏮'},
  '/taluo':           {name:'塔罗占卜', emoji:'🃏'},
  '/shengxiao':       {name:'十二生肖', emoji:'🐉'},
  '/xiaoliuren':      {name:'小六壬', emoji:'🕐'},
  '/zonghe-zhengming':{name:'综合证明', emoji:'🔗'},
  '/fengshui':        {name:'风水测算', emoji:'🧭'},
  '/xingzuo':         {name:'星座运势', emoji:'♈'},
  '/wenku':           {name:'命理文库', emoji:'📚'},
}

/**
 * 浮动专家解析按钮
 * 在工具页面右侧固定浮动，点击弹出对话框。
 * 预留社交工具接口。
 */
export default function FloatingExpertButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // 匹配当前路径
  const matchedKey = Object.keys(TOOL_INFO).find(p => pathname === p || pathname.startsWith(p + '/'))
  const toolInfo = matchedKey ? TOOL_INFO[matchedKey] : null

  const close = useCallback(() => setOpen(false), [])

  // 非工具页不显示
  if (!toolInfo) return null

  return (
    <>
      {/* 浮动按钮——右侧居中 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 px-2 py-3 rounded-l-lg bg-amber-500/85 text-white text-[10px] font-medium shadow-lg hover:bg-amber-500 hover:shadow-amber-500/30 transition-all duration-200 cursor-pointer"
        title="专家解析"
      >
        <span className="text-base">💬</span>
        <span>专</span>
        <span>家</span>
        <span>解</span>
        <span>析</span>
      </button>

      {/* 弹窗 */}
      {open && (
        <ExpertDialog
          toolName={toolInfo.name}
          toolEmoji={toolInfo.emoji}
          close={close}
        />
      )}
    </>
  )
}
