import type { Ornek } from './basics'

/**
 * Ekler (助詞 joshi) — は, が, を, に, で, の…
 *
 * NEDEN AYRI BİR BAŞVURU: ekler ünitelere dağılmış hâlde öğretiliyor
 * (の 1. ünitede, に/で 5. ünitede, より 12. ünitede). Öğrenci "の ne demekti,
 * に ile で farkı neydi" diye döndüğünde tek bir yere bakabilmeli.
 *
 * TÜRKÇE KONUŞANIN AVANTAJI: Japonca ekler, Türkçe ekler gibi kelimenin
 * ARKASINA gelir; tek fark ayrı yazılmaları. 学校に = okul-a, 私の = ben-im.
 * Bu yüzden her ekin yanında önce Türkçe karşılığı veriliyor — anlamı oradan
 * kurmak, ezberlemekten hızlı.
 */

export interface EkKullanim {
  baslik: string
  aciklama?: string
  ornekler: Ornek[]
}

export interface Ek {
  id: string
  ek: string
  /** Latin okunuş — yazılışından farklıysa ayrıca belirtilir */
  okunus: string
  /** Türkçedeki en yakın karşılık */
  tr: string
  ozet: string
  kullanimlar: EkKullanim[]
  dikkat?: string
  star?: boolean
  /** Ekin öğretildiği ünite */
  unite?: string
}

