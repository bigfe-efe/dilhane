import { shuffle } from '@/lib/shuffle'

// JLPT N5 deneme sınavı.
//
// GERÇEK SINAVIN YAPISI (2020 sonrası biçim):
//   1. 言語知識（文字・語彙）  Kelime bilgisi        20 dakika
//   2. 言語知識（文法）・読解   Dilbilgisi ve okuma   40 dakika
//   3. 聴解                    Dinleme               30 dakika
//   Toplam 90 dakika.
//
// PUANLAMA: iki puan bölümü vardır.
//   • Dil bilgisi (kelime+dilbilgisi) ve okuma → 0-120
//   • Dinleme                                  → 0-60
//   Toplam 0-180. GEÇMEK İÇİN ÜÇ ŞART BİRDEN: toplam ≥ 80, birinci bölüm ≥ 38,
//   dinleme ≥ 19. Birinden kalırsan toplam yetse bile geçemezsin.
//
// DİNLEME NEDEN YOK:
// Bu cihazda Japonca konuşma sesi kurulu değil; uygulama Türkçe yaklaşık
// okumaya düşüyor. Yanlış telaffuzla dinleme sınavı yapmak ölçmez, yanlış
// öğretir. O yüzden dinleme bölümü UYDURULMADI — sonuçta 120 üzerinden
// değerlendirme yapılıyor ve dinlemenin ayrıca çalışılması gerektiği açıkça
// söyleniyor.
//
// SORULAR: gerçek sınav sorularının kopyası değildir (telif). Sınavın soru
// TİPLERİ taklit edilmiştir; cümleler bu uygulamaya özgü yazılmıştır.

export type MondaiId =
  | 'kanji-yomi'
  | 'hyouki'
  | 'bunmyaku'
  | 'iikae'
  | 'bunpou1'
  | 'bunpou2'
  | 'bunshou'
  | 'dokkai'

export type SectionId = 'moji-goi' | 'bunpou-dokkai'

export const SECTIONS: Record<SectionId, { title: string; jp: string; minutes: number; desc: string }> = {
  'moji-goi': {
    title: 'Kelime bilgisi',
    jp: '言語知識（文字・語彙）',
    minutes: 20,
    desc: 'Kanji okunuşu, yazım, bağlama uygun kelime ve eş anlam',
  },
  'bunpou-dokkai': {
    title: 'Dilbilgisi ve okuma',
    jp: '言語知識（文法）・読解',
    minutes: 40,
    desc: 'Dilbilgisi biçimleri, cümle kurma, metin içi boşluk ve okuduğunu anlama',
  },
}

export const MONDAI: Record<MondaiId, { section: SectionId; no: number; title: string; jp: string; howto: string }> = {
  'kanji-yomi': {
    section: 'moji-goi',
    no: 1,
    title: 'Kanji okunuşu',
    jp: '漢字読み',
    howto: 'Altı çizili kanjinin okunuşunu seç.',
  },
  hyouki: {
    section: 'moji-goi',
    no: 2,
    title: 'Yazım',
    jp: '表記',
    howto: 'Altı çizili kelimenin doğru yazımını seç.',
  },
  bunmyaku: {
    section: 'moji-goi',
    no: 3,
    title: 'Bağlama uygun kelime',
    jp: '文脈規定',
    howto: 'Boşluğa en uygun kelimeyi seç.',
  },
  iikae: {
    section: 'moji-goi',
    no: 4,
    title: 'Eş anlam',
    jp: '言い換え類義',
    howto: 'Verilen cümleye anlamca en yakın cümleyi seç.',
  },
  bunpou1: {
    section: 'bunpou-dokkai',
    no: 1,
    title: 'Dilbilgisi biçimi',
    jp: '文の文法1',
    howto: 'Boşluğa en uygun ek veya biçimi seç.',
  },
  bunpou2: {
    section: 'bunpou-dokkai',
    no: 2,
    title: 'Cümle kurma',
    jp: '文の文法2（文の組み立て）',
    howto: 'Cümleyi doğru sıraya diz; ★ ile işaretli yere hangi parça gelir?',
  },
  bunshou: {
    section: 'bunpou-dokkai',
    no: 3,
    title: 'Metin içi dilbilgisi',
    jp: '文章の文法',
    howto: 'Metindeki boşluklara uygun ifadeyi seç.',
  },
  dokkai: {
    section: 'bunpou-dokkai',
    no: 4,
    title: 'Okuduğunu anlama',
    jp: '読解',
    howto: 'Metni oku ve soruları cevapla.',
  },
}

