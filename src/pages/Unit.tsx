import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Badge, Chips, Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ExerciseRunner } from '@/components/ExerciseRunner'
import { UNIT_BY_ID, unitKanji, type Unit, type UnitVocab } from '@/content/ja/units'
import { CHOUKAI, MONDAI, karisikKopya, type ChoukaiQ, type MockQ } from '@/content/ja/n5-mock'
import { ChoukaiMetin, ChoukaiPlayer, MockPrompt, SecenekListesi } from '@/components/N5Soru'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import { JaOkunus } from '@/components/JaOkunus'
import { LESSONS_BY_ID, unitVocabIds } from '@/content'
import { cardId, db, ensureCards } from '@/db/db'
import { useUnit } from '@/db/hooks'

// Ünite sayfası.
//
// Bölümler sekmeli: hedef, dilbilgisi, kelime, metin, ödev, test. Hepsi tek
// sayfada alt alta olsaydı ünite 2000 piksel uzunluğunda olur ve öğrenci
// kaldığı yeri bulamazdı. Sekme, "bugün hangi parçayı çalışıyorum"u da
// netleştiriyor.

type Bolum = 'hedef' | 'gramer' | 'kelime' | 'metin' | 'odev' | 'test' | 'n5'

const BOLUMLER: { id: Bolum; label: string }[] = [
  { id: 'hedef', label: 'Hedefler' },
  { id: 'gramer', label: 'Dilbilgisi' },
  { id: 'kelime', label: 'Kelime' },
  { id: 'metin', label: 'Metin' },
  { id: 'odev', label: 'Ödev' },
  { id: 'test', label: 'Test' },
  { id: 'n5', label: 'N5 soruları' },
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

/**
 * Ünitenin kelimelerini ve N5 kanjilerini tekrar sistemine ekler. Kelimeler
 * derslerdeki gibi iki yönlü (kelime → anlam ve anlam → kelime). Var olan
 * karta dokunmaz. Eklenen kelime + kanji sayısını döndürür.
 */
async function kelimeleriEkle(unitId: string): Promise<number> {
  const ids = unitVocabIds(unitId)
  const kelime = await ensureCards(ids.map((refId) => ({ kind: 'vocab' as const, refId, lang: 'ja' as const })))
  await ensureCards(ids.map((refId) => ({ kind: 'vocab' as const, refId, lang: 'ja' as const, reverse: true })))
  const kanji = await ensureCards(unitKanji(unitId).map((refId) => ({ kind: 'kanji' as const, refId, lang: 'ja' as const })))
  return kelime + kanji
}

export default function UnitPage() {
  const { id } = useParams<{ id: string }>()
  const unit = id ? UNIT_BY_ID.get(id) : undefined
  // Bölüm adreste: Bugün listesi "ödevlere devam et" derken doğrudan Ödev
  // sekmesini açabilsin.
  const [params, setParams] = useSearchParams()
  const istenen = params.get('b') as Bolum | null
  const bolum: Bolum = BOLUMLER.some((b) => b.id === istenen) ? istenen! : 'hedef'
  const setBolum = (b: Bolum) => setParams({ b }, { replace: true })
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
        {bolum === 'n5' && <N5Pratik key={unit.id} unit={unit} />}
      </div>
    </>
  )
}

// ————————————————————————— Hedefler —————————————————————————

