import type { Metadata } from 'next'
import ChengguClient from './ChengguClient'

export const metadata: Metadata = {
  title: '称骨算命 - 九宫八卦',
  description: '袁天罡称骨算命，根据出生年月日时骨重测算命运。',
}

export default function Page() { return <ChengguClient /> }
