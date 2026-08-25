import type { ReactNode } from 'react'

// Ders metinleri için minik Markdown çözümleyici.
// Desteklenen: **kalın**, *eğik*, `kod`, başlık (###), liste (-), tablo (|), boş satır.
// Harici bağımlılık istemediğimiz için tam bir Markdown motoru yerine bu yeterli.

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  // Kalın, eğik ve kodu tek geçişte yakala
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyPrefix}-i${i++}`
    if (tok.startsWith('**')) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) out.push(<code key={key}>{tok.slice(1, -1)}</code>)
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())
}

const isSeparator = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-')

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let list: string[] = []
  let key = 0

  const flushList = () => {
    if (!list.length) return
    const items = list
    list = []
    blocks.push(
      <ul key={`ul${key++}`}>
        {items.map((it, i) => (
          <li key={i}>{inline(it, `l${key}-${i}`)}</li>
        ))}
      </ul>,
    )
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    // Tablo: başlık satırı + ayraç satırı
    if (trimmed.startsWith('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      flushList()
      const head = splitRow(trimmed)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]))
        i++
      }
      i--
      blocks.push(
        <div className="tbl-wrap" key={`t${key++}`}>
          <table>
            <thead>
              <tr>
                {head.map((h, hi) => (
                  <th key={hi}>{inline(h, `th${hi}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci}>{inline(c, `td${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (trimmed.startsWith('- ')) {
      list.push(trimmed.slice(2))
      continue
    }

    if (trimmed.startsWith('#')) {
      flushList()
      const level = trimmed.match(/^#+/)![0].length
      const content = trimmed.replace(/^#+\s*/, '')
      blocks.push(<h4 key={`h${key++}`} style={{ fontSize: level <= 2 ? '1.05rem' : '0.98rem' }}>{inline(content, `h${key}`)}</h4>)
      continue
    }

    flushList()
    blocks.push(<p key={`p${key++}`}>{inline(trimmed, `p${key}`)}</p>)
  }
  flushList()

  return <div className="prose">{blocks}</div>
}
