/**
 * Temel bilgiler — sayılar, tarih, saat, bu/şu/o, kendini tanıtma.
 *
 * NEDEN OKUNUŞLAR ÜRETİLİYOR, ELLE YAZILMIYOR:
 * Sayı ve saat okunuşu tamamen kurala bağlı; istisnalar da (300 さんびゃく,
 * 4時 よじ) kuralın parçası. 101 sayıyı, 24 saati ve 60 dakikayı elle yazmak
 * hem yazım hatası riski taşır hem de "sayı yaz, okunuşunu gör" aracının
 * tablodan FARKLI bir sonuç vermesine yol açabilirdi. Tek bir kural kümesi
 * var; tablo da araç da ondan besleniyor.
 *
 * Tarih okunuşları ise (ついたち, はつか) kurala uymadığı için elle yazıldı.
 */

// ————————————————————————————— Sayılar —————————————————————————————

/** Birler basamağı — sayarken ve bileşik sayılarda kullanılan okunuş */
const RAKAM = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう']
const RAKAM_KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 0–9999 arası bir öbeğin okunuşu. `buyuk`: ardından 万/億 geliyor */
/** 0–9999 arası bir öbeğin basamak basamak okunuşu: 3456 → さんぜん|よんひゃく|ごじゅう|ろく */
function obekBasamaklari(n: number, buyuk: boolean): string[] {
  const bin = Math.floor(n / 1000)
  const yuz = Math.floor(n / 100) % 10
  const on = Math.floor(n / 10) % 10
  const bir = n % 10
  const out: string[] = []
  // 1000 tek başına せん; ama 1000万 いっせんまん
  if (bin) out.push(bin === 1 ? (buyuk ? 'いっせん' : 'せん') : bin === 3 ? 'さんぜん' : bin === 8 ? 'はっせん' : RAKAM[bin] + 'せん')
  if (yuz) out.push(yuz === 1 ? 'ひゃく' : yuz === 3 ? 'さんびゃく' : yuz === 6 ? 'ろっぴゃく' : yuz === 8 ? 'はっぴゃく' : RAKAM[yuz] + 'ひゃく')
  if (on) out.push(on === 1 ? 'じゅう' : RAKAM[on] + 'じゅう')
  if (bir) out.push(RAKAM[bir])
  return out
}

function obekKana(n: number, buyuk: boolean): string {
  return obekBasamaklari(n, buyuk).join('')
}

function obekKanji(n: number): string {
  const bin = Math.floor(n / 1000)
  const yuz = Math.floor(n / 100) % 10
  const on = Math.floor(n / 10) % 10
  const bir = n % 10
  let s = ''
  if (bin) s += (bin === 1 ? '' : RAKAM_KANJI[bin]) + '千'
  if (yuz) s += (yuz === 1 ? '' : RAKAM_KANJI[yuz]) + '百'
  if (on) s += (on === 1 ? '' : RAKAM_KANJI[on]) + '十'
  if (bir) s += RAKAM_KANJI[bir]
  return s
}

export const SAYI_UST_SINIR = 999_999_999_999

/**
 * Sayının kana okunuşu (0 – 9999億).
 *
 * Japonca büyük sayıları DÖRTLÜ basamaklara ayırır: 万 = 10.000, 億 = 100 milyon.
 * 123456 önce 12|3456 diye bölünür: じゅうに・まん + さんぜんよんひゃくごじゅうろく.
 */
export function sayiKana(n: number): string {
  if (n === 0) return 'ゼロ'
  const oku = Math.floor(n / 1e8)
  const man = Math.floor(n / 1e4) % 1e4
  const bir = n % 1e4
  return (oku ? obekKana(oku, true) + 'おく' : '') + (man ? obekKana(man, true) + 'まん' : '') + obekKana(bir, false)
}

/** Sayının kanji rakamlarla yazılışı: 1234 → 千二百三十四 */
export function sayiKanji(n: number): string {
  if (n === 0) return '〇'
  const oku = Math.floor(n / 1e8)
  const man = Math.floor(n / 1e4) % 1e4
  const bir = n % 1e4
  // 1万 ve 1億'da 一 yazılır; 十・百・千'in önünde yazılmaz
  const grup = (g: number) => (g === 1 ? '一' : obekKanji(g))
  return (oku ? grup(oku) + '億' : '') + (man ? grup(man) + '万' : '') + obekKanji(bir)
}

/**
 * Sayının basamak basamak ayrılmış kana parçaları.
 *
 * Latin satırı için: 123456 bitişik yazılınca "juunimansanzen'yonhyaku…"
 * okunmuyordu. Basamak başına bir kelime: juuni man sanzen yonhyaku gojuu roku.
 */
export function sayiBasamaklari(n: number): string[] {
  if (n === 0) return ['ゼロ']
  const oku = Math.floor(n / 1e8)
  const man = Math.floor(n / 1e4) % 1e4
  const bir = n % 1e4
  return [
    ...(oku ? [...obekBasamaklari(oku, true), 'おく'] : []),
    ...(man ? [...obekBasamaklari(man, true), 'まん'] : []),
    ...obekBasamaklari(bir, false),
  ]
}

