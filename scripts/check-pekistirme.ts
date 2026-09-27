// Ünite kitabı pekiştirme sorularını denetler:
//   • her dilbilgisi başlığının sorusu var, fazladan başlık yok
//   • şıklı sorularda doğru indeks geçerli, şıklar tekrarsız
//   • yazmalı sorunun kabul edilen cevapları boş değil ve kendisiyle eşleşiyor
//   • soru, şık ve açıklamalarda o üniteye kadar görülmemiş kanji yok
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-pekistirme.ts [-v]
import { UNITS } from '../src/content/ja/units'
import { GRAMER_SORULARI } from '../src/content/ja/units/gramer-sorulari'
import { cevapDogruMu, sayfaSorulari } from '../src/content/ja/unit-pekistirme'
import { kitapSayfalari } from '../src/content/ja/unit-kitap'
import { yeniKelimeler } from '../src/lib/yeni-kelime'

const ayrinti = process.argv.includes('-v')
let hata = 0
let toplam = 0
const bildir = (m: string) => (hata++, console.log(m))

for (const u of UNITS) {
  const basliklar = new Set(u.grammar.map((g) => g.title))
  for (const t of Object.keys(GRAMER_SORULARI[u.id] ?? {})) if (!basliklar.has(t)) bildir(`${u.id}: bilinmeyen başlık "${t}"`)
  for (const s of kitapSayfalari(u)) {
    const sorular = sayfaSorulari(u, s)
    if ((s.tur === 'gramer' || s.tur === 'kelime' || s.tur === 'kanji') && !sorular.length) bildir(`${u.id}/${s.id}: soru yok`)
    for (const { id, soru } of sorular) {
      toplam++
      const yer = `${u.id}/${id}`
      if (soru.t === 'sec') {
        if (soru.d < 0 || soru.d >= soru.o.length) bildir(`${yer}: doğru indeks geçersiz`)
        if (new Set(soru.o).size !== soru.o.length) bildir(`${yer}: tekrarlı şık`)
        if (soru.o.length < 3) bildir(`${yer}: şık az (${soru.o.length})`)
      } else {
        if (!soru.d.length) bildir(`${yer}: kabul edilen cevap yok`)
        for (const d of soru.d) if (!cevapDogruMu(d, soru.d)) bildir(`${yer}: "${d}" kendisiyle eşleşmiyor`)
      }
      const metin = [soru.s, soru.a, ...(soru.t === 'sec' ? soru.o : soru.d)].join(' ')
      const yeni = yeniKelimeler(metin, u.id)
      if (yeni.length) bildir(`${yer}: görülmemiş kanji ${yeni.map((w) => w.ja).join(' ')} — ${soru.s}`)
      if (ayrinti) {
        const cevap = soru.t === 'sec' ? `[${soru.o.map((o, i) => (i === soru.d ? `*${o}*` : o)).join(' | ')}]` : `= ${soru.d.join(' / ')}`
        console.log(`${yer}\t${soru.s}\t${cevap}`)
      }
    }
  }
}
// Romaji girdisi denetimi
const ornek: [string, string[], boolean][] = [
  ['okimashita', ['起きました', 'おきました'], true],
  ['wa', ['は'], true],
  ['e', ['へ', 'に'], true],
  ['kitte', ['きって'], true],
  ['shichiji han', ['しちじはん'], true],
  ['ga', ['が'], true],
  ['wo', ['を'], true],
  ['o', ['を'], true],
  ['desu', ['です'], true],
  ['masu', ['です'], false],
]
for (const [g, d, beklenen] of ornek) if (cevapDogruMu(g, d) !== beklenen) bildir(`cevapDogruMu("${g}", ${d}) ≠ ${beklenen}`)

console.log(`${toplam} soru denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
