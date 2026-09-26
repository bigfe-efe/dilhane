import { KANJI_BY_CHAR } from '@/content/ja/kanji-n5'
import type { KanjiChar } from '@/types'

/**
 * Bir kelimeyi kanjilerine ayırır ve her kanjinin o kelimede hangi okunuşla
 * okunduğunu bulur:  先生 / せんせい → 先 = せん, 生 = せい
 *
 * NEDEN: öğrenci kanjiyi kelimenin içinde öğreniyor (先生 = öğretmen) ama
 * tek tek kanjiyi tanımıyor. N5'in kanji okuma soruları ise tam bunu ölçer:
 * aynı 生, 学生'de "sei", 生まれる'da "u". Kelimeyi parçalarına ayırıp her
 * parçanın anlamını ve okunuşunu göstermek, bildiği kelimeden bilmediği
 * kanjiye köprü kuruyor.
 *
 * YÖNTEM: kanjinin bilinen on/kun okunuşları, kelimenin kana okunuşuna
 * baştan sona eşlenir (geri izlemeli). Japoncanın iki ses değişimi de
 * tanınır: sesli ilk hece (rendaku: 学 がく → 大学 だいがく değil ama 日
 * ひ → 日曜日 び) ve küçük っ (学 がく → 学校 がっこう).
 * Eşleşme bulunamazsa kelime ÖZEL okunuşludur (今日 きょう, 一人 ひとり):
 * kanjilerin okunuşundan kurulmaz, bütün olarak ezberlenir.
 */

export interface KanjiParcasi {
  /** Kelimedeki karakter (kanji ya da okurigana) */
  ch: string
  kanji?: KanjiChar
  /** Bu kelimedeki okunuşu (hiragana) */
  okunus?: string
  tur?: 'on' | 'kun'
}

export interface KelimeAyrimi {
  parcalar: KanjiParcasi[]
  /** Okunuş kanjilerden kurulamıyor (今日, 一人 gibi) */
  ozel: boolean
}

const hiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

const SESLI: Record<string, string[]> = {
  か: ['が'], き: ['ぎ'], く: ['ぐ'], け: ['げ'], こ: ['ご'],
  さ: ['ざ'], し: ['じ'], す: ['ず'], せ: ['ぜ'], そ: ['ぞ'],
  た: ['だ'], ち: ['ぢ', 'じ'], つ: ['づ', 'ず'], て: ['で'], と: ['ど'],
  は: ['ば', 'ぱ'], ひ: ['び', 'ぴ'], ふ: ['ぶ', 'ぷ'], へ: ['べ', 'ぺ'], ほ: ['ぼ', 'ぽ'],
}

/**
 * Veride olmayan ama N5 kelimelerinde sık geçen okunuşlar. Bunlar olmadan
 * 日本 (に+ほん), 来ます (き), 十分 (じゅっ) "özel okunuş" sanılıyordu —
 * oysa kanjiden kurulan, yalnızca kısalmış ya da çekimli okunuşlar.
 */
const EK_OKUNUSLAR: Record<string, { okunus: string; tur: 'on' | 'kun' }[]> = {
  日: [{ okunus: 'に', tur: 'on' }],
  来: [{ okunus: 'き', tur: 'kun' }, { okunus: 'こ', tur: 'kun' }],
  十: [{ okunus: 'じゅっ', tur: 'on' }, { okunus: 'じっ', tur: 'on' }],
  何: [{ okunus: 'なに', tur: 'kun' }, { okunus: 'なん', tur: 'kun' }],
}

const onbellek = new Map<string, { okunus: string; tur: 'on' | 'kun' }[]>()

/** Kanjinin kelime içinde alabileceği okunuşlar, uzundan kısaya */
function adaylar(k: KanjiChar): { okunus: string; tur: 'on' | 'kun' }[] {
  const hazir = onbellek.get(k.char)
  if (hazir) return hazir
  const liste: { okunus: string; tur: 'on' | 'kun' }[] = []
  const ekle = (okunus: string, tur: 'on' | 'kun') => {
    if (!okunus) return
    const varyant = [okunus, ...(SESLI[okunus[0]] ?? []).map((v) => v + okunus.slice(1))]
    // Küçük っ: がく → がっ (学校), いち → いっ (一分), はち → はっ
    if (/[つくちき]$/.test(okunus)) varyant.push(okunus.slice(0, -1) + 'っ')
    for (const v of varyant) if (!liste.some((x) => x.okunus === v)) liste.push({ okunus: v, tur })
  }
  for (const o of k.on) ekle(hiragana(o), 'on')
  // Kun: "い-きる" → kanjinin kendi payı "い" (gerisi okurigana); "-び" → "び"
  for (const kun of k.kun) ekle(kun.replace(/^-/, '').split('-')[0].replace(/\./g, ''), 'kun')
  for (const e of EK_OKUNUSLAR[k.char] ?? []) if (!liste.some((x) => x.okunus === e.okunus)) liste.push(e)
  liste.sort((a, b) => b.okunus.length - a.okunus.length)
  onbellek.set(k.char, liste)
  return liste
}

const KANJI = /[㐀-鿿々]/

export function kelimeAyir(ja: string, kana: string): KelimeAyrimi {
  const karakterler = [...ja]
  // "なに / なん" gibi iki okunuşlu kayıtlarda ilki
  const okunus = hiragana(kana.split(/\s*\/\s*/)[0])

  const ara = (i: number, j: number): KanjiParcasi[] | null => {
    if (i === karakterler.length) return j === okunus.length ? [] : null
    const ch = karakterler[i]
    if (!KANJI.test(ch)) {
      // Okurigana ve kana: birebir eşleşmeli
      if (hiragana(ch) !== okunus[j]) return null
      const devam = ara(i + 1, j + 1)
      return devam ? [{ ch }, ...devam] : null
    }
    const k = KANJI_BY_CHAR.get(ch === '々' ? karakterler[i - 1] : ch)
    if (k) {
      for (const a of adaylar(k)) {
        if (!okunus.startsWith(a.okunus, j)) continue
        const devam = ara(i + 1, j + a.okunus.length)
        if (devam) return [{ ch, kanji: k, okunus: a.okunus, tur: a.tur }, ...devam]
      }
      return null
    }
    // N5 dışı kanji (勉, 強…): okunuşunu bilmiyoruz; 1–3 hece dene
    for (let n = 1; n <= 3 && j + n <= okunus.length; n++) {
      const devam = ara(i + 1, j + n)
      if (devam) return [{ ch, okunus: okunus.slice(j, j + n) }, ...devam]
    }
    return null
  }

  const sonuc = ara(0, 0)
  if (sonuc) return { parcalar: sonuc, ozel: false }
  return {
    parcalar: karakterler.map((ch) => ({ ch, kanji: KANJI.test(ch) ? KANJI_BY_CHAR.get(ch) : undefined })),
    ozel: true,
  }
}
