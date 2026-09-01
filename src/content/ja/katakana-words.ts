import { toRomaji } from 'wanakana'
// Katakana ile yazılan kelimeler — temalı, kaynağıyla birlikte.
//
// NEDEN HIRAGANA LİSTESİNDEN FARKLI KURULDU:
// Hiragana kelimeleri ezberlenir; katakana kelimeleri ÇÖZÜLÜR. Çünkü hemen
// hepsi yabancı kökenli ve kaynak kelimeyi tanıyorsan anlamı zaten biliyorsun.
// İş, sesi geri kurmakta: コーヒー’yi "ko-o-hi-i" diye sökebilen biri bir
// saniye sonra "coffee" der. Bu yüzden her satırda kaynak kelime yazıyor —
// asıl öğrenilen şey kelime değil, İngilizceden Japoncaya geçiş kalıbı.
//
// Kalıbı bir kez kavrayınca hiç görmediğin katakana kelimeleri de okursun.
// Bu yüzden liste "ezberlenecek 200 kelime" değil, kalıbın örnekleri gibi
// kullanılmalı.
//
// UYARI — her katakana kelime İngilizceden gelmez:
// パン Portekizceden, アルバイト Almancadan, イクラ Rusçadan gelir. Bir kısmı
// da Japonya’da üretilmiş sahte İngilizcedir (wasei-eigo): サラリーマン ve
// コンビニ İngilizcede bu anlamda yoktur. Bunlar `note` ile işaretlendi,
// çünkü İngilizceye güvenip yanlış tahmin edilen kelimeler tam bunlardır.

export type KataPos = 'isim' | 'fiil' | 'sıfat' | 'ülke' | 'ifade'

export interface KataWord {
  /** Katakana yazım */
  kana: string
  tr: string
  /** Geldiği kelime — kaynak dil İngilizce değilse başında belirtilir */
  from: string
  pos: KataPos
  /** Kelimeye özgü not: yalancı dost, wasei-eigo, kısaltma, ses tuzağı */
  note?: string
}

export interface KataTheme {
  id: string
  title: string
  desc: string
  words: KataWord[]
}

