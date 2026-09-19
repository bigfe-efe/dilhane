import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u3: Unit = {
  id: 'u3',
  no: 3,
  title: 'Saatler ve günlük program',
  subtitle: '〜時〜分 · から〜まで · ます biçimi · に',
  minutes: 55,
  canDo: [
    'Saati sorabilmek ve söyleyebilmek',
    'Günlük programını anlatabilmek',
    'Bir işin kaçtan kaça sürdüğünü söyleyebilmek',
    'Fiilleri kibar biçimde çekebilmek (ます / ません / ました)',
  ],
  lessonIds: ['ja-g3'],

  grammar: [
    {
      title: 'ます biçimi — kibar fiil',
      pattern: 'V-ます / V-ません / V-ました / V-ませんでした',
      explain:
        'Japonca fiil dört temel hâlde çekilir. Şimdiki ve gelecek zaman aynıdır: 行きます hem “gidiyorum” hem “gideceğim” demektir.',
      examples: [
        { ja: '七時に起きます。', kana: 'しちじにおきます。', tr: 'Saat yedide kalkarım.' },
        { ja: '朝ご飯を食べません。', kana: 'あさごはんをたべません。', tr: 'Kahvaltı yapmam.' },
        { ja: '昨日、早く寝ました。', kana: 'きのう、はやくねました。', tr: 'Dün erken yattım.' },
      ],
      pitfall: 'Türkçedeki gibi ayrı bir gelecek zaman eki yoktur; bağlam belirler.',
      ref: 'ja-masu',
    },
    {
      title: 'に — zaman eki',
      pattern: 'saat / gün + に',
      explain:
        'Sayıyla söylenen zamanlara に gelir: 七時に, 月曜日に. Ama 今日, 明日, 毎日 gibi kelimelere GELMEZ.',
      examples: [
        { ja: '九時に学校へ行きます。', kana: 'くじにがっこうへいきます。', tr: 'Dokuzda okula giderim.' },
        { ja: '毎日日本語をべんきょうします。', kana: 'まいにちにほんごをべんきょうします。', tr: 'Her gün Japonca çalışırım.' },
      ],
      pitfall: '「毎日に」 ve 「今日に」 yanlıştır.',
      ref: 'ja-time',
    },
    {
      title: '〜から〜まで — “…-den …-e kadar”',
      pattern: 'A から B まで',
      explain: 'Hem zaman hem yer için kullanılır. Tek başına da kullanılabilir: 九時から = dokuzdan itibaren.',
      examples: [
        { ja: '九時から五時まで働きます。', kana: 'くじからごじまではたらきます。', tr: 'Dokuzdan beşe kadar çalışırım.' },
        { ja: '月曜日から金曜日まで学校です。', kana: 'げつようびからきんようびまでがっこうです。', tr: 'Pazartesiden cumaya okul var.' },
      ],
      ref: 'ja-kara-made',
    },
    {
      title: 'Saat söylemek',
      pattern: '〜時〜分 / 〜時半',
      explain:
        'Saat + 時, dakika + 分. Buçuk için 半 kullanılır. 4, 7, 9 saatlerinde okunuş düzensizdir: よじ, しちじ, くじ.',
      examples: [
        { ja: '今、何時ですか。', kana: 'いま、なんじですか。', tr: 'Şu an saat kaç?' },
        { ja: '四時半です。', kana: 'よじはんです。', tr: 'Dört buçuk.' },
        { ja: '十時十分です。', kana: 'じゅうじじゅっぷんです。', tr: 'Onu on geçiyor.' },
      ],
      pitfall: '四時 よんじ değil よじ; 九時 きゅうじ değil くじ.',
      ref: 'ja-time',
    },
  ],

  rules: [
    {
      title: '午前 ve 午後',
      body:
        'Japoncada saat genelde 12’lik sistemle söylenir ve gerekirse başa 午前 (öğleden önce) ya da 午後 (öğleden sonra) eklenir: 午前九時, 午後三時. Sıralama Türkçenin tersi — önce 午前/午後, sonra saat.',
    },
    {
      title: 'を nesne eki',
      body:
        'Fiilin neye yapıldığını を gösterir: ご飯を食べます, 日本語をべんきょうします. Yazılışı を, okunuşu “o”.',
    },
  ],

  vocab: [
    { ja: '今', kana: 'いま', tr: 'şu an' },
    { ja: '何時', kana: 'なんじ', tr: 'saat kaç' },
    { ja: '半', kana: 'はん', tr: 'buçuk' },
    { ja: '午前', kana: 'ごぜん', tr: 'öğleden önce' },
    { ja: '午後', kana: 'ごご', tr: 'öğleden sonra' },
    { ja: '毎日', kana: 'まいにち', tr: 'her gün' },
    { ja: '毎朝', kana: 'まいあさ', tr: 'her sabah' },
    { ja: '起きます', kana: 'おきます', tr: 'kalkmak, uyanmak' },
    { ja: '寝ます', kana: 'ねます', tr: 'yatmak, uyumak' },
    { ja: '食べます', kana: 'たべます', tr: 'yemek' },
    { ja: '飲みます', kana: 'のみます', tr: 'içmek' },
    { ja: 'べんきょうします', kana: 'べんきょうします', tr: 'ders çalışmak' },
    { ja: '働きます', kana: 'はたらきます', tr: 'çalışmak (iş)' },
    { ja: '行きます', kana: 'いきます', tr: 'gitmek' },
    { ja: '帰ります', kana: 'かえります', tr: 'eve dönmek' },
    { ja: '休みます', kana: 'やすみます', tr: 'dinlenmek, izin yapmak' },
    { ja: '昨日', kana: 'きのう', tr: 'dün' },
    { ja: '明日', kana: 'あした', tr: 'yarın' },
  ],

  text: {
    title: '私の一日 — Bir günüm',
    intro: 'Efe günlük programını anlatıyor. Saatlere ve fiil çekimlerine dikkat et.',
    lines: [
      { ja: '毎朝、七時に起きます。', kana: 'まいあさ、しちじにおきます。', tr: 'Her sabah yedide kalkarım.' },
      { ja: '八時にパンを食べます。', kana: 'はちじにぱんをたべます。', tr: 'Sekizde ekmek yerim.' },
      { ja: '九時から三時まで大学です。', kana: 'くじからさんじまでだいがくです。', tr: 'Dokuzdan üçe kadar üniversitedeyim.' },
      { ja: '午後四時に帰ります。', kana: 'ごごよじにかえります。', tr: 'Öğleden sonra dörtte eve dönerim.' },
      { ja: '毎日日本語をべんきょうします。', kana: 'まいにちにほんごをべんきょうします。', tr: 'Her gün Japonca çalışırım.' },
      { ja: '十二時に寝ます。', kana: 'じゅうにじにねます。', tr: 'On ikide yatarım.' },
      { ja: '土曜日は休みます。', kana: 'どようびはやすみます。', tr: 'Cumartesi dinlenirim.' },
      { ja: '昨日は早く寝ました。', kana: 'きのうははやくねました。', tr: 'Dün erken yattım.' },
    ],
    questions: [
      mcq('u3-t1', 'Efe saat kaçta kalkıyor?', ['6', '7', '8', '9'], 1, '七時に起きます。'),
      mcq('u3-t2', 'Üniversite kaçtan kaça?', ['8–3', '9–3', '9–4', '12–4'], 1, '九時から三時まで.'),
      mcq('u3-t3', '「昨日は早く寝ました」 hangi zaman?', ['şimdiki', 'gelecek', 'geçmiş', 'olumsuz'], 2, 'ました geçmiş zamandır.'),
    ],
  },

  homework: [
    {
      id: 'u3-h1',
      title: 'Kendi günün',
      detail:
        'Kendi gününü altı cümleyle yaz. Her cümlede bir saat ve bir fiil olsun. En az bir tanesinde から〜まで kullan.',
      minutes: 12,
    },
    {
      id: 'u3-h2',
      title: 'Saatleri sesli oku',
      detail:
        '1’den 12’ye kadar bütün saatleri sesli söyle: いちじ, にじ, さんじ… 4, 7 ve 9’da duraksarsan o üçünü ayrıca tekrar et.',
      minutes: 6,
    },
    {
      id: 'u3-h3',
      title: 'Olumsuz ve geçmiş',
      detail:
        'Yazdığın altı cümlenin üçünü olumsuz (ません), üçünü geçmiş (ました) yap. Biçimi değiştirmenin anlamı nasıl değiştirdiğini gör.',
      minutes: 10,
    },
  ],

  test: [
    mcq('u3-q1', '「四時」 nasıl okunur?', ['よんじ', 'よじ', 'しじ', 'よっじ'], 1, 'Saatte よん değil よ.'),
    mcq('u3-q2', '「九時」 nasıl okunur?', ['きゅうじ', 'くじ', 'ここのじ', 'きゅじ'], 1),
    mcq('u3-q3', 'Hangisi YANLIŞ?', ['七時に起きます。', '毎日に起きます。', '月曜日に行きます。', '九時に寝ます。'], 1, '毎日, 今日, 明日 gibi kelimelere に gelmez.'),
    mcq('u3-q4', '「食べません」 ne demek?', ['yedim', 'yerim', 'yemem', 'yiyeceğim'], 2),
    mcq('u3-q5', '“Dokuzdan beşe kadar” nasıl denir?', ['九時まで五時から', '九時から五時まで', '九時に五時まで', '九時と五時まで'], 1),
    fill('u3-q6', '毎日日本語 ___ べんきょうします。', ['を'], 'Her gün Japonca çalışırım.', undefined, 'Nesneyi を işaretler.'),
    fill('u3-q7', '七時 ___ 起きます。', ['に'], 'Yedide kalkarım.', undefined, 'Sayıyla söylenen saate に gelir.'),
    order('u3-q8', ['九時', 'に', '学校', 'へ', '行きます'], 'Dokuzda okula giderim.'),
    translate('u3-q9', '昨日は早く寝ました。', ['dün erken yattım', 'dün erken uyudum'], 'to-tr', 'きのうははやくねました。'),
    dict('u3-q10', '今、何時ですか。', ['いまなんじですか', 'ima nanji desu ka', 'imananjidesuka'], 'Şu an saat kaç?'),
  ],
}
