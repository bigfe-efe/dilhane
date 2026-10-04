import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { JaOkunus } from '@/components/JaOkunus'
import { shuffle } from '@/lib/shuffle'
import { cevapDogruMu } from '@/content/ja/unit-pekistirme'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '@/components/icons'
import { db, setSetting } from '@/db/db'
import {
  CUMLE_BAGLAMA,
  CUMLE_TURLERI,
  DERECE,
  FIIL_GRUPLARI,
  ISIM_BAGLAMA,
  ISKELET,
  KELIME_TURLERI,
  RU_GORUNUMLU_U,
  SIFAT_KULLANIMI,
  SIFAT_TUZAKLARI,
  SIKLIK,
  TEMEL_SIRA,
  TURKCEDEN_FARKLAR,
  U_FIIL_SONLARI,
  YAPI_KURALLARI,
  ZIT_CIFTLER,
  type Baglac,
} from '@/content/ja/dil-temeli'
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

// Dilin temeli — ünitelerin dışında, başvuru + alıştırma sayfası.
//
// Üniteler konuya göre ilerliyor; burası dilin iskeleti. Bölümler öğrenme
// sırasıyla: temel sıra (yol haritası), cümle yapısı, kelime türleri ve fiil
// grupları, zamirler, cümleyi çevirme (olumlu/olumsuz, zaman, soru,
// kibar/sade), sıfatlar, bağlaçlar, günlük cümleler, alıştırma.
// İçerik ve gerekçesi: content/ja/dil-temeli.ts ve content/ja/cumle-kur.ts.

type Bolum = 'sira' | 'yapi' | 'turler' | 'zamirler' | 'donustur' | 'sifat' | 'baglac' | 'gunluk' | 'alistirma'

const BOLUMLER: { id: Bolum; label: string }[] = [
  { id: 'sira', label: 'Temel sıra' },
  { id: 'yapi', label: 'Cümle yapısı' },
  { id: 'turler', label: 'Kelime türleri' },
  { id: 'zamirler', label: 'Zamirler' },
  { id: 'donustur', label: 'Cümleyi çevir' },
  { id: 'sifat', label: 'Sıfatlar' },
  { id: 'baglac', label: 'Bağlaçlar' },
  { id: 'gunluk', label: 'Günlük cümleler' },
  { id: 'alistirma', label: 'Alıştırma' },
]

