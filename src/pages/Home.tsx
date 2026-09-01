import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon, type IconName } from '@/components/icons'
import { useDailyDone, useDailyHistory, useDueCounts, useExamDate, useExams, useLeeches, useLessonProgress, usePendingSession, useToday } from '@/db/hooks'
import { db, todayKey } from '@/db/db'
import { LESSONS_ORDERED } from '@/content'
import { buildDailyPlan, type DailyTask, type TaskKind } from '@/content/ja/study-plan'

// "Bugün" — günün çalışma listesi.
//
// Ana sayfa artık bir menü değil, bir GÖREV LİSTESİ. Tek soruyu cevaplıyor:
// bugün ne yapmalıyım? Görevler sınav tarihine, müfredatın neresinde olduğuna
// ve bekleyen kart sayısına göre her gün yeniden üretiliyor.
//
// Sıralama önem sırasıdır, bütçe sırası değil. Yorulup bıraktığında en kritik
// olanı yapmış olursun: önce tekrar, sonra yeni ders, sonra alıştırma.

const IKON: Record<TaskKind, IconName> = {
  review: 'repeat',
  lesson: 'book',
  drill: 'target',
  write: 'brush',
  read: 'search',
  grammar: 'brackets',
  video: 'headphones',
  exam: 'trophy',
}

