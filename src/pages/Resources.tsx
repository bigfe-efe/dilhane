import { useState } from 'react'
import { TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { RESOURCE_GROUPS, embedUrl, type Resource } from '@/content/ja/resources'

// Video kaynakları.
//
// Uygulamanın TEK internet gerektiren sayfası. Bu bilerek böyle: dinleme için
// gerçek Japonca ses şart ama uygulamanın çekirdeği çevrimdışı kalmalı. Bu
// yüzden videolar burada toplandı, başka hiçbir sayfa buna bağlı değil ve
// durum kullanıcıya açıkça söyleniyor.
//
// Oynatıcı yalnızca kullanıcı bir kaynağa dokununca yükleniyor — sayfa açılır
// açılmaz YouTube'a istek gitmesin diye.

export default function ResourcesPage() {
  const [acik, setAcik] = useState<Resource | null>(null)

  return (
    <>
      <TopBar title="Kaynaklar" sub="Dinleme ve video" back="/calis" />

      <div className="page stack-lg lang-ja">
        <div className="card stack-sm">
          <div className="row">
            <span className="entry-icon">
              <Icon name="headphones" size={18} />
            </span>
            <div className="card-title" style={{ flex: 1 }}>
              Neden dinleme?
            </div>
          </div>
          <div className="card-sub" style={{ lineHeight: 1.65 }}>
            Uygulamadaki sesler cihazın Japonca konuşma motorundan geliyor; tek tek kelime ve cümle için
            yeterli. Ama gerçek konuşmanın hızı, tonlaması ve iki kişi arasındaki akış ancak gerçek
            kayıtlardan duyulur. Uygulama içi <b>Dinleme</b> alıştırmasının yanında bunları da dinle.
          </div>
          <div className="feedback feedback--info tiny">
            <b>İnternet gerekir: </b>Uygulamanın geri kalanı tamamen çevrimdışı çalışır; yalnızca bu sayfadaki
            videolar dışarıya bağlanır. Oynatıcı sen bir kaynağa dokunana kadar yüklenmez.
          </div>
        </div>

        {acik && (
          <div className="card stack-sm">
            <div className="row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">{acik.title}</div>
                <div className="card-sub">{acik.channel}</div>
              </div>
              <button className="btn btn--sm btn--ghost" onClick={() => setAcik(null)}>
                <Icon name="close" size={15} />
                Kapat
              </button>
            </div>

            {embedUrl(acik) ? (
              <div className="video-frame">
                <iframe
                  src={embedUrl(acik)!}
                  title={acik.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="feedback feedback--info small">
                Bu bir kanal, oynatma listesi değil — uygulamanın içine gömülemiyor. Aşağıdaki bağlantı
                YouTube’da açar.
              </div>
            )}

            <a href={acik.url} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
              YouTube’da aç
              <Icon name="right" size={14} />
            </a>
          </div>
        )}

        {RESOURCE_GROUPS.map((g) => (
          <div key={g.title} className="stack-sm">
            <h2>{g.title}</h2>
            <div className="card-sub" style={{ marginTop: -2, lineHeight: 1.55 }}>
              {g.note}
            </div>
            {g.items.map((r) => {
              return (
                <button
                  key={r.id}
                  className="card card--link res-card"
                  onClick={() => setAcik(r)}
                  style={{ textAlign: 'left' }}
                >
                  <div className="row">
                    <span className="entry-icon">
                      <Icon name={r.kind === 'playlist' ? 'play' : 'layers'} size={18} />
                    </span>
                    <div className="stack-sm" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                        <div className="card-title">{r.title}</div>
                      </div>
                      <div className="card-sub">{r.desc}</div>
                      <div className="tiny faint">{r.channel}</div>
                    </div>
                    <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
                  </div>
                  <div className="res-why">{r.why}</div>
                </button>
              )
            })}
          </div>
        ))}

        <div className="card stack-sm">
          <div className="card-title">Nasıl dinlemeli?</div>
          <ul className="tips">
            <li>Her kelimeyi anlamaya çalışma. Genel anlamı yakalamak yeter — anlama, kelime bilgisinden önce gelir.</li>
            <li>Altyazıyı ilk izleyişte kapat, ikincide aç. Önce kulağını zorla.</li>
            <li>Günde 10 dakika, haftada bir saatten iyidir.</li>
            <li>Anlamadığın çok şey varsa seviye yüksektir; bir alt listeye in. Zorlanmak değil, ANLAYARAK dinlemek öğretir.</li>
          </ul>
        </div>

        <div className="tiny faint" style={{ lineHeight: 1.6 }}>
          Bu bağlantılar dışarıdaki kanallara aittir; içerikleri bu uygulamanın denetiminde değildir ve zamanla
          değişebilir. Bir bağlantı çalışmazsa kanal adıyla YouTube’da aratman yeterli.
        </div>
      </div>
    </>
  )
}
