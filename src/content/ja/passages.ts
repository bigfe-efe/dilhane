import type { Exercise, LessonSection } from '@/types'

// Okuma parçaları.
//
// Neden gerekli: tek tek kelime ve kalıp bilmek, onları bir arada okuyabilmek
// demek değildir. Bağlam içinde okumak kelimeyi de dilbilgisini de birbirine
// bağlar — ve Japoncanın boşluksuz yazımına ancak gerçek metinle alışılır.
//
// Kural: her parça, YALNIZCA o derse kadar öğretilmiş kelime ve yapıları
// kullanır. Metinlerde furigana `漢字[かんじ]` biçiminde yazılır; arayüz bunu
// kanjinin üstüne küçük kana olarak koyar ve istenirse gizler.

let n = 0
const pid = () => `ja-psg-${++n}`

const q = (prompt: string, options: string[], answer: number, explanation?: string): Exercise => ({
  id: pid(),
  type: 'mcq',
  prompt,
  options,
  answer,
  explanation,
  skill: 'reading',
})

const trq = (prompt: string, sentence: string, answers: string[], translation: string): Exercise => ({
  id: pid(),
  type: 'fill',
  prompt,
  sentence,
  answers,
  translation,
  skill: 'reading',
})

type Passage = Extract<LessonSection, { kind: 'passage' }>

/** Kendini tanıtma — Ünite 3 sonu. Sadece です・は・の・これ ile kurulu. */
export const PSG_JIKO_SHOUKAI: Passage = {
  kind: 'passage',
  title: 'Okuma: Kendini tanıtma',
  lang: 'ja',
  text: `はじめまして。私[わたし]はエフェです。トルコ人[じん]です。学生[がくせい]です。
私[わたし]の友[とも]だちは田中[たなか]さんです。田中[たなか]さんは日本人[にほんじん]です。学生[がくせい]じゃないです。先生[せんせい]です。
これは私[わたし]のかばんです。それは田中[たなか]さんの本[ほん]です。
よろしくおねがいします。`,
  reading:
    'はじめまして。わたしはえフェです。とるこじんです。がくせいです。わたしのともだちはたなかさんです。たなかさんはにほんじんです。がくせいじゃないです。せんせいです。これはわたしのかばんです。それはたなかさんのほんです。よろしくおねがいします。',
  tr: `Memnun oldum. Ben Efe'yim. Türkiyeliyim. Öğrenciyim.
Arkadaşım Tanaka bey. Tanaka bey Japon. Öğrenci değil. Öğretmen.
Bu benim çantam. Şu Tanaka beyin kitabı.
İyi ilişkiler dilerim.`,
  questions: [
    q('Efe hangi ülkeden?', ['Japonya', 'Türkiye', 'Çin', 'Kore'], 1, 'トルコ人 = Türkiyeli.'),
    q('Tanaka bey ne iş yapıyor?', ['Öğrenci', 'Öğretmen', 'Şirket çalışanı', 'Belirtilmemiş'], 1, '学生じゃないです。先生です。'),
    q('Kitap kimin?', ['Efe’nin', 'Tanaka beyin', 'Öğretmenin', 'Belli değil'], 1, 'それは田中さんの本です。'),
    q('「学生じゃないです」 ne demek?', ['Öğrenciyim', 'Öğrenci değilim', 'Öğrenci miyim?', 'Öğrenciydim'], 1, 'じゃないです kibar olumsuzdur.'),
  ],
}

/** Günlük rutin — Ünite 4, ます biçimi öğrenildikten sonra. */
export const PSG_ICHINICHI: Passage = {
  kind: 'passage',
  title: 'Okuma: Bir günüm',
  lang: 'ja',
  text: `毎日[まいにち]六時[ろくじ]におきます。あさごはんを食[た]べます。コーヒーを飲[の]みます。
七時[しちじ]半[はん]に学校[がっこう]へ行[い]きます。学校[がっこう]で日本語[にほんご]を勉強[べんきょう]します。
ひるごはんは友[とも]だちと食[た]べます。友[とも]だちはトルコ人[じん]です。
四時[よじ]に家[いえ]へ帰[かえ]ります。家[いえ]で本[ほん]を読[よ]みます。テレビを見[み]ます。
十一時[じゅういちじ]にねます。`,
  reading:
    'まいにちろくじにおきます。あさごはんをたべます。コーヒーをのみます。しちじはんにがっこうへいきます。がっこうでにほんごをべんきょうします。ひるごはんはともだちとたべます。ともだちはとるこじんです。よじにいえへかえります。いえでほんをよみます。テレビをみます。じゅういちじにねます。',
  tr: `Her gün altıda kalkarım. Kahvaltı yaparım. Kahve içerim.
Yedi buçukta okula giderim. Okulda Japonca çalışırım.
Öğle yemeğini arkadaşımla yerim. Arkadaşım Türkiyeli.
Dörtte eve dönerim. Evde kitap okurum. Televizyon izlerim.
On birde yatarım.`,
  questions: [
    q('Kaçta kalkıyor?', ['4', '6', '7:30', '11'], 1, '六時 = saat 6.'),
    q('Okula kaçta gidiyor?', ['6:00', '7:30', '4:00', '11:00'], 1, '七時半 = 7 buçuk.'),
    q('Japoncayı nerede çalışıyor?', ['Evde', 'Okulda', 'Kafede', 'Kütüphanede'], 1, '学校で — eylem yeri で ile.'),
    q('「家へ帰ります」 içindeki へ ne anlatıyor?', ['Yer (‑de)', 'Yön (‑e)', 'Nesne (‑i)', 'Araç (ile)'], 1, 'へ ve に yön gösterir; で eylem yeri.'),
    trq('Boşluğu doldur: "Evde kitap okurum."', '家 ___ 本を読みます。', ['で'], 'Evde kitap okurum.'),
  ],
}

