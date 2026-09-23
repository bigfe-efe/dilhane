import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons'
import { speakScript, stopSpeaking } from '@/lib/tts'
import type { ChoukaiLine, ChoukaiQ } from '@/content/ja/n5-mock'

// N5 biçimindeki soruların ortak görünümü — ünite sayfası da deneme sınavı
// da bunları kullanıyor, ikisi aynı sınavı taklit ettiği için aynı görünmeli.

/**
 * Soru metni: ＿X＿ altı çizili (kanji okuma ve yazım soruları), tek ＿ ve
 * __ boş kutu, ★ vurgulu (cümle kurma). Önceden işaretler ham metin olarak
 * duruyordu; gerçek sınav kâğıdındaki altı çizili kelime görünmüyordu.
 */
export function MockPrompt({ text }: { text: string }) {
  const parcalar = text.split(/(＿[^＿\s]+＿|★|＿|__)/g).filter(Boolean)
  return (
    <div className="mock-prompt ja">
      {parcalar.map((p, i) => {
        if (p === '★') return <span key={i} className="n5-star">★</span>
        if (p === '＿' || p === '__') return <span key={i} className="n5-blank" />
        if (p.length > 2 && p.startsWith('＿') && p.endsWith('＿')) {
          return (
            <u key={i} className="n5-under">
              {p.slice(1, -1)}
            </u>
          )
        }
        return <span key={i}>{p}</span>
      })}
    </div>
  )
}

const SAYI_OKUNUS = ['いち', 'に', 'さん', 'よん']

/**
 * Sorunun sırayla okunacak satırları — gerçek sınavın akışıyla:
 *   課題理解 / ポイント理解: soru → konuşma → soru yeniden
 *   発話表現: durum sorusu, sonra seçenekler
 *   即時応答: tek cümle, sonra seçenekler
 * Seçenekler sesliyse her birinin önünde numarası okunur.
 */
export function choukaiSatirlari(q: ChoukaiQ): ChoukaiLine[] {
  const out: ChoukaiLine[] = []
  if (q.mondai === 'kadai' || q.mondai === 'point') {
    if (q.question) out.push(q.question)
    out.push(...q.script)
    if (q.question) out.push(q.question)
  } else if (q.mondai === 'hatsuwa') {
    if (q.question) out.push(q.question)
  } else {
    out.push(...q.script)
  }
  if (q.spokenOptions) {
    // Cevabı veren, soruyu soranın karşısındaki kişi
    const cevapci: ChoukaiLine['s'] = q.script[0]?.s === 'M' ? 'F' : 'M'
    q.options.forEach((o, i) => {
      out.push({ s: 'N', ja: SAYI_OKUNUS[i] })
      out.push({ s: q.mondai === 'hatsuwa' ? 'F' : cevapci, ja: o })
    })
  }
  return out
}

/**
 * Dinleme oynatıcısı.
 *
 * `tekSefer`: gerçek sınavda ses yalnızca BİR kez çalar. Süreli denemede
 * açık; alıştırmada kapalı, çünkü orada amaç öğrenmek.
 */
export function ChoukaiPlayer({ q, tekSefer = false }: { q: ChoukaiQ; tekSefer?: boolean }) {
  const [calindi, setCalindi] = useState(0)
  const [caliyor, setCaliyor] = useState(false)

  const cal = async (rate?: number) => {
    setCaliyor(true)
    await speakScript(choukaiSatirlari(q), 'ja', { rate })
    setCaliyor(false)
    setCalindi((n) => n + 1)
  }

  // Soru açılınca kendiliğinden çalar — sınavda da soru okunarak başlar
  useEffect(() => {
    setCalindi(0)
    void cal()
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id])

  const kilitli = tekSefer && (calindi > 0 || caliyor)

  return (
    <div className="card card--pad-lg center stack">
      {q.scene && <div className="n5-scene">{q.scene}</div>}
      <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
        <button className="btn btn--primary btn--lg" onClick={() => void cal()} disabled={kilitli || caliyor}>
          <Icon name="speaker" size={18} />
          {caliyor ? 'Çalıyor…' : calindi ? 'Tekrar dinle' : 'Dinle'}
        </button>
        {!tekSefer && (
          <button className="btn btn--lg" onClick={() => void cal(0.75)} disabled={caliyor}>
            Yavaş
          </button>
        )}
      </div>
      {tekSefer && <div className="tiny faint">Gerçek sınavdaki gibi yalnızca bir kez çalar.</div>}
    </div>
  )
}

/**
 * Şıklar. Sesli seçeneklerde (発話表現, 即時応答) cevap verilene kadar yalnızca
 * numaralar görünür — gerçek sınavda da seçenekler kâğıtta yazmaz.
 */
export function SecenekListesi({
  q,
  secili,
  onSec,
  acik,
}: {
  q: { options: string[]; answer: number; spokenOptions?: boolean }
  secili: number | undefined
  onSec: (i: number) => void
  /** Doğru/yanlış gösterilsin mi (alıştırmada cevaptan sonra) */
  acik: boolean
}) {
  const gizli = q.spokenOptions && !acik
  return (
    <div className={gizli ? 'n5-num-options' : 'stack-sm'} style={{ width: '100%' }}>
      {q.options.map((o, i) => {
        const durum = !acik ? (secili === i ? ' is-picked' : '') : i === q.answer ? ' is-correct' : i === secili ? ' is-wrong' : ' is-muted'
        return (
          <button key={i} className={`option${durum}${gizli ? ' n5-num' : ''}`} onClick={() => onSec(i)} disabled={acik}>
            <span className="key">{i + 1}</span>
            {!gizli && (
              <span className="ja" style={{ fontSize: '1.08rem' }}>
                {o}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Cevaptan sonra: konuşmanın yazılı hâli (kim ne dedi) */
export function ChoukaiMetin({ q }: { q: ChoukaiQ }) {
  const ad = { M: 'Erkek', F: 'Kadın', N: 'Anlatıcı' } as const
  const satirlar = [...(q.question ? [q.question] : []), ...q.script]
  return (
    <div className="n5-transcript stack-sm">
      {satirlar.map((l, i) => (
        <div key={i} className="row" style={{ gap: 8, alignItems: 'baseline' }}>
          <span className="tiny faint" style={{ minWidth: 58 }}>
            {ad[l.s ?? 'N']}
          </span>
          <span className="ja small">{l.ja}</span>
        </div>
      ))}
    </div>
  )
}
