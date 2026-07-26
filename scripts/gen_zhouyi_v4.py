#!/usr/bin/env python3
"""Add vernacular to zhouyi.ts - v4: line-by-line with context tracking."""

import re

# Read vernacular map
exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    original = f.read()

lines = original.split('\n')
output = []
i = 0
active_id = None
in_backtick = False
# Track brace depth to know when we close a chapter object
# The chapter objects are nested inside hexagramChapters array and chapters array

# Actually, let me use a simpler approach: track lines for each chapter

while i < len(lines):
    line = lines[i]
    
    # Detect chapter start
    m = re.match(r'^\s*\{ id\: \'(h\d+|xici\-shang|xici\-xia|shuogua|xugua|zagua)\'', line)
    
    if m:
        active_id = m.group(1)
        chapter_lines = [line]
        i += 1
        
        # Collect chapter lines until its closing }, or ] },
        # Track backtick to avoid matching inside content strings
        bt = 0
        for c in line:
            if c == '`': bt ^= 1
        
        while i < len(lines):
            l = lines[i]
            chapter_lines.append(l)
            
            for c in l:
                if c == '`':
                    bt ^= 1
            
            if bt == 0:
                s = l.strip()
                # Check for chapter object closing patterns:
                # Pattern A: `    },` - simple close (no figures or last entry)
                # Pattern B: `    figures: [{...}],` followed by `    },`
                # Pattern C: `    figures: [{...}] },` - figures and close in one line
                
                # Look for: line ends with `},` or `},` where the content before
                # has the closing backtick or closing bracket
                
                # If this line has `},` at the end (possibly with spaces)
                # and it's not just `},` on its own...
                if re.search(r'\}\s*,?\s*$', s) and s.count('{') == s.count('}'):
                    # Check if this line contains the closing of a chapter-level object
                    # A chapter-level close will have patterns like:
                    # - `] },` (has closing bracket + brace)
                    # - `` },` (content ends + brace)
                    # But NOT `},` alone (which would be weird)
                    
                    # The chapter object closes when we see:
                    # 1. `figures: [{...}] },` or `figures: [{...}] },`
                    #    The figures line is the chapter end
                    # 2. `` },` where the line content has ` at the end
                    #    This is the content close line for chapters without figures
                    
                    # Actually the simplest: a chapter-level close happens when:
                    # - The line has `},` or `},` at the end
                    # - AND the line is not just `},` (it has content before it)
                    # - AND we're at backtick depth 0
                    
                    if s.endswith('},') or s.endswith('},'):
                        # The closing `},` pattern
                        if s != '},' and s != '},':
                            # Has content before `},`
                            # Check: does this look like a chapter close?
                            # Chapter close contains `},` which closes the chapter object
                            # The figures entry ends with `],` not `},`
                            # So `],` separates from `},` - we need `},` not `],`
                            if s.endswith('},'):
                                # Check for `},` specifically (matches with comma after brace)
                                if '}' in s[:-1]:  # there's a } before the last }
                                    # This could be nested - like `] },`
                                    if any(f in s for f in ['figures:', 'content:', 'title:', 'id:']):
                                        # This is a chapter close
                                        break
                                else:
                                    # Simple `},` 
                                    if any(f in s for f in ['figures:', 'content:', 'title:', 'id:']):
                                        break
            
            i += 1
        
        # Now we have the full chapter in chapter_lines
        # The last line is the chapter close
        if active_id in VERNACULAR_MAP:
            vernacular = VERNACULAR_MAP[active_id]
            escaped = escape_ts(vernacular)
            last_line = chapter_lines[-1]
            indent_match = re.match(r'^(\s*)', last_line)
            indent = indent_match.group(1) if indent_match else ''
            
            for line_out in chapter_lines[:-1]:
                output.append(line_out)
            output.append(f"{indent}vernacular: `{escaped}`,")
            output.append(last_line)
        else:
            output.extend(chapter_lines)
        
        active_id = None
    else:
        output.append(line)
    
    i += 1

output_text = '\n'.join(output)
vernacular_count = len(re.findall(r'\bvernacular:', output_text))
print(f"Vernacular fields added: {vernacular_count}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Check which IDs are missing
found_ids = set()
for cid in VERNACULAR_MAP:
    pattern = f"'id': '{cid}'" 
    if cid in output_text:
        found_ids.add(cid)

missing = set(VERNACULAR_MAP.keys()) - found_ids
if missing:
    print(f"Chapter IDs NOT FOUND in output: {sorted(missing)}")

# Actually check if vernacular content exists for each ID
missing_vernacular = []
for cid in VERNACULAR_MAP:
    if f"vernacular:" not in output_text:
        missing_vernacular.append(cid)

# More reliable check: find all lines with vernacular: and compare chapter IDs
vernacular_pattern = re.findall(r'vernacular:', output_text)
print(f"Lines with 'vernacular:': {len(vernacular_pattern)}")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

print(f"File written: {outpath}")
print(f"Lines: {len(output_text.split(chr(10)))}")
