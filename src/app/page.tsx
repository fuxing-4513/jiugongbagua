'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

interface ModuleInfo {
  key: string
  nameKey: string
  descKey: string
  emoji: string
  href: string
}

const modules: ModuleInfo[] = [
  { key: 'bazi', nameKey: 'modules.bazi.name', descKey: 'modules.bazi.desc', emoji: '📜', href: '/bazi' },
  { key: 'ziwei', nameKey: 'modules.ziwei.name', descKey: 'modules.ziwei.desc', emoji: '⭐', href: '/ziwei' },
  { key: 'liuyao', nameKey: 'modules.liuyao.name', descKey: 'modules.liuyao.desc', emoji: '☯', href: '/liuyao' },
  { key: 'xiaoliuren', nameKey: 'modules.xiaoliuren.name', descKey: 'modules.xiaoliuren.desc', emoji: '👋', href: '/xiaoliuren' },
  { key: 'jiemeng', nameKey: 'modules.jiemeng.name', descKey: 'modules.jiemeng.desc', emoji: '💤', href: '/jiemeng' },
  { key: 'xingming', nameKey: 'modules.xingming.name', descKey: 'modules.xingming.desc', emoji: '📝', href: '/xingming' },
  { key: 'shuma', nameKey: 'modules.shuma.name', descKey: 'modules.shuma.desc', emoji: '🔢', href: '/shuma' },
  { key: 'huangli', nameKey: 'modules.huangli.name', descKey: 'modules.huangli.desc', emoji: '📅', href: '/huangli' },
  { key: 'taluo', nameKey: 'modules.taluo.name', descKey: 'modules.taluo.desc', emoji: '🃏', href: '/taluo' },
  { key: 'cezi', nameKey: 'modules.cezi.name', descKey: 'modules.cezi.desc', emoji: '🖌', href: '/cezi' },
  { key: 'wenku', nameKey: 'modules.wenku.name', descKey: 'modules.wenku.desc', emoji: '📚', href: '/wenku' },
  { key: 'experts', nameKey: 'modules.experts.name', descKey: 'modules.experts.desc', emoji: '👨‍🏫', href: '/experts' },
]

export default function HomePage() {
  const { t } = useLocale()

  const getT = (key: string) => {
    const keys = key.split('.')
    let value: unknown = t
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key
      value = (value as Record<string, unknown>)[k]
    }
    return typeof value === 'string' ? value : key
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Subtitle */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-red-900 font-serif mb-2">
          {getT('site.name')}
        </h1>
        <p className="text-lg text-gray-600">
          {getT('home.subtitle')}
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.key}
            href={mod.href}
            className="group bg-white rounded-xl border border-red-100 p-5 hover:border-red-300 hover:shadow-md hover:shadow-red-100/50 transition-all duration-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {mod.emoji}
            </div>
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-red-700 transition-colors mb-1">
              {getT(mod.nameKey)}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {getT(mod.descKey)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
