/**
 * Kanji duvar kâğıdının verisi.
 *
 * KAYNAK ARTIK KANJİ KARTLARI (2026-09-19). İlk sürüm doğrudan kanji
 * tablosundan besleniyordu; kartlar sonradan yazıldı ve ondan iyi hâle
 * geldi: örneklerde yalnızca N5 kanjisi var, 54 kanjide not var, her
 * kanjinin kelime kelime çözümlenmiş bir cümlesi var. Duvar kâğıdı ayrı bir
 * listeden beslenseydi ikisi birbirinden ayrı düşerdi — kartta düzeltilen
 * bir örnek duvar kâğıdında eski kalırdı.
 *
 * Kanjinin okunuşu kelimeye göre değiştiği için (人: ひと / じん / にん)
 * asıl yük hâlâ örneklerde ve cümlede; karakterin altına tek bir okunuş
 * yazmak yanlış bir şey öğretirdi.
 */
import { readFileSync } from 'node:fs'
import { KANJI_CARDS } from '../../src/content/ja/kanji-cards'
import { SENTENCE_BY_KANJI } from '../../src/content/ja/kanji-sentences'

export interface StrokeData {
  s: string[]
  n: [number, number][]
  v: number
}

/** Ekranda gösterilen tek bir kanjinin bütün verisi. */
export interface KanjiCard {
  /** Karakterin kendisi */
  c: string
  /** Kart numarası (1 = 一) */
  no: number
  /** Türkçe anlamlar */
  m: string[]
  on: string[]
  kun: string[]
  /** on/kun Latin okunuşları — "ichi / itsu" */
  onL: string
  kunL: string
  /** Çizgi sayısı */
  s: number
  /** Tema başlığı */
  g: string
  /** Japon okul sınıfı — sıklık ağırlığı */
  grade: number
  /** Çizgi yolları (SVG path) */
  p: string[]
  /** Çizgi başlangıç noktaları; i = kaçıncı çizgi */
  n: { x: number; y: number; i: number }[]
  /** Örnekler — yalnızca bütün kanjileri N5 olan kelimeler */
  w: { k: string; r: string; ro: string; t: string }[]
  /** Kartın notu: düzensiz okunuş, ses değişimi, karışıklık */
  note: { pairs: [string, string][]; text: string } | null
  /** Örnek cümle */
  sent: { ja: string; kana: string; tr: string } | null
}

export function buildKanjiCards(strokesPath: string): KanjiCard[] {
  const strokes: Record<string, StrokeData> = JSON.parse(readFileSync(strokesPath, 'utf8'))

  return (
    KANJI_CARDS
      // Çizgi verisi olmayan kanji ATLANIR: duvar kâğıdının asıl işi çizgi
      // sırası, boş kare o turu boşa harcar.
      .filter((c) => (strokes[c.k.char]?.s?.length ?? 0) > 0)
      .map((c) => {
        const sd = strokes[c.k.char]
        const cumle = SENTENCE_BY_KANJI.get(c.k.char)
        return {
          c: c.k.char,
          no: c.no,
          m: c.k.meaningsTr,
          on: c.k.on,
          kun: c.k.kun,
          onL: c.onLatin,
          kunL: c.kunLatin,
          s: c.k.strokes,
          g: c.setTitle,
          grade: c.k.grade ?? 9,
          p: sd.s,
          n: sd.n.map(([x, y], i) => ({ x, y, i: i + 1 })),
          // Kartlardaki örneklerin TAMAMI (en fazla beş). Önce dörde
          // kısılmıştı ve 一'in kartındaki 一年 duvar kâğıdında düşüyordu;
          // beş satırın 1366x768'de de sığdığı ölçüldü.
          w: c.examples.map((e) => ({ k: e.term, r: e.reading, ro: e.romaji, t: e.tr })),
          note: c.note ?? null,
          sent: cumle ? { ja: cumle.ja, kana: cumle.kana, tr: cumle.tr } : null,
        }
      })
  )
}
