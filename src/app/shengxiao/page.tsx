import type { Metadata } from 'next'
import ShengxiaoClient from './ShengxiaoClient'

export const metadata: Metadata = {
  title: '十二生肖百科',
  description: '十二生肖百科大全，子鼠丑牛寅虎卯兔辰龙巳蛇午马未羊申猴酉鸡戌狗亥猪。十二生肖起源传说、性格特征、文化象征、运势解析。',
  keywords: '十二生肖,生肖百科,生肖运势,生肖性格,鼠牛虎兔龙蛇马羊猴鸡狗猪',
  openGraph: { title: '十二生肖百科', description: '十二生肖百科大全，子鼠丑牛寅虎卯兔辰龙巳蛇午马未羊申猴酉鸡戌狗亥猪。生肖起源传说、性格特征。' },
  alternates: { canonical: 'https://jiugongbagua.com/shengxiao', languages: { 'zh-CN': 'https://jiugongbagua.com/shengxiao', 'zh-TW': 'https://jiugongbagua.com/shengxiao?lang=zh-TW',  } },
}

export default function ShengxiaoPage() { return <ShengxiaoClient /> }