import type { UnitLine } from './types'

// Ünite kelime kartlarındaki örnek cümleler.
//
// NEDEN: kelime kartında yalnızca kelime ve anlamı vardı. Öğrenci kelimenin
// cümlede nasıl kullanıldığını görmek, cümle yapısını pekiştirmek ve kelimeyi
// bir bağlamla hatırlamak istedi.
//
// KURAL: her cümle yalnızca O ÜNİTEYE KADAR görülmüş kelimeler ve dilbilgisiyle
// yazıldı (önceki ünitelerin kelimeleri serbest). 1. ünitede yalnızca
// です / じゃないです / か / の / も; ます biçimi 3. üniteden, て biçimi 9.
// üniteden sonra. Kanji denetimi scripts/check-kelime-ornekleri.ts'de:
// görülmemiş kanji taşıyan cümle olmamalı.
//
// Biçim: [yazılış, kana, Türkçe, romaji]. Anahtar ünite kelimesinin yazılışı.
// Romaji elle yazıldı: otomatik bölme kana ağırlıklı cümlelerde kelimeleri
// birleştiriyordu (korewadare, ashitaha wa tarakimasu).

type Ornek = [ja: string, kana: string, tr: string, latin: string]

const ORNEKLER: Record<string, Record<string, Ornek>> = {
  u1: {
    私: ['私は学生です。', 'わたしはがくせいです。', 'Ben öğrenciyim.', 'watashi wa gakusei desu.'],
    名前: ['あの人の名前は何ですか。', 'あのひとのなまえはなんですか。', 'O kişinin adı ne?', 'ano hito no namae wa nan desu ka.'],
    学生: ['私も学生です。', 'わたしもがくせいです。', 'Ben de öğrenciyim.', 'watashi mo gakusei desu.'],
    先生: ['あの人は日本語の先生です。', 'あのひとはにほんごのせんせいです。', 'O kişi Japonca öğretmeni.', 'ano hito wa nihongo no sensei desu.'],
    大学: ['大学の先生ですか。', 'だいがくのせんせいですか。', 'Üniversite hocası mısınız?', 'daigaku no sensei desu ka.'],
    日本人: ['先生は日本人です。', 'せんせいはにほんじんです。', 'Öğretmen Japon.', 'sensei wa nihonjin desu.'],
    トルコ人: ['私の友だちもトルコ人です。', 'わたしのともだちもとるこじんです。', 'Arkadaşım da Türk.', 'watashi no tomodachi mo torukojin desu.'],
    日本語: ['日本語の先生は日本人です。', 'にほんごのせんせいはにほんじんです。', 'Japonca öğretmeni Japon.', 'nihongo no sensei wa nihonjin desu.'],
    友だち: ['あの人は私の友だちです。', 'あのひとはわたしのともだちです。', 'O kişi benim arkadaşım.', 'ano hito wa watashi no tomodachi desu.'],
    人: ['あの人は先生ですか。', 'あのひとはせんせいですか。', 'O kişi öğretmen mi?', 'ano hito wa sensei desu ka.'],
    何: ['名前は何ですか。', 'なまえはなんですか。', 'Adın ne?', 'namae wa nan desu ka.'],
    はじめまして: ['はじめまして。エフェです。', 'はじめまして。えふぇです。', 'Memnun oldum, ben Efe.', 'hajimemashite. efe desu.'],
    よろしくおねがいします: [
      'トルコ人のエフェです。よろしくおねがいします。',
      'とるこじんのえふぇです。よろしくおねがいします。',
      'Türk Efe’yim. Tanıştığımıza memnun oldum.',
      'torukojin no efe desu. yoroshiku onegaishimasu.',
    ],
    そうです: ['学生ですか。はい、そうです。', 'がくせいですか。はい、そうです。', 'Öğrenci misin? Evet, öyle.', 'gakusei desu ka. hai, sou desu.'],
    ちがいます: ['先生ですか。いいえ、ちがいます。', 'せんせいですか。いいえ、ちがいます。', 'Öğretmen misiniz? Hayır, değilim.', 'sensei desu ka. iie, chigaimasu.'],
    あの人: ['あの人は日本人ですか。', 'あのひとはにほんじんですか。', 'O kişi Japon mu?', 'ano hito wa nihonjin desu ka.'],
  },
  u2: {
    これ: ['これは私の本です。', 'これはわたしのほんです。', 'Bu benim kitabım.', 'kore wa watashi no hon desu.'],
    それ: ['それは何ですか。', 'それはなんですか。', 'Şu ne?', 'sore wa nan desu ka.'],
    あれ: ['あれは先生のかばんです。', 'あれはせんせいのかばんです。', 'O, öğretmenin çantası.', 'are wa sensei no kaban desu.'],
    どれ: ['エフェさんのかさはどれですか。', 'えふぇさんのかさはどれですか。', 'Efe’nin şemsiyesi hangisi?', 'efe san no kasa wa dore desu ka.'],
    この: ['この本は日本語の本です。', 'このほんはにほんごのほんです。', 'Bu kitap Japonca kitabı.', 'kono hon wa nihongo no hon desu.'],
    本: ['これはだれの本ですか。', 'これはだれのほんですか。', 'Bu kimin kitabı?', 'kore wa dare no hon desu ka.'],
    かばん: ['そのかばんは友だちのかばんです。', 'そのかばんはともだちのかばんです。', 'Şu çanta arkadaşımın çantası.', 'sono kaban wa tomodachi no kaban desu.'],
    とけい: ['あのとけいは日本のとけいです。', 'あのとけいはにほんのとけいです。', 'O saat bir Japon saati.', 'ano tokei wa nihon no tokei desu.'],
    かさ: ['これは私のかさじゃないです。', 'これはわたしのかさじゃないです。', 'Bu benim şemsiyem değil.', 'kore wa watashi no kasa ja nai desu.'],
    くつ: ['それはだれのくつですか。', 'それはだれのくつですか。', 'Şu kimin ayakkabısı?', 'sore wa dare no kutsu desu ka.'],
    ざっし: ['これは日本語のざっしです。', 'これはにほんごのざっしです。', 'Bu Japonca bir dergi.', 'kore wa nihongo no zasshi desu.'],
    新聞: ['それは日本の新聞ですか。', 'それはにほんのしんぶんですか。', 'Şu Japon gazetesi mi?', 'sore wa nihon no shinbun desu ka.'],
    えんぴつ: ['これはえんぴつですか。はい、そうです。', 'これはえんぴつですか。はい、そうです。', 'Bu kurşun kalem mi? Evet.', 'kore wa enpitsu desu ka. hai, sou desu.'],
    けいたい: ['それは私のけいたいです。', 'それはわたしのけいたいです。', 'Şu benim telefonum.', 'sore wa watashi no keitai desu.'],
    つくえ: ['このつくえは先生のつくえです。', 'このつくえはせんせいのつくえです。', 'Bu masa öğretmenin masası.', 'kono tsukue wa sensei no tsukue desu.'],
    いす: ['あのいすは私のいすじゃないです。', 'あのいすはわたしのいすじゃないです。', 'O sandalye benim değil.', 'ano isu wa watashi no isu ja nai desu.'],
    だれ: ['あの人はだれですか。', 'あのひとはだれですか。', 'O kişi kim?', 'ano hito wa dare desu ka.'],
    ちがいます: [
      'これはエフェさんのかばんですか。いいえ、ちがいます。',
      'これはえふぇさんのかばんですか。いいえ、ちがいます。',
      'Bu Efe’nin çantası mı? Hayır, değil.',
      'kore wa efe san no kaban desu ka. iie, chigaimasu.',
    ],
  },
  u3: {
    今: ['今、何時ですか。', 'いま、なんじですか。', 'Şu an saat kaç?', 'ima, nanji desu ka.'],
    何時: ['何時に起きますか。', 'なんじにおきますか。', 'Saat kaçta kalkıyorsun?', 'nanji ni okimasu ka.'],
    半: ['七時半に起きます。', 'しちじはんにおきます。', 'Yedi buçukta kalkarım.', 'shichiji han ni okimasu.'],
    午前: ['午前九時から働きます。', 'ごぜんくじからはたらきます。', 'Sabah dokuzdan itibaren çalışırım.', 'gozen kuji kara hatarakimasu.'],
    午後: ['午後四時に帰ります。', 'ごごよじにかえります。', 'Öğleden sonra dörtte eve dönerim.', 'gogo yoji ni kaerimasu.'],
    毎日: ['毎日日本語をべんきょうします。', 'まいにちにほんごをべんきょうします。', 'Her gün Japonca çalışırım.', 'mainichi nihongo o benkyou shimasu.'],
    毎朝: ['毎朝七時に起きます。', 'まいあさしちじにおきます。', 'Her sabah yedide kalkarım.', 'maiasa shichiji ni okimasu.'],
    起きます: ['明日は四時に起きます。', 'あしたはよじにおきます。', 'Yarın dörtte kalkacağım.', 'ashita wa yoji ni okimasu.'],
    寝ます: ['昨日は九時に寝ました。', 'きのうはくじにねました。', 'Dün dokuzda yattım.', 'kinou wa kuji ni nemashita.'],
    食べます: ['何を食べますか。', 'なにをたべますか。', 'Ne yiyorsun?', 'nani o tabemasu ka.'],
    飲みます: ['毎朝何を飲みますか。', 'まいあさなにをのみますか。', 'Her sabah ne içersin?', 'maiasa nani o nomimasu ka.'],
    べんきょうします: ['午後九時までべんきょうします。', 'ごごくじまでべんきょうします。', 'Akşam dokuza kadar ders çalışırım.', 'gogo kuji made benkyou shimasu.'],
    働きます: ['毎日九時から四時まで働きます。', 'まいにちくじからよじまではたらきます。', 'Her gün dokuzdan dörde kadar çalışırım.', 'mainichi kuji kara yoji made hatarakimasu.'],
    行きます: ['何時に行きますか。', 'なんじにいきますか。', 'Saat kaçta gidiyorsun?', 'nanji ni ikimasu ka.'],
    帰ります: ['昨日は九時に帰りました。', 'きのうはくじにかえりました。', 'Dün dokuzda eve döndüm.', 'kinou wa kuji ni kaerimashita.'],
    休みます: ['明日は休みます。', 'あしたはやすみます。', 'Yarın izin yapacağım.', 'ashita wa yasumimasu.'],
    昨日: ['昨日はべんきょうしませんでした。', 'きのうはべんきょうしませんでした。', 'Dün ders çalışmadım.', 'kinou wa benkyou shimasen deshita.'],
    明日: ['明日は働きません。', 'あしたははたらきません。', 'Yarın çalışmıyorum.', 'ashita wa hatarakimasen.'],
  },
  u4: {
    いくら: ['このりんごはいくらですか。', 'このりんごはいくらですか。', 'Bu elma kaç para?', 'kono ringo wa ikura desu ka.'],
    円: ['このかばんは三千円です。', 'このかばんはさんぜんえんです。', 'Bu çanta üç bin yen.', 'kono kaban wa sanzen en desu.'],
    ください: ['これをください。', 'これをください。', 'Bunu alayım lütfen.', 'kore o kudasai.'],
    高い: ['この本は高いです。', 'このほんはたかいです。', 'Bu kitap pahalı.', 'kono hon wa takai desu.'],
    安い: ['このお店のパンは安いです。', 'このおみせのぱんはやすいです。', 'Bu dükkânın ekmeği ucuz.', 'kono omise no pan wa yasui desu.'],
    お店: ['あのお店のコーヒーは三百円です。', 'あのおみせのこーひーはさんびゃくえんです。', 'O dükkânın kahvesi üç yüz yen.', 'ano omise no koohii wa sanbyaku en desu.'],
    コーヒー: ['コーヒーを一つください。', 'こーひーをひとつください。', 'Bir kahve lütfen.', 'koohii o hitotsu kudasai.'],
    パン: ['このパンはいくらですか。', 'このぱんはいくらですか。', 'Bu ekmek kaç para?', 'kono pan wa ikura desu ka.'],
    りんご: ['りんごを三つください。', 'りんごをみっつください。', 'Üç elma lütfen.', 'ringo o mittsu kudasai.'],
    切手: ['切手を五枚ください。', 'きってをごまいください。', 'Beş pul lütfen.', 'kitte o gomai kudasai.'],
    ぜんぶで: ['ぜんぶでいくらですか。', 'ぜんぶでいくらですか。', 'Hepsi kaç para?', 'zenbu de ikura desu ka.'],
    一つ: ['このりんごは一つ百円です。', 'このりんごはひとつひゃくえんです。', 'Bu elmaların tanesi yüz yen.', 'kono ringo wa hitotsu hyaku en desu.'],
    二つ: ['パンを二つください。', 'ぱんをふたつください。', 'İki ekmek lütfen.', 'pan o futatsu kudasai.'],
    三つ: ['三つでいくらですか。', 'みっつでいくらですか。', 'Üç tanesi kaç para?', 'mittsu de ikura desu ka.'],
    百: ['このえんぴつは百円です。', 'このえんぴつはひゃくえんです。', 'Bu kalem yüz yen.', 'kono enpitsu wa hyaku en desu.'],
    千: ['この本は千八百円です。', 'このほんはせんはっぴゃくえんです。', 'Bu kitap bin sekiz yüz yen.', 'kono hon wa sen happyaku en desu.'],
    一万: ['このとけいは一万円です。', 'このとけいはいちまんえんです。', 'Bu saat on bin yen.', 'kono tokei wa ichiman en desu.'],
    じゃあ: ['じゃあ、それを三つください。', 'じゃあ、それをみっつください。', 'O zaman şundan üç tane lütfen.', 'jaa, sore o mittsu kudasai.'],
  },
  u5: {
    上: ['つくえの上に本があります。', 'つくえのうえにほんがあります。', 'Masanın üstünde kitap var.', 'tsukue no ue ni hon ga arimasu.'],
    下: ['いすの下にかばんがあります。', 'いすのしたにかばんがあります。', 'Sandalyenin altında çanta var.', 'isu no shita ni kaban ga arimasu.'],
    中: ['かばんの中にさいふがあります。', 'かばんのなかにさいふがあります。', 'Çantanın içinde cüzdan var.', 'kaban no naka ni saifu ga arimasu.'],
    前: ['駅の前に銀行があります。', 'えきのまえにぎんこうがあります。', 'İstasyonun önünde banka var.', 'eki no mae ni ginkou ga arimasu.'],
    後ろ: ['先生の後ろにエフェさんがいます。', 'せんせいのうしろにえふぇさんがいます。', 'Öğretmenin arkasında Efe var.', 'sensei no ushiro ni efe san ga imasu.'],
    となり: ['病院のとなりにお店があります。', 'びょういんのとなりにおみせがあります。', 'Hastanenin yanında dükkân var.', 'byouin no tonari ni omise ga arimasu.'],
    近く: ['家の近くに駅があります。', 'いえのちかくにえきがあります。', 'Evin yakınında istasyon var.', 'ie no chikaku ni eki ga arimasu.'],
    ここ: ['ここは教室です。', 'ここはきょうしつです。', 'Burası sınıf.', 'koko wa kyoushitsu desu.'],
    そこ: ['本はそこにあります。', 'ほんはそこにあります。', 'Kitap şurada.', 'hon wa soko ni arimasu.'],
    あそこ: ['銀行はあそこです。', 'ぎんこうはあそこです。', 'Banka orada.', 'ginkou wa asoko desu.'],
    どこ: ['駅はどこですか。', 'えきはどこですか。', 'İstasyon nerede?', 'eki wa doko desu ka.'],
    家: ['友だちは家にいます。', 'ともだちはいえにいます。', 'Arkadaşım evde.', 'tomodachi wa ie ni imasu.'],
    教室: ['教室に先生がいます。', 'きょうしつにせんせいがいます。', 'Sınıfta öğretmen var.', 'kyoushitsu ni sensei ga imasu.'],
    駅: ['駅でパンを食べます。', 'えきでぱんをたべます。', 'İstasyonda ekmek yerim.', 'eki de pan o tabemasu.'],
    銀行: ['銀行は駅の近くです。', 'ぎんこうはえきのちかくです。', 'Banka istasyonun yakınında.', 'ginkou wa eki no chikaku desu.'],
    病院: ['私の家は病院のとなりです。', 'わたしのいえはびょういんのとなりです。', 'Evim hastanenin yanında.', 'watashi no ie wa byouin no tonari desu.'],
    トイレ: ['トイレはどこですか。', 'といれはどこですか。', 'Tuvalet nerede?', 'toire wa doko desu ka.'],
    さいふ: ['さいふはつくえの上にあります。', 'さいふはつくえのうえにあります。', 'Cüzdan masanın üstünde.', 'saifu wa tsukue no ue ni arimasu.'],
  },
  u6: {
    行きます: ['明日、大学へ行きます。', 'あした、だいがくへいきます。', 'Yarın üniversiteye gidiyorum.', 'ashita, daigaku e ikimasu.'],
    来ます: ['友だちが家に来ます。', 'ともだちがいえにきます。', 'Arkadaşım eve geliyor.', 'tomodachi ga ie ni kimasu.'],
    帰ります: ['九時に家へ帰ります。', 'くじにいえへかえります。', 'Dokuzda eve dönerim.', 'kuji ni ie e kaerimasu.'],
    電車: ['電車で会社へ行きます。', 'でんしゃでかいしゃへいきます。', 'Trenle şirkete giderim.', 'densha de kaisha e ikimasu.'],
    バス: ['バスで大学へ来ました。', 'ばすでだいがくへきました。', 'Üniversiteye otobüsle geldim.', 'basu de daigaku e kimashita.'],
    車: ['先生は車で来ます。', 'せんせいはくるまできます。', 'Öğretmen arabayla geliyor.', 'sensei wa kuruma de kimasu.'],
    自転車: ['自転車で駅へ行きます。', 'じてんしゃでえきへいきます。', 'Bisikletle istasyona giderim.', 'jitensha de eki e ikimasu.'],
    歩いて: ['家から駅まで歩いて行きます。', 'いえからえきまであるいていきます。', 'Evden istasyona yürüyerek giderim.', 'ie kara eki made aruite ikimasu.'],
    一人で: ['一人で日本へ行きます。', 'ひとりでにほんへいきます。', 'Japonya’ya tek başıma gidiyorum.', 'hitori de nihon e ikimasu.'],
    いつ: ['いつ国へ帰りますか。', 'いつくにへかえりますか。', 'Memleketine ne zaman dönüyorsun?', 'itsu kuni e kaerimasu ka.'],
    今日: ['今日は電車で帰ります。', 'きょうはでんしゃでかえります。', 'Bugün trenle döneceğim.', 'kyou wa densha de kaerimasu.'],
    明日: ['明日、友だちと大学へ行きます。', 'あした、ともだちとだいがくへいきます。', 'Yarın arkadaşımla üniversiteye gidiyorum.', 'ashita, tomodachi to daigaku e ikimasu.'],
    来週: ['来週、日本から友だちが来ます。', 'らいしゅう、にほんからともだちがきます。', 'Gelecek hafta Japonya’dan arkadaşım geliyor.', 'raishuu, nihon kara tomodachi ga kimasu.'],
    先週: ['先週、友だちと銀行へ行きました。', 'せんしゅう、ともだちとぎんこうへいきました。', 'Geçen hafta arkadaşımla bankaya gittim.', 'senshuu, tomodachi to ginkou e ikimashita.'],
    会社: ['毎朝バスで会社へ行きます。', 'まいあさばすでかいしゃへいきます。', 'Her sabah otobüsle şirkete giderim.', 'maiasa basu de kaisha e ikimasu.'],
    国: ['先生の国はどこですか。', 'せんせいのくにはどこですか。', 'Öğretmenin memleketi neresi?', 'sensei no kuni wa doko desu ka.'],
  },
  u7: {
    大きい: ['私の大学は大きいです。', 'わたしのだいがくはおおきいです。', 'Üniversitem büyük.', 'watashi no daigaku wa ookii desu.'],
    小さい: ['このかばんは小さいです。', 'このかばんはちいさいです。', 'Bu çanta küçük.', 'kono kaban wa chiisai desu.'],
    新しい: ['私のけいたいは新しいです。', 'わたしのけいたいはあたらしいです。', 'Telefonum yeni.', 'watashi no keitai wa atarashii desu.'],
    古い: ['この本はとても古いです。', 'このほんはとてもふるいです。', 'Bu kitap çok eski.', 'kono hon wa totemo furui desu.'],
    白い: ['あの白い車は先生の車です。', 'あのしろいくるまはせんせいのくるまです。', 'O beyaz araba öğretmenin arabası.', 'ano shiroi kuruma wa sensei no kuruma desu.'],
    長い: ['このえんぴつは長いです。', 'このえんぴつはながいです。', 'Bu kalem uzun.', 'kono enpitsu wa nagai desu.'],
    高い: ['このとけいはとても高いです。', 'このとけいはとてもたかいです。', 'Bu saat çok pahalı.', 'kono tokei wa totemo takai desu.'],
    安い: ['このお店のコーヒーは安くないです。', 'このおみせのこーひーはやすくないです。', 'Bu dükkânın kahvesi ucuz değil.', 'kono omise no koohii wa yasuku nai desu.'],
    おいしい: ['このパンはおいしいです。', 'このぱんはおいしいです。', 'Bu ekmek lezzetli.', 'kono pan wa oishii desu.'],
    いい: ['このかさはあまりよくないです。', 'このかさはあまりよくないです。', 'Bu şemsiye pek iyi değil. (いい → よくない)', 'kono kasa wa amari yoku nai desu.'],
    忙しい: ['毎日忙しいです。', 'まいにちいそがしいです。', 'Her gün meşgulüm.', 'mainichi isogashii desu.'],
    しずか: ['私の町はしずかです。', 'わたしのまちはしずかです。', 'Kasabam sakin.', 'watashi no machi wa shizuka desu.'],
    にぎやか: ['駅の前はにぎやかです。', 'えきのまえはにぎやかです。', 'İstasyonun önü hareketli.', 'eki no mae wa nigiyaka desu.'],
    きれい: ['この教室はきれいです。', 'このきょうしつはきれいです。', 'Bu sınıf temiz.', 'kono kyoushitsu wa kirei desu.'],
    ゆうめい: ['あの人はゆうめいな先生です。', 'あのひとはゆうめいなせんせいです。', 'O kişi ünlü bir öğretmen.', 'ano hito wa yuumei na sensei desu.'],
    好き: ['私は日本語が好きです。', 'わたしはにほんごがすきです。', 'Japoncayı seviyorum.', 'watashi wa nihongo ga suki desu.'],
    きらい: ['友だちはりんごがきらいです。', 'ともだちはりんごがきらいです。', 'Arkadaşım elmayı sevmez.', 'tomodachi wa ringo ga kirai desu.'],
    とても: ['この町はとてもにぎやかです。', 'このまちはとてもにぎやかです。', 'Bu şehir çok hareketli.', 'kono machi wa totemo nigiyaka desu.'],
    あまり: ['このパンはあまりおいしくないです。', 'このぱんはあまりおいしくないです。', 'Bu ekmek pek lezzetli değil.', 'kono pan wa amari oishiku nai desu.'],
    町: ['私の町は大きくないです。', 'わたしのまちはおおきくないです。', 'Kasabam büyük değil.', 'watashi no machi wa ookiku nai desu.'],
  },
  u8: {
    昨日: ['昨日はどこへ行きましたか。', 'きのうはどこへいきましたか。', 'Dün nereye gittin?', 'kinou wa doko e ikimashita ka.'],
    おととい: ['おとといは休みでした。', 'おとといはやすみでした。', 'Evvelsi gün tatildi.', 'ototoi wa yasumi deshita.'],
    先週: ['先週は試験でした。', 'せんしゅうはしけんでした。', 'Geçen hafta sınav vardı.', 'senshuu wa shiken deshita.'],
    去年: ['去年、日本へ行きました。', 'きょねん、にほんへいきました。', 'Geçen yıl Japonya’ya gittim.', 'kyonen, nihon e ikimashita.'],
    映画: ['映画はどうでしたか。', 'えいがはどうでしたか。', 'Film nasıldı?', 'eiga wa dou deshita ka.'],
    旅行: ['先週、友だちと旅行しました。', 'せんしゅう、ともだちとりょこうしました。', 'Geçen hafta arkadaşımla seyahat ettim.', 'senshuu, tomodachi to ryokou shimashita.'],
    試験: ['明日は試験です。', 'あしたはしけんです。', 'Yarın sınav var.', 'ashita wa shiken desu.'],
    休み: ['休みは何をしましたか。', 'やすみはなにをしましたか。', 'Tatilde ne yaptın?', 'yasumi wa nani o shimashita ka.'],
    楽しい: ['昨日は楽しかったです。', 'きのうはたのしかったです。', 'Dün eğlenceliydi.', 'kinou wa tanoshikatta desu.'],
    寒い: ['昨日はとても寒かったです。', 'きのうはとてもさむかったです。', 'Dün çok soğuktu.', 'kinou wa totemo samukatta desu.'],
    暑い: ['今日はあまり暑くないです。', 'きょうはあまりあつくないです。', 'Bugün pek sıcak değil.', 'kyou wa amari atsuku nai desu.'],
    難しい: ['日本語は難しいですが、楽しいです。', 'にほんごはむずかしいですが、たのしいです。', 'Japonca zor ama eğlenceli.', 'nihongo wa muzukashii desu ga, tanoshii desu.'],
    やさしい: ['試験はやさしかったです。', 'しけんはやさしかったです。', 'Sınav kolaydı.', 'shiken wa yasashikatta desu.'],
    どう: ['日本はどうでしたか。', 'にほんはどうでしたか。', 'Japonya nasıldı?', 'nihon wa dou deshita ka.'],
    見ます: ['友だちと映画を見ました。', 'ともだちとえいがをみました。', 'Arkadaşımla film izledim.', 'tomodachi to eiga o mimashita.'],
    会います: ['駅で友だちに会いました。', 'えきでともだちにあいました。', 'İstasyonda arkadaşımla buluştum.', 'eki de tomodachi ni aimashita.'],
  },
  u9: {
    待ちます: ['駅で待っています。', 'えきでまっています。', 'İstasyonda bekliyorum.', 'eki de matte imasu.'],
    書きます: ['ここに名前を書いてください。', 'ここになまえをかいてください。', 'Adınızı buraya yazın lütfen.', 'koko ni namae o kaite kudasai.'],
    読みます: ['この本を読んでもいいですか。', 'このほんをよんでもいいですか。', 'Bu kitabı okuyabilir miyim?', 'kono hon o yonde mo ii desu ka.'],
    座ります: ['ここに座ってもいいですか。', 'ここにすわってもいいですか。', 'Buraya oturabilir miyim?', 'koko ni suwatte mo ii desu ka.'],
    立ちます: ['立ってください。', 'たってください。', 'Ayağa kalkın lütfen.', 'tatte kudasai.'],
    使います: [
      '教室でけいたいを使ってはいけません。',
      'きょうしつでけいたいをつかってはいけません。',
      'Sınıfta telefon kullanmak yasak.',
      'kyoushitsu de keitai o tsukatte wa ikemasen.',
    ],
    住みます: ['私はトルコに住んでいます。', 'わたしはとるこにすんでいます。', 'Türkiye’de yaşıyorum.', 'watashi wa toruko ni sunde imasu.'],
    結婚します: ['先生は結婚しています。', 'せんせいはけっこんしています。', 'Öğretmen evli.', 'sensei wa kekkon shite imasu.'],
    写真: ['写真を見てもいいですか。', 'しゃしんをみてもいいですか。', 'Fotoğraflara bakabilir miyim?', 'shashin o mite mo ii desu ka.'],
    ちょっと: ['ちょっと待ってください。', 'ちょっとまってください。', 'Biraz bekleyin lütfen.', 'chotto matte kudasai.'],
    もう一度: ['もう一度読んでください。', 'もういちどよんでください。', 'Bir kez daha okuyun lütfen.', 'mou ichido yonde kudasai.'],
    ゆっくり: ['ゆっくり書いてください。', 'ゆっくりかいてください。', 'Yavaşça yazın lütfen.', 'yukkuri kaite kudasai.'],
    すみません: ['すみません、トイレはどこですか。', 'すみません、といれはどこですか。', 'Affedersiniz, tuvalet nerede?', 'sumimasen, toire wa doko desu ka.'],
    いいですよ: [
      'このかさを使ってもいいですか。いいですよ。',
      'このかさをつかってもいいですか。いいですよ。',
      'Bu şemsiyeyi kullanabilir miyim? Tabii.',
      'kono kasa o tsukatte mo ii desu ka. ii desu yo.',
    ],
    だめです: [
      'ここで食べてもいいですか。いいえ、だめです。',
      'ここでたべてもいいですか。いいえ、だめです。',
      'Burada yemek yiyebilir miyim? Hayır, olmaz.',
      'koko de tabete mo ii desu ka. iie, dame desu.',
    ],
    今: ['今、何をしていますか。', 'いま、なにをしていますか。', 'Şu an ne yapıyorsun?', 'ima, nani o shite imasu ka.'],
  },
  u10: {
    '〜たい': ['日本へ行きたいです。', 'にほんへいきたいです。', 'Japonya’ya gitmek istiyorum.', 'nihon e ikitai desu.'],
    いっしょに: ['いっしょに帰りましょう。', 'いっしょにかえりましょう。', 'Birlikte dönelim.', 'issho ni kaerimashou.'],
    上手: ['先生は料理が上手です。', 'せんせいはりょうりがじょうずです。', 'Öğretmen yemek yapmakta usta.', 'sensei wa ryouri ga jouzu desu.'],
    下手: ['私はスポーツが下手です。', 'わたしはすぽーつがへたです。', 'Sporda beceriksizim.', 'watashi wa supootsu ga heta desu.'],
    料理: ['日本の料理を食べたいです。', 'にほんのりょうりをたべたいです。', 'Japon yemeği yemek istiyorum.', 'nihon no ryouri o tabetai desu.'],
    音楽: ['私は音楽が好きです。', 'わたしはおんがくがすきです。', 'Müziği severim.', 'watashi wa ongaku ga suki desu.'],
    スポーツ: ['いっしょにスポーツをしましょう。', 'いっしょにすぽーつをしましょう。', 'Birlikte spor yapalım.', 'issho ni supootsu o shimashou.'],
    買い物: [
      '明日、いっしょに買い物をしませんか。',
      'あした、いっしょにかいものをしませんか。',
      'Yarın birlikte alışveriş yapmaz mıyız?',
      'ashita, issho ni kaimono o shimasen ka.',
    ],
    食事: ['今日、いっしょに食事をしませんか。', 'きょう、いっしょにしょくじをしませんか。', 'Bugün birlikte yemek yemez miyiz?', 'kyou, issho ni shokuji o shimasen ka.'],
    忙しい: ['今日は忙しいから、行きません。', 'きょうはいそがしいから、いきません。', 'Bugün meşgulüm, o yüzden gitmiyorum.', 'kyou wa isogashii kara, ikimasen.'],
    ひま: [
      '明日はひまですから、映画を見たいです。',
      'あしたはひまですから、えいがをみたいです。',
      'Yarın boşum, film izlemek istiyorum.',
      'ashita wa hima desu kara, eiga o mitai desu.',
    ],
    何も: ['昨日は何も食べませんでした。', 'きのうはなにもたべませんでした。', 'Dün hiçbir şey yemedim.', 'kinou wa nani mo tabemasen deshita.'],
    そうですね: ['今日は寒いですね。そうですね。', 'きょうはさむいですね。そうですね。', 'Bugün soğuk, değil mi? Öyle ya.', 'kyou wa samui desu ne. sou desu ne.'],
    いいですね: ['いっしょに行きましょう。いいですね。', 'いっしょにいきましょう。いいですね。', 'Birlikte gidelim. İyi fikir!', 'issho ni ikimashou. ii desu ne.'],
    ざんねんですが: ['ざんねんですが、明日は働きます。', 'ざんねんですが、あしたははたらきます。', 'Maalesef yarın çalışıyorum.', 'zannen desu ga, ashita wa hatarakimasu.'],
    また今度: ['今日は忙しいです。また今度。', 'きょうはいそがしいです。またこんど。', 'Bugün meşgulüm. Bir dahaki sefere.', 'kyou wa isogashii desu. mata kondo.'],
  },
  u11: {
    家族: ['私の家族は四人です。', 'わたしのかぞくはよにんです。', 'Ailem dört kişi.', 'watashi no kazoku wa yonin desu.'],
    父: ['父は会社で働いています。', 'ちちはかいしゃではたらいています。', 'Babam bir şirkette çalışıyor.', 'chichi wa kaisha de hataraite imasu.'],
    母: ['母は料理が上手です。', 'はははりょうりがじょうずです。', 'Annem yemek yapmakta usta.', 'haha wa ryouri ga jouzu desu.'],
    兄: ['兄は大学の先生です。', 'あにはだいがくのせんせいです。', 'Ağabeyim üniversite hocası.', 'ani wa daigaku no sensei desu.'],
    姉: ['姉は結婚しています。', 'あねはけっこんしています。', 'Ablam evli.', 'ane wa kekkon shite imasu.'],
    弟: ['弟は今日来ないと思います。', 'おとうとはきょうこないとおもいます。', 'Bence kardeşim bugün gelmez.', 'otouto wa kyou konai to omoimasu.'],
    妹: ['妹は今、本を読んでいます。', 'いもうとはいま、ほんをよんでいます。', 'Kız kardeşim şu an kitap okuyor.', 'imouto wa ima, hon o yonde imasu.'],
    お父さん: ['エフェさんのお父さんは先生ですか。', 'えふぇさんのおとうさんはせんせいですか。', 'Efe’nin babası öğretmen mi?', 'efe san no otousan wa sensei desu ka.'],
    お母さん: ['友だちのお母さんはやさしいです。', 'ともだちのおかあさんはやさしいです。', 'Arkadaşımın annesi nazik.', 'tomodachi no okaasan wa yasashii desu.'],
    兄弟: ['兄弟がいますか。', 'きょうだいがいますか。', 'Kardeşin var mı?', 'kyoudai ga imasu ka.'],
    男の子: ['あの男の子はだれですか。', 'あのおとこのこはだれですか。', 'O erkek çocuk kim?', 'ano otoko no ko wa dare desu ka.'],
    女の子: ['女の子が三人います。', 'おんなのこがさんにんいます。', 'Üç kız çocuk var.', 'onna no ko ga sannin imasu.'],
    子ども: ['子どもが二人います。', 'こどもがふたりいます。', 'İki çocuğum var.', 'kodomo ga futari imasu.'],
    話します: ['友だちと日本語で話します。', 'ともだちとにほんごではなします。', 'Arkadaşımla Japonca konuşurum.', 'tomodachi to nihongo de hanashimasu.'],
    思います: ['日本語は楽しいと思います。', 'にほんごはたのしいとおもいます。', 'Bence Japonca eğlenceli.', 'nihongo wa tanoshii to omoimasu.'],
    作ります: ['母は毎朝パンを作ります。', 'はははまいあさぱんをつくります。', 'Annem her sabah ekmek yapar.', 'haha wa maiasa pan o tsukurimasu.'],
    何人: ['家族は何人ですか。', 'かぞくはなんにんですか。', 'Ailen kaç kişi?', 'kazoku wa nannin desu ka.'],
  },
  u12: {
    天気: ['明日の天気はどうですか。', 'あしたのてんきはどうですか。', 'Yarın hava nasıl?', 'ashita no tenki wa dou desu ka.'],
    雨: ['明日は雨でしょう。', 'あしたはあめでしょう。', 'Yarın muhtemelen yağmur yağacak.', 'ashita wa ame deshou.'],
    晴れ: ['今日は晴れです。', 'きょうははれです。', 'Bugün hava açık.', 'kyou wa hare desu.'],
    くもり: ['午後はくもりになるでしょう。', 'ごごはくもりになるでしょう。', 'Öğleden sonra muhtemelen bulutlanacak.', 'gogo wa kumori ni naru deshou.'],
    空: ['今日の空はとてもきれいです。', 'きょうのそらはとてもきれいです。', 'Bugün gökyüzü çok güzel.', 'kyou no sora wa totemo kirei desu.'],
    山: ['日本で一番高い山は何ですか。', 'にほんでいちばんたかいやまはなんですか。', 'Japonya’nın en yüksek dağı hangisi?', 'nihon de ichiban takai yama wa nan desu ka.'],
    川: ['この川はとても長いです。', 'このかわはとてもながいです。', 'Bu nehir çok uzun.', 'kono kawa wa totemo nagai desu.'],
    白い: ['山の上は白いです。', 'やまのうえはしろいです。', 'Dağın tepesi beyaz.', 'yama no ue wa shiroi desu.'],
    長い: ['西の川は北の川より長いです。', 'にしのかわはきたのかわよりながいです。', 'Batıdaki nehir kuzeydekinden uzun.', 'nishi no kawa wa kita no kawa yori nagai desu.'],
    多い: ['日本は雨が多いです。', 'にほんはあめがおおいです。', 'Japonya’da yağmur çok yağar.', 'nihon wa ame ga ooi desu.'],
    少ない: ['この町は人が少ないです。', 'このまちはひとがすくないです。', 'Bu kasabada insan az.', 'kono machi wa hito ga sukunai desu.'],
    北: ['北の町は寒いです。', 'きたのまちはさむいです。', 'Kuzeydeki kasaba soğuk.', 'kita no machi wa samui desu.'],
    南: ['南は北より暑いです。', 'みなみはきたよりあついです。', 'Güney kuzeyden daha sıcak.', 'minami wa kita yori atsui desu.'],
    西: ['駅の西に山があります。', 'えきのにしにやまがあります。', 'İstasyonun batısında bir dağ var.', 'eki no nishi ni yama ga arimasu.'],
    すずしい: ['山の上はすずしいでしょう。', 'やまのうえはすずしいでしょう。', 'Dağın tepesi muhtemelen serindir.', 'yama no ue wa suzushii deshou.'],
    一番: ['一年の中でなつが一番好きです。', 'いちねんのなかでなつがいちばんすきです。', 'Yılın içinde en çok yazı severim.', 'ichinen no naka de natsu ga ichiban suki desu.'],
    どちら: ['電車とバスとどちらが安いですか。', 'でんしゃとばすとどちらがやすいですか。', 'Tren mi otobüs mü daha ucuz?', 'densha to basu to dochira ga yasui desu ka.'],
    なつ: ['トルコのなつは暑いです。', 'とるこのなつはあついです。', 'Türkiye’nin yazı sıcak.', 'toruko no natsu wa atsui desu.'],
  },
  u13: {
    出ます: ['毎朝七時に家を出ます。', 'まいあさしちじにいえをでます。', 'Her sabah yedide evden çıkarım.', 'maiasa shichiji ni ie o demasu.'],
    入ります: [
      '駅に入ってから、電車を待ちます。',
      'えきにはいってから、でんしゃをまちます。',
      'İstasyona girdikten sonra treni beklerim.',
      'eki ni haitte kara, densha o machimasu.',
    ],
    時間: ['今、時間がありますか。', 'いま、じかんがありますか。', 'Şu an vaktin var mı?', 'ima, jikan ga arimasu ka.'],
    外: ['雨ですから、外に出ません。', 'あめですから、そとにでません。', 'Yağmur yağıyor, dışarı çıkmıyorum.', 'ame desu kara, soto ni demasen.'],
    右: ['銀行は駅の右にあります。', 'ぎんこうはえきのみぎにあります。', 'Banka istasyonun sağında.', 'ginkou wa eki no migi ni arimasu.'],
    左: ['左に病院があります。', 'ひだりにびょういんがあります。', 'Solda hastane var.', 'hidari ni byouin ga arimasu.'],
    火曜日: ['火曜日に試験があります。', 'かようびにしけんがあります。', 'Salı günü sınav var.', 'kayoubi ni shiken ga arimasu.'],
    水曜日: ['水曜日は休みです。', 'すいようびはやすみです。', 'Çarşamba tatil.', 'suiyoubi wa yasumi desu.'],
    木曜日: ['木曜日に友だちと会います。', 'もくようびにともだちとあいます。', 'Perşembe arkadaşımla buluşuyorum.', 'mokuyoubi ni tomodachi to aimasu.'],
    聞きます: ['音楽を聞きながら、べんきょうします。', 'おんがくをききながら、べんきょうします。', 'Müzik dinleyerek ders çalışırım.', 'ongaku o kikinagara, benkyou shimasu.'],
    歩きます: ['晩ご飯の後で、ちょっと歩きます。', 'ばんごはんのあとで、ちょっとあるきます。', 'Akşam yemeğinden sonra biraz yürürüm.', 'bangohan no ato de, chotto arukimasu.'],
    おふろ: ['寝る前に、おふろに入ります。', 'ねるまえに、おふろにはいります。', 'Yatmadan önce banyo yaparım.', 'neru mae ni, ofuro ni hairimasu.'],
    昼ご飯: [
      '昼ご飯を食べてから、大学へ行きます。',
      'ひるごはんをたべてから、だいがくへいきます。',
      'Öğle yemeği yedikten sonra üniversiteye giderim.',
      'hirugohan o tabete kara, daigaku e ikimasu.',
    ],
    晩ご飯: ['まだ晩ご飯を食べていません。', 'まだばんごはんをたべていません。', 'Henüz akşam yemeği yemedim.', 'mada bangohan o tabete imasen.'],
    そうじ: [
      '日曜日はそうじをしたり、せんたくをしたりします。',
      'にちようびはそうじをしたり、せんたくをしたりします。',
      'Pazar günleri temizlik, çamaşır falan yaparım.',
      'nichiyoubi wa souji o shitari, sentaku o shitari shimasu.',
    ],
    せんたく: [
      '毎朝せんたくをしてから、会社へ行きます。',
      'まいあさせんたくをしてから、かいしゃへいきます。',
      'Her sabah çamaşır yıkadıktan sonra işe giderim.',
      'maiasa sentaku o shite kara, kaisha e ikimasu.',
    ],
    もう: ['もう晩ご飯を作りました。', 'もうばんごはんをつくりました。', 'Akşam yemeğini çoktan yaptım.', 'mou bangohan o tsukurimashita.'],
    まだ: ['まだ寝ていません。', 'まだねていません。', 'Henüz yatmadım.', 'mada nete imasen.'],
  },
  u14: {
    口: ['口の中がいたいです。', 'くちのなかがいたいです。', 'Ağzımın içi ağrıyor.', 'kuchi no naka ga itai desu.'],
    目: ['妹は目が大きいです。', 'いもうとはめがおおきいです。', 'Kız kardeşimin gözleri büyük.', 'imouto wa me ga ookii desu.'],
    耳: [
      '耳がいたいですから、音楽を聞きません。',
      'みみがいたいですから、おんがくをききません。',
      'Kulağım ağrıyor, o yüzden müzik dinlemiyorum.',
      'mimi ga itai desu kara, ongaku o kikimasen.',
    ],
    足: [
      '昨日、山を歩きましたから、足がいたいです。',
      'きのう、やまをあるきましたから、あしがいたいです。',
      'Dün dağda yürüdüm, o yüzden bacaklarım ağrıyor.',
      'kinou, yama o arukimashita kara, ashi ga itai desu.',
    ],
    手: ['左の手がいたいです。', 'ひだりのてがいたいです。', 'Sol elim ağrıyor.', 'hidari no te ga itai desu.'],
    力: ['兄は力があります。', 'あにはちからがあります。', 'Ağabeyim güçlüdür.', 'ani wa chikara ga arimasu.'],
    あたま: ['あたまがいたいですから、休みます。', 'あたまがいたいですから、やすみます。', 'Başım ağrıyor, dinleneceğim.', 'atama ga itai desu kara, yasumimasu.'],
    おなか: ['昨日からおなかがいたいです。', 'きのうからおなかがいたいです。', 'Dünden beri karnım ağrıyor.', 'kinou kara onaka ga itai desu.'],
    いたい: ['どこがいたいですか。', 'どこがいたいですか。', 'Neren ağrıyor?', 'doko ga itai desu ka.'],
    くすり: [
      '毎日くすりを飲まなければなりません。',
      'まいにちくすりをのまなければなりません。',
      'Her gün ilaç içmem gerekiyor.',
      'mainichi kusuri o nomanakereba narimasen.',
    ],
    病気: ['病気ですから、会社を休みます。', 'びょうきですから、かいしゃをやすみます。', 'Hastayım, işe gitmeyeceğim.', 'byouki desu kara, kaisha o yasumimasu.'],
    かぜ: [
      'かぜですから、外に出ないでください。',
      'かぜですから、そとにでないでください。',
      'Soğuk algınlığınız var; lütfen dışarı çıkmayın.',
      'kaze desu kara, soto ni denaide kudasai.',
    ],
    ねつ: [
      'ねつがありますから、早く寝なければなりません。',
      'ねつがありますから、はやくねなければなりません。',
      'Ateşim var, erken yatmam gerekiyor.',
      'netsu ga arimasu kara, hayaku nenakereba narimasen.',
    ],
    ほしい: ['新しいけいたいがほしいです。', 'あたらしいけいたいがほしいです。', 'Yeni bir telefon istiyorum.', 'atarashii keitai ga hoshii desu.'],
    一度: ['一度日本へ行ったことがあります。', 'いちどにほんへいったことがあります。', 'Bir kez Japonya’ya gittim.', 'ichido nihon e itta koto ga arimasu.'],
    外国: ['外国に住んだことがありますか。', 'がいこくにすんだことがありますか。', 'Hiç yurt dışında yaşadın mı?', 'gaikoku ni sunda koto ga arimasu ka.'],
    来年: ['来年、日本へ行くつもりです。', 'らいねん、にほんへいくつもりです。', 'Gelecek yıl Japonya’ya gitmeyi düşünüyorum.', 'rainen, nihon e iku tsumori desu.'],
    元気: ['くすりを飲みましたから、もう元気です。', 'くすりをのみましたから、もうげんきです。', 'İlacı içtim, artık iyiyim.', 'kusuri o nomimashita kara, mou genki desu.'],
  },
}

