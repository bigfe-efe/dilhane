import { toRomaji } from 'wanakana'
import { CONFUSING_PAIRS, HIRAGANA, KANA_BY_CHAR } from './kana'
import { KANA_WORDS, moraCount, readingNote, readingOf, tokenize, type KanaWord } from './kana-words'
import { shuffle } from '@/lib/shuffle'

// Hiragana bitirme sınavı.
//
// AMAÇ: "harfleri tanıyor muyum" değil, "hiragana okuyabiliyor muyum" sorusunu
// yanıtlamak. Bu ikisi aynı şey değil — tabloyu ezberleyip kelime sökemeyen çok
// olur. Bu yüzden sınav sekiz bölümden oluşuyor ve her bölüm ayrı bir beceriyi
// yokluyor:
//
//   1. tanıma      — karakteri görüp okunuşunu bilmek (çoktan seçmeli)
//   2. hatırlama   — okunuşu görüp karakteri bulmak (çoktan seçmeli)
//   3. üretim      — karakteri görüp okunuşu YAZMAK (şıksız; en zoru)
//   4. ayırt etme  — さ/き, ぬ/め gibi karışan çiftler
//   5. dakuten     — か/が/ぱ ayrımı, işaretin sesi nasıl değiştirdiği
//   6. yōon        — きゃ/きゅ/きょ birleşik sesler
//   7. kelime      — sadece hiragana yazılan kelimeleri sökmek
//   8. kural       — küçük っ, uzun ünlü, ん gibi tuzaklar
//
// Sonuçta yalnızca puan değil, HANGİ becerinin eksik olduğu çıkıyor: harfleri
// bilip kelime sökemeyen biriyle harfleri karıştıran biri farklı şeyler
// çalışmalı ve tavsiye de ona göre veriliyor.

// ————————————————————————— Okunuş denetimi —————————————————————————

// Romaji tek biçimde yazılmaz: し = shi/si/şi, つ = tsu/tu, てんぷら =
// tenpura/tempura. Sınav yazım bilgisini değil KANA bilgisini ölçtüğü için
// hepsi kabul edilir. Bunun yolu iki tarafı da tek bir "kanonik" biçime
// indirmek.
const VARIANTS: Record<string, string> = {
  // Hepburn biçimleri (kendileriyle eşlenir ki tarama sırasında bozulmasınlar)
  sha: 'sha', shu: 'shu', sho: 'sho', shi: 'shi',
  cha: 'cha', chu: 'chu', cho: 'cho', chi: 'chi',
  tsu: 'tsu', fu: 'fu', ji: 'ji', ja: 'ja', ju: 'ju', jo: 'jo',
  // Kunrei / Nihon-shiki karşılıkları
  sya: 'sha', syu: 'shu', syo: 'sho', si: 'shi',
  tya: 'cha', tyu: 'chu', tyo: 'cho', ti: 'chi',
  zya: 'ja', zyu: 'ju', zyo: 'jo',
  jya: 'ja', jyu: 'ju', jyo: 'jo',
  zi: 'ji', tu: 'tsu', hu: 'fu', di: 'ji', du: 'zu',
}

const VARIANT_RE = new RegExp(
  Object.keys(VARIANTS)
    .sort((a, b) => b.length - a.length)
    .join('|'),
  'g',
)

/**
 * Girilen okunuşu tek biçime indirger.
 *
 * Tek geçişte değiştiriyoruz: "si → shi" gibi kuralları arka arkaya
 * uygularsak "shi" içindeki "si" yeniden yakalanıp "shhi" olurdu.
 */
