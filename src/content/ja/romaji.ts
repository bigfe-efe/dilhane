// Romaji — ne olduğu, nerede kullanılacağı, klavyede nasıl yazılacağı.
//
// NEDEN BÖYLE BİR BÖLÜM VAR:
// Romaji öğrenilecek dördüncü bir alfabe değil; zaten bilinen Latin
// alfabesinin Japonca seslere uygulanmış hâli. Ama iki yerde gerçekten
// bilgi gerekiyor:
//
//   1. NEREDE KULLANILMAYACAĞI. Romaji mora uzunluğunu siler: 東京 dört
//      moradır (と・う・きょ・う) ama "Tokyo" yazılır. Okuma dayanağı olarak
//      kullanmak, kana ile kazanılan hece duyusunu bozar.
//   2. KLAVYE. Bilgisayarda Japonca yazmanın tek yolu romajidir ve kendine
//      özgü kuralları vardır — ん'in iki n ile yazılması, ッチ'nin "cchi"
//      olması, uzatma çizgisinin tire tuşu olması gibi. Bunlar Hepburn
//      yazımıyla aynı DEĞİL; "tempura" yazan kişi てんぷら elde edemez.
//
// Aşağıdaki kuralların hepsi wanakana'nın toKana çevirici­siyle sınanarak
// yazıldı; yani uygulamadaki alıştırma da gerçek IME gibi davranıyor.

export interface SystemRow {
  kana: string
  hepburn: string
  kunrei: string
  note?: string
}

/**
 * Üç romaji sistemi arasındaki farklar.
 *
 * Yalnızca AYRIŞTIKLARI satırlar var; か = ka her sistemde aynı olduğu için
 * tabloya girmiyor. Japon çocukları okulda Kunrei öğrenir, tabelalarda ve
 * pasaportlarda Hepburn kullanılır. Klavye ikisini de kabul eder.
 */
export const SYSTEMS: SystemRow[] = [
  { kana: 'し', hepburn: 'shi', kunrei: 'si' },
  { kana: 'しゃ', hepburn: 'sha', kunrei: 'sya' },
  { kana: 'ち', hepburn: 'chi', kunrei: 'ti' },
  { kana: 'ちゃ', hepburn: 'cha', kunrei: 'tya' },
  { kana: 'つ', hepburn: 'tsu', kunrei: 'tu' },
  { kana: 'ふ', hepburn: 'fu', kunrei: 'hu' },
  { kana: 'じ', hepburn: 'ji', kunrei: 'zi' },
  { kana: 'じゃ', hepburn: 'ja', kunrei: 'zya' },
  { kana: 'ぢ', hepburn: 'ji', kunrei: 'zi', note: 'Nihon-shiki bunu "di" yazar; づ/ず ayrımını koruyan tek sistem odur.' },
  { kana: 'づ', hepburn: 'zu', kunrei: 'zu', note: 'Nihon-shiki: "du".' },
  { kana: 'を', hepburn: 'o', kunrei: 'wo', note: 'Ek olarak "o" okunur ama klavyede "wo" yazılır.' },
]

export interface TypeRule {
  id: string
  title: string
  /** Kural tek cümlede */
  rule: string
  /** Klavyede yazılan → çıkan kana */
  examples: { type: string; kana: string; tr?: string }[]
  /** En sık yapılan hata */
  pitfall?: string
}

/**
 * Klavye (IME) kuralları.
 *
 * Sıralama zorluk değil SIKLIK esaslı: ん ve küçük っ her gün karşına çıkar,
 * küçük kana tek başına neredeyse hiç gerekmez.
 */
