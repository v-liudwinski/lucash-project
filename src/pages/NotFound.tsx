import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="notfound">
      <p className="eyebrow">404</p>
      <h1>Цієї сторінки немає на мапі</h1>
      <p>Схоже, чарівник Фрестон знову щось викрав.</p>
      <Link className="btn btn--primary" to="/">До книжкової полиці</Link>
    </main>
  )
}
