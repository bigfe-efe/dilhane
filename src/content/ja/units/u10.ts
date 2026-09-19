import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u10: Unit = {
  id: 'u10',
  no: 10,
  title: 'İstekler ve öneriler',
  subtitle: '〜たい · 〜ませんか · 〜ましょう · から',
  minutes: 50,
  canDo: [
    'Ne yapmak istediğini söyleyebilmek',
    'Birine teklif götürebilmek',
    'Birlikte yapmayı önerebilmek',
    'Sebep belirtebilmek',
  ],
  lessonIds: ['ja-g5', 'ja-g6'],

  grammar: [
    {
      title: '〜たいです — “…-mek istiyorum”',
      pattern: 'V-ます kökü + たいです',
      explain:
        'ます düşer, yerine たい gelir. Sonuç bir SIFAT gibi çekilir: たくないです (istemiyorum), たかったです (istemiştim).',
      examples: [
        { ja: '日本へ行きたいです。', kana: 'にほんへいきたいです。', tr: 'Japonya’ya gitmek istiyorum.' },
        { ja: '今日は何も食べたくないです。', kana: 'きょうはなにもたべたくないです。', tr: 'Bugün hiçbir şey yemek istemiyorum.' },
      ],
      pitfall:
        'Yalnızca KENDİ isteğin için kullanılır. Başkası için 〜たがっています gerekir; N5’te buna girmene gerek yok.',
      ref: 'ja-tai',
    },
    {
      title: '〜ませんか — teklif',
      pattern: 'V-ませんか',
      explain:
        'Olumsuz soru biçimindedir ama anlamı tekliftir: “…-mez misin?”. Türkçedeki “Bir kahve içmez misin?” ile birebir aynı mantık.',
      examples: [
        { ja: 'いっしょにコーヒーを飲みませんか。', kana: 'いっしょにこーひーをのみませんか。', tr: 'Birlikte kahve içmez misin?' },
      ],
      ref: 'ja-mashou',
    },
    {
      title: '〜ましょう — “hadi yapalım”',
      pattern: 'V-ましょう',
      explain:
        'Karar verilmiş bir birlikteliği bildirir. ませんか teklif eder, ましょう ise teklifi kabul edip harekete geçirir.',
      examples: [
        { ja: '行きましょう。', kana: 'いきましょう。', tr: 'Hadi gidelim.' },
        { ja: '三時に会いましょう。', kana: 'さんじにあいましょう。', tr: 'Saat üçte buluşalım.' },
      ],
      ref: 'ja-mashou',
    },
    {
      title: '〜から — sebep',
      pattern: 'sebep から、sonuç',
      explain:
        'Sıralama Türkçeyle aynıdır: önce sebep, sonra sonuç. İngilizcedeki because gibi başa gelmez.',
      examples: [
        { ja: '忙しいから、行きません。', kana: 'いそがしいから、いきません。', tr: 'Meşgulüm, bu yüzden gitmiyorum.' },
      ],
      ref: 'ja-kara-reason',
    },
    {
      title: '上手・下手 + が',
      pattern: 'A は B が 上手です',
      explain:
        'Bir işte iyi ya da kötü olmayı anlatır ve 好き gibi が alır. 上手 başkası için kullanılır — kendin için 上手 demek övünmek sayılır.',
      examples: [
        { ja: '田中さんは日本語が上手です。', kana: 'たなかさんはにほんごがじょうずです。', tr: 'Tanaka Japoncada iyidir.' },
        { ja: '私は料理が下手です。', kana: 'わたしはりょうりがへたです。', tr: 'Yemekte kötüyüm.' },
      ],
      pitfall: '上手 じょうず ve 下手 へた düzensiz okunur.',
      ref: 'ja-suki',
    },
  ],

  rules: [
    {
      title: 'ませんか ile ましょう arasındaki fark',
      body:
        'ませんか karşıdakinin kararına bırakır, kibar tekliftir. ましょう ise “hadi” der, ortak kararı varsayar. Tanımadığın biriyle ませんか, arkadaşınla ましょう daha doğaldır.',
    },
    {
      title: 'いっしょに',
      body:
        '“Birlikte” demek olan いっしょに hem ませんか hem ましょう ile sık kullanılır: いっしょに行きませんか.',
    },
  ],

  vocab: [
    { ja: '〜たい', kana: 'たい', tr: '…-mek istemek' },
    { ja: 'いっしょに', kana: 'いっしょに', tr: 'birlikte' },
    { ja: '上手', kana: 'じょうず', tr: 'usta, iyi', note: 'Kendin için kullanılmaz.' },
    { ja: '下手', kana: 'へた', tr: 'beceriksiz' },
    { ja: '料理', kana: 'りょうり', tr: 'yemek (pişirme)' },
    { ja: '音楽', kana: 'おんがく', tr: 'müzik' },
    { ja: 'スポーツ', kana: 'スポーツ', tr: 'spor' },
    { ja: '買い物', kana: 'かいもの', tr: 'alışveriş' },
    { ja: '食事', kana: 'しょくじ', tr: 'yemek (öğün)' },
    { ja: '忙しい', kana: 'いそがしい', tr: 'meşgul' },
    { ja: 'ひま', kana: 'ひま', tr: 'boş (vakti olan)', note: 'な-sıfat' },
    { ja: '何も', kana: 'なにも', tr: 'hiçbir şey', note: 'Olumsuzla kullanılır.' },
    { ja: 'そうですね', kana: 'そうですね', tr: 'Öyle ya, haklısın' },
    { ja: 'いいですね', kana: 'いいですね', tr: 'İyi fikir' },
    { ja: 'ざんねんですが', kana: 'ざんねんですが', tr: 'Maalesef ama…' },
    { ja: 'また今度', kana: 'またこんど', tr: 'Bir dahaki sefere' },
  ],

  text: {
    title: 'いっしょに行きませんか — Birlikte gitmez misin?',
    intro: 'Tanaka, Efe’yi hafta sonu için davet ediyor. Teklif ve ret kalıplarına dikkat et.',
    lines: [
      { ja: '田中：土曜日にいっしょに映画を見ませんか。', kana: 'たなか：どようびにいっしょにえいがをみませんか。', tr: 'Tanaka: Cumartesi birlikte film izlemez misin?' },
      { ja: 'エフェ：いいですね。見たいです。', kana: 'えふぇ：いいですね。みたいです。', tr: 'Efe: İyi fikir. İzlemek isterim.' },
      { ja: '田中：じゃあ、三時に駅で会いましょう。', kana: 'たなか：じゃあ、さんじにえきであいましょう。', tr: 'Tanaka: O zaman üçte istasyonda buluşalım.' },
      { ja: 'エフェ：すみません、三時はちょっと…', kana: 'えふぇ：すみません、さんじはちょっと…', tr: 'Efe: Kusura bakma, üç biraz…' },
      { ja: 'エフェ：午前は忙しいから、四時はどうですか。', kana: 'えふぇ：ごぜんはいそがしいから、よじはどうですか。', tr: 'Efe: Sabah meşgulüm, dört nasıl olur?' },
      { ja: '田中：いいですよ。四時にしましょう。', kana: 'たなか：いいですよ。よじにしましょう。', tr: 'Tanaka: Olur. Dört yapalım.' },
      { ja: '田中：エフェさんは日本語が上手ですね。', kana: 'たなか：えふぇさんはにほんごがじょうずですね。', tr: 'Tanaka: Efe, Japoncan iyi.' },
      { ja: 'エフェ：いいえ、まだ下手です。', kana: 'えふぇ：いいえ、まだへたです。', tr: 'Efe: Yok canım, daha kötüyüm.' },
    ],
    questions: [
      mcq('u10-t1', 'Kaçta buluşmaya karar verdiler?', ['Üçte', 'Dörtte', 'Beşte', 'Sabah'], 1),
      mcq('u10-t2', 'Efe neden üçte buluşamıyor?', ['Hasta', 'Sabah meşgul', 'Parası yok', 'İstemiyor'], 1, '午前は忙しいから'),
      mcq(
        'u10-t3',
        'Efe övgüye neden 「まだ下手です」 diyor?',
        ['Gerçekten kötü olduğu için', 'Japoncada övgüyü reddetmek nezakettir', 'Anlamadığı için', 'Şaka yaptığı için'],
        1,
      ),
    ],
  },

  homework: [
    {
      id: 'u10-h1',
      title: 'Beş isteğini yaz',
      detail:
        'Yapmak istediğin beş şeyi 〜たいです ile yaz. İkisini de 〜たくないです ile olumsuz yap.',
      minutes: 10,
    },
    {
      id: 'u10-h2',
      title: 'Davet diyaloğu',
      detail:
        'Altı satırlık bir davet diyaloğu kur: ませんか ile teklif, ましょう ile karar, bir de から ile sebep içersin.',
      minutes: 12,
    },
    {
      id: 'u10-h3',
      title: 'Kibarca reddet',
      detail:
        '「ざんねんですが…」 ve 「ちょっと…」 kullanarak iki farklı ret cümlesi yaz. Japoncada doğrudan いいえ demek sert durur.',
      minutes: 8,
    },
  ],

  test: [
    mcq('u10-q1', '「行きます」 → “gitmek istiyorum”', ['行きたいです', '行きませんか', '行きましょう', '行っています'], 0),
    mcq('u10-q2', '「食べたくないです」 ne demek?', ['Yemek istiyorum', 'Yemek istemiyorum', 'Yemedim', 'Yiyelim'], 1),
    mcq('u10-q3', 'Teklif hangisi?', ['行きます', '行きました', '行きませんか', '行きたいです'], 2),
    mcq('u10-q4', '“Hadi saat üçte buluşalım” nasıl denir?', ['三時に会いませんか。', '三時に会いましょう。', '三時に会いたいです。', '三時に会っています。'], 1),
    mcq('u10-q5', '「忙しいから、行きません」 içindeki から ne bildiriyor?', ['Zaman başlangıcı', 'Sebep', 'Yön', 'Karşılaştırma'], 1),
    fill('u10-q6', '私は料理 ___ 下手です。', ['が'], 'Yemekte kötüyüm.', 'を değil', '上手/下手 が alır.'),
    fill('u10-q7', 'いっしょにコーヒーを飲み ___ か。', ['ません'], 'Birlikte kahve içmez misin?'),
    order('u10-q8', ['日本', 'へ', '行きたい', 'です'], 'Japonya’ya gitmek istiyorum.'),
    translate('u10-q9', '田中さんは日本語が上手です。', ['tanaka japoncada iyi', 'tanaka japoncayı iyi biliyor', 'tanakanın japoncası iyi'], 'to-tr', 'たなかさんはにほんごがじょうずです。'),
    dict('u10-q10', 'いっしょに行きませんか。', ['いっしょにいきませんか', 'issho ni ikimasen ka'], 'Birlikte gitmez misin?'),
  ],
}
