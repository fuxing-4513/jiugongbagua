const fs = require('fs');
let c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx', 'utf8');

// 替换：出生年份输入框 → 自动匹配年份按钮列表
const oldUI = `        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(' ')}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-dark-600">
          <label className="block text-xs text-gray-500 mb-1">出生年份 <span className="text-gray-600">（用于推算大运流年）</span></label>
          <input type="number" value={bzYear} onChange={e=>setBzYear(e.target.value)} className="w-full sm:w-36 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" placeholder="如 1990" min="1900" max="2100" />
        </div>`;

// 找到匹配
const oldIdx = c.indexOf(oldUI);
if (oldIdx === -1) {
  console.log('ERROR: old UI not found');
  // Try with \r\n
  const oldUI2 = oldUI.split('\n').join('\r\n');
  const idx2 = c.indexOf(oldUI2);
  if (idx2 >= 0) console.log('Found with CRLF at', idx2);
  process.exit(1);
}

const newUI = `        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-gold-400/60">完整八字：{bzTg.map((g,i)=>g+bzDz[i]).join(' ')}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-dark-600">
          <label className="block text-xs text-gray-500 mb-1">出生年份 <span className="text-gray-600">（确定大运流年起算）</span></label>
          <div className="flex flex-wrap gap-2">
            {(()=>{const t=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(bzTg[0]);const d=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(bzDz[0]);if(t<0||d<0)return null;const ys=[];for(let y=1900;y<=2100;y++){if(((y-4)%10+10)%10===t&&((y-4)%12+12)%12===d)ys.push(y)};return ys.map(y=><button key={y} onClick={()=>setBzYear(String(y))} className={\`px-3 py-1.5 rounded text-xs border transition-colors \${bzYear===String(y)?'bg-gold-600 text-dark-900 font-semibold border-gold-500':'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500/50'}\`}>{y}</button>)})()}
          </div>
          <p className="text-xs text-gray-600 mt-1.5">同一个八字每60年出现一次，请选择对应的出生年份</p>
        </div>`;

c = c.replace(oldUI, newUI);

// 现在更新 doCalc 分支：去掉年份验证（按钮保证有效）
const baziBranchStart = "if (mode === 'bazi') {";
const sIdx = c.indexOf(baziBranchStart);
if (sIdx === -1) {
  console.log('ERROR: bazi branch not found');
  process.exit(1);
}

// 去掉年份验证行（包含 isNaN 那几行）
const oldValidate = `        const birthYear = parseInt(bzYear)
        if (isNaN(birthYear) || birthYear < 1900 || birthYear > 2100) {
          setError('请输入有效出生年份（1900-2100）')
          return
        }
        `;

// 检查是否存在
if (c.includes(oldValidate)) {
  c = c.replace(oldValidate, `        const birthYear = parseInt(bzYear)
        `);
  console.log('Validation removed');
} else {
  console.log('WARN: old validation text not found');
}

fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx', c, 'utf8');
console.log('DONE');
