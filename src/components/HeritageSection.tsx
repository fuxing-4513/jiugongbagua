'use client'

import { useT, useTArray } from '@/lib/i18n'

interface Scholar {
  period: string
  school: string
  name: string
  work: string
  desc: string
}

export default function HeritageSection() {
  const getT = useT()
  const getTArray = useTArray()

  const scholars = getTArray('heritage.scholars') as Scholar[]

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gold-400 font-serif mb-3 text-center">
          {getT('heritage.sectionTitle')}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8 max-w-2xl mx-auto">
          {getT('heritage.sectionDesc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholars.map((s: Scholar, i: number) => (
            <div key={i}
              className="bg-dark-800/60 border border-dark-600 rounded-xl p-4 hover:border-gold-500/40 transition-all duration-200"
            >
              <p className="text-[10px] text-gold-500/60 mb-1">{s.period} · {s.school}</p>
              <h3 className="text-base font-bold text-gold-400 font-serif">{s.name}</h3>
              <p className="text-xs text-gold-500/70 italic mb-2">{s.work}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {getT('heritage.copyrightNote') !== 'heritage.copyrightNote' && (
          <p className="text-center text-[10px] text-gray-600 mt-6">
            {getT('heritage.copyrightNote')}
          </p>
        )}
      </div>
    </section>
  )
}
