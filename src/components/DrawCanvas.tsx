import { useEffect, useRef, useState } from 'react'
import { Icon } from './icons'

// Karakter yazma tuvali. Parmakla (dokunmatik) veya fareyle çizilir.
// Arkada soluk bir "hayalet" karakter durur; üzerinden geçerek yazı öğrenilir.

export interface DrawCanvasHandle {
  clear: () => void
  undo: () => void
  strokeCount: number
}

export function DrawCanvas({
  ghost,
  showGhost = true,
  showGrid = true,
  onStrokesChange,
  onStrokesUpdate,
}: {
  ghost?: string
  showGhost?: boolean
  showGrid?: boolean
  onStrokesChange?: (count: number) => void
  /** Ham çizgiler — değerlendirme yapmak isteyen taraf için */
  onStrokesUpdate?: (strokes: { x: number; y: number }[][]) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<{ x: number; y: number }[][]>([])
  const current = useRef<{ x: number; y: number }[] | null>(null)
  const [count, setCount] = useState(0)

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(6, canvas.width * 0.035)
    ctx.strokeStyle = '#e8ebf0'
    for (const s of [...strokes.current, ...(current.current ? [current.current] : [])]) {
      if (s.length < 2) {
        if (s.length === 1) {
          ctx.beginPath()
          ctx.arc(s[0].x, s[0].y, ctx.lineWidth / 2, 0, Math.PI * 2)
          ctx.fillStyle = '#e8ebf0'
          ctx.fill()
        }
        continue
      }
      ctx.beginPath()
      ctx.moveTo(s[0].x, s[0].y)
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y)
      ctx.stroke()
    }
  }

  // Ekran çözünürlüğüne göre tuvali ölçekle
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      redraw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    current.current = [pos(e)]
    redraw()
  }

  const move = (e: React.PointerEvent) => {
    if (!current.current) return
    current.current.push(pos(e))
    redraw()
  }

  const up = () => {
    if (!current.current) return
    strokes.current.push(current.current)
    current.current = null
    const c = strokes.current.length
    setCount(c)
    onStrokesChange?.(c)
    onStrokesUpdate?.(strokes.current.map((s) => [...s]))
    redraw()
  }

  const clear = () => {
    strokes.current = []
    current.current = null
    setCount(0)
    onStrokesChange?.(0)
    onStrokesUpdate?.([])
    redraw()
  }

  const undo = () => {
    strokes.current.pop()
    const c = strokes.current.length
    setCount(c)
    onStrokesChange?.(c)
    onStrokesUpdate?.(strokes.current.map((s) => [...s]))
    redraw()
  }

  return (
    <div className="stack-sm">
      <div className="canvas-wrap">
        {showGrid && (
          <svg className="canvas-guide" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="0" x2="50" y2="100" stroke="#2a2f3a" strokeWidth="0.4" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#2a2f3a" strokeWidth="0.4" strokeDasharray="3 3" />
          </svg>
        )}
        {showGhost && ghost && <div className="canvas-ghost">{ghost}</div>}
        <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      </div>
      <div className="row">
        <button className="btn btn--sm btn--ghost" onClick={undo} disabled={!count}>
          <Icon name="undo" size={15} />
          Geri al
        </button>
        <button className="btn btn--sm btn--ghost" onClick={clear} disabled={!count}>
          Temizle
        </button>
        <div className="spacer" />
        <span className="tiny faint">{count} çizgi</span>
      </div>
    </div>
  )
}
