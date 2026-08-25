import type { Exercise, Lesson, LessonSection } from '@/types'
import { conjugationDrill, kanjiDrill, kanjiWriteDrill, particleDrill, vocabDrill } from './drills'
import {
  PSG_ICHINICHI,
  PSG_ISSHUUKAN,
  PSG_JIKO_SHOUKAI,
  PSG_KAIWA_MISE,
  PSG_KAZOKU,
  PSG_WATASHI_NO_MACHI,
} from './passages'
import { ex } from './lesson-helpers'

// Ünite 3–6: Genki (3. baskı) müfredat sırasına göre kurulmuş dersler.
//
// NEDEN GENKI SIRASI?
// Önceki sıralama benim kendi bölümlendirmemdi — makuldü ama keyfiydi.
// Genki'nin sırası on yıllardır sınıfta denenmiş: hangi yapının hangisinden
// önce gelmesi gerektiği, hangi kelimenin hangi dilbilgisini taşıyacağı
// oturmuş durumda. Kitabı almasan bile bu sıradan faydalanırsın; alırsan
// uygulama doğrudan eşlik eden alıştırma katmanı olur.
//
// NE ALINDI, NE ALINMADI:
// Yalnızca KONU SIRASI alındı — hangi dersin neyi öğrettiği. Anlatımlar,
// örnek cümleler, okuma parçaları ve alıştırmaların tamamı bu uygulamaya
// özgüdür ve Türkçe konuşan biri için yazılmıştır. Kitaptan hiçbir metin
// aktarılmamıştır.
//
// Her dersin `genki` alanı kitabın ders numarasını verir.

const { mcq, fill, dict, speakEx, order, translate } = ex

// ————————————————————————— Kelime kümeleri —————————————————————————

const V_GREET = [
  'ja-こんにちは', 'ja-おはようございます', 'ja-こんばんは', 'ja-さようなら',
  'ja-ありがとうございます', 'ja-すみません', 'ja-はじめまして', 'ja-おやすみなさい',
  'ja-いただきます', 'ja-おねがいします',
]

const V_G1 = [
  'ja-わたし', 'ja-あなた', 'ja-がくせい', 'ja-せんせい', 'ja-ともだち',
  'ja-ひと', 'ja-にほん', 'ja-とるこ', 'ja-かいしゃいん', 'ja-いしゃ',
  'ja-いま', 'ja-じかん',
]

const V_G2 = [
  'ja-これ', 'ja-それ', 'ja-あれ', 'ja-この', 'ja-その', 'ja-あの',
  'ja-ほん', 'ja-かばん', 'ja-とけい', 'ja-くるま', 'ja-おかね', 'ja-かさ',
  'ja-だれ', 'ja-なに', 'ja-いくら', 'ja-みせ',
]

const V_G3 = [
  'ja-たべる', 'ja-のむ', 'ja-みる', 'ja-きく', 'ja-はなす', 'ja-よむ', 'ja-かく',
  'ja-いく', 'ja-くる', 'ja-する', 'ja-かえる', 'ja-おきる', 'ja-ねる', 'ja-べんきょうする',
  'ja-まいにち', 'ja-きょう', 'ja-あした', 'ja-きのう',
]

const V_G4 = [
  'ja-いえ', 'ja-がっこう', 'ja-えき', 'ja-としょかん', 'ja-こうえん', 'ja-かいしゃ',
  'ja-へや', 'ja-ぎんこう', 'ja-びょういん', 'ja-つくえ', 'ja-いす', 'ja-しゅうまつ',
]

const V_G5 = [
  'ja-おおきい', 'ja-ちいさい', 'ja-あたらしい', 'ja-ふるい', 'ja-たかい', 'ja-やすい',
  'ja-おいしい', 'ja-むずかしい', 'ja-おもしろい', 'ja-いそがしい', 'ja-たのしい',
  'ja-げんき', 'ja-しずか', 'ja-きれい', 'ja-すき', 'ja-きらい', 'ja-ゆうめい',
]

const V_G6 = [
  'ja-みず', 'ja-おちゃ', 'ja-こーひー', 'ja-ごはん', 'ja-ぱん', 'ja-にく', 'ja-さかな',
  'ja-あさごはん', 'ja-ひるごはん', 'ja-ばんごはん', 'ja-まつ', 'ja-つかう', 'ja-やすむ',
]

const V_G7 = [
  'ja-かぞく', 'ja-ちち', 'ja-はは', 'ja-あに', 'ja-あね', 'ja-おとうと', 'ja-いもうと',
  'ja-こども', 'ja-おとうさん', 'ja-おかあさん', 'ja-しゃしん', 'ja-はたらく',
]

const V_G8 = [
  'ja-おもう', 'ja-いう', 'ja-りょうり', 'ja-おんがく', 'ja-えいが', 'ja-しごと',
  'ja-つくる', 'ja-おしえる', 'ja-ならう', 'ja-じょうず', 'ja-へた',
]

const V_G9 = [
  'ja-そうじ', 'ja-せんたく', 'ja-しゅくだい', 'ja-しけん', 'ja-おぼえる', 'ja-わすれる',
  'ja-はじまる', 'ja-おわる', 'ja-もう', 'ja-まだ',
]

const V_G10 = [
  'ja-りょこう', 'ja-くだもの', 'ja-てんき', 'ja-あめ', 'ja-ゆき', 'ja-らいねん',
  'ja-きょねん', 'ja-なる' /* yoksa süzülür */, 'ja-たぶん', 'ja-いつも',
]

const V_G11 = [
  'ja-かいもの', 'ja-およぐ', 'ja-はしる', 'ja-あるく', 'ja-のる', 'ja-はいる', 'ja-でる',
  'ja-ときどき', 'ja-よく', 'ja-たくさん',
]

const V_G12 = [
  'ja-あたま', 'ja-おなか', 'ja-のど', 'ja-ねつ', 'ja-かぜ', 'ja-くすり', 'ja-びょうき',
  'ja-いたい', 'ja-つかれる', 'ja-たいへん', 'ja-かんがえる',
]

/** Birikimli çeldirici havuzları — her ders öncekilerin toplamını kullanır. */
const seen: Record<number, string[]> = {}
{
  const order = [V_GREET, V_G1, V_G2, V_G3, V_G4, V_G5, V_G6, V_G7, V_G8, V_G9, V_G10, V_G11, V_G12]
  let acc: string[] = []
  order.forEach((set, i) => {
    seen[i] = acc
    acc = [...acc, ...set]
  })
}

/** Alıştırma sayısına göre kabaca süre. */
function est(...groups: Exercise[][]): number {
  return 8 + Math.round(groups.reduce((n, g) => n + g.length, 0) * 0.45)
}

/** Genki dersleri hep aynı iskelette kurulur. */
function genkiLesson(o: {
  n: number
  unit: number
  order: number
  genki: number
  title: string
  subtitle: string
  teach: string
  teachTitle: string
  grammarIds: string[]
  vocabIds: string[]
  seenIndex: number
  extra: Exercise[]
  passage?: Extract<LessonSection, { kind: 'passage' }>
  drills?: Exercise[]
  requires: string
  objectives: string[]
}): Lesson {
  const words = vocabDrill(o.vocabIds, seen[o.seenIndex] ?? [])
  const extraDrills = o.drills ?? []

  return {
    id: `ja-g${o.genki}`,
    lang: 'ja',
    unit: o.unit,
    order: o.order,
    genki: o.genki,
    title: o.title,
    subtitle: o.subtitle,
    level: 'N5',
    skills: ['grammar', 'vocab', 'reading'],
    objectives: o.objectives,
    estMinutes: est(words, extraDrills, o.extra),
    requires: [o.requires],
    sections: [
      { kind: 'teach', title: o.teachTitle, body: o.teach },
      ...(o.grammarIds.length ? [{ kind: 'grammar' as const, title: 'Dilbilgisi', grammarIds: o.grammarIds }] : []),
      { kind: 'vocab', title: 'Kelimeler', vocabIds: o.vocabIds },
      { kind: 'exercises', title: 'Kelime alıştırması', exercises: words },
      ...(extraDrills.length ? [{ kind: 'exercises' as const, title: 'Yapı alıştırması', exercises: extraDrills }] : []),
      { kind: 'exercises', title: 'Cümle alıştırması', exercises: o.extra },
      ...(o.passage ? [o.passage] : []),
    ],
  }
}

// ————————————————————————— Ünite 3 · Genki 0–4 —————————————————————————

