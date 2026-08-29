import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaKeyboard } from '@/components/KanaKeyboard'
import { drillPool, type DrillKana, type DrillWord } from '@/content/ja/kana-drills'
import { romajiToTurkish } from '@/lib/ja-phonetic'
import { shuffle } from '@/lib/shuffle'

// Ters yönlü kelime yazma: okunuşu ver, kanasını yazdır.
//
// NEDEN VAR:
// Uygulamadaki bütün alıştırmalar KANA → OKUNUŞ yönünde çalışıyordu. Yani tek
// bir beceri ölçülüyordu: tanıma. Oysa duyduğunu yazmak ayrı bir beceri ve
// tanımaktan çok daha zor — şıklar ya da karakterin kendisi ortada yokken sesi
// karaktere çevirmek gerekiyor.
//
// TASARIM: hece kutusu GÖSTERİLMİYOR.
// Kaç kutu olacağını söylemek sorunun yarısını vermek olurdu; en sık yapılan
// hata zaten karakteri bilmemek değil, KAÇ karakter olduğunu bilmemek
// (せんせ yazmak, せんせい yerine). O sayıyı öğrencinin kendisi çıkarmalı.
// Kutular yalnızca cevap açıklandığında, karşılaştırma için beliriyor.

type Phase = 'setup' | 'drill' | 'result'

interface Cevap {
  word: DrillWord
  given: string
  correct: boolean
}

const SAYILAR = [10, 20, 30]

export default function WordWritePage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [kana, setKana] = useState<DrillKana>('hiragana')
  const [adet, setAdet] = useState(20)

  const [words, setWords] = useState<DrillWord[]>([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [gosterildi, setGosterildi] = useState(false)
  const cevaplar = useRef<Cevap[]>([])

  const havuz = useMemo(() => drillPool(kana), [kana])

  const basla = () => {
    cevaplar.current = []
    setWords(shuffle(havuz).slice(0, adet))
    setIdx(0)
    setInput('')
    setGosterildi(false)
    setPhase('drill')
  }

  const w = words[idx]

  const kontrol = () => {
    if (!w || gosterildi || !input) return
    cevaplar.current.push({ word: w, given: input, correct: input === w.kana })
    setGosterildi(true)
  }

  const sonraki = () => {
    if (idx + 1 >= words.length) {
      setPhase('result')
      return
    }
    setIdx(idx + 1)
    setInput('')
    setGosterildi(false)
  }

  if (phase === 'setup') {
    return (
      <>
        <TopBar title="Kelime yazma" sub="Okunuşu gör, kanasını yaz" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">Bu alıştırma ters yönde çalışır</div>
            <div className="card-sub">
              Diğer alıştırmalar karakteri gösterip okunuşunu sorar. Burada okunuş verilir, karakteri
              sen bulursun. Tanımak ile hatırlamak ayrı becerilerdir; sınavda ve yazarken lazım olan
              ikincisidir.
            </div>
            <div className="tiny faint" style={{ marginTop: 4 }}>
              Kaç karakter yazacağın söylenmiyor. En sık yapılan hata karakteri bilmemek değil, kaç
              tane olduğunu bilmemektir — せんせ yazmak, せんせい yerine.
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
            <div className="tiny faint">{havuz.length} kelimelik havuz</div>
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
    const yanlis = cevaplar.current.filter((c) => !c.correct)
    const yuzde = toplam ? Math.round((dogru / toplam) * 100) : 0

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
                    <div className="tiny">
                      <span className="faint">senin yazdığın: </span>
                      <span className="ja" style={{ color: 'var(--bad)' }}>
                        {c.given || '—'}
                      </span>
                      {c.given.length !== c.word.kana.length && (
                        <span className="faint">
                          {' '}
                          ({[...c.given].length} karakter, {[...c.word.kana].length} olmalıydı)
                        </span>
                      )}
                    </div>
                    <div className="tiny faint">{c.word.tr}</div>
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
  const dogru = input === w.kana

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

      <div className="ww-body">
        <div className="ww-prompt">
          <div className="ww-reading">{w.reading}</div>
          <div className="ww-tr-reading">≈ {romajiToTurkish(w.reading)}</div>
          <div className="ww-meaning">{w.tr}</div>
        </div>

        {/* Yazdıkların — kutular değil, akan bir şerit. Kutu sayısı ipucu olurdu. */}
        <div className={'ww-input' + (gosterildi ? (dogru ? ' is-ok' : ' is-bad') : '')}>
          {input ? <span className="ja">{input}</span> : <span className="ww-placeholder">…</span>}
        </div>

        {gosterildi && (
          <div className={'ww-feedback' + (dogru ? ' is-ok' : ' is-bad')}>
            {dogru ? (
              <span>Doğru</span>
            ) : (
              <>
                <div className="row" style={{ gap: 10, justifyContent: 'center' }}>
                  <span className="ja ww-answer">{w.kana}</span>
                </div>
                {/* Hece hece karşılaştırma: hatanın nerede olduğu görünsün */}
                <div className="mora-line" style={{ justifyContent: 'center', borderTop: 0 }}>
                  {w.tokens.map((t, i) => (
                    <span key={i} className="mora">
                      <span className="ja mora-ch">{t}</span>
                      <span className="mora-r">{i + 1}</span>
                    </span>
                  ))}
                  <span className="mora-sum tabular">{w.mora} hece</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="ww-foot">
        {/*
          State işlevsel biçimde güncelleniyor (v => v + c), doğrudan
          `input + c` ile değil. Sebebi: iki tuşa arka arkaya hızlı basıldığında
          ikisi de aynı render'daki eski `input` değerini görür ve ikincisi
          birincinin üstüne yazar — karakter düşer. Tarayıcıda iki tuşa peş
          peşe basınca tek harf kaldığı görülünce fark edildi.
        */}
        <KanaKeyboard
          type={w.type}
          onKey={(c) => !gosterildi && setInput((v) => v + c)}
          onBackspace={() => !gosterildi && setInput((v) => [...v].slice(0, -1).join(''))}
          onClear={() => !gosterildi && setInput('')}
          disabled={gosterildi}
        />

        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          {!gosterildi ? (
            <button className="btn btn--lg btn--primary" onClick={kontrol} disabled={!input}>
              Kontrol et
            </button>
          ) : (
            <button className="btn btn--lg btn--primary" onClick={sonraki}>
              {idx + 1 >= words.length ? 'Bitir' : 'Sonraki'}
              <Icon name="right" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
