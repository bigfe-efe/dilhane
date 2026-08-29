import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { TRAIT_TR, moraPool, type DrillKana, type DrillWord } from '@/content/ja/kana-drills'
import { romajiToTurkish } from '@/lib/ja-phonetic'
import { shuffle } from '@/lib/shuffle'

// Mora (hece) sayma alıştırması.
//
// NEDEN AYRI BİR ALIŞTIRMA:
// Duyduğunu yazarken yapılan hataların çoğu karakter hatası değil, SAYI
// hatasıdır: せんせ yazmak せんせい yerine, おばさん ile おばあさん'ı aynı
// sanmak. Sebebi de şu — Türkçe kulağı HECE sayar, Japonca MORA sayar ve
// ikisi aynı şey değil. Türk kulağı せんせい'yi "sen-sey" diye iki parça
// duyar; Japoncada dört mora vardır.
//
// Bu yüzden sayma, yazmadan AYRI çalıştırılıyor. Karakteri hiç seçmeden
// yalnızca "kaç vuruş?" sorusuna cevap veriliyor. Sayı oturduğunda yazım
// kendiliğinden düzeliyor, tersi olmuyor.
//
// TASARIM: soru KANA olarak gösteriliyor, okunuş değil.
// Romaji gösterilseydi alıştırma harf saymaya dönerdi ("koohii" → 6 harf ama
// 4 mora). Kana göstermek de tam kolay değil: きょう üç karakter, iki mora.
// Asıl öğretilecek şey bu ayrım.

type Phase = 'setup' | 'drill' | 'result'

interface Cevap {
  word: DrillWord
  given: number
  correct: boolean
}

const SAYILAR = [10, 20, 30]
const SECENEKLER = [1, 2, 3, 4, 5, 6, 7, 8]

