import { toRomaji } from 'wanakana'
import type { KanjiChar } from '@/types'
import { romajiOf } from '@/lib/ja-phonetic'
import { KANJI_BY_CHAR, KANJI_N5, KANJI_SETS } from './kanji-n5'
import { VOCAB_JA } from './vocab'

/**
 * N5 kanji kartları — öğrenme sayfasının ve ileride bu kartlara özel
 * sınavın ortak verisi.
 *
 * ÖRNEK KELİMELERİN KURALI: bir kelime ancak İÇİNDEKİ BÜTÜN KANJİLER N5
 * listesindeyse kartta çıkar. Öğrenci bir kanjiyi, onunla birleşen diğer N5
 * kanjileriyle birlikte öğreniyor (一 → 一年, 一月). N5 dışı bir kanji içeren
 * örnek (背が高い, 富士山, 自転車) o yöntemi bozuyor: kartta tanımadığı bir
 * karakter çıkıyor ve dikkat asıl kanjiden kayıyor.
 *
 * Örnekler ELLE SEÇİLMİYOR, havuzdan türetiliyor: kanjinin kendi örnekleri
 * önce, ardından BAŞKA kanjilerin örneklerinde ve kelime listesinde geçen N5
 * birleşimleri. Böylece 一'in kartına 年'in örneği olan 一年 da geliyor —
 * elle yazılsaydı bu çapraz bağlar kaçardı.
 */

export interface CardExample {
  term: string
  reading: string
  romaji: string
  tr: string
  /** Kelimedeki DİĞER N5 kanjileri — "bununla birleşen" kısmı */
  others: string[]
}

export interface CardNote {
  /** Yazılış → okunuş çiftleri */
  pairs: [string, string][]
  text: string
}

export interface KanjiCard {
  /** Sayfadaki sıra numarası (tema sırasıyla, 1'den) */
  no: number
  k: KanjiChar
  setId: string
  setTitle: string
  onLatin: string
  kunLatin: string
  examples: CardExample[]
  note?: CardNote
}

/** Kartta en fazla kaç örnek — fazlası kartı okunmaz uzunluğa getiriyor */
const MAX_EXAMPLES = 5

/**
 * Notlar yalnızca GERÇEKTEN not gerektiren kanjilerde var: düzensiz okunuş,
 * ses değişimi, sık yapılan karışıklık. Her kartta not olsaydı önemli olanı
 * sıradan olandan ayırmak mümkün olmazdı.
 */
