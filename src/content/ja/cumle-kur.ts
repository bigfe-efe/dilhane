// "Cümle kur" sayfasının içeriği: bir cümleyi olumlu/olumsuz, zaman, soru ve
// kibar/sade hâllerine çevirmek; zamirler; günlük kalıp cümleler.
//
// NEDEN AYRI SAYFA: "Olumlu · olumsuz" bölümü (cekimler.ts) kelimenin
// çekimini TANIMAYI öğretiyor. Öğrenci bir adım ötesini istedi: bütün bir
// cümleyi olumsuz, geçmiş, soru yapabilmek ve gündelik konuşmanın iskeletini
// (zamirler, kalıp cümleler) tek yerde görmek. Buradaki her şey N5 kapsamında.
//
// Romaji elle yazıldı (otomatik bölme kana ağırlıklı cümlelerde kelimeleri
// birleştiriyor). Yüklemler "kök|ek" biçiminde: ek renkli gösteriliyor.

export interface Satir {
  ja: string
  /** Yazılış zaten kanaysa boş bırakılır */
  kana?: string
  latin: string
  tr: string
  not?: string
  star?: boolean
}

// ————————————————————————— Cümle dönüştürme —————————————————————————

/** Yüklemin bir biçimi; üçü de "kök|ek" */
export interface Bicim {
  ja: string
  kana: string
  latin: string
}

const b = (ja: string, kana: string, latin: string): Bicim => ({ ja, kana, latin })

export type CumleTuru = 'fiil' | 'isim' | 'i'

export interface DonusumCumle {
  id: string
  /** Kural tablosu için: fiil, isim/な-sıfat, い-sıfat */
  tur: CumleTuru
  /** Chip etiketi: 食べる */
  kelime: string
  /** ru-fiil, u-fiil, い-sıfat… */
  cins: string
  anlam: string
  /** Yüklemden önceki kısım */
  bas: { ja: string; kana: string; latin: string }
  /** Sıra: olumlu, olumsuz, geçmiş, olumsuz geçmiş */
  kibar: [Bicim, Bicim, Bicim, Bicim]
  sade: [Bicim, Bicim, Bicim, Bicim]
  tr: [string, string, string, string]
  trSoru: [string, string, string, string]
  /** Şu an süren eylem (〜ています): olumlu, olumsuz. Yalnızca eylem fiillerinde. */
  suren?: {
    kibar: [Bicim, Bicim]
    sade: [Bicim, Bicim]
    tr: [string, string]
    trSoru: [string, string]
  }
  not?: string
}

