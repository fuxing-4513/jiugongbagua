// 防爬虫：数据路径编码表
// 运行时解码真实文件名，不暴露明文路径

const PREFIX = 'c5dc0cc7';
const HASH = 'c3526e2d';

// 文件映射表：key → 真实文件名
const FILE_MAP: Record<string, string> = {
  kangxi: `${PREFIX}-kangxi-${HASH}`,
  dreams: `${PREFIX}-dreams-${HASH}`,
  dreamBackup: `${PREFIX}-dreams_backup_454-ignore`,
  wxList: `${PREFIX}-wuxing-list-${HASH}`,
  wxSummary: `${PREFIX}-wuxing-summary-${HASH}`,
  wxJin: `${PREFIX}-wuxing-jin-${HASH}`,
  wxMu: `${PREFIX}-wuxing-mu-${HASH}`,
  wxShui: `${PREFIX}-wuxing-shui-${HASH}`,
  wxHuo: `${PREFIX}-wuxing-huo-${HASH}`,
  wxTu: `${PREFIX}-wuxing-tu-${HASH}`,
  wxDetailJin: `${PREFIX}-wuxing-detail-jin-${HASH}`,
  wxDetailMu: `${PREFIX}-wuxing-detail-mu-${HASH}`,
  wxDetailShui: `${PREFIX}-wuxing-detail-shui-${HASH}`,
  wxDetailHuo: `${PREFIX}-wuxing-detail-huo-${HASH}`,
  wxDetailTu: `${PREFIX}-wuxing-detail-tu-${HASH}`,
};

/** 获取混淆后的数据文件路径 */
export function dataPath(key: string): string {
  const fname = FILE_MAP[key];
  if (!fname) throw new Error(`Unknown data key: ${key}`);
  return `/data/${fname}.json`;
}

/** 获取五行系列文件名（支持动态火金木水土） */
export function wxListPath(el: string): string {
  return dataPath(`wx${el.charAt(0).toUpperCase() + el.slice(1)}`);
}

export function wxDetailPath(el: string): string {
  return dataPath(`wxDetail${el.charAt(0).toUpperCase() + el.slice(1)}`);
}
