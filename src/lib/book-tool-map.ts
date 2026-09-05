// 古籍分类 → 本站工具映射（书页"相关工具"——知识到应用的打通）
export interface ToolLink { href: string; title: string; emoji: string }

export const CATEGORY_TOOLS: Record<string, ToolLink[]> = {
  'mingli-bazi': [
    { href: '/bazi', title: '八字排盘', emoji: '📊' },
    { href: '/chenggu', title: '称骨算命', emoji: '⚖️' },
  ],
  'mingli-ziwei': [
    { href: '/ziwei', title: '紫微斗数', emoji: '🌟' },
  ],
  'mingli-he-luo': [
    { href: '/heluo', title: '河洛理数', emoji: '📐' },
  ],
  'bushi-yijing': [
    { href: '/liuyao', title: '六爻起卦', emoji: '🪙' },
    { href: '/lingqian', title: '灵签', emoji: '🎋' },
  ],
  'bushi-qimen': [
    { href: '/qimen', title: '奇门遁甲', emoji: '🧭' },
  ],
  'bushi-meihua': [
    { href: '/meihua', title: '梅花易数', emoji: '🌸' },
  ],
  'bushi-liuren': [
    { href: '/xiaoliuren', title: '小六壬', emoji: '🕯️' },
  ],
  'xiangshu-guanshi': [
    { href: '/mianxiang', title: '面相分析', emoji: '👤' },
  ],
  'fengshui-xingshi': [
    { href: '/fengshui', title: '风水罗盘', emoji: '🧿' },
  ],
  'jiemeng-shiyao': [
    { href: '/jiemeng', title: '周公解梦', emoji: '🌙' },
  ],
  'daojia-jingdian': [
    { href: '/wuyun', title: '五运六气', emoji: '🌗' },
  ],
  'zaji-zeri': [
    { href: '/huangli', title: '黄历宜忌', emoji: '📅' },
    { href: '/hehun', title: '合婚', emoji: '💑' },
  ],
  'xifang-zhanxing': [
    { href: '/astro', title: '西方占星', emoji: '🔮' },
  ],
}