export default function MoraCountPage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [kana, setKana] = useState<DrillKana>('karisik')
  const [adet, setAdet] = useState(20)

  const [words, setWords] = useState<DrillWord[]>([])
  const [idx, setIdx] = useState(0)
  const [secilen, setSecilen] = useState<number | null>(null)
  const cevaplar = useRef<Cevap[]>([])

  const havuz = useMemo(() => moraPool(kana), [kana])

  const basla = () => {
    cevaplar.current = []
    // Aynı kelime iki kez çıkmasın: havuzda zorlar iki kez geçiyor.
    const benzersiz: DrillWord[] = []
    const gorulen = new Set<string>()
    for (const w of shuffle(havuz)) {
      if (gorulen.has(w.kana)) continue
      gorulen.add(w.kana)
      benzersiz.push(w)
      if (benzersiz.length >= adet) break
    }
    setWords(benzersiz)
    setIdx(0)
    setSecilen(null)
    cevaplar.current = []
    setPhase('drill')
  }

  const w = words[idx]

  const sec = (n: number) => {
    if (!w || secilen !== null) return
    setSecilen(n)
    cevaplar.current.push({ word: w, given: n, correct: n === w.mora })
  }

  const sonraki = () => {
    if (idx + 1 >= words.length) {
      setPhase('result')
      return
    }
    setIdx(idx + 1)
    setSecilen(null)
  }

  if (phase === 'setup') {
    return (
      <>
        <TopBar title="Hece sayma" sub="Kaç vuruş?" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">Türk kulağı hece sayar, Japonca mora sayar</div>
            <div className="card-sub">
              せんせい bir Türk kulağına “sen-sey” diye iki parça gelir. Japoncada dört mora vardır:
              せ・ん・せ・い. Yazarken kaç karakter koyacağını bu sayı belirler — sayıyı bilmiyorsan
              karakterleri bilsen de kelimeyi yanlış yazarsın.
            </div>
            <div className="tiny faint" style={{ marginTop: 4 }}>
              Üç şey ayrı vuruştur ve hep unutulur: ん bir vuruş, uzun ünlü iki vuruş, küçük っ ses
              vermeden bir vuruş. Buna karşılık きょ TEK vuruştur — küçük ゃゅょ önceki harfe yapışır.
            </div>
          </div>

          <div className="stack-sm">
            <h2>Alfabe</h2>
            <div className="chips">
              {(
                [
                  ['hiragana', 'Hiragana'],
                  ['katakana', 'Katakana'],
                  ['karisik', 'Karışık'],
                ] as [DrillKana, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={'chip' + (kana === id ? ' active' : '')}
                  onClick={() => setKana(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="tiny faint">
              Tuzaklı kelimeler (ん, küçük っ, uzun ünlü içerenler) iki kat sık çıkar.
            </div>
          </div>

          <div className="stack-sm">
            <h2>Kaç kelime</h2>
            <div className="chips">
              {SAYILAR.map((n) => (
                <button
                  key={n}
                  className={'chip' + (adet === n ? ' active' : '')}
                  onClick={() => setAdet(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn--lg btn--primary" onClick={basla}>
            Başla
          </button>
        </div>
      </>
    )
  }

  if (phase === 'result') {
    const dogru = cevaplar.current.filter((c) => c.correct).length
    const toplam = cevaplar.current.length
    const yuzde = toplam ? Math.round((dogru / toplam) * 100) : 0
    const yanlis = cevaplar.current.filter((c) => !c.correct)

    // Hangi yapı yanlış sayılıyor? Teşhis burada: "3 kelime kaçırdın" demek
    // yerine "ん'i saymıyorsun" diyebilmek için yanlışların işaretleri sayılıyor.
    const suclu = new Map<string, number>()
    for (const c of yanlis)
      for (const t of c.word.traits) suclu.set(t, (suclu.get(t) ?? 0) + 1)
    const sirali = [...suclu.entries()].sort((a, b) => b[1] - a[1])

    return (
      <>
        <TopBar title="Sonuç" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card stack-sm">
            <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
              <span className="countdown tabular">%{yuzde}</span>
              <span className="card-sub">
                {dogru} / {toplam} doğru
              </span>
            </div>
            <Bar value={yuzde} />
          </div>

          {sirali.length > 0 && (
            <div className="stack-sm">
              <h2>Hangi yapıda takılıyorsun</h2>
              {sirali.map(([t, n]) => {
                const bilgi = TRAIT_TR[t as keyof typeof TRAIT_TR]
                return (
                  <div key={t} className="card stack-sm">
                    <div className="row">
                      <span className="ja badge">{bilgi.label}</span>
                      <div className="spacer" />
                      <span className="tiny faint tabular">{n} yanlışta geçti</span>
                    </div>
                    <div className="card-sub">{bilgi.why}</div>
                  </div>
                )
              })}
            </div>
          )}

          {yanlis.length > 0 && (
            <div className="stack-sm">
              <h2>Kaçırdıkların</h2>
              <div className="cols-2">
                {yanlis.map((c, i) => (
                  <div key={i} className="card stack-sm">
                    <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
                      <span className="ja ww-answer">{c.word.kana}</span>
                      <span className="card-sub">{c.word.reading}</span>
                    </div>
                    <MoraStrip word={c.word} />
                    <div className="tiny">
                      <span className="faint">sen: </span>
                      <span style={{ color: 'var(--bad)' }}>{c.given}</span>
                      <span className="faint"> · doğru: </span>
                      <span style={{ color: 'var(--ok)' }}>{c.word.mora}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn--primary" onClick={() => setPhase('setup')}>
              Tekrar
            </button>
            <Link to="/calis" className="btn btn--ghost">
              Çalış sayfasına dön
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ————— Alıştırma —————
  if (!w) return null
  const acildi = secilen !== null

  return (
    <div className="quiz lang-ja">
      <div className="quiz-top">
        <div className="row">
          <Link to="/calis" className="btn btn--sm btn--ghost">
            Bırak
          </Link>
          <div className="spacer" />
          <span className="tiny faint tabular">
            {idx + 1} / {words.length}
          </span>
        </div>
      </div>

      <div className="mora-body">
        <div className="ja mora-word">{w.kana}</div>
        {!acildi && <div className="mora-ask">Kaç hece (mora)?</div>}

        {acildi && (
          <div className="stack-sm" style={{ alignItems: 'center', width: '100%' }}>
            <MoraStrip word={w} big />
            <div className={'mora-verdict' + (secilen === w.mora ? ' is-ok' : ' is-bad')}>
              {secilen === w.mora ? 'Doğru — ' : `Sen ${secilen} dedin, doğrusu `}
              <strong>{w.mora} hece</strong>
            </div>
            <div className="card-sub">
              {w.reading} · ≈ {romajiToTurkish(w.reading)} · {w.tr}
            </div>
            {w.traits.length > 0 && (
              <div className="mora-why">
                {w.traits.map((t) => (
                  <div key={t} className="tiny">
                    <span className="ja" style={{ color: 'var(--accent)' }}>
                      {TRAIT_TR[t].label}
                    </span>{' '}
                    <span className="dim">{TRAIT_TR[t].why}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mora-foot">
        <div className="mora-choices">
          {SECENEKLER.map((n) => {
            let cls = 'mora-choice'
            if (acildi) {
              if (n === w.mora) cls += ' is-ok'
              else if (n === secilen) cls += ' is-bad'
              else cls += ' is-muted'
            }
            return (
              <button key={n} className={cls} onClick={() => sec(n)} disabled={acildi}>
                {n}
              </button>
            )
          })}
        </div>

        {acildi && (
          <button
            className="btn btn--lg btn--primary"
            onClick={sonraki}
            style={{ marginTop: 12 }}
            autoFocus
          >
            {idx + 1 >= words.length ? 'Bitir' : 'Sonraki'}
            <Icon name="right" size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

/** Kelimeyi mora kutularına ayırıp gösterir — sayının nereden geldiği görünsün. */
function MoraStrip({ word, big }: { word: DrillWord; big?: boolean }) {
  return (
    <div className={'mora-line' + (big ? ' mora-line--big' : '')} style={{ borderTop: 0 }}>
      {word.tokens.map((t, i) => (
        <span key={i} className="mora">
          <span className="ja mora-ch">{t}</span>
          <span className="mora-r">{i + 1}</span>
        </span>
      ))}
    </div>
  )
}
