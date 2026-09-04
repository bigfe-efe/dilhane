// Hiragana'nın "özel kuralları" — harfleri bilmenin yetmediği yerler.
//
// NEDEN AYRI BİR SAYFA:
// Kana tablosu 46 karakteri öğretir ve insan "bitti" sanır. Oysa okumayı asıl
// zorlaştıran şey tablo değil, tablonun anlatmadığı bir avuç kural: küçük っ,
// uzun ünlü, ん'in kendi başına bir hece olması, ve は'nın ek olduğunda "wa"
// okunması. Bitirme sınavında bunlar ayrı bir bölüm; o bölümde düşen birinin
// gidebileceği bir yer olsun diye burası var.
//
// Hepsinin altında TEK bir ilke yatıyor: Japoncada her hece eşit uzunlukta
// okunur. Küçük っ bir hecelik sessizlik, uzun ünlü iki hecelik ses, ん bir
// hecelik burun sesidir. Bu ilkeyi anlayan dördünü birden anlar.

export interface RuleExample {
  kana: string
  reading: string
  tr: string
  /** Karşılaştırma çifti — yanlış okunursa hangi kelimeye dönüşür */
  vs?: { kana: string; reading: string; tr: string }
}

export interface KanaRule {
  id: string
  glyph: string
  title: string
  /** Süzgeç çipi için kısa ad — başlıktan türetmek çirkin sonuç veriyordu */
  short: string
  /** Tek cümlelik kural — kartın en tepesinde durur */
  rule: string
  body: string[]
  examples: RuleExample[]
  /** En sık yapılan hata */
  pitfall: string
}

export const MORA_PRINCIPLE = {
  title: 'Önce şunu anla: her hece eşit uzunluktadır',
  body: [
    'Türkçede heceler farklı uzunlukta olabilir; Japoncada olamaz. Her hece (mora) aynı süreyi kaplar — metronom gibi.',
    'Aşağıdaki dört kuralın hepsi bunun sonucudur. Küçük っ bir hecelik sessizliktir. Uzun ünlü iki hecedir. ん tek başına bir hecedir. Bunları yutarsan kelime kısalır ve başka bir kelimeye dönüşür.',
    'Okurken hece hece, eşit tempoda git. Acele etmek en sık yapılan hatadır.',
  ],
}

