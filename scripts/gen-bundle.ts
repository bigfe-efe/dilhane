// Bütün kaynak kodu tek bir metin dosyasında toplar — başka bir modele
// inceletmek için.
//
// NE DAHİL, NE DEĞİL:
// Üretilmiş dosyalar (print/*.html, wallpaper/hiragana.html), veri dökümleri
// (public/strokes/*.json), package-lock ve node_modules dışarıda bırakılır.
// Bunlar hem çok yer kaplar hem de incelenecek bir şey içermez — çizgi verisi
// KanjiVG'den gelir, HTML'ler scriptlerin çıktısıdır. Scriptlerin KENDİSİ
// dahildir, çünkü asıl mantık orada.
//
// Çıktının başına bir "brifing" konur: projenin ne olduğu ve hangi kararların
// bilerek alındığı. Bu olmadan incelemeyi yapan taraf zaten bilinen şeyleri
// tekrar önerir (İngilizceyi kaldır, Genki metni ekle gibi).

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { dirname, join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT = join(ROOT, 'dilhane-kaynak.txt')

/** Tek tek eklenen dosyalar — sıra önemli, önce bağlam sonra kod. */
const SINGLES = [
  'README.md',
  'NOTICE.md',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.scripts.json',
  'index.html',
]

/** Klasör olarak taranacaklar */
const DIRS = [
  { path: 'src', exts: ['.ts', '.tsx', '.css'] },
  { path: 'scripts', exts: ['.ts', '.mjs'] },
]

/** Sonda, bağlam olarak — Windows tarafındaki yardımcılar */
const TAIL = ['Dilhane.bat', 'Hiragana duvar kagidi.bat', 'Yazdirilabilir kagitlar.bat', 'wallpaper/launch.ps1']

const BRIEF = `Bu dosya "Dilhane" adlı kişisel bir web uygulamasının TAM kaynak kodudur.
Amaç: ikinci bir gözle incelenmesi. Aşağıdaki bağlamı okumadan yorum yapma —
bilerek alınmış kararları "hata" sanmamak için gerekli.

NE OLDUĞU
  Türkçe konuşan bir kişinin sıfırdan Japonca öğrenmesi için yapılmış, tamamen
  çevrimdışı çalışan bir PWA. Vite + React 18 + TypeScript, veri Dexie
  (IndexedDB) ile cihazda tutulur, hiçbir yere sunucu isteği gitmez.
  Tek kullanıcı için yapılmıştır; çok kullanıcılı senaryo, kimlik doğrulama,
  sunucu tarafı yoktur ve olmayacaktır.

BİLEREK ALINMIŞ KARARLAR (bunları "eksik" diye raporlama)
  1. Arayüz ve anlatım TAMAMEN TÜRKÇE. Uygulama tek dillidir: yalnızca Japonca
     öğretir. Daha önce bir İngilizce rayı vardı, bilerek kaldırıldı.
  2. Hedef makinede Japonca TTS sesi KURULU DEĞİL. ja-JP seslendirme sessizce
     yutulduğu için kana→romaji→Türkçe yazım çevrimiyle Türkçe sesle "yaklaşık
     okuma" yapılıyor (src/lib/ja-phonetic.ts). Bu bir kusur değil, bilinçli
     bir geri düşüş; arayüzde ≈ işaretiyle belirtiliyor.
  3. Testlerde doğru cevap SINAV BİTENE KADAR gösterilmez. Anında geri bildirim
     öğretir ama ölçmez; buradaki amaç ölçmek.
  4. Ders sırası Genki I (3. baskı) müfredat SIRASINI izler. Kitaptan hiçbir
     metin, örnek cümle veya kelime listesi aktarılmamıştır (telif). Anlatımların
     tamamı projeye özgüdür.
  5. public/strokes/*.json KanjiVG'den türetilmiştir (CC BY-SA 3.0). Bu dosyalar
     bu döküme DAHİL DEĞİLDİR (veri, kod değil).
  6. Emoji kullanılmaz; ikonlar src/components/icons.tsx içinde SVG olarak.
  7. .bat dosyaları yalnızca ASCII içerir — cmd.exe kendi kod sayfasıyla
     ayrıştırdığı için Türkçe karakter komutları bozuyor.

ÖZELLİKLE BAKILMASI İSTENENLER
  - Mantık hataları, sınır durumları (boş liste, tek elemanlı seçim, bölme
    sıfıra, tarih/saat dilimi)
  - React: gereksiz yeniden çizim, kaçak state, useEffect bağımlılıkları,
    liste anahtarları
  - Aralıklı tekrar mantığı (src/lib/srs.ts) — SM-2 türevi, doğru mu
  - Sınav üretimi ve puanlama (src/content/ja/exam.ts, src/pages/KanaQuiz.tsx):
    çeldirici seçimi adil mi, puanlama tutarlı mı
  - Japonca dilbilgisi/okunuş doğruluğu (içerik dosyaları) — özellikle
    src/content/ja/ altındaki açıklamalar ve örnekler
  - Erişilebilirlik ve mobil dokunma hedefleri
  - Ölü kod, tekrar eden mantık, birleştirilebilecek yerler

DOSYA BİÇİMİ
  Her dosya şu ayraçla başlar:
    ===== DOSYA: <yol> (<satır> satır) =====
  Sıralama: önce belgeler ve yapılandırma, sonra src/, sonra scripts/, en sonda
  Windows yardımcı dosyaları.
`

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, exts))
    else if (exts.includes(extname(entry.name))) out.push(full)
  }
  return out
}

