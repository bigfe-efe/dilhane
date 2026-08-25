// Seslendirme katmanı.
// Öncelik sırası:
//   1) Build sırasında ElevenLabs ile üretilip uygulamaya gömülmüş mp3 (tamamen offline, en iyi kalite)
//   2) Cihazın kendi Japonca/İngilizce sesi (Web Speech API)
//   3) Japoncada son çare: Türkçe (ya da başka) sesle YAKLAŞIK okuma —
//      kana romaji'ye, romaji Türkçe yazıma çevrilip okutulur.
//
// (3) neden var: Windows'ta Japonca konuşma paketi kurulu değilse tarayıcı
// kana metnini sessizce yutar — kullanıcı hoparlör simgesini görür ama hiç ses
// duymaz. Yaklaşık okuma, sessizlikten iyidir; gerçek Japonca ses kurulunca
// kendiliğinden devre dışı kalır.
import type { Lang } from '@/types'
import { jaToTurkishSpeech } from '@/lib/ja-phonetic'
import { hasKanji, lookupReading } from '@/lib/ja-reading'

const LOCALE: Record<Lang, string> = { ja: 'ja-JP' }

/** public/audio/manifest.json — gen-audio.ts tarafından üretilir. */
let manifest: Record<string, string> | null = null
let manifestLoaded = false

export async function loadAudioManifest(): Promise<void> {
  if (manifestLoaded) return
  manifestLoaded = true
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    if (res.ok) manifest = await res.json()
  } catch {
    manifest = null
  }
}

/** Metin için gömülü ses dosyası varsa yolunu döndürür. */
export function audioFileFor(lang: Lang, text: string): string | null {
  const key = `${lang}:${text}`
  const file = manifest?.[key]
  return file ? `${import.meta.env.BASE_URL}audio/${file}` : null
}

// ————————————————————————— Cihaz sesleri —————————————————————————

let voices: SpeechSynthesisVoice[] = []
const voiceListeners = new Set<() => void>()

function refreshVoices() {
  if (typeof speechSynthesis === 'undefined') return
  const next = speechSynthesis.getVoices()
  if (next.length === voices.length) return
  voices = next
  for (const fn of voiceListeners) fn()
}

if (typeof speechSynthesis !== 'undefined') {
  refreshVoices()
  speechSynthesis.addEventListener('voiceschanged', refreshVoices)
  // Bazı tarayıcılarda 'voiceschanged' hiç tetiklenmez — birkaç kez yokla
  for (const ms of [200, 600, 1500]) setTimeout(refreshVoices, ms)
}

/** Ses listesi değiştiğinde haber verir (React bileşenleri yeniden çizsin diye). */
export function onVoicesChanged(fn: () => void): () => void {
  voiceListeners.add(fn)
  return () => voiceListeners.delete(fn)
}

export function voicesFor(lang: Lang): SpeechSynthesisVoice[] {
  const prefix = lang === 'ja' ? 'ja' : 'en'
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix))
}

/** Cihazda o dil için hiç ses yoksa kullanıcıyı uyarabilmek için. */
export function hasVoice(lang: Lang): boolean {
  return voicesFor(lang).length > 0
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const list = voicesFor(lang)
  if (!list.length) return undefined
  const preferredName = localStorage.getItem(`voice:${lang}`)
  if (preferredName) {
    const match = list.find((v) => v.name === preferredName)
    if (match) return match
  }
  // Yerel (offline) sesleri tercih et
  return list.find((v) => v.localService) ?? list[0]
}

export function setPreferredVoice(lang: Lang, name: string): void {
  localStorage.setItem(`voice:${lang}`, name)
}

export function getPreferredVoice(lang: Lang): string | null {
  return localStorage.getItem(`voice:${lang}`)
}

// ————————————— Japonca sesi yoksa: yaklaşık okuma —————————————

const APPROX_KEY = 'ja:approx'

/** Yaklaşık okuma açık mı? (varsayılan: açık) */
export function approxEnabled(): boolean {
  return localStorage.getItem(APPROX_KEY) !== 'off'
}

export function setApproxEnabled(on: boolean): void {
  localStorage.setItem(APPROX_KEY, on ? 'on' : 'off')
}

