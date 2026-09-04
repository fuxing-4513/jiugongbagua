import type { Metadata } from 'next'
import QimenClient from './QimenClient'

export const metadata: Metadata = {
  title: '奇门遁甲在线排盘（时家·拆补法）',
  description: '奇门遁甲时家排盘：输入公历时间即排完整盘局——四柱干支、节气定局（拆补法）、九宫地盘天盘、八门九星八神暗干，附白话解读与吉凶方位参考。',
  keywords: '奇门遁甲,时家奇门,排盘,拆补法,奇门预测,遁甲,八门九星,择时,择日',
  openGraph: { title: '奇门遁甲在线排盘（时家·拆补法）', description: '输入公历时间即排完整时家奇门盘：四柱、节气定局、九宫全盘与白话解读。' },
  alternates: { canonical: 'https://jiugongbagua.com/qimen', languages: { 'zh-CN': 'https://jiugongbagua.com/qimen', 'zh-TW': 'https://jiugongbagua.com/qimen?lang=zh-TW',  } },
}

export default function QimenPage() { return <QimenClient /> }