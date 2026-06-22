/**
 * 排盘历史 — localStorage 封装
 * 自动保存每次排盘结果到 jiugong_history
 */

export interface HistoryEntry {
  id: string
  type: 'bazi' | 'ziwei'
  dateStr: string
  bazi: string
  preview: string
  timestamp: string
}

const HISTORY_KEY = 'jiugong_history'
const MAX_ITEMS = 100

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const items: HistoryEntry[] = raw ? JSON.parse(raw) : []
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
    }
    items.unshift(newEntry)
    if (items.length > MAX_ITEMS) items.length = MAX_ITEMS
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch { /* silent */ }
}
