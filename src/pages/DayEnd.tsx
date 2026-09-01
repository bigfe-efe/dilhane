import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { KanaGlyph } from '@/components/KanaGlyph'
import { kanaGroups } from '@/content/ja/kana'
import { wordsReadableWith } from '@/content/ja/kana-words'
import { kataWordsReadableWith } from '@/content/ja/katakana-words'
import { db, todayKey } from '@/db/db'
import { useSessions } from '@/db/hooks'
import type { KanaChar } from '@/types'

// Gün sonu — "bugün neyi çalıştım".
//
// NEDEN VAR:
// Ana sayfadaki günlük plan uygulamanın ÖNERİSİ. Ama insan her zaman ona
// uymuyor; bazı günler kendi kafasına göre birkaç satır çalışıyor. O emek
// hiçbir yere yazılmadığı için ertesi gün tekrarı da kurulamıyordu.
//
// Burası planın yerine geçmez, yanında durur. Gün sonunda ne çalıştığını
// işaretlersin; ertesi gün tam ondan bir test çıkar.
//
// NEDEN ERTESİ GÜN:
// Unutma eğrisinin ilk kritik aralığı yaklaşık 24 saattir. Aynı gün test
// etmek tekrar değil, aynı oturumun devamıdır — henüz unutmadığın şeyi
// hatırlıyor olman bir şey ölçmez.

interface Row {
  id: string
  title: string
  alfabe: 'hiragana' | 'katakana'
  chars: KanaChar[]
}

function buildRows(): Row[] {
  return (['hiragana', 'katakana'] as const).flatMap((a) =>
    kanaGroups(a).map((g) => ({ id: `${a}:${g.group}`, title: g.group, alfabe: a, chars: g.chars })),
  )
}

const ALFABE_TR = { hiragana: 'ひらがな', katakana: 'カタカナ' } as const

