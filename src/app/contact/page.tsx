import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '联系我们',
  description: '联系九宫八卦平台：邮箱 support@jiugongbagua.com，或预约专家进行一对一命理咨询。',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">联系我们</h1>
      <p className="text-gray-400 mb-8">如有任何问题、建议或合作意向，欢迎与我们取得联系</p>

      <div className="space-y-6">
        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gold-300 mb-2">📧 电子邮箱</h2>
          <p className="text-sm text-gray-400 mb-2">通用咨询与售后支持：</p>
          <p className="text-base text-gold-400 font-mono">support@jiugongbagua.com</p>
          <p className="text-xs text-gray-500 mt-3">我们会在 24 小时内回复您的邮件</p>
        </div>

        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gold-300 mb-2">👨‍🏫 专家咨询</h2>
          <p className="text-sm text-gray-400 mb-3">如需命理深度解读，可预约资深专家为您一对一服务</p>
          <Link href="/experts" className="inline-block px-5 py-2 bg-gold-400/15 border border-gold-400/30 rounded-lg text-gold-400 text-sm hover:bg-gold-400/25 transition-colors">
            预约专家 →
          </Link>
        </div>

        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gold-300 mb-2">❓ 常见问题</h2>
          <p className="text-sm text-gray-400 mb-3">使用过程中遇到问题？先看看常见问题中是否有答案</p>
          <Link href="/faq" className="inline-block px-5 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm hover:text-gold-400 transition-colors">
            查看 FAQ →
          </Link>
        </div>

        <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gold-300 mb-2">📖 帮助中心</h2>
          <p className="text-sm text-gray-400 mb-3">查看详细的使用帮助和教程</p>
          <Link href="/help" className="inline-block px-5 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm hover:text-gold-400 transition-colors">
            进入帮助中心 →
          </Link>
        </div>
      </div>
    </div>
  );
}
