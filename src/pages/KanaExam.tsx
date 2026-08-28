import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaGlyph } from '@/components/KanaGlyph'
import { DrawCanvas } from '@/components/DrawCanvas'
import {
  sectionTr,
  buildExam,
  examPlan,
  confusablesOf,
  evaluate,
  readingOk,
  type Answer,
  type ExamResult,
  type KanaType,
  type Question,
} from '@/content/ja/exam'
import { KANA_BY_CHAR } from '@/content/ja/kana'
import { checkDrawing, type Point } from '@/lib/stroke-check'
import { ensureStrokeData } from '@/lib/strokes'
import { db, ensureCards } from '@/db/db'

// Kana bitirme sınavı — hem hiragana hem katakana için.
//
// Sayfa alfabeyi prop olarak alır; içerik farkları exam.ts'te çözülmüş durumda.
// Burada yalnızca başlıklar, geri dönüş adresi ve kayıt anahtarı değişiyor.
//
// TASARIM KARARI — cevap sınav bitene kadar gösterilmez.
// Soru sonrası "doğru/yanlış" göstermek sınavı alıştırmaya çevirir: insan
// geri bildirimi görünce sonraki sorularda ona göre ayar yapar ve ölçüm bozulur.
// Burada amaç öğretmek değil, ÖLÇMEK; öğretme kısmı sonuç ekranında yapılıyor.

type Phase = 'setup' | 'exam' | 'result'

export default function KanaExamPage({ kana = 'hiragana' }: { kana?: KanaType }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [full, setFull] = useState(true)
  const [withWriting, setWithWriting] = useState(false)

  const [questions, setQuestions] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const answers = useRef(new Map<string, Answer>())
  const [result, setResult] = useState<ExamResult | null>(null)

  const start = () => {
    answers.current = new Map()
    setQuestions(buildExam({ kana, full, withWriting }))
    setIdx(0)
    setResult(null)
    setPhase('exam')
  }

  const finish = async (qs: Question[]) => {
    const r = evaluate(qs, answers.current, kana)
    setResult(r)
    setPhase('result')

    // Sonucu sakla: çalışma planı bunu okuyor ve ilerleme buradan görülüyor.
    // Kaydetme başarısız olsa bile sonuç ekranı gösterilmeli, o yüzden sonra.
    try {
      await db.exams.put({
        at: Date.now(),
        kind: kana,
        percent: r.percent,
        correct: r.correct,
        total: r.total,
        sections: Object.fromEntries(r.bySection.map((b) => [b.section, b.percent])),
        weakChars: r.weakChars.map((w) => w.char),
        full,
        withWriting,
      })
    } catch {
      // Sessiz geç — sınav sonucunu göstermek kaydetmekten önemli
    }
  }

  const submit = (a: Answer) => {
    answers.current.set(a.qid, a)
    if (idx + 1 >= questions.length) void finish(questions)
    else setIdx(idx + 1)
  }

  if (phase === 'setup') {
    return (
      <Setup
        kana={kana}
        full={full}
        setFull={setFull}
        writing={withWriting}
        setWriting={setWithWriting}
        onStart={start}
      />
    )
  }

  if (phase === 'result' && result) {
    return (
      <Result
        kana={kana}
        result={result}
        questions={questions}
        answers={answers.current}
        onRetry={() => setPhase('setup')}
      />
    )
  }

  return (
    <Exam
      kana={kana}
      q={questions[idx]}
      index={idx}
      total={questions.length}
      onSubmit={submit}
      onQuit={() => setPhase('setup')}
    />
  )
}

// ————————————————————————— Başlangıç —————————————————————————

