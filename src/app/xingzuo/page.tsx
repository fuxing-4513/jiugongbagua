import type { Metadata } from 'next'
import XingzuoClient from './XingzuoClient'

export const metadata: Metadata = {
  title: '星座占卜 - 九宫八卦',
  description: '星座占卜在线测算',
}

export default function Page() { return <XingzuoClient /> }
