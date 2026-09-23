import { UNITS } from './units'
import { AYIN_GUNLERI, AYLAR, dakikaKana, saat12, saat24, saatKana, sayiBasamaklari, sayiKana } from './basics'
import { kanaToRomaji, romajiWords } from '@/lib/ja-phonetic'
import { shuffle } from '@/lib/shuffle'

// Dinleme alıştırmasının soruları. Sayfadan ayrı: her tür yüzlerce kez
// üretilip "kendi doğru cevabını kabul ediyor mu" diye sınanabiliyor.

export type Tur = 'fiyat' | 'saat' | 'tarih' | 'cumle'

export const TURLER: { id: Tur; label: string; not: string }[] = [
  { id: 'fiyat', label: 'Fiyat', not: 'Duyduğun fiyatı rakamla yaz. 300, 600, 800, 3000 ve 8000’de ses değişir.' },
  { id: 'saat', label: 'Saat', not: 'Duyduğun saati yaz: 7:30 gibi. 午前 sabah, 午後 öğleden sonra — 15:30 da 3:30 da kabul.' },
  { id: 'tarih', label: 'Tarih', not: 'Duyduğun ayı ve günü yaz: 4/10 gibi. Ayın 1–10’u, 14’ü, 20’si ve 24’ü düzensiz.' },
  { id: 'cumle', label: 'Cümle', not: 'Ünite metinlerinden bir cümle. Duy, anlamını seç.' },
]

export const TUR_SAYISI = 10

export interface Soru {
  /** Seslendirilecek metin */
  ses: string
  /** Kanjili metinse kana okunuşu */
  okunus?: string
  /** Gösterilecek doğru cevap */
  dogru: string
  /** Cevabın kanası ve Latin okunuşu — geri bildirimde */
  kana: string
  latin: string
  /** Yazılan cevabı değerlendirir */
  kontrol?: (yazilan: string) => boolean
  /** Şıklı soruda seçenekler ve doğru şık */
  secenekler?: string[]
  dogruSik?: number
  not?: string
}

const rastgele = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const sayilar = (s: string) => (s.match(/\d+/g) ?? []).map(Number)

// ————————————————————————— Soru üreticileri —————————————————————————

function fiyatSorusu(): Soru {
  // Yarısı ses değişen basamaklardan: asıl öğrenilecek olan onlar
  const zor = Math.random() < 0.5
  const bin = zor ? rastgele([0, 1, 3, 8, 3, 8]) : rastgele([0, 1, 2, 4, 5, 6, 7, 9])
  const yuz = zor ? rastgele([3, 6, 8]) : rastgele([0, 1, 2, 4, 5, 7, 9])
  const on = rastgele([0, 0, 2, 5, 8])
  let n = bin * 1000 + yuz * 100 + on * 10
  if (n < 100) n = rastgele([300, 600, 800])
  if (Math.random() < 0.12) n = rastgele([10000, 12000, 15000, 30000])
  const kana = sayiKana(n) + 'えん'
  return {
    ses: kana,
    dogru: `${n.toLocaleString('tr-TR')} 円`,
    kana,
    latin: sayiBasamaklari(n).map(kanaToRomaji).join(' ') + ' en',
    kontrol: (y) => Number(y.replace(/[^\d]/g, '')) === n,
  }
}

function saatSorusu(): Soru {
  const h24 = rastgele([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 4, 9, 7])
  const m = rastgele([0, 0, 5, 10, 15, 20, 30, 30, 40, 45, 50])
  // Yarısında 午前/午後 ile, yarısında 24 saatlik (tren, dükkân) söyleniş
  const onEkli = Math.random() < 0.6
  const o = onEkli ? saat12(h24, m, true) : saat24(h24, m)
  const iki = (x: number) => String(x).padStart(2, '0')
  return {
    ses: o.kana,
    okunus: o.kana,
    dogru: `${iki(h24)}:${iki(m)}`,
    kana: o.kana,
    // Latin: önek, saat ve dakika ayrı kelimeler — bitişik yazılınca okunmuyordu
    latin: [
      onEkli ? (h24 < 12 ? 'gozen' : 'gogo') : '',
      kanaToRomaji(saatKana(onEkli ? h24 % 12 : h24)),
      m === 0 ? '' : m === 30 && onEkli ? 'han' : kanaToRomaji(dakikaKana(m)),
    ]
      .filter(Boolean)
      .join(' '),
    kontrol: (y) => {
      const [h, dk = 0] = sayilar(y)
      // Öğleden sonra saatin 12'li yazılışı da doğru: 午後3時 = 3:00 ya da 15:00
      return h !== undefined && h % 12 === h24 % 12 && dk === m
    },
    not: h24 === 12 && onEkli ? 'Öğlen 12 resmî dilde 午後零時 (ごごれいじ) diye okunur.' : undefined,
  }
}

const AY_GUN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function tarihSorusu(): Soru {
  const ay = 1 + Math.floor(Math.random() * 12)
  // Düzensiz günler ağırlıklı: sınavın sorduğu ve karıştırılan onlar
  const duzensiz = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 20, 24]
  let gun = Math.random() < 0.65 ? rastgele(duzensiz) : 1 + Math.floor(Math.random() * 31)
  gun = Math.min(gun, AY_GUN[ay - 1])
  const kana = AYLAR[ay - 1].kana + AYIN_GUNLERI[gun - 1].kana
  return {
    ses: kana,
    dogru: `${ay}/${gun} — ${gun} ${AYLAR[ay - 1].tr}`,
    kana: `${AYLAR[ay - 1].kana} ${AYIN_GUNLERI[gun - 1].kana}`,
    latin: `${kanaToRomaji(AYLAR[ay - 1].kana)} ${kanaToRomaji(AYIN_GUNLERI[gun - 1].kana)}`,
    kontrol: (y) => {
      const [a, g] = sayilar(y)
      return a === ay && g === gun
    },
  }
}

/** Diyalog satırındaki konuşanı ayırır: 「エフェ：…」 → 「…」 */
const konusansiz = (s: string) => s.replace(/^[^：:]{1,8}[：:]\s*/, '')

const CUMLELER = UNITS.flatMap((u) =>
  u.text.lines.map((l) => ({
    ja: konusansiz(l.ja),
    kana: konusansiz(l.kana),
    tr: konusansiz(l.tr),
    unite: u.no,
  })),
).filter((c) => c.ja.length >= 5)

function cumleSorusu(): Soru {
  const c = rastgele(CUMLELER)
  const yanlislar = shuffle(CUMLELER.filter((x) => x.tr !== c.tr)).slice(0, 3).map((x) => x.tr)
  const secenekler = shuffle([c.tr, ...yanlislar])
  return {
    ses: c.ja,
    okunus: c.kana,
    dogru: c.tr,
    kana: c.ja,
    latin: romajiWords(c.ja, c.kana),
    secenekler,
    dogruSik: secenekler.indexOf(c.tr),
    not: `Ünite ${c.unite} metninden`,
  }
}

export const URET: Record<Tur, () => Soru> = {
  fiyat: fiyatSorusu,
  saat: saatSorusu,
  tarih: tarihSorusu,
  cumle: cumleSorusu,
}

