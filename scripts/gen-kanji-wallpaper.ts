/**
 * N5 kanji canlı duvar kâğıdı üretir.
 *
 *   npm run gen:kanji-wallpaper
 *
 * Çıktı: wallpaper/kanji/  →  index.html · project.json · preview.png
 *
 * KATAKANA SÜRÜMÜNDEN FARKI — ve neden aynı şablonu kopyalamak yetmedi:
 *
 * 1. TEK BİR OKUNUŞ YOK. Katakanada ア'nın karşılığı "a"dır, biter. Kanjide
 *    okunuş kelimeye göre değişir: 人 tek başına hito, 三人'de nin, 日本人'de
 *    jin. Bu yüzden karakterin altına büyük puntoyla tek bir okunuş yazmak
 *    doğrudan YANLIŞ bir şey öğretirdi. Onun yerine on'yomi ve kun'yomi ayrı
 *    ayrı etiketli duruyor, asıl yük de örnek kelimelerde: okunuşun değiştiğini
 *    ancak yan yana duran kelimeler gösterebilir.
 *
 * 2. ANLAM ASIL ÇIPADIR. Katakanada karakterin yanında hiragana karşılığı
 *    duruyordu ("bunu zaten biliyorsun"). Kanjide böyle bir dayanak yok;
 *    yerine Türkçe anlam kondu, çünkü kanjide öğrenilen şey ses değil anlam.
 *
 * 3. ÇİZGİ SAYISI ÇOK DEĞİŞKEN. Kana 1–4 çizgiydi, kanji 1–18. Sabit süreli
 *    canlandırma 曜'de (18 çizgi) çizgi başına 100 ms'ye düşüp izlenemez
 *    oluyordu; süre artık çizgi sayısına göre ölçekleniyor. Aynı sebeple
 *    numaralı daireler kalabalık karakterlerde küçülüyor, yoksa üst üste
 *    binip rakamlar okunmuyordu.
 *
 * 4. DAHA UZUN BEKLEME. Okunacak şey arttı (anlam + iki okunuş dizisi + üç
 *    kelime), 6–8 saniye yetmiyordu. 9–12 saniye.
 *
 * NEDEN ÜRETİLİYOR, ELLE YAZILMIYOR:
 * Dosya tamamen bağımsız olmalı — Wallpaper Engine ona tek bir dosya olarak
 * bakar, bizim dev sunucumuz çalışmıyor olacak. Kanji tablosu, çizgi verisi
 * ve örnek kelimeler HTML'in içine gömülür. Veri uygulamada değişirse bu
 * script yeniden çalıştırılır; iki yerde ayrı liste tutulmaz.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { deflateSync } from 'node:zlib'
import { buildKanjiCards } from './lib/kanji-data'

const OUT_DIR = join('wallpaper', 'kanji')
const STROKES = join('public', 'strokes', 'kanji.json')

function build() {
  if (!existsSync(STROKES)) {
    console.error(`Çizgi verisi yok: ${STROKES}\nÖnce "npm run gen:strokes" çalıştır.`)
    process.exit(1)
  }
  const data = buildKanjiCards(STROKES)

  const html = TEMPLATE.replace('/*__DATA__*/', JSON.stringify(data))

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf8')
  writeFileSync(join(OUT_DIR, 'project.json'), JSON.stringify(PROJECT, null, 2), 'utf8')
  writeFileSync(join(OUT_DIR, 'preview.png'), previewPng())

  const kb = Math.round(Buffer.byteLength(html) / 1024)
  const kelimeli = data.filter((d) => d.w.length).length
  const cizgi = data.reduce((t, d) => t + d.n.length, 0)
  console.log(`${OUT_DIR}/ yazıldı`)
  console.log(`  index.html   ${data.length} kanji · ${cizgi} çizgi · ${kb} KB`)
  console.log(`  ${kelimeli} kanjide örnek kelime`)
  console.log(`  project.json + preview.png (Wallpaper Engine için)`)

  syncToWallpaperEngine()
}

