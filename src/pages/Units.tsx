import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { UNITS } from '@/content/ja/units'
import { useUnitProgress } from '@/db/hooks'

// Üniteler — uygulamanın ana öğrenme yolu.
//
// NEDEN DERSLERİN YERİNE DEĞİL, ÜSTÜNDE:
// Genki dersleri duruyor ve silinmedi; her ünite kendi konusuna karşılık
// gelen dersleri gösteriyor. Ünite KONUYU öğretir (kendini tanıtmak,
// saatler), ders ise kitabın sırasını izler. İkisini ayrı sekmelerde
// tutmak öğrenciye "hangisinden gideyim" sorusunu sordururdu; artık tek
// giriş var ve dersler ünitenin içinden açılıyor.

export default function UnitsPage() {
  const prog = useUnitProgress()

  const biten = UNITS.filter((u) => prog.get(u.id)?.status === 'completed').length
  const toplamOdev = UNITS.reduce((n, u) => n + u.homework.length, 0)
  const yapilanOdev = UNITS.reduce((n, u) => n + (prog.get(u.id)?.homework.length ?? 0), 0)

  return (
    <>
      <TopBar title="Üniteler" sub={`${biten} / ${UNITS.length} tamamlandı`} />

      <div className="page stack-lg lang-ja">
        <div className="card card--pad-lg stack-sm">
          <div className="row">
            <div style={{ flex: 1 }}>
              <div className="card-title">Konu konu Japonca</div>
              <div className="card-sub">
                Her ünite bir duruma odaklanır: kendini tanıtmak, saat söylemek, alışveriş yapmak. İçinde
                dilbilgisi, kelime, okuma metni, ödev ve ünite testi var.
              </div>
            </div>
          </div>
          <Bar value={biten} max={UNITS.length} />
          <div className="tiny faint">
            {yapilanOdev} / {toplamOdev} ödev yapıldı · Sıra N5’in kapsadığı günlük durumlara göre dizildi
          </div>
        </div>

        <div className="stack-sm">
          {UNITS.map((u) => {
            const p = prog.get(u.id)
            const odev = p?.homework.length ?? 0
            const bitti = p?.status === 'completed'
            return (
              <Link key={u.id} to={`/unite/${u.id}`} className="card card--link">
                <div className="row">
                  <span
                    className="entry-glyph"
                    style={{
                      background: bitti ? 'var(--ok-dim)' : undefined,
                      color: bitti ? 'var(--ok)' : undefined,
                      fontWeight: 700,
                    }}
                  >
                    {bitti ? <Icon name="check" size={16} /> : u.no}
                  </span>
                  <div className="stack-sm" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                    <div className="card-title">{u.title}</div>
                    <div className="card-sub ja">{u.subtitle}</div>
                    <div className="tiny faint">
                      {u.minutes} dk · {u.grammar.length} konu · {u.vocab.length} kelime · {u.test.length} soruluk test
                      {p ? ` · ödev ${odev}/${u.homework.length}` : ''}
                      {p?.testBest ? ` · test %${p.testBest}` : ''}
                    </div>
                  </div>
                  <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                </div>
              </Link>
            )
          })}
        </div>

        <Link to="/lessons" className="card card--link">
          <div className="row">
            <span className="entry-icon">
              <Icon name="book" size={18} />
            </span>
            <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
              <div className="card-title">Genki dersleri</div>
              <div className="card-sub">
                Kitabın kendi sırasını izleyen dersler. Üniteler bunların yerine geçmez — her ünite ilgili
                dersleri kendi içinde gösterir.
              </div>
            </div>
            <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
          </div>
        </Link>
      </div>
    </>
  )
}