/** Betimleme — Ünite 4, sıfatlar öğrenildikten sonra. */
export const PSG_WATASHI_NO_MACHI: Passage = {
  kind: 'passage',
  title: 'Okuma: Benim şehrim',
  lang: 'ja',
  text: `私[わたし]の町[まち]は大[おお]きいです。でも、しずかです。
駅[えき]の前[まえ]に新[あたら]しいカフェがあります。そのカフェのコーヒーはとてもおいしいです。高[たか]くないです。安[やす]いです。
駅[えき]の後[うし]ろに古[ふる]い本屋[ほんや]があります。その本屋[ほんや]は小[ちい]さいですが、面白[おもしろ]い本[ほん]がたくさんあります。
私[わたし]は毎週[まいしゅう]土曜日[どようび]にそこへ行[い]きます。`,
  reading:
    'わたしのまちはおおきいです。でも、しずかです。えきのまえにあたらしいカフェがあります。そのカフェのコーヒーはとてもおいしいです。たかくないです。やすいです。えきのうしろにふるいほんやがあります。そのほんやはちいさいですが、おもしろいほんがたくさんあります。わたしはまいしゅうどようびにそこへいきます。',
  tr: `Benim şehrim büyük. Ama sessiz.
İstasyonun önünde yeni bir kafe var. O kafenin kahvesi çok lezzetli. Pahalı değil. Ucuz.
İstasyonun arkasında eski bir kitapçı var. O kitapçı küçük ama ilginç kitapları çok.
Ben her hafta cumartesi oraya giderim.`,
  questions: [
    q('Kafe nerede?', ['İstasyonun arkasında', 'İstasyonun önünde', 'Kitapçının içinde', 'Şehrin dışında'], 1, '駅の前 = istasyonun önü.'),
    q('Kahve pahalı mı?', ['Evet, pahalı', 'Hayır, ucuz', 'Belirtilmemiş', 'Bedava'], 1, '高くないです。安いです。'),
    q('Kitapçı nasıl?', ['Yeni ve büyük', 'Eski ve küçük', 'Yeni ve küçük', 'Eski ve büyük'], 1, '古い + 小さい'),
    q('「高くないです」 hangi sıfat türünün olumsuzu?', ['な-sıfat', 'い-sıfat', 'Fiil', 'İsim'], 1, 'い düşer, くない gelir.'),
    trq('Boşluğu doldur: "Bu kafe sessiz."', 'このカフェは___です。', ['しずか', '静か'], 'Bu kafe sessiz.'),
  ],
}

/** Hafta programı — Ünite 5, gün kanjileri öğrenildikten sonra. */
export const PSG_ISSHUUKAN: Passage = {
  kind: 'passage',
  title: 'Okuma: Haftalık program',
  lang: 'ja',
  text: `月曜日[げつようび]と水曜日[すいようび]に日本語[にほんご]のクラスがあります。九時[くじ]から十二時[じゅうにじ]までです。
火曜日[かようび]は休[やす]みです。家[いえ]で本[ほん]を読[よ]みます。
木曜日[もくようび]の午後[ごご]、友[とも]だちに会[あ]います。いっしょにひるごはんを食[た]べます。
金曜日[きんようび]の夜[よる]、映画[えいが]を見[み]ます。
土曜日[どようび]と日曜日[にちようび]は買[か]い物[もの]をします。`,
  reading:
    'げつようびとすいようびににほんごのクラスがあります。くじからじゅうにじまでです。かようびはやすみです。いえでほんをよみます。もくようびのごご、ともだちにあいます。いっしょにひるごはんをたべます。きんようびのよる、えいがをみます。どようびとにちようびはかいものをします。',
  tr: `Pazartesi ve çarşamba Japonca dersi var. Dokuzdan on ikiye kadar.
Salı tatil. Evde kitap okurum.
Perşembe öğleden sonra arkadaşımla buluşurum. Birlikte öğle yemeği yeriz.
Cuma akşamı film izlerim.
Cumartesi ve pazar alışveriş yaparım.`,
  questions: [
    q('Japonca dersi hangi günler?', ['Salı ve perşembe', 'Pazartesi ve çarşamba', 'Cuma ve cumartesi', 'Her gün'], 1, '月曜日 = pazartesi, 水曜日 = çarşamba.'),
    q('Ders kaç saat sürüyor?', ['2 saat', '3 saat', '4 saat', '12 saat'], 1, '九時から十二時まで = 9’dan 12’ye, 3 saat.'),
    q('「から」 ve 「まで」 ne işe yarar?', ['Yer ve yön', 'Başlangıç ve bitiş', 'Özne ve nesne', 'Sebep ve sonuç'], 1),
    q('Arkadaşıyla ne zaman buluşuyor?', ['Salı sabahı', 'Perşembe öğleden sonra', 'Cuma akşamı', 'Pazar'], 1, '木曜日の午後'),
    trq('Boşluğu doldur: "Dokuzdan on ikiye kadar."', '九時___十二時まで', ['から'], 'Dokuzdan on ikiye kadar.'),
  ],
}

