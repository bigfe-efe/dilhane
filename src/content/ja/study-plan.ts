
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

/**
 * Sınav tarihi artık koda gömülü DEĞİL, ayarlardan geliyor ve boş olabilir.
 *
 * NEDEN: tarih sabit olduğu sürece sınav ertelendiğinde uygulama yanlış bir
 * güne geri sayıyor ve o güne göre "haftada şu kadar ders bitir" diye tempo
 * dayatıyordu. Tarihi olmayan biri için geri sayım anlamsızdır; anlamlı olan
 * ilerlemedir. Bu yüzden `null` geçerli bir durum ve her yerde ele alınıyor.
 *
 * Tarih girildiğinde eski davranışın tamamı geri gelir.
 */
export const EXAM_DATE_KEY = 'exam.date'

/** Ayarlarda saklanan 'YYYY-MM-DD' metnini yerel tarihe çevirir. */
export function parseExamDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Sınava kalan gün. Tarih yoksa null — "0 gün kaldı" yanlış olurdu. */
export function daysUntilExam(examDate: Date | null, now = new Date()): number | null {
  if (!examDate) return null
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const b = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate())
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

/** Bir ünitenin plan için gereken durumu — sayfa katmanından bağımsız */
export interface UnitState {
  id: string
  no: number
  title: string
  status?: 'in-progress' | 'completed'
  homeworkDone: number
  homeworkTotal: number
  testBest: number
}

export interface PlanContext {
  /** Bugünün anahtarı, YYYY-MM-DD */
  day: string
  dueCards: number
  /** Üniteler, sırasıyla */
  units: UnitState[]
  /** Hedeflenen sınav günü; belirlenmemişse null */
  examDate: Date | null
  /**
   * Testi yapılmamış en yeni gün sonu kaydı.
   *
   * Kullanıcı bazı günler plana uymayıp kendi kafasına göre çalışıyor ve bunu
   * "Gün sonu" sayfasında işaretliyor. Ertesi gün o kayıttan bir tekrar testi
   * çıkıyor.
   */
  pendingSession?: { day: string; chars: number } | null
  leeches: number
  /** Çözülmüş resmî örnek sınav setleri ('2018', '2012') */
  resmiSetler?: string[]
}

export interface DailyPlan {
  tasks: DailyTask[]
  /** Toplam tahmini süre */
  minutes: number
  /** Sınava kalan gün; tarih belirlenmemişse null */
  daysLeft: number | null
  /** Tempo: haftada kaç ünite bitmeli. Sınav tarihi yoksa null. */
  unitsPerWeek: number | null
  /** Programa göre durumun */
  pace: { state: 'ahead' | 'ontrack' | 'behind'; text: string }
  /** Bugünün tek cümlelik odağı */
  focus: string
}

// ————————————————————————— Ünitede sıradaki adım —————————————————————————

export interface UnitStep {
  /** Ünite sayfasında açılacak sekme */
  tab: 'hedef' | 'odev' | 'test'
  title: string
  detail: string
}

/**
 * Ünitenin içinde bir sonraki iş.
 *
 * Ünite sayfası hangi sekmenin okunduğunu kaydetmiyor; kaydettiği iki şey
 * ödev işaretleri ve test sonucu. Adım bu ikisinden çıkarılıyor: hiç kayıt
 * yoksa başlanmamıştır, ödev eksikse ödev, ödev bittiyse test.
 */
export function unitStep(u: UnitState): UnitStep {
  if (!u.status) {
    return {
      tab: 'hedef',
      title: 'Başla',
      detail: 'Hedefleri oku, sonra sırayla dilbilgisi, kelime ve metin. Bugün metni sesli okuyabilecek kadar ilerle.',
    }
  }
  if (u.homeworkDone < u.homeworkTotal) {
    return {
      tab: 'odev',
      title: `Ödevler (${u.homeworkDone}/${u.homeworkTotal})`,
      detail: 'Kâğıt üstünde yap; her ödevin içinde adım adım yol ve örnek var. Takılırsan dilbilgisi sekmesine dön.',
    }
  }
  return {
    tab: 'test',
    title: u.testBest > 0 ? `Testi tekrar çöz (en iyi %${u.testBest})` : 'Ünite testi',
    detail: '%70 ile ünite tamamlanır ve kelimeleri tekrar listene girer.',
  }
}

