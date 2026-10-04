// "Dilin temeli" sayfasının içeriğini (cumle-kur.ts, dil-temeli.ts) denetler: her yüklem biçiminde tek "|" var, ve elle
// yazılan romaji kana okunuşuyla aynı sesi veriyor (yazım hatası yakalamak için).
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-cumle-kur.ts
import { DONUSUM, GUNLUK, SORU_KELIMELERI, ZAMAN_KELIMELERI, ZAMIRLER, ZAMIR_EKLERI, ZAMIR_KURALLARI, type Bicim, type Satir } from '../src/content/ja/cumle-kur'
import { cevapDogruMu } from '../src/content/ja/unit-pekistirme'
import {
  CUMLE_BAGLAMA,
  CUMLE_TURLERI,
  DERECE,
  FIIL_GRUPLARI,
  ISIM_BAGLAMA,
  ISKELET,
  KELIME_TURLERI,
  RU_GORUNUMLU_U,
  SIFAT_KULLANIMI,
  SIKLIK,
  TEMEL_SIRA,
  YAPI_KURALLARI,
  ZIT_CIFTLER,
} from '../src/content/ja/dil-temeli'

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

// Dilin temeli
ISKELET.forEach((t) => satir('iskelet', t))
YAPI_KURALLARI.forEach((r) => r.ornekler?.forEach((o) => satir('yapı', o)))
CUMLE_TURLERI.forEach((c) => satir('cümle türü', c))
KELIME_TURLERI.forEach((k) => satir('kelime türü', k.ornek))
for (const f of [...FIIL_GRUPLARI.flatMap((g) => g.ornekler), ...RU_GORUNUMLU_U]) {
  toplam++
  const k = f.kana.split(' → ')
  const l = f.latin.split(' → ')
  if (k.length !== 2 || l.length !== 2 || !esit(l[0], k[0]) || !esit(l[1], k[1])) bildir(`fiil: romaji ≠ kana — ${f.latin} / ${f.kana}`)
}
SIFAT_KULLANIMI.forEach((k) => (satir('sıfat', k.i), satir('sıfat', k.na)))
ZIT_CIFTLER.forEach((c) => (satir('zıt', c.a), satir('zıt', c.b)))
ISIM_BAGLAMA.forEach((x) => satir('bağlaç', x))
CUMLE_BAGLAMA.forEach((x) => satir('bağlaç', x))
SIKLIK.forEach((x) => satir('sıklık', x))
DERECE.forEach((x) => satir('derece', x))
if (new Set(TEMEL_SIRA.map((x) => x.id)).size !== TEMEL_SIRA.length) bildir('temel sıra: tekrarlı kimlik')

console.log(`${toplam} satır denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
