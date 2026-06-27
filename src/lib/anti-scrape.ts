// 防爬虫：数据路径编码表
// 运行时解码真实文件名，不暴露明文路径

// 前缀和后缀不直接写死在字符串中，而是通过简单运算得到
// 使 bundle 中的可提取特征进一步减少
function makePrefix(): string {
  // c5dc0cc7
  const a = 'c5dc', b = '0cc7';
  return a + b;
}

function makeHash(): string {
  // c3526e2d
  const a = 'c3', b = '526e', c = '2d';
  return a + b + c;
}

function decode(s: string): string {
  // 简单逆序检测：如果有关键前导码则反转处理
  if (s.startsWith('_$__rv_')) return s.slice(6).split('').reverse().join('');
  return s;
}

const PREFIX = makePrefix();
const HASH = makeHash();

// 文件名段通过拼接而不是完整字符串来避免被 grep 匹配
type FileKey = keyof typeof FILE_MAP;

const FILE_MAP = {
  kangxi:        `${PREFIX}-kangxi-${HASH}`,
  dreams:        `${PREFIX}-dreams-${HASH}`,
  dreamBackup:   `${PREFIX}-dreams_backup_454-ignore`,
  wxList:        `${PREFIX}-wuxing-list-${HASH}`,
  wxSummary:     `${PREFIX}-wuxing-summary-${HASH}`,
  wxJin:         `${PREFIX}-wuxing-jin-${HASH}`,
  wxMu:          `${PREFIX}-wuxing-mu-${HASH}`,
  wxShui:        `${PREFIX}-wuxing-shui-${HASH}`,
  wxHuo:         `${PREFIX}-wuxing-huo-${HASH}`,
  wxTu:          `${PREFIX}-wuxing-tu-${HASH}`,
  wxDetailJin:   `${PREFIX}-wuxing-detail-jin-${HASH}`,
  wxDetailMu:    `${PREFIX}-wuxing-detail-mu-${HASH}`,
  wxDetailShui:  `${PREFIX}-wuxing-detail-shui-${HASH}`,
  wxDetailHuo:   `${PREFIX}-wuxing-detail-huo-${HASH}`,
  wxDetailTu:    `${PREFIX}-wuxing-detail-tu-${HASH}`,
};

/** 获取混淆后的数据文件路径 */
export function dataPath(key: string): string {
  const fname = FILE_MAP[key as FileKey];
  if (!fname) throw new Error(`Unknown data key: ${key}`);
  return `/data/${decode(fname)}.json`;
}

/** 获取五行系列文件名（支持动态火金木水土） */
export function wxListPath(el: string): string {
  return dataPath(`wx${el.charAt(0).toUpperCase() + el.slice(1)}`);
}

export function wxDetailPath(el: string): string {
  return dataPath(`wxDetail${el.charAt(0).toUpperCase() + el.slice(1)}`);
}
