import type { Level } from '../types'
import type { Outcome } from './Store'
import { yen } from './Store'
import { Package } from './Package'
import { TAX_FREE_MIN } from '../config'

export function score(level: Level, o: Outcome) {
  const found = level.targets.filter((t) => t.accepts.some((a) => o.basket.includes(a)))
  const good = new Set(level.targets.flatMap((t) => t.accepts))
  const wrong = o.basket.filter((id) => !good.has(id))
  const n = level.targets.length
  let stars = 0
  if (found.length === n && wrong.length === 0) stars = 3
  else if (found.length === n || (found.length === n - 1 && wrong.length === 0)) stars = 2
  else if (found.length >= Math.ceil(n / 2)) stars = 1
  return { found, wrong, stars }
}

const VERDICT = [
  'Hmm… może jutro jeszcze raz? 🫠',
  'Nieźle! Ale w walizce parę niespodzianek 😅',
  'Prawie idealnie! 👏',
  'PERFEKCJA! Mistrzyni japońskiej drogerii 🏆',
]

export function Results({ level, outcome, newWords, ending, onRetry, onMap }: {
  level: Level
  outcome: Outcome
  newWords: number
  ending?: string[]
  onRetry: () => void
  onMap: () => void
}) {
  const byId = Object.fromEntries(level.products.map((p) => [p.id, p]))
  const { found, wrong, stars } = score(level, outcome)
  const spent = outcome.basket.reduce((s, id) => s + byId[id].price, 0)
  const taxFree = spent >= TAX_FREE_MIN
  const now = new Date()

  // do którego celu „pasuje” zły produkt – żeby pokazać wyjaśnienie obok screena
  const wrongFor = (id: string) => level.targets.find((t) =>
    t.accepts.some((a) => level.aisles.some((ai) => ai.shelves.some((s) => s.includes(a) && s.includes(id)))))

  return (
    <div className={`results theme-${level.theme}`}>
      <div className="receipt">
        <div className="r-store">{level.storeJp}</div>
        <div className="r-sub">{level.city} · {level.romaji}店</div>
        <div className="r-date">{now.toLocaleDateString('ja-JP')} {level.clockEnd / 60 - 1}:4{outcome.basket.length}</div>
        <div className="r-line" />
        {outcome.basket.length === 0 && <div className="r-item"><span>（なし）</span><span>¥0</span></div>}
        {outcome.basket.map((id) => (
          <div key={id} className="r-item"><span>{byId[id].look.big}</span><span>{yen(byId[id].price)}</span></div>
        ))}
        <div className="r-line" />
        <div className="r-item total"><span>合計</span><span>{yen(spent)}</span></div>
        {taxFree && <div className="r-item"><span>免税 (tax-free) −10%</span><span>−{yen(Math.round(spent / 11))}</span></div>}
        <div className="r-thanks">ありがとうございました！</div>
        {outcome.timeUp && <div className="r-note">⏰ Sklep zamknięto, zanim skończyłaś!</div>}
      </div>

      <div className="stars" aria-label={`${stars} na 3 gwiazdki`}>
        {[0, 1, 2].map((i) => <span key={i} className={i < stars ? 'on' : ''} style={{ animationDelay: `${i * 0.25}s` }}>★</span>)}
      </div>
      <h2 className="verdict">{VERDICT[stars]}</h2>
      <div className="summary">
        <span>✅ {found.length}/{level.targets.length} z listy</span>
        <span>🙈 {wrong.length} pomyłek</span>
        <span>📓 +{newWords} słówek</span>
        {taxFree && <span>🛂 tax-free!</span>}
      </div>

      <h3>Lista zakupów</h3>
      <ul className="checklist">
        {level.targets.map((t) => {
          const ok = found.includes(t)
          const product = byId[t.accepts[0]]
          return (
            <li key={t.id} className={ok ? 'ok' : 'miss'}>
              <img src={t.photo} alt="" />
              <Package look={product.look} size={0.62} />
              <div>
                <b>{ok ? '✅' : '❌'} „{t.note}”</b>
                <p>{t.reveal}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {wrong.length > 0 && <>
        <h3>A to, co wpadło do koszyka przez pomyłkę…</h3>
        <ul className="checklist">
          {wrong.map((id) => {
            const t = wrongFor(id)
            return (
              <li key={id} className="wrong">
                {t ? <img src={t.photo} alt="" /> : <span className="noimg">🤷‍♀️</span>}
                <Package look={byId[id].look} size={0.62} />
                <div>
                  <b>🙈 {byId[id].look.big} · {yen(byId[id].price)}</b>
                  <p>{byId[id].why}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </>}

      {ending && stars > 0 && (
        <div className="ending">{ending.map((l, i) => <p key={i}>{l}</p>)}</div>
      )}

      <div className="intro-actions sticky">
        <button className="ghost" onClick={onRetry}>↻ Jeszcze raz</button>
        <button className="big" onClick={onMap}>Dalej 🚃</button>
      </div>
    </div>
  )
}
