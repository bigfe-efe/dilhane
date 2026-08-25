// Çizim değerlendirme.
//
// Tuval şimdiye kadar sadece kâğıt görevi görüyordu: çiziyordun, kimse
// "doğru mu" demiyordu. KanjiVG verisi elimizde olduğuna göre çizimi gerçek
// karakterle karşılaştırabiliriz.
//
// Neyi ölçüyoruz, neyi ölçmüyoruz:
//   ✓ çizgi SAYISI      — en sık hata, tespiti kesin
//   ✓ çizgi SIRASI      — her çizginin doğru yerden başlayıp bitmesi
//   ✓ çizgi YÖNÜ        — yukarıdan aşağı mı, sağdan sola mı
//   ✗ estetik/oran      — güzel yazı ölçmüyoruz, bu bir kaligrafi uygulaması değil
//
// Yaklaşım kasıtlı olarak toleranslıdır: parmakla çizilen bir kana asla
// KanjiVG eğrisiyle birebir örtüşmez. Amaç "yanlış alışkanlığı yakalamak",
// milimetrik doğruluk değil.

import { strokeGlyph, type StrokeGlyph } from '@/lib/strokes'

export interface Point {
  x: number
  y: number
}

export interface StrokeVerdict {
  index: number
  ok: boolean
  /** Neyin ters gittiği — kullanıcıya gösterilecek Türkçe açıklama */
  issue?: string
}

export interface CheckResult {
  /** 0–100 */
  score: number
  expectedStrokes: number
  drawnStrokes: number
  strokes: StrokeVerdict[]
  /** Genel değerlendirme — tek cümle */
  summary: string
  tone: 'ok' | 'warn' | 'bad'
}

/** İki nokta arası mesafe, birim kare (109) ölçeğinde. */
function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Çizimi 0–109 kutusuna oturtur — tuval boyutu ve çizim büyüklüğü fark etmesin. */
function normalize(strokes: Point[][], unit: number): Point[][] {
  const all = strokes.flat()
  if (!all.length) return strokes
  const xs = all.map((p) => p.x)
  const ys = all.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const w = Math.max(1, maxX - minX)
  const h = Math.max(1, maxY - minY)
  // En-boy oranını koru: karakteri ezmeden ortala
  const scale = (unit * 0.86) / Math.max(w, h)
  const offX = (unit - w * scale) / 2
  const offY = (unit - h * scale) / 2
  return strokes.map((s) => s.map((p) => ({ x: (p.x - minX) * scale + offX, y: (p.y - minY) * scale + offY })))
}

/** Bir SVG path'inin başlangıç, orta ve bitiş noktaları. */
function samplePath(d: string, ox: number): { start: Point; mid: Point; end: Point } | null {
  if (typeof document === 'undefined') return null
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('d', d)
  const len = el.getTotalLength()
  if (!len) return null
  const at = (t: number) => {
    const p = el.getPointAtLength(len * t)
    return { x: p.x + ox, y: p.y }
  }
  return { start: at(0), mid: at(0.5), end: at(1) }
}

/**
 * Çizimi karakterin gerçek çizgi verisiyle karşılaştırır.
 *
 * @param drawn tuvalden gelen çizgiler (piksel koordinatları)
 * @param char  hedef karakter
 */
