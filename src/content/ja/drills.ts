import type { Exercise } from '@/types'
import { conjugateVerb, detectGroup } from '@/lib/conjugate-ja'
import { shuffle } from '@/lib/shuffle'
import { KANJI_BY_CHAR } from './kanji-n5'
import { VOCAB_JA_BY_ID } from './vocab'

// Otomatik alıştırma üreticileri.
//
// Ders içeriğini elle yazmak yerine, dersin zaten tanıttığı malzemeden
// (kelimeler, kanjiler, fiiller) soru üretiyoruz. Böylece her ders elle
// yazılmış 8 soru yerine 20+ soruyla çalışılabiliyor.
//
// DEĞİŞMEZ KURAL — çeldiriciler:
// Bir sorunun yanlış şıkları YALNIZCA öğrencinin daha önce gördüğü
// malzemeden seçilir. Hiç görülmemiş bir kelime şık olarak çıkarsa öğrenci
// "bunu tanımıyorum, demek ki cevap değil" diye eleyerek doğruya ulaşır ve
// soru ölçmeyi bırakır. Bu yüzden her üreticiye `seen` listesi verilir.

let n = 0
const did = () => `ja-drill-${++n}`

const mcq = (
  prompt: string,
  options: string[],
  answer: number,
  explanation?: string,
  skill: Exercise['skill'] = 'reading',
): Exercise => ({ id: did(), type: 'mcq', prompt, options, answer, explanation, skill })

/** Doğru cevabı karıştırıp şık dizisini ve doğru indeksi verir. */
function options(correct: string, distractors: string[]): { opts: string[]; answer: number } {
  const opts = shuffle([correct, ...distractors])
  return { opts, answer: opts.indexOf(correct) }
}

/** Aynı listede tekrar etmeyen, doğrudan farklı `count` tane çeldirici. */
function pickDistractors(correct: string, pool: string[], count = 3): string[] {
  const out: string[] = []
  for (const c of shuffle(pool)) {
    if (c === correct || out.includes(c)) continue
    out.push(c)
    if (out.length === count) break
  }
  return out
}

// ————————————————————————— Kelime —————————————————————————

/**
 * Kelime alıştırmaları: iki yönde de sorar.
 *   - Türkçe → Japonca  ("kitap" hangisi?)
 *   - Japonca → Türkçe  (「本」 ne demek?)
 *
 * @param ids     bu derste tanıtılan kelime id'leri
 * @param seenIds önceki derslerde geçmiş kelime id'leri (çeldirici havuzu)
 */
export function vocabDrill(ids: string[], seenIds: string[] = [], max = 14): Exercise[] {
  const words = ids.map((id) => VOCAB_JA_BY_ID.get(id)).filter(Boolean)
  const pool = [...ids, ...seenIds].map((id) => VOCAB_JA_BY_ID.get(id)).filter(Boolean)
  if (words.length < 2) return []

  const mcqs: Exercise[] = []

  // Türkçe → Japonca (üretime yakın yön: anlamı biliyorsun, kelimeyi bulman lazım)
  for (const w of shuffle(words).slice(0, Math.ceil(max * 0.55))) {
    if (!w) continue
    const d = pickDistractors(
      w.term,
      pool.filter((p) => p && p.tr !== w.tr).map((p) => p!.term),
    )
    if (d.length < 3) continue
    const { opts, answer } = options(w.term, d)
    mcqs.push(mcq(`“${w.tr}” hangisi?`, opts, answer, w.reading !== w.term ? `${w.term} = ${w.reading}` : undefined, 'vocab'))
  }

  // Japonca → Türkçe (tanıma yönü)
  for (const w of shuffle(words).slice(0, Math.floor(max * 0.45))) {
    if (!w) continue
    const d = pickDistractors(
      w.tr,
      pool.filter((p) => p && p.term !== w.term).map((p) => p!.tr),
    )
    if (d.length < 3) continue
    const { opts, answer } = options(w.tr, d)
    mcqs.push(mcq(`「${w.term}」 ne demek?`, opts, answer, w.reading !== w.term ? `Okunuşu: ${w.reading}` : undefined, 'vocab'))
  }

  // Toplu eşleştirme — tek tek sormaktan hızlı, birbirine yakın kelimeleri ayırtır
  const rounds = matchRounds(
    words.filter(Boolean).map((w) => ({ left: w!.term, right: w!.tr })),
    2,
  )

  return [...shuffle(mcqs), ...rounds]
}

