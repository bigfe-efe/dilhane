import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { useCardStates, useExamDate, useExams, useUnitProgress } from '@/db/hooks'
import { setSetting } from '@/db/db'
import { GRAMMAR_JA } from '@/content/ja/grammar'
import { VOCAB } from '@/content'
import { KANJI_N5 } from '@/content/ja/kanji-n5'
import { HIRAGANA, KATAKANA } from '@/content/ja/kana'
import { UNITS } from '@/content/ja/units'
import { EXAM_DATE_KEY, daysUntilExam } from '@/content/ja/study-plan'
import {
  N5_SCOPE,
  N5_SCORING,
  N5_SECTIONS,
  N5_TOTAL_MAX,
  N5_TOTAL_PASS,
  daysLeftInPhase,
  phaseFor,
} from '@/content/ja/n5-prep'

// N5 sınav hazırlığı.
//
// Bu sayfa bir tanıtım sayfası değil, SINAV ADAYININ panosu. Üç soruya cevap
// verir, bu sırayla:
//   1. Kaç gün kaldı ve bu dönemde ne yapmalıyım?   (faz planı)
//   2. Müfredatın neresindeyim?                      (canlı ilerleme)
//   3. Sınav nasıl işliyor, neyle ölçülüyorum?       (yapı ve barajlar)
//
// Sayılar canlı verilerden gelir; elle yazılmış ilerleme yoktur.
//
// TARİH BURADA DA GİRİLEBİLİR. Ayarlar'da zaten bir alan var ama sınav adayı
// önce buraya geliyor; tarihi girmek için başka sayfaya göndermek gereksiz
// bir engel.

