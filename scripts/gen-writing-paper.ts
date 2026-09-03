/**
 * Japonca el yazısı kâğıtları — A4, baskıya hazır PDF.
 *
 * NEDEN PDF VE NEDEN ELDE YAZILIYOR
 * ----------------------------------
 * Kare kâğıdın tek işi ölçü vermek: 20 mm gerçekten 20 mm olmalı, yoksa
 * kâğıt işe yaramaz. Tarayıcıdan HTML yazdırmak bunu garanti etmez —
 * yazıcı sürücüsü "sayfaya sığdır" der, ölçek kayar. PDF'te sayfa kutusu
 * mutlak birimle (punto) tanımlıdır, "%100 / gerçek boyut" seçilince
 * milimetre milimetre çıkar.
 *
 * PDF elle üretiliyor çünkü çizilen şey yalnızca düz çizgi; bir kütüphane
 * eklemek için sebep yok. Dosyalar birkaç KB ve tamamen vektörel.
 *
 * KULLANIM
 *   npx tsx scripts/gen-writing-paper.ts
 *
 * Çıktı: yazi-kagidi/  (PDF'ler .gitignore'da — üreten betik yeterli)
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ————————————————————————————— PDF çekirdeği —————————————————————————————

/** 1 mm kaç punto eder (1 punto = 1/72 inç). */
const MM = 72 / 25.4

const A4_W = 210 * MM
const A4_H = 297 * MM

/** PDF sayı biçimi — üstel gösterim (1e-7) PDF'te geçersizdir, toFixed korur. */
const n = (v: number) => v.toFixed(2)

/**
 * Tek sayfalık PDF kur.
 *
 * xref tablosu her nesnenin BAYT konumunu ister, bu yüzden dosya parça parça
 * biriktirilip konumlar yol boyunca kaydediliyor. Girdiler tam 20 bayt
 * olmalı: 10 hane konum, boşluk, 5 hane sürüm, boşluk, tür, boşluk, satır
 * sonu. Bir bayt şaşarsa okuyucular dosyayı bozuk sayar.
 */
