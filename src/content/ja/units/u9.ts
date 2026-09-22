import { dict, fill, mcq, order, translate, type Unit } from './types'

export const u9: Unit = {
  id: 'u9',
  no: 9,
  title: 'Rica ve izin — て formu',
  subtitle: 'てください · てもいいです · ています',
  minutes: 60,
  canDo: [
    'Kibarca rica edebilmek',
    'İzin isteyebilmek ve verebilmek',
    'Şu an olan bir şeyi anlatabilmek',
    'Yasak olanı söyleyebilmek',
  ],
  lessonIds: ['ja-g6', 'ja-g7'],

  grammar: [
    {
      title: 'て formu nasıl kurulur',
      star: true,
      pattern: 'ます biçiminden て biçimine',
      explain:
        'て formu Japoncanın kalbidir; birçok yapı onun üstüne kurulur. ます biçiminin kökü esas alınır: い/ち/り → って, み/び/に → んで, き → いて, ぎ → いで, し → して.',
      examples: [
        { ja: '買います → 買って', kana: 'かいます → かって', tr: 'satın almak' },
        { ja: '読みます → 読んで', kana: 'よみます → よんで', tr: 'okumak' },
        { ja: '書きます → 書いて', kana: 'かきます → かいて', tr: 'yazmak' },
        { ja: '食べます → 食べて', kana: 'たべます → たべて', tr: 'yemek (ru-fiil)' },
      ],
      pitfall: '行きます düzensizdir: 行いて değil 行って (いって).',
      ref: 'ja-te-form',
    },
    {
      title: '〜てください — rica',
      star: true,
      pattern: 'V-て + ください',
      explain: 'Kibarca bir şey istemenin en yaygın yolu. Emir değil, rica bildirir.',
      examples: [
        { ja: 'ちょっと待ってください。', kana: 'ちょっとまってください。', tr: 'Biraz bekleyin lütfen.' },
        { ja: '名前を書いてください。', kana: 'なまえをかいてください。', tr: 'Adınızı yazın lütfen.' },
      ],
      ref: 'ja-te-form',
    },
    {
      title: '〜てもいいです — izin',
      pattern: 'V-て + もいいです（か）',
      explain: '“…-ebilir miyim” ya da “…-ebilirsin” demektir. Soru hâli izin istemek için kullanılır.',
      examples: [
        { ja: 'ここに座ってもいいですか。', kana: 'ここにすわってもいいですか。', tr: 'Buraya oturabilir miyim?' },
        { ja: 'はい、いいですよ。', kana: 'はい、いいですよ。', tr: 'Evet, olur.' },
      ],
      ref: 'ja-te-permission',
    },
    {
      title: '〜てはいけません — yasak',
      pattern: 'V-て + はいけません',
      explain: '“…-mamalısın, yasak” demektir. Levhalarda ve kurallarda görülür.',
      examples: [
        { ja: 'ここで写真をとってはいけません。', kana: 'ここでしゃしんをとってはいけません。', tr: 'Burada fotoğraf çekilemez.' },
      ],
      ref: 'ja-te-permission',
    },
    {
      title: '〜ています — şu an süren eylem',
      pattern: 'V-て + います',
      explain:
        'Şu anda olan işi anlatır. Bazı fiillerde ise SÜREGELEN DURUM bildirir: 結婚しています “evli”, 住んでいます “yaşıyor”.',
      examples: [
        { ja: '今、日本語をべんきょうしています。', kana: 'いま、にほんごをべんきょうしています。', tr: 'Şu an Japonca çalışıyorum.' },
        { ja: '東京に住んでいます。', kana: 'とうきょうにすんでいます。', tr: 'Tokyo’da yaşıyorum.' },
      ],
      pitfall: '結婚しています “evleniyor” değil “evli” demektir.',
      ref: 'ja-teiru',
    },
  ],

  rules: [
    {
      title: 'て formu neden bu kadar önemli',
      star: true,
      body:
        'Bu ünitedeki dört yapı da aynı kökten çıkıyor: てください, てもいいです, てはいけません, ています. Ayrıca cümleleri birbirine bağlamak için de kullanılır: 朝起きて、ご飯を食べて、学校へ行きます. Bir kez oturursa N5’in kalanı kolaylaşır.',
    },
    {
      title: 'Gruplara göre kural',
      star: true,
      body:
        'ru-fiillerde (食べます, 見ます) kolay: ます yerine て. u-fiillerde son heceye bakılır. Düzensiz olan yalnızca üç tane: します → して, 来ます → 来て, 行きます → 行って.',
    },
  ],

  vocab: [
    { star: true, ja: '待ちます', kana: 'まちます', tr: 'beklemek' },
    { star: true, ja: '書きます', kana: 'かきます', tr: 'yazmak' },
    { ja: '読みます', kana: 'よみます', tr: 'okumak' },
    { ja: '座ります', kana: 'すわります', tr: 'oturmak' },
    { ja: '立ちます', kana: 'たちます', tr: 'ayağa kalkmak' },
    { ja: '使います', kana: 'つかいます', tr: 'kullanmak' },
    { ja: '住みます', kana: 'すみます', tr: 'yaşamak, ikamet etmek' },
    { ja: '結婚します', kana: 'けっこんします', tr: 'evlenmek' },
    { ja: '写真', kana: 'しゃしん', tr: 'fotoğraf' },
    { star: true, ja: 'ちょっと', kana: 'ちょっと', tr: 'biraz' },
    { ja: 'もう一度', kana: 'もういちど', tr: 'bir kez daha' },
    { ja: 'ゆっくり', kana: 'ゆっくり', tr: 'yavaşça' },
    { star: true, ja: 'すみません', kana: 'すみません', tr: 'affedersiniz, pardon' },
    { ja: 'いいですよ', kana: 'いいですよ', tr: 'olur, tabii' },
    { ja: 'だめです', kana: 'だめです', tr: 'olmaz' },
    { ja: '今', kana: 'いま', tr: 'şu an' },
  ],

  text: {
    title: '教室で — Sınıfta',
    intro: 'Ders sırasında geçen kısa bir konuşma. て formunun dört kullanımı da var.',
    lines: [
      { ja: '先生：では、名前を書いてください。', kana: 'せんせい：では、なまえをかいてください。', tr: 'Öğretmen: Şimdi adınızı yazın lütfen.' },
      { ja: 'エフェ：すみません、もう一度言ってください。', kana: 'えふぇ：すみません、もういちどいってください。', tr: 'Efe: Affedersiniz, bir kez daha söyler misiniz.' },
      { ja: '先生：名前です。ゆっくり書いてください。', kana: 'せんせい：なまえです。ゆっくりかいてください。', tr: 'Öğretmen: Adınız. Yavaşça yazın.' },
      { ja: 'エフェ：先生、えんぴつを使ってもいいですか。', kana: 'えふぇ：せんせい、えんぴつをつかってもいいですか。', tr: 'Efe: Hocam, kurşun kalem kullanabilir miyim?' },
      { ja: '先生：はい、いいですよ。', kana: 'せんせい：はい、いいですよ。', tr: 'Öğretmen: Evet, olur.' },
      { ja: 'エフェ：ここで写真をとってもいいですか。', kana: 'えふぇ：ここでしゃしんをとってもいいですか。', tr: 'Efe: Burada fotoğraf çekebilir miyim?' },
      { ja: '先生：いいえ、とってはいけません。', kana: 'せんせい：いいえ、とってはいけません。', tr: 'Öğretmen: Hayır, çekilmez.' },
      { ja: '田中：エフェさんは今、何をしていますか。', kana: 'たなか：えふぇさんはいま、なにをしていますか。', tr: 'Tanaka: Efe şu an ne yapıyor?' },
      { ja: 'エフェ：日本語をべんきょうしています。', kana: 'えふぇ：にほんごをべんきょうしています。', tr: 'Efe: Japonca çalışıyorum.' },
    ],
    questions: [
      mcq('u9-t1', 'Öğretmen ne yapmasını istedi?', ['Oturmasını', 'Adını yazmasını', 'Kitabı okumasını', 'Beklemesini'], 1),
      mcq('u9-t2', 'Fotoğraf çekmek serbest mi?', ['Evet', 'Hayır', 'Sadece dışarıda', 'Söylenmiyor'], 1, 'とってはいけません = yasak.'),
      mcq('u9-t3', '「べんきょうしています」 ne anlatıyor?', ['Geçmişte çalıştı', 'Şu an çalışıyor', 'Çalışacak', 'Çalışmak istiyor'], 1),
    ],
  },

  homework: [
    {
      id: 'u9-h1',
      title: 'On fiili て formuna çevir',
      detail:
        'Şunları て formuna çevir: 買います, 読みます, 書きます, 待ちます, 食べます, 見ます, 話します, 行きます, 来ます, します. Son üçünün düzensiz olduğunu unutma.',
      minutes: 12,
      star: true,
      steps: [
        'Fiilleri alt alta yaz, yanlarında ます hâllerini bırak.',
        'ます’ten önceki heceye bak: い・ち・り ise って olur (買います → 買って).',
        'み・に・び ise んで olur (読みます → 読んで); き → いて, ぎ → いで.',
        'し ise して olur (話します → 話して).',
        'Düzensizleri ezberle: 行きます → 行って, 来ます → 来て, します → して.',
        'Bitince listeyi kapat ve on fiili ezberden söyle.',
      ],
      example: [
        { ja: '買います → 買って', kana: 'かいます → かって', tr: 'almak → alıp (い → って)' },
        { ja: '読みます → 読んで', kana: 'よみます → よんで', tr: 'okumak → okuyup (み → んで)' },
        { ja: '行きます → 行って', kana: 'いきます → いって', tr: 'gitmek → gidip. Düzensiz: 行いて DEĞİL.' },
      ],
      tips: [
        'Ezber kolaylığı: い・ち・り → って, み・に・び → んで, き → いて, し → して.',
        '行く kurala uymaz; き ile bitse de 行って olur. En sık yapılan hata budur.',
        'て formu tek başına cümle bitirmez; arkasına ください, もいいです ya da います gelir.',
      ],
    },
    {
      id: 'u9-h2',
      title: 'Üç rica, üç izin',
      detail:
        'Günlük hayattan üç rica (〜てください) ve üç izin sorusu (〜てもいいですか) yaz. Gerçekten kullanabileceğin cümleler olsun.',
      minutes: 10,
      steps: [
        'Gerçekten söyleyeceğin üç ricayı önce Türkçe yaz.',
        'Fiilleri て formuna çevir, sonuna ください ekle.',
        'Üç izin sorusu kur: て formu + もいいですか.',
        'Her ricanın başına すみません koy — kibarlık bununla tamamlanır.',
      ],
      example: [
        { ja: 'ちょっと待ってください。', kana: 'ちょっとまってください。', tr: 'Biraz bekleyin lütfen.' },
        { ja: 'もう一度言ってください。', kana: 'もういちどいってください。', tr: 'Bir daha söyleyin lütfen.' },
        { ja: 'ここに座ってもいいですか。', kana: 'ここにすわってもいいですか。', tr: 'Buraya oturabilir miyim?' },
      ],
      tips: [
        'Cevap: はい、いいですよ (olur) ya da いいえ、だめです (olmaz).',
        'Yasak için 〜てはいけません: ここで写真をとってはいけません。',
      ],
    },
    {
      id: 'u9-h3',
      title: 'Şu an ne yapıyorsun',
      detail:
        'Evdeki üç kişinin (ya da hayalî üç kişinin) şu an ne yaptığını 〜ています ile yaz.',
      minutes: 8,
      steps: [
        'Üç kişi seç ve şu an ne yaptıklarını Türkçe yaz.',
        'Fiili て formuna çevir, sonuna います ekle.',
        'Kişiyi は ile işaretle: 田中さんは〜ています。',
        'Bir cümlede 住んでいます kullan — bu süregelen bir durumu anlatır.',
      ],
      example: [
        { ja: '今、日本語をべんきょうしています。', kana: 'いま、にほんごをべんきょうしています。', tr: 'Şu an Japonca çalışıyorum.' },
        { ja: '東京に住んでいます。', kana: 'とうきょうにすんでいます。', tr: 'Tokyo’da yaşıyorum.' },
      ],
      tips: [
        '住んでいます “şu anda yaşıyor” değil, “ikamet ediyor” demektir — sürekli hâl.',
        'Soru biçimi: 何をしていますか。',
      ],
    },
  ],

  test: [
    mcq('u9-q1', '「行きます」 て formu nedir?', ['行きて', '行って', '行いて', '行んで'], 1, 'Düzensiz: いって.'),
    mcq('u9-q2', '「読みます」 て formu nedir?', ['読みて', '読んで', '読って', '読いて'], 1, 'み → んで.'),
    mcq('u9-q3', '「食べます」 て formu nedir?', ['食べて', '食べって', '食べんで', '食べいて'], 0, 'ru-fiil: ます yerine て.'),
    mcq('u9-q4', '“Buraya oturabilir miyim?” nasıl denir?', ['ここに座ってください。', 'ここに座ってもいいですか。', 'ここに座ってはいけません。', 'ここに座っています。'], 1),
    mcq('u9-q5', '「結婚しています」 ne demek?', ['Evleniyor', 'Evli', 'Evlenecek', 'Evlendi ve ayrıldı'], 1, 'Durum bildirir, eylem değil.'),
    fill('u9-q6', 'ちょっと待っ ___ ください。', ['て'], 'Biraz bekleyin lütfen.'),
    fill('u9-q7', '今、日本語をべんきょうし ___ います。', ['て'], 'Şu an Japonca çalışıyorum.'),
    order('u9-q8', ['名前', 'を', '書いて', 'ください'], 'Adınızı yazın lütfen.'),
    translate('u9-q9', 'ここで写真をとってはいけません。', ['burada fotoğraf çekilemez', 'burada fotoğraf çekmek yasak'], 'to-tr', 'ここでしゃしんをとってはいけません。'),
    dict('u9-q10', 'もう一度言ってください。', ['もういちどいってください', 'mou ichido itte kudasai'], 'Bir kez daha söyleyin.'),
  ],
}
