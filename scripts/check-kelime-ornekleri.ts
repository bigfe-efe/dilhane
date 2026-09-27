// Ünite kelime kartlarının örnek cümlelerini denetler:
//   • her ünite kelimesinin örneği var, fazladan anahtar yok
//   • cümle kelimeyi (ya da çekimli kökünü) içeriyor
//   • cümlede o üniteye kadar görülmemiş kanji yok
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-kelime-ornekleri.ts [-v]
import { UNITS } from '../src/content/ja/units'
import { KELIME_ORNEKLERI, cumledekiKelime } from '../src/content/ja/units/kelime-ornekleri'
import { yeniKelimeler } from '../src/lib/yeni-kelime'

const ayrinti = process.argv.includes('-v')
let hata = 0
let toplam = 0
for (const u of UNITS) {
  const tablo = KELIME_ORNEKLERI[u.id] ?? {}
  const kelimeler = new Set(u.vocab.map((v) => v.ja))
  for (const k of Object.keys(tablo)) if (!kelimeler.has(k)) (hata++, console.log(`${u.id}: fazladan anahtar ${k}`))
  for (const v of u.vocab) {
    const o = tablo[v.ja]
    if (!o) {
      hata++
      console.log(`${u.id}: örnek yok — ${v.ja}`)
      continue
    }
    toplam++
    const [ja, , tr, latin] = o
    if (!latin?.trim()) (hata++, console.log(`${u.id}: ${v.ja} romaji yok`))
    const parca = cumledekiKelime(ja, v.ja)
    if (!parca) (hata++, console.log(`${u.id}: ${v.ja} cümlede geçmiyor: ${ja}`))
    const yeni = yeniKelimeler(ja, u.id)
    if (yeni.length) (hata++, console.log(`${u.id}: ${v.ja} görülmemiş kanji: ${yeni.map((w) => w.ja).join(' ')} — ${ja}`))
    if (ayrinti) console.log(`${u.id} ${v.ja}\t${ja}\t${latin}\t${tr}`)
  }
}
console.log(`${toplam} örnek denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
