// JLPT N5 resmî örnek sınavlarını (Official Practice Workbook) indirir.
//
//   npm run resmi:indir
//
// Kaynak: https://www.jlpt.jp/e/samples/sampleindex.html — ücretsiz yayımlanan,
// gerçek sınavlardan seçilmiş sorularla hazırlanmış iki tam set (2012, 2018).
//
// TELİF: soruların hakları Japonya Vakfı ve JEES'e ait; izinsiz yeniden
// yayımlanamaz. Bu yüzden dosyalar public/resmi/ altına iner ve o klasör
// .gitignore'da — depoya (herkese açık) HİÇBİR ZAMAN girmez, yalnızca bu
// bilgisayarda kişisel çalışma için kullanılır. Başka bir bilgisayarda bu
// komutu çalıştırmak yeter.
//
// Var olan ve boyutu tutan dosya yeniden indirilmez. Her dosyanın gerçekten
// PDF / MP3 olduğu ilk baytlarından denetlenir; site bir hata sayfası
// döndürürse sessizce bozuk dosya kalmasın.

import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'

const KOK = 'https://www.jlpt.jp/samples/'
const HEDEF = join('public', 'resmi')

interface Dosya {
  ad: string
  yol: string
}

const PDF = ['N5V', 'N5G', 'N5R', 'N5L', 'N5sheet', 'N5answer', 'N5script']

const SETLER: Record<string, Dosya[]> = {
  '2018': [
    ...PDF.map((p) => ({ ad: `${p}.pdf`, yol: `sample2018/pdf/${p}.pdf` })),
    ...[1, 2, 3, 4].map((n) => ({ ad: `N5Q${n}.mp3`, yol: `sample2018/mp3/N5Q${n}.mp3` })),
  ],
  '2012': [
    ...PDF.map((p) => ({ ad: `${p}.pdf`, yol: `sample2012/pdf/${p}.pdf` })),
    { ad: 'N5Q1.mp3', yol: 'sample2012/mp3/N5Q1.mp3' },
    // Sitede 2012 setinin 2. dinleme kaydı bu yolda duruyor
    { ad: 'N5Q2.mp3', yol: 'sample2017/mp3/N5Q2.mp3' },
    { ad: 'N5Q3.mp3', yol: 'sample2012/mp3/N5Q3.mp3' },
    { ad: 'N5Q4.mp3', yol: 'sample2012/mp3/N5Q4.mp3' },
  ],
}

function turDogru(ad: string, b: Uint8Array): boolean {
  if (ad.endsWith('.pdf')) return String.fromCharCode(...b.slice(0, 4)) === '%PDF'
  // MP3: ID3 etiketi ya da doğrudan çerçeve başlangıcı (0xFFEx)
  return String.fromCharCode(...b.slice(0, 3)) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)
}

async function indir(set: string, d: Dosya): Promise<number> {
  const hedef = join(HEDEF, set, d.ad)
  const url = KOK + d.yol
  const bas = await fetch(url, { method: 'HEAD' })
  const boyut = Number(bas.headers.get('content-length') ?? 0)
  if (existsSync(hedef) && boyut > 0 && statSync(hedef).size === boyut) {
    console.log(`  var      ${set}/${d.ad}`)
    return boyut
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  const veri = new Uint8Array(await res.arrayBuffer())
  if (!turDogru(d.ad, veri)) throw new Error(`${url} beklenen dosya türü değil`)
  mkdirSync(dirname(hedef), { recursive: true })
  writeFileSync(hedef, veri)
  console.log(`  indi     ${set}/${d.ad}  ${(veri.length / 1024 / 1024).toFixed(1)} MB`)
  return veri.length
}

let toplam = 0
for (const [set, dosyalar] of Object.entries(SETLER)) {
  console.log(`N5 resmî örnek sınavı ${set}:`)
  for (const d of dosyalar) toplam += await indir(set, d)
}

// ————————————————————— Cevap anahtarı —————————————————————
//
// N5answer.pdf metne çevrilip (pdftotext) ayrıştırılır; böylece uygulama
// cevapları kendisi puanlayabilir. Anahtar da telifli kitapçıktan türediği için
// public/resmi/ içinde kalır. pdftotext yoksa anahtar üretilmez — sayfa o
// zaman doğru sayısını elle girmeyi önerir.

type Anahtar = Record<'moji' | 'bunpou' | 'choukai', { mondai: number; no: number[]; cevap: number[] }[]>

function anahtarCikar(pdf: string): Anahtar | null {
  let metin: string
  try {
    metin = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', pdf, '-'], { encoding: 'utf8' })
  } catch {
    return null
  }
  // Tam genişlikli rakamları normale çevir
  metin = metin.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
  const bolumler: Anahtar = { moji: [], bunpou: [], choukai: [] }
  let bolum: keyof Anahtar | null = null
  let bekleyen: (number | '例')[] | null = null
  let mondai: Anahtar['moji'][number] | null = null

  for (const satir of metin.split(/\r?\n/)) {
    if (satir.includes('文字・語彙')) bolum = 'moji'
    else if (satir.includes('文法') && satir.includes('読解')) bolum = 'bunpou'
    else if (satir.includes('聴解')) bolum = 'choukai'
    if (!bolum) continue

    const m = satir.match(/問題\s*(\d+)(.*)$/)
    if (m) {
      mondai = { mondai: Number(m[1]), no: [], cevap: [] }
      bolumler[bolum].push(mondai)
      bekleyen = m[2].trim().split(/\s+/).filter(Boolean).map((t) => (t === '例' ? '例' : Number(t)))
      continue
    }
    const t = satir.trim()
    if (!t || !mondai) continue
    if (!/^[\d\s]+$/.test(t)) continue
    const parca = t.split(/\s+/)
    if (bekleyen) {
      // Cevap satırı: boşluklu ya da bitişik (dinlemede "３３１４２１４３")
      const cevap = (parca.length === 1 && parca[0].length > 1 ? [...parca[0]] : parca).map(Number)
      if (cevap.length === bekleyen.length && cevap.every((c) => c >= 1 && c <= 4)) {
        bekleyen.forEach((n, i) => {
          if (n === '例') return
          mondai!.no.push(n)
          mondai!.cevap.push(cevap[i])
        })
        bekleyen = null
      }
    } else {
      // Aynı mondai'nin devam eden soru numaraları ("11 12 13 …")
      bekleyen = parca.map(Number)
    }
  }
  return bolumler
}

for (const set of Object.keys(SETLER)) {
  const a = anahtarCikar(join(HEDEF, set, 'N5answer.pdf'))
  if (!a) {
    console.log(`  (pdftotext yok — ${set} anahtarı üretilmedi, puan elle girilir)`)
    continue
  }
  writeFileSync(join(HEDEF, set, 'anahtar.json'), JSON.stringify(a))
  const say = (b: keyof Anahtar) => a[b].map((x) => x.cevap.length).join('+')
  console.log(`  anahtar  ${set}: kelime ${say('moji')} · dilbilgisi-okuma ${say('bunpou')} · dinleme ${say('choukai')}`)
}

// Uygulama bu dosyaya bakarak setlerin bu bilgisayarda olup olmadığını anlar
writeFileSync(
  join(HEDEF, 'hazir.json'),
  JSON.stringify({ setler: Object.keys(SETLER), indirildi: new Date().toISOString(), kaynak: 'https://www.jlpt.jp/e/samples/sampleindex.html' }, null, 2),
)
console.log(`\nTamam: ${(toplam / 1024 / 1024).toFixed(1)} MB → ${HEDEF} (GitHub'a gitmez)`)