// ————————————————————————— Soru biçimleri —————————————————————————

export interface MockQ {
  id: string
  mondai: MondaiId
  /** Soru gövdesi. __ boşluğu, ＿＿ altı çizili yeri gösterir. */
  prompt: string
  options: string[]
  answer: number
  explain: string
  /** Okuma sorularında bağlı olduğu metin */
  passageId?: string
  /** Cümle kurma sorusunda doğru sıra (gösterim için) */
  fullSentence?: string
}

export interface Passage {
  id: string
  title: string
  body: string
  /** Kısa bilgi metni mi (ilan/tablo) yoksa düz metin mi */
  kind: 'metin' | 'ilan'
}

// ————————————————————————— Okuma metinleri —————————————————————————

export const PASSAGES: Passage[] = [
  {
    id: 'p1',
    kind: 'metin',
    title: 'わたしの いちにち',
    body: `わたしは まいあさ 六時に おきます。あさごはんを たべてから、七時半に うちを 出ます。
がっこうまで バスで 三十分ぐらい かかります。
ごぜん中は 日本語の じゅぎょうが あります。ひるごはんは がっこうの しょくどうで たべます。
ごごは としょかんで べんきょうします。うちに かえるのは 六時ごろです。
よるは テレビを 見ませんが、ときどき おんがくを ききます。十一時に ねます。`,
  },
  {
    id: 'p2',
    kind: 'ilan',
    title: 'としょかんの おしらせ',
    body: `【としょかん りようの おしらせ】

じかん： ごぜん 九時 〜 ごご 八時
やすみ： まいしゅう 月よう日
      （十二月二十九日から 一月三日まで やすみです）

・本は 二しゅうかんまで かりられます。
・一かいに 五さつまでです。
・としょかんの 中で たべものを たべないで ください。
・のみものは 入口の ちかくで のんで ください。`,
  },
]

// ————————————————————————— Soru bankası —————————————————————————
//
// Sorular gerçek sınav sorularının kopyası değil; tipleri aynı, cümleler
// buraya özgü. Seviye N5 kelime ve dilbilgisiyle sınırlı tutuldu.

