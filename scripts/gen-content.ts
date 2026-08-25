/**
 * Anthropic API ile ders içeriği üretir ve JSON olarak diske yazar.
 *
 * Bu script de derleme öncesi elle çalıştırılır — uygulama çalışırken hiçbir
 * API çağrısı yapılmaz. Üretilen JSON src/content/generated/ altına yazılır ve
 * uygulamaya gömülür.
 *
 * Kullanım:
 *   npm run gen:content -- --lang ja --topic "て formu" --level N5 --count 12
 *   npm run gen:content -- --lang en --topic "present perfect" --level B1 --count 15
 *   npm run gen:content -- --lang ja --vocab --topic "mutfak ve yemek" --count 25
 *
 * Ortam değişkeni (.env.local):
 *   ANTHROPIC_API_KEY=...
 */
import Anthropic from '@anthropic-ai/sdk'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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
const flag = (n: string) => args.includes(`--${n}`)
const value = (n: string) => {
  const i = args.indexOf(`--${n}`)
  return i >= 0 ? args[i + 1] : undefined
}

const lang = (value('lang') ?? 'ja') as 'ja' | 'en'
const topic = value('topic') ?? ''
const level = value('level') ?? (lang === 'ja' ? 'N5' : 'B1')
const count = Number(value('count') ?? 12)
const OUT_DIR = join('src', 'content', 'generated')

if (!topic) {
  console.error('--topic zorunlu. Örnek: --topic "て formu"')
  process.exit(1)
}

// ————————————————————————— Şemalar —————————————————————————
// Structured outputs kısıtları: her object additionalProperties:false ve
// required içermeli; minLength/maximum gibi kısıtlar desteklenmez.

const EXERCISE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['exercises'],
  properties: {
    exercises: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'prompt', 'skill', 'options', 'answer', 'explanation'],
            properties: {
              type: { type: 'string', enum: ['mcq'] },
              prompt: { type: 'string', description: 'Türkçe soru kökü' },
              skill: { type: 'string', enum: ['reading', 'grammar', 'vocab', 'listening'] },
              options: { type: 'array', items: { type: 'string' } },
              answer: { type: 'integer', description: 'Doğru şıkkın 0 tabanlı sırası' },
              explanation: { type: 'string', description: 'Türkçe kısa açıklama' },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'prompt', 'skill', 'sentence', 'answers', 'translation', 'hint'],
            properties: {
              type: { type: 'string', enum: ['fill'] },
              prompt: { type: 'string' },
              skill: { type: 'string', enum: ['grammar', 'vocab'] },
              sentence: { type: 'string', description: 'Boşluk için ___ kullan' },
              answers: { type: 'array', items: { type: 'string' } },
              translation: { type: 'string', description: 'Türkçe çeviri' },
              hint: { type: 'string' },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'prompt', 'skill', 'source', 'answers', 'direction'],
            properties: {
              type: { type: 'string', enum: ['translate'] },
              prompt: { type: 'string' },
              skill: { type: 'string', enum: ['writing'] },
              source: { type: 'string' },
              answers: { type: 'array', items: { type: 'string' } },
              direction: { type: 'string', enum: ['to-target', 'to-tr'] },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'prompt', 'skill', 'tokens', 'translation'],
            properties: {
              type: { type: 'string', enum: ['order'] },
              prompt: { type: 'string' },
              skill: { type: 'string', enum: ['grammar'] },
              tokens: { type: 'array', items: { type: 'string' }, description: 'Doğru sıradaki parçalar' },
              translation: { type: 'string' },
            },
          },
        ],
      },
    },
  },
} as const

const VOCAB_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['words'],
  properties: {
    words: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['term', 'reading', 'tr', 'pos', 'example', 'exampleReading', 'exampleTr'],
        properties: {
          term: { type: 'string' },
          reading: { type: 'string', description: 'Japoncada kana okunuşu; İngilizcede Türkçe okunuş ipucu' },
          tr: { type: 'string', description: 'Türkçe anlam' },
          pos: { type: 'string', description: 'isim / fiil / sıfat / zarf / kalıp' },
          example: { type: 'string' },
          exampleReading: { type: 'string', description: 'Japoncada kana okunuşu, İngilizcede boş bırak' },
          exampleTr: { type: 'string' },
        },
      },
    },
  },
} as const

// ————————————————————————— İstemler —————————————————————————

const SHARED_RULES = `
Kurallar:
- Bütün yönerge, açıklama ve çeviriler TÜRKÇE olacak.
- Hedef dildeki metinler doğal ve dilbilgisel olarak kusursuz olmalı.
- Türkçe konuşan birinin bu konuda yaptığı TİPİK HATALARI hedef al: çeldirici şıklar rastgele değil, gerçek hata kalıplarından türetilsin.
- Aynı kalıbı tekrarlama; her alıştırma farklı bir yönü sınasın.
- Boşluk doldurmada boşluk için tam olarak üç alt çizgi (___) kullan.
- Sıralama alıştırmasında "tokens" dizisi DOĞRU sırada olsun; karıştırmayı uygulama yapar.
- Çoktan seçmelide "answer" alanı doğru şıkkın 0 tabanlı indeksidir.
`

