/**
 * KanjiVG'den çizgi sırası (stroke order) verisini BİR KEZ indirip
 * uygulamaya gömer. Ürettiği JSON'lar public/strokes/ altına yazılır,
 * PWA önbelleğine girer — sonrasında tamamen çevrimdışı çalışır.
 *
 * Kullanım:
 *   npm run gen:strokes              (eksikleri indir)
 *   npm run gen:strokes -- --force   (hepsini yeniden indir)
 *
 * Veri kaynağı: KanjiVG — http://kanjivg.tagaini.net
 * Lisans: Creative Commons Attribution-Share Alike 3.0
 * Telif: Copyright (C) 2009-2011 Ulrich Apel.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { HIRAGANA, KATAKANA } from '../src/content/ja/kana'
import { KANJI_N5 } from '../src/content/ja/kanji-n5'

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji'
const OUT_DIR = join('public', 'strokes')

const args = process.argv.slice(2)
const force = args.includes('--force')

/** Bir karakterin KanjiVG dosya adı: kod noktasının 5 haneli hex hâli. */
function fileNameFor(char: string): string {
  return char.codePointAt(0)!.toString(16).padStart(5, '0') + '.svg'
}

export interface StrokeData {
  /** SVG path "d" dizileri — çizim sırasına göre */
  s: string[]
  /** Her çizginin numara etiketinin konumu [x, y] */
  n: [number, number][]
  /** viewBox kenar uzunluğu (KanjiVG hep 109) */
  v: number
}

/** KanjiVG SVG'sinden yalnız gereken veriyi çıkarır. */
function parse(svg: string): StrokeData | null {
  const paths = [...svg.matchAll(/<path[^>]*\bid="kvg:[^"]*-s(\d+)"[^>]*\bd="([^"]+)"/g)]
  if (!paths.length) return null

  // id'deki sıra numarasına göre diz — dosyada sıralı gelir ama garanti edelim
  paths.sort((a, b) => Number(a[1]) - Number(b[1]))

  // Numara etiketleri ayrı bir <g> içinde matrix(1 0 0 1 x y) ile konumlanır
  const labels = [...svg.matchAll(/<text transform="matrix\([\d.\-\s]*?([\d.\-]+)\s+([\d.\-]+)\)">/g)].map(
    (m) => [Number(m[1]), Number(m[2])] as [number, number],
  )

  const viewBox = svg.match(/viewBox="0 0 (\d+) \d+"/)
  return {
    s: paths.map((p) => p[2]),
    n: labels.slice(0, paths.length),
    v: viewBox ? Number(viewBox[1]) : 109,
  }
}

async function fetchChar(char: string): Promise<StrokeData | null> {
  const res = await fetch(`${BASE}/${fileNameFor(char)}`)
  if (!res.ok) return null
  return parse(await res.text())
}

/** Bir karakter kümesini indirip tek bir JSON dosyasına yazar. */
async function build(name: string, chars: string[]) {
  const out = join(OUT_DIR, `${name}.json`)
  const existing: Record<string, StrokeData> = !force && existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {}

  const todo = chars.filter((c) => !existing[c])
  if (!todo.length) {
    console.log(`${name}: zaten tam (${Object.keys(existing).length} karakter)`)
    return
  }

  console.log(`${name}: ${todo.length} karakter indiriliyor...`)
  const missing: string[] = []
  let done = 0

  for (const char of todo) {
    try {
      const data = await fetchChar(char)
      if (data) existing[char] = data
      else missing.push(char)
    } catch {
      missing.push(char)
    }
    if (++done % 25 === 0) {
      process.stdout.write(`  ${done}/${todo.length}\n`)
      writeFileSync(out, JSON.stringify(existing))
    }
  }

  writeFileSync(out, JSON.stringify(existing))
  const kb = Math.round(readFileSync(out).byteLength / 1024)
  console.log(`${name}: ${Object.keys(existing).length} karakter · ${kb} KB → ${out}`)
  if (missing.length) console.log(`  bulunamadı (${missing.length}): ${missing.join(' ')}`)
}

// Yōon (きゃ gibi) iki karakterden oluşur; tek tek indirmek yeterli.
// Küçük kana da ayrı kod noktasıdır, onları da listeye kat.
const SMALL_KANA = ['ゃ', 'ゅ', 'ょ', 'っ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ャ', 'ュ', 'ョ', 'ッ']

function uniqueChars(list: string[]): string[] {
  return [...new Set(list.flatMap((s) => [...s]))]
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const kana = uniqueChars([...HIRAGANA.map((k) => k.char), ...KATAKANA.map((k) => k.char), ...SMALL_KANA])
  const kanji = KANJI_N5.map((k) => k.char)

  await build('kana', kana)
  await build('kanji', kanji)

  console.log('\nVeri kaynağı: KanjiVG (CC BY-SA 3.0) — http://kanjivg.tagaini.net')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
