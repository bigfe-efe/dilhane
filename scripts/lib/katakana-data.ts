/**
 * Katakana duvar kâğıtlarının ortak verisi.
 *
 * NEDEN AYRI DOSYA:
 * İki üretici var — masaüstü (canlı HTML) ve iPhone (durağan PNG'ler) — ve
 * ikisi de aynı bilgiyi gösteriyor: karakter, okunuş, hiragana karşılığı,
 * karışan çift uyarısı, örnek kelime. Bu hazırlık iki dosyada ayrı dursaydı
 * özellikle PAIR_HINT tablosu (24 elle yazılmış ayrım) zamanla birbirinden
 * ayrı düşerdi: birinde düzeltilen bir ipucu ötekinde eski kalırdı.
 */
import { readFileSync } from 'node:fs'
import { CONFUSING_PAIRS, HIRAGANA, KATAKANA } from '../../src/content/ja/kana'
import { ALL_KATA_WORDS, kataReading } from '../../src/content/ja/katakana-words'

export interface StrokeData {
  s: string[]
  n: [number, number][]
  v: number
}

/** Ekranda gösterilen tek bir karakterin bütün verisi. */
export interface KataCard {
  /** Karakter (yōon'da iki kana olabilir: キャ) */
  c: string
  /** Romaji okunuş */
  r: string
  /** Türkçe yaklaşık okunuş */
  t: string
  /** Hatırlatıcı */
  m: string
  /** Satır adı: ア行 (a-satırı) */
  g: string
  kind: 'base' | 'dakuten' | 'handakuten' | 'yoon'
  /** Aynı sesin hiragana karşılığı */
  h: string
  /** Çizgi yolları (SVG path) */
  p: { d: string; ox: number }[]
  /** Çizgi başlangıç noktaları; i = karakter içindeki sıra */
  n: { x: number; y: number; i: number }[]
  /** Kaç kana geniş — viewBox bunun katı olur */
  w: number
  /** Karışan çiftler */
  e: { c: string; r: string; h: string }[]
  /** Örnek kelime */
  d: { k: string; r: string; f: string; t: string } | null
}

/**
 * Karışan çiftlerde ayrımın NE olduğu.
 *
 * "Bunlar karışır" demek yetmiyor; katakanada ayrım şeklin kendisinde değil
 * ÇİZGİNİN YÖNÜNDE. Yönü söylemeyen bir uyarı işe yaramaz, o yüzden en sık
 * karışan çiftler için ayrım elle yazıldı. Listede olmayan çiftler genel
 * açıklamaya düşer.
 */
export const PAIR_HINT: Record<string, string> = {
  'シ|ツ': 'シ soldan sağa yatay başlar, noktaları YAN YANA. ツ yukarıdan aşağı iner, noktaları ÜST ÜSTE.',
  'ソ|ン': 'ン yataydan başlar (シ gibi), ソ dikey iner (ツ gibi). Aynı ayrım, iki nokta yerine bir çizgi.',
  'シ|ソ': 'İkisi de yataydan başlar; シ üç vuruşlu, ソ iki. Nokta sayısını say.',
  'ツ|ン': 'İkisi de sağa kıvrılır; ツ üç vuruşlu ve dikey iner, ン iki vuruşlu ve yataydan gelir.',
  'ク|ワ': 'ク’nun tepesi sivri köşe yapar, ワ’nın tepesi düz ve geniştir.',
  'ク|ケ': 'ケ’nin ortasından dikey bir çizgi iner, ク’da yoktur.',
  'ク|タ': 'タ’da fazladan bir kısa çizgi vardır; ク çıplaktır.',
  'ス|ヌ': 'ヌ’nun tepesinde yatay bir çizgi vardır, ス’da yoktur.',
  'ヌ|メ': 'ヌ yatay bir çizgiyle başlar; メ doğrudan çapraz iner.',
  'マ|ム': 'マ’nın tepesi kapalı bir köşe, ム’nun tepesi açık bir çengeldir.',
  'ア|マ': 'ア’da dikey çizgi aşağı uzar, マ’da kısa kalır ve sola kıvrılır.',
  'ナ|メ': 'ナ artı işareti gibi diktir; メ tamamen çaprazdır.',
  'チ|テ': 'テ iki yatay çizgiyle başlar, チ bir yatay çizgiyle.',
  'チ|タ': 'チ’de dikey çizgi ortadan iner; タ kapalı bir kutu gibidir.',
  'ウ|ワ': 'ウ’nun tepesinde küçük bir çizgi (şapka) vardır, ワ’da yoktur.',
  'ウ|フ': 'ウ kapalıdır ve şapkası vardır; フ tek bir kıvrımdır.',
  'ル|レ': 'ル iki parçalıdır, レ tek. レ, ル’nun sağ yarısıdır.',
  'レ|ノ': 'レ aşağı inip sağa yukarı kalkar; ノ sadece sola iner.',
  'コ|ユ': 'コ sağa bakan bir köşedir; ユ’nun altında yatay bir taban vardır.',
  'オ|ホ': 'ホ’nun altında iki küçük ayak vardır, オ’da yoktur.',
  'ニ|エ': 'エ’de iki yatay çizgiyi bir dikey bağlar; ニ’de bağ yoktur.',
  'セ|ヤ': 'セ’nin tabanı yatay uzanır; ヤ’nın kuyruğu aşağı sarkar.',
  'ラ|ヲ': 'ヲ’nun ortasında fazladan bir yatay çizgi vardır.',
  'ミ|ラ': 'ミ üç ayrı çizgidir; ラ birleşik bir kıvrımdır.',
}

