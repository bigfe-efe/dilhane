// Dış kaynaklar — video ve dinleme.
//
// NEDEN VAR:
// Uygulama okumayı, yazmayı ve dilbilgisini öğretiyor ama TELAFFUZ ve DİNLEME
// için gerçek Japonca ses gerekiyor. Bu makinede Japonca konuşma sesi kurulu
// olmadığı için uygulama Türkçe yaklaşık okumaya düşüyor; o okumayla telaffuz
// kurulmaz, hatta yanlış alışkanlık yerleşir. Boşluğu kapatan şey gerçek
// insanları dinlemek.
//
// ÇEVRİMDIŞI UYARISI:
// Uygulamanın geri kalanı tamamen çevrimdışıdır. BU sayfa istisnadır: video
// oynatmak internet gerektirir ve YouTube'a istek gider. Bu yüzden videolar
// ayrı bir sayfada duruyor, uygulamanın hiçbir çekirdek işlevi buna bağlı
// değil ve durum kullanıcıya açıkça söyleniyor.
//
// Gömme adresi olarak youtube-nocookie.com kullanılıyor: izleme başlamadan
// önce takip çerezi yazılmıyor.

export type ResourceKind = 'playlist' | 'channel'

export interface Resource {
  id: string
  title: string
  channel: string
  kind: ResourceKind
  /** playlist için YouTube liste kimliği */
  listId?: string
  /** Dışarıda açılacak adres */
  url: string
  desc: string
  /** Hangi rota aşamalarında öne çıkarılsın */
  stages: string[]
  /** Neden bu kaynak — körü körüne liste vermemek için */
  why: string
}

