import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: '为什么相信九宫八卦｜数据·流派·古籍·AI·验证·隐私',
  description: '九宫八卦的排盘依据什么历法？采用什么流派体系？古籍知识库包含什么？AI 为什么不会胡编？六层信任体系透明公开。',
}

const SECTIONS: { icon: string; title: string; desc: string[]; links?: { href: string; label: string }[] }[] = [
  {
    icon: '🔢', title: '01 · 数据：排盘算法依据什么？',
    desc: [
      '历法：干支纪年以节气为界（立春换年、节令换月），非农历正月初一——这是子平法的通行规则。',
      '排盘引擎：八字四柱、大运起法（阳男阴女顺行/阴男阳女逆行）、紫微安星、奇门局法——均按传统术数规则实现为确定性算法。',
      '天文内核：西洋占星采用 VSOP87 行星理论（与瑞士星历同精度级），输入出生时间地点即可复现黄道位置。',
    ],
  },
  {
    icon: '🏮', title: '02 · 流派：采用什么体系？',
    desc: [
      '八字：子平法（以日主为中心）为主体，兼顾《滴天髓》旺衰法与《子平真诠》格局法的双重视角。',
      '紫微：以《紫微斗数全书》体系安星，辅以中州派三合视角的白话解读。',
      '奇门：时家转盘奇门（拆补/置闰法），八门九星八神按传统排布。',
      '凡有流派分歧处（如三刑名目、宫位归属），站内以考辨说明呈现，不隐瞒分歧。',
    ],
  },
  {
    icon: '📜', title: '03 · 古籍：知识库包含什么？',
    desc: [
      '易学书馆收录 140+ 部公版古籍全文：《滴天髓》《三命通会》《渊海子平》《子平真诠》《紫微斗数全书》《焦氏易林》《葬书》《青囊奥语》等。',
      '版权红线：仅收公版典籍（古代作者 + 逝世 50 年以上）——不收录任何现代整理本正文。',
      '每一部古籍页标注版本口径与文献可信度（作者题署 vs 学术考订——托名处明确辨析）。',
    ],
    links: [{ href: '/xueguan', label: '进入易学书馆 →' }],
  },
  {
    icon: '🤖', title: '04 · AI：为什么不会胡编？',
    desc: [
      '古籍问答 = RAG 检索增强：先在你的问题上检索 112 部古籍的原文索引，把相关原文片段送入模型，回答必须"据《某书》某篇"给出出处——没检索到就不硬答。',
      '所有 AI 解读都标注"传统文化研究与决策参考"边界——不输出医疗、法律、投资等专业意见。',
      '排盘结果（四柱/大运/星曜位置）由确定性算法计算，AI 只基于盘面事实解读——算法先排盘、AI 再解读。',
    ],
    links: [{ href: '/xueguan', label: '体验古籍问答 →' }, { href: '/ai', label: 'AI 决策对话 →' }],
  },
  {
    icon: '🧪', title: '05 · 验证：如何验证排盘？',
    desc: [
      '所有排盘输出（四柱干支、紫微十二宫星曜、奇门局盘）均可与权威排盘软件对照——算法公开可复核。',
      '站内八字、紫微、奇门三引擎互相独立实现，同一生辰输出一致才上线。',
      '命理体系属传统文化模型——九宫以"参考框架"定位，不宣称预测确定性。',
    ],
  },
  {
    icon: '🔒', title: '06 · 隐私：出生信息怎么处理？',
    desc: [
      '出生时间仅用于当次排盘计算——生辰不存服务器、不留档、不出现在任何日志。',
      '站内免费使用无需注册——没有任何"算命记录"账户体系。',
      '如使用 AI 对话，问题内容仅用于当次生成（Cloudflare Workers AI 边缘计算）。',
    ],
  },
]

export default function WhyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '为什么相信九宫八卦' }]} />
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">🛡️ 为什么相信九宫八卦？</h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          我们不要求你"相信"——我们把 <b>数据依据、流派口径、古籍来源、AI 边界、验证方法、隐私处理</b> 六件事全部摊开给你看。
        </p>
      </div>

      <div className="space-y-5 mb-10">
        {SECTIONS.map(sec => (
          <div key={sec.title} className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-6">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{sec.icon} {sec.title}</h2>
            <div className="space-y-2">
              {sec.desc.map((d, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2"><span className="text-gold-500 shrink-0">·</span>{d}</p>)}
            </div>
            {sec.links && (
              <div className="flex flex-wrap gap-3 mt-4">
                {sec.links.map(l => <Link key={l.href} href={l.href} className="text-xs px-3 py-1.5 rounded-lg border border-gold-300/60 text-gold-700 dark:text-gold-300 hover:bg-gold-500/10">{l.label}</Link>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-gradient-to-b from-[#fdf9ee]/70 to-transparent dark:from-[#1c1a13] p-6 text-center mb-10">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <b className="text-gray-800 dark:text-gray-100">九宫的立场：</b>古籍是公版文化资产，术数是先人观察时间与生命的模型。
          我们做的是——<b>把模型讲清楚、把依据摆出来、把边界说明白</b>——让你用它照见处境，然后理性地做自己的决定。
        </p>
      </div>
    </div>
  )
}
