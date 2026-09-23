import { useEffect, useRef, useState } from 'react'
import { Bar, TopBar } from '@/components/ui'
import { bumpStat, db } from '@/db/db'
import { useExams } from '@/db/hooks'

// JLPT N5 resmî örnek sınavları (Official Practice Workbook, jlpt.jp).
//
// NEDEN AYRI SAYFA: uygulamadaki deneme bu uygulamanın yazdığı sorularla
// kuruluyor; buradaki iki set ise sınavı yapan kurumun GERÇEK sınavlardan
// seçtiği sorular. Sınava en yakın ölçü bu — o yüzden ikisi ayrı ve bu setler
// tek seferlik: üniteler bitince 2018, sınavdan bir hafta önce 2012.
//
// DOSYALAR YALNIZCA BU BİLGİSAYARDA: sorular telifli ve depo herkese açık.
// `npm run resmi:indir` dosyaları public/resmi/ altına indiriyor (klasör
// .gitignore'da). Sayfa dosyaların varlığını hazir.json'dan anlıyor; yoksa
// indirme komutunu gösteriyor. Sorular uygulamanın içine KOPYALANMIYOR —
// kitapçık PDF olarak açılıyor, uygulama yalnızca cevap kâğıdı ve sayaç.
//
// BİÇİM: setler 2020 öncesi sınav düzeninde (25 + 50 + 30 dakika; kelime
// bölümünde birkaç soru fazla). Bugünkü sınav 20 + 40 + 30 dakika. Puan her
// iki durumda da yüzdeden ölçekleniyor, karşılaştırma bozulmuyor.

type BolumId = 'moji' | 'bunpou' | 'choukai'

interface Mondai {
  mondai: number
  no: number[]
  cevap: number[]
}
type Anahtar = Record<BolumId, Mondai[]>

const SETLER = ['2018', '2012'] as const
type SetId = (typeof SETLER)[number]

const BOLUM: Record<BolumId, { title: string; jp: string; dk: number; pdf: { ad: string; etiket: string }[] }> = {
  moji: { title: 'Kelime bilgisi', jp: '言語知識（文字・語彙）', dk: 25, pdf: [{ ad: 'N5V.pdf', etiket: 'Kitapçık' }] },
  bunpou: {
    title: 'Dilbilgisi ve okuma',
    jp: '言語知識（文法）・読解',
    dk: 50,
    pdf: [
      { ad: 'N5G.pdf', etiket: 'Dilbilgisi' },
      { ad: 'N5R.pdf', etiket: 'Okuma' },
    ],
  },
  choukai: { title: 'Dinleme', jp: '聴解', dk: 30, pdf: [{ ad: 'N5L.pdf', etiket: 'Kitapçık' }] },
}
const SIRA: BolumId[] = ['moji', 'bunpou', 'choukai']
const MP3 = ['N5Q1.mp3', 'N5Q2.mp3', 'N5Q3.mp3', 'N5Q4.mp3']

/** Mondai adları — gerçek sınavdaki sırayla */
const MONDAI_ADI: Record<BolumId, string[]> = {
  moji: ['漢字読み · kanji okunuşu', '表記 · yazım', '文脈規定 · bağlama uygun kelime', '言い換え類義 · eş anlam'],
  bunpou: [
    '文法形式 · dilbilgisi biçimi',
    '文の組み立て · cümle kurma (★)',
    '文章の文法 · metin içi dilbilgisi',
    '内容理解（短文） · kısa metin',
    '内容理解（中文） · orta metin',
    '情報検索 · bilgi bulma',
  ],
  choukai: ['課題理解 · görevi anlama', 'ポイント理解 · ana nokta', '発話表現 · ne denir', '即時応答 · hızlı cevap'],
}

const dosya = (set: SetId, ad: string) => `resmi/${set}/${ad}`

