import type { ExamRecord } from '@/db/db'

// Öğrenme rotası ve kişisel çalışma planı.
//
// SIRA NEDEN BÖYLE — "hiragana bitti, şimdi ne?" sorusunun cevabı:
//
// 1. KATAKANA, kanji değil. Katakana yeni öğrendiğin sistemin aynısıdır:
//    aynı 46 ses, aynı okunuşlar, sadece biçimler değişir. Bu yüzden bir
//    haftada biter. Kanji ise aylar sürer. Ayrıca katakana olmadan menü,
//    marka, ülke adı ve ders kitabındaki kelime listelerinin yarısı okunmaz.
//
// 2. KANJİYİ AYRI ÇALIŞMAK YANLIŞ. Genki kanjiyi 3. dersten itibaren, o
//    dersin kelimeleriyle birlikte verir. Kanjiyi listeden ezberlemek —
//    "N5'in 100 kanjisi" gibi — işe yaramaz, çünkü karakteri asacağın bir
//    kelime yoktur. Kanji, kelimeyle birlikte öğrenilir.
//
// 3. KELİME TEK BAŞINA DA YETMEZ. Dilbilgisi olmadan kelimeler cümle olmaz.
//    Genki her derste üçünü birden verir: kelime + dilbilgisi + kanji.
//
// Yani doğru cevap "katakana → sonra Genki derslerini sırayla" — kanji ve
// kelime bu derslerin İÇİNDE gelir, ayrı bir uğraş değildir.
//
// Referans: Genki I (3. baskı), 12 ders. Buradaki sıralama o kitabın ders
// sırasını izler; içerik uygulamanın kendi anlatımıdır.

export interface Stage {
  id: string
  glyph: string
  title: string
  sub: string
  /** Kabaca ne kadar sürer */
  duration: string
  /** Bu aşamada tam olarak ne yapılır */
  what: string[]
  /** Neden şimdi bu — sıralamanın gerekçesi */
  why: string
  /** İlerleme bu derslerden hesaplanır */
  lessonIds: string[]
  link: { to: string; label: string }
}

const HIRAGANA_LESSONS = ['ja-u1-l1', 'ja-u1-l2', 'ja-u1-l3', 'ja-u1-l4', 'ja-u1-l5', 'ja-u1-l6']
const KATAKANA_LESSONS = ['ja-u2-l1', 'ja-u2-l2', 'ja-u2-l3']

