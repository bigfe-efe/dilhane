# Kanji duvar kagidini ikinci monitorde acar.
#
# Katakana surumunun ikizi; tek fark hangi klasoru actigi. Ayar yok,
# dolayisiyla tercih sunucusu da yok: hiragana surumu ayarlari prefs.json'a
# yazmak icin node ile kucuk bir sunucu baslatiyordu, burada saklanacak bir
# tercih olmadigi icin dosya dogrudan file:// ile aciliyor. Node kurulu
# olmasa da calisir.
#
# Parametreler:
#   -Startup   : Windows acilisinda otomatik baslamasi icin kisayol olusturur
#   -Uninstall : O kisayolu siler
#   -Primary   : Ikinci monitor yerine birincil ekranda acar

param(
  [switch]$Startup,
  [switch]$Uninstall,
  [switch]$Primary
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

$page = Join-Path $PSScriptRoot 'kanji\index.html'

# ---------------------------------------------------------------------------
# Baslangica ekle / cikar
#
# Windows'un "Baslangic" klasorune bir kisayol koyuyoruz. Hicbir uygulama
# gerekmez; bilgisayar acilinca kisayol calisir, o da bu betigi cagirir.
# ---------------------------------------------------------------------------
$startupDir = [Environment]::GetFolderPath('Startup')
$lnk = Join-Path $startupDir 'Dilhane Kanji duvar kagidi.lnk'

if ($Uninstall) {
  if (Test-Path $lnk) {
    Remove-Item $lnk -Force
    Write-Host "  Baslangictan kaldirildi." -ForegroundColor Green
  } else {
    Write-Host "  Zaten baslangicta degildi."
  }
  exit 0
}

if ($Startup) {
  $ws = New-Object -ComObject WScript.Shell
  $sc = $ws.CreateShortcut($lnk)
  $sc.TargetPath = 'powershell.exe'
  # -WindowStyle Hidden: acilista konsol penceresi yanip sonmesin
  $sc.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PSCommandPath`""
  $sc.WorkingDirectory = $PSScriptRoot
  $sc.WindowStyle = 7
  $sc.Description = 'Dilhane N5 kanji canli duvar kagidi'
  $sc.Save()
  Write-Host "  Baslangica eklendi:" -ForegroundColor Green
  Write-Host "  $lnk"
  Write-Host ""
  Write-Host "  Bundan sonra bilgisayari her actiginda kendiliginden acilacak."
  Write-Host "  Kaldirmak icin ayni .bat dosyasini calistirip 'K' sec."
  exit 0
}

if (-not (Test-Path $page)) {
  Write-Host "  HATA: $page bulunamadi." -ForegroundColor Red
  Write-Host "  Once calistir:  npm run gen:kanji-wallpaper"
  exit 1
}

# ---------------------------------------------------------------------------
# Hangi ekran
#
# Ikinci monitor solda da olabilir sagda da; konum sabit yazilmaz, Windows'a
# soruluyor.
# ---------------------------------------------------------------------------
if ($Primary) {
  $screen = [System.Windows.Forms.Screen]::PrimaryScreen
} else {
  $screen = [System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Select-Object -First 1
  if (-not $screen) {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
    Write-Host "  Ikinci monitor bulunamadi, birincil ekranda aciliyor."
  }
}
$b = $screen.Bounds
Write-Host ("  Ekran: {0}x{1} @ {2},{3}" -f $b.Width, $b.Height, $b.X, $b.Y)

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

# Yol bosluk ve Turkce karakter iceriyor ("Masaustu\Dil Ogrenme"), elle string
# birlestirmek yerine .NET'in URI kodlayicisi kullaniliyor.
$url = ([System.Uri]$page).AbsoluteUri

# --user-data-dir SART: Chrome zaten aciksa yeni cagri komut satirini mevcut
# surece devrediyor ve --app dusuyor; pencere dogru yerde acilir ama icinde
# "Yeni Sekme" gorunur. Ayri profil klasoru bagimsiz bir Chrome ornegi baslatir.
# Diger duvar kagitlariyla ayni anda calisabilsin diye profil de ayri.
$profile = Join-Path $env:LOCALAPPDATA 'DilhaneWallpaperKanji'
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
