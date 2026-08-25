// Japon yazı sisteminin tanıtımı.
// Amaç: harfleri ezberlemeden ÖNCE "ne göreceğini" bilmek. Japonca metinde
// üç yazı birden, bazen dikey bazen yatay, boşluksuz ve alışılmadık noktalama
// ile karşımıza çıkar; bunları önceden tanımak şaşırmayı önler.

export type ScriptId = 'kanji' | 'hiragana' | 'katakana' | 'romaji' | 'punct'

/** Renkli çözümleme için cümle parçası. */
export interface Segment {
  text: string
  script: ScriptId
  /** Bu parçanın ne işe yaradığı — tek satır */
  note?: string
}

export interface SampleSentence {
  segments: Segment[]
  reading: string
  romaji: string
  tr: string
}

export const SCRIPT_TR: Record<ScriptId, string> = {
  kanji: 'Kanji',
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  romaji: 'Romaji / rakam',
  punct: 'Noktalama',
}

/** Üç yazının aynı cümlede nasıl iç içe geçtiğini gösteren örnek. */
export const MIXED_SAMPLE: SampleSentence = {
  segments: [
    { text: '私', script: 'kanji', note: 'ben' },
    { text: 'は', script: 'hiragana', note: 'konu eki (burada "wa" okunur)' },
    { text: 'コーヒー', script: 'katakana', note: 'coffee — yabancı kelime' },
    { text: 'を', script: 'hiragana', note: 'nesne eki ("o" okunur)' },
    { text: '飲', script: 'kanji', note: 'içmek (kök)' },
    { text: 'みます', script: 'hiragana', note: 'fiil çekimi (okurigana)' },
    { text: '。', script: 'punct', note: 'nokta — küçük daire' },
  ],
  reading: 'わたしはコーヒーをのみます。',
  romaji: 'watashi wa kōhī o nomimasu.',
  tr: 'Ben kahve içerim.',
}

export const SECOND_SAMPLE: SampleSentence = {
  segments: [
    { text: '9', script: 'romaji', note: 'Arap rakamı — yatay yazıda normaldir' },
    { text: '時', script: 'kanji', note: 'saat' },
    { text: 'に', script: 'hiragana', note: 'zaman eki' },
    { text: 'テレビ', script: 'katakana', note: 'television' },
    { text: 'を', script: 'hiragana' },
    { text: '見', script: 'kanji', note: 'görmek/izlemek' },
    { text: 'ました', script: 'hiragana', note: 'geçmiş zaman eki' },
    { text: '。', script: 'punct' },
  ],
  reading: 'くじにテレビをみました。',
  romaji: 'kuji ni terebi o mimashita.',
  tr: 'Saat 9’da televizyon izledim.',
}

export interface ScriptCard {
  id: ScriptId
  title: string
  native: string
  count: string
  /** Tek cümlelik özet */
  what: string
  /** Ne zaman kullanılır */
  used: string[]
  /** Görsel ayırt etme ipucu */
  look: string
  samples: string[]
  /** Türkçeyle kıyas — tanıdık bir zemin */
  compare: string
}

export const SCRIPTS: ScriptCard[] = [
  {
    id: 'hiragana',
    title: 'Hiragana',
    native: 'ひらがな',
    count: '46 temel işaret',
    what: 'Japoncanın ses alfabesi. Her işaret bir HECE gösterir — harf değil, hece.',
    used: [
      'Japonca kökenli kelimeler: やま (dağ), たべる (yemek)',
      'Dilbilgisi ekleri ve parçacıklar: は, を, に, で',
      'Fiil ve sıfat çekim sonları (okurigana): 食べます — kanji kök, kana kuyruk',
      'Kanjisi henüz öğrenilmemiş kelimeler',
    ],
    look: 'Yuvarlak, akışkan, kıvrımlı. Fırça yazısından gelir; köşe hemen hemen yoktur.',
    samples: ['あ', 'の', 'ね', 'さ', 'ゆ'],
    compare:
      'Türkçedeki harflere en yakın şey budur; ama "k" gibi tek ses değil, "ka" gibi bir hece taşır. Bu yüzden 46 işaretle bütün Japoncayı yazabilirsin.',
  },
  {
    id: 'katakana',
    title: 'Katakana',
    native: 'カタカナ',
    count: '46 temel işaret',
    what: 'Hiragana ile TAM AYNI sesleri gösterir; sadece biçimi farklıdır. İtalik gibi düşün.',
    used: [
      'Yabancı kelimeler: コーヒー (kahve), トルコ (Türkiye)',
      'Yabancı isimler: エフェ (Efe)',
      'Ses taklitleri: ワンワン (hav hav)',
      'Vurgu — Türkçede tırnak içine almak gibi',
      'Bilim adları, marka isimleri',
    ],
    look: 'Köşeli, keskin, düz çizgili. Hiragana yumuşaksa katakana serttir.',
    samples: ['ア', 'ノ', 'ネ', 'サ', 'ユ'],
    compare:
      'Aynı sesin iki yazımı olması tuhaf gelir ama işlevi nettir: metne bakar bakmaz "bu kelime yabancı" dersin.',
  },
  {
    id: 'kanji',
    title: 'Kanji',
    native: '漢字',
    count: 'günlük hayatta ~2.000, N5 için ~100',
    what: 'Çinceden alınmış ANLAM karakterleri. Her biri bir sesi değil, bir kavramı gösterir.',
    used: [
      'İsimlerin ve fiillerin kökü: 山 (dağ), 食べる (yemek)',
      'Aynı sesli kelimeleri ayırmak: はし = 橋 (köprü) / 箸 (yemek çubuğu)',
      'Metni kısaltmak ve kelime sınırını göstermek',
    ],
    look: 'Karmaşık, çok çizgili, kare bir kutuyu dolduran yapılar.',
    samples: ['日', '本', '語', '山', '食'],
    compare:
      'Türkçede karşılığı yok. En yakın benzetme: "€" işareti gibi. Onu görünce "euro" ya da "avro" diye okursun — işaret sesi değil anlamı taşır. Kanji de öyle, üstelik çoğunun birden fazla okunuşu vardır.',
  },
  {
    id: 'romaji',
    title: 'Romaji',
    native: 'ローマ字',
    count: 'bildiğin Latin harfleri',
    what: 'Japoncanın Latin harfleriyle yazılışı. Japonlar günlük hayatta neredeyse hiç kullanmaz.',
    used: [
      'Yabancılara yönelik tabelalar, istasyon isimleri',
      'Klavyede yazarken (romaji yazarsın, bilgisayar kanaya çevirir)',
      'Marka isimleri: SONY, HONDA',
    ],
    look: 'Tanıdık Latin harfleri.',
    samples: ['a', 'ka', 'shi', 'Tokyo'],
    compare:
      'Öğrenirken koltuk değneğidir. Ne kadar erken bırakırsan o kadar hızlı okursun — bu yüzden bu uygulamada romaji hep küçük ve soluk yazılır.',
  },
]

