// Ünite kitabı pekiştirme sorularını denetler:
//   • her dilbilgisi başlığının sorusu var, fazladan başlık yok
//   • şıklı sorularda doğru indeks geçerli, şıklar tekrarsız
//   • yazmalı sorunun kabul edilen cevapları boş değil ve kendisiyle eşleşiyor
//   • soru, şık ve açıklamalarda o üniteye kadar görülmemiş kanji yok
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-pekistirme.ts [-v]
import { UNITS } from '../src/content/ja/units'
import { GRAMER_SORULARI } from '../src/content/ja/units/gramer-sorulari'
import { cevapDogruMu, sayfaSorulari, tekrarSorulari } from '../src/content/ja/unit-pekistirme'
import { kitapSayfalari } from '../src/content/ja/unit-kitap'
import { yeniKelimeler } from '../src/lib/yeni-kelime'
import { kanaToRomaji } from '../src/lib/ja-phonetic'
import type { PekSoru } from '../src/content/ja/units/gramer-sorulari'

const ayrinti = process.argv.includes('-v')
let hata = 0
let toplam = 0
const bildir = (m: string) => (hata++, console.log(m))

/**
 * Ekranda "Doğrusu" diye gösterilen romajiyi yazan öğrenci doğru sayılmalı.
 * (三つ sorusunda みっ "mi" diye gösteriliyor, "mi" yazınca yanlış deniyordu;
 * コーヒー için "koohii" de kabul edilmiyordu.) Arayüzdeki gösterimin aynısı
 * kurulur ve parantez içindeki romaji cevap olarak denenir.
 */
const gorulenHatalar = new Set<string>()
function gosterilenKabulMu(yer: string, soru: PekSoru) {
  if (soru.t !== 'yaz') return
  const kana = soru.d.find((d) => /^[぀-ヿー]+$/.test(d))
  if (!kana) return void bildir(`${yer}: kana cevabı yok — ${soru.s}`)
  const gosterilen = soru.g ?? `${soru.d.join(' / ')} (${kanaToRomaji(kana)})`
  const romaji = gosterilen.match(/\(([^)]+)\)\s*$/)?.[1]
  if (!romaji) return void bildir(`${yer}: gösterimde romaji yok — ${gosterilen}`)
  if (cevapDogruMu(romaji, soru.d)) return
  const m = `${yer}: gösterilen "${romaji}" yazılınca yanlış sayılıyor (${soru.d.join(' / ')}) — ${soru.s}`
  if (!gorulenHatalar.has(m)) (gorulenHatalar.add(m), bildir(m))
}

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
      gosterilenKabulMu(yer, soru)
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
// Tekrar testi: rastgele üretildiği için her ünite, boyut ve kip birçok kez denenir
let tekrarToplam = 0
const dagilim = new Map<string, number>()
for (const u of UNITS) {
  for (const adet of [10, 20]) {
    for (const birikimli of [false, true]) {
      for (let deneme = 0; deneme < 15; deneme++) {
        const liste = tekrarSorulari(u.id, adet, birikimli)
        if (liste.length !== adet) bildir(`${u.id} tekrar(${adet}, ${birikimli}): ${liste.length} soru üretildi`)
        if (!birikimli && liste.some((x) => x.unite !== u.id)) bildir(`${u.id} tekrar: başka üniteden soru`)
        for (const { soru, konu } of liste) {
          tekrarToplam++
          dagilim.set(konu, (dagilim.get(konu) ?? 0) + 1)
          if (soru.t === 'sec') {
            if (soru.d < 0 || soru.d >= soru.o.length) bildir(`${u.id} tekrar: doğru indeks geçersiz — ${soru.s}`)
            if (new Set(soru.o).size !== soru.o.length) bildir(`${u.id} tekrar: tekrarlı şık — ${soru.s}`)
            if (soru.o.length < 3) bildir(`${u.id} tekrar: şık az — ${soru.s}`)
          } else if (!soru.d.length || !soru.d.every((d) => cevapDogruMu(d, soru.d))) bildir(`${u.id} tekrar: cevap bozuk — ${soru.s}`)
          gosterilenKabulMu(`${u.id} tekrar`, soru)
          const yeni = yeniKelimeler([soru.s, soru.a, ...(soru.t === 'sec' ? soru.o : soru.d)].join(' '), u.id)
          if (yeni.length) bildir(`${u.id} tekrar: görülmemiş kanji ${yeni.map((w) => w.ja).join(' ')} — ${soru.s}`)
        }
      }
    }
  }
}
console.log(`Tekrar testi: ${tekrarToplam} üretilmiş soru denetlendi (${[...dagilim].map(([k, n]) => `${k} %${Math.round((n / tekrarToplam) * 100)}`).join(', ')}).`)

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
  // Küçük っ ile biten parça okunuşu: üçü de kabul
  ['mi', ['みっ', 'み', 'mit'], true],
  ['mit', ['みっ', 'み', 'mit'], true],
  ['みっ', ['みっ', 'み', 'mit'], true],
  // Uzun ünlüler: çizgi, çift ünlü, tire ve uzatma işaretli harf
  ['koohii', ['コーヒー'], true],
  ['ko-hi-', ['コーヒー'], true],
  ['kōhī', ['コーヒー'], true],
  ['こーひー', ['コーヒー'], true],
  ['supootsu', ['スポーツ'], true],
  ['gakkou', ['がっこう'], true],
  ['gakkoo', ['がっこう'], true],
  ['sensei', ['せんせい'], true],
  ['sensee', ['せんせい'], true],
  // ん + ünlü: kesme işaretiyle
  ["sen'en", ['せんえん'], true],
  ['senen', ['せんえん'], false],
  // Farklı kelimeler birbirine karışmasın
  ['koko', ['こうこう'], false],
  ['obasan', ['おばあさん'], false],
  ['kite', ['きって'], false],
  ['hon o kudasai', ['ほんをください'], true],
  ['asagohan o tabemasen', ['朝ご飯を食べません', 'あさごはんをたべません'], true],
]
for (const [g, d, beklenen] of ornek) if (cevapDogruMu(g, d) !== beklenen) bildir(`cevapDogruMu("${g}", ${d}) ≠ ${beklenen}`)

console.log(`${toplam} soru denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
