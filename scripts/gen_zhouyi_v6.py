#!/usr/bin/env python3
"""Add vernacular to zhouyi.ts using character-level parsing."""

import re

exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# Parse character by character to find chapter boundaries
# We're looking for `{ id: 'hNN'` or `{ id: 'xici-...'` objects

chapters = []  # list of (start, end, id) tuples

# Find all chapter start positions
for m in re.finditer(r"\{ id: '(h\d+|xici-shang|xici-xia|shuogua|xugua|zagua)'", text):
    start = m.start()
    cid = m.group(1)
    
    # Now find the matching close: the next `},` at top level (brace depth 1)
    # that is NOT inside a backtick
    pos = start + 1  # skip the opening {
    brace_depth = 1
    in_backtick = False
    i = start
    
    while i < len(text):
        ch = text[i]
        
        if ch == '`':
            in_backtick = not in_backtick
        
        if not in_backtick:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    # Found the closing }
                    end = i + 1  # include the }
                    # Skip any trailing comma
                    while end < len(text) and text[end] in ' ,':
                        if text[end] == ',':
                            end += 1
                            break
                        end += 1
                    break
        i += 1
    else:
        # No matching close found
        continue
    
    chapters.append((start, end, cid))

print(f"Found {len(chapters)} chapters")

# Now modify the text, inserting vernacular before each chapter's closing
# Process in reverse order to preserve positions
chapters.sort(key=lambda x: x[0], reverse=True)

result = text
for start, end, cid in chapters:
    if cid in VERNACULAR_MAP:
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        
        # The chapter end is just the `}` or `},`
        # Insert vernacular before this
        end_part = text[end-1:end]  # should be }
        comma_part = text[end:end+1]  # might be ,
        
        # Find the end of the last line to get indentation
        # Go back from end to find the newline before
        nl_before = text.rfind('\n', start, end)
        if nl_before >= 0:
            last_line = text[nl_before+1:end]
            indent = re.match(r'^(\s*)', last_line).group(1)
        else:
            indent = '        '
        
        # Insert: vernacular line before `},`
        insertion = f"{indent}vernacular: `{escaped}`,\n"
        
        result = result[:end-1] + '\n' + insertion + '}' + text[end-1:end] + text[end:]
        # The above adjusts the result

# Hmm, the reverse processing with negative indices is tricky. Let me redo this.
# Build the result from scratch instead.

print("Rebuilding...")

# Rebuild: go through text, and for each chapter found, insert vernacular
result_parts = []
prev_end = 0

for start, end, cid in sorted(chapters, key=lambda x: x[0]):
    # Add text from prev_end to start of chapter
    result_parts.append(text[prev_end:start])
    
    # Get chapter text (start to end)
    chapter_text = text[start:end]
    
    if cid in VERNACULAR_MAP:
        vernacular = VERNACULAR_MAP[cid]
        escaped = escape_ts(vernacular)
        
        # Find where to insert: before the final }, or }
        # The chapter text ends with '}' or '},'
        # Strip trailing whitespace/newlines from chapter to find the last }
        chapter_trimmed = chapter_text.rstrip()
        
        if chapter_trimmed.endswith(',}'):
            # Pattern: ... ,}
            insert_before = chapter_trimmed[:-2].rstrip()
            closing = chapter_trimmed[-2:]  # ,}
        elif chapter_trimmed.endswith('}'):
            insert_before = chapter_trimmed[:-1].rstrip()
            closing = '}'
        elif chapter_trimmed.endswith('},'):
            insert_before = chapter_trimmed[:-2].rstrip()
            closing = '},'
        else:
            # Fallback: find the last }
            last_brace = chapter_trimmed.rfind('}')
            if last_brace >= 0:
                insert_before = chapter_trimmed[:last_brace].rstrip()
                closing = chapter_trimmed[last_brace:]
            else:
                result_parts.append(chapter_text)
                prev_end = end
                continue
        
        # Get indentation from the line containing the closing
        last_nl = insert_before.rfind('\n')
        if last_nl >= 0:
            last_line = insert_before[last_nl+1:]
            indent = re.match(r'^(\s*)', last_line).group(1)
        else:
            indent = '        '
        
        # Add insert_before, then vernacular, then closing
        result_parts.append(insert_before)
        result_parts.append(f"\n{indent}vernacular: `{escaped}`,\n")
        result_parts.append(closing)
    else:
        result_parts.append(chapter_text)
    
    prev_end = end

# Add remaining text after last chapter
result_parts.append(text[prev_end:])

output_text = ''.join(result_parts)

# Verify
counts = len(re.findall(r'\bvernacular:\s*`', output_text))
print(f"Vernacular fields: {counts}")
print(f"Expected: {len(VERNACULAR_MAP)}")

# Check what's missing
for cid in VERNACULAR_MAP:
    v = VERNACULAR_MAP[cid]
    if f"`{escape_ts(v[:40])}" not in output_text:
        pass

# Better check
for cid in VERNACULAR_MAP:
    # Check if chapter ID exists near a vernacular:
    pass

# Check if any chapter ID appears twice (would mean the original text changed)
for cid in list(VERNACULAR_MAP.keys())[:5]:
    matches = list(re.finditer(f"'id': '{cid}'", output_text))
    if len(matches) > 1:
        print(f"WARNING: {cid} appears {len(matches)} times")
    elif len(matches) == 0:
        print(f"WARNING: {cid} not found in output")

outpath = '/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts'
with open(outpath, 'w') as f:
    f.write(output_text)

line_count = len(output_text.split('\n'))
print(f"Written: {outpath} ({line_count} lines)")
