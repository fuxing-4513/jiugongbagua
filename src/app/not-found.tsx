import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gold-600/30 font-serif mb-4">404</div>
        <h1 className="text-2xl font-bold text-gold-400 font-serif mb-3">页面未找到</h1>
        <p className="text-gray-400 mb-8">
          您访问的页面不存在，可能已被移动或删除。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95"
          >
            返回首页
          </Link>
          <Link
            href="/wenku"
            className="bg-dark-700 hover:bg-dark-600 border border-gold-500/30 text-gray-300 px-6 py-2.5 rounded-lg transition-colors active:scale-95"
          >
            浏览文库
          </Link>
        </div>
        <div className="mt-8 flex justify-center gap-2 text-sm">
          <Link href="/bazi/" className="text-gray-500 hover:text-gold-500 transition-colors">八字</Link>
          <span className="text-gray-600">·</span>
          <Link href="/ziwei/" className="text-gray-500 hover:text-gold-500 transition-colors">紫微斗数</Link>
          <span className="text-gray-600">·</span>
          <Link href="/xingming/" className="text-gray-500 hover:text-gold-500 transition-colors">姓名</Link>
        </div>
      </div>
    </div>
  )
}
