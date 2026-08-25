/**
 * ElevenLabs ile ses dosyalarını BİR KEZ üretip uygulamaya gömer.
 *
 * Amaç: uygulama çalışırken hiçbir API çağrısı yapılmasın. Bu script derleme
 * öncesi elle çalıştırılır, ürettiği mp3'ler public/audio/ altına yazılır ve
 * PWA önbelleğine girer — sonrasında tamamen çevrimdışı çalışır.
 *
 * Kullanım:
 *   npm run gen:audio -- --list                 (kullanılabilir sesleri göster)
 *   npm run gen:audio -- --lang ja --limit 50   (deneme: 50 kayıt)
 *   npm run gen:audio -- --lang ja --yes        (gerçekten üret)
 *
 * Gerekli ortam değişkenleri (.env.local dosyasına yaz):
 *   ELEVENLABS_API_KEY=...
 *   ELEVENLABS_VOICE_JA=<voice_id>
 *   ELEVENLABS_VOICE_EN=<voice_id>
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Lang } from '../src/types'
import { VOCAB, GRAMMAR, LESSONS } from '../src/content'
import { HIRAGANA, KATAKANA } from '../src/content/ja/kana'
import { KANJI_N5 } from '../src/content/ja/kanji-n5'
import { TENSES } from '../src/content/en/verbs'

// ————————————————————————— Ortam —————————————————————————

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}
loadEnv()

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const API_KEY = process.env.ELEVENLABS_API_KEY
const AUDIO_DIR = join('public', 'audio')
const MANIFEST = join(AUDIO_DIR, 'manifest.json')
const MODEL_ID = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2'

// ————————————————————————— Metinleri topla —————————————————————————

interface Item {
  lang: Lang
  text: string
  /** Öncelik: düşük sayı önce üretilir (bütçe sınırlıysa önemli olanlar önce) */
  priority: number
  source: string
}

