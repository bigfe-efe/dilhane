import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Lang } from '@/types'
import { TopBar } from '@/components/ui'
import { LANG_TR, GRAMMAR } from '@/content'

export default function GrammarPage() {
  const l: Lang = 'ja'
  const [q, setQ] = useState('')

  const points = GRAMMAR.filter((p) => {
    if (!q.trim()) return true
    const s = q.toLowerCase()
    return (
      p.title.toLowerCase().includes(s) ||
      p.summaryTr.toLowerCase().includes(s) ||
      p.patterns.some((x) => x.toLowerCase().includes(s))
    )
  })

  const levels = [...new Set(points.map((p) => p.level))]
  /** Japoncada Genki ders numarasına göre grupla — sıra öğrenme sırasıdır. */
  const genkiGroups = [...new Set(points.map((p) => p.genki).filter((n): n is number => n !== undefined))].sort(
    (a, b) => a - b,
  )
  const [byGenki, setByGenki] = useState(l === 'ja')

  return (
    <>
      <TopBar title={`${LANG_TR} dilbilgisi`} sub={`${points.length} konu`} back="/" />

      <div className={`page stack-lg lang-${l}`}>
        <input
          className="field"
          placeholder="Konu ara (ör. geçmiş zaman, te formu, passive)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {l === 'ja' && genkiGroups.length > 0 && (
          <div className="row">
            <span className="tiny dim" style={{ flex: 1 }}>
              {byGenki ? 'Genki müfredat sırasına göre dizili' : 'JLPT seviyesine göre dizili'}
            </span>
            <button className="btn btn--sm btn--ghost" onClick={() => setByGenki((v) => !v)}>
              {byGenki ? 'Seviyeye göre' : 'Genki sırasına göre'}
            </button>
          </div>
        )}

        {byGenki &&
          genkiGroups.map((gn) => (
            <div key={`g${gn}`} className="stack-sm">
              <div className="row">
                <h2>{gn === 0 ? 'Genki: あいさつ' : `Genki ${gn}. ders`}</h2>
                <div className="spacer" />
                <span className="tiny faint">{points.filter((p) => p.genki === gn).length} konu</span>
              </div>
              {points
                .filter((p) => p.genki === gn)
                .map((p) => (
                  <Link key={p.id} to={`/grammar//${p.id}`} className="card card--link">
                    <div className="row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="card-title">{p.title}</div>
                        <div className="card-sub">{p.summaryTr}</div>
                        <div className="row-wrap" style={{ marginTop: 7 }}>
                          {p.patterns.slice(0, 2).map((pt) => (
                            <span key={pt} className="badge ja">
                              {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="dim">›</span>
                    </div>
                  </Link>
                ))}
            </div>
          ))}

        {!byGenki && levels.map((lv) => (
          <div key={lv} className="stack-sm">
            <div className="row">
              <h2>{lv}</h2>
              <div className="spacer" />
              <span className="tiny faint">{points.filter((p) => p.level === lv).length} konu</span>
            </div>
            {points
              .filter((p) => p.level === lv)
              .map((p) => (
                <Link key={p.id} to={`/grammar//${p.id}`} className="card card--link">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title">{p.title}</div>
                      <div className="card-sub">{p.summaryTr}</div>
                      <div className="row-wrap" style={{ marginTop: 7 }}>
                        {p.patterns.slice(0, 2).map((pt) => (
                          <span key={pt} className="badge ja">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="dim">›</span>
                  </div>
                </Link>
              ))}
          </div>
        ))}

        {points.length === 0 && (
          <div className="empty">
            <div>Aramanla eşleşen konu yok.</div>
          </div>
        )}

        <div className="card">
          <div className="card-title">Not</div>
          <div className="card-sub">
            {l === 'ja'
              ? 'Japonca dilbilgisi Türkçeye İngilizceden daha yakındır: yüklem sonda, ekler kelimenin arkasında. Bu benzerliği kullan.'
              : 'B2 konularında açıklamanın İngilizcesini de bulacaksın — hedef dilde düşünmeye alışmak için önce onu okumayı dene.'}
          </div>
        </div>
      </div>
    </>
  )
}
