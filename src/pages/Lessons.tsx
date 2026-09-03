import { Link } from 'react-router-dom'
import type { Lang } from '@/types'
import { Badge, Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { useLessonProgress } from '@/db/hooks'
import { LANG_TR, LESSONS_ORDERED, UNITS } from '@/content'
import { SKILL_TR } from '@/types'

export default function LessonsPage() {
  const l: Lang = 'ja'
  const prog = useLessonProgress()
  const units = UNITS
  const lessons = LESSONS_ORDERED

  return (
    <>
      <TopBar title={`${LANG_TR} dersleri`} sub={`${prog.completed}/${prog.total} tamamlandı`} back="/" />

      <div className={`page stack-lg lang-${l}`}>
        <Bar value={prog.percent} />

        {units.map((u) => {
          const unitLessons = lessons.filter((x) => x.unit === u.number)
          const doneCount = unitLessons.filter((x) => prog.map.get(x.id)?.status === 'completed').length

          return (
            <div key={u.number} className="stack">
              <div className="row">
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <h2>
                    {u.number}. {u.title}
                  </h2>
                  <div className="small dim">{u.description}</div>
                </div>
                <Badge tone={doneCount === unitLessons.length ? 'ok' : undefined}>
                  {doneCount}/{unitLessons.length}
                </Badge>
              </div>

              {unitLessons.map((lesson) => {
                const p = prog.map.get(lesson.id)
                const status = p?.status ?? 'not-started'
                const locked = lesson.requires?.some((r) => prog.map.get(r)?.status !== 'completed') ?? false

                const inner = (
                  <div className="row">
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        flex: 'none',
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          status === 'completed' ? 'var(--ok-dim)' : locked ? 'var(--bg-elev-2)' : 'var(--lang-dim)',
                        color: status === 'completed' ? 'var(--ok)' : locked ? 'var(--text-faint)' : 'var(--lang)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      {status === 'completed' ? <Icon name="check" size={15} /> : locked ? <Icon name="lock" size={14} /> : lesson.order}
                    </div>
                    <div className="stack-sm" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 7 }}>
                        <span className="card-title">{lesson.title}</span>
                        {lesson.genki !== undefined && (
                          <span className="genki-tag" title="Genki (3. baskı) müfredatındaki karşılığı">
                            {lesson.genki === 0 ? 'Genki あいさつ' : `Genki ${lesson.genki}`}
                          </span>
                        )}
                      </div>
                      <div className="row-wrap" style={{ gap: 5 }}>
                        <span className="tiny faint">{lesson.estMinutes} dk</span>
                        {lesson.skills.slice(0, 3).map((s) => (
                          <span key={s} className="tiny faint">
                            · {SKILL_TR[s]}
                          </span>
                        ))}
                      </div>
                      {status === 'in-progress' && p && p.sectionIndex > 0 && (
                        <div className="tiny" style={{ color: 'var(--lang)' }}>
                          {p.sectionIndex + 1}. adımdan devam edersin
                          {p.total > 0 ? ` · ${p.correct}/${p.total} doğru` : ''}
                          <span className="faint"> · içeride geri dönebilirsin</span>
                        </div>
                      )}
                    </div>
                    {!locked && <span className="dim">›</span>}
                  </div>
                )

                return locked ? (
                  <div key={lesson.id} className="card" style={{ opacity: 0.5 }} title="Önceki dersi tamamla">
                    {inner}
                  </div>
                ) : (
                  <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="card card--link">
                    {inner}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}
