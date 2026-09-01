# iPhone katakana duvar kâğıdı

104 görsel — her katakana karakteri için bir tane. Kilit ekranı her açılışında
(ya da saatlik, sen seçiyorsun) rastgele bir harf karşılar.

Her görselde:

- Harf, **numaralı çizgi başlangıç noktalarıyla** (1-2-3…)
- Hiragana karşılığı
- Okunuş, Türkçe yaklaşık okunuş, satır ve çizgi sayısı
- Varsa **karışan çift uyarısı** (シ/ツ gibi) ve **örnek kelime**

---

## Önce şunu bil: iOS'ta canlı duvar kâğıdı yok

Masaüstündeki gibi çalışan bir HTML duvar kâğıdı iPhone'da mümkün değil ve
bunu değiştirebileceğimiz bir yol da yok. Ama iOS 17'den beri **Fotoğraf
Karıştır** var: bir albüm seçiyorsun, kilit ekranı o albümden rastgele görsel
gösteriyor ve belirlediğin sıklıkta değiştiriyor.

Sonuç masaüstündekine çok yakın: rastgele sıra, düzenli değişim, **hiçbir
uygulama kurmadan.** Tek fark, 6–8 saniye yerine "her kilit açışta" olması —
ki telefon için zaten daha mantıklı.

---

## 1. Görselleri telefona al

Proje OneDrive içinde olduğu için görseller **zaten telefonuna senkronlanıyor.**

1. iPhone'da **OneDrive** uygulamasını aç
2. `Masaüstü / Dil Öğrenme / wallpaper / iphone` klasörüne git
3. Sağ üstten **Seç** → istediğin görselleri işaretle
4. Paylaş → **Görüntüyü Kaydet** (Fotoğraflar'a iner)

**Hangilerini alayım?** Dosya adında `temel` geçen **46 tanesi** temel
katakanadır. Şu an onları öğrendiğin için yalnızca onları almak daha iyi:
`dakuten` ve `yoon` olanlar sen oraya gelene kadar gürültü yapar.

Sıralı isimlendirme (`001-temel-a`, `002-temel-i` …) bu seçimi kolaylaştırıyor.

> Alternatif: klasörü bilgisayardan AirDrop ile de gönderebilirsin.

## 2. Albüm yap

Fotoğraflar → Albümler → **+** → Yeni Albüm → adını **Katakana** koy →
indirdiğin görselleri ekle.

Albüm şart: Fotoğraf Karıştır'a "tüm kitaplık" dersen kendi fotoğraflarını da
karıştırır.

## 3. Duvar kâğıdı yap

**Ayarlar → Duvar Kâğıdı → Yeni Duvar Kâğıdı Ekle → Fotoğraf Karıştır**

Sonra:

| Ayar | Seç |
|---|---|
| Albüm | Katakana |
| Karıştırma sıklığı | **Kilitlendiğinde** (ya da Saatlik) |
| Derinlik efekti | **Kapalı** |

**Derinlik efektini kapat** — açık kalırsa iOS saati harfin önüne bindirir ve
karakterin üstünü kapatır.

Ekleyince "Duvar Kâğıdı Çifti Olarak Ayarla" dersen ana ekranda da görünür;
orada simgeler üstünü kapatacağı için ana ekranı bulanık bırakmak daha rahat.

---

## Yeniden üretmek

Kana tablosu, örnek kelimeler veya çizgi verisi değişirse:

```bash
npm run gen:iphone-wallpaper
```

Görseller **headless Chrome ile** çiziliyor: masaüstü duvar kâğıdıyla birebir
aynı çizgi verisi, aynı renkler. Elde yazı çizecek bir font rasterleyici
olmadığı için sayfayı Chrome'a çizdirip ekran görüntüsü alıyoruz.

Üretim 104 görsel için birkaç dakika sürer. Eski PNG'ler silinip yeniden
yazılır; telefondakileri elle güncellemen gerekir.

### Çözünürlük

Görseller **1290 × 2796** üretiliyor. iOS duvar kâğıdını zaten kendi ekranına
göre ölçekleyip kırptığı için bu boyut bütün son model iPhone'larda çalışır.
İçerik ekranın **%32–%88** aralığında tutuluyor: üstü saate ve widget'lara,
altı el feneri/kamera düğmelerine bırakılmış. Kırpma olsa bile içerik kesilmez.
