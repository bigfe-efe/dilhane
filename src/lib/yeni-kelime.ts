import { VOCAB } from '@/content'
import { UNITS, UNITE_KANJI, UNIT_BY_ID, kanjiUnit } from '@/content/ja/units'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'

// Örnek cümlede henüz görülmemiş kanjiyi taşıyan kelimeleri bulur.
//
// NEDEN: dilbilgisi örnekleri doğal cümleler; 3. ünitede "sabah 7'de
// kalkarım" derken 朝 ve 起 geçiyor ama bu kanjiler hiçbir ünitenin kelime
// listesinde o ana kadar yok. Öğrenci kana satırından okuyabiliyordu ama
// kelimenin ne olduğunu bilmiyordu. Burada kelime sözlükten bulunup
// cümlenin hemen altında anlamıyla veriliyor.
//
// "Görülmüş" kanji: bu ve önceki ünitelerin N5 kanjileri + kelime
// listelerinde ve dilbilgisi kalıplarında geçen kanjiler (kitapta kelime
// sayfası dilbilgisinden önce).

export interface YeniKelime {
  ja: string
  kana: string
  tr: string
}

const KANJI = /[一-鿿々]/
const kanjiler = (s: string) => [...s].filter((c) => KANJI.test(c))
const hiragana = (c: string | undefined) => !!c && /[ぁ-ゖ]/.test(c)

/** Ünite sırasına göre birikmiş "görülmüş kanji" kümeleri */
const GORULEN = new Map<string, Set<string>>()
{
  const acc = new Set<string>()
  for (const u of UNITS) {
    for (const k of UNITE_KANJI[u.id] ?? '') acc.add(k)
    for (const v of u.vocab) for (const k of kanjiler(v.ja)) acc.add(k)
    // Dilbilgisi kalıbının kendisi de öğretilmiş sayılır: 〜枚, 上/下/中
    for (const g of u.grammar) for (const k of kanjiler(g.pattern)) acc.add(k)
    GORULEN.set(u.id, new Set(acc))
  }
}

/** Bu üniteye kadar (dahil) görülmüş kanjiler */
export function gorulenKanji(unitId: string): Set<string> {
  return GORULEN.get(unitId) ?? new Set()
}

/**
 * Sözlükte olmayan ama örneklerde geçen kelimeler: özel isimler, günler,
 * sayaçlar. (scripts/_olc benzeri bir tarama ile bulundu.)
 */
const EK_SOZLUK: YeniKelime[] = [
  { ja: '田中', kana: 'たなか', tr: 'Tanaka (soyadı)' },
  { ja: '東京', kana: 'とうきょう', tr: 'Tokyo' },
  { ja: '早い', kana: 'はやい', tr: 'erken' },
  { ja: '速い', kana: 'はやい', tr: 'hızlı' },
  { ja: '受ける', kana: 'うける', tr: '(sınava) girmek' },
  { ja: '一度', kana: 'いちど', tr: 'bir kez' },
  { ja: '枚', kana: 'まい', tr: 'yassı şey sayacı (kâğıt, pul, bilet)' },
  { ja: '月曜日', kana: 'げつようび', tr: 'pazartesi' },
  { ja: '火曜日', kana: 'かようび', tr: 'salı' },
  { ja: '水曜日', kana: 'すいようび', tr: 'çarşamba' },
  { ja: '木曜日', kana: 'もくようび', tr: 'perşembe' },
  { ja: '金曜日', kana: 'きんようび', tr: 'cuma' },
  { ja: '土曜日', kana: 'どようび', tr: 'cumartesi' },
  { ja: '日曜日', kana: 'にちようび', tr: 'pazar' },
]

interface Aday {
  /** Cümlede aranan biçim: tam yazılış ya da çekimli fiil/sıfatın kökü */
  kalip: string
  kok: boolean
  w: YeniKelime
}

/**
 * Kanjili sözlük kelimeleri. Ünite kelimeleri önce: aynı yazılışın ünitede
 * verilen anlamı öğrencinin gördüğü anlamdır.
 */