export const RESOURCE_GROUPS: { title: string; note: string; items: Resource[] }[] = [
  {
    title: 'Dinleme — anlayarak',
    note:
      'Başlangıçta en çok işe yarayan tür bu: konuşmacı basit Japonca kullanır, resim ve jestle destekler. Her kelimeyi anlamaya çalışma; genel anlamı yakalaman yeter.',
    items: [
      {
        id: 'cij-complete',
        title: 'Complete Beginner Japanese',
        channel: 'Comprehensible Japanese',
        kind: 'playlist',
        listId: 'PLPdNX2arS9Mb1iiA0xHkxj3KVwssHQxYP',
        url: 'https://www.youtube.com/playlist?list=PLPdNX2arS9Mb1iiA0xHkxj3KVwssHQxYP',
        desc: 'Sıfırdan başlayanlar için, tamamen Japonca ama görsellerle anlaşılır.',
        stages: ['hiragana', 'katakana', 'genki-1-4'],
        why: 'Hiç kelime bilmeden bile takip edebilirsin. Kulağın Japoncanın ritmine burada alışır.',
      },
      {
        id: 'cij-beginner',
        title: 'Beginner Japanese 日本語初級',
        channel: 'Comprehensible Japanese',
        kind: 'playlist',
        listId: 'PLPdNX2arS9MZ70r0Vi6d6dUazHb_3z2sd',
        url: 'https://www.youtube.com/playlist?list=PLPdNX2arS9MZ70r0Vi6d6dUazHb_3z2sd',
        desc: 'Bir üst seviye. Genki derslerine başladıktan sonra buna geç.',
        stages: ['genki-1-4', 'genki-5-8', 'genki-9-12', 'n5'],
        why: 'Öğrendiğin yapıları gerçek konuşma içinde duymak, ezberi kullanıma çevirir.',
      },
      {
        id: 'cij-kanal',
        title: 'Comprehensible Japanese (kanal)',
        channel: 'Comprehensible Japanese',
        kind: 'channel',
        url: 'https://www.youtube.com/@cijapanese/videos',
        desc: 'Bütün seviyeler, 1500+ video.',
        stages: ['hiragana', 'katakana', 'genki-1-4', 'genki-5-8', 'genki-9-12', 'n5'],
        why: 'Seviyene göre süzebileceğin en geniş arşiv.',
      },
    ],
  },
  {
    title: 'Dilbilgisi anlatımı',
    note: 'Uygulamadaki anlatımı okuduktan sonra aynı konuyu bir de anlatan birinden dinlemek, oturmasını hızlandırır.',
    items: [
      {
        id: 'ammo',
        title: 'Japanese Ammo with Misa',
        channel: 'Japanese Ammo with Misa',
        kind: 'channel',
        url: 'https://www.youtube.com/@JapaneseAmmowithMisa',
        desc: 'Mutlak başlangıç, dilbilgisi ve N5/N4 oynatma listeleri var.',
        stages: ['genki-1-4', 'genki-5-8', 'genki-9-12', 'n5'],
        why: 'Dilbilgisini “neden böyle” diye açıklıyor; kural ezberletmiyor. Edatlar ve fiil biçimleri için özellikle iyi.',
      },
      {
        id: 'taekim',
        title: 'Tae Kim — dilbilgisi',
        channel: 'Tae Kim',
        kind: 'channel',
        url: 'https://www.youtube.com/user/taekimjapanese/playlists',
        desc: 'Japoncayı ders kitabı sırasıyla değil, dilin kendi mantığıyla anlatır.',
        stages: ['genki-1-4', 'genki-5-8', 'genki-9-12'],
        why: 'Sade biçimi (普通形) merkeze alan yaklaşımı, ます biçimiyle başlayan kitaplardan farklı bir açı verir.',
      },
      {
        id: 'jfz',
        title: 'Learn Japanese From Zero!',
        channel: 'From Zero',
        kind: 'channel',
        url: 'https://www.youtube.com/user/yesjapan/videos',
        desc: 'Adım adım, çok yavaş tempoda ders serisi.',
        stages: ['katakana', 'genki-1-4'],
        why: 'Acele etmeyen anlatım; bir konuyu ilk kez görüyorsan rahatlatıcı.',
      },
    ],
  },
  {
    title: 'Kana ve kanji',
    note: 'Alfabeyi bitirdikten sonra bile ara ara dönmek iyi gelir.',
    items: [
      {
        id: 'punipuni',
        title: 'PuniPuniJapan',
        channel: 'PuniPuniJapan',
        kind: 'channel',
        url: 'https://www.youtube.com/user/PuniPuniJapan/featured',
        desc: 'Hiragana, katakana ve temel kelimeler; kısa ve görsel.',
        stages: ['hiragana', 'katakana'],
        why: 'Karakter hatırlatıcıları görsel — takıldığın harfler için işe yarar.',
      },
      {
        id: 'minori',
        title: 'Minori Education',
        channel: 'Minori',
        kind: 'channel',
        url: 'https://www.youtube.com/channel/UCrJyTHTBHFtTH4X_FBr94Lw',
        desc: 'N5–N4 odaklı, videolar Japonca, altyazılı.',
        stages: ['katakana', 'genki-1-4', 'genki-5-8', 'n5'],
        why: 'Sınav odaklı ve düzenli yükleniyor; N5 kelime ve dilbilgisi tekrarı için.',
      },
      {
        id: 'jpod',
        title: 'JapanesePod101',
        channel: 'JapanesePod101',
        kind: 'channel',
        url: 'https://www.youtube.com/user/japanesepod101/videos',
        desc: 'Geniş arşiv: dilbilgisi, kelime, kanji, dinleme.',
        stages: ['katakana', 'genki-1-4', 'genki-5-8', 'genki-9-12', 'n5'],
        why: 'Belirli bir konuyu ararken neredeyse her zaman bir videosu var.',
      },
    ],
  },
]

export const ALL_RESOURCES: Resource[] = RESOURCE_GROUPS.flatMap((g) => g.items)

/** Gömme adresi — nocookie alan adı, izleme öncesi takip çerezi yazmaz. */
export function embedUrl(r: Resource): string | null {
  if (r.kind !== 'playlist' || !r.listId) return null
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${r.listId}&rel=0`
}
