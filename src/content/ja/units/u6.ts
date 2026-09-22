import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u6: Unit = {
  id: 'u6',
  no: 6,
  title: 'Gidip gelmek',
  subtitle: '行きます・来ます・帰ります · へ / で / と',
  minutes: 45,
  canDo: [
    'Nereye gittiğini söyleyebilmek',
    'Hangi araçla gittiğini belirtebilmek',
    'Kiminle gittiğini söyleyebilmek',
    'Ne zaman sorusunu sorabilmek ve cevaplayabilmek',
  ],
  lessonIds: ['ja-g3', 'ja-g5'],

  grammar: [
    {
      title: 'Üç hareket fiili',
      star: true,
      pattern: '行きます / 来ます / 帰ります',
      explain:
        '行きます konuşanın bulunduğu yerden UZAKLAŞMAK, 来ます konuşana DOĞRU gelmek, 帰ります ait olunan yere (ev, ülke) dönmek demektir.',
      examples: [
        { ja: '学校へ行きます。', kana: 'がっこうへいきます。', tr: 'Okula giderim.' },
        { ja: '友だちが家へ来ます。', kana: 'ともだちがいえへきます。', tr: 'Arkadaşım eve geliyor.' },
        { ja: '六時に帰ります。', kana: 'ろくじにかえります。', tr: 'Altıda eve dönerim.' },
      ],
      pitfall: '来る düzensizdir: 来ます きます, 来ない こない. Kanji aynı kalır, okunuş değişir.',
      ref: 'ja-masu',
    },
    {
      title: 'へ / に — yön',
      star: true,
      pattern: 'yer + へ（に）+ hareket fiili',
      explain:
        'Hareket fiilleriyle ikisi de kullanılır ve anlam neredeyse aynıdır. へ yönü, に varış noktasını vurgular. Yazılışı へ, okunuşu “e”.',
      examples: [
        { ja: '日本へ行きます。', kana: 'にほんへいきます。', tr: 'Japonya’ya gideceğim.' },
        { ja: '大学に行きます。', kana: 'だいがくにいきます。', tr: 'Üniversiteye gidiyorum.' },
      ],
      ref: 'ja-ni-he',
    },
    {
      title: 'で — araç',
      pattern: 'araç + で',
      explain:
        'Hangi araçla gidildiğini gösterir: 電車で, バスで. Yürüyerek demek için ise 歩いて kullanılır, で almaz.',
      examples: [
        { ja: '電車で行きます。', kana: 'でんしゃでいきます。', tr: 'Trenle giderim.' },
        { ja: '歩いて帰ります。', kana: 'あるいてかえります。', tr: 'Yürüyerek dönerim.' },
      ],
      pitfall: '「歩いてで」 yanlıştır.',
      ref: 'ja-de',
    },
    {
      title: 'と — “ile”',
      pattern: 'kişi + と',
      explain: 'Birlikte yapılan kişiyi gösterir. Yalnız yapıldığını söylemek için 一人で kullanılır.',
      examples: [
        { ja: '友だちと行きます。', kana: 'ともだちといきます。', tr: 'Arkadaşımla giderim.' },
        { ja: '一人で帰ります。', kana: 'ひとりでかえります。', tr: 'Tek başıma dönerim.' },
      ],
      pitfall: '一人で’deki で “araç” で’si değil, “durum” anlamındadır.',
    },
  ],

  rules: [
    {
      title: 'Cümle sırası',
      star: true,
      body:
        'Japoncada öğe sırası esnektir ama alışılmış dizilim şudur: ZAMAN → KİŞİ → YER → ARAÇ → FİİL. 「明日友だちと電車で東京へ行きます」. Yüklem her zaman sonda kalır.',
    },
  ],

  vocab: [
    { star: true, ja: '行きます', kana: 'いきます', tr: 'gitmek' },
    { star: true, ja: '来ます', kana: 'きます', tr: 'gelmek' },
    { star: true, ja: '帰ります', kana: 'かえります', tr: 'eve dönmek' },
    { star: true, ja: '電車', kana: 'でんしゃ', tr: 'tren' },
    { ja: 'バス', kana: 'バス', tr: 'otobüs' },
    { ja: '車', kana: 'くるま', tr: 'araba' },
    { ja: '自転車', kana: 'じてんしゃ', tr: 'bisiklet' },
    { ja: '歩いて', kana: 'あるいて', tr: 'yürüyerek' },
    { ja: '一人で', kana: 'ひとりで', tr: 'tek başına' },
    { ja: 'いつ', kana: 'いつ', tr: 'ne zaman' },
    { ja: '今日', kana: 'きょう', tr: 'bugün' },
    { ja: '明日', kana: 'あした', tr: 'yarın' },
    { ja: '来週', kana: 'らいしゅう', tr: 'gelecek hafta' },
    { ja: '先週', kana: 'せんしゅう', tr: 'geçen hafta' },
    { ja: '会社', kana: 'かいしゃ', tr: 'şirket' },
    { ja: '国', kana: 'くに', tr: 'ülke, memleket' },
  ],

  text: {
    title: '週まつの予定 — Hafta sonu planı',
    intro: 'Efe ile Tanaka hafta sonu ne yapacaklarını konuşuyor.',
    lines: [
      { ja: '田中：エフェさん、明日どこへ行きますか。', kana: 'たなか：えふぇさん、あしたどこへいきますか。', tr: 'Tanaka: Efe, yarın nereye gidiyorsun?' },
      { ja: 'エフェ：友だちと東京へ行きます。', kana: 'えふぇ：ともだちととうきょうへいきます。', tr: 'Efe: Arkadaşımla Tokyo’ya gidiyorum.' },
      { ja: '田中：何で行きますか。', kana: 'たなか：なにでいきますか。', tr: 'Tanaka: Neyle gidiyorsunuz?' },
      { ja: 'エフェ：電車で行きます。', kana: 'えふぇ：でんしゃでいきます。', tr: 'Efe: Trenle gidiyoruz.' },
      { ja: '田中：いつ帰りますか。', kana: 'たなか：いつかえりますか。', tr: 'Tanaka: Ne zaman dönüyorsunuz?' },
      { ja: 'エフェ：日曜日の夜に帰ります。', kana: 'えふぇ：にちようびのよるにかえります。', tr: 'Efe: Pazar akşamı döneceğiz.' },
      { ja: '田中：いいですね。私は家で休みます。', kana: 'たなか：いいですね。わたしはいえでやすみます。', tr: 'Tanaka: Güzelmiş. Ben evde dinleneceğim.' },
    ],
    questions: [
      mcq('u6-t1', 'Efe nereye gidiyor?', ['Okula', 'Tokyo’ya', 'Eve', 'Şirkete'], 1),
      mcq('u6-t2', 'Neyle gidiyor?', ['Otobüsle', 'Arabayla', 'Trenle', 'Yürüyerek'], 2, '電車で行きます。'),
      mcq('u6-t3', '「何で行きますか」 ne soruyor?', ['Niçin', 'Neyle', 'Nereye', 'Kiminle'], 1, 'Burada 何で araç soruyor: なにで.'),
    ],
  },

  homework: [
    {
      id: 'u6-h1',
      title: 'Haftalık gidiş listesi',
      detail:
        'Bu hafta gittiğin beş yeri yaz: 「月曜日に〜へ〜で行きました」. Araç ve gün bilgisi olsun.',
      minutes: 10,
      steps: [
        'Bu haftadan beş yer ve her birine gittiğin günü seç.',
        'Sırayı koru: gün + に + yer + へ + araç + で + fiil.',
        'Olan bitmişse ました, olacaksa ます kullan.',
        'Bir cümlede 歩いて, bir cümlede 一人で geçsin — bunlar で almaz.',
      ],
      example: [
        { ja: '月曜日に学校へ電車で行きました。', kana: 'げつようびにがっこうへでんしゃでいきました。', tr: 'Pazartesi okula trenle gittim.' },
        { ja: '土曜日に友だちと東京へ行きます。', kana: 'どようびにともだちととうきょうへいきます。', tr: 'Cumartesi arkadaşımla Tokyo’ya gideceğim.' },
        { ja: '歩いて帰りました。', kana: 'あるいてかえりました。', tr: 'Yürüyerek döndüm.' },
      ],
      tips: [
        '歩いて zaten “yürüyerek” demek; 歩いてで yanlıştır.',
        '一人で = tek başına. Buradaki で araç eki değil, kalıbın parçası.',
      ],
    },
    {
      id: 'u6-h2',
      title: 'Sıralamayı çalış',
      detail:
        'Şu öğeleri doğru sıraya diz ve cümleyi yaz: 東京へ / 明日 / 電車で / 友だちと / 行きます. Sıra ZAMAN → KİŞİ → YER → ARAÇ → FİİL.',
      minutes: 6,
      star: true,
      steps: [
        'Öğeleri kâğıda karışık yaz, sonra sırayı numaralandır.',
        'Sıra şu: ZAMAN → KİŞİ → YER → ARAÇ → FİİL.',
        'Cümleyi tek satırda yeniden yaz ve sesli oku.',
        'Aynı sırayla kendi hayatından iki cümle daha kur.',
      ],
      example: [
        { ja: '明日友だちと東京へ電車で行きます。', kana: 'あしたともだちととうきょうへでんしゃでいきます。', tr: 'Yarın arkadaşımla Tokyo’ya trenle gideceğim.' },
      ],
      tips: [
        'Fiil HER ZAMAN sonda — Türkçedeki gibi.',
        'Zaman zarfı cümlenin en başına da alınabilir; fiil yine sonda kalır.',
      ],
    },
    {
      id: 'u6-h3',
      title: '行く mu 来る mu',
      detail:
        'Şu durumlarda hangisi kullanılır, yaz: (1) Sen okula gidiyorsun. (2) Arkadaşın senin evine geliyor. (3) İşten eve dönüyorsun.',
      minutes: 6,
      steps: [
        'Her durumda önce “konuşan kişi nerede” sorusunu sor.',
        'Konuşandan UZAKLAŞMA varsa 行きます.',
        'Konuşana YAKLAŞMA varsa 来ます.',
        'Kendi evine dönüş için 帰ります — bu üçüncü, ayrı bir fiil.',
      ],
      example: [
        { ja: '学校へ行きます。', kana: 'がっこうへいきます。', tr: 'Okula gidiyorum.' },
        { ja: '友だちが家へ来ます。', kana: 'ともだちがうちへきます。', tr: 'Arkadaşım evime geliyor.' },
        { ja: '六時に帰ります。', kana: 'ろくじにかえります。', tr: 'Altıda eve dönerim.' },
      ],
      tips: [
        'Türkçede “geliyorum” dediğimiz yerde Japonca 行きます der: senden uzaklaşıp ona gidiyorum.',
        '来ます düzensizdir: 来る → 来ます → 来て (きて).',
      ],
    },
  ],

  test: [
    mcq('u6-q1', '「学校 ___ 行きます」', ['で', 'へ', 'を', 'が'], 1, 'Yön へ ile gösterilir.'),
    mcq('u6-q2', '「電車 ___ 行きます」', ['へ', 'に', 'で', 'と'], 2, 'Araç で alır.'),
    mcq('u6-q3', '「友だち ___ 行きます」（arkadaşımla）', ['で', 'と', 'へ', 'を'], 1),
    mcq('u6-q4', 'Eve dönmek için hangi fiil?', ['行きます', '来ます', '帰ります', '入ります'], 2),
    mcq('u6-q5', '「来ます」 nasıl okunur?', ['らいます', 'きます', 'くます', 'こます'], 1, '来る düzensizdir.'),
    fill('u6-q6', '明日、日本 ___ 行きます。', ['へ', 'に'], 'Yarın Japonya’ya gideceğim.'),
    fill('u6-q7', '一人 ___ 帰ります。', ['で'], 'Tek başıma dönerim.'),
    order('u6-q8', ['明日', '友だちと', '電車で', '東京へ', '行きます'], 'Yarın arkadaşımla trenle Tokyo’ya gideceğim.'),
    translate('u6-q9', '先週、国へ帰りました。', ['geçen hafta ülkeme döndüm', 'geçen hafta memleketime döndüm'], 'to-tr', 'せんしゅう、くにへかえりました。'),
    dict('u6-q10', 'いつ帰りますか。', ['いつかえりますか', 'itsu kaerimasu ka', 'itsukaerimasuka'], 'Ne zaman dönüyorsun?'),
  ],
}