export const KATA_THEMES: KataTheme[] = [
  {
    id: 'yiyecek',
    title: 'Yiyecek ve içecek',
    desc: 'Katakananın en sık göründüğü yer: menüler.',
    words: [
      {
        kana: 'コーヒー',
        tr: 'kahve',
        from: 'coffee',
        pos: 'isim',
        note: 'İKİ uzatma var: コー ve ヒー. コヒ demek bambaşka bir şey; uzatmaları yutma.',
      },
      { kana: 'ジュース', tr: 'meyve suyu', from: 'juice', pos: 'isim' },
      { kana: 'ビール', tr: 'bira', from: 'Felemenkçe: bier', pos: 'isim', note: 'İngilizce "beer" değil, Felemenkçeden gelir. Ses yakın ama kaynak farklı.' },
      { kana: 'ミルク', tr: 'süt', from: 'milk', pos: 'isim', note: 'Japoncası da var: ぎゅうにゅう (牛乳). ミルク daha çok kahveye katılan süt için.' },
      { kana: 'ワイン', tr: 'şarap', from: 'wine', pos: 'isim' },
      { kana: 'パン', tr: 'ekmek', from: 'Portekizce: pão', pos: 'isim', note: 'İngilizce "pan" (tava) DEĞİL. Portekizli tüccarlardan 400 yıl önce girmiş.' },
      { kana: 'ケーキ', tr: 'pasta', from: 'cake', pos: 'isim' },
      { kana: 'チョコレート', tr: 'çikolata', from: 'chocolate', pos: 'isim', note: 'Konuşmada çoğu zaman チョコ diye kısaltılır.' },
      { kana: 'アイスクリーム', tr: 'dondurma', from: 'ice cream', pos: 'isim', note: 'Kısaltması アイス. Japoncada uzun kelimeler böyle kırpılır.' },
      { kana: 'サラダ', tr: 'salata', from: 'salad', pos: 'isim' },
      { kana: 'スープ', tr: 'çorba', from: 'soup', pos: 'isim' },
      { kana: 'パスタ', tr: 'makarna', from: 'İtalyanca: pasta', pos: 'isim' },
      { kana: 'ピザ', tr: 'pizza', from: 'İtalyanca: pizza', pos: 'isim' },
      { kana: 'ハンバーガー', tr: 'hamburger', from: 'hamburger', pos: 'isim' },
      { kana: 'サンドイッチ', tr: 'sandviç', from: 'sandwich', pos: 'isim', note: 'Küçük ッ "-wich" içindeki çift sessizi taşır: sandoiTCHi.' },
      { kana: 'チーズ', tr: 'peynir', from: 'cheese', pos: 'isim' },
      { kana: 'バター', tr: 'tereyağı', from: 'butter', pos: 'isim' },
      { kana: 'レストラン', tr: 'restoran', from: 'restaurant', pos: 'isim' },
      { kana: 'メニュー', tr: 'menü', from: 'menu', pos: 'isim', note: 'ニュー = nyu. Küçük ュ olmasa ニユー (ni-yu) olurdu, başka ses.' },
      { kana: 'レモン', tr: 'limon', from: 'lemon', pos: 'isim' },
      { kana: 'バナナ', tr: 'muz', from: 'banana', pos: 'isim' },
      { kana: 'トマト', tr: 'domates', from: 'tomato', pos: 'isim' },
      { kana: 'カレー', tr: 'köri', from: 'curry', pos: 'isim', note: 'Japonya’da カレーライス ulusal yemek sayılır; Hint körisinden farklıdır.' },
      { kana: 'ラーメン', tr: 'ramen', from: 'Çince: 拉麺', pos: 'isim', note: 'Çinceden geldiği için katakana yazılır — katakana sadece Batı dilleri için değil.' },
    ],
  },

  {
    id: 'ulke',
    title: 'Ülkeler, diller, insanlar',
    desc: 'Ülke adları katakana; sonuna 人 (じん) gelince halkı, 語 (ご) gelince dili olur.',
    words: [
      { kana: 'トルコ', tr: 'Türkiye', from: 'Turco', pos: 'ülke', note: 'トルコ人 (torukojin) Türk, トルコ語 (torukogo) Türkçe.' },
      { kana: 'アメリカ', tr: 'Amerika', from: 'America', pos: 'ülke' },
      { kana: 'イギリス', tr: 'İngiltere', from: 'Portekizce: inglês', pos: 'ülke', note: 'İngilizce "England" değil! Portekizceden gelir, o yüzden ses hiç benzemez.' },
      { kana: 'フランス', tr: 'Fransa', from: 'France', pos: 'ülke' },
      { kana: 'ドイツ', tr: 'Almanya', from: 'Almanca: Deutsch', pos: 'ülke', note: 'Kendi dilindeki adından gelir; İngilizce "Germany" ile ilgisi yok.' },
      { kana: 'イタリア', tr: 'İtalya', from: 'Italia', pos: 'ülke' },
      { kana: 'スペイン', tr: 'İspanya', from: 'Spain', pos: 'ülke' },
      { kana: 'ロシア', tr: 'Rusya', from: 'Russia', pos: 'ülke' },
      { kana: 'カナダ', tr: 'Kanada', from: 'Canada', pos: 'ülke' },
      { kana: 'インド', tr: 'Hindistan', from: 'India', pos: 'ülke' },
      { kana: 'エジプト', tr: 'Mısır', from: 'Egypt', pos: 'ülke' },
      { kana: 'ブラジル', tr: 'Brezilya', from: 'Brasil', pos: 'ülke' },
      { kana: 'イスタンブール', tr: 'İstanbul', from: 'İstanbul', pos: 'isim', note: 'Kendi şehrini katakana yazabilmek işe yarar; adını da böyle yazacaksın.' },
      { kana: 'アンカラ', tr: 'Ankara', from: 'Ankara', pos: 'isim' },
    ],
  },

  {
    id: 'teknoloji',
    title: 'Teknoloji',
    desc: 'Bu alanın neredeyse tamamı katakana — Japoncası olmayan kavramlar.',
    words: [
      { kana: 'テレビ', tr: 'televizyon', from: 'television', pos: 'isim', note: 'Kısaltma: テレビジョン’un ilk yarısı. Uzun kelimeler ilk 3-4 morada kesilir.' },
      { kana: 'パソコン', tr: 'bilgisayar', from: 'personal computer', pos: 'isim', note: 'İki kelimenin baş heceleri: PAso + KONpyuutaa. Wasei-eigo; İngilizcede "pasocon" yok.' },
      { kana: 'コンピューター', tr: 'bilgisayar', from: 'computer', pos: 'isim' },
      { kana: 'スマホ', tr: 'akıllı telefon', from: 'smart phone', pos: 'isim', note: 'スマートフォン’un kısaltması. Günlük dilde herkes スマホ der.' },
      { kana: 'インターネット', tr: 'internet', from: 'internet', pos: 'isim', note: 'Kısaltması ネット.' },
      { kana: 'メール', tr: 'e-posta', from: 'mail', pos: 'isim', note: 'Japoncada "mektup" değil E-POSTA demektir. Mektup てがみ’dir.' },
      { kana: 'カメラ', tr: 'kamera, fotoğraf makinesi', from: 'camera', pos: 'isim' },
      { kana: 'ゲーム', tr: 'oyun', from: 'game', pos: 'isim' },
      { kana: 'アプリ', tr: 'uygulama', from: 'application', pos: 'isim' },
      { kana: 'ファイル', tr: 'dosya', from: 'file', pos: 'isim', note: 'ファ genişletilmiş kanadır: フ + küçük ァ. Japoncada normalde "fa" sesi yoktur.' },
      { kana: 'テレフォン', tr: 'telefon', from: 'telephone', pos: 'isim', note: 'Günlük dilde でんわ daha yaygın; テレフォン daha çok markalarda görülür.' },
      { kana: 'ビデオ', tr: 'video', from: 'video', pos: 'isim' },
      { kana: 'ラジオ', tr: 'radyo', from: 'radio', pos: 'isim' },
      { kana: 'エアコン', tr: 'klima', from: 'air conditioner', pos: 'isim', note: 'Yine iki kelimenin başı: EAa + KONdishonaa.' },
      { kana: 'ロボット', tr: 'robot', from: 'robot', pos: 'isim' },
      { kana: 'ネット', tr: 'internet, ağ', from: 'net', pos: 'isim' },
    ],
  },

  {
    id: 'esya',
    title: 'Ev ve eşya',
    desc: 'Japoncaya sonradan giren nesneler katakana kalır.',
    words: [
      { kana: 'テーブル', tr: 'masa (yemek)', from: 'table', pos: 'isim', note: 'Çalışma masası つくえ’dir; テーブル yemek masası.' },
      { kana: 'ドア', tr: 'kapı', from: 'door', pos: 'isim', note: 'Japon usulü sürgülü kapı ayrı kelimedir: と / ふすま.' },
      { kana: 'ベッド', tr: 'yatak', from: 'bed', pos: 'isim', note: 'Küçük ッ İngilizcedeki sert "d" kapanışını taşır. ベド demek yanlış.' },
      { kana: 'ソファ', tr: 'kanepe', from: 'sofa', pos: 'isim' },
      { kana: 'カーテン', tr: 'perde', from: 'curtain', pos: 'isim' },
      { kana: 'シャワー', tr: 'duş', from: 'shower', pos: 'isim' },
      { kana: 'トイレ', tr: 'tuvalet', from: 'toilet', pos: 'isim' },
      { kana: 'キッチン', tr: 'mutfak', from: 'kitchen', pos: 'isim' },
      { kana: 'コップ', tr: 'bardak', from: 'Felemenkçe: kop', pos: 'isim', note: 'İngilizce "cup" DEĞİL — o カップ’tır ve fincan demektir. İkisi ayrı kelime.' },
      { kana: 'カップ', tr: 'fincan', from: 'cup', pos: 'isim', note: 'コップ (bardak) ile karıştırılır; ikisi farklı kaynaktan gelir.' },
      { kana: 'ナイフ', tr: 'bıçak', from: 'knife', pos: 'isim' },
      { kana: 'フォーク', tr: 'çatal', from: 'fork', pos: 'isim', note: 'フォ genişletilmiş kana: フ + küçük ォ.' },
      { kana: 'スプーン', tr: 'kaşık', from: 'spoon', pos: 'isim' },
      { kana: 'テレビゲーム', tr: 'video oyunu', from: 'TV game', pos: 'isim', note: 'Wasei-eigo: İngilizcede "TV game" denmez.' },
    ],
  },

  {
    id: 'kiyafet',
    title: 'Kıyafet',
    desc: '',
    words: [
      { kana: 'シャツ', tr: 'gömlek', from: 'shirt', pos: 'isim' },
      { kana: 'Tシャツ', tr: 'tişört', from: 'T-shirt', pos: 'isim', note: 'Latin harfi + katakana karışık yazılır; ティーシャツ okunur.' },
      { kana: 'ズボン', tr: 'pantolon', from: 'Fransızca: jupon', pos: 'isim', note: 'Fransızcadan gelir. パンツ da denir ama o iç çamaşırı anlamına da gelebilir.' },
      { kana: 'スカート', tr: 'etek', from: 'skirt', pos: 'isim' },
      { kana: 'コート', tr: 'palto', from: 'coat', pos: 'isim' },
      { kana: 'セーター', tr: 'kazak', from: 'sweater', pos: 'isim' },
      { kana: 'ジーンズ', tr: 'kot pantolon', from: 'jeans', pos: 'isim' },
      { kana: 'ネクタイ', tr: 'kravat', from: 'necktie', pos: 'isim' },
      { kana: 'ボタン', tr: 'düğme', from: 'Portekizce: botão', pos: 'isim' },
      { kana: 'ポケット', tr: 'cep', from: 'pocket', pos: 'isim' },
      { kana: 'サイズ', tr: 'beden, boyut', from: 'size', pos: 'isim' },
    ],
  },

  {
    id: 'yer',
    title: 'Yerler ve ulaşım',
    desc: '',
    words: [
      { kana: 'ホテル', tr: 'otel', from: 'hotel', pos: 'isim', note: 'İngilizce "l" sesi Japoncada yoktur; ラ行 ile karşılanır → ル.' },
      { kana: 'デパート', tr: 'büyük mağaza', from: 'department store', pos: 'isim', note: 'Kısaltma: DEPAAtomento sutoa.' },
      { kana: 'スーパー', tr: 'süpermarket', from: 'supermarket', pos: 'isim' },
      { kana: 'コンビニ', tr: '24 saat açık market', from: 'convenience store', pos: 'isim', note: 'Wasei-eigo kısaltma. Japonya’da her köşede vardır, gündelik hayatın merkezi.' },
      { kana: 'ビル', tr: 'bina', from: 'building', pos: 'isim', note: 'Kısaltma. "Bill" (fatura) ile ilgisi yok.' },
      { kana: 'アパート', tr: 'apartman dairesi', from: 'apartment', pos: 'isim', note: 'Japoncada küçük/ucuz daire; büyük ve modern olanı マンション denir.' },
      { kana: 'マンション', tr: 'apartman dairesi (modern)', from: 'mansion', pos: 'isim', note: 'YALANCI DOST: İngilizcede "malikâne" demektir, Japoncada sıradan bir daire.' },
      { kana: 'バス', tr: 'otobüs', from: 'bus', pos: 'isim', note: 'Aynı yazım "bath" (banyo) için de kullanılır: バス. Bağlam ayırır.' },
      { kana: 'タクシー', tr: 'taksi', from: 'taxi', pos: 'isim' },
      { kana: 'エレベーター', tr: 'asansör', from: 'elevator', pos: 'isim' },
      { kana: 'エスカレーター', tr: 'yürüyen merdiven', from: 'escalator', pos: 'isim' },
      { kana: 'トイレット', tr: 'tuvalet (tam biçim)', from: 'toilet', pos: 'isim' },
      { kana: 'ホーム', tr: 'peron', from: 'platform', pos: 'isim', note: 'プラットホーム’un kısaltması. "Home" (ev) değil!' },
      { kana: 'チケット', tr: 'bilet', from: 'ticket', pos: 'isim', note: 'Tren bileti için genelde きっぷ kullanılır; チケット konser/etkinlik bileti.' },
    ],
  },

  {
    id: 'okul',
    title: 'Okul ve iş',
    desc: '',
    words: [
      { kana: 'ノート', tr: 'defter', from: 'notebook', pos: 'isim', note: 'YALANCI DOST: İngilizce "note" (not) değil, DEFTER demektir.' },
      { kana: 'ペン', tr: 'kalem (tükenmez)', from: 'pen', pos: 'isim' },
      { kana: 'ボールペン', tr: 'tükenmez kalem', from: 'ball pen', pos: 'isim' },
      { kana: 'テスト', tr: 'sınav, test', from: 'test', pos: 'isim' },
      { kana: 'クラス', tr: 'sınıf (grup)', from: 'class', pos: 'isim' },
      { kana: 'レポート', tr: 'ödev raporu', from: 'report', pos: 'isim' },
      { kana: 'アルバイト', tr: 'yarı zamanlı iş', from: 'Almanca: Arbeit', pos: 'isim', note: 'Almancadan gelir ve anlamı daralmıştır: Almancada "iş", Japoncada "part-time iş". Kısaltması バイト.' },
      { kana: 'サラリーマン', tr: 'beyaz yakalı çalışan', from: 'salary man', pos: 'isim', note: 'Wasei-eigo. İngilizcede böyle bir kelime yok; Japon iş kültürünün simgesi.' },
      { kana: 'オフィス', tr: 'ofis', from: 'office', pos: 'isim' },
      { kana: 'ミーティング', tr: 'toplantı', from: 'meeting', pos: 'isim', note: 'ティ genişletilmiş kanadır: テ + küçük ィ.' },
      { kana: 'スケジュール', tr: 'program, takvim', from: 'schedule', pos: 'isim' },
      { kana: 'カード', tr: 'kart', from: 'card', pos: 'isim' },
      { kana: 'ページ', tr: 'sayfa', from: 'page', pos: 'isim' },
    ],
  },

  {
    id: 'eglence',
    title: 'Eğlence ve spor',
    desc: '',
    words: [
      { kana: 'スポーツ', tr: 'spor', from: 'sports', pos: 'isim' },
      { kana: 'サッカー', tr: 'futbol', from: 'soccer', pos: 'isim', note: 'İngiliz İngilizcesi "football" değil, Amerikan "soccer" alınmış.' },
      { kana: 'テニス', tr: 'tenis', from: 'tennis', pos: 'isim' },
      { kana: 'バスケットボール', tr: 'basketbol', from: 'basketball', pos: 'isim', note: 'Kısaltması バスケ.' },
      { kana: 'スキー', tr: 'kayak', from: 'ski', pos: 'isim' },
      { kana: 'プール', tr: 'havuz', from: 'pool', pos: 'isim' },
      { kana: 'ミュージック', tr: 'müzik', from: 'music', pos: 'isim', note: 'Günlük dilde おんがく daha yaygın.' },
      { kana: 'ギター', tr: 'gitar', from: 'guitar', pos: 'isim' },
      { kana: 'ピアノ', tr: 'piyano', from: 'İtalyanca: piano', pos: 'isim' },
      { kana: 'コンサート', tr: 'konser', from: 'concert', pos: 'isim' },
      { kana: 'アニメ', tr: 'anime, çizgi film', from: 'animation', pos: 'isim', note: 'Kısaltma. Japoncada SADECE Japon işi değil, her türlü çizgi film demektir.' },
      { kana: 'マンガ', tr: 'çizgi roman', from: 'Japonca: 漫画', pos: 'isim', note: 'Japonca kelime ama sık sık katakana yazılır — vurgu için katakana kullanımı.' },
      { kana: 'ニュース', tr: 'haber', from: 'news', pos: 'isim' },
      { kana: 'パーティー', tr: 'parti (eğlence)', from: 'party', pos: 'isim' },
      { kana: 'カラオケ', tr: 'karaoke', from: 'Japonca: 空 + orchestra', pos: 'isim', note: 'Yarısı Japonca (から "boş"), yarısı İngilizce (オーケストラ). Melez kelime.' },
    ],
  },

  {
    id: 'gunluk',
    title: 'Günlük hayat',
    desc: '',
    words: [
      { kana: 'アイス', tr: 'dondurma; buzlu', from: 'ice', pos: 'isim' },
      { kana: 'プレゼント', tr: 'hediye', from: 'present', pos: 'isim' },
      { kana: 'デート', tr: 'randevu (romantik)', from: 'date', pos: 'isim', note: 'Takvim tarihi anlamı YOK; o ひづけ. デート sadece buluşma.' },
      { kana: 'アイデア', tr: 'fikir', from: 'idea', pos: 'isim' },
      { kana: 'サービス', tr: 'hizmet; ikram', from: 'service', pos: 'isim', note: 'Japoncada ayrıca "bedava/ikram" anlamı kazanmıştır: これはサービスです = "bu bizden".' },
      { kana: 'レベル', tr: 'seviye', from: 'level', pos: 'isim' },
      { kana: 'スタート', tr: 'başlangıç', from: 'start', pos: 'isim' },
      { kana: 'ストップ', tr: 'durdurma', from: 'stop', pos: 'isim' },
      { kana: 'チャンス', tr: 'fırsat', from: 'chance', pos: 'isim' },
      { kana: 'メモ', tr: 'not', from: 'memo', pos: 'isim' },
      { kana: 'コピー', tr: 'kopya', from: 'copy', pos: 'isim' },
      { kana: 'グループ', tr: 'grup', from: 'group', pos: 'isim' },
      { kana: 'ペット', tr: 'evcil hayvan', from: 'pet', pos: 'isim' },
      { kana: 'ホテルマン', tr: 'otel çalışanı', from: 'hotel man', pos: 'isim', note: 'Wasei-eigo.' },
      { kana: 'ハンサム', tr: 'yakışıklı', from: 'handsome', pos: 'sıfat', note: 'な-sıfat gibi çekilir: ハンサムな人.' },
      { kana: 'ロマンチック', tr: 'romantik', from: 'romantic', pos: 'sıfat', note: 'な-sıfat: ロマンチックな.' },
      { kana: 'シンプル', tr: 'sade, basit', from: 'simple', pos: 'sıfat', note: 'な-sıfat.' },
    ],
  },

  {
    id: 'ozel',
    title: 'Genişletilmiş kana (ファ ティ ヴ …)',
    desc: 'Japoncada olmayan sesler için sonradan uydurulmuş yazımlar.',
    words: [
      { kana: 'ファミリー', tr: 'aile', from: 'family', pos: 'isim', note: 'ファ = フ + küçük ァ. Japoncada "fa" hecesi yoktur, böyle yazılır.' },
      { kana: 'フィルム', tr: 'film', from: 'film', pos: 'isim', note: 'フィ = フ + küçük ィ.' },
      { kana: 'フェリー', tr: 'feribot', from: 'ferry', pos: 'isim', note: 'フェ = フ + küçük ェ.' },
      { kana: 'フォーク', tr: 'çatal', from: 'fork', pos: 'isim', note: 'フォ = フ + küçük ォ.' },
      { kana: 'ティー', tr: 'çay (siyah)', from: 'tea', pos: 'isim', note: 'ティ = テ + küçük ィ. Japon çayı おちゃ ayrı kelimedir.' },
      { kana: 'パーティー', tr: 'parti', from: 'party', pos: 'isim' },
      { kana: 'ディズニー', tr: 'Disney', from: 'Disney', pos: 'isim', note: 'ディ = デ + küçük ィ.' },
      { kana: 'チェック', tr: 'kontrol', from: 'check', pos: 'isim', note: 'チェ = チ + küçük ェ.' },
      { kana: 'シェフ', tr: 'şef (aşçı)', from: 'chef', pos: 'isim', note: 'シェ = シ + küçük ェ.' },
      { kana: 'ジェット', tr: 'jet', from: 'jet', pos: 'isim' },
      { kana: 'ウィスキー', tr: 'viski', from: 'whisky', pos: 'isim', note: 'ウィ = ウ + küçük ィ.' },
      { kana: 'ヴァイオリン', tr: 'keman', from: 'violin', pos: 'isim', note: 'ヴ = ウ + dakuten, "v" sesi için. バイオリン yazımı da yaygındır ve daha eskidir.' },
    ],
  },
]

