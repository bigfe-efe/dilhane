import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { JaOkunus } from '@/components/JaOkunus'
import { shuffle } from '@/lib/shuffle'
import { cevapDogruMu } from '@/content/ja/unit-pekistirme'
import {
  DONUSUM,
  DONUSUM_KURALI,
  GUNLUK,
  SORU_KELIMELERI,
  SUREN_KURALI,
  ZAMAN_KELIMELERI,
  ZAMAN_OZETI,
  ZAMIRLER,
  ZAMIR_EKLERI,
  ZAMIR_KURALLARI,
  type Bicim,
  type DonusumCumle,
  type Satir,
} from '@/content/ja/cumle-kur'

// Cümle kur — ünitelerin dışında, başvuru + alıştırma sayfası.
//
// Dört bölüm: bir cümleyi olumlu/olumsuz, zaman, soru ve kibar/sade hâllerine
// çeviren araç; zamirler; günlük kalıp cümleler; alıştırma. İçerik ve
// gerekçesi content/ja/cumle-kur.ts içinde.

type Bolum = 'donustur' | 'zamirler' | 'gunluk' | 'alistirma'

const BOLUMLER: { id: Bolum; label: string }[] = [
  { id: 'donustur', label: 'Cümleyi çevir' },
  { id: 'zamirler', label: 'Zamirler' },
  { id: 'gunluk', label: 'Günlük cümleler' },
  { id: 'alistirma', label: 'Alıştırma' },
]

export default function SentencesPage() {
  const [params, setParams] = useSearchParams()
  const istenen = params.get('b') as Bolum | null
  const bolum: Bolum = BOLUMLER.some((b) => b.id === istenen) ? istenen! : 'donustur'

  return (
    <>
      <TopBar title="Cümle kur" sub="Olumlu, olumsuz, zaman, soru · zamirler · günlük cümleler" back="/calis" />
      <div className="page stack-lg lang-ja">
        <Chips items={BOLUMLER} value={bolum} onChange={(b) => setParams({ b }, { replace: true })} />
        {bolum === 'donustur' && <Donustur />}
        {bolum === 'zamirler' && <Zamirler />}
        {bolum === 'gunluk' && <Gunluk />}
        {bolum === 'alistirma' && <Alistirma />}
      </div>
    </>
  )
}

function Bolumcuk({ baslik, alt, children }: { baslik: string; alt?: ReactNode; children: ReactNode }) {
  return (
    <section className="stack-sm">
      <h2>{baslik}</h2>
      {alt && (
        <div className="card-sub" style={{ marginTop: -4 }}>
          {alt}
        </div>
      )}
      {children}
    </section>
  )
}

/** Örnek satır: yazılış → romaji → kana → Türkçe, yanında ses */
function CumleSatiri({ s, onEk }: { s: Satir; onEk?: ReactNode }) {
  return (
    <div className="unit-ex">
      {onEk}
      <div style={{ flex: 1, minWidth: 0 }}>
        <JaOkunus ja={s.ja} kana={s.kana} latin={s.latin} tr={s.tr} jaClass="unit-ex-ja">
          {s.not && <div className="tiny dim">{s.not}</div>}
        </JaOkunus>
      </div>
      {s.star && (
        <span className="tb-star" title="Çok kullanılır">
          ★
        </span>
      )}
      <SpeakBtn text={s.ja} lang="ja" size="sm" reading={s.kana ?? s.ja} />
    </div>
  )
}

// ————————————————————————— Cümleyi çevir —————————————————————————

type Zaman = 'genis' | 'gecmis' | 'suren'
type Kibarlik = 'kibar' | 'sade'

const BICIM_ADI = ['olumlu', 'olumsuz', 'geçmiş', 'olumsuz geçmiş']

interface Kurulmus {
  /** Yüklemin kökü ve eki; cümle sonu ayrı */
  bas: string
  kok: string
  ek: string
  son: string
}

