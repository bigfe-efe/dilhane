import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u8: Unit = {
  id: 'u8',
  no: 8,
  title: 'Geçmişi anlatmak',
  subtitle: 'ました・ませんでした · geçmiş sıfatlar · どうでしたか',
  minutes: 45,
  canDo: [
    'Dün ne yaptığını anlatabilmek',
    'Bir şeyin nasıl geçtiğini sorabilmek ve söyleyebilmek',
    'Sıfatları geçmişe çevirebilmek',
    'İki cümleyi が ile bağlayabilmek',
  ],
  lessonIds: ['ja-g4'],

  grammar: [
    {
      title: 'Fiilde geçmiş zaman',
      pattern: 'V-ました / V-ませんでした',
      explain:
        'ます → ました olumlu geçmiş, ません → ませんでした olumsuz geçmiş. Kök hiç değişmez, yalnızca son ek değişir.',
      examples: [
        { ja: '昨日、映画を見ました。', kana: 'きのう、えいがをみました。', tr: 'Dün film izledim.' },
        { ja: '朝ご飯を食べませんでした。', kana: 'あさごはんをたべませんでした。', tr: 'Kahvaltı yapmadım.' },
      ],
      ref: 'ja-masu',
    },
    {
      title: 'い-sıfatta geçmiş',
      pattern: '〜かったです / 〜くなかったです',
      explain: 'い düşer, yerine かった gelir. Olumsuz geçmiş くなかった olur. です sonda kalır.',
      examples: [
        { ja: '昨日は忙しかったです。', kana: 'きのうはいそがしかったです。', tr: 'Dün meşguldüm.' },
        { ja: 'あまり寒くなかったです。', kana: 'あまりさむくなかったです。', tr: 'Pek soğuk değildi.' },
      ],
      pitfall: '「忙しいでした」 yanlıştır — です geçmişe çekilmez, sıfat çekilir.',
      ref: 'ja-i-adj',
    },
    {
      title: 'İsim ve な-sıfatta geçmiş',
      pattern: '〜でした / 〜じゃなかったです',
      explain: 'İsimler ve な-sıfatlar です üzerinden çekilir: でした, じゃなかったです.',
      examples: [
        { ja: '昨日は休みでした。', kana: 'きのうはやすみでした。', tr: 'Dün tatildi.' },
        { ja: 'しずかじゃなかったです。', kana: 'しずかじゃなかったです。', tr: 'Sakin değildi.' },
      ],
      ref: 'ja-na-adj',
    },
    {
      title: 'どうでしたか — “nasıldı?”',
      pattern: 'A は どうでしたか',
      explain: 'Bir deneyimin nasıl geçtiğini sormanın kalıbı. Cevapta sıfatın geçmiş hâli gelir.',
      examples: [
        { ja: '旅行はどうでしたか。', kana: 'りょこうはどうでしたか。', tr: 'Seyahat nasıldı?' },
        { ja: 'とても楽しかったです。', kana: 'とてもたのしかったです。', tr: 'Çok eğlenceliydi.' },
      ],
    },
    {
      title: 'が — “ama”',
      pattern: 'cümle 1 が、cümle 2',
      explain:
        'İki cümleyi zıtlık kurarak bağlar. Özne eki が ile aynı yazılır ama işlevi tamamen farklıdır; cümlenin ortasında ve virgülden önce gelir.',
      examples: [
        { ja: '高かったですが、おいしかったです。', kana: 'たかかったですが、おいしかったです。', tr: 'Pahalıydı ama lezzetliydi.' },
      ],
      ref: 'ja-ga',
    },
  ],

  rules: [
    {
      title: 'です geçmişe çekilmez',
      body:
        'Türk öğrencilerin en sık hatası: 「高いでした」. Japoncada い-sıfat kendisi çekilir → 高かったです. でした yalnızca İSİM ve な-sıfat sonrası gelir: 休みでした, しずかでした.',
    },
  ],

  vocab: [
    { ja: '昨日', kana: 'きのう', tr: 'dün' },
    { ja: 'おととい', kana: 'おととい', tr: 'evvelsi gün' },
    { ja: '先週', kana: 'せんしゅう', tr: 'geçen hafta' },
    { ja: '去年', kana: 'きょねん', tr: 'geçen yıl' },
    { ja: '映画', kana: 'えいが', tr: 'film' },
    { ja: '旅行', kana: 'りょこう', tr: 'seyahat' },
    { ja: '試験', kana: 'しけん', tr: 'sınav' },
    { ja: '休み', kana: 'やすみ', tr: 'tatil, izin' },
    { ja: '楽しい', kana: 'たのしい', tr: 'eğlenceli' },
    { ja: '寒い', kana: 'さむい', tr: 'soğuk' },
    { ja: '暑い', kana: 'あつい', tr: 'sıcak' },
    { ja: '難しい', kana: 'むずかしい', tr: 'zor' },
    { ja: 'やさしい', kana: 'やさしい', tr: 'kolay, nazik' },
    { ja: 'どう', kana: 'どう', tr: 'nasıl' },
    { ja: '見ます', kana: 'みます', tr: 'görmek, izlemek' },
    { ja: '会います', kana: 'あいます', tr: 'buluşmak' },
  ],

  text: {
    title: '週まつはどうでしたか — Hafta sonu nasıldı?',
    intro: 'Pazartesi sabahı. Tanaka, Efe’ye hafta sonunu soruyor.',
    lines: [
      { ja: '田中：週まつはどうでしたか。', kana: 'たなか：しゅうまつはどうでしたか。', tr: 'Tanaka: Hafta sonu nasıldı?' },
      { ja: 'エフェ：とても楽しかったです。', kana: 'えふぇ：とてもたのしかったです。', tr: 'Efe: Çok eğlenceliydi.' },
      { ja: 'エフェ：友だちと東京へ行きました。', kana: 'えふぇ：ともだちととうきょうへいきました。', tr: 'Efe: Arkadaşımla Tokyo’ya gittim.' },
      { ja: '田中：何をしましたか。', kana: 'たなか：なにをしましたか。', tr: 'Tanaka: Ne yaptınız?' },
      { ja: 'エフェ：映画を見ました。高かったですが、よかったです。', kana: 'えふぇ：えいがをみました。たかかったですが、よかったです。', tr: 'Efe: Film izledik. Pahalıydı ama iyiydi.' },
      { ja: '田中：食事もしましたか。', kana: 'たなか：しょくじもしましたか。', tr: 'Tanaka: Yemek de yediniz mi?' },
      { ja: 'エフェ：はい。でも、あまりおいしくなかったです。', kana: 'えふぇ：はい。でも、あまりおいしくなかったです。', tr: 'Efe: Evet. Ama pek lezzetli değildi.' },
      { ja: '田中：私は家で休みました。しずかな週まつでした。', kana: 'たなか：わたしはいえでやすみました。しずかなしゅうまつでした。', tr: 'Tanaka: Ben evde dinlendim. Sakin bir hafta sonuydu.' },
    ],
    questions: [
      mcq('u8-t1', 'Efe hafta sonu ne yaptı?', ['Evde dinlendi', 'Tokyo’ya gitti', 'Sınava girdi', 'Çalıştı'], 1),
      mcq('u8-t2', 'Yemek nasıldı?', ['Çok lezzetliydi', 'Pek lezzetli değildi', 'Ucuzdu', 'Söylenmiyor'], 1),
      mcq('u8-t3', '「高かったですが、よかったです」 içindeki が ne işe yarıyor?', ['Özneyi işaretliyor', '“ama” anlamı katıyor', 'Soru soruyor', 'Nesneyi işaretliyor'], 1),
    ],
  },

  homework: [
    {
      id: 'u8-h1',
      title: 'Dünü anlat',
      detail:
        'Dün yaptığın altı şeyi ました ile yaz. En az ikisi ませんでした olsun (yapmadığın şeyler).',
      minutes: 10,
    },
    {
      id: 'u8-h2',
      title: 'Sıfatları geçmişe çevir',
      detail:
        'Şunları geçmiş yap: 高い / 楽しい / いい / しずか / 休み. Hangisinin かった, hangisinin でした aldığına dikkat et.',
      minutes: 8,
    },
    {
      id: 'u8-h3',
      title: 'が ile bağla',
      detail: 'Üç cümle çifti kur ve が ile bağla: “… ama …”. Örnek: 難しかったですが、楽しかったです。',
      minutes: 8,
    },
  ],

  test: [
    mcq('u8-q1', '「食べます」 geçmiş hâli nedir?', ['食べました', '食べませんでした', '食べています', '食べたいです'], 0),
    mcq('u8-q2', '「高い」 geçmiş hâli nedir?', ['高いでした', '高かったです', '高くないです', '高でした'], 1, 'い-sıfat kendisi çekilir.'),
    mcq('u8-q3', '「休み」（isim）geçmiş hâli nedir?', ['休みかったです', '休みでした', '休みました', '休みくないです'], 1),
    mcq('u8-q4', '“Pek soğuk değildi” nasıl denir?', ['あまり寒くないです。', 'あまり寒くなかったです。', 'あまり寒いでした。', 'あまり寒かったです。'], 1),
    mcq('u8-q5', '「旅行はどうでしたか」 ne soruyor?', ['Nereye gittin?', 'Ne zaman gittin?', 'Nasıldı?', 'Kiminle gittin?'], 2),
    fill('u8-q6', '昨日、映画を見 ___ 。', ['ました'], 'Dün film izledim.'),
    fill('u8-q7', '昨日は忙し ___ です。', ['かった'], 'Dün meşguldüm.'),
    order('u8-q8', ['先週', '友だち', 'と', '会いました'], 'Geçen hafta arkadaşımla buluştum.'),
    translate('u8-q9', '朝ご飯を食べませんでした。', ['kahvaltı yapmadım', 'sabah kahvaltı yapmadım'], 'to-tr', 'あさごはんをたべませんでした。'),
    dict('u8-q10', 'とても楽しかったです。', ['とてもたのしかったです', 'totemo tanoshikatta desu'], 'Çok eğlenceliydi.'),
  ],
}