// ————————————————————————— Türetilmiş —————————————————————————

export const ALL_KATA_WORDS: KataWord[] = KATA_THEMES.flatMap((t) => t.words)

/**
 * Sınavda kullanılabilecek kelimeler.
 *
 * Tシャツ gibi Latin harfi içerenler ayıklanıyor: sınav KANA okumayı ölçüyor,
 * karışık yazım orada gürültü olur.
 */
export const KATA_QUIZ_WORDS: KataWord[] = ALL_KATA_WORDS.filter((w) =>
  /^[゠-ヿ]+$/.test(w.kana),
)

/** Aynı kelime birden çok temada geçebiliyor (フォーク, パーティー). */
export const KATA_UNIQUE: KataWord[] = ALL_KATA_WORDS.filter(
  (w, i, a) => a.findIndex((x) => x.kana === w.kana) === i,
)

// ————————————————————————— Okunuş ve heceleme —————————————————————————
//
// NEDEN wanakana YETMİYOR:
// Genişletilmiş kana (ファ, ティ, ヴァ) wanakana'nın tablosunda yok; ファミリー
// için "fuamirii", ティー için "teii" veriyor. Bunlar YANLIŞ okunuş ve tam da
// katakananın zor kısmı. O yüzden önce genişletilmiş çiftler kendi tablomuzdan
// çözülüyor, kalanı wanakana'ya bırakılıyor.

