import { useMemo, useState } from 'react'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { COUNTERS, type Counter, type CounterItem } from '@/content/ja/counters'
import { acceptsJa } from '@/lib/answer'
import { shuffle } from '@/lib/shuffle'
import { bumpStat } from '@/db/db'

// Sayaçlar — tablo ve alıştırma.
//
// NEDEN BİR ARADA: sayaçlarda öğrenilecek şey "hangi kelime" değil, "hangi
// birleşimde ses değişiyor". Tabloyu görmeden alıştırma yapmak kör deneme
// olur; sadece tabloya bakmak da hiçbir şey öğretmez. Aynı sayfada duruyorlar
// ve alıştırma tablodan besleniyor.
//
// DÜZENSİZ olanlar tabloda vurgulu. Asıl öğrenilecek liste o; geri kalanı
// sayı + sayaç birleşiminden zaten çıkıyor.

type Mod = 'tablo' | 'test'

interface Soru {
  c: Counter
  item: CounterItem
}

export default function CountersPage() {
  const [mod, setMod] = useState<Mod>('tablo')
  const [secili, setSecili] = useState(COUNTERS[0].id)
  const [yalnizDuzensiz, setYalnizDuzensiz] = useState(true)
  const [kapsam, setKapsam] = useState<'secili' | 'hepsi'>('secili')

  const [sorular, setSorular] = useState<Soru[] | null>(null)
  const [i, setI] = useState(0)
  const [yazilan, setYazilan] = useState('')
  const [dogruMu, setDogruMu] = useState<boolean | null>(null)
  const [skor, setSkor] = useState(0)
  const [yanlislar, setYanlislar] = useState<Soru[]>([])

  const counter = COUNTERS.find((c) => c.id === secili)!

  const havuz = useMemo(() => {
    const kaynak = kapsam === 'hepsi' ? COUNTERS : [counter]
    return kaynak.flatMap((c) =>
      c.items.filter((item) => (yalnizDuzensiz ? item.d : true)).map((item) => ({ c, item })),
    )
  }, [kapsam, counter, yalnizDuzensiz])

  const basla = () => {
    setSorular(shuffle(havuz))
    setI(0)
    setYazilan('')
    setDogruMu(null)
    setSkor(0)
    setYanlislar([])
    setMod('test')
  }

  const q = sorular?.[i]

  const kontrol = () => {
    if (!q || dogruMu !== null || !yazilan.trim()) return
    const ok = acceptsJa(yazilan, [q.item.r, q.item.ja])
    setDogruMu(ok)
    setSkor((s) => s + (ok ? 1 : 0))
    if (!ok) setYanlislar((y) => [...y, q])
    bumpStat({ reviews: 1, correct: ok ? 1 : 0, ja: 1 })
  }

  const ileri = () => {
    setYazilan('')
    setDogruMu(null)
    setI((n) => n + 1)
  }

  // ————————————————————————— Test —————————————————————————

  if (mod === 'test' && sorular) {
    if (!q) {
      const yuzde = sorular.length ? Math.round((skor / sorular.length) * 100) : 0
      return (
        <>
          <TopBar title="Sayaçlar" sub="Sonuç" back="/calis" />
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
                {yanlislar.map((y, n) => (
                  <div key={n} className="card row">
                    <span className="ja" style={{ fontSize: '1.5rem', minWidth: 92 }}>{y.item.ja}</span>
                    <div style={{ flex: 1 }}>
                      <div className="ja bold" style={{ fontSize: '1.2rem' }}>{y.item.r}</div>
                      <div className="tiny faint">{y.c.what}{y.item.note ? ` · ${y.item.note}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn--primary btn--block" onClick={basla}>Tekrar çöz</button>
            <button className="btn btn--block" onClick={() => setMod('tablo')}>Tabloya dön</button>
          </div>
        </>
      )
    }

    return (
      <>
        <TopBar title="Sayaçlar" sub={`${i + 1} / ${sorular.length}`} back="/calis" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack-sm">
            <div className="tiny faint">{q.c.what} — nasıl okunur?</div>
            <div className="ja ct-q">{q.item.ja}</div>
            <div className="tiny faint">{q.item.n} + {q.c.suffix}</div>
          </div>

          <input
            className={`field${dogruMu === null ? '' : dogruMu ? ' is-correct' : ' is-wrong'}`}
            value={yazilan}
            onChange={(e) => setYazilan(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && kontrol()}
            placeholder="kana ya da romaji"
            disabled={dogruMu !== null}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {dogruMu === null ? (
            <button className="btn btn--primary btn--block" disabled={!yazilan.trim()} onClick={kontrol}>
              Kontrol et
            </button>
          ) : (
            <>
              <div className={`feedback ${dogruMu ? 'feedback--ok' : 'feedback--bad'}`}>
                <div className="row">
                  <span className="ja" style={{ fontSize: '1.6rem' }}>{q.item.ja}</span>
                  <div style={{ flex: 1 }}>
                    <div className="ja bold" style={{ fontSize: '1.3rem' }}>{q.item.r}</div>
                    {q.item.note && <div className="tiny" style={{ opacity: 0.9 }}>{q.item.note}</div>}
                    {q.item.d && <div className="tiny" style={{ opacity: 0.9 }}>Düzensiz — kuraldan çıkmaz, ezberlenir.</div>}
                  </div>
                  <SpeakBtn text={q.item.ja} lang="ja" size="sm" reading={q.item.r} />
                </div>
              </div>
              <button className="btn btn--primary btn--block btn--lg" onClick={ileri} autoFocus>
                Devam <Icon name="right" size={16} />
              </button>
            </>
          )}
        </div>
      </>
    )
  }

  // ————————————————————————— Tablo —————————————————————————

  const duzensizSayisi = counter.items.filter((x) => x.d).length

  return (
    <>
      <TopBar title="Sayaçlar" sub="Kaç kişi, kaç tane, saat kaç" back="/calis" />

      <div className="page stack-lg lang-ja">
        <div className="card stack-sm">
          <div className="card-title">Sayaç nedir</div>
          <div className="card-sub">
            Türkçede “üç kişi, üç tane, üç gün” derken sayı hiç değişmez. Japoncada sayı, saydığın şeye göre
            <b> ses değiştirir</b>: 三人 さん<b>にん</b> ama 三分 さん<b>ぷん</b>, 三日 <b>みっか</b>.
          </div>
          <div className="tiny faint">
            <b>Düzensiz</b> işaretli olanlar kuraldan çıkarılamaz, kelime olarak ezberlenir. İşaretsizler
            sayı + sayaç birleşiminden zaten çıkar — onları ezberlemene gerek yok.
          </div>
        </div>

        <Chips items={COUNTERS.map((c) => ({ id: c.id, label: c.label }))} value={secili} onChange={setSecili} />

        <div className="card stack-sm">
          <div className="row">
            <div style={{ flex: 1 }}>
              <div className="card-title">{counter.label}</div>
              <div className="card-sub">{counter.what}</div>
            </div>
            <span className="badge">{duzensizSayisi} düzensiz</span>
          </div>
          <div className="feedback feedback--info tiny">{counter.rule}</div>

          <div className="ct-table">
            {counter.items.map((item) => (
              <div key={item.n} className={`ct-row${item.d ? ' is-irr' : ''}`}>
                <span className="ct-n">{item.n}</span>
                <span className="ja ct-ja">{item.ja}</span>
                <span className="ja ct-r">{item.r}</span>
                {item.d && <span className="ct-tag">düzensiz</span>}
                {item.note && <span className="ct-note">{item.note}</span>}
                <SpeakBtn text={item.ja} lang="ja" size="sm" reading={item.r} />
              </div>
            ))}
          </div>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Alıştırma</div>
          <div className="card-sub">Yazılışı görürsün, okunuşunu yazarsın. Kana ya da romaji kabul edilir.</div>

          <div className="row-wrap">
            <button
              className={`btn btn--sm${kapsam === 'secili' ? ' is-on' : ''}`}
              onClick={() => setKapsam('secili')}
            >
              Yalnızca {counter.label}
            </button>
            <button
              className={`btn btn--sm${kapsam === 'hepsi' ? ' is-on' : ''}`}
              onClick={() => setKapsam('hepsi')}
            >
              Bütün sayaçlar
            </button>
          </div>

          <div className="row-wrap">
            <button
              className={`btn btn--sm${yalnizDuzensiz ? ' is-on' : ''}`}
              onClick={() => setYalnizDuzensiz(true)}
            >
              Sadece düzensizler
            </button>
            <button
              className={`btn btn--sm${!yalnizDuzensiz ? ' is-on' : ''}`}
              onClick={() => setYalnizDuzensiz(false)}
            >
              Hepsi
            </button>
          </div>

          <div className="tiny faint">{havuz.length} soru</div>

          <button className="btn btn--primary btn--block btn--lg" disabled={!havuz.length} onClick={basla}>
            Başla
          </button>
        </div>
      </div>
    </>
  )
}
