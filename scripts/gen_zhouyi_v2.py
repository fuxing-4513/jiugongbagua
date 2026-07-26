#!/usr/bin/env python3
"""Generate the complete zhouyi.ts with vernacular fields - v2."""

import re, json

# Read original
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    original = f.read()

# Read vernacular map from add_vernacular.py
exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    content = f.read()
exec(content, exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

lines = original.split('\n')
output = []
i = 0
current_id = None
chapter_lines = []

# Detect chapter starts
def detect_chapter_start(line):
    m = re.match(r'^\s*\{ id\: \'(h\d+|xici\-shang|xici\-xia|shuogua|xugua|zagua)\'', line)
    return m.group(1) if m else None

# Detect if a line is a chapter end (the line that closes the chapter object)
# The chapter end line is the last line before the next chapter or closing bracket
# It can be: `] },` or `},` or `] },`
def is_chapter_end(line):
    s = line.strip()
    # Match patterns like `] },` or `},` at end of line
    if s.rstrip(',').endswith('}') and not s.startswith('{') and s != '}':
        # Could be a chapter end. Check that this isn't inside a backtick
        return True
    return False

# Let me take a simpler regex-based approach:
# Each hexagram/chapter block starts with { id: '...' and ends with one of:
# - `] },` (with figures)
# - `},` (without figures, with comma)
# The whole content is within content: \`...` and optionally figures: [...],
# Then the closing `},` 

# Let's find all chapter blocks using regex on the entire text
# Pattern: { id: 'h01', ... content: \`...` ... figures: [...] }, }

# Actually, let me use a simpler parsing approach: find each chapter by its id marker,
# collect its lines until we see the closing pattern that ends the object

i = 0
while i < len(lines):
    line = lines[i]
    cid = detect_chapter_start(line)
    
    if cid and cid in VERNACULAR_MAP:
        # Found a chapter that needs vernacular
        obj_lines = [line]
        i += 1
        
        # Collect until we hit the chapter end
        # The chapter end is a line like `    },` or `    figures: [...] },`
        # We need to track backtick strings to avoid false matches
        in_backtick = False
        backtick_content_start = False
        
        while i < len(lines):
            l = lines[i]
            obj_lines.append(l)
            
            # Track backtick state
            for ch in l:
                if ch == '`':
                    in_backtick = not in_backtick
            
            if not in_backtick:
                stripped = l.strip()
                # Check if this looks like chapter end:
                # Pattern: ends with ` },` or ` },` (with optional comma before })
                # More specifically: the last content line of a chapter
                # For chapters with figures: `    figures: [{...}] },`
                # For chapters without figures: `` },`` (content backtick then ` },`)
                # For last chapter: `` },` (no trailing comma)
                
                # Look for patterns ending with `,` or `},`
                if re.match(r'^.*\]\s*\},?\s*$', stripped) and 'figures' in l:
                    # This is figures closing: `] },` or `] },`
                    # This is the chapter end
                    break
                
                if re.match(r'^.*\`\s*\},?\s*$', stripped) and 'figures' not in l and 'content' not in l:
                    # This is content closing without figures: `` },`
                    # Check that this isn't the content opening line
                    if 'content' not in obj_lines[-1] if len(obj_lines) > 1 else True:
                        pass
            
            i += 1
        
        # obj_lines contains the full chapter object
        # Find the last line and insert vernacular before it
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        
        # The last line is the closing. We need to insert before it.
        # Figure out the indentation from the pattern
        last_line = obj_lines[-1]
        indent = last_line[:len(last_line) - len(last_line.lstrip())]
        
        # Write all lines except last, then vernacular, then last
        for line_out in obj_lines[:-1]:
            output.append(line_out)
        output.append(f"{indent}vernacular: `{escaped}`,")
        output.append(last_line)
    else:
        output.append(line)
    
    i += 1

output_text = '\n'.join(output)

# Verify
vernacular_count = len(re.findall(r'vernacular:', output_text))
print(f"Vernacular fields added: {vernacular_count}")
print(f"Expected: 69 (64 hexagrams + 5 ten-wings)")

# Verify no missing
missing = []
for cid in VERNACULAR_MAP:
    if f"vernacular:" not in output_text and cid not in output_text:
        # Actually check if the chapter id exists at all
        pass

# Write the file
outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

print(f"File written: {outpath}")
print(f"Total lines: {len(output_text.split(chr(10)))}")
