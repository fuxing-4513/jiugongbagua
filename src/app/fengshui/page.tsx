import type { Metadata } from 'next'
import FengshuiClient from './FengshuiClient'

export const metadata: Metadata = {
  title: '风水罗盘 - 九宫八卦',
  description: '风水罗盘在线测算',
}

export default function Page() { return <FengshuiClient /> }
