'use client';

import { useState } from 'react';
import { useT, useLocale } from '@/lib/i18n';
import { calculateHeluo, type HeluoResult } from '@/lib/heluo-algorithm';

const STEM_OPTIONS = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥',
  '丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥',
  '戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥',
  '庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥',
  '壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'];

export default function HeluoClient() {
  const getT = useT();
  const { locale } = useLocale();
  const [yg, setYg] = useState('甲子');
  const [mg, setMg] = useState('丙寅');
  const [dg, setDg] = useState('戊辰');
  const [hg, setHg] = useState('庚午');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<HeluoResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateHeluo(yg, mg, dg, hg, gender === 'male', locale);
    setResult(res);
  };

  const getGuaEmoji = (name: string) => {
    const map: Record<string, string> = { '坎':'☵','坤':'☷','震':'☳','巽':'☴','乾':'☰','兑':'☱','艮':'☶','离':'☲' };
    return map[name] || '☯';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">{getT('heluoPage.title')}</h1>
        <p className="text-gray-400">{getT('heluoPage.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-lg p-6 mb-8 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: getT('heluoPage.yearPillar'), value: yg, setter: setYg },
            { label: getT('heluoPage.monthPillar'), value: mg, setter: setMg },
            { label: getT('heluoPage.dayPillar'), value: dg, setter: setDg },
            { label: getT('heluoPage.hourPillar'), value: hg, setter: setHg },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
              <select value={field.value} onChange={e => field.setter(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm">
                {STEM_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <button type="button" onClick={() => setGender('male')}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${gender === 'male' ? 'bg-gold-400 text-dark-900' : 'bg-dark-700 text-gray-400'}`}>
            ♂ {getT('heluoPage.male')}
          </button>
          <button type="button" onClick={() => setGender('female')}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${gender === 'female' ? 'bg-gold-400 text-dark-900' : 'bg-dark-700 text-gray-400'}`}>
            ♀ {getT('heluoPage.female')}
          </button>
        </div>
        <button type="submit"
          className="w-full py-2.5 bg-gold-400 text-dark-900 rounded font-medium hover:bg-gold-300 transition-colors">
          {getT('heluoPage.submit')}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: getT('heluoPage.yearNum'), value: result.yearNum },
              { label: getT('heluoPage.monthNum'), value: result.monthNum },
              { label: getT('heluoPage.dayNum'), value: result.dayNum },
              { label: getT('heluoPage.hourNum'), value: result.hourNum },
              { label: getT('heluoPage.total'), value: result.totalNum, highlight: true },
            ].map(item => (
              <div key={item.label} className={`bg-dark-800 border rounded-lg p-4 text-center ${item.highlight ? 'border-gold-400/50' : 'border-dark-600'}`}>
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.highlight ? 'text-gold-400' : 'text-gray-200'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-5 text-center">
              <p className="text-4xl mb-2">{getGuaEmoji(result.xiantianGua)}</p>
              <h3 className="text-sm text-gray-400 mb-1">{getT('heluoPage.xiantianGua')}</h3>
              <p className="text-xl font-bold text-gold-400 font-serif">{result.xiantianGua}</p>
              <p className="text-sm text-gray-500 mt-1">{getT('heluoPage.wxLabel')}{result.xiantianWx}</p>
            </div>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-5 text-center">
              <p className="text-4xl mb-2">{getGuaEmoji(result.houtianGua)}</p>
              <h3 className="text-sm text-gray-400 mb-1">{getT('heluoPage.houtianGua')}</h3>
              <p className="text-xl font-bold text-gold-400 font-serif">{result.houtianGua}</p>
              <p className="text-sm text-gray-500 mt-1">{getT('heluoPage.wxLabel')}{result.houtianWx}</p>
            </div>
          </div>

          <div className="bg-dark-800 border border-gold-400/30 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gold-400 mb-3">{getT('heluoPage.wuxingAnalysis')}</h3>
            <p className="text-gray-300 leading-relaxed">{result.wuxingAnalysis}</p>
          </div>
        </div>
      )}
    </div>
  );
}