const greetingsLesson: Lesson = {
  id: 'ja-g0',
  lang: 'ja',
  unit: 3,
  order: 1,
  genki: 0,
  title: 'Selamlaşma ve nezaket',
  subtitle: 'Genki: あいさつ bölümü',
  level: 'N5',
  skills: ['speaking', 'listening', 'vocab'],
  objectives: ['Günün saatine göre selam ver', 'Teşekkür et ve özür dile', 'Tanışma kalıbını kur'],
  estMinutes: 20,
  requires: ['ja-u2-l3'],
  sections: [
    {
      kind: 'teach',
      title: 'Japoncada nezaket',
      body: `Genki, ilk dersten önce bir **あいさつ (selamlaşma)** bölümüyle başlar. Mantığı şu: gramer öğrenmeden önce insanlarla temas kurabilmelisin.

Japoncada **kime** konuştuğun, **ne** söylediğin kadar önemlidir. Aynı cümlenin sade, kibar ve saygılı biçimleri vardır. Sen kibar biçimle (です・ます) başlayacaksın — tanımadığın herkesle güvenle kullanabileceğin düzey budur.

Selamlaşmalar günün saatine göre değişir:
- **おはようございます** — sabah (öğlene kadar)
- **こんにちは** — gündüz
- **こんばんは** — akşam

Kısaltılmış hâller yakın arkadaşlar içindir: おはよう.

**すみません** hem "affedersiniz" hem "özür dilerim" hem de "pardon, bakar mısınız" yerine geçer — Japoncada en çok işine yarayacak tek kelimedir.

Tanışma kalıbı sabittir:
はじめまして。[isim] です。よろしくおねがいします。

Son cümlenin Türkçede tam karşılığı yoktur; "bundan sonra iyi geçinelim" gibi bir dilektir ve tanışmada **söylenmesi beklenir**.`,
    },
    { kind: 'vocab', title: 'Kelimeler', vocabIds: V_GREET },
    { kind: 'exercises', title: 'Kelime alıştırması', exercises: vocabDrill(V_GREET) },
    {
      kind: 'exercises',
      title: 'Kullanım alıştırması',
      exercises: [
        mcq('Sabah birine ne dersin?', ['こんばんは', 'おはようございます', 'こんにちは', 'さようなら'], 1),
        mcq('Birine çarptın, ne dersin?', ['ありがとう', 'すみません', 'はじめまして', 'おやすみ'], 1, 'すみません hem özür hem "pardon" demektir.'),
        mcq('「よろしくおねがいします」 ne zaman söylenir?', ['Yemekten önce', 'Tanışırken', 'Uyurken', 'Ayrılırken'], 1),
        mcq('Garsonu çağırmak istiyorsun. Hangisi doğru?', ['ありがとうございます', 'すみません', 'いただきます', 'こんばんは'], 1),
        mcq('Yemeğe başlarken ne denir?', ['ごちそうさま', 'いただきます', 'おやすみなさい', 'はじめまして'], 1),
        mcq('Akşam 8’de komşunla karşılaştın.', ['おはようございます', 'こんにちは', 'こんばんは', 'さようなら'], 2),
        speakEx('こんにちは', 'こんにちは', 'Merhaba'),
        speakEx('ありがとうございます', 'ありがとうございます', 'Teşekkür ederim'),
        speakEx('はじめまして。よろしくおねがいします。', 'はじめまして。よろしくおねがいします。', 'Memnun oldum, iyi ilişkiler dilerim.'),
        dict('すみません', ['すみません'], 'Affedersiniz'),
        dict('おはようございます', ['おはようございます'], 'Günaydın'),
        dict('ありがとうございます', ['ありがとうございます'], 'Teşekkür ederim'),
      ],
    },
  ],
}

const g1 = genkiLesson({
  n: 1, unit: 3, order: 2, genki: 1, seenIndex: 1,
  title: 'Yeni tanışmalar',
  subtitle: 'AはBです · の · か · saat',
  requires: 'ja-g0',
  objectives: ['は konu ekiyle cümle kur', 'です ile kibarca bitir', 'Saat söyle', 'Soru sor'],
  teachTitle: 'İlk cümle kalıbı',
  teach: `Japonca cümlenin iskeleti Türkçeyle aynıdır: **yüklem sonda**. Bu yüzden ilk cümlen sana tuhaf gelmeyecek.

私は学生です。 → "Ben öğrenciyim."
私 (ben) は [konu eki] 学生 (öğrenci) です (‑im).

Bu derste dört şey var ve dördü birlikte tek bir cümle kurmanı sağlıyor:

**1. は** — konuyu işaretler. Yazılışı は, okunuşu **wa**. Türkçedeki "…‑e gelince" gibi düşün.
**2. です** — kibar bitiş. "‑dir" gibi.
**3. の** — iki ismi bağlar: 日本語**の**先生 = Japonca öğretmeni. Türkçedeki tamlama sırası ile aynı.
**4. か** — cümle sonuna gelir, soru yapar. "mı/mi" gibi. Soru işareti yazılmaz bile.

Sayı ve saat de bu derste gelir çünkü kendini tanıtırken yaş, telefon, saat söylemen gerekir. Saatlerde üç düzensiz okuma vardır ve ezberlemekten kaçış yok: **4時 よじ**, **7時 しちじ**, **9時 くじ**.`,
  grammarIds: ['ja-wa-desu', 'ja-ka', 'ja-no', 'ja-time'],
  vocabIds: V_G1,
  drills: particleDrill(
    [
      { sentence: '私 ___ 学生です。', answer: 'は', tr: 'Ben öğrenciyim.', why: 'konu eki' },
      { sentence: '日本語 ___ 先生', answer: 'の', tr: 'Japonca öğretmeni', why: 'iki ismi bağlar' },
      { sentence: 'あなたは先生です ___ 。', answer: 'か', tr: 'Siz öğretmen misiniz?', why: 'soru eki' },
      { sentence: 'これは私 ___ かばんです。', answer: 'の', tr: 'Bu benim çantam.', why: 'sahiplik' },
    ],
    ['は', 'の', 'か', 'が', 'を', 'に', 'も'],
  ),
  extra: [
    mcq('"Tanaka bey öğretmen değil." nasıl söylenir?', ['田中さんは先生です。', '田中さんは先生じゃないです。', '田中さんは先生でした。', '田中さんも先生です。'], 1),
    mcq('「あなたは学生ですか。」 ne demek?', ['Sen öğrencisin.', 'Öğrenci misin?', 'Ben öğrenciyim.', 'O öğrenci değil.'], 1, 'Sondaki か soruyu kurar.'),
    mcq('「四時」 nasıl okunur?', ['よんじ', 'よじ', 'しじ', 'しちじ'], 1, 'Düzensiz: よじ.'),
    mcq('「九時」 nasıl okunur?', ['きゅうじ', 'くじ', 'ここのじ', 'きゅうときい'], 1),
    mcq('「日本語の先生」 ne demek?', ['Japon öğretmen', 'Japonca öğretmeni', 'Öğretmenin Japoncası', 'Japonca ve öğretmen'], 1),
    order('Sıraya diz: "Ben Türkiyeliyim."', ['私', 'は', 'トルコ人', 'です'], 'Ben Türkiyeliyim.'),
    order('Sıraya diz: "O kişi öğretmen mi?"', ['あの', '人', 'は', '先生', 'です', 'か'], 'O kişi öğretmen mi?'),
    translate('Ben öğrenciyim.', ['私は学生です', 'わたしはがくせいです'], 'to-target'),
    translate('Arkadaşım doktor değil.', ['友だちは医者じゃないです', 'ともだちはいしゃじゃないです'], 'to-target'),
    speakEx('私はトルコ人です。', 'わたしはとるこじんです。', 'Ben Türkiyeliyim.'),
    dict('今、四時半です', ['今、四時半です', 'いま、よじはんです'], 'Şu an dört buçuk.'),
  ],
})

const g2 = genkiLesson({
  n: 2, unit: 3, order: 3, genki: 2, seenIndex: 2,
  title: 'Alışveriş',
  subtitle: 'これ・それ・あれ · も · ね/よ',
  requires: 'ja-g1',
  objectives: ['Üç mesafeli işaret sistemini kullan', 'Fiyat sor', 'ね/よ ile ton kat'],
  teachTitle: 'Mesafe üç kademelidir',
  teach: `Türkçede "bu / şu / o" deriz ve aslında üç kademeli bir sistemimiz vardır — Japonca da tam olarak öyle çalışır. İngilizcede sadece iki kademe (*this / that*) olduğu için İngilizce konuşanlar burada zorlanır; sen zorlanmayacaksın.

| Mesafe | Tek başına | İsimden önce | Yer |
|---|---|---|---|
| Konuşana yakın | **これ** bu | **この** bu … | **ここ** burası |
| Dinleyene yakın | **それ** şu | **その** şu … | **そこ** şurası |
| İkisinden de uzak | **あれ** o | **あの** o … | **あそこ** orası |
| Soru | **どれ** hangisi | **どの** hangi … | **どこ** nerede |

**Kritik kural:** これ tek başına durur, ismin önüne gelemez. İsimden önce **この** gelir.
- これは本です。 ✓ (Bu bir kitaptır.)
- この本は高いです。 ✓ (Bu kitap pahalı.)
- これ本は… ✗

Bu ders alışveriş üzerine kuruludur çünkü işaret zamirleri en çok orada işe yarar:
すみません、これはいくらですか。 → "Affedersiniz, bu kaç para?"

**ね ve よ** cümle sonuna gelen ton ekleridir:
- **ね** — onay arar: "…değil mi?" いい天気です**ね**。
- **よ** — bilgi verir: "…haberin olsun." 安いです**よ**。`,
  grammarIds: ['ja-kore-sore-are', 'ja-mo', 'ja-ne-yo'],
  vocabIds: V_G2,
  extra: [
    mcq('Elindeki nesneyi gösteriyorsun. Hangisi doğru?', ['あれは本です。', 'これは本です。', 'その本です。', 'どれは本です。'], 1, 'Konuşana yakın olan これ.'),
    mcq('Karşındakinin elindekini soruyorsun.', ['これは何ですか。', 'それは何ですか。', 'あれは何ですか。', 'どれは何ですか。'], 1, 'Dinleyene yakın olan それ.'),
    mcq('Hangisi yanlış?', ['これは時計です。', 'この時計は新しいです。', 'これ時計は高いです。', 'それは私のです。'], 2, 'これ tek başına durur, isimden önce この gelir.'),
    mcq('「安いですね」 ne anlatır?', ['Bilgi veriyorum', 'Onay arıyorum', 'Emir veriyorum', 'Soru soruyorum'], 1, 'ね "değil mi?" tonudur.'),
    mcq('「私も学生です」 ne demek?', ['Ben öğrenciyim.', 'Ben de öğrenciyim.', 'Ben öğrenci değilim.', 'Ben öğrenci miyim?'], 1),
    fill('Boşluğu doldur: "Bu kimin çantası?"', 'これは誰 ___ かばんですか。', ['の'], 'Bu kimin çantası?'),
    fill('Boşluğu doldur: "Ben de öğrenciyim."', '私 ___ 学生です。', ['も'], 'Ben de öğrenciyim.'),
    order('Sıraya diz: "Bu saat kaç para?"', ['この', '時計', 'は', 'いくら', 'です', 'か'], 'Bu saat kaç para?'),
    translate('Bu ne?', ['これは何ですか', 'これはなんですか'], 'to-target'),
    translate('Şu benim şemsiyem.', ['それは私の傘です', 'それはわたしのかさです'], 'to-target'),
    speakEx('すみません、これはいくらですか。', 'すみません、これはいくらですか。', 'Affedersiniz, bu kaç para?'),
  ],
  passage: PSG_KAIWA_MISE,
})