/** Japoncada aslen bulunmayan, yabancı sesler için uydurulmuş kana çiftleri. */
const EXTENDED: Record<string, string> = {
  ファ: 'fa', フィ: 'fi', フェ: 'fe', フォ: 'fo', フュ: 'fyu',
  ティ: 'ti', ディ: 'di', トゥ: 'tu', ドゥ: 'du',
  ウィ: 'wi', ウェ: 'we', ウォ: 'wo',
  ヴァ: 'va', ヴィ: 'vi', ヴェ: 've', ヴォ: 'vo',
  シェ: 'she', ジェ: 'je', チェ: 'che',
  ツァ: 'tsa', ツィ: 'tsi', ツェ: 'tse', ツォ: 'tso',
  クァ: 'kwa', グァ: 'gwa',
}

const SMALL_Y = 'ャュョ'

/**
 * Kelimeyi okuma birimlerine ayırır.
 *
 * Küçük ャュョ ve genişletilmiş çiftler önceki karaktere yapışır ve TEK birim
 * olur. ー (uzatma) ve küçük ッ kendi başlarına birer birimdir — çünkü ses
 * vermeseler de birer hece uzunluğu kaplarlar.
 */
export function kataTokenize(kana: string): string[] {
  const c = [...kana]
  const out: string[] = []
  for (let i = 0; i < c.length; i++) {
    const pair = c[i] + (c[i + 1] ?? '')
    if (EXTENDED[pair]) {
      out.push(pair)
      i++
    } else if (c[i + 1] && SMALL_Y.includes(c[i + 1])) {
      out.push(pair)
      i++
    } else {
      out.push(c[i])
    }
  }
  return out
}

