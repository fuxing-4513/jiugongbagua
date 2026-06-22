'use client'

/**
 * 导出命盘结果为图片
 *
 * 使用 window.print() 实现（html2canvas 未安装时的兜底方案）
 */

export async function exportAsPng(element: HTMLElement, filename = 'mingpan.png'): Promise<void> {
  // html2canvas not installed; use print fallback
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('无法打开打印窗口，请手动截图保存。')
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>命盘导出</title>
        <style>
          body { background: #faf9f6; padding: 20px; font-family: serif; }
          @media print { body { padding: 0; } }
          .flex { display: flex; }
          .hidden { display: none !important; }
          button { display: none !important; }
          img { max-width: 100%; }
          table { border-collapse: collapse; width: 100%; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