const NOTES: Record<string, CardNote> = {
  一: {
    pairs: [['一つ', 'ひとつ'], ['一人', 'ひとり'], ['一月', 'いちがつ'], ['一日', 'いちにち / ついたち']],
    text: 'Sayarken ひと-, rakam ve tarihte いち. 一人 (ひとり) ve "ayın 1\'i" anlamındaki 一日 (ついたち) kuraldan değil kelimeden öğrenilir.',
  },
  二: {
    pairs: [['二つ', 'ふたつ'], ['二人', 'ふたり'], ['二日', 'ふつか']],
    text: 'Kişi sayarken にん gelmez: 二人 = ふたり. にん üç kişiden itibaren başlar (三人 さんにん).',
  },
  三: {
    pairs: [['三つ', 'みっつ'], ['三日', 'みっか'], ['三百', 'さんびゃく'], ['三千', 'さんぜん']],
    text: '百 ve 千 önünde ses kalınlaşır: さんびゃく, さんぜん.',
  },
  四: {
    pairs: [['四つ', 'よっつ'], ['四人', 'よにん'], ['四時', 'よじ'], ['四月', 'しがつ']],
    text: 'よん ve し ikisi de var: saatte よじ, ay adında しがつ. し, "ölüm" (死) ile sesteş olduğu için çoğu yerde よん tercih edilir.',
  },
  五: {
    pairs: [['五つ', 'いつつ'], ['五日', 'いつか'], ['五分', 'ごふん']],
    text: 'Nesne sayarken いつ-, rakam olarak ご.',
  },
  六: {
    pairs: [['六つ', 'むっつ'], ['六百', 'ろっぴゃく'], ['六分', 'ろっぷん']],
    text: '百 ve 分 önünde ろく → ろっ olur ve ardından p sesi gelir.',
  },
  七: {
    pairs: [['七つ', 'ななつ'], ['七時', 'しちじ'], ['七月', 'しちがつ']],
    text: 'なな ve しち ikisi de doğru. Saat ve ayda しち yaygın, sayı sayarken なな.',
  },
  八: {
    pairs: [['八つ', 'やっつ'], ['八百', 'はっぴゃく'], ['八日', 'ようか']],
    text: '百 önünde はち → はっ. 八日 = ようか ayrıca ezberlenir.',
  },
  九: {
    pairs: [['九つ', 'ここのつ'], ['九時', 'くじ'], ['九月', 'くがつ']],
    text: 'Saatte ve ay adında く, rakam olarak きゅう (九十 きゅうじゅう).',
  },
  十: {
    pairs: [['十', 'じゅう'], ['十日', 'とおか'], ['十分', 'じゅっぷん']],
    text: '分 önünde じゅう → じゅっ. 十日 = とおか ayrıca ezberlenir.',
  },
  百: {
    pairs: [['百', 'ひゃく'], ['三百', 'さんびゃく'], ['六百', 'ろっぴゃく'], ['八百', 'はっぴゃく']],
    text: 'Önündeki sayıya göre ひゃく / びゃく / ぴゃく olur. N5 dinlemesinde fiyatları zorlaştıran şey bu.',
  },
  千: {
    pairs: [['千', 'せん'], ['三千', 'さんぜん'], ['八千', 'はっせん']],
    text: '3 ve 8 ile ses değişir: さんぜん, はっせん.',
  },
  日: {
    pairs: [['日本', 'にほん'], ['毎日', 'まいにち'], ['日曜日', 'にちようび'], ['三日', 'みっか'], ['今日', 'きょう']],
    text: 'N5\'in okunuşu en çok değişen kanjisi. Ayın 1–10., 14., 20. ve 24. günleri özel okunur. 今日 = きょう tamamen düzensiz.',
  },
  月: {
    pairs: [['一月', 'いちがつ'], ['月曜日', 'げつようび'], ['一か月', 'いっかげつ'], ['月', 'つき']],
    text: 'Ay ADINDA がつ, ay SÜRESİNDE ve pazartesi\'de げつ, gökteki ay つき.',
  },
  火: {
    pairs: [['火', 'ひ'], ['火曜日', 'かようび']],
    text: 'Haftanın gününde on okunuş (か), tek başına kun (ひ).',
  },
  水: {
    pairs: [['水', 'みず'], ['水曜日', 'すいようび']],
    text: 'Haftanın gününde on okunuş (すい), tek başına kun (みず).',
  },
  木: {
    pairs: [['木', 'き'], ['木曜日', 'もくようび']],
    text: 'Haftanın gününde on okunuş (もく), tek başına kun (き).',
  },
  金: {
    pairs: [['お金', 'おかね'], ['金曜日', 'きんようび']],
    text: '"Para" anlamında お金 = おかね; haftanın gününde きん.',
  },
  土: {
    pairs: [['土', 'つち'], ['土曜日', 'どようび']],
    text: 'Haftanın gününde on okunuş (ど), tek başına kun (つち).',
  },
  時: {
    pairs: [['時間', 'じかん'], ['何時', 'なんじ'], ['時々', 'ときどき']],
    text: '々 bir önceki kanjiyi tekrar eden işarettir: 時々 = 時時.',
  },
  分: {
    pairs: [['五分', 'ごふん'], ['三分', 'さんぷん'], ['十分', 'じゅっぷん'], ['分かる', 'わかる']],
    text: 'Dakikada ふん / ぷん değişir (1, 3, 4, 6, 8, 10 ile ぷん). "Anlamak" fiilinde わ okunur.',
  },
  半: {
    pairs: [['二時半', 'にじはん'], ['半分', 'はんぶん']],
    text: 'Saat söylerken sona gelir: 二時半 = saat iki buçuk.',
  },
  年: {
    pairs: [['一年', 'いちねん'], ['今年', 'ことし'], ['毎年', 'まいとし']],
    text: '今年 = ことし düzensiz okunur.',
  },
  今: {
    pairs: [['今', 'いま'], ['今週', 'こんしゅう'], ['今日', 'きょう'], ['今年', 'ことし']],
    text: '今日 ve 今年 düzensiz okunur — kelime olarak ezberle.',
  },
  何: {
    pairs: [['何', 'なに'], ['何時', 'なんじ'], ['何人', 'なんにん'], ['何ですか', 'なんですか']],
    text: 'Sayaç ve です önünde なん, を/が önünde なに (何を なにを).',
  },
  人: {
    pairs: [['人', 'ひと'], ['日本人', 'にほんじん'], ['三人', 'さんにん'], ['一人', 'ひとり']],
    text: 'Milliyette じん, sayarken にん. 一人 (ひとり), 二人 (ふたり) ve 大人 (おとな) düzensiz.',
  },
  生: {
    pairs: [['学生', 'がくせい'], ['生まれる', 'うまれる'], ['一生', 'いっしょう']],
    text: 'Okunuşu en çok olan kanjilerden. Listeyi ezberleme, kelimeyle öğren.',
  },
  先: {
    pairs: [['先生', 'せんせい'], ['先週', 'せんしゅう']],
    text: '先生 hem "öğretmen" hem de doktor, avukat gibi uzmanlara hitaptır.',
  },
  学: {
    pairs: [['学生', 'がくせい'], ['大学', 'だいがく'], ['学校', 'がっこう']],
    text: '学校\'da がく → がっ olur, çünkü ardından こ geliyor.',
  },
  行: {
    pairs: [['行く', 'いく'], ['行きます', 'いきます'], ['行って', 'いって']],
    text: 'て biçimi いって — いきて değil. N5\'te en sık yapılan çekim hatalarından.',
  },
  来: {
    pairs: [['来る', 'くる'], ['来ます', 'きます'], ['来ない', 'こない'], ['来週', 'らいしゅう']],
    text: 'Düzensiz fiil: çekime göre く / き / こ okunur.',
  },
  上: {
    pairs: [['上', 'うえ'], ['上手', 'じょうず']],
    text: '上手 = じょうず düzensiz ("usta, iyi"). Başkasını överken kullanılır, kendin için söylenmez.',
  },
  下: {
    pairs: [['下', 'した'], ['下手', 'へた']],
    text: '下手 = へた düzensiz ("beceriksiz").',
  },
  中: {
    pairs: [['中', 'なか'], ['中国', 'ちゅうごく'], ['一日中', 'いちにちじゅう']],
    text: '"…boyunca" anlamında ちゅう → じゅう olur: 一日中 = bütün gün.',
  },
  大: {
    pairs: [['大きい', 'おおきい'], ['大学', 'だいがく'], ['大人', 'おとな']],
    text: '大人 = おとな düzensiz.',
  },
  名: {
    pairs: [['名前', 'なまえ']],
    text: '名前\'de 前 ぜん değil まえ okunur.',
  },
  前: {
    pairs: [['前', 'まえ'], ['名前', 'なまえ'], ['午前', 'ごぜん']],
    text: '午前 "öğleden önce" saatin başına gelir: 午前九時 = sabah 9.',
  },
  後: {
    pairs: [['後で', 'あとで'], ['後ろ', 'うしろ'], ['午後', 'ごご']],
    text: 'Zamanda "sonra" あと, mekânda "arka" うしろ, saatte ご.',
  },
  父: {
    pairs: [['父', 'ちち'], ['お父さん', 'おとうさん']],
    text: 'Kendi babandan başkasına bahsederken 父 (ちち); başkasının babası ya da babana seslenirken お父さん.',
  },
  母: {
    pairs: [['母', 'はは'], ['お母さん', 'おかあさん']],
    text: 'Kendi annenden bahsederken 母 (はは); başkasının annesi ya da annene seslenirken お母さん.',
  },
  兄: {
    pairs: [['兄', 'あに'], ['お兄さん', 'おにいさん']],
    text: 'Kendi ağabeyin 兄 (あに); başkasınınki ya da hitap お兄さん.',
  },
  姉: {
    pairs: [['姉', 'あね'], ['お姉さん', 'おねえさん']],
    text: 'Kendi ablan 姉 (あね); başkasınınki ya da hitap お姉さん.',
  },
  入: {
    pairs: [['入る', 'はいる'], ['入れる', 'いれる'], ['入口', 'いりぐち']],
    text: 'Aynı kanji iki fiil: 入る (girmek) はいる, 入れる (içine koymak) いれる. 入口\'da くち → ぐち.',
  },
  出: {
    pairs: [['出る', 'でる'], ['出す', 'だす'], ['出口', 'でぐち']],
    text: '出る kendin çıkarsın, 出す bir şeyi çıkarırsın.',
  },
  口: {
    pairs: [['口', 'くち'], ['入口', 'いりぐち'], ['人口', 'じんこう']],
    text: 'Birleşik kelimede くち → ぐち olabilir.',
  },
  手: {
    pairs: [['手', 'て'], ['上手', 'じょうず'], ['下手', 'へた']],
    text: '上手 ve 下手 düzensiz okunur.',
  },
  足: {
    pairs: [['足', 'あし'], ['足りる', 'たりる']],
    text: 'Aynı kanji: "ayak" あし, "yetmek" たりる.',
  },
  高: {
    pairs: [['高い', 'たかい']],
    text: '高い hem "yüksek" hem "pahalı". Zıtları farklı kelimeler: "ucuz" 安い, "alçak" 低い.',
  },
  早: {
    pairs: [['早い', 'はやい'], ['早く', 'はやく']],
    text: 'Dikkat: "hızlı" anlamındaki はやい genelde 速い yazılır (N5 dışı). 早い = erken.',
  },
  少: {
    pairs: [['少し', 'すこし'], ['少ない', 'すくない']],
    text: 'Okunuş değişiyor: すこ-し ("biraz") ve すく-ない ("az").',
  },
  間: {
    pairs: [['時間', 'じかん'], ['人間', 'にんげん'], ['間', 'あいだ']],
    text: 'Süre sorarken 何時間 (なんじかん) = kaç saat; 何時 (なんじ) = saat kaç.',
  },
  週: {
    pairs: [['今週', 'こんしゅう'], ['一週間', 'いっしゅうかん']],
    text: 'Süre söylerken 間 eklenir: 一週間 = bir hafta (boyunca).',
  },
  友: {
    pairs: [['友だち', 'ともだち']],
    text: '友だち\'nın だち kısmı genelde kana ile yazılır.',
  },
  休: {
    pairs: [['休む', 'やすむ'], ['休み', 'やすみ']],
    text: 'Fiilden isim: 休む (dinlenmek) → 休み (tatil, ara).',
  },
}