export const DONUSUM: DonusumCumle[] = [
  {
    id: 'taberu',
    tur: 'fiil',
    kelime: '食べる',
    cins: 'ru-fiil',
    anlam: 'yemek',
    bas: { ja: '朝ご飯を', kana: 'あさごはんを', latin: 'asagohan o' },
    kibar: [
      b('食べ|ます', 'たべ|ます', 'tabe|masu'),
      b('食べ|ません', 'たべ|ません', 'tabe|masen'),
      b('食べ|ました', 'たべ|ました', 'tabe|mashita'),
      b('食べ|ませんでした', 'たべ|ませんでした', 'tabe|masen deshita'),
    ],
    sade: [
      b('食べ|る', 'たべ|る', 'tabe|ru'),
      b('食べ|ない', 'たべ|ない', 'tabe|nai'),
      b('食べ|た', 'たべ|た', 'tabe|ta'),
      b('食べ|なかった', 'たべ|なかった', 'tabe|nakatta'),
    ],
    tr: ['Kahvaltı yaparım. / Kahvaltı yapacağım.', 'Kahvaltı yapmam. / Kahvaltı yapmayacağım.', 'Kahvaltı yaptım.', 'Kahvaltı yapmadım.'],
    trSoru: ['Kahvaltı yapar mısın?', 'Kahvaltı yapmaz mısın?', 'Kahvaltı yaptın mı?', 'Kahvaltı yapmadın mı?'],
    suren: {
      kibar: [b('食べて|います', 'たべて|います', 'tabete |imasu'), b('食べて|いません', 'たべて|いません', 'tabete |imasen')],
      sade: [b('食べて|いる', 'たべて|いる', 'tabete |iru'), b('食べて|いない', 'たべて|いない', 'tabete |inai')],
      tr: ['Kahvaltı yapıyorum (şu an).', 'Kahvaltı yapmıyorum.'],
      trSoru: ['Kahvaltı yapıyor musun?', 'Kahvaltı yapmıyor musun?'],
    },
  },
  {
    id: 'iku',
    tur: 'fiil',
    kelime: '行く',
    cins: 'u-fiil',
    anlam: 'gitmek',
    bas: { ja: '学校へ', kana: 'がっこうへ', latin: 'gakkou e' },
    kibar: [
      b('行き|ます', 'いき|ます', 'iki|masu'),
      b('行き|ません', 'いき|ません', 'iki|masen'),
      b('行き|ました', 'いき|ました', 'iki|mashita'),
      b('行き|ませんでした', 'いき|ませんでした', 'iki|masen deshita'),
    ],
    sade: [
      b('行|く', 'い|く', 'i|ku'),
      b('行|かない', 'い|かない', 'i|kanai'),
      b('行|った', 'い|った', 'i|tta'),
      b('行|かなかった', 'い|かなかった', 'i|kanakatta'),
    ],
    tr: ['Okula giderim. / Okula gideceğim.', 'Okula gitmem. / Okula gitmeyeceğim.', 'Okula gittim.', 'Okula gitmedim.'],
    trSoru: ['Okula gider misin?', 'Okula gitmez misin?', 'Okula gittin mi?', 'Okula gitmedin mi?'],
    not: '行く’nun た biçimi istisna: 行った (行いた değil).',
  },
  {
    id: 'nomu',
    tur: 'fiil',
    kelime: '飲む',
    cins: 'u-fiil',
    anlam: 'içmek',
    bas: { ja: 'コーヒーを', kana: 'こーひーを', latin: 'koohii o' },
    kibar: [
      b('飲み|ます', 'のみ|ます', 'nomi|masu'),
      b('飲み|ません', 'のみ|ません', 'nomi|masen'),
      b('飲み|ました', 'のみ|ました', 'nomi|mashita'),
      b('飲み|ませんでした', 'のみ|ませんでした', 'nomi|masen deshita'),
    ],
    sade: [
      b('飲|む', 'の|む', 'no|mu'),
      b('飲|まない', 'の|まない', 'no|manai'),
      b('飲|んだ', 'の|んだ', 'no|nda'),
      b('飲|まなかった', 'の|まなかった', 'no|manakatta'),
    ],
    tr: ['Kahve içerim. / Kahve içeceğim.', 'Kahve içmem. / Kahve içmeyeceğim.', 'Kahve içtim.', 'Kahve içmedim.'],
    trSoru: ['Kahve içer misin?', 'Kahve içmez misin?', 'Kahve içtin mi?', 'Kahve içmedin mi?'],
    suren: {
      kibar: [b('飲んで|います', 'のんで|います', 'nonde |imasu'), b('飲んで|いません', 'のんで|いません', 'nonde |imasen')],
      sade: [b('飲んで|いる', 'のんで|いる', 'nonde |iru'), b('飲んで|いない', 'のんで|いない', 'nonde |inai')],
      tr: ['Kahve içiyorum (şu an).', 'Kahve içmiyorum.'],
      trSoru: ['Kahve içiyor musun?', 'Kahve içmiyor musun?'],
    },
  },
  {
    id: 'suru',
    tur: 'fiil',
    kelime: 'べんきょうする',
    cins: 'düzensiz fiil',
    anlam: 'ders çalışmak',
    bas: { ja: '日本語を', kana: 'にほんごを', latin: 'nihongo o' },
    kibar: [
      b('べんきょうし|ます', 'べんきょうし|ます', 'benkyou shi|masu'),
      b('べんきょうし|ません', 'べんきょうし|ません', 'benkyou shi|masen'),
      b('べんきょうし|ました', 'べんきょうし|ました', 'benkyou shi|mashita'),
      b('べんきょうし|ませんでした', 'べんきょうし|ませんでした', 'benkyou shi|masen deshita'),
    ],
    sade: [
      b('べんきょう|する', 'べんきょう|する', 'benkyou |suru'),
      b('べんきょう|しない', 'べんきょう|しない', 'benkyou |shinai'),
      b('べんきょう|した', 'べんきょう|した', 'benkyou |shita'),
      b('べんきょう|しなかった', 'べんきょう|しなかった', 'benkyou |shinakatta'),
    ],
    tr: ['Japonca çalışırım. / Japonca çalışacağım.', 'Japonca çalışmam. / Japonca çalışmayacağım.', 'Japonca çalıştım.', 'Japonca çalışmadım.'],
    trSoru: ['Japonca çalışır mısın?', 'Japonca çalışmaz mısın?', 'Japonca çalıştın mı?', 'Japonca çalışmadın mı?'],
    suren: {
      kibar: [
        b('べんきょうして|います', 'べんきょうして|います', 'benkyou shite |imasu'),
        b('べんきょうして|いません', 'べんきょうして|いません', 'benkyou shite |imasen'),
      ],
      sade: [
        b('べんきょうして|いる', 'べんきょうして|いる', 'benkyou shite |iru'),
        b('べんきょうして|いない', 'べんきょうして|いない', 'benkyou shite |inai'),
      ],
      tr: ['Japonca çalışıyorum (şu an).', 'Japonca çalışmıyorum.'],
      trSoru: ['Japonca çalışıyor musun?', 'Japonca çalışmıyor musun?'],
    },
    not: 'する düzensiz: する / しない / した. “isim + する” fiillerinin hepsi böyle çekilir.',
  },
  {
    id: 'kuru',
    tur: 'fiil',
    kelime: '来る',
    cins: 'düzensiz fiil',
    anlam: 'gelmek',
    bas: { ja: '友だちが', kana: 'ともだちが', latin: 'tomodachi ga' },
    kibar: [
      b('来|ます', 'き|ます', 'ki|masu'),
      b('来|ません', 'き|ません', 'ki|masen'),
      b('来|ました', 'き|ました', 'ki|mashita'),
      b('来|ませんでした', 'き|ませんでした', 'ki|masen deshita'),
    ],
    sade: [
      b('来|る', 'く|る', 'ku|ru'),
      b('来|ない', 'こ|ない', 'ko|nai'),
      b('来|た', 'き|た', 'ki|ta'),
      b('来|なかった', 'こ|なかった', 'ko|nakatta'),
    ],
    tr: ['Arkadaşım gelir. / Arkadaşım gelecek.', 'Arkadaşım gelmez. / Arkadaşım gelmeyecek.', 'Arkadaşım geldi.', 'Arkadaşım gelmedi.'],
    trSoru: ['Arkadaşın gelir mi?', 'Arkadaşın gelmez mi?', 'Arkadaşın geldi mi?', 'Arkadaşın gelmedi mi?'],
    not: '来る düzensiz: aynı kanji き (来ます, 来た), く (来る) ve こ (来ない) okunur.',
  },
  {
    id: 'aru',
    tur: 'fiil',
    kelime: 'ある',
    cins: 'var olmak',
    anlam: 'var (cansız)',
    bas: { ja: '時間が', kana: 'じかんが', latin: 'jikan ga' },
    kibar: [
      b('あり|ます', 'あり|ます', 'ari|masu'),
      b('あり|ません', 'あり|ません', 'ari|masen'),
      b('あり|ました', 'あり|ました', 'ari|mashita'),
      b('あり|ませんでした', 'あり|ませんでした', 'ari|masen deshita'),
    ],
    sade: [b('あ|る', 'あ|る', 'a|ru'), b('|ない', '|ない', '|nai'), b('あ|った', 'あ|った', 'a|tta'), b('|なかった', '|なかった', '|nakatta')],
    tr: ['Vaktim var. / Vaktim olacak.', 'Vaktim yok. / Vaktim olmayacak.', 'Vaktim vardı.', 'Vaktim yoktu.'],
    trSoru: ['Vaktin var mı?', 'Vaktin yok mu?', 'Vaktin var mıydı?', 'Vaktin yok muydu?'],
    not: 'ある’un sade olumsuzu ない’dır (あらない diye bir biçim yok). Canlılar için いる kullanılır.',
  },
  {
    id: 'gakusei',
    tur: 'isim',
    kelime: '学生',
    cins: 'isim',
    anlam: 'öğrenci',
    bas: { ja: 'エフェさんは', kana: 'えふぇさんは', latin: 'efe san wa' },
    kibar: [
      b('学生|です', 'がくせい|です', 'gakusei |desu'),
      b('学生|じゃないです', 'がくせい|じゃないです', 'gakusei |ja nai desu'),
      b('学生|でした', 'がくせい|でした', 'gakusei |deshita'),
      b('学生|じゃなかったです', 'がくせい|じゃなかったです', 'gakusei |ja nakatta desu'),
    ],
    sade: [
      b('学生|だ', 'がくせい|だ', 'gakusei |da'),
      b('学生|じゃない', 'がくせい|じゃない', 'gakusei |ja nai'),
      b('学生|だった', 'がくせい|だった', 'gakusei |datta'),
      b('学生|じゃなかった', 'がくせい|じゃなかった', 'gakusei |ja nakatta'),
    ],
    tr: ['Efe öğrenci(dir).', 'Efe öğrenci değil.', 'Efe öğrenciydi.', 'Efe öğrenci değildi.'],
    trSoru: ['Efe öğrenci mi?', 'Efe öğrenci değil mi?', 'Efe öğrenci miydi?', 'Efe öğrenci değil miydi?'],
    not: 'じゃないです’in daha resmî hâli じゃありません; geçmişi じゃありませんでした.',
  },
  {
    id: 'takai',
    tur: 'i',
    kelime: '高い',
    cins: 'い-sıfat',
    anlam: 'pahalı',
    bas: { ja: 'この本は', kana: 'このほんは', latin: 'kono hon wa' },
    kibar: [
      b('高|いです', 'たか|いです', 'taka|i desu'),
      b('高|くないです', 'たか|くないです', 'taka|kunai desu'),
      b('高|かったです', 'たか|かったです', 'taka|katta desu'),
      b('高|くなかったです', 'たか|くなかったです', 'taka|kunakatta desu'),
    ],
    sade: [
      b('高|い', 'たか|い', 'taka|i'),
      b('高|くない', 'たか|くない', 'taka|kunai'),
      b('高|かった', 'たか|かった', 'taka|katta'),
      b('高|くなかった', 'たか|くなかった', 'taka|kunakatta'),
    ],
    tr: ['Bu kitap pahalı.', 'Bu kitap pahalı değil.', 'Bu kitap pahalıydı.', 'Bu kitap pahalı değildi.'],
    trSoru: ['Bu kitap pahalı mı?', 'Bu kitap pahalı değil mi?', 'Bu kitap pahalı mıydı?', 'Bu kitap pahalı değil miydi?'],
    not: 'い-sıfatta geçmiş でした ile YAPILMAZ: 高いでした yanlış, 高かったです doğru.',
  },
  {
    id: 'ii',
    tur: 'i',
    kelime: 'いい',
    cins: 'い-sıfat (düzensiz)',
    anlam: 'iyi',
    bas: { ja: '天気は', kana: 'てんきは', latin: 'tenki wa' },
    kibar: [
      b('|いいです', '|いいです', '|ii desu'),
      b('よ|くないです', 'よ|くないです', 'yo|kunai desu'),
      b('よ|かったです', 'よ|かったです', 'yo|katta desu'),
      b('よ|くなかったです', 'よ|くなかったです', 'yo|kunakatta desu'),
    ],
    sade: [b('|いい', '|いい', '|ii'), b('よ|くない', 'よ|くない', 'yo|kunai'), b('よ|かった', 'よ|かった', 'yo|katta'), b('よ|くなかった', 'よ|くなかった', 'yo|kunakatta')],
    tr: ['Hava iyi.', 'Hava iyi değil.', 'Hava iyiydi.', 'Hava iyi değildi.'],
    trSoru: ['Hava iyi mi?', 'Hava iyi değil mi?', 'Hava iyi miydi?', 'Hava iyi değil miydi?'],
    not: 'いい düzensiz: olumsuzda ve geçmişte よ ile çekilir (いくない diye bir biçim yok).',
  },
  {
    id: 'shizuka',
    tur: 'isim',
    kelime: 'しずか',
    cins: 'な-sıfat',
    anlam: 'sakin',
    bas: { ja: 'この町は', kana: 'このまちは', latin: 'kono machi wa' },
    kibar: [
      b('しずか|です', 'しずか|です', 'shizuka |desu'),
      b('しずか|じゃないです', 'しずか|じゃないです', 'shizuka |ja nai desu'),
      b('しずか|でした', 'しずか|でした', 'shizuka |deshita'),
      b('しずか|じゃなかったです', 'しずか|じゃなかったです', 'shizuka |ja nakatta desu'),
    ],
    sade: [
      b('しずか|だ', 'しずか|だ', 'shizuka |da'),
      b('しずか|じゃない', 'しずか|じゃない', 'shizuka |ja nai'),
      b('しずか|だった', 'しずか|だった', 'shizuka |datta'),
      b('しずか|じゃなかった', 'しずか|じゃなかった', 'shizuka |ja nakatta'),
    ],
    tr: ['Bu kasaba sakin.', 'Bu kasaba sakin değil.', 'Bu kasaba sakindi.', 'Bu kasaba sakin değildi.'],
    trSoru: ['Bu kasaba sakin mi?', 'Bu kasaba sakin değil mi?', 'Bu kasaba sakin miydi?', 'Bu kasaba sakin değil miydi?'],
    not: 'な-sıfat isim gibi çekilir. きれい ve ゆうめい い ile bitse de な-sıfattır.',
  },
  {
    id: 'suki',
    tur: 'isim',
    kelime: '好き',
    cins: 'な-sıfat',
    anlam: 'sevilen',
    bas: { ja: '魚が', kana: 'さかなが', latin: 'sakana ga' },
    kibar: [
      b('好き|です', 'すき|です', 'suki |desu'),
      b('好き|じゃないです', 'すき|じゃないです', 'suki |ja nai desu'),
      b('好き|でした', 'すき|でした', 'suki |deshita'),
      b('好き|じゃなかったです', 'すき|じゃなかったです', 'suki |ja nakatta desu'),
    ],
    sade: [
      b('好き|だ', 'すき|だ', 'suki |da'),
      b('好き|じゃない', 'すき|じゃない', 'suki |ja nai'),
      b('好き|だった', 'すき|だった', 'suki |datta'),
      b('好き|じゃなかった', 'すき|じゃなかった', 'suki |ja nakatta'),
    ],
    tr: ['Balığı severim.', 'Balığı sevmem.', 'Balığı severdim.', 'Balığı sevmezdim.'],
    trSoru: ['Balık sever misin?', 'Balık sevmez misin?', 'Balık sever miydin?', 'Balık sevmez miydin?'],
    not: 'Türkçede “sevmek” fiil, Japoncada 好き sıfat. Sevilen şey を değil が alır.',
  },
]