const jaExtra = `
Japoncaya özel:
- Kanji kullanırken okunuşu ayrıca ver veya seviyeye uygun kanji seç (N5 için ilkokul 1-2 kanjileri).
- Edat seçimi (は/が/を/に/で/へ) sorularında çeldiriciler gerçekçi olsun.
- Fiil çekimlerinde godan/ichidan ayrımını bilinçli sına.
`

const enExtra = `
İngilizceye özel:
- Türkçede karşılığı olmayan ayrımları (present perfect vs past simple, artikel, phrasal verb ayrılabilirliği) öne çıkar.
- Cümleler günlük ve doğal olsun; ders kitabı kokmasın.
- ${level === 'B2' || level === 'C1' ? 'Bu seviyede soru kökleri İngilizce olabilir, açıklamalar yine Türkçe kalsın.' : 'Soru kökleri Türkçe olsun.'}
`

// ————————————————————————— Üretim —————————————————————————

const client = new Anthropic()

async function generate(schema: unknown, prompt: string): Promise<unknown> {
  const stream = client.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: schema as Record<string, unknown> },
    },
    system:
      'Sen deneyimli bir dil öğretmenisin. Türkçe ana dili olan bir yetişkin için ' +
      'alıştırma ve kelime materyali hazırlıyorsun. Çıktın doğrudan bir uygulamaya ' +
      'gömülecek; bu yüzden dilbilgisi hatası, tutarsız okunuş veya uydurma kelime kabul edilemez.',
    messages: [{ role: 'user', content: prompt }],
  })

  const message = await stream.finalMessage()
  if (message.stop_reason === 'refusal') {
    throw new Error('Model isteği reddetti.')
  }
  const text = message.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('')
  return JSON.parse(text)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY tanımlı değil. .env.local dosyasına ekle.')
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const langName = lang === 'ja' ? 'Japonca' : 'İngilizce'
  const slug = `${lang}-${topic.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-|-$/g, '')}`

  if (flag('vocab')) {
    const prompt = `${langName} öğrenen, ${level} seviyesinde bir Türk için "${topic}" temasında ${count} kelimelik bir liste hazırla.

Her kelime için: hedef dildeki yazımı, okunuşu, Türkçe anlamı, türü ve bir örnek cümle (okunuşu ve Türkçe çevirisiyle).

${SHARED_RULES}
${lang === 'ja' ? jaExtra : enExtra}

Kelimeler gerçekten kullanılan, günlük hayatta işe yarayan kelimeler olsun; sözlükten rastgele seçilmiş nadir kelimeler değil.`

    const data = (await generate(VOCAB_SCHEMA, prompt)) as { words: unknown[] }
    const file = join(OUT_DIR, `vocab-${slug}.json`)
    writeFileSync(file, JSON.stringify({ lang, level, topic, words: data.words }, null, 2))
    console.log(`\n✓ ${data.words.length} kelime yazıldı → ${file}`)
    console.log(`\nKullanmak için src/content/${lang}/vocab.ts içine aktar veya doğrudan import et.\n`)
    return
  }

  const prompt = `${langName} öğrenen, ${level} seviyesinde bir Türk için "${topic}" konusunda ${count} alıştırma hazırla.

Alıştırma tiplerini karıştır: çoktan seçmeli (mcq), boşluk doldurma (fill), çeviri (translate) ve cümle sıralama (order). Kolaydan zora doğru ilerlesin.

${SHARED_RULES}
${lang === 'ja' ? jaExtra : enExtra}`

  const data = (await generate(EXERCISE_SCHEMA, prompt)) as { exercises: Record<string, unknown>[] }

  // Uygulamanın beklediği biçime çevir: her alıştırmaya benzersiz id ekle
  const exercises = data.exercises.map((ex, i) => ({ id: `gen-${slug}-${i + 1}`, ...ex }))

  const file = join(OUT_DIR, `exercises-${slug}.json`)
  writeFileSync(file, JSON.stringify({ lang, level, topic, exercises }, null, 2))

  console.log(`\n✓ ${exercises.length} alıştırma yazıldı → ${file}`)
  console.log('\nKullanmak için bir derse ekle:')
  console.log(`  import data from '@/content/generated/exercises-${slug}.json'`)
  console.log(`  { kind: 'exercises', title: '${topic}', exercises: data.exercises as Exercise[] }\n`)
  console.log('⚠  Üretilen içeriği kullanmadan önce gözden geçir — model hata yapabilir.\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
