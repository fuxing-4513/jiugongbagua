import type { Metadata } from 'next'
import ProfileContent from './profile-content'

export const metadata: Metadata = {
  title: '用户中心 - 排盘记录与收藏',
  description: '管理您的八字排盘、紫微斗数等占卜记录，收藏常用工具和文章。',
}

export default function ProfilePage() {
  return <ProfileContent />
}
