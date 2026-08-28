import type { Lesson } from '@/types'
import type { ExamRecord } from '@/db/db'
import { ROADMAP, buildPlan } from './roadmap'

// Günlük çalışma planı — uygulamanın "öğretmen" tarafı.
//
// NASIL ÇALIŞIR:
// Plan hiçbir yerde SAKLANMIYOR. Her açılışta üç şeye bakılıp yeniden
// üretiliyor: sınava kaç gün kaldı, müfredatın neresindesin, kaç kart tekrarı
// bekliyor. Saklanan tek şey neyi bitirdiğin.
//
// Bu bilinçli bir tercih. Sabit bir takvim yazsaydım bir gün aksattığında plan
// bozulur, "3 Ekim'de şunu yapacaktın" diye geçmişe takılı kalırdı. Türetilen
// plan ise her gün bulunduğun yerden devam eder: geri kaldıysan tempoyu artırır,
// öndeysen rahatlatır.
//
// GÜNLÜK BÜTÇE: ~60-90 dakika, her gün. Görevler bu bütçeye göre boyutlanır ve
// ÖNEM SIRASINA dizilir — yorulup bıraktığında en kritik olanı yapmış olursun.
// Sıra şu: tekrar → yeni ders → alıştırma → yazma → ekstra.

/** JLPT N5 sınav tarihi. Aralık oturumu. */
export const EXAM_DATE = new Date(2026, 11, 6) // 6 Aralık 2026

export function daysUntilExam(now = new Date()): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const b = new Date(EXAM_DATE.getFullYear(), EXAM_DATE.getMonth(), EXAM_DATE.getDate())
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

// ————————————————————————— Görev tipleri —————————————————————————

export type TaskKind = 'review' | 'lesson' | 'drill' | 'write' | 'read' | 'grammar' | 'video' | 'exam'

export interface DailyTask {
  /** Gün içinde sabit kimlik — tamamlanma buna göre saklanır */
  id: string
  kind: TaskKind
  title: string
  detail: string
  /** Tahmini süre, dakika */
  minutes: number
  to: string
  /** Atlanabilir mi — çekirdek görevler atlanmamalı */
  optional?: boolean
}

export interface PlanContext {
  /** Bugünün anahtarı, YYYY-MM-DD */
  day: string
  dueCards: number
  /** Tamamlanmış ders kimlikleri */
  completed: Set<string>
  nextLesson: Lesson | undefined
  /** Bitirme sınavı geçmişi, yeniden eskiye — hiragana ve katakana karışık */
  exams: ExamRecord[]
  leeches: number
  /** Toplam ders sayısı */
  totalLessons: number
}

export interface DailyPlan {
  tasks: DailyTask[]
  /** Toplam tahmini süre */
  minutes: number
  /** Sınava kalan gün */
  daysLeft: number
  /** Tempo: haftada kaç ders bitmeli */
  lessonsPerWeek: number
  /** Programa göre durumun */
  pace: { state: 'ahead' | 'ontrack' | 'behind'; text: string }
  /** Bugünün tek cümlelik odağı */
  focus: string
}

// ————————————————————————— Tempo hesabı —————————————————————————

/**
 * Sınava yetişmek için haftada kaç ders bitmeli?
 *
 * Son üç haftayı tekrar ve deneme sınavına ayırıyoruz — yeni konu öğrenerek
 * sınava girmek işe yaramaz, son dönem pekiştirme dönemidir.
 */
function pacing(completed: number, total: number, daysLeft: number) {
  const kalanDers = Math.max(0, total - completed)
  const calismaGunu = Math.max(1, daysLeft - 21)
  const hafta = calismaGunu / 7
  const gereken = kalanDers / Math.max(1, hafta)
  return { kalanDers, lessonsPerWeek: Math.max(1, Math.ceil(gereken)) }
}

// ————————————————————————— Plan üretimi —————————————————————————

