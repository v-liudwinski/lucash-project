import { Link } from 'react-router-dom'
import { books } from '../data/books'
import BookCover from '../components/BookCover'
import { plural } from '../plural'

export default function HomePage() {
  return (
    <div className="home">
      <header className="home__hero">
        <p className="eyebrow">Особиста бібліотека</p>
        <h1 className="home__title">Книжкові мапи</h1>
        <p className="home__lead">
          Інтерактивні мапи сюжетів прочитаних книжок — щоб легко пригадати, що, де й з ким відбувалося.
        </p>
        <div className="ornament" aria-hidden="true">
          <span />❦<span />
        </div>
      </header>

      <main className="shelf">
        {books.map((book) => (
          <Link key={book.slug} to={`/knyha/${book.slug}`} className="book-card">
            <BookCover book={book} />
            <div className="book-card__body">
              <p className="book-card__meta">
                {book.author} · {book.originalYears}
              </p>
              <h2 className="book-card__title">{book.title}</h2>
              <p className="book-card__translators">{book.translators}</p>
              <p className="book-card__desc">{book.description}</p>
              <ul className="book-card__stats">
                <li>
                  <b>{book.journeys.length}</b> {plural(book.journeys.length, 'маршрут', 'маршрути', 'маршрутів')}
                </li>
                <li>
                  <b>{book.chapterCount}</b> {plural(book.chapterCount, 'розділ', 'розділи', 'розділів')}
                </li>
                <li>
                  <b>{book.places.length}</b> {plural(book.places.length, 'місце', 'місця', 'місць')}
                </li>
                <li>
                  <b>{book.characters.length}</b> {plural(book.characters.length, 'персонаж', 'персонажі', 'персонажів')}
                </li>
              </ul>
              <span className="btn btn--primary">Відкрити мапу →</span>
            </div>
          </Link>
        ))}

        <div className="book-card book-card--ghost" aria-hidden="true">
          <div className="cover cover--ghost">
            <span>?</span>
          </div>
          <div className="book-card__body">
            <p className="book-card__meta">Незабаром</p>
            <h2 className="book-card__title">Наступна книжка</h2>
            <p className="book-card__desc">Полиця чекає на нову мандрівку.</p>
          </div>
        </div>
      </main>

      <footer className="home__footer">
        Мапи складено з любові до читання. Місця, які автори не називають, позначено умовно.
      </footer>
    </div>
  )
}
