const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const existing = fs.readFileSync(p, 'utf8');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// The existing file has CHARS_WX up to "'彤':'火',"
// In xe.txt, right after "'彤':'火'," comes ",'丹':'火',"
// We need everything from "'丹'..." onwards to the end of xe.txt

const danPos = xe.indexOf("'丹':'火'", 14000);
console.log("Dan pos:", danPos);
const continuation = xe.substring(danPos);
console.log("Continuation length:", continuation.length);
console.log("First 100 chars:", continuation.substring(0, 100));
console.log("Last 100 chars:", continuation.substring(continuation.length - 100));

// We also need to look at how the existing file ends to make sure we don't duplicate last chars
const lastLine = existing.split('\n').pop();
console.log("\nExisting last line:", lastLine);

// Append
const updated = existing + '\n' + continuation;
fs.writeFileSync(p, updated, 'utf8');
console.log("\nWritten. New length:", fs.statSync(p).size, "bytes");