function Hedefler({ unit, testBest }: { unit: Unit; testBest: number }) {
  const dersler = (unit.lessonIds ?? []).map((lid) => LESSONS_BY_ID.get(lid)).filter(Boolean)

  const onemli = [
    ...unit.grammar.filter((g) => g.star).map((g) => ({ baslik: g.title, nerede: 'Dilbilgisi' })),
    ...(unit.rules ?? []).filter((r) => r.star).map((r) => ({ baslik: r.title, nerede: 'Kurallar' })),
    ...unit.homework.filter((h) => h.star).map((h) => ({ baslik: h.title, nerede: 'Ödev' })),
  ]

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

      {/*
        Yıldızlı bilgiler tek yerde toplanıyor. Ünite sayfası altı sekme;
        kritik bilgi dilbilgisi, kural ve ödev sekmelerine dağılmış hâlde
        kalıyordu ve "neyi kaçırmamalıyım" sorusunun cevabı hiçbir ekranda
        yoktu. Burada özet var, yıldızın kendisi ilgili sekmede duruyor.
      */}
      {onemli.length > 0 && (
        <div className="card card--pad-lg stack-sm is-star">
          <div className="row" style={{ gap: 8 }}>
            <span className="card-title">★ Bunları atlama</span>
          </div>
          <ul className="tight small">
            {onemli.map((o) => (
              <li key={o.baslik}>
                <b>{o.baslik}</b> <span className="faint">· {o.nerede}</span>
              </li>
            ))}
          </ul>
          <div className="tiny faint">
            Bu ünitenin en çok hata yaptırdığı noktalar. İlgili sekmede yanlarında ★ var.
          </div>
        </div>
      )}

      {unit.rules?.length ? (
        <div className="stack-sm">
          <h2>Bilmen gereken kurallar</h2>
          {unit.rules.map((r) => (
            <div key={r.title} className={`card stack-sm${r.star ? ' is-star' : ''}`}>
              <div className="row" style={{ gap: 8 }}>
                <span className="card-title">{r.title}</span>
                {r.star && <Yildiz />}
              </div>
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
        <div key={g.title} className={`card stack-sm${g.star ? ' is-star' : ''}`}>
          <div className="row">
            <div className="card-title" style={{ flex: 1 }}>
              {g.title} {g.star && <Yildiz />}
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
                  <JaOkunus ja={e.ja} kana={e.kana} tr={e.tr} jaClass="unit-ex-ja" />
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
  const ids = unitVocabIds(unit.id)
  const kanjiler = unitKanji(unit.id)
  const toplamKart = ids.length + kanjiler.length
  // Kaç kelime ve kanjinin kartı zaten var — düğme yalnızca eksik varsa görünür
  const kartli = useLiveQuery(
    async () =>
      (await db.cards.bulkGet([...ids.map((v) => cardId('vocab', v)), ...kanjiler.map((k) => cardId('kanji', k))])).filter(
        Boolean,
      ).length,
    [unit.id],
  )

  return (
    <div className="stack-sm">
      <div className="card-sub">
        Ünite boyunca geçen kelimeler. <b>Karta dokunursan çizgi sırasını</b> görürsün.
      </div>

      {/* Ünitede öğrenilen kelime tekrar edilmezse bir hafta içinde gider.
          Test geçilince kendiliğinden ekleniyor; beklemek istemeyen buradan
          ekler. */}
      {kartli !== undefined && (
        <div className="card row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Icon name="repeat" size={18} style={{ color: 'var(--accent)' }} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="small">
              {kartli >= toplamKart ? (
                <>
                  Bu ünitenin {ids.length} kelimesi ve {kanjiler.length} kanjisi tekrar listende.
                </>
              ) : (
                <>
                  {toplamKart} kelime ve kanjiden {kartli} tanesi tekrar listende.
                </>
              )}
            </div>
            <div className="tiny faint">Ünite testini geçince kelimeler ve kanjiler kendiliğinden eklenir.</div>
          </div>
          {kartli < toplamKart && (
            <button className="btn btn--sm" onClick={() => void kelimeleriEkle(unit.id)}>
              Tekrara ekle ({toplamKart - kartli})
            </button>
          )}
        </div>
      )}

      {/* Ünitenin N5 kanjileri: 106 kanji 14 üniteye elle dağıtıldı; burada
          yalnızca bu ünitenin payı. Dokununca çizim sırası açılır. */}
      {kanjiler.length > 0 && (
        <div className="card stack-sm">
          <div className="row">
            <span className="card-title">Bu ünitenin N5 kanjileri</span>
            <div className="spacer" />
            <span className="tiny faint tabular">{kanjiler.length}</span>
          </div>
          <div className="unit-kanji-row">
            {kanjiler.map((ch) => {
              const k = KANJI_BY_CHAR.get(ch)
              return (
                <button
                  key={ch}
                  className="unit-kanji"
                  onClick={() => setAcik({ ja: ch, kana: ch, tr: k?.meaningsTr.join(', ') ?? '' })}
                >
                  <span className="ja unit-kanji-ch">{ch}</span>
                  <span className="unit-kanji-tr">{k?.meaningsTr[0] ?? ''}</span>
                </button>
              )
            })}
          </div>
          <div className="tiny faint">Dokun: çizim sırası, anlam ve okunuşlar.</div>
        </div>
      )}
      <div className="cols-2">
        {unit.vocab.map((v) => (
          <div
            key={v.ja}
            className={`card unit-vocab${v.star ? ' is-star' : ''}`}
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
              <div className="jo-kart" style={{ flex: 1, minWidth: 0 }}>
                <JaOkunus ja={v.ja} kana={v.kana} tr={v.tr} jaClass="unit-vocab-ja">
                  {v.star && <Yildiz label="Çok kullanılır" />}
                  {v.note && <div className="tiny dim">{v.note}</div>}
                </JaOkunus>
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
        <div className="center stack-sm jo-sheet">
          <JaOkunus ja={v.ja} kana={v.kana} tr={v.tr} jaClass="unit-sheet-word">
            {v.note && <div className="tiny dim">{v.note}</div>}
          </JaOkunus>
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
  // Latin okunuş: kana henüz akıcı okunmadığında metnin sesini verir.
  // Varsayılan AÇIK — öğrenci her örnekte romaji istedi; kanayı çalışmak
  // isteyen kapatıp önce kanadan okumayı deneyebilir.
  const [latin, setLatin] = useState(true)
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
        <button className={`btn btn--sm btn--ghost${latin ? ' is-on' : ''}`} onClick={() => setLatin((x) => !x)}>
          Latin {latin ? 'açık' : 'kapalı'}
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
              {/* Sıra her yerdeki gibi: yazılış → romaji → kana → Türkçe.
                  Anahtarlar yalnızca bu metinde var: okuma alıştırmasında
                  satırları tek tek gizleyebilmek için. */}
              <JaOkunus
                ja={l.ja}
                kana={l.kana}
                tr={tr ? l.tr : undefined}
                gizle={{ kana: !kana, romaji: !latin }}
                jaClass="unit-line-ja"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="tiny faint">
        Önce Türkçeyi kapatıp oku; takıldığında aç. Her kelimeyi anlamak zorunda değilsin, genel anlamı yakala.
        Latin satırında <b>wa</b>, <b>e</b>, <b>o</b> görürsen bunlar は, へ, を ekleridir — yazılışları başka,
        okunuşları böyle.
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
    <div className="stack">
      <div className="card-sub">
        Ödevler kâğıt üstünde yapılır; uygulama yalnızca işaretini tutar. Toplam ~{toplamDk} dakika.
      </div>

      {unit.homework.map((h) => {
        const ok = set.has(h.id)
        return (
          <div key={h.id} className={`card unit-hw${ok ? ' is-done' : ''}`}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              {/* İşaret kutusu AYRI bir düğme: kartın tamamı tıklanabilir
                  olsaydı ödevi okumak için açılan her tıklama onu "yapıldı"
                  işaretlerdi. */}
              <button
                className={`unit-check${ok ? ' is-on' : ''}`}
                onClick={() => void cevir(h.id)}
                aria-pressed={ok}
                aria-label={ok ? 'Yapıldı işaretini kaldır' : 'Yapıldı olarak işaretle'}
              >
                {ok ? <Icon name="check" size={14} /> : ''}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="card-title">{h.title}</span>
                  {h.star && <Yildiz />}
                  <div className="spacer" />
                  <span className="tiny faint">{h.minutes} dk</span>
                </div>
                <div className="card-sub" style={{ marginTop: 3 }}>
                  {h.detail}
                </div>
              </div>
            </div>

            {h.steps?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">Nasıl yapılır</div>
                <ol className="unit-steps">
                  {h.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {h.example?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">Örnek</div>
                <div className="unit-hw-ex">
                  {h.example.map((e, i) => (
                    <div key={i} className="unit-hw-exline">
                      <JaOkunus ja={e.ja} kana={e.kana} tr={e.tr} jaClass="unit-hw-exja" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {h.tips?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">İşine yarar</div>
                <ul className="unit-tips">
                  {h.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/** Atlanmaması gereken bilgiyi işaretler. */
function Yildiz({ label = 'Önemli' }: { label?: string }) {
  return (
    <span className="unit-star" title="Bu bilgi atlanmamalı">
      ★ {label}
    </span>
  )
}

// ————————————————————————— Test —————————————————————————

function Test({ unit, best }: { unit: Unit; best: number }) {
  const [calisiyor, setCalisiyor] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)
  const [eklenen, setEklenen] = useState(0)

  const bitir = async (c: number, t: number) => {
    const yuzde = t ? Math.round((c / t) * 100) : 0
    const enIyi = Math.max(best, yuzde)
    setSonuc({ c, t })
    setCalisiyor(false)
    // Tamamlanma EN İYİ sonuca bakar. Önceden son denemeye bakıyordu:
    // geçilmiş bir üniteyi pekiştirmek için testi yeniden çözen biri %70'in
    // altında kalınca ünite "devam ediyor"a geri düşüyordu.
    await kaydet(unit.id, {
      testBest: enIyi,
      testAt: Date.now(),
      status: enIyi >= 70 ? 'completed' : 'in-progress',
    })
    if (yuzde >= 70) setEklenen(await kelimeleriEkle(unit.id))
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
            <div className="feedback feedback--ok small">
              Ünite tamamlandı sayılır. Sıradaki üniteye geçebilirsin.
              {eklenen > 0 && ` Bu ünitenin ${eklenen} kelime ve kanjisi tekrar listene eklendi.`}
            </div>
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

// ————————————————————————— N5 soruları —————————————————————————

type Madde = { tur: 'okuma'; q: MockQ } | { tur: 'dinleme'; q: ChoukaiQ }

/**
 * Ünitenin konusunun gerçek N5 sınavında nasıl sorulduğu.
 *
 * NEDEN AYRI SEKME: ünite testi öğrenmeyi ölçer (Türkçe sorular, yazarak
 * cevap). Sınav ise bambaşka bir biçimde sorar: tamamen Japonca, dört şıklı,
 * altı çizili kelime, ★ sıralama, bir kez çalan ses. Biçime alışmak ayrı bir
 * beceri; sınav gününe bırakılınca puan kaybettiriyor. Buradaki sorular
 * deneme sınavının havuzunda da var.
 */
function N5Pratik({ unit }: { unit: Unit }) {
  const [liste, setListe] = useState<Madde[] | null>(null)
  const [i, setI] = useState(0)
  const [secilen, setSecilen] = useState<number | undefined>()
  const [dogru, setDogru] = useState(0)
  const [yanlislar, setYanlislar] = useState<Madde[]>([])

  const okuma = unit.n5 ?? []
  const dinleme = unit.choukai ?? []

  const basla = () => {
    setListe([
      ...okuma.map((q) => ({ tur: 'okuma' as const, q: karisikKopya(q) })),
      ...dinleme.map((q) => ({ tur: 'dinleme' as const, q: karisikKopya(q) })),
    ])
    setI(0)
    setSecilen(undefined)
    setDogru(0)
    setYanlislar([])
  }

  if (!liste) {
    const tipler = [
      ...new Set([...okuma.map((q) => `${MONDAI[q.mondai].jp} · ${MONDAI[q.mondai].title}`), ...dinleme.map((q) => `${CHOUKAI[q.mondai].jp} · ${CHOUKAI[q.mondai].title} (dinleme)`)]),
    ]
    return (
      <div className="stack">
        <div className="card stack-sm">
          <div className="card-title">Sınavda böyle sorulur</div>
          <div className="small">
            Bu ünitenin konusu, gerçek N5 sınavının soru biçiminde: tamamen Japonca, dört şıklı, altı çizili kelimeler,
            ★ ile cümle kurma ve dinleme. Ünite testi konuyu <b>öğrendin mi</b> diye bakar; burası <b>sınavda
            tanıyabilecek misin</b> diye.
          </div>
          <ul className="tight small">
            {tipler.map((t) => (
              <li key={t}>
                <span className="ja">{t}</span>
              </li>
            ))}
          </ul>
          <div className="tiny faint">
            {okuma.length} okuma + {dinleme.length} dinleme sorusu. Aynı sorular deneme sınavının havuzunda da var.
          </div>
        </div>
        <button className="btn btn--primary btn--block btn--lg" onClick={basla} disabled={okuma.length + dinleme.length === 0}>
          Başla
        </button>
      </div>
    )
  }

  if (i >= liste.length) {
    return (
      <div className="stack">
        <div className="card card--pad-lg center stack">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {dogru} / {liste.length}
          </div>
          <div className="dim">N5 biçimindeki sorular</div>
        </div>
        {yanlislar.length > 0 && (
          <div className="stack-sm">
            <h2>Kaçırdıkların</h2>
            {yanlislar.map((m) => (
              <div key={m.q.id} className="card stack-sm">
                {m.tur === 'okuma' ? <MockPrompt text={m.q.prompt} /> : <ChoukaiMetin q={m.q} />}
                <div className="tiny">
                  <span className="faint">doğrusu: </span>
                  <b className="ja" style={{ color: 'var(--ok)' }}>
                    {m.q.options[m.q.answer]}
                  </b>
                </div>
                <div className="exam-explain">{m.q.explain}</div>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn--primary btn--block" onClick={basla}>
          Tekrar çöz
        </button>
      </div>
    )
  }

  const m = liste[i]
  const bilgi = m.tur === 'okuma' ? MONDAI[m.q.mondai] : CHOUKAI[m.q.mondai]
  const cevaplandi = secilen !== undefined

  const sec = (k: number) => {
    if (cevaplandi) return
    setSecilen(k)
    if (k === m.q.answer) setDogru((d) => d + 1)
    else setYanlislar((y) => [...y, m])
  }

  return (
    <div className="stack">
      <div className="row tiny faint">
        <span>
          {m.tur === 'dinleme' ? 'Dinleme · ' : ''}
          {bilgi.title} <span className="ja">{bilgi.jp}</span>
        </span>
        <div className="spacer" />
        <span className="tabular">
          {i + 1} / {liste.length}
        </span>
      </div>
      <div className="tiny dim">{bilgi.howto}</div>

      {m.tur === 'okuma' ? <MockPrompt text={m.q.prompt} /> : <ChoukaiPlayer key={m.q.id} q={m.q} />}
      <SecenekListesi q={m.q} secili={secilen} onSec={sec} acik={cevaplandi} />

      {cevaplandi && (
        <div className={`feedback ${secilen === m.q.answer ? 'feedback--ok' : 'feedback--bad'} stack-sm`}>
          <div>
            <b>{secilen === m.q.answer ? 'Doğru.' : 'Doğrusu:'}</b> <span className="ja">{m.q.options[m.q.answer]}</span>
          </div>
          {m.tur === 'okuma' && m.q.fullSentence && <div className="ja small">Tam cümle: {m.q.fullSentence}</div>}
          {m.tur === 'dinleme' && <ChoukaiMetin q={m.q} />}
          <div className="small">{m.q.explain}</div>
        </div>
      )}

      {cevaplandi && (
        <button
          className="btn btn--primary btn--block"
          onClick={() => {
            setI(i + 1)
            setSecilen(undefined)
          }}
        >
          {i + 1 >= liste.length ? 'Sonucu gör' : 'Sonraki'}
        </button>
      )}
    </div>
  )
}
