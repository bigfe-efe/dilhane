// Yazdırılabilir Japonca kâğıtları üretir: 原稿用紙 (genkou youshi) ve büyük
// kareli hiragana alıştırma sayfaları.
//
// ÖLÇÜLER NEDEN BÖYLE:
// Gerçek genkou youshi 400字詰め'dir: 20 sütun × 20 satır = 400 kare. Piyasada
// en yaygın kâğıt B4 (257×364 mm); kare kenarı orada ~9 mm olur. Kare boyutunu
// belirleyen şey SAYFA GENİŞLİĞİdir, çünkü 20 sütunun yan yana sığması gerekir.
//
// A4'te (210×297) dikey tutarsak 20 sütun ancak ~7,5 mm karelerle sığar — yani
// orijinalden küçük. A4'ü YATAY çevirince kare 8,8 mm'ye çıkıyor ve gerçek B4
// ölçüsüyle neredeyse aynı oluyor. Bu yüzden genkou youshi sayfaları A4 yatay.
//
// Alıştırma sayfaları ayrı bir iş: orada amaç harfin biçimini öğrenmek, o yüzden
// kareler 20 mm ve sayfa dikey.
//
// Çizim SVG ile yapılıyor ve viewBox birimi = 1 mm. Böylece tarayıcı ölçekleme
// yapmadan basar; cetvelle ölçtüğünde tam çıkar.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HIRAGANA } from '../src/content/ja/kana'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT = join(ROOT, 'print')

// ————————————————————————— Ölçüler (mm) —————————————————————————

/** Genkou youshi — A4 yatay */
const G = {
  pageW: 297,
  pageH: 210,
  square: 8.8, // gerçek B4 genkou youshi ~9 mm
  gutter: 2.2, // sütunlar arası furigana boşluğu (kare/4)
  center: 6, // ortadaki şerit (版心) — geleneksel katlama payı
  cols: 20,
  rows: 20,
}

/** Büyük kareli alıştırma — A4 dikey */
const P = {
  pageW: 210,
  pageH: 297,
  square: 20,
  gap: 2,
  cols: 8,
  rows: 12,
}

// ————————————————————————— Çizgi verisi —————————————————————————

type StrokeFile = Record<string, { s: string[] }>
const STROKES: StrokeFile = JSON.parse(readFileSync(join(ROOT, 'public/strokes/kana.json'), 'utf8'))

// KanjiVG kutusu 109×109'dur ama mürekkep kutunun tamamını doldurmaz: bütün
// kana'ları ölçtüğümüzde çizimler 13–96,5 aralığına oturuyor, yani kutunun
// ancak %76'sına. Kutuyu kareye eşitlersek harf karenin yarısı kadar kalıyor,
// oysa gerçek yazıda kare neredeyse dolar.
//
// Bu yüzden ölçek, EN BÜYÜK kana'nın mürekkep boyuna göre hesaplanıyor: en
// irisi kareyi %88 dolduruyor, geri kalan harfler de ona GÖRE küçük kalıyor.
// Her harfi tek tek kareye sığdırmak (normalize etmek) yanlış olurdu — し ince
// uzundur, を geniştir; bu kâğıdın amacı tam da o oranı öğretmek.
const INK = 83.1 // en büyük kana'nın 109 birimlik kutudaki mürekkep boyu
const FILL = 0.88 // karenin doldurulma oranı

/** KanjiVG yolunu kareye oturtur. Ölçek bütün harflerde AYNIDIR. */
function glyph(ch: string, x: number, y: number, size: number, cls: string): string {
  const g = STROKES[ch]
  if (!g) return ''
  const sc = (size * FILL) / INK
  // Mürekkep kutunun ortasında durduğu için kutuyu kareye ortalamak yeterli
  const off = (size - 109 * sc) / 2
  const paths = g.s.map((d) => `<path d="${d}" />`).join('')
  return `<g class="${cls}" transform="translate(${r(x + off)} ${r(y + off)}) scale(${r(sc, 5)})">${paths}</g>`
}

const r = (n: number, d = 3) => Number(n.toFixed(d))

// ————————————————————————— Izgara çizimi —————————————————————————

interface GridOpts {
  guides: boolean
  /** Kareye basılacak soluk örnek harfler — sıra sıra doldurulur. */
  fill?: (col: number, row: number) => string | null
}

