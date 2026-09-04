import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Lang } from '@/types'
import { Icon, type IconName } from './icons'
import { onVoicesChanged, speak, speechMode, stopSpeaking, type SpeechMode } from '@/lib/tts'
import { romajiOf } from '@/lib/ja-phonetic'

export function TopBar({
  title,
  sub,
  back,
  right,
}: {
  title: string
  sub?: string
  back?: boolean | string
  right?: ReactNode
}) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back && (
        <button
          className="iconbtn"
          aria-label="Geri"
          onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}
        >
          ‹
        </button>
      )}
      <div style={{ minWidth: 0 }}>
        <h1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="spacer" />
      {right}
    </header>
  )
}

export function Badge({
  children,
  tone,
}: {
  children: ReactNode
  tone?: 'ja' | 'en' | 'ok' | 'warn' | 'bad' | 'accent'
}) {
  return <span className={`badge${tone ? ` badge--${tone}` : ''}`}>{children}</span>
}

export function Bar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="bar">
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Ring({ percent, size = 54, label }: { percent: number; size?: number; label?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className="ring" style={{ ['--p' as string]: p, ['--size' as string]: `${size}px` }}>
      <span>{label ?? `${p}%`}</span>
    </div>
  )
}

/** Cihazın ses listesi geç yüklenir; değişince bileşenleri yeniden çizer. */
export function useSpeechMode(lang: Lang, text = ''): SpeechMode {
  return useSyncExternalStore(
    onVoicesChanged,
    () => speechMode(lang, text),
    () => 'none' as SpeechMode,
  )
}

const MODE_TITLE: Record<SpeechMode, string> = {
  file: 'Gömülü ses kaydı · Dokun: normal · Basılı tut: yavaş',
  native: 'Cihazın kendi sesi · Dokun: normal · Basılı tut: yavaş',
  approx: 'Cihazda Japonca ses yok — Türkçe sesle YAKLAŞIK okuma. Ayarlar’dan Japonca sesi kurabilirsin.',
  none: 'Bu cihazda seslendirme yapılamıyor. Ayarlar → Ses bölümüne bak.',
}

/** Metni seslendiren küçük buton. Uzun basınca yavaş okur. */
export function SpeakBtn({
  text,
  lang,
  size = 'md',
  label,
  reading,
}: {
  text: string
  lang: Lang
  size?: 'sm' | 'md'
  label?: string
  /** Kanji içeren metinlerde kana okunuşu — yaklaşık okuma bunu kullanır */
  reading?: string
}) {
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | null>(null)
  const slow = useRef(false)
  const mode = useSpeechMode(lang, text)

  const run = async () => {
    setBusy(true)
    await speak(text, lang, { rate: slow.current ? 0.6 : undefined, reading })
    slow.current = false
    setBusy(false)
  }

  const down = () => {
    timer.current = window.setTimeout(() => {
      slow.current = true
    }, 450)
  }
  const up = () => {
    if (timer.current) window.clearTimeout(timer.current)
  }

  useEffect(() => () => stopSpeaking(), [])

  return (
    <button
      className={`iconbtn speakbtn speakbtn--${mode}${busy ? ' pulse' : ''}`}
      style={size === 'sm' ? { width: 32, height: 32, fontSize: '0.9rem' } : undefined}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onClick={run}
      aria-label={label ?? 'Seslendir'}
      title={MODE_TITLE[mode]}
    >
      <Icon name={mode === 'none' ? 'speakerOff' : 'speaker'} size={size === 'sm' ? 15 : 17} />
      {mode === 'approx' && <i className="speakbtn-tag">≈</i>}
    </button>
  )
}

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="sheet" onClick={onClose}>
      <div className="inner" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Chips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="chips">
      {items.map((it) => (
        <button key={it.id} className={`chip${it.id === value ? ' active' : ''}`} onClick={() => onChange(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon = 'layers', text }: { icon?: IconName; text: string }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={22} />
      </span>
      <div className="small">{text}</div>
    </div>
  )
}

/**
 * Furigana destekli Japonca metin: "漢字[かんじ]" biçimini ruby'ye çevirir.
 *
 * Japoncada boşluk olmadığı için taban yalnızca köşeli parantezin hemen
 * önündeki KANJI dizisi kabul edilir. (Aksi hâlde "は学生[がくせい]" gibi bir
 * parçada okunuş は'nın da üstüne yayılırdı.)
 */
const FURIGANA = /([㐀-鿿々〆ヶ]+\[[^\]]+\])/g

export function JaText({ text, className = 'ja-text' }: { text: string; className?: string }) {
  const parts = text.split(FURIGANA).filter(Boolean)
  return (
    <span className={className}>
      {parts.map((p, i) => {
        const m = p.match(/^([㐀-鿿々〆ヶ]+)\[([^\]]+)\]$/)
        if (!m) return <span key={i}>{p}</span>
        return (
          <ruby key={i}>
            {m[1]}
            <rt>{m[2]}</rt>
          </ruby>
        )
      })}
    </span>
  )
}

/** Furigana işaretlemesini söker: "私[わたし]は" → "私は" */
export function stripFurigana(text: string): string {
  return text.replace(/\[[^\]]+\]/g, '')
}

/**
 * Furiganalı metnin tamamen kana okunuşu: "私[わたし]は" → "わたしは"
 * Seslendirme bunu kullanır — kanjiyi okuyamayan ses motoruna okunuşu verir.
 */
export function furiganaReading(text: string): string {
  return text.replace(/[㐀-鿿々〆ヶ]+\[([^\]]+)\]/g, '$1')
}

/**
 * Romaji okunuşu — yazıldığı gibi okunmayan ekler PARANTEZ İÇİNDE belirtilir.
 *
 * NEDEN BÖYLE:
 * こんばんは harf harf çevrilince "konbanha" çıkar ama doğrusu "konbanwa" —
 * sondaki は konu ekidir (今晩は). Uygulama sekiz ayrı yerde ham toRomaji
 * çağırıyordu ve hepsi bu yanlışı gösteriyordu.
 *
 * Düzeltmeyi SESSİZCE yapmak da yanlış olurdu: kuralı bilmeyen biri
 * "こんばんは'nin sonu zaten wa okunur" sanır ve は→wa kuralını hiç
 * öğrenmez. Bu yüzden ne değiştiği yazılıyor:  konbanwa (は→wa)
 */
export function RomajiText({ reading }: { reading?: string | null }) {
  if (!reading) return null
  const { text, notes } = romajiOf(reading)
  return (
    <>
      {text}
      {notes.length > 0 && (
        <span className="romaji-note">
          {' ('}
          {notes.map((n) => n.kana + '→' + n.as).join(', ')}
          {')'}
        </span>
      )}
    </>
  )
}
