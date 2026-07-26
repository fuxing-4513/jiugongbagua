#!/usr/bin/env python3
"""Generate the complete zhouyi.ts with vernacular fields."""

# Read the original file
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    original = f.read()

# Read the vernacular map from a separate JSON file
import json, os

# Write the vernacular map out as JSON, then read it back
# Actually, let me just parse the original by sections and insert vernacular

# Strategy: locate each hexagram chapter by its id pattern, find its closing braces,
# and insert a vernacular field before "}," line that ends the chapter.

# The structure of each hexagram entry is like: 
# { id: 'h01', title: '...', content: `...`, figures: [...], },
# or for ten-wings: { id: 'xici-shang', title: '...', content: `...` },

# We need to insert `vernacular: \`...\`, ` before the final `},` or `},`

def escape_ts(s):
    """Escape for TypeScript template literal."""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

# First, let's parse the file to find all chapter blocks
lines = original.split('\n')
output = []
i = 0
current_chapter_id = None
chapter_start_line = -1
brace_count = 0
in_backtick = False

VERNACULAR_MAP_RAW = {}  # will be populated below

# Read the vernacular map from the script itself
exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    content = f.read()
exec(content, exec_globals)
VERNACULAR_MAP_RAW = exec_globals['VERNACULAR_MAP']

while i < len(lines):
    line = lines[i]
    
    # Detect chapter start: { id: 'hNN' or { id: 'xici-...'
    m = __import__('re').match(r'^\s*\{ id\: \'(h\d+|xici\-shang|xici\-xia|shuogua|xugua|zagua)\'', line)
    if m:
        current_chapter_id = m.group(1)
        chapter_start_line = i
    
    # Check for end of chapter object: a `},` line at the right nesting depth
    # The chapter objects end with `},` (not `}],` which is the figures array)
    # We need to track backtick strings to avoid matching inside content
    
    stripped = line.strip()
    if stripped == '},' and current_chapter_id:
        # Check if there's a figures array before this - if so, the `},` is the chapter end
        # But we need to verify this isn't a nested `},` inside figures
        # Figures array looks like: figures: [{...}],
        # So the last `},` before next chapter is the chapter end
        
        # Check: is the next non-empty line a new chapter start or closing bracket?
        next_nonempty = None
        for k in range(i+1, min(i+6, len(lines))):
            s = lines[k].strip()
            if s:
                next_nonempty = s
                break
        
        if next_nonempty and (next_nonempty.startswith('{ id:') or next_nonempty == ']'):
            # This is the chapter end - insert vernacular before it
            vernacular = VERNACULAR_MAP_RAW.get(current_chapter_id, '')
            if vernacular:
                escaped = escape_ts(vernacular)
                # Insert vernacular line before the closing `},`
                indent = line[:len(line) - len(line.lstrip())]
                output.append(f"{indent}vernacular: `{escaped}`,")
            
            current_chapter_id = None
    
    output.append(line)
    i += 1

# Write output
output_text = '\n'.join(output)

# Verify we have the right number of vernacular fields
import re
vernacular_count = len(re.findall(r'vernacular:', output_text))
print(f"Vernacular fields added: {vernacular_count}")
print(f"Expected: 64 hexagrams + 5 ten-wings = 69")

# Write the file
outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

print(f"File written: {outpath}")
