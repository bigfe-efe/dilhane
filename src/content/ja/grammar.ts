import type { GrammarPoint } from '@/types'
import { GRAMMAR_JA_2 } from './grammar-2'

// Japonca dilbilgisi noktaları — N5'ten başlayarak.
// Açıklamalar Türkçe; Türkçe ile Japonca arasındaki yapısal benzerlikler
// (sondan eklemeli olmak, özne-nesne-yüklem sırası) bilinçli olarak vurgulanır.

const g = (p: GrammarPoint): GrammarPoint => p

const GRAMMAR_JA_1: GrammarPoint[] = [
  g({
    id: 'ja-wa-desu',
    lang: 'ja',
    genki: 1,
    title: 'A は B です — "A, B\'dir"',
    level: 'N5',
    summaryTr: 'Cümlenin konusunu は (wa okunur) işaretler, です ile kibarca bitirilir.',
    explanationTr: `Japonca cümlede kelime sırası **özne – nesne – yüklem**'dir; tıpkı Türkçedeki gibi yüklem sona gelir. Bu, Japoncayı Türk için İngilizceden bile tanıdık kılan en büyük avantajdır.

は eki cümlenin **konusunu** işaretler: "…\'e gelince". Yazılırken は (ha) yazılır ama **wa** okunur — bu kuralın tek istisnası budur.

です ise "‑dir" gibi kibar bir bitiştir. Sade konuşmada だ olur veya hiç kullanılmaz.

Olumsuzu: **じゃないです** (günlük) veya **ではありません** (resmî).
Geçmişi: **でした**. Geçmiş olumsuz: **じゃなかったです**.`,
    patterns: ['A は B です', 'A は B じゃないです', 'A は B でした'],
    examples: [
      { text: '私は学生です。', reading: 'わたしはがくせいです。', tr: 'Ben öğrenciyim.' },
      { text: 'これは本です。', reading: 'これはほんです。', tr: 'Bu bir kitap.' },
      { text: '田中さんは先生じゃないです。', reading: 'たなかさんはせんせいじゃないです。', tr: 'Tanaka bey öğretmen değil.' },
      { text: '昨日は暑かったです。', reading: 'きのうはあつかったです。', tr: 'Dün sıcaktı.' },
    ],
    pitfalls: ['は konu ekiyken が özne ekidir; ikisi aynı şey değil.', 'です bir fiil değil, kibar bir bitiştir — i-sıfattan sonra da gelir ama sıfatı çekmez.'],
    related: ['ja-ga', 'ja-mo'],
  }),
  g({
    id: 'ja-ka',
    lang: 'ja',
    genki: 1,
    title: 'か — soru eki',
    level: 'N5',
    summaryTr: 'Cümlenin sonuna か eklenerek soru yapılır; söz dizimi değişmez.',
    explanationTr: `Türkçedeki "mı/mi" gibi düşün: cümlenin sonuna **か** koyarsın, kelime sırası hiç değişmez. Soru işareti genelde yazılmaz, 「。」 kullanılır.

Soru sözcüğü (何, どこ, 誰...) varsa da か yine sonda kalır.`,
    patterns: ['… ですか。', '… ますか。'],
    examples: [
      { text: '学生ですか。', reading: 'がくせいですか。', tr: 'Öğrenci misiniz?' },
      { text: 'これは何ですか。', reading: 'これはなんですか。', tr: 'Bu ne?' },
      { text: '明日行きますか。', reading: 'あしたいきますか。', tr: 'Yarın gidiyor musun?' },
    ],
    pitfalls: ['Sonuna か koyunca ses tonunu yükseltmene gerek yok.'],
  }),
  g({
    id: 'ja-mo',
    lang: 'ja',
    genki: 2,
    title: 'も — "de/da"',
    level: 'N5',
    summaryTr: 'は veya を yerine geçerek "o da" anlamı katar.',
    explanationTr: `Türkçedeki "de/da" ile birebir örtüşür. Önemli nokta: も geldiğinde **は ve を düşer**, birlikte kullanılmaz.

Olumsuz cümlede "hiç ... de" anlamı verir.`,
    patterns: ['A も B です', 'N も + fiil'],
    examples: [
      { text: '私も学生です。', reading: 'わたしもがくせいです。', tr: 'Ben de öğrenciyim.' },
      { text: 'コーヒーも飲みます。', reading: 'こーひーものみます。', tr: 'Kahve de içerim.' },
    ],
    pitfalls: ['「私はも」 yanlıştır; doğrusu 「私も」.'],
  }),
  g({
    id: 'ja-no',
    lang: 'ja',
    genki: 1,
    title: 'の — iyelik ve niteleme',
    level: 'N5',
    summaryTr: 'İki ismi bağlar: "A\'nın B\'si". Sıra Türkçeyle aynıdır.',
    explanationTr: `**A の B** = "A'nın B'si". Türkçedeki tamlama sırasıyla birebir aynıdır: 私の本 = benim kitabım.

Sadece sahiplik değil, her türlü niteleme için kullanılır: 日本語の本 (Japonca kitabı), 大学の先生 (üniversite hocası).

Zincirlenebilir: 私の友だちの車 = arkadaşımın arabası.`,
    patterns: ['A の B'],
    examples: [
      { text: '私の名前は…です。', reading: 'わたしのなまえは…です。', tr: 'Benim adım ...' },
      { text: '日本語の先生', reading: 'にほんごのせんせい', tr: 'Japonca öğretmeni' },
      { text: 'これは誰のかばんですか。', reading: 'これはだれのかばんですか。', tr: 'Bu kimin çantası?' },
    ],
  }),
  g({
    id: 'ja-kore-sore-are',
    lang: 'ja',
    genki: 2,
    title: 'これ・それ・あれ / この・その・あの',
    level: 'N5',
    summaryTr: 'Üçlü mesafe sistemi: bende / sende / ikimizden de uzakta.',
    explanationTr: `Japoncada işaret sözcükleri **üç** mesafeye ayrılır (Türkçedeki bu/şu/o ile şaşırtıcı derecede örtüşür):

| | Tek başına | İsimden önce | Yer | Yön |
|---|---|---|---|---|
| Bende (ko-) | これ | この+isim | ここ | こちら |
| Sende (so-) | それ | その+isim | そこ | そちら |
| Uzakta (a-) | あれ | あの+isim | あそこ | あちら |
| Soru (do-) | どれ | どの+isim | どこ | どちら |

En sık yapılan hata: これ ile この karıştırmak. これ tek başına durur (これは本です), この mutlaka bir isim ister (この本).`,
    patterns: ['これ/それ/あれ は … です', 'この/その/あの + isim'],
    examples: [
      { text: 'それは私のかばんです。', reading: 'それはわたしのかばんです。', tr: 'Şu benim çantam.' },
      { text: 'あの人は誰ですか。', reading: 'あのひとはだれですか。', tr: 'O kişi kim?' },
    ],
    pitfalls: ['「この は本です」 yanlıştır → 「これは本です」.'],
  }),
  g({
    id: 'ja-wo',
    lang: 'ja',
    genki: 3,
    title: 'を — nesne eki',
    level: 'N5',
    summaryTr: 'Fiilin doğrudan nesnesini işaretler; Türkçedeki "‑i" hâline karşılık gelir.',
    explanationTr: `**N を V** yapısı, Türkçedeki belirtili nesne ekiyle ("kitab‑ı okudum") aynı işi görür.

を karakteri sadece bu ek için kullanılır ve **"o"** diye okunur.

Ayrıca hareket fiilleriyle "içinden geçmek" anlamı verir: 公園を歩く (parkın içinde yürümek).`,
    patterns: ['N を V'],
    examples: [
      { text: '本を読みます。', reading: 'ほんをよみます。', tr: 'Kitap okuyorum.' },
      { text: '水を飲みました。', reading: 'みずをのみました。', tr: 'Su içtim.' },
    ],
    pitfalls: ['分かる, できる, 好き gibi kelimeler を değil が alır: 日本語が分かります.'],
  }),
  g({
    id: 'ja-ni-he',
    lang: 'ja',
    genki: 3,
    title: 'に ve へ — yön, zaman, varış',
    level: 'N5',
    summaryTr: 'に varış noktası ve kesin zaman; へ ise yönelim bildirir.',
    explanationTr: `**に** çok işlevlidir:
- Varış: 学校に行きます (okula gidiyorum)
- Bulunma: 部屋にいます (odadayım)
- Kesin zaman: 七時に起きます (saat 7'de kalkarım)
- Alıcı: 友だちに電話します (arkadaşıma telefon ederim)

**へ** sadece yön bildirir ve "e" okunur. Varış vurgusu yoksa に ile çoğu zaman değiştirilebilir.

Zaman ifadelerinde に kullanılıp kullanılmayacağı kritik: **sayı içeren** zamanlar に alır (三時に), **göreli** zamanlar almaz (今日, 明日, 毎日).`,
    patterns: ['yer に 行く/来る/帰る', 'saat に V', 'kişi に V'],
    examples: [
      { text: '日本へ行きます。', reading: 'にほんへいきます。', tr: 'Japonya\'ya gidiyorum.' },
      { text: '毎日七時に起きます。', reading: 'まいにちしちじにおきます。', tr: 'Her gün saat 7\'de kalkarım.' },
      { text: '母に手紙を書きました。', reading: 'ははにてがみをかきました。', tr: 'Anneme mektup yazdım.' },
    ],
    pitfalls: ['「明日に行きます」 yanlıştır → 「明日行きます」.'],
  }),
  g({
    id: 'ja-de',
    lang: 'ja',
    genki: 3,
    title: 'で — yer, araç, yöntem',
    level: 'N5',
    summaryTr: 'Eylemin gerçekleştiği yeri ve kullanılan aracı işaretler.',
    explanationTr: `**で** iki temel işlev görür:
1. **Eylemin yeri**: 図書館で勉強します (kütüphanede çalışırım). Dikkat: sadece *bulunmak* için に kullanılır, *bir şey yapmak* için で.
2. **Araç/yöntem**: 電車で行きます (trenle giderim), 日本語で話します (Japonca konuşurum).

Ayrıca sebep bildirir: 病気で休みました (hastalıktan dolayı dinlendim).`,
    patterns: ['yer で V', 'araç で V'],
    examples: [
      { text: 'カフェでコーヒーを飲みます。', reading: 'かふぇでこーひーをのみます。', tr: 'Kafede kahve içerim.' },
      { text: 'バスで会社へ行きます。', reading: 'ばすでかいしゃへいきます。', tr: 'Otobüsle şirkete giderim.' },
    ],
    pitfalls: ['「家にご飯を食べます」 yanlıştır → 「家でご飯を食べます」.'],
  }),
  g({
    id: 'ja-arimasu-imasu',
    lang: 'ja',
    genki: 4,
    title: 'あります / います — "var"',
    level: 'N5',
    summaryTr: 'Cansızlar için あります, canlılar için います.',
    explanationTr: `Türkçede tek bir "var" varken Japonca ikiye ayırır:
- **あります**: nesneler, bitkiler, soyut şeyler
- **います**: insanlar, hayvanlar (hareket edebilenler)

Yapı: **yer に N が あります/います**

Olumsuz: ありません / いません. Geçmiş: ありました / いました.`,
    patterns: ['yer に N が あります', 'yer に N が います'],
    examples: [
      { text: '机の上に本があります。', reading: 'つくえのうえにほんがあります。', tr: 'Masanın üstünde kitap var.' },
      { text: '部屋に猫がいます。', reading: 'へやにねこがいます。', tr: 'Odada kedi var.' },
      { text: 'お金がありません。', reading: 'おかねがありません。', tr: 'Param yok.' },
    ],
    pitfalls: ['Arabalar cansızdır ama içindeki kişi canlıdır: 車があります / 運転手がいます.'],
  }),
  g({
    id: 'ja-i-adj',
    lang: 'ja',
    genki: 5,
    title: 'い-sıfatlar',
    level: 'N5',
    summaryTr: 'Kendi başlarına çekilirler; geçmiş ve olumsuzu sıfatın kendisi taşır.',
    explanationTr: `Japoncada sıfatlar **fiil gibi çekilir**. い ile biten sıfatlarda son い düşer ve ek gelir:

| Form | Ek | Örnek (高い) |
|---|---|---|
| Yalın | ‑い | 高い |
| Olumsuz | ‑くない | 高くない |
| Geçmiş | ‑かった | 高かった |
| Geçmiş olumsuz | ‑くなかった | 高くなかった |
| Zarf | ‑く | 高く |
| Bağlama | ‑くて | 高くて |

Kibarlık için sonuna **です** eklenir: 高いです / 高くないです / 高かったです.

**いい** düzensizdir: よくない, よかった (いくない ❌).`,
    patterns: ['A い + N', 'A かったです', 'A くないです'],
    examples: [
      { text: 'この本は面白いです。', reading: 'このほんはおもしろいです。', tr: 'Bu kitap ilginç.' },
      { text: '昨日は寒かったです。', reading: 'きのうはさむかったです。', tr: 'Dün soğuktu.' },
      { text: '安くて新しい車', reading: 'やすくてあたらしいくるま', tr: 'ucuz ve yeni araba' },
    ],
    pitfalls: ['「高いでした」 yanlıştır → 「高かったです」.'],
    related: ['ja-na-adj'],
  }),
  g({
    id: 'ja-na-adj',
    lang: 'ja',
    genki: 5,
    title: 'な-sıfatlar',
    level: 'N5',
    summaryTr: 'İsim gibi davranırlar; isimden önce な alırlar.',
    explanationTr: `な-sıfatlar aslında isim gibidir. Çekim **です/だ** üzerinden yapılır:

| Form | Örnek (静か) |
|---|---|
| Yalın | 静かだ / 静かです |
| Olumsuz | 静かじゃない(です) |
| Geçmiş | 静かだった / 静かでした |
| Geçmiş olumsuz | 静かじゃなかった(です) |
| İsimden önce | 静かな部屋 |
| Bağlama | 静かで |

Ayırt etme ipucu: sıfat isimden önce gelirken **な** istiyorsa na-sıfattır. きれい ve 有名 い ile bitse de na-sıfattır — ezberlenmesi gereken tuzaktır.`,
    patterns: ['A な + N', 'A です', 'A じゃないです'],
    examples: [
      { text: 'ここは静かな公園です。', reading: 'ここはしずかなこうえんです。', tr: 'Burası sessiz bir park.' },
      { text: '田中さんは有名でした。', reading: 'たなかさんはゆうめいでした。', tr: 'Tanaka bey ünlüydü.' },
    ],
    pitfalls: ['きれい, 嫌い, 有名 い ile biter ama na-sıfattır.'],
  }),
  g({
    id: 'ja-masu',
    lang: 'ja',
    genki: 3,
    title: 'ます formu — kibar şimdiki/geniş zaman',
    level: 'N5',
    summaryTr: 'Günlük kibar konuşmanın temeli. Hem "yaparım" hem "yapacağım" anlamı taşır.',
    explanationTr: `ます formu hem **geniş zaman** hem **gelecek** anlamı taşır; hangisi olduğu bağlamdan anlaşılır. Türkçedeki gibi ayrı bir gelecek zaman eki yoktur.

| | Olumlu | Olumsuz |
|---|---|---|
| Şimdi/gelecek | ‑ます | ‑ません |
| Geçmiş | ‑ました | ‑ませんでした |

Grup kuralları:
- **Ichidan (ru-fiil)**: る at, ます ekle → 食べる → 食べます
- **Godan (u-fiil)**: son kana い satırına geçer → 飲む → 飲みます
- **Düzensiz**: する → します, 来る → 来ます`,
    patterns: ['V‑ます', 'V‑ません', 'V‑ました', 'V‑ませんでした'],
    examples: [
      { text: '毎朝コーヒーを飲みます。', reading: 'まいあさこーひーをのみます。', tr: 'Her sabah kahve içerim.' },
      { text: '昨日は行きませんでした。', reading: 'きのうはいきませんでした。', tr: 'Dün gitmedim.' },
    ],
    related: ['ja-te-form'],
  }),
  g({
    id: 'ja-te-form',
    lang: 'ja',
    genki: 6,
    title: 'て formu — Japoncanın kalbi',
    level: 'N5',
    summaryTr: 'Cümle bağlar ve onlarca dilbilgisi yapısının temelidir. Mutlaka ezberlenmeli.',
    explanationTr: `て formu tek başına bir zaman değildir; **bağlaç** görevi görür ve üzerine yapılar eklenir. Türkçedeki "‑ip / ‑erek" ekine benzer.

**Godan kuralları** (son kanaya göre):
- う・つ・る → **って** : 買う → 買って
- む・ぶ・ぬ → **んで** : 飲む → 飲んで
- く → **いて** : 書く → 書いて
- ぐ → **いで** : 泳ぐ → 泳いで
- す → **して** : 話す → 話して
- ⚠️ 行く → **行って** (tek istisna)

**Ichidan**: る at, て ekle → 食べる → 食べて
**Düzensiz**: する → して, 来る → 来て

Üzerine kurulan yapılar: ています (sürüyor), てください (rica), てもいいです (izin), てから (‑dikten sonra), ています.`,
    patterns: ['V‑て', 'V‑てから', 'V‑ています', 'V‑てください'],
    examples: [
      { text: '朝起きて、顔を洗います。', reading: 'あさおきて、かおをあらいます。', tr: 'Sabah kalkıp yüzümü yıkarım.' },
      { text: 'ちょっと待ってください。', reading: 'ちょっとまってください。', tr: 'Biraz bekleyin lütfen.' },
    ],
    pitfalls: ['行く fiilinin て formu 行いて değil 行って\'dir.'],
    related: ['ja-teiru'],
  }),
  g({
    id: 'ja-teiru',
    lang: 'ja',
    genki: 7,
    title: 'ています — süregelen eylem ve durum',
    level: 'N5',
    summaryTr: 'Hem "şu an yapıyor" hem "yapmış durumda" anlamı verir.',
    explanationTr: `**V‑ている / V‑ています** iki farklı anlam taşır — bu ayrım öğrenciyi en çok zorlayan noktadır:

1. **Süren eylem**: 食べています = yiyor (şu anda)
2. **Süren durum**: 結婚しています = evli (evlenme olayı bitmiş, sonucu sürüyor)

İkinci anlam 知っている (biliyorum), 住んでいる (yaşıyorum), 持っている (sahibim) gibi fiillerde geçerlidir.

Günlük konuşmada い düşer: 食べてる.`,
    patterns: ['V‑ています', 'V‑ている'],
    examples: [
      { text: '今、本を読んでいます。', reading: 'いま、ほんをよんでいます。', tr: 'Şu anda kitap okuyorum.' },
      { text: 'トルコに住んでいます。', reading: 'とるこにすんでいます。', tr: 'Türkiye\'de yaşıyorum.' },
    ],
    pitfalls: ['知っています olumsuzu 知っていません değil 知りません\'dir.'],
  }),
  g({
    id: 'ja-tai',
    lang: 'ja',
    genki: 11,
    title: 'たい — "‑mek istiyorum"',
    level: 'N5',
    summaryTr: 'ます gövdesine たい eklenir ve sonuç bir い-sıfat gibi çekilir.',
    explanationTr: `**V(ます gövdesi) + たい** = "…mek istiyorum".

Oluşan kelime artık bir **い-sıfat** gibi davranır: 食べたい → 食べたくない → 食べたかった.

Önemli kısıt: たい sadece **birinci** (ve soruda ikinci) kişi için kullanılır. Başkasının isteğini anlatmak için ‑たがっています gerekir.

Nesne eki を yerine が de kullanılabilir: 水が飲みたい.`,
    patterns: ['V‑たいです', 'V‑たくないです', 'V‑たかったです'],
    examples: [
      { text: '日本へ行きたいです。', reading: 'にほんへいきたいです。', tr: 'Japonya\'ya gitmek istiyorum.' },
      { text: '今日は何もしたくないです。', reading: 'きょうはなにもしたくないです。', tr: 'Bugün hiçbir şey yapmak istemiyorum.' },
    ],
    pitfalls: ['「彼は行きたいです」 doğal değildir → 「彼は行きたがっています」.'],
  }),
  g({
    id: 'ja-mashou',
    lang: 'ja',
    genki: 5,
    title: 'ましょう / ませんか — teklif',
    level: 'N5',
    summaryTr: 'ましょう "hadi yapalım", ませんか "yapmaz mısınız" (daha kibar).',
    explanationTr: `- **V‑ましょう**: "hadi ... yapalım". Karşı tarafın kabul edeceğini varsayar.
- **V‑ませんか**: "... yapmaz mısınız?" Daha kibar, daha az baskıcı bir davet.
- **V‑ましょうか**: "... yapayım mı?" Yardım teklifi.`,
    patterns: ['V‑ましょう', 'V‑ませんか', 'V‑ましょうか'],
    examples: [
      { text: '一緒に食べましょう。', reading: 'いっしょにたべましょう。', tr: 'Birlikte yiyelim.' },
      { text: '映画を見ませんか。', reading: 'えいがをみませんか。', tr: 'Film izlemez misiniz?' },
      { text: '手伝いましょうか。', reading: 'てつだいましょうか。', tr: 'Yardım edeyim mi?' },
    ],
  }),
  g({
    id: 'ja-suki',
    lang: 'ja',
    genki: 5,
    title: '～が好きです — beğeni ve yeterlilik',
    level: 'N5',
    summaryTr: '好き, 嫌い, 上手, 下手, 分かる, できる が eki alır — を değil.',
    explanationTr: `Türkçede "suşiyi severim" deriz ve nesne ekiyle kurarız. Japoncada ise 好き bir **sıfattır**, dolayısıyla nesnesi yoktur; sevilen şey が ile işaretlenir.

Aynı kural şunlar için de geçerlidir: 嫌い (sevmemek), 上手 (iyi olmak), 下手 (kötü olmak), 分かる (anlamak), できる (yapabilmek), ほしい (istemek).

Derece için 大好き (çok severim) ve 大嫌い (nefret ederim) kullanılır.`,
    patterns: ['N が 好きです', 'N が 分かります', 'N が 上手です'],
    examples: [
      { text: '寿司が好きです。', reading: 'すしがすきです。', tr: 'Suşi severim.' },
      { text: '日本語が少し分かります。', reading: 'にほんごがすこしわかります。', tr: 'Biraz Japonca anlıyorum.' },
    ],
    pitfalls: ['「寿司を好きです」 yanlıştır.'],
  }),
  g({
    id: 'ja-counters',
    lang: 'ja',
    genki: 5,
    title: 'Sayaçlar (助数詞)',
    level: 'N5',
    summaryTr: 'Nesne sayılırken türüne özel bir sayaç eklenir; Türkçedeki "iki tane kitap" mantığına yakın.',
    explanationTr: `Japoncada bir şeyi sayarken sayının arkasına, nesnenin **şekline göre** bir sayaç gelir:

| Sayaç | Ne için | Örnek |
|---|---|---|
| ‑つ | genel (1–10) | 三つ (üç tane) |
| ‑人 (にん) | insan | 三人 (üç kişi) |
| ‑枚 (まい) | ince/yassı | 二枚 (iki adet kâğıt) |
| ‑本 (ほん) | uzun/silindirik | 三本 (üç şişe) |
| ‑冊 (さつ) | kitap | 二冊 |
| ‑台 (だい) | makine/araç | 一台 |
| ‑匹 (ひき) | küçük hayvan | 二匹 |
| ‑歳 (さい) | yaş | 二十歳 |

Ses değişimleri vardır: 一本 = いっぽん, 三本 = さんぼん, 一人 = ひとり, 二人 = ふたり.

Emin değilsen **‑つ** genel sayacı çoğu somut nesne için kabul edilir (1–10 arası).`,
    patterns: ['N を sayı+sayaç ください', 'sayı+sayaç あります'],
    examples: [
      { text: 'りんごを三つください。', reading: 'りんごをみっつください。', tr: 'Üç elma lütfen.' },
      { text: '学生が五人います。', reading: 'がくせいがごにんいます。', tr: 'Beş öğrenci var.' },
    ],
  }),
  g({
    id: 'ja-time',
    lang: 'ja',
    genki: 1,
    title: 'Saat ve tarih söyleme',
    level: 'N5',
    summaryTr: '‑時 saat, ‑分 dakika; bazı okunuşlar düzensizdir.',
    explanationTr: `**Saat**: sayı + 時 (じ). Düzensizler: 4時 = **よじ**, 7時 = **しちじ**, 9時 = **くじ**.

**Dakika**: sayı + 分. Okunuş ふん/ぷん arasında değişir: 1分 いっぷん, 2分 にふん, 3分 さんぷん, 4分 よんぷん, 6分 ろっぷん, 8分 はっぷん, 10分 じゅっぷん.

**Yarım**: 半 (はん) → 二時半 = iki buçuk.
**Öğleden önce/sonra**: 午前 / 午後, saatten **önce** gelir: 午後三時.

**Gün**: ayın günleri 1–10 arası tamamen düzensizdir: 一日 ついたち, 二日 ふつか, 三日 みっか, 四日 よっか, 五日 いつか, 六日 むいか, 七日 なのか, 八日 ようか, 九日 ここのか, 十日 とおか. 20\'si de özeldir: 二十日 はつか.`,
    patterns: ['sayı 時 sayı 分', '午前/午後 + saat', 'ay 月 gün 日'],
    examples: [
      { text: '今、四時半です。', reading: 'いま、よじはんです。', tr: 'Şu an dört buçuk.' },
      { text: '午後七時に会いましょう。', reading: 'ごごしちじにあいましょう。', tr: 'Akşam yedide buluşalım.' },
    ],
    pitfalls: ['4時 よんじ değil よじ okunur.'],
  }),
  g({
    id: 'ja-kara-made',
    lang: 'ja',
    genki: 4,
    title: 'から / まで — "‑den" ve "‑e kadar"',
    level: 'N5',
    summaryTr: 'Zaman ve mekân aralığı kurar; Türkçedeki ‑den ... ‑e kadar ile aynıdır.',
    explanationTr: `- **から**: başlangıç noktası ("‑den, ‑dan"). Sebep bildirmek için de kullanılır: 寒いから (soğuk olduğu için).
- **まで**: bitiş noktası ("‑e kadar").
- **までに**: son teslim tarihi ("...‑e kadar, en geç"). まで sürekliliği, までに ise sınırı anlatır.`,
    patterns: ['A から B まで', '… から (sebep)', '… までに'],
    examples: [
      { text: '九時から五時まで働きます。', reading: 'くじからごじまではたらきます。', tr: 'Dokuzdan beşe kadar çalışırım.' },
      { text: '寒いから、家にいます。', reading: 'さむいから、いえにいます。', tr: 'Soğuk olduğu için evdeyim.' },
    ],
  }),
  g({
    id: 'ja-ga',
    lang: 'ja',
    genki: 7,
    title: 'が — özne eki ve "ama"',
    level: 'N5',
    summaryTr: 'Yeni bilgiyi veya vurgulanan özneyi işaretler; cümle ortasında "ama" anlamı verir.',
    explanationTr: `**は konuyu, が özneyi** işaretler. Fark inceliklidir ama önemlidir:

- は: zaten bilinen konu hakkında bilgi verir → 私は学生です
- が: **yeni** veya **vurgulanan** bilgiyi getirir → 誰が来ましたか。田中さん**が**来ました。

Kural: soru sözcüğü özne konumundaysa が kullanılır, cevabı da が alır.

Ayrıca cümleleri "ama/fakat" anlamıyla bağlar: 高いですが、おいしいです (pahalı ama lezzetli).`,
    patterns: ['N が V', '… ですが、…'],
    examples: [
      { text: '誰が来ますか。', reading: 'だれがきますか。', tr: 'Kim geliyor?' },
      { text: 'この店は高いですが、おいしいです。', reading: 'このみせはたかいですが、おいしいです。', tr: 'Bu dükkân pahalı ama lezzetli.' },
    ],
    related: ['ja-wa-desu'],
  }),
  g({
    id: 'ja-plain-form',
    lang: 'ja',
    genki: 8,
    title: 'Sade biçim (普通形) — arkadaş dili',
    level: 'N5',
    summaryTr: 'ます\'sız biçim. Yakın çevreyle konuşurken ve cümle içi yapılarda kullanılır.',
    explanationTr: `Sade biçim iki yerde gerekir:
1. Yakın arkadaş/aile ile konuşurken
2. Cümle içinde başka bir yapıya bağlanırken (と思う, つもり, 前に...) — burada kibarlık ne olursa olsun **sade biçim zorunludur**

| | Olumlu | Olumsuz |
|---|---|---|
| Şimdi | 食べる | 食べない |
| Geçmiş | 食べた | 食べなかった |

です karşılığı **だ**'dır ama soru cümlelerinde ve kadın konuşmasında sıkça düşer.`,
    patterns: ['V‑る / V‑ない / V‑た / V‑なかった'],
    examples: [
      { text: '明日行くと思います。', reading: 'あしたいくとおもいます。', tr: 'Yarın gideceğimi düşünüyorum.' },
      { text: 'ご飯を食べる前に手を洗う。', reading: 'ごはんをたべるまえにてをあらう。', tr: 'Yemekten önce ellerimi yıkarım.' },
    ],
    pitfalls: ['と思います yapısında 「行きますと思います」 yanlıştır → 「行くと思います」.'],
  }),
  g({
    id: 'ja-yori-hou',
    lang: 'ja',
    genki: 10,
    title: 'より / のほうが — karşılaştırma',
    level: 'N5',
    summaryTr: 'A のほうが B より … です = "A, B\'den daha …"',
    explanationTr: `Japoncada sıfatın kendisi derecelenmez ("daha büyük" diye ayrı bir kelime yoktur); karşılaştırma **eklerle** yapılır.

**A のほうが B より + sıfat** = A, B'den daha ...

Soru: **A と B と どちらが … ですか** (A mı B mi daha ...?)
Cevapta 「Aのほうが…」 denir.

En üstünlük: **N の中で いちばん …** = "... içinde en ...".`,
    patterns: ['A のほうが B より …', 'A と B と どちらが …', '… の中で いちばん …'],
    examples: [
      { text: '電車のほうがバスより速いです。', reading: 'でんしゃのほうがばすよりはやいです。', tr: 'Tren otobüsten daha hızlı.' },
      { text: '果物の中でりんごがいちばん好きです。', reading: 'くだもののなかでりんごがいちばんすきです。', tr: 'Meyveler arasında en çok elma severim.' },
    ],
  }),
  g({
    id: 'ja-potential',
    lang: 'ja',
    genki: 13,
    title: 'Yeterlilik biçimi — "‑ebilmek"',
    level: 'N5',
    summaryTr: 'Türkçedeki "‑ebilir" ekinin karşılığı; fiilin kendisi değişir.',
    explanationTr: `İki yol vardır:

1. **Çekim**: godan fiilde son kana え satırına geçip る eklenir (飲む → 飲める), ichidan\'da る yerine られる gelir (食べる → 食べられる). する → できる, 来る → 来られる.
2. **Yapı**: **V(sözlük) + ことができる** — daha resmî.

Önemli: yeterlilik biçiminde nesne genelde **を değil が** alır: 日本語**が**話せます.

Günlük Japoncada ichidan fiillerde ら düşürülür: 食べれる (ら抜き言葉). Resmî yazıda kullanma.`,
    patterns: ['V‑える/られる', 'V‑ことができる'],
    examples: [
      { text: '日本語が話せます。', reading: 'にほんごがはなせます。', tr: 'Japonca konuşabiliyorum.' },
      { text: '泳ぐことができません。', reading: 'およぐことができません。', tr: 'Yüzemiyorum.' },
    ],
  }),
  g({
    id: 'ja-te-permission',
    lang: 'ja',
    genki: 6,
    title: 'てもいいです / てはいけません — izin ve yasak',
    level: 'N5',
    summaryTr: 'İzin istemek ve yasak bildirmek için て formu üzerine kurulan yapılar.',
    explanationTr: `- **V‑てもいいですか**: "... yapabilir miyim?" (izin isteme)
- **V‑てもいいです**: "yapabilirsin" (izin verme)
- **V‑てはいけません**: "yapmamalısın / yasak" (net yasak)
- **V‑なければなりません**: "yapmak zorundayım"
- **V‑なくてもいいです**: "yapmasan da olur"

Günlük konuşmada ては → **ちゃ** kısalır: 食べちゃいけない.`,
    patterns: ['V‑てもいいですか', 'V‑てはいけません', 'V‑なければなりません'],
    examples: [
      { text: 'ここに座ってもいいですか。', reading: 'ここにすわってもいいですか。', tr: 'Buraya oturabilir miyim?' },
      { text: 'ここでたばこを吸ってはいけません。', reading: 'ここでたばこをすってはいけません。', tr: 'Burada sigara içilmez.' },
    ],
  }),
  g({
    id: 'ja-ne-yo',
    lang: 'ja',
    genki: 2,
    title: 'ね / よ — cümle sonu ekleri',
    level: 'N5',
    summaryTr: 'ね onay arar ("değil mi"), よ yeni bilgi verir ("biliyor musun").',
    explanationTr: `Japoncada cümle sonu ekleri konuşmanın tonunu belirler — bunlar olmadan konuşma robotik durur.

- **ね**: karşıdakinin de bildiğini varsayar, onay arar. Türkçedeki "değil mi", "ya" gibi. 今日は暑いですね。
- **よ**: karşıdakinin bilmediği bir bilgiyi verir, vurgular. Aşırı kullanımı ısrarcı durabilir. これ、おいしいですよ。
- **よね**: ikisinin birleşimi — "öyle değil mi?" (emin değilken onay arama)`,
    patterns: ['… ですね', '… ですよ', '… ですよね'],
    examples: [
      { text: '今日はいい天気ですね。', reading: 'きょうはいいてんきですね。', tr: 'Bugün hava güzel, değil mi?' },
      { text: 'この店、安いですよ。', reading: 'このみせ、やすいですよ。', tr: 'Bu dükkân ucuz (haberin olsun).' },
    ],
  }),
  g({
    id: 'ja-mou-mada',
    lang: 'ja',
    genki: 9,
    title: 'もう / まだ — "artık" ve "henüz"',
    level: 'N5',
    summaryTr: 'もう tamamlanmayı, まだ tamamlanmamayı veya devamı anlatır.',
    explanationTr: `- **もう + geçmiş**: "artık/çoktan yaptı" → もう食べました
- **もう + olumsuz**: "artık değil" → もう食べません
- **まだ + ています**: "hâlâ ediyor" → まだ食べています
- **まだ + olumsuz**: "henüz değil" → まだ食べていません

Dikkat: "henüz yemedim" için まだ食べませんでした değil, **まだ食べていません** denir — durum hâlâ sürüyor.`,
    patterns: ['もう V‑ました', 'まだ V‑ていません'],
    examples: [
      { text: 'もう昼ご飯を食べましたか。', reading: 'もうひるごはんをたべましたか。', tr: 'Öğle yemeğini yedin mi?' },
      { text: 'いいえ、まだ食べていません。', reading: 'いいえ、まだたべていません。', tr: 'Hayır, henüz yemedim.' },
    ],
  }),
]

/** Genki sırasına göre dizili tam liste. */
export const GRAMMAR_JA: GrammarPoint[] = [...GRAMMAR_JA_1, ...GRAMMAR_JA_2].sort(
  (a, b) => (a.genki ?? 99) - (b.genki ?? 99),
)

export const GRAMMAR_JA_BY_ID = new Map(GRAMMAR_JA.map((p) => [p.id, p]))
