// Japonca metni TÜRKÇE okunuşa çevirir.
//
// Neden: Windows'ta Japonca konuşma sesi kurulu değilse tarayıcı kana metnini
// sessizce yutar (İngilizce motor karakterleri okuyamaz, ses hiç çıkmaz).
// Türkçenin ses envanteri Japoncaya şaşırtıcı derecede yakın olduğu için
// Türkçe sesle okutulan bir çeviri yazı, hiç ses olmamasından çok daha iyidir:
//   し → şi,  ち → çi,  や → ya,  ふ → fu,  ら → ra
//
// Bu bir "yaklaşık okuma"dır; asıl Japonca ses kurulduğunda devre dışı kalır.

import { toRomaji } from 'wanakana'

/** Romaji hecelerinin Türkçe yazımı — uzunlar önce gelmeli. */
const MAP: [RegExp, string][] = [
  // Yōon ve özel birleşimler
  [/shch/g, 'şç'],
  [/sha/g, 'şa'],
  [/shu/g, 'şu'],
  [/sho/g, 'şo'],
  [/shi/g, 'şi'],
  [/sh/g, 'ş'],
  [/cha/g, 'ça'],
  [/chu/g, 'çu'],
  [/cho/g, 'ço'],
  [/chi/g, 'çi'],
  [/ch/g, 'ç'],
  [/tsu/g, 'tsu'],
  [/ts/g, 'ts'],
  [/ja/g, 'ca'],
  [/ju/g, 'cu'],
  [/jo/g, 'co'],
  [/ji/g, 'ci'],
  [/j/g, 'c'],
  [/ya/g, 'ya'],
  [/yu/g, 'yu'],
  [/yo/g, 'yo'],
  // Katakanaya özgü yabancı ses birleşimleri (ファ フィ フェ フォ ティ ディ ウェ)
  // wanakana bunları "fya/fyi/fye/fyo" gibi çevirir; Türkçe okunuşu düzeltiyoruz
  [/fy([aieo])/g, 'f$1'],
  [/vy([aieo])/g, 'v$1'],
  [/thi/g, 'ti'],
  [/dhi/g, 'di'],
  // Tekil sesler
  [/wo/g, 'o'], // を nesne eki "o" okunur
  [/w/g, 'v'], // わ → va (Türkçe seste "w" yok)
]

/** Uzun ünlüyü Türkçe seste duyulur kılmak için ünlüyü ikile: ō → oo */
const LONG: [RegExp, string][] = [
  [/ā/g, 'aa'],
  [/ī/g, 'ii'],
  [/ū/g, 'uu'],
  [/ē/g, 'ee'],
  [/ō/g, 'oo'],
  [/â/g, 'aa'],
  [/û/g, 'uu'],
  [/ô/g, 'oo'],
]

/**
 * Japonca (kana/kanji karışık) metni Türkçe okunuşa çevirir.
 * Kanji varsa wanakana onu olduğu gibi bırakır; bu durumda çeviri eksik kalır,
 * çağıran taraf `reading` (kana okunuşu) vermeyi tercih etmelidir.
 */
/**
 * Japonca boşluksuz yazılır; romaji'ye çevirince tek bir dev kelime çıkar ve
 * ses motoru onu hızlı, yapışık okur. Yazı türü değişimleri (kana↔katakana↔kanji)
 * çoğu zaman kelime sınırıdır — oralara boşluk koyup okunuşu ayırıyoruz.
 */
const RUNS = /[ぁ-ゟ]+|[ァ-ヿー]+|[㐀-鿿]+|[^ぁ-ヿ㐀-鿿]+/g

function segment(text: string): string[] {
  return text.match(RUNS) ?? [text]
}

