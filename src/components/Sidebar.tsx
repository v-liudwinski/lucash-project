import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '../types'
import { chapterLabel, roman } from './EpisodeCard'

export type Tab = 'plot' | 'characters' | 'places'

interface Props {
  book: Book
  tab: Tab
  onTab: (t: Tab) => void
  activeIndex: number | null
  visible: Set<number>
  journeyFilter: number | null
  onJourney: (id: number | null) => void
  characterFilter: string | null
  onCharacter: (id: string | null) => void
  onSelect: (index: number) => void
  onClose: () => void
}

export default function Sidebar(p: Props) {
  const { book } = p
  const listRef = useRef<HTMLDivElement>(null)

  // Прокрутити список до активного епізоду
  useEffect(() => {
    if (p.tab !== 'plot' || p.activeIndex === null) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${p.activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [p.activeIndex, p.tab])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    book.episodes.forEach((e) => e.characters.forEach((c) => m.set(c, (m.get(c) ?? 0) + 1)))
    return m
  }, [book])

  const placeList = useMemo(() => {
    const seen = new Map<string, number[]>()
    book.episodes.forEach((e, i) => seen.set(e.place, [...(seen.get(e.place) ?? []), i]))
    return [...seen.entries()].map(([id, idx]) => ({ place: book.places.find((pl) => pl.id === id)!, idx }))
  }, [book])

  const character = book.characters.find((c) => c.id === p.characterFilter)
  const progress = p.activeIndex === null ? 0 : ((p.activeIndex + 1) / book.episodes.length) * 100

  return (
    <>
      <div className="sidebar__head">
        <div className="sidebar__toprow">
          <Link to="/" className="back-link">
            ← Полиця
          </Link>
          <button className="icon-btn sidebar__close" onClick={p.onClose} aria-label="Закрити">
            ×
          </button>
        </div>
        <h1 className="sidebar__title">{book.shortTitle}</h1>
        <p className="sidebar__author">{book.author}</p>
        <p className="sidebar__translators">{book.translators}</p>
        <div className="progress" title="Прогрес подорожі">
          <div className="progress__bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <nav className="tabs" role="tablist">
        {(
          [
            ['plot', 'Сюжет'],
            ['characters', 'Персонажі'],
            ['places', 'Місця'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={p.tab === id} className="tab" onClick={() => p.onTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar__body" ref={listRef}>
        {p.tab === 'plot' && (
          <>
            <div className="filters">
              <button className="filter" aria-pressed={p.journeyFilter === null} onClick={() => p.onJourney(null)}>
                Усі
              </button>
              {book.journeys.map((j) => (
                <button
                  key={j.id}
                  className="filter"
                  style={{ '--c': j.color } as CSSProperties}
                  aria-pressed={p.journeyFilter === j.id}
                  onClick={() => p.onJourney(p.journeyFilter === j.id ? null : j.id)}
                  title={j.subtitle}
                >
                  <i />
                  {j.title}
                </button>
              ))}
            </div>

            {character && (
              <div className="char-banner">
                <div>
                  <span className="eyebrow">Епізоди з персонажем</span>
                  <b>{character.name}</b>
                </div>
                <button className="icon-btn" onClick={() => p.onCharacter(null)} aria-label="Скинути фільтр">
                  ×
                </button>
              </div>
            )}

            {book.parts.map((part) => {
              const journeys = book.journeys.filter((j) => book.episodes.some((e) => e.part === part.id && e.journey === j.id))
              const anyVisible = book.episodes.some((e, i) => e.part === part.id && p.visible.has(i))
              if (!anyVisible) return null
              return (
                <section key={part.id} className="part">
                  <h2 className="part__title">
                    {part.title} <span>{part.year}</span>
                  </h2>
                  {journeys.map((j) => {
                    const items = book.episodes
                      .map((e, i) => ({ e, i }))
                      .filter(({ e, i }) => e.part === part.id && e.journey === j.id && p.visible.has(i))
                    if (!items.length) return null
                    return (
                      <div key={j.id} className="journey" style={{ '--c': j.color } as CSSProperties}>
                        <h3 className="journey__title">
                          {j.title}
                          <small>{j.subtitle}</small>
                        </h3>
                        <ol className="ep-list">
                          {items.map(({ e, i }) => (
                            <li key={e.id}>
                              <button
                                data-index={i}
                                className={[
                                  'ep-item',
                                  i === p.activeIndex && 'is-active',
                                  p.activeIndex !== null && i < p.activeIndex && 'is-past',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => p.onSelect(i)}
                              >
                                <span className="ep-item__num">{i + 1}</span>
                                <span className="ep-item__text">
                                  <span className="ep-item__title">{e.title}</span>
                                  <span className="ep-item__ch">
                                    {roman(e.part)}, {chapterLabel(e.chapters)}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )
                  })}
                </section>
              )
            })}
          </>
        )}

        {p.tab === 'characters' && (
          <ul className="char-list">
            {book.characters.map((c) => (
              <li key={c.id}>
                <button
                  className={`char-item ${p.characterFilter === c.id ? 'is-active' : ''}`}
                  onClick={() => {
                    p.onCharacter(c.id)
                    p.onTab('plot')
                  }}
                >
                  <span className="char-item__avatar">{c.name.replace(/^(Дон|Священик|Цирульник)\s+/, '')[0]}</span>
                  <span className="char-item__text">
                    <span className="char-item__name">{c.name}</span>
                    <span className="char-item__role">{c.role}</span>
                    <span className="char-item__desc">{c.description}</span>
                    <span className="char-item__count">епізодів: {counts.get(c.id) ?? 0} →</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {p.tab === 'places' && (
          <ul className="place-list">
            {placeList.map(({ place, idx }) => (
              <li key={place.id}>
                <button className="place-item" onClick={() => p.onSelect(idx[0])}>
                  <span className="place-item__name">
                    {place.name}
                    {place.approximate && <em> · умовно</em>}
                  </span>
                  {place.note && <span className="place-item__note">{place.note}</span>}
                  <span className="place-item__eps">
                    {idx.map((i) => (
                      <span
                        key={i}
                        style={{ '--c': book.journeys.find((j) => j.id === book.episodes[i].journey)!.color } as CSSProperties}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