export function canonReading(input: string): string {
  let s = input.trim().toLowerCase()

  // Türkçe klavyeyle yazılmış olabilir
  s = s.replace(/ş/g, 'sh').replace(/ç/g, 'ch')
  // Uzatma işaretli yazım
  s = s.replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ē/g, 'ee').replace(/ō/g, 'oo')
  // Boşluk, tire, kesme
  s = s.replace(/[\s\-'’ʼ_.]/g, '')

  s = s.replace(VARIANT_RE, (m) => VARIANTS[m])

  // ん yazımı: "nn" da yazılır; b/p/m önünde "m" duyulur (tempura ↔ tenpura)
  s = s.replace(/nn/g, 'n').replace(/m([bpm])/g, 'n$1')
  // Uzun ünlü: おう ve おお aynı sesi verir
  s = s.replace(/ou/g, 'oo').replace(/ei/g, 'ee')

  return s
}

/** Bir karakterin kabul edilen bütün okunuşları. */
export function acceptsFor(char: string): string[] {
  const k = KANA_BY_CHAR.get(char)
  if (!k) return []
  const out = [k.romaji, k.trHint]
  // を kelime içinde "wo", edat olarak "o" okunur — ikisi de doğru
  if (char === 'を') out.push('o')
  return out
}

/** Kullanıcının yazdığı okunuş doğru mu? */
export function readingOk(input: string, accepts: string[]): boolean {
  if (!input.trim()) return false
  const got = canonReading(input)
  return accepts.some((a) => canonReading(a) === got)
}

/**
 * Kelimenin beklenen okunuşu.
 *
 * Harf harf çeviri her zaman doğru değil: konu eki は "wa" okunur (こんにちは =
 * konnichiwa). İstisnalar kelime listesinde tutuluyor.
 */
export function wordReading(kana: string): string {
  return readingOf(kana)
}

// ————————————————————————— Soru tipleri —————————————————————————

export type Section = 'tanima' | 'hatirlama' | 'uretim' | 'ayirt' | 'dakuten' | 'yoon' | 'kelime' | 'kural' | 'cizim'

export const SECTION_TR: Record<Section, { title: string; desc: string }> = {
  tanima: { title: 'Tanıma', desc: 'Karakteri görüp okunuşunu seçmek' },
  hatirlama: { title: 'Hatırlama', desc: 'Okunuşu görüp karakteri bulmak' },
  uretim: { title: 'Üretim', desc: 'Okunuşu şıksız, kendin yazmak' },
  ayirt: { title: 'Ayırt etme', desc: 'Birbirine benzeyen karakterler' },
  dakuten: { title: 'Dakuten', desc: '゛ ve ゜ işaretlerinin sesi değiştirmesi' },
  yoon: { title: 'Yōon', desc: 'きゃ / きゅ / きょ birleşik sesler' },
  kelime: { title: 'Kelime okuma', desc: 'Hiragana yazılmış kelimeleri sökmek' },
  kural: { title: 'Özel kurallar', desc: 'Küçük っ, uzun ünlü, ん' },
  cizim: { title: 'Yazma', desc: 'Karakteri çizerek yazmak' },
}

interface Base {
  id: string
  section: Section
  /** Soruda geçen karakterler — eksik analizi bunlardan çıkar */
  chars: string[]
  /** Cevap açıklandığında gösterilecek not */
  explain: string
}

export interface McqQ extends Base {
  type: 'mcq'
  prompt: string
  /** Soruda büyük gösterilecek kana (varsa) */
  showKana?: string
  /** Soruda büyük gösterilecek düz metin (okunuş sorusu gibi) */
  showText?: string
  options: string[]
  /** Şıklar kana mı yoksa düz metin mi — büyük punto gerekiyor mu */
  optionKana: boolean
  answer: number
}

export interface TextQ extends Base {
  type: 'text'
  prompt: string
  showKana?: string
  accepts: string[]
  /** Doğru cevabın gösterim biçimi */
  answerLabel: string
}

export interface WriteQ extends Base {
  type: 'write'
  prompt: string
  target: string
  answerLabel: string
}

export type Question = McqQ | TextQ | WriteQ

// ————————————————————————— Yardımcılar —————————————————————————

const BASE = HIRAGANA.filter((k) => k.kind === 'base')
const DAKU = HIRAGANA.filter((k) => k.kind === 'dakuten' || k.kind === 'handakuten')
const YOON = HIRAGANA.filter((k) => k.kind === 'yoon')

/** Aynı karakteri iki kez göstermemek için tekilleştirilmiş rastgele seçim. */
function pick<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n)
}

const CONFUSED = new Map<string, string[]>()
for (const [a, b] of CONFUSING_PAIRS) {
  if (!/[ぁ-ん]/.test(a)) continue
  CONFUSED.set(a, [...(CONFUSED.get(a) ?? []), b])
  CONFUSED.set(b, [...(CONFUSED.get(b) ?? []), a])
}

/** Bir karakterin karıştırıldığı eşleri — çeldirici seçerken önceliklidir. */
export function confusablesOf(char: string): string[] {
  return CONFUSED.get(char) ?? []
}

/**
 * Çeldirici seçimi.
 *
 * Rastgele çeldirici sınavı kolaylaştırır: "hangisi さ" sorusunda şıklar
 * さ/ぬ/ほ/り ise さ'yı bilmeyen biri bile eleyerek bulabilir. O yüzden önce
 * KARIŞTIRILAN eşler, sonra aynı satırdan komşular, en son rastgele.
 */
