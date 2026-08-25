// Japonca fiil ve sıfat çekim motoru.
// Sözlük biçiminden bütün temel çekimleri üretir; kanji yazımı ve kana okunuşu
// aynı kurallarla işlendiği için ikisi paralel hesaplanır.

export type VerbGroup = 'godan' | 'ichidan' | 'suru' | 'kuru'
export type AdjType = 'i' | 'na'

/** Godan fiillerde son kananın satır değişimi */
const ROWS: Record<string, { a: string; i: string; e: string; o: string }> = {
  う: { a: 'わ', i: 'い', e: 'え', o: 'お' },
  く: { a: 'か', i: 'き', e: 'け', o: 'こ' },
  ぐ: { a: 'が', i: 'ぎ', e: 'げ', o: 'ご' },
  す: { a: 'さ', i: 'し', e: 'せ', o: 'そ' },
  つ: { a: 'た', i: 'ち', e: 'て', o: 'と' },
  ぬ: { a: 'な', i: 'に', e: 'ね', o: 'の' },
  ぶ: { a: 'ば', i: 'び', e: 'べ', o: 'ぼ' },
  む: { a: 'ま', i: 'み', e: 'め', o: 'も' },
  る: { a: 'ら', i: 'り', e: 'れ', o: 'ろ' },
}

/** て / た biçiminde son kanaya göre ek */
const TE_ENDINGS: Record<string, [string, string]> = {
  う: ['って', 'った'],
  つ: ['って', 'った'],
  る: ['って', 'った'],
  む: ['んで', 'んだ'],
  ぶ: ['んで', 'んだ'],
  ぬ: ['んで', 'んだ'],
  く: ['いて', 'いた'],
  ぐ: ['いで', 'いだ'],
  す: ['して', 'した'],
}

/** る ile biten ama godan olan yaygın fiiller — ichidan sanılmasınlar. */
const GODAN_RU_EXCEPTIONS = new Set([
  'かえる', 'はいる', 'はしる', 'しる', 'きる', 'いる', 'かぎる', 'へる', 'しゃべる', 'すべる', 'ちる', 'まいる', 'いじる', 'ける',
])

/** Sözlük biçiminden fiil grubunu tahmin eder. */
export function detectGroup(dict: string, reading?: string): VerbGroup {
  const r = reading ?? dict
  if (dict === 'する' || dict.endsWith('する')) return 'suru'
  if (dict === '来る' || r === 'くる' || dict === 'くる') return 'kuru'
  if (!dict.endsWith('る')) return 'godan'
  const beforeRu = r[r.length - 2]
  // え veya い satırından sonra る geliyorsa genelde ichidan
  const isEorI = /[いきしちにひみりぎじびぴえけせてねへめれげぜでべぺ]/.test(beforeRu ?? '')
  if (!isEorI) return 'godan'
  if (GODAN_RU_EXCEPTIONS.has(r)) return 'godan'
  return 'ichidan'
}

interface Pair {
  term: string
  reading: string
}

function replaceLast(s: string, ending: string): string {
  return s.slice(0, -1) + ending
}

/** Aynı dönüşümü hem kanjili yazıma hem okunuşa uygular. */
function both(p: Pair, fn: (s: string) => string): Pair {
  return { term: fn(p.term), reading: fn(p.reading) }
}

export interface ConjugationSet {
  /** Form kimliği → { term, reading } */
  forms: Record<string, Pair>
  group: VerbGroup
}

export interface FormMeta {
  id: string
  /** Türkçe ad */
  tr: string
  /** Japonca gramer adı */
  ja: string
  /** Ne işe yaradığı — kısa Türkçe açıklama */
  note: string
  category: 'nezaket' | 'sade' | 'baglanti' | 'yetenek' | 'diger'
}