/** Sayıyı okunuş öbeklerine ayırır — aracın "nasıl okundu" satırı için */
export function sayiParcalari(n: number): { rakam: string; kana: string; birim: string }[] {
  if (n === 0) return [{ rakam: '0', kana: 'ゼロ', birim: '' }]
  const oku = Math.floor(n / 1e8)
  const man = Math.floor(n / 1e4) % 1e4
  const bir = n % 1e4
  const out: { rakam: string; kana: string; birim: string }[] = []
  if (oku) out.push({ rakam: String(oku), kana: obekKana(oku, true) + 'おく', birim: '億' })
  if (man) out.push({ rakam: String(man), kana: obekKana(man, true) + 'まん', birim: '万' })
  if (bir) out.push({ rakam: String(bir), kana: obekKana(bir, false), birim: '' })
  return out
}

export interface SayiSatiri {
  n: number
  kanji: string
  kana: string
  /** İkinci okunuş — hangisinin nerede kullanıldığı `not`ta */
  alt?: string
  star?: boolean
  not?: string
}

/** 0–10: temel taşlar. Dört tanesinin iki okunuşu var. */
export const TEMEL_SAYILAR: SayiSatiri[] = [
  { n: 0, kanji: '零', kana: 'ゼロ', alt: 'れい', star: true, not: 'Günlük dilde ゼロ; saat ve hava durumunda れい (0時 れいじ).' },
  { n: 1, kanji: '一', kana: 'いち' },
  { n: 2, kanji: '二', kana: 'に' },
  { n: 3, kanji: '三', kana: 'さん' },
  { n: 4, kanji: '四', kana: 'よん', alt: 'し', star: true, not: 'Sayarken よん. し “ölüm” (死) ile aynı sesli; sadece 4月 しがつ gibi kalıplarda kalır.' },
  { n: 5, kanji: '五', kana: 'ご' },
  { n: 6, kanji: '六', kana: 'ろく' },
  { n: 7, kanji: '七', kana: 'なな', alt: 'しち', star: true, not: 'Sayarken なな. しち 7時 しちじ ve 7月 しちがつ’ta.' },
  { n: 8, kanji: '八', kana: 'はち' },
  { n: 9, kanji: '九', kana: 'きゅう', alt: 'く', star: true, not: 'Sayarken きゅう. く 9時 くじ ve 9月 くがつ’ta (く “acı” 苦 ile aynı sesli).' },
  { n: 10, kanji: '十', kana: 'じゅう' },
]

/** 0–100 ızgarası */
export const SIFIR_YUZ: SayiSatiri[] = Array.from({ length: 101 }, (_, n) => {
  const temel = TEMEL_SAYILAR.find((t) => t.n === n)
  if (temel) return temel
  const s: SayiSatiri = { n, kanji: sayiKanji(n), kana: sayiKana(n) }
  if (n === 100) {
    s.star = true
    s.not = 'いちひゃく DEĞİL, sadece ひゃく.'
  }
  return s
})

/** Yüzler ve binler — ses değişimi olanlar yıldızlı */
export const YUZLER: SayiSatiri[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
  const n = d * 100
  const s: SayiSatiri = { n, kanji: sayiKanji(n), kana: sayiKana(n) }
  if (d === 1) Object.assign(s, { star: true, not: 'いち eklenmez' })
  if (d === 3) Object.assign(s, { star: true, not: 'ひゃく → びゃく' })
  if (d === 6) Object.assign(s, { star: true, not: 'ろく → ろっ, ひゃく → ぴゃく' })
  if (d === 8) Object.assign(s, { star: true, not: 'はち → はっ, ひゃく → ぴゃく' })
  return s
})

export const BINLER: SayiSatiri[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
  const n = d * 1000
  const s: SayiSatiri = { n, kanji: sayiKanji(n), kana: sayiKana(n) }
  if (d === 1) Object.assign(s, { star: true, not: 'いち eklenmez' })
  if (d === 3) Object.assign(s, { star: true, not: 'せん → ぜん' })
  if (d === 8) Object.assign(s, { star: true, not: 'はち → はっ' })
  return s
})

/** 万 ve 億 — Türkçenin binli basamaklarına uymayan kısım */
export const BUYUK_BIRIMLER: (SayiSatiri & { tr: string })[] = [
  { n: 10_000, kanji: '一万', kana: 'いちまん', tr: 'on bin', star: true, not: 'いち ŞART: まん tek başına söylenmez.' },
  { n: 100_000, kanji: '十万', kana: 'じゅうまん', tr: 'yüz bin', not: '10 × 万' },
  { n: 1_000_000, kanji: '百万', kana: 'ひゃくまん', tr: 'bir milyon', not: '100 × 万' },
  { n: 10_000_000, kanji: '千万', kana: 'いっせんまん', tr: 'on milyon', star: true, not: 'まん’dan önce せん → いっせん' },
  { n: 100_000_000, kanji: '一億', kana: 'いちおく', tr: 'yüz milyon', star: true, not: 'Yeni birim: 億 = 10.000 × 10.000' },
]

