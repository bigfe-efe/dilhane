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
import { UNITS } from '@/content/ja/units'
import { VOCAB_JA } from '@/content/ja/vocab'
import { kelimeAyir } from '@/lib/kanji-ayir'

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
 * Tek bir KELİMENİN romajisi — ek düzeltmesi YAPILMADAN.
 *
 * Sayı ve tarih listeleri için: はっせん, はたち, はつか gibi kelimelerde は
 * zaten kelimenin parçası; ek sezgisi devreye girip "wa" yapmasın.
 */
export const kanaToRomaji = romaji

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

  // Önce KANA düzeyinde kelimeler kurulur, romajiye en sonda çevrilir.
  // Parça parça çevirmek küçük っ'yu kaybettiriyordu: 三 (みっ) + つ →
  // "mi" + "tsu" = "mitsu"; bütün kelime みっつ ise "mittsu".
  interface Kelime {
    /** Ham kana (sözlük eşleşmesi için) */
    kana: string
    /** Ekleri düzeltilmiş kana (romaji için; こんにちは → こんにちわ) */
    duz: string
    ek?: boolean
    /** Kanjiyle başlıyor (ardındaki ekler soyulabilir) */
    kanjili?: boolean
    /** Sonuna eklenecek noktalama (romaji) */
    son?: string
    /** Tam bir kelimenin ardından ayrılmış öbek: ek ile başlayabilir (中|で なつ) */
    ekleBaslar?: boolean
    /** Yazılışı katakana: tek kelimedir, bölünmez (カフェ okunuşu かふぇ olsa da) */
    katakana?: boolean
  }
  const ks: Kelime[] = []
  let oncekiKanji = false // son kelime kanjiyle mi bitti (okurigana yapışsın)
  let yapistir = false // saygı ön ekinden sonra gelen parça aynı kelimeye
  let sonKanji = '' // son kanji öbeğinin yazılışı
  let sonOnekli = false // son kanjili kelime お/ご ile mi başladı (お父さん bölünmez)

  for (const p of parcalar) {
    const ham = kana.slice(p.a, p.b)

    if (p.tur === 'isaret') {
      const r = romaji(ham).trim()
      const son = ks[ks.length - 1]
      if (r && son) son.son = (son.son ?? '') + r
      else if (r) ks.push({ kana: '', duz: '', son: r })
      // Noktalama kelimeyi bitirir: ardından gelen kana okurigana olamaz.
      // Bu satır olmadan 「女の人：はい」 → "hito:hai" diye yapışıyordu.
      oncekiKanji = false
      continue
    }

    if (p.ek) {
      ks.push({ kana: ham, duz: ham, ek: true })
      oncekiKanji = false
      continue
    }

    // Kanjinin okunuşunda ek OLAMAZ: 「までは働きます」da 働’ın okunuşu
    // はたらき; ek sezgisi までは sanıp "watarakimasu" yapıyordu. Ek
    // düzeltmesi yalnızca kana öbeklerine uygulanır.
    const kaynak = p.tur === 'kanji' ? ham : duzeltilmis.slice(p.a, p.b)
    if (!kaynak.trim()) continue

    if (p.tur === 'kanji') {
      // Yan yana kanjili kelimeler ayrılır: 毎日日本語 → 毎日 + 日本語
      const sonraki = parcalar[parcalar.indexOf(p) + 1]
      const okuriganaVar =
        !!sonraki && sonraki.tur === 'kana' && !sonraki.ek && !sonraki.ayri &&
        !ayriKelimeMi(p.ja ?? '', kana.slice(sonraki.a, sonraki.b))
      const bolum = kanjiBol(p.ja ?? '', kaynak, okuriganaVar)
      sonOnekli = yapistir
      bolum.forEach((k, n) => {
        if (n === 0 && yapistir && ks.length) {
          ks[ks.length - 1].kana += k
          ks[ks.length - 1].duz += k
          ks[ks.length - 1].kanjili = true
        } else ks.push({ kana: k, duz: k, kanjili: true })
      })
      yapistir = false
      oncekiKanji = true
      sonKanji = p.ja ?? ''
      continue
    }

    // Kanjinin ardındaki kana çoğu zaman okurigana'dır: 早+く → hayaku,
    // 寝+ました → nemashita. Ayrı yazılsa kelime ortasından bölünmüş olurdu.
    // (Ardındaki ekler — です, ない, ください — aşağıda kuyruktan soyuluyor.)
    // Ama kana öbeği kendi başına bir kelimeyle başlıyorsa okurigana değildir:
    // 二時間 + べんきょうします, 三本 + あります.
    const ayriKelime = oncekiKanji && !yapistir && !sonOnekli && ayriKelimeMi(sonKanji, ham)
    if ((yapistir || (oncekiKanji && !p.ayri && !ayriKelime)) && ks.length) {
      // Öbeğin yalnızca başı (okurigana) kanjiye yapışır; ardındaki kelimeler
      // ayrılır: 新 + しい|かばん|が|ほしい|です → atarashii kaban ga hoshii desu
      const bol = yapistir ? [{ s: ham }] : kanaBol(ham, true, sonKanji)
      let o = 0
      bol.forEach((x, n) => {
        const r = ham.slice(o, o + x.s.length)
        const d = kaynak.slice(o, o + x.s.length)
        o += x.s.length
        if (n === 0) {
          ks[ks.length - 1].kana += r
          ks[ks.length - 1].duz += d
        } else ks.push({ kana: r, duz: d, ek: x.ek })
      })
    } else ks.push({ kana: ham, duz: kaynak, ekleBaslar: ayriKelime, katakana: p.katakana })
    yapistir = !!p.onek
    oncekiKanji = false
  }

  const kelimeler: string[] = []
  ks.forEach((k, sira) => {
    const sonraki = ks[sira + 1]
    const sonEkSerbest = !(sonraki && sonraki.ek && !k.son)
    const parca: Bolum[] = k.ek || k.katakana
      ? [{ s: k.kana, ek: k.ek }]
      : k.kanjili
        ? kuyrukBol(k.kana)
        : // Önceki parça bir ekse bu öbek de ekle başlayabilir: と|は あまり (には, とは)
          kanaBol(k.kana, false, '', !!k.ekleBaslar || (!!ks[sira - 1]?.ek && !ks[sira - 1]?.son), sonEkSerbest)
    // Ek: okunuşu zorlanır (は → wa). Diğerleri ekleri düzeltilmiş kanadan.
    let o = 0
    const r: string[] = []
    for (const x of parca) {
      const duz = k.duz.slice(o, o + x.s.length)
      o += x.s.length
      const metin = (x.ek ? EK_OKUNUS[x.s] ?? romaji(x.s) : romaji(duz)).trim()
      if (metin) r.push(metin)
    }
    if (k.son) {
      if (r.length) r[r.length - 1] += k.son
      else if (kelimeler.length) kelimeler[kelimeler.length - 1] += k.son
      else r.push(k.son)
    }
    kelimeler.push(...r)
  })

  // Kanji + tek hece + kanji: 買い物 "kai mono" diye bölünüyordu. Genel bir
  // kural yazılamıyor — aynı biçim 古い本'de ("furui hon") iki ayrı kelime.
  // N5'te geçen …物 birleşikleri tek tek tanınıyor.
  return kelimeler.join(' ').replace(/\b(kai|tabe|nomi|nori|yomi|wasure) mono\b/g, '$1mono')
}

