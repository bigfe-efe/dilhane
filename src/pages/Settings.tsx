import { useEffect, useRef, useState } from 'react'
import type { Lang } from '@/types'
import { Badge, TopBar } from '@/components/ui'
import { LANG_TR } from '@/content'
import {
  approxEnabled,
  approxVoice,
  audioFileFor,
  getRate,
  getPreferredVoice,
  setApproxEnabled,
  setPreferredVoice,
  setRate,
  speak,
  voicesFor,
} from '@/lib/tts'
import { jaToTurkishSpeech } from '@/lib/ja-phonetic'
import { JA_FONT_TR, getJaFont, setJaFont, type JaFont } from '@/lib/ja-font'
import { sttAvailable } from '@/lib/stt'
import { db, exportAll, importAll, setSetting } from '@/db/db'
import { useExamDate } from '@/db/hooks'
import { EXAM_DATE_KEY, daysUntilExam } from '@/content/ja/study-plan'

const SAMPLE: Record<Lang, string> = {
  ja: 'こんにちは。日本語を勉強しています。',
}

/** Kanji içerdiği için yaklaşık okumaya kana okunuşunu ayrıca veriyoruz. */
const SAMPLE_READING = 'こんにちは。にほんごをべんきょうしています。'

/**
 * Japonca sesi yokken devreye giren "yaklaşık okuma" ayarı.
 * Kana → romaji → Türkçe yazım çevrimiyle, cihazdaki Türkçe sesle okutulur.
 */
function ApproxPanel({ onChange }: { onChange: () => void }) {
  const on = approxEnabled()
  const voice = approxVoice()

  return (
    <div className="card stack-sm" style={{ background: 'var(--bg-elev-2)' }}>
      <div className="row">
        <div className="card-title" style={{ flex: 1, fontSize: '0.95rem' }}>
          Yaklaşık okuma
        </div>
        <Badge tone={on && voice ? 'warn' : undefined}>{on && voice ? 'Açık' : 'Kapalı'}</Badge>
      </div>
      <div className="card-sub">
        Japonca ses kurulana kadar geçici çözüm: kana önce okunuşuna, sonra Türkçe yazıma çevrilir ve{' '}
        {voice ? <b>{voice.name}</b> : 'cihazdaki bir ses'} ile okunur. Türkçenin sesleri Japoncaya çok yakın olduğu için
        sonuç şaşırtıcı derecede anlaşılırdır — ama <b>gerçek Japonca telaffuz değildir</b>: vurgu ve ton düzdür.
      </div>
      <div className="row-wrap tiny dim" style={{ gap: 10 }}>
        <span className="ja">こんにちは</span>
        <span>→</span>
        <span className="mono">{jaToTurkishSpeech('こんにちは')}</span>
      </div>
      {!voice && (
        <div className="feedback feedback--bad tiny">Cihazda hiç konuşma sesi bulunamadı; bu seçenek çalışmaz.</div>
      )}
      <div className="row-wrap" style={{ gap: 8 }}>
        <button
          className="btn btn--sm"
          onClick={() => {
            setApproxEnabled(!on)
            onChange()
          }}
        >
          {on ? 'Kapat' : 'Aç'}
        </button>
        <button
          className="btn btn--sm btn--ghost"
          disabled={!on || !voice}
          onClick={() => speak(SAMPLE.ja, 'ja', { reading: SAMPLE_READING })}
        >
          Dene
        </button>
      </div>
    </div>
  )
}

/**
 * Japonca yazı tipi seçimi.
 *
 * Örnek harfler rastgele değil: き さ ふ り, baskı ile el yazısının EN ÇOK
 * ayrıldığı dörtlüdür. İki kutu yan yana durur ki fark anlatılmadan
 * görülsün — bu farkı kelimeyle tarif etmek, göstermekten çok daha zor.
 */
