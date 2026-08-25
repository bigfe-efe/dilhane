import { useState } from 'react'
import type { Exercise, Lang } from '@/types'
import { Badge, Empty, TopBar } from '@/components/ui'
import { ExerciseView } from '@/components/Exercise'
import { LANG_TR } from '@/content'
import { useSubmissions } from '@/db/hooks'
import { bumpStat, db } from '@/db/db'

/** Serbest yazma: konu seç, yaz, kendi kendini değerlendir, geçmişini gör. */
const PROMPTS: Record<Lang, { title: string; prompt: string; minWords: number; rubric: string[] }[]> = {
  ja: [
    // İlk üçü eskiden ayrı bir "Ödevler" sayfasındaydı; o sayfa buradakiyle
    // aynı işi yaptığı için kaldırıldı, konuları buraya taşındı.
    {
      title: 'Kendini tanıt',
      prompt: 'Kendini Japonca tanıt: adın, nereli olduğun, mesleğin, sevdiğin bir şey. En az 5 cümle.',
      minWords: 20,
      rubric: [
        'は konu ekini doğru kullandın mı?',
        'Her cümleyi です ile bitirdin mi?',
        'Kendi adını katakana ile yazdın mı?',
        '「よろしくおねがいします」 ile bitirdin mi?',
      ],
    },
    {
      title: 'Günlük rutinin',
      prompt: 'Sabahtan akşama günlük rutinini anlat. Zaman ifadeleri ve en az 6 farklı fiil kullan.',
      minWords: 30,
      rubric: [
        'Bütün fiilleri ます biçiminde çektin mi?',
        'を, に, で edatlarını doğru yerlerde kullandın mı?',
        'Saat ifadelerinde に kullandın mı (七時に)?',
        'En az 6 farklı fiil var mı?',
      ],
    },
    {
      title: 'Odanı betimle',
      prompt: 'Odanı Japonca betimle. En az 4 sıfat ve 3 tane あります/います cümlesi kullan.',
      minWords: 30,
      rubric: [
        'い-sıfat ve na-sıfatları doğru çektin mi?',
        'Cansız için あります, canlı için います kullandın mı?',
        'Konum ifadeleri kullandın mı (上, 中, 下)?',
        'En az bir olumsuz cümle var mı?',
      ],
    },
    {
      title: 'Günün nasıl geçti?',
      prompt: 'Bugün ne yaptığını Japonca anlat. ました biçimini kullan.',
      minWords: 30,
      rubric: [
        'Fiilleri ました / ませんでした biçiminde çektin mi?',
        'Zaman ifadeleri kullandın mı (今日, 朝, 夜)?',
        'を, に, で edatlarını doğru yerlerde kullandın mı?',
        'En az 5 farklı fiil var mı?',
      ],
    },
    {
      title: 'Ailen',
      prompt: 'Aileni tanıt. Kaç kişiler, ne iş yapıyorlar, nasıl insanlar?',
      minWords: 30,
      rubric: [
        'Aile üyeleri için doğru kelimeyi seçtin mi (kendi ailen için 父/母, başkasının ailesi için お父さん/お母さん)?',
        'Kişi sayarken 人 sayacını kullandın mı?',
        'Sıfatları doğru çektin mi?',
        'は ve が eklerini ayırt ettin mi?',
      ],
    },
    {
      title: 'Sevdiğin yer',
      prompt: 'Sevdiğin bir yeri betimle: nerede, nasıl, neden seviyorsun?',
      minWords: 40,
      rubric: [
        'あります / います ayrımını doğru yaptın mı?',
        'En az 4 sıfat kullandın mı?',
        'から ile sebep belirttin mi?',
        'Bir cümlede て formu ile iki fiil bağladın mı?',
      ],
    },
    {
      title: 'Gelecek planların',
      prompt: 'Önümüzdeki yıl ne yapmak istiyorsun? たい biçimini kullan.',
      minWords: 40,
      rubric: [
        'たいです yapısını doğru kurdun mu?',
        'Olumsuz istek (たくない) de kullandın mı?',
        'Zaman ifadeleriyle (来年, 来月) planını netleştirdin mi?',
        'Sebep açıkladın mı?',
      ],
    },
  ],
}

export default function WritingPage() {
  const l: Lang = 'ja'
  const [active, setActive] = useState<number | null>(null)
  const submissions = useSubmissions(30)
  const mine = submissions.filter((s) => s.lang === l && s.kind === 'writing')

  const prompts = PROMPTS[l]

  if (active !== null) {
    const p = prompts[active]
    const ex: Exercise = {
      id: `writing-${l}-${active}`,
      type: 'free-writing',
      prompt: p.prompt,
      lang: l,
      minWords: p.minWords,
      rubric: p.rubric,
      skill: 'writing',
    }
    return (
      <>
        <TopBar title={p.title} sub={LANG_TR} back="/"  right={<Badge tone={l}>{p.minWords}+</Badge>} />
        <div className={`page stack lang-${l}`}>
          <ExerciseView
            exercise={ex}
            onDone={() => {
              bumpStat({ minutes: 10, [l]: 1 })
              setActive(null)
            }}
          />
          <button className="btn btn--ghost btn--block" onClick={() => setActive(null)}>
            Konu listesine dön
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title={`Yazma · ${LANG_TR}`} sub={`${mine.length} kayıtlı metin`} back="/" />

      <div className={`page stack-lg lang-${l}`}>
        <div className="stack">
          <h2>Konular</h2>
          {prompts.map((p, i) => (
            <button key={i} className="card card--link" style={{ textAlign: 'left' }} onClick={() => setActive(i)}>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <div className="card-title">{p.title}</div>
                  <div className="card-sub">{p.prompt}</div>
                </div>
                <Badge tone={l}>{p.minWords}+</Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="stack">
          <div className="row">
            <h2>Yazdıkların</h2>
            <div className="spacer" />
            {mine.length > 0 && (
              <button
                className="btn btn--sm btn--ghost"
                onClick={async () => {
                  if (!confirm('Bu dildeki bütün yazma kayıtların silinsin mi?')) return
                  await db.submissions.bulkDelete(mine.map((m) => m.id!).filter(Boolean))
                }}
              >
                Temizle
              </button>
            )}
          </div>
          {mine.length === 0 ? (
            <Empty icon="pen" text="Henüz kayıtlı metnin yok. Bir konu seçip başla." />
          ) : (
            mine.map((s) => (
              <details key={s.id} className="card">
                <summary className="tap">
                  <span className="small bold">{new Date(s.at).toLocaleString('tr-TR')}</span>
                  <div className="tiny faint" style={{ marginTop: 3 }}>
                    {s.prompt.slice(0, 90)}
                    {s.prompt.length > 90 ? '…' : ''}
                  </div>
                </summary>
                <div
                  className={l === 'ja' ? 'ja-text' : 'small'}
                  style={{ whiteSpace: 'pre-wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}
                >
                  {s.content}
                </div>
              </details>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">Kendi kendini düzeltme yöntemi</div>
          <div className="stack-sm small dim" style={{ marginTop: 8 }}>
            <div>1. Yazdıktan sonra <span className="bold">en az bir gün bekle</span>, sonra tekrar oku. Hataların çoğunu kendin bulursun.</div>
            <div>2. Metnini sesli oku — kulağa yanlış gelen yer genelde gerçekten yanlıştır.</div>
            <div>3. Aynı hatayı iki kez yaptıysan o dilbilgisi konusunu tekrar aç.</div>
            <div>4. Eski metinlerini ayda bir karşılaştır; gelişimi ancak böyle görürsün.</div>
          </div>
        </div>
      </div>
    </>
  )
}
