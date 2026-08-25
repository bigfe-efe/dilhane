@echo off
rem ---------------------------------------------------------------------
rem  Dilhane baslatici
rem
rem  NOT: Bu dosya bilerek yalnizca ASCII karakter icerir. cmd.exe, .bat
rem  dosyalarini kendi kod sayfasiyla satir satir cozer; Turkce harf veya
rem  cerceve karakteri koyulursa komut satirlari bozulur ve dosya calismaz.
rem  Bu yuzden mesajlarda Turkce harf yok.
rem ---------------------------------------------------------------------

title Dilhane - Japonca calisma
cd /d "%~dp0"

set PORT=5173
set URL=http://localhost:%PORT%/

echo.
echo   ================================
echo     DILHANE
echo     Japonca calisma uygulamasi
echo   ================================
echo.

rem --- Node.js kurulu mu? ---
where node >nul 2>&1
if errorlevel 1 (
  echo   HATA: Node.js bulunamadi.
  echo   https://nodejs.org adresinden kurup tekrar dene.
  echo.
  pause
  exit /b 1
)

rem --- Sunucu zaten acikssa yeniden baslatma, sadece tarayiciyi ac ---
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo   Sunucu zaten calisiyor. Tarayici aciliyor...
  rem  timeout kullanmiyoruz: stdin yonlendirilmisse hata veriyor
  start "" "%URL%"
  exit /b 0
)

rem --- Ilk calistirmada paketleri kur ---
if not exist "node_modules\vite" (
  echo   Ilk calistirma: gerekli paketler kuruluyor.
  echo   Birkac dakika surebilir, pencereyi kapatma.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   HATA: Paketler kurulamadi. Internet baglantini kontrol et.
    pause
    exit /b 1
  )
  echo.
)

echo   Sunucu baslatiliyor, tarayici birazdan acilacak...
echo.
echo   Kapatmak icin: bu pencerede Ctrl+C, sonra pencereyi kapat.
echo   Pencereyi acik birak - kapatirsan uygulama da durur.
echo.

rem --strictPort onemli: ilerlemen tarayicida PORTA BAGLI olarak saklanir.
rem Port dolu oldugunda Vite normalde 5174'e kayar; o zaman uygulama bos
rem acilir ve butun ilerlemen silinmis gibi gorunur. Kaymak yerine hata
rem versin, sebebini bilelim.
call npm run dev -- --port %PORT% --strictPort --open

rem Sunucu hatayla kapandiysa pencere hemen kaybolmasin
if errorlevel 1 (
  echo.
  echo   Sunucu beklenmedik bicimde kapandi.
  echo   Sebep %PORT% portunun dolu olmasi olabilir: baska bir Dilhane
  echo   penceresi acik mi diye bak, varsa onu kapatip tekrar dene.
  echo.
  pause
)