export interface QuirkCard {
  title: string
  /** Görsel örnek — büyük punto Japonca */
  demo?: string
  body: string
  tip?: string
}

/** "Gördüğünde şaşırma" bölümü: yazının alışılmadık davranışları. */
export const QUIRKS: QuirkCard[] = [
  {
    title: 'Kelimeler arasında boşluk yok',
    demo: 'わたしはがくせいです',
    body:
      'Japonca metinde boşluk kullanılmaz. Kelimeleri, yazı türünün değişmesinden ayırırsın: kanji biter kana başlar — orası genelde kelime sınırıdır.',
    tip: 'Yukarıdaki cümle kanjili yazılınca çok daha okunaklı: 私は学生です。',
  },
  {
    title: 'Nokta ve virgül farklı',
    demo: '。、「」',
    body:
      'Nokta içi boş küçük bir daire (。 kuten), virgül ters yönde bir çentiktir (、tōten). Tırnak yerine köşeli 「 」 kullanılır. Soru cümlesinde çoğu zaman soru işareti bile yazılmaz — sonundaki か zaten soru demektir.',
    tip: 'Noktalama işaretleri de bir karakter kadar yer kaplar; kendi karesi vardır.',
  },
  {
    title: 'Küçük yazılan kana sesi değiştirir',
    demo: 'きよ ≠ きょ',
    body:
      'ゃ ゅ ょ küçük yazıldığında önceki heceyle birleşir: きょ tek hecedir, "kyo" okunur. Normal boyutta きよ ise iki hecedir: "ki-yo".',
    tip: 'Küçük っ ise ses değil DURAKLAMA demektir: かこ "ka-ko", かっこ "kak-ko". Türkçedeki "elli" gibi çift ünsüz düşün.',
  },
  {
    title: 'İki tırnak ve küçük daire sesi kalınlaştırır',
    demo: 'か → が · は → ば → ぱ',
    body:
      'Sağ üste eklenen iki çentik (dakuten ゛) sessizi tonlu yapar: k→g, s→z, t→d, h→b. Küçük daire (handakuten ゜) yalnız は satırına gelir ve p yapar.',
    tip: 'Yani 46 işareti öğrenince aslında ~100 heceyi okuyabiliyorsun.',
  },
  {
    title: 'Uzun ünlüler yazıyla gösterilir',
    demo: 'おばさん ≠ おばあさん',
    body:
      'Uzun ünlü ayrı bir anlamdır, süsleme değil. おばさん "teyze", おばあさん "büyükanne" demektir. Hiraganada ünlü tekrar yazılır (おかあさん), katakanada uzun çizgi kullanılır (コーヒー).',
    tip: 'ー işareti yalnızca katakanada görülür ve yazı yatayken yatay, dikeyken dikey durur.',
  },
  {
    title: 'Aynı harfin iki çizimi olabilir',
    demo: 'さ き り ふ',
    body:
      'Bazı kana, ders kitabında ve ekranda farklı görünür. En bilineni さ: el yazısı ve ders kitabı biçiminde alt kısım AYRI bir çizgidir (3 çizgi), ama Yu Gothic gibi ekran yazı tiplerinde alt kısım üstle BİRLEŞİK çizilir. き, り, ふ ve そ de aynı durumdadır. İkisi de aynı harftir — aynı Unicode karakteri; fark yalnızca yazı tipi tasarımındandır.',
    tip: 'Kural basit: ELLE YAZARKEN ayrık biçimi kullan (NHK ve ders kitapları böyle öğretir), OKURKEN ikisini de tanı. Bu uygulamada karakterler yazı tipiyle değil gerçek çizgi verisiyle çizilir, yani hep el yazısı biçimini görürsün; karakter sayfasındaki "İki biçim" kutusundan basılı hâliyle karşılaştırabilirsin.',
  },
  {
    title: 'Kanjinin üstündeki küçük yazı: furigana',
    demo: '日本[にほん]',
    body:
      'Zor veya yeni bir kanjinin üstüne (dikey yazıda sağına) okunuşu küçük hiragana ile yazılır. Buna furigana denir; çocuk kitaplarında ve ders kitaplarında boldur.',
    tip: 'Bu uygulamada furigana desteklenir — kanjinin üstünde küçük kana olarak görürsün.',
  },
  {
    title: 'Kanji + kana birlikte: okurigana',
    demo: '食べる · 食べます · 食べた',
    body:
      'Fiilin ve sıfatın anlam kökü kanjiyle, değişen eki hiragana ile yazılır. Kök sabit kalır, kuyruk çekilir.',
    tip: 'Türkçedeki "gel-mek / gel-di / gel-ecek" mantığı. Kanji "gel", hiragana ise ektir.',
  },
  {
    title: 'Aynı karakterin birden çok okunuşu var',
    demo: '日 → にち · び · ひ · か',
    body:
      'Kanjinin Çinceden gelen okunuşu (on\'yomi) ve Japonca okunuşu (kun\'yomi) vardır. Hangisinin kullanılacağı kelimeye göre değişir.',
    tip: 'Bu yüzden kanjiyi tek başına değil, KELİME içinde öğrenmek gerekir.',
  },
]