/** 5'li eşleştirme turları. Çoktan seçmeli yığınını kırar, hızlı çalıştırır. */
function matchRounds(pairs: { left: string; right: string }[], maxRounds: number): Exercise[] {
  const out: Exercise[] = []
  const items = shuffle(pairs)
  for (let i = 0; i + 3 <= items.length && out.length < maxRounds; i += 5) {
    out.push({
      id: did(),
      type: 'match',
      prompt: 'Eşleştir.',
      pairs: items.slice(i, i + 5),
      skill: 'vocab',
    })
  }
  return out
}

// ————————————————————————— Kanji —————————————————————————

/**
 * Kanji alıştırmaları: anlam, okunuş ve kelime içinde tanıma.
 *
 * @param chars     bu derste tanıtılan kanjiler
 * @param seenChars önceki derslerde geçmiş kanjiler (çeldirici havuzu)
 */
export function kanjiDrill(chars: string[], seenChars: string[] = [], max = 20): Exercise[] {
  const set = chars.map((c) => KANJI_BY_CHAR.get(c)).filter(Boolean)
  const pool = [...chars, ...seenChars].map((c) => KANJI_BY_CHAR.get(c)).filter(Boolean)
  const out: Exercise[] = []

  // 1. Anlam: 「山」 ne demek?
  for (const k of shuffle(set).slice(0, Math.ceil(max * 0.4))) {
    if (!k) continue
    const meaning = k.meaningsTr[0]
    const d = pickDistractors(
      meaning,
      pool.filter((p) => p && p.char !== k.char).map((p) => p!.meaningsTr[0]),
    )
    if (d.length < 3) continue
    const { opts, answer } = options(meaning, d)
    out.push(mcq(`「${k.char}」 ne demek?`, opts, answer, `${k.strokes} çizgi`, 'reading'))
  }

  // 2. Ters yön: "dağ" hangi kanji?
  for (const k of shuffle(set).slice(0, Math.ceil(max * 0.3))) {
    if (!k) continue
    const meaning = k.meaningsTr[0]
    const d = pickDistractors(
      k.char,
      pool.filter((p) => p && p.meaningsTr[0] !== meaning).map((p) => p!.char),
    )
    if (d.length < 3) continue
    const { opts, answer } = options(k.char, d)
    out.push(mcq(`“${meaning}” hangi kanji ile yazılır?`, opts, answer, undefined, 'reading'))
  }

  // 3. Kelime okuma — kanjiyi kelime içinde görmek asıl iştir
  const words = set.flatMap((k) => (k!.words ?? []).slice(0, 2))
  const readingPool = [
    ...words.map((w) => w.reading),
    ...pool.flatMap((k) => (k!.words ?? []).map((w) => w.reading)),
  ]
  for (const w of shuffle(words).slice(0, Math.ceil(max * 0.3))) {
    const d = pickDistractors(w.reading, readingPool)
    if (d.length < 3) continue
    const { opts, answer } = options(w.reading, d)
    out.push(mcq(`「${w.term}」 nasıl okunur?`, opts, answer, `${w.term} = ${w.tr}`, 'reading'))
  }

  const rounds = matchRounds(
    set.filter(Boolean).map((k) => ({ left: k!.char, right: k!.meaningsTr[0] })),
    2,
  )

  return [...shuffle(out), ...rounds]
}

/** Kanji yazma alıştırmaları — çizerek. Sayı sınırlı tutulur, çizim yavaştır. */
export function kanjiWriteDrill(chars: string[], count = 5): Exercise[] {
  return shuffle(chars)
    .slice(0, count)
    .map((c) => {
      const k = KANJI_BY_CHAR.get(c)
      return {
        id: did(),
        type: 'write' as const,
        prompt: 'Karakteri çizerek yaz. Çizgi sırasına dikkat et.',
        target: c,
        reading: k?.kun[0]?.replace(/-/g, '') || k?.on[0] || '',
        tr: k?.meaningsTr.join(', '),
        skill: 'writing' as const,
      }
    })
}

// ————————————————————————— Edatlar —————————————————————————

/** Öğrencinin o ana kadar gördüğü edatlar — çeldirici havuzu buradan gelir. */
export const PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'から', 'まで'] as const

export interface ParticleItem {
  /** ___ boşluk yerine geçer */
  sentence: string
  answer: string
  tr: string
  /** Neden o edat — kısa gerekçe */
  why: string
  /**
   * Bu cümlede DE kabul edilebilen edatlar (学校に行く / 学校へ行く gibi).
   * Çeldirici olarak kullanılmazlar — iki doğru şıklı soru sorulmaz —
   * ama yazma biçiminde cevap olarak kabul edilirler.
   */
  also?: string[]
}

