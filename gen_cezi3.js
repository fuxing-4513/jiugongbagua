const fs = require('fs');
const c = fs.readFileSync('cezi_final.txt', 'utf8');
const match = c.match(/const DICT[\s\S]+/);
if (!match) { console.log('No DICT found'); process.exit(1); }
let dictData = match[0].replace('const DICT: Record<string, CharData> = ', '');
const data = 'import type { CharData } from "./CeziClient"\n\nexport const DICT: Record<string, CharData> = ' + dictData;
fs.writeFileSync('src/app/cezi/ceziDict.ts', data);
console.log('Created data file');
