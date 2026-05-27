import type { Metadata } from 'next'
import MeihuaClient from './MeihuaClient'

export const metadata: Metadata = {
  title: '梅花易数 - 九宫八卦',
  description: '梅花易数在线测算',
}

export default function Page() { return <MeihuaClient /> }