export default function SentencesPage() {
  const [params, setParams] = useSearchParams()
  const istenen = params.get('b') as Bolum | null
  const bolum: Bolum = BOLUMLER.some((b) => b.id === istenen) ? istenen! : 'sira'

  return (
    <>
      <TopBar title="Dilin temeli" sub="Cümle yapısı, kelime türleri, zamirler, çekim, sıfatlar, bağlaçlar" back="/calis" />
      <div className="page stack-lg lang-ja">
        <Chips items={BOLUMLER} value={bolum} onChange={(b) => setParams({ b }, { replace: true })} />
        {bolum === 'sira' && <Sira />}
        {bolum === 'yapi' && <Yapi />}
        {bolum === 'turler' && <Turler />}
        {bolum === 'sifat' && <Sifatlar />}
        {bolum === 'baglac' && <Baglaclar />}
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


// ————————————————————————— Temel sıra —————————————————————————

const SIRA_ANAHTAR = 'temel-sira'

function Sira() {
  const kayit = useLiveQuery(() => db.settings.get(SIRA_ANAHTAR), [])
  const biten = new Set<string>(Array.isArray(kayit?.value) ? (kayit.value as string[]) : [])
  const cevir = (id: string) => {
    const yeni = new Set(biten)
    if (yeni.has(id)) yeni.delete(id)
    else yeni.add(id)
    void setSetting(SIRA_ANAHTAR, [...yeni])
  }

  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm">
        <div className="card-title">Önce iskelet, sonra ayrıntı</div>
        <div className="small">
          Üniteler konuya göre ilerliyor: tanışma, alışveriş, saatler. Dilin iskeleti ise burada: cümle nasıl kurulur,
          kelime türleri neler, bir cümle nasıl olumsuz ya da geçmiş yapılır. Aşağıdaki sıra, İngilizce öğrenirken
          izlenen sıranın Japoncaya uyarlanmış hâli. Her adımın yanında uygulamada nerede olduğu yazıyor; bitirdiğini
          işaretle.
        </div>
        <div className="tiny faint">
          {biten.size} / {TEMEL_SIRA.length} adım tamam. İlk üç adım bir oturumda okunur; gerisi ünitelerle birlikte ilerler.
        </div>
      </div>

      <div className="stack-sm">
        {TEMEL_SIRA.map((a, i) => {
          const ok = biten.has(a.id)
          return (
            <div key={a.id} className={`card dt-adim${ok ? ' is-done' : ''}`}>
              <button
                className={`unit-check${ok ? ' is-on' : ''}`}
                onClick={() => cevir(a.id)}
                aria-pressed={ok}
                aria-label={ok ? 'Tamamlandı işaretini kaldır' : 'Tamamlandı olarak işaretle'}
              >
                {ok ? <Icon name="check" size={14} /> : i + 1}
              </button>
              <div className="stack-sm" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <div className="row-wrap" style={{ gap: 8 }}>
                  <span className="card-title">{a.baslik}</span>
                  <span className="tiny faint">İngilizcede: {a.ingilizce}</span>
                </div>
                <div className="small dim">{a.ozet}</div>
                <div className="row-wrap" style={{ gap: 6 }}>
                  {a.yerler.map((y) => (
                    <Link key={y.to} to={y.to} className="btn btn--sm btn--ghost">
                      {y.ad} ›
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ————————————————————————— Cümle yapısı —————————————————————————

function Yapi() {
  const [kapali, setKapali] = useState<string[]>([])
  const acik = ISKELET.filter((t) => !kapali.includes(t.id))
  const tr = acik.map((t) => t.tr).join(' ')

  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm">
        <div className="card-title">Japonca cümle, Türkçe cümle gibi kurulur</div>
        <div className="small">
          Kelime sırası neredeyse aynı: yüklem sonda, niteleyen önde, ekler kelimenin arkasında. Türkçe bilen biri için
          en büyük kolaylık bu. İngilizce sırayla (özne, fiil, nesne) düşünme; Türkçe düşün.
        </div>
      </div>

      <Bolumcuk baslik="Cümlenin iskeleti" alt="Her taş bir soruya cevap verir. Taşa dokun: cümleden çıkar ya da girer. Yüklem (son taş) hep kalır.">
        <div className="dt-taslar">
          {ISKELET.map((t) => {
            const on = !kapali.includes(t.id)
            return (
              <button
                key={t.id}
                className={`dt-tas${on ? ' is-on' : ''}${t.sabit ? ' is-sabit' : ''}`}
                disabled={t.sabit}
                aria-pressed={on}
                onClick={() => setKapali((k) => (k.includes(t.id) ? k.filter((x) => x !== t.id) : [...k, t.id]))}
              >
                <span className="dt-tas-soru">{t.soru}</span>
                <span className="ja dt-tas-ja">{t.ja}</span>
                <span className="dt-tas-latin">{t.latin}</span>
                <span className="dt-tas-tr">{t.tr}</span>
              </button>
            )
          })}
        </div>
        <div className="card stack-sm cm-sonuc">
          <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ja cm-ja">{acik.map((t) => t.ja).join('')}。</div>
              <div className="jo-romaji cm-latin">{acik.map((t) => t.latin).join(' ')}.</div>
              <div className="ja jo-kana">{acik.map((t) => t.kana).join('')}。</div>
              <div className="jo-tr cm-tr">{tr.charAt(0).toLocaleUpperCase('tr') + tr.slice(1)}.</div>
            </div>
            <SpeakBtn text={acik.map((t) => t.ja).join('') + '。'} lang="ja" reading={acik.map((t) => t.kana).join('') + '。'} />
          </div>
          <div className="tiny faint">
            Sıra kalıbı: ne zaman → kim → kiminle → nerede → neyi → yüklem. Türkçesi de aynı sırada okunuyor.
          </div>
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Beş temel kural">
        {YAPI_KURALLARI.map((r) => (
          <div key={r.baslik} className={`card stack-sm${r.star ? ' is-star' : ''}`}>
            <div className="card-title">
              {r.star && <span className="tb-star">★ </span>}
              {r.baslik}
            </div>
            <div className="small">{r.govde}</div>
            {r.ornekler?.map((o) => <CumleSatiri key={o.ja} s={o} />)}
          </div>
        ))}
      </Bolumcuk>

      <Bolumcuk baslik="Dört cümle türü" alt="Yüklem ne ise cümle odur: isim, sıfat, fiil ya da var/yok. N5’teki her cümle bu dördünden biri.">
        <div className="stack-sm">
          {CUMLE_TURLERI.map((c) => (
            <CumleSatiri
              key={c.tur}
              s={c}
              onEk={
                <div className="cm-bicim" style={{ width: 132 }}>
                  <span className="small" style={{ fontWeight: 600 }}>
                    {c.tur}
                  </span>
                  <span className="ja tiny dim">{c.kalip}</span>
                </div>
              }
            />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Türkçeden farklı olanlar" alt="Yapı aynı ama şu altı nokta başta şaşırtır.">
        <div className="cols-2">
          {TURKCEDEN_FARKLAR.map((f) => (
            <div key={f.baslik} className="card stack-sm">
              <div className="card-title">{f.baslik}</div>
              <div className="small">{f.govde}</div>
            </div>
          ))}
        </div>
      </Bolumcuk>
    </div>
  )
}

// ————————————————————————— Kelime türleri —————————————————————————

function FiilSatiri({ f }: { f: { sozluk: string; masu: string; kana: string; latin: string; tr: string } }) {
  return (
    <div className="tb-row">
      <span className="tb-ja ja" style={{ minWidth: 150 }}>
        {f.sozluk} → {f.masu}
      </span>
      <span className="tb-read">
        <span className="tb-latin">{f.latin}</span>
        <span className="ja tiny dim">{f.kana}</span>
      </span>
      <span className="tb-tr">{f.tr}</span>
    </div>
  )
}

function Turler() {
  return (
    <div className="stack-lg">
      <Bolumcuk baslik="Kelime türleri" alt="Bir kelimenin türünü bilmek, onu nasıl çekeceğini ve cümlede nereye koyacağını söyler.">
        <div className="stack-sm">
          {KELIME_TURLERI.map((k) => (
            <CumleSatiri
              key={k.tur}
              s={{ ...k.ornek, not: k.aciklama }}
              onEk={
                <div className="cm-bicim">
                  <span className="small" style={{ fontWeight: 600 }}>
                    {k.tur}
                  </span>
                  <span className="ja tiny dim">{k.japonca}</span>
                </div>
              }
            />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk
        baslik="Fiil grupları"
        alt="Bir fiilin ます, ない, て, た biçimlerinin nasıl kurulacağı grubuna bağlı. Yeni bir fiil öğrenirken ilk bakacağın şey bu."
      >
        {FIIL_GRUPLARI.map((g) => (
          <div key={g.ad} className="card stack-sm">
            <div className="row" style={{ gap: 8 }}>
              <span className="card-title">{g.ad}</span>
              <span className="ja tiny dim">{g.japonca}</span>
            </div>
            <div className="small">{g.kural}</div>
            <div className="tb-table">
              {g.ornekler.map((f) => (
                <FiilSatiri key={f.sozluk} f={f} />
              ))}
            </div>
          </div>
        ))}

        <div className="card stack-sm is-star">
          <div className="card-title">
            <span className="tb-star">★ </span>Tuzak: る ile biten ama u-fiil olanlar
          </div>
          <div className="small">
            -iru / -eru ile bittikleri hâlde u-fiil gibi çekilirler: る düşmez, り olur. Sınav bunları sever.
          </div>
          <div className="tb-table">
            {RU_GORUNUMLU_U.map((f) => (
              <FiilSatiri key={f.sozluk} f={f} />
            ))}
          </div>
          <div className="tiny dim">
            Tersine, ます biçiminden gruba bakarken: ます’tan önceki ses “e” ise ru-fiildir (食べます). “i” ise çoğunlukla
            u-fiildir (行きます), ama birkaç ru-fiil de böyle biter: 起きます, 見ます, います, かります, できます.
          </div>
        </div>

        <div className="card stack-sm">
          <div className="card-title">u-fiilde son hece nasıl değişir</div>
          <div className="small">Sözlük biçiminin son hecesi “u” sırasından “i” sırasına geçer, sonra ます gelir.</div>
          <div className="tb-table">
            {U_FIIL_SONLARI.map((u) => (
              <div key={u.son} className="tb-row">
                <span className="ja tb-ja" style={{ minWidth: 110 }}>
                  {u.son} → {u.masu}
                </span>
                <span className="tb-read" style={{ minWidth: 170 }}>
                  <span className="ja tb-kana">{u.ornek}</span>
                  <span className="tb-latin">{u.latin}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="tiny faint">
          Her fiilin bütün biçimleri: <Link to="/verbs">Fiil ve sıfat çekim tabloları</Link>. Bir cümleyi çevirmek:{' '}
          <Link to="/cumle?b=donustur">Cümleyi çevir</Link>.
        </div>
      </Bolumcuk>
    </div>
  )
}

// ————————————————————————— Sıfatlar —————————————————————————

function Sifatlar() {
  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm">
        <div className="card-title">İki tür sıfat var</div>
        <div className="small">
          <b>い-sıfat</b> い ile biter ve kendisi çekilir (高い → 高くない). <b>な-sıfat</b> isim gibi davranır: です ile
          çekilir, isimden önce な alır (しずかな町). Hangi türden olduğunu bilmeden olumsuzunu ya da geçmişini
          kuramazsın; o yüzden her yeni sıfatı türüyle birlikte öğren.
        </div>
      </div>

      <Bolumcuk baslik="Altı kullanım, yan yana" alt="Solda い-sıfat (高い), sağda な-sıfat (しずか).">
        {SIFAT_KULLANIMI.map((k) => (
          <div key={k.baslik} className="card stack-sm">
            <div className="card-title">{k.baslik}</div>
            <div className="small dim">{k.govde}</div>
            <div className="cols-2">
              <CumleSatiri s={k.i} onEk={<span className="dt-etiket">い</span>} />
              <CumleSatiri s={k.na} onEk={<span className="dt-etiket">な</span>} />
            </div>
          </div>
        ))}
      </Bolumcuk>

      <div className="card stack-sm is-star">
        <div className="card-title">
          <span className="tb-star">★ </span>Tuzaklar
        </div>
        <ul className="tight small">
          {SIFAT_TUZAKLARI.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <Bolumcuk baslik="Zıt çiftler" alt="Sıfatları çift çift öğrenmek ikisini birden pekiştirir. （な） yazanlar な-sıfat.">
        <div className="stack-sm">
          {ZIT_CIFTLER.map((c) => (
            <div key={c.a.ja} className="dt-cift">
              <ZitKelime s={c.a} />
              <span className="dt-ok">↔</span>
              <ZitKelime s={c.b} />
            </div>
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Ne kadar?" alt="Derece zarfları sıfatın önüne gelir.">
        <div className="stack-sm">
          {DERECE.map((d) => (
            <CumleSatiri key={d.ja} s={d} />
          ))}
        </div>
      </Bolumcuk>

      <div className="tiny faint">
        Sıfat cümlesini olumsuz, geçmiş ve soru yapmak: <Link to="/cumle?b=donustur">Cümleyi çevir</Link> (高い, いい, しずか,
        好き).
      </div>
    </div>
  )
}

function ZitKelime({ s }: { s: Satir }) {
  return (
    <div className="dt-zit">
      <span className="ja dt-zit-ja">{s.ja}</span>
      <span className="dt-zit-alt">
        <span className="tb-latin">{s.latin}</span> · {s.tr}
      </span>
    </div>
  )
}

// ————————————————————————— Bağlaçlar —————————————————————————

function Baglaclar() {
  const satir = (b: Baglac) => (
    <CumleSatiri
      key={b.kelime}
      s={{ ...b, not: b.nerede }}
      onEk={
        <div className="cm-bicim">
          <span className="ja">{b.kelime}</span>
          <span className="tiny dim">{b.anlam}</span>
        </div>
      }
    />
  )
  return (
    <div className="stack-lg">
      <div className="card-sub">
        Tek tek cümle kurabildikten sonraki adım: iki şeyi “ve” ile, iki cümleyi “ama” ya da “çünkü” ile bağlamak.
      </div>

      <Bolumcuk baslik="İsimleri bağlamak" alt="Dikkat: と yalnızca isimleri bağlar; iki cümleyi “ve” diye bağlamak için kullanılmaz.">
        <div className="stack-sm">{ISIM_BAGLAMA.map(satir)}</div>
      </Bolumcuk>

      <Bolumcuk baslik="Cümleleri bağlamak" alt="Kimi cümlenin başına, kimi ilk cümlenin sonuna gelir; yeri her satırda yazıyor.">
        <div className="stack-sm">{CUMLE_BAGLAMA.map(satir)}</div>
        <div className="card stack-sm is-star">
          <div className="card-title">
            <span className="tb-star">★ </span>から’nın yeri Türkçenin tersi gibi görünür
          </div>
          <div className="small">
            Türkçede “gitmiyorum, <b>çünkü</b> meşgulüm” dersin: çünkü sebebin başında. Japoncada から sebebin{' '}
            <b>sonunda</b> durur ve sebep önce söylenir: 忙しいです<b>から</b>、行きません. “Meşgul olduğum <b>için</b>{' '}
            gitmiyorum” diye düşünürsen sıra tam oturur.
          </div>
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Ne sıklıkla?" alt="Sıklık zarfı fiilden önce gelir. Son ikisi fiili OLUMSUZ ister.">
        <div className="stack-sm">
          {SIKLIK.map((s) => (
            <CumleSatiri
              key={s.kelime}
              s={s}
              onEk={
                <div className="cm-bicim">
                  <span className="ja">{s.kelime}</span>
                  <span className="dt-cubuk" aria-hidden>
                    <span style={{ width: `${s.oran}%` }} />
                  </span>
                </div>
              }
            />
          ))}
        </div>
      </Bolumcuk>
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
