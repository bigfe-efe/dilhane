import { u1 } from './u1'
import { u2 } from './u2'
import { u3 } from './u3'
import { u4 } from './u4'
import { u5 } from './u5'
import { u6 } from './u6'
import { u7 } from './u7'
import { u8 } from './u8'
import { u9 } from './u9'
import { u10 } from './u10'
import { u11 } from './u11'
import { u12 } from './u12'
import { u13 } from './u13'
import { u14 } from './u14'
import type { Unit } from './types'
import { N5_SORULARI } from './n5-sorulari'

/**
 * Ünite sırası KONUYA göre, ders kitabı sırasına göre değil.
 *
 * Dizilim standart başlangıç müfredatlarıyla (Minna no Nihongo I, Genki I)
 * ve N5'in kapsadığı günlük durumlarla örtüşüyor: tanışma → eşyalar →
 * saat ve program → alışveriş → yer bildirme → gidiş geliş → betimleme →
 * geçmiş → te formu → istek ve öneri → (N5'in ikinci yarısı) sade biçim →
 * karşılaştırma ve tahmin → zaman sırası → zorunluluk, deneyim ve plan.
 *
 * 11–14 N5 kapsamı ölçülerek eklendi: 1–10 N5 dilbilgisinin yarısını ve
 * N5 kanjilerinin 70/106'sını kapsıyordu. Kalan dilbilgisi ve kanjiler
 * (aile, hava ve yön, vücut) bu dört ünitenin konusunu belirledi.
 *
 * Sıra rastgele değil: her ünite bir öncekinin yapısını kullanıyor.
 * 3. ünitedeki ます biçimi olmadan 6. ünitedeki hareket fiilleri, 7.
 * ünitedeki sıfatlar olmadan 8. ünitedeki geçmiş çekimi anlatılamaz.
 */
export const UNITS: Unit[] = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u12, u13, u14].map((u) => ({
  ...u,
  n5: N5_SORULARI[u.id]?.okuma ?? [],
  choukai: N5_SORULARI[u.id]?.dinleme ?? [],
}))

export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]))

// ————————————————————— Ünitelerin N5 kanjileri —————————————————————
//
// Her N5 kanjisi TEK bir üniteye ait. Dağıtım elle yapıldı, iki ölçüte göre:
//   • Konu: saatlerin düzensiz okunan 四・七・九'u saat ünitesinde, sayılar
//     alışverişte, aile kanjileri aile ünitesinde, yönler hava durumunda.
//   • Yük: ilk geçtiği üniteye bağlamak 3. üniteye 26 kanji, 10. üniteye hiç
//     kanji düşürüyordu. Elle dağıtımda her ünite 4–11 kanji taşıyor.
// Her kanji kendi ünitesinin kelime, metin ya da dilbilgisi örneklerinde
// GEÇİYOR — bağlamsız kanji öğretilmiyor. (scripts/check-unit-kanji.ts
// bunu ve 106'nın tamamının tam bir kez dağıtıldığını denetliyor.)
// Ünite testi geçilince o ünitenin kanjileri tekrar listesine girer.

export const UNITE_KANJI: Record<string, string> = {
  u1: '私名前人学生先日本語',
  u2: '何新聞中',
  u3: '時分半午今毎四七九月金',
  u4: '一二三五六八十百千万円',
  u5: '上下駅校後',
  u6: '行来帰電車週東国会',
  u7: '大小高安古白長',
  u8: '年見休食友',
  u9: '書読立買',
  u10: '手飲土曜',
  u11: '父母兄姉弟妹男女子話',
  u12: '天気雨空山川多少北南西',
  u13: '出入間外右左火水木',
  u14: '口目耳足力早',
}

const KANJININ_UNITESI = new Map<string, string>()
for (const [uid, ks] of Object.entries(UNITE_KANJI)) for (const k of ks) KANJININ_UNITESI.set(k, uid)

/** Bir N5 kanjisinin ait olduğu ünite (kanji kartlarında gösteriliyor) */
export function kanjiUnit(char: string): string | undefined {
  return KANJININ_UNITESI.get(char)
}

