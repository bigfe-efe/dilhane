import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { kanaToRomaji, romajiWords } from '@/lib/ja-phonetic'
import {
  AYIN_GUNLERI,
  AYLAR,
  BINLER,
  BUYUK_BIRIMLER,
  DAKIKALAR,
  GORELI_ZAMAN,
  HAFTA,
  KOSOADO,
  KOSOADO_KURALLARI,
  KOSOADO_ORNEKLERI,
  SAAT_CUMLELERI,
  SAAT_KURALLARI,
  SAAT_ORNEKLERI,
  SAATLER,
  SAATLER_24,
  SAYI_KURALLARI,
  SAYI_ORNEKLERI,
  SAYI_UST_SINIR,
  SIFIR_YUZ,
  TANITIM_KALIPLARI,
  TANITIM_KISA,
  TANITIM_SORULARI,
  TANITIM_UZUN,
  TARIH_ORNEKLERI,
  TEMEL_SAYILAR,
  YASLAR,
  YUZLER,
  saat12,
  saat24,
  sayiKana,
  sayiKanji,
  sayiBasamaklari,
  sayiParcalari,
  type Ornek,
} from '@/content/ja/basics'

// Temel bilgiler — kanji tablosu dışındaki her şeyin tek sayfası.
//
// NEDEN TEK SAYFA, BEŞ BÖLÜM: bunlar ders değil, BAŞVURU. "Dört yüz nasıl
// okunuyordu", "ayın 20'si neydi" diye dönüp bakılacak yer. Beş ayrı sayfa
// olsa her soruda önce hangi sayfada olduğunu hatırlamak gerekirdi; burada
// bölüm düğmesi yeter. Çalış sayfasındaki kartlar doğrudan ilgili bölümü açıyor.
//
// Her satırda Latin okunuş var: kana henüz akıcı değilken okunuşu doğrulamanın
// en hızlı yolu o. Yıldız (★) düzensiz ya da en sık hata yapılan satırları
// işaretliyor — asıl ezberlenecek liste yıldızlılar.

type Bolum = 'sayilar' | 'tarih' | 'saat' | 'kosoado' | 'tanitim'

const BOLUMLER: { id: Bolum; label: string }[] = [
  { id: 'sayilar', label: 'Sayılar' },
  { id: 'tarih', label: 'Tarih' },
  { id: 'saat', label: 'Saat' },
  { id: 'kosoado', label: 'Bu · şu · o' },
  { id: 'tanitim', label: 'Kendini tanıt' },
]

export default function BasicsPage() {
  const [params, setParams] = useSearchParams()
  const istenen = params.get('b') as Bolum | null
  const bolum: Bolum = BOLUMLER.some((b) => b.id === istenen) ? istenen! : 'sayilar'

  return (
    <>
      <TopBar title="Temel bilgiler" sub="Sayılar, tarih, saat, bu/şu/o, kendini tanıtma" back="/calis" />

      <div className="page stack-lg lang-ja">
        <Chips items={BOLUMLER} value={bolum} onChange={(b) => setParams({ b }, { replace: true })} />
        <div className="tiny faint" style={{ marginTop: -8 }}>
          <span className="tb-star">★</span> düzensiz ya da en sık hata yapılan — önce bunları ezberle.
        </div>

        {bolum === 'sayilar' && <Sayilar />}
        {bolum === 'tarih' && <Tarih />}
        {bolum === 'saat' && <Saat />}
        {bolum === 'kosoado' && <Kosoado />}
        {bolum === 'tanitim' && <Tanitim />}
      </div>
    </>
  )
}

// ————————————————————————— Ortak parçalar —————————————————————————

function Yildiz() {
  return (
    <span className="tb-star" title="Düzensiz ya da sık hata yapılan">
      ★
    </span>
  )
}

function Bolumcuk({ baslik, alt, children }: { baslik: string; alt?: ReactNode; children: ReactNode }) {
  return (
    <section className="stack-sm">
      <h2>{baslik}</h2>
      {alt && <div className="card-sub" style={{ marginTop: -4 }}>{alt}</div>}
      {children}
    </section>
  )
}