function Setup({
  kana,
  full,
  setFull,
  writing,
  setWriting,
  onStart,
}: {
  kana: KanaType
  full: boolean
  setFull: (v: boolean) => void
  writing: boolean
  setWriting: (v: boolean) => void
  onStart: () => void
}) {
  // Sayılar sınavı kuran modülden geliyor; ekranla sınav ayrışamaz
  const SECTION_TR = sectionTr(kana)
  const label = kana === 'hiragana' ? 'Hiragana' : 'Katakana'
  const plan = examPlan(full, writing, kana)
  const sections = plan.filter((p) => p.section !== 'cizim')
  const toplam = plan.reduce((a, b) => a + b.count, 0)
  const tamToplam = examPlan(true, writing, kana).reduce((a, b) => a + b.count, 0)
  const kisaToplam = examPlan(false, writing, kana).reduce((a, b) => a + b.count, 0)

  return (
    <>
      <TopBar title={`${label} bitirme sınavı`} sub={`${toplam} soru`} back={`/kana/${kana}`} />

      <div className="page stack-lg lang-ja">
        <div className="card card--accent stack-sm">
          <div className="card-title">Bu sınav neyi ölçüyor?</div>
          <div className="card-sub">
            Tabloyu ezberlemiş olmak {label.toLocaleLowerCase('tr')} bilmek değildir. Bu sınav {sections.length}{' '}
            ayrı beceriyi ayrı ayrı yokluyor — hangi bölümde düştüğün, ne çalışman gerektiğini söylüyor.
          </div>
          <div className="tiny faint" style={{ marginTop: 4 }}>
            Doğru cevaplar sınav bitene kadar gösterilmez. Geri bildirim görmek ölçümü bozar.
          </div>
        </div>

        <div className="stack-sm">
          <h3>Bölümler</h3>
          {sections.map(({ section, count }) => (
            <div key={section} className="card">
              <div className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title" style={{ fontSize: '0.95rem' }}>
                    {SECTION_TR[section].title}
                  </div>
                  <div className="card-sub">{SECTION_TR[section].desc}</div>
                </div>
                <span className="tiny faint tabular">{count} soru</span>
              </div>
            </div>
          ))}
        </div>

        <div className="stack-sm">
          <h3>Ayarlar</h3>
          <button className={`card card--link${full ? ' card--accent' : ''}`} onClick={() => setFull(!full)}>
            <div className="row">
              <span className="entry-icon">
                <Icon name={full ? 'squareCheck' : 'square'} size={18} />
              </span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="card-title">Tam sınav</div>
                <div className="card-sub">
                  {full ? `${tamToplam} soru — gerçek bir bitirme sınavı` : `Kapalı: ${kisaToplam} soruluk kısa sürüm`}
                </div>
              </div>
            </div>
          </button>

          <button className={`card card--link${writing ? ' card--accent' : ''}`} onClick={() => setWriting(!writing)}>
            <div className="row">
              <span className="entry-icon">
                <Icon name={writing ? 'squareCheck' : 'square'} size={18} />
              </span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="card-title">Yazma bölümü ekle</div>
                <div className="card-sub">
                  Karakteri fareyle/parmakla çizersin. Puanı ayrı tutulur — çizim değerlendirmesi kesin değildir,
                  ana puanı bozmaz.
                </div>
              </div>
            </div>
          </button>
        </div>

        <button className="btn btn--primary btn--block btn--lg" onClick={onStart}>
          Sınavı başlat
        </button>
      </div>
    </>
  )
}

// ————————————————————————— Sınav —————————————————————————

function Exam({
  kana,
  q,
  index,
  total,
  onSubmit,
  onQuit,
}: {
  kana: KanaType
  q: Question
  index: number
  total: number
  onSubmit: (a: Answer) => void
  onQuit: () => void
}) {
  const SECTION_TR = sectionTr(kana)
  return (
    <div className="quiz lang-ja">
      <div className="quiz-top">
        <div className="row">
          <button className="btn btn--sm btn--ghost" onClick={onQuit}>
            <Icon name="close" size={15} />
            Bırak
          </button>
          <div className="spacer" />
          <span className="tiny faint">{SECTION_TR[q.section].title}</span>
          <span className="tiny dim tabular">
            {index + 1} / {total}
          </span>
        </div>
        <div className="bar" style={{ marginTop: 8 }}>
          <i style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* key: soru değişince alt bileşen sıfırlansın (yazılan metin taşınmasın) */}
      {q.type === 'mcq' && <McqView key={q.id} q={q} onSubmit={onSubmit} />}
      {q.type === 'text' && <TextView key={q.id} q={q} onSubmit={onSubmit} />}
      {q.type === 'write' && <WriteView key={q.id} q={q} onSubmit={onSubmit} />}
    </div>
  )
}

