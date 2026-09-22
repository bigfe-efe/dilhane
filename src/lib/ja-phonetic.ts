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
const SENTENCE_MARK = /[㐀-鿿\s、。「」『』：:；;！？!?,.]/
const PREDICATE_END = /(です|ですか|ます|ますか|ました|ません|でした|ください|でしょう)$/
const KANA_CH = /[ぁ-ゟァ-ヿー]/
// Diyalog satırlarında ad ile söz ： ile ayrılır; ： sınır sayılmayınca
// 「女の人：はい。」deki は ek sanılıyor ve はい "wai" okunuyordu.
const BOUNDARY = /[\s、。「」『』：:；;！？!?,.…]/

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
  return { text: romaji(text), notes }
}

/**
 * toRomaji + wanakana'nın iki eksiğinin düzeltilmesi.
 *
 * 1) Uzatma çizgisi olduğu gibi kalıyor: こーひー → "ko-hi-". Latin okunuşta
 *    çizgi bir ses değil; ünlüyü ikilemek doğru okutur: "koohii".
 * 2) ふぇ "fye", ふぃ "fyi" çıkıyor. Öğrencinin kendi adı エフェ ekranda
 *    "efye" diye duruyordu. Yalnızca bu ikisi düzeltiliyor — ふぁ "fua" ve
 *    てぃ "tei" düzeltilemez, çünkü ふあん (fuan) ve ていねい (teinei) gerçekten
 *    öyle okunur; düzeltmek doğru kelimeleri bozardı.
 */
function romaji(kana: string): string {
  return toRomaji(kana)
    .replace(/([aeiou])-/g, '$1$1')
    .replace(/fye/g, 'fe')
    .replace(/fyi/g, 'fi')
}

/**
 * Kana okunuşunu KELİMELERE AYIRARAK romaji'ye çevirir.
 *
 * NEDEN AYRI BİR İŞLEV:
 * Japonca boşluksuz yazılır. `romajiOf` bir cümleyi olduğu gibi çevirince
 * 「わたしのなまえはエフェです。」 → "watashinonamaewaefedesu." çıkıyor; satır
 * teknik olarak doğru ama gözle okunamıyor, yani hiç yokmuş gibi.
 *
 * Kelime sınırları KANA satırında değil, JAPONCA satırında görünür: yazı türü
 * her değiştiğinde (kanji → kana → katakana) neredeyse her zaman bir sınır
 * vardır. Sınırlar japonca satırdan çıkarılıp okunuşun üstüne bindiriliyor:
 *
 *   ja:   私 | の | 名前 | は | エフェ | です
 *   kana: わたし   のなまえ   は   えふぇです
 *   →     watashi no namae wa efe desu
 *
 * Ekler de buradan anlaşılıyor ve bu, kana üstünden tahmin etmekten çok daha
 * güvenilir: 「昨日は早く寝ました」da は tek başına bir kana öbeği olarak iki
 * kanjinin arasında durur, yani kesin ektir. Yalnız kanaya bakan sezgi orada
 * (ははやく → はは sanıp) yanılıyordu.
 *
 * Hizalama tutmazsa bölmekten vazgeçilir, bütün satır tek parça çevrilir:
 * yanlış yerden bölmek, hiç bölmemekten kötüdür.
 */
export function romajiWords(ja: string, kana: string): string {
  const duzeltilmis = particleFixedKana(kana)
  const parcalar = hizala(ja, kana)
  // Uzunluk korunmazsa indisler kayar; o durumda bölmeden çevir.
  if (!parcalar || duzeltilmis.length !== kana.length) return romaji(duzeltilmis)

  const kelimeler: string[] = []
  let oncekiKanji = false // son kelime kanjiyle mi bitti (okurigana yapışsın)
  let yapistir = false // saygı ön ekinden sonra gelen parça aynı kelimeye

  for (const p of parcalar) {
    const ham = kana.slice(p.a, p.b)

    if (p.tur === 'isaret') {
      const r = romaji(ham).trim()
      if (r && kelimeler.length > 0) kelimeler[kelimeler.length - 1] += r
      else if (r) kelimeler.push(r)
      // Noktalama kelimeyi bitirir: ardından gelen kana okurigana olamaz.
      // Bu satır olmadan 「女の人：はい」 → "hito:hai" diye yapışıyordu.
      oncekiKanji = false
      continue
    }

    if (p.ek) {
      kelimeler.push(EK_OKUNUS[ham] ?? romaji(ham))
      oncekiKanji = false
      continue
    }

    const r = romaji(duzeltilmis.slice(p.a, p.b)).trim()
    if (!r) continue
    // Kanjinin ardındaki kana çoğu zaman okurigana'dır: 早+く → hayaku,
    // 寝+ました → nemashita. Ayrı yazılsa kelime ortasından bölünmüş olurdu.
    if ((yapistir || (p.tur === 'kana' && oncekiKanji)) && kelimeler.length > 0)
      kelimeler[kelimeler.length - 1] += r
    else kelimeler.push(r)
    yapistir = !!p.onek
    oncekiKanji = p.tur === 'kanji'
  }

  return kelimeler.join(' ')
}