/** Tek kelimelik satır: sayı, ay, saat… */
function Satir({
  sol,
  ja,
  kana,
  tr,
  star,
  not,
  alt,
}: {
  sol?: ReactNode
  ja: string
  kana: string
  tr?: string
  star?: boolean
  not?: string
  alt?: string
}) {
  return (
    <div className={`tb-row${star ? ' is-star' : ''}`}>
      {sol !== undefined && <span className="tb-n">{sol}</span>}
      <span className="ja tb-ja">{ja}</span>
      <span className="tb-read">
        <span className="ja tb-kana">
          {kana}
          {alt && <span className="faint"> · {alt}</span>}
        </span>
        <span className="tb-latin">
          {kanaToRomaji(kana)}
          {alt && <span className="faint"> · {kanaToRomaji(alt)}</span>}
        </span>
      </span>
      {tr && <span className="tb-tr">{tr}</span>}
      {star && <Yildiz />}
      {not && <span className="tb-not">{not}</span>}
      <span className="tb-speak">
        <SpeakBtn text={kana} lang="ja" size="sm" />
      </span>
    </div>
  )
}

/** Cümle satırı: kelime sınırlı Latin okunuşla */
function Cumle({ o }: { o: Ornek }) {
  return (
    <div className="unit-ex">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ja unit-ex-ja">{o.ja}</div>
        {o.kana !== o.ja && <div className="ja tiny faint">{o.kana}</div>}
        <div className="tiny tb-latin-line">{o.latin ?? romajiWords(o.ja, o.kana)}</div>
        <div className="small dim">{o.tr}</div>
        {o.not && <div className="tiny tb-cnot">{o.not}</div>}
      </div>
      <SpeakBtn text={o.ja} lang="ja" size="sm" reading={o.kana} />
    </div>
  )
}

function Kurallar({ list }: { list: { baslik: string; govde: string; star?: boolean }[] }) {
  return (
    <div className="stack-sm">
      {list.map((k) => (
        <div key={k.baslik} className={`card stack-sm${k.star ? ' is-star' : ''}`}>
          <div className="row" style={{ gap: 8 }}>
            <span className="card-title">{k.baslik}</span>
            {k.star && <Yildiz />}
          </div>
          <div className="small">{k.govde}</div>
        </div>
      ))}
    </div>
  )
}

const bicim = (n: number) => n.toLocaleString('tr-TR')

// ————————————————————————— Sayılar —————————————————————————

