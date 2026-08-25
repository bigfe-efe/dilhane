// Kanjili bir metnin kana okunuşunu içerikten bulur.
//
// Neden: seslendirme, Japonca ses yokken metni Türkçe okunuşa çeviriyor. Kanji
// çevrilemediği için okunuşa ihtiyaç var. Uygulamanın içeriğinde okunuşlar zaten
// yazılı (kelime `reading` alanı, örnek cümlelerin `reading` alanı, kanji
// kelimeleri) — burada hepsi tek bir arama tablosunda toplanır.

import { GRAMMAR_JA } from '@/content/ja/grammar'
import { KANJI_N5 } from '@/content/ja/kanji-n5'
import { VOCAB_JA } from '@/content/ja/vocab'

let index: Map<string, string> | null = null

function build(): Map<string, string> {
  const m = new Map<string, string>()
  const add = (term: string | undefined, reading: string | undefined) => {
    if (!term || !reading || term === reading) return
    if (!m.has(term)) m.set(term, reading)
  }

  for (const v of VOCAB_JA) {
    add(v.term, v.reading)
    for (const ex of v.examples ?? []) add(ex.text, ex.reading)
  }

  for (const g of GRAMMAR_JA) {
    for (const ex of g.examples) add(ex.text, ex.reading)
  }

  for (const k of KANJI_N5) {
    for (const w of k.words) add(w.term, w.reading)
    // Tek başına kanji: önce kun (Japonca okunuş), yoksa on
    const solo = (k.kun[0] ?? k.on[0] ?? '').replace(/-/g, '')
    add(k.char, solo)
  }

  return m
}

/** Metnin kana okunuşu — bilinmiyorsa null. */
export function lookupReading(text: string): string | null {
  if (!index) index = build()
  return index.get(text) ?? index.get(text.replace(/[。、！？]/g, '')) ?? null
}

/** Metinde kana'ya çevrilemeyecek kanji var mı? */
export function hasKanji(text: string): boolean {
  return /[㐀-鿿]/.test(text)
}
