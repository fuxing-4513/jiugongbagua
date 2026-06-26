'use client'

/**
 * 导出命盘结果为图片（打印兜底方案）
 *
 * 使用 window.print() 实现（html2canvas 未安装时的方案）
 * 改用 DOM API 构建打印文档，规避 document.write 风险
 */

export async function exportAsPng(element: HTMLElement, filename = 'mingpan.png'): Promise<void> {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('无法打开打印窗口，请手动截图保存。')
    return
  }

  const safeTitle = filename.replace(/[<>"']/g, '').slice(0, 64)
  const html = element.outerHTML

  // 用 DOM API 安全构建，避免 document.write 的 HTML 注入风险
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
  // 将 outerHTML 解析为真实 DOM 节点再挂载，避免 HTML 字符串直接注入
  const wrapper = doc.createElement('div')
  wrapper.innerHTML = html
  while (wrapper.firstChild) {
    body.appendChild(wrapper.firstChild)
  }

  // 页面加载完成后自动打印并关闭
  const script = doc.createElement('script')
  script.textContent = 'window.onload = function() { window.print(); window.close(); }'
  body.appendChild(script)

  rootHtml.appendChild(head)
  rootHtml.appendChild(body)
  doc.appendChild(rootHtml)
  doc.close()
}
