#!/usr/bin/env python3
"""
Insert vernacular for each chapter. 
Track brace depth (ignoring braces inside backtick strings).
When depth goes from 1→0, we've found the chapter closing.
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

CHAPTER_IDS = set(VERNACULAR_MAP.keys())  # all h01-h64 + ten-wings

output = []
i = 0
active_id = None
brace_depth = 0  # depth outside backticks
in_backtick = False

while i < len(lines):
    line = lines[i]
    
    # Check for chapter start
    m = re.match(r'^(\s*)\{ id: \'(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)\'', line)
    if m:
        active_id = m.group(2)
    
    # Update backtick state for this line
    for c in line:
        if c == '`':
            in_backtick = not in_backtick
    
    # Update brace depth (only when not in backtick)
    if not in_backtick:
        for c in line:
            if c == '{':
                brace_depth += 1
            elif c == '}':
                brace_depth -= 1
                if brace_depth == 0 and active_id:
                    # Chapter just closed! Insert vernacular before this line.
                    if active_id in VERNACULAR_MAP and active_id in CHAPTER_IDS:
                        vernacular = VERNACULAR_MAP[active_id]
                        escaped = escape_ts(vernacular)
                        indent_match = re.match(r'^(\s*)', line)
                        indent = indent_match.group(1) if indent_match else '        '
                        output.append(f"{indent}vernacular: `{escaped}`,")
                    active_id = None
    
    output.append(line)
    i += 1

output_text = '\n'.join(output)

# Verify
count = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields added: {count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Check for missing
for cid in VERNACULAR_MAP:
    v = VERNACULAR_MAP[cid]
    first_20 = v.split('\n')[0].strip()[:20]
    if first_20 not in output_text:
        print(f"  MISSING: {cid}")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
