// Ünite kitabının dilbilgisi sayfalarındaki pekiştirme soruları.
//
// Her konuya üç kısa soru: şıklı, boşluk doldurma (yazarak) ve anlam.
// Yazmalı sorularda kana ya da romaji kabul edilir (unit-pekistirme.ts,
// cevapDogruMu). Sorular YALNIZCA o üniteye kadar görülmüş kelimelerle yazıldı;
// scripts/check-pekistirme.ts görülmemiş kanjiyi ve bozuk şıkları denetler.
//
// Anahtar: ünite → dilbilgisi başlığı (UnitGrammar.title, birebir).

export type PekSoru =
  | { t: 'sec'; s: string; o: string[]; d: number; a: string }
  | { t: 'yaz'; s: string; d: string[]; a: string }

const sec = (s: string, o: string[], d: number, a: string): PekSoru => ({ t: 'sec', s, o, d, a })
const yaz = (s: string, d: string[], a: string): PekSoru => ({ t: 'yaz', s, d, a })

export const GRAMER_SORULARI: Record<string, Record<string, PekSoru[]>> = {
  u1: {
    'AはBです — “A, B’dir”': [
      sec('私＿＿学生です。 Boşluğa hangisi gelir?', ['は', 'を', 'に', 'で'], 0, 'Konuyu は işaretler, okunuşu “wa”: 私は学生です = Ben öğrenciyim.'),
      yaz('“Ben Türk’üm.” → 私はトルコ人＿＿。', ['です'], 'Kibar cümle です ile biter: 私はトルコ人です (watashi wa torukojin desu).'),
      sec('「先生は日本人です。」 ne demek?', ['Öğretmen Japon.', 'Ben öğretmenim.', 'Öğretmen Türk.', 'Japon öğretmen mi?'], 0, '先生 öğretmen · は konu · 日本人 Japon · です -dir.'),
    ],
    'じゃないです — olumsuz': [
      sec('“Ben öğretmen değilim.” hangisi?', ['私は先生です。', '私は先生じゃないです。', '私も先生です。', '私は先生ですか。'], 1, 'Olumsuz: です yerine じゃないです.'),
      yaz('“O kişi öğrenci değil.” → あの人は学生＿＿＿＿＿。', ['じゃないです', 'じゃありません', 'ではありません'], 'じゃないです “değil”. Daha resmî hâli じゃありません.'),
      sec('「日本人じゃないです」 ne demek?', ['Japon değil.', 'Japon.', 'Japon mu?', 'Japon da.'], 0, 'じゃないです olumsuzdur: “Japon değil”.'),
    ],
    'か — soru eki': [
      sec('“Öğrenci misiniz?” hangisi?', ['学生です。', '学生ですか。', '学生じゃないです。', '学生もです。'], 1, 'Cümlenin sonuna か eklenince soru olur; soru işareti gerekmez.'),
      yaz('“Öğretmen misiniz?” → 先生です＿。', ['か'], 'Soru eki か: 先生ですか (sensei desu ka).'),
      sec('「名前は何ですか。」 sorusuna uygun cevap?', ['エフェです。', 'はい、そうです。', '学生じゃないです。', '日本語です。'], 0, 'Ad soruluyor; cevap: エフェです (Efe’yim).'),
    ],
    'の — tamlama': [
      sec('“Japonca öğretmeni” hangisi?', ['先生の日本語', '日本語の先生', '日本語は先生', '日本語も先生'], 1, 'Sıra Türkçedeki gibi: 日本語の先生 = Japonca(nın) öğretmeni.'),
      yaz('“Benim adım Efe.” → 私＿＿名前はエフェです。', ['の'], 'の iki ismi bağlar: 私の名前 = benim adım.'),
      sec('「友だちの本」 ne demek?', ['Arkadaşın kitabı', 'Kitabın arkadaşı', 'Arkadaş ve kitap', 'Arkadaşım bir kitap'], 0, 'A の B = A’nın B’si: 友だちの本 = arkadaşın kitabı.'),
    ],
    'も — “de, da”': [
      sec('エフェさんは学生です。私＿＿学生です。 (Ben de öğrenciyim.)', ['は', 'の', 'も', 'か'], 2, 'も “de, da” demektir ve は’nın yerine geçer.'),
      yaz('“Arkadaşım da Türk.” → 友だち＿＿トルコ人です。', ['も'], '友だちもトルコ人です: も = de/da.'),
      sec('「先生も日本人です」 ne demek?', ['Öğretmen de Japon.', 'Öğretmen Japon mu?', 'Öğretmen Japon değil.', 'Japon öğretmen.'], 0, 'も = “de”: öğretmen DE Japon.'),
    ],
  },
  u2: {
    'これ・それ・あれ — “bu, şu, o”': [
      sec('Elindeki kitabı gösteriyorsun: “Bu kitap.”', ['これは本です。', 'あれは本です。', 'それは本です。', 'どれは本です。'], 0, 'これ konuşana yakın, それ karşıdakine yakın, あれ ikisine de uzak.'),
      sec('Uzaktaki bir şeyi soruyorsun: “O ne?”', ['これは何ですか。', 'それは何ですか。', 'あれは何ですか。', 'どれは何ですか。'], 2, 'Uzaktaki için あれ: あれは何ですか.'),
      yaz('Karşındakinin elindekini soruyorsun: “Şu ne?” → ＿＿は何ですか。', ['それ'], 'Karşıdakine yakın olan: それ (sore).'),
    ],
    'この・その・あの — “bu … , şu … , o …”': [
      sec('“Bu çanta benim.” hangisi?', ['これかばんは私のです。', 'このかばんは私のです。', 'かばんこのは私のです。', 'このはかばん私のです。'], 1, 'この / その / あの tek başına durmaz, arkasından isim gelir: このかばん.'),
      sec('Hangisi YANLIŞ?', ['この本', 'あの人', 'これ本', 'そのかさ'], 2, 'これ tek başına kullanılır (これは本です); isimden önce この gelir: この本.'),
      yaz('“O kişi kim?” → ＿＿人はだれですか。', ['あの'], 'Uzaktaki kişi: あの人 (ano hito).'),
    ],
    'だれの — “kimin”': [
      sec('“Bu kimin kitabı?”', ['これはだれの本ですか。', 'これはだれ本ですか。', 'これはだれは本ですか。', 'だれはこれの本ですか。'], 0, 'だれ + の = kimin: だれの本.'),
      yaz('“Bu kimin şemsiyesi?” → これはだれ＿＿かさですか。', ['の'], 'だれのかさ = kimin şemsiyesi.'),
      sec('「私のです。」 ne demek?', ['Benim.', 'Ben.', 'Benim mi?', 'Ben değilim.'], 0, 'の’dan sonraki isim belliyse düşer: 私のかさです → 私のです (benim).'),
    ],
    'そうです / ちがいます — onaylama ve düzeltme': [
      sec('「学生ですか。」 Öğrenciysen nasıl cevap verirsin?', ['はい、そうです。', 'いいえ、ちがいます。', 'はい、ちがいます。', 'いいえ、そうです。'], 0, 'Doğruysa: はい、そうです (evet, öyle).'),
      sec('「これはエフェさんのかばんですか。」 Değilse?', ['はい、そうです。', 'いいえ、ちがいます。', 'はい、ちがいます。', 'そうですか。'], 1, 'Yanlışsa: いいえ、ちがいます (hayır, değil).'),
      yaz('“Hayır, değil.” → いいえ、＿＿＿＿＿。', ['ちがいます'], 'ちがいます (chigaimasu) = değil, yanlış.'),
    ],
  },
  u3: {
    'ます biçimi — kibar fiil': [
      sec('食べます’ın olumsuz geçmişi (yemedim) hangisi?', ['食べます', '食べません', '食べました', '食べませんでした'], 3, 'ます → ません (olumsuz) → ました (geçmiş) → ませんでした (olumsuz geçmiş).'),
      yaz('起きます → geçmiş: “kalktım”', ['起きました', 'おきました'], 'ます → ました: 起きました (okimashita).'),
      sec('「明日は働きません。」 ne demek?', ['Yarın çalışmıyorum.', 'Yarın çalıştım.', 'Dün çalışmadım.', 'Yarın çalışıyorum.'], 0, 'ません olumsuz; şimdiki ve gelecek zaman aynı biçimdedir.'),
    ],
    'に — zaman eki': [
      sec('七時＿＿起きます。', ['に', 'を', 'は', 'の'], 0, 'Saat + に: 七時に = yedide.'),
      sec('Hangisinde に KULLANILMAZ?', ['九時に', '四時半に', '毎日に', '午後四時に'], 2, '毎日, 今日, 明日 gibi göreli zaman kelimeleri に almaz: 毎日べんきょうします.'),
      yaz('“Saat dörtte eve dönerim.” → 四時＿＿帰ります。', ['に'], '四時に帰ります: saat + に.'),
    ],
    '〜から〜まで — “…-den …-e kadar”': [
      sec('九時＿＿四時＿＿働きます。 (dokuzdan dörde kadar)', ['から / まで', 'まで / から', 'に / に', 'を / を'], 0, 'から başlangıç (-den), まで bitiş (-e kadar).'),
      yaz('“Dokuza kadar” → 九時＿＿', ['まで'], 'まで = -e kadar: 九時まで.'),
      sec('「午前九時から働きます」 ne demek?', ['Sabah dokuzdan itibaren çalışırım.', 'Sabah dokuza kadar çalışırım.', 'Akşam dokuzda çalışırım.', 'Dokuzda kalkarım.'], 0, 'から = -den (itibaren).'),
    ],
    'Saat söylemek': [
      sec('四時 nasıl okunur?', ['しじ', 'よんじ', 'よじ', 'よっじ'], 2, 'Düzensiz saatler: 四時 よじ, 七時 しちじ, 九時 くじ.'),
      yaz('七時半 nasıl okunur?', ['しちじはん'], '七時半 shichiji han: 七時 しちじ + 半 はん (buçuk).'),
      sec('九時 nasıl okunur?', ['きゅうじ', 'くじ', 'きゅじ', 'くうじ'], 1, '九時 くじ (kuji) — きゅうじ değil.'),
    ],
  },
  u4: {
    'いくらですか — “kaç para?”': [
      sec('“Bu kaç para?”', ['これはいくらですか。', 'これは何ですか。', 'これはだれのですか。', 'これは何時ですか。'], 0, 'いくら = kaç para.'),
      yaz('“Bu elma kaç para?” → このりんごは＿＿＿ですか。', ['いくら'], 'このりんごはいくらですか (ikura desu ka).'),
      sec('「八百円です。」 kaç yen?', ['80', '800', '8.000', '180'], 1, '八百 はっぴゃく = 800.'),
    ],
    '〜をください — “… verir misiniz”': [
      sec('コーヒー＿＿ください。', ['を', 'が', 'は', 'に'], 0, 'İstenen şey を ile: コーヒーをください.'),
      yaz('“Bunu alayım lütfen.” → これを＿＿＿＿。', ['ください'], 'これをください (kore o kudasai).'),
      sec('“İki ekmek lütfen.” hangisi?', ['パンを二つください。', 'パンは二つですか。', 'パンを二つです。', 'パンの二つください。'], 0, 'Sıra: nesne + を + sayı + ください.'),
    ],
    'Sayaçlar — sayı + sayaç': [
      sec('Pul (yassı şey) sayarken: “beş pul”', ['切手を五つ', '切手を五枚', '切手を五人', '切手を五本'], 1, '枚: kâğıt, pul, bilet gibi yassı şeyler. 本: uzun şeyler. 人: insanlar. つ: genel.'),
      sec('“Üç elma”', ['りんごを三つ', 'りんごを三枚', 'りんごを三人', 'りんごを三'], 0, 'Elma gibi genel nesneler: 〜つ (三つ みっつ).'),
      yaz('一つ nasıl okunur?', ['ひとつ'], '一つ hitotsu, 二つ futatsu, 三つ mittsu.'),
    ],
    'Büyük sayılar': [
      sec('三百 nasıl okunur?', ['さんひゃく', 'さんびゃく', 'さんぴゃく', 'みひゃく'], 1, 'Ses değişir: 三百 さんびゃく, 六百 ろっぴゃく, 八百 はっぴゃく.'),
      sec('10.000 yen?', ['十千円', '一万円', '百百円', '千十円'], 1, 'Japoncada 10.000 için ayrı birim var: 万 (man). 一万円.'),
      yaz('三千 nasıl okunur?', ['さんぜん'], '三千 さんぜん — せん burada ぜん olur.'),
    ],
  },
  u5: {
    'あります / います — “var”': [
      sec('教室に先生が＿＿＿。', ['あります', 'います', 'です', 'ます'], 1, 'Canlılar (insan, hayvan) için います; cansızlar için あります.'),
      sec('つくえの上に本が＿＿＿。', ['います', 'あります', 'いります', 'です'], 1, 'Kitap cansız: あります.'),
      yaz('“Çantanın içinde cüzdan var.” → かばんの中にさいふ＿＿あります。', ['が'], 'Var olan şey が ile işaretlenir: さいふがあります.'),
    ],
    'Konum kelimeleri': [
      sec('“Masanın üstünde” hangisi?', ['上のつくえに', 'つくえの上に', 'つくえに上の', '上につくえの'], 1, 'Türkçedeki gibi: masa-nın üst-ü-nde → つくえ の 上 に.'),
      sec('「いすの下」 ne demek?', ['Sandalyenin altı', 'Sandalyenin üstü', 'Sandalyenin önü', 'Sandalyenin yanı'], 0, '下 した = alt.'),
      yaz('“İstasyonun önünde” → 駅の＿＿に', ['前', 'まえ'], '前 まえ = ön: 駅の前に.'),
    ],
    'に ile で farkı': [
      sec('家＿＿日本語をべんきょうします。', ['に', 'で', 'を', 'へ'], 1, 'Eylemin yapıldığı yer で; bulunulan yer (います / あります) に.'),
      sec('友だちは家＿＿います。', ['で', 'に', 'を', 'が'], 1, 'Bulunulan yer: 家にいます (evde).'),
      sec('駅＿＿パンを食べます。', ['に', 'で', 'が', 'の'], 1, 'Yemek bir eylem; yapıldığı yer で: 駅で食べます.'),
    ],
    'どこ — “nerede”': [
      sec('“Tuvalet nerede?”', ['トイレはどこですか。', 'トイレは何ですか。', 'トイレはだれですか。', 'トイレはいくらですか。'], 0, 'どこ = nerede.'),
      yaz('“Banka nerede?” → 銀行は＿＿＿ですか。', ['どこ'], '銀行はどこですか (doko desu ka).'),
      sec('Uzaktaki bir binayı gösterip “Orada.” diyorsun:', ['ここです。', 'そこです。', 'あそこです。', 'どこです。'], 2, 'ここ burada, そこ şurada (karşıdakine yakın), あそこ orada (uzak).'),
    ],
  },
  u6: {
    'Üç hareket fiili': [
      sec('“Arkadaşım eve geliyor.” Hangi fiil?', ['行きます', '来ます', '帰ります', 'います'], 1, '来ます = gelmek.'),
      sec('Kendi evine ya da memleketine dönmek?', ['行きます', '来ます', '帰ります', '起きます'], 2, '帰ります: kendi yerine (ev, ülke) dönmek.'),
      yaz('来ます nasıl okunur?', ['きます'], '来ます kimasu — 来 burada き okunur.'),
    ],
    'へ / に — yön': [
      sec('日本＿＿行きます。', ['へ', 'を', 'で', 'が'], 0, 'Yön: へ (okunuşu “e”) ya da に.'),
      yaz('“Bankaya gittim.” → 銀行＿＿行きました。 (へ ya da に)', ['へ', 'に'], 'Yön eki: 銀行へ ya da 銀行に.'),
      sec('Yön eki へ nasıl okunur?', ['he', 'e', 'ni', 'o'], 1, 'Ek olarak へ “e” okunur (は “wa”, を “o” gibi).'),
    ],
    'で — araç': [
      sec('電車＿＿会社へ行きます。', ['で', 'に', 'を', 'と'], 0, 'Araç + で: 電車で = trenle.'),
      sec('“Yürüyerek gidiyorum.” hangisi?', ['歩いて行きます。', '歩いてで行きます。', '歩くに行きます。', '歩きで行きます。'], 0, 'Yürüyerek için で kullanılmaz: 歩いて行きます.'),
      yaz('“Otobüsle geldim.” → バス＿＿来ました。', ['で'], 'バスで来ました: araç + で.'),
    ],
    'と — “ile”': [
      sec('友だち＿＿大学へ行きます。 (arkadaşımla)', ['と', 'で', 'に', 'を'], 0, 'Kişiyle birlikte: と. Araçla: で.'),
      sec('“Tek başıma dönerim.”', ['一人と帰ります。', '一人で帰ります。', '一人に帰ります。', '一人を帰ります。'], 1, '一人で = tek başına (burada で).'),
      yaz('“Öğretmenle” → 先生＿＿', ['と'], '先生と = öğretmenle.'),
    ],
  },
  u7: {
    'い-sıfatlar': [
      sec('高い’nın olumsuzu?', ['高いじゃないです', '高くないです', '高くです', '高かったです'], 1, 'い-sıfat: sondaki い → くない. 高い → 高くないです.'),
      yaz('安い → geçmiş: “ucuzdu” (…かったです)', ['安かったです', 'やすかったです'], 'い → かった: 安かったです (yasukatta desu).'),
      sec('いい’nin olumsuzu?', ['いくないです', 'よくないです', 'いいじゃないです', 'よいないです'], 1, 'いい düzensizdir: よくない, よかった.'),
    ],
    'な-sıfatlar': [
      sec('“Sakin bir kasaba”', ['しずか町', 'しずかな町', 'しずかの町', 'しずかい町'], 1, 'な-sıfat isimden önce な alır: しずかな町.'),
      sec('きれい’nin olumsuzu?', ['きれくないです', 'きれいじゃないです', 'きれいくないです', 'きれいないです'], 1, 'きれい い ile bitse de な-sıfattır: きれいじゃないです.'),
      yaz('“Ünlü bir öğretmen” → ゆうめい＿＿先生', ['な'], 'ゆうめいな先生: isimden önce な.'),
    ],
    '好き・きらい + が': [
      sec('私は日本語＿＿好きです。', ['を', 'が', 'に', 'で'], 1, '好き / きらい ile sevilen şey が alır, を değil.'),
      sec('「友だちはりんごがきらいです」', ['Arkadaşım elmayı sevmez.', 'Arkadaşım elmayı sever.', 'Arkadaşımın elması yok.', 'Elma arkadaşımı sevmez.'], 0, 'きらい = sevilmeyen.'),
      yaz('“Kahveyi severim.” → コーヒーが＿＿です。', ['好き', 'すき'], 'コーヒーが好きです (suki desu).'),
    ],
    'とても / あまり': [
      sec('このパンは＿＿＿おいしくないです。 (pek lezzetli değil)', ['とても', 'あまり', 'とてもの', 'いい'], 1, 'あまり olumsuzla kullanılır: “pek … değil”.'),
      sec('Hangisi YANLIŞ?', ['とてもおいしいです。', 'あまりおいしくないです。', 'あまりおいしいです。', 'とても高いです。'], 2, 'あまり olumlu yüklemle kullanılmaz.'),
      yaz('“Bu kasaba çok hareketli.” → この町は＿＿＿にぎやかです。', ['とても'], 'とても = çok (olumlu cümlede).'),
    ],
  },
  u8: {
    'Fiilde geçmiş zaman': [
      sec('“Dün film izledim.”', ['昨日、映画を見ます。', '昨日、映画を見ました。', '昨日、映画を見ません。', '昨日、映画を見ませんでした。'], 1, 'Geçmiş: ます → ました.'),
      yaz('会います → “buluşmadım” (olumsuz geçmiş)', ['会いませんでした', 'あいませんでした'], 'ます → ませんでした: 会いませんでした.'),
      sec('「行きませんでした」 ne demek?', ['Gitmedim.', 'Gittim.', 'Gitmem.', 'Gidelim.'], 0, 'ませんでした = olumsuz geçmiş.'),
    ],
    'い-sıfatta geçmiş': [
      sec('楽しい → geçmiş: “eğlenceliydi”', ['楽しいでした', '楽しかったです', '楽しくでした', '楽しったです'], 1, 'い-sıfatta geçmiş: い → かった. “楽しいでした” YANLIŞ.'),
      yaz('寒い → “soğuk değildi” (…くなかったです)', ['寒くなかったです', 'さむくなかったです'], 'い → くなかった: 寒くなかったです.'),
      sec('いい → geçmiş: “iyiydi”', ['いかったです', 'よかったです', 'いいでした', 'よいでした'], 1, 'いい düzensiz: よかったです.'),
    ],
    'İsim ve な-sıfatta geçmiş': [
      sec('“Dün tatildi.”', ['昨日は休みでした。', '昨日は休みかったです。', '昨日は休みです。', '昨日は休みじゃないです。'], 0, 'İsim + でした.'),
      yaz('しずか → “sakin değildi”', ['しずかじゃなかったです', 'しずかではありませんでした', 'しずかじゃありませんでした'], 'な-sıfat: じゃなかったです.'),
      sec('「試験でした」 ne demek?', ['Sınavdı / sınav vardı.', 'Sınav var.', 'Sınav değildi.', 'Sınav mı?'], 0, 'でした = idi.'),
    ],
    'どうでしたか — “nasıldı?”': [
      sec('「旅行はどうでしたか。」 ne soruyor?', ['Seyahat nasıldı?', 'Seyahat nerede?', 'Seyahat ne zaman?', 'Seyahat kimle?'], 0, 'どう = nasıl, でしたか = idi mi.'),
      sec('Buna uygun cevap?', ['とても楽しかったです。', 'はい、そうです。', '旅行へ行きます。', '先週です。'], 0, 'Nasıldı sorusuna bir sıfatla cevap verilir.'),
      yaz('“Film nasıldı?” → 映画は＿＿でしたか。', ['どう'], '映画はどうでしたか (dou deshita ka).'),
    ],
    'が — “ama”': [
      sec('日本語は難しいです＿＿、楽しいです。', ['が', 'から', 'と', 'を'], 0, 'Cümle + が、 = “… ama …”.'),
      sec('「高かったですが、おいしかったです。」', ['Pahalıydı ama lezzetliydi.', 'Pahalı ve lezzetliydi.', 'Pahalıydı, o yüzden lezzetliydi.', 'Pahalı değildi ama lezzetliydi.'], 0, 'が burada “ama”.'),
      yaz('“Sınav zordu ama eğlenceliydi.” → 試験は難しかったです＿＿、楽しかったです。', ['が'], 'İki cümleyi “ama” ile bağlayan が.'),
    ],
  },
  u9: {
    'て formu nasıl kurulur': [
      sec('書きます → て biçimi?', ['書って', '書いて', '書きて', '書んで'], 1, 'き → いて: 書いて. (İstisna: 行きます → 行って)'),
      sec('読みます → て biçimi?', ['読んで', '読って', '読いて', '読みて'], 0, 'み, び, に → んで: 読んで.'),
      yaz('待ちます → て biçimi', ['待って', 'まって'], 'ち, い, り → って: 待って (matte).'),
    ],
    '〜てください — rica': [
      sec('“Lütfen bekleyin.”', ['待ってください。', '待ちますください。', '待ちてください。', '待ってです。'], 0, 'て biçimi + ください.'),
      yaz('“Adınızı yazın lütfen.” → 名前を書いて＿＿＿＿。', ['ください'], '書いてください (kaite kudasai).'),
      sec('ゆっくり＿＿＿ください。 (okuyun)', ['読んで', '読みて', '読って', '読む'], 0, '読みます → 読んで → 読んでください.'),
    ],
    '〜てもいいです — izin': [
      sec('“Buraya oturabilir miyim?”', ['ここに座ってもいいですか。', 'ここに座ってください。', 'ここに座ってはいけません。', 'ここに座っています。'], 0, 'İzin istemek: 〜てもいいですか.'),
      sec('İzin veriyorsan ne dersin?', ['はい、いいですよ。', 'いいえ、ちがいます。', 'はい、そうです。', 'すみません。'], 0, 'いいですよ = olur, tabii.'),
      yaz('“Bu şemsiyeyi kullanabilir miyim?” → このかさを使って＿＿いいですか。', ['も'], '〜てもいいですか: て + も + いいですか.'),
    ],
    '〜てはいけません — yasak': [
      sec('“Sınıfta telefon kullanmak yasak.”', ['教室でけいたいを使ってはいけません。', '教室でけいたいを使ってもいいです。', '教室でけいたいを使ってください。', '教室でけいたいを使っています。'], 0, 'Yasak: 〜てはいけません.'),
      sec('「ここで食べてはいけません」 ne demek?', ['Burada yemek yasak.', 'Burada yiyebilirsin.', 'Lütfen burada ye.', 'Burada yiyorum.'], 0, 'てはいけません = yasak, yapılmaz.'),
      yaz('“Buraya oturmak yasak.” → ここに座っては＿＿＿＿＿。', ['いけません'], '座ってはいけません (suwatte wa ikemasen).'),
    ],
    '〜ています — şu an süren eylem': [
      sec('“Şu an kitap okuyorum.”', ['今、本を読んでいます。', '今、本を読みます。', '今、本を読みました。', '今、本を読んでください。'], 0, 'Süren eylem: て biçimi + います.'),
      sec('「先生は結婚しています」 ne demek?', ['Öğretmen evli.', 'Öğretmen şu an evleniyor.', 'Öğretmen evlenecek.', 'Öğretmen evlendi mi?'], 0, '〜ています süren bir DURUMU da anlatır: 結婚しています = evli.'),
      yaz('“Türkiye’de yaşıyorum.” → トルコに住んで＿＿＿。', ['います'], '住んでいます (sunde imasu).'),
    ],
  },
  u10: {
    '〜たいです — “…-mek istiyorum”': [
      sec('行きます → “gitmek istiyorum”', ['行きたいです', '行くたいです', '行ってたいです', '行きましょう'], 0, 'ます kökü + たい: 行き + たいです.'),
      yaz('食べます → “yemek istiyorum” (…たいです)', ['食べたいです', 'たべたいです'], '食べ + たいです.'),
      sec('「映画を見たくないです」 ne demek?', ['Film izlemek istemiyorum.', 'Film izlemek istiyorum.', 'Film izlemedim.', 'Film izleyelim.'], 0, 'たい い-sıfat gibi çekilir: たくない = istemiyorum.'),
    ],
    '〜ませんか — teklif': [
      sec('“Birlikte film izlemez misin?” (davet)', ['いっしょに映画を見ませんか。', 'いっしょに映画を見ません。', 'いっしょに映画を見ませんでした。', 'いっしょに映画を見ましたか。'], 0, 'Davet: 〜ませんか.'),
      sec('「いっしょに食事をしませんか」 aslında nedir?', ['Bir davet', 'Olumsuz bir soru: yemek yemiyor musun?', 'Bir yasak', 'Bir emir'], 0, '〜ませんか olumsuz görünür ama kibar bir davettir.'),
      sec('Daveti kibarca reddetmek:', ['ざんねんですが、ちょっと…', 'はい、そうです。', 'いいですね。', 'そうですね。'], 0, 'ざんねんですが、ちょっと… = maalesef biraz (olmuyor)…'),
    ],
    '〜ましょう — “hadi yapalım”': [
      sec('“Hadi gidelim.”', ['行きましょう。', '行きます。', '行きませんか。', '行きたいです。'], 0, '〜ましょう = hadi …elim.'),
      yaz('会います → “buluşalım”', ['会いましょう', 'あいましょう'], 'ます → ましょう: 会いましょう.'),
      sec('「三時に会いましょう」 ne demek?', ['Saat üçte buluşalım.', 'Saat üçte buluştuk.', 'Saat üçte buluşmayalım.', 'Saat üçte buluşur musun?'], 0, 'ましょう = -elim.'),
    ],
    '〜から — sebep': [
      sec('忙しいです＿＿、行きません。', ['から', 'が', 'と', 'まで'], 0, 'から sebep bildirir: meşgulüm, bu yüzden gitmiyorum.'),
      sec('「ひまですから、映画を見たいです」', ['Boşum, bu yüzden film izlemek istiyorum.', 'Boşum ama film izlemek istemiyorum.', 'Film izledim çünkü boştum.', 'Boş musun, film izleyelim mi?'], 0, 'から = … olduğu için.'),
      yaz('“Yarın çalışıyorum, bu yüzden gitmiyorum.” → 明日は働きます＿＿、行きません。', ['から'], 'Sebep + から、sonuç.'),
    ],
    '上手・下手 + が': [
      sec('先生は料理＿＿上手です。', ['が', 'を', 'に', 'で'], 0, '上手 / 下手 ile beceri が alır.'),
      sec('「私はスポーツが下手です」', ['Sporda beceriksizim.', 'Sporu severim.', 'Sporda iyiyim.', 'Spor yapmam.'], 0, '下手 = beceriksiz.'),
      yaz('“Öğretmen Japoncada usta.” → 先生は日本語が＿＿＿です。', ['上手', 'じょうず'], '上手 (jouzu) = usta, iyi.'),
    ],
  },
  u11: {
    'Aile kelimeleri — kendi ailen ve başkasınınki': [
      sec('Kendi babandan bahsederken:', ['父', 'お父さん', 'お母さん', '母'], 0, 'Kendi ailen: 父 / 母. Başkasının ailesi: お父さん / お母さん (saygılı).'),
      sec('Arkadaşının annesi için:', ['母', 'お母さん', '姉', '妹'], 1, 'Başkasının annesi: お母さん.'),
      yaz('兄 nasıl okunur?', ['あに'], '兄 あに (ani) = ağabeyim.'),
    ],
    'Sade biçim (辞書形) — arkadaş dili': [
      sec('食べます → sözlük biçimi?', ['食べる', '食べう', '食べむ', '食べす'], 0, 'ru-fiil: ます → る.'),
      sec('行きます → sözlük biçimi?', ['行く', '行る', '行きる', '行う'], 0, 'u-fiil: き → く.'),
      yaz('します → sözlük biçimi', ['する'], 'Düzensiz: します → する, 来ます → 来る (くる).'),
    ],
    'Sade olumsuz (ない形)': [
      sec('行く → ない biçimi?', ['行かない', '行きない', '行くない', '行けない'], 0, 'u-fiil: u sesi → a + ない: 行く → 行かない.'),
      sec('来る → ない biçimi nasıl okunur?', ['きない', 'こない', 'くない', 'きたない'], 1, '来る düzensiz: 来ない (こない).'),
      yaz('する → ない biçimi', ['しない'], 'する → しない.'),
    ],
    'Sade geçmiş (た形)': [
      sec('見る → た biçimi?', ['見た', '見った', '見いた', '見んだ'], 0, 'て biçimi 見て → た biçimi 見た.'),
      sec('話す → た biçimi?', ['話した', '話った', '話いた', '話んだ'], 0, '話して → 話した.'),
      yaz('読んで → た biçimi (て → た, で → だ)', ['読んだ', 'よんだ'], '読んで → 読んだ.'),
    ],
    '〜と思います — “bence, sanırım”': [
      sec('“Bence Japonca eğlenceli.”', ['日本語は楽しいと思います。', '日本語は楽しいです思います。', '日本語は楽しいを思います。', '日本語は楽しいから思います。'], 0, 'Sade biçim + と思います.'),
      sec('「弟は今日来ないと思います」', ['Bence kardeşim bugün gelmez.', 'Kardeşim bugün gelmedi.', 'Kardeşim bugün gelmek istemiyor.', 'Kardeşim bugün gelsin.'], 0, '来ない (gelmez) + と思います (bence).'),
      yaz('“Bence o kişi Japon.” → あの人は日本人だ＿＿思います。', ['と'], 'İsim + だ + と思います.'),
    ],
  },
  u12: {
    'A は B より 〜 — karşılaştırma': [
      sec('“Güney kuzeyden sıcak.”', ['南は北より暑いです。', '北は南より暑いです。', '南より北は暑いです。', '南は北から暑いです。'], 0, 'より = -den (daha): 北より = kuzeyden.'),
      yaz('“Tren otobüsten ucuz.” → 電車はバス＿＿安いです。', ['より'], 'バスより = otobüsten.'),
      sec('「山は川より高いです」 — hangisi daha yüksek?', ['山 (dağ)', '川 (nehir)', 'İkisi aynı', 'Belli değil'], 0, 'A は B より 〜: A, B’den daha 〜.'),
    ],
    'どちらが 〜 — ikisinden hangisi': [
      sec('“Kahve mi ekmek mi, hangisini seversin?”', ['コーヒーとパンとどちらが好きですか。', 'コーヒーとパンと何が好きですか。', 'コーヒーとパンとどこが好きですか。', 'コーヒーはパンより好きですか。'], 0, 'İki şeyden hangisi: どちら.'),
      yaz('“Dağı daha çok severim.” → 山の＿＿＿が好きです。', ['ほう'], '〜のほうが = … daha.'),
      sec('「電車とバスとどちらが安いですか。」 cevabı?', ['バスのほうが安いです。', 'バスが一番です。', 'はい、安いです。', 'バスより安いです。'], 0, 'Cevap: B のほうが 〜です.'),
    ],
    '〜の中で 〜が一番 — “en”': [
      sec('“Yıl içinde en çok yazı severim.”', ['一年の中でなつが一番好きです。', '一年の中になつが一番好きです。', '一年よりなつが好きです。', '一年のほうがなつが好きです。'], 0, '〜の中で 〜が一番.'),
      yaz('“En” (en çok, birinci) → ＿＿＿', ['一番', 'いちばん'], '一番 ichiban.'),
      sec('「家族の中で母が一番忙しいです」 — en meşgul kim?', ['Annem', 'Babam', 'Ben', 'Hepsi'], 0, '母が一番忙しい = en meşgul annem.'),
    ],
    '〜くなる / 〜になる — değişim': [
      sec('寒い → “soğudu”', ['寒くなりました', '寒いになりました', '寒になりました', '寒かったなりました'], 0, 'い-sıfat: い → く + なります.'),
      sec('上手 → “ustalaştı, ilerledi”', ['上手になりました', '上手くなりました', '上手いなりました', '上手がなりました'], 0, 'な-sıfat ve isim: に + なります.'),
      yaz('“Bulutlu olacak” → くもり＿＿なるでしょう。', ['に'], 'İsim + に + なる.'),
    ],
    '〜でしょう — tahmin': [
      sec('「明日は雨でしょう」 ne demek?', ['Yarın muhtemelen yağmur yağacak.', 'Yarın kesin yağmur yağacak.', 'Dün yağmur yağdı.', 'Yarın yağmur mu?'], 0, 'でしょう = muhtemelen, herhalde.'),
      sec('“Kuzey muhtemelen soğuktur.”', ['北は寒いでしょう。', '北は寒いです。', '北は寒かったです。', '北は寒くないです。'], 0, 'Sade biçim + でしょう.'),
      yaz('“Dağın tepesi muhtemelen serindir.” → 山の上はすずしい＿＿＿＿。', ['でしょう'], 'すずしいでしょう (suzushii deshou).'),
    ],
  },
  u13: {
    '〜前に / 〜た後で — önce ve sonra': [
      sec('“Yatmadan önce”', ['寝る前に', '寝た前に', '寝ます前に', '寝て前に'], 0, '前に sözlük biçimiyle: 寝る前に.'),
      sec('“Yemek yedikten sonra”', ['食べた後で', '食べる後で', '食べて後で', '食べます後で'], 0, '後で た biçimiyle: 食べた後で.'),
      yaz('“Akşam yemeğinden sonra” → 晩ご飯＿＿後で', ['の'], 'İsim + の後で / の前に.'),
    ],
    '〜てから — “…dikten sonra”': [
      sec('“Öğle yemeği yedikten sonra üniversiteye giderim.”', ['昼ご飯を食べてから、大学へ行きます。', '昼ご飯を食べるから、大学へ行きます。', '昼ご飯を食べたから、大学へ行きます。', '昼ご飯を食べながら、大学へ行きます。'], 0, 'て + から = -dikten sonra. (Sade biçim + から ise “çünkü”.)'),
      yaz('“Eve girdikten sonra” → 家に入って＿＿', ['から'], '入ってから (haitte kara).'),
      sec('「おふろに入ってから寝ます」', ['Banyo yaptıktan sonra yatarım.', 'Banyo yaparken uyurum.', 'Yatmadan önce banyo yapmam.', 'Banyo yaptığım için yatarım.'], 0, 'てから = -dikten sonra.'),
    ],
    '〜ながら — aynı anda': [
      sec('聞きます → “dinlerken, dinleyerek”', ['聞きながら', '聞くながら', '聞いてながら', '聞ながら'], 0, 'ます kökü + ながら: 聞き + ながら.'),
      sec('「音楽を聞きながら、べんきょうします」', ['Müzik dinleyerek ders çalışırım.', 'Müzik dinledikten sonra ders çalışırım.', 'Müzik dinlemeden ders çalışırım.', 'Müzik dinlemek için ders çalışırım.'], 0, 'ながら = aynı anda.'),
      yaz('話します → “konuşarak” (…ながら)', ['話しながら', 'はなしながら'], '話し + ながら.'),
    ],
    '〜たり〜たりします — örnekleme': [
      sec('そうじをし＿＿、せんたくをし＿＿します。', ['たり / たり', 'て / て', 'ながら / ながら', 'から / から'], 0, 'Birkaç eylemi örnek olarak sayma: 〜たり〜たりします.'),
      sec('「本を読んだり、音楽を聞いたりします」', ['Kitap okumak, müzik dinlemek gibi şeyler yaparım.', 'Kitap okuyup sonra müzik dinlerim.', 'Kitap okurken müzik dinlerim.', 'Kitap okumam, müzik dinlemem.'], 0, 'たり〜たり = … gibi şeyler (sıra önemli değil).'),
      yaz('見ます → たり biçimi', ['見たり', 'みたり'], 'た biçimi + り: 見た → 見たり.'),
    ],
    'もう / まだ — artık ve henüz': [
      sec('「もう昼ご飯を食べましたか。」 Henüz yemediysen:', ['いいえ、まだ食べていません。', 'いいえ、まだ食べませんでした。', 'はい、まだです。', 'いいえ、もう食べません。'], 0, '“Henüz …medim”: まだ + 〜ていません (ませんでした değil).'),
      sec('「もう寝ました」 ne demek?', ['Yattım bile.', 'Henüz yatmadım.', 'Yine yattım.', 'Yatacağım.'], 0, 'もう + ました = çoktan, bile.'),
      yaz('“Henüz yatmadım.” → まだ寝て＿＿＿＿。', ['いません'], 'まだ寝ていません (mada nete imasen).'),
    ],
  },
  u14: {
    '〜がほしいです — bir ŞEY istemek': [
      sec('新しいけいたい＿＿ほしいです。', ['が', 'を', 'に', 'で'], 0, 'İstenen şey が ile: 〜がほしいです.'),
      sec('「何もほしくないです」 ne demek?', ['Hiçbir şey istemiyorum.', 'Her şeyi istiyorum.', 'Bir şey istedim.', 'Ne istiyorsun?'], 0, 'ほしい い-sıfat gibi çekilir: ほしくない.'),
      yaz('“Yeni bir çanta istiyorum.” → 新しいかばんが＿＿＿です。', ['ほしい'], 'かばんがほしいです (hoshii desu).'),
    ],
    '〜ないでください — “lütfen …me”': [
      sec('“Lütfen dışarı çıkmayın.”', ['外に出ないでください。', '外に出てください。', '外に出なくてください。', '外に出ませんください。'], 0, 'ない biçimi + でください.'),
      yaz('食べる → “lütfen yemeyin” (…ないでください)', ['食べないでください', 'たべないでください'], '食べない + でください.'),
      sec('「ここに座らないでください」 ne demek?', ['Lütfen buraya oturmayın.', 'Lütfen buraya oturun.', 'Buraya oturabilirsiniz.', 'Buraya oturmadım.'], 0, 'ないでください = lütfen …me.'),
    ],
    '〜なければなりません — zorunluluk': [
      sec('飲む → “içmem gerekiyor”', ['飲まなければなりません', '飲みなければなりません', '飲むなければなりません', '飲まないければなりません'], 0, 'ない biçimi 飲まない → ない yerine なければなりません.'),
      sec('「明日は早く起きなければなりません」', ['Yarın erken kalkmam gerekiyor.', 'Yarın erken kalkmamalıyım.', 'Yarın erken kalkmayacağım.', 'Yarın erken kalkabilirim.'], 0, 'Çift olumsuz gibi görünür ama anlamı “-meli”.'),
      yaz('行く → “gitmem gerekiyor” (…なければなりません)', ['行かなければなりません', 'いかなければなりません'], '行かない → 行かなければなりません.'),
    ],
    '〜たことがあります — deneyim': [
      sec('“Japonya’ya bir kez gittim (deneyim).”', ['一度日本へ行ったことがあります。', '一度日本へ行くことがあります。', '一度日本へ行きたいです。', '一度日本へ行っています。'], 0, 'た biçimi + ことがあります.'),
      sec('「外国に住んだことがありますか」', ['Hiç yurt dışında yaşadın mı?', 'Yurt dışında yaşıyor musun?', 'Yurt dışında yaşamak ister misin?', 'Yurt dışında yaşayacak mısın?'], 0, 'たことがありますか = hiç …dın mı?'),
      yaz('“(Daha önce) izledim” → 見た＿＿＿があります。', ['こと'], '見たことがあります (mita koto ga arimasu).'),
    ],
    '〜つもりです — plan': [
      sec('“Gelecek yıl Japonya’ya gitmeyi düşünüyorum.”', ['来年、日本へ行くつもりです。', '来年、日本へ行ったつもりです。', '来年、日本へ行きますつもりです。', '来年、日本へ行ってつもりです。'], 0, 'Sözlük biçimi + つもりです.'),
      sec('「今日は何も食べないつもりです」', ['Bugün hiçbir şey yememeyi düşünüyorum.', 'Bugün hiçbir şey yemedim.', 'Bugün her şeyi yiyeceğim.', 'Bugün yemek yemem gerekiyor.'], 0, 'ない biçimi + つもり = yapmamayı düşünmek.'),
      yaz('“Ders çalışmayı düşünüyorum.” → べんきょうする＿＿＿です。', ['つもり'], 'べんきょうするつもりです (tsumori desu).'),
    ],
  },
}
