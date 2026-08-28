import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toRomaji } from 'wanakana'
import type { KanaChar } from '@/types'
import { Badge, Chips, Sheet, SpeakBtn, TopBar, useSpeechMode } from '@/components/ui'
import { Icon } from '@/components/icons'
import { WritePractice } from '@/components/WritePractice'
import { StrokeOrder } from '@/components/StrokeOrder'
import { KanaGlyph } from '@/components/KanaGlyph'
import { CONFUSING_PAIRS, KANA_BY_CHAR, kanaGroups } from '@/content/ja/kana'
import {
  KANA_WORDS,
  moraCount,
  moraReadings,
  readingNote,
  wordsReadableWith,
  type KanaWord,
} from '@/content/ja/kana-words'
import { jaToTurkishSpeech } from '@/lib/ja-phonetic'
import { VOCAB_JA } from '@/content/ja/vocab'
import { useCardStates } from '@/db/hooks'
import { cardId, db, ensureCards } from '@/db/db'

type Filter = 'base' | 'dakuten' | 'yoon' | 'all'
/** İlerleme durumuna göre ikinci bir süzgeç — "neyi bilmiyorum" sorusunun cevabı. */
type Status = 'hepsi' | 'yeni' | 'ogreniliyor' | 'biliyorum'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'base', label: 'Temel (46)' },
  { id: 'dakuten', label: 'Dakuten ″°' },
  { id: 'yoon', label: 'Yōon きゃ' },
  { id: 'all', label: 'Hepsi' },
]

/** Harf tablosundan alistirmalara acilan kisayollar. */
const PRACTICE: { to: string; glyph: string; title: string; sub: string }[] = [
  { to: '/kana-kurallar', glyph: '則', title: 'Özel kurallar', sub: 'っ, uzun ünlü, ん, は→wa' },
  { to: '/hiragana-sinav', glyph: '終', title: 'Bitirme sınavı', sub: 'Sekiz bölüm, tam ölçüm' },
  { to: '/kana-test', glyph: '試', title: 'Kendi testin', sub: 'Çıkacak harfleri sen seç' },
  { to: '/kana-kelime', glyph: '読', title: 'Kelime okuma', sub: 'Heceleyerek sök' },
  { to: '/kelimeler', glyph: '語', title: 'Kelime sözlüğü', sub: 'Anlam ve dilbilgisi notu' },
]

/** Katakana tablosundan açılan kısayollar — sınavı ve kelime listesi ayrı. */
const PRACTICE_KATA: { to: string; glyph: string; title: string; sub: string }[] = [
  { to: '/katakana-sinav', glyph: '終', title: 'Bitirme sınavı', sub: 'Dokuz bölüm, tam ölçüm' },
  { to: '/katakana-kelime', glyph: '外', title: 'Kelime listesi', sub: 'Kaynağıyla birlikte' },
  { to: '/kana-test', glyph: '試', title: 'Kendi testin', sub: 'Çıkacak harfleri sen seç' },
  { to: '/write', glyph: '書', title: 'Yazı çalışması', sub: 'Çizgi sırası denetlensin' },
  { to: '/kana-hiz', glyph: '速', title: 'Hız testi', sub: 'Ne kadar akıcısın' },
]

const STATUSES: { id: Status; label: string }[] = [
  { id: 'hepsi', label: 'Tümü' },
  { id: 'yeni', label: 'Görmedim' },
  { id: 'ogreniliyor', label: 'Öğreniyorum' },
  { id: 'biliyorum', label: 'Biliyorum' },
]

