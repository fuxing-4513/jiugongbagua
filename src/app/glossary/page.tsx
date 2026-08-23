import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTerms, getTermsByCategory, categoryMeta } from '@/lib/glossary-data';

export const metadata: Metadata = {
  title: '术语百科',
  description: '中国传统命理学术语百科大全，涵盖天干地支、五行八卦、八字命理、紫微斗数等易学概念的详细解读。',
};

export default function GlossaryPage() {
  const allTerms = getAllTerms();
  const categories = Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">术语百科</h1>
      <p className="text-gray-400 mb-8">中国传统命理学术语详解 · {allTerms.length} 个词条</p>
      {categories.map(cat => {
        const terms = getTermsByCategory(cat);
        const meta = categoryMeta[cat];
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-xl text-gold-400/80 font-serif mb-4 border-b border-dark-600 pb-2">
              {meta.emoji} {meta.name}
              <span className="text-sm text-gray-500 ml-2 font-normal">{terms.length} 个词条</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {terms.map(term => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="block p-5 bg-dark-800 border border-dark-600 rounded-lg hover:border-gold-400/50 transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-200 group-hover:text-gold-400 transition-colors">
                    {term.name}
                    <span className="text-sm text-gray-500 ml-2 font-normal">{term.pinyin}</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{term.shortDesc}</p>
                  {term.related && term.related.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {term.related.map((rt: string) => (
                        <span key={rt} className="text-xs px-2 py-0.5 bg-dark-700 text-gray-400 rounded">{rt}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
