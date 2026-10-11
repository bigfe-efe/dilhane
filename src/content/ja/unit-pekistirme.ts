import { KANJI_BY_CHAR } from './kanji-n5'
import { kanjiBilgi } from './kanji-ek'
import { UNITS, unitKanji, type Unit, type UnitVocab } from './units'
import { GRAMER_SORULARI, type PekSoru } from './units/gramer-sorulari'
import { cumledekiKelime, kelimeOrnegi } from './units/kelime-ornekleri'
import { kelimeAyir, parcaRomaji } from '@/lib/kanji-ayir'
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

// Cevap denetimi (kana ↔ romaji eşdeğerliği) ortak modülde: alıştırmalar ve
// ünite testleri de aynı kabulü kullanıyor.
export { cevapDogruMu } from '@/lib/answer'

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

/**
 * "Bu kelimede şu kanji nasıl okunur?" sorusu.
 *
 * Okunuş küçük っ ile bitiyorsa (三つ: みっ) üç cevap da kabul edilir: みっ,
 * み ve kelime içindeki romajisi "mit". Küçük っ kendi başına söylenen bir
 * ses değil; yalnızca "mi" yazan öğrenci yanlış sayılmamalı.
 */
function okunusSorusu(w: KanjiKelimesi, ch: string): PekSoru | null {
  const parcalar = kelimeAyir(w.ja, w.kana)
  if (parcalar.ozel) return null
  const i = parcalar.parcalar.findIndex((p) => p.ch === ch && p.okunus)
  if (i < 0) return null
  const okunus = parcalar.parcalar[i].okunus!
  const romaji = parcaRomaji(parcalar.parcalar, i)
  const kucukTsu = okunus.endsWith('っ') && okunus.length > 1
  return {
    t: 'yaz',
    s: `「${w.ja}」 (${w.tr}) kelimesinde ${ch} nasıl okunur?`,
    d: kucukTsu ? [okunus, okunus.slice(0, -1), romaji] : [okunus],
    g: `${okunus} (${romaji})`,
    a:
      `${w.ja} ${w.kana} (${kanaToRomaji(w.kana)}): ${ch} burada ${okunus} (${romaji}).` +
      (kucukTsu ? ' Küçük っ kendi başına okunmaz, sonraki sesi ikiler.' : ''),
  }
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
    sorular.push(okunusSorusu(w4, k4)!)
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
    // Şıklar soru kimliğine bağlı tohumla karıştırılır: elle yazılan sorularda
    // doğru cevap çoğunlukla ilk şıktaydı. Sıra her açılışta aynı kalır.
    return (GRAMER_SORULARI[u.id]?.[g.title] ?? []).map((soru, i) => {
      const id = `${s.id}:${i}`
      return { id, soru: sikKaristir(soru, tohum(`${u.id}:${id}`)) }
    })
  }
  return []
}

// ————————————————————————— Tekrar testi —————————————————————————
//
// Ünite sonu testinden ayrı, tekrar için: ünitenin dilbilgisi, kelime ve
// kanjilerinden HER SEFERİNDE yeniden kurulan 10 ya da 20 soru. Kelime ve
// kanji soruları ünite verisinden üretiliyor; dilbilgisi soruları elle
// yazılmış havuzdan geliyor. "Birikimli" seçenekte önceki üniteler de karışır
// (yarısı bu üniteden).

export interface TekrarSorusu {
  soru: PekSoru
  /** Sorunun geldiği ünite */
  unite: string
  konu: 'Dilbilgisi' | 'Kelime' | 'Kanji'
}

const rastgele = () => Math.random()
const birini = <T>(liste: T[]): T => liste[Math.floor(Math.random() * liste.length)]

/** Şıklı sorunun şıklarını karıştırır, doğru indeksi yeniden hesaplar */
function sikKaristir(soru: PekSoru, r: () => number): PekSoru {
  if (soru.t !== 'sec') return soru
  const dogru = soru.o[soru.d]
  const o = karistir(soru.o, r)
  return { ...soru, o, d: o.indexOf(dogru) }
}

/** Bir kelime için rastgele türde bir soru */
function kelimeSorusu(u: Unit, v: UnitVocab): PekSoru {
  const r = rastgele
  const o = kelimeOrnegi(u.id, v.ja)
  const aciklama = kelimeAciklama(u.id, v)
  const turler = ['anlam', 'anlam', 'ters', 'ters']
  // Uzun kalıpları (よろしくおねがいします) yazdırmak yorucu; kısa kelimelerde
  if (ilkOkunus(v.kana).length <= 7) turler.push('uret')
  if (KANJI.test(v.ja)) turler.push('oku', 'oku')
  if (o) {
    turler.push('cumle')
    if (!v.ja.startsWith('〜') && cumledekiKelime(o.ja, v.ja) === v.ja) turler.push('bosluk', 'bosluk')
  }
  switch (birini(turler)) {
    case 'ters':
      return { t: 'sec', s: `“${v.tr}” Japoncada hangisi?`, ...siklar(v.ja, u.vocab.map((x) => x.ja), r), a: aciklama }
    case 'uret':
      return { t: 'yaz', s: `“${v.tr}” Japoncada nasıl söylenir?`, d: [...new Set([v.ja, ...okunuslar(v.kana)])], a: aciklama }
    case 'oku':
      return { t: 'yaz', s: `「${v.ja}」 nasıl okunur? (${v.tr})`, d: [...new Set(okunuslar(v.kana))], a: aciklama }
    case 'bosluk': {
      const havuz = u.vocab.map((x) => x.ja).filter((j) => !o!.ja.includes(j))
      return { t: 'sec', s: `${o!.ja.replace(v.ja, '＿＿')}  (${o!.tr})`, ...siklar(v.ja, havuz, r), a: `${o!.ja} — ${o!.tr}` }
    }
    case 'cumle': {
      const havuz = u.vocab.map((x) => kelimeOrnegi(u.id, x.ja)?.tr).filter((x): x is string => !!x)
      return { t: 'sec', s: `「${o!.ja}」 ne demek?`, ...siklar(o!.tr, havuz, r), a: `${o!.ja} (${o!.latin}) — ${o!.tr}` }
    }
    default:
      return { t: 'sec', s: `「${v.ja}」 ne demek?`, ...siklar(v.tr, u.vocab.map((x) => x.tr), r), a: aciklama }
  }
}

