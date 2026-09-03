import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toRomaji } from 'wanakana'
import type { Exercise, LessonSection } from '@/types'
import { Badge, Bar, JaText, SpeakBtn, TopBar, furiganaReading, stripFurigana } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ExerciseView } from '@/components/Exercise'
import { Markdown } from '@/lib/md'
import { GRAMMAR_BY_ID, LESSONS_BY_ID, VOCAB_BY_ID, lessonCardTargets } from '@/content'
import { KANA_BY_CHAR } from '@/content/ja/kana'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import { bumpStat, db, ensureCards } from '@/db/db'
import { speak } from '@/lib/tts'

/** Bölümler tek tek adımlara açılır; alıştırmalar her biri ayrı adım olur. */
type Step =
  | { kind: 'section'; section: LessonSection }
  | { kind: 'exercise'; exercise: Exercise; sectionTitle: string; retryOf?: string }

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>()
  const lesson = id ? LESSONS_BY_ID.get(id) : undefined

  const steps = useMemo<Step[]>(() => {
    if (!lesson) return []
    const out: Step[] = []
    for (const s of lesson.sections) {
      if (s.kind === 'exercises') {
        for (const ex of s.exercises) out.push({ kind: 'exercise', exercise: ex, sectionTitle: s.title })
      } else if (s.kind === 'passage') {
        out.push({ kind: 'section', section: s })
        for (const ex of s.questions) out.push({ kind: 'exercise', exercise: ex, sectionTitle: s.title })
      } else {
        out.push({ kind: 'section', section: s })
      }
    }
    return out
  }, [lesson])

  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [finished, setFinished] = useState(false)
  const [newCards, setNewCards] = useState(0)
  const startedAt = useRef(Date.now())
  const top = useRef<HTMLDivElement>(null)
  // Klavye dinleyicisi her adımda yeniden kurulmasın diye ref üzerinden çağrılır
  const advanceRef = useRef<() => void>(() => {})

  // Puana girmiş alıştırmaların id'leri.
  //
  // Adımlar arasında geri gidilebildiği için aynı soru ikinci kez
  // cevaplanabilir. Sayaçlar buna körse doğruluk oranı uydurma olur: dört
  // soruluk bir derste "7/9 doğru" gibi imkânsız sonuçlar çıkar. Bir soru
  // yalnızca İLK cevaplandığında sayılır; sonraki karşılaşmalar sadece
  // tekrar amaçlıdır.
  const scored = useRef<Set<string>>(new Set())

  // Yanlış yapılan sorular dersin sonuna eklenir.
  // Bir soruyu yanlış yapıp geçmek, o soruyu hiç sormamakla neredeyse aynı
  // şeydir; asıl öğrenme yanlıştan sonraki ikinci karşılaşmada olur.
  const [retry, setRetry] = useState<Step[]>([])
  const retryRef = useRef<Step[]>([])

  const allSteps = useMemo(() => [...steps, ...retry], [steps, retry])

  const queueRetry = (exercise: Exercise, sectionTitle: string) => {
    if (retryRef.current.some((s) => s.kind === 'exercise' && s.retryOf === exercise.id)) return
    const step: Step = {
      kind: 'exercise',
      // Yeni id şart: ExerciseView iç durumu id'ye bağlı `key` ile sıfırlanıyor
      exercise: { ...exercise, id: `${exercise.id}-retry` },
      sectionTitle: `Tekrar · ${sectionTitle}`,
      retryOf: exercise.id,
    }
    retryRef.current = [...retryRef.current, step]
    setRetry(retryRef.current)
  }

  // Kaldığı yerden devam.
  //
  // Burada kayıt ASLA körlemesine ezilmez. Eskiden her açılışta
  // `status: 'in-progress', sectionIndex: 0` yazılıyordu; sonucu şuydu:
  //   • tamamlanmış bir dersi açıp kapatmak onu "yarım" yapıyordu
  //     (ilerleme yüzdesi düşüyor, sonraki ders yeniden kilitlenebiliyordu)
  //   • kaldığın yer okunduktan hemen sonra siliniyordu, yani o an çıkarsan
  //     bir dahaki açılışta baştan başlıyordun
  //   • `attempts` sayacı hiç birikmiyordu
  useEffect(() => {
    if (!lesson) return
    let alive = true

    db.lessons.get(lesson.id).then((p) => {
      if (!alive) return

      if (!p) {
        // Ders ilk kez açılıyor — kaydı şimdi oluştur
        db.lessons.put({
          lessonId: lesson.id,
          lang: lesson.lang,
          status: 'in-progress',
          sectionIndex: 0,
          correct: 0,
          total: 0,
          startedAt: Date.now(),
          attempts: 0,
        })
        return
      }

      if (p.status === 'completed') {
        // Tamamlanmış dersi yeniden açmak onu yarım yapmaz; baştan çalışılır
        setI(0)
        return
      }

      // Yarım kalmış ders: bırakıldığı adımdan devam.
      //
      // Ara skor da geri yüklenir. Yoksa yarıda bırakılan bir ders her
      // açılışta sıfırdan sayılmaya başlıyor ve biten derste "1/1 doğru"
      // gibi, gerçekte cevaplanan soru sayısıyla ilgisi olmayan bir sonuç
      // yazılıyordu.
      if (p.sectionIndex > 0 && p.sectionIndex < steps.length) {
        setI(p.sectionIndex)
        setCorrect(p.correct)
        setAnswered(p.total)
        // O adıma kadarki alıştırmalar zaten puanlanmıştı
        for (const s of steps.slice(0, p.sectionIndex)) {
          if (s.kind === 'exercise') scored.current.add(s.exercise.id)
        }
      }
    })

    return () => {
      alive = false
    }
    // Sadece ders değiştiğinde çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, steps.length])

  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' })
    window.scrollTo({ top: 0 })
  }, [i])

  // Anlatım bölümlerinde Enter/boşluk ile devam
  const step0 = steps[i] ?? retryRef.current[i - steps.length]
  useEffect(() => {
    if (!step0 || step0.kind !== 'section') return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        advanceRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step0])

  if (!lesson) {
    return (
      <>
        <TopBar title="Ders bulunamadı" back />
        <div className="page">
          <Link to="/" className="btn btn--block">
            Ana sayfaya dön
          </Link>
        </div>
      </>
    )
  }

  /**
   * Bir sonraki adıma geç.
   *
   * `score` verilmezse bileşenin o anki sayaçları kullanılır. Alıştırma
   * cevaplandığında setState henüz uygulanmadığı için çağıran taraf güncel
   * değerleri açıkça geçer — yoksa kayıt bir soru geriden gelir.
   */
  /**
   * Bir adım geri.
   *
   * Ders yalnızca ileri akıyordu; yanlışlıkla "Devam"a basan öğrenci
   * anlatımı bir daha göremiyor, dersi baştan almaktan başka çaresi
   * kalmıyordu. Geri gitmek puanı DEĞİŞTİRMEZ — cevaplanmış soru
   * `scored` sayesinde ikinci kez sayılmaz.
   */
  const goBack = async () => {
    if (i === 0) return
    setI(i - 1)
    await db.lessons.update(lesson.id, { sectionIndex: i - 1 })
  }

  /** Dersi ilk adımdan yeniden başlat — skor ve tekrar kuyruğu sıfırlanır. */
  const restart = async () => {
    scored.current = new Set()
    retryRef.current = []
    setRetry([])
    setCorrect(0)
    setAnswered(0)
    setI(0)
    startedAt.current = Date.now()
    await db.lessons.update(lesson.id, { sectionIndex: 0, correct: 0, total: 0 })
  }

  const advance = async (score?: { correct: number; answered: number }) => {
    const okCount = score?.correct ?? correct
    const doneCount = score?.answered ?? answered

    // Yanlışlar sona eklendiği için toplam adım sayısı ders sırasında büyüyebilir
    const total = steps.length + retryRef.current.length
    if (i + 1 < total) {
      setI(i + 1)
      // Ara skoru da yaz: yarım bırakılan derste liste "nerede kaldın"ı gösterebilsin
      await db.lessons.update(lesson.id, { sectionIndex: i + 1, correct: okCount, total: doneCount })
      return
    }
    // Ders bitti
    const targets = lessonCardTargets(lesson)
    const added = await ensureCards(
      targets.map((t) => ({ kind: t.kind, refId: t.refId, lang: lesson.lang })),
    )
    // Kelime kartlarına ters yön de eklenir (anlam → kelime)
    await ensureCards(
      targets.filter((t) => t.kind === 'vocab').map((t) => ({ kind: t.kind, refId: t.refId, lang: lesson.lang, reverse: true })),
    )
    setNewCards(added)

    const prev = await db.lessons.get(lesson.id)
    await db.lessons.put({
      lessonId: lesson.id,
      lang: lesson.lang,
      status: 'completed',
      sectionIndex: steps.length,
      correct: okCount,
      total: doneCount,
      startedAt: prev?.startedAt,
      completedAt: Date.now(),
      attempts: (prev?.attempts ?? 0) + 1,
    })
    await bumpStat({
      lessonsCompleted: 1,
      minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
      [lesson.lang]: 1,
    })
    setFinished(true)
  }
  advanceRef.current = advance

  if (finished) {
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 100
    return (
      <>
        <TopBar title="Ders tamamlandı" back={`/lessons/${lesson.lang}`} />
        <div className={`page stack-lg lang-${lesson.lang}`} style={{ paddingTop: 40 }}>
          <div className="center stack">
            <span className="result-mark"><Icon name={pct >= 80 ? 'trophy' : pct >= 60 ? 'check' : 'flame'} size={32} /></span>
            <h1>{lesson.title}</h1>
            <div className="dim">
              {answered > 0 ? `${correct} / ${answered} doğru · %${pct}` : 'Bölümleri tamamladın'}
            </div>
          </div>

          {newCards > 0 && (
            <div className="card center">
              <div className="card-title">{newCards} yeni kart tekrar listene eklendi</div>
              <div className="card-sub">Yarın ilk tekrarları gelecek — unutmadan çalışırsan kalıcı olur.</div>
            </div>
          )}

          {pct < 70 && answered > 0 && (
            <div className="feedback feedback--info">
              Doğruluk %70'in altında. Dersi bir kez daha yapmak, ilerlemekten daha çok işe yarar.
            </div>
          )}

          <div className="stack-sm">
            <button
              className="btn btn--lang btn--block"
              onClick={() => {
                scored.current = new Set()
                retryRef.current = []
                setRetry([])
                setI(0)
                setCorrect(0)
                setAnswered(0)
                setFinished(false)
                startedAt.current = Date.now()
              }}
            >
              Tekrar yap
            </button>
            <Link to={`/lessons/${lesson.lang}`} className="btn btn--block">
              Ders listesine dön
            </Link>
            <Link to="/review" className="btn btn--ghost btn--block">
              Tekrara geç
            </Link>
          </div>
        </div>
      </>
    )
  }

  const step = allSteps[i]
  const inRetryRound = i >= steps.length
  const pending = retry.length - Math.max(0, i - steps.length)

  return (
    <>
      <TopBar
        title={lesson.title}
        sub={`${i + 1} / ${allSteps.length}`}
        back={`/lessons/${lesson.lang}`}
        right={<Badge tone={lesson.lang}>{lesson.level}</Badge>}
      />
      <div style={{ padding: '0 var(--pad)' }}>
        <Bar value={i} max={allSteps.length} />
        {/*
          Adım gezinmesi çubuğun hemen altında durur: öğrencinin "neredeyim"
          sorusuna baktığı yer burası, "geri dönebilir miyim" sorusunun cevabı
          da orada olmalı. i === 0 iken satır tamamen gizlenir.
        */}
        {i > 0 && (
          <div className="row" style={{ gap: 6, marginTop: 8 }}>
            <button className="btn btn--sm btn--ghost" onClick={goBack}>
              <Icon name="left" size={13} /> Geri
            </button>
            <button className="btn btn--sm btn--ghost" onClick={restart}>
              <Icon name="undo" size={13} /> Baştan
            </button>
            <div className="spacer" />
            <span className="tiny faint">Geri gitmek puanını değiştirmez</span>
          </div>
        )}
      </div>

      <div className={`page stack-lg lang-${lesson.lang}`} ref={top}>
        {inRetryRound && i === steps.length && (
          <div className="feedback feedback--info">
            <b>Yanlışların tekrarı. </b>Bu {retry.length} soruyu ilk seferde bilemedin. İkinci karşılaşma, öğrenmenin
            asıl gerçekleştiği yerdir — puanına eklenmez, sadece pekiştirir.
          </div>
        )}

        {step.kind === 'section' ? (
          <>
            <SectionView section={step.section} />
            <button className="btn btn--lang btn--block btn--lg" onClick={() => advance()}>
              Devam
            </button>
          </>
        ) : (
          <>
            <div className="row tiny faint">
              <span>{step.sectionTitle}</span>
              {!inRetryRound && pending > 0 && (
                <>
                  <div className="spacer" />
                  <Icon name="repeat" size={14} />
              <span>{pending} soru sonda tekrarlanacak</span>
                </>
              )}
            </div>
            <ExerciseView
              exercise={step.exercise}
              onDone={(ok) => {
                // Tekrar turundaki cevaplar puana girmez: aynı soru iki kez
                // sayılırsa doğruluk oranı gerçeği yansıtmaz
                // Geri gidilip yeniden cevaplanan soru da sayılmaz
                if (!inRetryRound && !scored.current.has(step.exercise.id)) {
                  scored.current.add(step.exercise.id)
                  const nextCorrect = correct + (ok ? 1 : 0)
                  const nextAnswered = answered + 1
                  setAnswered(nextAnswered)
                  setCorrect(nextCorrect)
                  bumpStat({ reviews: 1, correct: ok ? 1 : 0, [lesson.lang]: 1 })
                  if (!ok) queueRetry(step.exercise, step.sectionTitle)
                  advance({ correct: nextCorrect, answered: nextAnswered })
                  return
                }
                advance()
              }}
            />
          </>
        )}
      </div>
    </>
  )
}

