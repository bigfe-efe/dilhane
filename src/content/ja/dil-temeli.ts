import type { Satir } from './cumle-kur'

// "Dilin temeli" sayfasının temel konuları: cümle yapısı, kelime türleri ve
// fiil grupları, sıfatlar, bağlaçlar — ve bunların hangi sırayla öğrenileceği.
//
// NEDEN: öğrenci "temelleri öğrenmeden detaya giriyormuşum gibi" hissetti.
// Üniteler konuya göre ilerliyor (tanışma, alışveriş…) ve dilin iskeleti —
// cümle nasıl kurulur, kelime türleri neler, fiil hangi gruptan — hiçbir
// yerde bir arada anlatılmıyordu. İngilizce öğrenirken izlenen sıra (alfabe →
// zamirler → "to be" → fiil → olumsuz → soru → geçmiş…) burada Japoncaya
// uyarlandı ve her adım uygulamadaki yerine bağlandı.
//
// Romaji elle yazıldı; scripts/check-cumle-kur.ts okunuşla tutarlılığı denetler.

// ————————————————————————— Temel sıra —————————————————————————

export interface Adim {
  id: string
  baslik: string
  /** İngilizce öğrenirken bunun karşılığı */
  ingilizce: string
  ozet: string
  /** Uygulamada nerede */
  yerler: { ad: string; to: string }[]
}

export const TEMEL_SIRA: Adim[] = [
  {
    id: 'yazi',
    baslik: 'Yazı: hiragana ve katakana',
    ingilizce: 'alfabe',
    ozet: 'Her şeyin önkoşulu. Kanji bu aşamada değil; kelimelerle birlikte gelir.',
    yerler: [
      { ad: 'Hiragana', to: '/kana/hiragana' },
      { ad: 'Katakana', to: '/kana/katakana' },
      { ad: 'Yazım kuralları', to: '/kana-kurallar' },
    ],
  },
  {
    id: 'yapi',
    baslik: 'Cümle yapısı',
    ingilizce: 'word order',
    ozet: 'Yüklem sonda, ekler kelimenin görevini gösterir. Türkçeyle neredeyse aynı.',
    yerler: [{ ad: 'Cümle yapısı', to: '/cumle?b=yapi' }],
  },
  {
    id: 'turler',
    baslik: 'Kelime türleri ve fiil grupları',
    ingilizce: 'parts of speech',
    ozet: 'İsim, fiil, iki tür sıfat, ek. Bir fiilin nasıl çekileceği hangi gruptan olduğuna bağlı.',
    yerler: [{ ad: 'Kelime türleri', to: '/cumle?b=turler' }],
  },
  {
    id: 'zamir',
    baslik: 'Zamirler ve bu · şu · o',
    ingilizce: 'I, you, he · this, that',
    ozet: 'Ben, sen, o; bu, şu, o. Zamirin ne zaman söylenmediği de bu adımda.',
    yerler: [
      { ad: 'Zamirler', to: '/cumle?b=zamirler' },
      { ad: 'Bu · şu · o', to: '/temel?b=kosoado' },
    ],
  },
  {
    id: 'desu',
    baslik: 'です cümlesi: “A, B’dir”',
    ingilizce: 'to be (am, is, are)',
    ozet: 'İlk cümlen: 私は学生です. Olumsuzu じゃないです, sorusu か.',
    yerler: [
      { ad: 'Ünite 1', to: '/unite/u1' },
      { ad: 'Kendini tanıt', to: '/temel?b=tanitim' },
    ],
  },
  {
    id: 'ekler',
    baslik: 'Ekler: は・が・を・に・で・の',
    ingilizce: 'prepositions (in, on, at, to)',
    ozet: 'Türkçedeki hâl ekleri gibi kelimenin sonuna gelir: -i, -e, -de, -in.',
    yerler: [{ ad: 'Ekler', to: '/temel?b=ekler' }],
  },
  {
    id: 'sayi',
    baslik: 'Sayılar, saat, tarih',
    ingilizce: 'numbers, time, dates',
    ozet: 'Her cümlede geçer; düzensiz okunuşlar ezber ister.',
    yerler: [
      { ad: 'Sayılar', to: '/temel?b=sayilar' },
      { ad: 'Saat', to: '/temel?b=saat' },
      { ad: 'Tarih', to: '/temel?b=tarih' },
    ],
  },
  {
    id: 'fiil',
    baslik: 'Fiil cümlesi: ます, olumsuz, geçmiş',
    ingilizce: 'present & past simple, negatives',
    ozet: 'ます / ません / ました / ませんでした. Dört biçim bütün fiillerde aynı.',
    yerler: [
      { ad: 'Cümleyi çevir', to: '/cumle?b=donustur' },
      { ad: 'Ünite 3', to: '/unite/u3' },
      { ad: 'Alıştırma', to: '/cumle?b=alistirma' },
    ],
  },
  {
    id: 'soru',
    baslik: 'Soru sormak',
    ingilizce: 'questions (what, who, where…)',
    ozet: 'Sona か; soru kelimesi cevabın geleceği yerde durur.',
    yerler: [{ ad: 'Soru kelimeleri', to: '/cumle?b=zamirler' }],
  },
  {
    id: 'sifat',
    baslik: 'Sıfatlar',
    ingilizce: 'adjectives',
    ozet: 'い ve な sıfatları: isimden önce, yüklem olarak, olumsuz ve geçmişte.',
    yerler: [
      { ad: 'Sıfatlar', to: '/cumle?b=sifat' },
      { ad: 'Ünite 7', to: '/unite/u7' },
    ],
  },
  {
    id: 'var',
    baslik: 'Var / yok ve yer bildirme',
    ingilizce: 'there is / there are',
    ozet: 'あります (cansız), います (canlı); üst, alt, iç, yan.',
    yerler: [{ ad: 'Ünite 5', to: '/unite/u5' }],
  },
  {
    id: 'baglac',
    baslik: 'Bağlaçlar ve sıklık',
    ingilizce: 'and, but, because · always, sometimes',
    ozet: 'İki cümleyi bağlamak ve ne sıklıkla yaptığını söylemek.',
    yerler: [{ ad: 'Bağlaçlar', to: '/cumle?b=baglac' }],
  },
  {
    id: 'te',
    baslik: 'て biçimi',
    ingilizce: 'please…, can I…?, -ing',
    ozet: 'Rica, izin, yasak ve “şu an yapıyorum”. N5’in ikinci yarısının anahtarı.',
    yerler: [{ ad: 'Ünite 9', to: '/unite/u9' }],
  },
  {
    id: 'gunluk',
    baslik: 'Günlük kalıp cümleler',
    ingilizce: 'everyday phrases',
    ozet: 'Bu adım sırayı beklemez: baştan itibaren, her gün birkaç tane.',
    yerler: [{ ad: 'Günlük cümleler', to: '/cumle?b=gunluk' }],
  },
]

