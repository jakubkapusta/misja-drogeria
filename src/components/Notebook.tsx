import { VOCAB } from '../data/vocab'

export function Notebook({ learned, fresh, onClose }: { learned: string[]; fresh?: Set<string>; onClose: () => void }) {
  const words = [...learned].reverse().filter((w) => VOCAB[w])
  const total = Object.keys(VOCAB).length
  return (
    <div className="sheet notebook" onClick={(e) => e.stopPropagation()}>
      <header className="sheet-head">
        <h2>📓 Notes <small>{words.length} / {total} słówek</small></h2>
        <button className="x" onClick={onClose} aria-label="Zamknij">✕</button>
      </header>
      {words.length === 0 ? (
        <p className="empty">
          Pusto! Każdy skan tłumaczem dopisuje tu nowe słówka.
          Potem te słowa będą <span className="word demo">podkreślone</span> na etykietach –
          klikasz i wiesz, co znaczą, bez zużywania baterii.
        </p>
      ) : (
        <>
          <p className="tip-line">💡 Kanciaste znaki (katakana, np. クリーム) to często angielskie słowa: <i>kurīmu</i> = cream.</p>
          <ul className="words">
            {words.map((w) => (
              <li key={w} className={fresh?.has(w) ? 'fresh' : ''}>
                <span className="w-jp">{w}</span>
                <span className="w-r">{VOCAB[w].r}{VOCAB[w].en && <em> ← {VOCAB[w].en}</em>}</span>
                <span className="w-pl">{VOCAB[w].pl}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
