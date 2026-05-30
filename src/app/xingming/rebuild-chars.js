const fs = require("fs");
const c = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");

const charsIdx = c.indexOf("const CHARS_WX:");
const charsEnd = c.indexOf("}", charsIdx);
const before = c.substring(0, charsIdx);
const rest = c.substring(charsEnd + 1);

const charsContent = c.substring(charsIdx, charsEnd + 1);
const entries = charsContent.match(/'[^']+':'(木|火|土|金|水)'/g) || [];

// De-dup, keeping first occurrence
const seen = new Set();
const groups = {木: [], 火: [], 土: [], 金: [], 水: []};
const order = [];

for (const e of entries) {
  const key = e.substring(1, e.indexOf("':")); // remove leading '
  const val = e.match(/:'(.)'/)[1]; // 五行
  if (!seen.has(key)) {
    seen.add(key);
    groups[val].push(key);
  }
}

// Build clean CHARS_WX
const lines = Object.entries(groups).flatMap(([wx, keys]) => 
  keys.map(k => "  " + k + ":'" + wx + "',")
);

const newChars = "const CHARS_WX: Record<string, string> = {\n" + lines.join("\n") + "\n}";

const result = before + newChars + rest;
fs.writeFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", result, "utf8");
console.log("Written. Size:", result.length);

// Verify no duplicates
const test = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");
const ti = test.indexOf("const CHARS_WX:");
const te = test.indexOf("}", ti);
const tt = test.substring(ti, te + 1);
const tx = tt.match(/'[^']+':'(木|火|土|金|水)'/g) || [];
const ts = new Set(tx.map(e => e.split("':")[0]));
console.log("Entries:", tx.length, "Unique:", ts.size);
