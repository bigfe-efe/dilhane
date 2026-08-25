import { toRomaji } from 'wanakana'
// Hiragana ile okunabilen kelimeler — kana sökme alıştırması için.
//
// NEDEN AYRI BİR LİSTE:
// Sözlükteki kelimeler (vocab.ts) anlam öğrenmek için seçilmiştir; çoğu kanjili
// ve uzundur. Buradakiler ise ÇÖZMEK için seçildi: kısa, sık, ve önemlisi
// "hangi kana'ları bilirsen okunur" diye süzülebilecek biçimde.
//
// Kural: her satır tamamen hiragana. Kanji karşılığı varsa parantez bilgisi
// olarak tutulur — kelimeyi sonradan kanjili görünce tanıman için.
//
// Japoncada birçok kelime zaten günlük hayatta hiragana yazılır: ある, いる,
// これ, とても, たくさん, ありがとう… Kanjisi olanların da kanjisi çoğu zaman
// ders kitaplarında geç öğretilir. Yani bu liste yapay değil; başlangıç
// seviyesinde gerçekten böyle okursun.

export interface KanaWord {
  /** Tamamen hiragana yazım */
  kana: string
  tr: string
  /** Varsa kanjili yazımı — bilgi olarak gösterilir */
  kanji?: string
  /**
   * Yazıldığı gibi okunmayan kelimeler için okunuş.
   *
   * Neredeyse bütün kana yazıldığı gibi okunur; istisna, KONU EKİ olan は'dır:
   * こんにちは "konnichiwa" okunur, "konnichiha" değil. Harf harf çevirmek
   * burada yanlış sonuç verdiği için okunuş elle yazılıyor.
   */
  reading?: string
  /** Neden farklı okunduğunun açıklaması */
  note?: string
}

type Row = [string, string, string?]

/**
 * Yazıldığı gibi okunmayan kelimeler.
 *
 * は karakteri konu eki olarak kullanıldığında "wa" okunur. こんにちは ve
 * こんばんは aslında birer cümle kırıntısıdır (今日は… = "bugüne gelince…"),
 * sondaki は o cümlenin konu ekidir ve okunuşu korunmuştur.
 */
const IRREGULAR: Record<string, { reading: string; note: string }> = {
  こんにちは: {
    reading: 'konnichiwa',
    note: 'Sondaki は burada KONU EKİdir ve "wa" okunur. Kelime aslında 今日は ("bugüne gelince…") cümlesinin kalıntısıdır. Yazılışı は, okunuşu wa.',
  },
  こんばんは: {
    reading: 'konbanwa',
    note: 'Sondaki は yine konu ekidir: "wa" okunur. 今晩は ("bu akşama gelince…") kalıntısı.',
  },
}

