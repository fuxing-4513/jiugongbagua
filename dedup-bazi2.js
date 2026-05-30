const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');

// Find the state declarations region and dedup line by line
// We want exactly: mode, cal, year, month, day, bzTg, bzDz, hour, gender, result, error
// Current has two mode lines

// Simple approach: split into lines and filter
const lines = c.split('\n');
const seenVars = new Set();
const outLines = [];
let inStates = false;
let afterStates = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Detect state declaration region
  if (line.includes('const [mode, setMode]') || 
      line.includes('const [cal, setCal]') ||
      line.includes('const [year, setYear]') ||
      line.includes('const [month, setMonth]') ||
      line.includes('const [day, setDay]') ||
      line.includes('const [bzTg, setBzTg]') ||
      line.includes('const [bzDz, setBzDz]') ||
      line.includes('const [hour, setHour]') ||
      line.includes('const [gender, setGender]') ||
      line.includes('const [result, setResult]') ||
      line.includes('const [error, setError]')) {
    inStates = true;
    // Extract var name
    const m = line.match(/const \[(\w+)/);
    if (m) {
      if (seenVars.has(m[1])) {
        continue; // skip duplicate
      }
      seenVars.add(m[1]);
    }
  } else {
    if (inStates && !afterStates) {
      afterStates = true;
    }
    inStates = false;
  }
  outLines.push(line);
}

fs.writeFileSync(f, outLines.join('\n'), 'utf8');
console.log('dedup by lines done');
