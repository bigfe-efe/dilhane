import { useMemo, useState } from 'react'
import { HIRAGANA, KATAKANA } from '@/content/ja/kana'
import type { KanaChar } from '@/types'

// Ekran kana klavyesi.
//
// NEDEN ROMAJİ GİRİŞİ DEĞİL:
// Kutuya "sensei" yazıp bunu wanakana ile せんせい'ye çevirmek teknik olarak
// çok daha kolaydı. Ama o zaman ölçtüğümüz şey kana bilgisi değil, romaji
// yazımı olurdu — klavye işi senin yerine yapardı. Buradaki amaç tam tersi:
// sesi duyup KARAKTERİ bulmak. O yüzden karakteri gözünle arayıp tıklıyorsun.
//
// Tuşlar gojūon düzeninde (あ行, か行, さ行 …) çünkü kana zaten öyle öğrenilir;
// alfabetik ya da sık kullanılana göre dizmek aramayı zorlaştırırdı.

type Sekme = 'temel' | 'dakuten' | 'yoon'

const SEKMELER: { id: Sekme; label: string; hint: string }[] = [
  { id: 'temel', label: 'Temel', hint: '46 karakter' },
  { id: 'dakuten', label: '゛゜ Dakuten', hint: 'が ざ だ ば ぱ' },
  { id: 'yoon', label: 'Yōon', hint: 'きゃ しゃ ちゃ' },
]

export function KanaKeyboard({
  type,
  onKey,
  onBackspace,
  onClear,
  disabled,
}: {
  type: 'hiragana' | 'katakana'
  onKey: (char: string) => void
  onBackspace: () => void
  onClear: () => void
  disabled?: boolean
}) {
  const [sekme, setSekme] = useState<Sekme>('temel')

  const gruplar = useMemo(() => {
    const src: KanaChar[] = type === 'hiragana' ? HIRAGANA : KATAKANA
    const istenen =
      sekme === 'temel'
        ? (k: KanaChar) => k.kind === 'base'
        : sekme === 'dakuten'
          ? (k: KanaChar) => k.kind === 'dakuten' || k.kind === 'handakuten'
          : (k: KanaChar) => k.kind === 'yoon'

    const out: { group: string; chars: KanaChar[] }[] = []
    for (const k of src.filter(istenen)) {
      let b = out.find((x) => x.group === k.group)
      if (!b) out.push((b = { group: k.group, chars: [] }))
      b.chars.push(k)
    }
    return out
  }, [type, sekme])

  // Küçük っ ve uzatma ー tabloda yok ama kelime yazarken şart. Temel sekmenin
  // yanında ayrı bir şerit olarak duruyorlar; öğrenci onları "harf" değil
  // "işaret" diye ayırt etsin diye de bilerek ayrı.
  const ozel: { char: string; label: string }[] =
    type === 'hiragana'
      ? [{ char: 'っ', label: 'küçük tsu' }]
      : [
          { char: 'ッ', label: 'küçük tsu' },
          { char: 'ー', label: 'uzatma' },
          { char: 'ァ', label: 'küçük a' },
          { char: 'ィ', label: 'küçük i' },
          { char: 'ゥ', label: 'küçük u' },
          { char: 'ェ', label: 'küçük e' },
          { char: 'ォ', label: 'küçük o' },
          { char: 'ヴ', label: 'vu' },
        ]

  return (
    <div className="kbd">
      <div className="kbd-tabs">
        {SEKMELER.map((s) => (
          <button
            key={s.id}
            className={'chip' + (sekme === s.id ? ' active' : '')}
            onClick={() => setSekme(s.id)}
            type="button"
          >
            {s.label}
          </button>
        ))}
        <div className="spacer" />
        <button className="kbd-util" onClick={onBackspace} disabled={disabled} type="button">
          ← Sil
        </button>
        <button className="kbd-util" onClick={onClear} disabled={disabled} type="button">
          Temizle
        </button>
      </div>

      <div className="kbd-grid">
        {gruplar.map((g) => (
          <div key={g.group} className="kbd-col">
            {/* Grup adı "あ行 (a-satırı)" biçiminde; sütun dar olduğu için
                yalnızca Japonca kısmı gösteriliyor, gerisi taşıyordu. */}
            <span className="kbd-col-label ja">{g.group.split(' (')[0]}</span>
            {g.chars.map((k) => (
              <button
                key={k.char}
                className="kbd-key"
                onClick={() => onKey(k.char)}
                disabled={disabled}
                type="button"
                title={k.romaji}
              >
                <span className="ja kbd-key-ch">{k.char}</span>
                <span className="kbd-key-r">{k.romaji}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {sekme === 'temel' && (
        <div className="kbd-special">
          <span className="kbd-col-label">işaretler</span>
          {ozel.map((o) => (
            <button
              key={o.char}
              className="kbd-key kbd-key--special"
              onClick={() => onKey(o.char)}
              disabled={disabled}
              type="button"
              title={o.label}
            >
              <span className="ja kbd-key-ch">{o.char}</span>
              <span className="kbd-key-r">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