function distractors(correct: string, pool: string[], n: number): string[] {
  const k = KANA_BY_CHAR.get(correct)
  const out: string[] = []
  const add = (c: string) => {
    if (c !== correct && !out.includes(c) && pool.includes(c)) out.push(c)
  }

  for (const c of shuffle(confusablesOf(correct))) add(c)
  if (out.length < n && k) {
    for (const c of shuffle(HIRAGANA.filter((x) => x.group === k.group).map((x) => x.char))) add(c)
  }
  for (const c of shuffle(pool)) {
    if (out.length >= n) break
    add(c)
  }
  return out.slice(0, n)
}

/** Okunuş çeldiricileri — benzer sesler önce (ka/ga, shi/chi gibi). */
function readingDistractors(correct: string, pool: string[], n: number): string[] {
  const near = pool.filter(
    (r) => r !== correct && (r[0] === correct[0] || r.slice(-1) === correct.slice(-1)),
  )
  const out: string[] = []
  for (const r of shuffle(near)) if (!out.includes(r)) out.push(r)
  for (const r of shuffle(pool)) {
    if (out.length >= n) break
    if (r !== correct && !out.includes(r)) out.push(r)
  }
  return out.slice(0, n)
}

let seq = 0
const qid = () => `q${++seq}`

function mcq(o: Omit<McqQ, 'id' | 'type'>): McqQ {
  return { id: qid(), type: 'mcq', ...o }
}
function text(o: Omit<TextQ, 'id' | 'type'>): TextQ {
  return { id: qid(), type: 'text', ...o }
}

/** Şıkları karıştırır ve doğru cevabın yeni yerini bulur. */
function scramble(options: string[], answerIndex: number): { options: string[]; answer: number } {
  const correct = options[answerIndex]
  const mixed = shuffle(options)
  return { options: mixed, answer: mixed.indexOf(correct) }
}

// ————————————————————————— Bölümler —————————————————————————

function sectionTanima(n: number): Question[] {
  const allReadings = HIRAGANA.map((k) => k.romaji)
  return pick(BASE, n).map((k) => {
    const opts = [k.romaji, ...readingDistractors(k.romaji, allReadings, 3)]
    const { options, answer } = scramble(opts, 0)
    return mcq({
      section: 'tanima',
      chars: [k.char],
      prompt: 'Bu karakter nasıl okunur?',
      showKana: k.char,
      options,
      optionKana: false,
      answer,
      explain: `${k.char} = ${k.romaji} (Türkçe: ${k.trHint})`,
    })
  })
}

function sectionHatirlama(n: number): Question[] {
  const pool = BASE.map((k) => k.char)
  return pick(BASE, n).map((k) => {
    const opts = [k.char, ...distractors(k.char, pool, 3)]
    const { options, answer } = scramble(opts, 0)
    return mcq({
      section: 'hatirlama',
      chars: [k.char],
      prompt: `"${k.romaji}" hangi karakterle yazılır?`,
      showText: k.trHint,
      options,
      optionKana: true,
      answer,
      explain: `${k.romaji} = ${k.char}`,
    })
  })
}

function sectionUretim(n: number): Question[] {
  return pick(BASE, n).map((k) =>
    text({
      section: 'uretim',
      chars: [k.char],
      prompt: 'Bu karakterin okunuşunu yaz',
      showKana: k.char,
      accepts: acceptsFor(k.char),
      answerLabel: k.romaji,
      explain: `${k.char} = ${k.romaji} (Türkçe: ${k.trHint})`,
    }),
  )
}

function sectionAyirt(n: number): Question[] {
  const pairs = CONFUSING_PAIRS.filter(([a]) => /[ぁ-ん]/.test(a))
  return pick(pairs, n).map(([a, b]) => {
    const target = Math.random() < 0.5 ? a : b
    const other = target === a ? b : a
    const k = KANA_BY_CHAR.get(target)!
    const ko = KANA_BY_CHAR.get(other)!
    const extra = distractors(target, BASE.map((x) => x.char), 2).filter((c) => c !== other)
    const opts = [target, other, ...extra].slice(0, 4)
    const { options, answer } = scramble(opts, 0)
    return mcq({
      section: 'ayirt',
      chars: [target, other],
      prompt: `"${k.romaji}" hangisi?`,
      showText: k.trHint,
      options,
      optionKana: true,
      answer,
      explain: `${target} = ${k.romaji} · Karıştırdığın ${other} = ${ko.romaji}`,
    })
  })
}

