import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u4: Unit = {
  id: 'u4',
  no: 4,
  title: 'Alışveriş ve sayılar',
  subtitle: 'いくら · 〜円 · ください · sayaçlar',
  minutes: 50,
  canDo: [
    'Fiyat sorabilmek ve anlayabilmek',
    'Bir şey isteyebilmek: 〜をください',
    'Kaç tane olduğunu söyleyebilmek',
    'Büyük sayıları duyunca çözebilmek',
  ],
  lessonIds: ['ja-g2', 'ja-g3'],

  grammar: [
    {
      title: 'いくらですか — “kaç para?”',
      pattern: 'A は いくら ですか',
      explain: 'Fiyat sormanın tek kalıbı. Cevapta sayı + 円 gelir.',
      examples: [
        { ja: 'これはいくらですか。', kana: 'これはいくらですか。', tr: 'Bu kaç para?' },
        { ja: '八百円です。', kana: 'はっぴゃくえんです。', tr: 'Sekiz yüz yen.' },
      ],
    },
    {
      title: '〜をください — “… verir misiniz”',
      pattern: 'A を ください',
      explain:
        'Bir şey istemenin kibar ve en kullanışlı yolu. Sayaçla birlikte de kullanılır: コーヒーを二つください.',
      examples: [
        { ja: 'これをください。', kana: 'これをください。', tr: 'Bunu alayım.' },
        { ja: 'コーヒーを二つください。', kana: 'こーひーをふたつください。', tr: 'İki kahve lütfen.' },
      ],
      pitfall: 'Sayı を ile ください arasına girer, ayrı bir ek almaz.',
    },
    {
      title: 'Sayaçlar — sayı + sayaç',
      pattern: '〜つ / 〜枚 / 〜本 / 〜人',
      explain:
        'Japoncada sayı, sayılan şeye göre biçim değiştirir. つ genel nesne (1–10), 枚 ince şeyler, 本 uzun şeyler, 人 kişi içindir.',
      examples: [
        { ja: 'りんごを三つください。', kana: 'りんごをみっつください。', tr: 'Üç elma lütfen.' },
        { ja: '切手を五枚ください。', kana: 'きってをごまいください。', tr: 'Beş pul lütfen.' },
      ],
      pitfall: '1, 3, 6, 8, 10 ile çoğu sayaçta ses değişir: 一本 いっぽん, 三本 さんぼん.',
      ref: 'ja-counters',
    },
    {
      title: 'Büyük sayılar',
      pattern: '百 · 千 · 万',
      explain:
        '100 ひゃく, 1.000 せん, 10.000 まん. Japoncada sayılar dörtlü gruplanır: 10.000 “on bin” değil, kendi başına bir birimdir (一万).',
      examples: [
        { ja: '三百円です。', kana: 'さんびゃくえんです。', tr: 'Üç yüz yen.' },
        { ja: '一万円です。', kana: 'いちまんえんです。', tr: 'On bin yen.' },
      ],
      pitfall: '300 さんびゃく, 600 ろっぴゃく, 800 はっぴゃく — üçü de ses değiştirir.',
    },
  ],

  rules: [
    {
      title: 'Fiyatı duymak, söylemekten zor',
      body:
        'N5 dinlemesinde fiyat soruları sık çıkar ve zorluk ses değişimlerindedir: さんびゃく, ろっぴゃく, はっぴゃく, さんぜん, はっせん. Bunları listeden okumak yetmez; sesli tekrar etmen gerekir.',
    },
    {
      title: 'ください ile お願いします farkı',
      body:
        '〜をください somut bir şey isterken kullanılır (bir nesne, bir porsiyon). お願いします ise daha geneldir ve hizmet isterken de kullanılır. Yeni başlayan biri için ください yeterlidir.',
    },
  ],

  vocab: [
    { ja: 'いくら', kana: 'いくら', tr: 'kaç para' },
    { ja: '円', kana: 'えん', tr: 'yen' },
    { ja: 'ください', kana: 'ください', tr: 'lütfen verin' },
    { ja: '高い', kana: 'たかい', tr: 'pahalı, yüksek' },
    { ja: '安い', kana: 'やすい', tr: 'ucuz' },
    { ja: 'お店', kana: 'おみせ', tr: 'dükkân' },
    { ja: 'コーヒー', kana: 'コーヒー', tr: 'kahve' },
    { ja: 'パン', kana: 'パン', tr: 'ekmek' },
    { ja: 'りんご', kana: 'りんご', tr: 'elma' },
    { ja: '切手', kana: 'きって', tr: 'pul' },
    { ja: 'ぜんぶで', kana: 'ぜんぶで', tr: 'hepsi birden' },
    { ja: '一つ', kana: 'ひとつ', tr: 'bir tane' },
    { ja: '二つ', kana: 'ふたつ', tr: 'iki tane' },
    { ja: '三つ', kana: 'みっつ', tr: 'üç tane' },
    { ja: '百', kana: 'ひゃく', tr: 'yüz' },
    { ja: '千', kana: 'せん', tr: 'bin' },
    { ja: '一万', kana: 'いちまん', tr: 'on bin' },
    { ja: 'じゃあ', kana: 'じゃあ', tr: 'o zaman, peki' },
  ],

  text: {
    title: 'お店で — Dükkânda',
    intro: 'Efe bir dükkânda alışveriş yapıyor. Fiyatlardaki ses değişimlerine dikkat et.',
    lines: [
      { ja: 'エフェ：すみません、これはいくらですか。', kana: 'えふぇ：すみません、これはいくらですか。', tr: 'Efe: Affedersiniz, bu kaç para?' },
      { ja: '店の人：それは三百円です。', kana: 'みせのひと：それはさんびゃくえんです。', tr: 'Satıcı: O üç yüz yen.' },
      { ja: 'エフェ：あのパンもください。', kana: 'えふぇ：あのぱんもください。', tr: 'Efe: Şu ekmeği de alayım.' },
      { ja: '店の人：パンは百五十円です。', kana: 'みせのひと：ぱんはひゃくごじゅうえんです。', tr: 'Satıcı: Ekmek yüz elli yen.' },
      { ja: 'エフェ：じゃあ、パンを二つください。', kana: 'えふぇ：じゃあ、ぱんをふたつください。', tr: 'Efe: O zaman iki ekmek lütfen.' },
      { ja: '店の人：ぜんぶで六百円です。', kana: 'みせのひと：ぜんぶでろっぴゃくえんです。', tr: 'Satıcı: Hepsi altı yüz yen.' },
      { ja: 'エフェ：高くないですね。ありがとうございます。', kana: 'えふぇ：たかくないですね。ありがとうございます。', tr: 'Efe: Pahalı değilmiş. Teşekkürler.' },
    ],
    questions: [
      mcq('u4-t1', 'İlk ürün kaç para?', ['150 yen', '300 yen', '600 yen', '800 yen'], 1, '三百円 = さんびゃくえん'),
      mcq('u4-t2', 'Efe kaç ekmek aldı?', ['1', '2', '3', '5'], 1, 'パンを二つください。'),
      mcq('u4-t3', 'Toplam ne kadar?', ['450 yen', '600 yen', '750 yen', '1000 yen'], 1, 'ぜんぶで六百円 = ろっぴゃくえん'),
    ],
  },

  homework: [
    {
      id: 'u4-h1',
      title: 'Fiyatları sesli oku',
      detail:
        'Şu fiyatları sesli söyle: 100, 300, 600, 800, 1.000, 3.000, 8.000, 10.000 yen. Ses değişenlerde (300, 600, 800, 3.000, 8.000) yavaşla.',
      minutes: 8,
    },
    {
      id: 'u4-h2',
      title: 'Kendi alışveriş diyaloğun',
      detail:
        'Altı satırlık bir dükkân diyaloğu yaz. İçinde いくらですか, 〜をください ve bir sayaç (つ ya da 枚) geçsin.',
      minutes: 12,
    },
    {
      id: 'u4-h3',
      title: 'Evdeki eşyaları say',
      detail:
        'Odandaki eşyaları Japonca sayarak söyle: 「ペンが三本あります」 gibi. En az üç farklı sayaç kullan.',
      minutes: 8,
    },
  ],

  test: [
    mcq('u4-q1', '「いくらですか」 ne sorar?', ['Kaç tane?', 'Kaç para?', 'Nerede?', 'Ne zaman?'], 1),
    mcq('u4-q2', '「三百円」 nasıl okunur?', ['さんひゃくえん', 'さんびゃくえん', 'さんぴゃくえん', 'みひゃくえん'], 1, '百 önünde さん → びゃく.'),
    mcq('u4-q3', '「六百」 nasıl okunur?', ['ろくひゃく', 'ろっぴゃく', 'ろくびゃく', 'ろっひゃく'], 1),
    mcq('u4-q4', '“İki kahve lütfen” nasıl denir?', ['コーヒーを二つください。', 'コーヒーは二つです。', '二つコーヒーがください。', 'コーヒーに二つください。'], 0),
    mcq('u4-q5', 'Pul saymak için hangi sayaç?', ['〜本', '〜枚', '〜人', '〜つ'], 1, 'İnce ve düz şeyler 枚 ile sayılır.'),
    fill('u4-q6', 'これ ___ ください。', ['を'], 'Bunu verir misiniz.', undefined, 'İstenen şey nesnedir, を alır.'),
    fill('u4-q7', 'パンは百五十円 ___ 。', ['です'], 'Ekmek yüz elli yen.'),
    order('u4-q8', ['この', 'かばん', 'は', 'いくら', 'ですか'], 'Bu çanta kaç para?'),
    translate('u4-q9', 'ぜんぶで八百円です。', ['hepsi sekiz yüz yen', 'toplam sekiz yüz yen'], 'to-tr', 'ぜんぶではっぴゃくえんです。'),
    dict('u4-q10', 'これはいくらですか。', ['これはいくらですか', 'kore wa ikura desu ka', 'korewaikuradesuka'], 'Bu kaç para?'),
  ],
}