function collect(): Item[] {
  const out: Item[] = []
  const push = (lang: Lang, text: string, priority: number, source: string) => {
    const t = text.trim()
    if (t) out.push({ lang, text: t, priority, source })
  }

  // 1. Kana — en kritik, en kısa
  for (const k of [...HIRAGANA, ...KATAKANA]) {
    if (k.kind === 'base') push('ja', k.char, 1, 'kana')
  }

  // 2. Kelimeler
  for (const v of VOCAB) push(v.lang, v.term, 2, 'vocab')

  // 3. Kanji örnek kelimeleri
  for (const k of KANJI_N5) for (const w of k.words) push('ja', w.term, 3, 'kanji-word')

  // 4. Kelime örnek cümleleri
  for (const v of VOCAB) for (const ex of v.examples ?? []) push(v.lang, ex.text, 4, 'vocab-example')

  // 5. Dilbilgisi örnekleri
  for (const g of GRAMMAR) for (const ex of g.examples) push(g.lang, ex.text, 5, 'grammar-example')

  // 6. İngilizce zaman örnekleri
  for (const t of TENSES) push('en', t.example, 5, 'tense-example')

  // 7. Ders içindeki dikte ve konuşma metinleri
  for (const lesson of LESSONS) {
    for (const s of lesson.sections) {
      const exercises = s.kind === 'exercises' ? s.exercises : s.kind === 'passage' ? s.questions : []
      for (const ex of exercises) {
        if (ex.type === 'dictation') push(ex.lang, ex.text, 4, 'dictation')
        if (ex.type === 'speak') push(ex.lang, ex.text, 4, 'speak')
      }
    }
  }

  // Tekilleştir — aynı metin iki kez üretilmesin
  const seen = new Set<string>()
  return out
    .filter((i) => {
      const key = `${i.lang}:${i.text}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.priority - b.priority)
}

const fileNameFor = (lang: Lang, text: string) =>
  `${lang}-${createHash('sha1').update(`${lang}:${text}`).digest('hex').slice(0, 16)}.mp3`

// ————————————————————————— ElevenLabs —————————————————————————

async function listVoices() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': API_KEY! } })
  if (!res.ok) throw new Error(`Sesler alınamadı: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { voices: { voice_id: string; name: string; labels?: Record<string, string> }[] }
  console.log('\nKullanılabilir sesler:\n')
  for (const v of data.voices) {
    const labels = Object.values(v.labels ?? {}).join(', ')
    console.log(`  ${v.voice_id}  ${v.name.padEnd(22)} ${labels}`)
  }
  console.log('\nSeçtiğin id\'leri .env.local dosyasına yaz:')
  console.log('  ELEVENLABS_VOICE_JA=<id>')
  console.log('  ELEVENLABS_VOICE_EN=<id>\n')
  console.log('Not: Japonca için multilingual bir ses seç; eleven_multilingual_v2 modeli Japoncayı destekler.\n')
}

async function synthesize(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY!, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

// ————————————————————————— Ana akış —————————————————————————

async function main() {
  if (!API_KEY) {
    console.error('ELEVENLABS_API_KEY tanımlı değil. .env.local dosyasına ekle.')
    process.exit(1)
  }

  if (flag('list')) {
    await listVoices()
    return
  }

  mkdirSync(AUDIO_DIR, { recursive: true })
  const manifest: Record<string, string> = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
    : {}

  const langFilter = value('lang') as Lang | undefined
  const limit = Number(value('limit') ?? Infinity)

  let items = collect()
  if (langFilter) items = items.filter((i) => i.lang === langFilter)

  const voices: Partial<Record<Lang, string>> = {
    ja: process.env.ELEVENLABS_VOICE_JA,
    en: process.env.ELEVENLABS_VOICE_EN,
  }

  // Zaten üretilmiş olanları atla — script tekrar tekrar çalıştırılabilir
  const pending = items
    .filter((i) => {
      const key = `${i.lang}:${i.text}`
      const file = manifest[key]
      return !(file && existsSync(join(AUDIO_DIR, file)))
    })
    .filter((i) => {
      if (voices[i.lang]) return true
      return false
    })
    .slice(0, limit)

  const chars = pending.reduce((s, i) => s + i.text.length, 0)
  const byLang = pending.reduce<Record<string, number>>((acc, i) => {
    acc[i.lang] = (acc[i.lang] ?? 0) + 1
    return acc
  }, {})

  console.log(`\nToplam aday metin : ${items.length}`)
  console.log(`Zaten üretilmiş   : ${items.length - pending.length}`)
  console.log(`Üretilecek        : ${pending.length}  (${JSON.stringify(byLang)})`)
  console.log(`Karakter sayısı   : ${chars.toLocaleString('tr-TR')}`)
  console.log(`\nElevenLabs karakter üzerinden ücretlendirir. Bakiyeni kontrol et.`)

  for (const [lang, id] of Object.entries(voices)) {
    if (!id) console.log(`⚠  ELEVENLABS_VOICE_${lang.toUpperCase()} tanımlı değil — bu dil atlanacak.`)
  }

  if (!flag('yes')) {
    console.log('\nGerçekten üretmek için --yes ekle. Önce küçük bir denemede bulun:')
    console.log('  npm run gen:audio -- --lang ja --limit 20 --yes\n')
    return
  }

  let ok = 0
  let fail = 0
  for (const [idx, item] of pending.entries()) {
    const voiceId = voices[item.lang]!
    const file = fileNameFor(item.lang, item.text)
    try {
      const buf = await synthesize(item.text, voiceId)
      writeFileSync(join(AUDIO_DIR, file), buf)
      manifest[`${item.lang}:${item.text}`] = file
      ok++
      process.stdout.write(`\r[${idx + 1}/${pending.length}] ${item.source.padEnd(14)} ${item.text.slice(0, 28).padEnd(30)}`)
      // Her 10 kayıtta bir manifesti yaz — yarıda kesilirse ilerleme kaybolmasın
      if (ok % 10 === 0) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
    } catch (e) {
      fail++
      console.error(`\n✗ "${item.text}" → ${(e as Error).message}`)
      // Kota bittiyse devam etmenin anlamı yok
      if (String(e).includes('quota') || String(e).includes('401')) break
    }
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  console.log(`\n\nBitti. Üretilen: ${ok}, hata: ${fail}. Manifest: ${MANIFEST}`)
  console.log('Şimdi "npm run build" ile ses dosyaları uygulamaya gömülür.\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