function sectionDakuten(n: number): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []

  // Yarısı: işaretli karakteri okumak
  for (const k of pick(DAKU, half)) {
    out.push(
      text({
        section: 'dakuten',
        chars: [k.char],
        prompt: 'Bu karakterin okunuşunu yaz',
        showKana: k.char,
        accepts: acceptsFor(k.char),
        answerLabel: k.romaji,
        explain: `${k.char} = ${k.romaji}. ${k.kind === 'handakuten' ? '゜ (handakuten) h sesini p yapar.' : '゛ (dakuten) sessizi tonlu yapar: k→g, s→z, t→d, h→b.'}`,
      }),
    )
  }

  // Yarısı: işaretsiz ile işaretliyi ayırmak
  const pool = HIRAGANA.map((x) => x.char)
  for (const k of pick(DAKU, n - half)) {
    const opts = [k.char, ...distractors(k.char, pool, 3)]
    const { options, answer } = scramble(opts, 0)
    out.push(
      mcq({
        section: 'dakuten',
        chars: [k.char],
        prompt: `"${k.romaji}" hangisi?`,
        showText: k.trHint,
        options,
        optionKana: true,
        answer,
        explain: `${k.romaji} = ${k.char}`,
      }),
    )
  }
  return out
}

function sectionYoon(n: number): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []

  for (const k of pick(YOON, half)) {
    out.push(
      text({
        section: 'yoon',
        chars: [k.char],
        prompt: 'Bu birleşik sesin okunuşunu yaz',
        showKana: k.char,
        accepts: acceptsFor(k.char),
        answerLabel: k.romaji,
        explain: `${k.char} = ${k.romaji}. Küçük ゃゅょ önceki karakterle birleşir ve TEK hece olur.`,
      }),
    )
  }

  // Büyük/küçük ayrımı: きよ (ki-yo, iki hece) ile きょ (kyo, tek hece)
  for (const k of pick(YOON, n - half)) {
    const buyuk = k.char[0] + { ゃ: 'や', ゅ: 'ゆ', ょ: 'よ' }[k.char[1] as 'ゃ' | 'ゅ' | 'ょ']
    const bigReading = toRomaji(buyuk)
    const opts = [k.romaji, bigReading, k.romaji.replace('y', ''), bigReading.replace(/(.)(.)/, '$1$2')]
    const uniq = [...new Set(opts)]
    while (uniq.length < 3) uniq.push(k.romaji + 'u')
    const { options, answer } = scramble(uniq.slice(0, 4), 0)
    out.push(
      mcq({
        section: 'yoon',
        chars: [k.char],
        prompt: 'Bu nasıl okunur?',
        showKana: k.char,
        options,
        optionKana: false,
        answer,
        explain: `${k.char} = ${k.romaji} (tek hece). Büyük yazılsaydı ${buyuk} = ${bigReading} olurdu (iki hece).`,
      }),
    )
  }
  return out
}

function sectionKelime(n: number): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []
  // Kısa kelimeler seçmeli, uzunlar açık uçlu — zorluk kademeli olsun
  const kisa = KANA_WORDS.filter((w) => moraCount(w.kana) <= 3)
  const uzun = KANA_WORDS.filter((w) => moraCount(w.kana) >= 3)

  for (const w of pick(uzun, half)) {
    out.push(
      text({
        section: 'kelime',
        chars: tokenize(w.kana),
        prompt: 'Bu kelimenin okunuşunu yaz',
        showKana: w.kana,
        accepts: [wordReading(w.kana)],
        answerLabel: wordReading(w.kana),
        explain:
          `${w.kana} = ${wordReading(w.kana)} · ${tokenize(w.kana).join(' · ')}` +
          (readingNote(w.kana) ? ` — ${readingNote(w.kana)}` : ''),
      }),
    )
  }

  const allWordReadings = KANA_WORDS.map((w) => wordReading(w.kana))
  for (const w of pick(kisa, n - half)) {
    const correct = wordReading(w.kana)
    const opts = [correct, ...readingDistractors(correct, allWordReadings, 3)]
    const { options, answer } = scramble(opts, 0)
    out.push(
      mcq({
        section: 'kelime',
        chars: tokenize(w.kana),
        prompt: 'Bu kelime nasıl okunur?',
        showKana: w.kana,
        options,
        optionKana: false,
        answer,
        explain:
        `${w.kana} = ${correct} · ${tokenize(w.kana).join(' · ')}` +
        (readingNote(w.kana) ? ` — ${readingNote(w.kana)}` : ''),
      }),
    )
  }
  return out
}

