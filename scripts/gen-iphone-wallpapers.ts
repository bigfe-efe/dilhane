/**
 * iPhone için katakana duvar kâğıdı GÖRSELLERİ üretir.
 *
 *   npm run gen:iphone-wallpaper
 *
 * Çıktı: wallpaper/iphone/ → her karakter için bir PNG
 *
 * NEDEN GÖRSEL, MASAÜSTÜNDEKİ GİBİ CANLI SAYFA DEĞİL:
 * iOS'ta HTML duvar kâğıdı diye bir şey yok — bir web sayfasını duvar kâğıdı
 * yapamıyorsun ve bunu değiştirebileceğimiz bir yol da yok. Ama iOS 17'den
 * beri "Fotoğraf Karıştır" var: bir albüm seçiyorsun, kilit ekranı o albümden
 * rastgele bir görsel gösteriyor ve dokunuşta / kilitlemede / saatlik
 * değiştiriyor. Yani her karakteri bir görsel olarak üretirsek, sonuç
 * masaüstündekine çok yakın oluyor: rastgele sıra, düzenli değişim, hiçbir
 * uygulama gerekmiyor.
 *
 * NASIL ÜRETİLİYOR:
 * Elde yazı çizecek bir font rasterleyici yok, o yüzden görselleri Chrome'un
 * kendisi çiziyor: aynı HTML, headless Chrome ile telefon çözünürlüğünde
 * ekran görüntüsü olarak alınıyor. Böylece masaüstü sürümüyle birebir aynı
 * çizgi verisi, aynı renkler, aynı yazı tipleri kullanılıyor.
 *
 * YERLEŞİM — KİLİT EKRANI GERÇEKLERİ:
 * Kilit ekranının üst üçte biri saat ve widget'lara ait, en altı da el feneri
 * ve kamera düğmelerine. İçerik bu yüzden ekranın ortasında, %32–%88 aralığında
 * duruyor. Bu aralık iOS kırpma yaptığında da hayatta kalıyor.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { buildKatakanaCards, type KataCard } from './lib/katakana-data'

const OUT_DIR = join('wallpaper', 'iphone')
const STROKES = join('public', 'strokes', 'kana.json')

/**
 * Üretim çözünürlüğü.
 *
 * Son iPhone'ların ekranı bundan biraz farklı olabilir; iOS duvar kâğıdını
 * zaten kendi ekranına göre ölçekleyip kırpıyor. Bol kenar bırakılıp içerik
 * ortada tutulduğu için kırpma içeriği kesmiyor.
 */
const W = 1290
const H = 2796

const KIND_TR: Record<KataCard['kind'], string> = {
  base: 'temel',
  dakuten: 'dakuten',
  handakuten: 'handakuten',
  yoon: 'yoon',
}