/** Vite bilinmeyen yola index.html döndürür; JSON değilse dosya yok demektir */
async function jsonOku<T>(yol: string): Promise<T | null> {
  try {
    const r = await fetch(yol, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

type Faz = 'secim' | 'bolum' | 'sonuc'

export default function OfficialExamPage() {
  const gecmis = useExams().filter((e) => e.kind === 'n5-resmi')
  const [hazir, setHazir] = useState<boolean | null>(null)
  const [set, setSet] = useState<SetId>('2018')
  const [anahtar, setAnahtar] = useState<Anahtar | null>(null)
  const [faz, setFaz] = useState<Faz>('secim')
  const [bolumIdx, setBolumIdx] = useState(0)
  const [cevaplar, setCevaplar] = useState<Map<string, number>>(new Map())
  const [sureli, setSureli] = useState(true)
  const [kalanSn, setKalanSn] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    void jsonOku<{ setler: string[] }>('resmi/hazir.json').then((h) => setHazir(!!h?.setler?.length))
  }, [])

  useEffect(() => {
    setAnahtar(null)
    void jsonOku<Anahtar>(dosya(set, 'anahtar.json')).then(setAnahtar)
  }, [set])

  const bolum = SIRA[bolumIdx]

  // ————— Sayaç —————
  useEffect(() => {
    if (faz !== 'bolum' || !sureli) return
    timer.current = window.setInterval(() => {
      setKalanSn((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [faz, bolumIdx, sureli])

  const basla = () => {
    setCevaplar(new Map())
    setBolumIdx(0)
    setKalanSn(BOLUM.moji.dk * 60)
    setFaz('bolum')
    window.scrollTo(0, 0)
  }

  const bolumBitir = () => {
    if (bolumIdx + 1 < SIRA.length) {
      const yeni = bolumIdx + 1
      setBolumIdx(yeni)
      setKalanSn(BOLUM[SIRA[yeni]].dk * 60)
      window.scrollTo(0, 0)
      return
    }
    if (anahtar) void kaydet(puanla(anahtar, cevaplar))
    setFaz('sonuc')
    window.scrollTo(0, 0)
  }

  const kaydet = async (p: Puan) => {
    try {
      await db.exams.put({
        at: Date.now(),
        kind: 'n5-resmi',
        set,
        percent: (p.toplam / 180) * 100,
        correct: p.dogru,
        total: p.soru,
        sections: Object.fromEntries(p.mondai.map((m) => [m.anahtar, (m.dogru / m.soru) * 100])),
        weakChars: [],
        full: true,
        withWriting: false,
      })
      await bumpStat({ reviews: p.soru, correct: p.dogru, ja: 1 })
    } catch {
      /* sonuç ekranı kayıttan önemli */
    }
  }

  const isaretle = (key: string, i: number) => {
    setCevaplar((c) => {
      const yeni = new Map(c)
      if (yeni.get(key) === i) yeni.delete(key)
      else yeni.set(key, i)
      return yeni
    })
  }

  // ————————————————————————— Dosyalar yok —————————————————————————

  if (hazir === false) {
    return (
      <>
        <TopBar title="Resmî örnek sınav" sub="JLPT N5 · jlpt.jp" back="/n5" />
        <div className="page stack-lg">
          <div className="card card--pad-lg stack-sm">
            <div className="card-title">Sınav dosyaları bu bilgisayarda yok</div>
            <div className="small">
              Resmî setler telifli olduğu için GitHub’a konmuyor; her bilgisayara ayrıca indirilmesi gerekiyor. Proje
              klasöründe şu komutu çalıştır:
            </div>
            <pre className="ofx-kod">npm run resmi:indir</pre>
            <div className="tiny faint">
              jlpt.jp’den iki tam N5 seti (2012 ve 2018, ~52 MB) indirir, cevap anahtarını çıkarır. Sonra bu sayfayı
              yenile.
            </div>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Set seçimi —————————————————————————

  if (faz === 'secim') {
    const yapilan = (s: SetId) => gecmis.filter((e) => e.set === s)
    return (
      <>
        <TopBar title="Resmî örnek sınav" sub="JLPT N5 · jlpt.jp" back="/n5" />
        <div className="page stack-lg lang-ja">
          <div className="card card--accent stack-sm">
            <div className="card-title">Gerçek sınavdan seçilmiş sorular</div>
            <div className="small">
              Bu iki seti sınavı düzenleyen kurum (Japonya Vakfı ve JEES) yayımladı; sorular 2010’dan beri yapılmış{' '}
              <b>gerçek sınavlardan</b> seçildi. Sınava en yakın ölçü bu, ve yalnızca iki tane var:{' '}
              <b>2018’i üniteler bitince</b>, <b>2012’yi sınavdan bir hafta önce</b> çöz.
            </div>
            <div className="tiny faint">
              Setler 2020 öncesi düzende: 25 + 50 + 30 dakika, kelime bölümünde birkaç soru fazla. Bugünkü sınav 20 + 40
              + 30 dakika. Puan yüzdeden ölçeklendiği için sonuç karşılaştırılabilir.
            </div>
          </div>

          <div className="ofx-sets">
            {SETLER.map((s) => {
              const y = yapilan(s)
              return (
                <button key={s} className={`card ofx-set${set === s ? ' is-on' : ''}`} onClick={() => setSet(s)}>
                  <div className="ofx-set-yil tabular">{s}</div>
                  <div className="tiny faint">{s === '2018' ? 'Üniteler bitince' : 'Sınavdan bir hafta önce'}</div>
                  {y.length > 0 ? (
                    <div className="small">
                      Çözüldü · <b className="tabular">{Math.round((y[0].percent / 100) * 180)}</b>/180
                    </div>
                  ) : (
                    <div className="small dim">Henüz çözülmedi</div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="card stack-sm">
            <div className="card-title">Gerçek koşulda çöz</div>
            <ul className="tight small">
              <li>Kitapçığı sayfada ya da basılı aç; cevapları sağdaki cevap kâğıdına işaretle.</li>
              <li>Bölümler arasında geri dönme; dinlemede kaydı durdurma, geri sarma.</li>
              <li>Sözlük, not ve uygulamanın başka sayfası yok — sınavda da yok.</li>
              <li>Kulaklık kullan. Toplam yaklaşık 1 saat 45 dakika; tek oturumda bitir.</li>
            </ul>
            <label className="row small" style={{ gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={sureli} onChange={(e) => setSureli(e.target.checked)} />
              Süre tut (bölüm başına sayaç)
            </label>
          </div>

          <button className="btn btn--lang btn--block btn--lg" onClick={basla} disabled={hazir === null}>
            {set} setini başlat
          </button>
          {!anahtar && hazir && (
            <div className="tiny faint center">
              Cevap anahtarı bulunamadı; sonunda doğru sayılarını PDF’teki anahtara bakarak elle gireceksin.
            </div>
          )}

          {gecmis.length > 0 && <Gecmis kayitlar={gecmis} />}

          <div className="tiny faint center">
            Kaynak: jlpt.jp — Official Practice Workbook. Dosyalar yalnızca bu bilgisayarda; GitHub’a konmaz.
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (faz === 'sonuc') {
    return (
      <>
        <TopBar title={`Resmî sınav ${set} · sonuç`} back="/n5" />
        <div className="page stack-lg lang-ja">
          {anahtar ? (
            <Sonuc set={set} p={puanla(anahtar, cevaplar)} />
          ) : (
            <ElleSonuc set={set} onKaydet={(p) => void kaydet(p)} />
          )}
          <div className="stack-sm">
            <a className="btn btn--block" href={dosya(set, 'N5script.pdf')} target="_blank" rel="noreferrer">
              Dinleme metnini aç (N5script.pdf)
            </a>
            <button className="btn btn--ghost btn--block" onClick={() => setFaz('secim')}>
              Setlere dön
            </button>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Bölüm —————————————————————————

  const b = BOLUM[bolum]
  const dk = Math.floor(kalanSn / 60)
  const sn = kalanSn % 60
  const sureBitti = sureli && kalanSn === 0

  return (
    <>
      <TopBar
        title={`${bolumIdx + 1}. ${b.title}`}
        sub={`${set} · ${b.jp}`}
        right={
          sureli ? (
            <span className={`mock-timer tabular${kalanSn <= 120 ? ' is-low' : ''}`}>
              {dk}:{String(sn).padStart(2, '0')}
            </span>
          ) : undefined
        }
      />
      <div className="page lang-ja">
        {sureBitti && (
          <div className="feedback feedback--warn small" style={{ marginBottom: 12 }}>
            Süre doldu. Gerçek sınavda kalem bırakılır — işaretlemeyi bitir ve bölümü kapat.
          </div>
        )}
        <div className="ofx-layout">
          <div className="stack-sm">
            <Kitapcik set={set} bolum={bolum} />
            {bolum === 'choukai' && <Dinleme set={set} />}
          </div>
          <div className="stack-sm">
            <CevapKagidi
              bolum={bolum}
              anahtar={anahtar}
              cevaplar={cevaplar}
              onIsaretle={isaretle}
            />
            <button className="btn btn--primary btn--block" onClick={bolumBitir}>
              {bolumIdx + 1 < SIRA.length ? `Bölümü bitir → ${BOLUM[SIRA[bolumIdx + 1]].title}` : 'Sınavı bitir'}
            </button>
            <div className="tiny faint center">Bölümü kapatınca geri dönülmez — gerçek sınavda da dönülmez.</div>
          </div>
        </div>
      </div>
    </>
  )
}

// ————————————————————————— Kitapçık ve dinleme —————————————————————————

function Kitapcik({ set, bolum }: { set: SetId; bolum: BolumId }) {
  const pdfler = BOLUM[bolum].pdf
  const [i, setI] = useState(0)
  useEffect(() => setI(0), [bolum])
  const pdf = pdfler[Math.min(i, pdfler.length - 1)]
  return (
    <div className="card stack-sm ofx-pdf-card">
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {pdfler.length > 1 &&
          pdfler.map((p, k) => (
            <button key={p.ad} className={`chip${k === i ? ' active' : ''}`} onClick={() => setI(k)}>
              {p.etiket}
            </button>
          ))}
        <div className="spacer" />
        <a className="btn btn--sm btn--ghost" href={dosya(set, pdf.ad)} target="_blank" rel="noreferrer">
          Yeni sekmede aç · yazdır
        </a>
      </div>
      <iframe key={pdf.ad} className="ofx-pdf" src={dosya(set, pdf.ad)} title={`${set} ${pdf.etiket}`} />
    </div>
  )
}

/**
 * Dört dinleme kaydı art arda — sınavda da bölüm başından sonuna kesintisiz
 * çalar. Bir kayıt bitince sıradaki kendiliğinden başlar.
 */
function Dinleme({ set }: { set: SetId }) {
  const [parca, setParca] = useState(0)
  const ses = useRef<HTMLAudioElement>(null)
  const [basladi, setBasladi] = useState(false)

  useEffect(() => {
    if (basladi) void ses.current?.play()
  }, [parca, basladi])

  return (
    <div className="card stack-sm">
      <div className="row">
        <span className="card-title">Dinleme kaydı</span>
        <div className="spacer" />
        <span className="tiny faint tabular">
          問題 {parca + 1} / {MP3.length}
        </span>
      </div>
      <audio
        ref={ses}
        key={MP3[parca]}
        src={dosya(set, MP3[parca])}
        controls
        preload="auto"
        style={{ width: '100%' }}
        onPlay={() => setBasladi(true)}
        onEnded={() => {
          if (parca + 1 < MP3.length) setParca(parca + 1)
        }}
      />
      <div className="tiny faint">
        Oynatınca dört bölüm art arda çalar. Sınavda durdurma ve geri sarma yok; kaydın içindeki boşluklarda cevabı
        işaretle.
      </div>
    </div>
  )
}

// ————————————————————————— Cevap kâğıdı —————————————————————————

function CevapKagidi({
  bolum,
  anahtar,
  cevaplar,
  onIsaretle,
}: {
  bolum: BolumId
  anahtar: Anahtar | null
  cevaplar: Map<string, number>
  onIsaretle: (key: string, i: number) => void
}) {
  // Anahtar yoksa soru numaraları bilinmiyor; o zaman yalnızca bilgi verilir
  if (!anahtar) {
    return (
      <div className="card small">
        Cevaplarını basılı cevap kâğıdına (N5sheet.pdf) işaretle; sonunda doğru sayını gireceksin.
      </div>
    )
  }
  const isaretli = anahtar[bolum].reduce((n, m) => n + m.no.filter((no) => cevaplar.has(`${bolum}:${m.mondai}:${no}`)).length, 0)
  const toplam = anahtar[bolum].reduce((n, m) => n + m.no.length, 0)

  return (
    <div className="card stack-sm ofx-sheet">
      <div className="row">
        <span className="card-title">Cevap kâğıdı</span>
        <div className="spacer" />
        <span className="tiny faint tabular">
          {isaretli} / {toplam}
        </span>
      </div>
      {anahtar[bolum].map((m, mi) => (
        <div key={m.mondai} className="ofx-mondai">
          <div className="ofx-mondai-bas">
            <span className="ja">もんだい {m.mondai}</span>
            <span className="tiny faint">{MONDAI_ADI[bolum][mi] ?? ''}</span>
          </div>
          {m.no.map((no) => {
            const key = `${bolum}:${m.mondai}:${no}`
            const secili = cevaplar.get(key)
            return (
              <div key={no} className="ofx-satir">
                <span className="ofx-no tabular">{no}</span>
                {[1, 2, 3, 4].map((c) => (
                  <button
                    key={c}
                    className={`ofx-kabarcik${secili === c ? ' is-on' : ''}`}
                    onClick={() => onIsaretle(key, c)}
                    aria-label={`${no}. soru, ${c}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ————————————————————————— Puanlama —————————————————————————

interface Puan {
  dogru: number
  soru: number
  bolum1: { dogru: number; soru: number; puan: number }
  dinleme: { dogru: number; soru: number; puan: number }
  toplam: number
  mondai: { anahtar: string; bolum: BolumId; ad: string; dogru: number; soru: number }[]
  yanlis: { bolum: BolumId; mondai: number; no: number; senin?: number; dogru: number }[]
}

function puanla(a: Anahtar, cevaplar: Map<string, number>): Puan {
  const mondai: Puan['mondai'] = []
  const yanlis: Puan['yanlis'] = []
  const say: Record<BolumId, { d: number; s: number }> = { moji: { d: 0, s: 0 }, bunpou: { d: 0, s: 0 }, choukai: { d: 0, s: 0 } }
  for (const b of SIRA) {
    a[b].forEach((m, mi) => {
      let d = 0
      m.no.forEach((no, k) => {
        const senin = cevaplar.get(`${b}:${m.mondai}:${no}`)
        if (senin === m.cevap[k]) d++
        else yanlis.push({ bolum: b, mondai: m.mondai, no, senin, dogru: m.cevap[k] })
      })
      say[b].d += d
      say[b].s += m.no.length
      mondai.push({ anahtar: `${b}-${m.mondai}`, bolum: b, ad: MONDAI_ADI[b][mi] ?? `問題${m.mondai}`, dogru: d, soru: m.no.length })
    })
  }
  return puanHesapla(say.moji.d + say.bunpou.d, say.moji.s + say.bunpou.s, say.choukai.d, say.choukai.s, mondai, yanlis)
}

function puanHesapla(d1: number, s1: number, d2: number, s2: number, mondai: Puan['mondai'] = [], yanlis: Puan['yanlis'] = []): Puan {
  const p1 = Math.round((d1 / Math.max(1, s1)) * 120)
  const p2 = Math.round((d2 / Math.max(1, s2)) * 60)
  return {
    dogru: d1 + d2,
    soru: s1 + s2,
    bolum1: { dogru: d1, soru: s1, puan: p1 },
    dinleme: { dogru: d2, soru: s2, puan: p2 },
    toplam: p1 + p2,
    mondai,
    yanlis,
  }
}

function Sonuc({ set, p }: { set: SetId; p: Puan }) {
  const gecti = p.toplam >= 80 && p.bolum1.puan >= 38 && p.dinleme.puan >= 19
  return (
    <>
      <div className="card card--pad-lg center stack">
        <div className="mock-score tabular">{p.toplam}</div>
        <div className="dim">180 üzerinden · resmî set {set}</div>
        <Bar value={(p.toplam / 180) * 100} />
        <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className={`badge ${p.bolum1.puan >= 38 ? 'badge--ok' : 'badge--bad'}`}>
            Dil bilgisi · okuma {p.bolum1.puan}/120 · baraj 38
          </span>
          <span className={`badge ${p.dinleme.puan >= 19 ? 'badge--ok' : 'badge--bad'}`}>
            Dinleme {p.dinleme.puan}/60 · baraj 19
          </span>
          <span className={`badge ${p.toplam >= 80 ? 'badge--ok' : 'badge--bad'}`}>Toplam 80</span>
        </div>
      </div>

      <div className={`card stack-sm feedback--${gecti ? 'ok' : 'bad'}`}>
        <div className="card-title">{gecti ? 'Bu sonuçla geçerdin' : 'Bu sonuçla geçemezdin'}</div>
        <div className="card-sub">
          {gecti
            ? p.toplam >= 110
              ? 'Üç baraj da rahat. Kalan günlerde tekrar temposunu koru.'
              : 'Üç baraj tutuyor ama pay az. Aşağıdaki en zayıf tiplere son günleri ayır.'
            : p.bolum1.puan < 38
              ? 'Dil bilgisi ve okuma bölümü kendi barajının altında. Önce aşağıdaki en düşük tiplere dön.'
              : p.dinleme.puan < 19
                ? 'Dinleme kendi barajının altında. Her gün dinleme alıştırması ve bu setin kayıtlarını metinle birlikte dinle.'
                : 'Barajlar tutuyor ama toplam 80’e ulaşmıyor. En zayıf tiplere odaklan.'}
        </div>
      </div>

      {p.mondai.length > 0 && (
        <div className="stack-sm">
          <h2>Soru tipine göre</h2>
          {p.mondai.map((m) => {
            const y = (m.dogru / m.soru) * 100
            return (
              <div key={m.anahtar} className="card stack-sm">
                <div className="row">
                  <span className="small" style={{ flex: 1 }}>
                    <span className="faint">{BOLUM[m.bolum].title} · </span>
                    <span className="ja">{m.ad}</span>
                  </span>
                  <span className="tabular bold">
                    {m.dogru}/{m.soru}
                  </span>
                </div>
                <Bar value={y} />
              </div>
            )
          })}
        </div>
      )}

      {p.yanlis.length > 0 && (
        <div className="card stack-sm">
          <div className="card-title">Yanlış ve boşlar</div>
          <div className="tiny faint">Kitapçıkta bu numaralara dönüp doğru cevabın neden doğru olduğunu bul.</div>
          {SIRA.map((b) => {
            const liste = p.yanlis.filter((y) => y.bolum === b)
            if (!liste.length) return null
            return (
              <div key={b} className="stack-sm">
                <div className="tiny bold">{BOLUM[b].title}</div>
                <div className="ofx-yanlis">
                  {liste.map((y) => (
                    <span key={`${y.mondai}-${y.no}`} className="ofx-yanlis-bir">
                      <span className="ja">問{y.mondai}</span> · {y.no}: <s>{y.senin ?? '–'}</s> → <b>{y.dogru}</b>
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/** Anahtar yoksa: doğru sayıları PDF'teki anahtara bakılarak elle girilir */
function ElleSonuc({ set, onKaydet }: { set: SetId; onKaydet: (p: Puan) => void }) {
  const [d, setD] = useState({ d1: '', s1: set === '2018' ? '67' : '65', d2: '', s2: '24' })
  const [p, setP] = useState<Puan | null>(null)
  const n = (x: string) => Math.max(0, Number(x) || 0)
  if (p) return <Sonuc set={set} p={p} />
  return (
    <div className="card stack-sm">
      <div className="card-title">Doğru sayılarını gir</div>
      <div className="small">
        Cevap anahtarı: <a href={dosya(set, 'N5answer.pdf')} target="_blank" rel="noreferrer">N5answer.pdf</a>
      </div>
      <label className="small">
        Kelime + dilbilgisi + okuma: doğru{' '}
        <input className="field ofx-sayi" value={d.d1} onChange={(e) => setD({ ...d, d1: e.target.value })} inputMode="numeric" /> /{' '}
        <input className="field ofx-sayi" value={d.s1} onChange={(e) => setD({ ...d, s1: e.target.value })} inputMode="numeric" />
      </label>
      <label className="small">
        Dinleme: doğru{' '}
        <input className="field ofx-sayi" value={d.d2} onChange={(e) => setD({ ...d, d2: e.target.value })} inputMode="numeric" /> /{' '}
        <input className="field ofx-sayi" value={d.s2} onChange={(e) => setD({ ...d, s2: e.target.value })} inputMode="numeric" />
      </label>
      <button
        className="btn btn--primary"
        onClick={() => {
          const sonuc = puanHesapla(n(d.d1), n(d.s1), n(d.d2), n(d.s2))
          setP(sonuc)
          onKaydet(sonuc)
        }}
      >
        Puanla
      </button>
    </div>
  )
}

function Gecmis({ kayitlar }: { kayitlar: { at: number; set?: string; percent: number; correct: number; total: number }[] }) {
  return (
    <div className="card stack-sm">
      <div className="card-title" style={{ fontSize: '0.95rem' }}>
        Önceki resmî sınavların
      </div>
      {kayitlar.map((e) => (
        <div key={e.at} className="row tiny">
          <span className="faint">{new Date(e.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
          <span>set {e.set}</span>
          <div className="spacer" />
          <span className="faint tabular">
            {e.correct}/{e.total}
          </span>
          <span className="tabular bold">{Math.round((e.percent / 100) * 180)}/180</span>
        </div>
      ))}
    </div>
  )
}