// ————————————————————— Kelime sınırları: sözlük ve kurallar —————————————————————
//
// Yazı türünün değiştiği yerler (kanji → kana) sınırların ancak bir kısmını
// veriyor. Geri kalanı burada:
//   • kanaBol:   tamamen kanayla yazılmış öbek, sözlükle kelimelere bölünür
//                (これはだれのかばんですか → kore wa dare no kaban desu ka)
//   • kuyrukBol: kanjili kelimenin ardına yapışan ekler soyulur
//                (高くないです → takaku nai desu, 待ってください → matte kudasai)
//   • kanjiBol:  yan yana kanjili kelimeler ayrılır (毎日日本語 → mainichi nihongo)
// Sözlük ünitelerin ve ana sözlüğün kelimelerinden kuruluyor; ilk kullanımda,
// bir kez.

/** Tek hecelik ekler: kana öbeği bölünürken ayrı kelime olurlar */
const EK_TEK = new Set(['は', 'が', 'を', 'に', 'へ', 'も', 'と', 'の', 'で', 'や', 'か', 'ね', 'よ'])

/** Bölünmüş parça; `ek` ise okunuşu zorlanır (は → wa) */
interface Bolum {
  s: string
  ek?: boolean
}

/** Kelime listesinde olmayan ama cümlede sık geçen sözcükler ve yüklem ekleri */
const ISLEV_KELIMELERI = [
  'これ', 'それ', 'あれ', 'どれ', 'この', 'その', 'あの', 'どの', 'ここ', 'そこ', 'あそこ', 'どこ', 'こちら', 'どちら',
  'だれ', 'なに', 'なん', 'いくら', 'いくつ', 'いつ', 'どう', 'どうして', 'とても', 'あまり', 'ちょっと', 'すこし',
  'もう', 'まだ', 'じゃあ', 'でも', 'そして', 'それから', 'だから', 'はい', 'いいえ', 'ぜんぶで', 'たくさん', 'いっしょに',
  'です', 'でした', 'でしょう', 'だ', 'だった', 'ください',
  'じゃ', 'では', 'から', 'まで', 'より', 'ごろ', 'ぐらい', 'だけ', 'そう',
  'あります', 'ありません', 'ありました', 'ある', 'います', 'いません', 'いました', 'いる', 'いない',
  'わかります', 'わかりません', 'ちがいます', 'すみません', 'ありがとう', 'ございます', 'おねがいします',
  'よろしく', 'はじめまして', 'こんにちは', 'こんばんは', 'おはよう', 'さようなら', 'いい', 'よく', 'こと', 'つもり',
  'いけません', 'ほしい', 'すき', 'きらい', 'じょうず', 'へた', 'さん', 'ちゃん', 'くん',
  // する'nın biçimleri: kana öbeğinde ayrı kelime (しゅくだいを します)
  'する', 'します', 'しません', 'しました', 'しませんでした', 'しましょう', 'して', 'した', 'しない', 'したり', 'しています',
]

