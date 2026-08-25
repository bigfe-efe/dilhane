import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { RULE_TEST_POOL, type RuleTestItem } from '@/content/ja/kana-rules'
import { readingOk } from '@/content/ja/exam'
import { shuffle } from '@/lib/shuffle'
import { bumpStat } from '@/db/db'

// Kural okuma testi.
//
// Kuralları okumak yetmiyor; kural ancak kelime sökerken oturuyor. Bu test
// şıksızdır — kelimeyi görür, okunuşunu YAZARSIN. Şık verilseydi doğru cevabı
// tanıyıp seçerdin; burada kendin üretmen gerekiyor.
//
// Sorular kuralların örneklerinden geliyor ve karşılaştırma çiftleri de havuzda:
// きって ile きて'nin ikisi de sorulabiliyor. Tek yönlü ezberi böyle engelliyoruz.
//
// Geri bildirim sona bırakılıyor (uygulamanın geri kalanıyla aynı kural) ve
// sonuçta KURAL BAZLI döküm veriliyor: "uzun ünlüde 2/5" demek, "%60 aldın"
// demekten daha işe yarar çünkü ne çalışacağını söyler.

const UZUNLUKLAR = [
  { id: '10', label: '10 kelime' },
  { id: '20', label: '20 kelime' },
  { id: 'hepsi', label: `Hepsi (${RULE_TEST_POOL.length})` },
]

interface Cevap {
  item: RuleTestItem
  yazilan: string
  dogru: boolean
}

