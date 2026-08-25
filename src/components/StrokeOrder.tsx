import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './icons'
import { ensureStrokeData, strokeGlyph, type StrokeGlyph } from '@/lib/strokes'

// Çizgi sırası gösterimi.
//
// Üç şey aynı anda anlatılır:
//   1. sıra   — her çizginin numarası
//   2. yön    — çizgi ucunu takip eden nokta, başlangıçta duran halka
//   3. biçim  — bütün karakter altta soluk durur, çizgiler onun üstüne "yazılır"
//
// KanjiVG verisi 109x109 kutuya çizilidir; きゃ gibi çok karakterli metinlerde
// kutular yan yana eklenir.

export function StrokeOrder({
  char,
  height = 210,
  showNumbers: initialNumbers = true,
}: {
  char: string
  height?: number
  showNumbers?: boolean
}) {
  const [glyph, setGlyph] = useState<StrokeGlyph | null>(null)
  const [missing, setMissing] = useState(false)
  const [showNumbers, setShowNumbers] = useState(initialNumbers)
  /** Kaç çizgi tamamlandı — hem adım modunun hem animasyonun ortak sayacı */
  const [done, setDone] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)

  const paths = useRef<(SVGPathElement | null)[]>([])
  const tip = useRef<SVGCircleElement>(null)
  const raf = useRef<number | null>(null)
  /** Animasyon bitince ucu söndüren zamanlayıcı — durdurulurken iptal edilmeli */
  const tipTimer = useRef<number | null>(null)

  useEffect(() => {
    let alive = true
    setGlyph(null)
    setMissing(false)
    paths.current = []
    ensureStrokeData(char).then(() => {
      if (!alive) return
      const g = strokeGlyph(char)
      setGlyph(g)
      setMissing(!g)
      setDone(g ? g.strokes.length : 0) // varsayılan: karakter tam görünsün
      setPlaying(false)
    })
    return () => {
      alive = false
    }
  }, [char])

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = null
    if (tipTimer.current !== null) clearTimeout(tipTimer.current)
    tipTimer.current = null
    setPlaying(false)
    if (tip.current) tip.current.style.opacity = '0'
  }, [])

  useEffect(() => stop, [stop])

  const clearDashes = () => {
    for (const p of paths.current) {
      if (!p) continue
      p.style.strokeDasharray = ''
      p.style.strokeDashoffset = ''
    }
  }

  /** Çizgileri sırayla, gerçek uzunluklarına orantılı sürede çizer. */
  const play = useCallback(() => {
    const g = glyph
    if (!g) return
    if (raf.current !== null) cancelAnimationFrame(raf.current)

    const speed = slow ? 0.05 : 0.1 // birim / ms
    let i = 0
    let startedAt = 0

    const frame = (t: number) => {
      const path = paths.current[i]
      if (!path) {
        raf.current = null
        setPlaying(false)
        setDone(g.strokes.length)
        return
      }
      if (!startedAt) startedAt = t

      const len = path.getTotalLength()
      const dur = Math.min(1800, Math.max(240, len / speed))
      const k = Math.min(1, (t - startedAt) / dur)

      path.style.strokeDasharray = `${len}`
      path.style.strokeDashoffset = `${len * (1 - k)}`

      if (tip.current) {
        const pt = path.getPointAtLength(len * k)
        tip.current.setAttribute('cx', String(pt.x + g.strokes[i].ox))
        tip.current.setAttribute('cy', String(pt.y))
        tip.current.style.opacity = '1'
      }

      if (k >= 1) {
        path.style.strokeDasharray = ''
        path.style.strokeDashoffset = ''
        i++
        startedAt = 0
        setDone(i)
        if (i >= g.strokes.length) {
          raf.current = null
          setPlaying(false)
          tipTimer.current = window.setTimeout(() => {
            tipTimer.current = null
            if (tip.current) tip.current.style.opacity = '0'
          }, 450)
          return
        }
      }
      raf.current = requestAnimationFrame(frame)
    }

    // Baştan: bütün çizgileri gizle
    setDone(0)
    setPlaying(true)
    for (const p of paths.current) {
      if (!p) continue
      const len = p.getTotalLength()
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    }
    raf.current = requestAnimationFrame(frame)
  }, [glyph, slow])

  const step = (delta: number) => {
    stop()
    clearDashes()
    const total = glyph?.strokes.length ?? 0
    setDone((d) => Math.max(0, Math.min(total, d + delta)))
  }

  if (missing) return <div className="tiny faint center">Bu karakter için çizgi verisi yok.</div>
  if (!glyph) return <div className="stroke-box" style={{ height }} />

  const unit = glyph.unit
  const w = unit * glyph.boxes
  const total = glyph.strokes.length
  const nextPath = done < total ? paths.current[done] : null

  return (
    <div className="stack-sm">
      <div className="stroke-box" style={{ height }}>
        <svg viewBox={`0 0 ${w} ${unit}`} className="stroke-svg" role="img" aria-label={`${char} çizgi sırası`}>
          {Array.from({ length: glyph.boxes }, (_, b) => {
            const ox = b * unit
            return (
              <g key={b} className="stroke-guide">
                <rect x={ox + 1.5} y={1.5} width={unit - 3} height={unit - 3} rx={5} />
                <line x1={ox + unit / 2} y1={2} x2={ox + unit / 2} y2={unit - 2} />
                <line x1={ox + 2} y1={unit / 2} x2={ox + unit - 2} y2={unit / 2} />
              </g>
            )
          })}

          {/* Alt katman: karakterin tamamı, hep soluk — nereye gittiğini görürsün */}
          {glyph.strokes.map((s, i) => (
            <path
              key={`g${i}`}
              d={s.d}
              transform={s.ox ? `translate(${s.ox} 0)` : undefined}
              className="stroke stroke--ghost"
            />
          ))}

          {/* Üst katman: yazılmış çizgiler */}
          {glyph.strokes.map((s, i) => {
            const hidden = i > done || (i === done && !playing)
            return (
              <path
                key={`i${i}`}
                ref={(el) => {
                  paths.current[i] = el
                }}
                d={s.d}
                transform={s.ox ? `translate(${s.ox} 0)` : undefined}
                className="stroke stroke--ink"
                style={hidden ? { visibility: 'hidden' } : undefined}
              />
            )
          })}

          {!playing && nextPath && <StartDot path={nextPath} ox={glyph.strokes[done].ox} />}

          {showNumbers &&
            glyph.labels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} className={`stroke-num${i < done ? ' is-done' : ''}`}>
                {i + 1}
              </text>
            ))}

          <circle ref={tip} r={4} className="stroke-tip" style={{ opacity: 0 }} />
        </svg>
      </div>

      <div className="row-wrap" style={{ gap: 6 }}>
        <button className="btn btn--sm btn--primary" onClick={playing ? stop : play}>
          <Icon name={playing ? 'pause' : 'play'} size={15} />
          {playing ? 'Dur' : 'Çizimi izle'}
        </button>
        <button className="btn btn--sm btn--ghost" onClick={() => step(-1)} disabled={done === 0} aria-label="Önceki çizgi">
          <Icon name="left" size={15} />
        </button>
        <span className="tiny dim" style={{ minWidth: 46, textAlign: 'center' }}>
          {done} / {total}
        </span>
        <button className="btn btn--sm btn--ghost" onClick={() => step(1)} disabled={done >= total} aria-label="Sonraki çizgi">
          <Icon name="right" size={15} />
        </button>
        <div className="spacer" />
        <button className={`btn btn--sm btn--ghost${slow ? ' is-on' : ''}`} onClick={() => setSlow((s) => !s)}>
          <Icon name={slow ? 'turtle' : 'gauge'} size={15} />
          {slow ? 'Yavaş' : 'Normal'}
        </button>
        <button
          className={`btn btn--sm btn--ghost${showNumbers ? ' is-on' : ''}`}
          onClick={() => setShowNumbers((n) => !n)}
        >
          №
        </button>
      </div>

      <div className="tiny faint">
        ‹ › ile çizgi çizgi ilerle. Halka çizginin <b>başladığı</b> yeri, koşan nokta ise kalemin <b>yönünü</b> gösterir.
      </div>
    </div>
  )
}

/** Sıradaki çizginin başlangıcında duran halka. */
function StartDot({ path, ox }: { path: SVGPathElement; ox: number }) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const p = path.getPointAtLength(0)
    setPt({ x: p.x + ox, y: p.y })
  }, [path, ox])
  if (!pt) return null
  return <circle cx={pt.x} cy={pt.y} r={5} className="stroke-start" />
}
