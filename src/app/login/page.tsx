import type { Metadata } from 'next'
import AuthClient from './AuthClient'

export const metadata: Metadata = {
  title: '登录 · 我的命盘 · 九宫',
  description: '登录九宫八卦，云端保存你的排盘记录——随时回看，或把命盘摘要发给顾问做深度解读。',
}

export default function LoginPage() {
  return <AuthClient />
}
