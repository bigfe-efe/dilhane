import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toKana, toKatakana } from 'wanakana'
import { TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { IME_SETUP, SYSTEMS, TR_TRAPS, TYPE_RULES } from '@/content/ja/romaji'
import { drillPool, type DrillWord } from '@/content/ja/kana-drills'
import { shuffle } from '@/lib/shuffle'

// Romaji sayfası — hem başvuru hem alıştırma.
//
// NEDEN İKİSİ BİR ARADA:
// Klavye kuralları okunarak öğrenilmiyor; "ん'den sonra iki n yaz" cümlesini
// okuyup geçen biri ertesi gün yine tek n yazıyor. Kuralların hemen altında
// canlı bir yazım kutusu var: yazdığın romaji anında kanaya dönüşüyor, yani
// kuralı okumakla denemek arasında tek bir kaydırma var.
//
// Canlı önizleme bilerek IME'nin kendisiyle aynı çeviriciyi kullanıyor
// (wanakana). Böylece burada işe yarayan yazım, Windows'ta da işe yarıyor —
// "uygulamada oluyor ama gerçekte olmuyor" durumu çıkmıyor.

export default function RomajiPage() {
  return (
    <>
      <TopBar title="Romaji" sub="Latin harfleriyle Japonca" back="/calis" />

      <div className="page stack-lg lang-ja">
        <div className="card card--accent stack-sm">
          <div className="card-title">Romaji dördüncü bir alfabe değil</div>
          <div className="card-sub">
            Zaten bildiğin Latin alfabesinin Japonca seslere uygulanmış hâli. Uygulamada gördüğün
            <span className="mono"> oboeru</span>, <span className="mono">koohii</span> romajidir. Yani
            öğrenilecek bir şey yok; öğrenilecek olan NEREDE kullanılacağı.
          </div>
        </div>

        {/* ————— En önemli uyarı, en üstte ————— */}
        <div className="stack-sm">
          <h2>Önce uyarı: romaji hece uzunluğunu siler</h2>
          <div className="card stack-sm">
            <div className="card-sub">
              Bu, tam da zorlandığın yere denk geliyor. Kana her morayı bir kutuda gösterir; romaji
              göstermez.
            </div>

            <div className="romaji-compare">
              <div className="romaji-cmp">
                <span className="ja romaji-cmp-kana">とうきょう</span>
                <span className="romaji-cmp-mora">4 mora</span>
                <span className="romaji-cmp-arrow">→</span>
                <span className="mono romaji-cmp-r">Tokyo</span>
                <span className="romaji-cmp-warn">2 hece gibi duruyor</span>
              </div>
              <div className="romaji-cmp">
                <span className="ja romaji-cmp-kana">おばさん</span>
                <span className="romaji-cmp-mora">4 mora · teyze</span>
                <span className="romaji-cmp-arrow">→</span>
                <span className="mono romaji-cmp-r">obasan</span>
                <span className="romaji-cmp-warn">—</span>
              </div>
              <div className="romaji-cmp">
                <span className="ja romaji-cmp-kana">おばあさん</span>
                <span className="romaji-cmp-mora">5 mora · nine</span>
                <span className="romaji-cmp-arrow">→</span>
                <span className="mono romaji-cmp-r">obāsan</span>
                <span className="romaji-cmp-warn">tek çizgi farkı, çoğu yerde hiç yazılmaz</span>
              </div>
            </div>

            <div className="tiny vocab-note vocab-note--warn">
              Sonuç: Japonca metni romaji ile OKUMA. Kana ile kazandığın hece duyusunu bozar. Romaji
              yazmak için, okumak için değil.
            </div>
          </div>
        </div>

        {/* ————— Klavye ————— */}
        <div className="stack-sm">
          <h2>Klavyede Japonca yazmak</h2>
          <div className="card-sub" style={{ marginTop: -2 }}>
            Bilgisayarda Japonca yazmanın yolu romajiden geçer: <span className="mono">nihongo</span>{' '}
            yazarsın, にほんご olur, boşluğa basınca 日本語 önerilir. Kuralları Hepburn ile aynı
            değildir.
          </div>

          <div className="cols-2">
            {TYPE_RULES.map((r) => (
              <div key={r.id} className="card stack-sm">
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  {r.title}
                </div>
                <div className="card-sub">{r.rule}</div>
                <div className="romaji-ex">
                  {r.examples.map((e, i) => (
                    <div key={i} className="romaji-ex-row">
                      <span className="mono romaji-ex-type">{e.type}</span>
                      <Icon name="right" size={12} />
                      <span className="ja romaji-ex-kana">{e.kana}</span>
                      {e.tr && <span className="romaji-ex-tr">{e.tr}</span>}
                    </div>
                  ))}
                </div>
                {r.pitfall && <div className="tiny vocab-note vocab-note--warn">{r.pitfall}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ————— Canlı deneme ————— */}
        <LiveTyping />

        {/* ————— Sistemler ————— */}
        <div className="stack-sm">
          <h2>Üç ayrı romaji var</h2>
          <div className="card-sub" style={{ marginTop: -2 }}>
            Japon çocukları okulda <b>Kunrei</b> öğrenir; tabelalarda, pasaportlarda ve yabancılara
            yönelik her şeyde <b>Hepburn</b> kullanılır. İyi haber: klavye ikisini de kabul eder,
            <span className="mono"> si</span> de <span className="mono">shi</span> de し verir. Sınavda
            ise romaji hiç çıkmaz.
          </div>
          <div className="romaji-table-wrap">
            <table className="romaji-table">
              <thead>
                <tr>
                  <th>kana</th>
                  <th>Hepburn</th>
                  <th>Kunrei</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEMS.map((s) => (
                  <tr key={s.kana}>
                    <td className="ja romaji-table-kana">{s.kana}</td>
                    <td className="mono">{s.hepburn}</td>
                    <td className="mono">{s.kunrei}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tiny faint">
            Yalnızca ayrıştıkları satırlar var — か her sistemde <span className="mono">ka</span>.
          </div>
        </div>

        {/* ————— Türkçe tuzakları ————— */}
        <div className="stack-sm">
          <h2>Türkçe okuyanın tuzakları</h2>
          <div className="card-sub" style={{ marginTop: -2 }}>
            Romaji İngilizceye göre kurulmuş. Bazıları şans eseri tutuyor, bazıları tutmuyor.
          </div>
          <div className="cols-2">
            {TR_TRAPS.map((t) => (
              <div key={t.romaji} className="card romaji-trap">
                <span className="ja romaji-trap-kana">{t.kana}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono romaji-trap-r">{t.romaji}</div>
                  <div className="tiny">
                    <span style={{ color: 'var(--bad)' }}>{t.yanlis}</span>
                    <span className="faint"> değil → </span>
                    <span style={{ color: 'var(--ok)' }}>{t.dogru}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ————— Kurulum ————— */}
        <div className="stack-sm">
          <h2>Windows’ta Japonca klavye</h2>
          <div className="card stack-sm">
            <ol className="romaji-steps">
              {IME_SETUP.map((s, i) => (
                <li key={i}>
                  <div className="romaji-step-title">{s.step}</div>
                  <div className="card-sub">{s.detail}</div>
                </li>
              ))}
            </ol>
            <div className="tiny vocab-note">
              Konuşma bileşeni inerse uygulamadaki ses de düzelir: şu an Japonca ses bulunamadığı için
              Türkçe yaklaşık okumaya (≈) düşülüyor. Gerçek ses gelince bu kendiliğinden devreye girer.
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <Link to="/hece-sayma" className="btn btn--ghost">
            Hece sayma alıştırması
          </Link>
          <Link to="/kelime-yazma" className="btn btn--ghost">
            Kelime yazma
          </Link>
        </div>
      </div>
    </>
  )
}

/**
 * Canlı yazım denemesi.
 *
 * Doğruluk denetimi kana düzeyinde yapılıyor, romaji düzeyinde değil. Sebebi:
 * aynı kanaya götüren birden çok yazım var (shi/si, ja/zya) ve hepsini elle
 * saymak yerine ikisini de kanaya çevirip karşılaştırmak hem kısa hem eksiksiz.
 *
 * Katakana hedeflerde çıktı katakanaya çevriliyor, girdi değil. Önce girdiyi
 * büyük harfe çevirip deniyordum (wanakana'da büyük harf katakana üretir) ama
 * bu yanlış bir şey öğretirdi: gerçek IME'de katakana BÜYÜK HARFLE değil, F7
 * ile yazılır. Şimdi küçük harf de büyük harf de kabul ediliyor.
 */
function LiveTyping() {
  const havuz = useMemo(() => drillPool('karisik').filter((w) => w.mora >= 3), [])
  const [kelimeler, setKelimeler] = useState<DrillWord[]>(() => shuffle(havuz).slice(0, 8))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')

  const w = kelimeler[idx]
  const katakana = w?.type === 'katakana'
  const kana = toKana(input)
  const cikti = katakana ? toKatakana(kana) : kana
  const dogru = !!w && cikti === w.kana

  const sonraki = () => {
    setInput('')
    if (idx + 1 < kelimeler.length) setIdx(idx + 1)
    else {
      setKelimeler(shuffle(havuz).slice(0, 8))
      setIdx(0)
    }
  }

  if (!w) return null

  return (
    <div className="stack-sm">
      <h2>Dene</h2>
      <div className="card stack-sm">
        <div className="card-sub">
          Aşağıdaki kelimeyi klavyede nasıl yazarsın? Yazdıkça kanaya dönüşüyor — burada işe yarayan
          yazım Windows’ta da işe yarar, ikisi aynı çeviriciyi kullanıyor.
        </div>

        <div className="romaji-live">
          <div className="romaji-live-target">
            <span className="ja romaji-live-kana">{w.kana}</span>
            <span className="tiny faint">
              {w.tr} · {w.mora} hece{katakana && ' · gerçek klavyede F7 katakanaya çevirir'}
            </span>
          </div>

          <input
            className={'romaji-live-input' + (dogru ? ' is-ok' : '')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="romaji yaz…"
            spellCheck={false}
            autoComplete="off"
          />

          <div className={'romaji-live-out' + (dogru ? ' is-ok' : input ? ' is-typing' : '')}>
            <span className="ja">{cikti || '…'}</span>
            {dogru && <span className="romaji-live-tick">doğru</span>}
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn--sm" onClick={sonraki}>
            {dogru ? 'Sonraki' : 'Atla'}
            <Icon name="right" size={14} />
          </button>
          {!dogru && input.length > 2 && (
            <button className="btn btn--sm btn--ghost" onClick={() => setInput('')}>
              Temizle
            </button>
          )}
          <div className="spacer" />
          <span className="tiny faint tabular">
            {idx + 1} / {kelimeler.length}
          </span>
        </div>
      </div>
    </div>
  )
}
