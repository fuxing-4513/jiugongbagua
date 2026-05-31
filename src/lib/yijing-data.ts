// 易经64卦数据
export interface YaoCi { name: string; orig: string; modern: string; }
export interface GuaData { id: number; name: string; fullName: string; upper: string; lower: string; guaci_orig: string; guaci_modern: string; tuan_orig: string; tuan_modern: string; xiang_orig: string; xiang_modern: string; yaoci: YaoCi[]; }
export const YIJING_DATA: Record<number, GuaData> = {};
