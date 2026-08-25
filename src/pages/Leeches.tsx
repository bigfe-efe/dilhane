import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { StrokeOrder } from '@/components/StrokeOrder'
import { useLeeches } from '@/db/hooks'
import { db, type Card } from '@/db/db'
import { LEECH_THRESHOLD, STRUGGLE_THRESHOLD, leechLevel, newCard } from '@/lib/srs'
import { GRAMMAR_BY_ID, VOCAB_BY_ID } from '@/content'
import { KANA_BY_CHAR } from '@/content/ja/kana'
import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'

// Takılan kartlar sayfası.
//
// Aralıklı tekrar, sürekli unutulan bir kartı kendi başına çözemez: kart her
// unutulduğunda aralık kısalır, kart daha sık gelir, döngü kapanmaz. Kırmanın
// yolu o karta özel bir şey yapmaktır — kendi hatırlatıcını uydurmak,
// karakteri yazmak, karıştığın eşiyle yan yana koymak.
//
// Bu sayfa o kartları öne çıkarır ve her birine kişisel not yazmanı sağlar.

interface Info {
  title: string
  sub?: string
  ja: boolean
  speakText?: string
  speakReading?: string
  /** Kana/kanji ise çizgi sırası gösterilebilir */
  char?: string
  link?: string
}

function describe(card: Card): Info {
  if (card.kind === 'kana') {
    const k = KANA_BY_CHAR.get(card.refId)
    return {
      title: card.refId,
      sub: k ? `${k.romaji} · ${k.trHint}` : undefined,
      ja: true,
      speakText: card.refId,
      speakReading: card.refId,
      char: card.refId,
      link: k?.type === 'katakana' ? '/kana/katakana' : '/kana/hiragana',
    }
  }
  if (card.kind === 'kanji') {
    const k = KANJI_BY_CHAR.get(card.refId)
    return {
      title: card.refId,
      sub: k?.meaningsTr.join(', '),
      ja: true,
      speakText: card.refId,
      speakReading: (k?.kun[0] ?? k?.on[0] ?? '').replace(/-/g, ''),
      char: card.refId,
      link: '/kanji',
    }
  }
  if (card.kind === 'vocab') {
    const v = VOCAB_BY_ID.get(card.refId)
    return {
      title: v?.term ?? card.refId,
      sub: v ? `${v.reading ?? ''} · ${v.tr}` : undefined,
      ja: card.lang === 'ja',
      speakText: v?.term,
      speakReading: v?.reading,
      link: '/dictionary',
    }
  }
  if (card.kind === 'grammar') {
    const g = GRAMMAR_BY_ID.get(card.refId)
    return { title: g?.title ?? card.refId, sub: g?.summaryTr, ja: false, link: `/grammar/${card.lang}/${card.refId}` }
  }
  return { title: card.refId, ja: card.lang === 'ja' }
}

export default function LeechesPage() {
  const { all, leeches, struggling } = useLeeches()

  return (
    <>
      <TopBar title="Zorlandıkların" sub={`${leeches.length} takıldığın · ${struggling.length} zorlandığın`} back="/more" />

      <div className="page stack-lg">
        <div className="card stack-sm">
          <div className="card-title">Neden ayrı bir liste?</div>
          <div className="card-sub">
            Bazı kartlar sürekli unutulur. Aralıklı tekrar bunu kendi başına çözmez — kart her unutulduğunda daha sık
            gelir, sen de aynı yerde takılırsın. Kırmanın yolu <b>o karta özel bir şey yapmaktır</b>: kendi
            hatırlatıcını uydur, karakteri birkaç kez yaz, karıştığın eşiyle yan yana koy.
          </div>
          <div className="tiny faint">
            {STRUGGLE_THRESHOLD} kez unutulan kart "zorlandığın", {LEECH_THRESHOLD} kez unutulan "takıldığın" sayılır.
          </div>
        </div>

        {all.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">
              <Icon name="seed" size={22} />
            </span>
            <div className="small">
              Henüz takıldığın kart yok. Bir kartı {STRUGGLE_THRESHOLD} kez unutursan burada belirir.
            </div>
          </div>
        ) : (
          <div className="stack">
            {all.map((c) => (
              <LeechCard key={c.id} card={c} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function LeechCard({ card }: { card: Card }) {
  const info = describe(card)
  const level = leechLevel(card)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const loadNote = async () => {
    const row = await db.notes.get(card.refId)
    setNote(row?.text ?? '')
  }

  const saveNote = async (text: string) => {
    setNote(text)
    setSaved(false)
    await db.notes.put({ refId: card.refId, text, updatedAt: Date.now() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const resetCard = async () => {
    if (!confirm('Bu kartın ilerlemesi sıfırlansın mı? Sıfırdan öğrenilecek.')) return
    await db.cards.put({ ...card, ...newCard(Date.now()) })
  }

  const toggle = () => {
    if (!open && note === null) loadNote()
    setOpen((o) => !o)
  }

  return (
    <div className={`card stack-sm lang-${card.lang}`} style={{ borderColor: level === 'leech' ? 'var(--bad)' : undefined }}>
      <div className="row" onClick={toggle} style={{ cursor: 'pointer' }}>
        <span
          className={info.ja ? 'ja' : ''}
          style={{ fontSize: info.char ? '2.4rem' : '1.15rem', lineHeight: 1, minWidth: 46, textAlign: 'center' }}
        >
          {info.title}
        </span>
        <div className="stack-sm" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          {info.sub && <div className="small dim">{info.sub}</div>}
          <div className="row tiny faint" style={{ gap: 8 }}>
            <span>{card.lapses} kez unuttun</span>
            <span>·</span>
            <span>{card.reps} tekrar</span>
          </div>
        </div>
        <Badge tone={level === 'leech' ? 'bad' : 'warn'}>{level === 'leech' ? 'takıldın' : 'zorlanıyorsun'}</Badge>
        <Icon name={open ? 'down' : 'right'} size={16} style={{ color: 'var(--faint)' }} />
      </div>

      {open && (
        <div className="stack-sm" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 10 }}>
          {info.speakText && (
            <div className="row">
              <SpeakBtn text={info.speakText} lang={card.lang} reading={info.speakReading} size="sm" />
              <span className="tiny dim" style={{ flex: 1 }}>
                Sesli dinle
              </span>
              {info.link && (
                <Link to={info.link} className="btn btn--sm btn--ghost">
                  Detaya git
                </Link>
              )}
            </div>
          )}

          {info.char && <StrokeOrder char={info.char} height={170} showNumbers />}

          <div className="stack-sm">
            <div className="tiny bold dim">Kendi hatırlatıcın</div>
            <textarea
              className="field"
              rows={2}
              value={note ?? ''}
              onChange={(e) => saveNote(e.target.value)}
              placeholder="Bunu nasıl hatırlarsın? Kendi cümlenle yaz — başkasının hatırlatıcısı işe yaramaz."
            />
            <div className="row tiny faint">
              <span style={{ flex: 1 }}>{saved ? 'Kaydedildi' : 'Yazdıkça kaydedilir'}</span>
              <button className="btn btn--sm btn--ghost" onClick={resetCard}>
                İlerlemeyi sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
