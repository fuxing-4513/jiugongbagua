import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '命理百科 - 九宫八卦',
  description: '全面了解中国传统命理文化知识体系，包括八字命理、紫微斗数、风水堪舆、六爻占卜等核心内容。',
};

const articles = [
  { title: '什么是八字命理？', href: '/wenku', desc: '四柱八字的基本原理与推算方法，从入门到精通。' },
  { title: '天干地支体系', href: '/wenku', desc: '十天干与十二地支的组合规律，六十甲子的奥秘。' },
  { title: '阴阳五行学说', href: '/wenku', desc: '金木水火土的生克制化，理解五行平衡的精髓。' },
  { title: '紫微斗数入门', href: '/ziwei', desc: '紫微星象体系，十二宫格局解读命运走向。' },
  { title: '六爻预测基础', href: '/liuyao', desc: '周易六十四卦的介绍与六爻起卦方法。' },
  { title: '风水堪舆原理', href: '/fengshui', desc: '人与环境的和谐之道，家居风水布局指南。' },
  { title: '梅花易数概览', href: '/meihua', desc: '体用生克、万物类象，易学预测的灵活运用。' },
  { title: '奇门遁甲简介', href: '/qimen', desc: '三奇八门九星，时空能量场的预测方法。' },
];

export default function WikiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">命理百科</h1>
      <p className="text-gray-400 mb-8">探索中国传统命理文化知识体系</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <Link key={article.title} href={article.href}
            className="block p-5 bg-dark-800 border border-dark-600 rounded-lg hover:border-gold-400/50 transition-all group">
            <h2 className="text-lg font-semibold text-gray-200 group-hover:text-gold-400 transition-colors mb-2">
              {article.title}
            </h2>
            <p className="text-sm text-gray-400">{article.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
