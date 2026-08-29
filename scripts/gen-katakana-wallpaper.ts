/**
 * Katakana canlı duvar kâğıdı üretir.
 *
 *   npm run gen:katakana-wallpaper
 *
 * Çıktı: wallpaper/katakana/  →  index.html · project.json · preview.png
 *
 * HIRAGANA DUVAR KÂĞIDINDAN FARKI:
 *
 * 1. AYAR YOK. Hiragana sürümünde bir ayar paneli vardı ve tercihleri kalıcı
 *    kılmak için yerel bir sunucu (prefs.json) gerekiyordu — çünkü file://
 *    altında Chrome localStorage yazmalarını geciktiriyor ve bilgisayar
 *    kapanırken kaybediyordu. Burada ayar olmadığı için saklanacak bir şey de
 *    yok: sunucu, prefs.json, klavye kısayolları — hepsi kalktı. Dosya tek
 *    başına, hiçbir şeye bağlı olmadan çalışıyor.
 *
 * 2. AÇIKLAMALAR GECİKMESİZ. Hiragana sürümü önce harfi gösterip okunuşu
 *    sonra açıyordu (küçük bir sınav gibi). Burada her şey harfle aynı anda
 *    geliyor — duvar kâğıdı sınav değil, göz ucuyla bakılan bir şey.
 *
 * 3. HIRAGANA KARŞILIĞI GÖSTERİLİYOR. Katakana öğrenen birinin elindeki en
 *    güçlü dayanak, zaten bildiği hiraganadır. ア'nın yanında あ durunca
 *    "aynı ses, başka biçim" bağı kendiliğinden kuruluyor.
 *
 * 4. KARIŞAN ÇİFT UYARISI. Katakana hiraganadan daha çok karışır: harfler
 *    daha az çizgiden oluştuğu için ayırt edici ayrıntı az. シ/ツ, ソ/ン gibi
 *    çiftlerde ayrımın NE olduğu ekranda yazıyor.
 *
 * NEDEN ÜRETİLİYOR, ELLE YAZILMIYOR:
 * Dosya tamamen bağımsız olmalı — Wallpaper Engine ona tek bir dosya olarak
 * bakar, bizim dev sunucumuz çalışmıyor olacak. Bu yüzden kana tablosu, çizgi
 * verisi ve örnek kelimeler HTML'in içine gömülür. Veri uygulamada değişirse
 * bu script yeniden çalıştırılır; iki yerde ayrı liste tutulmaz.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { deflateSync } from 'node:zlib'
import { CONFUSING_PAIRS, HIRAGANA, KATAKANA } from '../src/content/ja/kana'
import { ALL_KATA_WORDS, kataReading } from '../src/content/ja/katakana-words'

const OUT_DIR = join('wallpaper', 'katakana')
const STROKES = join('public', 'strokes', 'kana.json')

interface StrokeData {
  s: string[]
  n: [number, number][]
  v: number
}

/**
 * Karışan çiftlerde ayrımın NE olduğu.
 *
 * "Bunlar karışır" demek yetmiyor; katakanada ayrım şeklin kendisinde değil
 * ÇİZGİNİN YÖNÜNDE. Yönü söylemeyen bir uyarı işe yaramaz, o yüzden en sık
 * karışan çiftler için ayrım elle yazıldı. Listede olmayan çiftler genel
 * açıklamaya düşer.
 */