export const VERB_FORMS: FormMeta[] = [
  { id: 'dict', tr: 'Sözlük biçimi', ja: '辞書形', note: 'Fiilin temel hâli. Sözlükte böyle geçer.', category: 'sade' },
  { id: 'masu', tr: 'Şimdiki/geniş (kibar)', ja: 'ます形', note: 'Kibar konuşmanın temeli: "yiyorum / yerim".', category: 'nezaket' },
  { id: 'masen', tr: 'Olumsuz (kibar)', ja: 'ません', note: '"yemiyorum".', category: 'nezaket' },
  { id: 'mashita', tr: 'Geçmiş (kibar)', ja: 'ました', note: '"yedim".', category: 'nezaket' },
  { id: 'masendeshita', tr: 'Geçmiş olumsuz (kibar)', ja: 'ませんでした', note: '"yemedim".', category: 'nezaket' },
  { id: 'nai', tr: 'Olumsuz (sade)', ja: 'ない形', note: 'Arkadaş arası olumsuz: "yemiyorum".', category: 'sade' },
  { id: 'ta', tr: 'Geçmiş (sade)', ja: 'た形', note: 'Arkadaş arası geçmiş: "yedim".', category: 'sade' },
  { id: 'nakatta', tr: 'Geçmiş olumsuz (sade)', ja: 'なかった', note: '"yemedim".', category: 'sade' },
  { id: 'te', tr: 'Bağlama biçimi', ja: 'て形', note: 'Japoncanın kalbi: cümle bağlar, "‑ip/‑erek" işlevi görür, ‑ている gibi yapıların temelidir.', category: 'baglanti' },
  { id: 'teiru', tr: 'Sürüyor', ja: 'ている', note: 'Şu anda devam eden eylem: "yiyor".', category: 'baglanti' },
  { id: 'temasu', tr: 'Sürüyor (kibar)', ja: 'ています', note: 'Kibar hâli.', category: 'baglanti' },
  { id: 'tekudasai', tr: 'Rica', ja: 'てください', note: '"lütfen ye".', category: 'baglanti' },
  { id: 'potential', tr: 'Yeterlilik', ja: '可能形', note: '"yiyebilirim".', category: 'yetenek' },
  { id: 'volitional', tr: 'İstek/teklif', ja: '意向形', note: '"yiyelim mi / hadi yiyelim".', category: 'yetenek' },
  { id: 'passive', tr: 'Edilgen', ja: '受身形', note: '"yenildi / yenir".', category: 'diger' },
  { id: 'causative', tr: 'Ettirgen', ja: '使役形', note: '"yedirmek / yemesine izin vermek".', category: 'diger' },
  { id: 'imperative', tr: 'Emir (sert)', ja: '命令形', note: 'Kaba emir: "ye!". Günlük hayatta dikkatli kullan.', category: 'diger' },
  { id: 'ba', tr: 'Koşul (‑se)', ja: 'ば形', note: '"yersen".', category: 'diger' },
  { id: 'tara', tr: 'Koşul (‑diğinde)', ja: 'たら形', note: '"yedikten sonra / yersen".', category: 'diger' },
  { id: 'tai', tr: 'İstek', ja: 'たい形', note: '"yemek istiyorum".', category: 'yetenek' },
]