const g3 = genkiLesson({
  n: 3, unit: 3, order: 4, genki: 3, seenIndex: 3,
  title: 'Günlük eylemler',
  subtitle: 'ます biçimi · を · で · に/へ',
  requires: 'ja-g2',
  objectives: ['Fiil gruplarını ayırt et', 'ます biçimini kur', 'Nesne ve yer eklerini kullan'],
  teachTitle: 'Japonca fiiller neden kolay?',
  teach: `İyi haber: Japoncada fiiller **kişiye göre çekilmez**. "Yiyorum", "yiyorsun", "yiyor" — hepsi 食べます. Kim olduğu bağlamdan anlaşılır.

İkinci iyi haber: **sadece iki düzensiz fiil** var (する ve 来る).

Fiiller üç gruba ayrılır:
1. **Ichidan (ru-fiil)** — る at, ek koy: 食べる → 食べます
2. **Godan (u-fiil)** — son kana い satırına geçer: 飲む → 飲みます
3. **Düzensiz** — する → します, 来る → 来ます

Ayırt etme: fiil る ile bitmiyorsa kesin godan. る ile bitiyorsa önündeki sesliye bak — **i** veya **e** varsa büyük ihtimalle ichidan (食べる, 見る).

⚠️ Tuzak fiiller: 帰る, 入る, 走る る ile biter ama **godan**dır.

Bu derste ayrıca üç ek gelir ve üçü de Türkçedeki eklerin karşılığıdır:

| Türkçe | Japonca | Örnek |
|---|---|---|
| ‑i (nesne) | **を** | 本を読む |
| ‑e (yön) | **に / へ** | 学校に行く |
| ‑de (eylem yeri) | **で** | 学校で勉強する |

Cümle sırası Türkçeyle aynıdır: 私はパンを食べます → *Ben ekmeği yerim*.`,
  grammarIds: ['ja-masu', 'ja-wo', 'ja-ni-he', 'ja-de', 'ja-mashou'],
  vocabIds: V_G3,
  drills: conjugationDrill(
    [
      { dict: '食べる', reading: 'たべる', tr: 'yemek' },
      { dict: '飲む', reading: 'のむ', tr: 'içmek' },
      { dict: '見る', reading: 'みる', tr: 'izlemek' },
      { dict: '読む', reading: 'よむ', tr: 'okumak' },
      { dict: '行く', reading: 'いく', tr: 'gitmek' },
      { dict: '来る', reading: 'くる', tr: 'gelmek' },
      { dict: 'する', reading: 'する', tr: 'yapmak' },
      { dict: '書く', reading: 'かく', tr: 'yazmak' },
    ],
    ['masu', 'masen', 'mashita'],
    12,
  ),
  extra: [
    mcq('Hangisi düzensiz fiildir?', ['読む', '見る', '来る', '帰る'], 2, 'する ve 来る tek düzensiz fiillerdir.'),
    mcq('「帰る」 る ile bitiyor. Hangi gruptadır?', ['Ichidan', 'Godan', 'Düzensiz', 'Sıfat'], 1, 'Tuzak fiil: 帰ります.'),
    mcq('「行きませんでした」 ne demek?', ['gitmiyorum', 'gitmedim', 'gitmeyeceğim', 'gidiyordum'], 1),
    mcq('Japoncada fiil kişiye göre çekilir mi?', ['Evet, altı kişi için', 'Hayır, hepsi aynı', 'Sadece geçmişte', 'Sadece kibar dilde'], 1),
    mcq('「一緒に行きませんか」 ne anlatır?', ['Emir', 'Davet', 'Yasak', 'Soru-cevap'], 1, '～ませんか kibar davettir.'),
    fill('Boşluğu doldur: "Su içiyorum."', '水を飲___。', ['みます'], 'Su içiyorum.'),
    fill('Boşluğu doldur: "Televizyon izlemiyorum."', 'テレビを見___。', ['ません'], 'Televizyon izlemiyorum.'),
    order('Sıraya diz: "Her gün Japonca çalışıyorum."', ['毎日', '日本語', 'を', '勉強', 'します'], 'Her gün Japonca çalışıyorum.'),
    translate('Kitap okuyorum.', ['本を読みます', 'ほんをよみます'], 'to-target'),
    translate('Kahve içmiyorum.', ['コーヒーを飲みません', 'こーひーをのみません'], 'to-target'),
    speakEx('毎日日本語を勉強します。', 'まいにちにほんごをべんきょうします。', 'Her gün Japonca çalışıyorum.'),
  ],
  passage: PSG_ICHINICHI,
})

const g4 = genkiLesson({
  n: 4, unit: 3, order: 5, genki: 4, seenIndex: 4,
  title: 'Nerede ne var',
  subtitle: 'あります/います · konum · geçmiş zaman',
  requires: 'ja-g3',
  objectives: ['Canlı/cansız ayrımını yap', 'Konum kelimelerini kullan', 'Geçmiş zaman kur'],
  teachTitle: 'Japoncada "var" ikiye ayrılır',
  teach: `Türkçede tek bir "var" vardır. Japoncada **canlı mı cansız mı** diye ikiye ayrılır ve bu ayrım şaşmaz:

- **います** — canlılar: insan, hayvan
- **あります** — cansızlar: eşya, bina, olay

部屋に猫が**います**。 (Odada kedi var.)
机に本が**あります**。 (Masada kitap var.)

Bitki cansız sayılır (あります); robot ve oyuncak da öyle. Ölçüt "kendi iradesiyle hareket ediyor mu"dur.

**Varlık cümlesinde özne が alır**, は değil. Çünkü yeni bilgi veriyorsun; は bilinen konuyu işaretler.

**Konum kelimeleri** の ile bağlanır ve sıralama Türkçeyle aynıdır:
机**の**上 = masa**nın** üstü · 駅**の**前 = istasyon**un** önü

| Kanji | Anlam |
|---|---|
| 上 うえ | üst |
| 下 した | alt |
| 中 なか | iç |
| 前 まえ | ön |
| 後ろ うしろ | arka |
| 隣 となり | yan |

**に ile で farkı** bu derste netleşir:
- Bir yerde **bulunuyorsan** → に : 家**に**います
- Bir yerde **bir şey yapıyorsan** → で : 家**で**食べます`,
  grammarIds: ['ja-arimasu-imasu', 'ja-kara-made', 'ja-ga'],
  vocabIds: V_G4,
  drills: particleDrill([
    { sentence: '部屋に猫 ___ います。', answer: 'が', tr: 'Odada kedi var.', why: 'varlık cümlesinde özne が alır' },
    { sentence: '家 ___ います。', answer: 'に', tr: 'Evdeyim.', why: 'bulunma' },
    { sentence: '家 ___ ご飯を食べます。', answer: 'で', tr: 'Evde yemek yerim.', why: 'eylemin yapıldığı yer' },
    { sentence: '机 ___ 上に本があります。', answer: 'の', tr: 'Masanın üstünde kitap var.', why: 'konum tamlaması' },
    { sentence: '駅 ___ 家まで歩きます。', answer: 'から', tr: 'İstasyondan eve kadar yürürüm.', why: 'başlangıç' },
    { sentence: '九時から五時 ___ 働きます。', answer: 'まで', tr: 'Dokuzdan beşe kadar çalışırım.', why: 'bitiş' },
    { sentence: '電車 ___ 行きます。', answer: 'で', tr: 'Trenle gidiyorum.', why: 'araç' },
    { sentence: '友だち ___ 会います。', answer: 'に', tr: 'Arkadaşımla buluşuyorum.', why: '会う fiili に ister' },
  ]),
  extra: [
    mcq('Kedi için hangisi doğru?', ['猫があります', '猫がいます', '猫をいます', '猫はあります'], 1, 'Canlılar için いる.'),
    mcq('"Masanın üstünde kitap var." nasıl denir?', ['机の上に本があります。', '机の上で本があります。', '机の上に本がいます。', '机は上に本があります。'], 0),
    mcq('「に」 ile 「で」 farkı nedir?', ['に geçmiş, で şimdiki', 'に bulunma/varış, で eylemin yeri', 'İkisi aynı', 'に kibar, で sade'], 1),
    mcq('Ağaç için hangisi kullanılır?', ['います', 'あります', 'ikisi de', 'hiçbiri'], 1, 'Bitkiler cansız sayılır.'),
    fill('Boşluğu doldur: "Odada kedi var."', '部屋に猫が___。', ['います'], 'Odada kedi var.', 'Canlı mı cansız mı?'),
    fill('Boşluğu doldur: "Masada kitap var."', '机に本が___。', ['あります'], 'Masada kitap var.'),
    order('Sıraya diz: "İstasyonun önünde bir kafe var."', ['駅', 'の', '前', 'に', 'カフェ', 'が', 'あります'], 'İstasyonun önünde bir kafe var.'),
    order('Sıraya diz: "Sabah yedide trenle okula giderim."', ['朝', '七時', 'に', '電車', 'で', '学校', 'へ', '行きます'], 'Sabah yedide trenle okula giderim.'),
    translate('Evde film izliyorum.', ['家で映画を見ます', 'いえでえいがをみます'], 'to-target'),
    translate('Kütüphaneye gidiyorum.', ['図書館に行きます', 'としょかんにいきます', '図書館へ行きます', 'としょかんへいきます'], 'to-target'),
  ],
  passage: PSG_JIKO_SHOUKAI,
})

// ————————————————————————— Ünite 4 · Genki 5–8 —————————————————————————

