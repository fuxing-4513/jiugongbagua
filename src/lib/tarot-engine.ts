/**
 * 塔罗引擎 — 基于 @cometpisces/tarot-kit@0.2.0 的封装
 * 提供牌阵定义、抽牌、中文解读拼装等上层功能
 */

import {
  cards,
  getAllCards,
  drawCards,
  getCardMeaning,
  getLocalizedText,
} from '@cometpisces/tarot-kit'

import { TAROT_ORIENTATION_LANG } from './tarot-data'
import type {
  TarotCard,
  DrawnCard,
  CardOrientation,
  TarotCardMeaning,
  TarotCardReadingAspects,
  TarotCardContextualMeanings,
} from '@cometpisces/tarot-kit'

// ── Re-export types ──
export type {
  TarotCard,
  DrawnCard,
  CardOrientation,
}

// ── Spread position ──
export interface SpreadPosition {
  key: string
  name: string        // e.g. "过去", "现在"
  icon: string        // e.g. "🌘"
  aspect?: keyof TarotCardReadingAspects
  context?: keyof TarotCardContextualMeanings
}

export interface Spread {
  id: string
  name: string
  cardCount: number
  positions: SpreadPosition[]
  description: string
  descriptionShort: string
}

// ==== SPREADS ====
export const SPREADS: Record<string, Spread> = {
  daily: {
    id: 'daily',
    name: '日运单牌',
    cardCount: 1,
    description: '每天一张牌，给你今天的主题与提示',
    descriptionShort: '每日指引',
    positions: [
      { key: 'today', name: '今日主题', icon: '🌅', aspect: 'currentSituation', context: 'others' },
    ],
  },
  three: {
    id: 'three',
    name: '三牌牌阵',
    cardCount: 3,
    description: '经典的过去-现在-未来，洞悉事件脉络',
    descriptionShort: '过去·现在·未来',
    positions: [
      { key: 'past', name: '过去', icon: '🌘', aspect: 'rootCause', context: 'others' },
      { key: 'now', name: '现在', icon: '🌕', aspect: 'innerState', context: 'others' },
      { key: 'future', name: '未来', icon: '🌖', aspect: 'development', context: 'others' },
    ],
  },
  relationship: {
    id: 'relationship',
    name: '关系牌阵',
    cardCount: 5,
    description: '审视你在关系中的位置与方向',
    descriptionShort: '感情·人际',
    positions: [
      { key: 'me', name: '你', icon: '🧑', aspect: 'innerState', context: 'interpersonal' },
      { key: 'other', name: '对方', icon: '👤', aspect: 'currentSituation', context: 'interpersonal' },
      { key: 'bond', name: '你们之间', icon: '💞', aspect: 'currentSituation', context: 'love' },
      { key: 'block', name: '障碍', icon: '🧱', aspect: 'rootCause', context: 'interpersonal' },
      { key: 'outcome', name: '发展走向', icon: '🔮', aspect: 'development', context: 'love' },
    ],
  },
  career: {
    id: 'career',
    name: '事业牌阵',
    cardCount: 5,
    description: '工作、项目、人生方向的全景透视',
    descriptionShort: '工作·方向',
    positions: [
      { key: 'current', name: '当前处境', icon: '💼', aspect: 'currentSituation', context: 'work' },
      { key: 'strength', name: '你的优势', icon: '⚡', aspect: 'innerState', context: 'work' },
      { key: 'challenge', name: '面临挑战', icon: '⚔️', aspect: 'rootCause', context: 'work' },
      { key: 'advice', name: '行动建议', icon: '💡', aspect: 'advice', context: 'work' },
      { key: 'outcome', name: '结果趋势', icon: '🎯', aspect: 'development', context: 'work' },
    ],
  },
  celtic: {
    id: 'celtic',
    name: '凯尔特十字',
    cardCount: 10,
    description: '最经典全面的牌阵，深入剖析事物的全局',
    descriptionShort: '全局剖析',
    positions: [
      { key: 'p1', name: '现状核心', icon: '①', aspect: 'currentSituation' },
      { key: 'p2', name: '辅助力量', icon: '②', aspect: 'currentSituation' },
      { key: 'p3', name: '基础根源', icon: '③', aspect: 'rootCause' },
      { key: 'p4', name: '近期过去', icon: '④', aspect: 'rootCause' },
      { key: 'p5', name: '最佳可能', icon: '⑤', aspect: 'development' },
      { key: 'p6', name: '近期未来', icon: '⑥', aspect: 'development' },
      { key: 'p7', name: '你的态度', icon: '⑦', aspect: 'innerState' },
      { key: 'p8', name: '环境影响', icon: '⑧', aspect: 'innerState' },
      { key: 'p9', name: '希望与恐惧', icon: '⑨', aspect: 'advice' },
      { key: 'p10', name: '最终结果', icon: '⑩', aspect: 'advice' },
    ],
  },
}

