import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chips, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { TURLER, TUR_SAYISI, URET, type Soru, type Tur } from '@/content/ja/listening'
import { speak, stopSpeaking } from '@/lib/tts'
import { bumpStat, db, todayKey } from '@/db/db'

// Dinleme alıştırması.
//
// NEDEN AYRI BİR SAYFA: JLPT N5'te dinleme ayrı puanlanır ve kendi barajı var
// (60 üzerinden en az 19). Diğer bölümler ne kadar iyi olursa olsun dinleme
// barajı tutmazsa sınav kaybedilir. Uygulamada okuyarak öğrenilen her şey
// kulakla ayrıca tanınmalı — ve bu beceri kendiliğinden gelmiyor.
//
// NE SORULUYOR: N5 dinlemesinin en sık istediği bilgiler fiyat, saat ve
// tarih ("kaç para", "saat kaçta buluşuyorlar", "hangi gün"). Üçü de sayı
// ama her birinin ses değişimli istisnaları var (さんびゃく, よじ, はつか) ve
// asıl zorluk o istisnayı HIZLA duymak. Okunuşlar Temel bilgiler sayfasının
// kurallarından üretiliyor; tablo ne diyorsa kulak da onu duyuyor.
//
// Dördüncü tür ünite metinlerinden cümle: duyduğunu anlamak, harf harf
// çözmekten farklı bir beceri. Şıklar Türkçe, çünkü ölçülen şey anlam.

// ————————————————————————— Sayfa —————————————————————————

