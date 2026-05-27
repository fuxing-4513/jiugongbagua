import re

with open('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Map emojis to routes
replacements = [
    ('🧭', '/fengshui'),
    ('⚖️', '/chenggu'),
    ('🐉', '/shengxiao'),
    ('♈', '/xingzuo'),
    ('🌀', '/qimen'),
    ('🌸', '/meihua'),
    ('🏮', '/lingqian'),
]

for emoji, route in replacements:
    old = f"emoji: '{emoji}', href: '#'"
    new = f"emoji: '{emoji}', href: '{route}'"
    c = c.replace(old, new)

with open('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

remaining = c.count("href: '#'")
print(f'Done. {remaining} # hrefs remaining')