export const SAYI_KURALLARI: { baslik: string; govde: string; star?: boolean }[] = [
  {
    baslik: '11–99: onluk + birlik',
    govde: '11 = 10 + 1 = じゅういち. 20 = 2 × 10 = にじゅう. 35 = さんじゅう + ご. Türkçedeki gibi soldan sağa okunur; ek kural yok.',
  },
  {
    baslik: 'Bileşik sayılarda hep よん・なな・きゅう',
    govde: '14 じゅうよん, 40 よんじゅう, 47 よんじゅうなな, 90 きゅうじゅう. し, しち, く yalnızca saat, ay ve gün gibi kalıplaşmış yerlerde çıkar.',
    star: true,
  },
  {
    baslik: '100 ve 1000’in önüne いち gelmez',
    govde: '100 = ひゃく, 1000 = せん. Ama 10.000 = いちまん — まん tek başına söylenmez.',
    star: true,
  },
  {
    baslik: 'Ses değişen beş sayı',
    govde: '300 さんびゃく, 600 ろっぴゃく, 800 はっぴゃく, 3000 さんぜん, 8000 はっせん. Fiyatlarda sürekli geçer; duyunca tanıyabilmelisin.',
    star: true,
  },
  {
    baslik: 'Dörder basamak ayır',
    govde: 'Türkçe sayıyı üçer basamakla okur (123.456), Japonca dörder (12|3456). Sağdan dört basamak say, oraya 万 koy: 12万3456 → じゅうにまん さんぜんよんひゃくごじゅうろく.',
    star: true,
  },
]

/** Kural kümesinin uygulandığı örnekler */
export const SAYI_ORNEKLERI = [1234, 12345, 123456, 1234567, 2026, 10000, 3800, 16000]

// ————————————————————————————— Tarih —————————————————————————————

export interface TarihSatiri {
  ja: string
  kana: string
  tr: string
  star?: boolean
  not?: string
}

/** Aylar: sayı + 月(がつ). Kural doğru — üç istisnası var. */
export const AYLAR: TarihSatiri[] = [
  { ja: '一月', kana: 'いちがつ', tr: 'Ocak' },
  { ja: '二月', kana: 'にがつ', tr: 'Şubat' },
  { ja: '三月', kana: 'さんがつ', tr: 'Mart' },
  { ja: '四月', kana: 'しがつ', tr: 'Nisan', star: true, not: 'よんがつ DEĞİL' },
  { ja: '五月', kana: 'ごがつ', tr: 'Mayıs' },
  { ja: '六月', kana: 'ろくがつ', tr: 'Haziran' },
  { ja: '七月', kana: 'しちがつ', tr: 'Temmuz', star: true, not: 'なながつ DEĞİL' },
  { ja: '八月', kana: 'はちがつ', tr: 'Ağustos' },
  { ja: '九月', kana: 'くがつ', tr: 'Eylül', star: true, not: 'きゅうがつ DEĞİL' },
  { ja: '十月', kana: 'じゅうがつ', tr: 'Ekim' },
  { ja: '十一月', kana: 'じゅういちがつ', tr: 'Kasım' },
  { ja: '十二月', kana: 'じゅうにがつ', tr: 'Aralık' },
]

/** Haftanın günleri — her birinin başındaki kanji bir doğa unsuru */
export const HAFTA: (TarihSatiri & { anlam: string })[] = [
  { ja: '月曜日', kana: 'げつようび', tr: 'Pazartesi', anlam: '月 ay' },
  { ja: '火曜日', kana: 'かようび', tr: 'Salı', anlam: '火 ateş' },
  { ja: '水曜日', kana: 'すいようび', tr: 'Çarşamba', anlam: '水 su' },
  { ja: '木曜日', kana: 'もくようび', tr: 'Perşembe', anlam: '木 ağaç' },
  { ja: '金曜日', kana: 'きんようび', tr: 'Cuma', anlam: '金 altın' },
  { ja: '土曜日', kana: 'どようび', tr: 'Cumartesi', anlam: '土 toprak' },
  { ja: '日曜日', kana: 'にちようび', tr: 'Pazar', anlam: '日 güneş' },
]

/**
 * Ayın günleri. 1–10 tamamen düzensiz (eski Japonca sayılardan geliyor);
 * 11'den sonra sayı + にち, ama 14, 20, 24 yine düzensiz.
 */
