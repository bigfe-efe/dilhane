import { fill, mcq, order, translate, type Unit } from './types'

export const u2: Unit = {
  id: 'u2',
  no: 2,
  title: 'Bu ne? — Eşyalar ve sahiplik',
  subtitle: 'これ・それ・あれ · この・その・あの · だれの',
  minutes: 45,
  canDo: [
    'Bir eşyanın ne olduğunu sorabilmek ve söyleyebilmek',
    'Yakın, uzak ve karşıdakine yakın şeyleri ayırt edebilmek',
    'Bir şeyin kime ait olduğunu sorabilmek',
    'Onaylamak ve düzeltmek: そうです / ちがいます',
  ],
  lessonIds: ['ja-g2'],

  grammar: [
    {
      title: 'これ・それ・あれ — “bu, şu, o”',
      pattern: 'これ は 〜 です',
      explain:
        'Üçü de TEK BAŞINA kullanılır, arkasına isim almaz. これ sana yakın, それ karşındakine yakın, あれ ikinize de uzak.',
      examples: [
        { ja: 'これは本です。', kana: 'これはほんです。', tr: 'Bu bir kitap.' },
        { ja: 'それは私のかばんです。', kana: 'それはわたしのかばんです。', tr: 'Şu benim çantam.' },
        { ja: 'あれは何ですか。', kana: 'あれはなんですか。', tr: 'O ne?' },
      ],
      pitfall: '「これ本」 yanlıştır. İsimle birlikte kullanacaksan この lazım.',
      ref: 'ja-kore-sore-are',
    },
    {
      title: 'この・その・あの — “bu … , şu … , o …”',
      pattern: 'この + isim',
      explain:
        'Bunlar isimden ÖNCE gelir ve tek başına kullanılmaz. これ/それ/あれ ile karıştırmamak N5’te sık sorulan bir ayrım.',
      examples: [
        { ja: 'この本は新しいです。', kana: 'このほんはあたらしいです。', tr: 'Bu kitap yeni.' },
        { ja: 'あの人は田中さんです。', kana: 'あのひとはたなかさんです。', tr: 'O kişi Tanaka.' },
      ],
      pitfall: '「この は 本です」 yanlıştır: この tek başına duramaz.',
      ref: 'ja-kore-sore-are',
    },
    {
      title: 'だれの — “kimin”',
      pattern: 'これ は だれ の 〜 ですか',
      explain: 'Sahibi sormak için だれ + の kullanılır. Cevapta da の gelir: 私のです.',
      examples: [
        { ja: 'これはだれのかばんですか。', kana: 'これはだれのかばんですか。', tr: 'Bu kimin çantası?' },
        { ja: '私のです。', kana: 'わたしのです。', tr: 'Benim.' },
      ],
      pitfall: 'Cevapta ismi tekrar etmene gerek yok: 私のかばんです demek yerine 私のです yeter.',
      ref: 'ja-no',
    },
    {
      title: 'そうです / ちがいます — onaylama ve düzeltme',
      pattern: 'はい、そうです。/ いいえ、ちがいます。',
      explain:
        'İsim cümlelerine verilen kısa cevaplar. Fiil cümlelerinde kullanılmaz; orada fiilin kendisi tekrarlanır.',
      examples: [
        { ja: 'はい、そうです。', kana: 'はい、そうです。', tr: 'Evet, öyle.' },
        { ja: 'いいえ、ちがいます。', kana: 'いいえ、ちがいます。', tr: 'Hayır, değil.' },
      ],
    },
  ],

  rules: [
    {
      title: 'こ・そ・あ・ど ailesi',
      body:
        'Japoncada işaret kelimeleri dörtlü bir sistemdir: こ (yakın), そ (karşıdakine yakın), あ (uzak), ど (soru). これ/それ/あれ/どれ, この/その/あの/どの, ここ/そこ/あそこ/どこ. Baş harfi görünce hangi mesafeden bahsedildiğini anlarsın.',
    },
  ],

  vocab: [
    { ja: 'これ', kana: 'これ', tr: 'bu (yakın)' },
    { ja: 'それ', kana: 'それ', tr: 'şu (karşıdakine yakın)' },
    { ja: 'あれ', kana: 'あれ', tr: 'o (uzak)' },
    { ja: 'どれ', kana: 'どれ', tr: 'hangisi' },
    { ja: 'この', kana: 'この', tr: 'bu …', note: 'Arkasına isim gelir.' },
    { ja: '本', kana: 'ほん', tr: 'kitap' },
    { ja: 'かばん', kana: 'かばん', tr: 'çanta' },
    { ja: 'とけい', kana: 'とけい', tr: 'saat (nesne)' },
    { ja: 'かさ', kana: 'かさ', tr: 'şemsiye' },
    { ja: 'くつ', kana: 'くつ', tr: 'ayakkabı' },
    { ja: 'ざっし', kana: 'ざっし', tr: 'dergi' },
    { ja: '新聞', kana: 'しんぶん', tr: 'gazete' },
    { ja: 'えんぴつ', kana: 'えんぴつ', tr: 'kurşun kalem' },
    { ja: 'けいたい', kana: 'けいたい', tr: 'cep telefonu' },
    { ja: 'つくえ', kana: 'つくえ', tr: 'masa, sıra' },
    { ja: 'いす', kana: 'いす', tr: 'sandalye' },
    { ja: 'だれ', kana: 'だれ', tr: 'kim' },
    { ja: 'ちがいます', kana: 'ちがいます', tr: 'değil, yanlış' },
  ],

  text: {
    title: '教室で — Sınıfta',
    intro: 'Efe ile Tanaka sınıfta buldukları eşyalar hakkında konuşuyor.',
    lines: [
      { ja: 'エフェ：これは何ですか。', kana: 'えふぇ：これはなんですか。', tr: 'Efe: Bu ne?' },
      { ja: '田中：それはざっしです。', kana: 'たなか：それはざっしです。', tr: 'Tanaka: Şu bir dergi.' },
      { ja: 'エフェ：日本語のざっしですか。', kana: 'えふぇ：にほんごのざっしですか。', tr: 'Efe: Japonca dergi mi?' },
      { ja: '田中：はい、そうです。', kana: 'たなか：はい、そうです。', tr: 'Tanaka: Evet, öyle.' },
      { ja: 'エフェ：あれはだれのかばんですか。', kana: 'えふぇ：あれはだれのかばんですか。', tr: 'Efe: O kimin çantası?' },
      { ja: '田中：あれは先生のです。', kana: 'たなか：あれはせんせいのです。', tr: 'Tanaka: O öğretmenin.' },
      { ja: 'エフェ：このとけいも先生のですか。', kana: 'えふぇ：このとけいもせんせいのですか。', tr: 'Efe: Bu saat de öğretmenin mi?' },
      { ja: '田中：いいえ、ちがいます。私のです。', kana: 'たなか：いいえ、ちがいます。わたしのです。', tr: 'Tanaka: Hayır, değil. Benim.' },
    ],
    questions: [
      mcq('u2-t1', 'Dergi hangi dilde?', ['Türkçe', 'Japonca', 'İngilizce', 'söylenmiyor'], 1, '日本語のざっしですか → はい、そうです。'),
      mcq('u2-t2', 'Çanta kimin?', ['Efe’nin', 'Tanaka’nın', 'Öğretmenin', 'Kimsenin'], 2, 'あれは先生のです。'),
      mcq('u2-t3', 'Saat kimin?', ['Efe’nin', 'Tanaka’nın', 'Öğretmenin', 'söylenmiyor'], 1, 'いいえ、ちがいます。私のです。'),
    ],
  },

  homework: [
    {
      id: 'u2-h1',
      title: 'Odandaki beş eşya',
      detail:
        'Masandaki ya da odandaki beş eşyayı Japonca yaz: 「これは〜です」. Bilmediğin kelimeye sözlükten bak, listene ekle.',
      minutes: 10,
    },
    {
      id: 'u2-h2',
      title: 'これ mi この mu',
      detail:
        'Yazdığın beş cümleyi bir de この kullanarak yeniden yaz: 「このかばんは私のです」. İkisi arasındaki farkı kendi cümlelerinde gör.',
      minutes: 8,
    },
    {
      id: 'u2-h3',
      title: 'Sahiplik diyaloğu',
      detail: 'Kendi kendine üç soruluk bir diyalog kur: だれの…ですか sorusu ve 〜のです cevabı olsun.',
      minutes: 7,
    },
  ],

  test: [
    mcq('u2-q1', 'Boşluğa ne gelir? 「___ は本です。」（elimdeki şey）', ['この', 'これ', 'あの', 'どの'], 1, 'Tek başına duruyorsa これ.'),
    mcq('u2-q2', 'Boşluğa ne gelir? 「___ 本は新しいです。」', ['これ', 'それ', 'この', 'どれ'], 2, 'İsimden önce geldiği için この.'),
    mcq('u2-q3', '“Bu kimin şemsiyesi?” nasıl denir?', ['これはだれのかさですか。', 'これはかさのだれですか。', 'だれはこれのかさですか。', 'これはだれかさですか。'], 0),
    mcq('u2-q4', '「いいえ、ちがいます」 ne zaman kullanılır?', ['Bir şeyi onaylarken', 'Bir şeyi düzeltirken', 'Teşekkür ederken', 'Vedalaşırken'], 1),
    mcq('u2-q5', 'Karşındakinin elindeki şeyi göstermek için hangisi?', ['これ', 'それ', 'あれ', 'どれ'], 1, 'それ karşıdakine yakın olan için.'),
    fill('u2-q6', 'あれは先生 ___ かばんです。', ['の'], 'O, öğretmenin çantası.', undefined, 'Sahiplik の ile kurulur.'),
    fill('u2-q7', 'これは日本語 ___ 本です。', ['の'], 'Bu, Japonca kitabı.'),
    order('u2-q8', ['これ', 'は', 'だれ', 'の', 'かさ', 'ですか'], 'Bu kimin şemsiyesi?'),
    order('u2-q9', ['その', 'とけい', 'は', '私', 'の', 'です'], 'Şu saat benim.'),
    translate('u2-q10', 'あれは新聞じゃないです。', ['o gazete değil', 'şu gazete değil', 'o gazete değildir'], 'to-tr', 'あれはしんぶんじゃないです。'),
  ],
}
