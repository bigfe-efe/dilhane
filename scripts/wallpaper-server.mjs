// Duvar kağıdı için minik yerel sunucu — bağımlılık yok, sadece node çekirdeği.
//
// NEDEN VAR:
// Sayfa doğrudan dosyadan (file://) açıldığında ayarlar yalnızca localStorage'a
// yazılabiliyor. Chrome localStorage yazmalarını toplu hâlde, gecikmeli olarak
// diske indirir; bilgisayar kapanırken süreç sertçe öldürüldüğü için o yazmalar
// hiç diske inmiyordu (profilde exit_type=Crashed görünüyor). Sonuç: her
// yeniden başlatmada tercihler sıfırlanıyordu.
//
// Bu sunucu sayfayı gerçek bir adresten (http://127.0.0.1:4319) servis eder ve
// ayarları wallpaper/prefs.json dosyasına ANINDA yazar. Bir onay kutusuna
// tıkladığın an ayar diskte olur; süreç ne şekilde sonlanırsa sonlansın kayıp
// olmaz.
//
// Sadece 127.0.0.1'e bağlanır — dışarıdan erişilemez.

import { createServer, request } from 'node:http'
import { readFile, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, normalize, extname } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', 'wallpaper')
const PREFS = join(ROOT, 'prefs.json')
const PORT = 4319
const HOST = '127.0.0.1'

// Kimse kullanmıyorsa boşuna bellek tutmasın: son istekten 10 dakika sonra kapanır.
const IDLE_MS = 10 * 60 * 1000
let lastHit = Date.now()

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
}

function readBody(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let n = 0
    const parts = []
    req.on('data', (c) => {
      n += c.length
      if (n > limit) {
        reject(new Error('gövde çok büyük'))
        req.destroy()
        return
      }
      parts.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')))
    req.on('error', reject)
  })
}

/** Yarım yazılmış dosya kalmasın diye önce geçici dosyaya yazıp yeniden adlandırıyoruz. */
async function writePrefs(text) {
  const tmp = PREFS + '.tmp'
  await writeFile(tmp, text, 'utf8')
  await rename(tmp, PREFS)
}

const server = createServer(async (req, res) => {
  lastHit = Date.now()

  // Sadece yerel istekler. (Sunucu zaten 127.0.0.1'e bağlı; bu ikinci bir kemer.)
  const ra = req.socket.remoteAddress ?? ''
  if (!ra.includes('127.0.0.1') && ra !== '::1') {
    res.writeHead(403).end('yerel değil')
    return
  }

  const url = new URL(req.url ?? '/', `http://${HOST}:${PORT}`)
  const path = url.pathname

  if (path === '/prefs') {
    if (req.method === 'GET') {
      try {
        const raw = await readFile(PREFS, 'utf8')
        JSON.parse(raw) // bozuksa aşağıdaki catch'e düşsün
        res.writeHead(200, { 'content-type': MIME['.json'], 'cache-control': 'no-store' }).end(raw)
      } catch {
        res.writeHead(200, { 'content-type': MIME['.json'], 'cache-control': 'no-store' }).end('{}')
      }
      return
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      try {
        const body = await readBody(req)
        const obj = JSON.parse(body) // geçerli JSON değilse yazmıyoruz
        await writePrefs(JSON.stringify(obj, null, 2) + '\n')
        res.writeHead(204).end()
      } catch (err) {
        res.writeHead(400).end(String(err instanceof Error ? err.message : err))
      }
      return
    }
    res.writeHead(405).end()
    return
  }

  if (path === '/alive') {
    res.writeHead(204, { 'cache-control': 'no-store' }).end()
    return
  }

  // Statik dosyalar — yalnızca wallpaper/ klasörünün içi.
  const rel = path === '/' ? 'hiragana.html' : decodeURIComponent(path).replace(/^\/+/, '')
  const file = normalize(join(ROOT, rel))
  if (!file.startsWith(normalize(ROOT))) {
    res.writeHead(403).end('dışarı çıkılamaz')
    return
  }
  try {
    const buf = await readFile(file)
    res
      .writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      })
      .end(buf)
  } catch {
    res.writeHead(404).end('bulunamadı')
  }
})

/** Portta gerçekten bizim gibi biri var mı? */
function alreadyServing() {
  return new Promise((resolve) => {
    const req = request({ host: HOST, port: PORT, path: '/alive', timeout: 500 }, (res) => {
      res.resume()
      resolve(res.statusCode === 204)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

// "Port dolu" her zaman "zaten çalışıyor" demek değil: süreç sertçe
// öldürüldükten hemen sonra port bir süre TIME_WAIT'te kalıyor ve bind
// başarısız oluyor. Bu durumda sessizce çekilirsek ortada dinleyen kimse
// kalmıyor ve duvar kağıdı ayarsız açılıyor — o yüzden önce gerçekten cevap
// veren biri var mı diye soruyor, yoksa birkaç kez tekrar deniyoruz.
let attempt = 0
server.on('error', async (err) => {
  if (err.code !== 'EADDRINUSE') {
    console.error(err)
    process.exit(1)
  }
  if (await alreadyServing()) {
    console.log(`Zaten çalışıyor: http://${HOST}:${PORT}`)
    process.exit(0)
  }
  if (++attempt > 6) {
    console.error(`Port ${PORT} dolu ama cevap veren yok. Vazgeçildi.`)
    process.exit(1)
  }
  console.log(`Port ${PORT} henüz serbest değil, yeniden deneniyor (${attempt}/6)…`)
  setTimeout(() => server.listen(PORT, HOST), 500)
})

server.listen(PORT, HOST, () => {
  console.log(`Duvar kağıdı sunucusu: http://${HOST}:${PORT}`)
  console.log(`Ayar dosyası: ${PREFS}`)
})

setInterval(() => {
  if (Date.now() - lastHit > IDLE_MS) {
    console.log('Uzun süredir istek yok, kapanıyor.')
    process.exit(0)
  }
}, 60_000).unref?.()
