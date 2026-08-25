/**
 * İkinci monitör için tek dosyalık hiragana duvar kâğıdı üretir.
 *
 *   npm run gen:wallpaper
 *
 * Çıktı: wallpaper/hiragana.html
 *
 * NEDEN ÜRETİLİYOR, ELLE YAZILMIYOR:
 * Dosya TAMAMEN bağımsız olmalı — Wallpaper Engine ona bir dosya olarak bakar,
 * bizim dev sunucumuz çalışmıyor olacak. O yüzden kana tablosu ve çizgi verisi
 * HTML'in içine gömülür. Veri uygulamada değişirse bu script yeniden çalıştırılır
 * ve duvar kâğıdı da güncellenir; iki yerde ayrı liste tutulmaz.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { HIRAGANA } from '../src/content/ja/kana'

const OUT_DIR = 'wallpaper'
const OUT_FILE = join(OUT_DIR, 'hiragana.html')
const STROKES = join('public', 'strokes', 'kana.json')

interface StrokeData {
  s: string[]
  n: [number, number][]
  v: number
}

function build() {
  if (!existsSync(STROKES)) {
    console.error(`Çizgi verisi yok: ${STROKES}\nÖnce "npm run gen:strokes" çalıştır.`)
    process.exit(1)
  }
  const strokes: Record<string, StrokeData> = JSON.parse(readFileSync(STROKES, 'utf8'))

  // Duvar kâğıdına yalnızca gereken alanlar gider; dosya şişmesin
  const data = HIRAGANA.map((k) => ({
    c: k.char,
    r: k.romaji,
    t: k.trHint,
    m: k.mnemonic ?? '',
    g: k.group,
    k: k.kind,
    // çizgi yolları — el yazısı biçimi
    p: [...k.char].flatMap((ch, i) => (strokes[ch]?.s ?? []).map((d) => ({ d, ox: i * 109 }))),
    // kaç kutu geniş (きゃ gibi yōon'da 2)
    w: [...k.char].length,
  }))

  const html = TEMPLATE.replace('/*__DATA__*/', JSON.stringify(data))

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, html, 'utf8')

  const kb = Math.round(Buffer.byteLength(html) / 1024)
  console.log(`${OUT_FILE} yazıldı · ${data.length} karakter · ${kb} KB`)
  console.log('\nKullanım:')
  console.log('  • Tarayıcıda aç, F11 ile tam ekran yap (en kolayı)')
  console.log('  • Wallpaper Engine: "Create Wallpaper" → Web → bu dosyayı seç')
}

