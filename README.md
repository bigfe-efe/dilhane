# Dilhane

Kişisel kullanım için yapılmış, **tamamen çevrimdışı çalışan** Japonca öğrenme uygulaması.
Sıfırdan başlar: hiragana → katakana → Genki I → JLPT N5.

Arayüz Türkçedir ve anlatımlar Türkçe konuşan biri için yazılmıştır — Japonca ile Türkçenin
cümle yapısı benzerliğinden (özne–nesne–yüklem, ekler kelimenin arkasında) faydalanır.

Bütün ilerleme cihazda (IndexedDB) saklanır, hiçbir yere gönderilmez.

---

## Hızlı başlangıç

**Windows'ta en kolayı:** `Dilhane.bat` dosyasına çift tıkla. Sunucuyu başlatır ve
tarayıcıyı açar. `Masaustune kisayol olustur.bat` dosyasını bir kez çalıştırırsan
masaüstüne kısayol koyar; sonrasında tek tıklama yeter.

> Not: Bu iki `.bat` dosyası bilerek yalnızca ASCII karakter içerir. `cmd.exe`, batch
> dosyalarını kendi kod sayfasıyla çözdüğü için Türkçe harf veya çerçeve karakteri
> konursa komut satırları bozulur ve dosya çalışmaz.

**İkinci monitör için duvar kâğıdı:** `Hiragana duvar kagidi.bat` — harfleri belli
aralıklarla döndüren, Türkçe okunuşunu gecikmeli açan tam ekran bir sayfa açar. Hangi
satırların döneceğini ve süreyi `A` tuşuyla ayarlarsın. Dosya tamamen bağımsızdır
(`wallpaper/hiragana.html`), sunucuya ihtiyaç duymaz; Wallpaper Engine'e "Web" tipi
duvar kâğıdı olarak da verilebilir. Yeniden üretmek için: `npm run gen:wallpaper`

Simgelerin arkasında duran **gerçek** canlı duvar kâğıdı istiyorsan ücretsiz
**Lively Wallpaper**'a aynı HTML dosyasını verebilirsin — ayrıntı ve neden kendi
başımıza yapamadığımız: `wallpaper/OKU-canli-duvar-kagidi.md`

Elle çalıştırmak istersen:

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır. İnternet bağlantısı gerekmez.

Üretim sürümü için:

```bash
npm run build && npm run preview
```

Bilgisayarına **uygulama gibi** kurmak için: Chrome/Edge'de aç → adres çubuğundaki
"Yükle" simgesine bas. PWA olarak masaüstüne kurulur, çevrimdışı çalışır.

---

## Ne var içinde?

**Japonca**
- **Yazı sistemi tanıtımı**: üç alfabenin ne olduğu ve nerede kullanıldığı, yatay/dikey yazım
  (yokogaki–tategaki), boşluksuz yazım, noktalama, küçük kana, uzun ünlüler, furigana, okurigana
- Hiragana ve katakana (dakuten ve yōon dahil), Türkçe okunuş ipuçları ve hatırlatıcılarla
- **Çizgi sırası animasyonu**: her kana ve kanji için numaralı çizgiler, adım adım ilerleme,
  yönü gösteren hareketli uç (KanjiVG verisiyle, çevrimdışı)
- Karakterlerin tam ekran büyütülmüş hâli — kağıda yazarken ekrana yaklaşmaya gerek yok
- 103 N5 kanjisi: on/kun okumaları, çizgi sayısı, örnek kelimeler, konu bazlı setler
- ~180 temel kelime, örnek cümlelerle
- 45 dilbilgisi konusu — Türkçe anlatımlı, Türkçe–Japonca yapı benzerliklerine dayanarak
- Fiil ve sıfat çekim motoru: godan/ichidan/düzensiz ayrımı, 20 çekim biçimi
- 6 ünite, 29 ders, ~890 alıştırma — **Genki (3. baskı) müfredat sırasına göre dizili**
- N5 hazırlık sayfası: sınav yapısı ve ilerleme karşılaştırması
- 6 okuma parçası: furigana açılıp kapanabilir, her satır ayrı dinlenir

