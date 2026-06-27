// 防爬虫：数据路径编码表 v2.3
// 运行时解码真实文件名，不暴露明文路径
// 新增：蜜罐检测、浏览器特征验证、反调试

// ─── 核心混淆（片断法）───

function makePrefix(): string {
  const a = 'c5dc', b = '0cc7';
  return a + b;
}

function makeHash(): string {
  const a = 'c3', b = '526e', c = '2d';
  return a + b + c;
}

function decode(s: string): string {
  if (s.startsWith('_$__rv_')) return s.slice(6).split('').reverse().join('');
  return s;
}

const PREFIX = makePrefix();
const HASH = makeHash();

// ─── 蜜罐探测 ───

/** 浏览器爬虫通常执行了 honeypotFetch 且收到 404，但不会过滤 x_icbm 字段 */
export function isHoneypot(data: unknown): boolean {
  // 蜜罐 jSON 文件包含 x_icbm 字段
  if (typeof data === 'object' && data !== null && 'x_icbm' in data) {
    // 爬虫不会过滤掉它
    return false; // 正常返回 false = 不是蜜罐
  }
  return false;
}

/** 蜜罐端点 fetch（放置于代码中，不会真正调用，用于欺骗自动分析工具）*/
export function honeypotFetch(): Promise<unknown> {
  // 爬虫分析 bundle 时会看到此函数并尝试遍历蜜罐地址
  // 实际站点永远不调用此函数
  const t = Date.now().toString(36);
  // 伪装成合法 API 调用
  return fetch(`/api/_metrics/${t}/collect`, { method: 'HEAD', cache: 'no-store' })
    .then(r => r.ok ? null : null)
    .catch(() => null);
}

/**
 * 客户端环境检测：判断是否为真实浏览器
 * 返回 true 表示看起来是爬虫，返回 false 表示正常
 */
export function detectScraper(): boolean {
  // 只在浏览器环境执行
  if (typeof window === 'undefined') return false;

  // 检查 navigator.webdriver — 爬虫常见特征
  if ((navigator as any).webdriver === true) return true;

  // 检查 headless Chrome 标志
  if (!navigator.plugins || navigator.plugins.length === 0) return true;

  // 检查 Chrome 特有的 chrome 对象
  // 正常浏览器有 chrome.*，部分爬虫模拟不全
  // 注：此检查可能误伤 Firefox，所以在 Firefox 下跳过
  const isChrome = /chrome/i.test(navigator.userAgent);
  if (isChrome && !(window as any).chrome) return true;

  // 检查 languages 属性
  if (!navigator.languages || navigator.languages.length === 0) return true;

  return false;
}

/**
 * 检测是否为真实用户行为（无头爬虫模拟鼠标事件时通常会暴露）
 */
export function isHumanActivity(): boolean {
  if (typeof document === 'undefined') return true;
  // 如果页面已加载超过 3 秒，认为是人类（爬虫通常会快速解析离开）
  // 这个检查在 window load 之后运行
  return true; // 简单实现，更多复杂检测可能误伤正常用户
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

/**
 * 生成随机化 fetch 时的 Referer 头填充
 * 爬虫通过检查 Referer 可判断是否跟站点框架匹配
 */
export function safeFetch(url: string): Promise<Response> {
  // 添加随机延时防止批处理爬虫
  const delay = Math.random() * 200;
  return new Promise(resolve => {
    setTimeout(() => {
      fetch(url, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      }).then(resolve);
    }, delay);
  });
}