export default function KanaPage() {
  const { type } = useParams<{ type: string }>()
  const kind = type === 'katakana' ? 'katakana' : 'hiragana'
  const [filter, setFilter] = useState<Filter>('base')
  const [status, setStatus] = useState<Status>('hepsi')
  const [open, setOpen] = useState<KanaChar | null>(null)
  const states = useCardStates('kana')
  const speech = useSpeechMode('ja')

  const statusOf = (char: string): Status => {
    const st = states.get(char)
    if (!st || st.phase === 'new') return 'yeni'
    return st.phase === 'review' ? 'biliyorum' : 'ogreniliyor'
  }

  const groups = kanaGroups(kind)
    .filter((g) => {
      if (filter === 'all') return true
      if (filter === 'base') return g.kind === 'base'
      if (filter === 'dakuten') return g.kind === 'dakuten' || g.kind === 'handakuten'
      return g.kind === 'yoon'
    })
    // Durum süzgeci grubun içini de daraltır; boş kalan satırlar hiç çizilmez
    .map((g) => ({ ...g, chars: status === 'hepsi' ? g.chars : g.chars.filter((c) => statusOf(c.char) === status) }))
    .filter((g) => g.chars.length > 0)

  const flat = groups.flatMap((g) => g.chars)
  const known = flat.filter((c) => states.get(c.char)?.phase === 'review').length
  const total = flat.length

  /** Sayfadaki tüm karakterler arasında gezinme — sayfayı kapatmadan sıradakine geç */
  const step = (delta: number) => {
    if (!open) return
    const i = flat.findIndex((c) => c.char === open.char)
    const next = flat[i + delta]
    if (next) setOpen(next)
  }

  return (
    <>
      <TopBar
        title={kind === 'hiragana' ? 'Hiragana ひらがな' : 'Katakana カタカナ'}
        sub={`${known} / ${total} öğrenildi`}
        back="/"
      />

      <div className="page stack-lg lang-ja">
        <Link to="/yazi-sistemi" className="card card--link">
          <div className="row">
            <span className="entry-icon"><Icon name="bulb" size={18} /></span>
            <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
              <div className="card-title" style={{ fontSize: '0.95rem' }}>
                Önce yazı sistemini tanı
              </div>
              <div className="card-sub">
                {kind === 'hiragana'
                  ? 'Hiragana nerede kullanılır, küçük kana ne demek, dikey yazı nasıl okunur?'
                  : 'Katakana neden ayrı bir alfabe, ne zaman kullanılır?'}
              </div>
            </div>
            <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
          </div>
        </Link>

        {/*
          Alistirma sayfalarina buradan giriliyor. Onceden yalnizca ana sayfadaki
          araclar izgarasinda duruyorlardi; harfleri calisirken akla gelen ilk yer
          ise bu sayfa oldugu icin buraya da konuldu.
        */}
        <div className="stack-sm">
          <h3>Kendini dene</h3>
          <div className="grid grid-auto">
            {(kind === 'hiragana' ? PRACTICE : PRACTICE_KATA).map((p) => (
              <Link key={p.to} to={p.to} className="tool">
                <span className="ja tool-glyph">{p.glyph}</span>
                <span className="tool-title">{p.title}</span>
                <span className="tool-sub">{p.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {speech === 'approx' && (
          <div className="feedback feedback--info tiny">
            <b>Ses hakkında: </b>Cihazında Japonca konuşma sesi kurulu değil, bu yüzden karakterler{' '}
            <b>Türkçe sesle yaklaşık</b> okunuyor (<span className="mono">≈</span> işareti bunu gösterir). Gerçek
            telaffuz için{' '}
            <Link to="/settings" className="link">
              Ayarlar
            </Link>
            'daki adımları izle.
          </div>
        )}
        {speech === 'none' && (
          <div className="feedback feedback--bad tiny">
            <b>Ses çalışmıyor: </b>Bu cihazda kullanılabilir bir konuşma sesi bulunamadı.{' '}
            <Link to="/settings" className="link">
              Ayarlar
            </Link>{' '}
            bölümünde ne yapman gerektiği yazıyor.
          </div>
        )}

        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <Chips items={STATUSES} value={status} onChange={setStatus} />

        {groups.length === 0 && (
          <div className="empty">
            <span className="empty-icon"><Icon name="check" size={22} /></span>
            <div className="small">
              {status === 'yeni'
                ? 'Bu grupta görmediğin karakter kalmamış.'
                : status === 'ogreniliyor'
                  ? 'Şu an öğrenme aşamasında olan karakter yok.'
                  : 'Bu grupta henüz öğrenilmiş karakter yok — tekrar listesine ekleyerek başla.'}
            </div>
          </div>
        )}

        {groups.map((g) => (
          <div key={g.group} className="stack-sm">
            <div className="row">
              <h3 className="ja">{g.group}</h3>
              <div className="spacer" />
              <span className="tiny faint">{g.chars.length}</span>
            </div>
            <div className="grid grid-kana">
              {g.chars.map((k) => {
                const st = states.get(k.char)
                const cls =
                  st?.phase === 'review'
                    ? ' is-known'
                    : st && st.phase !== 'new'
                      ? ' is-learning'
                      : ''
                return (
                  <button key={k.char} className={`kana-cell${cls}`} onClick={() => setOpen(k)}>
                    <span className="c">
                      <KanaGlyph char={k.char} size="1.85rem" />
                    </span>
                    <span className="r">{k.romaji}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {filter === 'base' && (
          <div className="card stack-sm">
            <div className="card-title">Karışan çiftler</div>
            <div className="card-sub">Bu ikililer en çok hata yapılan yerlerdir. Karşılaştırmak için dokun.</div>
            <div className="row-wrap" style={{ marginTop: 6 }}>
              {CONFUSING_PAIRS.filter((p) =>
                kind === 'hiragana' ? /[ぁ-ん]/.test(p[0]) : /[ァ-ン]/.test(p[0]),
              ).map(([a, b]) => (
                <button
                  key={a + b}
                  className="badge ja"
                  style={{ fontSize: '0.95rem', padding: '5px 12px', cursor: 'pointer' }}
                  onClick={() => {
                    const k = KANA_BY_CHAR.get(a)
                    if (k) setOpen(k)
                  }}
                >
                  {a} / {b}
                </button>
              ))}
            </div>
          </div>
        )}
        {kind === 'hiragana' && <HiraganaWords states={states} />}
      </div>

      {open && <KanaSheet k={open} onClose={() => setOpen(null)} onStep={step} />}
    </>
  )
}

// ————————————————————————— Sadece hiragana ile yazilan kelimeler —————————————————————————

/**
 * Kana tablosu tek tek harfleri ogretir ama okumak harfleri tanimaktan ibaret
 * degil: harfleri arka arkaya BAGLAYABILMEK gerekiyor. Bu bolum onun icin var —
 * her kelime hecelerine ayrilmis halde, her hecenin okunusuyla birlikte duruyor.
 *
 * Liste tamamen hiragana yazilan kelimelerden olusur; kanjisi olanlarda kanji de
 * bilgi olarak gosterilir ki kelimeyi sonradan kanjili gorunce taniyabilesin.
 */

type WordFilter = 'hepsi' | 'okuyabildiklerim'
type MoraFilter = 'hepsi' | 'kisa' | '3' | '4'

function HiraganaWords({ states }: { states: Map<string, { phase: string }> }) {
  const [okunan, setOkunan] = useState<WordFilter>('hepsi')
  const [uzunluk, setUzunluk] = useState<MoraFilter>('hepsi')

  // "Ogrendiklerim" = tekrar listesine EKLEDIGIN harfler.
  //
  // Burada bilerek kartin evresine (phase) bakilmiyor. Yeni eklenen bir kart
  // 'new' evresindedir; evreye baksaydik harfi ekledikten sonra bile liste bos
  // kalir, kullanici da neyi yanlis yaptigini anlamazdi. Bir harfi listeye
  // eklemek zaten "bunu gordum, calisiyorum" demektir - filtre icin dogru
  // sinyal budur.
  const bilinen = new Set(states.keys())

  let list = KANA_WORDS
  if (okunan === 'okuyabildiklerim') list = wordsReadableWith(bilinen)
  // En kısa kova 1 VE 2 heceyi birlikte alır: listede tek heceli kelimeler de
  // var (て, め) ve yalnızca "2 heceli" denseydi hiçbir süzgece düşmeyip
  // görünmez olurlardı.
  if (uzunluk !== 'hepsi') {
    list = list.filter((w) => {
      const n = moraCount(w.kana)
      if (uzunluk === 'kisa') return n <= 2
      if (uzunluk === '3') return n === 3
      return n >= 4
    })
  }

  return (
    <div className="stack-sm">
      <div className="row">
        <h3>Sadece hiragana ile yazılan kelimeler</h3>
        <div className="spacer" />
        <span className="tiny faint tabular">{list.length}</span>
      </div>
      <div className="card-sub">
        Bu kelimelerin hepsi baştan sona hiragana yazılır — kanji bilmeden okunur. Her kelimenin altında Türkçe
        yazımla yaklaşık okunuşu, altında da hecelere ayrılmış hâli var. Japoncada her hece eşit uzunlukta okunur;
        acele etmeden hece hece sökmek okumayı hızlandırır.
      </div>

      <Chips
        items={[
          { id: 'hepsi', label: 'Tüm kelimeler' },
          { id: 'okuyabildiklerim', label: 'Eklediğim harflerle' },
        ]}
        value={okunan}
        onChange={(v) => setOkunan(v as WordFilter)}
      />
      <Chips
        items={[
          { id: 'hepsi', label: 'Her uzunluk' },
          { id: 'kisa', label: '1–2 heceli' },
          { id: '3', label: '3 heceli' },
          { id: '4', label: '4+ heceli' },
        ]}
        value={uzunluk}
        onChange={(v) => setUzunluk(v as MoraFilter)}
      />

      {okunan === 'okuyabildiklerim' && bilinen.size === 0 && (
        <div className="feedback feedback--info tiny">
          Henüz tekrar listene harf eklemedin, o yüzden bu süzgeç boş. Yukarıdaki tablodan bir karaktere dokunup{' '}
          <b>Tekrar listesine ekle</b> dersen burası dolmaya başlar: yalnızca eklediğin harflerle sökülebilen
          kelimeler kalır.
        </div>
      )}

      {okunan === 'okuyabildiklerim' && bilinen.size > 0 && list.length === 0 && (
        <div className="feedback feedback--info tiny">
          Eklediğin {bilinen.size} harfle tam olarak okunabilen kelime yok. Bir kelimenin listelenmesi için
          <b> bütün</b> heceleri eklediğin harfler arasında olmalı — birkaç harf daha ekleyince burası dolar.
        </div>
      )}

      {list.length > 0 && (
        <div className="stack-sm">
          {list.map((w) => (
            <WordRow key={w.kana} w={w} />
          ))}
        </div>
      )}
    </div>
  )
}

function WordRow({ w }: { w: KanaWord }) {
  const parts = moraReadings(w.kana)

  return (
    <div className="wordrow">
      <div className="row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ja wordrow-word">{w.kana}</div>
          {/*
            Romaji tek basina yeterli degil: "shi", "chi", "tsu" bir Turk
            okuyucuyu yaniltir. Onun icin kelimenin Turkce yazimla yaklasik
            okunusu da veriliyor - hecelerin altindaki romaji ise uluslararasi
            yazim oldugu icin duruyor.
          */}
          <div className="wordrow-oku">{jaToTurkishSpeech(w.kana)}</div>
          <div className="wordrow-tr">{w.tr}</div>
        </div>
        <div className="stack-sm" style={{ gap: 4, alignItems: 'flex-end' }}>
          <SpeakBtn text={w.kana} lang="ja" reading={w.kana} size="sm" />
          {w.kanji && <span className="badge tiny ja">{w.kanji}</span>}
        </div>
      </div>

      {/* Heceleme: her mora ayri bir kutu, altinda okunusu */}
      <div className="mora-line">
        {parts.map((t, i) => (
          <span key={i} className="mora">
            <span className="ja mora-ch">{t.unit}</span>
            <span className="mora-r">{t.unit === 'っ' ? '⟨dur⟩' : t.romaji}</span>
          </span>
        ))}
        <span className="mora-sum tabular">{parts.length} hece</span>
      </div>

      {readingNote(w.kana) && <div className="tiny wordrow-note wordrow-note--warn">{readingNote(w.kana)}</div>}

      {w.kana.includes('っ') && (
        <div className="tiny faint wordrow-note">
          Küçük っ ses vermez; kendinden sonraki sessizi ikiler ve orada kısa bir duraklama olur.
        </div>
      )}
    </div>
  )
}



// ————————————————————————— Karakter sayfası —————————————————————————

type SheetTab = 'buyuk' | 'cizgi' | 'yaz' | 'kelime'

const SHEET_TABS: { id: SheetTab; label: string }[] = [
  { id: 'buyuk', label: 'Büyük hâli' },
  { id: 'cizgi', label: 'Çizgi sırası' },
  { id: 'yaz', label: 'Yazarak çalış' },
  { id: 'kelime', label: 'Kelimeler' },
]

function KanaSheet({ k, onClose, onStep }: { k: KanaChar; onClose: () => void; onStep: (d: number) => void }) {
  const [tab, setTab] = useState<SheetTab>('buyuk')
  const [zoom, setZoom] = useState(false)
  const examples = VOCAB_JA.filter((v) => v.reading?.includes(k.char)).slice(0, 6)
  const speech = useSpeechMode('ja', k.char)

  const addToDeck = async () => {
    await ensureCards([{ kind: 'kana', refId: k.char, lang: 'ja' }])
    onClose()
  }

  const resetCard = async () => {
    await db.cards.delete(cardId('kana', k.char))
    onClose()
  }

  if (zoom) return <ZoomView k={k} onClose={() => setZoom(false)} onStep={onStep} />

  return (
    <Sheet onClose={onClose}>
      <div className="stack lang-ja">
        <div className="row">
          <button className="btn btn--sm btn--ghost" onClick={() => onStep(-1)} aria-label="Önceki karakter">
            ‹
          </button>
          <div className="spacer" />
          <div className="center stack-sm" style={{ gap: 2 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.06em' }}>{k.romaji}</div>
            <div className="tiny dim">Okunuşu: {k.trHint}</div>
          </div>
          <div className="spacer" />
          <button className="btn btn--sm btn--ghost" onClick={() => onStep(1)} aria-label="Sonraki karakter">
            ›
          </button>
        </div>

        <div className="row" style={{ justifyContent: 'center' }}>
          <SpeakBtn text={k.char} lang="ja" reading={k.char} />
          {k.strokes && <Badge>{k.strokes} çizgi</Badge>}
          <Badge tone="ja">{k.type === 'hiragana' ? 'hiragana' : 'katakana'}</Badge>
          {k.kind !== 'base' && <Badge tone="accent">{k.kind}</Badge>}
        </div>

        {/*
          Alistirma sayfalarina buradan giriliyor. Onceden yalnizca ana sayfadaki
          araclar izgarasinda duruyorlardi; harfleri calisirken akla gelen ilk yer
          ise bu sayfa oldugu icin buraya da konuldu.
        */}
        <div className="stack-sm">
          <h3>Kendini dene</h3>
          <div className="grid grid-auto">
            {(k.type === 'hiragana' ? PRACTICE : PRACTICE_KATA).map((p) => (
              <Link key={p.to} to={p.to} className="tool">
                <span className="ja tool-glyph">{p.glyph}</span>
                <span className="tool-title">{p.title}</span>
                <span className="tool-sub">{p.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {speech === 'approx' && (
          <div className="tiny faint center">
            Ses, Japonca ses paketi olmadığı için Türkçe sesle yaklaşık okunuyor.
          </div>
        )}

        <Chips items={SHEET_TABS} value={tab} onChange={setTab} />

        {tab === 'buyuk' && (
          <div className="stack-sm">
            <button className="bigchar" onClick={() => setZoom(true)} title="Tam ekran büyüt">
              <KanaGlyph char={k.char} size="clamp(7rem, 42vw, 15rem)" weight={4.5} />
              <span className="bigchar-hint tiny faint">⤢ tam ekran</span>
            </button>

            <FormComparison char={k.char} />
            {k.mnemonic && (
              <div className="feedback feedback--info">
                <span className="bold">Hatırlatıcı: </span>
                {k.mnemonic}
              </div>
            )}
            <div className="row-wrap tiny dim" style={{ gap: 14, justifyContent: 'center' }}>
              <span>
                Grubu: <span className="ja">{k.group}</span>
              </span>
              <span>Romaji: {k.romaji}</span>
            </div>
          </div>
        )}

        {tab === 'cizgi' && <StrokeOrder char={k.char} height={230} />}

        {tab === 'yaz' && (
          <div className="stack-sm">
            <WritePractice key={k.char} char={k.char} />
            <div className="tiny faint">
              Doğru sırayı unuttuysan "Çizgi sırası" sekmesine dön — {k.strokes ?? '?'} çizgi.
            </div>
          </div>
        )}

        {tab === 'kelime' && (
          <div className="stack-sm">
            {examples.length === 0 && (
              <div className="tiny faint center">Bu karakterin geçtiği kelime henüz sözlükte yok.</div>
            )}
            {examples.map((v) => (
              <div key={v.id} className="row small">
                <SpeakBtn text={v.reading ?? v.term} lang="ja" size="sm" reading={v.reading} />
                <div className="stack-sm" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                  <span className="ja bold" style={{ fontSize: '1.15rem' }}>
                    {v.term}
                  </span>
                  <span className="tiny dim">
                    <span className="ja">{v.reading}</span>{' '}
                    <span className="faint mono">{toRomaji(v.reading ?? '')}</span>
                  </span>
                </div>
                <span className="dim tiny" style={{ textAlign: 'right' }}>
                  {v.tr}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="row">
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={addToDeck}>
            Tekrar listesine ekle
          </button>
          <button className="btn btn--ghost" onClick={resetCard} title="Bu kartın ilerlemesini sıfırla">
            Sıfırla
          </button>
        </div>
      </div>
    </Sheet>
  )
}

/** Tam ekran büyüteç: kağıda bakarken ekrana yaklaşmak zorunda kalmamak için. */
function ZoomView({ k, onClose, onStep }: { k: KanaChar; onClose: () => void; onStep: (d: number) => void }) {
  const [strokes, setStrokes] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onStep])

  return (
    <div className="zoom lang-ja">
      <div className="zoom-top row">
        <button className="btn btn--sm btn--ghost" onClick={onClose}>
          <Icon name="close" size={15} />
          Kapat
        </button>
        <div className="spacer" />
        <span className="bold" style={{ fontSize: '1.2rem', letterSpacing: '0.06em' }}>
          {k.romaji}
        </span>
        <span className="tiny dim">· {k.trHint}</span>
        <div className="spacer" />
        <SpeakBtn text={k.char} lang="ja" reading={k.char} />
      </div>

      <div className="zoom-body">
        {strokes ? (
          <div style={{ width: '100%', maxWidth: 520 }}>
            <StrokeOrder char={k.char} height={Math.min(420, Math.round(window.innerHeight * 0.5))} />
          </div>
        ) : (
          <div className="zoom-char">
            <KanaGlyph char={k.char} size="min(72vw, 62vh)" weight={4} />
          </div>
        )}
      </div>

      <div className="zoom-bottom row">
        <button className="btn btn--ghost" onClick={() => onStep(-1)} aria-label="Önceki">
          <Icon name="left" size={17} />
        </button>
        <button className="btn btn--sm" style={{ flex: 1 }} onClick={() => setStrokes((s) => !s)}>
          {strokes ? 'Büyük hâli' : 'Çizgi sırası'}
        </button>
        <button className="btn btn--ghost" onClick={() => onStep(1)} aria-label="Sonraki">
          <Icon name="right" size={17} />
        </button>
      </div>
    </div>
  )
}

/**
 * Aynı karakterin el yazısı ve basılı biçimlerini yan yana gösterir.
 *
 * さ・き・り・ふ gibi bazı kana'da ders kitabı biçimi (ayrık çizgiler) ile
 * ekran yazı tiplerinin biçimi (bitişik) farklıdır. Elle yazarken kitaptaki
 * biçim doğrudur; ama metin okurken diğerini de tanıman gerekir. İkisini bir
 * arada görmek bu kafa karışıklığını baştan çözer.
 */
const FORM_DIFFERS = ['さ', 'き', 'り', 'ふ', 'そ', 'ゆ', 'サ', 'キ', 'リ', 'フ', 'ソ', 'ユ']

function FormComparison({ char }: { char: string }) {
  const differs = FORM_DIFFERS.includes(char)

  return (
    <div className="card stack-sm">
      <div className="row">
        <div className="card-title" style={{ flex: 1, fontSize: '0.95rem' }}>
          İki biçim
        </div>
        {differs && <Badge tone="warn">bu harfte fark var</Badge>}
      </div>

      <div className="grid grid-2">
        <div className="center stack-sm" style={{ gap: 4 }}>
          <div className="form-box">
            <KanaGlyph char={char} size="3.4rem" weight={4.5} />
          </div>
          <div className="tiny bold">El yazısı biçimi</div>
          <div className="tiny faint">Böyle yaz</div>
        </div>
        <div className="center stack-sm" style={{ gap: 4 }}>
          <div className="form-box">
            <span className="ja" style={{ fontSize: '3.4rem', lineHeight: 1 }}>
              {char}
            </span>
          </div>
          <div className="tiny bold">Basılı biçim</div>
          <div className="tiny faint">Böyle görürsün</div>
        </div>
      </div>

      <div className="tiny dim">
        {differs
          ? 'Bu karakterde ikisi farklı görünür — ama aynı harftir. Ders kitapları ve NHK el yazısı biçimini kullanır; ekran yazı tipleri çizgileri birleştirir. Sen soldakini yaz, sağdakini tanı.'
          : 'Bu karakterde iki biçim neredeyse aynı. Bazı kana’da (さ き り ふ) belirgin fark olur.'}
      </div>
    </div>
  )
}
