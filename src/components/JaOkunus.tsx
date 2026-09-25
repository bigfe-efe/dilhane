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
  vurgu,
  vurguLatin,
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
  /** Japonca satırda renklendirilecek parçalar (ekler sayfası: は, の…) */
  vurgu?: string[]
  /** Romaji satırında renklendirilecek kelimeler (wa, no…) */
  vurguLatin?: string[]
  /** Türkçenin altına eklenecek not vb. */
  children?: ReactNode
}) {
  const saltKana = /^[぀-ヿー\s、。？！!?「」（）()〜・]+$/.test(ja)
  const okunus = kana ?? (saltKana ? ja : null)
  const romaji = latin ?? (okunus ? romajiWords(ja, okunus) : null)

  return (
    <>
      <div className={`ja ${jaClass}`}>{vurgu?.length ? vurgulaJa(ja, vurgu) : ja}</div>
      {romaji && !gizle?.romaji && (
        <div className="jo-romaji">{vurguLatin?.length ? vurgulaLatin(romaji, vurguLatin) : romaji}</div>
      )}
      {okunus && okunus !== ja && !gizle?.kana && <div className="ja jo-kana">{okunus}</div>}
      {tr && <div className="jo-tr">{tr}</div>}
      {children}
    </>
  )
}

/**
 * Japonca satırda ekleri renklendirir. En uzun eşleşme önce denenir (から
 * içindeki か'dan önce). で, ardından す/し geliyorsa ek değildir: です, でした.
 */
function vurgulaJa(ja: string, parcalar: string[]): ReactNode[] {
  const sirali = [...parcalar].sort((a, b) => b.length - a.length)
  const out: ReactNode[] = []
  let tampon = ''
  let i = 0
  while (i < ja.length) {
    const p = sirali.find((x) => ja.startsWith(x, i) && !(x === 'で' && /[すし]/.test(ja[i + 1] ?? '')))
    if (p) {
      if (tampon) out.push(tampon)
      tampon = ''
      out.push(
        <mark key={i} className="jo-vurgu">
          {p}
        </mark>,
      )
      i += p.length
    } else {
      tampon += ja[i]
      i++
    }
  }
  if (tampon) out.push(tampon)
  return out
}

/** Romajide kelimesi tam eşleşenleri renklendirir (noktalama hariç) */
function vurgulaLatin(romaji: string, kelimeler: string[]): ReactNode[] {
  return romaji.split(/(\s+)/).map((t, i) => {
    const cekirdek = t.replace(/[.,?!:;—]/g, '')
    return kelimeler.includes(cekirdek) ? (
      <mark key={i} className="jo-vurgu">
        {t}
      </mark>
    ) : (
      t
    )
  })
}
