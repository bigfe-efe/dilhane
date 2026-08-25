import type { Exercise, Lesson, Unit } from '@/types'
import { CONFUSING_PAIRS, HIRAGANA, KATAKANA } from './kana'
import { ex } from './lesson-helpers'
import { shuffle } from '@/lib/shuffle'
import { LESSONS_GENKI } from './lessons-genki'

// Japonca müfredatı. Sıfırdan başlar: önce yazı sistemi, sonra ilk cümleler.
// Her ders: anlatım → tanışma → alıştırma sırasını izler.

export const UNITS_JA: Unit[] = [
  {
    lang: 'ja',
    number: 1,
    title: 'Hiragana — ilk alfabe',
    description: 'Japoncanın temel alfabesi. Bittiğinde her Japonca kelimeyi okuyabileceksin.',
    level: 'N5',
  },
  {
    lang: 'ja',
    number: 2,
    title: 'Katakana — yabancı kelimeler',
    description: 'Yabancı kökenli kelimeler, isimler ve markalar bu alfabeyle yazılır.',
    level: 'N5',
  },
  {
    lang: 'ja',
    number: 3,
    title: 'İlk cümleler · Genki 1–4',
    description: 'Kendini tanıtma, nesneleri gösterme, günlük eylemler, "var/yok" ayrımı.',
    level: 'N5',
  },
  {
    lang: 'ja',
    number: 4,
    title: 'Betimleme ve bağlama · Genki 5–8',
    description: 'Sıfatlar, て formu, süregelen eylemler, sade biçim ve düşünce aktarma.',
    level: 'N5',
  },
  {
    lang: 'ja',
    number: 5,
    title: 'Anlatma ve açıklama · Genki 9–12',
    description: 'İsim niteleme, karşılaştırma, deneyim, tavsiye ve zorunluluk.',
    level: 'N5',
  },
  {
    lang: 'ja',
    number: 6,
    title: 'Kanji · N5 seti',
    description: '106 N5 kanjisi konu konu: sayılar, zaman, insan, okul, fiiller, yer, sıfatlar.',
    level: 'N5',
  },
]

// ————————————————————————— Yardımcılar —————————————————————————

const { mcq, dict, writeEx, match } = ex

/**
 * Bir soru için çeldirici karakterleri seçer.
 *
 * Altın kural: çeldirici YALNIZCA öğrencinin daha önce gördüğü karakterlerden
 * seçilir — önce bu dersinkiler, sonra önceki derslerinkiler. Hiç görülmemiş
 * bir karakter şık olarak çıkarsa öğrenci "bunu tanımıyorum, demek ki cevap
 * değil" diyip eleyerek doğruya ulaşır; soru o anda ölçmeyi bırakır.
 *
 * Sıralama içinde, o karakterle görsel olarak karışan çiftler öne alınır —
 * asıl öğretici olan şık odur.
 */
function distractorsFor(
  target: (typeof HIRAGANA)[number],
  lessonPool: typeof HIRAGANA,
  earlierPool: typeof HIRAGANA,
  count = 3,
): typeof HIRAGANA {
  const confusable = CONFUSING_PAIRS.flatMap(([a, b]) =>
    a === target.char ? [b] : b === target.char ? [a] : [],
  )
  const isConfusable = (k: (typeof HIRAGANA)[number]) => confusable.includes(k.char)

  const ranked = [
    ...lessonPool.filter(isConfusable),
    ...earlierPool.filter(isConfusable),
    ...shuffle(lessonPool),
    ...shuffle(earlierPool),
  ]

  const out: typeof HIRAGANA = []
  for (const k of ranked) {
    if (k.char === target.char || k.romaji === target.romaji) continue
    if (out.some((x) => x.char === k.char || x.romaji === k.romaji)) continue
    out.push(k)
    if (out.length === count) break
  }
  return out
}

/**
 * Bir kana grubu için alıştırma bölümleri.
 *
 * `seenBefore`: önceki derslerde öğrenilmiş karakterler. Çeldiriciler bu ders +
 * bu liste ile sınırlıdır.
 *
 * Üç yönden sorulur — tek yön ezberi kolayca "şekil eşleştirmeye" dönüşüyor:
 *   1. karakter → okunuş   (「し」 nasıl okunur?)
 *   2. okunuş → karakter   ("şi" hangisi?)
 *   3. toplu eşleştirme    (5'li karışık liste)
 */
