import type { Metadata } from 'next'
import LingqianClient from './LingqianClient'

export const metadata: Metadata = {
  title: '灵签占卜 - 九宫八卦',
  description: '灵签占卜在线测算',
}

export default function Page() { return <LingqianClient /> }
