import { Fragment } from 'react'
import { kelimeAyir } from '@/lib/kanji-ayir'
import { kanaToRomaji, romajiWords } from '@/lib/ja-phonetic'
import { kanjiBilgi, n5Kanji } from '@/content/ja/kanji-ek'
import { UNIT_BY_ID, kanjiUnit } from '@/content/ja/units'

// Kelimeden kanjiye köprü: 先生 = 先 (sen, önce) + 生 (sei, hayat).
// Öğrenci kanjiyi kelimenin içinde öğreniyor; bu bileşen kelimeyi
// parçalarına ayırıp her kanjinin kendi anlamını ve O KELİMEDEKİ okunuşunu
// gösteriyor. Okunuş kanjilerden kurulamıyorsa (今日) özel okunuş deniyor.

/**
 * Kanjinin ilk anlamının o kelimede yanıltıcı olduğu yerler. Her kanjinin
 * birden çok anlamı var ve döküm varsayılan olarak ilkini gösteriyor;
 * 日本 "gün + kitap" diye çıkıyordu — oysa "güneş + köken": güneşin doğduğu yer.
 */
const KELIME_ANLAMI: Record<string, Record<string, string>> = {
  日本: { 日: 'güneş', 本: 'köken' },
  日本人: { 日: 'güneş', 本: 'köken' },
  日本語: { 日: 'güneş', 本: 'köken' },
  天気: { 天: 'gök', 気: 'hava, enerji' },
  元気: { 気: 'enerji' },
  病気: { 気: 'enerji' },
}

const anlam = (kelime: string, ch: string, varsayilan: string) => KELIME_ANLAMI[kelime]?.[ch] ?? varsayilan

/** Kelime + altında kanji kanji dökümü. `vurgu`: üzerinde durulan kanji */
export function KelimeKirilimi({ ja, kana, tr, vurgu }: { ja: string; kana: string; tr?: string; vurgu?: string }) {
  const a = kelimeAyir(ja, kana)
  const kanjiler = a.parcalar.filter((p) => p.kanji || p.okunus)
  return (
    <div className="kk-kelime-satir">
      <div className="row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span className="ja kk-kelime">{ja}</span>
        <span className="kk-romaji">{romajiWords(ja, kana)}</span>
        {tr && <span className="small dim">· {tr}</span>}
      </div>
      {a.ozel ? (
        <div className="tiny faint">
          Özel okunuş: kanjilerin tek tek okunuşundan kurulmaz, kelime bütün olarak öğrenilir.
        </div>
      ) : (
        <div className="kk-parcalar">
          {kanjiler.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="kk-arti">+</span>}
              <span className={`kk-parca${p.ch === vurgu ? ' is-on' : ''}`}>
                <b className="ja">{p.ch}</b>
                {p.okunus && <span className="kk-ok">{kanaToRomaji(p.okunus)}</span>}
                {p.kanji && <span className="kk-an">{anlam(ja, p.ch, p.kanji.meaningsTr[0])}</span>}
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

/** "い-きる" → "い(きる)": tireden sonrası okurigana */
const kunGoster = (k: string) => k.replace(/^-/, '…').replace(/-(.+)$/, '($1)')
const hiraganaya = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
const KANJI_KARAKTER = /[\u4e00-\u9fff々]/

/**
 * Kelime kartının sağ sütunu: kelimedeki her kanji tek tek — kendi anlamı,
 * BU kelimedeki okunuşu, on/kun okunuşları, çizgi sayısı ve hangi ünitede
 * öğretildiği. Öğrenci kanjiyi kelimeyle birlikte ama parçalarını da
 * tanıyarak öğrenmek istedi (毎朝 = 毎 her + 朝 sabah).
 */
export function KelimeKanjileri({ ja, kana }: { ja: string; kana: string }) {
  const a = kelimeAyir(ja, kana)
  const parcalar = a.parcalar.filter((p) => KANJI_KARAKTER.test(p.ch) && p.ch !== '々')
  if (!parcalar.length) return null
  return (
    <div className="uvk-liste">
      {parcalar.map((p, i) => (
        <KanjiMini key={i} ch={p.ch} okunus={a.ozel ? undefined : p.okunus} kelime={ja} />
      ))}
      {a.ozel && <div className="uvk-ozel">Özel okunuş: kanjilerin okunuşundan kurulmaz, kelime bütün olarak okunur.</div>}
    </div>
  )
}

function KanjiMini({ ch, okunus, kelime }: { ch: string; okunus?: string; kelime: string }) {
  const k = kanjiBilgi(ch)
  const uid = kanjiUnit(ch)
  const unite = uid ? UNIT_BY_ID.get(uid) : undefined
  return (
    <div className="uvk">
      <span className="uvk-ch ja">{ch}</span>
      <div className="uvk-bilgi">
        <div className="uvk-anlam">{k ? anlam(kelime, ch, k.meaningsTr.slice(0, 2).join(', ')) : '—'}</div>
        {okunus && (
          <div className="uvk-satir">
            <span className="uvk-etiket">burada</span>
            <span className="ja">{okunus}</span> <span className="uvk-romaji">{kanaToRomaji(okunus)}</span>
          </div>
        )}
        {k && k.on.length > 0 && (
          <div className="uvk-satir">
            <span className="uvk-etiket">on</span>
            {k.on.slice(0, 2).map((o, i) => (
              <span key={o}>
                {i > 0 && ' · '}
                <span className="ja">{o}</span> <span className="uvk-romaji">{kanaToRomaji(hiraganaya(o))}</span>
              </span>
            ))}
          </div>
        )}
        {k && k.kun.length > 0 && (
          <div className="uvk-satir">
            <span className="uvk-etiket">kun</span>
            {k.kun.slice(0, 2).map((o, i) => (
              <span key={o}>
                {i > 0 && ' · '}
                <span className="ja">{kunGoster(o)}</span>{' '}
                <span className="uvk-romaji">{kunGoster(kanaToRomaji(o.replace(/-/g, '|')).replace(/\|/g, '-'))}</span>
              </span>
            ))}
          </div>
        )}
        <div className="uvk-alt">
          {k && `${k.strokes} çizgi · `}
          {unite ? `N5 · ${unite.no}. ünitenin kanjisi` : n5Kanji(ch) ? 'N5' : 'N5 dışı'}
        </div>
      </div>
    </div>
  )
}