/** Hangi ek neyi yapıyor — sonucun altında gösterilen kural */
export const DONUSUM_KURALI: Record<CumleTuru, { kibar: [string, string, string, string]; sade: [string, string, string, string] }> = {
  fiil: {
    kibar: [
      'ます: olumlu. Hem geniş zaman hem gelecek zaman.',
      'ます → ません: olumsuz.',
      'ます → ました: geçmiş.',
      'ます → ませんでした: olumsuz geçmiş (ません + でした).',
    ],
    sade: [
      'Sözlük biçimi: fiilin sözlükte yazan hâli.',
      'ない biçimi: ru-fiilde る → ない; u-fiilde son ses u → a + ない (行く → 行かない).',
      'た biçimi: て biçimindeki て → た, で → だ (食べて → 食べた, 飲んで → 飲んだ).',
      'ない → なかった.',
    ],
  },
  isim: {
    kibar: ['です: “-dir”.', 'です → じゃないです: “değil”.', 'です → でした: “-di”.', 'です → じゃなかったです: “değildi”.'],
    sade: ['です yerine だ.', 'だ → じゃない.', 'だ → だった.', 'だ → じゃなかった.'],
  },
  i: {
    kibar: [
      'い-sıfat + です.',
      'い → くない (+ です): “değil”.',
      'い → かった (+ です): “-di”. です aynen kalır, でした olmaz.',
      'い → くなかった (+ です): “değildi”.',
    ],
    sade: ['Sıfat tek başına; です yok (だ da eklenmez).', 'い → くない.', 'い → かった.', 'い → くなかった.'],
  },
}

