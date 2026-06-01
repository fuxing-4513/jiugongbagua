import type { Metadata } from 'next';
import AppClient from './AppClient';

export const metadata: Metadata = {
  title: 'AI 排盘 - 九宫八卦',
  description: '智能命理排盘系统，支持八字、紫微斗数、六爻等多种排盘方式，AI辅助解读命盘。',
};

export default function AppPage() {
  return <AppClient />;
}