export function conjugateVerb(dict: string, reading: string, group?: VerbGroup): ConjugationSet {
  const g = group ?? detectGroup(dict, reading)
  const base: Pair = { term: dict, reading }
  const forms: Record<string, Pair> = { dict: base }

  const set = (id: string, p: Pair) => {
    forms[id] = p
  }

  if (g === 'suru') {
    // 勉強する gibi bileşikler: "する" kısmı çekilir, gövde sabit kalır.
    const stem = both(base, (s) => s.slice(0, -2))
    const add = (suffix: string) => both(stem, (s) => s + suffix)
    set('masu', add('します'))
    set('masen', add('しません'))
    set('mashita', add('しました'))
    set('masendeshita', add('しませんでした'))
    set('nai', add('しない'))
    set('ta', add('した'))
    set('nakatta', add('しなかった'))
    set('te', add('して'))
    set('teiru', add('している'))
    set('temasu', add('しています'))
    set('tekudasai', add('してください'))
    set('potential', add('できる'))
    set('volitional', add('しよう'))
    set('passive', add('される'))
    set('causative', add('させる'))
    set('imperative', add('しろ'))
    set('ba', add('すれば'))
    set('tara', add('したら'))
    set('tai', add('したい'))
    return { forms, group: g }
  }

  if (g === 'kuru') {
    // 来る: kanji sabit kalır, okunuş değişir (く→き/こ). Bu yüzden elle eşlenir.
    const kanji = dict.startsWith('来')
    const pair = (k: string, r: string): Pair => ({ term: kanji ? k : r, reading: r })
    set('masu', pair('来ます', 'きます'))
    set('masen', pair('来ません', 'きません'))
    set('mashita', pair('来ました', 'きました'))
    set('masendeshita', pair('来ませんでした', 'きませんでした'))
    set('nai', pair('来ない', 'こない'))
    set('ta', pair('来た', 'きた'))
    set('nakatta', pair('来なかった', 'こなかった'))
    set('te', pair('来て', 'きて'))
    set('teiru', pair('来ている', 'きている'))
    set('temasu', pair('来ています', 'きています'))
    set('tekudasai', pair('来てください', 'きてください'))
    set('potential', pair('来られる', 'こられる'))
    set('volitional', pair('来よう', 'こよう'))
    set('passive', pair('来られる', 'こられる'))
    set('causative', pair('来させる', 'こさせる'))
    set('imperative', pair('来い', 'こい'))
    set('ba', pair('来れば', 'くれば'))
    set('tara', pair('来たら', 'きたら'))
    set('tai', pair('来たい', 'きたい'))
    return { forms, group: g }
  }

  if (g === 'ichidan') {
    const stem = both(base, (s) => s.slice(0, -1))
    const add = (suffix: string) => both(stem, (s) => s + suffix)
    set('masu', add('ます'))
    set('masen', add('ません'))
    set('mashita', add('ました'))
    set('masendeshita', add('ませんでした'))
    set('nai', add('ない'))
    set('ta', add('た'))
    set('nakatta', add('なかった'))
    set('te', add('て'))
    set('teiru', add('ている'))
    set('temasu', add('ています'))
    set('tekudasai', add('てください'))
    set('potential', add('られる'))
    set('volitional', add('よう'))
    set('passive', add('られる'))
    set('causative', add('させる'))
    set('imperative', add('ろ'))
    set('ba', add('れば'))
    set('tara', add('たら'))
    set('tai', add('たい'))
    return { forms, group: g }
  }

  // godan
  const last = reading[reading.length - 1]
  const row = ROWS[last]
  if (!row) return { forms, group: g }

  const iStem = both(base, (s) => replaceLast(s, row.i))
  const aStem = both(base, (s) => replaceLast(s, row.a))
  const eStem = both(base, (s) => replaceLast(s, row.e))
  const oStem = both(base, (s) => replaceLast(s, row.o))

  // 行く tek istisna: kurala göre 行いて olurdu, doğrusu 行って.
  const isIku = reading === 'いく'
  const [teEnd, taEnd] = isIku ? ['って', 'った'] : TE_ENDINGS[last]
  const teForm = both(base, (s) => replaceLast(s, teEnd))
  const taForm = both(base, (s) => replaceLast(s, taEnd))

  const withI = (suffix: string) => both(iStem, (s) => s + suffix)
  const withA = (suffix: string) => both(aStem, (s) => s + suffix)
  const withTe = (suffix: string) => both(teForm, (s) => s + suffix)

  set('masu', withI('ます'))
  set('masen', withI('ません'))
  set('mashita', withI('ました'))
  set('masendeshita', withI('ませんでした'))
  set('nai', withA('ない'))
  set('ta', taForm)
  set('nakatta', withA('なかった'))
  set('te', teForm)
  set('teiru', withTe('いる'))
  set('temasu', withTe('います'))
  set('tekudasai', withTe('ください'))
  set('potential', both(eStem, (s) => s + 'る'))
  set('volitional', both(oStem, (s) => s + 'う'))
  set('passive', withA('れる'))
  set('causative', withA('せる'))
  set('imperative', eStem)
  set('ba', both(eStem, (s) => s + 'ば'))
  set('tara', both(taForm, (s) => s + 'ら'))
  set('tai', withI('たい'))
  return { forms, group: g }
}