/** Yaklaşık okumada kullanılacak ses: önce Türkçe, sonra İspanyolca/İtalyanca, sonra ne varsa. */
export function approxVoice(): SpeechSynthesisVoice | undefined {
  const byLang = (p: string) => voices.find((v) => v.lang.toLowerCase().startsWith(p))
  return byLang('tr') ?? byLang('es') ?? byLang('it') ?? byLang('fi') ?? voices[0]
}

export type SpeechMode = 'file' | 'native' | 'approx' | 'none'

/** Bir metnin hangi yolla seslendirileceğini önceden söyler — arayüz uyarısı için. */
export function speechMode(lang: Lang, text = ''): SpeechMode {
  if (text && audioFileFor(lang, text)) return 'file'
  if (hasVoice(lang)) return 'native'
  if (lang === 'ja' && approxEnabled() && approxVoice()) return 'approx'
  return 'none'
}

// ————————————————————————— Çalma —————————————————————————

let currentAudio: HTMLAudioElement | null = null

export function stopSpeaking(): void {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

export interface SpeakOptions {
  rate?: number
  /** Aynı metni tekrar tekrar çalarken kesme */
  interrupt?: boolean
  /**
   * Kanji içeren metinlerde kana okunuşu. Yaklaşık okuma bu alanı kullanır;
   * verilmezse kanji sessiz kalır.
   */
  reading?: string
}

function utter(text: string, locale: string, voice: SpeechSynthesisVoice | undefined, rate: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = locale
    u.rate = rate
    if (voice) u.voice = voice
    u.addEventListener('end', () => resolve(), { once: true })
    u.addEventListener('error', () => resolve(), { once: true })
    speechSynthesis.speak(u)
    // Bazı tarayıcılarda 'end' hiç gelmez — güvenlik ağı
    setTimeout(resolve, Math.min(15000, 1200 + text.length * 120))
  })
}

/**
 * Metni seslendirir. Gömülü mp3 → cihaz sesi → yaklaşık okuma sırasıyla dener.
 * Hangi yolun kullanıldığını döndürür.
 */
export async function speak(text: string, lang: Lang, opts: SpeakOptions = {}): Promise<SpeechMode> {
  const { rate = Number(localStorage.getItem(`rate:${lang}`) ?? 1), interrupt = true, reading } = opts
  if (interrupt) {
    stopSpeaking()
    // Chrome'da cancel()'ın hemen ardından speak() çağırmak sesi düşürebiliyor
    await new Promise((r) => setTimeout(r, 40))
  }

  const file = audioFileFor(lang, text)
  if (file) {
    const audio = new Audio(file)
    audio.playbackRate = rate
    currentAudio = audio
    try {
      await audio.play()
      await new Promise<void>((resolve) => {
        audio.addEventListener('ended', () => resolve(), { once: true })
        audio.addEventListener('error', () => resolve(), { once: true })
      })
      return 'file'
    } catch {
      // Dosya çalınamadıysa cihaz sesine düş
    } finally {
      if (currentAudio === audio) currentAudio = null
    }
  }

  if (typeof speechSynthesis === 'undefined') return 'none'

  const native = pickVoice(lang)
  if (native) {
    await utter(text, LOCALE[lang], native, rate)
    return 'native'
  }

  // Japonca sesi yok. Kana metnini İngilizce motora vermek sessizlik demek;
  // onun yerine Türkçe okunuşa çevirip mevcut bir sesle okut.
  if (lang === 'ja' && approxEnabled()) {
    const voice = approxVoice()
    // Okunuş verilmediyse içerikten bulmayı dene — kanji romaji'ye çevrilemez
    const source = reading ?? (hasKanji(text) ? (lookupReading(text) ?? text) : text)
    const spoken = jaToTurkishSpeech(source)
    if (voice && spoken.trim()) {
      // Yaklaşık okuma biraz yavaş daha anlaşılır
      await utter(spoken, voice.lang, voice, Math.min(rate, 0.95))
      return 'approx'
    }
  }

  return 'none'
}

export function setRate(lang: Lang, rate: number): void {
  localStorage.setItem(`rate:${lang}`, String(rate))
}

export function getRate(lang: Lang): number {
  return Number(localStorage.getItem(`rate:${lang}`) ?? 1)
}
