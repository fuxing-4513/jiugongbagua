import type { Metadata } from 'next'
import FengshuiClient from './FengshuiClient'

export const metadata: Metadata = {
  title: '风水罗盘在线',
  description: '风水罗盘在线工具，传统风水罗盘指南针，包含八卦方位、二十四山、九宫飞星等风水基础知识。',
  keywords: '风水罗盘,罗盘在线,风水,二十四山,八卦方位',
  openGraph: { title: '风水罗盘在线', description: '风水罗盘在线工具，传统风水罗盘指南针，包含八卦方位、二十四山等风水知识。' },
  alternates: { canonical: 'https://jiugongbagua.com/fengshui', languages: { 'zh-CN': 'https://jiugongbagua.com/fengshui', 'zh-TW': 'https://jiugongbagua.com/fengshui?lang=zh-TW',  } },
}

export default function FengshuiPage() { return <FengshuiClient /> }