export const KANA_RULES: KanaRule[] = [
  {
    id: 'dakuten',
    short: 'Dakuten ゛゜',
    glyph: '゛',
    title: 'Dakuten ve handakuten — sesi kalınlaştıran işaretler',
    rule: 'Sağ üste konan iki çentik (゛) sessizi tonlu yapar; küçük daire (゜) yalnızca は satırına gelir ve h sesini p yapar.',
    body: [
      'Ezberlenecek 25 yeni karakter yok — ezberlenecek DÖRT kural var. İşaret geldiğinde ses şöyle değişir:',
      'か→が (k→g) · さ→ざ (s→z) · た→だ (t→d) · は→ば (h→b)',
      'Handakuten (゜) tek bir satıra gelir: は→ぱ (h→p). Başka hiçbir satırda kullanılmaz.',
      'Kuralı bilirsen tablo kendiliğinden çıkar: き’nin dakutenlisi ぎ’dir, ezberlemeye gerek yok.',
      'İki istisna okunuşta: し→じ "ji" olur ("zi" değil), ち→ぢ da "ji" okunur. Aynı şekilde つ→づ "zu" olur, す→ず gibi. Yani ji ve zu seslerinin İKİ yazımı vardır ve ARALARINDA SES FARKI YOKTUR (bu dörtlünün adı 四つ仮名).',
      // Öğrencinin ilk sorusu "peki hangisini yazacağım" oluyor ve "ぢ nadirdir"
      // demek onu cevaplamıyor — geriye "demek ki ezber" hissi kalıyor. Oysa
      // kural resmîdir (現代仮名遣い, 1986): varsayılan じ/ず, ぢ/づ yalnızca iki
      // durumda. Kuralı yazmayınca öğrenci her ji'de duraksıyor.
      'HANGİSİNİ YAZACAĞIN kural: varsayılan HER ZAMAN じ ve ず. ぢ/づ yalnızca iki durumda çıkar — (1) birleşik kelimede ikinci parçanın başındaki ち/つ tonlanınca: はな+ち → はなぢ (burun kanaması), みか+つき → みかづき (hilal); (2) aynı hece kendinden hemen sonra tekrarlanınca: ちぢむ (büzülmek), つづく (devam etmek).',
      'Pratikte: duyduğun "ji" sesini じ yaz, neredeyse her zaman doğru olur. N5 boyunca ぢ ile pek karşılaşmazsın. Klavyede de böyle — "ji" tuşları じ verir, ぢ için "di" yazman gerekir.',
    ],
    examples: [
      { kana: 'かぎ', reading: 'kagi', tr: 'anahtar', vs: { kana: 'かき', reading: 'kaki', tr: 'Trabzon hurması' } },
      { kana: 'だいがく', reading: 'daigaku', tr: 'üniversite' },
      { kana: 'ざっし', reading: 'zasshi', tr: 'dergi' },
      { kana: 'でんわ', reading: 'denwa', tr: 'telefon' },
      { kana: 'えんぴつ', reading: 'enpitsu', tr: 'kurşun kalem — ぴ handakutenli' },
      { kana: 'さんぽ', reading: 'sanpo', tr: 'yürüyüş' },
    ],
    pitfall:
      'İşareti gözden kaçırmak. かき (hurma) ile かぎ (anahtar) arasındaki tek fark iki minik çentiktir; küçük puntoda kolayca atlanır. Bir de ぱ/ば ayrımı: daire mi çentik mi, dikkatle bak.',
  },
  {
    id: 'sokuon',
    short: 'Küçük っ',
    glyph: 'っ',
    title: 'Küçük っ — sessizin ikilenmesi',
    rule: 'Küçük っ ses vermez; kendinden sonraki sessizi ikiler ve orada bir hecelik duraklama olur.',
    body: [
      'Normal boy つ (tsu) ile küçük boy っ farklı şeylerdir. Küçüğün kendi sesi yoktur.',
      'Romajide sonraki sessiz harf iki kez yazılır: がっこう = ga-k-ko-u. Söylerken "gak" der gibi bir an durursun, sonra "kou" gelir.',
      'Duraklama boşa geçen zaman değil, BİR HECE uzunluğunda. Yutarsan kelime yanlış olur.',
    ],
    examples: [
      {
        kana: 'きって',
        reading: 'kitte',
        tr: 'pul',
        vs: { kana: 'きて', reading: 'kite', tr: 'gel (emir)' },
      },
      {
        kana: 'おっと',
        reading: 'otto',
        tr: 'koca (eş)',
        vs: { kana: 'おと', reading: 'oto', tr: 'ses' },
      },
      { kana: 'がっこう', reading: 'gakkou', tr: 'okul' },
      { kana: 'ざっし', reading: 'zasshi', tr: 'dergi' },
      { kana: 'きっぷ', reading: 'kippu', tr: 'bilet' },
    ],
    pitfall:
      'Küçük っ’yi "tsu" diye okumak. Sesi yoktur — yalnızca sonraki sessizi ikiler. Bir de duraklamayı atlayıp "gakou" demek: bu başka bir kelime olur.',
  },
  {
    id: 'uzun',
    short: 'Uzun ünlü',
    glyph: 'ー',
    title: 'Uzun ünlü — iki hece boyu',
    rule: 'Arka arkaya gelen ünlü, sesi İKİ hece boyunca uzatır. Uzunluk anlam değiştirir.',
    body: [
      'Uzatma ayrı bir işaretle değil, ünlüyü tekrar yazarak gösterilir: あ+あ, い+い, う+う.',
      'İki tanesi düzensizdir ve ezberlenir: uzun "o" genelde お+う yazılır (こうこう), uzun "e" ise え+い (せんせい).',
      'Katakana’da bunun yerine düz bir çizgi kullanılır: コーヒー.',
    ],
    examples: [
      {
        kana: 'おばあさん',
        reading: 'obaasan',
        tr: 'nine, yaşlı kadın',
        vs: { kana: 'おばさん', reading: 'obasan', tr: 'teyze, hala' },
      },
      {
        kana: 'おじいさん',
        reading: 'ojiisan',
        tr: 'dede',
        vs: { kana: 'おじさん', reading: 'ojisan', tr: 'amca, dayı' },
      },
      {
        kana: 'ゆうき',
        reading: 'yuuki',
        tr: 'cesaret',
        vs: { kana: 'ゆき', reading: 'yuki', tr: 'kar' },
      },
      { kana: 'せんせい', reading: 'sensei', tr: 'öğretmen — "sensee" gibi duyulur' },
      { kana: 'とうきょう', reading: 'toukyou', tr: 'Tokyo — iki uzun o birden' },
    ],
    pitfall:
      'Uzunluğu yutmak. "obasan" ile "obaasan" arasındaki fark teyze ile nine farkıdır; kulağa küçük gelen bu uzunluk Japoncada anlamın kendisidir.',
  },
  {
    id: 'n',
    short: 'ん hecesi',
    glyph: 'ん',
    title: 'ん — tek başına bir hece',
    rule: 'ん önceki harfe yapışmaz; kendi başına bir hece uzunluğundadır.',
    body: [
      'Türkçede "n" sessizi hecenin kuyruğuna takılır. Japoncada ん bağımsız bir moradır: ほん iki hecedir (ho-n), üç değil, bir buçuk değil.',
      'Söylerken burnundan gelen sesi bir hece boyu tutarsın.',
      'Bir de kural: hiçbir Japonca kelime ん ile BAŞLAMAZ. Bu yüzden kelime içinde gördüğün ん hep önceki heceden sonra gelir.',
      'Sonraki sese göre kulağa "n", "m" ya da genizden "ng" gibi gelebilir — ama yazılışı hep ん’dir. Bu yüzden しんぶん hem "shinbun" hem "shimbun" yazılır.',
    ],
    examples: [
      { kana: 'ほん', reading: 'hon', tr: 'kitap — 2 hece: ho-n' },
      { kana: 'にほん', reading: 'nihon', tr: 'Japonya — 3 hece: ni-ho-n' },
      { kana: 'しんぶん', reading: 'shinbun', tr: 'gazete — 4 hece: shi-n-bu-n' },
      { kana: 'せんせい', reading: 'sensei', tr: 'öğretmen — 4 hece: se-n-se-i' },
      { kana: 'あんない', reading: 'annai', tr: 'rehberlik, yol gösterme' },
    ],
    pitfall:
      'ん’i önceki heceye yapıştırıp hece saymamak. Sınavda "kaç hece" sorusunda en çok buradan hata çıkar.',
  },
  {
    id: 'particle',
    short: 'は → wa',
    glyph: 'は',
    title: 'Ek olan は, へ, を farklı okunur',
    rule: 'Bu üç karakter dilbilgisi eki olarak kullanıldığında yazıldığı gibi okunmaz: は→wa, へ→e, を→o.',
    body: [
      'Bu bir istisna değil, tarihsel bir kalıntı: yazım eski hâlinde donmuş, okunuş değişmiş.',
      'Yalnızca EK olduklarında geçerli. Kelimenin içinde normal hece olarak geçerlerse normal okunurlar: はな "hana"dır, "wana" değil.',
      'を neredeyse yalnızca ek olarak kullanılır, bu yüzden pratikte her zaman "o" okunur.',
    ],
    examples: [
      {
        kana: 'こんにちは',
        reading: 'konnichiwa',
        tr: 'merhaba — sondaki は ektir',
        vs: { kana: 'はな', reading: 'hana', tr: 'çiçek — buradaki は normal hecedir' },
      },
      { kana: 'こんばんは', reading: 'konbanwa', tr: 'iyi akşamlar' },
      { kana: 'わたしは がくせいです', reading: 'watashi wa gakusei desu', tr: 'Ben öğrenciyim' },
      { kana: 'がっこうへ いきます', reading: 'gakkou e ikimasu', tr: 'Okula gidiyorum' },
      { kana: 'ほんを よみます', reading: 'hon o yomimasu', tr: 'Kitap okuyorum' },
    ],
    pitfall:
      'こんにちは’yı "konnichiha" okumak. Kelimenin sonundaki は aslında 今日は ("bugüne gelince…") cümlesinin konu ekidir ve "wa" okunur.',
  },
  {
    id: 'yoon',
    short: 'Yōon ゃゅょ',
    glyph: 'ゃ',
    title: 'Yōon (拗音) — küçük ゃ ゅ ょ',
    rule: 'Küçük yazılan ゃゅょ önceki karaktere yapışır ve onunla TEK hece olur. Bu birleşik seslerin adı yōon’dur.',
    body: [
      // Adlandırma bilerek en başta: kana tablosunda bu gruba "Yōon きゃ"
      // deniyor, burada ise "küçük ゃゅょ". İki ayrı konu sanılıyordu.
      'Bunun adı 拗音 (yōon). Kana tablosundaki "Yōon" sekmesiyle bu kural AYNI şeydir — biri sesin adı, diğeri yazılış kuralı.',
      'きゃ tek hecedir (kya). Ama きや iki hecedir (ki-ya). Aradaki tek fark ikinci karakterin boyudur.',
      'Yalnızca い ile biten karakterlerin arkasına gelir: き, し, ち, に, ひ, み, り ve bunların dakutenli hâlleri.',
      // Asıl karışan yer burası: きょう'daki う yōon'un parçası sanılıyor.
      'Yōon iki karakterde BİTER. Peşinden gelen う ayrı bir hecedir, birleşmeye dahil değildir: きょう = きょ + う = 2 hece. Oradaki う yōon değil, uzatma kuralıdır — iki ayrı kural üst üste binmiştir.',
      'Yazarken küçük olanı karenin alt köşesine sıkıştır ki büyükten ayrılsın.',
    ],
    examples: [
      {
        kana: 'びょういん',
        reading: 'byouin',
        tr: 'hastane — 4 hece: byo-u-i-n',
        vs: { kana: 'びよういん', reading: 'biyouin', tr: 'kuaför — 5 hece: bi-yo-u-i-n' },
      },
      { kana: 'きょう', reading: 'kyou', tr: 'bugün — 2 hece: kyo-u' },
      { kana: 'しゃしん', reading: 'shashin', tr: 'fotoğraf' },
      { kana: 'りょこう', reading: 'ryokou', tr: 'seyahat' },
      { kana: 'じゅぎょう', reading: 'jugyou', tr: 'ders' },
    ],
    pitfall:
      'Küçüğü büyük sanıp iki hece okumak. びょういん (hastane) ile びよういん (kuaför) yalnızca bu boyutla ayrılır — yanlış okursan yanlış yere gidersin.',
  },
  {
    id: 'devoicing',
    short: 'Yutulan sesler',
    glyph: 'す',
    title: 'Yutulan u ve i sesleri',
    rule: 'い ve う sesleri, iki tonsuz sessiz arasında ya da kelime sonunda neredeyse duyulmaz olur.',
    body: [
      'Yazım değişmez, yalnızca söyleyiş değişir. Bu yüzden okurken şaşırma: yazılan hece oradadır, sadece hafifçe söylenir.',
      'En sık karşılaşacağın yer nezaket kalıplarıdır: です "des" gibi, ます "mas" gibi duyulur.',
      'Hece hâlâ bir hece uzunluğundadır — yutulan sesin süresi kaybolmaz.',
    ],
    examples: [
      { kana: 'です', reading: 'desu', tr: '“des” gibi duyulur' },
      { kana: 'わかります', reading: 'wakarimasu', tr: '“wakarimas” gibi duyulur' },
      { kana: 'すき', reading: 'suki', tr: 'sevmek — “ski” gibi duyulur' },
      { kana: 'ひと', reading: 'hito', tr: 'insan — h neredeyse fısıltı' },
      { kana: 'したい', reading: 'shitai', tr: 'yapmak istemek' },
    ],
    pitfall:
      'Duyduğun gibi yazmaya çalışmak. "des" diye duyarsın ama yazımı hep です’dir — yazarken hecenin tamamını yazacaksın.',
  },
  {
    id: 'yazim',
    short: 'Yazım düzeni',
    glyph: '。',
    title: 'Boşluk yok, noktalama farklı',
    rule: 'Japoncada kelimeler arasına boşluk konmaz; nokta 。 virgül 、 biçimindedir.',
    body: [
      'Cümle boşluksuz yazılır. Nerede bitip nerede başladığını yazı türü söyler: kanji genelde kelimenin gövdesi, hiragana ekler ve bağlantılardır. Sen henüz kanji bilmediğin için tamamı hiragana metinler zor görünür — normal, kanji öğrendikçe okumak KOLAYLAŞIR.',
      'Nokta 。 (maru) ve virgül 、 (ten) Latin karşılıklarından farklı çizilir ve karenin sol altına oturur.',
      'Soru işareti genelde kullanılmaz: soruyu か eki belirtir. 「わかりますか。」 cümlesi soru cümlesidir ama sonunda nokta vardır.',
      'Tırnak yerine köşeli ayraç kullanılır: 「…」',
      'Uzatma çizgisi ー yalnızca katakanada kullanılır; hiraganada uzatma ünlüyü tekrar yazarak yapılır.',
    ],
    examples: [
      { kana: 'わたしはがくせいです。', reading: 'watashi wa gakusei desu', tr: 'Ben öğrenciyim — boşluk yok, sonda 。' },
      { kana: 'わかりますか。', reading: 'wakarimasu ka', tr: 'Anlıyor musun? — soru işareti yok, か var' },
      { kana: 'ねこ、いぬ、とり', reading: 'neko, inu, tori', tr: 'kedi, köpek, kuş — virgül 、' },
    ],
    pitfall:
      'Boşluksuz metni gözle bölememek. Çözüm ezber değil, alışkanlık: hece hece oku, tanıdık kelimeyi yakaladığında orada böl. Kanji öğrendikçe bu iş kendiliğinden kolaylaşır.',
  },
]