function kanaSections(
  chars: string[],
  all: typeof HIRAGANA,
  seenBefore: string[],
): { kind: 'exercises'; title: string; exercises: Exercise[] }[] {
  const byChar = new Map(all.map((k) => [k.char, k]))
  const lessonPool = chars.map((c) => byChar.get(c)).filter(Boolean) as typeof HIRAGANA
  const earlierPool = seenBefore.map((c) => byChar.get(c)).filter(Boolean) as typeof HIRAGANA

  // Uzun gruplarda her karakteri iki yönden sormak dersi şişiriyor; üst sınır koy
  const readAsk = shuffle(lessonPool).slice(0, Math.min(lessonPool.length, 14))
  const recogniseAsk = shuffle(lessonPool).slice(0, Math.min(lessonPool.length, 12))

  const read = readAsk.map((k) => {
    const opts = shuffle([k, ...distractorsFor(k, lessonPool, earlierPool)]).map((o) => o.romaji)
    return mcq(`「${k.char}」 nasıl okunur?`, opts, opts.indexOf(k.romaji), k.mnemonic, 'reading')
  })

  const recognise = recogniseAsk.map((k) => {
    const opts = shuffle([k, ...distractorsFor(k, lessonPool, earlierPool)]).map((o) => o.char)
    return mcq(
      `“${k.romaji}” hangisiyle yazılır?`,
      opts,
      opts.indexOf(k.char),
      k.mnemonic ?? `${k.char} = ${k.romaji}`,
      'reading',
    )
  })

  // 5'li eşleştirme turları — en fazla 3 tur
  const rounds: Exercise[] = []
  const forMatch = shuffle(lessonPool)
  for (let i = 0; i < forMatch.length && rounds.length < 3; i += 5) {
    const slice = forMatch.slice(i, i + 5)
    if (slice.length < 3) break
    rounds.push(
      match(
        'Karakterleri okunuşlarıyla eşleştir.',
        slice.map((k) => ({ left: k.char, right: k.romaji })),
      ),
    )
  }

  return [
    { kind: 'exercises', title: 'Okuma alıştırması', exercises: read },
    { kind: 'exercises', title: 'Tanıma alıştırması', exercises: recognise },
    ...(rounds.length ? [{ kind: 'exercises' as const, title: 'Eşleştirme', exercises: rounds }] : []),
  ]
}

/** Bu dersten öncekilerde öğrenilmiş karakterler. */
function charsBefore(groups: { chars: string[] }[], index: number): string[] {
  return groups.slice(0, index).flatMap((g) => g.chars)
}

// ————————————————————————— Ünite 1: Hiragana —————————————————————————