export const SUREN_KURALI = {
  kibar: ['て biçimi + います: eylem şu an sürüyor.', 'て biçimi + いません: şu an yapmıyorum.'] as [string, string],
  sade: ['て biçimi + いる.', 'て biçimi + いない.'] as [string, string],
}

/** Türkçe zamanların Japonca karşılığı — sayfanın başındaki özet */
export const ZAMAN_OZETI: { tr: string; ja: string; latin: string; not: string }[] = [
  { tr: 'yaparım (geniş)', ja: '〜ます', latin: '-masu', not: 'Alışkanlık: 毎日食べます = her gün yerim.' },
  { tr: 'yapacağım (gelecek)', ja: '〜ます', latin: '-masu', not: 'Ayrı bir gelecek eki YOK. 明日食べます = yarın yiyeceğim; zamanı kelime gösterir.' },
  { tr: 'yapıyorum (şu an)', ja: '〜ています', latin: '-te imasu', not: 'て biçimi + います: 今食べています = şu an yiyorum.' },
  { tr: 'yaptım (geçmiş)', ja: '〜ました', latin: '-mashita', not: '昨日食べました = dün yedim.' },
  { tr: 'yapmam / yapmayacağım', ja: '〜ません', latin: '-masen', not: 'Olumsuz; yine geniş ve gelecek aynı.' },
  { tr: 'yapmadım', ja: '〜ませんでした', latin: '-masen deshita', not: 'Olumsuz geçmiş.' },
]

