#!/usr/bin/env python3
"""
Final reconstruction: clean up the corrupted file by:
- Keeping header + hexagramChapters (with vernacular already added)
- Rebuilding the zhouyiContent section with correct chapters array
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
    content = f.read()

# ====== STEP 1: Extract header (preface + hexagramChapters) ======
idx_hex = content.find('const hexagramChapters')
idx_export = content.find('export const zhouyiContent', idx_hex)

header = content[:idx_export]  # Everything up to export const zhouyiContent
print(f"Header: {len(header)} bytes")

# ====== STEP 2: Extract original ten-wings content from the corrupted chapters section ======
# Find the first chapters array
idx_chapters = content.find('chapters: [', idx_export)
# Find the intro chapter
idx_intro = content.find("{ id: 'intro'", idx_chapters)
# Find xici-shang (first ten-wings after intro+spread)
idx_xici_shang = content.find("{ id: 'xici-shang'", idx_chapters)
idx_xici_xia = content.find("{ id: 'xici-xia'", idx_chapters)
idx_shuogua = content.find("{ id: 'shuogua'", idx_chapters)
idx_xugua = content.find("{ id: 'xugua'", idx_chapters)
idx_zagua = content.find("{ id: 'zagua'", idx_chapters)

print(f"intro at {idx_intro}")
print(f"xici-shang at {idx_xici_shang}")
print(f"xici-xia at {idx_xici_xia}")
print(f"shuogua at {idx_shuogua}")
print(f"xugua at {idx_xugua}")
print(f"zagua at {idx_zagua}")

# ====== STEP 3: Extract intro chapter content ======
# Intro: from { id: 'intro' to the next chapter that comes after it
# After intro comes ...hexagramChapters (spread)
# Find what comes after intro's closing
intro_end = content.find("...hexagramChapters", idx_intro)
if intro_end < 0:
    # Fallback: find the }, or ` }, that closes intro
    pass

# Actually, let me find the intro content more precisely
# Intro is: { id: 'intro', title: '周易导读', content: `...` },
# It ends with `` },``
# After it is a comma/newline then `...hexagramChapters,`

# Find the intro chapter's text
intro_text = content[idx_intro:content.find('hexagramChapters', idx_intro)-1]
# Actually the intro ends before the spread
spread_idx = content.find('...hexagramChapters', idx_intro)
# Go back from spread to find the }, that closes intro
intro_close = content.rfind('},', idx_intro, spread_idx)
intro_text = content[idx_intro:intro_close+2]

print(f"Intro text: {intro_text[:100]}...{intro_text[-50:]}")

# ====== STEP 4: Extract each ten-wings chapter (first occurrence) ======
# Each ten-wings chapter ends with ` },
# We need to find the matching close for each

def extract_chapter(text, start_pos):
    """Extract a chapter object given its starting position (the {)."""
    brace_depth = 1
    in_bt = False
    i = start_pos + 1  # skip opening {
    
    while i < len(text):
        c = text[i]
        if c == '`':
            in_bt = not in_bt
        elif not in_bt:
            if c == '{':
                brace_depth += 1
            elif c == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    end = i + 1
                    if end < len(text) and text[end] == ',':
                        end += 1
                    return text[start_pos:end]
        i += 1
    return text[start_pos:start_pos]  # empty if not found

# Also need to get the metadata+preface section
# From export const zhouyiContent up to chapters: [
metadata_section = content[idx_export:idx_chapters]

print(f"\nMetadata section: {metadata_section[:200]}...{metadata_section[-100:]}")

# Get each ten-wings chapter text
shuogua_text = extract_chapter(content, idx_shuogua)
print(f"\nshuogua: {shuogua_text[:80]}...{shuogua_text[-20:] if shuogua_text else 'NOT FOUND'}")

xugua_text = extract_chapter(content, idx_xugua)
zagua_text = extract_chapter(content, idx_zagua)
xici_shang_text = extract_chapter(content, idx_xici_shang)
xici_xia_text = extract_chapter(content, idx_xici_xia)

# ====== STEP 5: Build the complete file ======
# Structure:
# header (hexagramChapters array)
# export const zhouyiContent: BookChapter = {
#   metadata: {...}
#   preface: {...}
#   chapters: [
#     intro,
#     ...hexagramChapters,
#     xici-shang (with vernacular),
#     xici-xia (with vernacular),
#     shuogua (with vernacular),
#     xugua (with vernacular),
#     zagua (with vernacular),
#   ]
# }

ten_wings = [
    ('xici-shang', xici_shang_text),
    ('xici-xia', xici_xia_text),
    ('shuogua', shuogua_text),
    ('xugua', xugua_text),
    ('zagua', zagua_text),
]

for cid, tw_text in ten_wings:
    print(f"{cid}: {len(tw_text)} bytes, starts with {tw_text[:60]}...")

# Verify all ten-wings were found
for cid, tw_text in ten_wings:
    if not tw_text or len(tw_text) < 10:
        print(f"WARNING: {cid} not found or too short!")

# Build chapters array
chapters_lines = []
chapters_lines.append("  chapters: [")
chapters_lines.append(intro_text.rstrip() + ",")
chapters_lines.append("    ...hexagramChapters,")

for cid, tw_text in ten_wings:
    # Strip any existing vernacular from the extracted text
    tw_clean = re.sub(r',\n\s*vernacular: `[^`]*`\s*\n?', '', tw_text)
    tw_clean = re.sub(r'\s*vernacular: `[^`]*`\s*', '', tw_clean)
    tw_clean = tw_clean.rstrip()
    
    if cid in VERNACULAR_MAP:
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        # Remove trailing comma if present
        if tw_clean.endswith(','):
            tw_clean = tw_clean[:-1].rstrip()
        # Find where to insert: before the final `}`
        tw_trimmed = tw_clean.rstrip()
        last_brace = tw_trimmed.rfind('}')
        if last_brace >= 0:
            before = tw_trimmed[:last_brace].rstrip()
            closing = tw_trimmed[last_brace:]  # } or },
        else:
            before = tw_trimmed
            closing = ''
        
        # Get indentation from the last line of 'before'
        last_nl = before.rfind('\n')
        indent = re.match(r'^(\s*)', before[last_nl+1:] if last_nl >= 0 else before).group(1)
        
        # Rebuild the chapter with vernacular
        chapters_lines.append(before)
        chapters_lines.append(f",\n{indent}vernacular: `{escaped}`")
        chapters_lines.append(f"\n{closing},")
    else:
        chapters_lines.append(tw_clean.rstrip() + ",")

chapters_lines.append("  ]")
chapters_lines.append("}")

chapters_text = '\n'.join(chapters_lines)

# Build complete file
output = []
output.append(header)
# Remove trailing comma from metadata section (should not end with comma)
meta_clean = metadata_section.rstrip().rstrip(',').rstrip()
output.append(meta_clean)
# chapters_text already has the opening 'chapters: [' so no extra comma needed
output.append(chapters_text)

output_text = '\n'.join(output)

# Fix the intro indentation: ensure { id: 'intro' has proper indent
output_text = re.sub(r'\n{ id: \'intro\'', r'\n    { id: \'intro\'', output_text)
# Fix consecutive commas
output_text = re.sub(r',\n,\n', r',\n', output_text)

# Verify
cnt = output_text.count('vernacular: `')
h_cnt = len(re.findall(r"\{ id: 'h\d{2}'", output_text))
tw_cnt = len(re.findall(r"\{ id: '(xici-shang|xici-xia|shuogua|xugua|zagua)'", output_text))
print(f"\nVernacular fields: {cnt}")
print(f"Hexagrams: {h_cnt}")
print(f"Ten-wings: {tw_cnt}")
print(f"Expected vernacular: {len(VERNACULAR_MAP)}")

# Write
outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

lines = output_text.split('\n')
print(f"Written: {outpath} ({len(lines)} lines)")
