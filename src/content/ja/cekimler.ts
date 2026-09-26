/**
 * Cümle sonları — olumlu, olumsuz, geçmiş; kibar ve sade.
 *
 * NEDEN: öğrenci cümlenin genel anlamını çıkarıyor ama sonundaki ekin
 * olumlu mu olumsuz mu, şimdi mi geçmiş mi olduğunu tanıyamıyordu ve
 * İngilizceyle karşılaştırmaya kayıyordu. Oysa en iyi köprü Türkçe: Japonca
 * da eki kelimenin arkasına SIRAYLA ekler.
 *   食べ・ませ・ん・でし・た  ≈  ye・me・di・m
 * Bu dosyada her hücre [kök, ek] olarak tutuluyor; ekranda ek renkleniyor.
 */

export interface Hucre {
  /** Yazılış: [kök, ek] */
  ja: [string, string]
  /** Okunuş: [kök, ek] */
  kana: [string, string]
  tr: string
}

/** Sütun sırası: olumlu · olumsuz · olumlu geçmiş · olumsuz geçmiş */
export const SUTUNLAR = ['Olumlu', 'Olumsuz', 'Geçmiş', 'Olumsuz geçmiş'] as const

export interface CekimSatiri {
  id: string
  tur: string
  kelime: string
  anlam: string
  kibar: [Hucre, Hucre, Hucre, Hucre]
  sade: [Hucre, Hucre, Hucre, Hucre]
  not?: string
  star?: boolean
}

const h = (jaKok: string, jaEk: string, kanaKok: string, kanaEk: string, tr: string): Hucre => ({
  ja: [jaKok, jaEk],
  kana: [kanaKok, kanaEk],
  tr,
})