// ————————————————————————— Cümle yapısı —————————————————————————

/** Cümlenin yapı taşı: tıklanınca cümleden çıkar ya da girer */
export interface Tas {
  id: string
  soru: string
  ja: string
  kana: string
  latin: string
  tr: string
  /** Yüklem çıkarılamaz */
  sabit?: boolean
}

export const ISKELET: Tas[] = [
  { id: 'zaman', soru: 'ne zaman', ja: '明日', kana: 'あした', latin: 'ashita', tr: 'Yarın' },
  { id: 'konu', soru: 'kim (konu)', ja: '私は', kana: 'わたしは', latin: 'watashi wa', tr: 'ben' },
  { id: 'kiminle', soru: 'kiminle', ja: '友だちと', kana: 'ともだちと', latin: 'tomodachi to', tr: 'arkadaşımla' },
  { id: 'nerede', soru: 'nerede', ja: '家で', kana: 'いえで', latin: 'ie de', tr: 'evde' },
  { id: 'neyi', soru: 'neyi', ja: '日本語を', kana: 'にほんごを', latin: 'nihongo o', tr: 'Japonca' },
  { id: 'yuklem', soru: 'ne yapıyor (yüklem)', ja: 'べんきょうします', kana: 'べんきょうします', latin: 'benkyou shimasu', tr: 'çalışacağım', sabit: true },
]

