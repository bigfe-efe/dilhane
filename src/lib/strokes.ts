// Çizgi sırası (stroke order) verisi.
//
// Veri public/strokes/*.json içinde durur; `npm run gen:strokes` ile KanjiVG'den
// bir kez üretilir. Uygulama çalışırken ağa çıkmaz — dosyalar PWA önbelleğindedir.
//
// Kaynak: KanjiVG (CC BY-SA 3.0) — http://kanjivg.tagaini.net

export interface StrokeData {
  /** SVG path "d" dizileri, çizim sırasına göre */
  s: string[]
  /** Her çizginin numara etiketi konumu */
  n: [number, number][]
  /** viewBox kenarı (KanjiVG'de 109) */
  v: number
}

type SetName = 'kana' | 'kanji'

const cache = new Map<string, StrokeData>()
const pending = new Map<SetName, Promise<void>>()

function setOf(ch: string): SetName {
  // Hiragana U+3040–309F, Katakana U+30A0–30FF (uzatma çizgisi ー dahil)
  return /[぀-ヿ]/.test(ch) ? 'kana' : 'kanji'
}

function loadSet(name: SetName): Promise<void> {
  let p = pending.get(name)
  if (p) return p
  p = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}strokes/${name}.json`)
      if (!res.ok) return
      const data: Record<string, StrokeData> = await res.json()
      for (const [ch, d] of Object.entries(data)) cache.set(ch, d)
    } catch {
      // Veri yoksa bileşen sessizce gizlenir
    }
  })()
  pending.set(name, p)
  return p
}

/** Metindeki karakterler için gereken veri dosyalarını yükler. */
export async function ensureStrokeData(text: string): Promise<void> {
  const sets = new Set([...text].map(setOf))
  await Promise.all([...sets].map(loadSet))
}

export interface StrokeGlyph {
  /** Tek karakterlik kutunun kenarı */
  unit: number
  /** Kaç karakter yan yana (きゃ gibi yōon'da 2) */
  boxes: number
  /** Çizgiler — `ox` o karakterin yatay kayması */
  strokes: { d: string; ox: number }[]
  /** Numara etiketleri, kayma uygulanmış hâlde */
  labels: { x: number; y: number }[]
}

/**
 * Metin için çizgi verisi. Karakterlerden biri eksikse null döner.
 * `ensureStrokeData` beklenmeden çağrılırsa da null döner.
 */
export function strokeGlyph(text: string): StrokeGlyph | null {
  const chars = [...text]
  if (!chars.length) return null

  const parts = chars.map((c) => cache.get(c))
  if (parts.some((p) => !p)) return null

  const unit = parts[0]!.v
  const strokes: StrokeGlyph['strokes'] = []
  const labels: StrokeGlyph['labels'] = []

  parts.forEach((p, i) => {
    const ox = i * unit
    for (const d of p!.s) strokes.push({ d, ox })
    for (const [x, y] of p!.n) labels.push({ x: x + ox, y })
  })

  return { unit, boxes: chars.length, strokes, labels }
}

/** Veri hazır mı — yükleme beklemeden hızlı kontrol. */
export function hasStrokeData(text: string): boolean {
  return [...text].every((c) => cache.has(c))
}