export const BANK: MockQ[] = [
  // ————— 問題1 漢字読み —————
  {
    id: 'ky1',
    mondai: 'kanji-yomi',
    prompt: 'あしたは ＿山＿に のぼります。',
    options: ['やま', 'かわ', 'うみ', 'そら'],
    answer: 0,
    explain: '山 tek başına やま okunur. 川 kawa (nehir), 海 umi (deniz), 空 sora (gökyüzü).',
  },
  {
    id: 'ky2',
    mondai: 'kanji-yomi',
    prompt: 'この ＿本＿は おもしろいです。',
    options: ['ほん', 'ぼん', 'もと', 'ふん'],
    answer: 0,
    explain: '本 "kitap" anlamında ほん okunur. もと okunuşu "kök, asıl" anlamındadır.',
  },
  {
    id: 'ky3',
    mondai: 'kanji-yomi',
    prompt: '＿先生＿は きょうしつに います。',
    options: ['せんせい', 'せんせえ', 'せんせ', 'ぜんせい'],
    answer: 0,
    explain: '先生 = せんせい. "Sensee" gibi duyulur ama yazımı せんせい’dir (uzun e, えい ile yazılır).',
  },
  {
    id: 'ky4',
    mondai: 'kanji-yomi',
    prompt: '＿水＿を のみます。',
    options: ['みず', 'みす', 'すい', 'みつ'],
    answer: 0,
    explain: '水 tek başına みず. すい okunuşu birleşik kelimelerde çıkar: 水よう日 (すいようび).',
  },
  {
    id: 'ky5',
    mondai: 'kanji-yomi',
    prompt: 'まいにち ＿七時＿に おきます。',
    options: ['しちじ', 'ななじ', 'しちとき', 'なのじ'],
    answer: 0,
    explain: 'Saatlerde 七 しち okunur: 七時 = しちじ. Sayı olarak なな de denir ama saatte しち kullanılır.',
  },
  {
    id: 'ky6',
    mondai: 'kanji-yomi',
    prompt: '＿何人＿ きましたか。',
    options: ['なんにん', 'なにじん', 'いくにん', 'なんびと'],
    answer: 0,
    explain: '何人 "kaç kişi" なんにん okunur. なにじん okunuşu "hangi milletten" demektir.',
  },

  // ————— 問題2 表記 —————
  {
    id: 'hy1',
    mondai: 'hyouki',
    prompt: 'まいにち ＿がっこう＿へ いきます。',
    options: ['学校', '学枚', '字校', '学挍'],
    answer: 0,
    explain: 'がっこう = 学校. Diğerleri gerçek kelime değildir; 学 ve 校 karakterlerinin doğru eşleşmesi budur.',
  },
  {
    id: 'hy2',
    mondai: 'hyouki',
    prompt: '＿ひと＿が おおいです。',
    options: ['人', '入', '八', '大'],
    answer: 0,
    explain: '人 (hito) ile 入 (iru/hairu) çok benzer: 人’de sol çizgi üstten başlar. 八 hachi, 大 ookii.',
  },
  {
    id: 'hy3',
    mondai: 'hyouki',
    prompt: '＿いま＿ なんじですか。',
    options: ['今', '会', '合', '令'],
    answer: 0,
    explain: 'いま = 今. 会 (kai/au), 合 (au) benzer görünür ama farklı karakterlerdir.',
  },
  {
    id: 'hy4',
    mondai: 'hyouki',
    prompt: '＿おおきい＿ いえですね。',
    options: ['大きい', '犬きい', '太きい', '天きい'],
    answer: 0,
    explain: '大 (ookii) ile 犬 (inu, köpek) ve 太 (futoi, kalın) yalnızca bir noktayla ayrılır.',
  },
  {
    id: 'hy5',
    mondai: 'hyouki',
    prompt: '＿くるま＿で いきます。',
    options: ['車', '東', '軍', '事'],
    answer: 0,
    explain: 'くるま = 車. 東 (higashi, doğu) benzer görünür ama üst kısmı farklıdır.',
  },

  // ————— 問題3 文脈規定 —————
  {
    id: 'bm1',
    mondai: 'bunmyaku',
    prompt: 'あついですね。まどを __ ください。',
    options: ['あけて', 'しめて', 'つけて', 'けして'],
    answer: 0,
    explain: 'Sıcaksa pencere AÇILIR: あける = açmak. しめる kapatmak, つける (ışığı) açmak, けす söndürmek.',
  },
  {
    id: 'bm2',
    mondai: 'bunmyaku',
    prompt: 'きのう ともだちに てがみを __。',
    options: ['かきました', 'よみました', 'ききました', 'みました'],
    answer: 0,
    explain: 'Mektup YAZILIR: てがみを かく. 読む okumak, 聞く duymak, 見る görmek.',
  },
  {
    id: 'bm3',
    mondai: 'bunmyaku',
    prompt: 'この みせは やすいですから、いつも __ です。',
    options: ['にぎやか', 'しずか', 'ひま', 'べんり'],
    answer: 0,
    explain: 'Ucuz olduğu için kalabalık/hareketli olur: にぎやか. しずか sessiz, ひま boş vakitli, べんり kullanışlı.',
  },
  {
    id: 'bm4',
    mondai: 'bunmyaku',
    prompt: 'あたまが いたいですから、きょうは __ ません。',
    options: ['いき', 'いって', 'いく', 'いった'],
    answer: 0,
    explain: 'ません olumsuz kibar ek, ます gövdesine gelir: 行きます → 行きません. Gövde いき’dir.',
  },
  {
    id: 'bm5',
    mondai: 'bunmyaku',
    prompt: 'たなかさんは ギターを ひくのが __ です。',
    options: ['じょうず', 'たかい', 'おおい', 'はやい'],
    answer: 0,
    explain: 'Bir işte usta olmak: 上手（じょうず）. Diğerleri sırasıyla pahalı, çok, hızlı demektir.',
  },
  {
    id: 'bm6',
    mondai: 'bunmyaku',
    prompt: 'かぜを ひきました。だから、びょういんへ __。',
    options: ['いきました', 'きました', 'かえりました', 'でました'],
    answer: 0,
    explain: 'Hastaneye GİTMEK: 行く. 来る gelmek, 帰る (eve) dönmek, 出る çıkmak.',
  },

  // ————— 問題4 言い換え類義 —————
  {
    id: 'ik1',
    mondai: 'iikae',
    prompt: 'この もんだいは やさしいです。',
    options: [
      'この もんだいは かんたんです。',
      'この もんだいは むずかしいです。',
      'この もんだいは たいせつです。',
      'この もんだいは あたらしいです。',
    ],
    answer: 0,
    explain: 'やさしい burada "kolay" anlamındadır; eşanlamlısı かんたん. (やさしい "nazik" anlamına da gelir.)',
  },
  {
    id: 'ik2',
    mondai: 'iikae',
    prompt: 'わたしは まいあさ パンを たべます。',
    options: [
      'わたしは まいにち あさ パンを たべます。',
      'わたしは ときどき パンを たべます。',
      'わたしは ゆうべ パンを たべました。',
      'わたしは パンが すきじゃないです。',
    ],
    answer: 0,
    explain: '毎朝（まいあさ）= her sabah = 毎日の朝. Sıklık aynı kalmalı.',
  },
  {
    id: 'ik3',
    mondai: 'iikae',
    prompt: 'きのうは しごとが ありませんでした。',
    options: [
      'きのうは やすみでした。',
      'きのうは いそがしかったです。',
      'きのうは はたらきました。',
      'きのうは やすみじゃ ありませんでした。',
    ],
    answer: 0,
    explain: 'İş yoktu = tatildi: 休み（やすみ）. Diğerleri tersini söylüyor.',
  },
  {
    id: 'ik4',
    mondai: 'iikae',
    prompt: 'たなかさんは やまださんに ほんを かりました。',
    options: [
      'やまださんは たなかさんに ほんを かしました。',
      'たなかさんは やまださんに ほんを かしました。',
      'やまださんは たなかさんに ほんを かりました。',
      'たなかさんは ほんを かいました。',
    ],
    answer: 0,
    explain: '借りる ödünç ALMAK, 貸す ödünç VERMEK. Tanaka aldıysa Yamada vermiştir — özne değişir.',
  },

  // ————— 文法1 —————
  {
    id: 'b1',
    mondai: 'bunpou1',
    prompt: 'わたし __ トルコ人です。',
    options: ['は', 'を', 'に', 'へ'],
    answer: 0,
    explain: 'は konu ekidir: "bana gelince, Türküm". Yazılışı は, okunuşu "wa".',
  },
  {
    id: 'b2',
    mondai: 'bunpou1',
    prompt: 'まいにち コーヒー __ のみます。',
    options: ['を', 'が', 'は', 'で'],
    answer: 0,
    explain: 'を nesne ekidir; eylemin üzerinde gerçekleştiği şeyi işaretler. Okunuşu "o".',
  },
  {
    id: 'b3',
    mondai: 'bunpou1',
    prompt: 'としょかん __ ほんを よみます。',
    options: ['で', 'に', 'を', 'へ'],
    answer: 0,
    explain: 'で eylemin YERİNİ gösterir. に varlık/bulunma bildirir: としょかんに います.',
  },
  {
    id: 'b4',
    mondai: 'bunpou1',
    prompt: 'つくえの うえ __ ねこが います。',
    options: ['に', 'で', 'を', 'と'],
    answer: 0,
    explain: 'Varlık bildiren あります/います ile yer eki に kullanılır.',
  },
  {
    id: 'b5',
    mondai: 'bunpou1',
    prompt: 'この ケーキは おいしい __。',
    options: ['です', 'だです', 'いです', 'なです'],
    answer: 0,
    explain: 'い-sıfat doğrudan です alır: おいしいです. Araya だ veya な girmez.',
  },
  {
    id: 'b6',
    mondai: 'bunpou1',
    prompt: 'きのう えいがを __。',
    options: ['見ました', '見ます', '見ています', '見ましょう'],
    answer: 0,
    explain: 'きのう geçmiş zaman ister: ました. 見ます şimdiki/geniş, 見ましょう öneri bildirir.',
  },
  {
    id: 'b7',
    mondai: 'bunpou1',
    prompt: 'しゅくだいを して __ テレビを 見ます。',
    options: ['から', 'まで', 'ので', 'のに'],
    answer: 0,
    explain: '〜てから "…yaptıktan sonra" demektir. まで "…e kadar", ので sebep bildirir.',
  },
  {
    id: 'b8',
    mondai: 'bunpou1',
    prompt: 'ここで しゃしんを とらないで __。',
    options: ['ください', 'います', 'あります', 'ましょう'],
    answer: 0,
    explain: '〜ないでください "lütfen …meyin" kalıbıdır; yasak/rica bildirir.',
  },
  {
    id: 'b9',
    mondai: 'bunpou1',
    prompt: 'わたしは いぬ __ ねこが すきです。',
    options: ['より', 'から', 'まで', 'ほど'],
    answer: 0,
    explain: 'A より B のほうが… karşılaştırmadır: "köpekten çok kediyi severim".',
  },
  {
    id: 'b10',
    mondai: 'bunpou1',
    prompt: 'あした あめが ふる __ おもいます。',
    options: ['と', 'を', 'は', 'で'],
    answer: 0,
    explain: '〜と思います kalıbında fiil SADE biçimde kalır: 降ると思います (降りますと思います yanlıştır).',
  },

  // ————— 文法2 cümle kurma —————
  {
    id: 'o1',
    mondai: 'bunpou2',
    prompt: 'わたしは ＿ ＿ ★ ＿ たべます。',
    options: ['ごはんを', 'まいあさ', 'うちで', 'かならず'],
    answer: 3,
    explain: 'Doğru sıra: まいあさ → うちで → かならず → ごはんを. Zaman en başta, sonra yer, sonra sıklık, en sonda nesne gelir. ★ üçüncü sırada olduğu için cevap かならず.',
    fullSentence: 'わたしは まいあさ うちで かならず ごはんを たべます。',
  },
  {
    id: 'o2',
    mondai: 'bunpou2',
    prompt: 'きのう ＿ ＿ ★ ＿ 見ました。',
    options: ['ともだちと', 'えいがを', 'えいがかんで', 'あたらしい'],
    answer: 3,
    explain: 'Doğru sıra: ともだちと → えいがかんで → あたらしい → えいがを. ★ üçüncü yerde: あたらしい.',
    fullSentence: 'きのう ともだちと えいがかんで あたらしい えいがを 見ました。',
  },
  {
    id: 'o3',
    mondai: 'bunpou2',
    prompt: 'この へやは ＿ ＿ ★ ＿ です。',
    options: ['あかるくて', 'とても', 'ひろい', 'しずかで'],
    answer: 1,
    explain: 'Doğru sıra: あかるくて → しずかで → とても → ひろい. い-sıfat bağlanırken くて, な-sıfat で olur; とても son sıfatı niteler. ★ üçüncü sırada: とても.',
    fullSentence: 'この へやは あかるくて しずかで とても ひろいです。',
  },
  {
    id: 'o4',
    mondai: 'bunpou2',
    prompt: 'にちようびに ＿ ＿ ★ ＿ つもりです。',
    options: ['かいものに', 'ともだちと', 'いく', 'デパートへ'],
    answer: 0,
    explain: 'Doğru sıra: ともだちと → デパートへ → かいものに → いく. つもり’den önce fiil SADE biçimde gelir. ★ üçüncü sırada: かいものに.',
    fullSentence: 'にちようびに ともだちと デパートへ かいものに いく つもりです。',
  },

  // ————— 文章の文法 (metin içi boşluk) —————
  {
    id: 'bs1',
    mondai: 'bunshou',
    passageId: 'p1',
    prompt: 'Metne göre: あさごはんを たべて __、うちを 出ます。',
    options: ['から', 'ながら', 'ため', 'まで'],
    answer: 0,
    explain: '〜てから: bir işi bitirdikten SONRA. Metinde de bu kalıp geçiyor.',
  },
  {
    id: 'bs2',
    mondai: 'bunshou',
    passageId: 'p1',
    prompt: 'Metne göre: がっこうまで バス __ いきます。',
    options: ['で', 'に', 'を', 'と'],
    answer: 0,
    explain: 'Ulaşım aracı で ile bildirilir: バスで, でんしゃで, あるいて (istisna).',
  },
  {
    id: 'bs3',
    mondai: 'bunshou',
    passageId: 'p1',
    prompt: 'Metne göre: よるは テレビを 見ません __、おんがくを ききます。',
    options: ['が', 'から', 'ので', 'と'],
    answer: 0,
    explain: 'が burada "ama" demektir; iki zıt bilgiyi bağlar.',
  },
  {
    id: 'bs4',
    mondai: 'bunshou',
    passageId: 'p2',
    prompt: 'İlana göre: としょかんの 中で たべものを __ ください。',
    options: ['たべないで', 'たべて', 'たべた', 'たべる'],
    answer: 0,
    explain: '〜ないでください yasak bildirir. İlanlarda sık kullanılır.',
  },

  // ————— 読解 —————
  {
    id: 'd1',
    mondai: 'dokkai',
    passageId: 'p1',
    prompt: 'この人は なんじに うちを 出ますか。',
    options: ['七時半', '六時', '七時', '八時'],
    answer: 0,
    explain: 'Metinde "七時半に うちを 出ます" diyor. 六時 kalkma saati.',
  },
  {
    id: 'd2',
    mondai: 'dokkai',
    passageId: 'p1',
    prompt: 'ひるごはんは どこで たべますか。',
    options: ['がっこうの しょくどう', 'うち', 'としょかん', 'こうえん'],
    answer: 0,
    explain: '"ひるごはんは がっこうの しょくどうで たべます" — 食堂 yemekhane demektir.',
  },
  {
    id: 'd3',
    mondai: 'dokkai',
    passageId: 'p1',
    prompt: 'よる なにを しますか。',
    options: ['ときどき おんがくを ききます', 'まいばん テレビを 見ます', 'ともだちに あいます', 'べんきょうしません'],
    answer: 0,
    explain: 'Metin "テレビを 見ませんが、ときどき おんがくを ききます" diyor.',
  },
  {
    id: 'd4',
    mondai: 'dokkai',
    passageId: 'p2',
    prompt: 'としょかんは なんようびが やすみですか。',
    options: ['月よう日', '日よう日', '土よう日', 'やすみは ありません'],
    answer: 0,
    explain: '"やすみ： まいしゅう 月よう日" — her pazartesi kapalı.',
  },
  {
    id: 'd5',
    mondai: 'dokkai',
    passageId: 'p2',
    prompt: '本は なんさつまで かりられますか。',
    options: ['五さつ', '二さつ', '十さつ', '三さつ'],
    answer: 0,
    explain: '"一かいに 五さつまでです" — bir seferde en fazla 5 kitap. 二しゅうかん ise süredir.',
  },
  {
    id: 'd6',
    mondai: 'dokkai',
    passageId: 'p2',
    prompt: 'のみものは どこで のみますか。',
    options: ['入口の ちかく', 'としょかんの 中', 'どこでも いいです', 'のめません'],
    answer: 0,
    explain: '"のみものは 入口の ちかくで のんで ください" — girişin yakınında.',
  },
]

