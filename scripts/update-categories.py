import re

with open('src/data/xueguan/categories.ts', 'r') as f:
    content = f.read()

# Insert 医易运气 between 道家玄理 (order 5) and 解梦释兆 (order 6)
insert_point = content.find("""  {
    id: 'jiemeng',""")
if insert_point < 0:
    print("ERROR: could not find jiemeng section")
else:
    new_section = """  {
    id: 'yiyi',
    name: '医易运气',
    desc: '易医同源，五运六气与中医数理',
    emoji: '\U0001f52c',
    order: 7,
    children: [
      { id: 'yiyi-wuyun', name: '五运六气', desc: '天地气运流转与人体健康', emoji: '\U0001f32a\ufe0f', order: 1 },
      { id: 'yiyi-jingdian', name: '医易经典', desc: '易学与中医结合的典籍', emoji: '\U0001f4d7', order: 2 },
      { id: 'yiyi-maizhen', name: '脉诊命理', desc: '以脉象推演健康与命运', emoji: '\U0001fac0', order: 3 },
    ]
  },
  """
    content = content[:insert_point] + new_section + content[insert_point:]

# Update orders of subsequent categories
replacements = [
    ('order: 6', 'order: 8'),   # jiemeng was 6, now 8
    ('order: 7', 'order: 9'),   # zashu was 7, now 9  
    ('order: 8', 'order: 10'),  # western was 8, now 10
]
for old_order, new_order in replacements:
    content = content.replace(old_order, new_order, 1)

with open('src/data/xueguan/categories.ts', 'w') as f:
    f.write(content)
print("Categories updated")
