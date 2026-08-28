import { Link } from 'react-router-dom'
import { Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ROADMAP, buildPlan, stageProgress } from '@/content/ja/roadmap'
import { SECTION_TR, type Section } from '@/content/ja/exam'
import { useExams, useLessonProgress } from '@/db/hooks'

// Yol haritası ve kişisel çalışma planı.
//
// Bu sayfa "şimdi ne yapmalıyım" sorusunun tek adresi. Ana sayfa günlük işi
// gösterir; burası ise haftalık/aylık yönü gösterir ve en çok sorulan soruyu
// cevaplar: hiragana bitti, sırada katakana mı kanji mi kelime mi?

export default function RoadmapPage() {
  const exams = useExams()
  const prog = useLessonProgress()

  const tamamlanan = new Set(
    [...prog.map.entries()].filter(([, v]) => v.status === 'completed').map(([k]) => k),
  )
  const plan = buildPlan(exams, tamamlanan)
  const aktifIndex = ROADMAP.findIndex((s) => s.id === plan.stageId)

  return (
    <>
      <TopBar title="Rota" sub="Nerede olduğun ve sırada ne var" />

      <div className="page stack-lg lang-ja">
        {/* ————— Bu hafta ————— */}
        <div className="card card--accent stack-sm">
          <div className="row">
            <span className="entry-icon">
              <Icon name="target" size={18} />
            </span>
            <div className="card-title" style={{ flex: 1 }}>
              {plan.headline}
            </div>
          </div>
          <div className="card-sub" style={{ lineHeight: 1.65 }}>
            {plan.rationale}
          </div>
        </div>

        <div className="stack-sm">
          <h3>Bu hafta yapılacaklar</h3>
          {plan.items.map((it, i) => (
            <div key={i} className="card stack-sm">
              <div className="row">
                <span className="plan-no tabular">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title" style={{ fontSize: '0.95rem' }}>
                    {it.title}
                  </div>
                  <div className="card-sub" style={{ lineHeight: 1.55 }}>
                    {it.detail}
                  </div>
                </div>
              </div>
              {it.link && (
                <Link to={it.link.to} className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
                  {it.link.label}
                  <Icon name="right" size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* ————— Rota ————— */}
        <div className="stack-sm">
          <h3>Yol haritası</h3>
          <div className="card-sub" style={{ marginBottom: 2 }}>
            Sıralama Genki I (3. baskı) ders düzenini izler. Kanji ayrı bir uğraş değildir — derslerin içinde,
            kelimelerle birlikte gelir.
          </div>

          {ROADMAP.map((stage, i) => {
            const p = stageProgress(stage, tamamlanan)
            const durum = i < aktifIndex ? 'done' : i === aktifIndex ? 'active' : 'todo'
            return (
              <div key={stage.id} className={`card stage stage--${durum}`}>
                <div className="row">
                  <span className="stage-glyph ja">{stage.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="card-title">{stage.title}</div>
                      {durum === 'active' && <span className="badge badge--accent tiny">şimdi buradasın</span>}
                    </div>
                    <div className="card-sub">{stage.sub}</div>
                  </div>
                  <span className="tiny faint">{stage.duration}</span>
                </div>

                {stage.lessonIds.length > 0 && (
                  <div className="stack-sm" style={{ marginTop: 10 }}>
                    <Bar value={p} />
                    <div className="tiny faint tabular">
                      {stage.lessonIds.filter((id) => tamamlanan.has(id)).length} / {stage.lessonIds.length} ders
                    </div>
                  </div>
                )}

                {durum !== 'todo' && (
                  <>
                    <ul className="tips" style={{ marginTop: 10 }}>
                      {stage.what.map((w, j) => (
                        <li key={j}>{w}</li>
                      ))}
                    </ul>
                    <div className="stage-why">{stage.why}</div>
                    <Link to={stage.link.to} className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start', marginTop: 10 }}>
                      {stage.link.label}
                      <Icon name="right" size={14} />
                    </Link>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* ————— Sınav geçmişi ————— */}
        <div className="stack-sm">
          <h3>Sınav geçmişin</h3>
          {exams.length === 0 ? (
            <div className="card stack-sm">
              <div className="card-sub">
                Henüz bitirme sınavına girmedin. Plan yapmak için önce ölçüm gerekiyor.
              </div>
              <Link to="/hiragana-sinav" className="btn btn--sm" style={{ alignSelf: 'flex-start' }}>
                Sınava gir
              </Link>
            </div>
          ) : (
            <>
              {exams.slice(0, 6).map((e) => (
                <div key={e.at} className="card stack-sm">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: '0.95rem' }}>
                        Hiragana bitirme sınavı
                      </div>
                      <div className="card-sub">
                        {new Date(e.at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {e.full ? 'tam' : 'kısa'} sınav
                      </div>
                    </div>
                    <span className="exam-hist-pct tabular" style={{ color: pctColor(e.percent) }}>
                      %{Math.round(e.percent)}
                    </span>
                  </div>
                  <div className="exam-hist-bars">
                    {Object.entries(e.sections)
                      .filter(([s]) => s !== 'cizim')
                      .map(([s, p]) => (
                        <div key={s} className="exam-hist-bar" title={`${sectionAdi(s)}: %${Math.round(p)}`}>
                          <i style={{ height: `${Math.max(4, p)}%`, background: pctColor(p) }} />
                          <span className="tiny faint">{sectionAdi(s).slice(0, 3)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              {exams.length > 1 && (
                <div className="tiny faint">
                  İlk sınavında %{Math.round(exams[exams.length - 1].percent)} almıştın, sonuncuda %
                  {Math.round(exams[0].percent)}.
                </div>
              )}
            </>
          )}
        </div>

        {/* ————— Sık sorulan ————— */}
        <div className="stack-sm">
          <h3>Sıra neden böyle?</h3>
          <div className="card stack-sm">
            <div className="card-title" style={{ fontSize: '0.95rem' }}>
              Hiragana bitti — katakana mı, kanji mi, kelime mi?
            </div>
            <div className="card-sub" style={{ lineHeight: 1.65 }}>
              <b>Katakana.</b> Yeni öğrendiğin sistemin aynısı: aynı 46 ses, aynı okunuşlar, sadece biçimler
              değişiyor. Bu yüzden bir haftada biter — kanji ise aylar sürer. Ayrıca katakana olmadan menü, marka,
              ülke adı ve ders kitabındaki kelime listelerinin yarısı okunmaz.
            </div>
            <div className="exam-tip">
              Kanjiyi ayrı çalışmak yaygın bir hata. "N5'in 100 kanjisi" gibi listelerden ezberlemek işe yaramaz,
              çünkü karakteri asacağın bir kelime yoktur. Genki kanjiyi 3. dersten itibaren o dersin kelimeleriyle
              birlikte verir; bu uygulama da aynı sırayı izliyor.
            </div>
            <div className="card-sub" style={{ lineHeight: 1.65 }}>
              Kelime de tek başına yetmez: dilbilgisi olmadan kelimeler cümle olmaz. Genki her derste üçünü birden
              verir — kelime, dilbilgisi, kanji. Yani doğru sıra <b>katakana → Genki derslerini sırayla</b>; kanji ve
              kelime bu derslerin içinde gelir.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/** Kayıtlı sonuçtaki bölüm anahtarı bilinmiyor olabilir (eski kayıt), o yüzden korumalı. */
function sectionAdi(s: string): string {
  return SECTION_TR[s as Section]?.title ?? s
}

function pctColor(p: number): string {
  if (p >= 85) return 'var(--ok)'
  if (p >= 70) return 'var(--warn)'
  return 'var(--bad)'
}