const ADAYLAR: Aday[] = (() => {
  const gorulen = new Set<string>()
  const liste: Aday[] = []
  const ekle = (ja: string, kana: string, tr: string) => {
    if (!kanjiler(ja).length || gorulen.has(ja)) return
    gorulen.add(ja)
    const w = { ja, kana, tr }
    liste.push({ kalip: ja, kok: false, w })
    // Çekimli biçim: 食べる → 食べ(ます), 起きる → 起き, 行く → 行(きます),
    // 忙しい → 忙し(かった). Son kana düşürülerek kök bulunur.
    if (hiragana(ja.at(-1)) && /[うくぐすつぬぶむるい]$/.test(ja)) liste.push({ kalip: ja.slice(0, -1), kok: true, w })
  }
  for (const u of UNITS) for (const v of u.vocab) ekle(v.ja, v.kana, v.tr)
  for (const v of EK_SOZLUK) ekle(v.ja, v.kana, v.tr)
  for (const v of VOCAB) ekle(v.term, v.reading ?? v.term, v.tr)
  // Uzun kalıp önce: 映画館 映画'dan, 銀行 行'dan önce denensin
  return liste.sort((a, b) => b.kalip.length - a.kalip.length)
})()

/**
 * Cümlede geçen, `unitId` ünitesine kadar görülmemiş kanji taşıyan kelimeler.
 * Sözlükte bulunamayan kanji tek başına (N5 kanjisiyse anlamıyla) döner.
 */
export function yeniKelimeler(ja: string, unitId: string): YeniKelime[] {
  const gorulen = GORULEN.get(unitId)
  if (!gorulen) return []
  const bilinmeyen = (s: string) => kanjiler(s).some((k) => !gorulen.has(k))
  if (!bilinmeyen(ja)) return []

  const sonuc: YeniKelime[] = []
  const kapsanan = new Set<number>()
  // Önceki karakter eşleşmemiş bir kanji mi: o zaman burası kelime ortası.
  // Sayıdan sonra gelen sayaç (五枚) kelime ortası sayılmaz.
  const kelimeOrtasi = (i: number) =>
    KANJI.test(ja[i - 1] ?? '') && !kapsanan.has(i - 1) && !/[一二三四五六七八九十百千万何]/.test(ja[i - 1])
  for (let i = 0; i < ja.length; i++) {
    // Kelime kanjiyle ya da お/ご önekiyle başlar (お茶, ご飯)
    if (!KANJI.test(ja[i]) && !(/[おご]/.test(ja[i]) && KANJI.test(ja[i + 1] ?? ''))) continue
    for (const a of ADAYLAR) {
      if (!ja.startsWith(a.kalip, i)) continue
      const son = i + a.kalip.length
      // Kök eşleşmesi yalnızca kelime başında ve ardından çekim ekiyle:
      // 旅行 içindeki 行 "gitmek" diye okunmasın.
      if (a.kok && (kelimeOrtasi(i) || !hiragana(ja[son]))) continue
      if (!a.kok && kelimeOrtasi(i)) continue
      for (let k = i; k < son; k++) kapsanan.add(k)
      if (bilinmeyen(a.kalip) && !sonuc.some((s) => s.ja === a.w.ja)) sonuc.push(a.w)
      i = son - 1
      break
    }
  }

  // Hiçbir kelimeye oturmayan yeni kanji: tek başına göster
  ;[...ja].forEach((c, i) => {
    if (!KANJI.test(c) || gorulen.has(c) || kapsanan.has(i) || sonuc.some((s) => s.ja === c)) return
    const k = KANJI_BY_CHAR.get(c)
    const uid = kanjiUnit(c)
    const nerede = uid ? ` · ${UNIT_BY_ID.get(uid)?.no}. ünitede` : ''
    sonuc.push({ ja: c, kana: '', tr: k ? k.meaningsTr.slice(0, 2).join(', ') + nerede : 'yeni kanji — okunuşu yukarıda' })
  })
  return sonuc
}
