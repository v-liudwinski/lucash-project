import type { CSSProperties } from 'react'
import type { Book, EpisodeKind } from '../types'

export const kindLabel: Record<EpisodeKind, string> = {
  adventure: 'Пригода',
  love: 'Кохання',
  story: 'Вставна історія',
  enchant: 'Чари й містифікації',
  home: 'Удома',
  meeting: 'Зустріч',
  meta: 'Гра з читачем',
  comic: 'Кумедна пригода',
}

export const roman = (n: number) => ['I', 'II', 'III', 'IV'][n - 1] ?? String(n)

const ROMAN: [number, string][] = [
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function toRoman(n: number) {
  let out = ''
  for (const [v, s] of ROMAN) while (n >= v) (out += s), (n -= v)
  return out
}

export const chapterLabel = (chapters: string) => `розділ ${toRoman(Number(chapters))}`

interface Props {
  book: Book
  index: number
  counter: string
  hasPrev: boolean
  hasNext: boolean
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onClose: () => void
  onSelect: (index: number) => void
  onCharacter: (id: string) => void
}

export default function EpisodeCard(p: Props) {
  const { book, index } = p
  const ep = book.episodes[index]
  const journey = book.journeys.find((j) => j.id === ep.journey)!
  const place = book.places.find((pl) => pl.id === ep.place)!
  const chars = ep.characters.map((id) => book.characters.find((c) => c.id === id)!).filter(Boolean)
  const alsoHere = book.episodes
    .map((e, i) => ({ e, i }))
    .filter(({ e, i }) => e.place === ep.place && i !== index)

  return (
    <article
      className="floating-card episode-card"
      style={{ '--accent': journey.color } as CSSProperties}
      key={ep.id}
      aria-live="polite"
    >
      <button className="icon-btn episode-card__close" onClick={p.onClose} title="До загального вигляду (Esc)">
        ×
      </button>

      <div className="episode-card__scroll">
        <header className="episode-card__head">
          <span className="ep-num">{index + 1}</span>
          <div>
            <p className="eyebrow">
              Частина {roman(ep.part)} · {chapterLabel(ep.chapters)}
            </p>
            <h2 className="episode-card__title">{ep.title}</h2>
          </div>
        </header>

        <div className="episode-card__tags">
          <span className="tag tag--journey">{journey.title}</span>
          <span className="tag">{kindLabel[ep.kind]}</span>
        </div>

        <p className="episode-card__place">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          <span>
            <b>{place.name}</b>
            {place.approximate && <em> · місце умовне</em>}
            {place.note && <small>{place.note}</small>}
          </span>
        </p>

        <p className="episode-card__summary">{ep.summary}</p>

        {ep.highlights && (
          <ul className="episode-card__highlights">
            {ep.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}

        {chars.length > 0 && (
          <div className="episode-card__section">
            <h3>Персонажі</h3>
            <div className="chips">
              {chars.map((c) => (
                <button key={c.id} className="chip" onClick={() => p.onCharacter(c.id)} title={`Усі епізоди: ${c.name}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {alsoHere.length > 0 && (
          <div className="episode-card__section">
            <h3>Також у цьому місці</h3>
            <div className="also-here">
              {alsoHere.map(({ e, i }) => (
                <button key={e.id} onClick={() => p.onSelect(i)}>
                  <span>{i + 1}</span> {e.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="episode-card__nav">
        <button className="icon-btn" onClick={p.onPrev} disabled={!p.hasPrev} title="Попередній (←)">
          ←
        </button>
        <button className="btn btn--play" onClick={p.onTogglePlay} title="Автоматична подорож (пробіл)">
          {p.playing ? '❚❚ Пауза' : '▶ Подорож'}
        </button>
        <button className="icon-btn" onClick={p.onNext} disabled={!p.hasNext} title="Наступний (→)">
          →
        </button>
        <span className="episode-card__counter">
          {p.counter}
        </span>
      </footer>
      {p.playing && <div className="play-progress" key={`pp-${index}`} />}
    </article>
  )
}
