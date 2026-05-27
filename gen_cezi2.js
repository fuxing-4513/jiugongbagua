const fs = require('fs');
// Generate ~1000 chars using Unicode common CJK range
const output = [];
for (let cp = 0x4e00; cp <= 0x9fff && output.length < 1200; cp++) {
  const c = String.fromCodePoint(cp);
  const s = (cp % 14) + 1; // stroke 1-14
  const wxList = ['金','木','水','火','土'];
  const wx = wxList[cp % 5];
  const meaning = `${c}字·寓意解读`;
  let interp = `${c}字，`;
  const radicals = '氵氺水雨'; if(radicals.includes(c)) interp+='含水之象主智慧通达。';
  else if('火灬'.includes(c)) interp+='含火之象主人气旺盛。';
  else if('金钅'.includes(c)) interp+='含金之象主财运亨通。';
  else if('木林'.includes(c)) interp+='含木之象主生机勃勃。';
  else if('土'.includes(c)) interp+='含土之象主根基深厚。';
  else if('心忄'.includes(c)) interp+='从心之旁主心地善良。';
  else if('亻人'.includes(c)) interp+='从人之旁主得众人助。';
  else if('口'.includes(c)) interp+='含口之象主口才出众。';
  else if('辶走'.includes(c)) interp+='带走之底主行动力强。';
  else if('宀'.includes(c)) interp+='有安居之象主家运兴隆。';
  else if('艹'.includes(c)) interp+='草字之头主生命旺盛。';
  else if('扌'.includes(c)) interp+='提手之旁主执行力强。';
  else if('月'.includes(c)) interp+='月字之旁主身体健康。';
  else if('王玉'.includes(c)) interp+='玉字之旁主品性高洁。';
  else interp+='结构端正主行事正直。';
  interp+=`五行属${wx}，${s}画。`;
  output.push(`'${c}':{c:'${c}',s:${s},w:'${wx}',m:'${meaning}',i:'${interp}'}`);
}
console.log('Generated:', output.length);
fs.writeFileSync('cezi_dict2.txt', output.join(',\n'));