export function buildDailyPlan(ctx: PlanContext, now = new Date()): DailyPlan {
  const daysLeft = daysUntilExam(now)
  const { kalanDers, lessonsPerWeek } = pacing(ctx.completed.size, ctx.totalLessons, daysLeft)

  const rota = buildPlan(ctx.exams, ctx.completed)
  const stage = ROADMAP.find((s) => s.id === rota.stageId)
  const tasks: DailyTask[] = []

  // ————— 1. Tekrar: her şeyin önünde —————
  //
  // Aralıklı tekrar biriktiğinde geri dönülmez hâle gelir. Bekleyen kart varsa
  // günün ilk işi budur; yoksa görev listesine hiç konmaz ki yapılmış işi
  // yapılacak gibi göstermeyelim.
  if (ctx.dueCards > 0) {
    tasks.push({
      id: 'review',
      kind: 'review',
      title: 'Bekleyen tekrarları bitir',
      detail: `${ctx.dueCards} kart hazır. Yeni konuya geçmeden önce bunu kapat — biriken tekrar en hızlı vazgeçme sebebidir.`,
      minutes: Math.min(30, Math.max(5, Math.round(ctx.dueCards * 0.4))),
      to: '/review',
    })
  }

  // ————— 2. Yeni ders —————
  if (ctx.nextLesson) {
    tasks.push({
      id: `lesson:${ctx.nextLesson.id}`,
      kind: 'lesson',
      title: 'Sıradaki ders',
      detail: `${ctx.nextLesson.title}${ctx.nextLesson.subtitle ? ` · ${ctx.nextLesson.subtitle}` : ''}`,
      minutes: ctx.nextLesson.estMinutes ?? 25,
      to: `/lesson/${ctx.nextLesson.id}`,
    })
  }

  // ————— 3. Aşamaya göre alıştırma —————
  //
  // Alıştırma dersin tekrarı değil: ders TANITIR, alıştırma OTURTUR. Hangi
  // alıştırmanın işe yaradığı aşamaya göre değişiyor.
  if (rota.stageId === 'hiragana') {
    tasks.push({
      id: 'drill:kural',
      kind: 'drill',
      title: 'Kural okuma testi',
      detail: 'Küçük っ, uzun ünlü, ん ve は→wa — okunuşu şıksız yaz.',
      minutes: 10,
      to: '/kural-testi',
    })
    tasks.push({
      id: 'read:kelime',
      kind: 'read',
      title: 'Kelime okuma',
      detail: 'Günde 10 kelime sök. Harf tanımak ile okumak ayrı becerilerdir.',
      minutes: 10,
      to: '/kana-kelime',
    })
  } else if (rota.stageId === 'katakana') {
    tasks.push({
      id: 'drill:kana-test',
      kind: 'drill',
      title: 'Katakana testi',
      detail: 'O gün öğrendiğin satırları seç. シ/ツ ve ソ/ン ayrımına ayrıca çalış.',
      minutes: 10,
      to: '/kana-test',
    })
    tasks.push({
      id: 'read:kelime',
      kind: 'read',
      title: 'Hiragana kelime okuma',
      detail: 'Yeni alfabe öğrenirken eskisi paslanır — günde birkaç dakika yeter.',
      minutes: 8,
      to: '/kana-kelime',
    })
  } else {
    // Genki aşaması: dilbilgisi ve kelime öne çıkar
    tasks.push({
      id: 'grammar:oku',
      kind: 'grammar',
      title: 'Bir dilbilgisi konusu oku',
      detail: 'Dersteki yapıyı bir de başlı başına oku; örnek cümleleri sesli söyle.',
      minutes: 12,
      to: '/grammar',
    })
    tasks.push({
      id: 'drill:sozluk',
      kind: 'read',
      title: 'Kelime tekrarı',
      detail: 'Sözlükten o dersin kelimelerine bak, bilmediklerini tekrar listesine ekle.',
      minutes: 8,
      to: '/dictionary',
    })
  }

  // ————— 4. Yazma —————
  //
  // El yazısı sınavda sorulmaz ama karakteri YAZABİLMEK, tanımayı da
  // sağlamlaştırıyor: çizerken karakterin parçalarına dikkat etmek zorundasın.
  tasks.push({
    id: 'write',
    kind: 'write',
    title: 'Yazı çalışması',
    detail:
      rota.stageId === 'hiragana' || rota.stageId === 'katakana'
        ? 'Birkaç karakteri çizerek yaz — çizgi sırası denetlensin.'
        : 'O dersin kanjilerini çizerek yaz.',
    minutes: 10,
    to: '/write',
  })

  // ————— 5. Takılan kartlar —————
  if (ctx.leeches > 0) {
    tasks.push({
      id: 'leech',
      kind: 'drill',
      title: 'Takıldığın kartlara bak',
      detail: `${ctx.leeches} kart sürekli unutuluyor. Aynı kartı tekrar görmek işe yaramıyorsa yöntemi değiştir — kendi hatırlatıcını yaz.`,
      minutes: 8,
      to: '/zorlandiklarim',
      optional: true,
    })
  }

  // ————— 6. Haftalık ölçüm —————
  //
  // Pazar günleri ölçüm günü: ilerlemeyi hissetmek motivasyonun yarısı.
  if (now.getDay() === 0 && (rota.stageId === 'hiragana' || rota.stageId === 'katakana')) {
    tasks.push({
      id: 'exam:hafta',
      kind: 'exam',
      title: 'Haftalık ölçüm',
      detail: 'Bitirme sınavına gir; geçen haftaya göre nerede olduğunu gör.',
      minutes: 20,
      to: '/hiragana-sinav',
      optional: true,
    })
  }

  // ————— 7. Dinleme / video —————
  tasks.push({
    id: 'video',
    kind: 'video',
    title: 'Dinleme (video)',
    detail: 'Gerçek Japonca duymadan telaffuz oturmuyor. Günde bir video yeter.',
    minutes: 10,
    to: '/kaynaklar',
    optional: true,
  })

  const minutes = tasks.reduce((a, t) => a + t.minutes, 0)

  // ————— Tempo değerlendirmesi —————
  let pace: DailyPlan['pace']
  if (kalanDers === 0) {
    pace = { state: 'ahead', text: 'Bütün dersler bitti. Kalan süre tekrar ve deneme için.' }
  } else if (lessonsPerWeek <= 2) {
    pace = { state: 'ahead', text: `Haftada ${lessonsPerWeek} ders yeterli — rahat bir tempo.` }
  } else if (lessonsPerWeek <= 4) {
    pace = { state: 'ontrack', text: `Haftada ${lessonsPerWeek} ders bitirmen gerekiyor. Günde bir bölüm ile tutar.` }
  } else {
    pace = {
      state: 'behind',
      text: `Haftada ${lessonsPerWeek} ders gerekiyor — bu sıkışık. Günlük süreyi 1,5 saate çıkarman ya da hedefi sınav sonrasına yayman gerekebilir.`,
    }
  }

  return {
    tasks,
    minutes,
    daysLeft,
    lessonsPerWeek,
    pace,
    focus: stage ? `${stage.title} · ${rota.headline}` : rota.headline,
  }
}
