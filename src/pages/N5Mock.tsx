import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ChoukaiMetin, ChoukaiPlayer, MockPrompt, SecenekListesi } from '@/components/N5Soru'
import {
  BANK,
  CHOUKAI,
  MONDAI,
  PASSAGES,
  SECTIONS,
  buildMock,
  scoreMock,
  type ChoukaiId,
  type ChoukaiQ,
  type MockHavuz,
  type MockQ,
  type MockSectionPlan,
  type MondaiId,
  type SectionId,
} from '@/content/ja/n5-mock'
import { UNITS } from '@/content/ja/units'
import { daysUntilExam } from '@/content/ja/study-plan'
import { hasVoice, onVoicesChanged } from '@/lib/tts'
import { bumpStat, db } from '@/db/db'
import { useExamDate, useExams } from '@/db/hooks'

// JLPT N5 deneme sınavı.
//
// GERÇEK SINAV KOŞULLARI taklit ediliyor, çünkü N5'te asıl zorluk soruların
// zorluğu değil SÜRE: 40 dakikada 24 soru + iki metin okumak, hazırlıksız
// gelene yetmiyor. Bu yüzden:
//   • Her bölümün kendi sayacı var ve süre bitince bölüm kapanıyor.
//   • Okuma bölümlerinde soru arasında geri dönülebiliyor (kâğıt önünde durur).
//   • Dinlemede ses bir kez çalar ve geri dönülmez — gerçek sınavda da öyle.
//   • Cevaplar sınav bitene kadar gösterilmiyor.
//   • Bölümler arasında geri dönüş YOK.
//
// Sorular her denemede havuzdan yeniden seçiliyor (ünitelerin N5 soruları
// dahil); aynı denemeyi ikinci kez çözmek ezber ölçüyordu.

type Faz = 'kurulum' | 'bolum' | 'ara' | 'sonuc'

/** Ünitelerin N5 soruları — deneme havuzunun ikinci yarısı */
const HAVUZ: MockHavuz = {
  okuma: UNITS.flatMap((u) => u.n5 ?? []),
  dinleme: UNITS.flatMap((u) => u.choukai ?? []),
}

/** Mondai ya da dinleme tipinin görünen bilgisi */
function tipBilgisi(m: MondaiId | ChoukaiId): { no: number; title: string; jp: string; howto: string; dinleme: boolean } {
  if (m in CHOUKAI) {
    const c = CHOUKAI[m as ChoukaiId]
    return { no: c.no, title: c.title, jp: c.jp, howto: c.howto, dinleme: true }
  }
  const x = MONDAI[m as MondaiId]
  return { no: x.no, title: x.title, jp: x.jp, howto: x.howto, dinleme: false }
}

