import type { KanaChar } from '@/types'

// Japon alfabeleri. Veri, satır satır (gyō) tanımlanır; hiragana ve katakana
// aynı okunuşu paylaştığı için tek tabloda tutulup iki listeye açılır.

interface KanaRow {
  group: string
  kind: KanaChar['kind']
  items: {
    h: string
    k: string
    /** romaji */
    r: string
    /** Türkçe okunuş ipucu */
    tr: string
    /** hiragana çizgi sayısı */
    hs?: number
    /** katakana çizgi sayısı */
    ks?: number
    /** hiragana hatırlatıcısı */
    hm?: string
    /** katakana hatırlatıcısı */
    km?: string
  }[]
}

const ROWS: KanaRow[] = [
  {
    group: 'あ行 (a-satırı)',
    kind: 'base',
    items: [
      { h: 'あ', k: 'ア', r: 'a', tr: 'a', hs: 3, ks: 2, hm: 'Bir "A"nın üstüne çarpı atılmış gibi.', km: 'Büyük A harfinin sol yarısı.' },
      { h: 'い', k: 'イ', r: 'i', tr: 'i', hs: 2, ks: 2, hm: 'İki damla — "iki" de i ile başlar.', km: 'Eğik bir çizgi ve dayanağı.' },
      { h: 'う', k: 'ウ', r: 'u', tr: 'u', hs: 2, ks: 3, hm: 'Şaşkın bir "u" sesi çıkaran ağız.', km: 'Şapkalı bir ev — "uy" der gibi.' },
      { h: 'え', k: 'エ', r: 'e', tr: 'e', hs: 2, ks: 3, hm: 'Boynu uzun bir kuş: "eeee".', km: 'Yatık "I" — mühendislik "E"si.' },
      { h: 'お', k: 'オ', r: 'o', tr: 'o', hs: 3, ks: 3, hm: 'あ ile kardeş ama sağ üstünde nokta var.', km: 'Bir çengel ve çizgi.' },
    ],
  },
  {
    group: 'か行 (ka-satırı)',
    kind: 'base',
    items: [
      { h: 'か', k: 'カ', r: 'ka', tr: 'ka', hs: 3, ks: 2, hm: 'Kılıç ve kalkan: "ka!"', km: 'Hiragana か\'nın sadeleşmiş hâli.' },
      { h: 'き', k: 'キ', r: 'ki', tr: 'ki', hs: 4, ks: 3, hm: 'Anahtar (key) gibi.', km: 'Anahtar — "key".' },
      { h: 'く', k: 'ク', r: 'ku', tr: 'ku', hs: 1, ks: 2, hm: 'Kuşun gagası.', km: 'Gaga, biraz daha köşeli.' },
      { h: 'け', k: 'ケ', r: 'ke', tr: 'ke', hs: 3, ks: 3, hm: 'Bir "ke"çi boynuzu.', km: 'Üçgen ve çizgi.' },
      { h: 'こ', k: 'コ', r: 'ko', tr: 'ko', hs: 2, ks: 2, hm: 'İki paralel çizgi — iki "ko"vada.', km: 'Köşeli parantez.' },
    ],
  },
  {
    group: 'さ行 (sa-satırı)',
    kind: 'base',
    items: [
      { h: 'さ', k: 'サ', r: 'sa', tr: 'sa', hs: 3, ks: 3, hm: 'Balık oltası — "sa"zan.', km: 'Çapraz çizgiler.' },
      { h: 'し', k: 'シ', r: 'shi', tr: 'şi', hs: 1, ks: 3, hm: 'Tek kancalı çizgi.', km: 'ツ ile karışır: シ soldan sağa yatık okunur.' },
      { h: 'す', k: 'ス', r: 'su', tr: 'su', hs: 2, ks: 2, hm: 'Halkalı bir düğüm.', km: 'Kayan bir çizgi.' },
      { h: 'せ', k: 'セ', r: 'se', tr: 'se', hs: 3, ks: 2, hm: 'Bir "se"hpa.', km: 'Yedi rakamı gibi.' },
      { h: 'そ', k: 'ソ', r: 'so', tr: 'so', hs: 1, ks: 2, hm: 'Zikzak.', km: 'ン ile karışır: ソ yukarıdan aşağı iner.' },
    ],
  },
  {
    group: 'た行 (ta-satırı)',
    kind: 'base',
    items: [
      { h: 'た', k: 'タ', r: 'ta', tr: 'ta', hs: 4, ks: 3, hm: 'Latin "ta" harflerinin birleşimi.', km: 'ク\'ya bir çizgi eklenmiş.' },
      { h: 'ち', k: 'チ', r: 'chi', tr: 'çi', hs: 2, ks: 3, hm: '"chi" = çi. Sandalye gibi.', km: 'テ\'ye benzer ama alt kanca var.' },
      { h: 'つ', k: 'ツ', r: 'tsu', tr: 'tsu (ts tek ses)', hs: 1, ks: 3, hm: 'Dalga.', km: 'シ ile karışır: ツ yukarıdan aşağı çizilir.' },
      { h: 'て', k: 'テ', r: 'te', tr: 'te', hs: 1, ks: 3, hm: 'Bir el (te = el).', km: 'Üç yatay/dikey çizgi.' },
      { h: 'と', k: 'ト', r: 'to', tr: 'to', hs: 2, ks: 2, hm: 'Ayak parmağına batan diken.', km: 'Bir T harfi gibi.' },
    ],
  },
  {
    group: 'な行 (na-satırı)',
    kind: 'base',
    items: [
      { h: 'な', k: 'ナ', r: 'na', tr: 'na', hs: 4, ks: 2, hm: 'Bir haç ve düğüm.', km: 'Basit haç.' },
      { h: 'に', k: 'ニ', r: 'ni', tr: 'ni', hs: 3, ks: 2, hm: 'İki çizgi = "ni" (2 sayısı ni okunur).', km: 'İki çizgi — 2 = に.' },
      { h: 'ぬ', k: 'ヌ', r: 'nu', tr: 'nu', hs: 2, ks: 2, hm: 'め ile karışır; ぬ\'nun kuyruğu ilmekli.', km: 'ス\'ya benzer, dikkat.' },
      { h: 'ね', k: 'ネ', r: 'ne', tr: 'ne', hs: 2, ks: 4, hm: 'Kuyruklu kedi.', km: 'Şapkalı çizgiler.' },
      { h: 'の', k: 'ノ', r: 'no', tr: 'no', hs: 1, ks: 1, hm: 'Tek hamlede spiral — en çok görülen kana.', km: 'Tek eğik çizgi.' },
    ],
  },
  {
    group: 'は行 (ha-satırı)',
    kind: 'base',
    items: [
      { h: 'は', k: 'ハ', r: 'ha', tr: 'ha', hs: 3, ks: 2, hm: 'Merdiven. (Dikkat: cümlede ek olarak "wa" okunur.)', km: 'İki bacak.' },
      { h: 'ひ', k: 'ヒ', r: 'hi', tr: 'hi', hs: 1, ks: 2, hm: 'Gülen ağız.', km: 'Bir "E" gibi.' },
      { h: 'ふ', k: 'フ', r: 'fu', tr: 'fu (f ile h arası, üfler gibi)', hs: 4, ks: 1, hm: 'Dağ ve kuş.', km: 'Tek kanca.' },
      { h: 'へ', k: 'ヘ', r: 'he', tr: 'he', hs: 1, ks: 1, hm: 'Tepe. (Ek olarak "e" okunur.)', km: 'Aynı tepe — hiragana ile neredeyse aynı.' },
      { h: 'ほ', k: 'ホ', r: 'ho', tr: 'ho', hs: 4, ks: 4, hm: 'は + bir çizgi.', km: 'Ağaç gibi.' },
    ],
  },
  {
    group: 'ま行 (ma-satırı)',
    kind: 'base',
    items: [
      { h: 'ま', k: 'マ', r: 'ma', tr: 'ma', hs: 3, ks: 2, hm: 'İki çizgi ve ilmek.', km: 'Şapka ve kuyruk.' },
      { h: 'み', k: 'ミ', r: 'mi', tr: 'mi', hs: 2, ks: 3, hm: 'Sayı 3\'e benziyor — "mi" 3 demek.', km: 'Üç çizgi = 3 = み.' },
      { h: 'む', k: 'ム', r: 'mu', tr: 'mu', hs: 3, ks: 2, hm: 'İnek: "muu".', km: 'Küçük köşe.' },
      { h: 'め', k: 'メ', r: 'me', tr: 'me', hs: 2, ks: 2, hm: 'Göz (me = göz).', km: 'Çarpı işareti.' },
      { h: 'も', k: 'モ', r: 'mo', tr: 'mo', hs: 3, ks: 3, hm: 'Olta ve iki yem.', km: 'Yatay çizgiler ve kanca.' },
    ],
  },
  {
    group: 'や行 (ya-satırı)',
    kind: 'base',
    items: [
      { h: 'や', k: 'ヤ', r: 'ya', tr: 'ya', hs: 3, ks: 2, hm: 'Sapan.', km: 'Sadeleşmiş sapan.' },
      { h: 'ゆ', k: 'ユ', r: 'yu', tr: 'yu', hs: 2, ks: 2, hm: 'Balık.', km: 'İki çizgi.' },
      { h: 'よ', k: 'ヨ', r: 'yo', tr: 'yo', hs: 2, ks: 3, hm: 'Bir kanca.', km: 'Üç dişli tarak.' },
    ],
  },
  {
    group: 'ら行 (ra-satırı)',
    kind: 'base',
    items: [
      { h: 'ら', k: 'ラ', r: 'ra', tr: 'ra (r ile l arası, dil damağa hafif dokunur)', hs: 2, ks: 2, hm: 'Nokta ve kanca.', km: 'Şapkalı kanca.' },
      { h: 'り', k: 'リ', r: 'ri', tr: 'ri', hs: 2, ks: 2, hm: 'İki dik çizgi.', km: 'İki dik çizgi — hiragana ile benzer.' },
      { h: 'る', k: 'ル', r: 'ru', tr: 'ru', hs: 1, ks: 2, hm: 'ろ + ilmek.', km: 'İki bacak.' },
      { h: 'れ', k: 'レ', r: 're', tr: 're', hs: 2, ks: 1, hm: 'ね/わ ile karışır; れ\'nin kuyruğu dışa savrulur.', km: 'Tek kanca.' },
      { h: 'ろ', k: 'ロ', r: 'ro', tr: 'ro', hs: 1, ks: 3, hm: 'る\'nun ilmeksizi.', km: 'Kare — ağız.' },
    ],
  },
  {
    group: 'わ行 ve ん',
    kind: 'base',
    items: [
      { h: 'わ', k: 'ワ', r: 'wa', tr: 'wa', hs: 2, ks: 2, hm: 'ね/れ ile karışır; わ\'nın kuyruğu içe kıvrılır.', km: 'ク\'ya benzer, dikkat.' },
      { h: 'を', k: 'ヲ', r: 'wo', tr: 'o (nesne eki olarak kullanılır)', hs: 3, ks: 3, hm: 'Sadece nesne eki olarak yazılır, "o" okunur.', km: 'Nadiren kullanılır.' },
      { h: 'ん', k: 'ン', r: 'n', tr: 'n (tek başına hece sayılır)', hs: 1, ks: 2, hm: 'Tek kavisli çizgi.', km: 'ソ ile karışır: ン soldan yukarı çıkar.' },
    ],
  },
  {
    group: 'が行 (dakuten)',
    kind: 'dakuten',
    items: [
      { h: 'が', k: 'ガ', r: 'ga', tr: 'ga' },
      { h: 'ぎ', k: 'ギ', r: 'gi', tr: 'gi' },
      { h: 'ぐ', k: 'グ', r: 'gu', tr: 'gu' },
      { h: 'げ', k: 'ゲ', r: 'ge', tr: 'ge' },
      { h: 'ご', k: 'ゴ', r: 'go', tr: 'go' },
    ],
  },
  {
    group: 'ざ行 (dakuten)',
    kind: 'dakuten',
    items: [
      { h: 'ざ', k: 'ザ', r: 'za', tr: 'za' },
      { h: 'じ', k: 'ジ', r: 'ji', tr: 'ci' },
      { h: 'ず', k: 'ズ', r: 'zu', tr: 'zu' },
      { h: 'ぜ', k: 'ゼ', r: 'ze', tr: 'ze' },
      { h: 'ぞ', k: 'ゾ', r: 'zo', tr: 'zo' },
    ],
  },
  {
    group: 'だ行 (dakuten)',
    kind: 'dakuten',
    items: [
      { h: 'だ', k: 'ダ', r: 'da', tr: 'da' },
      { h: 'ぢ', k: 'ヂ', r: 'ji', tr: 'ci (nadir)' },
      { h: 'づ', k: 'ヅ', r: 'zu', tr: 'zu (nadir)' },
      { h: 'で', k: 'デ', r: 'de', tr: 'de' },
      { h: 'ど', k: 'ド', r: 'do', tr: 'do' },
    ],
  },
  {
    group: 'ば行 (dakuten)',
    kind: 'dakuten',
    items: [
      { h: 'ば', k: 'バ', r: 'ba', tr: 'ba' },
      { h: 'び', k: 'ビ', r: 'bi', tr: 'bi' },
      { h: 'ぶ', k: 'ブ', r: 'bu', tr: 'bu' },
      { h: 'べ', k: 'ベ', r: 'be', tr: 'be' },
      { h: 'ぼ', k: 'ボ', r: 'bo', tr: 'bo' },
    ],
  },
  {
    group: 'ぱ行 (handakuten)',
    kind: 'handakuten',
    items: [
      { h: 'ぱ', k: 'パ', r: 'pa', tr: 'pa' },
      { h: 'ぴ', k: 'ピ', r: 'pi', tr: 'pi' },
      { h: 'ぷ', k: 'プ', r: 'pu', tr: 'pu' },
      { h: 'ぺ', k: 'ペ', r: 'pe', tr: 'pe' },
      { h: 'ぽ', k: 'ポ', r: 'po', tr: 'po' },
    ],
  },
  {
    group: 'Yōon (küçük ゃゅょ ile birleşenler)',
    kind: 'yoon',
    items: [
      { h: 'きゃ', k: 'キャ', r: 'kya', tr: 'kya' },
      { h: 'きゅ', k: 'キュ', r: 'kyu', tr: 'kyu' },
      { h: 'きょ', k: 'キョ', r: 'kyo', tr: 'kyo' },
      { h: 'しゃ', k: 'シャ', r: 'sha', tr: 'şa' },
      { h: 'しゅ', k: 'シュ', r: 'shu', tr: 'şu' },
      { h: 'しょ', k: 'ショ', r: 'sho', tr: 'şo' },
      { h: 'ちゃ', k: 'チャ', r: 'cha', tr: 'ça' },
      { h: 'ちゅ', k: 'チュ', r: 'chu', tr: 'çu' },
      { h: 'ちょ', k: 'チョ', r: 'cho', tr: 'ço' },
      { h: 'にゃ', k: 'ニャ', r: 'nya', tr: 'nya' },
      { h: 'にゅ', k: 'ニュ', r: 'nyu', tr: 'nyu' },
      { h: 'にょ', k: 'ニョ', r: 'nyo', tr: 'nyo' },
      { h: 'ひゃ', k: 'ヒャ', r: 'hya', tr: 'hya' },
      { h: 'ひゅ', k: 'ヒュ', r: 'hyu', tr: 'hyu' },
      { h: 'ひょ', k: 'ヒョ', r: 'hyo', tr: 'hyo' },
      { h: 'みゃ', k: 'ミャ', r: 'mya', tr: 'mya' },
      { h: 'みゅ', k: 'ミュ', r: 'myu', tr: 'myu' },
      { h: 'みょ', k: 'ミョ', r: 'myo', tr: 'myo' },
      { h: 'りゃ', k: 'リャ', r: 'rya', tr: 'rya' },
      { h: 'りゅ', k: 'リュ', r: 'ryu', tr: 'ryu' },
      { h: 'りょ', k: 'リョ', r: 'ryo', tr: 'ryo' },
      { h: 'ぎゃ', k: 'ギャ', r: 'gya', tr: 'gya' },
      { h: 'ぎゅ', k: 'ギュ', r: 'gyu', tr: 'gyu' },
      { h: 'ぎょ', k: 'ギョ', r: 'gyo', tr: 'gyo' },
      { h: 'じゃ', k: 'ジャ', r: 'ja', tr: 'ca' },
      { h: 'じゅ', k: 'ジュ', r: 'ju', tr: 'cu' },
      { h: 'じょ', k: 'ジョ', r: 'jo', tr: 'co' },
      { h: 'びゃ', k: 'ビャ', r: 'bya', tr: 'bya' },
      { h: 'びゅ', k: 'ビュ', r: 'byu', tr: 'byu' },
      { h: 'びょ', k: 'ビョ', r: 'byo', tr: 'byo' },
      { h: 'ぴゃ', k: 'ピャ', r: 'pya', tr: 'pya' },
      { h: 'ぴゅ', k: 'ピュ', r: 'pyu', tr: 'pyu' },
      { h: 'ぴょ', k: 'ピョ', r: 'pyo', tr: 'pyo' },
    ],
  },
]

