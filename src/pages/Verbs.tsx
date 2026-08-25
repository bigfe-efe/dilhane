import { useMemo, useState } from 'react'
import { toRomaji } from 'wanakana'
import { Badge, Chips, SpeakBtn, TopBar } from '@/components/ui'
import { VOCAB_JA } from '@/content/ja/vocab'
import { ADJ_FORMS, GROUP_NOTE, GROUP_TR, VERB_FORMS, conjugateAdjective, conjugateVerb, detectGroup } from '@/lib/conjugate-ja'

// Fiil ve sıfat çekim tabloları. Uygulama tek dilli olduğu için burada
// yalnızca Japonca vardır; eski İngilizce zaman tabloları kaldırıldı.

export default function VerbsPage() {
  const verbs = useMemo(() => VOCAB_JA.filter((v) => v.pos?.includes('fiil')), [])
  const adjs = useMemo(() => VOCAB_JA.filter((v) => v.pos?.includes('sıfat')), [])
  const [mode, setMode] = useState<'verb' | 'adj'>('verb')
  const [sel, setSel] = useState(verbs[0]?.id ?? '')

  const list = mode === 'verb' ? verbs : adjs
  const item = list.find((v) => v.id === sel) ?? list[0]

  const conj = item
    ? mode === 'verb'
      ? conjugateVerb(item.term, item.reading ?? item.term)
      : conjugateAdjective(item.term, item.reading ?? item.term, item.pos?.includes('i-sıfat') ? 'i' : 'na')
    : null
  const group = item && mode === 'verb' ? detectGroup(item.term, item.reading ?? item.term) : null
  const forms = mode === 'verb' ? VERB_FORMS : ADJ_FORMS

  return (
    <>
      <TopBar title="Japonca çekimler" sub="Fiil ve sıfat tabloları" back="/ja" />

      <div className="page stack-lg lang-ja">
        <div className="row">
          <button className={`chip${mode === 'verb' ? ' active' : ''}`} onClick={() => { setMode('verb'); setSel(verbs[0].id) }}>
            Fiiller
          </button>
          <button className={`chip${mode === 'adj' ? ' active' : ''}`} onClick={() => { setMode('adj'); setSel(adjs[0].id) }}>
            Sıfatlar
          </button>
        </div>

        <Chips items={list.map((v) => ({ id: v.id, label: v.term }))} value={item?.id ?? ''} onChange={setSel} />

        {item && conj && (
          <>
            <div className="card card--pad-lg center stack-sm">
              <div className="ja-big">{item.term}</div>
              <div className="reading">{item.reading}</div>
              <div className="romaji">{toRomaji(item.reading ?? '')}</div>
              <div style={{ fontWeight: 620 }}>{item.tr}</div>
              <div className="row" style={{ justifyContent: 'center' }}>
                <SpeakBtn text={item.term} lang="ja" reading={item.reading} />
                {group && <Badge tone="ja">{GROUP_TR[group]}</Badge>}
              </div>
            </div>

            {group && <div className="feedback feedback--info">{GROUP_NOTE[group]}</div>}

            {(['nezaket', 'sade', 'baglanti', 'yetenek', 'diger'] as const).map((cat) => {
              const inCat = forms.filter((f) => f.category === cat)
              if (!inCat.length) return null
              return (
                <div key={cat} className="stack-sm">
                  <h3>{CAT_TR[cat]}</h3>
                  {inCat.map((f) => {
                    const val = conj.forms[f.id]
                    if (!val) return null
                    return (
                      <div key={f.id} className="card">
                        <div className="row">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="row" style={{ gap: 7 }}>
                              <span className="ja bold" style={{ fontSize: '1.16rem' }}>
                                {val.term}
                              </span>
                              {val.reading !== val.term && <span className="reading tiny">{val.reading}</span>}
                            </div>
                            <div className="tiny faint">
                              {f.tr} · <span className="ja">{f.ja}</span>
                            </div>
                            <div className="tiny dim" style={{ marginTop: 3 }}>
                              {f.note}
                            </div>
                          </div>
                          <SpeakBtn text={val.term} lang="ja" size="sm" reading={val.reading} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}

const CAT_TR: Record<string, string> = {
  nezaket: 'Kibar biçimler (ます)',
  sade: 'Sade biçimler (普通形)',
  baglanti: 'て formu ve türevleri',
  yetenek: 'Yeterlilik ve istek',
  diger: 'Diğer biçimler',
}
