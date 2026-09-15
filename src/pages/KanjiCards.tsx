import { useMemo, useState } from 'react'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KANJI_CARDS, KANJI_CARD_SETS, type KanjiCard } from '@/content/ja/kanji-cards'

// N5 kanji kartları.
//
// NEDEN AYRI SAYFA: Kanji sayfası küçük bir ızgara ve detay penceresi;
// çok çizgili karakterlerde (曜, 語, 聞) sayfayı büyütmeden çizgiler
// seçilmiyordu. Burada her kanji kendi büyük kartında, çizimi döngüde,
// öğrencinin kullandığı şablonla: anlam · onyomi · kunyomi · Latin ·
// örnekler · not.
//
// İleride bu kartlara özel sınav yapılacak; kart verisi o yüzden
// `kanji-cards.ts` içinde, sayfadan bağımsız duruyor.

const SET_KEY = 'kanji-kartlar:set'

function loadSet(): string {
  try {
    return localStorage.getItem(SET_KEY) ?? KANJI_CARD_SETS[0].id
  } catch {
    return KANJI_CARD_SETS[0].id
  }
}

export default function KanjiCardsPage() {
  const [set, setSetState] = useState<string>(loadSet)

  const setSet = (id: string) => {
    setSetState(id)
    try {
      localStorage.setItem(SET_KEY, id)
    } catch {
      /* kaydedilemezse de bu oturumda çalışsın */
    }
  }

  const liste = useMemo(
    () => (set === 'hepsi' ? KANJI_CARDS : KANJI_CARDS.filter((c) => c.setId === set)),
    [set],
  )

  return (
    <>
      <TopBar title="N5 kanji kartları" sub={`${KANJI_CARDS.length} kanji · yalnızca N5`} back="/calis" />

      <div className="page stack-lg lang-ja">
        <Chips
          items={[...KANJI_CARD_SETS, { id: 'hepsi', label: 'Hepsi' }]}
          value={set}
          onChange={setSet}
        />

        <div className="card stack-sm">
          <div className="small">
            Örneklerde yalnızca <b>bütün kanjileri N5 olan</b> kelimeler var — bir kanjiyi, onunla birleşen diğer
            N5 kanjileriyle birlikte öğrenirsin. Çizim, ekranda görünen kartta kendiliğinden döner.
          </div>
          <div className="tiny faint">
            Kunyomi'deki tire (た-べる): tireden sonrası kanjiden sonra hiragana ile yazılır → 食べる.
          </div>
        </div>

        <div className="kc-list">
          {liste.map((c) => (
            <KanjiCardView key={c.k.char} c={c} />
          ))}
        </div>
      </div>
    </>
  )
}

/** Kelimede o anki kanjiyi renklendirir */
function Marked({ term, char }: { term: string; char: string }) {
  return (
    <>
      {[...term].map((ch, i) =>
        ch === char ? (
          <span key={i} className="kc-hit">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  )
}

function KanjiCardView({ c }: { c: KanjiCard }) {
  const { k } = c
  const okunus = (k.kun[0] ?? k.on[0] ?? '').replace(/-/g, '')

  return (
    <article className="card kc">
      <header className="kc-head">
        <span className="kc-no tabular">{c.no}.</span>
        <h2 className="kc-title">
          <span className="ja">{k.char}</span> — {k.meaningsTr[0]}
        </h2>
        <div className="spacer" />
        <span className="tiny faint">{c.setTitle}</span>
        <SpeakBtn text={k.char} lang="ja" reading={okunus} />
      </header>

      <div className="kc-body">
        <div className="kc-stroke">
          <StrokeOrder char={k.char} height={280} autoPlay loop compact />
        </div>

        <dl className="kc-facts">
          <div className="kc-row">
            <dt>Anlam</dt>
            <dd>{k.meaningsTr.join(', ')}</dd>
          </div>
          <div className="kc-row">
            <dt>Onyomi</dt>
            <dd className="ja kc-kana">{k.on.join('・') || '—'}</dd>
          </div>
          {c.onLatin && (
            <div className="kc-row kc-row--sub">
              <dt>Latin</dt>
              <dd className="kc-latin">{c.onLatin}</dd>
            </div>
          )}
          <div className="kc-row">
            <dt>Kunyomi</dt>
            <dd className="ja kc-kana">{k.kun.join('・') || '—'}</dd>
          </div>
          {c.kunLatin && (
            <div className="kc-row kc-row--sub">
              <dt>Latin</dt>
              <dd className="kc-latin">{c.kunLatin}</dd>
            </div>
          )}
          <div className="kc-row kc-row--sub">
            <dt>Çizgi</dt>
            <dd>{k.strokes}</dd>
          </div>
        </dl>
      </div>

      <section className="kc-section">
        <h3>Örnekler</h3>
        <ul className="kc-ex">
          {c.examples.map((e) => (
            <li key={e.term}>
              <span className="ja kc-term">
                <Marked term={e.term} char={k.char} />
              </span>
              <span className="kc-read">
                （<span className="ja">{e.reading}</span> / {e.romaji}）
              </span>
              <span className="kc-tr">— {e.tr}</span>
              {e.others.length > 0 && <span className="kc-others ja">+ {e.others.join(' ')}</span>}
              <SpeakBtn text={e.term} lang="ja" size="sm" reading={e.reading} />
            </li>
          ))}
        </ul>
      </section>

      {c.note && (
        <section className="kc-section kc-note">
          <h3>Not</h3>
          <ul className="kc-pairs">
            {c.note.pairs.map(([t, r]) => (
              <li key={t}>
                <span className="ja">{t}</span> → <span className="ja">{r}</span>
              </li>
            ))}
          </ul>
          <p>{c.note.text}</p>
        </section>
      )}
    </article>
  )
}
