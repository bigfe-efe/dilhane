import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chips, SpeakBtn, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KANA_RULES, MORA_PRINCIPLE, type KanaRule, type RuleExample } from '@/content/ja/kana-rules'

// Hiragana özel kuralları.
//
// Kana tablosu 46 karakteri öğretir; bu sayfa tablonun ANLATMADIĞI şeyleri
// öğretir. Bitirme sınavındaki "özel kurallar" bölümü buradan çalışılır.
//
// Düzen kararı: her kural kartının en tepesinde tek cümlelik kural var, sonra
// açıklama, sonra örnekler. Örneklerin çoğu KARŞILAŞTIRMALI — kuralı ihlal
// edersen kelimenin neye dönüştüğünü göstermek, kuralı anlatmaktan daha
// öğretici.

export default function KanaRulesPage() {
  const [filtre, setFiltre] = useState('hepsi')

  // Kural testinin sonucundan "bu kuralı oku" ile gelinince doğrudan o kurala
  // açılsın — kullanıcı listede aramasın.
  const [params] = useSearchParams()
  const istenen = params.get('k')
  useEffect(() => {
    if (istenen && KANA_RULES.some((r) => r.id === istenen)) setFiltre(istenen)
  }, [istenen])

  const gorunen = filtre === 'hepsi' ? KANA_RULES : KANA_RULES.filter((r) => r.id === filtre)

  return (
    <>
      <TopBar title="Hiragana dilbilgisi" sub="Yazı sisteminin kuralları" back="/calis" />

      <div className="page stack-lg lang-ja">
        {/* Bütün kuralların dayandığı ilke */}
        <div className="card card--accent stack-sm">
          <div className="row">
            <span className="entry-icon">
              <Icon name="clock" size={18} />
            </span>
            <div className="card-title" style={{ flex: 1 }}>
              {MORA_PRINCIPLE.title}
            </div>
          </div>
          {MORA_PRINCIPLE.body.map((p, i) => (
            <div key={i} className="card-sub" style={{ lineHeight: 1.65 }}>
              {p}
            </div>
          ))}
        </div>

        <Chips
          items={[
            { id: 'hepsi', label: 'Hepsi' },
            ...KANA_RULES.map((r) => ({ id: r.id, label: r.short })),
          ]}
          value={filtre}
          onChange={setFiltre}
        />

        {gorunen.map((r) => (
          <RuleCard key={r.id} rule={r} />
        ))}

        <div className="card card--accent stack-sm">
          <div className="card-title">Şimdi dene</div>
          <div className="card-sub" style={{ lineHeight: 1.6 }}>
            Kural okumakla oturmaz; kelime sökerken oturur. Kural okuma testinde kelimeyi görür, okunuşunu
            <b> şıksız yazarsın</b> — sonunda hangi kuralda düştüğün tek tek çıkar.
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <Link to="/kural-testi" className="btn btn--sm btn--primary">
              Kural okuma testi
              <Icon name="right" size={14} />
            </Link>
            <Link to="/kana-kelime" className="btn btn--sm btn--ghost">
              Kelime okuma
              <Icon name="right" size={14} />
            </Link>
            <Link to="/hiragana-sinav" className="btn btn--sm btn--ghost">
              Bitirme sınavı
              <Icon name="right" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function RuleCard({ rule }: { rule: KanaRule }) {
  return (
    <div className="card stack-sm">
      <div className="row">
        <span className="rule-glyph ja">{rule.glyph}</span>
        <div className="card-title" style={{ flex: 1 }}>
          {rule.title}
        </div>
      </div>

      <div className="rule-line">{rule.rule}</div>

      {rule.body.map((p, i) => (
        <div key={i} className="card-sub" style={{ lineHeight: 1.65 }}>
          {p}
        </div>
      ))}

      <div className="stack-sm" style={{ marginTop: 4 }}>
        {rule.examples.map((ex, i) => (
          <Example key={i} ex={ex} />
        ))}
      </div>

      <div className="rule-pitfall">
        <b>En sık yapılan hata: </b>
        {rule.pitfall}
      </div>
    </div>
  )
}

function Example({ ex }: { ex: RuleExample }) {
  return (
    <div className="rule-ex">
      <div className="row" style={{ alignItems: 'baseline', gap: 8 }}>
        <span className="ja rule-ex-kana">{ex.kana}</span>
        <span className="rule-ex-read">{ex.reading}</span>
        <div className="spacer" />
        <SpeakBtn text={ex.kana} lang="ja" reading={ex.kana} size="sm" />
      </div>
      <div className="tiny dim">{ex.tr}</div>

      {ex.vs && (
        <div className="rule-vs">
          <span className="rule-vs-tag">karıştırma</span>
          <span className="ja rule-ex-kana" style={{ fontSize: '1.15rem' }}>
            {ex.vs.kana}
          </span>
          <span className="rule-ex-read">{ex.vs.reading}</span>
          <span className="tiny dim">{ex.vs.tr}</span>
        </div>
      )}
    </div>
  )
}