function sectionKural(n: number): Question[] {
  const sokuon = KANA_WORDS.filter((w) => w.kana.includes('っ'))
  const uzunlar = KANA_WORDS.filter((w) => /おう|おお|うう|ええ|いい/.test(w.kana))
  const nWords = KANA_WORDS.filter((w) => w.kana.includes('ん'))

  // Küçük っ — ses vermez ama sonraki sessizi ikiler
  const sokuonQ = (w: KanaWord): Question => {
    const correct = wordReading(w.kana)
    const tekli = correct.replace(/([bcdfghjklmnpqrstvwyz])/, '$1')
    const opts = [
      ...new Set([correct, tekli, correct.replace(/([bcdfghjklmnpqrstvwyz])/, '$1tsu$1'), tekli + 'u']),
    ]
    const { options, answer } = scramble(opts.slice(0, 4), 0)
    return mcq({
      section: 'kural',
      chars: ['っ'],
      prompt: 'Küçük っ burada ne yapıyor? Doğru okunuşu seç',
      showKana: w.kana,
      options,
      optionKana: false,
      answer,
      explain: `${w.kana} = ${correct}. Küçük っ ses vermez; kendinden sonraki sessizi İKİLER ve orada kısa bir duraklama olur.`,
    })
  }

  // Uzun ünlü — iki hece boyu sürer
  const uzunQ = (w: KanaWord): Question =>
    text({
      section: 'kural',
      chars: tokenize(w.kana),
      prompt: 'Uzun ünlüye dikkat — okunuşu yaz',
      showKana: w.kana,
      accepts: [wordReading(w.kana)],
      answerLabel: wordReading(w.kana),
      explain: `${w.kana} = ${wordReading(w.kana)}. Ünlü İKİ hece boyu uzar; yutulursa başka kelime olur.`,
    })

  // ん tek başına bir hece uzunluğundadır
  const nQ = (w: KanaWord): Question => {
    const dogru = moraCount(w.kana)
    const opts = [...new Set([String(dogru), String(dogru - 1), String(dogru + 1), String(dogru + 2)])].filter(
      (x) => Number(x) > 0,
    )
    const { options, answer } = scramble(opts.slice(0, 4), 0)
    return mcq({
      section: 'kural',
      chars: ['ん'],
      prompt: 'Bu kelime kaç hecedir? (ん de bir hece sayılır)',
      showKana: w.kana,
      options,
      optionKana: false,
      answer,
      explain: `${w.kana} = ${tokenize(w.kana).join(' · ')} → ${dogru} hece. ん Japoncada tek başına bir hece uzunluğundadır.`,
    })
  }

  // Üç kuraldan sırayla alıyoruz ki azken bile üçü de temsil edilsin ve
  // toplam istenen sayıyı ne aşsın ne de altında kalsın.
  const havuzlar = [pick(sokuon, n).map(sokuonQ), pick(uzunlar, n).map(uzunQ), pick(nWords, n).map(nQ)]
  const out: Question[] = []
  for (let i = 0; out.length < n; i++) {
    const oncekiUzunluk = out.length
    for (const h of havuzlar) {
      if (out.length >= n) break
      if (h[i]) out.push(h[i])
    }
    if (out.length === oncekiUzunluk) break // havuzlar tükendi
  }
  return out
}

function sectionCizim(n: number): Question[] {
  return pick(BASE, n).map((k) => ({
    id: qid(),
    type: 'write' as const,
    section: 'cizim' as const,
    chars: [k.char],
    prompt: `"${k.romaji}" karakterini çiz`,
    target: k.char,
    answerLabel: k.char,
    explain: `${k.romaji} = ${k.char}`,
  }))
}

// ————————————————————————— Sınavı kur —————————————————————————

export interface ExamOptions {
  /** Kısa sınav mı, tam sınav mı */
  full: boolean
  /** Çizim bölümü dahil edilsin mi */
  withWriting: boolean
}

const HIRA_PAIRS = CONFUSING_PAIRS.filter(([a]) => /[ぁ-ん]/.test(a)).length

/**
 * Bölüm başına soru sayısı — TEK KAYNAK.
 *
 * Kurulum ekranı da buradan okur. Ayrı ayrı yazsaydık ekranda "8 soru" yazıp
 * sınavda 7 çıkabilirdi: bazı bölümler havuzla sınırlıdır (karışan çift sayısı
 * kadar soru üretilebilir), o yüzden sayı burada kırpılıyor.
 */
