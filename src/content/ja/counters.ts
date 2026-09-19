/**
 * Sayaçlar (助数詞) — Japoncada bir şeyi sayarken sayıya eklenen son ek.
 *
 * NEDEN AYRI BİR KONU: Türkçede "üç kişi", "üç tane", "üç gün" derken sayı
 * hiç değişmez. Japoncada sayı, sayaca göre SES DEĞİŞTİRİR: 三人 さんにん
 * ama 三分 さんぷん, 三日 みっか. Kuralı bilmeden tahmin edilemez ve N5
 * dinlemesinde sürekli çıkar.
 *
 * DÜZENLİ / DÜZENSİZ ayrımı burada veriyle taşınıyor: `d` işaretli olanlar
 * kuraldan çıkarılamaz, kelime olarak öğrenilir. İşaretsizler ise sayı +
 * sayaç birleşiminden doğrudan çıkar. Öğrenciye hangisinin ezber, hangisinin
 * hesap olduğunu söylemek, listenin tamamını ezberletmekten çok daha ucuz.
 */

export interface CounterItem {
  /** Soruda görünen sayı etiketi: "3", "?" */
  n: string
  /** Japonca yazılışı: 三人 */
  ja: string
  /** Okunuşu: さんにん */
  r: string
  /** Düzensiz mi — kuraldan çıkarılamıyorsa true */
  d?: boolean
  /** Kısa açıklama, yalnızca gerekince */
  note?: string
}

export interface Counter {
  id: string
  /** Kısa ad — sekmelerde görünür */
  label: string
  /** Sayaç eki */
  suffix: string
  /** Ne sayılır */
  what: string
  /** Kuralın özeti */
  rule: string
  items: CounterItem[]
}

