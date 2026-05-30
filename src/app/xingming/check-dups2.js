const fs = require("fs");
const c = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");

const charsIdx = c.indexOf("const CHARS_WX:");
const charsEnd = c.indexOf("}", charsIdx);
const before = c.substring(0, charsIdx);
const rest = c.substring(charsEnd + 1);

let charsContent = c.substring(charsIdx, charsEnd + 1);
console.log("CHARS_WX length:", charsContent.length);

// Extract all entries as 'key':'val',
const entries = charsContent.match(/'[^']+':'(木|火|土|金|水)'/g) || [];
const seen = new Set();
for (const e of entries) {
  const key = e.split("':")[0];
  const val = e.split("'")[5] || e.split("'")[3];
  if (seen.has(key)) {
    console.log("Duplicate:", key, val);
  } else {
    seen.add(key);
  }
}
console.log("Total entries:", entries.length, "Unique:", seen.size);
