// Okuma alıştırmaları: kısa, basit metinler.
//
// NEDEN: ünitelerde birer okuma metni var ama öğrenci daha çok ve daha kolay
// metinle pratik yapmak istedi; romaji ve Türkçe gizlenebilsin ki koltuk
// değneği olmadan okumayı deneyebilsin.
//
// KURAL: her metin yalnızca `unite` ile gösterilen üniteye KADAR öğretilmiş
// kelime ve dilbilgisiyle yazıldı (1. düzeyde yalnızca です cümleleri, ます
// 3. düzeyden, sıfatlar 7'den, て biçimi 9'dan sonra). Böylece metin okunurken
// takılınan şey yeni bilgi değil, okumanın kendisi oluyor.
// scripts/check-okuma.ts görülmemiş kanjiyi ve romaji–okunuş tutarlılığını
// denetler. Romaji elle yazıldı.

export interface OkumaSatir {
  ja: string
  kana: string
  latin: string
  tr: string
  /** Diyalogda konuşan: A / B */
  kim?: string
}

export interface OkumaSoru {
  s: string
  o: string[]
  d: number
  /** Cevabın metindeki dayanağı */
  a: string
}

export interface OkumaMetni {
  id: string
  /** Hangi üniteyi bitiren okuyabilir */
  unite: string
  baslik: string
  baslikTr: string
  giris: string
  satirlar: OkumaSatir[]
  sorular: OkumaSoru[]
}

const s = (ja: string, kana: string, latin: string, tr: string, kim?: string): OkumaSatir => ({ ja, kana, latin, tr, kim })
const q = (soru: string, o: string[], d: number, a: string): OkumaSoru => ({ s: soru, o, d, a })

