const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');
// Remove the duplicate mode line (the one inserted at the wrong place)
c = c.replace(
  "const [mode, setMode] = useState<'date'|'bazi'>('date')\n  const [mode, setMode] = useState<'date'|'bazi'>('date')",
  "const [mode, setMode] = useState<'date'|'bazi'>('date')"
);
// Remove the duplicate gender line
c = c.replace(
  "const [gender, setGender] = useState('男')\n  const [gender, setGender] = useState('男')",
  "const [gender, setGender] = useState('男')"
);
// Remove accidentally inserted bzTg/bzDz in middle
c = c.replace(
  "const [day, setDay] = useState(String(now.getDate()))\n  const [bzTg, setBzTg] = useState(['甲','甲','甲','甲'])\n  const [bzDz, setBzDz] = useState(['子','寅','午','子'])\n  const [hour, setHour] = useState('11')",
  "const [day, setDay] = useState(String(now.getDate()))\n  const [hour, setHour] = useState('11')"
);
// Also fix the duplicate mode selector in old form section (the original gender select was repeated)
fs.writeFileSync(f, c, 'utf8');
console.log('dedup done');
