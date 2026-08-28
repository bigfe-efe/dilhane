import Dexie, { type Table } from 'dexie'
import type { CardState, Rating } from '@/lib/srs'
import { newCard } from '@/lib/srs'
import type { Lang } from '@/types'

/** SRS kartının neyi temsil ettiği. Kart id'si `${kind}:${refId}` biçiminde. */
export type CardKind = 'vocab' | 'kana' | 'kanji' | 'grammar' | 'sentence'

export interface Card extends CardState {
  id: string
  kind: CardKind
  refId: string
  lang: Lang
  /** Ters yön kartı mı (anlam→kelime) */
  reverse?: 0 | 1
  createdAt: number
  suspended?: 0 | 1
}

export interface ReviewLog {
  id?: number
  cardId: string
  lang: Lang
  kind: CardKind
  rating: Rating
  at: number
  /** Cevap süresi (ms) */
  ms: number
  correct: 0 | 1
}

export interface LessonProgress {
  lessonId: string
  lang: Lang
  status: 'not-started' | 'in-progress' | 'completed'
  sectionIndex: number
  correct: number
  total: number
  startedAt?: number
  completedAt?: number
  /** Kaç kez tekrar edildi */
  attempts: number
}

export interface HomeworkProgress {
  homeworkId: string
  lang: Lang
  status: 'assigned' | 'in-progress' | 'completed'
  assignedAt: number
  dueAt?: number
  completedAt?: number
  correct: number
  total: number
}

/** Serbest yazma / konuşma kayıtları — kendi gelişimini görmek için saklanır */
export interface Submission {
  id?: number
  kind: 'writing' | 'speaking'
  lang: Lang
  exerciseId: string
  prompt: string
  content: string
  /** Konuşmada tanınan metin ve benzerlik puanı */
  score?: number
  at: number
  /** İsteğe bağlı: build/istek anında üretilmiş geri bildirim */
  feedback?: string
}

export interface DayStat {
  /** YYYY-MM-DD */
  day: string
  reviews: number
  correct: number
  minutes: number
  lessonsCompleted: number
  ja: number
  en: number
}

export interface Setting {
  key: string
  value: unknown
}

export interface Note {
  refId: string
  text: string
  updatedAt: number
}

/**
 * Bitirme sınavı sonucu.
 *
 * Tek bir puan yerine bölüm bölüm saklanıyor: ilerleme "kaç aldım"dan çok
 * "hangi beceri düzeldi" sorusunun cevabıdır. Çalışma planı da bunu okuyor.
 */
export interface ExamRecord {
  /** Sınavın bittiği an — kimlik olarak da bunu kullanıyoruz */
  at: number
  kind: 'hiragana' | 'katakana'
  percent: number
  correct: number
  total: number
  /** section → yüzde */
  sections: Record<string, number>
  /** Yanlışlarda geçen karakterler */
  weakChars: string[]
  full: boolean
  withWriting: boolean
}

/**
 * Günlük görev işareti.
 *
 * Planın KENDİSİ saklanmıyor — o her gün sınav tarihine, ders ilerlemesine ve
 * bekleyen kart sayısına bakılarak yeniden üretiliyor. Saklanan tek şey neyin
 * yapıldığı. Böylece plan değişirse geçmiş bozulmuyor ve "dün ne yaptım"
 * sorusu hep doğru cevaplanıyor.
 */
export interface DailyDone {
  /** `YYYY-MM-DD:taskId` */
  id: string
  day: string
  taskId: string
  at: number
}

class DilhaneDB extends Dexie {
  cards!: Table<Card, string>
  reviews!: Table<ReviewLog, number>
  lessons!: Table<LessonProgress, string>
  homework!: Table<HomeworkProgress, string>
  submissions!: Table<Submission, number>
  stats!: Table<DayStat, string>
  settings!: Table<Setting, string>
  notes!: Table<Note, string>
  exams!: Table<ExamRecord, number>
  daily!: Table<DailyDone, string>

