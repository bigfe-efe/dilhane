import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Chips, Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ExerciseRunner } from '@/components/ExerciseRunner'
import { UNIT_BY_ID, type Unit, type UnitVocab } from '@/content/ja/units'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import { LESSONS_BY_ID } from '@/content'
import { db } from '@/db/db'
import { useUnit } from '@/db/hooks'

// Ünite sayfası.
//
// Bölümler sekmeli: hedef, dilbilgisi, kelime, metin, ödev, test. Hepsi tek
// sayfada alt alta olsaydı ünite 2000 piksel uzunluğunda olur ve öğrenci
// kaldığı yeri bulamazdı. Sekme, "bugün hangi parçayı çalışıyorum"u da
// netleştiriyor.

type Bolum = 'hedef' | 'gramer' | 'kelime' | 'metin' | 'odev' | 'test'

const BOLUMLER: { id: Bolum; label: string }[] = [
  { id: 'hedef', label: 'Hedefler' },
  { id: 'gramer', label: 'Dilbilgisi' },
  { id: 'kelime', label: 'Kelime' },
  { id: 'metin', label: 'Metin' },
  { id: 'odev', label: 'Ödev' },
  { id: 'test', label: 'Test' },
]

/** Ünite kaydını oluşturur ya da günceller — her yerde aynı varsayılanlarla. */
async function kaydet(unitId: string, patch: Partial<{ homework: string[]; testBest: number; testAt: number; status: 'in-progress' | 'completed' }>) {
  const mevcut = await db.units.get(unitId)
  await db.units.put({
    unitId,
    status: 'in-progress',
    homework: [],
    testBest: 0,
    ...mevcut,
    ...patch,
    updated: Date.now(),
  })
}