export const AYIN_GUNLERI: (TarihSatiri & { n: number })[] = [
  { n: 1, ja: '一日', kana: 'ついたち', tr: '1’i', star: true, not: 'Tamamen farklı bir kelime' },
  { n: 2, ja: '二日', kana: 'ふつか', tr: '2’si', star: true },
  { n: 3, ja: '三日', kana: 'みっか', tr: '3’ü', star: true },
  { n: 4, ja: '四日', kana: 'よっか', tr: '4’ü', star: true },
  { n: 5, ja: '五日', kana: 'いつか', tr: '5’i', star: true },
  { n: 6, ja: '六日', kana: 'むいか', tr: '6’sı', star: true },
  { n: 7, ja: '七日', kana: 'なのか', tr: '7’si', star: true },
  { n: 8, ja: '八日', kana: 'ようか', tr: '8’i', star: true },
  { n: 9, ja: '九日', kana: 'ここのか', tr: '9’u', star: true },
  { n: 10, ja: '十日', kana: 'とおか', tr: '10’u', star: true },
  { n: 11, ja: '十一日', kana: 'じゅういちにち', tr: '11’i' },
  { n: 12, ja: '十二日', kana: 'じゅうににち', tr: '12’si' },
  { n: 13, ja: '十三日', kana: 'じゅうさんにち', tr: '13’ü' },
  { n: 14, ja: '十四日', kana: 'じゅうよっか', tr: '14’ü', star: true, not: '4 gibi: よっか' },
  { n: 15, ja: '十五日', kana: 'じゅうごにち', tr: '15’i' },
  { n: 16, ja: '十六日', kana: 'じゅうろくにち', tr: '16’sı' },
  { n: 17, ja: '十七日', kana: 'じゅうしちにち', tr: '17’si', star: true, not: 'なな değil しち' },
  { n: 18, ja: '十八日', kana: 'じゅうはちにち', tr: '18’i' },
  { n: 19, ja: '十九日', kana: 'じゅうくにち', tr: '19’u', star: true, not: 'きゅう değil く' },
  { n: 20, ja: '二十日', kana: 'はつか', tr: '20’si', star: true, not: 'Tamamen farklı bir kelime' },
  { n: 21, ja: '二十一日', kana: 'にじゅういちにち', tr: '21’i' },
  { n: 22, ja: '二十二日', kana: 'にじゅうににち', tr: '22’si' },
  { n: 23, ja: '二十三日', kana: 'にじゅうさんにち', tr: '23’ü' },
  { n: 24, ja: '二十四日', kana: 'にじゅうよっか', tr: '24’ü', star: true, not: '4 gibi: よっか' },
  { n: 25, ja: '二十五日', kana: 'にじゅうごにち', tr: '25’i' },
  { n: 26, ja: '二十六日', kana: 'にじゅうろくにち', tr: '26’sı' },
  { n: 27, ja: '二十七日', kana: 'にじゅうしちにち', tr: '27’si', star: true, not: 'なな değil しち' },
  { n: 28, ja: '二十八日', kana: 'にじゅうはちにち', tr: '28’i' },
  { n: 29, ja: '二十九日', kana: 'にじゅうくにち', tr: '29’u', star: true, not: 'きゅう değil く' },
  { n: 30, ja: '三十日', kana: 'さんじゅうにち', tr: '30’u' },
  { n: 31, ja: '三十一日', kana: 'さんじゅういちにち', tr: '31’i' },
]

/** Bugünden bakınca — günlük konuşmada tarihten çok bunlar geçer */
export const GORELI_ZAMAN: { grup: string; satirlar: TarihSatiri[] }[] = [
  {
    grup: 'Gün',
    satirlar: [
      { ja: 'おととい', kana: 'おととい', tr: 'evvelsi gün' },
      { ja: '昨日', kana: 'きのう', tr: 'dün', star: true },
      { ja: '今日', kana: 'きょう', tr: 'bugün', star: true },
      { ja: '明日', kana: 'あした', tr: 'yarın', star: true },
      { ja: 'あさって', kana: 'あさって', tr: 'öbür gün' },
      { ja: '毎日', kana: 'まいにち', tr: 'her gün' },
    ],
  },
  {
    grup: 'Hafta',
    satirlar: [
      { ja: '先週', kana: 'せんしゅう', tr: 'geçen hafta' },
      { ja: '今週', kana: 'こんしゅう', tr: 'bu hafta' },
      { ja: '来週', kana: 'らいしゅう', tr: 'gelecek hafta' },
      { ja: '毎週', kana: 'まいしゅう', tr: 'her hafta' },
    ],
  },
  {
    grup: 'Ay',
    satirlar: [
      { ja: '先月', kana: 'せんげつ', tr: 'geçen ay' },
      { ja: '今月', kana: 'こんげつ', tr: 'bu ay' },
      { ja: '来月', kana: 'らいげつ', tr: 'gelecek ay' },
      { ja: '毎月', kana: 'まいつき', tr: 'her ay', star: true, not: 'まいげつ değil' },
    ],
  },
  {
    grup: 'Yıl',
    satirlar: [
      { ja: '去年', kana: 'きょねん', tr: 'geçen yıl' },
      { ja: '今年', kana: 'ことし', tr: 'bu yıl', star: true, not: 'こんねん değil' },
      { ja: '来年', kana: 'らいねん', tr: 'gelecek yıl' },
      { ja: '毎年', kana: 'まいとし', tr: 'her yıl' },
    ],
  },
]

export interface Ornek {
  ja: string
  kana: string
  tr: string
  not?: string
  /**
   * Elle yazılmış Latin okunuş. Yalnızca kelime sınırı yazıdan çıkarılamayan
   * cümlelerde: baştan sona kana (よろしくおねがいします) ya da rakamlı tarih.
   */
  latin?: string
}

export const TARIH_ORNEKLERI: Ornek[] = [
  {
    ja: '2026年12月6日（日曜日）',
    kana: 'にせんにじゅうろくねんじゅうにがつむいか（にちようび）',
    latin: 'nisen nijuuroku nen juuni gatsu muika (nichiyoubi)',
    tr: '6 Aralık 2026, Pazar — N5 sınavın',
    not: 'Sıra Türkçenin tersi: YIL → AY → GÜN → haftanın günü. Günlük yazıda rakam kullanılır; okunuş aynı.',
  },
  { ja: '今日は何日ですか。', kana: 'きょうはなんにちですか。', tr: 'Bugün ayın kaçı?' },
  { ja: '今日は何曜日ですか。', kana: 'きょうはなんようびですか。', tr: 'Bugün günlerden ne?' },
  { ja: '誕生日は何月何日ですか。', kana: 'たんじょうびはなんがつなんにちですか。', tr: 'Doğum günün ne zaman?' },
  { ja: '四月十日です。', kana: 'しがつとおかです。', tr: '10 Nisan.' },
  { ja: '来週の金曜日に行きます。', kana: 'らいしゅうのきんようびにいきます。', tr: 'Gelecek hafta cuma gideceğim.' },
]