const g5 = genkiLesson({
  n: 5, unit: 4, order: 1, genki: 5, seenIndex: 5,
  title: 'Betimleme',
  subtitle: 'い ve な sıfatlar · 好き · sayaçlar',
  requires: 'ja-g4',
  objectives: ['İki sıfat türünü ayırt et', 'Sıfatı geçmiş ve olumsuz yap', 'Beğeni belirt', 'Sayaç kullan'],
  teachTitle: 'Japoncada sıfat ikiye ayrılır',
  teach: `Japoncada sıfatların **iki türü** vardır ve çekimleri farklıdır. Türkçede böyle bir ayrım yok, o yüzden en baştan doğru öğrenmek gerekir.

**い-sıfatlar** — kendileri çekilir, です çekilmez:
高い → 高**くない** (pahalı değil) → 高**かった** (pahalıydı)

**な-sıfatlar** — kendileri çekilmez, です çekilir:
静か → 静か**じゃない** (sessiz değil) → 静か**でした** (sessizdi)

| | い-sıfat (高い) | な-sıfat (静か) |
|---|---|---|
| Yalın | 高いです | 静かです |
| Olumsuz | 高**くない**です | 静か**じゃない**です |
| Geçmiş | 高**かった**です | 静か**でした** |
| İsimden önce | 高い本 | 静か**な**部屋 |

⚠️ **Tuzak:** きれい, 有名, 嫌い い ile biter ama **な-sıfattır**. Bunlar ezberlenir.
⚠️ **いい düzensizdir:** olumsuzu いくない değil **よくない**, geçmişi **よかった**.

**好きです** de bu derste gelir ve ilginç bir yapısı vardır: sevilen şey **が** alır, çünkü 好き Japoncada bir sıfattır ("hoşa giden"), fiil değil.
私はコーヒー**が**好きです。 → kelimesi kelimesine "bana gelince, kahve hoştur".`,
  grammarIds: ['ja-i-adj', 'ja-na-adj', 'ja-suki', 'ja-counters'],
  vocabIds: V_G5,
  extra: [
    mcq('「高い」 geçmiş hâli?', ['高いでした', '高かったです', '高いました', '高くでした'], 1, 'い düşer, かった gelir.'),
    mcq('「静か」 isimden önce nasıl gelir?', ['静か部屋', '静かな部屋', '静かい部屋', '静かの部屋'], 1),
    mcq('Hangisi na-sıfattır?', ['新しい', 'きれい', '大きい', '安い'], 1, 'きれい い ile biter ama na-sıfattır.'),
    mcq('「いい」 olumsuzu?', ['いくない', 'よくない', 'いいじゃない', 'いなくない'], 1, 'いい düzensizdir.'),
    mcq('「コーヒーが好きです」 içinde neden が var?', ['Yanlış, を olmalı', '好き bir sıfattır, fiil değil', 'Vurgu için', 'Kibarlık için'], 1),
    mcq('İki sıfatı bağlarken い-sıfat ne olur?', ['い düşer, くて gelir', 'Değişmez', 'な eklenir', 'で eklenir'], 0, '安くて新しい車'),
    fill('Boşluğu doldur: "Bu kitap ilginç değil."', 'この本は面白___です。', ['くない'], 'Bu kitap ilginç değil.'),
    fill('Boşluğu doldur: "Ucuz ve yeni araba"', '安___新しい車', ['くて'], 'Ucuz ve yeni araba'),
    fill('Boşluğu doldur: "Sessiz oda"', '静か___部屋', ['な'], 'Sessiz oda'),
    fill('Boşluğu doldur: "Dün meşguldüm."', '昨日は忙し___です。', ['かった'], 'Dün meşguldüm.'),
    order('Sıraya diz: "Bu kahve çok lezzetli."', ['この', 'コーヒー', 'は', 'とても', 'おいしい', 'です'], 'Bu kahve çok lezzetli.'),
    translate('Bu oda sessiz.', ['この部屋は静かです', 'このへやはしずかです'], 'to-target'),
    translate('Yeni araba pahalı değil.', ['新しい車は高くないです', 'あたらしいくるまはたかくないです'], 'to-target'),
    speakEx('この本はとても面白いです。', 'このほんはとてもおもしろいです。', 'Bu kitap çok ilginç.'),
  ],
  passage: PSG_WATASHI_NO_MACHI,
})

const g6 = genkiLesson({
  n: 6, unit: 4, order: 2, genki: 6, seenIndex: 6,
  title: 'て formu',
  subtitle: 'Japoncanın kalbi · rica, izin, yasak, sebep',
  requires: 'ja-g5',
  objectives: ['て biçimini kur', 'Rica ve izin cümlesi yap', 'から ile sebep belirt'],
  teachTitle: 'Neden て formu her şeyin anahtarı?',
  teach: `て formu tek başına bir zaman değildir; **başka yapıların taşıyıcısıdır**. Bir kez öğrenince şunların hepsi açılır:

| Yapı | Anlam |
|---|---|
| ています | şu an yapıyor |
| てください | lütfen yap |
| てもいいです | yapabilirsin |
| てはいけません | yapamazsın |
| てから | yaptıktan sonra |

Ayrıca cümle bağlar — Türkçedeki **‑ip / ‑erek** eki gibidir:
コーヒーを飲んで、本を読みます。 → "Kahve iç**ip** kitap okurum."

**て biçimi nasıl kurulur?** Godan fiillerde son kanaya göre değişir; bu tablo ezberlenir:

| Son kana | て biçimi | Örnek |
|---|---|---|
| う・つ・る | **って** | 待つ → 待って |
| む・ぶ・ぬ | **んで** | 飲む → 飲んで |
| く | **いて** | 書く → 書いて |
| ぐ | **いで** | 泳ぐ → 泳いで |
| す | **して** | 話す → 話して |

Ichidan çok kolay: る at, て koy → 食べる → 食べて.
Tek düzensiz: **行く → 行って** (行いて değil).

Bu derste ayrıca **から** ile sebep gelir. Türkçedeki "‑diği için" ile aynı sırada: sebep önce, から ondan sonra, sonuç en sonda.
寒いです**から**、コートを着ます。`,
  grammarIds: ['ja-te-form', 'ja-te-permission', 'ja-kara-reason'],
  vocabIds: V_G6,
  drills: conjugationDrill(
    [
      { dict: '食べる', reading: 'たべる', tr: 'yemek' },
      { dict: '飲む', reading: 'のむ', tr: 'içmek' },
      { dict: '行く', reading: 'いく', tr: 'gitmek' },
      { dict: '読む', reading: 'よむ', tr: 'okumak' },
      { dict: '待つ', reading: 'まつ', tr: 'beklemek' },
      { dict: '話す', reading: 'はなす', tr: 'konuşmak' },
      { dict: '書く', reading: 'かく', tr: 'yazmak' },
    ],
    ['te', 'tekudasai'],
    12,
  ),
  extra: [
    mcq('「行く」 fiilinin て biçimi?', ['行きて', '行って', '行いて', '行くて'], 1, '行く tek düzensiz て biçimidir.'),
    mcq('「飲む」 fiilinin て biçimi?', ['飲みて', '飲んで', '飲いて', '飲して'], 1, 'む・ぶ・ぬ → んで'),
    mcq('「待ってください」 ne demek?', ['Bekledim', 'Lütfen bekleyin', 'Bekliyorum', 'Bekleyemem'], 1),
    mcq('「入ってはいけません」 ne demek?', ['Girebilirsin', 'Girmelisin', 'Giremezsin', 'Girdim'], 2),
    mcq('「寒いですから、コートを着ます」 içinde から ne yapıyor?', ['Yer bildiriyor', 'Sebep bildiriyor', 'Zaman bildiriyor', 'Soru soruyor'], 1),
    fill('Boşluğu doldur: "Kahve içip kitap okurum."', 'コーヒーを飲___、本を読みます。', ['んで'], 'Kahve içip kitap okurum.'),
    fill('Boşluğu doldur: "Lütfen bekleyin."', '待っ___ください。', ['て'], 'Lütfen bekleyin.'),
    order('Sıraya diz: "Yorgun olduğum için dinleniyorum."', ['疲れています', 'から', '休みます'], 'Yorgun olduğum için dinleniyorum.'),
    translate('Lütfen buraya oturun.', ['ここに座ってください', 'ここにすわってください'], 'to-target'),
    speakEx('すみません、ちょっと待ってください。', 'すみません、ちょっとまってください。', 'Affedersiniz, biraz bekleyin lütfen.'),
  ],
})

const g7 = genkiLesson({
  n: 7, unit: 4, order: 3, genki: 7, seenIndex: 7,
  title: 'Aile ve süregelen eylemler',
  subtitle: 'ています · sıfat bağlama · が (ama)',
  requires: 'ja-g6',
  objectives: ['ています ile devam eden eylemi anlat', 'Durum bildir', 'Cümleleri が ile bağla'],
  teachTitle: 'ています ikisi birden: eylem ve durum',
  teach: `て formunu öğrendin; ilk büyük kullanımı **ています**. İki farklı şey anlatır ve ikisini karıştırmak yaygın hatadır.

**1. Süregelen eylem** — "şu anda yapıyor"
今、本を読んでいます。 → "Şu an kitap okuyorum."

**2. Süregelen durum** — "olmuş ve öyle kalmış"
田中さんは結婚しています。 → "Tanaka bey **evli**." (evleniyor değil!)
京都に住んでいます。 → "Kyoto'da **yaşıyorum**."

İkinci grup Türkçeye **şimdiki zamanla değil, sıfatla** çevrilir. Bu fiiller bellidir ve ezberlenir: 住む (yaşamak), 結婚する (evlenmek), 知る (bilmek), 持つ (sahip olmak).

⚠️ **知っています** = "biliyorum" ✓ · 知ります ✗ (bu yapı yoktur)
Ama olumsuzu düzensizdir: **知りません** = "bilmiyorum" (知っていません değil).

**Sıfat ve isim bağlama** da bu derste gelir — て formunun aynı mantığı:
- い-sıfat: 安**くて**新しい (ucuz ve yeni)
- な-sıfat: 静か**で**きれい (sessiz ve temiz)
- İsim: 学生**で**、22歳です (öğrenci ve 22 yaşında)

**が** burada "ama" anlamındadır — Türkçedeki "…dır ama"ya denk:
この部屋は小さいです**が**、きれいです。`,
  grammarIds: ['ja-teiru', 'ja-ga'],
  vocabIds: V_G7,
  drills: conjugationDrill(
    [
      { dict: '食べる', reading: 'たべる', tr: 'yemek' },
      { dict: '読む', reading: 'よむ', tr: 'okumak' },
      { dict: '働く', reading: 'はたらく', tr: 'çalışmak' },
      { dict: '待つ', reading: 'まつ', tr: 'beklemek' },
      { dict: '話す', reading: 'はなす', tr: 'konuşmak' },
    ],
    ['temasu', 'teiru'],
    10,
  ),
  extra: [
    mcq('「食べています」 ne demek?', ['yedim', 'yiyorum (şu anda)', 'yiyeceğim', 'yemek istiyorum'], 1),
    mcq('「結婚しています」 ne demek?', ['Evleniyor', 'Evli', 'Evlenecek', 'Evlendi ve ayrıldı'], 1, 'Durum bildirir, eylem değil.'),
    mcq('"Biliyorum" nasıl denir?', ['知ります', '知っています', '知りています', '知いています'], 1),
    mcq('"Bilmiyorum" nasıl denir?', ['知っていません', '知りません', '知らないています', '知りましてん'], 1, 'Olumsuzu düzensizdir.'),
    mcq('「小さいですが、きれいです」 içinde が ne yapıyor?', ['Özne işaretliyor', '"ama" bağlıyor', 'Soru soruyor', 'Vurgu katıyor'], 1),
    fill('Boşluğu doldur: "Şu an kitap okuyorum."', '今、本を読___います。', ['んで'], 'Şu an kitap okuyorum.'),
    fill('Boşluğu doldur: "Ucuz ve yeni araba"', '安___新しい車', ['くて'], 'Ucuz ve yeni araba'),
    fill('Boşluğu doldur: "Sessiz ve temiz oda"', '静か___きれいな部屋', ['で'], 'Sessiz ve temiz oda'),
    order('Sıraya diz: "Babam şirkette çalışıyor."', ['父', 'は', '会社', 'で', '働いています'], 'Babam şirkette çalışıyor.'),
    translate('Şu an Japonca çalışıyorum.', ['今、日本語を勉強しています', 'いま、にほんごをべんきょうしています'], 'to-target'),
    speakEx('姉は東京に住んでいます。', 'あねはとうきょうにすんでいます。', 'Ablam Tokyo’da yaşıyor.'),
  ],
  passage: PSG_KAZOKU,
})

