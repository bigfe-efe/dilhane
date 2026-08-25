import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { Badge, Chips, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { HIRAGANA, KATAKANA } from '@/content/ja/kana'
import { shuffle } from '@/lib/shuffle'
import { bumpStat } from '@/db/db'

// Kana hız testi.
//
// Neden ayrı bir mod: "tanımak" ile "akıcı okumak" farklı becerilerdir.
// Bir kanayı 4 saniye düşünüp bilmek, ders alıştırmasında doğru sayılır ama
// gerçek metin okurken işe yaramaz — cümlenin sonuna geldiğinde başını
// unutmuş olursun. Akıcılık ancak süre baskısı altında ölçülür ve gelişir.
//
// Cevap klavyeden romaji olarak yazılır; doğru yazınca kendiliğinden sonraki
// karaktere geçer. Böylece tek tuşla ilerlenir, ritim bozulmaz.

type Deck = 'hiragana' | 'katakana' | 'both'
type Length = 30 | 60 | 120

const DECKS: { id: Deck; label: string }[] = [
  { id: 'hiragana', label: 'ひらがな' },
  { id: 'katakana', label: 'カタカナ' },
  { id: 'both', label: 'Karışık' },
]

const LENGTHS: { id: string; label: string }[] = [
  { id: '30', label: '30 sn' },
  { id: '60', label: '60 sn' },
  { id: '120', label: '2 dk' },
]

interface Result {
  correct: number
  wrong: number
  seconds: number
  missed: { char: string; romaji: string; typed: string }[]
}

const BEST_KEY = 'kana-speed-best'

function loadBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export default function KanaSpeedPage() {
  const nav = useNavigate()
  const [deck, setDeck] = useState<Deck>('hiragana')
  const [length, setLength] = useState<Length>(60)
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [queue, setQueue] = useState<KanaChar[]>([])
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [left, setLeft] = useState<number>(length)
  const [result, setResult] = useState<Result | null>(null)
  const [best, setBest] = useState<Record<string, number>>(loadBest)

  const score = useRef({ correct: 0, wrong: 0 })
  const missed = useRef<Result['missed']>([])
  const input = useRef<HTMLInputElement>(null)

  const pool = useMemo(() => {
    const base = deck === 'katakana' ? KATAKANA : deck === 'both' ? [...HIRAGANA, ...KATAKANA] : HIRAGANA
    // Yōon iki karakterdir, hız testinde ölçüyü bozar — temel + dakuten yeter
    return base.filter((k) => k.kind !== 'yoon')
  }, [deck])

  const bestKey = `${deck}-${length}`

  const finish = useCallback(() => {
    const r: Result = { ...score.current, seconds: length, missed: missed.current }
    setResult(r)
    setPhase('done')
    const perMin = Math.round((r.correct / length) * 60)
    const prev = loadBest()
    if (!prev[bestKey] || perMin > prev[bestKey]) {
      const next = { ...prev, [bestKey]: perMin }
      localStorage.setItem(BEST_KEY, JSON.stringify(next))
      setBest(next)
    }
    bumpStat({ reviews: r.correct + r.wrong, correct: r.correct, ja: 1 })
  }, [bestKey, length])

  // Geri sayım
  useEffect(() => {
    if (phase !== 'running') return
    if (left <= 0) {
      finish()
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left, finish])

  const start = () => {
    score.current = { correct: 0, wrong: 0 }
    missed.current = []
    // Havuz bitmesin diye birkaç tur karıştırıp arka arkaya ekliyoruz
    setQueue([...shuffle(pool), ...shuffle(pool), ...shuffle(pool)])
    setIdx(0)
    setTyped('')
    setLeft(length)
    setResult(null)
    setPhase('running')
    setTimeout(() => input.current?.focus(), 50)
  }

  const current = queue[idx]

  /** Yazılan metin doğru cevabın tamamıysa geç; yanlış uzunluğa ulaştıysa hata say. */
  const onType = (value: string) => {
    if (!current || phase !== 'running') return
    const v = value.toLowerCase().replace(/[^a-z]/g, '')
    setTyped(v)

    const answer = current.romaji
    if (v === answer) {
      score.current.correct++
      setFlash('ok')
      setTyped('')
      setIdx((n) => n + 1)
      setTimeout(() => setFlash(null), 120)
      return
    }
    // Yanlış: doğru cevapla aynı uzunluğa geldiyse ve tutmuyorsa
    if (v.length >= answer.length) {
      score.current.wrong++
      missed.current.push({ char: current.char, romaji: answer, typed: v })
      setFlash('bad')
      setTyped('')
      setIdx((n) => n + 1)
      setTimeout(() => setFlash(null), 220)
    }
  }

  const skip = () => {
    if (!current) return
    score.current.wrong++
    missed.current.push({ char: current.char, romaji: current.romaji, typed: typed || '—' })
    setTyped('')
    setIdx((n) => n + 1)
    setFlash('bad')
    setTimeout(() => setFlash(null), 220)
  }

  // ————————————————————————— Görünümler —————————————————————————

  if (phase === 'running' && current) {
    return (
      <div className="speed lang-ja">
        <div className="speed-top row">
          <button className="btn btn--sm btn--ghost" onClick={() => setPhase('idle')}>
            <Icon name="close" size={15} />
            Bitir
          </button>
          <div className="spacer" />
          <span className={`speed-clock${left <= 10 ? ' is-low' : ''}`}>{left}</span>
          <div className="spacer" />
          <span className="tiny dim">
            <Icon name="check" size={13} /> {score.current.correct} · <Icon name="close" size={13} />{' '}
            {score.current.wrong}
          </span>
        </div>

        <div className={`speed-char ja${flash ? ` flash-${flash}` : ''}`}>{current.char}</div>

        <div className="speed-bottom stack-sm">
          <input
            ref={input}
            className="field speed-input"
            value={typed}
            onChange={(e) => onType(e.target.value)}
            placeholder="okunuşunu yaz"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
          />
          <div className="row">
            <span className="tiny faint" style={{ flex: 1 }}>
              Doğru yazınca kendiliğinden geçer. Bilmiyorsan atla.
            </span>
            <button className="btn btn--sm btn--ghost" onClick={skip}>
              Atla
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done' && result) {
    const perMin = Math.round((result.correct / result.seconds) * 60)
    const total = result.correct + result.wrong
    const acc = total > 0 ? Math.round((result.correct / total) * 100) : 0
    const record = best[bestKey] ?? 0
    const isRecord = perMin >= record && perMin > 0

    return (
      <>
        <TopBar title="Hız testi sonucu" back="/" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <span className="result-mark">
              <Icon name={isRecord ? 'trophy' : acc >= 90 ? 'target' : 'flame'} size={28} />
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{perMin}</div>
            <div className="dim">dakikada kana</div>
            {isRecord && <Badge tone="ok">Yeni rekor</Badge>}
          </div>

          <div className="grid grid-2">
            <div className="card center">
              <div className="tiny faint">Doğru</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 650 }}>{result.correct}</div>
            </div>
            <div className="card center">
              <div className="tiny faint">Doğruluk</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 650 }}>%{acc}</div>
            </div>
          </div>

          <div className="card stack-sm">
            <div className="card-title">Bu ne anlama geliyor?</div>
            <div className="card-sub">
              {perMin < 20
                ? 'Henüz her karakteri düşünerek okuyorsun. Bu normal — önce doğruluk, hız sonra gelir.'
                : perMin < 40
                  ? 'Tanıma oturmuş, hız gelişiyor. Dakikada 60’a çıkınca kelimeleri bir bakışta okumaya başlarsın.'
                  : perMin < 60
                    ? 'İyi seviyedesin. Artık kanayı tek tek değil, hece olarak görüyorsun.'
                    : 'Akıcı okuyorsun. Kana artık düşünme yükü olmaktan çıktı — asıl dikkatini dilbilgisine ayırabilirsin.'}
            </div>
            {record > 0 && <div className="tiny faint">Bu moddaki rekorun: {record} kana/dk</div>}
          </div>

          {result.missed.length > 0 && (
            <div className="stack-sm">
              <h2>Takıldıkların ({result.missed.length})</h2>
              <div className="card stack-sm">
                {result.missed.slice(0, 15).map((m, i) => (
                  <div key={i} className="row small">
                    <span className="ja" style={{ fontSize: '1.8rem', width: 44, textAlign: 'center' }}>
                      {m.char}
                    </span>
                    <span className="bold">{m.romaji}</span>
                    <div className="spacer" />
                    <span className="tiny faint">yazdığın: {m.typed}</span>
                  </div>
                ))}
              </div>
              <div className="tiny faint">
                Bu karakterleri kana tablosunda açıp çizgi sırasıyla birlikte tekrar et — yazarken hatırlamak,
                okurken hatırlamayı da güçlendirir.
              </div>
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--lang btn--block" onClick={start}>
              Tekrar dene
            </button>
            <button className="btn btn--block" onClick={() => setPhase('idle')}>
              Ayarları değiştir
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => nav('/kana/hiragana')}>
              Kana tablosuna git
            </button>
          </div>
        </div>
      </>
    )
  }

  // idle
  return (
    <>
      <TopBar title="Kana hız testi" sub="Akıcılığını ölç" back="/" />
      <div className="page stack-lg lang-ja">
        <div className="card stack-sm">
          <div className="card-title">Tanımak yetmez, hızlı tanımak gerekir</div>
          <div className="card-sub">
            Bir kanayı 4 saniye düşünüp bilmek alıştırmada doğru sayılır, ama gerçek cümle okurken işe yaramaz —
            sonuna geldiğinde başını unutursun. Bu test, karakteri <b>düşünmeden</b> okuyabildiğin noktaya ne kadar
            yaklaştığını gösterir.
          </div>
          <div className="tiny faint">
            Karakteri gör, okunuşunu romaji yaz (し için <span className="mono">shi</span>). Doğru yazınca kendiliğinden
            geçer.
          </div>
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Hangi alfabe?</div>
          <Chips items={DECKS} value={deck} onChange={setDeck} />
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Süre</div>
          <Chips items={LENGTHS} value={String(length)} onChange={(v) => setLength(Number(v) as Length)} />
        </div>

        {best[bestKey] > 0 && (
          <div className="card row">
            <span style={{ color: 'var(--accent)' }}><Icon name="trophy" size={18} /></span>
            <div className="stack-sm" style={{ gap: 0, flex: 1 }}>
              <div className="card-title">Rekorun</div>
              <div className="card-sub">
                {best[bestKey]} kana/dk · {DECKS.find((d) => d.id === deck)?.label} · {length} sn
              </div>
            </div>
          </div>
        )}

        <button className="btn btn--lang btn--block btn--lg" onClick={start}>
          Başla · {pool.length} karakterlik havuz
        </button>

        <div className="tiny faint center">
          İstatistiklerin kaydedilir; sonuçlar <span className="mono">{DECKS.find((d) => d.id === deck)?.label}</span>{' '}
          ve süreye göre ayrı tutulur.
        </div>
      </div>
    </>
  )
}
