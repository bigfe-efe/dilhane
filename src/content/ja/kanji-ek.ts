import type { KanjiChar } from '@/types'
import { KANJI_BY_CHAR } from './kanji-n5'

// Ünite kelimelerinde geçen N5 DIŞI kanjiler (朝, 起, 働…).
//
// NEDEN: kelime kartları kelimeyi kanjilerine ayırıp her kanjinin kendi
// anlamını ve okunuşlarını gösteriyor. N5 kanji verisi yalnızca 106 kanjiyi
// kapsıyordu; 毎朝'nın 朝'u, 働きます'ın 働'ı boş kalıyordu. Bu tablo o
// boşluğu dolduruyor. Kanjiler sınavda KANJİ olarak sorulmaz (N5 dışı) ama
// kelimeler N5 kelimesi; kanjinin anlamı kelimeyi hatırlamaya yardım eder.
//
// Biçim: [karakter, çizgi, TR anlamlar, on'yomi, kun'yomi] — n5 dosyasındaki
// gibi "|" ile ayrılır, kun'da tireden sonrası okurigana.
// `jlpt` alanı tipin gereği 'N4' — seviye arayüzde gösterilmiyor, yalnızca
// "N5 dışı" deniyor (bazıları N3 listelerinde).

type Row = [string, number, string, string, string]

const ROWS: Row[] = [
  ['朝', 12, 'sabah', 'チョウ', 'あさ'],
  ['起', 10, 'kalkmak|uyanmak', 'キ', 'お-きる|お-こす'],
  ['寝', 13, 'uyumak|yatmak', 'シン', 'ね-る'],
  ['働', 13, 'çalışmak', 'ドウ', 'はたら-く'],
  ['昨', 9, 'önceki|geçen', 'サク', ''],
  ['明', 8, 'aydınlık|açık', 'メイ|ミョウ', 'あか-るい|あ-ける'],
  ['店', 8, 'dükkân', 'テン', 'みせ'],
  ['切', 4, 'kesmek', 'セツ|サイ', 'き-る'],
  ['近', 7, 'yakın', 'キン', 'ちか-い'],
  ['家', 10, 'ev|aile', 'カ|ケ', 'いえ|や'],
  ['教', 11, 'öğretmek', 'キョウ', 'おし-える'],
  ['室', 9, 'oda', 'シツ', 'むろ'],
  ['銀', 14, 'gümüş', 'ギン', ''],
  ['病', 10, 'hastalık', 'ビョウ', 'やまい'],
  ['院', 10, 'kurum|bina', 'イン', ''],
  ['自', 6, 'kendi', 'ジ|シ', 'みずか-ら'],
  ['転', 11, 'dönmek|yuvarlanmak', 'テン', 'ころ-ぶ'],
  ['歩', 8, 'yürümek', 'ホ|ブ', 'ある-く'],
  ['社', 7, 'şirket|tapınak', 'シャ|ジャ', 'やしろ'],
  ['忙', 6, 'meşgul', 'ボウ', 'いそが-しい'],
  ['好', 6, 'sevmek', 'コウ', 'す-き|この-む'],
  ['町', 7, 'kasaba', 'チョウ', 'まち'],
  ['去', 5, 'gitmek|geçmiş', 'キョ|コ', 'さ-る'],
  ['映', 9, 'yansımak|göstermek', 'エイ', 'うつ-る'],
  ['画', 8, 'resim|görüntü', 'ガ|カク', ''],
  ['旅', 10, 'yolculuk', 'リョ', 'たび'],
  ['試', 13, 'denemek', 'シ', 'ため-す'],
  ['験', 18, 'sınamak', 'ケン', ''],
  ['楽', 13, 'eğlence|müzik', 'ガク|ラク', 'たの-しい'],
  ['寒', 12, 'soğuk', 'カン', 'さむ-い'],
  ['暑', 12, 'sıcak (hava)', 'ショ', 'あつ-い'],
  ['難', 18, 'zor', 'ナン', 'むずか-しい'],
  ['待', 9, 'beklemek', 'タイ', 'ま-つ'],
  ['座', 10, 'oturmak', 'ザ', 'すわ-る'],
  ['使', 8, 'kullanmak', 'シ', 'つか-う'],
  ['住', 7, 'oturmak (ikamet)', 'ジュウ', 'す-む'],
  ['結', 12, 'bağlamak', 'ケツ', 'むす-ぶ'],
  ['婚', 11, 'evlilik', 'コン', ''],
  ['写', 5, 'kopyalamak|çekmek', 'シャ', 'うつ-す'],
  ['真', 10, 'gerçek', 'シン', 'ま'],
  ['度', 9, 'kez|derece', 'ド', 'たび'],
  ['料', 10, 'ücret|malzeme', 'リョウ', ''],
  ['理', 11, 'mantık|düzen', 'リ', ''],
  ['音', 9, 'ses', 'オン|イン', 'おと|ね'],
  ['物', 8, 'şey|eşya', 'ブツ|モツ', 'もの'],
  ['事', 8, 'iş|olay', 'ジ', 'こと'],
  ['族', 11, 'aile|soy', 'ゾク', ''],
  ['思', 9, 'düşünmek', 'シ', 'おも-う'],
  ['作', 7, 'yapmak', 'サク|サ', 'つく-る'],
  ['晴', 12, 'açık hava', 'セイ', 'は-れる'],
  ['番', 12, 'sıra|numara', 'バン', ''],
  ['昼', 9, 'öğle', 'チュウ', 'ひる'],
  ['飯', 12, 'pişmiş pirinç|yemek', 'ハン', 'めし'],
  ['晩', 12, 'akşam', 'バン', ''],
  ['元', 4, 'köken|kaynak', 'ゲン|ガン', 'もと'],
]

const split = (s: string): string[] => (s ? s.split('|') : [])

export const KANJI_EK: KanjiChar[] = ROWS.map(([char, strokes, tr, on, kun]) => ({
  char,
  strokes,
  jlpt: 'N4' as const,
  meaningsTr: split(tr),
  meaningsEn: [],
  on: split(on),
  kun: split(kun),
  words: [],
}))

const EK_BY_CHAR = new Map(KANJI_EK.map((k) => [k.char, k]))

/** N5 verisinde ya da bu ek tabloda kanjinin kaydı */
export function kanjiBilgi(ch: string): KanjiChar | undefined {
  return KANJI_BY_CHAR.get(ch) ?? EK_BY_CHAR.get(ch)
}

/** Kanji N5 listesinde mi */
export const n5Kanji = (ch: string) => KANJI_BY_CHAR.has(ch)
