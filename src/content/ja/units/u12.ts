import { dict, fill, mcq, order, translate, type Unit } from './types'

// Ünite 12 — karşılaştırma, değişim ve tahmin.
// Hava durumu seçildi çünkü dört yapının dördü de doğal olarak orada
// geçiyor (より soğuk, 寒くなる, 雨でしょう, 一番 sıcak ay) ve hava durumu
// N5 dinlemesinin en sık konusu. Yön kanjileri (北南西) ve doğa kanjileri
// (天気雨山川空) başka hiçbir ünitede yoktu.

export const u12: Unit = {
  id: 'u12',
  no: 12,
  title: 'Hava ve karşılaştırma',
  subtitle: '天気 · より · 一番 · なる · でしょう',
  minutes: 60,
  canDo: [
    'Hava durumunu anlayabilmek ve anlatabilmek',
    'İki şeyi karşılaştırabilmek',
    '“En …” diyebilmek',
    'Bir değişimi anlatabilmek: “soğudu”, “usta oldu”',
    'Tahmin bildirebilmek: “yağmur yağacak herhâlde”',
  ],
  lessonIds: ['ja-g10', 'ja-g12'],

  grammar: [
    {
      title: 'A は B より 〜 — karşılaştırma',
      star: true,
      pattern: 'A は B より 〜です',
      explain:
        'より Türkçedeki “-den (daha)” ekidir ve karşılaştırılan şeyin ARKASINA gelir. Japoncada ayrıca “daha” kelimesi söylenmez; より yeter.',
      examples: [
        { ja: '今日は昨日より寒いです。', kana: 'きょうはきのうよりさむいです。', tr: 'Bugün dünden soğuk.' },
        { ja: '電車はバスより速いです。', kana: 'でんしゃはバスよりはやいです。', tr: 'Tren otobüsten hızlı.' },
      ],
      ref: 'ja-yori-hou',
    },
    {
      title: 'どちらが 〜 — ikisinden hangisi',
      pattern: 'A と B と どちらが 〜ですか → B のほうが 〜です',
      explain:
        'İki şey arasında soru どちら ile sorulur (üç ve fazlası için どれ). Cevapta tercih edilen taraf のほうが ile işaretlenir.',
      examples: [
        { ja: '山と川と、どちらが好きですか。', kana: 'やまとかわと、どちらがすきですか。', tr: 'Dağ mı nehir mi, hangisini seversin?' },
        { ja: '山のほうが好きです。', kana: 'やまのほうがすきです。', tr: 'Dağı daha çok severim.' },
      ],
      pitfall: 'İki şey arasında どれ değil どちら.',
      ref: 'ja-yori-hou',
    },
    {
      title: '〜の中で 〜が一番 — “en”',
      star: true,
      pattern: '〜の中で 〜が 一番 〜です',
      explain: '一番 (いちばん) “birinci, en” demek. Grup の中で ile verilir: “… içinde en …”.',
      examples: [
        { ja: '一年の中で八月が一番暑いです。', kana: 'いちねんのなかではちがつがいちばんあついです。', tr: 'Yıl içinde en sıcak ay ağustos.' },
        { ja: 'スポーツの中で何が一番好きですか。', kana: 'スポーツのなかでなにがいちばんすきですか。', tr: 'Sporlar içinde en çok hangisini seversin?' },
      ],
      ref: 'ja-ichiban',
    },
    {
      title: '〜くなる / 〜になる — değişim',
      pattern: 'い-sıfat: 〜く なります · な-sıfat / isim: 〜に なります',
      explain: '“…-leşmek, … olmak.” い-sıfatın い’si く olur; な-sıfat ve isimden sonra に gelir.',
      examples: [
        { ja: '寒くなりました。', kana: 'さむくなりました。', tr: 'Hava soğudu.' },
        { ja: '日本語が上手になりました。', kana: 'にほんごがじょうずになりました。', tr: 'Japoncam ilerledi.' },
      ],
      pitfall: 'いい → よくなる. いくなる diye bir biçim yok.',
      ref: 'ja-naru',
    },
    {
      title: '〜でしょう — tahmin',
      star: true,
      pattern: 'sade biçim + でしょう',
      explain:
        '“…dır herhâlde, … olacak.” Hava durumunun dilidir. İsim ve な-sıfattan sonra だ düşer: 雨でしょう. Soru tonuyla (でしょう？) “değil mi?” anlamı da taşır.',
      examples: [
        { ja: '明日は雨でしょう。', kana: 'あしたはあめでしょう。', tr: 'Yarın yağmur yağacak.' },
        { ja: '北は寒いでしょう。', kana: 'きたはさむいでしょう。', tr: 'Kuzey soğuk olacak.' },
      ],
      ref: 'ja-deshou',
    },
  ],

  rules: [
    {
      title: 'Hava durumu kelimeleri',
      star: true,
      body:
        '晴れ (はれ) açık, くもり bulutlu, 雨 (あめ) yağmur, ゆき kar. Hava durumunda yön de geçer: 北 (きた) kuzey, 南 (みなみ) güney, 東 (ひがし) doğu, 西 (にし) batı. “Yarın Tokyo’da hava nasıl olacak?” N5 dinlemesinin klasik sorusudur.',
    },
    {
      title: '多い・少ない isimden önce gelmez',
      body:
        '“Çok insan” derken 多い人 denmez; 人が多いです (insan çok) denir. 多い ve 少ない yüklem olarak kullanılır. İsmin önünde たくさんの ya da 大勢の gelir.',
    },
  ],

  vocab: [
    { star: true, ja: '天気', kana: 'てんき', tr: 'hava (durumu)' },
    { star: true, ja: '雨', kana: 'あめ', tr: 'yağmur' },
    { ja: '晴れ', kana: 'はれ', tr: 'açık hava' },
    { ja: 'くもり', kana: 'くもり', tr: 'bulutlu' },
    { ja: '空', kana: 'そら', tr: 'gökyüzü' },
    { ja: '山', kana: 'やま', tr: 'dağ' },
    { ja: '川', kana: 'かわ', tr: 'nehir' },
    { ja: '白い', kana: 'しろい', tr: 'beyaz' },
    { ja: '長い', kana: 'ながい', tr: 'uzun' },
    { ja: '多い', kana: 'おおい', tr: 'çok (sayıca)' },
    { ja: '少ない', kana: 'すくない', tr: 'az' },
    { ja: '北', kana: 'きた', tr: 'kuzey' },
    { ja: '南', kana: 'みなみ', tr: 'güney' },
    { ja: '西', kana: 'にし', tr: 'batı' },
    { ja: 'すずしい', kana: 'すずしい', tr: 'serin' },
    { star: true, ja: '一番', kana: 'いちばん', tr: 'en, birinci' },
    { star: true, ja: 'どちら', kana: 'どちら', tr: '(ikisinden) hangisi' },
    { ja: 'なつ', kana: 'なつ', tr: 'yaz' },
  ],

  text: {
    title: '天気よほう — Hava durumu',
    intro: 'Televizyonda yarının hava durumu, ardından Efe ile Tanaka’nın kısa konuşması.',
    lines: [
      { ja: 'アナウンサー：明日の天気です。', kana: 'アナウンサー：あしたのてんきです。', tr: 'Spiker: Yarının hava durumu.' },
      { ja: 'アナウンサー：北はゆきで、とても寒くなるでしょう。', kana: 'アナウンサー：きたはゆきで、とてもさむくなるでしょう。', tr: 'Spiker: Kuzeyde kar var; hava çok soğuyacak.' },
      { ja: 'アナウンサー：東京は晴れですが、午後から雨がふるでしょう。', kana: 'アナウンサー：とうきょうははれですが、ごごからあめがふるでしょう。', tr: 'Spiker: Tokyo açık, ama öğleden sonra yağmur yağacak.' },
      { ja: 'アナウンサー：南は今日より少しあたたかいでしょう。', kana: 'アナウンサー：みなみはきょうよりすこしあたたかいでしょう。', tr: 'Spiker: Güney bugünden biraz daha ılık olacak.' },
      { ja: '田中：明日は雨ですね。山に行くのはやめましょう。', kana: 'たなか：あしたはあめですね。やまにいくのはやめましょう。', tr: 'Tanaka: Yarın yağmurlu. Dağa gitmekten vazgeçelim.' },
      { ja: 'エフェ：そうですね。山と川と、どちらが好きですか。', kana: 'エフェ：そうですね。やまとかわと、どちらがすきですか。', tr: 'Efe: Haklısın. Dağ mı nehir mi, hangisini seversin?' },
      { ja: '田中：山のほうが好きです。空がきれいですから。', kana: 'たなか：やまのほうがすきです。そらがきれいですから。', tr: 'Tanaka: Dağı daha çok severim. Gökyüzü güzel olduğu için.' },
      { ja: 'エフェ：わたしは一年の中でなつが一番好きです。', kana: 'エフェ：わたしはいちねんのなかでなつがいちばんすきです。', tr: 'Efe: Ben yılın içinde en çok yazı severim.' },
      { ja: '田中：トルコのなつは日本より長いですか。', kana: 'たなか：トルコのなつはにほんよりながいですか。', tr: 'Tanaka: Türkiye’de yaz Japonya’dakinden uzun mu?' },
    ],
    questions: [
      mcq('u12-t1', 'Yarın Tokyo’da hava nasıl olacak?', ['Bütün gün yağmurlu', 'Açık, öğleden sonra yağmurlu', 'Karlı', 'Bulutlu'], 1),
      mcq('u12-t2', 'Kuzeyde ne olacak?', ['Kar; hava çok soğuyacak', 'Ilık olacak', 'Açık olacak', 'Rüzgâr esecek'], 0),
      mcq('u12-t3', 'Tanaka dağı neden seviyor?', ['Serin olduğu için', 'Gökyüzü güzel olduğu için', 'Yakın olduğu için', 'Sessiz olduğu için'], 1),
    ],
  },

  homework: [
    {
      id: 'u12-h1',
      title: 'Kendi şehrinin hava durumu',
      detail: 'Spiker gibi dört cümlelik bir hava durumu yaz: şehrinin kuzeyi, güneyi ve yarın için tahmin.',
      minutes: 10,
      star: true,
      steps: [
        'Başlık cümlesi: 明日の天気です.',
        'İki yön seç (北, 南, 東, 西) ve her biri için havayı yaz.',
        'Her cümleyi でしょう ile bitir — tahmin olduğu için.',
        'Bir cümlede değişim kullan: 寒くなるでしょう.',
      ],
      example: [
        { ja: '北は雨でしょう。', kana: 'きたはあめでしょう。', tr: 'Kuzeyde yağmur yağacak.' },
        { ja: '南は晴れて、あつくなるでしょう。', kana: 'みなみははれて、あつくなるでしょう。', tr: 'Güney açık olacak ve ısınacak.' },
      ],
      tips: ['İsimden sonra だ gelmez: 雨でしょう (雨だでしょう yanlış).', 'Hava durumu dinlerken önce YÖNÜ yakala, sonra havayı.'],
    },
    {
      id: 'u12-h2',
      title: 'Karşılaştır',
      detail: 'Üç より cümlesi, iki どちら soru-cevabı ve bir 一番 cümlesi yaz.',
      minutes: 12,
      steps: [
        'İki şehir, iki yemek ya da iki mevsim seç.',
        'より cümlesi: A は B より 〜です.',
        'Soru: A と B と どちらが 〜ですか — cevap: 〜のほうが 〜です.',
        'Son olarak bir grup seç ve 〜の中で 〜が一番 ile “en”i söyle.',
      ],
      example: [
        { ja: 'イスタンブールはアンカラより大きいです。', kana: 'イスタンブールはアンカラよりおおきいです。', tr: 'İstanbul Ankara’dan büyük.' },
        { ja: 'コーヒーとお茶と、どちらが好きですか。', kana: 'コーヒーとおちゃと、どちらがすきですか。', tr: 'Kahve mi çay mı, hangisini seversin?' },
      ],
      tips: ['İki şey: どちら. Üç ve fazlası: どれ ya da 何.'],
    },
    {
      id: 'u12-h3',
      title: 'Değişimi anlat',
      detail: 'Son bir yılda değişen dört şeyi 〜くなりました / 〜になりました ile yaz.',
      minutes: 8,
      steps: [
        'Değişen şeyleri düşün: hava, Japoncan, bir fiyat, bir arkadaşın.',
        'い-sıfat: い → く + なりました.',
        'な-sıfat ve isim: に + なりました.',
      ],
      example: [
        { ja: '日本語が上手になりました。', kana: 'にほんごがじょうずになりました。', tr: 'Japoncam ilerledi.' },
        { ja: 'コーヒーが高くなりました。', kana: 'コーヒーがたかくなりました。', tr: 'Kahve pahalandı.' },
      ],
      tips: ['いい → よくなりました (いくなりました yok).'],
    },
  ],

  test: [
    mcq(
      'u12-q1',
      '“Bugün dünden soğuk.” hangisi?',
      ['今日は昨日より寒いです。', '昨日は今日より寒いです。', '今日より昨日は寒いです。', '今日は昨日が寒いです。'],
      0,
      'より karşılaştırılan şeyin (dün) arkasına gelir.',
    ),
    mcq('u12-q2', '「いい」 + なる nasıl olur?', ['よくなる', 'いくなる', 'いいになる', 'よいになる'], 0),
    mcq('u12-q3', '「しずか」 + なる nasıl olur?', ['しずかになる', 'しずかくなる', 'しずかなる', 'しずかいなる'], 0),
    mcq('u12-q4', '「明日は雨でしょう」 ne demek?', ['Yarın yağmur yağdı', 'Yarın herhâlde yağmur yağacak', 'Yarın yağmur yağmasın', 'Yarın yağmur yağıyor mu?'], 1),
    mcq('u12-q5', 'İki şey için “Hangisi daha büyük?”', ['どちらが大きいですか。', 'どれが大きいですか。', '何が大きいですか。', 'だれが大きいですか。'], 0),
    fill('u12-q6', '家族の中で兄が ___ 高いです。', ['一番', 'いちばん'], 'Ailede en uzun ağabeyim.'),
    fill('u12-q7', 'バス ___ 電車のほうがはやいです。', ['より'], 'Tren otobüsten hızlı.'),
    order('u12-q8', ['山', 'の', 'ほうが', '好きです'], 'Dağı daha çok severim.'),
    translate(
      'u12-q9',
      '北は寒いでしょう。',
      ['kuzey soğuk olacak', 'kuzeyde hava soğuk olacak', 'kuzey herhalde soğuk olacak', 'kuzeyde soğuk olacak', 'kuzey soğuk olur'],
      'to-tr',
      'きたはさむいでしょう。',
    ),
    dict('u12-q10', '明日は雨でしょう。', ['あしたはあめでしょう', 'ashita wa ame deshou'], 'Yarın yağmur yağacak.'),
  ],
}
