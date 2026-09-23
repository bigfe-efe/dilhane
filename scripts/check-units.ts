// Ünite içeriğinin denetimi — yeni ünite ya da soru eklendikten sonra çalıştır:
//   npx tsx scripts/check-units.ts
//
// Denetlenenler:
//   • N5 sorularında cevap numarası geçerli, şıklar birbirinden farklı
//   • ★ sıralama sorularında doğru cevap, tam cümlede ★ yerine (3. boşluk)
//     düşen parça — elle yazılırken en kolay karışan şey bu
//   • Soru kimlikleri bütün uygulamada benzersiz (deneme havuzu tek)
//   • Dikte cevaplarından biri metnin kana okunuşuyla eşleşiyor
import { UNITS } from '../src/content/ja/units'
import { BANK } from '../src/content/ja/n5-mock'
import { acceptsJa } from '../src/lib/answer'

let hata = 0
const bildir = (m: string) => {
  hata++
  console.log('HATA', m)
}

const kimlikler = new Map<string, string>()
const kaydet = (id: string, yer: string) => {
  if (kimlikler.has(id)) bildir(`kimlik iki kez: ${id} (${kimlikler.get(id)} ve ${yer})`)
  kimlikler.set(id, yer)
}
for (const q of BANK) kaydet(q.id, 'banka')

for (const u of UNITS) {
  for (const q of [...(u.n5 ?? []), ...(u.choukai ?? [])]) {
    kaydet(q.id, u.id)
    if (q.answer < 0 || q.answer >= q.options.length) bildir(`${q.id}: cevap numarası geçersiz`)
    if (new Set(q.options).size !== q.options.length) bildir(`${q.id}: aynı şık iki kez`)
  }

  for (const q of u.n5 ?? []) {
    if (q.mondai !== 'bunpou2') continue
    if (!q.fullSentence) {
      bildir(`${q.id}: ★ sorusunda tam cümle yok`)
      continue
    }
    const bosluklar = q.prompt.split(/\s+/).filter((t) => t === '＿' || t === '★')
    const yildiz = bosluklar.indexOf('★')
    // Parçaları tam cümledeki sıralarına göre diz
    const duz = q.fullSentence.replace(/\s/g, '')
    let konum = 0
    const sirali: string[] = []
    const kalan = [...q.options]
    while (kalan.length) {
      const sonraki = kalan
        .map((p) => ({ p, i: duz.indexOf(p.replace(/\s/g, ''), konum) }))
        .filter((x) => x.i >= 0)
        .sort((a, b) => a.i - b.i)[0]
      if (!sonraki) {
        bildir(`${q.id}: parçalar tam cümlede sırayla bulunamadı`)
        break
      }
      sirali.push(sonraki.p)
      konum = sonraki.i + sonraki.p.replace(/\s/g, '').length
      kalan.splice(kalan.indexOf(sonraki.p), 1)
    }
    if (sirali.length === 4 && sirali[yildiz] !== q.options[q.answer]) {
      bildir(`${q.id}: ★ yerindeki parça ${sirali[yildiz]}, ama cevap ${q.options[q.answer]}`)
    }
  }

  for (const ex of u.test) {
    if (ex.type === 'dictation') {
      if (!ex.answers.some((a) => acceptsJa(a, ex.answers))) bildir(`${ex.id}: dikte cevabı yok`)
    }
  }
}

console.log(`${UNITS.length} ünite, ${kimlikler.size} soru kimliği denetlendi.`)
console.log(hata ? `${hata} HATA` : 'Tamam.')
process.exit(hata ? 1 : 0)