// ————————————————————————————— Saat —————————————————————————————

/** Saat (0–24) — 4, 7, 9 birler basamağında her zaman よ, しち, く */
export function saatKana(h: number): string {
  if (h === 0) return 'れいじ'
  const on = Math.floor(h / 10)
  const bir = h % 10
  const birler: Record<number, string> = { 4: 'よ', 7: 'しち', 9: 'く' }
  return (on ? (on === 1 ? 'じゅう' : RAKAM[on] + 'じゅう') : '') + (bir ? birler[bir] ?? RAKAM[bir] : '') + 'じ'
}

/** Dakika (1–59) — ふん mu ぷん mı birler basamağına bağlı */
export function dakikaKana(m: number): string {
  const on = Math.floor(m / 10)
  const bir = m % 10
  const onlar = on ? (on === 1 ? 'じゅう' : RAKAM[on] + 'じゅう') : ''
  if (bir === 0) return (on === 1 ? '' : RAKAM[on]) + 'じゅっぷん'
  const birler: Record<number, string> = {
    1: 'いっぷん',
    2: 'にふん',
    3: 'さんぷん',
    4: 'よんぷん',
    5: 'ごふん',
    6: 'ろっぷん',
    7: 'ななふん',
    8: 'はっぷん',
    9: 'きゅうふん',
  }
  return onlar + birler[bir]
}

const KANJI_SAYI = (n: number) => sayiKanji(n)

export interface SaatOkunusu {
  ja: string
  kana: string
}

/** 24 saatlik okunuş: 15:30 → 十五時三十分 */
export function saat24(h: number, m: number, yarim = false): SaatOkunusu {
  const saatJa = (h === 0 ? '零' : KANJI_SAYI(h)) + '時'
  if (m === 0) return { ja: saatJa, kana: saatKana(h) }
  if (m === 30 && yarim) return { ja: saatJa + '半', kana: saatKana(h) + 'はん' }
  return { ja: saatJa + KANJI_SAYI(m) + '分', kana: saatKana(h) + dakikaKana(m) }
}

/** 12 saatlik okunuş: 15:30 → 午後三時半 */
export function saat12(h: number, m: number, yarim = true): SaatOkunusu {
  const ogleden = h < 12
  const h12 = h % 12
  const on = ogleden ? { ja: '午前', kana: 'ごぜん' } : { ja: '午後', kana: 'ごご' }
  const s = saat24(h12, m, yarim)
  return { ja: on.ja + s.ja, kana: on.kana + s.kana }
}

export interface SaatSatiri {
  n: number
  ja: string
  kana: string
  star?: boolean
  not?: string
}

export const SAATLER: SaatSatiri[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const s: SaatSatiri = { n, ja: KANJI_SAYI(n) + '時', kana: saatKana(n) }
  if (n === 4) Object.assign(s, { star: true, not: 'よんじ DEĞİL' })
  if (n === 7) Object.assign(s, { star: true, not: 'ななじ DEĞİL' })
  if (n === 9) Object.assign(s, { star: true, not: 'きゅうじ DEĞİL' })
  return s
})

/** 24 saatlik sistemin öğleden sonrası: 13–24 */
export const SAATLER_24: SaatSatiri[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 13
  const s: SaatSatiri = { n, ja: KANJI_SAYI(n) + '時', kana: saatKana(n) }
  if (n === 14 || n === 17 || n === 19) Object.assign(s, { star: true, not: '4・7・9 kuralı burada da geçerli' })
  return s
})

export const DAKIKALAR: SaatSatiri[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 45, 50].map((n) => {
  const s: SaatSatiri = { n, ja: KANJI_SAYI(n) + '分', kana: dakikaKana(n) }
  if ([1, 3, 4, 6, 8, 10, 20, 30, 40, 50].includes(n)) s.star = true
  if (n === 1) s.not = 'いち → いっ, ふん → ぷん'
  if (n === 3 || n === 4) s.not = 'ふん → ぷん'
  if (n === 6) s.not = 'ろく → ろっ, ふん → ぷん'
  if (n === 8) s.not = 'はっぷん (はちふん da duyulur)'
  if (n === 10) s.not = 'じゅっぷん (じっぷん da doğru)'
  if (n === 30) s.not = 'ya da 半 はん'
  if (n === 15) s.not = '“çeyrek” — Japoncada ayrı bir kelimesi yok'
  return s
})

