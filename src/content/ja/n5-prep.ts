/**
 * JLPT N5 sınav hazırlığı — sınavın kendi yapısı ve tarihe bağlı faz planı.
 *
 * NEDEN AYRI DOSYA:
 * Sayfada gösterilen sayıların çoğu "resmî gerçek" (puanlama barajları, bölüm
 * süreleri). Bunlar bileşenin içine gömülürse zamanla uydurma sayılarla
 * karışıyor. Burada durunca kaynağı belli ve tek yerden düzeltiliyor.
 *
 * FAZ MANTIĞI:
 * Sınav tarihi olan biri için "ne kadarını bitirdin" yetmez; asıl soru
 * "bugün ne yapmalıyım". Cevap kalan güne göre değişir ve en kritik kırılma
 * şudur: son üç haftada YENİ KONU ÖĞRENİLMEZ. O dönemde öğrenilen şey sınav
 * gününe kadar oturmuyor, üstelik tekrarı da aksatıyor. Bu yüzden fazlar
 * takvimden değil, kalan günden türetiliyor — bir gün aksatınca plan bozulsun
 * istemiyoruz.
 */

/** Sınavın uygulanış biçimi — oturumda karşına çıkacak sıra. */
export interface ExamSection {
  title: string
  ja: string
  minutes: number
  what: string
}

export const N5_SECTIONS: ExamSection[] = [
  {
    title: 'Yazı ve kelime bilgisi',
    ja: '言語知識（文字・語彙）',
    minutes: 20,
    what: 'Kanji okuma, kanaya çevirme, boşluğa doğru kelimeyi seçme, yakın anlamlıyı bulma.',
  },
  {
    title: 'Dilbilgisi ve okuma',
    ja: '言語知識（文法）・読解',
    minutes: 40,
    what: 'Cümleye doğru eki/yapıyı seçme, kelimeleri sıraya dizme, kısa metin ve duyuru anlama.',
  },
  {
    title: 'Dinleme',
    ja: '聴解',
    minutes: 30,
    what: 'Kısa diyaloglar, görevi anlama, doğru görseli seçme, hızlı tepki soruları.',
  },
]

/**
 * Puanlama — sınavın en çok yanlış bilinen kısmı.
 *
 * Oturum ÜÇ bölüm hâlinde uygulanır ama İKİ puan bloğu olarak değerlendirilir:
 * yazı-kelime ve dilbilgisi-okuma tek blokta toplanır. Her bloğun kendi
 * asgarisi vardır ve biri tutmazsa toplam puan ne olursa olsun kalırsın.
 */
export interface ScoreBlock {
  title: string
  ja: string
  max: number
  min: number
}

export const N5_SCORING: ScoreBlock[] = [
  { title: 'Yazı, kelime, dilbilgisi ve okuma', ja: '言語知識・読解', max: 120, min: 38 },
  { title: 'Dinleme', ja: '聴解', max: 60, min: 19 },
]

export const N5_TOTAL_MAX = 180
export const N5_TOTAL_PASS = 80

/** N5'in beklediği malzeme büyüklüğü — resmî bir liste yok, yaygın kabul. */
export const N5_SCOPE = {
  kanji: 100,
  vocab: 800,
  grammar: 50,
}

// ————————————————————————— Faz planı —————————————————————————

export type PhaseId = 'ogrenme' | 'pekistirme' | 'son-duzluk' | 'gecti'

export interface Phase {
  id: PhaseId
  title: string
  /** Bu fazın kaç gün kala başladığı — geri sayım eşiği */
  fromDay: number
  focus: string
  todo: string[]
  avoid?: string
}

/**
 * Fazlar geri sayıma göre. Eşikler keyfi değil:
 *   21 gün — aralıklı tekrarın bir kartı "oturmuş" saymasına yetecek en kısa
 *            süre. Bu noktadan sonra öğrenilen yeni konu sınavda güvenilmez.
 *    7 gün — son hafta. Yeni bilgi değil, uyku ve sınav pratiği dönemi.
 */
export const N5_PHASES: Phase[] = [
  {
    id: 'ogrenme',
    title: 'Öğrenme',
    fromDay: 22,
    focus: 'Müfredatı bitirmek. Yeni ders, yeni kanji, yeni kelime.',
    todo: [
      'Haftalık ders hedefini tuttur — geri kalırsan sonu telafi edilmiyor',
      'Her gün bekleyen tekrarları sıfırla',
      'Kanjiyi tek başına değil, kelimenin içinde öğren',
      'Ayda bir deneme sınavı çöz — nerede olduğunu görmek için',
    ],
  },
  {
    id: 'pekistirme',
    title: 'Pekiştirme',
    fromDay: 8,
    focus: 'Yeni konu YOK. Bildiklerini sağlamlaştırmak ve zayıf noktayı kapatmak.',
    todo: [
      'Deneme sınavlarını süreyle çöz — N5 için 90 dakika',
      'Yanlışlarını konu konu ayır, en çok hata yaptığın alana dön',
      'Zorlandıkların listesini boşalt',
      'Dinlemeyi her gün çalış — en çok ihmal edilen ve baraj olan bölüm',
    ],
    avoid: 'Yeni dilbilgisi konusuna başlama. Bu noktada öğrenilen şey sınav gününe kadar oturmuyor ve tekrarı da aksatıyor.',
  },
  {
    id: 'son-duzluk',
    title: 'Son düzlük',
    fromDay: 1,
    focus: 'Bilgi toplamak değil, formu korumak.',
    todo: [
      'Günde bir deneme ya da yarım deneme, süreyle',
      'Sadece tekrar — yeni hiçbir şey',
      'Sınav yerini ve saatini önceden gör',
      'Son iki gün hafiflet; uykusuz sınava girmek çalışmaktan daha çok puan kaybettirir',
    ],
    avoid: 'Yeni kelime listesi ezberlemek. Bu aşamada kazandırdığı puan, yorgunluğun kaybettirdiğinden az.',
  },
]

/** Kalan güne düşen faz. Tarih yoksa null. */
export function phaseFor(daysLeft: number | null): Phase | null {
  if (daysLeft === null) return null
  if (daysLeft < 0) return null
  // Listeden eşiği geçilen İLK faz; fromDay büyükten küçüğe sıralı.
  return N5_PHASES.find((p) => daysLeft >= p.fromDay) ?? N5_PHASES[N5_PHASES.length - 1]
}

/**
 * Bu fazda kaç gün kaldı — "öğrenme dönemin 46 gün sonra bitiyor" demek için.
 * Son fazda sınav gününe kalan süredir.
 */
export function daysLeftInPhase(daysLeft: number, phase: Phase): number {
  // Faz, geri sayım fromDay'in ALTINA düştüğü anda biter. Yani son günü
  // fromDay'dir ve bir sonraki faz fromDay-1'de başlar.
  //
  // Önce bir sonraki fazın fromDay'i eşik sanılıyordu; "Öğrenme" için bu
  // 1 (son düzlüğün fromDay'i) çıkıyor ve 90 gün kala "bu dönem 82 gün
  // sürüyor" gibi 13 gün fazla bir sayı yazılıyordu. Doğrusu 69.
  return Math.max(0, daysLeft - (phase.fromDay - 1))
}