export const ZAMAN_KELIMELERI: Satir[] = [
  { ja: '今', kana: 'いま', latin: 'ima', tr: 'şimdi' },
  { ja: '今日', kana: 'きょう', latin: 'kyou', tr: 'bugün' },
  { ja: '明日', kana: 'あした', latin: 'ashita', tr: 'yarın' },
  { ja: '昨日', kana: 'きのう', latin: 'kinou', tr: 'dün' },
  { ja: '毎日', kana: 'まいにち', latin: 'mainichi', tr: 'her gün' },
  { ja: '来週', kana: 'らいしゅう', latin: 'raishuu', tr: 'gelecek hafta' },
  { ja: '先週', kana: 'せんしゅう', latin: 'senshuu', tr: 'geçen hafta' },
  { ja: 'いつも', latin: 'itsumo', tr: 'her zaman' },
  { ja: 'ときどき', latin: 'tokidoki', tr: 'bazen' },
]

// ————————————————————————— Zamirler —————————————————————————

export const ZAMIRLER: Satir[] = [
  { ja: '私', kana: 'わたし', latin: 'watashi', tr: 'ben', not: 'Herkes kullanır, kibar. En güvenlisi.', star: true },
  { ja: '僕', kana: 'ぼく', latin: 'boku', tr: 'ben', not: 'Erkekler, samimi ortamda. Tanıman yeter.' },
  {
    ja: 'あなた',
    latin: 'anata',
    tr: 'sen / siz',
    not: 'Nadiren söylenir: soğuk ya da kaba kaçabilir. Yerine karşındakinin ADI + さん kullanılır.',
    star: true,
  },
  { ja: '彼', kana: 'かれ', latin: 'kare', tr: 'o (erkek)', not: '“Erkek arkadaş” anlamına da gelir.' },
  { ja: '彼女', kana: 'かのじょ', latin: 'kanojo', tr: 'o (kadın)', not: '“Kız arkadaş” anlamına da gelir.' },
  { ja: 'あの人', kana: 'あのひと', latin: 'ano hito', tr: 'o kişi', not: '彼 / 彼女 yerine en güvenli seçenek.', star: true },
  { ja: '私たち', kana: 'わたしたち', latin: 'watashitachi', tr: 'biz', not: 'たち çoğul yapar.' },
  { ja: 'みなさん', latin: 'minasan', tr: 'siz (hepiniz), herkes', not: 'Bir gruba seslenirken.' },
  { ja: '彼ら', kana: 'かれら', latin: 'karera', tr: 'onlar' },
  { ja: 'だれ', latin: 'dare', tr: 'kim', not: 'Kibar hâli どなた.' },
]