function JaFontPanel() {
  const [font, setFont] = useState<JaFont>(getJaFont)

  const sec = (f: JaFont) => {
    setFont(f)
    setJaFont(f)
  }

  return (
    <div className="card stack">
      <div>
        <div className="card-title">Japonca yazı tipi</div>
        <div className="card-sub">
          Bazı kanalar baskıda ve el yazısında farklı çizilir. İkisi de doğrudur — ama yazarken
          gördüğünün aynısını istiyorsan ders kitabı biçimini seç.
        </div>
      </div>

      <div className="fontpick">
        {(['kyokasho', 'gothic'] as JaFont[]).map((f) => (
          <button
            key={f}
            className={`card stack-sm${font === f ? ' is-on' : ''}`}
            onClick={() => sec(f)}
            aria-pressed={font === f}
          >
            <div className="row">
              <span className="card-title" style={{ flex: 1 }}>
                {JA_FONT_TR[f].ad}
              </span>
              {font === f && <Badge tone="ok">Seçili</Badge>}
            </div>
            <div className={`fontsample fontsample--${f}`}>きさふり</div>
            <div className="tiny dim">{JA_FONT_TR[f].alt}</div>
          </button>
        ))}
      </div>

      <div className="tiny faint">
        Kâğıda yazarken her zaman ders kitabı biçimini kullan. Baskı biçimini okumak ayrı bir
        beceri değil — zamanla kendiliğinden alışırsın.
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tick, setTick] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  // Sesler tarayıcıya gecikmeli gelir; bir kez yeniden çizmek yeterli
  useEffect(() => {
    const t = setTimeout(() => setTick((x) => x + 1), 600)
    return () => clearTimeout(t)
  }, [])

  const doExport = async () => {
    const json = await exportAll()
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `dilhane-yedek-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Yedek indirildi.')
  }

  const doImport = async (file: File) => {
    if (!confirm('Mevcut ilerlemenin üzerine yazılacak. Devam edilsin mi?')) return
    try {
      await importAll(await file.text())
      setMsg('Yedek geri yüklendi.')
    } catch {
      setMsg('Dosya okunamadı — geçerli bir Dilhane yedeği mi?')
    }
  }

  const wipe = async () => {
    if (!confirm('BÜTÜN ilerlemen silinecek. Bu geri alınamaz. Emin misin?')) return
    if (!confirm('Gerçekten emin misin? Önce yedek almak isteyebilirsin.')) return
    await Promise.all([
      db.cards.clear(),
      db.reviews.clear(),
      db.lessons.clear(),
      db.homework.clear(),
      db.submissions.clear(),
      db.stats.clear(),
      db.notes.clear(),
    ])
    setMsg('Bütün ilerleme silindi.')
  }

  return (
    <>
      <TopBar title="Ayarlar" back="/more" />

      <div className="page stack-lg" key={tick}>
        {msg && <div className="feedback feedback--ok">{msg}</div>}

        <ExamDatePanel />

        <JaFontPanel />

        {(['ja'] as Lang[]).map((l) => {
          const voices = voicesFor(l)
          const preferred = getPreferredVoice(l)
          const rate = getRate(l)
          const hasEmbedded = !!audioFileFor(l, SAMPLE[l])

          return (
            <div key={l} className={`card stack lang-${l}`}>
              <div className="row">
                <div className="card-title" style={{ flex: 1 }}>
                  {LANG_TR} sesi
                </div>
                <Badge tone={voices.length ? 'ok' : 'bad'}>{voices.length} ses</Badge>
              </div>

              {hasEmbedded && (
                <div className="feedback feedback--ok tiny">
                  Bu dil için uygulamaya gömülü ses dosyaları bulundu — cihaz sesine ihtiyaç yok.
                </div>
              )}

              {voices.length === 0 ? (
                <div className="stack-sm">
                  <div className="feedback feedback--bad small">
                    Cihazında {LANG_TR} konuşma sesi kurulu değil — bu yüzden{' '}
                    <b>Japonca metinler hiç seslenmez</b>. Tarayıcı hata da vermez, sadece sessiz kalır.
                    {(
                      <div style={{ marginTop: 8 }}>
                        <b>Çözüm (Windows 11):</b>
                        <ol className="tight" style={{ marginTop: 4 }}>
                          <li>Başlat → Ayarlar → Saat ve dil → Dil ve bölge</li>
                          <li>
                            <b>Dil ekle</b> → 日本語 (Japanese) seç
                          </li>
                          <li>
                            Kurulum seçeneklerinde <b>"Metin okuma" / "Konuşma"</b> kutusunu işaretle
                          </li>
                          <li>Kurulum bitince tarayıcıyı tamamen kapatıp yeniden aç</li>
                        </ol>
                      </div>
                    )}
                    <div style={{ marginTop: 6 }}>
                      Alternatif: <span className="mono">npm run gen:audio</span> ile ElevenLabs seslerini bir kez üretip
                      uygulamaya göm. Sonrasında tamamen çevrimdışı çalışır.
                    </div>
                  </div>
                  <ApproxPanel onChange={() => setTick((x) => x + 1)} />
                </div>
              ) : (
                <select
                  className="field"
                  value={preferred ?? ''}
                  onChange={(e) => {
                    setPreferredVoice(l, e.target.value)
                    setTick((x) => x + 1)
                  }}
                >
                  <option value="">Otomatik seç</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} {v.localService ? '(cihazda)' : '(çevrimiçi)'}
                    </option>
                  ))}
                </select>
              )}

              <div className="stack-sm">
                <div className="row tiny dim">
                  <span>Konuşma hızı</span>
                  <div className="spacer" />
                  <span>{rate.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.3}
                  step={0.05}
                  defaultValue={rate}
                  onChange={(e) => setRate(l, Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--lang)' }}
                />
              </div>

              <button
                className="btn btn--sm"
                onClick={() => speak(SAMPLE[l], l, { reading: SAMPLE_READING })}
              >
                Örnek dinle
              </button>
            </div>
          )
        })}

        <div className="card stack-sm">
          <div className="card-title">Mikrofon ve telaffuz puanlama</div>
          <div className="card-sub">
            {sttAvailable()
              ? 'Bu tarayıcı konuşma tanımayı destekliyor. Puanlama için internet bağlantısı gerekir; bağlantı yokken kayıt moduna düşer.'
              : 'Bu tarayıcı konuşma tanımayı desteklemiyor. Chrome veya Edge kullanırsan telaffuz puanı alabilirsin.'}
          </div>
          <Badge tone={sttAvailable() ? 'ok' : 'warn'}>{sttAvailable() ? 'Destekleniyor' : 'Desteklenmiyor'}</Badge>
        </div>

        <div className="card stack-sm">
          <div className="card-title">Veri ve yedekleme</div>
          <div className="card-sub">
            Bütün ilerlemen yalnızca bu cihazda saklanır; hiçbir yere gönderilmez. Cihaz değiştirmeden veya tarayıcı
            verilerini temizlemeden önce yedek al.
          </div>
          <div className="row-wrap" style={{ marginTop: 8 }}>
            <button className="btn btn--sm" onClick={doExport}>
              Yedek al
            </button>
            <button className="btn btn--sm" onClick={() => fileRef.current?.click()}>
              Yedeği geri yükle
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) doImport(f)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="card stack-sm" style={{ borderColor: 'var(--bad)' }}>
          <div className="card-title" style={{ color: 'var(--bad)' }}>
            Tehlikeli bölge
          </div>
          <div className="card-sub">İlerlemeni sıfırlar. Dersler ve içerik silinmez, sadece senin verilerin gider.</div>
          <button className="btn btn--sm btn--bad" onClick={wipe} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
            Bütün ilerlemeyi sil
          </button>
        </div>

        <div className="card">
          <div className="card-title">Dilhane</div>
          <div className="card-sub">
            Kişisel kullanım için yapılmış çevrimdışı dil öğrenme uygulaması. Veriler cihazında, içerik uygulamanın
            içinde. Yeni ders eklemek için <span className="mono">src/content/</span> klasöründeki dosyaları
            düzenleyebilirsin.
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Sınav tarihi ayarı.
 *
 * NEDEN AYARDA: tarih koda gömülüyken sınav ertelendiğinde uygulama ölü bir
 * güne geri sayıyor ve o güne göre "haftada şu kadar ders" diye tempo
 * dayatıyordu. Artık boş bırakılabiliyor; boşken geri sayım yerine ilerleme
 * gösteriliyor. Tarih girilince eski davranışın tamamı geri gelir.
 */
function ExamDatePanel() {
  const examDate = useExamDate()
  const [msg, setMsg] = useState('')

  const iso = examDate
    ? `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, '0')}-${String(
        examDate.getDate(),
      ).padStart(2, '0')}`
    : ''

  const kaydet = async (v: string) => {
    await setSetting(EXAM_DATE_KEY, v || null)
    setMsg(v ? 'Tarih kaydedildi — geri sayım ve tempo hesabı açıldı.' : 'Tarih silindi.')
  }

  const kalan = daysUntilExam(examDate)

  return (
    <div className="card stack-sm">
      <div className="row">
        <div className="card-title" style={{ flex: 1 }}>
          Sınav tarihi
        </div>
        {kalan !== null && kalan >= 0 && (
          <Badge tone="accent">{kalan} gün</Badge>
        )}
      </div>

      <div className="card-sub">
        Bir tarih girersen ana sayfa geri sayıma geçer ve haftalık ders temposunu buna göre hesaplar.
        Boş bırakırsan tempo yerine ilerleme gösterilir — sınav tarihi yokken “geride kaldın”
        diyebilmek için bir ölçü yok.
      </div>

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <input
          type="date"
          className="romaji-live-input"
          value={iso}
          onChange={(e) => void kaydet(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
        {iso && (
          <button className="btn btn--sm btn--ghost" onClick={() => void kaydet('')}>
            Temizle
          </button>
        )}
      </div>

      {msg && <div className="tiny" style={{ color: 'var(--ok)' }}>{msg}</div>}
    </div>
  )
}
