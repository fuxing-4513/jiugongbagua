const fs = require("fs");
const c = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");

// The current CHARS_WX is empty {} - rebuild from xe.txt
const xe = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt", "utf8");

// Find CHARS_WX in xe.txt
const charsIdx = xe.indexOf("const CHARS_WX:");
const charsEnd = xe.indexOf("}", charsIdx);
const charsContent = xe.substring(charsIdx, charsEnd + 1);
console.log("xe CHARS_WX length:", charsContent.length);

// Extract entries
const entries = charsContent.match(/'[^']+':'(木|火|土|金|水)'/g) || [];
console.log("Entries found:", entries.length);

// De-dup
const seen = new Set();
const groups = {木: [], 火: [], 土: [], 金: [], 水: []};

for (const e of entries) {
  // e.g. '林':'木'
  const parts = e.split("':");
  const quotedKey = parts[0]; // '林
  const key = quotedKey.substring(1); // 林
  const val = parts[1].replace(/'/g, ""); // 木
  
  if (!seen.has(key)) {
    seen.add(key);
    groups[val].push(key);
  }
}

console.log("Unique keys:", seen.size);
for (const [wx, keys] of Object.entries(groups)) {
  console.log(wx + ":", keys.length, "items");
}

// Build CHARS_WX with per-wx grouping
const lines = [];
for (const [wx, keys] of Object.entries(groups)) {
  lines.push("  // " + wx);
  for (const key of keys) {
    lines.push("  '" + key + "':'" + wx + "',");
  }
}

const newChars = "const CHARS_WX: Record<string, string> = {\n" + lines.join("\n") + "\n}";

// Replace in file
const oldCharsIdx = c.indexOf("const CHARS_WX:");
const oldCharsEnd = c.indexOf("}", oldCharsIdx);
const result = c.substring(0, oldCharsIdx) + newChars + c.substring(oldCharsEnd + 1);

fs.writeFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", result, "utf8");
console.log("\nWritten. Size:", result.length);

// Verify
const r = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");
const ri = r.indexOf("const CHARS_WX:");
const re = r.indexOf("}", ri);
const rt = r.substring(ri, re + 1);
const rx = rt.match(/'[^']+':'(木|火|土|金|水)'/g) || [];
const rs = new Set(rx.map(e => e.split("':")[0]));
console.log("Result entries:", rx.length, "Unique:", rs.size);
