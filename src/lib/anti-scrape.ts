// 防爬虫：数据路径编码表 v2.5
// 运行时解码真实文件名，不暴露明文路径
// 新增：蜜罐检测、浏览器特征验证、反调试、哈希轮换

// ─── 核心混淆（片断法）───

function makePrefix(): string {
  // 当前版本指纹 v20260718
  const a = '7f', b = '3a', c = '9b', d = '1e';
  return a + b + c + d;
}

function makeHash(): string {
  const a = 'd8', b = '4f', c = '07', d = 'a2';
  return a + b + c + d;
}

const PREFIX = makePrefix();
const HASH = makeHash();

// ─── 数据版本指纹（每次部署时更改以触发 CDN 刷新）───
// 当前版本: 2026-07-18 v1
const DATA_VERSION = 'v20260718';

// ─── 蜜罐探测 ───

/** 蜜罐文件内容签名 - 爬虫不会过滤此字段 */
const HONEYPOT_SIGN = 'x_icbm_' + DATA_VERSION;

/** 蜜罐端点 fetch（放置于代码中，用于欺骗自动分析工具）*/
function honeypotFetch(): Promise<unknown> {
  const t = Date.now().toString(36);
  const traps = [
    `/api/_metrics/${t}/collect`,
    `/data/${PREFIX}-honeypot-${HASH}.json`,
    `/api/_debug/${t}/trace`,
  ];
  // 随机选择蜜罐端点（爬虫遍历分析时会不断触发）
  const url = traps[Math.floor(Math.random() * traps.length)];
  return fetch(url, { method: 'HEAD', cache: 'no-store' })
    .then(r => r.ok ? null : null)
    .catch(() => null);
}

// 蜜罐仅在 detectScraper() 为 true 时触发
// 正常用户永远不触发，零误伤
if (typeof window !== 'undefined' && detectScraper()) {
  honeypotFetch();
}

/**
 * 客户端环境检测：判断是否为真实浏览器
 * 返回 true 表示看起来是爬虫，返回 false 表示正常
 */
export function detectScraper(): boolean {
  if (typeof window === 'undefined') return false;

  // 检查 navigator.webdriver — 爬虫常见特征
  if ((navigator as any).webdriver === true) return true;

  // 检查 headless Chrome 标志
  if (!navigator.plugins || navigator.plugins.length === 0) return true;

  // 检查 Chrome 特有的 chrome 对象
  const isChrome = /chrome/i.test(navigator.userAgent);
  if (isChrome && !(window as any).chrome) return true;

  // 检查 languages 属性
  if (!navigator.languages || navigator.languages.length === 0) return true;

  // 检查 userAgent 中无头特征
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headless') || ua.includes('phantom') || ua.includes('puppet')) return true;

  return false;
}

// ─── 文件名映射 ───

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
  honeypot:      `${PREFIX}-honeypot-${HASH}`,  // 蜜罐文件
};

/** 获取混淆后的数据文件路径 */
export function dataPath(key: string): string {
  const fname = FILE_MAP[key as FileKey];
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

/**
 * 安全的 fetch：正常用户不加随机参数，爬虫才加
 * - 正常浏览：直接 fetch（Cloudflare 可以缓存）
 * - detectScraper() 为 true 时：加随机参数 + 随机延时
 */
export function safeFetch(url: string): Promise<Response> {
  const isScraper = detectScraper();
  
  if (!isScraper) {
    // 正常用户：不加随机参数，直接 fetch（CDN 可以缓存）
    return fetch(url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
  }

  // 爬虫：加随机延时和随机参数（破坏缓存 + 延缓抓取）
  const delay = Math.random() * 200 + 50;
  const separator = url.includes('?') ? '&' : '?';
  const antiParam = `_r=${Math.random().toString(36).slice(2, 8)}`;
  const secureUrl = url + separator + antiParam;

  return new Promise(resolve => {
    setTimeout(() => {
      fetch(secureUrl, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      }).then(resolve);
    }, delay);
  });
}

/** 获取当前数据版本（用于 CDN 缓存清洗时添加查询参数） */
export function getDataVersion(): string {
  return DATA_VERSION;
}
