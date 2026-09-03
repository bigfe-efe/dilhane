# N5 kanji canlı duvar kâğıdı

**106 JLPT N5 kanjisi** rastgele sırayla gelir. Her karakter **9–12 saniye**
kalır, **ayarı yoktur** — her şey kodlandığı gibi çalışır.

Her kanjiyle **aynı anda** görünenler:

- **Numaralı çizgi sırası canlandırması** — her dairenin içinde kaçıncı
  çizgi olduğu yazar
- **Türkçe anlam**, karakterin yanında büyük puntoyla
- **on'yomi** (Çinceden gelen okunuş, katakana) ve **kun'yomi** (Japonca
  okunuş, hiragana) — ayrı ayrı etiketli
- **Üç örnek kelime**, okunuşu ve Türkçesiyle. O anki kanji kelimenin
  içinde renkli.

## Neden okunuş büyük puntoyla tek başına yazmıyor

Katakanada ア'nın karşılığı "a"dır, biter. Kanjide böyle tek bir cevap
**yok** — okunuş kelimeye göre değişir:

| Kelime | Okunuş | 人 nasıl okunuyor |
|---|---|---|
| 人 | ひと | hito |
| 三人 | さんにん | nin |
| 日本人 | にほんじん | jin |

Karakterin altına tek bir okunuş yazmak doğrudan yanlış bir şey öğretirdi.
Bu yüzden asıl yük **örnek kelimelerde**: okunuşun değiştiğini ancak yan
yana duran kelimeler gösterebilir.

## Sıklık

1. sınıf kanjileri (日, 人, 大, 一) diğerlerinden **üç kat** sık çıkar,
2. sınıf iki kat. Bunlar her yerde geçen temel karakterler. Sıklık listesi
uydurulmadı; Japon okul sınıfı hazır ve doğru bir sinyal.

Deste karılıp sırayla tüketilir, bitince yeniden karılır — hem rastgele
hem de her karakterin çıkacağı garanti.

---

## Kurulum — iki yol, birini seç

### 1. Wallpaper Engine

Üretim betiği zaten kopyalıyor. Wallpaper Engine'i aç, kütüphanede
**"Dilhane — N5 Kanji"** yi seç.

Yeniden ürettiğinde duvar kâğıdı açıksa bir kez yeniden seç, yoksa eski
sürüm ekranda kalır.

### 2. Hiçbir uygulama gerekmeden

Ana klasördeki **`Kanji duvar kagidi.bat`** dosyasına çift tıkla.

| Seçenek | Ne yapar |
|---|---|
| **A** | Şimdi açar (ikinci monitörde) |
| **B** | Bilgisayar açılışında kendiliğinden başlasın |
| **K** | Otomatik başlatmayı kaldırır |

Chrome'u kendi profiliyle açtığı için diğer duvar kâğıtlarıyla ve normal
Chrome'unla çakışmaz.

---

## Yeniden üretmek

```
npm run gen:kanji-wallpaper
```

Kanji listesi, anlamlar veya örnek kelimeler `src/content/ja/kanji-n5.ts`
içinde değişirse bunu çalıştır. Veri HTML'in içine gömülüdür — duvar kâğıdı
uygulamadan bağımsız çalışsın diye — yani üretmeden değişiklik yansımaz.

Çizgi verisi `public/strokes/kanji.json`'dan gelir; yoksa önce
`npm run gen:strokes`.

## Katakana duvar kâğıdı ne oldu

Duruyor. Wallpaper Engine'de **`dilhane-katakana`** klasörü olduğu gibi
kalıyor, üzerine yazılmadı — istediğinde geri seçebilirsin.