function selam(): string {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default function Home() {
  const gun = todayKey()
  const due = useDueCounts()
  const today = useToday()
  const prog = useLessonProgress()
  const leeches = useLeeches()
  const exams = useExams()
  const yapilan = useDailyDone(gun)
  const gecmis = useDailyHistory(14)
  const examDate = useExamDate()
  const bekleyen = usePendingSession()

  const tamamlanan = new Set(
    [...prog.map.entries()].filter(([, v]) => v.status === 'completed').map(([k]) => k),
  )

  const plan = buildDailyPlan({
    day: gun,
    dueCards: due.total,
    completed: tamamlanan,
    nextLesson: prog.next,
    exams,
    examDate,
    pendingSession: bekleyen ? { day: bekleyen.day, chars: bekleyen.chars.length } : null,
    leeches: leeches.leeches.length,
    totalLessons: LESSONS_ORDERED.length,
  })

  const cekirdek = plan.tasks.filter((t) => !t.optional)
  const bitenCekirdek = cekirdek.filter((t) => yapilan.has(t.id)).length
  const yuzde = cekirdek.length ? (bitenCekirdek / cekirdek.length) * 100 : 0
  const kalanDakika = plan.tasks.filter((t) => !yapilan.has(t.id)).reduce((a, t) => a + t.minutes, 0)

  const isaretle = async (t: DailyTask) => {
    const id = `${gun}:${t.id}`
    if (yapilan.has(t.id)) await db.daily.delete(id)
    else await db.daily.put({ id, day: gun, taskId: t.id, at: Date.now() })
  }

  return (
    <>
      <TopBar
        title={selam()}
        sub={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        right={
          <Link to="/settings" className="iconbtn" aria-label="Ayarlar">
            <Icon name="sliders" size={18} />
          </Link>
        }
      />

      {/*
        Geniş ekranda iki sütun: solda BUGÜN YAPILACAK İŞ, sağda bağlam
        (sayılar, seri, müfredat). Ayrım keyfi değil — sol sütun her gün
        dokunulan, sağ sütun ara sıra bakılan şeyler. Tek sütunda bunlar
        birbirine karışıyor ve günün listesi ekranın altına kayıyordu.
        Telefonda ızgara çöküp eski sıraya döner.
      */}
      <div className="page dash lang-ja">
        <div className="dash-main stack-lg">
        {/* ————— Sınav geri sayımı ve tempo ————— */}
        <Link to="/rota" className="railcard railcard--link">
          <div className="row">
            <span className="ja home-mark">日本語</span>
            <div className="spacer" />
            <span className={`badge tiny badge--${plan.pace.state === 'behind' ? 'bad' : 'accent'}`}>
              {plan.daysLeft !== null ? 'JLPT N5' : 'Hedef belirlenmedi'}
            </span>
          </div>

          {/*
            Sınav tarihi varsa geri sayım, yoksa ilerleme. Ölü bir tarihe geri
            saymak yanlış tempo dayatıyordu; tarih yokken doğru olan tek şey
            nerede olduğun.
          */}
          <div className="row" style={{ alignItems: 'baseline', gap: 8, marginTop: 14 }}>
            {plan.daysLeft !== null ? (
              <>
                <span className="countdown tabular">{plan.daysLeft}</span>
                <span className="card-sub">
                  gün kaldı ·{' '}
                  {examDate!.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </>
            ) : (
              <>
                <span className="countdown tabular">
                  {prog.completed}/{prog.total}
                </span>
                <span className="card-sub">ders bitti</span>
              </>
            )}
          </div>

          <div className="card-sub" style={{ lineHeight: 1.55, marginTop: 6 }}>
            {plan.pace.text}
          </div>

          <div className="row tiny dim" style={{ marginTop: 12 }}>
            <span>{plan.focus}</span>
            <div className="spacer" />
            <Icon name="right" size={14} />
          </div>
        </Link>

        {/* ————— Günün listesi ————— */}
        <div className="stack-sm">
          <div className="row">
            <h2>Bugünün listesi</h2>
            <div className="spacer" />
            <span className="tiny faint tabular">
              {bitenCekirdek} / {cekirdek.length}
            </span>
          </div>

          <div className="card stack-sm">
            <Bar value={yuzde} />
            <div className="row tiny">
              <span className="dim">
                {yuzde === 100 ? 'Bugünlük iş bitti' : `${kalanDakika} dakikalık iş kaldı`}
              </span>
              <div className="spacer" />
              <span className="faint tabular">~{plan.minutes} dk toplam</span>
            </div>
          </div>

          {plan.tasks.map((t) => {
            const bitti = yapilan.has(t.id)
            return (
              <div key={t.id} className={`card task${bitti ? ' is-done' : ''}${t.optional ? ' is-optional' : ''}`}>
                <div className="row">
                  <button
                    className="task-check"
                    onClick={() => void isaretle(t)}
                    aria-label={bitti ? 'Yapılmadı olarak işaretle' : 'Yapıldı olarak işaretle'}
                  >
                    <Icon name={bitti ? 'squareCheck' : 'square'} size={20} />
                  </button>

                  <div className="stack-sm" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      <span className="task-title">{t.title}</span>
                      {t.optional && <span className="badge tiny">ekstra</span>}
                    </div>
                    <div className="card-sub" style={{ lineHeight: 1.5 }}>
                      {t.detail}
                    </div>
                  </div>

                  <div className="stack-sm" style={{ gap: 4, alignItems: 'flex-end' }}>
                    <span className="tiny faint tabular">{t.minutes} dk</span>
                    <Link to={t.to} className="btn btn--sm" aria-label={`${t.title} — aç`}>
                      <Icon name={IKON[t.kind]} size={15} />
                      Aç
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        </div>

        <aside className="dash-side stack-lg">
        {/* ————— Sayılar ————— */}
        <div className="grid grid-2 dash-stats">
          <div className="card stat">
            <div className="stat-label">Bugün</div>
            <div className="stat-value tabular">{today.reviews}</div>
            <div className="stat-note">
              {today.reviews > 0 ? `%${Math.round((today.correct / today.reviews) * 100)} doğruluk` : 'henüz çalışmadın'}
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">Seri</div>
            <div className="stat-value tabular">{today.streak}</div>
            <div className="stat-note">{today.streak === 1 ? 'gün' : 'gün üst üste'}</div>
          </div>
        </div>

        {/* ————— Son iki hafta ————— */}
        <div className="card stack-sm">
          <div className="row tiny">
            <span className="dim">Son 14 gün</span>
            <div className="spacer" />
            <span className="faint tabular">{gecmis.filter((g) => g.count > 0).length} gün çalıştın</span>
          </div>
          <div className="streak-bars">
            {gecmis.map((g) => (
              <span
                key={g.day}
                className={`streak-bar${g.count > 0 ? ' is-on' : ''}`}
                title={`${g.day}: ${g.count} görev`}
              />
            ))}
          </div>
        </div>

        {/* ————— Müfredat ————— */}
        <div className="card stack-sm">
          <div className="row tiny">
            <span className="dim">Müfredat</span>
            <div className="spacer" />
            <span className="tabular dim">
              {prog.completed} / {prog.total} ders
            </span>
          </div>
          <Bar value={prog.percent} />
          <div className="row">
            <Link to="/lessons" className="tiny dim" style={{ textDecoration: 'underline' }}>
              Bütün dersler
            </Link>
            <div className="spacer" />
            <Link to="/calis" className="tiny dim" style={{ textDecoration: 'underline' }}>
              Çalışma araçları
            </Link>
          </div>
        </div>
        </aside>
      </div>
    </>
  )
}