const PAIR_HINT: Record<string, string> = {
  'シ|ツ': 'シ soldan sağa yatay başlar, noktaları YAN YANA. ツ yukarıdan aşağı iner, noktaları ÜST ÜSTE.',
  'ソ|ン': 'ン yataydan başlar (シ gibi), ソ dikey iner (ツ gibi). Aynı ayrım, iki nokta yerine bir çizgi.',
  'シ|ソ': 'İkisi de yataydan başlar; シ üç vuruşlu, ソ iki. Nokta sayısını say.',
  'ツ|ン': 'İkisi de sağa kıvrılır; ツ üç vuruşlu ve dikey iner, ン iki vuruşlu ve yataydan gelir.',
  'ク|ワ': 'ク’nun tepesi sivri köşe yapar, ワ’nın tepesi düz ve geniştir.',
  'ク|ケ': 'ケ’nin ortasından dikey bir çizgi iner, ク’da yoktur.',
  'ク|タ': 'タ’da fazladan bir kısa çizgi vardır; ク çıplaktır.',
  'ス|ヌ': 'ヌ’nun tepesinde yatay bir çizgi vardır, ス’da yoktur.',
  'ヌ|メ': 'ヌ yatay bir çizgiyle başlar; メ doğrudan çapraz iner.',
  'マ|ム': 'マ’nın tepesi kapalı bir köşe, ム’nun tepesi açık bir çengeldir.',
  'ア|マ': 'ア’da dikey çizgi aşağı uzar, マ’da kısa kalır ve sola kıvrılır.',
  'ナ|メ': 'ナ artı işareti gibi diktir; メ tamamen çaprazdır.',
  'チ|テ': 'テ iki yatay çizgiyle başlar, チ bir yatay çizgiyle.',
  'チ|タ': 'チ’de dikey çizgi ortadan iner; タ kapalı bir kutu gibidir.',
  'ウ|ワ': 'ウ’nun tepesinde küçük bir çizgi (şapka) vardır, ワ’da yoktur.',
  'ウ|フ': 'ウ kapalıdır ve şapkası vardır; フ tek bir kıvrımdır.',
  'ル|レ': 'ル iki parçalıdır, レ tek. レ, ル’nun sağ yarısıdır.',
  'レ|ノ': 'レ aşağı inip sağa yukarı kalkar; ノ sadece sola iner.',
  'コ|ユ': 'コ sağa bakan bir köşedir; ユ’nun altında yatay bir taban vardır.',
  'オ|ホ': 'ホ’nun altında iki küçük ayak vardır, オ’da yoktur.',
  'ニ|エ': 'エ’de iki yatay çizgiyi bir dikey bağlar; ニ’de bağ yoktur.',
  'セ|ヤ': 'セ’nin tabanı yatay uzanır; ヤ’nın kuyruğu aşağı sarkar.',
  'ラ|ヲ': 'ヲ’nun ortasında fazladan bir yatay çizgi vardır.',
  'ミ|ラ': 'ミ üç ayrı çizgidir; ラ birleşik bir kıvrımdır.',
}

const GENEL_IPUCU =
  'Katakanada ayrım şeklin kendisinde değil çizginin yönündedir. Çizgi sırasını bilirsen karışmaz.'