export function checkDrawing(drawn: Point[][], char: string): CheckResult | null {
  const glyph: StrokeGlyph | null = strokeGlyph(char)
  if (!glyph) return null

  const expected = glyph.strokes.map((s) => samplePath(s.d, s.ox)).filter(Boolean) as {
    start: Point
    mid: Point
    end: Point
  }[]
  if (!expected.length) return null

  // Anlamsız kısa dokunuşları ele (nokta atmak çizgi sayılmasın)
  const real = drawn.filter((s) => s.length > 1)
  const width = glyph.unit * glyph.boxes
  const norm = normalize(real, glyph.unit).map((s) =>
    // Çok karakterli metinde (きゃ) yatay ölçek kutu sayısı kadar geniştir
    glyph.boxes > 1 ? s.map((p) => ({ x: (p.x / glyph.unit) * width, y: p.y })) : s,
  )

  const verdicts: StrokeVerdict[] = []
  // Kutunun köşegeninin dörtte biri — parmakla çizimde makul tolerans
  const tol = Math.hypot(width, glyph.unit) * 0.26

  /** Bir çizimin bir referans çizgiye ne kadar uyduğu — küçük daha iyi. */
  const cost = (mine: Point[], ref: (typeof expected)[number]) => {
    const a = mine[0]
    const b = mine[mine.length - 1]
    const m = mine[Math.floor(mine.length / 2)]
    return dist(a, ref.start) + dist(b, ref.end) + dist(m, ref.mid)
  }

  const n = Math.min(norm.length, expected.length)
  for (let i = 0; i < n; i++) {
    const mine = norm[i]
    const ref = expected[i]
    const myStart = mine[0]
    const myEnd = mine[mine.length - 1]

    // Bu çizim aslında hangi çizgiye daha çok benziyor?
    // Sıra hatasını yön hatasından ayırmanın tek güvenilir yolu bu.
    let bestIdx = i
    let bestCost = cost(mine, ref)
    expected.forEach((r, j) => {
      const c = cost(mine, r)
      if (c < bestCost - tol * 0.5) {
        bestCost = c
        bestIdx = j
      }
    })

    if (bestIdx !== i) {
      verdicts.push({ index: i, ok: false, issue: `sıra farklı — bu çizgi ${bestIdx + 1}. sırada yazılır` })
      continue
    }

    const startOff = dist(myStart, ref.start)
    const endOff = dist(myEnd, ref.end)
    // Ters çizilmiş mi: benim başım referansın sonuna, sonum başına yakınsa
    const reversed = dist(myStart, ref.end) + dist(myEnd, ref.start) < startOff + endOff

    if (reversed) {
      verdicts.push({ index: i, ok: false, issue: 'ters yönde çizilmiş' })
    } else if (startOff > tol) {
      verdicts.push({ index: i, ok: false, issue: 'yanlış yerden başlamış' })
    } else if (endOff > tol) {
      verdicts.push({ index: i, ok: false, issue: 'yanlış yerde bitmiş' })
    } else {
      verdicts.push({ index: i, ok: true })
    }
  }

  const countOk = real.length === expected.length
  const okCount = verdicts.filter((v) => v.ok).length
  // Çizgi sayısı yanlışsa sıra karşılaştırması zaten kaymıştır; puanı ona göre kır
  const base = expected.length > 0 ? okCount / expected.length : 0
  const score = Math.round((countOk ? base : base * 0.6) * 100)

  let summary: string
  let tone: CheckResult['tone']
  if (!countOk) {
    summary =
      real.length > expected.length
        ? `${expected.length} çizgi olmalıydı, ${real.length} çizdin. Fazladan çizgi genelde tek hamlede yazılması gereken bir kıvrımı bölmekten gelir.`
        : `${expected.length} çizgi olmalıydı, ${real.length} çizdin. Eksik çizgi var — çizgi sırası gösterimine bak.`
    tone = 'bad'
  } else if (score >= 85) {
    summary = 'Çizgi sayısı, sırası ve yönü doğru. Böyle devam.'
    tone = 'ok'
  } else if (score >= 55) {
    summary = 'Çizgi sayısı doğru ama bazı çizgiler yanlış yerden başlıyor veya ters yönde gidiyor.'
    tone = 'warn'
  } else {
    summary = 'Çizgi sayısı doğru, ancak sıra büyük ölçüde tutmuyor. Önce animasyonu izleyip üzerinden geç.'
    tone = 'bad'
  }

  return { score, expectedStrokes: expected.length, drawnStrokes: real.length, strokes: verdicts, summary, tone }
}
