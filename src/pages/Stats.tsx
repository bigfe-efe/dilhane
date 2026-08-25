import { useLiveQuery } from 'dexie-react-hooks'
import { Badge, Ring, TopBar } from '@/components/ui'
import { useDueCounts, useLeeches, useStatsRange, useToday } from '@/db/hooks'
import { db } from '@/db/db'
import { LESSONS } from '@/content'

export default function StatsPage() {
  const today = useToday()
  const due = useDueCounts()
  const range = useStatsRange(28)
  const leeches = useLeeches()

  const totals = useLiveQuery(async () => {
    const [stats, lessons, subs, reviews] = await Promise.all([
      db.stats.toArray(),
      db.lessons.where('status').equals('completed').toArray(),
      db.submissions.count(),
      db.reviews.count(),
    ])
    return {
      reviews: stats.reduce((s, x) => s + x.reviews, 0),
      correct: stats.reduce((s, x) => s + x.correct, 0),
      minutes: stats.reduce((s, x) => s + x.minutes, 0),
      activeDays: stats.filter((x) => x.reviews > 0 || x.lessonsCompleted > 0).length,
      lessonsDone: lessons.length,
      ja: stats.reduce((s, x) => s + x.ja, 0),
      en: stats.reduce((s, x) => s + x.en, 0),
      submissions: subs,
      reviewLogs: reviews,
    }
  }, [])

  const max = Math.max(1, ...range.map((r) => r.reviews))
  const accuracy = totals && totals.reviews > 0 ? Math.round((totals.correct / totals.reviews) * 100) : 0
  const langTotal = (totals?.ja ?? 0) + (totals?.en ?? 0)

  return (
    <>
      <TopBar title="İstatistik" sub={`${today.streak} günlük seri`} back="/more" />

      <div className="page stack-lg">
        <div className="grid grid-2">
          <Stat label="Bugünkü tekrar" value={String(today.reviews)} />
          <Stat label="Seri" value={`${today.streak} gün`} />
          <Stat label="Toplam tekrar" value={String(totals?.reviews ?? 0)} />
          <Stat label="Doğruluk" value={`%${accuracy}`} />
          <Stat label="Tamamlanan ders" value={`${totals?.lessonsDone ?? 0} / ${LESSONS.length}`} />
          <Stat label="Çalışma süresi" value={`${Math.round((totals?.minutes ?? 0) / 60)} sa`} />
          <Stat label="Takıldığın kart" value={String(leeches.leeches.length)} />
          <Stat label="Zorlandığın kart" value={String(leeches.struggling.length)} />
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="card-title">Son 28 gün</div>
            <div className="spacer" />
            <span className="tiny faint">{totals?.activeDays ?? 0} aktif gün</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 92 }}>
            {range.map((r) => (
              <div
                key={r.day}
                title={`${r.label}: ${r.reviews} tekrar`}
                style={{
                  flex: 1,
                  height: `${Math.max(3, (r.reviews / max) * 100)}%`,
                  background: r.reviews > 0 ? 'var(--accent)' : 'var(--bg-elev-2)',
                  borderRadius: 3,
                  minWidth: 4,
                  transition: 'height .3s',
                }}
              />
            ))}
          </div>
          <div className="row tiny faint" style={{ marginTop: 7 }}>
            <span>{range[0]?.label}</span>
            <div className="spacer" />
            <span>bugün</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>
            Dil dağılımı
          </div>
          <div className="row" style={{ gap: 18 }}>
            <div className="lang-ja center stack-sm">
              <Ring percent={langTotal ? ((totals?.ja ?? 0) / langTotal) * 100 : 0} size={62} />
              <div className="tiny dim">日本語</div>
              <div className="tiny faint">{totals?.ja ?? 0}</div>
            </div>
            <div className="lang-en center stack-sm">
              <Ring percent={langTotal ? ((totals?.en ?? 0) / langTotal) * 100 : 0} size={62} />
              <div className="tiny dim">English</div>
              <div className="tiny faint">{totals?.en ?? 0}</div>
            </div>
            <div className="stack-sm" style={{ flex: 1 }}>
              <div className="small dim">
                {langTotal === 0
                  ? 'Henüz veri yok.'
                  : (totals?.ja ?? 0) > (totals?.en ?? 0) * 2
                    ? 'Japoncaya ağırlık veriyorsun. İngilizceyi de haftada birkaç kez tazele.'
                    : (totals?.en ?? 0) > (totals?.ja ?? 0) * 2
                      ? 'İngilizce ağır basıyor. Japonca sıfırdan olduğu için düzenlilik daha kritik.'
                      : 'Dengeli ilerliyorsun.'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>
            Kart havuzu
          </div>
          <div className="stack-sm">
            <Line label="Toplam kart" value={due.totalCards} />
            <Line label="Öğrenildi (uzun aralık)" value={due.learned} tone="ok" />
            <Line label="Yeni / hiç görülmemiş" value={due.newCards} tone="warn" />
            <Line label="Şu an tekrarı gelen" value={due.total} tone="accent" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Yazma kayıtları</div>
          <div className="card-sub">{totals?.submissions ?? 0} metin kaydettin.</div>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card center">
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
      <div className="tiny faint">{label}</div>
    </div>
  )
}

function Line({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' | 'accent' }) {
  return (
    <div className="row small">
      <span className="dim">{label}</span>
      <div className="spacer" />
      <Badge tone={tone}>{value}</Badge>
    </div>
  )
}