export default function DayEndPage() {
  const bugun = todayKey()
  const rows = useMemo(buildRows, [])
  const gecmis = useSessions(30)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [yuklendi, setYuklendi] = useState(false)
  const [msg, setMsg] = useState('')

  // Bugünün kaydı varsa üstüne yazılır — gün içinde birkaç kez gelip
  // ekleme yapabilmeli, her seferinde yeni kayıt açmamalı.
  useEffect(() => {
    let iptal = false
    void db.sessions.get(bugun).then((s) => {
      if (iptal) return
      if (s) {
        setSelected(new Set(s.chars))
        setNote(s.note ?? '')
      }
      setYuklendi(true)
    })
    return () => {
      iptal = true
    }
  }, [bugun])

  const toggleChar = (c: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(c)) n.delete(c)
      else n.add(c)
      return n
    })

  const toggleRow = (chars: KanaChar[]) =>
    setSelected((s) => {
      const n = new Set(s)
      const hepsi = chars.every((c) => n.has(c.char))
      for (const c of chars) {
        if (hepsi) n.delete(c.char)
        else n.add(c.char)
      }
      return n
    })

  // Kaç kelime çıkacağını ŞİMDİDEN göster: "yarın ne çıkacak" belirsiz
  // kalmasın, az çıkıyorsa bugün birkaç satır daha işaretlemeyi düşünsün.
  const kelimeSayisi = useMemo(() => {
    if (!selected.size) return 0
    return wordsReadableWith(selected).length + kataWordsReadableWith(selected).length
  }, [selected])

  const kaydet = async () => {
    if (!selected.size) return
    await db.sessions.put({
      day: bugun,
      chars: [...selected],
      note: note.trim() || undefined,
      at: Date.now(),
      // Yeniden kaydedince test durumu SIFIRLANIR: içerik değiştiyse eski
      // test artık o günü temsil etmiyor.
      testedAt: undefined,
      testPercent: undefined,
    })
    setMsg('Kaydedildi. Yarın bu harflerden bir test çıkacak.')
    setTimeout(() => setMsg(''), 4000)
  }

  const temizle = () => {
    setSelected(new Set())
    setNote('')
  }

  const dun = gecmis.find((s) => s.day < bugun)

  return (
    <>
      <TopBar title="Gün sonu" sub="Bugün neyi çalıştın?" back="/calis" />

      <div className="page stack-lg lang-ja">
        <div className="card card--accent stack-sm">
          <div className="card-title">Plana uymadığın günler için</div>
          <div className="card-sub">
            Kendi kafana göre çalıştığın günlerde ne yaptığını buraya işaretle. Ertesi gün tam o
            harflerden bir test çıkar: karakterleri yazarsın, o harflerle yazılabilen kelimeler varsa
            onları da.
          </div>
          <div className="tiny faint" style={{ marginTop: 4 }}>
            Test bugün değil YARIN çıkar. Aynı gün test etmek tekrar sayılmaz — henüz unutmadığın
            şeyi hatırlaman bir şey ölçmez. Unutmanın başladığı ilk aralık yaklaşık 24 saattir.
          </div>
        </div>

        {dun && !dun.testedAt && (
          <Link to={`/gun-sonu-testi/${dun.day}`} className="card card--link">
            <div className="row">
              <span className="entry-icon">
                <Icon name="spark" size={19} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">Bekleyen test: {tarihTR(dun.day)}</div>
                <div className="card-sub">{dun.chars.length} karakter · henüz test edilmedi</div>
              </div>
              <Icon name="right" size={16} style={{ color: 'var(--faint)' }} />
            </div>
          </Link>
        )}

        {/* ————— Bugünün işaretlemesi ————— */}
        <div className="stack-sm">
          <div className="row">
            <h2 style={{ flex: 1 }}>{tarihTR(bugun)} · bugün çalıştıkların</h2>
            {selected.size > 0 && (
              <button className="btn btn--sm btn--ghost" onClick={temizle}>
                Temizle
              </button>
            )}
          </div>

          <div className="card stack-sm">
            <div className="row">
              <span className="dayend-count tabular">{selected.size}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-sub">karakter işaretli</div>
                <div className="tiny faint">
                  {selected.size === 0
                    ? 'Aşağıdan satırlara ya da tek tek harflere dokun'
                    : kelimeSayisi > 0
                      ? `Bu harflerle yazılabilen ${kelimeSayisi} kelime var — teste girecekler`
                      : 'Bu harflerle yazılabilen kelime yok; test yalnızca karakterlerden oluşacak'}
                </div>
              </div>
            </div>

            <input
              className="dayend-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not (isteğe bağlı) — örn. Genki 1. ders, çizgi sırası çalıştım"
              maxLength={120}
            />

            <button
              className="btn btn--primary btn--block"
              onClick={() => void kaydet()}
              disabled={!selected.size || !yuklendi}
            >
              Günü kaydet
            </button>
            {msg && <div className="feedback feedback--ok tiny">{msg}</div>}
          </div>
        </div>

        {/* ————— Satırlar ————— */}
        <div className="stack-sm">
          <h2>Satırlar</h2>
          <div className="cols-2">
            {rows.map((g) => {
              const hepsi = g.chars.every((c) => selected.has(c.char))
              const bazi = g.chars.some((c) => selected.has(c.char))
              const kac = g.chars.filter((c) => selected.has(c.char)).length
              return (
                <div key={g.id} className={`card stack-sm quiz-group${bazi ? ' is-active' : ''}`}>
                  <div className="row">
                    <button className="quiz-group-title ja" onClick={() => toggleRow(g.chars)}>
                      <Icon name={hepsi ? 'squareCheck' : bazi ? 'squareHalf' : 'square'} size={16} />
                      {g.title}
                    </button>
                    <span className="badge tiny ja">{ALFABE_TR[g.alfabe]}</span>
                    <div className="spacer" />
                    <span className="tiny faint tabular">
                      {kac} / {g.chars.length}
                    </span>
                  </div>
                  <div className="quiz-chars">
                    {g.chars.map((c) => (
                      <button
                        key={c.char}
                        className={`quiz-char${selected.has(c.char) ? ' is-on' : ''}`}
                        onClick={() => toggleChar(c.char)}
                      >
                        <span className="c">
                          <KanaGlyph char={c.char} size="1.5rem" />
                        </span>
                        <span className="r">{c.romaji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ————— Geçmiş ————— */}
        {gecmis.length > 0 && (
          <div className="stack-sm">
            <h2>Geçmiş günler</h2>
            <div className="cols-2">
              {gecmis.map((s) => (
                <div key={s.day} className="card stack-sm">
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: '0.95rem' }}>
                        {tarihTR(s.day)}
                        {/* Rozet inline-block; metne yapışmasın diye boşluk
                            karakteri değil kenar boşluğu gerekiyor. */}
                        {s.day === bugun && (
                          <span className="badge tiny" style={{ marginLeft: 8 }}>
                            bugün
                          </span>
                        )}
                      </div>
                      <div className="card-sub">{s.chars.length} karakter</div>
                    </div>
                    {s.testedAt ? (
                      <span className="badge tiny badge--ok">%{Math.round(s.testPercent ?? 0)}</span>
                    ) : s.day < bugun ? (
                      <span className="badge tiny badge--warn">test bekliyor</span>
                    ) : (
                      <span className="tiny faint">yarın</span>
                    )}
                  </div>

                  {s.note && <div className="tiny dim">{s.note}</div>}

                  <div className="dayend-chars ja">
                    {s.chars.slice(0, 24).join(' ')}
                    {s.chars.length > 24 && <span className="faint"> +{s.chars.length - 24}</span>}
                  </div>

                  {s.day < bugun && (
                    <Link to={`/gun-sonu-testi/${s.day}`} className="btn btn--sm btn--ghost">
                      {s.testedAt ? 'Tekrar test et' : 'Testi yap'}
                      <Icon name="right" size={14} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/** 2026-08-30 → "30 Ağustos Pazar" */
export function tarihTR(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
}