export default function N5MockPage() {
  // Yalnızca N5 denemeleri — tablo üç sınav türünü birden tutuyor
  const gecmis = useExams().filter((e) => e.kind === 'n5-deneme')
  const examDate = useExamDate()
  // Ses listesi tarayıcıda geç yüklenir; ilk çizimde "ses yok" sanılıp
  // dinleme bölümü kapalı başlamasın diye liste gelince yeniden bakılıyor.
  const [sesVar, setSesVar] = useState(() => hasVoice('ja'))
  useEffect(
    () =>
      onVoicesChanged(() => {
        const v = hasVoice('ja')
        setSesVar(v)
        if (v) setDinlemeli(true)
      }),
    [],
  )

  const [faz, setFaz] = useState<Faz>('kurulum')
  const [plan, setPlan] = useState<MockSectionPlan[]>([])
  const [bolumIdx, setBolumIdx] = useState(0)
  const [soruIdx, setSoruIdx] = useState(0)
  const [cevaplar, setCevaplar] = useState<Map<string, number>>(new Map())
  const [kalanSn, setKalanSn] = useState(0)
  const [sureli, setSureli] = useState(true)
  const [dinlemeli, setDinlemeli] = useState(sesVar)
  const timer = useRef<number | null>(null)

  const bolum = plan[bolumIdx]

  // Kurulum ekranındaki soru sayısı için örnek bir plan
  const ornek = useMemo(() => buildMock(HAVUZ, dinlemeli), [dinlemeli])
  const toplamSoru = ornek.reduce((a, b) => a + b.questions.length + b.listening.length, 0)
  const toplamDk = ornek.reduce((a, b) => a + b.minutes, 0)

  // ————— Sayaç —————
  useEffect(() => {
    if (faz !== 'bolum' || !sureli) return
    timer.current = window.setInterval(() => {
      setKalanSn((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current!)
          bolumBitir()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faz, bolumIdx, sureli])

  const basla = () => {
    const p = buildMock(HAVUZ, dinlemeli)
    setPlan(p)
    setBolumIdx(0)
    setSoruIdx(0)
    setCevaplar(new Map())
    setKalanSn(p[0].minutes * 60)
    setFaz('bolum')
  }

  const bolumBitir = () => {
    if (timer.current) window.clearInterval(timer.current)
    setFaz('ara')
  }

  const sonrakiBolum = () => {
    const yeni = bolumIdx + 1
    if (yeni >= plan.length) {
      const okuma = plan.flatMap((b) => b.questions)
      const dinleme = plan.flatMap((b) => b.listening)
      const r = scoreMock(cevaplar, okuma, dinleme)
      bumpStat({ reviews: okuma.length + dinleme.length, correct: r.correct + (r.listening?.correct ?? 0), ja: 1 })
      void kaydet(r, okuma, dinleme)
      setFaz('sonuc')
      return
    }
    setBolumIdx(yeni)
    setSoruIdx(0)
    setKalanSn(plan[yeni].minutes * 60)
    setFaz('bolum')
  }

  /**
   * Denemeyi kalıcı kaydeder — aylar arayla aynı sınavı verip tip bazında
   * NEYİN düzeldiğini görmek için. Kayıt başarısız olsa bile sonuç ekranı
   * açılmalı; o yüzden sessizce geçiyor.
   */
  const kaydet = async (r: ReturnType<typeof scoreMock>, okuma: MockQ[], dinleme: ChoukaiQ[]) => {
    try {
      const yanlis = [...okuma, ...dinleme].filter((q) => cevaplar.get(q.id) !== q.answer).map((q) => q.mondai)
      await db.exams.put({
        at: Date.now(),
        kind: 'n5-deneme',
        // Yüzde: dinleme varsa 180'lik toplamdan, yoksa okuma bölümünden
        percent: r.totalScaled !== null ? (r.totalScaled / 180) * 100 : (r.correct / Math.max(1, r.total)) * 100,
        correct: r.correct + (r.listening?.correct ?? 0),
        total: r.total + (r.listening?.total ?? 0),
        sections: Object.fromEntries(r.byMondai.map((m) => [m.mondai, (m.correct / Math.max(1, m.total)) * 100])),
        weakChars: yanlis,
        full: r.listening !== null,
        withWriting: false,
      })
    } catch {
      // Sessiz geç — sonucu göstermek kaydetmekten önemli
    }
  }

  const isaretle = (id: string, i: number) => {
    const yeni = new Map(cevaplar)
    if (yeni.get(id) === i) yeni.delete(id)
    else yeni.set(id, i)
    setCevaplar(yeni)
  }

  // ————————————————————————— Kurulum —————————————————————————

  if (faz === 'kurulum') {
    return (
      <>
        <TopBar
          title="N5 deneme sınavı"
          sub={(() => {
            const k = daysUntilExam(examDate)
            return k === null ? 'Sınav tarihi belirlenmedi' : `${k} gün kaldı`
          })()}
          back="/calis"
        />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">Gerçek sınav nasıl işliyor?</div>
            <div className="card-sub" style={{ lineHeight: 1.65 }}>
              N5 üç bölümden oluşur ve toplam 90 dakikadır. Puan 180 üzerindendir; geçmek için{' '}
              <b>toplam 80</b> gerekir — ama tek başına yetmez: <b>dil bilgisi + okuma bölümünden en az 38</b>,{' '}
              <b>dinlemeden en az 19</b> almak zorundasın.
            </div>
            <div className="stack-sm" style={{ marginTop: 4 }}>
              {(Object.keys(SECTIONS) as SectionId[]).map((s, i) => {
                const kapali = s === 'choukai' && !dinlemeli
                return (
                  <div key={s} className="row" style={kapali ? { opacity: 0.45 } : undefined}>
                    <span className="plan-no tabular">{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tiny bold">
                        {SECTIONS[s].title} <span className="ja faint">{SECTIONS[s].jp}</span>
                      </div>
                      <div className="tiny faint">{kapali ? 'Bu denemede kapalı' : SECTIONS[s].desc}</div>
                    </div>
                    <span className="tiny faint tabular">{SECTIONS[s].minutes} dk</span>
                  </div>
                )
              })}
            </div>
          </div>

          {gecmis.length > 0 && (
            <div className="card stack-sm">
              <div className="row">
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  Önceki denemelerin
                </div>
                <div className="spacer" />
                <span className="tiny faint tabular">{gecmis.length} deneme</span>
              </div>
              {gecmis.slice(0, 5).map((e) => (
                <div key={e.at} className="row tiny">
                  <span className="faint">
                    {new Date(e.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </span>
                  <div className="spacer" />
                  <span className="faint">{e.full ? 'dinlemeli' : 'dinlemesiz'}</span>
                  <span className="faint tabular">
                    {e.correct}/{e.total}
                  </span>
                  <span className="tabular" style={{ minWidth: 46, textAlign: 'right' }}>
                    %{Math.round(e.percent)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="card stack-sm">
            <Secim
              acik={sureli}
              onDegis={() => setSureli(!sureli)}
              baslik="Süreli çöz"
              aciklama={
                sureli
                  ? 'Her bölümün kendi sayacı işler, süre bitince bölüm kapanır; dinlemede ses bir kez çalar. Gerçek koşul budur.'
                  : 'Kapalı: süre tutulmaz, dinleme tekrar çalınabilir. Öğrenmek için iyi, ama sınav provası olmaz.'
              }
            />
            <Secim
              acik={dinlemeli}
              onDegis={() => sesVar && setDinlemeli(!dinlemeli)}
              baslik="Dinleme bölümü"
              aciklama={
                !sesVar
                  ? 'Bu cihazda Japonca konuşma sesi bulunamadı; dinleme bölümü yapılamıyor. Puan 120 üzerinden verilir.'
                  : dinlemeli
                    ? '24 soru, 30 dakika. Kulaklık kullan.'
                    : 'Kapalı: yalnızca dil bilgisi ve okuma, puan 120 üzerinden.'
              }
            />
          </div>

          <button className="btn btn--lang btn--block btn--lg" onClick={basla}>
            Sınavı başlat · {toplamSoru} soru · {toplamDk} dk
          </button>

          <div className="tiny faint center" style={{ lineHeight: 1.6 }}>
            Sorular gerçek sınav sorularının kopyası değildir — soru tipleri ve sayıları aynıdır, cümleler bu
            uygulamaya özgüdür. Her deneme {HAVUZ.okuma.length + HAVUZ.dinleme.length + BANK.length} soruluk havuzdan yeniden
            kurulur.
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Bölüm arası —————————————————————————

  if (faz === 'ara') {
    const sorular: { id: string }[] = [...bolum.questions, ...bolum.listening]
    const cevaplanan = sorular.filter((q) => cevaplar.has(q.id)).length
    const son = bolumIdx + 1 >= plan.length
    return (
      <>
        <TopBar title="Bölüm bitti" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <span className="result-mark">
              <Icon name="check" size={26} />
            </span>
            <div className="card-title">{SECTIONS[bolum.section].title} tamamlandı</div>
            <div className="dim tabular">
              {cevaplanan} / {sorular.length} soru işaretlendi
            </div>
          </div>

          {cevaplanan < sorular.length && (
            <div className="feedback feedback--warn small">
              {sorular.length - cevaplanan} soruyu boş bıraktın. Gerçek sınavda boş bırakmak yerine tahmin etmek her
              zaman daha iyidir — yanlış cevabın ekstra cezası yok.
            </div>
          )}

          <button className="btn btn--primary btn--block btn--lg" onClick={sonrakiBolum}>
            {son ? 'Sınavı bitir ve sonucu gör' : `Sonraki bölüm: ${SECTIONS[plan[bolumIdx + 1].section].title}`}
          </button>
          {!son && (
            <div className="tiny faint center">
              Sonraki bölüm {plan[bolumIdx + 1].minutes} dakika. Bölüme geçtikten sonra geri dönemezsin — gerçek
              sınavda da dönemezsin.
            </div>
          )}
        </div>
      </>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (faz === 'sonuc') {
    const okuma = plan.flatMap((b) => b.questions)
    const dinleme = plan.flatMap((b) => b.listening)
    const r = scoreMock(cevaplar, okuma, dinleme)
    const yanlisOkuma = okuma.filter((q) => cevaplar.get(q.id) !== q.answer)
    const yanlisDinleme = dinleme.filter((q) => cevaplar.get(q.id) !== q.answer)

    return (
      <>
        <TopBar title="Deneme sonucu" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            {r.totalScaled !== null ? (
              <>
                <div className="mock-score tabular">{r.totalScaled}</div>
                <div className="dim">180 üzerinden · geçme puanı 80</div>
                <Bar value={(r.totalScaled / 180) * 100} />
              </>
            ) : (
              <>
                <div className="mock-score tabular">{r.scaled}</div>
                <div className="dim">120 üzerinden · dil bilgisi ve okuma</div>
                <Bar value={(r.scaled / 120) * 100} />
              </>
            )}
            <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span className={`badge ${r.sectionPass ? 'badge--ok' : 'badge--bad'}`}>
                Dil bilgisi · okuma {r.scaled}/120 · baraj 38 {r.sectionPass ? '✓' : '✗'}
              </span>
              {r.listening && (
                <span className={`badge ${r.listening.pass ? 'badge--ok' : 'badge--bad'}`}>
                  Dinleme {r.listening.scaled}/60 · baraj 19 {r.listening.pass ? '✓' : '✗'}
                </span>
              )}
              {r.totalScaled !== null && (
                <span className={`badge ${r.totalScaled >= 80 ? 'badge--ok' : 'badge--bad'}`}>
                  Toplam {r.totalScaled}/180 · 80 {r.totalScaled >= 80 ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          <div
            className={`card stack-sm feedback--${r.verdict.tone === 'ok' ? 'ok' : r.verdict.tone === 'warn' ? 'warn' : 'bad'}`}
          >
            <div className="card-title">{r.verdict.title}</div>
            <div className="card-sub" style={{ lineHeight: 1.6 }}>
              {r.verdict.text}
            </div>
          </div>

          <div className="feedback feedback--info tiny">
            <b>Puan yaklaşıktır. </b>Gerçek JLPT "ölçekli puan" kullanır: ham doğru sayısı doğrudan puana çevrilmez,
            soru zorluğuna göre istatistiksel bir dönüşüm uygulanır. Burada düz orantı var. Amaç kesin puan kestirmek
            değil, hazır olup olmadığını görmek.
          </div>

          <div className="stack-sm">
            <h2>Tip tip</h2>
            {r.byMondai.map((b) => {
              const p = (b.correct / b.total) * 100
              const m = tipBilgisi(b.mondai)
              return (
                <div key={b.mondai} className="card stack-sm">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: '0.94rem' }}>
                        {m.dinleme ? 'Dinleme ' : ''}
                        {m.no}. {m.title} <span className="ja faint tiny">{m.jp}</span>
                      </div>
                      <div className="card-sub">{m.howto}</div>
                    </div>
                    <span className="tabular bold" style={{ color: renk(p) }}>
                      %{Math.round(p)}
                    </span>
                    <span className="tiny faint tabular">
                      {b.correct}/{b.total}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${p}%`, background: renk(p) }} />
                  </div>
                </div>
              )
            })}
          </div>

          {yanlisOkuma.length + yanlisDinleme.length > 0 && (
            <div className="stack-sm">
              <h2>Yanlış ve boş cevaplar</h2>
              {yanlisOkuma.map((q) => {
                const secilen = cevaplar.get(q.id)
                return (
                  <div key={q.id} className="card stack-sm">
                    <div className="tiny faint">
                      {MONDAI[q.mondai].no}. {MONDAI[q.mondai].title}
                    </div>
                    <MockPrompt text={q.prompt} />
                    <div className="tiny">
                      <span className="faint">senin cevabın: </span>
                      <b className="ja n5-cevap" style={{ color: 'var(--bad)' }}>
                        {secilen === undefined ? '(boş)' : q.options[secilen]}
                      </b>
                      <span className="faint"> · doğrusu: </span>
                      <b className="ja n5-cevap" style={{ color: 'var(--ok)' }}>
                        {q.options[q.answer]}
                      </b>
                    </div>
                    {q.fullSentence && (
                      <div className="tiny ja" style={{ color: 'var(--dim)' }}>
                        Tam cümle: {q.fullSentence}
                      </div>
                    )}
                    <div className="exam-explain">{q.explain}</div>
                  </div>
                )
              })}
              {yanlisDinleme.map((q) => {
                const secilen = cevaplar.get(q.id)
                return (
                  <div key={q.id} className="card stack-sm">
                    <div className="tiny faint">
                      Dinleme {CHOUKAI[q.mondai].no}. {CHOUKAI[q.mondai].title}
                    </div>
                    {q.scene && <div className="n5-scene">{q.scene}</div>}
                    <ChoukaiMetin q={q} />
                    <div className="tiny">
                      <span className="faint">senin cevabın: </span>
                      <b className="ja n5-cevap" style={{ color: 'var(--bad)' }}>
                        {secilen === undefined ? '(boş)' : q.options[secilen]}
                      </b>
                      <span className="faint"> · doğrusu: </span>
                      <b className="ja n5-cevap" style={{ color: 'var(--ok)' }}>
                        {q.options[q.answer]}
                      </b>
                    </div>
                    <div className="exam-explain">{q.explain}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--primary btn--block" onClick={() => setFaz('kurulum')}>
              Yeni deneme
            </button>
            <Link to="/n5" className="btn btn--ghost btn--block">
              N5 sayfasına dön
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Bölüm (sınav) —————————————————————————

  const dinlemeBolumu = bolum.section === 'choukai'
  const toplam = dinlemeBolumu ? bolum.listening.length : bolum.questions.length
  const dk = Math.floor(kalanSn / 60)
  const sn = kalanSn % 60
  const azKaldi = sureli && kalanSn <= 120

  const okumaSorusu = dinlemeBolumu ? null : bolum.questions[soruIdx]
  const dinlemeSorusu = dinlemeBolumu ? bolum.listening[soruIdx] : null
  const bilgi = tipBilgisi((okumaSorusu ?? dinlemeSorusu)!.mondai)
  const metin = okumaSorusu?.passageId ? PASSAGES.find((p) => p.id === okumaSorusu.passageId) : null
  // Dinlemede süreli modda geri dönülmez — ses bir kez çalmıştı
  const geriSerbest = !(dinlemeBolumu && sureli)

  return (
    <div className="quiz lang-ja">
      <div className="quiz-top">
        <div className="row">
          <button className="btn btn--sm btn--ghost" onClick={() => setFaz('kurulum')}>
            <Icon name="close" size={15} />
            Bırak
          </button>
          <div className="spacer" />
          {sureli && (
            <span className={`mock-timer tabular${azKaldi ? ' is-low' : ''}`}>
              {dk}:{String(sn).padStart(2, '0')}
            </span>
          )}
          <span className="tiny dim tabular">
            {soruIdx + 1} / {toplam}
          </span>
        </div>
        <div className="bar" style={{ marginTop: 8 }}>
          <i style={{ width: `${((soruIdx + 1) / toplam) * 100}%` }} />
        </div>
        <div className="row tiny faint" style={{ marginTop: 6 }}>
          <span>
            {bilgi.dinleme ? 'Dinleme ' : ''}
            {bilgi.no}. {bilgi.title}
          </span>
          <span className="ja">{bilgi.jp}</span>
        </div>
      </div>

      <div className="quiz-body mock-body">
        <div className="tiny faint">{bilgi.howto}</div>

        {metin && (
          <div className={`mock-passage${metin.kind === 'ilan' ? ' is-notice' : ''} ja`}>
            <div className="mock-passage-title">{metin.title}</div>
            <pre>{metin.body}</pre>
          </div>
        )}

        {okumaSorusu && (
          <>
            <MockPrompt text={okumaSorusu.prompt} />
            <SecenekListesi
              q={okumaSorusu}
              secili={cevaplar.get(okumaSorusu.id)}
              onSec={(i) => isaretle(okumaSorusu.id, i)}
              acik={false}
            />
          </>
        )}

        {dinlemeSorusu && (
          <>
            <ChoukaiPlayer key={dinlemeSorusu.id} q={dinlemeSorusu} tekSefer={sureli} />
            <SecenekListesi
              q={dinlemeSorusu}
              secili={cevaplar.get(dinlemeSorusu.id)}
              onSec={(i) => isaretle(dinlemeSorusu.id, i)}
              acik={false}
            />
          </>
        )}
      </div>

      <div className="quiz-foot stack-sm">
        <div className="row" style={{ gap: 8 }}>
          {geriSerbest && (
            <button className="btn btn--ghost" onClick={() => setSoruIdx(Math.max(0, soruIdx - 1))} disabled={soruIdx === 0}>
              <Icon name="left" size={15} />
              Önceki
            </button>
          )}
          {soruIdx + 1 < toplam ? (
            <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => setSoruIdx(soruIdx + 1)}>
              Sonraki
              <Icon name="right" size={15} />
            </button>
          ) : (
            <button className="btn btn--primary" style={{ flex: 1 }} onClick={bolumBitir}>
              Bölümü bitir
            </button>
          )}
        </div>
        <div className="tiny faint center">
          {dinlemeBolumu
            ? sureli
              ? 'Ses bir kez çalar; cevabını işaretleyip geç. Geri dönülmez.'
              : 'Süresiz modda tekrar dinleyebilir, geri dönebilirsin.'
            : 'İşaretlemeden geçebilirsin, sonra dönersin. Cevaplar sınav bitene kadar gösterilmez.'}
        </div>
      </div>
    </div>
  )
}

function Secim({ acik, onDegis, baslik, aciklama }: { acik: boolean; onDegis: () => void; baslik: string; aciklama: string }) {
  return (
    <button
      className="row card--link"
      onClick={onDegis}
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
    >
      <span className="entry-icon">
        <Icon name={acik ? 'squareCheck' : 'square'} size={18} />
      </span>
      <div style={{ flex: 1 }}>
        <div className="card-title" style={{ fontSize: '0.95rem' }}>
          {baslik}
        </div>
        <div className="card-sub">{aciklama}</div>
      </div>
    </button>
  )
}

function renk(p: number): string {
  if (p >= 80) return 'var(--ok)'
  if (p >= 55) return 'var(--warn)'
  return 'var(--bad)'
}
