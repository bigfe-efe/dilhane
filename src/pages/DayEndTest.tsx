import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaGlyph } from '@/components/KanaGlyph'
import { KanaKeyboard } from '@/components/KanaKeyboard'
import { KANA_BY_CHAR } from '@/content/ja/kana'
import { acceptsFor, readingOk } from '@/content/ja/exam'
import { readingOf, tokenize, wordsReadableWith } from '@/content/ja/kana-words'
import { kataReading, kataTokenize, kataWordsReadableWith } from '@/content/ja/katakana-words'
import { romajiToTurkish } from '@/lib/ja-phonetic'
import { shuffle } from '@/lib/shuffle'
import { db, ensureCards } from '@/db/db'
import { useSession } from '@/db/hooks'
import { tarihTR } from './DayEnd'

// Gün sonu testi — dün işaretlediğin harflerden.
//
// TASARIM: ÜÇ BÖLÜM DE ÜRETİM, ŞIK YOK.
// Bu bir ölçüm değil TEKRAR; dün gördüğün şeyi bugün geri çağırabiliyor musun
// diye bakıyoruz. Şıklı soru burada işe yaramaz — şıkları görünce tanırsın ve
// "biliyorum" hissi verir, oysa aradığımız şey hatırlama.
//
//   1. Okunuş  — karakteri gör, okunuşunu YAZ
//   2. Karakter — okunuşu gör, kanayı klavyeden bul
//   3. Kelime   — okunuşu gör, kelimeyi klavyeden yaz
//
// Üçüncü bölüm yalnızca o harflerle yazılabilen kelimelerden kurulur. Böyle
// bir kelime yoksa bölüm hiç çıkmaz ve bu ekranda açıkça yazar — uydurma
// kelime göstermek öğretmez, yanıltır.

type Faz = 'kurulum' | 'test' | 'sonuc'

type Soru =
  | { t: 'okunus'; char: string; accepts: string[]; label: string }
  | { t: 'karakter'; char: string; romaji: string; tr: string; alfabe: 'hiragana' | 'katakana' }
  | { t: 'kelime'; kana: string; reading: string; tokens: string[]; alfabe: 'hiragana' | 'katakana' }

interface Cevap {
  soru: Soru
  given: string
  correct: boolean
}

const BOLUM_TR = {
  okunus: { title: 'Okunuş', ask: 'Bu karakterin okunuşunu yaz' },
  karakter: { title: 'Karakter', ask: 'Bu okunuş hangi karakter? Klavyeden seç' },
  kelime: { title: 'Kelime', ask: 'Bu kelimeyi kanayla yaz' },
} as const

