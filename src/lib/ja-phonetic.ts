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
 * uyuşmazlığı. Ek olduğu kesin değildir, ama şu üç işaret yeter:
 *   • kelimenin başında değil       (はな, はたらく, はじめまして korunur)
 *   • ardından ん gelmiyor          (ごはん, はんぶん korunur)
 *   • öncesinde は yok              (はは "haha" korunur)
 * Geriye kalan neredeyse hep ektir: わたし|は, こんにち|は.
 */
function fixTopicParticle(kana: string): string {
  const c = [...kana]
  return c
    .map((ch, i) => (ch === 'は' && i > 0 && c[i + 1] !== 'ん' && c[i - 1] !== 'は' ? 'わ' : ch))
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
