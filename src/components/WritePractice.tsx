import { useState } from 'react'
import { Icon } from './icons'
import { DrawCanvas } from './DrawCanvas'
import { checkDrawing, type CheckResult, type Point } from '@/lib/stroke-check'
import { ensureStrokeData } from '@/lib/strokes'

// Çizim + değerlendirme.
//
// Tuval tek başına geri bildirim vermiyordu: doğru yazdın mı bilmeden
// çiziyordun. Burada çizim, karakterin gerçek çizgi verisiyle karşılaştırılıp
// çizgi sayısı / sırası / yönü hakkında somut geri bildirim veriliyor.

export function WritePractice({ char, showGhostDefault = true }: { char: string; showGhostDefault?: boolean }) {
  const [ghost, setGhost] = useState(showGhostDefault)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [nonce, setNonce] = useState(0)

  const check = async () => {
    await ensureStrokeData(char)
    setResult(checkDrawing(strokes, char))
  }

  const reset = () => {
    setResult(null)
    setStrokes([])
    setNonce((n) => n + 1)
  }

  const drawn = strokes.filter((s) => s.length > 1).length

  return (
    <div className="stack-sm">
      <div className="row">
        <span className="tiny dim" style={{ flex: 1 }}>
          {ghost ? 'Şablonun üzerinden geç.' : 'Şablon kapalı — tek başına dene.'}
        </span>
        <button className="btn btn--sm btn--ghost" onClick={() => setGhost((g) => !g)}>
          {ghost ? 'Şablonu gizle' : 'Şablonu göster'}
        </button>
      </div>

      <DrawCanvas key={`${char}-${nonce}`} ghost={char} showGhost={ghost} onStrokesUpdate={setStrokes} />

      <div className="row">
        <button className="btn btn--sm btn--primary" onClick={check} disabled={drawn === 0}>
          <Icon name="check" size={15} />
          Kontrol et
        </button>
        {result && (
          <button className="btn btn--sm btn--ghost" onClick={reset}>
            Yeniden dene
          </button>
        )}
        <div className="spacer" />
        <span className="tiny faint">{drawn} çizgi</span>
      </div>

      {result && (
        <div className={`feedback feedback--${result.tone === 'ok' ? 'ok' : result.tone === 'warn' ? 'info' : 'bad'}`}>
          <div className="row" style={{ marginBottom: 4 }}>
            <span className="bold" style={{ flex: 1 }}>
              {result.score} / 100
            </span>
            <span className="tiny">
              {result.drawnStrokes} / {result.expectedStrokes} çizgi
            </span>
          </div>
          <div className="small">{result.summary}</div>

          {result.strokes.some((s) => !s.ok) && (
            <ul className="tight tiny" style={{ marginTop: 6 }}>
              {result.strokes
                .filter((s) => !s.ok)
                .map((s) => (
                  <li key={s.index}>
                    {s.index + 1}. çizgi — {s.issue}
                  </li>
                ))}
            </ul>
          )}

          <div className="tiny faint" style={{ marginTop: 6 }}>
            Değerlendirme çizgi sayısı, sırası ve yönüne bakar; güzelliğe değil. Parmakla çizimde küçük sapmalar
            normaldir.
          </div>
        </div>
      )}
    </div>
  )
}
