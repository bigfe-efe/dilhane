import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { JaOkunus } from '@/components/JaOkunus'
import { OKUMA, OKUMA_BY_ID, type OkumaMetni } from '@/content/ja/okuma'
import { UNITS, UNIT_BY_ID } from '@/content/ja/units'
import { db, setSetting } from '@/db/db'
import { useUnitProgress } from '@/db/hooks'

// Okuma alıştırmaları: kısa metinler; romaji, kana ve Türkçe ayrı ayrı
// gizlenebilir. Metinler ünite düzeyine göre sıralı ve yalnızca o üniteye
// kadar öğretilenlerle yazılı (content/ja/okuma.ts).

const OKUNAN_ANAHTAR = 'okuma-okunan'
const GOSTER_ANAHTAR = 'okuma-goster'

interface Goster {
  romaji: boolean
  kana: boolean
  tr: boolean
}

/** Açık/kapalı tercihi cihazda hatırlanır; depolama kapalıysa varsayılan */
function gosterOku(): Goster {
  try {
    const v = JSON.parse(localStorage.getItem(GOSTER_ANAHTAR) ?? 'null')
    if (v && typeof v === 'object') return { romaji: !!v.romaji, kana: !!v.kana, tr: !!v.tr }
  } catch {
    /* varsayılana düş */
  }
  return { romaji: true, kana: true, tr: false }
}

export default function ReadingPage() {
  const [params] = useSearchParams()
  const metin = OKUMA_BY_ID.get(params.get('m') ?? '')
  const kayit = useLiveQuery(() => db.settings.get(OKUNAN_ANAHTAR), [])
  const okunan = new Set<string>(Array.isArray(kayit?.value) ? (kayit.value as string[]) : [])

  if (metin) return <Okuyucu key={metin.id} metin={metin} okunan={okunan} />
  return <Liste okunan={okunan} />
}

// ————————————————————————— Liste —————————————————————————