function Sayilar() {
  return (
    <div className="stack-lg">
      <Bolumcuk baslik="0 – 10" alt="Her şey bunların üstüne kurulur. Dört tanesinin iki okunuşu var.">
        <div className="tb-table">
          {TEMEL_SAYILAR.map((s) => (
            <Satir key={s.n} sol={s.n} ja={s.kanji} kana={s.kana} alt={s.alt} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Kurallar">
        <Kurallar list={SAYI_KURALLARI} />
      </Bolumcuk>

      <Bolumcuk
        baslik="0 – 100 tam liste"
        alt="11–99 arası hep aynı kurala uyar: onluk + birlik. Ses düğmesiyle dinleyebilirsin."
      >
        <div className="tb-grid">
          {SIFIR_YUZ.map((s) => (
            <SayiHucre key={s.n} n={s.n} kanji={s.kanji} kana={s.kana} star={s.star} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Yüzler" alt="Üç tanesinde ses değişiyor.">
        <div className="tb-table">
          {YUZLER.map((s) => (
            <Satir key={s.n} sol={bicim(s.n)} ja={s.kanji} kana={s.kana} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Binler">
        <div className="tb-table">
          {BINLER.map((s) => (
            <Satir key={s.n} sol={bicim(s.n)} ja={s.kanji} kana={s.kana} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="万 ve 億 — dörtlü basamaklar" alt="Türkçede olmayan birim: 万 = on bin. “Yüz bin” Japoncada “on on-bin”dir.">
        <div className="tb-table">
          {BUYUK_BIRIMLER.map((s) => (
            <Satir key={s.n} sol={bicim(s.n)} ja={s.kanji} kana={s.kana} tr={s.tr} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Büyük sayılar nasıl okunur" alt="Sağdan dörder basamak ayrılır; her öbek 0–9999 gibi okunup arkasına birimi eklenir.">
        <div className="stack-sm">
          {SAYI_ORNEKLERI.map((n) => (
            <SayiAcilim key={n} n={n} />
          ))}
        </div>
      </Bolumcuk>

      <SayiAraci />
    </div>
  )
}

function SayiHucre({ n, kanji, kana, star }: { n: number; kanji: string; kana: string; star?: boolean }) {
  return (
    <div className={`tb-cell${star ? ' is-star' : ''}`}>
      <div className="row" style={{ gap: 4 }}>
        <span className="tb-cell-n">{n}</span>
        <span className="ja faint tiny">{kanji}</span>
        <span className="spacer" />
        {star && <Yildiz />}
      </div>
      <div className="ja tb-cell-kana">{kana}</div>
      <div className="row" style={{ gap: 4 }}>
        <span className="tb-latin" style={{ flex: 1 }}>
          {kanaToRomaji(kana)}
        </span>
        <SpeakBtn text={kana} lang="ja" size="sm" />
      </div>
    </div>
  )
}

/** Bir sayının öbek öbek açılımı: 123456 → 12万 | 3456 */
function SayiAcilim({ n }: { n: number }) {
  const parcalar = sayiParcalari(n)
  const kana = sayiKana(n)
  return (
    <div className="card stack-sm">
      <div className="row" style={{ gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span className="tb-big-n">{bicim(n)}</span>
        <span className="ja faint">{sayiKanji(n)}</span>
        <span className="spacer" />
        <SpeakBtn text={kana} lang="ja" size="sm" />
      </div>
      <div className="tb-parts">
        {parcalar.map((p, i) => (
          <span key={i} className="tb-part">
            <span className="tb-part-n">
              {p.rakam}
              {p.birim && <b className="ja">{p.birim}</b>}
            </span>
            <span className="ja tb-part-kana">{p.kana}</span>
          </span>
        ))}
      </div>
      <div className="small">
        <span className="ja">{kana}</span>
        <div className="tb-latin">{sayiBasamaklari(n).map(kanaToRomaji).join(' ')}</div>
      </div>
    </div>
  )
}

function SayiAraci() {
  const [yazi, setYazi] = useState('2026')
  const temiz = yazi.replace(/[.\s,]/g, '')
  const n = /^\d+$/.test(temiz) ? Number(temiz) : null
  const gecerli = n !== null && n <= SAYI_UST_SINIR

  return (
    <div className="card card--pad-lg stack-sm card--accent">
      <div className="card-title">Sayı yaz, okunuşunu gör</div>
      <div className="card-sub">Fiyat, yıl, telefon kodu — aklına gelen herhangi bir sayı (en çok 12 basamak).</div>
      <input
        className="field tb-input"
        inputMode="numeric"
        value={yazi}
        onChange={(e) => setYazi(e.target.value)}
        placeholder="ör. 123456"
        aria-label="Sayı"
      />
      {gecerli ? (
        <SayiAcilim n={n!} />
      ) : (
        yazi.trim() !== '' && <div className="tiny faint">Yalnızca rakam yaz; nokta ve boşluk olabilir.</div>
      )}
    </div>
  )
}

// ————————————————————————— Tarih —————————————————————————

function Tarih() {
  return (
    <div className="stack-lg">
      <Bolumcuk
        baslik="Aylar"
        alt={
          <>
            Doğru biliyorsun: sayı + <span className="ja">月</span> (がつ). Ama üç istisnası var — hepsi saatteki 4, 7, 9 ile
            aynı.
          </>
        }
      >
        <div className="tb-table">
          {AYLAR.map((a, i) => (
            <Satir key={a.ja} sol={i + 1} ja={a.ja} kana={a.kana} tr={a.tr} star={a.star} not={a.not} />
          ))}
        </div>
        <div className="tiny faint">
          Dikkat: ay ADI ile ay SÜRESİ farklı. 一月 いちがつ = Ocak, ama “bir ay (boyunca)” = 一か月 いっかげつ.
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Haftanın günleri" alt="Hepsi 〜曜日 (ようび) ile biter. Baştaki kanji bir doğa unsuru — ezberi kolaylaştırır.">
        <div className="tb-table">
          {HAFTA.map((h) => (
            <Satir key={h.ja} sol={h.anlam} ja={h.ja} kana={h.kana} tr={h.tr} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk
        baslik="Ayın günleri"
        alt="Asıl zor kısım burası. 1–10 tamamen düzensiz; 11’den sonra sayı + にち, ama 14, 17, 19, 20, 24, 27, 29 yine farklı."
      >
        <div className="tb-grid tb-grid--days">
          {AYIN_GUNLERI.map((g) => (
            <div key={g.n} className={`tb-cell${g.star ? ' is-star' : ''}`}>
              <div className="row" style={{ gap: 4 }}>
                <span className="tb-cell-n">{g.n}</span>
                <span className="ja faint tiny">{g.ja}</span>
                <span className="spacer" />
                {g.star && <Yildiz />}
              </div>
              <div className="ja tb-cell-kana">{g.kana}</div>
              <div className="row" style={{ gap: 4 }}>
                <span className="tb-latin" style={{ flex: 1 }}>
                  {kanaToRomaji(g.kana)}
                </span>
                <SpeakBtn text={g.kana} lang="ja" size="sm" />
              </div>
              {g.not && <div className="tiny faint">{g.not}</div>}
            </div>
          ))}
        </div>
        <div className="tiny faint">
          1–10’u ayrıca “kaç gün (süre)” için de kullanırsın: 三日 みっか = hem “ayın 3’ü” hem “üç gün”. Tek fark 1: ついたち
          yalnızca ayın biri, “bir gün” 一日 いちにち.
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Bugünden bakınca" alt="Günlük konuşmada tarihten çok bunlar geçer.">
        {GORELI_ZAMAN.map((g) => (
          <div key={g.grup} className="stack-sm">
            <div className="tb-sub">{g.grup}</div>
            <div className="tb-table">
              {g.satirlar.map((s) => (
                <Satir key={s.ja} ja={s.ja} kana={s.kana} tr={s.tr} star={s.star} not={s.not} />
              ))}
            </div>
          </div>
        ))}
      </Bolumcuk>

      <Bolumcuk baslik="Tarih söylemek" alt="Sıra Türkçenin tersi: yıl → ay → gün → haftanın günü.">
        <div className="stack-sm">
          {TARIH_ORNEKLERI.map((o) => (
            <Cumle key={o.ja} o={o} />
          ))}
        </div>
      </Bolumcuk>
    </div>
  )
}

// ————————————————————————— Saat —————————————————————————

function Saat() {
  return (
    <div className="stack-lg">
      <Bolumcuk baslik="Saatler (1 – 12)" alt="Sayı + 時 (じ). Üç istisna: 4, 7, 9.">
        <div className="tb-table">
          {SAATLER.map((s) => (
            <Satir key={s.n} sol={s.n} ja={s.ja} kana={s.kana} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="24 saatlik sistem (13 – 24)" alt="Tren, otobüs, dükkân saatlerinde. Aynı kural devam eder.">
        <div className="tb-table">
          {SAATLER_24.map((s) => (
            <Satir key={s.n} sol={s.n} ja={s.ja} kana={s.kana} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Dakikalar" alt="ふん ya da ぷん — hangisi olduğunu birler basamağı belirler.">
        <div className="tb-table">
          {DAKIKALAR.map((s) => (
            <Satir key={s.n} sol={s.n} ja={s.ja} kana={s.kana} star={s.star} not={s.not} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Kurallar: buçuk, çeyrek, kala, öğleden önce">
        <Kurallar list={SAAT_KURALLARI} />
      </Bolumcuk>

      <Bolumcuk baslik="Örnek saatler" alt="Her birinin iki söylenişi: 24’lü sistem ve 午前/午後 ile.">
        <div className="stack-sm">
          {SAAT_ORNEKLERI.map(([h, m, tr]) => (
            <SaatKart key={`${h}:${m}`} h={h} m={m} tr={tr} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Cümle içinde">
        <div className="stack-sm">
          {SAAT_CUMLELERI.map((o) => (
            <Cumle key={o.ja} o={o} />
          ))}
        </div>
      </Bolumcuk>

      <SaatAraci />
    </div>
  )
}

const iki = (n: number) => String(n).padStart(2, '0')

function SaatKart({ h, m, tr }: { h: number; m: number; tr?: string }) {
  const s24 = saat24(h, m)
  const s12 = saat12(h, m)
  return (
    <div className="card stack-sm">
      <div className="row" style={{ gap: 10, alignItems: 'baseline' }}>
        <span className="tb-big-n">
          {iki(h)}:{iki(m)}
        </span>
        {tr && <span className="small dim">{tr}</span>}
      </div>
      <div className="tb-clock">
        <div>
          <div className="tb-sub">24 saat</div>
          <div className="ja tb-clock-ja">{s24.ja}</div>
          <div className="ja tiny faint">{s24.kana}</div>
          <div className="tb-latin">{kanaToRomaji(s24.kana)}</div>
        </div>
        <SpeakBtn text={s24.kana} lang="ja" size="sm" />
      </div>
      <div className="tb-clock">
        <div>
          <div className="tb-sub">午前 / 午後</div>
          <div className="ja tb-clock-ja">{s12.ja}</div>
          <div className="ja tiny faint">{s12.kana}</div>
          <div className="tb-latin">{kanaToRomaji(s12.kana)}</div>
        </div>
        <SpeakBtn text={s12.kana} lang="ja" size="sm" />
      </div>
      {h === 12 && m === 0 && (
        <div className="tiny faint">
          Öğlen 12 resmî dilde 午後零時; konuşurken çoğunlukla 昼の十二時 (ひるのじゅうにじ) denir.
        </div>
      )}
      {m === 45 && (
        <div className="tiny faint">
          “Çeyrek var” diye de söylenebilir: {(h + 1) % 24}時15分前 ({kanaToRomaji(saat24((h + 1) % 24, 15).kana)} mae).
        </div>
      )}
    </div>
  )
}

function SaatAraci() {
  const [deger, setDeger] = useState('15:30')
  const [h, m] = deger.split(':').map(Number)
  const gecerli = Number.isFinite(h) && Number.isFinite(m)
  return (
    <div className="card card--pad-lg stack-sm card--accent">
      <div className="card-title">Saat seç, okunuşunu gör</div>
      <input
        type="time"
        className="field tb-input"
        value={deger}
        onChange={(e) => setDeger(e.target.value)}
        aria-label="Saat"
      />
      {gecerli && <SaatKart h={h} m={m} />}
    </div>
  )
}

// ————————————————————————— Bu · şu · o —————————————————————————

function Kosoado() {
  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm">
        <div className="card-title">Dört ön ek, tek mantık</div>
        <div className="small">
          <b className="ja">こ</b> sana yakın · <b className="ja">そ</b> karşındakine yakın · <b className="ja">あ</b> ikinizden
          de uzak · <b className="ja">ど</b> soru. Arkasına ne geldiği, neyi gösterdiğini belirler.
        </div>
      </div>

      <Bolumcuk baslik="Tablo">
        {/* Tablo yerine ızgara: satır başlığı sütun olunca telefonda あ ve ど
            sütunları ekrandan taşıyordu. Başlık artık satırın üstünde. */}
        <div className="tb-ko">
          <div className="tb-ko-grid">
            {[
              ['こ', 'bana yakın'],
              ['そ', 'sana yakın'],
              ['あ', 'ikimize uzak'],
              ['ど', 'soru'],
            ].map(([k, t]) => (
              <div key={k} className="tb-ko-head">
                <span className="ja">{k}</span>
                <small>{t}</small>
              </div>
            ))}
          </div>
          {KOSOADO.map((r) => (
            <div key={r.ne} className="stack-sm" style={{ gap: 4 }}>
              <div className="tb-sub">{r.ne}</div>
              <div className="tb-ko-grid">
                {[r.ko, r.so, r.a, r.do].map((w) => (
                  <div key={w} className="tb-ko-cell">
                    <span className="ja tb-ko-ja">{w}</span>
                    <span className="tb-latin">{kanaToRomaji(w)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="stack-sm">
          {KOSOADO.map((r) => (
            <div key={r.ne} className="tiny">
              <b>{r.ne}:</b> <span className="dim">{r.not}</span>
            </div>
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Eşya mı, canlı mı" alt="Ayrım üç yerde çıkıyor: gösterirken, sorarken ve “var” derken.">
        <div className="tb-vs">
          <div className="card stack-sm">
            <div className="card-title">Eşya · cansız</div>
            <div className="small">
              Göster: <span className="ja">これ・それ・あれ</span>
              <br />
              Sor: <span className="ja">何</span> (nan / nani) “ne”
              <br />
              Var: <span className="ja">あります</span>
            </div>
          </div>
          <div className="card stack-sm is-star">
            <div className="row" style={{ gap: 8 }}>
              <span className="card-title">İnsan · hayvan</span>
              <Yildiz />
            </div>
            <div className="small">
              Göster: <span className="ja">この人・あの人・こちら</span> (これ değil!)
              <br />
              Sor: <span className="ja">だれ</span> “kim” · kibar <span className="ja">どなた</span>
              <br />
              Var: <span className="ja">います</span>
            </div>
          </div>
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Kurallar">
        <Kurallar list={KOSOADO_KURALLARI} />
      </Bolumcuk>

      <Bolumcuk baslik="Örnekler">
        <div className="stack-sm">
          {KOSOADO_ORNEKLERI.map((o) => (
            <Cumle key={o.ja} o={o} />
          ))}
        </div>
      </Bolumcuk>
    </div>
  )
}

// ————————————————————————— Kendini tanıt —————————————————————————

function Tanitim() {
  return (
    <div className="stack-lg">
      <div className="card card--pad-lg stack-sm is-star">
        <div className="row" style={{ gap: 8 }}>
          <span className="card-title">Her cümleye 私は (watashi wa) koymalı mıyım?</span>
          <Yildiz />
        </div>
        <div className="small">
          <b>Hayır.</b> Bir kez söyle — ya da hiç söyleme — sonra bırak. Türkçede de “Ben Efe. Ben 22 yaşındayım. Ben
          öğrenciyim.” demezsin; “Ben Efe, 22 yaşındayım, öğrenciyim” dersin. Japonca aynı: kimden bahsettiğin belliyse
          özne düşer. Her cümleye <span className="ja">私は</span> koymak kulağa ısrarcı ve yabancı gelir.
        </div>
        <div className="small">
          <b>Ne zaman kullanılır:</b> başkasıyla karşılaştırırken (<span className="ja">私は学生です。兄は会社員です。</span>{' '}
          “Ben öğrenciyim, abim çalışıyor”) ya da “kim?” sorusuna cevap verirken.
        </div>
        <div className="tiny faint">
          <span className="ja">私</span> (わたし) herkes için güvenli ve kibar. Erkekler arkadaş arasında{' '}
          <span className="ja">ぼく</span> da der; şimdilik わたし yeter.
        </div>
      </div>

      <Bolumcuk baslik="Kısa tanıtım" alt="Yeni biriyle tanışınca bu üç cümle yeter.">
        <div className="stack-sm">
          {TANITIM_KISA.map((o) => (
            <Cumle key={o.ja} o={o} />
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Uzun tanıtım" alt="私は yalnızca ikinci cümlede — sonra hiç tekrar edilmiyor.">
        <div className="stack-sm">
          {TANITIM_UZUN.map((o) => (
            <Cumle key={o.ja} o={o} />
          ))}
        </div>
      </Bolumcuk>

      <div className="card stack-sm is-star">
        <div className="row" style={{ gap: 8 }}>
          <span className="card-title">Sık yapılan iki hata</span>
          <Yildiz />
        </div>
        <div className="small">
          <b>namai</b> değil <b>namae</b> — <span className="ja">なまえ</span>: 私の名前はエフェです (watashi no namae wa Efe
          desu).
        </div>
        <div className="small">
          <b>watashi no daigakusei desu</b> yanlış: <span className="ja">の</span> “-in” demek; bu cümle “benim üniversite
          öğrencisi” olur. Doğrusu <span className="ja">大学生です</span> (daigakusei desu) ya da{' '}
          <span className="ja">私は大学生です</span>. の ancak iki ismi bağlarken gelir:{' '}
          <span className="ja">イスタンブール大学の学生です</span> “İstanbul Üniversitesi’nin öğrencisiyim”.
        </div>
      </div>

      <Bolumcuk baslik="Kendi bilgini koy" alt="〇〇 yerine kendi bilgini yaz. Seçeneklerin hepsi doğru cümleler.">
        <div className="stack-sm">
          {TANITIM_KALIPLARI.map((k) => (
            <div key={k.kalip} className="card stack-sm">
              <div className="row" style={{ gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span className="ja tb-kalip">{k.kalip}</span>
                <span className="small dim">{k.tr}</span>
              </div>
              {k.secenekler.map((s) => (
                <Cumle key={s.ja} o={s} />
              ))}
            </div>
          ))}
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Yaş" alt="Sayı + 歳 (さい). 1, 8, 10 ile bitenlerde ses değişir; 20 bambaşka bir kelime.">
        <div className="tb-table">
          {YASLAR.map((y) => (
            <Satir key={y.n} sol={y.n} ja={y.ja} kana={y.kana} star={y.star} not={y.not} />
          ))}
        </div>
        <div className="tiny faint">
          Soru: 何歳ですか (なんさいですか). Daha kibarı: おいくつですか.
        </div>
      </Bolumcuk>

      <Bolumcuk baslik="Sana sorulacaklar" alt="Tanışınca en sık duyacağın altı soru ve cevabı.">
        <div className="stack-sm">
          {TANITIM_SORULARI.map(({ soru, cevap }) => (
            <div key={soru.ja} className="card stack-sm">
              <Cumle o={soru} />
              <Cumle o={cevap} />
            </div>
          ))}
        </div>
      </Bolumcuk>
    </div>
  )
}