export const EKLER: Ek[] = [
  {
    id: 'wa',
    ek: 'は',
    okunus: 'wa',
    tr: '…ise, …’e gelince (konu)',
    ozet: 'Cümlenin neyden bahsettiğini söyler. Türkçede tam karşılığı yok; “konuya gelince” diye düşün.',
    star: true,
    unite: 'u1',
    kullanimlar: [
      {
        baslik: 'Konu',
        ornekler: [
          { latin: 'watashi wa gakusei desu.', ja: '私は学生です。', kana: 'わたしはがくせいです。', tr: 'Ben öğrenciyim.' },
          { latin: 'kyou wa atsui desu.', ja: '今日は暑いです。', kana: 'きょうはあついです。', tr: 'Bugün hava sıcak.' },
        ],
      },
      {
        baslik: 'Karşılaştırma: “… ise”',
        aciklama: 'İki şeyi karşı karşıya koyarken ikisi de は alır.',
        ornekler: [
          { latin: 'niku wa tabemasu ga, sakana wa tabemasen.', ja: '肉は食べますが、魚は食べません。', kana: 'にくはたべますが、さかなはたべません。', tr: 'Et yerim ama balık yemem.' },
        ],
      },
    ],
    dikkat: 'Yazılışı は (ha) ama ek olunca “wa” okunur. Soru kelimeleri (だれ, 何, どこ) は almaz: だれは ✗ → だれが.',
  },
  {
    id: 'ga',
    ek: 'が',
    okunus: 'ga',
    tr: 'özne (yeni bilgi)',
    ozet: 'Eylemi yapanı ya da var olanı işaretler — özellikle ilk kez söylenen, yeni bir bilgiyse.',
    star: true,
    unite: 'u5',
    kullanimlar: [
      {
        baslik: 'Soru kelimesi ve cevabı',
        aciklama: '“Kim?” sorusunda da cevabında da が: bilinmeyen, yeni bilgi.',
        ornekler: [
          { latin: 'dare ga kimashita ka.', ja: 'だれが来ましたか。', kana: 'だれがきましたか。', tr: 'Kim geldi?' },
          { latin: 'tanaka-san ga kimashita.', ja: '田中さんが来ました。', kana: 'たなかさんがきました。', tr: 'Tanaka geldi.' },
        ],
      },
      {
        baslik: 'Var olan şey (あります・います)',
        ornekler: [{ latin: 'kouen ni neko ga imasu.', ja: '公園にねこがいます。', kana: 'こうえんにねこがいます。', tr: 'Parkta bir kedi var.' }],
      },
      {
        baslik: 'Sevmek, becermek, istemek',
        aciklama: '好き, きらい, 上手, 下手, ほしい, わかる nesnelerini が ile alır.',
        ornekler: [
          { latin: 'nihongo ga suki desu.', ja: '日本語が好きです。', kana: 'にほんごがすきです。', tr: 'Japoncayı severim.' },
          { latin: 'mizu ga hoshii desu.', ja: '水がほしいです。', kana: 'みずがほしいです。', tr: 'Su istiyorum.' },
        ],
      },
    ],
    dikkat: 'が bir de cümle bağlar ve “ama” demektir: 高いですが、おいしいです (Pahalı ama lezzetli). Aynı harf, iki ayrı iş.',
  },
  {
    id: 'o',
    ek: 'を',
    okunus: 'o',
    tr: '-i, -ı (nesne)',
    ozet: 'Eylemin kime/neye yapıldığını gösterir. Türkçedeki belirtme hâli eki.',
    star: true,
    unite: 'u3',
    kullanimlar: [
      {
        baslik: 'Nesne',
        ornekler: [
          { latin: 'pan o tabemasu.', ja: 'パンを食べます。', kana: 'パンをたべます。', tr: 'Ekmek yerim.' },
          { latin: 'hon o yomimasu.', ja: '本を読みます。', kana: 'ほんをよみます。', tr: 'Kitap okurum.' },
        ],
      },
      {
        baslik: 'Ayrılma ve içinden geçme',
        aciklama: 'Hareket fiilleriyle: bir yerden çıkmak (-den) ya da bir yerin içinden geçmek.',
        ornekler: [
          { latin: 'shichiji ni uchi o demasu.', ja: '七時にうちを出ます。', kana: 'しちじにうちをでます。', tr: 'Yedide evden çıkarım.' },
          { latin: 'kouen o arukimasu.', ja: '公園を歩きます。', kana: 'こうえんをあるきます。', tr: 'Parkta yürürüm.' },
        ],
      },
    ],
    dikkat: 'Yazılışı を (wo) ama “o” okunur. Yalnızca ek olarak kullanılır, kelimenin içinde geçmez.',
  },
  {
    id: 'no',
    ek: 'の',
    okunus: 'no',
    tr: '-in, -ın (tamlama)',
    ozet: 'İki ismi bağlar: “A’nın B’si”. Sahiplik de olabilir, tür de.',
    star: true,
    unite: 'u1',
    kullanimlar: [
      {
        baslik: 'Sahiplik: “A’nın B’si”',
        ornekler: [
          { latin: 'watashi no hon desu.', ja: '私の本です。', kana: 'わたしのほんです。', tr: 'Benim kitabım.' },
          { latin: 'tanaka-san no kaban desu.', ja: '田中さんのかばんです。', kana: 'たなかさんのかばんです。', tr: 'Tanaka’nın çantası.' },
        ],
      },
      {
        baslik: 'Tür, konu, yer: “A B’si”',
        aciklama: 'Türkçede ek almayan tamlamalarda da Japonca の ister.',
        ornekler: [
          { latin: 'nihongo no sensei desu.', ja: '日本語の先生です。', kana: 'にほんごのせんせいです。', tr: 'Japonca öğretmeni.' },
          { latin: 'akudenizu daigaku no gakusei desu.', ja: 'アクデニズ大学の学生です。', kana: 'アクデニズだいがくのがくせいです。', tr: 'Akdeniz Üniversitesi öğrencisiyim.' },
        ],
      },
      {
        baslik: 'Tek başına: “…’in olan”',
        ornekler: [{ latin: 'kore wa watashi no desu.', ja: 'これは私のです。', kana: 'これはわたしのです。', tr: 'Bu benimki.' }],
      },
      {
        baslik: 'Fiili isim yapma (Ünite 11)',
        ornekler: [{ latin: 'hon o yomu no ga suki desu.', ja: '本を読むのが好きです。', kana: 'ほんをよむのがすきです。', tr: 'Kitap okumayı severim.' }],
      },
    ],
    dikkat: '“Japonca öğretmeni” Türkçede tek ekle kurulur, Japoncada iki isim arasına の şart: 日本語先生 ✗ → 日本語の先生.',
  },
  {
    id: 'ni',
    ek: 'に',
    okunus: 'ni',
    tr: '-e, -de (zaman, varış, var olma)',
    ozet: 'En çok işi olan ek. Ortak noktası “bir noktaya”: zamanda bir an, yolda bir varış yeri, bir kişi.',
    star: true,
    unite: 'u3',
    kullanimlar: [
      {
        baslik: 'Belirli zaman: “-de”',
        ornekler: [{ latin: 'shichiji ni okimasu.', ja: '七時に起きます。', kana: 'しちじにおきます。', tr: 'Yedide kalkarım.' }],
      },
      {
        baslik: 'Varış yeri: “-e”',
        ornekler: [{ latin: 'gakkou ni ikimasu.', ja: '学校に行きます。', kana: 'がっこうにいきます。', tr: 'Okula giderim.' }],
      },
      {
        baslik: 'Var olma yeri: “-de” (います・あります)',
        ornekler: [{ latin: 'kyoushitsu ni sensei ga imasu.', ja: '教室に先生がいます。', kana: 'きょうしつにせんせいがいます。', tr: 'Sınıfta öğretmen var.' }],
      },
      {
        baslik: 'Kişiye: “-e”',
        ornekler: [
          { latin: 'tomodachi ni denwa shimasu.', ja: '友だちに電話します。', kana: 'ともだちにでんわします。', tr: 'Arkadaşıma telefon ederim.' },
          { latin: 'sensei ni aimasu.', ja: '先生に会います。', kana: 'せんせいにあいます。', tr: 'Öğretmenle buluşurum.' },
        ],
      },
      {
        baslik: 'Amaç: “-meye” (Ünite 13)',
        ornekler: [{ latin: 'kaimono ni ikimasu.', ja: '買い物に行きます。', kana: 'かいものにいきます。', tr: 'Alışverişe giderim.' }],
      },
    ],
    dikkat: 'Göreli zamanlar に ALMAZ: 今日, 明日, 昨日, 毎日, 今 — 明日に行きます ✗ → 明日行きます.',
  },
  {
    id: 'e',
    ek: 'へ',
    okunus: 'e',
    tr: '-e doğru (yön)',
    ozet: 'Gidilen yönü gösterir. Varış için に ile çoğu zaman yer değiştirebilir.',
    unite: 'u6',
    kullanimlar: [
      {
        baslik: 'Yön',
        ornekler: [
          { latin: 'nihon e ikimasu.', ja: '日本へ行きます。', kana: 'にほんへいきます。', tr: 'Japonya’ya giderim.' },
          { latin: 'uchi e kaerimasu.', ja: 'うちへ帰ります。', kana: 'うちへかえります。', tr: 'Eve dönerim.' },
        ],
      },
    ],
    dikkat: 'Yazılışı へ (he) ama ek olunca “e” okunur.',
  },
  {
    id: 'de',
    ek: 'で',
    okunus: 'de',
    tr: '-de (eylem yeri), ile (araç)',
    ozet: 'Eylemin yapıldığı yeri ya da neyle yapıldığını gösterir.',
    star: true,
    unite: 'u5',
    kullanimlar: [
      {
        baslik: 'Eylemin yeri: “-de”',
        ornekler: [{ latin: 'toshokan de benkyou shimasu.', ja: 'としょかんで勉強します。', kana: 'としょかんでべんきょうします。', tr: 'Kütüphanede ders çalışırım.' }],
      },
      {
        baslik: 'Araç, yöntem, dil: “ile”',
        ornekler: [
          { latin: 'basu de ikimasu.', ja: 'バスで行きます。', kana: 'バスでいきます。', tr: 'Otobüsle giderim.' },
          { latin: 'nihongo de hanashimasu.', ja: '日本語で話します。', kana: 'にほんごではなします。', tr: 'Japonca konuşurum.' },
        ],
      },
      {
        baslik: 'Toplam',
        ornekler: [{ latin: 'zenbu de roppyaku en desu.', ja: 'ぜんぶで六百円です。', kana: 'ぜんぶでろっぴゃくえんです。', tr: 'Hepsi toplam 600 yen.' }],
      },
    ],
    dikkat: 'Aynı yer iki eki de alabilir; fiil belirler: うちにいます (evdeyim — var olma) / うちで勉強します (evde çalışırım — eylem).',
  },
  {
    id: 'to',
    ek: 'と',
    okunus: 'to',
    tr: 've, ile',
    ozet: 'İsimleri bağlar (“ve”) ya da birlikte yapılanı gösterir (“ile”).',
    unite: 'u6',
    kullanimlar: [
      {
        baslik: '“ve” — tam liste',
        ornekler: [{ latin: 'pan to koohii o kudasai.', ja: 'パンとコーヒーをください。', kana: 'パンとコーヒーをください。', tr: 'Ekmek ve kahve lütfen.' }],
      },
      {
        baslik: '“ile” — birlikte',
        ornekler: [{ latin: 'tomodachi to eiga o mimasu.', ja: '友だちと映画を見ます。', kana: 'ともだちとえいがをみます。', tr: 'Arkadaşımla film izlerim.' }],
      },
      {
        baslik: 'Alıntı (Ünite 11)',
        ornekler: [{ latin: 'ashita wa ame da to omoimasu.', ja: '明日は雨だと思います。', kana: 'あしたはあめだとおもいます。', tr: 'Bence yarın yağmur yağacak.' }],
      },
    ],
    dikkat: 'と yalnızca İSİMLERİ bağlar. İki cümleyi “ve” ile bağlamak için て formu kullanılır (起きて、食べます).',
  },
  {
    id: 'mo',
    ek: 'も',
    okunus: 'mo',
    tr: 'de, da (dahi)',
    ozet: '“… de” — öncekine eklenen şey. は, が ve を’nun yerine geçer.',
    unite: 'u1',
    kullanimlar: [
      {
        baslik: '“de, da”',
        ornekler: [
          { latin: 'watashi mo gakusei desu.', ja: '私も学生です。', kana: 'わたしもがくせいです。', tr: 'Ben de öğrenciyim.' },
          { latin: 'koohii mo nomimasu.', ja: 'コーヒーも飲みます。', kana: 'コーヒーものみます。', tr: 'Kahve de içerim.' },
        ],
      },
      {
        baslik: 'Olumsuzla: “hiç”',
        ornekler: [{ latin: 'nani mo tabemasen deshita.', ja: '何も食べませんでした。', kana: 'なにもたべませんでした。', tr: 'Hiçbir şey yemedim.' }],
      },
    ],
    dikkat: 'も, は’nın yerine geçer; ikisi birlikte kullanılmaz: 私はも ✗ → 私も.',
  },
  {
    id: 'ya',
    ek: 'や',
    okunus: 'ya',
    tr: '… gibi, … vb.',
    ozet: 'Eksik liste: saydıkların örnek, başkaları da var.',
    kullanimlar: [
      {
        baslik: 'Örnek liste',
        ornekler: [
          { latin: 'tsukue no ue ni hon ya nooto ga arimasu.', ja: 'つくえの上に本やノートがあります。', kana: 'つくえのうえにほんやノートがあります。', tr: 'Masanın üstünde kitap, defter gibi şeyler var.' },
        ],
      },
    ],
    dikkat: 'と tam listedir (yalnızca bunlar), や örnek listedir (başkaları da var). Sonuna など eklenebilir: 本やノートなど.',
  },
  {
    id: 'kara',
    ek: 'から',
    okunus: 'kara',
    tr: '-den; -diği için',
    ozet: 'Başlangıç noktası (zaman ya da yer). Cümlenin arkasına gelirse sebep bildirir.',
    unite: 'u3',
    kullanimlar: [
      {
        baslik: 'Başlangıç: “-den”',
        ornekler: [
          { latin: 'kuji kara hatarakimasu.', ja: '九時から働きます。', kana: 'くじからはたらきます。', tr: 'Dokuzdan itibaren çalışırım.' },
          { latin: 'toruko kara kimashita.', ja: 'トルコから来ました。', kana: 'トルコからきました。', tr: 'Türkiye’den geldim.' },
        ],
      },
      {
        baslik: 'Sebep: “-diği için” (Ünite 10)',
        ornekler: [{ latin: 'isogashii kara, ikimasen.', ja: '忙しいから、行きません。', kana: 'いそがしいから、いきません。', tr: 'Meşgul olduğum için gitmiyorum.' }],
      },
    ],
  },
  {
    id: 'made',
    ek: 'まで',
    okunus: 'made',
    tr: '-e kadar',
    ozet: 'Bitiş noktası (zaman ya da yer). Çoğu zaman から ile çift olarak gelir.',
    unite: 'u3',
    kullanimlar: [
      {
        baslik: 'Bitiş',
        ornekler: [
          { latin: 'eki made arukimasu.', ja: '駅まで歩きます。', kana: 'えきまであるきます。', tr: 'İstasyona kadar yürürüm.' },
          { latin: 'kuji kara goji made hatarakimasu.', ja: '九時から五時まで働きます。', kana: 'くじからごじまではたらきます。', tr: 'Dokuzdan beşe kadar çalışırım.' },
        ],
      },
    ],
  },
  {
    id: 'yori',
    ek: 'より',
    okunus: 'yori',
    tr: '-den (daha)',
    ozet: 'Karşılaştırma. Karşılaştırılan şeyin arkasına gelir.',
    unite: 'u12',
    kullanimlar: [
      {
        baslik: 'Karşılaştırma',
        ornekler: [{ latin: 'densha wa basu yori hayai desu.', ja: '電車はバスより速いです。', kana: 'でんしゃはバスよりはやいです。', tr: 'Tren otobüsten hızlı.' }],
      },
    ],
    dikkat: '“daha” ayrıca söylenmez; より yeter.',
  },
  {
    id: 'ka',
    ek: 'か',
    okunus: 'ka',
    tr: 'mi? · veya',
    ozet: 'Cümle sonunda soru yapar. İki ismin arasında “veya” demektir.',
    unite: 'u1',
    kullanimlar: [
      {
        baslik: 'Soru: “mi?”',
        ornekler: [{ latin: 'gakusei desu ka.', ja: '学生ですか。', kana: 'がくせいですか。', tr: 'Öğrenci misin?' }],
      },
      {
        baslik: '“veya”',
        ornekler: [{ latin: 'koohii ka ocha o nomimasu.', ja: 'コーヒーかお茶を飲みます。', kana: 'コーヒーかおちゃをのみます。', tr: 'Kahve ya da çay içerim.' }],
      },
    ],
    dikkat: 'Japonca yazıda soru işareti gerekmez; か yeter, cümle 。 ile biter.',
  },
  {
    id: 'ne',
    ek: 'ね',
    okunus: 'ne',
    tr: '… değil mi?',
    ozet: 'Cümle sonunda karşıdakinin onayını bekler; ortak bir duyguyu paylaşır.',
    kullanimlar: [
      {
        baslik: 'Onay bekleme',
        ornekler: [{ latin: 'ii tenki desu ne.', ja: 'いい天気ですね。', kana: 'いいてんきですね。', tr: 'Güzel hava, değil mi?' }],
      },
    ],
  },
  {
    id: 'yo',
    ek: 'よ',
    okunus: 'yo',
    tr: '…ya, bak!',
    ozet: 'Cümle sonunda karşıdakinin bilmediği bir bilgiyi vurgular.',
    kullanimlar: [
      {
        baslik: 'Yeni bilgi',
        ornekler: [{ latin: 'kono mise wa yasui desu yo.', ja: 'この店は安いですよ。', kana: 'このみせはやすいですよ。', tr: 'Bu dükkân ucuz, bak.' }],
      },
    ],
    dikkat: 'ね “ikimiz de biliyoruz”, よ “sen bilmiyorsun, söylüyorum” demektir.',
  },
  {
    id: 'dake',
    ek: 'だけ',
    okunus: 'dake',
    tr: 'sadece, yalnızca',
    ozet: 'Sınırlar: “bundan fazlası değil”.',
    kullanimlar: [
      {
        baslik: 'Sadece',
        ornekler: [{ latin: 'hitotsu dake kudasai.', ja: '一つだけください。', kana: 'ひとつだけください。', tr: 'Yalnızca bir tane verin.' }],
      },
    ],
  },
  {
    id: 'gurai',
    ek: 'ぐらい・ごろ',
    okunus: 'gurai · goro',
    tr: 'yaklaşık · civarı',
    ozet: 'ぐらい miktar ve süre için “yaklaşık”, ごろ saat ve tarih için “civarı”.',
    kullanimlar: [
      {
        baslik: 'Miktar, süre: ぐらい',
        ornekler: [{ latin: 'eki made juppun gurai desu.', ja: '駅まで十分ぐらいです。', kana: 'えきまでじゅっぷんぐらいです。', tr: 'İstasyona yaklaşık on dakika.' }],
      },
      {
        baslik: 'Zaman noktası: ごろ',
        ornekler: [{ latin: 'sanji goro kimasu.', ja: '三時ごろ来ます。', kana: 'さんじごろきます。', tr: 'Üç gibi gelirim.' }],
      },
    ],
  },
]