export default function KanaRuleTestPage() {
  const [uzunluk, setUzunluk] = useState('10')
  const [faz, setFaz] = useState<'kurulum' | 'test' | 'sonuc'>('kurulum')
  const [sorular, setSorular] = useState<RuleTestItem[]>([])
  const [idx, setIdx] = useState(0)
  const [cevaplar, setCevaplar] = useState<Cevap[]>([])
  const [girdi, setGirdi] = useState('')

  const basla = (havuz = RULE_TEST_POOL) => {
    const n = uzunluk === 'hepsi' ? havuz.length : Math.min(Number(uzunluk), havuz.length)
    setSorular(shuffle(havuz).slice(0, n))
    setCevaplar([])
    setIdx(0)
    setGirdi('')
    setFaz('test')
  }

  const gonder = () => {
    const q = sorular[idx]
    const yeni = [...cevaplar, { item: q, yazilan: girdi, dogru: readingOk(girdi, [q.reading]) }]
    setCevaplar(yeni)
    setGirdi('')
    if (idx + 1 < sorular.length) {
      setIdx(idx + 1)
      return
    }
    bumpStat({ reviews: yeni.length, correct: yeni.filter((c) => c.dogru).length, ja: 1 })
    setFaz('sonuc')
  }

  // ————————————————————————— Test —————————————————————————

  if (faz === 'test') {
    const q = sorular[idx]
    return (
      <div className="quiz lang-ja">
        <div className="quiz-top">
          <div className="row">
            <button className="btn btn--sm btn--ghost" onClick={() => setFaz('kurulum')}>
              <Icon name="close" size={15} />
              Bırak
            </button>
            <div className="spacer" />
            <span className="tiny dim tabular">
              {idx + 1} / {sorular.length}
            </span>
          </div>
          <div className="bar" style={{ marginTop: 8 }}>
            <i style={{ width: `${(idx / sorular.length) * 100}%` }} />
          </div>
        </div>

        <div className="quiz-body">
          <div className="tiny faint center">Bu nasıl okunur?</div>
          {/* Anlamı GÖSTERMİYORUZ: bazı açıklamalar okunuşu ele veriyor
              ("kitap — 2 hece: ho-n" gibi). Anlam sonuç ekranında çıkıyor. */}
          <div className="ruletest-word ja">{q.kana}</div>
        </div>

        <div className="quiz-foot stack-sm">
          <input
            className="field"
            value={girdi}
            onChange={(e) => setGirdi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') gonder()
            }}
            placeholder="okunuşu yaz — örn. gakkou, konnichiwa"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <div className="tiny faint center">
            Türkçe yazım da kabul edilir: şi / çi / tsu. Uzun ünlüyü yazmayı unutma.
          </div>
          <button className="btn btn--primary btn--block" onClick={gonder}>
            Sonraki
          </button>
        </div>
      </div>
    )
  }

  // ————————————————————————— Sonuç —————————————————————————

  if (faz === 'sonuc') {
    const dogru = cevaplar.filter((c) => c.dogru).length
    const pct = Math.round((dogru / cevaplar.length) * 100)
    const yanlislar = cevaplar.filter((c) => !c.dogru)

    // Kural bazlı döküm — asıl işe yarayan kısım
    const kurallar = [...new Set(cevaplar.map((c) => c.item.ruleId))].map((id) => {
      const satir = cevaplar.filter((c) => c.item.ruleId === id)
      return {
        id,
        ad: satir[0].item.ruleShort,
        dogru: satir.filter((c) => c.dogru).length,
        toplam: satir.length,
      }
    })

    return (
      <>
        <TopBar title="Kural testi sonucu" back="/kana-kurallar" />
        <div className="page stack-lg lang-ja">
          <div className="card card--pad-lg center stack">
            <span className="result-mark">
              <Icon name={pct === 100 ? 'target' : pct >= 80 ? 'trophy' : 'flame'} size={28} />
            </span>
            <div style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
              {dogru} / {cevaplar.length}
            </div>
            <div className="dim">%{pct} doğru</div>
            <Bar value={pct} />
          </div>

          <div className="stack-sm">
            <h2>Kural kural</h2>
            {kurallar.map((k) => {
              const p = (k.dogru / k.toplam) * 100
              return (
                <div key={k.id} className="card stack-sm">
                  <div className="row">
                    <div className="card-title" style={{ flex: 1, fontSize: '0.95rem' }}>
                      {k.ad}
                    </div>
                    <span className="tabular bold" style={{ color: renk(p) }}>
                      %{Math.round(p)}
                    </span>
                    <span className="tiny faint tabular">
                      {k.dogru}/{k.toplam}
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${p}%`, background: renk(p) }} />
                  </div>
                  {p < 70 && (
                    <Link to={`/kana-kurallar?k=${k.id}`} className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
                      Bu kuralı oku
                      <Icon name="right" size={14} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {yanlislar.length > 0 && (
            <div className="stack-sm">
              <h2>Yanlış okuduklarım</h2>
              {yanlislar.map((c, i) => (
                <div key={i} className="card stack-sm">
                  <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                    <span className="ja ruletest-word-sm">{c.item.kana}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                        <b style={{ color: 'var(--ok)' }}>{c.item.reading}</b>
                        <span className="tiny faint">doğrusu</span>
                      </div>
                      <div className="tiny" style={{ marginTop: 2 }}>
                        <span className="faint">sen: </span>
                        <b style={{ color: 'var(--bad)' }}>{c.yazilan.trim() || '(boş)'}</b>
                      </div>
                    </div>
                    <SpeakBtn text={c.item.kana} lang="ja" reading={c.item.kana} size="sm" />
                  </div>
                  <div className="exam-explain">
                    {c.item.tr} · kural: {c.item.ruleShort}
                  </div>
                </div>
              ))}
              <button
                className="btn btn--block"
                onClick={() => basla(yanlislar.map((c) => c.item))}
                disabled={yanlislar.length < 2}
              >
                Sadece bu {yanlislar.length} kelimeyi tekrar sor
              </button>
            </div>
          )}

          <div className="stack-sm">
            <button className="btn btn--primary btn--block" onClick={() => basla()}>
              Yeni test
            </button>
            <Link to="/kana-kurallar" className="btn btn--ghost btn--block">
              Kurallara dön
            </Link>
          </div>
        </div>
      </>
    )
  }

  // ————————————————————————— Kurulum —————————————————————————

  const kuralSayisi = new Set(RULE_TEST_POOL.map((i) => i.ruleId)).size

  return (
    <>
      <TopBar title="Kural okuma testi" sub="Okunuşu sen yaz" back="/kana-kurallar" />

      <div className="page stack-lg lang-ja">
        <div className="card card--accent stack-sm">
          <div className="card-title">Şıksız test</div>
          <div className="card-sub" style={{ lineHeight: 1.65 }}>
            Kelimeyi görürsün, okunuşunu yazarsın. Şık yok — çünkü şık verilseydi doğruyu tanıyıp seçerdin, oysa
            burada kendin üretmen gerekiyor. Okumanın gerçek ölçüsü bu.
          </div>
          <div className="tiny faint">
            Sorular {kuralSayisi} kuralın örneklerinden geliyor; きって / きて gibi karşılaştırma çiftlerinin ikisi de
            çıkabilir. Doğru cevaplar test bitene kadar gösterilmez.
          </div>
        </div>

        <div className="stack-sm">
          <div className="tiny bold dim">Kaç kelime?</div>
          <Chips items={UZUNLUKLAR} value={uzunluk} onChange={setUzunluk} />
        </div>

        <button className="btn btn--lang btn--block btn--lg" onClick={() => basla()}>
          Teste başla
        </button>

        <Link to="/kana-kurallar" className="tiny faint center" style={{ display: 'block' }}>
          Önce kuralları okumak istersen
        </Link>
      </div>
    </>
  )
}

function renk(p: number): string {
  if (p >= 85) return 'var(--ok)'
  if (p >= 70) return 'var(--warn)'
  return 'var(--bad)'
}
