import type { Exercise, Skill } from '@/types'
import type { ChoukaiQ, MockQ } from '../n5-mock'

/**
 * Üniteler — uygulamanın ana öğrenme yolu.
 *
 * NEDEN DERSLERDEN AYRI BİR YAPI:
 * Mevcut "Dersler" Genki'nin ders SIRASINI izliyor; yani kitabın
 * müfredatına bağlı. Üniteler ise KONUYA göre kurulu: "kendimi tanıtmak",
 * "saatler", "alışveriş". Öğrencinin istediği şey buydu — sınavla örtüşsün
 * ama sınav müfredatı gibi değil, işe yarar durumlar hâlinde olsun.
 *
 * Konu sırası standart başlangıç müfredatlarıyla (Minna no Nihongo I,
 * Genki I) ve N5'in kapsadığı günlük durumlarla örtüşüyor: tanışma →
 * eşyalar → saat ve program → alışveriş → yer bildirme → gidiş geliş →
 * betimleme → geçmiş → rica.
 *
 * Her ünitede: hedefler, dilbilgisi, kelime, okuma metni, ödev ve test.
 * Alıştırmalar mevcut `Exercise` tipini kullanıyor, böylece ünite testi
 * ders oynatıcısının denenmiş bileşeniyle (ExerciseView) çalışıyor.
 */

export interface UnitVocab {
  /** Yıldızlı: bu ünitenin en çok kullanılan kelimelerinden */
  star?: boolean
  /** Yazılışı (kanjili olabilir) */
  ja: string
  /** Kana okunuşu */
  kana: string
  tr: string
  /** Kullanım notu — yalnızca gerekince */
  note?: string
}

export interface UnitLine {
  ja: string
  kana: string
  tr: string
}

export interface UnitGrammar {
  title: string
  /** Yıldızlı: bu ünitenin atlanamaz konusu */
  star?: boolean
  /** Kalıbın kendisi: AはBです */
  pattern: string
  explain: string
  examples: UnitLine[]
  /** En sık yapılan hata */
  pitfall?: string
  /** Uygulamadaki ayrıntılı dilbilgisi kaydı */
  ref?: string
}

export interface UnitRule {
  title: string
  body: string
  /** Yıldızlı: sınavda ya da konuşmada doğrudan hata kaynağı */
  star?: boolean
}

export interface UnitText {
  title: string
  /** Metnin bağlamı — okumadan önce okunur */
  intro: string
  lines: UnitLine[]
  questions: Exercise[]
}

export interface UnitHomework {
  id: string
  title: string
  detail: string
  minutes: number
  /**
   * Adım adım nasıl yapılacağı.
   *
   * Önce yalnızca tek cümlelik bir yönerge vardı ve öğrenci "peki nasıl
   * başlayayım" diye kalıyordu. Ödev kâğıt üstünde yapılıyor; uygulamanın
   * verebileceği yardım tam olarak budur: sırayı söylemek.
   */
  steps?: string[]
  /** Örnek cevap — neye benzemesi gerektiğini görmeden başlamak zor */
  example?: UnitLine[]
  /** Kullanılacak kalıplar ve sık yapılan hatalar */
  tips?: string[]
  /** Yıldızlı: bu üniteyi bitirmeden atlanmamalı */
  star?: boolean
}

export interface Unit {
  id: string
  no: number
  title: string
  subtitle: string
  /** Bu üniteyi bitirince yapabilecekleri */
  canDo: string[]
  minutes: number
  grammar: UnitGrammar[]
  vocab: UnitVocab[]
  rules?: UnitRule[]
  text: UnitText
  homework: UnitHomework[]
  test: Exercise[]
  /** İlgili Genki dersleri — ders oynatıcısında açılır */
  lessonIds?: string[]
  /**
   * Gerçek N5 soru biçimindeki sorular (okuma bölümü). Ünite dosyasında
   * değil `n5-sorulari.ts` içinde yazılıyor ve index'te birleşiyor: hepsi
   * deneme sınavının havuzuna da giriyor, tek yerde durmaları gerekiyor.
   */
  n5?: MockQ[]
  /** Gerçek N5 biçimindeki dinleme soruları */
  choukai?: ChoukaiQ[]
}

// ————————————————————————— Alıştırma yardımcıları —————————————————————————
//
// Ünite testleri yüzlerce satır; her alıştırmayı elle nesne olarak yazmak
// hem okunmaz hem de alan adını yanlış yazma riski taşır. Bu yardımcılar
// kimliği de üretiyor, böylece iki soru aynı kimliği alamıyor.

export const mcq = (
  id: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation?: string,
  skill: Skill = 'grammar',
): Exercise => ({ id, type: 'mcq', prompt, options, answer, skill, explanation })

export const fill = (
  id: string,
  sentence: string,
  answers: string[],
  translation?: string,
  hint?: string,
  explanation?: string,
): Exercise => ({
  id,
  type: 'fill',
  prompt: 'Boşluğu doldur',
  sentence,
  answers,
  translation,
  hint,
  skill: 'grammar',
  explanation,
})

export const order = (id: string, tokens: string[], translation: string, explanation?: string): Exercise => ({
  id,
  type: 'order',
  prompt: 'Kelimeleri sıraya diz',
  tokens,
  translation,
  skill: 'grammar',
  explanation,
})

export const translate = (
  id: string,
  source: string,
  answers: string[],
  direction: 'to-target' | 'to-tr' = 'to-tr',
  sourceReading?: string,
  explanation?: string,
): Exercise => ({
  id,
  type: 'translate',
  prompt: direction === 'to-tr' ? 'Türkçeye çevir' : 'Japoncaya çevir',
  source,
  sourceReading,
  answers,
  direction,
  skill: 'reading',
  explanation,
})

export const dict = (id: string, text: string, answers: string[], translation: string): Exercise => ({
  id,
  type: 'dictation',
  prompt: 'Dinle ve duyduğunu yaz',
  text,
  lang: 'ja',
  answers,
  translation,
  skill: 'listening',
})
