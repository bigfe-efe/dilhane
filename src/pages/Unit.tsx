import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ExerciseRunner } from '@/components/ExerciseRunner'
import { UNIT_BY_ID, unitKanji, type Unit, type UnitGrammar, type UnitVocab } from '@/content/ja/units'
import { cumledekiKelime, kelimeOrnegi } from '@/content/ja/units/kelime-ornekleri'
import { CHOUKAI, MONDAI, karisikKopya, type ChoukaiQ, type MockQ } from '@/content/ja/n5-mock'
import { ChoukaiMetin, ChoukaiPlayer, MockPrompt, SecenekListesi } from '@/components/N5Soru'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import { kanjiBilgi } from '@/content/ja/kanji-ek'
import { JaOkunus } from '@/components/JaOkunus'
import { KelimeKanjileri, KelimeKirilimi } from '@/components/KanjiParcalari'
import { kanaToRomaji } from '@/lib/ja-phonetic'
import { yeniKelimeler } from '@/lib/yeni-kelime'
import { ekAlistirma, eskiSekme, genkiDersleri, kitapSayfalari, type Sayfa, type SayfaTur } from '@/content/ja/unit-kitap'
import { unitVocabIds } from '@/content'
import { cardId, db, ensureCards } from '@/db/db'
import { useUnit } from '@/db/hooks'

// Ünite sayfası — bir kitap gibi.
//
// Önceden sekmeliydi (Hedefler, Dilbilgisi, Kelime…) ve hangi sekmenin ne
// için, hangi sırayla çalışılacağı yazmıyordu. Artık sayfalar sabit bir
// sırayla okunuyor (sıra ve gerekçesi: content/ja/unit-kitap.ts), her
// sayfanın başında "bu sayfada ne yapacaksın" kutusu var, altta önceki /
// sonraki. "Sonraki"ye basmak sayfayı okundu işaretler; Bugün listesi
// kaldığın sayfayı buradan biliyor.

/** Ünite kaydını oluşturur ya da günceller — her yerde aynı varsayılanlarla. */
async function kaydet(
  unitId: string,
  patch: Partial<{ homework: string[]; pages: string[]; testBest: number; testAt: number; status: 'in-progress' | 'completed' }>,
) {
  const mevcut = await db.units.get(unitId)
  await db.units.put({
    unitId,
    status: 'in-progress',
    homework: [],
    testBest: 0,
    ...mevcut,
    ...patch,
    updated: Date.now(),
  })
}

/**
 * Ünitenin kelimelerini ve N5 kanjilerini tekrar sistemine ekler. Kelimeler
 * derslerdeki gibi iki yönlü (kelime → anlam ve anlam → kelime). Var olan
 * karta dokunmaz. Eklenen kelime + kanji sayısını döndürür.
 */
async function kelimeleriEkle(unitId: string): Promise<number> {
  const ids = unitVocabIds(unitId)
  const kelime = await ensureCards(ids.map((refId) => ({ kind: 'vocab' as const, refId, lang: 'ja' as const })))
  await ensureCards(ids.map((refId) => ({ kind: 'vocab' as const, refId, lang: 'ja' as const, reverse: true })))
  const kanji = await ensureCards(unitKanji(unitId).map((refId) => ({ kind: 'kanji' as const, refId, lang: 'ja' as const })))
  return kelime + kanji
}

const GUN_ADI: Record<Sayfa['gun'], string> = { 1: '1. gün · öğren', 2: '2. gün · kullan', 0: 'İsteğe bağlı' }

export default function UnitPage() {
  const { id } = useParams<{ id: string }>()
  const unit = id ? UNIT_BY_ID.get(id) : undefined
  // Sayfa adreste (?s=kelime): Bugün listesi kaldığın sayfayı doğrudan açsın.
  // Eski sekme adresleri (?b=gramer) karşılık gelen sayfaya düşer.
  const [params, setParams] = useSearchParams()
  const prog = useUnit(id)
  const [icindekiler, setIcindekiler] = useState(false)

  if (!unit) {
    return (
      <>
        <TopBar title="Ünite bulunamadı" back="/uniteler" />
        <div className="page">
          <Link to="/uniteler" className="btn btn--block">
            Ünitelere dön
          </Link>
        </div>
      </>
    )
  }

  const sayfalar = kitapSayfalari(unit)
  const istenen = params.get('s') ?? eskiSekme(params.get('b'))
  const idx = Math.max(0, sayfalar.findIndex((p) => p.id === istenen))
  const sayfa = sayfalar[idx]
  const sonrakiSayfa = sayfalar[idx + 1]
  const okunan = new Set(prog?.pages ?? [])

  const git = (i: number) => {
    setParams({ s: sayfalar[i].id }, { replace: true })
    window.scrollTo(0, 0)
  }
  const okundu = () => kaydet(unit.id, { pages: [...new Set([...okunan, sayfa.id])] })

  const gunBitti = sayfa.gun === 1 && sonrakiSayfa?.gun === 2

  return (
    <>
      <TopBar title={`${unit.no}. ${unit.title}`} sub={unit.subtitle} back="/uniteler" />

      <div className="page stack-lg lang-ja">
        {/* Kitabın başlığı: hangi sayfadasın, kaçıncı gün, ilerleme çizgisi */}
        <div className="kitap-bas">
          <button className="kitap-baslik" onClick={() => setIcindekiler(true)} aria-label="İçindekiler">
            <span className="tiny faint kitap-ust">
              Sayfa {idx + 1} / {sayfalar.length} · {GUN_ADI[sayfa.gun]}
            </span>
            <span className="kitap-sayfa-adi">
              {sayfa.tur === 'gramer' ? <span className="faint">Dilbilgisi · </span> : null}
              {sayfa.baslik}
            </span>
            <span className="kitap-icindekiler tiny">
              İçindekiler <Icon name="down" size={12} />
            </span>
          </button>
          <div className="kitap-cizgi" role="list">
            {sayfalar.map((p, i) => (
              <button
                key={p.id}
                role="listitem"
                className={`kitap-nokta${i === idx ? ' is-on' : ''}${okunan.has(p.id) ? ' is-read' : ''}${p.gun === 0 ? ' is-opt' : ''}`}
                onClick={() => git(i)}
                title={p.baslik}
                aria-label={`${i + 1}. sayfa: ${p.baslik}`}
              />
            ))}
          </div>
        </div>

        <Rehber tur={sayfa.tur} />

        {sayfa.tur === 'giris' && (
          <Giris unit={unit} sayfalar={sayfalar} okunan={okunan} testBest={prog?.testBest ?? 0} git={git} />
        )}
        {sayfa.tur === 'kelime' && <Kelime unit={unit} />}
        {sayfa.tur === 'kanji' && <Kanjiler unit={unit} />}
        {sayfa.tur === 'gramer' && (
          <GramerKart unit={unit} g={unit.grammar[sayfa.gramer!]} sira={sayfa.gramer! + 1} toplam={unit.grammar.length} />
        )}
        {sayfa.tur === 'kurallar' && <Kurallar unit={unit} />}
        {sayfa.tur === 'metin' && <Metin key={unit.id} unit={unit} />}
        {sayfa.tur === 'alistirma' && <Alistirma key={unit.id} unit={unit} />}
        {sayfa.tur === 'odev' && <Odev unit={unit} yapilan={prog?.homework ?? []} />}
        {sayfa.tur === 'test' && <Test unit={unit} best={prog?.testBest ?? 0} />}
        {sayfa.tur === 'n5' && <N5Pratik key={unit.id} unit={unit} />}

        {/* Öğrenci üniteyi iki gecede çalışıyor: öğrenme günü bitince söyle */}
        {gunBitti && (
          <div className="card stack-sm kitap-gun-sonu">
            <div className="card-title">1. günün sonu</div>
            <div className="small">
              Bugünlük yeni bilgi bu kadar. Yatmadan önce kelime sayfasına bir kez göz at, deftere yazdığın kalıpları
              sesli oku. Yarın <b>{sonrakiSayfa.baslik}</b> sayfasından devam: bugün öğrendiklerini kullanacaksın.
            </div>
          </div>
        )}

        <div className="kitap-alt">
          <button className="btn" disabled={idx === 0} onClick={() => git(idx - 1)}>
            ‹ Önceki
          </button>
          {sonrakiSayfa ? (
            <button
              className="btn btn--primary kitap-sonraki"
              onClick={async () => {
                await okundu()
                git(idx + 1)
              }}
            >
              <span className="kitap-sonraki-etiket">Sonraki</span>
              <span className="kitap-sonraki-ad">{sonrakiSayfa.baslik} ›</span>
            </button>
          ) : (
            <Link to="/uniteler" className="btn btn--primary" onClick={() => void okundu()}>
              Ünitelere dön
            </Link>
          )}
        </div>
      </div>

      {icindekiler && (
        <Sheet onClose={() => setIcindekiler(false)}>
          <Icindekiler
            sayfalar={sayfalar}
            okunan={okunan}
            aktif={idx}
            git={(i) => {
              setIcindekiler(false)
              git(i)
            }}
          />
        </Sheet>
      )}
    </>
  )
}

