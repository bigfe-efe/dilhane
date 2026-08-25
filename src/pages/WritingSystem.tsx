import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Chips, SpeakBtn, TopBar } from '@/components/ui'
import { StrokeOrder } from '@/components/StrokeOrder'
import {
  DIRECTIONS,
  MIXED_SAMPLE,
  QUIRKS,
  ROADMAP,
  SCRIPTS,
  SCRIPT_TR,
  SECOND_SAMPLE,
  STROKE_RULES,
  type SampleSentence,
  type ScriptId,
} from '@/content/ja/writing-system'

// Harfleri öğrenmeden ÖNCE okunacak tanıtım sayfası.
// Japonca metnin nasıl göründüğünü, neden üç yazının bir arada durduğunu ve
// dikey yazının nasıl işlediğini gösterir.

type Tab = 'genel' | 'yon' | 'tuhaf' | 'cizgi'

const TABS: { id: Tab; label: string }[] = [
  { id: 'genel', label: 'Üç alfabe' },
  { id: 'yon', label: 'Yazı yönü' },
  { id: 'tuhaf', label: 'Şaşırtanlar' },
  { id: 'cizgi', label: 'Çizgi sırası' },
]

export default function WritingSystemPage() {
  const [tab, setTab] = useState<Tab>('genel')

  return (
    <>
      <TopBar title="Japon yazı sistemi" sub="Başlamadan önce: ne göreceksin?" back="/ja" />

      <div className="page stack-lg lang-ja">
        <Chips items={TABS} value={tab} onChange={setTab} />

        {tab === 'genel' && <Overview />}
        {tab === 'yon' && <Direction />}
        {tab === 'tuhaf' && <Quirks />}
        {tab === 'cizgi' && <Strokes />}
      </div>
    </>
  )
}

// ————————————————————————— Üç alfabe —————————————————————————

