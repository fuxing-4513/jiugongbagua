import type { Metadata } from 'next'
import XingmingClient from './XingmingClient'

export const metadata: Metadata = {
  title: '姓名测试打分免费',
  description: '姓名测试打分免费在线工具，基于五格数理、三才配置、五行属性分析姓名吉凶，起名改名参考。',
  keywords: '姓名测试,姓名打分,起名,五格数理,三才配置',
  openGraph: { title: '姓名测试打分免费', description: '姓名测试打分免费在线工具，基于五格数理、三才配置分析姓名吉凶。' },
  alternates: { canonical: 'https://jiugongbagua.com/xingming', languages: { 'zh-CN': 'https://jiugongbagua.com/xingming', 'zh-TW': 'https://jiugongbagua.com/xingming?lang=zh-TW',  } },
}

export default function XingmingPage() { return <XingmingClient /> }