function build() {
  if (!existsSync(STROKES)) {
    console.error(`Çizgi verisi yok: ${STROKES}\nÖnce "npm run gen:strokes" çalıştır.`)
    process.exit(1)
  }
  const strokes: Record<string, StrokeData> = JSON.parse(readFileSync(STROKES, 'utf8'))

  // Aynı sesin hiragana karşılığı — okunuş üzerinden eşleşiyor
  const hiraByRomaji = new Map(HIRAGANA.map((k) => [k.romaji, k.char]))

  // Karışan çiftler: her karakter için partnerleri
  const confused = new Map<string, string[]>()
  for (const [a, b] of CONFUSING_PAIRS) {
    if (!/[ァ-ヿ]/.test(a)) continue
    confused.set(a, [...(confused.get(a) ?? []), b])
    confused.set(b, [...(confused.get(b) ?? []), a])
  }
  const pairHint = (a: string, b: string) =>
    PAIR_HINT[`${a}|${b}`] ?? PAIR_HINT[`${b}|${a}`] ?? GENEL_IPUCU

  // Örnek kelime: karakterle BAŞLAYAN kelime tercih edilir, yoksa içinde geçen.
  // Baştaki karakter daha kolay fark edilir; ortada kaybolur.
  const wordFor = (c: string) => {
    const w =
      ALL_KATA_WORDS.find((x) => x.kana.startsWith(c)) ?? ALL_KATA_WORDS.find((x) => x.kana.includes(c))
    return w ? { k: w.kana, r: kataReading(w.kana), f: w.from, t: w.tr } : null
  }

  const data = KATAKANA.map((k) => {
    const chars = [...k.char]
    const es = (confused.get(k.char) ?? []).slice(0, 2).map((p) => ({
      c: p,
      r: KATAKANA.find((x) => x.char === p)?.romaji ?? '',
      h: pairHint(k.char, p),
    }))
    return {
      c: k.char,
      r: k.romaji,
      t: k.trHint,
      m: k.mnemonic ?? '',
      g: k.group,
      k: k.kind,
      h: hiraByRomaji.get(k.romaji) ?? '',
      // Çizgi yolları — birden çok karakterli yōon'da yan yana dizilir
      p: chars.flatMap((ch, i) => (strokes[ch]?.s ?? []).map((d) => ({ d, ox: i * 109 }))),
      // Çizgi başlangıç noktaları — ekranda numaralı daire olarak çizilir.
      // Numara HER KARAKTERDE 1'den başlar: キャ gibi iki karakterli yōon'da
      // 1-2-3-4-5 diye devam etseydi ikinci karakterin kendi çizgi sırası
      // yanlış görünürdü.
      n: chars.flatMap((ch, ci) =>
        (strokes[ch]?.n ?? []).map(([x, y], si) => ({ x: x + ci * 109, y, i: si + 1 })),
      ),
      w: chars.length,
      e: es,
      d: wordFor(k.char),
    }
  })

  const html = TEMPLATE.replace('/*__DATA__*/', JSON.stringify(data))

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf8')
  writeFileSync(join(OUT_DIR, 'project.json'), JSON.stringify(PROJECT, null, 2), 'utf8')
  writeFileSync(join(OUT_DIR, 'preview.png'), previewPng())

  const kb = Math.round(Buffer.byteLength(html) / 1024)
  const ipucu = data.filter((d) => d.e.length).length
  const kelime = data.filter((d) => d.d).length
  console.log(`${OUT_DIR}/ yazıldı`)
  console.log(`  index.html   ${data.length} karakter · ${kb} KB`)
  console.log(`  ${ipucu} karakterde karışan çift uyarısı, ${kelime} karakterde örnek kelime`)
  console.log(`  project.json + preview.png (Wallpaper Engine için)`)

  syncToWallpaperEngine()
}

/**
 * Wallpaper Engine klasörüne de kopyalar.
 *
 * NEDEN: duvar kâğıdı oraya bir KOPYA olarak gidiyor. Burada üretip elle
 * kopyalamayı unutunca ekranda eski sürüm kalıyor ve "düzelttim ama
 * değişmedi" durumu çıkıyor — bir kez yaşandı.
 *
 * Yol önce DILHANE_WE_DIR ortam değişkeninden okunur; yoksa bilinen Steam
 * konumları taranır. Kişisel yol depoya yazılmıyor. Ne yapıldığı ekrana
 * basılıyor, sessizce bir yere dosya yazmasın.
 */