**Çalışma sistemi**
- Aralıklı tekrar (SM‑2 türevi): kelime, kana, kanji ve dilbilgisi kartları
- Takılan kart (leech) tespiti: sürekli unuttuğun kartlar ayrı listelenir, her birine kendi
  hatırlatıcını yazarsın; not tekrar sırasında kartın arkasında çıkar
- Ders içinde yanlış yapılan sorular dersin sonunda tekrar sorulur
- **Kendi testin**: çıkacak karakterleri sen seçersin; şıklar yalnızca seçtiğin kümeden
  gelir ve doğru cevap test bitene kadar gösterilmez (başka kaynaktan kendi sıranla
  çalışanlar için)
- **Kelime okuma**: seçtiğin harflerle okunabilen gerçek kelimeleri süzer ve hece hece
  çözdürür (171 tamamen hiragana kelime)
- Kana hız testi: dakikada kaç kana okuyabildiğini ölçer
- Çizim değerlendirme: çizgi sayısı, sırası ve yönü gerçek verilerle karşılaştırılır
- Alıştırma tipleri: çoktan seçmeli, boşluk doldurma, eşleştirme, dikte, çeviri, cümle sıralama, karakter çizme, telaffuz, serbest yazma
- Serbest yazma (konu seç, yaz, kendi kendini değerlendir) ve konuşma (mikrofonla telaffuz puanlama)
- Kana/kanji çizim tuvali — şablonlu ve şablonsuz
- **Hiragana bitirme sınavı**: sekiz ayrı beceriyi ölçer (tanıma, hatırlama, üretim, ayırt
  etme, dakuten, yōon, kelime okuma, özel kurallar), sonunda eksik teşhisi ve ne çalışılacağı
- **Rota ve çalışma planı**: sınav sonucundan haftalık plan üretir; hiragana → katakana →
  Genki I → N5 yolunu ve nerede olduğunu gösterir
- **Özel kurallar sayfası**: küçük っ, uzun ünlü, ん hecesi, ek olan は→wa, yōon, yutulan sesler
  — karşılaştırmalı örneklerle (きって/きて, おばあさん/おばさん, びょういん/びよういん)
- İstatistik, seri takibi, yedek alma/geri yükleme

---

## Genki ile ilişki

Japonca dersleri **Genki (3. baskı)** müfredat **sırasına** göre dizilmiştir: her dersin
başlığında `Genki 5` gibi bir etiket, her dilbilgisi konusunda `genki` alanı bulunur.
Dilbilgisi listesi istersen Genki dersine, istersen JLPT seviyesine göre gruplanır.

Alınan tek şey **konu sırasıdır** — hangi yapının hangi dersten sonra geldiği. Anlatımlar,
örnek cümleler, okuma parçaları ve alıştırmaların tamamı bu uygulamaya özgüdür ve Türkçe
konuşan biri için yazılmıştır; kitaptan hiçbir metin aktarılmamıştır. Kitap olmadan da
uygulama tek başına yeterlidir.

## Ses ve mikrofon

**Seslendirme** iki kaynaktan gelir, sırayla denenir:

1. `public/audio/` altına gömülmüş mp3 dosyaları (varsa) — en iyi kalite, %100 çevrimdışı
2. Cihazın kendi sesi (Web Speech API)

Windows'ta Japonca sesi kurulu değilse: **Ayarlar → Saat ve dil → Dil ve bölge →
Dil ekle → 日本語** ve kurulum sırasında "Konuşma" bileşenini işaretle.

**Japonca sesi yoksa ne olur?** Tarayıcı kana metnini sessizce yutar — hoparlör simgesi
görünür ama hiç ses çıkmaz. Bu durumda uygulama otomatik olarak **yaklaşık okumaya** düşer:
kana önce romaji'ye, romaji Türkçe yazıma çevrilir (し→şi, ち→çi, ふ→fu) ve cihazdaki Türkçe
sesle okunur. Türkçenin ses envanteri Japoncaya çok yakın olduğu için sonuç anlaşılırdır,
ama gerçek telaffuz değildir — hoparlör simgesinin yanında `≈` işareti bunu belirtir.
Ayarlar → Japonca sesi bölümünden kapatılabilir.

