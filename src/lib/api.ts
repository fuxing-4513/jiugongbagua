// 用户体系 API 客户端（同域 /api/* → jiugong-api Worker）
export const API_BASE = '/api'

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error((data as { error?: string }).error || `请求失败(${resp.status})`)
  return data as T
}

export interface User { id: number; email: string; nickname: string }
export interface ChartItem { id: string; chart_type: string; title: string; created_at: number }

export const api = {
  register: (email: string, password: string, nickname: string) =>
    req<{ ok: true; user: User }>('/register', { method: 'POST', body: JSON.stringify({ email, password, nickname }) }),
  login: (email: string, password: string) =>
    req<{ ok: true; user: User }>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => req<{ ok: true }>('/logout', { method: 'POST' }),
  me: () => req<{ ok: boolean; user?: User }>('/me'),
  listCharts: () => req<{ ok: true; charts: ChartItem[] }>('/charts'),
  saveChart: (chartType: string, title: string, summary: string, payload?: string) =>
    req<{ ok: true; id: string }>('/charts', { method: 'POST', body: JSON.stringify({ chartType, title, summary, payload }) }),
  deleteChart: (id: string) => req<{ ok: true }>(`/charts/${id}`, { method: 'DELETE' }),
  share: (id: string) => req<{ ok: true; chart: { id: string; chart_type: string; title: string; summary: string; created_at: number } }>(`/share/${id}`),
}
