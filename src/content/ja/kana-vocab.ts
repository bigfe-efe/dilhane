// Tamamen hiragana yazılan kelimeler — temalı, açıklamalı liste.
//
// NEDEN BÖYLE BİR LİSTE:
// Kana tablosu harfleri öğretir; okumak ise harfleri BAĞLAYABİLMEKTİR. Bunun
// için gerçek kelimeye ihtiyaç var. Buradaki kelimelerin hepsi baştan sona
// hiragana yazılabilir, yani kanji bilmeden okunur.
//
// Japoncada birçok kelime zaten günlük hayatta hiragana yazılır (ある, いる,
// これ, とても, ありがとう…). Kanjisi olanların da kanjisi ders kitaplarında
// geç öğretilir. Yani liste yapay değil: başlangıç seviyesinde gerçekten
// böyle okursun. Kanjili yazım bilgi olarak veriliyor ki sonradan gördüğünde
// tanıyabilesin.
//
// DİLBİLGİSİ NOTLARI:
// Bir kelimenin kendine özgü bir kuralı varsa (fiil grubu, sıfat tipi, hangi
// eki aldığı, sayaç neyi sayar, düzensiz bir yanı var mı) `gram` alanına
// yazıldı. Kelimeyi öğrenirken kuralını da öğrenmek, sonradan ezberlemekten
// hem hızlı hem kalıcıdır — özellikle fiillerde: 「かえる」ı "godan" diye
// bilmezsen çekimini yanlış yaparsın.

export type Pos =
  | 'isim'
  | 'fiil'
  | 'i-sıfat'
  | 'na-sıfat'
  | 'zarf'
  | 'zamir'
  | 'soru'
  | 'sayı'
  | 'sayaç'
  | 'edat'
  | 'bağlaç'
  | 'ifade'

export interface VocabWord {
  /** Tamamen hiragana yazım */
  kana: string
  tr: string
  /** Varsa kanjili yazımı */
  kanji?: string
  pos: Pos
  /** Bu kelimeye özgü dilbilgisi notu */
  gram?: string
  /** Yazıldığı gibi okunmuyorsa okunuşu */
  reading?: string
  /**
   * Seslendirme motoruna verilecek kana.
   *
   * Ek olarak kullanılan は/を/へ tek başına yazıldığında motor onları
   * "ha/wo/he" okur — oysa satırda yazan okunuş "wa/o/e". Kuralın anlatıldığı
   * yerde sesin yazıyla çelişmemesi için bu üçünde okunacak kana ayrı veriliyor.
   */
  say?: string
  /** Okunuş neden farklı */
  note?: string
}

export interface VocabTheme {
  id: string
  title: string
  desc: string
  words: VocabWord[]
}

