import type { ReactNode } from 'react'
import { romajiWords } from '@/lib/ja-phonetic'

/**
 * Japonca örneğin standart gösterimi — bütün uygulamada aynı sıra:
 *
 *   私は学生です。          ← yazılış (kanjili)
 *   watashi wa gakusei desu ← romaji
 *   わたしはがくせいです。  ← kana
 *   Ben öğrenciyim.         ← Türkçe
 *
 * NEDEN TEK BİLEŞEN: romaji önceden yalnızca birkaç yerde ve her yerde farklı
 * sırada duruyordu (kimi yerde kanadan sonra, kimi yerde hiç yok). Öğrenci
 * gözünü her ekranda aynı yere götürebilmeli; sıra burada bir kez tanımlı.
 *
 * Romaji `romajiWords` ile üretiliyor: kelimeler ayrı yazılır ve ekler
 * okunduğu gibi gösterilir (は → wa, へ → e, を → o).
 */
export function JaOkunus({
  ja,
  kana,
  tr,
  jaClass = 'jo-ja',
  latin,
  gizle,
  children,
}: {
  ja: string
  /** Kana okunuşu; verilmezse ve yazılış zaten kanaysa ondan üretilir */
  kana?: string | null
  tr?: ReactNode
  /** Yazılış satırının sınıfı — kelime kartında büyük, cümlede orta */
  jaClass?: string
  /** Elle yazılmış romaji (otomatik bölmenin tutmadığı yerler için) */
  latin?: string
  /** Okuma alıştırmasında satırları gizlemek için (ünite metni anahtarları) */
  gizle?: { romaji?: boolean; kana?: boolean }
  /** Türkçenin altına eklenecek not vb. */
  children?: ReactNode
}) {
  const saltKana = /^[぀-ヿー\s、。？！!?「」（）()〜・]+$/.test(ja)
  const okunus = kana ?? (saltKana ? ja : null)
  const romaji = latin ?? (okunus ? romajiWords(ja, okunus) : null)

  return (
    <>
      <div className={`ja ${jaClass}`}>{ja}</div>
      {romaji && !gizle?.romaji && <div className="jo-romaji">{romaji}</div>}
      {okunus && okunus !== ja && !gizle?.kana && <div className="ja jo-kana">{okunus}</div>}
      {tr && <div className="jo-tr">{tr}</div>}
      {children}
    </>
  )
}