/**
 * Genkou youshi ızgarası.
 *
 * Dikey ve yatay yazı aynı ızgara DEĞİLDİR:
 *   • Dikey yazıda karakterler bir sütunda yukarıdan aşağı dizilir; furigana
 *     için boşluk SÜTUNLARIN arasındadır ve satırlar birbirine bitişiktir.
 *     Sütunlar sağdan sola okunur, ortada geleneksel şerit (版心) bulunur.
 *   • Yatay yazıda karakterler soldan sağa dizilir; bu kez boşluk SATIRLARIN
 *     arasına düşer, sütunlar bitişiktir. Ortadaki şerit yoktur — o tamamen
 *     dikey yazı geleneğidir.
 *
 * Ölçü sonucu da değişiyor: satır aralıklı 20×20 ızgara A4 yatayına sığmaz
 * (217,8 mm > 210 mm), o yüzden yatay yazı sayfası A4 DİKEY basılır.
 */
function genkouGrid(vertical: boolean, o: GridOpts): string {
  const { square: s, gutter: gu, center, cols, rows } = G
  const pageW = vertical ? G.pageW : G.pageH
  const pageH = vertical ? G.pageH : G.pageW

  // Oluk dikeyde sütunlar arasında, yatayda satırlar arasında
  const colGap = vertical ? gu : 0
  const rowGap = vertical ? 0 : gu
  const strip = vertical ? center : 0

  const gridW = cols * s + (cols - 1) * colGap + strip
  const gridH = rows * s + (rows - 1) * rowGap
  const x0 = (pageW - gridW) / 2
  const y0 = (pageH - gridH) / 2

  // Ortadaki şerit 10. sütundan sonra gelir (yalnızca dikey yazıda)
  const colX = (c: number) => x0 + c * (s + colGap) + (vertical && c >= cols / 2 ? strip : 0)
  const rowY = (r2: number) => y0 + r2 * (s + rowGap)

  const parts: string[] = []

  for (let c = 0; c < cols; c++) {
    for (let row = 0; row < rows; row++) {
      const x = colX(c)
      const y = rowY(row)
      parts.push(`<rect class="cell" x="${r(x)}" y="${r(y)}" width="${r(s)}" height="${r(s)}" />`)

      if (o.guides) {
        const cx = r(x + s / 2)
        const cy = r(y + s / 2)
        parts.push(
          `<line class="guide" x1="${cx}" y1="${r(y)}" x2="${cx}" y2="${r(y + s)}" />`,
          `<line class="guide" x1="${r(x)}" y1="${cy}" x2="${r(x + s)}" y2="${cy}" />`,
        )
      }

      if (o.fill) {
        // Dikey yazıda okuma sağdan sola: görsel sütun c, mantıksal sütun cols-1-c
        const ch = o.fill(vertical ? cols - 1 - c : c, row)
        if (ch) parts.push(glyph(ch, x, y, s, 'sample'))
      }
    }
  }

  if (vertical) {
    const stripX = x0 + (cols / 2) * (s + colGap) - colGap
    parts.push(`<rect class="strip" x="${r(stripX)}" y="${r(y0)}" width="${r(strip + colGap)}" height="${r(gridH)}" />`)
  }

  return parts.join('\n')
}

/** Büyük kareli alıştırma ızgarası. */
function practiceGrid(o: GridOpts): string {
  const { square: s, gap, cols, rows } = P
  const gridW = cols * s + (cols - 1) * gap
  const gridH = rows * s + (rows - 1) * gap
  const x0 = (P.pageW - gridW) / 2
  const y0 = (P.pageH - gridH) / 2

  const parts: string[] = []
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (s + gap)
      const y = y0 + row * (s + gap)
      parts.push(`<rect class="cell" x="${r(x)}" y="${r(y)}" width="${s}" height="${s}" />`)

      if (o.guides) {
        const cx = r(x + s / 2)
        const cy = r(y + s / 2)
        parts.push(
          `<line class="guide" x1="${cx}" y1="${r(y)}" x2="${cx}" y2="${r(y + s)}" />`,
          `<line class="guide" x1="${r(x)}" y1="${cy}" x2="${r(x + s)}" y2="${cy}" />`,
        )
      }

      if (o.fill) {
        const ch = o.fill(c, row)
        if (ch) parts.push(glyph(ch, x, y, s, 'sample'))
      }
    }
  }
  return parts.join('\n')
}

// ————————————————————————— Sayfa iskeleti —————————————————————————

// Kâğıda YALNIZCA ızgara basılır. Daha önce üstte bir başlık şeridi vardı;
// kaldırıldı çünkü basılan sayfada işe yaramıyor, sadece yer kaplıyordu.
// O bilgiler artık OKU-genkou-youshi.md dosyasında.
function sheet(w: number, h: number, body: string): string {
  return `
<section class="sheet">
  <svg width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
${body}
  </svg>
</section>`
}