/**
 * Sözlükte tek kelime olarak geçen ama Latin yazımda iki kelime olan kalıplar.
 * Sözlükten çıkarılırlar; parçaları ayrı ayrı eşleşir.
 */
const KALIPLAR = new Set(['ありがとうございます', 'おはようございます', 'よろしくおねがいします', 'どうもありがとう'])

/** Kana öbeğinde ayrı kelime OLAMAYAN ekler: ます biçimi fiilin kendisine yapışır */
const AYRI_OLMAZ = new Set(['ます', 'ません', 'ました', 'ましょう', 'ませんでした'])

const hiraganaKelime = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

let SOZLUK: {
  kana: Set<string>
  kanji: Map<string, string[]>
  /** Sözlükteki yazılışların bütün önekleri: 行き, 行きま… okurigana denetimi için */
  yazilisOnekleri: Set<string>
  /** Yalnızca kanjiden oluşan, kendi başına tam kelimeler (中, 学生) */
  tamKelime: Set<string>
  /** Sözlükteki bütün yazılışlar (子ども, 行きます) */
  yazilislar: Set<string>
  enUzunKana: number
} | null = null

/**
 * Kanjiden sonra gelen kana öbeği okurigana mı, ayrı kelime mi?
 * Ayrı kelime: öbek sözlükle tamamen bölünebiliyor, ilk parçası en az üç
 * harfli bir sözlük kelimesi ve kanji + öbeğin ilk harfi bilinen bir
 * yazılışın başı DEĞİL (行 + き → 行きます bilindiği için okurigana).
 */