const TEMPLATE = String.raw`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Hiragana duvar kâğıdı</title>
<style>
  :root {
    --bg: #0f1115;
    --panel: #151922;
    --text: #e8ebf0;
    --dim: #9aa3b2;
    --faint: #5c6473;
    --accent: #7dd3fc;
    --line: #232830;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: var(--bg); color: var(--text);
    font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; overflow: hidden; }

  #app { height: 100%; display: flex; }

  /* ————————————————————————— Sol panel —————————————————————————
     Kalici olarak duruyor ama sonuk; fare yaklasinca netlesiyor.
     Boylece hem her an tiklanabilir hem de dikkat dagitmiyor. */
  #side {
    width: 15.5vw; min-width: 190px; max-width: 300px;
    flex: none; display: flex; flex-direction: column;
    background: var(--panel); border-right: 1px solid var(--line);
    opacity: .38; transition: opacity .25s ease, margin-left .25s ease;
    overflow: hidden;
  }
  #side:hover { opacity: 1; }
  body.collapsed #side { margin-left: calc(-15.5vw - 2px); }
  body.collapsed #reopen { display: grid; }

  #reopen {
    display: none; position: fixed; left: 0; top: 50%; transform: translateY(-50%);
    width: 26px; height: 64px; place-items: center; z-index: 5;
    background: var(--panel); border: 1px solid var(--line); border-left: 0;
    border-radius: 0 8px 8px 0; color: var(--dim); cursor: pointer; opacity: .35;
  }
  #reopen:hover { opacity: 1; }

  #sideHead {
    display: flex; align-items: center; gap: 6px;
    padding: 1.6vh 1vw; border-bottom: 1px solid var(--line); flex: none;
  }
  #sideHead b { font-size: 1.7vh; letter-spacing: .02em; }
  #sideHead span { font-size: 1.3vh; color: var(--faint); }
  .iconbtn {
    margin-left: auto; width: 22px; height: 22px; flex: none;
    display: grid; place-items: center; cursor: pointer;
    background: transparent; border: 1px solid var(--line); border-radius: 6px;
    color: var(--dim); font-size: 12px; line-height: 1;
  }
  .iconbtn:hover { color: var(--accent); border-color: var(--accent); }

  /*
    Kaydirma bolgesi TEK: baslik disinda kalan her sey #sideBody icinde.
    Eskiden yalnizca #rows kayardi, ayarlar bolumu ise flex:none olarak altta
    dururdu; ekran kisaldiginda (kucuk monitor ya da %125 olcekleme) "Okunuş"
    ve "Hatırlatıcı" kisimlari ekran disinda kaliyor, tekerlekle de
    inilemiyordu cunku #side overflow:hidden.
    min-height:0 sart - onsuz flex ogesi icerigi kadar buyuyup tasar.
  */
  #sideBody { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  #sideBody::-webkit-scrollbar { width: 6px; }
  #sideBody::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
  #sideBody::-webkit-scrollbar-track { background: transparent; }

  #rows { padding: .8vh .6vw; }

  .row {
    display: flex; align-items: center; gap: 7px;
    padding: .75vh .6vw; border-radius: 7px; cursor: pointer;
    font-size: 1.45vh; color: var(--dim); user-select: none;
  }
  .row:hover { background: rgba(255,255,255,.05); }
  .row .box {
    width: 15px; height: 15px; flex: none; border-radius: 4px;
    border: 1.5px solid var(--faint); display: grid; place-items: center;
    font-size: 11px; line-height: 1; color: var(--bg);
  }
  .row.on { color: var(--text); }
  .row.on .box { background: var(--accent); border-color: var(--accent); }
  .row .n { margin-left: auto; font-size: 1.2vh; color: var(--faint); }

  .quick { display: flex; gap: 5px; padding: .8vh .6vw; border-top: 1px solid var(--line); flex: none; }
  .quick button {
    flex: 1; padding: .7vh 0; font-size: 1.25vh; cursor: pointer;
    background: transparent; border: 1px solid var(--line); border-radius: 6px; color: var(--dim);
  }
  .quick button:hover { color: var(--accent); border-color: var(--accent); }

  #settings { flex: none; padding: 1vh .6vw 1.4vh; border-top: 1px solid var(--line); }
  .label { font-size: 1.2vh; color: var(--faint); margin: .8vh 0 .5vh; text-transform: uppercase; letter-spacing: .05em; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chip {
    padding: .55vh .7vw; font-size: 1.25vh; cursor: pointer; white-space: nowrap;
    background: transparent; border: 1px solid var(--line); border-radius: 6px; color: var(--dim);
  }
  .chip.on { border-color: var(--accent); color: var(--accent); background: rgba(125,211,252,.08); }

  /* ————————————————————————— Sahne ————————————————————————— */
  #stage {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2vh; padding: 3vh 2vw 8vh; text-align: center; min-width: 0;
  }
  #glyph { height: 44vh; width: auto; max-width: 70vw; color: var(--text); }
  #glyph path { fill: none; stroke: currentColor; stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }

  /*
    Gecis SADECE .show uzerinde tanimli. Boyle olmasi sart: eger gecis
    #answer'da dursaydi, sinif kaldirildiginda cikis da animasyonlu olurdu ve
    yeni harf gelirken cevabi yarim saniye ekranda kalirdi.
  */
  #answer { opacity: 0; }
  #answer.show { opacity: 1; transition: opacity .5s ease; }

  #romaji { font-size: 6.5vh; font-weight: 700; letter-spacing: .06em; color: var(--accent); line-height: 1.1; }
  #tr { font-size: 3.2vh; color: var(--dim); margin-top: .6vh; }
  #mnemonic { font-size: 2vh; color: var(--faint); margin-top: 1.2vh; max-width: 46vw; line-height: 1.5; margin-inline: auto; }

  /* ————————————————————————— Alt cubuk ————————————————————————— */
  #foot {
    position: fixed; right: 0; bottom: 0; left: 0;
    display: flex; align-items: center; gap: 1.5vw;
    padding: 1.6vh 2vw; font-size: 1.5vh; color: var(--faint);
    pointer-events: none;
  }
  body:not(.collapsed) #foot { padding-left: calc(15.5vw + 2vw); }
  #progress { flex: 1; height: 3px; background: var(--line); border-radius: 2px; overflow: hidden; }
  #progress i { display: block; height: 100%; background: var(--accent); width: 0; }
  kbd { font-family: monospace; border: 1px solid var(--line); border-radius: 4px; padding: 0 4px; }
</style>
</head>
<body>

<div id="app">
  <aside id="side">
    <div id="sideHead">
      <b>ひらがな</b>
      <span id="sel"></span>
      <button class="iconbtn" id="collapse" title="Paneli gizle">«</button>
    </div>

    <div id="sideBody">
      <div id="rows"></div>

      <div class="quick">
        <button id="allBtn">Hepsi</button>
        <button id="baseBtn">Temel 46</button>
        <button id="noneBtn">Temizle</button>
      </div>

      <div id="settings">
        <div class="label">Süre</div>
        <div class="chips" id="interval"></div>
        <div class="label">Sıra</div>
        <div class="chips" id="order"></div>
        <div class="label">Okunuş</div>
        <div class="chips" id="reveal"></div>
        <div class="label">Hatırlatıcı</div>
        <div class="chips" id="mnemo"></div>
      </div>
    </div>
  </aside>

  <main id="stage">
    <svg id="glyph" viewBox="0 0 109 109" aria-hidden="true"></svg>
    <div id="answer">
      <div id="romaji"></div>
      <div id="tr"></div>
      <div id="mnemonic"></div>
    </div>
  </main>
</div>

<div id="reopen" title="Paneli göster">»</div>

<div id="foot">
  <span id="count"></span>
  <span id="group"></span>
  <div id="progress"><i></i></div>
  <span><kbd>boşluk</kbd> sonraki · <kbd>←</kbd><kbd>→</kbd> gez · <kbd>A</kbd> panel</span>
</div>

<script>
const KANA = /*__DATA__*/;

const DEFAULTS = { rows: [], sec: 10, order: 'seq', reveal: 4, mnemo: true, collapsed: false };
const KEY = 'hiragana-wallpaper';

// Ayarlar nerede durur?
//
// Yalnızca localStorage yetmiyor: Chrome bu yazmaları toplayıp gecikmeli olarak
// diske indirir. Bilgisayar kapanırken süreç sertçe öldürüldüğü için son ayarlar
// diske hiç inmiyor ve her açılışta her şey sıfırlanmış oluyordu.
//
// Sayfa yerel sunucudan (http://127.0.0.1:4319) açıldığında ayarlar doğrudan
// wallpaper/prefs.json dosyasına yazılır; kutuya tıkladığın an diskte olur.
// Dosyadan (file://) açılırsa localStorage'a düşülür — çalışır ama kalıcılığı
// tarayıcının insafına kalır.
const SERVED = location.protocol.startsWith('http');

function readLocal() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

async function loadCfg() {
  if (SERVED) {
    try {
      const r = await fetch('prefs', { cache: 'no-store' });
      if (r.ok) return { ...DEFAULTS, ...(await r.json()) };
    } catch {}
  }
  return { ...DEFAULTS, ...readLocal() };
}

// Art arda tıklamalarda tek yazma yeter; 150 ms'lik gecikme diski yormaz ama
// insan ölçeğinde hâlâ "anında"dır.
let saveTimer = null;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}
  if (!SERVED) return;
  clearTimeout(saveTimer);
  const body = JSON.stringify(cfg);
  saveTimer = setTimeout(() => {
    fetch('prefs', { method: 'PUT', headers: { 'content-type': 'application/json' }, body, keepalive: true })
      .catch(() => {});
  }, 150);
}

let cfg = { ...DEFAULTS };

const GROUPS = [];
for (const k of KANA) if (!GROUPS.includes(k.g)) GROUPS.push(k.g);
const BASE_GROUPS = GROUPS.filter((g) => KANA.some((k) => k.g === g && k.k === 'base'));

let deck = [], idx = 0, timer = null, revealTimer = null;
const $ = (id) => document.getElementById(id);

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

function buildDeck() {
  const pool = KANA.filter((k) => cfg.rows.includes(k.g));
  deck = cfg.order === 'rnd' ? shuffle(pool) : pool;
  if (idx >= deck.length) idx = 0;
}

function render() {
  const ans = $('answer');
  clearTimeout(revealTimer);
  ans.classList.remove('show');

  if (!deck.length) {
    $('glyph').innerHTML = '';
    $('romaji').textContent = '—';
    $('tr').textContent = 'Soldan satır seç';
    $('mnemonic').textContent = '';
    $('count').textContent = '';
    $('group').textContent = '';
    ans.classList.add('show');
    return;
  }

  const k = deck[idx % deck.length];
  $('glyph').setAttribute('viewBox', '0 0 ' + 109 * k.w + ' 109');
  $('glyph').innerHTML = k.p
    .map((s) => '<path d="' + s.d + '"' + (s.ox ? ' transform="translate(' + s.ox + ' 0)"' : '') + '/>')
    .join('');

  $('romaji').textContent = k.r;
  $('tr').textContent = 'okunuşu: ' + k.t;
  $('mnemonic').textContent = cfg.mnemo ? k.m : '';
  $('count').textContent = ((idx % deck.length) + 1) + ' / ' + deck.length;
  $('group').textContent = k.g;

  if (cfg.reveal === 0) ans.classList.add('show');
  else revealTimer = setTimeout(() => ans.classList.add('show'), cfg.reveal * 1000);

  const bar = $('progress').firstElementChild;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    bar.style.transition = 'width ' + cfg.sec + 's linear';
    bar.style.width = '100%';
  });
}

function next(step) {
  if (!deck.length) return;
  idx = (idx + step + deck.length) % deck.length;
  render();
  restart();
}
function restart() {
  clearInterval(timer);
  timer = setInterval(() => next(1), cfg.sec * 1000);
}

/** Seçim değişti: desteyi yeniden kur ama bulunulan yeri koru. */
function selectionChanged() {
  save(); buildDeck(); paintRows(); render(); restart();
}

// ————————————————————————— Sol panel —————————————————————————

function paintRows() {
  const host = $('rows');
  host.innerHTML = '';
  GROUPS.forEach((g) => {
    const on = cfg.rows.includes(g);
    const n = KANA.filter((k) => k.g === g).length;
    const el = document.createElement('div');
    el.className = 'row' + (on ? ' on' : '');
    el.innerHTML = '<span class="box">' + (on ? '✓' : '') + '</span>' +
                   '<span class="t"></span><span class="n">' + n + '</span>';
    el.querySelector('.t').textContent = g;
    el.onclick = () => {
      cfg.rows = on ? cfg.rows.filter((x) => x !== g) : cfg.rows.concat(g);
      selectionChanged();
    };
    host.appendChild(el);
  });
  $('sel').textContent = deck.length + ' harf';
}

function chip(label, on, fn) {
  const b = document.createElement('button');
  b.className = 'chip' + (on ? ' on' : '');
  b.textContent = label;
  b.onclick = fn;
  return b;
}

function paintSettings() {
  const iv = $('interval'); iv.innerHTML = '';
  [5, 8, 10, 15, 30, 60].forEach((s) =>
    iv.appendChild(chip(s + ' sn', cfg.sec === s, () => { cfg.sec = s; save(); paintSettings(); restart(); })));

  const or = $('order'); or.innerHTML = '';
  or.appendChild(chip('Sırayla', cfg.order === 'seq', () => { cfg.order = 'seq'; save(); buildDeck(); paintSettings(); render(); }));
  or.appendChild(chip('Karışık', cfg.order === 'rnd', () => { cfg.order = 'rnd'; save(); buildDeck(); paintSettings(); render(); }));

  const rv = $('reveal'); rv.innerHTML = '';
  [[0, 'Hemen'], [3, '3 sn'], [4, '4 sn'], [6, '6 sn']].forEach((p) =>
    rv.appendChild(chip(p[1], cfg.reveal === p[0], () => { cfg.reveal = p[0]; save(); paintSettings(); render(); })));

  const mn = $('mnemo'); mn.innerHTML = '';
  mn.appendChild(chip('Açık', cfg.mnemo, () => { cfg.mnemo = true; save(); paintSettings(); render(); }));
  mn.appendChild(chip('Kapalı', !cfg.mnemo, () => { cfg.mnemo = false; save(); paintSettings(); render(); }));
}

$('allBtn').onclick = () => { cfg.rows = GROUPS.slice(); selectionChanged(); };
$('baseBtn').onclick = () => { cfg.rows = BASE_GROUPS.slice(); selectionChanged(); };
$('noneBtn').onclick = () => { cfg.rows = []; selectionChanged(); };

function applyCollapsed(v) {
  document.body.classList.toggle('collapsed', v);
}
function setCollapsed(v) {
  cfg.collapsed = v; save();
  applyCollapsed(v);
}
$('collapse').onclick = () => setCollapsed(true);
$('reopen').onclick = () => setCollapsed(false);

// Sahneye tıklamakla harf DEĞİŞMEZ.
//
// Bu bir duvar kâğıdı: masaüstünde çalışırken pencerenin üstüne denk gelen her
// tıklama harfi atlatıyor ve iş yapmayı zorlaştırıyordu. Harf değiştirmek artık
// yalnızca klavyeyle (boşluk / ok tuşları) ya da zamanlayıcıyla olur.

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(1); }
  else if (e.key === 'ArrowLeft') next(-1);
  else if (e.key.toLowerCase() === 'a') setCollapsed(!cfg.collapsed);
});

// Sunucu ayakta kalsın diye ara ara selam: kimse kullanmıyorsa kendini kapatır.
if (SERVED) setInterval(() => { fetch('alive', { cache: 'no-store' }).catch(() => {}); }, 120000);

(async () => {
  cfg = await loadCfg();
  // Kayitli secim ile bugunku satir listesi uyusmayabilir (dosya elle duzenlenmis
  // olabilir, ya da uretici yeniden calisip satir adlari degismis olabilir).
  // Tanimadigimiz adlari at; geriye bir sey kalmazsa temel satirlara don ki
  // duvar kagidi asla bos ekran gostermesin.
  cfg.rows = (Array.isArray(cfg.rows) ? cfg.rows : []).filter((g) => GROUPS.includes(g));
  if (!cfg.rows.length) cfg.rows = BASE_GROUPS.slice();
  applyCollapsed(cfg.collapsed);
  buildDeck();
  paintRows();
  paintSettings();
  render();
  restart();
})();
</script>
</body>
</html>
`

build()
