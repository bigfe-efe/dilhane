import type { GrammarPoint, Lesson, Unit, Vocab } from '@/types'
import { VOCAB_JA } from './ja/vocab'
import { GRAMMAR_JA } from './ja/grammar'
import { LESSONS_JA, UNITS_JA } from './ja/lessons'

// Tüm içeriğin tek giriş noktası. Sayfalar doğrudan buradan okur.
//
// Uygulama yalnızca Japonca içindir. Eskiden ikinci bir dil rayı (İngilizce)
// vardı; kaldırıldı. `lang` alanları tipte kaldı çünkü içerik modelinin geri
// kalanı (kayıtlar, SRS kartları, istatistik) onu taşıyor — ama tek değeri var.

export const VOCAB: Vocab[] = VOCAB_JA
export const VOCAB_BY_ID = new Map(VOCAB.map((v) => [v.id, v]))

export const GRAMMAR: GrammarPoint[] = GRAMMAR_JA
export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((p) => [p.id, p]))

export const LESSONS: Lesson[] = LESSONS_JA
export const LESSONS_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))

export const UNITS: Unit[] = UNITS_JA


/** Ders listesi — ünite ve sıra numarasına göre dizili. */
export const LESSONS_ORDERED: Lesson[] = [...LESSONS].sort((a, b) => a.unit - b.unit || a.order - b.order)

export const LANG_TR = 'Japonca'
export const LANG_NATIVE = '日本語'

/** Bir dersin öğrettiği her şeyi SRS kartına dönüştürmek için. */
export function lessonCardTargets(lesson: Lesson): { kind: 'vocab' | 'kana' | 'kanji' | 'grammar'; refId: string }[] {
  const out: { kind: 'vocab' | 'kana' | 'kanji' | 'grammar'; refId: string }[] = []
  for (const s of lesson.sections) {
    if (s.kind === 'vocab') out.push(...s.vocabIds.map((id) => ({ kind: 'vocab' as const, refId: id })))
    if (s.kind === 'grammar') out.push(...s.grammarIds.map((id) => ({ kind: 'grammar' as const, refId: id })))
    if (s.kind === 'kana') out.push(...s.chars.map((c) => ({ kind: 'kana' as const, refId: c })))
    if (s.kind === 'kanji') out.push(...s.chars.map((c) => ({ kind: 'kanji' as const, refId: c })))
  }
  return out
}