export const YAPI_KURALLARI: { baslik: string; govde: string; ornekler?: Satir[]; star?: boolean }[] = [
  {
    baslik: 'Yüklem her zaman sonda',
    govde: 'Türkçedeki gibi: “Ben kitap okurum.” İngilizcedeki gibi ortada değil. Cümlenin ne dediğini anlamak için sona bakarsın.',
    ornekler: [{ ja: '私は本を読みます。', kana: 'わたしはほんをよみます。', latin: 'watashi wa hon o yomimasu.', tr: 'Ben kitap okurum.' }],
    star: true,
  },
  {
    baslik: 'Kelimenin görevini ek gösterir',
    govde:
      'Her kelimenin arkasındaki ek onun cümledeki işini söyler: は konu, を nesne, で yer, と birliktelik. Bu yüzden yüklem dışındaki parçaların sırası değişebilir; anlam bozulmaz.',
    ornekler: [
      { ja: '友だちと家で食べます。', kana: 'ともだちといえでたべます。', latin: 'tomodachi to ie de tabemasu.', tr: 'Arkadaşımla evde yerim.' },
      { ja: '家で友だちと食べます。', kana: 'いえでともだちとたべます。', latin: 'ie de tomodachi to tabemasu.', tr: 'Evde arkadaşımla yerim. (aynı anlam)' },
    ],
    star: true,
  },
  {
    baslik: 'Niteleyen, nitelenenin önünde',
    govde: 'Yine Türkçe gibi: sıfat, sahiplik ve açıklama ismin önüne gelir.',
    ornekler: [
      { ja: '新しい本', kana: 'あたらしいほん', latin: 'atarashii hon', tr: 'yeni kitap' },
      { ja: '私の本', kana: 'わたしのほん', latin: 'watashi no hon', tr: 'benim kitabım' },
      { ja: '日本語の先生', kana: 'にほんごのせんせい', latin: 'nihongo no sensei', tr: 'Japonca öğretmeni' },
    ],
  },
  {
    baslik: 'Soru için sıra değişmez',
    govde: 'İngilizcedeki gibi kelimelerin yeri değişmez; cümlenin sonuna か gelir. Soru kelimesi cevabın geleceği yerde durur.',
    ornekler: [
      { ja: '本を読みます。', kana: 'ほんをよみます。', latin: 'hon o yomimasu.', tr: 'Kitap okurum.' },
      { ja: '本を読みますか。', kana: 'ほんをよみますか。', latin: 'hon o yomimasu ka.', tr: 'Kitap okur musun?' },
      { ja: '何を読みますか。', kana: 'なにをよみますか。', latin: 'nani o yomimasu ka.', tr: 'Ne okursun?' },
    ],
  },
  {
    baslik: 'Bilinen söylenmez',
    govde: 'Bağlamdan anlaşılan parça düşer. Tek bir fiil tam bir cümledir.',
    ornekler: [{ ja: '行きます。', kana: 'いきます。', latin: 'ikimasu.', tr: 'Gidiyorum. / Gidiyoruz. / Gidiyor. (kim olduğu bağlamdan)' }],
  },
]

/** Dört cümle türü: yüklemin ne olduğuna göre */
export const CUMLE_TURLERI: (Satir & { tur: string; kalip: string })[] = [
  { tur: 'İsim cümlesi', kalip: 'A は B です', ja: '私は学生です。', kana: 'わたしはがくせいです。', latin: 'watashi wa gakusei desu.', tr: 'Ben öğrenciyim.' },
  { tur: 'Sıfat cümlesi', kalip: 'A は 〜いです / 〜です', ja: 'この本は高いです。', kana: 'このほんはたかいです。', latin: 'kono hon wa takai desu.', tr: 'Bu kitap pahalı.' },
  { tur: 'Fiil cümlesi', kalip: 'A は B を 〜ます', ja: '私は本を読みます。', kana: 'わたしはほんをよみます。', latin: 'watashi wa hon o yomimasu.', tr: 'Ben kitap okurum.' },
  {
    tur: 'Var / yok cümlesi',
    kalip: 'A に B が あります／います',
    ja: 'つくえの上に本があります。',
    kana: 'つくえのうえにほんがあります。',
    latin: 'tsukue no ue ni hon ga arimasu.',
    tr: 'Masanın üstünde kitap var.',
  },
]