const g8 = genkiLesson({
  n: 8, unit: 4, order: 4, genki: 8, seenIndex: 8,
  title: 'Arkadaş dili',
  subtitle: 'Sade biçim · と思います · ないでください',
  requires: 'ja-g7',
  objectives: ['Sade biçimi kur', 'Düşünceni söyle', 'Duyduğunu aktar', 'Kibar olumsuz rica yap'],
  teachTitle: 'İki ayrı kibarlık düzeyi',
  teach: `Şimdiye kadar hep **kibar biçimi** (ます・です) kullandın. Japoncanın ikinci bir düzeyi var: **sade biçim** (普通形).

Sade biçim sadece "kabalık" değildir — iki işi vardır:

**1. Arkadaş arası konuşma**
食べる (yerim) · 食べない (yemem) · 食べた (yedim) · 食べなかった (yemedim)

**2. Cümlenin İÇİNDE kullanılma** — bu daha önemli
Japoncada bir cümle başka bir cümlenin içine girdiğinde **her zaman sade biçime** döner. Kibarlık yalnızca en sondaki fiilde belirir:

明日雨が降る**と思います**。 → 降る sade, 思います kibar ✓
明日雨が降ります**と思います** ✗

Bu kural と思います, と言っていました, んです, ので, から, isim niteleme... hepsinde geçerlidir. Yani sade biçimi öğrenmeden bu yapıların hiçbirini kuramazsın — bu yüzden Genki burada öğretir.

**Sade biçim tablosu:**

| | Fiil | い-sıfat | な-sıfat / isim |
|---|---|---|---|
| Şimdi | 食べる | 高い | 静か**だ** |
| Olumsuz | 食べ**ない** | 高**くない** | 静か**じゃない** |
| Geçmiş | 食べ**た** | 高**かった** | 静か**だった** |
| Geçmiş olumsuz | 食べ**なかった** | 高**くなかった** | 静か**じゃなかった** |

⚠️ İsim ve な-sıfatta **だ** gerekir: 学生**だ**と思います.`,
  grammarIds: ['ja-plain-form', 'ja-to-omoimasu', 'ja-to-itteimashita', 'ja-naide-kudasai', 'ja-no-nominalizer'],
  vocabIds: V_G8,
  drills: conjugationDrill(
    [
      { dict: '食べる', reading: 'たべる', tr: 'yemek' },
      { dict: '飲む', reading: 'のむ', tr: 'içmek' },
      { dict: '行く', reading: 'いく', tr: 'gitmek' },
      { dict: '来る', reading: 'くる', tr: 'gelmek' },
      { dict: '話す', reading: 'はなす', tr: 'konuşmak' },
    ],
    ['nai', 'ta', 'nakatta'],
    12,
  ),
  extra: [
    mcq('「行きますと思います」 neden yanlış?', ['と yanlış ek', '思います yanlış fiil', 'と\'den önce sade biçim gelir', 'Sıralama ters'], 2),
    mcq('"O öğrenci sanırım" nasıl denir?', ['学生と思います', '学生だと思います', '学生ですと思います', '学生なと思います'], 1, 'İsimden sonra だ şart.'),
    mcq('「心配しないでください」 ne demek?', ['Endişelen', 'Lütfen endişelenme', 'Endişelendim', 'Endişeli'], 1),
    mcq('「本を読むのが好きです」 içindeki の ne yapıyor?', ['Sahiplik', 'Fiili isme çeviriyor', 'Soru soruyor', 'Vurgu'], 1),
    mcq('Duyduğunu aktarırken hangisi daha doğal?', ['と言いました', 'と言っていました', 'と思いました', 'と聞きました'], 1),
    fill('Boşluğu doldur: "Yarın yağmur yağar sanırım."', '明日雨が降る___思います。', ['と'], 'Yarın yağmur yağar sanırım.'),
    fill('Boşluğu doldur: "Yemek yapmayı severim."', '料理を作る___が好きです。', ['の'], 'Yemek yapmayı severim.'),
    fill('Boşluğu doldur: "Lütfen sigara içmeyin."', 'たばこを吸わ___でください。', ['ない'], 'Lütfen sigara içmeyin.'),
    order('Sıraya diz: "Bu kitap ilginç bence."', ['この', '本', 'は', '面白い', 'と', '思います'], 'Bu kitap ilginç bence.'),
    translate('Japonca çalışmayı severim.', ['日本語を勉強するのが好きです', 'にほんごをべんきょうするのがすきです'], 'to-target'),
    speakEx('田中さんは明日来ると言っていました。', 'たなかさんはあしたくるといっていました。', 'Tanaka bey yarın geleceğini söylüyordu.'),
  ],
})

// ————————————————————————— Ünite 5 · Genki 9–12 —————————————————————————

const g9 = genkiLesson({
  n: 9, unit: 5, order: 1, genki: 9, seenIndex: 9,
  title: 'Deneyim anlatmak',
  subtitle: 'Sade geçmiş · isim niteleme · もう/まだ',
  requires: 'ja-g8',
  objectives: ['Fiille isim nitele', 'もう/まだ ayrımını yap', 'Sade geçmişi kullan'],
  teachTitle: 'Türkçeye en çok benzeyen yapı',
  teach: `Bu dersin ana konusu, Japoncanın Türkçeye **en çok benzeyen** yapısıdır — ve İngilizce konuşanların en çok zorlandığı yerdir. Senin avantajın burada net.

Türkçede "dün gör**düğüm** film" deriz: niteleyen cümle ismin **önüne** gelir, araya hiçbir bağlaç girmez. Japonca birebir aynısını yapar:

昨日見た映画 → "dün izle**diğim** film"
日本語を話す人 → "Japonca konuş**an** kişi"

İngilizcede *the movie **that** I saw* diye araya bir bağlaç girer. Japoncada girmez. Fiil sade biçimde, doğrudan ismin önünde durur.

**İki kural:**
1. Niteleyen fiil **sade biçimde** olur (ます değil).
2. Niteleyen cümlenin öznesi **は değil が** alır: 私**が**作った料理.

Bu derste ayrıca **もう / まだ** ayrımı netleşir:
- **もう + geçmiş** = "artık/çoktan yaptı": もう食べました
- **まだ + ています** = "hâlâ ediyor": まだ食べています
- **まだ + ていません** = "henüz yapmadı": まだ食べていません

⚠️ "Henüz yemedim" için まだ食べませんでした **denmez** — durum hâlâ sürdüğü için **まだ食べていません** denir. Bu, N5 sınavında sık sorulan bir ayrımdır.`,
  grammarIds: ['ja-noun-modify', 'ja-mou-mada'],
  vocabIds: V_G9,
  extra: [
    mcq('"Dün izlediğim film" nasıl denir?', ['昨日見ました映画', '昨日見た映画', '昨日見る映画', '昨日見て映画'], 1),
    mcq('Niteleyen cümlede özne hangi eki alır?', ['は', 'が', 'を', 'に'], 1, '私が作った料理'),
    mcq('"Henüz yemedim" nasıl denir?', ['まだ食べませんでした', 'まだ食べていません', 'もう食べません', 'まだ食べません'], 1),
    mcq('「もう昼ご飯を食べましたか」 ne soruyor?', ['Öğle yemeği yer misin?', 'Öğle yemeğini yedin mi?', 'Öğle yemeği yiyecek misin?', 'Öğle yemeği neydi?'], 1),
    mcq('「日本語を話す人」 ne demek?', ['Japonca konuşacak kişi', 'Japonca konuşan kişi', 'Japonca konuştuğum kişi', 'Japonca konuşulan yer'], 1),
    fill('Boşluğu doldur: "Annemin yaptığı yemek"', '母___作った料理', ['が'], 'Annemin yaptığı yemek'),
    fill('Boşluğu doldur: "Henüz bitirmedim."', 'まだ終わっ___。', ['ていません'], 'Henüz bitirmedim.'),
    order('Sıraya diz: "Dün aldığım kitap ilginç."', ['昨日', '買った', '本', 'は', '面白い', 'です'], 'Dün aldığım kitap ilginç.'),
    translate('Dün izlediğim film ilginçti.', ['昨日見た映画は面白かったです', 'きのうみたえいがはおもしろかったです'], 'to-target'),
    speakEx('母が作った料理はおいしいです。', 'ははがつくったりょうりはおいしいです。', 'Annemin yaptığı yemek lezzetli.'),
  ],
})