export const SAAT_KURALLARI: { baslik: string; govde: string; star?: boolean }[] = [
  {
    baslik: 'Saat: sayı + 時(じ)',
    govde: 'いちじ, にじ, さんじ… Üç istisna: 4時 よじ, 7時 しちじ, 9時 くじ. 14, 17, 19 de aynı: じゅうよじ, じゅうしちじ, じゅうくじ.',
    star: true,
  },
  {
    baslik: 'Dakika: ふん mu ぷん mı',
    govde: '1, 3, 4, 6, 8, 10 ile biten dakikalar ぷん alır (いっぷん, さんぷん, よんぷん, ろっぷん, はっぷん, じゅっぷん). 2, 5, 7, 9 ふん alır.',
    star: true,
  },
  {
    baslik: 'Buçuk: 半(はん)',
    govde: '3時半 = さんじはん = üç buçuk. 3時30分 (さんじさんじゅっぷん) da doğru ama konuşmada 半 daha yaygın.',
  },
  {
    baslik: 'Çeyrek: ayrı kelime yok',
    govde: 'Japonca “çeyrek” demez, dakikayı söyler: 3:15 = 3時15分 (さんじじゅうごふん). “Çeyrek var” için 3時45分 ya da 4時15分前 (よじじゅうごふんまえ).',
  },
  {
    baslik: 'Kala: 前(まえ) · geçe: 過ぎ(すぎ)',
    govde: '5時10分前 = beşe on var. 5時10分過ぎ = beşi on geçiyor (過ぎ çoğu zaman söylenmez, 5時10分 yeter).',
  },
  {
    baslik: 'Öğleden önce / sonra: 午前・午後 saatin ÖNÜNE',
    govde: '午前9時 = sabah 9, 午後3時 = öğleden sonra 3. Türkçedeki “sabah”, “akşam” gibi önde durur. Konuşmada 朝(あさ) 7時, 夜(よる) 10時 da çok kullanılır.',
    star: true,
  },
  {
    baslik: '24 saatlik sistem',
    govde: 'Tren, otobüs ve dükkân saatleri 24’lü yazılır: 17時 = じゅうしちじ = 17:00. O zaman 午後 eklenmez. Konuşurken çoğunlukla 12’li sistem + 午前/午後 kullanılır.',
  },
  {
    baslik: 'Tam · civarı',
    govde: 'ちょうど = tam: 3時ちょうど (tam üç). ごろ = civarı: 3時ごろ (üç gibi).',
  },
]

/** Örnek saatler — [saat, dakika, not] */
export const SAAT_ORNEKLERI: [number, number, string][] = [
  [7, 0, 'sabah yedi'],
  [7, 30, 'yedi buçuk'],
  [8, 15, 'sekizi çeyrek geçiyor'],
  [9, 45, 'ona çeyrek var'],
  [12, 0, 'öğlen on iki'],
  [14, 10, 'ikiyi on geçiyor'],
  [16, 50, 'beşe on var'],
  [19, 5, 'akşam yediyi beş geçiyor'],
  [21, 30, 'akşam dokuz buçuk'],
  [0, 0, 'gece yarısı'],
]

export const SAAT_CUMLELERI: Ornek[] = [
  { ja: '今、何時ですか。', kana: 'いま、なんじですか。', tr: 'Şu an saat kaç?' },
  { ja: '三時半です。', kana: 'さんじはんです。', tr: 'Üç buçuk.' },
  { ja: '五時十分前です。', kana: 'ごじじゅっぷんまえです。', tr: 'Beşe on var.' },
  { ja: '午前九時から午後五時まで働きます。', kana: 'ごぜんくじからごごごじまではたらきます。', tr: 'Sabah dokuzdan akşam beşe kadar çalışırım.' },
  { ja: '七時ごろ起きます。', kana: 'しちじごろおきます。', tr: 'Yedi gibi kalkarım.' },
  { ja: '電車は十七時二十分です。', kana: 'でんしゃはじゅうしちじにじゅっぷんです。', tr: 'Tren 17:20’de.' },
]

// ————————————————————————————— Bu · şu · o —————————————————————————————

export interface KosoadoSatiri {
  ne: string
  ko: string
  so: string
  a: string
  do: string
  not: string
}

/** こ = bana yakın · そ = sana yakın · あ = ikimize de uzak · ど = soru */
export const KOSOADO: KosoadoSatiri[] = [
  { ne: 'Şey (tek başına)', ko: 'これ', so: 'それ', a: 'あれ', do: 'どれ', not: 'bu / şu / o / hangisi — yalnızca EŞYA için' },
  { ne: 'Şey + isim', ko: 'この', so: 'その', a: 'あの', do: 'どの', not: 'bu … / şu … / o … — arkasına isim gelir: この本' },
  { ne: 'Yer', ko: 'ここ', so: 'そこ', a: 'あそこ', do: 'どこ', not: 'burası / şurası / orası / nere' },
  { ne: 'Yön · kibar', ko: 'こちら', so: 'そちら', a: 'あちら', do: 'どちら', not: 'bu taraf; insanı kibarca tanıtırken de: こちらは田中さんです' },
]

export const KOSOADO_KURALLARI: { baslik: string; govde: string; star?: boolean }[] = [
  {
    baslik: 'Uzaklık neye göre',
    govde: 'こ konuşana (sana) yakın, そ dinleyene yakın, あ ikinizden de uzak, ど soru. Türkçedeki bu/şu/o ile neredeyse aynı; tek fark そ’nun “karşımdakinin yanındaki” anlamı.',
  },
  {
    baslik: 'İnsanı これ ile gösterme',
    govde: 'これ, それ, あれ eşya içindir. İnsan için この人 (bu kişi), あの人 (o kişi) ya da kibar hâli こちら / この方 kullanılır. Birini “これは田中さんです” diye tanıtmak kaba durur.',
    star: true,
  },
  {
    baslik: 'Soru kelimesi: 何 mi だれ mi',
    govde: 'Eşya için 何(なん / なに) “ne”, insan için だれ “kim” (kibar: どなた). これは何ですか / あの人はだれですか.',
    star: true,
  },
  {
    baslik: 'Var: あります mı います mı',
    govde: 'Cansız şeyler (eşya, bina, bitki) あります; canlılar (insan, hayvan) います. あそこに車があります / あそこにねこがいます.',
    star: true,
  },
  {
    baslik: 'この tek başına duramaz',
    govde: 'これは本です (bu bir kitap) ama この本は新しいです (bu kitap yeni). この, その, あの, どの’nun arkasına mutlaka isim gelir.',
  },
]

