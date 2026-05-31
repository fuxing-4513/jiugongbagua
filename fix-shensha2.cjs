const fs = require('fs');
let content = fs.readFileSync('src/app/bazi/BaziClient.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// Find the 十二长生 row and add 神煞 row after it
const target = '<tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>\n                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}\n              </tr>\n            </tbody>';

const replacement = '<tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>\n                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}\n              </tr>\n              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">神煞</td>\n                {(result.pillarShenSha||[]).map((p:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-[10px] leading-relaxed">\n                  {getPillarShenShaLabel(p.items)}\n                </td>)}\n              </tr>\n            </tbody>';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('Added 神煞 row to table');
} else {
  console.log('Pattern not found. Searching...');
  const pos = content.indexOf('十二长生');
  if (pos >= 0) {
    const snippet = content.substring(pos, pos + 350);
    console.log('Context:', JSON.stringify(snippet));
  }
}

content = content.replace(/\n/g, '\r\n');
fs.writeFileSync('src/app/bazi/BaziClient.tsx', content, 'utf8');
console.log('Done');