function unitRomaji(t: string): string {
  return EXTENDED[t] ?? toRomaji(t)
}

/**
 * Katakana kelimenin romaji okunuşu.
 *
 * İki kural elle işleniyor:
 *   ー → kendinden önceki ünlüyü tekrarlar (コーヒー = koohii)
 *   ッ → sonraki sessizi ikiler; ch'den önce t olur (サンドイッチ = sandoitchi)
 */
export function kataReading(kana: string): string {
  const toks = kataTokenize(kana)
  const out: string[] = []
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    if (t === 'ー') {
      const v = out[out.length - 1]?.match(/[aiueo](?![\s\S]*[aiueo])/)?.[0]
      if (v) out.push(v)
      continue
    }
    if (t === 'ッ') {
      const nx = toks[i + 1] ? unitRomaji(toks[i + 1]) : ''
      const c0 = nx.startsWith('ch') ? 't' : nx[0]
      if (c0 && !'aiueo'.includes(c0)) out.push(c0)
      continue
    }
    out.push(unitRomaji(t))
  }
  return out.join('')
}

/** Hece (mora) sayısı — ー ve ッ de birer hecedir. */
export function kataMoraCount(kana: string): number {
  return kataTokenize(kana).length
}

const BY_KANA = new Map(ALL_KATA_WORDS.map((w) => [w.kana, w]))