function syncToWallpaperEngine() {
  const rel = join('steamapps', 'common', 'wallpaper_engine', 'projects', 'myprojects')
  const adaylar = process.env.DILHANE_WE_DIR
    ? [process.env.DILHANE_WE_DIR]
    : // Sürücü kökü path.sep ile kuruluyor, elle ters bölü yazılmıyor:
      // join('D:', 'SteamLibrary') sürücüye GÖRELİ bir yol verir (D:SteamLibrary),
      // mutlak yol için ayıracın kendisi gerekiyor.
      ['C:', 'D:', 'E:', 'F:'].flatMap((d) => [
        join(d + sep, 'SteamLibrary', rel),
        join(d + sep, 'Program Files (x86)', 'Steam', rel),
      ])

  const kok = adaylar.find((d) => existsSync(d))
  if (!kok) {
    console.log('')
    console.log('Wallpaper Engine klasörü bulunamadı — kopyalanmadı.')
    console.log('Yolu biliyorsan: DILHANE_WE_DIR=... npm run gen:katakana-wallpaper')
    return
  }

  const hedef = join(kok, 'dilhane-katakana')
  if (!existsSync(hedef)) mkdirSync(hedef, { recursive: true })
  for (const f of ['index.html', 'project.json', 'preview.png']) {
    copyFileSync(join(OUT_DIR, f), join(hedef, f))
  }
  console.log('')
  console.log(`Wallpaper Engine'e kopyalandı:`)
  console.log(`  ${hedef}`)
  console.log(`Duvar kâğıdı açıksa Wallpaper Engine'de bir kez yeniden seç.`)
}

/** Wallpaper Engine manifest'i — klasör doğrudan içe aktarılabilsin diye. */
const PROJECT = {
  title: 'Dilhane — Katakana',
  description:
    'Katakana harfleri sırayla, çizgi sırası canlandırmasıyla. Okunuş, hiragana karşılığı, karışan çift uyarısı ve örnek kelime her harfle birlikte görünür.',
  type: 'web',
  file: 'index.html',
  preview: 'preview.png',
  visibility: 'private',
  tags: ['Abstract', 'Minimalistic'],
  general: { properties: {} },
}

// ————————————————————————— Önizleme görseli —————————————————————————
//
// Wallpaper Engine kütüphanede bir önizleme bekliyor. Elde yazı çizecek bir
// font rasterleyici olmadığı için görsel soyut tutuldu: duvar kâğıdının
// zemini ve vurgu rengiyle bir degrade. İstenirse ekran görüntüsüyle
// değiştirilebilir — dosya adı aynı kalsın yeter.

