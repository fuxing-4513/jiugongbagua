#!/usr/bin/env python3
"""Add vernacular to zhouyi.ts using re.sub with callback."""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    original = f.read()

# Strategy: find each chapter's closing and insert vernacular before it.
# Pattern: a chapter object starts with { id:'...', ... } and its content
# is everything between { id: and the matching }, (which closes this object)

# Use a state machine to track brace/backtick depth per character position

lines = original.split('\n')
output = []
i = 0

# state
active_id = None
in_backtick = False
buf = []

while i < len(lines):
    line = lines[i]
    
    # Check for chapter start
    m = re.match(r'^(\s*)\{ id: \'(h\d+|xici\-shang|xici\-xia|shuogua|xugua|zagua)\'', line)
    
    if m:
        active_id = m.group(2)
        buf = [line]
        i += 1
        in_backtick = '`' in line and line.count('`') % 2 == 1
        
        # Collect lines until we find the chapter's closing
        while i < len(lines):
            l = lines[i]
            buf.append(l)
            
            # Update backtick state
            for c in l:
                if c == '`':
                    in_backtick = not in_backtick
            
            if not in_backtick:
                # Check if this line closes the chapter object
                s = l.strip()
                # The chapter close pattern:
                # - Ends with `},` (possibly with spaces before `},`)
                # - But NOT if it's just `},` alone (that would be weird in this file)
                # Actually looking at the file, the chapter closing is always:
                # `    },` (for ten-wings without figures, with content on previous line)
                # or `    figures: [{...}] },` (for hexagrams with figures)
                
                # The simplest check: the line is the last line of the object
                # when it ends with `},` or `},` and has meaningful content before
                
                # Check: is this line a likely chapter close?
                # A chapter close has `}` followed by optional `,`
                # and is NOT inside a backtick string
                
                if re.search(r'\}\s*,?\s*$', s):
                    # Has a closing brace at end
                    if not re.match(r'^\}\s*,?\s*$', s):  # not just `},`
                        if any(x in l for x in ['figures:', 'content:', 'title:', 'id:', '/images/']):
                            # Has chapter-related content - likely the closing
                            break
            
            i += 1
        
        # Insert vernacular before the last line
        active_id_str = active_id  # save before clearing
        if active_id_str in VERNACULAR_MAP:
            vernacular = VERNACULAR_MAP[active_id_str]
            escaped = escape_ts(vernacular)
            last_line = buf[-1]
            indent = re.match(r'^(\s*)', last_line).group(1)
            
            for line_out in buf[:-1]:
                output.append(line_out)
            output.append(f"{indent}vernacular: `{escaped}`,")
            output.append(last_line)
        else:
            output.extend(buf)
        
        active_id = None
        buf = []
    else:
        output.append(line)
    
    i += 1

output_text = '\n'.join(output)

# Verify
import json
vernacular_count = output_text.count('vernacular: `')
print(f"Vernacular fields added: {vernacular_count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Check for missing
for cid in VERNACULAR_MAP:
    if f"vernacular: `" not in output_text:
        # Check if we can find this chapter
        pass

# Better check: find all occurrences of 'vernacular:' and count
counts = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Count via regex: {counts}")

# Find which are missing
found = set()
for cid in VERNACULAR_MAP:
    v = VERNACULAR_MAP[cid]
    # Find a unique prefix
    prefix = v[:30].strip()
    escaped_prefix = escape_ts(prefix)
    # Check if this specific text appears after `vernacular:`
    if escape_ts(v[:20]) in output_text:
        found.add(cid)

missing = set(VERNACULAR_MAP.keys()) - found
if missing:
    print(f"Appears missing: {sorted(missing)}")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

print(f"Written: {outpath}")
print(f"Lines: {len(output_text.split(chr(10)))}")