/** Kelimenin geldiği kaynak — sınav açıklamalarında kullanılır. */
export function sourceOf(kana: string): string | undefined {
  return BY_KANA.get(kana)?.from
}

/** Kelimeye özgü not (yalancı dost, wasei-eigo, ses tuzağı). */
export function kataNote(kana: string): string | undefined {
  return BY_KANA.get(kana)?.note
}

/**
 * Verilen kana kümesiyle okunabilen katakana kelimeler.
 *
 * Hiragana tarafındaki `wordsReadableWith` ile aynı mantık: kelimenin HER
 * birimi seçili olmalı, biri bile eksikse kelime elenir. Katakanaya özgü iki
 * incelik var:
 *   • Küçük ッ, ツ'nin küçüğüdür — ツ seçilmeden çözülemez.
 *   • Uzatma ー bir harf değil işarettir; her zaman okunabilir sayılır,
 *     ayrıca seçilmesi gerekmez.
 */
export function kataWordsReadableWith(
  selected: Set<string>,
  opts?: { maxMora?: number },
): KataWord[] {
  const max = opts?.maxMora ?? Infinity
  return KATA_QUIZ_WORDS.filter((w) => {
    if (kataMoraCount(w.kana) > max) return false
    return kataTokenize(w.kana).every((t) => {
      if (t === 'ー') return true
      if (t === 'ッ') return selected.has('ツ')
      return selected.has(t)
    })
  })
}
