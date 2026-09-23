import { dict, fill, mcq, order, translate, type Unit } from './types'

// Ünite 13 — eylemleri zamana göre bağlamak.
// N5 okuma metinlerinin çoğu "birinin bir günü" biçiminde: sıralama
// kalıplarını (前に, 後で, てから, ながら) tanımadan olayların sırası
// çıkarılamıyor. Dinlemedeki "önce ne yapacak?" soruları da buna dayanıyor.

export const u13: Unit = {
  id: 'u13',
  no: 13,
  title: 'Günün akışı',
  subtitle: '前に · 後で · てから · ながら · たり · もう/まだ',
  minutes: 60,
  canDo: [
    'Eylemleri sırasıyla anlatabilmek: önce, sonra',
    'İki işi aynı anda yaptığını söyleyebilmek',
    '“… gibi şeyler yaptım” diye örnekleyebilmek',
    '“Artık yaptım / henüz yapmadım” diyebilmek',
  ],
  lessonIds: ['ja-g6', 'ja-g9', 'ja-g11'],

  grammar: [
    {
      title: '〜前に / 〜た後で — önce ve sonra',
      star: true,
      pattern: 'sözlük biçimi + 前に · た biçimi + 後で · isim + の前に / の後で',
      explain:
        '“…-meden önce” ve “…-dikten sonra”. Fiilin biçimi zamana göre değişir: 前に’den önce HEP sözlük biçimi, 後で’dan önce HEP た biçimi.',
      examples: [
        { ja: '寝る前に本を読みます。', kana: 'ねるまえにほんをよみます。', tr: 'Yatmadan önce kitap okurum.' },
        { ja: 'ご飯を食べた後で、テレビを見ます。', kana: 'ごはんをたべたあとで、テレビをみます。', tr: 'Yemek yedikten sonra televizyon izlerim.' },
      ],
      pitfall: '寝た前に yanlış: 前に’den önce fiil sözlük biçiminde kalır.',
    },
    {
      title: '〜てから — “…dikten sonra”',
      pattern: 'V-て + から',
      explain: 'Bir işi bitirip diğerine geçmek. 後で ile yakın; てから sırayı daha çok vurgular.',
      examples: [
        { ja: '手をあらってから、食べます。', kana: 'てをあらってから、たべます。', tr: 'Ellerimi yıkadıktan sonra yerim.' },
        { ja: 'うちに帰ってから、しゅくだいをします。', kana: 'うちにかえってから、しゅくだいをします。', tr: 'Eve döndükten sonra ödev yaparım.' },
      ],
    },
    {
      title: '〜ながら — aynı anda',
      pattern: 'ます kökü + ながら',
      explain: '“…-erek, …-irken.” İki eylem aynı anda. Asıl eylem SONDAKİDİR.',
      examples: [
        { ja: '音楽を聞きながら、べんきょうします。', kana: 'おんがくをききながら、べんきょうします。', tr: 'Müzik dinleyerek ders çalışırım.' },
        { ja: '話しながら歩きます。', kana: 'はなしながらあるきます。', tr: 'Konuşarak yürürüz.' },
      ],
      pitfall: '聞きます → 聞き + ながら. 聞くながら yanlış.',
    },
    {
      title: '〜たり〜たりします — örnekleme',
      pattern: 'た biçimi + り, た biçimi + り + します',
      explain: '“… gibi şeyler yaparım.” Tam liste değil, örnek verir. Sona mutlaka します gelir.',
      examples: [
        { ja: '日曜日は、そうじをしたり、買い物に行ったりします。', kana: 'にちようびは、そうじをしたり、かいものにいったりします。', tr: 'Pazar günleri temizlik yapmak, alışverişe gitmek gibi şeyler yaparım.' },
      ],
      ref: 'ja-tari',
    },
    {
      title: 'もう / まだ — artık ve henüz',
      star: true,
      pattern: 'もう V-ました · まだ V-ていません',
      explain: 'もう “artık, çoktan”: iş bitti. まだ “henüz”: iş bitmedi. “Henüz …madım” her zaman ていません ile söylenir.',
      examples: [
        { ja: 'もう昼ご飯を食べましたか。', kana: 'もうひるごはんをたべましたか。', tr: 'Öğle yemeğini yedin mi?' },
        { ja: 'いいえ、まだ食べていません。', kana: 'いいえ、まだたべていません。', tr: 'Hayır, henüz yemedim.' },
      ],
      pitfall: 'まだ食べませんでした yanlış; doğrusu まだ食べていません.',
      ref: 'ja-mou-mada',
    },
  ],

  rules: [
    {
      title: '〜に行きます — amaç',
      star: true,
      body:
        'ます kökü + に + 行きます / 来ます: “…-meye gitmek”. 買い物に行きます, コーヒーを飲みに行きます. N5 dilbilgisi sorularında boşluğa に gelen yer sık sorulur.',
    },
    {
      title: 'Yön: 右・左・外',
      body: '右 (みぎ) sağ, 左 (ひだり) sol, 外 (そと) dışarı, 中 (なか) içeri. 駅を出て、右に行きます. 外で待ちます. Dinlemede yol tarifi sorularının temeli.',
    },
  ],

  vocab: [
    { star: true, ja: '出ます', kana: 'でます', tr: 'çıkmak' },
    { star: true, ja: '入ります', kana: 'はいります', tr: 'girmek' },
    { star: true, ja: '時間', kana: 'じかん', tr: 'zaman; … saat (süre)' },
    { ja: '外', kana: 'そと', tr: 'dışarı' },
    { ja: '右', kana: 'みぎ', tr: 'sağ' },
    { ja: '左', kana: 'ひだり', tr: 'sol' },
    { ja: '火曜日', kana: 'かようび', tr: 'Salı' },
    { ja: '水曜日', kana: 'すいようび', tr: 'Çarşamba' },
    { ja: '木曜日', kana: 'もくようび', tr: 'Perşembe' },
    { star: true, ja: '聞きます', kana: 'ききます', tr: 'dinlemek; sormak' },
    { ja: '歩きます', kana: 'あるきます', tr: 'yürümek' },
    { ja: 'おふろ', kana: 'おふろ', tr: 'banyo (küvet)', note: 'おふろに入ります = banyo yapmak' },
    { ja: '昼ご飯', kana: 'ひるごはん', tr: 'öğle yemeği' },
    { ja: '晩ご飯', kana: 'ばんごはん', tr: 'akşam yemeği' },
    { ja: 'そうじ', kana: 'そうじ', tr: 'temizlik' },
    { ja: 'せんたく', kana: 'せんたく', tr: 'çamaşır' },
    { ja: 'もう', kana: 'もう', tr: 'artık, çoktan' },
    { ja: 'まだ', kana: 'まだ', tr: 'henüz, hâlâ' },
  ],

  text: {
    title: 'エフェの一日 — Efe’nin bir günü',
    intro: 'Efe salı gününü anlatıyor. Sıra bildiren kalıpların hepsi bu metinde.',
    lines: [
      { ja: '火曜日は、朝七時に起きます。', kana: 'かようびは、あさしちじにおきます。', tr: 'Salı günü sabah yedide kalkarım.' },
      { ja: 'かおをあらってから、朝ご飯を食べます。', kana: 'かおをあらってから、あさごはんをたべます。', tr: 'Yüzümü yıkadıktan sonra kahvaltı ederim.' },
      { ja: '八時にうちを出て、駅まで歩きます。', kana: 'はちじにうちをでて、えきまであるきます。', tr: 'Sekizde evden çıkıp istasyona kadar yürürüm.' },
      { ja: '電車の中で、音楽を聞きながら日本語の本を読みます。', kana: 'でんしゃのなかで、おんがくをききながらにほんごのほんをよみます。', tr: 'Trende müzik dinleyerek Japonca kitap okurum.' },
      { ja: 'じゅぎょうの前に、友だちとコーヒーを飲みに行きます。', kana: 'じゅぎょうのまえに、ともだちとコーヒーをのみにいきます。', tr: 'Dersten önce arkadaşımla kahve içmeye giderim.' },
      { ja: 'じゅぎょうの後で、としょかんで二時間べんきょうします。', kana: 'じゅぎょうのあとで、としょかんでにじかんべんきょうします。', tr: 'Dersten sonra kütüphanede iki saat ders çalışırım.' },
      { ja: 'うちに帰った後で、そうじをしたり、せんたくをしたりします。', kana: 'うちにかえったあとで、そうじをしたり、せんたくをしたりします。', tr: 'Eve döndükten sonra temizlik, çamaşır gibi işler yaparım.' },
      { ja: '寝る前に、おふろに入ります。', kana: 'ねるまえに、おふろにはいります。', tr: 'Yatmadan önce banyo yaparım.' },
      { ja: '今日のしゅくだいは、もうしました。でも、かんじのれんしゅうはまだしていません。', kana: 'きょうのしゅくだいは、もうしました。でも、かんじのれんしゅうはまだしていません。', tr: 'Bugünün ödevini yaptım bile. Ama kanji alıştırmasını henüz yapmadım.' },
    ],
    questions: [
      mcq('u13-t1', 'Efe kahvaltıdan önce ne yapıyor?', ['Yüzünü yıkıyor', 'Banyo yapıyor', 'Kahve içiyor', 'Yürüyor'], 0, 'かおをあらってから、朝ご飯を食べます.'),
      mcq('u13-t2', 'Trende ne yapıyor?', ['Uyuyor', 'Müzik dinleyerek kitap okuyor', 'Arkadaşıyla konuşuyor', 'Ödev yapıyor'], 1),
      mcq('u13-t3', 'Henüz yapmadığı şey ne?', ['Ödev', 'Kanji alıştırması', 'Temizlik', 'Çamaşır'], 1, 'まだしていません = henüz yapmadım.'),
    ],
  },

  homework: [
    {
      id: 'u13-h1',
      title: 'Günün sırası',
      detail: 'Kendi bir gününü altı cümleyle yaz. 前に, 後で ve てから her biri en az bir kez geçsin.',
      minutes: 12,
      star: true,
      steps: [
        'Günündeki altı işi sırasıyla Türkçe listele.',
        'Art arda iki işi てから ile bağla: 〜てから、〜ます.',
        'Bir cümlede 前に kullan — önündeki fiil sözlük biçiminde.',
        'Bir cümlede 後で kullan — önündeki fiil た biçiminde.',
        'Bitince fiil biçimlerini tek tek kontrol et.',
      ],
      example: [
        { ja: '朝ご飯を食べてから、うちを出ます。', kana: 'あさごはんをたべてから、うちをでます。', tr: 'Kahvaltı ettikten sonra evden çıkarım.' },
        { ja: '寝る前に、日本語を三十分べんきょうします。', kana: 'ねるまえに、にほんごをさんじゅっぷんべんきょうします。', tr: 'Yatmadan önce otuz dakika Japonca çalışırım.' },
      ],
      tips: ['前に ← sözlük biçimi (寝る), 後で ← た biçimi (食べた).', 'İsimden sonra の: じゅぎょうの前に, しごとの後で.'],
    },
    {
      id: 'u13-h2',
      title: 'Aynı anda',
      detail: 'Aynı anda yaptığın üç işi 〜ながら ile yaz.',
      minutes: 8,
      steps: [
        'İki eylem seç: biri arka planda (müzik dinlemek), biri asıl iş (ders çalışmak).',
        'Arka plandaki fiili ます köküne çevir ve ながら ekle.',
        'Asıl işi cümlenin sonuna koy.',
      ],
      example: [
        { ja: 'テレビを見ながら、晩ご飯を食べます。', kana: 'テレビをみながら、ばんごはんをたべます。', tr: 'Televizyon izleyerek akşam yemeği yerim.' },
      ],
      tips: ['ます kökü: 聞きます → 聞き, 見ます → 見.'],
    },
    {
      id: 'u13-h3',
      title: 'Hafta sonun',
      detail: 'Hafta sonu yaptıklarını 〜たり〜たりしました ile anlat; sonra iki もう / まだ soru-cevabı yaz.',
      minutes: 10,
      steps: [
        'İki etkinlik seç ve た biçimlerine り ekle.',
        'Sona しました koy (geçmiş).',
        'Bir soru yaz: もう〜ましたか.',
        'Bir “evet” (もう〜ました), bir “hayır” (まだ〜ていません) cevabı yaz.',
      ],
      example: [
        { ja: '土曜日は、映画を見たり、友だちに会ったりしました。', kana: 'どようびは、えいがをみたり、ともだちにあったりしました。', tr: 'Cumartesi film izlemek, arkadaşlarla buluşmak gibi şeyler yaptım.' },
        { ja: 'もうしゅくだいをしましたか。— まだしていません。', kana: 'もうしゅくだいをしましたか。— まだしていません。', tr: 'Ödevi yaptın mı? — Henüz yapmadım.' },
      ],
      tips: ['たり tek başına bırakılmaz; sonunda します / しました olmalı.'],
    },
  ],

  test: [
    mcq('u13-q1', '“Yatmadan önce” hangisi?', ['寝る前に', '寝た前に', '寝ます前に', '寝て前に'], 0),
    mcq('u13-q2', '“Yedikten sonra” hangisi?', ['食べた後で', '食べる後で', '食べて後で', '食べます後で'], 0),
    mcq('u13-q3', '「聞きながら」 hangi biçimden kurulur?', ['ます kökü', 'sözlük biçimi', 'て biçimi', 'た biçimi'], 0),
    mcq('u13-q4', '“Henüz yemedim.” hangisi?', ['まだ食べていません。', 'まだ食べませんでした。', 'もう食べていません。', 'まだ食べました。'], 0),
    mcq(
      'u13-q5',
      '「そうじをしたり、せんたくをしたりします」 ne anlatıyor?',
      ['Yalnızca temizlik yapıyor', 'Temizlik, çamaşır gibi işler yapıyor', 'Temizlik yaparken çamaşır yıkıyor', 'Temizlikten sonra çamaşır yıkayacak'],
      1,
    ),
    fill('u13-q6', '手をあらって ___ 、食べます。', ['から'], 'Ellerimi yıkadıktan sonra yerim.'),
    fill('u13-q7', 'コーヒーを飲み ___ 行きます。', ['に'], 'Kahve içmeye gidiyorum.'),
    order('u13-q8', ['駅を', '出て', '右に', '行きます'], 'İstasyondan çıkıp sağa giderim.'),
    translate(
      'u13-q9',
      'もう昼ご飯を食べましたか。',
      ['öğle yemeğini yedin mi', 'öğle yemeği yedin mi', 'öğle yemeğini yediniz mi', 'öğle yemeği yediniz mi', 'öğle yemeğini yedin mi artık'],
      'to-tr',
      'もうひるごはんをたべましたか。',
    ),
    dict('u13-q10', '寝る前におふろに入ります。', ['ねるまえにおふろにはいります', 'neru mae ni ofuro ni hairimasu'], 'Yatmadan önce banyo yaparım.'),
  ],
}
