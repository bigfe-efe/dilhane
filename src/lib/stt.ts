// Mikrofon katmanı: konuşma tanıma (telaffuz puanlama) + ham ses kaydı.
//
// Not: Tarayıcıdaki konuşma tanıma (Web Speech API) Chrome/Edge'de sunucu taraflıdır,
// yani internet ister. İnternet yokken uygulama otomatik olarak "kaydet ve karşılaştır"
// moduna düşer: kendi sesini kaydedip model sesle yan yana dinlersin.
import type { Lang } from '@/types'

const LOCALE: Record<Lang, string> = { ja: 'ja-JP' }

type SpeechRecognitionCtor = new () => any

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function sttAvailable(): boolean {
  return getRecognitionCtor() !== null
}

export interface RecognitionResult {
  transcript: string
  alternatives: string[]
  confidence: number
}

export class RecognitionError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
  }
}

const ERROR_TR: Record<string, string> = {
  'no-speech': 'Ses algılanmadı. Mikrofona biraz daha yakın konuş.',
  'audio-capture': 'Mikrofona erişilemedi. Cihaz bağlı mı?',
  'not-allowed': 'Mikrofon izni verilmedi. Tarayıcı ayarlarından izin ver.',
  network: 'Konuşma tanıma için internet gerekiyor. Kayıt moduna geçebilirsin.',
  aborted: 'Kayıt iptal edildi.',
  'language-not-supported': 'Bu dil için konuşma tanıma desteklenmiyor.',
}

/** Tek seferlik dinleme. Kullanıcı konuşmayı bitirince çözülür. */
export function listenOnce(lang: Lang, timeoutMs = 10000): { promise: Promise<RecognitionResult>; stop: () => void } {
  const Ctor = getRecognitionCtor()
  if (!Ctor) {
    return {
      promise: Promise.reject(new RecognitionError('Bu tarayıcı konuşma tanımayı desteklemiyor.', 'unsupported')),
      stop: () => {},
    }
  }

  const rec = new Ctor()
  rec.lang = LOCALE[lang]
  rec.interimResults = false
  rec.maxAlternatives = 5
  rec.continuous = false

  let settled = false
  const promise = new Promise<RecognitionResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try {
        rec.abort()
      } catch {
        /* yoksay */
      }
      reject(new RecognitionError('Süre doldu, ses algılanmadı.', 'no-speech'))
    }, timeoutMs)

    rec.onresult = (e: any) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const res = e.results[0]
      const alternatives: string[] = []
      for (let i = 0; i < res.length; i++) alternatives.push(res[i].transcript)
      resolve({ transcript: res[0].transcript, alternatives, confidence: res[0].confidence ?? 0 })
    }
    rec.onerror = (e: any) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const code = e.error ?? 'unknown'
      reject(new RecognitionError(ERROR_TR[code] ?? `Tanıma hatası: ${code}`, code))
    }
    rec.onend = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(new RecognitionError('Ses algılanmadı.', 'no-speech'))
    }
  })

  try {
    rec.start()
  } catch {
    /* zaten başlamışsa yoksay */
  }

  return {
    promise,
    stop: () => {
      try {
        rec.stop()
      } catch {
        /* yoksay */
      }
    },
  }
}

// ————————————————————————— Puanlama —————————————————————————

/** Karşılaştırma öncesi metni sadeleştirir: noktalama, boşluk, büyük/küçük harf. */
export function normalize(text: string, lang: Lang): string {
  let t = text.trim().toLowerCase()
  // Japonca ve Latin noktalama.
  // Tam genişlikli biçimler (．，！？), tipografik tırnaklar ve 〜/～ de burada:
  // Japonca klavyeyle yazarken bunlar kolayca çıkıyor ve iki taraf arasında
  // yapay uyuşmazlık yaratıyordu. ー (uzatma çizgisi) BİLEREK dışarıda —
  // o noktalama değil, sesin parçası.
  t = t.replace(
    /[。、！？「」『』・…，．；：〜～‘’“”–—,.!?;:'\"()\[\]{}‐-]/g,
    '',
  )
  if (lang === 'ja') {
    // Katakana → hiragana, tam genişlikli boşlukları temizle
    t = t.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    t = t.replace(/[\s　]/g, '')
  } else {
    t = t.replace(/\s+/g, ' ')
  }
  return t
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

/** 0–100 arası benzerlik. Japoncada hem kanji hem kana yazımı kabul edilir. */
export function similarity(said: string, expected: string, lang: Lang): number {
  const a = normalize(said, lang)
  const b = normalize(expected, lang)
  if (!b.length) return 0
  const dist = levenshtein(a, b)
  return Math.max(0, Math.round((1 - dist / Math.max(a.length, b.length)) * 100))
}

/** Birden fazla kabul edilebilir yazım (ör. kanji + kana okunuşu) arasından en iyisini alır. */
export function scoreAgainst(said: string, accepted: string[], lang: Lang): number {
  return accepted.reduce((best, exp) => Math.max(best, similarity(said, exp, lang)), 0)
}

export function scoreLabel(score: number): { text: string; tone: 'great' | 'ok' | 'weak' } {
  if (score >= 90) return { text: 'Mükemmel', tone: 'great' }
  if (score >= 75) return { text: 'İyi', tone: 'great' }
  if (score >= 55) return { text: 'Anlaşılıyor', tone: 'ok' }
  return { text: 'Tekrar dene', tone: 'weak' }
}

/** Hangi kelimelerin tutmadığını göstermek için basit kelime bazlı karşılaştırma. */
export function diffWords(said: string, expected: string, lang: Lang): { word: string; ok: boolean }[] {
  if (lang === 'ja') {
    const a = normalize(said, lang)
    return normalize(expected, lang)
      .split('')
      .map((ch, i) => ({ word: ch, ok: a[i] === ch }))
  }
  const saidWords = new Set(normalize(said, lang).split(' '))
  return normalize(expected, lang)
    .split(' ')
    .map((w) => ({ word: w, ok: saidWords.has(w) }))
}

// ————————————————————————— Ham kayıt (offline yedek) —————————————————————————

export interface Recorder {
  stop: () => Promise<string>
  cancel: () => void
}

/** Mikrofonu kaydeder, durdurulunca çalınabilir bir blob URL döndürür. */
export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const chunks: BlobPart[] = []
  const rec = new MediaRecorder(stream)
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data)
  }
  rec.start()

  const cleanup = () => stream.getTracks().forEach((t) => t.stop())

  return {
    stop: () =>
      new Promise<string>((resolve) => {
        rec.addEventListener(
          'stop',
          () => {
            cleanup()
            resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })))
          },
          { once: true },
        )
        rec.stop()
      }),
    cancel: () => {
      try {
        rec.stop()
      } catch {
        /* yoksay */
      }
      cleanup()
    },
  }
}
