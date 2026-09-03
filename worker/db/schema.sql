-- 九宫用户体系 v1（C-lite）
-- 用户表：邮箱+密码（scrypt 哈希）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  created_at INTEGER NOT NULL
);

-- 命盘保存表
CREATE TABLE IF NOT EXISTS charts (
  id TEXT PRIMARY KEY,            -- 短编号（如 c8f3k2：用户发给大师用）
  user_id INTEGER NOT NULL,
  chart_type TEXT NOT NULL,       -- bazi / ziwei / app
  title TEXT DEFAULT '',          -- 用户备注（如「我的」「儿子的」）
  summary TEXT NOT NULL,          -- 命盘摘要文本（四柱/主星/格局——可复制发给大师）
  payload TEXT,                   -- 完整结果 JSON（备用，重开盘面）
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_charts_user ON charts(user_id);

-- 会话表（同域 HttpOnly cookie session）
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