/** Ünitenin N5 kanjileri */
export function unitKanji(unitId: string): string[] {
  return [...(UNITE_KANJI[unitId] ?? '')]
}

// ————————————————————— N5 dilbilgisi haritası —————————————————————
//
// N5'in beklediği dilbilgisi yapıları ve her birinin öğretildiği ünite.
// Resmî bir liste yok; bu, yaygın N5 listelerinin (JLPT kaynakları, Genki I,
// Minna no Nihongo I) ortak kümesi. Ünite 11–14 bu liste çıkarılıp 1–10'un
// kapsamadığı yapılar için eklendi.

export const N5_HARITA: { yapi: string; tr: string; unite: string }[] = [
  { yapi: 'AはBです · じゃないです', tr: 'A, B’dir / değildir', unite: 'u1' },
  { yapi: 'か · の · も', tr: 'soru, tamlama, “de”', unite: 'u1' },
  { yapi: 'これ・それ・あれ · この・その・あの', tr: 'bu, şu, o', unite: 'u2' },
  { yapi: 'だれの · そうです/ちがいます', tr: 'kimin, onaylama', unite: 'u2' },
  { yapi: 'ます · ません · ました', tr: 'kibar fiil çekimi', unite: 'u3' },
  { yapi: 'に (zaman) · を · 〜から〜まで', tr: 'zaman, nesne, aralık', unite: 'u3' },
  { yapi: 'いくら · 〜をください · sayaçlar', tr: 'fiyat, isteme, sayma', unite: 'u4' },
  { yapi: 'あります / います', tr: 'var (cansız / canlı)', unite: 'u5' },
  { yapi: 'に ile で · konum kelimeleri', tr: 'yer bildirme', unite: 'u5' },
  { yapi: 'へ/に (yön) · で (araç) · と', tr: 'gidiş, araç, “ile”', unite: 'u6' },
  { yapi: 'い-sıfat · な-sıfat', tr: 'sıfatlar ve olumsuzları', unite: 'u7' },
  { yapi: '好き・きらい + が · とても / あまり〜ない', tr: 'beğeni, derece', unite: 'u7' },
  { yapi: 'かったです · でした · ませんでした', tr: 'geçmiş zaman', unite: 'u8' },
  { yapi: 'が (ama) · どうでしたか', tr: 'bağlama, “nasıldı”', unite: 'u8' },
  { yapi: 'て formu · てください', tr: 'rica', unite: 'u9' },
  { yapi: 'てもいいです · てはいけません · ています', tr: 'izin, yasak, süreklilik', unite: 'u9' },
  { yapi: 'たい · ませんか · ましょう', tr: 'istek, teklif', unite: 'u10' },
  { yapi: 'から (sebep) · 上手/下手', tr: 'sebep, beceri', unite: 'u10' },
  { yapi: 'sade biçim (る · ない · た · だ)', tr: 'arkadaş dili', unite: 'u11' },
  { yapi: 'と思います · 〜のが好きです', tr: 'fikir, fiili sevmek', unite: 'u11' },
  { yapi: 'より · のほうが · 一番', tr: 'karşılaştırma', unite: 'u12' },
  { yapi: 'くなる / になる · でしょう', tr: 'değişim, tahmin', unite: 'u12' },
  { yapi: '前に · 後で · てから', tr: 'önce, sonra', unite: 'u13' },
  { yapi: 'ながら · たり〜たり · もう/まだ · 〜に行く', tr: 'eşzamanlılık, örnekleme, amaç', unite: 'u13' },
  { yapi: 'ほしい · ないでください', tr: 'istek, kibar yasak', unite: 'u14' },
  { yapi: 'なければなりません · たことがある · つもり', tr: 'zorunluluk, deneyim, plan', unite: 'u14' },
]

export type { Unit } from './types'
export type { UnitGrammar, UnitHomework, UnitLine, UnitRule, UnitText, UnitVocab } from './types'
