import Link from 'next/link';

export default function BottomCTA() {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent via-dark-900/50 to-dark-900">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gold-400 font-serif mb-3">
          窥见命运脉络 · 由此启程
        </h2>
        <p className="text-gray-400 mb-8">
          输入生辰八字，AI 结合紫微斗数、八字、易经为你深度批命；古籍原文背书，每一条解读有据可查。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="px-8 py-3 bg-gold-400 text-dark-900 rounded-lg font-semibold text-lg hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20 hover:shadow-gold-400/40"
          >
            开始 AI 排盘
          </Link>
          <Link
            href="/glossary"
            className="px-6 py-3 border border-gold-400/30 rounded-lg text-gold-400 font-medium hover:bg-gold-400/10 transition-colors"
          >
            术语百科
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">免费注册 · 一键排盘 · 无需绑卡</p>
      </div>
    </section>
  );
}