/** Türkçeden farklı olan, ilk başta şaşırtan noktalar */
export const TURKCEDEN_FARKLAR: { baslik: string; govde: string }[] = [
  { baslik: 'Kişi eki yok', govde: '行きます hem “gidiyorum” hem “gidiyorsun” hem “gidiyor”. Fiil kişiye göre çekilmez.' },
  { baslik: 'Çoğul eki yok', govde: '本 = kitap ya da kitaplar. Sayı önemliyse sayaçla söylenir: 本を三さつ.' },
  { baslik: 'Gelecek zaman eki yok', govde: '行きます hem “giderim” hem “gideceğim”. 明日 gibi bir kelime geleceği gösterir.' },
  { baslik: 'Kibarlık dilbilgisinin parçası', govde: 'Aynı cümlenin kibar (です・ます) ve sade (arkadaş dili) hâli var. Sen kibar hâlle başlıyorsun; sınav ikisini de sorar.' },
  { baslik: '“var” için iki fiil', govde: 'Cansız için あります, canlı için います.' },
  { baslik: 'Sevmek ve istemek sıfat', govde: '好き (sevilen), ほしい (istenen): “balığı severim” yerine “balık sevilendir” gibi kurulur ve を değil が alır.' },
]

// ————————————————————————— Kelime türleri —————————————————————————

export const KELIME_TURLERI: { tur: string; japonca: string; aciklama: string; ornek: Satir }[] = [
  {
    tur: 'İsim',
    japonca: '名詞',
    aciklama: 'Çekilmez, çoğul almaz. Görevini arkasındaki ek gösterir.',
    ornek: { ja: '本、学生、日本', kana: 'ほん、がくせい、にほん', latin: 'hon, gakusei, nihon', tr: 'kitap, öğrenci, Japonya' },
  },
  {
    tur: 'Fiil',
    japonca: '動詞',
    aciklama: 'Cümlenin sonunda durur; olumsuzluk, zaman ve kibarlık fiile eklenir. Üç gruba ayrılır.',
    ornek: { ja: '食べる、行く、する', kana: 'たべる、いく、する', latin: 'taberu, iku, suru', tr: 'yemek, gitmek, yapmak' },
  },
  {
    tur: 'い-sıfat',
    japonca: 'い形容詞',
    aciklama: 'い ile biter ve fiil gibi kendisi çekilir: 高い → 高くない → 高かった.',
    ornek: { ja: '高い、新しい、おいしい', kana: 'たかい、あたらしい、おいしい', latin: 'takai, atarashii, oishii', tr: 'pahalı, yeni, lezzetli' },
  },
  {
    tur: 'な-sıfat',
    japonca: 'な形容詞',
    aciklama: 'İsim gibi davranır: です ile çekilir, isimden önce な alır.',
    ornek: { ja: 'しずか、きれい、好き', kana: 'しずか、きれい、すき', latin: 'shizuka, kirei, suki', tr: 'sakin, güzel, sevilen' },
  },
  {
    tur: 'Ek',
    japonca: '助詞',
    aciklama: 'Kelimenin arkasına gelir, tek başına anlamı yoktur. Türkçedeki hâl ekleri gibi.',
    ornek: { ja: 'は、が、を、に、で、の', latin: 'wa, ga, o, ni, de, no', tr: 'konu, özne, -i, -e, -de, -in' },
  },
  {
    tur: 'Zarf',
    japonca: '副詞',
    aciklama: 'Fiili ya da sıfatı niteler; çekilmez, ek almaz.',
    ornek: { ja: 'とても、よく、ゆっくり', latin: 'totemo, yoku, yukkuri', tr: 'çok, sık sık, yavaşça' },
  },
  {
    tur: 'Sayaç',
    japonca: '助数詞',
    aciklama: 'Sayı tek başına söylenmez; sayılan şeye göre bir sayaç alır.',
    ornek: { ja: '三つ、二人、五枚', kana: 'みっつ、ふたり、ごまい', latin: 'mittsu, futari, gomai', tr: 'üç tane, iki kişi, beş (yassı şey)' },
  },
]

export interface FiilGrubu {
  ad: string
  japonca: string
  kural: string
  /** sözlük biçimi → ます biçimi */
  ornekler: { sozluk: string; masu: string; kana: string; latin: string; tr: string }[]
}