export const VOCAB_THEMES: VocabTheme[] = [
  // ————————————————————————————————————————————————————————————
  {
    id: 'selam',
    title: 'Selamlaşma ve günlük ifadeler',
    desc: 'Kalıp hâlinde ezberlenir; çoğu tam cümle değil, hazır ifadedir.',
    words: [
      {
        kana: 'こんにちは',
        tr: 'merhaba, iyi günler',
        pos: 'ifade',
        reading: 'konnichiwa',
        note: 'Sondaki は KONU EKİdir, "wa" okunur. 今日は ("bugüne gelince…") cümlesinin kalıntısı.',
        gram: 'Gündüz kullanılır. Akşam こんばんは, sabah おはよう olur.',
      },
      {
        kana: 'こんばんは',
        tr: 'iyi akşamlar',
        pos: 'ifade',
        reading: 'konbanwa',
        note: 'Sondaki は yine konu ekidir: "wa" okunur.',
      },
      { kana: 'おはよう', tr: 'günaydın', pos: 'ifade', gram: 'Samimi biçim. Kibarı おはようございます.' },
      { kana: 'おやすみ', tr: 'iyi geceler', pos: 'ifade', gram: 'Kibarı おやすみなさい. 休み (yasumi, tatil) ile aynı kökten.' },
      { kana: 'ありがとう', tr: 'teşekkürler', pos: 'ifade', gram: 'Kibarı ありがとうございます. Geçmişte olan bir şey için ありがとうございました.' },
      { kana: 'すみません', tr: 'affedersiniz, özür dilerim', pos: 'ifade', gram: 'Hem özür hem "bakar mısınız" hem de teşekkür yerine kullanılır.' },
      { kana: 'ごめんなさい', tr: 'özür dilerim', pos: 'ifade', gram: 'すみません’den daha kişisel bir özür; hata kabulü içerir.' },
      { kana: 'はじめまして', tr: 'memnun oldum (ilk tanışmada)', pos: 'ifade', gram: 'Yalnızca İLK karşılaşmada. Sonrasında kullanılmaz.' },
      { kana: 'さようなら', tr: 'hoşça kal', pos: 'ifade', gram: 'Uzun ayrılıklarda. Günlük vedalarda じゃあね veya またね daha doğal.' },
      { kana: 'いってきます', tr: 'gidiyorum (evden çıkarken)', pos: 'ifade', gram: 'Evden çıkan söyler. Kalan いってらっしゃい diye karşılık verir.' },
      { kana: 'ただいま', tr: 'geldim (eve dönünce)', pos: 'ifade', gram: 'Eve dönen söyler; karşılık おかえりなさい.' },
      { kana: 'いただきます', tr: 'afiyet olsun (yemeğe başlarken)', pos: 'ifade', gram: 'Yemekten ÖNCE. Bitince ごちそうさまでした denir.' },
      { kana: 'おねがいします', tr: 'rica ediyorum, lütfen', pos: 'ifade', gram: 'Bir şey isterken: これをおねがいします.' },
      { kana: 'はい', tr: 'evet', pos: 'ifade' },
      { kana: 'いいえ', tr: 'hayır', pos: 'ifade' },
      { kana: 'そうです', tr: 'öyle, evet öyle', pos: 'ifade', gram: 'Soruya onay: 学生ですか → はい、そうです.' },
      { kana: 'わかりました', tr: 'anladım', pos: 'ifade', gram: 'わかる fiilinin geçmişi. Türkçede "anlıyorum" desek de Japoncada GEÇMİŞ kullanılır.' },
      { kana: 'だいじょうぶ', tr: 'sorun değil, iyiyim', pos: 'na-sıfat', kanji: '大丈夫', gram: 'Hem "iyi misin?" sorusu hem "gerek yok" reddi olarak kullanılır.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'insan',
    title: 'İnsanlar ve aile',
    desc: 'Japoncada aile sözcüğü, KİMİN ailesi olduğuna göre değişir.',
    words: [
      { kana: 'わたし', tr: 'ben', pos: 'zamir', kanji: '私', gram: 'Nötr. Erkekler ぼく veya おれ de kullanır; おれ samimi/kaba.' },
      { kana: 'あなた', tr: 'sen, siz', pos: 'zamir', gram: 'DİKKAT: Japoncada ismi bilinen kişiye あなた denmez, adı söylenir (たなかさん). Fazla kullanmak kaba durur.' },
      { kana: 'ひと', tr: 'insan, kişi', pos: 'isim', kanji: '人' },
      { kana: 'ともだち', tr: 'arkadaş', pos: 'isim', kanji: '友だち' },
      { kana: 'かぞく', tr: 'aile', pos: 'isim', kanji: '家族' },
      { kana: 'ちち', tr: 'babam', pos: 'isim', kanji: '父', gram: 'KENDİ babandan söz ederken. Başkasınınki おとうさん.' },
      { kana: 'はは', tr: 'annem', pos: 'isim', kanji: '母', gram: 'Kendi annen. Başkasınınki おかあさん.' },
      { kana: 'おとうさん', tr: 'baba (başkasının)', pos: 'isim', gram: 'Başkasının babası ya da kendi babana seslenirken.' },
      { kana: 'おかあさん', tr: 'anne (başkasının)', pos: 'isim' },
      { kana: 'あに', tr: 'ağabeyim', pos: 'isim', kanji: '兄', gram: 'Kendi ağabeyin. Başkasınınki おにいさん.' },
      { kana: 'あね', tr: 'ablam', pos: 'isim', kanji: '姉', gram: 'Kendi ablan. Başkasınınki おねえさん.' },
      { kana: 'おとうと', tr: 'küçük erkek kardeş', pos: 'isim', kanji: '弟' },
      { kana: 'いもうと', tr: 'küçük kız kardeş', pos: 'isim', kanji: '妹' },
      { kana: 'こども', tr: 'çocuk', pos: 'isim', kanji: '子ども' },
      { kana: 'おとこ', tr: 'erkek', pos: 'isim', kanji: '男' },
      { kana: 'おんな', tr: 'kadın', pos: 'isim', kanji: '女' },
      { kana: 'せんせい', tr: 'öğretmen', pos: 'isim', kanji: '先生', gram: 'Hitap olarak da kullanılır: たなかせんせい. Kendine せんせい denmez.' },
      { kana: 'がくせい', tr: 'öğrenci', pos: 'isim', kanji: '学生' },
      { kana: 'なまえ', tr: 'isim, ad', pos: 'isim', kanji: '名前' },
      { kana: 'おなまえ', tr: 'adınız', pos: 'isim', gram: 'Baştaki お nezaket ekidir; karşındakinin şeyinden söz ederken eklenir.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'isaret',
    title: 'İşaret sözcükleri (こそあど)',
    desc: 'Japoncanın en düzenli sistemi: こ yakın, そ orta, あ uzak, ど soru.',
    words: [
      { kana: 'これ', tr: 'bu (şey)', pos: 'zamir', gram: 'Tek başına durur, isim almaz. "Bu kitap" demek için この本 denir.' },
      { kana: 'それ', tr: 'şu (karşıdakine yakın)', pos: 'zamir' },
      { kana: 'あれ', tr: 'o (ikinize de uzak)', pos: 'zamir' },
      { kana: 'どれ', tr: 'hangisi', pos: 'soru' },
      { kana: 'この', tr: 'bu …', pos: 'zamir', gram: 'MUTLAKA isimle kullanılır: このほん. Tek başına この denmez.' },
      { kana: 'その', tr: 'şu …', pos: 'zamir' },
      { kana: 'あの', tr: 'o …', pos: 'zamir' },
      { kana: 'どの', tr: 'hangi …', pos: 'soru' },
      { kana: 'ここ', tr: 'burası', pos: 'zamir' },
      { kana: 'そこ', tr: 'şurası', pos: 'zamir' },
      { kana: 'あそこ', tr: 'orası', pos: 'zamir', gram: 'Düzenden sapan tek üye: あこ değil あそこ’dur.' },
      { kana: 'どこ', tr: 'neresi', pos: 'soru' },
      { kana: 'こちら', tr: 'bu taraf, bu kişi', pos: 'zamir', gram: 'こっち’nin kibarı. İnsan tanıtırken de kullanılır: こちらは たなかさんです.' },
      { kana: 'そちら', tr: 'o taraf', pos: 'zamir' },
      { kana: 'あちら', tr: 'şu taraf', pos: 'zamir' },
      { kana: 'どちら', tr: 'hangi taraf, nere', pos: 'soru', gram: 'どこ’nun kibar hâli. "Nerelisiniz?" → どちらからですか.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'soru',
    title: 'Soru sözcükleri',
    desc: 'Japoncada soru cümlesi sonuna か eklenerek yapılır; sözcük sırası değişmez.',
    words: [
      { kana: 'なに', tr: 'ne', pos: 'soru', kanji: '何', gram: 'Bazı birleşimlerde なん okunur: なんですか, なんじ, なんにん.' },
      { kana: 'だれ', tr: 'kim', pos: 'soru', kanji: '誰', gram: 'Kibarı どなた.' },
      { kana: 'いつ', tr: 'ne zaman', pos: 'soru', gram: 'に eki ALMAZ: いつ行きますか (いつに değil).' },
      { kana: 'なぜ', tr: 'neden', pos: 'soru', gram: 'Konuşmada どうして daha sık kullanılır.' },
      { kana: 'どうして', tr: 'neden, niçin', pos: 'soru' },
      { kana: 'どう', tr: 'nasıl', pos: 'soru', gram: 'Durum sorar: どうですか "nasıl?".' },
      { kana: 'どうやって', tr: 'nasıl (hangi yolla)', pos: 'soru', gram: 'Yöntem sorar: どうやって行きますか.' },
      { kana: 'いくつ', tr: 'kaç tane', pos: 'soru', gram: 'Genel sayaç. Yaş sormak için de kullanılır: おいくつですか.' },
      { kana: 'いくら', tr: 'kaç para', pos: 'soru' },
      { kana: 'なんじ', tr: 'saat kaç', pos: 'soru', kanji: '何時' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'sayi',
    title: 'Sayılar ve sayaçlar',
    desc: 'Japoncada sayı tek başına kullanılmaz; sayılan şeye göre SAYAÇ eklenir.',
    words: [
      { kana: 'いち', tr: 'bir', pos: 'sayı', kanji: '一' },
      { kana: 'に', tr: 'iki', pos: 'sayı', kanji: '二' },
      { kana: 'さん', tr: 'üç', pos: 'sayı', kanji: '三' },
      { kana: 'よん', tr: 'dört', pos: 'sayı', kanji: '四', gram: 'し de denir ama し "ölüm" (死) ile aynı sesli olduğu için çoğu yerde よん tercih edilir.' },
      { kana: 'ご', tr: 'beş', pos: 'sayı', kanji: '五' },
      { kana: 'ろく', tr: 'altı', pos: 'sayı', kanji: '六' },
      { kana: 'なな', tr: 'yedi', pos: 'sayı', kanji: '七', gram: 'しち de denir; saatte 七時 = しちじ.' },
      { kana: 'はち', tr: 'sekiz', pos: 'sayı', kanji: '八' },
      { kana: 'きゅう', tr: 'dokuz', pos: 'sayı', kanji: '九', gram: 'く de okunur: 九時 = くじ.' },
      { kana: 'じゅう', tr: 'on', pos: 'sayı', kanji: '十' },
      { kana: 'ひゃく', tr: 'yüz', pos: 'sayı', kanji: '百', gram: 'Ses değişir: 三百 さんびゃく, 六百 ろっぴゃく, 八百 はっぴゃく.' },
      { kana: 'せん', tr: 'bin', pos: 'sayı', kanji: '千' },
      { kana: 'まん', tr: 'on bin', pos: 'sayı', kanji: '万', gram: 'Japonca büyük sayıları DÖRTLÜ sayar: 10.000 = 一万, 100.000 = 十万.' },
      { kana: 'ひとつ', tr: 'bir tane', pos: 'sayaç', gram: 'Genel sayaç. ふたつ, みっつ… diye gider; on’a kadar bu düzensiz seriyi ezberlemek gerekir.' },
      { kana: 'ふたつ', tr: 'iki tane', pos: 'sayaç' },
      { kana: 'みっつ', tr: 'üç tane', pos: 'sayaç' },
      { kana: 'まい', tr: '— adet (yassı şeyler)', pos: 'sayaç', kanji: '枚', gram: 'Kâğıt, gömlek, bilet gibi İNCE ve YASSI şeyler: きっぷ三まい.' },
      { kana: 'ほん', tr: '— adet (uzun şeyler)', pos: 'sayaç', kanji: '本', gram: 'Kalem, şişe, ağaç gibi UZUN şeyler. Ses değişir: 一本 いっぽん, 三本 さんぼん.' },
      { kana: 'さつ', tr: '— adet (kitap)', pos: 'sayaç', kanji: '冊', gram: 'Kitap ve defter için: 本を五さつ.' },
      { kana: 'にん', tr: '— kişi', pos: 'sayaç', kanji: '人', gram: 'İlk ikisi düzensiz: 一人 ひとり, 二人 ふたり, sonra 三人 さんにん.' },
      { kana: 'ひとり', tr: 'bir kişi, yalnız', pos: 'sayaç', kanji: '一人' },
      { kana: 'ふたり', tr: 'iki kişi', pos: 'sayaç', kanji: '二人' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'zaman',
    title: 'Zaman',
    desc: 'Belirli zaman ifadeleri に alır; "bugün, yarın" gibi göreli olanlar almaz.',
    words: [
      { kana: 'きょう', tr: 'bugün', pos: 'isim', kanji: '今日', gram: 'に EKİ ALMAZ: きょう行きます (きょうに değil).' },
      { kana: 'あした', tr: 'yarın', pos: 'isim', kanji: '明日', gram: 'に almaz.' },
      { kana: 'きのう', tr: 'dün', pos: 'isim', kanji: '昨日', gram: 'に almaz.' },
      { kana: 'あさって', tr: 'öbür gün', pos: 'isim' },
      { kana: 'おととい', tr: 'evvelki gün', pos: 'isim' },
      { kana: 'いま', tr: 'şimdi', pos: 'isim', kanji: '今' },
      { kana: 'あさ', tr: 'sabah', pos: 'isim', kanji: '朝' },
      { kana: 'ひる', tr: 'öğle', pos: 'isim', kanji: '昼' },
      { kana: 'よる', tr: 'gece, akşam', pos: 'isim', kanji: '夜' },
      { kana: 'ばん', tr: 'akşam', pos: 'isim', kanji: '晩' },
      { kana: 'まいにち', tr: 'her gün', pos: 'zarf', kanji: '毎日', gram: '毎 (mai) "her" demektir: まいあさ her sabah, まいばん her akşam.' },
      { kana: 'まいあさ', tr: 'her sabah', pos: 'zarf', kanji: '毎朝' },
      { kana: 'まいばん', tr: 'her akşam', pos: 'zarf', kanji: '毎晩' },
      { kana: 'ことし', tr: 'bu yıl', pos: 'isim', kanji: '今年' },
      { kana: 'らいねん', tr: 'gelecek yıl', pos: 'isim', kanji: '来年', gram: 'らい (来) "gelecek": らいしゅう gelecek hafta, らいげつ gelecek ay.' },
      { kana: 'きょねん', tr: 'geçen yıl', pos: 'isim', kanji: '去年' },
      { kana: 'らいしゅう', tr: 'gelecek hafta', pos: 'isim', kanji: '来週' },
      { kana: 'せんしゅう', tr: 'geçen hafta', pos: 'isim', kanji: '先週', gram: 'せん (先) "önceki": せんげつ geçen ay.' },
      { kana: 'じかん', tr: 'zaman, saat (süre)', pos: 'isim', kanji: '時間', gram: 'Süre bildirir: 三じかん üç saat. Saat kaç için じ kullanılır: 三じ saat üç.' },
      { kana: 'ふん', tr: 'dakika', pos: 'sayaç', kanji: '分', gram: 'Ses değişir: 一分 いっぷん, 三分 さんぷん, 四分 よんぷん.' },
      { kana: 'はん', tr: 'buçuk', pos: 'isim', kanji: '半', gram: 'Saate eklenir: 七時半 yedi buçuk.' },
      { kana: 'げつようび', tr: 'pazartesi', pos: 'isim', kanji: '月曜日', gram: 'Günler gök cisimleriyle: 月 ay, 火 ateş, 水 su, 木 ağaç, 金 altın, 土 toprak, 日 güneş.' },
      { kana: 'かようび', tr: 'salı', pos: 'isim', kanji: '火曜日' },
      { kana: 'すいようび', tr: 'çarşamba', pos: 'isim', kanji: '水曜日' },
      { kana: 'もくようび', tr: 'perşembe', pos: 'isim', kanji: '木曜日' },
      { kana: 'きんようび', tr: 'cuma', pos: 'isim', kanji: '金曜日' },
      { kana: 'どようび', tr: 'cumartesi', pos: 'isim', kanji: '土曜日' },
      { kana: 'にちようび', tr: 'pazar', pos: 'isim', kanji: '日曜日' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'fiil',
    title: 'Fiiller',
    desc: 'Fiil grubu çekimi belirler; kelimeyle birlikte grubunu da öğren.',
    words: [
      { kana: 'たべる', tr: 'yemek', pos: 'fiil', kanji: '食べる', gram: 'Ichidan (ru-fiil): る atılır → たべます, たべて, たべない.' },
      { kana: 'のむ', tr: 'içmek', pos: 'fiil', kanji: '飲む', gram: 'Godan: む → み olur → のみます. て biçimi のんで.' },
      { kana: 'みる', tr: 'görmek, izlemek', pos: 'fiil', kanji: '見る', gram: 'Ichidan → みます, みて.' },
      { kana: 'きく', tr: 'duymak, dinlemek, sormak', pos: 'fiil', kanji: '聞く', gram: 'Godan → ききます, きいて. Hem "dinlemek" hem "sormak" anlamına gelir.' },
      { kana: 'よむ', tr: 'okumak', pos: 'fiil', kanji: '読む', gram: 'Godan → よみます, よんで.' },
      { kana: 'かく', tr: 'yazmak, çizmek', pos: 'fiil', kanji: '書く', gram: 'Godan → かきます, かいて.' },
      { kana: 'いく', tr: 'gitmek', pos: 'fiil', kanji: '行く', gram: 'Godan ama て biçimi DÜZENSİZ: いいて değil いって.' },
      { kana: 'くる', tr: 'gelmek', pos: 'fiil', kanji: '来る', gram: 'Düzensiz: きます, きて, こない. Okunuş değişir: く→き→こ.' },
      { kana: 'する', tr: 'yapmak', pos: 'fiil', gram: 'Düzensiz: します, して, しない. İsimlerle birleşir: べんきょうする.' },
      { kana: 'かえる', tr: 'dönmek (eve)', pos: 'fiil', kanji: '帰る', gram: 'TUZAK: る ile biter ama GODAN’dır → かえります, かえって.' },
      { kana: 'はいる', tr: 'girmek', pos: 'fiil', kanji: '入る', gram: 'Bu da る ile biten godan tuzağı → はいります.' },
      { kana: 'はしる', tr: 'koşmak', pos: 'fiil', kanji: '走る', gram: 'Yine godan tuzağı → はしります.' },
      { kana: 'おきる', tr: 'kalkmak, uyanmak', pos: 'fiil', kanji: '起きる', gram: 'Ichidan → おきます.' },
      { kana: 'ねる', tr: 'uyumak', pos: 'fiil', kanji: '寝る', gram: 'Ichidan → ねます.' },
      { kana: 'あう', tr: 'buluşmak', pos: 'fiil', kanji: '会う', gram: 'を DEĞİL に alır: ともだちに あいます.' },
      { kana: 'かう', tr: 'satın almak', pos: 'fiil', kanji: '買う', gram: 'Godan → かいます, かって.' },
      { kana: 'まつ', tr: 'beklemek', pos: 'fiil', kanji: '待つ', gram: 'Godan → まちます, まって.' },
      { kana: 'はなす', tr: 'konuşmak', pos: 'fiil', kanji: '話す', gram: 'Godan → はなします, はなして.' },
      { kana: 'つくる', tr: 'yapmak, üretmek', pos: 'fiil', kanji: '作る', gram: 'Godan → つくります.' },
      { kana: 'おしえる', tr: 'öğretmek', pos: 'fiil', kanji: '教える', gram: 'Ichidan. Kime öğretildiği に ile: がくせいに おしえます.' },
      { kana: 'ならう', tr: 'öğrenmek (birinden)', pos: 'fiil', kanji: '習う', gram: 'Kimden öğrenildiği に: せんせいに ならいます.' },
      { kana: 'つかう', tr: 'kullanmak', pos: 'fiil', kanji: '使う' },
      { kana: 'あるく', tr: 'yürümek', pos: 'fiil', kanji: '歩く' },
      { kana: 'のる', tr: 'binmek', pos: 'fiil', kanji: '乗る', gram: 'を DEĞİL に alır: でんしゃに のります.' },
      { kana: 'やすむ', tr: 'dinlenmek, izin almak', pos: 'fiil', kanji: '休む' },
      { kana: 'およぐ', tr: 'yüzmek', pos: 'fiil', kanji: '泳ぐ', gram: 'Godan, ぐ ile biter → て biçimi およいで.' },
      { kana: 'かんがえる', tr: 'düşünmek (üzerine)', pos: 'fiil', kanji: '考える', gram: 'Ichidan. Fikir yürütmek anlamında.' },
      { kana: 'おもう', tr: 'sanmak, düşünmek', pos: 'fiil', kanji: '思う', gram: '〜と思います kalıbında fiil SADE biçimde kalır: 行くと思います.' },
      { kana: 'いう', tr: 'söylemek', pos: 'fiil', kanji: '言う', gram: 'Okunuşu "yuu" gibi duyulur. 〜と言います.' },
      { kana: 'わかる', tr: 'anlamak', pos: 'fiil', gram: 'を DEĞİL が alır: 日本語が わかります.' },
      { kana: 'ある', tr: 'var (cansız)', pos: 'fiil', gram: 'CANSIZ şeyler için. Olumsuzu düzensiz: ありません / ない.' },
      { kana: 'いる', tr: 'var (canlı)', pos: 'fiil', gram: 'İnsan ve hayvan için. Ichidan → います.' },
      { kana: 'あそぶ', tr: 'oynamak, eğlenmek', pos: 'fiil', kanji: '遊ぶ', gram: 'Godan, ぶ ile biter → て biçimi あそんで.' },
      { kana: 'わすれる', tr: 'unutmak', pos: 'fiil', kanji: '忘れる', gram: 'Ichidan.' },
      { kana: 'おぼえる', tr: 'ezberlemek, hatırda tutmak', pos: 'fiil', kanji: '覚える', gram: 'Ichidan.' },
      { kana: 'でる', tr: 'çıkmak', pos: 'fiil', kanji: '出る', gram: 'Ichidan. Çıkılan yer を alır: うちを でます.' },
      { kana: 'ふる', tr: '(yağmur/kar) yağmak', pos: 'fiil', kanji: '降る', gram: 'Özne yağmur/kardır: あめが ふります.' },
      { kana: 'つかれる', tr: 'yorulmak', pos: 'fiil', kanji: '疲れる', gram: 'Genelde ています ile: つかれています "yorgunum".' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'sifat',
    title: 'Sıfatlar',
    desc: 'İki tür vardır ve çekimleri farklıdır: い-sıfat ve な-sıfat.',
    words: [
      { kana: 'おおきい', tr: 'büyük', pos: 'i-sıfat', kanji: '大きい', gram: 'い-sıfat: olumsuz おおきくない, geçmiş おおきかった.' },
      { kana: 'ちいさい', tr: 'küçük', pos: 'i-sıfat', kanji: '小さい' },
      { kana: 'たかい', tr: 'pahalı, yüksek', pos: 'i-sıfat', kanji: '高い', gram: 'İki anlamı var; bağlamdan ayrılır.' },
      { kana: 'やすい', tr: 'ucuz', pos: 'i-sıfat', kanji: '安い' },
      { kana: 'あたらしい', tr: 'yeni', pos: 'i-sıfat', kanji: '新しい' },
      { kana: 'ふるい', tr: 'eski', pos: 'i-sıfat', kanji: '古い', gram: 'İNSAN için kullanılmaz; yaşlı insan için としより denir.' },
      { kana: 'あつい', tr: 'sıcak', pos: 'i-sıfat', kanji: '暑い', gram: 'Hava için 暑い, nesne için 熱い — ikisi de あつい okunur.' },
      { kana: 'さむい', tr: 'soğuk (hava)', pos: 'i-sıfat', kanji: '寒い', gram: 'Hava için. Nesne soğuksa つめたい.' },
      { kana: 'おいしい', tr: 'lezzetli', pos: 'i-sıfat' },
      { kana: 'たのしい', tr: 'eğlenceli', pos: 'i-sıfat', kanji: '楽しい' },
      { kana: 'むずかしい', tr: 'zor', pos: 'i-sıfat', kanji: '難しい' },
      { kana: 'やさしい', tr: 'kolay; nazik', pos: 'i-sıfat', gram: 'İki ayrı anlam: 易しい kolay, 優しい nazik. Yazım farklı, okunuş aynı.' },
      { kana: 'いい', tr: 'iyi', pos: 'i-sıfat', gram: 'DÜZENSİZ: olumsuzu いくない değil よくない, geçmişi よかった.' },
      { kana: 'わるい', tr: 'kötü', pos: 'i-sıfat', kanji: '悪い' },
      { kana: 'おもしろい', tr: 'ilginç, eğlenceli', pos: 'i-sıfat' },
      { kana: 'いそがしい', tr: 'meşgul', pos: 'i-sıfat', kanji: '忙しい' },
      { kana: 'ながい', tr: 'uzun', pos: 'i-sıfat', kanji: '長い' },
      { kana: 'みじかい', tr: 'kısa', pos: 'i-sıfat', kanji: '短い' },
      { kana: 'しろい', tr: 'beyaz', pos: 'i-sıfat', kanji: '白い' },
      { kana: 'くろい', tr: 'siyah', pos: 'i-sıfat', kanji: '黒い' },
      { kana: 'あかい', tr: 'kırmızı', pos: 'i-sıfat', kanji: '赤い' },
      { kana: 'あおい', tr: 'mavi', pos: 'i-sıfat', kanji: '青い' },
      { kana: 'きれい', tr: 'güzel, temiz', pos: 'na-sıfat', gram: 'TUZAK: い ile biter ama NA-sıfattır → きれいな へや, olumsuzu きれいじゃない.' },
      { kana: 'しずか', tr: 'sessiz', pos: 'na-sıfat', kanji: '静か', gram: 'na-sıfat: しずかな, しずかじゃない.' },
      { kana: 'にぎやか', tr: 'hareketli, kalabalık', pos: 'na-sıfat' },
      { kana: 'ゆうめい', tr: 'ünlü', pos: 'na-sıfat', kanji: '有名', gram: 'い ile bitiyor gibi görünse de na-sıfattır.' },
      { kana: 'べんり', tr: 'kullanışlı', pos: 'na-sıfat', kanji: '便利' },
      { kana: 'すき', tr: 'sevmek, hoşlanmak', pos: 'na-sıfat', kanji: '好き', gram: 'Fiil değil SIFATtır: が alır — ねこが すきです.' },
      { kana: 'きらい', tr: 'sevmemek', pos: 'na-sıfat', kanji: '嫌い', gram: 'い ile biter ama na-sıfat. が alır.' },
      { kana: 'じょうず', tr: 'usta, iyi (bir işte)', pos: 'na-sıfat', kanji: '上手', gram: 'が alır. KENDİN için kullanmak övünmek sayılır; kendinden söz ederken できます denir.' },
      { kana: 'へた', tr: 'beceriksiz', pos: 'na-sıfat', kanji: '下手' },
      { kana: 'げんき', tr: 'sağlıklı, enerjik', pos: 'na-sıfat', kanji: '元気', gram: 'おげんきですか "nasılsın?" demektir.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'yiyecek',
    title: 'Yiyecek ve içecek',
    desc: '',
    words: [
      { kana: 'ごはん', tr: 'pilav, yemek', pos: 'isim', gram: 'Hem "pişmiş pirinç" hem genel olarak "öğün": あさごはん kahvaltı.' },
      { kana: 'あさごはん', tr: 'kahvaltı', pos: 'isim', kanji: '朝ご飯' },
      { kana: 'ひるごはん', tr: 'öğle yemeği', pos: 'isim', kanji: '昼ご飯' },
      { kana: 'ばんごはん', tr: 'akşam yemeği', pos: 'isim', kanji: '晩ご飯' },
      { kana: 'みず', tr: 'su', pos: 'isim', kanji: '水', gram: 'SOĞUK su. Sıcak su ayrı kelimedir: おゆ.' },
      { kana: 'おちゃ', tr: 'çay', pos: 'isim', kanji: 'お茶', gram: 'Baştaki お artık kelimenin parçası sayılır.' },
      { kana: 'さかな', tr: 'balık', pos: 'isim', kanji: '魚' },
      { kana: 'にく', tr: 'et', pos: 'isim', kanji: '肉' },
      { kana: 'たまご', tr: 'yumurta', pos: 'isim', kanji: '卵' },
      { kana: 'やさい', tr: 'sebze', pos: 'isim', kanji: '野菜' },
      { kana: 'くだもの', tr: 'meyve', pos: 'isim', kanji: '果物' },
      { kana: 'りんご', tr: 'elma', pos: 'isim' },
      { kana: 'みかん', tr: 'mandalina', pos: 'isim' },
      { kana: 'おかし', tr: 'tatlı, atıştırmalık', pos: 'isim', kanji: 'お菓子' },
      { kana: 'さとう', tr: 'şeker (toz)', pos: 'isim', kanji: '砂糖' },
      { kana: 'しお', tr: 'tuz', pos: 'isim', kanji: '塩' },
      { kana: 'おさけ', tr: 'alkollü içki', pos: 'isim', kanji: 'お酒', gram: 'Yalnızca sake değil, genel olarak alkol demektir.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'yer',
    title: 'Yerler ve konum',
    desc: 'Konum sözcükleri isimle の ile bağlanır: つくえの うえ.',
    words: [
      { kana: 'うち', tr: 'ev, bizim ev', pos: 'isim', gram: 'いえ "bina olarak ev", うち "benim/bizim evimiz" hissi taşır.' },
      { kana: 'いえ', tr: 'ev (bina)', pos: 'isim', kanji: '家' },
      { kana: 'へや', tr: 'oda', pos: 'isim', kanji: '部屋' },
      { kana: 'がっこう', tr: 'okul', pos: 'isim', kanji: '学校' },
      { kana: 'だいがく', tr: 'üniversite', pos: 'isim', kanji: '大学' },
      { kana: 'としょかん', tr: 'kütüphane', pos: 'isim', kanji: '図書館' },
      { kana: 'びょういん', tr: 'hastane', pos: 'isim', kanji: '病院', gram: 'DİKKAT: びよういん (kuaför) ile karışır — küçük ょ farkı.' },
      { kana: 'びよういん', tr: 'kuaför', pos: 'isim', kanji: '美容院' },
      { kana: 'えき', tr: 'istasyon', pos: 'isim', kanji: '駅' },
      { kana: 'みせ', tr: 'dükkân', pos: 'isim', kanji: '店' },
      { kana: 'こうえん', tr: 'park', pos: 'isim', kanji: '公園' },
      { kana: 'ぎんこう', tr: 'banka', pos: 'isim', kanji: '銀行' },
      { kana: 'まち', tr: 'şehir, kasaba', pos: 'isim', kanji: '町' },
      { kana: 'くに', tr: 'ülke, memleket', pos: 'isim', kanji: '国' },
      { kana: 'うえ', tr: 'üst', pos: 'isim', kanji: '上', gram: 'Konum: つくえの うえに — "masanın üstünde".' },
      { kana: 'した', tr: 'alt', pos: 'isim', kanji: '下' },
      { kana: 'なか', tr: 'iç', pos: 'isim', kanji: '中' },
      { kana: 'そと', tr: 'dış', pos: 'isim', kanji: '外' },
      { kana: 'まえ', tr: 'ön, önce', pos: 'isim', kanji: '前', gram: 'Hem yer hem zaman: えきのまえ istasyonun önü, さんねんまえ üç yıl önce.' },
      { kana: 'うしろ', tr: 'arka', pos: 'isim', kanji: '後ろ' },
      { kana: 'となり', tr: 'yan, bitişik', pos: 'isim', kanji: '隣', gram: 'AYNI türden şeyin yanı: ev yanında ev. Genel "yakın" ちかく.' },
      { kana: 'ちかく', tr: 'yakın, civar', pos: 'isim', kanji: '近く' },
      { kana: 'みぎ', tr: 'sağ', pos: 'isim', kanji: '右' },
      { kana: 'ひだり', tr: 'sol', pos: 'isim', kanji: '左' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'esya',
    title: 'Eşyalar',
    desc: '',
    words: [
      { kana: 'ほん', tr: 'kitap', pos: 'isim', kanji: '本' },
      { kana: 'つくえ', tr: 'masa (çalışma)', pos: 'isim', kanji: '机', gram: 'Yemek masası ayrı: テーブル (katakana).' },
      { kana: 'いす', tr: 'sandalye', pos: 'isim', kanji: '椅子' },
      { kana: 'まど', tr: 'pencere', pos: 'isim', kanji: '窓' },
      { kana: 'とけい', tr: 'saat (nesne)', pos: 'isim', kanji: '時計' },
      { kana: 'かばん', tr: 'çanta', pos: 'isim' },
      { kana: 'かさ', tr: 'şemsiye', pos: 'isim', kanji: '傘' },
      { kana: 'くつ', tr: 'ayakkabı', pos: 'isim', kanji: '靴' },
      { kana: 'ふく', tr: 'kıyafet', pos: 'isim', kanji: '服' },
      { kana: 'えんぴつ', tr: 'kurşun kalem', pos: 'isim', kanji: '鉛筆' },
      { kana: 'かみ', tr: 'kâğıt', pos: 'isim', kanji: '紙', gram: 'Aynı okunuş 髪 (saç) ve 神 (tanrı) için de kullanılır; bağlam ayırır.' },
      { kana: 'てがみ', tr: 'mektup', pos: 'isim', kanji: '手紙' },
      { kana: 'しんぶん', tr: 'gazete', pos: 'isim', kanji: '新聞' },
      { kana: 'ざっし', tr: 'dergi', pos: 'isim', kanji: '雑誌' },
      { kana: 'でんわ', tr: 'telefon', pos: 'isim', kanji: '電話', gram: 'Aramak için する: でんわを します.' },
      { kana: 'くるま', tr: 'araba', pos: 'isim', kanji: '車' },
      { kana: 'でんしゃ', tr: 'tren', pos: 'isim', kanji: '電車', gram: 'Binmek に ile: でんしゃに のります.' },
      { kana: 'じてんしゃ', tr: 'bisiklet', pos: 'isim', kanji: '自転車' },
      { kana: 'きっぷ', tr: 'bilet', pos: 'isim', kanji: '切符' },
      { kana: 'おかね', tr: 'para', pos: 'isim', kanji: 'お金' },
      { kana: 'にもつ', tr: 'bagaj, yük', pos: 'isim', kanji: '荷物' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'doga',
    title: 'Doğa, hava ve canlılar',
    desc: '',
    words: [
      { kana: 'そら', tr: 'gökyüzü', pos: 'isim', kanji: '空' },
      { kana: 'うみ', tr: 'deniz', pos: 'isim', kanji: '海' },
      { kana: 'やま', tr: 'dağ', pos: 'isim', kanji: '山' },
      { kana: 'かわ', tr: 'nehir', pos: 'isim', kanji: '川' },
      { kana: 'き', tr: 'ağaç', pos: 'isim', kanji: '木' },
      { kana: 'はな', tr: 'çiçek', pos: 'isim', kanji: '花', gram: 'はな aynı zamanda 鼻 (burun) demektir; vurgu farklıdır.' },
      { kana: 'あめ', tr: 'yağmur', pos: 'isim', kanji: '雨', gram: 'あめ aynı zamanda 飴 (şeker) demektir; vurgu ayırır.' },
      { kana: 'ゆき', tr: 'kar', pos: 'isim', kanji: '雪' },
      { kana: 'かぜ', tr: 'rüzgâr; nezle', pos: 'isim', gram: '風 rüzgâr, 風邪 nezle — ikisi de かぜ. かぜを ひく "nezle olmak".' },
      { kana: 'てんき', tr: 'hava durumu', pos: 'isim', kanji: '天気', gram: 'いいてんき "güzel hava".' },
      { kana: 'はる', tr: 'ilkbahar', pos: 'isim', kanji: '春' },
      { kana: 'なつ', tr: 'yaz', pos: 'isim', kanji: '夏' },
      { kana: 'あき', tr: 'sonbahar', pos: 'isim', kanji: '秋' },
      { kana: 'ふゆ', tr: 'kış', pos: 'isim', kanji: '冬' },
      { kana: 'いぬ', tr: 'köpek', pos: 'isim', kanji: '犬' },
      { kana: 'ねこ', tr: 'kedi', pos: 'isim', kanji: '猫' },
      { kana: 'とり', tr: 'kuş', pos: 'isim', kanji: '鳥' },
      { kana: 'むし', tr: 'böcek', pos: 'isim', kanji: '虫' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'vucut',
    title: 'Vücut ve sağlık',
    desc: '',
    words: [
      { kana: 'あたま', tr: 'baş, kafa', pos: 'isim', kanji: '頭', gram: 'Ağrı が ile: あたまが いたい.' },
      { kana: 'め', tr: 'göz', pos: 'isim', kanji: '目' },
      { kana: 'みみ', tr: 'kulak', pos: 'isim', kanji: '耳' },
      { kana: 'くち', tr: 'ağız', pos: 'isim', kanji: '口' },
      { kana: 'て', tr: 'el', pos: 'isim', kanji: '手' },
      { kana: 'あし', tr: 'ayak, bacak', pos: 'isim', kanji: '足', gram: 'Japoncada ayak ve bacak tek kelimedir.' },
      { kana: 'からだ', tr: 'vücut', pos: 'isim', kanji: '体' },
      { kana: 'いたい', tr: 'acıyor, ağrılı', pos: 'i-sıfat', kanji: '痛い', gram: 'Ağrıyan yer が alır: おなかが いたいです.' },
      { kana: 'びょうき', tr: 'hastalık', pos: 'isim', kanji: '病気' },
      { kana: 'くすり', tr: 'ilaç', pos: 'isim', kanji: '薬', gram: 'İlaç "içilir" değil のむ ile kullanılır: くすりを のみます.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'zarf',
    title: 'Zarflar ve sıklık',
    desc: 'Bazıları OLUMSUZ cümle ister; bu, sık yapılan hatalardandır.',
    words: [
      { kana: 'とても', tr: 'çok', pos: 'zarf' },
      { kana: 'すこし', tr: 'biraz', pos: 'zarf', kanji: '少し' },
      { kana: 'たくさん', tr: 'çok, bol', pos: 'zarf' },
      { kana: 'ちょっと', tr: 'biraz', pos: 'zarf', gram: 'Kibar reddetme olarak da kullanılır: ちょっと… demek "olmaz" demektir.' },
      { kana: 'あまり', tr: 'pek (…değil)', pos: 'zarf', gram: 'MUTLAKA olumsuzla: あまり すきじゃない "pek sevmem".' },
      { kana: 'ぜんぜん', tr: 'hiç (…değil)', pos: 'zarf', kanji: '全然', gram: 'Olumsuzla kullanılır: ぜんぜん わかりません.' },
      { kana: 'いつも', tr: 'her zaman', pos: 'zarf' },
      { kana: 'ときどき', tr: 'bazen', pos: 'zarf', kanji: '時々' },
      { kana: 'よく', tr: 'sık sık; iyi', pos: 'zarf', gram: 'İki anlamı var: sıklık ve "iyi biçimde". いい’nin zarf hâli de よく’tür.' },
      { kana: 'また', tr: 'yine, tekrar', pos: 'zarf' },
      { kana: 'もう', tr: 'artık, çoktan', pos: 'zarf', gram: 'Geçmişle "çoktan": もう たべました. Olumsuzla "artık değil": もう たべません.' },
      { kana: 'まだ', tr: 'henüz, hâlâ', pos: 'zarf', gram: 'Olumsuzla "henüz değil": まだ たべていません.' },
      { kana: 'すぐ', tr: 'hemen', pos: 'zarf' },
      { kana: 'ゆっくり', tr: 'yavaşça, acele etmeden', pos: 'zarf' },
      { kana: 'はやく', tr: 'hızlıca, erken', pos: 'zarf', kanji: '早く', gram: 'はやい sıfatının zarf hâli: い → く.' },
      { kana: 'いちばん', tr: 'en …', pos: 'zarf', kanji: '一番', gram: 'Üstünlük: いちばん たかい "en pahalı".' },
      { kana: 'かならず', tr: 'mutlaka', pos: 'zarf', kanji: '必ず' },
      { kana: 'たぶん', tr: 'muhtemelen', pos: 'zarf', gram: 'Genelde でしょう ile birlikte: たぶん 来るでしょう.' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'edat',
    title: 'Edatlar ve bağlaçlar',
    desc: 'Türkçedeki hâl ekleri gibi çalışır; kelimenin ARKASINA gelir.',
    words: [
      {
        kana: 'は', say: 'わ',
        tr: '— konu eki',
        pos: 'edat',
        reading: 'wa',
        note: 'Ek olarak kullanıldığında "wa" okunur.',
        gram: 'Cümlenin konusunu işaretler: わたしは… "bana gelince…".',
      },
      { kana: 'が', tr: '— özne eki', pos: 'edat', gram: 'Yeni veya vurgulanan bilgiyi getirir. すき, わかる, ある/いる bu eki alır.' },
      { kana: 'を', say: 'お', tr: '— nesne eki (-i/-ı)', pos: 'edat', reading: 'o', note: 'Yazılışı を, okunuşu "o".', gram: 'Eylemin üzerinde gerçekleştiği şeyi işaretler: ほんを よみます.' },
      { kana: 'に', tr: '— yönelme (-e/-a)', pos: 'edat', gram: 'Yön, varış, zaman ve varlık bildirir: がっこうに いきます, 七時に.' },
      { kana: 'で', tr: '— bulunma/araç (-de, ile)', pos: 'edat', gram: 'Eylemin YERİ ve aracı: いえで たべます, バスで いきます.' },
      { kana: 'へ', say: 'え', tr: '— yön (-e doğru)', pos: 'edat', reading: 'e', note: 'Ek olarak "e" okunur.', gram: 'に ile yakın; へ yönü vurgular.' },
      { kana: 'と', tr: 've; ile', pos: 'edat', gram: 'İsimleri bağlar (TAM liste) ve "birlikte" bildirir: ともだちと いきます.' },
      { kana: 'や', tr: 've (örnek olarak)', pos: 'edat', gram: 'と’den farkı: liste EKSİK, "gibi şeyler" anlamı taşır.' },
      { kana: 'の', tr: '— tamlayan (-in)', pos: 'edat', gram: 'わたしの ほん "benim kitabım". Sahiplik ve niteleme.' },
      { kana: 'も', tr: 'de, da', pos: 'edat', gram: 'は veya を yerine geçer, yanına eklenmez: わたしも (わたしはも değil).' },
      { kana: 'から', tr: '-den (başlangıç); çünkü', pos: 'edat', gram: 'İki işlevi var: yer/zaman başlangıcı ve sebep.' },
      { kana: 'まで', tr: '-e kadar', pos: 'edat' },
      { kana: 'か', tr: '— soru eki', pos: 'edat', gram: 'Cümle sonuna gelir; soru işareti gerekmez: わかりますか。' },
      { kana: 'ね', tr: 'değil mi', pos: 'edat', gram: 'Onay arar: いいてんきですね.' },
      { kana: 'よ', tr: '— bilgi verme', pos: 'edat', gram: 'Karşıdakinin bilmediğini söylerken: あしたは やすみですよ.' },
      { kana: 'そして', tr: 've, sonra', pos: 'bağlaç', gram: 'Cümle başında.' },
      { kana: 'でも', tr: 'ama', pos: 'bağlaç', gram: 'Cümle başında. Cümle içinde が kullanılır.' },
      { kana: 'だから', tr: 'bu yüzden', pos: 'bağlaç' },
      { kana: 'それから', tr: 'ondan sonra', pos: 'bağlaç' },
    ],
  },

  // ————————————————————————————————————————————————————————————
  {
    id: 'okul',
    title: 'Okul, iş ve günlük hayat',
    desc: '',
    words: [
      { kana: 'べんきょう', tr: 'çalışma (ders)', pos: 'isim', kanji: '勉強', gram: 'する ile fiil olur: べんきょうします.' },
      { kana: 'しゅくだい', tr: 'ödev', pos: 'isim', kanji: '宿題', gram: 'する ile: しゅくだいを します.' },
      { kana: 'しけん', tr: 'sınav', pos: 'isim', kanji: '試験' },
      { kana: 'じゅぎょう', tr: 'ders (saati)', pos: 'isim', kanji: '授業' },
      { kana: 'しごと', tr: 'iş', pos: 'isim', kanji: '仕事', gram: 'する ile: しごとを します.' },
      { kana: 'かいしゃ', tr: 'şirket', pos: 'isim', kanji: '会社' },
      { kana: 'やすみ', tr: 'tatil, izin', pos: 'isim', kanji: '休み' },
      { kana: 'かいもの', tr: 'alışveriş', pos: 'isim', kanji: '買い物', gram: 'する ile: かいものを します.' },
      { kana: 'りょこう', tr: 'seyahat', pos: 'isim', kanji: '旅行', gram: 'する ile fiil olur.' },
      { kana: 'しゃしん', tr: 'fotoğraf', pos: 'isim', kanji: '写真', gram: 'Çekmek とる ile: しゃしんを とります.' },
      { kana: 'おんがく', tr: 'müzik', pos: 'isim', kanji: '音楽' },
      { kana: 'えいが', tr: 'film', pos: 'isim', kanji: '映画' },
      { kana: 'ことば', tr: 'kelime, dil', pos: 'isim', kanji: '言葉' },
      { kana: 'にほんご', tr: 'Japonca', pos: 'isim', kanji: '日本語', gram: 'ご (語) "dil" demektir: トルコご Türkçe, えいご İngilizce.' },
      { kana: 'にほん', tr: 'Japonya', pos: 'isim', kanji: '日本' },
      { kana: 'はなし', tr: 'konuşma, hikâye', pos: 'isim', kanji: '話' },
      { kana: 'うた', tr: 'şarkı', pos: 'isim', kanji: '歌' },
      { kana: 'あんない', tr: 'rehberlik, yönlendirme', pos: 'isim', kanji: '案内' },
    ],
  },
]

// ————————————————————————— Türetilmiş listeler —————————————————————————

export const ALL_VOCAB: VocabWord[] = VOCAB_THEMES.flatMap((t) => t.words)

export const VOCAB_BY_KANA = new Map(ALL_VOCAB.map((w) => [w.kana, w]))

export const POS_TR: Record<Pos, string> = {
  isim: 'isim',
  fiil: 'fiil',
  'i-sıfat': 'い-sıfat',
  'na-sıfat': 'な-sıfat',
  zarf: 'zarf',
  zamir: 'zamir',
  soru: 'soru sözcüğü',
  sayı: 'sayı',
  sayaç: 'sayaç',
  edat: 'edat',
  bağlaç: 'bağlaç',
  ifade: 'kalıp ifade',
}