const g10 = genkiLesson({
  n: 10, unit: 5, order: 2, genki: 10, seenIndex: 10,
  title: 'Karşılaştırma ve planlar',
  subtitle: 'より/のほうが · 一番 · なる · つもり',
  requires: 'ja-g9',
  objectives: ['İki şeyi karşılaştır', 'Üstünlük belirt', 'Değişimi anlat', 'Plan söyle'],
  teachTitle: 'Karşılaştırmada sıra Türkçeden farklı',
  teach: `Türkçede "A, B'den büyük**tür**" deriz — karşılaştırılan önce, ölçüt sonra. Japoncada sıralama ters kurulabilir ve bu kafa karıştırır.

**İki şey karşılaştırılırken:**
A **のほうが** B **より** [sıfat] です。
車のほうが電車より速いです。 → "Araba trenden hızlıdır."

Kelimesi kelimesine: "araba tarafı, trene kıyasla, hızlıdır."
- **のほうが** — "…tarafı" (öne çıkan)
- **より** — "…‑den, …‑e kıyasla"

İkisinin sırası değişebilir, anlam bozulmaz:
電車より車のほうが速いです。 ✓ (aynı anlam)

**Soru sorarken** iki seçenek de と ile bağlanır:
車と電車と、どちらのほうが速いですか。

**Üstünlük** için 一番:
日本で一番高い山は富士山です。

**～くなる / ～になる** değişimi anlatır ve sıfat bağlama kuralıyla aynıdır:
- い-sıfat: 寒**くなりました** (soğudu)
- な-sıfat / isim: 上手**になりました** (iyileşti), 医者**になりました** (doktor oldu)

**つもりです** karara bağlanmış niyettir; たい ise sadece arzudur:
- 行き**たい**です → "gitmek isterim" (henüz plan yok)
- 行く**つもりです** → "gitmeyi planlıyorum" (karar verdim)`,
  grammarIds: ['ja-yori-hou', 'ja-ichiban', 'ja-naru', 'ja-tsumori'],
  vocabIds: V_G10,
  extra: [
    mcq('"Araba trenden hızlı" nasıl denir?', ['車は電車より速いです', '車のほうが電車より速いです', '車より電車のほうが速いです', '車も電車も速いです'], 1),
    mcq('「日本で一番高い山」 ne demek?', ['Japonya’nın yüksek dağı', 'Japonya’daki en yüksek dağ', 'Japonya’dan yüksek dağ', 'Japonya kadar yüksek dağ'], 1),
    mcq('「寒くなりました」 ne demek?', ['Soğuktu', 'Hava soğudu', 'Soğuk değil', 'Soğuk olacak'], 1),
    mcq('「医者になりました」 içinde neden に var?', ['Yön bildiriyor', 'İsim + になる kuralı', 'Zaman bildiriyor', 'Yanlış, で olmalı'], 1),
    mcq('「行くつもりです」 ile 「行きたいです」 farkı nedir?', ['Aynı şey', 'つもり karar, たい arzu', 'つもり arzu, たい karar', 'つもり geçmiş'], 1),
    fill('Boşluğu doldur: "Hava soğudu."', '寒___なりました。', ['く'], 'Hava soğudu.'),
    fill('Boşluğu doldur: "Japoncam iyileşti."', '日本語が上手___なりました。', ['に'], 'Japoncam iyileşti.'),
    order('Sıraya diz: "Gelecek yıl Japonya’ya gitmeyi planlıyorum."', ['来年', '日本', 'へ', '行く', 'つもり', 'です'], 'Gelecek yıl Japonya’ya gitmeyi planlıyorum.'),
    translate('Meyveler içinde en çok elmayı severim.', ['果物の中でりんごが一番好きです', 'くだもののなかでりんごがいちばんすきです'], 'to-target'),
    speakEx('来年日本へ行くつもりです。', 'らいねんにほんへいくつもりです。', 'Gelecek yıl Japonya’ya gitmeyi planlıyorum.'),
  ],
})

const g11 = genkiLesson({
  n: 11, unit: 5, order: 3, genki: 11, seenIndex: 11,
  title: 'Deneyim ve örnekleme',
  subtitle: 'たい · たり〜たり · ことがある · や',
  requires: 'ja-g10',
  objectives: ['İstek belirt', 'Örnek eylemler say', 'Deneyim anlat', 'İsimleri örnek olarak bağla'],
  teachTitle: '"Hepsi" ile "falan filan" ayrımı',
  teach: `Bu dersin ortak teması **örnekleme**: sayılanların hepsi mi, yoksa sadece birkaç örnek mi?

**Fiillerde: ～たり～たり**
Fiilin **た biçimini** al, り ekle, sonuna する koy.
週末は本を読ん**だり**、映画を見**たり**します。
→ "Hafta sonu kitap okur, film izlerim **falan**."

て formuyla farkı kritiktir:
- 読ん**で**、見ます → sırayla: önce okudum, sonra izledim
- 読ん**だり**、見**たり**します → örnekler: bunlar gibi şeyler, sıra önemsiz

**İsimlerde: や (と değil)**
- **と** — hepsi bu: 本**と**ペンがあります (tam olarak bu ikisi)
- **や** — örnek: 本**や**ペンがあります (kitap, kalem falan)

**Deneyim: ～たことがあります**
Türkçedeki "‑mişliğim var" ile birebir örtüşür.
日本へ行っ**たことがあります**。

⚠️ Belirli zamanla kullanılmaz: 昨日行ったことがあります ✗ → 昨日行きました ✓

**İstek: ～たいです**
ます gövdesine たい ekle: 行きます → 行き**たいです**.
たい bir い-sıfat gibi çekilir: 行きたくないです (gitmek istemiyorum).
⚠️ Üçüncü kişi için kullanılmaz — başkasının içinden geçeni bilemezsin; onun için 行きたがっています denir.`,
  grammarIds: ['ja-tai', 'ja-tari', 'ja-koto-ga-aru', 'ja-ya'],
  vocabIds: V_G11,
  extra: [
    mcq('「本を読んだり、映画を見たりします」 ne anlatır?', ['Önce okur sonra izler', 'Bunlar gibi şeyler yapar', 'Sadece bu ikisini yapar', 'Hiçbirini yapmaz'], 1),
    mcq('「本とペンがあります」 ile 「本やペンがあります」 farkı?', ['Fark yok', 'と hepsi, や örnek', 'と örnek, や hepsi', 'や daha kibar'], 1),
    mcq('"Japonya’ya gitmişliğim var" nasıl denir?', ['日本へ行きました', '日本へ行ったことがあります', '日本へ行っています', '日本へ行くことです'], 1),
    mcq('Hangisi yanlış?', ['日本へ行ったことがあります', '昨日行ったことがあります', '寿司を食べたことがありません', '二回見たことがあります'], 1, 'Belirli zamanla kullanılmaz.'),
    mcq('「行きたいです」 nasıl olumsuz yapılır?', ['行きたいじゃないです', '行きたくないです', '行きたくありません でした', '行かないたいです'], 1, 'たい い-sıfat gibi çekilir.'),
    fill('Boşluğu doldur: "Hafta sonu kitap okur, film izlerim."', '週末は本を読___、映画を見たりします。', ['んだり'], 'Hafta sonu kitap okur, film izlerim.'),
    fill('Boşluğu doldur: "Hiç suşi yemedim."', '寿司を食べたことが___。', ['ありません'], 'Hiç suşi yemedim.'),
    order('Sıraya diz: "Japonya’ya gitmek istiyorum."', ['日本', 'へ', '行き', 'たい', 'です'], 'Japonya’ya gitmek istiyorum.'),
    translate('Fuji Dağı’nı hiç gördün mü?', ['富士山を見たことがありますか', 'ふじさんをみたことがありますか'], 'to-target'),
    speakEx('週末は掃除したり、洗濯したりします。', 'しゅうまつはそうじしたり、せんたくしたりします。', 'Hafta sonu temizlik yaparım, çamaşır yıkarım.'),
  ],
})