const ROWS: Row[] = [
  // ————— あ行 + か行 ile okunabilenler —————
  ['あい', 'aşk', '愛'],
  ['あう', 'buluşmak', '会う'],
  ['あお', 'mavi', '青'],
  ['あか', 'kırmızı', '赤'],
  ['あき', 'sonbahar', '秋'],
  ['いえ', 'ev', '家'],
  ['いく', 'gitmek', '行く'],
  ['うえ', 'üst', '上'],
  ['えき', 'istasyon', '駅'],
  ['おおい', 'çok (sayıca)', '多い'],
  ['かお', 'yüz', '顔'],
  ['かき', 'Trabzon hurması', '柿'],
  ['かく', 'yazmak', '書く'],
  ['きく', 'dinlemek', '聞く'],
  ['こえ', 'ses (insan sesi)', '声'],
  ['ここ', 'burası'],
  ['あかい', 'kırmızı (sıfat)', '赤い'],
  ['あおい', 'mavi (sıfat)', '青い'],
  ['おおきい', 'büyük', '大きい'],

  // ————— + さ行 —————
  ['あさ', 'sabah', '朝'],
  ['あし', 'ayak, bacak', '足'],
  ['いす', 'sandalye', '椅子'],
  ['うし', 'inek', '牛'],
  ['さけ', 'sake, içki', '酒'],
  ['さく', 'çiçek açmak', '咲く'],
  ['しお', 'tuz', '塩'],
  ['すいか', 'karpuz'],
  ['すし', 'suşi', '寿司'],
  ['せかい', 'dünya', '世界'],
  ['そこ', 'şurası'],
  ['そら', 'gökyüzü', '空'],
  ['あさい', 'sığ', '浅い'],
  ['おかし', 'tatlı, atıştırmalık', 'お菓子'],
  ['かさ', 'şemsiye', '傘'],
  ['きせつ', 'mevsim', '季節'],

  // ————— + た行 —————
  ['あした', 'yarın', '明日'],
  ['いち', 'bir (1)', '一'],
  ['うた', 'şarkı', '歌'],
  ['した', 'alt', '下'],
  ['たかい', 'yüksek, pahalı', '高い'],
  ['たこ', 'ahtapot', '蛸'],
  ['ちかい', 'yakın', '近い'],
  ['つき', 'ay (gökyüzü)', '月'],
  ['つくえ', 'masa', '机'],
  ['て', 'el', '手'],
  ['てがみ', 'mektup', '手紙'],
  ['とけい', 'saat (nesne)', '時計'],
  ['とし', 'yıl, yaş', '年'],
  ['ちいさい', 'küçük', '小さい'],
  ['たかさ', 'yükseklik', '高さ'],
  ['したしい', 'yakın (dostluk)', '親しい'],

  // ————— + な行 —————
  ['あなた', 'sen, siz'],
  ['いぬ', 'köpek', '犬'],
  ['なつ', 'yaz', '夏'],
  ['なに', 'ne', '何'],
  ['なまえ', 'isim', '名前'],
  ['にく', 'et', '肉'],
  ['にし', 'batı', '西'],
  ['ねこ', 'kedi', '猫'],
  ['のむ', 'içmek', '飲む'],
  ['あたたかい', 'ılık, sıcak', '暖かい'],
  ['さかな', 'balık', '魚'],
  ['たなか', 'Tanaka (soyadı)', '田中'],
  ['なつかしい', 'özlem uyandıran', '懐かしい'],

  // ————— + は行 —————
  ['はな', 'çiçek', '花'],
  ['はし', 'köprü / yemek çubuğu', '橋 / 箸'],
  ['はる', 'ilkbahar', '春'],
  ['ひと', 'insan, kişi', '人'],
  ['ふね', 'gemi', '船'],
  ['ふく', 'kıyafet', '服'],
  ['へや', 'oda', '部屋'],
  ['ほし', 'yıldız', '星'],
  ['ほん', 'kitap', '本'],
  ['はなし', 'konuşma, hikâye', '話'],
  ['はたけ', 'tarla', '畑'],
  ['ひこうき', 'uçak', '飛行機'],
  ['ひくい', 'alçak', '低い'],
  ['ふるい', 'eski', '古い'],

  // ————— + ま行 —————
  ['あたま', 'kafa, baş', '頭'],
  ['いま', 'şimdi', '今'],
  ['うみ', 'deniz', '海'],
  ['かみ', 'kâğıt / saç', '紙 / 髪'],
  ['くも', 'bulut', '雲'],
  ['まち', 'şehir, kasaba', '町'],
  ['みみ', 'kulak', '耳'],
  ['みせ', 'dükkân', '店'],
  ['むし', 'böcek', '虫'],
  ['め', 'göz', '目'],
  ['もの', 'şey, nesne', '物'],
  ['もも', 'şeftali', '桃'],
  ['あまい', 'tatlı', '甘い'],
  ['まいにち', 'her gün', '毎日'],
  ['さむい', 'soğuk (hava)', '寒い'],
  ['たのしい', 'eğlenceli', '楽しい'],

  // ————— + や行 · ら行 · わ行 · ん —————
  ['やま', 'dağ', '山'],
  ['ゆき', 'kar', '雪'],
  ['よる', 'gece', '夜'],
  ['やさい', 'sebze', '野菜'],
  ['ゆめ', 'rüya, hayal', '夢'],
  ['あさり', 'kum midyesi'],
  ['くるま', 'araba', '車'],
  ['さくら', 'kiraz çiçeği', '桜'],
  ['しろい', 'beyaz', '白い'],
  ['とり', 'kuş', '鳥'],
  ['くすり', 'ilaç', '薬'],
  ['わたし', 'ben', '私'],
  ['われわれ', 'biz (resmî)', '我々'],
  ['にわ', 'bahçe', '庭'],
  ['ことば', 'kelime, söz', '言葉'],
  ['おわり', 'son, bitiş', '終わり'],
  ['みなさん', 'herkes', '皆さん'],
  ['ありがとう', 'teşekkürler'],
  ['こんにちは', 'merhaba'],
  ['こんばんは', 'iyi akşamlar'],
  ['さようなら', 'hoşça kal'],
  ['なるほど', 'anlıyorum, demek öyle'],
  ['ゆっくり', 'yavaşça'],

  // ————— dakuten (が ざ だ ば) —————
  ['かぎ', 'anahtar', '鍵'],
  ['かぜ', 'rüzgâr / nezle', '風 / 風邪'],
  ['がっこう', 'okul', '学校'],
  ['ぎんこう', 'banka', '銀行'],
  ['げんき', 'sağlıklı, enerjik', '元気'],
  ['ごはん', 'pilav, yemek', 'ご飯'],
  ['ざっし', 'dergi', '雑誌'],
  ['じかん', 'zaman, saat', '時間'],
  ['じてんしゃ', 'bisiklet', '自転車'],
  ['ずっと', 'sürekli, hep'],
  ['だいがく', 'üniversite', '大学'],
  ['だれ', 'kim', '誰'],
  ['でんわ', 'telefon', '電話'],
  ['どこ', 'nerede'],
  ['ばん', 'akşam / sıra', '晩 / 番'],
  ['びょういん', 'hastane', '病院'],
  ['ぶんか', 'kültür', '文化'],
  ['べんきょう', 'ders çalışma', '勉強'],
  ['ぼく', 'ben (erkek, samimi)', '僕'],
  ['みず', 'su', '水'],
  ['たまご', 'yumurta', '卵'],
  ['いちご', 'çilek', '苺'],
  ['りんご', 'elma', '林檎'],
  ['ともだち', 'arkadaş', '友達'],
  ['からだ', 'vücut', '体'],
  ['あたらしい', 'yeni', '新しい'],
  ['にほんご', 'Japonca', '日本語'],
  ['ながい', 'uzun', '長い'],

  // ————— handakuten (ぱ) ve küçük っ —————
  ['きって', 'pul', '切手'],
  ['きっぷ', 'bilet', '切符'],
  ['がっき', 'müzik aleti', '楽器'],
  ['ざっか', 'hırdavat, ıvır zıvır', '雑貨'],
  ['いっぱい', 'dolu, bir sürü', '一杯'],
  ['しっぱい', 'başarısızlık', '失敗'],
  ['さんぽ', 'yürüyüş', '散歩'],
  ['えんぴつ', 'kurşun kalem', '鉛筆'],
  ['てんぷら', 'tempura', '天ぷら'],
  ['かっこいい', 'havalı, yakışıklı'],
  ['ちょっと', 'biraz'],
  ['やっぱり', 'yine de, tahmin ettiğim gibi'],

  // ————— yōon (きゃ しゃ ちゃ …) —————
  ['おちゃ', 'çay', 'お茶'],
  ['きゃく', 'misafir, müşteri', '客'],
  ['きょう', 'bugün', '今日'],
  ['きょねん', 'geçen yıl', '去年'],
  ['しゃしん', 'fotoğraf', '写真'],
  ['しゅくだい', 'ödev', '宿題'],
  ['しょくじ', 'yemek (öğün)', '食事'],
  ['じゅぎょう', 'ders (sınıfta)', '授業'],
  ['ちゃいろ', 'kahverengi', '茶色'],
  ['にゅうがく', 'okula giriş', '入学'],
  ['びょうき', 'hastalık', '病気'],
  ['りょうり', 'yemek (pişirme)', '料理'],
  ['りょこう', 'seyahat', '旅行'],
  ['りゅうがくせい', 'yabancı öğrenci', '留学生'],
]

