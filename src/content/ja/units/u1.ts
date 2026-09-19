import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u1: Unit = {
  id: 'u1',
  no: 1,
  title: 'Kendimi tanıtmak',
  subtitle: 'AはBです · の · か · じゃないです',
  minutes: 45,
  canDo: [
    'Adını, ülkeni ve mesleğini söyleyebilmek',
    'Karşındakine kim olduğunu sorabilmek',
    '“… değilim” diyebilmek',
    'Bir başkasını tanıtabilmek',
  ],
  lessonIds: ['ja-g0', 'ja-g1'],

  grammar: [
    {
      title: 'AはBです — “A, B’dir”',
      pattern: 'A は B です',
      explain:
        'Japoncanın ilk ve en önemli kalıbı. は konuyu işaretler, です cümleyi kibar biçimde bitirir. Türkçedeki “-dir” gibi düşünebilirsin: yüklem sonda.',
      examples: [
        { ja: '私は学生です。', kana: 'わたしはがくせいです。', tr: 'Ben öğrenciyim.' },
        { ja: '田中さんは先生です。', kana: 'たなかさんはせんせいです。', tr: 'Tanaka öğretmendir.' },
      ],
      pitfall: 'は burada “ha” değil “wa” okunur.',
      ref: 'ja-wa-desu',
    },
    {
      title: 'じゃないです — olumsuz',
      pattern: 'A は B じゃないです',
      explain:
        'です’nin olumsuzu. Daha resmî hâli ではありません’dir ama konuşmada じゃないです yaygındır.',
      examples: [
        { ja: '私は先生じゃないです。', kana: 'わたしはせんせいじゃないです。', tr: 'Ben öğretmen değilim.' },
        { ja: 'あの人は日本人じゃないです。', kana: 'あのひとはにほんじんじゃないです。', tr: 'O kişi Japon değil.' },
      ],
      pitfall: 'じゃ, や değil: じ + küçük ゃ.',
      ref: 'ja-wa-desu',
    },
    {
      title: 'か — soru eki',
      pattern: 'A は B ですか。',
      explain:
        'Cümlenin sonuna か gelince soru olur. Soru işareti kullanılmaz, sonda yine 。 vardır. Ses tonunu yükseltmene de gerek yok.',
      examples: [
        { ja: '学生ですか。', kana: 'がくせいですか。', tr: 'Öğrenci misiniz?' },
        { ja: 'お名前は何ですか。', kana: 'おなまえはなんですか。', tr: 'Adınız ne?' },
      ],
      ref: 'ja-ka',
    },
    {
      title: 'の — tamlama',
      pattern: 'A の B',
      explain:
        'İki ismi bağlar: “A’nın B’si”. Türkçedeki tamlamanın tersi sırada değil, aynı sırada: 日本語の先生 = Japonca öğretmeni.',
      examples: [
        { ja: '私の名前はエフェです。', kana: 'わたしのなまえはえふぇです。', tr: 'Benim adım Efe.' },
        { ja: '日本語の学生です。', kana: 'にほんごのがくせいです。', tr: 'Japonca öğrencisiyim.' },
      ],
      ref: 'ja-no',
    },
    {
      title: 'も — “de, da”',
      pattern: 'A も B です',
      explain: 'は yerine geçer, ikisi birlikte kullanılmaz. “Ben de öğrenciyim” demek için は’yı atıp も koyarsın.',
      examples: [
        { ja: '私も学生です。', kana: 'わたしもがくせいです。', tr: 'Ben de öğrenciyim.' },
      ],
      pitfall: '「私はも」 yanlıştır.',
      ref: 'ja-mo',
    },
  ],

  rules: [
    {
      title: 'さん kendine kullanılmaz',
      body:
        'İsimden sonra さん gelir: 田中さん. Ama kendinden bahsederken asla 私さん demezsin. Unvan verirken de kullanılmaz: 田中先生 der, 田中さん先生 demezsin.',
    },
    {
      title: 'Özne çoğu zaman söylenmez',
      body:
        'Bağlamdan anlaşılıyorsa 私は düşer. 「学生です」 tek başına “öğrenciyim” demektir. Her cümleye 私は koymak Japonca kulağa fazla ısrarlı gelir.',
    },
  ],

  vocab: [
    { ja: '私', kana: 'わたし', tr: 'ben' },
    { ja: '名前', kana: 'なまえ', tr: 'isim, ad' },
    { ja: '学生', kana: 'がくせい', tr: 'öğrenci' },
    { ja: '先生', kana: 'せんせい', tr: 'öğretmen', note: 'Doktor, avukat gibi uzmanlara da denir.' },
    { ja: '大学', kana: 'だいがく', tr: 'üniversite' },
    { ja: '日本人', kana: 'にほんじん', tr: 'Japon' },
    { ja: 'トルコ人', kana: 'とるこじん', tr: 'Türk' },
    { ja: '日本語', kana: 'にほんご', tr: 'Japonca' },
    { ja: '友だち', kana: 'ともだち', tr: 'arkadaş' },
    { ja: '人', kana: 'ひと', tr: 'kişi, insan' },
    { ja: '何', kana: 'なに / なん', tr: 'ne', note: 'です ve sayaç önünde なん: 何ですか.' },
    { ja: 'はじめまして', kana: 'はじめまして', tr: 'Memnun oldum', note: 'Yalnızca ilk tanışmada.' },
    { ja: 'よろしくおねがいします', kana: 'よろしくおねがいします', tr: 'Tanıştığımıza memnun oldum / rica ederim' },
    { ja: 'そうです', kana: 'そうです', tr: 'Evet, öyle' },
    { ja: 'ちがいます', kana: 'ちがいます', tr: 'Hayır, değil / yanlış' },
    { ja: 'あの人', kana: 'あのひと', tr: 'o kişi' },
  ],

  text: {
    title: '自己しょうかい — Kendini tanıtma',
    intro: 'Efe kendini yeni tanıştığı birine anlatıyor. Kalıpların hepsi bu ünitedekiler.',
    lines: [
      { ja: 'はじめまして。', kana: 'はじめまして。', tr: 'Memnun oldum.' },
      { ja: '私の名前はエフェです。', kana: 'わたしのなまえはえふぇです。', tr: 'Benim adım Efe.' },
      { ja: 'トルコ人です。', kana: 'とるこじんです。', tr: 'Türk’üm.' },
      { ja: '大学の学生です。', kana: 'だいがくのがくせいです。', tr: 'Üniversite öğrencisiyim.' },
      { ja: '日本語の学生です。', kana: 'にほんごのがくせいです。', tr: 'Japonca öğrencisiyim.' },
      { ja: '先生じゃないです。', kana: 'せんせいじゃないです。', tr: 'Öğretmen değilim.' },
      { ja: '友だちの田中さんは日本人です。', kana: 'ともだちのたなかさんはにほんじんです。', tr: 'Arkadaşım Tanaka Japon.' },
      { ja: '田中さんも学生です。', kana: 'たなかさんもがくせいです。', tr: 'Tanaka da öğrenci.' },
      { ja: 'よろしくおねがいします。', kana: 'よろしくおねがいします。', tr: 'Tanıştığımıza memnun oldum.' },
    ],
    questions: [
      mcq('u1-t1', 'Efe’nin mesleği ne?', ['öğretmen', 'öğrenci', 'doktor', 'söylenmiyor'], 1, '大学の学生です。'),
      mcq('u1-t2', 'Tanaka hangi ülkeden?', ['Türkiye', 'Japonya', 'Çin', 'söylenmiyor'], 1, '田中さんは日本人です。'),
      mcq(
        'u1-t3',
        '「田中さんも学生です」 cümlesindeki も ne anlama geliyor?',
        ['Tanaka öğrenci değil', 'Tanaka DA öğrenci', 'Tanaka öğretmen', 'Tanaka öğrenci mi?'],
        1,
        'も “de, da” demektir ve は’nın yerine geçer.',
      ),
    ],
  },

  homework: [
    {
      id: 'u1-h1',
      title: 'Kendi tanıtımını yaz',
      detail:
        'Metindeki kalıpları kullanarak kendi tanıtımını beş cümle hâlinde kâğıda yaz. Adın, ülken, mesleğin, ne öğrendiğin ve bir de “… değilim” cümlesi olsun.',
      minutes: 10,
    },
    {
      id: 'u1-h2',
      title: 'Sesli söyle',
      detail: 'Yazdığın tanıtımı kâğıda bakmadan sesli söyle. Takıldığın yeri işaretle, o kalıbı tekrar oku.',
      minutes: 5,
    },
    {
      id: 'u1-h3',
      title: 'Üç kişi tanıt',
      detail:
        'Tanıdığın üç kişiyi Japonca tanıt: 「〜さんは〜です」. En az birinde も, birinde de じゃないです kullan.',
      minutes: 10,
    },
  ],

  test: [
    mcq('u1-q1', 'Boşluğa ne gelir? 「私 ___ 学生です。」', ['が', 'は', 'を', 'の'], 1, 'Konuyu は işaretler.'),
    mcq(
      'u1-q2',
      '“Ben öğretmen değilim” nasıl denir?',
      ['私は先生です。', '私は先生じゃないです。', '私は先生ですか。', '私も先生です。'],
      1,
    ),
    mcq(
      'u1-q3',
      '「お名前は何ですか」 ne demek?',
      ['Adın ne?', 'Nerelisin?', 'Öğrenci misin?', 'Kaç yaşındasın?'],
      0,
    ),
    mcq(
      'u1-q4',
      '“Japonca öğretmeni” nasıl yazılır?',
      ['先生の日本語', '日本語の先生', '日本語は先生', '先生は日本語'],
      1,
      'AのB = A’nın B’si. Belirleyen önce gelir.',
    ),
    fill('u1-q5', '私 ___ 学生です。（Ben DE öğrenciyim）', ['も'], 'Ben de öğrenciyim.', 'は değil', 'も, は’nın yerine geçer.'),
    fill('u1-q6', '田中さん ___ 日本人ですか。', ['は'], 'Tanaka Japon mu?', undefined, 'Soru cümlesinde de konu eki は’dır; soru ekini sona koyarsın.'),
    order('u1-q7', ['私', 'は', 'トルコ人', 'です'], 'Ben Türk’üm.'),
    order('u1-q8', ['あの人', 'は', '先生', 'じゃないです'], 'O kişi öğretmen değil.'),
    translate('u1-q9', '私の友だちは学生です。', ['arkadaşım öğrenci', 'benim arkadaşım öğrenci', 'arkadaşım öğrencidir'], 'to-tr', 'わたしのともだちはがくせいです。'),
    dict('u1-q10', 'はじめまして。', ['はじめまして', 'hajimemashite'], 'Memnun oldum.'),
  ],
}
