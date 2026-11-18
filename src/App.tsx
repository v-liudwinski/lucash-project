import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookPage from './pages/BookPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/knyha/:slug" element={<BookPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
