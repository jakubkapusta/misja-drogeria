import { useState } from 'react'
import { VOCAB } from '../data/vocab'

const SPLIT = /(\[[^\]]+\])/

export function wordsIn(lines: string[]): string[] {
  const out = new Set<string>()
  for (const l of lines) for (const part of l.split(SPLIT)) {
    if (part.startsWith('[')) out.add(part.slice(1, -1))
  }
  return [...out]
}

/**
 * Tekst z etykiety. Słówka, które Asia już zna (są w notesie), są podkreślone
 * i po kliknięciu pokazują znaczenie – bez zużywania baterii.
 */
export function JpText({ text, known }: { text: string; known: Set<string> }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <span className="jp">
      {text.split(SPLIT).map((part, i) => {
        if (!part.startsWith('[')) return <span key={i}>{part}</span>
        const w = part.slice(1, -1)
        if (!known.has(w) || !VOCAB[w]) return <span key={i}>{w}</span>
        const isOpen = open === `${i}`
        return (
          <button key={i} className={`word${isOpen ? ' open' : ''}`}
            onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : `${i}`) }}>
            {w}
            {isOpen && <span className="tip"><b>{VOCAB[w].r}</b> {VOCAB[w].pl}</span>}
          </button>
        )
      })}
    </span>
  )
}