export default function DayEndTestPage() {
  const { day } = useParams<{ day: string }>()
  const session = useSession(day)

  const [faz, setFaz] = useState<Faz>('kurulum')
  const [sorular, setSorular] = useState<Soru[]>([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [acildi, setAcildi] = useState(false)
  const cevaplar = useRef<Cevap[]>([])

  const secili = useMemo(() => new Set(session?.chars ?? []), [session])

  // Kelime havuzu: yalnızca bu harflerle yazılabilenler. İki alfabe ayrı
  // süzülüyor çünkü okuma ve heceleme kuralları farklı (ー, ッ).
  const kelimeler = useMemo(() => {
    if (!secili.size) return []
    return [
      ...wordsReadableWith(secili).map((w) => ({
        kana: w.kana,
        reading: readingOf(w.kana),
        tokens: tokenize(w.kana),
        alfabe: 'hiragana' as const,
      })),
      ...kataWordsReadableWith(secili).map((w) => ({
        kana: w.kana,
        reading: kataReading(w.kana),
        tokens: kataTokenize(w.kana),
        alfabe: 'katakana' as const,
      })),
    ]
  }, [secili])

  const basla = () => {
    const chars = [...secili].map((c) => KANA_BY_CHAR.get(c)).filter(Boolean) as NonNullable<
      ReturnType<typeof KANA_BY_CHAR.get>
    >[]

    const okunus: Soru[] = shuffle(chars).map((k) => ({
      t: 'okunus',
      char: k.char,
      accepts: acceptsFor(k.char),
      label: k.romaji,
    }))

    // Karakter bölümünde AYNI OKUNUŞLU harf iki alfabede de seçiliyse hangisi
    // istendiği yazılmalı; yoksa "shi" sorusunun し ve シ diye iki cevabı olur.
    const karakter: Soru[] = shuffle(chars).map((k) => ({
      t: 'karakter',
      char: k.char,
      romaji: k.romaji,
      tr: k.trHint,
      alfabe: k.type,
    }))

    const kelime: Soru[] = shuffle(kelimeler).slice(0, 12).map((w) => ({ t: 'kelime', ...w }))

    cevaplar.current = []
    setSorular([...okunus, ...karakter, ...kelime])
    setIdx(0)
    setInput('')
    setAcildi(false)
    setFaz('test')
  }

  const q = sorular[idx]

  const dogruMu = (s: Soru, v: string): boolean => {
    if (s.t === 'okunus') return readingOk(v, s.accepts)
    if (s.t === 'karakter') return v === s.char
    return v === s.kana
  }

  const kontrol = () => {
    if (!q || acildi || !input) return
    cevaplar.current.push({ soru: q, given: input, correct: dogruMu(q, input) })
    setAcildi(true)
  }

  const sonraki = async () => {
    if (idx + 1 >= sorular.length) {
      const dogru = cevaplar.current.filter((c) => c.correct).length
      const yuzde = cevaplar.current.length ? (dogru / cevaplar.current.length) * 100 : 0
      if (day && session) {
        try {
          await db.sessions.put({ ...session, testedAt: Date.now(), testPercent: yuzde })
        } catch {
          // Sessiz geç — sonucu göstermek kaydetmekten önemli
        }
      }
      // Yanlış çıkan karakterler tekrar listesine: gün sonu testi zaten
      // "neyi unuttum" sorusunu cevaplıyor, cevabı boşa gitmesin.
      const yanlisChars = [
        ...new Set(
          cevaplar.current
            .filter((c) => !c.correct)
            .flatMap((c) => (c.soru.t === 'kelime' ? c.soru.tokens : [c.soru.char])),
        ),
      ].filter((c) => KANA_BY_CHAR.has(c))
      if (yanlisChars.length) {
        try {
          await ensureCards(
            yanlisChars.map((c) => ({ kind: 'kana' as const, refId: c, lang: 'ja' as const })),
          )
        } catch {
          // yine sessiz
        }
      }
      setFaz('sonuc')
      return
    }
    setIdx(idx + 1)
    setInput('')
    setAcildi(false)
  }

  // ————————————————————————— Kurulum —————————————————————————

  if (faz === 'kurulum') {
    if (session === undefined) {
      return (
        <>
          <TopBar title="Gün sonu testi" back="/gun-sonu" />
          <div className="page">
            <div className="card card-sub">Yükleniyor…</div>
          </div>
        </>
      )
    }
    if (!session) {
      return (
        <>
          <TopBar title="Gün sonu testi" back="/gun-sonu" />
          <div className="page stack-lg">
            <div className="card stack-sm">
              <div className="card-title">Bu güne ait kayıt yok</div>
              <div className="card-sub">
                Test, gün sonunda işaretlediğin harflerden kurulur. Önce bir gün işaretle.
              </div>
              <Link to="/gun-sonu" className="btn btn--primary">
                Gün sonu sayfası
              </Link>
            </div>
          </div>
        </>
      )
    }

    const toplam = session.chars.length * 2 + Math.min(12, kelimeler.length)

    return (
      <>
        <TopBar title="Gün sonu testi" sub={tarihTR(session.day)} back="/gun-sonu" />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">{tarihTR(session.day)} çalıştıkların</div>
            <div className="card-sub">
              {session.chars.length} karakter. Üç bölüm de şıksız — bu bir ölçüm değil tekrar, şık
              görünce tanırsın ama aradığımız şey hatırlamak.
            </div>
            {session.note && <div className="tiny dim">Notun: {session.note}</div>}
          </div>

          <div className="stack-sm">
            <h2>Bölümler</h2>
            <div className="cols-2">
              <BolumKart
                no={1}
                baslik="Okunuş"
                aciklama="Karakteri gör, okunuşunu yaz"
                adet={session.chars.length}
              />
              <BolumKart
                no={2}
                baslik="Karakter"
                aciklama="Okunuşu gör, kanayı klavyeden bul"
                adet={session.chars.length}
              />
              <BolumKart
                no={3}
                baslik="Kelime"
                aciklama={
                  kelimeler.length
                    ? 'Yalnızca bu harflerle yazılabilen kelimeler'
                    : 'Bu harflerle yazılabilen kelime yok — bu bölüm çıkmayacak'
                }
                adet={Math.min(12, kelimeler.length)}
              />
            </div>
          </div>

          {kelimeler.length === 0 && (
            <div className="feedback feedback--info small">
              <b>Kelime bölümü neden yok? </b>Bir kelimenin teste girmesi için HER harfinin
              işaretlediklerin arasında olması gerekiyor. Daha çok satır işaretledikçe kelime sayısı
              hızla artar — uydurma kelime göstermektense bölümü hiç koymadım.
            </div>
          )}

          <div className="stack-sm">
            <h2>Bu harfler</h2>
            <div className="card">
              <div className="dayend-chars ja" style={{ fontSize: '1.3rem', lineHeight: 1.9 }}>
                {session.chars.join(' ')}
              </div>
            </div>
          </div>

          <button className="btn btn--lg btn--primary btn--block" onClick={basla}>
            Teste başla · {toplam} soru
          </button>
        </div>
      </>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (faz === 'sonuc') {
    const hepsi = cevaplar.current
    const dogru = hepsi.filter((c) => c.correct).length
    const yuzde = hepsi.length ? Math.round((dogru / hepsi.length) * 100) : 0
    const yanlis = hepsi.filter((c) => !c.correct)

    // Bölüm bazında: hangi beceri eksik? Okunuşu bilip karakteri yazamamak
    // ile tersi farklı şeyler, tavsiye de farklı olmalı.
    const bolumler = (['okunus', 'karakter', 'kelime'] as const)
      .map((t) => {
        const rows = hepsi.filter((c) => c.soru.t === t)
        return { t, total: rows.length, correct: rows.filter((r) => r.correct).length }
      })
      .filter((b) => b.total > 0)

    return (
      <>
        <TopBar title="Gün sonu testi" sub="Sonuç" back="/gun-sonu" />
        <div className="page stack-lg lang-ja">
          <div className="card stack-sm">
            <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
              <span className="countdown tabular">%{yuzde}</span>
              <span className="card-sub">
                {dogru} / {hepsi.length} doğru
              </span>
            </div>
            <Bar value={yuzde} />
          </div>

          <div className="stack-sm">
            <h2>Bölümler</h2>
            <div className="cols-2">
              {bolumler.map((b) => {
                const p = Math.round((b.correct / b.total) * 100)
                return (
                  <div key={b.t} className="card stack-sm">
                    <div className="row">
                      <div className="card-title" style={{ fontSize: '0.95rem', flex: 1 }}>
                        {BOLUM_TR[b.t].title}
                      </div>
                      <span className="tabular" style={{ color: p >= 80 ? 'var(--ok)' : p >= 60 ? 'var(--warn)' : 'var(--bad)' }}>
                        %{p}
                      </span>
                    </div>
                    <Bar value={p} />
                    <div className="tiny faint">
                      {b.correct} / {b.total}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {yanlis.length > 0 && (
            <div className="stack-sm">
              <h2>Kaçırdıkların</h2>
              <div className="tiny faint" style={{ marginTop: -2 }}>
                Bunlar tekrar listene eklendi; birkaç gün aralıklı olarak yeniden çıkacaklar.
              </div>
              <div className="cols-2">
                {yanlis.map((c, i) => (
                  <div key={i} className="card stack-sm">
                    <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
                      <span className="ja ww-answer">
                        {c.soru.t === 'kelime' ? c.soru.kana : c.soru.char}
                      </span>
                      <span className="card-sub">
                        {c.soru.t === 'kelime'
                          ? c.soru.reading
                          : c.soru.t === 'okunus'
                            ? c.soru.label
                            : c.soru.romaji}
                      </span>
                      <div className="spacer" />
                      <span className="tiny faint">{BOLUM_TR[c.soru.t].title}</span>
                    </div>
                    <div className="tiny">
                      <span className="faint">senin cevabın: </span>
                      <span className={c.soru.t === 'okunus' ? '' : 'ja'} style={{ color: 'var(--bad)' }}>
                        {c.given || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn--primary" onClick={() => setFaz('kurulum')}>
              Tekrar
            </button>
            <Link to="/gun-sonu" className="btn btn--ghost">
              Gün sonu sayfası
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Test —————————————————————————

  if (!q) return null
  const dogru = dogruMu(q, input)
  const klavyeAlfabesi = q.t === 'karakter' ? q.alfabe : q.t === 'kelime' ? q.alfabe : 'hiragana'

  return (
    <div className="quiz lang-ja">
      <div className="quiz-top">
        <div className="row">
          <Link to="/gun-sonu" className="btn btn--sm btn--ghost">
            Bırak
          </Link>
          <div className="spacer" />
          <span className="tiny faint">{BOLUM_TR[q.t].title}</span>
          <span className="tiny faint tabular" style={{ marginLeft: 10 }}>
            {idx + 1} / {sorular.length}
          </span>
        </div>
      </div>

      <div className="ww-body">
        <div className="tiny faint center">{BOLUM_TR[q.t].ask}</div>

        {q.t === 'okunus' ? (
          <KanaGlyph char={q.char} size="min(34vw, 26vh)" weight={4.5} />
        ) : (
          <div className="ww-prompt">
            <div className="ww-reading">{q.t === 'karakter' ? q.romaji : q.reading}</div>
            <div className="ww-tr-reading">
              ≈ {q.t === 'karakter' ? q.tr : romajiToTurkish(q.reading)}
            </div>
            {q.t === 'karakter' && (
              <div className="quiz-alfabe ja" style={{ margin: '10px auto 0' }}>
                {q.alfabe === 'hiragana' ? 'ひらがな' : 'カタカナ'}
              </div>
            )}
          </div>
        )}

        {q.t === 'okunus' ? (
          <input
            className="romaji-live-input"
            style={{ minWidth: 'min(360px, 78vw)', textAlign: 'center', fontSize: '1.3rem' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (acildi ? void sonraki() : kontrol())}
            placeholder="okunuşu yaz"
            autoFocus
            disabled={acildi}
            spellCheck={false}
          />
        ) : (
          <div className={'ww-input' + (acildi ? (dogru ? ' is-ok' : ' is-bad') : '')}>
            {input ? <span className="ja">{input}</span> : <span className="ww-placeholder">…</span>}
          </div>
        )}

        {acildi && (
          <div className={'ww-feedback' + (dogru ? ' is-ok' : ' is-bad')}>
            {dogru ? (
              <span>Doğru</span>
            ) : (
              <>
                <div className="ja ww-answer">
                  {q.t === 'kelime' ? q.kana : q.t === 'okunus' ? q.label : q.char}
                </div>
                {q.t === 'kelime' && (
                  <div className="mora-line" style={{ justifyContent: 'center', borderTop: 0 }}>
                    {q.tokens.map((t, i) => (
                      <span key={i} className="mora">
                        <span className="ja mora-ch">{t}</span>
                        <span className="mora-r">{i + 1}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ww-foot">
        {q.t !== 'okunus' && (
          <KanaKeyboard
            type={klavyeAlfabesi}
            onKey={(c) => !acildi && setInput((v) => v + c)}
            onBackspace={() => !acildi && setInput((v) => [...v].slice(0, -1).join(''))}
            onClear={() => !acildi && setInput('')}
            disabled={acildi}
          />
        )}

        <div className="row" style={{ gap: 10, marginTop: 10, justifyContent: 'center' }}>
          {!acildi ? (
            <button className="btn btn--lg btn--primary" onClick={kontrol} disabled={!input}>
              Kontrol et
            </button>
          ) : (
            <button className="btn btn--lg btn--primary" onClick={() => void sonraki()} autoFocus>
              {idx + 1 >= sorular.length ? 'Bitir' : 'Sonraki'}
              <Icon name="right" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BolumKart({
  no,
  baslik,
  aciklama,
  adet,
}: {
  no: number
  baslik: string
  aciklama: string
  adet: number
}) {
  return (
    <div className="card" style={{ opacity: adet ? 1 : 0.5 }}>
      <div className="row">
        <span className="plan-no tabular">{no}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>
            {baslik}
          </div>
          <div className="card-sub">{aciklama}</div>
        </div>
        <span className="tiny faint tabular">{adet} soru</span>
      </div>
    </div>
  )
}