function crc32(buf: Buffer): number {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function previewPng(): Buffer {
  const W = 800
  const H = 450
  const rows: Buffer[] = []
  for (let y = 0; y < H; y++) {
    const row = Buffer.alloc(1 + W * 3)
    row[0] = 0 // filtre yok
    for (let x = 0; x < W; x++) {
      // Sıcak siyah zemin, ortada kaki bir ışık halesi
      const dx = (x - W * 0.42) / (W * 0.5)
      const dy = (y - H * 0.45) / (H * 0.6)
      const glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy))
      const g2 = glow * glow
      const i = 1 + x * 3
      row[i] = Math.round(16 + 208 * g2 * 0.55)
      row[i + 1] = Math.round(14 + 113 * g2 * 0.45)
      row[i + 2] = Math.round(13 + 79 * g2 * 0.4)
    }
    rows.push(row)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8 // bit derinliği
  ihdr[9] = 2 // renk tipi: truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const TEMPLATE = String.raw`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Katakana</title>
<style>
  /* Renkler uygulamayla aynı: sıcak mürekkep siyahı + kaki (柿色) vurgu.
     Duvar kâğıdı ile uygulama aynı dünyaya ait görünsün. */
  :root {
    --bg: #100e0d;
    --surface: #1a1817;
    --line: rgba(240,228,218,.08);
    --text: #efe9e3;
    --dim: #aaa199;
    --faint: #746b64;
    --accent: #e0714f;
    --accent-soft: rgba(224,113,79,.13);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: 'Segoe UI', -apple-system, Roboto, Arial, sans-serif;
    cursor: none;                 /* masaüstünde imleç görünmesin */
    user-select: none;
  }

  /* Zeminde çok yavaş süzülen bir ışık. Tamamen durağan bir ekran, saatlerce
     açık kalınca ölü görünüyor; bu hareket fark edilmeyecek kadar yavaş ama
     ekranı canlı tutuyor. Ayrıca sabit parlak alan bırakmadığı için OLED
     yanmasına da karşı koruyor. */
  #glow {
    position: fixed; inset: -20%;
    background:
      radial-gradient(38vw 38vw at 30% 40%, rgba(224,113,79,.10), transparent 70%),
      radial-gradient(30vw 30vw at 72% 66%, rgba(224,113,79,.05), transparent 70%);
    animation: drift 90s ease-in-out infinite alternate;
    pointer-events: none;
  }
  @keyframes drift {
    0%   { transform: translate(0,0) scale(1); }
    50%  { transform: translate(3vw,-2vh) scale(1.08); }
    100% { transform: translate(-2vw,2vh) scale(1.02); }
  }

  /* MASAÜSTÜ GERÇEKLERİ:
     Bu bir duvar kâğıdı, boş bir tuval değil. İki şey ekranı yiyor:
       • Görev çubuğu — Wallpaper Engine duvar kâğıdını onun ARKASINA çizer,
         yani alttaki ~48px görünmez. İlk sürümde örnek kelime kartının altı
         çubuğun altında kalıyordu.
       • Masaüstü simgeleri — üst sıra ve sağ sütun dolu olur. İlk sürümde üst
         şerit ("DİLHANE · KATAKANA") simgelerin arkasında kalıyordu.
     Çözüm: üst şerit tamamen kaldırıldı, içeriği alt bloğa taşındı; altta da
     görev çubuğu kadar güvenli boşluk bırakıldı. Geriye kalan alan (orta ve
     sol-alt) masaüstünde neredeyse her zaman boştur. */
  #app {
    position: relative; height: 100%;
    display: grid;
    grid-template-rows: 1fr auto auto;
    padding: 8vh 4vw calc(3vh + 56px);
  }

  #meta { display: flex; align-items: baseline; gap: 1.4vw; }
  #brand { font-size: 1.4vh; letter-spacing: .3em; text-transform: uppercase; color: var(--faint); }
  #row { font-size: 1.8vh; color: var(--accent); letter-spacing: .04em; }
  #count { font-size: 1.4vh; color: var(--faint); font-variant-numeric: tabular-nums; }

  /* Kalan süre çubuğu artık EN ALTTA, görev çubuğunun hemen üstünde. Üstteyken
     simge etiketlerinin arasında kayboluyordu. */
  #bar { height: 2px; background: var(--line); border-radius: 2px; overflow: hidden; margin-top: 2.2vh; }
  #bar > i { display: block; height: 100%; width: 100%; background: var(--accent); transform-origin: left; }

  /* ————— Orta: harf ————— */
  #stage {
    display: grid; grid-template-columns: auto auto; align-items: center;
    justify-content: center; gap: 4vw; min-height: 0;
  }
  #glyphWrap { position: relative; display: grid; place-items: center; }
  /* Harf yuksekligi ust bosluga gore kisildi: 8vh'lik ust pay simge sirasini
     temizliyor, harf de o payi asmasin diye 48vh'e indi. */
  #glyph { height: min(48vh, 34vw); width: auto; display: block; overflow: visible; }
  #glyph path {
    fill: none; stroke: var(--text);
    stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round;
  }
  /* Numaralı başlangıç noktası. Numara koyu, daire vurgu renginde — koyu
     zeminde en okunur birleşim bu. Rakam çizgiden büyük görünmesin diye
     daire yarıçapı çizgi kalınlığına yakın tutuldu. */
  #glyph g.dot { opacity: 0; }
  #glyph g.dot circle { fill: var(--accent); }
  #glyph g.dot text {
    fill: #100e0d;
    font-size: 8px;
    font-weight: 700;
    font-family: 'Segoe UI', Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: central;
    /* Rakam SVG ölçeğinde çizilir; kullanıcı seçemesin diye devre dışı */
    pointer-events: none;
  }

  /* Hiragana karşılığı — "bunu zaten biliyorsun" çıpası.
     Bilerek soluk: asıl gösterilen katakana, bu yalnızca bağ kurdurur. */
  #anchor { display: grid; gap: .8vh; justify-items: center; }
  #anchorKana {
    font-size: 13vh; line-height: 1; color: var(--faint);
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif;
  }
  #anchorLabel { font-size: 1.4vh; color: var(--faint); letter-spacing: .1em; }

  /* ————— Alt: açıklamalar —————
     Harfle AYNI ANDA görünür. Duvar kâğıdı bir sınav değil; bilgiyi
     saklamanın anlamı yok, göz ucuyla bakılıp geçilecek. */
  #info { display: grid; gap: 1.6vh; }
  #readingRow { display: flex; align-items: baseline; gap: 1.6vw; flex-wrap: wrap; }
  #romaji { font-size: 6.4vh; font-weight: 700; letter-spacing: .04em; color: var(--accent); line-height: 1; }
  #tr { font-size: 2.4vh; color: var(--dim); }
  #kind { font-size: 1.5vh; color: var(--faint); letter-spacing: .12em; text-transform: uppercase; }

  /* Kartlar esnek ama SINIRLI genislikte. Onceden grid-auto-columns:1fr idi;
     tek kart kaldiginda 1400px'e yayilip iki satirlik metin bir satira
     dagiliyordu. Simdi kart genisligi sabit araliga bagli, kartlar soldan
     diziliyor. */
  #cards { display: flex; gap: 1.4vw; align-items: stretch; flex-wrap: nowrap; }
  .card { flex: 0 1 clamp(18vw, 27vw, 32vw); }
  .card {
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 1.2vh; padding: 1.6vh 1.6vw;
    display: grid; gap: .7vh; align-content: start;
  }
  .card.is-warn { border-color: rgba(224,113,79,.34); background: var(--accent-soft); }
  .cardLabel { font-size: 1.3vh; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
  .cardBody { font-size: 1.95vh; line-height: 1.5; color: var(--text); }
  .cardBody .muted { color: var(--dim); }
  /* Örnek kelimede o anki harf vurgulanır: ム'yu アイスクリーム içinde
     aramak zaman alıyordu, renkli olunca göz doğrudan buluyor. */
  .hit { color: var(--accent); }
  .jaBig {
    font-size: 3.4vh; letter-spacing: .06em;
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif;
  }
  .pairRow { display: flex; align-items: baseline; gap: .8vw; }
  .pairKana { font-size: 3.2vh; color: var(--accent);
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif; }

  /* Geçiş: içerik topluca solup yeniden beliriyor. Tek tek animasyon
     dikkati parçalıyordu. */
  #app.is-out #stage, #app.is-out #info { opacity: 0; transform: translateY(.8vh); }
  #stage, #info { transition: opacity .45s ease, transform .45s ease; }
</style>
</head>
<body>
<div id="glow"></div>

<div id="app">
  <div id="stage">
    <div id="glyphWrap"><svg id="glyph" viewBox="0 0 109 109" aria-hidden="true"></svg></div>
    <div id="anchor">
      <div id="anchorKana"></div>
      <div id="anchorLabel">hiragana karşılığı</div>
    </div>
  </div>

  <div id="info">
    <div id="meta">
      <span id="brand">Dilhane · Katakana</span>
      <span id="row"></span>
      <span id="count"></span>
    </div>
    <div id="readingRow">
      <span id="romaji"></span>
      <span id="tr"></span>
      <span id="kind"></span>
    </div>
    <div id="cards"></div>
  </div>

  <div id="bar"><i id="barFill"></i></div>
</div>

<script>
const DATA = /*__DATA__*/;

// ————————————————————————— Deste —————————————————————————
//
// Saf rastgele seçim aynı harfi üst üste iki kez gösterebiliyor ve bazı
// harfler günlerce hiç çıkmayabiliyor. Onun yerine deste karılıp sırayla
// tüketiliyor, bitince yeniden karılıyor: hem rastgele hem de her harfin
// çıkacağı garanti.
//
// Ağırlık: temel 46 harf, dakuten'li ve yōon'lulardan daha sık çıkar. Sebep
// pedagojik — katakanayı yeni öğrenen biri için キャ, カ oturmadan gürültüdür.
const WEIGHT = { base: 3, dakuten: 2, handakuten: 2, yoon: 1 };

function buildDeck() {
  const deck = [];
  for (const d of DATA) {
    const n = WEIGHT[d.k] || 1;
    for (let i = 0; i < n; i++) deck.push(d);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

let deck = buildDeck();
let pos = 0;
let seen = 0;

function nextCard() {
  if (pos >= deck.length) { deck = buildDeck(); pos = 0; }
  // Karıştırma sonrası aynı harfin arka arkaya gelmesini engelle
  if (pos > 0 && deck[pos] === deck[pos - 1] && pos + 1 < deck.length) pos++;
  seen++;
  return deck[pos++];
}

// ————————————————————————— Çizgi canlandırması —————————————————————————
//
// Her çizgi sırayla çiziliyor. Katakanada çizgi YÖNÜ karışan çiftleri ayıran
// asıl şey (シ/ツ), o yüzden bu animasyon süs değil, öğretici kısmın kendisi.
// Başlangıç noktaları da yanıp sönüyor ki "nereden başlıyor" görünsün.
const glyph = document.getElementById('glyph');

function drawGlyph(item) {
  glyph.setAttribute('viewBox', '0 0 ' + (109 * item.w) + ' 109');
  glyph.innerHTML = '';

  const paths = item.p.map((p) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', p.d);
    if (p.ox) el.setAttribute('transform', 'translate(' + p.ox + ',0)');
    glyph.appendChild(el);
    return el;
  });

  // Başlangıç noktaları NUMARALI. Önce hepsi aynı boş daireydi ve kaçıncı
  // çizgi olduğu ancak canlandırmayı baştan izleyerek anlaşılıyordu; duvar
  // kâğıdına ortasından bakan biri sırayı kaçırıyordu. Numara, tek bakışta
  // "buradan başla, sonra şuraya" diyor.
  const ns = 'http://www.w3.org/2000/svg';
  const dots = item.n.map((n) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'dot');

    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', n.x);
    c.setAttribute('cy', n.y);
    c.setAttribute('r', '6.4');
    g.appendChild(c);

    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', n.x);
    t.setAttribute('y', n.y);
    t.textContent = n.i;
    g.appendChild(t);

    glyph.appendChild(g);
    return g;
  });

  // Toplam ~1.8 saniye: harfin ekranda kaldığı sürenin dörtte biri kadar.
  // Daha hızlısı yön hissini vermiyor, daha yavaşı bekletiyor.
  const total = 1800;
  const per = total / Math.max(1, paths.length);

  paths.forEach((el, i) => {
    const len = el.getTotalLength();
    el.style.transition = 'none';
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    // Bir sonraki karede başlat; aksi hâlde tarayıcı geçişi atlıyor
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset ' + per + 'ms ease-out ' + (i * per) + 'ms';
      el.style.strokeDashoffset = '0';
    });
    const dot = dots[i];
    if (dot) {
      dot.style.transition = 'none';
      dot.style.opacity = '0';
      requestAnimationFrame(() => {
        dot.style.transition = 'opacity 200ms ease ' + (i * per) + 'ms';
        dot.style.opacity = '.85';
      });
    }
  });
}