export const HIRAGANA: KanaChar[] = ROWS.flatMap((row) =>
  row.items.map<KanaChar>((it) => ({
    char: it.h,
    romaji: it.r,
    type: 'hiragana',
    group: row.group,
    trHint: it.tr,
    mnemonic: it.hm,
    strokes: it.hs,
    kind: row.kind,
  })),
)

export const KATAKANA: KanaChar[] = ROWS.flatMap((row) =>
  row.items.map<KanaChar>((it) => ({
    char: it.k,
    romaji: it.r,
    type: 'katakana',
    group: row.group,
    trHint: it.tr,
    mnemonic: it.km,
    strokes: it.ks,
    kind: row.kind,
  })),
)

export const ALL_KANA: KanaChar[] = [...HIRAGANA, ...KATAKANA]

export const KANA_BY_CHAR = new Map(ALL_KANA.map((k) => [k.char, k]))

/** Öğrenme sırası: temel satırlar önce, sonra dakuten, en son yōon. */
export function kanaGroups(type: 'hiragana' | 'katakana'): { group: string; kind: KanaChar['kind']; chars: KanaChar[] }[] {
  const src = type === 'hiragana' ? HIRAGANA : KATAKANA
  const out: { group: string; kind: KanaChar['kind']; chars: KanaChar[] }[] = []
  for (const k of src) {
    let bucket = out.find((b) => b.group === k.group)
    if (!bucket) {
      bucket = { group: k.group, kind: k.kind, chars: [] }
      out.push(bucket)
    }
    bucket.chars.push(k)
  }
  return out
}

