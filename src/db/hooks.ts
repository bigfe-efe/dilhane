import { useLiveQuery } from 'dexie-react-hooks'
import { db, getStreak, todayKey, type Card } from './db'
import { leechLevel } from '@/lib/srs'
import { LESSONS, LESSONS_ORDERED } from '@/content'
import { EXAM_DATE_KEY, parseExamDate } from '@/content/ja/study-plan'

/** Tekrarı gelmiş kart sayıları. */
export function useDueCounts() {
  return (
    useLiveQuery(async () => {
      const now = Date.now()
      const all = await db.cards.toArray()
      const due = all.filter((c) => !c.suspended && c.due <= now)
      return {
        total: due.length,
        newCards: all.filter((c) => c.phase === 'new').length,
        learned: all.filter((c) => c.phase === 'review').length,
        totalCards: all.length,
      }
    }, []) ?? { total: 0, newCards: 0, learned: 0, totalCards: 0 }
  )
}

/** Bugünün çalışma özeti. */
export function useToday() {
  return (
    useLiveQuery(async () => {
      const s = await db.stats.get(todayKey())
      const streak = await getStreak()
      return {
        reviews: s?.reviews ?? 0,
        correct: s?.correct ?? 0,
        minutes: s?.minutes ?? 0,
        lessons: s?.lessonsCompleted ?? 0,
        streak,
      }
    }, []) ?? { reviews: 0, correct: 0, minutes: 0, lessons: 0, streak: 0 }
  )
}

/** Ders ilerlemesi. */
export function useLessonProgress() {
  return (
    useLiveQuery(async () => {
      const rows = await db.lessons.toArray()
      const map = new Map(rows.map((r) => [r.lessonId, r]))
      const all = LESSONS_ORDERED
      const completed = all.filter((l) => map.get(l.id)?.status === 'completed')
      // Kilidi açık ilk tamamlanmamış ders
      const next = all.find((l) => map.get(l.id)?.status !== 'completed')
      return {
        map,
        total: all.length,
        completed: completed.length,
        percent: all.length ? (completed.length / all.length) * 100 : 0,
        next,
      }
    }, []) ?? { map: new Map(), total: 0, completed: 0, percent: 0, next: undefined }
  )
}

/** Bir dersin kilitli olup olmadığı. */
export function useIsUnlocked(lessonId: string) {
  return (
    useLiveQuery(async () => {
      const lesson = LESSONS.find((l) => l.id === lessonId)
      if (!lesson?.requires?.length) return true
      const rows = await db.lessons.bulkGet(lesson.requires)
      return rows.every((r) => r?.status === 'completed')
    }, [lessonId]) ?? true
  )
}

/** Karakter/kelime bazında öğrenilmişlik durumu — ızgaraları renklendirmek için. */
export function useCardStates(kind: Card['kind']) {
  return (
    useLiveQuery(async () => {
      const rows = await db.cards.where('kind').equals(kind).toArray()
      const m = new Map<string, Card>()
      for (const r of rows) if (!r.reverse) m.set(r.refId, r)
      return m
    }, [kind]) ?? new Map<string, Card>()
  )
}

/** Sürekli unutulan kartlar — en çok takılınan başta. */
export function useLeeches() {
  return (
    useLiveQuery(async () => {
      const all = await db.cards.toArray()
      const rows = all.filter((c) => leechLevel(c) !== 'none').sort((a, b) => b.lapses - a.lapses)
      return {
        all: rows,
        leeches: rows.filter((c) => leechLevel(c) === 'leech'),
        struggling: rows.filter((c) => leechLevel(c) === 'struggling'),
      }
    }, []) ?? { all: [], leeches: [], struggling: [] }
  )
}

/** Bugün tamamlanan görevlerin kimlikleri. */
export function useDailyDone(day: string) {
  return (
    useLiveQuery(async () => {
      const rows = await db.daily.where('day').equals(day).toArray()
      return new Set(rows.map((r) => r.taskId))
    }, [day]) ?? new Set<string>()
  )
}

/** Son N günün tamamlanma sayısı — seri ve grafik için. */
export function useDailyHistory(days = 14) {
  return (
    useLiveQuery(async () => {
      const rows = await db.daily.toArray()
      const say = new Map<string, number>()
      for (const r of rows) say.set(r.day, (say.get(r.day) ?? 0) + 1)
      const out: { day: string; count: number }[] = []
      const d = new Date()
      d.setDate(d.getDate() - (days - 1))
      for (let i = 0; i < days; i++) {
        const key = todayKey(d)
        out.push({ day: key, count: say.get(key) ?? 0 })
        d.setDate(d.getDate() + 1)
      }
      return out
    }, [days]) ?? []
  )
}

/** Bitirme sınavı geçmişi — en yeni başta. */
export function useExams() {
  return useLiveQuery(async () => db.exams.orderBy('at').reverse().toArray(), []) ?? []
}

/** Bir karta iliştirilmiş kişisel not (hatırlatıcı). */
export function useNote(refId: string | undefined) {
  return useLiveQuery(async () => (refId ? ((await db.notes.get(refId))?.text ?? '') : ''), [refId]) ?? ''
}

export function useSubmissions(limit = 20) {
  return useLiveQuery(async () => db.submissions.orderBy('at').reverse().limit(limit).toArray(), [limit]) ?? []
}

export function useStatsRange(days = 30) {
  return (
    useLiveQuery(async () => {
      const all = await db.stats.toArray()
      const byDay = new Map(all.map((s) => [s.day, s]))
      const out: { day: string; reviews: number; correct: number; label: string }[] = []
      const d = new Date()
      d.setDate(d.getDate() - (days - 1))
      for (let i = 0; i < days; i++) {
        const key = todayKey(d)
        const s = byDay.get(key)
        out.push({
          day: key,
          reviews: s?.reviews ?? 0,
          correct: s?.correct ?? 0,
          label: `${d.getDate()}.${d.getMonth() + 1}`,
        })
        d.setDate(d.getDate() + 1)
      }
      return out
    }, [days]) ?? []
  )
}

/**
 * Hedeflenen sınav günü — ayarlardan, canlı.
 *
 * `null` geçerli bir durum: sınav tarihi belirlenmemiş olabilir (ertelenmiş
 * ya da henüz karar verilmemiş). O zaman uygulama geri sayım yerine ilerleme
 * gösteriyor; sahte bir tarihe geri saymak yanlış tempo dayatıyordu.
 */
export function useExamDate(): Date | null {
  return (
    useLiveQuery(async () => {
      const row = await db.settings.get(EXAM_DATE_KEY)
      return parseExamDate(row?.value as string | undefined)
    }, []) ?? null
  )
}