// ————————————————————————— Tempo hesabı —————————————————————————

/**
 * Sınava yetişmek için haftada kaç ünite bitmeli?
 *
 * Son üç hafta tekrar ve deneme sınavına ayrılıyor — yeni konu öğrenerek
 * sınava girmek işe yaramaz. Tarih yoksa "haftada kaç" diye bir cevap YOKTUR,
 * uydurmak yerine null dönülüyor.
 */
function pacing(completed: number, total: number, daysLeft: number | null) {
  const kalan = Math.max(0, total - completed)
  if (daysLeft === null) return { kalan, unitsPerWeek: null }
  const calismaGunu = Math.max(1, daysLeft - 21)
  const hafta = calismaGunu / 7
  return { kalan, unitsPerWeek: Math.max(1, Math.ceil(kalan / Math.max(1, hafta))) }
}

// ————————————————————————— Plan üretimi —————————————————————————
//
// NEDEN ÜNİTELER: plan önceden Genki derslerine ve kana sınavlarına bakıyordu.
// Ana yol Üniteler olunca "Bugün" listesi öğrencinin hiç açmadığı derslere
// gönderiyor, tempo da bitirilmeyen derslere göre "geride kaldın" diyordu.
// Öğretmen tarafı öğrencinin fiilen izlediği yolu izlemeli.