/** Türkçe konuşan biri için en çok karışan kana çiftleri — özel alıştırma için. */
export const CONFUSING_PAIRS: [string, string][] = [
  // ————— Hiragana —————
  ['あ', 'お'],
  ['ぬ', 'め'],
  ['ね', 'れ'],
  ['れ', 'わ'],
  ['ね', 'わ'],
  ['る', 'ろ'],
  ['さ', 'ち'],
  ['さ', 'き'],
  ['は', 'ほ'],
  ['は', 'ま'],
  ['い', 'り'],
  ['こ', 'い'],
  ['つ', 'し'],
  ['そ', 'ろ'],
  ['な', 'た'],
  ['ま', 'も'],
  ['す', 'む'],
  ['く', 'し'],
  ['け', 'は'],
  ['ん', 'そ'],
  // ————— Katakana —————
  //
  // Katakana hiraganadan DAHA çok karışır: harfler daha az çizgiden oluşuyor,
  // dolayısıyla ayırt edici ayrıntı daha az. シ/ツ ile ソ/ン'i ayıran şey tek
  // bir çizginin AÇISI ve YÖNÜ — şeklin kendisi değil.
  ['シ', 'ツ'],
  ['ソ', 'ン'],
  ['シ', 'ソ'],
  ['ツ', 'ン'],
  ['ク', 'ワ'],
  ['ク', 'ケ'],
  ['ク', 'タ'],
  ['ス', 'ヌ'],
  ['ヌ', 'メ'],
  ['マ', 'ム'],
  ['ア', 'マ'],
  ['ナ', 'メ'],
  ['チ', 'テ'],
  ['チ', 'タ'],
  ['ウ', 'ワ'],
  ['ウ', 'フ'],
  ['ル', 'レ'],
  ['レ', 'ノ'],
  ['コ', 'ユ'],
  ['オ', 'ホ'],
  ['ニ', 'エ'],
  ['セ', 'ヤ'],
  ['ラ', 'ヲ'],
  ['ミ', 'ラ'],
]