export function examPlan(full: boolean, withWriting: boolean): { section: Section; count: number }[] {
  const f = full
  const plan: { section: Section; count: number }[] = [
    { section: 'tanima', count: f ? 12 : 6 },
    { section: 'hatirlama', count: f ? 10 : 5 },
    { section: 'uretim', count: f ? 10 : 5 },
    { section: 'ayirt', count: Math.min(f ? 8 : 4, HIRA_PAIRS) },
    { section: 'dakuten', count: f ? 8 : 4 },
    { section: 'yoon', count: f ? 6 : 3 },
    { section: 'kelime', count: f ? 12 : 6 },
    { section: 'kural', count: f ? 6 : 3 },
  ]
  if (withWriting) plan.push({ section: 'cizim', count: f ? 4 : 2 })
  return plan
}

export function buildExam(o: ExamOptions): Question[] {
  seq = 0
  const n = (s: Section) => examPlan(o.full, o.withWriting).find((p) => p.section === s)?.count ?? 0
  const qs: Question[] = [
    ...sectionTanima(n('tanima')),
    ...sectionHatirlama(n('hatirlama')),
    ...sectionUretim(n('uretim')),
    ...sectionAyirt(n('ayirt')),
    ...sectionDakuten(n('dakuten')),
    ...sectionYoon(n('yoon')),
    ...sectionKelime(n('kelime')),
    ...sectionKural(n('kural')),
  ]
  if (o.withWriting) qs.push(...sectionCizim(n('cizim')))
  return qs
}

// ————————————————————————— Değerlendirme —————————————————————————

export interface Answer {
  qid: string
  /** Seçmelide seçilen şık, açık uçluda yazılan metin, çizimde puan */
  given: string
  correct: boolean
  /** Çizim bölümünde 0–100 */
  score?: number
}

export interface Weakness {
  id: string
  title: string
  detail: string
  tip: string
  /** İlgili çalışma sayfası */
  link?: { to: string; label: string }
}

export interface ExamResult {
  total: number
  correct: number
  percent: number
  bySection: { section: Section; total: number; correct: number; percent: number }[]
  /** Yanlışlarda geçen karakterler, en çok hata yapılandan başlayarak */
  weakChars: { char: string; misses: number }[]
  /** Karıştırılan çiftler: doğru → seçilen */
  confusions: { correct: string; picked: string; times: number }[]
  weaknesses: Weakness[]
  verdict: { title: string; text: string; tone: 'ok' | 'warn' | 'bad' }
}

