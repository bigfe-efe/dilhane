import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u5: Unit = {
  id: 'u5',
  no: 5,
  title: 'Nerede ne var',
  subtitle: 'あります・います · konum kelimeleri · に / で',
  minutes: 50,
  canDo: [
    'Bir şeyin nerede olduğunu söyleyebilmek',
    'Canlı ve cansız ayrımını yapabilmek: います / あります',
    'Yol tarifi anlayabilmek',
    'に ile で arasındaki farkı bilmek',
  ],
  lessonIds: ['ja-g4'],

  grammar: [
    {
      title: 'あります / います — “var”',
      star: true,
      pattern: 'A に B が あります／います',
      explain:
        'İkisi de “var” demektir ama あります cansız şeyler için, います canlılar (insan, hayvan) içindir. Bitki ve eşya あります alır.',
      examples: [
        { ja: 'つくえの上に本があります。', kana: 'つくえのうえにほんがあります。', tr: 'Masanın üstünde kitap var.' },
        { ja: '教室に先生がいます。', kana: 'きょうしつにせんせいがいます。', tr: 'Sınıfta öğretmen var.' },
      ],
      pitfall: 'Araba, telefon gibi hareket eden ama cansız şeyler yine あります alır.',
      ref: 'ja-arimasu-imasu',
    },
    {
      title: 'Konum kelimeleri',
      pattern: 'A の 上/下/中/前/後ろ/となり',
      explain:
        'Konum kelimesi の ile isme bağlanır. Sıra Türkçenin tersidir: 学校の前 = okulun önü.',
      examples: [
        { ja: 'かばんの中にさいふがあります。', kana: 'かばんのなかにさいふがあります。', tr: 'Çantanın içinde cüzdan var.' },
        { ja: '駅の前に店があります。', kana: 'えきのまえにみせがあります。', tr: 'İstasyonun önünde dükkân var.' },
      ],
      ref: 'ja-arimasu-imasu',
    },
    {
      title: 'に ile で farkı',
      star: true,
      pattern: 'A に います / A で 〜ます',
      explain:
        'に varlığın bulunduğu yeri gösterir, で ise eylemin geçtiği yeri. “Evdeyim” に, “evde çalışıyorum” で alır.',
      examples: [
        { ja: '家にいます。', kana: 'いえにいます。', tr: 'Evdeyim.' },
        { ja: '家で日本語をべんきょうします。', kana: 'いえでにほんごをべんきょうします。', tr: 'Evde Japonca çalışırım.' },
      ],
      pitfall: 'N5’te en sık karıştırılan ikili budur: varlık に, eylem で.',
      ref: 'ja-de',
    },
    {
      title: 'どこ — “nerede”',
      pattern: 'A は どこ ですか',
      explain: 'Yer sormanın kalıbı. Cevapta ここ / そこ / あそこ ya da bir yer adı gelir.',
      examples: [
        { ja: 'トイレはどこですか。', kana: 'といれはどこですか。', tr: 'Tuvalet nerede?' },
        { ja: 'あそこです。', kana: 'あそこです。', tr: 'Şurada.' },
      ],
      ref: 'ja-kore-sore-are',
    },
  ],

  rules: [
    {
      title: 'は ile が nerede kullanılır',
      star: true,
      body:
        'Varlık cümlelerinde YENİ bilgi が alır: 「つくえの上に本があります」. Ama konuyu zaten biliyorsak は kullanılır: 「本はつくえの上にあります」 — “kitap (hani o kitap) masanın üstünde”. İkisi de doğru, vurgu farklı.',
    },
  ],

  vocab: [
    { star: true, ja: '上', kana: 'うえ', tr: 'üst' },
    { ja: '下', kana: 'した', tr: 'alt' },
    { star: true, ja: '中', kana: 'なか', tr: 'iç' },
    { ja: '前', kana: 'まえ', tr: 'ön' },
    { ja: '後ろ', kana: 'うしろ', tr: 'arka' },
    { star: true, ja: 'となり', kana: 'となり', tr: 'yan (bitişik)' },
    { ja: '近く', kana: 'ちかく', tr: 'yakın' },
    { ja: 'ここ', kana: 'ここ', tr: 'burası' },
    { ja: 'そこ', kana: 'そこ', tr: 'şurası' },
    { ja: 'あそこ', kana: 'あそこ', tr: 'orası' },
    { star: true, ja: 'どこ', kana: 'どこ', tr: 'neresi' },
    { star: true, ja: '家', kana: 'いえ', tr: 'ev' },
    { ja: '教室', kana: 'きょうしつ', tr: 'sınıf' },
    { ja: '駅', kana: 'えき', tr: 'istasyon' },
    { ja: '銀行', kana: 'ぎんこう', tr: 'banka' },
    { ja: '病院', kana: 'びょういん', tr: 'hastane', note: 'びよういん (kuaför) ile karıştırma.' },
    { ja: 'トイレ', kana: 'トイレ', tr: 'tuvalet' },
    { ja: 'さいふ', kana: 'さいふ', tr: 'cüzdan' },
  ],

  text: {
    title: '駅の近く — İstasyonun yakını',
    intro: 'Efe yolunu soruyor. Konum kelimelerine ve に / で ayrımına dikkat et.',
    lines: [
      { ja: 'エフェ：すみません、銀行はどこですか。', kana: 'えふぇ：すみません、ぎんこうはどこですか。', tr: 'Efe: Affedersiniz, banka nerede?' },
      { ja: '女の人：駅の前にあります。', kana: 'おんなのひと：えきのまえにあります。', tr: 'Kadın: İstasyonun önünde.' },
      { ja: 'エフェ：病院もその近くですか。', kana: 'えふぇ：びょういんもそのちかくですか。', tr: 'Efe: Hastane de oranın yakınında mı?' },
      { ja: '女の人：はい。銀行のとなりです。', kana: 'おんなのひと：はい。ぎんこうのとなりです。', tr: 'Kadın: Evet. Bankanın yanında.' },
      { ja: 'エフェ：あそこに人がたくさんいますね。', kana: 'えふぇ：あそこにひとがたくさんいますね。', tr: 'Efe: Orada çok insan var, değil mi?' },
      { ja: '女の人：あれは店です。中にカフェもあります。', kana: 'おんなのひと：あれはみせです。なかにかふぇもあります。', tr: 'Kadın: O bir mağaza. İçinde kafe de var.' },
      { ja: 'エフェ：ありがとうございます。', kana: 'えふぇ：ありがとうございます。', tr: 'Efe: Teşekkür ederim.' },
    ],
    questions: [
      mcq('u5-t1', 'Banka nerede?', ['İstasyonun arkasında', 'İstasyonun önünde', 'Hastanenin içinde', 'Mağazanın yanında'], 1, '駅の前にあります。'),
      mcq('u5-t2', 'Hastane nerede?', ['Bankanın yanında', 'İstasyonun içinde', 'Mağazanın arkasında', 'Uzakta'], 0, '銀行のとなりです。'),
      mcq('u5-t3', 'Neden 「人がたくさんいます」 deniyor, あります değil?', ['Yanlış kullanım', 'İnsan canlı olduğu için', 'Çok olduğu için', 'Uzak olduğu için'], 1),
    ],
  },

  homework: [
    {
      id: 'u5-h1',
      title: 'Odanı anlat',
      detail:
        'Odandaki altı eşyanın yerini yaz: 「つくえの上に〜があります」. En az birinde となり, birinde 中 kullan.',
      minutes: 12,
      star: true,
      steps: [
        'Odandan altı eşya seç ve her birinin nerede olduğunu belirle.',
        'Kalıp: yer + の + konum + に + eşya + が + あります.',
        'Canlı bir varlık (kedi, insan) varsa あります değil います kullan.',
        'Bir cümlede となり, bir cümlede 中 geçsin.',
        'Bitince cümleleri oku ve her birinde が mı は mı gerektiğini kendine sor.',
      ],
      example: [
        { ja: 'つくえの上に本があります。', kana: 'つくえのうえにほんがあります。', tr: 'Masanın üstünde kitap var.' },
        { ja: 'かばんの中にさいふがあります。', kana: 'かばんのなかにさいふがあります。', tr: 'Çantanın içinde cüzdan var.' },
        { ja: '教室に先生がいます。', kana: 'きょうしつにせんせいがいます。', tr: 'Sınıfta öğretmen var.' },
      ],
      tips: [
        'Konum kelimesi の’dan SONRA gelir: つくえの上 = masanın üstü.',
        'あります cansız, います canlı içindir. Bitki cansız sayılır.',
        'Yeni bilgi が ile gelir; konu olarak öne çekilen şey は alır.',
      ],
    },
    {
      id: 'u5-h2',
      title: 'に mi で mi',
      detail:
        'Şu cümleleri tamamla ve neden o eki seçtiğini yanına yaz: 家（　）います / 家（　）本を読みます / 学校（　）友だちがいます / 教室（　）べんきょうします.',
      minutes: 8,
      star: true,
      steps: [
        'Dört cümleyi kâğıda geçir, parantezleri boş bırak.',
        'Cümlede bir eylem var mı diye bak: okuyor, çalışıyor, yiyor → で.',
        'Yalnızca varlık bildiriyorsa (います, あります) に kullan.',
        'Her cümlenin yanına tek kelimeyle sebebini yaz: “varlık” ya da “eylem”.',
      ],
      example: [
        { ja: '家にいます。', kana: 'うちにいます。', tr: 'Evdeyim. Yalnızca varlık bildiriyor → に' },
        { ja: '家で日本語をべんきょうします。', kana: 'うちでにほんごをべんきょうします。', tr: 'Evde Japonca çalışırım. Eylem var → で' },
      ],
      tips: [
        'Kısa kural: VARLIK に, EYLEM で.',
        'Aynı yer iki eki de alabilir; belirleyen şey fiildir.',
      ],
    },
    {
      id: 'u5-h3',
      title: 'Yol tarifi',
      detail: 'Evinden en yakın markete giden yolu Japonca dört cümleyle anlat. Konum kelimelerini kullan.',
      minutes: 10,
      steps: [
        'Evinden markete giden yolu düşün: hangi binaların yanından geçiyorsun.',
        'Her cümlede bir konum kelimesi kullan: 前, となり, 近く.',
        'Bir soruyla başla: 〜はどこですか。 sonra cevabı yaz.',
        'Son cümleyi ありがとうございます ile kapat.',
      ],
      example: [
        { ja: 'すみません、銀行はどこですか。', kana: 'すみません、ぎんこうはどこですか。', tr: 'Affedersiniz, banka nerede?' },
        { ja: '駅の前にあります。', kana: 'えきのまえにあります。', tr: 'İstasyonun önünde.' },
        { ja: '病院は銀行のとなりです。', kana: 'びょういんはぎんこうのとなりです。', tr: 'Hastane bankanın yanında.' },
      ],
      tips: [
        'Yer sorarken は kullanılır: トイレはどこですか。',
        'Cevapta konu zaten bilindiği için あそこです demek yeterli.',
      ],
    },
  ],

  test: [
    mcq('u5-q1', '「つくえの上に本が___」', ['います', 'あります', 'です', 'します'], 1, 'Kitap cansız → あります.'),
    mcq('u5-q2', '「教室に先生が___」', ['あります', 'います', 'です', 'ません'], 1, 'Öğretmen canlı → います.'),
    mcq('u5-q3', '“Okulun önü” nasıl denir?', ['前の学校', '学校の前', '学校は前', '前は学校'], 1),
    mcq('u5-q4', 'Hangisi doğru? “Evde çalışıyorum”', ['家にべんきょうします。', '家でべんきょうします。', '家がべんきょうします。', '家をべんきょうします。'], 1, 'Eylemin yeri で.'),
    mcq('u5-q5', 'Hangisi doğru? “Evdeyim”', ['家でいます。', '家にいます。', '家がいます。', '家をいます。'], 1, 'Varlığın yeri に.'),
    fill('u5-q6', 'かばんの中 ___ さいふがあります。', ['に'], 'Çantanın içinde cüzdan var.'),
    fill('u5-q7', '駅の前 ___ 店があります。', ['に'], 'İstasyonun önünde dükkân var.'),
    order('u5-q8', ['銀行', 'は', 'どこ', 'ですか'], 'Banka nerede?'),
    translate('u5-q9', '病院は銀行のとなりです。', ['hastane bankanın yanında', 'hastane bankanın yanındadır'], 'to-tr', 'びょういんはぎんこうのとなりです。'),
    dict('u5-q10', 'トイレはどこですか。', ['トイレはどこですか', 'といれはどこですか', 'toire wa doko desu ka'], 'Tuvalet nerede?'),
  ],
}
