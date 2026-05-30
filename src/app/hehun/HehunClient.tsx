'use client'
import { useState } from 'react'
import { Solar, Lunar } from 'lunar-typescript'

const SHENGXIAO: Record<string,{liuhe:string;sanhe:string[];chong:string;hai:string}>={鼠:{liuhe:'牛',sanhe:['猴','龙'],chong:'马',hai:'羊'},牛:{liuhe:'鼠',sanhe:['蛇','鸡'],chong:'羊',hai:'马'},虎:{liuhe:'猪',sanhe:['马','狗'],chong:'猴',hai:'蛇'},兔:{liuhe:'狗',sanhe:['猪','羊'],chong:'鸡',hai:'龙'},龙:{liuhe:'鸡',sanhe:['鼠','猴'],chong:'狗',hai:'兔'},蛇:{liuhe:'猴',sanhe:['牛','鸡'],chong:'猪',hai:'虎'},马:{liuhe:'羊',sanhe:['虎','狗'],chong:'鼠',hai:'牛'},羊:{liuhe:'马',sanhe:['猪','兔'],chong:'牛',hai:'鼠'},猴:{liuhe:'蛇',sanhe:['鼠','龙'],chong:'虎',hai:'猪'},鸡:{liuhe:'龙',sanhe:['牛','蛇'],chong:'兔',hai:'狗'},狗:{liuhe:'兔',sanhe:['虎','马'],chong:'龙',hai:'鸡'},猪:{liuhe:'虎',sanhe:['兔','羊'],chong:'蛇',hai:'猴'}}
const SX=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
const TG:Record<string,string>={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'}
const DZ:Record<string,string>={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const HOUR_DZ:Record<number,string>={0:'子',1:'丑',2:'丑',3:'寅',4:'寅',5:'卯',6:'卯',7:'辰',8:'辰',9:'巳',10:'巳',11:'午',12:'午',13:'未',14:'未',15:'申',16:'申',17:'酉',18:'酉',19:'戌',20:'戌',21:'亥',22:'亥',23:'子'}
const WS:Record<string,string>={木:'火',火:'土',土:'金',金:'水',水:'木'}
const WK:Record<string,string>={木:'土',土:'水',水:'火',火:'金',金:'木'}
const WC:Record<string,string>={木:'text-green-400',火:'text-red-400',土:'text-yellow-400',金:'text-gray-300',水:'text-blue-400'}
const WXB:Record<string,string>={木:'bg-green-400/10 border-green-500/30',火:'bg-red-400/10 border-red-500/30',土:'bg-yellow-400/10 border-yellow-500/30',金:'bg-gray-400/10 border-gray-500/30',水:'bg-blue-400/10 border-blue-500/30'}
const NY:Record<string,string>={甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
const SH:Record<string,string[]>={申:['子','辰'],子:['申','辰'],辰:['子','申'],亥:['卯','未'],卯:['亥','未'],未:['卯','亥'],寅:['午','戌'],午:['寅','戌'],戌:['寅','午'],巳:['酉','丑'],酉:['巳','丑'],丑:['巳','酉']}
const LH:Record<string,string>={子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅'}
const CH:Record<string,string>={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'}

function getAnimal(y:number):string{return SX[(y-4)%12]}
function calcAnimalScore(a1:string,a2:string):number{if(!SHENGXIAO[a1])return 50;if(SHENGXIAO[a1].liuhe===a2)return 90;if(SHENGXIAO[a1].sanhe.includes(a2))return 75;if(SHENGXIAO[a1].chong===a2)return 30;if(SHENGXIAO[a1].hai===a2)return 40;return 50}
function calcBazi(yr:number,mo:number,da:number,hd:string):string[][]{try{const l=Lunar.fromYmd(yr,mo,da);const y=l.getYearInGanZhi(),m=l.getMonthInGanZhi(),d=l.getDayInGanZhi(),h=l.getTimeInGanZhi();return[[y.charAt(0),y.charAt(1),NY[y]||''],[m.charAt(0),m.charAt(1),''],[d.charAt(0),d.charAt(1),''],[h.charAt(0),h.charAt(1),'']]}catch{return[['甲','子','海中金'],['甲','子',''],['甲','子',''],['甲','子','']]}}
function analyzeWx(gz:string[][]){const wc:Record<string,number>={木:0,火:0,土:0,金:0,水:0};for(const p of gz){for(let i=0;i<2;i++){const wx=TG[p[i]]||DZ[p[i]]||'';if(wx in wc)wc[wx]++}}const riG=gz[2][0],riW=TG[riG]||'';const self=wc[riW]||0;const st=self>=3?'身强':self<=1?'身弱':'中和';let ys='';if(st==='身强')ys=WK[riW]||'';else if(st==='身弱')ys=WS[riW]||'';else{let m=99;for(const[k,v]of Object.entries(wc)){if(v<m){m=v;ys=k}}}return{wc,riZhu:riG,riWx:riW,st,ys}}
function calcWxScore(m:any,w:any):number{if(WS[m.ys]===w.ys||WS[w.ys]===m.ys)return 85;if(m.ys===w.ys)return 70;if(WK[m.ys]===w.ys||WK[w.ys]===m.ys)return 35;return 55}
function calcNyScore(my:string,wy:string):number{if(!my||!wy)return 50;const mx=my.slice(-1),wx2=wy.slice(-1);if(WS[mx]===wx2||WS[wx2]===mx)return 80;if(mx===wx2)return 60;if(WK[mx]===wx2||WK[wx2]===mx)return 35;return 50}
function calcRZScore(mDz:string,wDz:string):number{if(LH[mDz]===wDz)return 95;if((SH[mDz]||[]).includes(wDz))return 80;if(mDz===wDz)return 50;if(CH[mDz]===wDz)return 25;return 50}

interface F{name:string;cal:'solar'|'lunar';year:string;month:string;day:string;hour:string}

export default function HehunClient(){
  const[m,setM]=useState<F>({name:'',cal:'solar',year:'1990',month:'1',day:'1',hour:'0'})
  const[w,setW]=useState<F>({name:'',cal:'solar',year:'1992',month:'1',day:'1',hour:'0'})
  const[res,setRes]=useState<any>(null)
  const[err,setErr]=useState('')

  const switchCal=(g:'m'|'w',nc:'solar'|'lunar')=>{
    const p=g==='m'?m:w,sp=g==='m'?setM:setW
    const y=+p.year,mm=+p.month,d=+p.day
    if(!isNaN(y)&&!isNaN(mm)&&!isNaN(d)){
      try{if(nc==='solar'&&p.cal==='lunar'){const s=Lunar.fromYmd(y,mm,d).getSolar();sp({...p,cal:nc,year:s.getYear()+'',month:s.getMonth()+'',day:s.getDay()+''})}
      else if(nc==='lunar'&&p.cal==='solar'){const l=Solar.fromYmd(y,mm,d).getLunar();sp({...p,cal:nc,year:l.getYear()+'',month:l.getMonth()+'',day:l.getDay()+''})}
      else sp({...p,cal:nc})}catch{sp({...p,cal:nc})}
    }else sp({...p,cal:nc})
  }

  const doCalc=()=>{
    setErr('')
    const my=+m.year,mm=+m.month,md=+m.day,mh=+m.hour,wy=+w.year,wm=+w.month,wd=+w.day,wh=+w.hour
    if(isNaN(my)||isNaN(mm)||isNaN(md)||isNaN(wy)||isNaN(wm)||isNaN(wd)){setErr('请完善双方出生信息');return}
    try{
      const mDz=HOUR_DZ[mh]||'子',wDz=HOUR_DZ[wh]||'子'
      const mL=m.cal==='solar'?Solar.fromYmd(my,mm,md).getLunar():Lunar.fromYmd(my,mm,md)
      const wL=w.cal==='solar'?Solar.fromYmd(wy,wm,wd).getLunar():Lunar.fromYmd(wy,wm,wd)
      const mGZ=calcBazi(mL.getYear(),mL.getMonth(),mL.getDay(),mDz)
      const wGZ=calcBazi(wL.getYear(),wL.getMonth(),wL.getDay(),wDz)
      const mA=getAnimal(mL.getYear()),wA=getAnimal(wL.getYear())
      const mAna=analyzeWx(mGZ),wAna=analyzeWx(wGZ)
      const aS=calcAnimalScore(mA,wA),wS=calcWxScore(mAna,wAna)
      const nS=calcNyScore(mGZ[0][2],wGZ[0][2]),rS=calcRZScore(mGZ[2][1],wGZ[2][1])
      const total=Math.round(aS*0.2+wS*0.3+nS*0.2+rS*0.3)
      const conclusion=total>=75?'上等婚':total>=50?'中等婚':'下等婚'
      setRes({m:{name:m.name||'男方',gz:mGZ,ana:mAna,animal:mA},w:{name:w.name||'女方',gz:wGZ,ana:wAna,animal:wA},aS,wS,nS,rS,total,conclusion,tips:total>=85?'天生一对，阴阳和合，大吉之配💑':total>=60?'五行较相配，需注意沟通与包容':'命理组合一般，需多加经营与磨合'})
    }catch{setErr('排盘出错，请检查日期')}
  }

  const cy=new Date().getFullYear()
  const conC:Record<string,string>={上等婚:'text-green-400 bg-green-400/10 border-green-500',中等婚:'text-yellow-400 bg-yellow-400/10 border-yellow-500',下等婚:'text-red-400 bg-red-400/10 border-red-500'}
  const sC=(s:number)=>s>=70?'text-green-400':s>=50?'text-yellow-400':'text-red-400'
  const HO=[{v:'0',l:'子'},{v:'1',l:'丑'},{v:'3',l:'寅'},{v:'5',l:'卯'},{v:'7',l:'辰'},{v:'9',l:'巳'},{v:'11',l:'午'},{v:'13',l:'未'},{v:'15',l:'申'},{v:'17',l:'酉'},{v:'19',l:'戌'},{v:'21',l:'亥'}]

  return(<div className="max-w-5xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif text-center mb-1">💑 合婚测算</h1>
    <p className="text-gray-500 text-sm text-center mb-8">八字合婚·生肖五行·年命纳音综合匹配</p>
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[{l:'男方',p:m,sp:setM,c:'blue'},{l:'女方',p:w,sp:setW,c:'pink'}].map(s=>(
          <div key={s.l}>
            <h3 className={'text-sm font-semibold text-'+s.c+'-400 mb-3'}>{s.l==='男方'?'👨':'👩'} {s.l}</h3>
            <input value={s.p.name} onChange={e=>s.sp({...s.p,name:e.target.value})} placeholder={s.l+'姓名'} maxLength={10} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm mb-3 focus:outline-none focus:border-gold-500"/>
            <div className="flex gap-2 mb-3">{(['solar','lunar'] as const).map(c=><button key={c} onClick={()=>switchCal(s.l==='男方'?'m':'w',c)} className={'px-3 py-1 text-xs rounded-lg '+(s.p.cal===c?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600')}>{c==='solar'?'阳历':'阴历'}</button>)}</div>
            <div className="grid grid-cols-4 gap-2">
              <div><label className="block text-[10px] text-gray-500 mb-1">年</label><select value={s.p.year} onChange={e=>s.sp({...s.p,year:e.target.value})} className="w-full px-1 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500">{Array.from({length:121},(_,i)=>cy-60+i).map(y=><option key={y}>{y}</option>)}</select></div>
              <div><label className="block text-[10px] text-gray-500 mb-1">月</label><select value={s.p.month} onChange={e=>s.sp({...s.p,month:e.target.value})} className="w-full px-1 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500">{Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}</select></div>
              <div><label className="block text-[10px] text-gray-500 mb-1">日</label><select value={s.p.day} onChange={e=>s.sp({...s.p,day:e.target.value})} className="w-full px-1 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500">{Array.from({length:31},(_,i)=><option key={i+1}>{i+1}</option>)}</select></div>
              <div><label className="block text-[10px] text-gray-500 mb-1">时</label><select value={s.p.hour} onChange={e=>s.sp({...s.p,hour:e.target.value})} className="w-full px-1 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500">{HO.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-5"><button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-8 py-2.5 rounded-lg transition-colors active:scale-95 text-sm">开始合婚</button></div>
      {err&&<p className="text-xs text-red-400 text-center mt-2">{err}</p>}
    </div>
    {res&&(<>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[res.m,res.w].map((p:any,i:number)=>(
          <div key={i} className={'bg-dark-800/80 backdrop-blur rounded-xl border '+(i===0?'border-blue-500/20':'border-pink-500/20')+' p-4'}>
            <h3 className={'text-xs font-semibold mb-2 '+(i===0?'text-blue-400':'text-pink-400')}>{i===0?'👨':'👩'} {p.name}</h3>
            <div className="overflow-x-auto mb-2"><table className="w-full text-[10px] border-collapse"><thead><tr className="bg-dark-700"><th className="p-1 border border-dark-600 text-gray-500 w-12"></th>{['年','月','日','时'].map(l=><th key={l} className="p-1 border border-dark-600 text-gold-400">{l}柱</th>)}</tr></thead><tbody>
              <tr><td className="p-1 border border-dark-600 text-gray-500 bg-dark-700 text-[9px]">天干</td>{p.gz.map((col:any[],j:number)=><td key={j} className="p-1 border border-dark-600 text-center text-gold-400 font-bold text-xs">{col[0]}</td>)}</tr>
              <tr><td className="p-1 border border-dark-600 text-gray-500 bg-dark-700 text-[9px]">地支</td>{p.gz.map((col:any[],j:number)=><td key={j} className="p-1 border border-dark-600 text-center text-amber-400 font-bold text-xs">{col[1]}</td>)}</tr>
              <tr><td className="p-1 border border-dark-600 text-gray-500 bg-dark-700 text-[9px]">纳音</td>{p.gz.map((col:any[],j:number)=><td key={j} className="p-1 border border-dark-600 text-center text-gray-400">{col[2]||'-'}</td>)}</tr>
            </tbody></table></div>
            <div className="flex flex-wrap gap-1 mb-1">{Object.entries(p.ana.wc).map(([wx,cnt]:any)=><span key={wx} className={'text-[9px] px-1.5 py-0.5 rounded border '+(WXB[wx]||'bg-dark-700 border-dark-600')+' '+(WC[wx]||'text-gray-400')}>{wx}:{cnt}</span>)}</div>
            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <div className="bg-dark-700 rounded p-1.5"><span className="text-gray-500">日主</span><span className="text-gray-200"> {p.ana.riZhu}({p.ana.riWx})</span></div>
              <div className="bg-dark-700 rounded p-1.5"><span className="text-gray-500">强弱</span><span className={p.ana.st==='身强'?'text-red-300':'text-blue-300'}> {p.ana.st}</span></div>
              <div className="bg-dark-700 rounded p-1.5"><span className="text-gray-500">用神</span><span className={'font-semibold '+(WC[p.ana.ys]||'text-gold-400')}> {p.ana.ys}</span></div>
            </div>
            <p className="text-[9px] text-gray-600 mt-1">生肖：{p.animal}</p>
          </div>
        ))}
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/20 p-6 mb-5 text-center">
        <p className="text-xs text-gray-400 mb-2">综合匹配度</p>
        <p className={'text-4xl font-bold font-serif '+sC(res.total)}>{res.total}%</p>
        <div className="mt-2"><span className={'inline-block px-4 py-1 rounded-full text-sm font-semibold border '+(conC[res.conclusion]||'text-gray-400')}>{res.conclusion} 💍</span></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[{l:'生肖合婚',s:res.aS,d:res.m.animal+'×'+res.w.animal,t:res.aS>=70?'六合/三合':res.aS>=50?'无冲无克':'相冲'},{l:'五行互补',s:res.wS,d:res.m.ana.ys+'↔'+res.w.ana.ys,t:res.wS>=70?'互补很好':res.wS>=50?'一般':'冲突'},{l:'年命纳音',s:res.nS,d:res.m.gz[0][2]||'-',t:res.nS>=60?'相配':res.nS>=40?'平平':'相克'},{l:'日支合局',s:res.rS,d:res.m.gz[2][1]+'↔'+res.w.gz[2][1],t:res.rS>=70?'成合局':res.rS>=40?'平淡':'相冲'}].map((d,i)=>(
          <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-3 text-center">
            <p className="text-[10px] text-gray-400">{d.l}</p>
            <p className={'text-xl font-bold '+sC(d.s)}>{d.s}</p>
            <p className={'text-[10px] font-semibold '+sC(d.s)}>{d.t}</p>
            <p className="text-[9px] text-gray-600 mt-0.5">{d.d}</p>
          </div>
        ))}
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 mb-8">
        <h3 className="text-xs font-semibold text-gray-200 mb-2">💡 婚姻建议</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{res.tips}</p>
      </div>
    </>)}
  </div>)
}
