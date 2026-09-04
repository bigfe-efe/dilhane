import { useEffect, useMemo, useRef, useState } from 'react'
import { toKana } from 'wanakana'
import type { Exercise } from '@/types'
import { SpeakBtn } from './ui'
import { Icon, RecordDot } from './icons'
import { DrawCanvas } from './DrawCanvas'
import { speak } from '@/lib/tts'
import { shuffle } from '@/lib/shuffle'
import { RecognitionError, listenOnce, scoreAgainst, scoreLabel, startRecording, sttAvailable, normalize } from '@/lib/stt'
import { db } from '@/db/db'
import { romajiOf } from '@/lib/ja-phonetic'

/**
 * Serbest metin cevaplarını karşılaştırmak için sadeleştirme.
 * Katakana hiraganaya çevrilir, noktalama ve boşluk atılır, büyük/küçük harf
 * ayrımı (Türkçe İ/ı dahil) kaldırılır.
 */
function loose(s: string): string {
  return normalize(s, 'ja')
}

const LATIN_ONLY = /^[a-zA-ZıİşŞğĞçÇöÖüÜ\s'’-]+$/
const HAS_KANA = /[ぁ-ゟァ-ヿ]/

/**
 * Cevap doğru mu?
 *
 * ROMAJİ DE KABUL EDİLİR. Buradaki yorum eskiden bunu söylüyordu ama kod
 * yapmıyordu: yalnızca kana karşılaştırılıyordu. Sonuç, Japonca klavyesi
 * olmayan biri için çözülemeyen alıştırmalardı — すみません dikte
 * alıştırmasında "sumimasen" yazmak yanlış sayılıyordu ve ekranda
 * beklenen yazım biçimi de yazmıyordu.
 *
 * İki yönlü deneniyor, çünkü ikisi de tek başına yetmiyor:
 *   • girdi romaji → kanaya çevrilip karşılaştırılır  (sumimasen → すみません)
 *   • cevap kana   → romajiye çevrilip karşılaştırılır (ekler düzeltilerek:
 *     わたしは "watashi wa" okunur, "watashi ha" değil — öğrenci duyduğunu
 *     yazıyor, yazılışını değil)
 */
function accepts(input: string, answers: string[]): boolean {
  const a = loose(input)
  if (answers.some((x) => loose(x) === a)) return true

  const ham = input.trim()
  if (!ham || !LATIN_ONLY.test(ham)) return false

  const kanaGirdi = loose(toKana(ham.toLowerCase(), { IMEMode: false }))
  return answers.some((x) => {
    if (!HAS_KANA.test(x)) return false
    if (loose(x) === kanaGirdi) return true
    // Kanjili cevaplarda bu eşleşmez; zararı yok, sadece tutmaz.
    return loose(romajiOf(x).text) === a
  })
}

/** Metinde kana veya kanji var mı? */
function hasJapanese(t: string): boolean {
  return /[ぁ-ヿ㐀-鿿]/.test(t)
}

export function ExerciseView({ exercise, onDone }: { exercise: Exercise; onDone: (correct: boolean) => void }) {
  // Alıştırma değiştiğinde iç durum sıfırlansın diye key kullanılıyor
  return <Inner key={exercise.id} exercise={exercise} onDone={onDone} />
}

function Inner({ exercise, onDone }: { exercise: Exercise; onDone: (correct: boolean) => void }) {
  const [done, setDone] = useState<null | boolean>(null)

  const finish = (correct: boolean) => setDone(correct)

  // Cevap verildikten sonra Enter/boşluk ile devam — fareye uzanmadan çalışmak
  // uzun alıştırma dizilerinde ritmi bozmuyor
  useEffect(() => {
    if (done === null) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onDone(done)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, onDone])

  return (
    <div className="stack">
      {/*
        Soru metninde Japonca karakter geçiyorsa ("「ろ」 nasıl okunur?" gibi)
        metin büyütülür. Küçük puntoda ろ/る, ね/れ/わ gibi çiftler ekranda
        ayırt edilemiyordu — asıl ölçülmek istenen şey karakteri tanımak
        olduğu için okunaklılık burada işlevsel bir gereklilik.
      */}
      <div className={hasJapanese(exercise.prompt) ? 'prompt-ja' : 'small dim'}>{exercise.prompt}</div>

      {exercise.type === 'mcq' && <Mcq ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'fill' && <Fill ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'match' && <Match ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'dictation' && <Dictation ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'translate' && <Translate ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'order' && <Order ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'speak' && <Speak ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'write' && <WriteChar ex={exercise} done={done} finish={finish} />}
      {exercise.type === 'free-writing' && <FreeWriting ex={exercise} done={done} finish={finish} />}

      {done !== null && (
        <>
          {exercise.explanation && <div className="feedback feedback--info">{exercise.explanation}</div>}
          <button className="btn btn--primary btn--block" onClick={() => onDone(done)}>
            Devam
          </button>
        </>
      )}
    </div>
  )
}

// ————————————————————————— Çoktan seçmeli —————————————————————————

function Mcq({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'mcq' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    finish(i === ex.answer)
  }

  // 1–4 tuşlarıyla şık seçme.
  //
  // Bağımlılık dizisi ŞART: dizisiz hâlinde dinleyici her yeniden çizimde
  // sökülüp yeniden takılıyordu. `ex` burada sabittir — ExerciseView bileşeni
  // alıştırma başına `key` verdiği için soru değişince bu bileşen komple
  // yeniden kurulur, dolayısıyla bayat kapanış riski yok.
  useEffect(() => {
    if (picked !== null) return // cevap verildi, dinlemeye gerek yok
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      const n = Number(e.key)
      if (n >= 1 && n <= ex.options.length) {
        e.preventDefault()
        setPicked(n - 1)
        finish(n - 1 === ex.answer)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picked, ex, finish])

  return (
    <div className="stack-sm">
      {ex.options.map((opt, i) => {
        let cls = 'option'
        if (picked !== null) {
          if (i === ex.answer) cls += ' is-correct'
          else if (i === picked) cls += ' is-wrong'
          else cls += ' is-muted'
        }
        // Şık tek bir karakterse (kana/kanji tanıma soruları) büyük göster.
        // Boyut clamp ile veriliyor: dar ekranda taşmasın, geniş ekranda da
        // küçük kalmasın. Karakterleri ayırt etmek bu alıştırmanın kendisi
        // olduğu için punto burada süs değil, işlevin parçası.
        const glyphOnly = /^[ぁ-ヿ㐀-鿿]{1,3}$/.test(opt)
        return (
          <button key={i} className={`${cls}${glyphOnly ? ' option--glyph' : ''}`} onClick={() => choose(i)}>
            <span className="key" title="Klavyeden bu sayıya basabilirsin">{i + 1}</span>
            <span className="ja" style={{ fontSize: glyphOnly ? 'clamp(2.8rem, 9vw, 3.6rem)' : '1.02rem', lineHeight: 1.15 }}>
              {opt}
            </span>
            {ex.optionHints?.[i] && <span className="tiny faint">{ex.optionHints[i]}</span>}
          </button>
        )
      })}
      {done === false && <div className="feedback feedback--bad">Doğrusu: {ex.options[ex.answer]}</div>}
    </div>
  )
}

// ————————————————————————— Boşluk doldurma —————————————————————————

function Fill({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'fill' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [val, setVal] = useState('')
  const [parts] = useState(() => ex.sentence.split('___'))

  const check = () => {
    if (!val.trim() || done !== null) return
    finish(accepts(val, ex.answers))
  }

  return (
    <div className="stack-sm">
      <div className="card">
        <div className="ja" style={{ fontSize: '1.15rem', lineHeight: 2 }}>
          {parts[0]}
          <span
            style={{
              display: 'inline-block',
              minWidth: 92,
              borderBottom: `2px solid ${done === null ? 'var(--line)' : done ? 'var(--ok)' : 'var(--bad)'}`,
              textAlign: 'center',
              padding: '0 6px',
            }}
          >
            {val || ' '}
          </span>
          {parts[1]}
        </div>
        {ex.translation && <div className="small dim" style={{ marginTop: 6 }}>{ex.translation}</div>}
      </div>

      <input
        className={`field${done === null ? '' : done ? ' is-correct' : ' is-wrong'}`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && check()}
        placeholder={ex.hint ?? 'Cevabını yaz'}
        disabled={done !== null}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {done === null ? (
        <button className="btn btn--primary btn--block" onClick={check} disabled={!val.trim()}>
          Kontrol et
        </button>
      ) : (
        !done && <div className="feedback feedback--bad">Doğrusu: {ex.answers[0]}</div>
      )}
    </div>
  )
}

// ————————————————————————— Eşleştirme —————————————————————————

function Match({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'match' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const rights = useMemo(() => shuffle(ex.pairs.map((p) => p.right)), [ex])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [wrong, setWrong] = useState(0)

  const pickRight = (r: string) => {
    if (!selectedLeft) return
    const correct = ex.pairs.find((p) => p.left === selectedLeft)?.right === r
    if (correct) {
      const next = { ...matched, [selectedLeft]: r }
      setMatched(next)
      if (Object.keys(next).length === ex.pairs.length) finish(wrong === 0)
    } else {
      setWrong((w) => w + 1)
    }
    setSelectedLeft(null)
  }

  return (
    <div className="grid grid-2">
      <div className="stack-sm">
        {ex.pairs.map((p) => (
          <button
            key={p.left}
            className={`option${matched[p.left] ? ' is-correct' : selectedLeft === p.left ? ' is-wrong' : ''}`}
            style={{ padding: 11 }}
            disabled={!!matched[p.left] || done !== null}
            onClick={() => setSelectedLeft(p.left)}
          >
            <span className="ja" style={{ fontSize: [...p.left].length <= 3 ? '2rem' : '1.1rem', lineHeight: 1.2 }}>
              {p.left}
            </span>
          </button>
        ))}
      </div>
      <div className="stack-sm">
        {rights.map((r) => {
          const used = Object.values(matched).includes(r)
          return (
            <button
              key={r}
              className={`option${used ? ' is-correct' : ''}`}
              style={{ padding: 11 }}
              disabled={used || done !== null}
              onClick={() => pickRight(r)}
            >
              {r}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ————————————————————————— Dikte —————————————————————————

function Dictation({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'dictation' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [val, setVal] = useState('')
  const played = useRef(false)

  // Alıştırma açılınca bir kez otomatik çal
  useEffect(() => {
    if (played.current) return
    played.current = true
    const t = setTimeout(() => speak(ex.text, ex.lang), 350)
    return () => clearTimeout(t)
  }, [ex])

  const check = () => {
    if (!val.trim() || done !== null) return
    finish(accepts(val, [ex.text, ...ex.answers]))
  }

  return (
    <div className="stack-sm">
      <div className="card center stack-sm" style={{ padding: 22 }}>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn--lg" onClick={() => speak(ex.text, ex.lang)}>
            <Icon name="speaker" size={17} />
            Dinle
          </button>
          <button className="btn" onClick={() => speak(ex.text, ex.lang, { rate: 0.6 })} title="Yavaş dinle">
            <Icon name="turtle" size={17} />
          </button>
        </div>
        <div className="tiny faint">İstediğin kadar tekrar dinleyebilirsin</div>
      </div>

      {/*
        Beklenen yazım biçimi AÇIKÇA yazıyor. Önce yalnızca "Duyduğunu yaz"
        diyordu; Japonca klavyesi olmayan biri ne yazacağını bilemiyor ve
        çoğu zaman Türkçe anlamı yazıp yanlış alıyordu.
      */}
      <div className="tiny faint">Kana ya da romaji yazabilirsin — ikisi de kabul edilir. Türkçe anlamı değil, DUYDUĞUN sesi yaz.</div>

      <input
        className={`field${done === null ? '' : done ? ' is-correct' : ' is-wrong'}`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && check()}
        placeholder="ör. sumimasen"
        disabled={done !== null}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {done === null ? (
        <button className="btn btn--primary btn--block" onClick={check} disabled={!val.trim()}>
          Kontrol et
        </button>
      ) : (
        <div className={`feedback ${done ? 'feedback--ok' : 'feedback--bad'}`}>
          {/*
            İki satır da ETİKETLİ. Etiketsizken Japonca metnin altındaki
            Türkçe çeviri de "beklenen cevap" sanılıyordu: öğrenci Türkçeyi
            yazıp yanlış alınca hatayı büyük/küçük harfte arıyordu.
          */}
          <div className="tiny" style={{ opacity: 0.75 }}>{done ? 'Doğru' : 'Doğrusu'}</div>
          <div className="ja bold" style={{ fontSize: '1.05rem' }}>
            {ex.text}
          </div>
          <div className="small" style={{ opacity: 0.85 }}>
            anlamı: {ex.translation}
          </div>
        </div>
      )}
    </div>
  )
}

// ————————————————————————— Çeviri —————————————————————————

function Translate({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'translate' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [val, setVal] = useState('')

  const check = () => {
    if (!val.trim() || done !== null) return
    finish(accepts(val, ex.answers))
  }

  return (
    <div className="stack-sm">
      <div className="card">
        <div className="ja" style={{ fontSize: '1.25rem' }}>
          {ex.source}
        </div>
        {ex.sourceReading && <div className="reading">{ex.sourceReading}</div>}
      </div>
      <textarea
        className={`field${done === null ? '' : done ? ' is-correct' : ' is-wrong'}`}
        style={{ minHeight: 74 }}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Çevirini yaz"
        disabled={done !== null}
        spellCheck={false}
      />
      {done === null ? (
        <button className="btn btn--primary btn--block" onClick={check} disabled={!val.trim()}>
          Kontrol et
        </button>
      ) : (
        <div className={`feedback ${done ? 'feedback--ok' : 'feedback--bad'}`}>
          Kabul edilen cevap: <span className="ja bold">{ex.answers[0]}</span>
          {ex.answers.length > 1 && (
            <div className="tiny" style={{ marginTop: 4, opacity: 0.8 }}>
              Diğer kabul edilenler: {ex.answers.slice(1).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ————————————————————————— Sıralama —————————————————————————

function Order({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'order' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const pool = useMemo(() => shuffle(ex.tokens.map((t, i) => ({ t, i }))), [ex])
  const [built, setBuilt] = useState<{ t: string; i: number }[]>([])

  const add = (item: { t: string; i: number }) => {
    if (done !== null) return
    setBuilt((b) => [...b, item])
  }
  const remove = (idx: number) => {
    if (done !== null) return
    setBuilt((b) => b.filter((_, i) => i !== idx))
  }

  const check = () => {
    if (done !== null) return
    finish(built.map((b) => b.t).join('') === ex.tokens.join(''))
  }

  const usedIdx = new Set(built.map((b) => b.i))

  return (
    <div className="stack-sm">
      <div
        className="card"
        style={{
          minHeight: 76,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 7,
          alignContent: 'flex-start',
          borderColor: done === null ? undefined : done ? 'var(--ok)' : 'var(--bad)',
        }}
      >
        {built.length === 0 && <span className="faint small">Aşağıdan seçerek cümleyi kur</span>}
        {built.map((b, i) => (
          <button key={`${b.i}-${i}`} className="token" onClick={() => remove(i)}>
            {b.t}
          </button>
        ))}
      </div>

      <div className="row-wrap">
        {pool.map((p) => (
          <button key={p.i} className={`token${usedIdx.has(p.i) ? ' is-used' : ''}`} onClick={() => add(p)}>
            {p.t}
          </button>
        ))}
      </div>

      {ex.translation && <div className="small dim">{ex.translation}</div>}

      {done === null ? (
        <button className="btn btn--primary btn--block" onClick={check} disabled={built.length !== ex.tokens.length}>
          Kontrol et
        </button>
      ) : (
        !done && (
          <div className="feedback feedback--bad">
            Doğrusu: <span className="ja bold">{ex.tokens.join(' ')}</span>
          </div>
        )
      )}
    </div>
  )
}

// ————————————————————————— Konuşma —————————————————————————

function Speak({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'speak' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [state, setState] = useState<'idle' | 'listening' | 'result' | 'error'>('idle')
  const [said, setSaid] = useState('')
  const [score, setScore] = useState(0)
  const [err, setErr] = useState('')
  const [recordUrl, setRecordUrl] = useState<string | null>(null)
  const recorder = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null)
  const stopFn = useRef<(() => void) | null>(null)

  const accepted = [ex.text, ...(ex.reading ? [ex.reading] : [])]

  const listen = async () => {
    setState('listening')
    setErr('')
    const { promise, stop } = listenOnce(ex.lang)
    stopFn.current = stop
    try {
      const res = await promise
      const best = res.alternatives.reduce((b, alt) => Math.max(b, scoreAgainst(alt, accepted, ex.lang)), 0)
      setSaid(res.transcript)
      setScore(best)
      setState('result')
      finish(best >= 70)
    } catch (e) {
      setErr(e instanceof RecognitionError ? e.message : 'Bir sorun oluştu.')
      setState('error')
    }
  }

  const toggleRecord = async () => {
    if (recorder.current) {
      const url = await recorder.current.stop()
      recorder.current = null
      setRecordUrl(url)
      setState('idle')
      return
    }
    try {
      recorder.current = await startRecording()
      setState('listening')
    } catch {
      setErr('Mikrofona erişilemedi.')
      setState('error')
    }
  }

  useEffect(
    () => () => {
      stopFn.current?.()
      recorder.current?.cancel()
    },
    [],
  )

  const label = scoreLabel(score)

  return (
    <div className="stack-sm">
      <div className="card center stack-sm" style={{ padding: 20 }}>
        <div className={ex.lang === 'ja' ? 'ja-md' : ''} style={{ fontWeight: 600 }}>
          {ex.text}
        </div>
        {ex.reading && <div className="reading">{ex.reading}</div>}
        <div className="small dim">{ex.tr}</div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 4 }}>
          <SpeakBtn text={ex.text} lang={ex.lang} reading={ex.reading} />
          <span className="tiny faint">Önce dinle</span>
        </div>
      </div>

      {state === 'result' && (
        <div className={`feedback ${score >= 70 ? 'feedback--ok' : 'feedback--bad'}`}>
          <div className="row">
            <span className="bold">{label.text}</span>
            <div className="spacer" />
            <span className="bold">%{score}</span>
          </div>
          <div className="small" style={{ marginTop: 4, opacity: 0.9 }}>
            Duyulan: <span className="ja">{said || '—'}</span>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="feedback feedback--info">
          {err}
          <div className="tiny" style={{ marginTop: 6 }}>
            Konuşma tanıma çalışmıyorsa aşağıdan kendi sesini kaydedip model sesle karşılaştırabilirsin.
          </div>
        </div>
      )}

      {recordUrl && (
        <div className="card stack-sm">
          <div className="small dim">Kendi kaydın</div>
          <audio controls src={recordUrl} style={{ width: '100%' }} />
        </div>
      )}

      <div className="row">
        {sttAvailable() ? (
          <button
            className={`btn btn--primary${state === 'listening' ? ' pulse' : ''}`}
            style={{ flex: 1 }}
            onClick={state === 'listening' ? () => stopFn.current?.() : listen}
            disabled={done !== null && state !== 'error'}
          >
            {state === 'listening' ? (
              <>
                <RecordDot /> Dinleniyor…
              </>
            ) : (
              <>
                <Icon name="mic" size={16} /> Söyle
              </>
            )}
          </button>
        ) : (
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={toggleRecord}>
            {recorder.current ? (
              <>
                <Icon name="stop" size={15} /> Durdur
              </>
            ) : (
              <>
                <Icon name="mic" size={16} /> Kaydet
              </>
            )}
          </button>
        )}
        <button className="btn btn--ghost" onClick={toggleRecord} title="Kendi sesini kaydet">
          {recorder.current ? <Icon name="stop" size={15} /> : <RecordDot size={11} />}
        </button>
        {done === null && (
          <button className="btn btn--ghost" onClick={() => finish(true)} title="Bu alıştırmayı geç">
            Atla
          </button>
        )}
      </div>
    </div>
  )
}

// ————————————————————————— Karakter yazma —————————————————————————

function WriteChar({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'write' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [showGhost, setShowGhost] = useState(true)
  const [strokes, setStrokes] = useState(0)

  return (
    <div className="stack-sm">
      <div className="card center">
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="ja" style={{ fontSize: '2.6rem' }}>
            {ex.target}
          </div>
          <div className="stack-sm" style={{ gap: 2 }}>
            <div className="romaji">{ex.reading}</div>
            {ex.tr && <div className="tiny dim">{ex.tr}</div>}
          </div>
        </div>
      </div>

      <DrawCanvas ghost={ex.target} showGhost={showGhost} onStrokesChange={setStrokes} />

      <div className="row">
        <button className="btn btn--sm btn--ghost" onClick={() => setShowGhost((s) => !s)}>
          <Icon name={showGhost ? 'eyeOff' : 'eye'} size={15} />
          {showGhost ? 'Şablonu gizle' : 'Şablonu göster'}
        </button>
        <div className="spacer" />
      </div>

      {done === null && (
        <button className="btn btn--primary btn--block" onClick={() => finish(true)} disabled={strokes === 0}>
          Yazdım
        </button>
      )}
      {done !== null && (
        <div className="feedback feedback--info">
          Şablonu kapatıp bir kez daha yazmayı dene — kas hafızası ancak böyle oluşur.
        </div>
      )}
    </div>
  )
}

// ————————————————————————— Serbest yazma —————————————————————————

function FreeWriting({
  ex,
  done,
  finish,
}: {
  ex: Extract<Exercise, { type: 'free-writing' }>
  done: boolean | null
  finish: (c: boolean) => void
}) {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<boolean[]>(() => ex.rubric.map(() => false))
  const [showSample, setShowSample] = useState(false)

  const words =
    ex.lang === 'ja' ? text.replace(/\s/g, '').length : text.trim().split(/\s+/).filter(Boolean).length
  const enough = words >= ex.minWords
  const allChecked = checked.every(Boolean)

  const submit = async () => {
    await db.submissions.add({
      kind: 'writing',
      lang: ex.lang,
      exerciseId: ex.id,
      prompt: ex.prompt,
      content: text,
      at: Date.now(),
    })
    finish(allChecked)
  }

  return (
    <div className="stack-sm">
      <textarea
        className="field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Japonca yaz…"
        disabled={done !== null}
        spellCheck={false}
      />
      <div className="row tiny">
        <span className={enough ? 'dim' : 'faint'}>
          {words} karakter / en az {ex.minWords}
        </span>
        <div className="spacer" />
        <span className="faint">Yazdıkların cihazında saklanır</span>
      </div>

      <div className="card stack-sm">
        <div className="card-title">Kendini değerlendir</div>
        <div className="card-sub">Yazdığını okuyup her maddeyi tek tek kontrol et.</div>
        {ex.rubric.map((r, i) => (
          <label key={i} className="row small tap" style={{ alignItems: 'flex-start', gap: 9 }}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              disabled={done !== null}
              style={{ marginTop: 4, accentColor: 'var(--accent)' }}
            />
            <span className={checked[i] ? 'dim' : ''}>{r}</span>
          </label>
        ))}
      </div>

      {ex.sampleAnswer && (
        <>
          <button className="btn btn--sm btn--ghost" onClick={() => setShowSample((s) => !s)}>
            {showSample ? 'Örneği gizle' : 'Örnek cevabı gör'}
          </button>
          {showSample && (
            <div className="card">
              <div className="tiny faint" style={{ marginBottom: 6 }}>
                Örnek — kendi cevabını yazmadan bakma
              </div>
              <div className={ex.lang === 'ja' ? 'ja-text' : 'small'} style={{ whiteSpace: 'pre-wrap' }}>
                {ex.sampleAnswer}
              </div>
            </div>
          )}
        </>
      )}

      {done === null && (
        <button className="btn btn--primary btn--block" onClick={submit} disabled={!enough}>
          {enough ? 'Kaydet ve devam' : `En az ${ex.minWords} ${ex.lang === 'ja' ? 'karakter' : 'kelime'} yaz`}
        </button>
      )}
    </div>
  )
}
