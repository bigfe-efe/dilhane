import { toKana } from 'wanakana'
import { normalize } from './stt'
import { romajiOf } from './ja-phonetic'

/**
 * Serbest metin cevaplarının denetimi — alıştırmaların ve kanji testinin
 * ortak mantığı.
 *
 * Buradaki kod önce yalnızca Exercise.tsx içindeydi. Kanji testi de aynı
 * kabulü istiyor (kana ya da romaji yazılabilsin) ve iki ayrı kopya zamanla
 * ayrı düşerdi: birinde düzeltilen kabul ötekinde eksik kalırdı.
 */

export const LATIN_ONLY = /^[a-zA-ZıİşŞğĞçÇöÖüÜ\s'’-]+$/
export const HAS_KANA = /[ぁ-ゟァ-ヿ]/

/** Katakana→hiragana, noktalama ve boşluk atılır, büyük/küçük harf eşitlenir */
export function loose(s: string): string {
  return normalize(s, 'ja')
}

/** Öğrencinin yazdığını kanaya çevirir; çeviremezse null */
export function asKana(input: string): string | null {
  const ham = input.trim()
  if (!ham) return null
  if (HAS_KANA.test(ham)) return ham
  if (!LATIN_ONLY.test(ham)) return null
  return toKana(ham.toLowerCase(), { IMEMode: false }).replace(/[\s　]/g, '')
}

/**
 * Cevap doğru mu?
 *
 * ROMAJİ DE KABUL EDİLİR: Japonca klavyesi olmayan biri すみません yazamaz.
 * İki yönlü denenir — girdi kanaya çevrilerek, cevap romajiye çevrilerek
 * (ekler düzeltilerek: わたしは "watashi wa" okunur).
 */
export function acceptsJa(input: string, answers: string[]): boolean {
  const a = loose(input)
  if (!a) return false
  if (answers.some((x) => loose(x) === a)) return true

  const ham = input.trim()
  if (!ham || !LATIN_ONLY.test(ham)) return false

  const kanaGirdi = loose(toKana(ham.toLowerCase(), { IMEMode: false }))
  return answers.some((x) => {
    if (!HAS_KANA.test(x)) return false
    if (loose(x) === kanaGirdi) return true
    return loose(romajiOf(x).text) === a
  })
}