export const KANA_WORDS: KanaWord[] = ROWS.map(([kana, tr, kanji]) => ({
  kana,
  tr,
  kanji,
  ...(IRREGULAR[kana] ?? {}),
}))

const BY_KANA = new Map(KANA_WORDS.map((w) => [w.kana, w]))

/**
 * Kelimenin okunuşu (romaji).
 *
 * Doğrudan toRomaji kullanmak yetmiyor: konu eki は "wa" okunur ama harf harf
 * çeviri "ha" verir. Bu yüzden önce istisna listesine bakılıyor.
 */
export function readingOf(kana: string): string {
  return BY_KANA.get(kana)?.reading ?? toRomaji(kana)
}

/** Kelime yazıldığı gibi okunmuyorsa nedenini açıklar. */
export function readingNote(kana: string): string | undefined {
  return BY_KANA.get(kana)?.note
}

/**
 * Hece hece okunuş.
 *
 * Tek tek toRomaji çağırmak istisnalarda çelişki üretiyordu: kelimenin okunuşu
 * "konnichiwa" yazarken hece dökümü "ko·n·ni·chi·ha" diyordu. Konu eki は
 * kelimenin SONUNDAysa ve kelime istisna listesindeyse "wa" gösteriliyor.
 */
export function moraReadings(kana: string): { unit: string; romaji: string }[] {
  const units = tokenize(kana)
  const irregular = !!BY_KANA.get(kana)?.reading
  return units.map((u, i) => ({
    unit: u,
    romaji: irregular && u === 'は' && i === units.length - 1 ? 'wa' : toRomaji(u),
  }))
}

