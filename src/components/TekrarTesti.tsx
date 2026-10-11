import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cevapDogruMu, tekrarSorulari, type TekrarSorusu } from '@/content/ja/unit-pekistirme'
import { UNIT_BY_ID, type Unit } from '@/content/ja/units'
import { kanaToRomaji } from '@/lib/ja-phonetic'
import { db, setSetting } from '@/db/db'

// Ünite tekrar testi.
//
// Ünite sonu testi üniteyi BİTİRMEK için bir kez geçilir; bu test ise tekrar
// için: her başlatışta ünitenin dilbilgisi, kelime ve kanjilerinden yeniden
// kurulan 10 ya da 20 soru. Aynı test iki kez gelmez, o yüzden cevap ezberi
// olmaz. Hem ünite kitabının bir sayfası hem de Çalış'tan açılan ayrı sayfa
// bu bileşeni kullanır.

const GECMIS_ANAHTAR = 'tekrar-testleri'

interface Sonuc {
  at: number
  c: number
  t: number
  /** Birikimli (önceki üniteler dahil) miydi */
  b: boolean
}

interface Cevap {
  q: TekrarSorusu
  v: string
  ok: boolean
}

const dogruMetin = (q: TekrarSorusu): string => {
  if (q.soru.t === 'sec') return q.soru.o[q.soru.d]
  if (q.soru.g) return q.soru.g
  const kana = q.soru.d.find((d) => /^[぀-ヿー]+$/.test(d))
  return q.soru.d.join(' / ') + (kana ? ` (${kanaToRomaji(kana)})` : '')
}

