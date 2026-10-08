// Okuma metinlerini denetler:
//   • metinde o üniteye kadar görülmemiş kanji yok
//   • elle yazılan romaji kana okunuşuyla aynı sesi veriyor
//   • soruların doğru indeksi geçerli, şıklar tekrarsız
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-okuma.ts
import { OKUMA } from '../src/content/ja/okuma'
import { UNIT_BY_ID } from '../src/content/ja/units'
import { yeniKelimeler } from '../src/lib/yeni-kelime'
import { cevapDogruMu } from '../src/content/ja/unit-pekistirme'

let hata = 0
let satirSayisi = 0
const bildir = (m: string) => (hata++, console.log(m))
const hira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
// Uzun ünlü çizgisi romajide çift ünlü yazılıyor (koohii ↔ こーひー)
const uzat = (kana: string) => hira(kana).replace(/([おこそとのほもよろごぞどぼぽょ])ー/g, '$1お').replace(/([いきしちにひみりぎじびぴ])ー/g, '$1い')

if (new Set(OKUMA.map((m) => m.id)).size !== OKUMA.length) bildir('tekrarlı metin kimliği')
for (const m of OKUMA) {
  if (!UNIT_BY_ID.has(m.unite)) bildir(`${m.id}: bilinmeyen ünite ${m.unite}`)
  for (const l of m.satirlar) {
    satirSayisi++
    const yeni = yeniKelimeler(l.ja, m.unite)
    if (yeni.length) bildir(`${m.id}: görülmemiş kanji ${yeni.map((w) => w.ja).join(' ')} — ${l.ja}`)
    if (/[一-鿿]/.test(l.kana)) bildir(`${m.id}: kana satırında kanji — ${l.kana}`)
    if (!cevapDogruMu(l.latin, [uzat(l.kana)])) bildir(`${m.id}: romaji ≠ kana — ${l.latin} / ${l.kana}`)
  }
  const baslikYeni = yeniKelimeler(m.baslik, m.unite)
  if (baslikYeni.length) bildir(`${m.id}: başlıkta görülmemiş kanji ${baslikYeni.map((w) => w.ja).join(' ')}`)
  m.sorular.forEach((q, i) => {
    if (q.d < 0 || q.d >= q.o.length) bildir(`${m.id}/soru${i}: doğru indeks geçersiz`)
    if (new Set(q.o).size !== q.o.length) bildir(`${m.id}/soru${i}: tekrarlı şık`)
    const yeni = yeniKelimeler(q.a, m.unite)
    if (yeni.length) bildir(`${m.id}/soru${i}: açıklamada görülmemiş kanji ${yeni.map((w) => w.ja).join(' ')}`)
  })
}
console.log(`${OKUMA.length} metin, ${satirSayisi} satır denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