/** Bir kanji için rastgele türde bir soru; kurulamıyorsa null */
function kanjiSorusu(u: Unit, ch: string): PekSoru | null {
  const r = rastgele
  const b = kanjiBilgi(ch)
  if (!b) return null
  const kelimeler = kanjiKelimeleri(u, ch)
  const onceki = UNITS.slice(0, UNITS.findIndex((x) => x.id === u.id) + 1)
  const kelimeHavuz = onceki
    .flatMap((x) => x.vocab)
    .filter((v) => KANJI.test(v.ja))
    .map((v) => ({ ja: v.ja, kana: ilkOkunus(v.kana) }))
  const anlam = (): PekSoru => {
    const havuz = [...unitKanji(u.id), ...KANJI_BY_CHAR.keys()].map((c) => kanjiBilgi(c)?.meaningsTr[0]).filter((x): x is string => !!x)
    return { t: 'sec', s: `${ch} kanjisinin anlamı?`, ...siklar(b.meaningsTr[0], havuz, r), a: `${ch}: ${b.meaningsTr.join(', ')}.` }
  }
  if (!kelimeler.length) return anlam()
  const w = birini(kelimeler)
  const turler = ['anlam', 'okuma', 'yazilis']
  const ayrim = kelimeAyir(w.ja, w.kana)
  const parca = !ayrim.ozel && w.ja.length > 1 ? ayrim.parcalar.find((p) => p.ch === ch && p.okunus) : undefined
  if (parca) turler.push('okunus')
  switch (birini(turler)) {
    case 'okuma':
      return {
        t: 'sec',
        s: `「${w.ja}」 nasıl okunur?`,
        ...siklar(w.kana, kelimeHavuz.map((x) => x.kana), r),
        a: `${w.ja} ${w.kana} (${kanaToRomaji(w.kana)}) = ${w.tr}.`,
      }
    case 'yazilis':
      return { t: 'sec', s: `${w.kana} (${w.tr}) nasıl yazılır?`, ...siklar(w.ja, kelimeHavuz.map((x) => x.ja), r), a: `${w.kana} → ${w.ja}.` }
    case 'okunus':
      return okunusSorusu(w, ch) ?? anlam()
    default:
      return anlam()
  }
}

/** `once` listesinden önce al, yetmezse `sonra`dan tamamla */
function tamamla<T>(once: T[], sonra: T[], adet: number): T[] {
  const a = once.slice(0, adet)
  return a.length < adet ? [...a, ...sonra.slice(0, adet - a.length)] : a
}

export function tekrarSorulari(unitId: string, adet: number, birikimli: boolean): TekrarSorusu[] {
  const sira = UNITS.findIndex((x) => x.id === unitId)
  if (sira < 0) return []
  const hedef = UNITS[sira]
  const eskiler = birikimli ? UNITS.slice(0, sira) : []
  const r = rastgele

  // Her konu için: bu üniteden ve önceki ünitelerden karışık adaylar
  const gramer = (us: Unit[]) =>
    karistir(us.flatMap((u) => Object.values(GRAMER_SORULARI[u.id] ?? {}).flat().map((soru) => ({ u, soru }))), r)
  const kelime = (us: Unit[]) => karistir(us.flatMap((u) => u.vocab.map((v) => ({ u, v }))), r)
  const kanji = (us: Unit[]) => karistir(us.flatMap((u) => [...unitKanji(u.id)].map((ch) => ({ u, ch }))), r)

  // Birikimlide her konunun yarısı bu üniteden, yarısı öncekilerden
  const pay = (n: number) => (eskiler.length ? Math.ceil(n / 2) : n)
  const sec = <T>(bu: T[], eski: T[], n: number): T[] => {
    const a = bu.slice(0, pay(n))
    return tamamla([...a, ...eski.slice(0, n - a.length)], bu.slice(a.length), n)
  }

  const nGramer = Math.round(adet * 0.4)
  const nKanji = Math.round(adet * 0.2)
  const sonuc: TekrarSorusu[] = []

  for (const { u, soru } of sec(gramer([hedef]), gramer(eskiler), nGramer))
    sonuc.push({ soru: sikKaristir(soru, r), unite: u.id, konu: 'Dilbilgisi' })
  for (const { u, ch } of sec(kanji([hedef]), kanji(eskiler), nKanji)) {
    const soru = kanjiSorusu(u, ch)
    if (soru) sonuc.push({ soru, unite: u.id, konu: 'Kanji' })
  }
  // Kalanı kelime doldurur (dilbilgisi ya da kanji eksik kaldıysa onu da kapatır)
  for (const { u, v } of sec(kelime([hedef]), kelime(eskiler), adet - sonuc.length))
    sonuc.push({ soru: kelimeSorusu(u, v), unite: u.id, konu: 'Kelime' })

  return karistir(sonuc, r)
}