export const CEKIM_TABLOSU: CekimSatiri[] = [
  {
    id: 'ru',
    tur: 'Fiil (ru-fiil)',
    kelime: '食べる',
    anlam: 'yemek',
    kibar: [
      h('食べ', 'ます', 'たべ', 'ます', 'yerim'),
      h('食べ', 'ません', 'たべ', 'ません', 'yemem'),
      h('食べ', 'ました', 'たべ', 'ました', 'yedim'),
      h('食べ', 'ませんでした', 'たべ', 'ませんでした', 'yemedim'),
    ],
    sade: [
      h('食べ', 'る', 'たべ', 'る', 'yerim'),
      h('食べ', 'ない', 'たべ', 'ない', 'yemem'),
      h('食べ', 'た', 'たべ', 'た', 'yedim'),
      h('食べ', 'なかった', 'たべ', 'なかった', 'yemedim'),
    ],
  },
  {
    id: 'u',
    tur: 'Fiil (u-fiil)',
    kelime: '行く',
    anlam: 'gitmek',
    kibar: [
      h('行き', 'ます', 'いき', 'ます', 'giderim'),
      h('行き', 'ません', 'いき', 'ません', 'gitmem'),
      h('行き', 'ました', 'いき', 'ました', 'gittim'),
      h('行き', 'ませんでした', 'いき', 'ませんでした', 'gitmedim'),
    ],
    sade: [
      h('行', 'く', 'い', 'く', 'giderim'),
      h('行', 'かない', 'い', 'かない', 'gitmem'),
      h('行', 'った', 'い', 'った', 'gittim'),
      h('行', 'かなかった', 'い', 'かなかった', 'gitmedim'),
    ],
    not: 'u-fiilde sade biçimler kökün son hecesini değiştirir: 行く → 行かない (く → か).',
  },
  {
    id: 'suru',
    tur: 'Fiil (düzensiz)',
    kelime: 'する',
    anlam: 'yapmak',
    kibar: [
      h('し', 'ます', 'し', 'ます', 'yaparım'),
      h('し', 'ません', 'し', 'ません', 'yapmam'),
      h('し', 'ました', 'し', 'ました', 'yaptım'),
      h('し', 'ませんでした', 'し', 'ませんでした', 'yapmadım'),
    ],
    sade: [
      h('', 'する', '', 'する', 'yaparım'),
      h('', 'しない', '', 'しない', 'yapmam'),
      h('', 'した', '', 'した', 'yaptım'),
      h('', 'しなかった', '', 'しなかった', 'yapmadım'),
    ],
  },
  {
    id: 'i',
    tur: 'い-sıfat',
    kelime: '高い',
    anlam: 'pahalı',
    kibar: [
      h('高', 'いです', 'たか', 'いです', 'pahalı'),
      h('高', 'くないです', 'たか', 'くないです', 'pahalı değil'),
      h('高', 'かったです', 'たか', 'かったです', 'pahalıydı'),
      h('高', 'くなかったです', 'たか', 'くなかったです', 'pahalı değildi'),
    ],
    sade: [
      h('高', 'い', 'たか', 'い', 'pahalı'),
      h('高', 'くない', 'たか', 'くない', 'pahalı değil'),
      h('高', 'かった', 'たか', 'かった', 'pahalıydı'),
      h('高', 'くなかった', 'たか', 'くなかった', 'pahalı değildi'),
    ],
    not: 'い-sıfatta çekimi です değil sıfatın kendisi yapar: 高いでした ✗ → 高かったです.',
  },
  {
    id: 'ii',
    tur: 'いい (düzensiz)',
    kelime: 'いい',
    anlam: 'iyi',
    star: true,
    kibar: [
      h('', 'いいです', '', 'いいです', 'iyi'),
      h('よ', 'くないです', 'よ', 'くないです', 'iyi değil'),
      h('よ', 'かったです', 'よ', 'かったです', 'iyiydi'),
      h('よ', 'くなかったです', 'よ', 'くなかったです', 'iyi değildi'),
    ],
    sade: [
      h('', 'いい', '', 'いい', 'iyi'),
      h('よ', 'くない', 'よ', 'くない', 'iyi değil'),
      h('よ', 'かった', 'よ', 'かった', 'iyiydi'),
      h('よ', 'くなかった', 'よ', 'くなかった', 'iyi değildi'),
    ],
    not: 'いい çekimde よ- olur: いくない ✗ → よくない. “よかった” (iyi oldu, oh be) günlük dilde çok geçer.',
  },
  {
    id: 'na',
    tur: 'な-sıfat',
    kelime: 'しずか',
    anlam: 'sessiz',
    kibar: [
      h('しずか', 'です', 'しずか', 'です', 'sessiz'),
      h('しずか', 'じゃないです', 'しずか', 'じゃないです', 'sessiz değil'),
      h('しずか', 'でした', 'しずか', 'でした', 'sessizdi'),
      h('しずか', 'じゃなかったです', 'しずか', 'じゃなかったです', 'sessiz değildi'),
    ],
    sade: [
      h('しずか', 'だ', 'しずか', 'だ', 'sessiz'),
      h('しずか', 'じゃない', 'しずか', 'じゃない', 'sessiz değil'),
      h('しずか', 'だった', 'しずか', 'だった', 'sessizdi'),
      h('しずか', 'じゃなかった', 'しずか', 'じゃなかった', 'sessiz değildi'),
    ],
    not: 'な-sıfat ve isim aynı çekilir. Olumsuzda く değil じゃ: しずかくない ✗.',
  },
  {
    id: 'isim',
    tur: 'İsim',
    kelime: '学生',
    anlam: 'öğrenci',
    kibar: [
      h('学生', 'です', 'がくせい', 'です', 'öğrenciyim'),
      h('学生', 'じゃないです', 'がくせい', 'じゃないです', 'öğrenci değilim'),
      h('学生', 'でした', 'がくせい', 'でした', 'öğrenciydim'),
      h('学生', 'じゃなかったです', 'がくせい', 'じゃなかったです', 'öğrenci değildim'),
    ],
    sade: [
      h('学生', 'だ', 'がくせい', 'だ', 'öğrenciyim'),
      h('学生', 'じゃない', 'がくせい', 'じゃない', 'öğrenci değilim'),
      h('学生', 'だった', 'がくせい', 'だった', 'öğrenciydim'),
      h('学生', 'じゃなかった', 'がくせい', 'じゃなかった', 'öğrenci değildim'),
    ],
    not: 'Resmî yazıda じゃない yerine ではありません da görürsün: 学生ではありません = 学生じゃないです.',
  },
]

