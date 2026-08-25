# Genkou youshi (原稿用紙) ve alıştırma kâğıtları

`Yazdirilabilir kagitlar.bat` ile aç, ya da dosyalara doğrudan çift tıkla.
Yeniden üretmek için: `npm run gen:genkou`

## Genkou youshi nedir

Japonya'da kompozisyon, edebiyat metni ve sınav kâğıdı bu kâğıda yazılır.
Standardı **400字詰め**'dir: 20 sütun × 20 satır = **400 kare**, her kareye tek
karakter. Noktalama işaretleri ve küçük kana'lar (っ, ゃ, ゅ, ょ) da birer kare
kaplar.

Piyasada en yaygın kâğıt boyutu **B4 (257×364 mm)**, ayrıca B5 ve A4 sürümleri
de satılır.

## Kare neden 8,8 mm

Kare boyutunu belirleyen şey **sayfa genişliğidir**: 20 sütunun yan yana sığması
gerekir. B4'te bu ~9 mm'ye denk gelir. Yani gerçek genkou youshi kareleri
sanıldığından küçüktür — yaklaşık bir santimetre.

A4'te durum şöyle:

| Sayfa yönü | Kare | Not |
|---|---|---|
| A4 dikey | ~7,5 mm | 20 sütun 210 mm'ye ancak böyle sığar — orijinalden küçük |
| **A4 yatay** | **8,8 mm** | B4 ölçüsüyle pratikte aynı — bu yüzden bunu kullanıyoruz |

## Dosyalar

### `genkou-youshi-dikey.html` — A4 **yatay**
Gerçek, geleneksel biçim. **Sağ üst** köşeden başlanır, aşağı inilir, sütun
bitince **sola** geçilir. Sütunlar arasındaki dar boşluk furigana içindir.
Ortadaki şerit (版心) geleneksel katlama payıdır.

Sayfa 1 kılavuz çizgili, sayfa 2 boş.

### `genkou-youshi-yatay.html` — A4 **dikey**
Yatay yazı için. Karakterler soldan sağa, satırlar yukarıdan aşağı.

Izgara dikey sürümle **aynı değildir**: furigana boşluğu burada satırların
arasındadır, sütunlar bitişiktir; ortadaki şerit yoktur. Bu yüzden ızgara
217,8 mm yüksekliğe çıkıyor, A4 yatayına (210 mm) sığmıyor — o yüzden bu dosya
dikey sayfa.

Bu düzen ders kitaplarında ve internette kullanılır; edebiyat ve sınav kâğıtları
hâlâ dikey yazılır.

Sayfa 1 kılavuz çizgili, sayfa 2 boş.

### `hiragana-pratik.html` — A4 dikey, **20 mm kare**
8,8 mm yeni başlayan için küçük. Burada kareler 20 mm.

Izgara 8 sütun × 12 satır = 96 kare.

- Sayfa 1: kılavuz çizgili, boş
- Sayfa 2: kılavuzsuz, boş
- Sayfa 3–6: her satırda bir hiragana; **ilk iki kare soluk örnek**, üzerinden
  geç, sonra kendin devam et. 46 temel hiragana.

Karelerin içindeki noktalı artı gerçek kâğıtta **yoktur**; harfin hangi
parçasının nereye denk geldiğini görmen için konuldu.

Soluk örnek harfler [KanjiVG](https://kanjivg.tagaini.net/) çizgi verisinden
üretiliyor (CC BY-SA 3.0) — uygulamadaki çizgi sırası gösterimiyle aynı kaynak.
Bütün harfler **aynı ölçekle** çiziliyor: し ince uzun, を geniş kalıyor. Her
harfi tek tek kareye sığdırmak oranları bozardı, oysa bu kâğıdın amacı tam da o
oranı öğretmek.

## Yazdırma ayarları — bunlar önemli

- Kâğıt **A4**, yön dosyaya göre (yukarıdaki başlıklarda yazıyor)
- Ölçek **%100** — "Sayfaya sığdır" **kapalı** olmalı, yoksa kareler küçülür ve
  ölçü tutmaz
- Kenar boşlukları **Yok**
- Seçenekler → **Arka plan grafikleri açık** — yoksa soluk kılavuzlar basılmaz

Kontrol: bastıktan sonra cetvelle bir kareyi ölç. 8,8 mm ya da 20 mm çıkmalı.
Çıkmıyorsa ölçek %100 değildir.

Kâğıtlarda **hiçbir yazı yoktur** — yalnızca ızgara. Hangi dosyanın ne olduğu
bu belgede yazıyor.
