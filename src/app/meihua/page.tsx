import type { Metadata } from 'next'
import MeihuaClient from './MeihuaClient'

export const metadata: Metadata = {
  title: '梅花易数',
  description: '梅花易数在线起卦，基于数字、农历、公历、万物类象等多种起卦方式，64卦断辞详解。',
  keywords: '梅花易数,起卦,易经,64卦,邵雍',
  openGraph: { title: '梅花易数', description: '梅花易数在线起卦，基于数字、农历、公历、万物类象等多种起卦方式。' },
  alternates: { canonical: 'https://jiugongbagua.com/meihua', languages: { 'zh-CN': 'https://jiugongbagua.com/meihua', 'zh-TW': 'https://jiugongbagua.com/meihua?lang=zh-TW',  } },
}

export default function MeihuaPage() { return <MeihuaClient /> }