/**
 * Konu eki は "wa" okunur ama "ha" yazılır — Japoncanın en sık yazım-okuma
 * uyuşmazlığı. Ek olduğu kesin değildir, elenerek bulunuyor:
 *   • kelimenin başında değil       (はな, はしる, はじめまして korunur)
 *   • ardından ん gelmiyor          (ごはん, はんぶん korunur)
 *   • öncesinde は yok              (はは "haha" korunur)
 *
 * Bu üçü tek başına yetmiyordu: おはよう da üçünü de geçiyor ve "ovayou"
 * okunuyordu. Eksik olan şuydu — konu eki bir ÖBEĞİN SONUNDA durur. Ardından
 * kana geliyorsa は kelimenin içindedir:
 *   わたしは → は’den sonra kana yok, ek        → wa
 *   おはよう → は’den sonra よ var, kelime içi  → ha
 *
 * Tek istisna baştan sona kana yazılmış CÜMLELER: 「わたしはがくせいです」de
 * ek de kelime de kana, は’den sonra yine kana geliyor. Orada cümle olduğunu
 * anlamak gerekiyor — kanji, boşluk, noktalama ya da です/ます ile biten bir
 * yüklem varsa bu bir cümledir.
 *
 * Bir de おはようございます var: hem ます ile bitiyor hem は’den sonra kana
 * geliyor, yani cümle sanılıyor. Onu şu ayrım eliyor — konu eki bir öbeğin
 * ARDINDAN gelir, kelimenin ikinci harfi olmaz. Öncesinde kanji varsa
 * (私は, 猫は) sınır zaten bellidir ve は kesinlikle ektir.
 */
const SENTENCE_MARK = /[㐀-鿿\s、。「」！？!?,.]/
const PREDICATE_END = /(です|ですか|ます|ますか|ました|ません|でした|ください|でしょう)$/
const KANA_CH = /[ぁ-ゟァ-ヿー]/
const BOUNDARY = /[\s、。「」！？!?,.]/

function fixTopicParticle(kana: string): string {
  const c = [...kana]
  const sentence = SENTENCE_MARK.test(kana) || PREDICATE_END.test(kana)
  return c
    .map((ch, i) => {
      if (ch !== 'は') return ch
      const prev = c[i - 1]
      const next = c[i + 1]

      // Kelime başı — boşluk ya da noktalamadan sonra da kelime başıdır
      if (i === 0 || !prev || BOUNDARY.test(prev)) return ch
      // はは "anne" korunur; ama ははは üçlüsünde sonuncusu ektir
      // (「はははせんせいです」 = haha wa sensei desu)
      if (prev === 'は' && c[i - 2] !== 'は') return ch
      if (next === 'ん') return ch // ごはん, はんぶん

      // Öncesinde kanji/latin var: sınır belli, は ektir (私は, AはBです)
      if (!KANA_CH.test(prev)) return 'わ'

      // Buradan sonrası baştan sona kana; ayırt etmek zor.
      if (i === 1) return ch // おはよう — ek olamayacak kadar başta
      if (!next || !KANA_CH.test(next)) return 'わ' // わたしは, こんにちは
      return sentence ? 'わ' : ch // わたしはがくせいです
    })
    .join('')
}

export function jaToTurkishSpeech(text: string): string {
  let s = segment(fixTopicParticle(text))
    .map((run) => toRomaji(run))
    .join(' ')
  for (const [re, to] of LONG) s = s.replace(re, to)
  s = s.toLowerCase()
  for (const [re, to] of MAP) s = s.replace(re, to)

  // Japonca noktalama → Türkçe noktalama (ses motoru duraklasın diye)
  s = s
    .replace(/。/g, '. ')
    .replace(/、/g, ', ')
    .replace(/[「」『』]/g, ' ')
    .replace(/[・･]/g, ' ')
    .replace(/？/g, '? ')
    .replace(/！/g, '! ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim()

  return s
}

/** Metinde okunamayacak (romaji'ye dönmemiş) Japonca karakter kaldı mı? */
export function hasUnreadableJa(text: string): boolean {
  return /[㐀-鿿]/.test(text)
}

/**
 * Tek bir kana için "nasıl okunur" ipucu — kana tablosundaki trHint yoksa
 * buradan üretilir.
 */
export function kanaTurkishHint(kana: string): string {
  return jaToTurkishSpeech(kana)
}