export const GENEL_IPUCU =
  'Katakanada ayrım şeklin kendisinde değil çizginin yönündedir. Çizgi sırasını bilirsen karışmaz.'

export function buildKatakanaCards(strokesPath: string): KataCard[] {
  const strokes: Record<string, StrokeData> = JSON.parse(readFileSync(strokesPath, 'utf8'))

  // Aynı sesin hiragana karşılığı — okunuş üzerinden eşleşiyor
  const hiraByRomaji = new Map(HIRAGANA.map((k) => [k.romaji, k.char]))

  // Karışan çiftler: her karakter için partnerleri
  const confused = new Map<string, string[]>()
  for (const [a, b] of CONFUSING_PAIRS) {
    if (!/[ァ-ヿ]/.test(a)) continue
    confused.set(a, [...(confused.get(a) ?? []), b])
    confused.set(b, [...(confused.get(b) ?? []), a])
  }
  const pairHint = (a: string, b: string) =>
    PAIR_HINT[`${a}|${b}`] ?? PAIR_HINT[`${b}|${a}`] ?? GENEL_IPUCU

  // Örnek kelime: karakterle BAŞLAYAN kelime tercih edilir, yoksa içinde geçen.
  // Baştaki karakter daha kolay fark edilir; ortada kaybolur.
  const wordFor = (c: string) => {
    const w =
      ALL_KATA_WORDS.find((x) => x.kana.startsWith(c)) ?? ALL_KATA_WORDS.find((x) => x.kana.includes(c))
    return w ? { k: w.kana, r: kataReading(w.kana), f: w.from, t: w.tr } : null
  }

  return KATAKANA.map((k) => {
    const chars = [...k.char]
    const es = (confused.get(k.char) ?? []).slice(0, 2).map((p) => ({
      c: p,
      r: KATAKANA.find((x) => x.char === p)?.romaji ?? '',
      h: pairHint(k.char, p),
    }))
    return {
      c: k.char,
      r: k.romaji,
      t: k.trHint,
      m: k.mnemonic ?? '',
      g: k.group,
      kind: k.kind,
      h: hiraByRomaji.get(k.romaji) ?? '',
      // Çizgi yolları — birden çok karakterli yōon'da yan yana dizilir
      p: chars.flatMap((ch, i) => (strokes[ch]?.s ?? []).map((d) => ({ d, ox: i * 109 }))),
      // Çizgi başlangıç noktaları — ekranda numaralı daire olarak çizilir.
      // Numara HER KARAKTERDE 1'den başlar: キャ gibi iki karakterli yōon'da
      // 1-2-3-4-5 diye devam etseydi ikinci karakterin kendi çizgi sırası
      // yanlış görünürdü.
      n: chars.flatMap((ch, ci) =>
        (strokes[ch]?.n ?? []).map(([x, y], si) => ({ x: x + ci * 109, y, i: si + 1 })),
      ),
      w: chars.length,
      e: es,
      d: wordFor(k.char),
    }
  })
}