export const KOSOADO_ORNEKLERI: (Ornek & { tur?: 'canli' | 'cansiz' })[] = [
  { ja: 'これは何ですか。', kana: 'これはなんですか。', tr: 'Bu ne?', tur: 'cansiz' },
  { ja: 'それはペンです。', kana: 'それはペンです。', tr: 'O (senin yanındaki) bir kalem.', tur: 'cansiz' },
  { ja: 'あれは私の車です。', kana: 'あれはわたしのくるまです。', tr: 'Şu (uzaktaki) benim arabam.', tur: 'cansiz' },
  { ja: 'この本は新しいです。', kana: 'このほんはあたらしいです。', tr: 'Bu kitap yeni.', tur: 'cansiz' },
  { ja: 'この人はだれですか。', kana: 'このひとはだれですか。', tr: 'Bu kişi kim?', tur: 'canli', not: 'これ değil この人' },
  { ja: 'こちらは田中さんです。', kana: 'こちらはたなかさんです。', tr: 'Bu, Tanaka bey. (tanıştırırken)', tur: 'canli' },
  { ja: 'あそこにねこがいます。', kana: 'あそこにねこがいます。', latin: 'asoko ni neko ga imasu.', tr: 'Orada bir kedi var.', tur: 'canli', not: 'canlı → います' },
  { ja: 'あそこにコンビニがあります。', kana: 'あそこにコンビニがあります。', tr: 'Orada bir market var.', tur: 'cansiz', not: 'cansız → あります' },
  { ja: 'トイレはどこですか。', kana: 'トイレはどこですか。', tr: 'Tuvalet nerede?' },
  { ja: 'どれがいいですか。', kana: 'どれがいいですか。', latin: 'dore ga ii desuka.', tr: 'Hangisi iyi?' },
]

// ————————————————————————————— Kendini tanıt —————————————————————————————

export const TANITIM_KISA: Ornek[] = [
  { ja: 'はじめまして。', kana: 'はじめまして。', tr: 'Merhaba, tanıştığımıza memnun oldum.' },
  { ja: 'エフェです。', kana: 'エフェです。', tr: 'Ben Efe.' },
  { ja: 'よろしくおねがいします。', kana: 'よろしくおねがいします。', latin: 'yoroshiku onegaishimasu.', tr: 'Tanıştığımıza memnun oldum / iyi anlaşalım.' },
]

export const TANITIM_UZUN: Ornek[] = [
  { ja: 'はじめまして。', kana: 'はじめまして。', tr: 'Merhaba, tanıştığımıza memnun oldum.' },
  { ja: '私はエフェです。', kana: 'わたしはエフェです。', tr: 'Ben Efe’yim.', not: '私は burada BİR KEZ söylenir, sonra düşer' },
  { ja: 'トルコ人です。', kana: 'トルコじんです。', tr: 'Türküm.' },
  { ja: '二十二歳です。', kana: 'にじゅうにさいです。', tr: '22 yaşındayım.' },
  { ja: '大学生です。', kana: 'だいがくせいです。', tr: 'Üniversite öğrencisiyim.' },
  { ja: '日本語を勉強しています。', kana: 'にほんごをべんきょうしています。', tr: 'Japonca çalışıyorum.' },
  { ja: 'しゅみは音楽です。', kana: 'しゅみはおんがくです。', tr: 'Hobim müzik.' },
  { ja: 'よろしくおねがいします。', kana: 'よろしくおねがいします。', latin: 'yoroshiku onegaishimasu.', tr: 'Tanıştığımıza memnun oldum.' },
]

/** Yaş: sayı + 歳(さい). 1, 8, 10 ile bitenlerde ses değişir, 20 bambaşka. */
export const YASLAR: SaatSatiri[] = [
  { n: 1, ja: '一歳', kana: 'いっさい', star: true, not: 'いち → いっ' },
  { n: 3, ja: '三歳', kana: 'さんさい' },
  { n: 8, ja: '八歳', kana: 'はっさい', star: true, not: 'はち → はっ' },
  { n: 10, ja: '十歳', kana: 'じゅっさい', star: true, not: 'じゅう → じゅっ' },
  { n: 18, ja: '十八歳', kana: 'じゅうはっさい', star: true },
  { n: 19, ja: '十九歳', kana: 'じゅうきゅうさい' },
  { n: 20, ja: '二十歳', kana: 'はたち', star: true, not: 'Tamamen farklı kelime. Resmî yazıda にじゅっさい da olur.' },
  { n: 21, ja: '二十一歳', kana: 'にじゅういっさい', star: true },
  { n: 22, ja: '二十二歳', kana: 'にじゅうにさい', not: 'Senin yaşın' },
  { n: 23, ja: '二十三歳', kana: 'にじゅうさんさい' },
  { n: 25, ja: '二十五歳', kana: 'にじゅうごさい' },
  { n: 30, ja: '三十歳', kana: 'さんじゅっさい', star: true },
]

export interface Kalip {
  kalip: string
  kana: string
  tr: string
  secenekler: { ja: string; kana: string; tr: string }[]
}

