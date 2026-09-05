'use client'

// 九宫文库全库搜索（卦象/人物/干支/术语 4 源即时检索）
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { dataPath } from '@/lib/anti-scrape'

interface WenkuIndex {
  gua: { n: number; name: string; full: string; slug: string }[]
  renwu: { id: string; name: string; era: string; slug: string; intro: string }[]
  ganzhi: { id: string; kind: string; wuxing: string; meaning: string }[]
  glossary: { slug: string; name: string; category: string; shortDesc: string }[]
}

const CAT_NAMES: Record<string, string> = {
  bazi: '八字', ziwei: '紫微', yijing: '易经', qimen: '奇门', liuren: '六壬', fengshui: '风水',
  xiangshu: '相术', liuyao: '六爻', daoxue: '道学', xingming: '姓名', zexuan: '择日',
  zhongyi: '中医', meng: '梦占', zhanxing: '星占', huangli: '黄历',
}

export default function WenkuSearch() {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState<WenkuIndex | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(dataPath('wenkuSearch'))
      .then(r => r.json())
      .then(d => { setIdx(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const kw = q.trim()
  const results = useMemo(() => {
    if (!idx || kw.length < 1) return null
    const hit = (s: string) => s.toLowerCase().includes(kw.toLowerCase())
    return {
      gua: idx.gua.filter(g => hit(g.name) || hit(g.full)),
      renwu: idx.renwu.filter(r => hit(r.name) || hit(r.intro)),
      ganzhi: idx.ganzhi.filter(g => hit(g.id) || hit(g.wuxing)),
      glossary: idx.glossary.filter(t => hit(t.name) || hit(t.shortDesc)).slice(0, 30),
    }
  }, [idx, kw])

  const total = results ? results.gua.length + results.renwu.length + results.ganzhi.length + results.glossary.length : 0

  return (
    <div className="rounded-xl bg-white/70 dark:bg-[#161616] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg shrink-0">🔍</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索文库：卦象、人物、术语、干支…… 如「乾」「邵雍」「十神」"
          className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none py-1.5"
          aria-label="文库搜索"
        />
        {q && <button onClick={() => setQ('')} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">✕ 清空</button>}
      </div>

      {loading && <p className="text-xs text-gray-400 mt-2">索引加载中…</p>}
      {!loading && kw.length === 0 && (
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          💡 文库收录 <b>64 卦象详解 · 130+ 术数人物 · 1000+ 术语 · 22 干支</b>——输入关键词即可跨类检索。
        </p>
      )}
      {results && kw.length > 0 && total === 0 && (
        <p className="text-xs text-gray-400 mt-3">未找到与「{kw}」相关的条目——换个关键词试试（如「十神」「葬书」「紫微」）。</p>
      )}

      {results && total > 0 && (
        <div className="mt-3 space-y-3 text-sm max-h-[380px] overflow-y-auto pr-1">
          {results.gua.length > 0 && (
            <Group label={`卦象（${results.gua.length}）`}>
              {results.gua.slice(0, 6).map(g => (
                <Item key={g.slug} href={`/wenku/gua/${g.slug}`} icon="☰" title={`${g.name}卦`} sub={g.full} />
              ))}
            </Group>
          )}
          {results.renwu.length > 0 && (
            <Group label={`人物（${results.renwu.length}）`}>
              {results.renwu.slice(0, 6).map(r => (
                <Item key={r.id} href={`/wenku/renwu/${r.slug}`} icon="👤" title={r.name} sub={`${r.era} ${r.intro}`} />
              ))}
            </Group>
          )}
          {results.ganzhi.length > 0 && (
            <Group label={`干支（${results.ganzhi.length}）`}>
              {results.ganzhi.slice(0, 6).map(g => (
                <Item key={g.id} href={`/wenku/ganzhi/${encodeURIComponent(g.id)}`} icon={g.kind === 'tian' ? '☀️' : '🌙'} title={g.id} sub={`${g.kind === 'tian' ? '天干' : '地支'} · ${g.wuxing} · ${g.meaning}`} />
              ))}
            </Group>
          )}
          {results.glossary.length > 0 && (
            <Group label={`术语（${results.glossary.length}）`}>
              {results.glossary.slice(0, 10).map(t => (
                <Item key={t.slug} href={`/glossary/${t.slug}`} icon="📖" title={t.name} sub={`${CAT_NAMES[t.category] || t.category} · ${t.shortDesc}`} />
              ))}
              {results.glossary.length > 10 && <p className="text-[11px] text-gray-400 pl-8">…还有 {results.glossary.length - 10} 条——可到 <Link href="/glossary" className="jg-text-accent">术语百科</Link> 浏览全部分类</p>}
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Item({ href, icon, title, sub }: { href: string; icon: string; title: string; sub: string }) {
  return (
    <Link href={href} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
      <span className="text-sm mt-0.5">{icon}</span>
      <span className="min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gold-600 dark:group-hover:text-gold-400">{title}</span>
        <span className="block text-xs text-gray-400 truncate">{sub}</span>
      </span>
    </Link>
  )
}
