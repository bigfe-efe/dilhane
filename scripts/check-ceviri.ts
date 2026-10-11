// Türkçeye çeviri sorularının cevap denetimini sınar (lib/answer.ts acceptsTr).
//   • her sorunun yazılı cevapları kabul ediliyor
//   • anlamı değiştirmeyen yazım farkları kabul ediliyor (rakam, Türkçe
//     karaktersiz yazım, kelime sırası, -dir, "ben", "lütfen")
//   • anlamı değiştiren farklar (olumsuzluk, zaman, sayı) REDDEDİLİYOR
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-ceviri.ts
import { UNITS } from '../src/content/ja/units'
import { LESSONS } from '../src/content'
import { acceptsJa, acceptsTr } from '../src/lib/answer'
import type { Exercise } from '../src/types'

let hata = 0
const bildir = (m: string) => (hata++, console.log(m))

const hepsi: Exercise[] = []
for (const u of UNITS) hepsi.push(...u.test, ...u.text.questions)
for (const l of LESSONS)
  for (const s of l.sections) {
    if (s.kind === 'exercises') hepsi.push(...s.exercises)
    if (s.kind === 'passage') hepsi.push(...s.questions)
  }
const ceviri = hepsi.filter((e): e is Extract<Exercise, { type: 'translate' }> => e.type === 'translate')
const katla = (s: string) => s.replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c]!)

for (const e of ceviri) {
  for (const a of e.answers) {
    if (e.direction === 'to-tr') {
      if (!acceptsTr(a, e.answers)) bildir(`${e.source}: kendi cevabı reddedildi — ${a}`)
      // Türkçe karaktersiz, büyük harfli ve noktalı yazım
      if (!acceptsTr(katla(a), e.answers)) bildir(`${e.source}: Türkçe karaktersiz yazım reddedildi — ${katla(a)}`)
      if (!acceptsTr(a.charAt(0).toLocaleUpperCase('tr') + a.slice(1) + '.', e.answers)) bildir(`${e.source}: büyük harf/nokta reddedildi — ${a}`)
    } else if (!acceptsJa(a, e.answers)) bildir(`${e.source}: Japonca cevap reddedildi — ${a}`)
  }
}

// Biçim farkları: [girdi, kabul edilenler, beklenen]
const ornekler: [string, string[], boolean][] = [
  ['hepsi 800 yen', ['hepsi sekiz yüz yen', 'toplam sekiz yüz yen'], true],
  ['Toplam 800 yen.', ['hepsi sekiz yüz yen'], true],
  ['hepsi sekizyüz yen', ['hepsi sekiz yüz yen'], true],
  ['hepsi 800 yendir', ['hepsi sekiz yüz yen'], true],
  ['800 yen hepsi', ['hepsi sekiz yüz yen'], true],
  ['hepsi 300 yen', ['hepsi sekiz yüz yen'], false],
  ['hepsi 8000 yen', ['hepsi sekiz yüz yen'], false],
  ['1.500 yen', ['bin beş yüz yen'], true],
  ['on bin yen', ['10000 yen'], true],
  ['on bir yen', ['11 yen'], true],
  ['ben öğrenciyim', ['öğrenciyim'], true],
  ['arkadasim ogrenci', ['arkadaşım öğrenci'], true],
  ['Arkadaşım öğrencidir.', ['arkadaşım öğrenci'], true],
  ['dün erken yattım', ['dün erken yattım'], true],
  ['erken yattım dün', ['dün erken yattım'], true],
  // Anlamı değiştirenler reddedilmeli
  ['dün erken yatmadım', ['dün erken yattım'], false],
  ['yarın erken yatacağım', ['dün erken yattım'], false],
  ['kahvaltı yaptım', ['kahvaltı yapmadım'], false],
  ['o gazete', ['o gazete değil'], false],
  ['arkadaşım öğretmen', ['arkadaşım öğrenci'], false],
  ['lütfen banyo yapmayın', ['banyo yapmayın'], true],
  ['banyo yapın', ['banyo yapmayın'], false],
  ["Tanaka'nın babası öğretmen", ['tanakanın babası öğretmen'], true],
  ['', ['hepsi sekiz yüz yen'], false],
]
for (const [g, d, beklenen] of ornekler) if (acceptsTr(g, d) !== beklenen) bildir(`acceptsTr("${g}", ${JSON.stringify(d)}) ≠ ${beklenen}`)

// Japonca yazmalı cevaplarda uzun ünlü ve romaji
const ja: [string, string[], boolean][] = [
  ['koohii', ['コーヒー'], true],
  ['ko-hi-', ['コーヒー'], true],
  ['kore wa ikura desu ka', ['これはいくらですか'], true],
  ['hon o kudasai', ['ほんをください'], true],
  ['gakkoo', ['がっこう'], true],
  ['kore wa hon desu', ['それはほんです'], false],
]
for (const [g, d, beklenen] of ja) if (acceptsJa(g, d) !== beklenen) bildir(`acceptsJa("${g}", ${JSON.stringify(d)}) ≠ ${beklenen}`)

console.log(`${ceviri.length} çeviri sorusu, ${ornekler.length + ja.length} örnek denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