const g12 = genkiLesson({
  n: 12, unit: 5, order: 4, genki: 12, seenIndex: 12,
  title: 'Hastalık ve tavsiye',
  subtitle: 'んです · すぎる · ほうがいい · ので · なければいけない',
  requires: 'ja-g11',
  objectives: ['Durum açıkla', 'Aşırılık belirt', 'Tavsiye ver', 'Zorunluluk anlat', 'Tahmin yürüt'],
  teachTitle: 'Açıklama tonu: んです',
  teach: `Bu ders, Japoncanın "yumuşak" tarafını öğretir: bir durumu **açıklamak**, tavsiye vermek, zorunluluk söylemek.

**んです** doğrudan çevirisi olmayan bir ton ekidir. İki iş görür:
1. Açıklama: 頭が痛い**んです**。 → "Başım ağrıyor **de ondan**."
2. İlgili soru: どうして来なかった**んですか**。 → "Neden gelmedin?"

Bağlantı kuralı と思います ile aynıdır, tek fark isim/な-sıfattan sonra **な** gelir:
学生**な**んです · 静か**な**んです

**Bu derste hep aynı な kuralı tekrar eder** — bir kez kavrarsan hepsi düşer:

| Yapı | Fiil | い-sıfat | な-sıfat/isim |
|---|---|---|---|
| んです | 行くんです | 高いんです | 学生**な**んです |
| ので | 行くので | 高いので | 学生**な**ので |

**ほうがいいです** tavsiye verir ve tuzağı vardır: olumlu tavsiyede **た biçimi** kullanılır.
休ん**だ**ほうがいいです ✓ (dinlensen iyi olur)
休むほうがいいです ✗

**なければいけません** zorunluluktur ve çift olumsuzla kurulur — "yapmazsam olmaz":
行か**なければいけません** = gitmek zorundayım
Günlük konuşmada kısalır: 行か**なきゃ**.

Zıddı: 行か**なくてもいいです** = gitmene gerek yok.

**でしょう** tahmindir: 明日は雨**でしょう**。 Hava durumunda hep bu kullanılır.`,
  grammarIds: ['ja-n-desu', 'ja-sugiru', 'ja-hou-ga-ii', 'ja-node', 'ja-nakereba', 'ja-deshou'],
  vocabIds: V_G12,
  extra: [
    mcq('"Yarın sınavım var (o yüzden)" nasıl denir?', ['明日試験んです', '明日試験なんです', '明日試験だんです', '明日試験のんです'], 1, 'İsimden sonra な gerekir.'),
    mcq('「食べすぎました」 ne demek?', ['Çok yedim (olumlu)', 'Fazla yedim (şikâyet)', 'Yemedim', 'Yiyorum'], 1),
    mcq('"Dinlensen iyi olur" nasıl denir?', ['休むほうがいいです', '休んだほうがいいです', '休んでほうがいいです', '休みほうがいいです'], 1, 'Olumlu tavsiyede た biçimi.'),
    mcq('から ile ので farkı nedir?', ['Anlam farkı yok, ton farkı var', 'から geçmiş, ので şimdiki', 'ので soru yapar', 'から yasak bildirir'], 0),
    mcq('「行かなくてもいいです」 ne demek?', ['Gitmek zorundasın', 'Gitmene gerek yok', 'Gitme', 'Gittin mi?'], 1),
    mcq('「明日は雨でしょう」 ne anlatır?', ['Kesinlik', 'Tahmin', 'Emir', 'Geçmiş'], 1),
    fill('Boşluğu doldur: "Yorgun olduğum için dinleniyorum."', '疲れている___、休みます。', ['ので'], 'Yorgun olduğum için dinleniyorum.'),
    fill('Boşluğu doldur: "Yarın erken kalkmam gerekiyor."', '明日早く起き___いけません。', ['なければ'], 'Yarın erken kalkmam gerekiyor.'),
    fill('Boşluğu doldur: "Bu kitap fazla zor."', 'この本は難し___ます。', ['すぎ'], 'Bu kitap fazla zor.'),
    order('Sıraya diz: "Başım ağrıyor, o yüzden ilaç içiyorum."', ['頭', 'が', '痛い', 'ので', '薬', 'を', '飲みます'], 'Başım ağrıyor, o yüzden ilaç içiyorum.'),
    translate('Bugün gitmesen iyi olur.', ['今日は行かないほうがいいです', 'きょうはいかないほうがいいです'], 'to-target'),
    speakEx('風邪をひいたので、今日は休みます。', 'かぜをひいたので、きょうはやすみます。', 'Nezle olduğum için bugün dinleniyorum.'),
  ],
})

// ————————————————————————— Ünite 6 · Kanji —————————————————————————

const K_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '円']
const K_TIME = ['日', '月', '火', '水', '木', '金', '土', '曜', '時', '分', '半', '年', '今', '毎', '週', '間', '午', '前', '後']
const K_PEOPLE = ['人', '私', '男', '女', '子', '名', '友', '父', '母', '兄', '姉', '弟', '妹']
const K_SCHOOL = ['学', '校', '先', '生', '本', '語', '読', '書', '聞', '話']
const K_VERBS = ['行', '来', '帰', '食', '飲', '見', '買', '会', '出', '入', '立', '休']
const K_PLACE = ['上', '下', '中', '外', '右', '左', '東', '西', '南', '北', '国', '駅']
const K_NATURE = ['山', '川', '天', '気', '雨', '空', '電', '車']
const K_ADJ = ['大', '小', '高', '安', '新', '古', '長', '白', '多', '少', '早']
const K_BODY = ['口', '目', '耳', '手', '足', '力', '何']

const kanjiSeen: string[][] = []
{
  const sets = [K_NUM, K_TIME, K_PEOPLE, K_SCHOOL, K_VERBS, [...K_PLACE, ...K_NATURE], [...K_ADJ, ...K_BODY]]
  let acc: string[] = []
  sets.forEach((set) => {
    kanjiSeen.push(acc)
    acc = [...acc, ...set]
  })
}

function kanjiLesson(o: {
  n: number
  chars: string[]
  seen: string[]
  title: string
  subtitle: string
  teachTitle: string
  teach: string
  extra?: Exercise[]
  passage?: Extract<LessonSection, { kind: 'passage' }>
  grammarIds?: string[]
  requires: string
}): Lesson {
  const drill = kanjiDrill(o.chars, o.seen)
  const write = kanjiWriteDrill(o.chars, 5)
  const extra = o.extra ?? []
  return {
    id: `ja-kanji-${o.n}`,
    lang: 'ja',
    unit: 6,
    order: o.n,
    title: o.title,
    subtitle: o.subtitle,
    level: 'N5',
    skills: ['reading', 'writing'],
    objectives: [`${o.chars.length} kanjiyi anlamıyla tanı`, 'Kanjiyi kelime içinde oku', 'Doğru çizgi sırasıyla yaz'],
    estMinutes: est(drill, write, extra),
    requires: [o.requires],
    sections: [
      { kind: 'teach', title: o.teachTitle, body: o.teach },
      { kind: 'kanji', title: 'Bu dersin kanjileri', chars: o.chars },
      ...(o.grammarIds ? [{ kind: 'grammar' as const, title: 'Dilbilgisi', grammarIds: o.grammarIds }] : []),
      { kind: 'exercises', title: 'Tanıma alıştırması', exercises: drill },
      ...(extra.length ? [{ kind: 'exercises' as const, title: 'Kullanım alıştırması', exercises: extra }] : []),
      ...(o.passage ? [o.passage] : []),
      { kind: 'exercises', title: 'Yazma alıştırması', exercises: write },
    ],
  }
}

