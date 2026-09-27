import { toHiragana } from 'wanakana'
import { KANJI_BY_CHAR } from './kanji-n5'
import { kanjiBilgi } from './kanji-ek'
import { UNITS, unitKanji, type Unit, type UnitVocab } from './units'
import { GRAMER_SORULARI, type PekSoru } from './units/gramer-sorulari'
import { cumledekiKelime, kelimeOrnegi } from './units/kelime-ornekleri'
import { kelimeAyir } from '@/lib/kanji-ayir'
import { kanaToRomaji } from '@/lib/ja-phonetic'
import { gorulenKanji } from '@/lib/yeni-kelime'
import type { Sayfa } from './unit-kitap'

export type { PekSoru }

// Ünite kitabının sayfa sonlarındaki pekiştirme soruları.
//
// Öğrenci her sayfada öğrendiğini hemen yoklamak istedi: şıklı, boşluk
// doldurmalı, romaji yazmalı; yanlışsa doğrusu ve açıklaması, doğruysa
// yalnızca "doğru". Bir kez çözülen soru tekrar sorulmaz (cevap ünite
// kaydında durur).
//
//   • Dilbilgisi sayfaları: elle yazılmış sorular (units/gramer-sorulari.ts).
//   • Kelime ve kanji sayfaları: ünitenin kendi verisinden üretiliyor. Seçim
//     ve şık sırası ünite kimliğine bağlı tohumla yapılıyor: sayfa her
//     açılışta AYNI soruları gösteriyor, kaydedilen cevap geçerli kalıyor.
// Kurallar, metin (kendi soruları var), ödev ve test sayfalarında yok.

export interface Soru {
  id: string
  soru: PekSoru
}

// ————————————————————————— Cevap denetimi —————————————————————————

/**
 * Yazılan cevabı karşılaştırılabilir hâle getirir: romaji → hiragana,
 * katakana → hiragana, boşluk ve noktalama atılır. Ekler iki yolla da
 * yazılabilsin diye は/わ, へ/え, を/お eşitlenir (iki tarafa da uygulanıyor).
 */