export default function UnitPage() {
  const { id } = useParams<{ id: string }>()
  const unit = id ? UNIT_BY_ID.get(id) : undefined
  const [bolum, setBolum] = useState<Bolum>('hedef')
  const prog = useUnit(id)

  if (!unit) {
    return (
      <>
        <TopBar title="Ünite bulunamadı" back="/uniteler" />
        <div className="page">
          <Link to="/uniteler" className="btn btn--block">
            Ünitelere dön
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title={`${unit.no}. ${unit.title}`} sub={unit.subtitle} back="/uniteler" />

      <div className="page stack-lg lang-ja">
        <Chips items={BOLUMLER} value={bolum} onChange={(v) => setBolum(v)} />

        {bolum === 'hedef' && <Hedefler unit={unit} testBest={prog?.testBest ?? 0} />}
        {bolum === 'gramer' && <Gramer unit={unit} />}
        {bolum === 'kelime' && <Kelime unit={unit} />}
        {bolum === 'metin' && <Metin unit={unit} />}
        {bolum === 'odev' && <Odev unit={unit} yapilan={prog?.homework ?? []} />}
        {bolum === 'test' && <Test unit={unit} best={prog?.testBest ?? 0} />}
      </div>
    </>
  )
}

// ————————————————————————— Hedefler —————————————————————————

function Hedefler({ unit, testBest }: { unit: Unit; testBest: number }) {
  const dersler = (unit.lessonIds ?? []).map((lid) => LESSONS_BY_ID.get(lid)).filter(Boolean)

  return (
    <div className="stack">
      <div className="card stack-sm">
        <div className="card-title">Bu ünitede ne öğreneceksin</div>
        <ul className="tight small">
          {unit.canDo.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="tiny faint">
          Tahmini süre {unit.minutes} dakika · {unit.grammar.length} dilbilgisi konusu · {unit.vocab.length} kelime
          {testBest > 0 && ` · en iyi test sonucun %${testBest}`}
        </div>
      </div>

      {unit.rules?.length ? (
        <div className="stack-sm">
          <h2>Bilmen gereken kurallar</h2>
          {unit.rules.map((r) => (
            <div key={r.title} className="card stack-sm">
              <div className="card-title">{r.title}</div>
              <div className="small">{r.body}</div>
            </div>
          ))}
        </div>
      ) : null}

      {dersler.length > 0 && (
        <div className="stack-sm">
          <h2>İlgili Genki dersleri</h2>
          <div className="card-sub" style={{ marginTop: -2 }}>
            Aynı konuyu kitabın sırasıyla çalışmak istersen.
          </div>
          {dersler.map((l) => (
            <Link key={l!.id} to={`/lesson/${l!.id}`} className="card card--link">
              <div className="row">
                <span className="entry-icon">
                  <Icon name="book" size={18} />
                </span>
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">{l!.title}</div>
                  <div className="card-sub">{l!.subtitle}</div>
                </div>
                <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ————————————————————————— Dilbilgisi —————————————————————————

function Gramer({ unit }: { unit: Unit }) {
  return (
    <div className="stack">
      {unit.grammar.map((g) => (
        <div key={g.title} className="card stack-sm">
          <div className="row">
            <div className="card-title" style={{ flex: 1 }}>
              {g.title}
            </div>
            <Badge tone="accent">
              <span className="ja">{g.pattern}</span>
            </Badge>
          </div>
          <div className="small">{g.explain}</div>

          <div className="stack-sm" style={{ marginTop: 4 }}>
            {g.examples.map((e) => (
              <div key={e.ja} className="unit-ex">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ja unit-ex-ja">{e.ja}</div>
                  <div className="ja tiny faint">{e.kana}</div>
                  <div className="small dim">{e.tr}</div>
                </div>
                <SpeakBtn text={e.ja} lang="ja" size="sm" reading={e.kana} />
              </div>
            ))}
          </div>

          {g.pitfall && (
            <div className="feedback feedback--bad tiny">
              <b>Dikkat: </b>
              {g.pitfall}
            </div>
          )}

          {g.ref && (
            <Link to={`/grammar/${g.ref}`} className="btn btn--sm btn--ghost" style={{ justifySelf: 'start' }}>
              Ayrıntılı anlatım
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

// ————————————————————————— Kelime —————————————————————————

function Kelime({ unit }: { unit: Unit }) {
  const [acik, setAcik] = useState<UnitVocab | null>(null)

  return (
    <div className="stack-sm">
      <div className="card-sub">
        Ünite boyunca geçen kelimeler. <b>Karta dokunursan çizgi sırasını</b> görürsün.
      </div>
      <div className="cols-2">
        {unit.vocab.map((v) => (
          <div
            key={v.ja}
            className="card unit-vocab"
            role="button"
            tabIndex={0}
            onClick={() => setAcik(v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setAcik(v)
              }
            }}
          >
            <div className="row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ja unit-vocab-ja">{v.ja}</div>
                {v.kana !== v.ja && <div className="ja unit-vocab-kana">{v.kana}</div>}
                <div className="unit-vocab-tr">{v.tr}</div>
                {v.note && <div className="tiny dim">{v.note}</div>}
              </div>
              {/* Ses düğmesi kartın kendi tıklamasını tetiklemesin */}
              <span onClick={(e) => e.stopPropagation()}>
                <SpeakBtn text={v.ja} lang="ja" size="sm" reading={v.kana} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {acik && <KelimeSheet v={acik} onClose={() => setAcik(null)} />}
    </div>
  )
}

/**
 * Kelimenin çizgi sırası.
 *
 * Kanjili kelimede her kanji ayrı ayrı gösterilir — 名前 tek bir çizim
 * değil, iki karakterin çizimidir ve ikisi ayrı öğrenilir. Kanjisi olmayan
 * kelimelerde (はじめまして) kana karakterlerinin çizimi gösterilir; elle
 * yazarken asıl takılınan yer orası.
 */
function KelimeSheet({ v, onClose }: { v: UnitVocab; onClose: () => void }) {
  const kanjiler = [...new Set([...v.ja].filter((c) => KANJI_BY_CHAR.has(c)))]
  // Kanji yoksa kanaya düşülüyor; uzun kelimelerde ilk altı karakter yeter
  const kanalar = kanjiler.length ? [] : [...new Set([...v.kana].filter((c) => /[ぁ-ゟァ-ヿ]/.test(c)))].slice(0, 6)
  const karakterler = kanjiler.length ? kanjiler : kanalar

  return (
    <Sheet onClose={onClose}>
      <div className="stack lang-ja">
        <div className="center stack-sm">
          <div className="ja unit-sheet-word">{v.ja}</div>
          {v.kana !== v.ja && <div className="ja unit-sheet-kana">{v.kana}</div>}
          <div style={{ fontSize: '1.15rem' }}>{v.tr}</div>
          {v.note && <div className="tiny dim">{v.note}</div>}
          <SpeakBtn text={v.ja} lang="ja" reading={v.kana} />
        </div>

        {karakterler.length === 0 ? (
          <div className="tiny faint center">Bu kelime için çizgi verisi yok.</div>
        ) : (
          karakterler.map((ch) => {
            const k = KANJI_BY_CHAR.get(ch)
            return (
              <div key={ch} className="stack-sm">
                <div className="row">
                  <span className="ja" style={{ fontSize: '1.8rem', width: 40, textAlign: 'center' }}>
                    {ch}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {k ? (
                      <>
                        <div className="card-title">{k.meaningsTr.join(', ')}</div>
                        <div className="tiny faint">
                          {k.on.length > 0 && (
                            <>
                              on: <span className="ja">{k.on.join('・')}</span>
                            </>
                          )}
                          {k.on.length > 0 && k.kun.length > 0 && ' · '}
                          {k.kun.length > 0 && (
                            <>
                              kun: <span className="ja">{k.kun.join('・')}</span>
                            </>
                          )}
                          {` · ${k.strokes} çizgi`}
                        </div>
                      </>
                    ) : (
                      <div className="card-title">Kana</div>
                    )}
                  </div>
                </div>
                <StrokeOrder char={ch} height={240} autoPlay loop compact />
              </div>
            )
          })
        )}
      </div>
    </Sheet>
  )
}

// ————————————————————————— Metin —————————————————————————

function Metin({ unit }: { unit: Unit }) {
  const [kana, setKana] = useState(true)
  const [tr, setTr] = useState(false)
  const [soru, setSoru] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)

  const t = unit.text

  if (soru) {
    return (
      <div className="stack">
        {sonuc ? (
          <div className="card card--pad-lg center stack">
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {sonuc.c} / {sonuc.t}
            </div>
            <div className="dim">Metin soruları</div>
            <button className="btn btn--block" onClick={() => { setSoru(false); setSonuc(null) }}>
              Metne dön
            </button>
          </div>
        ) : (
          <ExerciseRunner
            list={t.questions}
            onFinish={(c, n) => setSonuc({ c, t: n })}
            onCancel={() => setSoru(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="card stack-sm">
        <div className="card-title ja">{t.title}</div>
        <div className="card-sub">{t.intro}</div>
      </div>

      <div className="row-wrap">
        <button className={`btn btn--sm btn--ghost${kana ? ' is-on' : ''}`} onClick={() => setKana((k) => !k)}>
          Kana {kana ? 'açık' : 'kapalı'}
        </button>
        <button className={`btn btn--sm btn--ghost${tr ? ' is-on' : ''}`} onClick={() => setTr((x) => !x)}>
          Türkçe {tr ? 'açık' : 'kapalı'}
        </button>
        <SpeakBtn
          text={t.lines.map((l) => l.ja).join(' ')}
          lang="ja"
          reading={t.lines.map((l) => l.kana).join(' ')}
        />
      </div>

      <div className="card stack-sm">
        {t.lines.map((l, i) => (
          <div key={i} className="unit-line">
            <SpeakBtn text={l.ja} lang="ja" size="sm" reading={l.kana} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ja unit-line-ja">{l.ja}</div>
              {kana && <div className="ja tiny faint">{l.kana}</div>}
              {tr && <div className="small dim">{l.tr}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="tiny faint">
        Önce Türkçeyi kapatıp oku; takıldığında aç. Her kelimeyi anlamak zorunda değilsin, genel anlamı yakala.
      </div>

      <button className="btn btn--primary btn--block" onClick={() => setSoru(true)}>
        Metin sorularını çöz ({t.questions.length})
      </button>
    </div>
  )
}

// ————————————————————————— Ödev —————————————————————————

function Odev({ unit, yapilan }: { unit: Unit; yapilan: string[] }) {
  const set = new Set(yapilan)

  const cevir = async (hid: string) => {
    const yeni = new Set(set)
    if (yeni.has(hid)) yeni.delete(hid)
    else yeni.add(hid)
    await kaydet(unit.id, { homework: [...yeni] })
  }

  const toplamDk = unit.homework.reduce((n, h) => n + h.minutes, 0)

  return (
    <div className="stack-sm">
      <div className="card-sub">
        Ödevler kâğıt üstünde yapılır; uygulama yalnızca işaretini tutar. Toplam ~{toplamDk} dakika.
      </div>
      {unit.homework.map((h) => {
        const ok = set.has(h.id)
        return (
          <button key={h.id} className={`card unit-hw${ok ? ' is-done' : ''}`} onClick={() => void cevir(h.id)}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className={`unit-check${ok ? ' is-on' : ''}`}>{ok ? <Icon name="check" size={14} /> : ''}</span>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div className="card-title">{h.title}</div>
                <div className="card-sub">{h.detail}</div>
                <div className="tiny faint">{h.minutes} dk</div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ————————————————————————— Test —————————————————————————

function Test({ unit, best }: { unit: Unit; best: number }) {
  const [calisiyor, setCalisiyor] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)

  const bitir = async (c: number, t: number) => {
    const yuzde = t ? Math.round((c / t) * 100) : 0
    setSonuc({ c, t })
    setCalisiyor(false)
    await kaydet(unit.id, {
      testBest: Math.max(best, yuzde),
      testAt: Date.now(),
      status: yuzde >= 70 ? 'completed' : 'in-progress',
    })
  }

  if (calisiyor) {
    return <ExerciseRunner list={unit.test} onFinish={(c, t) => void bitir(c, t)} onCancel={() => setCalisiyor(false)} />
  }

  const yuzde = sonuc && sonuc.t ? Math.round((sonuc.c / sonuc.t) * 100) : null

  return (
    <div className="stack">
      {sonuc && (
        <div className="card card--pad-lg center stack">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {sonuc.c} / {sonuc.t}
          </div>
          <div className="dim">%{yuzde}</div>
          {yuzde !== null && yuzde >= 70 ? (
            <div className="feedback feedback--ok small">Ünite tamamlandı sayılır. Sıradaki üniteye geçebilirsin.</div>
          ) : (
            <div className="feedback feedback--bad small">
              %70’in altında. Dilbilgisi bölümüne dönüp yanlış yaptığın konuları bir kez daha oku, sonra tekrar dene.
            </div>
          )}
        </div>
      )}

      <div className="card stack-sm">
        <div className="card-title">Ünite testi</div>
        <div className="card-sub">
          {unit.test.length} soru: şıklı, boşluk doldurma, sıralama, çeviri ve dinleme. Ünite tamamlanmış sayılmak
          için %70 gerekiyor.
        </div>
        {best > 0 && <div className="tiny faint">En iyi sonucun %{best}</div>}
      </div>

      <button className="btn btn--primary btn--block btn--lg" onClick={() => { setSonuc(null); setCalisiyor(true) }}>
        {sonuc ? 'Tekrar çöz' : 'Teste başla'}
      </button>
    </div>
  )
}
