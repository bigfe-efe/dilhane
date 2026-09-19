import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/ui'
import { Icon, type IconName } from '@/components/icons'

// Çalışma araçlarının tek adresi.
//
// SADELEŞTİRME (2026-09-17): Sayfa 22 aracı beş gruba bölüyordu ve üstünde
// aşamaya göre bir "önerilenler" ızgarası vardı — aynı araçlar iki kez
// görünüyordu. Aşama bilgisi zaten kenar çubuğunun altında yazdığı için o
// ızgara kaldırıldı. Kullanılmayan dört araç (Gün sonu, Hece sayma, Yazı
// çalışması, Dinleme ve video) buradan çıkarıldı; sayfaları yerinde duruyor,
// yalnızca bağlantıları yok.
//
// Sıra KULLANIMA göre: şu an çalışılan (kanji, kelime, sınav) üstte. Alfabe
// aşamasının araçları altta ve kapalı — alfabe bitti, gerektiğinde açılıyor.

interface Tool {
  to: string
  glyph?: string
  icon?: IconName
  title: string
  sub: string
}

interface Group {
  id: string
  title: string
  /** Başlığın altındaki açıklama — her grupta olmalı */
  note: string
  items: Tool[]
  /** Kapatılabilir grup; varsayılan kapalı */
  collapsible?: boolean
}

const GROUPS: Group[] = [
  {
    id: 'kanji',
    title: 'Kanji',
    note: 'N5’in 106 kanjisi. Kartlarla öğren, tabloda göz gezdir.',
    items: [
      { to: '/kanji-kartlar', glyph: '字', title: 'N5 kanji kartları', sub: 'Büyük kart, döngülü çizim ve N5 örnekleri' },
      { to: '/kanji-testi', glyph: '試', title: 'Kanji testi', sub: 'Cümlede boşluk doldur — şıklı ya da yazarak' },
      { to: '/kanji', glyph: '漢', title: 'Kanji tablosu', sub: 'Tema tema; tıkla, okunuşunu ve çizimini gör' },
    ],
  },
  {
    id: 'kelime',
    title: 'Kelime',
    note: 'Kelimeyi harf harf değil, anlamı ve okunuşuyla birlikte öğren.',
    items: [
      { to: '/kelimeler', glyph: '語', title: 'Hiragana kelime sözlüğü', sub: 'Tema tema, Türkçe karşılık ve dilbilgisi notu' },
      { to: '/katakana-kelime', glyph: '外', title: 'Katakana kelime listesi', sub: 'Yabancı kökenli kelimeler, kaynağıyla' },
      { to: '/kana-kelime', glyph: '読', title: 'Kelime okuma', sub: 'Hiragana kelimeleri hece hece sök' },
      { to: '/kelime-yazma', glyph: '筆', title: 'Kelime yazma', sub: 'Okunuşu gör, kanasını yaz' },
      { to: '/sayaclar', glyph: '数', title: 'Sayaçlar', sub: 'Kaç kişi, kaç tane, saat kaç — düzensizleriyle' },
    ],
  },
  {
    id: 'sinav',
    title: 'Sınav',
    note: 'Nerede olduğunu ölçer. Ayda bir deneme yeterli.',
    items: [
      { to: '/n5-deneme', glyph: '模', title: 'N5 deneme sınavı', sub: 'Gerçek biçim, süreli, bölüm bölüm sonuç' },
      { to: '/rota', icon: 'target', title: 'Rota ve çalışma planı', sub: 'Nerede olduğun ve sırada ne var' },
    ],
  },
  {
    id: 'kana',
    title: 'Kana ve yazım kuralları',
    note: 'Alfabeyi bitirdin. Takıldığında dönebilmen için burada duruyor.',
    collapsible: true,
    items: [
      { to: '/kana/hiragana', glyph: 'あ', title: 'Hiragana', sub: '46 karakter, dakuten ve yōon' },
      { to: '/kana/katakana', glyph: 'ア', title: 'Katakana', sub: 'Yabancı kelimelerin alfabesi' },
      { to: '/kana-kurallar', glyph: '則', title: 'Hiragana dilbilgisi', sub: 'Dakuten, küçük っ, uzun ünlü, ん, は→wa' },
      { to: '/kural-testi', glyph: '問', title: 'Kural okuma testi', sub: 'Okunuşu şıksız yaz' },
      { to: '/romaji', glyph: 'A', title: 'Romaji ve Japonca klavye', sub: 'Ne zaman kullanılır, nasıl yazılır' },
      { to: '/yazi-sistemi', icon: 'book', title: 'Yazı sistemi', sub: 'Üç alfabe, yazı yönü, çizgi sırası' },
      { to: '/kana-test', glyph: '試', title: 'Kendi testin', sub: 'Çıkacak karakterleri sen seç' },
      { to: '/kana-hiz', glyph: '速', title: 'Hız testi', sub: 'Tanıma hızını ölç' },
      { to: '/hiragana-sinav', glyph: '終', title: 'Hiragana bitirme sınavı', sub: 'Sekiz bölüm, eksik teşhisi' },
      { to: '/katakana-sinav', glyph: '終', title: 'Katakana bitirme sınavı', sub: 'Dokuz bölüm, kaynak kelime dahil' },
    ],
  },
]

/** Hangi kapatılabilir grupların açık bırakıldığı — cihaza özgü tercih */
const OPEN_KEY = 'calis:acik-gruplar'

function loadOpen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(OPEN_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export default function PracticePage() {
  const [acik, setAcik] = useState<Set<string>>(loadOpen)

  const toggle = (id: string) => {
    setAcik((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(OPEN_KEY, JSON.stringify([...next]))
      } catch {
        /* kaydedilemezse de bu oturumda çalışsın */
      }
      return next
    })
  }

  return (
    <>
      <TopBar title="Çalış" sub="Kanji, kelime ve sınav araçları" />

      <div className="page stack-lg lang-ja">
        {GROUPS.map((g) => {
          const kapali = g.collapsible === true && !acik.has(g.id)
          return (
            <section key={g.id} className="calis-group">
              <h2 className="calis-head">
                {g.collapsible ? (
                  <button className="calis-toggle" onClick={() => toggle(g.id)} aria-expanded={!kapali}>
                    {g.title}
                    <span className="calis-count">{g.items.length}</span>
                    <Icon name={kapali ? 'right' : 'down'} size={15} />
                  </button>
                ) : (
                  g.title
                )}
              </h2>
              <p className="calis-note">{g.note}</p>

              {!kapali && (
                <div className="calis-grid">
                  {g.items.map((t) => (
                    <Link key={t.to} to={t.to} className="card card--link">
                      <div className="row">
                        {t.glyph ? (
                          <span className="entry-glyph ja">{t.glyph}</span>
                        ) : (
                          <span className="entry-icon">
                            <Icon name={t.icon ?? 'layers'} size={19} />
                          </span>
                        )}
                        <div className="stack-sm" style={{ gap: 1, flex: 1, minWidth: 0 }}>
                          <div className="card-title">{t.title}</div>
                          <div className="card-sub">{t.sub}</div>
                        </div>
                        <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