function Overview() {
  return (
    <>
      <div className="card stack-sm">
        <div className="card-title">Japonca aynı anda üç yazı kullanır</div>
        <div className="card-sub">
          Türkçede tek alfabe vardır ve her şey onunla yazılır. Japoncada ise <b>hiragana</b>, <b>katakana</b> ve{' '}
          <b>kanji</b> aynı cümlenin içinde iç içe geçer — hangisinin nerede kullanıldığının net bir mantığı vardır.
          Aşağıdaki cümlede renkleri takip et.
        </div>
      </div>

      <SentenceBreakdown s={MIXED_SAMPLE} />
      <SentenceBreakdown s={SECOND_SAMPLE} />

      <div className="stack">
        <h2>Yazılar tek tek</h2>
        {SCRIPTS.map((sc) => (
          <div key={sc.id} className={`card stack-sm script-card script-card--${sc.id}`}>
            <div className="row">
              <div className="stack-sm" style={{ gap: 0, flex: 1 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="card-title">{sc.title}</span>
                  <span className="ja dim">{sc.native}</span>
                </div>
                <div className="tiny faint">{sc.count}</div>
              </div>
              <span className={`script-dot script-dot--${sc.id}`} />
            </div>

            <div className="row-wrap ja" style={{ fontSize: '2rem', gap: 14, margin: '2px 0 4px' }}>
              {sc.samples.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <div className="small">{sc.what}</div>

            <div className="stack-sm" style={{ marginTop: 4 }}>
              <div className="tiny bold dim">Nerede kullanılır</div>
              <ul className="tight small">
                {sc.used.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>

            <div className="feedback feedback--info tiny">
              <b>Nasıl ayırt edilir: </b>
              {sc.look}
            </div>

            <div className="small dim">{sc.compare}</div>

            {sc.id === 'hiragana' && (
              <Link to="/kana/hiragana" className="btn btn--sm btn--lang" style={{ alignSelf: 'flex-start' }}>
                Hiragana tablosunu aç
              </Link>
            )}
            {sc.id === 'katakana' && (
              <Link to="/kana/katakana" className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
                Katakana tablosunu aç
              </Link>
            )}
            {sc.id === 'kanji' && (
              <Link to="/kanji" className="btn btn--sm btn--ghost" style={{ alignSelf: 'flex-start' }}>
                Kanji listesini aç
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="card stack-sm">
        <div className="card-title">Hangi sırayla öğrenilir?</div>
        {ROADMAP.map((r) => (
          <div key={r.step} className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
            <span className="bold" style={{ color: 'var(--lang)', minWidth: 92 }}>
              {r.step}
            </span>
            <span className="small dim" style={{ flex: 1 }}>
              {r.detail}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function SentenceBreakdown({ s }: { s: SampleSentence }) {
  const [picked, setPicked] = useState<number | null>(null)
  const used = [...new Set(s.segments.map((g) => g.script))]

  return (
    <div className="card stack-sm">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="ja mixed-sentence" style={{ flex: 1 }}>
          {s.segments.map((g, i) => (
            <button
              key={i}
              className={`seg seg--${g.script}${picked === i ? ' is-picked' : ''}`}
              onClick={() => setPicked(picked === i ? null : i)}
            >
              {g.text}
            </button>
          ))}
        </div>
        <SpeakBtn text={s.reading} lang="ja" reading={s.reading} />
      </div>

      <div className="tiny dim ja">{s.reading}</div>
      <div className="tiny faint mono">{s.romaji}</div>
      <div className="small">{s.tr}</div>

      {picked !== null && (
        <div className="feedback feedback--info small">
          <span className={`script-dot script-dot--${s.segments[picked].script}`} />{' '}
          <b className="ja">{s.segments[picked].text}</b> — {SCRIPT_TR[s.segments[picked].script]}
          {s.segments[picked].note ? ` · ${s.segments[picked].note}` : ''}
        </div>
      )}

      <div className="row-wrap tiny" style={{ gap: 10, marginTop: 2 }}>
        {used.map((k) => (
          <span key={k} className="row" style={{ gap: 5, width: 'auto' }}>
            <span className={`script-dot script-dot--${k}`} />
            <span className="dim">{SCRIPT_TR[k as ScriptId]}</span>
          </span>
        ))}
        <div className="spacer" />
        <span className="faint">parçalara dokun</span>
      </div>
    </div>
  )
}

// ————————————————————————— Yazı yönü —————————————————————————

function Direction() {
  return (
    <>
      <div className="card stack-sm">
        <div className="card-title">Japonca iki yönde birden yazılır</div>
        <div className="card-sub">
          Aynı metin hem yatay hem dikey yazılabilir; anlam değişmez, sadece yerleşim değişir. Hangisini göreceğin
          <b> nerede okuduğuna</b> bağlıdır. Bir mangayı açtığında sayfaların sondan başladığını sanman bundandır —
          aslında kitap sağdan sola akıyordur.
        </div>
      </div>

      {DIRECTIONS.map((d) => (
        <div key={d.id} className="card stack-sm">
          <div className="row">
            <div className="card-title" style={{ flex: 1 }}>
              {d.title}
            </div>
            <Badge tone="ja">{d.native}</Badge>
          </div>
          <div className="small">{d.flow}</div>

          {d.id === 'yokogaki' ? (
            <div className="dir-demo">
              <div className="ja dir-h">
                <span>私は日本語を</span>
                <span>勉強しています。</span>
              </div>
              <div className="dir-arrow dir-arrow--h">→ oku</div>
            </div>
          ) : (
            <div className="dir-demo">
              <div className="ja dir-v">私は日本語を勉強しています。犬が好きです。</div>
              <div className="dir-arrow dir-arrow--v">↓ oku · sütunlar sağdan sola ←</div>
            </div>
          )}

          <div className="stack-sm" style={{ marginTop: 2 }}>
            <div className="tiny bold dim">Nerede karşına çıkar</div>
            <ul className="tight small">
              {d.where.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <div className="card stack-sm">
        <div className="card-title">Dikey yazıda değişenler</div>
        <ul className="tight small">
          <li>
            Uzun ünlü çizgisi döner: yatayda <span className="ja">ー</span>, dikeyde aynı çizgi dikey durur (
            <span className="ja">コーヒー</span>).
          </li>
          <li>
            Küçük kana (<span className="ja">っ ゃ</span>) karenin sol üstünde değil, <b>sağ üstünde</b> durur.
          </li>
          <li>Rakamlar genelde kanji ile yazılır: 9 yerine 九.</li>
          <li>Furigana kanjinin üstünde değil, sağında yer alır.</li>
          <li>Nokta ve virgül karenin sağ üst köşesine oturur.</li>
        </ul>
      </div>

      <div className="card stack-sm">
        <div className="card-title">Kare kutu düzeni · 原稿用紙</div>
        <div className="card-sub">
          Her karakter — kanji, kana, hatta nokta — <b>aynı büyüklükte bir kareye</b> yazılır. Latin harflerindeki gibi
          dar "i", geniş "m" yoktur. Bu yüzden Japonca defterler kareli olur ve yazı hep hizalı durur.
        </div>
        <div className="genko">
          {['日', '本', '語', 'を', '勉', '強', 'し', 'ま', 'す', '。'].map((c, i) => (
            <span key={i} className="ja genko-cell">
              {c}
            </span>
          ))}
        </div>
        <div className="tiny faint">
          Kana kanjiden küçük görünse de kutusu aynıdır; karakter kutunun ortasına, dengeli biçimde yerleştirilir.
        </div>
      </div>
    </>
  )
}

// ————————————————————————— Şaşırtanlar —————————————————————————

function Quirks() {
  return (
    <>
      <div className="card stack-sm">
        <div className="card-title">Metinde ilk bakışta tuhaf gelenler</div>
        <div className="card-sub">
          Bunları önceden bilmek, ilk kez gördüğünde "yanlış mı yazılmış?" diye düşünmeni engeller.
        </div>
      </div>

      {QUIRKS.map((q) => (
        <div key={q.title} className="card stack-sm">
          <div className="card-title">{q.title}</div>
          {q.demo && (
            <div className="row" style={{ justifyContent: 'center' }}>
              <div className="ja quirk-demo">{q.demo}</div>
            </div>
          )}
          <div className="small">{q.body}</div>
          {q.tip && (
            <div className="feedback feedback--info tiny">
              <b>İpucu: </b>
              {q.tip}
            </div>
          )}
        </div>
      ))}

      <div className="card stack-sm">
        <div className="card-title">Bilgisayarda Japonca nasıl yazılır?</div>
        <div className="card-sub">
          Japon klavyesi diye bir şeye gerek yok. IME (giriş yöntemi) kurunca <span className="mono">nihongo</span>{' '}
          yazarsın, ekranda <span className="ja">にほんご</span> belirir; boşluğa basınca{' '}
          <span className="ja">日本語</span> önerilir. Yani romaji yazıp kana/kanji elde edersin.
        </div>
        <div className="tiny faint">
          Windows: Ayarlar → Saat ve dil → Dil ve bölge → Dil ekle → 日本語. Aynı kurulum Japonca konuşma sesini de
          getirir; bu uygulamadaki seslendirme de o zaman gerçek Japonca olur.
        </div>
      </div>
    </>
  )
}

// ————————————————————————— Çizgi sırası —————————————————————————

function Strokes() {
  return (
    <>
      <div className="card stack-sm">
        <div className="card-title">Çizgi sırası neden önemli?</div>
        <div className="card-sub">
          Japoncada her karakterin çizgileri <b>belli bir sırayla ve belli bir yönde</b> yazılır. Kağıt üstünde sonuç
          benzer görünse de sıra şunları belirler: yazının hızı, dengesi, el yazısında karakterin tanınabilirliği ve
          sözlükte arama. Baştan doğru öğrenmek, sonradan düzeltmekten çok daha kolaydır.
        </div>
      </div>

      <div className="card stack-sm">
        <div className="card-title">Altı temel kural</div>
        <div className="card-sub">Neredeyse bütün kana ve kanji bu kurallara uyar.</div>
        {STROKE_RULES.map((r) => (
          <div key={r.rule} className="row" style={{ alignItems: 'flex-start', gap: 12, paddingTop: 8 }}>
            {r.demo && (
              <span className="ja" style={{ fontSize: '2.1rem', lineHeight: 1, width: 42, textAlign: 'center' }}>
                {r.demo}
              </span>
            )}
            <div className="stack-sm" style={{ gap: 2, flex: 1 }}>
              <div className="bold small">{r.rule}</div>
              <div className="tiny dim">{r.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card stack-sm">
        <div className="card-title">Canlı örnek</div>
        <div className="card-sub">
          Aşağıda 三 (üç) karakterinin çizimi var: üstten alta. Aynı gösterimi her hiragana ve kanjinin kendi sayfasında
          bulacaksın.
        </div>
        <StrokeOrder char="三" />
      </div>

      <div className="card stack-sm">
        <div className="card-title">Yazarken üç şeye dikkat et</div>
        <ul className="tight small">
          <li>
            <b>Çizgi bitişleri:</b> bir çizgi ya sert durur (とめ tome), ya kalem kaldırılarak süzülür (はらい harai), ya
            da ucu yukarı kıvrılır (はね hane). Bu farklar karakterin kimliğidir.
          </li>
          <li>
            <b>Denge:</b> karakter hayalî bir karenin ortasına oturur; parçalar kareyi taşırmaz.
          </li>
          <li>
            <b>Oran:</b> soldaki parça genelde daha dar, sağdaki daha geniştir. Kana da aynı kareye sığar.
          </li>
        </ul>
        <Link to="/write" className="btn btn--sm btn--lang" style={{ alignSelf: 'flex-start' }}>
          Yazı çalışmaya git
        </Link>
      </div>

      <div className="tiny faint center">
        Çizgi verisi: KanjiVG (CC BY-SA 3.0) · kanjivg.tagaini.net
      </div>
    </>
  )
}