/** Ünite kelimesinin örnek cümlesi */
export function kelimeOrnegi(unitId: string, ja: string): (UnitLine & { latin: string }) | undefined {
  const o = ORNEKLER[unitId]?.[ja]
  return o && { ja: o[0], kana: o[1], tr: o[2], latin: o[3] }
}

/** Denetim betiği için ham tablo */
export const KELIME_ORNEKLERI = ORNEKLER

/**
 * Cümlede kelimenin geçtiği parça (renklendirmek için). Fiil çekimli
 * olabilir: 起きます → 起きました, 待ちます → 待って. Kelime bulunamazsa
 * sondan kısaltılarak kökü aranır.
 */
export function cumledekiKelime(cumle: string, kelime: string): string | undefined {
  let w = kelime.replace(/^〜/, '')
  if (w === 'たい') return 'たい'
  // いい düzensiz: olumsuzu ve geçmişi よ ile çekilir (よくない, よかった)
  if (w === 'いい' && !cumle.includes('いい')) return ['よく', 'よかっ'].find((x) => cumle.includes(x))
  const tam = w
  while (w.length) {
    if (cumle.includes(w)) {
      // Kısaltılmış kana parçası çoğu zaman anlamsız (い bütün い'leri
      // boyardı). Yalnızca kana い-sıfatının kökü kabul: やさしい → やさし(かった)
      const sifatKoku = tam.endsWith('い') && w === tam.slice(0, -1) && w.length >= 2
      if (w !== tam && !/[一-鿿]/.test(w) && !sifatKoku) return undefined
      return w
    }
    w = w.slice(0, -1)
  }
  return undefined
}