/**
 * Edat alıştırması. N5'te en çok hata yapılan yer burasıdır, o yüzden hem
 * boşluk doldurma (üretim) hem çoktan seçmeli (tanıma) biçiminde sorulur.
 */
export function particleDrill(items: ParticleItem[], pool: string[] = [...PARTICLES]): Exercise[] {
  const out: Exercise[] = []

  for (const it of items) {
    // Aynı cümlede geçerli olan diğer edatlar çeldirici olamaz
    const safe = pool.filter((p) => !it.also?.includes(p))
    const d = pickDistractors(it.answer, safe)
    if (d.length === 3) {
      const { opts, answer } = options(it.answer, d)
      out.push({
        id: did(),
        type: 'mcq',
        prompt: `Hangi edat gelir?  ${it.sentence.replace('___', '＿')}`,
        options: opts,
        answer,
        explanation: `${it.tr} — ${it.why}`,
        skill: 'grammar',
      })
    }
  }

  // Yarısını bir de yazdırarak sor: tanımak ile üretmek farklı beceridir
  for (const it of shuffle(items).slice(0, Math.ceil(items.length / 2))) {
    out.push({
      id: did(),
      type: 'fill',
      prompt: 'Boşluğa doğru edatı yaz.',
      sentence: it.sentence,
      answers: [it.answer, ...(it.also ?? [])],
      translation: it.tr,
      hint: 'tek karakter',
      skill: 'grammar',
    })
  }

  return shuffle(out)
}

// ————————————————————————— Fiil çekimi —————————————————————————

const FORM_LABEL: Record<string, string> = {
  masu: 'ます biçimi (kibar şimdiki/geniş)',
  masen: 'ません biçimi (kibar olumsuz)',
  mashita: 'ました biçimi (kibar geçmiş)',
  masendeshita: 'ませんでした biçimi (kibar geçmiş olumsuz)',
  te: 'て biçimi',
  nai: 'ない biçimi (sade olumsuz)',
  ta: 'た biçimi (sade geçmiş)',
  temasu: 'ています biçimi (sürüyor)',
  tai: 'たい biçimi (istek)',
  potential: 'yeterlilik biçimi (‑ebilmek)',
}

export interface ConjugationTarget {
  /** Sözlük biçimi, kanjili */
  dict: string
  /** Sözlük biçiminin kana okunuşu */
  reading: string
  tr: string
}

/**
 * Fiil çekim alıştırması. Çekim motoru (conjugate-ja) zaten doğru biçimleri
 * üretiyor; çeldiriciler de aynı fiilin BAŞKA biçimlerinden seçiliyor —
 * yani "hangisi kulağa Japonca geliyor" tahminiyle bulunamıyor, gerçekten
 * hangi ekin hangi anlama geldiğini bilmek gerekiyor.
 */
export function conjugationDrill(verbs: ConjugationTarget[], forms: string[], max = 14): Exercise[] {
  const all: { verb: ConjugationTarget; form: string; term: string; reading: string; others: string[] }[] = []

  for (const v of verbs) {
    const group = detectGroup(v.dict, v.reading)
    const conj = conjugateVerb(v.dict, v.reading, group)

    for (const form of forms) {
      const target = conj.forms[form]
      if (!target) continue
      all.push({
        verb: v,
        form,
        term: target.term,
        reading: target.reading,
        // Çeldirici: aynı fiilin BAŞKA biçimleri
        others: Object.entries(conj.forms)
          .filter(([id, val]) => id !== form && val.term !== target.term)
          .map(([, val]) => val.term),
      })
    }
  }

  const picked = shuffle(all).slice(0, max)
  const out: Exercise[] = []

  picked.forEach((item, i) => {
    const label = FORM_LABEL[item.form] ?? item.form

    // Üçte biri yazdırılarak sorulur: tanımak ile üretmek farklı beceridir
    if (i % 3 === 2) {
      out.push({
        id: did(),
        type: 'fill',
        prompt: `「${item.verb.dict}」 fiilini ${label} hâline çevir.`,
        sentence: '___',
        answers: [item.term, item.reading],
        translation: `${item.verb.dict} = ${item.verb.tr}`,
        hint: item.verb.dict,
        skill: 'grammar',
      })
      return
    }

    const d = pickDistractors(item.term, item.others)
    if (d.length < 3) return
    const { opts, answer } = options(item.term, d)
    out.push({
      id: did(),
      type: 'mcq',
      prompt: `「${item.verb.dict}」 (${item.verb.tr}) — ${label} hangisi?`,
      options: opts,
      answer,
      explanation: `${item.verb.dict} → ${item.term} (${item.reading})`,
      skill: 'grammar',
    })
  })

  return out
}
