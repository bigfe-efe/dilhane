import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u7: Unit = {
  id: 'u7',
  no: 7,
  title: 'Betimleme',
  subtitle: 'い-sıfat · な-sıfat · 好き · とても / あまり',
  minutes: 50,
  canDo: [
    'Bir şeyi betimleyebilmek: büyük, yeni, pahalı',
    'İki sıfat türünü ayırt edebilmek',
    'Neyi sevip sevmediğini söyleyebilmek',
    'Derece belirtebilmek: çok, pek değil',
  ],
  lessonIds: ['ja-g5'],

  grammar: [
    {
      title: 'い-sıfatlar',
      pattern: '大きいです / 大きくないです / 大きかったです',
      explain:
        'Sonu い ile biten sıfatlar. Çekim い üzerinden yapılır: olumsuzda い → くない, geçmişte い → かった.',
      examples: [
        { ja: 'この本は高いです。', kana: 'このほんはたかいです。', tr: 'Bu kitap pahalı.' },
        { ja: 'あまり高くないです。', kana: 'あまりたかくないです。', tr: 'Pek pahalı değil.' },
        { ja: '昨日は寒かったです。', kana: 'きのうはさむかったです。', tr: 'Dün soğuktu.' },
      ],
      pitfall: 'いい düzensizdir: olumsuzu よくない, geçmişi よかった.',
      ref: 'ja-i-adj',
    },
    {
      title: 'な-sıfatlar',
      pattern: 'しずかです / しずかじゃないです / しずかな + isim',
      explain:
        'Sonu い ile bitmeyen sıfatlar isim gibi çekilir. İsimden önce geldiklerinde araya な girer.',
      examples: [
        { ja: 'この町はしずかです。', kana: 'このまちはしずかです。', tr: 'Bu kasaba sakin.' },
        { ja: 'しずかな町です。', kana: 'しずかなまちです。', tr: 'Sakin bir kasaba.' },
      ],
      pitfall: 'きれい ve ゆうめい sonu い ile bittiği hâlde な-sıfattır: きれいな花.',
      ref: 'ja-na-adj',
    },
    {
      title: '好き・きらい + が',
      pattern: 'A は B が 好きです',
      explain:
        'Sevmek Japoncada sıfatla ifade edilir ve sevilen şey を değil が alır. Aynı yapı 上手/下手 için de geçerlidir.',
      examples: [
        { ja: '私は日本語が好きです。', kana: 'わたしはにほんごがすきです。', tr: 'Japoncayı seviyorum.' },
        { ja: '魚があまり好きじゃないです。', kana: 'さかながあまりすきじゃないです。', tr: 'Balığı pek sevmiyorum.' },
      ],
      pitfall: '「日本語を好きです」 yanlıştır.',
      ref: 'ja-suki',
    },
    {
      title: 'とても / あまり',
      pattern: 'とても + olumlu · あまり + olumsuz',
      explain:
        'とても “çok” demektir ve olumlu cümlede kullanılır. あまり ise “pek” demektir ve MUTLAKA olumsuzla biter.',
      examples: [
        { ja: 'とてもおいしいです。', kana: 'とてもおいしいです。', tr: 'Çok lezzetli.' },
        { ja: 'あまりおいしくないです。', kana: 'あまりおいしくないです。', tr: 'Pek lezzetli değil.' },
      ],
      pitfall: '「あまりおいしいです」 yanlıştır; あまり olumsuz ister.',
    },
  ],

  rules: [
    {
      title: 'Hangi sıfat hangi türden',
      body:
        'Sonu い ile bitiyorsa genelde い-sıfattır. İstisnalar: きれい (güzel, temiz), ゆうめい (ünlü), きらい (sevmemek) — üçü de な-sıfattır. Bunları ezberle, gerisi kurala uyar.',
    },
  ],

  vocab: [
    { ja: '大きい', kana: 'おおきい', tr: 'büyük' },
    { ja: '小さい', kana: 'ちいさい', tr: 'küçük' },
    { ja: '新しい', kana: 'あたらしい', tr: 'yeni' },
    { ja: '古い', kana: 'ふるい', tr: 'eski' },
    { ja: '高い', kana: 'たかい', tr: 'pahalı, yüksek' },
    { ja: '安い', kana: 'やすい', tr: 'ucuz' },
    { ja: 'おいしい', kana: 'おいしい', tr: 'lezzetli' },
    { ja: 'いい', kana: 'いい', tr: 'iyi', note: 'Düzensiz: よくない, よかった.' },
    { ja: '忙しい', kana: 'いそがしい', tr: 'meşgul' },
    { ja: 'しずか', kana: 'しずか', tr: 'sakin', note: 'な-sıfat' },
    { ja: 'にぎやか', kana: 'にぎやか', tr: 'hareketli, canlı', note: 'な-sıfat' },
    { ja: 'きれい', kana: 'きれい', tr: 'güzel, temiz', note: 'い ile bitse de な-sıfat' },
    { ja: 'ゆうめい', kana: 'ゆうめい', tr: 'ünlü', note: 'な-sıfat' },
    { ja: '好き', kana: 'すき', tr: 'sevilen', note: 'な-sıfat; sevilen şey が alır.' },
    { ja: 'きらい', kana: 'きらい', tr: 'sevilmeyen', note: 'な-sıfat' },
    { ja: 'とても', kana: 'とても', tr: 'çok' },
    { ja: 'あまり', kana: 'あまり', tr: 'pek', note: 'Olumsuzla kullanılır.' },
    { ja: '町', kana: 'まち', tr: 'kasaba, şehir' },
  ],

  text: {
    title: '私の町 — Benim şehrim',
    intro: 'Efe yaşadığı yeri anlatıyor. İki sıfat türünün çekimine dikkat et.',
    lines: [
      { ja: '私の町は大きいです。', kana: 'わたしのまちはおおきいです。', tr: 'Benim şehrim büyük.' },
      { ja: 'でも、とてもしずかです。', kana: 'でも、とてもしずかです。', tr: 'Ama çok sakin.' },
      { ja: '駅の前に新しいカフェがあります。', kana: 'えきのまえにあたらしいかふぇがあります。', tr: 'İstasyonun önünde yeni bir kafe var.' },
      { ja: 'そのカフェのコーヒーはとてもおいしいです。', kana: 'そのかふぇのこーひーはとてもおいしいです。', tr: 'O kafenin kahvesi çok lezzetli.' },
      { ja: '高くないです。安いです。', kana: 'たかくないです。やすいです。', tr: 'Pahalı değil. Ucuz.' },
      { ja: '駅の後ろに古い本やがあります。', kana: 'えきのうしろにふるいほんやがあります。', tr: 'İstasyonun arkasında eski bir kitapçı var.' },
      { ja: '私は古い本が好きです。', kana: 'わたしはふるいほんがすきです。', tr: 'Eski kitapları severim.' },
      { ja: '町はあまりにぎやかじゃないです。', kana: 'まちはあまりにぎやかじゃないです。', tr: 'Şehir pek hareketli değil.' },
    ],
    questions: [
      mcq('u7-t1', 'Şehir nasıl?', ['Küçük ve hareketli', 'Büyük ve sakin', 'Büyük ve hareketli', 'Küçük ve sakin'], 1),
      mcq('u7-t2', 'Kafenin kahvesi nasıl?', ['Pahalı', 'Lezzetli ve ucuz', 'Lezzetsiz', 'Çok pahalı'], 1),
      mcq('u7-t3', '「にぎやかじゃないです」 neden じゃない alıyor?', ['い-sıfat olduğu için', 'な-sıfat olduğu için', 'Fiil olduğu için', 'Geçmiş zaman olduğu için'], 1, 'な-sıfatlar isim gibi çekilir.'),
    ],
  },

  homework: [
    {
      id: 'u7-h1',
      title: 'Sıfatları ikiye ayır',
      detail:
        'Ünitedeki 18 kelimeyi い-sıfat ve な-sıfat diye iki sütuna ayır. きれい, ゆうめい ve きらい’yi doğru sütuna koymayı unutma.',
      minutes: 8,
    },
    {
      id: 'u7-h2',
      title: 'Kendi şehrini anlat',
      detail:
        'Yaşadığın yeri altı cümleyle anlat. En az iki い-sıfat, iki な-sıfat, bir とても ve bir あまり kullan.',
      minutes: 12,
    },
    {
      id: 'u7-h3',
      title: 'Sevdiklerin',
      detail:
        '「私は〜が好きです」 kalıbıyla üç sevdiğin, 「〜があまり好きじゃないです」 ile iki sevmediğin şeyi yaz.',
      minutes: 8,
    },
  ],

  test: [
    mcq('u7-q1', '「新しい」 hangi tür sıfat?', ['い-sıfat', 'な-sıfat', 'Fiil', 'İsim'], 0),
    mcq('u7-q2', '「きれい」 hangi tür sıfat?', ['い-sıfat', 'な-sıfat', 'İkisi de', 'Hiçbiri'], 1, 'い ile bitse de な-sıfattır.'),
    mcq('u7-q3', '「高い」 olumsuzu nedir?', ['高いじゃないです', '高くないです', '高かったです', '高いません'], 1),
    mcq('u7-q4', '“Sakin bir kasaba” nasıl denir?', ['しずか町', 'しずかな町', 'しずかい町', 'しずかの町'], 1, 'な-sıfat isimden önce な alır.'),
    mcq('u7-q5', 'Hangisi YANLIŞ?', ['とてもおいしいです。', 'あまりおいしくないです。', 'あまりおいしいです。', 'とても高いです。'], 2, 'あまり olumsuz ister.'),
    fill('u7-q6', '私は日本語 ___ 好きです。', ['が'], 'Japoncayı seviyorum.', 'を değil', '好き ile sevilen şey が alır.'),
    fill('u7-q7', '昨日は寒 ___ です。（geçmiş）', ['かった'], 'Dün soğuktu.', undefined, 'い-sıfat geçmişi: い → かった.'),
    order('u7-q8', ['この', 'カフェ', 'の', 'コーヒー', 'は', 'おいしいです'], 'Bu kafenin kahvesi lezzetli.'),
    translate('u7-q9', '町はあまりにぎやかじゃないです。', ['şehir pek hareketli değil', 'kasaba pek hareketli değil'], 'to-tr', 'まちはあまりにぎやかじゃないです。'),
    dict('u7-q10', 'とてもおいしいです。', ['とてもおいしいです', 'totemo oishii desu', 'totemooishiidesu'], 'Çok lezzetli.'),
  ],
}