export default function ListeningPage() {
  const [tur, setTur] = useState<Tur>('fiyat')
  const [sorular, setSorular] = useState<Soru[] | null>(null)
  const [i, setI] = useState(0)
  const [yazilan, setYazilan] = useState('')
  const [secilen, setSecilen] = useState<number | null>(null)
  const [dogruMu, setDogruMu] = useState<boolean | null>(null)
  const [skor, setSkor] = useState(0)
  const [yanlislar, setYanlislar] = useState<Soru[]>([])

  const q = sorular?.[i]
  const bitti = sorular !== null && i >= sorular.length

  const cal = (yavas = false) => {
    if (!q) return
    void speak(q.ses, 'ja', { reading: q.okunus, rate: yavas ? 0.7 : undefined })
  }

  // Soru değişince kendiliğinden çalsın — dinleme alıştırmasında ilk iş duymak
  useEffect(() => {
    if (q) cal()
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const basla = (t: Tur = tur) => {
    setTur(t)
    setSorular(Array.from({ length: TUR_SAYISI }, () => URET[t]()))
    setI(0)
    setSkor(0)
    setYanlislar([])
    sifirla()
  }

  const sifirla = () => {
    setYazilan('')
    setSecilen(null)
    setDogruMu(null)
  }

  const degerlendir = (ok: boolean) => {
    setDogruMu(ok)
    if (ok) setSkor((s) => s + 1)
    else if (q) setYanlislar((y) => [...y, q])
    void bumpStat({ reviews: 1, correct: ok ? 1 : 0, ja: 1 })
  }

  const kontrol = () => {
    if (!q?.kontrol || dogruMu !== null || !yazilan.trim()) return
    degerlendir(q.kontrol(yazilan))
  }

  const sec = (k: number) => {
    if (!q || dogruMu !== null) return
    setSecilen(k)
    degerlendir(k === q.dogruSik)
  }

  const sonraki = async () => {
    const son = sorular && i + 1 >= sorular.length
    setI((x) => x + 1)
    sifirla()
    // Bir tur bitince Bugün listesindeki "Dinleme" görevi kendiliğinden işaretlenir
    if (son) {
      const gun = todayKey()
      await db.daily.put({ id: `${gun}:dinleme`, day: gun, taskId: 'dinleme', at: Date.now() })
    }
  }

  const tanim = useMemo(() => TURLER.find((t) => t.id === tur)!, [tur])

  // ————— Başlangıç —————
  if (!sorular) {
    return (
      <>
        <TopBar title="Dinleme" sub="Fiyat, saat, tarih ve cümle" back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg stack-sm">
            <div className="card-title">Neden her gün 10 dakika</div>
            <div className="small">
              JLPT N5’te dinleme <b>ayrı puanlanır</b> ve kendi barajı var: 60 üzerinden en az 19. Diğer bölümler
              ne kadar iyi olursa olsun bu baraj tutmazsa sınav kaybedilir. Okuyarak bildiğin kelimeyi kulakla
              tanımak ayrı bir beceri — ancak dinleyerek gelişiyor.
            </div>
            <div className="tiny faint">
              Soru kendiliğinden çalar. Tekrar dinleyebilir, yavaşlatabilirsin. Önce yavaşlatmadan dene.
            </div>
          </div>

          <Chips items={TURLER.map((t) => ({ id: t.id, label: t.label }))} value={tur} onChange={setTur} />
          <div className="card-sub" style={{ marginTop: -6 }}>
            {tanim.not}
          </div>

          <button className="btn btn--primary btn--block btn--lg" onClick={() => basla()}>
            <Icon name="headphones" size={18} />
            {TUR_SAYISI} soru başlat
          </button>

          <Link to="/temel?b=sayilar" className="tiny dim" style={{ textDecoration: 'underline' }}>
            Sayı, saat ve tarih kurallarını Temel bilgiler’de gör
          </Link>
        </div>
      </>
    )
  }

  // ————— Sonuç —————
  if (bitti) {
    const yuzde = Math.round((skor / sorular.length) * 100)
    return (
      <>
        <TopBar title="Dinleme" sub={tanim.label} back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
              {skor} / {sorular.length}
            </div>
            <div className="dim">%{yuzde}</div>
            <div className={`feedback small ${yuzde >= 70 ? 'feedback--ok' : 'feedback--bad'}`}>
              {yuzde >= 70
                ? 'Kulağın bunu tanıyor. Yarın başka bir tür dene.'
                : 'Kaçırdıklarını aşağıda dinle; sonra aynı türü bir kez daha çöz.'}
            </div>
          </div>

          {yanlislar.length > 0 && (
            <div className="stack-sm">
              <h2>Kaçırdıkların</h2>
              {yanlislar.map((y, k) => (
                <div key={k} className="card row" style={{ gap: 10 }}>
                  <button
                    className="iconbtn"
                    onClick={() => void speak(y.ses, 'ja', { reading: y.okunus })}
                    aria-label="Dinle"
                  >
                    <Icon name="speaker" size={16} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="small">
                      <b>{y.dogru}</b>
                    </div>
                    <div className="ja tiny faint">{y.kana}</div>
                    <div className="tiny tb-latin-line">{y.latin}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--primary btn--block" onClick={() => basla(tur)}>
              Aynı türden 10 soru daha
            </button>
            <button className="btn btn--block" onClick={() => setSorular(null)}>
              Tür seç
            </button>
          </div>
        </div>
      </>
    )
  }

  // ————— Soru —————
  return (
    <>
      <TopBar title="Dinleme" sub={`${tanim.label} · ${i + 1} / ${sorular.length}`} back="/calis" />
      <div className="page stack-lg lang-ja">
        <div className="card card--pad-lg center stack">
          <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
            <button className="btn btn--primary btn--lg" onClick={() => cal()}>
              <Icon name="speaker" size={18} />
              Dinle
            </button>
            <button className="btn btn--lg" onClick={() => cal(true)}>
              Yavaş
            </button>
          </div>
          <div className="tiny faint">{tanim.not}</div>
        </div>

        {q!.secenekler ? (
          <div className="stack-sm">
            {q!.secenekler.map((s, k) => {
              const durum =
                dogruMu === null
                  ? ''
                  : k === q!.dogruSik
                    ? ' is-correct'
                    : k === secilen
                      ? ' is-wrong'
                      : ' is-muted'
              return (
                <button key={k} className={`option${durum}`} onClick={() => sec(k)} disabled={dogruMu !== null}>
                  {s}
                </button>
              )
            })}
          </div>
        ) : (
          <input
            className={`field${dogruMu === null ? '' : dogruMu ? ' is-correct' : ' is-wrong'}`}
            value={yazilan}
            onChange={(e) => setYazilan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              if (dogruMu === null) kontrol()
              else void sonraki()
            }}
            placeholder={tur === 'fiyat' ? 'ör. 3800' : tur === 'saat' ? 'ör. 7:30' : 'ör. 4/10'}
            inputMode={tur === 'fiyat' ? 'numeric' : 'text'}
            disabled={dogruMu !== null}
            autoFocus
            autoComplete="off"
          />
        )}

        {dogruMu !== null && (
          <div className={`feedback ${dogruMu ? 'feedback--ok' : 'feedback--bad'} stack-sm`}>
            <div>
              <b>{dogruMu ? 'Doğru.' : 'Doğrusu:'}</b> {q!.dogru}
            </div>
            <div className="ja small">{q!.kana}</div>
            <div className="small tb-latin-line">{q!.latin}</div>
            {q!.not && <div className="tiny">{q!.not}</div>}
          </div>
        )}

        {dogruMu === null ? (
          !q!.secenekler && (
            <button className="btn btn--primary btn--block" onClick={kontrol} disabled={!yazilan.trim()}>
              Kontrol et
            </button>
          )
        ) : (
          <button className="btn btn--primary btn--block" onClick={() => void sonraki()} autoFocus>
            {i + 1 >= sorular.length ? 'Sonucu gör' : 'Sonraki'}
          </button>
        )}
      </div>
    </>
  )
}
