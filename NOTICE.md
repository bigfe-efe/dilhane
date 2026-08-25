# Üçüncü taraf içerik ve atıflar

## KanjiVG — çizgi sırası verisi

`public/strokes/kana.json` ve `public/strokes/kanji.json` dosyaları
[KanjiVG](https://kanjivg.tagaini.net/) projesinden türetilmiştir.

- Telif: Ulrich Apel
- Lisans: **Creative Commons Attribution-ShareAlike 3.0** (CC BY-SA 3.0)
- Lisans metni: https://creativecommons.org/licenses/by-sa/3.0/

Veri, `scripts/gen-strokes.ts` ile KanjiVG'nin SVG dosyalarından çıkarılıp yalnızca
uygulamanın ihtiyaç duyduğu alanlara (çizgi yolları ve numara konumları) indirgenmiştir.
Bu iki dosya ve onlardan doğrudan türetilen çıktılar **CC BY-SA 3.0 altında kalır**;
projenin geri kalanının MIT lisansı bunları kapsamaz.

Aynı veri `print/hiragana-pratik.html` içindeki soluk örnek harfleri üretmek için de
kullanılmıştır.

## Genki

Japonca dersleri **Genki I (3. baskı)** kitabının **konu sırasını** izler — hangi
dilbilgisi yapısının hangi dersten sonra geldiğini.

Kitaptan **hiçbir metin, örnek cümle, kelime listesi veya alıştırma aktarılmamıştır.**
Anlatımların, örneklerin, okuma parçalarının ve alıştırmaların tamamı bu projeye özgüdür.
Genki, The Japan Times Publishing'in tescilli yayınıdır; bu proje onunla bağlantılı değildir.

## JLPT

JLPT ve N5 gibi seviye adları Japan Foundation ve Japan Educational Exchanges and Services
tarafından yürütülen sınavın adlarıdır. Bu proje o kurumlarla bağlantılı değildir; seviye
adları yalnızca hedef belirtmek için kullanılmıştır.

## wanakana

Romaji dönüşümleri için [WanaKana](https://wanakana.com/) kullanılır (MIT).
