import { toHiragana, toKana, toRomaji } from 'wanakana'
import { normalize } from './stt'
import { romajiOf } from './ja-phonetic'

/**
 * Serbest metin cevaplarının denetimi — alıştırmaların ve kanji testinin
 * ortak mantığı.
 *
 * Buradaki kod önce yalnızca Exercise.tsx içindeydi. Kanji testi de aynı
 * kabulü istiyor (kana ya da romaji yazılabilsin) ve iki ayrı kopya zamanla
 * ayrı düşerdi: birinde düzeltilen kabul ötekinde eksik kalırdı.
 */

export const LATIN_ONLY = /^[a-zA-ZıİşŞğĞçÇöÖüÜ\s'’-]+$/
export const HAS_KANA = /[ぁ-ゟァ-ヿ]/

/** Katakana→hiragana, noktalama ve boşluk atılır, büyük/küçük harf eşitlenir */
export function loose(s: string): string {
  return normalize(s, 'ja')
}

/** Öğrencinin yazdığını kanaya çevirir; çeviremezse null */
export function asKana(input: string): string | null {
  const ham = input.trim()
  if (!ham) return null
  if (HAS_KANA.test(ham)) return ham
  if (!LATIN_ONLY.test(ham)) return null
  return toKana(ham.toLowerCase(), { IMEMode: false }).replace(/[\s　]/g, '')
}

/**
 * Cevap doğru mu?
 *
 * ROMAJİ DE KABUL EDİLİR: Japonca klavyesi olmayan biri すみません yazamaz.
 * İki yönlü denenir — girdi kanaya çevrilerek, cevap romajiye çevrilerek
 * (ekler düzeltilerek: わたしは "watashi wa" okunur).
 */
export function acceptsJa(input: string, answers: string[]): boolean {
  const a = loose(input)
  if (!a) return false
  if (answers.some((x) => loose(x) === a)) return true

  const ham = input.trim()
  if (!ham || !LATIN_ONLY.test(ham)) return false

  const kanaGirdi = loose(toKana(ham.toLowerCase(), { IMEMode: false }))
  if (
    answers.some((x) => {
      if (!HAS_KANA.test(x)) return false
      if (loose(x) === kanaGirdi) return true
      return loose(romajiOf(x).text) === a
    })
  )
    return true
  // Son olarak ses eşdeğerliği: uzun ünlü yazımları (koohii / ko-hi-),
  // kelime kelime romaji ("hon o"), ekler (wa / ha)
  return cevapDogruMu(input, answers)
}

// ————————————————————— Ses eşdeğerliği (kana ↔ romaji) —————————————————————

const UNLU: Record<string, string> = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' }
/** Kananın ünlüsü: こ → o, きょ'nun ょ'su → o */
const unlu = (kana: string): string => toRomaji(kana).slice(-1)

/**
 * Yazılan cevabı karşılaştırılabilir hâle getirir: romaji → hiragana,
 * katakana → hiragana, boşluk ve noktalama atılır; uzun ünlüler ve iki
 * yolla yazılabilen ekler tek biçime indirilir. Aynı işlem beklenen cevaba
 * da uygulanıyor, yani bu bir "eşdeğerlik" tanımı.
 *
 * ÖLÇÜT: ekranda doğru cevap diye gösterilen romajiyi yazan öğrenci doğru
 * sayılmalı. scripts/check-pekistirme.ts bunu bütün yazmalı sorularda dener.
 */
function sesBicimi(s: string): string {
  const t = s
    // ō, ū gibi uzatma çizgili harfler: çift ünlü (kōhī → koohii)
    .normalize('NFD')
    .replace(/([aiueo])\u0304/gi, '$1$1')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[。、.,!?！？「」~〜]/g, '')
    // Romaji KELİME KELİME çevrilir: boşluklar önce atılsaydı "hon o" →
    // "hono" → ほの olurdu (ん + お yerine の). Kesme işareti (sen'en) ve
    // tire (ko-hi-) çeviriciye bırakılır: ん'yi ve ー'yi onlar belirler.
    .split(/\s+/)
    .map((p) => (/[a-z]/.test(p) ? toHiragana(p) : p))
    .join('')
    .replace(/'/g, '')
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

  // Uzun ünlüler tek biçime indirilir; yoksa コーヒー için "koohii" (こおひい)
  // ya da がっこう için "gakkoo" yanlış sayılırdı:
  //   ー → önceki ünlü · o + う → o + お · e + い → e + え
  let sonuc = ''
  for (const c of t) {
    const onceki = sonuc.slice(-1)
    const v = onceki ? unlu(onceki) : ''
    if (c === 'ー' && UNLU[v]) sonuc += UNLU[v]
    else if (c === 'う' && v === 'o') sonuc += 'お'
    else if (c === 'い' && v === 'e') sonuc += 'え'
    else sonuc += c
  }
  // Ekler iki yolla da yazılabilsin (は/わ, へ/え, を/お); ぢ/じ ve づ/ず aynı ses
  return sonuc.replace(/は/g, 'わ').replace(/へ/g, 'え').replace(/を/g, 'お').replace(/ぢ/g, 'じ').replace(/づ/g, 'ず')
}

export function cevapDogruMu(girdi: string, dogrular: string[]): boolean {
  const g = sesBicimi(girdi)
  return !!g && dogrular.some((d) => sesBicimi(d) === g)
}

// ————————————————————— Türkçe cevap (Japoncadan çeviri) —————————————————————
//
// Türkçeye çeviride cevap öğrencinin ANA DİLİNDE; aynı anlam onlarca biçimde
// yazılabilir. Önceden yazılmış birkaç kalıpla birebir karşılaştırmak
// "hepsi 800 yen" yazana "hepsi sekiz yüz yen" olmalıydı diyordu. Burada
// karşılaştırma anlamı değiştirmeyen farkları yok sayar:
//   • sayı rakamla ya da yazıyla (800 = sekiz yüz = sekizyüz)
//   • Türkçe karakterli ya da karaktersiz (yuz = yüz)
//   • kelime sırası
//   • -dir eki, baştaki "ben", "lütfen", belirsiz "bir"
// Olumsuzluk ve zaman gibi anlamı değiştiren farklar KORUNUR; bu yüzden harf
// benzerliğine bakılmıyor ("gidiyorum" ile "gitmiyorum" iki harf uzakta).
// Yine de eşleşmeyen doğru çeviriler olacaktır: arayüz öğrenciye "anlam
// aynıydı, doğru say" seçeneği veriyor.

const TR_KATLA: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }

