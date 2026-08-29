# Katakana canlı duvar kâğıdı

Katakana harfleri sırayla gelir. Her harf **6–8 saniye** kalır, sıra
rastgeledir, **ayarı yoktur** — her şey kodlandığı gibi çalışır.

Her harfle **aynı anda** görünenler:

- Çizgi sırası canlandırması, başlangıç noktaları işaretli
- Okunuş (romaji) ve Türkçe yaklaşık okunuş
- **Hiragana karşılığı** — ア'nın yanında あ. Zaten bildiğin sistem, çıpa olsun diye.
- **Karışan çift uyarısı** — シ/ツ, ソ/ン gibi. Ayrımın *ne olduğu* yazıyor,
  sadece "bunlar karışır" demiyor.
- **Örnek kelime**, kaynak kelimesiyle. O anki harf kelimenin içinde renkli.

Temel 46 harf, dakuten'li ve yōon'lulardan daha sık çıkar: katakanayı yeni
öğrenen için キャ, カ oturmadan gürültüdür.

---

## Kurulum — iki yol var, birini seç

### 1. Hiçbir uygulama gerekmeden (önerilen)

Ana klasördeki **`Katakana duvar kagidi.bat`** dosyasına çift tıkla.

| Seçenek | Ne yapar |
|---|---|
| **A** | Şimdi açar (ikinci monitörde) |
| **B** | Bilgisayar açılışında kendiliğinden başlasın |
| **K** | Otomatik başlatmayı kaldırır |

**B** seçeneği Windows'un Başlangıç klasörüne bir kısayol koyar. Hiçbir program
kurulmaz, hiçbir servis çalışmaz — bilgisayarı açtığında pencere kendiliğinden
ikinci monitörde belirir.

Tam ekran için pencereyi seçip **F11**. Kapatmak için **Alt+F4**.

> İkinci monitör bulunamazsa birincil ekranda açılır. Birincil ekranda açılmasını
> özellikle istersen: `powershell -File wallpaper\launch-katakana.ps1 -Primary`

### 2. Wallpaper Engine ile

`wallpaper/katakana/` klasörünün **tamamını** kopyala:

```
Steam\steamapps\common\wallpaper_engine\projects\myprojects\
```

Wallpaper Engine'i aç → kütüphanede "Dilhane — Katakana" görünür → seç.

Klasörde `project.json` ve `preview.png` hazır; içe aktarma için başka bir şey
gerekmiyor. Önizleme görselini beğenmezsen ekran görüntüsüyle değiştirebilirsin,
dosya adı `preview.png` kalsın yeter.

---

## Neden bu kadar basit (hiragana sürümünün aksine)

Hiragana duvar kâğıdında bir **ayar paneli** vardı: hangi satırlar çıksın, kaç
saniyede değişsin. Bu, tercihleri saklamayı gerektiriyordu ve `file://` altında
Chrome localStorage yazmalarını geciktirip bilgisayar kapanırken kaybediyordu.
Çözüm olarak `prefs.json` yazan küçük bir yerel sunucu (Node) çalıştırılıyordu.

Bu sürümde ayar yok, dolayısıyla saklanacak bir şey de yok:

- Sunucu yok, `prefs.json` yok, Node gerekmiyor
- Klavye kısayolu yok — masaüstünde yanlışlıkla bir şeye basma riski yok
- Tek bir HTML dosyası, hiçbir şeye bağlı değil

## Güncelleme

Kana tablosu, örnek kelimeler veya çizgi verisi uygulamada değişirse:

```bash
npm run gen:katakana-wallpaper
```

Duvar kâğıdı HTML'i yeniden üretilir. İki yerde ayrı liste tutulmuyor —
veri uygulamadan geliyor.