export function buildDailyPlan(ctx: PlanContext, now = new Date()): DailyPlan {
  const daysLeft = daysUntilExam(ctx.examDate, now)
  const biten = ctx.units.filter((u) => u.status === 'completed').length
  const { kalan, unitsPerWeek } = pacing(biten, ctx.units.length, daysLeft)
  const aktif = ctx.units.find((u) => u.status !== 'completed')
  const tasks: DailyTask[] = []

  // ————— 1. Tekrar: her şeyin önünde —————
  //
  // Aralıklı tekrar biriktiğinde geri dönülmez hâle gelir. Bekleyen kart varsa
  // günün ilk işi budur; yoksa görev listesine hiç konmaz.
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

  // ————— 1.5. Dünkü çalışmanın testi —————
  if (ctx.pendingSession) {
    tasks.push({
      id: `gunsonu:${ctx.pendingSession.day}`,
      kind: 'drill',
      title: 'Dünkü çalışmanın testi',
      detail: `Gün sonunda işaretlediğin ${ctx.pendingSession.chars} karakterden. Şıksız — okunuşu yaz, karakteri bul, kelimeyi yaz.`,
      minutes: 10,
      to: `/gun-sonu-testi/${ctx.pendingSession.day}`,
    })
  }

  // ————— 2. Ünite: günün asıl işi —————
  if (aktif) {
    const adim = unitStep(aktif)
    tasks.push({
      // Kimlik adımı da içeriyor: ödevi bitirip teste geçince yeni görev
      // "yapılmamış" olarak görünsün.
      id: `unite:${aktif.id}:${adim.tab}`,
      kind: 'lesson',
      title: `Ünite ${aktif.no} · ${adim.title}`,
      detail: `${aktif.title}. ${adim.detail}`,
      minutes: 25,
      to: `/unite/${aktif.id}?b=${adim.tab}`,
    })
  } else {
    // Üniteler bitti: resmî setler sırayla — 2018 hemen, 2012 son haftada.
    // İkisi de tek seferlik (gerçek sınavdan seçilmiş sorular); aradaki
    // günlerde ölçüm uygulamanın her seferinde yeniden kurulan denemesiyle.
    const resmi = new Set(ctx.resmiSetler ?? [])
    const sonHafta = daysLeft !== null && daysLeft <= 8
    if (!resmi.has('2018')) {
      tasks.push({
        id: 'resmi:2018',
        kind: 'exam',
        title: 'Resmî örnek sınav · 2018',
        detail: 'Bütün üniteler bitti. Gerçek sınavlardan seçilmiş sorularla, gerçek koşulda: tek oturum, süreli, kulaklıkla.',
        minutes: 110,
        to: '/resmi-sinav',
      })
    } else if (sonHafta && !resmi.has('2012')) {
      tasks.push({
        id: 'resmi:2012',
        kind: 'exam',
        title: 'Resmî örnek sınav · 2012',
        detail: 'Sınavdan önceki son prova. Sonucu 2018 ile karşılaştır; kalan günleri en zayıf tipe ayır.',
        minutes: 110,
        to: '/resmi-sinav',
      })
    } else {
      tasks.push({
        id: 'deneme',
        kind: 'exam',
        title: 'N5 deneme sınavı',
        detail: 'Her seferinde yeni sorularla kurulur. Süreli çöz, en zayıf tipine dön.',
        minutes: 60,
        to: '/n5-deneme',
      })
    }
  }

  // ————— 3. Kanji —————
  tasks.push({
    id: 'kanji:kart',
    kind: 'drill',
    title: 'Kanji kartları',
    detail: 'Günde 3–4 kanji: çizimi izle, kâğıda yaz, örnek kelimeleri sesli oku.',
    minutes: 10,
    to: '/kanji-kartlar',
  })

  // ————— 4. Dinleme —————
  //
  // Dinleme sınavda AYRI barajlı bölüm (60 üzerinden en az 19). Okuyarak
  // öğrenilen kelime kulakla tanınmıyor; bu beceri ayrıca çalışılmazsa
  // diğer bölümler ne kadar iyi olursa olsun sınav kaybedilebilir.
  tasks.push({
    id: 'dinleme',
    kind: 'video',
    title: 'Dinleme',
    detail: 'Fiyat, saat, tarih ve cümle dinle; duyduğunu yaz. Sınavın en çok sorduğu şeyler bunlar.',
    minutes: 10,
    to: '/dinleme',
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

  // ————— 6. Pazar: haftalık ölçüm —————
  if (now.getDay() === 0) {
    const sonDonem = daysLeft !== null && daysLeft <= 21
    tasks.push(
      sonDonem
        ? {
            id: 'exam:deneme',
            kind: 'exam',
            title: 'Haftalık deneme',
            detail: 'Son üç hafta: her pazar bir deneme. Süre tut, sonra yanlışlarını tek tek oku.',
            minutes: 60,
            to: '/n5-deneme',
            optional: true,
          }
        : {
            id: 'exam:kanji',
            kind: 'exam',
            title: 'Haftalık kanji testi',
            detail: 'Bu hafta gördüğün kanjiler cümle içinde oturmuş mu? Şıksız dene.',
            minutes: 10,
            to: '/kanji-testi',
            optional: true,
          },
    )
  }

  const minutes = tasks.reduce((a, t) => a + t.minutes, 0)

  // ————— Tempo değerlendirmesi —————
  let pace: DailyPlan['pace']
  if (unitsPerWeek === null) {
    pace = {
      state: 'ontrack',
      text:
        kalan === 0
          ? 'Bütün üniteler bitti. Sınav tarihi girersen tempo hesabı da geri gelir.'
          : 'Tempo yerine ilerleme gösteriliyor. Sınav tarihi girersen haftada kaç ünite bitirmen gerektiği hesaplanır.',
    }
  } else if (kalan === 0) {
    pace = { state: 'ahead', text: 'Bütün üniteler bitti. Kalan süre tekrar ve deneme için.' }
  } else if (unitsPerWeek <= 1) {
    pace = { state: 'ahead', text: `Haftada ${unitsPerWeek} ünite yeterli — rahat bir tempo.` }
  } else if (unitsPerWeek <= 2) {
    pace = {
      state: 'ontrack',
      text: `${kalan} ünite kaldı. Son üç haftayı pekiştirmeye ayırmak için haftada ${unitsPerWeek} ünite bitirmelisin.`,
    }
  } else {
    pace = {
      state: 'behind',
      text: `${kalan} ünite için haftada ${unitsPerWeek} ünite gerekiyor — sıkışık. Hafta sonları ikinci bir oturum eklemeyi düşün.`,
    }
  }

  return {
    tasks,
    minutes,
    daysLeft,
    unitsPerWeek,
    pace,
    focus: aktif ? `Ünite ${aktif.no} · ${aktif.title}` : 'Üniteler bitti · deneme ve tekrar',
  }
}