/** Cümleyi parçalarından kurar: baş + kök + ek + (か。/ ？ / 。) */
function kur(c: DonusumCumle, f: Bicim, soru: boolean, kibarlik: Kibarlik): { ja: Kurulmus; kana: Kurulmus; latin: Kurulmus } {
  const parca = (s: string) => {
    const [kok, ek = ''] = s.split('|')
    return { kok, ek }
  }
  const ja = parca(f.ja)
  const kana = parca(f.kana)
  const latin = parca(f.latin)
  // Sade soruda だ düşer: 学生だ → 学生？
  if (soru && kibarlik === 'sade' && ja.ek === 'だ') {
    ja.ek = ''
    kana.ek = ''
    latin.ek = ''
    latin.kok = latin.kok.trimEnd()
  }
  const son = soru ? (kibarlik === 'kibar' ? 'か。' : '？') : '。'
  const sonLatin = soru ? (kibarlik === 'kibar' ? ' ka.' : '?') : '.'
  return {
    ja: { bas: c.bas.ja, ...ja, son },
    kana: { bas: c.bas.kana, ...kana, son },
    latin: { bas: c.bas.latin + ' ', ...latin, son: sonLatin },
  }
}

const duz = (k: Kurulmus) => k.bas + k.kok + k.ek + k.son

/** Seçime göre biçim, Türkçesi ve kuralı */
function sec(c: DonusumCumle, olumsuz: boolean, zaman: Zaman, soru: boolean, kibarlik: Kibarlik) {
  if (zaman === 'suren' && c.suren) {
    const i = olumsuz ? 1 : 0
    return { f: c.suren[kibarlik][i], tr: (soru ? c.suren.trSoru : c.suren.tr)[i], kural: SUREN_KURALI[kibarlik][i] }
  }
  const i = (zaman === 'gecmis' ? 2 : 0) + (olumsuz ? 1 : 0)
  return { f: c[kibarlik][i], tr: (soru ? c.trSoru : c.tr)[i], kural: DONUSUM_KURALI[c.tur][kibarlik][i] }
}

