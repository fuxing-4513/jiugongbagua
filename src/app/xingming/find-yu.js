const fs = require("fs");
const c = fs.readFileSync("C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx", "utf8");
const search = "'昱'";
let idx = 0, count = 0;
while ((idx = c.indexOf(search, idx)) >= 0) {
  count++;
  const ctx = c.substring(Math.max(0, idx - 20), Math.min(c.length, idx + 40));
  console.log("Found", count, "at", idx, ": ..." + ctx + "...");
  idx++;
}
console.log("Total:", count);
