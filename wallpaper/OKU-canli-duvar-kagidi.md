# Bunu gerçek canlı duvar kâğıdı yapmak

`hiragana.html` tek başına çalışan bir sayfadır. İki şekilde kullanılabilir:

| Yol | Ne olur | Gereken |
|---|---|---|
| `Hiragana duvar kagidi.bat` | İkinci monitörde tam ekran **pencere** açılır | — |
| **Lively Wallpaper** | Gerçek duvar kâğıdı: ikonların arkasında, görev çubuğunda yok | Ücretsiz uygulama |

## Neden kendi başımıza yapamadık

Windows'ta masaüstü şu katmanlardan oluşur:

```
Progman
  ├── WorkerW              ← duvar kâğıdı katmanı (ikonların ARKASI)
  └── SHELLDLL_DefView
        └── SysListView32  ← masaüstü ikonları
```

Bir pencereyi `SetParent` ile o `WorkerW`'nin içine taşırsan pencere masaüstünün
kendisi olur. Wallpaper Engine ve Lively tam olarak bunu yapar.

Bu makinede denendi ve **çalışmadı**, iki sebepten:

1. `SHELLDLL_DefView` doğrudan `Progman` altında duruyor; `WorkerW` katmanını
   ayıran `0x052C` mesajı (ne `0,0` ne `0xD,0x1` parametreleriyle) beklenen
   ayrışmayı yapmadı.
2. Daha önemlisi: **Chrome yeniden ebeveynlenmeye direniyor.** `SetParent`
   çağrısından sonra pencere kendini yeniden üst seviyeye taşıyor. Chromium'un
   kendi pencere yönetimi buna izin vermiyor.

İkinci madde asıl sebep ve aşılabilir değil. Wallpaper Engine ile Lively
bu yüzden hazır tarayıcı kullanmaz; **gömülü** bir tarayıcı motoru (CEF /
WebView2) barındırıp o pencereyi taşırlar — kendi pencereleri olduğu için
direnç göstermez.

## Lively Wallpaper ile (ücretsiz, açık kaynak)

1. Microsoft Store'dan **Lively Wallpaper** kur (ya da github.com/rocksdanister/lively)
2. Aç → sol altta **+** (Add Wallpaper)
3. **Browse** → bu klasördeki `hiragana.html` dosyasını seç
4. Duvar kâğıdı listesinde belirir; **ikinci monitöre** sağ tıkla → o ekrana ata

Lively'nin ek faydaları:
- Tam ekran oyun/video açınca duvar kâğıdını duraklatır (pil ve GPU tasarrufu)
- `explorer.exe` yeniden başlasa da kendini toparlar
- Her monitöre ayrı duvar kâğıdı

## Fare girdisi

Sayfanın solunda kalıcı bir panel var: satırları tik atarak döngüye sokup
çıkarırsın, süreyi ve diğer ayarları oradan değiştirirsin. Bunun masaüstünde de
çalışması için duvar kâğıdı uygulamasının **fare girdisini iletmesi** gerekir:

- **Lively**: Settings → *Wallpaper input* / *Mouse input* açık olmalı
- **Wallpaper Engine**: web duvar kâğıtlarında fare girdisi varsayılan olarak açıktır

Kapalıysa panel görünür ama tıklanmaz; o zaman ayarları `Hiragana duvar
kagidi.bat` ile normal pencerede açıp yaparsın. Ayarlar tarayıcıda saklandığı
için duvar kâğıdı sonraki açılışta aynı ayarlarla gelir (aynı tarayıcı profili
kullanılıyorsa).

## Ayarlar nerede duruyor

Sol paneldeki seçimler (hangi satırlar, kaç saniyede bir, sıralı/karışık…)
`wallpaper/prefs.json` dosyasında tutulur.

Neden dosya, neden tarayıcı hafızası değil: sayfa doğrudan dosyadan (`file://`)
açıldığında ayarlar yalnızca `localStorage`'a yazılabiliyor. Chrome bu yazmaları
toplayıp gecikmeli olarak diske indirir; bilgisayar kapanırken süreç sertçe
öldürüldüğü için son ayarlar diske hiç inmiyor ve her açılışta her şey
sıfırlanmış oluyordu. (Chrome profilinde `exit_type: "Crashed"` bunu birebir
gösteriyor.)

Bu yüzden `Hiragana duvar kagidi.bat` artık önce minik bir yerel sunucu
başlatıyor (`scripts/wallpaper-server.mjs`, port 4319) ve sayfayı
`http://127.0.0.1:4319` üzerinden açıyor. Bir kutuya tıkladığın an ayar
`prefs.json`'a yazılır — süreç nasıl sonlanırsa sonlansın kayıp olmaz.

Sunucu yalnızca 127.0.0.1'e bağlanır, dışarıdan erişilemez ve on dakika hiç
istek gelmezse kendini kapatır.

Node kurulu değilse duvar kâğıdı yine açılır (`file://` ile), sadece ayarların
kalıcılığı tarayıcının insafına kalır.

Ayarları sıfırlamak istersen `wallpaper/prefs.json` dosyasını silmen yeterli.

## Fare ve kaydirma

Sahneye tiklamak harfi **degistirmez**. Duvar kagidi masaustunun onunde
durdugu icin, oraya denk gelen her tiklama harfi atliyordu ve is yapmayi
zorlastiriyordu. Harf degistirmek artik yalnizca klavyeyle (bosluk, sag/sol ok)
ya da zamanlayiciyla olur.

Sol panel bastan asagi tek bir kaydirilabilir bolgedir. Onceden yalnizca satir
listesi kayardi, "Okunus" ve "Hatirlatici" ayarlari ise sabit duruyordu; kisa
ekranlarda (kucuk monitor ya da %125 olcekleme) bu kisimlar ekran disinda kalip
tekerlekle de erisilemiyordu. Artik panelin uzerinde tekerlegi cevirmek yeter.
