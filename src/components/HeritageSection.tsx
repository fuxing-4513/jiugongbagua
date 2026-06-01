export default function HeritageSection() {
  const milestones = [
    { year: '上古', title: '伏羲画八卦', desc: '观天察地，始画八卦，奠定易学根基。' },
    { year: '商周', title: '文王演周易', desc: '囚羑里而演六十四卦，作卦辞爻辞。' },
    { year: '春秋', title: '孔子作易传', desc: '韦编三绝，作十翼以解易理。' },
    { year: '汉代', title: '京房纳甲', desc: '创纳甲筮法，将天干地支融入卦象。' },
    { year: '宋代', title: '陈抟传太极', desc: '传太极图、河图洛书于世。' },
    { year: '宋代', title: '邵雍创梅花', desc: '创梅花易数，万物皆可占。' },
    { year: '明代', title: '万民英著三命', desc: '《三命通会》集八字命理之大成。' },
    { year: '当代', title: '数字传承', desc: '命理文化与现代科技融合，普惠大众。' },
  ];

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gold-400 font-serif mb-8 text-center">文化传承</h2>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-dark-600 md:-translate-x-px" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className={`p-4 bg-dark-800 border border-dark-600 rounded-lg ${i % 2 === 0 ? 'mr-4' : 'ml-4'}`}>
                    <h3 className="text-sm font-medium text-gold-400">{m.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gold-400/20 border-2 border-gold-400 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-gold-400" />
                </div>
                <div className="flex-1 md:hidden">
                  <div className="p-4 bg-dark-800 border border-dark-600 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{m.year}</span>
                      <h3 className="text-sm font-medium text-gold-400">{m.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