  constructor() {
    super('dilhane')
    this.version(1).stores({
      cards: 'id, kind, lang, due, phase, refId, [lang+due], [kind+lang]',
      reviews: '++id, cardId, at, lang, [lang+at]',
      lessons: 'lessonId, lang, status',
      homework: 'homeworkId, lang, status, dueAt',
      submissions: '++id, kind, lang, at, exerciseId',
      stats: 'day',
      settings: 'key',
      notes: 'refId',
    })

    // v2: bitirme sınavı sonuçları. Yeni tablo eklemek eskisini bozmaz —
    // Dexie mevcut verileri olduğu gibi taşır.
    this.version(2).stores({
      exams: 'at, kind, percent',
    })

    // v3: günlük görev işaretleri
    this.version(3).stores({
      daily: 'id, day, taskId',
    })
  }
}

export const db = new DilhaneDB()

// ————————————————————————— Yardımcılar —————————————————————————

export function cardId(kind: CardKind, refId: string, reverse = false): string {
  return `${kind}:${refId}${reverse ? ':r' : ''}`
}

/** Kart yoksa oluşturur, varsa dokunmaz. Ders tamamlandığında toplu çağrılır. */
export async function ensureCards(
  entries: { kind: CardKind; refId: string; lang: Lang; reverse?: boolean }[],
): Promise<number> {
  const now = Date.now()
  const ids = entries.map((e) => cardId(e.kind, e.refId, e.reverse))
  const existing = new Set((await db.cards.bulkGet(ids)).filter(Boolean).map((c) => c!.id))
  const toAdd: Card[] = []
  entries.forEach((e, i) => {
    if (existing.has(ids[i])) return
    toAdd.push({
      id: ids[i],
      kind: e.kind,
      refId: e.refId,
      lang: e.lang,
      reverse: e.reverse ? 1 : 0,
      createdAt: now,
      ...newCard(now),
    })
  })
  if (toAdd.length) await db.cards.bulkAdd(toAdd)
  return toAdd.length
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function bumpStat(patch: Partial<Omit<DayStat, 'day'>>): Promise<void> {
  const day = todayKey()
  await db.transaction('rw', db.stats, async () => {
    const cur =
      (await db.stats.get(day)) ??
      ({ day, reviews: 0, correct: 0, minutes: 0, lessonsCompleted: 0, ja: 0, en: 0 } as DayStat)
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'number') (cur as unknown as Record<string, number>)[k] += v
    }
    await db.stats.put(cur)
  })
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return row ? (row.value as T) : fallback
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value })
}

/** Günlük seri (streak) — bugünden geriye kesintisiz çalışılan gün sayısı */
export async function getStreak(): Promise<number> {
  const all = await db.stats.toArray()
  const active = new Set(all.filter((s) => s.reviews > 0 || s.lessonsCompleted > 0).map((s) => s.day))
  let streak = 0
  const d = new Date()
  // Bugün henüz çalışılmadıysa seri dünden sayılır
  if (!active.has(todayKey(d))) d.setDate(d.getDate() - 1)
  while (active.has(todayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Tüm ilerlemeyi dışa aktar — yedekleme için */
export async function exportAll(): Promise<string> {
  const [cards, reviews, lessons, homework, submissions, stats, settings, notes] = await Promise.all([
    db.cards.toArray(),
    db.reviews.toArray(),
    db.lessons.toArray(),
    db.homework.toArray(),
    db.submissions.toArray(),
    db.stats.toArray(),
    db.settings.toArray(),
    db.notes.toArray(),
  ])
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), cards, reviews, lessons, homework, submissions, stats, settings, notes },
    null,
    2,
  )
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json)
  await db.transaction(
    'rw',
    [db.cards, db.reviews, db.lessons, db.homework, db.submissions, db.stats, db.settings, db.notes],
    async () => {
      await Promise.all([
        db.cards.clear(),
        db.reviews.clear(),
        db.lessons.clear(),
        db.homework.clear(),
        db.submissions.clear(),
        db.stats.clear(),
        db.settings.clear(),
        db.notes.clear(),
      ])
      await Promise.all([
        db.cards.bulkAdd(data.cards ?? []),
        db.reviews.bulkAdd(data.reviews ?? []),
        db.lessons.bulkAdd(data.lessons ?? []),
        db.homework.bulkAdd(data.homework ?? []),
        db.submissions.bulkAdd(data.submissions ?? []),
        db.stats.bulkAdd(data.stats ?? []),
        db.settings.bulkAdd(data.settings ?? []),
        db.notes.bulkAdd(data.notes ?? []),
      ])
    },
  )
}