export const ROADMAP: Stage[] = [
  {
    id: 'hiragana',
    glyph: 'あ',
    title: 'Hiragana',
    sub: '46 temel + dakuten + yōon',
    duration: '1–2 hafta',
    what: [
      'Bütün karakterleri hem tanı hem de kâğıda yazabil',
      'Karışan çiftleri ayır: さ/き, ぬ/め, れ/わ/ね',
      'Sadece hiragana yazılan kelimeleri akıcı sök',
    ],
    why: 'Her şeyin temeli. Japoncada dilbilgisi ekleri hep hiragana yazılır; kanji bilsen de bunu okumadan cümle kuramazsın.',
    lessonIds: HIRAGANA_LESSONS,
    link: { to: '/kana/hiragana', label: 'Hiragana tablosu' },
  },
  {
    id: 'katakana',
    glyph: 'ア',
    title: 'Katakana',
    sub: 'Aynı sesler, farklı biçimler',
    duration: '~1 hafta',
    what: [
      'Aynı 46 sesi katakana biçiminde tanı',
      'シ/ツ ve ソ/ン ayrımını oturt — en çok karışan ikililer',
      'Yabancı kelime kurallarını öğren: uzatma çizgisi ー, ミルク gibi',
    ],
    why: 'Hiragana’yı bitirmişken katakana bir haftada biter: sistem aynı, sadece biçim değişiyor. Şimdi yapmazsan Genki’nin kelime listelerinin yarısını okuyamazsın.',
    lessonIds: KATAKANA_LESSONS,
    link: { to: '/kana/katakana', label: 'Katakana tablosu' },
  },
  {
    id: 'genki-1-4',
    glyph: '一',
    title: 'Genki I · Ders 1–4',
    sub: 'Cümle kurmaya başla',
    duration: '4–6 hafta',
    what: [
      'です ile cümle kurmak, は/の/か edatları',
      'ます biçimi ve fiil çekiminin temeli',
      'あります/います, yer ve zaman anlatımı',
      'İlk kanjiler: sayılar, gün ve zaman (Genki de kanjiyi 3. derste başlatır)',
    ],
    why: 'Kelime ve dilbilgisini burada birlikte alırsın. Kanji de bu aşamada, kelimelerin içinde başlar — ayrı liste ezberi değil.',
    lessonIds: ['ja-g0', 'ja-g1', 'ja-g2', 'ja-g3', 'ja-g4', 'ja-kanji-1', 'ja-kanji-2'],
    link: { to: '/lessons', label: 'Derslere git' },
  },
  {
    id: 'genki-5-8',
    glyph: '二',
    title: 'Genki I · Ders 5–8',
    sub: 'て formu — dilin kalbi',
    duration: '5–7 hafta',
    what: [
      'い ve な sıfatlar, 好き, sayaçlar',
      'て formu: rica, izin, yasak, sebep, sıralama',
      'ています ile süregelen eylemler',
      'Sade biçim (普通形) ve arkadaş dili',
      'Kanji: insan, aile, okul, fiiller',
    ],
    why: 'て formu Japoncanın en çok iş gören yapısıdır; buradan sonra cümleleri birbirine bağlayabilirsin.',
    lessonIds: ['ja-g5', 'ja-g6', 'ja-g7', 'ja-g8', 'ja-kanji-3', 'ja-kanji-4', 'ja-kanji-5'],
    link: { to: '/lessons', label: 'Derslere git' },
  },
  {
    id: 'genki-9-12',
    glyph: '三',
    title: 'Genki I · Ders 9–12',
    sub: 'Geçmiş, karşılaştırma, tavsiye',
    duration: '5–7 hafta',
    what: [
      'Sade geçmiş, isim niteleme, もう/まだ',
      'Karşılaştırma: より, のほうが, 一番',
      'たい, たり〜たり, ことがある',
      'んです, すぎる, ほうがいい, なければいけない',
      'Kanji: yer, yön, doğa, sıfatlar, vücut',
    ],
    why: 'Genki I burada biter. Bu noktada N5 dilbilgisinin tamamına yakınını görmüş olursun.',
    lessonIds: ['ja-g9', 'ja-g10', 'ja-g11', 'ja-g12', 'ja-kanji-6', 'ja-kanji-7'],
    link: { to: '/lessons', label: 'Derslere git' },
  },
  {
    id: 'n5',
    glyph: '五',
    title: 'JLPT N5',
    sub: 'Sınava hazırlık',
    duration: '2–4 hafta',
    what: [
      'Eksik kalan kelime ve kanjileri tamamla',
      'Okuma hızını artır — sınavda süre dardır',
      'Deneme sınavı çöz, zayıf bölümü tekrarla (uygulamada var)',
    ],
    why: 'Genki I ≈ N5 seviyesidir. Sınava girmeyeceksen bile hedef olarak işe yarar: nerede olduğunu ölçer.',
    lessonIds: [],
    link: { to: '/n5-deneme', label: 'N5 deneme sınavına gir' },
  },
]

// ————————————————————————— Kişisel plan —————————————————————————

export interface PlanItem {
  title: string
  detail: string
  link?: { to: string; label: string }
}

export interface Plan {
  headline: string
  rationale: string
  items: PlanItem[]
  /** Rotada şu an hangi aşamadasın */
  stageId: string
  /** Bir sonraki aşamaya geçmeye hazır mısın */
  readyForNext: boolean
}

