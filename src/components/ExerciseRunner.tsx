import { useState } from 'react'
import type { Exercise } from '@/types'
import { ExerciseView } from './Exercise'
import { bumpStat } from '@/db/db'

/**
 * Bir alıştırma dizisini sırayla çalıştırır.
 *
 * Ünite testi ve metin soruları aynı akışı istiyor: sırayla sor, doğruyu
 * say, bitince sonucu bildir. Ders oynatıcısı bunu kendi içinde yapıyordu
 * ama oradaki sürüm ders ilerlemesine, tekrar kuyruğuna ve kart üretimine
 * bağlı; ünite için gereğinden ağır. Burada yalnızca soru–cevap–sonuç var.
 */
export function ExerciseRunner({
  list,
  onFinish,
  onCancel,
}: {
  list: Exercise[]
  onFinish: (correct: number, total: number) => void
  onCancel?: () => void
}) {
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)

  const ex = list[i]
  if (!ex) return null

  return (
    <div className="stack">
      <div className="row tiny faint">
        <span>
          {i + 1} / {list.length}
        </span>
        <div className="spacer" />
        <span>{correct} doğru</span>
        {onCancel && (
          <button className="btn btn--sm btn--ghost" onClick={onCancel}>
            Bırak
          </button>
        )}
      </div>

      <div className="bar">
        <i style={{ width: `${(i / list.length) * 100}%` }} />
      </div>

      <ExerciseView
        exercise={ex}
        onDone={(ok) => {
          const nextCorrect = correct + (ok ? 1 : 0)
          setCorrect(nextCorrect)
          bumpStat({ reviews: 1, correct: ok ? 1 : 0, ja: 1 })
          if (i + 1 < list.length) setI(i + 1)
          else onFinish(nextCorrect, list.length)
        }}
      />
    </div>
  )
}