export const SPREAD_LIST = Object.values(SPREADS)

// ── Draw ──

/** Draw cards for a spread */
export function drawForSpread(spreadId: string): DrawnCard[] {
  const spread = SPREADS[spreadId]
  if (!spread) return []
  return drawCards(spread.cardCount)
}

// ── Interpretation ──

export interface CardInterpretation {
  title: string
  orientationLabel: string
  isUpright: boolean
  core: string           // core meaning
  aspect: string         // position-specific aspect
  contextual: string     // love/work/interpersonal
  advice: string         // advice aspect
}

/** Get localized text from a multilang object */
function getLangText(obj: any, lang: string): string {
  if (!obj) return ''
  // Use the package's getLocalizedText if available, otherwise fall back
  try {
    const text = getLocalizedText(obj, lang as any)
    if (text) return text
  } catch {}
  return obj[lang] || obj['zh-CN'] || ''
}

/** Build rich interpretation for a drawn card at a spread position */
export function interpretCard(
  card: TarotCard,
  orientation: CardOrientation,
  position: SpreadPosition,
  lang: string = 'zh-CN',
): CardInterpretation {
  const isUp = orientation === 'upright'
  const meaning = card.meaning[isUp ? 'upright' : 'reversed']
  const adviceText = card.readingAspects.advice[isUp ? 'upright' : 'reversed']

  // Aspect-specific text
  const aspectKey = position.aspect || 'currentSituation'
  const aspectText =
    card.readingAspects[aspectKey][isUp ? 'upright' : 'reversed']

  // Context-specific text (if applicable)
  let contextualText: TarotCardMeaning | null = null
  if (position.context && card.contextualMeanings[position.context]) {
    contextualText = card.contextualMeanings[position.context]
  }

  const orientationLabel = isUp
    ? (TAROT_ORIENTATION_LANG.upright[lang] || TAROT_ORIENTATION_LANG.upright['zh-CN'])
    : (TAROT_ORIENTATION_LANG.reversed[lang] || TAROT_ORIENTATION_LANG.reversed['zh-CN'])

  return {
    title: `${isUp ? '▲' : '▼'} ${getLangText(card.name, lang)}`,
    orientationLabel,
    isUpright: isUp,
    core: getLangText(meaning, lang),
    aspect: getLangText(aspectText, lang),
    contextual: contextualText ? getLangText(contextualText[isUp ? 'upright' : 'reversed'], lang) : '',
    advice: getLangText(adviceText, lang),
  }
}

/** Get a compact summary line for a card */
export function getCardSummary(card: TarotCard, orientation: CardOrientation, lang: string = 'zh-CN'): string {
  const isUp = orientation === 'upright'
  const meaning = card.meaning[isUp ? 'upright' : 'reversed']
  const name = getLangText(card.name, lang)
  const orient = isUp
    ? (TAROT_ORIENTATION_LANG.upright[lang] || TAROT_ORIENTATION_LANG.upright['zh-CN'])
    : (TAROT_ORIENTATION_LANG.reversed[lang] || TAROT_ORIENTATION_LANG.reversed['zh-CN'])
  return `${name}（${orient}）：${getLangText(meaning, lang)}`
}

/** Get card display name */
export function getCardDisplayName(card: TarotCard, lang: string = 'zh-CN'): string {
  return getLangText(card.name, lang)
}

/** Element emoji for a card */
export function getCardElementEmoji(card: TarotCard): string {
  if (card.arcana === 'major') return '✨'
  switch (card.suit) {
    case 'wands': return '🔥'
    case 'cups': return '💧'
    case 'swords': return '💨'
    case 'pentacles': return '🪨'
    default: return '✨'
  }
}
