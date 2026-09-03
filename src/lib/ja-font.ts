/**
 * Japonca yazı tipi tercihi.
 *
 * PROBLEM: Baskı yazı tipleriyle el yazısı harf biçimleri bazı kanalarda
 * gerçekten farklıdır — uydurma bir incelik değil, iki ayrı gelenektir.
 * En belirginleri:
 *
 *   き  baskıda alt kanca inen çizgiye BİTİŞİK, el yazısında AYRI
 *   さ  aynı fark
 *   ふ  baskıda akışkan tek parça gibi, el yazısında dört ayrı çizgi
 *   り  baskıda çoğu zaman birleşik, el yazısında iki ayrı çizgi
 *
 * Öğrenci き'yi kâğıda dört çizgiyle yazmayı öğrenip ekranda bitişik hâlini
 * görünce "yanlış mı yazıyorum" diye takılıyor. İkisi de doğru; biri yazı
 * tipi tasarımı, diğeri el hareketi.
 *
 * ÇÖZÜM: Varsayılan olarak 教科書体 (kyōkasho-tai — Japon okul kitaplarının
 * yazı tipi) kullanılır, çünkü el yazısıyla birebir örtüşen biçim odur.
 * Ayarlardan ゴシック体'e geçilebilir: JLPT kâğıtları, web siteleri ve
 * gerçek metinler onunla dizilir, o biçime de alışmak gerekir.
 *
 * Tercih localStorage'da tutulur — TTS sesi ve konuşma hızı gibi, cihaza
 * özgü bir arayüz ayarıdır, ilerleme verisi değil. Uygulama açılırken
 * SENKRON okunur; Dexie'den okunsaydı ilk çizimde yanlış yazı tipi görünüp
 * sonra zıplardı.
 */
export type JaFont = 'kyokasho' | 'gothic'

const KEY = 'ja.font'

export function getJaFont(): JaFont {
  try {
    return localStorage.getItem(KEY) === 'gothic' ? 'gothic' : 'kyokasho'
  } catch {
    // Gizli sekme / depolama kapalı — varsayılana düş
    return 'kyokasho'
  }
}

/** Seçimi köke yazar; CSS `:root[data-ja-font]` üzerinden yığını değiştirir. */
export function applyJaFont(font: JaFont = getJaFont()): void {
  document.documentElement.dataset.jaFont = font
}

export function setJaFont(font: JaFont): void {
  try {
    localStorage.setItem(KEY, font)
  } catch {
    // Yazılamazsa da en azından bu oturumda uygulansın
  }
  applyJaFont(font)
}

export const JA_FONT_TR: Record<JaFont, { ad: string; alt: string }> = {
  // Açıklamalarda KANA YOK: bu metinler kartın kendi yazı tipiyle değil
  // arayüz yazı tipiyle çiziliyor, dolayısıyla "birleşik" diyen cümlenin
  // içindeki harf ayrık çıkıp cümleyi yalanlıyordu. Farkı üstteki büyük
  // örnek gösteriyor, cümle sadece tarif ediyor.
  kyokasho: {
    ad: '教科書体 · Ders kitabı',
    alt: 'El yazısıyla aynı biçim — alt çizgiler ayrı. Yazdığının karşılığını ekranda görmek istiyorsan bunu seç.',
  },
  gothic: {
    ad: 'ゴシック体 · Baskı',
    alt: 'Web sitelerinde ve JLPT kâğıtlarında gördüğün biçim — çizgiler birleşik. Gerçek metinlere alışmak için.',
  },
}