export const COUNTERS: Counter[] = [
  {
    id: 'nin',
    label: '人 kişi',
    suffix: '人',
    what: 'İnsan sayarken',
    rule: '3’ten itibaren sayı + にん. Yalnızca 1 ve 2 düzensiz.',
    items: [
      { n: '1', ja: '一人', r: 'ひとり', d: true, note: 'Japonca sayı sistemi; いちにん denmez.' },
      { n: '2', ja: '二人', r: 'ふたり', d: true, note: 'にじん ya da ににん değil.' },
      { n: '3', ja: '三人', r: 'さんにん' },
      { n: '4', ja: '四人', r: 'よにん', d: true, note: 'よんにん değil よにん.' },
      { n: '5', ja: '五人', r: 'ごにん' },
      { n: '6', ja: '六人', r: 'ろくにん' },
      { n: '7', ja: '七人', r: 'しちにん', note: 'ななにん de denir.' },
      { n: '8', ja: '八人', r: 'はちにん' },
      { n: '9', ja: '九人', r: 'きゅうにん', note: 'くにん de denir.' },
      { n: '10', ja: '十人', r: 'じゅうにん' },
      { n: '?', ja: '何人', r: 'なんにん', note: 'Kaç kişi?' },
    ],
  },
  {
    id: 'tsu',
    label: 'つ tane',
    suffix: 'つ',
    what: 'Genel nesne sayarken (1–10)',
    rule: 'Tamamen Japonca sayı sistemi. 10’dan sonra つ yoktur, ~個 kullanılır.',
    items: [
      { n: '1', ja: '一つ', r: 'ひとつ', d: true },
      { n: '2', ja: '二つ', r: 'ふたつ', d: true },
      { n: '3', ja: '三つ', r: 'みっつ', d: true },
      { n: '4', ja: '四つ', r: 'よっつ', d: true },
      { n: '5', ja: '五つ', r: 'いつつ', d: true },
      { n: '6', ja: '六つ', r: 'むっつ', d: true },
      { n: '7', ja: '七つ', r: 'ななつ', d: true },
      { n: '8', ja: '八つ', r: 'やっつ', d: true },
      { n: '9', ja: '九つ', r: 'ここのつ', d: true },
      { n: '10', ja: '十', r: 'とお', d: true, note: 'Sonunda つ YOK.' },
      { n: '?', ja: 'いくつ', r: 'いくつ', note: 'Kaç tane?' },
    ],
  },
  {
    id: 'ji',
    label: '時 saat',
    suffix: '時',
    what: 'Saat kaç',
    rule: 'Sayı + じ. Üçü düzensiz: 4, 7, 9.',
    items: [
      { n: '1', ja: '一時', r: 'いちじ' },
      { n: '2', ja: '二時', r: 'にじ' },
      { n: '3', ja: '三時', r: 'さんじ' },
      { n: '4', ja: '四時', r: 'よじ', d: true, note: 'よんじ değil よじ.' },
      { n: '5', ja: '五時', r: 'ごじ' },
      { n: '6', ja: '六時', r: 'ろくじ' },
      { n: '7', ja: '七時', r: 'しちじ', d: true, note: 'ななじ değil しちじ.' },
      { n: '8', ja: '八時', r: 'はちじ' },
      { n: '9', ja: '九時', r: 'くじ', d: true, note: 'きゅうじ değil くじ.' },
      { n: '10', ja: '十時', r: 'じゅうじ' },
      { n: '?', ja: '何時', r: 'なんじ', note: 'Saat kaç?' },
    ],
  },
  {
    id: 'fun',
    label: '分 dakika',
    suffix: '分',
    what: 'Dakika',
    rule: '1, 3, 4, 6, 8, 10 ile ぷん olur; diğerlerinde ふん.',
    items: [
      { n: '1', ja: '一分', r: 'いっぷん', d: true },
      { n: '2', ja: '二分', r: 'にふん' },
      { n: '3', ja: '三分', r: 'さんぷん', d: true },
      { n: '4', ja: '四分', r: 'よんぷん', d: true },
      { n: '5', ja: '五分', r: 'ごふん' },
      { n: '6', ja: '六分', r: 'ろっぷん', d: true },
      { n: '7', ja: '七分', r: 'ななふん' },
      { n: '8', ja: '八分', r: 'はっぷん', d: true },
      { n: '9', ja: '九分', r: 'きゅうふん' },
      { n: '10', ja: '十分', r: 'じゅっぷん', d: true, note: 'じっぷん de doğrudur.' },
      { n: '?', ja: '何分', r: 'なんぷん', note: 'Kaç dakika?' },
    ],
  },
  {
    id: 'nichi',
    label: '日 ayın günü',
    suffix: '日',
    what: 'Ayın kaçı',
    rule: '1–10, 14, 20 ve 24 düzensiz. Geri kalanı sayı + にち.',
    items: [
      { n: '1', ja: '一日', r: 'ついたち', d: true, note: '"Bir gün" anlamında ise いちにち.' },
      { n: '2', ja: '二日', r: 'ふつか', d: true },
      { n: '3', ja: '三日', r: 'みっか', d: true },
      { n: '4', ja: '四日', r: 'よっか', d: true },
      { n: '5', ja: '五日', r: 'いつか', d: true },
      { n: '6', ja: '六日', r: 'むいか', d: true },
      { n: '7', ja: '七日', r: 'なのか', d: true },
      { n: '8', ja: '八日', r: 'ようか', d: true },
      { n: '9', ja: '九日', r: 'ここのか', d: true },
      { n: '10', ja: '十日', r: 'とおか', d: true },
      { n: '11', ja: '十一日', r: 'じゅういちにち', note: 'Buradan sonrası düzenli.' },
      { n: '14', ja: '十四日', r: 'じゅうよっか', d: true },
      { n: '20', ja: '二十日', r: 'はつか', d: true, note: 'Tamamen kendine özgü.' },
      { n: '?', ja: '何日', r: 'なんにち', note: 'Ayın kaçı?' },
    ],
  },
  {
    id: 'gatsu',
    label: '月 ay adı',
    suffix: '月',
    what: 'Hangi ay',
    rule: 'Sayı + がつ. Üçü düzensiz: 4, 7, 9.',
    items: [
      { n: '1', ja: '一月', r: 'いちがつ' },
      { n: '2', ja: '二月', r: 'にがつ' },
      { n: '3', ja: '三月', r: 'さんがつ' },
      { n: '4', ja: '四月', r: 'しがつ', d: true, note: 'よんがつ değil しがつ.' },
      { n: '5', ja: '五月', r: 'ごがつ' },
      { n: '6', ja: '六月', r: 'ろくがつ' },
      { n: '7', ja: '七月', r: 'しちがつ', d: true, note: 'なながつ değil しちがつ.' },
      { n: '8', ja: '八月', r: 'はちがつ' },
      { n: '9', ja: '九月', r: 'くがつ', d: true, note: 'きゅうがつ değil くがつ.' },
      { n: '10', ja: '十月', r: 'じゅうがつ' },
      { n: '?', ja: '何月', r: 'なんがつ', note: 'Hangi ay?' },
    ],
  },
  {
    id: 'en',
    label: '円 para',
    suffix: '円',
    what: 'Fiyat',
    rule: '円 hep えん. Düzensizlik 百 ve 千 tarafında: 300, 600, 800, 3000, 8000.',
    items: [
      { n: '100', ja: '百円', r: 'ひゃくえん' },
      { n: '200', ja: '二百円', r: 'にひゃくえん' },
      { n: '300', ja: '三百円', r: 'さんびゃくえん', d: true },
      { n: '600', ja: '六百円', r: 'ろっぴゃくえん', d: true },
      { n: '800', ja: '八百円', r: 'はっぴゃくえん', d: true },
      { n: '1000', ja: '千円', r: 'せんえん', note: 'いっせん denmez.' },
      { n: '3000', ja: '三千円', r: 'さんぜんえん', d: true },
      { n: '8000', ja: '八千円', r: 'はっせんえん', d: true },
      { n: '10000', ja: '一万円', r: 'いちまんえん', note: '10.000’de いち düşmez.' },
      { n: '?', ja: 'いくら', r: 'いくら', note: 'Kaç para?' },
    ],
  },
  {
    id: 'sai',
    label: 'さい yaş',
    suffix: 'さい',
    what: 'Yaş',
    rule: 'Sayı + さい. 1, 8, 10 ve 20 düzensiz.',
    items: [
      { n: '1', ja: '一さい', r: 'いっさい', d: true },
      { n: '2', ja: '二さい', r: 'にさい' },
      { n: '3', ja: '三さい', r: 'さんさい' },
      { n: '4', ja: '四さい', r: 'よんさい' },
      { n: '5', ja: '五さい', r: 'ごさい' },
      { n: '6', ja: '六さい', r: 'ろくさい' },
      { n: '7', ja: '七さい', r: 'ななさい' },
      { n: '8', ja: '八さい', r: 'はっさい', d: true },
      { n: '9', ja: '九さい', r: 'きゅうさい' },
      { n: '10', ja: '十さい', r: 'じゅっさい', d: true, note: 'じっさい de doğrudur.' },
      { n: '20', ja: '二十さい', r: 'はたち', d: true, note: 'Tamamen kendine özgü; "yirmi yaşında".' },
      { n: '?', ja: '何さい', r: 'なんさい', note: 'Kaç yaşında?' },
    ],
  },
  {
    id: 'hon',
    label: '本 uzun nesne',
    suffix: '本',
    what: 'Şişe, kalem, şemsiye gibi uzun şeyler',
    rule: '1, 3, 6, 8, 10’da ses değişir (ぽん / ぼん).',
    items: [
      { n: '1', ja: '一本', r: 'いっぽん', d: true },
      { n: '2', ja: '二本', r: 'にほん' },
      { n: '3', ja: '三本', r: 'さんぼん', d: true },
      { n: '4', ja: '四本', r: 'よんほん' },
      { n: '5', ja: '五本', r: 'ごほん' },
      { n: '6', ja: '六本', r: 'ろっぽん', d: true },
      { n: '7', ja: '七本', r: 'ななほん' },
      { n: '8', ja: '八本', r: 'はっぽん', d: true },
      { n: '9', ja: '九本', r: 'きゅうほん' },
      { n: '10', ja: '十本', r: 'じゅっぽん', d: true },
      { n: '?', ja: '何本', r: 'なんぼん', d: true, note: 'なんほん değil なんぼん.' },
    ],
  },
  {
    id: 'mai',
    label: '枚 ince nesne',
    suffix: '枚',
    what: 'Kâğıt, tabak, tişört gibi ince ve düz şeyler',
    rule: 'Hiç düzensizliği yok — sayı + まい. Rahat nefes al.',
    items: [
      { n: '1', ja: '一枚', r: 'いちまい' },
      { n: '2', ja: '二枚', r: 'にまい' },
      { n: '3', ja: '三枚', r: 'さんまい' },
      { n: '4', ja: '四枚', r: 'よんまい' },
      { n: '5', ja: '五枚', r: 'ごまい' },
      { n: '6', ja: '六枚', r: 'ろくまい' },
      { n: '7', ja: '七枚', r: 'ななまい' },
      { n: '8', ja: '八枚', r: 'はちまい' },
      { n: '9', ja: '九枚', r: 'きゅうまい' },
      { n: '10', ja: '十枚', r: 'じゅうまい' },
      { n: '?', ja: '何枚', r: 'なんまい', note: 'Kaç tane?' },
    ],
  },
]

export const COUNTER_BY_ID = new Map(COUNTERS.map((c) => [c.id, c]))

/** Bütün düzensiz biçimler — "önce bunları çalış" listesi için */
export function irregulars(): { c: Counter; item: CounterItem }[] {
  return COUNTERS.flatMap((c) => c.items.filter((i) => i.d).map((item) => ({ c, item })))
}
