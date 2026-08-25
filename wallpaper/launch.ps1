# Hiragana duvar kagidini ikinci monitorde acar.
#
# Neden ayri bir .ps1: ayni mantigi .bat icine gomunce PowerShell borusu (|)
# icin gereken ^| kacislari cmd'nin satir birlestirme karakteriyle carpisiyor
# ve komut bozuluyor. Ayri dosyada boyle bir sorun yok.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

$root = Split-Path $PSScriptRoot -Parent
$page = Join-Path $PSScriptRoot 'hiragana.html'
if (-not (Test-Path $page)) {
  Write-Host "  HATA: hiragana.html bulunamadi." -ForegroundColor Red
  Write-Host "  Once calistir:  npm run gen:wallpaper"
  exit 1
}

# ---------------------------------------------------------------------------
# Ayar sunucusu
#
# Sayfa dogrudan dosyadan (file://) acilinca tercihler yalnizca localStorage'a
# yazilabiliyor. Chrome bu yazmalari geciktirir; bilgisayar kapanirken surec
# sertce olduruldugu icin son ayarlar diske hic inmiyor ve her acilista her sey
# sifirlanmis oluyordu (profilde exit_type=Crashed goruluyor).
#
# Cozum: sayfayi minik bir yerel sunucudan servis etmek. Sunucu ayarlari
# wallpaper\prefs.json dosyasina aninda yazar, boylece kayip olmaz.
# Node yoksa file:// ile devam edilir - calisir ama kaliciligi garanti degil.
# ---------------------------------------------------------------------------
$port = 4319
$serverScript = Join-Path $root 'scripts\wallpaper-server.mjs'

function Test-Port($p) {
  try {
    $c = New-Object System.Net.Sockets.TcpClient
    $ok = $c.ConnectAsync('127.0.0.1', $p).Wait(400)
    $c.Close()
    return $ok
  } catch { return $false }
}

$serving = $false
if (Test-Path $serverScript) {
  if (Test-Port $port) {
    $serving = $true
    Write-Host "  Ayar sunucusu zaten calisiyor (port $port)."
  } elseif (Get-Command node -ErrorAction SilentlyContinue) {
    # Gizli pencerede baslat; konsol acilmasin.
    #
    # DIKKAT: -ArgumentList ogeleri bosluktan bolunerek gecirilir. Proje yolu
    # "Masaustu\Dil Ogrenme" gibi bosluk iceriyor, o yuzden buraya MUTLAK yol
    # yazilirsa node yalnizca ilk parcayi gorup "Cannot find module ...\Dil"
    # diye oluyor. Calisma klasorunu verip GORECELI yol geciyoruz - iceride
    # bosluk yok, sorun da yok.
    Start-Process -FilePath 'node' -ArgumentList @('scripts\wallpaper-server.mjs') -WorkingDirectory $root -WindowStyle Hidden | Out-Null
    for ($i = 0; $i -lt 25; $i++) {
      if (Test-Port $port) { $serving = $true; break }
      Start-Sleep -Milliseconds 200
    }
    if ($serving) {
      Write-Host "  Ayar sunucusu baslatildi (port $port) - tercihler prefs.json'a yazilacak."
    } else {
      Write-Host "  UYARI: ayar sunucusu baslamadi, dosyadan acilacak." -ForegroundColor Yellow
    }
  } else {
    Write-Host "  UYARI: node bulunamadi. Tercihler kalici olmayabilir." -ForegroundColor Yellow
  }
}

# Birincil olmayan ilk ekrani bul. Ikinci monitor solda da olabilir sagda da,
# o yuzden konum sabit yazilmaz - Windows'a soruluyor.
$screen = [System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Select-Object -First 1
if (-not $screen) {
  $screen = [System.Windows.Forms.Screen]::PrimaryScreen
  Write-Host "  Ikinci monitor bulunamadi, birincil ekranda aciliyor."
} else {
  Write-Host ("  Ikinci monitor: {0}x{1} @ {2},{3}" -f $screen.Bounds.Width, $screen.Bounds.Height, $screen.Bounds.X, $screen.Bounds.Y)
}
$b = $screen.Bounds

# Chrome tercih edilir, yoksa Edge
$candidates = @(
  (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
  (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
)
$exe = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $exe) {
  Write-Host "  HATA: Chrome veya Edge bulunamadi." -ForegroundColor Red
  exit 1
}

# --app: adres cubugu ve sekme yok, temiz bir pencere acilir.
if ($serving) {
  $url = "http://127.0.0.1:$port/"
} else {
  # Yol bosluk ve Turkce karakter iceriyor ("Dil Ogrenme", "Masaustu"), o yuzden
  # elle string birlestirmek yerine .NET'in URI kodlayicisi kullanilir: bosluk
  # %20, Turkce harfler UTF-8 yuzde kodlamasi olur ve Chrome dosyayi bulabilir.
  $url = ([System.Uri]$page).AbsoluteUri
}

# --user-data-dir SART: Chrome zaten aciksa yeni cagri komut satirini mevcut
# surece devrediyor ve --app dusuyor; pencere dogru yerde acilir ama icinde
# "Yeni Sekme" gorunur. Ayri bir profil klasoru verilince bagimsiz bir Chrome
# ornegi baslar ve --app calisir. Yan fayda: duvar kagidi penceresinde yer
# imleri, uzantilar ve oturumlar olmaz - temiz kalir.
$profile = Join-Path $env:LOCALAPPDATA 'DilhaneWallpaper'
if (-not (Test-Path $profile)) { New-Item -ItemType Directory -Path $profile -Force | Out-Null }

$argList = @(
  "--app=$url",
  "--user-data-dir=$profile",
  "--window-position=$($b.X),$($b.Y)",
  "--window-size=$($b.Width),$($b.Height)",
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-features=Translate',
  '--disable-session-crashed-bubble',
  '--hide-crash-restore-bubble'
)

if ($env:DILHANE_WP_DRYRUN -eq '1') {
  Write-Host "  [deneme] $exe"
  Write-Host "  [deneme] $($argList -join ' ')"
  exit 0
}

Start-Process -FilePath $exe -ArgumentList $argList
Write-Host ("  Acildi: " + (Split-Path $exe -Leaf))
