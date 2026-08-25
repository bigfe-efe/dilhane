import { Link } from 'react-router-dom'
import { Badge, Bar, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { useCardStates, useLessonProgress } from '@/db/hooks'
import { GRAMMAR_JA } from '@/content/ja/grammar'
import { VOCAB_JA } from '@/content/ja/vocab'
import { KANJI_N5 } from '@/content/ja/kanji-n5'
import { HIRAGANA, KATAKANA } from '@/content/ja/kana'
import { LESSONS_JA } from '@/content/ja/lessons'

// N5 hazırlık sayfası.
//
// İki iş yapar:
//   1. Sınavın ne olduğunu anlatır — bölümler, süre, geçme ölçütü.
//   2. Uygulamadaki ilerlemeni sınavın gerektirdiği malzemeyle karşılaştırır,
//      böylece "hazır mıyım" sorusuna somut bir cevap verir.
//
// Sayılar canlı verilerden gelir; elle yazılmış hedef sayısı yoktur.

/** JLPT N5'in resmî yapısı. */
const SECTIONS = [
  {
    title: 'Dil bilgisi (yazı ve kelime)',
    ja: '言語知識（文字・語彙）',
    minutes: 20,
    what: 'Kanji okuma, kana yazımı, kelime seçimi, eş anlamlı bulma.',
    ready: 'kana' as const,
  },
  {
    title: 'Dil bilgisi (gramer) ve okuma',
    ja: '言語知識（文法）・読解',
    minutes: 40,
    what: 'Cümleye doğru eki/yapıyı seçme, cümle sıralama, kısa metin anlama.',
    ready: 'grammar' as const,
  },
  {
    title: 'Dinleme',
    ja: '聴解',
    minutes: 30,
    what: 'Kısa diyalogları anlama, doğru görseli/cevabı seçme.',
    ready: 'listen' as const,
  },
]

export default function N5Page() {
  const prog = useLessonProgress()
  const kana = useCardStates('kana')
  const kanji = useCardStates('kanji')
  const vocab = useCardStates('vocab')

  const knownKana = [...HIRAGANA, ...KATAKANA].filter((k) => kana.get(k.char)?.phase === 'review').length
  const totalKana = HIRAGANA.length + KATAKANA.length
  const knownKanji = KANJI_N5.filter((k) => kanji.get(k.char)?.phase === 'review').length
  const knownVocab = VOCAB_JA.filter((v) => vocab.get(v.id)?.phase === 'review').length
  const grammarCount = GRAMMAR_JA.filter((g) => g.level === 'N5').length
  const jaLessons = LESSONS_JA.length

  const bars = [
    { label: 'Kana', value: knownKana, max: totalKana, note: 'Hiragana + katakana, dakuten ve yōon dahil' },
    { label: 'Kanji', value: knownKanji, max: KANJI_N5.length, note: 'N5’te ~100 kanji beklenir' },
    { label: 'Kelime', value: knownVocab, max: VOCAB_JA.length, note: 'N5’te ~800 kelime beklenir; buradaki çekirdek kadro' },
    { label: 'Ders', value: prog.completed, max: prog.total, note: 'Tamamlanan ders sayısı' },
  ]

  const overall = Math.round(
    (bars.reduce((n, b) => n + (b.max ? b.value / b.max : 0), 0) / bars.length) * 100,
  )

  return (
    <>
      <TopBar title="N5 hazırlığı" sub="JLPT’nin ilk basamağı" back="/ja" />

      <div className="page stack-lg lang-ja">
        <div className="card card--pad-lg stack-sm">
          <div className="row">
            <div className="stack-sm" style={{ gap: 2, flex: 1 }}>
              <div className="card-title">Genel hazırlık</div>
              <div className="card-sub">Uygulamadaki malzemenin ne kadarını öğrendin</div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>%{overall}</div>
          </div>
          <Bar value={overall} />
          <div className="tiny faint">
            Bu oran sınav puanı tahmini değildir — uygulamadaki içeriğin ne kadarının SRS’te "öğrenildi" durumuna
            geçtiğini gösterir.
          </div>
        </div>

        <div className="stack">
          <h2>Nerede duruyorsun</h2>
          {bars.map((b) => (
            <div key={b.label} className="card stack-sm">
              <div className="row">
                <span className="card-title" style={{ flex: 1 }}>
                  {b.label}
                </span>
                <span className="small dim">
                  {b.value} / {b.max}
                </span>
              </div>
              <Bar value={b.max ? (b.value / b.max) * 100 : 0} />
              <div className="tiny faint">{b.note}</div>
            </div>
          ))}
        </div>

        <div className="stack">
          <h2>Sınav nasıl işliyor?</h2>
          <div className="card stack-sm">
            <div className="card-sub">
              JLPT (日本語能力試験) yılda iki kez, temmuz ve aralık aylarında yapılır. N5 en alt seviyedir:
              <b> temel Japoncayı anlayabilmek</b>. Konuşma ve yazma bölümü <b>yoktur</b> — sınav tamamen çoktan
              seçmelidir.
            </div>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title} className="card stack-sm">
              <div className="row">
                <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                  <div className="card-title">{s.title}</div>
                  <div className="tiny dim ja">{s.ja}</div>
                </div>
                <Badge tone="ja">{s.minutes} dk</Badge>
              </div>
              <div className="small">{s.what}</div>
            </div>
          ))}

          <div className="feedback feedback--info small">
            <b>Geçme ölçütü iki katmanlıdır:</b> hem toplam puanın barajı geçmeli, hem de <b>her bölümden ayrı ayrı</b>
            asgari puanı almalısın. Yani dinlemeyi tamamen boş bırakıp gramerden çok yüksek puan alarak geçemezsin —
            üç alanı da çalışmak zorundasın.
          </div>
        </div>

        <div className="stack">
          <h2>Uygulamadaki karşılığı</h2>

          <Link to="/lessons/ja" className="card card--link">
            <div className="row">
              <span className="entry-icon"><Icon name="book" size={18} /></span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Dersler · Genki sırası</div>
                <div className="card-sub">
                  {jaLessons} ders · Genki I’in 12 dersi + kana ve kanji üniteleri
                </div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/grammar/ja" className="card card--link">
            <div className="row">
              <span className="entry-icon"><Icon name="ruler" size={18} /></span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Dilbilgisi</div>
                <div className="card-sub">{grammarCount} N5 konusu, Genki ders numaralarıyla etiketli</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/kanji" className="card card--link">
            <div className="row">
              <span className="ja" style={{ fontSize: '1.3rem', width: 28, textAlign: 'center' }}>
                漢
              </span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Kanji</div>
                <div className="card-sub">{KANJI_N5.length} N5 kanjisi, çizgi sırasıyla</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>

          <Link to="/listen/ja" className="card card--link">
            <div className="row">
              <span className="entry-icon"><Icon name="headphones" size={18} /></span>
              <div className="stack-sm" style={{ gap: 1, flex: 1 }}>
                <div className="card-title">Dinleme</div>
                <div className="card-sub">Sınavın üçte biri dinleme — en çok ihmal edilen bölüm</div>
              </div>
              <span className="dim">›</span>
            </div>
          </Link>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Ne zaman hazır sayılırsın?</div>
          <ul className="tight small">
            <li>Kana’yı <b>düşünmeden</b> okuyabiliyorsan — hız testinde dakikada 40+.</li>
            <li>N5 kanjilerini kelime içinde tanıyorsan (tek başına ezberlemek yetmez).</li>
            <li>Genki 12’ye kadar olan yapıları cümle kurarken kullanabiliyorsan.</li>
            <li>Kısa bir diyalogu <b>metnine bakmadan</b> anlayabiliyorsan.</li>
          </ul>
          <div className="tiny faint">
            Uygulamadaki içerik N5’in çekirdeğini kapsar ama sınavın kelime hazinesi daha geniştir (~800 kelime).
            Sınava yaklaşırken çıkmış sorularla çalışmak şart.
          </div>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Genki ile birlikte çalışmak</div>
          <div className="card-sub">
            Buradaki dersler Genki (3. baskı) müfredat <b>sırasına</b> göre dizilmiştir. Kitabı da kullanıyorsan her
            dersin başlığında <span className="mono">Genki 5</span> gibi bir etiket görürsün — aynı konuyu kitaptan
            okuyup buradan alıştırma yapabilirsin.
          </div>
          <div className="tiny faint">
            Anlatımlar, örnek cümleler ve alıştırmalar bu uygulamaya özgüdür; kitaptan alıntı değildir. Kitabın kendi
            dinleme kayıtları yayıncının ücretsiz <span className="mono">OTO Navi</span> uygulamasından edinilebilir.
          </div>
        </div>
      </div>
    </>
  )
}
