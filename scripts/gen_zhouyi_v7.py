#!/usr/bin/env python3
"""Add vernacular to zhouyi.ts - v7: fixed brace counting."""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# Find chapter boundaries
chapters = []

for m in re.finditer(r"\{ id: '(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)'", text):
    start = m.start()
    cid = m.group(1)
    
    # Find matching close: brace_depth tracks the top-level object
    # Start after the opening `{` with depth=1 (already counting the opening)
    brace_depth = 1
    in_backtick = False
    i = start + 1  # skip past the opening `{`
    
    while i < len(text):
        ch = text[i]
        
        if ch == '`':
            in_backtick = not in_backtick
        
        if not in_backtick:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    end = i + 1  # include the closing }
                    # Include trailing comma if present
                    if end < len(text) and text[end] == ',':
                        end += 1
                    break
        i += 1
    else:
        print(f"WARNING: no closing brace for {cid} at {start}")
        continue
    
    chapters.append((start, end, cid))

print(f"Found {len(chapters)} chapters")

# Rebuild the text with vernacular inserted
result_parts = []
prev_end = 0

# Process in order
for start, end, cid in sorted(chapters, key=lambda x: x[0]):
    result_parts.append(text[prev_end:start])
    chapter_text = text[start:end]
    
    if cid in VERNACULAR_MAP:
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        
        # Find where to insert: before the final `}`
        chapter_trimmed = chapter_text.rstrip()
        last_brace = chapter_trimmed.rfind('}')
        
        if last_brace < 0:
            # Shouldn't happen
            result_parts.append(chapter_text)
        else:
            before = chapter_trimmed[:last_brace].rstrip()
            after = chapter_trimmed[last_brace:]  # } or },
            
            # Get indentation from the line containing }
            last_nl = before.rfind('\n')
            indent = re.match(r'^(\s*)', before[last_nl+1:] if last_nl >= 0 else before).group(1)
            
            result_parts.append(before)
            result_parts.append(f",\n{indent}vernacular: `{escaped}`")
            result_parts.append(f"\n{after}")
    else:
        result_parts.append(chapter_text)
    
    prev_end = end

result_parts.append(text[prev_end:])
output_text = ''.join(result_parts)

# Verify
counts = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields: {counts}")
print(f"Expected: {len(VERNACULAR_MAP)}")

if counts != len(VERNACULAR_MAP):
    # Find missing
    for cid in VERNACULAR_MAP:
        v = VERNACULAR_MAP[cid]
        # Check by first unique content line
        first_line = v.split('\n')[0].strip()[:20]
        if first_line not in output_text:
            print(f"  Missing: {cid} (first line: {first_line}...)")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
