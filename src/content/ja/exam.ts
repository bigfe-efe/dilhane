import { toRomaji } from 'wanakana'
import { CONFUSING_PAIRS, HIRAGANA, KATAKANA, KANA_BY_CHAR } from './kana'
import type { KanaChar } from '@/types'
import { KANA_WORDS, moraCount, readingNote, readingOf, tokenize, type KanaWord } from './kana-words'
import {
  KATA_QUIZ_WORDS,
  kataMoraCount,
  kataNote,
  kataReading,
  kataTokenize,
  sourceOf,
  type KataWord,
} from './katakana-words'
import { shuffle } from '@/lib/shuffle'

// Kana bitirme sınavı — hiragana ve katakana için aynı motor.
//
// NEDEN TEK MOTOR:
// İki alfabenin ölçülecek becerileri birebir aynı: tanı, hatırla, üret, karışan
// çiftleri ayır, dakuten, yōon, kelime sök, özel kuralları bil. Ayrı iki dosya
// yazmak, birinde düzeltilen bir hatanın ötekinde kalması demekti. Farklar —
// hangi karakter kümesi, hangi kelime listesi, ー mi yoksa ünlü ikizlemesi mi,
// ッ mı っ mı — `ALPHABET` tablosunda toplandı.
//
// Katakanaya özel TEK ek bölüm var: kaynak kelime (gairaigo). Sebebi şu —
// katakana kelimeleri ezberlenmez, çözülür. コーヒー’yi sökebilen biri anlamı
// zaten bilir. O beceriyi ölçmek hiraganada anlamsız, katakanada asıl iş.
//
// AMAÇ: "harfleri tanıyor muyum" değil, "okuyabiliyor muyum" sorusunu
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

export type Section =
  | 'tanima'
  | 'hatirlama'
  | 'uretim'
  | 'ayirt'
  | 'dakuten'
  | 'yoon'
  | 'kelime'
  | 'kural'
  | 'kaynak'
  | 'cizim'

export type KanaType = 'hiragana' | 'katakana'

/** Bölüm başlıkları alfabeye göre değişir: yōon örneği きゃ mı キャ mı? */
export function sectionTr(kt: KanaType): Record<Section, { title: string; desc: string }> {
  const h = kt === 'hiragana'
  return {
    tanima: { title: 'Tanıma', desc: 'Karakteri görüp okunuşunu seçmek' },
    hatirlama: { title: 'Hatırlama', desc: 'Okunuşu görüp karakteri bulmak' },
    uretim: { title: 'Üretim', desc: 'Okunuşu şıksız, kendin yazmak' },
    ayirt: { title: 'Ayırt etme', desc: 'Birbirine benzeyen karakterler' },
    dakuten: { title: 'Dakuten', desc: '゛ ve ゜ işaretlerinin sesi değiştirmesi' },
    yoon: { title: 'Yōon', desc: h ? 'きゃ / きゅ / きょ birleşik sesler' : 'キャ / キュ / キョ birleşik sesler' },
    kelime: {
      title: 'Kelime okuma',
      desc: h ? 'Hiragana yazılmış kelimeleri sökmek' : 'Katakana yazılmış kelimeleri sökmek',
    },
    kural: {
      title: 'Özel kurallar',
      desc: h ? 'Küçük っ, uzun ünlü, ん' : 'Uzatma ー, küçük ッ, ン',
    },
    kaynak: { title: 'Kaynak kelime', desc: 'Katakana kelimenin hangi kelimeden geldiği' },
    cizim: { title: 'Yazma', desc: 'Karakteri çizerek yazmak' },
  }
}

/** Geriye dönük kolaylık — hiragana başlıkları. */
export const SECTION_TR = sectionTr('hiragana')

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

/**
 * İki alfabe arasındaki BÜTÜN farklar burada toplanır.
 *
 * Bölüm üreticileri bundan sonra "hiragana mı katakana mı" diye sormaz; sadece
 * bu tablodan okur. Yeni bir fark çıkarsa tek yere eklenir.
 */
