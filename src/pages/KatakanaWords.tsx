import { useMemo, useState } from 'react'
import { SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import {
  ALL_KATA_WORDS,
  KATA_THEMES,
  kataReading,
  kataTokenize,
  type KataWord,
} from '@/content/ja/katakana-words'

// Katakana kelime listesi — kaynağıyla birlikte.
//
// NEDEN HIRAGANA SÖZLÜĞÜNDEN FARKLI GÖRÜNÜYOR:
// Orada asıl bilgi Türkçe karşılıktı. Burada asıl bilgi KAYNAK KELİME. Çünkü
// katakana kelimesinin anlamını öğrenmek diye bir iş yok — コーヒー’nin "kahve"
// demek olduğunu zaten biliyorsun. Öğrenilecek şey, "coffee"nin nasıl コーヒー
// hâline geldiği. Kaynak o yüzden kelimenin hemen altında, en görünür yerde.
//
// Heceleme şeridi de burada daha çok işe yarıyor: katakananın zorluğu ー ve ッ
// gibi "ses vermeyen ama hece sayılan" işaretlerdir, onları kutu kutu görmek
// ritmi oturtuyor.

type Filter = 'hepsi' | 'notlu' | 'uzatma' | 'kucukTsu' | 'genis'

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: 'hepsi', label: 'Tüm kelimeler', hint: '' },
  { id: 'notlu', label: 'Tuzaklı olanlar', hint: 'Yalancı dostlar ve Japon yapımı İngilizce' },
  { id: 'uzatma', label: 'Uzatma ー', hint: 'Uzatmayı yutmak en sık hata' },
  { id: 'kucukTsu', label: 'Küçük ッ', hint: 'Sonraki sessizi ikiler' },
  { id: 'genis', label: 'Genişletilmiş', hint: 'ファ ティ ヴ gibi sonradan uydurulmuş yazımlar' },
]

const EXT_RE = /[ァィェォゥ]|ヴ/

export default function KatakanaWordsPage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('hepsi')

  const terim = q.trim().toLocaleLowerCase('tr')

  const bolumler = useMemo(() => {
    const gecer = (w: KataWord) => {
      if (filter === 'notlu' && !w.note) return false
      if (filter === 'uzatma' && !w.kana.includes('ー')) return false
      if (filter === 'kucukTsu' && !w.kana.includes('ッ')) return false
      // Genişletilmiş yazım küçük ünlü ya da ヴ içerir; küçük ャュョ buna girmez
      if (filter === 'genis' && !EXT_RE.test(w.kana)) return false
      if (!terim) return true
      return (
        w.kana.includes(terim) ||
        w.tr.toLocaleLowerCase('tr').includes(terim) ||
        w.from.toLocaleLowerCase('tr').includes(terim) ||
        kataReading(w.kana).includes(terim)
      )
    }
    return KATA_THEMES.map((t) => ({ ...t, words: t.words.filter(gecer) })).filter(
      (t) => t.words.length > 0,
    )
  }, [terim, filter])

  const bulunan = bolumler.reduce((n, t) => n + t.words.length, 0)
  const aktif = FILTERS.find((f) => f.id === filter)

  return (
    <>
      <TopBar title="Katakana kelimeleri" sub="Kaynağıyla birlikte" back="/kana/katakana" />

      <div className="page stack-lg lang-ja">
        <div className="card card--accent stack-sm">
          <div className="card-title">Katakana ezberlenmez, çözülür</div>
          <div className="card-sub">
            Bu listedeki kelimelerin neredeyse tamamı yabancı kökenli. Yani anlamı zaten biliyorsun;
            iş, sesi geri kurmakta. コーヒー’yi “ko·o·hi·i” diye sökebilirsen bir saniye sonra
            “coffee” dersin. Bu yüzden her satırda kaynak kelime yazıyor — öğrenilen şey kelime
            değil, geçiş kalıbı.
          </div>
          <div className="tiny faint" style={{ marginTop: 4 }}>
            Ama her katakana kelime İngilizceden gelmez: パン Portekizce, アルバイト Almanca. Bir
            kısmı da Japonya’da uydurulmuştur (コンビニ, サラリーマン). Onlar aşağıda not düşüldü.
          </div>
        </div>

        <div className="vocab-tools stack-sm">
          <label className="vocab-search">
            <Icon name="search" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: kahve, coffee, コーヒー"
              spellCheck={false}
            />
            {q && (
              <button className="vocab-clear" onClick={() => setQ('')} aria-label="Aramayı temizle">
                <Icon name="close" size={14} />
              </button>
            )}
          </label>

          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={'chip' + (filter === f.id ? ' active' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="tiny faint">
            {bulunan} kelime{aktif?.hint ? ` · ${aktif.hint}` : ''}
            {(terim || filter !== 'hepsi') && ` (${ALL_KATA_WORDS.length} içinden)`}
          </div>
        </div>

        {bolumler.length === 0 && (
          <div className="card card-sub">
            Eşleşen kelime yok. Kaynak kelimeyle de arayabilirsin: “coffee”, “table”.
          </div>
        )}

        {bolumler.map((t) => (
          <div key={t.id} className="stack-sm">
            <h2>{t.title}</h2>
            {t.desc && (
              <div className="card-sub" style={{ marginTop: -2 }}>
                {t.desc}
              </div>
            )}
            <div className="vocab-list">
              {t.words.map((w) => (
                <KataRow key={t.id + ':' + w.kana} w={w} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function KataRow({ w }: { w: KataWord }) {
  const parts = kataTokenize(w.kana)

  return (
    <div className="vocab-row">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ja vocab-kana">{w.kana}</div>
          <div className="vocab-oku">{kataReading(w.kana)}</div>
          <div className="vocab-tr">{w.tr}</div>
        </div>
        <div className="stack-sm" style={{ gap: 5, alignItems: 'flex-end' }}>
          <SpeakBtn text={w.kana} lang="ja" reading={w.kana} size="sm" />
          <span className="kata-from">← {w.from}</span>
        </div>
      </div>

      {/* Heceleme: ー ve ッ ses vermez ama kutuları var — hece sayısı görünsün */}
      <div className="mora-line">
        {parts.map((t, i) => (
          <span key={i} className="mora">
            <span className="ja mora-ch">{t}</span>
            <span className="mora-r">
              {t === 'ッ' ? '⟨dur⟩' : t === 'ー' ? '⟨uzat⟩' : kataReading(t)}
            </span>
          </span>
        ))}
        <span className="mora-sum tabular">{parts.length} hece</span>
      </div>

      {w.note && <div className="tiny vocab-note vocab-note--warn">{w.note}</div>}
    </div>
  )
}
