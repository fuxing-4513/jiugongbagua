#!/usr/bin/env python3
"""
Clean approach: read original file, find each chapter by its { id: pattern,
count backtick depth accurately, insert vernacular before the line that closes the chapter.
"""

import re, sys

# Load vernacular map
exec_globals = {}
with open('/home/openclaw/.openclaw/workspace/temp_repo/scripts/add_vernacular.py', 'r') as f:
    exec(f.read(), exec_globals)
VERNACULAR_MAP = exec_globals['VERNACULAR_MAP']

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

# Read current file (which may have bad vernacular from v7)
# We need the original, but let's first remove all vernacular lines from the file
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'r') as f:
    text = f.read()

# Remove any inserted vernacular lines and fix commas
# Pattern: a line that starts with whitespace, then `vernacular: \`...`, then comma
# This is tricky because the vernacular content is multiline.
# Let's just take a fresh approach - I'll reconstruct the file from the v7 output
# by removing all vernacular fields

# Simpler: just filter out lines that match `vernacular:`
lines = text.split('\n')
clean_lines = []
in_vernacular = False
for line in lines:
    if line.strip().startswith('vernacular:') and '`' in line:
        # This is a vernacular line
        in_vernacular = True
        # Check if the backtick closes on this line or continues
        bt_count = line.count('`')
        if bt_count >= 2:
            in_vernacular = False
        # Don't add this line
        continue
    
    if in_vernacular:
        # Still inside vernacular backtick
        bt_count = line.count('`')
        if bt_count >= 1:
            in_vernacular = False
        continue
    
    clean_lines.append(line)

clean_text = '\n'.join(clean_lines)

# Write cleaned version
with open('/home/openclaw/.openclaw/workspace/temp_repo/src/data/xueguan/content/zhouyi.ts', 'w') as f:
    f.write(clean_text)

print(f"Cleaned file: {len(clean_text.split(chr(10)))} lines")
