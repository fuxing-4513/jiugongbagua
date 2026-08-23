'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function Footer() {
  const getT = useT()

  return (
    <footer className="glass-panel text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
              {getT('footer.about')}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">☯</span>
              <span className="text-sm font-bold text-gold-600 font-serif">{getT('site.name')}</span>
            </div>
            <p className="text-xs text-gray-500">{getT('footer.brandDesc')}</p>
            <div className="mt-3 space-y-1">
              <Link href="/wiki" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">平台介绍</Link>
              <Link href="/contact" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('footer.contact')}</Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
              {getT('footer.features')}
            </h3>
            <div className="grid grid-cols-1 gap-1">
              <Link href="/bazi" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.bazi.name')}</Link>
              <Link href="/ziwei" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.ziwei.name')}</Link>
              <Link href="/liuyao" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.liuyao.name')}</Link>
              <Link href="/huangli" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.huangli.name')}</Link>
              <Link href="/xingming" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.xingming.name')}</Link>
              <Link href="/fengshui" className="text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.fengshui.name')}</Link>
              <Link href="/app" className="text-xs text-gold-600 hover:text-gold-500 transition-colors">{getT('nav.app')}</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
              {getT('footer.resources')}
            </h3>
            <div className="space-y-1">
              <Link href="/wenku" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.wenku.name')}</Link>
              <Link href="/glossary" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('nav.glossary')}</Link>
              <Link href="/faq" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('nav.faq')}</Link>
              <Link href="/help" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('footer.help')}</Link>
              <Link href="/experts" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('modules.experts.name')}</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
              {getT('footer.legal')}
            </h3>
            <div className="space-y-1">
              <Link href="/privacy" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('footer.privacy')}</Link>
              <Link href="/terms" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('footer.terms')}</Link>
              <Link href="/contact" className="block text-xs text-gray-500 hover:text-gold-600 transition-colors">{getT('footer.contact')}</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-600 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            {getT('site.disclaimer')}
          </p>
          <p className="text-xs text-gray-500">
            {getT('site.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
