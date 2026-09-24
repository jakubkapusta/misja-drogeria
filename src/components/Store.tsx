import { useEffect, useMemo, useRef, useState } from 'react'
import type { Level, Product, Target } from '../types'
import { Package } from './Package'
import { JpText, wordsIn } from './Label'
import { Notebook } from './Notebook'
import { SCAN_COST, TAX_FREE_MIN } from '../config'

export interface Outcome {
  basket: string[]
  timeUp: boolean
  battery: number
  scans: number
}

type Modal =
  | { kind: 'product'; id: string }
  | { kind: 'list' }
  | { kind: 'photo'; target: Target }
  | { kind: 'notes' }
  | { kind: 'clerk' }
  | { kind: 'basket' }
  | null

export const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

function clock(level: Level, elapsed: number) {
  const t = level.clockStart + (level.clockEnd - level.clockStart) * Math.min(1, elapsed / level.seconds)
  const h = Math.floor(t / 60) % 24, m = Math.floor(t % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export function Store({ level, learned, onLearn, onFinish, onQuit }: {
  level: Level
  learned: string[]
  onLearn: (words: string[]) => void
  onFinish: (o: Outcome) => void
  onQuit: () => void
}) {
  const byId = useMemo(() => Object.fromEntries(level.products.map((p) => [p.id, p])), [level])
  const known = useMemo(() => new Set(learned), [learned])

  const [started, setStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [battery, setBattery] = useState(level.battery)
  const [basket, setBasket] = useState<string[]>([])
  const [scanned, setScanned] = useState<Set<string>>(new Set())
  const [aisle, setAisle] = useState(0)
  const [modal, setModal] = useState<Modal>(null)
  const [hints, setHints] = useState(level.hints)
  const [hinted, setHinted] = useState<{ aisle: number; shelf: number } | null>(null)
  const [toasts, setToasts] = useState<{ id: number; text: string; who?: 'clerk' }[]>([])
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const finished = useRef(false)
  const warned = useRef(false)
  const closing = useRef(false)

  const spent = basket.reduce((s, id) => s + byId[id].price, 0)
  const wallet = level.budget - spent
  const left = level.seconds - elapsed

  const toast = (text: string, who?: 'clerk', ms = 3200) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, text, who }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms)
  }

  const finish = (timeUp: boolean) => {
    if (finished.current) return
    finished.current = true
    onFinish({ basket, timeUp, battery, scans: scanned.size })
  }

  useEffect(() => {
    if (!started) return
    toast(level.greeting, 'clerk', 2800)
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  useEffect(() => {
    if (!started) return
    if (left === 60 && !warned.current) {
      warned.current = true
      toast('🎵 W głośnikach leci 蛍の光 – sklep zaraz zamykają!', undefined, 4500)
    }
    if (left <= 0 && !closing.current) {
      closing.current = true
      toast('閉店です！ Zamykamy!', 'clerk')
      setModal(null)
      setTimeout(() => finish(true), 1200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, started])

  const scan = (p: Product) => {
    if (scanned.has(p.id) || battery < SCAN_COST) return
    setBattery((b) => b - SCAN_COST)
    setScanned((s) => new Set(s).add(p.id))
    const words = wordsIn(p.label)
    const newOnes = words.filter((w) => !known.has(w))
    setFresh((f) => { const n = new Set(f); newOnes.forEach((w) => n.add(w)); return n })
    onLearn(words)
    if (battery - SCAN_COST < SCAN_COST) toast('🪫 Bateria na wykończeniu!')
  }

  const toggleBasket = (p: Product) => {
    if (basket.includes(p.id)) {
      setBasket((b) => b.filter((x) => x !== p.id))
    } else if (p.price > wallet) {
      toast('💸 Nie starczy jenów w portfelu!')
    } else {
      setBasket((b) => [...b, p.id])
      toast(`🧺 Do koszyka: ${p.look.big}`, undefined, 1800)
    }
  }

  const askClerk = (t: Target) => {
    if (hints <= 0) return
    const target = t.accepts[0]
    level.aisles.forEach((a, ai) => a.shelves.forEach((s, si) => {
      if (s.includes(target)) {
        setAisle(ai)
        setHinted({ aisle: ai, shelf: si })
        setTimeout(() => setHinted(null), 7000)
      }
    }))
    setHints((h) => h - 1)
    setModal(null)
    toast('こちらです！ (Tutaj, na tej półce!) 👉', 'clerk', 4000)
  }

  const cur = level.aisles[aisle]
  const lowTime = left <= 60

  return (
    <div className={`store theme-${level.theme}`}>
      <header className="hud">
        <div className="hud-store">
          <b>{level.storeJp}</b>
          <span>{level.store} · {level.city}</span>
        </div>
        <div className="hud-stats">
          <span className={`stat ${lowTime ? 'warn' : ''}`} title="Zamknięcie sklepu">⏰ {clock(level, elapsed)}</span>
          <span className={`stat ${battery < 20 ? 'warn' : ''}`} title="Bateria">{battery > 0 ? '🔋' : '🪫'} {battery}%</span>
          <span className="stat" title="Portfel">👛 {yen(wallet)}</span>
        </div>
      </header>

      <nav className="aisle-tabs">
        {level.aisles.map((a, i) => (
          <button key={i} className={i === aisle ? 'on' : ''} onClick={() => setAisle(i)}>
            <span className="num">{String.fromCharCode(65 + i)}</span>
            <JpText text={a.sign} known={known} />
          </button>
        ))}
      </nav>

      <main className="aisle">
        <div className="aisle-sign"><JpText text={cur.sign} known={known} /></div>
        {cur.shelves.map((shelf, si) => (
          <div key={`${aisle}-${si}`} className={`shelf ${hinted?.aisle === aisle && hinted.shelf === si ? 'hinted' : ''}`}>
            <div className="shelf-items">
              {shelf.map((id) => {
                const p = byId[id]
                const inBasket = basket.includes(id)
                return (
                  <button key={id} className={`item ${inBasket ? 'picked' : ''}`} onClick={() => setModal({ kind: 'product', id })}>
                    <Package look={p.look} />
                    <span className="tag">{yen(p.price)}<small>税込</small></span>
                    {inBasket && <span className="check">🧺</span>}
                  </button>
                )
              })}
            </div>
            <div className="shelf-board" />
          </div>
        ))}
      </main>

      <footer className="dock">
        <button onClick={() => setModal({ kind: 'list' })}><span>📋</span>Lista</button>
        <button onClick={() => setModal({ kind: 'notes' })}><span>📓</span>Notes</button>
        <button onClick={() => setModal({ kind: 'clerk' })} disabled={hints <= 0}>
          <span>🙋‍♀️</span>Zapytaj{hints > 0 && <i className="pill">{hints}</i>}
        </button>
        <button className="pay" onClick={() => setModal({ kind: 'basket' })}>
          <span>🧺</span>Kasa{basket.length > 0 && <i className="pill">{basket.length}</i>}
        </button>
      </footer>

      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.who ?? ''}`}>{t.who === 'clerk' && <span className="clerk-face">👩‍💼</span>}{t.text}</div>)}
      </div>

      {!started && (
        <div className="overlay">
          <div className="sheet intro" onClick={(e) => e.stopPropagation()}>
            <div className="intro-station">{level.station}<small>{level.romaji}</small></div>
            <h2>{level.store}</h2>
            {level.intro.map((l, i) => <p key={i}>{l}</p>)}
            <div className="intro-stats">
              <span>👛 {yen(level.budget)}</span><span>🔋 {level.battery}%</span>
              <span>⏰ {Math.round(level.seconds / 60)} min</span><span>📋 {level.targets.length} rzeczy</span>
            </div>
            <div className="intro-actions">
              <button className="ghost" onClick={onQuit}>← Mapa</button>
              <button className="big" onClick={() => setStarted(true)}>Wchodzę! 🛍️</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          {modal.kind === 'product' && (
            <ProductSheet p={byId[modal.id]} level={level} known={known} scanned={scanned.has(modal.id)}
              battery={battery} inBasket={basket.includes(modal.id)} fresh={fresh}
              onScan={() => scan(byId[modal.id])} onToggle={() => toggleBasket(byId[modal.id])}
              onClose={() => setModal(null)} />
          )}
          {modal.kind === 'list' && (
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <header className="sheet-head">
                <h2>📋 Lista zakupów</h2>
                <button className="x" onClick={() => setModal(null)}>✕</button>
              </header>
              <p className="tip-line">Tak jak ją zapisałaś 😅 Kliknij screena, żeby go powiększyć.</p>
              <div className="targets">
                {level.targets.map((t) => (
                  <button key={t.id} className="target" onClick={() => setModal({ kind: 'photo', target: t })}>
                    <img src={t.photo} alt="" loading="lazy" />
                    <span>{t.note}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {modal.kind === 'photo' && (
            <div className="photo-view" onClick={() => setModal({ kind: 'list' })}>
              <img src={modal.target.photo} alt="" />
              <span className="photo-note">„{modal.target.note}” · kliknij, żeby wrócić</span>
            </div>
          )}
          {modal.kind === 'notes' && <Notebook learned={learned} fresh={fresh} onClose={() => setModal(null)} />}
          {modal.kind === 'clerk' && (
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <header className="sheet-head">
                <h2>🙋‍♀️ 店員さん <small>ekspedientka</small></h2>
                <button className="x" onClick={() => setModal(null)}>✕</button>
              </header>
              <p className="tip-line">Pokaż jej screena – wskaże półkę (ale nie konkretny produkt!). Zostało pytań: <b>{hints}</b></p>
              <div className="targets">
                {level.targets.map((t) => (
                  <button key={t.id} className="target" onClick={() => askClerk(t)}>
                    <img src={t.photo} alt="" loading="lazy" />
                    <span>{t.note}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {modal.kind === 'basket' && (
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <header className="sheet-head">
                <h2>🧺 Koszyk <small>かご</small></h2>
                <button className="x" onClick={() => setModal(null)}>✕</button>
              </header>
              {basket.length === 0 ? <p className="empty">Pusto. Nie wychodź z pustymi rękami!</p> : (
                <ul className="basket">
                  {basket.map((id) => (
                    <li key={id}>
                      <Package look={byId[id].look} size={0.5} />
                      <span className="b-name">{byId[id].look.big}<small>{byId[id].look.brand}</small></span>
                      <span className="b-price">{yen(byId[id].price)}</span>
                      <button className="ghost small" onClick={() => toggleBasket(byId[id])}>Odłóż</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="basket-total">
                <span>Razem · {basket.length} szt.</span><b>{yen(spent)}</b>
              </div>
              {spent >= TAX_FREE_MIN && <p className="taxfree">🛂 Powyżej {yen(TAX_FREE_MIN)} – przysługuje 免税 (tax-free)! Paszport w dłoń.</p>}
              <div className="intro-actions">
                <button className="ghost" onClick={() => setModal(null)}>Jeszcze szukam</button>
                <button className="big" disabled={basket.length === 0} onClick={() => finish(false)}>お会計 · Płacę</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductSheet({ p, level, known, scanned, battery, inBasket, fresh, onScan, onToggle, onClose }: {
  p: Product; level: Level; known: Set<string>; scanned: boolean; battery: number; inBasket: boolean
  fresh: Set<string>; onScan: () => void; onToggle: () => void; onClose: () => void
}) {
  const [compare, setCompare] = useState<Target | null>(null)
  const [scanning, setScanning] = useState(false)
  const newWords = wordsIn(p.label).filter((w) => fresh.has(w))

  const doScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); onScan() }, 750)
  }

  return (
    <div className="sheet product" onClick={(e) => e.stopPropagation()}>
      <header className="sheet-head">
        <h2>{p.look.brand ?? ''}</h2>
        <button className="x" onClick={onClose}>✕</button>
      </header>
      <div className={`product-view ${compare ? 'split' : ''}`}>
        {compare && <img className="cmp-photo" src={compare.photo} alt="" onClick={() => setCompare(null)} />}
        <div className={`pkg-wrap ${scanning ? 'scanning' : ''}`}>
          <Package look={p.look} size={compare ? 1.6 : 2.1} />
          {scanning && <div className="scanline" />}
        </div>
      </div>
      <div className="compare-strip">
        <span>Porównaj ze screenem:</span>
        {level.targets.map((t) => (
          <button key={t.id} className={compare?.id === t.id ? 'on' : ''} onClick={() => setCompare(compare?.id === t.id ? null : t)}>
            <img src={t.photo} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="label-box">
        {p.label.map((l, i) => <div key={i} className={i === 0 ? 'l-first' : ''}><JpText text={l} known={known} /></div>)}
        <div className="l-price">{yen(p.price)} <small>(税込)</small></div>
      </div>
      {scanned && (
        <div className="translation">
          <div className="t-head">📱 Tłumacz</div>
          <p>{p.tl}</p>
          {newWords.length > 0 && <div className="chips">📓 {newWords.map((w) => <span key={w}>{w}</span>)}</div>}
        </div>
      )}
      <div className="actions">
        {!scanned && (
          <button onClick={doScan} disabled={battery < SCAN_COST || scanning}>
            {battery < SCAN_COST ? '🪫 Bateria padła' : scanning ? '📷 Skanuję…' : `📷 Skanuj (−${SCAN_COST}% 🔋)`}
          </button>
        )}
        <button className={inBasket ? 'ghost' : 'big'} onClick={() => { onToggle(); onClose() }}>
          {inBasket ? '↩ Odłóż na półkę' : `🧺 Do koszyka · ${yen(p.price)}`}
        </button>
      </div>
    </div>
  )
}