**Telaffuz puanlama** tarayıcının konuşma tanıma özelliğini kullanır (Chrome/Edge).
Bu özellik sunucu taraflıdır, yani internet ister. Bağlantı yokken uygulama otomatik
olarak "kaydet ve karşılaştır" moduna düşer.

---

## İçerik üretme scriptleri (isteğe bağlı)

Bu scriptler **derleme öncesi bir kez** çalıştırılır. Uygulama çalışırken hiçbir API
çağrısı yapmaz — üretilen dosyalar uygulamanın içine gömülür.

Önce anahtarları hazırla:

```bash
cp .env.example .env.local
```

### ElevenLabs ile ses üretme

```bash
npm run gen:audio -- --list
```

Kullanılabilir sesleri listeler; seçtiğin id'leri `.env.local` içine yaz.
Sonra önce küçük bir deneme yap:

```bash
npm run gen:audio -- --lang ja --limit 20 --yes
```

Beğendiysen tamamını üret:

```bash
npm run gen:audio -- --yes
```

Script akıllıdır: daha önce üretilmiş dosyaları atlar, ilerlemeyi 10 kayıtta bir
kaydeder, karakter sayısını ve tahmini maliyeti önceden gösterir. Öncelik sırası
kana → kelime → kanji kelimeleri → örnek cümleler şeklindedir, yani bakiye biterse
en kritik sesler üretilmiş olur.

### Çizgi sırası verisi üretme

```bash
npm run gen:strokes
```

KanjiVG'den bütün kana ve N5 kanjilerinin çizgi verisini indirip `public/strokes/` altına
yazar (~120 KB). Veri depoya dahil edildiği için bu komutu normalde çalıştırman gerekmez;
yeni kanji eklersen tekrar çalıştır. `--force` ile hepsini yeniden indirir.

