// Otomatik romajinin kelime bölmesini sınar (src/lib/ja-phonetic.ts romajiWords).
// Romaji öğrencinin okuma desteği: bitişik ("korewadarenokabandesuka") ya da
// yanlış yerden bölünmüş ("ka nji", "you ka") satır okunamaz. Buradaki her
// örnek bir zamanlar yanlış çıkmıştı ya da sık geçen bir kalıbı temsil ediyor.
// Çalıştır: npx tsx --tsconfig tsconfig.json scripts/check-romaji.ts
import { romajiWords } from '../src/lib/ja-phonetic'
import { UNITS } from '../src/content/ja/units'

const ORNEKLER: [string, string, string][] = [
  // Tamamen kanayla yazılmış öbek
  ['これはだれのかばんですか。', 'これはだれのかばんですか。', 'kore wa dare no kaban desu ka.'],
  ['とてもしずかです。', 'とてもしずかです。', 'totemo shizuka desu.'],
  ['あまりにぎやかじゃないです。', 'あまりにぎやかじゃないです。', 'amari nigiyaka ja nai desu.'],
  ['よかったです。', 'よかったです。', 'yokatta desu.'],
  ['ここでたばこをすわないでください。', 'ここでたばこをすわないでください。', 'koko de tabako o suwanai de kudasai.'],
  ['つめたいものを食べないでください。', 'つめたいものをたべないでください。', 'tsumetaimono o tabenaide kudasai.'],
  ['かおをあらってから、朝ご飯を食べます。', 'かおをあらってから、あさごはんをたべます。', 'kao o aratte kara, asagohan o tabemasu.'],
  // Kanjinin ardındaki ekler
  ['あまり高くないです。', 'あまりたかくないです。', 'amari takaku nai desu.'],
  ['ちょっと待ってください。', 'ちょっとまってください。', 'chotto matte kudasai.'],
  ['ここに座ってもいいですか。', 'ここにすわってもいいですか。', 'koko ni suwatte mo ii desu ka.'],
  ['東京に住んでいます。', 'とうきょうにすんでいます。', 'toukyou ni sunde imasu.'],
  ['ペンが三本あります。', 'ぺんがさんぼんあります。', 'pen ga sanbon arimasu.'],
  ['りんごを三つください。', 'りんごをみっつください。', 'ringo o mittsu kudasai.'],
  ['朝ご飯を食べませんでした。', 'あさごはんをたべませんでした。', 'asagohan o tabemasen deshita.'],
  ['日本に行ったことがあります。', 'にほんにいったことがあります。', 'nihon ni itta koto ga arimasu.'],
  ['来年、日本に行くつもりです。', 'らいねん、にほんにいくつもりです。', 'rainen, nihon ni iku tsumori desu.'],
  ['毎日くすりを飲まなければなりません。', 'まいにちくすりをのまなければなりません。', 'mainichi kusuri o nomanakereba narimasen.'],
  ['新しいかばんがほしいです。', 'あたらしいかばんがほしいです。', 'atarashii kaban ga hoshii desu.'],
  ['寒くなりました。', 'さむくなりました。', 'samuku narimashita.'],
  ['どこから来ましたか。', 'どこからきましたか。', 'doko kara kimashita ka.'],
  ['昨日、早く寝ました。', 'きのう、はやくねました。', 'kinou, hayaku nemashita.'],
  // Yan yana kanjili kelimeler
  ['毎日日本語をべんきょうします。', 'まいにちにほんごをべんきょうします。', 'mainichi nihongo o benkyoushimasu.'],
  ['九時から五時まで働きます。', 'くじからごじまではたらきます。', 'kuji kara goji made hatarakimasu.'],
  ['十時十分です。', 'じゅうじじゅっぷんです。', 'juuji juppun desu.'],
  ['七時半です。', 'しちじはんです。', 'shichiji han desu.'],
  ['火曜日は、朝七時に起きます。', 'かようびは、あさしちじにおきます。', 'kayoubi wa, asa shichiji ni okimasu.'],
  // Ad, saygı ön eki, ekler
  ['田中さんのお父さんは先生です。', 'たなかさんのおとうさんはせんせいです。', 'tanaka san no otousan wa sensei desu.'],
  ['コーヒーとお茶と、どちらが好きですか。', 'こーひーとおちゃと、どちらがすきですか。', 'koohii to ocha to, dochira ga suki desu ka.'],
  ['兄とはあまり話さない。', 'あにとはあまりはなさない。', 'ani to wa amari hanasanai.'],
  ['わたしは一年の中でなつが一番好きです。', 'わたしはいちねんのなかでなつがいちばんすきです。', 'watashi wa ichinen no naka de natsu ga ichiban suki desu.'],
  ['あそこにカフェもあります。', 'あそこにかふぇもあります。', 'asoko ni kafe mo arimasu.'],
  ['駅の後ろに古い本やがあります。', 'えきのうしろにふるいほんやがあります。', "eki no ushiro ni furui hon'ya ga arimasu."],
  // Tek kelime ve kalıplar bölünmemeli / doğru bölünmeli
  ['八日', 'ようか', 'youka'],
  ['お父さん', 'おとうさん', 'otousan'],
  ['学校', 'がっこう', 'gakkou'],
  ['こんにちは', 'こんにちは', 'konnichiwa'],
  ['ありがとうございます', 'ありがとうございます', 'arigatou gozaimasu'],
  ['よろしくおねがいします', 'よろしくおねがいします', 'yoroshiku onegaishimasu'],
  ['いいですね', 'いいですね', 'ii desu ne'],
]

let hata = 0
for (const [ja, kana, beklenen] of ORNEKLER) {
  const r = romajiWords(ja, kana)
  if (r !== beklenen) (hata++, console.log(`${ja}\n   beklenen: ${beklenen}\n   çıkan:    ${r}`))
}

// Ünite kelimeleri: tek kelime iki parçaya bölünmemeli (kalıp cümleler hariç).
// Bunlar gerçekten iki sözcük: katakana + kanji (トルコ人), この/あの + isim, 何 + も.
const IKI_SOZCUK = new Set(['トルコ人', 'あの人', '何も'])
for (const u of UNITS)
  for (const v of u.vocab) {
    const r = romajiWords(v.ja, v.kana.split(/\s*\/\s*/)[0])
    const kalip = /(です|ます|ません|ございます|します|ですが|ですね|ですよ)$/.test(v.kana) || /\s/.test(v.tr) && /[、]/.test(v.ja)
    if (!kalip && !IKI_SOZCUK.has(v.ja) && r.trim().split(/\s+/).length > 1 && !/[一-鿿].*[一-鿿]/.test(v.ja))
      (hata++, console.log(`${u.id} kelime bölündü: ${v.ja} → ${r}`))
  }

console.log(`${ORNEKLER.length} örnek denetlendi.`)
if (hata) {
  console.log(`${hata} hata.`)
  process.exit(1)
}
console.log('Tamam.')