/** Zamir + ek: Türkçedeki hâl ekleri gibi */
export const ZAMIR_EKLERI: (Satir & { bicim: string; karsilik: string })[] = [
  { bicim: '私は', karsilik: 'ben (konu)', ja: '私は学生です。', kana: 'わたしはがくせいです。', latin: 'watashi wa gakusei desu.', tr: 'Ben öğrenciyim.' },
  {
    bicim: '私が',
    karsilik: 'ben (vurgulu özne)',
    ja: '私が行きます。',
    kana: 'わたしがいきます。',
    latin: 'watashi ga ikimasu.',
    tr: 'Ben gideceğim. (başkası değil)',
  },
  { bicim: '私の', karsilik: 'benim', ja: '私の本です。', kana: 'わたしのほんです。', latin: 'watashi no hon desu.', tr: 'Benim kitabım.' },
  {
    bicim: '私を',
    karsilik: 'beni',
    ja: '先生は私を待っています。',
    kana: 'せんせいはわたしをまっています。',
    latin: 'sensei wa watashi o matte imasu.',
    tr: 'Öğretmen beni bekliyor.',
  },
  { bicim: '私に', karsilik: 'bana', ja: '私に本をください。', kana: 'わたしにほんをください。', latin: 'watashi ni hon o kudasai.', tr: 'Bana kitap verin lütfen.' },
  { bicim: '私と', karsilik: 'benimle', ja: '私と行きませんか。', kana: 'わたしといきませんか。', latin: 'watashi to ikimasen ka.', tr: 'Benimle gelmez misin?' },
  { bicim: '私も', karsilik: 'ben de', ja: '私も行きます。', kana: 'わたしもいきます。', latin: 'watashi mo ikimasu.', tr: 'Ben de gidiyorum.' },
]

export const ZAMIR_KURALLARI: { baslik: string; govde: string; ornek?: Satir; star?: boolean }[] = [
  {
    baslik: 'Zamir çoğu zaman söylenmez',
    govde:
      'Türkçede “geliyorum” derken “ben” demediğin gibi. Japoncada fiil kişiye göre çekilmez ama kim olduğu bağlamdan anlaşılır. 私は yalnızca konuyu ilk kez açarken ya da “ben ise…” diye karşılaştırırken söylenir.',
    ornek: { ja: '明日、学校へ行きます。', kana: 'あした、がっこうへいきます。', latin: 'ashita, gakkou e ikimasu.', tr: 'Yarın okula gidiyorum. (私は yok)' },
    star: true,
  },
  {
    baslik: '“Sen” yerine isim + さん',
    govde: 'Karşındakine あなた demek yerine adını söylersin. Aşağıdaki cümle Tanaka’nın kendisine söylenir.',
    ornek: { ja: '田中さんは学生ですか。', kana: 'たなかさんはがくせいですか。', latin: 'tanaka san wa gakusei desu ka.', tr: '(Tanaka,) sen öğrenci misin?' },
    star: true,
  },
  {
    baslik: 'Kendi adına さん eklenmez',
    govde: 'さん saygı ekidir; yalnızca başkaları için. Kendini tanıtırken エフェです dersin, エフェさんです demezsin.',
  },
  {
    baslik: 'Üçüncü kişi: isim ya da あの人',
    govde: '彼 ve 彼女 “sevgili” anlamı da taşıdığı için gündelik konuşmada kişinin adı ya da あの人 tercih edilir.',
    ornek: { ja: 'あの人は先生です。', kana: 'あのひとはせんせいです。', latin: 'ano hito wa sensei desu.', tr: 'O (kişi) öğretmen.' },
  },
  {
    baslik: 'İsimlerde çoğul yok',
    govde: '本 hem “kitap” hem “kitaplar” demektir. たち yalnızca insanlar için: 私たち (biz), 子どもたち (çocuklar), 田中さんたち (Tanaka ve yanındakiler).',
  },
]