export const FIIL_GRUPLARI: FiilGrubu[] = [
  {
    ad: 'ru-fiil',
    japonca: '一段',
    kural: 'Sözlük biçimi -iru ya da -eru ile biter. Sondaki る düşer, yerine ます / ない / た gelir. En kolay grup.',
    ornekler: [
      { sozluk: '食べる', masu: '食べます', kana: 'たべる → たべます', latin: 'taberu → tabemasu', tr: 'yemek' },
      { sozluk: '見る', masu: '見ます', kana: 'みる → みます', latin: 'miru → mimasu', tr: 'görmek, izlemek' },
      { sozluk: '起きる', masu: '起きます', kana: 'おきる → おきます', latin: 'okiru → okimasu', tr: 'kalkmak' },
      { sozluk: '寝る', masu: '寝ます', kana: 'ねる → ねます', latin: 'neru → nemasu', tr: 'yatmak' },
    ],
  },
  {
    ad: 'u-fiil',
    japonca: '五段',
    kural: 'Geri kalan fiillerin hepsi. Sondaki u sesi i olur ve ます gelir: く → きます, む → みます, す → します.',
    ornekler: [
      { sozluk: '行く', masu: '行きます', kana: 'いく → いきます', latin: 'iku → ikimasu', tr: 'gitmek' },
      { sozluk: '飲む', masu: '飲みます', kana: 'のむ → のみます', latin: 'nomu → nomimasu', tr: 'içmek' },
      { sozluk: '話す', masu: '話します', kana: 'はなす → はなします', latin: 'hanasu → hanashimasu', tr: 'konuşmak' },
      { sozluk: '買う', masu: '買います', kana: 'かう → かいます', latin: 'kau → kaimasu', tr: 'satın almak' },
      { sozluk: '待つ', masu: '待ちます', kana: 'まつ → まちます', latin: 'matsu → machimasu', tr: 'beklemek' },
    ],
  },
  {
    ad: 'Düzensiz',
    japonca: '不規則',
    kural: 'Yalnızca iki fiil; ezberlenir. “isim + する” fiillerinin hepsi する gibi çekilir (べんきょうする).',
    ornekler: [
      { sozluk: 'する', masu: 'します', kana: 'する → します', latin: 'suru → shimasu', tr: 'yapmak' },
      { sozluk: '来る', masu: '来ます', kana: 'くる → きます', latin: 'kuru → kimasu', tr: 'gelmek' },
    ],
  },
]

/** る ile biten ama u-fiil olanlar: N5'in klasik tuzağı */
export const RU_GORUNUMLU_U: { sozluk: string; masu: string; kana: string; latin: string; tr: string }[] = [
  { sozluk: '帰る', masu: '帰ります', kana: 'かえる → かえります', latin: 'kaeru → kaerimasu', tr: 'eve dönmek' },
  { sozluk: '入る', masu: '入ります', kana: 'はいる → はいります', latin: 'hairu → hairimasu', tr: 'girmek' },
  { sozluk: '知る', masu: '知ります', kana: 'しる → しります', latin: 'shiru → shirimasu', tr: 'bilmek' },
  { sozluk: '切る', masu: '切ります', kana: 'きる → きります', latin: 'kiru → kirimasu', tr: 'kesmek' },
  { sozluk: '走る', masu: '走ります', kana: 'はしる → はしります', latin: 'hashiru → hashirimasu', tr: 'koşmak' },
]

/** u-fiilde son hece nasıl değişir */
export const U_FIIL_SONLARI: { son: string; masu: string; ornek: string; latin: string }[] = [
  { son: 'う', masu: 'います', ornek: '買う → 買います', latin: 'kau → kaimasu' },
  { son: 'く', masu: 'きます', ornek: '書く → 書きます', latin: 'kaku → kakimasu' },
  { son: 'ぐ', masu: 'ぎます', ornek: 'およぐ → およぎます', latin: 'oyogu → oyogimasu' },
  { son: 'す', masu: 'します', ornek: '話す → 話します', latin: 'hanasu → hanashimasu' },
  { son: 'つ', masu: 'ちます', ornek: '待つ → 待ちます', latin: 'matsu → machimasu' },
  { son: 'ぬ', masu: 'にます', ornek: '死ぬ → 死にます', latin: 'shinu → shinimasu' },
  { son: 'ぶ', masu: 'びます', ornek: 'あそぶ → あそびます', latin: 'asobu → asobimasu' },
  { son: 'む', masu: 'みます', ornek: '飲む → 飲みます', latin: 'nomu → nomimasu' },
  { son: 'る', masu: 'ります', ornek: '帰る → 帰ります', latin: 'kaeru → kaerimasu' },
]

// ————————————————————————— Sıfatlar —————————————————————————