const HIRA_GROUPS: { id: string; title: string; chars: string[]; note: string }[] = [
  {
    id: 'l1',
    title: 'あ行 ve か行',
    chars: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'],
    note: `Japoncada beş sesli harf vardır: **a, i, u, e, o**. Türkçedeki karşılıklarına çok yakın söylenirler — bu, Türkçe konuşan biri için büyük bir avantajdır. Tek fark **u** sesidir: dudaklar Türkçedeki kadar yuvarlanmaz, daha düz bir "u" çıkar.

Bundan sonraki bütün heceler bu beş sesli üzerine kurulur: **k + a = か**, **k + i = き** ... Yani 46 karakteri ezberlerken aslında 5 sesli × 9 sessiz tablosunu öğreniyorsun.

Sıra çok önemli: Japon sözlükleri, klavyeler ve ders kitapları hep bu **あいうえお** sırasını kullanır.`,
  },
  {
    id: 'l2',
    title: 'さ行 ve た行',
    chars: ['さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と'],
    note: `Bu iki satırda üç tane "kural dışı" okunuş var — bunlar Türkçe konuşanı en çok şaşırtan noktalardır:

- **し** = "si" değil **şi**
- **ち** = "ti" değil **çi**
- **つ** = "tu" değil **tsu** — "ts" tek bir sestir, Türkçede "atsız" derken çıkan sese benzer

Bunların dışında satırlar düzenlidir: sa-şi-su-se-so, ta-çi-tsu-te-to.

Bir de **す** sesi: kelime sonunda gelirse "u" neredeyse yutulur → です "des" gibi duyulur.`,
  },
  {
    id: 'l3',
    title: 'な行 ve は行',
    chars: ['な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ'],
    note: `な satırı Türkçeyle birebir aynı okunur: na-ni-nu-ne-no.

は satırında dikkat edilecek tek ses **ふ**: ne tam "fu" ne tam "hu". Mum üflüyormuş gibi, dudaklar birbirine değmeden çıkarılır.

Çok önemli bir imla kuralı: **は** karakteri cümlede konu eki olarak kullanıldığında **"wa"** okunur. Aynı şekilde **へ** yön eki olduğunda **"e"** okunur. Kelime içindeyken normal okunuşlarını korurlar.

**の** hem en sık kullanılan hem de yazması en kolay kanadır — tek hamlede çizilir.`,
  },
  {
    id: 'l4',
    title: 'ま行, や行, ら行, わ行 ve ん',
    chars: ['ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'],
    note: `Son grup. Burada üç özel durum var:

**ら satırı**: Japonca "r" sesi Türkçedeki r değildir; İngilizce "l" ile Türkçe "r" arasında bir sestir. Dilin ucu damağa **bir kez hafifçe** dokunur — Türkçede "ara" derken çıkan tek vuruşlu r'ye çok yakındır. Yani Türkçe konuşan biri için doğal gelir.

**を**: sadece nesne eki olarak kullanılır ve **"o"** okunur. Kelime içinde asla geçmez.

**ん**: tek başına bir hece sayılır ve kelime başında bulunmaz. Sonrasında gelen harfe göre sesi değişir: "n", "m" veya genizden "ng" gibi çıkabilir (せんぱい ≈ "sempai").

Bunu bitirince temel hiragana tamam — 46 karakter.`,
  },
  {
    id: 'l5',
    title: 'Dakuten, handakuten ve yōon',
    chars: ['が', 'ざ', 'だ', 'ば', 'ぱ', 'きゃ', 'しゃ', 'ちゃ'],
    note: `Yeni karakter ezberlemeyeceksin — bildiklerinin üstüne **işaret** ekleyeceksin.

**Dakuten (″)** sessizi yumuşatır:
か→が (ka→ga), さ→ざ (sa→za), た→だ (ta→da), は→ば (ha→ba)

**Handakuten (°)** sadece は satırına gelir:
は→ぱ (ha→pa)

**Yōon**: い ile biten bir kananın yanına **küçük** ゃ/ゅ/ょ konur ve iki karakter **tek hece** okunur:
き + ゃ = きゃ (kya) — "ki-ya" değil, tek hecede "kya"

Küçük ile büyük yazımın farkına dikkat: きゃ (kya) ≠ きや (ki-ya).

Bir de **küçük っ** var: sonraki sessizi ikizler, arada kısa bir duraklama olur. きって = "kit-te".`,
  },
]

/** Alıştırma sayısına göre kabaca süre — okuma/anlatım için 8 dakika taban. */
function estimate(sections: { kind: string; exercises?: Exercise[] }[]): number {
  const count = sections.reduce((n, s) => n + (s.exercises?.length ?? 0), 0)
  return 8 + Math.round(count * 0.45)
}

const unit1: Lesson[] = HIRA_GROUPS.map((g, i) => {
  const drills = kanaSections(g.chars, HIRAGANA, charsBefore(HIRA_GROUPS, i))
  const writing = {
    kind: 'exercises' as const,
    title: 'Yazma alıştırması',
    exercises: g.chars.slice(0, 6).map((c) => {
      const k = HIRAGANA.find((x) => x.char === c)!
      return writeEx(c, k.romaji)
    }),
  }

  return {
    id: `ja-u1-${g.id}`,
    lang: 'ja' as const,
    unit: 1,
    order: i + 1,
    title: `Hiragana ${i + 1}: ${g.title}`,
    subtitle: `${g.chars.length} karakter`,
    level: 'N5' as const,
    skills: ['reading', 'writing'],
    objectives: [
      `${g.title} karakterlerini tanı ve oku`,
      'Okunuştan karakteri, karakterden okunuşu bulabil',
      'Her karakteri doğru çizgi sırasıyla yaz',
    ],
    estMinutes: estimate([...drills, writing]),
    requires: i > 0 ? [`ja-u1-${HIRA_GROUPS[i - 1].id}`] : undefined,
    sections: [
      { kind: 'teach' as const, title: 'Bu derste ne var?', body: g.note },
      { kind: 'kana' as const, title: 'Karakterler', chars: g.chars },
      ...drills,
      writing,
    ],
  }
})

