import type { Metadata } from 'next'
import CardsContent from './content'

export const metadata: Metadata = {
  title: '塔罗牌义大全 - 78张韦特塔罗牌详解',
  description: '韦特塔罗78张牌义完整解读，大阿尔卡纳22张、小阿尔卡纳56张。牌义解析、正逆位含义、关键词解读。',
}

export default function CardsPage() {
  return <CardsContent />
}