interface Alphabet {
  type: KanaType
  label: string
  chars: KanaChar[]
  base: KanaChar[]
  daku: KanaChar[]
  yoon: KanaChar[]
  pairs: [string, string][]
  /** Küçük duraklama işareti */
  sokuon: string
  /** Burun sesi */
  n: string
  /** Küçük ya/yu/yo → büyük karşılığı (yōon sorusu için) */
  bigY: Record<string, string>
  /** Sınavda okunacak kelimeler — iki liste tek biçime indirgenir */
  words: ExamWord[]
  /** Uzun ünlü içeren kelimeleri bulan desen */
  longRe: RegExp
  /** Uzun ünlünün nasıl yazıldığı, açıklama metninde geçiyor */
  longHow: string
}

/**
 * Sınav için tek biçimli kelime.
 *
 * İki liste farklı kurulmuş (hiraganada `reading` istisnası var, katakanada
 * `from` kaynağı var) ve okunuş/heceleme işlevleri de farklı. Bölüm üreticileri
 * bu farkları bilmesin diye kelimeler burada tek şekle sokuluyor.
 */
interface ExamWord {
  kana: string
  reading: string
  tokens: string[]
  mora: number
  note?: string
  /** Katakanada kaynak kelime; hiraganada yok */
  from?: string
  tr: string
}

const hiraWord = (w: KanaWord): ExamWord => ({
  kana: w.kana,
  reading: readingOf(w.kana),
  tokens: tokenize(w.kana),
  mora: moraCount(w.kana),
  note: readingNote(w.kana),
  tr: w.tr,
})

const kataWord = (w: KataWord): ExamWord => ({
  kana: w.kana,
  reading: kataReading(w.kana),
  tokens: kataTokenize(w.kana),
  mora: kataMoraCount(w.kana),
  note: kataNote(w.kana),
  from: sourceOf(w.kana),
  tr: w.tr,
})

const HIRA_RE = /[ぁ-ん]/
const build = (type: KanaType, chars: KanaChar[]): Alphabet => ({
  type,
  label: type === 'hiragana' ? 'Hiragana' : 'Katakana',
  chars,
  base: chars.filter((k) => k.kind === 'base'),
  daku: chars.filter((k) => k.kind === 'dakuten' || k.kind === 'handakuten'),
  yoon: chars.filter((k) => k.kind === 'yoon'),
  pairs: CONFUSING_PAIRS.filter(([a]) => HIRA_RE.test(a) === (type === 'hiragana')),
  sokuon: type === 'hiragana' ? 'っ' : 'ッ',
  n: type === 'hiragana' ? 'ん' : 'ン',
  bigY:
    type === 'hiragana'
      ? { ゃ: 'や', ゅ: 'ゆ', ょ: 'よ' }
      : { ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ' },
  words: type === 'hiragana' ? KANA_WORDS.map(hiraWord) : KATA_QUIZ_WORDS.map(kataWord),
  // Hiraganada uzun ünlü ünlüyü İKİZLEYEREK yazılır (おう, ええ); katakanada
  // tek bir çizgiyle: ー. Aynı sesin iki farklı yazımı, ayrı desen gerekiyor.
  longRe: type === 'hiragana' ? /おう|おお|うう|ええ|いい/ : /ー/,
  longHow:
    type === 'hiragana'
      ? 'Ünlü İKİ hece boyu uzar; yutulursa başka kelime olur.'
      : 'ー işareti kendinden önceki ünlüyü uzatır ve bir hece daha ekler; yutulursa kelime tanınmaz.',
})

const ALPHABET: Record<KanaType, Alphabet> = {
  hiragana: build('hiragana', HIRAGANA),
  katakana: build('katakana', KATAKANA),
}

/** Aynı karakteri iki kez göstermemek için tekilleştirilmiş rastgele seçim. */
function pick<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n)
}

