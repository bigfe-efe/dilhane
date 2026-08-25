// Dilhane içerik modeli — tüm dersler, kelimeler ve alıştırmalar bu tiplere uyar.

/**
 * Uygulama tek dillidir (Japonca). Tip yine de duruyor çünkü içerik modeli,
 * SRS kartları ve istatistikler bu alanı taşıyor; tek değere daraltmak
 * İngilizce kalıntılarının derleme anında yakalanmasını sağlıyor.
 */
export type Lang = 'ja'

export type Skill =
  | 'reading'   // okuma
  | 'writing'   // yazma
  | 'listening' // dinleme
  | 'speaking'  // konuşma
  | 'vocab'     // kelime
  | 'grammar'   // dilbilgisi

export const SKILL_TR: Record<Skill, string> = {
  reading: 'Okuma',
  writing: 'Yazma',
  listening: 'Dinleme',
  speaking: 'Konuşma',
  vocab: 'Kelime',
  grammar: 'Dilbilgisi',
}

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type Level = JlptLevel | CefrLevel

/** Örnek cümle. `reading` Japoncada furigana/kana okunuşu, İngilizcede boş bırakılır. */
export interface Example {
  text: string
  reading?: string
  romaji?: string
  tr: string
  audio?: string
}

/** Sözlük/kelime kartı. SRS bu id üzerinden ilerleme tutar. */
export interface Vocab {
  id: string
  lang: Lang
  term: string
  reading?: string
  romaji?: string
  tr: string
  en?: string
  pos?: string
  level?: Level
  examples?: Example[]
  tags?: string[]
  audio?: string
  /** Japonca kelimede geçen kanji karakterleri (yazı modülü için) */
  kanji?: string[]
}

/** Dilbilgisi noktası. Açıklama Markdown-benzeri sade metin. */
export interface GrammarPoint {
  id: string
  lang: Lang
  title: string
  level: Level
  /** Tek cümlelik özet — Türkçe */
  summaryTr: string
  /** Uzun anlatım — Türkçe */
  explanationTr: string
  /** İleri seviyede gösterilen İngilizce anlatım (İngilizce dersleri için) */
  explanationEn?: string
  /** Kalıp gösterimi: "V-て + います" gibi */
  patterns: string[]
  examples: Example[]
  /** Sık yapılan hatalar */
  pitfalls?: string[]
  related?: string[]
  /**
   * Genki (3. baskı) müfredatında hangi derste geçtiği. 1–12 = Genki I,
   * 13–23 = Genki II. Kitapla birlikte çalışanlar için eşleme; içerik
   * tamamen bu uygulamaya özgüdür, kitaptan alıntı değildir.
   */
  genki?: number
}

/** Fiil çekim tablosu (Japonca ve İngilizce düzensiz fiiller için) */
export interface ConjugationTable {
  id: string
  lang: Lang
  lemma: string
  reading?: string
  tr: string
  group?: string
  rows: { form: string; formTr: string; value: string; reading?: string; note?: string }[]
}

// ————————————————————————— Alıştırmalar —————————————————————————

interface ExerciseBase {
  id: string
  /** Soru kökü — Türkçe yönerge */
  prompt: string
  skill: Skill
  explanation?: string
  audioText?: string
  audioLang?: Lang
}

export interface McqExercise extends ExerciseBase {
  type: 'mcq'
  options: string[]
  answer: number
  /** Şıkların altında gösterilecek okunuş/ipucu */
  optionHints?: string[]
}

export interface FillExercise extends ExerciseBase {
  type: 'fill'
  /** Boşluk için ___ kullan */
  sentence: string
  answers: string[]
  hint?: string
  translation?: string
}

export interface MatchExercise extends ExerciseBase {
  type: 'match'
  pairs: { left: string; right: string }[]
}

export interface DictationExercise extends ExerciseBase {
  type: 'dictation'
  /** Seslendirilecek metin */
  text: string
  lang: Lang
  answers: string[]
  translation?: string
}

