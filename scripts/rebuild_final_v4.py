#!/usr/bin/env python3
"""
Final rebuild v4: add vernacular to both hexagrams and ten-wings.
"""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

def strip_vernacular(s):
    result = s
    result = re.sub(r',\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    result = re.sub(r'\n\s*vernacular: `(?:[^`]|\\`)*`\s*,?\s*\n?', r'\n', result)
    result = re.sub(r'\n\n\n+', r'\n\n', result)
    return result

def add_vernacular_to_chapter(chapter_text, cid):
    if cid not in VERNACULAR_MAP:
        return chapter_text
    clean = strip_vernacular(chapter_text).rstrip()
    last_brace = clean.rfind('}')
    if last_brace < 0:
        return chapter_text
    before = clean[:last_brace].rstrip()
    closing = clean[last_brace:]
    last_line = before.split('\n')[-1] if '\n' in before else ''
    indent = re.match(r'^(\s*)', last_line).group(1) if last_line else '        '
    vern = VERNACULAR_MAP[cid]
    escaped = escape_ts(vern)
    return before + ",\n" + indent + "vernacular: `" + escaped + "`" + "\n" + closing

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

# ====== READ ======
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# ====== Process hexagram section ======
idx_hex_start = text.find('const hexagramCharters')
idx_export = text.find('export const zhouyiContent', idx_hex_start)

header = text[:idx_export]
header_clean = strip_vernacular(header)

# Find the hexagramCharters array within the header
# Pattern: const hexagramCharters = [ ... ]
arr_start = header_clean.find('= [')
if arr_start < 0:
    arr_start = header_clean.find('=[')
array_brace_start = header_clean.find('[', arr_start)
array_brace_end = header_clean.rfind(']')

print(f"Array boundaries: {array_brace_start} to {array_brace_end}")

before_array = header_clean[:array_brace_start+1]  # includes the [
array_content = header_clean[array_brace_start+1:array_brace_end]
after_array = header_clean[array_brace_end:]  # includes the ]

# Split array content by hexagram entries
import re
hex_entries = re.split(r'(?=\{ id: \'h\d{2}\')', array_content.strip())

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

# Join with commas (each entry is self-contained including trailing comma)
# Actually the entries might already have commas. Let's join without extra commas
joined = ',\n'.join(new_entries)
rebuilt_array = "[\n" + joined + "\n]"

# Build the complete header
# Take everything up to and including 'const hexagramCharters ='
hex_def_end = header_clean.find('=', arr_start)  # the = sign  
hex_def_line_end = header_clean.find('\n', arr_start)
const_line = header_clean[:hex_def_line_end+1].rstrip().rstrip('=').rstrip()
rest_before = header_clean[:arr_start]  # everything up to the = [
# Actually simpler: just find the const line and rebuild

# Parse the header
lines = header_clean.split('\n')
const_found = False
output_header = []
for line in lines:
    if line.startswith('const hexagramCharters') or line.startswith('const hexagramCharters'):
        const_found = True
        output_header.append("const hexagramCharters =")
    elif const_found and line.strip() == '[':
        # Skip the opening bracket line (we'll use our own)
        pass
    elif const_found and line.strip() == ']':
        # We've reached the end of the array
        output_header.append(rebuilt_array)
        const_found = False
    elif not const_found:
        output_header.append(line)
    # else: skip lines inside the old array

header_rebuilt = '\n'.join(output_header)

print(f"Header hexagrams: {len(re.findall(r'\\{ id: \\'h\\d{2}\\'', header_rebuilt))}")

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
        tw_indented = tw_with_vern.replace('\n', '\n    ')
        tw_indented = tw_indented.strip()
        lines.append(f"    {tw_indented},")

lines.append("  ]")
lines.append("}")

content_section = '\n'.join(lines)

# ====== Combine ======
output_text = header_rebuilt + content_section

# Clean up
output_text = re.sub(r',\s*,', ',', output_text)
output_text = re.sub(r'\n\n\n+', r'\n\n', output_text)

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
