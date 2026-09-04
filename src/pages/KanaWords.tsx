import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toRomaji } from 'wanakana'
import { particleFixedKana } from '@/lib/ja-phonetic'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaGlyph } from '@/components/KanaGlyph'
import { kanaGroups } from '@/content/ja/kana'
import { KANA_WORDS, moraCount, readingOf, wordsReadableWith, type KanaWord } from '@/content/ja/kana-words'
import { shuffle } from '@/lib/shuffle'
import { bumpStat } from '@/db/db'

// Kelime okuma alıştırması.
//
// NEDEN: Kana'yı tek tek tanımakla kelime içinde SÖKEBİLMEK farklı şeylerdir.
// Tek başına gösterilen さ'yı bilirsin ama さくら'yı gördüğünde gözün donar —
// çünkü artık üç karakteri sırayla, hızlıca çözmen gerekir. Okuma akıcılığı
// ancak kelime üstünde gelişir.
//
// FİLTRE MANTIĞI: Kelime listesi, öğrencinin SEÇTİĞİ kana kümesine göre süzülür.
// Bir kelimenin tek bir karakteri bile bilinmiyorsa o kelime hiç gösterilmez.
// Böylece daha ilk günden "gerçek kelime" okursun; bilmediğin harfe takılıp
// motivasyonun kırılmaz.
//
// Seçim, "Kendi testin" sayfasıyla AYNI yerden okunur — iki sayfa aynı ilerlemeyi
// paylaşsın, aynı listeyi iki kez işaretlemek zorunda kalma.

type Mode = 'card' | 'type'
type Length = 'all' | 'short' | 'long'

const MODES: { id: Mode; label: string }[] = [
  { id: 'card', label: 'Oku ve kontrol et' },
  { id: 'type', label: 'Okunuşu yaz' },
]

const LENGTHS: { id: Length; label: string }[] = [
  { id: 'all', label: 'Hepsi' },
  { id: 'short', label: 'Kısa (2–3 hece)' },
  { id: 'long', label: 'Uzun (4+)' },
]

const SELECTION_KEY = 'kana-quiz:setup'

