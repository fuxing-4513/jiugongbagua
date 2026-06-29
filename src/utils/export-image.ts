'use client'

/**
 * 导出命盘结果为图片（打印兜底方案）
 *
 * 使用 window.print() 实现（html2canvas 未安装时的方案）
 * 改用 DOM API + cloneNode 构建打印文档，规避 innerHTML XSS 风险
 */

export async function exportAsPng(element: HTMLElement, filename = 'mingpan.png'): Promise<void> {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('无法打开打印窗口，请手动截图保存。')
    return
  }

  const safeTitle = filename.replace(/[<>"']/g, '').slice(0, 64)

  // 用 DOM cloneNode + 安全过滤构建打印文档
  const doc = printWindow.document
  const rootHtml = doc.createElement('html')
  
  const head = doc.createElement('head')
  const title = doc.createElement('title')
  title.textContent = safeTitle
  head.appendChild(title)
  
  const style = doc.createElement('style')
  style.textContent = `
    body { background: #faf9f6; padding: 20px; font-family: serif; }
    @media print { body { padding: 0; } }
    .flex { display: flex; }
    button { display: none !important; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
  `
  head.appendChild(style)

  const body = doc.createElement('body')
  // 安全克隆，去除脚本和危险元素
  const safeClone = element.cloneNode(true) as HTMLElement
  safeClone.querySelectorAll('script, button, iframe, object, embed').forEach(el => el.remove())
  body.appendChild(safeClone)

  // 去除所有 on* 属性（HTML 事件处理器）
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, null)
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement
    Array.from(el.attributes).forEach(attr => {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
    })
  }

  rootHtml.appendChild(head)
  rootHtml.appendChild(body)
  doc.appendChild(rootHtml)
  doc.close()
}
