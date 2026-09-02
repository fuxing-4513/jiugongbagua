import type { Metadata } from 'next'
import LiuyaoClient from './LiuyaoClient'

export const metadata: Metadata = {
  title: '六爻在线免费',
  description: '六爻在线起卦解卦，传统纳甲筮法，输入三个数字或随机起卦，分析卦象爻辞、世应、用神，预测吉凶。',
  keywords: '六爻,免费起卦,纳甲筮法,周易,卦象解卦',
  openGraph: { title: '六爻在线免费', description: '六爻在线起卦解卦，传统纳甲筮法，输入三个数字或随机起卦。' },
  alternates: { canonical: 'https://jiugongbagua.com/liuyao', languages: { 'zh-CN': 'https://jiugongbagua.com/liuyao', 'zh-TW': 'https://jiugongbagua.com/liuyao?lang=zh-TW',  } },
}

export default function LiuyaoPage() { return <LiuyaoClient /> }