function Donustur() {
  const [id, setId] = useState(DONUSUM[0].id)
  const [olumsuz, setOlumsuz] = useState(false)
  const [zaman, setZaman] = useState<Zaman>('genis')
  const [soru, setSoru] = useState(false)
  const [kibarlik, setKibarlik] = useState<Kibarlik>('kibar')

  const c = DONUSUM.find((x) => x.id === id)!
  // Süren biçimi olmayan cümleye geçilince geniş zamana düş
  const z: Zaman = zaman === 'suren' && !c.suren ? 'genis' : zaman
  const s = sec(c, olumsuz, z, soru, kibarlik)
  const k = kur(c, s.f, soru, kibarlik)

  const zamanlar: { id: Zaman; label: string }[] = [
    { id: 'genis', label: 'Geniş · gelecek' },
    { id: 'gecmis', label: 'Geçmiş' },
    ...(c.suren ? [{ id: 'suren' as const, label: 'Şu an (sürüyor)' }] : []),
  ]

  // Genel bakış: bu cümlenin bütün hâlleri
  const hepsi: { etiket: string; olumsuz: boolean; zaman: Zaman }[] = [
    { etiket: 'Olumlu', olumsuz: false, zaman: 'genis' },
    { etiket: 'Olumsuz', olumsuz: true, zaman: 'genis' },
    { etiket: 'Geçmiş', olumsuz: false, zaman: 'gecmis' },
    { etiket: 'Olumsuz geçmiş', olumsuz: true, zaman: 'gecmis' },
    ...(c.suren
      ? [
          { etiket: 'Şu an', olumsuz: false, zaman: 'suren' as const },
          { etiket: 'Şu an, olumsuz', olumsuz: true, zaman: 'suren' as const },
        ]
      : []),
  ]

  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm">
        <div className="card-title">Japoncada cümlenin anlamı SONDA belirlenir</div>
        <div className="small">
          Olumlu mu, olumsuz mu, geçmiş mi, soru mu: hepsi cümlenin son kelimesine eklenen ekle söylenir, Türkçedeki
          gibi. Cümlenin geri kalanı hiç değişmez. Aşağıda bir cümle seç, düğmelerle çevir ve <b>renkli kısmın</b> nasıl
          değiştiğine bak.
        </div>
      </div>

      <Bolumcuk baslik="Türkçe zamanların karşılığı" alt="Japoncada üç biçim yeter: ます, ています, ました. Ayrı bir gelecek zaman eki yok.">
        <div className="tb-table">
          {ZAMAN_OZETI.map((r) => (
            <div key={r.tr} className="tb-row">
              <span className="tb-tr" style={{ minWidth: 170 }}>
                {r.tr}
              </span>
              <span className="tb-read" style={{ minWidth: 130 }}>
                <span className="ja tb-kana">{r.ja}</span>
                <span className="tb-latin">{r.latin}</span>
              </span>
              <span className="tb-not">{r.not}</span>
            </div>
          ))}
        </div>
        <div className="row-wrap" style={{ gap: 6 }}>
          <span className="tiny faint">Zamanı gösteren kelimeler:</span>
          {ZAMAN_KELIMELERI.map((w) => (
            <span key={w.ja} className="badge tiny" title={w.latin}>
              <span className="ja">{w.ja}</span>&nbsp;{w.latin} · {w.tr}
            </span>
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Cümleyi çevir" alt="Önce bir cümle seç. Fiil, isim ve sıfat cümleleri farklı çekilir; hepsinden örnek var.">
        <div className="cm-secim">
          {DONUSUM.map((x) => (
            <button key={x.id} className={`cm-cumle${x.id === id ? ' is-on' : ''}`} onClick={() => setId(x.id)}>
              <span className="ja">{x.kelime}</span>
              <span className="tiny">{x.cins}</span>
            </button>
          ))}
        </div>

        <div className="card card--pad-lg stack cm-sonuc">
          <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ja cm-ja">
                {k.ja.bas}
                {k.ja.kok}
                <mark className="jo-vurgu">{k.ja.ek}</mark>
                {k.ja.son}
              </div>
              <div className="jo-romaji cm-latin">
                {k.latin.bas}
                {k.latin.kok}
                <b>{k.latin.ek}</b>
                {k.latin.son}
              </div>
              {duz(k.kana) !== duz(k.ja) && <div className="ja jo-kana">{duz(k.kana)}</div>}
              <div className="jo-tr cm-tr">{s.tr}</div>
            </div>
            <SpeakBtn text={duz(k.ja)} lang="ja" reading={duz(k.kana)} />
          </div>

          <div className="cm-dugmeler">
            <Secici
              items={[
                { id: 'hayir', label: 'Olumlu' },
                { id: 'evet', label: 'Olumsuz' },
              ]}
              value={olumsuz ? 'evet' : 'hayir'}
              onChange={(v) => setOlumsuz(v === 'evet')}
            />
            <Secici items={zamanlar} value={z} onChange={setZaman} />
            <Secici
              items={[
                { id: 'hayir', label: 'Düz cümle' },
                { id: 'evet', label: 'Soru' },
              ]}
              value={soru ? 'evet' : 'hayir'}
              onChange={(v) => setSoru(v === 'evet')}
            />
            <Secici
              items={[
                { id: 'kibar' as const, label: 'Kibar (です・ます)' },
                { id: 'sade' as const, label: 'Sade (arkadaş dili)' },
              ]}
              value={kibarlik}
              onChange={setKibarlik}
            />
          </div>

          <div className="cm-kural">
            <b>Ne değişti: </b>
            {s.kural}
            {soru && (
              <>
                {' '}
                {kibarlik === 'kibar'
                  ? 'Soru: cümlenin sonuna か eklenir; soru işareti gerekmez.'
                  : 'Sade soru: か yerine sesi yükseltirsin (yazıda ？); isim ve な-sıfatta だ düşer.'}
              </>
            )}
          </div>
          {c.not && <div className="tiny dim">{c.not}</div>}
        </div>

        <div className="tb-sub">
          「{c.kelime}」 · {c.cins} · {c.anlam} — bütün hâlleri ({kibarlik === 'kibar' ? 'kibar' : 'sade'})
        </div>
        <div className="ck-izgara">
          {hepsi.map((h) => {
            const x = sec(c, h.olumsuz, h.zaman, false, kibarlik)
            const y = kur(c, x.f, false, kibarlik)
            const secili = h.olumsuz === olumsuz && h.zaman === z
            return (
              <button
                key={h.etiket}
                className={`ck-hucre cm-hucre${secili ? ' is-on' : ''}`}
                onClick={() => {
                  setOlumsuz(h.olumsuz)
                  setZaman(h.zaman)
                }}
              >
                <div className="tb-sub">{h.etiket}</div>
                <div className="ja ck-ja">
                  {y.ja.kok}
                  <mark className="jo-vurgu">{y.ja.ek}</mark>
                </div>
                <div className="ck-romaji">
                  {y.latin.kok}
                  <b>{y.latin.ek}</b>
                </div>
                <div className="ck-tr">{x.tr}</div>
              </button>
            )
          })}
        </div>
      </Bolumcuk>

      <div className="tiny faint">
        Çekim tablosunun tamamı ve cümle sonlarının sözlüğü (〜ましょう, 〜たいです, 〜てください…):{' '}
        <Link to="/temel?b=cekim">Temel bilgiler → Olumlu · olumsuz</Link>.
      </div>
    </div>
  )
}

/** İki-üç seçenekli küçük düğme grubu */
function Secici<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="cm-secici" role="group">
      {items.map((i) => (
        <button key={i.id} className={i.id === value ? 'is-on' : ''} aria-pressed={i.id === value} onClick={() => onChange(i.id)}>
          {i.label}
        </button>
      ))}
    </div>
  )
}

