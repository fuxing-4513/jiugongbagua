'use client'

import Link from 'next/link'
import AIAskPanel from '@/components/AIAskPanel'
import Breadcrumb from '@/components/Breadcrumb'
import { useRouter } from 'next/navigation'

export default function AiClient() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: 'AI 决策对话' }]} />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gold-600 font-serif mb-2">💬 AI 决策对话</h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
          先排盘，再对话——AI 顾问基于你的命盘与古籍依据给出白话解读。
          <span className="text-violet-400"> 推理有出处、结论不黑盒，重大决定请理性判断。</span>
        </p>
      </div>

      <div className="mb-5 flex flex-wrap justify-center gap-3">
        <Link href="/bazi" className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 transition-all shadow-md shadow-violet-900/20">
          📜 先排八字盘
        </Link>
        <Link href="/ziwei" className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-gold-600/80 to-gold-500/80 text-white hover:from-gold-500/80 hover:to-gold-400/80 transition-all shadow-md shadow-gold-900/20">
          ⭐ 或排紫微盘
        </Link>
      </div>

      <AIAskPanel
        onOpenExpert={() => router.push('/experts')}
        chartContext="（尚未排盘——用户可能咨询通用问题；若问及具体命盘请引导先排盘）"
      />

      <p className="text-center text-[10px] text-gray-600 mt-4 leading-relaxed">
        排盘结果页内的「AI 情境评估」会携带你的完整命盘数据，解读更精准。<br />
        免费解读每日 5 次 · 内容仅供传统文化研究与决策参考
      </p>
    </div>
  )
}