export const OKUMA: OkumaMetni[] = [
  {
    id: 'tomodachi',
    unite: 'u1',
    baslik: '私の友だち',
    baslikTr: 'Arkadaşım',
    giris: 'Biri arkadaşını tanıtıyor. Hepsi です cümlesi.',
    satirlar: [
      s('あの人は私の友だちです。', 'あのひとはわたしのともだちです。', 'ano hito wa watashi no tomodachi desu.', 'O kişi benim arkadaşım.'),
      s('名前はケンです。', 'なまえはけんです。', 'namae wa ken desu.', 'Adı Ken.'),
      s('ケンさんは日本人です。', 'けんさんはにほんじんです。', 'ken san wa nihonjin desu.', 'Ken Japon.'),
      s('大学の学生じゃないです。', 'だいがくのがくせいじゃないです。', 'daigaku no gakusei ja nai desu.', 'Üniversite öğrencisi değil.'),
      s('日本語の先生です。', 'にほんごのせんせいです。', 'nihongo no sensei desu.', 'Japonca öğretmeni.'),
      s('私はトルコ人です。', 'わたしはとるこじんです。', 'watashi wa torukojin desu.', 'Ben Türküm.'),
      s('私は先生じゃないです。学生です。', 'わたしはせんせいじゃないです。がくせいです。', 'watashi wa sensei ja nai desu. gakusei desu.', 'Ben öğretmen değilim. Öğrenciyim.'),
    ],
    sorular: [
      q('Ken kimdir?', ['Anlatanın arkadaşı', 'Anlatanın öğrencisi', 'Bir Türk öğrenci', 'Anlatanın öğretmeni değil, komşusu'], 0, 'あの人は私の友だちです: o kişi benim arkadaşım.'),
      q('Ken ne iş yapıyor?', ['Üniversite öğrencisi', 'Japonca öğretmeni', 'Türkçe öğretmeni', 'Belli değil'], 1, '日本語の先生です: Japonca öğretmeni.'),
      q('Anlatan kişi nedir?', ['Japon öğretmen', 'Türk öğretmen', 'Türk öğrenci', 'Japon öğrenci'], 2, '私はトルコ人です … 学生です: Türk ve öğrenci.'),
    ],
  },
  {
    id: 'dare',
    unite: 'u1',
    baslik: 'あの人はだれですか',
    baslikTr: 'O kişi kim?',
    giris: 'İki kişi uzaktaki birini konuşuyor. Soru–cevap.',
    satirlar: [
      s('あの人はだれですか。', 'あのひとはだれですか。', 'ano hito wa dare desu ka.', 'O kişi kim?', 'A'),
      s('あの人はアイシェさんです。', 'あのひとはあいしぇさんです。', 'ano hito wa aishe san desu.', 'O kişi Ayşe.', 'B'),
      s('アイシェさんも学生ですか。', 'あいしぇさんもがくせいですか。', 'aishe san mo gakusei desu ka.', 'Ayşe de öğrenci mi?', 'A'),
      s('はい、そうです。大学の学生です。', 'はい、そうです。だいがくのがくせいです。', 'hai, sou desu. daigaku no gakusei desu.', 'Evet, öyle. Üniversite öğrencisi.', 'B'),
      s('日本人ですか。', 'にほんじんですか。', 'nihonjin desu ka.', 'Japon mu?', 'A'),
      s('いいえ、ちがいます。トルコ人です。', 'いいえ、ちがいます。とるこじんです。', 'iie, chigaimasu. torukojin desu.', 'Hayır, değil. Türk.', 'B'),
      s('アイシェさんは私の友だちです。', 'あいしぇさんはわたしのともだちです。', 'aishe san wa watashi no tomodachi desu.', 'Ayşe benim arkadaşım.', 'B'),
    ],
    sorular: [
      q('Ayşe öğrenci mi?', ['Evet, üniversite öğrencisi', 'Hayır, öğretmen', 'Hayır, öğrenci değil', 'Belli değil'], 0, 'はい、そうです。大学の学生です。'),
      q('Ayşe nereli?', ['Japon', 'Türk', 'Belli değil', 'Hem Japon hem Türk'], 1, 'いいえ、ちがいます。トルコ人です: Japon değil, Türk.'),
      q('Ayşe kimin arkadaşı?', ['Soruyu soranın (A)', 'Cevap verenin (B)', 'Öğretmenin', 'Kimsenin'], 1, 'Son cümleyi B söylüyor: 私の友だちです.'),
    ],
  },
  {
    id: 'kaban',
    unite: 'u2',
    baslik: 'だれのかさですか',
    baslikTr: 'Kimin şemsiyesi?',
    giris: 'Eşyalar ve sahipleri: これ, それ, あれ.',
    satirlar: [
      s('これは私のかばんです。', 'これはわたしのかばんです。', 'kore wa watashi no kaban desu.', 'Bu benim çantam.'),
      s('それは友だちのかばんです。', 'それはともだちのかばんです。', 'sore wa tomodachi no kaban desu.', 'Şu arkadaşımın çantası.'),
      s('この本は日本語の本です。', 'このほんはにほんごのほんです。', 'kono hon wa nihongo no hon desu.', 'Bu kitap Japonca kitabı.'),
      s('そのざっしも日本語のざっしですか。', 'そのざっしもにほんごのざっしですか。', 'sono zasshi mo nihongo no zasshi desu ka.', 'Şu dergi de Japonca dergi mi?'),
      s('いいえ、ちがいます。', 'いいえ、ちがいます。', 'iie, chigaimasu.', 'Hayır, değil.'),
      s('あのかさはだれのかさですか。', 'あのかさはだれのかさですか。', 'ano kasa wa dare no kasa desu ka.', 'O şemsiye kimin şemsiyesi?'),
      s('先生のかさです。', 'せんせいのかさです。', 'sensei no kasa desu.', 'Öğretmenin şemsiyesi.'),
    ],
    sorular: [
      q('Japonca olan hangisi?', ['Kitap', 'Dergi', 'İkisi de', 'Hiçbiri'], 0, 'Kitap Japonca; dergi sorulunca cevap いいえ、ちがいます.'),
      q('Şemsiye kimin?', ['Anlatanın', 'Arkadaşının', 'Öğretmenin', 'Belli değil'], 2, '先生のかさです.'),
      q('Arkadaşın çantası nerede duruyor?', ['Anlatanın yanında (これ)', 'Karşıdakinin yanında (それ)', 'Uzakta (あれ)', 'Belli değil'], 1, 'それは友だちのかばんです: それ karşıdakine yakın olanı gösterir.'),
    ],
  },
  {
    id: 'shinbun',
    unite: 'u2',
    baslik: 'これは何ですか',
    baslikTr: 'Bu ne?',
    giris: 'Masadaki eşyalar hakkında kısa bir konuşma.',
    satirlar: [
      s('これは何ですか。', 'これはなんですか。', 'kore wa nan desu ka.', 'Bu ne?', 'A'),
      s('それは新聞です。日本の新聞です。', 'それはしんぶんです。にほんのしんぶんです。', 'sore wa shinbun desu. nihon no shinbun desu.', 'O bir gazete. Japon gazetesi.', 'B'),
      s('あれも新聞ですか。', 'あれもしんぶんですか。', 'are mo shinbun desu ka.', 'O da gazete mi?', 'A'),
      s('いいえ、ちがいます。あれはざっしです。', 'いいえ、ちがいます。あれはざっしです。', 'iie, chigaimasu. are wa zasshi desu.', 'Hayır, değil. O bir dergi.', 'B'),
      s('あのざっしはだれのですか。', 'あのざっしはだれのですか。', 'ano zasshi wa dare no desu ka.', 'O dergi kimin?', 'A'),
      s('私のです。このえんぴつも私のです。', 'わたしのです。このえんぴつもわたしのです。', 'watashi no desu. kono enpitsu mo watashi no desu.', 'Benim. Bu kalem de benim.', 'B'),
    ],
    sorular: [
      q('A’nın elindeki şey ne?', ['Dergi', 'Gazete', 'Kalem', 'Kitap'], 1, 'これは何ですか → それは新聞です.'),
      q('Uzaktaki şey ne?', ['Gazete', 'Dergi', 'Kalem', 'Çanta'], 1, 'あれはざっしです.'),
      q('Dergi ve kalem kimin?', ['A’nın', 'B’nin', 'Öğretmenin', 'Dergi B’nin, kalem A’nın'], 1, '私のです。このえんぴつも私のです: ikisini de B söylüyor.'),
    ],
  },
  {
    id: 'ken-mainichi',
    unite: 'u3',
    baslik: 'ケンさんの毎日',
    baslikTr: 'Ken’in her günü',
    giris: 'Bir günlük program. Saatler ve ます biçimi.',
    satirlar: [
      s('ケンさんは毎朝七時に起きます。', 'けんさんはまいあさしちじにおきます。', 'ken san wa maiasa shichiji ni okimasu.', 'Ken her sabah yedide kalkar.'),
      s('七時半に食べます。', 'しちじはんにたべます。', 'shichiji han ni tabemasu.', 'Yedi buçukta yemek yer.'),
      s('九時から四時まで働きます。', 'くじからよじまではたらきます。', 'kuji kara yoji made hatarakimasu.', 'Dokuzdan dörde kadar çalışır.'),
      s('午後四時半に帰ります。', 'ごごよじはんにかえります。', 'gogo yoji han ni kaerimasu.', 'Öğleden sonra dört buçukta eve döner.'),
      s('毎日日本語をべんきょうします。', 'まいにちにほんごをべんきょうします。', 'mainichi nihongo o benkyou shimasu.', 'Her gün Japonca çalışır.'),
      s('九時半に寝ます。', 'くじはんにねます。', 'kuji han ni nemasu.', 'Dokuz buçukta yatar.'),
      s('明日は休みます。働きません。', 'あしたはやすみます。はたらきません。', 'ashita wa yasumimasu. hatarakimasen.', 'Yarın dinlenecek. Çalışmayacak.'),
    ],
    sorular: [
      q('Ken kaçta kalkar?', ['7:00', '7:30', '9:00', '4:00'], 0, '毎朝七時に起きます.'),
      q('Kaçtan kaça çalışır?', ['7–9', '9–4', '4–9', '9–9:30'], 1, '九時から四時まで働きます.'),
      q('Yarın ne yapacak?', ['Çalışacak', 'Japonca çalışmayacak', 'Dinlenecek, işe gitmeyecek', 'Erken kalkacak'], 2, '明日は休みます。働きません。'),
    ],
  },
  {
    id: 'kinou',
    unite: 'u3',
    baslik: '昨日と今日',
    baslikTr: 'Dün ve bugün',
    giris: 'Geçmiş ve şimdiki zaman bir arada: ました ile ます’u ayırt et.',
    satirlar: [
      s('昨日は働きませんでした。', 'きのうははたらきませんでした。', 'kinou wa hatarakimasen deshita.', 'Dün çalışmadım.'),
      s('九時に起きました。', 'くじにおきました。', 'kuji ni okimashita.', 'Dokuzda kalktım.'),
      s('午前九時半から午後四時までべんきょうしました。', 'ごぜんくじはんからごごよじまでべんきょうしました。', 'gozen kuji han kara gogo yoji made benkyou shimashita.', 'Sabah dokuz buçuktan öğleden sonra dörde kadar ders çalıştım.'),
      s('午後七時に食べました。', 'ごごしちじにたべました。', 'gogo shichiji ni tabemashita.', 'Akşam yedide yemek yedim.'),
      s('九時半に寝ました。', 'くじはんにねました。', 'kuji han ni nemashita.', 'Dokuz buçukta yattım.'),
      s('今日は七時に起きました。', 'きょうはしちじにおきました。', 'kyou wa shichiji ni okimashita.', 'Bugün yedide kalktım.'),
      s('今、九時です。九時から働きます。', 'いま、くじです。くじからはたらきます。', 'ima, kuji desu. kuji kara hatarakimasu.', 'Şu an saat dokuz. Dokuzdan itibaren çalışacağım.'),
    ],
    sorular: [
      q('Dün çalıştı mı?', ['Evet, dörde kadar', 'Hayır, çalışmadı', 'Evet, dokuzdan itibaren', 'Belli değil'], 1, '昨日は働きませんでした.'),
      q('Dün kaça kadar ders çalıştı?', ['Sabah 9:30', 'Öğleden sonra 4', 'Akşam 7', 'Akşam 9:30'], 1, '午後四時までべんきょうしました.'),
      q('Bugün kaçta kalktı?', ['7', '9', '9:30', '4'], 0, '今日は七時に起きました.'),
    ],
  },
  {
    id: 'omise',
    unite: 'u4',
    baslik: 'お店で',
    baslikTr: 'Dükkânda',
    giris: 'Alışveriş konuşması. Fiyatları ve adetleri takip et.',
    satirlar: [
      s('すみません、このりんごはいくらですか。', 'すみません、このりんごはいくらですか。', 'sumimasen, kono ringo wa ikura desu ka.', 'Affedersiniz, bu elma kaç para?', 'A'),
      s('一つ百円です。', 'ひとつひゃくえんです。', 'hitotsu hyaku en desu.', 'Tanesi yüz yen.', 'B'),
      s('じゃあ、りんごを三つください。', 'じゃあ、りんごをみっつください。', 'jaa, ringo o mittsu kudasai.', 'O zaman üç elma lütfen.', 'A'),
      s('パンはいくらですか。', 'ぱんはいくらですか。', 'pan wa ikura desu ka.', 'Ekmek kaç para?', 'A'),
      s('二百円です。', 'にひゃくえんです。', 'nihyaku en desu.', 'İki yüz yen.', 'B'),
      s('パンも二つください。', 'ぱんもふたつください。', 'pan mo futatsu kudasai.', 'İki ekmek de lütfen.', 'A'),
      s('ぜんぶで七百円です。', 'ぜんぶでななひゃくえんです。', 'zenbu de nanahyaku en desu.', 'Hepsi yedi yüz yen.', 'B'),
    ],
    sorular: [
      q('Elmanın tanesi kaç yen?', ['100', '200', '300', '700'], 0, '一つ百円です.'),
      q('Kaç ekmek aldı?', ['1', '2', '3', '5'], 1, 'パンも二つください.'),
      q('Toplam ne kadar ödedi?', ['300 yen', '400 yen', '500 yen', '700 yen'], 3, 'ぜんぶで七百円です: 3 elma (300) + 2 ekmek (400).'),
    ],
  },
  {
    id: 'kyoushitsu',
    unite: 'u5',
    baslik: '教室',
    baslikTr: 'Sınıf',
    giris: 'Bir sınıfın tarifi: kim var, ne nerede. あります ve います.',
    satirlar: [
      s('ここは教室です。', 'ここはきょうしつです。', 'koko wa kyoushitsu desu.', 'Burası sınıf.'),
      s('教室に先生がいます。', 'きょうしつにせんせいがいます。', 'kyoushitsu ni sensei ga imasu.', 'Sınıfta öğretmen var.'),
      s('学生も四人います。', 'がくせいもよにんいます。', 'gakusei mo yonin imasu.', 'Dört öğrenci de var.'),
      s('つくえの上に本があります。', 'つくえのうえにほんがあります。', 'tsukue no ue ni hon ga arimasu.', 'Masanın üstünde kitap var.'),
      s('いすの下にかばんがあります。', 'いすのしたにかばんがあります。', 'isu no shita ni kaban ga arimasu.', 'Sandalyenin altında çanta var.'),
      s('かばんの中にさいふがあります。', 'かばんのなかにさいふがあります。', 'kaban no naka ni saifu ga arimasu.', 'Çantanın içinde cüzdan var.'),
      s('先生の後ろにとけいがあります。', 'せんせいのうしろにとけいがあります。', 'sensei no ushiro ni tokei ga arimasu.', 'Öğretmenin arkasında saat var.'),
      s('教室のとなりにトイレがあります。', 'きょうしつのとなりにといれがあります。', 'kyoushitsu no tonari ni toire ga arimasu.', 'Sınıfın yanında tuvalet var.'),
    ],
    sorular: [
      q('Sınıfta kaç öğrenci var?', ['3', '4', '7', 'Hiç'], 1, '学生も四人います.'),
      q('Cüzdan nerede?', ['Masanın üstünde', 'Sandalyenin altında', 'Çantanın içinde', 'Öğretmenin arkasında'], 2, 'かばんの中にさいふがあります.'),
      q('Öğretmenin arkasında ne var?', ['Kitap', 'Çanta', 'Saat', 'Tuvalet'], 2, '先生の後ろにとけいがあります.'),
    ],
  },
  {
    id: 'raishuu',
    unite: 'u6',
    baslik: '来週',
    baslikTr: 'Gelecek hafta',
    giris: 'Gidiş geliş: kim nereye, neyle gidiyor.',
    satirlar: [
      s('来週、友だちが日本から来ます。', 'らいしゅう、ともだちがにほんからきます。', 'raishuu, tomodachi ga nihon kara kimasu.', 'Gelecek hafta arkadaşım Japonya’dan geliyor.'),
      s('友だちは一人で来ます。', 'ともだちはひとりできます。', 'tomodachi wa hitori de kimasu.', 'Arkadaşım tek başına geliyor.'),
      s('私は車で駅へ行きます。', 'わたしはくるまでえきへいきます。', 'watashi wa kuruma de eki e ikimasu.', 'Ben arabayla istasyona gideceğim.'),
      s('駅から家まで、バスで帰ります。', 'えきからいえまで、ばすでかえります。', 'eki kara ie made, basu de kaerimasu.', 'İstasyondan eve otobüsle döneceğiz.'),
      s('来週は会社へ行きません。', 'らいしゅうはかいしゃへいきません。', 'raishuu wa kaisha e ikimasen.', 'Gelecek hafta şirkete gitmeyeceğim.'),
      s('友だちと大学へ行きます。', 'ともだちとだいがくへいきます。', 'tomodachi to daigaku e ikimasu.', 'Arkadaşımla üniversiteye gideceğim.'),
    ],
    sorular: [
      q('Arkadaş nereden geliyor?', ['Türkiye’den', 'Japonya’dan', 'Üniversiteden', 'Şirketten'], 1, '友だちが日本から来ます.'),
      q('Anlatan istasyona neyle gidecek?', ['Otobüsle', 'Trenle', 'Arabayla', 'Yürüyerek'], 2, '私は車で駅へ行きます.'),
      q('Gelecek hafta nereye GİTMEYECEK?', ['İstasyona', 'Üniversiteye', 'Şirkete', 'Eve'], 2, '来週は会社へ行きません.'),
    ],
  },
  {
    id: 'machi',
    unite: 'u7',
    baslik: '私の町',
    baslikTr: 'Kasabam',
    giris: 'Bir yerin tarifi: い ve な sıfatları, olumlu ve olumsuz.',
    satirlar: [
      s('私の町は小さいです。', 'わたしのまちはちいさいです。', 'watashi no machi wa chiisai desu.', 'Kasabam küçük.'),
      s('とてもきれいな町です。', 'とてもきれいなまちです。', 'totemo kirei na machi desu.', 'Çok güzel bir kasaba.'),
      s('駅の前はにぎやかです。', 'えきのまえはにぎやかです。', 'eki no mae wa nigiyaka desu.', 'İstasyonun önü hareketli.'),
      s('駅の近くに新しいお店があります。', 'えきのちかくにあたらしいおみせがあります。', 'eki no chikaku ni atarashii omise ga arimasu.', 'İstasyonun yakınında yeni bir dükkân var.'),
      s('そのお店のパンは安いです。とてもおいしいです。', 'そのおみせのぱんはやすいです。とてもおいしいです。', 'sono omise no pan wa yasui desu. totemo oishii desu.', 'O dükkânın ekmeği ucuz. Çok lezzetli.'),
      s('私の家は古いです。あまり大きくないです。', 'わたしのいえはふるいです。あまりおおきくないです。', 'watashi no ie wa furui desu. amari ookiku nai desu.', 'Evim eski. Pek büyük değil.'),
      s('私はこの町が好きです。', 'わたしはこのまちがすきです。', 'watashi wa kono machi ga suki desu.', 'Bu kasabayı seviyorum.'),
    ],
    sorular: [
      q('Kasaba nasıl?', ['Büyük ve hareketli', 'Küçük ve güzel', 'Eski ve pahalı', 'Yeni ve sakin'], 1, '小さいです … きれいな町です.'),
      q('Dükkânın ekmeği nasıl?', ['Pahalı ama lezzetli', 'Ucuz ve lezzetli', 'Ucuz ama lezzetli değil', 'Eski'], 1, '安いです。とてもおいしいです。'),
      q('Anlatanın evi nasıl?', ['Yeni ve büyük', 'Eski ve çok büyük', 'Eski, pek büyük değil', 'Küçük ve yeni'], 2, '古いです。あまり大きくないです。'),
    ],
  },
  {
    id: 'ryokou',
    unite: 'u8',
    baslik: '先週の旅行',
    baslikTr: 'Geçen haftaki seyahat',
    giris: 'Geçmişi anlatmak: fiil, sıfat ve isimde geçmiş zaman.',
    satirlar: [
      s('先週、友だちと旅行しました。', 'せんしゅう、ともだちとりょこうしました。', 'senshuu, tomodachi to ryokou shimashita.', 'Geçen hafta arkadaşımla seyahat ettim.'),
      s('電車で行きました。', 'でんしゃでいきました。', 'densha de ikimashita.', 'Trenle gittik.'),
      s('とても寒かったですが、楽しかったです。', 'とてもさむかったですが、たのしかったです。', 'totemo samukatta desu ga, tanoshikatta desu.', 'Çok soğuktu ama eğlenceliydi.'),
      s('古い町を見ました。', 'ふるいまちをみました。', 'furui machi o mimashita.', 'Eski bir kasaba gördük.'),
      s('町はしずかでした。にぎやかじゃなかったです。', 'まちはしずかでした。にぎやかじゃなかったです。', 'machi wa shizuka deshita. nigiyaka ja nakatta desu.', 'Kasaba sakindi. Hareketli değildi.'),
      s('おととい、家へ帰りました。', 'おととい、いえへかえりました。', 'ototoi, ie e kaerimashita.', 'Evvelsi gün eve döndüm.'),
      s('昨日は休みでした。会社へ行きませんでした。', 'きのうはやすみでした。かいしゃへいきませんでした。', 'kinou wa yasumi deshita. kaisha e ikimasen deshita.', 'Dün tatildi. Şirkete gitmedim.'),
    ],
    sorular: [
      q('Neyle gittiler?', ['Arabayla', 'Otobüsle', 'Trenle', 'Yürüyerek'], 2, '電車で行きました.'),
      q('Seyahat nasıldı?', ['Sıcak ve eğlenceli', 'Soğuk ama eğlenceli', 'Soğuk ve sıkıcı', 'Zor'], 1, '寒かったですが、楽しかったです.'),
      q('Gördükleri kasaba nasıldı?', ['Hareketli', 'Sakin', 'Yeni', 'Büyük'], 1, 'しずかでした。にぎやかじゃなかったです。'),
    ],
  },
  {
    id: 'kisoku',
    unite: 'u9',
    baslik: '日本語の教室',
    baslikTr: 'Japonca sınıfı',
    giris: 'Sınıfta şu an olanlar ve kurallar: ています, てはいけません, てもいいです, てください.',
    satirlar: [
      s('ここは日本語の教室です。', 'ここはにほんごのきょうしつです。', 'koko wa nihongo no kyoushitsu desu.', 'Burası Japonca sınıfı.'),
      s('今、学生は本を読んでいます。', 'いま、がくせいはほんをよんでいます。', 'ima, gakusei wa hon o yonde imasu.', 'Şu an öğrenciler kitap okuyor.'),
      s('先生は名前を書いています。', 'せんせいはなまえをかいています。', 'sensei wa namae o kaite imasu.', 'Öğretmen isimleri yazıyor.'),
      s('教室でけいたいを使ってはいけません。', 'きょうしつでけいたいをつかってはいけません。', 'kyoushitsu de keitai o tsukatte wa ikemasen.', 'Sınıfta telefon kullanmak yasak.'),
      s('ここで食べてはいけません。', 'ここでたべてはいけません。', 'koko de tabete wa ikemasen.', 'Burada yemek yemek yasak.'),
      s('コーヒーを飲んでもいいです。', 'こーひーをのんでもいいです。', 'koohii o nonde mo ii desu.', 'Kahve içilebilir.'),
      s('先生、ゆっくり読んでください。', 'せんせい、ゆっくりよんでください。', 'sensei, yukkuri yonde kudasai.', 'Hocam, yavaş okuyun lütfen.'),
    ],
    sorular: [
      q('Öğrenciler şu an ne yapıyor?', ['İsim yazıyor', 'Kitap okuyor', 'Kahve içiyor', 'Telefon kullanıyor'], 1, '学生は本を読んでいます.'),
      q('Sınıfta ne SERBEST?', ['Telefon kullanmak', 'Yemek yemek', 'Kahve içmek', 'Hiçbiri'], 2, 'コーヒーを飲んでもいいです.'),
      q('Son cümlede öğrenci ne rica ediyor?', ['Bir kez daha okumasını', 'Yavaş okumasını', 'Yazmasını', 'Beklemesini'], 1, 'ゆっくり読んでください: yavaş okuyun lütfen.'),
    ],
  },
  {
    id: 'yasumi',
    unite: 'u10',
    baslik: '明日、ひまですか',
    baslikTr: 'Yarın boş musun?',
    giris: 'Davet ve plan: ませんか, ましょう, たいです, から.',
    satirlar: [
      s('明日はひまですか。', 'あしたはひまですか。', 'ashita wa hima desu ka.', 'Yarın boş musun?', 'A'),
      s('はい、ひまです。', 'はい、ひまです。', 'hai, hima desu.', 'Evet, boşum.', 'B'),
      s('じゃあ、いっしょに映画を見ませんか。', 'じゃあ、いっしょにえいがをみませんか。', 'jaa, issho ni eiga o mimasen ka.', 'O zaman birlikte film izlemez miyiz?', 'A'),
      s('いいですね。見ましょう。', 'いいですね。みましょう。', 'ii desu ne. mimashou.', 'İyi fikir. İzleyelim.', 'B'),
      s('私は日本の料理も食べたいです。', 'わたしはにほんのりょうりもたべたいです。', 'watashi wa nihon no ryouri mo tabetai desu.', 'Ben Japon yemeği de yemek istiyorum.', 'A'),
      s('私は料理が下手ですから、お店で食べましょう。', 'わたしはりょうりがへたですから、おみせでたべましょう。', 'watashi wa ryouri ga heta desu kara, omise de tabemashou.', 'Ben yemek yapmakta beceriksizim, o yüzden dükkânda yiyelim.', 'B'),
      s('四時に駅の前で会いましょう。', 'よじにえきのまえであいましょう。', 'yoji ni eki no mae de aimashou.', 'Saat dörtte istasyonun önünde buluşalım.', 'A'),
    ],
    sorular: [
      q('Yarın ne yapacaklar?', ['Alışveriş', 'Film izleyip yemek yiyecekler', 'Ders çalışacaklar', 'Spor yapacaklar'], 1, '映画を見ませんか → 見ましょう; 料理も食べたいです.'),
      q('Neden dükkânda yiyecekler?', ['B meşgul', 'B yemek yapmakta beceriksiz', 'A yemek yapmayı sevmiyor', 'Ev uzak'], 1, '料理が下手ですから: beceriksiz olduğum için.'),
      q('Nerede buluşacaklar?', ['Sinemada', 'Dükkânda', 'İstasyonun önünde', 'Evde'], 2, '四時に駅の前で会いましょう.'),
    ],
  },
  {
    id: 'kazoku',
    unite: 'u11',
    baslik: '私の家族',
    baslikTr: 'Ailem',
    giris: 'Aile tanıtımı: kendi ailen için 父, 母, 兄.',
    satirlar: [
      s('私の家族は四人です。', 'わたしのかぞくはよにんです。', 'watashi no kazoku wa yonin desu.', 'Ailem dört kişi.'),
      s('父と母と兄と私です。', 'ちちとははとあにとわたしです。', 'chichi to haha to ani to watashi desu.', 'Babam, annem, ağabeyim ve ben.'),
      s('父は会社で働いています。', 'ちちはかいしゃではたらいています。', 'chichi wa kaisha de hataraite imasu.', 'Babam bir şirkette çalışıyor.'),
      s('母は料理が上手です。', 'はははりょうりがじょうずです。', 'haha wa ryouri ga jouzu desu.', 'Annem yemek yapmakta usta.'),
      s('兄は大学の学生です。日本語をべんきょうしています。', 'あにはだいがくのがくせいです。にほんごをべんきょうしています。', 'ani wa daigaku no gakusei desu. nihongo o benkyou shite imasu.', 'Ağabeyim üniversite öğrencisi. Japonca çalışıyor.'),
      s('兄は日本語が上手だと思います。', 'あにはにほんごがじょうずだとおもいます。', 'ani wa nihongo ga jouzu da to omoimasu.', 'Bence ağabeyimin Japoncası iyi.'),
      s('妹と弟はいません。', 'いもうととおとうとはいません。', 'imouto to otouto wa imasen.', 'Kız ve erkek kardeşim yok.'),
    ],
    sorular: [
      q('Aile kaç kişi?', ['3', '4', '5', '6'], 1, '私の家族は四人です.'),
      q('Baba ne yapıyor?', ['Üniversitede okuyor', 'Şirkette çalışıyor', 'Yemek yapıyor', 'Japonca öğretiyor'], 1, '父は会社で働いています.'),
      q('Anlatanın küçük kardeşi var mı?', ['Evet, bir kız kardeşi', 'Evet, bir erkek kardeşi', 'Hayır, yok', 'Belli değil'], 2, '妹と弟はいません.'),
    ],
  },
  {
    id: 'tenki',
    unite: 'u12',
    baslik: '天気',
    baslikTr: 'Hava',
    giris: 'Hava durumu ve karşılaştırma: より, のほうが, 一番, でしょう.',
    satirlar: [
      s('今日は晴れです。空がきれいです。', 'きょうははれです。そらがきれいです。', 'kyou wa hare desu. sora ga kirei desu.', 'Bugün hava açık. Gökyüzü güzel.'),
      s('昨日は雨でした。', 'きのうはあめでした。', 'kinou wa ame deshita.', 'Dün yağmurluydu.'),
      s('今日は昨日より暑いです。', 'きょうはきのうよりあついです。', 'kyou wa kinou yori atsui desu.', 'Bugün dünden daha sıcak.'),
      s('明日はくもりでしょう。すずしくなるでしょう。', 'あしたはくもりでしょう。すずしくなるでしょう。', 'ashita wa kumori deshou. suzushiku naru deshou.', 'Yarın muhtemelen bulutlu olacak. Hava serinleyecek.'),
      s('私の国は、南より北のほうが寒いです。', 'わたしのくには、みなみよりきたのほうがさむいです。', 'watashi no kuni wa, minami yori kita no hou ga samui desu.', 'Benim ülkemde kuzey güneyden daha soğuk.'),
      s('北は山が多いです。', 'きたはやまがおおいです。', 'kita wa yama ga ooi desu.', 'Kuzeyde dağ çok.'),
      s('一年の中で、なつが一番好きです。', 'いちねんのなかで、なつがいちばんすきです。', 'ichinen no naka de, natsu ga ichiban suki desu.', 'Yıl içinde en çok yazı severim.'),
    ],
    sorular: [
      q('Bugün hava nasıl?', ['Yağmurlu', 'Açık', 'Bulutlu', 'Soğuk'], 1, '今日は晴れです.'),
      q('Yarın nasıl olacak?', ['Açık ve sıcak', 'Yağmurlu', 'Bulutlu ve serin', 'Karlı'], 2, 'くもりでしょう。すずしくなるでしょう。'),
      q('Hangisi daha soğuk?', ['Güney', 'Kuzey', 'İkisi aynı', 'Belli değil'], 1, '南より北のほうが寒いです: kuzey daha soğuk.'),
    ],
  },
  {
    id: 'nichiyoubi',
    unite: 'u13',
    baslik: '私の日曜日',
    baslikTr: 'Pazar günüm',
    giris: 'Günün sırası: てから, ながら, たり〜たり, 前に, まだ.',
    satirlar: [
      s('日曜日は九時に起きます。', 'にちようびはくじにおきます。', 'nichiyoubi wa kuji ni okimasu.', 'Pazar günü dokuzda kalkarım.'),
      s('そうじをしたり、せんたくをしたりします。', 'そうじをしたり、せんたくをしたりします。', 'souji o shitari, sentaku o shitari shimasu.', 'Temizlik, çamaşır gibi işler yaparım.'),
      s('昼ご飯を食べてから、外に出ます。', 'ひるごはんをたべてから、そとにでます。', 'hirugohan o tabete kara, soto ni demasu.', 'Öğle yemeği yedikten sonra dışarı çıkarım.'),
      s('音楽を聞きながら、歩きます。', 'おんがくをききながら、あるきます。', 'ongaku o kikinagara, arukimasu.', 'Müzik dinleyerek yürürüm.'),
      s('晩ご飯の前に、おふろに入ります。', 'ばんごはんのまえに、おふろにはいります。', 'bangohan no mae ni, ofuro ni hairimasu.', 'Akşam yemeğinden önce banyo yaparım.'),
      s('寝る前に、本を読みます。', 'ねるまえに、ほんをよみます。', 'neru mae ni, hon o yomimasu.', 'Yatmadan önce kitap okurum.'),
      s('今、午後七時です。まだ晩ご飯を食べていません。', 'いま、ごごしちじです。まだばんごはんをたべていません。', 'ima, gogo shichiji desu. mada bangohan o tabete imasen.', 'Şu an akşam yedi. Henüz akşam yemeği yemedim.'),
    ],
    sorular: [
      q('Ne zaman dışarı çıkar?', ['Kalkınca hemen', 'Öğle yemeğinden sonra', 'Akşam yemeğinden sonra', 'Banyodan sonra'], 1, '昼ご飯を食べてから、外に出ます.'),
      q('Yürürken ne yapar?', ['Kitap okur', 'Müzik dinler', 'Konuşur', 'Hiçbir şey'], 1, '音楽を聞きながら、歩きます.'),
      q('Ne zaman banyo yapar?', ['Akşam yemeğinden önce', 'Akşam yemeğinden sonra', 'Yatmadan hemen önce', 'Sabah'], 0, '晩ご飯の前に、おふろに入ります.'),
    ],
  },
  {
    id: 'kaze',
    unite: 'u14',
    baslik: 'かぜ',
    baslikTr: 'Soğuk algınlığı',
    giris: 'Hastalık ve yapılması gerekenler: なければなりません, つもりです.',
    satirlar: [
      s('昨日からあたまがいたいです。ねつもあります。', 'きのうからあたまがいたいです。ねつもあります。', 'kinou kara atama ga itai desu. netsu mo arimasu.', 'Dünden beri başım ağrıyor. Ateşim de var.'),
      s('今日、病院へ行きました。', 'きょう、びょういんへいきました。', 'kyou, byouin e ikimashita.', 'Bugün hastaneye gittim.'),
      s('かぜでした。', 'かぜでした。', 'kaze deshita.', 'Soğuk algınlığıymış.'),
      s('毎日くすりを飲まなければなりません。', 'まいにちくすりをのまなければなりません。', 'mainichi kusuri o nomanakereba narimasen.', 'Her gün ilaç içmem gerekiyor.'),
      s('早く寝なければなりません。', 'はやくねなければなりません。', 'hayaku nenakereba narimasen.', 'Erken yatmam gerekiyor.'),
      s('明日は外に出ないつもりです。', 'あしたはそとにでないつもりです。', 'ashita wa soto ni denai tsumori desu.', 'Yarın dışarı çıkmamayı düşünüyorum.'),
      s('来週は試験がありますから、早く元気になりたいです。', 'らいしゅうはしけんがありますから、はやくげんきになりたいです。', 'raishuu wa shiken ga arimasu kara, hayaku genki ni naritai desu.', 'Gelecek hafta sınav var, o yüzden bir an önce iyileşmek istiyorum.'),
    ],
    sorular: [
      q('Neresi ağrıyor?', ['Karnı', 'Başı', 'Kulağı', 'Bacağı'], 1, 'あたまがいたいです.'),
      q('Ne yapması gerekiyor?', ['İlaç içmek ve erken yatmak', 'Dışarı çıkmak', 'Hastaneye yeniden gitmek', 'Ders çalışmak'], 0, 'くすりを飲まなければなりません … 早く寝なければなりません.'),
      q('Neden bir an önce iyileşmek istiyor?', ['İşe gidecek', 'Seyahate çıkacak', 'Gelecek hafta sınavı var', 'Arkadaşı gelecek'], 2, '来週は試験がありますから.'),
    ],
  },
]

export const OKUMA_BY_ID = new Map(OKUMA.map((m) => [m.id, m]))
