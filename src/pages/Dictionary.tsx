import { useMemo, useState } from 'react'
import { toRomaji } from 'wanakana'
import type { Vocab } from '@/types'
import { Badge, Chips, Empty, Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { VOCAB } from '@/content'
import { VOCAB_JA_THEMES } from '@/content/ja/vocab'
import { conjugateVerb, detectGroup } from '@/lib/conjugate-ja'
import { cardId, db, ensureCards } from '@/db/db'
import { useCardStates } from '@/db/hooks'

export default function DictionaryPage() {
  const [q, setQ] = useState('')
  const [theme, setTheme] = useState('all')
  const [open, setOpen] = useState<Vocab | null>(null)
  const states = useCardStates('vocab')

  const themes = useMemo(
    () => [{ id: 'all', label: 'Tümü' }, ...VOCAB_JA_THEMES.map((t) => ({ id: t.id, label: t.title }))],
    [],
  )

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    return VOCAB.filter((v) => {
      if (theme !== 'all' && !v.tags?.includes(theme)) return false
      if (!s) return true
      return (
        v.term.toLowerCase().includes(s) ||
        v.tr.toLowerCase().includes(s) ||
        (v.reading?.toLowerCase().includes(s) ?? false) ||
        (v.reading ? toRomaji(v.reading).includes(s) : false)
      )
    })
  }, [q, theme])

  return (
    <>
      <TopBar title="Sözlük" sub={`${results.length} kelime`} />

      <div className="page stack lang-ja">
        <div className="searchbar">
          <Icon name="search" size={17} />
          <input
            className="field field--bare"
            placeholder="Kelime, okunuş, romaji veya Türkçe ara"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <Chips items={themes} value={theme} onChange={setTheme} />

        <div className="stack-sm">
          {results.map((v) => {
            const st = states.get(v.id)
            return (
              <button key={v.id} className="card card--link" style={{ textAlign: 'left' }} onClick={() => setOpen(v)}>
                <div className="row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ja" style={{ fontSize: '1.14rem', fontWeight: 620 }}>
                      {v.term}
                    </div>
                    {v.reading && v.reading !== v.term && <div className="reading tiny">{v.reading}</div>}
                    <div className="small dim">{v.tr}</div>
                  </div>
                  {st?.phase === 'review' && <Badge tone="ok">bilindi</Badge>}
                  {st && st.phase !== 'review' && st.phase !== 'new' && <Badge tone="warn">öğreniliyor</Badge>}
                </div>
              </button>
            )
          })}
          {results.length === 0 && <Empty icon="search" text="Bu aramaya uyan kelime yok." />}
        </div>
      </div>

      {open && <VocabSheet v={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function VocabSheet({ v, onClose }: { v: Vocab; onClose: () => void }) {
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState(false)

  const isJaVerb = v.pos?.includes('fiil') ?? false
  const conj = isJaVerb && v.reading ? conjugateVerb(v.term, v.reading) : null
  const group = isJaVerb && v.reading ? detectGroup(v.term, v.reading) : null

  return (
    <Sheet onClose={onClose}>
      <div className="stack lang-ja">
        <div className="center stack-sm">
          <div className="ja-big">{v.term}</div>
          {v.reading && v.reading !== v.term && <div className="reading" style={{ fontSize: '1.05rem' }}>{v.reading}</div>}
          <div className="romaji">{v.reading ? toRomaji(v.reading) : ''}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 6 }}>{v.tr}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <SpeakBtn text={v.term} lang={v.lang} reading={v.reading} />
            {v.pos && <Badge>{v.pos}</Badge>}
            {v.level && <Badge tone="ja">{v.level}</Badge>}
          </div>
        </div>

        {v.examples?.length ? (
          <div className="stack-sm">
            <h3>Örnekler</h3>
            {v.examples.map((ex, i) => (
              <div key={i} className="card">
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <div className="ja">{ex.text}</div>
                    {ex.reading && <div className="reading tiny">{ex.reading}</div>}
                    <div className="small dim">{ex.tr}</div>
                  </div>
                  <SpeakBtn text={ex.text} lang={v.lang} size="sm" reading={ex.reading} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {conj && group && (
          <div className="stack-sm">
            <div className="row">
              <h3>Çekim</h3>
              <div className="spacer" />
              <Badge tone="ja">{group}</Badge>
            </div>
            <div className="card">
              <div className="tbl-wrap">
                <table style={{ width: '100%', fontSize: '0.86rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {(['masu', 'masen', 'mashita', 'te', 'nai', 'ta', 'potential', 'tai'] as const).map((f) => (
                      <tr key={f}>
                        <td style={{ padding: '5px 6px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{FORM_TR[f]}</td>
                        <td className="ja" style={{ padding: '5px 6px', fontWeight: 600 }}>
                          {conj.forms[f]?.term}
                        </td>
                        <td className="reading tiny" style={{ padding: '5px 6px' }}>
                          {conj.forms[f]?.reading}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <a className="tiny dim" href="#/verbs" style={{ textDecoration: 'underline' }}>
              Tam çekim tablosunu aç
            </a>
          </div>
        )}

        <div className="stack-sm">
          <h3>Kendi notun</h3>
          <textarea
            className="field"
            style={{ minHeight: 74 }}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setSavedNote(false)
            }}
            placeholder="Hatırlatıcı, çağrışım, kendi cümlen…"
          />
          <button
            className="btn btn--sm"
            onClick={async () => {
              await db.notes.put({ refId: v.id, text: note, updatedAt: Date.now() })
              setSavedNote(true)
            }}
            disabled={!note.trim() || savedNote}
          >
            {savedNote ? 'Kaydedildi' : 'Notu kaydet'}
          </button>
        </div>

        <div className="row">
          <button
            className="btn btn--primary"
            style={{ flex: 1 }}
            onClick={async () => {
              await ensureCards([
                { kind: 'vocab', refId: v.id, lang: v.lang },
                { kind: 'vocab', refId: v.id, lang: v.lang, reverse: true },
              ])
              onClose()
            }}
          >
            Tekrar listesine ekle
          </button>
          <button
            className="btn btn--ghost"
            onClick={async () => {
              await db.cards.bulkDelete([cardId('vocab', v.id), cardId('vocab', v.id, true)])
              onClose()
            }}
          >
            Sıfırla
          </button>
        </div>
      </div>
    </Sheet>
  )
}

const FORM_TR: Record<string, string> = {
  masu: 'ます (kibar)',
  masen: 'olumsuz',
  mashita: 'geçmiş',
  te: 'て formu',
  nai: 'ない (sade olumsuz)',
  ta: 'た (sade geçmiş)',
  potential: 'yeterlilik',
  tai: 'istek',
}
