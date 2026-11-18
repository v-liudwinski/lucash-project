import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { findBook } from '../data/books'
import PlotMap from '../components/PlotMap'
import EpisodeCard from '../components/EpisodeCard'
import Sidebar, { type Tab } from '../components/Sidebar'
import Compass from '../components/Compass'
import NotFound from './NotFound'
import type { Book } from '../types'
import { plural } from '../plural'

const PLAY_MS = 9000

export default function BookPage() {
  const { slug } = useParams()
  const book = findBook(slug)
  if (!book) return <NotFound />
  return <BookView book={book} />
}

function BookView({ book }: { book: Book }) {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('plot')
  const [journeyFilter, setJourneyFilter] = useState<number | null>(null)
  const [characterFilter, setCharacterFilter] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.title = `${book.shortTitle} — Книжкові мапи`
  }, [book])

  const activeId = params.get('e')
  const found = book.episodes.findIndex((e) => e.id === activeId)
  const activeIndex = found >= 0 ? found : null

  const select = useCallback(
    (index: number | null) => {
      setParams(index === null ? {} : { e: book.episodes[index].id }, { replace: true })
      setSidebarOpen(false)
    },
    [book, setParams],
  )

  const visibleList = useMemo(
    () =>
      book.episodes
        .map((e, i) => ({ e, i }))
        .filter(
          ({ e }) =>
            (journeyFilter === null || e.journey === journeyFilter) &&
            (characterFilter === null || e.characters.includes(characterFilter)),
        )
        .map(({ i }) => i),
    [book, journeyFilter, characterFilter],
  )
  const visible = useMemo(() => new Set(visibleList), [visibleList])
  const filtering = journeyFilter !== null || characterFilter !== null

  const prevIndex = activeIndex === null ? undefined : visibleList.findLast((i) => i < activeIndex)
  const nextIndex = activeIndex === null ? visibleList[0] : visibleList.find((i) => i > activeIndex)
  const position = activeIndex === null ? -1 : visibleList.indexOf(activeIndex)

  const go = useCallback(
    (dir: 1 | -1) => {
      const target = dir === 1 ? nextIndex : prevIndex
      if (target !== undefined) select(target)
      else if (dir === 1) setPlaying(false)
    },
    [nextIndex, prevIndex, select],
  )

  // Автоматична подорож
  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => go(1), activeIndex === null ? 300 : PLAY_MS)
    return () => window.clearTimeout(t)
  }, [playing, activeIndex, go])

  // Клавіатура
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).closest('input, textarea')) return
      if (ev.key === 'ArrowRight') go(1)
      else if (ev.key === 'ArrowLeft') go(-1)
      else if (ev.key === 'Escape') {
        setPlaying(false)
        select(null)
      } else if (ev.key === ' ' && !(ev.target as HTMLElement).closest('button')) {
        ev.preventDefault()
        setPlaying((v) => !v)
      } else return
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, select])

  const pickPlace = (placeId: string) => {
    const here = visibleList.filter((i) => book.episodes[i].place === placeId)
    const all = here.length ? here : book.episodes.map((_, i) => i).filter((i) => book.episodes[i].place === placeId)
    if (activeIndex !== null && book.episodes[activeIndex].place === placeId && all.length > 1) {
      const next = all.find((i) => i > activeIndex) ?? all[0]
      return select(next)
    }
    select(all.find((i) => activeIndex === null || i >= activeIndex) ?? all[0])
  }

  const chooseCharacter = (id: string | null) => {
    setCharacterFilter(id)
    setTab('plot')
    if (id) setSidebarOpen(true)
  }

  return (
    <div className="book-page">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Sidebar
          book={book}
          tab={tab}
          onTab={setTab}
          activeIndex={activeIndex}
          visible={visible}
          journeyFilter={journeyFilter}
          onJourney={setJourneyFilter}
          characterFilter={characterFilter}
          onCharacter={chooseCharacter}
          onSelect={select}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <section className="map-area">
        <PlotMap
          book={book}
          activeIndex={activeIndex}
          visible={visible}
          filtering={filtering}
          journeyFilter={journeyFilter}
          onPickPlace={pickPlace}
        />
        <div className="map-vignette" aria-hidden="true" />

        <div className="cartouche">
          <span className="cartouche__small">Ламанча · Арагон · Каталонія</span>
          <span className="cartouche__title">{book.mapTitle}</span>
        </div>
        <Compass />

        <button className="map-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰ Епізоди
        </button>

        {activeIndex !== null ? (
          <EpisodeCard
            book={book}
            index={activeIndex}
            counter={position >= 0 ? `${position + 1} / ${visibleList.length}` : `${activeIndex + 1} / ${book.episodes.length}`}
            hasPrev={prevIndex !== undefined}
            hasNext={nextIndex !== undefined}
            playing={playing}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
            onTogglePlay={() => setPlaying((v) => !v)}
            onClose={() => {
              setPlaying(false)
              select(null)
            }}
            onSelect={select}
            onCharacter={chooseCharacter}
          />
        ) : (
          <IntroCard
            book={book}
            onStart={() => {
              select(visibleList[0] ?? 0)
            }}
            onPlay={() => setPlaying(true)}
            onJourney={(id) => {
              setJourneyFilter(id)
              const first = book.episodes.findIndex((e) => e.journey === id)
              select(first)
            }}
          />
        )}
      </section>
    </div>
  )
}

function IntroCard({
  book,
  onStart,
  onPlay,
  onJourney,
}: {
  book: Book
  onStart: () => void
  onPlay: () => void
  onJourney: (id: number) => void
}) {
  return (
    <article className="floating-card intro-card">
      <div className="episode-card__scroll">
        <p className="eyebrow">{book.originalYears}</p>
        <h2 className="intro-card__title">{book.title}</h2>
        <p className="intro-card__tagline">{book.tagline}</p>
        <p className="intro-card__text">{book.description}</p>

        <ul className="intro-card__stats">
          <li>
            <b>{book.chapterCount}</b>
            {plural(book.chapterCount, 'розділ', 'розділи', 'розділів')}
          </li>
          <li>
            <b>{book.characters.length}</b>
            {plural(book.characters.length, 'персонаж', 'персонажі', 'персонажів')}
          </li>
          <li>
            <b>{book.places.length}</b>
            {plural(book.places.length, 'місце', 'місця', 'місць')}
          </li>
        </ul>

        <h3 className="intro-card__h">Маршрути</h3>
        <ul className="legend">
          {book.journeys.map((j) => (
            <li key={j.id}>
              <button onClick={() => onJourney(j.id)} style={{ '--c': j.color } as CSSProperties}>
                <i />
                <span>
                  <b>{j.title}</b>
                  <small>{j.subtitle}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="intro-card__hint">
          Натискайте на точки мапи або епізоди в списку. Клавіші ← → гортають сюжет, пробіл — автоматична подорож.
        </p>
      </div>
      <footer className="episode-card__nav">
        <button className="btn btn--primary" onClick={onStart}>
          Почати з першого розділу
        </button>
        <button className="btn btn--play" onClick={onPlay}>
          {'▶︎ Подорож'}
        </button>
      </footer>
    </article>
  )
}
