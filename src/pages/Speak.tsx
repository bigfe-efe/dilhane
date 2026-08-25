import { useMemo, useState } from 'react'
import type { Exercise, Lang } from '@/types'
import { Chips, TopBar } from '@/components/ui'
import { ExerciseView } from '@/components/Exercise'
import { LANG_TR, GRAMMAR, VOCAB } from '@/content'
import { sttAvailable } from '@/lib/stt'
import { bumpStat } from '@/db/db'

type Source = 'words' | 'sentences' | 'grammar'

/** Telaffuz çalışması: kelime, cümle veya dilbilgisi örnekleri üzerinden. */
export default function SpeakPage() {
  const l: Lang = 'ja'
  const [source, setSource] = useState<Source>('words')
  const [i, setI] = useState(0)
  const [score, setScore] = useState({ done: 0, ok: 0 })

  const items = useMemo<Exercise[]>(() => {
    const mk = (text: string, tr: string, reading?: string, idx = 0): Exercise => ({
      id: `speak-${l}-${source}-${idx}`,
      type: 'speak',
      prompt: 'Mikrofona bas ve söyle. %70 ve üzeri başarılı sayılır.',
      text,
      reading,
      lang: l,
      tr,
      skill: 'speaking',
    })

    if (source === 'words') {
      return VOCAB.map((v, idx) => mk(v.term, v.tr, l === 'ja' ? v.reading : undefined, idx))
    }
    if (source === 'sentences') {
      return VOCAB
        .flatMap((v) => v.examples ?? [])
        .map((ex, idx) => mk(ex.text, ex.tr, ex.reading, idx))
    }
    return GRAMMAR
      .flatMap((g) => g.examples)
      .map((ex, idx) => mk(ex.text, ex.tr, ex.reading, idx))
  }, [l, source])

  const ex = items[i % Math.max(1, items.length)]

  return (
    <>
      <TopBar
        title={`Konuşma · ${LANG_TR}`}
        sub={items.length ? `${i + 1} / ${items.length}` : undefined}
        back="/"
      />

      <div className={`page stack lang-${l}`}>
        <Chips
          items={[
            { id: 'words', label: 'Kelimeler' },
            { id: 'sentences', label: 'Cümleler' },
            { id: 'grammar', label: 'Dilbilgisi örnekleri' },
          ]}
          value={source}
          onChange={(s) => {
            setSource(s as Source)
            setI(0)
          }}
        />

        {!sttAvailable() && (
          <div className="feedback feedback--info">
            Bu tarayıcı otomatik telaffuz puanlamayı desteklemiyor. Yine de kendi sesini kaydedip model sesle
            karşılaştırabilirsin. Puanlama için Chrome veya Edge kullan (internet bağlantısı gerekir).
          </div>
        )}

        {score.done > 0 && (
          <div className="row small dim">
            <span>
              Bu oturum: {score.ok} / {score.done} başarılı
            </span>
            <div className="spacer" />
            <button className="btn btn--sm btn--ghost" onClick={() => setScore({ done: 0, ok: 0 })}>
              Sıfırla
            </button>
          </div>
        )}

        {ex ? (
          <ExerciseView
            exercise={ex}
            onDone={(ok) => {
              setScore((s) => ({ done: s.done + 1, ok: s.ok + (ok ? 1 : 0) }))
              bumpStat({ reviews: 1, correct: ok ? 1 : 0, [l]: 1 })
              setI((v) => v + 1)
            }}
          />
        ) : (
          <div className="empty">Bu kategoride örnek yok.</div>
        )}

        <div className="row">
          <button className="btn btn--ghost" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
            ‹ Önceki
          </button>
          <div className="spacer" />
          <button className="btn btn--ghost" onClick={() => setI((v) => v + 1)}>
            Sonraki ›
          </button>
        </div>

        <div className="card">
          <div className="card-title">Telaffuz ipuçları</div>
          <div className="stack-sm small dim" style={{ marginTop: 8 }}>
            {l === 'ja' ? (
              <>
                <div>• Japoncada her hece <span className="bold">eşit uzunlukta</span> söylenir; Türkçedeki gibi vurgu yığılmaz.</div>
                <div>• Uzun sesliler gerçekten iki hece uzunluğundadır: おばさん (teyze) ≠ おばあさん (nine).</div>
                <div>• Küçük っ bir duraklamadır ve hece sayılır: きって = kit‑te.</div>
                <div>• ん kendi başına bir hecedir; hızlıca geçiştirme.</div>
                <div>• Vurgu perde (pitch) ile yapılır: 箸 (çubuk) ve 橋 (köprü) aynı hecelerdir, perdesi farklıdır.</div>
              </>
            ) : (
              <>
                <div>• Türkçede olmayan sesler: <span className="bold">th</span> (think/this), <span className="bold">w</span> (water), kısa <span className="bold">ɪ</span> (ship ≠ sheep).</div>
                <div>• Kelime sonundaki sessizleri yutma: <span className="bold">worked</span>, <span className="bold">asked</span>.</div>
                <div>• Kelime vurgusu anlamı değiştirir: <span className="bold">RE</span>cord (isim) / re<span className="bold">CORD</span> (fiil).</div>
                <div>• Cümle vurgusu içerik kelimelerine düşer; edatlar ve yardımcı fiiller zayıflar.</div>
                <div>• "‑ed" üç farklı okunur: /t/, /d/, /ɪd/ — fiil tablosunda ayrıntısı var.</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