// ————————————————————————— Ekranı doldur —————————————————————————
const app = document.getElementById('app');
const el = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const KIND_TR = { base: 'temel', dakuten: 'dakuten ゛', handakuten: 'handakuten ゜', yoon: 'yōon' };

// Kelime içinde o anki harfi renklendirir. Kaçış işlemi parça parça yapılıyor
// ki eklenen etiketler kaçırılmasın.
function mark(word, ch) {
  return [...word]
    .map((c) => (c === ch ? '<span class="hit">' + esc(c) + '</span>' : esc(c)))
    .join('');
}

function render(item) {
  el('row').textContent = item.g;
  // Çizgi sayısı: canlandırmayla doğrudan ilgili ve öğretici. Önce "5. harf"
  // yazıyordu — hangi harfte olduğun bilgisi bir duvar kâğıdında işe yaramaz.
  el('count').textContent = item.n.length + ' çizgi';
  el('romaji').textContent = item.r;
  el('tr').textContent = item.t ? 'Türkçe okunuşu: ' + item.t : '';
  el('kind').textContent = KIND_TR[item.k] || '';

  el('anchorKana').textContent = item.h || '';
  el('anchor').style.visibility = item.h ? 'visible' : 'hidden';

  drawGlyph(item);

  const cards = [];

  if (item.m) {
    cards.push(
      '<div class="card"><div class="cardLabel">Hatırlatıcı</div>' +
      '<div class="cardBody">' + esc(item.m) + '</div></div>'
    );
  }

  if (item.d) {
    cards.push(
      '<div class="card"><div class="cardLabel">Örnek kelime</div>' +
      '<div class="cardBody"><span class="jaBig">' + mark(item.d.k, item.c) + '</span></div>' +
      '<div class="cardBody muted">' + esc(item.d.r) + ' ← ' + esc(item.d.f) + '</div>' +
      '<div class="cardBody muted">' + esc(item.d.t) + '</div></div>'
    );
  }

  for (const p of item.e) {
    cards.push(
      '<div class="card is-warn"><div class="cardLabel">Karıştırma</div>' +
      '<div class="pairRow"><span class="pairKana">' + esc(item.c) + ' / ' + esc(p.c) + '</span>' +
      '<span class="cardBody muted">' + esc(item.r) + ' / ' + esc(p.r) + '</span></div>' +
      '<div class="cardBody muted">' + esc(p.h) + '</div></div>'
    );
  }

  // EN FAZLA ÜÇ kart. シ gibi iki ayrı karışan çifti olan harflerde dört kart
  // çıkıyor, ikinci satıra sarıyor ve harfin alanını yiyordu. Sıra önem
  // sırasıdır: hatırlatıcı, örnek kelime, sonra karıştırma uyarıları.
  el('cards').innerHTML = cards.slice(0, 3).join('');
}