function buildPdf(content: string): Buffer {
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(A4_W)} ${n(A4_H)}] ` +
      '/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    // 4 numaralı nesne akış olduğu için aşağıda ayrıca ele alınıyor
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]

  const parts: Buffer[] = []
  let uzunluk = 0
  const yaz = (s: string | Buffer) => {
    const b = Buffer.isBuffer(s) ? s : Buffer.from(s, 'latin1')
    parts.push(b)
    uzunluk += b.length
  }

  yaz('%PDF-1.4\n')
  // İkili veri uyarısı: dosyanın ikili olarak taşınması gerektiğini söyler
  yaz(Buffer.from([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const konumlar: number[] = []
  for (let i = 0; i < objects.length; i++) {
    konumlar[i] = uzunluk
    const no = i + 1
    if (no === 4) {
      const akis = Buffer.from(content, 'latin1')
      yaz(`4 0 obj\n<< /Length ${akis.length} >>\nstream\n`)
      yaz(akis)
      yaz('\nendstream\nendobj\n')
    } else {
      yaz(`${no} 0 obj\n${objects[i]}\nendobj\n`)
    }
  }

  const xref = uzunluk
  let tablo = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const k of konumlar) tablo += `${String(k).padStart(10, '0')} 00000 n \n`
  yaz(tablo)
  yaz(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)

  return Buffer.concat(parts)
}

// ————————————————————————————— Çizim yardımcıları —————————————————————————

/** WinAnsi metninde kaçış gereken karakterler. */
const escape = (s: string) => s.replace(/([\\()])/g, '\\$1')

class Cizim {
  private ops: string[] = []

  gri(v: number, kalinlik: number, kesikli?: [number, number]) {
    this.ops.push(`${n(v)} G ${n(kalinlik)} w`)
    this.ops.push(kesikli ? `[${n(kesikli[0])} ${n(kesikli[1])}] 0 d` : '[] 0 d')
    return this
  }

  cizgi(x1: number, y1: number, x2: number, y2: number) {
    this.ops.push(`${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S`)
    return this
  }

  kutu(x: number, y: number, w: number, h: number) {
    this.ops.push(`${n(x)} ${n(y)} ${n(w)} ${n(h)} re S`)
    return this
  }

  /** Helvetica etiket. Sadece ASCII kullan — WinAnsi'de "ı" yok. */
  metin(x: number, y: number, boyut: number, gri: number, s: string) {
    this.ops.push(
      `BT /F1 ${n(boyut)} Tf ${n(gri)} g ${n(x)} ${n(y)} Td (${escape(s)}) Tj ET`,
    )
    return this
  }

  toString() {
    return this.ops.join('\n')
  }
}

// ————————————————————————————— Kâğıt türleri —————————————————————————————

/** Yazıcıların basamadığı kenar payı; hiçbir çizgi buraya girmemeli. */
const KENAR = 12 * MM
const ALT_ETIKET = 8 * MM

interface MasuSecenek {
  hucreMm: number
  /** Kutu içine noktalı artı kılavuz (十字リーダー) */
  artiKilavuz: boolean
  etiket: string
}

/**
 * Kare alıştırma kâğıdı.
 *
 * Kutular sayfaya ORTALANIR ve sığdığı kadarı çizilir; yarım kutu
 * bırakılmaz. Yarım kutu, harfi oraya sıkıştırma dürtüsü yaratıp oranı
 * bozuyor — kâğıdın tek işi doğru oranı öğretmekken.
 */
function masuKagidi(o: MasuSecenek): Buffer {
  const h = o.hucreMm * MM
  const kullanilirG = A4_W - 2 * KENAR
  const kullanilirY = A4_H - 2 * KENAR - ALT_ETIKET

  const sutun = Math.floor(kullanilirG / h)
  const satir = Math.floor(kullanilirY / h)
  const genislik = sutun * h
  const yukseklik = satir * h
  const x0 = (A4_W - genislik) / 2
  const y0 = (A4_H - yukseklik + ALT_ETIKET) / 2

  const c = new Cizim()

  // 1) Artı kılavuzlar en altta kalsın diye ÖNCE çiziliyor
  if (o.artiKilavuz) {
    c.gri(0.78, 0.3, [1.4, 1.8])
    for (let i = 0; i < sutun; i++) {
      const x = x0 + i * h + h / 2
      c.cizgi(x, y0, x, y0 + yukseklik)
    }
    for (let j = 0; j < satir; j++) {
      const y = y0 + j * h + h / 2
      c.cizgi(x0, y, x0 + genislik, y)
    }
  }

  // 2) Kutu çizgileri
  c.gri(0.55, 0.4)
  for (let i = 1; i < sutun; i++) {
    const x = x0 + i * h
    c.cizgi(x, y0, x, y0 + yukseklik)
  }
  for (let j = 1; j < satir; j++) {
    const y = y0 + j * h
    c.cizgi(x0, y, x0 + genislik, y)
  }

  // 3) Dış çerçeve daha koyu — sayfanın sınırı belli olsun
  c.gri(0.25, 0.7)
  c.kutu(x0, y0, genislik, yukseklik)

  c.metin(x0, y0 - 5 * MM, 7, 0.55, `${o.etiket}  -  ${sutun} x ${satir}  -  A4`)
  c.metin(A4_W - KENAR - 46 * MM, y0 - 5 * MM, 7, 0.7, 'Dilhane  /  tarih:')

  return buildPdf(c.toString())
}

/**
 * 原稿用紙 — 20x20 = 400 kareli müsvedde kâğıdı.
 *
 * Ortadaki boşluk (版心) süs değil: geleneksel kâğıtta sayfayı iki yarıya
 * ayırır ve dikey yazarken göz oraya dayanır. Yatay yazarken de kalması
 * doğru, çünkü öğrencinin karşılaşacağı kâğıt bu.
 */
function genkoYoshi(): Buffer {
  const SUTUN = 20
  const SATIR = 20
  const bosluk = 7 * MM

  // 20x20 KARE bir ızgara, A4 ise 1:1.41 — kareler kare kalacaksa hücre
  // boyunu GENİŞLİK belirler ve altta/üstte ~80 mm artar. Bu bir tasarım
  // hatası değil, geometrinin sonucu: basılı 原稿用紙'lerde de o boşluk
  // vardır ve ad/tarih başlığı olarak kullanılır. Burada da öyle yapılıyor,
  // yoksa sayfa "yarım kalmış" görünüyor.
  const BASLIK_Y = 16 * MM

  const kullanilirG = A4_W - 2 * KENAR
  const kullanilirY = A4_H - 2 * KENAR - ALT_ETIKET - BASLIK_Y
  const h = Math.min((kullanilirG - bosluk) / SUTUN, kullanilirY / SATIR)

  const genislik = SUTUN * h + bosluk
  const yukseklik = SATIR * h
  const x0 = (A4_W - genislik) / 2
  // Izgara başlığın ALTINDA kalan alana ortalanır
  const y0 = KENAR + ALT_ETIKET + (kullanilirY - yukseklik) / 2

  // Ortadaki boşluğun solunda ve sağında 10'ar sütun
  const sutunX = (i: number) => x0 + i * h + (i >= SUTUN / 2 ? bosluk : 0)

  const c = new Cizim()

  c.gri(0.55, 0.4)
  for (let i = 0; i <= SUTUN; i++) {
    // Boşluğun iki yakası da kapalı kenar olduğu için 10 ve 11 ayrı çizilir
    if (i === SUTUN / 2) {
      c.cizgi(sutunX(i - 1) + h, y0, sutunX(i - 1) + h, y0 + yukseklik)
      c.cizgi(sutunX(i), y0, sutunX(i), y0 + yukseklik)
      continue
    }
    const x = sutunX(i)
    c.cizgi(x, y0, x, y0 + yukseklik)
  }
  for (let j = 1; j < SATIR; j++) {
    const y = y0 + j * h
    c.cizgi(x0, y, sutunX(SUTUN / 2 - 1) + h, y)
    c.cizgi(sutunX(SUTUN / 2), y, x0 + genislik, y)
  }

  c.gri(0.25, 0.7)
  c.kutu(x0, y0, sutunX(SUTUN / 2 - 1) + h - x0, yukseklik)
  c.kutu(sutunX(SUTUN / 2), y0, x0 + genislik - sutunX(SUTUN / 2), yukseklik)

  // Başlık bandı: ad ve tarih için iki doldurulacak çizgi
  const baslikY = y0 + yukseklik + 9 * MM
  c.gri(0.55, 0.4)
  c.cizgi(x0 + 14 * MM, baslikY, x0 + genislik * 0.55, baslikY)
  c.cizgi(x0 + genislik * 0.68, baslikY, x0 + genislik, baslikY)
  c.metin(x0, baslikY + 1.2 * MM, 8, 0.4, 'Ad:')
  c.metin(x0 + genislik * 0.6, baslikY + 1.2 * MM, 8, 0.4, 'Tarih:')

  c.metin(x0, y0 - 5 * MM, 7, 0.55, 'Genko yoshi  -  20 x 20 = 400 kare  -  A4')

  return buildPdf(c.toString())
}

// ————————————————————————————— Üretim —————————————————————————————

const KLASOR = join(process.cwd(), 'yazi-kagidi')
mkdirSync(KLASOR, { recursive: true })

const uretilecek: { dosya: string; veri: Buffer }[] = [
  {
    dosya: '1-masu-20mm-artili.pdf',
    veri: masuKagidi({ hucreMm: 20, artiKilavuz: true, etiket: 'Masu 20mm + juji rieder' }),
  },
  {
    dosya: '2-masu-15mm-artili.pdf',
    veri: masuKagidi({ hucreMm: 15, artiKilavuz: true, etiket: 'Masu 15mm + juji rieder' }),
  },
  {
    dosya: '3-masu-10mm.pdf',
    veri: masuKagidi({ hucreMm: 10, artiKilavuz: false, etiket: 'Masu 10mm' }),
  },
  { dosya: '4-genko-yoshi-400.pdf', veri: genkoYoshi() },
]

for (const { dosya, veri } of uretilecek) {
  writeFileSync(join(KLASOR, dosya), veri)
  console.log(`${dosya}  ${(veri.length / 1024).toFixed(1)} KB`)
}

// Kullanım notu klasörün içinde dursun — kâğıtları aylar sonra açtığında
// hangisinin ne işe yaradığını orada bulasın
const BETIK_KLASOR = dirname(fileURLToPath(import.meta.url))
copyFileSync(join(BETIK_KLASOR, 'writing-paper-readme.md'), join(KLASOR, 'OKU.md'))
console.log('OKU.md')

console.log('')
console.log('Klasor: ' + KLASOR)