Kaynak: [KanjiVG](http://kanjivg.tagaini.net) — Copyright (C) 2009-2011 Ulrich Apel,
Creative Commons Attribution-Share Alike 3.0 lisansı.

### Anthropic ile alıştırma üretme

```bash
npm run gen:content -- --lang ja --topic "て formu" --level N5 --count 12
npm run gen:content -- --topic "て formu" --level N5 --count 15
npm run gen:content -- --lang ja --vocab --topic "mutfak ve yemek" --count 25
```

Çıktı `src/content/generated/` altına JSON olarak yazılır. Bir derse eklemek için:

```ts
import data from '@/content/generated/exercises-ja-te-formu.json'
// ders bölümlerine ekle:
{ kind: 'exercises', title: 'て formu alıştırması', exercises: data.exercises as Exercise[] }
```

Üretilen içeriği kullanmadan önce gözden geçir — model hata yapabilir.

---

## Android APK

Kod tabanı Capacitor ile Android'e paketlenir. `android/` klasörü zaten oluşturuldu.

**Gereksinimler** (henüz kurulu değil):
- JDK 17
- Android Studio (veya sadece Android SDK + command line tools)

Kurduktan sonra:

```bash
npm run android:sync
npm run android:open
```

Android Studio açılır → **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
Çıkan dosya: `android/app/build/outputs/apk/debug/app-debug.apk`

Android Studio olmadan, komut satırından:

```bash
npm run android:sync
cd android
./gradlew assembleDebug
```

İlk mikrofon kullanımında Android izin sorar. `AndroidManifest.xml` içine
`RECORD_AUDIO` izni eklendi.

---

## Yeni içerik ekleme

Her şey `src/content/` altında düz TypeScript dosyalarında:

| Dosya | İçerik |
|---|---|
| `ja/kana.ts` | Hiragana/katakana tabloları, hatırlatıcılar |
| `ja/kana-words.ts` | Tamamen hiragana yazılabilen kelimeler ve harf-kümesi süzgeci |

Duvar kâğıdı `scripts/gen-wallpaper.ts` ile üretilir: kana tablosu ve çizgi verisi tek bir
HTML dosyasına gömülür, böylece uygulamadan bağımsız çalışır ama veri tek yerde durur.
| `ja/writing-system.ts` | Yazı sistemi tanıtımı: alfabeler, yazı yönü, çizgi sırası kuralları |
| `ja/kanji-n5.ts` | Kanji verisi ve konu setleri |
| `ja/vocab.ts` | Japonca kelimeler |
| `ja/grammar.ts` | Japonca dilbilgisi konuları |
| `ja/lessons.ts` | Ünite 1–2 (kana) dersleri ve kana alıştırma üreticisi |
| `ja/lessons-genki.ts` | Ünite 3–6: Genki 1–12 sırasına göre dersler + kanji |
| `ja/grammar-2.ts` | Genki 6–12 dilbilgisi konuları |
| `ja/drills.ts` | Kelime/kanji/edat/çekim alıştırması üreticileri |
| `ja/passages.ts` | Okuma parçaları |
| `en/vocab.ts` | İngilizce kelimeler |
| `en/grammar.ts` | İngilizce dilbilgisi konuları |
| `en/verbs.ts` | Zamanlar ve düzensiz fiiller |
| `en/lessons.ts` | İngilizce üniteler ve dersler |
| `homework.ts` | Ödevler |

Yeni bir ders eklemek için ilgili `lessons.ts` dosyasına bir nesne eklemen yeterli;
`src/content/index.ts` her şeyi otomatik toplar.

---

## Mimari

```
src/
  types.ts              içerik modeli (ders, alıştırma, kelime, dilbilgisi…)
  db/
    db.ts               Dexie şeması, yedekleme, istatistik
    hooks.ts            canlı sorgular (useLiveQuery)
  lib/
    srs.ts              aralıklı tekrar algoritması (saf fonksiyonlar)
    conjugate-ja.ts     Japonca fiil/sıfat çekim motoru
    tts.ts              seslendirme (gömülü mp3 → cihaz sesi → Türkçe yaklaşık okuma)
    ja-phonetic.ts      Japonca → Türkçe okunuş çevrimi (ses yoksa devreye girer)
    ja-reading.ts       kanjili metnin kana okunuşunu içerikten bulur
    strokes.ts          çizgi sırası verisinin yüklenmesi
    stt.ts              mikrofon, konuşma tanıma, telaffuz puanlama
    md.tsx              ders metinleri için mini Markdown çözümleyici
  components/
    Exercise.tsx        9 alıştırma tipini işleyen motor
    DrawCanvas.tsx      karakter çizim tuvali
    StrokeOrder.tsx     çizgi sırası animasyonu
    ui.tsx              ortak arayüz parçaları
  pages/                ekranlar
  content/              bütün ders içeriği
scripts/                derleme öncesi üretim scriptleri
```

---

## İlerleme nerede saklanır?

Her şey tarayıcının **IndexedDB**'sinde: ders adımları, SRS kartları, istatistikler,
notlar. Bilgisayarı kapatsan da durur, internet gerekmez.

İki noktaya dikkat:

1. **Port değişirse ilerleme kaybolmuş gibi görünür.** Tarayıcı veriyi adrese göre
   ayırır; `localhost:5173` ile `localhost:5174` ayrı veritabanlarıdır. `Dilhane.bat`
   bu yüzden portu `--strictPort` ile 5173'e sabitler — port doluysa sessizce
   kaymak yerine hata verir.
2. **Tarayıcı verilerini temizlemek her şeyi siler.** Ayarlar → Yedek al ile düzenli
   JSON yedeği çıkar.

## Veri güvenliği

- `.env.local` git'e yüklenmez ve uygulamanın içine **girmez** — sadece scriptler okur.
- İlerleme verisi yalnızca tarayıcının IndexedDB'sindedir.
- Tarayıcı verilerini temizlemeden veya cihaz değiştirmeden önce
  **Ayarlar → Yedek al** ile JSON yedeği indir.
