import type { ReactNode } from 'react'

// Tek bir çizgi diliyle çizilmiş ikon seti: 24×24 ızgara, açık uçlar yuvarlak,
// dolgu yok. Emoji kullanılmaz — emojinin biçimi işletim sistemine göre değişir
// ve arayüzün geri kalanıyla aynı görsel dili konuşmaz.

const P: Record<string, ReactNode> = {
  home: <path d="M4 10.4 12 4l8 6.4V19a1.4 1.4 0 0 1-1.4 1.4h-3.4v-6.2H10.8v6.2H5.4A1.4 1.4 0 0 1 4 19z" />,

  speaker: (
    <>
      <path d="M11 5.2 6.6 9.2H3.2v5.6h3.4L11 18.8z" />
      <path d="M14.9 9.6a3.4 3.4 0 0 1 0 4.8" />
      <path d="M17.6 6.9a7.2 7.2 0 0 1 0 10.2" />
    </>
  ),
  speakerOff: (
    <>
      <path d="M11 5.2 6.6 9.2H3.2v5.6h3.4L11 18.8z" />
      <path d="m15.5 9.8 4.6 4.4M20.1 9.8l-4.6 4.4" />
    </>
  ),

  mic: (
    <>
      <path d="M12 3.2a2.9 2.9 0 0 1 2.9 2.9v5.8a2.9 2.9 0 0 1-5.8 0V6.1A2.9 2.9 0 0 1 12 3.2z" />
      <path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0" />
      <path d="M12 17.6v3.2" />
    </>
  ),

  pen: (
    <>
      <path d="M4 20h4.2L20 8.2a2.6 2.6 0 0 0-3.7-3.7L4.5 16.3z" />
      <path d="m14.6 6.2 3.7 3.7" />
    </>
  ),

  brush: (
    <>
      <path d="M18.6 4.4a2 2 0 0 1 2.8 2.8L13.6 15l-2.8-2.8z" />
      <path d="M10.8 12.2c-2.4 0-4.2 1.8-4.2 4.2 0 1.3-1.2 2.4-3 2.6 1.6-1.9.6-4.4 3-5" />
    </>
  ),

  book: (
    <>
      <path d="M12 6.6C10.4 5 7.9 4.4 4 5v13.4c3.9-.6 6.4 0 8 1.6 1.6-1.6 4.1-2.2 8-1.6V5c-3.9-.6-6.4 0-8 1.6z" />
      <path d="M12 6.6V20" />
    </>
  ),

  headphones: (
    <>
      <path d="M4.2 15.4v-3.2a7.8 7.8 0 0 1 15.6 0v3.2" />
      <path d="M4.2 14.6h3.2v5.6H5.8a1.6 1.6 0 0 1-1.6-1.6z" />
      <path d="M19.8 14.6h-3.2v5.6h1.6a1.6 1.6 0 0 0 1.6-1.6z" />
    </>
  ),

  grid: (
    <>
      <path d="M4.2 4.2h15.6v15.6H4.2z" />
      <path d="M4.2 9.4h15.6M4.2 14.6h15.6M9.4 4.2v15.6M14.6 4.2v15.6" />
    </>
  ),

  search: (
    <>
      <path d="M11 4.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z" />
      <path d="m16.1 16.1 3.7 3.7" />
    </>
  ),

  sliders: (
    <>
      <path d="M4 7.2h8.4M17.2 7.2h2.8M4 16.8h3.6M12.4 16.8h7.6" />
      <path d="M14.8 7.2a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0zM10 16.8a2.4 2.4 0 1 0 4.8 0 2.4 2.4 0 0 0-4.8 0z" />
    </>
  ),

  chart: (
    <>
      <path d="M4 20.2h16" />
      <path d="M6.6 20.2v-6.4M11.2 20.2V6.6M15.8 20.2v-9.2M20 20.2v-4" />
    </>
  ),

  check: <path d="m5.2 12.4 4.9 4.9 8.7-9.6" />,
  close: <path d="m6.2 6.2 11.6 11.6M17.8 6.2 6.2 17.8" />,

  left: <path d="M14.6 4.6 7.8 12l6.8 7.4" />,
  right: <path d="M9.4 4.6 16.2 12l-6.8 7.4" />,

  undo: (
    <>
      <path d="M4.2 9.8h9.6a5 5 0 0 1 0 10H8.4" />
      <path d="m8 5.8-3.8 4 3.8 4" />
    </>
  ),

  eraser: (
    <>
      <path d="M4 7.2h16" />
      <path d="M9.2 7.2V5a.8.8 0 0 1 .8-.8h4a.8.8 0 0 1 .8.8v2.2" />
      <path d="m6.4 7.2 1 12a.9.9 0 0 0 .9.8h7.4a.9.9 0 0 0 .9-.8l1-12" />
    </>
  ),

  eye: (
    <>
      <path d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12z" />
      <path d="M12 9.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4.4 8.2C3.2 9.6 2.6 12 2.6 12S6.2 18.4 12 18.4c1.7 0 3.1-.4 4.3-1M19 15.4c1.6-1.7 2.4-3.4 2.4-3.4S17.8 5.6 12 5.6c-1 0-1.9.1-2.7.4" />
      <path d="m4.6 4.6 14.8 14.8" />
    </>
  ),

  play: <path d="M8.4 5.4v13.2L19 12z" />,
  stop: <path d="M7 7h10v10H7z" />,

  repeat: (
    <>
      <path d="M4.4 10V8.4a3.4 3.4 0 0 1 3.4-3.4h9.8" />
      <path d="m14.6 2 3.4 3-3.4 3" />
      <path d="M19.6 14v1.6a3.4 3.4 0 0 1-3.4 3.4H6.4" />
      <path d="m9.4 22-3.4-3 3.4-3" />
    </>
  ),

  download: (
    <>
      <path d="M12 4v11.2" />
      <path d="m7.8 11.4 4.2 4.2 4.2-4.2" />
      <path d="M4.4 19.6h15.2" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15.6V4.4" />
      <path d="m7.8 8.6 4.2-4.2 4.2 4.2" />
      <path d="M4.4 19.6h15.2" />
    </>
  ),

  more: (
    <>
      <path d="M5.4 12h.1M12 12h.1M18.5 12h.1" strokeWidth="2.6" />
    </>
  ),

  lock: (
    <>
      <path d="M7.6 10.2V7.6a4.4 4.4 0 0 1 8.8 0v2.6" />
      <path d="M5.8 10.2h12.4v9.6H5.8z" />
    </>
  ),

  clipboard: (
    <>
      <path d="M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4z" />
      <path d="M16 6.4h1.4a1.6 1.6 0 0 1 1.6 1.6v11.4a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19.4V8a1.6 1.6 0 0 1 1.6-1.6H8" />
      <path d="M8.8 12.4h6.4M8.8 16h4.2" />
    </>
  ),

  brackets: (
    <>
      <path d="M8.6 4.2H6.2a1.8 1.8 0 0 0-1.8 1.8v12a1.8 1.8 0 0 0 1.8 1.8h2.4" />
      <path d="M15.4 4.2h2.4a1.8 1.8 0 0 1 1.8 1.8v12a1.8 1.8 0 0 1-1.8 1.8h-2.4" />
    </>
  ),

  transform: (
    <>
      <path d="M4 8.4h13.6" />
      <path d="m14.4 5.2 3.2 3.2-3.2 3.2" />
      <path d="M20 15.6H6.4" />
      <path d="m9.6 12.4-3.2 3.2 3.2 3.2" />
    </>
  ),

  layers: (
    <>
      <path d="m12 3.4 8.2 4.3-8.2 4.3-8.2-4.3z" />
      <path d="m4 12 8 4.2 8-4.2M4 16.2l8 4.2 8-4.2" />
    </>
  ),

  clock: (
    <>
      <path d="M12 4.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6z" />
      <path d="M12 7.8V12l2.8 1.8" />
    </>
  ),

  plus: <path d="M12 5.4v13.2M5.4 12h13.2" />,

  spark: (
    <>
      <path d="M12 3.4 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9z" />
    </>
  ),

  pause: <path d="M9 6v12M15 6v12" />,

  flame: (
    <>
      <path d="M12 2.8c.4 3 2 4 3.6 5.9A6.9 6.9 0 0 1 17.4 13a5.4 5.4 0 0 1-10.8 0c0-1.9.8-3.3 1.8-4.6.4 1 1.1 1.6 1.9 1.9-.3-2.6.3-5.5 1.7-7.5z" />
      <path d="M12 20.2a2.7 2.7 0 0 1-2.7-2.7c0-1.5 1.3-2.4 2.7-4.3 1.4 1.9 2.7 2.8 2.7 4.3a2.7 2.7 0 0 1-2.7 2.7z" />
    </>
  ),

  trophy: (
    <>
      <path d="M7.4 4.2h9.2v5a4.6 4.6 0 0 1-9.2 0z" />
      <path d="M7.4 5.8H5a1.6 1.6 0 0 0-1.6 1.6c0 2 1.6 3.4 4 3.6M16.6 5.8H19a1.6 1.6 0 0 1 1.6 1.6c0 2-1.6 3.4-4 3.6" />
      <path d="M12 13.8v3.4M8.6 20.2h6.8M9.8 17.2h4.4l1.2 3H8.6z" />
    </>
  ),

  target: (
    <>
      <path d="M12 4.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6z" />
      <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2z" />
      <path d="M12 11.4v1.2" strokeWidth="2.4" />
    </>
  ),

  bulb: (
    <>
      <path d="M12 3.2a5.8 5.8 0 0 0-3.4 10.5c.6.5 1 1.2 1 2v.5h4.8v-.5c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.2z" />
      <path d="M9.6 19h4.8M10.4 21h3.2" />
    </>
  ),

  ruler: (
    <>
      <path d="m3.4 15.6 8.2-8.2 5 5-8.2 8.2a1.4 1.4 0 0 1-2 0l-3-3a1.4 1.4 0 0 1 0-2z" />
      <path d="m13.4 5.6 5 5 2.2-2.2a1.4 1.4 0 0 0 0-2l-3-3a1.4 1.4 0 0 0-2 0z" />
      <path d="m7.2 11.8 1.8 1.8M10 9l1.8 1.8M12.8 6.2 14.6 8" />
    </>
  ),

  mail: (
    <>
      <path d="M4 5.6h16v12.8H4z" />
      <path d="m4 6.6 8 5.6 8-5.6" />
    </>
  ),

  seed: (
    <>
      <path d="M12 20.4V11" />
      <path d="M12 11c0-3.8 3-6.8 7.6-7-.2 4.6-3.2 7.6-7 7.6z" />
      <path d="M12 15.4c-2.8 0-5-2.2-5.2-5.4 3.4.2 5.6 2.4 5.6 5.4z" />
    </>
  ),

  down: <path d="M4.6 9.4 12 16.2l7.4-6.8" />,
  up: <path d="M4.6 14.6 12 7.8l7.4 6.8" />,

  square: <path d="M4.6 4.6h14.8v14.8H4.6z" />,
  squareCheck: (
    <>
      <path d="M4.6 4.6h14.8v14.8H4.6z" />
      <path d="m8.2 12.2 2.6 2.6 5.2-5.6" />
    </>
  ),
  squareHalf: (
    <>
      <path d="M4.6 4.6h14.8v14.8H4.6z" />
      <path d="M8.4 12h7.2" />
    </>
  ),

  circleOpen: <path d="M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z" />,
  circleHalf: (
    <>
      <path d="M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z" />
      <path d="M12 4.6v14.8a7.4 7.4 0 0 0 0-14.8z" fill="currentColor" stroke="none" />
    </>
  ),
  circleFull: <path d="M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z" fill="currentColor" />,

  turtle: (
    <>
      <path d="M5 15.4a7 7 0 0 1 14 0z" />
      <path d="M8.2 15.4v2M15.8 15.4v2M19 13.8h1.8M5 13.8H3.2" />
      <path d="M9.6 12.4h4.8M12 9.6v5.4" />
    </>
  ),

  gauge: (
    <>
      <path d="M4 17.6a8 8 0 1 1 16 0" />
      <path d="m12 17.6 3.8-5.4" />
    </>
  ),
}

export type IconName = keyof typeof P

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.6,
  style,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', display: 'block', ...style }}
    >
      {P[name]}
    </svg>
  )
}

/** Kayıt göstergesi — dolu daire, nabız animasyonu CSS'te. */
export function RecordDot({ size = 10 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'currentColor',
        display: 'block',
        flex: 'none',
      }}
    />
  )
}