function Liste({ okunan }: { okunan: Set<string> }) {
  const ilerleme = useUnitProgress()
  // Düzey: biten son ünite + çalışılmakta olan ünite
  const bitenNo = Math.max(0, ...UNITS.filter((u) => ilerleme.get(u.id)?.status === 'completed').map((u) => u.no))
  const sinir = bitenNo + 1

  return (
    <>
      <TopBar title="Okuma" sub="Kısa metinler · romaji ve Türkçe gizlenebilir" back="/calis" />
      <div className="page stack-lg lang-ja">
        <div className="card card--pad-lg stack-sm">
          <div className="card-title">Nasıl çalışılır</div>
          <ol className="kitap-rehber-adim">
            <li>Önce Türkçe kapalıyken metni baştan sona oku; anlamadığın yeri geç.</li>
            <li>İkinci okumada romajiyi kapat, kanadan oku. Takıldığın satıra dokun: yalnızca o satır açılır.</li>
            <li>Üçüncüde kanayı da kapat; yalnızca Japonca yazıdan oku.</li>
            <li>Sondaki üç soruyu çöz.</li>
          </ol>
          <div className="tiny faint">
            Her metin yalnızca yazdığı üniteye kadar öğrendiklerinle kurulu. {okunan.size} / {OKUMA.length} metin okundu.
          </div>
        </div>

        {UNITS.filter((u) => OKUMA.some((m) => m.unite === u.id)).map((u) => {
          const acik = u.no <= sinir
          return (
            <section key={u.id} className="stack-sm">
              <div className="row">
                <h2 style={{ margin: 0 }}>
                  {u.no}. ünite düzeyi
                </h2>
                <div className="spacer" />
                <span className="tiny faint">{acik ? u.title : `${u.no}. üniteden sonra`}</span>
              </div>
              {OKUMA.filter((m) => m.unite === u.id).map((m) => (
                <Link key={m.id} to={`/okuma?m=${m.id}`} className={`card card--link ok-kart${acik ? '' : ' is-ileri'}`}>
                  <span className={`kitap-satir-no${okunan.has(m.id) ? ' ok-okundu' : ''}`}>
                    {okunan.has(m.id) ? <Icon name="check" size={13} /> : <Icon name="book" size={13} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="ja ok-baslik">{m.baslik}</span>
                    <span className="ok-alt">
                      {m.baslikTr} · {m.satirlar.length} satır
                    </span>
                  </span>
                  <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                </Link>
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}

// ————————————————————————— Okuyucu —————————————————————————

function Okuyucu({ metin, okunan }: { metin: OkumaMetni; okunan: Set<string> }) {
  const [goster, setGoster] = useState<Goster>(gosterOku)
  /** Dokunularak açılmış satırlar */
  const [acik, setAcik] = useState<Set<number>>(new Set())
  const [cevap, setCevap] = useState<Record<number, number>>({})

  useEffect(() => {
    try {
      localStorage.setItem(GOSTER_ANAHTAR, JSON.stringify(goster))
    } catch {
      /* depolama kapalı: tercih yalnızca bu oturumda geçerli */
    }
  }, [goster])

  // Yeni metin en baştan açılsın (önceki metnin sonundan gelinir)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sira = OKUMA.findIndex((m) => m.id === metin.id)
  const sonraki = OKUMA[sira + 1]
  const unite = UNIT_BY_ID.get(metin.unite)
  const hepsiCevaplandi = metin.sorular.every((_, i) => cevap[i] !== undefined)
  const dogru = metin.sorular.filter((q, i) => cevap[i] === q.d).length

  // Sorular bitince metin okundu sayılır
  useEffect(() => {
    if (hepsiCevaplandi && !okunan.has(metin.id)) void setSetting(OKUNAN_ANAHTAR, [...okunan, metin.id])
  }, [hepsiCevaplandi, okunan, metin.id])

  const dugme = (anahtar: keyof Goster, etiket: string) => (
    <button
      className={`btn btn--sm btn--ghost${goster[anahtar] ? ' is-on' : ''}`}
      aria-pressed={goster[anahtar]}
      onClick={() => {
        setGoster((g) => ({ ...g, [anahtar]: !g[anahtar] }))
        setAcik(new Set())
      }}
    >
      {etiket} {goster[anahtar] ? 'açık' : 'kapalı'}
    </button>
  )

  const gizliVar = !goster.romaji || !goster.kana || !goster.tr

  return (
    <>
      <TopBar title={metin.baslik} sub={`${metin.baslikTr} · ${unite ? `${unite.no}. ünite düzeyi` : ''}`} back="/okuma" />
      <div className="page stack lang-ja">
        <div className="card-sub">{metin.giris}</div>

        <div className="row-wrap">
          {dugme('romaji', 'Romaji')}
          {dugme('kana', 'Kana')}
          {dugme('tr', 'Türkçe')}
          <SpeakBtn
            text={metin.satirlar.map((l) => l.ja).join(' ')}
            lang="ja"
            reading={metin.satirlar.map((l) => l.kana).join(' ')}
          />
        </div>

        <div className="card stack-sm">
          {metin.satirlar.map((l, i) => {
            const ac = acik.has(i)
            return (
              <div key={i} className="unit-line">
                <SpeakBtn text={l.ja} lang="ja" size="sm" reading={l.kana} />
                {l.kim && <span className="ok-kim">{l.kim}</span>}
                <div
                  className={`ok-satir${gizliVar ? ' is-tiklanir' : ''}`}
                  role={gizliVar ? 'button' : undefined}
                  tabIndex={gizliVar ? 0 : undefined}
                  aria-expanded={gizliVar ? ac : undefined}
                  onClick={() =>
                    gizliVar &&
                    setAcik((s) => {
                      const y = new Set(s)
                      if (y.has(i)) y.delete(i)
                      else y.add(i)
                      return y
                    })
                  }
                  onKeyDown={(e) => {
                    if (gizliVar && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      e.currentTarget.click()
                    }
                  }}
                >
                  <JaOkunus
                    ja={l.ja}
                    kana={l.kana}
                    latin={l.latin}
                    tr={goster.tr || ac ? l.tr : undefined}
                    gizle={{ romaji: !goster.romaji && !ac, kana: !goster.kana && !ac }}
                    jaClass="unit-line-ja"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {gizliVar && <div className="tiny faint">Takıldığın satıra dokun: yalnızca o satırın gizli kısımları açılır.</div>}

        <div className="card stack pk">
          <div className="row" style={{ gap: 8 }}>
            <Icon name="target" size={18} style={{ color: 'var(--accent)' }} />
            <span className="card-title" style={{ flex: 1 }}>
              Anladın mı?
            </span>
            {hepsiCevaplandi && (
              <span className="tiny faint tabular">
                {dogru} / {metin.sorular.length} doğru
              </span>
            )}
          </div>
          {metin.sorular.map((q, i) => {
            const secilen = cevap[i]
            const bitti = secilen !== undefined
            return (
              <div key={i} className="pk-soru">
                <div className="pk-metin">
                  <span className="pk-no">{i + 1}</span>
                  <span>{q.s}</span>
                </div>
                <div className="pk-siklar">
                  {q.o.map((o, k) => {
                    const durum = !bitti ? '' : k === q.d ? ' is-dogru' : k === secilen ? ' is-yanlis' : ' is-soluk'
                    return (
                      <button key={o} className={`pk-sik${durum}`} disabled={bitti} onClick={() => setCevap((c) => ({ ...c, [i]: k }))}>
                        {o}
                      </button>
                    )
                  })}
                </div>
                {bitti &&
                  (secilen === q.d ? (
                    <div className="feedback feedback--ok small">
                      <b>Doğru.</b>
                    </div>
                  ) : (
                    <div className="feedback feedback--bad small stack-sm">
                      <div>
                        <b>Doğrusu:</b> {q.o[q.d]}
                      </div>
                      <div className="ja">{q.a}</div>
                    </div>
                  ))}
              </div>
            )
          })}
        </div>

        <div className="kitap-alt">
          <Link to="/okuma" className="btn">
            ‹ Metinler
          </Link>
          {sonraki && (
            <Link to={`/okuma?m=${sonraki.id}`} className="btn btn--primary kitap-sonraki">
              <span className="kitap-sonraki-etiket">Sonraki metin</span>
              <span className="kitap-sonraki-ad ja">{sonraki.baslik} ›</span>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
