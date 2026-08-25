@echo off
rem ---------------------------------------------------------------------
rem  Hiragana duvar kagidini IKINCI MONITORDE acar.
rem  Asil is wallpaper\launch.ps1 icinde; burasi sadece onu cagirir.
rem  (Yalnizca ASCII karakter icerir - bkz. Dilhane.bat icindeki not.)
rem ---------------------------------------------------------------------

title Hiragana duvar kagidi
cd /d "%~dp0"

echo.
echo   ================================
echo     HIRAGANA DUVAR KAGIDI
echo   ================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wallpaper\launch.ps1"

if errorlevel 1 (
  echo.
  pause
  exit /b 1
)

echo.
echo   Pencerede:
echo     bosluk veya sag ok  = sonraki harf
echo     sol ok              = onceki harf
echo     A                   = ayar paneli (hangi satirlar, kac saniyede)
echo     F11                 = tam ekran
echo.
echo   Ekrana tiklamak harfi DEGISTIRMEZ - masaustunde calisirken
echo   yanlislikla atlamayasin diye kaldirildi.
echo.
echo   Ayarlarin wallpaper\prefs.json dosyasinda tutulur; bilgisayari
echo   yeniden baslatsan da kaybolmaz.
echo.
echo   Bu pencereyi kapatabilirsin, duvar kagidi acik kalir.
echo.
