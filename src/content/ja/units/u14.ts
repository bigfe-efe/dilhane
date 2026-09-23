import { dict, fill, mcq, order, translate, type Unit } from './types'

// Ünite 14 — N5 dilbilgisinin son halkası: istek, yasak, zorunluluk,
// deneyim ve plan. Doktor muayenesi seçildi çünkü "ne yapmalı / ne
// yapmamalı" N5 dinlemesinin sabit sahnelerinden; vücut kanjileri
// (口目耳足手力) başka ünitede yoktu.

export const u14: Unit = {
  id: 'u14',
  no: 14,
  title: 'Sağlık, kurallar ve deneyim',
  subtitle: 'ほしい · ないでください · なければ · たことがある · つもり',
  minutes: 60,
  canDo: [
    'Nerenin ağrıdığını söyleyebilmek',
    'Doktorun ya da bir levhanın kurallarını anlayabilmek',
    'Bir şey istediğini söyleyebilmek',
    'Deneyimini ve planını anlatabilmek',
  ],
  lessonIds: ['ja-g8', 'ja-g11', 'ja-g12'],

  grammar: [
    {
      title: '〜がほしいです — bir ŞEY istemek',
      star: true,
      pattern: 'isim + が ほしいです',
      explain:
        'たい bir EYLEM ister (行きたい), ほしい bir NESNE ister (車がほしい). ほしい bir い-sıfat gibi çekilir: ほしくないです, ほしかったです.',
      examples: [
        { ja: '新しいかばんがほしいです。', kana: 'あたらしいかばんがほしいです。', tr: 'Yeni bir çanta istiyorum.' },
        { ja: '今は何もほしくないです。', kana: 'いまはなにもほしくないです。', tr: 'Şu an hiçbir şey istemiyorum.' },
      ],
      pitfall: 'ほしい ile を değil が: 水がほしいです.',
    },
    {
      title: '〜ないでください — “lütfen …me”',
      pattern: 'ない biçimi + でください',
      explain: 'Kibar yasak ya da uyarı. Levhalarda, doktorda, okulda sık görülür.',
      examples: [
        { ja: 'ここでたばこをすわないでください。', kana: 'ここでたばこをすわないでください。', tr: 'Lütfen burada sigara içmeyin.' },
        { ja: 'しんぱいしないでください。', kana: 'しんぱいしないでください。', tr: 'Lütfen merak etmeyin.' },
      ],
      ref: 'ja-naide-kudasai',
    },
    {
      title: '〜なければなりません — zorunluluk',
      star: true,
      pattern: 'ない biçimi: 〜ない → 〜なければなりません',
      explain: '“…-mek zorundayım.” ない biçiminin い’si atılıp ければなりません eklenir. Konuşmada kısalır: 〜なきゃ.',
      examples: [
        { ja: '毎日くすりを飲まなければなりません。', kana: 'まいにちくすりをのまなければなりません。', tr: 'Her gün ilaç içmem gerekiyor.' },
        { ja: '明日は早く起きなければなりません。', kana: 'あしたははやくおきなければなりません。', tr: 'Yarın erken kalkmam gerekiyor.' },
      ],
      ref: 'ja-nakereba',
    },
    {
      title: '〜たことがあります — deneyim',
      pattern: 'た biçimi + ことがあります',
      explain: '“…-mişliğim var, daha önce …-dim.” Olumsuz cevap: 一度もありません (hiç yok).',
      examples: [
        { ja: '日本に行ったことがあります。', kana: 'にほんにいったことがあります。', tr: 'Japonya’ya gittim (daha önce).' },
        { ja: 'すしを食べたことがありますか。— いいえ、一度もありません。', kana: 'すしをたべたことがありますか。— いいえ、いちどもありません。', tr: 'Hiç suşi yedin mi? — Hayır, hiç yemedim.' },
      ],
      ref: 'ja-koto-ga-aru',
    },
    {
      title: '〜つもりです — plan',
      pattern: 'sözlük biçimi + つもりです',
      explain: '“…-meyi planlıyorum.” Olumsuz plan: ない biçimi + つもりです.',
      examples: [
        { ja: '来年、日本に行くつもりです。', kana: 'らいねん、にほんにいくつもりです。', tr: 'Gelecek yıl Japonya’ya gitmeyi planlıyorum.' },
        { ja: '今日は出かけないつもりです。', kana: 'きょうはでかけないつもりです。', tr: 'Bugün dışarı çıkmamayı düşünüyorum.' },
      ],
      ref: 'ja-tsumori',
    },
  ],

  rules: [
    {
      title: 'Nerem ağrıyor: 〜がいたいです',
      star: true,
      body:
        'いたい “ağrıyan”. Vücut kelimesi + が + いたいです: あたまがいたいです, 目がいたいです, 足がいたいです. N5 dinlemesinde doktor sahnesi klasik: nerenin ağrıdığını ve ne yapması (ya da yapmaması) gerektiğini sorar.',
    },
    {
      title: 'たい mı ほしい mı',
      body:
        'Fiil istiyorsan たい (水を飲みたい), nesne istiyorsan ほしい (水がほしい). İkisi de yalnızca KENDİ isteğin için; başkası için N4’te başka biçim öğrenilir.',
    },
  ],

  vocab: [
    { ja: '口', kana: 'くち', tr: 'ağız' },
    { star: true, ja: '目', kana: 'め', tr: 'göz' },
    { ja: '耳', kana: 'みみ', tr: 'kulak' },
    { ja: '足', kana: 'あし', tr: 'ayak, bacak' },
    { star: true, ja: '手', kana: 'て', tr: 'el' },
    { ja: '力', kana: 'ちから', tr: 'güç, kuvvet' },
    { ja: 'あたま', kana: 'あたま', tr: 'baş, kafa' },
    { ja: 'おなか', kana: 'おなか', tr: 'karın' },
    { star: true, ja: 'いたい', kana: 'いたい', tr: 'ağrıyan, acıyan' },
    { star: true, ja: 'くすり', kana: 'くすり', tr: 'ilaç' },
    { ja: '病気', kana: 'びょうき', tr: 'hastalık, hasta' },
    { ja: 'かぜ', kana: 'かぜ', tr: 'soğuk algınlığı' },
    { ja: 'ねつ', kana: 'ねつ', tr: 'ateş (vücut)' },
    { star: true, ja: 'ほしい', kana: 'ほしい', tr: 'istenen (bir şeyi istemek)' },
    { ja: '一度', kana: 'いちど', tr: 'bir kez' },
    { ja: '外国', kana: 'がいこく', tr: 'yabancı ülke, yurt dışı' },
    { ja: '来年', kana: 'らいねん', tr: 'gelecek yıl' },
    { ja: '元気', kana: 'げんき', tr: 'sağlıklı, iyi' },
  ],

  text: {
    title: 'びょういんで — Hastanede',
    intro: 'Efe kendini iyi hissetmiyor ve doktora gidiyor. Bir hafta sonra arkadaşı Yuki ile konuşuyor.',
    lines: [
      { ja: 'いしゃ：今日はどうしましたか。', kana: 'いしゃ：きょうはどうしましたか。', tr: 'Doktor: Bugün şikâyetiniz ne?' },
      { ja: 'エフェ：あたまがいたいです。ねつもあります。', kana: 'エフェ：あたまがいたいです。ねつもあります。', tr: 'Efe: Başım ağrıyor. Ateşim de var.' },
      { ja: 'いしゃ：かぜですね。このくすりを一日三かい飲まなければなりません。', kana: 'いしゃ：かぜですね。このくすりをいちにちさんかいのまなければなりません。', tr: 'Doktor: Soğuk algınlığı. Bu ilacı günde üç kez içmeniz gerekiyor.' },
      { ja: 'いしゃ：今日はおふろに入らないでください。', kana: 'いしゃ：きょうはおふろにはいらないでください。', tr: 'Doktor: Bugün banyo yapmayın.' },
      { ja: 'エフェ：学校に行ってもいいですか。', kana: 'エフェ：がっこうにいってもいいですか。', tr: 'Efe: Okula gidebilir miyim?' },
      { ja: 'いしゃ：二日ぐらい休んでください。', kana: 'いしゃ：ふつかぐらいやすんでください。', tr: 'Doktor: İki gün kadar dinlenin.' },
      { ja: 'ゆき：エフェさん、もう元気？', kana: 'ゆき：エフェさん、もうげんき？', tr: 'Yuki: Efe, artık iyi misin?' },
      { ja: 'エフェ：うん、もう元気だよ。ゆきさんは外国に行ったことがある？', kana: 'エフェ：うん、もうげんきだよ。ゆきさんはがいこくにいったことがある？', tr: 'Efe: Evet, artık iyiyim. Yuki, hiç yurt dışına gittin mi?' },
      { ja: 'ゆき：ないよ。でも、来年トルコに行くつもり。新しいカメラがほしいな。', kana: 'ゆき：ないよ。でも、らいねんトルコにいくつもり。あたらしいカメラがほしいな。', tr: 'Yuki: Gitmedim. Ama gelecek yıl Türkiye’ye gitmeyi planlıyorum. Yeni bir fotoğraf makinesi istiyorum.' },
    ],
    questions: [
      mcq('u14-t1', 'Efe’nin şikâyeti ne?', ['Karnı ağrıyor', 'Başı ağrıyor ve ateşi var', 'Gözü ağrıyor', 'Ayağı ağrıyor'], 1),
      mcq('u14-t2', 'Doktor Efe’ye ne YAPMAMASINI söyledi?', ['İlaç içmemesini', 'Banyo yapmamasını', 'Uyumamasını', 'Yemek yememesini'], 1, 'おふろに入らないでください.'),
      mcq('u14-t3', 'Yuki gelecek yıl ne yapmayı planlıyor?', ['Japonya’da kalmayı', 'Türkiye’ye gitmeyi', 'Kamera satmayı', 'Doktor olmayı'], 1),
    ],
  },

  homework: [
    {
      id: 'u14-h1',
      title: 'Doktor diyaloğu',
      detail: 'Altı satırlık bir doktor diyaloğu yaz: şikâyet, doktorun tavsiyesi ve bir yasak.',
      minutes: 12,
      star: true,
      steps: [
        'Doktor sorar: 今日はどうしましたか.',
        'Hasta şikâyetini söyler: 〇〇がいたいです.',
        'Doktor teşhis koyar ve zorunluluğu söyler: 〜なければなりません.',
        'Doktor bir yasak söyler: 〜ないでください.',
        'Hasta izin ister: 〜てもいいですか (Ünite 9).',
      ],
      example: [
        { ja: 'おなかがいたいです。', kana: 'おなかがいたいです。', tr: 'Karnım ağrıyor.' },
        { ja: 'たくさん水を飲まなければなりません。', kana: 'たくさんみずをのまなければなりません。', tr: 'Bol su içmeniz gerekiyor.' },
        { ja: 'つめたいものを食べないでください。', kana: 'つめたいものをたべないでください。', tr: 'Soğuk şeyler yemeyin.' },
      ],
      tips: ['なければ: ない biçiminin い’si düşer → 飲まな + ければなりません.', 'ないでください: ない biçimi olduğu gibi kalır → 飲まないでください.'],
    },
    {
      id: 'u14-h2',
      title: 'Deneyimlerin',
      detail: 'Üç 〜たことがあります cümlesi ve bir “hiç yapmadım” cümlesi yaz.',
      minutes: 8,
      steps: [
        'Daha önce yaptığın üç şeyi seç: gittiğin yer, yediğin yemek, izlediğin film.',
        'Fiili た biçimine çevir, ことがあります ekle.',
        'Hiç yapmadığın bir şeyi soru-cevap olarak yaz: 〜たことがありますか — いいえ、一度もありません.',
      ],
      example: [
        { ja: 'ふじさんを見たことがあります。', kana: 'ふじさんをみたことがあります。', tr: 'Fuji Dağı’nı gördüm (daha önce).' },
      ],
      tips: ['“Dün gittim” için ことがある kullanılmaz; o sadece 行きました. ことがある hayat boyu deneyimdir.'],
    },
    {
      id: 'u14-h3',
      title: 'İstekler ve planlar',
      detail: 'İki 〜がほしいです ve iki 〜つもりです cümlesi yaz.',
      minutes: 8,
      steps: [
        'İstediğin iki NESNEYİ yaz: 〜がほしいです.',
        'İki planını yaz: sözlük biçimi + つもりです.',
        'Birini olumsuz plan yap: 〜ないつもりです.',
      ],
      example: [
        { ja: '日本語の本がほしいです。', kana: 'にほんごのほんがほしいです。', tr: 'Japonca bir kitap istiyorum.' },
        { ja: '十二月にN5を受けるつもりです。', kana: 'じゅうにがつにN5をうけるつもりです。', tr: 'Aralıkta N5’e girmeyi planlıyorum.' },
      ],
      tips: ['Nesne → ほしい, eylem → たい: 本がほしい / 本を読みたい.'],
    },
  ],

  test: [
    mcq(
      'u14-q1',
      '“Yeni bir çanta istiyorum.” hangisi?',
      ['新しいかばんがほしいです。', '新しいかばんをほしいです。', '新しいかばんがほしいたいです。', '新しいかばんを買いほしいです。'],
      0,
      'ほしい ile が.',
    ),
    mcq(
      'u14-q2',
      '“Lütfen burada sigara içmeyin.” hangisi?',
      ['ここでたばこをすわないでください。', 'ここでたばこをすってください。', 'ここでたばこをすわなければなりません。', 'ここでたばこをすいたくないです。'],
      0,
    ),
    mcq('u14-q3', '「飲まなければなりません」 ne demek?', ['İçmemelisin', 'İçmek zorundasın', 'İçebilirsin', 'İçmek istiyorum'], 1),
    mcq(
      'u14-q4',
      '“Hiç Japonya’ya gittin mi?” hangisi?',
      ['日本に行ったことがありますか。', '日本に行くことがありますか。', '日本に行ったつもりですか。', '日本に行ってもいいですか。'],
      0,
    ),
    mcq('u14-q5', '「行くつもりです」 ne demek?', ['Gitmeyi planlıyorum', 'Gittim', 'Gitmem gerekiyor', 'Gidebilirim'], 0),
    fill('u14-q6', 'あたま ___ いたいです。', ['が'], 'Başım ağrıyor.'),
    fill('u14-q7', '明日は早く起き ___ なりません。', ['なければ'], 'Yarın erken kalkmam gerekiyor.'),
    order('u14-q8', ['すしを', '食べた', 'ことが', 'あります'], 'Daha önce suşi yedim.'),
    translate(
      'u14-q9',
      'おふろに入らないでください。',
      ['banyo yapmayın', 'lütfen banyo yapmayın', 'banyoya girmeyin', 'lütfen banyoya girmeyin', 'banyo yapma'],
      'to-tr',
      'おふろにはいらないでください。',
    ),
    dict('u14-q10', '目がいたいです。', ['めがいたいです', 'me ga itai desu'], 'Gözüm ağrıyor.'),
  ],
}
