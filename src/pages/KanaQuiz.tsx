import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { Badge, Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaGlyph } from '@/components/KanaGlyph'
import { kanaGroups } from '@/content/ja/kana'
import { acceptsFor, readingOk } from '@/content/ja/exam'
import { shuffle } from '@/lib/shuffle'
import { bumpStat, ensureCards } from '@/db/db'
import { useCardStates } from '@/db/hooks'

// Kendi testin.
//
// NEDEN AYRI BİR MOD:
// Uygulamanın ders akışı kendi sırasını dayatır. Ama kana'yı başka bir
// kaynaktan, kendi hızında çalışan biri için bu işe yaramaz — "bugün が ve ざ
// satırlarını öğrendim, sadece onları sor" diyebilmesi gerekir. Bu sayfa test
// edilecek karakter kümesini tamamen kullanıcıya bırakır.
//
// ÜÇ TASARIM KARARI:
//
// 1. Çeldiriciler YALNIZCA seçilen kümeden gelir.
//    Dışarıdan bir karakter şık olsaydı, tanımadığın için eleyip doğruyu
//    bulurdun — soru ölçmeyi bırakırdı.
//
// 2. Doğru cevap test bitene kadar GÖSTERİLMEZ.
//    Anında geri bildirim öğretir ama ölçmez: ilk soruda gördüğün cevap
//    sonrakini etkiler, kendini olduğundan iyi sanırsın.
//
// 3. Dört soru tipi de ZORUNLU, ayarı yok.
//    Yalnızca çoktan seçmeli çalışmak insanı yanıltır: şıkları görünce tanırsın
//    ama kendi başına çıkaramazsın. Tipler kolaydan zora sıralanır — tanıma,
//    hatırlama, eşleştirme, yazma — ve testin sonuna doğru şıklar ortadan
//    kalkar. Kapatılabilir olsaydı herkes en kolayını seçerdi.

type Kind = 'hiragana' | 'katakana'

const KINDS: { id: Kind; label: string }[] = [
  { id: 'hiragana', label: 'ひらがな' },
  { id: 'katakana', label: 'カタカナ' },
]

const REPEATS: { id: string; label: string }[] = [
  { id: '1', label: 'Her harf 1×' },
  { id: '2', label: '2×' },
  { id: '3', label: '3×' },
]

// ————————————————————————— Soru tipleri —————————————————————————

type QType = 'mcqRomaji' | 'mcqChar' | 'match' | 'type'

export const QTYPE_TR: Record<QType, { title: string; ask: string }> = {
  mcqRomaji: { title: 'Tanıma', ask: 'Bu karakter nasıl okunur?' },
  mcqChar: { title: 'Hatırlama', ask: 'Bu okunuş hangi karakter?' },
  match: { title: 'Eşleştirme', ask: 'Her karakteri okunuşuyla eşleştir' },
  type: { title: 'Yazma', ask: 'Okunuşunu yaz — şık yok' },
}

interface McqQ {
  type: 'mcqRomaji' | 'mcqChar'
  char: string
  romaji: string
  options: string[]
}
interface TypeQ {
  type: 'type'
  char: string
  romaji: string
  accepts: string[]
}
interface MatchQ {
  type: 'match'
  pairs: { char: string; romaji: string }[]
  /** Sağ sütunun karışık sırası — her açılışta sabit kalsın diye saklanır */
  shuffled: string[]
}
type Question = McqQ | TypeQ | MatchQ

/** Verilen cevap: tek değer ya da eşleştirme haritası. */
type Given = { t: 'one'; v: string | null } | { t: 'pairs'; v: Record<string, string> }

const SAVE_KEY = 'kana-quiz:setup'

interface Saved {
  kind: Kind
  chars: string[]
  repeat: number
}

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