const SECTION_FIX: Record<string, { title: string; detail: string; link?: { to: string; label: string } }> = {
  tanima: {
    title: 'Karakter tanımayı pekiştir',
    detail: 'Kana tablosunu satır satır gözden geçir; her satırı bir kez sesli oku.',
    link: { to: '/kana/hiragana', label: 'Hiragana tablosu' },
  },
  hatirlama: {
    title: 'Okunuştan karaktere git',
    detail: 'Ters yönde çalış: okunuşu gör, karakteri kâğıda yaz. Tanımak kolaydır, hatırlamak zordur.',
    link: { to: '/write', label: 'Yazarak çalış' },
  },
  uretim: {
    title: 'Şıksız çalış',
    detail: 'Çoktan seçmeli testler seni aldatıyor. Kendi testinde yaz, sonra kontrol et.',
    link: { to: '/kana-test', label: 'Kendi testin' },
  },
  ayirt: {
    title: 'Karışan çiftleri ayır',
    detail: 'さ/き, ぬ/め, れ/わ/ね ikililerini yan yana koy ve tek farkı kendine anlat.',
    link: { to: '/kana/hiragana', label: 'Karışan çiftler' },
  },
  dakuten: {
    title: 'Dakuten kurallarını ezberle',
    detail: 'Dört kural: k→g, s→z, t→d, h→b. Handakuten (゜) yalnızca は satırına gelir, h→p yapar.',
    link: { to: '/kana/hiragana', label: 'Dakuten tablosu' },
  },
  yoon: {
    title: 'Yōon’u oturt',
    detail: 'きよ iki hece, きょ tek hece. Küçük ゃゅょ önceki harfe yapışır.',
    link: { to: '/kana/hiragana', label: 'Yōon tablosu' },
  },
  kelime: {
    title: 'Kelime sökme çalış',
    detail: 'Günde 10 kelime, parmakla hece hece. Harf tanımak ile okumak ayrı becerilerdir.',
    link: { to: '/kana-kelime', label: 'Kelime okuma' },
  },
  kural: {
    title: 'Küçük っ, uzun ünlü ve ん',
    detail: 'Üçü de "sessiz ama yer kaplayan" şeyler. Japoncada her hece eşit uzunlukta okunur.',
    link: { to: '/kana-kurallar', label: 'Özel kurallar sayfası' },
  },
}

