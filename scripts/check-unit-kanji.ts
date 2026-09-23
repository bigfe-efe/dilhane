// Ünite kanji dağıtımının denetimi: 106 N5 kanjisi tam bir kez dağıtılmış mı,
// her kanji kendi ünitesinin içeriğinde geçiyor mu?
// Çalıştır: npx tsx scripts/check-unit-kanji.ts
import { UNITS, UNITE_KANJI } from '../src/content/ja/units'
import { KANJI_N5 } from '../src/content/ja/kanji-n5'

const hepsi = Object.values(UNITE_KANJI).join('')
const n5 = KANJI_N5.map((k) => k.char)
let hata = 0
const say = new Map<string, number>()
for (const c of hepsi) say.set(c, (say.get(c) ?? 0) + 1)
for (const c of n5) if (!say.has(c)) { hata++; console.log('DAĞITILMAMIŞ:', c) }
for (const [c, n] of say) {
  if (n > 1) { hata++; console.log('İKİ KEZ:', c) }
  if (!n5.includes(c)) { hata++; console.log('N5 DEĞİL:', c) }
}
for (const u of UNITS) {
  const icerik = JSON.stringify([u.vocab, u.text.lines, u.grammar])
  for (const c of UNITE_KANJI[u.id] ?? '') if (!icerik.includes(c)) { hata++; console.log(`${u.id}: ${c} içerikte geçmiyor`) }
  console.log(`${u.id}: ${[...(UNITE_KANJI[u.id] ?? '')].length} kanji`)
}
console.log(hata ? `${hata} HATA` : `Tamam: ${hepsi.length} kanji, hepsi bağlamında.`)
process.exit(hata ? 1 : 0)
