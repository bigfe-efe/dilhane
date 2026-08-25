import type { GrammarPoint } from '@/types'

// Dilbilgisinin ikinci yarısı: Genki I'in 6–12. derslerinde işlenen yapılar.
//
// `genki` alanı yalnızca sıralama eşlemesidir — hangi konunun kitabın kaçıncı
// dersinde geçtiğini gösterir. Anlatımlar, örnek cümleler ve karşılaştırmalar
// tamamen bu uygulamaya özgüdür; kitaptan alıntı değildir.
//
// Anlatım ilkesi burada da aynı: her yapıyı Türkçedeki en yakın karşılığına
// bağla. Japonca, Türkçeyle aynı mantıkla (sondan eklemeli, yüklem sonda)
// çalıştığı için bu bağ neredeyse her zaman kurulabilir.

const g = (p: GrammarPoint): GrammarPoint => p

export const GRAMMAR_JA_2: GrammarPoint[] = [
  // ————————————————————————— Genki 6 —————————————————————————
  g({
    id: 'ja-kara-reason',
    lang: 'ja',
    genki: 6,
    title: 'から — "çünkü, ‑diği için"',
    level: 'N5',
    summaryTr: 'Sebep cümlesinin SONUNA から gelir; Türkçedeki "‑diği için" gibi.',
    explanationTr: `Türkçede "Yorgun**um, o yüzden** gitmiyorum" derken sebep önce gelir. Japonca da aynısını yapar ve sebebin sonuna **から** koyar:

疲れています**から**、行きません。 → "Yorgunum**, o yüzden** gitmiyorum."

Sıralama Türkçeyle birebir aynıdır: **sebep から sonuç**. İngilizcedeki *because* gibi başa gelmez, sona gelir — bu yüzden Türk için İngilizceden kolaydır.

から'dan önce hem kibar biçim (ます/です) hem sade biçim gelebilir:
- 高いですから、買いません。 (kibar)
- 高いから、買わない。 (sade, arkadaş arası)

Sebebi sonradan da söyleyebilirsin; o zaman iki ayrı cümle olur:
行きません。疲れていますから。 → "Gitmiyorum. Yorgunum çünkü."`,
    patterns: ['[sebep] から、[sonuç]', '[sonuç]。[sebep] から。'],
    examples: [
      { text: '寒いですから、コートを着ます。', reading: 'さむいですから、こーとをきます。', tr: 'Soğuk olduğu için mont giyiyorum.' },
      { text: '明日試験がありますから、今日勉強します。', reading: 'あしたしけんがありますから、きょうべんきょうします。', tr: 'Yarın sınav olduğu için bugün çalışıyorum.' },
      { text: 'このお店は安いですから、好きです。', reading: 'このおみせはやすいですから、すきです。', tr: 'Bu dükkân ucuz olduğu için seviyorum.' },
    ],
    pitfalls: [
      'から sebebin SONUNA gelir, başına değil. 「から寒いです」 yanlıştır.',
      'から ile ので arasında ton farkı vardır: から daha doğrudan, ので daha yumuşak ve resmî.',
    ],
    related: ['ja-node', 'ja-kara-made'],
  }),

  // ————————————————————————— Genki 8 —————————————————————————
  g({
    id: 'ja-to-omoimasu',
    lang: 'ja',
    genki: 8,
    title: '～と思います — "…sanırım / bence…"',
    level: 'N5',
    summaryTr: 'Düşünceyi sade biçimde söyler, sonuna と思います eklersin.',
    explanationTr: `Türkçede "Yarın yağmur yağacak **sanırım**" dersin — düşünce ifadesi sona gelir. Japonca aynısını yapar:

明日雨が降る**と思います**。

**Kritik kural:** と'den önceki bölüm her zaman **sade biçimde** olur, kibar biçimde değil. Cümlenin kibarlığını sondaki 思います taşır.

| Yanlış | Doğru |
|---|---|
| 行きますと思います | 行く**と**思います |
| 高いですと思います | 高い**と**思います |
| 学生ですと思います | 学生**だ**と思います |

İsim ve な-sıfattan sonra **だ** gelmesi şarttır: 静か**だ**と思います.

Olumsuz düşünce için olumsuzluğu içeri koyarsın:
行かないと思います = "gitmeyecek sanırım" (doğal)
行くと思いません = "gideceğini sanmıyorum" (daha güçlü, daha nadir)`,
    patterns: ['[sade biçim] と思います', 'N/な-sıfat + だ + と思います'],
    examples: [
      { text: '田中さんは来ると思います。', reading: 'たなかさんはくるとおもいます。', tr: 'Tanaka bey gelir sanırım.' },
      { text: 'この本は面白いと思います。', reading: 'このほんはおもしろいとおもいます。', tr: 'Bu kitap ilginç bence.' },
      { text: '彼は学生だと思います。', reading: 'かれはがくせいだとおもいます。', tr: 'O öğrenci sanırım.' },
      { text: '明日は雨が降らないと思います。', reading: 'あしたはあめがふらないとおもいます。', tr: 'Yarın yağmur yağmaz sanırım.' },
    ],
    pitfalls: [
      'と\'den önce ます/です gelmez — sade biçim kullanılır.',
      'İsim ve な-sıfattan sonra だ düşürülmez: 学生だと思います.',
    ],
    related: ['ja-plain-form', 'ja-to-itteimashita'],
  }),
  g({
    id: 'ja-to-itteimashita',
    lang: 'ja',
    genki: 8,
    title: '～と言っていました — "…dedi / …diyordu"',
    level: 'N5',
    summaryTr: 'Başkasından duyduğunu aktarır; と\'den önce sade biçim gelir.',
    explanationTr: `Birinden duyduğun bir şeyi aktarmanın kalıbıdır. と思います ile aynı mantıkla çalışır: **と'den önce sade biçim**.

田中さんは「明日来ます」と言いました。 → doğrudan aktarım (tırnaklı)
田中さんは明日来る**と言っていました**。 → dolaylı aktarım

Türkçede "Tanaka yarın gelecek **demişti / diyordu**" dersin; Japonca da aynı yerde, cümlenin sonunda.

**言いました** ile **言っていました** farkı:
- 言いました — "dedi" (tek seferlik, olay olarak)
- 言っていました — "diyordu / demişti" (bilgiyi aktarırken tercih edilen biçim)

Başkasından duyduğunu aktarırken **言っていました** daha doğaldır; 言いました biraz "şahitlik ediyorum" tonu taşır.`,
    patterns: ['[kişi] は [sade biçim] と言っていました'],
    examples: [
      { text: '山田さんは今日忙しいと言っていました。', reading: 'やまださんはきょういそがしいといっていました。', tr: 'Yamada bugün meşgul olduğunu söylüyordu.' },
      { text: '母は明日来ると言っていました。', reading: 'はははあしたくるといっていました。', tr: 'Annem yarın geleceğini söyledi.' },
      { text: '先生は試験が難しいと言っていました。', reading: 'せんせいはしけんがむずかしいといっていました。', tr: 'Öğretmen sınavın zor olduğunu söylüyordu.' },
    ],
    pitfalls: ['と\'den önce sade biçim gelir; ます/です kullanılmaz.'],
    related: ['ja-to-omoimasu', 'ja-plain-form'],
  }),
  g({
    id: 'ja-naide-kudasai',
    lang: 'ja',
    genki: 8,
    title: '～ないでください — "lütfen …me"',
    level: 'N5',
    summaryTr: 'ない biçimine でください eklenerek kibar olumsuz rica kurulur.',
    explanationTr: `てください "lütfen yap" demekti; bunun olumsuzu **ないでください** "lütfen yapma"dır.

Kuruluş basit: fiilin **ない biçimini** al, ない'yi bozmadan **でください** ekle.

食べる → 食べ**ない** → 食べ**ないでください**
飲む → 飲ま**ない** → 飲ま**ないでください**
する → し**ない** → し**ないでください**

Türkçedeki "lütfen ‑me/‑ma" ile birebir örtüşür. Tabelalarda ve uyarılarda çok görülür:

写真を撮らないでください。 → "Lütfen fotoğraf çekmeyin."

Daha sert yasak için **てはいけません** kullanılır; ないでください rica tonundadır.`,
    patterns: ['V‑ない + でください'],
    examples: [
      { text: 'ここでたばこを吸わないでください。', reading: 'ここでたばこをすわないでください。', tr: 'Lütfen burada sigara içmeyin.' },
      { text: '心配しないでください。', reading: 'しんぱいしないでください。', tr: 'Lütfen endişelenmeyin.' },
      { text: '写真を撮らないでください。', reading: 'しゃしんをとらないでください。', tr: 'Lütfen fotoğraf çekmeyin.' },
    ],
    pitfalls: ['ない\'nin い\'si düşmez: 食べなくてください değil, 食べないでください.'],
    related: ['ja-te-form', 'ja-te-permission'],
  }),
  g({
    id: 'ja-no-nominalizer',
    lang: 'ja',
    genki: 8,
    title: 'の ile fiili isimleştirme — "…mek"',
    level: 'N5',
    summaryTr: 'Sade biçim + の, fiili isme çevirir: 読む → 読むの (okumak).',
    explanationTr: `Türkçede fiili "‑mek/‑mak" ekiyle isim yaparız: *oku‑mak*, *yüz‑mek*. Japoncada bu işi **の** görür.

Fiili **sade biçimde** bırak, arkasına **の** koy:
読む → 読む**の** = "okumak"
泳ぐ → 泳ぐ**の** = "yüzmek"

Sonrasında bu artık bir isimdir; her isim gibi eklerle kullanılır:

日本語を勉強する**のが**好きです。 → "Japonca çalışma**yı** severim."
料理を作る**のが**上手です。 → "Yemek yapma**kta** iyiyim."
朝早く起きる**のは**大変です。 → "Sabah erken kalkmak zor."

Sık kullanılan üç kalıp:
| Kalıp | Anlam |
|---|---|
| ～のが好きです | …mekten hoşlanırım |
| ～のが上手です / 下手です | …mekte iyiyim / kötüyüm |
| ～のは + sıfat | …mek (şöyle)dir |`,
    patterns: ['[sade biçim] の + が/は', '～のが好きです', '～のが上手です'],
    examples: [
      { text: '本を読むのが好きです。', reading: 'ほんをよむのがすきです。', tr: 'Kitap okumayı severim.' },
      { text: '彼は料理を作るのが上手です。', reading: 'かれはりょうりをつくるのがじょうずです。', tr: 'O yemek yapmakta iyi.' },
      { text: '朝早く起きるのは大変です。', reading: 'あさはやくおきるのはたいへんです。', tr: 'Sabah erken kalkmak zor.' },
    ],
    pitfalls: [
      'の\'dan önce ます biçimi gelmez: 読みますの değil, 読むの.',
      'こと de aynı işi görür (読むこと) ama günlük konuşmada の daha yaygındır.',
    ],
    related: ['ja-suki', 'ja-plain-form'],
  }),

  // ————————————————————————— Genki 9 —————————————————————————
  g({
    id: 'ja-noun-modify',
    lang: 'ja',
    genki: 9,
    title: 'Fiille isim niteleme — "…en / …dığı"',
    level: 'N5',
    summaryTr: 'Cümle, hiçbir bağlaç olmadan doğrudan ismin önüne gelip onu niteler.',
    explanationTr: `Bu, Japoncanın Türkçeye **en çok benzeyen** yapılarından biridir ve İngilizce konuşanların en zorlandığı yerdir.

Türkçede "dün gör**düğüm** film" deriz — niteleyen cümle ismin **önüne** gelir. Japonca da tam olarak bunu yapar:

昨日見た映画 → "dün izle**diğim** film"
京都に住んでいる友だち → "Kyoto'da yaşa**yan** arkadaş"

İngilizcede *the movie **that** I saw* diye araya bir bağlaç girer; Japoncada **hiçbir şey girmez**. Fiil sade biçimde, doğrudan ismin önünde durur.

**İki kural:**
1. Niteleyen fiil **sade biçimde** olur (ます değil).
2. Niteleyen cümlenin öznesi **は değil が** alır: 私**が**作った料理.

| Japonca | Türkçe |
|---|---|
| 私が作った料理 | benim yaptığım yemek |
| 日本語を話す人 | Japonca konuşan kişi |
| 昨日買った本 | dün aldığım kitap |
| 母が作ってくれたお弁当 | annemin yaptığı bento |`,
    patterns: ['[sade biçim] + isim', '[özne] が [fiil] + isim'],
    examples: [
      { text: '昨日見た映画は面白かったです。', reading: 'きのうみたえいがはおもしろかったです。', tr: 'Dün izlediğim film ilginçti.' },
      { text: '日本語を話す人はあまりいません。', reading: 'にほんごをはなすひとはあまりいません。', tr: 'Japonca konuşan kişi pek yok.' },
      { text: '母が作った料理はおいしいです。', reading: 'ははがつくったりょうりはおいしいです。', tr: 'Annemin yaptığı yemek lezzetli.' },
    ],
    pitfalls: [
      'Niteleyen cümlede は değil が kullanılır.',
      'Fiil sade biçimdedir: 「見ました映画」 yanlış, 「見た映画」 doğru.',
    ],
    related: ['ja-plain-form', 'ja-ga'],
  }),

  // ————————————————————————— Genki 10 —————————————————————————
  g({
    id: 'ja-ichiban',
    lang: 'ja',
    genki: 10,
    title: '一番 — "en …"',
    level: 'N5',
    summaryTr: 'Sıfatın önüne 一番 gelir; üstünlük derecesi böyle kurulur.',
    explanationTr: `Türkçede "**en** büyük" deriz; Japoncada sıfatın önüne **一番 (いちばん)** koyarsın. Sıfat hiç değişmez — Türkçedeki gibi ayrı bir kelime eklenir.

一番大きい = en büyük
一番好き = en sevdiğim

Kapsam belirtmek için **の中で** ("… içinde") kullanılır:

果物**の中で**、りんごが**一番**好きです。
→ "Meyveler**in içinde** elmayı **en** çok severim."

Soru sorarken:
日本料理**の中で**、何が**一番**好きですか。
→ "Japon yemekleri içinde en çok neyi seversin?"

Zaman/yer kapsamlarında の中で yerine で yeter:
クラス**で**一番背が高いです。 → "Sınıf**ta** en uzun boylu."`,
    patterns: ['[kapsam] の中で + 一番 + sıfat', '[isim] が一番 …です'],
    examples: [
      { text: '果物の中でりんごが一番好きです。', reading: 'くだもののなかでりんごがいちばんすきです。', tr: 'Meyveler içinde en çok elmayı severim.' },
      { text: '日本で一番高い山は富士山です。', reading: 'にほんでいちばんたかいやまはふじさんです。', tr: 'Japonya’daki en yüksek dağ Fuji’dir.' },
      { text: '何が一番難しいですか。', reading: 'なにがいちばんむずかしいですか。', tr: 'En zor olan ne?' },
    ],
    pitfalls: ['一番 sıfatı çekmez; sıfat normal hâlinde kalır.'],
    related: ['ja-yori-hou'],
  }),
  g({
    id: 'ja-naru',
    lang: 'ja',
    genki: 10,
    title: '～くなる / ～になる — "…leşmek, olmak"',
    level: 'N5',
    summaryTr: 'Değişimi anlatır; い-sıfat くなる, な-sıfat ve isim になる alır.',
    explanationTr: `Türkçedeki "‑leşmek" ve "olmak" karşılığıdır: *büyü**dü***, *öğretmen **oldu***.

Sıfat türüne göre bağlantı değişir:

| Tür | Kural | Örnek |
|---|---|---|
| い-sıfat | い → **く** + なる | 大きい → 大き**くなる** (büyümek) |
| な-sıfat | + **に** + なる | 静か → 静か**になる** (sessizleşmek) |
| İsim | + **に** + なる | 先生 → 先生**になる** (öğretmen olmak) |

Bu, sıfat bağlama kuralıyla aynı mantıktır: い-sıfat く hâline geçer, な-sıfat ve isim に alır. Bir kez öğrenince başka yerlerde de işine yarar.

Geçmişte "oldu" demek için なりました:
日本語が上手**になりました**。 → "Japoncam iyi**leşti**."

Zıt yönü de aynı yapıyla: 安**くなりました** (ucuzladı), 元気**になりました** (iyileşti).`,
    patterns: ['い-sıfat(く) + なる', 'な-sıfat/isim + に + なる'],
    examples: [
      { text: '寒くなりました。', reading: 'さむくなりました。', tr: 'Hava soğudu.' },
      { text: '日本語が上手になりました。', reading: 'にほんごがじょうずになりました。', tr: 'Japoncam iyileşti.' },
      { text: '兄は医者になりました。', reading: 'あにはいしゃになりました。', tr: 'Ağabeyim doktor oldu.' },
    ],
    pitfalls: ['い-sıfatta い düşer ve く gelir: 大きいになる değil, 大きくなる.'],
    related: ['ja-i-adj', 'ja-na-adj'],
  }),
  g({
    id: 'ja-tsumori',
    lang: 'ja',
    genki: 10,
    title: '～つもりです — "…mayı planlıyorum"',
    level: 'N5',
    summaryTr: 'Sade biçim + つもりです; kararlaştırılmış niyeti anlatır.',
    explanationTr: `Türkçedeki "‑mek niyetindeyim / ‑meyi düşünüyorum" karşılığıdır. Fiil **sade biçimde** kalır, arkasına **つもりです** gelir.

来年日本へ行く**つもりです**。 → "Gelecek yıl Japonya'ya gitmeyi planlıyorum."

Olumsuzu iki türlü kurulur, ikisi farklı şey söyler:
- 行か**ない**つもりです → "gitme**me** niyetindeyim" (gitmemeye karar verdim)
- 行くつもりは**ありません** → "gitmek gibi bir niyetim yok" (daha kesin ret)

**たい ile farkı önemlidir:**
- 行き**たい**です → "gitmek **istiyorum**" (arzu, henüz plan değil)
- 行く**つもりです** → "gitmeyi **planlıyorum**" (karar verilmiş)

Türkçede ikisini de "istiyorum" diye söyleyebiliriz; Japoncada ayrım nettir.`,
    patterns: ['[sade biçim] + つもりです', 'V‑ない + つもりです'],
    examples: [
      { text: '来年日本へ行くつもりです。', reading: 'らいねんにほんへいくつもりです。', tr: 'Gelecek yıl Japonya’ya gitmeyi planlıyorum.' },
      { text: '今日は勉強するつもりです。', reading: 'きょうはべんきょうするつもりです。', tr: 'Bugün ders çalışmayı planlıyorum.' },
      { text: '車を買わないつもりです。', reading: 'くるまをかわないつもりです。', tr: 'Araba almamayı düşünüyorum.' },
    ],
    pitfalls: ['つもり\'den önce ます gelmez: 行きますつもり yanlıştır.'],
    related: ['ja-tai', 'ja-plain-form'],
  }),

  // ————————————————————————— Genki 11 —————————————————————————
  g({
    id: 'ja-tari',
    lang: 'ja',
    genki: 11,
    title: '～たり～たりする — "…yapıp …yapmak"',
    level: 'N5',
    summaryTr: 'Örnek olarak birkaç eylem sayar; hepsi değil, bazıları demektir.',
    explanationTr: `Türkçede "kitap oku**dum, film izle**dim falan" derken sıraladıklarımızın hepsi değil, **örnek** olduğunu ima ederiz. Japoncanın bunun için özel bir yapısı vardır.

Kuruluş: fiilin **た biçimini** al, sonuna **り** ekle. Cümlenin sonuna **する** koy.

食べた → 食べ**たり**
飲んだ → 飲ん**だり**

週末は本を読ん**だり**、映画を見**たり**します。
→ "Hafta sonu kitap okur, film izlerim (falan)."

**て formuyla farkı kritiktir:**
- 本を読ん**で**、映画を見ます → sırayla: önce okudum, sonra izledim
- 本を読ん**だり**、映画を見**たり**します → örnekler: bunlar gibi şeyler yaparım, sıra önemli değil

Geçmişte: sondaki する → **しました**.
昨日は掃除したり、洗濯したりしました。`,
    patterns: ['V‑たり、V‑たり + します', 'V‑たり、V‑たり + しました'],
    examples: [
      { text: '週末は本を読んだり、映画を見たりします。', reading: 'しゅうまつはほんをよんだり、えいがをみたりします。', tr: 'Hafta sonu kitap okur, film izlerim.' },
      { text: '昨日は掃除したり、洗濯したりしました。', reading: 'きのうはそうじしたり、せんたくしたりしました。', tr: 'Dün temizlik yaptım, çamaşır yıkadım falan.' },
      { text: '公園で走ったり、歩いたりします。', reading: 'こうえんではしったり、あるいたりします。', tr: 'Parkta koşar, yürürüm.' },
    ],
    pitfalls: [
      'Son fiilden sonra する/します unutulmaz.',
      'た biçimini kur, sonra り ekle — ます biçiminden değil.',
    ],
    related: ['ja-te-form', 'ja-plain-form'],
  }),
  g({
    id: 'ja-koto-ga-aru',
    lang: 'ja',
    genki: 11,
    title: '～たことがあります — "…mişliğim var"',
    level: 'N5',
    summaryTr: 'Geçmişte bir kez bile yaşanmış deneyimi anlatır.',
    explanationTr: `Türkçede "Japonya'ya git**mişliğim var**" deriz — tam karşılığıdır. Fiilin **た biçimi** + **ことがあります**.

日本へ行っ**たことがあります**。 → "Japonya'ya gitmişliğim var."

**Sıradan geçmiş zamanla farkı önemlidir:**
- 日本へ行き**ました** → "Japonya'ya gittim" (belirli bir olay, ne zaman gittiğin bellidir)
- 日本へ行っ**たことがあります** → "gitmişliğim var" (hayat boyu deneyim, ne zaman önemli değil)

Bu yüzden "dün" gibi belirli bir zamanla kullanılmaz:
❌ 昨日行ったことがあります
✅ 昨日行きました

Olumsuz: ことが**ありません** → "hiç …medim".
寿司を食べたことがありません。 → "Hiç suşi yemedim."

Sıklık eklenebilir: 二回行ったことがあります (iki kez gitmişliğim var).`,
    patterns: ['V‑た + ことがあります', 'V‑た + ことがありません'],
    examples: [
      { text: '日本へ行ったことがあります。', reading: 'にほんへいったことがあります。', tr: 'Japonya’ya gitmişliğim var.' },
      { text: '寿司を食べたことがありません。', reading: 'すしをたべたことがありません。', tr: 'Hiç suşi yemedim.' },
      { text: '富士山を見たことがありますか。', reading: 'ふじさんをみたことがありますか。', tr: 'Fuji Dağı’nı gördün mü hiç?' },
    ],
    pitfalls: ['"Dün", "geçen hafta" gibi belirli zamanlarla kullanılmaz — o zaman normal geçmiş kullanılır.'],
    related: ['ja-plain-form', 'ja-arimasu-imasu'],
  }),
  g({
    id: 'ja-ya',
    lang: 'ja',
    genki: 11,
    title: 'や — "…falan, …gibi şeyler"',
    level: 'N5',
    summaryTr: 'İsimleri örnek olarak sıralar; と ise hepsini sayar.',
    explanationTr: `İki bağlaç da "ve" diye çevrilir ama anlamları farklıdır:

- **と** — sayılanların **hepsi** budur.
  かばんに本**と**ペン**と**ノートがあります。 → çantada tam olarak bu üçü var.

- **や** — sayılanlar **örnektir**, başkaları da vardır.
  かばんに本**や**ペンがあります。 → çantada kitap, kalem **falan** var (başka şeyler de var).

Türkçedeki "falan / gibi şeyler" tam karşılığıdır.

や genelde son kelimeden sonra **など** ile pekiştirilir:
本やペン**など**があります。 → "kitap, kalem gibi şeyler var."

Not: や yalnızca **isimleri** bağlar. Fiilleri örnek olarak saymak istersen ～たり～たり kullanılır.`,
    patterns: ['N や N', 'N や N など'],
    examples: [
      { text: 'かばんに本やペンがあります。', reading: 'かばんにほんやぺんがあります。', tr: 'Çantada kitap, kalem falan var.' },
      { text: '週末は掃除や洗濯などをします。', reading: 'しゅうまつはそうじやせんたくなどをします。', tr: 'Hafta sonu temizlik, çamaşır gibi işler yaparım.' },
      { text: '京都や大阪へ行きました。', reading: 'きょうとやおおさかへいきました。', tr: 'Kyoto, Osaka gibi yerlere gittim.' },
    ],
    pitfalls: ['や fiilleri bağlamaz; onun için ～たり～たり kullanılır.'],
    related: ['ja-tari'],
  }),

  // ————————————————————————— Genki 12 —————————————————————————
  g({
    id: 'ja-n-desu',
    lang: 'ja',
    genki: 12,
    title: '～んです — açıklama ve merak tonu',
    level: 'N5',
    summaryTr: 'Bir durumu açıklar veya sebebini sorar; Türkçedeki "…de ondan" tonu.',
    explanationTr: `Bu, Japoncanın en çok kullanılan ama ders kitaplarında en geç öğretilen yapılarından biridir. Doğrudan çevirisi yoktur; **ton** katar.

İki işi vardır:

**1. Açıklama yapmak** — "çünkü öyle bir durum var"
どうして来なかったんですか。 → "Neden gelmedin?" (merak/açıklama bekliyorum)
頭が痛かった**んです**。 → "Başım ağrıyordu **de ondan**."

**2. Merakla sormak** — kuru soru yerine ilgili soru
日本語を勉強しているんですか。 → "Japonca mı çalışıyorsun?" (ilgiyle)

**Bağlanma kuralı** — と思います ile aynı mantık, tek fark な:

| Önceki | Bağlantı | Örnek |
|---|---|---|
| Fiil (sade) | doğrudan | 行く**んです** |
| い-sıfat | doğrudan | 高い**んです** |
| な-sıfat | **な** | 静か**なんです** |
| İsim | **な** | 学生**なんです** |

Günlük konuşmada **の** hâline gelir: 行くの? / そうなの.

**Dikkat:** her cümleye んです eklemek yanlıştır — nesnel bilgi verirken kullanılmaz. 「私は学生なんです」 bir sebep bağlamı yoksa tuhaf durur.`,
    patterns: ['[sade biçim] + んです', 'な-sıfat/isim + な + んです'],
    examples: [
      { text: 'どうして来なかったんですか。', reading: 'どうしてこなかったんですか。', tr: 'Neden gelmedin?' },
      { text: '頭が痛いんです。', reading: 'あたまがいたいんです。', tr: 'Başım ağrıyor (de ondan).' },
      { text: '明日試験なんです。', reading: 'あしたしけんなんです。', tr: 'Yarın sınavım var (o yüzden).' },
    ],
    pitfalls: [
      'İsim ve な-sıfattan sonra な gerekir: 学生んです değil, 学生なんです.',
      'Her cümleye eklenmez; sebep/açıklama bağlamı olmalı.',
    ],
    related: ['ja-plain-form', 'ja-node'],
  }),
  g({
    id: 'ja-sugiru',
    lang: 'ja',
    genki: 12,
    title: '～すぎる — "fazla / çok aşırı"',
    level: 'N5',
    summaryTr: 'Olumsuz anlamda aşırılık: "gereğinden fazla".',
    explanationTr: `Türkçedeki "fazla" ile aynı olumsuz tonu taşır: *fazla pahalı*, *fazla yedim*. **とても** (çok) tarafsızken **すぎる** şikâyet içerir.

Kuruluş, kelimenin gövdesine すぎる eklemektir:

| Tür | Kural | Örnek |
|---|---|---|
| Fiil | ます gövdesi | 食べます → 食べ**すぎる** |
| い-sıfat | い düşer | 高い → 高**すぎる** |
| な-sıfat | doğrudan | 静か → 静か**すぎる** |

すぎる bir ichidan fiildir, normal çekilir: すぎます, すぎました, すぎて.

昨日食べ**すぎました**。 → "Dün fazla yedim."
この本は難し**すぎます**。 → "Bu kitap fazla zor."

İstisna: **いい** düzensizdir → **よすぎる**.`,
    patterns: ['V(ます gövdesi) + すぎる', 'い-sıfat(い düşer) + すぎる', 'な-sıfat + すぎる'],
    examples: [
      { text: '昨日食べすぎました。', reading: 'きのうたべすぎました。', tr: 'Dün fazla yedim.' },
      { text: 'この本は難しすぎます。', reading: 'このほんはむずかしすぎます。', tr: 'Bu kitap fazla zor.' },
      { text: 'この部屋は静かすぎます。', reading: 'このへやはしずかすぎます。', tr: 'Bu oda fazla sessiz.' },
    ],
    pitfalls: ['とても ile karıştırma: とても tarafsız "çok", すぎる şikâyetli "fazla".'],
    related: ['ja-i-adj'],
  }),
  g({
    id: 'ja-hou-ga-ii',
    lang: 'ja',
    genki: 12,
    title: '～ほうがいいです — "…sen iyi olur"',
    level: 'N5',
    summaryTr: 'Tavsiye verir. Olumlu tavsiyede た biçimi, olumsuzda ない biçimi gelir.',
    explanationTr: `Türkçedeki "‑sen iyi olur / ‑meli" karşılığıdır.

**Asıl dikkat edilecek nokta:** olumlu tavsiyede fiil **た biçiminde** olur, sözlük biçiminde değil. Bu, öğrencilerin en çok hata yaptığı yerlerden biridir.

| Tavsiye | Biçim | Örnek |
|---|---|---|
| Olumlu | **た** biçimi | 休ん**だ**ほうがいいです (dinlensen iyi olur) |
| Olumsuz | **ない** biçimi | 行か**ない**ほうがいいです (gitmesen iyi olur) |

Geçmiş biçim kullanılmasına rağmen cümle **gelecek/şimdi** hakkındadır — Türkçedeki "otursan iyi olur" da geçmiş ekli değil ama benzer bir kalıplaşmadır.

Bu yapı oldukça **doğrudan** bir tavsiyedir; yakın olmadığın birine söylerken dikkatli kullan. Daha yumuşağı: ～たらどうですか.`,
    patterns: ['V‑た + ほうがいいです', 'V‑ない + ほうがいいです'],
    examples: [
      { text: '疲れているから、休んだほうがいいです。', reading: 'つかれているから、やすんだほうがいいです。', tr: 'Yorgun olduğun için dinlensen iyi olur.' },
      { text: '今日は行かないほうがいいです。', reading: 'きょうはいかないほうがいいです。', tr: 'Bugün gitmesen iyi olur.' },
      { text: '薬を飲んだほうがいいですよ。', reading: 'くすりをのんだほうがいいですよ。', tr: 'İlaç içsen iyi olur.' },
    ],
    pitfalls: ['Olumlu tavsiyede sözlük biçimi değil, た biçimi kullanılır: 休むほうがいい yerine 休んだほうがいい.'],
    related: ['ja-plain-form', 'ja-nakereba'],
  }),
  g({
    id: 'ja-node',
    lang: 'ja',
    genki: 12,
    title: 'ので — "…diği için" (yumuşak sebep)',
    level: 'N5',
    summaryTr: 'から ile aynı işi görür ama daha yumuşak ve resmîdir.',
    explanationTr: `から gibi sebep bildirir, ama tonu farklıdır:

- **から** — doğrudan, kişisel gerekçe. "Çünkü ben öyle istiyorum."
- **ので** — yumuşak, nesnel. Özür dilerken, izin isterken, resmî ortamda tercih edilir.

Türkçede ikisi de "‑diği için" diye çevrilir; fark tondadır. Bir amirine ya da tanımadığın birine gerekçe sunuyorsan **ので** daha güvenlidir.

**Bağlanma kuralı**, んです ile aynıdır — な'ya dikkat:

| Önceki | Bağlantı |
|---|---|
| Fiil | doğrudan: 行く**ので** |
| い-sıfat | doğrudan: 高い**ので** |
| な-sıfat | **な**: 静か**なので** |
| İsim | **な**: 学生**なので** |

Kibar biçimle de kullanılabilir (行きますので) — bu daha da resmîdir.

用事がある**ので**、失礼します。 → "İşim olduğu için müsaadenizle."`,
    patterns: ['[sade biçim] + ので', 'な-sıfat/isim + な + ので'],
    examples: [
      { text: '用事があるので、失礼します。', reading: 'ようじがあるので、しつれいします。', tr: 'İşim olduğu için müsaadenizle.' },
      { text: '雨なので、行きません。', reading: 'あめなので、いきません。', tr: 'Yağmurlu olduğu için gitmiyorum.' },
      { text: '静かなので、よく眠れます。', reading: 'しずかなので、よくねむれます。', tr: 'Sessiz olduğu için iyi uyuyabiliyorum.' },
    ],
    pitfalls: ['İsim ve な-sıfattan sonra な gelir: 学生ので değil, 学生なので.'],
    related: ['ja-kara-reason', 'ja-n-desu'],
  }),
  g({
    id: 'ja-nakereba',
    lang: 'ja',
    genki: 12,
    title: '～なければいけません — "…mek zorundayım"',
    level: 'N5',
    summaryTr: 'Zorunluluk bildirir; ない biçiminden türetilir.',
    explanationTr: `Türkçedeki "‑mek zorundayım / ‑meliyim" karşılığıdır. Japoncada zorunluluk **çift olumsuzla** kurulur — yani "yapmazsam olmaz" denir.

**Kuruluş:** fiilin ない biçimini al, ない → **なければ** yap, sonra **いけません** ekle.

行かない → 行か**なければいけません** → "gitmek zorundayım"
勉強しない → 勉強し**なければいけません**

Günlük konuşmada kısalır — ikisi de çok yaygındır:
- 行か**なきゃ** (いけません düşer)
- 行か**ないと** (daha da kısa)

**なりません / いけません farkı** neredeyse yoktur; いけません daha yaygındır.

Zıddı — "yapmasan da olur":
行か**なくてもいいです** → "gitmene gerek yok."

Bu ikisini birlikte öğren; N5 sınavında sık karşılaştırılır.`,
    patterns: ['V‑なければいけません', 'V‑なきゃ (günlük)', 'V‑なくてもいいです (gerek yok)'],
    examples: [
      { text: '明日早く起きなければいけません。', reading: 'あしたはやくおきなければいけません。', tr: 'Yarın erken kalkmak zorundayım.' },
      { text: '薬を飲まなければいけません。', reading: 'くすりをのまなければいけません。', tr: 'İlaç içmem gerekiyor.' },
      { text: '今日は行かなくてもいいです。', reading: 'きょうはいかなくてもいいです。', tr: 'Bugün gitmene gerek yok.' },
    ],
    pitfalls: ['Çift olumsuz yapıdır; "yapmazsam olmaz" mantığını unutma.'],
    related: ['ja-te-permission', 'ja-hou-ga-ii'],
  }),
  g({
    id: 'ja-deshou',
    lang: 'ja',
    genki: 12,
    title: 'でしょう — "…dır herhâlde"',
    level: 'N5',
    summaryTr: 'Tahmin bildirir; sonu yükseltilirse onay ister.',
    explanationTr: `です'in tahmin hâlidir. Türkçedeki "‑dır herhâlde / muhtemelen" karşılığıdır.

明日は雨**でしょう**。 → "Yarın yağmurlu olur herhâlde." (hava durumunda hep bu kullanılır)

**Bağlanma:** sade biçimden sonra doğrudan gelir; isim ve な-sıfattan sonra だ **düşer**:
- 行く**でしょう** ✓
- 高い**でしょう** ✓
- 学生**でしょう** ✓ (学生だでしょう ✗)

**İki kullanımı vardır, ton belirler:**
1. Düz tahmin (ses düşer): 難しいでしょう。 → "Zordur herhâlde."
2. Onay isteme (ses yükselir): 難しいでしょう？ → "Zor, değil mi?"

**と思います ile farkı:** と思います kendi düşüncendir, でしょう daha genel/nesnel bir tahmindir. Hava durumu sunucusu 思います demez, でしょう der.

Daha kesin olmayan tahmin için **たぶん** eklenir: たぶん来ないでしょう。`,
    patterns: ['[sade biçim] + でしょう', 'N/な-sıfat + でしょう (だ düşer)'],
    examples: [
      { text: '明日は雨でしょう。', reading: 'あしたはあめでしょう。', tr: 'Yarın yağmurlu olur herhâlde.' },
      { text: 'この問題は難しいでしょう。', reading: 'このもんだいはむずかしいでしょう。', tr: 'Bu soru zordur herhâlde.' },
      { text: 'たぶん来ないでしょう。', reading: 'たぶんこないでしょう。', tr: 'Muhtemelen gelmez.' },
    ],
    pitfalls: ['İsimden sonra だ düşer: 学生だでしょう yanlıştır.'],
    related: ['ja-to-omoimasu'],
  }),
]
