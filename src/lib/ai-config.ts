// AI Worker 配置
export const AI_WORKER_URL = 'https://jiugong-ai.4513.workers.dev'

// 每日免费次数（localStorage 计数，按设备）
const LIMIT_KEY = 'jiugong-ai-limit'
export const DAILY_FREE = 5

export function getUsedToday(): number {
  try {
    const today = new Date().toDateString()
    const rec = JSON.parse(localStorage.getItem(LIMIT_KEY) || '{"d":"","n":0}')
    if (rec.d !== today) return 0
    return rec.n
  } catch { return 0 }
}

export function consumeQuota(): number {
  try {
    const today = new Date().toDateString()
    const rec = JSON.parse(localStorage.getItem(LIMIT_KEY) || '{"d":"","n":0}')
    const n = (rec.d === today ? rec.n : 0) + 1
    localStorage.setItem(LIMIT_KEY, JSON.stringify({ d: today, n }))
    return n
  } catch { return 0 }
}

export function remainingFree(): number {
  return Math.max(DAILY_FREE - getUsedToday(), 0)
}