// ————————————————————————— İçindekiler —————————————————————————

function Icindekiler({
  sayfalar,
  okunan,
  aktif,
  git,
}: {
  sayfalar: Sayfa[]
  okunan: Set<string>
  aktif: number
  git: (i: number) => void
}) {
  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>İçindekiler</h2>
      {([1, 2, 0] as const).map((gun) => {
        const liste = sayfalar.map((p, i) => ({ p, i })).filter(({ p }) => p.gun === gun)
        if (!liste.length) return null
        const dk = liste.reduce((n, { p }) => n + p.dakika, 0)
        return (
          <div key={gun} className="stack-sm">
            <div className="row tb-sub">
              <span>{GUN_ADI[gun]}</span>
              <div className="spacer" />
              {gun !== 0 && <span className="tabular">~{dk} dk</span>}
            </div>
            {liste.map(({ p, i }) => (
              <SayfaSatiri key={p.id} p={p} no={i + 1} okundu={okunan.has(p.id)} aktif={i === aktif} onClick={() => git(i)} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function SayfaSatiri({ p, no, okundu, aktif, onClick }: { p: Sayfa; no: number; okundu: boolean; aktif?: boolean; onClick: () => void }) {
  return (
    <button className={`kitap-satir${aktif ? ' is-on' : ''}${okundu ? ' is-read' : ''}`} onClick={onClick}>
      <span className="kitap-satir-no">{okundu ? <Icon name="check" size={13} /> : no}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="kitap-satir-ad">
          {p.tur === 'gramer' && <span className="faint">Dilbilgisi · </span>}
          {p.baslik}
        </span>
        {p.alt && <span className="kitap-satir-alt ja">{p.alt}</span>}
      </span>
      <span className="tiny faint tabular">{p.dakika} dk</span>
    </button>
  )
}

// ————————————————————————— Sayfa rehberi —————————————————————————
//
// Her sayfanın başında: bu sayfada ne yapacaksın, nasıl. Öğrencinin sorusu
// buydu: "dilbilgisini okuyup kelimeleri mi ezberlemeliyim, metinleri ne
// yapmalıyım". Rehber kapatılabilir; kapalılık sayfa TÜRÜNE göre hatırlanır
// (bir dilbilgisi sayfasında kapatınca hepsinde kapanır), çünkü on dört
// ünite boyunca aynı yönergeyi okumak gerekmez.

const REHBER: Record<SayfaTur, { baslik: string; adimlar: string[]; not?: string }> = {
  giris: {
    baslik: 'Bu ünite nasıl çalışılır',
    adimlar: [
      'Ünite bir kitap gibi: sayfaları sırayla oku, alttaki “Sonraki” ile ilerle. Okuduğun sayfa işaretlenir.',
      'Her sayfanın başında, bu kutu gibi, o sayfada ne yapacağın yazar.',
      'İki gecede biter: 1. gün kelime, kanji ve dilbilgisi (öğrenme); 2. gün metin, alıştırma, ödev ve test (kullanma).',
      'Ünite testinde %70 alınca ünite biter; kelimeler ve kanjiler tekrar kartlarına girer.',
    ],
  },
  kelime: {
    baslik: 'Kelimeler — ezberleme, tanı',
    adimlar: [
      'Her kelimeyi dinle (yanındaki ses düğmesi) ve iki kez sesli tekrar et.',
      'Deftere yaz: yazılışı, okunuşu, anlamı. Yıldızlı olanlar en sık kullanılanlar.',
      'Kanjili kelimede sağdaki kanjilere bak: 毎朝 = 毎 her + 朝 sabah gibi, kelimeyi parçalarından tanı. “burada” satırı kanjinin bu kelimedeki okunuşu.',
      'Kartın altındaki örnek cümleyi dinle ve sesli oku. Kelime cümlede renkli; cümle yalnızca şimdiye kadar öğrendiğin kelimelerle kurulu.',
      'Sayfanın başındaki “Tekrara ekle”ye bas. Kalıcı ezberi tekrar kartları yapar, her gün birkaç dakika.',
    ],
    not: 'Amaç bu sayfada hepsini ezberlemek değil: sonraki sayfalardaki örneklerde görünce tanıyabilmek. Kelimeler dilbilgisinden ÖNCE geliyor, örnekleri takılmadan okuyabilesin diye.',
  },
  kanji: {
    baslik: 'Kanjiler — tek tek',
    adimlar: [
      'Her kartta kanjinin kendi anlamına bak, sonra “Bu ünitede” kısmında hangi kelimelerde nasıl okunduğuna.',
      'Kanjiye dokun, çizim sırasını izle; deftere her kanjiyi 3–5 kez sırasıyla yaz.',
      'Okunuşların hepsini ezberlemeye çalışma. Bu ünitedeki kelimelerde okunduğu hâlini bil, yeter.',
    ],
  },
  gramer: {
    baslik: 'Dilbilgisi — bir kalıp, bir sayfa',
    adimlar: [
      'Açıklamayı oku. “Kalıp” kutusu konunun özeti: onu deftere yaz.',
      'Örnekleri dinle ve sesli oku. Önce Türkçesine bakmadan anlamaya çalış.',
      '“Dikkat” kutusu en sık yapılan hata; onu da not al.',
      'Kalıpla kendi hayatından iki cümle kur, deftere yaz. (Ödev sayfasında bunu tekrar yapacaksın.)',
    ],
    not: 'Bir örnekte “Henüz görmediğin” kutusu çıkarsa: o kelime ileriki bir ünitenin. Anlamı orada yazıyor; şimdi ezberlemen gerekmiyor.',
  },
  kurallar: {
    baslik: 'Kurallar',
    adimlar: ['Kısa kuralları oku.', '★ olanları deftere yaz: bunlar sınavda ya da konuşmada doğrudan hata kaynağı.'],
  },
  metin: {
    baslik: 'Okuma metni — öğrendiklerin bir arada',
    adimlar: [
      'Türkçe kapalıyken metni bir kez baştan sona dinle (üstteki ▶).',
      'Satır satır sesli oku. Takıldığın satırda Türkçeyi aç, sonra tekrar kapat.',
      'İkinci okumada Latin’i kapat, kanadan oku. Üçüncüde kanayı da kapat.',
      'Metin sorularını çöz.',
    ],
    not: 'Metni ezberlemen gerekmiyor. Her kelimeyi anlamasan da genel anlamı yakala: sınavın okuma bölümü de bunu ister.',
  },
  alistirma: {
    baslik: 'Alıştırma — test öncesi ısınma',
    adimlar: [
      'Bu ünitede öğrendiklerinle çözülebilen yapı ve cümle soruları.',
      'Yanlış yaptığın soruda açıklamayı oku; gerekirse ilgili dilbilgisi sayfasına dön (İçindekiler).',
    ],
    not: 'Sorular Genki I sırasındaki derslerden alındı. Genki’yi ayrıca çalışman gerekmiyor: o derslerin bu üniteye uyan alıştırmaları burada.',
  },
  odev: {
    baslik: 'Ödev — kâğıt üstünde',
    adimlar: [
      'Her ödevi deftere yap. “Nasıl yapılır” adımlarını sırayla izle; örnek sana biçimi gösterir.',
      'Bitirince soldaki kutuyu işaretle.',
      'Takılırsan İçindekiler’den ilgili dilbilgisi sayfasına dön.',
    ],
  },
  test: {
    baslik: 'Ünite testi',
    adimlar: [
      'Kitaba bakmadan çöz.',
      '%70 ve üstü: ünite biter, kelimeler ve kanjiler tekrar kartlarına girer.',
      'Altında kalırsan yanlış yaptığın konuların dilbilgisi sayfalarını tekrar oku, sonra yeniden dene.',
    ],
  },
  n5: {
    baslik: 'N5 soruları — isteğe bağlı',
    adimlar: [
      'Üniteyi bitirmek için gerekmez; test yeterli.',
      'Bu ünitenin konusu gerçek sınavın biçiminde: tamamen Japonca, dört şık, dinleme.',
      'Önerim: üniteyi bitirdiğin günün ertesinde ısınma olarak çöz.',
    ],
  },
}

const REHBER_ANAHTAR = 'unite-rehber-kapali'

function Rehber({ tur }: { tur: SayfaTur }) {
  const [kapali, setKapali] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(REHBER_ANAHTAR) ?? '[]')
    } catch {
      return []
    }
  })
  const r = REHBER[tur]
  const acik = !kapali.includes(tur)
  const cevir = () => {
    const yeni = acik ? [...kapali, tur] : kapali.filter((t) => t !== tur)
    setKapali(yeni)
    try {
      localStorage.setItem(REHBER_ANAHTAR, JSON.stringify(yeni))
    } catch {
      /* depolama kapalı: yalnızca bu oturumda hatırlanır */
    }
  }
  return (
    <div className={`kitap-rehber${acik ? '' : ' is-kapali'}`}>
      <button className="kitap-rehber-bas" onClick={cevir} aria-expanded={acik}>
        <Icon name="bulb" size={16} />
        <span style={{ flex: 1 }}>
          <span className="kitap-rehber-etiket">Bu sayfada</span> {r.baslik}
        </span>
        <span className="tiny faint">{acik ? 'Gizle' : 'Göster'}</span>
      </button>
      {acik && (
        <>
          <ol className="kitap-rehber-adim">
            {r.adimlar.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          {r.not && <div className="kitap-rehber-not">{r.not}</div>}
        </>
      )}
    </div>
  )
}

// ————————————————————————— Başlarken —————————————————————————

function Giris({
  unit,
  sayfalar,
  okunan,
  testBest,
  git,
}: {
  unit: Unit
  sayfalar: Sayfa[]
  okunan: Set<string>
  testBest: number
  git: (i: number) => void
}) {
  const genki = genkiDersleri(unit)
  const kaldigin = okunan.size ? sayfalar.findIndex((p) => p.gun !== 0 && !okunan.has(p.id)) : -1

  const onemli = [
    ...unit.grammar.filter((g) => g.star).map((g) => ({ baslik: g.title, nerede: 'Dilbilgisi' })),
    ...(unit.rules ?? []).filter((r) => r.star).map((r) => ({ baslik: r.title, nerede: 'Kurallar' })),
    ...unit.homework.filter((h) => h.star).map((h) => ({ baslik: h.title, nerede: 'Ödev' })),
  ]

  return (
    <div className="stack">
      {kaldigin > 0 && (
        <button className="card card--link row kitap-devam" onClick={() => git(kaldigin)}>
          <Icon name="play" size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>
            <span className="tiny faint">Kaldığın yer</span>
            <br />
            <b>{sayfalar[kaldigin].baslik}</b>
          </span>
          <Icon name="right" size={16} />
        </button>
      )}

      <div className="card stack-sm">
        <div className="card-title">Bu ünitede ne öğreneceksin</div>
        <ul className="tight small">
          {unit.canDo.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="tiny faint">
          {unit.grammar.length} dilbilgisi konusu · {unit.vocab.length} kelime · {unitKanji(unit.id).length} kanji
          {testBest > 0 && ` · en iyi test sonucun %${testBest}`}
        </div>
      </div>

      {/* Planın kendisi: hangi gün hangi sayfalar, kaç dakika */}
      <div className="stack-sm">
        <h2 style={{ margin: 0 }}>Plan</h2>
        {([1, 2, 0] as const).map((gun) => {
          const liste = sayfalar.map((p, i) => ({ p, i })).filter(({ p }) => p.gun === gun)
          if (!liste.length) return null
          return (
            <div key={gun} className="card stack-sm">
              <div className="row">
                <span className="card-title">{GUN_ADI[gun]}</span>
                <div className="spacer" />
                {gun !== 0 && <span className="tiny faint tabular">~{liste.reduce((n, { p }) => n + p.dakika, 0)} dk</span>}
              </div>
              {liste.map(({ p, i }) => (
                <SayfaSatiri key={p.id} p={p} no={i + 1} okundu={okunan.has(p.id)} onClick={() => git(i)} />
              ))}
            </div>
          )
        })}
      </div>

      {/*
        Yıldızlı bilgiler tek yerde toplanıyor: kritik bilgi dilbilgisi, kural
        ve ödev sayfalarına dağılmış; "neyi kaçırmamalıyım" sorusunun cevabı
        burada, yıldızın kendisi ilgili sayfada.
      */}
      {onemli.length > 0 && (
        <div className="card card--pad-lg stack-sm is-star">
          <span className="card-title">★ Bunları atlama</span>
          <ul className="tight small">
            {onemli.map((o) => (
              <li key={o.baslik}>
                <b>{o.baslik}</b> <span className="faint">· {o.nerede}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="stack-sm">
        <h2 style={{ margin: 0 }}>Sık sorulanlar</h2>
        <SSS s="Kelimeleri ezberlemeli miyim?">
          Bu ünitede tanıyacak kadar öğren: görünce anlamını hatırla. Kalıcı ezberi tekrar kartları yapar; test geçilince
          kelimeler kendiliğinden eklenir, istersen Kelimeler sayfasından hemen de ekleyebilirsin.
        </SSS>
        <SSS s="Dilbilgisi örneklerinde tanımadığım kanji var.">
          Kelimeler ve kanjiler dilbilgisinden önce geliyor, ünitenin kendi kelimelerini orada görmüş olursun. İleriki
          bir ünitenin kelimesi geçiyorsa örneğin altında “Henüz görmediğin” kutusunda anlamıyla yazar; şimdilik
          ezberlemen gerekmez.
        </SSS>
        <SSS s="Genki dersini de yapmalı mıyım?">
          Hayır, ayrı bir iş değil. Bu ünite{' '}
          {genki.length ? (
            <>
              Genki I’in{' '}
              {genki.map((n, i) => (
                <span key={n}>
                  {i > 0 && (i === genki.length - 1 ? ' ve ' : ', ')}
                  {n === 0 ? 'selamlaşma bölümü' : `${n}. ders`}
                </span>
              ))}{' '}
              konularını kapsıyor
            </>
          ) : (
            'kendi konusunu baştan sona anlatıyor'
          )}
          ; o derslerin bu üniteye uyan alıştırmaları Alıştırma sayfasında. Kitabın varsa aynı konuyu ek kaynak olarak
          okuyabilirsin, ama ünite tek başına yeterli.
        </SSS>
        <SSS s="N5 soruları zorunlu mu?">
          Hayır. Ünite testte %70 ile biter. N5 soruları aynı konunun gerçek sınavdaki biçimi; sınav biçimine alışmak
          için ertesi gün ısınma olarak çözmen iyi olur.
        </SSS>
        <SSS s="Metni ne yapmalıyım?">
          Sesli oku ve anla; ezberleme. Önce Latin ve kana açık, sonra kapatarak üç kez. Metin, ünitede öğrendiklerinin
          gerçek bir konuşmada ya da yazıda nasıl bir araya geldiğini gösteriyor.
        </SSS>
      </div>
    </div>
  )
}

function SSS({ s, children }: { s: string; children: React.ReactNode }) {
  return (
    <details className="card kitap-sss">
      <summary>{s}</summary>
      <div className="small" style={{ marginTop: 8 }}>
        {children}
      </div>
    </details>
  )
}

// ————————————————————————— Henüz görülmemiş kelimeler —————————————————————————

/** Örnek cümlenin altında: bu üniteye kadar görülmemiş kanjili kelimeler */
function YeniKelimeler({ ja, unitId }: { ja: string; unitId: string }) {
  const ws = yeniKelimeler(ja, unitId)
  if (!ws.length) return null
  return (
    <div className="yk">
      <span className="yk-etiket">Henüz görmediğin</span>
      {ws.map((w) => (
        <span key={w.ja} className="yk-kelime">
          <b className="ja">{w.ja}</b>
          {w.kana && <span className="yk-romaji">{kanaToRomaji(w.kana)}</span>}
          <span className="yk-tr">{w.tr}</span>
        </span>
      ))}
    </div>
  )
}

// ————————————————————————— Dilbilgisi —————————————————————————

function GramerKart({ unit, g, sira, toplam }: { unit: Unit; g: UnitGrammar; sira: number; toplam: number }) {
  return (
    <div className={`card stack-sm${g.star ? ' is-star' : ''}`}>
      <div className="tiny faint">
        Konu {sira} / {toplam}
      </div>
      <div className="card-title">
        {g.title} {g.star && <Yildiz />}
      </div>
      <div className="kitap-kalip">
        <span className="kitap-kalip-etiket">Kalıp</span>
        <span className="ja">{g.pattern}</span>
      </div>
      <div className="small">{g.explain}</div>

      <div className="stack-sm" style={{ marginTop: 4 }}>
        {g.examples.map((e) => (
          <div key={e.ja} className="unit-ex">
            <div style={{ flex: 1, minWidth: 0 }}>
              <JaOkunus ja={e.ja} kana={e.kana} tr={e.tr} jaClass="unit-ex-ja" />
              <YeniKelimeler ja={e.ja} unitId={unit.id} />
            </div>
            <SpeakBtn text={e.ja} lang="ja" size="sm" reading={e.kana} />
          </div>
        ))}
      </div>

      {g.pitfall && (
        <div className="feedback feedback--bad tiny">
          <b>Dikkat: </b>
          {g.pitfall}
        </div>
      )}

      {g.ref && (
        <Link to={`/grammar/${g.ref}`} className="btn btn--sm btn--ghost" style={{ justifySelf: 'start' }}>
          Ayrıntılı anlatım
        </Link>
      )}
    </div>
  )
}

function Kurallar({ unit }: { unit: Unit }) {
  return (
    <div className="stack-sm">
      {(unit.rules ?? []).map((r) => (
        <div key={r.title} className={`card stack-sm${r.star ? ' is-star' : ''}`}>
          <div className="row" style={{ gap: 8 }}>
            <span className="card-title">{r.title}</span>
            {r.star && <Yildiz />}
          </div>
          <div className="small">{r.body}</div>
        </div>
      ))}
    </div>
  )
}

// ————————————————————————— Kelime —————————————————————————

function Kelime({ unit }: { unit: Unit }) {
  const [acik, setAcik] = useState<UnitVocab | null>(null)
  const ids = unitVocabIds(unit.id)
  const kanjiler = unitKanji(unit.id)
  const toplamKart = ids.length + kanjiler.length
  // Kaç kelime ve kanjinin kartı zaten var — düğme yalnızca eksik varsa görünür
  const kartli = useLiveQuery(
    async () =>
      (await db.cards.bulkGet([...ids.map((v) => cardId('vocab', v)), ...kanjiler.map((k) => cardId('kanji', k))])).filter(
        Boolean,
      ).length,
    [unit.id],
  )

  return (
    <div className="stack-sm">
      {/* Ünitede öğrenilen kelime tekrar edilmezse bir hafta içinde gider.
          Test geçilince kendiliğinden ekleniyor; beklemek istemeyen buradan
          ekler. */}
      {kartli !== undefined && (
        <div className="card row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Icon name="repeat" size={18} style={{ color: 'var(--accent)' }} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="small">
              {kartli >= toplamKart ? (
                <>
                  Bu ünitenin {ids.length} kelimesi ve {kanjiler.length} kanjisi tekrar listende.
                </>
              ) : (
                <>
                  {toplamKart} kelime ve kanjiden {kartli} tanesi tekrar listende.
                </>
              )}
            </div>
            <div className="tiny faint">Ünite testini geçince kelimeler ve kanjiler kendiliğinden eklenir.</div>
          </div>
          {kartli < toplamKart && (
            <button className="btn btn--sm" onClick={() => void kelimeleriEkle(unit.id)}>
              Tekrara ekle ({toplamKart - kartli})
            </button>
          )}
        </div>
      )}

      <div className="cols-2">
        {unit.vocab.map((v) => (
          <div
            key={v.ja}
            className={`card unit-vocab${v.star ? ' is-star' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => setAcik(v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setAcik(v)
              }
            }}
          >
            {/* Üstte solda kelime, sağda kanjileri tek tek; altta tam
                genişlikte örnek cümle. Ses düğmeleri yazının yanında. */}
            <div className="unit-vocab-ust">
              <div className="jo-kart unit-vocab-sol">
                <JaOkunus
                  ja={v.ja}
                  kana={v.kana}
                  tr={v.tr}
                  jaClass="unit-vocab-ja"
                  jaSonu={<Ses text={v.ja} reading={v.kana} />}
                >
                  {v.star && <Yildiz label="Çok kullanılır" />}
                  {v.note && <div className="tiny dim">{v.note}</div>}
                </JaOkunus>
              </div>
              <KelimeKanjileri ja={v.ja} kana={v.kana} />
            </div>
            <KelimeOrnegi unitId={unit.id} kelime={v.ja} />
          </div>
        ))}
      </div>
      <div className="tiny faint">Karta dokunursan kanjilerin çizim sırası açılır.</div>

      {acik && <KelimeSheet v={acik} onClose={() => setAcik(null)} />}
    </div>
  )
}

/** Yazının yanında küçük ses düğmesi; tıklaması karta geçmez (kart çizim sırasını açıyor) */
function Ses({ text, reading }: { text: string; reading: string }) {
  return (
    <span className="jo-ses" onClick={(e) => e.stopPropagation()}>
      <SpeakBtn text={text} lang="ja" size="sm" reading={reading} />
    </span>
  )
}

/**
 * Kelime kartındaki örnek cümle: kelime cümlede renkli. Cümleler yalnızca o
 * üniteye kadar görülmüş kelime ve dilbilgisiyle yazıldı (kelime-ornekleri.ts).
 * Tıklama karta geçmesin: kart çizim sırasını açıyor.
 */
function KelimeOrnegi({ unitId, kelime }: { unitId: string; kelime: string }) {
  const o = kelimeOrnegi(unitId, kelime)
  if (!o) return null
  const parca = cumledekiKelime(o.ja, kelime)
  return (
    <div className="unit-vocab-ornek" onClick={(e) => e.stopPropagation()}>
      <JaOkunus
        ja={o.ja}
        kana={o.kana}
        tr={o.tr}
        latin={o.latin}
        jaClass="unit-vocab-ornek-ja"
        vurgu={parca ? [parca] : undefined}
        jaSonu={<Ses text={o.ja} reading={o.kana} />}
      />
    </div>
  )
}

// Ünitenin N5 kanjileri — TEK TEK.
// Öğrenci kanjiyi kelimenin içinde öğreniyor (先生 = öğretmen) ama 先'yi ve
// 生'yi ayrı ayrı tanımıyordu; N5'in kanji okuma soruları ise tam bunu
// soruyor. Her kart: kanjinin kendi anlamı ve okunuşları, sonra bu
// ünitedeki kelimelerde hangi anlamı ve okunuşu taşıdığı.
function Kanjiler({ unit }: { unit: Unit }) {
  const [acik, setAcik] = useState<UnitVocab | null>(null)
  const kanjiler = unitKanji(unit.id)
  return (
    <div className="stack-sm">
      <div className="card-sub">
        Kelimeleri gördün; burada onları oluşturan kanjiler tek tek. Sınav kanjiyi tek başına da sorar: aynı 生,
        学生’de <b>sei</b>, 生まれる’da <b>u</b> okunur.
      </div>
      <div className="cols-2">
        {kanjiler.map((ch) => (
          <KanjiKart key={ch} ch={ch} unit={unit} onAc={(v) => setAcik(v)} />
        ))}
      </div>
      {acik && <KelimeSheet v={acik} onClose={() => setAcik(null)} />}
    </div>
  )
}

// ————————————————————————— Alıştırma —————————————————————————

function Alistirma({ unit }: { unit: Unit }) {
  const liste = ekAlistirma(unit.id)
  const [calisiyor, setCalisiyor] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)

  if (calisiyor) {
    return (
      <ExerciseRunner
        list={liste}
        onFinish={(c, t) => {
          setSonuc({ c, t })
          setCalisiyor(false)
        }}
        onCancel={() => setCalisiyor(false)}
      />
    )
  }

  return (
    <div className="stack">
      {sonuc && (
        <div className="card card--pad-lg center stack-sm">
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {sonuc.c} / {sonuc.t}
          </div>
          <div className="small dim">
            {sonuc.c / sonuc.t >= 0.7
              ? 'Teste hazırsın. Ödevden sonra testi çöz.'
              : 'Yanlış yaptığın konuların dilbilgisi sayfalarına bir göz at; sonra ödeve geç.'}
          </div>
        </div>
      )}
      <div className="card stack-sm">
        <div className="card-title">{liste.length} soru</div>
        <div className="card-sub">Şıklı, boşluk doldurma, sıralama ve çeviri. Sonuç kaydedilmez; ısınma içindir.</div>
      </div>
      <button className="btn btn--primary btn--block btn--lg" onClick={() => { setSonuc(null); setCalisiyor(true) }}>
        {sonuc ? 'Tekrar çöz' : 'Başla'}
      </button>
    </div>
  )
}

/** "い-きる" → "い(きる)": tireden sonrası okurigana */
const kunGoster = (k: string) => k.replace(/^-/, '…').replace(/-(.+)$/, '($1)')
const katakanadanHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

/**
 * Tek bir kanjinin kartı: anlamı, on/kun okunuşları ve bu ünitedeki
 * kelimelerde nasıl kullanıldığı. Ünitenin kelime listesinde geçmiyorsa
 * (yalnızca metinde geçiyorsa) kanjinin N5 örnek kelimeleri gösterilir.
 */
function KanjiKart({ ch, unit, onAc }: { ch: string; unit: Unit; onAc: (v: UnitVocab) => void }) {
  const k = KANJI_BY_CHAR.get(ch)
  if (!k) return null
  const uniteKelimeleri = unit.vocab.filter((v) => v.ja.includes(ch))
  const kelimeler = uniteKelimeleri.length
    ? uniteKelimeleri.slice(0, 3).map((v) => ({ ja: v.ja, kana: v.kana, tr: v.tr }))
    : k.words.slice(0, 2).map((w) => ({ ja: w.term, kana: w.reading, tr: w.tr }))

  return (
    <div className="card stack-sm kk-kart">
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <button
          className="ja kk-buyuk"
          onClick={() => onAc({ ja: ch, kana: ch, tr: k.meaningsTr.join(', ') })}
          aria-label={`${ch} çizim sırası`}
        >
          {ch}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title">{k.meaningsTr.join(', ')}</div>
          <div className="kk-okunuslar">
            {k.on.length > 0 && (
              <div>
                <span className="kk-etiket">on</span>
                {k.on.map((o, i) => (
                  <span key={o}>
                    {i > 0 && ' · '}
                    <span className="ja">{o}</span> <span className="kk-romaji">{kanaToRomaji(katakanadanHiragana(o))}</span>
                  </span>
                ))}
              </div>
            )}
            {k.kun.length > 0 && (
              <div>
                <span className="kk-etiket">kun</span>
                {k.kun.map((o, i) => (
                  <span key={o}>
                    {i > 0 && ' · '}
                    <span className="ja">{kunGoster(o)}</span>{' '}
                    <span className="kk-romaji">{kunGoster(kanaToRomaji(o.replace(/-/g, '|')).replace(/\|/g, '-'))}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="tiny faint">{k.strokes} çizgi</div>
        </div>
      </div>
      <div className="tb-sub">{uniteKelimeleri.length ? 'Bu ünitede' : 'Örnek kelimeler'}</div>
      <div className="stack-sm">
        {kelimeler.map((w) => (
          <KelimeKirilimi key={w.ja} ja={w.ja} kana={w.kana} tr={w.tr} vurgu={ch} />
        ))}
      </div>
    </div>
  )
}

/**
 * Kelimenin çizgi sırası.
 *
 * Kanjili kelimede her kanji ayrı ayrı gösterilir — 名前 tek bir çizim
 * değil, iki karakterin çizimidir ve ikisi ayrı öğrenilir. Kanjisi olmayan
 * kelimelerde (はじめまして) kana karakterlerinin çizimi gösterilir; elle
 * yazarken asıl takılınan yer orası.
 */
function KelimeSheet({ v, onClose }: { v: UnitVocab; onClose: () => void }) {
  // Bütün kanjiler (N5 dışı olanlar da: 寝, 朝…); çizim verisi yoksa bileşen kendini gizler
  const kanjiler = [...new Set([...v.ja].filter((c) => /[一-鿿]/.test(c)))]
  // Kanji yoksa kanaya düşülüyor; uzun kelimelerde ilk altı karakter yeter
  const kanalar = kanjiler.length ? [] : [...new Set([...v.kana].filter((c) => /[ぁ-ゟァ-ヿ]/.test(c)))].slice(0, 6)
  const karakterler = kanjiler.length ? kanjiler : kanalar

  return (
    <Sheet onClose={onClose}>
      <div className="stack lang-ja">
        <div className="center stack-sm jo-sheet">
          <JaOkunus ja={v.ja} kana={v.kana} tr={v.tr} jaClass="unit-sheet-word">
            {v.note && <div className="tiny dim">{v.note}</div>}
          </JaOkunus>
          <SpeakBtn text={v.ja} lang="ja" reading={v.kana} />
        </div>

        {karakterler.length === 0 ? (
          <div className="tiny faint center">Bu kelime için çizgi verisi yok.</div>
        ) : (
          karakterler.map((ch) => {
            const k = kanjiBilgi(ch)
            return (
              <div key={ch} className="stack-sm">
                <div className="row">
                  <span className="ja" style={{ fontSize: '1.8rem', width: 40, textAlign: 'center' }}>
                    {ch}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {k ? (
                      <>
                        <div className="card-title">{k.meaningsTr.join(', ')}</div>
                        <div className="tiny faint">
                          {k.on.length > 0 && (
                            <>
                              on: <span className="ja">{k.on.join('・')}</span>
                            </>
                          )}
                          {k.on.length > 0 && k.kun.length > 0 && ' · '}
                          {k.kun.length > 0 && (
                            <>
                              kun: <span className="ja">{k.kun.join('・')}</span>
                            </>
                          )}
                          {` · ${k.strokes} çizgi`}
                        </div>
                      </>
                    ) : (
                      <div className="card-title">Kana</div>
                    )}
                  </div>
                </div>
                {/* Bir kez çizer; tekrar izlemek için Oynat */}
                <StrokeOrder char={ch} height={240} autoPlay compact />
              </div>
            )
          })
        )}
      </div>
    </Sheet>
  )
}

// ————————————————————————— Metin —————————————————————————

function Metin({ unit }: { unit: Unit }) {
  const [kana, setKana] = useState(true)
  // Latin okunuş: kana henüz akıcı okunmadığında metnin sesini verir.
  // Varsayılan AÇIK — öğrenci her örnekte romaji istedi; kanayı çalışmak
  // isteyen kapatıp önce kanadan okumayı deneyebilir.
  const [latin, setLatin] = useState(true)
  const [tr, setTr] = useState(false)
  const [soru, setSoru] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)

  const t = unit.text

  if (soru) {
    return (
      <div className="stack">
        {sonuc ? (
          <div className="card card--pad-lg center stack">
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {sonuc.c} / {sonuc.t}
            </div>
            <div className="dim">Metin soruları</div>
            <button className="btn btn--block" onClick={() => { setSoru(false); setSonuc(null) }}>
              Metne dön
            </button>
          </div>
        ) : (
          <ExerciseRunner
            list={t.questions}
            onFinish={(c, n) => setSonuc({ c, t: n })}
            onCancel={() => setSoru(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="card stack-sm">
        <div className="card-title ja">{t.title}</div>
        <div className="card-sub">{t.intro}</div>
      </div>

      <div className="row-wrap">
        <button className={`btn btn--sm btn--ghost${kana ? ' is-on' : ''}`} onClick={() => setKana((k) => !k)}>
          Kana {kana ? 'açık' : 'kapalı'}
        </button>
        <button className={`btn btn--sm btn--ghost${latin ? ' is-on' : ''}`} onClick={() => setLatin((x) => !x)}>
          Latin {latin ? 'açık' : 'kapalı'}
        </button>
        <button className={`btn btn--sm btn--ghost${tr ? ' is-on' : ''}`} onClick={() => setTr((x) => !x)}>
          Türkçe {tr ? 'açık' : 'kapalı'}
        </button>
        <SpeakBtn
          text={t.lines.map((l) => l.ja).join(' ')}
          lang="ja"
          reading={t.lines.map((l) => l.kana).join(' ')}
        />
      </div>

      <div className="card stack-sm">
        {t.lines.map((l, i) => (
          <div key={i} className="unit-line">
            <SpeakBtn text={l.ja} lang="ja" size="sm" reading={l.kana} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Sıra her yerdeki gibi: yazılış → romaji → kana → Türkçe.
                  Anahtarlar yalnızca bu metinde var: okuma alıştırmasında
                  satırları tek tek gizleyebilmek için. */}
              <JaOkunus
                ja={l.ja}
                kana={l.kana}
                tr={tr ? l.tr : undefined}
                gizle={{ kana: !kana, romaji: !latin }}
                jaClass="unit-line-ja"
              />
              <YeniKelimeler ja={l.ja} unitId={unit.id} />
            </div>
          </div>
        ))}
      </div>

      <div className="tiny faint">
        Önce Türkçeyi kapatıp oku; takıldığında aç. Her kelimeyi anlamak zorunda değilsin, genel anlamı yakala.
        Latin satırında <b>wa</b>, <b>e</b>, <b>o</b> görürsen bunlar は, へ, を ekleridir — yazılışları başka,
        okunuşları böyle.
      </div>

      <button className="btn btn--primary btn--block" onClick={() => setSoru(true)}>
        Metin sorularını çöz ({t.questions.length})
      </button>
    </div>
  )
}

// ————————————————————————— Ödev —————————————————————————

function Odev({ unit, yapilan }: { unit: Unit; yapilan: string[] }) {
  const set = new Set(yapilan)

  const cevir = async (hid: string) => {
    const yeni = new Set(set)
    if (yeni.has(hid)) yeni.delete(hid)
    else yeni.add(hid)
    await kaydet(unit.id, { homework: [...yeni] })
  }

  const toplamDk = unit.homework.reduce((n, h) => n + h.minutes, 0)

  return (
    <div className="stack">
      <div className="card-sub">
        Ödevler kâğıt üstünde yapılır; uygulama yalnızca işaretini tutar. Toplam ~{toplamDk} dakika.
      </div>

      {unit.homework.map((h) => {
        const ok = set.has(h.id)
        return (
          <div key={h.id} className={`card unit-hw${ok ? ' is-done' : ''}`}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              {/* İşaret kutusu AYRI bir düğme: kartın tamamı tıklanabilir
                  olsaydı ödevi okumak için açılan her tıklama onu "yapıldı"
                  işaretlerdi. */}
              <button
                className={`unit-check${ok ? ' is-on' : ''}`}
                onClick={() => void cevir(h.id)}
                aria-pressed={ok}
                aria-label={ok ? 'Yapıldı işaretini kaldır' : 'Yapıldı olarak işaretle'}
              >
                {ok ? <Icon name="check" size={14} /> : ''}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="card-title">{h.title}</span>
                  {h.star && <Yildiz />}
                  <div className="spacer" />
                  <span className="tiny faint">{h.minutes} dk</span>
                </div>
                <div className="card-sub" style={{ marginTop: 3 }}>
                  {h.detail}
                </div>
              </div>
            </div>

            {h.steps?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">Nasıl yapılır</div>
                <ol className="unit-steps">
                  {h.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {h.example?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">Örnek</div>
                <div className="unit-hw-ex">
                  {h.example.map((e, i) => (
                    <div key={i} className="unit-hw-exline">
                      <JaOkunus ja={e.ja} kana={e.kana} tr={e.tr} jaClass="unit-hw-exja" />
                      <YeniKelimeler ja={e.ja} unitId={unit.id} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {h.tips?.length ? (
              <div className="unit-hw-block">
                <div className="unit-hw-label">İşine yarar</div>
                <ul className="unit-tips">
                  {h.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/** Atlanmaması gereken bilgiyi işaretler. */
function Yildiz({ label = 'Önemli' }: { label?: string }) {
  return (
    <span className="unit-star" title="Bu bilgi atlanmamalı">
      ★ {label}
    </span>
  )
}

// ————————————————————————— Test —————————————————————————

function Test({ unit, best }: { unit: Unit; best: number }) {
  const [calisiyor, setCalisiyor] = useState(false)
  const [sonuc, setSonuc] = useState<{ c: number; t: number } | null>(null)
  const [eklenen, setEklenen] = useState(0)

  const bitir = async (c: number, t: number) => {
    const yuzde = t ? Math.round((c / t) * 100) : 0
    const enIyi = Math.max(best, yuzde)
    setSonuc({ c, t })
    setCalisiyor(false)
    // Tamamlanma EN İYİ sonuca bakar. Önceden son denemeye bakıyordu:
    // geçilmiş bir üniteyi pekiştirmek için testi yeniden çözen biri %70'in
    // altında kalınca ünite "devam ediyor"a geri düşüyordu.
    await kaydet(unit.id, {
      testBest: enIyi,
      testAt: Date.now(),
      status: enIyi >= 70 ? 'completed' : 'in-progress',
    })
    if (yuzde >= 70) setEklenen(await kelimeleriEkle(unit.id))
  }

  if (calisiyor) {
    return <ExerciseRunner list={unit.test} onFinish={(c, t) => void bitir(c, t)} onCancel={() => setCalisiyor(false)} />
  }

  const yuzde = sonuc && sonuc.t ? Math.round((sonuc.c / sonuc.t) * 100) : null

  return (
    <div className="stack">
      {sonuc && (
        <div className="card card--pad-lg center stack">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {sonuc.c} / {sonuc.t}
          </div>
          <div className="dim">%{yuzde}</div>
          {yuzde !== null && yuzde >= 70 ? (
            <div className="feedback feedback--ok small">
              Ünite tamamlandı sayılır. Sıradaki üniteye geçebilirsin.
              {eklenen > 0 && ` Bu ünitenin ${eklenen} kelime ve kanjisi tekrar listene eklendi.`}
            </div>
          ) : (
            <div className="feedback feedback--bad small">
              %70’in altında. Dilbilgisi bölümüne dönüp yanlış yaptığın konuları bir kez daha oku, sonra tekrar dene.
            </div>
          )}
        </div>
      )}

      <div className="card stack-sm">
        <div className="card-title">Ünite testi</div>
        <div className="card-sub">
          {unit.test.length} soru: şıklı, boşluk doldurma, sıralama, çeviri ve dinleme. Ünite tamamlanmış sayılmak
          için %70 gerekiyor.
        </div>
        {best > 0 && <div className="tiny faint">En iyi sonucun %{best}</div>}
      </div>

      <button className="btn btn--primary btn--block btn--lg" onClick={() => { setSonuc(null); setCalisiyor(true) }}>
        {sonuc ? 'Tekrar çöz' : 'Teste başla'}
      </button>
    </div>
  )
}

// ————————————————————————— N5 soruları —————————————————————————

type Madde = { tur: 'okuma'; q: MockQ } | { tur: 'dinleme'; q: ChoukaiQ }

/**
 * Ünitenin konusunun gerçek N5 sınavında nasıl sorulduğu.
 *
 * NEDEN AYRI SEKME: ünite testi öğrenmeyi ölçer (Türkçe sorular, yazarak
 * cevap). Sınav ise bambaşka bir biçimde sorar: tamamen Japonca, dört şıklı,
 * altı çizili kelime, ★ sıralama, bir kez çalan ses. Biçime alışmak ayrı bir
 * beceri; sınav gününe bırakılınca puan kaybettiriyor. Buradaki sorular
 * deneme sınavının havuzunda da var.
 */
function N5Pratik({ unit }: { unit: Unit }) {
  const [liste, setListe] = useState<Madde[] | null>(null)
  const [i, setI] = useState(0)
  const [secilen, setSecilen] = useState<number | undefined>()
  const [dogru, setDogru] = useState(0)
  const [yanlislar, setYanlislar] = useState<Madde[]>([])

  const okuma = unit.n5 ?? []
  const dinleme = unit.choukai ?? []

  const basla = () => {
    setListe([
      ...okuma.map((q) => ({ tur: 'okuma' as const, q: karisikKopya(q) })),
      ...dinleme.map((q) => ({ tur: 'dinleme' as const, q: karisikKopya(q) })),
    ])
    setI(0)
    setSecilen(undefined)
    setDogru(0)
    setYanlislar([])
  }

  if (!liste) {
    const tipler = [
      ...new Set([...okuma.map((q) => `${MONDAI[q.mondai].jp} · ${MONDAI[q.mondai].title}`), ...dinleme.map((q) => `${CHOUKAI[q.mondai].jp} · ${CHOUKAI[q.mondai].title} (dinleme)`)]),
    ]
    return (
      <div className="stack">
        <div className="card stack-sm">
          <div className="card-title">Sınavda böyle sorulur</div>
          <div className="small">
            Bu ünitenin konusu, gerçek N5 sınavının soru biçiminde: tamamen Japonca, dört şıklı, altı çizili kelimeler,
            ★ ile cümle kurma ve dinleme. Ünite testi konuyu <b>öğrendin mi</b> diye bakar; burası <b>sınavda
            tanıyabilecek misin</b> diye.
          </div>
          <ul className="tight small">
            {tipler.map((t) => (
              <li key={t}>
                <span className="ja">{t}</span>
              </li>
            ))}
          </ul>
          <div className="tiny faint">
            {okuma.length} okuma + {dinleme.length} dinleme sorusu. Aynı sorular deneme sınavının havuzunda da var.
          </div>
        </div>
        <button className="btn btn--primary btn--block btn--lg" onClick={basla} disabled={okuma.length + dinleme.length === 0}>
          Başla
        </button>
      </div>
    )
  }

  if (i >= liste.length) {
    return (
      <div className="stack">
        <div className="card card--pad-lg center stack">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {dogru} / {liste.length}
          </div>
          <div className="dim">N5 biçimindeki sorular</div>
        </div>
        {yanlislar.length > 0 && (
          <div className="stack-sm">
            <h2>Kaçırdıkların</h2>
            {yanlislar.map((m) => (
              <div key={m.q.id} className="card stack-sm">
                {m.tur === 'okuma' ? <MockPrompt text={m.q.prompt} /> : <ChoukaiMetin q={m.q} />}
                <div className="tiny">
                  <span className="faint">doğrusu: </span>
                  <b className="ja" style={{ color: 'var(--ok)' }}>
                    {m.q.options[m.q.answer]}
                  </b>
                </div>
                <div className="exam-explain">{m.q.explain}</div>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn--primary btn--block" onClick={basla}>
          Tekrar çöz
        </button>
      </div>
    )
  }

  const m = liste[i]
  const bilgi = m.tur === 'okuma' ? MONDAI[m.q.mondai] : CHOUKAI[m.q.mondai]
  const cevaplandi = secilen !== undefined

  const sec = (k: number) => {
    if (cevaplandi) return
    setSecilen(k)
    if (k === m.q.answer) setDogru((d) => d + 1)
    else setYanlislar((y) => [...y, m])
  }

  return (
    <div className="stack">
      <div className="row tiny faint">
        <span>
          {m.tur === 'dinleme' ? 'Dinleme · ' : ''}
          {bilgi.title} <span className="ja">{bilgi.jp}</span>
        </span>
        <div className="spacer" />
        <span className="tabular">
          {i + 1} / {liste.length}
        </span>
      </div>
      <div className="tiny dim">{bilgi.howto}</div>

      {m.tur === 'okuma' ? <MockPrompt text={m.q.prompt} /> : <ChoukaiPlayer key={m.q.id} q={m.q} />}
      <SecenekListesi q={m.q} secili={secilen} onSec={sec} acik={cevaplandi} />

      {cevaplandi && (
        <div className={`feedback ${secilen === m.q.answer ? 'feedback--ok' : 'feedback--bad'} stack-sm`}>
          <div>
            <b>{secilen === m.q.answer ? 'Doğru.' : 'Doğrusu:'}</b> <span className="ja n5-dogru">{m.q.options[m.q.answer]}</span>
          </div>
          {m.tur === 'okuma' && m.q.fullSentence && <div className="ja small">Tam cümle: {m.q.fullSentence}</div>}
          {m.tur === 'dinleme' && <ChoukaiMetin q={m.q} />}
          <div className="n5-aciklama">{m.q.explain}</div>
        </div>
      )}

      {cevaplandi && (
        <button
          className="btn btn--primary btn--block"
          onClick={() => {
            setI(i + 1)
            setSecilen(undefined)
          }}
        >
          {i + 1 >= liste.length ? 'Sonucu gör' : 'Sonraki'}
        </button>
      )}
    </div>
  )
}
