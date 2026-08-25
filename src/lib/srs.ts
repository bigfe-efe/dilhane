// Aralıklı tekrar (spaced repetition) — SM-2'nin sadeleştirilmiş, Anki'ye yakın bir uyarlaması.
// Kart durumu tamamen saf fonksiyonlarla hesaplanır; depolama katmanından bağımsızdır.

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export type CardPhase = 'new' | 'learning' | 'review' | 'relearning'

export interface CardState {
  phase: CardPhase
  /** Kolaylık çarpanı — 1.3 alt sınır */
  ease: number
  /** Gün cinsinden tekrar aralığı (review kartları için) */
  interval: number
  /** Öğrenme adımlarında kaçıncı basamakta */
  step: number
  /** Bir sonraki tekrar zamanı (epoch ms) */
  due: number
  reps: number
  lapses: number
}

/** Öğrenme basamakları — dakika cinsinden */
const LEARNING_STEPS = [1, 10]
const RELEARNING_STEPS = [10]
const GRADUATING_INTERVAL = 1 // gün
const EASY_INTERVAL = 4 // gün
const MIN_EASE = 1.3
const MAX_INTERVAL = 365 * 2

const MIN = 60_000
const DAY = 86_400_000

export function newCard(now = Date.now()): CardState {
  return { phase: 'new', ease: 2.5, interval: 0, step: 0, due: now, reps: 0, lapses: 0 }
}

/** Küçük rastgele sapma — kartların aynı güne yığılmasını engeller (±5%) */
function fuzz(days: number): number {
  if (days < 2.5) return days
  const spread = Math.max(1, Math.round(days * 0.05))
  return days + (Math.floor(Math.random() * (spread * 2 + 1)) - spread)
}

export function review(card: CardState, rating: Rating, now = Date.now()): CardState {
  const next: CardState = { ...card, reps: card.reps + 1 }

  if (card.phase === 'new' || card.phase === 'learning') {
    const steps = LEARNING_STEPS
    if (rating === 'again') {
      next.phase = 'learning'
      next.step = 0
      next.due = now + steps[0] * MIN
      return next
    }
    if (rating === 'easy') {
      next.phase = 'review'
      next.step = 0
      next.interval = EASY_INTERVAL
      next.due = now + EASY_INTERVAL * DAY
      return next
    }
    // hard: aynı basamağı tekrarla, good: bir sonrakine geç
    const step = rating === 'hard' ? card.step : card.step + 1
    if (step >= steps.length) {
      next.phase = 'review'
      next.step = 0
      next.interval = GRADUATING_INTERVAL
      next.due = now + GRADUATING_INTERVAL * DAY
      return next
    }
    next.phase = 'learning'
    next.step = step
    next.due = now + steps[step] * MIN
    return next
  }

  if (card.phase === 'relearning') {
    if (rating === 'again') {
      next.step = 0
      next.due = now + RELEARNING_STEPS[0] * MIN
      return next
    }
    const step = rating === 'hard' ? card.step : card.step + 1
    if (step >= RELEARNING_STEPS.length) {
      next.phase = 'review'
      next.step = 0
      next.interval = Math.max(1, Math.round(card.interval))
      next.due = now + next.interval * DAY
      return next
    }
    next.step = step
    next.due = now + RELEARNING_STEPS[step] * MIN
    return next
  }

  // review kartı
  if (rating === 'again') {
    next.phase = 'relearning'
    next.step = 0
    next.lapses = card.lapses + 1
    next.ease = Math.max(MIN_EASE, card.ease - 0.2)
    next.interval = Math.max(1, card.interval * 0.5)
    next.due = now + RELEARNING_STEPS[0] * MIN
    return next
  }

  let ease = card.ease
  let interval: number
  if (rating === 'hard') {
    ease = Math.max(MIN_EASE, card.ease - 0.15)
    interval = card.interval * 1.2
  } else if (rating === 'good') {
    interval = card.interval * ease
  } else {
    ease = card.ease + 0.15
    interval = card.interval * ease * 1.3
  }

  interval = Math.min(MAX_INTERVAL, Math.max(1, fuzz(interval)))
  next.ease = ease
  next.interval = interval
  next.phase = 'review'
  next.due = now + interval * DAY
  return next
}

/** Bir sonraki aralığın kullanıcıya gösterilecek etiketi ("10 dk", "3 gün", "2 ay") */
export function previewInterval(card: CardState, rating: Rating, now = Date.now()): string {
  const after = review(card, rating, now)
  const ms = after.due - now
  if (ms < 60 * MIN) return `${Math.max(1, Math.round(ms / MIN))} dk`
  if (ms < DAY) return `${Math.round(ms / (60 * MIN))} sa`
  const days = ms / DAY
  if (days < 30) return `${Math.round(days)} gün`
  if (days < 365) return `${(days / 30).toFixed(days < 60 ? 1 : 0)} ay`
  return `${(days / 365).toFixed(1)} yıl`
}

export function isDue(card: CardState, now = Date.now()): boolean {
  return card.due <= now
}

// ————————————————————————— Takılan kartlar (leech) —————————————————————————
//
// Bazı kartlar sürekli unutulur: öğrenirsin, tekrar gelir, yine bilemezsin.
// Aralıklı tekrar bunu kendi başına çözmez — kart her unutulduğunda aralık
// kısalır, kart daha sık gelir, sen daha çok sinirlenirsin. Buna Anki
// terminolojisinde "leech" (asalak) denir: zamanının orantısız bir kısmını
// yiyen kart.
//
// Çözüm algoritmik değil, insanidir: o kartı fark edip ONA ÖZEL bir şey
// yapmak gerekir — hatırlatıcı uydurmak, kelimeyi cümle içinde görmek,
// karışan çiftini yan yana koymak. Uygulamanın işi, kartı öne çıkarmaktır.

/** Kaç kez unutulunca "zorlanıyorsun" sayılır. */
export const STRUGGLE_THRESHOLD = 3
/** Kaç kez unutulunca "takıldın" sayılır. */
export const LEECH_THRESHOLD = 6

export type LeechLevel = 'none' | 'struggling' | 'leech'

export function leechLevel(card: Pick<CardState, 'lapses'>): LeechLevel {
  if (card.lapses >= LEECH_THRESHOLD) return 'leech'
  if (card.lapses >= STRUGGLE_THRESHOLD) return 'struggling'
  return 'none'
}

export function isLeech(card: Pick<CardState, 'lapses'>): boolean {
  return card.lapses >= LEECH_THRESHOLD
}
