import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, SpeakBtn, TopBar } from '@/components/ui'
import { Markdown } from '@/lib/md'
import { GRAMMAR_BY_ID } from '@/content'
import { ensureCards } from '@/db/db'

export default function GrammarDetail() {
  const { id, lang } = useParams<{ id: string; lang: string }>()
  const p = id ? GRAMMAR_BY_ID.get(id) : undefined
  const [showEn, setShowEn] = useState(false)
  const [added, setAdded] = useState(false)

  if (!p) {
    return (
      <>
        <TopBar title="Konu bulunamadı" back />
        <div className="page">
          <Link to={`/grammar/${lang ?? 'ja'}`} className="btn btn--block">
            Listeye dön
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={p.title}
        sub={p.level}
        back={`/grammar/${p.lang}`}
        right={<Badge tone={p.lang}>{p.lang === 'ja' ? '日本語' : 'English'}</Badge>}
      />

      <div className={`page stack-lg lang-${p.lang}`}>
        <div className="card card--pad-lg">
          <div className="card-sub">{p.summaryTr}</div>
          <div className="row-wrap" style={{ marginTop: 12 }}>
            {p.patterns.map((pt) => (
              <span key={pt} className="badge badge--accent ja" style={{ fontSize: '0.86rem', padding: '6px 12px' }}>
                {pt}
              </span>
            ))}
          </div>
        </div>

        {p.explanationEn && (
          <div className="row">
            <button className={`chip${!showEn ? ' active' : ''}`} onClick={() => setShowEn(false)}>
              Türkçe anlatım
            </button>
            <button className={`chip${showEn ? ' active' : ''}`} onClick={() => setShowEn(true)}>
              In English
            </button>
          </div>
        )}

        <Markdown text={showEn && p.explanationEn ? p.explanationEn : p.explanationTr} />

        <div className="stack-sm">
          <h2>Örnekler</h2>
          {p.examples.map((ex, i) => (
            <div key={i} className="card">
              <div className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={p.lang === 'ja' ? 'ja' : ''} style={{ fontSize: '1.08rem' }}>
                    {ex.text}
                  </div>
                  {ex.reading && <div className="reading tiny">{ex.reading}</div>}
                  <div className="small dim" style={{ marginTop: 3 }}>
                    {ex.tr}
                  </div>
                </div>
                <SpeakBtn text={ex.text} lang={p.lang} size="sm" reading={ex.reading} />
              </div>
            </div>
          ))}
        </div>

        {p.pitfalls?.length ? (
          <div className="card" style={{ borderColor: 'var(--warn)' }}>
            <div className="card-title" style={{ color: 'var(--warn)' }}>
              Sık yapılan hatalar
            </div>
            <div className="stack-sm" style={{ marginTop: 8 }}>
              {p.pitfalls.map((x, i) => (
                <div key={i} className="small">
                  • {x}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {p.related?.length ? (
          <div className="stack-sm">
            <h3>İlgili konular</h3>
            {p.related.map((r) => {
              const rel = GRAMMAR_BY_ID.get(r)
              if (!rel) return null
              return (
                <Link key={r} to={`/grammar/${rel.lang}/${rel.id}`} className="card card--link">
                  <div className="row">
                    <div className="card-title" style={{ flex: 1 }}>
                      {rel.title}
                    </div>
                    <span className="dim">›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : null}

        <button
          className="btn btn--lang btn--block"
          disabled={added}
          onClick={async () => {
            await ensureCards([{ kind: 'grammar', refId: p.id, lang: p.lang }])
            setAdded(true)
          }}
        >
          {added ? 'Tekrar listesine eklendi' : 'Tekrar listesine ekle'}
        </button>
      </div>
    </>
  )
}
