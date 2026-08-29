@echo off
rem ---------------------------------------------------------------------
rem  Katakana canli duvar kagidi.
rem  Asil is wallpaper\launch-katakana.ps1 icinde; burasi sadece onu cagirir.
rem  (Yalnizca ASCII karakter icerir - cmd.exe kod sayfasi Turkce harfleri
rem   bozdugu icin bu dosyalarda Turkce yazilmaz.)
rem ---------------------------------------------------------------------

title Katakana duvar kagidi
cd /d "%~dp0"

echo.
echo   ================================
echo     KATAKANA DUVAR KAGIDI
echo   ================================
echo.
echo   Her harf 6-8 saniye kalir, rastgele gelir.
echo   Okunus, hiragana karsiligi, karisan cift uyarisi ve ornek
echo   kelime harfle AYNI ANDA gorunur. Ayar yoktur.
echo.
echo   ------------------------------------------------
echo     A  = Simdi ac (ikinci monitorde)
echo     B  = Bilgisayar acilisinda otomatik baslasin
echo     K  = Otomatik baslatmayi kaldir
echo     C  = Cik
echo   ------------------------------------------------
echo.

set /p secim=  Secimin:

if /i "%secim%"=="A" goto ac
if /i "%secim%"=="B" goto baslangic
if /i "%secim%"=="K" goto kaldir
goto son

:ac
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wallpaper\launch-katakana.ps1"
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)
echo.
echo   Tam ekran icin pencereyi secip F11'e bas.
echo   Bu pencereyi kapatabilirsin, duvar kagidi acik kalir.
echo   Kapatmak icin: duvar kagidi penceresini sec ve Alt+F4.
echo.
goto son

:baslangic
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wallpaper\launch-katakana.ps1" -Startup
echo.
goto son

:kaldir
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wallpaper\launch-katakana.ps1" -Uninstall
echo.
goto son

:son
echo.
pause