function normal(s: string): string {
  let t = s.normalize('NFKC').toLowerCase().replace(/[\s。、.,!?！？「」'’\-~〜]/g, '')
  if (/[a-z]/.test(t)) t = toHiragana(t)
  return t
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/は/g, 'わ')
    .replace(/へ/g, 'え')
    .replace(/を/g, 'お')
}

export function cevapDogruMu(girdi: string, dogrular: string[]): boolean {
  const g = normal(girdi)
  return !!g && dogrular.some((d) => normal(d) === g)
}

// ————————————————————————— Tohumlu rastgelelik —————————————————————————

function tohum(s: string): () => number {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function karistir<T>(liste: T[], r: () => number): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Doğru cevap + tekrarsız çeldiriciler → karışık şıklar ve doğru indeks */
function siklar(dogru: string, havuz: string[], r: () => number, adet = 3): { o: string[]; d: number } {
  const celdirici = karistir(
    [...new Set(havuz)].filter((x) => x && x !== dogru),
    r,
  ).slice(0, adet)
  const o = karistir([dogru, ...celdirici], r)
  return { o, d: o.indexOf(dogru) }
}

const KANJI = /[一-鿿]/
const ilkOkunus = (kana: string) => kana.split(/\s*\/\s*/)[0]
const okunuslar = (kana: string) => kana.split(/\s*\/\s*/)

// ————————————————————————— Kelime sayfası —————————————————————————

function kelimeAciklama(unitId: string, v: UnitVocab): string {
  const o = kelimeOrnegi(unitId, v.ja)
  const bas = `${v.ja} (${kanaToRomaji(ilkOkunus(v.kana))}) = ${v.tr}.`
  return o ? `${bas} Örnek: ${o.ja} — ${o.tr}` : bas
}

function kelimeSorulari(u: Unit): Soru[] {
  const r = tohum(`${u.id}:kelime`)
  const vocab = u.vocab
  if (vocab.length < 4) return []
  // Önce yıldızlılar: en çok kullanılanlar pekişsin
  const sirali = [...karistir(vocab.filter((v) => v.star), r), ...karistir(vocab.filter((v) => !v.star), r)]
  const kullanilan = new Set<string>()
  const al = (kosul: (v: UnitVocab) => boolean) => {
    const v = sirali.find((x) => !kullanilan.has(x.ja) && kosul(x))
    if (v) kullanilan.add(v.ja)
    return v
  }
  const trHavuz = vocab.map((v) => v.tr)
  const jaHavuz = vocab.map((v) => v.ja)
  const sorular: PekSoru[] = []

  const v1 = al(() => true)
  if (v1) {
    const s = siklar(v1.tr, trHavuz, r)
    sorular.push({ t: 'sec', s: `「${v1.ja}」 ne demek?`, ...s, a: kelimeAciklama(u.id, v1) })
  }
  const v2 = al(() => true)
  if (v2) {
    const s = siklar(v2.ja, jaHavuz, r)
    sorular.push({ t: 'sec', s: `“${v2.tr}” Japoncada hangisi?`, ...s, a: kelimeAciklama(u.id, v2) })
  }
  // Okunuşu yazdır: kanjili kelime (kanasız kelimede soru anlamsız)
  const v3 = al((v) => KANJI.test(v.ja))
  if (v3) {
    sorular.push({
      t: 'yaz',
      s: `「${v3.ja}」 nasıl okunur? (${v3.tr})`,
      d: [...new Set(okunuslar(v3.kana))],
      a: kelimeAciklama(u.id, v3),
    })
  }
  // Örnek cümlede boşluk: kelime cümlede aynen geçiyorsa
  const v4 = al((v) => {
    const o = kelimeOrnegi(u.id, v.ja)
    return !!o && !v.ja.startsWith('〜') && cumledekiKelime(o.ja, v.ja) === v.ja
  })
  if (v4) {
    const o = kelimeOrnegi(u.id, v4.ja)!
    const bos = o.ja.replace(v4.ja, '＿＿')
    const s = siklar(v4.ja, jaHavuz.filter((j) => !o.ja.includes(j)), r)
    sorular.push({ t: 'sec', s: `${bos}  (${o.tr})`, ...s, a: `${o.ja} — ${o.tr}` })
  }
  // Türkçeden Japoncaya yazma
  const v5 = al(() => true)
  if (v5) {
    sorular.push({
      t: 'yaz',
      s: `“${v5.tr}” Japoncada nasıl söylenir?`,
      d: [...new Set([v5.ja, ...okunuslar(v5.kana)])],
      a: kelimeAciklama(u.id, v5),
    })
  }
  return sorular.map((soru, i) => ({ id: `kelime:${i}`, soru }))
}

// ————————————————————————— Kanji sayfası —————————————————————————

interface KanjiKelimesi {
  ja: string
  kana: string
  tr: string
}

function kanjiKelimeleri(u: Unit, ch: string): KanjiKelimesi[] {
  const unite = u.vocab.filter((v) => v.ja.includes(ch)).map((v) => ({ ja: v.ja, kana: ilkOkunus(v.kana), tr: v.tr }))
  if (unite.length) return unite
  // Ünitede geçmiyorsa kanjinin N5 örnek kelimeleri — yalnızca bilinen kanjiyle yazılmışlar
  const gorulen = gorulenKanji(u.id)
  return (KANJI_BY_CHAR.get(ch)?.words ?? [])
    .filter((w) => [...w.term].every((c) => !KANJI.test(c) || gorulen.has(c)))
    .map((w) => ({ ja: w.term, kana: w.reading, tr: w.tr }))
}

function kanjiSorulari(u: Unit): Soru[] {
  const kanjiler = unitKanji(u.id)
  if (kanjiler.length < 2) return []
  const r = tohum(`${u.id}:kanji`)
  const secilen = karistir(kanjiler, r)
  // Çeldirici anlamlar: bu ünitenin ve (az kanjili ünitede) bütün N5 kanjileri
  const anlamHavuz = [...kanjiler, ...KANJI_BY_CHAR.keys()]
    .map((c) => kanjiBilgi(c)?.meaningsTr[0])
    .filter((x): x is string => !!x)
  // Kanjili kelime havuzu (çeldiriciler): önce bu ünite, sonra önceki üniteler
  const onceki = UNITS.slice(0, UNITS.findIndex((x) => x.id === u.id) + 1).reverse()
  const kelimeHavuz = onceki
    .flatMap((x) => x.vocab)
    .filter((v) => KANJI.test(v.ja))
    .map((v) => ({ ja: v.ja, kana: ilkOkunus(v.kana) }))
  const sorular: PekSoru[] = []

  // 1. Anlam
  const k1 = secilen[0]
  const b1 = kanjiBilgi(k1)
  if (b1) {
    const s = siklar(b1.meaningsTr[0], anlamHavuz, r)
    sorular.push({ t: 'sec', s: `${k1} kanjisinin anlamı?`, ...s, a: `${k1}: ${b1.meaningsTr.join(', ')}.` })
  }

  // 2. Okuma (N5 漢字読み gibi): kelime → okunuş
  const k2 = secilen[1 % secilen.length]
  const w2 = kanjiKelimeleri(u, k2)[0]
  if (w2) {
    const s = siklar(w2.kana, kelimeHavuz.map((x) => x.kana), r)
    sorular.push({
      t: 'sec',
      s: `「${w2.ja}」 nasıl okunur?`,
      ...s,
      a: `${w2.ja} ${w2.kana} (${kanaToRomaji(w2.kana)}) = ${w2.tr}.`,
    })
  }

  // 3. Yazılış (N5 表記 gibi): okunuş → doğru kanjili yazılış
  const k3 = secilen[2 % secilen.length]
  const w3 = kanjiKelimeleri(u, k3).find((w) => w.ja !== w2?.ja) ?? kanjiKelimeleri(u, k3)[0]
  if (w3) {
    const s = siklar(w3.ja, kelimeHavuz.map((x) => x.ja), r)
    sorular.push({
      t: 'sec',
      s: `${w3.kana} (${w3.tr}) nasıl yazılır?`,
      ...s,
      a: `${w3.kana} → ${w3.ja}.`,
    })
  }

  // 4. Kanjinin bu kelimedeki okunuşunu yazdır
  for (const k4 of secilen.slice(3).concat(secilen.slice(0, 3))) {
    const w4 = kanjiKelimeleri(u, k4).find((w) => {
      const a = kelimeAyir(w.ja, w.kana)
      return !a.ozel && a.parcalar.some((p) => p.ch === k4 && p.okunus) && w.ja.length > 1
    })
    if (!w4) continue
    const p = kelimeAyir(w4.ja, w4.kana).parcalar.find((x) => x.ch === k4)!
    sorular.push({
      t: 'yaz',
      s: `「${w4.ja}」 (${w4.tr}) kelimesinde ${k4} nasıl okunur?`,
      d: [p.okunus!],
      a: `${w4.ja} ${w4.kana}: ${k4} burada ${p.okunus} (${kanaToRomaji(p.okunus!)}).`,
    })
    break
  }
  return sorular.map((soru, i) => ({ id: `kanji:${i}`, soru }))
}

// ————————————————————————— Sayfaya göre —————————————————————————

export function sayfaSorulari(u: Unit, s: Sayfa): Soru[] {
  if (s.tur === 'kelime') return kelimeSorulari(u)
  if (s.tur === 'kanji') return kanjiSorulari(u)
  if (s.tur === 'gramer') {
    const g = u.grammar[s.gramer!]
    return (GRAMER_SORULARI[u.id]?.[g.title] ?? []).map((soru, i) => ({ id: `${s.id}:${i}`, soru }))
  }
  return []
}
