import Link from 'next/link';

export default function BottomCTA() {
  return (
    <section className="py-16 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gold-400 font-serif mb-3">
          传承千年智慧，知命而进取
        </h2>
        <p className="text-gray-400 mb-8">
          命理是前人的智慧结晶，了解命运是为了更好地把握人生。
        </p>
        <Link
          href="/app"
          className="inline-block px-8 py-3 bg-gold-400 text-dark-900 rounded-lg font-medium text-lg hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20 hover:shadow-gold-400/40"
        >
          开始AI排盘
        </Link>
      </div>
    </section>
  );
}