// ————————————————————————— Sınav kurma —————————————————————————

export interface MockSectionPlan {
  section: SectionId
  questions: MockQ[]
  minutes: number
}

/**
 * Deneme sınavını kurar.
 *
 * Sorular MONDAI sırasına göre dizilir (gerçek sınavda da öyledir); yalnızca
 * ŞIKLAR karıştırılır. Soru sırasını karıştırmak sınav hissini bozardı çünkü
 * gerçek sınavda kolaydan zora bir düzen vardır.
 */
export function buildMock(): MockSectionPlan[] {
  const karistir = (q: MockQ): MockQ => {
    const dogru = q.options[q.answer]
    const yeni = shuffle(q.options)
    return { ...q, options: yeni, answer: yeni.indexOf(dogru) }
  }

  const sirala = (a: MockQ, b: MockQ) => MONDAI[a.mondai].no - MONDAI[b.mondai].no

  return (Object.keys(SECTIONS) as SectionId[]).map((s) => ({
    section: s,
    minutes: SECTIONS[s].minutes,
    questions: BANK.filter((q) => MONDAI[q.mondai].section === s)
      .sort(sirala)
      .map(karistir),
  }))
}

// ————————————————————————— Puanlama —————————————————————————

export interface MockResult {
  /** Ham doğru sayısı */
  correct: number
  total: number
  /** 0-120 ölçeğine çevrilmiş puan */
  scaled: number
  /** Bölüm barajı (38) geçildi mi */
  sectionPass: boolean
  /** Toplam baraj tahmini — dinleme olmadan kesin söylenemez */
  verdict: { title: string; text: string; tone: 'ok' | 'warn' | 'bad' }
  byMondai: { mondai: MondaiId; correct: number; total: number }[]
}