// Ünite 1'e özel ek dersler
unit1.push({
  id: 'ja-u1-l6',
  lang: 'ja',
  unit: 1,
  order: 6,
  title: 'Hiragana pekiştirme: karışan çiftler',
  subtitle: 'En çok karıştırılan karakterler',
  level: 'N5',
  skills: ['reading', 'writing'],
  objectives: ['Birbirine benzeyen kanaları ayırt et', 'İlk gerçek kelimeleri oku'],
  estMinutes: 12,
  requires: ['ja-u1-l5'],
  sections: [
    {
      kind: 'teach',
      title: 'Benzeyenleri ayırmak',
      body: `Hiragana öğrenirken herkes aynı çiftlerde takılır. İşte ayırt etme püf noktaları:

- **あ / お** — あ'nın ortasında çapraz bir kesişme var, お'nun sağ üstünde küçük bir nokta.
- **ぬ / め** — ぬ'nun sonunda **ilmek** var, め'de yok.
- **ね / れ / わ** — üçünün de solu aynı. Sağ tarafa bak: ね ilmekli, れ dışa savrulmuş, わ içe kıvrılmış.
- **る / ろ** — る ilmekli, ろ ilmeksiz.
- **は / ほ** — ほ'da bir çizgi fazla.
- **さ / ち** — birbirinin ayna görüntüsü gibi. さ sola, ち sağa bakar.

İpucu: karıştığında **kelime içinde** hatırlamaya çalış. わたし (ben) kelimesindeki わ, ねこ (kedi) kelimesindeki ね.`,
    },
    {
      kind: 'exercises',
      title: 'Ayırt etme',
      exercises: [
        mcq('Hangisi "nu" okunur?', ['ぬ', 'め', 'ね', 'れ'], 0, 'ぬ ilmeklidir; め ilmeksiz "me" okunur.'),
        mcq('Hangisi "wa" okunur?', ['ね', 'れ', 'わ', 'ゎ'], 2, 'わ\'nın sağ tarafı içe kıvrılır.'),
        mcq('「ろ」 nasıl okunur?', ['ru', 'ro', 're', 'ra'], 1, 'る ilmekli (ru), ろ ilmeksiz (ro).'),
        mcq('「ち」 nasıl okunur?', ['sa', 'chi', 'ki', 'ta'], 1, 'さ ile ayna görüntüsü gibidir ama ち "çi" okunur.'),
        mcq('「わたし」 ne demek?', ['sen', 'ben', 'o', 'biz'], 1, 'わたし = ben.'),
        mcq('「ねこ」 ne demek?', ['köpek', 'kedi', 'kuş', 'balık'], 1, 'ねこ = kedi.'),
        dict('やま', ['やま', 'yama'], 'dağ'),
        dict('そら', ['そら', 'sora'], 'gökyüzü'),
      ],
    },
  ],
})

// ————————————————————————— Ünite 2: Katakana —————————————————————————

const KATA_GROUPS: { id: string; title: string; chars: string[]; note: string }[] = [
  {
    id: 'l1',
    title: 'ア行 〜 ト',
    chars: ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト'],
    note: `Katakana, hiragana ile **aynı sesleri** yazar — yani yeni bir ses sistemi öğrenmiyorsun, aynı tabloya ikinci bir yazı biçimi öğreniyorsun.

Nerede kullanılır?
- Yabancı kökenli kelimeler: コーヒー (kahve), テレビ (televizyon)
- Yabancı isimler ve ülkeler: トルコ (Türkiye), エフェ
- Hayvan/bitki adları (bilimsel bağlamda), markalar
- Vurgu için (Türkçede italik kullanır gibi)

Şekilleri hiraganaya göre daha **köşeli ve düz**dür. Uzatma işareti **ー** sadece katakanada kullanılır: コーヒー'deki çizgi, önceki sesliyi uzatır.

⚠️ En kritik ikili: **シ (shi) / ツ (tsu)** ve **ソ (so) / ン (n)**. Ayrım çizgilerin **yönündedir**: シ ve ン soldan sağa yukarı doğru, ツ ve ソ yukarıdan aşağı doğru çizilir.`,
  },
  {
    id: 'l2',
    title: 'ナ行 〜 ン',
    chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン'],
    note: `Katakananın ikinci yarısı. Bazıları hiragana karşılığına şaşırtıcı derecede benzer: **リ / り**, **ヘ / へ**, **モ / も**.

Katakanaya özgü bir özellik: yabancı sesleri yazabilmek için **yeni birleşimler** üretilir:
- **ファ フィ フェ フォ** → fa, fi, fe, fo (フ + küçük sesli)
- **ヴ** → v sesi (nadir; genelde ブ ile yazılır)
- **ティ / ディ** → ti / di
- **ウェ** → we

Böylece Türkçe isimler de yazılabilir: エフェ (Efe), メフメット (Mehmet), イスタンブール (İstanbul).

Not: Japoncada sessiz harfler tek başına duramaz (tek istisna ん/ン). Bu yüzden yabancı kelimelere sesli eklenir: "text" → テキスト (te-ki-su-to).`,
  },
]

