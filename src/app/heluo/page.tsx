import type { Metadata } from 'next';
import HeluoClient from './HeluoClient';

export const metadata: Metadata = {
  title: '河洛推命',
  description: '河图洛书数理推命，天地之数定乾坤。输入生辰八字，推算河洛数理，揭示命运玄机。',
};

export default function HeluoPage() {
  return <HeluoClient />;
}
