// 卦象百科数据工具：从周易 content 提取 64 卦 + 八卦五行方位表 + 拼音 slug
import { zhouyiContent } from '@/data/xueguan/content/zhouyi'
import pinyin from 'tiny-pinyin'

// 八卦基础信息（下卦在上卦前展示用）
export const TRIGRAM_INFO: Record<string, { wuxing: string; houtian: string; xiantian: string; symbol: string; nature: string }> = {
  '乾': { wuxing: '金', houtian: '西北', xiantian: '南', symbol: '☰', nature: '天·健' },
  '兑': { wuxing: '金', houtian: '西', xiantian: '东南', symbol: '☱', nature: '泽·悦' },
  '离': { wuxing: '火', houtian: '南', xiantian: '东', symbol: '☲', nature: '火·丽' },
  '震': { wuxing: '木', houtian: '东', xiantian: '东北', symbol: '☳', nature: '雷·动' },
  '巽': { wuxing: '木', houtian: '东南', xiantian: '西南', symbol: '☴', nature: '风·入' },
  '坎': { wuxing: '水', houtian: '北', xiantian: '西', symbol: '☵', nature: '水·陷' },
  '艮': { wuxing: '土', houtian: '东北', xiantian: '西北', symbol: '☶', nature: '山·止' },
  '坤': { wuxing: '土', houtian: '西南', xiantian: '北', symbol: '☷', nature: '地·顺' },
}

export interface GuaEntry {
  seq: number            // 卦序 1-64
  name: string           // 卦名（乾为天）
  shortName: string      // 简称（乾）
  upper: string          // 上卦
  lower: string          // 下卦
  slug: string           // 拼音 slug
  content: string        // 原文（卦辞爻辞彖象）
  vernacular?: string    // 白话
  notes?: string         // 九宫按
  figSrc?: string        // 卦画
  guaci?: string         // 卦辞（content 首行）
}

const GUA_INDEX = null // 弃用手写序——slug 用 tiny-pinyin 全名生成（语义化无冲突）

export function getHexagrams(): GuaEntry[] {
  return zhouyiContent.chapters.map((ch, idx) => {
    const m = ch.title.match(/第([一二三四五六七八九十百]+)卦 · ([^（（]+)/)
    const g = ch.title.match(/（([^上]+)上([^下]+)下）/)
    const name = (m ? m[2] : ch.title).trim()
    const short = name[0]
    const slug = `gua${String(idx + 1).padStart(2, '0')}`
    return {
      seq: idx + 1,
      name,
      shortName: short,
      upper: g ? g[1].trim() : '',
      lower: g ? g[2].trim() : '',
      slug,
      content: ch.content || '',
      vernacular: ch.vernacular,
      notes: ch.notes,
      figSrc: (ch.figures && ch.figures[0] ? ch.figures[0].src : undefined) as string | undefined,
      guaci: ((ch.content || '').split('\n')[0] || '').slice(0, 40),
    }
  })
}

export function getGuaBySlug(slug: string): GuaEntry | undefined {
  return getHexagrams().find(g => g.slug === slug)
}