/**
 * Wallpaper Engine klasörüne de kopyalar.
 *
 * Katakana üreticisiyle aynı gerekçe: duvar kâğıdı oraya bir KOPYA olarak
 * gidiyor, elle kopyalamayı unutunca ekranda eski sürüm kalıyor.
 *
 * Klasör adı ayrı (dilhane-kanji), yani katakana duvar kâğıdının ÜZERİNE
 * YAZMAZ — ikisi Wallpaper Engine kütüphanesinde yan yana durur, hangisi
 * isteniyorsa o seçilir.
 */
function syncToWallpaperEngine() {
  const rel = join('steamapps', 'common', 'wallpaper_engine', 'projects', 'myprojects')
  const adaylar = process.env.DILHANE_WE_DIR
    ? [process.env.DILHANE_WE_DIR]
    : // Sürücü kökü path.sep ile kuruluyor: join('D:', 'x') sürücüye GÖRELİ
      // bir yol verir (D:x), mutlak yol için ayıracın kendisi gerekiyor.
      ['C:', 'D:', 'E:', 'F:'].flatMap((d) => [
        join(d + sep, 'SteamLibrary', rel),
        join(d + sep, 'Program Files (x86)', 'Steam', rel),
      ])

  const kok = adaylar.find((d) => existsSync(d))
  if (!kok) {
    console.log('')
    console.log('Wallpaper Engine klasörü bulunamadı — kopyalanmadı.')
    console.log('Yolu biliyorsan: DILHANE_WE_DIR=... npm run gen:kanji-wallpaper')
    return
  }

  const hedef = join(kok, 'dilhane-kanji')
  if (!existsSync(hedef)) mkdirSync(hedef, { recursive: true })
  for (const f of ['index.html', 'project.json', 'preview.png']) {
    copyFileSync(join(OUT_DIR, f), join(hedef, f))
  }
  console.log('')
  console.log(`Wallpaper Engine'e kopyalandı:`)
  console.log(`  ${hedef}`)
  console.log(`Wallpaper Engine'i aç, "Dilhane — N5 Kanji"yi seç.`)
}

