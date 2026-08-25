import { useState } from 'react'
import { toRomaji } from 'wanakana'
import type { KanjiChar } from '@/types'
import { Badge, Chips, Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { WritePractice } from '@/components/WritePractice'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KANJI_BY_CHAR, KANJI_N5, KANJI_SETS } from '@/content/ja/kanji-n5'
import { useCardStates } from '@/db/hooks'
import { cardId, db, ensureCards } from '@/db/db'

export default function KanjiPage() {
  const [set, setSet] = useState<string>(KANJI_SETS[0].id)
  const [open, setOpen] = useState<KanjiChar | null>(null)
  const states = useCardStates('kanji')

  const current = KANJI_SETS.find((s) => s.id === set)!
  const chars = current.chars.map((c) => KANJI_BY_CHAR.get(c)).filter(Boolean) as KanjiChar[]
  const known = KANJI_N5.filter((k) => states.get(k.char)?.phase === 'review').length

  return (
    <>
      <TopBar title="Kanji 漢字" sub={`${known} / ${KANJI_N5.length} öğrenildi (N5)`} back="/ja" />

      <div className="page stack-lg lang-ja">
        <Chips items={KANJI_SETS.map((s) => ({ id: s.id, label: s.title }))} value={set} onChange={setSet} />

        <div className="grid grid-kana">
          {chars.map((k) => {
            const st = states.get(k.char)
            const cls = st?.phase === 'review' ? ' is-known' : st && st.phase !== 'new' ? ' is-learning' : ''
            return (
              <button key={k.char} className={`kana-cell${cls}`} onClick={() => setOpen(k)}>
                <span className="c" style={{ fontSize: '2rem' }}>
                  {k.char}
                </span>
                <span className="r">{k.meaningsTr[0]}</span>
              </button>
            )
          })}
        </div>

        <div className="card stack-sm">
          <div className="card-title">on'yomi ve kun'yomi</div>
          <div className="card-sub">
            Kanjiyi tek başına ezberlemek yerine <span className="bold">içinde geçtiği kelimeyle</span> öğren. Genel
            eğilim: kanji tek başına veya hiragana ekiyle geliyorsa <span className="bold">kun</span>, başka bir
            kanjiyle birleşmişse <span className="bold">on</span> okunur.
          </div>
        </div>
      </div>

      {open && <KanjiSheet k={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function KanjiSheet({ k, onClose }: { k: KanjiChar; onClose: () => void }) {

  return (
    <Sheet onClose={onClose}>
      <div className="stack lang-ja">
        <div className="ja-huge">{k.char}</div>

        <div className="center stack-sm">
          <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>{k.meaningsTr.join(' · ')}</div>
          <div className="tiny faint">{k.meaningsEn.join(', ')}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <SpeakBtn text={k.char} lang="ja" reading={(k.kun[0] ?? k.on[0] ?? '').replace(/-/g, '')} />
            <Badge>{k.strokes} çizgi</Badge>
            <Badge tone="ja">{k.jlpt}</Badge>
            {k.grade && <Badge>{k.grade}. sınıf</Badge>}
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <div className="tiny faint">on'yomi (Çince kökenli)</div>
            <div className="ja" style={{ fontSize: '1.15rem' }}>
              {k.on.join('・') || '—'}
            </div>
            {k.on.length > 0 && <div className="romaji">{k.on.map((o) => toRomaji(o)).join(', ')}</div>}
          </div>
          <div className="card">
            <div className="tiny faint">kun'yomi (Japonca)</div>
            <div className="ja" style={{ fontSize: '1.15rem' }}>
              {k.kun.join('・') || '—'}
            </div>
            {k.kun.length > 0 && <div className="romaji">{k.kun.map((o) => toRomaji(o.replace('-', ''))).join(', ')}</div>}
          </div>
        </div>

        {k.words.length > 0 && (
          <div className="stack-sm">
            <h3>Örnek kelimeler</h3>
            {k.words.map((w) => (
              <div key={w.term} className="card">
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <div className="ja" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                      {w.term}
                    </div>
                    <div className="reading">{w.reading}</div>
                    <div className="romaji">{toRomaji(w.reading)}</div>
                    <div className="small dim" style={{ marginTop: 3 }}>
                      {w.tr}
                    </div>
                  </div>
                  <SpeakBtn text={w.term} lang="ja" size="sm" reading={w.reading} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="stack-sm">
          <h3>Çizgi sırası</h3>
          <StrokeOrder char={k.char} height={230} />
        </div>

        <div className="stack-sm">
          <h3>Yazarak çalış</h3>
          <WritePractice key={k.char} char={k.char} />
          <div className="tiny faint center">
            Genel kural: yukarıdan aşağı, soldan sağa; yatay çizgi dikeyden önce gelir. Bu karakterin kendi sırası için
            yukarıdaki bölüme bak — {k.strokes} çizgi.
          </div>
        </div>

        <div className="row">
          <button
            className="btn btn--primary"
            style={{ flex: 1 }}
            onClick={async () => {
              await ensureCards([{ kind: 'kanji', refId: k.char, lang: 'ja' }])
              onClose()
            }}
          >
            Tekrar listesine ekle
          </button>
          <button
            className="btn btn--ghost"
            onClick={async () => {
              await db.cards.delete(cardId('kanji', k.char))
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
