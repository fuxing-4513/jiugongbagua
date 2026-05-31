const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'bazi', 'BaziClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `// ═══════════ 神煞系统 ═══════════
const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'}
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰',寅:'戌',午:'戌',戌:'戌',巳:'丑',酉:'丑',丑:'丑',亥:'未',卯:'未',未:'未'}
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅',亥:'申',卯:'申',未:'申'}
const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅',寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥'}
const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}

function calcShenSha(dg: string, yearZhi: string, monthZhi: string, dayZhi: string): string[] {
  const r: string[] = []; const z = [yearZhi, monthZhi, dayZhi]; const g = [dg]
  const ty = TIANYI[dg] || []; for (const x of z) { if (ty.includes(x)) { r.push(\`天乙贵人（\${x}）\`); break } }
  const wc = WENCHANG[dg]; if (wc && z.includes(wc)) r.push(\`文昌贵人（\${wc}）\`)
  const ym = YIMA[yearZhi]; if (ym && z.slice(1).includes(ym)) r.push(\`驿马（\${ym}）\`)
  const th = TAOHUA[yearZhi]; if (th && z.includes(th)) r.push(\`桃花（\${th}）\`)
  const yr = YANGREN[dg]; if (yr && z.includes(yr)) r.push(\`羊刃（\${yr}）\`)
  const hg = HUAGAI[yearZhi]; if (hg && z.includes(hg)) r.push(\`华盖（\${hg}）\`)
  const js = JIESHA[yearZhi]; if (js && z.includes(js)) r.push(\`劫煞（\${js}）\`)
  const gc = GUCHEN[yearZhi]; if (gc && z.includes(gc)) r.push(\`孤辰（\${gc}）\`)
  const td = TIANDE[monthZhi]; if (td && g.includes(td)) r.push('天德贵人')
  const yd = YUEDE[monthZhi]; if (yd && g.includes(yd)) r.push('月德贵人')
  return r.length > 0 ? r : ['无特殊神煞']
}`;

const newBlock = `// ═══════════ 神煞系统 — 升级版（每柱独立计算） ═══════════
const TIANYI: Record<string,string[]> = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']}
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'}
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰',寅:'戌',午:'戌',戌:'戌',巳:'丑',酉:'丑',丑:'丑',亥:'未',卯:'未',未:'未'}
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅',亥:'申',卯:'申',未:'申'}
const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅',寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥'}
const GUASU: Record<string,string> = {亥:'戌',子:'戌',丑:'戌',寅:'丑',卯:'丑',辰:'丑',巳:'辰',午:'辰',未:'辰',申:'未',酉:'未',戌:'未'}
const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}
const JIANGXING: Record<string,string> = {寅:'子',午:'子',戌:'子',申:'午',子:'午',辰:'午',巳:'酉',酉:'酉',丑:'酉',亥:'卯',卯:'卯',未:'卯'}
const JINYU: Record<string,string> = {甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'}
const TIANCHU: Record<string,string> = {甲:'巳',乙:'午',丙:'巳',丁:'午',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
const FUXING: Record<string,string> = {甲:'子',乙:'丑',丙:'子',丁:'丑',戊:'丑',己:'未',庚:'丑',辛:'未',壬:'丑',癸:'未'}
const TIANSHENG: Record<string,string> = {巳:'乙',酉:'乙',丑:'乙',申:'丁',子:'丁',辰:'丁',亥:'己',卯:'己',未:'己',寅:'辛',午:'辛',戌:'辛'}
const XUETANG: Record<string,string> = {甲:'未',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}

/** 每柱独立神煞 — 返回每柱所带神煞列表 */
interface PillarShenSha { pillarName: string; items: string[] }

function calcPillarShenSha(tg: string[], dz: string[], dayGan: string): PillarShenSha[] {
  const pillarNames = ['年柱','月柱','日柱','时柱']
  return [0,1,2,3].map(i => {
    const g = tg[i], z = dz[i]
    const items: string[] = []
    const ty = TIANYI[dayGan] || []; if (ty.includes(z)) items.push('天乙贵人')
    const wc = WENCHANG[dayGan]; if (wc === z) items.push('文昌')
    const ym = YIMA[dz[0]]; if (ym === z) items.push('驿马')
    const th = TAOHUA[dz[0]]; if (th === z) items.push('桃花')
    const yr = YANGREN[dayGan]; if (yr === z) items.push('羊刃')
    const hg = HUAGAI[dz[0]]; if (hg === z) items.push('华盖')
    const js = JIESHA[dz[0]]; if (js === z) items.push('劫煞')
    const gc = GUCHEN[dz[0]]; if (gc === z) items.push('孤辰')
    const gs = GUASU[dz[0]]; if (gs === z) items.push('寡宿')
    const td = TIANDE[dz[1]]; if (td === g) items.push('天德')
    const yd = YUEDE[dz[1]]; if (yd === g) items.push('月德')
    const jx = JIANGXING[dz[0]]; if (jx === z) items.push('将星')
    const jy = JINYU[dayGan]; if (jy === z) items.push('金舆')
    const tc = TIANCHU[g]; if (tc === z) items.push('天厨')
    const fx = FUXING[dayGan]; if (fx === z) items.push('福星')
    const tians = TIANSHENG[dz[0]]; if (tians && tians === g) items.push('天赦')
    const xt = XUETANG[dayGan]; if (xt === z) items.push('学堂')
    return { pillarName: pillarNames[i], items: items.length > 0 ? items : ['—'] }
  })
}

function getPillarShenShaLabel(items: string[]): string {
  const names: Record<string,string> = {
    '天乙贵人':'✨天乙','文昌':'📖文昌','驿马':'🏇驿马','桃花':'🌸桃花','羊刃':'⚔️羊刃',
    '华盖':'🎭华盖','劫煞':'⚠️劫煞','孤辰':'🌙孤辰','寡宿':'☁️寡宿',
    '天德':'☀️天德','月德':'🌙月德','将星':'⭐将星','金舆':'🚗金舆',
    '天厨':'🍳天厨','福星':'🎁福星','天赦':'🙏天赦','学堂':'📚学堂',
  }
  return items.filter(x => x !== '—').map(x => names[x] || x).join(' ') || '—'
}`;

// Now replace all usages of old calcShenSha with new system in the component logic
if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log('✅ Replaced 神煞 system block');
} else {
  console.log('❌ Could not find old 神煞 block exactly. Trying fuzzy match...');
  // Fuzzy: find the block between // ═══ 神煞 and the next // ═══ section
  const startMarker = '// ═══════════ 神煞系统 ═══════════';
  const endMarker = '// ═══════════ 《穷通宝鉴》调侯 ═══════════';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx >= 0 && endIdx > startIdx) {
    content = content.substring(0, startIdx) + newBlock + '\n' + content.substring(endIdx);
    console.log('✅ Fuzzy replaced 神煞 system block');
  } else {
    console.log('❌ Fuzzy match also failed');
    process.exit(1);
  }
}

// Step 2: Replace the usage of calcShenSha in doCalc function (date mode)
// The result object stores shenSha as aggregate
// Find where calcShenSha is called and change to new approach
// In date mode:
const oldCalcCall = "const shenSha = calcShenSha(dg, yearZhi, monthZhi, dz)";
const newCalcCall = `const pillarShenSha = calcPillarShenSha([ec.getYearGan(),ec.getMonthGan(),dg,ec.getTimeGan()], [ec.getYearZhi(),ec.getMonthZhi(),dz,ec.getTimeZhi()], dg)
      const shenSha = mergeShenSha(pillarShenSha)`;

if (content.includes(oldCalcCall)) {
  content = content.replace(oldCalcCall, newCalcCall);
  console.log('✅ Replaced date mode calcShenSha call');
} else {
  console.log('⚠️ Could not find date mode calcShenSha call');
}

// Step 3: Replace in bazi mode
const oldBaziCalcCall = "const shenSha = calcShenSha(dg, dz[0], dz[1], dz[2])";
const newBaziCalcCall = `const pillarShenSha = calcPillarShenSha(tg, dz, dg);
        const shenSha = mergeShenSha(pillarShenSha)`;

if (content.includes(oldBaziCalcCall)) {
  content = content.replace(oldBaziCalcCall, newBaziCalcCall);
  console.log('✅ Replaced bazi mode calcShenSha call');
} else {
  console.log('⚠️ Could not find bazi mode calcShenSha call');
}

// Step 4: Add pillarShenSha to result objects
// In date mode result:
const oldDateResult = `shenSha,\\n        mingGong`;
const newDateResult = `shenSha,\n        pillarShenSha,\n        mingGong`;
if (content.includes(oldDateResult)) {
  content = content.replace(oldDateResult, newDateResult);
  console.log('✅ Added pillarShenSha to date mode result');
} else {
  // Try replacing at the construction site
  const oldDateResult2 = `shenSha,\n        mingGong:`;   
  if (content.includes(oldDateResult2)) { 
    content = content.replace(oldDateResult2, `shenSha,\n        pillarShenSha,\n        mingGong:`);
    console.log('✅ Added pillarShenSha to date mode result (alt)');
  } else {
    console.log('⚠️ Could not add pillarShenSha to date mode result');
  }
}

// In bazi mode result:
const oldBaziResult = `shenSha,\\n        mingGong: '—'`;
const newBaziResult = `shenSha,\n        pillarShenSha,\n        mingGong: '—'`;
if (content.includes(oldBaziResult)) {
  content = content.replace(oldBaziResult, newBaziResult);
  console.log('✅ Added pillarShenSha to bazi mode result');
} else {
  console.log('⚠️ Could not find bazi mode result section');
}

// Step 5: Add 神煞 row to the four-pillar table
// Find the 十二长生 row (last row in table) and add a 神煞 row after it
const oldRowEnd = `<tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>
                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}
              </tr>
            </tbody>`;

const newRowEnd = `<tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>
                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">神煞</td>
                {(result.pillarShenSha||[]).map((p:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-[10px] leading-relaxed">
                  {getPillarShenShaLabel(p.items)}
                </td>)}
              </tr>
            </tbody>`;

if (content.includes(oldRowEnd)) {
  content = content.replace(oldRowEnd, newRowEnd);
  console.log('✅ Added 神煞 row to table');
} else {
  console.log('⚠️ Could not find 十二长生 row in table. Searching...');
  // Try to find any match
  const partial = content.indexOf('十二长生');
  if (partial >= 0) {
    console.log('   Found "十二长生" at position', partial);
    console.log('   Context:', content.substring(partial, partial + 200));
  }
  const partial2 = content.indexOf('岁运');
  if (partial2 >= 0) console.log('   "岁运" at', partial2);
  const partial3 = content.indexOf('</tbody>');
  if (partial3 >= 0) {
    // Check if there's already a 神煞 row
    const beforeTbody = content.substring(partial3 - 300, partial3);
    if (beforeTbody.includes('十二长生')) {
      console.log('   Found last 十二长生 row before </tbody>');
      const lastRowStart = content.lastIndexOf('<tr><td className="p-2', partial3);
      if (lastRowStart >= 0) {
        const fullRow = content.substring(lastRowStart);
        console.log('   Last row:', fullRow.substring(0, 150));
      }
    }
  }
}

// Step 6: Update the 神煞 card title/description
const oldShenShaTitle = `<h3 className="text-sm font-semibold text-gray-200 mb-3">神煞</h3>`;
const newShenShaTitle = `<h3 className="text-sm font-semibold text-gray-200 mb-3">神煞详解 <span className="text-[10px] font-normal text-gray-500">（各柱分布见上表）</span></h3>`;
if (content.includes(oldShenShaTitle)) {
  content = content.replace(oldShenShaTitle, newShenShaTitle);
  console.log('✅ Updated 神煞 card title');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File written successfully');
console.log('Done!');