function loadSelection(): string[] {
  try {
    const raw = localStorage.getItem(SELECTION_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as { kind?: string; chars?: string[] }
    return data.kind === 'hiragana' ? (data.chars ?? []) : []
  } catch {
    return []
  }
}

/**
 * Kelimeyi hecelerine ayırır.
 * Küçük ゃゅょ önceki karaktere yapışır; küçük っ ise SONRAKİ heceye katılır
 * (がっこう → が / っこ / う), çünkü duraklamayı kendinden sonraki sese verir.
 */
function splitMora(kana: string): { text: string; romaji: string }[] {
  const chars = [...kana]
  // Okunuş, ekleri düzeltilmiş kopyadan üretilir; ekranda YAZILAN ise özgün
  // karakterdir. こんにちは'nın son hecesi は yazılır ama "wa" okunur — tek
  // başına toRomaji'ye verilince her zaman "ha" çıkıyordu. Düzeltilmiş dizgi
  // aynı uzunlukta olduğu için indisler birebir örtüşüyor.
  const okunacak = [...particleFixedKana(kana)]
  const units: { text: string; read: string }[] = []
  for (let i = 0; i < chars.length; i++) {
    let unit = chars[i]
    let read = okunacak[i]
    if (unit === 'っ' && i + 1 < chars.length) {
      unit += chars[++i]
      read += okunacak[i]
    }
    while (i + 1 < chars.length && 'ゃゅょ'.includes(chars[i + 1])) {
      unit += chars[++i]
      read += okunacak[i]
    }
    units.push({ text: unit, read })
  }
  return units.map((u) => ({ text: u.text, romaji: toRomaji(u.read) }))
}

export default function KanaWordsPage() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(loadSelection()))
  const [mode, setMode] = useState<Mode>('card')
  const [length, setLength] = useState<Length>('all')
  const [editing, setEditing] = useState(false)

  const [queue, setQueue] = useState<KanaWord[]>([])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState({ ok: 0, no: 0 })
  const [running, setRunning] = useState(false)

  const groups = useMemo(() => kanaGroups('hiragana'), [])


  // Seçim değişince "Kendi testin" ile paylaşılan kayda yaz
  useEffect(() => {
    const raw = localStorage.getItem(SELECTION_KEY)
    let base: Record<string, unknown> = { kind: 'hiragana', direction: 'toChar', repeat: 1 }
    try {
      if (raw) base = { ...base, ...JSON.parse(raw) }
    } catch {
      /* bozuksa varsayılanla devam */
    }
    localStorage.setItem(SELECTION_KEY, JSON.stringify({ ...base, kind: 'hiragana', chars: [...selected] }))
  }, [selected])

  const available = useMemo(() => {
    const all = wordsReadableWith(selected)
    if (length === 'short') return all.filter((w) => moraCount(w.kana) <= 3)
    if (length === 'long') return all.filter((w) => moraCount(w.kana) >= 4)
    return all
  }, [selected, length])

  const start = () => {
    if (!available.length) return
    setQueue(shuffle(available))
    setIdx(0)
    setRevealed(false)
    setTyped('')
    setScore({ ok: 0, no: 0 })
    setRunning(true)
  }

  const current = queue[idx]

  const next = (ok: boolean) => {
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), no: s.no + (ok ? 0 : 1) }))
    bumpStat({ reviews: 1, correct: ok ? 1 : 0, ja: 1 })
    setRevealed(false)
    setTyped('')
    if (idx + 1 < queue.length) setIdx(idx + 1)
    else setRunning(false)
  }

  const checkTyped = (value: string) => {
    const v = value.toLowerCase().replace(/[^a-z]/g, '')
    setTyped(v)
    if (!current) return
    const answer = readingOf(current.kana).toLowerCase().replace(/[^a-z]/g, '')
    if (v === answer) {
      setRevealed(true)
      setTimeout(() => next(true), 700)
    }
  }

  // ————————————————————————— Alıştırma ekranı —————————————————————————

  if (running && current) {
    const mora = splitMora(current.kana)
    const answer = readingOf(current.kana)

    return (
      <>
        <TopBar
          title="Kelime okuma"
          sub={`${idx + 1} / ${queue.length}`}
          back="/"
          right={
            <span className="tiny dim">
              <Icon name="check" size={13} /> {score.ok} · <Icon name="close" size={13} /> {score.no}
            </span>
          }
        />

        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg stack center">
            <div className="tiny faint">Sesli oku, sonra kontrol et</div>

            <div className="word-line">
              {mora.map((m, i) => (
                <span key={i} className="word-mora">
                  <KanaGlyph char={m.text} size="clamp(3rem, 15vw, 5rem)" weight={5} />
                  {revealed && <span className="word-mora-r">{m.romaji}</span>}
                </span>
              ))}
            </div>

            {revealed ? (
              <div className="stack-sm center" style={{ marginTop: 6 }}>
                <div className="mono dim">{answer}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 650 }}>{current.tr}</div>
                {current.kanji && (
                  <div className="tiny faint">
                    Kanjili yazımı: <span className="ja">{current.kanji}</span>
                  </div>
                )}
                <SpeakBtn text={current.kana} lang="ja" reading={current.kana} />
              </div>
            ) : (
              <div className="tiny faint">{mora.length} hece</div>
            )}
          </div>

          {mode === 'type' && !revealed && (
            <input
              className="field"
              style={{ fontSize: '1.3rem', textAlign: 'center', letterSpacing: '0.06em' }}
              value={typed}
              onChange={(e) => checkTyped(e.target.value)}
              placeholder="okunuşunu romaji yaz"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          )}

          {!revealed ? (
            <button className="btn btn--lang btn--block btn--lg" onClick={() => setRevealed(true)}>
              Göster
            </button>
          ) : (
            <div className="grid grid-2">
              <button className="btn btn--bad" onClick={() => next(false)}>
                Zorlandım
              </button>
              <button className="btn btn--ok" onClick={() => next(true)}>
                Okuyabildim
              </button>
            </div>
          )}

          <button className="btn btn--ghost btn--block" onClick={() => setRunning(false)}>
            Bitir
          </button>
        </div>
      </>
    )
  }

  // ————————————————————————— Kurulum / özet ekranı —————————————————————————

  const done = score.ok + score.no
  const coverage = Math.round((available.length / KANA_WORDS.length) * 100)

  return (
    <>
      <TopBar title="Kelime okuma" sub="Bildiğin harflerle gerçek kelimeler" back="/" />

      <div className="page stack-lg lang-ja">
        {done > 0 && (
          <div className="card card--pad-lg center stack-sm">
            <span className="result-mark"><Icon name={score.no === 0 ? 'trophy' : 'flame'} size={26} /></span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {score.ok} / {done}
            </div>
            <div className="dim small">okuyabildiğin kelime</div>
          </div>
        )}

        <div className="card stack-sm">
          <div className="card-title">Neden kelime okumalısın?</div>
          <div className="card-sub">
            Tek başına gösterilen <span className="ja">さ</span>’yı bilirsin ama <span className="ja">さくら</span>’yı
            görünce göz donar — çünkü artık üç karakteri sırayla ve hızlıca çözmen gerekir. Harfler ancak kelime
            içinde kalıcı olur.
          </div>
          <div className="tiny faint">
            Buradaki kelimelerin hepsi tamamen hiragana ile yazılabilir. Japoncada bu yapay değildir:{' '}
            <span className="ja">これ・とても・たくさん・ありがとう</span> gibi birçok kelime günlük hayatta zaten
            hiragana yazılır, kanjili olanların kanjisi de sonra öğretilir.
          </div>
        </div>

        <div className="card stack-sm">
          <div className="row">
            <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
              <div className="card-title">Seçtiğin harflerle okuyabildiklerin</div>
              <div className="card-sub">
                {selected.size} harf seçili · <b>{available.length}</b> kelime okunabiliyor
                {available.length > 0 && ` (listenin %${coverage}’i)`}
              </div>
            </div>
            <button className="btn btn--sm btn--ghost" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Kapat' : 'Değiştir'}
            </button>
          </div>

          {selected.size === 0 && (
            <div className="feedback feedback--info tiny">
              Henüz harf seçmemişsin. “Değiştir”e basıp öğrendiğin satırları işaretle — seçimin{' '}
              <Link to="/kana-test" className="link">
                Kendi testin
              </Link>{' '}
              sayfasıyla ortaktır.
            </div>
          )}

          {editing && (
            <div className="stack-sm" style={{ marginTop: 4 }}>
              {groups.map((g) => {
                const allIn = g.chars.every((c) => selected.has(c.char))
                const someIn = g.chars.some((c) => selected.has(c.char))
                const inCount = g.chars.filter((c) => selected.has(c.char)).length
                return (
                  <button
                    key={g.group}
                    className={`btn btn--sm${allIn ? ' btn--lang' : ' btn--ghost'}`}
                    style={{ justifyContent: 'flex-start', gap: 8 }}
                    onClick={() =>
                      setSelected((s) => {
                        const n = new Set(s)
                        for (const c of g.chars) {
                          if (allIn) n.delete(c.char)
                          else n.add(c.char)
                        }
                        return n
                      })
                    }
                  >
                    <Icon name={allIn ? 'squareCheck' : someIn ? 'squareHalf' : 'square'} size={16} />
                    <span className="ja" style={{ flex: 1, textAlign: 'left' }}>
                      {g.group}
                    </span>
                    <span className="tiny faint">
                      {inCount} / {g.chars.length}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Nasıl çalışacaksın?</div>
          <Chips items={MODES} value={mode} onChange={setMode} />
          <div className="tiny faint">
            {mode === 'card'
              ? 'Kelimeyi sesli oku, sonra “Göster” ile hece hece kontrol et. Kendini dürüstçe puanla.'
              : 'Okunuşu romaji yazarsın; doğru yazınca kendiliğinden geçer. Daha zorlayıcıdır.'}
          </div>
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Kelime uzunluğu</div>
          <Chips items={LENGTHS} value={length} onChange={setLength} />
        </div>

        {available.length > 0 && (
          <div className="card stack-sm">
            <div className="card-title">Örnekler</div>
            <div className="stack-sm">
              {available.slice(0, 6).map((w) => (
                <div key={w.kana} className="row small">
                  <span className="ja" style={{ fontSize: '1.35rem', minWidth: 96 }}>
                    {w.kana}
                  </span>
                  <span className="mono faint tiny">{readingOf(w.kana)}</span>
                  <div className="spacer" />
                  <span className="dim">{w.tr}</span>
                </div>
              ))}
            </div>
            {available.length > 6 && <div className="tiny faint">…ve {available.length - 6} tane daha</div>}
          </div>
        )}

        <button className="btn btn--lang btn--block btn--lg" onClick={start} disabled={!available.length}>
          {available.length ? `Başla · ${available.length} kelime` : 'Bu seçimle okunabilen kelime yok'}
        </button>

        {selected.size > 0 && available.length === 0 && (
          <div className="feedback feedback--info tiny">
            Seçtiğin harflerle bu listede kelime çıkmıyor. Bir satır daha ekle — özellikle{' '}
            <span className="ja">あ行</span> ve <span className="ja">か行</span> birlikte seçilince kelimeler
            gelmeye başlar.
          </div>
        )}

        <Link to="/kana-test" className="tiny faint center" style={{ display: 'block' }}>
          Tek tek harf testi için “Kendi testin”
        </Link>
      </div>
    </>
  )
}
