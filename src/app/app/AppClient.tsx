'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { computeBaziChart, type BaziChartResult, type PillarShenSha, getPillarShenShaLabel } from '@/lib/bazi-engine';
import CalendarInput, { type CalendarType, getMaxDay } from '@/components/CalendarInput';
import { calcTrueSolarHour } from '@/lib/solar-time';
import { Solar, Lunar } from 'lunar-typescript';

const TrueSolarTime = dynamic(() => import('@/components/TrueSolarTime'), { ssr: false });

const modules = [
  { id: 'bazi', name: '四柱八字', emoji: '📜' },
  { id: 'ziwei', name: '紫微斗数', emoji: '⭐' },
];

const T_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const T_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const YANG_GAN = ['甲','丙','戊','庚','壬'];
const YANG_ZHI = ['子','寅','辰','午','申','戌'];
const YIN_ZHI  = ['丑','卯','巳','未','酉','亥'];
const WU_XING_COLORS: Record<string,string> = {'金':'text-yellow-400','木':'text-green-400','水':'text-blue-400','火':'text-red-400','土':'text-amber-400'};
const PILLAR_LABELS = ['年柱','月柱','日柱','时柱'];

export default function AppClient() {
  const [activeModule, setActiveModule] = useState('bazi');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('6');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('男');

  const [inputMode, setInputMode] = useState<'date'|'bazi'>('date');
  const [bzTg, setBzTg] = useState(['','','','']);
  const [bzDz, setBzDz] = useState(['','','','']);
  const [bzYear, setBzYear] = useState('1984');

  const [trueSolarOn, setTrueSolarOn] = useState(false);
  const [trueSolarLng, setTrueSolarLng] = useState(116.4);

  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [baziResult, setBaziResult] = useState<BaziChartResult | null>(null);
  const [ziweiResult, setZiweiResult] = useState<any>(null);

  const y = parseInt(year) || 1990;
  const m = parseInt(month) || 1;
  const d = parseInt(day) || 1;
  const h = parseInt(hour) || 6;

  const resolvedHour = trueSolarOn
    ? calcTrueSolarHour(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, h, trueSolarLng)
    : h;

  const maxDay = getMaxDay(calendarType, y, m);
  const validationMsg = (() => {
    if (inputMode === 'date') {
      if (y < 1900 || y > 2100) return '年份需在 1900-2100 之间';
      if (m < 1 || m > 12) return '请输入有效月份';
      if (d < 1 || d > maxDay) return `该月只有 ${maxDay} 天，请输入 1-${maxDay}`;
    }
    return '';
  })();
  const isValid = inputMode === 'date' ? !validationMsg : !!bzTg[0] && !!bzDz[0] && !!bzYear;

  // Valid years for year pillar
  const validYears = useMemo(() => {
    const tIdx = T_GAN.indexOf(bzTg[0]);
    const dIdx = T_ZHI.indexOf(bzDz[0]);
    if (tIdx < 0 || dIdx < 0) return [];
    const ys: number[] = [];
    for (let y = 1900; y <= 2100; y++) {
      if (((y - 4) % 10 + 10) % 10 === tIdx && ((y - 4) % 12 + 12) % 12 === dIdx) ys.push(y);
    }
    return ys;
  }, [bzTg, bzDz]);

  const handleAnalyze = async () => {
    if (!isValid) return;
    setIsAnalyzing(true);
    setAnalyzed(false);
    setBaziResult(null);
    setZiweiResult(null);
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 500));

    if (activeModule === 'bazi') {
      if (inputMode === 'bazi') {
        try {
          const result = computeBaziChart({ tg: bzTg, dz: bzDz, birthYear: parseInt(bzYear), gender });
          setBaziResult(result);
          setAnalyzed(true);
        } catch(e: any) { console.error(e); setErrorMsg('排盘失败: ' + (e?.message || '未知错误')); }
      } else {
        try {
          const finalHour = Math.round(resolvedHour) % 24;
          let lunar: any;
          if (calendarType === 'solar') lunar = Solar.fromYmdHms(y, m, d, finalHour, 0, 0).getLunar();
          else lunar = Lunar.fromYmdHms(y, isLeapMonth ? -m : m, d, finalHour, 0, 0);
          if (!lunar) throw new Error('日期超出八字计算范围');
          const tg = [lunar.getYearGan(), lunar.getMonthGan(), lunar.getDayGan(), lunar.getTimeGan()];
          const dz = [lunar.getYearZhi(), lunar.getMonthZhi(), lunar.getDayZhi(), lunar.getTimeZhi()];
          const result = computeBaziChart({ tg, dz, birthYear: y, gender });
          setBaziResult(result);
          setAnalyzed(true);
        } catch(e: any) { console.error(e); setErrorMsg('八字排盘失败: ' + (e?.message || '未知错误')); }
      }
    } else {
      try {
        const iztro = await import('iztro');
        const { astro } = iztro;
        const finalHour = Math.round(resolvedHour) % 24;
        let solar: any;
        if (calendarType === 'solar') solar = Solar.fromYmdHms(y, m, d, finalHour, 0, 0);
        else solar = Lunar.fromYmdHms(y, isLeapMonth ? -m : m, d, finalHour, 0, 0).getSolar();
        if (!solar) throw new Error('日期超出紫微计算范围');
        const dateStr = `${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`;
        const astroData = astro.bySolar(dateStr, finalHour, gender as any);
        setZiweiResult(astroData);
        setAnalyzed(true);
      } catch(e: any) { console.error('Ziwei error:', e); setErrorMsg('紫微排盘失败: ' + (e?.message || '未知错误，请检查日期或尝试其他模式')); }
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gold-600 font-serif mb-2">AI 智能排盘</h1>
        <p className="text-gray-400">多模块命理排盘 · AI辅助智能解读</p>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {modules.map(mod => (
          <button key={mod.id} onClick={() => { setActiveModule(mod.id); setAnalyzed(false); }}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeModule === mod.id ? 'bg-gold-500 text-dark-900 shadow-lg shadow-gold-400/30 scale-105'
                : 'bg-dark-800 text-gray-400 hover:text-gold-500 border border-dark-600'}`}>
            <span className="text-xl mr-1.5">{mod.emoji}</span>{mod.name}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-8 max-w-lg mx-auto shadow-sm">
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">姓名（选填）</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入姓名"
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-200 text-sm" />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">性别</label>
          <div className="flex gap-2">
            {['男','女'].map(g => (
              <button key={g} onClick={() => setGender(g)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${gender === g ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>{g}</button>
            ))}
          </div>
        </div>

        {/* Input Mode Toggle (Bazi only) */}
        {activeModule === 'bazi' && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setInputMode('date')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'date' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
              📅 公历/农历排盘
            </button>
            <button onClick={() => setInputMode('bazi')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'bazi' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
              🀄 直接排盘
            </button>
          </div>
        )}

        {/* Date input */}
        {inputMode === 'date' && (
          <div className="space-y-3">
            <CalendarInput calendarType={calendarType} year={year} month={month} day={day} hour={hour}
              isLeapMonth={isLeapMonth} onCalendarTypeChange={setCalendarType} onYearChange={setYear}
              onMonthChange={setMonth} onDayChange={setDay} onHourChange={setHour}
              onLeapMonthChange={setIsLeapMonth} label="" />
            {activeModule === 'bazi' && (
              <div className="pt-2 border-t border-dark-600">
                <TrueSolarTime enabled={trueSolarOn} onToggle={setTrueSolarOn} longitude={trueSolarLng}
                  onLongitudeChange={setTrueSolarLng} compact />
                {trueSolarOn && <p className="text-[10px] text-amber-600/70 mt-1">⏱ 校正后时辰：{resolvedHour.toFixed(1)}时</p>}
              </div>
            )}
          </div>
        )}

        {/* Direct Bazi input */}
        {inputMode === 'bazi' && activeModule === 'bazi' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">请直接输入四柱天干地支（阳干配阳支，阴干配阴支）：</p>
            {PILLAR_LABELS.map((label, i) => {
              const selTg = bzTg[i];
              const filteredDz = selTg === '' ? T_ZHI : YANG_GAN.includes(selTg) ? YANG_ZHI : YIN_ZHI;
              return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-10">{label}</span>
                <select value={bzTg[i]} onChange={e => {
                  const a = [...bzTg]; a[i] = e.target.value; const b = [...bzDz];
                  const newDz = e.target.value === '' ? T_ZHI : YANG_GAN.includes(e.target.value) ? YANG_ZHI : YIN_ZHI;
                  if (b[i] && !newDz.includes(b[i])) b[i] = '';
                  setBzTg(a); setBzDz(b);
                }} className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-2 py-1.5 text-gray-200 text-sm">
                  <option value="">天干</option>
                  {T_GAN.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={bzDz[i]} onChange={e => { const a = [...bzDz]; a[i] = e.target.value; setBzDz(a); }}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-2 py-1.5 text-gray-200 text-sm">
                  <option value="">地支</option>
                  {filteredDz.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <span className="text-[10px] text-gray-600 w-6 text-center">{bzTg[i]}{bzDz[i]}</span>
              </div>
            )})}
            <div>
              <label className="block text-xs text-gray-400 mb-1">出生年份 · {bzTg[0]}{bzDz[0]}年</label>
              {validYears.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {validYears.map(y => (
                    <button key={y} type="button" onClick={() => setBzYear(String(y))}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${bzYear === String(y) ? 'bg-gold-600 text-dark-900 font-semibold border-gold-500' : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500/50'}`}>{y}</button>
                  ))}
                </div>
              ) : bzTg[0] && bzDz[0] ? (
                <p className="text-xs text-red-400">该年柱组合不存在于干支纪年</p>
              ) : <p className="text-xs text-gray-600">请先选择年柱天干地支</p>}
              {validYears.length > 0 && <p className="text-xs text-gray-600 mt-1">同八字每60年一轮回</p>}
            </div>
          </div>
        )}

        {validationMsg && <p className="text-xs text-red-400 mt-3">{validationMsg}</p>}
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-10">
        <button onClick={handleAnalyze} disabled={!isValid || isAnalyzing}
          className={`px-10 py-3.5 rounded-full text-base font-bold shadow-lg transition-all ${
            isValid && !isAnalyzing ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-dark-900 hover:shadow-xl hover:scale-105 active:scale-95' : 'bg-dark-700 text-gray-500 cursor-not-allowed'}`}>
          {isAnalyzing ? <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full" />分析中...</span> : '🚀 启动排盘分析'}
        </button>
        {!analyzed && !isAnalyzing && <p className="text-xs text-gray-500 mt-2">选择模块，填写信息，点击按钮查看完整命理分析</p>}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-lg mx-auto mb-8 bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">⚠️ {errorMsg}</p>
          <p className="text-xs text-red-500/70 mt-1">请检查输入信息或尝试其他排盘模式</p>
        </div>
      )}

      {/* Results */}
      {analyzed && baziResult && <BaziResultView result={baziResult} name={name} />}
      {analyzed && ziweiResult && <ZiweiResultView data={ziweiResult} name={name} />}

      {/* VIP Banner */}
      {analyzed && (
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">👑</div>
          <h3 className="text-lg font-bold text-amber-700 mb-1">解锁 VIP 完整命理分析</h3>
          <p className="text-sm text-amber-600 mb-4">财富格局 · 十年大运 · 流年指引 — 三大深度维度，解锁您的完整命运图谱</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-5 py-2 bg-dark-800 border border-amber-500/30 text-amber-600 rounded-full text-sm font-medium hover:bg-amber-50 transition-all">🎫 单次解锁 ¥9.9</button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">💎 月卡 ¥29.9/月</button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-dark-900 rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">⭐ 年卡 ¥199/年（省 45%）</button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">🏆 永久卡 ¥499</button>
          </div>
          <p className="text-xs text-amber-400 mt-3">开通后立即解锁所有 VIP 维度完整内容 · 支持微信/支付宝</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════ Bazi Result View ══════════════ */
function BaziResultView({ result, name }: { result: BaziChartResult; name: string }) {
  const { pills, wx, str, shenSha, pillarShenSha, dayun, analysis, baziStr, birthYear, curAge } = result;
  const wxEntries = Object.entries(wx).sort((a,b) => b[1]-a[1]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{name ? `${name} ` : ''}{birthYear}年生 · {str.level} · 当前{curAge}岁</p>
        <p className="text-base font-bold text-gold-400 font-serif">{baziStr}</p>
      </div>

      {/* 四柱命盘 */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四柱命盘</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700">
              <th className="p-2 border border-dark-600 text-gray-500 w-16"></th>
              {PILLAR_LABELS.map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              {[['天干',pills.map(p=>p.gan), 'font-serif text-lg'],['地支',pills.map(p=>p.zhi), 'font-serif text-lg'],
                ['五行',pills.map(p=>`${p.wxG}${p.wxZ}`), WU_XING_COLORS[pills[0].wxG] || ''],
                ['十神',pills.map(p=>`${p.ssG} / ${p.ssZ}`), ''],
                ['藏干',pills.map(p=>p.hd), 'text-gray-500 text-[10px]'],
                ['纳音',pills.map(p=>p.ny), 'text-gray-400 text-[10px]'],
              ].map(([label,values,cls],ri)=>(
                <tr key={ri} className={ri%2===0?'bg-dark-750':''}>
                  <td className="p-2 border border-dark-600 text-gray-400 font-medium">{label}</td>
                  {(values as string[]).map((v,i)=><td key={i} className={`p-2 border border-dark-600 text-center ${cls}`}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center">日主<strong className="text-gold-400">{pills[2].gan}</strong>（{pills[2].wxG}） · {str.level} · {str.detail}</p>
      </div>

      {/* 五行分布 */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">五行分布</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {wxEntries.map(([k,v]) => (
            <div key={k} className="text-center min-w-[60px]">
              <p className={`text-lg font-bold ${WU_XING_COLORS[k]}`}>{k}</p>
              <div className="w-full h-3 bg-dark-700 rounded-full mt-1 overflow-hidden">
                <div className={`h-full rounded-full ${k==='金'?'bg-yellow-500':k==='木'?'bg-green-500':k==='水'?'bg-blue-500':k==='火'?'bg-red-500':'bg-amber-500'}`}
                  style={{width:`${(v/Math.max(...Object.values(wx),1))*100}%`}}/>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{v}个</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center">
          {wxEntries[0][0]}最旺（{wxEntries[0][1]}个）· {wxEntries[4][0]}最弱（{wxEntries[4][1]}个）
          {wxEntries[4][1]===0 ? ` · 缺${wxEntries[4][0]}` : ''}
        </p>
      </div>

      {/* 神煞详解 */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">神煞详解</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700">
              <th className="p-2 border border-dark-600 text-gray-500 w-16"></th>
              {PILLAR_LABELS.map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              {pillarShenSha.map((p,i)=>(
                <tr key={i}>
                  <td className="p-2 border border-dark-600 text-gray-400">{PILLAR_LABELS[i]}</td>
                  <td colSpan={4} className="p-2 border border-dark-600 text-gray-300 text-[11px]">
                    {getPillarShenShaLabel(p.items) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Global shensha with meanings */}
        {shenSha.length > 0 && shenSha[0].name !== '无特殊神煞' && (
          <div className="mt-3 space-y-1.5">
            {shenSha.map((s,i) => (
              <div key={i} className={`text-xs p-2 rounded ${
                s.type==='吉'?'bg-green-900/20 border border-green-700/30':
                s.type==='凶'?'bg-red-900/20 border border-red-700/30':
                'bg-dark-700/50 border border-dark-600'}`}>
                <span className={
                  s.type==='吉'?'text-green-400':s.type==='凶'?'text-red-400':'text-gray-300'
                }>{s.type==='吉'?'🟢':s.type==='凶'?'🔴':'⚪'} {s.name}</span>
                {s.meaning && <span className="text-gray-400 ml-1">— {s.meaning}</span>}
                {s.resolve && <span className="text-amber-500/80 ml-1">💡 {s.resolve}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 大运 */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">大运</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {dayun.map((dy,i) => (
            <div key={i} className={`text-center px-3 py-2 rounded-lg border text-xs ${i===Math.floor(curAge/10) ? 'bg-gold-600/20 border-gold-500/50 text-gold-400' : 'bg-dark-700 border-dark-600 text-gray-400'}`}>
              <p className="font-bold">{dy.gz}</p>
              <p className="text-[10px]">{dy.age}岁起</p>
            </div>
          ))}
        </div>
      </div>

      {/* 命理批断 */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">命理批断</h3>

        <div className="space-y-4">
          {/* 概述 */}
          <div>
            <h4 className="text-xs font-medium text-gold-400 mb-1">📋 概述</h4>
            {analysis.general.map((g,i)=><p key={i} className="text-gray-300 text-sm leading-relaxed">{g}</p>)}
          </div>

          {/* 性格 */}
          <div>
            <h4 className="text-xs font-medium text-gold-400 mb-1">🧠 性格分析</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.personality}</p>
          </div>

          {/* 事业 */}
          <div>
            <h4 className="text-xs font-medium text-gold-400 mb-1">💼 事业运势</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.career}</p>
          </div>

          {/* 感情 */}
          <div>
            <h4 className="text-xs font-medium text-gold-400 mb-1">💕 情感关系</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.love}</p>
          </div>

          {/* 财运 */}
          <div>
            <h4 className="text-xs font-medium text-gold-400 mb-1">💰 财运分析</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.wealth}</p>
          </div>

          {/* 古籍 */}
          {analysis.classical.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gold-400 mb-1">📜 古籍参考</h4>
              {analysis.classical.map((c,i)=><p key={i} className="text-gray-400 text-xs italic">{c}</p>)}
            </div>
          )}

          {/* 其他 */}
          {analysis.other.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gold-400 mb-1">📌 其他提示</h4>
              {analysis.other.map((o,i)=><p key={i} className="text-gray-300 text-sm">{o}</p>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ Ziwei Result View ══════════════ */
const BRIGHTNESS: Record<string, { label: string; color: string }> = {
  '庙': { label: '廟', color: 'text-green-400' },
  '旺': { label: '旺', color: 'text-green-300' },
  '得': { label: '得', color: 'text-blue-300' },
  '利': { label: '利', color: 'text-cyan-300' },
  '平': { label: '平', color: 'text-yellow-400' },
  '不': { label: '不', color: 'text-orange-400' },
  '陷': { label: '陷', color: 'text-red-400' },
};

function ZiweiResultView({ data, name }: { data: any; name: string }) {
  const palaces = Array.isArray(data?.palaces) ? data.palaces : [];
  const allStars: any[] = [];

  palaces.forEach((p: any) => {
    const stars = [...(p?.majorStars || []), ...(p?.minorStars || []), ...(p?.adjectiveStars || [])];
    stars.forEach((s: any) => {
      if (!allStars.find(x => x.name === s.name)) {
        allStars.push({ name: s.name, type: s.type, brightness: s.brightness });
      }
    });
  });

  return (
    <section className="space-y-6">
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{name ? `${name} · ` : ''}紫微斗数命盘</p>
        <p className="text-base font-bold text-purple-400 font-serif">紫微斗数 · 十二宫</p>
      </div>

      {/* 12 Palaces */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-purple-300 font-serif mb-3 text-center">十二宫一览</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {palaces.map((p: any, i: number) => {
            const stars = [...(p?.majorStars || []), ...(p?.minorStars || [])];
            return (
              <div key={i} className="bg-dark-700/50 border border-dark-600 rounded-lg p-2.5">
                <p className="text-[10px] text-purple-400 font-bold mb-1">{p.name || `宫${i+1}`}{p.isBodyPalace ? ' 🏠' : ''}{p.isOriginalPalace ? ' 📍' : ''}</p>
                <div className="space-y-0.5">
                  {stars.slice(0, 4).map((s: any, j: number) => {
                    const b = BRIGHTNESS[s.brightness || ''];
                    return (
                      <div key={j} className="flex items-center justify-between text-[10px]">
                        <span className={s.type === 'major' ? 'text-purple-300 font-medium' : 'text-gray-400'}>
                          {s.name}
                        </span>
                        {b && <span className={b.color}>{b.label}</span>}
                      </div>
                    );
                  })}
                  {stars.length > 4 && <p className="text-[9px] text-gray-600">+{stars.length - 4} 星...</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Stars with brightness */}
      {allStars.length > 0 && (
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-purple-300 font-serif mb-3 text-center">主星亮度与吉凶</h3>
          <div className="space-y-1.5">
            {allStars.map((s, i) => {
              const b = BRIGHTNESS[s.brightness] || { label: '—', color: 'text-gray-500' };
              const isGood = ['庙','旺','得'].includes(s.brightness);
              const isBad = ['陷','不'].includes(s.brightness);
              return (
                <div key={i} className={`flex items-center justify-between text-xs p-1.5 rounded ${isGood ? 'bg-green-900/10' : isBad ? 'bg-red-900/10' : 'bg-dark-700/30'}`}>
                  <span className={s.type === 'major' ? 'text-purple-300 font-medium' : 'text-gray-400'}>
                    {s.type === 'major' ? '⭐' : '·'} {s.name}
                  </span>
                  <span className={`${b.color} ${isBad ? 'text-red-400' : ''}`}>
                    {b.label} {isGood ? '（吉）' : isBad ? '（凶）' : '（平）'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