export interface DirectionInfo {
  id: 'yokogaki' | 'tategaki'
  title: string
  native: string
  flow: string
  where: string[]
  sample: string
}

export const DIRECTIONS: DirectionInfo[] = [
  {
    id: 'yokogaki',
    title: 'Yatay yazı',
    native: '横書き (yokogaki)',
    flow: 'Soldan sağa, satırlar yukarıdan aşağıya — Türkçedeki gibi.',
    where: ['İnternet siteleri ve uygulamalar', 'Ders kitapları, bilim ve teknik metinler', 'Resmî formlar', 'Reklamlar'],
    sample: '私は日本語を勉強しています。',
  },
  {
    id: 'tategaki',
    title: 'Dikey yazı',
    native: '縦書き (tategaki)',
    flow: 'Yukarıdan aşağıya; sütunlar SAĞDAN SOLA ilerler. Yani kitap da sağdan sola açılır.',
    where: ['Romanlar ve şiir', 'Gazeteler', 'Manga', 'Tabelalar, menüler, resmî mektuplar'],
    sample: '私は日本語を勉強しています。',
  },
]

/** Çizgi sırasının genel kuralları — tek tek karakter ezberlemeden önce. */
export const STROKE_RULES: { rule: string; detail: string; demo?: string }[] = [
  { rule: 'Yukarıdan aşağıya', detail: 'Karakterin üst parçaları önce yazılır.', demo: '三' },
  { rule: 'Soldan sağa', detail: 'Yan yana duran parçalarda soldaki önce gelir.', demo: '川' },
  { rule: 'Önce yatay, sonra dikey', detail: 'Kesişen çizgilerde yatay olan önce çizilir.', demo: '十' },
  { rule: 'Ortadaki önce', detail: 'Simetrik karakterlerde orta çizgi, sonra iki yan.', demo: '小' },
  { rule: 'Dış çerçeve önce', detail: 'Kutu önce kapatılır, içi sonra doldurulur; alt kenar en son.', demo: '国' },
  { rule: 'Karakteri delen çizgi en son', detail: 'Baştan sona geçen uzun çizgi sona bırakılır.', demo: '車' },
  {
    rule: 'Kalem yönü de kuraldır',
    detail: 'Her çizgi belli bir yönde çizilir; ters yönde çizersen harf aynı görünse de el yazın "yabancı" durur ve hızlanamazsın.',
  },
]

/** Öğrenme sırası önerisi. */
export const ROADMAP: { step: string; detail: string }[] = [
  { step: '1. Hiragana', detail: 'Önce 46 temel işaret, sonra dakuten ve yōon. Her şeyin temeli budur.' },
  { step: '2. Katakana', detail: 'Aynı sesler, farklı biçim. Hiragana oturunca çok daha hızlı gider.' },
  { step: '3. Kelime + dilbilgisi', detail: 'Kana okuyabildiğin anda gerçek cümlelere geçebilirsin.' },
  { step: '4. Kanji', detail: 'Kelimelerle birlikte, azar azar. N5 için ~100 karakter yeter.' },
]