const kanjiLessons: Lesson[] = [
  kanjiLesson({
    n: 1, chars: K_NUM, seen: kanjiSeen[0], requires: 'ja-g4',
    title: 'Kanji nedir? Sayılar', subtitle: '14 kanji · sayılar ve para',
    teachTitle: 'Kanji korkulacak bir şey değil',
    teach: `Kanji, Çince'den alınmış **anlam taşıyan** karakterlerdir. Hiragana ses yazar, kanji **anlam** yazar.

Neden gerekli? Japoncada aynı okunuşa sahip çok kelime var. 「はし」 hem köprü hem çubuk demek olabilir; kanji ayırır: 橋 / 箸.

Her kanjinin genelde iki tür okunuşu vardır:
- **on'yomi** — Çince kökenli. Genelde başka kanjilerle **birleşik** kelimelerde.
- **kun'yomi** — Japonca yerli. Genelde kanji **tek başına** veya hiragana ekiyle.

Örnek: 山 → tek başına **やま** (kun), birleşikte 火山 = か**ざん** (on).

**Kanjiyi tek başına ezberleme, içinde geçtiği kelimeyle ezberle.**

⚠️ Sayılarda düzensiz okumalar ezberlenir:
- 四 = よん / し, saatte **よじ**
- 七 = なな / しち, saatte **しちじ**
- 九 = きゅう / く, saatte **くじ**
- 十分 = **じゅっぷん**`,
    extra: [
      mcq('「千円」 ne kadar?', ['100 yen', '1.000 yen', '10.000 yen', '10 yen'], 1),
      mcq('「四月」 hangi ay?', ['Ocak', 'Şubat', 'Mart', 'Nisan'], 3),
      mcq('「一万円」 kaç yen?', ['1.000', '10.000', '100.000', '100'], 1),
      mcq('Saat 4 nasıl okunur?', ['しじ', 'よじ', 'よんじ', 'しちじ'], 1),
      fill('Boşluğu doldur: "üç kişi"', '三___', ['人'], 'üç kişi (さんにん)'),
      dict('五百円です', ['五百円です', 'ごひゃくえんです'], '500 yen.'),
    ],
  }),
  kanjiLesson({
    n: 2, chars: K_TIME, seen: kanjiSeen[1], requires: 'ja-kanji-1',
    title: 'Gün ve zaman', subtitle: '19 kanji · günler, saat, hafta',
    grammarIds: ['ja-time'],
    teachTitle: 'Günler doğa öğeleriyle adlandırılır',
    teach: `Japoncada haftanın günleri element adlarından gelir — ezberlemesi bu yüzden kolaydır:

| Gün | Kanji | Okunuş | Anlamı |
|---|---|---|---|
| Pazartesi | 月曜日 | げつようび | Ay günü |
| Salı | 火曜日 | かようび | Ateş günü |
| Çarşamba | 水曜日 | すいようび | Su günü |
| Perşembe | 木曜日 | もくようび | Ağaç günü |
| Cuma | 金曜日 | きんようび | Altın günü |
| Cumartesi | 土曜日 | どようび | Toprak günü |
| Pazar | 日曜日 | にちようび | Güneş günü |

Hepsi 曜日 ile biter; değişen sadece baştaki element kanjisidir.

日 hem "gün" hem "güneş" hem "Japonya" demektir: 日本 = güneşin kökü.

**午前 / 午後** — öğleden önce / sonra. Japoncada günlük dilde 24 saat yerine bu ikili kullanılır.

**間** "ara" demektir: 時間 (zaman), 週間 (hafta süresi), 人間 (insan).`,
    extra: [
      mcq('「水曜日」 hangi gün?', ['Salı', 'Çarşamba', 'Perşembe', 'Cuma'], 1),
      mcq('「午後三時」 saat kaç?', ['Sabah 3', 'Öğleden sonra 3', 'Gece 3', 'Öğlen 12'], 1),
      mcq('「毎週」 ne demek?', ['her gün', 'her hafta', 'her ay', 'her yıl'], 1),
      mcq('「今年」 ne demek?', ['bu yıl', 'geçen yıl', 'gelecek yıl', 'her yıl'], 0),
      fill('Boşluğu doldur: "İki buçuk"', '二時___', ['半'], 'İki buçuk'),
      dict('今日は月曜日です', ['今日は月曜日です', 'きょうはげつようびです'], 'Bugün pazartesi.'),
    ],
    passage: PSG_ISSHUUKAN,
  }),
  kanjiLesson({
    n: 3, chars: K_PEOPLE, seen: kanjiSeen[2], requires: 'ja-kanji-2',
    title: 'İnsan ve aile', subtitle: '13 kanji · kişiler ve akrabalar',
    teachTitle: 'Aile için iki ayrı kelime seti',
    teach: `Japoncada **kendi aileni** ve **başkasının ailesini** anlatırken farklı kelimeler kullanılır. Kendi aileni alçakgönüllü, karşındakinin ailesini saygılı anlatırsın.

| Kim | Kendi ailen | Başkasının ailesi |
|---|---|---|
| baba | 父 (ちち) | お父さん (おとうさん) |
| anne | 母 (はは) | お母さん (おかあさん) |
| ağabey | 兄 (あに) | お兄さん (おにいさん) |
| abla | 姉 (あね) | お姉さん (おねえさん) |

Türkçede böyle bir ayrım yok; "babam" ve "babanız" aynı kökten gelir. Japoncada **kelimenin kendisi değişir**.

Kardeş sistemine de dikkat: Japoncada "kardeş" diye tek kelime yoktur, **yaş her zaman belirtilir** — 兄 ağabey, 弟 küçük erkek kardeş.

人 çok iş görür: 日本人, トルコ人, 一人 (ひとり), 二人 (ふたり — düzensiz!).`,
    extra: [
      mcq('Kendi anneni başkasına anlatırken hangisi?', ['お母さん', '母', '母さん', 'お母'], 1),
      mcq('「一人」 nasıl okunur?', ['いちにん', 'ひとり', 'ひとつ', 'いちじん'], 1),
      mcq('「二人」 nasıl okunur?', ['ににん', 'ふたり', 'ふたつ', 'にじん'], 1),
      mcq('「兄」 kim?', ['Ağabeyim', 'Küçük erkek kardeşim', 'Ablam', 'Babam'], 0),
      fill('Boşluğu doldur: "Türkiyeliyim."', 'トルコ___です。', ['人'], 'Türkiyeliyim.'),
      translate('Ailem dört kişi.', ['家族は四人です', 'かぞくはよにんです', '私の家族は四人です'], 'to-target'),
    ],
    passage: PSG_KAZOKU,
  }),
  kanjiLesson({
    n: 4, chars: K_SCHOOL, seen: kanjiSeen[3], requires: 'ja-kanji-3',
    title: 'Okul ve dil', subtitle: '10 kanji · öğrenmek ve anlatmak',
    teachTitle: 'Kanjiler birleşerek yeni kelime kurar',
    teach: `Bu dersin kanjileri birbiriyle bol bol birleşir. Mantığı görürsen ezber azalır:

- 学 (öğrenmek) + 生 (yaşam) = **学生** öğrenci
- 学 + 校 (okul binası) = **学校** okul
- 大 (büyük) + 学 = **大学** üniversite
- 先 (önce) + 生 = **先生** öğretmen — "önce doğmuş"
- 日本 + 語 (dil) = **日本語** Japonca

Bu yüzden kanji öğrenmek üstel kazanç sağlar: 10 kanji öğrenirsin, 30 kelime okuyabilir hâle gelirsin.

**生** Japoncanın en çok okunuşu olan kanjisidir: せい, しょう, い‑きる, う‑まれる, なま… Panik yapma; hangi okunuşun geldiğini kelimeyle birlikte öğrenirsin.

Fiil kanjileri hiragana ekiyle gelir (okurigana): 読**む**, 書**く**, 聞**く**, 話**す**. Kanji kök, hiragana kuyruktur.`,
    extra: [
      mcq('「先生」 harfi harfine ne demek?', ['büyük kişi', 'önce doğmuş', 'okul insanı', 'bilgili kişi'], 1),
      mcq('「大学」 ne demek?', ['okul', 'lise', 'üniversite', 'sınıf'], 2),
      mcq('「聞く」 fiilinin iki anlamı?', ['okumak / yazmak', 'dinlemek / sormak', 'görmek / bakmak', 'gelmek / gitmek'], 1),
      fill('Boşluğu doldur: "Japonca okuyorum."', '日本語を___みます。', ['読'], 'Japonca okuyorum.'),
      translate('Okulda Japonca çalışıyorum.', ['学校で日本語を勉強します', 'がっこうでにほんごをべんきょうします'], 'to-target'),
    ],
  }),
  kanjiLesson({
    n: 5, chars: K_VERBS, seen: kanjiSeen[4], requires: 'ja-kanji-4',
    title: 'Fiil kanjileri', subtitle: '12 kanji · günlük eylemler',
    teachTitle: 'Kanji kök, hiragana kuyruk',
    teach: `Fiillerde kanji **anlamı**, hiragana **çekimi** taşır. Kök sabittir, kuyruk değişir:

食べる → 食べます → 食べて → 食べた

Kanji 食 hep aynı kalır. Bu yüzden bir fiil kanjisi öğrendiğinde o fiilin **bütün biçimlerini** okuyabilirsin.

Zıt çiftler birlikte öğrenilir:
- 行く (gitmek) ↔ 来る (gelmek)
- 出る (çıkmak) ↔ 入る (girmek)

⚠️ Aynı kanji farklı fiillerde farklı okunur:
- 出る (でる) çıkmak · 出す (だす) çıkarmak
- 入る (はいる) girmek · 入れる (いれる) içine koymak

Tuzak: **入る** ve **帰る** る ile biter ama **godan**dır.`,
    extra: [
      mcq('「帰ります」 ne demek?', ['gidiyorum', 'geliyorum', 'eve dönüyorum', 'çıkıyorum'], 2),
      mcq('「買います」 ne demek?', ['satıyorum', 'satın alıyorum', 'kullanıyorum', 'veriyorum'], 1),
      mcq('「会います」 hangi ekle kullanılır?', ['を', 'に', 'で', 'から'], 1, '友だちに会います'),
      fill('Boşluğu doldur: "Okula gidiyorum."', '学校へ___きます。', ['行'], 'Okula gidiyorum.'),
      translate('Eve dönüyorum.', ['家に帰ります', 'いえにかえります', '家へ帰ります'], 'to-target'),
    ],
  }),
  kanjiLesson({
    n: 6, chars: [...K_PLACE, ...K_NATURE], seen: kanjiSeen[5], requires: 'ja-kanji-5',
    title: 'Yer, yön ve doğa', subtitle: '20 kanji · nerede ve ne tarafta',
    teachTitle: 'Konum kelimeleri の ile kurulur',
    teach: `Yer bildiren kelimeler Japoncada **isim** gibi davranır ve の ile bağlanır:

机 **の** 上 = masanın üstü · 駅 **の** 前 = istasyonun önü

Sıralama Türkçeyle aynıdır: "masa‑nın üst‑ü". Bu yüzden alışması kolaydır.

| Kanji | Anlam |
|---|---|
| 上 | üst |
| 下 | alt |
| 中 | iç, orta |
| 外 | dış |
| 前 | ön, önce |
| 後 | arka, sonra |

Yönler: 東 (doğu), 西 (batı), 南 (güney), 北 (kuzey). Japonca sıralama **東西南北**tir; Türkçedeki "kuzey‑güney‑doğu‑batı" sırasından farklı.

Doğa kanjileri günlük kelimelerde çıkar: 天気 (hava), 電車 (tren — "elektrik arabası"), 空 (gökyüzü), 雨 (yağmur).`,
    extra: [
      mcq('「天気」 ne demek?', ['gökyüzü', 'hava durumu', 'yağmur', 'rüzgâr'], 1),
      mcq('「電車」 hangi iki kanjiden oluşur?', ['elektrik + araba', 'yol + araba', 'hızlı + araba', 'demir + yol'], 0),
      mcq('「中国」 hangi ülke?', ['Japonya', 'Kore', 'Çin', 'Tayvan'], 2, '中 (orta) + 国 (ülke)'),
      fill('Boşluğu doldur: "Masanın üstünde"', '机___上に', ['の'], 'Masanın üstünde'),
      translate('Bugün hava güzel.', ['今日はいい天気です', 'きょうはいいてんきです'], 'to-target'),
    ],
  }),
  kanjiLesson({
    n: 7, chars: [...K_ADJ, ...K_BODY], seen: kanjiSeen[6], requires: 'ja-kanji-6',
    title: 'Sıfat ve vücut', subtitle: '18 kanji · betimleme ve beden',
    grammarIds: ['ja-yori-hou', 'ja-ichiban'],
    teachTitle: 'Zıt çiftler birlikte öğrenilir',
    teach: `Sıfat kanjileri neredeyse hep çift hâlinde gelir. Birini öğrenirken zıddını da öğren:

- 大 (büyük) ↔ 小 (küçük)
- 高 (yüksek/pahalı) ↔ 安 (ucuz)
- 新 (yeni) ↔ 古 (eski)
- 多 (çok) ↔ 少 (az)

**高い** iki anlamlıdır: hem "yüksek" hem "pahalı".

İki kanji birleşince yeni anlam çıkar:
- 大人 (おとな) = "büyük insan" → yetişkin
- 上手 (じょうず) = "üst el" → usta
- 下手 (へた) = "alt el" → beceriksiz

Vücut kanjileri resim gibidir: 口 ağız, 目 göz, 耳 kulak, 手 el, 足 ayak.`,
    extra: [
      mcq('「上手」 ne demek?', ['beceriksiz', 'usta, iyi', 'sağ el', 'yukarı'], 1),
      mcq('「大人」 ne demek?', ['yetişkin', 'dev', 'patron', 'yaşlı'], 0),
      mcq('「高い」 iki anlamı?', ['yüksek / pahalı', 'büyük / uzun', 'yeni / iyi', 'az / çok'], 0),
      fill('Boşluğu doldur: "Japoncam iyi değil."', '日本語が___手です。', ['下'], 'Japoncam iyi değil (下手).'),
      translate('Bu araba pahalı.', ['この車は高いです', 'このくるまはたかいです'], 'to-target'),
    ],
  }),
]

export const LESSONS_GENKI: Lesson[] = [
  greetingsLesson, g1, g2, g3, g4,
  g5, g6, g7, g8,
  g9, g10, g11, g12,
  ...kanjiLessons,
]
