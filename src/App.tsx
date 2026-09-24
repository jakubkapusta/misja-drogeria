import { useEffect, useState } from 'react'
import { LEVELS, SOON } from './data/levels'
import { VOCAB } from './data/vocab'
import { Store, type Outcome } from './components/Store'
import { Results, score } from './components/Results'
import { Notebook } from './components/Notebook'
import { Package } from './components/Package'
import { clearSave, loadSave, writeSave, type Save } from './save'
import { ENDING, PLAYER } from './config'

type Screen =
  | { name: 'title' }
  | { name: 'map' }
  | { name: 'store'; level: number; run: number }
  | { name: 'results'; level: number; outcome: Outcome; newWords: number }

const unlockAll = new URLSearchParams(location.search).has('all')

export function App() {
  const [save, setSave] = useState<Save>(loadSave)
  const [screen, setScreen] = useState<Screen>({ name: 'title' })
  const [notes, setNotes] = useState(false)
  const [learnedAtStart, setLearnedAtStart] = useState(0)

  useEffect(() => writeSave(save), [save])
  useEffect(() => { window.scrollTo(0, 0) }, [screen.name])

  const learn = (words: string[]) => setSave((s) => {
    const add = words.filter((w) => VOCAB[w] && !s.learned.includes(w))
    return add.length ? { ...s, learned: [...s.learned, ...add] } : s
  })

  const play = (level: number) => {
    setLearnedAtStart(save.learned.length)
    setScreen({ name: 'store', level, run: Date.now() })
  }

  if (screen.name === 'store') {
    const level = LEVELS[screen.level]
    return <Store key={screen.run} level={level} learned={save.learned} onLearn={learn}
      onQuit={() => setScreen({ name: 'map' })}
      onFinish={(outcome) => {
        const { stars } = score(level, outcome)
        setSave((s) => ({ ...s, stars: { ...s.stars, [level.id]: Math.max(stars, s.stars[level.id] ?? 0) } }))
        setScreen({ name: 'results', level: screen.level, outcome, newWords: save.learned.length - learnedAtStart })
      }} />
  }

  if (screen.name === 'results') {
    const level = LEVELS[screen.level]
    const last = screen.level === LEVELS.length - 1
    return <Results level={level} outcome={screen.outcome} newWords={screen.newWords}
      ending={last ? ENDING : undefined}
      onRetry={() => play(screen.level)} onMap={() => setScreen({ name: 'map' })} />
  }

  if (screen.name === 'title') {
    return (
      <div className="title-screen">
        <div className="title-shelf">
          {LEVELS[0].products.slice(0, 5).map((p) => <Package key={p.id} look={p.look} size={0.9} />)}
        </div>
        <p className="title-jp">ミッション：ドラッグストア</p>
        <h1>Misja:<br />Drogeria</h1>
        <p className="title-for">specjalnie dla: {PLAYER} 💝</p>
        <div className="howto">
          <p>🛍️ Wchodzisz do japońskiej drogerii z listą screenów z Instagrama.</p>
          <p>🔍 Na półce stoi 5 prawie identycznych wersji każdej rzeczy. Tylko napisy się różnią.</p>
          <p>📷 Tłumacz w telefonie pomaga, ale zjada baterię.</p>
          <p>📓 Każdy skan dopisuje słówka do notesu. Z czasem czytasz etykiety sama!</p>
        </div>
        <button className="big" onClick={() => setScreen({ name: 'map' })}>Start 🚃</button>
      </div>
    )
  }

  // mapa: linia kolejowa z tabliczkami stacji
  const unlocked = (i: number) => unlockAll || i === 0 || LEVELS[i - 1].id in save.stars
  const totalStars = LEVELS.reduce((s, l) => s + (save.stars[l.id] ?? 0), 0)
  return (
    <div className="map-screen">
      <header className="map-head">
        <h1>Trasa zakupowa <span>🗾</span></h1>
        <div className="map-stats">
          <span>★ {totalStars}/{LEVELS.length * 3}</span>
          <button className="ghost small" onClick={() => setNotes(true)}>📓 {save.learned.length}</button>
        </div>
      </header>
      <ol className="line">
        {LEVELS.map((l, i) => {
          const open = unlocked(i)
          const st = save.stars[l.id]
          return (
            <li key={l.id} className={`stop ${open ? '' : 'locked'}`}>
              <span className="dot" />
              <button className="station" disabled={!open} onClick={() => play(i)}>
                <span className="st-kanji">{l.station}</span>
                <span className="st-romaji">{l.romaji}</span>
                <span className="st-store">{open ? `${l.store} · ${l.targets.length} rzeczy` : '🔒 najpierw poprzednia stacja'}</span>
                {st !== undefined && <span className="st-stars">{'★'.repeat(st)}{'☆'.repeat(3 - st)}</span>}
              </button>
            </li>
          )
        })}
        {SOON.map((s) => (
          <li key={s.station} className="stop soon">
            <span className="dot" />
            <div className="station">
              <span className="st-kanji">{s.station}</span>
              <span className="st-romaji">{s.romaji}</span>
              <span className="st-store">wkrótce…</span>
            </div>
          </li>
        ))}
      </ol>
      <button className="link" onClick={() => { if (confirm('Wyzerować postęp i notes?')) { clearSave(); setSave({ learned: [], stars: {} }) } }}>
        wyzeruj postęp
      </button>
      {notes && <div className="overlay" onClick={() => setNotes(false)}><Notebook learned={save.learned} onClose={() => setNotes(false)} /></div>}
    </div>
  )
}
