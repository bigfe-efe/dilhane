/**
 * Her N5 kanjisi için bir örnek cümle — kelime kelime çözümlenmiş.
 *
 * NEDEN ELLE YAZILDI: uygulamadaki mevcut örnek cümleler (dilbilgisi ve
 * kelime kayıtları) 106 kanjinin yalnızca 44'ünü N5 sınırında kalarak
 * karşılıyordu. Sayılar, aile ve vücut kanjilerinin çoğu açıkta kalıyordu.
 *
 * NEDEN CÜMLE DEĞİL KELİME DİZİSİ YAZILIYOR: cümle metni ve kana okunuşu
 * ayrı ayrı yazılsaydı zamanla birbirinden ayrı düşerdi — kelimelerden biri
 * değişince okunuşu güncellemeyi unutmak yeterli. Burada cümle de okunuşu da
 * kelimelerden ÜRETİLİYOR, yani ikisi her zaman tutarlı.
 *
 * KAPSAM: cümlelerde yalnızca N5 kanjileri geçer. Öğrenci bir kanjiyi
 * çalışırken tanımadığı başka bir kanjiyle karşılaşmamalı.
 */

export type TokKind = 'isim' | 'zamir' | 'sayı' | 'fiil' | 'sıfat' | 'zarf' | 'edat' | 'ek' | 'ifade'

export interface Tok {
  /** Yazılışı */
  s: string
  /** Okunuşu (kana) */
  r: string
  tr: string
  kind: TokKind
  /** Dilbilgisi açıklaması — edat ve eklerde neredeyse her zaman var */
  note?: string
}

export interface KanjiSentence {
  /** Hangi kanji için */
  k: string
  /** Cümle (kanjili) — kelimelerden üretilir */
  ja: string
  /** Kana okunuşu — kelimelerden üretilir */
  kana: string
  tr: string
  /** Cümlenin dilbilgisi kalıbı */
  pattern: string
  tokens: Tok[]
}

// ————————————————————————— Edatlar ve ekler —————————————————————————
//
// Tek yerde tanımlı: は'nin açıklaması bütün cümlelerde aynı olsun.

const P = {
  // r alanı YAZILIŞI tutar, okunuşu değil. Önce 'わ' yazılmıştı ve kana
  // satırı 「わたしわ…」 çıkıyordu: okunuşu doğru ama yazımı yanlış, üstelik
  // öğretilen kuralın tam tersini gösteriyordu. Okunuş bilgisi notta duruyor;
  // seslendirme zaten ja-phonetic içinde は→wa düzeltmesini yapıyor.
  wa: { s: 'は', r: 'は', tr: 'konu eki', kind: 'edat' as const, note: 'Yazılışı は ama okunuşu "wa". "…-e gelince" gibi konuyu işaretler.' },
  ga: { s: 'が', r: 'が', tr: 'özne eki', kind: 'edat' as const, note: 'Yeni bilgiyi ve あります/います cümlelerinin öznesini işaretler.' },
  o: { s: 'を', r: 'を', tr: 'nesne eki', kind: 'edat' as const, note: 'Yazılışı を, okunuşu o. Eylemin neye yapıldığını gösterir.' },
  ni: { s: 'に', r: 'に', tr: 'zaman / hedef eki', kind: 'edat' as const, note: 'Saat ve gün (三時に) ya da varış noktası (学校に).' },
  de: { s: 'で', r: 'で', tr: 'yer / araç eki', kind: 'edat' as const, note: 'Eylemin geçtiği yer (駅で) ya da kullanılan araç (電車で).' },
  e: { s: 'へ', r: 'へ', tr: 'yön eki', kind: 'edat' as const, note: 'Yazılışı へ ama okunuşu "e". Gidilen yönü gösterir.' },
  to: { s: 'と', r: 'と', tr: 'ile, ve', kind: 'edat' as const, note: 'Kişiyle birliktelik (友だちと) ya da iki ismi bağlama.' },
  mo: { s: 'も', r: 'も', tr: 'de, da', kind: 'edat' as const, note: 'は ya da が yerine geçer; ikisiyle birlikte kullanılmaz.' },
  no: { s: 'の', r: 'の', tr: 'tamlama eki', kind: 'edat' as const, note: 'AのB = A’nın B’si: 日本語の先生 = Japonca öğretmeni.' },
  kara: { s: 'から', r: 'から', tr: '-den (başlangıç)', kind: 'edat' as const, note: 'Zaman ya da yer başlangıcı: 九時から.' },
  ka: { s: 'か', r: 'か', tr: 'soru eki', kind: 'ek' as const, note: 'Cümlenin sonuna gelir; soru işareti kullanılmaz.' },
  desu: { s: 'です', r: 'です', tr: 'kibar bildirme (-dir)', kind: 'ek' as const, note: 'İsim ve な-sıfatları kibarlaştırır. Olumsuzu じゃないです.' },
  ja: { s: 'じゃないです', r: 'じゃないです', tr: 'değil (kibar)', kind: 'ek' as const, note: 'です’nin olumsuzu.' },
}