const STYLE = (landscape: boolean) => `
<style>
  /*
    margin:0 + tam ölçülü .sheet: tarayıcı kendi kenar boşluğunu eklemesin ki
    kareler cetvelde tam 8,8 / 20 mm çıksın. Yazdırma kutusunda "Kenar boşluğu:
    Yok" ve "Ölçek: %100" seçili olmalı.
  */
  @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 0; }

  html, body { margin: 0; padding: 0; background: #e9e9ec; }

  .sheet {
    width: ${landscape ? 297 : 210}mm;
    height: ${landscape ? 210 : 297}mm;
    margin: 0 auto 8mm;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0,0,0,.18);
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .sheet:last-child { break-after: auto; page-break-after: auto; margin-bottom: 0; }

  svg { display: block; }

  /* Kare çerçeveleri — gerçek genkou youshi'de ince ve soluktur */
  .cell { fill: none; stroke: #6f7cc0; stroke-width: .18; }

  /* Karenin içindeki artı kılavuz: noktalı ve çok soluk, yazıyı bastırmasın */
  .guide { stroke: #b9c0e0; stroke-width: .12; stroke-dasharray: .7 .7; }

  /* Ortadaki şerit (版心) */
  .strip { fill: none; stroke: #6f7cc0; stroke-width: .18; }

  /* Üzerinden geçilecek soluk örnek harf */
  .sample path { fill: none; stroke: #c3c8dc; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }

  @media print {
    html, body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; }
    /* Soluk gri kılavuzlar "arka plan grafiği" sayılıp atılmasın */
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>`

function page(title: string, landscape: boolean, sheets: string): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>${title}</title>
${STYLE(landscape)}
</head>
<body>
${sheets}
</body>
</html>`
}

// ————————————————————————— Üretim —————————————————————————

mkdirSync(OUT, { recursive: true })

const BASE = HIRAGANA.filter((k) => k.kind === 'base').map((k) => k.char)

// ————— 1) Gerçek genkou youshi — dikey yazı (A4 yatay) —————

writeFileSync(
  join(OUT, 'genkou-youshi-dikey.html'),
  page(
    'Genkou youshi — dikey',
    true,
    [
      sheet(G.pageW, G.pageH, genkouGrid(true, { guides: true })),
      sheet(G.pageW, G.pageH, genkouGrid(true, { guides: false })),
    ].join('\n'),
  ),
  'utf8',
)

// ————— 1b) Genkou youshi — yatay yazı (A4 dikey) —————
//
// Yatay yazıda oluk satırların arasına düştüğü için ızgara 217,8 mm yüksekliğe
// çıkıyor ve A4 yatayına (210 mm) sığmıyor. Bu yüzden ayrı dosya, dikey sayfa.

writeFileSync(
  join(OUT, 'genkou-youshi-yatay.html'),
  page(
    'Genkou youshi — yatay',
    false,
    [
      sheet(G.pageH, G.pageW, genkouGrid(false, { guides: true })),
      sheet(G.pageH, G.pageW, genkouGrid(false, { guides: false })),
    ].join('\n'),
  ),
  'utf8',
)

// ————— 2) Büyük kareli alıştırma —————

const practiceSheets: string[] = [
  sheet(P.pageW, P.pageH, practiceGrid({ guides: true })),
  sheet(P.pageW, P.pageH, practiceGrid({ guides: false })),
]

// Örnekli sayfalar: her satırda bir harf, ilk iki kare soluk örnek, kalanı boş.
const perPage = P.rows
for (let start = 0; start < BASE.length; start += perPage) {
  const chunk = BASE.slice(start, start + perPage)
  practiceSheets.push(
    sheet(
      P.pageW,
      P.pageH,
      practiceGrid({
        guides: true,
        fill: (col, row) => (col < 2 && chunk[row] ? chunk[row] : null),
      }),
    ),
  )
}

writeFileSync(
  join(OUT, 'hiragana-pratik.html'),
  page('Hiragana alıştırma — 20 mm', false, practiceSheets.join('\n')),
  'utf8',
)

console.log(`print/genkou-youshi-dikey.html · 2 sayfa · kare ${G.square} mm · A4 yatay`)
console.log(`print/genkou-youshi-yatay.html · 2 sayfa · kare ${G.square} mm · A4 dikey`)
console.log(`print/hiragana-pratik.html     · ${practiceSheets.length} sayfa · kare ${P.square} mm · A4 dikey`)
console.log(`temel hiragana: ${BASE.length}`)