const KANJI_IN = /[㐀-鿿]/g

function kanjiIn(term: string): string[] {
  return term.match(KANJI_IN) ?? []
}

type Raw = { term: string; reading: string; tr: string }

/** Bütün aday örnekler — kanjilerin kendi örnekleri ve kelime listesi */
const POOL: Raw[] = [
  ...KANJI_N5.flatMap((k) => k.words),
  ...VOCAB_JA.filter((v) => v.reading).map((v) => ({ term: v.term, reading: v.reading!, tr: v.tr })),
]

function examplesFor(k: KanjiChar, sira: Map<string, number>): CardExample[] {
  const gorulen = new Set<string>()
  const out: CardExample[] = []

  // Bir birleşimin "ne kadar erken öğrenilebilir" olduğu: içindeki DİĞER
  // kanjilerden en geç öğrenilenin kart sırası. 一年'in eşi 年 ikinci temada,
  // 一生'in eşi 生 dördüncü temada — yani 一年 önce gelmeli.
  const gecikme = (term: string) =>
    Math.max(-1, ...kanjiIn(term).filter((c) => c !== k.char).map((c) => sira.get(c) ?? 999))

  // Kendi örnekleri ÖNCE: veri dosyasında en yaygın kullanım başa yazılmış.
  //
  // Çapraz örnekler, birleşen kanjiyi öğrenme sırasına göre diziliyor.
  // Havuzun kendi sırasıyla gidince 一'in kartında 一年 yerine 一日中 ve 一生
  // çıkıyordu: 5 sınırına keyfi sırayla takılıyorlardı. Öğrenci bir kanjiyi
  // onunla birleşen N5 kanjileriyle birlikte öğreniyor; en önce, zaten
  // bildiği ya da hemen öğreneceği eşle kurulan kelimeyi görmeli.
  const capraz = POOL.filter((w) => w.term.includes(k.char)).sort(
    (a, b) =>
      kanjiIn(a.term).length - kanjiIn(b.term).length ||
      gecikme(a.term) - gecikme(b.term) ||
      a.term.length - b.term.length,
  )
  const uygun = (w: Raw) =>
    w.term.includes(k.char) && kanjiIn(w.term).every((c) => KANJI_BY_CHAR.has(c))

  const ekle = (w: Raw) => {
    const kanjiler = kanjiIn(w.term)
    gorulen.add(w.term)
    out.push({
      term: w.term,
      reading: w.reading,
      romaji: romajiOf(w.reading).text,
      tr: w.tr,
      others: [...new Set(kanjiler.filter((c) => c !== k.char))],
    })
  }

  // 1) Kanjinin kendi örnekleri
  for (const w of k.words) {
    if (out.length >= MAX_EXAMPLES) break
    if (uygun(w) && !gorulen.has(w.term)) ekle(w)
  }

  // 2) Çapraz örnekler: yalnızca YENİ bir eş kanji getirenler.
  //
  // Sıralama tek başına yetmiyordu: 一月 zaten kartta dururken 一か月 de
  // geliyor ve aynı eşi (月) tekrarlıyordu; o slot 一年 gibi yeni bir eşe
  // gitmeliydi. Öğrenci kanjiyi onunla birleşen kanjilerle öğreniyor, her
  // örnek yeni bir birleşim öğretmeli.
  for (const w of capraz) {
    if (out.length >= MAX_EXAMPLES) break
    if (!uygun(w) || gorulen.has(w.term)) continue
    const eslesen = new Set(out.flatMap((e) => e.others))
    if (kanjiIn(w.term).some((c) => c !== k.char && !eslesen.has(c))) ekle(w)
  }

  // 3) Hâlâ yer varsa yeni eş getirmeyenler de girsin — kart eksik kalmasın
  for (const w of capraz) {
    if (out.length >= MAX_EXAMPLES) break
    if (uygun(w) && !gorulen.has(w.term)) ekle(w)
  }

  return out
}

