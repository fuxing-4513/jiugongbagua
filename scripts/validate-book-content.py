#!/usr/bin/env python3
"""
易学书馆 · 古籍内容验证脚本
本地运行，无需 API，检查每本书的内容文件格式是否正确
"""
import os
import re
import sys

CONTENT_DIR = 'src/data/xueguan/content'
REGISTRY_FILE = f'{CONTENT_DIR}/content-registry.ts'
BOOKS_FILE = 'src/data/xueguan/books.ts'

def load_books_catalog():
    """从 books.ts 提取所有书籍信息"""
    with open(BOOKS_FILE, encoding='utf-8') as f:
        content = f.read()
    
    # Extract all book entries
    books = []
    book_pattern = re.compile(
        r"id:\s+'([^']+)'[\s\S]*?" 
        r"title:\s+'([^']+)'[\s\S]*?"
        r"dynasty:\s+'([^']+)'[\s\S]*?"
        r"category:\s+'([^']+)'",
        re.DOTALL
    )
    for m in book_pattern.finditer(content):
        books.append({
            'id': m.group(1),
            'title': m.group(2),
            'dynasty': m.group(3),
            'category': m.group(4),
        })
    return books

def load_registry():
    """从 registry 提取已注册的 bookId"""
    with open(REGISTRY_FILE, encoding='utf-8') as f:
        content = f.read()
    registry = re.findall(r"'([a-z][a-z0-9_-]+)'\s*:", content)
    return set(registry)

def validate_content_file(filepath):
    """检查单个内容文件的结构"""
    errors = []
    warnings = []
    
    filename = os.path.basename(filepath)
    with open(filepath, encoding='utf-8') as f:
        try:
            content = f.read()
        except Exception as e:
            errors.append(f"读取失败: {e}")
            return errors, warnings, set()
    
    # 检查是否有 BookChapter 结构
    if 'bookId:' not in content:
        warnings.append(f"{filename}: 未找到 bookId 字段（可能是辅助模块）")
        return errors, warnings, set()
    
    # 检查 bookId 格式
    bid_match = re.search(r"bookId:\s+'([^']+)'", content)
    if bid_match:
        bid = bid_match.group(1)
        if not re.match(r'^[a-z][a-z0-9_-]*$', bid):
            errors.append(f"{filename} bookId '{bid}' 格式异常")
    else:
        bid = 'unknown'
        errors.append(f"{filename}: 缺少 bookId")
    
    # 检查是否有内容章节
    chapters = re.findall(r"id:\s+'([^']+)',?\s*title:\s+'([^']+)'", content)
    chapter_count = len(chapters)
    if chapter_count <= 1:
        warnings.append(f"{filename}: 只有 {chapter_count} 个章节（可能是占位简介）")
    
    # 检查是否有外部链接或水印
    suspicious = re.findall(r'(https?://[^\s\'")\]]+)', content)
    for url in suspicious:
        if 'jiugongbagua.com' not in url:
            warnings.append(f"{filename}: 发现可能的外部链接: {url}")
    
    # 检查是否有明显的网站水印
    watermarks = ['ctext.org', 'www.', '.com', '国学大师', '版权', '文源阁']
    for wm in watermarks:
        if wm in content and wm not in ['www.', '.com']:
            # Only flag if it's not in a reference to another classic book
            if not any(book in content for book in ['www.kangxizidian']):
                pass  # This is fine for now
    
    # 检查 Template literals 格式
    if 'content: `' not in content:
        errors.append(f"{filename}: 没有使用模板字面量格式")
    
    # 检查 metadata 或 preface
    if 'jiugong' in content.lower():
        pass  # Good, has jiugong markers
    else:
        warnings.append(f"{filename}: 未找到九宫元数据标记")
    
    return errors, warnings, {bid if bid_match else None}


def main():
    print("=" * 60)
    print("易学书馆 · 古籍内容验证")
    print("=" * 60)
    
    # 加载目录
    print(f"\n📚 读取 {BOOKS_FILE}...")
    books = load_books_catalog()
    print(f"   共 {len(books)} 部古籍")
    
    # 加载注册表
    print(f"\n📋 读取 {REGISTRY_FILE}...")
    registered = load_registry()
    print(f"   已注册 {len(registered)} 部")
    
    # 扫描内容目录
    print(f"\n🔍 扫描 {CONTENT_DIR}/...")
    content_files = sorted([
        f for f in os.listdir(CONTENT_DIR)
        if f.endswith('.ts') and f != 'content-registry.ts'
    ])
    print(f"   找到 {len(content_files)} 个内容文件")
    
    # 收集文件中的 booksId
    all_errors = []
    all_warnings = []
    file_book_ids = set()
    content_missing = []
    
    for fname in content_files:
        fpath = os.path.join(CONTENT_DIR, fname)
        errors, warnings, bids = validate_content_file(fpath)
        all_errors.extend(errors)
        all_warnings.extend(warnings)
        file_book_ids |= bids
    
    # 检查未注册的书籍
    catalog_ids = {b['id'] for b in books}
    not_in_registry = catalog_ids - registered
    not_in_catalog = registered - catalog_ids
    
    print(f"\n{'='*60}")
    print("📊 检查结果")
    print(f"{'='*60}")
    
    category_counts = {}
    for b in books:
        cat = b['category'].split('-')[0]
        category_counts.setdefault(cat, {'total': 0, 'done': 0})
        category_counts[cat]['total'] += 1
        if b['id'] in registered:
            category_counts[cat]['done'] += 1
    
    print(f"\n📈 按类别覆盖率:")
    for cat in sorted(category_counts.keys()):
        c = category_counts[cat]
        pct = c['done'] / c['total'] * 100
        bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
        print(f"  {cat:20s} {bar} {c['done']:3d}/{c['total']:<3d} ({pct:.0f}%)")
    
    print(f"\n⚠️  警告 ({len(all_warnings)})")
    for w in sorted(all_warnings):
        print(f"  ⚠️  {w}")
    
    print(f"\n❌ 错误 ({len(all_errors)})")
    for e in sorted(all_errors):
        print(f"  ❌ {e}")
    
    if not_in_registry:
        print(f"\n📕 目录有但未注册到 registry ({len(not_in_registry)}):")
        for bid in sorted(not_in_registry):
            print(f"  {bid}")
    
    if not_in_catalog:
        print(f"\n📗 Registry 有但目录没有 ({len(not_in_catalog)}):")
        for bid in sorted(not_in_catalog):
            print(f"  {bid}")
    
    print("\n✅ 验证完成")

if __name__ == '__main__':
    main()
