'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useT, useLocale } from '@/lib/i18n';
import { computeBaziChart, type BaziChartResult, getPillarShenShaLabel } from '@/lib/bazi-engine';
import { BRIGHTNESS, STAR_DESC, detectPatterns, type PatternDef } from '@/lib/ziwei-data';
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
const WU_XING_COLORS: Record<string,string> = {'金':'text-gold-500','木':'text-gold-500','水':'text-gold-500','火':'text-gold-500','土':'text-gold-500'};
const PILLAR_LABELS = ['年柱','月柱','日柱','时柱'];

export default function AppClient() {
  const getT = useT();
  useLocale();
  const [activeModule, setActiveModule] = useState('bazi');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('6');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('男');
  const [paramsRead, setParamsRead] = useState(false);

  // 从URL读取参数(首页快速排盘跳过来时预填)
  useEffect(() => {
    if (typeof window === 'undefined' || paramsRead) return;
    const sp = new URLSearchParams(window.location.search);
    const d = sp.get('date');
    const h = sp.get('hour');
    const ct = sp.get('calendar');
    const g = sp.get('gender');
    if (d) {
      const parts = d.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
    if (h) setHour(h);
    if (ct === 'lunar') setCalendarType('lunar');
    if (g === '男' || g === '女') setGender(g);
    setParamsRead(true);
  }, [paramsRead])

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ziweiResult, setZiweiResult] = useState<any>(null);

  const y = parseInt(year) || 1990;
  const m = parseInt(month) || 1;
  const d = parseInt(day) || 1;
  const hzIndex = parseInt(hour) || 6;
  // CalendarInput 的 hour 值用的是地支索引 (0=子,6=午,11=亥), 需转成实际小时数
  const h = (hzIndex * 2 + 23) % 24;

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
        } catch(e: unknown) { console.error(e); setErrorMsg('排盘失败: ' + ((e as {message?: string})?.message || '未知错误')); }
      } else {
        try {
          const finalHour = Math.round(resolvedHour) % 24;
          let lunar: Lunar;
          if (calendarType === 'solar') lunar = Solar.fromYmdHms(y, m, d, finalHour, 0, 0).getLunar();
          else lunar = Lunar.fromYmdHms(y, isLeapMonth ? -m : m, d, finalHour, 0, 0);
          if (!lunar) throw new Error('日期超出八字计算范围');
          const tg = [lunar.getYearGan(), lunar.getMonthGan(), lunar.getDayGan(), lunar.getTimeGan()];
          const dz = [lunar.getYearZhi(), lunar.getMonthZhi(), lunar.getDayZhi(), lunar.getTimeZhi()];
          const result = computeBaziChart({ tg, dz, birthYear: y, gender });
          setBaziResult(result);
          setAnalyzed(true);
        } catch(e: unknown) { console.error(e); setErrorMsg('八字排盘失败: ' + ((e as {message?: string})?.message || '未知错误')); }
      }
    } else {
      try {
        const iztro = await import('iztro');
        const { astro } = iztro;
        const finalHour = Math.round(resolvedHour) % 24;
        let solar: Solar;
        if (calendarType === 'solar') solar = Solar.fromYmdHms(y, m, d, finalHour, 0, 0);
        else solar = Lunar.fromYmdHms(y, isLeapMonth ? -m : m, d, finalHour, 0, 0).getSolar();
        if (!solar) throw new Error('日期超出紫微计算范围');
        const dateStr = `${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`;
        const astroData = astro.bySolar(dateStr, finalHour, gender as 'male' | 'female');
        setZiweiResult(astroData);
        setAnalyzed(true);
      } catch(e: unknown) { console.error(e); setErrorMsg('紫微排盘失败: ' + ((e as {message?: string})?.message || '未知错误，请检查日期或尝试其他模式')); }
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gold-600 font-serif mb-2">{getT('appPage.title')}</h1>
        <p className="text-base sm:text-lg text-gray-400">{getT('appPage.desc')}</p>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {modules.map(mod => (
          <button key={mod.id} onClick={() => { setActiveModule(mod.id); setAnalyzed(false); }}
            className={`px-5 min-h-[44px] py-3 rounded-xl text-sm font-medium transition-all ${
              activeModule === mod.id ? 'bg-gold-500 text-dark-900 shadow-lg shadow-gold-400/30 scale-105'
                : 'bg-dark-800 text-gray-400 hover:text-gold-500 border border-dark-600'}`}>
            <span className="text-xl mr-1.5">{mod.emoji}</span>{mod.id === 'bazi' ? getT('appPage.moduleBazi') : getT('appPage.moduleZiwei')}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-8 max-w-lg mx-auto shadow-sm">
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">{getT('appPage.nameLabel')}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={getT('appPage.namePlaceholder')}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 min-h-[44px] text-gray-200 text-sm" />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">{getT('appPage.genderLabel')}</label>
          <div className="flex gap-2">
            {['男','女'].map(g => (
              <button key={g} onClick={() => setGender(g)}
                className={`flex-1 min-h-[44px] py-2 rounded-lg text-sm font-medium transition-colors ${gender === g ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>{g === '男' ? getT('appPage.male') : getT('appPage.female')}</button>
            ))}
          </div>
        </div>

        {/* Input Mode Toggle (Bazi only) */}
        {activeModule === 'bazi' && (
          <div className="btn-group mb-4">
            <button onClick={() => setInputMode('date')}
              className={`flex-1 min-h-[44px] py-2 rounded-lg text-sm font-medium transition-colors ${inputMode === 'date' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
              📅 公历/农历排盘
            </button>
            <button onClick={() => setInputMode('bazi')}
              className={`flex-1 min-h-[44px] py-2 rounded-lg text-sm font-medium transition-colors ${inputMode === 'bazi' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
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
                {trueSolarOn && <p className="text-xs text-gold-600/70 mt-1">⏱ 校正后时辰：{resolvedHour.toFixed(1)}时</p>}
              </div>
            )}
          </div>
        )}

        {/* Direct Bazi input */}
        {inputMode === 'bazi' && activeModule === 'bazi' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">请直接输入四柱天干地支（阳干配阳支，阴干配阴支）：</p>
            {PILLAR_LABELS.map((label, i) => {
              const selTg = bzTg[i];
              const filteredDz = selTg === '' ? T_ZHI : YANG_GAN.includes(selTg) ? YANG_ZHI : YIN_ZHI;
              return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-10">{label}</span>
                <select value={bzTg[i]} onChange={e => {
                  const a = [...bzTg]; a[i] = e.target.value; const b = [...bzDz];
                  const newDz = e.target.value === '' ? T_ZHI : YANG_GAN.includes(e.target.value) ? YANG_ZHI : YIN_ZHI;
                  if (b[i] && !newDz.includes(b[i])) b[i] = '';
                  setBzTg(a); setBzDz(b);
                }} className="flex-1 min-h-[44px] bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-200 text-sm">
                  <option value="">天干</option>
                  {T_GAN.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={bzDz[i]} onChange={e => { const a = [...bzDz]; a[i] = e.target.value; setBzDz(a); }}
                  className="flex-1 min-h-[44px] bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-200 text-sm">
                  <option value="">地支</option>
                  {filteredDz.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <span className="text-xs text-gray-600 w-8 text-center">{bzTg[i]}{bzDz[i]}</span>
              </div>
            )})}
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生年份 · {bzTg[0]}{bzDz[0]}年</label>
              {validYears.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {validYears.map(y => (
                    <button key={y} type="button" onClick={() => setBzYear(String(y))}
                      className={`px-3 min-h-[44px] py-1.5 rounded-lg text-sm border transition-colors ${bzYear === String(y) ? 'bg-gold-600 text-dark-900 font-semibold border-gold-500' : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500/50'}`}>{y}</button>
                  ))}
                </div>
              ) : bzTg[0] && bzDz[0] ? (
                <p className="text-sm text-gold-600">{getT('appPage.yearPillarInvalid')}</p>
              ) : <p className="text-sm text-gray-600">请先选择年柱天干地支</p>}
              {validYears.length > 0 && <p className="text-sm text-gray-600 mt-1">同八字每60年一轮回</p>}
            </div>
          </div>
        )}

        {validationMsg && <p className="text-xs text-gold-600 mt-3">{validationMsg}</p>}
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-10">
        <button onClick={handleAnalyze} disabled={!isValid || isAnalyzing}
          className={`px-10 min-h-[52px] py-3.5 rounded-full text-base font-bold shadow-lg transition-all ${
            isValid && !isAnalyzing ? 'bg-gradient-to-r from-gold-500 to-gold-500 text-dark-900 hover:shadow-xl hover:scale-105 active:scale-95' : 'bg-dark-700 text-gray-500 cursor-not-allowed'}`}>
          {isAnalyzing ? <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full" />{getT('appPage.analyzing')}</span> : getT('appPage.analyzeButton')}
        </button>
        {!analyzed && !isAnalyzing && <p className="text-sm text-gray-500 mt-2">{getT('appPage.analyzeHint')}</p>}
      </div>

      {/* Error Message — 增强样式 */}
      {errorMsg && (
        <div className="max-w-lg mx-auto mb-8 bg-gold-500/10 border-2 border-gold-500/60 rounded-xl p-4 text-center toast-enter">
          <p className="text-gold-600 text-sm font-semibold">{getT('appPage.errorMsg')} {errorMsg}</p>
          <p className="text-xs text-gold-600/80 mt-1">请检查输入信息或尝试其他排盘模式</p>
          <button
            onClick={() => setErrorMsg('')}
            className="mt-2 px-3 py-1 text-xs text-gold-600/60 hover:text-gold-600 underline"
          >
            {getT('appPage.closeLabel')}
          </button>
        </div>
      )}

      {/* 分析加载骨架屏 */}
      {isAnalyzing && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
          <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-6">
            <div className="skeleton skeleton-title mx-auto"></div>
            <div className="skeleton skeleton-text mx-auto" style={{width:'60%'}}></div>
          </div>
          <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5">
            <div className="skeleton skeleton-title"></div>
            <div className="grid grid-cols-5 gap-3 mb-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton skeleton-block" style={{height:'60px'}}></div>
              ))}
            </div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text-short"></div>
          </div>
          <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text-short"></div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gold-400/70 animate-pulse">{getT('appPage.aiGenerating')}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {analyzed && !isAnalyzing && baziResult && <BaziResultView result={baziResult} name={name} />}
      {analyzed && !isAnalyzing && ziweiResult && <ZiweiResultView data={ziweiResult} name={name} />}

      {/* VIP 功能 — 目前为 UI 占位，待接入真实支付系统后启用 */}
      {analyzed && (
        <div className="mt-12 bg-gradient-to-r from-gold-500/5 to-gold-500/5 border border-gold-500/25 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">🚧</div>
          <h3 className="text-lg font-bold text-gold-600 mb-1">{getT('appPage.vipTitle')}</h3>
          <p className="text-sm text-gold-600 mb-4">{getT('appPage.vipDesc')}</p>
          <div className="inline-block px-6 py-2.5 bg-gold-500/10 text-gold-500 rounded-full text-sm font-medium border border-gold-500/25">
            {getT('appPage.vipComingSoon')}
          </div>
          <p className="text-xs text-gold-500 mt-3">{getT('appPage.vipNote')}</p>
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
                <div className={`h-full rounded-full ${k==='金'?'bg-gold-500/50':k==='木'?'bg-gold-500/50':k==='水'?'bg-gold-500/50':k==='火'?'bg-gold-500/50':'bg-gold-500/50'}`}
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
                s.type==='吉'?'bg-gold-500/10 border border-gold-500/30':
                s.type==='凶'?'bg-gold-500/10 border border-gold-500/30':
                'bg-dark-700/50 border border-dark-600'}`}>
                <span className={
                  s.type==='吉'?'text-gold-600':s.type==='凶'?'text-gold-600':'text-gray-300'
                }>{s.type==='吉'?'🟢':s.type==='凶'?'🔴':'⚪'} {s.name}</span>
                {s.meaning && <span className="text-gray-400 ml-1">— {s.meaning}</span>}
                {s.resolve && <span className="text-gold-500/80 ml-1">💡 {s.resolve}</span>}
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
// BRIGHTNESS imported from @/lib/ziwei-data

function ZiweiResultView({ data, name }: { data: Record<string, unknown>; name: string }) {
      interface StarInfoForDisplay { name: string; type?: string; brightness?: string }
  interface PalaceInfo {
    name: string;
    majorStars: StarInfoForDisplay[];
    minorStars: StarInfoForDisplay[];
    adjectiveStars: StarInfoForDisplay[];
    earthlyBranch: string;
    heavenlyStem?: string;
    isBodyPalace?: boolean;
    isOriginalPalace?: boolean;
  }
  const palaces: PalaceInfo[] = Array.isArray((data as Record<string, unknown>).palaces)
    ? ((data as Record<string, unknown>).palaces as Record<string, unknown>[]).map(p => ({
        name: String(p.name || ''),
        majorStars: (p.majorStars as StarInfoForDisplay[]) || [],
        minorStars: (p.minorStars as StarInfoForDisplay[]) || [],
        adjectiveStars: (p.adjectiveStars as StarInfoForDisplay[]) || [],
        earthlyBranch: String(p.earthlyBranch || ''),
        heavenlyStem: String(p.heavenlyStem || ''),
        isBodyPalace: Boolean(p.isBodyPalace),
        isOriginalPalace: Boolean(p.isOriginalPalace),
      }))
    : [];
  const soulPalace = palaces.find(p => p.name === '命宫');
  const bodyBranch = (data as Record<string, string>).earthlyBranchOfBodyPalace;

  interface StarItem { name: string; type?: string; brightness?: string }
  const allStars: StarItem[] = [];
  palaces.forEach(p => {
    const pAny = p as { majorStars?: StarItem[]; minorStars?: StarItem[]; adjectiveStars?: StarItem[] };
    [...(pAny.majorStars || []), ...(pAny.minorStars || []), ...(pAny.adjectiveStars || [])].forEach(s => {
      if (!allStars.find(x => x.name === s.name)) allStars.push(s);
    });
  });
  allStars.sort((a, b) => {
    if (a.type === 'major' && b.type !== 'major') return -1;
    if (a.type !== 'major' && b.type === 'major') return 1;
    return (BRIGHTNESS[b.brightness || '']?.level || 0) - (BRIGHTNESS[a.brightness || '']?.level || 0);
  });

  const patterns = detectPatterns(palaces);
  const soulStars = ((soulPalace as { majorStars?: StarItem[] } | undefined)?.majorStars || []).map(s => s.name);

  return (
    <section className="space-y-6">
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{name ? `${name} · ` : ''}紫微斗数命盘{bodyBranch && <> · 身宮：{soulPalace?.earthlyBranch}（{soulPalace?.name}）</>}</p>
        <p className="text-base font-bold text-gold-600 font-serif">命宮：<span className="text-gold-400">{soulStars.join('、') || '無主星'}</span> {soulPalace?.heavenlyStem}{soulPalace?.earthlyBranch}</p>
      </div>

      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-600 font-serif mb-3 text-center">主星亮度</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {allStars.map((s: StarItem, i: number) => {
            const b = BRIGHTNESS[s.brightness || ''] || { label: '—', color: 'text-gray-500' };
            return (
              <div key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${s.type==='major'?'bg-gold-500/10 border-gold-500/40':'bg-dark-700/50 border-dark-600'}`}>
                <span className={s.type==='major'?'text-gold-600 font-medium':'text-gray-400'}>{s.type==='major'?'⭐':'·'} {s.name}</span>
                <span className={`${b.color} text-[10px] font-medium`}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-600 font-serif mb-3 text-center">格局分析</h3>
        {patterns.length > 0 ? (
          <div className="space-y-2">
            {patterns.map((p: PatternDef, i: number) => (
              <div key={i} className={`p-3 rounded-lg border text-xs ${p.rating==='上'?'bg-gold-500/10 border-gold-500/30':p.rating==='中上'?'bg-gold-500/10 border-gold-500/30':'bg-dark-700/50 border-dark-600'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={p.rating==='上'?'text-gold-600':p.rating==='中上'?'text-gold-600':'text-gold-500'}>{p.rating==='上'?'🏆':p.rating==='中上'?'💎':'✨'} {p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.rating==='上'?'bg-gold-500/10 text-gold-600':p.rating==='中上'?'bg-gold-500/10 text-gold-600':'bg-gold-500/10 text-gold-500'}`}>{p.rating}</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-600 text-center">未檢測到特殊格局，命盤平穩。</p>}
      </div>

      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-600 font-serif mb-3 text-center">本命——命宮之各星說明</h3>
        {soulStars.length > 0 ? (
          <div className="space-y-3">
            {soulStars.map((starName: string) => {
              const desc = STAR_DESC[starName];
              if (!desc) return null;
              return (
                <div key={starName} className="bg-dark-700/50 border border-dark-600 rounded-lg p-3">
                  <p className="text-sm font-medium text-gold-600 mb-1">⭐ {starName}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-gray-500">命宮無主星</p>
            <p className="text-[10px] text-gray-600 mt-1">命宮無主星時，借對宮（遷移宮）主星為用。</p>
          </div>
        )}
      </div>

      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gold-600 font-serif mb-3 text-center">十二宮一覽</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {palaces.map((p: PalaceInfo, i: number) => {
            const stars = [...p.majorStars, ...p.minorStars];
            return (
              <div key={i} className="bg-dark-700/50 border border-dark-600 rounded-lg p-2.5">
                <p className="text-[10px] text-gold-600 font-bold mb-1">{p.name}{p.isBodyPalace?' 🏠':''}{p.isOriginalPalace?' 📍':''}</p>
                <div className="space-y-0.5">
                  {stars.slice(0,4).map((s: StarItem, j: number)=>{const b=BRIGHTNESS[s.brightness||''];return(<div key={j} className="flex items-center justify-between text-[10px]"><span className={s.type==='major'?'text-gold-600 font-medium':'text-gray-400'}>{s.name}</span>{b&&<span className={b.color}>{b.label}</span>}</div>)})}
                  {stars.length>4&&<p className="text-[9px] text-gray-600">+{stars.length-4}星...</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