export function evaluate(questions: Question[], answers: Map<string, Answer>): ExamResult {
  // Çizim bölümü ayrı tutulur: puanı bulanıktır, ana skoru bozmasın
  const scored = questions.filter((q) => q.section !== 'cizim')
  const correct = scored.filter((q) => answers.get(q.id)?.correct).length

  const sections = [...new Set(questions.map((q) => q.section))]
  const bySection = sections.map((section) => {
    const qs = questions.filter((q) => q.section === section)
    const ok = qs.filter((q) => answers.get(q.id)?.correct).length
    return { section, total: qs.length, correct: ok, percent: qs.length ? (ok / qs.length) * 100 : 0 }
  })

  // Yanlışlarda geçen karakterler
  const missCount = new Map<string, number>()
  const confusionCount = new Map<string, number>()
  for (const q of questions) {
    const a = answers.get(q.id)
    if (a?.correct) continue
    for (const c of q.chars) missCount.set(c, (missCount.get(c) ?? 0) + 1)

    // Seçmelide yanlış şık bir kana ise "karıştırma" olarak not düş
    if (q.type === 'mcq' && q.optionKana && a?.given) {
      const dogru = q.options[q.answer]
      if (a.given !== dogru && KANA_BY_CHAR.has(a.given)) {
        const key = `${dogru}→${a.given}`
        confusionCount.set(key, (confusionCount.get(key) ?? 0) + 1)
      }
    }
  }

  const weakChars = [...missCount.entries()]
    .map(([char, misses]) => ({ char, misses }))
    .sort((a, b) => b.misses - a.misses)

  const confusions = [...confusionCount.entries()]
    .map(([key, times]) => {
      const [c, p] = key.split('→')
      return { correct: c, picked: p, times }
    })
    .sort((a, b) => b.times - a.times)

  const percent = scored.length ? (correct / scored.length) * 100 : 0
  const verdict = verdictFor(percent)

  const pct = (s: Section) => bySection.find((b) => b.section === s)?.percent ?? 100
  // ————— Eksik teşhisi —————
  //
  // Puanı söylemek yetmiyor; hangi beceri eksik onu söylemek gerekiyor.
  // Bölüm puanlarını KARŞILAŞTIRARAK teşhis koyuyoruz: harfleri bilip kelime
  // sökemeyen biriyle harfleri karıştıran biri farklı şey çalışmalı.
  const w: Weakness[] = []

  const harfOrt = (pct('tanima') + pct('hatirlama') + pct('uretim')) / 3

  // ÖNCELİK SIRASI ÖNEMLİ.
  //
  // Temel karakterler oturmamışsa dakuten/yōon/kural tavsiyeleri gürültüdür:
  // onlar sebep değil sonuçtur. Bu durumda tek bir şey söylenir ve gerisi
  // bastırılır — insan aynı anda beş şey çalışamaz.
  if (harfOrt < 60) {
    return finish([
      {
        id: 'temel',
        title: 'Karakterler henüz oturmamış',
        detail: `Tanıma, hatırlama ve üretim ortalaman %${Math.round(harfOrt)}. Bu, ileri konulara değil temele dönmen gerektiğini söylüyor — dakuten ya da yōon'a şimdi çalışmak boşa gider.`,
        tip: 'Bütün tabloyu birden çalışma. Satır satır git: önce あ行 (5 harf), oturana kadar tekrarla, sonra か行 ekle. Her satırı hem tanıyabilmeli hem de kâğıda yazabilmelisin. Günde bir-iki satır yeterli; hepsini birden ezberlemeye çalışmak en sık yapılan hata.',
        link: { to: '/kana/hiragana', label: 'Hiragana tablosu' },
      },
    ])
  }

  if (pct('kelime') < 70 && harfOrt >= 80) {
    w.push({
      id: 'sokme',
      title: 'Harfleri biliyorsun ama kelime sökemiyorsun',
      detail: `Tek tek harflerde %${Math.round(harfOrt)} başarın var, kelimelerde %${Math.round(pct('kelime'))}. Bu çok yaygın bir aşama: harf tanımak ile akıcı okumak ayrı beceriler.`,
      tip: 'Kelimeyi bir bütün olarak çözmeye çalışma. Parmağınla hece hece git, her heceyi sesli söyle, sonra hepsini birleştir. Günde 10 kelime yeter — hız kendiliğinden gelir.',
      link: { to: '/kana-kelime', label: 'Kelime okuma alıştırması' },
    })
  }

  if (pct('uretim') < 70 && pct('tanima') >= 80) {
    w.push({
      id: 'pasif',
      title: 'Tanıyorsun ama hatırlamıyorsun',
      detail: `Şıklı sorularda %${Math.round(pct('tanima'))}, şıksız yazmada %${Math.round(pct('uretim'))} yaptın. Şıklar sana hatırlatıyor; kendi başına çıkaramıyorsun.`,
      tip: 'Şıklı test bu noktadan sonra seni aldatır. Kartları ters yönde çalış: önce okunuşu gör, karakteri kâğıda yaz, sonra kontrol et.',
      link: { to: '/write', label: 'Yazarak çalış' },
    })
  }

  if (pct('ayirt') < 70) {
    const ornek = confusions.slice(0, 2).map((c) => `${c.correct}/${c.picked}`).join(', ')
    w.push({
      id: 'karisan',
      title: 'Benzer karakterleri karıştırıyorsun',
      detail: ornek
        ? `Özellikle şunlarda: ${ornek}. Bunlar herkesin karıştırdığı çiftler, ayıp değil ama çözülmesi gerek.`
        : 'Birbirine benzeyen karakterlerde hata oranın yüksek.',
      tip: 'Karışan çifti ASLA ayrı ayrı çalışma — yan yana koy ve aradaki tek farkı bul (さ tek kıvrımlı, き iki çizgili gibi). Farkı bir cümleyle kendine anlat; beyin farkı hatırlar, şekli değil.',
      link: { to: '/kana/hiragana', label: 'Karışan çiftler tablosu' },
    })
  }

  if (pct('dakuten') < 70) {
    w.push({
      id: 'dakuten',
      title: 'Dakuten işaretleri oturmamış',
      detail: `゛ ve ゜ bölümünde %${Math.round(pct('dakuten'))} yaptın.`,
      tip: 'Ezberlenecek 46 yeni karakter yok, ezberlenecek 4 kural var: k→g, s→z, t→d, h→b. Handakuten (゜) yalnızca は satırına gelir ve h→p yapar. Kuralı bilirsen tablo kendiliğinden çıkar.',
      link: { to: '/kana/hiragana', label: 'Dakuten tablosu' },
    })
  }

  if (pct('yoon') < 70) {
    w.push({
      id: 'yoon',
      title: 'Yōon (birleşik sesler) eksik',
      detail: `きゃ / きゅ / きょ bölümünde %${Math.round(pct('yoon'))} yaptın.`,
      tip: 'Kilit nokta boyut: きよ iki hecedir (ki-yo), きょ tek hecedir (kyo). Küçük yazılan ゃゅょ önceki harfe yapışır ve onunla TEK ses olur. Yazarken küçük olanı karenin alt köşesine sıkıştır.',
      link: { to: '/kana/hiragana', label: 'Yōon tablosu' },
    })
  }

  if (pct('kural') < 70) {
    w.push({
      id: 'kural',
      title: 'Özel kurallarda takılıyorsun',
      detail: `Küçük っ, uzun ünlü ve ん bölümünde %${Math.round(pct('kural'))} yaptın.`,
      tip: 'Üçü de "sessiz ama yer kaplayan" şeyler. っ ses vermez, sonraki sessizi ikiler (がっこう = gak-kou). Uzun ünlü iki hece boyu sürer (おおきい). ん tek başına bir hece uzunluğundadır. Japoncada her hece EŞİT uzunlukta okunur — ritmi tutturmak telaffuzun yarısıdır.',
      link: { to: '/kana-kurallar', label: 'Özel kurallar sayfası' },
    })
  }

  if (weakChars.length > 0 && w.length === 0 && pct('kelime') >= 70) {
    w.push({
      id: 'serpinti',
      title: 'Sistematik bir eksiğin yok',
      detail: `Hatalar belirli bir kurala değil, tek tek ${weakChars.length} karaktere dağılmış.`,
      tip: 'Bu iyi haber: yapı oturmuş, geriye tek tek pekiştirme kalmış. Yanlış çıkan karakterleri tekrar listene ekle, birkaç gün aralıklı tekrarla; kendiliğinden kapanır.',
      link: { to: '/review', label: 'Tekrar listesi' },
    })
  }

  return finish(w)

  // Sonucu paketleyen yardımcı — teşhis erken de dönebildiği için ayrıldı
  function finish(weaknesses: Weakness[]): ExamResult {
    return {
      total: scored.length,
      correct,
      percent,
      bySection,
      weakChars,
      confusions,
      weaknesses,
      verdict,
    }
  }
}