function ayriKelimeMi(kanji: string, obek: string): boolean {
  const { yazilisOnekleri } = sozluk()
  if (!kanji || yazilisOnekleri.has(kanji + obek[0])) return false
  const b = kanaBol(obek, false, '', sozluk().tamKelime.has(kanji))
  if (b.length > 1 && b[0].ek && sozluk().tamKelime.has(kanji)) return true
  // Tam bir kanjili kelimenin (一人) ardından sözlük kelimesi (いる): ayrı
  const ilkSozlukte = b.length > 0 && !b[0].ek && sozluk().kana.has(hiraganaKelime(b[0].s))
  if (ilkSozlukte && sozluk().tamKelime.has(kanji)) return true
  return ilkSozlukte && b[0].s.length >= 3
}

function sozluk() {
  if (SOZLUK) return SOZLUK
  const kanaK = new Set<string>(ISLEV_KELIMELERI)
  const yazilisOnekleri = new Set<string>()
  const tamKelime = new Set<string>()
  const kanjiK = new Map<string, string[]>()
  const ekle = (ja: string, okunus: string) => {
    for (const o of okunus.split(/\s*\/\s*/)) {
      const h = hiraganaKelime(o.trim())
      if (!/^[ぁ-ゖー]+$/.test(h)) continue
      const kalip = KALIPLAR.has(h) || (/(です|ですが|ですね|ですか|ですよ)$/.test(h) && h.length > 3)
      if (h.length >= 2 && !kalip && !AYRI_OLMAZ.has(h) && !ja.startsWith('〜')) kanaK.add(h)
      if (!/[ぁ-ゖ]/.test(ja) || /^[㐀-鿿々]+$/.test(ja)) tamKelime.add(ja)
      // Yalnızca kanjiden oluşan yazılış: kanji öbeği bölünürken kullanılır
      if (/^[㐀-鿿々]+$/.test(ja)) kanjiK.set(ja, [...(kanjiK.get(ja) ?? []), h])
    }
  }
  const yazilislar = new Set<string>()
  const yazilis = (ja: string) => {
    yazilislar.add(ja)
    for (let i = 1; i <= ja.length; i++) yazilisOnekleri.add(ja.slice(0, i))
  }
  for (const u of UNITS) for (const v of u.vocab) (ekle(v.ja, v.kana), yazilis(v.ja))
  for (const v of VOCAB_JA) (ekle(v.term, v.reading ?? v.term), yazilis(v.term))
  SOZLUK = { kana: kanaK, kanji: kanjiK, yazilisOnekleri, yazilislar, tamKelime, enUzunKana: Math.max(...[...kanaK].map((k) => k.length)) }
  return SOZLUK
}

/** Kökün ardındaki çekim sonu (en fazla üç harf sonra): okurigana bunu kapsar */
const CEKIM_SONU = /^[ぁ-ゖ]{0,3}?(ませんでした|ません|ました|ましょう|ます|ないで|なかった|かった|くない|くて|んで|って|いて|いで|して|た|て|で|だ)/

/** Bilinmeyen kelimenin hemen ardından gelebilecek yardımcılar (ek dışında) */
const YARDIMCI = new Set(['です', 'でした', 'でしょう', 'ですが', 'ください', 'から', 'まで', 'より', 'だけ', 'ぐらい'])
/** Yan yana gelebilen iki ek: には, でも, とは… */
const EK_CIFTI = /^[にでへと][はも]$/

