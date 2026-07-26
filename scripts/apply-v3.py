import json, re

# Step 1: Add books
with open('scripts/extra-books.json', 'r') as f:
    new_books = json.load(f)

def ts_val(v):
    if isinstance(v, str):
        escaped = v.replace("'", "\\'")
        return f"'{escaped}'"
    elif isinstance(v, bool):
        return str(v).lower()
    elif isinstance(v, list):
        items = ", ".join(ts_val(x) for x in v)
        return f"[{items}]"
    else:
        return str(v)

def book_to_ts(book):
    lines = ["  {"]
    for field in ['id', 'title', 'author', 'dynasty', 'category', 'summary', 'description',
                  'keywords', 'volumes', 'isComplete', 'estimatedChars', 'order', 'related']:
        if field in book and book[field] is not None:
            lines.append(f"    {field}: {ts_val(book[field])},")
    lines.append("  },")
    return '\n'.join(lines)

# Read current books.ts
with open('src/data/xueguan/books.ts', 'r') as f:
    content = f.read()

# Insert before utility functions section
func_pos = content.rfind('// ============================================================\n// 工具函数')
last_close = content.rfind('\n]', 0, func_pos)

if last_close > 0:
    ts_entries = '\n'.join(book_to_ts(b) for b in new_books)
    header = '\n\n  // ============================================================\n  // 新增补遗（第三轮 · 广度再扩展 · 20部）\n  // ============================================================\n\n'
    content = content[:last_close] + ',' + header + ts_entries + '\n' + content[last_close+1:]
    
with open('src/data/xueguan/books.ts', 'w') as f:
    f.write(content)
print(f"Added {len(new_books)} books to catalog")

# Step 2: Regenerate book-ids.ts
books_entries = []
lines = content.split('\n')
current = {}
for i, line in enumerate(lines):
    m_id = re.match(r"^    id: '([^']+)'", line)
    m_cat = re.match(r"^    category: '([^']+)'", line)
    if m_id:
        current = {'id': m_id.group(1)}
    elif m_cat and current:
        current['category'] = m_cat.group(1)
        books_entries.append(current)
        current = {}

ts_list = '\n'.join(f'  {{ category: "{b["category"]}", id: "{b["id"]}" }},' for b in books_entries)
with open('src/data/xueguan/book-ids.ts', 'w') as f:
    f.write(f'''export interface BookIdEntry {{
  category: string
  id: string
}}
export const allBookIds: BookIdEntry[] = [
{ts_list}
]
''')
print(f"Regenerated book-ids.ts with {len(books_entries)} entries")