/** Sınav sonucundan haftalık plan çıkarır. */
export function buildPlan(exam: ExamRecord | null, completedLessons: Set<string>): Plan {
  // Henüz ölçüm yok
  if (!exam) {
    return {
      stageId: 'hiragana',
      readyForNext: false,
      headline: 'Önce nerede olduğunu ölç',
      rationale:
        'Plan yapmak için ölçüm gerekir. Bitirme sınavı sekiz beceriyi ayrı ayrı yokluyor; sonucuna göre buraya kişisel bir plan çıkacak.',
      items: [
        {
          title: 'Hiragana bitirme sınavına gir',
          detail: '72 soru, yaklaşık 20 dakika. Hangi bölümde zayıf olduğunu tek tek gösterir.',
          link: { to: '/hiragana-sinav', label: 'Sınava gir' },
        },
      ],
    }
  }

  const zayif = Object.entries(exam.sections)
    .filter(([s, p]) => s !== 'cizim' && p < 80)
    .sort((a, b) => a[1] - b[1])

  const harfOrt =
    (['tanima', 'hatirlama', 'uretim'].reduce((a, s) => a + (exam.sections[s] ?? 0), 0)) / 3

  // ————— Hiragana henüz bitmemiş —————
  if (exam.percent < 85) {
    const items: PlanItem[] = zayif.slice(0, 3).map(([s, p]) => {
      const fix = SECTION_FIX[s] ?? { title: s, detail: '' }
      return { title: `${fix.title} (%${Math.round(p)})`, detail: fix.detail, link: fix.link }
    })
    items.push({
      title: 'Bir hafta sonra sınavı tekrar al',
      detail: 'Aynı sınav yeniden karışık üretilir. %85 üstüne çıkınca katakana’ya geçme vaktidir.',
      link: { to: '/hiragana-sinav', label: 'Bitirme sınavı' },
    })
    return {
      stageId: 'hiragana',
      readyForNext: false,
      headline: harfOrt < 60 ? 'Temele dön' : 'Hiragana’yı kapat, sonra ilerle',
      rationale:
        harfOrt < 60
          ? `Karakterlerin kendisi henüz oturmamış (%${Math.round(harfOrt)}). Katakana’ya şimdi geçmek ikisini birden karıştırmana yol açar. Tabloyu satır satır bitir.`
          : `%${Math.round(exam.percent)} aldın. Fena değil ama katakana’ya geçmeden şu birkaç boşluğu kapatmak daha hızlı ilerlemeni sağlar — eksik temelle üstüne yenisini koymak iki katı zaman alır.`,
      items,
    }
  }

  // ————— Hiragana bitti: katakana sırası —————
  const katakanaBitti = KATAKANA_LESSONS.every((id) => completedLessons.has(id))
  if (!katakanaBitti) {
    const items: PlanItem[] = [
      {
        title: 'Katakana derslerine başla',
        detail: 'Üç ders: ア行〜ト, ナ行〜ン, sonra gerçek kelimeler. Sistem hiragana ile aynı, bir haftada biter.',
        link: { to: '/lessons', label: 'Derslere git' },
      },
      {
        title: 'シ/ツ ve ソ/ン ayrımına ayrıca çalış',
        detail: 'Katakana’nın en çok karıştırılan ikilileri bunlar. Fark çizgilerin yönündedir, uzunluğunda değil.',
        link: { to: '/kana/katakana', label: 'Katakana tablosu' },
      },
      {
        title: 'Hiragana’yı bırakma',
        detail: 'Günde birkaç dakika kelime oku. Yeni alfabe öğrenirken eskisi paslanır.',
        link: { to: '/kana-kelime', label: 'Kelime okuma' },
      },
    ]
    if (zayif.length) {
      const [s, p] = zayif[0]
      const fix = SECTION_FIX[s]
      if (fix) items.push({ title: `Kalan tek boşluk: ${fix.title.toLowerCase()} (%${Math.round(p)})`, detail: fix.detail, link: fix.link })
    }
    return {
      stageId: 'katakana',
      readyForNext: true,
      headline: 'Sıra katakanada',
      rationale: `%${Math.round(exam.percent)} ile hiragana bitti sayılır. Şimdi kanji değil KATAKANA: aynı sistem olduğu için bir haftada biter, ve olmadan ders kitabındaki kelimelerin yarısı okunmaz.`,
      items,
    }
  }

  // ————— İki alfabe de bitti: Genki sırası —————
  return {
    stageId: 'genki-1-4',
    readyForNext: true,
    headline: 'Genki derslerine geç',
    rationale:
      'İki alfabe de bitti. Bundan sonra kelime, dilbilgisi ve kanji AYRI AYRI değil, her derste birlikte gelir — Genki’nin yaptığı da budur. Kanjiyi listeden ezberlemeye çalışma.',
    items: [
      {
        title: 'Sıradaki dersi aç',
        detail: 'Selamlaşmadan başla, sırayla ilerle. Her ders kelime + dilbilgisi + alıştırma içerir.',
        link: { to: '/lessons', label: 'Derslere git' },
      },
      {
        title: 'Günlük tekrarı aksatma',
        detail: 'Yeni ders açmadan önce bekleyen kartları bitir. Aralıklı tekrar olmadan yeni içerik akıp gider.',
        link: { to: '/review', label: 'Tekrar' },
      },
    ],
  }
}

/** Bir aşamanın tamamlanma oranı. */
export function stageProgress(stage: Stage, completed: Set<string>): number {
  if (!stage.lessonIds.length) return 0
  const done = stage.lessonIds.filter((id) => completed.has(id)).length
  return (done / stage.lessonIds.length) * 100
}