/** Ekin okunuşu — yazıldığı gibi değil. */
const EK_OKUNUS: Record<string, string> = { は: 'wa', へ: 'e', を: 'o' }

/**
 * Bir kana öbeğinin BAŞINDAN ek olarak koparılabilecek karakterler.
 *
 * で ve か bilerek yok: 「です」 ve 「から」 de aynı harfle başlıyor ve
 * 「学生です」 → "gakusei de su" diye bölünürdü.
 */
const BAS_EK = new Set(['は', 'が', 'を', 'に', 'へ', 'も', 'と', 'の'])
/**
 * Tek başına duran bir kana ancak bu listedeyse ektir.
 *
 * Liste olmadan 「早く」daki く de ek sayılıyor ve satır "haya ku" diye
 * kelimenin ortasından bölünüyordu — okurigana ile eki ayıran şey bu.
 */
const TEK_EK = new Set(['は', 'が', 'を', 'に', 'へ', 'も', 'と', 'の', 'で', 'や'])
/** Kendinden sonraki kelimeye yapışan saygı ön ekleri: お茶, ご飯 */
const ONEK = new Set(['お', 'ご'])
/** Öbeğin SONUNDAN koparılabilecekler — 「まで」 bölünmesin diye で yok. */
const SON_EK = new Set(['は', 'が', 'を', 'に', 'へ', 'も', 'と', 'の'])

interface Parca {
  a: number
  b: number
  tur: 'kanji' | 'kana' | 'isaret'
  /** Tek başına duran ek: okunuşu zorlanır, kelime olarak ayrı yazılır */
  ek?: boolean
  /** Ön ek: kendinden sonraki parça aynı kelimeye yazılır (お茶 → ocha) */
  onek?: boolean
}

const KANJI_RUN = /[㐀-鿿]/

/**
 * Katakana → hiragana, KARAKTER SAYISI DEĞİŞMEDEN.
 *
 * wanakana'nın hazır dönüştürücüsü burada işe yaramıyor: uzun ünlü işaretini
 * açıyor (コーヒー → こうひい) ama okunuş satırında ー olduğu gibi duruyor
 * (こーひー). İkisi eşleşmediği için hizalama başarısız oluyor ve satır hiç
 * bölünmüyordu. Kod noktası kaydırması hem ー’ye hem uzunluğa dokunmaz.
 */
const hiraganaya = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
const KANA_RUN = /^[ぁ-ゟァ-ヿー]+$/

/**
 * Japonca satırın parçalarını okunuş satırındaki aralıklarla eşler.
 * Eşleyemezse null döner.
 */
function hizala(ja: string, kana: string): Parca[] | null {
  // Katakana kelimeler okunuşta hiragana yazılmış olabilir (パン → ぱん);
  // ikisi de hiraganaya çevrilip karşılaştırılıyor.
  const hedefKana = hiraganaya(kana)
  if (hedefKana.length !== kana.length) return null

  const oberler = segment(ja)
  const yerler = enIyiYerler(oberler, hedefKana)
  if (!yerler) return null

  const parcalar: Parca[] = []
  let pos = 0
  let capa = 0

  for (let i = 0; i < oberler.length; i++) {
    const run = oberler[i]
    if (KANJI_RUN.test(run)) continue // okunuşunun yerini çapalar belirledi

    const bas = yerler[capa++]
    const uzunluk = [...hiraganaya(run)].length
    if (bas > pos) parcalar.push({ a: pos, b: bas, tur: 'kanji' }) // kanjinin okunuşu

    // Kanji kadar katakana da sınırdır: 「コーヒーは」daki は de ektir.
    const kanaObek = KANA_RUN.test(run)
    const oncesiSinir = i > 0 && sinirMi(oberler[i - 1])
    const sonrasiSinir = sinirMi(oberler[i + 1])
    let a = bas
    let b = bas + uzunluk

    if (kanaObek) {
      // Tek karakterlik kana öbeği iki kanjinin arasındaysa ektir: 電車で行く
      if (b - a === 1 && oncesiSinir && TEK_EK.has(kana[a])) {
        parcalar.push({ a, b, tur: 'kana', ek: true })
        pos = b
        continue
      }
      if (b - a === 1 && ONEK.has(run) && sonrasiSinir) {
        parcalar.push({ a, b, tur: 'kana', onek: true })
        pos = b
        continue
      }
      // Kalan en az iki karakter olmalı: 「その」dan の koparılırsa 「そ」
      // diye bir kelime kalır ve "so no" diye saçma bir satır çıkar.
      if (b - a > 2 && oncesiSinir && BAS_EK.has(kana[a]) && !ekDegil(kana, a)) {
        parcalar.push({ a, b: a + 1, tur: 'kana', ek: true })
        a += 1
      }
      if (b - a > 2 && sonrasiSinir && SON_EK.has(kana[b - 1]) && !ekDegil(kana, b - 1)) {
        parcalar.push({ a, b: b - 1, tur: 'kana' })
        parcalar.push({ a: b - 1, b, tur: 'kana', ek: true })
        pos = b
        continue
      }
    }

    parcalar.push({ a, b, tur: kanaObek ? 'kana' : 'isaret' })
    pos = b
  }

  if (pos < kana.length) parcalar.push({ a: pos, b: kana.length, tur: 'kanji' })
  return parcalar.length > 0 ? parcalar : null
}

