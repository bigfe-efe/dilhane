import { Link } from 'react-router-dom'
import { TopBar } from '@/components/ui'
import { Icon, type IconName } from '@/components/icons'
import { useExams, useLessonProgress } from '@/db/hooks'
import { ROADMAP, buildPlan } from '@/content/ja/roadmap'

// Çalışma araçlarının tek adresi.
//
// NEDEN VAR: bu araçlar daha önce hiragana sayfasının ortasına gömülüydü ve
// oraya ulaşmak için Daha → Yazı sistemi → Hiragana → aşağı kaydır gerekiyordu.
// Günde birkaç kez açılan şeyler dört tık uzakta olamaz. Artık alt menüde kendi
// sekmesi var ve her şey burada.
//
// Sıralama rastgele değil: en üstte "şu an ne çalışmalısın" (rotadaki aşamaya
// göre), altında bütün araçlar sabit gruplar hâlinde. Böylece hem yönlendirme
// var hem de aradığını her zaman aynı yerde bulabiliyorsun.

interface Tool {
  to: string
  glyph?: string
  icon?: IconName
  title: string
  sub: string
  /** Hangi aşamalarda öne çıkarılsın */
  stages?: string[]
}

const GROUPS: { title: string; note?: string; items: Tool[] }[] = [
  {
    title: 'Tablolar',
    note: 'Karakterleri görmek, dinlemek ve çizgi sırasına bakmak için.',
    items: [
      { to: '/kana/hiragana', glyph: 'あ', title: 'Hiragana', sub: '46 karakter, dakuten ve yōon', stages: ['hiragana'] },
      { to: '/kana/katakana', glyph: 'ア', title: 'Katakana', sub: 'Yabancı kelimelerin alfabesi', stages: ['katakana'] },
      { to: '/kanji', glyph: '漢', title: 'Kanji', sub: 'N5 karakterleri ve okunuşları', stages: ['genki-1-4', 'genki-5-8', 'genki-9-12', 'n5'] },
    ],
  },
  {
    title: 'Kurallar',
    items: [
      {
        to: '/kana-kurallar',
        glyph: '則',
        title: 'Hiragana dilbilgisi',
        sub: 'Dakuten, küçük っ, uzun ünlü, ん, は→wa, yōon',
        stages: ['hiragana', 'katakana'],
      },
      {
        to: '/kural-testi',
        glyph: '筆',
        title: 'Kural okuma testi',
        sub: 'Okunuşu şıksız yaz',
        stages: ['hiragana', 'katakana'],
      },
      { to: '/yazi-sistemi', icon: 'book', title: 'Yazı sistemi', sub: 'Üç alfabe, yazı yönü, çizgi sırası' },
    ],
  },
  {
    title: 'Alıştırma',
    note: 'Bilgi burada oturur — tabloya bakmak değil, kendi başına çıkarmak.',
    items: [
      { to: '/kana-test', glyph: '試', title: 'Kendi testin', sub: 'Çıkacak karakterleri sen seç', stages: ['hiragana', 'katakana'] },
      { to: '/kana-kelime', glyph: '読', title: 'Kelime okuma', sub: 'Hiragana kelimeleri hece hece sök', stages: ['hiragana', 'katakana'] },
      { to: '/kana-hiz', glyph: '速', title: 'Hız testi', sub: 'Tanıma hızını ölç', stages: ['hiragana', 'katakana'] },
      { to: '/write', icon: 'brush', title: 'Yazı çalışması', sub: 'Çiz, çizgi sırası denetlensin', stages: ['hiragana', 'katakana'] },
    ],
  },
  {
    title: 'Ölçüm',
    items: [
      {
        to: '/hiragana-sinav',
        glyph: '終',
        title: 'Hiragana bitirme sınavı',
        sub: 'Sekiz bölüm, eksik teşhisi ve plan',
        stages: ['hiragana'],
      },
      { to: '/rota', icon: 'target', title: 'Rota ve çalışma planı', sub: 'Nerede olduğun, sırada ne var' },
    ],
  },
]

export default function PracticePage() {
  const exams = useExams()
  const prog = useLessonProgress()
  const tamamlanan = new Set(
    [...prog.map.entries()].filter(([, v]) => v.status === 'completed').map(([k]) => k),
  )
  const plan = buildPlan(exams[0] ?? null, tamamlanan)
  const stage = ROADMAP.find((s) => s.id === plan.stageId)

  // Bu aşamada işine yarayan araçlar — hepsi aşağıda yine duruyor,
  // buradakiler sadece kısayol.
  const onerilen = GROUPS.flatMap((g) => g.items).filter((t) => t.stages?.includes(plan.stageId))

  return (
    <>
      <TopBar title="Çalış" sub="Tablolar, kurallar ve alıştırmalar" />

      <div className="page stack-lg lang-ja">
        {stage && onerilen.length > 0 && (
          <div className="stack-sm">
            <div className="card card--accent stack-sm">
              <div className="row">
                <span className="stage-glyph ja">{stage.glyph}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title">Şu an: {stage.title}</div>
                  <div className="card-sub">{plan.headline}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-auto">
              {onerilen.map((t) => (
                <Link key={t.to} to={t.to} className="tool">
                  {t.glyph ? (
                    <span className="ja tool-glyph">{t.glyph}</span>
                  ) : (
                    <span className="tool-glyph">
                      <Icon name={t.icon ?? 'layers'} size={20} />
                    </span>
                  )}
                  <span className="tool-title">{t.title}</span>
                  <span className="tool-sub">{t.sub}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {GROUPS.map((g) => (
          <div key={g.title} className="stack-sm">
            <h2>{g.title}</h2>
            {g.note && (
              <div className="card-sub" style={{ marginTop: -2 }}>
                {g.note}
              </div>
            )}
            {g.items.map((t) => (
              <Link key={t.to} to={t.to} className="card card--link">
                <div className="row">
                  {t.glyph ? (
                    <span className="entry-glyph ja">{t.glyph}</span>
                  ) : (
                    <span className="entry-icon">
                      <Icon name={t.icon ?? 'layers'} size={19} />
                    </span>
                  )}
                  <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                    <div className="card-title">{t.title}</div>
                    <div className="card-sub">{t.sub}</div>
                  </div>
                  <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
