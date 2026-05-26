import type { Metadata } from 'next'
import ExpertsClient from './ExpertsClient'

export const metadata: Metadata = {
  title: '专家预约 - 九宫八卦',
  description: '平台汇集多位资深命理专家，提供八字、紫微斗数、塔罗占卜、六爻占卜等专业命理咨询服务。',
  openGraph: {
    title: '专家预约 - 九宫八卦',
    description: '资深命理专家在线咨询预约。',
  },
}

export default function ExpertsPage() {
  return <ExpertsClient />
}