const parcalar: string[] = []
const dosyalar: { yol: string; satir: number; bayt: number }[] = []

function ekle(abs: string) {
  let icerik: string
  try {
    icerik = readFileSync(abs, 'utf8')
  } catch {
    return
  }
  const yol = relative(ROOT, abs).replace(/\\/g, '/')
  const satir = icerik.split('\n').length
  dosyalar.push({ yol, satir, bayt: statSync(abs).size })
  parcalar.push(`\n\n===== DOSYA: ${yol} (${satir} satır) =====\n\n${icerik.replace(/\s+$/, '')}\n`)
}

for (const f of SINGLES) ekle(join(ROOT, f))
for (const d of DIRS) for (const f of walk(join(ROOT, d.path), d.exts)) ekle(f)
for (const f of TAIL) ekle(join(ROOT, f))

// İçindekiler, gövde hazır olduktan sonra yazılır ki sayılar doğru olsun
const toplamSatir = dosyalar.reduce((a, d) => a + d.satir, 0)
const icindekiler = dosyalar.map((d) => `  ${d.yol}  (${d.satir} satır)`).join('\n')

const cikti =
  `${'='.repeat(78)}\nDİLHANE — TAM KAYNAK KODU\n` +
  `Üretim tarihi: ${new Date().toISOString().slice(0, 10)}\n` +
  `${dosyalar.length} dosya · ${toplamSatir.toLocaleString('tr-TR')} satır\n` +
  `Depo: https://github.com/bigfe-efe/dilhane\n${'='.repeat(78)}\n\n` +
  BRIEF +
  `\n${'='.repeat(78)}\nİÇİNDEKİLER\n${'='.repeat(78)}\n\n${icindekiler}\n\n` +
  `${'='.repeat(78)}\nKAYNAK\n${'='.repeat(78)}\n` +
  parcalar.join('')

writeFileSync(OUT, cikti, 'utf8')

console.log(`dilhane-kaynak.txt yazıldı`)
console.log(`  ${dosyalar.length} dosya · ${toplamSatir.toLocaleString('tr-TR')} satır · ${(cikti.length / 1024).toFixed(0)} KB`)
console.log(`  yaklaşık ${Math.round(cikti.length / 3.5).toLocaleString('tr-TR')} token`)