// ————————————————————————— Döngü —————————————————————————
//
// Her harf 6–8 saniye. Sabit süre metronom gibi olup dikkati kaçırıyor;
// hafif değişken süre daha doğal duruyor. Ayar yok — istenen buydu.
const MIN_MS = 6000;
const MAX_MS = 8000;
const FADE = 450;

const barFill = document.getElementById('barFill');
let timer = null;

function show() {
  const item = nextCard();
  const hold = MIN_MS + Math.random() * (MAX_MS - MIN_MS);

  app.classList.remove('is-out');
  render(item);

  // Kalan süre çubuğu — CSS animasyonu yerine doğrudan transform, çünkü
  // her turda süre değişiyor.
  barFill.style.transition = 'none';
  barFill.style.transform = 'scaleX(1)';
  requestAnimationFrame(() => {
    barFill.style.transition = 'transform ' + hold + 'ms linear';
    barFill.style.transform = 'scaleX(0)';
  });

  // İKİ zamanlayıcı da aynı değişkende tutuluyor. Önce iç setTimeout takip
  // edilmiyordu: sekme görünürlüğü tam solma anında değişirse dış zamanlayıcı
  // temizleniyor ama iç olan yine de show() çağırıyor ve iki döngü birden
  // dönmeye başlıyordu — harfler beklenenin iki katı hızda geçiyordu.
  timer = setTimeout(() => {
    app.classList.add('is-out');
    timer = setTimeout(show, FADE);
  }, hold);
}

// Sekme arkaplandayken tarayıcı zamanlayıcıyı kısıyor ve geri dönünce
// birikmiş turlar peş peşe akıyor. Görünür olunca döngü baştan kurulur.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { clearTimeout(timer); }
  else { clearTimeout(timer); app.classList.remove('is-out'); show(); }
});

show();
</script>
</body>
</html>`

build()