/** Ekleri görünce anlamı tanımak için kurallar */
export const TANIMA_KURALLARI: { baslik: string; govde: string; star?: boolean }[] = [
  {
    baslik: 'Olumsuzluğun işaretleri: ません · ない',
    govde:
      'Sonunda ません, ない, くない, じゃない (ya da ではない) varsa cümle olumsuzdur. Kısa kural: “ない’yı gördüğün yerde olumsuzluk vardır” — Türkçedeki -me/-ma gibi.',
    star: true,
  },
  {
    baslik: 'Geçmişin işaretleri: た · だった · でした · かった · ました',
    govde:
      'Hepsinde bir “t/d” sesi var: -ta, -da, -deshita, -katta, -mashita. Türkçedeki -dı/-di ile aynı his. Olumsuz geçmiş iki işareti birden taşır: ませんでした, なかった.',
    star: true,
  },
  {
    baslik: 'Kibar mı, sade mi',
    govde:
      'です / ます ile bitiyorsa kibar; bitmiyorsa (食べる, 高い, しずかだ) sade. Anlam aynıdır, yalnızca üslup değişir. Okuma metinleri ve arkadaş konuşmaları çoğunlukla sade.',
  },
  {
    baslik: 'Tuzak: なければなりません = “-meli”',
    govde:
      'Olumsuz görünür ama zorunluluk bildirir: 行かなければなりません = gitmeliyim. İki olumsuz (なければ + なりません) birbirini götürür.',
    star: true,
  },
  {
    baslik: 'Tuzak: ませんか = teklif',
    govde:
      'Olumsuz soru biçimindedir ama davet eder: 行きませんか = “gitmez misin?” yani “gidelim mi?”. Türkçede de “Bir kahve içmez miyiz?” deriz.',
    star: true,
  },
  {
    baslik: 'あまり・ぜんぜん・何も + olumsuz',
    govde:
      'Bu kelimeler olumsuzla birlikte gelir: あまり高くないです (pek pahalı değil), ぜんぜんわかりません (hiç anlamıyorum), 何も食べませんでした (hiçbir şey yemedim).',
  },
]

export interface CumleSonu {
  son: string
  okunus: string
  tr: string
  tur: 'olumlu' | 'olumsuz' | 'geçmiş' | 'rica' | 'istek' | 'teklif' | 'izin' | 'yasak' | 'zorunluluk' | 'diğer'
  ornek: { ja: string; kana: string; latin: string; tr: string }
}