/** Aile — Ünite 5, insan/aile kanjileri. */
export const PSG_KAZOKU: Passage = {
  kind: 'passage',
  title: 'Okuma: Ailem',
  lang: 'ja',
  text: `私[わたし]の家族[かぞく]は四人[よにん]です。父[ちち]と母[はは]と姉[あね]と私[わたし]です。
父[ちち]は会社員[かいしゃいん]です。毎日[まいにち]電車[でんしゃ]で会社[かいしゃ]へ行[い]きます。
母[はは]は先生[せんせい]です。学校[がっこう]で日本語[にほんご]を教[おし]えます。
姉[あね]は大学生[だいがくせい]です。姉[あね]の名前[なまえ]はアイシェです。
私[わたし]たちは日曜日[にちようび]にいっしょにごはんを食[た]べます。`,
  reading:
    'わたしのかぞくはよにんです。ちちとははとあねとわたしです。ちちはかいしゃいんです。まいにちでんしゃでかいしゃへいきます。はははせんせいです。がっこうでにほんごをおしえます。あねはだいがくせいです。あねのなまえはアイシェです。わたしたちはにちようびにいっしょにごはんをたべます。',
  tr: `Ailem dört kişi. Babam, annem, ablam ve ben.
Babam şirket çalışanı. Her gün trenle şirkete gider.
Annem öğretmen. Okulda Japonca öğretir.
Ablam üniversite öğrencisi. Ablamın adı Ayşe.
Biz pazar günü birlikte yemek yeriz.`,
  questions: [
    q('Aile kaç kişi?', ['3', '4', '5', '6'], 1, '四人 = dört kişi.'),
    q('Baba işe nasıl gidiyor?', ['Yürüyerek', 'Trenle', 'Arabayla', 'Otobüsle'], 1, '電車で — araç で ile.'),
    q('「母」 kim?', ['Baba', 'Anne', 'Abla', 'Kardeş'], 1),
    q('Pazar günü ne yapıyorlar?', ['Alışverişe gidiyorlar', 'Birlikte yemek yiyorlar', 'Çalışıyorlar', 'Film izliyorlar'], 1),
    trq('Boşluğu doldur: "Trenle giderim."', '電車___行きます。', ['で'], 'Trenle giderim.'),
  ],
}

/** Kısa diyalog — Ünite 3, alışveriş/sorma. */
export const PSG_KAIWA_MISE: Passage = {
  kind: 'passage',
  title: 'Okuma: Dükkânda konuşma',
  lang: 'ja',
  text: `エフェ：すみません。これは何[なん]ですか。
店[みせ]の人[ひと]：それはおちゃです。日本[にほん]のおちゃです。
エフェ：いくらですか。
店[みせ]の人[ひと]：五百[ごひゃく]円[えん]です。
エフェ：じゃあ、これをおねがいします。
店[みせ]の人[ひと]：ありがとうございます。`,
  reading:
    'エフェ：すみません。これはなんですか。みせのひと：それはおちゃです。にほんのおちゃです。エフェ：いくらですか。みせのひと：ごひゃくえんです。エフェ：じゃあ、これをおねがいします。みせのひと：ありがとうございます。',
  tr: `Efe: Affedersiniz. Bu ne?
Dükkân görevlisi: O çay. Japon çayı.
Efe: Kaç para?
Dükkân görevlisi: 500 yen.
Efe: O zaman bunu alayım / bunu rica ediyorum.
Dükkân görevlisi: Teşekkür ederim.`,
  questions: [
    q('Efe ne satın alıyor?', ['Kahve', 'Çay', 'Kitap', 'Saat'], 1, 'おちゃ = çay.'),
    q('Fiyatı ne?', ['50 yen', '500 yen', '5.000 yen', 'Söylenmiyor'], 1, '五百円 = 500 yen.'),
    q('Efe 「これ」 diyor, görevli 「それ」 diyor. Neden?', ['Yanlışlık var', 'Nesne Efe’ye yakın, görevliye uzak', 'İkisi aynı şey değil', 'Kibarlık farkı'], 1, 'これ konuşana yakın, それ dinleyene yakın.'),
    q('「いくらですか」 ne sorar?', ['Nerede?', 'Kaç para?', 'Kim?', 'Ne zaman?'], 1),
  ],
}
