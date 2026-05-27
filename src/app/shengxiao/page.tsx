import type { Metadata } from 'next'
import ShengxiaoClient from './ShengxiaoClient'

export const metadata: Metadata = {
  title: '生肖运势 - 九宫八卦',
  description: '生肖运势在线测算',
}

export default function Page() { return <ShengxiaoClient /> }