/** Bir kanjinin okunuşu en çok bu kadar kana olabilir (N5 için bol bol yeter). */
const EN_UZUN_OKUNUS = 4

/**
 * Kana öbeklerinin okunuş satırındaki yerlerini seçer.
 *
 * NEDEN ARAMA GEREKİYOR:
 * Aynı kana okunuşun birkaç yerinde bulunabilir ve hangisinin kelime sınırı
 * olduğu tek başına belli değildir:
 *   電車で   → でんしゃで : で iki yerde, ilki 電車’ın İÇİNDE
 *   十二時に → じゅうにじに : に iki yerde, ilki 十二時’in İÇİNDE
 *   昨日は早く → きのうははやく : は iki yerde, ilki EK olan
 * İlk eşleşmeyi almak ilk ikisini, son eşleşmeyi almak üçüncüsünü bozuyordu.
 *
 * Ölçüt şu: kanjinin okunuşu ne saçma kısa ne saçma uzun olmalı. Bütün
 * olasılıklar denenip KANJİ BAŞINA EN UZUN OKUNUŞU en küçük tutan dizilim
 * seçiliyor. 昨日 için きのう (1,5 kana/kanji) 「きのうは」dan (2,0) iyidir;
 * 十二時 için じゅうにじ (1,67) 「じゅう」dan (1,0 ama ardından 寝 = じにね, 3,0)
 * iyidir. Eşitlikte en erken yer alınır.
 */
function enIyiYerler(oberler: string[], hedefKana: string): number[] | null {
  interface Capa {
    hedef: string
    bekleyen: number // bu çapadan önce okunuşu bulunmamış kanji sayısı
  }
  const capalar: Capa[] = []
  let bekleyen = 0
  for (const run of oberler) {
    if (KANJI_RUN.test(run)) {
      bekleyen += [...run].length
      continue
    }
    capalar.push({ hedef: hiraganaya(run), bekleyen })
    bekleyen = 0
  }
  const kuyruk = bekleyen // son çapadan sonraki kanjiler

  const not = new Map<string, { skor: number; yerler: number[] } | null>()

  const ara = (k: number, pos: number): { skor: number; yerler: number[] } | null => {
    const anahtar = k + '|' + pos
    const hazir = not.get(anahtar)
    if (hazir !== undefined) return hazir

    let sonuc: { skor: number; yerler: number[] } | null = null

    if (k === capalar.length) {
      const artan = hedefKana.length - pos
      if (kuyruk === 0) sonuc = artan === 0 ? { skor: 0, yerler: [] } : null
      else sonuc = artan >= kuyruk && artan <= kuyruk * EN_UZUN_OKUNUS ? { skor: artan / kuyruk, yerler: [] } : null
    } else {
      const { hedef, bekleyen: bk } = capalar[k]
      const enAz = pos + bk
      const enCok = bk === 0 ? pos : Math.min(pos + bk * EN_UZUN_OKUNUS, hedefKana.length - hedef.length)
      for (let i = enAz; i <= enCok; i++) {
        if (!hedefKana.startsWith(hedef, i)) continue
        const kalan = ara(k + 1, i + hedef.length)
        if (!kalan) continue
        const skor = Math.max(bk === 0 ? 0 : (i - pos) / bk, kalan.skor)
        if (!sonuc || skor < sonuc.skor) sonuc = { skor, yerler: [i, ...kalan.yerler] }
      }
    }

    not.set(anahtar, sonuc)
    return sonuc
  }

  return ara(0, 0)?.yerler ?? null
}

function sinirMi(obek?: string): boolean {
  return !!obek && (KANJI_RUN.test(obek) || /^[ァ-ヿー]+$/.test(obek))
}

/**
 * Ek gibi görünen ama ek OLMAYAN karakterler.
 *
 * とても’nin sonundaki も ek sanılıp 「とても楽しい」 "tote mo" diye
 * bölünüyordu; ちょっと de 「ちょっと待って」de "chot to" oluyordu. İkisinin de
 * ortak yanı bir önceki karakter: 〜ても / 〜っと bir bütündür.
 */
function ekDegil(kana: string, i: number): boolean {
  const once = kana[i - 1]
  if (kana[i] === 'も' && (once === 'て' || once === 'で')) return true
  if (kana[i] === 'と' && once === 'っ') return true
  return false
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
