import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import {
  MONDAI,
  PASSAGES,
  SECTIONS,
  buildMock,
  scoreMock,
  type MockQ,
  type MockSectionPlan,
  type SectionId,
} from '@/content/ja/n5-mock'
import { daysUntilExam } from '@/content/ja/study-plan'
import { bumpStat, db } from '@/db/db'
import { useExams } from '@/db/hooks'

// JLPT N5 deneme sınavı.
//
// GERÇEK SINAV KOŞULLARI taklit ediliyor, çünkü N5'te asıl zorluk soruların
// zorluğu değil SÜRE: 40 dakikada 24 soru + iki metin okumak, hazırlıksız
// gelene yetmiyor. Bu yüzden:
//   • Her bölümün kendi sayacı var ve süre bitince bölüm kapanıyor.
//   • Soru arasında geri dönülebiliyor (gerçek sınavda da kâğıt önünde durur).
//   • Cevaplar sınav bitene kadar gösterilmiyor.
//   • Bölümler arasında geri dönüş YOK — gerçek sınavda da yok.

type Faz = 'kurulum' | 'bolum' | 'ara' | 'sonuc'

export default function N5MockPage() {
  // Yalnızca N5 denemeleri — tablo üç sınav türünü birden tutuyor
  const gecmis = useExams().filter((e) => e.kind === 'n5-deneme')

  const [faz, setFaz] = useState<Faz>('kurulum')
  const [plan, setPlan] = useState<MockSectionPlan[]>([])
  const [bolumIdx, setBolumIdx] = useState(0)
  const [soruIdx, setSoruIdx] = useState(0)
  const [cevaplar, setCevaplar] = useState<Map<string, number>>(new Map())
  const [kalanSn, setKalanSn] = useState(0)
  const [sureli, setSureli] = useState(true)
  const timer = useRef<number | null>(null)

  const bolum = plan[bolumIdx]

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
    const p = buildMock()
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
      const hepsi = plan.flatMap((b) => b.questions)
      const r = scoreMock(cevaplar, hepsi)
      bumpStat({ reviews: hepsi.length, correct: r.correct, ja: 1 })
      void kaydet(r, hepsi)
      setFaz('sonuc')
      return
    }
    setBolumIdx(yeni)
    setSoruIdx(0)
    setKalanSn(plan[yeni].minutes * 60)
    setFaz('bolum')
  }

  /**
   * Denemeyi kalıcı kaydeder.
   *
   * NEDEN: sonuç ekranı kapanınca deneme uçup gidiyordu; iki deneme arasındaki
   * farkı görmenin yolu yoktu. Asıl değeri olan şey tek bir puan değil, aynı
   * sınavı aylar arayla verip mondai bazında NEYİN düzeldiğini görmek.
   *
   * Kayıt başarısız olsa bile sonuç ekranı açılmalı — o yüzden sessizce geçiyor
   * ve `void` ile beklenmiyor.
   */
  const kaydet = async (r: ReturnType<typeof scoreMock>, hepsi: MockQ[]) => {
    try {
      await db.exams.put({
        at: Date.now(),
        kind: 'n5-deneme',
        // Ölçekli puanı DEĞİL yüzdeyi saklıyoruz: 120'lik ölçek yalnızca bu
        // sınava özgü, oysa `exams` tablosu üç sınav türünü birden tutuyor.
        percent: (r.correct / Math.max(1, r.total)) * 100,
        correct: r.correct,
        total: r.total,
        sections: Object.fromEntries(
          r.byMondai.map((m) => [m.mondai, (m.correct / Math.max(1, m.total)) * 100]),
        ),
        // Yanlış çıkan soruların mondai'leri — zayıf soru tipi buradan çıkar
        weakChars: hepsi.filter((q) => cevaplar.get(q.id) !== q.answer).map((q) => q.mondai),
        full: true,
        withWriting: false,
      })
    } catch {
      // Sessiz geç — sonucu göstermek kaydetmekten önemli
    }
  }

  const isaretle = (q: MockQ, i: number) => {
    const yeni = new Map(cevaplar)
    if (yeni.get(q.id) === i) yeni.delete(q.id)
    else yeni.set(q.id, i)
    setCevaplar(yeni)
  }

  // ————————————————————————— Kurulum —————————————————————————

  if (faz === 'kurulum') {
    const toplam = buildMock().reduce((a, b) => a + b.questions.length, 0)
    return (
      <>
        <TopBar title="N5 deneme sınavı" sub={`${daysUntilExam()} gün kaldı`} back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">Gerçek sınav nasıl işliyor?</div>
            <div className="card-sub" style={{ lineHeight: 1.65 }}>
              N5 üç bölümden oluşur ve toplam 90 dakikadır. Puan 180 üzerindendir; geçmek için{' '}
              <b>toplam 80</b> gerekir — ama tek başına yetmez: <b>dil bilgisi + okuma bölümünden en az 38</b>,{' '}
              <b>dinlemeden en az 19</b> almak zorundasın. Birinden kalırsan toplam yetse bile geçemezsin.
            </div>
            <div className="stack-sm" style={{ marginTop: 4 }}>
              {(Object.keys(SECTIONS) as SectionId[]).map((s, i) => (
                <div key={s} className="row">
                  <span className="plan-no tabular">{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tiny bold">
                      {SECTIONS[s].title} <span className="ja faint">{SECTIONS[s].jp}</span>
                    </div>
                    <div className="tiny faint">{SECTIONS[s].desc}</div>
                  </div>
                  <span className="tiny faint tabular">{SECTIONS[s].minutes} dk</span>
                </div>
              ))}
              <div className="row" style={{ opacity: 0.5 }}>
                <span className="plan-no tabular">3</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tiny bold">
                    Dinleme <span className="ja faint">聴解</span>
                  </div>
                  <div className="tiny faint">Bu denemede yok — aşağıda açıklandı</div>
                </div>
                <span className="tiny faint tabular">30 dk</span>
              </div>
            </div>
          </div>

          <div className="feedback feedback--info small">
            <b>Dinleme bölümü neden yok? </b>Bu cihazda Japonca konuşma sesi kurulu değil; uygulama Türkçe
            yaklaşık okumaya düşüyor. Yanlış telaffuzla dinleme sınavı yapmak seni ölçmez, yanlış öğretir. O
            yüzden uydurmadım. Bu deneme <b>120 puanlık bölümü</b> ölçüyor; dinlemeyi{' '}
            <Link to="/kaynaklar" className="link">
              video kaynaklarından
            </Link>{' '}
            ayrıca çalışman gerekiyor.
          </div>

          {/*
            Önceki denemeler burada, sınavın hemen başında duruyor. Sebebi:
            deneme sınavının değeri tek bir puanda değil, aynı sınavı aylar
            arayla verip farkı görmekte. Rota sayfasında da var ama insan
            sınava girerken oraya bakmıyor.
          */}
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
                  <span className="faint tabular">
                    {e.correct}/{e.total}
                  </span>
                  <span className="tabular" style={{ minWidth: 46, textAlign: 'right' }}>
                    {Math.round((e.percent / 100) * 120)} / 120
                  </span>
                </div>
              ))}
              {gecmis.length > 1 && (
                <div className="tiny faint">
                  İlkinde {Math.round((gecmis[gecmis.length - 1].percent / 100) * 120)}, sonuncuda{' '}
                  {Math.round((gecmis[0].percent / 100) * 120)} puan aldın.
                </div>
              )}
            </div>
          )}

          <div className="card stack-sm">
            <button className={`row card--link${sureli ? '' : ' is-off'}`} onClick={() => setSureli(!sureli)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
              <span className="entry-icon">
                <Icon name={sureli ? 'squareCheck' : 'square'} size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  Süreli çöz
                </div>
                <div className="card-sub">
                  {sureli
                    ? 'Her bölümün kendi sayacı işler, süre bitince bölüm kapanır. Gerçek koşul budur.'
                    : 'Kapalı: süre tutulmaz. İlk denemede öğrenmek için iyi, ama sınav provası olmaz.'}
                </div>
              </div>
            </button>
          </div>

          <button className="btn btn--lang btn--block btn--lg" onClick={basla}>
            Sınavı başlat · {toplam} soru
          </button>

          <div className="tiny faint center" style={{ lineHeight: 1.6 }}>
            Sorular gerçek sınav sorularının kopyası değildir — soru tipleri aynıdır, cümleler bu uygulamaya
            özgü yazılmıştır.
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Bölüm arası —————————————————————————

  if (faz === 'ara') {
    const cevaplanan = bolum.questions.filter((q) => cevaplar.has(q.id)).length
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
              {cevaplanan} / {bolum.questions.length} soru işaretlendi
            </div>
          </div>

          {cevaplanan < bolum.questions.length && (
            <div className="feedback feedback--warn small">
              {bolum.questions.length - cevaplanan} soruyu boş bıraktın. Gerçek sınavda boş bırakmak yerine
              tahmin etmek her zaman daha iyidir — yanlış cevabın ekstra cezası yok.
            </div>
          )}

          <button className="btn btn--primary btn--block btn--lg" onClick={sonrakiBolum}>
            {son ? 'Sınavı bitir ve sonucu gör' : `Sonraki bölüm: ${SECTIONS[plan[bolumIdx + 1].section].title}`}
          </button>
          {!son && (
            <div className="tiny faint center">
              Sonraki bölüm {plan[bolumIdx + 1].minutes} dakika. Bölüme geçtikten sonra geri dönemezsin —
              gerçek sınavda da dönemezsin.
            </div>
          )}
        </div>
      </>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (faz === 'sonuc') {
    const hepsi = plan.flatMap((b) => b.questions)
    const r = scoreMock(cevaplar, hepsi)
    const yanlislar = hepsi.filter((q) => cevaplar.get(q.id) !== q.answer)

    return (
      <>
        <TopBar title="Deneme sonucu" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <div className="mock-score tabular">{r.scaled}</div>
            <div className="dim">120 üzerinden · dil bilgisi ve okuma</div>
            <Bar value={(r.scaled / 120) * 100} />
            <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 4 }}>
              <span className={`badge ${r.sectionPass ? 'badge--ok' : 'badge--bad'}`}>
                Bölüm barajı 38 · {r.sectionPass ? 'geçti' : 'kaldı'}
              </span>
              <span className="tiny faint tabular">
                {r.correct}/{r.total} doğru
              </span>
            </div>
          </div>

          <div className={`card stack-sm feedback--${r.verdict.tone === 'ok' ? 'ok' : r.verdict.tone === 'warn' ? 'warn' : 'bad'}`}>
            <div className="card-title">{r.verdict.title}</div>
            <div className="card-sub" style={{ lineHeight: 1.6 }}>
              {r.verdict.text}
            </div>
          </div>

          <div className="feedback feedback--info tiny">
            <b>Puan yaklaşıktır. </b>Gerçek JLPT "ölçekli puan" kullanır: ham doğru sayısı doğrudan puana
            çevrilmez, soru zorluğuna göre istatistiksel bir dönüşüm uygulanır. Burada düz orantı var. Amaç
            kesin puan kestirmek değil, hazır olup olmadığını görmek.
          </div>

          <div className="stack-sm">
            <h2>Bölüm bölüm</h2>
            {r.byMondai.map((b) => {
              const p = (b.correct / b.total) * 100
              const m = MONDAI[b.mondai]
              return (
                <div key={b.mondai} className="card stack-sm">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: '0.94rem' }}>
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

          {yanlislar.length > 0 && (
            <div className="stack-sm">
              <h2>Yanlış ve boş cevaplar</h2>
              {yanlislar.map((q) => {
                const secilen = cevaplar.get(q.id)
                return (
                  <div key={q.id} className="card stack-sm">
                    <div className="tiny faint">
                      {MONDAI[q.mondai].no}. {MONDAI[q.mondai].title}
                    </div>
                    <div className="mock-prompt ja">{q.prompt}</div>
                    <div className="tiny">
                      <span className="faint">senin cevabın: </span>
                      <b className="ja" style={{ color: 'var(--bad)' }}>
                        {secilen === undefined ? '(boş)' : q.options[secilen]}
                      </b>
                      <span className="faint"> · doğrusu: </span>
                      <b className="ja" style={{ color: 'var(--ok)' }}>
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
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--primary btn--block" onClick={() => setFaz('kurulum')}>
              Yeni deneme
            </button>
            <Link to="/rota" className="btn btn--ghost btn--block">
              Rotaya dön
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Bölüm (sınav) —————————————————————————

  const q = bolum.questions[soruIdx]
  const metin = q.passageId ? PASSAGES.find((p) => p.id === q.passageId) : null
  const m = MONDAI[q.mondai]
  const dk = Math.floor(kalanSn / 60)
  const sn = kalanSn % 60
  const azKaldi = sureli && kalanSn <= 120

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
            {soruIdx + 1} / {bolum.questions.length}
          </span>
        </div>
        <div className="bar" style={{ marginTop: 8 }}>
          <i style={{ width: `${((soruIdx + 1) / bolum.questions.length) * 100}%` }} />
        </div>
        <div className="row tiny faint" style={{ marginTop: 6 }}>
          <span>
            {m.no}. {m.title}
          </span>
          <span className="ja">{m.jp}</span>
        </div>
      </div>

      <div className="quiz-body mock-body">
        <div className="tiny faint">{m.howto}</div>

        {metin && (
          <div className={`mock-passage${metin.kind === 'ilan' ? ' is-notice' : ''} ja`}>
            <div className="mock-passage-title">{metin.title}</div>
            <pre>{metin.body}</pre>
          </div>
        )}

        <div className="mock-prompt ja">{q.prompt}</div>

        <div className="stack-sm" style={{ width: '100%' }}>
          {q.options.map((o, i) => (
            <button
              key={i}
              className={`option${cevaplar.get(q.id) === i ? ' is-picked' : ''}`}
              onClick={() => isaretle(q, i)}
            >
              <span className="key">{i + 1}</span>
              <span className="ja" style={{ fontSize: '1.1rem' }}>
                {o}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-foot stack-sm">
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--ghost" onClick={() => setSoruIdx(Math.max(0, soruIdx - 1))} disabled={soruIdx === 0}>
            <Icon name="left" size={15} />
            Önceki
          </button>
          {soruIdx + 1 < bolum.questions.length ? (
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
          İşaretlemeden geçebilirsin, sonra dönersin. Cevaplar sınav bitene kadar gösterilmez.
        </div>
      </div>
    </div>
  )
}

function renk(p: number): string {
  if (p >= 80) return 'var(--ok)'
  if (p >= 55) return 'var(--warn)'
  return 'var(--bad)'
}
