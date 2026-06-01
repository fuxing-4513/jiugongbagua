'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function Footer() {
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

  const getTFlat = (key: string) => {
    return getT(key)
  }

  return (
    <footer className="glass-panel text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">☯</span>
              <span className="text-lg font-bold text-gold-300 font-serif">
                {getTFlat('site.name')}
              </span>
            </div>
            <p className="text-sm text-gold-300/70 leading-relaxed">
              {getTFlat('site.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">
              {getTFlat('nav.tools')}
            </h3>
            <div className="grid grid-cols-2 gap-1">
              <Link href="/bazi" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.bazi.name')}
              </Link>
              <Link href="/ziwei" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.ziwei.name')}
              </Link>
              <Link href="/liuyao" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.liuyao.name')}
              </Link>
              <Link href="/xiaoliuren" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.xiaoliuren.name')}
              </Link>
              <Link href="/jiemeng" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.jiemeng.name')}
              </Link>
              <Link href="/xingming" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.xingming.name')}
              </Link>
              <Link href="/shuma" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.shuma.name')}
              </Link>
              <Link href="/huangli" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.huangli.name')}
              </Link>
              <Link href="/taluo" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.taluo.name')}
              </Link>
              <Link href="/cezi" className="text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
                {getTFlat('modules.cezi.name')}
              </Link>
            </div>
          </div>

          {/* Other Links */}
          <div>
            <h3 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">
              {getTFlat('nav.wenku')}
            </h3>
            <Link href="/wenku" className="block text-sm text-gold-300/70 hover:text-gray-300 transition-colors mb-4">
              {getTFlat('modules.wenku.name')}
            </Link>
            <Link href="/experts" className="block text-sm text-gold-300/70 hover:text-gray-300 transition-colors mb-4">
              {getTFlat('modules.experts.name')}
            </Link>
            <h3 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-2 mt-4">
              {getTFlat('nav.experts')}
            </h3>
            <Link href="/experts" className="block text-sm text-gold-300/70 hover:text-gray-300 transition-colors">
              {getTFlat('experts.title')}
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-600 mt-8 pt-6 text-center">
          <p className="text-xs text-gold-300/50 mb-2">
            {getTFlat('site.disclaimer')}
          </p>
          <p className="text-xs text-gold-300/50">
            {getTFlat('site.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