/** N5'te karşılaşılan cümle sonları, Türkçe karşılıklarıyla */
export const CUMLE_SONLARI: CumleSonu[] = [
  { son: '〜ます', okunus: 'masu', tr: '-r, -iyor', tur: 'olumlu', ornek: { ja: '毎日走ります。', kana: 'まいにちはしります。', latin: 'mainichi hashirimasu.', tr: 'Her gün koşarım.' } },
  { son: '〜ません', okunus: 'masen', tr: '-maz, -mıyor', tur: 'olumsuz', ornek: { ja: 'お酒を飲みません。', kana: 'おさけをのみません。', latin: 'osake o nomimasen.', tr: 'İçki içmem.' } },
  { son: '〜ました', okunus: 'mashita', tr: '-dı', tur: 'geçmiş', ornek: { ja: '昨日、見ました。', kana: 'きのう、みました。', latin: 'kinou, mimashita.', tr: 'Dün izledim.' } },
  { son: '〜ませんでした', okunus: 'masen deshita', tr: '-madı', tur: 'olumsuz', ornek: { ja: '宿題をしませんでした。', kana: 'しゅくだいをしませんでした。', latin: 'shukudai o shimasen deshita.', tr: 'Ödevi yapmadım.' } },
  { son: '〜ましょう', okunus: 'mashou', tr: '-alım', tur: 'teklif', ornek: { ja: '行きましょう。', kana: 'いきましょう。', latin: 'ikimashou.', tr: 'Hadi gidelim.' } },
  { son: '〜ませんか', okunus: 'masen ka', tr: '-mez misin? (davet)', tur: 'teklif', ornek: { ja: 'お茶を飲みませんか。', kana: 'おちゃをのみませんか。', latin: 'ocha o nomimasen ka.', tr: 'Çay içmez misin? (içelim mi?)' } },
  { son: '〜たいです', okunus: 'tai desu', tr: '-mek istiyorum', tur: 'istek', ornek: { ja: '日本に行きたいです。', kana: 'にほんにいきたいです。', latin: 'nihon ni ikitai desu.', tr: 'Japonya’ya gitmek istiyorum.' } },
  { son: '〜たくないです', okunus: 'takunai desu', tr: '-mek istemiyorum', tur: 'olumsuz', ornek: { ja: '今日は出かけたくないです。', kana: 'きょうはでかけたくないです。', latin: 'kyou wa dekaketakunai desu.', tr: 'Bugün dışarı çıkmak istemiyorum.' } },
  { son: '〜てください', okunus: 'te kudasai', tr: '-in lütfen', tur: 'rica', ornek: { ja: 'ここに書いてください。', kana: 'ここにかいてください。', latin: 'koko ni kaite kudasai.', tr: 'Buraya yazın lütfen.' } },
  { son: '〜ないでください', okunus: 'naide kudasai', tr: '-meyin lütfen', tur: 'olumsuz', ornek: { ja: '写真をとらないでください。', kana: 'しゃしんをとらないでください。', latin: 'shashin o toranaide kudasai.', tr: 'Lütfen fotoğraf çekmeyin.' } },
  { son: '〜てもいいです', okunus: 'te mo ii desu', tr: '-ebilirsin (izin)', tur: 'izin', ornek: { ja: '座ってもいいですか。', kana: 'すわってもいいですか。', latin: 'suwatte mo ii desu ka.', tr: 'Oturabilir miyim?' } },
  { son: '〜てはいけません', okunus: 'te wa ikemasen', tr: '-mamalısın (yasak)', tur: 'yasak', ornek: { ja: 'ここで食べてはいけません。', kana: 'ここでたべてはいけません。', latin: 'koko de tabete wa ikemasen.', tr: 'Burada yemek yenmez.' } },
  { son: '〜ています', okunus: 'te imasu', tr: '-iyor (süren) · durum', tur: 'olumlu', ornek: { ja: '今、雨がふっています。', kana: 'いま、あめがふっています。', latin: 'ima, ame ga futte imasu.', tr: 'Şu an yağmur yağıyor.' } },
  { son: '〜なければなりません', okunus: 'nakereba narimasen', tr: '-meli (zorunluluk)', tur: 'zorunluluk', ornek: { ja: '明日、早く起きなければなりません。', kana: 'あした、はやくおきなければなりません。', latin: 'ashita, hayaku okinakereba narimasen.', tr: 'Yarın erken kalkmalıyım.' } },
  { son: '〜たことがあります', okunus: 'ta koto ga arimasu', tr: '-mişliğim var', tur: 'geçmiş', ornek: { ja: 'すしを食べたことがあります。', kana: 'すしをたべたことがあります。', latin: 'sushi o tabeta koto ga arimasu.', tr: 'Daha önce suşi yedim.' } },
  { son: '〜つもりです', okunus: 'tsumori desu', tr: '-meyi planlıyorum', tur: 'istek', ornek: { ja: '来年、日本に行くつもりです。', kana: 'らいねん、にほんにいくつもりです。', latin: 'rainen, nihon ni iku tsumori desu.', tr: 'Gelecek yıl Japonya’ya gitmeyi planlıyorum.' } },
  { son: '〜でしょう', okunus: 'deshou', tr: '-dır herhâlde', tur: 'diğer', ornek: { ja: '明日は雨でしょう。', kana: 'あしたはあめでしょう。', latin: 'ashita wa ame deshou.', tr: 'Yarın herhâlde yağmur yağacak.' } },
  { son: '〜と思います', okunus: 'to omoimasu', tr: 'bence, sanırım', tur: 'diğer', ornek: { ja: 'おいしいと思います。', kana: 'おいしいとおもいます。', latin: 'oishii to omoimasu.', tr: 'Bence lezzetli.' } },
  { son: '〜か', okunus: 'ka', tr: 'mi? (soru)', tur: 'diğer', ornek: { ja: '学生ですか。', kana: 'がくせいですか。', latin: 'gakusei desu ka.', tr: 'Öğrenci misin?' } },
  { son: '〜ね', okunus: 'ne', tr: 'değil mi?', tur: 'diğer', ornek: { ja: '寒いですね。', kana: 'さむいですね。', latin: 'samui desu ne.', tr: 'Soğuk, değil mi?' } },
  { son: '〜よ', okunus: 'yo', tr: '…ya, bak!', tur: 'diğer', ornek: { ja: 'おいしいですよ。', kana: 'おいしいですよ。', latin: 'oishii desu yo.', tr: 'Lezzetli, bak.' } },
]