// ————————————————————————— Sıfatlar —————————————————————————

export const ADJ_FORMS: FormMeta[] = [
  { id: 'plain', tr: 'Yalın', ja: '辞書形', note: 'Temel hâl.', category: 'sade' },
  { id: 'polite', tr: 'Kibar', ja: 'です', note: 'Cümle sonunda kibar bitiş.', category: 'nezaket' },
  { id: 'neg', tr: 'Olumsuz', ja: 'くない / じゃない', note: '"büyük değil".', category: 'sade' },
  { id: 'negPolite', tr: 'Olumsuz (kibar)', ja: 'くないです', note: 'Kibar olumsuz.', category: 'nezaket' },
  { id: 'past', tr: 'Geçmiş', ja: 'かった / だった', note: '"büyüktü".', category: 'sade' },
  { id: 'pastPolite', tr: 'Geçmiş (kibar)', ja: 'かったです', note: 'Kibar geçmiş.', category: 'nezaket' },
  { id: 'pastNeg', tr: 'Geçmiş olumsuz', ja: 'くなかった', note: '"büyük değildi".', category: 'sade' },
  { id: 'adverb', tr: 'Zarf hâli', ja: 'く / に', note: '"büyükçe", fiili niteler.', category: 'diger' },
  { id: 'te', tr: 'Bağlama', ja: 'くて / で', note: 'İki sıfatı bağlar: "büyük ve yeni".', category: 'baglanti' },
  { id: 'attributive', tr: 'İsim önü', ja: '連体形', note: 'İsimden önce gelen hâli.', category: 'diger' },
]

export function conjugateAdjective(dict: string, reading: string, type: AdjType): ConjugationSet {
  const forms: Record<string, Pair> = { plain: { term: dict, reading } }
  const base: Pair = { term: dict, reading }
  const set = (id: string, p: Pair) => {
    forms[id] = p
  }

  if (type === 'i') {
    // いい düzensizdir: gövdesi よ- olur (よくない, よかった)
    const irregularYoi = reading === 'いい'
    const stem = irregularYoi ? { term: 'よ', reading: 'よ' } : both(base, (s) => s.slice(0, -1))
    const add = (suffix: string) => both(stem, (s) => s + suffix)
    set('polite', both(base, (s) => s + 'です'))
    set('neg', add('くない'))
    set('negPolite', add('くないです'))
    set('past', add('かった'))
    set('pastPolite', add('かったです'))
    set('pastNeg', add('くなかった'))
    set('adverb', add('く'))
    set('te', add('くて'))
    set('attributive', base)
    return { forms, group: 'godan' }
  }

  const add = (suffix: string) => both(base, (s) => s + suffix)
  set('polite', add('です'))
  set('neg', add('じゃない'))
  set('negPolite', add('じゃないです'))
  set('past', add('だった'))
  set('pastPolite', add('でした'))
  set('pastNeg', add('じゃなかった'))
  set('adverb', add('に'))
  set('te', add('で'))
  set('attributive', add('な'))
  return { forms, group: 'godan' }
}

export const GROUP_TR: Record<VerbGroup, string> = {
  godan: 'Godan (u-fiil, 五段)',
  ichidan: 'Ichidan (ru-fiil, 一段)',
  suru: 'する düzensiz',
  kuru: '来る düzensiz',
}

export const GROUP_NOTE: Record<VerbGroup, string> = {
  godan:
    'Son kana satır değiştirir. ます için い satırına, ない için あ satırına geçer. Japoncadaki fiillerin çoğu bu gruptadır.',
  ichidan: 'Sondaki る atılır, ek doğrudan eklenir. Öğrenmesi en kolay grup.',
  suru: 'Tamamen düzensiz. İsim + する ile sayısız fiil üretilir (勉強する, 電話する...).',
  kuru: 'Tek başına düzensiz. Okunuşu き / こ / く arasında değişir, kanji sabit kalır.',
}