/** Kun okunuşlarındaki tire (た-べる) Latinceye taşınmaz: "taberu" okunur */
const latin = (list: string[]) => list.map((r) => toRomaji(r.replace(/-/g, ''))).join(' / ')

function build(): KanjiCard[] {
  // Sıra tema sırası: 一 1 numara olsun, sayılar önce gelsin. Veri dosyasının
  // kendi sırası 日 ile başlıyor, öğrenme sırası olarak anlamsız.
  const sirali: { char: string; setId: string; setTitle: string }[] = []
  const eklenen = new Set<string>()
  for (const s of KANJI_SETS) {
    for (const c of s.chars) {
      if (eklenen.has(c) || !KANJI_BY_CHAR.has(c)) continue
      eklenen.add(c)
      sirali.push({ char: c, setId: s.id, setTitle: s.title })
    }
  }
  // Hiçbir temaya girmeyen kanji olursa kaybolmasın
  for (const k of KANJI_N5) {
    if (!eklenen.has(k.char)) sirali.push({ char: k.char, setId: 'diger', setTitle: 'Diğer' })
  }

  const sira = new Map(sirali.map((s, i) => [s.char, i]))

  return sirali.map((s, i) => {
    const k = KANJI_BY_CHAR.get(s.char)!
    return {
      no: i + 1,
      k,
      setId: s.setId,
      setTitle: s.setTitle,
      onLatin: latin(k.on),
      kunLatin: latin(k.kun),
      examples: examplesFor(k, sira),
      note: NOTES[s.char],
    }
  })
}

export const KANJI_CARDS: KanjiCard[] = build()

export const KANJI_CARD_SETS = KANJI_SETS.map((s) => ({ id: s.id, label: s.title }))