export const SIFAT_KULLANIMI: { baslik: string; govde: string; i: Satir; na: Satir }[] = [
  {
    baslik: 'İsimden önce',
    govde: 'い-sıfat olduğu gibi gelir; な-sıfat araya な alır.',
    i: { ja: '高い本', kana: 'たかいほん', latin: 'takai hon', tr: 'pahalı kitap' },
    na: { ja: 'しずかな町', kana: 'しずかなまち', latin: 'shizuka na machi', tr: 'sakin kasaba' },
  },
  {
    baslik: 'Yüklem olarak',
    govde: 'İkisi de です ile biter; な burada kullanılmaz.',
    i: { ja: 'この本は高いです。', kana: 'このほんはたかいです。', latin: 'kono hon wa takai desu.', tr: 'Bu kitap pahalı.' },
    na: { ja: 'この町はしずかです。', kana: 'このまちはしずかです。', latin: 'kono machi wa shizuka desu.', tr: 'Bu kasaba sakin.' },
  },
  {
    baslik: 'Olumsuz',
    govde: 'い-sıfat kendisi çekilir (い → くない); な-sıfat isim gibi じゃない alır.',
    i: { ja: '高くないです。', kana: 'たかくないです。', latin: 'takakunai desu.', tr: 'Pahalı değil.' },
    na: { ja: 'しずかじゃないです。', latin: 'shizuka ja nai desu.', tr: 'Sakin değil.' },
  },
  {
    baslik: 'Geçmiş',
    govde: 'い → かった (です kalır); な-sıfatta です → でした.',
    i: { ja: '高かったです。', kana: 'たかかったです。', latin: 'takakatta desu.', tr: 'Pahalıydı.' },
    na: { ja: 'しずかでした。', latin: 'shizuka deshita.', tr: 'Sakindi.' },
  },
  {
    baslik: 'Zarf yapmak (“hızlıca, sessizce”)',
    govde: 'Fiili nitelemek için: い → く, な → に.',
    i: { ja: '早く起きます。', kana: 'はやくおきます。', latin: 'hayaku okimasu.', tr: 'Erken kalkarım.' },
    na: { ja: 'しずかに話します。', kana: 'しずかにはなします。', latin: 'shizuka ni hanashimasu.', tr: 'Sessizce konuşurum.' },
  },
  {
    baslik: 'İki sıfatı bağlamak (“ucuz ve lezzetli”)',
    govde: 'い → くて, な-sıfat + で. Sonuncusu normal biter.',
    i: { ja: '安くておいしいです。', kana: 'やすくておいしいです。', latin: 'yasukute oishii desu.', tr: 'Ucuz ve lezzetli.' },
    na: { ja: 'しずかできれいです。', latin: 'shizuka de kirei desu.', tr: 'Sakin ve güzel.' },
  },
]

export const SIFAT_TUZAKLARI: string[] = [
  'きれい (güzel, temiz), ゆうめい (ünlü) ve きらい (sevilmeyen) い ile biter ama な-sıfattır: きれいな町, きれいじゃないです.',
  'いい (iyi) düzensizdir: よくない, よかった, よくなかった.',
  'い-sıfatın geçmişi でした ile yapılmaz: 高いでした ✗ → 高かったです ✓.',
  'い-sıfattan sonra だ gelmez: 高いだ ✗. Sade hâli yalnızca 高い.',
]