export const SORU_KELIMELERI: (Satir & { kelime: string; anlam: string })[] = [
  { kelime: '何', anlam: 'ne', ja: 'これは何ですか。', kana: 'これはなんですか。', latin: 'kore wa nan desu ka.', tr: 'Bu ne?' },
  { kelime: 'だれ', anlam: 'kim', ja: 'あの人はだれですか。', kana: 'あのひとはだれですか。', latin: 'ano hito wa dare desu ka.', tr: 'O kişi kim?' },
  { kelime: 'どこ', anlam: 'nerede', ja: '駅はどこですか。', kana: 'えきはどこですか。', latin: 'eki wa doko desu ka.', tr: 'İstasyon nerede?' },
  { kelime: 'いつ', anlam: 'ne zaman', ja: 'いつ行きますか。', kana: 'いついきますか。', latin: 'itsu ikimasu ka.', tr: 'Ne zaman gidiyorsun?' },
  { kelime: 'どれ', anlam: 'hangisi (üç ve fazlası)', ja: 'どれがいいですか。', latin: 'dore ga ii desu ka.', tr: 'Hangisi iyi?' },
  {
    kelime: 'どちら',
    anlam: 'hangisi (ikisinden)',
    ja: 'どちらが好きですか。',
    kana: 'どちらがすきですか。',
    latin: 'dochira ga suki desu ka.',
    tr: 'Hangisini seversin?',
  },
  { kelime: 'どう', anlam: 'nasıl', ja: '日本語はどうですか。', kana: 'にほんごはどうですか。', latin: 'nihongo wa dou desu ka.', tr: 'Japonca nasıl?' },
  { kelime: 'どうして', anlam: 'neden', ja: 'どうして行きませんか。', kana: 'どうしていきませんか。', latin: 'doushite ikimasen ka.', tr: 'Neden gitmiyorsun?' },
  { kelime: 'いくら', anlam: 'kaç para', ja: 'これはいくらですか。', latin: 'kore wa ikura desu ka.', tr: 'Bu kaç para?' },
  { kelime: 'いくつ', anlam: 'kaç tane', ja: 'りんごはいくつありますか。', latin: 'ringo wa ikutsu arimasu ka.', tr: 'Kaç elma var?' },
  { kelime: '何時', anlam: 'saat kaç', ja: '今、何時ですか。', kana: 'いま、なんじですか。', latin: 'ima, nanji desu ka.', tr: 'Şu an saat kaç?' },
  { kelime: '何人', anlam: 'kaç kişi', ja: '家族は何人ですか。', kana: 'かぞくはなんにんですか。', latin: 'kazoku wa nannin desu ka.', tr: 'Ailen kaç kişi?' },
]

// ————————————————————————— Günlük cümleler —————————————————————————

