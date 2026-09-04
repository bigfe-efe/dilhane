import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Bar, RomajiText, Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { bumpStat, db, type Card } from '@/db/db'
import { useNote } from '@/db/hooks'
import { leechLevel, previewInterval, review, type Rating } from '@/lib/srs'
import { GRAMMAR_BY_ID, VOCAB_BY_ID } from '@/content'
import { KANA_BY_CHAR } from '@/content/ja/kana'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'

// Dört düğme "kartı ne kadar iyi hatırladın" sorusunun cevabıdır; sistem bir
// sonraki gösterim zamanını buna göre ayarlar. Düğmenin altındaki süre, o
// düğmeye basarsan kartı NE ZAMAN tekrar göreceğini söyler.
const RATINGS: { id: Rating; label: string; hint: string; cls: string }[] = [
  { id: 'again', label: 'Tekrar', hint: 'bilemedim', cls: 'btn--bad' },
  { id: 'hard', label: 'Zor', hint: 'zor çıkardım', cls: '' },
  { id: 'good', label: 'İyi', hint: 'normal', cls: 'btn--primary' },
  { id: 'easy', label: 'Kolay', hint: 'anında', cls: 'btn--ok' },
]

/** Puanlama nasıl çalışır — ilk kez kullananın anlaması için. */
const RATING_HELP: { label: string; when: string; effect: string }[] = [
  {
    label: 'Tekrar',
    when: 'Bilemedim, ya da yanlış hatırladım.',
    effect: 'Kart başa döner: bir dakika sonra ve bu oturumun sonunda yeniden çıkar. Öğrenilmiş bir kartta aralık yarıya iner.',
  },
  {
    label: 'Zor',
    when: 'Bildim ama zorlandım, uzun düşündüm.',
    effect: 'Aralık çok az uzar. Kartı sık görmeye devam edersin.',
  },
  {
    label: 'İyi',
    when: 'Normal sürede hatırladım. Çoğu zaman bu düğmeye basacaksın.',
    effect: 'Aralık normal ölçüde uzar: önce dakikalar, sonra günler, sonra haftalar.',
  },
  {
    label: 'Kolay',
    when: 'Düşünmeden, anında geldi.',
    effect: 'Aralık uzun bir sıçrama yapar. Gereksiz kullanırsan kartı unutacağın kadar geç görürsün — emin değilsen İyi de.',
  },
]

const SESSION_SIZE = 30

