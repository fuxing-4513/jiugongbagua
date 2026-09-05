import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTermBySlug, getAllTerms } from '@/lib/glossary-data';
import JiugongNote from '@/components/JiugongNote';
import { getBooksByCategory } from '@/data/xueguan/books';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return { title: '术语未找到' };
  return {
    title: `${term.name} - 术语百科 - 九宫八卦`,
    description: term.shortDesc,
  };
}

export async function generateStaticParams() {
  return getAllTerms().map((t) => ({ slug: t.slug }));
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/glossary" className="text-sm text-gold-400 hover:text-gold-300 mb-4 inline-block">
        ← 返回术语百科
      </Link>
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gold-400 font-serif">{term.name}</h1>
            <p className="text-sm text-gray-500">{term.pinyin} · {term.english}</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 bg-dark-700/50 p-3 rounded mb-4">{term.shortDesc}</p>
        <div className="text-gray-300 leading-relaxed">
          {term.detail.split('\n').filter(Boolean).map((para: string, i: number) => (
            <p key={i} className="mb-3">{para}</p>
          ))}
        </div>
        {term.related && term.related.length > 0 && (
          <div className="mt-6 pt-4 border-t border-dark-600">
            <h3 className="text-sm text-gray-400 mb-2">相关术语</h3>
            <div className="flex flex-wrap gap-2">
              {term.related.map((rt: string) => {
                const related = getAllTerms().find(t => t.name === rt);
                return related ? (
                  <Link key={rt} href={`/glossary/${related.slug}`}
                    className="text-sm px-3 py-1 bg-dark-700 text-gray-300 rounded hover:bg-dark-600 hover:text-gold-400 transition-colors">
                    {rt}
                  </Link>
                ) : (
                  <span key={rt} className="text-sm px-3 py-1 bg-dark-700 text-gray-500 rounded">{rt}</span>
                );
              })}
            </div>
          </div>
        )}
        {/* 相关典籍（术语 → 该学科古籍——知识图谱互链） */}
        {(() => {
          const catMap: Record<string, string> = { bazi: 'mingli-bazi', ziwei: 'mingli-ziwei', yijing: 'bushi-yijing', huangli: 'zaji-zeri' }
          const cat = catMap[term.category]
          if (!cat) return null
          const books = getBooksByCategory(cat).filter((b: any) => b.isComplete).slice(0, 5)
          if (books.length === 0) return null
          return (
            <div className="mt-6 pt-4 border-t border-dark-600">
              <h3 className="text-sm text-gray-400 mb-2">相关典籍</h3>
              <div className="flex flex-wrap gap-2">
                {books.map((b: any) => (
                  <Link key={b.id} href={`/xueguan/${cat}/${b.id}`}
                    className="text-sm px-3 py-1 bg-dark-700 text-gray-300 rounded hover:bg-dark-600 hover:text-gold-400 transition-colors">
                    《{b.title}》
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}
        <JiugongNote title="九宫按">
          本词条释义为<b>九宫原创白话解读</b>——依据《渊海子平》《三命通会》《滴天髓》等公版原典系统整理，非百科转载。引用溯源：九宫文库。
        </JiugongNote>
      </div>
    </div>
  );
}
