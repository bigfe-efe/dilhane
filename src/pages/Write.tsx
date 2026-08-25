import { useMemo, useState } from 'react'
import { Badge, Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { DrawCanvas } from '@/components/DrawCanvas'
import { StrokeOrder } from '@/components/StrokeOrder'
import { HIRAGANA, KATAKANA } from '@/content/ja/kana'
import { KANJI_BY_CHAR, KANJI_SETS } from '@/content/ja/kanji-n5'

type Deck = 'hiragana' | 'katakana' | 'kanji'

/** Serbest yazı çalışması: karakteri gör, çiz, sonrakine geç. */
export default function WritePage() {
  const [deck, setDeck] = useState<Deck>('hiragana')
  const [kanjiSet, setKanjiSet] = useState(KANJI_SETS[0].id)
  const [i, setI] = useState(0)
  const [ghost, setGhost] = useState(true)
  const [nonce, setNonce] = useState(0)
  const [showOrder, setShowOrder] = useState(true)

  const items = useMemo(() => {
    if (deck === 'hiragana') return HIRAGANA.filter((k) => k.kind === 'base').map((k) => ({ char: k.char, hint: k.romaji, sub: k.trHint }))
    if (deck === 'katakana') return KATAKANA.filter((k) => k.kind === 'base').map((k) => ({ char: k.char, hint: k.romaji, sub: k.trHint }))
    const set = KANJI_SETS.find((s) => s.id === kanjiSet)!
    return set.chars.map((c) => {
      const k = KANJI_BY_CHAR.get(c)
      return { char: c, hint: k?.meaningsTr[0] ?? '', sub: `${k?.strokes ?? '?'} çizgi` }
    })
  }, [deck, kanjiSet])

  const item = items[Math.min(i, items.length - 1)]

  const go = (delta: number) => {
    setI((v) => (v + delta + items.length) % items.length)
    setNonce((n) => n + 1)
  }

  return (
    <>
      <TopBar title="Yazı çalışması" sub={`${i + 1} / ${items.length}`} back="/ja" />

      <div className="page stack lang-ja">
        <Chips
          items={[
            { id: 'hiragana', label: 'ひらがな' },
            { id: 'katakana', label: 'カタカナ' },
            { id: 'kanji', label: '漢字' },
          ]}
          value={deck}
          onChange={(d) => {
            setDeck(d as Deck)
            setI(0)
            setNonce((n) => n + 1)
          }}
        />

        {deck === 'kanji' && (
          <Chips
            items={KANJI_SETS.map((s) => ({ id: s.id, label: s.title }))}
            value={kanjiSet}
            onChange={(id) => {
              setKanjiSet(id)
              setI(0)
              setNonce((n) => n + 1)
            }}
          />
        )}

        <div className="card center stack-sm">
          <div className="row" style={{ justifyContent: 'center' }}>
            <div className="ja" style={{ fontSize: '3.2rem', lineHeight: 1 }}>
              {item.char}
            </div>
            <div className="stack-sm" style={{ gap: 2, alignItems: 'flex-start' }}>
              <div className="bold">{item.hint}</div>
              <div className="tiny faint">{item.sub}</div>
              <SpeakBtn text={item.char} lang="ja" size="sm" />
            </div>
          </div>
        </div>

        {showOrder && (
          <div className="card stack-sm">
            <div className="row">
              <div className="card-title" style={{ flex: 1 }}>
                Çizgi sırası
              </div>
              <button className="btn btn--sm btn--ghost" onClick={() => setShowOrder(false)}>
                Gizle
              </button>
            </div>
            <StrokeOrder key={item.char} char={item.char} height={200} />
          </div>
        )}

        <DrawCanvas key={`${deck}-${item.char}-${nonce}`} ghost={item.char} showGhost={ghost} />

        <div className="row">
          <button className="btn" onClick={() => go(-1)}>
            ‹ Önceki
          </button>
          <button className="btn btn--ghost" onClick={() => setGhost((g) => !g)} style={{ flex: 1 }}>
            <Icon name={ghost ? 'eyeOff' : 'eye'} size={15} />
          {ghost ? 'Şablonu gizle' : 'Şablonu göster'}
          </button>
          <button className="btn btn--lang" onClick={() => go(1)}>
            Sonraki ›
          </button>
        </div>

        {!showOrder && (
          <button className="btn btn--ghost btn--block" onClick={() => setShowOrder(true)}>
            Çizgi sırasını göster
          </button>
        )}

        <div className="card">
          <div className="card-title">Çizgi sırası kuralları</div>
          <div className="stack-sm small dim" style={{ marginTop: 8 }}>
            <div>1. Yukarıdan aşağıya doğru yaz.</div>
            <div>2. Soldan sağa doğru ilerle.</div>
            <div>3. Yatay çizgi dikey çizgiden önce gelir (十 gibi).</div>
            <div>4. Dış çerçeve önce, içi sonra, kapak en son (国 gibi).</div>
            <div>5. Ortadan geçen dikey çizgi genelde en sona kalır (中 gibi).</div>
          </div>
          <div className="tiny faint" style={{ marginTop: 10 }}>
            Şablonu kapatıp yazabildiğinde o karakteri öğrenmişsin demektir.
          </div>
        </div>

        <Badge tone="ja">İpucu: parmakla da çizebilirsin</Badge>
      </div>
    </>
  )
}
