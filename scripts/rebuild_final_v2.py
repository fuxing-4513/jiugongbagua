#!/usr/bin/env python3
"""
Final rebuild: strip all vernacular, fix indentation, add clean vernacular.
"""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

# ====== READ the CURRENT file ======
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# ====== STEP 1: Extract hexagram section (from the hexagramChapters array) ======
idx_hex_start = text.find('const hexagramChapters')
idx_export = text.find('export const zhouyiContent', idx_hex_start)

header = text[:idx_export]

# ====== STEP 2: Strip all vernacular from hexagram section ======
# Remove `vernacular: \`...\`,` patterns (multiline)
def strip_vernacular(s):
    """Remove all vernacular fields from the text."""
    result = s
    # Pattern: ,\n    vernacular: `...`,\n
    # The vernacular can span multiple lines (inside backticks)
    # Remove the entire field including the comma before it
    result = re.sub(r',\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    # Also handle case where there's no leading comma (shouldn't happen but just in case)
    result = re.sub(r'\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    # Clean up double newlines
    result = re.sub(r'\n\n\n+', r'\n\n', result)
    return result

header_clean = strip_vernacular(header)

# Verify hexagrams count
h_count = len(re.findall(r"\{ id: 'h\d{2}'", header_clean))
print(f"Hexagrams in cleaned header: {h_count}")

if h_count != 64:
    print("ERROR: Wrong number of hexagrams!")
    import sys
    sys.exit(1)

# ====== STEP 3: Build the complete file from scratch ======

# Import the original ten-wings content from add_vernacular.py
# Actually, the ten-wings content is in the file I created earlier.
# Let me extract the original ten-wings from the current file (before rebuild)

# Find ten-wings in the CURRENT (dirty) text
def extract_raw_chapter(text, cid):
    """Extract chapter text for a given ID, stripping any existing vernacular."""
    idx = text.find(f"{{ id: '{cid}'")
    if idx < 0:
        return None
    
    # Find matching close
    bt = False
    bd = 1
    i = idx + 1
    while i < len(text):
        c = text[i]
        if c == '`':
            bt = not bt
        elif not bt:
            if c == '{': bd += 1
            elif c == '}':
                bd -= 1
                if bd == 0:
                    end = i + 1
                    if end < len(text) and text[end] == ',':
                        end += 1
                    result = text[idx:end]
                    # Strip vernacular
                    result = strip_vernacular(result)
                    # Ensure proper closing
                    result = result.rstrip().rstrip(',')
                    return result
        i += 1
    return None

# Get ten-wings content (strip vernacular, get raw chapter text)
ten_wings_raw = {}
for cid in ['xici-shang', 'xici-xia', 'shuogua', 'xugua', 'zagua']:
    raw = extract_raw_chapter(text, cid)
    if raw:
        ten_wings_raw[cid] = raw
        print(f"  {cid}: {len(raw)} bytes")
    else:
        print(f"  {cid}: NOT FOUND in current file!")

# ====== STEP 4: Rebuild the full file ======

# Header section
lines = []
lines.append(header_clean.rstrip())
lines.append("")

# Build zhouyiContent
lines.append("export const zhouyiContent: BookChapter = {")
lines.append("  bookId: 'zhouyi',")
lines.append("  metadata: {")
lines.append("    sourceOrg: 'jiugong-bagua',")
lines.append("    catalogVersion: '1.1',")
lines.append("    curatedBy: '九宫易学书馆',")
lines.append("    curatedAt: '2026-07-25',")
lines.append("    sourceVersion: '通行本王弼、韩康伯注本',")
lines.append("  },")
lines.append("  preface: {")
lines.append("    id: 'preface',")
lines.append("    title: '九宫导读',")
lines.append("    content: prefaceContent,")
lines.append("  },")
lines.append("  chapters: [")

# Intro chapter (from the current text, stripped)
intro_raw = extract_raw_chapter(text, 'intro')
if intro_raw:
    lines.append(f"    {intro_raw},")
else:
    # Fallback intro
    lines.append("    { id: 'intro', title: '周易导读', content: `《周易》...` },")

# Spread
lines.append("    ...hexagramChapters,")

# Ten-wings with vernacular
for cid in ['xici-shang', 'xici-xia', 'shuogua', 'xugua', 'zagua']:
    tw_raw = ten_wings_raw.get(cid, '')
    if tw_raw:
        # Format with proper indentation
        tw_indented = tw_raw.replace('\n', '\n    ')
        # Remove leading indentation if present (it will be re-added)
        tw_clean = tw_indented.strip()
        
        # Now add vernacular before closing
        if cid in VERNACULAR_MAP:
            vern = VERNACULAR_MAP[cid]
            escaped = escape_ts(vern)
            
            # The tw_clean ends with `}` or `},` or `}`
            # Find the last }
            last_brace = tw_clean.rfind('}')
            if last_brace >= 0:
                before_close = tw_clean[:last_brace].rstrip()
                close_part = tw_clean[last_brace:]  # `}` or `},`
                # Get indent for the vernacular line
                last_line_before = before_close.split('\n')[-1] if '\n' in before_close else ''
                indent = re.match(r'^(\s*)', last_line_before).group(1)
                
                lines.append(f"    {before_close},")
                lines.append(f"    {indent}vernacular: `{escaped}`,")
                lines.append(f"    {close_part},")
            else:
                lines.append(f"    {tw_clean},")
        else:
            lines.append(f"    {tw_clean},")

# Close chapters array and zhouyiContent
lines.append("  ]")
lines.append("}")

output_text = '\n'.join(lines)

# ====== VERIFY ======
cnt = output_text.count('vernacular: `')
h_cnt = len(re.findall(r"\{ id: 'h\d{2}'", output_text))
tw_cnt = len(re.findall(r"\{ id: '(xici-shang|xici-xia|shuogua|xugua|zagua)'", output_text))

print(f"\nVernacular fields: {cnt}")
print(f"Hexagrams: {h_cnt}")
print(f"Ten-wings: {tw_cnt}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Additional verification: check for syntax issues
# Ensure no double commas
if ',,' in output_text:
    print("WARNING: Double comma found!")

# Check that the file structure is valid
if 'export const zhouyiContent' not in output_text:
    print("ERROR: Missing export!")
if 'const hexagramChapters' not in output_text:
    print("ERROR: Missing hexagramChapters!")

# ====== WRITE ======
outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = output_text.count('\n') + 1
print(f"\nWritten: {outpath} ({line_count} lines)")
