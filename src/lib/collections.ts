/**
 * 本地收藏系统 — localStorage 封装
 * 支持收藏命盘、签文、测算记录
 */

const STORAGE_KEY = 'jiugong_collections';
const MAX_ITEMS = 50;

export interface SavedChart {
  id: string;
  type: 'bazi' | 'ziwei' | 'liuyao' | 'qian' | 'other';
  name: string;
  summary?: string;
  data: Record<string, unknown>;
  createdAt: string; // ISO string
}

function getAll(): SavedChart[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(items: SavedChart[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function saveChart(chart: Omit<SavedChart, 'id' | 'createdAt'>): SavedChart {
  const items = getAll();
  const newItem: SavedChart = {
    ...chart,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
  saveAll(items);
  return newItem;
}

export function removeChart(id: string): void {
  const items = getAll().filter(c => c.id !== id);
  saveAll(items);
}

export function getCharts(type?: string): SavedChart[] {
  const items = getAll();
  return type ? items.filter(c => c.type === type) : items;
}

export function getChart(id: string): SavedChart | undefined {
  return getAll().find(c => c.id === id);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