export default function KanaQuizPage() {
  const saved = useMemo(loadSaved, [])
  const [kind, setKind] = useState<Kind>(saved?.kind ?? 'hiragana')
  const [selected, setSelected] = useState<Set<string>>(new Set(saved?.chars ?? []))
  const [repeat, setRepeat] = useState(saved?.repeat ?? 1)

  const [phase, setPhase] = useState<'setup' | 'running' | 'done'>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Given[]>([])
  const [idx, setIdx] = useState(0)

  const cardStates = useCardStates('kana')
  const [deckMsg, setDeckMsg] = useState('')

  const groups = useMemo(() => kanaGroups(kind), [kind])
  const byChar = useMemo(() => {
    const m = new Map<string, KanaChar>()
    for (const g of groups) for (const c of g.chars) m.set(c.char, c)
    return m
  }, [groups])

  useEffect(() => {
    const data: Saved = { kind, chars: [...selected], repeat }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }, [kind, selected, repeat])

  const picked = [...selected].map((c) => byChar.get(c)).filter(Boolean) as KanaChar[]
  const inDeck = picked.filter((c) => cardStates.has(c.char)).length

  // ————————————————————————— Seçim işlemleri —————————————————————————

  const toggleChar = (c: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })

  const toggleGroup = (chars: KanaChar[]) =>
    setSelected((s) => {
      const next = new Set(s)
      const allIn = chars.every((c) => next.has(c.char))
      for (const c of chars) {
        if (allIn) next.delete(c.char)
        else next.add(c.char)
      }
      return next
    })

  const selectAll = () => setSelected(new Set(groups.flatMap((g) => g.chars.map((c) => c.char))))

  // ————————————————————————— Test kurma —————————————————————————

  /**
   * Sorular kolaydan zora dizilir ve tipler karışık değil AŞAMALI verilir:
   * önce tanıma (şıklı), sonra hatırlama (şıklı), sonra eşleştirme, en sonda
   * şıksız yazma. Böylece test ısınmayla başlayıp gerçek ölçümle biter.
   */
  const buildQuestions = (pool: KanaChar[]): Question[] => {
    // Eşleştirme için en az 4 FARKLI okunuş gerekiyor (aynı okunuşlu iki
    // karakter aynı kutuda olursa hangisini nereye koyduğun belirsiz kalır).
    const distinct = [...new Map(pool.map((k) => [k.romaji, k])).values()]
    const canMatch = distinct.length >= 4

    const slots: KanaChar[] = []
    for (let r = 0; r < repeat; r++) slots.push(...shuffle(pool))
    const n = slots.length

    const share = canMatch
      ? { mcqRomaji: 0.3, mcqChar: 0.25, match: 0.2, type: 0.25 }
      : { mcqRomaji: 0.35, mcqChar: 0.3, match: 0, type: 0.35 }

    const iA = Math.max(1, Math.round(n * share.mcqRomaji))
    const iB = iA + Math.max(1, Math.round(n * share.mcqChar))
    const iC = iB + Math.round(n * share.match)

    const out: Question[] = []

    for (const k of slots.slice(0, iA)) out.push(mcqRomajiQ(k, pool))
    for (const k of slots.slice(iA, iB)) out.push(mcqCharQ(k, pool))

    if (canMatch) {
      const adet = Math.max(1, Math.round((iC - iB) / 4))
      for (let i = 0; i < adet; i++) out.push(matchQ(distinct))
    }

    for (const k of slots.slice(iC)) {
      out.push({ type: 'type', char: k.char, romaji: k.romaji, accepts: acceptsFor(k.char) })
    }

    return out
  }

  const start = (pool = picked) => {
    if (pool.length < 2) return
    const qs = buildQuestions(pool)
    setQuestions(qs)
    setAnswers(qs.map((q) => (q.type === 'match' ? { t: 'pairs', v: {} } : { t: 'one', v: null })))
    setIdx(0)
    setPhase('running')
  }

  /**
   * Puanlama okunuş üzerinden yapılır, karakter kimliği üzerinden değil:
   * じ ve ぢ ikisi de "ji" okunur, hangisini seçersen doğrudur.
   *
   * Eşleştirme tek soru değil, içindeki çift sayısı kadar madde sayılır —
   * yoksa dört çiftin üçünü bilmek hiç bilmemekle aynı puanı verirdi.
   */
  const scoreOf = (q: Question, g: Given): { correct: number; total: number } => {
    if (q.type === 'match') {
      const map = g.t === 'pairs' ? g.v : {}
      const ok = q.pairs.filter((p) => map[p.char] === p.romaji).length
      return { correct: ok, total: q.pairs.length }
    }
    const v = g.t === 'one' ? g.v : null
    if (v === null || v === '') return { correct: 0, total: 1 }
    if (q.type === 'type') return { correct: readingOk(v, q.accepts) ? 1 : 0, total: 1 }
    if (q.type === 'mcqRomaji') return { correct: v === q.romaji ? 1 : 0, total: 1 }
    return { correct: (byChar.get(v)?.romaji ?? v) === q.romaji ? 1 : 0, total: 1 }
  }

  const submit = (g: Given) => {
    const next = [...answers]
    next[idx] = g
    setAnswers(next)

    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      return
    }
    const toplam = questions.reduce((a, q, i) => {
      const s = scoreOf(q, next[i])
      return { correct: a.correct + s.correct, total: a.total + s.total }
    }, { correct: 0, total: 0 })
    bumpStat({ reviews: toplam.total, correct: toplam.correct, ja: 1 })
    setPhase('done')
  }

  // ————————————————————————— Test ekranı —————————————————————————

  if (phase === 'running') {
    const q = questions[idx]
    const pct = (idx / questions.length) * 100

    return (
      <div className="quiz lang-ja">
        <div className="quiz-top">
          <div className="row">
            <button className="btn btn--sm btn--ghost" onClick={() => setPhase('setup')}>
              <Icon name="close" size={15} />
              Bırak
            </button>
            <div className="spacer" />
            <span className="tiny faint">{QTYPE_TR[q.type].title}</span>
            <span className="tiny dim tabular">
              {idx + 1} / {questions.length}
            </span>
          </div>
          <div className="bar" style={{ marginTop: 8 }}>
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>

        {q.type === 'match' ? (
          <MatchView key={idx} q={q} onSubmit={(v) => submit({ t: 'pairs', v })} />
        ) : q.type === 'type' ? (
          <TypeView key={idx} q={q} onSubmit={(v) => submit({ t: 'one', v })} />
        ) : (
          <McqView key={idx} q={q} onSubmit={(v) => submit({ t: 'one', v })} />
        )}
      </div>
    )
  }

  // ————————————————————————— Sonuç ekranı —————————————————————————

  if (phase === 'done') {
    const scored = questions.map((q, i) => ({ q, g: answers[i], s: scoreOf(q, answers[i]) }))
    const correct = scored.reduce((a, r) => a + r.s.correct, 0)
    const total = scored.reduce((a, r) => a + r.s.total, 0)
    const pct = Math.round((correct / total) * 100)

    // Yanlış çıkan karakterler — eşleştirmede yalnızca hatalı çiftler sayılır
    const wrongChars = [
      ...new Set(
        scored.flatMap(({ q, g, s }) => {
          if (q.type === 'match') {
            const map = g.t === 'pairs' ? g.v : {}
            return q.pairs.filter((p) => map[p.char] !== p.romaji).map((p) => p.char)
          }
          return s.correct ? [] : [q.char]
        }),
      ),
    ]

    const addWrongToDeck = async () => {
      await ensureCards(wrongChars.map((c) => ({ kind: 'kana' as const, refId: c, lang: 'ja' as const })))
    }

    // Tip tip döküm — hangi beceride düştüğünü görmek puandan önemli
    const byType = (['mcqRomaji', 'mcqChar', 'match', 'type'] as QType[])
      .map((t) => {
        const rows = scored.filter((r) => r.q.type === t)
        const c = rows.reduce((a, r) => a + r.s.correct, 0)
        const n = rows.reduce((a, r) => a + r.s.total, 0)
        return { t, correct: c, total: n }
      })
      .filter((x) => x.total > 0)

    return (
      <>
        <TopBar title="Test sonucu" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <span className="result-mark">
              <Icon name={pct === 100 ? 'target' : pct >= 80 ? 'trophy' : 'flame'} size={28} />
            </span>
            <div style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
              {correct} / {total}
            </div>
            <div className="dim">%{pct} doğru</div>
          </div>

          <div className="stack-sm">
            <h2>Soru tipine göre</h2>
            {byType.map((b) => {
              const p = (b.correct / b.total) * 100
              return (
                <div key={b.t} className="card stack-sm">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: '0.94rem' }}>
                        {QTYPE_TR[b.t].title}
                      </div>
                      <div className="card-sub">{QTYPE_TR[b.t].ask}</div>
                    </div>
                    <span className="tabular bold" style={{ color: pctColor(p) }}>
                      %{Math.round(p)}
                    </span>
                    <span className="tiny faint tabular">
                      {b.correct}/{b.total}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${p}%`, background: pctColor(p) }} />
                  </div>
                </div>
              )
            })}
            {byType.length > 1 && (
              <div className="tiny faint" style={{ lineHeight: 1.5 }}>
                Şıklı bölümlerde yüksek, yazmada düşükse: tanıyorsun ama hatırlamıyorsun. Şıklar sana ipucu
                veriyor — şıksız çalışmadan bu kapanmaz.
              </div>
            )}
          </div>

          <div className="stack-sm">
            <h2>Soru soru döküm</h2>
            <div className="card stack-sm">
              {scored.map(({ q, g, s }, i) =>
                q.type === 'match' ? (
                  <div key={i} className="quiz-row-block">
                    <div className="row tiny faint">
                      <span className="quiz-row-no">{i + 1}</span>
                      <span>Eşleştirme</span>
                      <div className="spacer" />
                      <span className="tabular">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    {q.pairs.map((p) => {
                      const secilen = g.t === 'pairs' ? g.v[p.char] : undefined
                      const ok = secilen === p.romaji
                      return (
                        <div key={p.char} className={`quiz-row${ok ? '' : ' is-wrong'}`}>
                          <span style={{ minWidth: 40, display: 'grid', placeItems: 'center' }}>
                            <KanaGlyph char={p.char} size="1.7rem" />
                          </span>
                          <span className="bold" style={{ minWidth: 46 }}>
                            {p.romaji}
                          </span>
                          <div className="spacer" />
                          {ok ? (
                            <span style={{ color: 'var(--ok)' }}>
                              <Icon name="check" size={15} />
                            </span>
                          ) : (
                            <span className="tiny" style={{ color: 'var(--bad)' }}>
                              sen: {secilen ?? 'boş'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div key={i} className={`quiz-row${s.correct ? '' : ' is-wrong'}`}>
                    <span className="quiz-row-no tiny faint">{i + 1}</span>
                    <span style={{ minWidth: 44, display: 'grid', placeItems: 'center' }}>
                      <KanaGlyph char={q.char} size="1.9rem" />
                    </span>
                    <span className="bold" style={{ minWidth: 46 }}>
                      {q.romaji}
                    </span>
                    <div className="spacer" />
                    {s.correct ? (
                      <span style={{ color: 'var(--ok)' }}>
                        <Icon name="check" size={15} />
                      </span>
                    ) : (
                      <span className="tiny" style={{ color: 'var(--bad)', textAlign: 'right' }}>
                        <YanlisCevap q={q} g={g} />
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {wrongChars.length > 0 && (
            <div className="card stack-sm">
              <div className="card-title">Takıldığın {wrongChars.length} karakter</div>
              <div className="row-wrap ja" style={{ fontSize: '2rem', gap: 12 }}>
                {wrongChars.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <div className="row-wrap" style={{ gap: 8, marginTop: 4 }}>
                <button
                  className="btn btn--sm btn--primary"
                  onClick={() => start(wrongChars.map((c) => byChar.get(c)!).filter(Boolean))}
                  disabled={wrongChars.length < 2}
                >
                  Sadece bunları tekrar sor
                </button>
                <button className="btn btn--sm btn--ghost" onClick={addWrongToDeck}>
                  Tekrar listesine ekle
                </button>
              </div>
              {wrongChars.length < 2 && (
                <div className="tiny faint">Tek karakterle test kurulamaz — en az iki şık gerekir.</div>
              )}
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--lang btn--block" onClick={() => start()}>
              Aynı seçimle tekrar
            </button>
            <button className="btn btn--block" onClick={() => setPhase('setup')}>
              Seçimi değiştir
            </button>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Kurulum ekranı —————————————————————————

  const total = picked.length * repeat

  return (
    <>
      <TopBar title="Kendi testin" sub="Çıkacak harfleri sen seç" back="/calis" />

      <div className="page stack-lg lang-ja">
        <div className="card stack-sm">
          <div className="card-title">Nasıl çalışır?</div>
          <div className="card-sub">
            Test edilecek karakterleri sen seçersin. <b>Şıklar yalnızca seçtiklerinden</b> gelir.{' '}
            <b>Doğru cevap test bitene kadar gösterilmez</b> — böylece bir sorunun cevabı sonrakini etkilemez.
          </div>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Dört soru tipi de çıkar</div>
          <div className="card-sub">
            Kolaydan zora sıralanır; sonlara doğru şıklar ortadan kalkar. Kapatılamaz — yalnızca çoktan seçmeli
            çalışmak insanı yanıltır.
          </div>
          <div className="stack-sm" style={{ marginTop: 4 }}>
            {(['mcqRomaji', 'mcqChar', 'match', 'type'] as QType[]).map((t, i) => (
              <div key={t} className="row">
                <span className="plan-no tabular">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tiny bold">{QTYPE_TR[t].title}</div>
                  <div className="tiny faint">{QTYPE_TR[t].ask}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Chips items={KINDS} value={kind} onChange={setKind} />

        <div className="stack-sm">
          <div className="row">
            <span className="tiny bold dim" style={{ flex: 1 }}>
              Teste girmesini istediklerini işaretle
            </span>
            <button className="btn btn--sm btn--ghost" onClick={selectAll}>
              Hepsi
            </button>
            {selected.size > 0 && (
              <button className="btn btn--sm btn--ghost" onClick={() => setSelected(new Set())}>
                Temizle
              </button>
            )}
          </div>

          {groups.map((g) => {
            const allIn = g.chars.every((c) => selected.has(c.char))
            const someIn = g.chars.some((c) => selected.has(c.char))
            const inCount = g.chars.filter((c) => selected.has(c.char)).length
            return (
              <div key={g.group} className={`card stack-sm quiz-group${someIn ? ' is-active' : ''}`}>
                <div className="row">
                  <button
                    className="quiz-group-title ja"
                    onClick={() => toggleGroup(g.chars)}
                    title="Satırın tamamını işaretle / kaldır"
                  >
                    <Icon name={allIn ? 'squareCheck' : someIn ? 'squareHalf' : 'square'} size={16} />
                    {g.group}
                  </button>
                  <div className="spacer" />
                  <span className="tiny faint">
                    {inCount} / {g.chars.length}
                  </span>
                </div>
                <div className="quiz-chars">
                  {g.chars.map((c) => (
                    <button
                      key={c.char}
                      className={`quiz-char${selected.has(c.char) ? ' is-on' : ''}`}
                      onClick={() => toggleChar(c.char)}
                    >
                      <span className="c">
                        <KanaGlyph char={c.char} size="1.5rem" />
                      </span>
                      <span className="r">{c.romaji}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Kaç kez sorulsun?</div>
          <Chips items={REPEATS} value={String(repeat)} onChange={(v) => setRepeat(Number(v))} />
        </div>

        {picked.length > 0 && (
          <div className="card stack-sm">
            <div className="row">
              <span className="card-title" style={{ flex: 1 }}>
                Seçilenler
              </span>
              <Badge tone="ja">{picked.length} harf</Badge>
            </div>
            <div className="row-wrap ja" style={{ fontSize: '1.6rem', gap: 10 }}>
              {picked.map((c) => (
                <span key={c.char}>{c.char}</span>
              ))}
            </div>
            <div className="row">
              <span className="tiny faint" style={{ flex: 1 }}>
                Sesini dinlemek istersen:
              </span>
              <SpeakBtn text={picked.map((c) => c.char).join('、')} lang="ja" size="sm" />
            </div>

            <div className="hr" />

            {/*
              Aralıklı tekrara ekleme.
              Buradaki test tek seferliktir: bugün ölçer, yarın hatırlatmaz.
              Unutma eğrisini yenen şey ARALIKLI tekrardır.
            */}
            <div className="row">
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="tiny bold">Aralıklı tekrar</div>
                <div className="tiny faint">
                  {inDeck === picked.length
                    ? 'Hepsi tekrar listende — her gün kendiliğinden karşına çıkacaklar.'
                    : `${inDeck} / ${picked.length} tanesi tekrar listende.`}
                </div>
              </div>
              {inDeck < picked.length && (
                <button
                  className="btn btn--sm btn--primary"
                  onClick={async () => {
                    const added = await ensureCards(
                      picked.map((c) => ({ kind: 'kana' as const, refId: c.char, lang: 'ja' as const })),
                    )
                    setDeckMsg(`${added} harf eklendi. Artık Tekrar bölümünde çıkacaklar.`)
                  }}
                >
                  + Tekrara ekle
                </button>
              )}
            </div>
            {deckMsg && <div className="feedback feedback--ok tiny">{deckMsg}</div>}
          </div>
        )}

        <button className="btn btn--lang btn--block btn--lg" onClick={() => start()} disabled={picked.length < 2}>
          {picked.length < 2 ? 'En az 2 harf seç' : `Teste başla · ~${total} soru`}
        </button>

        {picked.length >= 2 && picked.length < 4 && (
          <div className="feedback feedback--info tiny">
            Sadece {picked.length} harf seçtin: her soruda {picked.length} şık olacak ve eşleştirme bölümü
            çıkmayacak (en az 4 farklı okunuş gerekiyor). Daha fazla harf seçersen test zorlaşır.
          </div>
        )}

        <Link to="/kana/hiragana" className="tiny faint center" style={{ display: 'block' }}>
          Karakterleri çalışmak için kana tablosuna git
        </Link>
      </div>
    </>
  )
}

// ————————————————————————— Soru üreticileri —————————————————————————

function mcqRomajiQ(k: KanaChar, pool: KanaChar[]): McqQ {
  // Aynı okunuşa sahip iki şık olmasın: じ/ぢ ikisi de "ji"dir
  const others = [...new Set(pool.filter((o) => o.romaji !== k.romaji).map((o) => o.romaji))]
  return { type: 'mcqRomaji', char: k.char, romaji: k.romaji, options: shuffle([k.romaji, ...shuffle(others).slice(0, 3)]) }
}

function mcqCharQ(k: KanaChar, pool: KanaChar[]): McqQ {
  const others = pool.filter((o) => o.romaji !== k.romaji).map((o) => o.char)
  return { type: 'mcqChar', char: k.char, romaji: k.romaji, options: shuffle([k.char, ...shuffle(others).slice(0, 3)]) }
}

function matchQ(distinct: KanaChar[]): MatchQ {
  const pairs = shuffle(distinct)
    .slice(0, Math.min(4, distinct.length))
    .map((k) => ({ char: k.char, romaji: k.romaji }))
  return { type: 'match', pairs, shuffled: shuffle(pairs.map((p) => p.romaji)) }
}

// ————————————————————————— Soru görünümleri —————————————————————————

function McqView({ q, onSubmit }: { q: McqQ; onSubmit: (v: string) => void }) {
  const soru = QTYPE_TR[q.type].ask
  return (
    <>
      <div className="quiz-body">
        <div className="tiny faint center">{soru}</div>
        <div className={`quiz-prompt${q.type === 'mcqChar' ? ' is-romaji' : ''}`}>
          {q.type === 'mcqChar' ? q.romaji : <KanaGlyph char={q.char} size="min(40vw, 30vh)" weight={4.5} />}
        </div>
      </div>
      <div className="quiz-options">
        {q.options.map((opt) => (
          <button key={opt} className="quiz-opt" onClick={() => onSubmit(opt)}>
            {q.type === 'mcqChar' ? <KanaGlyph char={opt} size="2.8rem" /> : opt}
          </button>
        ))}
      </div>
      <div className="quiz-foot tiny faint center">Doğru cevap test bitene kadar gösterilmez.</div>
    </>
  )
}

function TypeView({ q, onSubmit }: { q: TypeQ; onSubmit: (v: string) => void }) {
  const [v, setV] = useState('')
  return (
    <>
      <div className="quiz-body">
        <div className="tiny faint center">{QTYPE_TR.type.ask}</div>
        <div className="quiz-prompt">
          <KanaGlyph char={q.char} size="min(38vw, 28vh)" weight={4.5} />
        </div>
      </div>
      <div className="quiz-foot stack-sm">
        <input
          className="field"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit(v)
          }}
          placeholder="okunuşu yaz — örn. shi, kyo"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div className="tiny faint center">Türkçe yazım da kabul edilir: şi / çi / tsu</div>
        <button className="btn btn--primary btn--block" onClick={() => onSubmit(v)}>
          Sonraki
        </button>
      </div>
    </>
  )
}

/**
 * Eşleştirme.
 *
 * Önce bir karaktere, sonra bir okunuşa dokunursun. Eşlenen ikili sabitlenir;
 * yanlış eşlediğini düşünürsen üstüne tekrar dokunup çözebilirsin. Doğru olup
 * olmadığı burada GÖSTERİLMEZ — testin geri kalanıyla aynı kural.
 */
function MatchView({ q, onSubmit }: { q: MatchQ; onSubmit: (v: Record<string, string>) => void }) {
  const [pairs, setPairs] = useState<Record<string, string>>({})
  const [aktif, setAktif] = useState<string | null>(null)

  const kullanilan = new Set(Object.values(pairs))
  const hepsiEslendi = q.pairs.every((p) => pairs[p.char])

  const kanaTikla = (char: string) => {
    if (pairs[char]) {
      // Eşlemeyi çöz
      const next = { ...pairs }
      delete next[char]
      setPairs(next)
      setAktif(char)
      return
    }
    setAktif(aktif === char ? null : char)
  }

  const romajiTikla = (r: string) => {
    if (kullanilan.has(r)) {
      // Bu okunuş başka bir karaktere bağlı — bağı çöz
      const sahip = Object.keys(pairs).find((c) => pairs[c] === r)
      if (sahip) {
        const next = { ...pairs }
        delete next[sahip]
        setPairs(next)
      }
      return
    }
    if (!aktif) return
    setPairs({ ...pairs, [aktif]: r })
    setAktif(null)
  }

  return (
    <>
      <div className="quiz-body stack-sm" style={{ justifyContent: 'flex-start', paddingTop: 12 }}>
        <div className="tiny faint center">{QTYPE_TR.match.ask}</div>
        <div className="tiny faint center">Önce karaktere, sonra okunuşuna dokun. Değiştirmek için üstüne tekrar dokun.</div>

        <div className="match-grid">
          <div className="match-col">
            {q.pairs.map((p) => (
              <button
                key={p.char}
                className={`match-cell${aktif === p.char ? ' is-active' : ''}${pairs[p.char] ? ' is-done' : ''}`}
                onClick={() => kanaTikla(p.char)}
              >
                <KanaGlyph char={p.char} size="2rem" />
                {pairs[p.char] && <span className="match-tag">{pairs[p.char]}</span>}
              </button>
            ))}
          </div>

          <div className="match-col">
            {q.shuffled.map((r) => (
              <button
                key={r}
                className={`match-cell match-cell--text${kullanilan.has(r) ? ' is-used' : ''}`}
                onClick={() => romajiTikla(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-foot stack-sm">
        <button className="btn btn--primary btn--block" onClick={() => onSubmit(pairs)} disabled={!hepsiEslendi}>
          {hepsiEslendi ? 'Sonraki' : `${q.pairs.length - Object.keys(pairs).length} eşleştirme kaldı`}
        </button>
      </div>
    </>
  )
}

/** Sonuç dökümünde "senin cevabın" hücresi — tipe göre farklı gösterilir. */
function YanlisCevap({ q, g }: { q: Question; g: Given }) {
  if (q.type === 'match') return null
  const v = g.t === 'one' ? g.v : null
  if (v === null || v === '') return <>boş</>
  if (q.type === 'mcqChar') {
    return (
      <span className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
        sen: <KanaGlyph char={v} size="1.4rem" />
      </span>
    )
  }
  return <>sen: {v}</>
}

function pctColor(p: number): string {
  if (p >= 85) return 'var(--ok)'
  if (p >= 70) return 'var(--warn)'
  return 'var(--bad)'
}