// Karışan çiftler tek haritada tutulabilir: hiragana ile katakana karakterleri
// hiç çakışmaz, dolayısıyla ayırmaya gerek yok.
const CONFUSED = new Map<string, string[]>()
for (const [a, b] of CONFUSING_PAIRS) {
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
function distractors(correct: string, pool: string[], n: number, a: Alphabet): string[] {
  const k = KANA_BY_CHAR.get(correct)
  const out: string[] = []
  const add = (c: string) => {
    if (c !== correct && !out.includes(c) && pool.includes(c)) out.push(c)
  }

  for (const c of shuffle(confusablesOf(correct))) add(c)
  if (out.length < n && k) {
    for (const c of shuffle(a.chars.filter((x) => x.group === k.group).map((x) => x.char))) add(c)
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

function sectionTanima(n: number, a: Alphabet): Question[] {
  const allReadings = a.chars.map((k) => k.romaji)
  return pick(a.base, n).map((k) => {
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

function sectionHatirlama(n: number, a: Alphabet): Question[] {
  const pool = a.base.map((k) => k.char)
  return pick(a.base, n).map((k) => {
    const opts = [k.char, ...distractors(k.char, pool, 3, a)]
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

function sectionUretim(n: number, a: Alphabet): Question[] {
  return pick(a.base, n).map((k) =>
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

function sectionAyirt(n: number, a: Alphabet): Question[] {
  return pick(a.pairs, n).map(([x, y]) => {
    const target = Math.random() < 0.5 ? x : y
    const other = target === x ? y : x
    const k = KANA_BY_CHAR.get(target)!
    const ko = KANA_BY_CHAR.get(other)!
    const extra = distractors(target, a.chars.map((c) => c.char), 2, a).filter((c) => c !== other)
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

function sectionDakuten(n: number, a: Alphabet): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []

  // Yarısı: işaretli karakteri okumak
  for (const k of pick(a.daku, half)) {
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
  const pool = a.chars.map((x) => x.char)
  for (const k of pick(a.daku, n - half)) {
    const opts = [k.char, ...distractors(k.char, pool, 3, a)]
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

function sectionYoon(n: number, a: Alphabet): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []

  for (const k of pick(a.yoon, half)) {
    out.push(
      text({
        section: 'yoon',
        chars: [k.char],
        prompt: 'Bu birleşik sesin okunuşunu yaz',
        showKana: k.char,
        accepts: acceptsFor(k.char),
        answerLabel: k.romaji,
        explain: `${k.char} = ${k.romaji}. Küçük ${Object.keys(a.bigY).join('')} önceki karakterle birleşir ve TEK hece olur.`,
      }),
    )
  }

  // Büyük/küçük ayrımı: きよ (ki-yo, iki hece) ile きょ (kyo, tek hece)
  for (const k of pick(a.yoon, n - half)) {
    const buyuk = k.char[0] + a.bigY[k.char[1]]
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

function sectionKelime(n: number, a: Alphabet): Question[] {
  const half = Math.ceil(n / 2)
  const out: Question[] = []
  // Kısa kelimeler seçmeli, uzunlar açık uçlu — zorluk kademeli olsun
  const kisa = a.words.filter((w) => w.mora <= 3)
  const uzun = a.words.filter((w) => w.mora >= 3)

  for (const w of pick(uzun, half)) {
    out.push(
      text({
        section: 'kelime',
        chars: w.tokens,
        prompt: 'Bu kelimenin okunuşunu yaz',
        showKana: w.kana,
        accepts: [w.reading],
        answerLabel: w.reading,
        explain:
          `${w.kana} = ${w.reading} · ${w.tokens.join(' · ')}` +
          (w.from ? ` — ${w.from} (${w.tr})` : '') +
          (w.note ? ` — ${w.note}` : ''),
      }),
    )
  }

  const allWordReadings = a.words.map((w) => w.reading)
  for (const w of pick(kisa, n - half)) {
    const opts = [w.reading, ...readingDistractors(w.reading, allWordReadings, 3)]
    const { options, answer } = scramble(opts, 0)
    out.push(
      mcq({
        section: 'kelime',
        chars: w.tokens,
        prompt: 'Bu kelime nasıl okunur?',
        showKana: w.kana,
        options,
        optionKana: false,
        answer,
        explain:
          `${w.kana} = ${w.reading} · ${w.tokens.join(' · ')}` +
          (w.from ? ` — ${w.from} (${w.tr})` : '') +
          (w.note ? ` — ${w.note}` : ''),
      }),
    )
  }
  return out
}

/**
 * Kaynak kelime bölümü — SADECE katakana.
 *
 * Katakanada asıl beceri şu: sesi kurduktan sonra "bu hangi kelime?" diye
 * tanımak. メニュー’yü "me-nyu-u" diye söken ama "menu" diyemeyen biri işin
 * yarısında kalmıştır. Şıklar Türkçe anlam olarak veriliyor.
 */
function sectionKaynak(n: number, a: Alphabet): Question[] {
  const havuz = a.words.filter((w) => w.from)
  const anlamlar = havuz.map((w) => w.tr)
  return pick(havuz, n).map((w) => {
    const yanlis: string[] = []
    for (const t of shuffle(anlamlar)) {
      if (yanlis.length >= 3) break
      if (t !== w.tr && !yanlis.includes(t)) yanlis.push(t)
    }
    const { options, answer } = scramble([w.tr, ...yanlis], 0)
    return mcq({
      section: 'kaynak',
      chars: w.tokens,
      prompt: 'Bu kelime ne demek?',
      showKana: w.kana,
      options,
      optionKana: false,
      answer,
      explain:
        `${w.kana} = ${w.reading} ← ${w.from} · ${w.tr}` + (w.note ? ` — ${w.note}` : ''),
    })
  })
}

function sectionKural(n: number, a: Alphabet): Question[] {
  const sokuon = a.words.filter((w) => w.kana.includes(a.sokuon))
  const uzunlar = a.words.filter((w) => a.longRe.test(w.kana))
  const nWords = a.words.filter((w) => w.kana.includes(a.n))

  // Küçük っ / ッ — ses vermez ama sonraki sessizi ikiler
  const sokuonQ = (w: ExamWord): Question => {
    const correct = w.reading
    // Çeldiriciler GERÇEK hataları taklit etmeli, rastgele olmamalı:
    //   yutuk — ikilemeyi hiç duymamak (kappu → kapu). En sık yapılan hata.
    //   tsulu — küçük {sokuon}'yi büyük sanıp "tsu" okumak (kappu → katsupu).
    //   uzun  — ikileme yerine ünlüyü uzatmak (kappu → kaapu). Türk kulağına
    //           en doğal gelen, o yüzden en yanıltıcı olan seçenek.
    //
    // İkizlenmiş sessiz, geri referans yerine açık liste ile aranıyor. Sebebi
    // tarihsel: burada bir geri referans vardı ama dosyaya bozuk bir kontrol
    // karakteri olarak yazılmıştı, desen hiçbir zaman eşleşmedi ve çeldirici
    // kelimenin kendisine eşit kaldı — soru iki şıkla çıkıyordu. Açık liste
    // hem o tuzağa düşmüyor hem de okunması daha kolay.
    //
    // "nn" listede YOK: romajideki çift n sokuondan değil, ん + な行'dan gelir
    // (こんにちは = konnichiwa). Onu ikizleme sanmak yanlış çeldirici üretirdi.
    const DOUBLE = /bb|cc|dd|ff|gg|jj|kk|ll|mm|pp|rr|ss|tt|vv|ww|zz/
    const eslesme = correct.match(DOUBLE)
    const cift = eslesme?.[0]
    const yer = eslesme?.index ?? -1

    // きって → kitte. İkizlemeyi atarsak kite, っ'yi "tsu" okursak kitsute
    // (kittsute DEĞİL — ikizlemenin yerini tsu alır, üstüne eklenmez).
    const yutuk = cift ? correct.replace(cift, cift[0]) : correct.replace('tch', 'ch')
    const tsulu = cift ? correct.replace(cift, 'tsu' + cift[0]) : correct.replace('tch', 'tsuch')

    // Uzatma hatası ikizlemenin OLDUĞU yerde olur: kitte → kiite. Kelimenin
    // ilk ünlüsünü uzatmak (kiite yerine kiitte gibi) gerçek bir hata değil,
    // o yüzden ünlü ikizlemenin hemen öncesinden alınıyor.
    const uzun =
      yer > 0
        ? yutuk.slice(0, yer - 1) + yutuk[yer - 1] + yutuk.slice(yer - 1)
        : yutuk.replace(/([aiueo])([bcdfghjklmnpqrstvwz])/, '$1$1$2')
    // Kısa kelimelerde çeldiriciler çakışabilir; eksik kalırsa şık sayısı
    // düşer — uydurma bir seçenek eklemek soruyu bozmaktan iyi değil.
    const opts = [...new Set([correct, yutuk, tsulu, uzun])].filter(Boolean)
    const { options, answer } = scramble(opts.slice(0, 4), 0)
    return mcq({
      section: 'kural',
      chars: [a.sokuon],
      prompt: `Küçük ${a.sokuon} burada ne yapıyor? Doğru okunuşu seç`,
      showKana: w.kana,
      options,
      optionKana: false,
      answer,
      explain: `${w.kana} = ${correct}. Küçük ${a.sokuon} ses vermez; kendinden sonraki sessizi İKİLER ve orada kısa bir duraklama olur.`,
    })
  }

  // Uzun ünlü — iki hece boyu sürer
  const uzunQ = (w: ExamWord): Question =>
    text({
      section: 'kural',
      chars: w.tokens,
      prompt: 'Uzun ünlüye dikkat — okunuşu yaz',
      showKana: w.kana,
      accepts: [w.reading],
      answerLabel: w.reading,
      explain: `${w.kana} = ${w.reading}. ${a.longHow}`,
    })

  // ん / ン tek başına bir hece uzunluğundadır
  const nQ = (w: ExamWord): Question => {
    const dogru = w.mora
    const opts = [...new Set([String(dogru), String(dogru - 1), String(dogru + 1), String(dogru + 2)])].filter(
      (x) => Number(x) > 0,
    )
    const { options, answer } = scramble(opts.slice(0, 4), 0)
    return mcq({
      section: 'kural',
      chars: [a.n],
      prompt: `Bu kelime kaç hecedir? (${a.n} de bir hece sayılır)`,
      showKana: w.kana,
      options,
      optionKana: false,
      answer,
      explain: `${w.kana} = ${w.tokens.join(' · ')} → ${dogru} hece. ${a.n} Japoncada tek başına bir hece uzunluğundadır${a.type === 'katakana' ? '; ー de öyle' : ''}.`,
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

function sectionCizim(n: number, a: Alphabet): Question[] {
  return pick(a.base, n).map((k) => ({
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
  /** Hangi alfabe */
  kana: KanaType
  /** Kısa sınav mı, tam sınav mı */
  full: boolean
  /** Çizim bölümü dahil edilsin mi */
  withWriting: boolean
}

/**
 * Bölüm başına soru sayısı — TEK KAYNAK.
 *
 * Kurulum ekranı da buradan okur. Ayrı ayrı yazsaydık ekranda "8 soru" yazıp
 * sınavda 7 çıkabilirdi: bazı bölümler havuzla sınırlıdır (karışan çift sayısı
 * kadar soru üretilebilir), o yüzden sayı burada kırpılıyor.
 */
export function examPlan(
  full: boolean,
  withWriting: boolean,
  kt: KanaType = 'hiragana',
): { section: Section; count: number }[] {
  const f = full
  const a = ALPHABET[kt]
  const plan: { section: Section; count: number }[] = [
    { section: 'tanima', count: f ? 12 : 6 },
    { section: 'hatirlama', count: f ? 10 : 5 },
    { section: 'uretim', count: f ? 10 : 5 },
    { section: 'ayirt', count: Math.min(f ? 8 : 4, a.pairs.length) },
    { section: 'dakuten', count: f ? 8 : 4 },
    { section: 'yoon', count: f ? 6 : 3 },
    { section: 'kelime', count: f ? 12 : 6 },
    { section: 'kural', count: f ? 6 : 3 },
  ]
  // Kaynak kelime bölümü hiraganada anlamsız: orada kelimeler yabancı değil.
  if (kt === 'katakana') plan.push({ section: 'kaynak', count: f ? 8 : 4 })
  if (withWriting) plan.push({ section: 'cizim', count: f ? 4 : 2 })
  return plan
}

export function buildExam(o: ExamOptions): Question[] {
  seq = 0
  const a = ALPHABET[o.kana]
  const plan = examPlan(o.full, o.withWriting, o.kana)
  const n = (s: Section) => plan.find((p) => p.section === s)?.count ?? 0
  const qs: Question[] = [
    ...sectionTanima(n('tanima'), a),
    ...sectionHatirlama(n('hatirlama'), a),
    ...sectionUretim(n('uretim'), a),
    ...sectionAyirt(n('ayirt'), a),
    ...sectionDakuten(n('dakuten'), a),
    ...sectionYoon(n('yoon'), a),
    ...sectionKelime(n('kelime'), a),
    ...sectionKural(n('kural'), a),
  ]
  if (o.kana === 'katakana') qs.push(...sectionKaynak(n('kaynak'), a))
  if (o.withWriting) qs.push(...sectionCizim(n('cizim'), a))
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

export function evaluate(
  questions: Question[],
  answers: Map<string, Answer>,
  kt: KanaType = 'hiragana',
): ExamResult {
  const a = ALPHABET[kt]
  const h = kt === 'hiragana'
  // Teşhis kartlarının yönlendireceği sayfalar alfabeye göre değişir
  const tabloLink = { to: `/kana/${kt}`, label: `${a.label} tablosu` }
  const kelimeLink = h
    ? { to: '/kana-kelime', label: 'Kelime okuma alıştırması' }
    : { to: '/katakana-kelime', label: 'Katakana kelime listesi' }
  const kuralLink = h
    ? { to: '/kana-kurallar', label: 'Özel kurallar sayfası' }
    : { to: '/katakana-kelime', label: 'Katakana kelime listesi' }
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
  const verdict = verdictFor(percent, kt)

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
        tip: `Bütün tabloyu birden çalışma. Satır satır git: önce ${h ? 'あ行' : 'ア行'} (5 harf), oturana kadar tekrarla, sonra ${h ? 'か行' : 'カ行'} ekle. Her satırı hem tanıyabilmeli hem de kâğıda yazabilmelisin. Günde bir-iki satır yeterli; hepsini birden ezberlemeye çalışmak en sık yapılan hata.`,
        link: tabloLink,
      },
    ])
  }

  if (pct('kelime') < 70 && harfOrt >= 80) {
    w.push({
      id: 'sokme',
      title: 'Harfleri biliyorsun ama kelime sökemiyorsun',
      detail: `Tek tek harflerde %${Math.round(harfOrt)} başarın var, kelimelerde %${Math.round(pct('kelime'))}. Bu çok yaygın bir aşama: harf tanımak ile akıcı okumak ayrı beceriler.`,
      tip: 'Kelimeyi bir bütün olarak çözmeye çalışma. Parmağınla hece hece git, her heceyi sesli söyle, sonra hepsini birleştir. Günde 10 kelime yeter — hız kendiliğinden gelir.',
      link: kelimeLink,
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
      tip: h
        ? 'Karışan çifti ASLA ayrı ayrı çalışma — yan yana koy ve aradaki tek farkı bul (さ tek kıvrımlı, き iki çizgili gibi). Farkı bir cümleyle kendine anlat; beyin farkı hatırlar, şekli değil.'
        : 'Katakanada şeklin kendisi değil ÇİZGİNİN YÖNÜ ayırt eder. Çizgi sırasını öğren, iş kendiliğinden çözülür: シ ve ン soldan sağa yatay başlar, ツ ve ソ yukarıdan aşağı dik iner. Yani シ/ン’in noktaları yan yana, ツ/ソ’nunkiler üst üstedir.',
      link: { to: `/kana/${kt}`, label: 'Karışan çiftler tablosu' },
    })
  }

  if (pct('dakuten') < 70) {
    w.push({
      id: 'dakuten',
      title: 'Dakuten işaretleri oturmamış',
      detail: `゛ ve ゜ bölümünde %${Math.round(pct('dakuten'))} yaptın.`,
      tip: `Ezberlenecek 46 yeni karakter yok, ezberlenecek 4 kural var: k→g, s→z, t→d, h→b. Handakuten (゜) yalnızca ${h ? 'は' : 'ハ'} satırına gelir ve h→p yapar. Kuralı bilirsen tablo kendiliğinden çıkar.`,
      link: { to: `/kana/${kt}`, label: 'Dakuten tablosu' },
    })
  }

  if (pct('yoon') < 70) {
    w.push({
      id: 'yoon',
      title: 'Yōon (birleşik sesler) eksik',
      detail: `${h ? 'きゃ / きゅ / きょ' : 'キャ / キュ / キョ'} bölümünde %${Math.round(pct('yoon'))} yaptın.`,
      tip: h
        ? 'Kilit nokta boyut: きよ iki hecedir (ki-yo), きょ tek hecedir (kyo). Küçük yazılan ゃゅょ önceki harfe yapışır ve onunla TEK ses olur. Yazarken küçük olanı karenin alt köşesine sıkıştır.'
        : 'Kilit nokta boyut: キヨ iki hecedir (ki-yo), キョ tek hecedir (kyo). Katakanada bu daha çok yanıltır çünkü ニュース, メニュー gibi günlük kelimelerin tam ortasında durur.',
      link: { to: `/kana/${kt}`, label: 'Yōon tablosu' },
    })
  }

  // Katakanaya özel: sesi kuruyor ama kelimeyi tanıyamıyor
  if (!h && bySection.some((b) => b.section === 'kaynak') && pct('kaynak') < 70 && pct('kelime') >= 70) {
    w.push({
      id: 'kaynak',
      title: 'Okuyorsun ama kelimeyi tanımıyorsun',
      detail: `Kelime sökmede %${Math.round(pct('kelime'))} yaparken anlamda %${Math.round(pct('kaynak'))} kaldın. Sesi doğru kuruyorsun, sonrasında duruyorsun.`,
      tip: 'Sesi kurduktan sonra YÜKSEK SESLE söyle. Katakana kelimeleri gözle değil kulakla tanınır: "e-re-be-e-ta-a" yazılı hâlde bir şey demez, sesli söyleyince "elevator" olur. Ayrıca kalıpları öğren: sondaki ト/ス/ク çoğu zaman İngilizcedeki tek bir sessizdir, ル genelde "l"dir.',
      link: { to: '/katakana-kelime', label: 'Kaynağıyla kelime listesi' },
    })
  }

  if (pct('kural') < 70) {
    w.push({
      id: 'kural',
      title: 'Özel kurallarda takılıyorsun',
      detail: h
        ? `Küçük っ, uzun ünlü ve ん bölümünde %${Math.round(pct('kural'))} yaptın.`
        : `Uzatma ー, küçük ッ ve ン bölümünde %${Math.round(pct('kural'))} yaptın.`,
      tip: h
        ? 'Üçü de "sessiz ama yer kaplayan" şeyler. っ ses vermez, sonraki sessizi ikiler (がっこう = gak-kou). Uzun ünlü iki hece boyu sürer (おおきい). ん tek başına bir hece uzunluğundadır. Japoncada her hece EŞİT uzunlukta okunur — ritmi tutturmak telaffuzun yarısıdır.'
        : 'Üçü de "yer kaplayan" işaretler ve katakanada hepsi çok sık. ー kendinden önceki ünlüyü uzatır ve BİR HECE ekler: コーヒー ko·o·hi·i, yani dört hece — iki değil. Uzatmayı yutup コヒ demek kelimeyi tanınmaz yapar. ッ sonraki sessizi ikiler (ベッド = bed·do). ン tek başına bir hecedir.',
      link: kuralLink,
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

/** Genel hüküm — yüzdeye göre tek paragraf, alfabeye göre farklı yönlendirme. */
function verdictFor(percent: number, kt: KanaType): ExamResult['verdict'] {
  const h = kt === 'hiragana'
  const label = h ? 'Hiragana' : 'Katakana'

  if (percent >= 95) {
    return {
      title: `${label} bitti`,
      text: h
        ? 'Bu sonuç "tabloyu ezberledim"in ötesinde. Harfleri tanıyor, hatırlıyor ve kelime sökebiliyorsun. Katakana’ya geçebilirsin — mantığı aynı, sadece biçimler değişiyor.'
        : 'İki kana da tamam. Artık Genki’nin derslerine geçebilirsin: bundan sonra kanji ayrı çalışılmaz, derslerin içinde gelir. Katakanayı canlı tutmanın yolu menü ve ürün adı okumak; çalışmaya ayrı zaman ayırmana gerek yok.',
      tone: 'ok',
    }
  }
  if (percent >= 85) {
    return {
      title: 'Neredeyse bitti',
      text: h
        ? 'Temel sağlam. Aşağıdaki birkaç eksiği kapat, sonra rahatça katakana’ya geç. Hiragana’yı tamamen bırakma; kelime okumaya devam et ki hız otursun.'
        : 'Temel sağlam. Katakanada %100’ü beklemek gereksiz — hiraganaya göre çok daha az göreceğin için tam oturması zaman alır. Aşağıdaki eksikleri not al ve Genki derslerine geç; eksik kalanı kelime okuyarak kapatırsın.',
      tone: 'ok',
    }
  }
  if (percent >= 70) {
    return {
      title: 'İyi yoldasın ama bitmedi',
      text: h
        ? 'Karakterlerin çoğu oturmuş, belirli noktalarda boşluk var. Aşağıdaki teşhislere göre birkaç gün daha çalış, sonra sınavı tekrarla. Şimdi katakana’ya geçmek ikisini birden karıştırmana yol açar.'
        : 'Karakterlerin çoğu oturmuş. Katakanada bu seviye derslere başlamak için yeterli sayılır; ama karışan çiftleri (シ/ツ, ソ/ン) çözmeden geçme, onlar kendiliğinden düzelmez.',
      tone: 'warn',
    }
  }
  return {
    title: 'Biraz daha çalışmak lazım',
    text: h
      ? 'Bu sonuç kötü değil, erken demek. Hiragana bir haftada oturmaz; aralıklı tekrarla birkaç güne oturur. Aşağıdaki eksiklerden yalnızca en üsttekiyle başla — hepsini birden çalışmak işe yaramaz.'
      : 'Bu sonuç kötü değil, erken demek. Katakana hiraganadan zor oturur çünkü günlük metinde çok daha az görünür — suç sende değil, maruz kalma azlığında. Aşağıdaki eksiklerden yalnızca en üsttekiyle başla ve her gün birkaç katakana kelime oku.',
    tone: 'bad',
  }
}