export const GUNLUK: { baslik: string; alt: string; satirlar: Satir[] }[] = [
  {
    baslik: 'Selamlaşma',
    alt: 'Günün saatine göre değişir.',
    satirlar: [
      { ja: 'おはようございます。', latin: 'ohayou gozaimasu.', tr: 'Günaydın.', not: 'Öğlene kadar. Arkadaşa: おはよう.', star: true },
      { ja: 'こんにちは。', latin: 'konnichiwa.', tr: 'Merhaba, iyi günler.', not: 'Sondaki は “wa” okunur.', star: true },
      { ja: 'こんばんは。', latin: 'konbanwa.', tr: 'İyi akşamlar.' },
      { ja: 'おやすみなさい。', latin: 'oyasuminasai.', tr: 'İyi geceler.' },
      { ja: 'じゃあ、また。', latin: 'jaa, mata.', tr: 'Görüşürüz.', not: 'Gündelik vedalaşma.' },
      { ja: 'また明日。', kana: 'またあした。', latin: 'mata ashita.', tr: 'Yarın görüşürüz.' },
      { ja: 'さようなら。', latin: 'sayounara.', tr: 'Hoşça kal.', not: 'Uzun süre görüşmeyecekken; her gün söylenmez.' },
    ],
  },
  {
    baslik: 'Teşekkür ve özür',
    alt: 'すみません en çok işine yarayacak tek kelime.',
    satirlar: [
      { ja: 'ありがとうございます。', latin: 'arigatou gozaimasu.', tr: 'Teşekkür ederim.', star: true },
      { ja: 'どういたしまして。', latin: 'dou itashimashite.', tr: 'Rica ederim.' },
      { ja: 'すみません。', latin: 'sumimasen.', tr: 'Affedersiniz. / Pardon.', not: 'Özür, birine seslenme ve hafif teşekkür için.', star: true },
      { ja: 'ごめんなさい。', latin: 'gomen nasai.', tr: 'Özür dilerim.', not: 'Daha kişisel bir özür.' },
      { ja: 'だいじょうぶです。', latin: 'daijoubu desu.', tr: 'Sorun değil. / Gerek yok.' },
    ],
  },
  {
    baslik: 'Tanışma',
    alt: 'Kalıp sabittir; üçü birlikte söylenir.',
    satirlar: [
      { ja: 'はじめまして。', latin: 'hajimemashite.', tr: 'Memnun oldum. (ilk tanışmada)', star: true },
      { ja: 'エフェです。', latin: 'efe desu.', tr: 'Ben Efe.', not: 'Kendi adına さん eklenmez.' },
      { ja: 'よろしくおねがいします。', latin: 'yoroshiku onegaishimasu.', tr: 'Tanıştığımıza memnun oldum.', star: true },
      { ja: 'お名前は？', kana: 'おなまえは？', latin: 'onamae wa?', tr: 'Adınız?' },
      { ja: 'どこから来ましたか。', kana: 'どこからきましたか。', latin: 'doko kara kimashita ka.', tr: 'Nereden geldiniz? (Nerelisiniz?)' },
      { ja: 'トルコから来ました。', kana: 'とるこからきました。', latin: 'toruko kara kimashita.', tr: 'Türkiye’den geldim.' },
    ],
  },
  {
    baslik: 'Anlamadığında',
    alt: 'Konuşurken en çok bunlara ihtiyacın olacak.',
    satirlar: [
      { ja: 'わかりません。', latin: 'wakarimasen.', tr: 'Anlamadım. / Bilmiyorum.', star: true },
      { ja: 'もう一度おねがいします。', kana: 'もういちどおねがいします。', latin: 'mou ichido onegaishimasu.', tr: 'Bir kez daha lütfen.', star: true },
      { ja: 'ゆっくりおねがいします。', latin: 'yukkuri onegaishimasu.', tr: 'Yavaş lütfen.' },
      { ja: '日本語がすこしわかります。', kana: 'にほんごがすこしわかります。', latin: 'nihongo ga sukoshi wakarimasu.', tr: 'Biraz Japonca anlıyorum.' },
      { ja: 'これは日本語で何ですか。', kana: 'これはにほんごでなんですか。', latin: 'kore wa nihongo de nan desu ka.', tr: 'Bunun Japoncası ne?' },
    ],
  },
  {
    baslik: 'Dışarıda ve dükkânda',
    alt: 'Soru sormak ve bir şey istemek.',
    satirlar: [
      { ja: 'すみません、これはいくらですか。', latin: 'sumimasen, kore wa ikura desu ka.', tr: 'Affedersiniz, bu kaç para?' },
      { ja: 'これをください。', latin: 'kore o kudasai.', tr: 'Bunu alayım lütfen.', star: true },
      { ja: 'コーヒーはありますか。', latin: 'koohii wa arimasu ka.', tr: 'Kahve var mı?' },
      { ja: 'トイレはどこですか。', latin: 'toire wa doko desu ka.', tr: 'Tuvalet nerede?' },
      { ja: 'おねがいします。', latin: 'onegaishimasu.', tr: 'Lütfen. (rica ederken)' },
      { ja: 'けっこうです。', latin: 'kekkou desu.', tr: 'Hayır, gerek yok. / Yeterli.', not: 'Kibarca reddetmek için.' },
    ],
  },
  {
    baslik: 'Tepkiler',
    alt: 'Dinlediğini göstermek Japoncada konuşmanın yarısıdır.',
    satirlar: [
      { ja: 'はい。', latin: 'hai.', tr: 'Evet.' },
      { ja: 'いいえ。', latin: 'iie.', tr: 'Hayır.' },
      { ja: 'そうです。', latin: 'sou desu.', tr: 'Öyle. / Doğru.' },
      { ja: 'そうですね。', latin: 'sou desu ne.', tr: 'Öyle, haklısın.', not: 'Katılırken; düşünürken de söylenir.' },
      { ja: 'そうですか。', latin: 'sou desu ka.', tr: 'Öyle mi? / Anladım.', not: 'Soru değil; yeni bir şey öğrendiğinde.', star: true },
      { ja: 'いいですね。', latin: 'ii desu ne.', tr: 'Ne güzel. / İyi fikir.' },
      { ja: 'ちょっと…', latin: 'chotto…', tr: 'Biraz… (olmuyor)', not: 'Kibarca “hayır” demenin yolu; cümle bitirilmez.', star: true },
    ],
  },
  {
    baslik: 'Evde ve yemekte',
    alt: 'Türkçede tam karşılığı olmayan, söylenmesi beklenen kalıplar.',
    satirlar: [
      { ja: 'いただきます。', latin: 'itadakimasu.', tr: '(yemeğe başlarken söylenir)' },
      { ja: 'ごちそうさまでした。', latin: 'gochisousama deshita.', tr: '(yemek bitince: elinize sağlık)' },
      { ja: 'いってきます。', latin: 'ittekimasu.', tr: 'Ben çıkıyorum. (gidip geleceğim)' },
      { ja: 'いってらっしゃい。', latin: 'itterasshai.', tr: 'Güle güle git. (uğurlarken)' },
      { ja: 'ただいま。', latin: 'tadaima.', tr: 'Ben geldim.' },
      { ja: 'おかえりなさい。', latin: 'okaerinasai.', tr: 'Hoş geldin. (eve dönene)' },
    ],
  },
  {
    baslik: 'Hal hatır',
    alt: '',
    satirlar: [
      { ja: 'お元気ですか。', kana: 'おげんきですか。', latin: 'ogenki desu ka.', tr: 'Nasılsınız?', not: 'Bir süredir görmediğin birine; her gün sorulmaz.' },
      { ja: 'はい、元気です。', kana: 'はい、げんきです。', latin: 'hai, genki desu.', tr: 'İyiyim.' },
      { ja: 'おつかれさまでした。', latin: 'otsukaresama deshita.', tr: 'Eline sağlık. / Kolay gelsin. (iş bitince)' },
      { ja: 'がんばってください。', latin: 'ganbatte kudasai.', tr: 'Başarılar. / Kolay gelsin.' },
    ],
  },
]