/**
 * Tamamen hiraganadan oluşan öbeği kelimelere böler.
 *
 * Parçalar: sözlük kelimesi, tek hecelik ek ya da bilinmeyen kelime.
 * Bilinmeyen kelimeye yalnızca ARDINDAN bir ek, bir yardımcı (です, ください)
 * ya da öbek sonu geliyorsa izin verilir: "tabako o", "suwanaide kudasai".
 * Böylece sözlükte olmayan bir kelime parçalanıp saçma bir dizi çıkmaz
 * (つめたいもの → "tsume tai mo no" yerine bütün). Yan yana iki ek yalnızca
 * には, でも gibi bilinen ikililerde olur. En az parçalı bölüm seçilir.
 *
 * `okurigana`: öbek kanjinin ardında; ilk parça okuriganadır ve ne olursa
 * olsun kanjiye yapışır (bu yüzden kısıtsız).
 */
function kanaBol(obek: string, okurigana = false, kanji = '', ekleBaslar = false, sonEkSerbest = true): Bolum[] {
  // İki harflik öbek ancak okurigana olarak bölünebilir: 後+ろ|に
  if (!/^[ぁ-ゖー]+$/.test(obek) || obek.length < 2 || (obek.length === 2 && !okurigana)) return [{ s: obek }]
  const { kana, enUzunKana, yazilisOnekleri } = sozluk()
  // Okurigana başı yalnızca bilinen bir yazılışı sürdürüyorsa uzar: 少+し (少し)
  // tamam, 少+しあた değil. Kanji öbeğinin her sonu denenir (一番好 → 好).
  const kanjiSonlari = [...kanji].map((_, i) => kanji.slice(i))
  const bilinenDevam = (w: string) => kanjiSonlari.some((k) => yazilisOnekleri.has(k + w))
  // Kanji + öbeğin tamamı sözlükte bir kelimeyse (子+ども) bölünmez
  if (okurigana && kanjiSonlari.some((k) => sozluk().yazilislar.has(k + obek))) return [{ s: obek }]
  // Fiil ya da sıfat kökünün ardındaki çekim sonu okuriganaya dahildir:
  // 来+ました (kima|shita değil), 住+んで (sun|de değil), 入+らないで
  const cekim = okurigana && !sozluk().tamKelime.has(kanji) ? CEKIM_SONU.exec(obek) : null
  const enAzBas = cekim ? cekim[0].length : 1
  const h = obek
  const n = h.length
  type Tip = 'kelime' | 'ek' | 'yardimci' | 'bilinmeyen'
  interface Sonuc {
    m: number
    parcalar: { b: number; tip: Tip }[]
  }
  const en: (Sonuc | null)[] = new Array(n + 1).fill(null)
  en[n] = { m: 0, parcalar: [] }
  const basYasak = /^[ゃゅょっんーぁぃぅぇぉ]/
  for (let i = n - 1; i >= 0; i--) {
    let iyi: Sonuc | null = null
    const dene = (b: number, tip: Tip, maliyet: number) => {
      const sonra = en[b]
      if (!sonra) return
      const ilk = sonra.parcalar[0]
      const ardiEkYaDaYardimci = !ilk || ilk.tip === 'ek' || ilk.tip === 'yardimci'
      if (tip === 'bilinmeyen') {
        // Okurigana başı: öbeğin tamamı, bilinen bir yazılışın devamı ya da ardı ek/yardımcı
        if (okurigana && i === 0) {
          if (b !== n && !bilinenDevam(h.slice(0, b)) && !ardiEkYaDaYardimci) return
        } else if (!ardiEkYaDaYardimci) return // bilinmeyenin ardı: ek, yardımcı ya da son
      }
      // Ardından yine bir ek geliyorsa öbeğin son parçası ek olamaz:
      // つめたいもの|を → つめたいも|の|を değil. か, ね, よ cümle sonu ekidir.
      if (tip === 'ek' && b === n && !sonEkSerbest && !/[かねよ]/.test(h[i])) return
      // Yan yana iki ek yalnızca bilinen ikililerde
      if (tip === 'ek' && ilk?.tip === 'ek' && !EK_CIFTI.test(h[i] + h[b])) return
      const m = maliyet + 0.05 + sonra.m
      if (!iyi || m < iyi.m) iyi = { m, parcalar: [{ b, tip }, ...sonra.parcalar] }
    }
    const okuriganaBasi = okurigana && i === 0
    if (!basYasak.test(h[i]) || okuriganaBasi) {
      for (let L = Math.min(enUzunKana, n - i); L >= 2; L--) {
        const w = h.slice(i, i + L)
        if (kana.has(w)) dene(i + L, YARDIMCI.has(w) ? 'yardimci' : 'kelime', YARDIMCI.has(w) ? 0.8 : 1)
      }
      // Öbek ek ile başlamaz (よかった: よ|かった değil), tam bir kelimenin ardı hariç (中|で)
      if (EK_TEK.has(h[i]) && (i > 0 || ekleBaslar)) dene(i + 1, 'ek', 0.5)
      // Bilinmeyen kelime: en az iki harf (okurigana başında bir harf de olur).
      // を hiçbir kelimenin içinde geçmez. Uzundan kısaya: eşitlikte az parça.
      for (let b = n; b >= i + (okuriganaBasi ? enAzBas : 2); b--) {
        const w = h.slice(i, b)
        if (AYRI_OLMAZ.has(w) || w.includes('を')) continue
        dene(b, 'bilinmeyen', okuriganaBasi ? 0.5 + 0.6 * (b - i - 1) : 1.5 + 0.7 * (b - i))
      }
    }
    en[i] = iyi
  }
  const sonuc = en[0]
  if (!sonuc) return [{ s: obek }]
  let a = 0
  return sonuc.parcalar.map((p) => {
    const s = obek.slice(a, p.b)
    a = p.b
    return { s, ek: p.tip === 'ek' }
  })
}

