import { KANA_WORDS, moraCount, readingOf, tokenize } from './kana-words'
import { KATA_QUIZ_WORDS, kataMoraCount, kataReading, kataTokenize } from './katakana-words'

// İki yeni alıştırmanın ortak kelime havuzu.
//
// NEDEN AYRI BİR DOSYA:
// Hiragana ve katakana listeleri farklı kurulmuş — birinde `reading` istisnası
// var, ötekinde `from` kaynağı; okuma ve heceleme işlevleri de ayrı. Her iki
// alıştırmanın bu farkları tek tek bilmesi gerekmesin diye kelimeler burada
// tek bir biçime indirgeniyor.
//
// `traits` alanı özellikle önemli: mora sayma alıştırması rastgele kelime
// seçemez. Kolay kelimelerde (ねこ, やま) mora saymak zaten hata yapılmayan
// bir iş; öğretici olan kelimeler ん, っ ve uzun ünlü içerenlerdir. Havuz o
// yüzden bu işaretlere göre süzülebiliyor.

export type DrillKana = 'hiragana' | 'katakana' | 'karisik'

/** Bir kelimeyi zor kılan yapılar. */
export type Trait = 'n' | 'sokuon' | 'uzun' | 'yoon'

export interface DrillWord {
  kana: string
  /** Romaji okunuş */
  reading: string
  /** Türkçe karşılık */
  tr: string
  /** Mora birimleri — heceleme şeridi bunu gösterir */
  tokens: string[]
  mora: number
  type: 'hiragana' | 'katakana'
  traits: Trait[]
}

const HIRA_LONG = /おう|おお|うう|ええ|いい|ああ|えい/
const YOON = /[ゃゅょャュョ]/

function traitsOf(kana: string, type: 'hiragana' | 'katakana'): Trait[] {
  const t: Trait[] = []
  if (kana.includes(type === 'hiragana' ? 'ん' : 'ン')) t.push('n')
  if (kana.includes(type === 'hiragana' ? 'っ' : 'ッ')) t.push('sokuon')
  if (type === 'hiragana' ? HIRA_LONG.test(kana) : kana.includes('ー')) t.push('uzun')
  if (YOON.test(kana)) t.push('yoon')
  return t
}

const HIRA: DrillWord[] = KANA_WORDS.map((w) => ({
  kana: w.kana,
  reading: readingOf(w.kana),
  tr: w.tr,
  tokens: tokenize(w.kana),
  mora: moraCount(w.kana),
  type: 'hiragana' as const,
  traits: traitsOf(w.kana, 'hiragana'),
}))

const KATA: DrillWord[] = KATA_QUIZ_WORDS.map((w) => ({
  kana: w.kana,
  reading: kataReading(w.kana),
  tr: w.tr,
  tokens: kataTokenize(w.kana),
  mora: kataMoraCount(w.kana),
  type: 'katakana' as const,
  traits: traitsOf(w.kana, 'katakana'),
}))

/**
 * Alıştırma havuzu.
 *
 * Tek moralı kelimeler (て, め) elenir: ne yazma ne de sayma alıştırmasında
 * öğretecek bir şeyleri var — "kaç hece?" sorusunun cevabı bakar bakmaz belli.
 */
export function drillPool(kana: DrillKana): DrillWord[] {
  const havuz = kana === 'hiragana' ? HIRA : kana === 'katakana' ? KATA : [...HIRA, ...KATA]
  return havuz.filter((w) => w.mora >= 2)
}

/**
 * Mora sayma için havuz — zor yapılar ağırlıklı.
 *
 * İşaretli kelimeler listeye İKİ kez giriyor, yani seçilme şansları iki kat.
 * Tamamen işaretlilere indirgemek de yanlış olurdu: o zaman "her kelimede bir
 * tuzak var" alışkanlığı oluşur ve düz kelimede de fazladan hece sayılır.
 */
export function moraPool(kana: DrillKana): DrillWord[] {
  const havuz = drillPool(kana)
  const zor = havuz.filter((w) => w.traits.length > 0)
  return [...havuz, ...zor]
}

export const TRAIT_TR: Record<Trait, { label: string; why: string }> = {
  n: { label: 'ん / ン', why: 'Tek başına bir hece uzunluğundadır; önceki heceye yapışmaz.' },
  sokuon: { label: 'küçük っ / ッ', why: 'Ses vermez ama bir hece yer kaplar — orada kısa bir duraklama olur.' },
  uzun: { label: 'uzun ünlü', why: 'İki hece boyu sürer; tek hece sayılırsa kelime kısalır ve başka kelime olur.' },
  yoon: { label: 'yōon', why: 'Küçük ゃゅょ önceki karaktere yapışır — ikisi birlikte TEK hecedir.' },
}
