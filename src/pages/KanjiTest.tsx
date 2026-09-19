import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chips, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KANJI_CARDS, KANJI_CARD_SETS } from '@/content/ja/kanji-cards'
import { KANJI_SENTENCES, type KanjiSentence, type Tok } from '@/content/ja/kanji-sentences'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import { acceptsJa } from '@/lib/answer'
import { shuffle } from '@/lib/shuffle'
import { bumpStat } from '@/db/db'

// Kanji testi — cümlede boşluk doldurma.
//
// NEDEN CÜMLE İÇİNDE: kanjiyi tek başına tanımak sınavda ölçülen şey değil.
// JLPT'nin ilk soru grubu kelimenin İÇİNDEKİ kanjiyi soruyor. Burada da
// kanji cümleden çıkarılıyor ve öğrenci bağlamdan bulmak zorunda.
//
// İKİ KİP:
//   Şıklı  — sınav biçimi; eleyerek de olsa bulabilirsin.
//   Yazarak — eleme yok. Japonca klavye gerekmesin diye kanjinin kendisi,
//            kanjinin okunuşu ya da kelimenin kanası/romajisi kabul edilir.

type Mode = 'karma' | 'mcq' | 'yaz'
type Count = 10 | 20 | 0

interface Q {
  kanji: string
  s: KanjiSentence
  word: Tok
  mode: 'mcq' | 'yaz'
  options: string[]
  answer: number
}

const SET_OF = new Map(KANJI_CARDS.map((c) => [c.k.char, c.setId]))

function buildQuestions(setId: string, mode: Mode, count: Count): Q[] {
  const havuz = KANJI_SENTENCES.filter((s) => setId === 'hepsi' || SET_OF.get(s.k) === setId)
  const secilen = shuffle(havuz)
  const liste = count === 0 ? secilen : secilen.slice(0, count)

  return liste.map((s, i) => {
    // Çeldiriciler aynı temadan: "Sayılar" sorusunda şıklar da sayı olsun,
    // yoksa anlamdan eleyip kanjiyi bilmeden doğru cevap bulunur.
    const tema = SET_OF.get(s.k)
    const ayniTema = KANJI_CARDS.filter((c) => c.setId === tema && c.k.char !== s.k).map((c) => c.k.char)
    const yedek = KANJI_CARDS.filter((c) => c.k.char !== s.k).map((c) => c.k.char)
    const havuzC = ayniTema.length >= 3 ? ayniTema : yedek
    const celdirici = shuffle(havuzC).slice(0, 3)
    const options = shuffle([s.k, ...celdirici])

    const word = s.tokens.find((t) => t.s.includes(s.k))!
    const soruKipi: 'mcq' | 'yaz' = mode === 'karma' ? (i % 2 === 0 ? 'mcq' : 'yaz') : mode
    return { kanji: s.k, s, word, mode: soruKipi, options, answer: options.indexOf(s.k) }
  })
}

/**
 * Yazarak kipinde kabul edilen cevaplar.
 *
 * Başta yalnızca kanji, kelime ve KELİMENİN okunuşu kabul ediliyordu. Soru
 * "boşluğa hangi kanji gelir" diye sorduğu için öğrenci doğal olarak
 * KANJİNİN okunuşunu yazıyor: 二人 sorusuna "futa" (二'nin kun okunuşu) ya da
 * "ni" (on okunuşu) yazmak kanjiyi doğru tanımaktır, ama yanlış sayılıyordu.
 *
 * Kun okunuşlarındaki tireden sonrası kanjinin dışında kalan hiragana
 * (い-きる → 行 yalnızca い'yi karşılar), o yüzden tireye kadarı alınıyor.
 */
function kabulEdilenler(q: Q): string[] {
  const k = KANJI_BY_CHAR.get(q.kanji)
  const okunuslar = [...(k?.on ?? []), ...(k?.kun ?? [])]
    .map((r) => r.replace(/^-/, '').split('-')[0])
    .filter(Boolean)
  return [q.kanji, q.word.s, q.word.r, ...okunuslar]
}