export const TYPE_RULES: TypeRule[] = [
  {
    id: 'sokuon',
    title: 'Küçük っ — sessizi ikile',
    rule: 'Küçük っ için ayrı bir tuş yok; kendinden sonraki sessizi iki kez yazarsın.',
    examples: [
      { type: 'gakkou', kana: 'がっこう', tr: 'okul' },
      { type: 'kippu', kana: 'きっぷ', tr: 'bilet' },
      { type: 'beddo', kana: 'ベッド', tr: 'yatak' },
      { type: 'yappari', kana: 'やっぱり', tr: 'yine de' },
    ],
    pitfall:
      'ッチ birleşiminde "tchi" değil "cchi" yazılır: サンドイッチ = sandoicchi. Hepburn "sandoitchi" yazar ama klavye onu kabul etmez.',
  },
  {
    id: 'n',
    title: 'ん — bazen tek n yetmez',
    rule: 'ん’den sonra ünlü ya da y geliyorsa tek "n" yanlış heceye yapışır. İki n yaz ya da kesme işareti koy.',
    examples: [
      { type: "kan'i", kana: 'かんい', tr: 'basit' },
      { type: 'kani', kana: 'かに', tr: 'yengeç — dikkat, başka kelime!' },
      { type: 'nihongo', kana: 'にほんご', tr: 'Japonca' },
      { type: 'konnichiha', kana: 'こんにちは', tr: 'merhaba' },
    ],
    pitfall:
      'Sessizden önce tek "n" yeter: にほんご için "nihongo" doğru. Sorun yalnızca ünlü ve y’den önce çıkar.',
  },
  {
    id: 'uzatma',
    title: 'Uzatma ー — tire tuşu',
    rule: 'Katakanadaki uzatma çizgisi klavyede tire (-) tuşudur. Ünlüyü ikilemek başka kana üretir.',
    examples: [
      { type: 'ko-hi-', kana: 'コーヒー', tr: 'kahve' },
      { type: 'ra-men', kana: 'ラーメン', tr: 'ramen' },
      { type: 'famiri-', kana: 'ファミリー', tr: 'aile' },
      { type: 'te-buru', kana: 'テーブル', tr: 'masa' },
    ],
    pitfall:
      '"koohii" yazarsan コオヒイ çıkar — okunuşu aynı ama yazımı yanlış. Hiraganada ise tam tersi: uzun ünlü ünlüyle yazılır (きょう = kyou), tire kullanılmaz.',
  },
  {
    id: 'yoon',
    title: 'Yōon — küçük ゃゅょ kendiliğinden gelir',
    rule: 'きゃ için ayrı tuş yok; "kya" yazarsın, ikisi birden çıkar.',
    examples: [
      { type: 'kyou', kana: 'きょう', tr: 'bugün' },
      { type: 'ryokou', kana: 'りょこう', tr: 'seyahat' },
      { type: 'menyu-', kana: 'メニュー', tr: 'menü' },
      { type: 'ocha', kana: 'おちゃ', tr: 'çay' },
    ],
  },
  {
    id: 'kucuk',
    title: 'Küçük kanayı tek başına yazmak',
    rule: 'Nadiren gerekir. Baştaki x ya da l harfi kanayı küçültür.',
    examples: [
      { type: 'xtsu', kana: 'っ' },
      { type: 'ltu', kana: 'っ' },
      { type: 'xya', kana: 'ゃ' },
      { type: 'xa', kana: 'ぁ' },
    ],
  },
  {
    id: 'genis',
    title: 'Genişletilmiş kana (ファ ティ ヴ)',
    rule: 'Japoncada olmayan sesler doğrudan yazılır; klavye küçük ünlüyü kendi ekler.',
    examples: [
      { type: 'fo-ku', kana: 'フォーク', tr: 'çatal' },
      { type: 'texi-', kana: 'ティー', tr: 'çay (siyah)' },
      { type: 'dhizuni-', kana: 'ディズニー', tr: 'Disney' },
      { type: 'vaiorin', kana: 'ヴァイオリン', tr: 'keman' },
    ],
    pitfall: 'ティ için "ti" işe yaramaz — o ち verir. "texi" ya da "thi" yazman gerekir.',
  },
  {
    id: 'katakana',
    title: 'Katakanaya geçmek',
    rule: 'Hiragana yazıp boşluk/F7 ile katakanaya çevirirsin. Bu alıştırmada ise BÜYÜK harf yazmak yeter.',
    examples: [
      { type: 'KO-HI-', kana: 'コーヒー' },
      { type: 'ko-hi-', kana: 'こーひー', tr: 'küçük harf hiragana verir' },
    ],
  },
]

/** Türkçe konuşan biri romajiye İngilizce gözüyle bakınca düşülen tuzaklar. */
export const TR_TRAPS: { romaji: string; yanlis: string; dogru: string; kana: string }[] = [
  { romaji: 'ji / ja', yanlis: 'Türkçe "j" (jandarma)', dogru: 'c — "ca"', kana: 'じゃ' },
  { romaji: 'chi', yanlis: '"khi" ya da "şi"', dogru: 'çi', kana: 'ち' },
  { romaji: 'shi', yanlis: '"shi" harf harf', dogru: 'şi', kana: 'し' },
  { romaji: 'wa', yanlis: 'İngilizce "w"', dogru: 'va’ya yakın', kana: 'わ' },
  { romaji: 'e', yanlis: '"i" gibi ince', dogru: 'Türkçe e', kana: 'え' },
  { romaji: 'tsu', yanlis: '"tu"', dogru: 't+s birlikte', kana: 'つ' },
]

/** Windows'ta Japonca klavye ve ses kurulumu. */
export const IME_SETUP: { step: string; detail: string }[] = [
  {
    step: 'Ayarlar → Saat ve dil → Dil ve bölge',
    detail: 'Sağ üstteki “Dil ekle” düğmesine bas.',
  },
  {
    step: '日本語 (Japonca) seç',
    detail: 'Listeden Japonca’yı bul ve ekle. Görüntü dilini DEĞİŞTİRME — sadece dili eklemek yeterli.',
  },
  {
    step: 'Dil seçeneklerinde “Konuşma” bileşenini de kur',
    detail:
      'Japonca satırındaki üç noktadan Dil seçenekleri → isteğe bağlı özellikler. Buradaki konuşma (text-to-speech) bileşeni inerse Dilhane kendiliğinden gerçek Japonca telaffuza geçer; ayar yapmana gerek yok.',
  },
  {
    step: 'Windows tuşu + Boşluk ile klavyeyi değiştir',
    detail: 'Türkçe ↔ Japonca arasında geçiş yapar. Japoncadayken yazdığın romaji kanaya dönüşür.',
  },
  {
    step: 'Yazarken boşluk tuşu kanjiye çevirir',
    detail: 'にほんご yazıp boşluğa basınca 日本語 önerilir; Enter onaylar. F7 katakanaya çevirir.',
  },
]
