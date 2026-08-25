import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { useDueCounts, useExams, useLeeches, useLessonProgress, useToday } from '@/db/hooks'
import { LANG_NATIVE } from '@/content'
import { ROADMAP, buildPlan } from '@/content/ja/roadmap'

// Ana sayfa tek bir soruyu cevaplar: BUGÜN ne yapayım?
//
// Eskiden burada bütün araçların ızgarası vardı; aramak zordu çünkü sayfa
// "her şey" demeye çalışıyordu. Araçlar artık "Daha" sayfasında gruplu duruyor.
// Burada yalnızca bugün yapılacak iş var: bekleyen tekrar, sıradaki ders ve
// rotanın bir cümlelik özeti. Uzun vadeli yön ise Rota sayfasında.

/** Ana sayfadaki kısayollar — tamamı Çalış sekmesinde. */
const QUICK: { to: string; glyph: string; title: string; sub: string }[] = [
  { to: '/kana/hiragana', glyph: 'あ', title: 'Hiragana', sub: 'Tablo' },
  { to: '/kana-kurallar', glyph: '則', title: 'Hiragana dilbilgisi', sub: 'Yazı sistemi kuralları' },
  { to: '/kural-testi', glyph: '筆', title: 'Kural testi', sub: 'Okunuşu yaz' },
  { to: '/kana-test', glyph: '試', title: 'Kendi testin', sub: 'Harfleri sen seç' },
  { to: '/kana-kelime', glyph: '読', title: 'Kelime okuma', sub: 'Hece hece sök' },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default function Home() {
  const due = useDueCounts()
  const today = useToday()
  const prog = useLessonProgress()
  const leeches = useLeeches()
  const exams = useExams()

  const accuracy = today.reviews > 0 ? Math.round((today.correct / today.reviews) * 100) : 0
  const tamamlanan = new Set(
    [...prog.map.entries()].filter(([, v]) => v.status === 'completed').map(([k]) => k),
  )
  const plan = buildPlan(exams[0] ?? null, tamamlanan)
  const stage = ROADMAP.find((s) => s.id === plan.stageId)

  return (
    <>
      <TopBar
        title={greeting()}
        sub={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        right={
          <Link to="/settings" className="iconbtn" aria-label="Ayarlar">
            <Icon name="sliders" size={18} />
          </Link>
        }
      />

      <div className="page stack-lg lang-ja">
        {/* Nerede olduğun — tek satır, ayrıntısı Rota'da */}
        {stage && (
          <Link to="/rota" className="railcard railcard--link">
            <div className="row">
              <span className="ja home-mark">日本語</span>
              <div className="spacer" />
              <span className="badge badge--accent tiny">{stage.title}</span>
            </div>
            <div className="stack-sm" style={{ marginTop: 16 }}>
              <div className="card-title" style={{ fontSize: '1rem' }}>
                {plan.headline}
              </div>
              <div className="card-sub" style={{ lineHeight: 1.55 }}>
                {plan.items[0]?.title ?? stage.sub}
              </div>
            </div>
            <div className="row tiny dim" style={{ marginTop: 14 }}>
              <span>Rotayı ve haftalık planı gör</span>
              <div className="spacer" />
              <Icon name="right" size={14} />
            </div>
          </Link>
        )}

        {/* Bugünün işi */}
        <div className="stack-sm">
          <h2>Bugün</h2>

          {due.total > 0 ? (
            <Link to="/review" className="card card--link card--accent">
              <div className="row">
                <span className="entry-icon">
                  <Icon name="repeat" size={19} />
                </span>
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">Önce tekrar</div>
                  <div className="card-sub">{due.total} kart bekliyor — yeni ders açmadan bunu bitir</div>
                </div>
                <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
          ) : (
            <div className="card">
              <div className="row">
                <span className="entry-icon">
                  <Icon name="check" size={18} />
                </span>
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">Tekrar bitti</div>
                  <div className="card-sub">Bekleyen kart yok. Sıradaki derse geçebilirsin.</div>
                </div>
              </div>
            </div>
          )}

          {prog.next && (
            <Link to={`/lesson/${prog.next.id}`} className="card card--link">
              <div className="row">
                <span className="entry-icon">
                  <Icon name="book" size={19} />
                </span>
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">
                    {prog.completed === 0 ? 'İlk dersi aç' : 'Sıradaki ders'}
                  </div>
                  <div className="card-sub">{prog.next.title}</div>
                </div>
                <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
          )}

          {leeches.leeches.length > 0 && (
            <Link to="/zorlandiklarim" className="card card--link">
              <div className="row">
                <span className="entry-icon">
                  <Icon name="flame" size={19} />
                </span>
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">Takıldığın kartlar</div>
                  <div className="card-sub">{leeches.leeches.length} kart sürekli unutuluyor</div>
                </div>
                <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
          )}
        </div>

        {/* Günlük araçlar — hepsi Çalış sekmesinde, bunlar en sık kullanılanlar */}
        <div className="stack-sm">
          <div className="row">
            <h2>Çalış</h2>
            <div className="spacer" />
            <Link to="/calis" className="tiny dim" style={{ textDecoration: 'underline' }}>
              hepsi
            </Link>
          </div>
          <div className="grid grid-auto">
            {QUICK.map((q) => (
              <Link key={q.to} to={q.to} className="tool">
                <span className="ja tool-glyph">{q.glyph}</span>
                <span className="tool-title">{q.title}</span>
                <span className="tool-sub">{q.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sayılar */}
        <div className="grid grid-2">
          <div className="card stat">
            <div className="stat-label">Bugün</div>
            <div className="stat-value tabular">{today.reviews}</div>
            <div className="stat-note">{today.reviews > 0 ? `%${accuracy} doğruluk` : 'henüz çalışmadın'}</div>
          </div>
          <div className="card stat">
            <div className="stat-label">Seri</div>
            <div className="stat-value tabular">{today.streak}</div>
            <div className="stat-note">{today.streak === 1 ? 'gün' : 'gün üst üste'}</div>
          </div>
        </div>

        {/* Müfredat ilerlemesi */}
        <div className="card stack-sm">
          <div className="row tiny">
            <span className="dim">Müfredat</span>
            <div className="spacer" />
            <span className="tabular dim">
              {prog.completed} / {prog.total} ders
            </span>
          </div>
          <Bar value={prog.percent} />
          <Link to="/lessons" className="tiny dim" style={{ textDecoration: 'underline' }}>
            Bütün dersleri gör
          </Link>
        </div>

        <div className="home-foot">
          <span className="ja">{LANG_NATIVE}</span>
          <span>Dilhane</span>
        </div>
      </div>
    </>
  )
}