/**
 * Kanjili kelimenin ARDINA yapışmış ekleri sondan soyar:
 *   たかくないです → たかく | ない | です
 *   まってください → まって | ください
 *   よんでもいいですか → よんで | も | いい | です | か
 *   さんぼんあります → さんぼん | あります
 * Her kural yalnızca önündeki ses uygunsa çalışır; kelimenin kendi sonu
 * (すくない, しずか) yanlışlıkla koparılmasın diye.
 */
const YUKLEM_SONU = /(ます|ません|ました|ましょう|です|でした|でしょう|かった|ない|だ|た|る)$/
const KUYRUK: { ek: string; once?: RegExp; enAzKok?: number; yalnizArdindan?: boolean }[] = [
  // Soru ve cümle sonu ekleri yalnızca bir yüklem sonundan sonra: 八日 (ようか) bölünmesin
  { ek: 'か', once: YUKLEM_SONU },
  { ek: 'ね', once: YUKLEM_SONU },
  { ek: 'よ', once: YUKLEM_SONU },
  // だ yalnızca ardından bir ek soyulduysa: からだ (vücut) bölünmesin
  { ek: 'だ', enAzKok: 2, yalnizArdindan: true },
  { ek: 'から', enAzKok: 2 },
  { ek: 'より', enAzKok: 2 },
  { ek: 'が', once: /(す|した|った|かった|こと)$/ },
  { ek: 'でしょう' },
  { ek: 'でした' },
  { ek: 'です' },
  { ek: 'まで' },
  { ek: 'ください', enAzKok: 1 },
  { ek: 'いけません', once: /は$/ },
  { ek: 'いい', once: /も$/ },
  { ek: 'いなかった', once: /(て|で)$/ },
  { ek: 'いません', once: /(て|で)$/ },
  { ek: 'いました', once: /(て|で)$/ },
  { ek: 'います', once: /(て|で)$/ },
  { ek: 'いない', once: /(て|で)$/ },
  { ek: 'いる', once: /(て|で)$/ },
  { ek: 'も', once: /(て|で)$/ },
  { ek: 'は', once: /(て|で)$/ },
  { ek: 'ありませんでした' },
  { ek: 'ありません' },
  { ek: 'ありました' },
  { ek: 'あります' },
  { ek: 'ある', once: /が$/ },
  { ek: 'あった', once: /が$/ },
  { ek: 'なかった', once: /(く|じゃ|では)$/, enAzKok: 3 },
  { ek: 'ない', once: /(く|じゃ|では)$/, enAzKok: 3 },
  { ek: 'じゃ', enAzKok: 2 },
  { ek: 'こと', once: /(た|る|ない)$/ },
  { ek: 'つもり', once: /([うくぐすつぬぶむる]|ない)$/ },
  { ek: 'の', once: /(さん|ちゃん|くん)$/ },
  { ek: 'なりません', once: /ば$/, enAzKok: 3 },
  { ek: 'なりました', once: /く$/, enAzKok: 3 },
  { ek: 'なります', once: /く$/, enAzKok: 3 },
  { ek: 'なる', once: /く$/, enAzKok: 3 },
  { ek: 'さん', enAzKok: 2 },
]

