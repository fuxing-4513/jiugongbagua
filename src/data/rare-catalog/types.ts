// 珍稀馆藏著录库 · 统一类型
export interface RareEntry {
  id: string                 // 站内唯一 slug（如 p3507-kan-yu）
  // ── 原书信息 ──
  title: string              // 原书名/题名（如《宅经》残卷）
  altNames?: string[]        // 异名
  author?: string            // 作者（可考者；未知填佚名）
  era: string                // 年代（如唐五代·10世纪）
  docType: string            // 文献类型（历书/宅经/梦书/道经…）
  category: string           // 玄学分类（风水/占梦/星占/道教/择日…）
  // ── 馆藏信息 ──
  country: string            // 海外国家
  institution: string        // 馆藏机构
  shelfmark: string          // 馆藏号（P.3507 / S.… / Or.8210/…）
  volumes?: string           // 卷数/残存
  completeness: string
  // ── 存藏状态（精确口径——不作"大陆没有"断言）──
  cnStatus: string           // 大陆存藏状态：大陆有同书/大陆无同版/原书已佚海外存残/待核
  isSole?: boolean           // 海内外孤本（有依据才标 true）
  isLost?: boolean           // 原书已佚（仅海外存残卷）
  // ── 数字资源 ──
  hasDigitalImage: boolean   // 是否有官方高清图
  officialLink?: string      // 官方入口（馆方/IDP/Gallica）
  // ── 版权与考订 ──
  rightsNote: string         // 版权状态说明
  kaoding: string[]          // 【九宫按】考订（原创——标注依据/存疑）
  relatedBookIds?: string[]  // 关联本馆已收古籍（book-ids）
  verifiedAt: string         // 核实日期（YYYY-MM-DD；未在线复核标"待复核"）
  priority: number           // 采集优先级 1-5
  // ── 录文（不造假原则：仅收公版/开放授权录文——无源不填）──
  luwen?: {
    source: string           // 录文底本与来源（馆藏原卷/公版录文集/开放授权）
    text: string[]           // 录文段落（分段）
    notes?: string           // 校勘/说明
  }
}
