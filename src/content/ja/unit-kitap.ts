import type { Exercise } from '@/types'
import { LESSONS_BY_ID } from '@/content'
import { UNITS, unitKanji, type Unit } from './units'
import { gorulenKanji } from '@/lib/yeni-kelime'

// Ünite = kitap. Sekmeler yerine sırayla okunan sayfalar.
//
// NEDEN: sekmeli ünitede yalnızca başlıklar vardı (Hedefler, Dilbilgisi,
// Kelime…) ve hangisinin ne için, hangi sırayla, nasıl çalışılacağı hiçbir
// yerde yazmıyordu. Öğrenci dilbilgisini kelimeden önce açıyor, örneklerde
// tanımadığı kanjilerle karşılaşıyordu. Kitapta sıra sabit: kelime ve kanji
// önce, sonra her dilbilgisi konusu kendi sayfasında, sonra metin, alıştırma,
// ödev ve test. Her sayfanın başında ne yapılacağı yazıyor.
//
// Sayfalar iki güne bölünüyor: öğrenci bir üniteyi iki gecede çalışıyor.
// 1. gün öğrenme (kelime → dilbilgisi), 2. gün kullanma (metin → test).

export type SayfaTur = 'giris' | 'kelime' | 'kanji' | 'gramer' | 'kurallar' | 'metin' | 'alistirma' | 'odev' | 'test' | 'n5'

export interface Sayfa {
  id: string
  tur: SayfaTur
  baslik: string
  /** İçindekilerde başlığın altındaki kısa açıklama */
  alt?: string
  dakika: number
  /** 1: öğrenme günü, 2: kullanma günü, 0: isteğe bağlı */
  gun: 0 | 1 | 2
  /** Dilbilgisi sayfasında konunun sırası */
  gramer?: number
}

export function kitapSayfalari(u: Unit): Sayfa[] {
  const s: Sayfa[] = [{ id: 'giris', tur: 'giris', baslik: 'Başlarken', alt: 'Hedefler ve çalışma planı', dakika: 5, gun: 1 }]
  s.push({
    id: 'kelime',
    tur: 'kelime',
    baslik: 'Kelimeler',
    alt: `${u.vocab.length} kelime`,
    dakika: Math.max(10, Math.round(u.vocab.length * 0.7)),
    gun: 1,
  })
  const kanji = unitKanji(u.id).length
  if (kanji) s.push({ id: 'kanji', tur: 'kanji', baslik: 'Kanjiler', alt: `${kanji} kanji, tek tek`, dakika: kanji * 2, gun: 1 })
  u.grammar.forEach((g, i) =>
    s.push({ id: `gramer-${i + 1}`, tur: 'gramer', baslik: g.title, alt: g.pattern, dakika: 8, gun: 1, gramer: i }),
  )
  if (u.rules?.length) s.push({ id: 'kurallar', tur: 'kurallar', baslik: 'Kurallar', alt: `${u.rules.length} kısa kural`, dakika: 5, gun: 1 })
  s.push({ id: 'metin', tur: 'metin', baslik: 'Okuma metni', alt: u.text.title, dakika: 15, gun: 2 })
  const ek = ekAlistirma(u.id)
  // Birkaç soruluk sayfa açmaya değmez
  if (ek.length >= 4) s.push({ id: 'alistirma', tur: 'alistirma', baslik: 'Alıştırma', alt: `${ek.length} soru`, dakika: Math.round(ek.length * 0.7), gun: 2 })
  s.push({
    id: 'odev',
    tur: 'odev',
    baslik: 'Ödev',
    alt: 'Kâğıt üstünde',
    dakika: u.homework.reduce((n, h) => n + h.minutes, 0),
    gun: 2,
  })
  s.push({ id: 'test', tur: 'test', baslik: 'Ünite testi', alt: '%70 ile ünite biter', dakika: 10, gun: 2 })
  if ((u.n5?.length ?? 0) + (u.choukai?.length ?? 0) > 0)
    s.push({ id: 'n5', tur: 'n5', baslik: 'N5 soruları', alt: 'İsteğe bağlı · sınav biçimi', dakika: 10, gun: 0 })
  return s
}

/** Eski sekme adresleri (?b=gramer) → kitap sayfası */
export function eskiSekme(b: string | null): string | null {
  switch (b) {
    case 'hedef':
      return 'giris'
    case 'gramer':
      return 'gramer-1'
    case 'kelime':
    case 'metin':
    case 'odev':
    case 'test':
    case 'n5':
      return b
    default:
      return null
  }
}

// ————————————————————— Genki sırasındaki derslerden alıştırma —————————————————————
//
// Uygulamanın eski "Dersler" yolu Genki I'in ders sırasını izliyor ve her
// dersin yapı ve cümle alıştırmaları var. Öğrenci "ilgili Genki dersini de
// yapmalı mıyım" diye soruyordu: ayrı bir iş gibi duruyordu. Artık o
// alıştırmalar ünitenin içinde.
//
// İki süzgeç:
//   • Yalnızca o ünitede görülmüş kanjiyle yazılmış sorular. Genki dersi
//     üniteden farklı sırada ilerliyor; ileri kanjili soru, ileri konudur.
//   • Her soru yalnızca bir kez: aynı ders birden çok üniteye bağlı (Genki 3
//     → 3, 4, 6. üniteler); soru süzgeçten geçtiği İLK ünitede çıkar.
// Kelime alıştırmaları alınmıyor: dersin kelime kümesi ünitenin kelimeleriyle
// örtüşmüyor, ünite kelimeleri zaten tekrar kartına dönüşüyor.

const KANJI = /[一-鿿々]/g

let ALISTIRMA: Map<string, Exercise[]> | null = null

export function ekAlistirma(unitId: string): Exercise[] {
  if (!ALISTIRMA) {
    ALISTIRMA = new Map()
    const kullanilan = new Set<string>()
    for (const u of UNITS) {
      const gorulen = gorulenKanji(u.id)
      const liste: Exercise[] = []
      for (const lid of u.lessonIds ?? []) {
        const l = LESSONS_BY_ID.get(lid)
        if (!l) continue
        for (const sec of l.sections) {
          if (sec.kind !== 'exercises' || sec.title.startsWith('Kelime')) continue
          for (const e of sec.exercises) {
            if (kullanilan.has(e.id)) continue
            if (!(JSON.stringify(e).match(KANJI) ?? []).every((k) => gorulen.has(k))) continue
            kullanilan.add(e.id)
            liste.push(e)
          }
        }
      }
      ALISTIRMA.set(u.id, liste)
    }
  }
  return ALISTIRMA.get(unitId) ?? []
}

/** Ünitenin karşılık geldiği Genki I ders numaraları (kitabı olan için) */
export function genkiDersleri(u: Unit): number[] {
  return [...new Set((u.lessonIds ?? []).map((id) => LESSONS_BY_ID.get(id)?.genki).filter((n): n is number => n !== undefined))].sort(
    (a, b) => a - b,
  )
}