function kuyrukBol(kelime: string): Bolum[] {
  const sondan: string[] = []
  let kok = kelime
  for (let tur = 0; tur < 12; tur++) {
    // Kalan kök sözlükte kelimeyse dur: おとうさん, すくない, いきます bölünmez
    if (sozluk().kana.has(hiraganaKelime(kok))) break
    const kural = KUYRUK.find((k) => {
      if (!kok.endsWith(k.ek)) return false
      const kalan = kok.slice(0, -k.ek.length)
      if (kalan.length < (k.enAzKok ?? 1)) return false
      if (k.yalnizArdindan && !sondan.length) return false
      return !k.once || k.once.test(kalan)
    })
    if (!kural) break
    sondan.unshift(kural.ek)
    kok = kok.slice(0, -kural.ek.length)
  }
  return [{ s: kok }, ...sondan.map((s) => ({ s, ek: s.length === 1 && EK_TEK.has(s) }))]
}

/**
 * Yan yana duran kanjili kelimeleri ayırır: 毎日日本語 → 毎日 | 日本語,
 * 五人家族 → 五人 | 家族, 朝七時 → 朝 | 七時.
 *
 * Sınırlar yalnızca KANJİ ARALARINA konabilir ve okunuştaki yerleri iki
 * yoldan biriyle kesinleşir:
 *   1) Kanji kanji okunuş (kelimeAyir) çıkıyorsa her kanjinin payı bellidir.
 *      Parçalar sözlük kelimesi ya da sayı + sayaç (七時, 十分, 五人); en az
 *      parçalı bölüm seçilir, bilinmeyen kanjiler tek parçada toplanır ve
 *      pahalıdır — emin olunamayan öbek (二時間) bölünmez.
 *   2) Özel okunuşlu öbekte (明日友) sözlük okunuşları sırayla eşlenir.
 */
