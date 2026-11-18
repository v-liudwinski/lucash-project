import type { CSSProperties } from 'react'
import type { Book } from '../types'

function Windmill() {
  return (
    <svg viewBox="0 0 120 140" className="cover__emblem" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        {/* башта */}
        <path d="M46 132 L52 64 L68 64 L74 132 Z" />
        <path d="M50 64 Q60 52 70 64" />
        <path d="M56 132 L56 116 Q60 110 64 116 L64 132" />
        <circle cx="60" cy="88" r="3.2" />
        {/* крила */}
        <g transform="translate(60 60)">
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a + 28})`}>
              <path d="M0 0 L0 -50" />
              <path d="M3 -12 L14 -12 L14 -50 L3 -50 Z" />
              <path d="M3 -24 L14 -24 M3 -37 L14 -37 M8.5 -12 L8.5 -50" strokeWidth="1.1" />
            </g>
          ))}
          <circle r="3.5" fill="currentColor" />
        </g>
        {/* пагорб */}
        <path d="M6 134 Q60 120 114 134" />
      </g>
    </svg>
  )
}

export default function BookCover({ book, size = 'md' }: { book: Book; size?: 'md' | 'sm' }) {
  const style = {
    '--leather': book.cover.leather,
    '--gilt': book.cover.accent,
  } as CSSProperties

  return (
    <div className={`cover cover--${size}`} style={style}>
      <div className="cover__spine" />
      <div className="cover__frame">
        <span className="cover__author">{book.author}</span>
        <Windmill />
        <span className="cover__title">{book.shortTitle}</span>
        <span className="cover__sub">{book.cover.subtitle}</span>
      </div>
    </div>
  )
}
