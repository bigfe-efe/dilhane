import type { GrammarPoint, Lesson, Unit, Vocab } from '@/types'
import { VOCAB_JA } from './ja/vocab'
import { GRAMMAR_JA } from './ja/grammar'
import { LESSONS_JA, UNITS_JA } from './ja/lessons'
import { UNITS as KONU_UNITELERI } from './ja/units'

// Tüm içeriğin tek giriş noktası. Sayfalar doğrudan buradan okur.
//
// Uygulama yalnızca Japonca içindir. Eskiden ikinci bir dil rayı (İngilizce)
// vardı; kaldırıldı. `lang` alanları tipte kaldı çünkü içerik modelinin geri
// kalanı (kayıtlar, SRS kartları, istatistik) onu taşıyor — ama tek değeri var.

// ————————————————————— Ünite kelimeleri —————————————————————
//
// NEDEN BURADA BİRLEŞİYOR:
// Üniteler kendi kelime listesini taşıyor ama bu listenin yarısı ana
// sözlükte yoktu. Sonuç: ünitede öğrenilen kelimelerin hiçbiri tekrar
// sistemine girmiyor, sözlükte de aranamıyordu — öğrenilip unutuluyordu.
// Tekrar ekranı kartları VOCAB_BY_ID'den çözdüğü için doğru yer burası:
// ünite kelimesi sözlükte varsa o kayıt kullanılır, yoksa üniteden bir kayıt
// üretilip sözlüğe eklenir. İki ünitede geçen kelime tek kayıttır.

const SOZLUK_TERIM = new Map(VOCAB_JA.map((v) => [v.term, v]))

const saltKana = (s: string) => /^[぀-ヿーー〜]+$/.test(s)

const ekKelimeler = new Map<string, Vocab>()
const uniteKelimeIdleri = new Map<string, string[]>()

for (const u of KONU_UNITELERI) {
  const idler: string[] = []
  for (const w of u.vocab) {
    // Önce yazılışla eşle; yalnızca kana kelimede okunuşla da eşle —
    // kanjili kelimeyi okunuşla eşlemek eş seslileri karıştırırdı.
    const var_ = SOZLUK_TERIM.get(w.ja) ?? (saltKana(w.ja) ? SOZLUK_TERIM.get(w.kana) : undefined)
    if (var_) {
      idler.push(var_.id)
      continue
    }
    const id = `unite:${w.ja}`
    if (!ekKelimeler.has(id)) {
      ekKelimeler.set(id, {
        id,
        lang: 'ja',
        term: w.ja,
        reading: w.kana,
        tr: w.tr,
        pos: w.note,
        level: 'N5',
        tags: ['unite', u.id],
      })
    }
    idler.push(id)
  }
  uniteKelimeIdleri.set(u.id, [...new Set(idler)])
}

export const VOCAB: Vocab[] = [...VOCAB_JA, ...ekKelimeler.values()]
export const VOCAB_BY_ID = new Map(VOCAB.map((v) => [v.id, v]))

/** Bir ünitenin kelimelerinin sözlük kimlikleri — tekrar kartı açmak için */
export function unitVocabIds(unitId: string): string[] {
  return uniteKelimeIdleri.get(unitId) ?? []
}

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
