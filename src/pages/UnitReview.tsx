import { useSearchParams } from 'react-router-dom'
import { Chips, TopBar } from '@/components/ui'
import { TekrarTesti } from '@/components/TekrarTesti'
import { UNITS, UNIT_BY_ID } from '@/content/ja/units'
import { useUnitProgress } from '@/db/hooks'

// Ünite tekrar testi — Çalış'tan açılan sayfa. Ünite seçilir, test başlar.
// Aynı test ünite kitabının "Tekrar testi" sayfasında da var.

export default function UnitReviewPage() {
  const [params, setParams] = useSearchParams()
  const ilerleme = useUnitProgress()
  // Varsayılan: üzerinde çalışılan son ünite (kaydı olan en ileri ünite)
  const sonCalisilan = [...UNITS].reverse().find((u) => ilerleme.has(u.id)) ?? UNITS[0]
  const unit = UNIT_BY_ID.get(params.get('u') ?? '') ?? sonCalisilan

  return (
    <>
      <TopBar title="Ünite tekrar testi" sub={`${unit.no}. ${unit.title}`} back="/calis" />
      <div className="page stack-lg lang-ja">
        <Chips
          items={UNITS.map((u) => ({ id: u.id, label: `${u.no}. ${u.title}` }))}
          value={unit.id}
          onChange={(u) => setParams({ u }, { replace: true })}
        />
        {/* Ünite değişince yarım kalan test sıfırlansın */}
        <TekrarTesti key={unit.id} unit={unit} />
      </div>
    </>
  )
}