// ————————————————————————— Sık geçen kelimeler —————————————————————————

const w = (s: string, r: string, tr: string, kind: TokKind = 'isim', note?: string): Tok => ({ s, r, tr, kind, note })

const W = {
  watashi: w('私', 'わたし', 'ben', 'zamir'),
  gakusei: w('学生', 'がくせい', 'öğrenci'),
  gakkou: w('学校', 'がっこう', 'okul'),
  hon: w('本', 'ほん', 'kitap'),
  tomodachi: w('友だち', 'ともだち', 'arkadaş'),
  sensei: w('先生', 'せんせい', 'öğretmen'),
  nihongo: w('日本語', 'にほんご', 'Japonca'),
  nihon: w('日本', 'にほん', 'Japonya'),
  eki: w('駅', 'えき', 'istasyon'),
  mizu: w('水', 'みず', 'su'),
  kuruma: w('車', 'くるま', 'araba'),
  yama: w('山', 'やま', 'dağ'),
  hito: w('人', 'ひと', 'kişi, insan'),
  ikimasu: w('行きます', 'いきます', 'giderim, gideceğim', 'fiil', '行く fiilinin kibar biçimi (ます).'),
  kimasu: w('来ます', 'きます', 'gelirim, geliyor', 'fiil', '来る düzensiz fiil: 来ます = きます, 来ない = こない.'),
  kaerimasu: w('帰ります', 'かえります', 'eve dönerim', 'fiil', '帰る fiilinin kibar biçimi.'),
  yasumimasu: w('休みます', 'やすみます', 'dinlenirim', 'fiil', '休む fiilinin kibar biçimi.'),
  aimasu: w('会います', 'あいます', 'buluşurum', 'fiil', '会う fiilinin kibar biçimi. Kişiyle buluşmak に ile: 友だちに会います.'),
  arimasu: w('あります', 'あります', 'var (cansız)', 'fiil', 'Cansız varlıklar için. Canlılar için います.'),
  imasu: w('います', 'います', 'var (canlı)', 'fiil', 'İnsan ve hayvanlar için. Cansızlar için あります.'),
  desuka: P.ka,
}

// ————————————————————————— Cümleler —————————————————————————

