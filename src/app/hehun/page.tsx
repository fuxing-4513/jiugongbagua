import type { Metadata } from 'next'
import HehunClient from './HehunClient'

export const metadata: Metadata = {
  title: '八字合婚配对免费',
  description: '八字合婚免费配对测试，基于双方生辰八字分析婚姻缘分、五行互补、十神配对，合婚择吉参考。',
  keywords: '八字合婚,合婚配对,婚姻测算,八字配对,婚配',
  openGraph: { title: '八字合婚配对免费', description: '八字合婚免费配对测试，基于双方生辰八字分析婚姻缘分、五行互补。' },
  alternates: { canonical: 'https://jiugongbagua.com/hehun', languages: { 'zh-CN': 'https://jiugongbagua.com/hehun', 'zh-TW': 'https://jiugongbagua.com/hehun?lang=zh-TW', 'en': 'https://jiugongbagua.com/hehun?lang=en' } },
}

export default function HehunPage() { return <HehunClient /> }