/** Zıt anlamlı çiftler: birlikte öğrenmek ikisini de pekiştirir */
export const ZIT_CIFTLER: { a: Satir; b: Satir }[] = [
  { a: { ja: '大きい', kana: 'おおきい', latin: 'ookii', tr: 'büyük' }, b: { ja: '小さい', kana: 'ちいさい', latin: 'chiisai', tr: 'küçük' } },
  { a: { ja: '高い', kana: 'たかい', latin: 'takai', tr: 'pahalı; yüksek' }, b: { ja: '安い', kana: 'やすい', latin: 'yasui', tr: 'ucuz' } },
  { a: { ja: '新しい', kana: 'あたらしい', latin: 'atarashii', tr: 'yeni' }, b: { ja: '古い', kana: 'ふるい', latin: 'furui', tr: 'eski' } },
  { a: { ja: 'いい', latin: 'ii', tr: 'iyi' }, b: { ja: '悪い', kana: 'わるい', latin: 'warui', tr: 'kötü' } },
  { a: { ja: '暑い', kana: 'あつい', latin: 'atsui', tr: 'sıcak (hava)' }, b: { ja: '寒い', kana: 'さむい', latin: 'samui', tr: 'soğuk (hava)' } },
  { a: { ja: '長い', kana: 'ながい', latin: 'nagai', tr: 'uzun' }, b: { ja: '短い', kana: 'みじかい', latin: 'mijikai', tr: 'kısa' } },
  { a: { ja: '多い', kana: 'おおい', latin: 'ooi', tr: 'çok (sayıca)' }, b: { ja: '少ない', kana: 'すくない', latin: 'sukunai', tr: 'az' } },
  { a: { ja: '近い', kana: 'ちかい', latin: 'chikai', tr: 'yakın' }, b: { ja: '遠い', kana: 'とおい', latin: 'tooi', tr: 'uzak' } },
  { a: { ja: '早い', kana: 'はやい', latin: 'hayai', tr: 'erken' }, b: { ja: '遅い', kana: 'おそい', latin: 'osoi', tr: 'geç; yavaş' } },
  { a: { ja: '難しい', kana: 'むずかしい', latin: 'muzukashii', tr: 'zor' }, b: { ja: 'やさしい', latin: 'yasashii', tr: 'kolay' } },
  { a: { ja: 'おもしろい', latin: 'omoshiroi', tr: 'ilginç, eğlenceli' }, b: { ja: 'つまらない', latin: 'tsumaranai', tr: 'sıkıcı' } },
  { a: { ja: '忙しい', kana: 'いそがしい', latin: 'isogashii', tr: 'meşgul' }, b: { ja: 'ひま（な）', kana: 'ひま', latin: 'hima', tr: 'boş (vakti olan)' } },
  { a: { ja: '好き（な）', kana: 'すき', latin: 'suki', tr: 'sevilen' }, b: { ja: 'きらい（な）', kana: 'きらい', latin: 'kirai', tr: 'sevilmeyen' } },
  { a: { ja: '上手（な）', kana: 'じょうず', latin: 'jouzu', tr: 'usta, iyi' }, b: { ja: '下手（な）', kana: 'へた', latin: 'heta', tr: 'beceriksiz' } },
  { a: { ja: 'しずか（な）', kana: 'しずか', latin: 'shizuka', tr: 'sakin' }, b: { ja: 'にぎやか（な）', kana: 'にぎやか', latin: 'nigiyaka', tr: 'hareketli' } },
  { a: { ja: 'きれい（な）', kana: 'きれい', latin: 'kirei', tr: 'temiz, güzel' }, b: { ja: 'きたない', latin: 'kitanai', tr: 'kirli' } },
]

// ————————————————————————— Bağlaçlar ve zarflar —————————————————————————

export interface Baglac extends Satir {
  kelime: string
  anlam: string
  nerede: string
}

export const ISIM_BAGLAMA: Baglac[] = [
  { kelime: 'と', anlam: 've (hepsi sayılıyor)', nerede: 'iki isim arasında', ja: '本とえんぴつ', kana: 'ほんとえんぴつ', latin: 'hon to enpitsu', tr: 'kitap ve kalem' },
  { kelime: 'や', anlam: 've … gibi (örnekler)', nerede: 'iki isim arasında', ja: '本やざっし', kana: 'ほんやざっし', latin: 'hon ya zasshi', tr: 'kitap, dergi gibi şeyler' },
  { kelime: 'か', anlam: 'ya da', nerede: 'iki isim arasında', ja: 'コーヒーかお茶', kana: 'こーひーかおちゃ', latin: 'koohii ka ocha', tr: 'kahve ya da çay' },
  { kelime: 'も', anlam: 'de, da', nerede: 'ismin arkasında (は’nın yerine)', ja: '私も学生です。', kana: 'わたしもがくせいです。', latin: 'watashi mo gakusei desu.', tr: 'Ben de öğrenciyim.' },
]

