import { useMemo, useState } from 'react'
import { toRomaji } from 'wanakana'
import { SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { jaToTurkishSpeech } from '@/lib/ja-phonetic'
import {
  ALL_VOCAB,
  POS_TR,
  VOCAB_THEMES,
  type Pos,
  type VocabWord,
} from '@/content/ja/kana-vocab'

// Sadece hiragana ile yazılan kelimelerin sözlüğü.
//
// NEDEN TEST DEĞİL: alıştırma sayfaları zaten var (/kana-kelime, /kana-test).
// Burada amaç sorgulamak değil OKUMAK — oturup göz gezdirilecek, aranacak,
// "bu neydi" diye dönülecek bir liste. Test hâline getirilirse bu iş görmez;
// insan sınav olacağını bilirse listeyi taramaz.
//
// Kelimeye özgü bir dilbilgisi varsa (fiil grubu, hangi eki aldığı, sayaç neyi
// sayar, hangi sıfat tipi) kelimenin ALTINDA duruyor. Ayrı bir dilbilgisi
// sayfasına bakmak zorunda kalmamak için: 「かえる」ı görünce "godan" bilgisini
// aynı anda görmek, sonradan öğrenmekten kalıcıdır.

type Filter = 'hepsi' | Pos

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'hepsi', label: 'Hepsi' },
  { id: 'fiil', label: 'Fiiller' },
  { id: 'i-sıfat', label: 'い-sıfat' },
  { id: 'na-sıfat', label: 'な-sıfat' },
  { id: 'isim', label: 'İsim' },
  { id: 'zarf', label: 'Zarf' },
  { id: 'edat', label: 'Edat' },
  { id: 'ifade', label: 'Kalıp' },
]

export default function VocabPage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('hepsi')
  const [onlyGram, setOnlyGram] = useState(false)

  // Arama hem kana, hem romaji, hem Türkçe karşılık üzerinden çalışır.
  // Sadece kana'da aramak işe yaramıyor: klavyeden hiragana yazmak zor, insan
  // "kedi" ya da "neko" yazmak ister.
  const terim = q.trim().toLocaleLowerCase('tr')

  const bolumler = useMemo(() => {
    return VOCAB_THEMES.map((t) => ({
      ...t,
      words: t.words.filter((w) => {
        if (filter !== 'hepsi' && w.pos !== filter) return false
        if (onlyGram && !w.gram) return false
        if (!terim) return true
        return (
          w.kana.includes(terim) ||
          w.tr.toLocaleLowerCase('tr').includes(terim) ||
          toRomaji(w.kana).includes(terim) ||
          jaToTurkishSpeech(w.kana).toLocaleLowerCase('tr').includes(terim) ||
          (w.kanji ?? '').includes(terim)
        )
      }),
    })).filter((t) => t.words.length > 0)
  }, [terim, filter, onlyGram])

  const bulunan = bolumler.reduce((n, t) => n + t.words.length, 0)
  const notluSayisi = ALL_VOCAB.filter((w) => w.gram).length

  return (
    <>
      <TopBar title="Kelimeler" sub="Tamamen hiragana yazılanlar" back />

      <div className="page stack-lg lang-ja">
        <div className="card stack-sm">
          <div className="card-title">Bu listedeki her kelime kanjisiz okunur</div>
          <div className="card-sub">
            {ALL_VOCAB.length} kelime, {VOCAB_THEMES.length} tema. Bunların {notluSayisi} tanesinin
            kendine özgü bir dilbilgisi var — fiilin grubu, sıfatın tipi, aldığı ek — ve kelimenin
            altında yazıyor. Kanjili yazım varsa sağda bilgi olarak duruyor; şimdi ezberlemen
            gerekmiyor, sonradan gördüğünde tanıyasın diye.
          </div>
        </div>

        <div className="vocab-tools stack-sm">
          <label className="vocab-search">
            <Icon name="search" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: kedi, neko, ねこ, 猫"
              spellCheck={false}
            />
            {q && (
              <button className="vocab-clear" onClick={() => setQ('')} aria-label="Aramayı temizle">
                <Icon name="close" size={14} />
              </button>
            )}
          </label>

          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={'chip' + (filter === f.id ? ' active' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <button
              className={'chip' + (onlyGram ? ' active' : '')}
              onClick={() => setOnlyGram((v) => !v)}
            >
              Notu olanlar
            </button>
          </div>

          <div className="tiny faint">
            {bulunan} kelime gösteriliyor
            {(terim || filter !== 'hepsi' || onlyGram) && ` (${ALL_VOCAB.length} içinden)`}
          </div>
        </div>

        {bolumler.length === 0 && (
          <div className="card card-sub">
            Eşleşen kelime yok. Türkçe karşılığıyla ya da romaji ile aramayı dene.
          </div>
        )}

        {bolumler.map((t) => (
          <div key={t.id} className="stack-sm">
            <h2>{t.title}</h2>
            {t.desc && (
              <div className="card-sub" style={{ marginTop: -2 }}>
                {t.desc}
              </div>
            )}
            <div className="vocab-list">
              {t.words.map((w) => (
                <VocabRow key={t.id + ':' + w.kana} w={w} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function VocabRow({ w }: { w: VocabWord }) {
  return (
    <div className="vocab-row">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ja vocab-kana">{w.kana}</div>
          {/*
            Romaji tek başına yanıltıyor: "shi", "chi", "tsu" bir Türk okuyucuya
            başka ses düşündürür. Türkçe yazımla yaklaşık okunuş o yüzden var.
          */}
          <div className="vocab-oku">{w.reading ? tr(w.reading) : jaToTurkishSpeech(w.kana)}</div>
          <div className="vocab-tr">{w.tr}</div>
        </div>
        <div className="stack-sm" style={{ gap: 5, alignItems: 'flex-end' }}>
          <SpeakBtn text={w.kana} lang="ja" reading={w.say ?? w.kana} size="sm" />
          {w.kanji && <span className="badge tiny ja">{w.kanji}</span>}
          <span className="vocab-pos">{POS_TR[w.pos]}</span>
        </div>
      </div>

      {w.note && <div className="tiny vocab-note vocab-note--warn">{w.note}</div>}
      {w.gram && <div className="tiny vocab-note">{w.gram}</div>}
    </div>
  )
}

/** Elle yazılmış romaji okunuşunu Türkçe yaklaşıklığa çevirir (konnichiwa → konniçiva). */
function tr(romaji: string): string {
  return romaji
    .replace(/sh/g, 'ş')
    .replace(/ch/g, 'ç')
    .replace(/j/g, 'c')
    .replace(/y/g, 'y')
    .replace(/w/g, 'v')
}
