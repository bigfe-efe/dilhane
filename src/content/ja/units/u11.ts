import { dict, fill, mcq, order, translate, type Unit } from './types'

// Ünite 11 — N5 dilbilgisinin ikinci yarısının kapısı: sade biçim.
// N5 okuma metinleri ve arkadaş diyalogları sade biçimle yazılıyor; bunu
// tanımadan dinleme ve okumanın yarısı anlaşılmıyor. Konu olarak aile
// seçildi çünkü N5'in aile kanjileri (父母兄姉弟妹男子) hiçbir ünitede
// geçmiyordu ve aile N5 dinlemesinin sabit konularından biri.

export const u11: Unit = {
  id: 'u11',
  no: 11,
  title: 'Aile ve arkadaş dili',
  subtitle: '家族 · sade biçim · と思います',
  minutes: 60,
  canDo: [
    'Kendi aileni ve başkasının ailesini doğru kelimelerle anlatabilmek',
    'Arkadaşla sade biçimde konuşabilmek, sade biçimli metni anlayabilmek',
    '“Bence…” diye fikrini söyleyebilmek',
    '“…-meyi severim” diyebilmek',
  ],
  lessonIds: ['ja-g7', 'ja-g8', 'ja-g9'],

  grammar: [
    {
      title: 'Aile kelimeleri — kendi ailen ve başkasınınki',
      star: true,
      pattern: '父・母 ↔ お父さん・お母さん',
      explain:
        'Japonca aile kelimesinin İKİ takımı var. Kendi aileni başkasına anlatırken sade kelimeler: 父, 母, 兄, 姉, 弟, 妹. Başkasının ailesinden bahsederken (ya da kendi ailene seslenirken) saygılı takım: お父さん, お母さん, お兄さん, お姉さん, 弟さん, 妹さん.',
      examples: [
        { ja: '父は会社員です。', kana: 'ちちはかいしゃいんです。', tr: 'Babam şirkette çalışıyor.' },
        { ja: '田中さんのお父さんは先生です。', kana: 'たなかさんのおとうさんはせんせいです。', tr: 'Tanaka’nın babası öğretmen.' },
      ],
      pitfall: 'Dışarıda kendi annenden bahsederken お母さん demek çocuksu kaçar; 母 de.',
    },
    {
      title: 'Sade biçim (辞書形) — arkadaş dili',
      star: true,
      pattern: '食べます → 食べる · 行きます → 行く · です → だ',
      explain:
        'Anlamı ます biçimiyle aynı, yalnızca samimi. Arkadaş ve aile arasında, bir de yazılı metinlerde kullanılır. ru-fiil: ます yerine る (食べる, 見る). u-fiil: ます’tan önceki i-sesi u olur (行き → 行く, 飲み → 飲む, 話し → 話す). Düzensiz: します → する, 来ます → 来る.',
      examples: [
        { ja: '明日、何する？', kana: 'あした、なにする？', tr: 'Yarın ne yapıyorsun?' },
        { ja: '映画を見る。', kana: 'えいがをみる。', tr: 'Film izleyeceğim.' },
      ],
      ref: 'ja-plain-form',
    },
    {
      title: 'Sade olumsuz (ない形)',
      pattern: '食べない · 行かない · しない · 来ない',
      explain:
        'ru-fiil: る yerine ない (食べない). u-fiil: son hece a-sesine döner + ない (行く → 行かない, 飲む → 飲まない, 話す → 話さない). う ile bitenlerde あ değil わ gelir: 買う → 買わない.',
      examples: [
        { ja: '今日は学校に行かない。', kana: 'きょうはがっこうにいかない。', tr: 'Bugün okula gitmiyorum.' },
        { ja: '兄とはあまり話さない。', kana: 'あにとはあまりはなさない。', tr: 'Ağabeyimle pek konuşmam.' },
      ],
      pitfall: 'ある’nın olumsuzu あらない DEĞİL, sadece ない.',
      ref: 'ja-plain-form',
    },
    {
      title: 'Sade geçmiş (た形)',
      pattern: 'て → た · で → だ',
      explain: 'て formunu biliyorsan hazır: て yerine た, で yerine だ. 食べて → 食べた, 読んで → 読んだ, 行って → 行った.',
      examples: [
        { ja: '昨日、映画を見た。', kana: 'きのう、えいがをみた。', tr: 'Dün film izledim.' },
        { ja: '母と話した。', kana: 'ははとはなした。', tr: 'Annemle konuştum.' },
      ],
      ref: 'ja-plain-form',
    },
    {
      title: '〜と思います — “bence, sanırım”',
      pattern: 'sade biçim + と思います',
      explain:
        'Fikir ya da tahmin bildirir. と’dan önceki cümle SADE biçimde olur. İsim ve な-sıfattan sonra だ gelir: 雨だと思います.',
      examples: [
        { ja: '明日は雨だと思います。', kana: 'あしたはあめだとおもいます。', tr: 'Bence yarın yağmur yağacak.' },
        { ja: 'この本はおもしろいと思います。', kana: 'このほんはおもしろいとおもいます。', tr: 'Bence bu kitap ilginç.' },
      ],
      pitfall: '雨ですと思います yanlış: と’dan önce です değil だ.',
      ref: 'ja-to-omoimasu',
    },
  ],

  rules: [
    {
      title: '〜のが好きです — fiili sevmek',
      star: true,
      body:
        '“Okumayı severim” derken fiil sade biçime girer ve の ile isim olur: 本を読むのが好きです. Aynısı 上手 ve 下手 için: 料理を作るのが上手です. N5 dilbilgisi sorularında の’nun yeri sık sorulur.',
    },
    {
      title: 'Ne zaman sade, ne zaman ます?',
      body:
        'Öğretmen, yaşça büyük ya da tanımadığın biri: ます/です. Arkadaş, kardeş, yaşıt: sade biçim. N5’te sade biçimi ÜRETMEN beklenmez ama okuma metinlerinde ve arkadaş diyaloglarında ANLAMAN gerekir.',
    },
  ],

  vocab: [
    { star: true, ja: '家族', kana: 'かぞく', tr: 'aile' },
    { star: true, ja: '父', kana: 'ちち', tr: 'babam (kendi)' },
    { star: true, ja: '母', kana: 'はは', tr: 'annem (kendi)' },
    { ja: '兄', kana: 'あに', tr: 'ağabeyim' },
    { ja: '姉', kana: 'あね', tr: 'ablam' },
    { ja: '弟', kana: 'おとうと', tr: 'erkek kardeşim (küçük)' },
    { ja: '妹', kana: 'いもうと', tr: 'kız kardeşim (küçük)' },
    { ja: 'お父さん', kana: 'おとうさん', tr: '(birinin) babası', note: 'saygılı' },
    { ja: 'お母さん', kana: 'おかあさん', tr: '(birinin) annesi', note: 'saygılı' },
    { ja: '兄弟', kana: 'きょうだい', tr: 'kardeşler' },
    { ja: '男の子', kana: 'おとこのこ', tr: 'erkek çocuk' },
    { ja: '女の子', kana: 'おんなのこ', tr: 'kız çocuk' },
    { ja: '子ども', kana: 'こども', tr: 'çocuk' },
    { star: true, ja: '話します', kana: 'はなします', tr: 'konuşmak' },
    { star: true, ja: '思います', kana: 'おもいます', tr: 'düşünmek, sanmak' },
    { ja: '作ります', kana: 'つくります', tr: 'yapmak, hazırlamak' },
    { ja: '何人', kana: 'なんにん', tr: 'kaç kişi' },
  ],

  text: {
    title: 'わたしの家族 — Ailem',
    intro: 'Efe arkadaşı Yuki’ye ailesini anlatıyor. Arkadaş oldukları için sade biçim konuşuyorlar.',
    lines: [
      { ja: 'ゆき：エフェさんは何人家族？', kana: 'ゆき：エフェさんはなんにんかぞく？', tr: 'Yuki: Efe, ailen kaç kişi?' },
      { ja: 'エフェ：五人家族。父と母と姉と弟がいる。', kana: 'エフェ：ごにんかぞく。ちちとははとあねとおとうとがいる。', tr: 'Efe: Beş kişiyiz. Babam, annem, ablam ve erkek kardeşim var.' },
      { ja: 'ゆき：お父さんは何をしているの？', kana: 'ゆき：おとうさんはなにをしているの？', tr: 'Yuki: Baban ne iş yapıyor?' },
      { ja: 'エフェ：父は会社員だよ。母は高校の先生。', kana: 'エフェ：ちちはかいしゃいんだよ。はははこうこうのせんせい。', tr: 'Efe: Babam şirkette çalışıyor. Annem lise öğretmeni.' },
      { ja: 'ゆき：お姉さんは？', kana: 'ゆき：おねえさんは？', tr: 'Yuki: Ya ablan?' },
      { ja: 'エフェ：姉は大学生。うたをうたうのが好きだ。', kana: 'エフェ：あねはだいがくせい。うたをうたうのがすきだ。', tr: 'Efe: Ablam üniversite öğrencisi. Şarkı söylemeyi seviyor.' },
      { ja: 'ゆき：いいね。わたしは兄が一人いる。でも、あまり話さない。', kana: 'ゆき：いいね。わたしはあにがひとりいる。でも、あまりはなさない。', tr: 'Yuki: Ne güzel. Benim bir ağabeyim var. Ama pek konuşmayız.' },
      { ja: 'エフェ：どうして？', kana: 'エフェ：どうして？', tr: 'Efe: Neden?' },
      { ja: 'ゆき：兄は東京に住んでいる。いつもいそがしいと思う。', kana: 'ゆき：あにはとうきょうにすんでいる。いつもいそがしいとおもう。', tr: 'Yuki: Ağabeyim Tokyo’da yaşıyor. Sanırım hep meşgul.' },
    ],
    questions: [
      mcq('u11-t1', 'Efe’nin ailesi kaç kişi?', ['Üç', 'Dört', 'Beş', 'Altı'], 2, '五人家族 = beş kişilik aile.'),
      mcq('u11-t2', 'Efe’nin annesi ne iş yapıyor?', ['Şirkette çalışıyor', 'Lise öğretmeni', 'Üniversite öğrencisi', 'Doktor'], 1, '母は高校の先生.'),
      mcq(
        'u11-t3',
        'Yuki ağabeyiyle neden pek konuşmuyor?',
        ['Kavgalılar', 'Ağabeyi Tokyo’da yaşıyor ve hep meşgul', 'Ağabeyi yurt dışında', 'Konuşmayı sevmiyor'],
        1,
      ),
    ],
  },

  homework: [
    {
      id: 'u11-h1',
      title: 'Aileni tanıt',
      detail: 'Aileni beş cümleyle tanıt: kaç kişi olduğunuz, her birinin kim olduğu ve ne iş yaptığı.',
      minutes: 12,
      star: true,
      steps: [
        'İlk cümle: 〇人家族です (kaç kişilik aile).',
        'Kimlerin olduğunu say: 父と母と〇〇がいます.',
        'Her biri için bir cümle: 父は〇〇です — kendi ailen için 父・母・兄 kullan.',
        'Bir cümlede sevdikleri bir şeyi 〜のが好きです ile anlat.',
        'Sonra aynı metni bir arkadaşının ailesi için yaz: お父さん・お母さん takımına geç.',
      ],
      example: [
        { ja: '四人家族です。', kana: 'よにんかぞくです。', tr: 'Dört kişilik bir aileyiz.' },
        { ja: '父と母と妹がいます。', kana: 'ちちとははといもうとがいます。', tr: 'Babam, annem ve kız kardeşim var.' },
        { ja: '母は料理を作るのが上手です。', kana: 'はははりょうりをつくるのがじょうずです。', tr: 'Annem yemek yapmakta iyidir.' },
      ],
      tips: [
        '四人 よにん okunur (よんにん değil); 一人 ひとり, 二人 ふたり düzensiz.',
        'Aile üyesi canlı olduğu için います: 妹がいます.',
      ],
    },
    {
      id: 'u11-h2',
      title: 'Altı fiili sade biçime çevir',
      detail: '食べます, 飲みます, 行きます, 話します, 来ます, します — her birinin sözlük, ない ve た biçimini yaz.',
      minutes: 12,
      steps: [
        'Kâğıda dört sütun çiz: ます · sözlük · ない · た.',
        'Önce fiilin ru-fiil mi u-fiil mi olduğuna karar ver.',
        'Sözlük biçimi: ru → る; u → i-sesi u olur (飲み → 飲む).',
        'ない biçimi: ru → ない; u → a-sesi + ない (飲む → 飲まない).',
        'た biçimi: て formundaki て’yi た yap (飲んで → 飲んだ).',
        'します ve 来ます düzensiz: する・しない・した / 来る・来ない・来た.',
      ],
      example: [
        { ja: '飲みます → 飲む · 飲まない · 飲んだ', kana: 'のみます → のむ · のまない · のんだ', tr: 'içmek' },
        { ja: '来ます → 来る · 来ない · 来た', kana: 'きます → くる · こない · きた', tr: 'gelmek (düzensiz: く・こ・き)' },
      ],
      tips: [
        '来る’nın okunuşu her biçimde değişir: くる, こない, きた. En sık yapılan hata budur.',
        'ある’nın olumsuzu sadece ない.',
      ],
    },
    {
      id: 'u11-h3',
      title: '“Bence…” cümleleri',
      detail: 'Üç konuda fikrini 〜と思います ile yaz: bir yer, bir yemek ve yarının havası.',
      minutes: 8,
      steps: [
        'Fikrini önce sade bir cümle olarak yaz: この店は安い.',
        'Sonuna と思います ekle.',
        'İsim ya da な-sıfatla bitiyorsa araya だ koy: 雨だと思います.',
      ],
      example: [
        { ja: 'この店は安いと思います。', kana: 'このみせはやすいとおもいます。', tr: 'Bence bu dükkân ucuz.' },
        { ja: '明日はいい天気だと思います。', kana: 'あしたはいいてんきだとおもいます。', tr: 'Bence yarın hava güzel olacak.' },
      ],
      tips: ['い-sıfattan sonra だ gelmez: 安いだと思います yanlış.'],
    },
  ],

  test: [
    mcq('u11-q1', 'Başkasına kendi annenden bahsederken hangisi?', ['母', 'お母さん', 'お母', '母さま'], 0, 'Kendi ailen için sade takım.'),
    mcq('u11-q2', '「行きます」 sözlük biçimi nedir?', ['行く', '行る', '行う', '行きる'], 0, 'き → く.'),
    mcq('u11-q3', '「飲みます」 sade olumsuzu nedir?', ['飲まない', '飲みない', '飲むない', '飲めない'], 0, 'む → ま + ない.'),
    mcq('u11-q4', '「あります」 sade olumsuzu nedir?', ['ない', 'あらない', 'ありない', 'あるない'], 0),
    mcq(
      'u11-q5',
      '“Bence yarın yağmur yağacak.” hangisi doğru?',
      ['明日は雨だと思います。', '明日は雨ですと思います。', '明日は雨を思います。', '明日は雨が思います。'],
      0,
      'と’dan önce sade biçim: 雨だ.',
    ),
    fill('u11-q6', '本を読む ___ が好きです。', ['の'], 'Kitap okumayı severim.', undefined, 'Fiil の ile isim olur.'),
    fill('u11-q7', '昨日、映画を見 ___ 。', ['た'], 'Dün film izledim. (sade geçmiş)'),
    order('u11-q8', ['父', 'は', '会社員', 'です'], 'Babam şirkette çalışıyor.'),
    translate(
      'u11-q9',
      '田中さんのお父さんは先生です。',
      [
        'tanakanın babası öğretmen',
        'tanakanın babası öğretmendir',
        'tanaka beyin babası öğretmen',
        'tanaka beyin babası öğretmendir',
        'tanaka’nın babası öğretmen',
      ],
      'to-tr',
      'たなかさんのおとうさんはせんせいです。',
    ),
    dict('u11-q10', '五人家族です。', ['ごにんかぞくです', 'gonin kazoku desu'], 'Beş kişilik bir aileyiz.'),
  ],
}
