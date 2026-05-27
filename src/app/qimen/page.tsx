import type { Metadata } from 'next'
import QimenClient from './QimenClient'

export const metadata: Metadata = {
  title: '奇门遁甲 - 九宫八卦',
  description: '奇门遁甲在线测算',
}

export default function Page() { return <QimenClient /> }