/** Sık karıştırılan çiftler — her birinde karşıt iki örnek */
export const EK_CIFTLERI: { baslik: string; ekler: string[]; kural: string; ornekler: Ornek[] }[] = [
  {
    baslik: 'は mı が mı',
    ekler: ['は', 'が'],
    kural:
      'は konuyu söyler (“… ise”), が yeni bilgiyi ve soru kelimesini işaretler. Soru kelimesi (だれ, 何) hep が alır; cevabı da が ile gelir.',
    ornekler: [
      { latin: 'tanaka-san wa sensei desu.', ja: '田中さんは先生です。', kana: 'たなかさんはせんせいです。', tr: 'Tanaka öğretmen. (Tanaka’dan bahsediyorum)' },
      { latin: 'dare ga sensei desu ka. — tanaka-san ga sensei desu.', ja: 'だれが先生ですか。— 田中さんが先生です。', kana: 'だれがせんせいですか。— たなかさんがせんせいです。', tr: 'Öğretmen kim? — Öğretmen Tanaka.' },
    ],
  },
  {
    baslik: 'に mi で mi',
    ekler: ['に', 'で'],
    kural: 'Var olma (います, あります) ve varış に; eylemin yapıldığı yer で.',
    ornekler: [
      { latin: 'uchi ni imasu.', ja: 'うちにいます。', kana: 'うちにいます。', tr: 'Evdeyim.' },
      { latin: 'uchi de benkyou shimasu.', ja: 'うちで勉強します。', kana: 'うちでべんきょうします。', tr: 'Evde ders çalışırım.' },
    ],
  },
  {
    baslik: 'を mu が mı',
    ekler: ['を', 'が'],
    kural: 'Çoğu fiilin nesnesi を alır; ama 好き, きらい, 上手, 下手, ほしい, わかる が ister.',
    ornekler: [
      { latin: 'ongaku o kikimasu.', ja: '音楽を聞きます。', kana: 'おんがくをききます。', tr: 'Müzik dinlerim.' },
      { latin: 'ongaku ga suki desu.', ja: '音楽が好きです。', kana: 'おんがくがすきです。', tr: 'Müziği severim.' },
    ],
  },
  {
    baslik: 'と mı や mı',
    ekler: ['と', 'や'],
    kural: 'と tam liste (yalnızca bunlar), や örnek liste (başkaları da var).',
    ornekler: [
      { latin: 'pan to koohii o kaimashita.', ja: 'パンとコーヒーを買いました。', kana: 'パンとコーヒーをかいました。', tr: 'Ekmek ve kahve aldım. (yalnızca bu ikisi)' },
      { latin: 'pan ya koohii o kaimashita.', ja: 'パンやコーヒーを買いました。', kana: 'パンやコーヒーをかいました。', tr: 'Ekmek, kahve gibi şeyler aldım.' },
    ],
  },
  {
    baslik: 'へ mi に mi',
    ekler: ['へ', 'に'],
    kural: 'Gidişte ikisi de olur. へ yönü (“o tarafa”), に varış noktasını vurgular. N5’te ikisi de doğru kabul edilir.',
    ornekler: [
      { latin: 'toukyou e ikimasu.', ja: '東京へ行きます。', kana: 'とうきょうへいきます。', tr: 'Tokyo’ya (doğru) giderim.' },
      { latin: 'toukyou ni ikimasu.', ja: '東京に行きます。', kana: 'とうきょうにいきます。', tr: 'Tokyo’ya giderim.' },
    ],
  },
]