/** Boşluğu kendi bilginle doldurduğun kalıplar */
export const TANITIM_KALIPLARI: Kalip[] = [
  {
    kalip: '〇〇です。',
    kana: '〇〇です。',
    tr: 'Adım / ben …',
    secenekler: [{ ja: 'エフェです。', kana: 'エフェです。', tr: 'Ben Efe.' }],
  },
  {
    kalip: '〇〇歳です。',
    kana: '〇〇さいです。',
    tr: '… yaşındayım',
    secenekler: [{ ja: '二十二歳です。', kana: 'にじゅうにさいです。', tr: '22 yaşındayım.' }],
  },
  {
    kalip: '〇〇人です。 / 〇〇から来ました。',
    kana: '〇〇じんです。 / 〇〇からきました。',
    tr: '…’lıyım / …’dan geldim',
    secenekler: [
      { ja: 'トルコ人です。', kana: 'トルコじんです。', tr: 'Türküm.' },
      { ja: 'トルコから来ました。', kana: 'トルコからきました。', tr: 'Türkiye’den geldim.' },
    ],
  },
  {
    kalip: '〇〇です。 (meslek / okul)',
    kana: '〇〇です。',
    tr: '… (mesleğim / okulum)',
    secenekler: [
      { ja: '大学生です。', kana: 'だいがくせいです。', tr: 'Üniversite öğrencisiyim.' },
      { ja: '学生です。', kana: 'がくせいです。', tr: 'Öğrenciyim.' },
      { ja: '高校生です。', kana: 'こうこうせいです。', tr: 'Lise öğrencisiyim.' },
      { ja: '大学院生です。', kana: 'だいがくいんせいです。', tr: 'Yüksek lisans öğrencisiyim.' },
      { ja: '会社員です。', kana: 'かいしゃいんです。', tr: 'Şirkette çalışıyorum.' },
      { ja: 'エンジニアです。', kana: 'エンジニアです。', tr: 'Mühendisim.' },
    ],
  },
  {
    kalip: '〇〇大学の学生です。',
    kana: '〇〇だいがくのがくせいです。',
    tr: '… Üniversitesi’nin öğrencisiyim',
    secenekler: [{ ja: 'イスタンブール大学の学生です。', kana: 'イスタンブールだいがくのがくせいです。', tr: 'İstanbul Üniversitesi öğrencisiyim.' }],
  },
  {
    kalip: '〇〇を勉強しています。',
    kana: '〇〇をべんきょうしています。',
    tr: '… okuyorum / çalışıyorum',
    secenekler: [
      { ja: '日本語を勉強しています。', kana: 'にほんごをべんきょうしています。', tr: 'Japonca çalışıyorum.' },
      { ja: '工学を勉強しています。', kana: 'こうがくをべんきょうしています。', tr: 'Mühendislik okuyorum.' },
      { ja: '経済を勉強しています。', kana: 'けいざいをべんきょうしています。', tr: 'Ekonomi okuyorum.' },
    ],
  },
  {
    kalip: 'しゅみは〇〇です。',
    kana: 'しゅみは〇〇です。',
    tr: 'Hobim …',
    secenekler: [
      { ja: 'しゅみは音楽です。', kana: 'しゅみはおんがくです。', tr: 'Hobim müzik.' },
      { ja: 'しゅみはゲームです。', kana: 'しゅみはゲームです。', tr: 'Hobim oyun.' },
      { ja: 'しゅみはスポーツです。', kana: 'しゅみはスポーツです。', tr: 'Hobim spor.' },
    ],
  },
]

/** Sana sorulacak sorular ve cevapların */
export const TANITIM_SORULARI: { soru: Ornek; cevap: Ornek }[] = [
  {
    soru: { ja: 'お名前は？', kana: 'おなまえは？', tr: 'Adınız?' },
    cevap: { ja: 'エフェです。', kana: 'エフェです。', tr: 'Efe.' },
  },
  {
    soru: { ja: '何歳ですか。', kana: 'なんさいですか。', tr: 'Kaç yaşındasın?', not: 'Kibarı: おいくつですか。' },
    cevap: { ja: '二十二歳です。', kana: 'にじゅうにさいです。', tr: '22 yaşındayım.' },
  },
  {
    soru: { ja: 'どこから来ましたか。', kana: 'どこからきましたか。', tr: 'Nereden geldin?', not: 'Kibarı: お国はどちらですか。' },
    cevap: { ja: 'トルコから来ました。', kana: 'トルコからきました。', tr: 'Türkiye’den geldim.' },
  },
  {
    soru: { ja: '学生ですか。', kana: 'がくせいですか。', tr: 'Öğrenci misin?' },
    cevap: { ja: 'はい、大学生です。', kana: 'はい、だいがくせいです。', tr: 'Evet, üniversite öğrencisiyim.' },
  },
  {
    soru: { ja: '何を勉強していますか。', kana: 'なにをべんきょうしていますか。', tr: 'Ne okuyorsun?' },
    cevap: { ja: '日本語を勉強しています。', kana: 'にほんごをべんきょうしています。', tr: 'Japonca çalışıyorum.' },
  },
  {
    soru: { ja: '日本語が上手ですね。', kana: 'にほんごがじょうずですね。', tr: 'Japoncan çok iyi!' },
    cevap: { ja: 'いいえ、まだまだです。', kana: 'いいえ、まだまだです。', tr: 'Yok, daha çok yolum var.', not: 'Japonlar iltifatı böyle karşılar' },
  },
]
