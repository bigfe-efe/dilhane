@echo off
rem ---------------------------------------------------------------------
rem  Yazdirilabilir Japonca kagitlarini acar (genkou youshi + alistirma).
rem  (Yalnizca ASCII karakter icerir - cmd kendi kod sayfasiyla ayristirir,
rem   Turkce harf koyarsan komutlar bozulur.)
rem ---------------------------------------------------------------------

title Yazdirilabilir kagitlar
cd /d "%~dp0"

if not exist "print\genkou-youshi-dikey.html" (
  echo.
  echo   Kagitlar henuz uretilmemis, uretiliyor...
  call npm run gen:genkou
)

echo.
echo   ================================
echo     YAZDIRILABILIR KAGITLAR
echo   ================================
echo.
echo   1 - Genkou youshi, DIKEY yazi   (A4 yatay, 400 kare, 8.8 mm)
echo   2 - Genkou youshi, YATAY yazi   (A4 dikey, 400 kare, 8.8 mm)
echo   3 - Hiragana alistirma          (A4 dikey, 20 mm kare, ornekli)
echo   4 - Hepsini ac
echo.

set /p secim=  Secimin (1-4): 

if "%secim%"=="1" start "" "print\genkou-youshi-dikey.html"
if "%secim%"=="2" start "" "print\genkou-youshi-yatay.html"
if "%secim%"=="3" start "" "print\hiragana-pratik.html"
if "%secim%"=="4" (
  start "" "print\genkou-youshi-dikey.html"
  start "" "print\genkou-youshi-yatay.html"
  start "" "print\hiragana-pratik.html"
)

echo.
echo   Yazdirirken DIKKAT:
echo     Olcek         = %%100  ("Sayfaya sigdir" KAPALI olmali)
echo     Kenar bosluk  = Yok
echo     Arka plan grafikleri = ACIK  (soluk kilavuzlar basilsin diye)
echo.
echo   Yoksa kareler kucuk ciker ve olcu tutmaz.
echo.
pause
