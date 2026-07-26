#!/usr/bin/env python3
"""Add vernacular to zhouyi.ts - parse-based approach."""

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
chapter_start = None
chapter_buf = []
in_chapter = False

def detect_start(line):
    """Check if line starts a chapter."""
    m = re.match(r'^\s*\{ id\: \'(h\d+|xici\-shang|xici\-xia|shuogua|xugua|zagua)\'', line)
    return m.group(1) if m else None

def is_closing_obj(line):
    """Check if line closes a chapter object at top level."""
    s = line.strip()
    # Pattern: ends with }, or }, (with optional whitespace)
    # Could be: `    },` or `] },` or `] },`
    # Must NOT be inside a backtick string
    
    # Remove all backtick-quoted sections
    # Actually simpler: the closing of a chapter object looks like:
    # 1. `    figures: [{...}] },`  (has figures)
    # 2. `    content: \`...\` },` (no figures)
    
    # Check for pattern: ends with `},` or `},` and is not inside a backtick
    
    # A top-level object close is `},` or `},`
    # But content is inside backticks which can contain `},`
    # We need to know if we're inside a backtick
    
    # Let's use a simple heuristic: the closing line is at the same indentation
    # level as the opening `{ id:` line (roughly), and matches }, or }, patterns
    return False  # We'll handle this differently

while i < len(lines):
    line = lines[i]
    cid = detect_start(line)
    
    if cid and cid in VERNACULAR_MAP:
        # Collect this chapter
        chapter = [line]
        i += 1
        backtick_depth = 0
        brace_depth = 0
        found_vernacular = False
        
        # Collect lines until we hit the chapter closing
        # Track backticks to avoid false positives inside content
        while i < len(lines):
            l = lines[i]
            chapter.append(l)
            
            # Count backtick depth to know if we're inside content
            for c in l:
                if c == '`':
                    backtick_depth ^= 1  # toggle (0 or 1)
            
            if backtick_depth == 0:
                s = l.strip()
                # Check for chapter object close
                # Match patterns: }, or ] }, or ] },
                if re.match(r'.*\]\s*\},?\s*$', s):
                    # This is a figures+closing line: figures: [{...}] },
                    # It's the chapter end
                    break
                elif re.match(r'.*\`\s*\},?\s*$', s):
                    # Could be closing without figures: content: `...` },
                    # But could also be a line inside content that ends with `
                    # If we just ended a backtick and the line ends with ` }, then it's the close
                    # Check: the line should contain 'content' not (it's the closing content line)
                    # Actually, any line that ends `` },`` could be:
                    # - The content closing line of a chapter without figures
                    # - A backtick inside content (shouldn't happen if backtick_depth is 0)
                    if backtick_depth == 0 and ('content' not in l.split('`')[0] if '`' in l else True):
                        # Check more carefully: if this has content, figures, title fields, it's the close
                        if any(f in l for f in ['title:', 'content:', 'id:']):
                            # This is likely the content close
                            pass
                    
                    # Actually let's be more careful. The closing for ten-wings is:
                    # content: `...`,
                    # }, 
                    # So the ` },` is on its own line. 
                    # But the hexagrams also have similar pattern:
                    # content: `...`,
                    # figures: [...],
                    # },
                    # So ` },` always marks the chapter end when backtick_depth == 0
                    
                    if backtick_depth == 0:
                        # Check if this is truly the chapter end by looking at preceding content
                        # The chapter end should have something like `},` or ` } }` etc
                        if re.match(r'^[\s\S]*\}\s*,?\s*$', s):
                            break
            
            i += 1
        
        # Now chapter has all lines. Insert vernacular before the last line.
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        
        last_line = chapter[-1]
        indent = last_line[:len(last_line) - len(last_line.lstrip())]
        
        for line_out in chapter[:-1]:
            output.append(line_out)
        output.append(f"{indent}vernacular: `{escaped}`,")
        output.append(last_line)
    else:
        output.append(line)
    
    i += 1

output_text = '\n'.join(output)
vernacular_count = len(re.findall(r'vernacular:', output_text))
print(f"Vernacular fields added: {vernacular_count}")
print(f"Expected: 69")

# Find which chapters are missing
for cid in VERNACULAR_MAP:
    if f"vernacular: `{escape_ts(VERNACULAR_MAP[cid][:20])}" not in output_text:
        pass

# Quick check - count how many chapters have vernacular
import json
# Find all chapter IDs that got vernacular
found = set()
for cid in VERNACULAR_MAP:
    escaped_short = escape_ts(VERNACULAR_MAP[cid][:50])
    if escaped_short in output_text:
        found.add(cid)

missing = set(VERNACULAR_MAP.keys()) - found
if missing:
    print(f"Missing vernacular for: {missing}")
else:
    print("All chapters covered!")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

print(f"File written: {outpath}")
