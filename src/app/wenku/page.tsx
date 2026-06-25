export default function WenkuPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-4">📚 文库 · 建设中</h1>
      <p className="text-gray-400 mb-2 leading-relaxed">
        九宫文库正在重新规划中。
      </p>
      <p className="text-gray-500 text-sm leading-relaxed">
        我们决定不再堆砌快餐式内容。每一篇都将基于完整的命理推理逻辑，
        <br />保证有深度、有观点、有可读性。
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <a href="/bazi" className="text-xs px-4 py-2 rounded-lg bg-gold-600/20 text-gold-400 border border-gold-600/30 hover:bg-gold-600/30 transition-colors">
          🔮 先去排盘
        </a>
        <a href="/" className="text-xs px-4 py-2 rounded-lg bg-dark-700 text-gray-400 border border-dark-600 hover:text-gray-200 transition-colors">
          🏠 返回首页
        </a>
      </div>
    </div>
  )
}