const SAYI_BIRIM: Record<string, number> = {
  sifir: 0, bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9,
  on: 10, yirmi: 20, otuz: 30, kirk: 40, elli: 50, altmis: 60, yetmis: 70, seksen: 80, doksan: 90,
}
const SAYI_CARPAN: Record<string, number> = { yuz: 100, bin: 1000 }
const SAYI_KELIMELERI = [...Object.keys(SAYI_BIRIM), ...Object.keys(SAYI_CARPAN)].sort((a, b) => b.length - a.length)

/** "sekizyuz" gibi bitişik yazılmış sayıyı parçalar; sayı değilse null */
function sayiParcala(tok: string): string[] | null {
  const parcalar: string[] = []
  let kalan = tok
  while (kalan) {
    const k = SAYI_KELIMELERI.find((w) => kalan.startsWith(w))
    if (!k) return null
    parcalar.push(k)
    kalan = kalan.slice(k.length)
  }
  return parcalar.length > 1 ? parcalar : null
}

const sayiMi = (t: string) => /^\d+$/.test(t) || t in SAYI_BIRIM || t in SAYI_CARPAN

/** Art arda gelen sayı kelimelerini tek rakama çevirir: sekiz yuz → 800 */
function sayilariBirlestir(tokens: string[]): string[] {
  const out: string[] = []
  let i = 0
  while (i < tokens.length) {
    if (!sayiMi(tokens[i])) {
      out.push(tokens[i++])
      continue
    }
    let toplam = 0
    let simdiki = 0
    while (i < tokens.length && sayiMi(tokens[i])) {
      const t = tokens[i++]
      if (/^\d+$/.test(t)) simdiki += Number(t)
      else if (t in SAYI_BIRIM) simdiki += SAYI_BIRIM[t]
      else if (t === 'yuz') simdiki = (simdiki || 1) * 100
      else {
        toplam += (simdiki || 1) * SAYI_CARPAN[t]
        simdiki = 0
      }
    }
    out.push(String(toplam + simdiki))
  }
  return out
}

/** Anlamı değiştirmeyen eş anlamlılar */
const TR_ES: Record<string, string> = { toplam: 'hepsi', tamami: 'hepsi', toplamda: 'hepsi' }
/** Atlanabilen kelimeler: özne "ben", "lütfen", belirsiz "bir" (rakama dönmüş hâliyle "1") */
const TR_ATLA = new Set(['ben', 'lutfen', '1'])

function trBicimi(s: string): string {
  const duz = s
    .toLocaleLowerCase('tr')
    .replace(/[’'`]/g, '') // tanaka'nın → tanakanın
    .replace(/(\d)[.,](?=\d{3}(\D|$))/g, '$1') // 1.500 → 1500
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/[çğıöşüâîû]/g, (c) => TR_KATLA[c])
  const tokens = sayilariBirlestir(duz.split(/\s+/).filter(Boolean).flatMap((t) => sayiParcala(t) ?? [t]))
    .map((t) => TR_ES[t] ?? t)
    // -dir eki: öğrencidir = öğrenci (kısa kelimelerde kökü bozmasın)
    .map((t) => (t.length > 5 ? t.replace(/(dir|dur|tir|tur)$/, '') : t))
    .filter((t) => !TR_ATLA.has(t))
  return tokens.sort().join(' ')
}

/** Türkçe çeviri kabul edilen cevaplardan biriyle aynı anlamda mı (biçim farkları yok sayılır) */
export function acceptsTr(input: string, answers: string[]): boolean {
  const a = trBicimi(input)
  return !!a && answers.some((x) => trBicimi(x) === a)
}