const rows: { k: string; tr: string; pattern: string; t: Tok[] }[] = [
  // ————— Sayılar —————
  { k: '一', tr: 'Ben birinci sınıf öğrencisiyim.', pattern: 'AはBです', t: [W.watashi, P.wa, w('一年生', 'いちねんせい', 'birinci sınıf öğrencisi'), P.desu] },
  { k: '二', tr: 'İki kişi istasyona gidiyoruz.', pattern: 'sayı + で · へ', t: [w('二人', 'ふたり', 'iki kişi', 'sayı', 'Düzensiz: にじん değil ふたり.'), P.de, W.eki, P.e, W.ikimasu] },
  { k: '三', tr: 'Saat üçte arkadaşımla buluşacağım.', pattern: 'saat + に · と', t: [w('三時', 'さんじ', 'saat üç', 'sayı'), P.ni, W.tomodachi, P.to, W.aimasu] },
  { k: '四', tr: 'Dört buçukta eve döneceğim.', pattern: 'saat + 半 + に', t: [w('四時半', 'よじはん', 'dört buçuk', 'sayı', 'Saatte よん değil よ: よじ.'), P.ni, W.kaerimasu] },
  { k: '五', tr: 'Beş yüz yen.', pattern: 'Bです', t: [w('五百円', 'ごひゃくえん', 'beş yüz yen', 'sayı'), P.desu] },
  { k: '六', tr: 'Altı öğrenci var.', pattern: 'Aがいます', t: [w('六人', 'ろくにん', 'altı kişi', 'sayı'), P.no, W.gakusei, P.ga, W.imasu] },
  { k: '七', tr: 'Ayın yedisinde geliyorum.', pattern: 'tarih + に', t: [w('七日', 'なのか', 'ayın yedisi', 'sayı', 'Ayın günleri düzensizdir: なのか.'), P.ni, W.kimasu] },
  { k: '八', tr: 'Sekiz yüz yenlik kitabı alacağım.', pattern: 'A の B を V', t: [w('八百円', 'はっぴゃくえん', 'sekiz yüz yen', 'sayı', 'はち + ひゃく → はっぴゃく.'), P.no, W.hon, P.o, w('買います', 'かいます', 'satın alırım', 'fiil', '買う fiilinin kibar biçimi.')] },
  { k: '九', tr: 'Saat dokuzdan itibaren okul var.', pattern: 'から', t: [w('九時', 'くじ', 'saat dokuz', 'sayı', 'Saatte きゅう değil く: くじ.'), P.kara, W.gakkou, P.desu] },
  { k: '十', tr: 'On dakika dinleneceğim.', pattern: 'süre + fiil', t: [w('十分', 'じゅっぷん', 'on dakika', 'sayı', 'じゅう + ふん → じゅっぷん.'), W.yasumimasu] },
  { k: '百', tr: 'Yüz kişi geldi.', pattern: 'Aが V-ました', t: [w('百人', 'ひゃくにん', 'yüz kişi', 'sayı'), P.ga, w('来ました', 'きました', 'geldi', 'fiil', '来る fiilinin kibar geçmiş biçimi.')] },
  { k: '千', tr: 'Bu kitap bin yen.', pattern: 'このA は Bです', t: [w('この', 'この', 'bu', 'ifade', 'İsimden önce gelir: この本. Tek başına これ.'), W.hon, P.wa, w('千円', 'せんえん', 'bin yen', 'sayı'), P.desu] },
  { k: '万', tr: 'Çantada on bin yen var.', pattern: 'AにBがあります', t: [w('かばん', 'かばん', 'çanta'), P.ni, w('一万円', 'いちまんえん', 'on bin yen', 'sayı', '10.000 = 一万; いち düşmez.'), P.ga, W.arimasu] },
  { k: '円', tr: 'Su yüz yen.', pattern: 'AはBです', t: [W.mizu, P.wa, w('百円', 'ひゃくえん', 'yüz yen', 'sayı'), P.desu] },

  // ————— Gün ve zaman —————
  { k: '日', tr: 'Pazar günü dinlenirim.', pattern: 'gün + に', t: [w('日曜日', 'にちようび', 'pazar'), P.ni, W.yasumimasu] },
  { k: '月', tr: 'Gelecek ay Japonya’ya gideceğim.', pattern: 'zaman + へ', t: [w('来月', 'らいげつ', 'gelecek ay'), W.nihon, P.e, W.ikimasu] },
  { k: '火', tr: 'Salı günü buluşalım.', pattern: 'V-ましょう (önerme)', t: [w('火曜日', 'かようび', 'salı'), P.ni, w('会いましょう', 'あいましょう', 'buluşalım', 'fiil', 'ます → ましょう: birlikte yapmayı önerir.')] },
  { k: '水', tr: 'Her gün su içerim.', pattern: 'zaman + を + V', t: [w('毎日', 'まいにち', 'her gün', 'zarf'), W.mizu, P.o, w('飲みます', 'のみます', 'içerim', 'fiil', '飲む fiilinin kibar biçimi.')] },
  { k: '木', tr: 'Dağda çok ağaç var.', pattern: 'AにBが多いです', t: [W.yama, P.ni, w('木', 'き', 'ağaç'), P.ga, w('多いです', 'おおいです', 'çoktur', 'sıfat', 'い-sıfat: 多い + です.')] },
  { k: '金', tr: 'Cuma günü para alıyorum.', pattern: 'gün + に · を', t: [w('金曜日', 'きんようび', 'cuma'), P.ni, w('お金', 'おかね', 'para', 'isim', 'Baştaki お nezaket ekidir.'), P.o, w('もらいます', 'もらいます', 'alırım (birinden)', 'fiil')] },
  { k: '土', tr: 'Cumartesi babamla dışarı çıkıyorum.', pattern: 'と + V', t: [w('土曜日', 'どようび', 'cumartesi'), P.ni, w('父', 'ちち', 'babam', 'isim', 'Kendi baban 父; başkasınınki お父さん.'), P.to, w('出かけます', 'でかけます', 'dışarı çıkarım', 'fiil')] },
  { k: '曜', tr: 'Hangi gün?', pattern: '何 + soru', t: [w('何曜日', 'なんようび', 'hangi gün', 'ifade', '何 burada なん okunur.'), P.desu, P.ka] },
  { k: '時', tr: 'Şu an saat kaç?', pattern: '何時ですか', t: [w('今', 'いま', 'şu an', 'zarf'), w('何時', 'なんじ', 'saat kaç', 'ifade'), P.desu, P.ka] },
  { k: '分', tr: 'Beş dakika sürüyor.', pattern: 'süre + fiil', t: [w('五分', 'ごふん', 'beş dakika', 'sayı', '1, 3, 4, 6, 8, 10 ile ぷん olur; 5 ile ふん.'), w('かかります', 'かかります', 'sürer, tutar', 'fiil')] },
  { k: '半', tr: 'İki buçukta gel lütfen.', pattern: 'V-てください', t: [w('二時半', 'にじはん', 'iki buçuk', 'sayı', '半 saatin sonuna gelir.'), P.ni, w('来てください', 'きてください', 'gel lütfen', 'fiil', 'て biçimi + ください = kibar rica.')] },
  { k: '年', tr: 'Bu yıl Japonca öğreniyorum.', pattern: 'zaman + を + V', t: [w('今年', 'ことし', 'bu yıl', 'zarf', 'Düzensiz okunur: こんねん değil ことし.'), W.nihongo, P.o, w('学びます', 'まなびます', 'öğrenirim', 'fiil', '学ぶ fiilinin kibar biçimi.')] },
  { k: '今', tr: 'Bugün hava güzel.', pattern: 'AはBがいいです', t: [w('今日', 'きょう', 'bugün', 'zarf', 'Tamamen düzensiz okunur.'), P.wa, w('天気', 'てんき', 'hava durumu'), P.ga, w('いいです', 'いいです', 'iyidir', 'sıfat')] },
  { k: '毎', tr: 'Her hafta cumartesi dinlenirim.', pattern: 'zaman + に', t: [w('毎週', 'まいしゅう', 'her hafta', 'zarf'), w('土曜日', 'どようび', 'cumartesi'), P.ni, W.yasumimasu] },
  { k: '週', tr: 'Gelecek hafta arkadaşım geliyor.', pattern: 'Aが V', t: [w('来週', 'らいしゅう', 'gelecek hafta', 'zarf'), W.tomodachi, P.ga, W.kimasu] },
  { k: '間', tr: 'Üç saat konuştuk.', pattern: 'süre + V-ました', t: [w('三時間', 'さんじかん', 'üç saat', 'sayı', '時 saat kaç, 時間 kaç saat sürdüğü.'), w('話しました', 'はなしました', 'konuştum', 'fiil', '話す fiilinin kibar geçmiş biçimi.')] },
  { k: '午', tr: 'Öğleden sonra okula gidiyorum.', pattern: 'zaman + へ', t: [w('午後', 'ごご', 'öğleden sonra', 'zarf'), W.gakkou, P.e, W.ikimasu] },
  { k: '前', tr: 'Adını yaz lütfen.', pattern: 'V-てください', t: [w('名前', 'なまえ', 'isim, ad', 'isim', '前 burada ぜん değil まえ okunur.'), P.o, w('書いてください', 'かいてください', 'yaz lütfen', 'fiil', '書く → 書いて (て biçimi) + ください.')] },
  { k: '後', tr: 'Sonra telefon ederim.', pattern: 'zaman + V', t: [w('後で', 'あとで', 'sonra', 'zarf', 'Zamanda "sonra" あと; mekânda "arka" うしろ.'), w('電話します', 'でんわします', 'telefon ederim', 'fiil', 'isim + します = o eylemi yapmak.')] },

  // ————— İnsan ve aile —————
  { k: '人', tr: 'O kişi Japon.', pattern: 'あのA は Bです', t: [w('あの', 'あの', 'şu, o', 'ifade', 'Uzaktaki için; isimden önce gelir.'), W.hito, P.wa, w('日本人', 'にほんじん', 'Japon', 'isim', 'Milliyette 人 じん okunur.'), P.desu] },
  { k: '私', tr: 'Ben öğrenciyim.', pattern: 'AはBです', t: [W.watashi, P.wa, W.gakusei, P.desu] },
  { k: '男', tr: 'Üç erkek çocuk var.', pattern: 'Aがいます', t: [w('男の子', 'おとこのこ', 'erkek çocuk'), P.ga, w('三人', 'さんにん', 'üç kişi', 'sayı', 'Üçten itibaren にん kullanılır.'), W.imasu] },
  { k: '女', tr: 'Bir kadınla konuştum.', pattern: 'と + V-ました', t: [w('女の人', 'おんなのひと', 'kadın'), P.to, w('話しました', 'はなしました', 'konuştum', 'fiil')] },
  { k: '子', tr: 'Çocuk kitap okuyor.', pattern: 'AがBを V', t: [w('子ども', 'こども', 'çocuk'), P.ga, W.hon, P.o, w('読みます', 'よみます', 'okurum', 'fiil', '読む fiilinin kibar biçimi.')] },
  { k: '名', tr: 'Adınız ne?', pattern: '何ですか', t: [w('お名前', 'おなまえ', 'adınız', 'isim', 'Baştaki お karşıdakine nezaket katar.'), P.wa, w('何', 'なん', 'ne', 'ifade', 'です önünde なん okunur.'), P.desu, P.ka] },
  { k: '友', tr: 'Arkadaşımla buluştum.', pattern: 'と + V-ました', t: [W.tomodachi, P.to, w('会いました', 'あいました', 'buluştum', 'fiil')] },
  { k: '父', tr: 'Babam öğretmen.', pattern: 'AはBです', t: [w('父', 'ちち', 'babam', 'isim', 'Kendi babandan bahsederken 父; başkasınınki お父さん.'), P.wa, W.sensei, P.desu] },
  { k: '母', tr: 'Annem şu an dinleniyor.', pattern: 'V-ています', t: [w('母', 'はは', 'annem', 'isim', 'Kendi annenden bahsederken 母; başkasınınki お母さん.'), P.wa, w('今', 'いま', 'şu an', 'zarf'), w('休んでいます', 'やすんでいます', 'dinleniyor', 'fiil', 'て biçimi + います = şu an süren eylem.')] },
  { k: '兄', tr: 'Ağabeyim üniversite öğrencisi.', pattern: 'AはBです', t: [w('兄', 'あに', 'ağabeyim', 'isim', 'Kendi ağabeyin 兄; başkasınınki お兄さん.'), P.wa, w('大学生', 'だいがくせい', 'üniversite öğrencisi'), P.desu] },
  { k: '姉', tr: 'Ablam Japonya’da.', pattern: 'AはBにいます', t: [w('姉', 'あね', 'ablam', 'isim', 'Kendi ablan 姉; başkasınınki お姉さん.'), P.wa, W.nihon, P.ni, W.imasu] },
  { k: '弟', tr: 'Küçük kardeşim dokuz yaşında.', pattern: 'AはBです', t: [w('弟', 'おとうと', 'küçük erkek kardeşim'), P.wa, w('九さい', 'きゅうさい', 'dokuz yaşında', 'sayı'), P.desu] },
  { k: '妹', tr: 'Kız kardeşim ilkokul öğrencisi.', pattern: 'AはBです', t: [w('妹', 'いもうと', 'küçük kız kardeşim'), P.wa, w('小学生', 'しょうがくせい', 'ilkokul öğrencisi'), P.desu] },

  // ————— Okul ve öğrenim —————
  { k: '学', tr: 'Üniversitede Japonca öğreniyorum.', pattern: 'Aで + を + V', t: [w('大学', 'だいがく', 'üniversite'), P.de, W.nihongo, P.o, w('学びます', 'まなびます', 'öğrenirim', 'fiil')] },
  { k: '校', tr: 'Okul istasyonun önünde.', pattern: 'AはBのCです', t: [W.gakkou, P.wa, W.eki, P.no, w('前', 'まえ', 'ön'), P.desu] },
  { k: '先', tr: 'Öğretmene sordum.', pattern: 'に + V-ました', t: [W.sensei, P.ni, w('聞きました', 'ききました', 'sordum, dinledim', 'fiil', '聞く hem "dinlemek" hem "sormak" demektir.')] },
  { k: '生', tr: 'Ben Japonca öğrencisiyim.', pattern: 'AはBのCです', t: [W.watashi, P.wa, W.nihongo, P.no, W.gakusei, P.desu] },
  { k: '本', tr: 'Bu kitap yeni.', pattern: 'このAはBです', t: [w('この', 'この', 'bu', 'ifade'), W.hon, P.wa, w('新しいです', 'あたらしいです', 'yenidir', 'sıfat', 'い-sıfat: 新しい + です.')] },
  { k: '語', tr: 'Japonca konuşurum.', pattern: 'を + V', t: [W.nihongo, P.o, w('話します', 'はなします', 'konuşurum', 'fiil')] },
  { k: '読', tr: 'Her gün gazete okurum.', pattern: 'zaman + を + V', t: [w('毎日', 'まいにち', 'her gün', 'zarf'), w('新聞', 'しんぶん', 'gazete'), P.o, w('読みます', 'よみます', 'okurum', 'fiil')] },
  { k: '書', tr: 'Adımı buraya yazıyorum.', pattern: 'に + を + V', t: [w('名前', 'なまえ', 'isim, ad'), P.o, w('ここ', 'ここ', 'burası', 'ifade'), P.ni, w('書きます', 'かきます', 'yazarım', 'fiil')] },
  { k: '聞', tr: 'Öğretmenin konuşmasını dinliyorum.', pattern: 'のを + V', t: [W.sensei, P.no, w('話', 'はなし', 'konuşma, söz'), P.o, w('聞きます', 'ききます', 'dinlerim', 'fiil')] },
  { k: '話', tr: 'Arkadaşımla konuştum.', pattern: 'と + V-ました', t: [W.tomodachi, P.to, w('話しました', 'はなしました', 'konuştum', 'fiil')] },

  // ————— Temel fiiller —————
  { k: '行', tr: 'Okula gidiyorum.', pattern: 'へ + V', t: [W.gakkou, P.e, W.ikimasu] },
  { k: '来', tr: 'Annem geldi.', pattern: 'Aが V-ました', t: [w('母', 'はは', 'annem'), P.ga, w('来ました', 'きました', 'geldi', 'fiil', '来る düzensiz: 来ます きます, 来ました きました.')] },
  { k: '帰', tr: 'Altıda eve döneceğim.', pattern: 'saat + に', t: [w('六時', 'ろくじ', 'saat altı', 'sayı'), P.ni, W.kaerimasu] },
  { k: '食', tr: 'Ekmek yiyorum.', pattern: 'を + V', t: [w('パン', 'パン', 'ekmek', 'isim', 'Portekizce pão’dan gelir, o yüzden katakana yazılır.'), P.o, w('食べます', 'たべます', 'yerim', 'fiil', '食べる fiilinin kibar biçimi.')] },
  { k: '飲', tr: 'Su içtim.', pattern: 'を + V-ました', t: [W.mizu, P.o, w('飲みました', 'のみました', 'içtim', 'fiil')] },
  { k: '見', tr: 'Televizyon izliyorum.', pattern: 'を + V', t: [w('テレビ', 'テレビ', 'televizyon', 'isim', 'İngilizce television’dan; katakana.'), P.o, w('見ます', 'みます', 'görürüm, izlerim', 'fiil')] },
  { k: '買', tr: 'Kitap aldım.', pattern: 'を + V-ました', t: [W.hon, P.o, w('買いました', 'かいました', 'satın aldım', 'fiil')] },
  { k: '会', tr: 'İstasyonda arkadaşımla buluşuyorum.', pattern: 'で + に + V', t: [W.eki, P.de, W.tomodachi, P.ni, W.aimasu] },
  { k: '出', tr: 'Yedide çıkıyorum.', pattern: 'saat + に', t: [w('七時', 'しちじ', 'saat yedi', 'sayı', 'Saatte なな değil しち.'), P.ni, w('出ます', 'でます', 'çıkarım', 'fiil', '出る kendin çıkarsın; 出す bir şeyi çıkarırsın.')] },
  { k: '入', tr: 'Üniversiteye giriyorum.', pattern: 'に + V', t: [w('大学', 'だいがく', 'üniversite'), P.ni, w('入ります', 'はいります', 'girerim', 'fiil', '入る はいる; 入れる ise いれる (içine koymak).')] },
  { k: '立', tr: 'Lütfen ayağa kalkın.', pattern: 'V-てください', t: [w('立ってください', 'たってください', 'ayağa kalkın', 'fiil', '立つ → 立って (て biçimi) + ください.')] },
  { k: '休', tr: 'Pazar günleri dinlenirim.', pattern: 'AはV', t: [w('日曜日', 'にちようび', 'pazar'), P.wa, W.yasumimasu] },

  // ————— Sıfatlar —————
  { k: '大', tr: 'Büyük bir dağ.', pattern: 'い-sıfat + isim', t: [w('大きい', 'おおきい', 'büyük', 'sıfat', 'い-sıfat doğrudan isimden önce gelir.'), W.yama, P.desu] },
  { k: '小', tr: 'Küçük bir çocuk ayakta duruyor.', pattern: 'V-ています', t: [w('小さい', 'ちいさい', 'küçük', 'sıfat'), w('子', 'こ', 'çocuk'), P.ga, w('立っています', 'たっています', 'ayakta duruyor', 'fiil', 'て biçimi + います = süregelen durum.')] },
  { k: '高', tr: 'Bu kitap pahalı.', pattern: 'このAはBです', t: [w('この', 'この', 'bu', 'ifade'), W.hon, P.wa, w('高いです', 'たかいです', 'pahalıdır, yüksektir', 'sıfat', '高い hem "pahalı" hem "yüksek".')] },
  { k: '安', tr: 'Su ucuz.', pattern: 'AはBです', t: [W.mizu, P.wa, w('安いです', 'やすいです', 'ucuzdur', 'sıfat')] },
  { k: '新', tr: 'Yeni araba aldım.', pattern: 'sıfat + isim + を', t: [w('新しい', 'あたらしい', 'yeni', 'sıfat'), W.kuruma, P.o, w('買いました', 'かいました', 'satın aldım', 'fiil')] },
  { k: '古', tr: 'Eski kitap okurum.', pattern: 'sıfat + isim + を', t: [w('古い', 'ふるい', 'eski', 'sıfat', 'Eşya için; insan için 古い kullanılmaz.'), W.hon, P.o, w('読みます', 'よみます', 'okurum', 'fiil')] },
  { k: '長', tr: 'Nehir uzun.', pattern: 'AはBです', t: [w('川', 'かわ', 'nehir'), P.wa, w('長いです', 'ながいです', 'uzundur', 'sıfat')] },
  { k: '白', tr: 'Beyaz araba.', pattern: 'sıfat + isim', t: [w('白い', 'しろい', 'beyaz', 'sıfat'), W.kuruma, P.desu] },
  { k: '多', tr: 'Çok insan var.', pattern: 'Aが多いです', t: [W.hito, P.ga, w('多いです', 'おおいです', 'çoktur', 'sıfat', '多い isimden önce gelmez; yüklem olur.')] },
  { k: '少', tr: 'Biraz dinleneceğim.', pattern: 'zarf + fiil', t: [w('少し', 'すこし', 'biraz', 'zarf', '少し "biraz"; 少ない ise "az".'), W.yasumimasu] },
  { k: '早', tr: 'Bugün erken döneceğim.', pattern: 'sıfat → zarf', t: [w('今日', 'きょう', 'bugün', 'zarf'), P.wa, w('早く', 'はやく', 'erken', 'zarf', 'い-sıfat zarf olurken い → く: 早い → 早く.'), W.kaerimasu] },

  // ————— Yer ve yön —————
  { k: '上', tr: 'Kitap üstte.', pattern: 'にあります', t: [W.hon, P.wa, w('上', 'うえ', 'üst'), P.ni, W.arimasu] },
  { k: '下', tr: 'Lütfen aşağı bak.', pattern: 'V-てください', t: [w('下', 'した', 'alt, aşağı'), P.o, w('見てください', 'みてください', 'bak lütfen', 'fiil', '見る → 見て + ください.')] },
  { k: '中', tr: 'Bütün gün konuştuk.', pattern: '〜中 (boyunca)', t: [w('一日中', 'いちにちじゅう', 'bütün gün', 'zarf', '"…boyunca" anlamında 中 ちゅう değil じゅう okunur.'), w('話しました', 'はなしました', 'konuştum', 'fiil')] },
  { k: '外', tr: 'Dışarısı yağmurlu.', pattern: 'AはBです', t: [w('外', 'そと', 'dışarı'), P.wa, w('雨', 'あめ', 'yağmur'), P.desu] },
  { k: '右', tr: 'Sağda istasyon var.', pattern: 'にAがあります', t: [w('右', 'みぎ', 'sağ'), P.ni, W.eki, P.ga, W.arimasu] },
  { k: '左', tr: 'Lütfen sola gidin.', pattern: 'へ + V-てください', t: [w('左', 'ひだり', 'sol'), P.e, w('行ってください', 'いってください', 'gidin lütfen', 'fiil', '行く → 行って (düzensiz: いきて değil いって).')] },
  { k: '東', tr: 'Doğu çıkışında buluşalım.', pattern: 'で + V-ましょう', t: [w('東口', 'ひがしぐち', 'doğu çıkışı', 'isim', 'くち → ぐち ses değişimi.'), P.de, w('会いましょう', 'あいましょう', 'buluşalım', 'fiil')] },
  { k: '西', tr: 'Batıya gidiyorum.', pattern: 'へ + V', t: [w('西', 'にし', 'batı'), P.e, W.ikimasu] },
  { k: '南', tr: 'Güneyde hava güzel.', pattern: 'AはBがいいです', t: [w('南', 'みなみ', 'güney'), P.wa, w('天気', 'てんき', 'hava durumu'), P.ga, w('いいです', 'いいです', 'iyidir', 'sıfat')] },
  { k: '北', tr: 'Kuzeye geldim.', pattern: 'へ + V-ました', t: [w('北', 'きた', 'kuzey'), P.e, w('来ました', 'きました', 'geldim', 'fiil')] },
  { k: '国', tr: 'Yabancı bir arkadaşım var.', pattern: 'のAがいます', t: [w('外国', 'がいこく', 'yabancı ülke'), P.no, W.tomodachi, P.ga, W.imasu] },
  { k: '駅', tr: 'İstasyonda buluşuyoruz.', pattern: 'で + V', t: [W.eki, P.de, W.aimasu] },

  // ————— Doğa ve hava —————
  { k: '山', tr: 'Dağ yüksek.', pattern: 'AがBです', t: [W.yama, P.ga, w('高いです', 'たかいです', 'yüksektir', 'sıfat')] },
  { k: '川', tr: 'Nehirde dinlendim.', pattern: 'で + V-ました', t: [w('川', 'かわ', 'nehir'), P.de, w('休みました', 'やすみました', 'dinlendim', 'fiil')] },
  { k: '天', tr: 'Hava güzel.', pattern: 'AがBです', t: [w('天気', 'てんき', 'hava durumu'), P.ga, w('いいです', 'いいです', 'iyidir', 'sıfat')] },
  { k: '気', tr: 'Lütfen dikkat et.', pattern: 'を + V-てください', t: [w('気', 'き', 'dikkat, ruh hâli'), P.o, w('つけてください', 'つけてください', 'dikkat edin', 'fiil', '気をつける kalıbı: "dikkat etmek".')] },
  { k: '雨', tr: 'Bugün yağmurlu.', pattern: 'AはBです', t: [w('今日', 'きょう', 'bugün', 'zarf'), P.wa, w('雨', 'あめ', 'yağmur'), P.desu] },
  { k: '空', tr: 'Gökyüzü beyaz.', pattern: 'AがBです', t: [w('空', 'そら', 'gökyüzü'), P.ga, w('白いです', 'しろいです', 'beyazdır', 'sıfat')] },
  { k: '電', tr: 'Trenle gidiyorum.', pattern: 'で (araç) + V', t: [w('電車', 'でんしゃ', 'tren'), P.de, W.ikimasu] },
  { k: '車', tr: 'Araba yeni.', pattern: 'AはBです', t: [W.kuruma, P.wa, w('新しいです', 'あたらしいです', 'yenidir', 'sıfat')] },

  // ————— Vücut —————
  { k: '口', tr: 'Giriş sağda.', pattern: 'AはBです', t: [w('入口', 'いりぐち', 'giriş', 'isim', 'くち → ぐち ses değişimi.'), P.wa, w('右', 'みぎ', 'sağ'), P.desu] },
  { k: '目', tr: 'Gözleri büyük.', pattern: 'AがBです', t: [w('目', 'め', 'göz'), P.ga, w('大きいです', 'おおきいです', 'büyüktür', 'sıfat')] },
  { k: '耳', tr: 'İki kulak var.', pattern: 'Aがあります', t: [w('耳', 'みみ', 'kulak'), P.ga, w('二つ', 'ふたつ', 'iki tane', 'sayı', 'Nesne sayarken ふた-: 一つ, 二つ, 三つ.'), W.arimasu] },
  { k: '手', tr: 'Lütfen eline bak.', pattern: 'を + V-てください', t: [w('手', 'て', 'el'), P.o, w('見てください', 'みてください', 'bak lütfen', 'fiil')] },
  { k: '足', tr: 'Bacakları uzun.', pattern: 'AがBです', t: [w('足', 'あし', 'ayak, bacak'), P.ga, w('長いです', 'ながいです', 'uzundur', 'sıfat')] },
  { k: '力', tr: 'Gücü var.', pattern: 'Aがあります', t: [w('力', 'ちから', 'güç'), P.ga, W.arimasu] },

  // ————— Soru —————
  { k: '何', tr: 'Ne yiyeceksin?', pattern: '何を V-ますか', t: [w('何', 'なに', 'ne', 'ifade', 'を önünde なに, です ve sayaç önünde なん.'), P.o, w('食べます', 'たべます', 'yerim', 'fiil'), P.ka] },
]

/** Cümle metni ve okunuşu kelimelerden üretilir — ikisi ayrı düşemesin */
export const KANJI_SENTENCES: KanjiSentence[] = rows.map((r) => ({
  k: r.k,
  ja: r.t.map((x) => x.s).join('') + '。',
  kana: r.t.map((x) => x.r).join('') + '。',
  tr: r.tr,
  pattern: r.pattern,
  tokens: r.t,
}))

export const SENTENCE_BY_KANJI = new Map(KANJI_SENTENCES.map((s) => [s.k, s]))