export const CUMLE_BAGLAMA: Baglac[] = [
  {
    kelime: 'そして',
    anlam: 've, ayrıca',
    nerede: 'ikinci cümlenin başında',
    ja: '本を読みます。そして、寝ます。',
    kana: 'ほんをよみます。そして、ねます。',
    latin: 'hon o yomimasu. soshite, nemasu.',
    tr: 'Kitap okurum. Ve (sonra) yatarım.',
  },
  {
    kelime: 'それから',
    anlam: 'ondan sonra',
    nerede: 'ikinci cümlenin başında',
    ja: '食べます。それから、行きます。',
    kana: 'たべます。それから、いきます。',
    latin: 'tabemasu. sorekara, ikimasu.',
    tr: 'Yemek yerim. Ondan sonra giderim.',
  },
  {
    kelime: 'でも',
    anlam: 'ama',
    nerede: 'ikinci cümlenin başında',
    ja: '高いです。でも、おいしいです。',
    kana: 'たかいです。でも、おいしいです。',
    latin: 'takai desu. demo, oishii desu.',
    tr: 'Pahalı. Ama lezzetli.',
  },
  {
    kelime: 'が',
    anlam: 'ama',
    nerede: 'ilk cümlenin sonunda (tek cümle olur)',
    ja: '高いですが、おいしいです。',
    kana: 'たかいですが、おいしいです。',
    latin: 'takai desu ga, oishii desu.',
    tr: 'Pahalı ama lezzetli.',
  },
  {
    kelime: 'から',
    anlam: '… olduğu için',
    nerede: 'SEBEBİN sonunda; sebep önce, sonuç sonra',
    ja: '忙しいですから、行きません。',
    kana: 'いそがしいですから、いきません。',
    latin: 'isogashii desu kara, ikimasen.',
    tr: 'Meşgulüm, bu yüzden gitmiyorum.',
    star: true,
  },
  {
    kelime: 'だから',
    anlam: 'bu yüzden',
    nerede: 'ikinci cümlenin başında',
    ja: '忙しいです。だから、行きません。',
    kana: 'いそがしいです。だから、いきません。',
    latin: 'isogashii desu. dakara, ikimasen.',
    tr: 'Meşgulüm. Bu yüzden gitmiyorum.',
  },
  {
    kelime: '〜て',
    anlam: '-ip, ve (sırayla)',
    nerede: 'ilk fiilin て biçimi',
    ja: '起きて、コーヒーを飲みます。',
    kana: 'おきて、こーひーをのみます。',
    latin: 'okite, koohii o nomimasu.',
    tr: 'Kalkıp kahve içerim.',
  },
]

/** Ne sıklıkla: fiilden önce gelir; son ikisi olumsuz fiil ister */
export const SIKLIK: (Satir & { kelime: string; oran: number })[] = [
  { kelime: 'いつも', oran: 100, ja: 'いつも本を読みます。', kana: 'いつもほんをよみます。', latin: 'itsumo hon o yomimasu.', tr: 'Her zaman kitap okurum.' },
  { kelime: 'よく', oran: 75, ja: 'よく本を読みます。', kana: 'よくほんをよみます。', latin: 'yoku hon o yomimasu.', tr: 'Sık sık kitap okurum.' },
  { kelime: 'ときどき', oran: 45, ja: 'ときどき本を読みます。', kana: 'ときどきほんをよみます。', latin: 'tokidoki hon o yomimasu.', tr: 'Bazen kitap okurum.' },
  {
    kelime: 'あまり',
    oran: 15,
    ja: 'あまり本を読みません。',
    kana: 'あまりほんをよみません。',
    latin: 'amari hon o yomimasen.',
    tr: 'Pek kitap okumam.',
    not: 'Fiil OLUMSUZ olmalı.',
    star: true,
  },
  {
    kelime: 'ぜんぜん',
    oran: 0,
    ja: 'ぜんぜん本を読みません。',
    kana: 'ぜんぜんほんをよみません。',
    latin: 'zenzen hon o yomimasen.',
    tr: 'Hiç kitap okumam.',
    not: 'Fiil OLUMSUZ olmalı.',
    star: true,
  },
]

/** Derece zarfları: sıfattan önce */
export const DERECE: Satir[] = [
  { ja: 'とても高いです。', kana: 'とてもたかいです。', latin: 'totemo takai desu.', tr: 'Çok pahalı.' },
  { ja: 'すこし高いです。', kana: 'すこしたかいです。', latin: 'sukoshi takai desu.', tr: 'Biraz pahalı.' },
  { ja: 'ちょっと高いです。', kana: 'ちょっとたかいです。', latin: 'chotto takai desu.', tr: 'Biraz pahalı. (gündelik)' },
  { ja: 'あまり高くないです。', kana: 'あまりたかくないです。', latin: 'amari takakunai desu.', tr: 'Pek pahalı değil.', not: 'あまり olumsuzla.' },
  { ja: 'ぜんぜん高くないです。', kana: 'ぜんぜんたかくないです。', latin: 'zenzen takakunai desu.', tr: 'Hiç pahalı değil.', not: 'ぜんぜん olumsuzla.' },
]