/** Wallpaper Engine manifest'i — klasör doğrudan içe aktarılabilsin diye. */
const PROJECT = {
  title: 'Dilhane — N5 Kanji',
  description:
    'JLPT N5 kanjileri sırayla, numaralı çizgi sırası canlandırmasıyla. Türkçe anlam, on/kun okunuşları ve okunuşun kelimeye göre nasıl değiştiğini gösteren örnek kelimeler her karakterle birlikte görünür.',
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
// zemini ve vurgu rengiyle bir degrade.

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
<title>N5 Kanji</title>
<style>
  /* Renkler uygulamayla aynı: sıcak mürekkep siyahı + kaki (柿色) vurgu. */
  :root {
    --bg: #100e0d;
    --surface: #1a1817;
    --line: rgba(240,228,218,.08);
    --text: #efe9e3;
    --dim: #aaa199;
    --faint: #746b64;
    --accent: #e0714f;
    --accent-soft: rgba(224,113,79,.13);
    /* Ders kitabı biçimi — uygulamadakiyle aynı tercih. Kâğıda yazarken
       gördüğü biçimle ekrandaki biçim ayrışmasın. */
    --ja: 'UD Digi Kyokasho NP','UD Digi Kyokasho N','Yu Mincho','Noto Serif JP','Yu Gothic','MS Mincho',serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: 'Segoe UI', -apple-system, Roboto, Arial, sans-serif;
    cursor: none;                 /* masaüstünde imleç görünmesin */
    user-select: none;
  }

  /* Zeminde çok yavaş süzülen bir ışık: tamamen durağan ekran saatlerce açık
     kalınca ölü görünüyor. Sabit parlak alan bırakmadığı için OLED yanmasına
     da karşı koruyor. */
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

  /* MASAÜSTÜ GERÇEKLERİ (katakana sürümünde acıyla öğrenildi):
       • Görev çubuğu — duvar kâğıdı onun ARKASINA çizilir, alttaki ~48px
         görünmez.
       • Masaüstü simgeleri — üst sıra ve sağ sütun dolu olur.
     Bu yüzden üstte şerit yok, içerik alt bloğa toplanmış ve altta görev
     çubuğu kadar güvenli boşluk var. */
  #app {
    position: relative; height: 100%;
    display: grid;
    grid-template-rows: 1fr auto auto;
    padding: 8vh 4vw calc(3vh + 56px);
  }

  #meta { display: flex; align-items: baseline; gap: 1.4vw; flex-wrap: wrap; }
  #brand { font-size: 1.4vh; letter-spacing: .3em; text-transform: uppercase; color: var(--faint); }
  #theme { font-size: 1.8vh; color: var(--accent); letter-spacing: .04em; }
  #count { font-size: 1.4vh; color: var(--faint); font-variant-numeric: tabular-nums; }

  #bar { height: 2px; background: var(--line); border-radius: 2px; overflow: hidden; margin-top: 2.2vh; }
  #bar > i { display: block; height: 100%; width: 100%; background: var(--accent); transform-origin: left; }

  /* ————— Orta: karakter + anlam ————— */
  #stage {
    display: grid; grid-template-columns: auto minmax(0,auto); align-items: center;
    justify-content: center; gap: 4.5vw; min-height: 0;
  }
  #glyphWrap { position: relative; display: grid; place-items: center; }
  #glyph { height: min(48vh, 34vw); width: auto; display: block; overflow: visible; }
  #glyph path {
    fill: none; stroke: var(--text);
    stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round;
  }
  /* Numaralı başlangıç noktası. Yarıçap ve punto JS'ten veriliyor: 18 çizgili
     曜'de sabit yarıçapla daireler üst üste biniyor ve rakamlar okunmuyordu. */
  #glyph g.dot { opacity: 0; }
  #glyph g.dot circle { fill: var(--accent); }
  #glyph g.dot text {
    fill: #100e0d;
    font-weight: 700;
    font-family: 'Segoe UI', Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: central;
    pointer-events: none;
  }

  /* Anlam — kanjide öğrenilen şey ses değil anlam, o yüzden karakterin
     yanındaki asıl çıpa bu. Katakanada burada hiragana karşılığı vardı. */
  #meaning { display: grid; gap: 1.2vh; justify-items: start; max-width: 34vw; }
  #meaningTr { font-size: 5.2vh; line-height: 1.15; color: var(--text); font-weight: 600; }
  #meaningLabel { font-size: 1.4vh; color: var(--faint); letter-spacing: .1em; text-transform: uppercase; }

  /* ————— Alt: okunuşlar ve kelimeler ————— */
  #info { display: grid; gap: 1.6vh; }

  /* on ve kun AYRI etiketli duruyor. Tek bir "okunuş" satırı yazmak kanjide
     yanlış olurdu: hangisinin ne zaman kullanıldığı kelimeye bağlı. */
  #readingRow { display: flex; align-items: baseline; gap: 2.2vw; flex-wrap: wrap; }
  .rd { display: flex; align-items: baseline; gap: .7vw; }
  .rdLabel { font-size: 1.4vh; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
  .rdVal { font-size: 3.6vh; font-family: var(--ja); line-height: 1.1; }
  .rd--on .rdVal { color: var(--accent); }
  .rd--kun .rdVal { color: var(--text); }
  #okuNote { font-size: 1.5vh; color: var(--faint); }

  #cards { display: flex; gap: 1.4vw; align-items: stretch; flex-wrap: nowrap; }
  .card {
    flex: 0 1 clamp(18vw, 27vw, 32vw);
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 1.2vh; padding: 1.6vh 1.6vw;
    display: grid; gap: .7vh; align-content: start;
  }
  .cardLabel { font-size: 1.3vh; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
  .cardBody { font-size: 1.95vh; line-height: 1.5; color: var(--text); }
  .cardBody .muted { color: var(--dim); }
  .muted { color: var(--dim); }
  /* Kelime içinde o anki kanji vurgulanır: 日'yi 日曜日 içinde aramak zaman
     alıyor, renkli olunca göz doğrudan buluyor. */
  .hit { color: var(--accent); }
  .jaBig { font-size: 3.4vh; letter-spacing: .06em; font-family: var(--ja); }
  .jaRead { font-family: var(--ja); }

  /* Geçiş: içerik topluca solup yeniden beliriyor. */
  #app.is-out #stage, #app.is-out #info { opacity: 0; transform: translateY(.8vh); }
  #stage, #info { transition: opacity .45s ease, transform .45s ease; }
</style>
</head>
<body>
<div id="glow"></div>

<div id="app">
  <div id="stage">
    <div id="glyphWrap"><svg id="glyph" viewBox="0 0 109 109" aria-hidden="true"></svg></div>
    <div id="meaning">
      <div id="meaningLabel">anlam</div>
      <div id="meaningTr"></div>
    </div>
  </div>

  <div id="info">
    <div id="meta">
      <span id="brand">Dilhane · N5 Kanji</span>
      <span id="theme"></span>
      <span id="count"></span>
    </div>
    <div id="readingRow"></div>
    <div id="cards"></div>
  </div>

  <div id="bar"><i id="barFill"></i></div>
</div>

<script>
const DATA = /*__DATA__*/;

// ————————————————————————— Deste —————————————————————————
//
// Saf rastgele seçim aynı kanjiyi üst üste gösterebiliyor ve bazıları
// günlerce hiç çıkmayabiliyor. Deste karılıp sırayla tüketiliyor, bitince
// yeniden karılıyor: hem rastgele hem her karakterin çıkacağı garanti.
//
// Ağırlık Japon okul sınıfına göre: 1. sınıf kanjileri (日, 人, 大) en
// temel olanlar ve her yerde geçiyor, daha sık çıkmaları gerekiyor.
// Sıklık listesi uydurmak yerine hazır ve doğru bir sinyal kullanılıyor.
function weightOf(grade) {
  if (grade <= 1) return 3;
  if (grade <= 2) return 2;
  return 1;
}

function buildDeck() {
  const deck = [];
  for (const d of DATA) {
    const n = weightOf(d.grade);
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

function nextCard() {
  if (pos >= deck.length) { deck = buildDeck(); pos = 0; }
  // Karıştırma sonrası aynı karakterin arka arkaya gelmesini engelle
  if (pos > 0 && deck[pos] === deck[pos - 1] && pos + 1 < deck.length) pos++;
  return deck[pos++];
}

// ————————————————————————— Çizgi canlandırması —————————————————————————
const glyph = document.getElementById('glyph');

function drawGlyph(item) {
  glyph.setAttribute('viewBox', '0 0 109 109');
  glyph.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  const paths = item.p.map((d) => {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', d);
    glyph.appendChild(el);
    return el;
  });

  // Kalabalık kanjide daire küçülür. 109'luk viewBox'ta 18 çizgi varken
  // 6.4 yarıçaplı daireler üst üste biniyor ve rakamlar okunmuyor.
  const say = item.n.length;
  const r = say > 12 ? 4.6 : say > 8 ? 5.4 : 6.4;
  const fs = say > 12 ? 5.6 : say > 8 ? 6.6 : 8;

  const dots = item.n.map((n) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'dot');

    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', n.x);
    c.setAttribute('cy', n.y);
    c.setAttribute('r', r);
    g.appendChild(c);

    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', n.x);
    t.setAttribute('y', n.y);
    t.setAttribute('font-size', fs);
    t.textContent = n.i;
    g.appendChild(t);

    glyph.appendChild(g);
    return g;
  });

  // Süre çizgi sayısına göre ölçekleniyor. Katakanada sabit 1800 ms yetiyordu
  // (en fazla 4 çizgi); 18 çizgili 曜'de aynı süre çizgi başına 100 ms'ye
  // düşüp izlenemez oluyor. Alt ve üst sınır var: çok kısası yön hissi
  // vermiyor, çok uzunu bekletiyor.
  const total = Math.min(3400, Math.max(1500, 210 * paths.length));
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

  return total;
}

// ————————————————————————— Ekranı doldur —————————————————————————
const app = document.getElementById('app');
const el = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Kelime içinde o anki kanjiyi renklendirir. Kaçış parça parça yapılıyor ki
// eklenen etiketler kaçırılmasın.
function mark(word, ch) {
  return [...word]
    .map((c) => (c === ch ? '<span class="hit">' + esc(c) + '</span>' : esc(c)))
    .join('');
}

function readingBlock(cls, label, list) {
  if (!list || !list.length) return '';
  return '<div class="rd ' + cls + '"><span class="rdLabel">' + label + '</span>' +
    '<span class="rdVal">' + esc(list.join('・')) + '</span></div>';
}

function render(item) {
  el('theme').textContent = item.g;
  el('count').textContent = item.s + ' çizgi';
  el('meaningTr').textContent = item.m.join(' · ');

  const rd = [
    readingBlock('rd--on', "on'yomi", item.on),
    readingBlock('rd--kun', "kun'yomi", item.kun),
  ].filter(Boolean).join('');

  // Tire açıklaması SADECE tire varken çıkar; her karakterde durursa
  // gürültü olur ve okunmaz hâle gelir.
  const tireli = (item.kun || []).some((k) => k.indexOf('-') >= 0);
  const not = tireli
    ? '<span id="okuNote">tireden sonrası kanjiden sonra hiragana ile yazılır</span>'
    : '';

  el('readingRow').innerHTML = rd + not;

  const total = drawGlyph(item);

  // Örnek kelimeler: kanjinin okunuşunun kelimeye göre DEĞİŞTİĞİNİ gösteren
  // asıl kısım burası. Kanji her kelimede renkli, okunuş altında.
  el('cards').innerHTML = item.w.map((w) =>
    '<div class="card"><div class="cardLabel">Örnek kelime</div>' +
    '<div class="cardBody"><span class="jaBig">' + mark(w.k, item.c) + '</span></div>' +
    '<div class="cardBody muted jaRead">' + esc(w.r) + '</div>' +
    '<div class="cardBody muted">' + esc(w.t) + '</div></div>'
  ).join('');

  return total;
}

// ————————————————————————— Döngü —————————————————————————
//
// Katakanada 6–8 saniyeydi. Kanjide okunacak şey arttı (anlam + iki okunuş
// dizisi + üç kelime) ve çizgi canlandırması 18 çizgide 3.4 saniye sürüyor;
// bekleme süresi canlandırma bitmeden dolmamalı. Alt sınır bu yüzden
// canlandırma süresine bağlı.
const MIN_MS = 9000;
const MAX_MS = 12000;
const FADE = 450;

const barFill = document.getElementById('barFill');
let timer = null;

function show() {
  const item = nextCard();

  app.classList.remove('is-out');
  const anim = render(item);

  // Canlandırma bitmeden geçmesin: uzun kanjilerde son çizgiler çizilirken
  // ekran değişiyordu.
  const hold = Math.max(MIN_MS, anim + 5500) + Math.random() * (MAX_MS - MIN_MS);

  barFill.style.transition = 'none';
  barFill.style.transform = 'scaleX(1)';
  requestAnimationFrame(() => {
    barFill.style.transition = 'transform ' + hold + 'ms linear';
    barFill.style.transform = 'scaleX(0)';
  });

  // İKİ zamanlayıcı da aynı değişkende: iç setTimeout takip edilmezse
  // görünürlük tam solma anında değişince iki döngü birden dönmeye başlıyor
  // ve karakterler iki kat hızlı geçiyor.
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
