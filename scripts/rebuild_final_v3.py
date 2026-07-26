#!/usr/bin/env python3
"""
Final rebuild v3: add vernacular to both hexagrams and ten-wings.
"""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

def strip_vernacular(s):
    """Remove all vernacular fields from text."""
    result = s
    result = re.sub(r',\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    result = re.sub(r'\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    result = re.sub(r'\n\n\n+', r'\n\n', result)
    return result

def add_vernacular_to_chapter(chapter_text, cid):
    """Add vernacular field to a chapter object (as text) just before closing `},`."""
    if cid not in VERNACULAR_MAP:
        return chapter_text
    
    # strip any existing vernacular first
    clean = strip_vernacular(chapter_text).rstrip()
    
    # Find the final `}` that closes the object
    last_brace = clean.rfind('}')
    if last_brace < 0:
        return chapter_text
    
    before = clean[:last_brace].rstrip()
    closing = clean[last_brace:]  # `}` or `},`
    
    # Get indent from last line of 'before'
    last_line = before.split('\n')[-1] if '\n' in before else ''
    indent = re.match(r'^(\s*)', last_line).group(1) if last_line else '        '
    
    vern = VERNACULAR_MAP[cid]
    escaped = escape_ts(vern)
    
    result = before + ",\n" + indent + "vernacular: `" + escaped + "`" + "\n" + closing
    return result

# ====== READ file ======
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# ====== Extract hexagram section ======
idx_hex_start = text.find('const hexagramChapters')
idx_export = text.find('export const zhouyiContent', idx_hex_start)

header = text[:idx_export]

# Strip existing vernacular from header
header_clean = strip_vernacular(header)

# Process each hexagram chapter: extract, add vernacular, reassemble
h_count = len(re.findall(r"\{ id: 'h\d{2}'", header_clean))
print(f"Custom hexagrams to process: {h_count}")

# Find each hexagram and add vernacular
header_final = header_clean

# Find hexagramChapters array
arr_start = header_final.find('[')
arr_end = header_final.rfind(']')

hex_array_content = header_final[arr_start+1:arr_end].strip()

# Process each hexagram entry
# Split by `{ id:` boundaries
hex_entries = re.split(r'(?=\{ id: \'h\d{2}\')', hex_array_content)

new_entries = []
for entry in hex_entries:
    entry = entry.strip()
    if not entry:
        continue
    m = re.match(r"\{ id: '(h\d{2})'", entry)
    if m:
        cid = m.group(1)
        entry_modified = add_vernacular_to_chapter(entry, cid)
        new_entries.append(entry_modified)
    else:
        new_entries.append(entry)

# Rebuild hexagramChapters array
rebuilt_array = "[\n" + ",\n".join(new_entries) + "\n]"

# Rebuild header
header_lines = header_final.rsplit('\n', 1)
if arr_end < len(header_final):
    header_rebuilt = header_final[:arr_start+1] + "\n" + rebuilt_array + "\n" + header_final[arr_end+1:]
else:
    header_rebuilt = header_final[:arr_start+1] + "\n" + rebuilt_array + "\n" + "]"

# Get just the hexagramChapters array definition
hex_def_start = header_final.find('const hexagramChapters')
hex_def_end = header_final.find('\n', hex_def_start)
hex_def_line = header_final[hex_def_start:hex_def_end]

# Rebuild - take everything before hexagramChapters, then custom array, then after
before_hex = header_final[:hex_def_start]
after_hex = ""  # We'll rebuild the rest

# Find where the rest starts after the hexagramChapters ] 
# The array ends with ] then the rest follows
# Original: const hexagramChapters = [...]<newline><newline>export const...
# We need to be more careful with the boundaries

# Let me rebuild the whole hexagram section
lines = []
lines.append(before_hex.rstrip())
lines.append(f"{hex_def_line} =")
lines.append(rebuilt_array)

# Everything after the hexagramChapters array (up to idx_export)
# After the closing ] of hexagramChapters
after_part = header_final[header_final.rfind(']', hex_def_start)+1:]
lines.append(after_part.rstrip())

header_rebuilt = '\n'.join(lines)

print(f"Header rebuilt: {len(re.findall(r'\{ id: \'h\d{2}\'', header_rebuilt))} hexagrams")

# ====== Build zhouyiContent ======
lines = []
lines.append("")
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

# ====== Helper: extract raw chapter from current text ======
def extract_raw_chapter(text, cid):
    idx = text.find(f"{{ id: '{cid}'")
    if idx < 0:
        return None
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
                    return text[idx:end]
        i += 1
    return None

# Intro chapter
intro_raw = extract_raw_chapter(text, 'intro')
if intro_raw:
    intro_clean = strip_vernacular(intro_raw)
    lines.append(f"    {intro_clean},")
else:
    lines.append("    { id: 'intro', title: '周易导读', content: `《周易》...` },")

# Spread
lines.append("    ...hexagramChapters,")

# Ten-wings with vernacular
for cid in ['xici-shang', 'xici-xia', 'shuogua', 'xugua', 'zagua']:
    tw_raw = extract_raw_chapter(text, cid)
    if tw_raw:
        tw_clean = strip_vernacular(tw_raw)
        tw_with_vern = add_vernacular_to_chapter(tw_clean, cid)
        # Add proper indentation (4 spaces + content indent)
        tw_indented = tw_with_vern.replace('\n', '\n    ')
        tw_indented = tw_indented.strip()
        lines.append(f"    {tw_indented},")

lines.append("  ]")
lines.append("}")

content_section = '\n'.join(lines)

# ====== Combine ======
output_text = header_rebuilt + content_section

# Clean up: remove double commas
output_text = re.sub(r',\s*,', ',', output_text)

# ====== VERIFY ======
cnt = output_text.count('vernacular: `')
h_cnt = len(re.findall(r"\{ id: 'h\d{2}'", output_text))
tw_cnt = len(re.findall(r"\{ id: '(xici-shang|xici-xia|shuogua|xugua|zagua)'", output_text))

print(f"\nVernacular fields: {cnt}")
print(f"Hexagrams: {h_cnt}")
print(f"Ten-wings: {tw_cnt}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# ====== WRITE ======
outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = output_text.count('\n') + 1
print(f"\nWritten: {outpath} ({line_count} lines)")