// ————————————————————————— Bölüm görünümleri —————————————————————————

function SectionView({ section }: { section: LessonSection }) {
  if (section.kind === 'teach') {
    return (
      <div className="stack">
        <h2>{section.title}</h2>
        <Markdown text={section.body} />
      </div>
    )
  }

  if (section.kind === 'vocab') {
    return (
      <div className="stack">
        <h2>{section.title}</h2>
        <div className="stack-sm">
          {section.vocabIds.map((id) => {
            const v = VOCAB_BY_ID.get(id)
            if (!v) return null
            return (
              <div key={id} className="card">
                <div className="row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ja" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                      {v.term}
                    </div>
                    {v.reading && v.reading !== v.term && <div className="reading">{v.reading}</div>}
                    {v.reading && <div className="romaji">{toRomaji(v.reading)}</div>}
                    <div className="small" style={{ marginTop: 4 }}>
                      {v.tr}
                    </div>
                    {v.pos && <div className="tiny faint">{v.pos}</div>}
                  </div>
                  <SpeakBtn text={v.term} lang={v.lang} reading={v.reading} />
                </div>
                {v.examples?.[0] && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
                    <div className="ja" style={{ fontSize: '0.98rem' }}>
                      {v.examples[0].text}
                    </div>
                    {v.examples[0].reading && <div className="reading tiny">{v.examples[0].reading}</div>}
                    <div className="tiny dim">{v.examples[0].tr}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (section.kind === 'grammar') {
    return (
      <div className="stack">
        <h2>{section.title}</h2>
        {section.grammarIds.map((id) => {
          const p = GRAMMAR_BY_ID.get(id)
          if (!p) return null
          return (
            <div key={id} className="stack">
              <div className="card">
                <div className="row">
                  <div className="card-title" style={{ flex: 1 }}>
                    {p.title}
                  </div>
                  <Badge tone={p.lang}>{p.level}</Badge>
                </div>
                <div className="card-sub" style={{ marginTop: 4 }}>
                  {p.summaryTr}
                </div>
                <div className="row-wrap" style={{ marginTop: 10 }}>
                  {p.patterns.map((pt) => (
                    <span key={pt} className="badge badge--accent ja">
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
              <Markdown text={p.explanationTr} />
              <div className="stack-sm">
                {p.examples.map((ex, ei) => (
                  <div key={ei} className="card">
                    <div className="row">
                      <div style={{ flex: 1 }}>
                        <div className={p.lang === 'ja' ? 'ja' : ''} style={{ fontSize: '1.05rem' }}>
                          {ex.text}
                        </div>
                        {ex.reading && <div className="reading tiny">{ex.reading}</div>}
                        <div className="small dim">{ex.tr}</div>
                      </div>
                      <SpeakBtn text={ex.text} lang={p.lang} size="sm" reading={ex.reading} />
                    </div>
                  </div>
                ))}
              </div>
              {p.pitfalls?.length ? (
                <div className="feedback feedback--info">
                  <div className="bold small" style={{ marginBottom: 4 }}>
                    Dikkat
                  </div>
                  {p.pitfalls.map((x, xi) => (
                    <div key={xi} className="small">
                      • {x}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  if (section.kind === 'kana') {
    return (
      <div className="stack">
        <h2>{section.title}</h2>
        <div className="grid grid-kana">
          {section.chars.map((c) => {
            const k = KANA_BY_CHAR.get(c)
            return (
              <button key={c} className="kana-cell" onClick={() => speak(c, 'ja')}>
                <span className="c">{c}</span>
                <span className="r">{k?.romaji ?? ''}</span>
              </button>
            )
          })}
        </div>
        <div className="stack-sm">
          {section.chars.map((c) => {
            const k = KANA_BY_CHAR.get(c)
            if (!k?.mnemonic) return null
            return (
              <div key={c} className="row small">
                <span className="ja" style={{ fontSize: '1.3rem', width: 34 }}>
                  {c}
                </span>
                <span className="dim">{k.mnemonic}</span>
              </div>
            )
          })}
        </div>
        <div className="feedback feedback--info">
          Karakterlere dokunarak sesini dinleyebilirsin. Her birini en az üç kez kâğıda yazmadan geçme.
        </div>
      </div>
    )
  }

  if (section.kind === 'kanji') {
    return (
      <div className="stack">
        <h2>{section.title}</h2>
        {section.chars.map((c) => {
          const k = KANJI_BY_CHAR.get(c)
          if (!k) return null
          return (
            <div key={c} className="card">
              <div className="row">
                <div className="ja" style={{ fontSize: '3rem', lineHeight: 1, width: 62, textAlign: 'center' }}>
                  {c}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title">{k.meaningsTr.join(', ')}</div>
                  <div className="tiny faint">{k.strokes} çizgi</div>
                  {k.on.length > 0 && (
                    <div className="tiny dim">
                      on: <span className="ja">{k.on.join('・')}</span>
                    </div>
                  )}
                  {k.kun.length > 0 && (
                    <div className="tiny dim">
                      kun: <span className="ja">{k.kun.join('・')}</span>
                    </div>
                  )}
                </div>
                <SpeakBtn text={c} lang="ja" size="sm" />
              </div>
              {k.words.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
                  {k.words.map((w) => (
                    <div key={w.term} className="row small" style={{ gap: 8 }}>
                      <span className="ja bold">{w.term}</span>
                      <span className="reading tiny">{w.reading}</span>
                      <span className="dim tiny">{w.tr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (section.kind === 'passage') return <PassageView section={section} />

  return null
}

/**
 * Okuma parçası.
 *
 * Furigana açık başlar (yeni kanjileri okuyabilmek için), ama kapatılabilir —
 * asıl hedef okunuşa bakmadan okuyabilmektir. Metin satır satır verilir;
 * her satır ayrı dinlenebilir, çünkü bir paragrafın tamamını dinlemek
 * takıldığın cümleyi bulmayı zorlaştırır.
 */
const NEWLINE = /\r?\n/

function PassageView({ section }: { section: Extract<LessonSection, { kind: 'passage' }> }) {
  const [furigana, setFurigana] = useState(true)
  const [tr, setTr] = useState(false)
  const ja = section.lang === 'ja'
  const lines = section.text.split(NEWLINE).filter((l) => l.trim())
  const trLines = section.tr.split(NEWLINE).filter((l) => l.trim())

  return (
    <div className="stack">
      <h2>{section.title}</h2>

      <div className="row-wrap" style={{ gap: 6 }}>
        <SpeakBtn
          text={stripFurigana(section.text)}
          lang={section.lang}
          reading={section.reading ?? furiganaReading(section.text)}
        />
        {ja && (
          <button
            className={`btn btn--sm btn--ghost${furigana ? ' is-on' : ''}`}
            onClick={() => setFurigana((f) => !f)}
          >
            {furigana ? 'Furigana açık' : 'Furigana kapalı'}
          </button>
        )}
        <button className={`btn btn--sm btn--ghost${tr ? ' is-on' : ''}`} onClick={() => setTr((t) => !t)}>
          Türkçe
        </button>
      </div>

      <div className="card stack-sm">
        {lines.map((line, i) => (
          <div key={i} className="passage-line">
            <SpeakBtn text={stripFurigana(line)} lang={section.lang} size="sm" reading={furiganaReading(line)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {ja ? (
                <JaText text={furigana ? line : stripFurigana(line)} className="ja-text" />
              ) : (
                <span>{line}</span>
              )}
              {tr && <div className="small dim" style={{ marginTop: 2 }}>{trLines[i] ?? ''}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="tiny faint">
        Önce furiganayı kapatıp dene; takıldığında aç. Bir cümleyi anlamadan sonrakine geçme.
      </div>
    </div>
  )
}
