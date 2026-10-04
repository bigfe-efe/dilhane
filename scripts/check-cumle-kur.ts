// "Cümle kur" içeriğini denetler: her yüklem biçiminde tek "|" var, ve elle
// yazılan romaji kana okunuşuyla aynı sesi veriyor (yazım hatası yakalamak için).
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-cumle-kur.ts
import { DONUSUM, GUNLUK, SORU_KELIMELERI, ZAMAN_KELIMELERI, ZAMIRLER, ZAMIR_EKLERI, ZAMIR_KURALLARI, type Bicim, type Satir } from '../src/content/ja/cumle-kur'
import { cevapDogruMu } from '../src/content/ja/unit-pekistirme'

let hata = 0
let toplam = 0
const bildir = (m: string) => (hata++, console.log(m))
// Uzun ünlü çizgisi romajide çift ünlü yazılıyor (koohii ↔ こーひー)
const hira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
const uzat = (kana: string) => hira(kana).replace(/([おこそとのほもよろごぞどぼぽょ])ー/g, '$1お').replace(/([いきしちにひみりぎじびぴ])ー/g, '$1い')
const esit = (latin: string, kana: string) => cevapDogruMu(latin.replace(/[…?]/g, ''), [uzat(kana).replace(/[…？]/g, '')])

const bicim = (yer: string, f: Bicim) => {
  toplam++
  for (const [ad, s] of Object.entries(f)) if (s.split('|').length !== 2) bildir(`${yer}: ${ad} "${s}" tek | içermeli`)
  if (!esit(f.latin.replace('|', ''), f.kana.replace('|', ''))) bildir(`${yer}: romaji ≠ kana — ${f.latin} / ${f.kana}`)
  if (/[一-鿿]/.test(f.kana)) bildir(`${yer}: kana alanında kanji — ${f.kana}`)
}
for (const c of DONUSUM) {
  if (!esit(c.bas.latin, c.bas.kana)) bildir(`${c.id}: baş romaji ≠ kana — ${c.bas.latin} / ${c.bas.kana}`)
  c.kibar.forEach((f, i) => bicim(`${c.id}/kibar${i}`, f))
  c.sade.forEach((f, i) => bicim(`${c.id}/sade${i}`, f))
  c.suren?.kibar.forEach((f, i) => bicim(`${c.id}/suren-kibar${i}`, f))
  c.suren?.sade.forEach((f, i) => bicim(`${c.id}/suren-sade${i}`, f))
  if (new Set(c.tr).size !== 4 || new Set(c.trSoru).size !== 4) bildir(`${c.id}: Türkçe karşılıklar tekrarlı`)
}
const satir = (yer: string, s: Satir) => {
  toplam++
  const kana = s.kana ?? s.ja
  if (/[一-鿿]/.test(kana)) return bildir(`${yer}: kana yok — ${s.ja}`)
  if (!esit(s.latin, kana)) bildir(`${yer}: romaji ≠ kana — ${s.latin} / ${kana}`)
}
ZAMAN_KELIMELERI.forEach((s) => satir('zaman', s))
ZAMIRLER.forEach((s) => satir('zamir', s))
ZAMIR_EKLERI.forEach((s) => satir('zamir-ek', s))
ZAMIR_KURALLARI.forEach((r) => r.ornek && satir('zamir-kural', r.ornek))
SORU_KELIMELERI.forEach((s) => satir('soru', s))
GUNLUK.forEach((g) => g.satirlar.forEach((s) => satir(g.baslik, s)))

console.log(`${toplam} satır denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