export interface TranslateExercise extends ExerciseBase {
  type: 'translate'
  source: string
  sourceReading?: string
  /** Kabul edilen cevaplar (normalize edilerek karşılaştırılır) */
  answers: string[]
  direction: 'to-target' | 'to-tr'
}

export interface SpeakExercise extends ExerciseBase {
  type: 'speak'
  text: string
  reading?: string
  lang: Lang
  tr: string
}

export interface OrderExercise extends ExerciseBase {
  type: 'order'
  /** Doğru sıradaki parçalar; uygulama karıştırır */
  tokens: string[]
  translation?: string
}

export interface WriteExercise extends ExerciseBase {
  type: 'write'
  /** Çizilecek karakter veya kelime */
  target: string
  reading?: string
  tr?: string
}

export interface FreeWritingExercise extends ExerciseBase {
  type: 'free-writing'
  lang: Lang
  minWords: number
  /** Kendi kendini değerlendirme ölçütleri */
  rubric: string[]
  sampleAnswer?: string
}

export type Exercise =
  | McqExercise
  | FillExercise
  | MatchExercise
  | DictationExercise
  | TranslateExercise
  | SpeakExercise
  | OrderExercise
  | WriteExercise
  | FreeWritingExercise

// ————————————————————————— Dersler —————————————————————————

export type LessonSection =
  | { kind: 'teach'; title: string; body: string; lang?: Lang }
  | { kind: 'vocab'; title: string; vocabIds: string[] }
  | { kind: 'grammar'; title: string; grammarIds: string[] }
  | { kind: 'kana'; title: string; chars: string[] }
  | { kind: 'kanji'; title: string; chars: string[] }
  | { kind: 'passage'; title: string; lang: Lang; text: string; reading?: string; tr: string; questions: Exercise[] }
  | { kind: 'exercises'; title: string; exercises: Exercise[] }

export interface Lesson {
  id: string
  lang: Lang
  /** Ünite numarası — dersler ünitelere gruplanır */
  unit: number
  order: number
  title: string
  subtitle?: string
  level: Level
  skills: Skill[]
  objectives: string[]
  sections: LessonSection[]
  estMinutes: number
  /** Bu ders bitmeden açılmaz */
  requires?: string[]
  /**
   * Genki (3. baskı) müfredatında karşılık gelen ders numarası.
   * 0 = あいさつ bölümü, 1–12 = Genki I. Yalnızca sıralama eşlemesidir;
   * içerik bu uygulamaya özgüdür.
   */
  genki?: number
}

export interface Unit {
  lang: Lang
  number: number
  title: string
  description: string
  level: Level
}

/** Ödev — derslerden bağımsız, tarihli görev */
export interface Homework {
  id: string
  lang: Lang
  title: string
  description: string
  skill: Skill
  level: Level
  exercises: Exercise[]
  estMinutes: number
  lessonId?: string
}

// ————————————————————————— Kana / Kanji —————————————————————————

export interface KanaChar {
  char: string
  romaji: string
  type: 'hiragana' | 'katakana'
  group: string
  /** Türkçe okunuş ipucu — "şi", "çi", "tsu" gibi */
  trHint: string
  /** Hatırlatıcı — Türkçe */
  mnemonic?: string
  strokes?: number
  /** Sesli/sessiz ayrımı: temel, dakuten (″), handakuten (°), yōon (birleşik) */
  kind: 'base' | 'dakuten' | 'handakuten' | 'yoon'
}

export interface KanjiChar {
  char: string
  meaningsTr: string[]
  meaningsEn: string[]
  on: string[]
  kun: string[]
  strokes: number
  jlpt: JlptLevel
  grade?: number
  /** Örnek kelimeler */
  words: { term: string; reading: string; tr: string }[]
  mnemonic?: string
  radicals?: string[]
}