export function TekrarTesti({ unit }: { unit: Unit }) {
  const [adet, setAdet] = useState<10 | 20>(10)
  const [birikimli, setBirikimli] = useState(false)
  const [liste, setListe] = useState<TekrarSorusu[] | null>(null)
  const [i, setI] = useState(0)
  const [cevaplar, setCevaplar] = useState<Cevap[]>([])
  const [girdi, setGirdi] = useState('')

  const kayit = useLiveQuery(() => db.settings.get(GECMIS_ANAHTAR), [])
  const gecmis = ((kayit?.value as Record<string, Sonuc[]> | undefined)?.[unit.id] ?? []).slice(-5).reverse()

  const basla = () => {
    setListe(tekrarSorulari(unit.id, adet, birikimli && unit.no > 1))
    setI(0)
    setCevaplar([])
    setGirdi('')
  }

  const bitir = async (hepsi: Cevap[]) => {
    const mevcut = ((await db.settings.get(GECMIS_ANAHTAR))?.value as Record<string, Sonuc[]> | undefined) ?? {}
    const yeni: Sonuc = { at: Date.now(), c: hepsi.filter((x) => x.ok).length, t: hepsi.length, b: birikimli && unit.no > 1 }
    // Ünite başına son 20 sonuç yeter
    await setSetting(GECMIS_ANAHTAR, { ...mevcut, [unit.id]: [...(mevcut[unit.id] ?? []), yeni].slice(-20) })
  }

  // ——— Başlangıç ekranı ———
  if (!liste) {
    return (
      <div className="stack">
        <div className="card card--pad-lg stack">
          <div className="card-title">Tekrar testi</div>
          <div className="small">
            Bu ünitenin dilbilgisi, kelime ve kanjilerinden <b>her seferinde yeniden kurulan</b> bir test. Ünite sonu
            testinden farklı sorular; istediğin kadar çözebilirsin, ünitenin durumunu değiştirmez.
          </div>
          <div className="cm-dugmeler">
            <div className="cm-secici" role="group" aria-label="Soru sayısı">
              {([10, 20] as const).map((n) => (
                <button key={n} className={adet === n ? 'is-on' : ''} aria-pressed={adet === n} onClick={() => setAdet(n)}>
                  {n} soru
                </button>
              ))}
            </div>
            {unit.no > 1 && (
              <div className="cm-secici" role="group" aria-label="Kapsam">
                <button className={!birikimli ? 'is-on' : ''} aria-pressed={!birikimli} onClick={() => setBirikimli(false)}>
                  Yalnızca bu ünite
                </button>
                <button className={birikimli ? 'is-on' : ''} aria-pressed={birikimli} onClick={() => setBirikimli(true)}>
                  Önceki üniteler de
                </button>
              </div>
            )}
          </div>
          <div className="tiny faint">
            {birikimli && unit.no > 1
              ? `Soruların yarısı bu üniteden, yarısı 1–${unit.no - 1}. ünitelerden gelir: eskiyi unutmamak için.`
              : 'Yaklaşık %40 dilbilgisi, %40 kelime, %20 kanji. Yazmalı sorularda kana ya da romaji yazabilirsin.'}
          </div>
        </div>

        <button className="btn btn--primary btn--block btn--lg" onClick={basla}>
          Başla
        </button>

        {gecmis.length > 0 && (
          <div className="stack-sm">
            <div className="tb-sub">Son sonuçların</div>
            {gecmis.map((g) => (
              <div key={g.at} className="row small tt-gecmis">
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {g.c} / {g.t}
                </span>
                <span className="dim">%{Math.round((g.c / g.t) * 100)}</span>
                {g.b && <span className="badge tiny">birikimli</span>}
                <div className="spacer" />
                <span className="tiny faint">{new Date(g.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ——— Sonuç ekranı ———
  if (i >= liste.length) {
    const dogru = cevaplar.filter((x) => x.ok).length
    const yanlis = cevaplar.filter((x) => !x.ok)
    const yuzde = Math.round((dogru / liste.length) * 100)
    return (
      <div className="stack">
        <div className="card card--pad-lg center stack-sm">
          <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {dogru} / {liste.length}
          </div>
          <div className="dim">%{yuzde}</div>
          <div className="small dim">
            {yuzde >= 85
              ? 'Bu ünite sağlam.'
              : yuzde >= 60
                ? 'İyi; aşağıdaki yanlışlara bir göz at.'
                : 'Bu üniteyi bir kez daha gözden geçirmekte fayda var: önce yanlışlarını oku.'}
          </div>
        </div>

        {yanlis.length > 0 && (
          <div className="stack-sm">
            <h2>Yanlışların</h2>
            {yanlis.map((x, k) => (
              <div key={k} className="card stack-sm">
                <div className="tiny faint">
                  {x.q.konu}
                  {x.q.unite !== unit.id && ` · ${UNIT_BY_ID.get(x.q.unite)?.no}. ünite`}
                </div>
                <div>{x.q.soru.s}</div>
                <div className="small">
                  <span className="faint">cevabın: </span>
                  <span className="ja tt-yanlis">{x.v}</span>
                  <span className="faint"> · doğrusu: </span>
                  <b className="ja" style={{ color: 'var(--ok)' }}>
                    {dogruMetin(x.q)}
                  </b>
                </div>
                <div className="small dim">{x.q.soru.a}</div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn--primary btn--block btn--lg" onClick={basla}>
          Yeni test ({adet} soru)
        </button>
        <button className="btn btn--block" onClick={() => setListe(null)}>
          Ayarları değiştir
        </button>
      </div>
    )
  }

  // ——— Soru ———
  const q = liste[i]
  const cevap = cevaplar[i]
  const cevapla = (v: string, ok: boolean) => {
    if (cevap) return
    setCevaplar((c) => [...c, { q, v, ok }])
  }
  const ilerle = () => {
    if (i + 1 >= liste.length) void bitir(cevaplar)
    setI(i + 1)
    setGirdi('')
  }

  return (
    <div className="stack">
      <div className="row tiny faint">
        <span>
          {q.konu}
          {q.unite !== unit.id && ` · ${UNIT_BY_ID.get(q.unite)?.no}. ünite`}
        </span>
        <div className="spacer" />
        <span className="tabular">
          {i + 1} / {liste.length}
        </span>
      </div>
      <div className="kitap-cizgi" aria-hidden>
        {liste.map((_, k) => (
          <span
            key={k}
            className={`kitap-nokta tt-nokta${k === i ? ' is-on' : ''}${cevaplar[k] ? (cevaplar[k].ok ? ' is-dogru' : ' is-yanlis') : ''}`}
          />
        ))}
      </div>

      <div className="card card--pad-lg stack">
        <div className="tt-soru">{q.soru.s}</div>

        {q.soru.t === 'sec' ? (
          <div className="pk-siklar">
            {q.soru.o.map((o, k) => {
              const d = q.soru.t === 'sec' ? q.soru.d : -1
              const durum = !cevap ? '' : k === d ? ' is-dogru' : o === cevap.v ? ' is-yanlis' : ' is-soluk'
              return (
                <button key={o} className={`pk-sik${durum}`} disabled={!!cevap} onClick={() => cevapla(o, k === d)}>
                  {o}
                </button>
              )
            })}
          </div>
        ) : cevap ? (
          <div className={`pk-verilen${cevap.ok ? ' is-dogru' : ' is-yanlis'}`}>
            Cevabın: <b className="ja">{cevap.v}</b>
          </div>
        ) : (
          <form
            className="pk-yaz"
            onSubmit={(e) => {
              e.preventDefault()
              const v = girdi.trim()
              if (v && q.soru.t === 'yaz') cevapla(v, cevapDogruMu(v, q.soru.d))
            }}
          >
            <input
              className="field ja"
              value={girdi}
              onChange={(e) => setGirdi(e.target.value)}
              placeholder="kana ya da romaji"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
            />
            <button className="btn btn--primary" type="submit" disabled={!girdi.trim()}>
              Kontrol et
            </button>
          </form>
        )}

        {cevap &&
          (cevap.ok ? (
            <div className="feedback feedback--ok small">
              <b>Doğru.</b>
            </div>
          ) : (
            <div className="feedback feedback--bad small stack-sm">
              <div>
                <b>Doğrusu:</b> <span className="ja">{dogruMetin(q)}</span>
              </div>
              <div>{q.soru.a}</div>
            </div>
          ))}
      </div>

      {cevap ? (
        <button className="btn btn--primary btn--block" onClick={ilerle}>
          {i + 1 >= liste.length ? 'Sonucu gör' : 'Sonraki'}
        </button>
      ) : (
        <button className="btn btn--sm btn--ghost" style={{ justifySelf: 'start' }} onClick={() => setListe(null)}>
          Testi bırak
        </button>
      )}
    </div>
  )
}