/** Cümlede o kanjinin GEÇTİĞİ HER YERİ boşluğa çevirir. */
function blankOf(s: KanjiSentence): string {
  return s.ja.split(s.k).join('＿')
}

export default function KanjiTestPage() {
  const [setId, setSetId] = useState('sayilar')
  const [mode, setMode] = useState<Mode>('karma')
  const [count, setCount] = useState<Count>(10)

  const [sorular, setSorular] = useState<Q[] | null>(null)
  const [i, setI] = useState(0)
  const [secili, setSecili] = useState<number | null>(null)
  const [yazilan, setYazilan] = useState('')
  const [dogruMu, setDogruMu] = useState<boolean | null>(null)
  const [yanlislar, setYanlislar] = useState<Q[]>([])
  const [skor, setSkor] = useState(0)

  const havuzBoyu = useMemo(
    () => KANJI_SENTENCES.filter((s) => setId === 'hepsi' || SET_OF.get(s.k) === setId).length,
    [setId],
  )

  const basla = () => {
    setSorular(buildQuestions(setId, mode, count))
    setI(0)
    setSecili(null)
    setYazilan('')
    setDogruMu(null)
    setYanlislar([])
    setSkor(0)
  }

  const q = sorular?.[i]

  const cevapla = (ok: boolean) => {
    if (dogruMu !== null || !q) return
    setDogruMu(ok)
    setSkor((s) => s + (ok ? 1 : 0))
    if (!ok) setYanlislar((y) => [...y, q])
    bumpStat({ reviews: 1, correct: ok ? 1 : 0, ja: 1 })
  }

  const ileri = () => {
    setSecili(null)
    setYazilan('')
    setDogruMu(null)
    setI((n) => n + 1)
  }

  // ————————————————————————— Kurulum —————————————————————————

  if (!sorular) {
    return (
      <>
        <TopBar title="Kanji testi" sub="Cümlede boşluk doldurma" back="/kanji-kartlar" />
        <div className="page stack-lg lang-ja">
          <div className="card stack-sm">
            <div className="card-title">Nasıl çalışır</div>
            <div className="card-sub">
              Cümleden bir kanji çıkarılır, sen tamamlarsın. Kanjiyi tek başına tanımak yetmez — JLPT de
              kanjiyi cümlenin içinde sorar.
            </div>
            <div className="tiny faint">
              Yazarak kipinde Japonca klavye gerekmez: kanjinin kendisini, okunuşunu ya da kelimenin
              kanasını/romajisini yazabilirsin.
            </div>
          </div>

          <div className="stack-sm">
            <h2>Konu</h2>
            <Chips
              items={[...KANJI_CARD_SETS, { id: 'hepsi', label: 'Hepsi' }]}
              value={setId}
              onChange={setSetId}
            />
            <div className="tiny faint">{havuzBoyu} kanji</div>
          </div>

          <div className="stack-sm">
            <h2>Kip</h2>
            <div className="row-wrap">
              {([
                ['karma', 'Karışık'],
                ['mcq', 'Şıklı'],
                ['yaz', 'Yazarak'],
              ] as [Mode, string][]).map(([id, label]) => (
                <button
                  key={id}
                  className={`btn btn--sm${mode === id ? ' is-on' : ''}`}
                  onClick={() => setMode(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="stack-sm">
            <h2>Soru sayısı</h2>
            <div className="row-wrap">
              {([10, 20, 0] as Count[]).map((n) => (
                <button
                  key={n}
                  className={`btn btn--sm${count === n ? ' is-on' : ''}`}
                  onClick={() => setCount(n)}
                >
                  {n === 0 ? `Tümü (${havuzBoyu})` : n}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn--primary btn--block btn--lg" onClick={basla}>
            Başla
          </button>
        </div>
      </>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (!q) {
    const yuzde = sorular.length ? Math.round((skor / sorular.length) * 100) : 0
    return (
      <>
        <TopBar title="Kanji testi" sub="Sonuç" back="/kanji-kartlar" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
              {skor} / {sorular.length}
            </div>
            <div className="dim">%{yuzde}</div>
          </div>

          {yanlislar.length > 0 && (
            <div className="stack-sm">
              <h2>Yanlışların</h2>
              {yanlislar.map((y) => (
                <div key={y.kanji} className="card stack-sm">
                  <div className="row">
                    <span className="ja" style={{ fontSize: '2rem', width: 44, textAlign: 'center' }}>
                      {y.kanji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title">{KANJI_BY_CHAR.get(y.kanji)?.meaningsTr.join(', ')}</div>
                      <div className="ja" style={{ fontSize: '1.15rem' }}>{y.s.ja}</div>
                      <div className="tiny dim ja">{y.s.kana}</div>
                      <div className="tiny dim">{y.s.tr}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn--primary btn--block" onClick={basla}>
            Tekrar çöz
          </button>
          <Link to="/kanji-kartlar" className="btn btn--block">
            Kartlara dön
          </Link>
        </div>
      </>
    )
  }

  // ————————————————————————— Soru —————————————————————————

  const kanji = KANJI_BY_CHAR.get(q.kanji)

  return (
    <>
      <TopBar title="Kanji testi" sub={`${i + 1} / ${sorular.length}`} back="/kanji-kartlar" />
      <div className="page stack-lg lang-ja">
        <div className="card card--pad-lg stack-sm">
          <div className="tiny faint">Boşluğa hangi kanji gelir?</div>
          <div className="ja kt-sentence">{blankOf(q.s)}</div>
          <div className="kt-tr">{q.s.tr}</div>
        </div>

        {q.mode === 'mcq' ? (
          <div className="stack-sm">
            {q.options.map((opt, oi) => {
              let cls = 'option'
              if (dogruMu !== null) {
                if (oi === q.answer) cls += ' is-correct'
                else if (oi === secili) cls += ' is-wrong'
                else cls += ' is-muted'
              }
              return (
                <button
                  key={opt}
                  className={`${cls} option--glyph`}
                  onClick={() => {
                    if (dogruMu !== null) return
                    setSecili(oi)
                    cevapla(oi === q.answer)
                  }}
                >
                  <span className="key">{oi + 1}</span>
                  <span className="ja" style={{ fontSize: 'clamp(2.2rem, 7vw, 3rem)' }}>{opt}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="stack-sm">
            <input
              className={`field${dogruMu === null ? '' : dogruMu ? ' is-correct' : ' is-wrong'}`}
              value={yazilan}
              onChange={(e) => setYazilan(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dogruMu === null && yazilan.trim()) {
                  cevapla(acceptsJa(yazilan, kabulEdilenler(q)))
                }
              }}
              placeholder={`ör. ${q.word.r}`}
              disabled={dogruMu !== null}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <div className="tiny faint">
              Kanjiyi, kanjinin okunuşunu ya da kelimenin kanasını/romajisini yazabilirsin.
            </div>
            {dogruMu === null && (
              <button
                className="btn btn--primary btn--block"
                disabled={!yazilan.trim()}
                onClick={() => cevapla(acceptsJa(yazilan, kabulEdilenler(q)))}
              >
                Kontrol et
              </button>
            )}
          </div>
        )}

        {dogruMu !== null && (
          <>
            <div className={`feedback ${dogruMu ? 'feedback--ok' : 'feedback--bad'}`}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span className="ja" style={{ fontSize: '2.2rem', lineHeight: 1 }}>{q.kanji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bold">{kanji?.meaningsTr.join(', ')}</div>
                  <div className="ja" style={{ fontSize: '1.2rem', marginTop: 4 }}>{q.s.ja}</div>
                  <div className="tiny dim ja">{q.s.kana}</div>
                  <div className="small" style={{ marginTop: 2 }}>{q.s.tr}</div>
                </div>
              </div>
              <div className="tiny" style={{ marginTop: 8, opacity: 0.9 }}>
                <b className="ja">{q.word.s}</b> <span className="ja">{q.word.r}</span> — {q.word.tr}
                {q.word.note ? ` · ${q.word.note}` : ''}
              </div>
            </div>

            <button className="btn btn--primary btn--block btn--lg" onClick={ileri} autoFocus>
              Devam
              <Icon name="right" size={16} />
            </button>
          </>
        )}
      </div>
    </>
  )
}