function kanjiBol(ja: string, okunus: string, okuriganaVar = false): string[] {
  const chars = [...ja]
  if (chars.length < 2) return [okunus]
  const { kanji } = sozluk()

  const ayrim = kelimeAyir(ja, okunus)
  const paylar = ayrim.ozel ? null : ayrim.parcalar.map((p) => (p.okunus ?? '').length)
  if (paylar && paylar.length === chars.length && paylar.every((x) => x > 0)) {
    const sayacli = (w: string) => /^[〇一二三四五六七八九十百千万何]+[時分円本枚人月日年歳回階つ]$/.test(w) || w === '半'
    const n = chars.length
    const en: ({ m: number; sinir: number[] } | null)[] = new Array(n + 1).fill(null)
    en[n] = { m: 0, sinir: [] }
    for (let i = n - 1; i >= 0; i--) {
      let iyi: { m: number; sinir: number[] } | null = null
      for (let b = i + 1; b <= n; b++) {
        const sonra = en[b]
        if (!sonra) continue
        const w = chars.slice(i, b).join('')
        // Okuriganayla biten tek kanji (好+き, 暑+い) bir kelimenin köküdür
        const kok = okuriganaVar && b === n && b - i === 1 && i > 0
        const m = (kanji.has(w) || sayacli(w) ? 1 : kok ? 1.3 : 2.5) + sonra.m
        if (!iyi || m < iyi.m) iyi = { m, sinir: [b, ...sonra.sinir] }
      }
      en[i] = iyi
    }
    const sinirlar = en[0]!.sinir
    if (sinirlar.length < 2) return [okunus]
    const sonuc: string[] = []
    let a = 0
    let ki = 0
    for (const b of sinirlar) {
      const L = paylar.slice(a, b).reduce((x, y) => x + y, 0)
      sonuc.push(okunus.slice(ki, ki + L))
      ki += L
      a = b
    }
    return ki === okunus.length ? sonuc : [okunus]
  }

  // Özel okunuş: sözlük okunuşlarıyla, en fazla iki kanjilik bilinmeyen kuyrukla
  const ara = (ji: number, ki: number, kullanildi: boolean): string[] | null => {
    if (ji === chars.length) return ki === okunus.length ? [] : null
    for (let L = chars.length - ji; L >= 1; L--) {
      const w = chars.slice(ji, ji + L).join('')
      for (const r of kanji.get(w) ?? []) {
        if (!okunus.startsWith(r, ki)) continue
        const kalan = ara(ji + L, ki + r.length, true)
        if (kalan) return [r, ...kalan]
      }
    }
    if (kullanildi && chars.length - ji <= 2 && ki < okunus.length) return [okunus.slice(ki)]
    return null
  }
  const bulunan = ara(0, 0, false)
  return bulunan && bulunan.length > 1 ? bulunan : [okunus]
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
  /** Kanjiden sonra gelse de okurigana değil, ayrı kelime (です) */
  ayri?: boolean
  /** Kanji parçasının yazılışı (yan yana kelimeleri ayırmak için) */
  ja?: string
  /** Japonca satırda katakana yazılmış öbek */
  katakana?: boolean
}

/**
 * Kanjinin ardından gelip yine de ona YAPIŞMAYAN kana: yüklem ekleri.
 *
 * です hiçbir kelimenin okuriganası değildir; 「学生です」 "gakuseidesu"
 * değil "gakusei desu". Öğrenci Latin satırından kelimeyi ayırt edebilmeli.
 */
const YUKLEM = /^(です|でした|じゃ|では)/

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
  let kanjiMetni = '' // son çapadan bu yana geçen kanji öbekleri

  for (let i = 0; i < oberler.length; i++) {
    const run = oberler[i]
    if (KANJI_RUN.test(run)) {
      kanjiMetni += run // okunuşunun yerini çapalar belirledi
      continue
    }

    const bas = yerler[capa++]
    const uzunluk = [...hiraganaya(run)].length
    if (bas > pos) parcalar.push({ a: pos, b: bas, tur: 'kanji', ja: kanjiMetni }) // kanjinin okunuşu
    kanjiMetni = ''

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

    // Öbeğin sonundaki お/ご, ardından kanji geliyorsa bir sonraki kelimenin
    // saygı ön ekidir: 田中さんの|お|父さん
    if (kanaObek && b - a > 1 && ONEK.has(kana[b - 1]) && i + 1 < oberler.length && KANJI_RUN.test(oberler[i + 1])) {
      parcalar.push({ a, b: b - 1, tur: 'kana', ayri: YUKLEM.test(kana.slice(a, b - 1)) })
      parcalar.push({ a: b - 1, b, tur: 'kana', onek: true })
      pos = b
      continue
    }
    parcalar.push({
      a,
      b,
      tur: kanaObek ? 'kana' : 'isaret',
      ayri: kanaObek && YUKLEM.test(kana.slice(a, b)),
      katakana: /^[ァ-ヿー]+$/.test(run) && a === bas && b === bas + uzunluk,
    })
    pos = b
  }

  if (pos < kana.length) parcalar.push({ a: pos, b: kana.length, tur: 'kanji', ja: kanjiMetni })
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