// ————————————————————————— Zamirler —————————————————————————

function Zamirler() {
  return (
    <div className="stack-lg">
      <Bolumcuk baslik="Kişi zamirleri" alt="Liste kısa; asıl önemli olan altındaki kullanım kuralları.">
        <div className="cols-2">
          {ZAMIRLER.map((z) => (
            <CumleSatiri key={z.ja} s={z} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Nasıl kullanılır" alt="Japoncada zamir Türkçedekinden de az söylenir.">
        {ZAMIR_KURALLARI.map((r) => (
          <div key={r.baslik} className={`card stack-sm${r.star ? ' is-star' : ''}`}>
            <div className="card-title">
              {r.star && <span className="tb-star">★ </span>}
              {r.baslik}
            </div>
            <div className="small">{r.govde}</div>
            {r.ornek && <CumleSatiri s={r.ornek} />}
          </div>
        ))}
      </Bolumcuk>

      <Bolumcuk baslik="Zamir + ek" alt="Türkçedeki hâl ekleri gibi: ben, benim, beni, bana, benimle. Ek değişir, 私 aynı kalır.">
        <div className="stack-sm">
          {ZAMIR_EKLERI.map((z) => (
            <CumleSatiri
              key={z.bicim}
              s={z}
              onEk={
                <div className="cm-bicim">
                  <span className="ja">{z.bicim}</span>
                  <span className="tiny dim">{z.karsilik}</span>
                </div>
              }
            />
          ))}
        </div>
        <div className="tiny faint">
          Aynı ekler her isimle çalışır: 先生の (öğretmenin), 友だちと (arkadaşla), だれが (kim). Eklerin tamamı:{' '}
          <Link to="/temel?b=ekler">Temel bilgiler → Ekler</Link>. Bu, şu, o için:{' '}
          <Link to="/temel?b=kosoado">Bu · şu · o</Link>.
        </div>
      </Bolumcuk>

      <Bolumcuk
        baslik="Soru kelimeleri"
        alt="Soru kelimesi cümlede cevabın geleceği yerde durur; sıra değişmez, sona か gelir. Özne soruluyorsa は değil が kullanılır: だれが来ますか."
      >
        <div className="stack-sm">
          {SORU_KELIMELERI.map((z) => (
            <CumleSatiri
              key={z.kelime}
              s={z}
              onEk={
                <div className="cm-bicim">
                  <span className="ja">{z.kelime}</span>
                  <span className="tiny dim">{z.anlam}</span>
                </div>
              }
            />
          ))}
        </div>
      </Bolumcuk>
    </div>
  )
}

// ————————————————————————— Günlük cümleler —————————————————————————

function Gunluk() {
  return (
    <div className="stack-lg">
      <div className="card-sub">
        Kalıp cümleler: parçalarına ayırmadan, bütün olarak öğrenilir. Her birini dinle ve sesli tekrar et; ★ olanlar her
        gün kullanılanlar.
      </div>
      {GUNLUK.map((g) => (
        <Bolumcuk key={g.baslik} baslik={g.baslik} alt={g.alt || undefined}>
          <div className="stack-sm">
            {g.satirlar.map((s) => (
              <CumleSatiri key={s.ja} s={s} />
            ))}
          </div>
        </Bolumcuk>
      ))}
    </div>
  )
}

// ————————————————————————— Alıştırma —————————————————————————

interface AlSoru {
  /** Üstte gösterilen Japonca (varsa) */
  ja?: string
  metin: string
  /** Şıklı soru */
  siklar?: string[]
  dogruSik?: number
  /** Yazmalı soru: kabul edilen cevaplar */
  yaz?: string[]
  dogruMetin: string
  aciklama: string
}

function soruUret(): AlSoru[] {
  const sorular: AlSoru[] = []
  const cumleler = shuffle(DONUSUM)
  for (let n = 0; n < 10; n++) {
    const c = cumleler[n % cumleler.length]
    const i = 1 + Math.floor(Math.random() * 3)
    const tam = (j: number) => duz(kur(c, c.kibar[j], false, 'kibar').ja)
    const yuklem = (f: Bicim) => f.ja.replace('|', '')
    const tip = n % 4
    if (tip === 0) {
      // Cümleyi istenen biçime çevir
      const siklar = shuffle([0, 1, 2, 3].map(tam))
      sorular.push({
        ja: tam(0),
        metin: `Bu cümleyi “${BICIM_ADI[i]}” yap.`,
        siklar,
        dogruSik: siklar.indexOf(tam(i)),
        dogruMetin: tam(i),
        aciklama: `${DONUSUM_KURALI[c.tur].kibar[i]} ${tam(i)} = ${c.tr[i]}`,
      })
    } else if (tip === 1) {
      // Yüklemi yaz
      sorular.push({
        ja: `${c.bas.ja}＿＿＿。`,
        metin: `“${c.tr[i]}” — 「${c.kelime}」 kelimesini doğru biçimde yaz (kibar).`,
        yaz: [yuklem(c.kibar[i]), c.kibar[i].kana.replace('|', '')],
        dogruMetin: `${yuklem(c.kibar[i])} (${c.kibar[i].latin.replace('|', '')})`,
        aciklama: `${DONUSUM_KURALI[c.tur].kibar[i]} ${tam(i)}`,
      })
    } else if (tip === 2) {
      // Anlamı seç
      const siklar = shuffle([...c.tr])
      sorular.push({
        ja: tam(i),
        metin: 'Bu cümle ne demek?',
        siklar,
        dogruSik: siklar.indexOf(c.tr[i]),
        dogruMetin: c.tr[i],
        aciklama: `${DONUSUM_KURALI[c.tur].kibar[i]}`,
      })
    } else {
      // Sade biçimin kibar karşılığı
      const siklar = shuffle(c.kibar.map(yuklem))
      sorular.push({
        ja: yuklem(c.sade[i]),
        metin: 'Bu sade biçimin kibar hâli hangisi?',
        siklar,
        dogruSik: siklar.indexOf(yuklem(c.kibar[i])),
        dogruMetin: yuklem(c.kibar[i]),
        aciklama: `${yuklem(c.sade[i])} (${BICIM_ADI[i]}, sade) → ${yuklem(c.kibar[i])}. ${c.tr[i]}`,
      })
    }
  }
  return sorular
}

function Alistirma() {
  const [tur, setTur] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sorular = useMemo(soruUret, [tur])
  const [i, setI] = useState(0)
  const [cevap, setCevap] = useState<{ v: string; ok: boolean } | null>(null)
  const [girdi, setGirdi] = useState('')
  const [dogru, setDogru] = useState(0)

  const yeniden = () => {
    setTur((t) => t + 1)
    setI(0)
    setCevap(null)
    setGirdi('')
    setDogru(0)
  }

  if (i >= sorular.length) {
    return (
      <div className="stack">
        <div className="card card--pad-lg center stack-sm">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {dogru} / {sorular.length}
          </div>
          <div className="small dim">
            {dogru >= 8 ? 'Çekimler oturmuş.' : 'Yanlış yaptığın biçimlere “Cümleyi çevir” bölümünde bir kez daha bak.'}
          </div>
        </div>
        <button className="btn btn--primary btn--block btn--lg" onClick={yeniden}>
          Yeni 10 soru
        </button>
      </div>
    )
  }

  const q = sorular[i]
  const cevapla = (v: string, ok: boolean) => {
    if (cevap) return
    setCevap({ v, ok })
    if (ok) setDogru((d) => d + 1)
  }

  return (
    <div className="stack">
      <div className="row tiny faint">
        <span>Cümleyi çevir: olumsuz, geçmiş, kibar ↔ sade</span>
        <div className="spacer" />
        <span className="tabular">
          {i + 1} / {sorular.length}
        </span>
      </div>

      <div className="card card--pad-lg stack">
        {q.ja && <div className="ja cm-ja">{q.ja}</div>}
        <div>{q.metin}</div>

        {q.siklar ? (
          <div className="pk-siklar">
            {q.siklar.map((o, k) => {
              const durum = !cevap ? '' : k === q.dogruSik ? ' is-dogru' : o === cevap.v ? ' is-yanlis' : ' is-soluk'
              return (
                <button key={o} className={`pk-sik ja${durum}`} disabled={!!cevap} onClick={() => cevapla(o, k === q.dogruSik)}>
                  {o}
                </button>
              )
            })}
          </div>
        ) : cevap ? (
          <div className={`pk-verilen${cevap.ok ? ' is-dogru' : ' is-yanlis'}`}>
            Cevabın: <b className="ja">{cevap.v}</b>
          </div>
        ) : (
          <form
            className="pk-yaz"
            onSubmit={(e) => {
              e.preventDefault()
              const v = girdi.trim()
              if (v) cevapla(v, cevapDogruMu(v, q.yaz!))
            }}
          >
            <input
              className="field ja"
              value={girdi}
              onChange={(e) => setGirdi(e.target.value)}
              placeholder="kana ya da romaji"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
            />
            <button className="btn btn--primary" type="submit" disabled={!girdi.trim()}>
              Kontrol et
            </button>
          </form>
        )}

        {cevap &&
          (cevap.ok ? (
            <div className="feedback feedback--ok small">
              <b>Doğru.</b>
            </div>
          ) : (
            <div className="feedback feedback--bad small stack-sm">
              <div>
                <b>Doğrusu:</b> <span className="ja">{q.dogruMetin}</span>
              </div>
              <div>{q.aciklama}</div>
            </div>
          ))}
      </div>

      {cevap && (
        <button
          className="btn btn--primary btn--block"
          onClick={() => {
            setI(i + 1)
            setCevap(null)
            setGirdi('')
          }}
        >
          {i + 1 >= sorular.length ? 'Sonucu gör' : 'Sonraki'}
        </button>
      )}
    </div>
  )
}