/**
 * Puanı 120'lik ölçeğe çevirir.
 *
 * Gerçek JLPT "ölçekli puan" kullanır: ham doğru sayısı doğrudan puana
 * çevrilmez, soru zorluğuna göre istatistiksel bir dönüşüm uygulanır. Onu
 * taklit etmek mümkün değil — burada düz orantı kullanılıyor ve bu durum
 * kullanıcıya söyleniyor. Amaç kesin puan kestirmek değil, hazır olup
 * olmadığını görmek.
 */
export function scoreMock(answers: Map<string, number>, questions: MockQ[]): MockResult {
  const correct = questions.filter((q) => answers.get(q.id) === q.answer).length
  const total = questions.length
  const scaled = Math.round((correct / Math.max(1, total)) * 120)
  const sectionPass = scaled >= 38

  const mondailer = [...new Set(questions.map((q) => q.mondai))]
  const byMondai = mondailer.map((m) => {
    const qs = questions.filter((q) => q.mondai === m)
    return { mondai: m, correct: qs.filter((q) => answers.get(q.id) === q.answer).length, total: qs.length }
  })

  let verdict: MockResult['verdict']
  if (scaled >= 90) {
    verdict = {
      title: 'Bu bölüm hazır',
      text: 'Okuma ve dilbilgisi tarafında sınavı rahat geçecek düzeydesin. Kalan riski dinleme oluşturuyor — onu ayrıca çalışman gerekiyor.',
      tone: 'ok',
    }
  } else if (scaled >= 60) {
    verdict = {
      title: 'Baraj güvende, ama pay az',
      text: 'Bölüm barajını (38) rahat geçiyorsun. Toplam 80 puanı tutturmak için dinlemeden de puan gerekiyor; eksik konuları kapat.',
      tone: 'ok',
    }
  } else if (scaled >= 38) {
    verdict = {
      title: 'Barajın hemen üstü',
      text: 'Bölüm barajını geçiyorsun ama ancak. Bu seviyeyle toplam 80’i tutturmak zor — aşağıdaki zayıf bölümlere çalış.',
      tone: 'warn',
    }
  } else {
    verdict = {
      title: 'Bölüm barajının altında',
      text: 'Bu haliyle toplam puan yetse bile sınavdan kalınır: bu bölümün kendi barajı 38’dir. Önce dilbilgisi ve kelime temelini tamamla.',
      tone: 'bad',
    }
  }

  return { correct, total, scaled, sectionPass, verdict, byMondai }
}
