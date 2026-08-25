@echo off
rem ---------------------------------------------------------------------
rem  Masaustune "Dilhane" kisayolu koyar. Bir kez calistirmak yeterli.
rem  (Yalnizca ASCII karakter icerir - bkz. Dilhane.bat icindeki not.)
rem ---------------------------------------------------------------------

title Dilhane kisayolu
cd /d "%~dp0"

echo.
echo   Masaustune kisayol olusturuluyor...
echo.

rem OneDrive ile yedeklenen masaustunu de dogru bulmasi icin
rem Windows'un kendi "Desktop" klasor yolunu PowerShell'den soruyoruz.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desk=[Environment]::GetFolderPath('Desktop');" ^
  "$lnk=Join-Path $desk 'Dilhane.lnk';" ^
  "$w=New-Object -ComObject WScript.Shell;" ^
  "$s=$w.CreateShortcut($lnk);" ^
  "$s.TargetPath=Join-Path $PWD 'Dilhane.bat';" ^
  "$s.WorkingDirectory=$PWD.Path;" ^
  "$s.IconLocation='%SystemRoot%\system32\SHELL32.dll,220';" ^
  "$s.Description='Dilhane - Japonca calisma uygulamasi';" ^
  "$s.Save();" ^
  "Write-Host ('  Olusturuldu: ' + $lnk)"

if errorlevel 1 (
  echo.
  echo   HATA: Kisayol olusturulamadi.
  echo   Dilhane.bat dosyasina sag tiklayip "Kisayol olustur" diyebilirsin.
) else (
  echo.
  echo   Hazir. Artik masaustundeki Dilhane simgesine cift tiklaman yeterli.
)

echo.
pause