/**
 * Kelimenin mora (hece) sayısı.
 * Küçük ゃゅょ önceki kana ile birleşir, ayrı sayılmaz; küçük っ ve ん
 * Japoncada tek başına bir mora sayılır.
 */
export function moraCount(kana: string): number {
  return [...kana].filter((c) => !'ゃゅょァィゥェォャュョ'.includes(c)).length
}

/**
 * Kelimeyi "öğrenme birimlerine" ayırır — kana tablosundaki seçilebilir
 * öğelerle aynı mantıkta.
 *
 * Küçük ゃゅょ önceki karaktere yapışır ve TEK bir birim olur (きゃ), çünkü
 * tabloda da öyle öğrenilir. Küçük っ kendi başına bir birimdir.
 */
export function tokenize(kana: string): string[] {
  const chars = [...kana]
  const out: string[] = []
  for (let i = 0; i < chars.length; i++) {
    let t = chars[i]
    while (i + 1 < chars.length && 'ゃゅょ'.includes(chars[i + 1])) t += chars[++i]
    out.push(t)
  }
  return out
}

/**
 * Verilen kana kümesiyle okunabilen kelimeler.
 *
 * Kelimenin HER birimi seçili olmalı — biri bile eksikse kelime elenir.
 * İki incelik var:
 *   • きょう, りょこう gibi kelimeler きょ / りょ birimini gerektirir. Bunlar
 *     tabloda yōon satırındadır; か行 bilmek yetmez.
 *   • Küçük っ, つ'nin küçüğüdür. つ'yi tanımayan biri onu "küçük tsu" diye
 *     çözemez, o yüzden っ içeren kelime た行 seçilmeden gösterilmez.
 */
export function wordsReadableWith(selected: Set<string>, opts?: { maxMora?: number }): KanaWord[] {
  const max = opts?.maxMora ?? Infinity
  return KANA_WORDS.filter((w) => {
    if (moraCount(w.kana) > max) return false
    return tokenize(w.kana).every((t) => (t === 'っ' ? selected.has('つ') : selected.has(t)))
  })
}
