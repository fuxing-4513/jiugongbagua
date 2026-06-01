// ============================================================
// vip-config.ts — VIP Feature Configuration
// ============================================================

export interface VipFeature {
  key: string;
  name: string;
  icon: string;
}

export type VIPFeatureKey =
  | 'lifetime_reading'
  | 'decade_fortune'
  | 'yearly_guide'
  | 'monthly_guide'
  | 'naming_consult'
  | 'marriage_match'
  | 'master_consult';

export const vipFeatures: Record<VIPFeatureKey, VipFeature> = {
  lifetime_reading: { key:'lifetime_reading', name:'终身命盘解读', icon:'🔮' },
  decade_fortune:  { key:'decade_fortune',  name:'十年大运详批', icon:'📈' },
  yearly_guide:    { key:'yearly_guide',    name:'流年运势指南', icon:'🗓️' },
  monthly_guide:   { key:'monthly_guide',   name:'月度运势报告', icon:'📋' },
  naming_consult:  { key:'naming_consult',  name:'姓名学咨询',   icon:'✍️' },
  marriage_match:  { key:'marriage_match',  name:'八字合婚配对', icon:'💑' },
  master_consult:  { key:'master_consult',  name:'大师一对一咨询', icon:'🧘' },
};

export function isFeatureVIP(key: string): boolean {
  return key in vipFeatures;
}

export function getVipFeature(key: string): VipFeature | undefined {
  return (vipFeatures as Record<string, VipFeature>)[key];
}

export function getAllVipFeatureKeys(): VIPFeatureKey[] {
  return Object.keys(vipFeatures) as VIPFeatureKey[];
}
