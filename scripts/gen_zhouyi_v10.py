#!/usr/bin/env python3
"""
Character-by-character per-line processing.
Process backtick and brace states left-to-right, interleaved.
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
i = 0
active_id = None
active_indent = ''
brace_depth = 0
in_backtick = False

while i < len(lines):
    line = lines[i]
    
    # Process character by character
    for c in line:
        if c == '`':
            in_backtick = not in_backtick
        elif not in_backtick:
            if c == '{':
                brace_depth += 1
            elif c == '}':
                brace_depth -= 1
                if brace_depth == 0 and active_id:
                    # Chapter just closed! Insert vernacular before THIS line.
                    # We'll handle this after the loop (we emit lines after processing)
                    pass
    
    # NOW check if brace_depth reached 0 during this line
    # Re-process to detect the moment depth reaches 0
    bt = False
    bd = brace_depth  # We'll re-track
    
    # Actually, let me recalculate more carefully.
    # We need to know if on this line, brace_depth went from 1 to 0.
    
    bt_scan = in_backtick  # This has the correct final state
    # but we need to track the transition
    
    # Let me re-scan:
    bd_start = brace_depth  # actual stored value
    
    # Hmm, this is getting messy. Let me take a different approach.
    # Track depth AND detect when it hits 0 during processing.
    
    i += 1

# The approach above is flawed. Let me just redo it with per-character processing
# that properly tracks everything.

print("Restarting with clean approach...")

# Reset
output = []
i = 0
active_id = None
active_indent = ''
brace_depth = 0
in_backtick = False
insert_after_line = None  # tuple (content, indent) to insert after current chapter closes

while i < len(lines):
    line = lines[i]
    
    # Detect chapter start
    m = re.match(r'^(\s*)\{ id: \'(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)\'', line)
    if m:
        active_id = m.group(2)
        active_indent = m.group(1)
    
    # Process line character by character, interleaving backtick and brace tracking
    for pos, c in enumerate(line):
        if c == '`':
            in_backtick = not in_backtick
        elif not in_backtick:
            if c == '{':
                brace_depth += 1
            elif c == '}':
                brace_depth -= 1
                if brace_depth == 0 and active_id:
                    # Chapter closed on this character! 
                    # Insert vernacular before this line
                    if active_id in VERNACULAR_MAP:
                        indent_match = re.match(r'^(\s*)', line)
                        indent = indent_match.group(1) if indent_match else '        '
                        vernacular = VERNACULAR_MAP[active_id]
                        escaped = escape_ts(vernacular)
                        # Mark that we need to insert before this line
                        # We'll handle it after the line is fully processed
                        insert_after_line = (len(output), indent, escaped)
                    active_id = None
    
    output.append(line)
    
    # If we need to insert vernacular, do it now (after the closing line)
    if insert_after_line is not None:
        # Insert between the closing line and whatever comes next
        output.insert(insert_after_line[0], f"{insert_after_line[1]}vernacular: `{insert_after_line[2]}`,")
        insert_after_line = None
    
    i += 1

output_text = '\n'.join(output)

# Verify
count = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields added: {count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

if count != len(VERNACULAR_MAP):
    # Check which are missing
    for cid in VERNACULAR_MAP:
        v = VERNACULAR_MAP[cid]
        short = v.split('\n')[0].strip()[:25]
        if short not in output_text:
            print(f"  MISSING: {cid}")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