const unit2: Lesson[] = KATA_GROUPS.map((g, i) => {
  const drills = kanaSections(g.chars, KATAKANA, charsBefore(KATA_GROUPS, i))
  return {
    id: `ja-u2-${g.id}`,
    lang: 'ja' as const,
    unit: 2,
    order: i + 1,
    title: `Katakana ${i + 1}: ${g.title}`,
    subtitle: `${g.chars.length} karakter`,
    level: 'N5' as const,
    skills: ['reading', 'writing'],
    objectives: ['Katakana karakterlerini tanı', 'Yabancı kökenli kelimeleri oku', 'Kendi adını katakana ile yaz'],
    estMinutes: estimate(drills),
    requires: i === 0 ? ['ja-u1-l6'] : [`ja-u2-${KATA_GROUPS[i - 1].id}`],
    sections: [
      { kind: 'teach' as const, title: 'Katakana nedir?', body: g.note },
      { kind: 'kana' as const, title: 'Karakterler', chars: g.chars },
      ...drills,
    ],
  }
})

unit2.push({
  id: 'ja-u2-l3',
  lang: 'ja',
  unit: 2,
  order: 3,
  title: 'Katakana ile gerçek kelimeler',
  subtitle: 'Günlük hayatta göreceğin yazılar',
  level: 'N5',
  skills: ['reading', 'listening'],
  objectives: ['Yaygın katakana kelimelerini çöz', 'Uzatma çizgisini doğru okumayı öğren'],
  estMinutes: 12,
  requires: ['ja-u2-l2'],
  sections: [
    {
      kind: 'teach',
      title: 'Katakana kelimeleri çözmek',
      body: `Katakana kelimeler genelde İngilizceden gelir. Kuralı bilirsen tahmin etmek kolaylaşır:

- Sessiz harfe **u** eklenir: "milk" → ミルク (mi-ru-ku)
- "t" ve "d" sonrası **o** gelir: "hint" → ヒント
- "l" sesi **ら satırıyla** yazılır: "hotel" → ホテル
- Uzun sesliler **ー** ile gösterilir: "coffee" → コーヒー

Deneme: **パソコン** ne olabilir? (personal computer → pa-so-kon)
**アルバイト** ne? (Almanca "Arbeit" → yarı zamanlı iş)

İpucu: sesli okuyunca tanıman çok kolaylaşır. Gözle çözmeye çalışma, **sesli oku**.`,
    },
    {
      kind: 'exercises',
      title: 'Kelime çözme',
      exercises: [
        mcq('「コーヒー」 ne demek?', ['çay', 'kahve', 'kola', 'su'], 1, 'ko-o-hi-i → coffee'),
        mcq('「テレビ」 ne demek?', ['telefon', 'televizyon', 'tablet', 'radyo'], 1, 'te-re-bi → television'),
        mcq('「トルコ」 ne demek?', ['Toronto', 'Türkiye', 'Tokyo', 'Toskana'], 1, 'to-ru-ko → Türkiye'),
        mcq('「パン」 ne demek?', ['tava', 'ekmek', 'panda', 'pantolon'], 1, 'Portekizceden gelir: pão → ekmek'),
        mcq('「ホテル」 ne demek?', ['hastane', 'otel', 'okul', 'ev'], 1, 'ho-te-ru → hotel'),
        mcq('「タクシー」 ne demek?', ['taksi', 'tren', 'otobüs', 'bisiklet'], 0, 'ta-ku-shi-i → taxi'),
        dict('アイスクリーム', ['アイスクリーム', 'aisukuriimu'], 'dondurma'),
        dict('レストラン', ['レストラン', 'resutoran'], 'restoran'),
      ],
    },
  ],
})


export const LESSONS_JA: Lesson[] = [...unit1, ...unit2, ...LESSONS_GENKI]
