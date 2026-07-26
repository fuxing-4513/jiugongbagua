#!/usr/bin/env python3
"""
Fix: track initial brace_depth when chapter starts, and close when returning to that depth.
"""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

lines = text.split('\n')

output = []
active_id = None
start_depth = 0
brace_depth = 0
in_backtick = False

for line in lines:
    # Detect chapter start
    m = re.match(r'^(\s*)\{ id: \'(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)\'', line)
    if m and active_id is None:
        active_id = m.group(2)
        start_depth = brace_depth
        # We'll count this line's braces below
    
    # Process character by character
    for c in line:
        if c == '`':
            in_backtick = not in_backtick
        elif not in_backtick:
            if c == '{':
                brace_depth += 1
            elif c == '}':
                brace_depth -= 1
                if active_id and brace_depth == start_depth:
                    # Chapter just closed!
                    if active_id in VERNACULAR_MAP:
                        indent_match = re.match(r'^(\s*)', line)
                        indent = indent_match.group(1) if indent_match else '        '
                        vernacular = VERNACULAR_MAP[active_id]
                        escaped = escape_ts(vernacular)
                        output.append(f"{indent}vernacular: `{escaped}`,")
                    active_id = None
    
    output.append(line)

output_text = '\n'.join(output)

# Verify
count = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields added: {count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

if count != len(VERNACULAR_MAP):
    for cid in VERNACULAR_MAP:
        v = VERNACULAR_MAP[cid]
        short = v.split('\n')[0].strip()[:25]
        if short not in output_text:
            print(f"  MISSING: {cid}")
else:
    print("All chapters covered!")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