export default function ReviewPage() {
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [help, setHelp] = useState(false)
  const [stats, setStats] = useState({ done: 0, again: 0 })
  const shownAt = useRef(Date.now())

  const load = useCallback(async () => {
    const now = Date.now()
    const all = await db.cards.toArray()
    const due = all
      .filter((c) => !c.suspended && c.due <= now)
      // Öğrenme aşamasındakiler önce, sonra en uzun bekleyenler
      .sort((a, b) => {
        const pa = a.phase === 'new' ? 2 : a.phase === 'review' ? 1 : 0
        const pb = b.phase === 'new' ? 2 : b.phase === 'review' ? 1 : 0
        return pa - pb || a.due - b.due
      })
      .slice(0, SESSION_SIZE)
    setQueue(due)
    setIdx(0)
    setRevealed(false)
    shownAt.current = Date.now()
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const card = queue?.[idx]

  const rate = async (rating: Rating) => {
    if (!card) return
    const now = Date.now()
    const next = review(card, rating, now)
    await db.cards.put({ ...card, ...next })
    await db.reviews.add({
      cardId: card.id,
      lang: card.lang,
      kind: card.kind,
      rating,
      at: now,
      ms: now - shownAt.current,
      correct: rating === 'again' ? 0 : 1,
    })
    await bumpStat({ reviews: 1, correct: rating === 'again' ? 0 : 1, [card.lang]: 1 })

    setStats((s) => ({ done: s.done + 1, again: s.again + (rating === 'again' ? 1 : 0) }))

    // "Tekrar" denen kart oturumun sonuna geri konur
    if (rating === 'again' && queue) {
      const rest = [...queue]
      rest.splice(idx, 1)
      rest.push({ ...card, ...next })
      setQueue(rest)
      setRevealed(false)
      shownAt.current = Date.now()
      return
    }

    setIdx((i) => i + 1)
    setRevealed(false)
    shownAt.current = Date.now()
  }

  // Klavye kısayolları — masaüstünde hızlı tekrar için
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) setRevealed(true)
        else rate('good')
        return
      }
      if (!revealed) return
      const map: Record<string, Rating> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' }
      if (map[e.key]) rate(map[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (queue === null) {
    return (
      <>
        <TopBar title="Tekrar" />
        <div className="page">
          <div className="empty pulse">Kartlar yükleniyor…</div>
        </div>
      </>
    )
  }

  if (!card) {
    return (
      <>
        <TopBar title="Tekrar" />
        <div className="page stack-lg" style={{ paddingTop: 50 }}>
          <div className="center stack">
            <span className="result-mark"><Icon name={stats.done > 0 ? 'check' : 'seed'} size={30} /></span>
            <h1>{stats.done > 0 ? 'Oturum bitti' : 'Tekrar bekleyen kart yok'}</h1>
            <div className="dim small">
              {stats.done > 0
                ? `${stats.done} kart çalıştın${stats.again > 0 ? ` · ${stats.again} tanesi zorladı` : ''}`
                : 'Yeni ders tamamladıkça kartlar buraya düşer.'}
            </div>
          </div>
          {stats.again > 0 && (
            <div className="feedback feedback--info small">
              {stats.again} kartı hatırlayamadın. Aynı kartlar sürekli tekrar ediyorsa{' '}
              <Link to="/zorlandiklarim" className="link">
                Zorlandıkların
              </Link>{' '}
              bölümünde onlara kendi hatırlatıcını yazabilirsin.
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--block" onClick={load}>
              Yeniden kontrol et
            </button>
            <Link to="/lessons/ja" className="btn btn--ghost btn--block">
              Japonca dersleri
            </Link>
            <Link to="/lessons/en" className="btn btn--ghost btn--block">
              İngilizce dersleri
            </Link>
          </div>
        </div>
      </>
    )
  }

  const face = renderCard(card, revealed)

  return (
    <>
      <TopBar
        title="Tekrar"
        sub={`${idx + 1} / ${queue.length}`}
        right={<Badge tone={card.lang}>{card.lang === 'ja' ? '日本語' : 'English'}</Badge>}
      />
      <div style={{ padding: '0 var(--pad)' }}>
        <Bar value={idx} max={queue.length} />
      </div>

      <div className={`page stack-lg lang-${card.lang}`}>
        <div
          className="card card--pad-lg center"
          style={{ minHeight: 210, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}
          onClick={() => !revealed && setRevealed(true)}
        >
          {face.front}
          {revealed && (
            <>
              <div className="hr" style={{ width: '100%' }} />
              {face.back}
            </>
          )}
        </div>

        {revealed && <PersonalNote refId={card.refId} />}

        {revealed && leechLevel(card) !== 'none' && (
          <div className={`feedback feedback--${leechLevel(card) === 'leech' ? 'bad' : 'info'} small`}>
            <b>{leechLevel(card) === 'leech' ? 'Bu kartta takıldın. ' : 'Bu kartta zorlanıyorsun. '}</b>
            {card.lapses} kez unuttun. Aynı kartı tekrar tekrar görmek işe yaramıyorsa yöntemi değiştirmek gerekir —{' '}
            <Link to="/zorlandiklarim" className="link">
              kendi hatırlatıcını yaz
            </Link>
            .
          </div>
        )}

        {!revealed ? (
          <button className="btn btn--lang btn--block btn--lg" onClick={() => setRevealed(true)}>
            Göster
          </button>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {RATINGS.map((r) => (
              <button key={r.id} className={`btn ${r.cls} rate-btn`} onClick={() => rate(r.id)}>
                <span className="rate-label">{r.label}</span>
                <span className="rate-hint">{r.hint}</span>
                <span className="rate-when">{previewInterval(card, r.id)}</span>
              </button>
            ))}
          </div>
        )}

        {revealed && (
          <div className="tiny faint center" style={{ lineHeight: 1.5 }}>
            Süreler, o düğmeye basarsan kartı <b>ne zaman tekrar göreceğini</b> gösterir.
          </div>
        )}

        <div className="row tiny faint" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span>
            {card.phase === 'new'
              ? 'Yeni kart'
              : card.phase === 'review'
                ? `Öğrenildi · ${Math.round(card.interval)} günde bir`
                : 'Henüz öğreniliyor'}
          </span>
          <span>·</span>
          <span>Boşluk tuşu: göster, sonra “İyi”</span>
          <span>·</span>
          <button className="linkbtn" onClick={() => setHelp(true)}>
            Bu düğmeler ne demek?
          </button>
        </div>
      </div>

      {help && (
        <Sheet onClose={() => setHelp(false)}>
          <div className="stack">
            <div>
              <h3>Puanlama nasıl çalışır?</h3>
              <div className="card-sub" style={{ marginTop: 6, lineHeight: 1.6 }}>
                Bu bir <b>aralıklı tekrar</b> sistemi. Her kartı unutmak üzereyken göstermeye çalışır — çünkü
                hatırlamak için zorlandığın an, hafızaya en çok kazındığı andır. Sistem bunu bilemez, o yüzden
                <b> sen söylüyorsun</b>: kartı ne kadar kolay hatırladın?
              </div>
            </div>

            <div className="stack-sm">
              {RATING_HELP.map((h) => (
                <div key={h.label} className="card stack-sm">
                  <div className="card-title" style={{ fontSize: '0.95rem' }}>
                    {h.label}
                  </div>
                  <div className="card-sub">{h.when}</div>
                  <div className="exam-explain" style={{ borderTop: 'none', paddingTop: 0 }}>
                    {h.effect}
                  </div>
                </div>
              ))}
            </div>

            <div className="exam-tip">
              Kısa kural: <b>çoğunlukla “İyi”</b>. Gerçekten bilemediysen “Tekrar”. “Kolay”ı yalnızca hiç
              düşünmeden geldiyse kullan — fazla kullanmak kartı çok geç gösterir ve unutursun.
            </div>

            <div className="card-sub" style={{ lineHeight: 1.6 }}>
              Doğru puanlamaya çalışırken kendini kandırma: kartı görünce “ha, evet” demek hatırlamak değildir.
              Cevabı açmadan önce kendi kendine söyleyebiliyorsan bildin demektir.
            </div>

            <button className="btn btn--primary btn--block" onClick={() => setHelp(false)}>
              Anladım
            </button>
          </div>
        </Sheet>
      )}
    </>
  )
}


// ————————————————————————— Kart yüzleri —————————————————————————

function renderCard(card: Card, revealed: boolean): { front: JSX.Element; back: JSX.Element } {
  if (card.kind === 'kana') {
    const k = KANA_BY_CHAR.get(card.refId)
    return {
      front: <div className="ja-huge">{card.refId}</div>,
      back: (
        <div className="stack-sm">
          <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '0.05em' }}>{k?.romaji}</div>
          <div className="dim small">{k?.trHint}</div>
          {k?.mnemonic && <div className="tiny faint">{k.mnemonic}</div>}
          <div className="row" style={{ justifyContent: 'center' }}>
            <SpeakBtn text={card.refId} lang="ja" />
          </div>
        </div>
      ),
    }
  }

  if (card.kind === 'kanji') {
    const k = KANJI_BY_CHAR.get(card.refId)
    return {
      front: <div className="ja-huge">{card.refId}</div>,
      back: (
        <div className="stack-sm">
          <div style={{ fontSize: '1.3rem', fontWeight: 650 }}>{k?.meaningsTr.join(', ')}</div>
          <div className="tiny faint">{k?.strokes} çizgi</div>
          <div className="small dim ja">
            on: {k?.on.join('・') || '—'} · kun: {k?.kun.join('・') || '—'}
          </div>
          <div className="stack-sm" style={{ marginTop: 6 }}>
            {k?.words.slice(0, 3).map((w) => (
              <div key={w.term} className="row small" style={{ justifyContent: 'center', gap: 8 }}>
                <span className="ja bold">{w.term}</span>
                <span className="reading tiny">{w.reading}</span>
                <span className="tiny dim">{w.tr}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    }
  }

  if (card.kind === 'grammar') {
    const g = GRAMMAR_BY_ID.get(card.refId)
    return {
      front: (
        <div className="stack-sm">
          <div className="tiny faint">Bu yapı ne işe yarar?</div>
          <div className="ja" style={{ fontSize: '1.4rem', fontWeight: 620 }}>
            {g?.title}
          </div>
        </div>
      ),
      back: (
        <div className="stack-sm">
          <div className="small">{g?.summaryTr}</div>
          <div className="row-wrap" style={{ justifyContent: 'center' }}>
            {g?.patterns.map((p) => (
              <span key={p} className="badge badge--accent ja">
                {p}
              </span>
            ))}
          </div>
          {g?.examples[0] && (
            <div style={{ marginTop: 6 }}>
              <div className={g.lang === 'ja' ? 'ja' : ''} style={{ fontSize: '1rem' }}>
                {g.examples[0].text}
              </div>
              <div className="tiny dim">{g.examples[0].tr}</div>
            </div>
          )}
          <Link to={`/grammar/${g?.lang}/${g?.id}`} className="tiny dim" style={{ textDecoration: 'underline' }}>
            Tam anlatımı aç
          </Link>
        </div>
      ),
    }
  }

  // vocab
  const v = VOCAB_BY_ID.get(card.refId)
  if (!v) return { front: <div className="dim">{card.refId}</div>, back: <div /> }

  if (card.reverse) {
    // Anlamdan kelimeye — üretim yönü, daha zor
    return {
      front: (
        <div className="stack-sm">
          <div style={{ fontSize: '1.35rem', fontWeight: 620 }}>{v.tr}</div>
          <div className="tiny faint">{v.pos}</div>
        </div>
      ),
      back: (
        <div className="stack-sm">
          <div className={v.lang === 'ja' ? 'ja-big' : ''} style={{ fontSize: v.lang === 'ja' ? undefined : '1.7rem', fontWeight: 650 }}>
            {v.term}
          </div>
          {v.reading && v.reading !== v.term && <div className="reading">{v.reading}</div>}
          {v.lang === 'ja' && v.reading && <div className="romaji"><RomajiText reading={v.reading} /></div>}
          <div className="row" style={{ justifyContent: 'center' }}>
            <SpeakBtn text={v.term} lang={v.lang} reading={v.reading} />
          </div>
        </div>
      ),
    }
  }

  return {
    front: (
      <div className="stack-sm">
        <div className={v.lang === 'ja' ? 'ja-big' : ''} style={{ fontSize: v.lang === 'ja' ? undefined : '1.9rem', fontWeight: 650 }}>
          {v.term}
        </div>
        {!revealed && v.lang === 'ja' && <div className="tiny faint">okunuşunu ve anlamını düşün</div>}
      </div>
    ),
    back: (
      <div className="stack-sm">
        {v.reading && v.reading !== v.term && <div className="reading" style={{ fontSize: '1.05rem' }}>{v.reading}</div>}
        {v.reading && <div className="romaji"><RomajiText reading={v.reading} /></div>}
        <div style={{ fontSize: '1.15rem', fontWeight: 620 }}>{v.tr}</div>
        <div className="tiny faint">{v.pos}</div>
        {v.examples?.[0] && (
          <div style={{ marginTop: 6 }}>
            <div className="ja">{v.examples[0].text}</div>
            <div className="tiny dim">{v.examples[0].tr}</div>
          </div>
        )}
        <div className="row" style={{ justifyContent: 'center' }}>
          <SpeakBtn text={v.term} lang={v.lang} reading={v.reading} />
        </div>
      </div>
    ),
  }
}

/** Kartın arkasında kişisel hatırlatıcı — Zorlandıkların sayfasında yazılır. */
function PersonalNote({ refId }: { refId: string }) {
  const note = useNote(refId)
  if (!note.trim()) return null
  return (
    <div className="feedback feedback--ok small">
      <b>Kendi hatırlatıcın: </b>
      {note}
    </div>
  )
}