// ————————————————————————— Okuma testi havuzu —————————————————————————

/**
 * Kural okuma testinin soruları.
 *
 * Havuz doğrudan yukarıdaki ÖRNEKLERDEN üretiliyor — ayrı bir liste tutmak
 * ikisinin zamanla ayrışmasına yol açardı. Karşılaştırma çiftleri (vs) de
 * havuza giriyor: きって/きて ikilisinin ikisini de sormak, kuralı tek yönlü
 * ezberlemeyi engelliyor.
 *
 * Her sorunun hangi kurala ait olduğu saklanıyor; sonuçta "uzun ünlüde 2/5"
 * gibi kural bazlı döküm çıkarılabiliyor.
 */
export interface RuleTestItem {
  kana: string
  reading: string
  tr: string
  ruleId: string
  ruleShort: string
}

export const RULE_TEST_POOL: RuleTestItem[] = (() => {
  const out: RuleTestItem[] = []
  const gorulen = new Set<string>()
  const ekle = (kana: string, reading: string, tr: string, r: KanaRule) => {
    // Aynı kelime birden çok kuralda örnek olabiliyor (ざっし hem dakuten hem
    // sokuon). İlk geçtiği kurala bağlanıyor, iki kez sorulmuyor.
    if (gorulen.has(kana)) return
    gorulen.add(kana)
    out.push({ kana, reading, tr, ruleId: r.id, ruleShort: r.short })
  }
  for (const r of KANA_RULES) {
    // Yazım kuralı kartındaki örnekler cümle; okunuşu yazdırmak için uygun değil
    if (r.id === 'yazim') continue
    for (const ex of r.examples) {
      ekle(ex.kana, ex.reading, ex.tr, r)
      if (ex.vs) ekle(ex.vs.kana, ex.vs.reading, ex.vs.tr, r)
    }
  }
  return out
})()