/** Genel hüküm — yüzdeye göre tek paragraf. */
function verdictFor(percent: number): ExamResult['verdict'] {
  let verdict: ExamResult['verdict']
  if (percent >= 95) {
    verdict = {
      title: 'Hiragana bitti',
      text: 'Bu sonuç "tabloyu ezberledim"in ötesinde. Harfleri tanıyor, hatırlıyor ve kelime sökebiliyorsun. Katakana’ya geçebilirsin — mantığı aynı, sadece biçimler değişiyor.',
      tone: 'ok',
    }
  } else if (percent >= 85) {
    verdict = {
      title: 'Neredeyse bitti',
      text: 'Temel sağlam. Aşağıdaki birkaç eksiği kapat, sonra rahatça katakana’ya geç. Hiragana’yı tamamen bırakma; kelime okumaya devam et ki hız otursun.',
      tone: 'ok',
    }
  } else if (percent >= 70) {
    verdict = {
      title: 'İyi yoldasın ama bitmedi',
      text: 'Karakterlerin çoğu oturmuş, belirli noktalarda boşluk var. Aşağıdaki teşhislere göre birkaç gün daha çalış, sonra sınavı tekrarla. Şimdi katakana’ya geçmek ikisini birden karıştırmana yol açar.',
      tone: 'warn',
    }
  } else {
    verdict = {
      title: 'Biraz daha çalışmak lazım',
      text: 'Bu sonuç kötü değil, erken demek. Hiragana bir haftada oturmaz; aralıklı tekrarla birkaç güne oturur. Aşağıdaki eksiklerden yalnızca en üsttekiyle başla — hepsini birden çalışmak işe yaramaz.',
      tone: 'bad',
    }
  }

  return verdict
}
