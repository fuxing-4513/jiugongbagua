#!/usr/bin/env python3
"""
Line-by-line approach: insert vernacular for each chapter.
Track backtick depth; when depth=0 and we find a chapter-closing line, insert vernacular before it.
"""

import re

# Load vernacular map
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
bt_depth = 0  # 0 = not in backtick, 1 = in backtick

CHAPTER_IDS = set(VERNACULAR_MAP.keys())

while i < len(lines):
    line = lines[i]
    
    # Check for chapter start: `{ id: 'hNN'` or `{ id: 'xici-...'`
    m = re.match(r'^(\s*)\{ id: \'(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)\'', line)
    
    if m:
        indent = m.group(1)
        active_id = m.group(2)
    
    # Track backtick depth
    for c in line:
        if c == '`':
            bt_depth ^= 1
    
    if active_id and bt_depth == 0:
        # Check if this line closes the current chapter
        s = line.strip()
        
        # Hexagram with figures: line ends with `] },` or `] },`
        # Pattern: `    figures: [{...}] },`
        # The `]`, then `}` closes chapter, then `,` is array sep
        if re.search(r'\]\s*\},?\s*$', s) and 'figures' in s:
            # This is the chapter closing line
            if active_id in VERNACULAR_MAP:
                vernacular = VERNACULAR_MAP[active_id]
                escaped = escape_ts(vernacular)
                output.append(f"{indent}vernacular: `{escaped}`,")
            active_id = None
        
        # Ten-wings without figures: line is the closing `},`
        # Pattern: `` },` - the content backtick, then `},`
        elif re.search(r'`\s*\},?\s*$', s) and not s.startswith('{') and not s.startswith('content'):
            # Check: this line has ` at end, then }, or even just ` },
            # It should be the close of a content paragraph
            # Also check it's not: `content: \`...\`\\...` - that's a different pattern
            
            # The ten-wings close is:
            # `...` },
            # or `...\n` },
            
            # Check if `content:` is on this line
            if 'content:' not in s.split('`')[0] if '`' in s else True:
                pass
            
            # Actually the last line of a ten-wings chapter has the backtick, then ` },`
            # It closes the content string and the object.
            # Let me check: the line starts with whitespace and ends with ` },`
            # and has at least one backtick
            
            # The pattern is: the content string closes (backtick), then ` },`
            # This line is the final line of the chapter object
            
            if active_id in VERNACULAR_MAP:
                vernacular = VERNACULAR_MAP[active_id]
                escaped = escape_ts(vernacular)
                output.append(f"{indent}vernacular: `{escaped}`,")
            active_id = None
    
    output.append(line)
    i += 1

output_text = '\n'.join(output)

# Verify
count = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields: {count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Check integrity - try parsing
import subprocess
# We'll verify with tsc later

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