function chromePath(): string {
  const adaylar = [
    join(process.env.ProgramFiles ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['ProgramFiles(x86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env.ProgramFiles ?? '', 'Microsoft/Edge/Application/msedge.exe'),
  ]
  const bulunan = adaylar.find((p) => p && existsSync(p))
  if (!bulunan) {
    console.error('Chrome veya Edge bulunamadı — görseller Chrome ile çiziliyor.')
    process.exit(1)
  }
  return bulunan
}

/** Dosya adı: sıra + tür + okunuş. Sıralı isim, hangi 46'nın temel olduğunu görünür kılar. */
function fileName(i: number, c: KataCard): string {
  const no = String(i + 1).padStart(3, '0')
  const romaji = c.r.replace(/[^a-z]/gi, '') || 'x'
  return `${no}-${KIND_TR[c.kind]}-${romaji}.png`
}

function build() {
  if (!existsSync(STROKES)) {
    console.error(`Çizgi verisi yok: ${STROKES}\nÖnce "npm run gen:strokes" çalıştır.`)
    process.exit(1)
  }
  const cards = buildKatakanaCards(STROKES)
  const exe = chromePath()

  if (existsSync(OUT_DIR)) {
    // Eski PNG'ler silinir: karakter listesi değişirse artık geçersiz olan
    // görseller albümde kalmasın.
    for (const f of readdirSync(OUT_DIR)) {
      if (f.endsWith('.png')) rmSync(join(OUT_DIR, f))
    }
  } else {
    mkdirSync(OUT_DIR, { recursive: true })
  }

  const framePath = join(OUT_DIR, 'frame.html')
  writeFileSync(framePath, FRAME.replace('/*__DATA__*/', JSON.stringify(cards)), 'utf8')
  const frameUrl = 'file:///' + resolve(framePath).replace(/\\/g, '/')

  console.log(`${cards.length} görsel üretiliyor (${W}x${H})…`)
  let ok = 0
  for (let i = 0; i < cards.length; i++) {
    const out = resolve(join(OUT_DIR, fileName(i, cards[i])))
    try {
      execFileSync(
        exe,
        [
          '--headless',
          '--disable-gpu',
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
          `--window-size=${W},${H}`,
          // Yazı tipleri ve düzen otursun diye sanal zaman tanınıyor; aksi
          // hâlde Chrome bazen boş kare yakalıyor.
          '--virtual-time-budget=1200',
          `--screenshot=${out}`,
          // Karakter numarası HASH ile veriliyor: file:// adreslerinde sorgu
          // dizesi (?i=5) her zaman güvenilir değil, hash her koşulda okunur.
          `${frameUrl}#${i}`,
        ],
        { stdio: 'pipe' },
      )
      ok++
      if (ok % 20 === 0) console.log(`  ${ok}/${cards.length}`)
    } catch (e) {
      console.error(`  HATA (${cards[i].c}):`, (e as Error).message.split('\n')[0])
    }
  }

  const uretilen = readdirSync(OUT_DIR).filter((f) => f.endsWith('.png'))
  console.log(`\n${uretilen.length} görsel yazıldı → ${OUT_DIR}/`)
  const temel = uretilen.filter((f) => f.includes('-temel-')).length
  console.log(`  ${temel} tanesi temel 46 harf (dosya adında "temel" geçenler)`)
  console.log('\nTelefona aktarma ve kurulum: wallpaper/OKU-iphone.md')
}

const FRAME = String.raw`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Katakana</title>
<style>
  /* Renkler masaüstü duvar kâğıdıyla aynı: sıcak mürekkep siyahı + kaki. */
  :root {
    --bg: #100e0d;
    --surface: #1a1817;
    --line: rgba(240,228,218,.10);
    --text: #efe9e3;
    --dim: #aaa199;
    --faint: #7d746c;
    --accent: #e0714f;
    --accent-soft: rgba(224,113,79,.14);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: var(--bg); color: var(--text);
    font-family: 'Segoe UI', -apple-system, Roboto, Arial, sans-serif; }

  #glow {
    position: fixed; inset: 0;
    background:
      radial-gradient(60% 32% at 50% 42%, rgba(224,113,79,.13), transparent 70%),
      radial-gradient(45% 22% at 50% 74%, rgba(224,113,79,.06), transparent 70%);
  }

  /* KİLİT EKRANI GÜVENLİ ALANI.
     Üstteki %32 saat, tarih ve widget'lara ait; alttaki %12 el feneri/kamera
     düğmeleri ve ana ekran çubuğuna. İçerik yalnızca aradaki şeride konur.

     DİKKAT: yüzdelik padding CSS'te GENİŞLİĞE göre hesaplanır, yüksekliğe
     değil. Önce "padding: 32% ..." yazılmıştı ve 1290px genişlikte 413px
     ediyordu — yani ekranın %14,8'i. Harf tam saatin üstüne geliyordu.
     Yükseklik oranı isteniyorsa vh şart. */
  #safe {
    position: relative;
    height: 100%;
    padding: 32vh 8vw 12vh;
    display: flex; flex-direction: column; align-items: center;
  }

  #glyph { height: auto; display: block; overflow: visible; flex: none; }
  #glyph path { fill: none; stroke: var(--text); stroke-width: 5.2;
    stroke-linecap: round; stroke-linejoin: round; }
  #glyph g.dot circle { fill: var(--accent); }
  #glyph g.dot text { fill: #100e0d; font-size: 8px; font-weight: 700;
    font-family: 'Segoe UI', Arial, sans-serif; text-anchor: middle; dominant-baseline: central; }

  #anchor { margin-top: 26px; display: flex; align-items: baseline; gap: 18px; color: var(--faint); }
  #anchorKana { font-size: 64px; line-height: 1;
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif; }
  #anchorLabel { font-size: 24px; letter-spacing: .04em; }

  #romaji { margin-top: 34px; font-size: 132px; font-weight: 700; letter-spacing: .02em;
    color: var(--accent); line-height: 1; }
  #tr { margin-top: 14px; font-size: 34px; color: var(--dim); text-align: center; }
  #meta { margin-top: 12px; font-size: 24px; color: var(--faint); letter-spacing: .06em; }

  #cards { margin-top: 40px; width: 100%; display: grid; gap: 18px; }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 26px;
    padding: 26px 30px; display: grid; gap: 10px; }
  .card.is-warn { border-color: rgba(224,113,79,.36); background: var(--accent-soft); }
  .cardLabel { font-size: 20px; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .cardBody { font-size: 30px; line-height: 1.42; }
  .muted { color: var(--dim); }
  .jaBig { font-size: 46px; letter-spacing: .04em;
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif; }
  .hit { color: var(--accent); }
  .pairKana { font-size: 44px; color: var(--accent);
    font-family: 'Yu Gothic','Hiragino Kaku Gothic ProN','Noto Sans JP','MS Gothic',Meiryo,sans-serif; }
</style>
</head>
<body>
<div id="glow"></div>
<div id="safe">
  <svg id="glyph" viewBox="0 0 109 109"></svg>
  <div id="anchor"><span id="anchorKana"></span><span id="anchorLabel">hiragana karşılığı</span></div>
  <div id="romaji"></div>
  <div id="tr"></div>
  <div id="meta"></div>
  <div id="cards"></div>
</div>

<script>
const DATA = /*__DATA__*/;
const KIND_TR = { base: 'temel', dakuten: 'dakuten ゛', handakuten: 'handakuten ゜', yoon: 'yōon' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const mark = (word, ch) =>
  [...word].map((c) => (c === ch ? '<span class="hit">' + esc(c) + '</span>' : esc(c))).join('');

// Hangi karakter — adres çubuğundaki hash'ten. Ekran görüntüsü alan betik
// her karakter için ayrı bir hash ile bu sayfayı açıyor.
const item = DATA[Number(location.hash.slice(1)) || 0];

const ns = 'http://www.w3.org/2000/svg';
const glyph = document.getElementById('glyph');
glyph.setAttribute('viewBox', '0 0 ' + (109 * item.w) + ' 109');
// Genişlik karakter sayısına göre: yōon iki kana geniştir, sabit genişlikte
// yükseklik yarıya iniyor ve harf kaybolmuş gibi duruyordu.
glyph.style.width = item.w > 1 ? '88%' : '62%';

// Görsel DURAĞAN: canlandırma yok, çizgiler baştan tam çizili. Masaüstünde
// çizgi sırasını hareket gösteriyordu; burada onu numaralı noktalar taşıyor.
for (const p of item.p) {
  const el = document.createElementNS(ns, 'path');
  el.setAttribute('d', p.d);
  if (p.ox) el.setAttribute('transform', 'translate(' + p.ox + ',0)');
  glyph.appendChild(el);
}
for (const n of item.n) {
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('class', 'dot');
  const c = document.createElementNS(ns, 'circle');
  c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', '6.4');
  g.appendChild(c);
  const t = document.createElementNS(ns, 'text');
  t.setAttribute('x', n.x); t.setAttribute('y', n.y); t.textContent = n.i;
  g.appendChild(t);
  glyph.appendChild(g);
}

document.getElementById('anchorKana').textContent = item.h || '';
document.getElementById('anchor').style.visibility = item.h ? 'visible' : 'hidden';
document.getElementById('romaji').textContent = item.r;
document.getElementById('tr').textContent = item.t ? 'Türkçe okunuşu: ' + item.t : '';
document.getElementById('meta').textContent =
  item.g + ' · ' + (KIND_TR[item.kind] || '') + ' · ' + item.n.length + ' çizgi';

// EN FAZLA İKİ kart: telefon ekranı dar, üçüncüsü güvenli alanı taşırıyor.
// Karışan çift uyarısı önce geliyor — katakanada en çok işe yarayan bilgi o.
const cards = [];
for (const p of item.e.slice(0, 1)) {
  cards.push(
    '<div class="card is-warn"><div class="cardLabel">Karıştırma</div>' +
    '<div class="cardBody"><span class="pairKana">' + esc(item.c) + ' / ' + esc(p.c) + '</span>' +
    '<span class="muted"> &nbsp;' + esc(item.r) + ' / ' + esc(p.r) + '</span></div>' +
    '<div class="cardBody muted">' + esc(p.h) + '</div></div>'
  );
}
if (item.d) {
  cards.push(
    '<div class="card"><div class="cardLabel">Örnek kelime</div>' +
    '<div class="cardBody"><span class="jaBig">' + mark(item.d.k, item.c) + '</span></div>' +
    '<div class="cardBody muted">' + esc(item.d.r) + ' ← ' + esc(item.d.f) + ' · ' + esc(item.d.t) + '</div></div>'
  );
}
if (!cards.length && item.m) {
  cards.push('<div class="card"><div class="cardLabel">Hatırlatıcı</div><div class="cardBody">' + esc(item.m) + '</div></div>');
}
document.getElementById('cards').innerHTML = cards.slice(0, 2).join('');
</script>
</body>
</html>`

build()
