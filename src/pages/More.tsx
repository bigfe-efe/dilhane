import { Link } from 'react-router-dom'
import { TopBar } from '@/components/ui'
import { Icon, type IconName } from '@/components/icons'
import { useDueCounts, useToday } from '@/db/hooks'
import { GRAMMAR, LESSONS, VOCAB } from '@/content'

// Günlük akışta yeri olmayan şeyler.
//
// Kana tabloları ve alıştırmalar buradan ÇIKARILDI — onlar her gün kullanılıyor
// ve artık kendi sekmeleri var (Çalış). Burada kalanlar ara sıra bakılan
// şeyler: yön, üretim alıştırmaları, başvuru kaynakları ve durum.

interface Entry {
  to: string
  icon?: IconName
  glyph?: string
  title: string
  sub: string
}

const GROUPS: { title: string; note?: string; items: Entry[] }[] = [
  {
    title: 'Yön',
    items: [
      { to: '/rota', icon: 'target', title: 'Rota ve çalışma planı', sub: 'Nerede olduğun, sırada ne var, haftalık plan' },
      { to: '/n5', glyph: '五', title: 'JLPT N5', sub: 'Sınav nasıl işliyor, nerede duruyorsun' },
    ],
  },
  {
    title: 'Üretim',
    note: 'Genki derslerine geçtikten sonra işe yarar — cümle kurabilmen gerekiyor.',
    items: [
      { to: '/writing', icon: 'pen', title: 'Serbest yazma', sub: 'Konu seç, metin yaz, kendini değerlendir' },
      { to: '/speak', icon: 'mic', title: 'Konuşma', sub: 'Cümleyi sesli söyle, telaffuz puanlansın' },
    ],
  },
  {
    title: 'Başvuru',
    note: 'Ezberlemek için değil, takıldığında bakmak için.',
    items: [
      { to: '/dictionary', icon: 'search', title: 'Sözlük', sub: 'Kelime, okunuş, romaji ve Türkçe arama' },
      { to: '/grammar', icon: 'brackets', title: 'Dilbilgisi', sub: `${GRAMMAR.length} konu, örnekli anlatım` },
      { to: '/verbs', icon: 'transform', title: 'Fiil ve sıfat çekimleri', sub: 'Tam çekim tabloları' },
    ],
  },
  {
    title: 'Durum',
    items: [
      { to: '/stats', icon: 'chart', title: 'İstatistik', sub: 'Günlük çalışma ve seri takibi' },
      { to: '/zorlandiklarim', icon: 'flame', title: 'Zorlandıkların', sub: 'Sürekli unuttuğun kartlar' },
      { to: '/settings', icon: 'sliders', title: 'Ayarlar', sub: 'Ses, veri ve yedekleme' },
    ],
  },
]

export default function MorePage() {
  const today = useToday()
  const due = useDueCounts()

  return (
    <>
      <TopBar title="Daha fazlası" />

      <div className="page stack-lg">
        <div className="card card--pad-lg">
          <div className="row">
            <div className="stack-sm" style={{ gap: 2, flex: 1 }}>
              <div className="card-title">Dilhane</div>
              <div className="card-sub">
                {LESSONS.length} ders · {VOCAB.length} kelime · {GRAMMAR.length} dilbilgisi konusu
              </div>
              {due.total > 0 && <div className="tiny faint">{due.total} kart tekrarı bekliyor</div>}
            </div>
            <div className="center stack-sm" style={{ gap: 2 }}>
              <span style={{ color: today.streak > 0 ? 'var(--accent)' : 'var(--faint)' }}>
                <Icon name="flame" size={20} />
              </span>
              <div className="tiny faint tabular">{today.streak} gün</div>
            </div>
          </div>
        </div>

        {GROUPS.map((g) => (
          <div key={g.title} className="stack-sm">
            <h2>{g.title}</h2>
            {g.note && <div className="card-sub" style={{ marginTop: -2 }}>{g.note}</div>}
            {g.items.map((l) => (
              <Link key={l.to} to={l.to} className="card card--link">
                <div className="row">
                  {l.glyph ? (
                    <span className="entry-glyph ja">{l.glyph}</span>
                  ) : (
                    <span className="entry-icon">
                      <Icon name={l.icon ?? 'layers'} size={19} />
                    </span>
                  )}
                  <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                    <div className="card-title">{l.title}</div>
                    <div className="card-sub">{l.sub}</div>
                  </div>
                  <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
