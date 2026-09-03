/**
 * Kanji duvar kâğıdının verisi.
 *
 * Katakana tarafındaki `katakana-data.ts` ile aynı gerekçeyle ayrı dosya:
 * ileride bir iPhone sürümü de aynı hazırlığı isteyecek ve iki yerde ayrı
 * liste tutmak, birinde düzeltilenin ötekinde eski kalmasıyla sonuçlanıyor.
 *
 * KANA'DAN FARKLI OLAN NE:
 * Kanada gösterilecek şey "bu harf hangi ses". Kanjide böyle tek bir cevap
 * YOK — bir kanjinin okunuşu içinde bulunduğu kelimeye göre değişir
 * (人 tek başına hito, 三人 sannin, 日本人 nihonjin). Bu yüzden burada asıl
 * yük ÖRNEK KELİMELERDE: okunuşun kelimeye göre değiştiğini ancak yan yana
 * duran kelimeler gösterebilir. Karakterin altına tek bir okunuş yazmak
 * yanlış bir şey öğretirdi.
 */
import { readFileSync } from 'node:fs'
import { KANJI_N5, KANJI_SETS } from '../../src/content/ja/kanji-n5'

export interface StrokeData {
  s: string[]
  n: [number, number][]
  v: number
}

/** Ekranda gösterilen tek bir kanjinin bütün verisi. */
export interface KanjiCard {
  /** Karakterin kendisi */
  c: string
  /** Türkçe anlamlar */
  m: string[]
  /** on'yomi — Çinceden gelen okunuş, katakana yazılır */
  on: string[]
  /** kun'yomi — Japonca okunuş, hiragana yazılır */
  kun: string[]
  /** Çizgi sayısı */
  s: number
  /** Tema başlığı: "Gün ve zaman" */
  g: string
  /** Japon okul sınıfı — sıklık ağırlığı buradan çıkıyor */
  grade: number
  /** Çizgi yolları (SVG path) */
  p: string[]
  /** Çizgi başlangıç noktaları; i = kaçıncı çizgi */
  n: { x: number; y: number; i: number }[]
  /** Örnek kelimeler: kelime, okunuşu, Türkçesi */
  w: { k: string; r: string; t: string }[]
}

/**
 * Karakter → tema başlığı.
 *
 * KANJI_SETS zaten konu konu gruplanmış; duvar kâğıdında "hangi aileden"
 * bilgisi bağlam veriyor. Hiçbir sete girmeyen karakter olursa boş kalır,
 * uydurma bir başlık yazılmaz.
 */
function themeMap(): Map<string, string> {
  const m = new Map<string, string>()
  for (const set of KANJI_SETS) {
    for (const c of set.chars) if (!m.has(c)) m.set(c, set.title)
  }
  return m
}

export function buildKanjiCards(strokesPath: string): KanjiCard[] {
  const strokes: Record<string, StrokeData> = JSON.parse(readFileSync(strokesPath, 'utf8'))
  const tema = themeMap()

  return (
    KANJI_N5
      // Çizgi verisi olmayan karakter ATLANIR. Duvar kâğıdının asıl işi çizgi
      // sırasını göstermek; verisi olmayan karakter boş bir kare olarak çıkar
      // ve o turu boşa harcar.
      .filter((k) => (strokes[k.char]?.s?.length ?? 0) > 0)
      .map((k) => {
        const sd = strokes[k.char]
        return {
          c: k.char,
          m: k.meaningsTr,
          on: k.on,
          kun: k.kun,
          s: k.strokes,
          g: tema.get(k.char) ?? '',
          grade: k.grade ?? 9,
          p: sd.s,
          n: sd.n.map(([x, y], i) => ({ x, y, i: i + 1 })),
          // En fazla üç kelime — ekranda üç kart yeri var. Sıra veri
          // dosyasındaki sıra: orada en yaygın kullanım başa yazılmış.
          w: k.words.slice(0, 3).map((w) => ({ k: w.term, r: w.reading, t: w.tr })),
        }
      })
  )
}
