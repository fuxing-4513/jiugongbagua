import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '帮助中心 - 九宫八卦',
  description: '九宫八卦帮助中心：从入门指南到高级使用技巧，为您解答各种平台使用问题。',
};

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">帮助中心</h1>
      <p className="text-gray-400 mb-8">从入门到深度使用，这里收集了最常见的问题和指南</p>

      <div className="space-y-6">
        {/* 入门指南 */}
        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gold-300 mb-1">🚀 入门指南</h2>
          <p className="text-xs text-gray-500 mb-3">第一次使用九宫八卦？从这里开始</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>· 推荐从首页「八字命理课堂」开始学习基础知识</li>
            <li>· 然后试试「四柱八字」——只需输入出生年月日时即可排盘</li>
            <li>· 快速占卜可以试试「小六壬」或「六爻占卜」</li>
            <li>· 基础功能<strong className="text-gray-300">无需注册</strong>即可使用</li>
          </ul>
        </div>

        {/* 功能使用 */}
        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gold-300 mb-1">🧰 功能使用</h2>
          <p className="text-xs text-gray-500 mb-3">了解各种命理工具的使用方法</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>· <strong className="text-gray-300">八字排盘：</strong>输入出生年月日时，系统自动生成四柱命盘和解读</li>
            <li>· <strong className="text-gray-300">紫微斗数：</strong>输入生辰后生成十二宫命盘，含主星、辅星、四化分析</li>
            <li>· <strong className="text-gray-300">六爻占卜：</strong>支持电脑自动起卦、手工摇卦、报数起卦三种方式</li>
            <li>· <strong className="text-gray-300">小六壬：</strong>输入当前农历月日时即可快速占卜</li>
            <li>· <strong className="text-gray-300">黄历：</strong>每日自动显示宜忌、吉神方位、冲煞等信息</li>
          </ul>
        </div>

        {/* 隐私安全 */}
        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gold-300 mb-1">🔒 隐私与安全</h2>
          <p className="text-xs text-gray-500 mb-3">关于数据处理，您可以放心</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>· 所有排盘计算均在<strong className="text-gray-300">浏览器本地完成</strong>，生辰信息不上传服务器</li>
            <li>· 我们不存储您的排盘数据，无需额外删除操作</li>
            <li>· 网站使用 HTTPS 加密传输，确保浏览安全</li>
            <li>· 详见 <Link href="/privacy" className="text-gold-400 hover:underline">隐私政策</Link></li>
          </ul>
        </div>

        {/* 付费相关 */}
        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gold-300 mb-1">💎 VIP 与付费</h2>
          <p className="text-xs text-gray-500 mb-3">了解免费与付费功能的区别</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>· <strong className="text-gray-300">免费功能：</strong>八字排盘、黄历查询、小六壬、周公解梦、每日运势等</li>
            <li>· <strong className="text-gray-300">VIP 功能：</strong>AI 深度命理分析、合婚详解、完整命盘报告等</li>
            <li>· VIP 功能正在逐步开放中，请关注平台公告</li>
          </ul>
        </div>
      </div>

      {/* 底部引导 */}
      <div className="mt-10 text-center p-6 bg-dark-800/40 border border-dark-600 rounded-xl">
        <h2 className="text-lg font-semibold text-gold-300 mb-2">没找到答案？</h2>
        <p className="text-sm text-gray-400 mb-4">访问完整 FAQ 或直接联系我们</p>
        <div className="flex justify-center gap-3">
          <Link href="/faq" className="px-5 py-2 bg-gold-400/15 border border-gold-400/30 rounded-lg text-gold-400 text-sm hover:bg-gold-400/25 transition-colors">查看 FAQ</Link>
          <Link href="/contact" className="px-5 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm hover:text-gold-400 transition-colors">联系我们</Link>
        </div>
      </div>
    </div>
  );
}