function Stem({ kana, textStem, prompt }: { kana?: string; textStem?: string; prompt: string }) {
  return (
    <div className="center stack-sm" style={{ padding: '10px 0 6px' }}>
      <div className="small dim">{prompt}</div>
      {kana && (
        <div className="exam-stem ja">
          <KanaGlyph char={kana} size="min(34vw, 22vh)" weight={4} />
        </div>
      )}
      {textStem && <div className="exam-stem-text">{textStem}</div>}
    </div>
  )
}

function McqView({ q, onSubmit }: { q: Extract<Question, { type: 'mcq' }>; onSubmit: (a: Answer) => void }) {
  return (
    <>
      <div className="quiz-body">
        <Stem kana={q.showKana} textStem={q.showText} prompt={q.prompt} />
      </div>
      <div className="quiz-foot stack-sm">
        <div className={q.optionKana ? 'grid grid-2' : 'stack-sm'}>
          {q.options.map((o, i) => (
            <button
              key={o + i}
              className="option"
              onClick={() => onSubmit({ qid: q.id, given: o, correct: i === q.answer })}
            >
              {q.optionKana ? (
                <span className="ja" style={{ fontSize: '1.9rem', margin: '0 auto' }}>
                  <KanaGlyph char={o} size="1.9rem" />
                </span>
              ) : (
                <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{o}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function TextView({ q, onSubmit }: { q: Extract<Question, { type: 'text' }>; onSubmit: (a: Answer) => void }) {
  const [v, setV] = useState('')
  const send = () => onSubmit({ qid: q.id, given: v, correct: readingOk(v, q.accepts) })

  return (
    <>
      <div className="quiz-body">
        <Stem kana={q.showKana} prompt={q.prompt} />
      </div>
      <div className="quiz-foot stack-sm">
        <input
          className="field"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          placeholder="okunuşu yaz — örn. shi, kyo, gakkou"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div className="tiny faint">
          Türkçe yazım da kabul edilir: şi / çi / tsu. Boş bırakırsan yanlış sayılır.
        </div>
        <button className="btn btn--primary btn--block" onClick={send}>
          Sonraki
        </button>
      </div>
    </>
  )
}

function WriteView({ q, onSubmit }: { q: Extract<Question, { type: 'write' }>; onSubmit: (a: Answer) => void }) {
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    await ensureStrokeData(q.target)
    const res = checkDrawing(strokes, q.target)
    setBusy(false)
    onSubmit({
      qid: q.id,
      given: String(strokes.length),
      // Çizim "doğru/yanlış" değil derece meselesi; 60 üstünü geçer sayıyoruz
      correct: (res?.score ?? 0) >= 60,
      score: res?.score ?? 0,
    })
  }

  return (
    <>
      <div className="quiz-body">
        <div className="center small dim" style={{ paddingTop: 8 }}>
          {q.prompt}
        </div>
        <div style={{ maxWidth: 320, margin: '10px auto 0' }}>
          {/* Şablon kapalı: sınavda üzerinden geçmek ölçüm olmaz */}
          <DrawCanvas showGhost={false} onStrokesUpdate={setStrokes} />
        </div>
      </div>
      <div className="quiz-foot stack-sm">
        <div className="tiny faint center">Şablon yok — karakteri hafızandan çizmen gerekiyor.</div>
        <button className="btn btn--primary btn--block" onClick={send} disabled={busy}>
          {busy ? 'Değerlendiriliyor…' : 'Sonraki'}
        </button>
      </div>
    </>
  )
}

// ————————————————————————— Sonuç —————————————————————————

function Result({
  kana,
  result,
  questions,
  answers,
  onRetry,
}: {
  kana: KanaType
  result: ExamResult
  questions: Question[]
  answers: Map<string, Answer>
  onRetry: () => void
}) {
  const SECTION_TR = sectionTr(kana)
  const [added, setAdded] = useState(false)
  const pct = Math.round(result.percent)
  const wrong = useMemo(() => questions.filter((q) => !answers.get(q.id)?.correct), [questions, answers])
  const writeQs = questions.filter((q) => q.section === 'cizim')

  const addWeakToDeck = async () => {
    const chars = [...new Set(result.weakChars.map((w) => w.char))].filter((c) => KANA_BY_CHAR.has(c))
    if (chars.length) await ensureCards(chars.map((c) => ({ kind: 'kana' as const, refId: c, lang: 'ja' as const })))
    setAdded(true)
  }

  return (
    <>
      <TopBar title="Sınav sonucu" back={`/kana/${kana}`} />

      <div className="page stack-lg lang-ja">
        {/* Puan */}
        <div className="card card--pad-lg center stack">
          <div className="exam-score tabular">%{pct}</div>
          <div className="dim tabular">
            {result.correct} / {result.total} doğru
          </div>
          <Bar value={result.percent} />
        </div>

        {/* Genel hüküm */}
        <div className={`card stack-sm feedback--${result.verdict.tone === 'ok' ? 'ok' : result.verdict.tone === 'warn' ? 'warn' : 'bad'}`}>
          <div className="card-title">{result.verdict.title}</div>
          <div className="card-sub" style={{ lineHeight: 1.6 }}>
            {result.verdict.text}
          </div>
        </div>

        {/* Bölüm dökümü */}
        <div className="stack-sm">
          <h3>Bölüm bölüm</h3>
          {result.bySection.map((b) => (
            <div key={b.section} className="card stack-sm">
              <div className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title" style={{ fontSize: '0.94rem' }}>
                    {SECTION_TR[b.section].title}
                  </div>
                  <div className="card-sub">{SECTION_TR[b.section].desc}</div>
                </div>
                <span className="tabular" style={{ fontWeight: 700, color: barColor(b.percent) }}>
                  %{Math.round(b.percent)}
                </span>
                <span className="tiny faint tabular">
                  {b.correct}/{b.total}
                </span>
              </div>
              <div className="bar">
                <i style={{ width: `${b.percent}%`, background: barColor(b.percent) }} />
              </div>
            </div>
          ))}
          {writeQs.length > 0 && (
            <div className="tiny faint">
              Yazma bölümü ana puana katılmaz — çizim değerlendirmesi yaklaşıktır.
            </div>
          )}
        </div>

        {/* Teşhis ve ipuçları */}
        {result.weaknesses.length > 0 && (
          <div className="stack-sm">
            <h3>Eksiklerin ve ne yapmalısın</h3>
            {result.weaknesses.map((w) => (
              <div key={w.id} className="card stack-sm">
                <div className="row">
                  <span className="entry-icon">
                    <Icon name="spark" size={18} />
                  </span>
                  <div className="card-title" style={{ flex: 1 }}>
                    {w.title}
                  </div>
                </div>
                <div className="card-sub" style={{ lineHeight: 1.6 }}>
                  {w.detail}
                </div>
                <div className="exam-tip">{w.tip}</div>
                {w.link && (
                  <Link to={w.link.to} className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
                    {w.link.label}
                    <Icon name="right" size={14} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Karıştırılan çiftler */}
        {result.confusions.length > 0 && (
          <div className="stack-sm">
            <h3>Karıştırdıkların</h3>
            <div className="card stack-sm">
              {result.confusions.map((c) => (
                <div key={c.correct + c.picked} className="row exam-confuse">
                  <span className="ja exam-confuse-ch">
                    <KanaGlyph char={c.correct} size="1.7rem" />
                  </span>
                  <span className="tiny dim">{KANA_BY_CHAR.get(c.correct)?.romaji}</span>
                  <span className="faint">yerine</span>
                  <span className="ja exam-confuse-ch is-wrong">
                    <KanaGlyph char={c.picked} size="1.7rem" />
                  </span>
                  <span className="tiny dim">{KANA_BY_CHAR.get(c.picked)?.romaji}</span>
                  <div className="spacer" />
                  {c.times > 1 && <span className="tiny faint tabular">{c.times}×</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zayıf karakterler */}
        {result.weakChars.length > 0 && (
          <div className="stack-sm">
            <div className="row">
              <h3>Takıldığın karakterler</h3>
              <div className="spacer" />
              <span className="tiny faint tabular">{result.weakChars.length}</span>
            </div>
            <div className="grid grid-auto">
              {result.weakChars.map((wc) => {
                const k = KANA_BY_CHAR.get(wc.char)
                const conf = confusablesOf(wc.char)
                return (
                  <div key={wc.char} className="card center stack-sm" style={{ gap: 4 }}>
                    <span className="ja">
                      <KanaGlyph char={wc.char} size="2.2rem" />
                    </span>
                    <div className="bold">{k?.romaji ?? ''}</div>
                    <div className="tiny dim">{k?.trHint}</div>
                    {conf.length > 0 && (
                      <div className="tiny faint">karışır: {conf.join(' ')}</div>
                    )}
                  </div>
                )
              })}
            </div>
            <button className="btn btn--block" onClick={addWeakToDeck} disabled={added}>
              {added ? 'Tekrar listesine eklendi' : `${result.weakChars.length} karakteri tekrar listesine ekle`}
            </button>
          </div>
        )}

        {/* Yanlışların dökümü */}
        {wrong.length > 0 && (
          <div className="stack-sm">
            <h3>Yanlış cevaplar</h3>
            {wrong.map((q) => {
              const a = answers.get(q.id)
              const dogru = q.type === 'mcq' ? q.options[q.answer] : q.type === 'text' ? q.answerLabel : q.answerLabel
              return (
                <div key={q.id} className="card stack-sm">
                  <div className="row">
                    <span className="tiny faint">{SECTION_TR[q.section].title}</span>
                    <div className="spacer" />
                  </div>
                  <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                    {q.type !== 'write' && q.showKana && (
                      <span className="ja">
                        <KanaGlyph char={q.showKana} size="2rem" />
                      </span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="small">{q.prompt}</div>
                      <div className="tiny" style={{ marginTop: 3 }}>
                        <span className="faint">senin cevabın: </span>
                        <b style={{ color: 'var(--bad)' }}>
                          {q.type === 'write' ? `${a?.score ?? 0} puan` : a?.given?.trim() ? a.given : '(boş)'}
                        </b>
                        <span className="faint"> · doğrusu: </span>
                        <b style={{ color: 'var(--ok)' }}>{dogru}</b>
                      </div>
                    </div>
                  </div>
                  <div className="exam-explain">{q.explain}</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="stack-sm">
          <Link to="/rota" className="btn btn--primary btn--block">
            Bu sonuca göre çalışma planımı gör
          </Link>
          <button className="btn btn--block" onClick={onRetry}>
            Sınavı tekrar al
          </button>
          <div className="tiny faint center">Sonuç kaydedildi — ilerlemeni rota sayfasından takip edebilirsin.</div>
        </div>
      </div>
    </>
  )
}

function barColor(p: number): string {
  if (p >= 85) return 'var(--ok)'
  if (p >= 70) return 'var(--warn)'
  return 'var(--bad)'
}
