import { Fragment } from 'react'
import { kelimeAyir } from '@/lib/kanji-ayir'
import { kanaToRomaji, romajiWords } from '@/lib/ja-phonetic'

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

/**
 * Kelime kartı için kısa satır: 先 önce + 生 hayat.
 * Yalnızca birden çok kanjili kelimelerde — tek kanjili kelimede kanjinin
 * anlamı zaten kelimenin anlamı.
 */
export function KanjiAnlamlari({ ja, kana }: { ja: string; kana: string }) {
  const a = kelimeAyir(ja, kana)
  const kanjiler = a.parcalar.filter((p) => p.kanji)
  if (kanjiler.length < 2) return null
  return (
    <div className="kk-kisa">
      {kanjiler.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && ' + '}
          <span className="ja">{p.ch}</span> {anlam(ja, p.ch, p.kanji!.meaningsTr[0])}
        </Fragment>
      ))}
    </div>
  )
}
