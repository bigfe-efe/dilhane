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
      // はは'nin İLK yarısı da korunmalı. Yukarıdaki kural yalnızca ikinci
      // yarıyı kolluyordu; 「ちちとははとあね」de ilk は cümle içinde olduğu
      // için ek sanılıp "chichi to WA ha to ane" okunuyordu.
      // ははは'de bozmaz: oradaki i=1 zaten bir üstteki kurala takılıyor.
      if (next === 'は' && c[i + 2] !== 'は') return ch
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

/**
 * Yazıldığı gibi okunmayan üç ek — ve okunuşları.
 *
 * Üçü de tarihsel kalıntıdır: yazım eski hâlinde donmuş, okunuş değişmiş.
 * Ekranda romaji gösterilirken bunlar DÜZELTİLİR, ama sessizce değil:
 * hangi karakterin nasıl okunduğu parantez içinde yazılır. Sebep şu — sessiz
 * düzeltme, kuralı bilmeyen birine "こんばんは'nin sonu zaten wa'dır" diye
 * yanlış bir şey öğretir; kuralı bilen için de doğrulama olmaz.
 */
export interface ParticleNote {
  /** Yazılan karakter */
  kana: string
  /** Nasıl okunduğu */
  as: string
}

export interface RomajiInfo {
  text: string
  /** Boşsa yazıldığı gibi okunuyor demektir */
  notes: ParticleNote[]
}

/**
 * へ eki "e" okunur.
 *
 * は ile aynı elemeyi kullanır ama へ kelime içinde çok daha az geçtiği için
 * daha basit: kelime başında değilse (へや), ardından ん gelmiyorsa (へん) ve
 * öncesinde kana DIŞI bir şey varsa ya da ardından kana gelmiyorsa ektir.
 */
function fixDirectionParticle(kana: string): string {
  const c = [...kana]
  return c
    .map((ch, i) => {
      if (ch !== 'へ') return ch
      const prev = c[i - 1]
      const next = c[i + 1]
      if (i === 0 || !prev || BOUNDARY.test(prev)) return ch // へや, へた
      if (next === 'ん') return ch // へん
      if (!KANA_CH.test(prev)) return 'え' // 学校へ — sınır belli
      if (!next || !KANA_CH.test(next)) return 'え' // がっこうへ␣いきます
      return ch
    })
    .join('')
}

/**
 * Ekleri düzeltir ve NEYİ değiştirdiğini söyler.
 *
 * を ayrı ele alınıyor: pratikte yalnızca nesne eki olarak kullanıldığı için
 * eleme gerekmez, her zaman "o" okunur. は ve へ ise kelimenin içinde de
 * geçebildiğinden elenerek bulunur.
 */
function fixParticles(kana: string): RomajiInfo {
  const duzeltilmis = fixDirectionParticle(fixTopicParticle(kana)).replace(/を/g, 'お')

  // Not listesi ÇIKTIYA değil GİRDİYE bakılarak kurulmuyor: hangi karakterin
  // gerçekten değiştiğini ancak iki dizgiyi karşılaştırmak söyler. は kelime
  // içinde geçip değişmediyse not da çıkmamalı.
  const once = [...kana]
  const sonra = [...duzeltilmis]
  const OKUNUS: Record<string, string> = { は: 'wa', へ: 'e', を: 'o' }
  const notlar: ParticleNote[] = []
  for (let i = 0; i < once.length; i++) {
    if (once[i] === sonra[i]) continue
    const as = OKUNUS[once[i]]
    if (!as || notlar.some((n) => n.kana === once[i])) continue
    notlar.push({ kana: once[i], as })
  }

  return { text: duzeltilmis, notes: notlar }
}

/**
 * Kana okunuşundan ekranda gösterilecek romaji.
 *
 * Doğrudan wanakana'nın toRomaji'sini çağırmak YETMEZ: o harf harf çevirir ve
 * こんばんは'yi "konbanha" yapar. Doğrusu "konbanwa" — sondaki は konu ekidir
 * (今晩は). Uygulamada sekiz ayrı yerde ham toRomaji çağrılıyordu ve hepsi
 * aynı yanlışı gösteriyordu.
 */
export function romajiOf(kana: string): RomajiInfo {
  const { text, notes } = fixParticles(kana)
  return { text: toRomaji(text), notes }
}

/**
 * Ekleri düzeltilmiş kana — karakter sayısı GİRDİYLE AYNI kalır.
 *
 * Kelimeyi hece hece gösteren ekranlar için: orada her hece ayrı ayrı
 * romaji'ye çevriliyor, tek başına çevrilen は ise her zaman "ha" çıkıyor.
 * Uzunluk korunduğu için çağıran taraf aynı indislerle çalışabilir.
 */
export function particleFixedKana(kana: string): string {
  return fixParticles(kana).text
}

export function jaToTurkishSpeech(text: string): string {
  let s = segment(fixDirectionParticle(fixTopicParticle(text)))
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

/**
 * Hazır romaji okunuşunu Türkçe yaklaşık yazıma çevirir.
 *
 * jaToTurkishSpeech kana'dan başlar; bunun girdisi ise ZATEN romaji olan bir
 * okunuştur (katakana sözlüğünün kataReading çıktısı, ya da elle yazılmış
 * "konnichiwa" gibi istisnalar). İkisi de aynı MAP tablosunu kullanıyor ki
 * "şi/çi/tsu" yazımı uygulamanın her yerinde aynı olsun.
 */
export function romajiToTurkish(romaji: string): string {
  let s = romaji.toLowerCase()
  for (const [re, to] of LONG) s = s.replace(re, to)
  for (const [re, to] of MAP) s = s.replace(re, to)
  return s
}
