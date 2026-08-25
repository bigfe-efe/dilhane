import { useEffect, useState } from 'react'
import { ensureStrokeData, hasStrokeData, strokeGlyph, type StrokeGlyph } from '@/lib/strokes'

// Karakteri YAZI TİPİYLE değil, çizgi verisinden çizer.
//
// NEDEN GEREKLİ:
// Bazı kana'nın iki farklı basılı biçimi vardır ve fark elle yazarken önemlidir:
//
//   さ · き · り · ふ · そ
//
// Ders kitapları ve el yazısı standardı bu karakterleri AYRIK çizer
// (さ = 3 çizgi: üst yatay, orta kavis, alt kanca ayrı). Yu Gothic, Meiryo gibi
// ekran yazı tipleri ise alt kısmı BİTİŞİK çizer. İkisi de aynı karakterdir —
// aynı Unicode kod noktası — ama öğrenci elle yazarken kitaptaki biçimi
// görmelidir, yoksa kaç çizgi olduğunu ve nereden başlayacağını yanlış öğrenir.
//
// Japonca "ders kitabı yazı tipi" (教科書体) Windows'ta varsayılan gelmez.
// Elimizde zaten KanjiVG çizgi verisi olduğu için karakteri o veriden çiziyoruz:
// hem el yazısı biçimi garanti oluyor, hem çizgi sırası gösterimiyle birebir
// aynı şekli görüyorsun.

export function KanaGlyph({
  char,
  /** Yükseklik — yazı gibi ölçeklensin diye em/rem verilebilir */
  size = '2rem',
  className = '',
  /** Çizgi kalınlığı (109 birimlik kutuda) */
  weight = 5.5,
}: {
  char: string
  size?: string | number
  className?: string
  weight?: number
}) {
  const [glyph, setGlyph] = useState<StrokeGlyph | null>(() => (hasStrokeData(char) ? strokeGlyph(char) : null))

  useEffect(() => {
    if (hasStrokeData(char)) {
      setGlyph(strokeGlyph(char))
      return
    }
    let alive = true
    ensureStrokeData(char).then(() => {
      if (alive) setGlyph(strokeGlyph(char))
    })
    return () => {
      alive = false
    }
  }, [char])

  // Veri gelene kadar (veya hiç yoksa) yazı tipiyle göster — boşluk oynamasın
  if (!glyph) {
    return (
      <span className={`ja ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
        {char}
      </span>
    )
  }

  const w = glyph.unit * glyph.boxes
  return (
    <svg
      viewBox={`0 0 ${w} ${glyph.unit}`}
      className={`kana-glyph ${className}`}
      style={{ height: size, width: 'auto' }}
      role="img"
      aria-label={char}
    >
      {glyph.strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          transform={s.ox ? `translate(${s.ox} 0)` : undefined}
          fill="none"
          stroke="currentColor"
          strokeWidth={weight}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