/** Ayarlarda saklanan biçim: YYYY-MM-DD */
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ExamDateCard({ examDate }: { examDate: Date | null }) {
  const [msg, setMsg] = useState('')
  const kaydet = async (v: string) => {
    await setSetting(EXAM_DATE_KEY, v || null)
    setMsg(v ? 'Kaydedildi — geri sayım ve haftalık tempo açıldı.' : 'Tarih silindi.')
  }

  return (
    <div className="card stack-sm">
      <div className="card-title">Sınav tarihini gir</div>
      <div className="card-sub">
        Tarih olmadan bu sayfa yalnızca ilerleme gösterebilir. Tarihi girersen geri sayım, faz planı ve
        haftalık ders temposu devreye girer.
      </div>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <input
          type="date"
          className="romaji-live-input"
          value={examDate ? toIso(examDate) : ''}
          onChange={(e) => void kaydet(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
      </div>
      {msg && <div className="tiny" style={{ color: 'var(--ok)' }}>{msg}</div>}
    </div>
  )
}

export default function N5Page() {
  const uniteKayit = useUnitProgress()
  const kana = useCardStates('kana')
  const kanji = useCardStates('kanji')
  const vocab = useCardStates('vocab')
  const examDate = useExamDate()
  const exams = useExams()

  const kalan = daysUntilExam(examDate)
  const faz = phaseFor(kalan)

  const knownKana = [...HIRAGANA, ...KATAKANA].filter((k) => kana.get(k.char)?.phase === 'review').length
  const totalKana = HIRAGANA.length + KATAKANA.length
  const knownKanji = KANJI_N5.filter((k) => kanji.get(k.char)?.phase === 'review').length
  const knownVocab = VOCAB.filter((v) => vocab.get(v.id)?.phase === 'review').length
  const grammarCount = GRAMMAR_JA.filter((g) => g.level === 'N5').length
  const bitenUnite = UNITS.filter((u) => uniteKayit.get(u.id)?.status === 'completed').length

  // Kalan ünite / kalan hafta. Son üç hafta ÇIKARILIYOR: o dönem pekiştirme ve
  // deneme için ayrılmış, oraya ünite sıkıştırmak planı baştan yanlış kurar.
  // (Önceden Genki derslerine göre hesaplanıyordu; ana yol üniteler.)
  const kalanUnite = Math.max(0, UNITS.length - bitenUnite)
  const calismaGunu = kalan === null ? null : Math.max(1, kalan - 21)
  const unitePerHafta =
    calismaGunu === null ? null : Math.max(1, Math.ceil(kalanUnite / Math.max(1, calismaGunu / 7)))

  const bars = [
    { label: 'Kana', value: knownKana, max: totalKana, note: 'Hiragana + katakana, dakuten ve yōon dahil' },
    {
      label: 'Kanji',
      value: knownKanji,
      max: KANJI_N5.length,
      note: `N5'te ~${N5_SCOPE.kanji} kanji beklenir`,
    },
    {
      label: 'Kelime',
      value: knownVocab,
      max: VOCAB.length,
      note: `N5'te ~${N5_SCOPE.vocab} kelime beklenir; buradaki çekirdek kadro`,
    },
    { label: 'Ünite', value: bitenUnite, max: UNITS.length, note: 'Testi %70 ile geçilen ünite sayısı' },
  ]

  const overall = Math.round(
    (bars.reduce((n, b) => n + (b.max ? b.value / b.max : 0), 0) / bars.length) * 100,
  )

  const denemeler = exams.filter((e) => e.kind === 'n5-deneme')
  const resmi = exams.filter((e) => e.kind === 'n5-resmi')
  const sonDeneme = denemeler[0]

  return (
    <>
      <TopBar title="N5 hazırlığı" sub="JLPT'nin ilk basamağı" back="/more" />

      <div className="page stack-lg lang-ja">
        {/* ————— Geri sayım ve faz ————— */}
        {kalan !== null && kalan >= 0 && faz ? (
          <div className="card card--pad-lg stack">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="stack-sm" style={{ gap: 2, flex: 1 }}>
                <div className="card-title">{faz.title} dönemi</div>
                <div className="card-sub">{faz.focus}</div>
              </div>
              <div className="center" style={{ flex: 'none' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }} className="tabular">
                  {kalan}
                </div>
                <div className="tiny faint">gün kaldı</div>
              </div>
            </div>

            <div className="tiny faint">
              {examDate!.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                weekday: 'long',
              })}
              {daysLeftInPhase(kalan, faz) > 0 && ` · bu dönem ${daysLeftInPhase(kalan, faz)} gün sürüyor`}
            </div>

            <div className="stack-sm">
              {faz.todo.map((t) => (
                <div key={t} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', flex: 'none' }}>·</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {faz.avoid && (
              <div className="feedback feedback--bad small">
                <b>Yapma: </b>
                {faz.avoid}
              </div>
            )}

            {unitePerHafta !== null && kalanUnite > 0 && (
              <div className="feedback feedback--info small">
                <b>Tempo: </b>
                {kalanUnite} ünite kaldı. Son üç haftayı pekiştirmeye ayırmak için{' '}
                <b>haftada {unitePerHafta} ünite</b> bitirmen gerekiyor.
              </div>
            )}
          </div>
        ) : (
          <ExamDateCard examDate={examDate} />
        )}

        {/* ————— Resmî örnek sınav ————— */}
        <Link to="/resmi-sinav" className="card card--link">
          <div className="row">
            <span className="entry-icon">
              <Icon name="book" size={18} />
            </span>
            <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
              <div className="card-title">Resmî örnek sınav</div>
              <div className="card-sub">
                {resmi.length
                  ? `${resmi.map((e) => `${e.set}: ${Math.round((e.percent / 100) * 180)}/180`).join(' · ')}`
                  : 'jlpt.jp’nin iki seti, gerçek sınavlardan sorular. 2018’i üniteler bitince, 2012’yi sınavdan bir hafta önce.'}
              </div>
            </div>
            <span className="dim">›</span>
          </div>
        </Link>

        {/* ————— Deneme sınavı ————— */}
        <Link to="/n5-deneme" className="card card--link">
          <div className="row">
            <span className="entry-icon">
              <Icon name="target" size={18} />
            </span>
            <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
              <div className="card-title">Deneme sınavı</div>
              <div className="card-sub">
                {sonDeneme
                  ? `Son sonucun %${sonDeneme.percent} · ${denemeler.length} deneme çözüldü`
                  : 'Gerçek sınav düzeninde, süreli. Nerede olduğunu gösteren tek ölçü.'}
              </div>
            </div>
            <span className="dim">›</span>
          </div>
        </Link>

        {/* ————— İlerleme ————— */}
        <div className="card card--pad-lg stack-sm">
          <div className="row">
            <div className="stack-sm" style={{ gap: 2, flex: 1 }}>
              <div className="card-title">Genel hazırlık</div>
              <div className="card-sub">Uygulamadaki malzemenin ne kadarını öğrendin</div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>%{overall}</div>
          </div>
          <Bar value={overall} />
          <div className="tiny faint">
            Bu oran sınav puanı tahmini DEĞİLDİR — uygulamadaki içeriğin ne kadarının SRS'te "öğrenildi"
            durumuna geçtiğini gösterir. Sınavın kelime hazinesi buradakinden geniştir.
          </div>
        </div>

        <div className="stack">
          <h2>Nerede duruyorsun</h2>
          {bars.map((b) => (
            <div key={b.label} className="card stack-sm">
              <div className="row">
                <span className="card-title" style={{ flex: 1 }}>
                  {b.label}
                </span>
                <span className="small dim">
                  {b.value} / {b.max}
                </span>
              </div>
              <Bar value={b.max ? (b.value / b.max) * 100 : 0} />
              <div className="tiny faint">{b.note}</div>
            </div>
          ))}
        </div>

        {/* ————— Sınavın yapısı ————— */}
        <div className="stack">
          <h2>Sınav nasıl işliyor?</h2>
          <div className="card stack-sm">
            <div className="card-sub">
              JLPT (日本語能力試験) yılda iki kez, temmuz ve aralık aylarında yapılır. N5 en alt seviyedir:
              <b> temel Japoncayı anlayabilmek</b>. Konuşma ve yazma bölümü <b>yoktur</b> — sınav tamamen
              çoktan seçmelidir. Toplam sınav süresi <b>90 dakika</b>.
            </div>
          </div>

          {N5_SECTIONS.map((s) => (
            <div key={s.title} className="card stack-sm">
              <div className="row">
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">{s.title}</div>
                  <div className="tiny dim ja">{s.ja}</div>
                </div>
                <Badge tone="ja">{s.minutes} dk</Badge>
              </div>
              <div className="small">{s.what}</div>
            </div>
          ))}
        </div>

        {/* ————— Puanlama ————— */}
        <div className="stack">
          <h2>Nasıl puanlanıyorsun</h2>
          <div className="card stack-sm">
            <div className="card-sub">
              Oturum üç bölüm hâlinde yapılır ama <b>iki puan bloğu</b> olarak değerlendirilir: yazı-kelime ile
              dilbilgisi-okuma tek blokta toplanır.
            </div>
            {N5_SCORING.map((b) => (
              <div key={b.title} className="row small" style={{ gap: 10 }}>
                <span style={{ flex: 1 }}>
                  {b.title} <span className="tiny dim ja">{b.ja}</span>
                </span>
                <span className="mono dim">0–{b.max}</span>
                <Badge tone="accent">en az {b.min}</Badge>
              </div>
            ))}
            <div className="row small" style={{ gap: 10, borderTop: '1px solid var(--line-soft)', paddingTop: 8 }}>
              <span style={{ flex: 1 }}>
                <b>Toplam</b>
              </span>
              <span className="mono dim">0–{N5_TOTAL_MAX}</span>
              <Badge tone="ok">geçme {N5_TOTAL_PASS}</Badge>
            </div>
          </div>

          <div className="feedback feedback--info small">
            <b>Baraj iki katmanlıdır.</b> Toplamda {N5_TOTAL_PASS} almak yetmez; her bloğun kendi asgarisini de
            geçmen gerekir. Dinlemeden {N5_SCORING[1].min} alamazsan, dilbilgisinden tam puan alsan bile
            kalırsın. Bu yüzden dinleme "artarsa çalışılacak" bir bölüm değil.
          </div>
        </div>

        {/* ————— Uygulamadaki karşılığı ————— */}
        <div className="stack">
          <h2>Neyle çalışacaksın</h2>

          <Link to="/uniteler" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="book" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Üniteler</div>
                <div className="card-sub">
                  {UNITS.length} ünite · {bitenUnite} tamamlandı. Dilbilgisi, kelime, metin, ödev ve test.
                </div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/dinleme" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="headphones" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Dinleme alıştırması</div>
                <div className="card-sub">Fiyat, saat, tarih ve cümle. Dinleme barajı için her gün 10 dakika.</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/grammar" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="ruler" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Dilbilgisi</div>
                <div className="card-sub">{grammarCount} N5 konusu, Genki ders numaralarıyla etiketli</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/kanji" className="card card--link">
            <div className="row">
              <span className="ja" style={{ fontSize: '1.3rem', width: 28, textAlign: 'center' }}>
                漢
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Kanji</div>
                <div className="card-sub">
                  {KANJI_N5.length} N5 kanjisi, çizgi sırasıyla · {knownKanji} tanesi öğrenildi
                </div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/kelimeler" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="layers" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Kelimeler</div>
                <div className="card-sub">Tema tema kelime listesi, dilbilgisi notlarıyla</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/review" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="repeat" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Tekrar</div>
                <div className="card-sub">
                  Aralıklı tekrar. Sınava kadar en çok puan kazandıracak tek alışkanlık.
                </div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/zorlandiklarim" className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="flame" size={18} />
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Zorlandıklarım</div>
                <div className="card-sub">Tekrar tekrar unuttuğun kartlar — sınav öncesi asıl açığın burada</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>
        </div>

        {/* ————— Hazır sayılma ölçütü ————— */}
        <div className="card stack-sm">
          <div className="card-title">Ne zaman hazır sayılırsın?</div>
          <ul className="tight small">
            <li>
              Kana'yı <b>düşünmeden</b> okuyabiliyorsan — hız testinde dakikada 40+.
            </li>
            <li>N5 kanjilerini kelime içinde tanıyorsan (tek başına ezberlemek yetmez).</li>
            <li>Genki 12'ye kadar olan yapıları cümle kurarken kullanabiliyorsan.</li>
            <li>
              Kısa bir diyalogu <b>metnine bakmadan</b> anlayabiliyorsan.
            </li>
            <li>
              Deneme sınavını <b>süre içinde</b> bitirip {N5_TOTAL_PASS} barajının üstünde kalabiliyorsan.
            </li>
          </ul>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Genki ile birlikte çalışmak</div>
          <div className="card-sub">
            Buradaki dersler Genki (3. baskı) müfredat <b>sırasına</b> göre dizilmiştir. Genki I kabaca N5'i
            kapsar, o yüzden ayrı bir "sınav müfredatı" kurmaya gerek yok — sıra zaten doğru. Kitabı da
            kullanıyorsan her dersin başlığında <span className="mono">Genki 5</span> gibi bir etiket görürsün.
          </div>
          <div className="tiny faint">
            Anlatımlar, örnek cümleler ve alıştırmalar bu uygulamaya özgüdür; kitaptan alıntı değildir. Kitabın
            kendi dinleme kayıtları yayıncının ücretsiz <span className="mono">OTO Navi</span> uygulamasından
            edinilebilir.
          </div>
        </div>
      </div>
    </>
  )
}
